import { describe, expect, it } from 'vitest';
import { ITEMS } from '../items';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, startRun, meets } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { ADVENTURER_SUPPORT_GENRE_BATCH } from './adventurerSupportGenreBatch';
import { SCENARIOS } from './index';

function start(scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], carriedItem?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Support Batch Tester');
  if (carriedItem) { character.carriedItem = carriedItem; character.carriedItems = [carriedItem]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], choiceId: string): SaveData {
  const current = scenario.scenes[state.run!.sceneId];
  const choice = current.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${current.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${current.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => 0);
}

function claimGear(scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], combat = false): SaveData {
  let state = start(scenario);
  const prepChoice = scenario.scenes.preparation.choices[0];
  state = act(state, scenario, prepChoice.id);
  const response = scenario.scenes.complication.choices.find(({ id }) => id.startsWith('response_'))!;
  if (combat) state = act(state, scenario, 'standGround');
  else state = act(state, scenario, response.id);
  if (combat) state = act(state, scenario, 'continueAfterFight');
  if (state.run?.sceneId === 'followup') state = act(state, scenario, scenario.scenes.followup.choices[0].id);
  state = act(state, scenario, 'acceptGear');
  state = openRewardResolution(state);
  const itemId = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!.effects!.gainItems![0];
  state = finishRewardResolution(placeReward(state, itemId, 'carry'));
  expect(getCarriedItems(state.character)).toContain(itemId);
  return state;
}

describe('Adventurer Support / Squire / Henchman genre batch', () => {
  it('registers 24 distinct all-year Adventures with valid forward graphs and continuity outcomes', () => {
    expect(ADVENTURER_SUPPORT_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(661);
    expect(new Set(ADVENTURER_SUPPORT_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ADVENTURER_SUPPORT_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ADVENTURER_SUPPORT_GENRE_BATCH).warnings).toEqual([]);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(6);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ scenes }) => scenes.followup)).toHaveLength(8);
  });

  it('uses the selected kit to determine which consequential support action is available', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH[0];
    let state = act(start(scenario), scenario, scenario.scenes.preparation.choices[0].id);
    const responses = scenario.scenes.complication.choices.filter(({ id }) => id.startsWith('response_'));
    expect(responses).toHaveLength(3);
    expect(responses.filter((choice) => meets(choice.requirements, state))).toHaveLength(3);
    state = act(state, scenario, responses[1].id);
    expect(state.run?.sceneId).toBe('followup');
    state = act(state, scenario, scenario.scenes.followup.choices[1].id);
    expect(state.run?.sceneId).toBe('settlement');
  });

  it('offers canonical, explicit ownership transfer for all 24 Gear routes', () => {
    for (const scenario of ADVENTURER_SUPPORT_GENRE_BATCH) {
      const itemId = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!.effects!.gainItems![0];
      expect(ITEMS[itemId], scenario.title).toBeTruthy();
      expect(ITEMS[itemId].inventoryClass, scenario.title).toBe('GEAR');
      claimGear(scenario);
    }
  });

  it('resolves all six authored combat routes without requiring combat for story completion', () => {
    const combatScenarios = ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE');
    for (const scenario of combatScenarios) claimGear(scenario, true);
    expect(combatScenarios).toHaveLength(6);
  });

  it('registers the eight new practical tools as ordinary, carryable Gear', () => {
    const newIds = ['fieldGlasses', 'foldingBrushSaw', 'surveyChain', 'climbingPitons', 'packFrame', 'handAuger', 'collapsibleWaterPail', 'signalFlagSet'];
    for (const id of newIds) {
      expect(ITEMS[id]?.carryable).toBe(true);
      expect(ITEMS[id]?.inventoryClass).toBe('GEAR');
    }
  });

  it('blocks duplicates already carried or banked across every reward route', () => {
    for (const scenario of ADVENTURER_SUPPORT_GENRE_BATCH) {
      const choice = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!;
      const item = choice.effects!.gainItems![0];
      expect(meets(choice.requirements, start(scenario, item)), `${scenario.id} carried duplicate`).toBe(false);
      expect(meets(choice.requirements, start(scenario, undefined, [item])), `${scenario.id} banked duplicate`).toBe(false);
    }
  });

  it('preserves a selected new Gear reward through save, reload, and canonical placement', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH[0];
    let state = act(start(scenario), scenario, scenario.scenes.preparation.choices[0].id);
    state = act(state, scenario, scenario.scenes.complication.choices.find(({ id }) => id.startsWith('response_'))!.id);
    if (state.run?.sceneId === 'followup') state = act(state, scenario, scenario.scenes.followup.choices[0].id);
    state = act(state, scenario, 'acceptGear');
    state = openRewardResolution(state);
    const item = state.run?.rewardPendingItems?.[0];
    expect(item).toBeTruthy();
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    const reloaded = loadSave(storage as never);
    expect(reloaded.run?.scenarioId).toBe(scenario.id);
    expect(reloaded.run?.rewardPendingItems).toContain(item);
    const placed = finishRewardResolution(placeReward(reloaded, item!, 'carry'));
    expect(getCarriedItems(placed.character)).toContain(item);
  });
});
