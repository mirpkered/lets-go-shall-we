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
    const { visitedSceneIds: _visited, elapsedMinutes: _elapsed, ...legacyRun } = run;
    const { historyFlags: _historyFlags, ...legacyCharacter } = character;
    const oldSave = { version: 1, bank: ['graveCoin'], character: legacyCharacter, run: { ...legacyRun, sceneId: 'chapelNave' } };
    const state = loadSave(memoryStorage(JSON.stringify(oldSave)));
    expect(state.run?.visitedSceneIds).toEqual(['chapelNave']);
    expect(state.run?.elapsedMinutes).toBe(0);
    expect(state.mostRecentScenarioId).toBeNull();
    expect(state.recentScenarioIds).toEqual([]);
    expect(state.bank).toEqual(['graveCoin']);
    expect(state.character?.historyFlags).toEqual([]);
  });

  it('persists run history and recent scenario selection exactly', () => {
    const character = newCharacter('Recent Save');
    character.historyFlags = ['returned_for_help'];
    const state: SaveData = {
      version: 1, bank: ['yewCharm'], character,
      run: { ...startRun(character, BROKEN_BELL), sceneId: 'priestNotes', visitedSceneIds: ['chapelExterior', 'chapelNave', 'priestNotes'] },
      mostRecentScenarioId: 'broken-bell',
      recentScenarioIds: ['broken-bell'],
    };
    state.run!.elapsedMinutes = 27;
    const storage = memoryStorage();
    saveGame(state, storage);
    expect(loadSave(storage)).toEqual(state);
    expect(loadSave(storage).character?.historyFlags).toEqual(['returned_for_help']);
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
      version: 1, bank: [], character,
      run: { ...startRun(character, BROKEN_BELL), status: 'success', sceneId: 'peaceEnding', rewardSelectionOpen: true, completionCountRecorded: true },
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
