import type { SaveData } from './types';
import { getScenario } from './scenarios';
import { pickRunRandomSelections } from './engine';
import { RECENT_SCENARIO_WINDOW } from './scenarioSelection';

const KEY = 'mirpworks.lets-go-shall-we.save.v1';
export const QA_SAVE_KEY = 'mirpworks.lets-go-shall-we.qa.v1';
export const EMPTY_SAVE: SaveData = { version: 1, bank: [], character: null, run: null };

export function loadSave(storage: Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>> = localStorage, key = KEY): SaveData {
  try {
    const raw = storage.getItem(key);
    if (!raw) return structuredClone(EMPTY_SAVE);
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== 1 || !Array.isArray(parsed.bank)) throw new Error('Unsupported save');
    let migrated = false;
    if (parsed.character) {
      parsed.character.historyFlags ??= [];
      if (!Number.isFinite(parsed.character.adventuresCompleted)) { parsed.character.adventuresCompleted = 0; migrated = true; }
      const carriedItems = [...new Set([...(Array.isArray(parsed.character.carriedItems) ? parsed.character.carriedItems.filter((id): id is string => typeof id === 'string') : []), ...(parsed.character.carriedItem ? [parsed.character.carriedItem] : [])])];
      if (JSON.stringify(carriedItems) !== JSON.stringify(parsed.character.carriedItems ?? [])) migrated = true;
      parsed.character.carriedItems = carriedItems;
      parsed.character.carriedItem = carriedItems[0] ?? null;
    }
    if (parsed.run) {
      if (!parsed.run.runId) {
        parsed.run.runId = crypto.randomUUID();
        storage.setItem?.(key, JSON.stringify(parsed));
      }
      // Pre-clock active saves resume at a safe zero; real-world elapsed time never counts.
      parsed.run.elapsedMinutes = Number.isFinite(parsed.run.elapsedMinutes) ? Math.max(0, Math.floor(parsed.run.elapsedMinutes!)) : 0;
      parsed.run.visitedSceneIds ??= [parsed.run.sceneId];
      parsed.run.flags ??= [];
      if (parsed.run.status !== 'active' && parsed.run.completionCountRecorded === undefined) {
        parsed.run.completionCountRecorded = true;
        if (!parsed.run.qaMode && parsed.character) {
          parsed.character.adventuresCompleted = (parsed.character.adventuresCompleted ?? 0) + 1;
          if (parsed.character.adventuresCompleted === 10 || parsed.character.adventuresCompleted === 20) {
            parsed.run.completionMilestoneReached = parsed.character.adventuresCompleted;
          }
        }
        migrated = true;
      }
      const scenario = getScenario(parsed.run.scenarioId);
      if (scenario?.saveVersion && (parsed.run.scenarioSaveVersion ?? 0) < scenario.saveVersion) {
        // Earlier versions named Silas in the opening, so an active legacy run
        // has already learned his identity even if it has not visited a new
        // identity-reveal scene. Keep that knowledge explicit for gated prose.
        const identityWasEstablished = new Set([
          'arrival', 'hostAccount', 'guestRegister', 'hostConfrontation', 'cellarEntry',
          'cellarIdentity', 'silasFree', 'quietEnding', 'partialEnding',
        ]);
        if (parsed.run.visitedSceneIds.some((sceneId) => identityWasEstablished.has(sceneId))) {
          parsed.run.flags = [...new Set([...parsed.run.flags, 'identifiedSilas'])];
        }
        if (parsed.run.visitedSceneIds.some((sceneId) => ['serviceHall', 'cellarClues', 'cellarEntry', 'cellarIdentity'].includes(sceneId))) {
          parsed.run.flags = [...new Set([...parsed.run.flags, 'knowsCellar'])];
        }
        if (parsed.run.scenarioId === 'hush-now') {
          const oldScene = parsed.run.sceneId;
          const oldRescueScenes = new Set(['personFound', 'braceStrain', 'neighborRescue', 'neighborLiftsNell', 'animalsHeldForLift', 'braceStrainWithHelp']);
          const oldAfterRescueScenes = new Set(['reunited', 'heiferBreaksAway', 'neighborHeiferSearch', 'rewardOffer']);
          parsed.run.sceneId = oldRescueScenes.has(oldScene)
            ? 'legacyRescue'
            : oldAfterRescueScenes.has(oldScene) ? 'legacyAfterRescue' : 'legacyResume';
          parsed.run.visitedSceneIds = [...new Set([...parsed.run.visitedSceneIds, parsed.run.sceneId])];
          // These names were already established in every earlier Hush Now version.
          parsed.run.randomSelections = { ...(parsed.run.randomSelections ?? {}), farmOwner: 'Mara', farmChild: 'Ben', farmhand: 'Nell' };
          parsed.run.message = 'Your earlier Hush Now choices and discoveries are preserved. Continue from this brief transition.';
        }
        parsed.run.scenarioSaveVersion = scenario.saveVersion;
      }
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
    parsed.recentScenarioIds = [...new Set(Array.isArray(parsed.recentScenarioIds) ? parsed.recentScenarioIds.filter((id): id is string => typeof id === 'string') : parsed.run?.qaMode ? [] : parsed.mostRecentScenarioId ? [parsed.mostRecentScenarioId] : [])].slice(0, RECENT_SCENARIO_WINDOW);
    if (migrated) storage.setItem?.(key, JSON.stringify(parsed));
    return parsed;
  } catch {
    return structuredClone(EMPTY_SAVE);
  }
}

export function saveGame(state: SaveData, storage: Pick<Storage, 'setItem'> = localStorage, key = KEY): void {
  storage.setItem(key, JSON.stringify(state));
}

export function loadQaSave(storage?: Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>>): SaveData {
  return loadSave(storage ?? localStorage, QA_SAVE_KEY);
}

export function saveQaGame(state: SaveData, storage?: Pick<Storage, 'setItem'>): void {
  saveGame(state, storage ?? localStorage, QA_SAVE_KEY);
}

export { KEY as SAVE_KEY };
