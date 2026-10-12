import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { THE_WASHOUT } from './washout';

function start(sceneId = THE_WASHOUT.startScene): SaveData {
  const character = newCharacter('Washout RC12 Tester');
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, THE_WASHOUT, () => 0) };
  state.run!.sceneId = sceneId;
  return state;
}

function act(state: SaveData, sceneId: string, choiceId: string, roll = 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = THE_WASHOUT.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, THE_WASHOUT, choice!, () => roll);
}

function afterRain(): SaveData {
  let state = act(start(), 'upperRoad', 'callCourier');
  state = act(state, 'courierAnswers', 'walkForHelp');
  return state;
}

function reload(state: SaveData): SaveData {
  let serialized = '';
  const storage = { setItem: (_key: string, value: string) => { serialized = value; }, getItem: () => serialized };
  saveGame(state, storage);
  return loadSave(storage);
}

describe('The Washout cart and supply continuity (RO29-10)', () => {
  it('keeps the failed courier-rope route out of the cart-recovered ending', () => {
    const state = act(afterRain(), 'rescueAfterRain', 'guideCourierRope', 0.999999);
    expect(state.run?.sceneId).toBe('courierSafe');
    expect(state.run?.flags).toContain('washoutCartCaughtAtBend');
    const text = sceneText(THE_WASHOUT.scenes.courierSafe, state);
    expect(text).toMatch(/cart remains caught at the trail bend/i);
    expect(text).toMatch(/supplies have not yet reached the village/i);
    expect(text).not.toMatch(/cart.*recovered|supplies reach the village/i);
  });

  it('preserves the successful courier-rope outcome and its recovery proof', () => {
    const state = act(afterRain(), 'rescueAfterRain', 'guideCourierRope', 0);
    expect(state.run?.sceneId).toBe('courierSafe');
    expect(state.run?.flags).not.toContain('washoutCartRecovered');
    expect(sceneText(THE_WASHOUT.scenes.courierSafe, state)).toMatch(/reaches the uphill road/i);
  });

  it('retains the full-recovery ending for routes that establish cart recovery', () => {
    let state = act(start(), 'upperRoad', 'findUpperTrail', 0);
    state.run!.inventory.push('travelRope');
    state = act(state, 'upperTrailFound', 'sendCourierFirst', 0);
    expect(state.run?.sceneId).toBe('cartRecovered');
    expect(state.run?.flags).toContain('washoutCartRecovered');
    expect(sceneText(THE_WASHOUT.scenes.cartRecovered, state)).toMatch(/handcart is recovered to the ridge/i);

    const teamSuccess = act(afterRain(), 'rescueAfterRain', 'recoverCartWithTeam', 0);
    expect(teamSuccess.run?.sceneId).toBe('cartRecovered');
    expect(teamSuccess.run?.flags).toContain('washoutCartRecovered');
    expect(sceneText(THE_WASHOUT.scenes.cartRecovered, teamSuccess)).toMatch(/handcart is recovered to the ridge/i);
  });

  it('keeps cargo loss distinct from courier safety when team recovery fails', () => {
    const state = act(afterRain(), 'rescueAfterRain', 'recoverCartWithTeam', 0.999999);
    expect(state.run?.sceneId).toBe('courierSafe');
    expect(sceneText(THE_WASHOUT.scenes.courierSafe, state)).toMatch(/handcart remains on the far shelf/i);
    expect(sceneText(THE_WASHOUT.scenes.courierSafe, state)).not.toMatch(/supplies reach the village/i);
  });

  it('uses neutral truthful text for legacy cartRecovered saves without recovery proof', () => {
    const legacy = start('cartRecovered');
    const text = sceneText(THE_WASHOUT.scenes.cartRecovered, legacy);
    expect(text).toMatch(/does not establish whether the cart or its supplies reached the village/i);
    expect(text).not.toMatch(/handcart is recovered to the ridge/i);
  });

  it('preserves recovery state through save and reload and leaves the separate rope issue untouched', () => {
    const recovered = reload(act(afterRain(), 'rescueAfterRain', 'recoverCartWithTeam', 0));
    expect(recovered.run?.flags).toContain('washoutCartRecovered');
    expect(sceneText(THE_WASHOUT.scenes.cartRecovered, recovered)).toMatch(/handcart is recovered to the ridge/i);

    const ropeClimb = THE_WASHOUT.scenes.edgeCollapse.choices.find(({ id }) => id === 'useRopeClimb')!;
    expect(ropeClimb.requirements).toEqual({ items: ['travelRope'] });
    expect(ropeClimb.next).toBe('safeRetreat');
  });
});
