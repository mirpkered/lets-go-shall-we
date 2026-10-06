import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemCondition, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { ITEMS } from '../items';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_BROKEN_HARNESS } from './animalsBatch';
import { THE_TRESTLE_TABLE } from './surpriseEverydayBatch';
import { TRADES_APPRENTICESHIP_GENRE_BATCH as BATCH } from './tradesApprenticeshipGenreBatch';

describe('Trades / Apprenticeships / Practical Work batch', () => {
  it('registers 24 unique all-year Adventures with valid destinations and catalog-backed rewards', () => {
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(661);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(24);
    expect(BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(BATCH.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(BATCH).errors).toEqual([]);
    for (const scenario of BATCH) for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
      for (const item of choice.effects?.gainItems ?? []) expect(ITEMS[item], `${scenario.id}.${scene.id}.${choice.id}: ${item}`).toBeTruthy();
    }
  });

  it('transfers the released Carpenter’s Square through canonical reward placement and honors the coin alternative', () => {
    const scenario = BATCH[0];
    const character = newCharacter('Trade Batch Tester');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    for (const id of ['square', 'replace', 'takeTool']) {
      const scene = scenario.scenes[state.run!.sceneId];
      const choice = scene.choices.find(({ id: choiceId }) => choiceId === id)!;
      state = choose(state, scenario, choice, () => 0);
    }
    expect(state.run?.acquiredThisRun).toContain('carpenterSquare');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('carpenterSquare');
    state = finishRewardResolution(placeReward(state, 'carpenterSquare', 'carry'));
    expect(getCarriedItems(state.character)).toContain('carpenterSquare');

    const coinCharacter = newCharacter('Coin Alternative Tester');
    let coins: SaveData = { ...structuredClone(EMPTY_SAVE), character: coinCharacter, run: startRun(coinCharacter, scenario, () => 0) };
    for (const id of ['square', 'replace', 'takeCoins']) {
      const scene = scenario.scenes[coins.run!.sceneId];
      const choice = scene.choices.find(({ id: choiceId }) => choiceId === id)!;
      coins = choose(coins, scenario, choice, () => 0);
    }
    expect(coins.character?.money).toBe(coinCharacter.money + 2);
    expect(coins.run?.acquiredThisRun).not.toContain('carpenterSquare');
  });

  it('keeps the two new work tools distinct, carryable Gear rather than temporary props', () => {
    expect(ITEMS.carpenterSquare).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.leatherRepairRoll).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.carpenterSquare.description).toContain('right-angle');
    expect(ITEMS.leatherRepairRoll.description).toContain('mending straps');
  });

  it('repairs or improves an owned Travel Rope through persistent condition/provenance effects', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-ropewalk-splice')!;
    const character = newCharacter('Rope Repair Tester');
    character.carriedItem = 'travelRope';
    character.carriedItems = ['travelRope'];
    const damagedRecord = { condition: 'DAMAGED' as const, upgrades: [], provenance: [] };
    let damaged: SaveData = { ...structuredClone(EMPTY_SAVE), character, itemStates: { travelRope: damagedRecord }, run: startRun(character, scenario, () => 0, { travelRope: damagedRecord }) };
    for (const id of ['mark', 'wait', 'repairOwnRope']) {
      const choice = scenario.scenes[damaged.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      damaged = choose(damaged, scenario, choice, () => 0);
    }
    expect(itemCondition(damaged, 'travelRope')).toBe('NORMAL');
    expect(damaged.itemStates?.travelRope?.provenance).toContain('Mended by Bram Saye at the ropewalk');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(damaged, storage as never);
    damaged = loadSave(storage as never);
    expect(itemCondition(damaged, 'travelRope')).toBe('NORMAL');
    expect(damaged.itemStates?.travelRope?.provenance).toContain('Mended by Bram Saye at the ropewalk');

    const soundCharacter = newCharacter('Rope Upgrade Tester');
    soundCharacter.carriedItem = 'travelRope';
    soundCharacter.carriedItems = ['travelRope'];
    const soundRecord = { condition: 'NORMAL' as const, upgrades: [], provenance: [] };
    let sound: SaveData = { ...structuredClone(EMPTY_SAVE), character: soundCharacter, itemStates: { travelRope: soundRecord }, run: startRun(soundCharacter, scenario, () => 0, { travelRope: soundRecord }) };
    for (const id of ['mark', 'wait', 'spliceOwnRope']) {
      const choice = scenario.scenes[sound.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      sound = choose(sound, scenario, choice, () => 0);
    }
    expect(sound.itemStates?.travelRope?.upgrades.map(({ id }) => id)).toContain('splicedEyes');
    expect(sound.itemStates?.travelRope?.provenance).toContain('Leather-whipped by Bram Saye at the ropewalk');
  });

  it('adds practical, optional callbacks for the two new tools in existing Adventures', () => {
    const squareChoice = THE_TRESTLE_TABLE.scenes.crate.choices.find(({ id }) => id === 'checkFrameWithSquare');
    expect(squareChoice?.requirements?.items).toContain('carpenterSquare');
    expect(THE_TRESTLE_TABLE.scenes.squareMeasured.text).toContain('frame is still true');
    const repairRollChoice = THE_BROKEN_HARNESS.scenes.harnessRepaired.choices.find(({ id }) => id === 'assistWithLeatherRepairRoll');
    expect(repairRollChoice?.requirements?.items).toContain('leatherRepairRoll');
    expect(THE_BROKEN_HARNESS.scenes.harnessServiceDone.textVariants?.some(({ requirements }) => requirements.flags?.includes('used_leather_repair_roll_at_harness_maker'))).toBe(true);
  });
});
