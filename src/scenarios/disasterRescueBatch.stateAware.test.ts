import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import type { SaveData, Scenario } from '../types';
import { THE_CROWD_BREAKS, THE_ROOF_COMES_IN } from './disasterRescueBatch';

function fresh(scenario: Scenario = THE_CROWD_BREAKS): SaveData {
  const character = newCharacter('State Tester');
  return { version: 1, bank: [], character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, id: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function finishAfterOpeningGate(): SaveData {
  let state = fresh();
  state = act(state, THE_CROWD_BREAKS, 'openWestGate');
  state = act(state, THE_CROWD_BREAKS, 'gateTellTruth');
  state = act(state, THE_CROWD_BREAKS, 'crowdReport');
  return state;
}

function finishAfterHelpingChild(): SaveData {
  let state = fresh();
  state = act(state, THE_CROWD_BREAKS, 'liftChild', 0);
  state = act(state, THE_CROWD_BREAKS, 'childClearTruth');
  state = act(state, THE_CROWD_BREAKS, 'crowdReport');
  return state;
}

describe('state-aware shared aftermath narration', () => {
  it('does not claim unidentified injuries were taken to first aid when the child was not reached', () => {
    const state = finishAfterOpeningGate();
    expect(state.run?.sceneId).toBe('crowdEnd');
    const text = THE_CROWD_BREAKS.scenes.crowdEnd.text;
    expect(text).toContain('first-aid tent remains open for anyone hurt');
    expect(text).not.toMatch(/the injured are taken/i);
  });

  it('keeps the same aftermath truthful after the child is reached and has a scraped knee', () => {
    const state = finishAfterHelpingChild();
    expect(state.run?.sceneId).toBe('crowdEnd');
    const text = THE_CROWD_BREAKS.scenes.crowdEnd.text;
    expect(text).toContain('first-aid tent remains open for anyone hurt');
    expect(text).not.toMatch(/the injured are taken/i);
  });

  it('does not presume anyone was rescued when the roof crew takes over without a located person', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'leaveHall');
    state = act(state, THE_ROOF_COMES_IN, 'roofGiveAccount');
    expect(state.run?.sceneId).toBe('roofAftermath');
    const text = THE_ROOF_COMES_IN.scenes.roofAftermath.text;
    expect(text).toContain('Anyone brought out is taken to the inn');
    expect(text).not.toMatch(/the rescued people are taken/i);
  });

  it('acknowledges the inn check without overclaiming after a direct rescue', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'callPlatform');
    state = act(state, THE_ROOF_COMES_IN, 'shiftBench', 0);
    state = act(state, THE_ROOF_COMES_IN, 'roofFinalCount');
    expect(state.run?.sceneId).toBe('roofAftermath');
    expect(THE_ROOF_COMES_IN.scenes.roofAftermath.text).toContain('Anyone brought out is taken to the inn');
  });
});
