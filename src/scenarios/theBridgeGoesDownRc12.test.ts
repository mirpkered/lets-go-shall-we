import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { THE_BRIDGE_GOES_DOWN } from './disasterRescueBatch';

function start(): SaveData {
  const character = newCharacter('Bridge RC12 Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, THE_BRIDGE_GOES_DOWN, () => 0) };
}

function act(state: SaveData, sceneId: string, choiceId: string, roll = 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = THE_BRIDGE_GOES_DOWN.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, THE_BRIDGE_GOES_DOWN, choice!, () => roll);
}

function reload(state: SaveData): SaveData {
  let serialized = '';
  const storage = { setItem: (_key: string, value: string) => { serialized = value; }, getItem: () => serialized };
  saveGame(state, storage);
  return loadSave(storage);
}

describe('The Bridge Goes Down child-state continuity (R125-054)', () => {
  it('records the child reaching shore only on successful transitions into childAcross', () => {
    let rescued = act(start(), 'span', 'reachChild', 0);
    expect(rescued.run?.sceneId).toBe('childAcross');
    expect(rescued.run?.flags).toContain('bridgeChildSaved');

    let failed = act(start(), 'span', 'reachChild', 0.999999);
    expect(failed.run?.sceneId).toBe('bridgeDeath');
    expect(failed.run?.flags).not.toContain('bridgeChildSaved');

    let lineAttempt = start();
    lineAttempt.run!.inventory.push('travelRope');
    lineAttempt = act(lineAttempt, 'span', 'throwLine');
    let lineSuccess = act(lineAttempt, 'lineAcross', 'lineChild', 0);
    expect(lineSuccess.run?.sceneId).toBe('childAcross');
    expect(lineSuccess.run?.flags).toContain('bridgeChildSaved');
    let lineFailure = act(lineAttempt, 'lineAcross', 'lineChild', 0.999999);
    expect(lineFailure.run?.sceneId).toBe('bridgeDrop');
    expect(lineFailure.run?.flags).not.toContain('bridgeChildSaved');

    const guided = act(start(), 'span', 'callDriver');
    const guidedChild = act(guided, 'driverMoves', 'takeDaughter');
    expect(guidedChild.run?.sceneId).toBe('childAcross');
    expect(guidedChild.run?.flags).toContain('bridgeChildSaved');

    const rushed = act(start(), 'span', 'leaveBridge');
    const rushSuccess = act(rushed, 'bankClear', 'rushSpan', 0);
    expect(rushSuccess.run?.sceneId).toBe('childAcross');
    expect(rushSuccess.run?.flags).toContain('bridgeChildSaved');
    const rushFailure = act(rushed, 'bankClear', 'rushSpan', 0.999999);
    expect(rushFailure.run?.sceneId).toBe('bridgeDeath');
    expect(rushFailure.run?.flags).not.toContain('bridgeChildSaved');
  });

  it('keeps the shore state through mule rescue, downstream scenes, and save/reload', () => {
    let state = act(start(), 'span', 'reachChild', 0);
    state = reload(state);
    expect(state.run?.flags).toContain('bridgeChildSaved');
    state = act(state, 'childAcross', 'turnForMule', 0);
    expect(state.run?.sceneId).toBe('muleSaved');
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.muleSaved, state)).toMatch(/daughter is already on firm ground/i);
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.muleSaved, state)).not.toMatch(/child remain on the bridge/i);

    state = act(state, 'muleSaved', 'muleLeaveWagon');
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeAftermath, state)).toMatch(/girl is already on the west bank/i);
    state = act(state, 'bridgeAftermath', 'bridgeLeave');
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).toMatch(/daughter and mule reach the west bank/i);
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).not.toMatch(/daughter (?:and the mule are not confirmed|is not confirmed)/i);
  });

  it('keeps the child safe when the later span failure routes through bridgeDrop', () => {
    let state = act(start(), 'span', 'reachChild', 0);
    state = act(state, 'childAcross', 'turnForMule', 0.999999);
    expect(state.run?.sceneId).toBe('bridgeDrop');
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeDrop, state)).toMatch(/daughter, who reached shore before the span broke/i);
    state = act(state, 'bridgeDrop', 'searchNearWater');
    state = act(state, 'bridgeAftermath', 'bridgeLeave');
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).toMatch(/driver and his daughter reach the west bank/i);
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).not.toMatch(/daughter.*not confirmed/i);
  });

  it('uses neutral wording for legacy shared-scene saves without child-state proof', () => {
    const state = start();
    state.run!.sceneId = 'muleSaved';
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.muleSaved, state)).toMatch(/positions are not both confirmed/i);
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.muleSaved, state)).not.toMatch(/child remain on the bridge/i);

    state.run!.sceneId = 'bridgeEnd';
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).toMatch(/positions are still unknown/i);
    expect(sceneText(THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd, state)).not.toMatch(/daughter reaches the west bank/i);
  });
});
