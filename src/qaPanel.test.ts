import { describe, expect, it } from 'vitest';
import { newCharacter, startRun } from './engine';
import { renderQaPanel } from './qaPanel';
import { COLD_STORAGE } from './scenarios/coldStorage';

describe('QA progression inspection', () => {
  it('shows the saved transition count and qualification without exposing them outside QA', () => {
    const character = newCharacter();
    const state = { version: 1 as const, bank: [], character, run: startRun(character, COLD_STORAGE) };
    state.run!.qualifyingStoryTransitions = 5;
    const before = JSON.stringify(state);
    const items = {};

    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).toBe('');
    const markup = renderQaPanel(true, state, [COLD_STORAGE], items);
    expect(markup).toContain('&quot;qualifyingStoryTransitions&quot;: 5');
    expect(markup).toContain('&quot;qualifiesForTravelerProgression&quot;: false');
    expect(JSON.stringify(state)).toBe(before);
  });
});
