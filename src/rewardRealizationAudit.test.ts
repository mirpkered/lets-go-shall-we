import { describe, expect, it } from 'vitest';
import { EMPTY_SAVE } from './storage';
import { newCharacter, startAdventure, choose, meets, openRewardResolution, newRewardItems, placeReward, finishRewardResolution, failCharacter, depositCarried, withdrawBanked, getCarriedItems, getCarriedGearItems } from './engine';
import { inventoryClass, ITEMS } from './items';
import { SCENARIOS } from './scenarios';
import { primaryScenarioCategory, selectScenario } from './scenarioSelection';
import type { Choice, SaveData } from './types';

type Policy = 'random' | 'cautious' | 'engaged' | 'risk-tolerant';
const POLICIES: Policy[] = ['random', 'cautious', 'engaged', 'risk-tolerant'];
// 250 per policy/month is statistically useful while keeping full engine traversal practical in CI.
const SAMPLE_SIZE = 250;
const MILESTONES = [10, 20, 50];

function rng(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value += 0x6D2B79F5; let n = value; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; };
}

function choiceScore(choice: Choice, state: SaveData, policy: Policy): number {
  if (policy === 'random') return 1;
  const text = `${choice.id} ${choice.label} ${choice.hint ?? ''}`.toLowerCase();
  const effects = choice.effects;
  const riskWords = /danger|risk|fatal|death|collapse|unstable|attack|fight|deeper|press on|force|charge|confront|chase|cross the|enter the/;
  const safeWords = /retreat|leave|withdraw|wait|observe|watch|ask|listen|careful|test|circle|return|refuse|decline|safe|from a distance|back away/;
  const helpWords = /help|rescue|investigate|inspect|search|learn|examine|repair|settle|deliver|accept|continue|follow|take the job|work/;
  const risky = riskWords.test(text) ? 1 : 0;
  const safer = safeWords.test(text) ? 1 : 0;
  const helpful = helpWords.test(text) ? 1 : 0;
  const gain = (effects?.money ?? 0) > 0 || !!effects?.gainItems?.length || !!effects?.gainSupplies || !!effects?.knowledge?.length || !!effects?.knowledgeEntries?.length || !!effects?.gainContacts?.length || !!effects?.gainFavors?.length ? 1 : 0;
  const cost = (effects?.money ?? 0) < 0 || !!effects?.loseMoney || !!effects?.loseCarriedItem || !!effects?.loseCarriedItems || !!effects?.consumeSupplies || !!effects?.damageItems?.length || !!effects?.breakItems?.length ? 1 : 0;
  if (policy === 'cautious') return Math.exp(-1.6 * risky + 1.1 * safer + 0.2 * helpful - 0.4 * cost);
  if (policy === 'engaged') return Math.exp(-0.45 * risky + 1.1 * helpful + 0.3 * gain + 0.1 * safer);
  return Math.exp(1.35 * risky + 0.7 * helpful + 0.25 * gain - 0.25 * safer);
}

function weightedChoice(choices: Choice[], state: SaveData, policy: Policy, random: () => number): Choice | undefined {
  const available = choices.filter((choice) => meets(choice.requirements, state));
  if (!available.length) return undefined;
  const weights = available.map((choice) => choiceScore(choice, state, policy));
  const total = weights.reduce((a, b) => a + b, 0);
  let point = random() * total;
  return available.find((_choice, i) => (point -= weights[i]) < 0) ?? available.at(-1);
}

function utility(id: string): number {
  const uses = SCENARIOS.reduce((count, scenario) => count + Object.values(scenario.scenes).reduce((inner, scene) => inner + scene.choices.filter((choice) => JSON.stringify(choice.requirements ?? {}).includes(id)).length, 0), 0);
  return uses + (inventoryClass(id) === 'RELIC' ? 0.1 : 0);
}

function depositRedundantItems(state: SaveData): SaveData {
  let next = state;
  const gear = getCarriedGearItems(next.character);
  const cap = next.character!.adventuresCompleted >= 20 ? 3 : next.character!.adventuresCompleted >= 10 ? 2 : 1;
  while (gear.length > cap) {
    const id = gear.pop()!;
    const deposited = depositCarried(next, undefined, id);
    if (deposited.bank.length === next.bank.length) break;
    next = deposited;
  }
  return next;
}

function manageBank(state: SaveData, policy: Policy, random: () => number): { state: SaveData; withdrew: boolean } {
  const character = state.character;
  if (!character || !state.bank.length) return { state, withdrew: false };
  const gear = getCarriedGearItems(character);
  const cap = character.adventuresCompleted >= 20 ? 3 : character.adventuresCompleted >= 10 ? 2 : 1;
  if (gear.length >= cap) return { state, withdrew: false };
  const candidates = state.bank.filter((id) => inventoryClass(id) !== 'GEAR' || gear.length < cap);
  if (!candidates.length || (policy === 'random' && random() >= 0.45)) return { state, withdrew: false };
  const selected = policy === 'risk-tolerant' || policy === 'engaged'
    ? [...candidates].sort((a, b) => utility(b) - utility(a))[0]
    : candidates[Math.floor(random() * candidates.length)];
  return { state: withdrawBanked(state, selected), withdrew: true };
}

function emptyState(): SaveData {
  return { ...structuredClone(EMPTY_SAVE), character: newCharacter('Audit Traveler') };
}

function completeOneAdventure(initial: SaveData, policy: Policy, month: number, random: () => number): { state: SaveData; completed: boolean; died: boolean; banked: boolean; usedFavor: boolean; supplyGain: number; supplyUse: number; supplyGainById: Record<string, number>; supplyUseById: Record<string, number>; firstSupplyOption: Record<string, boolean>; supplyOpportunities: number; missedSupplyOpportunities: number; claims: number; declines: number; bankedRewards: number; capacityBlocked: number; routeDamage: boolean; knowledgeBefore: number; knowledgeAfter: number } {
  const state = initial;
  const scenario = selectScenario(SCENARIOS, state.recentScenarioIds, random, {
    adventuresCompleted: state.character!.adventuresCompleted,
    recentRiskHistory: state.recentRiskHistory,
    categoryHistory: state.character!.scenarioCategoryHistory,
    scenarioPlayCounts: state.character!.scenarioPlayCounts,
    selectionMonth: month,
  });
  if (!scenario) return { state, completed: false, died: false, banked: false, usedFavor: false, supplyGain: 0, supplyUse: 0, supplyGainById: {}, supplyUseById: {}, firstSupplyOption: {}, supplyOpportunities: 0, missedSupplyOpportunities: 0, claims: 0, declines: 0, bankedRewards: 0, capacityBlocked: 0, routeDamage: false, knowledgeBefore: 0, knowledgeAfter: 0 };
  const knowledgeBefore = state.character!.knowledgeKeys?.length ?? state.character!.knowledge.length;
  let current = startAdventure(state, scenario, random);
  let usedFavor = false;
  let supplyGain = 0;
  let supplyUse = 0;
  const supplyGainById: Record<string, number> = {};
  const supplyUseById: Record<string, number> = {};
  const firstSupplyOption: Record<string, boolean> = {};
  let supplyOpportunities = 0;
  let missedSupplyOpportunities = 0;
  let claims = 0;
  let declines = 0;
  let bankedRewards = 0;
  let capacityBlocked = 0;
  for (let step = 0; step < 45 && current.run?.status === 'active'; step++) {
    const scene = scenario.scenes[current.run.sceneId];
    for (const choice of scene.choices) if (choice.requirements?.supplies && Object.keys(choice.requirements.supplies).length) {
      const withoutSupply = { ...choice.requirements };
      delete withoutSupply.supplies;
      if (meets(withoutSupply, current)) {
        supplyOpportunities++;
        const supplyEntries = Object.entries(choice.requirements.supplies);
        for (const [id, quantity] of supplyEntries) if (!(id in firstSupplyOption)) firstSupplyOption[id] = (current.character?.supplies?.[id] ?? 0) >= quantity;
        if (!meets(choice.requirements, current)) missedSupplyOpportunities++;
      }
    }
    const choice = weightedChoice(scene.choices, current, policy, random);
    if (!choice) break;
    if (choice.effects?.consumeFavors?.length) usedFavor = true;
    const supplyBefore = structuredClone(current.character?.supplies ?? {});
    current = choose(current, scenario, choice, random);
    const supplyAfter = current.character?.supplies ?? {};
    for (const id of new Set([...Object.keys(supplyBefore), ...Object.keys(supplyAfter)])) {
      const difference = (supplyAfter[id] ?? 0) - (supplyBefore[id] ?? 0);
      supplyGain += Math.max(0, difference);
      supplyUse += Math.max(0, -difference);
      supplyGainById[id] = (supplyGainById[id] ?? 0) + Math.max(0, difference);
      supplyUseById[id] = (supplyUseById[id] ?? 0) + Math.max(0, -difference);
    }
  }
  if (current.run?.status === 'death') {
    const dead = failCharacter(current);
    return { state: dead, completed: false, died: true, banked: false, usedFavor, supplyGain, supplyUse, supplyGainById, supplyUseById, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims: 0, declines: 0, bankedRewards: 0, capacityBlocked: 0, routeDamage: true, knowledgeBefore, knowledgeAfter: 0 };
  }
  if (current.run?.status !== 'success') {
    // Stalled routes are modeled as an abandoned run; no reward is claimed.
    current.run = null;
    return { state: current, completed: false, died: false, banked: false, usedFavor, supplyGain, supplyUse, supplyGainById, supplyUseById, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims, declines, bankedRewards, capacityBlocked, routeDamage: false, knowledgeBefore, knowledgeAfter: current.character?.knowledge.length ?? 0 };
  }
  const routeDamage = current.run!.health < current.character!.maxHealth;
  current = openRewardResolution(current);
  let banked = false;
  for (const id of [...(current.run?.rewardPendingItems ?? [])]) {
    const gearCapacity = current.character!.adventuresCompleted >= 20 ? 3 : current.character!.adventuresCompleted >= 10 ? 2 : 1;
    const gearFull = inventoryClass(id) === 'GEAR' && getCarriedGearItems(current.character).length >= gearCapacity;
    const destination = !gearFull && (policy !== 'random' || random() < 0.55) ? 'carry' : current.bank.length < 5 ? 'bank' : 'decline';
    current = placeReward(current, id, destination);
    if (destination === 'carry') claims++;
    if (destination === 'bank') { claims++; bankedRewards++; }
    if (destination === 'decline') declines++;
    if (gearFull) capacityBlocked++;
    banked ||= destination === 'bank';
  }
  current = finishRewardResolution(current);
  current = depositRedundantItems(current);
  return { state: current, completed: true, died: false, banked, usedFavor, supplyGain, supplyUse, supplyGainById, supplyUseById, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims, declines, bankedRewards, capacityBlocked, routeDamage, knowledgeBefore, knowledgeAfter: current.character!.knowledge.length };
}

interface Snapshot {
  policy: Policy; month: number; milestone: number; survivors: number; reached: number;
  gear0: number; gear1plus: number; gear2plus: number; gear3plus: number; carriedGear: number[]; totalItems: number[]; fullCapacity: number;
  bankUsers: number; bankWithdrawals: number; bankInteractions: number; bankAtCap: number; relicUsers: number; relicCounts: number[];
  supplyUsers: number; suppliesTotal: number[]; knowledge: number[]; lore: number[]; contacts: number[]; favorsAvailable: number[]; favorsUsed: number; supplyGained: number; suppliesConsumed: number; supplyOpportunityCount: number; missedSupplyOpportunityCount: number;
  supplyGainedById: Record<string, number>; supplyUsedById: Record<string, number>; supplyOwnedById: Record<string, number>;
  supplyFirstOptionSeenById: Record<string, number>; supplyFirstOptionHadQtyById: Record<string, number>; supplyAcquirerTravellersById: Record<string, number>; supplyUserTravellersById: Record<string, number>; supplyUnusedAcquirerTravellersById: Record<string, number>;
  money: number[]; injuries: number; assets: number; deaths: number; stalled: number; completions: number; rewardClaims: number; rewardDeclines: number; bankedRewards: number; capacityBlockedRewards: number; favorUses: number;
}

function simulate(policy: Policy, month: number, travelers = SAMPLE_SIZE): Snapshot[] {
  const outcomes: Snapshot[] = MILESTONES.map((milestone) => ({ policy, month, milestone, survivors: 0, reached: 0, gear0: 0, gear1plus: 0, gear2plus: 0, gear3plus: 0, carriedGear: [], totalItems: [], fullCapacity: 0, bankUsers: 0, bankWithdrawals: 0, bankInteractions: 0, bankAtCap: 0, relicUsers: 0, relicCounts: [], supplyUsers: 0, suppliesTotal: [], knowledge: [], lore: [], contacts: [], favorsAvailable: [], favorsUsed: 0, supplyGained: 0, suppliesConsumed: 0, supplyOpportunityCount: 0, missedSupplyOpportunityCount: 0, supplyGainedById: {}, supplyUsedById: {}, supplyOwnedById: {}, supplyFirstOptionSeenById: {}, supplyFirstOptionHadQtyById: {}, supplyAcquirerTravellersById: {}, supplyUserTravellersById: {}, supplyUnusedAcquirerTravellersById: {}, money: [], injuries: 0, assets: 0, deaths: 0, stalled: 0, completions: 0, rewardClaims: 0, rewardDeclines: 0, bankedRewards: 0, capacityBlockedRewards: 0, favorUses: 0 }));
  for (let traveler = 0; traveler < travelers; traveler++) {
    const random = rng((month * 1000003 + traveler * 7919 + POLICIES.indexOf(policy) * 104729) >>> 0);
    let state = emptyState();
    let completed = 0;
    let deathCount = 0;
    let favorUsed = 0;
    let bankUsed = 0;
    let withdrawals = 0;
    let interactions = 0;
    let supplyGained = 0;
    let suppliesConsumed = 0;
    let supplyOpportunityCount = 0;
    let missedSupplyOpportunityCount = 0;
    const supplyGainedById: Record<string, number> = {};
    const supplyUsedById: Record<string, number> = {};
    const firstSupplyOptions: Record<string, boolean> = {};
    const supplyAcquiredSet = new Set<string>();
    const supplyUsedSet = new Set<string>();
    let rewardClaims = 0;
    let rewardDeclines = 0;
    let bankedRewards = 0;
    let capacityBlocked = 0;
    let routeDamageEvents = 0;
    const achieved = new Set<number>();
    for (let run = 0; run < 500 && completed < 50; run++) {
      const result = completeOneAdventure(state, policy, month, random);
      state = result.state;
      favorUsed += Number(result.usedFavor);
      bankUsed += Number(result.banked);
      interactions += Number(result.banked);
      supplyGained += result.supplyGain;
      suppliesConsumed += result.supplyUse;
      supplyOpportunityCount += result.supplyOpportunities;
      missedSupplyOpportunityCount += result.missedSupplyOpportunities;
      for (const [id, quantity] of Object.entries(result.supplyGainById)) supplyGainedById[id] = (supplyGainedById[id] ?? 0) + quantity;
      for (const [id, quantity] of Object.entries(result.supplyUseById)) supplyUsedById[id] = (supplyUsedById[id] ?? 0) + quantity;
      for (const [id, hadQty] of Object.entries(result.firstSupplyOption)) if (!(id in firstSupplyOptions)) firstSupplyOptions[id] = hadQty;
      for (const [id, quantity] of Object.entries(result.supplyGainById)) if (quantity > 0) supplyAcquiredSet.add(id);
      for (const [id, quantity] of Object.entries(result.supplyUseById)) if (quantity > 0) supplyUsedSet.add(id);
      rewardClaims += result.claims;
      rewardDeclines += result.declines;
      bankedRewards += result.bankedRewards;
      capacityBlocked += result.capacityBlocked;
      routeDamageEvents += Number(result.routeDamage);
      if (result.died) { deathCount++; break; }
      routeDamageEvents += Number(result.routeDamage);
      bankedRewards += result.bankedRewards;
      capacityBlocked += result.capacityBlocked;
      if (!result.completed) { outcomes.forEach((row) => { if (row.milestone > completed) row.stalled++; }); continue; }
      completed = state.character?.adventuresCompleted ?? completed;
      if (completed > 0 && !achieved.has(completed)) {
        achieved.add(completed);
        for (const row of outcomes) if (row.milestone === completed) {
          row.reached++;
          const char = state.character!;
          const gearCount = getCarriedGearItems(char).length;
          const gearOwned = new Set([...getCarriedItems(char), ...state.bank].filter((id) => inventoryClass(id) === 'GEAR')).size;
          const cap = completed >= 20 ? 3 : completed >= 10 ? 2 : 1;
          row.survivors++;
          row.gear0 += Number(gearOwned === 0);
          row.gear1plus += Number(gearOwned >= 1);
          row.gear2plus += Number(gearOwned >= 2);
          row.gear3plus += Number(gearOwned >= 3);
          row.carriedGear.push(gearCount);
          row.totalItems.push(gearOwned);
          row.fullCapacity += Number(gearCount >= cap);
          row.bankUsers += Number(state.bank.length > 0);
          row.bankAtCap += Number(state.bank.length === 5);
          const relics = new Set([...getCarriedItems(char), ...state.bank].filter((id) => inventoryClass(id) === 'RELIC')).size;
          row.relicUsers += Number(relics > 0);
          row.relicCounts.push(relics);
          row.supplyUsers += Number(Object.values(char.supplies ?? {}).some((q) => q > 0));
          row.suppliesTotal.push(Object.values(char.supplies ?? {}).reduce((a, b) => a + b, 0));
          row.money.push(char.money);
          row.knowledge.push(char.knowledge.length);
          row.lore.push(char.lore.length);
          row.contacts.push(char.contacts?.length ?? 0);
          row.favorsAvailable.push(char.favors?.filter((f) => f.status === 'available').length ?? 0);
          row.favorsUsed += favorUsed;
          row.favorUses += favorUsed;
          row.assets += char.ownedAssets?.length ?? 0;
          row.injuries += routeDamageEvents;
          row.bankWithdrawals += withdrawals;
          row.bankInteractions += interactions;
          row.supplyGained += supplyGained;
          row.suppliesConsumed += suppliesConsumed;
          row.supplyOpportunityCount += supplyOpportunityCount;
          row.missedSupplyOpportunityCount += missedSupplyOpportunityCount;
          for (const [id, quantity] of Object.entries(supplyGainedById)) row.supplyGainedById[id] = (row.supplyGainedById[id] ?? 0) + quantity;
          for (const [id, quantity] of Object.entries(supplyUsedById)) row.supplyUsedById[id] = (row.supplyUsedById[id] ?? 0) + quantity;
          for (const [id, quantity] of Object.entries(char.supplies ?? {})) row.supplyOwnedById[id] = (row.supplyOwnedById[id] ?? 0) + quantity;
          for (const [id, hadQty] of Object.entries(firstSupplyOptions)) { row.supplyFirstOptionSeenById[id] = (row.supplyFirstOptionSeenById[id] ?? 0) + 1; row.supplyFirstOptionHadQtyById[id] = (row.supplyFirstOptionHadQtyById[id] ?? 0) + Number(hadQty); }
          for (const id of supplyAcquiredSet) row.supplyAcquirerTravellersById[id] = (row.supplyAcquirerTravellersById[id] ?? 0) + 1;
          for (const id of supplyUsedSet) row.supplyUserTravellersById[id] = (row.supplyUserTravellersById[id] ?? 0) + 1;
          for (const id of supplyAcquiredSet) if (!supplyUsedSet.has(id)) row.supplyUnusedAcquirerTravellersById[id] = (row.supplyUnusedAcquirerTravellersById[id] ?? 0) + 1;
          row.rewardClaims += rewardClaims;
          row.rewardDeclines += rewardDeclines;
          row.bankedRewards += bankedRewards;
          row.capacityBlockedRewards += capacityBlocked;
        }
      }
      const managedBank = manageBank(state, policy, random);
      state = managedBank.state;
      if (managedBank.withdrew) { withdrawals++; interactions++; }
    }
    if (deathCount) for (const row of outcomes) if (row.milestone > completed) row.deaths++;
    // The user manages the Bank between visits: withdraw a useful stored item if an empty slot exists.
    void state;
    void bankUsed;
  }
  return outcomes;
}

function percent(n: number, d: number): number { return d ? +(100 * n / d).toFixed(1) : 0; }
function quantile(values: number[], q: number): number { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q))]; }

function authoredEffectRows() {
  return SCENARIOS.flatMap((scenario) => Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap((choice) => [
    ...(choice.effects ? [{ effect: choice.effects, scenario }] : []),
    ...(choice.chance?.successEffects ? [{ effect: choice.chance.successEffects, scenario }] : []),
    ...(choice.chance?.failureEffects ? [{ effect: choice.chance.failureEffects, scenario }] : []),
  ])));
}

function itemUtilityAudit() {
  const rows = authoredEffectRows();
  const grants = new Map<string, Set<string>>();
  const uses = new Map<string, Set<string>>();
  for (const { effect, scenario } of rows) {
    for (const id of [...(effect.gainItems ?? []), ...(effect.replaceItems ?? []).map(({ newItemId }) => newItemId)]) {
      if (ITEMS[id]?.carryable) { const found = grants.get(id) ?? new Set<string>(); found.add(scenario.id); grants.set(id, found); }
    }
  }
  const useKeys = ['items', 'usableItems', 'anyUsableItems', 'gear', 'usableGear', 'anyItems', 'relics', 'temporaryEquipment'];
  for (const scenario of SCENARIOS) for (const scene of Object.values(scenario.scenes)) for (const choice of scenario.id === 'give-me-whatcha-got' ? [] : scene.choices) {
    const req = choice.requirements;
    if (!req) continue;
    for (const key of useKeys) for (const id of (req as Record<string, unknown>)[key] as string[] | undefined ?? []) {
      if (ITEMS[id]?.carryable) { const found = uses.get(id) ?? new Set<string>(); found.add(scenario.id); uses.set(id, found); }
    }
  }
  return Object.values(ITEMS).filter((item) => item.carryable && ['GEAR', 'RELIC'].includes(inventoryClass(item.id))).map((item) => ({
    id: item.id, class: inventoryClass(item.id), grantScenarios: [...(grants.get(item.id) ?? [])], useScenarios: [...(uses.get(item.id) ?? [])],
    classification: (uses.get(item.id)?.size ?? 0) > 1 ? 'well-supported' : (uses.get(item.id)?.size ?? 0) === 1 ? 'narrow-intentional' : (grants.get(item.id)?.size ?? 0) ? 'stranded-candidate' : 'unreachable-or-not-granted',
  }));
}

function moneyAudit() {
  const rows = authoredEffectRows();
  const histogram: Record<string, number> = {};
  const gains: { scenario: string; category: string; amount: number }[] = [];
  const losses: { scenario: string; category: string; amount: number }[] = [];
  for (const { effect, scenario } of rows) if (effect.money) {
    const amount = effect.money;
    histogram[String(amount)] = (histogram[String(amount)] ?? 0) + 1;
    (amount > 0 ? gains : losses).push({ scenario: scenario.title, category: primaryScenarioCategory(scenario), amount });
  }
  return { histogram, gains: gains.sort((a, b) => b.amount - a.amount).slice(0, 12), losses: losses.sort((a, b) => a.amount - b.amount).slice(0, 12), possibleZeroBalanceEffects: rows.filter(({ effect }) => effect.loseMoney).length };
}

describe('route-aware reward realization audit', () => {
  it('simulates canonical scenario routes through real selector and engine effects', () => {
    const reports = [7, 10].flatMap((month) => POLICIES.flatMap((policy) => simulate(policy, month)));
    const summary = reports.map((row) => ({
      policy: row.policy, month: row.month, n: SAMPLE_SIZE, reached: row.reached, deathsBefore: row.deaths,
      noGear: percent(row.gear0, row.reached), gear1: percent(row.gear1plus, row.reached), gear2: percent(row.gear2plus, row.reached), gear3: percent(row.gear3plus, row.reached),
      carriedGearMedian: quantile(row.carriedGear, .5), totalGearMedian: quantile(row.totalItems, .5), fullCapacity: percent(row.fullCapacity, row.reached),
      bankUsers: percent(row.bankUsers, row.reached), bankInteractionsPerTraveler: +(row.bankInteractions / Math.max(1, row.reached)).toFixed(2), bankedRewards: row.bankedRewards,
      relicUsers: percent(row.relicUsers, row.reached), supplyUsers: percent(row.supplyUsers, row.reached), supplyGainUse: [row.supplyGained, row.suppliesConsumed], missedSupplyPct: percent(row.missedSupplyOpportunityCount, row.supplyOpportunityCount),
      moneyQ: [quantile(row.money, 0), quantile(row.money, .25), quantile(row.money, .5), quantile(row.money, .75), quantile(row.money, 1)],
      moneyZeroPct: percent(row.money.filter((amount) => amount === 0).length, row.reached), moneyOverFivePct: percent(row.money.filter((amount) => amount > 5).length, row.reached),
      knowledgeMedian: quantile(row.knowledge, .5), loreMedian: quantile(row.lore, .5), contacts: percent(row.contacts.filter((n) => n > 0).length, row.reached), favors: percent(row.favorsAvailable.filter((n) => n > 0).length, row.reached), favorUseEvents: row.favorUses,
    }));
    console.log('ROUTE_AWARE_REWARD_REALIZATION', JSON.stringify(summary));
    const at50 = reports.filter((row) => row.milestone === 50);
    const at50Reached = at50.reduce((sum, row) => sum + row.reached, 0);
    console.log('SUPPLY_LIFECYCLE_AT_50', JSON.stringify(Object.keys(ITEMS).filter((id) => inventoryClass(id) === 'SUPPLY').map((id) => {
      const sum = (field: keyof Pick<Snapshot, 'supplyGainedById' | 'supplyUsedById' | 'supplyOwnedById' | 'supplyFirstOptionSeenById' | 'supplyFirstOptionHadQtyById' | 'supplyAcquirerTravellersById' | 'supplyUserTravellersById' | 'supplyUnusedAcquirerTravellersById'>) => at50.reduce((n, row) => n + (row[field][id] ?? 0), 0);
      return { id, reached: at50Reached, acquiredPct: percent(sum('supplyAcquirerTravellersById'), at50Reached), usedPct: percent(sum('supplyUserTravellersById'), at50Reached), acquiredButUnusedPct: percent(sum('supplyUnusedAcquirerTravellersById'), sum('supplyAcquirerTravellersById')), quantityAcquiredPerTraveler: +(sum('supplyGainedById') / Math.max(1, at50Reached)).toFixed(3), quantityConsumedPerTraveler: +(sum('supplyUsedById') / Math.max(1, at50Reached)).toFixed(3), retainedPerTraveler: +(sum('supplyOwnedById') / Math.max(1, at50Reached)).toFixed(3), firstOptionAvailabilityPct: percent(sum('supplyFirstOptionHadQtyById'), sum('supplyFirstOptionSeenById')), firstOptionSeenTravelers: sum('supplyFirstOptionSeenById') };
    })));
    const utility = itemUtilityAudit();
    const utilityCounts: Record<string, number> = {};
    for (const item of utility) { const key = `${item.class}:${item.classification}`; utilityCounts[key] = (utilityCounts[key] ?? 0) + 1; }
    console.log('ITEM_UTILITY_COUNTS', JSON.stringify(utilityCounts));
    console.log('ITEM_STRANDED_CANDIDATES', JSON.stringify(utility.filter(({ classification }) => classification === 'stranded-candidate' || classification === 'unreachable-or-not-granted')));
    console.log('MONEY_EFFECT_AUDIT', JSON.stringify(moneyAudit()));
    expect(reports).toHaveLength(24);
    expect(reports.every((row) => row.reached > 0)).toBe(true);
    expect(Object.keys(ITEMS).length).toBeGreaterThan(0);
  }, 600_000);
});
