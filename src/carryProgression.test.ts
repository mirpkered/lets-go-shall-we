import { describe, expect, it } from 'vitest';
import { carryCapacity, choose, depositCarried, failCharacter, finishSuccess, getCarriedItems, meets, newCharacter, retireCharacter, setCarriedItems, startRun, withdrawBanked } from './engine';
import { loadSave, SAVE_KEY } from './storage';
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
    const tenth = choose(ninth, ENDING, ENDING.scenes.start.choices[0]);
    expect(tenth.character?.adventuresCompleted).toBe(9);
    expect(tenth.run?.completionMilestoneReached).toBeUndefined();
    const milestone = choose(save(9), ENDING, ENDING.scenes.start.choices[0]);
    expect(milestone.character?.adventuresCompleted).toBe(10);
    expect(milestone.run?.completionMilestoneReached).toBe(10);
    expect(milestone.run?.inventory).toHaveLength(2); // the run began with the old one-slot loadout
    const nextRun = startRun(milestone.character!, ENDING);
    expect(nextRun.inventory).toHaveLength(2);

    const twentieth = choose(save(19), ENDING, ENDING.scenes.start.choices[0]);
    expect(twentieth.character?.adventuresCompleted).toBe(20);
    expect(twentieth.run?.completionMilestoneReached).toBe(20);
    expect(carryCapacity(twentieth.character!.adventuresCompleted)).toBe(3);
  });

  it('counts authored death once, but not QA endings or abandonment', () => {
    const deathScenario: Scenario = { ...ENDING, scenes: { ...ENDING.scenes, start: { ...ENDING.scenes.start, choices: [{ id: 'die', label: 'Die', next: 'death' }] } } };
    const died = choose(save(4), deathScenario, deathScenario.scenes.start.choices[0]);
    expect(died.run?.status).toBe('death');
    expect(died.character?.adventuresCompleted).toBe(5);
    expect(choose(died, deathScenario, deathScenario.scenes.start.choices[0]).character?.adventuresCompleted).toBe(5);
    expect(failCharacter(died).character).toBeNull();
    expect(carryCapacity(newCharacter().adventuresCompleted)).toBe(1);

    const qa = save(4);
    qa.run!.qaMode = true;
    expect(choose(qa, ENDING, ENDING.scenes.start.choices[0]).character?.adventuresCompleted).toBe(4);
    expect(failCharacter(save(4)).character).toBeNull();
    expect(failCharacter(save(4)).character).toBeNull();
    expect(retireCharacter(save(20)).character).toBeNull();
  });

  it('counts a quiet ending once and completion remains separate from the global queue', () => {
    const state = save(0);
    const ended = choose(state, ENDING, ENDING.scenes.start.choices[0]);
    expect(ended.character?.adventuresCompleted).toBe(1);
    expect(ended.pendingGlobalCompletions).toEqual([state.run!.runId]);
    expect(finishSuccess(ended, null).character?.adventuresCompleted).toBe(1);
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
    expect(loadSave(storage).character?.adventuresCompleted).toBe(4);
    expect(loadSave(storage).character?.adventuresCompleted).toBe(4);
    const qa = save(3);
    qa.run!.status = 'success';
    qa.run!.qaMode = true;
    qa.run!.completionCountRecorded = undefined;
    const qaMemory = new Map([[SAVE_KEY, JSON.stringify(qa)]]);
    const qaStorage = { getItem: (key: string) => qaMemory.get(key) ?? null, setItem: (key: string, value: string) => qaMemory.set(key, value) } as unknown as Storage;
    expect(loadSave(qaStorage).character?.adventuresCompleted).toBe(3);
  });
});

