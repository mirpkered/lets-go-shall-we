import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData } from '../types';
import { THE_WASHOUT } from './washout';

describe('The Washout risk foreshadowing', () => {
  it('warns that the exposed-root climb can be fatal without changing its authored odds or outcomes', () => {
    const choice = THE_WASHOUT.scenes.edgeCollapse.choices.find(({ id }) => id === 'climbRoot')!;
    expect(choice.hint).toMatch(/root may tear free.*could be fatal/i);
    expect(choice.chance).toMatchObject({
      probability: 0.69,
      lateProbability: 0.49,
      successNext: 'safeRetreat',
      failureNext: 'playerLost',
    });

    const character = newCharacter('Washout Tester');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, THE_WASHOUT, () => 0) };
    state.run!.sceneId = 'edgeCollapse';
    const failed = choose(state, THE_WASHOUT, choice, () => 0.999999);
    expect(failed.run?.sceneId).toBe('playerLost');
    expect(failed.run?.status).toBe('death');
    const succeeded = choose(state, THE_WASHOUT, choice, () => 0);
    expect(succeeded.run?.sceneId).toBe('safeRetreat');
    expect(succeeded.run?.status).toBe('success');
  });
});
