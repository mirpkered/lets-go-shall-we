import { STARTING_ITEMS } from './items';
import type { Character, Choice, Effects, Requirement, RunState, SaveData, Scenario } from './types';

export function newCharacter(name = 'The Traveler'): Character {
  return { id: crypto.randomUUID(), name, health: 10, maxHealth: 10, money: 0, carriedItem: null, lore: [], knowledge: [], adventuresCompleted: 0 };
}

export function startRun(character: Character, scenario: Scenario): RunState {
  const inventory = [...STARTING_ITEMS];
  if (character.carriedItem) inventory.push(character.carriedItem);
  return { scenarioId: scenario.id, sceneId: scenario.startScene, health: character.maxHealth, inventory, acquiredThisRun: [], flags: [], status: 'active', message: null, startedAt: Date.now() };
}

export function meets(requirement: Requirement | undefined, state: SaveData): boolean {
  if (!requirement) return true;
  const run = state.run;
  const character = state.character;
  if (!run || !character) return false;
  return (!requirement.items || requirement.items.every((id) => run.inventory.includes(id)))
    && (!requirement.anyItems || requirement.anyItems.some((id) => run.inventory.includes(id)))
    && (!requirement.flags || requirement.flags.every((id) => run.flags.includes(id)))
    && (!requirement.notFlags || requirement.notFlags.every((id) => !run.flags.includes(id)))
    && (!requirement.knowledge || requirement.knowledge.every((id) => character.knowledge.includes(id)))
    && (!requirement.minHealth || run.health >= requirement.minHealth);
}

const addUnique = (target: string[], values: string[] = []) => [...new Set([...target, ...values])];
const without = (target: string[], values: string[] = []) => target.filter((value) => !values.includes(value));

function applyEffects(state: SaveData, effects: Effects = {}): void {
  const run = state.run;
  const character = state.character;
  if (!run || !character) return;
  if (effects.health) run.health = Math.max(0, Math.min(character.maxHealth, run.health + effects.health));
  if (effects.money) character.money = Math.max(0, character.money + effects.money);
  if (effects.gainItems) {
    run.inventory = addUnique(run.inventory, effects.gainItems);
    run.acquiredThisRun = addUnique(run.acquiredThisRun, effects.gainItems);
  }
  if (effects.loseItems) run.inventory = without(run.inventory, effects.loseItems);
  if (effects.knowledge) character.knowledge = addUnique(character.knowledge, effects.knowledge);
  if (effects.lore) character.lore = addUnique(character.lore, effects.lore);
  if (effects.setFlags) run.flags = addUnique(run.flags, effects.setFlags);
  if (effects.clearFlags) run.flags = without(run.flags, effects.clearFlags);
}

export function choose(state: SaveData, scenario: Scenario, choice: Choice, random = Math.random): SaveData {
  const next = structuredClone(state);
  if (!next.run || next.run.status !== 'active' || !meets(choice.requirements, next)) return next;
  next.run.message = null;
  applyEffects(next, choice.effects);

  let destination = choice.next;
  if (choice.effects?.combat) {
    const combat = choice.effects.combat;
    const won = random() < combat.winChance;
    applyEffects(next, { health: won ? -(combat.damageOnWin ?? 0) : -combat.damageOnLoss });
    destination = won ? combat.winNext : combat.lossNext;
    next.run.message = won ? `You survive the fight with the ${combat.enemy}.` : `The ${combat.enemy} wounds you. You lose ${combat.damageOnLoss} health.`;
  } else if (choice.chance) {
    const won = random() < choice.chance.probability;
    destination = won ? choice.chance.successNext : choice.chance.failureNext;
    next.run.message = won ? choice.chance.successMessage : choice.chance.failureMessage;
    applyEffects(next, won ? choice.chance.successEffects : choice.chance.failureEffects);
  }

  if (next.run.health <= 0) {
    next.run.status = 'death';
    next.run.sceneId = destination === 'deathBell' ? destination : '__death';
    return next;
  }
  if (destination) next.run.sceneId = destination;
  const scene = scenario.scenes[next.run.sceneId];
  if (scene?.ending) next.run.status = scene.ending;
  return next;
}

export function failCharacter(state: SaveData): SaveData {
  return { ...state, character: null, run: null };
}

export function finishSuccess(state: SaveData, carriedItem: string | null): SaveData {
  const next = structuredClone(state);
  if (!next.character) return next;
  next.character.health = next.character.maxHealth;
  next.character.carriedItem = carriedItem;
  next.character.adventuresCompleted += 1;
  next.run = null;
  return next;
}

export function depositCarried(state: SaveData): SaveData {
  const next = structuredClone(state);
  const item = next.character?.carriedItem;
  if (!item || next.bank.includes(item)) return next;
  next.bank.push(item);
  next.character!.carriedItem = null;
  return next;
}

export function withdrawBanked(state: SaveData, itemId: string): SaveData {
  const next = structuredClone(state);
  if (!next.character || next.character.carriedItem || !next.bank.includes(itemId)) return next;
  next.bank = next.bank.filter((id) => id !== itemId);
  next.character.carriedItem = itemId;
  return next;
}
