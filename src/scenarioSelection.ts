import type { RecentRiskEntry, RiskTier, Scenario } from './types';
import { scenarioRiskTier } from './riskClassification';

export const RECENT_SCENARIO_WINDOW = 5;

export interface SelectionPressure { adventuresCompleted?: number; recentRiskHistory?: RecentRiskEntry[] }

const BASE_TIER_SHARES: Record<RiskTier, number> = { LOW: 0.56, MODERATE: 0.27, HIGH: 0.13, SEVERE: 0.04 };
const LONG_RUN_TIER_SHARES: Record<RiskTier, number> = { LOW: 0.27, MODERATE: 0.32, HIGH: 0.30, SEVERE: 0.11 };

export function eligibleScenarios(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined): Scenario[] {
  const recent = Array.isArray(recentScenarioIds) ? recentScenarioIds : recentScenarioIds ? [recentScenarioIds] : [];
  const knownRecent = [...new Set(recent)].filter((id) => scenarios.some((scenario) => scenario.id === id)).slice(0, RECENT_SCENARIO_WINDOW);
  let excluded = knownRecent.length;
  let choices = scenarios.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  while (!choices.length && excluded > 0) {
    excluded -= 1;
    choices = scenarios.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  }
  return choices;
}

function tierShares(pressure: SelectionPressure): Record<RiskTier, number> {
  const count = Math.max(0, pressure.adventuresCompleted ?? 0);
  const experience = 1 - Math.exp(-count / 12);
  const shares = Object.fromEntries((Object.keys(BASE_TIER_SHARES) as RiskTier[]).map((tier) => [
    tier, BASE_TIER_SHARES[tier] + (LONG_RUN_TIER_SHARES[tier] - BASE_TIER_SHARES[tier]) * experience,
  ])) as Record<RiskTier, number>;

  const history = pressure.recentRiskHistory ?? [];
  const lowStreak = history.slice(0, 8).findIndex((entry) => entry.tier !== 'LOW');
  const trailingLows = (lowStreak < 0 ? history.length : lowStreak);
  const multiplier = Math.min(3, 1 + trailingLows * 0.35);
  shares.MODERATE *= 1 + trailingLows * 0.12;
  shares.HIGH *= multiplier;
  shares.SEVERE *= multiplier;
  const recentDanger = history.slice(0, 3).filter((entry) => entry.tier === 'HIGH' || entry.tier === 'SEVERE').length;
  if (recentDanger) {
    shares.HIGH *= Math.max(0.55, 1 - recentDanger * 0.16);
    shares.SEVERE *= Math.max(0.5, 1 - recentDanger * 0.2);
  }
  const total = Object.values(shares).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries((Object.keys(shares) as RiskTier[]).map((tier) => [tier, shares[tier] / total])) as Record<RiskTier, number>;
}

/** Returns relative per-scenario weights; each available tier receives a soft share of the pool. */
export function scenarioSelectionWeights(scenarios: Scenario[], pressure: SelectionPressure = {}): { scenario: Scenario; tier: RiskTier; weight: number }[] {
  const tierCounts = new Map<RiskTier, number>();
  const tiers = new Map<Scenario, RiskTier>();
  for (const scenario of scenarios) {
    const tier = scenarioRiskTier(scenario);
    tiers.set(scenario, tier);
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
  }
  const shares = tierShares(pressure);
  const availableShare = [...tierCounts.keys()].reduce((sum, tier) => sum + shares[tier], 0);
  return scenarios.map((scenario) => {
    const tier = tiers.get(scenario)!;
    return { scenario, tier, weight: (shares[tier] / availableShare) / tierCounts.get(tier)! };
  });
}

export function selectionTierSummary(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, pressure: SelectionPressure = {}): Record<RiskTier, { count: number; totalWeight: number }> {
  const weighted = scenarioSelectionWeights(eligibleScenarios(scenarios, recentScenarioIds), pressure);
  const summary: Record<RiskTier, { count: number; totalWeight: number }> = {
    LOW: { count: 0, totalWeight: 0 }, MODERATE: { count: 0, totalWeight: 0 }, HIGH: { count: 0, totalWeight: 0 }, SEVERE: { count: 0, totalWeight: 0 },
  };
  for (const entry of weighted) { summary[entry.tier].count += 1; summary[entry.tier].totalWeight += entry.weight; }
  return summary;
}

export function selectScenario(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, random = Math.random, pressure: SelectionPressure = {}): Scenario | undefined {
  const weighted = scenarioSelectionWeights(eligibleScenarios(scenarios, recentScenarioIds), pressure);
  if (!weighted.length) return undefined;
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let point = Math.min(0.999999999, Math.max(0, random())) * total;
  return weighted.find(({ weight }) => (point -= weight) < 0)?.scenario ?? weighted.at(-1)?.scenario;
}

export function isQaMode(search: string): boolean {
  return new URLSearchParams(search).get('qa') === '1';
}
