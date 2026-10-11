import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun, meets } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { LOST_PLACES_ADVENTURES } from './lostPlacesBatch';
import { SCENARIOS } from './index';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';

function get(id: string): Scenario {
  const scenario = LOST_PLACES_ADVENTURES.find((entry) => entry.id === id);
  if (!scenario) throw new Error(`Missing Lost Places scenario ${id}`);
  return scenario;
}

function start(scenario: Scenario): SaveData {
  const character = newCharacter('Lost Places Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function text(state: SaveData, scenario: Scenario): string {
  return sceneText(scenario.scenes[state.run!.sceneId], state);
}

describe('Lost Places route-accurate endings', () => {
  it('keeps the Old Survey Stone calf unresolved on the boundary-only route', () => {
    const scenario = get('the-old-survey-stone');
    let state = start(scenario);
    state = act(state, scenario, 'askNeighbors');
    state = act(state, scenario, 'askSurveyCopy');
    state = act(state, scenario, 'surveyShare');
    expect(text(state, scenario)).not.toMatch(/calf is home/i);
    state = act(state, scenario, 'surveyEnd');
    expect(text(state, scenario)).not.toMatch(/calf is returned/i);

    state = start(scenario);
    state = act(state, scenario, 'followLane');
    state = act(state, scenario, 'laneCalf');
    state = act(state, scenario, 'calfReturn');
    expect(text(state, scenario)).toMatch(/calf is home/i);
  });

  it('does not turn the Sealed Mine Office exterior title into private wage findings', () => {
    const scenario = get('the-sealed-mine-office');
    let state = start(scenario);
    state = act(state, scenario, 'lookShutter');
    state = act(state, scenario, 'windowLeave');
    expect(text(state, scenario)).not.toMatch(/wage book|miners transferred|payments made late/i);

    state = start(scenario);
    state = act(state, scenario, 'askOwner');
    state = act(state, scenario, 'acceptKey');
    state = act(state, scenario, 'openDrawer');
    state = act(state, scenario, 'recordShare');
    expect(text(state, scenario)).toMatch(/wage book shows payments made late.*miners transferred/i);
  });

  it('reserves the quarry-use inference for routes that inspect the cave niche', () => {
    const scenario = get('the-cave-with-worked-stone');
    let state = start(scenario);
    state = act(state, scenario, 'inspectCut');
    state = act(state, scenario, 'cutReturn');
    expect(text(state, scenario)).not.toMatch(/drill|quarry crew/i);

    state = start(scenario);
    state = act(state, scenario, 'stepInside');
    state = act(state, scenario, 'chamberNiche');
    state = act(state, scenario, 'nicheRecord');
    expect(text(state, scenario)).toMatch(/broken hand drill.*quarry mark/i);
  });

  it('distinguishes the Lost Payroll office record, intact search, disturbed drain, and unreconciled search', () => {
    const scenario = get('the-lost-payroll');
    let state = start(scenario);
    state = act(state, scenario, 'followCreek');
    state = act(state, scenario, 'sidingStop');
    expect(text(state, scenario)).not.toMatch(/payroll was returned|account paid/i);

    state = start(scenario);
    state = act(state, scenario, 'askRailHand');
    state = act(state, scenario, 'ledgerOffice');
    state = act(state, scenario, 'officeShare');
    expect(text(state, scenario)).toMatch(/duplicate shows the chest was returned.*account paid/i);

    state = start(scenario);
    state = act(state, scenario, 'followCreek');
    state = act(state, scenario, 'sidingTrench');
    state = act(state, scenario, 'trenchSearch', 0);
    expect(text(state, scenario)).toMatch(/drainage channel remained intact/i);

    state = start(scenario);
    state = act(state, scenario, 'followCreek');
    state = act(state, scenario, 'sidingTrench');
    state = act(state, scenario, 'trenchSearch', 0.99);
    state = act(state, scenario, 'slipLeave');
    expect(text(state, scenario)).toMatch(/ballast slid into the drainage cut/i);
  });

  it('keeps Riverboat Cache custody and recovery claims tied to the actual disposition', () => {
    const scenario = get('the-riverboat-cache');
    let state = start(scenario);
    state = act(state, scenario, 'askFerryman');
    state = act(state, scenario, 'claimsOpen');
    expect(text(state, scenario)).toMatch(/without a line/i);
    state = act(state, scenario, 'openLocker');
    state = act(state, scenario, 'contentsKeep');
    expect(text(state, scenario)).toMatch(/leave the ledger and weights with the hull/i);
    state = act(state, scenario, 'riverFinish');
    expect(text(state, scenario)).not.toMatch(/returned ledger corrects/i);

    state = start(scenario);
    state = act(state, scenario, 'checkMark');
    state = act(state, scenario, 'markSecure');
    state = act(state, scenario, 'openLocker');
    state = act(state, scenario, 'contentsLedger');
    expect(text(state, scenario)).toMatch(/receives the ledger as recovered freight/i);
    state = act(state, scenario, 'riverFinish');
    expect(text(state, scenario)).toMatch(/returned ledger corrects a long-missing shipment entry/i);

    state = start(scenario);
    state = act(state, scenario, 'askFerryman');
    state = act(state, scenario, 'claimsOpen');
    state = act(state, scenario, 'openLocker');
    state = act(state, scenario, 'contentsWeights');
    expect(text(state, scenario)).toMatch(/farmer inspects the salvage weights; you leave them beside the wreck/i);
  });

  it('keeps the five audit candidates registered without changing library size', () => {
    expect(SCENARIOS).toHaveLength(861);
    expect(validateScenarioRegistry(LOST_PLACES_ADVENTURES).errors).toEqual([]);
    expect(validateScenarioRegistry(LOST_PLACES_ADVENTURES).warnings).toEqual([]);
  });
});
