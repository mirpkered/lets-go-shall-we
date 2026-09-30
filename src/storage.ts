import type { SaveData } from './types';
import { getScenario } from './scenarios';
import { pickRunRandomSelections } from './engine';

const KEY = 'mirpworks.lets-go-shall-we.save.v1';
export const EMPTY_SAVE: SaveData = { version: 1, bank: [], character: null, run: null };

export function loadSave(storage: Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>> = localStorage): SaveData {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY_SAVE);
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== 1 || !Array.isArray(parsed.bank)) throw new Error('Unsupported save');
    if (parsed.character) parsed.character.historyFlags ??= [];
    if (parsed.run) {
      // Pre-clock active saves resume at a safe zero; real-world elapsed time never counts.
      parsed.run.elapsedMinutes = Number.isFinite(parsed.run.elapsedMinutes) ? Math.max(0, Math.floor(parsed.run.elapsedMinutes!)) : 0;
      parsed.run.visitedSceneIds ??= [parsed.run.sceneId];
      const scenario = getScenario(parsed.run.scenarioId);
      if (scenario?.runRandomSelections?.length && !parsed.run.randomSelections) {
        parsed.run.randomSelections = pickRunRandomSelections(scenario);
        storage.setItem?.(KEY, JSON.stringify(parsed));
      }
      if (parsed.run.status === 'active' && parsed.run.scenarioId === 'broken-bell' && scenario && !scenario.scenes[parsed.run.sceneId]) {
        parsed.run.sceneId = 'legacyResume';
        parsed.run.visitedSceneIds = [...new Set([...parsed.run.visitedSceneIds, 'legacyResume'])];
        parsed.run.message = 'Your earlier search is preserved. Continue from the passage below the chapel.';
      }
      if (parsed.run.scenarioId === 'broken-bell' && parsed.run.visitedSceneIds.includes('priestAfterHound')) {
        parsed.run.flags = [...new Set([...parsed.run.flags, 'foundPriest'])];
      }
    }
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
