import { inventoryClass, ITEMS, STARTING_ITEMS } from './items';
import { BANK_CAPACITY } from './bank';
import type { Character, Choice, Effects, InventorySource, ItemCondition, PersistentItemState, RecentRiskEntry, Requirement, RunState, SaveData, Scenario, TimePhase, TravelerContact, TravelerFavor } from './types';
import { CATEGORY_HISTORY_WINDOW, primaryScenarioCategory, RECENT_SCENARIO_WINDOW } from './scenarioSelection';
import { scenarioRiskTier } from './riskClassification';
import { RECENT_EASTER_EGG_WINDOW, rollEasterEgg } from './easterEggs';
import type { EasterEgg } from './easterEggs';

export function newCharacter(name = 'The Traveler'): Character {
  return { id: crypto.randomUUID(), name, health: 10, maxHealth: 10, money: 0, carriedItem: null, carriedItems: [], lore: [], knowledge: [], adventuresCompleted: 0, quickExitCreditRemainder: 0, quickExitEndingIds: [], historyFlags: [], scenarioCategoryHistory: [], scenarioPlayCounts: {}, ownedAssets: [], supplies: {}, contacts: [], favors: [] };
}

export function getCarriedItems(character: Character | null | undefined): string[] {
  if (!character) return [];
  return [...new Set([...(Array.isArray(character.carriedItems) ? character.carriedItems : []), ...(character.carriedItem ? [character.carriedItem] : [])])];
}

export function setCarriedItems(character: Character, items: string[]): void {
  character.carriedItems = [...new Set(items)];
  character.carriedItem = character.carriedItems[0] ?? null;
}

export function carryCapacity(adventuresCompleted = 0): number {
  return adventuresCompleted >= 20 ? 3 : adventuresCompleted >= 10 ? 2 : 1;
}

export const gearCapacity = carryCapacity;
export const SUPPLY_STACK_CAPACITY = 4;
/** A soft reminder only; relics are rare and never block a story reward. */
export const RELIC_SOFT_CAPACITY = 3;

export function getCarriedGearItems(character: Character | null | undefined): string[] {
  return getCarriedItems(character).filter((id) => inventoryClass(id) === 'GEAR');
}

export function getCarriedRelics(character: Character | null | undefined): string[] {
  return getCarriedItems(character).filter((id) => inventoryClass(id) === 'RELIC');
}

export function supplyQuantity(character: Character | null | undefined, supplyId: string): number {
  return Math.max(0, Math.floor(character?.supplies?.[supplyId] ?? 0));
}

export function supplyStackCount(character: Character | null | undefined): number {
  return Object.entries(character?.supplies ?? {}).filter(([id, quantity]) => inventoryClass(id) === 'SUPPLY' && quantity > 0).length;
}

export function hasSupply(character: Character | null | undefined, supplyId: string, quantity = 1): boolean {
  return inventoryClass(supplyId) === 'SUPPLY' && supplyQuantity(character, supplyId) >= quantity;
}

export function hasGear(state: SaveData, itemId: string): boolean {
  return inventoryClass(itemId) === 'GEAR' && !!state.run?.inventory.includes(itemId);
}

export function hasRelic(state: SaveData, itemId: string): boolean {
  return inventoryClass(itemId) === 'RELIC' && !!state.run?.inventory.includes(itemId);
}

export function hasTemporaryEquipment(state: SaveData, itemId: string): boolean {
  const run = state.run;
  return !!run?.inventory.includes(itemId) && ['temporary', 'borrowed', 'supplied'].includes(run.inventorySources?.[itemId] ?? 'temporary');
}

export function hasOwnedAsset(state: SaveData, assetId: string): boolean {
  return !!state.character?.ownedAssets?.some(({ id }) => id === assetId);
}

export function hasContact(character: Character | null | undefined, contactId: string): boolean {
  return !!character?.contacts?.some(({ id }) => id === contactId);
}

export function hasFavor(character: Character | null | undefined, favorId: string): boolean {
  return !!character?.favors?.some(({ id, status }) => id === favorId && status === 'available');
}

/** Stable IDs are idempotent; the first authored record remains canonical. */
export function grantContact(state: SaveData, contact: TravelerContact): SaveData {
  const next = structuredClone(state);
  if (!next.character) return next;
  next.character.contacts ??= [];
  if (!next.character.contacts.some(({ id }) => id === contact.id)) next.character.contacts.push(structuredClone(contact));
  return next;
}

/** Favor IDs are single-use records; re-granting an existing ID never stacks or refreshes it. */
export function grantFavor(state: SaveData, favor: TravelerFavor): SaveData {
  const next = structuredClone(state);
  if (!next.character) return next;
  next.character.favors ??= [];
  if (!next.character.favors.some(({ id }) => id === favor.id)) next.character.favors.push(structuredClone(favor));
  return next;
}

/** Consumes only an available Favor and retains its associated Contact and consumed record. */
export function consumeFavor(state: SaveData, favorId: string): SaveData {
  const next = structuredClone(state);
  const favor = next.character?.favors?.find(({ id, status }) => id === favorId && status === 'available');
  if (favor) {
    favor.status = 'consumed';
    if (next.run) next.run.message = `Favor used: ${favor.description}.`;
  }
  return next;
}

function supplyFits(character: Character, supplyId: string, quantity: number): boolean {
  const item = ITEMS[supplyId];
  if (inventoryClass(supplyId) !== 'SUPPLY' || !Number.isInteger(quantity) || quantity < 1) return false;
  const current = supplyQuantity(character, supplyId);
  const stackLimit = item.stackLimit ?? 1;
  return current > 0
    ? current + quantity <= stackLimit
    : supplyStackCount(character) < SUPPLY_STACK_CAPACITY && quantity <= stackLimit;
}

/** Adds atomically; a full stack/pouch leaves state untouched for an explicit decline/replace decision. */
export function addSupply(state: SaveData, supplyId: string, quantity = 1): SaveData {
  const next = structuredClone(state);
  if (!next.character || !supplyFits(next.character, supplyId, quantity)) return next;
  next.character.supplies ??= {};
  next.character.supplies[supplyId] = supplyQuantity(next.character, supplyId) + quantity;
  if (next.run) next.run.supplies = structuredClone(next.character.supplies);
  return next;
}

export function consumeSupply(state: SaveData, supplyId: string, quantity = 1): SaveData {
  const next = structuredClone(state);
  if (!next.character || !Number.isInteger(quantity) || quantity < 1 || !hasSupply(next.character, supplyId, quantity)) return next;
  next.character.supplies ??= {};
  const remaining = supplyQuantity(next.character, supplyId) - quantity;
  if (remaining) next.character.supplies[supplyId] = remaining;
  else delete next.character.supplies[supplyId];
  if (next.run) {
    next.run.supplies = structuredClone(next.character.supplies);
    next.run.supplyNotice = `You use ${quantity} ${ITEMS[supplyId].name}${quantity === 1 ? '' : ' pieces'}. ${ITEMS[supplyId].name}: ${remaining + quantity} → ${remaining}.`;
  }
  return next;
}

export function setSupplyQuantity(state: SaveData, supplyId: string, quantity: number): SaveData {
  const next = structuredClone(state);
  if (!next.character || inventoryClass(supplyId) !== 'SUPPLY' || !Number.isInteger(quantity) || quantity < 0) return next;
  const old = supplyQuantity(next.character, supplyId);
  if (quantity === 0) { if (next.character.supplies) delete next.character.supplies[supplyId]; }
  else if (quantity <= (ITEMS[supplyId].stackLimit ?? 1) && (old > 0 || supplyStackCount(next.character) < SUPPLY_STACK_CAPACITY)) {
    next.character.supplies ??= {}; next.character.supplies[supplyId] = quantity;
  }
  if (next.run) next.run.supplies = structuredClone(next.character.supplies ?? {});
  return next;
}

export function pickRunRandomSelections(scenario: Scenario, random = Math.random): Record<string, string> {
  return Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => {
    const total = values.reduce((sum, entry) => sum + Math.max(0, entry.weight ?? 1), 0);
    let point = Math.min(0.999999999, Math.max(0, random())) * total;
    const selected = values.find((entry) => (point -= Math.max(0, entry.weight ?? 1)) < 0) ?? values.at(-1);
    return [id, selected?.value ?? ''];
  }));
}

export function itemState(state: SaveData, itemId: string): PersistentItemState {
  return structuredClone(state.itemStates?.[itemId] ?? { condition: 'NORMAL', upgrades: [], provenance: [] });
}

export function itemCondition(state: SaveData, itemId: string): ItemCondition {
  return state.itemStates?.[itemId]?.condition ?? 'NORMAL';
}

export function hasItem(state: SaveData, itemId: string): boolean {
  return !!state.run?.inventory.includes(itemId) || getCarriedItems(state.character).includes(itemId) || state.bank.includes(itemId);
}

export function hasUpgrade(state: SaveData, itemId: string, upgradeId: string): boolean {
  return !!state.itemStates?.[itemId]?.upgrades.some((upgrade) => upgrade.id === upgradeId);
}

function mutateItemState(state: SaveData, itemId: string, mutate: (record: PersistentItemState) => void): void {
  const record = itemState(state, itemId);
  mutate(record);
  (state.itemStates ??= {})[itemId] = record;
}

export function setItemCondition(state: SaveData, itemId: string, condition: ItemCondition): SaveData {
  const next = structuredClone(state);
  if (!ITEMS[itemId]?.carryable || !hasItem(next, itemId)) return next;
  mutateItemState(next, itemId, (record) => { record.condition = condition; });
  return next;
}

export function damageItem(state: SaveData, itemId: string): SaveData {
  const current = itemCondition(state, itemId);
  return setItemCondition(state, itemId, current === 'NORMAL' ? 'DAMAGED' : current === 'DAMAGED' ? 'BROKEN' : 'BROKEN');
}

export function breakItem(state: SaveData, itemId: string): SaveData { return setItemCondition(state, itemId, 'BROKEN'); }

export function repairItem(state: SaveData, itemId: string, provenance?: string): SaveData {
  const next = structuredClone(state);
  if (!ITEMS[itemId]?.carryable || !hasItem(next, itemId)) return next;
  mutateItemState(next, itemId, (record) => { record.condition = 'NORMAL'; if (provenance) record.provenance = addUnique(record.provenance, [provenance]); });
  return next;
}

export function addUpgrade(state: SaveData, itemId: string, upgradeId: string, provenance?: string): SaveData {
  const next = structuredClone(state);
  const item = ITEMS[itemId];
  const definition = item?.upgrades?.find((upgrade) => upgrade.id === upgradeId);
  if (!item?.carryable || !definition || !hasItem(next, itemId) || itemCondition(next, itemId) === 'BROKEN') return next;
  mutateItemState(next, itemId, (record) => {
    const existing = record.upgrades.find((upgrade) => upgrade.id === upgradeId);
    if (existing) return;
    const retained = definition.group ? record.upgrades.filter((upgrade) => ITEMS[itemId].upgrades?.find((candidate) => candidate.id === upgrade.id)?.group !== definition.group) : record.upgrades;
    if (retained.length >= (item.maxUpgrades ?? 2)) return;
    record.upgrades = [...retained, { id: upgradeId, ...(provenance ? { provenance } : {}) }];
    if (provenance) record.provenance = addUnique(record.provenance, [provenance]);
  });
  return next;
}

export function removeUpgrade(state: SaveData, itemId: string, upgradeId: string): SaveData {
  const next = structuredClone(state);
  if (!hasItem(next, itemId)) return next;
  mutateItemState(next, itemId, (record) => { record.upgrades = record.upgrades.filter((upgrade) => upgrade.id !== upgradeId); });
  return next;
}

export function replaceItem(state: SaveData, oldItemId: string, newItemId: string, provenance?: string): SaveData {
  const next = structuredClone(state);
  const activelyOwned = !!next.run?.inventory.includes(oldItemId) || getCarriedItems(next.character).includes(oldItemId);
  if (!ITEMS[oldItemId]?.carryable || !ITEMS[newItemId]?.carryable || inventoryClass(oldItemId) !== inventoryClass(newItemId) || !activelyOwned || hasItem(next, newItemId)) return next;
  const run = next.run;
  if (run?.inventory.includes(oldItemId)) {
    run.inventory = run.inventory.map((id) => id === oldItemId ? newItemId : id);
    run.inventorySources ??= {};
    run.inventorySources[newItemId] = 'found';
  }
  if (run?.acquiredThisRun.includes(oldItemId)) run.acquiredThisRun = run.acquiredThisRun.map((id) => id === oldItemId ? newItemId : id);
  if (next.character && getCarriedItems(next.character).includes(oldItemId)) setCarriedItems(next.character, getCarriedItems(next.character).map((id) => id === oldItemId ? newItemId : id));
  const oldState = itemState(next, oldItemId);
  delete next.itemStates?.[oldItemId];
  const compatibleUpgrades = oldState.upgrades.filter(({ id }) => ITEMS[newItemId].upgrades?.some((upgrade) => upgrade.id === id));
  next.itemStates ??= {};
  next.itemStates[newItemId] = { ...oldState, condition: 'NORMAL', upgrades: compatibleUpgrades, provenance: addUnique(oldState.provenance, provenance ? [provenance] : []) };
  return next;
}

export function startRun(character: Character, scenario: Scenario, random = Math.random, itemStates: SaveData['itemStates'] = {}): RunState {
  const inventory = [...STARTING_ITEMS];
  const carriedItems = getCarriedItems(character);
  inventory.push(...carriedItems);
  const inventorySources: Record<string, InventorySource> = Object.fromEntries(inventory.map((id) => [id, 'starting' as const]));
  for (const id of carriedItems) inventorySources[id] = 'carried';
  const randomSelections = pickRunRandomSelections(scenario, random);
  const trackedAtStart = [...new Set([...STARTING_ITEMS, ...carriedItems])];
  return { runId: crypto.randomUUID(), scenarioId: scenario.id, riskTier: scenarioRiskTier(scenario), sceneId: scenario.startScene, health: character.maxHealth, inventory, inventorySources, startingMoney: character.money, startingCarriedItems: carriedItems, startingItemStates: Object.fromEntries(trackedAtStart.map((id) => [id, structuredClone(itemStates?.[id] ?? { condition: 'NORMAL', upgrades: [], provenance: [] })])), startingSupplies: structuredClone(character.supplies ?? {}), supplies: structuredClone(character.supplies ?? {}), acquiredThisRun: [], flags: [], visitedSceneIds: [scenario.startScene], qualifyingStoryTransitions: 0, randomSelections, status: 'active', message: null, startedAt: Date.now(), elapsedMinutes: 0, ...(scenario.saveVersion === undefined ? {} : { scenarioSaveVersion: scenario.saveVersion }) };
}

export function countQualifyingStoryTransitions(scenario: Scenario, visitedSceneIds: string[] | undefined): number {
  if (!Array.isArray(visitedSceneIds) || visitedSceneIds.length < 2) return 0;
  return visitedSceneIds.slice(1).filter((sceneId) => {
    const scene = scenario.scenes[sceneId];
    return !!scene && scene.countsForProgression !== false;
  }).length;
}

export function startAdventure(state: SaveData, scenario: Scenario, random = Math.random, qaMode = false): SaveData {
  if (state.run?.status === 'active') return state;
  const next = structuredClone(state);
  next.character ??= newCharacter();
  next.run = startRun(next.character, scenario, random, next.itemStates);
  if (qaMode) next.run.qaMode = true;
  else {
    next.character.scenarioCategoryHistory = [primaryScenarioCategory(scenario), ...(next.character.scenarioCategoryHistory ?? [])].slice(0, CATEGORY_HISTORY_WINDOW);
    next.character.scenarioPlayCounts ??= {};
  }
  next.mostRecentScenarioId = scenario.id;
  if (!qaMode) tryEasterEggOnSceneEntry(next, scenario, random);
  return next;
}

export function meets(requirement: Requirement | undefined, state: SaveData): boolean {
  if (!requirement) return true;
  const run = state.run;
  const character = state.character;
  if (!run || !character) return false;
  return (!requirement.items || requirement.items.every((id) => run.inventory.includes(id)))
    && (!requirement.usableItems || requirement.usableItems.every((id) => run.inventory.includes(id) && itemCondition(state, id) !== 'BROKEN'))
    && (!requirement.notUsableItems || requirement.notUsableItems.every((id) => !run.inventory.includes(id) || itemCondition(state, id) === 'BROKEN'))
    && (!requirement.anyUsableItems || requirement.anyUsableItems.some((id) => run.inventory.includes(id) && itemCondition(state, id) !== 'BROKEN'))
    && (!requirement.itemConditions || Object.entries(requirement.itemConditions).every(([id, values]) => run.inventory.includes(id) && values.includes(itemCondition(state, id))))
    && (!requirement.itemUpgrades || Object.entries(requirement.itemUpgrades).every(([id, upgrades]) => run.inventory.includes(id) && upgrades.every((upgradeId) => hasUpgrade(state, id, upgradeId))))
    && (!requirement.gear || requirement.gear.every((id) => hasGear(state, id)))
    && (!requirement.usableGear || requirement.usableGear.every((id) => hasGear(state, id) && itemCondition(state, id) !== 'BROKEN'))
    && (!requirement.gearUpgrades || Object.entries(requirement.gearUpgrades).every(([id, upgrades]) => hasGear(state, id) && upgrades.every((upgradeId) => hasUpgrade(state, id, upgradeId))))
    && (!requirement.relics || requirement.relics.every((id) => hasRelic(state, id)))
    && (!requirement.supplies || Object.entries(requirement.supplies).every(([id, quantity]) => inventoryClass(id) === 'SUPPLY' && hasSupply(character, id, quantity)))
    && (!requirement.canAddSupplies || Object.entries(requirement.canAddSupplies).every(([id, quantity]) => supplyFits(character, id, quantity)))
    && (!requirement.contacts || requirement.contacts.every((id) => hasContact(character, id)))
    && (!requirement.favors || requirement.favors.every((id) => hasFavor(character, id)))
    && (!requirement.ownedAssets || requirement.ownedAssets.every((id) => hasOwnedAsset(state, id)))
    && (!requirement.temporaryEquipment || requirement.temporaryEquipment.every((id) => hasTemporaryEquipment(state, id)))
    && (!requirement.notItemUpgrades || Object.entries(requirement.notItemUpgrades).every(([id, upgrades]) => upgrades.every((upgradeId) => !hasUpgrade(state, id, upgradeId))))
    && (!requirement.notItems || requirement.notItems.every((id) => !run.inventory.includes(id)))
    && (!requirement.anyItems || requirement.anyItems.some((id) => run.inventory.includes(id)))
    && (!requirement.flags || requirement.flags.every((id) => run.flags.includes(id)))
    && (!requirement.notFlags || requirement.notFlags.every((id) => !run.flags.includes(id)))
    && (!requirement.knowledge || requirement.knowledge.every((id) => character.knowledge.includes(id)))
    && (!requirement.notKnowledge || requirement.notKnowledge.every((id) => !character.knowledge.includes(id)))
    && (!requirement.historyFlags || requirement.historyFlags.every((id) => (character.historyFlags ?? []).includes(id)))
    && (!requirement.minHealth || run.health >= requirement.minHealth)
    && (requirement.minMoney === undefined || character.money >= requirement.minMoney)
    && (requirement.maxMoney === undefined || character.money <= requirement.maxMoney)
    && (requirement.minElapsedMinutes === undefined || (run.elapsedMinutes ?? 0) >= requirement.minElapsedMinutes)
    && (requirement.maxElapsedMinutes === undefined || (run.elapsedMinutes ?? 0) <= requirement.maxElapsedMinutes)
    && (!requirement.selections || Object.entries(requirement.selections).every(([key, value]) => run.randomSelections?.[key] === value));
}

export function timeStatus(scenario: Scenario, elapsedMinutes = 0): { elapsedMinutes: number; phase: TimePhase | null; nextThreshold: number | null } {
  const phases = [...(scenario.timePhases ?? [])].sort((a, b) => a.atMinutes - b.atMinutes);
  const phase = phases.filter((entry) => elapsedMinutes >= entry.atMinutes).at(-1) ?? phases[0] ?? null;
  const nextThreshold = phases.find((entry) => entry.atMinutes > elapsedMinutes)?.atMinutes ?? null;
  return { elapsedMinutes, phase, nextThreshold };
}

export function sceneText(scene: Scenario['scenes'][string], state: SaveData): string {
  const text = runText(scene.textVariants?.find((variant) => meets(variant.requirements, state))?.text ?? scene.text, state);
  const event = state.run?.easterEggEvent;
  return event?.sceneId === scene.id ? `${text} ${event.text}` : text;
}

function tryEasterEggOnSceneEntry(state: SaveData, scenario: Scenario, random = Math.random): void {
  const run = state.run;
  const scene = run && scenario.scenes[run.sceneId];
  if (!run || run.status !== 'active' || run.qaMode || run.qaEasterEggDisabled || run.easterEggEvent || !scene?.easterEggContext) return;
  const egg = rollEasterEgg(scene.easterEggContext, state.recentEasterEggIds ?? [], random);
  if (!egg) return;
  run.easterEggEvent = { id: egg.id, sceneId: scene.id, text: egg.text };
  state.recentEasterEggIds = [egg.id, ...(state.recentEasterEggIds ?? []).filter((id) => id !== egg.id)].slice(0, RECENT_EASTER_EGG_WINDOW);
}

export function forceQaEasterEgg(state: SaveData, egg: EasterEgg): SaveData {
  const next = structuredClone(state);
  if (!next.run || next.run.status !== 'active' || !next.run.qaMode) return next;
  next.run.qaEasterEggDisabled = false;
  next.run.easterEggEvent = { id: egg.id, sceneId: next.run.sceneId, text: egg.text };
  return next;
}

export function runText(text: string, state: SaveData): string {
  return text.replace(/\{\{([\w-]+)\}\}/g, (_match, key: string) => state.run?.randomSelections?.[key] ?? '');
}

const addUnique = (target: string[], values: string[] = []) => [...new Set([...target, ...values])];
const without = (target: string[], values: string[] = []) => target.filter((value) => !values.includes(value));

function applyEffects(state: SaveData, effects: Effects = {}): void {
  const run = state.run;
  const character = state.character;
  if (!run || !character) return;
  if (effects.consumeSupplies) for (const [id, quantity] of Object.entries(effects.consumeSupplies)) {
    if (inventoryClass(id) !== 'SUPPLY' || !Number.isInteger(quantity) || quantity < 1 || !hasSupply(character, id, quantity)) continue;
    const before = supplyQuantity(character, id);
    const remaining = before - quantity;
    if (remaining) (character.supplies ??= {})[id] = remaining;
    else if (character.supplies) delete character.supplies[id];
    run.supplyNotice = `You use ${quantity} ${ITEMS[id].name}${quantity === 1 ? '' : ' pieces'}. ${ITEMS[id].name}: ${before} → ${remaining}.`;
  }
  if (effects.gainSupplies) {
    const projected = structuredClone(character);
    let fits = true;
    for (const [id, quantity] of Object.entries(effects.gainSupplies)) {
      if (!supplyFits(projected, id, quantity)) { fits = false; break; }
      projected.supplies ??= {};
      projected.supplies[id] = supplyQuantity(projected, id) + quantity;
    }
    if (fits) {
      character.supplies = projected.supplies;
      run.supplyRewarded = true;
      run.supplyNotice = `Supplies received: ${Object.entries(effects.gainSupplies).map(([id, quantity]) => `${ITEMS[id].name} ×${quantity}`).join(', ')}.`;
    } else run.supplyNotice = 'Your supply pouch is full or a stack is at its limit; the offered supplies remain with the giver.';
  }
  run.supplies = structuredClone(character.supplies ?? {});
  if (effects.health) run.health = Math.max(0, Math.min(character.maxHealth, run.health + effects.health));
  if (effects.money) character.money = Math.max(0, character.money + effects.money);
  if (effects.loseMoney) character.money = 0;
  if (effects.loseCarriedItem && getCarriedItems(character).length) {
    const [lostItem, ...remaining] = getCarriedItems(character);
    run.inventory = without(run.inventory, [lostItem]);
    setCarriedItems(character, remaining);
    if (!state.bank.includes(lostItem)) delete state.itemStates?.[lostItem];
  }
  if (effects.loseCarriedItems) {
    const lostItems = getCarriedItems(character);
    run.inventory = without(run.inventory, lostItems);
    setCarriedItems(character, []);
    for (const id of lostItems) if (!state.bank.includes(id)) delete state.itemStates?.[id];
  }
  if (effects.gainItems) {
    const physical = effects.gainItems.filter((id) => inventoryClass(id) !== 'SUPPLY');
    run.inventory = addUnique(run.inventory, physical);
    run.acquiredThisRun = addUnique(run.acquiredThisRun, physical);
    for (const id of physical) (run.inventorySources ??= {})[id] = effects.inventorySources?.[id] ?? (ITEMS[id]?.carryable ? 'found' : 'temporary');
    for (const id of effects.gainItems.filter((itemId) => inventoryClass(itemId) === 'SUPPLY')) {
      const projected = addSupply(state, id, 1);
      if (projected.character?.supplies?.[id] !== character.supplies?.[id]) {
        character.supplies = projected.character?.supplies ?? {};
        run.supplies = structuredClone(character.supplies);
        run.supplyRewarded = true;
        run.supplyNotice = `Received 1 ${ITEMS[id].name}.`;
      } else run.supplyNotice = 'Your supply pouch is full or this stack is at its limit; the offered supply remains with the giver.';
    }
  }
  if (effects.loseItems) {
    const physical = effects.loseItems.filter((id) => inventoryClass(id) !== 'SUPPLY');
    run.inventory = without(run.inventory, physical);
    setCarriedItems(character, getCarriedItems(character).filter((id) => !physical.includes(id)));
    for (const id of physical) if (!state.bank.includes(id)) delete state.itemStates?.[id];
    for (const id of effects.loseItems.filter((itemId) => inventoryClass(itemId) === 'SUPPLY')) if (character.supplies) delete character.supplies[id];
    run.supplies = structuredClone(character.supplies ?? {});
  }
  for (const id of effects.damageItems ?? []) {
    if (!run.inventory.includes(id) || !ITEMS[id]?.carryable) continue;
    mutateItemState(state, id, (record) => { record.condition = record.condition === 'NORMAL' ? 'DAMAGED' : 'BROKEN'; });
  }
  for (const id of effects.breakItems ?? []) if (run.inventory.includes(id) && ITEMS[id]?.carryable) mutateItemState(state, id, (record) => { record.condition = 'BROKEN'; });
  for (const id of effects.repairItems ?? []) if (run.inventory.includes(id) && ITEMS[id]?.carryable) mutateItemState(state, id, (record) => {
    record.condition = 'NORMAL';
    const source = effects.repairItemProvenance?.[id];
    if (source) record.provenance = addUnique(record.provenance, [source]);
  });
  for (const upgrade of effects.addItemUpgrades ?? []) {
    if (!run.inventory.includes(upgrade.itemId) || !ITEMS[upgrade.itemId]?.upgrades?.some(({ id }) => id === upgrade.upgradeId)) continue;
    const item = ITEMS[upgrade.itemId];
    const definition = item.upgrades!.find(({ id }) => id === upgrade.upgradeId)!;
    mutateItemState(state, upgrade.itemId, (record) => {
      if (record.condition === 'BROKEN' || record.upgrades.some(({ id }) => id === upgrade.upgradeId)) return;
      const retained = definition.group ? record.upgrades.filter(({ id }) => item.upgrades?.find((entry) => entry.id === id)?.group !== definition.group) : record.upgrades;
      if (retained.length >= (item.maxUpgrades ?? 2)) return;
      record.upgrades = [...retained, { id: upgrade.upgradeId, ...(upgrade.provenance ? { provenance: upgrade.provenance } : {}) }];
      if (upgrade.provenance) record.provenance = addUnique(record.provenance, [upgrade.provenance]);
    });
  }
  for (const replacement of effects.replaceItems ?? []) {
    const oldId = replacement.oldItemId;
    const newId = replacement.newItemId;
    if (!run.inventory.includes(oldId) || !ITEMS[oldId]?.carryable || !ITEMS[newId]?.carryable || hasItem(state, newId)) continue;
    const previous = itemState(state, oldId);
    run.inventory = run.inventory.map((id) => id === oldId ? newId : id);
    run.inventorySources ??= {};
    run.inventorySources[newId] = 'found';
    if (run.acquiredThisRun.includes(oldId)) run.acquiredThisRun = run.acquiredThisRun.map((id) => id === oldId ? newId : id);
    if (getCarriedItems(character).includes(oldId)) setCarriedItems(character, getCarriedItems(character).map((id) => id === oldId ? newId : id));
    delete state.itemStates?.[oldId];
    const compatibleUpgrades = previous.upgrades.filter(({ id }) => ITEMS[newId].upgrades?.some((upgrade) => upgrade.id === id));
    (state.itemStates ??= {})[newId] = { ...previous, condition: 'NORMAL', upgrades: compatibleUpgrades, provenance: addUnique(previous.provenance, replacement.provenance ? [replacement.provenance] : []) };
  }
  if (effects.knowledge) character.knowledge = addUnique(character.knowledge, effects.knowledge.map((entry) => runText(entry, state)));
  if (effects.lore) character.lore = addUnique(character.lore, effects.lore.map((entry) => runText(entry, state)));
  if (effects.historyFlags) character.historyFlags = addUnique(character.historyFlags ?? [], effects.historyFlags.map((entry) => runText(entry, state)));
  if (effects.gainOwnedAssets) {
    const assets = character.ownedAssets ??= [];
    for (const asset of effects.gainOwnedAssets) if (!assets.some(({ id }) => id === asset.id)) assets.push({ ...asset });
  }
  if (effects.gainContacts) {
    const contacts = character.contacts ??= [];
    for (const contact of effects.gainContacts) if (!contacts.some(({ id }) => id === contact.id)) contacts.push(structuredClone(contact));
  }
  if (effects.gainFavors) {
    const favors = character.favors ??= [];
    for (const favor of effects.gainFavors) if (!favors.some(({ id }) => id === favor.id)) favors.push(structuredClone(favor));
  }
  if (effects.consumeFavors) for (const favorId of effects.consumeFavors) {
    const favor = character.favors?.find(({ id, status }) => id === favorId && status === 'available');
    if (!favor) continue;
    favor.status = 'consumed';
    run.message = `Favor used: ${favor.description}.`;
  }
  if (effects.setFlags) run.flags = addUnique(run.flags, effects.setFlags);
  if (effects.clearFlags) run.flags = without(run.flags, effects.clearFlags);
}

export function choose(state: SaveData, scenario: Scenario, choice: Choice, random = Math.random): SaveData {
  const next = structuredClone(state);
  if (!next.run || next.run.status !== 'active' || !meets(choice.requirements, next)) return next;
  const originSceneId = next.run.sceneId;
  const actionMinutes = Number.isFinite(choice.timeCost) ? Math.max(0, Math.floor(choice.timeCost!)) : 0;
  next.run.elapsedMinutes = (next.run.elapsedMinutes ?? 0) + actionMinutes;
  next.run.message = null;
  next.run.supplyNotice = undefined;
  applyEffects(next, choice.effects);

  let destination = choice.next;
  if (choice.effects?.combat) {
    const combat = choice.effects.combat;
    const won = random() < combat.winChance;
    applyEffects(next, { health: won ? -(combat.damageOnWin ?? 0) : -combat.damageOnLoss });
    destination = won ? combat.winNext : combat.lossNext;
    next.run.message = runText(won ? `You survive the fight with the ${combat.enemy}.` : `The ${combat.enemy} wounds you. You lose ${combat.damageOnLoss} health.`, next);
  } else if (choice.chance) {
    const bonusItem = choice.chance.bonusItems?.some((item) => next.run!.inventory.includes(item) && itemCondition(next, item) !== 'BROKEN') ?? false;
    const bonusUpgrade = choice.chance.bonusUpgrades?.some(({ itemId, upgradeId }) => next.run!.inventory.includes(itemId) && itemCondition(next, itemId) !== 'BROKEN' && hasUpgrade(next, itemId, upgradeId)) ?? false;
    const bonusFlag = choice.chance.bonusFlags?.some((flag) => next.run!.flags.includes(flag)) ?? false;
    const bonusSelection = Object.entries(choice.chance.bonusSelections ?? {}).some(([key, value]) => next.run!.randomSelections?.[key] === value);
    const penaltySelection = Object.entries(choice.chance.penaltySelections ?? {}).some(([key, value]) => next.run!.randomSelections?.[key] === value);
    const baseProbability = choice.chance.lateAfterMinutes !== undefined && (next.run.elapsedMinutes ?? 0) >= choice.chance.lateAfterMinutes
      ? choice.chance.lateProbability ?? choice.chance.probability
      : choice.chance.probability;
    const probability = Math.max(0.02, Math.min(0.98, baseProbability
      + (bonusItem || bonusUpgrade || bonusFlag || bonusSelection ? choice.chance.bonusProbability ?? 0 : 0)
      - (penaltySelection ? choice.chance.penaltyProbability ?? 0 : 0)));
    const won = random() < probability;
    destination = won ? choice.chance.successNext : choice.chance.failureNext;
    next.run.message = runText(won ? choice.chance.successMessage : choice.chance.failureMessage, next);
    applyEffects(next, won ? choice.chance.successEffects : choice.chance.failureEffects);
  }

  const destinationScene = destination ? scenario.scenes[destination] : undefined;
  if (destinationScene && destination !== next.run.sceneId && destinationScene.countsForProgression !== false) {
    next.run.qualifyingStoryTransitions = Math.max(0, next.run.qualifyingStoryTransitions ?? 0) + 1;
  }

  if (next.run.health <= 0) {
    next.run.status = 'death';
    next.run.sceneId = destination && scenario.scenes[destination]?.ending === 'death' ? destination : '__death';
    next.run.visitedSceneIds = addUnique(next.run.visitedSceneIds ?? [next.run.sceneId], [next.run.sceneId]);
    next.run.completionQualification = scenario.scenes[next.run.sceneId]?.completionQualification;
    recordAuthoredEnding(next, true);
    return next;
  }
  if (destination) {
    if ((next.run.visitedSceneIds ?? []).includes(destination)) {
      const blocked = structuredClone(state);
      blocked.run!.message = 'That moment has already passed. Choose another action to move the story forward.';
      return blocked;
    }
    next.run.sceneId = destination;
    next.run.visitedSceneIds = addUnique(next.run.visitedSceneIds ?? [], [destination]);
  }
  const scene = scenario.scenes[next.run.sceneId];
  if (scene?.ending) next.run.status = scene.ending;
  if (scene?.ending) {
    next.run.completionQualification = scene.ending === 'success' ? scene.completionQualification ?? 'substantive' : scene.completionQualification;
    // Completion and replay history belong to the authored terminal itself,
    // not to the later reward-placement screen. A closed tab after the story
    // has ended must not make a completed adventure disappear from progression.
    recordAuthoredEnding(next, scene.ending === 'death' || scene.ending === 'success');
  }
  else if (destination && destination !== originSceneId) tryEasterEggOnSceneEntry(next, scenario, random);
  return next;
}

function queueGlobalCompletion(state: SaveData): void {
  const run = state.run;
  if (!run || run.qaMode || !run.runId) return;
  state.pendingGlobalCompletions = [...new Set([...(state.pendingGlobalCompletions ?? []), run.runId])];
  run.globalCompletionQueued = true;
}

/** Safely resolves a successful terminal saved by an older build before progression was committed. */
export function resolveSuccessfulEndingProgress(state: SaveData): SaveData {
  const next = structuredClone(state);
  if (next.run?.status === 'success' && next.run.authoredEndingRecorded && !next.run.completionCountRecorded) {
    recordAuthoredEnding(next, true);
  }
  return next;
}

export function failCharacter(state: SaveData): SaveData {
  const next = structuredClone(state);
  if (next.run) { next.mostRecentScenarioId = next.run.scenarioId; recordScenarioEnding(next); }
  retainOnlyBankedItemStates(next);
  next.character = null; next.run = null;
  return next;
}

function retainOnlyBankedItemStates(state: SaveData, additional: string[] = []): void {
  const retained = new Set([...state.bank, ...additional]);
  for (const id of Object.keys(state.itemStates ?? {})) if (!retained.has(id)) delete state.itemStates![id];
}

function recordScenarioEnding(state: SaveData): void {
  const run = state.run;
  if (!run || run.qaMode) return;
  state.mostRecentScenarioId = run.scenarioId;
  state.recentScenarioIds = [run.scenarioId, ...(state.recentScenarioIds ?? []).filter((id) => id !== run.scenarioId)].slice(0, RECENT_SCENARIO_WINDOW);
  if (!run.riskHistoryRecorded && (run.status === 'success' || run.status === 'death')) {
    const entry: RecentRiskEntry = { scenarioId: run.scenarioId, tier: run.riskTier ?? 'LOW' };
    state.recentRiskHistory = [entry, ...(state.recentRiskHistory ?? [])].slice(0, 8);
    run.riskHistoryRecorded = true;
  }
}

function recordAuthoredEnding(state: SaveData, resolveTravelerProgression = false): void {
  const run = state.run;
  if (!run) return;
  if (!run.authoredEndingRecorded) {
    run.authoredEndingRecorded = true;
    if (run.status === 'death' || run.status === 'success') queueGlobalCompletion(state);
    recordScenarioEnding(state);
    if (!run.qaMode && state.character && (run.status === 'success' || run.status === 'death')) {
      state.character.scenarioPlayCounts ??= {};
      state.character.scenarioPlayCounts[run.scenarioId] = Math.max(0, Math.floor(state.character.scenarioPlayCounts[run.scenarioId] ?? 0)) + 1;
    }
  }
  if (run.completionCountRecorded) return;
  if (!resolveTravelerProgression) {
    if (run.status === 'success') run.completionCountRecorded = false;
    return;
  }
  run.completionCountRecorded = true;
  if (run.qaMode || !state.character || !run.authoredEndingRecorded) return;
  if (run.status === 'death') {
    // Preserve the established authored-death completion marker for the ending card;
    // the traveler is then removed by failCharacter, which also discards quick credits.
    if (run.completionQualification === 'substantive') {
      state.character.adventuresCompleted = Math.max(0, state.character.adventuresCompleted ?? 0) + 1;
      if (state.character.adventuresCompleted === 10 || state.character.adventuresCompleted === 20) run.completionMilestoneReached = state.character.adventuresCompleted;
    }
    return;
  }
  if (run.status !== 'success') return;
  if (run.completionQualification === 'nonSubstantive') {
    const endingKey = `${run.scenarioId}:${run.sceneId}`;
    state.character.quickExitEndingIds ??= [];
    if (state.character.quickExitEndingIds.includes(endingKey)) return;
    state.character.quickExitEndingIds.push(endingKey);
    const remainder = Math.max(0, Math.min(2, Math.floor(state.character.quickExitCreditRemainder ?? 0)));
    if (remainder < 2) {
      state.character.quickExitCreditRemainder = (remainder + 1) as 1 | 2;
      return;
    }
    state.character.quickExitCreditRemainder = 0;
  }
  state.character.adventuresCompleted = Math.max(0, state.character.adventuresCompleted ?? 0) + 1;
  if (state.character.adventuresCompleted === 10 || state.character.adventuresCompleted === 20) {
    run.completionMilestoneReached = state.character.adventuresCompleted;
  }
}

export function retireCharacter(state: SaveData): SaveData {
  const next = structuredClone(state);
  retainOnlyBankedItemStates(next);
  next.character = null;
  next.run = null;
  return next;
}

export function finishSuccess(state: SaveData, carriedItems: string | string[] | null): SaveData {
  const next = structuredClone(state);
  if (!next.character) return next;
  next.character.health = next.character.maxHealth;
  const requested = Array.isArray(carriedItems) ? carriedItems : carriedItems ? [carriedItems] : [];
  const eligible = new Set([...eligibleCarryItems(next), ...requested.filter((id) => ITEMS[id]?.carryable)]);
  const selected = [...new Set(requested.filter((id) => eligible.has(id)))];
  if (selected.filter((id) => inventoryClass(id) === 'GEAR').length > gearCapacity(next.character.adventuresCompleted)) return next;
  setCarriedItems(next.character, selected);
  retainOnlyBankedItemStates(next, [...selected, ...STARTING_ITEMS]);
  if (next.run?.status === 'success' && next.run.authoredEndingRecorded) {
    recordAuthoredEnding(next, true);
    // Save the final local reward/progression state before allowing the remote count to flush.
    queueGlobalCompletion(next);
  }
  next.mostRecentScenarioId = next.run?.scenarioId ?? next.mostRecentScenarioId ?? null;
  recordScenarioEnding(next);
  next.run = null;
  return next;
}

export function eligibleCarryItems(state: SaveData): string[] {
  const run = state.run;
  if (!run) return [];
  const candidates = [...new Set([...getCarriedItems(state.character), ...run.acquiredThisRun])];
  return candidates.filter((id) => ITEMS[id]?.carryable && run.inventory.includes(id));
}

export type RewardDestination = 'carry' | 'bank' | 'decline';

export function newRewardItems(state: SaveData): string[] {
  const run = state.run;
  if (!run || run.status !== 'success') return [];
  const alreadyCarried = new Set(getCarriedItems(state.character));
  return [...new Set(run.acquiredThisRun)].filter((id) => ITEMS[id]?.carryable && run.inventory.includes(id) && !alreadyCarried.has(id));
}

/** Opens or safely migrates an older successful run into the persisted per-item reward flow. */
export function openRewardResolution(state: SaveData): SaveData {
  const next = structuredClone(state);
  if (!next.run || next.run.status !== 'success') return next;
  next.run.rewardSelectionOpen = true;
  next.run.rewardPendingItems ??= newRewardItems(next);
  return next;
}

/** Places exactly one newly earned item. Pending removal makes repeat clicks/reloads idempotent. */
export function placeReward(state: SaveData, itemId: string, destination: RewardDestination): SaveData {
  const next = structuredClone(state);
  const run = next.run;
  if (!run || run.status !== 'success') return next;
  run.rewardPendingItems ??= newRewardItems(next);
  if (!run.rewardPendingItems.includes(itemId) || !run.inventory.includes(itemId) || !ITEMS[itemId]?.carryable) return next;

  if (destination === 'carry') {
    if (!next.character) return next;
    const carried = getCarriedItems(next.character);
    if (inventoryClass(itemId) === 'GEAR' && getCarriedGearItems(next.character).length >= gearCapacity(next.character.adventuresCompleted ?? 0)) return next;
    setCarriedItems(next.character, [...carried, itemId]);
  } else if (destination === 'bank') {
    if (next.bank.length >= BANK_CAPACITY || next.bank.includes(itemId)) return next;
    next.bank.push(itemId);
  }

  run.rewardPendingItems = run.rewardPendingItems.filter((id) => id !== itemId);
  return next;
}

/** Completes reward resolution without exposing general Bank management on the ending screen. */
export function finishRewardResolution(state: SaveData): SaveData {
  if (state.run?.status !== 'success' || (state.run.rewardPendingItems?.length ?? 0) > 0) return structuredClone(state);
  return finishSuccess(state, getCarriedItems(state.character));
}

export function depositCarried(state: SaveData, replaceBankItemId?: string, carriedItemId?: string): SaveData {
  const next = structuredClone(state);
  const carried = getCarriedItems(next.character);
  const item = carriedItemId ?? carried[0];
  if (!next.character || !item || !carried.includes(item) || !['GEAR', 'RELIC'].includes(inventoryClass(item)) || next.bank.includes(item)) return next;
  if (next.bank.length > BANK_CAPACITY) return next;
  if (next.bank.length === BANK_CAPACITY) {
    if (!replaceBankItemId) return next;
    const index = next.bank.indexOf(replaceBankItemId);
    if (index < 0) return next;
    const returnedGear = inventoryClass(replaceBankItemId) === 'GEAR' ? 1 : 0;
    const removedGear = inventoryClass(item) === 'GEAR' ? 1 : 0;
    if (getCarriedGearItems(next.character).length - removedGear + returnedGear > gearCapacity(next.character.adventuresCompleted ?? 0)) return next;
    next.bank[index] = item;
    setCarriedItems(next.character, carried.filter((id) => id !== item).concat(replaceBankItemId));
    return next;
  }
  next.bank.push(item);
  setCarriedItems(next.character, carried.filter((id) => id !== item));
  return next;
}

export function withdrawBanked(state: SaveData, itemId: string): SaveData {
  const next = structuredClone(state);
  if (!next.bank.includes(itemId)) return next;
  next.character ??= newCharacter();
  if (inventoryClass(itemId) === 'GEAR' && getCarriedGearItems(next.character).length >= gearCapacity(next.character.adventuresCompleted ?? 0)) return structuredClone(state);
  next.bank = next.bank.filter((id) => id !== itemId);
  setCarriedItems(next.character, [...getCarriedItems(next.character), itemId]);
  return next;
}

export function discardBankItem(state: SaveData, itemId: string): SaveData {
  const index = state.bank.indexOf(itemId);
  if (index < 0) return state;
  const next = structuredClone(state);
  next.bank.splice(index, 1);
  if (!getCarriedItems(next.character).includes(itemId) && !next.run?.inventory.includes(itemId)) delete next.itemStates?.[itemId];
  return next;
}

export function emptyBank(state: SaveData): SaveData {
  if (!state.bank.length) return state;
  const next = structuredClone(state);
  const emptied = new Set(next.bank);
  next.bank = [];
  for (const id of emptied) if (!getCarriedItems(next.character).includes(id) && !next.run?.inventory.includes(id)) delete next.itemStates?.[id];
  return next;
}
