import { describe, expect, it } from 'vitest';
import { isQaMode, selectScenario } from './scenarioSelection';
import { SCENARIOS } from './scenarios';
import { findScenarioGraphProblems } from './scenarioGraph';
import { startAdventure } from './engine';
import { newCharacter } from './engine';
import type { SaveData } from './types';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';

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
    expect(tools).toContain('Start For Whom the Bell Tolls');
    expect(tools).toContain('Start All Aboard!');
    expect(tools).toContain('Start Aww, Rats!!');
    expect(tools).toContain('Start What’s Mine is Mine');
    expect(tools).toContain('Clear all local save data');
    expect(tools).toContain('data-qa-start');
  });

  it('does not offer a QA scenario start while a run is active', () => {
    const character = newCharacter();
    const active: SaveData = { version: 1, bank: [], character, run: startAdventure({ version: 1, bank: [], character, run: null }, SCENARIOS[0]).run };
    const tools = renderQaPanel(true, active, SCENARIOS, ITEMS);
    expect(tools).toContain('Clear active run');
    expect(tools).not.toContain('data-qa-start');
  });

  it.each(SCENARIOS)('$title has a forward-only scene graph', (scenario) => {
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
  });
});
