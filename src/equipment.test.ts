import { describe, expect, it } from 'vitest';
import { addUpgrade, choose, damageItem, depositCarried, failCharacter, finishSuccess, getCarriedItems, itemCondition, meets, newCharacter, repairItem, replaceItem, setCarriedItems, startRun, withdrawBanked } from './engine';
import { THE_BROKEN_HARNESS } from './scenarios/animalsBatch';
import { BRIDGE_OUT } from './scenarios/bridgeOut';
import { THE_LOOSE_TEAM } from './scenarios/looseTeam';
import type { SaveData, Scenario } from './types';

function fresh(items: string[] = ['travelRope']): SaveData {
  const character = newCharacter('Equipment Tester');
  setCarriedItems(character, items);
  return { version: 1, bank: [], itemStates: {}, character, run: startRun(character, THE_BROKEN_HARNESS) };
}

function chooseAt(state: SaveData, sceneId: string, choiceId: string, random = () => 0): SaveData {
  state.run!.sceneId = sceneId;
  const choice = THE_BROKEN_HARNESS.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Missing ${sceneId}.${choiceId}`);
  return choose(state, THE_BROKEN_HARNESS, choice, random);
}

describe('persistent equipment condition and upgrades', () => {
  it('defaults legacy gear to normal and snapshots the active traveler’s starting state', () => {
    const state = fresh();
    expect(itemCondition(state, 'travelRope')).toBe('NORMAL');
    expect(state.run?.startingItemStates?.travelRope).toMatchObject({ condition: 'NORMAL', upgrades: [] });
  });

  it('moves condition and upgrades with the same item through Bank storage and preserves banked state on death', () => {
    let state = fresh();
    state = addUpgrade(damageItem(state, 'travelRope'), 'travelRope', 'splicedEyes', 'Harness maker');
    state = depositCarried(state, undefined, 'travelRope');
    expect(state.bank).toEqual(['travelRope']);
    expect(state.itemStates?.travelRope).toMatchObject({ condition: 'DAMAGED', upgrades: [{ id: 'splicedEyes' }] });
    state = withdrawBanked(state, 'travelRope');
    expect(state.itemStates?.travelRope.condition).toBe('DAMAGED');
    state = depositCarried(state, undefined, 'travelRope');
    const dead = failCharacter(state);
    expect(dead.itemStates?.travelRope).toEqual(state.itemStates!.travelRope);
    expect(dead.bank).toEqual(['travelRope']);
  });

  it('has explicit healthy, damaged, and broken states; only broken gear loses usable-item access', () => {
    let state = fresh();
    expect(meets({ usableItems: ['travelRope'] }, state)).toBe(true);
    state = damageItem(state, 'travelRope');
    expect(itemCondition(state, 'travelRope')).toBe('DAMAGED');
    expect(meets({ usableItems: ['travelRope'] }, state)).toBe(true);
    state = damageItem(state, 'travelRope');
    expect(itemCondition(state, 'travelRope')).toBe('BROKEN');
    expect(meets({ usableItems: ['travelRope'] }, state)).toBe(false);
    expect(meets({ notUsableItems: ['travelRope'] }, state)).toBe(true);
    expect(repairItem(state, 'travelRope').itemStates?.travelRope.condition).toBe('NORMAL');
  });

  it('stores named upgrades without consuming another carry slot and rejects unauthored upgrades', () => {
    const state = fresh(['travelRope']);
    const upgraded = addUpgrade(state, 'travelRope', 'splicedEyes', 'Roadside ropewright');
    expect(upgraded.itemStates?.travelRope.upgrades).toEqual([{ id: 'splicedEyes', provenance: 'Roadside ropewright' }]);
    expect(getCarriedItems(upgraded.character)).toEqual(['travelRope']);
    expect(addUpgrade(upgraded, 'travelRope', 'inventedUpgrade')).toEqual(upgraded);
  });

  it('replaces an owned item only explicitly and never overwrites an existing Bank item', () => {
    const state = fresh(['travelRope']);
    const replaced = replaceItem(state, 'travelRope', 'pocketToolkit', 'Replaced at a tool shop');
    expect(getCarriedItems(replaced.character)).toEqual(['pocketToolkit']);
    expect(replaced.run?.inventory).toContain('pocketToolkit');
    expect(replaced.run?.inventory).not.toContain('travelRope');
    expect(replaced.itemStates?.travelRope).toBeUndefined();
    const bankCollision = { ...state, bank: ['pocketToolkit'] };
    expect(replaceItem(bankCollision, 'travelRope', 'pocketToolkit')).toEqual(bankCollision);
  });

  it('applies an earned strap upgrade through The Broken Harness and counts the retained improvement as progression', () => {
    let state = fresh(['freightmansStrap']);
    state = chooseAt(state, 'cartLane', 'inspectHarness');
    state = chooseAt(state, 'strapAssessed', 'helpFitHarness');
    expect(state.run?.sceneId).toBe('harnessRepaired');
    const upgrade = THE_BROKEN_HARNESS.scenes.harnessRepaired.choices.find(({ id }) => id === 'reinforceFreightmansStrap')!;
    expect(meets(upgrade.requirements, state)).toBe(true);
    state = chooseAt(state, 'harnessRepaired', 'reinforceFreightmansStrap');
    expect(state.run?.status).toBe('success');
    expect(state.itemStates?.freightmansStrap.upgrades).toEqual([{ id: 'stitchedBuckle', provenance: 'Reinforced by the harness maker' }]);
    state = finishSuccess(state, getCarriedItems(state.character));
    expect(state.character?.adventuresCompleted).toBe(1);
  });

  it('does not count a QA equipment edit as traveler progression', () => {
    const state = fresh(['freightmansStrap']);
    state.run!.qaMode = true;
    const scenario: Scenario = { id: 'qa-equipment', title: 'QA', subtitle: '', startScene: 'start', scenes: {
      start: { id: 'start', title: 'Start', text: '', choices: [{ id: 'upgrade', label: 'Upgrade', effects: { addItemUpgrades: [{ itemId: 'freightmansStrap', upgradeId: 'stitchedBuckle' }] }, next: 'done' }] },
      done: { id: 'done', title: 'Done', text: '', choices: [], ending: 'success' },
    } };
    state.run = startRun(state.character!, scenario, Math.random, state.itemStates);
    state.run.qaMode = true;
    const upgraded = finishSuccess(choose(state, scenario, scenario.scenes.start.choices[0]), ['freightmansStrap']);
    expect(upgraded.character?.adventuresCompleted).toBe(0);
  });

  it('can repair a strained strap at the harness maker and records where it was mended', () => {
    let state = fresh(['freightmansStrap']);
    state = damageItem(state, 'freightmansStrap');
    state = chooseAt(state, 'cartLane', 'offerStrap');
    state = chooseAt(state, 'strapBraced', 'walkToFarmBrace');
    expect(itemCondition(state, 'freightmansStrap')).toBe('BROKEN');
    state = chooseAt(state, 'harnessRepaired', 'repairFreightmansStrap');
    expect(itemCondition(state, 'freightmansStrap')).toBe('NORMAL');
    expect(state.itemStates?.freightmansStrap.provenance).toContain('Mended by the harness maker');
  });

  it('offers rope repair only when needed and keeps the sound-rope splice as a separate service', () => {
    let worn = fresh(['travelRope']);
    worn = damageItem(damageItem(worn, 'travelRope'), 'travelRope');
    worn.run!.sceneId = 'harnessRepaired';
    worn = chooseAt(worn, 'harnessRepaired', 'askAboutRope');
    const repair = THE_BROKEN_HARNESS.scenes.ropeService.choices.find(({ id }) => id === 'repairTravelRope')!;
    const splice = THE_BROKEN_HARNESS.scenes.ropeService.choices.find(({ id }) => id === 'spliceRopeHookEye')!;
    expect(meets(repair.requirements, worn)).toBe(true);
    expect(meets(splice.requirements, worn)).toBe(false);
    worn = chooseAt(worn, 'ropeService', 'repairTravelRope');
    expect(worn.run?.status).toBe('success');
    expect(itemCondition(worn, 'travelRope')).toBe('NORMAL');
    expect(worn.itemStates?.travelRope.provenance).toContain('Mended by the roadside harness maker');

    const sound = fresh(['travelRope']);
    sound.run!.sceneId = 'harnessRepaired';
    const service = chooseAt(sound, 'harnessRepaired', 'askAboutRope');
    expect(meets(repair.requirements, service)).toBe(false);
    expect(meets(splice.requirements, service)).toBe(true);
    const upgraded = chooseAt(service, 'ropeService', 'spliceRopeHookEye');
    expect(upgraded.itemStates?.travelRope.upgrades).toEqual([{ id: 'splicedEyes', provenance: 'Leather-whipped by the harness maker' }]);
  });

  it('damages rope only after the risky bridge-handline check fails and lets upgrades improve a separate use', () => {
    const character = newCharacter('Rope Tester');
    setCarriedItems(character, ['travelRope']);
    const bridge = { version: 1 as const, bank: [], character, run: startRun(character, BRIDGE_OUT) };
    const crossing = BRIDGE_OUT.scenes.peopleFirst.choices.find(({ id }) => id === 'steadyWithRope')!;
    const failed = choose({ ...bridge, run: { ...bridge.run!, sceneId: 'peopleFirst' } }, BRIDGE_OUT, crossing, () => 0.99);
    expect(itemCondition(failed, 'travelRope')).toBe('DAMAGED');
    expect(itemCondition(bridge, 'travelRope')).toBe('NORMAL');

    const teamCharacter = newCharacter('Upgrade Tester');
    setCarriedItems(teamCharacter, ['travelRope', 'freightmansStrap']);
    const team = { version: 1 as const, bank: [], itemStates: { freightmansStrap: { condition: 'NORMAL' as const, upgrades: [{ id: 'stitchedBuckle' }], provenance: [] } }, character: teamCharacter, run: startRun(teamCharacter, THE_LOOSE_TEAM, Math.random, { freightmansStrap: { condition: 'NORMAL', upgrades: [{ id: 'stitchedBuckle' }], provenance: [] } }) };
    const throwRope = THE_LOOSE_TEAM.scenes.roadJunction.choices.find(({ id }) => id === 'throwRopeAcrossRoad')!;
    const outcome = choose({ ...team, run: { ...team.run, sceneId: 'roadJunction' } }, THE_LOOSE_TEAM, throwRope, () => 0.62);
    expect(outcome.run?.sceneId).toBe('wagonTurnedAftermath');
  });
});

