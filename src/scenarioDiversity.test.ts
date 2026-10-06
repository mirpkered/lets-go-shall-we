import { describe, expect, it } from 'vitest';
import { analyzeScenarioLibrary, classifyScenario, scenarioAvailableInMonth, validateScenarioMetadata } from './scenarioDiversity';
import { eligibleScenarios, scenarioSelectionWeights, selectScenario } from './scenarioSelection';
import { renderQaPanel } from './qaPanel';
import { startAdventure, newCharacter } from './engine';
import { SCENARIOS } from './scenarios';
import { COLD_STORAGE } from './scenarios/coldStorage';
import { DEEP_EXPLORATION_ADVENTURES } from './scenarios/deepExplorationBatch';
import type { Scenario } from './types';

const seasonalFixture = (season: 'OCTOBER' | 'DECEMBER', id: string): Scenario => ({
  ...COLD_STORAGE,
  id,
  title: id,
  diversity: { availability: { season, weightBoost: 1.6 } },
});

describe('scenario diversity and seasonal framework', () => {
  const october = seasonalFixture('OCTOBER', 'october-test');
  const december = seasonalFixture('DECEMBER', 'december-test');
  const annual = COLD_STORAGE;

  it('classifies the whole registered library with complete searchable rows', () => {
    const audit = analyzeScenarioLibrary(SCENARIOS);
    expect(audit.total).toBe(SCENARIOS.length);
    expect(audit.classified).toBe(SCENARIOS.length);
    expect(audit.rows).toHaveLength(SCENARIOS.length);
    expect(audit.rows.every(({ id, title, metadata }) => id && title && metadata.distinctiveHook && metadata.riskTier && metadata.availability)).toBe(true);
    expect(validateScenarioMetadata(SCENARIOS)).toEqual([]);
    expect(Object.keys(audit.distributions)).toContain('fantasyDensity');
    expect(audit.similarityWarnings).toEqual(expect.any(Array));
    expect(audit.structuralWarnings).toEqual(expect.any(Array));
  });

  it('rejects duplicate IDs and impossible enum or seasonal metadata without turning similarity warnings into failures', () => {
    const invalid: Scenario = { ...october, id: 'invalid-metadata', diversity: { fantasyDensity: 'ALIEN' as never, depthClass: 'CINEMATIC' as never, riskTier: 'EXTREME' as never, availability: { season: 'CUSTOM', months: [0, 13] } as never } };
    expect(validateScenarioMetadata([annual, { ...annual }])).toContain(`Duplicate scenario ID: ${annual.id}`);
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('invalid fantasy density'))).toBe(true);
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('invalid scenario depth class'))).toBe(true);
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('invalid risk tier'))).toBe(true);
    expect(validateScenarioMetadata([{ ...october, id: 'missing-authored-risk', diversity: { availability: { season: 'OCTOBER' } } }])).toContain('missing-authored-risk: explicit diversity metadata requires an authored risk tier');
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('seasonal month configuration'))).toBe(true);
    expect(analyzeScenarioLibrary([annual, { ...annual, id: 'similar-but-valid' }]).similarityWarnings.length).toBeGreaterThan(0);
  });

  it('keeps risk classification canonical and independent of tone, length, or fantasy', () => {
    const metadata = classifyScenario(SCENARIOS.find(({ id }) => id === 'under-the-ice')!);
    expect(metadata.riskTier).toBe('SEVERE');
    expect(metadata.fantasyDensity).toBe('NONE');
    expect(metadata.combat).toBe('NONE');
  });

  it('classifies legacy adventures as having no historical presence unless explicitly tagged', () => {
    const audit = analyzeScenarioLibrary(SCENARIOS);
    expect(audit.distributions.historicalPresence).toEqual({ NONE: SCENARIOS.length });
    expect(audit.historicalReferenceCounts).toEqual({});
    expect(audit.rows.every(({ metadata }) => metadata.historicalReferences.length === 0 && metadata.historicalPortrayal === 'NOT_APPLICABLE')).toBe(true);
  });

  it('reports intended depth separately from raw scene-count length', () => {
    const audit = analyzeScenarioLibrary(SCENARIOS);
    expect(audit.distributions.depthClass).toEqual({ ENCOUNTER: 59, ADVENTURE: 562, DEEP_EXPLORATION: 16 });
    expect(DEEP_EXPLORATION_ADVENTURES).toHaveLength(14);
    expect(audit.rows.filter(({ metadata }) => metadata.depthClass === 'DEEP_EXPLORATION')).toHaveLength(16);
    expect(['broken-bell', 'whats-mine', ...DEEP_EXPLORATION_ADVENTURES.map(({ id }) => id)].every((id) => classifyScenario(SCENARIOS.find((scenario) => scenario.id === id)!).depthClass === 'DEEP_EXPLORATION')).toBe(true);
    for (const id of ['payment-in-kind', 'market-day', 'the-old-mans-story', 'skipping-stones', 'the-sixth-chair', 'the-sheep-counting-exam', 'the-candle-ends', 'the-music-outside', 'the-bell-after-midnight', 'a-seat-by-the-fire', 'the-bee-yard', 'the-swimming-hole', 'the-county-fair', 'a-night-of-wind', 'creek-on-the-return', 'the-burnt-barn-fund', 'the-meeting-hall', 'a-place-to-bury-him', 'the-pawned-tool', 'market-afternoon', 'gone-fishing', 'supper-with-strangers', 'the-wrong-shadow', 'the-markers-stop', 'the-rocks-start-moving', 'the-public-apology', 'a-chair-beside-the-sickbed', 'the-lamp-left-in-the-window', 'the-stage-rigging', 'the-back-room-lantern', 'the-wardrobe-on-the-roof', 'the-house-with-two-doorbells', 'the-pigeon-postscript', 'the-tinsmiths-tiny-door', 'the-barnyard-weather-report', 'the-pearl-button', 'the-ferrymans-sign', 'the-misplaced-pigeonhole', 'camp-before-dark', 'dry-camp', 'the-second-sunset']) {
      expect(classifyScenario(SCENARIOS.find((scenario) => scenario.id === id)!).depthClass, id).toBe('ENCOUNTER');
    }
    expect(classifyScenario(SCENARIOS.find(({ id }) => id === 'the-last-room')!).depthClass).toBe('ADVENTURE');
  });

  it('honors an explicitly authored class even when legacy length inference would disagree', () => {
    const authored: Scenario = { ...annual, id: 'new-depth-fixture', diversity: { riskTier: 'LOW', length: 'VIGNETTE', depthClass: 'ADVENTURE' } };
    expect(classifyScenario(authored).depthClass).toBe('ADVENTURE');
    expect(validateScenarioMetadata([authored])).toEqual([]);
  });

  it('does not infer Encounter from a short graph when new content omits its authored depth', () => {
    const untagged: Scenario = { ...annual, id: 'new-short-unclassified', scenes: { only: { id: 'only', title: 'One scene', text: 'A brief situation.', ending: 'success', choices: [] } }, startScene: 'only' };
    expect(classifyScenario(untagged).length).toBe('VIGNETTE');
    expect(classifyScenario(untagged).depthClass).toBe('ADVENTURE');
  });

  it('validates cameo, inspired, and historical-event references without requiring names for inspired settings', () => {
    const inspired: Scenario = { ...annual, id: 'inspired-history', diversity: { riskTier: 'LOW', historicalPresence: 'INSPIRED' } };
    const cameo: Scenario = { ...annual, id: 'cameo-history', diversity: { riskTier: 'LOW', historicalPresence: 'CAMEO', historicalReferences: ['Wild Bill Hickok'], historicalPortrayal: 'MIXED' } };
    const event: Scenario = { ...annual, id: 'event-history', diversity: { riskTier: 'LOW', historicalPresence: 'HISTORICAL_EVENT', historicalReferences: ['A regional cattle drive'], historicalPortrayal: 'GROUNDED' } };
    expect(validateScenarioMetadata([inspired, cameo, event])).toEqual([]);
    expect(validateScenarioMetadata([{ ...cameo, diversity: { riskTier: 'LOW', historicalPresence: 'CAMEO' } }])).toContain('cameo-history: CAMEO requires a named historical reference');
    expect(validateScenarioMetadata([{ ...event, diversity: { historicalPresence: 'HISTORICAL_EVENT' } }])).toContain('event-history: HISTORICAL_EVENT requires a named event reference');
    expect(analyzeScenarioLibrary([cameo]).historicalReferenceCounts).toEqual({ 'Wild Bill Hickok': 1 });
  });

  it('applies only a modest historical-content modifier in normal scenario selection', () => {
    const tagged: Scenario = { ...annual, id: 'historical-cameo-test', diversity: { historicalPresence: 'CAMEO', historicalReferences: ['Calamity Jane'], historicalPortrayal: 'GROUNDED' } };
    const weights = scenarioSelectionWeights([annual, tagged]);
    expect(weights.find(({ scenario }) => scenario.id === tagged.id)!.historicalWeight).toBeLessThan(1);
    expect(weights.find(({ scenario }) => scenario.id === tagged.id)!.weight).toBeGreaterThan(0);
    expect(weights.find(({ scenario }) => scenario.id === annual.id)!.weight).toBeGreaterThan(weights.find(({ scenario }) => scenario.id === tagged.id)!.weight);
  });

  it('does not change selector weights when only depth classification changes', () => {
    const compact: Scenario = { ...annual, id: 'same-story-encounter', diversity: { ...(annual.diversity ?? {}), depthClass: 'ENCOUNTER' } };
    const regular: Scenario = { ...annual, id: 'same-story-adventure', diversity: { ...(annual.diversity ?? {}), depthClass: 'ADVENTURE' } };
    const weights = scenarioSelectionWeights([compact, regular]);
    expect(weights[0].weight).toBeCloseTo(weights[1].weight);
  });

  it('gates October and December scenarios by the selected local month', () => {
    expect(scenarioAvailableInMonth(october, 10)).toBe(true);
    expect(scenarioAvailableInMonth(october, 6)).toBe(false);
    expect(scenarioAvailableInMonth(december, 12)).toBe(true);
    expect(scenarioAvailableInMonth(december, 10)).toBe(false);
    for (let month = 1; month <= 12; month++) expect(scenarioAvailableInMonth(annual, month)).toBe(true);
    expect(eligibleScenarios([annual, october, december], [], 6).map(({ id }) => id)).toEqual([annual.id]);
    expect(eligibleScenarios([annual, october, december], [], 10).map(({ id }) => id)).toEqual([annual.id, october.id]);
  });

  it('applies seasonal boosts without bypassing repeat exclusion or making seasonal content dominate', () => {
    const library = [october, ...Array.from({ length: 174 }, (_, index) => ({ ...annual, id: `annual-${index}` }))];
    expect(eligibleScenarios([annual, october, december], [october.id], 10).map(({ id }) => id)).not.toContain(october.id);
    expect(selectScenario([annual, october, december], [], () => 0, { selectionMonth: 10 })).toBeDefined();
    const weighted = scenarioSelectionWeights(eligibleScenarios(library, [], 10));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    const seasonalWeight = weighted.find(({ scenario }) => scenario.id === october.id)!.weight;
    expect(seasonalWeight / total).toBeLessThan(0.02);
    expect(selectScenario([annual, october, december], [], () => 0, { selectionMonth: 6 })?.id).toBe(annual.id);
  });

  it('exposes the QA month override and year-round direct launch without changing normal UI', () => {
    const qa = renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, [annual, october, december], {}, 10);
    expect(qa).toContain('Device local date:');
    expect(qa).toContain('Effective selection month: 10 (QA override)');
    expect(qa).toContain('OCTOBER');
    expect(qa).toContain('data-qa-start="october-test"');
    const depthInspection = renderQaPanel(true, { version: 1, bank: [], character: null, run: { scenarioId: annual.id, sceneId: annual.startScene, health: 10, inventory: [], acquiredThisRun: [], flags: [], status: 'active', message: null, startedAt: 0 } }, [annual], {});
    expect(depthInspection).toContain('&quot;depthClass&quot;: &quot;ADVENTURE&quot;');
    expect(renderQaPanel(false, { version: 1, bank: [], character: null, run: null }, [annual, october, december], {})).toBe('');
  });

  it('does not invalidate an active seasonal run when month eligibility changes', () => {
    const character = newCharacter();
    const started = startAdventure({ version: 1, bank: [], character, run: null }, october);
    expect(started.run?.scenarioId).toBe(october.id);
    expect(scenarioAvailableInMonth(october, 11)).toBe(false);
    expect(started.run?.status).toBe('active');
    expect(started.run?.scenarioId).toBe(october.id);
  });
});

