import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startAdventure } from '../engine';
import type { Choice, SaveData } from '../types';
import { AFTER_THE_STORM } from './afterTheStorm';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Farm Visitor');
  character.carriedItem = carriedItem;
  return startAdventure({ version: 1, bank: [], character, run: null }, AFTER_THE_STORM);
}

function act(state: SaveData, id: string): SaveData {
  const scene = AFTER_THE_STORM.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, AFTER_THE_STORM, choice!);
}

function options(state: SaveData): Choice[] {
  return AFTER_THE_STORM.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

describe('After the Storm', () => {
  it('records each completed task and gives two completed tasks a distinct payoff', () => {
    let state = fresh();
    state = act(state, 'treatFarmhand');
    state = act(state, 'goatsAfterArm');
    expect(state.run?.flags).toEqual(expect.arrayContaining(['armTreated', 'goatsReturned']));
    state = act(state, 'treatAfterGoats');
    expect(state.run?.sceneId).toBe('stormAftermath');
    expect(sceneText(AFTER_THE_STORM.scenes.stormAftermath, state)).toMatch(/two.*problems|two urgent worries/i);
    state = act(state, 'takeLeaveFromFarm');
    expect(sceneText(AFTER_THE_STORM.scenes.helpedOnceEnding, state)).toMatch(/two of the storm’s problems/i);
    expect(state.run?.status).toBe('success');
  });

  it('acknowledges one-task, two-task, and all-task outcomes accurately', () => {
    let goats = fresh();
    goats = act(goats, 'findGoats');
    goats = act(goats, 'leaveAfterGoats');
    expect(sceneText(AFTER_THE_STORM.scenes.stormAftermath, goats)).toMatch(/goats are penned again/i);

    let pair = fresh('travelRope');
    pair = act(pair, 'secureRoof');
    pair = act(pair, 'fetchGoatsAfterRoof');
    expect(sceneText(AFTER_THE_STORM.scenes.stormAftermath, pair)).toMatch(/two.*problems/i);

    let all = fresh('travelRope');
    all = act(all, 'treatFarmhand');
    all = act(all, 'roofAfterArm');
    all = act(all, 'fetchGoatsAfterRoof');
    expect(sceneText(AFTER_THE_STORM.scenes.stormAftermath, all)).toMatch(/goats are penned.*arm is cleanly wrapped.*roof corner/i);
  });

  it('keeps partial help valid and does not imply unfinished tasks were solved', () => {
    let state = fresh();
    state = act(state, 'askFarmhandPriority');
    state = act(state, 'wrapAfterPriority');
    state = act(state, 'leaveAfterArm');
    const text = sceneText(AFTER_THE_STORM.scenes.stormAftermath, state);
    expect(text).toContain('arm is cleanly wrapped');
    expect(text).toContain('goats remain beyond the gate');
    expect(options(state).map((choice) => choice.id)).toEqual(['takeLeaveFromFarm']);
  });
});
