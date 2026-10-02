import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { auditContentQuality } from '../contentQuality';
import { simulateScenarioSelection } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { ITEMS } from '../items';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_COMEDY_ABSURDITY_ADVENTURES } from './comedyAbsurdityBatch';

function assertReachableActions(scenario: (typeof THE_COMEDY_ABSURDITY_ADVENTURES)[number]): void {
  const character = newCharacter('Comedy QA');
  const start: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  const pending = [start];
  const visited = new Set<string>();
  while (pending.length) {
    const state = pending.shift()!;
    const run = state.run!;
    const key = `${run.sceneId}:${run.status}:${run.visitedSceneIds?.join(',')}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const current = scenario.scenes[run.sceneId];
    expect(current, `${scenario.title}.${run.sceneId}`).toBeDefined();
    if (current.ending || run.status !== 'active') continue;
    const available = current.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${current.id} has an available action`).toBeGreaterThan(0);
    for (const choice of available) {
      const next = choose(state, scenario, choice, () => 0.999999);
      expect(next.run?.sceneId, `${scenario.title}.${current.id}.${choice.id} advances`).not.toBe(current.id);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length ?? 0);
      pending.push(next);
    }
    expect(visited.size, scenario.title).toBeLessThan(300);
  }
}

describe('comedy and absurdity additions', () => {
  it('registers 25 unique all-year adventures with complete canonical metadata', () => {
    expect(THE_COMEDY_ABSURDITY_ADVENTURES).toHaveLength(25);
    expect(SCENARIOS).toHaveLength(445);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(validateScenarioMetadata(THE_COMEDY_ABSURDITY_ADVENTURES)).toEqual([]);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
  });

  it('keeps each graph forward-only, connected, actionable, concise, and within four choices', () => {
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const entry of Object.values(scenario.scenes)) {
        expect(entry.choices.length, `${scenario.title}.${entry.id}`).toBeLessThanOrEqual(4);
        expect(entry.text.length, `${scenario.title}.${entry.id} no-scroll copy`).toBeLessThanOrEqual(400);
        for (const choice of entry.choices) expect(choice.label.length, `${scenario.title}.${entry.id}`).toBeLessThanOrEqual(70);
      }
      assertReachableActions(scenario);
    }
  });

  it('makes every added story eligible in normal selection and available for direct QA launch', () => {
    const qa = renderQaPanel(true, { ...structuredClone(EMPTY_SAVE), character: newCharacter('QA'), run: null }, SCENARIOS, ITEMS);
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(qa).toContain(`data-qa-start="${scenario.id}"`);
    }
    let seed = 48;
    const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    const result = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 6 }, 30000, random);
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(result.scenarioCounts[scenario.id] ?? 0, `${scenario.title} appears in normal selection`).toBeGreaterThan(0);
    }
  });

  it('varies comic engines rather than repeating one premise family', () => {
    const hooks = THE_COMEDY_ABSURDITY_ADVENTURES.map(({ diversity }) => diversity?.distinctiveHook?.toLowerCase());
    expect(new Set(hooks).size).toBe(hooks.length);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('animals'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('communication/witness'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('negotiation/trade'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('puzzle/problem-solving'))).toBe(true);
    expect(new Set(THE_COMEDY_ABSURDITY_ADVENTURES.map(({ scenes }) => Object.keys(scenes).length)).size).toBeGreaterThan(3);
  });

  it('has no high-severity content-quality warnings after human overlap and payoff review', () => {
    const report = auditContentQuality(THE_COMEDY_ABSURDITY_ADVENTURES);
    expect(report.scenarioCount).toBe(25);
    expect(report.warnings.filter(({ severity }) => severity === 'HIGH')).toEqual([]);
  });
});
