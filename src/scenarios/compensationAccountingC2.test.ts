import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { getScenario } from './index';
import { HUSH_NOW } from './hushNow';

function stateAt(scenario: Scenario, sceneId: string, money = 10): SaveData {
  const character = newCharacter('Compensation QA');
  character.money = money;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  state.run!.sceneId = sceneId;
  return state;
}

function take(scenario: Scenario, sceneId: string, choiceId: string, money = 10): SaveData {
  const state = stateAt(scenario, sceneId, money);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId} exists`).toBeDefined();
  return choose(state, scenario, choice!, () => 0);
}

function scenario(id: string): Scenario {
  const found = getScenario(id);
  if (!found) throw new Error(`Missing scenario: ${id}`);
  return found;
}

describe('Pass C2 compensation accounting', () => {
  it('pays every A Notice Printed Backward paid ending once, without paying its demonstration route', () => {
    const notice = scenario('a-notice-printed-backward');
    for (const [scene, choice, ending] of [
      ['hand', 'postCorrection', 'clear'],
      ['hall', 'announcePlace', 'clear'],
      ['hall', 'waitForPrinter', 'late'],
    ] as const) {
      const result = take(notice, scene, choice);
      expect(result.character?.money).toBe(11);
      expect(result.run?.sceneId).toBe(ending);
    }
    expect(take(notice, 'type', 'finishType').character?.money).toBe(11);
    expect(take(notice, 'hand', 'showReversedSheet').character?.money).toBe(10);
  });

  it('settles Wire Down’s one-coin ride payment on both successful delivery outcomes only', () => {
    const wire = scenario('wire-down');
    expect(wire.scenes.carry.text).toMatch(/one coin/i);
    for (const choice of ['carry-deliver', 'carry-wait']) {
      expect(take(wire, 'carry', choice).character?.money).toBe(11);
    }
    expect(take(wire, 'crew', 'crew-find').character?.money).toBe(10);
  });

  it('pays the Sealed Crate’s four-coin fee on verified delivery and preserves other correct routes', () => {
    const crate = scenario('the-sealed-crate');
    const verified = take(crate, 'destination', 'destination-deliver');
    expect(verified.character?.money).toBe(14);
    expect(crate.scenes['destination-deliver'].text).toMatch(/four coins/i);
    expect(take(crate, 'destination', 'destination-hold').character?.money).toBe(10);
    expect(take(crate, 'terms', 'terms-carry').character?.money).toBe(14);
  });

  it('pays the Hobbled Gray’s one-coin search fee on both handler-resolved owner routes', () => {
    const gray = scenario('the-hobbled-gray');
    expect(take(gray, 'call', 'waitHandler').character?.money).toBe(11);
    expect(take(gray, 'mare', 'holdPosition').character?.money).toBe(11);
    const guided = take(gray, 'mare', 'guideHome');
    expect(guided.character?.money).toBe(10);
    expect(take(gray, 'returned', 'takeCoin').character?.money).toBe(11);
    expect(take(gray, 'returned', 'takeWhistle').character?.money).toBe(10);
  });

  it('pays the Knife in the Grass report fee after a fight only when the report is completed', () => {
    const knife = scenario('the-knife-in-the-grass');
    expect(take(knife, 'afterFight', 'markAfterFight').character?.money).toBe(11);
    expect(take(knife, 'afterFight', 'leaveAfterFight').character?.money).toBe(10);
    expect(take(knife, 'snare', 'markWire').character?.money).toBe(11);
  });

  it('keeps Black Stair inspection pay on the two audit-listed report choices without duplicating existing pay', () => {
    const mill = scenario('black-stair-wrens-mill');
    expect(take(mill, 'wheelHeld', 'takeWafer').character?.money).toBe(14);
    expect(take(mill, 'wheelHeld', 'takeWafer').run?.inventory).toContain('blackMillingStone');
    const chalk = stateAt(mill, 'chalkDoor');
    chalk.character!.supplies = { ritualChalk: 1 };
    const retrace = mill.scenes.chalkDoor.choices.find(({ id }) => id === 'retraceMarks')!;
    expect(choose(chalk, mill, retrace, () => 0).character?.money).toBe(14);
    expect(take(mill, 'millYard', 'witness').character?.money).toBe(10);
    expect(take(mill, 'ownersAccount', 'acceptShallow').character?.money).toBe(13);
  });

  it('pays White Chamber’s four-coin retrieval fee on both deeper documentation routes, not the fatal route', () => {
    const cave = scenario('white-chamber');
    expect(take(cave, 'whiteSeal', 'copySeal').character?.money).toBe(14);
    expect(take(cave, 'whiteDeep', 'leaveRod').character?.money).toBe(14);
    expect(take(cave, 'whiteDeep', 'followDark').character?.money).toBe(10);
  });

  it('settles Hush Now’s earned two-coin day wage once, separately from any optional gift, on every terminal route', () => {
    const paidEndingIds = new Set(['safeEnding', 'delayedRescueEnding', 'livestockEnding', 'walkAwayEnding']);
    const incoming = Object.values(HUSH_NOW.scenes).flatMap((scene) => scene.choices.flatMap((choice) => [
      ...(choice.next && paidEndingIds.has(choice.next) ? [{ sceneId: scene.id, choice, endingId: choice.next, roll: 0 }] : []),
      ...(choice.chance?.successNext && paidEndingIds.has(choice.chance.successNext) ? [{ sceneId: scene.id, choice, endingId: choice.chance.successNext, roll: 0 }] : []),
      ...(choice.chance?.failureNext && paidEndingIds.has(choice.chance.failureNext) ? [{ sceneId: scene.id, choice, endingId: choice.chance.failureNext, roll: 0.999999 }] : []),
    ]));
    expect(incoming.length).toBeGreaterThan(10);
    const results = incoming.map(({ sceneId, choice, endingId, roll }) => {
      const state = stateAt(HUSH_NOW, sceneId);
      state.run!.flags.push(...(choice.requirements?.flags ?? []));
      const paid = choose(state, HUSH_NOW, choice, () => roll);
      expect(paid.character?.money, `${sceneId}.${choice.id}`).toBe(12);
      expect(paid.run?.sceneId).toBe(endingId);
      expect(paid.run?.status).toBe('success');
      return paid;
    });
    expect(results.some(({ run }) => run?.sceneId === 'safeEnding')).toBe(true);
    expect(results.some(({ run }) => run?.sceneId === 'walkAwayEnding')).toBe(true);
    expect(results.some(({ run }) => run?.sceneId === 'livestockEnding')).toBe(true);
    expect(results.some(({ run }) => run?.sceneId === 'delayedRescueEnding')).toBe(true);

    const safe = results.find(({ run }) => run?.sceneId === 'safeEnding')!;
    let serialized = '';
    saveGame(safe, { setItem: (_key, value) => { serialized = value; } });
    const reloaded = loadSave({ getItem: () => serialized });
    expect(reloaded.character?.money).toBe(12);
    expect(reloaded.run?.sceneId).toBe('safeEnding');
    expect(HUSH_NOW.scenes.safeEnding.choices).toHaveLength(0);
  });
});
