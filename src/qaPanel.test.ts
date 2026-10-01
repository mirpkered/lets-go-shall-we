import { describe, expect, it } from 'vitest';
import { newCharacter, startRun } from './engine';
import { renderQaPanel } from './qaPanel';
import { COLD_STORAGE } from './scenarios/coldStorage';

describe('QA progression inspection', () => {
  it('shows transition diagnostics and state-based qualification without exposing QA outside QA', () => {
    const character = newCharacter();
    const state = { version: 1 as const, bank: [], character, run: startRun(character, COLD_STORAGE) };
    state.run!.qualifyingStoryTransitions = 5;
    const before = JSON.stringify(state);
    const items = {};

    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).toBe('');
    const markup = renderQaPanel(true, state, [COLD_STORAGE], items);
    expect(markup).toContain('&quot;qualifyingStoryTransitions&quot;: 5');
    expect(markup).toContain('&quot;qualifiesForTravelerProgression&quot;: false');
    expect(markup).toContain('data-qa-force-easter-egg');
    expect(markup).toContain('data-qa-disable-easter-eggs');
    expect(markup).toContain('data-qa-set-item-condition');
    expect(markup).toContain('data-qa-break-item');
    expect(markup).toContain('data-qa-repair-item');
    expect(markup).toContain('data-qa-add-upgrade');
    expect(markup).toContain('data-qa-remove-upgrade');
    expect(markup).toContain('data-qa-content-quality-report');
    expect(markup).toContain('data-qa-content-quality-report');
    expect(markup).toContain('data-qa-set-gear-capacity');
    expect(markup).toContain('data-qa-add-carried');
    expect(markup).toContain('data-qa-remove-carried');
    expect(markup).toContain('data-qa-add-supply');
    expect(markup).toContain('data-qa-set-supply');
    expect(markup).toContain('data-qa-consume-supply');
    expect(markup).toContain('&quot;inventoryClasses&quot;');
    expect(markup).toContain('&quot;carriedRelics&quot;');
    expect(markup).toContain('&quot;supplyStackCapacity&quot;: 4');
    expect(markup).toContain('&quot;itemStates&quot;');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('Easter egg');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('content quality report');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('content quality report');
    expect(JSON.stringify(state)).toBe(before);
  });
});
