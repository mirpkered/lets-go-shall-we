import type { SaveData } from './types';
import { getScenario } from './scenarios';
import { countQualifyingStoryTransitions, pickRunRandomSelections } from './engine';
import { CATEGORY_HISTORY_WINDOW, primaryScenarioCategory, RECENT_SCENARIO_WINDOW } from './scenarioSelection';
import { scenarioRiskTier, RISK_TIERS } from './riskClassification';
import { inventoryClass, ITEMS, STARTING_ITEMS } from './items';
import type { ItemCondition, PersistentItemState } from './types';

const KEY = 'mirpworks.lets-go-shall-we.save.v1';
export const QA_SAVE_KEY = 'mirpworks.lets-go-shall-we.qa.v1';
export const EMPTY_SAVE: SaveData = { version: 1, bank: [], itemStates: {}, character: null, run: null };

export function loadSave(storage: Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>> = localStorage, key = KEY): SaveData {
  try {
    const raw = storage.getItem(key);
    if (!raw) return structuredClone(EMPTY_SAVE);
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== 1 || !Array.isArray(parsed.bank)) throw new Error('Unsupported save');
    let migrated = false;
    if (!parsed.itemStates || typeof parsed.itemStates !== 'object' || Array.isArray(parsed.itemStates)) { parsed.itemStates = {}; migrated = true; }
    const validConditions: ItemCondition[] = ['NORMAL', 'DAMAGED', 'BROKEN'];
    for (const [itemId, rawState] of Object.entries(parsed.itemStates)) {
      const item = ITEMS[itemId];
      if (!item?.carryable || !rawState || typeof rawState !== 'object') { delete parsed.itemStates[itemId]; migrated = true; continue; }
      const allowed = new Set(item.upgrades?.map(({ id }) => id) ?? []);
      const upgrades = (Array.isArray(rawState.upgrades) ? rawState.upgrades : []).filter((upgrade, index, all) => upgrade && allowed.has(upgrade.id) && all.findIndex((candidate) => candidate?.id === upgrade.id) === index).slice(0, item.maxUpgrades ?? 2);
      const normalized: PersistentItemState = {
        condition: validConditions.includes(rawState.condition) ? rawState.condition : 'NORMAL',
        upgrades,
        provenance: [...new Set(Array.isArray(rawState.provenance) ? rawState.provenance.filter((entry): entry is string => typeof entry === 'string') : [])],
      };
      if (JSON.stringify(normalized) !== JSON.stringify(rawState)) migrated = true;
      parsed.itemStates[itemId] = normalized;
    }
    if (parsed.character) {
      parsed.character.historyFlags ??= [];
      if (!Array.isArray(parsed.character.ownedAssets)) { parsed.character.ownedAssets = []; migrated = true; }
      if (!parsed.character.supplies || typeof parsed.character.supplies !== 'object' || Array.isArray(parsed.character.supplies)) { parsed.character.supplies = {}; migrated = true; }
      else for (const [id, quantity] of Object.entries(parsed.character.supplies)) {
        if (inventoryClass(id) === 'SUPPLY' && (!Number.isInteger(quantity) || quantity < 0 || quantity > (ITEMS[id]?.stackLimit ?? 0))) { delete parsed.character.supplies[id]; migrated = true; }
        else if (inventoryClass(id) === 'SUPPLY' && quantity === 0) { delete parsed.character.supplies[id]; migrated = true; }
      }
      if (!Number.isFinite(parsed.character.adventuresCompleted)) { parsed.character.adventuresCompleted = 0; migrated = true; }
      if (!Array.isArray(parsed.character.scenarioCategoryHistory)) {
        const activeScenario = parsed.run?.status === 'active' && !parsed.run.qaMode ? getScenario(parsed.run.scenarioId) : undefined;
        parsed.character.scenarioCategoryHistory = activeScenario ? [primaryScenarioCategory(activeScenario)] : [];
        migrated = true;
      }
      else {
        const categories = parsed.character.scenarioCategoryHistory.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0).slice(0, CATEGORY_HISTORY_WINDOW);
        if (JSON.stringify(categories) !== JSON.stringify(parsed.character.scenarioCategoryHistory)) migrated = true;
        parsed.character.scenarioCategoryHistory = categories;
      }
      if (!parsed.character.scenarioPlayCounts || typeof parsed.character.scenarioPlayCounts !== 'object' || Array.isArray(parsed.character.scenarioPlayCounts)) { parsed.character.scenarioPlayCounts = {}; migrated = true; }
      else for (const [id, count] of Object.entries(parsed.character.scenarioPlayCounts)) {
        if (!Number.isInteger(count) || count < 0) { delete parsed.character.scenarioPlayCounts[id]; migrated = true; }
      }
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
      if (!parsed.run.supplies || typeof parsed.run.supplies !== 'object' || Array.isArray(parsed.run.supplies)) { parsed.run.supplies = structuredClone(parsed.character?.supplies ?? {}); migrated = true; }
      if (!parsed.run.startingSupplies || typeof parsed.run.startingSupplies !== 'object' || Array.isArray(parsed.run.startingSupplies)) { parsed.run.startingSupplies = structuredClone(parsed.run.supplies); migrated = true; }
      parsed.run.visitedSceneIds ??= [parsed.run.sceneId];
      parsed.run.flags ??= [];
      if (!Array.isArray(parsed.run.startingCarriedItems)) { parsed.run.startingCarriedItems = parsed.character ? [...new Set([...(parsed.character.carriedItems ?? []), ...(parsed.character.carriedItem ? [parsed.character.carriedItem] : [])])] : []; migrated = true; }
      if (!parsed.run.startingItemStates || typeof parsed.run.startingItemStates !== 'object') {
        const tracked = [...new Set([...STARTING_ITEMS, ...(parsed.run.startingCarriedItems ?? [])])];
        parsed.run.startingItemStates = Object.fromEntries(tracked.map((id) => [id, structuredClone(parsed.itemStates?.[id] ?? { condition: 'NORMAL', upgrades: [], provenance: [] })]));
        migrated = true;
      }
      if (!Number.isFinite(parsed.run.startingMoney)) { parsed.run.startingMoney = parsed.character?.money ?? 0; migrated = true; }
      if (!parsed.run.inventorySources || typeof parsed.run.inventorySources !== 'object') {
        const carried = new Set(parsed.run.startingCarriedItems);
        parsed.run.inventorySources = Object.fromEntries((parsed.run.inventory ?? []).map((id) => [id, carried.has(id) ? 'carried' : ['smallKnife', 'lantern'].includes(id) ? 'starting' : 'temporary']));
        migrated = true;
      }
      if (parsed.run.status !== 'active' && parsed.run.completionCountRecorded === undefined) {
        // Older versions already evaluated endings at the time; never award progression retroactively.
        parsed.run.completionCountRecorded = true;
        migrated = true;
      }
      if (parsed.run.status !== 'active' && parsed.run.authoredEndingRecorded === undefined) {
        // Legacy terminal saves already handled their ending/global queue; do not replay it during migration.
        parsed.run.authoredEndingRecorded = true;
        migrated = true;
      }
      const scenario = getScenario(parsed.run.scenarioId);
      if (!parsed.run.riskTier && scenario) { parsed.run.riskTier = scenarioRiskTier(scenario); migrated = true; }
      if (!Number.isFinite(parsed.run.qualifyingStoryTransitions)) {
        parsed.run.qualifyingStoryTransitions = scenario
          ? countQualifyingStoryTransitions(scenario, parsed.run.visitedSceneIds)
          : 0;
        migrated = true;
      }
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
    if (parsed.recentRiskHistory !== undefined) {
      const history = (Array.isArray(parsed.recentRiskHistory) ? parsed.recentRiskHistory : []).filter((entry) => entry && typeof entry.scenarioId === 'string' && RISK_TIERS.includes(entry.tier)).slice(0, 8);
      if (JSON.stringify(history) !== JSON.stringify(parsed.recentRiskHistory)) migrated = true;
      parsed.recentRiskHistory = history;
    }
    if (Array.isArray(parsed.recentEasterEggIds)) parsed.recentEasterEggIds = [...new Set(parsed.recentEasterEggIds.filter((id): id is string => typeof id === 'string'))].slice(0, 6);
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
