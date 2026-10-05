import { describe, expect, it } from 'vitest';
import { EMPTY_SAVE } from './storage';
import { newCharacter, startAdventure, choose, meets, openRewardResolution, newRewardItems, placeReward, finishRewardResolution, failCharacter, depositCarried, withdrawBanked, getCarriedItems, getCarriedGearItems, itemCondition } from './engine';
import { inventoryClass, ITEMS } from './items';
import { SCENARIOS } from './scenarios';
import { primaryScenarioCategory, selectScenario } from './scenarioSelection';
import { FIXED_STOCK_MERCHANTS } from './scenarios/merchantEcologyBatch';
import type { Choice, SaveData } from './types';

type Policy = 'random' | 'cautious' | 'engaged' | 'risk-tolerant' | 'continuity-seeking';
const POLICIES: Policy[] = ['random', 'cautious', 'engaged', 'risk-tolerant', 'continuity-seeking'];
// 250 per policy/month is statistically useful while keeping full engine traversal practical in CI.
const SAMPLE_SIZE = 250;
const MILESTONES = [5, 10, 20, 50];
const FUNNEL_ITEM_IDS = Object.values(ITEMS).filter((item) => item.carryable && inventoryClass(item.id) === 'GEAR').map((item) => item.id)
  .concat(Object.values(ITEMS).filter((item) => inventoryClass(item.id) === 'SUPPLY').map((item) => item.id));
const FUNNEL_GEAR_IDS = FUNNEL_ITEM_IDS.filter((id) => inventoryClass(id) === 'GEAR');
const FUNNEL_SUPPLY_IDS = FUNNEL_ITEM_IDS.filter((id) => inventoryClass(id) === 'SUPPLY');
type FunnelStage = 'scenarioSelected' | 'offerVisible' | 'qualified' | 'chosen' | 'resolverGranted' | 'carried' | 'banked' | 'retained' | 'declined' | 'alreadyOwned' | 'lostBeforeEnding' | 'diedBeforeClaim';
type FunnelLedger = Record<string, Record<FunnelStage, number>>;

function effectRewardIds(effects?: Choice['effects']): string[] {
  if (!effects) return [];
  return [...(effects.gainItems ?? []).filter((id) => FUNNEL_ITEM_IDS.includes(id)), ...Object.keys(effects.gainSupplies ?? {})]
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

function choiceRewardIds(choice: Choice): string[] {
  return [...effectRewardIds(choice.effects), ...effectRewardIds(choice.chance?.successEffects)]
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

function funnelRow(ledger: FunnelLedger, policy: Policy, month: number, itemId: string) {
  const key = `${policy}:${month}:${itemId}`;
  return ledger[key] ??= { scenarioSelected: 0, offerVisible: 0, qualified: 0, chosen: 0, resolverGranted: 0, carried: 0, banked: 0, retained: 0, declined: 0, alreadyOwned: 0, lostBeforeEnding: 0, diedBeforeClaim: 0 };
}

function actuallyUsedPersistentItems(choice: Choice, state: SaveData): string[] {
  const requirements = choice.requirements;
  if (!requirements) return [];
  const inventory = state.run?.inventory ?? [];
  const mandatory = [
    ...(requirements.items ?? []), ...(requirements.usableItems ?? []), ...(requirements.gear ?? []), ...(requirements.usableGear ?? []),
    ...(requirements.relics ?? []), ...Object.keys(requirements.itemUpgrades ?? {}), ...Object.keys(requirements.gearUpgrades ?? {}),
  ];
  const alternatives = [
    ...(requirements.anyItems ?? []), ...(requirements.anyUsableItems ?? []),
  ];
  const used = new Set(mandatory.filter((id) => inventory.includes(id)));
  const actualAlternative = alternatives.find((id) => inventory.includes(id));
  if (actualAlternative) used.add(actualAlternative);
  return [...used].filter((id) => ['GEAR', 'RELIC'].includes(inventoryClass(id)) && ITEMS[id]?.carryable);
}

function eligiblePersistentItemOptions(choice: Choice, state: SaveData): string[] {
  if (!choice.requirements || !meets(choice.requirements, state)) return [];
  const inventory = state.run?.inventory ?? [];
  const requirements = choice.requirements;
  const ids = [
    ...(requirements.items ?? []), ...(requirements.usableItems ?? []), ...(requirements.anyItems ?? []), ...(requirements.anyUsableItems ?? []),
    ...(requirements.gear ?? []), ...(requirements.usableGear ?? []), ...(requirements.relics ?? []),
    ...Object.keys(requirements.itemUpgrades ?? {}), ...Object.keys(requirements.gearUpgrades ?? {}),
  ];
  return [...new Set(ids)].filter((id) => inventory.includes(id) && ['GEAR', 'RELIC'].includes(inventoryClass(id)) && ITEMS[id]?.carryable);
}

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
  if (policy === 'continuity-seeking') {
    const persistentItems = [...(effects?.gainItems ?? []), ...(effects?.replaceItems ?? []).map(({ newItemId }) => newItemId)].filter((id) => inventoryClass(id) !== 'SUPPLY' && ITEMS[id]?.carryable).length;
    const supplies = Object.values(effects?.gainSupplies ?? {}).reduce((sum, quantity) => sum + quantity, 0)
      + (effects?.gainItems ?? []).filter((id) => inventoryClass(id) === 'SUPPLY').length;
    const valuedReward = effects?.repairItems?.length || effects?.addItemUpgrades?.length ? 1 : 0;
    const price = Math.max(0, -(effects?.money ?? 0));
    const relevantGearUse = [...(choice.requirements?.items ?? []), ...(choice.requirements?.usableItems ?? []), ...(choice.requirements?.gear ?? []), ...(choice.requirements?.usableGear ?? []), ...(choice.chance?.bonusItems ?? [])].some((id) => inventoryClass(id) === 'GEAR' && state.run?.inventory.includes(id) && itemCondition(state, id) !== 'BROKEN');
    const supplyUse = Object.keys(effects?.consumeSupplies ?? {}).length > 0;
    return Math.exp(1.7 * Math.min(2, persistentItems) + 1.5 * Math.min(2, supplies) + 0.9 * valuedReward + 0.85 * Number(relevantGearUse) + 0.8 * Number(supplyUse) + 0.15 * helpful - 0.45 * risky - 0.2 * cost - Math.min(1.2, price * 0.12));
  }
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

function completeOneAdventure(initial: SaveData, policy: Policy, month: number, random: () => number, funnel: FunnelLedger, scenarios: typeof SCENARIOS = SCENARIOS): { state: SaveData; completed: boolean; died: boolean; banked: boolean; usedFavor: boolean; gearUseIds: string[]; gearOpportunityIds: string[]; relicUseIds: string[]; knowledgeCallbacks: number; contactCallbacks: number; supplyGain: number; supplyUse: number; supplyGainById: Record<string, number>; supplyUseById: Record<string, number>; supplyOpportunitiesById: Record<string, number>; acquiredGearIds: string[]; acquiredRelicIds: string[]; coinsEarned: number; coinsSpent: number; gearAcquisitionOfferSeen: boolean; firstSupplyOption: Record<string, boolean>; supplyOpportunities: number; missedSupplyOpportunities: number; claims: number; declines: number; bankedRewards: number; capacityBlocked: number; routeDamage: boolean; knowledgeBefore: number; knowledgeAfter: number } {
  const state = initial;
  const scenario = selectScenario(scenarios, state.recentScenarioIds, random, {
    adventuresCompleted: state.character!.adventuresCompleted,
    recentRiskHistory: state.recentRiskHistory,
    categoryHistory: state.character!.scenarioCategoryHistory,
    scenarioPlayCounts: state.character!.scenarioPlayCounts,
    selectionMonth: month,
  });
  if (!scenario) return { state, completed: false, died: false, banked: false, usedFavor: false, gearUseIds: [], gearOpportunityIds: [], relicUseIds: [], knowledgeCallbacks: 0, contactCallbacks: 0, supplyGain: 0, supplyUse: 0, supplyGainById: {}, supplyUseById: {}, supplyOpportunitiesById: {}, acquiredGearIds: [], acquiredRelicIds: [], coinsEarned: 0, coinsSpent: 0, gearAcquisitionOfferSeen: false, firstSupplyOption: {}, supplyOpportunities: 0, missedSupplyOpportunities: 0, claims: 0, declines: 0, bankedRewards: 0, capacityBlocked: 0, routeDamage: false, knowledgeBefore: 0, knowledgeAfter: 0 };
  const scenarioRewardIds = new Set(Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap(choiceRewardIds)).flatMap((id) => id));
  for (const id of scenarioRewardIds) funnelRow(funnel, policy, month, id).scenarioSelected++;
  const knowledgeBefore = state.character!.knowledgeKeys?.length ?? state.character!.knowledge.length;
  let current = startAdventure(state, scenario, random);
  let usedFavor = false;
  const gearUseIds = new Set<string>();
  const gearOpportunityIds = new Set<string>();
  const relicUseIds = new Set<string>();
  let knowledgeCallbacks = 0;
  let contactCallbacks = 0;
  let supplyGain = 0;
  let supplyUse = 0;
  const acquiredGearIds = new Set<string>();
  const acquiredRelicIds = new Set<string>();
  let coinsEarned = 0;
  let coinsSpent = 0;
  let gearAcquisitionOfferSeen = false;
  const supplyGainById: Record<string, number> = {};
  const supplyUseById: Record<string, number> = {};
  const supplyOpportunitiesById: Record<string, number> = {};
  const firstSupplyOption: Record<string, boolean> = {};
  let supplyOpportunities = 0;
  let missedSupplyOpportunities = 0;
  let claims = 0;
  let declines = 0;
  let bankedRewards = 0;
  let capacityBlocked = 0;
  for (let step = 0; step < 45 && current.run?.status === 'active'; step++) {
    const scene = scenario.scenes[current.run.sceneId];
    for (const offer of scene.choices) for (const id of eligiblePersistentItemOptions(offer, current)) {
      if (inventoryClass(id) === 'GEAR') gearOpportunityIds.add(id);
    }
    // A bonusItem is a real, optional use route in the engine even when it is not a hard requirement.
    // Count it as an opportunity only when the actual carried item is usable in this scene.
    for (const offer of scene.choices) if (meets(offer.requirements, current)) {
      for (const id of offer.chance?.bonusItems ?? []) {
        if (inventoryClass(id) === 'GEAR' && current.run?.inventory.includes(id) && itemCondition(current, id) !== 'BROKEN') gearOpportunityIds.add(id);
      }
    }
    for (const offer of scene.choices) for (const id of choiceRewardIds(offer)) {
      if (inventoryClass(id) === 'GEAR') gearAcquisitionOfferSeen = true;
      const row = funnelRow(funnel, policy, month, id);
      row.offerVisible++;
      if (meets(offer.requirements, current)) row.qualified++;
    }
    for (const choice of scene.choices) if (choice.requirements?.supplies && Object.keys(choice.requirements.supplies).length) {
      const withoutSupply = { ...choice.requirements };
      delete withoutSupply.supplies;
      if (meets(withoutSupply, current)) {
        supplyOpportunities++;
        const supplyEntries = Object.entries(choice.requirements.supplies);
        for (const [id, quantity] of supplyEntries) {
          supplyOpportunitiesById[id] = (supplyOpportunitiesById[id] ?? 0) + 1;
          if (!(id in firstSupplyOption)) firstSupplyOption[id] = (current.character?.supplies?.[id] ?? 0) >= quantity;
        }
        if (!meets(choice.requirements, current)) missedSupplyOpportunities++;
      }
    }
    const choice = weightedChoice(scene.choices, current, policy, random);
    if (!choice) break;
    const selectedRewardIds = choiceRewardIds(choice);
    for (const id of selectedRewardIds) funnelRow(funnel, policy, month, id).chosen++;
    if (choice.effects?.consumeFavors?.length) usedFavor = true;
    const requirements = choice.requirements;
    for (const id of actuallyUsedPersistentItems(choice, current)) {
      if (inventoryClass(id) === 'GEAR') gearUseIds.add(id);
      if (inventoryClass(id) === 'RELIC') relicUseIds.add(id);
    }
    for (const id of choice.chance?.bonusItems ?? []) {
      if (inventoryClass(id) === 'GEAR' && current.run?.inventory.includes(id) && itemCondition(current, id) !== 'BROKEN') gearUseIds.add(id);
    }
    if (requirements?.knowledge?.some((fact) => current.character?.knowledge.includes(fact)) || requirements?.knowledgeKeys?.some((key) => current.character?.knowledgeKeys?.includes(key))) knowledgeCallbacks++;
    if (requirements?.contacts?.some((id) => current.character?.contacts?.some((contact) => contact.id === id))) contactCallbacks++;
    const supplyBefore = structuredClone(current.character?.supplies ?? {});
    const acquiredBefore = new Set(current.run?.acquiredThisRun ?? []);
    const moneyBefore = current.character?.money ?? 0;
    current = choose(current, scenario, choice, random);
    coinsEarned += Math.max(0, (current.character?.money ?? moneyBefore) - moneyBefore);
    coinsSpent += Math.max(0, moneyBefore - (current.character?.money ?? moneyBefore));
    const supplyAfter = current.character?.supplies ?? {};
    for (const id of selectedRewardIds) {
      const granted = inventoryClass(id) === 'SUPPLY'
        ? (supplyAfter[id] ?? 0) > (supplyBefore[id] ?? 0)
        : !!current.run?.acquiredThisRun.includes(id) && !acquiredBefore.has(id);
      if (granted) {
        funnelRow(funnel, policy, month, id).resolverGranted++;
        if (inventoryClass(id) === 'SUPPLY') funnelRow(funnel, policy, month, id).retained++;
      }
    }
    for (const id of current.run?.acquiredThisRun ?? []) if (!acquiredBefore.has(id)) {
      if (inventoryClass(id) === 'GEAR' && ITEMS[id]?.carryable) acquiredGearIds.add(id);
      if (inventoryClass(id) === 'RELIC' && ITEMS[id]) acquiredRelicIds.add(id);
    }
    for (const id of new Set([...Object.keys(supplyBefore), ...Object.keys(supplyAfter)])) {
      const difference = (supplyAfter[id] ?? 0) - (supplyBefore[id] ?? 0);
      supplyGain += Math.max(0, difference);
      supplyUse += Math.max(0, -difference);
      supplyGainById[id] = (supplyGainById[id] ?? 0) + Math.max(0, difference);
      supplyUseById[id] = (supplyUseById[id] ?? 0) + Math.max(0, -difference);
    }
  }
  if (current.run?.status === 'death') {
    for (const id of acquiredGearIds) funnelRow(funnel, policy, month, id).diedBeforeClaim++;
    const dead = failCharacter(current);
    return { state: dead, completed: false, died: true, banked: false, usedFavor, gearUseIds: [...gearUseIds], gearOpportunityIds: [...gearOpportunityIds], relicUseIds: [...relicUseIds], knowledgeCallbacks, contactCallbacks, supplyGain, supplyUse, supplyGainById, supplyUseById, supplyOpportunitiesById, acquiredGearIds: [...acquiredGearIds], acquiredRelicIds: [...acquiredRelicIds], coinsEarned, coinsSpent, gearAcquisitionOfferSeen, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims: 0, declines: 0, bankedRewards: 0, capacityBlocked: 0, routeDamage: true, knowledgeBefore, knowledgeAfter: 0 };
  }
  if (current.run?.status !== 'success') {
    // Stalled routes are modeled as an abandoned run; no reward is claimed.
    current.run = null;
    return { state: current, completed: false, died: false, banked: false, usedFavor, gearUseIds: [...gearUseIds], gearOpportunityIds: [...gearOpportunityIds], relicUseIds: [...relicUseIds], knowledgeCallbacks, contactCallbacks, supplyGain, supplyUse, supplyGainById, supplyUseById, supplyOpportunitiesById, acquiredGearIds: [...acquiredGearIds], acquiredRelicIds: [...acquiredRelicIds], coinsEarned, coinsSpent, gearAcquisitionOfferSeen, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims, declines, bankedRewards, capacityBlocked, routeDamage: false, knowledgeBefore, knowledgeAfter: current.character?.knowledge.length ?? 0 };
  }
  const routeDamage = current.run!.health < current.character!.maxHealth;
  const alreadyPersisted = new Set([...getCarriedItems(current.character), ...current.bank]);
  current = openRewardResolution(current);
  const pendingRewards = new Set(current.run?.rewardPendingItems ?? []);
  for (const id of new Set(current.run?.acquiredThisRun ?? [])) if (inventoryClass(id) === 'GEAR' && !pendingRewards.has(id)) {
    if (alreadyPersisted.has(id)) funnelRow(funnel, policy, month, id).alreadyOwned++;
    else if (!current.run?.inventory.includes(id)) funnelRow(funnel, policy, month, id).lostBeforeEnding++;
  }
  let banked = false;
  for (const id of [...(current.run?.rewardPendingItems ?? [])]) {
    const gearCapacity = current.character!.adventuresCompleted >= 20 ? 3 : current.character!.adventuresCompleted >= 10 ? 2 : 1;
    const gearFull = inventoryClass(id) === 'GEAR' && getCarriedGearItems(current.character).length >= gearCapacity;
    const destination = !gearFull && (policy !== 'random' || random() < 0.55) ? 'carry' : current.bank.length < 5 ? 'bank' : 'decline';
    current = placeReward(current, id, destination);
    const funnelStage: FunnelStage | null = destination === 'carry' && getCarriedItems(current.character).includes(id)
      ? 'carried'
      : destination === 'bank' && current.bank.includes(id)
        ? 'banked'
        : destination === 'decline'
          ? 'declined'
          : null;
    if (funnelStage) funnelRow(funnel, policy, month, id)[funnelStage]++;
    if (destination === 'carry') claims++;
    if (destination === 'bank') { claims++; bankedRewards++; }
    if (destination === 'decline') declines++;
    if (gearFull) capacityBlocked++;
    banked ||= destination === 'bank';
  }
  current = finishRewardResolution(current);
  current = depositRedundantItems(current);
  return { state: current, completed: true, died: false, banked, usedFavor, gearUseIds: [...gearUseIds], gearOpportunityIds: [...gearOpportunityIds], relicUseIds: [...relicUseIds], knowledgeCallbacks, contactCallbacks, supplyGain, supplyUse, supplyGainById, supplyUseById, supplyOpportunitiesById, acquiredGearIds: [...acquiredGearIds], acquiredRelicIds: [...acquiredRelicIds], coinsEarned, coinsSpent, gearAcquisitionOfferSeen, firstSupplyOption, supplyOpportunities, missedSupplyOpportunities, claims, declines, bankedRewards, capacityBlocked, routeDamage, knowledgeBefore, knowledgeAfter: current.character!.knowledge.length };
}

interface Snapshot {
  policy: Policy; month: number; milestone: number; survivors: number; reached: number;
  gear0: number; gear1plus: number; gear2plus: number; gear3plus: number; carriedGear: number[]; totalItems: number[]; fullCapacity: number;
  bankUsers: number; bankWithdrawals: number; bankInteractions: number; bankAtCap: number; relicUsers: number; relicCounts: number[];
  supplyUsers: number; suppliesTotal: number[]; knowledge: number[]; lore: number[]; contacts: number[]; favorsAvailable: number[]; favorsUsed: number; supplyGained: number; suppliesConsumed: number; supplyOpportunityCount: number; missedSupplyOpportunityCount: number;
  supplyGainedById: Record<string, number>; supplyUsedById: Record<string, number>; supplyOwnedById: Record<string, number>;
  supplyFirstOptionSeenById: Record<string, number>; supplyFirstOptionHadQtyById: Record<string, number>; supplyAcquirerTravellersById: Record<string, number>; supplyUserTravellersById: Record<string, number>; supplyUnusedAcquirerTravellersById: Record<string, number>;
  money: number[]; coinsEarnedTotal: number[]; coinsSpentTotal: number[]; injuries: number; assets: number; deaths: number; stalled: number; completions: number; rewardClaims: number; rewardDeclines: number; bankedRewards: number; capacityBlockedRewards: number; favorUses: number; gearUseEvents: number; relicUseEvents: number; knowledgeCallbacks: number; contactCallbacks: number;
  everGrantedGearTravelers: number; everOwnedGearTravelers: number; distinctGearEverGranted: number[]; distinctGearEverOwned: number[]; gearGrantEvents: number; gearOwnedEvents: number; firstGearGrantAdventure: number[]; firstGearOwnedAdventure: number[];
  gearHolderTravelersById: Record<string, number>; gearLaterOpportunityTravelersById: Record<string, number>; gearLaterOpportunityDelayById: Record<string, number[]>; gearLaterUseTravelersById: Record<string, number>; gearSameAdventureUseTravelersById: Record<string, number>; gearLaterUseDelayById: Record<string, number[]>;
  supplyOpportunityAfterAcquisitionTravelersById: Record<string, number>; supplyLaterUseTravelersById: Record<string, number>; supplySameAdventureUseTravelersById: Record<string, number>; supplyLaterUseDelayById: Record<string, number[]>;
  zeroGearEver: number; zeroSupplyEver: number; zeroRelicEver: number; zeroEarnedCoins: number; zeroSpentCoins: number; zeroMaterialEver: number; zeroMaterialAndCoins: number; gearOrCoins: number; earnedSpentAndGear: number; everBankedGearTravelers: number; gearOfferTravelers: number; carriedGearZero: number; carriedGearOne: number; carriedGearTwoPlus: number; firstAnySupplyAdventure: number[]; firstCoinAdventure: number[]; firstCoinSpendAdventure: number[]; firstMaterialAdventure: number[];
  everSupplyTravelersById: Record<string, number>; firstSupplyAdventureById: Record<string, number[]>; deathsAfterGearGrant: number; deathsAfterGearOwnership: number; carriedGearLostToDeath: number; unclaimedGearLostToDeath: number; bankedGearPreservedAtDeath: number; suppliesLostToDeath: number;
}

function persistentGearIds(state: SaveData): Set<string> {
  return new Set([...getCarriedItems(state.character), ...state.bank].filter((id) => inventoryClass(id) === 'GEAR' && ITEMS[id]?.carryable));
}

function simulate(policy: Policy, month: number, travelers = SAMPLE_SIZE, funnel: FunnelLedger = {}, scenarios: typeof SCENARIOS = SCENARIOS): Snapshot[] {
  const outcomes: Snapshot[] = MILESTONES.map((milestone) => ({ policy, month, milestone, survivors: 0, reached: 0, gear0: 0, gear1plus: 0, gear2plus: 0, gear3plus: 0, carriedGear: [], totalItems: [], fullCapacity: 0, bankUsers: 0, bankWithdrawals: 0, bankInteractions: 0, bankAtCap: 0, relicUsers: 0, relicCounts: [], supplyUsers: 0, suppliesTotal: [], knowledge: [], lore: [], contacts: [], favorsAvailable: [], favorsUsed: 0, supplyGained: 0, suppliesConsumed: 0, supplyOpportunityCount: 0, missedSupplyOpportunityCount: 0, supplyGainedById: {}, supplyUsedById: {}, supplyOwnedById: {}, supplyFirstOptionSeenById: {}, supplyFirstOptionHadQtyById: {}, supplyAcquirerTravellersById: {}, supplyUserTravellersById: {}, supplyUnusedAcquirerTravellersById: {}, money: [], coinsEarnedTotal: [], coinsSpentTotal: [], injuries: 0, assets: 0, deaths: 0, stalled: 0, completions: 0, rewardClaims: 0, rewardDeclines: 0, bankedRewards: 0, capacityBlockedRewards: 0, favorUses: 0, gearUseEvents: 0, relicUseEvents: 0, knowledgeCallbacks: 0, contactCallbacks: 0, everGrantedGearTravelers: 0, everOwnedGearTravelers: 0, distinctGearEverGranted: [], distinctGearEverOwned: [], gearGrantEvents: 0, gearOwnedEvents: 0, firstGearGrantAdventure: [], firstGearOwnedAdventure: [], zeroGearEver: 0, zeroSupplyEver: 0, zeroRelicEver: 0, zeroEarnedCoins: 0, zeroSpentCoins: 0, zeroMaterialEver: 0, zeroMaterialAndCoins: 0, gearOrCoins: 0, earnedSpentAndGear: 0, everBankedGearTravelers: 0, gearOfferTravelers: 0, carriedGearZero: 0, carriedGearOne: 0, carriedGearTwoPlus: 0, firstAnySupplyAdventure: [], firstCoinAdventure: [], firstCoinSpendAdventure: [], firstMaterialAdventure: [], gearHolderTravelersById: {}, gearLaterOpportunityTravelersById: {}, gearLaterOpportunityDelayById: {}, gearLaterUseTravelersById: {}, gearSameAdventureUseTravelersById: {}, gearLaterUseDelayById: {}, supplyOpportunityAfterAcquisitionTravelersById: {}, supplyLaterUseTravelersById: {}, supplySameAdventureUseTravelersById: {}, supplyLaterUseDelayById: {}, everSupplyTravelersById: {}, firstSupplyAdventureById: {}, deathsAfterGearGrant: 0, deathsAfterGearOwnership: 0, carriedGearLostToDeath: 0, unclaimedGearLostToDeath: 0, bankedGearPreservedAtDeath: 0, suppliesLostToDeath: 0 }));
  for (let traveler = 0; traveler < travelers; traveler++) {
    const random = rng((month * 1000003 + traveler * 7919 + POLICIES.indexOf(policy) * 104729) >>> 0);
    let state = emptyState();
    let completed = 0;
    let deathCount = 0;
    let favorUsed = 0;
    let gearUseEvents = 0;
    let relicUseEvents = 0;
    let knowledgeCallbacks = 0;
    let contactCallbacks = 0;
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
    const everGrantedGearIds = new Set<string>();
    const everOwnedGearIds = new Set<string>();
    const everSupplyIds = new Set<string>();
    const everGrantedRelicIds = new Set<string>();
    let everPersistentMaterial = false;
    let earnedCoins = 0;
    let spentCoins = 0;
    let gearOfferSeen = false;
    let everBankedGear = false;
    let firstAnySupplyAt: number | undefined;
    let firstCoinAt: number | undefined;
    let firstCoinSpendAt: number | undefined;
    let firstMaterialAt: number | undefined;
    const firstSupplyAdventureById: Record<string, number> = {};
    const firstGearOwnedAdventureById: Record<string, number> = {};
    const firstSupplyOwnedAdventureById: Record<string, number> = {};
    const gearLaterUseIds = new Set<string>();
    const gearLaterOpportunityIds = new Set<string>();
    const gearSameAdventureUseIds = new Set<string>();
    const supplyOpportunityAfterAcquisitionIds = new Set<string>();
    const supplyLaterUseIds = new Set<string>();
    const supplySameAdventureUseIds = new Set<string>();
    const gearLaterUseDelayById: Record<string, number> = {};
    const gearLaterOpportunityDelayById: Record<string, number> = {};
    const supplyLaterUseDelayById: Record<string, number> = {};
    let firstGearGrantAt: number | undefined;
    let firstGearOwnedAt: number | undefined;
    let gearGrantEvents = 0;
    let gearOwnedEvents = 0;
    let deathsAfterGearGrant = 0;
    let deathsAfterGearOwnership = 0;
    let carriedGearLostToDeath = 0;
    let unclaimedGearLostToDeath = 0;
    let bankedGearPreservedAtDeath = 0;
    let suppliesLostToDeath = 0;
    const supplyAcquiredSet = new Set<string>();
    const supplyUsedSet = new Set<string>();
    let rewardClaims = 0;
    let rewardDeclines = 0;
    let bankedRewards = 0;
    let capacityBlocked = 0;
    let routeDamageEvents = 0;
    const achieved = new Set<number>();
    for (let run = 0; run < 500 && completed < 50; run++) {
      const ownedBeforeRun = persistentGearIds(state);
      const carriedBeforeRun = new Set(getCarriedItems(state.character).filter((id) => inventoryClass(id) === 'GEAR' && ITEMS[id]?.carryable));
      const suppliesBeforeRun = structuredClone(state.character?.supplies ?? {});
      const suppliesHeldBeforeRun = new Set(Object.entries(suppliesBeforeRun).filter(([, quantity]) => quantity > 0).map(([id]) => id));
      const result = completeOneAdventure(state, policy, month, random, funnel, scenarios);
      state = result.state;
      const adventureNumber = completed + 1;
      gearOfferSeen ||= result.gearAcquisitionOfferSeen;
      everBankedGear ||= state.bank.some((id) => inventoryClass(id) === 'GEAR' && ITEMS[id]?.carryable);
      for (const id of result.gearOpportunityIds) if (carriedBeforeRun.has(id)) {
        gearLaterOpportunityIds.add(id);
        gearLaterOpportunityDelayById[id] ??= adventureNumber - (firstGearOwnedAdventureById[id] ?? adventureNumber);
      }
      for (const id of result.gearUseIds) {
        if (carriedBeforeRun.has(id)) {
          gearLaterUseIds.add(id);
          gearLaterUseDelayById[id] ??= adventureNumber - (firstGearOwnedAdventureById[id] ?? adventureNumber);
        } else gearSameAdventureUseIds.add(id);
      }
      for (const id of suppliesHeldBeforeRun) if ((result.supplyOpportunitiesById[id] ?? 0) > 0) supplyOpportunityAfterAcquisitionIds.add(id);
      for (const [id, quantity] of Object.entries(result.supplyUseById)) if (quantity > 0) {
        if (suppliesHeldBeforeRun.has(id)) {
          supplyLaterUseIds.add(id);
          supplyLaterUseDelayById[id] ??= adventureNumber - (firstSupplyOwnedAdventureById[id] ?? adventureNumber);
        } else supplySameAdventureUseIds.add(id);
      }
      for (const id of result.acquiredGearIds) {
        everGrantedGearIds.add(id);
        gearGrantEvents++;
        firstGearGrantAt ??= adventureNumber;
      }
      for (const id of result.acquiredRelicIds) everGrantedRelicIds.add(id);
      for (const [id, quantity] of Object.entries(result.supplyGainById)) if (quantity > 0) {
        everSupplyIds.add(id);
        firstSupplyAdventureById[id] ??= adventureNumber;
        firstSupplyOwnedAdventureById[id] ??= adventureNumber;
      }
      if (result.supplyGain > 0) firstAnySupplyAt ??= adventureNumber;
      earnedCoins += result.coinsEarned;
      if (result.coinsEarned > 0) firstCoinAt ??= adventureNumber;
      spentCoins += result.coinsSpent;
      if (result.coinsSpent > 0) firstCoinSpendAt ??= adventureNumber;
      if (result.acquiredGearIds.length || result.acquiredRelicIds.length || result.supplyGain > 0) {
        everPersistentMaterial = true;
        firstMaterialAt ??= adventureNumber;
      }
      if (result.died) {
        deathsAfterGearGrant += Number(everGrantedGearIds.size > 0);
        deathsAfterGearOwnership += Number(everOwnedGearIds.size > 0);
        carriedGearLostToDeath += [...carriedBeforeRun].filter((id) => !state.bank.includes(id)).length;
        unclaimedGearLostToDeath += result.acquiredGearIds.filter((id) => !state.bank.includes(id) && !ownedBeforeRun.has(id)).length;
        bankedGearPreservedAtDeath += state.bank.filter((id) => inventoryClass(id) === 'GEAR').length;
        suppliesLostToDeath += Math.max(0, Object.values(suppliesBeforeRun).reduce((sum, n) => sum + n, 0) + result.supplyGain - result.supplyUse);
      } else if (result.completed) {
        const ownedAfterRun = persistentGearIds(state);
        const newOwned = [...ownedAfterRun].filter((id) => !ownedBeforeRun.has(id));
        gearOwnedEvents += newOwned.length;
        for (const id of newOwned) { everOwnedGearIds.add(id); firstGearOwnedAdventureById[id] ??= adventureNumber; }
        if (newOwned.length) firstGearOwnedAt ??= state.character?.adventuresCompleted ?? adventureNumber;
      }
      favorUsed += Number(result.usedFavor);
      gearUseEvents += result.gearUseIds.length;
      relicUseEvents += result.relicUseIds.length;
      knowledgeCallbacks += result.knowledgeCallbacks;
      contactCallbacks += result.contactCallbacks;
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
          row.everGrantedGearTravelers += Number(everGrantedGearIds.size > 0);
          row.everOwnedGearTravelers += Number(everOwnedGearIds.size > 0);
          row.distinctGearEverGranted.push(everGrantedGearIds.size);
          row.distinctGearEverOwned.push(everOwnedGearIds.size);
          row.gearGrantEvents += gearGrantEvents;
          row.gearOwnedEvents += gearOwnedEvents;
          if (firstGearGrantAt !== undefined) row.firstGearGrantAdventure.push(firstGearGrantAt);
          if (firstGearOwnedAt !== undefined) row.firstGearOwnedAdventure.push(firstGearOwnedAt);
          row.zeroGearEver += Number(everGrantedGearIds.size === 0);
          row.zeroSupplyEver += Number(everSupplyIds.size === 0);
          row.zeroRelicEver += Number(everGrantedRelicIds.size === 0);
          row.zeroEarnedCoins += Number(earnedCoins === 0);
          row.zeroSpentCoins += Number(spentCoins === 0);
          row.zeroMaterialEver += Number(!everPersistentMaterial);
          row.zeroMaterialAndCoins += Number(!everPersistentMaterial && earnedCoins === 0);
          row.gearOrCoins += Number(everOwnedGearIds.size > 0 || earnedCoins > 0);
          row.earnedSpentAndGear += Number(everOwnedGearIds.size > 0 && earnedCoins > 0 && spentCoins > 0);
          row.everBankedGearTravelers += Number(everBankedGear);
          row.gearOfferTravelers += Number(gearOfferSeen);
          row.carriedGearZero += Number(gearCount === 0);
          row.carriedGearOne += Number(gearCount === 1);
          row.carriedGearTwoPlus += Number(gearCount >= 2);
          if (firstAnySupplyAt !== undefined) row.firstAnySupplyAdventure.push(firstAnySupplyAt);
          if (firstCoinAt !== undefined) row.firstCoinAdventure.push(firstCoinAt);
          if (firstCoinSpendAt !== undefined) row.firstCoinSpendAdventure.push(firstCoinSpendAt);
          if (firstMaterialAt !== undefined) row.firstMaterialAdventure.push(firstMaterialAt);
          for (const id of everSupplyIds) row.everSupplyTravelersById[id] = (row.everSupplyTravelersById[id] ?? 0) + 1;
          for (const [id, at] of Object.entries(firstSupplyAdventureById)) (row.firstSupplyAdventureById[id] ??= []).push(at);
          for (const id of FUNNEL_GEAR_IDS) {
            if (everOwnedGearIds.has(id)) row.gearHolderTravelersById[id] = (row.gearHolderTravelersById[id] ?? 0) + 1;
            if (gearLaterOpportunityIds.has(id)) row.gearLaterOpportunityTravelersById[id] = (row.gearLaterOpportunityTravelersById[id] ?? 0) + 1;
            if (gearLaterOpportunityDelayById[id] !== undefined) (row.gearLaterOpportunityDelayById[id] ??= []).push(gearLaterOpportunityDelayById[id]);
            if (gearLaterUseIds.has(id)) row.gearLaterUseTravelersById[id] = (row.gearLaterUseTravelersById[id] ?? 0) + 1;
            if (gearSameAdventureUseIds.has(id)) row.gearSameAdventureUseTravelersById[id] = (row.gearSameAdventureUseTravelersById[id] ?? 0) + 1;
            if (gearLaterUseDelayById[id] !== undefined) (row.gearLaterUseDelayById[id] ??= []).push(gearLaterUseDelayById[id]);
          }
          for (const id of FUNNEL_SUPPLY_IDS) {
            if (everSupplyIds.has(id) && supplyOpportunityAfterAcquisitionIds.has(id)) row.supplyOpportunityAfterAcquisitionTravelersById[id] = (row.supplyOpportunityAfterAcquisitionTravelersById[id] ?? 0) + 1;
            if (supplyLaterUseIds.has(id)) row.supplyLaterUseTravelersById[id] = (row.supplyLaterUseTravelersById[id] ?? 0) + 1;
            if (supplySameAdventureUseIds.has(id)) row.supplySameAdventureUseTravelersById[id] = (row.supplySameAdventureUseTravelersById[id] ?? 0) + 1;
            if (supplyLaterUseDelayById[id] !== undefined) (row.supplyLaterUseDelayById[id] ??= []).push(supplyLaterUseDelayById[id]);
          }
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
          row.coinsEarnedTotal.push(earnedCoins);
          row.coinsSpentTotal.push(spentCoins);
          row.knowledge.push(char.knowledge.length);
          row.lore.push(char.lore.length);
          row.contacts.push(char.contacts?.length ?? 0);
          row.favorsAvailable.push(char.favors?.filter((f) => f.status === 'available').length ?? 0);
          row.favorsUsed += favorUsed;
          row.favorUses += favorUsed;
          row.gearUseEvents += gearUseEvents;
          row.relicUseEvents += relicUseEvents;
          row.knowledgeCallbacks += knowledgeCallbacks;
          row.contactCallbacks += contactCallbacks;
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
    for (const row of outcomes) {
      row.deathsAfterGearGrant += deathsAfterGearGrant;
      row.deathsAfterGearOwnership += deathsAfterGearOwnership;
      row.carriedGearLostToDeath += carriedGearLostToDeath;
      row.unclaimedGearLostToDeath += unclaimedGearLostToDeath;
      row.bankedGearPreservedAtDeath += bankedGearPreservedAtDeath;
      row.suppliesLostToDeath += suppliesLostToDeath;
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
  const positive = rows.filter(({ effect }) => (effect.money ?? 0) > 0);
  const negative = rows.filter(({ effect }) => (effect.money ?? 0) < 0);
  return {
    scenarioCount: SCENARIOS.length,
    earningScenarios: [...new Set(positive.map(({ scenario }) => scenario.title))].sort(),
    spendingScenarios: [...new Set(negative.map(({ scenario }) => scenario.title))].sort(),
    earningChoiceCount: positive.length,
    spendingChoiceCount: negative.length,
    histogram,
    gains: gains.sort((a, b) => b.amount - a.amount).slice(0, 12),
    losses: losses.sort((a, b) => a.amount - b.amount).slice(0, 12),
    possibleZeroBalanceEffects: rows.filter(({ effect }) => effect.loseMoney).length,
  };
}

describe('route-aware reward realization audit', () => {
  it('simulates canonical scenario routes through real selector and engine effects', () => {
    const funnel: FunnelLedger = {};
    const reports = [7, 10].flatMap((month) => POLICIES.flatMap((policy) => simulate(policy, month, SAMPLE_SIZE, funnel)));
    const compareMerchantExpansion = process.env.MERCHANT_AUDIT_COMPARE === '1';
    const baselineReports = compareMerchantExpansion
      ? (() => {
        const baselineScenarios = SCENARIOS.filter((scenario) => !FIXED_STOCK_MERCHANTS.some(({ id }) => id === scenario.id));
        const baselineFunnel: FunnelLedger = {};
        return [7, 10].flatMap((month) => POLICIES.flatMap((policy) => simulate(policy, month, SAMPLE_SIZE, baselineFunnel, baselineScenarios)));
      })()
      : [];
    const summary = reports.map((row) => ({
      policy: row.policy, month: row.month, n: SAMPLE_SIZE, reached: row.reached, deathsBefore: row.deaths,
      noGear: percent(row.gear0, row.reached), gear1: percent(row.gear1plus, row.reached), gear2: percent(row.gear2plus, row.reached), gear3: percent(row.gear3plus, row.reached),
      carriedGearMedian: quantile(row.carriedGear, .5), totalGearMedian: quantile(row.totalItems, .5), fullCapacity: percent(row.fullCapacity, row.reached),
      bankUsers: percent(row.bankUsers, row.reached), bankInteractionsPerTraveler: +(row.bankInteractions / Math.max(1, row.reached)).toFixed(2), bankedRewards: row.bankedRewards,
      relicUsers: percent(row.relicUsers, row.reached), supplyUsers: percent(row.supplyUsers, row.reached), supplyGainUse: [row.supplyGained, row.suppliesConsumed], missedSupplyPct: percent(row.missedSupplyOpportunityCount, row.supplyOpportunityCount),
      moneyQ: [quantile(row.money, 0), quantile(row.money, .25), quantile(row.money, .5), quantile(row.money, .75), quantile(row.money, 1)],
      moneyZeroPct: percent(row.money.filter((amount) => amount === 0).length, row.reached), moneyOverFivePct: percent(row.money.filter((amount) => amount > 5).length, row.reached),
      knowledgeMedian: quantile(row.knowledge, .5), loreMedian: quantile(row.lore, .5), contacts: percent(row.contacts.filter((n) => n > 0).length, row.reached), favors: percent(row.favorsAvailable.filter((n) => n > 0).length, row.reached),
      selectedGearUsesPerTraveler: +(row.gearUseEvents / Math.max(1, row.reached)).toFixed(2), selectedRelicUsesPerTraveler: +(row.relicUseEvents / Math.max(1, row.reached)).toFixed(2),
      knowledgeCallbacksPerTraveler: +(row.knowledgeCallbacks / Math.max(1, row.reached)).toFixed(2), contactCallbacksPerTraveler: +(row.contactCallbacks / Math.max(1, row.reached)).toFixed(2), favorUseEvents: row.favorUses,
    }));
    console.log('ROUTE_AWARE_REWARD_REALIZATION', JSON.stringify(summary.map(({ policy, month, reached, deathsBefore, noGear, gear1, gear2, gear3, bankUsers, bankInteractionsPerTraveler, supplyUsers, supplyGainUse, selectedGearUsesPerTraveler }) => ({ policy, month, reached, deathsBefore, noGear, gear1, gear2, gear3, bankUsers, bankInteractionsPerTraveler, supplyUsers, supplyGainUse, selectedGearUsesPerTraveler }))));
    const compactMilestoneMetrics = (rows: Snapshot[], month: number, milestone: number) => {
      const cohort = rows.filter((row) => row.month === month && row.milestone === milestone);
      const sum = (pick: (row: Snapshot) => number) => cohort.reduce((total, row) => total + pick(row), 0);
      const reached = sum((row) => row.reached);
      return {
        month, milestone, reached,
        everAcquiredGearPct: percent(sum((row) => row.everGrantedGearTravelers), reached),
        currentGearPct: percent(sum((row) => row.gear1plus), reached),
        twoPlusGearPct: percent(sum((row) => row.gear2plus), reached),
        bankUsersPct: percent(sum((row) => row.bankUsers), reached),
        supplyHoldersPct: percent(sum((row) => row.supplyUsers), reached),
        gearUseEventsPerTraveler: +(sum((row) => row.gearUseEvents) / Math.max(1, reached)).toFixed(2),
        supplyAcquisitions: sum((row) => row.supplyGained),
        supplyUses: sum((row) => row.suppliesConsumed),
        medianFirstGearAdventure: quantile(cohort.flatMap((row) => row.firstGearGrantAdventure), .5) || null,
        zeroGearEverPct: percent(sum((row) => row.zeroGearEver), reached),
        zeroSupplyEverPct: percent(sum((row) => row.zeroSupplyEver), reached),
        zeroRelicEverPct: percent(sum((row) => row.zeroRelicEver), reached),
        zeroEarnedCoinsPct: percent(sum((row) => row.zeroEarnedCoins), reached),
        zeroSpentCoinsPct: percent(sum((row) => row.zeroSpentCoins), reached),
        gearOrCoinsPct: percent(sum((row) => row.gearOrCoins), reached),
        earnedSpentAndGearPct: percent(sum((row) => row.earnedSpentAndGear), reached),
        everBankedGearPct: percent(sum((row) => row.everBankedGearTravelers), reached),
        gearOfferSeenPct: percent(sum((row) => row.gearOfferTravelers), reached),
        carriedGearZeroPct: percent(sum((row) => row.carriedGearZero), reached),
        carriedGearOnePct: percent(sum((row) => row.carriedGearOne), reached),
        carriedGearTwoPlusPct: percent(sum((row) => row.carriedGearTwoPlus), reached),
        zeroPersistentMaterialPct: percent(sum((row) => row.zeroMaterialEver), reached),
        zeroMaterialAndCoinsPct: percent(sum((row) => row.zeroMaterialAndCoins), reached),
        medianFirstSupplyAdventure: quantile(cohort.flatMap((row) => row.firstAnySupplyAdventure), .5) || null,
        medianFirstCoinAdventure: quantile(cohort.flatMap((row) => row.firstCoinAdventure), .5) || null,
        medianFirstCoinSpendAdventure: quantile(cohort.flatMap((row) => row.firstCoinSpendAdventure), .5) || null,
        medianFirstMaterialAdventure: quantile(cohort.flatMap((row) => row.firstMaterialAdventure), .5) || null,
        medianEarnedCoins: quantile(cohort.flatMap((row) => row.coinsEarnedTotal), .5),
        medianSpentCoins: quantile(cohort.flatMap((row) => row.coinsSpentTotal), .5),
      };
    };
    const droughtMilestones = [7, 10].flatMap((month) => POLICIES.flatMap((policy) => MILESTONES.map((milestone) => ({
      policy, ...compactMilestoneMetrics(reports.filter((row) => row.policy === policy), month, milestone),
    }))));
    console.log('REWARD_DROUGHT_MILESTONES', JSON.stringify(droughtMilestones));
    const pooledDrought = [7, 10].flatMap((month) => MILESTONES.map((milestone) => {
      const cohort = reports.filter((row) => row.month === month && row.milestone === milestone);
      const sum = (field: keyof Snapshot) => cohort.reduce((total, row) => total + (row[field] as number), 0);
      const reached = sum('reached');
      const first = (field: 'firstGearGrantAdventure' | 'firstAnySupplyAdventure' | 'firstCoinAdventure' | 'firstMaterialAdventure') => cohort.flatMap((row) => row[field]);
      const firstSpend = cohort.flatMap((row) => row.firstCoinSpendAdventure);
      return {
        month, milestone, reached,
        zeroGearEverPct: percent(sum('zeroGearEver'), reached), zeroSupplyPct: percent(sum('zeroSupplyEver'), reached),
        zeroRelicPct: percent(sum('zeroRelicEver'), reached), zeroEarnedCoinsPct: percent(sum('zeroEarnedCoins'), reached),
        zeroSpentCoinsPct: percent(sum('zeroSpentCoins'), reached),
        gearOrCoinsPct: percent(sum('gearOrCoins'), reached), earnedSpentAndGearPct: percent(sum('earnedSpentAndGear'), reached),
        everBankedGearPct: percent(sum('everBankedGearTravelers'), reached), gearOfferSeenPct: percent(sum('gearOfferTravelers'), reached),
        carriedGearZeroPct: percent(sum('carriedGearZero'), reached), carriedGearOnePct: percent(sum('carriedGearOne'), reached), carriedGearTwoPlusPct: percent(sum('carriedGearTwoPlus'), reached),
        zeroPersistentMaterialPct: percent(sum('zeroMaterialEver'), reached), zeroMaterialAndCoinsPct: percent(sum('zeroMaterialAndCoins'), reached),
        medianFirstGear: quantile(first('firstGearGrantAdventure'), .5) || null,
        medianFirstSupply: quantile(first('firstAnySupplyAdventure'), .5) || null,
        medianFirstCoins: quantile(first('firstCoinAdventure'), .5) || null,
        medianFirstCoinSpend: quantile(firstSpend, .5) || null,
        medianFirstMaterial: quantile(first('firstMaterialAdventure'), .5) || null,
        firstGearQuartiles: [quantile(first('firstGearGrantAdventure'), .25) || null, quantile(first('firstGearGrantAdventure'), .5) || null, quantile(first('firstGearGrantAdventure'), .75) || null],
        firstCoinQuartiles: [quantile(first('firstCoinAdventure'), .25) || null, quantile(first('firstCoinAdventure'), .5) || null, quantile(first('firstCoinAdventure'), .75) || null],
        medianEarnedCoins: quantile(cohort.flatMap((row) => row.coinsEarnedTotal), .5),
        medianSpentCoins: quantile(cohort.flatMap((row) => row.coinsSpentTotal), .5),
      };
    }));
    console.log('REWARD_DROUGHT_POOLED', JSON.stringify(pooledDrought));
    if (compareMerchantExpansion) {
      const merchantComparison = [7, 10].flatMap((month) => [10, 20, 50].map((milestone) => ({
        before: compactMilestoneMetrics(baselineReports, month, milestone),
        after: compactMilestoneMetrics(reports, month, milestone),
      })));
      console.log('MERCHANT_EXPANSION_BEFORE_AFTER', JSON.stringify(merchantComparison));
    }
    console.log('EVER_ACQUIRED_AND_RETENTION', JSON.stringify(reports.map((row) => ({
      policy: row.policy, month: row.month, milestone: row.milestone, reached: row.reached,
      anyGearEverGrantedPct: percent(row.everGrantedGearTravelers, row.reached), anyGearEverOwnedPct: percent(row.everOwnedGearTravelers, row.reached),
      currentlyOwnedPct: percent(row.gear1plus, row.reached), medianDistinctGranted: quantile(row.distinctGearEverGranted, .5), medianDistinctOwned: quantile(row.distinctGearEverOwned, .5),
      gearGrantEventsPer100Completions: +((100 * row.gearGrantEvents) / Math.max(1, row.reached * row.milestone)).toFixed(2),
      medianFirstGrantAdventure: quantile(row.firstGearGrantAdventure, .5), medianFirstOwnedAdventure: quantile(row.firstGearOwnedAdventure, .5),
      suppliesEver: Object.fromEntries(['ritualChalk','consecratedSalt','coldIronNails'].map((id) => [id, percent(row.everSupplyTravelersById[id] ?? 0, row.reached)])),
      medianFirstSupplyAdventure: Object.fromEntries(['ritualChalk','consecratedSalt','coldIronNails'].map((id) => [id, quantile(row.firstSupplyAdventureById[id] ?? [], .5)])),
      deathsAfterGearGrant: row.deathsAfterGearGrant, deathsAfterGearOwnership: row.deathsAfterGearOwnership, carriedGearLostToDeath: row.carriedGearLostToDeath,
      unclaimedGearLostToDeath: row.unclaimedGearLostToDeath, bankedGearPreservedAtDeath: row.bankedGearPreservedAtDeath, suppliesLostToDeath: row.suppliesLostToDeath,
    }))));
    console.log('LIFETIME_MILESTONE_RANGES', JSON.stringify(MILESTONES.map((milestone) => {
      const rows = reports.filter((row) => row.milestone === milestone);
      const reached = rows.reduce((sum, row) => sum + row.reached, 0);
      const pool = (pick: (row: Snapshot) => number) => rows.reduce((sum, row) => sum + pick(row), 0);
      const firstGearGrant = rows.flatMap((row) => row.firstGearGrantAdventure);
      const firstGearOwned = rows.flatMap((row) => row.firstGearOwnedAdventure);
      const firstSupply = (id: string) => rows.flatMap((row) => row.firstSupplyAdventureById[id] ?? []);
      return {
        milestone, reached,
        everGrantedGearPct: percent(pool((row) => row.everGrantedGearTravelers), reached), everOwnedGearPct: percent(pool((row) => row.everOwnedGearTravelers), reached), currentGearPct: percent(pool((row) => row.gear1plus), reached),
        medianDistinctOwned: quantile(rows.flatMap((row) => row.distinctGearEverOwned), .5), gearEventsPer100Completions: +((100 * pool((row) => row.gearGrantEvents)) / Math.max(1, reached * milestone)).toFixed(2),
        medianFirstGearGrant: quantile(firstGearGrant, .5), medianFirstGearOwned: quantile(firstGearOwned, .5),
        suppliesEverPct: Object.fromEntries(FUNNEL_SUPPLY_IDS.map((id) => [id, percent(pool((row) => row.everSupplyTravelersById[id] ?? 0), reached)])),
        medianFirstSupplyAdventure: Object.fromEntries(FUNNEL_SUPPLY_IDS.map((id) => [id, quantile(firstSupply(id), .5)])),
        deathAfterGearGrant: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.deathsAfterGearGrant, 0), deathAfterGearOwnership: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.deathsAfterGearOwnership, 0), carriedGearLostOnDeath: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.carriedGearLostToDeath, 0), unclaimedGearLostOnDeath: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.unclaimedGearLostToDeath, 0), bankedGearPreservedOnDeath: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.bankedGearPreservedAtDeath, 0), suppliesLostOnDeath: reports.filter((row) => row.milestone === 50).reduce((sum, row) => sum + row.suppliesLostToDeath, 0),
      };
    })));
    console.log('ACQUISITION_FUNNEL_TOTALS', JSON.stringify(POLICIES.flatMap((policy) => [7, 10].map((month) => {
      const totals = (ids: string[]) => {
        const rows = ids.map((id) => funnelRow(funnel, policy, month, id));
        const total = (stage: FunnelStage) => rows.reduce((sum, row) => sum + row[stage], 0);
        return { scenarioSelected: total('scenarioSelected'), offerVisible: total('offerVisible'), qualified: total('qualified'), chosen: total('chosen'), effectGranted: total('resolverGranted'), carried: total('carried'), banked: total('banked'), retained: total('retained'), declined: total('declined'), alreadyOwned: total('alreadyOwned'), lostBeforeEnding: total('lostBeforeEnding'), diedBeforeClaim: total('diedBeforeClaim'), qualifyRate: percent(total('qualified'), total('offerVisible')), chooseRate: percent(total('chosen'), total('qualified')), effectRate: percent(total('resolverGranted'), total('chosen')), persistRate: percent(total('carried') + total('banked') + total('retained'), total('resolverGranted')) };
      };
      return { policy, month, gear: totals(FUNNEL_GEAR_IDS), supplies: totals(FUNNEL_SUPPLY_IDS) };
    }))));
    console.log('ACQUISITION_FUNNEL_PRIORITY_ITEMS', JSON.stringify(['travelRope','pocketToolkit','heavyLeatherGloves','foremanMultiTool','brassCandlestick','foldingTrailMarker','roadsideSignalMirror','collapsibleSoundingRod','windproofMatchCase','fieldBandageRoll','ritualChalk','consecratedSalt','coldIronNails'].map((id) => ({ id, continuityJuly: funnelRow(funnel, 'continuity-seeking', 7, id), continuityOctober: funnelRow(funnel, 'continuity-seeking', 10, id) }))));
    const at50 = reports.filter((row) => row.milestone === 50);
    const at50Reached = at50.reduce((sum, row) => sum + row.reached, 0);
    console.log('HOLDER_UTILITY_AT_50', JSON.stringify({
      gear: ['travelRope','pocketToolkit','heavyLeatherGloves','foremanMultiTool','brassCandlestick','roadsideSignalMirror','foldingTrailMarker','collapsibleSoundingRod','windproofMatchCase','fieldBandageRoll'].map((id) => {
        const holders = at50.reduce((sum, row) => sum + (row.gearHolderTravelersById[id] ?? 0), 0);
        const laterOpportunities = at50.reduce((sum, row) => sum + (row.gearLaterOpportunityTravelersById[id] ?? 0), 0);
        const laterUsers = at50.reduce((sum, row) => sum + (row.gearLaterUseTravelersById[id] ?? 0), 0);
        const sameAdventureUsers = at50.reduce((sum, row) => sum + (row.gearSameAdventureUseTravelersById[id] ?? 0), 0);
        const opportunityDelays = at50.flatMap((row) => row.gearLaterOpportunityDelayById[id] ?? []);
        const delays = at50.flatMap((row) => row.gearLaterUseDelayById[id] ?? []);
        return { id, holders, laterOpportunities, opportunityPct: percent(laterOpportunities, holders), laterUsers, laterUsePct: percent(laterUsers, holders), sameAdventureUsers, medianAdventuresToFirstLaterOpportunity: quantile(opportunityDelays, .5), medianAdventuresToLaterUse: quantile(delays, .5) };
      }),
      supplies: FUNNEL_SUPPLY_IDS.map((id) => {
        const holders = at50.reduce((sum, row) => sum + (row.supplyAcquirerTravellersById[id] ?? 0), 0);
        const laterOpportunities = at50.reduce((sum, row) => sum + (row.supplyOpportunityAfterAcquisitionTravelersById[id] ?? 0), 0);
        const laterUsers = at50.reduce((sum, row) => sum + (row.supplyLaterUseTravelersById[id] ?? 0), 0);
        const sameAdventureUsers = at50.reduce((sum, row) => sum + (row.supplySameAdventureUseTravelersById[id] ?? 0), 0);
        const delays = at50.flatMap((row) => row.supplyLaterUseDelayById[id] ?? []);
        return { id, holders, laterOpportunities, opportunityAfterAcquisitionPct: percent(laterOpportunities, holders), laterUsers, laterUsePct: percent(laterUsers, holders), sameAdventureUsers, medianAdventuresToLaterUse: quantile(delays, .5) };
      }),
    }));
    console.log('SUPPLY_LIFECYCLE_AT_50', JSON.stringify(Object.keys(ITEMS).filter((id) => inventoryClass(id) === 'SUPPLY').map((id) => {
      const sum = (field: keyof Pick<Snapshot, 'supplyGainedById' | 'supplyUsedById' | 'supplyOwnedById' | 'supplyFirstOptionSeenById' | 'supplyFirstOptionHadQtyById' | 'supplyAcquirerTravellersById' | 'supplyUserTravellersById' | 'supplyUnusedAcquirerTravellersById'>) => at50.reduce((n, row) => n + (row[field][id] ?? 0), 0);
      return { id, reached: at50Reached, acquiredPct: percent(sum('supplyAcquirerTravellersById'), at50Reached), usedPct: percent(sum('supplyUserTravellersById'), at50Reached), acquiredButUnusedPct: percent(sum('supplyUnusedAcquirerTravellersById'), sum('supplyAcquirerTravellersById')), quantityAcquiredPerTraveler: +(sum('supplyGainedById') / Math.max(1, at50Reached)).toFixed(3), quantityConsumedPerTraveler: +(sum('supplyUsedById') / Math.max(1, at50Reached)).toFixed(3), retainedPerTraveler: +(sum('supplyOwnedById') / Math.max(1, at50Reached)).toFixed(3), firstOptionAvailabilityPct: percent(sum('supplyFirstOptionHadQtyById'), sum('supplyFirstOptionSeenById')), firstOptionSeenTravelers: sum('supplyFirstOptionSeenById') };
    })));
    const utility = itemUtilityAudit();
    const utilityCounts: Record<string, number> = {};
    for (const item of utility) { const key = `${item.class}:${item.classification}`; utilityCounts[key] = (utilityCounts[key] ?? 0) + 1; }
    console.log('ITEM_UTILITY_COUNTS', JSON.stringify(utilityCounts));
    console.log('ITEM_STRANDED_CANDIDATES', JSON.stringify(utility.filter(({ classification }) => classification === 'stranded-candidate' || classification === 'unreachable-or-not-granted')));
    const allEffects = authoredEffectRows();
    const persistentProducts = Object.values(ITEMS).filter((item) => item.carryable && inventoryClass(item.id) === 'GEAR');
    const sourceRoutes = new Map<string, Set<string>>();
    const repairRoutes = new Map<string, Set<string>>();
    const upgradeRoutes = new Map<string, Set<string>>();
    const utilityById = new Map(utility.map((row) => [row.id, row]));
    const merchantIds = new Set(FIXED_STOCK_MERCHANTS.map(({ id }) => id));
    for (const { effect, scenario } of allEffects) {
      const granted = [...(effect.gainItems ?? []), ...(effect.replaceItems ?? []).map(({ newItemId }) => newItemId)];
      for (const id of granted) if (ITEMS[id]?.carryable && inventoryClass(id) === 'GEAR') {
        const routes = sourceRoutes.get(id) ?? new Set<string>(); routes.add(scenario.id); sourceRoutes.set(id, routes);
      }
      for (const id of effect.repairItems ?? []) { const routes = repairRoutes.get(id) ?? new Set<string>(); routes.add(scenario.id); repairRoutes.set(id, routes); }
      for (const { itemId } of effect.addItemUpgrades ?? []) { const routes = upgradeRoutes.get(itemId) ?? new Set<string>(); routes.add(scenario.id); upgradeRoutes.set(itemId, routes); }
    }
    const useKeys = ['items', 'usableItems', 'anyUsableItems', 'gear', 'usableGear', 'anyItems', 'relics'] as const;
    const useScenarioCounts = new Map<string, Set<string>>();
    for (const scenario of SCENARIOS) for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
      for (const key of useKeys) for (const id of (choice.requirements?.[key] ?? [])) if (ITEMS[id]?.carryable && inventoryClass(id) === 'GEAR') {
        const routes = useScenarioCounts.get(id) ?? new Set<string>(); routes.add(scenario.id); useScenarioCounts.set(id, routes);
      }
    }
    const allGearMatrix = persistentProducts.map((item) => {
      const sources = [...(sourceRoutes.get(item.id) ?? [])];
      const uses = [...(useScenarioCounts.get(item.id) ?? [])];
      const use = utilityById.get(item.id);
      const routeTotals = [7, 10].flatMap((month) => POLICIES.map((policy) => funnelRow(funnel, policy, month, item.id)))
        .reduce((sum, row) => ({ selected: sum.selected + row.scenarioSelected, visible: sum.visible + row.offerVisible, qualified: sum.qualified + row.qualified, chosen: sum.chosen + row.chosen, granted: sum.granted + row.resolverGranted }), { selected: 0, visible: 0, qualified: 0, chosen: 0, granted: 0 });
      const holderRows = at50;
      const holders = holderRows.reduce((sum, row) => sum + (row.gearHolderTravelersById[item.id] ?? 0), 0);
      const opportunities = holderRows.reduce((sum, row) => sum + (row.gearLaterOpportunityTravelersById[item.id] ?? 0), 0);
      const laterUses = holderRows.reduce((sum, row) => sum + (row.gearLaterUseTravelersById[item.id] ?? 0), 0);
      return {
        id: item.id, name: item.name, sourceScenarios: sources, sourceCount: sources.length,
        routeSourceSelected: routeTotals.selected, offerVisible: routeTotals.visible, qualified: routeTotals.qualified, chosen: routeTotals.chosen, granted: routeTotals.granted,
        merchantSourceCount: sources.filter((id) => merchantIds.has(id)).length,
        useScenarios: uses, crossAdventureUseRouteCount: uses.length,
        holder50: holders, laterOpportunityPct: percent(opportunities, holders), laterUsePct: percent(laterUses, holders),
        repairSupport: [...(repairRoutes.get(item.id) ?? [])], upgradeSupport: [...(upgradeRoutes.get(item.id) ?? [])],
        utilityClass: use?.classification ?? 'no-registered-callback',
      };
    });
    console.log('GEAR_ACQUISITION_UTILITY_MATRIX', JSON.stringify(allGearMatrix));
    const supplyProducts = Object.values(ITEMS).filter((item) => inventoryClass(item.id) === 'SUPPLY');
    const supplySourceRoutes = new Map<string, Set<string>>();
    const supplyUseRoutes = new Map<string, Set<string>>();
    for (const { effect, scenario } of allEffects) for (const id of Object.keys(effect.gainSupplies ?? {})) {
      const routes = supplySourceRoutes.get(id) ?? new Set<string>(); routes.add(scenario.id); supplySourceRoutes.set(id, routes);
    }
    for (const scenario of SCENARIOS) for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
      for (const id of [...Object.keys(choice.requirements?.supplies ?? {}), ...Object.keys(choice.effects?.consumeSupplies ?? {}), ...Object.keys(choice.chance?.successEffects?.consumeSupplies ?? {})]) {
        const routes = supplyUseRoutes.get(id) ?? new Set<string>(); routes.add(scenario.id); supplyUseRoutes.set(id, routes);
      }
    }
    const allSupplyMatrix = supplyProducts.map((item) => {
      const id = item.id;
      const routes = [...(supplySourceRoutes.get(id) ?? [])];
      const uses = [...(supplyUseRoutes.get(id) ?? [])];
      const rows = [7, 10].flatMap((month) => POLICIES.map((policy) => funnelRow(funnel, policy, month, id)));
      const sum = (select: (row: FunnelLedger[string]) => number) => rows.reduce((total, row) => total + select(row), 0);
      const holders = at50.reduce((total, row) => total + (row.supplyAcquirerTravellersById[id] ?? 0), 0);
      const opportunities = at50.reduce((total, row) => total + (row.supplyOpportunityAfterAcquisitionTravelersById[id] ?? 0), 0);
      const laterUses = at50.reduce((total, row) => total + (row.supplyLaterUseTravelersById[id] ?? 0), 0);
      return {
        id, name: item.name, sourceScenarios: routes, sourceCount: routes.length,
        routeSourceSelected: sum((row) => row.scenarioSelected), offerVisible: sum((row) => row.offerVisible), qualified: sum((row) => row.qualified), chosen: sum((row) => row.chosen), granted: sum((row) => row.resolverGranted),
        merchantSourceCount: routes.filter((sourceId) => merchantIds.has(sourceId)).length,
        useScenarios: uses, crossAdventureUseRouteCount: uses.length,
        holder50: holders, laterOpportunityPct: percent(opportunities, holders), laterUsePct: percent(laterUses, holders),
        stackLimit: item.stackLimit ?? 1,
      };
    });
    console.log('SUPPLY_ACQUISITION_UTILITY_MATRIX', JSON.stringify(allSupplyMatrix));
    console.log('MONEY_EFFECT_AUDIT', JSON.stringify(moneyAudit()));
    expect(reports).toHaveLength(40);
    expect(reports.every((row) => row.reached > 0)).toBe(true);
    expect(Object.keys(ITEMS).length).toBeGreaterThan(0);
  }, 600_000);
});
