import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { ITEMS } from '../items';
import { SCENARIOS } from './index';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { EXPEDITION_LOGISTICS_GENRE_BATCH } from './expeditionLogisticsGenreBatch';
import type { SaveData, Scenario } from '../types';

const fresh = (scenario: Scenario): SaveData => {
  const character = newCharacter('Logistics Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};
const take = (state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData => {
  const scene = scenario.scenes[sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${sceneId} requirements`).toBe(true);
  state.run!.sceneId = sceneId;
  return choose(state, scenario, choice!);
};

describe('Gear Expansion Genre Batch 8 — Expedition Logistics / Supply / Staging', () => {
  it('registers 24 unique Adventures with valid, reachable, acyclic story graphs', () => {
    expect(EXPEDITION_LOGISTICS_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(661);
    expect(new Set(EXPEDITION_LOGISTICS_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(EXPEDITION_LOGISTICS_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(validateScenarioRegistry(EXPEDITION_LOGISTICS_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    for (const scenario of EXPEDITION_LOGISTICS_GENRE_BATCH) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const choice of scene.choices) for (const itemId of choice.effects?.gainItems ?? []) expect(ITEMS[itemId], `${scenario.id} grants ${itemId}`).toBeTruthy();
      }
    }
  });

  it('gives every operation a continuity payoff and most a legitimate Gear route', () => {
    let gearRoutes = 0;
    for (const scenario of EXPEDITION_LOGISTICS_GENRE_BATCH) {
      const effects = Object.values(scenario.scenes).flatMap(({ choices }) => choices).map(({ effects }) => effects).filter(Boolean);
      expect(effects.some((effect) => (effect?.money ?? 0) > 0 || !!effect?.knowledge?.length || !!effect?.lore?.length || !!effect?.gainItems?.length), scenario.title).toBe(true);
      if (effects.some((effect) => effect?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) gearRoutes += 1;
    }
    expect(gearRoutes).toBeGreaterThanOrEqual(18);
  });

  it('keeps expedition allocations temporary and makes the player honor the load choice', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'weighed-before-dawn')!;
    let state = fresh(scenario);
    const startingInventory = [...state.run!.inventory];
    state = take(state, scenario, 'yard', 'takeRope');
    expect(state.run?.flags).toContain('expedition_rope_packed');
    expect(state.run?.inventory).toEqual(startingInventory);
    state = take(state, scenario, 'ridge', 'secureByRope');
    expect(state.run?.inventory).toEqual(startingInventory);
    expect(state.character?.historyFlags).toContain('used_rope_to_secure_survey_load');

    const gated = scenario.scenes.yard.choices.find(({ id }) => id === 'weighLoads')!;
    expect(meets(gated.requirements, fresh(scenario))).toBe(false);
    const scaleRun = fresh(scenario);
    scaleRun.run!.inventory.push('cargoBalanceScale');
    expect(meets(gated.requirements, scaleRun)).toBe(true);
  });

  it('acquires the Cargo Balance Scale only through explicit release and preserves pending placement across save/resume', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-third-trip')!;
    let state = fresh(scenario);
    state = take(state, scenario, 'complete', 'scale');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('cargoBalanceScale');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.run?.scenarioId).toBe(scenario.id);
    state = finishRewardResolution(placeReward(state, 'cargoBalanceScale', 'carry'));
    expect(getCarriedItems(state.character)).toContain('cargoBalanceScale');
    expect(state.itemStates?.cargoBalanceScale?.provenance.join(' ')).toContain('Given by surveyor Vale');
  });

  it('makes the new scale useful without letting it replace evidence or route judgment', () => {
    const weighed = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'weighed-before-dawn')!;
    expect(weighed.scenes.yard.choices.find(({ id }) => id === 'weighLoads')?.requirements).toEqual({ items: ['cargoBalanceScale'] });
    const crates = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'two-crates-short')!;
    expect(crates.scenes.manifest.choices.find(({ id }) => id === 'weighSealed')?.requirements).toEqual({ items: ['cargoBalanceScale'] });
    expect(crates.scenes.siding.text).toMatch(/not stolen/i);
  });
});
