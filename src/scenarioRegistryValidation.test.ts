import { describe, expect, it } from 'vitest';
import { validateScenarioRegistry } from './scenarioRegistryValidation';
import { SCENARIOS } from './scenarios';
import type { Scenario } from './types';

describe('scenario registry release validation', () => {
  it('validates every registered scenario through one release-time entry point', () => {
    const report = validateScenarioRegistry(SCENARIOS);
    expect(report.errors, report.errors.join('\n')).toEqual([]);
    expect(report.warnings, report.warnings.join('\n')).toEqual([]);
    expect(SCENARIOS).toHaveLength(455);
  });

  it('catches broken targets, duplicate choice IDs, and unknown item references', () => {
    const source = SCENARIOS[0];
    const firstScene = Object.values(source.scenes)[0];
    const malformed: Scenario = {
      ...source,
      id: 'registry-invalid-fixture',
      title: 'Registry Invalid Fixture',
      startScene: firstScene.id,
      scenes: {
        [firstScene.id]: {
          ...firstScene,
          choices: [
            { id: 'broken', label: 'Broken target', next: '__missing' },
            { id: 'broken', label: 'Unknown item', effects: { gainItems: ['__missing_item'] }, next: firstScene.id },
          ],
        },
      },
    };
    const report = validateScenarioRegistry([malformed]);
    expect(report.errors.join('\n')).toContain('targets missing scene __missing');
    expect(report.errors.join('\n')).toContain('duplicate choice ID broken');
    expect(report.errors.join('\n')).toContain('unknown item ID “__missing_item”');
  });

  it('handles a 1,000-entry synthetic registry without runtime-specific registration work', () => {
    const template = SCENARIOS.find(({ diversity }) => diversity?.historicalPresence === 'NONE')!;
    const largeRegistry = Array.from({ length: 1_000 }, (_, index): Scenario => {
      const scene: Scenario['scenes'][string] = { id: 'opening', title: 'Opening', text: 'A synthetic registry check.', ending: 'success', choices: [] };
      return { ...template, id: `scale-fixture-${index}`, title: `Scale Fixture ${index}`, startScene: 'opening', scenes: { opening: scene } };
    });
    const report = validateScenarioRegistry(largeRegistry);
    expect(report.errors, report.errors.join('\n')).toEqual([]);
    expect(report.warnings).toEqual([]);
  });
});
