import type { HistoricalPresence, RecentRiskEntry, RiskTier, Scenario } from './types';
import { scenarioRiskTier } from './riskClassification';
import { classifyScenario, getSeasonAvailability, scenarioAvailableInMonth } from './scenarioDiversity';

export const RECENT_SCENARIO_WINDOW = 5;
export const CATEGORY_HISTORY_WINDOW = 8;
const CATEGORY_RECENCY_WINDOW = 8;

export interface SelectionPressure {
  adventuresCompleted?: number;
  recentRiskHistory?: RecentRiskEntry[];
  categoryHistory?: string[];
  scenarioPlayCounts?: Record<string, number>;
  /** QA-only callers may supply a month; normal selection uses the browser-local month. */
  selectionMonth?: number;
}

const BASE_TIER_SHARES: Record<RiskTier, number> = { LOW: 0.56, MODERATE: 0.27, HIGH: 0.13, SEVERE: 0.04 };
const LONG_RUN_TIER_SHARES: Record<RiskTier, number> = { LOW: 0.27, MODERATE: 0.32, HIGH: 0.30, SEVERE: 0.11 };
const categoryCache = new WeakMap<Scenario, string>();
const metadataCache = new WeakMap<Scenario, ReturnType<typeof classifyScenario>>();
const riskCache = new WeakMap<Scenario, RiskTier>();

function scenarioMetadata(scenario: Scenario): ReturnType<typeof classifyScenario> {
  let metadata = metadataCache.get(scenario);
  if (!metadata) { metadata = classifyScenario(scenario); metadataCache.set(scenario, metadata); }
  return metadata;
}

function cachedRisk(scenario: Scenario): RiskTier {
  let tier = riskCache.get(scenario);
  if (!tier) { tier = scenarioRiskTier(scenario); riskCache.set(scenario, tier); }
  return tier;
}

/** Reuse the diversity taxonomy's authored/inferred primary activity; no parallel category registry. */
export function primaryScenarioCategory(scenario: Scenario): string {
  const cached = categoryCache.get(scenario);
  if (cached) return cached;
  const category = scenarioMetadata(scenario).activities[0] ?? 'other activity';
  categoryCache.set(scenario, category);
  return category;
}

export interface EligibleScenarioResult {
  scenarios: Scenario[];
  seasonEligibleCount: number;
  recentExcludedIds: string[];
  relaxedRecentIds: string[];
}

export function eligibleScenarioResult(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, selectionMonth = new Date().getMonth() + 1): EligibleScenarioResult {
  const seasonPool = scenarios.filter((scenario) => scenarioAvailableInMonth(scenario, selectionMonth));
  const recent = Array.isArray(recentScenarioIds) ? recentScenarioIds : recentScenarioIds ? [recentScenarioIds] : [];
  const knownRecent = [...new Set(recent)].filter((id) => seasonPool.some((scenario) => scenario.id === id)).slice(0, RECENT_SCENARIO_WINDOW);
  let excluded = knownRecent.length;
  let choices = seasonPool.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  while (!choices.length && excluded > 0) {
    excluded -= 1;
    choices = seasonPool.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  }
  return { scenarios: choices, seasonEligibleCount: seasonPool.length, recentExcludedIds: knownRecent.slice(0, excluded), relaxedRecentIds: knownRecent.slice(excluded) };
}

export function eligibleScenarios(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, selectionMonth = new Date().getMonth() + 1): Scenario[] {
  return eligibleScenarioResult(scenarios, recentScenarioIds, selectionMonth).scenarios;
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

export function replayWeight(completedPlays: number): number {
  if (completedPlays <= 0) return 1;
  if (completedPlays === 1) return 0.15;
  if (completedPlays === 2) return 0.045;
  return 0.012;
}

function historicalWeight(presence: HistoricalPresence): number {
  // Named cameos/events are deliberately uncommon, while remaining reachable.
  if (presence === 'CAMEO') return 0.82;
  if (presence === 'FEATURED') return 0.68;
  if (presence === 'HISTORICAL_EVENT') return 0.74;
  return 1;
}

function categoryRecencyWeight(category: string, history: string[]): number {
  const weightedAppearances = history.slice(0, CATEGORY_RECENCY_WINDOW).reduce((sum, entry, index) =>
    sum + (entry === category ? 1 / (1 + index * 0.45) : 0), 0);
  return Math.max(0.18, 1 / (1 + weightedAppearances * 1.15));
}

export interface ScenarioSelectionWeight {
  scenario: Scenario;
  tier: RiskTier;
  category: string;
  categoryWeight: number;
  riskWeight: number;
  withinCategoryWeight: number;
  weight: number;
  seasonalWeight: number;
  historicalWeight: number;
  replayWeight: number;
  completedPlays: number;
}

export interface SelectionDiagnostics {
  eligibleCount: number;
  seasonEligibleCount: number;
  relaxedRecentIds: string[];
  categoryWeights: Record<string, number>;
  scenarios: ScenarioSelectionWeight[];
  tierSummary: Record<RiskTier, { count: number; totalWeight: number }>;
}

function normalized<T extends { weight: number }>(values: T[]): T[] {
  const total = values.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return values;
  return values.map((entry) => ({ ...entry, weight: entry.weight / total }));
}

/** Two-stage draw: recover a primary activity category, then select within it. */
export function selectionDiagnostics(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, pressure: SelectionPressure = {}): SelectionDiagnostics {
  const month = pressure.selectionMonth ?? new Date().getMonth() + 1;
  const eligible = eligibleScenarioResult(scenarios, recentScenarioIds, month);
  const groups = new Map<string, Scenario[]>();
  for (const scenario of eligible.scenarios) {
    const category = primaryScenarioCategory(scenario);
    const group = groups.get(category) ?? [];
    group.push(scenario);
    groups.set(category, group);
  }

  const categoryRows = normalized([...groups.keys()].sort().map((category) => {
    const members = groups.get(category)!;
    // Replay pressure must survive the two-stage draw. Without this factor, a
    // category containing only one eligible story would normalize that story's
    // replay penalty away and make it just as likely as before.
    const replayExposure = members.reduce((sum, scenario) => {
      const completedPlays = Math.max(0, Math.floor(pressure.scenarioPlayCounts?.[scenario.id] ?? 0));
      return sum + replayWeight(completedPlays);
    }, 0) / members.length;
    return {
      category,
      weight: categoryRecencyWeight(category, pressure.categoryHistory ?? []) * replayExposure,
    };
  }));
  const categoryWeights = Object.fromEntries(categoryRows.map(({ category, weight }) => [category, weight]));
  const shares = tierShares(pressure);
  const output: ScenarioSelectionWeight[] = [];
  for (const [category, members] of groups) {
    const perTier = new Map<RiskTier, number>();
    for (const scenario of members) {
      const tier = cachedRisk(scenario);
      perTier.set(tier, (perTier.get(tier) ?? 0) + 1);
    }
    const within = normalized(members.map((scenario) => {
      const tier = cachedRisk(scenario);
      const completedPlays = Math.max(0, Math.floor(pressure.scenarioPlayCounts?.[scenario.id] ?? 0));
      const metadata = scenarioMetadata(scenario);
      const availability = getSeasonAvailability(scenario);
      const affinityActive = !availability.affinityMonths?.length || availability.affinityMonths.includes(month);
      const seasonalWeight = Math.max(1, Math.min(2.25, affinityActive ? (availability.weightBoost ?? 1) : 1));
      const specialWeight = historicalWeight(metadata.historicalPresence);
      const replay = replayWeight(completedPlays);
      const risk = (shares[tier] / (perTier.get(tier) ?? 1));
      return { scenario, tier, category, risk, weight: risk * seasonalWeight * specialWeight * replay, seasonalWeight, specialWeight, replay, completedPlays };
    }));
    for (const entry of within) output.push({
      scenario: entry.scenario, tier: entry.tier, category, categoryWeight: categoryWeights[category] ?? 0,
      riskWeight: entry.risk, withinCategoryWeight: entry.weight, weight: (categoryWeights[category] ?? 0) * entry.weight,
      seasonalWeight: entry.seasonalWeight, historicalWeight: entry.specialWeight,
      replayWeight: entry.replay, completedPlays: entry.completedPlays,
    });
  }
  const tierSummary: Record<RiskTier, { count: number; totalWeight: number }> = {
    LOW: { count: 0, totalWeight: 0 }, MODERATE: { count: 0, totalWeight: 0 }, HIGH: { count: 0, totalWeight: 0 }, SEVERE: { count: 0, totalWeight: 0 },
  };
  for (const entry of output) { tierSummary[entry.tier].count += 1; tierSummary[entry.tier].totalWeight += entry.weight; }
  return { eligibleCount: eligible.scenarios.length, seasonEligibleCount: eligible.seasonEligibleCount, relaxedRecentIds: eligible.relaxedRecentIds, categoryWeights, scenarios: output, tierSummary };
}

/** Returns overall two-stage probabilities for inspection and tests. */
export function scenarioSelectionWeights(scenarios: Scenario[], pressure: SelectionPressure = {}): ScenarioSelectionWeight[] {
  return selectionDiagnostics(scenarios, null, pressure).scenarios;
}

export function selectionTierSummary(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, pressure: SelectionPressure = {}): Record<RiskTier, { count: number; totalWeight: number }> {
  return selectionDiagnostics(scenarios, recentScenarioIds, pressure).tierSummary;
}

function draw<T extends { weight: number }>(entries: T[], random: () => number): T | undefined {
  if (!entries.length) return undefined;
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let point = Math.min(0.999999999, Math.max(0, random())) * total;
  return entries.find(({ weight }) => (point -= weight) < 0) ?? entries[entries.length - 1];
}

export function selectScenario(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, random = Math.random, pressure: SelectionPressure = {}): Scenario | undefined {
  const diagnostics = selectionDiagnostics(scenarios, recentScenarioIds, pressure);
  if (!diagnostics.scenarios.length) return undefined;
  const categories = Object.entries(diagnostics.categoryWeights).map(([category, weight]) => ({ category, weight }));
  const category = draw(categories, random)?.category;
  if (!category) return undefined;
  return draw(diagnostics.scenarios.filter((entry) => entry.category === category), random)?.scenario;
}

export interface SelectionSimulation {
  draws: number;
  scenarioCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  riskCounts: Record<RiskTier, number>;
  seasonalCount: number;
  historicalCount: number;
  repeatCount: number;
  recentFallbackCount: number;
}

/** Pure QA simulation: all evolving histories are local copies and never touch the supplied save. */
export function simulateScenarioSelection(scenarios: Scenario[], recentScenarioIds: string[] = [], pressure: SelectionPressure = {}, draws = 100, random = Math.random): SelectionSimulation {
  const result: SelectionSimulation = { draws, scenarioCounts: {}, categoryCounts: {}, riskCounts: { LOW: 0, MODERATE: 0, HIGH: 0, SEVERE: 0 }, seasonalCount: 0, historicalCount: 0, repeatCount: 0, recentFallbackCount: 0 };
  const month = pressure.selectionMonth ?? new Date().getMonth() + 1;
  const recent = [...recentScenarioIds];
  const categoryHistory = [...(pressure.categoryHistory ?? [])];
  const scenarioPlayCounts = { ...(pressure.scenarioPlayCounts ?? {}) };
  const recentRiskHistory = [...(pressure.recentRiskHistory ?? [])];
  let adventuresCompleted = pressure.adventuresCompleted ?? 0;
  for (let index = 0; index < draws; index++) {
    const pressureNow = { ...pressure, categoryHistory, scenarioPlayCounts, recentRiskHistory, adventuresCompleted };
    const details = selectionDiagnostics(scenarios, recent, pressureNow);
    if (details.relaxedRecentIds.length) result.recentFallbackCount++;
    const selected = selectScenario(scenarios, recent, random, pressureNow);
    if (!selected) continue;
    const meta = scenarioMetadata(selected);
    const category = primaryScenarioCategory(selected);
    const tier = cachedRisk(selected);
    const prior = scenarioPlayCounts[selected.id] ?? 0;
    result.scenarioCounts[selected.id] = (result.scenarioCounts[selected.id] ?? 0) + 1;
    result.categoryCounts[category] = (result.categoryCounts[category] ?? 0) + 1;
    result.riskCounts[tier]++;
    const availability = getSeasonAvailability(selected);
    if (availability.season !== 'ALL_YEAR' || (availability.affinityMonths?.includes(month) && (availability.weightBoost ?? 1) > 1)) result.seasonalCount++;
    if (meta.historicalPresence !== 'NONE' && meta.historicalPresence !== 'INSPIRED') result.historicalCount++;
    if (prior > 0) result.repeatCount++;
    scenarioPlayCounts[selected.id] = prior + 1;
    categoryHistory.unshift(category);
    categoryHistory.length = Math.min(categoryHistory.length, CATEGORY_HISTORY_WINDOW);
    recent.unshift(selected.id);
    recent.length = Math.min(recent.length, RECENT_SCENARIO_WINDOW);
    recentRiskHistory.unshift({ scenarioId: selected.id, tier });
    recentRiskHistory.length = Math.min(recentRiskHistory.length, 8);
    adventuresCompleted++;
  }
  return result;
}

export function isQaMode(search: string): boolean {
  return new URLSearchParams(search).get('qa') === '1';
}
