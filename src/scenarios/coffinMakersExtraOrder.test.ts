import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { OCTOBER_AFFINITY_ADVENTURES } from './octoberAffinityBatch';

const COFFIN_ORDER = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'coffin-makers-extra-order')!;

function start(): SaveData {
  const character = newCharacter('Coffin Order Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, COFFIN_ORDER as Scenario, () => 0) };
}

function act(state: SaveData, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = COFFIN_ORDER.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, COFFIN_ORDER as Scenario, choice!, () => 0);
}

describe('The Coffin Maker’s Extra Order route truth', () => {
  it('does not assign the tailor’s threat or Knowledge on a payment-return route', () => {
    for (const route of ['payment', 'joint', 'evidence']) {
      let state = start();
      if (route === 'joint') {
        state = act(state, 'coffinWorkshop', 'askDace');
        state = act(state, 'daceAccount', 'bringMakerTogether');
      } else if (route === 'evidence') {
        state = act(state, 'coffinWorkshop', 'traceOrder');
        state = act(state, 'orderClue', 'keepOrderEvidence');
      } else {
        state = act(state, 'coffinWorkshop', 'returnPayment');
      }
      expect(state.run?.sceneId).toBe('coffinAfter');
      expect(state.character?.knowledge).not.toContain('An anonymous coffin order used a living man’s tailor measurements to threaten him over a disputed debt.');
      state = act(state, 'coffinAfter', 'coffinFinish');
      expect(state.run?.sceneId).toBe('coffinFinish');
      expect(sceneText(COFFIN_ORDER.scenes.coffinFinish, state)).toMatch(/tailor’s role in the threat remains unresolved/i);
      expect(state.character?.knowledge).not.toContain('An anonymous coffin order used a living man’s tailor measurements to threaten him over a disputed debt.');
    }
  });

  it('preserves the specific accountability and Knowledge only after the tailor confirms the threat', () => {
    let state = start();
    state = act(state, 'coffinWorkshop', 'traceOrder');
    state = act(state, 'orderClue', 'confrontTailor');
    expect(state.run?.sceneId).toBe('tailorAccount');
    state = act(state, 'tailorAccount', 'keepOrder');
    expect(state.character?.knowledge).toContain('An anonymous coffin order used a living man’s tailor measurements to threaten him over a disputed debt.');
    state = act(state, 'coffinAfter', 'coffinFinish');
    expect(sceneText(COFFIN_ORDER.scenes.coffinFinish, state)).toMatch(/tailor must answer/i);
    expect(state.character?.historyFlags).toContain('Helped expose a threat disguised as a coffin order');
  });
});
