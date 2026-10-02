import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  A_GAME_OF_CARDS, A_GOOD_NIGHTS_SLEEP, GONE_FISHING, MARKET_AFTERNOON,
  PLEASANT_DAY_ADVENTURES, SKIPPING_STONES, SUPPER_WITH_STRANGERS,
  THE_COUNTY_FAIR, THE_MUSIC_OUTSIDE, THE_OLD_MANS_STORY, THE_SWIMMING_HOLE,
} from './pleasantDaysBatch';

function start(scenario: Scenario, selections: Record<string, string> = {}, money = 2): SaveData {
  const character = newCharacter('Pleasant Day Tester');
  character.money = money;
  const run = startRun(character, scenario, () => 0);
  run.randomSelections = { ...run.randomSelections, ...selections };
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function selectionSets(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((all, group) =>
    all.flatMap((base) => group.values.map(({ value }) => ({ ...base, [group.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, money = 2): number {
  const queue = [start(scenario, selections, money)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.lore, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    expect(run.health).toBe(10);
    if (run.status !== 'active') {
      expect(run.status, `${scenario.title} should remain a pleasant success`).toBe('success');
      continue;
    }
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    expect(sceneText(scene!, state)).not.toMatch(/\{\{[^}]+\}\}/);
    if (scene!.ending) continue;
    const choices = scene!.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${scene!.id} offers an action`).toBeGreaterThan(0);
    expect(choices.length, `${scenario.title}.${scene!.id} fits the button grid`).toBeLessThanOrEqual(4);
    for (const choice of choices) {
      for (const roll of choice.chance ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene!.id}.${choice.id} moves forward`).toBe(false);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(5000);
  }
  return seen.size;
}

describe('day off and pleasant encounters adventure batch', () => {
  it('registers ten distinct, concise, forward-only adventures', () => {
    expect(PLEASANT_DAY_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(431);
    expect(PLEASANT_DAY_ADVENTURES.map(({ title }) => title)).toEqual([
      'Market Afternoon', 'Gone Fishing', 'The County Fair', 'A Game of Cards',
      'The Swimming Hole', 'Supper with Strangers', 'The Music Outside',
      'The Old Man’s Story', 'A Good Night’s Sleep', 'Skipping Stones',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of PLEASANT_DAY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length).toBeLessThanOrEqual(115);
          expect(choice.effects?.health ?? 0).toBeGreaterThanOrEqual(0);
          expect(choice.chance?.failureEffects?.health ?? 0).toBeGreaterThanOrEqual(0);
          expect(choice.effects?.combat).toBeFalsy();
          expect(choice.chance?.successEffects?.combat).toBeFalsy();
          expect(choice.chance?.failureEffects?.combat).toBeFalsy();
        }
      }
    }
  });

  it('checks every authored variation and chance result with both funded and broke characters', () => {
    for (const scenario of PLEASANT_DAY_ADVENTURES) {
      for (const selections of selectionSets(scenario)) {
        expect(explore(scenario, selections, 2), scenario.title).toBeGreaterThan(0);
        expect(explore(scenario, selections, 0), `${scenario.title} without money`).toBeGreaterThan(0);
      }
    }
  });

  it('makes the market’s small earnings and purchases explicit and optional', () => {
    const broke = start(MARKET_AFTERNOON, {}, 0);
    expect(MARKET_AFTERNOON.scenes.marketSquare.choices.filter(({ requirements }) => meets(requirements, broke)).map(({ id }) => id))
      .not.toContain('buyPie');
    const earned = act(broke, MARKET_AFTERNOON, 'marketSquare', 'helpPackStall');
    expect(earned.character?.money).toBe(1);
    expect(earned.run?.status).toBe('success');
  });

  it('allows fishing to mean a catch, no catch, or a small found object', () => {
    expect(selectionSets(GONE_FISHING)).toHaveLength(3);
    expect(sceneText(GONE_FISHING.scenes.fishingResult, start(GONE_FISHING, { fishingDay: 'nothing' }))).toContain('Nothing takes the line');
    expect(sceneText(GONE_FISHING.scenes.fishingResult, start(GONE_FISHING, { fishingDay: 'fish' }))).toContain('small trout');
    const sold = act(start(GONE_FISHING, { fishingDay: 'fish' }), GONE_FISHING, 'fishingBank', 'castLine');
    const payout = act(sold, GONE_FISHING, 'fishingResult', 'sellSmallCatch');
    expect(payout.character?.money).toBe(3);
  });

  it('keeps the fair light and makes the card game friendly, low-stakes, and voluntary', () => {
    expect(THE_COUNTY_FAIR.scenes.fairGreen.choices.find(({ id }) => id === 'fairRingToss')?.chance?.probability).toBeLessThan(0.6);
    expect(THE_COUNTY_FAIR.scenes.fairGreen.text).toContain('cheerful crowd');
    const noMoney = start(A_GAME_OF_CARDS, {}, 0);
    expect(A_GAME_OF_CARDS.scenes.cardTable.choices.filter(({ requirements }) => meets(requirements, noMoney)).map(({ id }) => id))
      .not.toContain('playFriendlyHand');
    const loss = act(start(A_GAME_OF_CARDS, {}, 1), A_GAME_OF_CARDS, 'cardTable', 'playFriendlyHand', () => 0.999999);
    expect(loss.character?.money).toBe(0);
    const win = act(start(A_GAME_OF_CARDS, {}, 1), A_GAME_OF_CARDS, 'cardTable', 'playFriendlyHand', () => 0);
    expect(win.character?.money).toBe(2);
    expect(A_GAME_OF_CARDS.scenes.cardTable.choices.map(({ id }) => id)).toContain('declineCards');
  });

  it('keeps the swimming hole peaceful and does not create a rest buff', () => {
    expect(THE_SWIMMING_HOLE.scenes.poolBank.text).toContain('The water is calm');
    expect(THE_SWIMMING_HOLE.scenes.poolBank.text).toContain('pack and clothes can stay on the dry bank');
    const rested = act(start(THE_SWIMMING_HOLE), THE_SWIMMING_HOLE, 'poolBank', 'napPool');
    expect(rested.run?.health).toBe(10);
    expect(rested.character?.health).toBe(10);
    expect(rested.run?.inventory).toEqual(start(THE_SWIMMING_HOLE).run?.inventory);
    expect(THE_SWIMMING_HOLE.scenes.poolRested.ending).toBe('success');
  });

  it('offers modest shared lore and stories without requiring any later payoff', () => {
    const harvest = start(SUPPER_WITH_STRANGERS, { supperTopic: 'harvest' });
    expect(sceneText(SUPPER_WITH_STRANGERS.scenes.supperStories, harvest)).toContain('harvest dance');
    const lore = act(harvest, SUPPER_WITH_STRANGERS, 'commonTable', 'listenSupper');
    const remembered = act(lore, SUPPER_WITH_STRANGERS, 'supperStories', 'rememberHarvestSupper');
    expect(remembered.character?.lore).toContain('A southern village keeps a lively harvest dance after the hay is cut.');
    expect(THE_OLD_MANS_STORY.scenes.storyHeard.text).toContain('Whether every detail is true');
    expect(A_GOOD_NIGHTS_SLEEP.scenes.sleptWell.ending).toBe('success');
    expect(THE_MUSIC_OUTSIDE.scenes.streetMusic.choices).toHaveLength(4);
    expect(SKIPPING_STONES.scenes.riverbank.choices).toHaveLength(4);
  });
});
