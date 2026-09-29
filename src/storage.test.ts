import { describe, expect, it } from 'vitest';
import { loadSave, SAVE_KEY, saveGame } from './storage';
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
  it('adds visited-scene and recent-scenario defaults to an older active save', () => {
    const character = newCharacter('Old Save');
    const run = startRun(character, BROKEN_BELL);
    const { visitedSceneIds: _visited, ...legacyRun } = run;
    const oldSave = { version: 1, bank: ['graveCoin'], character, run: { ...legacyRun, sceneId: 'chapelNave' } };
    const state = loadSave(memoryStorage(JSON.stringify(oldSave)));
    expect(state.run?.visitedSceneIds).toEqual(['chapelNave']);
    expect(state.mostRecentScenarioId).toBeNull();
    expect(state.bank).toEqual(['graveCoin']);
  });

  it('persists run history and recent scenario selection exactly', () => {
    const character = newCharacter('Recent Save');
    const state: SaveData = {
      version: 1, bank: ['yewCharm'], character,
      run: { ...startRun(character, BROKEN_BELL), sceneId: 'priestNotes', visitedSceneIds: ['chapelExterior', 'chapelNave', 'priestNotes'] },
      mostRecentScenarioId: 'broken-bell',
    };
    const storage = memoryStorage();
    saveGame(state, storage);
    expect(loadSave(storage)).toEqual(state);
  });
});
