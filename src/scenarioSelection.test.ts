import { describe, expect, it } from 'vitest';
import { isQaMode, scenarioSelectionWeights, selectScenario, selectionTierSummary } from './scenarioSelection';
import { SCENARIOS } from './scenarios';
import { findScenarioGraphProblems } from './scenarioGraph';
import { failCharacter, finishSuccess, startAdventure } from './engine';
import { newCharacter } from './engine';
import type { SaveData } from './types';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';
import { RISK_TIERS, scenarioRiskTier } from './riskClassification';

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
    expect(selectScenario(scenarios, ids, () => 0)?.id).toBe(scenarios[5].id);
    const afterOneMoreEnding = [scenarios[5].id, ...ids.slice(0, 4)];
    expect(selectScenario(scenarios, afterOneMoreEnding, () => 0)?.id).toBe(ids[4]);
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
    const qa = startAdventure(base, SCENARIOS[2]);
    qa.run!.qaMode = true;
    const qaEnded = failCharacter(qa);
    expect(qaEnded.recentScenarioIds).toBeUndefined();
    expect(qaEnded.recentRiskHistory).toBeUndefined();
  });

  it('assigns every registered scenario a valid consequence-based risk tier', () => {
    expect(SCENARIOS).toHaveLength(175);
    for (const scenario of SCENARIOS) expect(RISK_TIERS).toContain(scenarioRiskTier(scenario));
    for (const scenario of SCENARIOS.filter((entry) => Object.values(entry.scenes).some((scene) => scene.ending === 'death'))) {
      expect(['HIGH', 'SEVERE']).toContain(scenarioRiskTier(scenario));
    }
    const distribution = Object.fromEntries(RISK_TIERS.map((tier) => [tier, SCENARIOS.filter((scenario) => scenarioRiskTier(scenario) === tier).length]));
    expect(distribution).toEqual({ LOW: 112, MODERATE: 34, HIGH: 20, SEVERE: 9 });
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
    let cumulative = 0;
    for (const entry of weights) {
      expect(entry.weight).toBeGreaterThan(0);
      expect(selectScenario(examples, null, () => cumulative + entry.weight / 2, { adventuresCompleted: 0 })?.id).toBe(entry.scenario.id);
      cumulative += entry.weight;
    }
  });

  it('lets an extended low-risk streak softly increase higher-risk selection weights', () => {
    const pressure = { adventuresCompleted: 8, recentRiskHistory: Array.from({ length: 5 }, (_, index) => ({ scenarioId: `low-${index}`, tier: 'LOW' as const })) };
    const ordinary = selectionTierSummary(SCENARIOS, null, { adventuresCompleted: 8 });
    const afterLows = selectionTierSummary(SCENARIOS, null, pressure);
    expect(afterLows.HIGH.totalWeight + afterLows.SEVERE.totalWeight).toBeGreaterThan(ordinary.HIGH.totalWeight + ordinary.SEVERE.totalWeight);
    expect(selectScenario(SCENARIOS, null, () => 0, pressure)).toBeDefined();
  });

  it('does not guarantee a dangerous story on a fixed cadence and gives recent danger room to relax', () => {
    const lowOnly = SCENARIOS.filter((entry) => scenarioRiskTier(entry) === 'LOW');
    expect(selectScenario(lowOnly, null, () => 0, { adventuresCompleted: 80 })?.id).toBe(lowOnly[0].id);
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
