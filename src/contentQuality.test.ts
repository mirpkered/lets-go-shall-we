import { describe, expect, it } from 'vitest';
import { auditContentQuality } from './contentQuality';
import type { Scenario } from './types';
import { SCENARIOS } from './scenarios';

const scenario = (id: string, title: string, firstText: string, label: string, endingText: string): Scenario => ({
  id, title, subtitle: '', startScene: 'start', scenes: {
    start: { id: 'start', title: 'Start', text: firstText, choices: [{ id: 'do', label, next: 'end' }] },
    end: { id: 'end', title: 'Done', text: endingText, ending: 'success', choices: [] },
  },
});

describe('content-substance audit', () => {
  it('does not warn on a short vignette with a clear choice and memorable payoff', () => {
    const short: Scenario = { ...scenario('quiet', 'A Quiet Hour', 'The rain eases.', 'Share the last biscuit', 'You split the biscuit with the road-worn fiddler. They teach you a tune, and you part smiling.'), subtitle: 'A short rest' };
    expect(auditContentQuality([short]).warnings).toEqual([]);
  });

  it('flags one-action routine, procedural, wager, and agreement terminals for review', () => {
    const fixtures = [
      scenario('task', 'A Sorting Job', 'You are paid for baggage sorting.', 'Sort the baggage', 'You finish the work.'),
      scenario('report', 'A Statement', 'A witness is asked to report what happened.', 'Report what you saw', 'The matter is settled.'),
      scenario('wager', 'Cards', 'A friendly card game for one coin.', 'Bet one coin', 'You lose the hand and leave.'),
      scenario('agreement', 'A Dispute', 'Two tenants disagree over a repair cost.', 'Suggest a compromise', 'They agree and thank you.'),
    ];
    const report = auditContentQuality(fixtures);
    expect(report.scenarioCount).toBe(4);
    expect(report.routeCountReviewed).toBe(4);
    expect(report.warningCounts.ONE_WAGER_TERMINAL).toBeGreaterThan(0);
    expect(report.warningCounts.AGREEMENT_TERMINAL).toBeGreaterThan(0);
    expect(report.warningCounts.PROCEDURAL_TERMINAL).toBeGreaterThan(0);
    expect(report.warningCounts.ROUTINE_TASK_TERMINAL).toBeGreaterThan(0);
    expect(report.warnings.every((entry) => entry.evidence && entry.suggestion)).toBe(true);
  });

  it('recognizes a work-performance result and a witness scene that changes the next step', () => {
    const strongWork = scenario('work', 'A Shift', 'The crew is working.', 'Finish the assigned row', 'You bind four rows before the rain. The foreman pays the agreed wage.');
    const strongWitness = scenario('witness', 'A Witness', 'You saw the wheel strike a stone.', 'State only what you saw', 'The neighbors agree to inspect the wheel and ask a second witness before deciding.');
    expect(auditContentQuality([strongWork, strongWitness]).warnings.filter(({ code }) => code === 'NO_PERFORMANCE_FEEDBACK' || code === 'NO_VISIBLE_PAYOFF')).toEqual([]);
  });

  it('keeps intentional unresolved endings reviewable rather than treating uncertainty as a hard error', () => {
    const unresolved = scenario('open', 'The Unsettled Claim', 'Two accounts conflict and evidence is incomplete.', 'Keep the box sealed pending a witness', 'The box stays sealed. Neither claimant is cleared, and the dispute remains open until someone who saw the loan can be found.');
    const report = auditContentQuality([unresolved]);
    expect(report.warnings.some(({ code }) => code === 'OBVIOUS_ACTION_TERMINAL')).toBe(false);
  });

  it('reviews the registered library using warning-only heuristics', () => {
    const report = auditContentQuality(SCENARIOS);
    expect(report.scenarioCount).toBe(187);
  });
});
