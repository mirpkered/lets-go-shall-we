import { describe, expect, it } from 'vitest';
import { eligibleScenarioResult, isQaMode, primaryScenarioCategory, replayWeight, scenarioSelectionWeights, selectScenario, selectionDiagnostics, selectionTierSummary, simulateScenarioSelection } from './scenarioSelection';
import { SCENARIOS } from './scenarios';
import { findScenarioGraphProblems } from './scenarioGraph';
import { choose, failCharacter, finishSuccess, retireCharacter, startAdventure } from './engine';
import { newCharacter } from './engine';
import type { SaveData } from './types';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';
import { RISK_TIERS, scenarioRiskTier } from './riskClassification';
import type { Scenario } from './types';
import { classifyScenario } from './scenarioDiversity';

function selectionFixture(id: string, activity: string, extra: Partial<Scenario['diversity']> = {}): Scenario {
  return { id, title: id, subtitle: '', startScene: 'start', diversity: { activities: [activity], ...extra }, scenes: { start: { id: 'start', title: 'Start', text: 'A short authored test scene.', ending: 'success', choices: [] } } };
}

describe('player scenario selection and QA mode', () => {
  it('selects a registered scenario for a normal start', () => {
    expect(SCENARIOS).toContain(selectScenario(SCENARIOS, null, () => 0));
    expect(SCENARIOS.map((scenario) => scenario.id)).toContain(selectScenario(SCENARIOS, null, () => 0.99)?.id);
  });

  it('avoids immediately repeating the recent scenario when an alternative exists', () => {
    for (const recent of SCENARIOS) {
      expect(selectScenario(SCENARIOS, recent.id, () => 0)).not.toBe(recent);
      expect(selectScenario(SCENARIOS, recent.id, () => 0.99)).not.toBe(recent);
    }
  });

  it('still selects the only eligible scenario when there is just one', () => {
    expect(selectScenario([SCENARIOS[0]], SCENARIOS[0].id, () => 0)?.id).toBe(SCENARIOS[0].id);
  });

  it('excludes the five most recently completed adventures, then releases the oldest', () => {
    const scenarios = SCENARIOS.slice(0, 7);
    const ids = scenarios.slice(0, 5).map((scenario) => scenario.id);
    expect(eligibleScenarioResult(scenarios, ids, 7).scenarios.map(({ id }) => id).sort()).toEqual([scenarios[5].id, scenarios[6].id].sort());
    const afterOneMoreEnding = [scenarios[5].id, ...ids.slice(0, 4)];
    expect(eligibleScenarioResult(scenarios, afterOneMoreEnding, 7).scenarios.map(({ id }) => id)).toContain(ids[4]);
  });

  it('gracefully shrinks the exclusion window when the available pool is small', () => {
    expect(selectScenario(SCENARIOS.slice(0, 2), SCENARIOS.slice(0, 5).map((scenario) => scenario.id), () => 0)?.id).toBe(SCENARIOS[1].id);
  });

  it('prevents the observed Cold Storage and All Aboard repeat patterns', () => {
    const coldStorage = SCENARIOS.find((scenario) => scenario.id === 'cold-storage')!;
    const allAboard = SCENARIOS.find((scenario) => scenario.id === 'last-stop')!;
    expect(coldStorage).toBeDefined();
    expect(allAboard).toBeDefined();
    const coldStorageRecentlyPlayed = [coldStorage.id, ...SCENARIOS.filter((entry) => entry.id !== coldStorage.id).slice(0, 3).map((entry) => entry.id)];
    const allAboardRecentlyPlayed = [allAboard.id, ...SCENARIOS.filter((entry) => entry.id !== allAboard.id).slice(0, 2).map((entry) => entry.id)];
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      expect(selectScenario(SCENARIOS, coldStorageRecentlyPlayed, random)?.id).not.toBe(coldStorage.id);
      expect(selectScenario(SCENARIOS, allAboardRecentlyPlayed, random)?.id).not.toBe(allAboard.id);
    }
  });

  it('records finished and abandoned normal adventures, but not QA runs', () => {
    const base: SaveData = { version: 1, bank: [], character: newCharacter(), run: null };
    const abandoned = failCharacter(startAdventure(base, SCENARIOS[0]));
    expect(abandoned.recentScenarioIds).toEqual([SCENARIOS[0].id]);
    let completed = startAdventure(abandoned, SCENARIOS[1]);
    completed.run!.status = 'success';
    completed = finishSuccess(completed, null);
    expect(completed.recentScenarioIds).toEqual([SCENARIOS[1].id, SCENARIOS[0].id]);
    expect(completed.recentRiskHistory).toHaveLength(1);
    expect(completed.recentRiskHistory?.[0]).toMatchObject({ scenarioId: SCENARIOS[1].id, tier: scenarioRiskTier(SCENARIOS[1]) });
    expect(abandoned.recentRiskHistory).toBeUndefined();
    const diedRun = startAdventure(base, SCENARIOS[2]);
    diedRun.run!.status = 'death';
    expect(failCharacter(diedRun).recentRiskHistory).toEqual([{ scenarioId: SCENARIOS[2].id, tier: scenarioRiskTier(SCENARIOS[2]) }]);
    const qa = startAdventure(base, SCENARIOS[2], Math.random, true);
    expect(qa.character?.scenarioCategoryHistory).toEqual([]);
    expect(qa.character?.scenarioPlayCounts).toEqual({});
    const qaEnded = failCharacter(qa);
    expect(qaEnded.recentScenarioIds).toBeUndefined();
    expect(qaEnded.recentRiskHistory).toBeUndefined();
  });

  it('records category on a normal start, counts only authored endings, and resets traveler history on loss or retirement', () => {
    const scenario = selectionFixture('selection-life', 'social interaction');
    const base: SaveData = { version: 1, bank: [], character: newCharacter(), run: null };
    const started = startAdventure(base, scenario);
    expect(started.character?.scenarioCategoryHistory).toEqual(['social interaction']);
    expect(started.character?.scenarioPlayCounts).toEqual({});
    const abandoned = failCharacter(started);
    expect(abandoned.character).toBeNull();
    expect(abandoned.recentScenarioIds).toEqual([scenario.id]);

    const readyToComplete = startAdventure(base, scenario);
    readyToComplete.run!.status = 'success';
    const completed = finishSuccess(readyToComplete, null);
    expect(completed.character?.scenarioPlayCounts).toEqual({ [scenario.id]: 1 });
    expect(completed.character?.scenarioCategoryHistory).toEqual(['social interaction']);
    expect(finishSuccess(completed, null).character?.scenarioPlayCounts).toEqual({ [scenario.id]: 1 });
    const retired = retireCharacter(completed);
    expect(retired.character).toBeNull();
    expect(retired.recentScenarioIds).toEqual([scenario.id]);
  });

  it('counts death only when the authored death ending is reached and keeps device recency', () => {
    const scenario: Scenario = { id: 'selection-death', title: 'Selection Death Test', subtitle: '', startScene: 'start', scenes: {
      start: { id: 'start', title: 'Start', text: 'A clearly impossible fall is the test hazard.', choices: [{ id: 'fall', label: 'Take the fatal fall', next: 'death', effects: { health: -10 } }] },
      death: { id: 'death', title: 'Death', text: 'The traveler dies.', ending: 'death', choices: [] },
    } };
    let state = startAdventure({ version: 1, bank: [], character: newCharacter(), run: null }, scenario);
    state = choose(state, scenario, scenario.scenes.start.choices[0], () => 0);
    expect(state.run?.status).toBe('death');
    expect(state.character?.scenarioPlayCounts).toEqual({ [scenario.id]: 1 });
    const lost = failCharacter(state);
    expect(lost.character).toBeNull();
    expect(lost.recentScenarioIds).toEqual([scenario.id]);
  });

  it('assigns every registered scenario a valid consequence-based risk tier', () => {
    expect(SCENARIOS).toHaveLength(431);
    for (const scenario of SCENARIOS) expect(RISK_TIERS).toContain(scenarioRiskTier(scenario));
    for (const scenario of SCENARIOS.filter((entry) => Object.values(entry.scenes).some((scene) => scene.ending === 'death'))) {
      expect(['HIGH', 'SEVERE']).toContain(scenarioRiskTier(scenario));
    }
    const distribution = Object.fromEntries(RISK_TIERS.map((tier) => [tier, SCENARIOS.filter((scenario) => scenarioRiskTier(scenario) === tier).length]));
    expect(distribution).toEqual({ LOW: 215, MODERATE: 101, HIGH: 79, SEVERE: 36 });
    expect(scenarioRiskTier(SCENARIOS.find(({ id }) => id === 'gone-fishing')!)).toBe('LOW');
    expect(scenarioRiskTier(SCENARIOS.find(({ id }) => id === 'under-the-ice')!)).toBe('SEVERE');
    expect(scenarioRiskTier(SCENARIOS.find(({ id }) => id === 'high-water')!)).toBe('SEVERE');
    expect(scenarioRiskTier(SCENARIOS.find(({ id }) => id === 'smoke-on-the-hill')!)).toBe('HIGH');
  });

  it('increases higher-tier selection shares gradually with traveler longevity', () => {
    const fresh = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 0 });
    const established = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 20 });
    const longLived = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 60 });
    expect(established.HIGH.totalWeight + established.SEVERE.totalWeight).toBeGreaterThan(fresh.HIGH.totalWeight + fresh.SEVERE.totalWeight);
    expect(longLived.HIGH.totalWeight + longLived.SEVERE.totalWeight).toBeGreaterThan(established.HIGH.totalWeight + established.SEVERE.totalWeight);
    expect(fresh.LOW.totalWeight).toBeGreaterThan(fresh.HIGH.totalWeight);
    expect(longLived.LOW.count).toBeGreaterThan(0);
    expect(scenarioSelectionWeights(SCENARIOS, { adventuresCompleted: 80 }).filter(({ tier }) => tier === 'LOW').every(({ weight }) => weight > 0)).toBe(true);
  });

  it('keeps each risk tier possible to a fresh traveler instead of locking to a prescribed order', () => {
    const examples = ['market-day', 'bridge-out', 'smoke-on-the-hill', 'under-the-ice'].map((id) => SCENARIOS.find((scenario) => scenario.id === id)!);
    const weights = scenarioSelectionWeights(examples, { adventuresCompleted: 0 });
    const categories = Object.keys(selectionDiagnostics(examples, null, { selectionMonth: 7 }).categoryWeights);
    const diagnostics = selectionDiagnostics(examples, null, { selectionMonth: 7 });
    for (const entry of weights) {
      expect(entry.weight).toBeGreaterThan(0);
      const categoryIndex = categories.indexOf(entry.category);
      const sameCategory = diagnostics.scenarios.filter(({ category }) => category === entry.category);
      const withinStart = sameCategory.slice(0, sameCategory.findIndex(({ scenario }) => scenario.id === entry.scenario.id)).reduce((sum, candidate) => sum + candidate.withinCategoryWeight, 0);
      const rolls = [(categoryIndex + 0.5) / categories.length, withinStart + entry.withinCategoryWeight / 2];
      let rollIndex = 0;
      expect(selectScenario(examples, null, () => rolls[rollIndex++] ?? 0.5, { adventuresCompleted: 0, selectionMonth: 7 })?.id).toBe(entry.scenario.id);
    }
  });

  it('lets an extended low-risk streak softly increase higher-risk selection weights', () => {
    const pressure = { adventuresCompleted: 8, recentRiskHistory: Array.from({ length: 5 }, (_, index) => ({ scenarioId: `low-${index}`, tier: 'LOW' as const })) };
    const ordinary = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 8 });
    const afterLows = selectionTierSummary(SCENARIOS, null, pressure);
    expect(afterLows.HIGH.totalWeight + afterLows.SEVERE.totalWeight).toBeGreaterThan(ordinary.HIGH.totalWeight + ordinary.SEVERE.totalWeight);
    expect(selectScenario(SCENARIOS, null, () => 0, pressure)).toBeDefined();
  });

  it('balances primary activity categories before weighting their different library sizes', () => {
    const examples = [selectionFixture('social-a', 'social interaction'), selectionFixture('social-b', 'social interaction'), selectionFixture('social-c', 'social interaction'), selectionFixture('social-d', 'social interaction'), selectionFixture('work-a', 'labor/repair')];
    const diagnostics = selectionDiagnostics(examples, null, { selectionMonth: 7 });
    expect(Object.values(diagnostics.categoryWeights)).toEqual([0.5, 0.5]);
    for (const category of Object.keys(diagnostics.categoryWeights)) expect(diagnostics.scenarios.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.weight, 0)).toBeCloseTo(0.5, 8);
    expect(diagnostics.scenarios.find(({ scenario }) => scenario.id === 'social-a')!.weight).toBeCloseTo(0.125, 8);
  });

  it('reduces an overrepresented category and restores it after it leaves recent history', () => {
    const examples = [selectionFixture('social-a', 'social interaction'), selectionFixture('work-a', 'labor/repair')];
    const neutral = selectionDiagnostics(examples, null, { selectionMonth: 7 });
    const pressured = selectionDiagnostics(examples, null, { categoryHistory: Array(8).fill('social interaction'), selectionMonth: 7 });
    const recovered = selectionDiagnostics(examples, null, { categoryHistory: Array(8).fill('labor/repair'), selectionMonth: 7 });
    expect(pressured.categoryWeights['social interaction']).toBeLessThan(neutral.categoryWeights['social interaction']);
    expect(recovered.categoryWeights['social interaction']).toBeGreaterThan(pressured.categoryWeights['social interaction']);
    const weightedLaborAppearances = Array.from({ length: 8 }, (_, index) => 1 / (1 + index * 0.45)).reduce((sum, value) => sum + value, 0);
    const laborWeight = 1 / (1 + 1.15 * weightedLaborAppearances);
    expect(recovered.categoryWeights['social interaction']).toBeCloseTo(1 / (1 + laborWeight), 8);
  });

  it('uses nonzero, sharply declining scenario replay modifiers', () => {
    expect([0, 1, 2, 3, 10].map(replayWeight)).toEqual([1, 0.15, 0.045, 0.012, 0.012]);
    const examples = [selectionFixture('played', 'social interaction'), selectionFixture('fresh', 'social interaction')];
    const weights = scenarioSelectionWeights(examples, { scenarioPlayCounts: { played: 3 }, selectionMonth: 7 });
    expect(weights.find(({ scenario }) => scenario.id === 'fresh')!.weight).toBeGreaterThan(weights.find(({ scenario }) => scenario.id === 'played')!.weight * 50);
  });

  it('applies seasonal hard eligibility and bounded seasonal affinity only after category balancing', () => {
    const winter = selectionFixture('winter', 'social interaction', { availability: { season: 'WINTER', months: [12], weightBoost: 2 } });
    const ordinary = selectionFixture('ordinary', 'social interaction');
    expect(selectionDiagnostics([winter, ordinary], null, { selectionMonth: 7 }).scenarios.map(({ scenario }) => scenario.id)).toEqual(['ordinary']);
    const december = selectionDiagnostics([winter, ordinary], null, { selectionMonth: 12 });
    expect(december.scenarios.find(({ scenario }) => scenario.id === 'winter')!.weight).toBeGreaterThan(december.scenarios.find(({ scenario }) => scenario.id === 'ordinary')!.weight);
  });

  it('uses authored historical-presence metadata as a modest rarity modifier', () => {
    const ordinary = selectionFixture('ordinary', 'social interaction');
    const cameo = selectionFixture('cameo', 'social interaction', { historicalPresence: 'CAMEO', historicalReferences: ['Ada Example'], historicalPortrayal: 'GROUNDED' });
    const weights = selectionDiagnostics([ordinary, cameo], null, { selectionMonth: 7 }).scenarios;
    expect(weights.find(({ scenario }) => scenario.id === 'cameo')!.historicalWeight).toBe(0.82);
    expect(weights.find(({ scenario }) => scenario.id === 'ordinary')!.weight).toBeGreaterThan(weights.find(({ scenario }) => scenario.id === 'cameo')!.weight);
  });

  it('simulates many starts without mutating supplied traveler or device histories', () => {
    const categoryHistory = ['social interaction', 'labor/repair'];
    const scenarioPlayCounts = { 'market-day': 2 };
    const recentScenarioIds = ['gone-fishing'];
    const snapshot = JSON.stringify({ categoryHistory, scenarioPlayCounts, recentScenarioIds });
    const result = simulateScenarioSelection(SCENARIOS, recentScenarioIds, { categoryHistory, scenarioPlayCounts, selectionMonth: 7 }, 1000, (() => { let seed = 7541; return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646; })());
    expect(result.draws).toBe(1000);
    expect(Object.values(result.categoryCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(Object.values(result.scenarioCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(result.repeatCount).toBeGreaterThan(0);
    expect(eligibleScenarioResult(SCENARIOS, recentScenarioIds, 7).scenarios.map(({ id }) => id)).not.toContain('gone-fishing');
    expect(JSON.stringify({ categoryHistory, scenarioPlayCounts, recentScenarioIds })).toBe(snapshot);
  }, 15_000);

  it('handles a large synthetic library across 1,000 simulated starts', () => {
    const activities = ['social interaction', 'labor/repair', 'travel/navigation', 'animal care', 'commerce/property', 'weather/shelter'];
    const largeLibrary = Array.from({ length: 1000 }, (_, index) => selectionFixture(`synthetic-${index}`, activities[index % activities.length]));
    const result = simulateScenarioSelection(largeLibrary, [], { selectionMonth: 7 }, 1000, (() => { let seed = 9187; return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646; })());
    expect(result.draws).toBe(1000);
    expect(Object.values(result.scenarioCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(Object.values(result.categoryCounts)).toHaveLength(activities.length);
    expect(Object.values(result.categoryCounts).every((count) => count > 0)).toBe(true);
  }, 15_000);

  it('keeps primary categories inside the existing diversity activity taxonomy', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'market-day')!;
    expect(primaryScenarioCategory(scenario)).toBe(classifyScenario(scenario).activities[0]);
  });

  it('does not guarantee a dangerous story on a fixed cadence and gives recent danger room to relax', () => {
    const lowOnly = SCENARIOS.filter((entry) => scenarioRiskTier(entry) === 'LOW');
    const lowSelection = selectScenario(lowOnly, null, () => 0, { adventuresCompleted: 80 });
    expect(lowSelection).toBeDefined();
    expect(scenarioRiskTier(lowSelection!)).toBe('LOW');
    const baseline = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 40 });
    const recentDanger = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 40, recentRiskHistory: [
      { scenarioId: 'high-a', tier: 'HIGH' }, { scenarioId: 'severe-b', tier: 'SEVERE' }, { scenarioId: 'high-c', tier: 'HIGH' },
    ] });
    expect(recentDanger.HIGH.totalWeight + recentDanger.SEVERE.totalWeight).toBeLessThan(baseline.HIGH.totalWeight + baseline.SEVERE.totalWeight);
  });

  it('starts either QA-selected scenario directly through the same run initializer', () => {
    const base: SaveData = { version: 1, bank: [], character: newCharacter(), run: null };
    for (const scenario of SCENARIOS) expect(startAdventure(base, scenario).run?.scenarioId).toBe(scenario.id);
  });

  it('does not let a new start replace an active run', () => {
    const first = startAdventure({ version: 1, bank: [], character: null, run: null }, SCENARIOS[0]);
    expect(startAdventure(first, SCENARIOS[1])).toBe(first);
    expect(first.run?.scenarioId).toBe(SCENARIOS[0].id);
  });

  it('enables QA only for the exact qa=1 query parameter', () => {
    expect(isQaMode('')).toBe(false);
    expect(isQaMode('?qa=true')).toBe(false);
    expect(isQaMode('?qa=1')).toBe(true);
  });

  it('keeps QA markup absent for normal players and offers direct launch only in QA mode', () => {
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(isQaMode(''), empty, SCENARIOS, ITEMS)).toBe('');
    const tools = renderQaPanel(isQaMode('?qa=1'), empty, SCENARIOS, ITEMS);
    expect(tools).toContain('For Whom the Bell Tolls · HIGH');
    expect(tools).toContain('All Aboard! · HIGH');
    expect(tools).toContain('Aww, Rats!! · HIGH');
    expect(tools).toContain('What’s Mine is Mine · HIGH');
    expect(tools).toContain('The Last Room on the Left · HIGH');
    expect(tools).toContain('Dead Man’s Hand · HIGH');
    expect(tools).toContain('Bridge Out · MODERATE');
    expect(tools).toContain('The Long Way Home · HIGH');
    expect(tools).toContain('No Vacancy · SEVERE');
    expect(tools).toContain('Cold Storage · HIGH');
    expect(tools).toContain('High Water · SEVERE');
    expect(tools).toContain('One More Round · MODERATE');
    expect(tools).toContain('The Road Below · HIGH');
    expect(tools).toContain('Smoke on the Hill · HIGH');
    expect(tools).toContain('Down to the Last Match · HIGH');
    expect(tools).toContain('The Man in the Ditch · HIGH');
    expect(tools).toContain('Risk checks');
    expect(tools).toContain('data-risk-tier="SEVERE"');
    expect(tools).toContain('nextSelectionRiskWeights');
    expect(tools).toContain('Clear all local save data');
    expect(tools).toContain('data-qa-start');
  });

  it('does not offer a QA scenario start while a run is active', () => {
    const character = newCharacter();
    const active: SaveData = { version: 1, bank: [], character, run: startAdventure({ version: 1, bank: [], character, run: null }, SCENARIOS[0]).run };
    const tools = renderQaPanel(true, active, SCENARIOS, ITEMS);
    expect(tools).toContain('Clear active run');
    expect(tools).toContain('riskTier');
    expect(tools).toContain('recentRiskHistory');
    expect(tools).toContain('nextSelectionRiskWeights');
    expect(tools).not.toContain('data-qa-start');
  });

  it.each(SCENARIOS)('$title has a forward-only scene graph', (scenario) => {
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
  });
});
