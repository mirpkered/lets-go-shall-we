import { describe, expect, it } from 'vitest';
import { isQaMode, selectScenario } from './scenarioSelection';
import { SCENARIOS } from './scenarios';
import { findScenarioGraphProblems } from './scenarioGraph';
import { failCharacter, finishSuccess, startAdventure } from './engine';
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
    const qa = startAdventure(base, SCENARIOS[2]);
    qa.run!.qaMode = true;
    expect(failCharacter(qa).recentScenarioIds).toBeUndefined();
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
    expect(tools).toContain('Start The Last Room on the Left');
    expect(tools).toContain('Start Dead Man’s Hand');
    expect(tools).toContain('Start Bridge Out');
    expect(tools).toContain('Start The Long Way Home');
    expect(tools).toContain('Start No Vacancy');
    expect(tools).toContain('Start Cold Storage');
    expect(tools).toContain('Start High Water');
    expect(tools).toContain('Start One More Round');
    expect(tools).toContain('Start The Road Below');
    expect(tools).toContain('Start Smoke on the Hill');
    expect(tools).toContain('Start Down to the Last Match');
    expect(tools).toContain('Start The Man in the Ditch');
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
