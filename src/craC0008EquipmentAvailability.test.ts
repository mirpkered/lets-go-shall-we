import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from './engine';
import { EMPTY_SAVE } from './storage';
import type { ItemCondition, SaveData, Scenario } from './types';
import { INVESTIGATION_EVIDENCE_GENRE_BATCH } from './scenarios/investigationEvidenceGenreBatch';
import { ROAD_DANGER_GENRE_BATCH } from './scenarios/roadDangerGenreBatch';

type InvestigationGate = { scenarioId: string; choiceId: string; gear: string };

const investigationGates: InvestigationGate[] = [
  { scenarioId: 'the-two-widths-at-morrow-road', choiceId: 'measure', gear: 'surveyChain' },
  { scenarioId: 'the-seal-with-the-second-notch', choiceId: 'measure', gear: 'assayersLoupe' },
  { scenarioId: 'the-gate-pin-at-south-pasture', choiceId: 'compare', gear: 'fieldCalipers' },
  { scenarioId: 'the-ledger-page-that-dried', choiceId: 'measure', gear: 'waterproofLedgerTube' },
  { scenarioId: 'the-rope-fibers-on-the-ferry-cleat', choiceId: 'compare', gear: 'heavyLeatherGloves' },
  { scenarioId: 'the-stone-under-the-floorboard', choiceId: 'measure', gear: 'collapsibleSoundingRod' },
  { scenarioId: 'the-boot-mark-in-the-ash', choiceId: 'measure', gear: 'joinersFoldingRule' },
  { scenarioId: 'the-two-seals-at-blackwater-dock', choiceId: 'compare', gear: 'waterproofLedgerTube' },
  { scenarioId: 'the-stone-chips-at-the-quarry', choiceId: 'measure', gear: 'fieldCalipers' },
  { scenarioId: 'the-stone-chips-at-the-quarry', choiceId: 'compare', gear: 'surveyChain' },
  { scenarioId: 'the-chalk-line-at-the-old-boundary', choiceId: 'compare', gear: 'surveyChain' },
  { scenarioId: 'the-notches-on-the-old-millstone', choiceId: 'measure', gear: 'assayersLoupe' },
];

function stateFor(scenario: Scenario, gear: string | undefined, condition: ItemCondition = 'NORMAL'): SaveData {
  const character = newCharacter('CRA-C0008 Test');
  const run = startRun(character, scenario, () => 0);
  run.inventory = gear ? [gear] : [];
  return {
    ...structuredClone(EMPTY_SAVE),
    character,
    run,
    itemStates: gear ? { [gear]: { condition, upgrades: [], provenance: [] } } : {},
  };
}

describe('CRA-C0008 equipment-specific action availability', () => {
  it.each(investigationGates)('$scenarioId.$choiceId requires carried usable $gear and preserves a no-Gear fallback', ({ scenarioId, choiceId, gear }) => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
    const choice = scenario.scenes.observe.choices.find(({ id }) => id === choiceId)!;
    expect(choice, `${scenarioId}.${choiceId}`).toBeTruthy();
    expect(choice.requirements?.items).toContain(gear);
    expect(choice.requirements?.usableItems).toContain(gear);

    const usable = stateFor(scenario, gear);
    expect(meets(choice.requirements, usable)).toBe(true);
    const used = choose(usable, scenario, choice);
    expect(used.run?.sceneId).toBe('test');
    expect(used.run?.flags).toContain(`${scenarioId}_${choiceId}`);

    for (const unavailable of [stateFor(scenario, undefined), stateFor(scenario, gear, 'BROKEN')]) {
      expect(meets(choice.requirements, unavailable)).toBe(false);
      const rejected = choose(unavailable, scenario, choice);
      expect(rejected.run?.sceneId).toBe('observe');
      expect(rejected.run?.flags).not.toContain(`${scenarioId}_${choiceId}`);
      const fallback = scenario.scenes.observe.choices.find(({ id }) => id === 'ask')!;
      expect(meets(fallback.requirements, rejected)).toBe(true);
      expect(choose(rejected, scenario, fallback).run?.sceneId).toBe('test');
    }
  });

  it('keeps each Stone Chips measurement independently available only with its own usable tool', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-stone-chips-at-the-quarry')!;
    for (const { choiceId, gear } of investigationGates.filter(({ scenarioId }) => scenarioId === scenario.id)) {
      const choice = scenario.scenes.observe.choices.find(({ id }) => id === choiceId)!;
      const state = stateFor(scenario, gear);
      expect(meets(choice.requirements, state), `${choiceId} with ${gear}`).toBe(true);
      const otherTool = gear === 'fieldCalipers' ? 'surveyChain' : 'fieldCalipers';
      expect(meets(choice.requirements, stateFor(scenario, otherTool)), `${choiceId} with only ${otherTool}`).toBe(false);
      expect(meets(choice.requirements, stateFor(scenario, gear, 'BROKEN')), `${choiceId} with broken ${gear}`).toBe(false);
    }
  });

  it('preserves existing gates on an unaffected caller of the investigation builder', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-switch-that-faced-east')!;
    const toolkitChoice = scenario.scenes.observe.choices.find(({ label }) => /Pocket Toolkit/i.test(label))!;
    expect(toolkitChoice.requirements?.items).toContain('pocketToolkit');
    expect(toolkitChoice.requirements?.usableItems).toContain('pocketToolkit');
    expect(meets(toolkitChoice.requirements, stateFor(scenario, 'pocketToolkit'))).toBe(true);
    expect(meets(toolkitChoice.requirements, stateFor(scenario, 'pocketToolkit', 'BROKEN'))).toBe(false);
    expect(meets(toolkitChoice.requirements, stateFor(scenario, undefined))).toBe(false);
    expect(scenario.scenes.observe.choices.some(({ id }) => id !== toolkitChoice.id && meets(undefined, stateFor(scenario, undefined)))).toBe(true);
  });

  it('requires a usable Freightman’s Strap for the trace-splicing ending while retaining reportTrace', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-punctured-tireless-wheel')!;
    const splice = scenario.scenes.aftermath.choices.find(({ id }) => id === 'ending_spliceTrace')!;
    const report = scenario.scenes.aftermath.choices.find(({ id }) => id === 'ending_reportTrace')!;
    expect(splice.requirements?.items).toContain('freightmansStrap');
    expect(splice.requirements?.usableItems).toContain('freightmansStrap');

    const reachAftermath = (state: SaveData) => {
      const approach = scenario.scenes.approach.choices.find(({ requirements }) => meets(requirements, state))!;
      state = choose(state, scenario, approach);
      const response = scenario.scenes.threat.choices.find(({ id }) => id === 'respond_askYoungRider')!;
      expect(meets(response.requirements, state)).toBe(true);
      return choose(state, scenario, response);
    };

    const usable = reachAftermath(stateFor(scenario, 'freightmansStrap'));
    expect(usable.run?.sceneId).toBe('aftermath');
    expect(meets(splice.requirements, usable)).toBe(true);
    expect(choose(usable, scenario, splice).run?.sceneId).toBe('settlement');

    for (const unavailable of [reachAftermath(stateFor(scenario, undefined)), reachAftermath(stateFor(scenario, 'freightmansStrap', 'BROKEN'))]) {
      expect(meets(splice.requirements, unavailable)).toBe(false);
      const rejected = choose(unavailable, scenario, splice);
      expect(rejected.run?.sceneId).toBe('aftermath');
      expect(meets(report.requirements, rejected)).toBe(true);
      expect(choose(rejected, scenario, report).run?.sceneId).toBe('settlement');
    }
  });
});
