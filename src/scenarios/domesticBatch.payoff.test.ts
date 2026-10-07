import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData } from '../types';
import { DOMESTIC_ADVENTURES } from './domesticBatch';

describe('domestic scenario payoff', () => {
  it('keeps the passenger in control and gives the quiet ride a concrete arrival payoff', () => {
    const scenario = DOMESTIC_ADVENTURES.find(({ id }) => id === 'the-back-door')!;
    const character = newCharacter('Quiet Departure QA');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const pick = (choiceId: string) => {
      const current = scenario.scenes[state.run!.sceneId];
      const choice = current.choices.find(({ id }) => id === choiceId);
      expect(choice, `${current.id}.${choiceId}`).toBeDefined();
      state = choose(state, scenario, choice!);
    };

    pick('take-privacy');
    expect(state.run?.sceneId).toBe('privacy');
    pick('privacy-ride');
    const ending = scenario.scenes[state.run!.sceneId];
    expect(ending.title).toBe('A Ride Chosen by Them');
    expect(ending.text).toMatch(/choose where it stops/i);
    expect(ending.text).toMatch(/whether you accompany them/i);
    expect(ending.text).toMatch(/their plan—not a confrontation—sets its terms/i);
  });
});
