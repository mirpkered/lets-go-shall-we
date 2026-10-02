import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { WHAT_DID_YOU_SEE } from './communityBatch';
import { MEDICAL_CARE_ADVENTURES } from './medicalBatch';
import { COMMUNICATION_ADVENTURES } from './communicationBatch';
import { LEGAL_PROCESS_ADVENTURES } from './legalProcessBatch';
import { DOMESTIC_ADVENTURES } from './domesticBatch';
import { RELIGION_CUSTOM_ADVENTURES } from './religionCustomBatch';
import { SPECIALIZED_TRADE_ADVENTURES } from './specializedTradesBatch';
import { RIVER_COMMERCE_ADVENTURES } from './riverCommerceBatch';
import { SEASONAL_LIFE_ADVENTURES } from './seasonalLifeBatch';
import { ENTERTAINMENT_ADVENTURES } from './entertainmentBatch';
import { MISTAKEN_IDENTITY_ADVENTURES } from './mistakenIdentityBatch';
import { QUESTIONABLE_EMPLOYMENT_ADVENTURES } from './questionableEmploymentBatch';
import { SMALL_HUMAN_MOMENT_ADVENTURES } from './smallHumanMomentsBatch';

const categories: [string, Scenario[]][] = [
  ['medical and caregiving', MEDICAL_CARE_ADVENTURES],
  ['communications', COMMUNICATION_ADVENTURES],
  ['law and witness', [...LEGAL_PROCESS_ADVENTURES, WHAT_DID_YOU_SEE]],
  ['domestic life', DOMESTIC_ADVENTURES],
  ['religion and custom', RELIGION_CUSTOM_ADVENTURES],
  ['specialized trades', SPECIALIZED_TRADE_ADVENTURES],
  ['river commerce', RIVER_COMMERCE_ADVENTURES],
  ['seasonal life', SEASONAL_LIFE_ADVENTURES],
  ['entertainment', ENTERTAINMENT_ADVENTURES],
  ['mistaken identity', MISTAKEN_IDENTITY_ADVENTURES],
  ['questionable employment', QUESTIONABLE_EMPLOYMENT_ADVENTURES],
  ['small human moments', SMALL_HUMAN_MOMENT_ADVENTURES],
];

const categorySlots = categories.flatMap(([, adventures]) => adventures);
const authored = categorySlots.filter(({ id }) => id !== WHAT_DID_YOU_SEE.id);

function freshState(scenario: Scenario, money = 5, item?: string): SaveData {
  const character = newCharacter('Second-Wave Tester');
  character.money = money;
  if (item) character.carriedItem = item;
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function explore(scenario: Scenario, money: number, item?: string, roll: () => number = () => 0): Set<string> {
  const queue = [freshState(scenario, money, item)];
  const seen = new Set<string>();
  const reached = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    reached.add(run.sceneId);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const actions = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(actions.length, `${scenario.title}.${scene.id} action`).toBeGreaterThan(0);
    expect(actions.length, `${scenario.title}.${scene.id} mobile grid`).toBeLessThanOrEqual(4);
    for (const action of actions) {
      const next = choose(state, scenario, action, roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${action.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(seen.size, `${scenario.title} graph remains bounded`).toBeLessThan(1000);
  }
  return reached;
}

describe('second-wave gap-fill adventures', () => {
  it('covers 52 requested category slots with 51 new adventures and the existing witness scenario', () => {
    expect(categories.map(([name, entries]) => [name, entries.length])).toEqual([
      ['medical and caregiving', 4], ['communications', 5], ['law and witness', 4], ['domestic life', 4],
      ['religion and custom', 3], ['specialized trades', 5], ['river commerce', 4], ['seasonal life', 4],
      ['entertainment', 5], ['mistaken identity', 4], ['questionable employment', 5], ['small human moments', 5],
    ]);
    expect(categorySlots).toHaveLength(52);
    expect(authored).toHaveLength(51);
    expect(SCENARIOS).toHaveLength(237);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(SCENARIOS.filter(({ id }) => id === WHAT_DID_YOU_SEE.id)).toHaveLength(1);
  });

  it('keeps every authored scene forward-only, reachable, actionable, and compact', () => {
    expect(new Set(authored.map(({ id }) => id)).size).toBe(authored.length);
    for (const scenario of authored) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      explore(scenario, 5);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} compact scene`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id} concise choice`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id} concise hint`).toBeLessThanOrEqual(115);
        }
      }
    }
  });

  it('keeps a no-money traveler able to complete each story and exposes optional item routes only with their item', () => {
    for (const scenario of authored) {
      const reached = explore(scenario, 0);
      for (const id of explore(scenario, 5)) reached.add(id);
      for (const id of explore(scenario, 0, undefined, () => 0.999999)) reached.add(id);
      const itemGated = Object.values(scenario.scenes).flatMap((scene) => scene.choices
        .filter((choice) => choice.requirements?.items?.length)
        .map((choice) => choice.requirements!.items![0]));
      for (const item of new Set(itemGated)) {
        for (const id of explore(scenario, 0, item)) reached.add(id);
      }
      expect(reached.size, `${scenario.title} all authored scenes reachable`).toBe(Object.keys(scenario.scenes).length);
    }
  });
});
