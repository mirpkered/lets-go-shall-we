import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { FRONTIER_DISCOVERY_ADVENTURES } from './frontierDiscoveryBatch';

const byId = (id: string) => FRONTIER_DISCOVERY_ADVENTURES.find((scenario) => scenario.id === id)!;

function start(id: string): SaveData {
  const scenario = byId(id);
  const character = newCharacter(`RC12 ${id}`);
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, sceneId: string, choiceId: string, roll = 0): SaveData {
  const scenario = byId(state.run!.scenarioId);
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

function resume(state: SaveData): SaveData {
  let serialized = '';
  const storage = { setItem: (_key: string, value: string) => { serialized = value; }, getItem: () => serialized };
  saveGame(state, storage);
  return loadSave(storage);
}

describe('Frontier Discovery RC12 route-truth closures', () => {
  it('distinguishes untouched, recovered-to-view, and failed-retrieval floorboard routes', () => {
    const scenario = byId('floorboard-that-was-replaced');
    let untouched = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    untouched = act(untouched, `${scenario.id}Evidence`, 'readEvidence');
    untouched = act(untouched, `${scenario.id}Decision`, 'takeCareful');
    expect(scenario.scenes[untouched.run!.sceneId].text).toMatch(/remains under the floor/i);
    expect(scenario.scenes[untouched.run!.sceneId].text).not.toMatch(/put back|meant to hide/i);

    let opened = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    opened = act(opened, `${scenario.id}Evidence`, 'followEvidence');
    opened = act(opened, `${scenario.id}Decision`, 'takeRisk', 0);
    expect(scenario.scenes[opened.run!.sceneId].text).toMatch(/pry up the replaced board/i);
    expect(scenario.scenes[opened.run!.sceneId].text).toMatch(/leave it in the cabin/i);

    let failed = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    failed = act(failed, `${scenario.id}Evidence`, 'followEvidence');
    failed = act(failed, `${scenario.id}Decision`, 'takeRisk', 0.999999);
    expect(scenario.scenes[failed.run!.sceneId].text).toMatch(/slips beyond safe reach/i);
    expect(scenario.scenes[failed.run!.sceneId].text).not.toMatch(/put back beneath the board/i);
  });

  it('states that the sluice gate was opened and tested on the route that does so', () => {
    const scenario = byId('forgotten-sluice');
    let state = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    state = act(state, `${scenario.id}Evidence`, 'followEvidence');
    state = act(state, `${scenario.id}Decision`, 'continueSearch');
    expect(state.run?.sceneId).toBe(`${scenario.id}Bold`);
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/open the small gate and test the flow/i);
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/changed position/i);
    expect(scenario.scenes[state.run!.sceneId].text).not.toMatch(/gate stays where you found it/i);
  });

  it('does not claim a ridge check after only waiting at the station, including after reload', () => {
    const scenario = byId('the-missing-assayer');
    let waiting = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    waiting = act(waiting, `${scenario.id}Evidence`, 'callFromDoor');
    waiting = act(waiting, `${scenario.id}Wait`, 'leaveStationNote');
    waiting = resume(waiting);
    expect(waiting.run?.sceneId).toBe(`${scenario.id}Cautious`);
    expect(sceneText(scenario.scenes[waiting.run!.sceneId], waiting)).toMatch(/does not establish whether the ridge trail is passable/i);
    expect(sceneText(scenario.scenes[waiting.run!.sceneId], waiting)).not.toMatch(/after checking the ridge trail/i);

    let ridge = act(start(scenario.id), `${scenario.id}Start`, 'approach');
    ridge = act(ridge, `${scenario.id}Evidence`, 'followRidgeTrail');
    ridge = act(ridge, `${scenario.id}Decision`, 'callAndReturn');
    expect(ridge.run?.flags).toContain('assayer_checked_ridge');
    expect(sceneText(scenario.scenes[ridge.run!.sceneId], ridge)).toMatch(/after checking the ridge trail/i);
  });
});
