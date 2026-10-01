import { describe, expect, it } from 'vitest';
import { analyzeScenarioLibrary, classifyScenario, scenarioAvailableInMonth, validateScenarioMetadata } from './scenarioDiversity';
import { eligibleScenarios, scenarioSelectionWeights, selectScenario } from './scenarioSelection';
import { renderQaPanel } from './qaPanel';
import { startAdventure, newCharacter } from './engine';
import { SCENARIOS } from './scenarios';
import { COLD_STORAGE } from './scenarios/coldStorage';
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
    const invalid: Scenario = { ...october, id: 'invalid-metadata', diversity: { fantasyDensity: 'ALIEN' as never, availability: { season: 'CUSTOM', months: [0, 13] } as never } };
    expect(validateScenarioMetadata([annual, { ...annual }])).toContain(`Duplicate scenario ID: ${annual.id}`);
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('invalid fantasy density'))).toBe(true);
    expect(validateScenarioMetadata([invalid]).some((issue) => issue.includes('seasonal month configuration'))).toBe(true);
    expect(analyzeScenarioLibrary([annual, { ...annual, id: 'similar-but-valid' }]).similarityWarnings.length).toBeGreaterThan(0);
  });

  it('keeps risk classification canonical and independent of tone, length, or fantasy', () => {
    const metadata = classifyScenario(SCENARIOS.find(({ id }) => id === 'under-the-ice')!);
    expect(metadata.riskTier).toBe('SEVERE');
    expect(metadata.fantasyDensity).toBe('NONE');
    expect(metadata.combat).toBe('NONE');
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
