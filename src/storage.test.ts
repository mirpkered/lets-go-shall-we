import { describe, expect, it } from 'vitest';
import { loadQaSave, loadSave, QA_SAVE_KEY, SAVE_KEY, saveGame, saveQaGame } from './storage';
import { newCharacter, startRun } from './engine';
import { BROKEN_BELL } from './scenarios/brokenBell';
import type { SaveData } from './types';

function memoryStorage(initial: string | null = null): Storage {
  const values = new Map<string, string>();
  if (initial !== null) values.set(SAVE_KEY, initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
}

describe('save compatibility', () => {
  it('keeps QA saves separate from the normal traveler and Bank save', () => {
    const playerCharacter = newCharacter('Player');
    playerCharacter.adventuresCompleted = 19;
    const playerSave: SaveData = { version: 1, bank: ['graveCoin'], character: playerCharacter, run: startRun(playerCharacter, BROKEN_BELL) };
    const storage = memoryStorage();
    saveGame(playerSave, storage);
    const qaSave = loadQaSave(storage);
    expect(qaSave.character).toBeNull();
    qaSave.bank.push('yewCharm');
    qaSave.character = newCharacter('QA');
    qaSave.character.adventuresCompleted = 20;
    saveQaGame(qaSave, storage);
    expect(storage.getItem(QA_SAVE_KEY)).not.toBeNull();
    expect(JSON.parse(storage.getItem(SAVE_KEY)!)).toEqual(playerSave);
    expect(loadSave(storage)).toMatchObject(playerSave);
    expect(loadQaSave(storage).bank).toEqual(['yewCharm']);
  });

  it('adds visited-scene and recent-scenario defaults to an older active save', () => {
    const character = newCharacter('Old Save');
    const run = startRun(character, BROKEN_BELL);
    const { visitedSceneIds: _visited, elapsedMinutes: _elapsed, startingItemStates: _itemStates, supplies: _supplies, startingSupplies: _startingSupplies, ...legacyRun } = run;
    const { historyFlags: _historyFlags, supplies: _characterSupplies, scenarioCategoryHistory: _categoryHistory, scenarioPlayCounts: _scenarioPlays, ...legacyCharacter } = character;
    legacyCharacter.carriedItem = 'graveCoin';
    legacyCharacter.ownedAssets = [{ id: 'horse', name: 'Old Horse', description: 'A steady pack animal.' }];
    const oldSave = { version: 1, bank: ['yewCharm'], itemStates: { graveCoin: { condition: 'DAMAGED', upgrades: [], provenance: ['Old save'] } }, character: legacyCharacter, run: { ...legacyRun, sceneId: 'chapelNave', inventory: ['smallKnife', 'lantern', 'graveCoin'], flags: ['heard_below'], health: 6 } };
    const state = loadSave(memoryStorage(JSON.stringify(oldSave)));
    expect(state.run?.visitedSceneIds).toEqual(['chapelNave']);
    expect(state.run?.elapsedMinutes).toBe(0);
    expect(state.run?.riskTier).toBe('HIGH');
    expect(state.mostRecentScenarioId).toBeNull();
    expect(state.recentScenarioIds).toEqual([]);
    expect(state.bank).toEqual(['yewCharm']);
    expect(state.character?.historyFlags).toEqual([]);
    expect(state.character?.scenarioCategoryHistory).toEqual([]);
    expect(state.character?.scenarioPlayCounts).toEqual({});
    expect(state.character?.carriedItems).toEqual(['graveCoin']);
    expect(state.character?.ownedAssets).toEqual([{ id: 'horse', name: 'Old Horse', description: 'A steady pack animal.' }]);
    expect(state.character?.supplies).toEqual({});
    expect(state.itemStates).toEqual({ graveCoin: { condition: 'DAMAGED', upgrades: [], provenance: ['Old save'] } });
    expect(state.run).toMatchObject({ sceneId: 'chapelNave', inventory: ['smallKnife', 'lantern', 'graveCoin'], flags: ['heard_below'], health: 6, supplies: {}, startingSupplies: {} });
    expect(state.run?.startingItemStates).toMatchObject({ smallKnife: { condition: 'NORMAL' }, lantern: { condition: 'NORMAL' } });
  });

  it('persists run history and recent scenario selection exactly', () => {
    const character = newCharacter('Recent Save');
    character.historyFlags = ['returned_for_help'];
    character.scenarioCategoryHistory = ['social interaction', 'labor/repair'];
    character.scenarioPlayCounts = { 'market-day': 2, 'gone-fishing': 1 };
    const state: SaveData = {
      version: 1, bank: ['yewCharm'], itemStates: {}, character,
      run: { ...startRun(character, BROKEN_BELL), sceneId: 'priestNotes', visitedSceneIds: ['chapelExterior', 'chapelNave', 'priestNotes'] },
      mostRecentScenarioId: 'broken-bell',
      recentScenarioIds: ['broken-bell'],
    };
    character.supplies = { ritualChalk: 2, coldIronNails: 4 };
    state.run!.supplies = structuredClone(character.supplies);
    state.run!.startingSupplies = { ritualChalk: 3, coldIronNails: 4 };
    state.run!.elapsedMinutes = 27;
    const storage = memoryStorage();
    saveGame(state, storage);
    expect(loadSave(storage)).toEqual(state);
    expect(loadSave(storage).character?.historyFlags).toEqual(['returned_for_help']);
  });

  it('persists banked and carried item condition, upgrades, provenance, and the active start snapshot exactly', () => {
    const character = newCharacter('Gear Save');
    character.carriedItems = ['travelRope'];
    character.carriedItem = 'travelRope';
    const run = startRun(character, BROKEN_BELL, Math.random, { travelRope: { condition: 'DAMAGED', upgrades: [{ id: 'splicedEyes', provenance: 'A ropewright' }], provenance: ['A ropewright'] } });
    run.sceneId = 'chapelNave';
    const state: SaveData = {
      version: 1, bank: ['freightmansStrap'], character, run,
      itemStates: {
        travelRope: { condition: 'DAMAGED', upgrades: [{ id: 'splicedEyes', provenance: 'A ropewright' }], provenance: ['A ropewright'] },
        freightmansStrap: { condition: 'BROKEN', upgrades: [{ id: 'stitchedBuckle' }], provenance: ['Harness maker'] },
      },
      mostRecentScenarioId: null, recentScenarioIds: [],
    };
    const storage = memoryStorage();
    saveGame(state, storage);
    expect(loadSave(storage)).toEqual(state);
  });

  it('safely discards unknown or unsupported equipment-state upgrades while preserving the item', () => {
    const character = newCharacter('Old Gear Save');
    const storage = memoryStorage(JSON.stringify({ version: 1, bank: ['travelRope'], character, run: null, itemStates: { travelRope: { condition: 'BROKEN', upgrades: [{ id: 'not-a-real-upgrade' }], provenance: [] }, unknownItem: { condition: 'DAMAGED', upgrades: [], provenance: [] } } }));
    const migrated = loadSave(storage);
    expect(migrated.bank).toEqual(['travelRope']);
    expect(migrated.itemStates).toEqual({ travelRope: { condition: 'BROKEN', upgrades: [], provenance: [] } });
  });

  it('preserves risk tier, risk history, injury, inventory loss and scene through save/reload', () => {
    const character = newCharacter('Risk Resume');
    const run = startRun(character, BROKEN_BELL);
    run.sceneId = 'chapelNave'; run.health = 4; run.inventory = ['smallKnife']; run.flags.push('beamUnstable');
    const state: SaveData = { version: 1, bank: [], character, run, recentRiskHistory: [
      { scenarioId: 'under-the-ice', tier: 'SEVERE' }, { scenarioId: 'market-day', tier: 'LOW' },
    ] };
    const storage = memoryStorage(); saveGame(state, storage);
    const resumed = loadSave(storage);
    expect(resumed.run).toMatchObject({ sceneId: 'chapelNave', health: 4, inventory: ['smallKnife'], riskTier: 'HIGH', flags: ['beamUnstable'] });
    expect(resumed.recentRiskHistory).toEqual(state.recentRiskHistory);
  });

  it('migrates an older active save with one durable run ID and preserves the queued counter IDs', () => {
    const character = newCharacter('Counter Test');
    const { runId: _runId, ...legacyRun } = startRun(character, BROKEN_BELL);
    const storage = memoryStorage(JSON.stringify({ version: 1, bank: [], character, run: legacyRun }));
    const firstLoad = loadSave(storage);
    expect(firstLoad.run?.runId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(loadSave(storage).run?.runId).toBe(firstLoad.run?.runId);
    const withPending = { ...firstLoad, pendingGlobalCompletions: ['run-to-retry'] };
    saveGame(withPending, storage);
    expect(loadSave(storage).pendingGlobalCompletions).toEqual(['run-to-retry']);
  });

  it('does not migrate a QA active run into the normal repeat-avoidance history', () => {
    const character = newCharacter('QA Save');
    const run = { ...startRun(character, BROKEN_BELL), qaMode: true };
    const state = loadSave(memoryStorage(JSON.stringify({ version: 1, bank: [], character, run, mostRecentScenarioId: BROKEN_BELL.id })));
    expect(state.recentScenarioIds).toEqual([]);
  });

  it('preserves the current keepsake-selection view for an unfinished successful run', () => {
    const character = newCharacter('Reward Save');
    const state: SaveData = {
      version: 1, bank: [], itemStates: {}, character,
      run: { ...startRun(character, BROKEN_BELL), status: 'success', sceneId: 'peaceEnding', rewardSelectionOpen: true, authoredEndingRecorded: true, completionCountRecorded: true },
      mostRecentScenarioId: BROKEN_BELL.id,
      recentScenarioIds: [BROKEN_BELL.id],
    };
    const storage = memoryStorage();
    saveGame(state, storage);
    expect(loadSave(storage)).toEqual(state);
  });

  it('migrates an active save with no clock to zero elapsed fictional minutes', () => {
    const character = newCharacter('Paused Traveler');
    const { elapsedMinutes: _elapsed, ...legacyRun } = startRun(character, BROKEN_BELL);
    const oldSave = { version: 1, bank: [], character, run: { ...legacyRun, sceneId: 'underStairs' } };
    const state = loadSave(memoryStorage(JSON.stringify(oldSave)));
    expect(state.run?.sceneId).toBe('underStairs');
    expect(state.run?.elapsedMinutes).toBe(0);
    expect(state.run?.status).toBe('active');
  });

  it('moves an older active Bell save from a removed scene into a safe continuation scene', () => {
    const character = newCharacter('Continuing Player');
    const run = startRun(character, BROKEN_BELL);
    const oldRun = { ...run, sceneId: 'returnToChapel', health: 6, inventory: [...run.inventory, 'blackClapper'], flags: ['hasClapper'], visitedSceneIds: ['chapelExterior', 'chapelNave', 'burialApproach', 'keeperAfterSnatch', 'returnToChapel'] };
    const state = loadSave(memoryStorage(JSON.stringify({ version: 1, bank: ['graveCoin'], character, run: oldRun })));
    expect(state.run?.sceneId).toBe('legacyResume');
    expect(state.run?.health).toBe(6);
    expect(state.run?.inventory).toContain('blackClapper');
    expect(state.run?.flags).toContain('hasClapper');
    expect(state.bank).toEqual(['graveCoin']);
    expect(state.run?.visitedSceneIds).toContain('legacyResume');
  });
});
