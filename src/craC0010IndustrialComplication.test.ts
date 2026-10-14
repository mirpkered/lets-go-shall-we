import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from './engine';
import { EMPTY_SAVE } from './storage';
import type { ItemCondition, SaveData, Scenario } from './types';
import { INDUSTRIAL_MILL_RAIL_GEAR_BATCH } from './scenarios/industrialMillRailWorkGenreBatch';

type Case = {
  finding: string;
  scenarioId: string;
  consequence: string;
  timing: 'afterRepair' | 'afterTest';
};

const cases: Case[] = [
  { finding: 'CRA-F0318', scenarioId: 'the-tool-peg-on-night-shift', consequence: 'fitter’s locked drawer', timing: 'afterRepair' },
  { finding: 'CRA-F0319', scenarioId: 'the-misfed-grain-gate', consequence: 'gate holds at low flow', timing: 'afterTest' },
  { finding: 'CRA-F0320', scenarioId: 'the-dragging-brake-at-bell-yard', consequence: 'loaded test is postponed', timing: 'afterTest' },
  { finding: 'CRA-F0321', scenarioId: 'the-shaft-marks-at-ash-mill', consequence: 'hand turn clears', timing: 'afterTest' },
  { finding: 'CRA-F0322', scenarioId: 'the-sorting-table-jam', consequence: 'table runs', timing: 'afterTest' },
  { finding: 'CRA-F0323', scenarioId: 'the-cable-over-foundry-road', consequence: 'empty carrier moves freely', timing: 'afterTest' },
  { finding: 'CRA-F0324', scenarioId: 'the-ore-cart-on-the-incline', consequence: 'brake catches empty', timing: 'afterTest' },
  { finding: 'CRA-F0325', scenarioId: 'the-bell-before-the-restart', consequence: 'crew answers the whistle', timing: 'afterTest' },
  { finding: 'CRA-F0326', scenarioId: 'the-oil-on-the-switch-rod', consequence: 'rod moves freely', timing: 'afterTest' },
  { finding: 'CRA-F0327', scenarioId: 'the-sparks-at-the-belt-house', consequence: 'new splice clears the rim', timing: 'afterTest' },
  { finding: 'CRA-F0328', scenarioId: 'the-slow-wheel-at-copper-mill', consequence: 'click is gone', timing: 'afterTest' },
];

function makeState(scenario: Scenario, gear?: string, condition: ItemCondition = 'NORMAL'): SaveData {
  const character = newCharacter('Industrial Complication Tester');
  const run = startRun(character, scenario, () => 0);
  if (gear) run.inventory = [...new Set([...run.inventory, gear])];
  const itemStates = gear ? { [gear]: { condition, upgrades: [], provenance: [] } } : {};
  return { ...structuredClone(EMPTY_SAVE), character, run, itemStates };
}

function act(state: SaveData, scenario: Scenario, choiceId: string): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId}`).toBe(true);
  return choose(state, scenario, choice!);
}

function currentText(state: SaveData, scenario: Scenario): string {
  return sceneText(scenario.scenes[state.run!.sceneId], state);
}

describe('CRA-C0010 industrial post-action complications', () => {
  it.each(cases)('$finding $scenarioId withholds its complication until $timing', ({ scenarioId, consequence, timing }) => {
    const scenario = INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({ id }) => id === scenarioId)!;
    expect(scenario, scenarioId).toBeTruthy();

    let state = makeState(scenario);
    const inspect = scenario.scenes.inspect.choices.find(({ id }) => id === 'inspect')!;
    const observe = scenario.scenes.inspect.choices.find(({ id }) => id === 'observe')!;
    const setup = currentText(state, scenario);
    expect(setup).toContain('The equipment is stopped or isolated before you approach');
    expect(meets(inspect.requirements, state)).toBe(false);
    expect(meets(observe.requirements, state)).toBe(true);

    state = act(state, scenario, 'observe');
    expect(state.run?.sceneId).toBe('diagnose');
    const diagnosis = currentText(state, scenario);
    expect(diagnosis).not.toContain(consequence);
    expect(diagnosis.length).toBeGreaterThan(0);
    expect(scenario.scenes.diagnose.choices.map(({ id }) => id)).toEqual(expect.arrayContaining(['repair', 'hold', 'rush']));

    state = act(state, scenario, 'repair');
    expect(state.run?.sceneId).toBe('test');
    const preTest = currentText(state, scenario);
    expect(preTest).toContain(scenario.scenes.test.text.split(' ').slice(0, 4).join(' '));
    if (timing === 'afterRepair') expect(preTest).toContain(consequence);
    else expect(preTest).not.toContain(consequence);
    expect(scenario.scenes.test.choices.map(({ id }) => id)).toEqual(expect.arrayContaining(['slow', 'stopAgain', 'fullLoad']));

    state = act(state, scenario, 'slow');
    expect(state.run?.sceneId).toBe('settle');
    const postTest = currentText(state, scenario);
    if (timing === 'afterTest') expect(postTest).toContain(consequence);
    else expect(postTest).not.toContain(consequence);
  });

  it.each(cases)('$finding $scenarioId preserves usable-tool gating and the no-Gear fallback', ({ scenarioId }) => {
    const scenario = INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({ id }) => id === scenarioId)!;
    const inspect = scenario.scenes.inspect.choices.find(({ id }) => id === 'inspect')!;
    const observe = scenario.scenes.inspect.choices.find(({ id }) => id === 'observe')!;
    const gear = inspect.requirements?.usableItems?.[0];
    expect(gear).toBeTruthy();
    expect(meets(inspect.requirements, makeState(scenario, gear, 'NORMAL'))).toBe(true);
    expect(meets(inspect.requirements, makeState(scenario, gear, 'BROKEN'))).toBe(false);
    expect(meets(observe.requirements, makeState(scenario))).toBe(true);
    expect(meets(observe.requirements, makeState(scenario, gear, 'BROKEN'))).toBe(true);
  });
});
