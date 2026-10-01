import { describe, expect, it } from 'vitest';
import { carryCapacity, choose, depositCarried, failCharacter, finishSuccess, getCarriedItems, meets, newCharacter, retireCharacter, setCarriedItems, startRun, withdrawBanked } from './engine';
import { loadSave, SAVE_KEY, saveGame } from './storage';
import { BROKEN_BELL } from './scenarios/brokenBell';
import type { SaveData, Scenario } from './types';

const ENDING: Scenario = {
  id: 'milestone-test', title: 'Milestone test', subtitle: '', startScene: 'start',
  scenes: {
    start: { id: 'start', title: 'Start', text: 'A short test.', choices: [{ id: 'finish', label: 'Finish', next: 'quiet' }] },
    quiet: { id: 'quiet', title: 'Quiet end', text: 'The journey is over.', choices: [], ending: 'success' },
    death: { id: 'death', title: 'Death', text: 'The traveler dies.', choices: [], ending: 'death' },
  },
};

function save(count = 0, bank: string[] = []): SaveData {
  const character = newCharacter('Milestone traveler');
  character.adventuresCompleted = count;
  return { version: 1, bank, character, run: startRun(character, ENDING) };
}

function completeAfterTransitions(transitions: number, travelerCount = 0, presentationAt: number[] = []): SaveData {
  const ids = transitions === 0 ? ['quiet'] : ['start', ...Array.from({ length: transitions - 1 }, (_, index) => `beat${index + 1}`), 'quiet'];
  const scenes: Scenario['scenes'] = {};
  ids.forEach((id, index) => {
    const ending = id === 'quiet';
    scenes[id] = { id, title: id, text: id, choices: ending ? [] : [{ id: 'next', label: 'Continue', next: ids[index + 1] }], ...(ending ? { ending: 'success' as const, completionQualification: 'substantive' as const } : {}), ...(presentationAt.includes(index + 1) ? { countsForProgression: false } : {}) };
  });
  const scenario: Scenario = { id: 'transition-test', title: 'Transition test', subtitle: '', startScene: ids[0], scenes };
  const character = newCharacter('Transition traveler');
  character.adventuresCompleted = travelerCount;
  let state: SaveData = { version: 1, bank: [], character, run: startRun(character, scenario) };
  for (let index = 0; index < transitions; index++) state = choose(state, scenario, scenario.scenes[ids[index]].choices[0]);
  if (transitions === 0) { state.run!.status = 'success'; state.run!.completionQualification = 'substantive'; }
  return state;
}

describe('traveler completion and carry milestones', () => {
  it('starts fresh at zero and unlocks only after authored endings at 10 and 20', () => {
    expect(carryCapacity(0)).toBe(1);
    expect(carryCapacity(9)).toBe(1);
    expect(carryCapacity(10)).toBe(2);
    expect(carryCapacity(19)).toBe(2);
    expect(carryCapacity(20)).toBe(3);
    expect(carryCapacity(200)).toBe(3);

    const ninth = save(8);
    expect(carryCapacity(ninth.character!.adventuresCompleted)).toBe(1);
    const tenth = finishSuccess(completeAfterTransitions(6, 8), null);
    expect(tenth.character?.adventuresCompleted).toBe(9);
    expect(tenth.run?.completionMilestoneReached).toBeUndefined();
    const milestone = finishSuccess(completeAfterTransitions(6, 9), null);
    expect(milestone.character?.adventuresCompleted).toBe(10);
    expect(milestone.run).toBeNull();
    const nextRun = startRun(milestone.character!, ENDING);
    expect(nextRun.inventory).toHaveLength(2);

    const twentieth = finishSuccess(completeAfterTransitions(6, 19), null);
    expect(twentieth.character?.adventuresCompleted).toBe(20);
    expect(carryCapacity(twentieth.character!.adventuresCompleted)).toBe(3);
  });

  it('counts authored death once, but not QA endings or abandonment', () => {
    const deathScenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'die', label: 'Die', next: 'death' }] } } };
    const died = choose(save(4), deathScenario, deathScenario.scenes.start.choices[0]);
    expect(died.run?.status).toBe('death');
    expect(died.character?.adventuresCompleted).toBe(4);
    expect(choose(died, deathScenario, deathScenario.scenes.start.choices[0]).character?.adventuresCompleted).toBe(4);
    expect(failCharacter(died).character).toBeNull();
    expect(carryCapacity(newCharacter().adventuresCompleted)).toBe(1);

    const qa = save(4);
    qa.run!.qaMode = true;
    expect(choose(qa, ENDING, ENDING.scenes.start.choices[0]).character?.adventuresCompleted).toBe(4);
    expect(failCharacter(save(4)).character).toBeNull();
    expect(failCharacter(save(4)).character).toBeNull();
    expect(retireCharacter(save(20)).character).toBeNull();
  });

  it('awards a substantive death ending regardless of transition count', () => {
    for (const transitions of [5, 6]) {
      const ids = ['start', ...Array.from({ length: transitions - 1 }, (_, index) => `beat${index + 1}`), 'death'];
      const scenes: Scenario['scenes'] = {};
      ids.forEach((id, index) => {
        const isDeath = id === 'death';
        scenes[id] = { id, title: id, text: id, choices: isDeath ? [] : [{ id: 'next', label: 'Continue', next: ids[index + 1], ...(index === ids.length - 2 ? { effects: { health: -10 } } : {}) }], ...(isDeath ? { ending: 'death' as const, completionQualification: 'substantive' as const } : {}) };
      });
      const scenario: Scenario = { id: `death-${transitions}`, title: '', subtitle: '', startScene: 'start', scenes };
      let state = save(9);
      for (let index = 0; index < transitions; index++) state = choose(state, scenario, scenario.scenes[state.run!.sceneId].choices[0]);
      expect(state.run?.status).toBe('death');
      expect(state.run?.qualifyingStoryTransitions).toBe(transitions);
      expect(state.character?.adventuresCompleted).toBe(10);
      expect(state.pendingGlobalCompletions).toEqual([state.run!.runId]);
      expect(failCharacter(state).character).toBeNull();
    }
  });

  it('does not count explicit abandonment after a long run', () => {
    const state = save();
    state.run!.qualifyingStoryTransitions = 6;
    state.pendingGlobalCompletions = undefined;
    const abandoned = failCharacter(state);
    expect(abandoned.character).toBeNull();
    expect(abandoned.pendingGlobalCompletions).toBeUndefined();
  });

  it('does not count Bank operations or QA endings as story progression', () => {
    const state = save(10, ['graveCoin']);
    state.run!.qualifyingStoryTransitions = 5;
    const deposited = depositCarried(state);
    expect(deposited.run?.qualifyingStoryTransitions).toBe(5);
    const withdrawn = withdrawBanked(deposited, 'graveCoin');
    expect(withdrawn.run?.qualifyingStoryTransitions).toBe(5);

    const qa = completeAfterTransitions(6);
    qa.run!.qaMode = true;
    qa.run!.completionCountRecorded = false;
    qa.character!.adventuresCompleted = 0;
    qa.pendingGlobalCompletions = undefined;
    const completed = finishSuccess(qa, null);
    expect(completed.character?.adventuresCompleted).toBe(0);
    expect(completed.pendingGlobalCompletions).toBeUndefined();
  });

  it('keeps an early authored ending global without awarding traveler progression', () => {
    const state = save(0);
    const trivial: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, quiet: { ...ENDING.scenes.quiet, completionQualification: 'nonSubstantive' } } };
    const ended = choose(state, trivial, trivial.scenes.start.choices[0]);
    expect(ended.character?.adventuresCompleted).toBe(0);
    expect(ended.pendingGlobalCompletions).toEqual([state.run!.runId]);
    expect(ended.run?.authoredEndingRecorded).toBe(true);
    expect(ended.run?.completionCountRecorded).toBe(false);
    const finalized = finishSuccess(ended, null);
    expect(finalized.character?.adventuresCompleted).toBe(0);
    expect(finalized.run).toBeNull();
  });

  it('guards global authored recording and traveler progression independently', () => {
    const state = save();
    state.run!.status = 'success';
    state.run!.qualifyingStoryTransitions = 6;
    state.run!.completionCountRecorded = true;
    const globalOnly = finishSuccess(state, null);
    expect(globalOnly.pendingGlobalCompletions).toEqual([state.run!.runId]);
    expect(globalOnly.character?.adventuresCompleted).toBe(0);

    const progressionOnly = save();
    progressionOnly.run!.status = 'success';
    progressionOnly.run!.qualifyingStoryTransitions = 6;
    progressionOnly.run!.authoredEndingRecorded = true;
    progressionOnly.run!.globalCompletionQueued = true;
    progressionOnly.run!.startingMoney = -1;
    const travelerOnly = finishSuccess(progressionOnly, null);
    expect(travelerOnly.pendingGlobalCompletions).toBeUndefined();
    expect(travelerOnly.character?.adventuresCompleted).toBe(1);
  });

  it('recognizes carried gear from all slots and consumes only the named item', () => {
    const state = save(20);
    setCarriedItems(state.character!, ['travelRope', 'trailCompass', 'roadmansLantern']);
    const run = startRun(state.character!, ENDING);
    expect(run.inventory).toEqual(expect.arrayContaining(['travelRope', 'trailCompass', 'roadmansLantern']));
    const requirementState = { ...state, run };
    expect(meets({ items: ['roadmansLantern'] }, requirementState)).toBe(true);
    const consumption: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'use', label: 'Use it', effects: { loseItems: ['trailCompass'] }, next: 'quiet' }] } } };
    const after = choose({ ...requirementState, run: { ...run, sceneId: 'start' } }, consumption, consumption.scenes.start.choices[0]);
    expect(getCarriedItems(after.character)).toEqual(['travelRope', 'roadmansLantern']);
  });

  it('supports losing all unsecured carried gear as distinct from losing one carried item', () => {
    const state = save(20);
    setCarriedItems(state.character!, ['travelRope', 'trailCompass', 'weatherproofCloak']);
    const scenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'leave', label: 'Leave gear', effects: { loseCarriedItems: true }, next: 'quiet' }] } } };
    const after = choose({ ...state, run: { ...state.run!, sceneId: 'start' } }, scenario, scenario.scenes.start.choices[0]);
    expect(getCarriedItems(after.character)).toEqual([]);
    expect(after.run?.inventory).not.toContain('travelRope');
    expect(after.run?.inventory).not.toContain('trailCompass');
    expect(after.run?.inventory).not.toContain('weatherproofCloak');
  });

  it('supports two and three persistent items, with lossless explicit Bank moves and swaps', () => {
    const two = save(10);
    setCarriedItems(two.character!, ['travelRope', 'trailCompass']);
    expect(getCarriedItems(two.character)).toEqual(['travelRope', 'trailCompass']);
    const three = save(20);
    setCarriedItems(three.character!, ['travelRope', 'trailCompass', 'weatherproofCloak']);
    expect(getCarriedItems(three.character)).toHaveLength(3);
    const twoStored = depositCarried(two, undefined, 'trailCompass');
    expect(twoStored.bank).toEqual(['trailCompass']);
    expect(getCarriedItems(twoStored.character)).toEqual(['travelRope']);
    const returned = withdrawBanked(twoStored, 'trailCompass');
    expect(getCarriedItems(returned.character)).toEqual(['travelRope', 'trailCompass']);

    const full = save(20, ['graveCoin', 'yewCharm', 'brassCandlestick', 'bronzeMaskFragment', 'boneKey']);
    setCarriedItems(full.character!, ['travelRope', 'trailCompass']);
    const swapped = depositCarried(full, 'yewCharm', 'trailCompass');
    expect(swapped.bank).toContain('trailCompass');
    expect(getCarriedItems(swapped.character)).toEqual(['travelRope', 'yewCharm']);
    expect(swapped.bank).toHaveLength(5);
  });

  it('lets the Bank prepare a fresh traveler before their first adventure', () => {
    const stored: SaveData = { version: 1, bank: ['travelRope'], character: null, run: null };
    const prepared = withdrawBanked(stored, 'travelRope');
    expect(prepared.character?.adventuresCompleted).toBe(0);
    expect(carryCapacity(prepared.character!.adventuresCompleted)).toBe(1);
    expect(getCarriedItems(prepared.character)).toEqual(['travelRope']);
    expect(prepared.bank).toEqual([]);
    expect(prepared.run).toBeNull();
  });

  it('keeps a three-item reward loadout and never changes a full bank automatically', () => {
    const state = save(20, ['graveCoin', 'yewCharm', 'brassCandlestick', 'bronzeMaskFragment', 'boneKey']);
    state.run!.status = 'success';
    state.run!.inventory.push('travelRope', 'trailCompass', 'weatherproofCloak');
    state.run!.acquiredThisRun.push('travelRope', 'trailCompass', 'weatherproofCloak');
    const completed = finishSuccess(state, ['travelRope', 'trailCompass', 'weatherproofCloak']);
    expect(getCarriedItems(completed.character)).toEqual(['travelRope', 'trailCompass', 'weatherproofCloak']);
    expect(completed.bank).toEqual(state.bank);
    expect(completed.run).toBeNull();
  });

  it('migrates legacy scalar gear without duplicates and defaults unknown history conservatively', () => {
    const oldCharacter = { ...newCharacter('Legacy'), carriedItem: 'travelRope', carriedItems: undefined, adventuresCompleted: undefined } as unknown as SaveData['character'];
    const old = { version: 1, bank: [], character: oldCharacter, run: null };
    const memory = new Map([[SAVE_KEY, JSON.stringify(old)]]);
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    const loaded = loadSave(storage);
    expect(loaded.character?.adventuresCompleted).toBe(0);
    expect(loaded.character?.carriedItems).toEqual(['travelRope']);
    expect(getCarriedItems(loaded.character)).toEqual(['travelRope']);
    expect(JSON.parse(memory.get(SAVE_KEY)!).character.carriedItems).toEqual(['travelRope']);
  });

  it('round-trips a full three-item loadout without duplicates', () => {
    const three = save(20);
    setCarriedItems(three.character!, ['travelRope', 'trailCompass', 'weatherproofCloak', 'travelRope']);
    const memory = new Map([[SAVE_KEY, JSON.stringify(three)]]);
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    const loaded = loadSave(storage);
    expect(loaded.character?.carriedItems).toEqual(['travelRope', 'trailCompass', 'weatherproofCloak']);
    expect(loaded.character?.carriedItem).toBe('travelRope');
    expect(getCarriedItems(loaded.character)).toEqual(['travelRope', 'trailCompass', 'weatherproofCloak']);
  });

  it('records an uncounted legacy terminal save once while preserving QA exclusion', () => {
    const old = save(3);
    old.run!.status = 'success';
    old.run!.completionCountRecorded = undefined;
    const memory = new Map([[SAVE_KEY, JSON.stringify(old)]]);
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    expect(loadSave(storage).character?.adventuresCompleted).toBe(3);
    expect(loadSave(storage).character?.adventuresCompleted).toBe(3);
    const qa = save(3);
    qa.run!.status = 'success';
    qa.run!.qaMode = true;
    qa.run!.completionCountRecorded = undefined;
    const qaMemory = new Map([[SAVE_KEY, JSON.stringify(qa)]]);
    const qaStorage = { getItem: (key: string) => qaMemory.get(key) ?? null, setItem: (key: string, value: string) => qaMemory.set(key, value) } as unknown as Storage;
    expect(loadSave(qaStorage).character?.adventuresCompleted).toBe(3);
  });

  it('does not use transition count as a progression gate', () => {
    const short = finishSuccess(completeAfterTransitions(1), null);
    expect(short.character?.adventuresCompleted).toBe(1);
    const long = completeAfterTransitions(7, 0, [2]);
    expect(long.run?.qualifyingStoryTransitions).toBe(6);
    expect(finishSuccess(long, null).character?.adventuresCompleted).toBe(1);
  });

  it('preserves run-start snapshots through reload and records currency qualification exactly once', () => {
    const ids = ['start', 'one', 'two', 'three', 'four', 'five', 'quiet'];
    const scenes: Scenario['scenes'] = {};
    ids.forEach((id, index) => { scenes[id] = { id, title: id, text: '', choices: id === 'quiet' ? [] : [{ id: 'next', label: 'Next', next: ids[index + 1], ...(id === 'five' ? { effects: { money: 1 } } : {}) }], ...(id === 'quiet' ? { ending: 'success' as const } : {}) }; });
    const scenario: Scenario = { id: 'resume-count-test', title: '', subtitle: '', startScene: 'start', scenes };
    let state = save();
    for (let index = 0; index < 4; index++) state = choose(state, scenario, scenario.scenes[state.run!.sceneId].choices[0]);
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    saveGame(state, storage);
    state = loadSave(storage);
    expect(state.run?.qualifyingStoryTransitions).toBe(4);
    for (let index = 0; index < 3; index++) state = choose(state, scenario, scenario.scenes[state.run!.sceneId].choices[0]);
    expect(state.run?.status).toBe('success');
    expect(state.character?.adventuresCompleted).toBe(0);
    state = finishSuccess(state, null);
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(state.run).toBeNull();
  });

  it('qualifies when final money differs from run start, but not after a full reversal', () => {
    for (const [starting, change] of [[0, 1], [3, -3], [5, -2]]) {
      const state = save(); state.character!.money = starting; state.run!.startingMoney = starting;
      const scenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'pay', label: 'Change money', next: 'quiet', effects: { money: change } }] } } };
      const ended = choose(state, scenario, scenario.scenes.start.choices[0]);
      expect(finishSuccess(ended, null).character?.adventuresCompleted).toBe(1);
    }
    const state = save(); state.character!.money = 4; state.run!.startingMoney = 4;
    const scenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'gain', label: 'Gain', next: 'middle', effects: { money: 2 } }] }, middle: { id: 'middle', title: '', text: '', choices: [{ id: 'repay', label: 'Repay', next: 'quiet', effects: { money: -2 } }] } } };
    const ended = choose(choose(state, scenario, scenario.scenes.start.choices[0]), scenario, scenario.scenes.middle.choices[0]);
    expect(finishSuccess(ended, null).character?.adventuresCompleted).toBe(0);
  });

  it('qualifies only for persistent carried-gear changes, not supplied adventure equipment', () => {
    const character = newCharacter(); setCarriedItems(character, ['travelRope']);
    const lost = startRun(character, ENDING);
    const loseScenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'lose', label: 'Lose it', next: 'quiet', effects: { loseItems: ['travelRope'] } }] } } };
    const lostState = choose({ version: 1, bank: [], character, run: lost }, loseScenario, loseScenario.scenes.start.choices[0]);
    expect(finishSuccess(lostState, null).character?.adventuresCompleted).toBe(1);

    const fresh = newCharacter();
    const run = startRun(fresh, ENDING);
    const suppliedScenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'borrow', label: 'Borrow', next: 'quiet', effects: { gainItems: ['heavyLeatherGloves'], inventorySources: { heavyLeatherGloves: 'supplied' } } }] } } };
    const supplied = choose({ version: 1, bank: [], character: fresh, run }, suppliedScenario, suppliedScenario.scenes.start.choices[0]);
    expect(supplied.run?.inventorySources?.heavyLeatherGloves).toBe('supplied');
    expect(finishSuccess(supplied, null).character?.adventuresCompleted).toBe(0);
    const carried = finishSuccess(supplied, 'heavyLeatherGloves');
    expect(carried.character?.adventuresCompleted).toBe(1);
    expect(getCarriedItems(carried.character)).toContain('heavyLeatherGloves');
  });

  it('migrates active counters from visited scenes and leaves ended legacy progression unchanged', () => {
    const character = newCharacter('Legacy route');
    const legacy: SaveData = { version: 1, bank: [], character, run: startRun(character, BROKEN_BELL) };
    legacy.run!.visitedSceneIds = ['chapelExterior', 'chapelNave', 'priestNotes'];
    legacy.run!.qualifyingStoryTransitions = undefined;
    const memory = new Map([[SAVE_KEY, JSON.stringify(legacy)]]);
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    expect(loadSave(storage).run?.qualifyingStoryTransitions).toBe(2);
    expect(loadSave(storage).run?.startingMoney).toBe(character.money);
    expect(loadSave(storage).character?.ownedAssets).toEqual([]);

    const ended = save(7);
    ended.run!.status = 'success';
    ended.run!.completionCountRecorded = undefined;
    const endedMemory = new Map([[SAVE_KEY, JSON.stringify(ended)]]);
    const endedStorage = { getItem: (key: string) => endedMemory.get(key) ?? null, setItem: (key: string, value: string) => endedMemory.set(key, value) } as unknown as Storage;
    expect(loadSave(endedStorage).character?.adventuresCompleted).toBe(7);
    expect(loadSave(endedStorage).run?.authoredEndingRecorded).toBe(true);
  });
});

