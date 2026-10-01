import { ITEMS, STARTING_ITEMS } from './items';
import { BANK_CAPACITY } from './bank';
import type { Character, Choice, Effects, InventorySource, Requirement, RunState, SaveData, Scenario, TimePhase } from './types';
import { RECENT_SCENARIO_WINDOW } from './scenarioSelection';
import { RECENT_EASTER_EGG_WINDOW, rollEasterEgg } from './easterEggs';
import type { EasterEgg } from './easterEggs';

export function newCharacter(name = 'The Traveler'): Character {
  return { id: crypto.randomUUID(), name, health: 10, maxHealth: 10, money: 0, carriedItem: null, carriedItems: [], lore: [], knowledge: [], adventuresCompleted: 0, historyFlags: [], ownedAssets: [] };
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

export function pickRunRandomSelections(scenario: Scenario, random = Math.random): Record<string, string> {
  return Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => {
    const total = values.reduce((sum, entry) => sum + Math.max(0, entry.weight ?? 1), 0);
    let point = Math.min(0.999999999, Math.max(0, random())) * total;
    const selected = values.find((entry) => (point -= Math.max(0, entry.weight ?? 1)) < 0) ?? values.at(-1);
    return [id, selected?.value ?? ''];
  }));
}

export function startRun(character: Character, scenario: Scenario, random = Math.random): RunState {
  const inventory = [...STARTING_ITEMS];
  const carriedItems = getCarriedItems(character);
  inventory.push(...carriedItems);
  const inventorySources: Record<string, InventorySource> = Object.fromEntries(inventory.map((id) => [id, 'starting' as const]));
  for (const id of carriedItems) inventorySources[id] = 'carried';
  const randomSelections = pickRunRandomSelections(scenario, random);
  return { runId: crypto.randomUUID(), scenarioId: scenario.id, sceneId: scenario.startScene, health: character.maxHealth, inventory, inventorySources, startingMoney: character.money, startingCarriedItems: carriedItems, acquiredThisRun: [], flags: [], visitedSceneIds: [scenario.startScene], qualifyingStoryTransitions: 0, randomSelections, status: 'active', message: null, startedAt: Date.now(), elapsedMinutes: 0, ...(scenario.saveVersion === undefined ? {} : { scenarioSaveVersion: scenario.saveVersion }) };
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
  next.run = startRun(next.character, scenario);
  if (qaMode) next.run.qaMode = true;
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
  if (effects.health) run.health = Math.max(0, Math.min(character.maxHealth, run.health + effects.health));
  if (effects.money) character.money = Math.max(0, character.money + effects.money);
  if (effects.loseMoney) character.money = 0;
  if (effects.loseCarriedItem && getCarriedItems(character).length) {
    const [lostItem, ...remaining] = getCarriedItems(character);
    run.inventory = without(run.inventory, [lostItem]);
    setCarriedItems(character, remaining);
  }
  if (effects.loseCarriedItems) {
    const lostItems = getCarriedItems(character);
    run.inventory = without(run.inventory, lostItems);
    setCarriedItems(character, []);
  }
  if (effects.gainItems) {
    run.inventory = addUnique(run.inventory, effects.gainItems);
    run.acquiredThisRun = addUnique(run.acquiredThisRun, effects.gainItems);
    for (const id of effects.gainItems) (run.inventorySources ??= {})[id] = effects.inventorySources?.[id] ?? (ITEMS[id]?.carryable ? 'found' : 'temporary');
  }
  if (effects.loseItems) {
    run.inventory = without(run.inventory, effects.loseItems);
    setCarriedItems(character, getCarriedItems(character).filter((id) => !effects.loseItems!.includes(id)));
  }
  if (effects.knowledge) character.knowledge = addUnique(character.knowledge, effects.knowledge.map((entry) => runText(entry, state)));
  if (effects.lore) character.lore = addUnique(character.lore, effects.lore.map((entry) => runText(entry, state)));
  if (effects.historyFlags) character.historyFlags = addUnique(character.historyFlags ?? [], effects.historyFlags.map((entry) => runText(entry, state)));
  if (effects.gainOwnedAssets) {
    const assets = character.ownedAssets ??= [];
    for (const asset of effects.gainOwnedAssets) if (!assets.some(({ id }) => id === asset.id)) assets.push({ ...asset });
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
  applyEffects(next, choice.effects);

  let destination = choice.next;
  if (choice.effects?.combat) {
    const combat = choice.effects.combat;
    const won = random() < combat.winChance;
    applyEffects(next, { health: won ? -(combat.damageOnWin ?? 0) : -combat.damageOnLoss });
    destination = won ? combat.winNext : combat.lossNext;
    next.run.message = runText(won ? `You survive the fight with the ${combat.enemy}.` : `The ${combat.enemy} wounds you. You lose ${combat.damageOnLoss} health.`, next);
  } else if (choice.chance) {
    const bonusItem = choice.chance.bonusItems?.some((item) => next.run!.inventory.includes(item)) ?? false;
    const bonusFlag = choice.chance.bonusFlags?.some((flag) => next.run!.flags.includes(flag)) ?? false;
    const bonusSelection = Object.entries(choice.chance.bonusSelections ?? {}).some(([key, value]) => next.run!.randomSelections?.[key] === value);
    const penaltySelection = Object.entries(choice.chance.penaltySelections ?? {}).some(([key, value]) => next.run!.randomSelections?.[key] === value);
    const baseProbability = choice.chance.lateAfterMinutes !== undefined && (next.run.elapsedMinutes ?? 0) >= choice.chance.lateAfterMinutes
      ? choice.chance.lateProbability ?? choice.chance.probability
      : choice.chance.probability;
    const probability = Math.max(0.02, Math.min(0.98, baseProbability
      + (bonusItem || bonusFlag || bonusSelection ? choice.chance.bonusProbability ?? 0 : 0)
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
    next.run.completionQualification = scene.completionQualification;
    recordAuthoredEnding(next, scene.ending === 'death');
  }
  else if (destination && destination !== originSceneId) tryEasterEggOnSceneEntry(next, scenario, random);
  return next;
}

function queueGlobalCompletion(state: SaveData): void {
  const run = state.run;
  if (!run || run.qaMode || run.globalCompletionQueued || !run.runId) return;
  state.pendingGlobalCompletions = [...new Set([...(state.pendingGlobalCompletions ?? []), run.runId])];
  run.globalCompletionQueued = true;
}

export function failCharacter(state: SaveData): SaveData {
  const next = structuredClone(state);
  if (next.run) { next.mostRecentScenarioId = next.run.scenarioId; recordScenarioEnding(next); }
  next.character = null; next.run = null;
  return next;
}

function recordScenarioEnding(state: SaveData): void {
  const run = state.run;
  if (!run || run.qaMode) return;
  state.mostRecentScenarioId = run.scenarioId;
  state.recentScenarioIds = [run.scenarioId, ...(state.recentScenarioIds ?? []).filter((id) => id !== run.scenarioId)].slice(0, RECENT_SCENARIO_WINDOW);
}

function recordAuthoredEnding(state: SaveData, resolveTravelerProgression = false): void {
  const run = state.run;
  if (!run) return;
  if (!run.authoredEndingRecorded) {
    run.authoredEndingRecorded = true;
    queueGlobalCompletion(state);
    recordScenarioEnding(state);
  }
  if (run.completionCountRecorded) return;
  if (!resolveTravelerProgression) {
    if (run.status === 'success') run.completionCountRecorded = false;
    return;
  }
  run.completionCountRecorded = true;
  if (run.qaMode || !state.character || run.completionQualification === 'nonSubstantive') return;
  const moneyChanged = state.character.money !== (run.startingMoney ?? state.character.money);
  const startingItems = [...new Set(run.startingCarriedItems ?? getCarriedItems(state.character))].sort();
  const endingItems = [...new Set(getCarriedItems(state.character))].sort();
  const inventoryChanged = JSON.stringify(startingItems) !== JSON.stringify(endingItems);
  if (run.completionQualification !== 'substantive' && !moneyChanged && !inventoryChanged) return;
  state.character.adventuresCompleted = Math.max(0, state.character.adventuresCompleted ?? 0) + 1;
  if (state.character.adventuresCompleted === 10 || state.character.adventuresCompleted === 20) {
    run.completionMilestoneReached = state.character.adventuresCompleted;
  }
}

export function retireCharacter(state: SaveData): SaveData {
  return { ...state, character: null, run: null };
}

export function finishSuccess(state: SaveData, carriedItems: string | string[] | null): SaveData {
  const next = structuredClone(state);
  if (!next.character) return next;
  next.character.health = next.character.maxHealth;
  const requested = Array.isArray(carriedItems) ? carriedItems : carriedItems ? [carriedItems] : [];
  const eligible = new Set([...eligibleCarryItems(next), ...requested.filter((id) => ITEMS[id]?.carryable)]);
  const selected = [...new Set(requested.filter((id) => eligible.has(id)))];
  if (selected.length > carryCapacity(next.character.adventuresCompleted)) return next;
  setCarriedItems(next.character, selected);
  if (next.run?.status === 'success') recordAuthoredEnding(next, true);
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
    if (carried.length >= carryCapacity(next.character.adventuresCompleted ?? 0)) return next;
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
  if (!next.character || !item || !carried.includes(item) || next.bank.includes(item)) return next;
  if (next.bank.length > BANK_CAPACITY) return next;
  if (next.bank.length === BANK_CAPACITY) {
    if (!replaceBankItemId) return next;
    const index = next.bank.indexOf(replaceBankItemId);
    if (index < 0) return next;
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
  if (getCarriedItems(next.character).length >= carryCapacity(next.character.adventuresCompleted ?? 0)) return structuredClone(state);
  next.bank = next.bank.filter((id) => id !== itemId);
  setCarriedItems(next.character, [...getCarriedItems(next.character), itemId]);
  return next;
}

export function discardBankItem(state: SaveData, itemId: string): SaveData {
  const index = state.bank.indexOf(itemId);
  if (index < 0) return state;
  const next = structuredClone(state);
  next.bank.splice(index, 1);
  return next;
}

export function emptyBank(state: SaveData): SaveData {
  if (!state.bank.length) return state;
  return { ...state, bank: [] };
}
