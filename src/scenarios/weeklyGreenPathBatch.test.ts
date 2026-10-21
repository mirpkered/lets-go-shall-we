import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { EMPTY_SAVE } from '../storage';
import { SCENARIOS } from './index';
import { WEEKLY_GREEN_PATH_ADVENTURES } from './weeklyGreenPathBatch';
import type { SaveData, Scenario } from '../types';

function start(scenario: Scenario, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Weekly Batch Tester');
  character.carriedItem = carriedItem;
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function advance(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${sceneId}.${choiceId} is available`).toBe(true);
  return choose(state, scenario, choice!, () => 0);
}

function exploreEveryRoute(scenario: Scenario, carriedItem: string | null = null): void {
  const queue = [start(scenario, carriedItem)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.inventory, run.flags, run.visitedSceneIds, state.character?.money, state.character?.historyFlags, state.character?.lore]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.id}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.id}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.id}.${scene.id} fits the four-choice screen`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      const next = choose(state, scenario, choice, () => 0);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.id}.${scene.id}.${choice.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(seen.size).toBeLessThan(10_000);
  }
}

const byId = (id: string) => WEEKLY_GREEN_PATH_ADVENTURES.find((scenario) => scenario.id === id)!;

describe('weekly green-path Adventure batch', () => {
  it('adds 20 new, year-round Adventures without changing existing IDs or the item/Knowledge catalogs', () => {
    expect(WEEKLY_GREEN_PATH_ADVENTURES).toHaveLength(20);
    expect(new Set(WEEKLY_GREEN_PATH_ADVENTURES.map(({ id }) => id)).size).toBe(20);
    expect(new Set(WEEKLY_GREEN_PATH_ADVENTURES.map(({ title }) => title)).size).toBe(20);
    expect(WEEKLY_GREEN_PATH_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(SCENARIOS).toHaveLength(881);
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(Object.keys(KNOWLEDGE_FACTS)).toHaveLength(32);
    expect(WEEKLY_GREEN_PATH_ADVENTURES.some(({ scenes }) => Object.values(scenes).some(({ choices }) => choices.some(({ effects }) => effects?.gainItems?.length || effects?.gainSupplies || effects?.knowledge?.length || effects?.knowledgeEntries?.length)))).toBe(false);
  });

  it('has complete acyclic graphs, reachable actions, and QA launch entries', () => {
    const qa = renderQaPanel(true, structuredClone(EMPTY_SAVE), SCENARIOS, ITEMS);
    for (const scenario of WEEKLY_GREEN_PATH_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        if (!scene.ending) expect(scene.choices.length, `${scenario.id}.${scene.id}`).toBeGreaterThan(0);
        expect(scene.text.length, `${scenario.id}.${scene.id} text`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.id}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
        }
        for (const choice of scene.choices) {
          if (choice.hint) expect(choice.hint.length, `${scenario.id}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
        }
      }
      expect(qa).toContain(`data-qa-start="${scenario.id}"`);
      exploreEveryRoute(scenario);
    }
  });

  it('keeps existing-tool choices optional and within their actual capability', () => {
    const toolScenarios: [string, string][] = [
      ['the-weather-books-blank-week', 'fieldRainGauge'],
      ['the-clock-with-no-noon', 'foundPocketWatch'],
      ['the-stone-with-two-labels', 'charcoalRubbingKit'],
      ['the-weather-vane-at-morning', 'fieldGlasses'],
    ];
    for (const [id, item] of toolScenarios) {
      const scenario = byId(id);
      const fresh = start(scenario);
      const gearState = start(scenario, item);
      const optionalChoices = Object.values(scenario.scenes).flatMap((scene) => scene.choices).filter(({ requirements }) => requirements?.usableGear?.includes(item));
      expect(optionalChoices.length, `${id} offers ${item}`).toBeGreaterThan(0);
      for (const choice of optionalChoices) {
        expect(meets(choice.requirements, fresh)).toBe(false);
        expect(meets(choice.requirements, gearState)).toBe(true);
      }
      exploreEveryRoute(scenario, item);
    }
  });

  it('preserves route-specific information and does not overclaim provenance or public access', () => {
    let state = start(byId('the-map-in-the-night-school'));
    state = advance(state, byId('the-map-in-the-night-school'), 'class', 'askForRoutes');
    state = advance(state, byId('the-map-in-the-night-school'), 'accounts', 'compareHours');
    state = advance(state, byId('the-map-in-the-night-school'), 'decision', 'publishQualifiedMap');
    expect(state.character?.historyFlags).toContain('helped_night_school_publish_qualified_path_map');

    state = start(byId('the-portrait-from-the-side-window'));
    state = advance(state, byId('the-portrait-from-the-side-window'), 'shop', 'findOccupant');
    state = advance(state, byId('the-portrait-from-the-side-window'), 'consult', 'honorBoundary');
    state = advance(state, byId('the-portrait-from-the-side-window'), 'proof', 'printApprovedView');
    expect(state.character?.historyFlags).toContain('photograph_printed_with_household_consent');

    state = start(byId('the-stone-with-two-labels'), 'charcoalRubbingKit');
    state = advance(state, byId('the-stone-with-two-labels'), 'cabinet', 'copyGroove');
    expect(state.run?.sceneId).toBe('rubbed');
    expect(state.character?.lore).toEqual([]);
  });
});

