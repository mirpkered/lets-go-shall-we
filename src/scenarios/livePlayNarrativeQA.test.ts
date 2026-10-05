import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { THE_CLOCK_THAT_KEPT_LOCAL_TIME } from './surpriseEverydayBatch';

describe('live-play narrative continuity repairs', () => {
  it('names the waiting passengers in the local-time question choice', () => {
    const scenario = THE_CLOCK_THAT_KEPT_LOCAL_TIME;
    const character = newCharacter('Clock QA');
    const state = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const choice = scenario.scenes.platform.choices.find(({ id }) => id === 'askWaitingPassengers')!;
    expect(choice.label).toMatch(/waiting passengers/i);
    expect(choose(state, scenario, choice).run?.sceneId).toBe('passengers');
  });
});
