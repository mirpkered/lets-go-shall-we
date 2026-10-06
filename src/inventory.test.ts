import { describe, expect, it } from 'vitest';
import { BANK_CAPACITY } from './bank';
import { addSupply, addUpgrade, breakItem, carryCapacity, choose, consumeSupply, depositCarried, failCharacter, finishSuccess, getCarriedGearItems, getCarriedItems, getCarriedRelics, hasOwnedAsset, hasSupply, meets, newCharacter, openRewardResolution, placeReward, retireCharacter, setCarriedItems, startRun, withdrawBanked } from './engine';
import { inventoryClass, ITEMS, itemsOfClass } from './items';
import type { Item } from './types';
import type { SaveData } from './types';

const supplyScenario = {
  id: 'inventory-test', title: 'Inventory Test', subtitle: '', startScene: 'start',
  scenes: {
    start: { id: 'start', title: 'Start', text: 'Test supplies.', choices: [
      { id: 'take', label: 'Take supplies', effects: { gainSupplies: { ritualChalk: 2 } }, next: 'use' },
    ] },
    use: { id: 'use', title: 'Use', text: 'Use a supply.', choices: [
      { id: 'spend', label: 'Spend chalk', requirements: { supplies: { ritualChalk: 2 } }, effects: { consumeSupplies: { ritualChalk: 1 } }, next: 'done' },
    ] },
    done: { id: 'done', title: 'Done', text: 'Finished.', choices: [], ending: 'success' as const },
  },
};

function saveWithLoadout(ids: string[], completed = 0): SaveData {
  const character = newCharacter('Inventory Tester');
  character.adventuresCompleted = completed;
  setCarriedItems(character, ids);
  return { version: 1, bank: [], character, run: startRun(character, supplyScenario) };
}

describe('class-aware inventory model', () => {
  it('resolves every catalog entry into exactly one class and keeps class rosters distinct', () => {
    expect(Object.values(ITEMS).every(({ inventoryClass: itemClass }) => ['GEAR', 'SUPPLY', 'RELIC', 'ASSET', 'TEMPORARY'].includes(itemClass ?? ''))).toBe(true);
    expect(itemsOfClass('GEAR').some(({ id }) => id === 'smallKnife')).toBe(true);
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
    expect(itemsOfClass('RELIC').map(({ id }) => id).sort()).toEqual([
      'blackMillingStone', 'briarHouseSkeletonKey', 'bronzeMaskFragment', 'graveCoin',
      'ironOrchardRodFragment', 'numberedLanternWick', 'redDoorToken', 'signalLens', 'yewCharm',
    ]);
    expect(itemsOfClass('SUPPLY').map(({ id }) => id).sort()).toEqual(['coldIronNails', 'consecratedSalt', 'ritualChalk']);
    expect(itemsOfClass('ASSET')).toEqual([]); // Character-owned assets have their own structured field, not item IDs.
    expect(inventoryClass('boneKey')).toBe('TEMPORARY');
  });

  it('counts Gear capacity at 1/2/3 while carrying Relics independently', () => {
    for (const [completed, capacity] of [[0, 1], [10, 2], [20, 3]]) {
      const state = saveWithLoadout(['travelRope', 'bronzeMaskFragment', 'graveCoin', 'yewCharm'], completed);
      expect(carryCapacity(completed)).toBe(capacity);
      expect(getCarriedGearItems(state.character)).toEqual(['travelRope']);
      expect(getCarriedRelics(state.character)).toHaveLength(3);
      expect(getCarriedItems(state.character)).toHaveLength(4);
    }
  });

  it('deposits and withdraws Relics without using Gear capacity while retaining the five-item Bank limit', () => {
    let state = saveWithLoadout(['travelRope', 'graveCoin']);
    state = depositCarried(state, undefined, 'graveCoin');
    expect(state.bank).toEqual(['graveCoin']);
    expect(getCarriedItems(state.character)).toEqual(['travelRope']);
    state = withdrawBanked(state, 'graveCoin');
    expect(state.bank).toEqual([]);
    expect(getCarriedItems(state.character)).toEqual(['travelRope', 'graveCoin']);
    expect(BANK_CAPACITY).toBe(5);
  });

  it('adds, merges, consumes, and removes Supply stacks with explicit quantities', () => {
    let state = saveWithLoadout([]);
    state = addSupply(state, 'ritualChalk', 2);
    state = addSupply(state, 'ritualChalk', 2);
    expect(state.character?.supplies).toEqual({ ritualChalk: 4 });
    expect(addSupply(state, 'ritualChalk', 1).character?.supplies).toEqual({ ritualChalk: 4 });
    state = addSupply(state, 'consecratedSalt', 1);
    state = addSupply(state, 'coldIronNails', 1);
    state = addSupply(state, 'ritualChalk', 1);
    expect(Object.keys(state.character?.supplies ?? {})).toHaveLength(3);
    expect(hasSupply(state.character, 'ritualChalk', 4)).toBe(true);
    state = consumeSupply(state, 'ritualChalk', 3);
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    state = consumeSupply(state, 'ritualChalk', 1);
    expect(state.character?.supplies?.ritualChalk).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('1 → 0');
  });

  it('respects each canonical Supply stack limit and keeps Supplies out of carried items and the Bank', () => {
    let state = saveWithLoadout([]);
    state = addSupply(state, 'ritualChalk', 4);
    state = addSupply(state, 'consecratedSalt', 3);
    state = addSupply(state, 'coldIronNails', 6);
    expect(state.character?.supplies).toEqual({ ritualChalk: 4, consecratedSalt: 3, coldIronNails: 6 });
    expect(meets({ canAddSupplies: { consecratedSalt: 1 } }, state)).toBe(false);
    expect(meets({ canAddSupplies: { coldIronNails: 1 } }, state)).toBe(false);
    expect(getCarriedItems(state.character)).toEqual([]);
    const before = state.character?.supplies;
    state = depositCarried(state, undefined, 'ritualChalk');
    expect(state.bank).toEqual([]);
    expect(state.character?.supplies).toEqual(before);
  });

  it('rejects a fifth distinct Supply stack without silently replacing anything', () => {
    const extra = ['testSupplyFour', 'testSupplyFive'];
    const definitions: Item[] = extra.map((id) => ({ id, name: id, description: 'Test only.', category: 'consumable', carryable: false, inventoryClass: 'SUPPLY', stackLimit: 1 }));
    definitions.forEach((item) => { ITEMS[item.id] = item; });
    try {
      let state = saveWithLoadout([]);
      for (const id of ['ritualChalk', 'consecratedSalt', 'coldIronNails', extra[0]]) state = addSupply(state, id, 1);
      expect(Object.keys(state.character?.supplies ?? {})).toHaveLength(4);
      expect(meets({ canAddSupplies: { [extra[1]]: 1 } }, state)).toBe(false);
      expect(addSupply(state, extra[1], 1).character?.supplies).toEqual(state.character?.supplies);
    } finally { extra.forEach((id) => { delete ITEMS[id]; }); }
  });

  it('persists Supply gains and consumption through authored choices and evaluates requirements', () => {
    let state = saveWithLoadout([]);
    expect(meets({ canAddSupplies: { ritualChalk: 2 } }, state)).toBe(true);
    state = choose(state, supplyScenario, supplyScenario.scenes.start.choices[0]);
    expect(state.character?.supplies).toEqual({ ritualChalk: 2 });
    expect(state.run?.supplyRewarded).toBe(true);
    expect(meets({ supplies: { ritualChalk: 2 } }, state)).toBe(true);
    state = choose(state, supplyScenario, supplyScenario.scenes.use.choices[0]);
    expect(state.character?.supplies).toEqual({ ritualChalk: 1 });
    expect(state.run?.supplies).toEqual({ ritualChalk: 1 });
    expect(state.run?.supplyNotice).toContain('2 → 1');
  });

  it('counts an authored Supply reward but not Supply consumption alone toward traveler progression', () => {
    let rewarded = saveWithLoadout([]);
    rewarded = choose(rewarded, supplyScenario, supplyScenario.scenes.start.choices[0]);
    rewarded = choose(rewarded, supplyScenario, supplyScenario.scenes.use.choices[0]);
    expect(rewarded.run?.status).toBe('success');
    rewarded = finishSuccess(rewarded, null);
    expect(rewarded.character?.adventuresCompleted).toBe(1);
    const consumptionOnly = {
      id: 'consume-only-test', title: 'Consume only', subtitle: '', startScene: 'start',
      scenes: {
        start: { id: 'start', title: 'Start', text: 'Spend a supply.', choices: [{ id: 'spend', label: 'Spend', effects: { consumeSupplies: { ritualChalk: 1 } }, next: 'end' }] },
        end: { id: 'end', title: 'End', text: 'The task is declined.', choices: [], ending: 'success' as const, completionQualification: 'nonSubstantive' as const },
      },
    };
    let spent = saveWithLoadout([]);
    spent.character!.supplies = { ritualChalk: 1 };
    spent.run = startRun(spent.character!, consumptionOnly);
    spent = choose(spent, consumptionOnly, consumptionOnly.scenes.start.choices[0]);
    spent = finishSuccess(spent, null);
    expect(spent.character?.supplies).toEqual({});
    expect(spent.character?.adventuresCompleted).toBe(0);
  });

  it('checks usable Gear, upgrades, Relics, temporary equipment, and owned Assets separately', () => {
    let state = saveWithLoadout(['travelRope', 'yewCharm']);
    state.run!.inventory.push('travelRope', 'yewCharm', 'borrowedShovel');
    state.run!.inventorySources = { ...state.run!.inventorySources, borrowedShovel: 'borrowed' };
    state.character!.ownedAssets = [{ id: 'horse', name: 'Old Horse', description: 'A steady pack animal.' }];
    expect(hasOwnedAsset(state, 'horse')).toBe(true);
    expect(meets({ gear: ['travelRope'], usableGear: ['travelRope'], relics: ['yewCharm'], temporaryEquipment: ['borrowedShovel'], ownedAssets: ['horse'] }, state)).toBe(true);
    state = addUpgrade(state, 'travelRope', 'splicedEyes', 'Test ropewright');
    expect(meets({ gearUpgrades: { travelRope: ['splicedEyes'] } }, state)).toBe(true);
    state = breakItem(state, 'travelRope');
    expect(meets({ gear: ['travelRope'] }, state)).toBe(true);
    expect(meets({ usableGear: ['travelRope'] }, state)).toBe(false);
    expect(meets({ temporaryEquipment: ['borrowedShovel'] }, { ...state, run: { ...state.run!, inventorySources: { borrowedShovel: 'found' } } })).toBe(false);
  });

  it('blocks notOwnedItems choices when the item is carried or banked', () => {
    const carried = saveWithLoadout(['travelRope']);
    const banked = saveWithLoadout([]);
    banked.bank = ['travelRope'];
    const absent = saveWithLoadout([]);

    expect(meets({ notOwnedItems: ['travelRope'] }, carried)).toBe(false);
    expect(meets({ notOwnedItems: ['travelRope'] }, banked)).toBe(false);
    expect(meets({ notOwnedItems: ['travelRope'] }, absent)).toBe(true);
  });

  it('loses traveler-held supplies and Relics on death while preserving banked property', () => {
    let state = saveWithLoadout(['bronzeMaskFragment']);
    state.character!.supplies = { ritualChalk: 2, consecratedSalt: 1, coldIronNails: 2 };
    state.bank = ['graveCoin'];
    state.itemStates = { bronzeMaskFragment: { condition: 'NORMAL', upgrades: [], provenance: [] }, graveCoin: { condition: 'NORMAL', upgrades: [], provenance: [] } };
    state = failCharacter(state);
    expect(state.character).toBeNull();
    expect(state.bank).toEqual(['graveCoin']);
    expect(state.itemStates).toEqual({ graveCoin: { condition: 'NORMAL', upgrades: [], provenance: [] } });
  });

  it('also loses character-bound inventory and Assets on retirement while preserving the Bank', () => {
    const state = saveWithLoadout(['yewCharm']);
    state.character!.supplies = { ritualChalk: 1, consecratedSalt: 2, coldIronNails: 3 };
    state.character!.ownedAssets = [{ id: 'horse', name: 'Old Horse', description: 'A steady pack animal.' }];
    state.character!.money = 17;
    state.bank = ['travelRope'];
    state.itemStates = { yewCharm: { condition: 'NORMAL', upgrades: [], provenance: [] }, travelRope: { condition: 'DAMAGED', upgrades: [], provenance: [] } };
    const retired = retireCharacter(state);
    expect(retired.character).toBeNull();
    expect(retired.run).toBeNull();
    expect(retired.bank).toEqual(['travelRope']);
    expect(retired.itemStates).toEqual({ travelRope: { condition: 'DAMAGED', upgrades: [], provenance: [] } });
  });

  it('lets Relic rewards occupy carry independently of full Gear capacity and keeps one reward exclusive', () => {
    const character = newCharacter('Relic Reward');
    setCarriedItems(character, ['travelRope']);
    const run = startRun(character, supplyScenario);
    run.status = 'success';
    run.inventory.push('bronzeMaskFragment', 'yewCharm');
    run.acquiredThisRun.push('bronzeMaskFragment', 'yewCharm');
    run.rewardPendingItems = ['bronzeMaskFragment'];
    let state: SaveData = { version: 1, bank: [], character, run };
    state = openRewardResolution(state);
    state = placeReward(state, 'bronzeMaskFragment', 'carry');
    expect(getCarriedGearItems(state.character)).toEqual(['travelRope']);
    expect(getCarriedRelics(state.character)).toEqual(['bronzeMaskFragment']);
    expect(state.run?.rewardPendingItems).toEqual([]);
    expect(placeReward(state, 'yewCharm', 'carry').run?.rewardPendingItems).toEqual([]);
    state = finishSuccess(state, getCarriedItems(state.character));
    expect(state.character?.carriedItems).toEqual(['travelRope', 'bronzeMaskFragment']);
  });
});
