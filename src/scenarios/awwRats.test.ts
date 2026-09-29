import { describe, expect, it } from 'vitest';
import { choose, failCharacter, meets, newCharacter, startRun } from '../engine';
import type { SaveData } from '../types';
import { AWW_RATS } from './awwRats';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Farmhand for a Day');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, AWW_RATS) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = AWW_RATS.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, AWW_RATS, choice!, () => random);
}

function reachGrainDecision(state = fresh()): SaveData {
  state = act(state, 'inspectGrain');
  state = act(state, 'noteDust');
  return act(state, 'skipSupplies');
}

describe('Aww, Rats!!', () => {
  it('lets a broke fresh character clear the nest with ordinary farm materials', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state = act(state, 'simpleTrap');
    state = act(state, 'checkTraps');
    state = act(state, 'takeHook');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('cleanEnding');
    expect(state.run?.inventory).toContain('ratCatchersHook');
  });

  it('supports a distinct sealing route and a containment ending', () => {
    let state = reachGrainDecision();
    state = act(state, 'isolateGrain');
    state = act(state, 'sealRoutes');
    state = act(state, 'braceBoards');
    state = act(state, 'finishSealing');
    state = act(state, 'takeGloves');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('containmentEnding');
    expect(state.run?.inventory).toContain('heavyLeatherGloves');
  });

  it('supports controlled smoke with purchased equipment as a third distinct route', () => {
    let state = act(fresh(), 'askAdvance');
    state = act(state, 'headToStore');
    state = act(state, 'buyBellows');
    state = act(state, 'salvageGrain', 0);
    state = act(state, 'smokeNest');
    state = act(state, 'bellowsSmoke');
    state = act(state, 'finishSmoke');
    state = act(state, 'takeGloves');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyEnding');
    expect(state.character?.money).toBe(1);
  });

  it('makes grain preservation a genuine risk with understandable costs', () => {
    const start = act(fresh(), 'askAdvance');
    const paid = act(start, 'headToStore');
    const withSupplies = act(paid, 'skipSupplies');
    const saved = act(withSupplies, 'salvageGrain', 0);
    const lost = act(withSupplies, 'salvageGrain', 0.99);
    expect(saved.run?.flags).toContain('grainSaved');
    expect(saved.run?.sceneId).toBe('grainSalvaged');
    expect(lost.run?.flags).toContain('grainDestroyed');
    expect(lost.run?.flags).toContain('salvageFailed');
    expect(lost.run?.sceneId).toBe('grainSpoiled');
    expect(lost.character?.money).toBe(2);
  });

  it('uses character money for optional supplies while preserving a free route', () => {
    let state = act(fresh(), 'askAdvance');
    state = act(state, 'headToStore');
    expect(state.character?.money).toBe(4);
    state = act(state, 'buyTraps');
    expect(state.character?.money).toBe(1);
    expect(state.run?.inventory).toContain('ratBait');
    expect(state.run?.inventory).toContain('wireTraps');
    expect(state.run?.acquiredThisRun).toContain('wireTraps');
  });

  it('makes carried toolkit useful without making it necessary', () => {
    let state = fresh(0, 'pocketToolkit');
    state = reachGrainDecision(state);
    state = act(state, 'isolateGrain');
    state = act(state, 'sealRoutes');
    expect(AWW_RATS.scenes.sealPlan.choices.filter((choice) => meets(choice.requirements, state)).map((choice) => choice.id)).toContain('toolSeal');
    state = act(state, 'toolSeal');
    expect(state.run?.sceneId).toBe('routesSealed');
  });

  it('advances after a failed dangerous check and communicates the threat first', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state = act(state, 'simpleTrap', 0.99);
    expect(state.run?.sceneId).toBe('trapBurst');
    expect(state.run?.health).toBe(8);
    expect(AWW_RATS.scenes.trapBurst.text).toContain('visibly giving way');
    state = act(state, 'retreatSwarm');
    expect(state.run?.sceneId).toBe('survivalEnding');
    expect(state.run?.status).toBe('success');
  });

  it('offers no duplicate carry reward and describes how each new item is obtained', () => {
    const state = fresh(0, 'ratCatchersHook');
    state.run!.sceneId = 'rewardClean';
    const available = AWW_RATS.scenes.rewardClean.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).not.toContain('takeHook');
    expect(available.map((choice) => choice.id)).toContain('takeGloves');
    expect(AWW_RATS.scenes.rewardClean.text).toContain('offers one useful tool in thanks');
    expect(AWW_RATS.scenes.rewardClean.choices.find((choice) => choice.id === 'takeHook')?.effects?.gainItems).toContain('ratCatchersHook');
    expect(AWW_RATS.scenes.rewardClean.choices.find((choice) => choice.id === 'takeGloves')?.effects?.gainItems).toContain('heavyLeatherGloves');
  });

  it('applies standard death cleanup while leaving the bank intact', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state.run!.health = 3;
    state = act(state, 'simpleTrap', 0.99);
    state.run!.health = 4;
    state = act(state, 'reachGate', 0.99);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
    const failed = failCharacter(state);
    expect(failed.character).toBeNull();
    expect(failed.run).toBeNull();
    expect(failed.bank).toEqual(['graveCoin']);
  });
});
