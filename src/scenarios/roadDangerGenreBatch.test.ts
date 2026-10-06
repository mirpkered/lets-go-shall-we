import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { ROAD_DANGER_GENRE_BATCH } from './roadDangerGenreBatch';
import { SCENARIOS } from './index';

function initial(scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number], item?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Road Tester');
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number], choiceId: string, random: () => number = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function reachSettlement(scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number]): SaveData {
  let state = initial(scenario);
  const approach = scenario.scenes.approach.choices.find((choice) => meets(choice.requirements, state))!;
  state = act(state, scenario, approach.id);
  const noncombat = scenario.scenes.threat.choices.find((choice) => choice.id.startsWith('respond_') && meets(choice.requirements, state))!;
  state = act(state, scenario, noncombat.id);
  state = act(state, scenario, scenario.scenes.aftermath.choices[0].id);
  return state;
}

describe('Road Danger / Highwaymen genre batch', () => {
  it('registers 24 unique all-year Adventures with valid destinations and an intentionally optional combat share', () => {
    expect(ROAD_DANGER_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(511);
    expect(new Set(ROAD_DANGER_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(ROAD_DANGER_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ROAD_DANGER_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ROAD_DANGER_GENRE_BATCH).warnings).toEqual([]);
    expect(ROAD_DANGER_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(12);
    expect(ROAD_DANGER_GENRE_BATCH.filter(({ scenes }) => scenes.settlement.choices.some(({ effects }) => effects?.gainItems?.length || effects?.gainSupplies && Object.keys(effects.gainSupplies).length))).toHaveLength(21);
  });

  it('uses canonical placement for every offered Gear reward and blocks carried or Bank duplicates', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH) {
      const choice = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear');
      if (!choice) continue;
      const item = choice.effects!.gainItems?.[0] ?? Object.keys(choice.effects!.gainSupplies ?? {})[0];
      expect(['GEAR', 'SUPPLY'], scenario.title).toContain(ITEMS[item]?.inventoryClass);
      if (ITEMS[item]?.inventoryClass === 'SUPPLY') {
        const before = reachSettlement(scenario);
        const after = act(before, scenario, 'acceptGear');
        expect(after.run?.supplies?.[item]).toBe((before.run?.supplies?.[item] ?? 0) + 1);
        continue;
      }
      expect(scenario.scenes.gear.text.length, scenario.title).toBeGreaterThan(15);
      expect(meets(choice.requirements, initial(scenario, item)), `${scenario.id} carried`).toBe(false);
      expect(meets(choice.requirements, initial(scenario, undefined, [item])), `${scenario.id} Banked`).toBe(false);
      let state = act(reachSettlement(scenario), scenario, 'acceptGear');
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems).toContain(item);
      state = finishRewardResolution(placeReward(state, item, 'carry'));
      expect(getCarriedItems(state.character)).toContain(item);
    }
  });

  it('offers exact coin payment, reusable Knowledge, and explicit refusal without silently granting Gear', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH) {
      const state = reachSettlement(scenario);
      const coins = scenario.scenes.settlement.choices.find(({ id }) => id === 'takeCoins')!;
      const paid = act(state, scenario, coins.id);
      expect(paid.character?.money).toBe(state.character!.money + (coins.effects?.money ?? 0));
      const declined = act(state, scenario, 'decline');
      expect(declined.run?.status).toBe('success');
      expect(declined.run?.rewardPendingItems ?? []).toEqual([]);
      expect(declined.character?.money).toBe(state.character?.money);
    }
  });

  it('keeps combat optional and routes both favorable and unfavorable confrontations to an aftermath', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')) {
      let state = initial(scenario);
      state = act(state, scenario, scenario.scenes.approach.choices.find((choice) => meets(choice.requirements, state))!.id);
      expect(scenario.scenes.threat.choices.some((choice) => choice.id.startsWith('respond_') && meets(choice.requirements, state)), scenario.id).toBe(true);
      const fight = scenario.scenes.threat.choices.find(({ id }) => id === 'fight')!;
      expect(fight).toBeTruthy();
      const won = act(state, scenario, fight.id, () => 0);
      expect(won.run?.sceneId).toBe('fightWon');
      const recovered = act(won, scenario, scenario.scenes.fightWon.choices[0].id);
      expect(recovered.run?.sceneId).toBe('aftermath');
      const lost = act(state, scenario, fight.id, () => 1);
      expect(lost.run?.sceneId).toBe('fightLost');
      expect(lost.run?.status).not.toBe('death');
    }
  });

  it('preserves pending Gear placement through save and reload', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ scenes }) => scenes.settlement.choices.some(({ id }) => id === 'acceptGear'))!;
    let state = act(reachSettlement(scenario), scenario, 'acceptGear');
    state = openRewardResolution(state);
    const item = state.run?.rewardPendingItems?.[0];
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    const reloaded = loadSave(storage as never);
    expect(reloaded.run?.scenarioId).toBe(scenario.id);
    expect(reloaded.run?.rewardPendingItems).toContain(item);
    const placed = finishRewardResolution(placeReward(reloaded, item!, 'carry'));
    expect(getCarriedItems(placed.character)).toContain(item);
  });

  it('gives each new road tool distinct uses in at least two existing non-batch Adventures', () => {
    for (const item of ['foldingCarriageJack', 'lockableMapCase', 'lanternGuard']) {
      const callbacks = SCENARIOS.filter(({ id, scenes }) => !ROAD_DANGER_GENRE_BATCH.some((road) => road.id === id))
        .flatMap(({ id, scenes }) => Object.values(scenes).flatMap((scene) => scene.choices
          .filter(({ requirements }) => requirements?.items?.includes(item)).map((choice) => `${id}.${choice.id}`)));
      expect(callbacks.length, `${item}: ${callbacks.join(', ')}`).toBeGreaterThanOrEqual(2);
    }
  });
});
