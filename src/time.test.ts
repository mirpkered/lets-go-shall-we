import { describe, expect, it } from 'vitest';
import { choose, failCharacter, finishSuccess, meets, newCharacter, retireCharacter, sceneText, startAdventure, startRun, timeStatus } from './engine';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';
import { SCENARIOS } from './scenarios';
import { AWW_RATS } from './scenarios/awwRats';
import { LAST_STOP } from './scenarios/lastStop';
import type { SaveData } from './types';

function fresh(scenario = LAST_STOP): SaveData {
  const character = newCharacter('Clock Tester');
  return { version: 1, bank: [], character, run: startRun(character, scenario) };
}

describe('fictional adventure clock', () => {
  it('advances only by the selected action cost, never by wall-clock waiting', () => {
    const state = fresh();
    const studyRoute = LAST_STOP.scenes.stationPlatform.choices.find((choice) => choice.id === 'studyRoute')!;
    state.run!.startedAt -= 86_400_000;
    expect(state.run?.elapsedMinutes).toBe(0);
    const next = choose(state, LAST_STOP, studyRoute);
    expect(next.run?.elapsedMinutes).toBe(4);
    expect(sceneText(LAST_STOP.scenes.platformAfterStudy, next)).toBe(LAST_STOP.scenes.platformAfterStudy.text);
    expect(next.run?.elapsedMinutes).toBe(4);
  });

  it('charges authored costs on failed risky actions and supports no-cost authored actions', () => {
    const state = fresh();
    state.run!.sceneId = 'roofAccess';
    const crossRoof = LAST_STOP.scenes.roofAccess.choices.find((choice) => choice.id === 'crossRoof')!;
    const failed = choose(state, LAST_STOP, crossRoof, () => 0.99);
    expect(failed.run?.sceneId).toBe('roofSlip');
    expect(failed.run?.elapsedMinutes).toBe(8);
    const free = LAST_STOP.scenes.roofSlip.choices.find((choice) => choice.id === 'drop')!;
    expect(choose(failed, LAST_STOP, free, () => 0).run?.elapsedMinutes).toBe(8);
  });

  it('derives scenario-specific phases and supports time requirements at boundaries', () => {
    const state = fresh();
    expect(timeStatus(LAST_STOP, 14).phase?.id).toBe('evening');
    expect(timeStatus(LAST_STOP, 15).phase?.id).toBe('descent');
    expect(timeStatus(LAST_STOP, 30)).toMatchObject({ phase: { id: 'approaching' }, nextThreshold: 45 });
    state.run!.elapsedMinutes = 30;
    expect(meets({ minElapsedMinutes: 30 }, state)).toBe(true);
    expect(meets({ maxElapsedMinutes: 29 }, state)).toBe(false);
    expect(meets({ minElapsedMinutes: 20, maxElapsedMinutes: 30 }, state)).toBe(true);
  });

  it('changes the train emergency narration when the fictional clock crosses its threshold', () => {
    const state = fresh();
    state.run!.sceneId = 'emergencyHub';
    expect(sceneText(LAST_STOP.scenes.emergencyHub, state)).not.toContain('bridge lights are closer');
    state.run!.elapsedMinutes = 30;
    expect(sceneText(LAST_STOP.scenes.emergencyHub, state)).toContain('Blackstone Bridge is closer now');
  });

  it('lets authored gear choices save time without becoming a generic stat', () => {
    const brakeChoices = LAST_STOP.scenes.baggageBrake.choices;
    expect(brakeChoices.find((choice) => choice.id === 'toolRepair')?.timeCost).toBe(4);
    expect(brakeChoices.find((choice) => choice.id === 'forceWheel')?.timeCost).toBe(8);
    expect(ITEMS.pocketToolkit.carryable).toBe(true);
    const trapChoices = AWW_RATS.scenes.trapPlan.choices;
    expect(trapChoices.find((choice) => choice.id === 'toolTrap')?.timeCost).toBeLessThan(trapChoices.find((choice) => choice.id === 'simpleTrap')?.timeCost ?? Infinity);
  });

  it('keeps late time-sensitive scenes actionable when an early opportunity has passed', () => {
    const state = fresh(AWW_RATS);
    state.run!.sceneId = 'grainDecision';
    state.run!.elapsedMinutes = 22;
    expect(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'salvageGrain')?.requirements?.maxElapsedMinutes).toBe(22);
    expect(meets(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'salvageGrain')?.requirements, state)).toBe(true);
    expect(sceneText(AWW_RATS.scenes.grainDecision, state)).toContain('a few sacks still look clean');
    state.run!.elapsedMinutes = 23;
    expect(meets(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'salvageGrain')?.requirements, state)).toBe(false);
    expect(sceneText(AWW_RATS.scenes.grainDecision, state)).toContain('spread from the sill');
    expect(sceneText(AWW_RATS.scenes.grainDecision, state)).not.toContain('a few sacks still look clean');
    state.run!.elapsedMinutes = 35;
    const choices = AWW_RATS.scenes.grainDecision.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.map((choice) => choice.id)).toEqual(['destroyGrain', 'isolateGrain']);
    expect(sceneText(AWW_RATS.scenes.grainDecision, state)).toContain('spread from the sill');
  });

  it('round-trips elapsed time and phase exactly, then clears time at run completion', () => {
    let state = fresh();
    state.run!.elapsedMinutes = 31;
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.elapsedMinutes).toBe(31);
    expect(timeStatus(LAST_STOP, resumed.run!.elapsedMinutes).phase?.label).toBe('Blackstone Ahead');
    const ended = finishSuccess(resumed, null);
    expect(ended.run).toBeNull();
    const restarted = startAdventure(ended, LAST_STOP);
    expect(restarted.run?.elapsedMinutes).toBe(0);
    expect(failCharacter(resumed).run).toBeNull();
    expect(retireCharacter(resumed).run).toBeNull();
  });

  it('exposes exact timing diagnostics in QA only', () => {
    const state = fresh();
    state.run!.elapsedMinutes = 31;
    const normal = renderQaPanel(false, state, SCENARIOS, ITEMS);
    expect(normal).toBe('');
    const qa = renderQaPanel(true, state, SCENARIOS, ITEMS);
    expect(qa).toContain('Elapsed: 31 min');
    expect(qa).toContain('Blackstone Ahead');
    expect(qa).toContain('Next threshold: 45 min');
    expect(qa).toContain('data-qa-set-time');
    expect(qa).toContain('data-qa-reset-time');
  });

  it('uses fictional-time phases when authored and leaves other adventures timeless', () => {
    expect(SCENARIOS).toHaveLength(637);
    for (const scenario of SCENARIOS) {
      if (scenario.timePhases?.length) expect(scenario.timePhases[0].atMinutes).toBe(0);
      if (scenario.timePhases?.length) expect(timeStatus(scenario, 0).phase?.label).toBeTruthy();
      else expect(timeStatus(scenario, 0).phase).toBeNull();
    }
  });
});
