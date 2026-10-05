import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { THE_BOILER_ROOM, THE_TRAIN_THAT_DIDNT_STOP } from './disasterRescueBatch';
import { THE_BROKEN_AXLE } from './survivalExpeditionBatch';

function start(scenario: Scenario, carried: string[] = [], bank: string[] = [], condition: 'NORMAL' | 'DAMAGED' | 'BROKEN' = 'DAMAGED'): SaveData {
  const character = newCharacter('Reward Route Tester');
  character.carriedItems = carried;
  character.carriedItem = carried[0] ?? null;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, bank };
  if (carried.length) state.itemStates = Object.fromEntries(carried.map((id) => [id, { condition, upgrades: [], provenance: [] }]));
  const run = startRun(character, scenario, () => 0);
  return { ...state, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, roll = 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${choice!.id} should be available`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function resolveBrokenAxle(state: SaveData, reward: 'takeSpareWheelWrench' | 'takeAxleCoins' | 'repairWheelWrench'): SaveData {
  let next = act(state, THE_BROKEN_AXLE, 'axleRoad', 'unloadAxle');
  if (next.run?.sceneId === 'axleBraced') next = act(next, THE_BROKEN_AXLE, 'axleBraced', 'walkBracedAxle');
  else next = act(next, THE_BROKEN_AXLE, 'axleLightened', 'slowAxleHome');
  next = act(next, THE_BROKEN_AXLE, 'axleSettlement', reward);
  return next;
}

describe('utility-first reward access routes', () => {
  it('offers the mill multi-tool only as an explicit alternative to its two-coin payment', () => {
    let state = start(THE_BOILER_ROOM);
    state = act(state, THE_BOILER_ROOM, 'yard', 'warnShift');
    state = act(state, THE_BOILER_ROOM, 'workersOut', 'callMachinist');
    state = act(state, THE_BOILER_ROOM, 'foremanActs', 'holdYard');
    state = act(state, THE_BOILER_ROOM, 'boilerWait', 'waitEngineer');
    expect(state.run?.sceneId).toBe('boilerAftermath');
    state = act(state, THE_BOILER_ROOM, 'boilerAftermath', 'boilerTakeTool');
    expect(state.run?.sceneId).toBe('boilerEnd');
    expect(state.run?.acquiredThisRun).toContain('foremanMultiTool');
    expect(openRewardResolution(state).run?.rewardPendingItems).toContain('foremanMultiTool');
    const coinStart = start(THE_BOILER_ROOM);
    let coinState = act(coinStart, THE_BOILER_ROOM, 'yard', 'warnShift');
    coinState = act(coinState, THE_BOILER_ROOM, 'workersOut', 'callMachinist');
    coinState = act(coinState, THE_BOILER_ROOM, 'foremanActs', 'holdYard');
    coinState = act(coinState, THE_BOILER_ROOM, 'boilerWait', 'waitEngineer');
    coinState = act(coinState, THE_BOILER_ROOM, 'boilerAftermath', 'boilerLeave');
    expect(coinState.character?.money).toBe(2);
    const alreadyBanked = start(THE_BOILER_ROOM, [], ['foremanMultiTool']);
    expect(meets(THE_BOILER_ROOM.scenes.boilerAftermath.choices.find(({ id }) => id === 'boilerTakeTool')?.requirements, alreadyBanked)).toBe(false);
  });

  it('repairs only a damaged or broken Pocket Toolkit at the mill, preserving healthy-tool and cash options', () => {
    const healthy = start(THE_BOILER_ROOM, ['pocketToolkit'], [], 'DAMAGED');
    const healthyChoice = THE_BOILER_ROOM.scenes.boilerAftermath.choices.find(({ id }) => id === 'boilerRepairTool')!;
    const alreadyNormal = structuredClone(healthy);
    alreadyNormal.itemStates!.pocketToolkit!.condition = 'NORMAL';
    expect(meets(healthyChoice.requirements, alreadyNormal)).toBe(false);
    expect(meets(healthyChoice.requirements, healthy)).toBe(true);
    let state = start(THE_BOILER_ROOM, ['pocketToolkit'], [], 'BROKEN');
    state = act(state, THE_BOILER_ROOM, 'yard', 'warnShift');
    state = act(state, THE_BOILER_ROOM, 'workersOut', 'callMachinist');
    state = act(state, THE_BOILER_ROOM, 'foremanActs', 'holdYard');
    state = act(state, THE_BOILER_ROOM, 'boilerWait', 'waitEngineer');
    state = act(state, THE_BOILER_ROOM, 'boilerAftermath', 'boilerRepairTool');
    expect(state.itemStates?.pocketToolkit?.condition).toBe('NORMAL');
    expect(state.itemStates?.pocketToolkit?.provenance).toContain('Repaired at the mill after the boiler shutdown');
  });

  it('offers the retired railway Pocket Toolkit after a station rescue, with cash or decline alternatives', () => {
    let state = start(THE_TRAIN_THAT_DIDNT_STOP);
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'platform', 'showRedLamp');
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'signalSeen', 'signalWait');
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'platformClear', 'clearWait');
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'trainAftermath', 'trainReport');
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'trainSettlement', 'takeStationToolkit');
    expect(state.run?.acquiredThisRun).toContain('pocketToolkit');
    expect(openRewardResolution(state).run?.rewardPendingItems).toContain('pocketToolkit');
    const alreadyCarried = start(THE_TRAIN_THAT_DIDNT_STOP, ['pocketToolkit']);
    const toolkitChoice = THE_TRAIN_THAT_DIDNT_STOP.scenes.trainSettlement.choices.find(({ id }) => id === 'takeStationToolkit')!;
    expect(meets(toolkitChoice.requirements, alreadyCarried)).toBe(false);
    const coinStart = start(THE_TRAIN_THAT_DIDNT_STOP);
    let coins = act(coinStart, THE_TRAIN_THAT_DIDNT_STOP, 'platform', 'showRedLamp');
    coins = act(coins, THE_TRAIN_THAT_DIDNT_STOP, 'signalSeen', 'signalWait');
    coins = act(coins, THE_TRAIN_THAT_DIDNT_STOP, 'platformClear', 'clearWait');
    coins = act(coins, THE_TRAIN_THAT_DIDNT_STOP, 'trainAftermath', 'trainReport');
    coins = act(coins, THE_TRAIN_THAT_DIDNT_STOP, 'trainSettlement', 'takeTrainCoins');
    expect(coins.character?.money).toBe(2);
  });

  it('offers a cartwright’s duplicate Compact Wheel Wrench, with duplicate-safe cash and condition-aware repair alternatives', () => {
    const acquired = resolveBrokenAxle(start(THE_BROKEN_AXLE), 'takeSpareWheelWrench');
    expect(acquired.run?.acquiredThisRun).toContain('compactWheelWrench');
    const pending = openRewardResolution(acquired);
    expect(pending.run?.rewardPendingItems).toContain('compactWheelWrench');
    const bankedForCapacity = placeReward({ ...pending, bank: ['heavyLeatherGloves'], character: { ...pending.character!, carriedItems: ['heavyLeatherGloves'], carriedItem: 'heavyLeatherGloves' } }, 'compactWheelWrench', 'bank');
    expect(bankedForCapacity.bank).toEqual(['heavyLeatherGloves', 'compactWheelWrench']);
    expect(finishRewardResolution(bankedForCapacity).run).toBeNull();
    expect(resolveBrokenAxle(start(THE_BROKEN_AXLE), 'takeAxleCoins').character?.money).toBe(2);
    const banked = start(THE_BROKEN_AXLE, [], ['compactWheelWrench']);
    const wrenchChoice = THE_BROKEN_AXLE.scenes.axleSettlement.choices.find(({ id }) => id === 'takeSpareWheelWrench')!;
    expect(meets(wrenchChoice.requirements, banked)).toBe(false);
    const repaired = resolveBrokenAxle(start(THE_BROKEN_AXLE, ['compactWheelWrench'], [], 'BROKEN'), 'repairWheelWrench');
    expect(repaired.itemStates?.compactWheelWrench?.condition).toBe('NORMAL');
    expect(repaired.itemStates?.compactWheelWrench?.provenance).toContain('Repaired by the cartwright after the broken-axle rescue');
    const healthy = start(THE_BROKEN_AXLE, ['compactWheelWrench'], [], 'NORMAL');
    const repairChoice = THE_BROKEN_AXLE.scenes.axleSettlement.choices.find(({ id }) => id === 'repairWheelWrench')!;
    expect(meets(repairChoice.requirements, healthy)).toBe(false);
  });
});
