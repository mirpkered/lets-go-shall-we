import type { SaveData } from './types';

const KEY = 'mirpworks.lets-go-shall-we.save.v1';
export const EMPTY_SAVE: SaveData = { version: 1, bank: [], character: null, run: null };

export function loadSave(storage: Pick<Storage, 'getItem'> = localStorage): SaveData {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY_SAVE);
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== 1 || !Array.isArray(parsed.bank)) throw new Error('Unsupported save');
    if (parsed.run) parsed.run.visitedSceneIds ??= [parsed.run.sceneId];
    parsed.mostRecentScenarioId ??= null;
    return parsed;
  } catch {
    return structuredClone(EMPTY_SAVE);
  }
}

export function saveGame(state: SaveData, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(KEY, JSON.stringify(state));
}

export { KEY as SAVE_KEY };
