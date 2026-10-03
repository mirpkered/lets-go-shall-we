import { describe, expect, it } from 'vitest';
import { BANK_CAPACITY } from './bank';
import { carryCapacity, choose, finishRewardResolution, getCarriedItems, newCharacter, newRewardItems, openRewardResolution, placeReward, startRun } from './engine';
import { ITEMS } from './items';
import { loadSave, saveGame } from './storage';
import type { SaveData } from './types';
import { AWW_RATS } from './scenarios/awwRats';

const reward = 'ratCatchersHook';
const bankFill = ['graveCoin', 'ironHandbell', 'boneKey', 'bronzeMaskFragment', 'brassCandlestick'];

function successfulRewardState(completed = 0, bank: string[] = [], carried: string[] = []): SaveData {
  const character = newCharacter('Reward Tester');
  character.adventuresCompleted = completed;
  character.carriedItems = [...carried];
  character.carriedItem = carried[0] ?? null;
  const run = startRun(character, AWW_RATS);
  run.status = 'success';
  run.sceneId = 'cleanEnding';
  run.inventory.push(reward);
  run.acquiredThisRun.push(reward);
  return { version: 1, bank: [...bank], character, run };
}

describe('authored ending reward placement', () => {
  it('offers one newly acquired reward at a time and lets the player carry or bank it', () => {
    let state = openRewardResolution(successfulRewardState());
    expect(newRewardItems(state)).toEqual([reward]);
    state = placeReward(state, reward, 'carry');
    expect(getCarriedItems(state.character)).toEqual([reward]);
    expect(state.run?.rewardPendingItems).toEqual([]);
    const done = finishRewardResolution(state);
    expect(done.run).toBeNull();

    let banked = openRewardResolution(successfulRewardState());
    banked = placeReward(banked, reward, 'bank');
    expect(banked.bank).toEqual([reward]);
    expect(getCarriedItems(banked.character)).toEqual([]);
    expect(finishRewardResolution(banked).run).toBeNull();
  });

  it('allows Bank storage even with open carry capacity and never grants both choose-one rewards', () => {
    const state = openRewardResolution(successfulRewardState());
    expect(carryCapacity(state.character!.adventuresCompleted)).toBe(1);
    const before = state.run!.acquiredThisRun.length;
    const banked = placeReward(state, reward, 'bank');
    expect(banked.bank).toContain(reward);
    expect(getCarriedItems(banked.character)).toEqual([]);
    expect(banked.run!.acquiredThisRun).toHaveLength(before);
    expect(banked.run!.rewardPendingItems).toEqual([]);
    expect(placeReward(banked, 'heavyLeatherGloves', 'carry').run?.rewardPendingItems).toEqual([]);
  });

  it('keeps an authored choose-one reward to the single item actually selected', () => {
    const character = newCharacter('Choice Tester');
    const run = startRun(character, AWW_RATS);
    run.sceneId = 'rewardClean';
    const state: SaveData = { version: 1, bank: [], character, run };
    const takeHook = AWW_RATS.scenes.rewardClean.choices.find((choice) => choice.id === 'takeHook')!;
    const selected = choose(state, AWW_RATS, takeHook, () => 0);
    selected.run!.status = 'success';
    const rewards = openRewardResolution(selected);
    expect(rewards.run?.inventory).toContain('ratCatchersHook');
    expect(rewards.run?.inventory).not.toContain('heavyLeatherGloves');
    expect(rewards.run?.rewardPendingItems).toEqual(['ratCatchersHook']);
    expect(placeReward(rewards, 'heavyLeatherGloves', 'bank').bank).toEqual([]);
  });

  it('supports one-, two-, and three-slot travelers without replacing carried gear', () => {
    for (const completed of [0, 10, 20]) {
      const slots = carryCapacity(completed);
      const existing = ['travelRope', 'pocketToolkit', 'weatherproofCloak'].slice(0, slots - 1);
      let state = openRewardResolution(successfulRewardState(completed, [], existing));
      state = placeReward(state, reward, 'carry');
      expect(getCarriedItems(state.character)).toEqual([...existing, reward]);
      expect(getCarriedItems(state.character)).toHaveLength(slots);
    }
  });

  it('keeps a reward pending when both storage destinations are full, then permits explicit decline', () => {
    const state = openRewardResolution(successfulRewardState(0, bankFill, ['travelRope']));
    expect(state.bank).toHaveLength(BANK_CAPACITY);
    expect(placeReward(state, reward, 'carry').run?.rewardPendingItems).toEqual([reward]);
    expect(placeReward(state, reward, 'bank').run?.rewardPendingItems).toEqual([reward]);
    const declined = placeReward(state, reward, 'decline');
    expect(declined.run?.rewardPendingItems).toEqual([]);
    expect(declined.bank).toEqual(bankFill);
    expect(getCarriedItems(declined.character)).toEqual(['travelRope']);
    expect(finishRewardResolution(declined).run).toBeNull();
  });

  it('persists a placement immediately and makes reload/repeated clicks idempotent', () => {
    let state = openRewardResolution(successfulRewardState());
    state = placeReward(state, reward, 'bank');
    const storage = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    };
    saveGame(state, adapter);
    state = loadSave(adapter);
    const repeated = placeReward(state, reward, 'bank');
    expect(repeated.bank).toEqual([reward]);
    expect(repeated.run?.rewardPendingItems).toEqual([]);
    const finished = finishRewardResolution(repeated);
    expect(finished.run).toBeNull();
    expect(finished.bank).toEqual([reward]);
  });

  it('does not offer or carry a reward already stored in the Bank, including on a legacy pending screen', () => {
    let state = openRewardResolution(successfulRewardState(0, [reward]));
    expect(newRewardItems(state)).toEqual([]);
    expect(state.run?.rewardPendingItems).toEqual([]);
    state = placeReward(state, reward, 'carry');
    expect(getCarriedItems(state.character)).toEqual([]);
    expect(state.bank).toEqual([reward]);

    const legacy = successfulRewardState(0, [reward]);
    legacy.run!.rewardPendingItems = [reward];
    const restored = openRewardResolution(legacy);
    expect(restored.run?.rewardPendingItems).toEqual([]);
    expect(finishRewardResolution(restored).bank).toEqual([reward]);
    expect(finishRewardResolution(restored).character?.carriedItems).toEqual([]);
  });

  it('migrates an older successful reward screen safely and rejects non-carryable rewards', () => {
    const legacy = successfulRewardState();
    legacy.run!.rewardSelectionOpen = true;
    const migrated = openRewardResolution(legacy);
    expect(migrated.run?.rewardPendingItems).toEqual([reward]);
    expect(ITEMS[reward]?.carryable).toBe(true);
    const unchanged = placeReward(migrated, 'chapelKey', 'bank');
    expect(unchanged.bank).toEqual([]);
    expect(unchanged.run?.rewardPendingItems).toEqual([reward]);
  });
});
