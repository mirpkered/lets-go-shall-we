import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from './engine';
import { EMPTY_SAVE } from './storage';
import { DEAD_MANS_HAND } from './scenarios/deadMansHand';
import { THE_EMPTY_CRADLE } from './scenarios/theEmptyCradle';
import { THE_LAST_ROOM } from './scenarios/theLastRoom';
import { ONE_MORE_ROUND } from './scenarios/oneMoreRound';
import { WHATS_MINE } from './scenarios/whatsMine';
import type { SaveData, Scenario } from './types';

function begin(scenario: Scenario): SaveData {
  const character = newCharacter('Outcome Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, () => 0);
}

describe('terminal classification and progression', () => {
  it.each([
    { scenario: WHATS_MINE, route: [['mineRequest', 'refuseSearch']], ending: 'refusalEnding' },
    { scenario: THE_EMPTY_CRADLE, route: [['searchAlarm', 'continuePastAlderbrook']], ending: 'refusalEnding' },
    { scenario: THE_LAST_ROOM, route: [['arrival', 'leaveInn']], ending: 'walkAwayAtArrival' },
    { scenario: DEAD_MANS_HAND, route: [['saloonArrival', 'leaveAtArrival']], ending: 'walkAwayAtArrival' },
    { scenario: ONE_MORE_ROUND, route: [['tavernArrival', 'leaveAtArrival']], ending: 'walkAwayAtArrival' },
  ])('gives an unengaged refusal only quick-exit credit in $scenario.title', ({ scenario, route, ending }) => {
    let state = begin(scenario);
    for (const [sceneId, choiceId] of route) state = act(state, scenario, sceneId, choiceId);
    expect(state.run?.sceneId).toBe(ending);
    expect(state.run?.status).toBe('success');
    expect(state.run?.completionQualification).toBe('nonSubstantive');
    expect(state.character?.adventuresCompleted).toBe(0);
    expect(state.character?.quickExitCreditRemainder).toBe(1);
  });

  it('keeps later walk-away outcomes substantive after the Traveler meaningfully engaged', () => {
    expect(THE_LAST_ROOM.scenes.walkAwayEnding.completionQualification).toBeUndefined();
    expect(DEAD_MANS_HAND.scenes.walkAwayEnding.completionQualification).toBeUndefined();
    expect(ONE_MORE_ROUND.scenes.walkAwayEnding.completionQualification).toBeUndefined();
  });

  it('keeps a substantive partial rescue as a completed Adventure while preserving its unresolved objective', () => {
    const scenario = WHATS_MINE;
    const ending = scenario.scenes.partialAidEnding;
    expect(ending.ending).toBe('success');
    expect(ending.completionQualification).toBeUndefined();
    expect(ending.text).toContain('stabilizes his injuries');
    expect(ending.text).toContain('extraction remains unfinished');

    const state = begin(scenario);
    state.run!.sceneId = 'helpDelayed';
    const failedWinch = scenario.scenes.helpDelayed.choices.find(({ id }) => id === 'rigSurfaceWinch')!;
    const partial = choose(state, scenario, failedWinch, () => 0.999999);
    expect(partial.run?.sceneId).toBe('partialAidEnding');
    expect(partial.run?.status).toBe('success');
    expect(partial.character?.adventuresCompleted).toBe(1);
  });
});
