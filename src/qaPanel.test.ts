import { describe, expect, it } from 'vitest';
import { newCharacter, startRun } from './engine';
import { filterQaScenarios, QA_BUILD_ID, renderQaPanel } from './qaPanel';
import { COLD_STORAGE } from './scenarios/coldStorage';

describe('QA progression inspection', () => {
  it('shows transition diagnostics and state-based qualification without exposing QA outside QA', () => {
    const character = newCharacter();
    const state = { version: 1 as const, bank: [], character, run: startRun(character, COLD_STORAGE) };
    state.run!.qualifyingStoryTransitions = 5;
    const before = JSON.stringify(state);
    const items = {};
    const counter = { endpointConfigured: true, endpoint: 'https://counter.example', currentGlobalTotal: 14, currentRunId: state.run!.runId!, currentRunQA: false, currentRunQueuedForSubmission: false, pendingRetryCount: 1, lastRequestResult: 'Completion pending' };

    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).toBe('');
    const markup = renderQaPanel(true, state, [COLD_STORAGE], items, null, counter);
    expect(markup).toContain(`QA Tools · build ${QA_BUILD_ID}`);
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
    expect(markup).toContain('data-qa-simulate-selection="100"');
    expect(markup).toContain('data-qa-simulate-selection="1000"');
    expect(markup).toContain('selectionCategoryHistory');
    expect(markup).toContain('&quot;contacts&quot;: []');
    expect(markup).toContain('&quot;favors&quot;: []');
    expect(markup).toContain('nextSelection');
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
    expect(markup).toContain('data-qa-counter-inspection');
    expect(markup).toContain('&quot;currentGlobalTotal&quot;: 14');
    expect(markup).toContain('&quot;pendingRetryCount&quot;: 1');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items, null, counter)).not.toContain('counter.example');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('Easter egg');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('content quality report');
    expect(renderQaPanel(false, state, [COLD_STORAGE], items)).not.toContain('content quality report');
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('QA direct scenario search', () => {
  it('matches partial titles and stable IDs without case sensitivity and resets on an empty query', () => {
    const scenarios = [
      { ...COLD_STORAGE, id: 'coldStorage', title: 'Cold Storage' },
      { ...COLD_STORAGE, id: 'clockLocalTime', title: 'The Clock That Kept Local Time' },
    ];

    expect(filterQaScenarios(scenarios, 'CLOCK')).toEqual([scenarios[1]]);
    expect(filterQaScenarios(scenarios, 'localti')).toEqual([scenarios[1]]);
    expect(filterQaScenarios(scenarios, 'coldS')).toEqual([scenarios[0]]);
    expect(filterQaScenarios(scenarios, 'missing')).toEqual([]);
    expect(filterQaScenarios(scenarios, '  ')).toEqual(scenarios);
  });

  it('renders an accessible, QA-only search with live count and an empty state', () => {
    const character = newCharacter();
    const state = { version: 1 as const, bank: [], character, run: null };
    const scenarios = [{ ...COLD_STORAGE, id: 'coldStorage', title: 'Cold Storage' }];
    const markup = renderQaPanel(true, state, scenarios, {});

    expect(markup).toContain('aria-label="Direct scenario picker"');
    expect(markup).toContain('for="qa-scenario-search"');
    expect(markup).toContain('data-qa-scenario-count aria-live="polite">1 of 1');
    expect(markup).toContain('data-qa-search-empty hidden>No scenarios match that search.');
    expect(markup).toContain('data-qa-picker-entry');
    expect(renderQaPanel(false, state, scenarios, {})).not.toContain('qa-scenario-search');
  });
});
