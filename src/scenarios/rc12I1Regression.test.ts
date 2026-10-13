import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';

function scenario(id: string): Scenario {
  const match = SCENARIOS.find((entry) => entry.id === id);
  if (!match) throw new Error(`Missing scenario ${id}`);
  return match;
}

function start(id: string): SaveData {
  const adventure = scenario(id);
  const character = newCharacter('RC12 I1 Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, adventure, () => 0) };
}

function act(state: SaveData, adventure: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = adventure.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${adventure.id}.${scene.id}.${choiceId}`).toBeTruthy();
  return choose(state, adventure, choice!, () => roll);
}

describe('RC12 Pass I1 route-convergence regressions', () => {
  it('does not leak book evidence into the direct-disarm debt route', () => {
    const adventure = scenario('a-gun-on-the-table');
    const state = act(start(adventure.id), adventure, 'grabGun');
    expect(state.run?.sceneId).toBe('weaponSafe');
    expect(sceneText(adventure.scenes.weaponSafe, state)).not.toMatch(/old book|eight-coin|remaining four/i);
  });

  it('keeps farm outcomes distinct from actions not taken', () => {
    const rail = scenario('the-broken-rail-at-crow-field');
    let railState = act(start(rail.id), rail, 'inspect');
    railState = act(railState, rail, 'separate');
    expect(railState.run?.sceneId).toBe('partial');
    expect(rail.scenes.partial.text).not.toMatch(/rail is braced|setting it/i);

    const ditch = scenario('the-irrigation-stone-at-south-field');
    let ditchState = act(start(ditch.id), ditch, 'mark');
    ditchState = act(ditchState, ditch, 'wait');
    expect(ditchState.run?.sceneId).toBe('partial');
    expect(ditch.scenes.partial.text).not.toMatch(/divider remains closed/i);
  });

  it('keeps the offered cobbler remedy distinct from the route taken', () => {
    const adventure = scenario('the-last-at-the-cobbler');
    let state = act(start(adventure.id), adventure, 'inspect');
    state = act(state, adventure, 'replace');
    expect(state.run?.sceneId).toBe('settlement');
    expect(adventure.scenes.settlement.text).not.toMatch(/accepts the patch/i);
  });

  it('does not carry the named-source denial into a public correction', () => {
    const adventure = scenario('the-public-apology');
    let state = act(start(adventure.id), adventure, 'blameOriginalSpeaker');
    state = act(state, adventure, 'withdrawClaim');
    expect(state.run?.sceneId).toBe('apology');
    expect(adventure.scenes.apology.text).not.toMatch(/without naming its source/i);
  });

  it('does not turn the cook-on-time route into a late-supper result', () => {
    const adventure = scenario('the-last-clean-apron');
    let state = act(start(adventure.id), adventure, 'giveCookApron');
    state = act(state, adventure, 'checkDishwasher');
    expect(state.run?.sceneId).toBe('thanks');
    expect(adventure.scenes.thanks.text).not.toMatch(/supper reaches the tables a little later/i);
  });

  it('keeps the lark response from being labeled as the kettle imitation', () => {
    const adventure = scenario('the-whistle-and-the-wind');
    let state = act(start(adventure.id), adventure, 'listenToBird');
    state = act(state, adventure, 'repeatCall');
    expect(state.run?.sceneId).toBe('round');
    expect(adventure.scenes.round.title).not.toMatch(/kettle/i);
    expect(adventure.scenes.round.text).not.toMatch(/kettle imitation/i);
  });

  it('keeps coat return separate from the tailor’s discovery of twin brothers', () => {
    const adventure = scenario('the-man-who-sheds-his-skin');
    let state = act(start(adventure.id), adventure, 'compareDetails');
    state = act(state, adventure, 'followCoachRoad');
    state = act(state, adventure, 'returnCoat');
    expect(state.run?.sceneId).toBe('identityAfter');
    expect(sceneText(adventure.scenes.identityAfter, state)).toMatch(/identity claim is still unresolved/i);
    expect(sceneText(adventure.scenes.identityAfter, state)).not.toMatch(/two brothers/i);
    const storage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(state, storage);
    expect(sceneText(adventure.scenes.identityAfter, loadSave(storage))).toMatch(/identity claim is still unresolved/i);
  });

  it('does not import sparks into the brush-bench route', () => {
    const adventure = scenario('the-winds-other-side');
    let state = act(start(adventure.id), adventure, 'chooseBrush');
    state = act(state, adventure, 'leaveCrate');
    expect(state.run?.sceneId).toBe('partial');
    expect(adventure.scenes.partial.text).not.toMatch(/sparks/i);
  });

  it('does not assign a satchel disposition to a calming route', () => {
    const adventure = scenario('silent-night');
    let state = act(start(adventure.id), adventure, 'askForQuiet');
    state = act(state, adventure, 'calmRequest');
    expect(state.run?.sceneId).toBe('argumentCools');
    expect(sceneText(adventure.scenes.argumentCools, state)).not.toMatch(/satchel/i);
  });
});
