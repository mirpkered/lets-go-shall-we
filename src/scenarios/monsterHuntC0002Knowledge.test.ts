import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import type { SaveData, Scenario } from '../types';
import { THE_RIVER_DEVIL, THE_THING_AT_BLACK_CREEK } from './monsterHuntFirst';
import { THE_MILLERS_BEAST, THE_THING_BENEATH_THE_ICE } from './monsterHuntSecond';

function fresh(scenario: Scenario): SaveData {
  const character = newCharacter('Route Proof Tester');
  return { version: 1, bank: [], character, run: startRun(character, scenario, () => 0) };
}

function take(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

describe('CRA-C0002 route-proven Knowledge', () => {
  it('waits for the bear sighting before recording the Black Creek explanation', () => {
    let asked = take(fresh(THE_THING_AT_BLACK_CREEK), THE_THING_AT_BLACK_CREEK, 'askWeirKeeper');
    expect(asked.character?.knowledge).not.toContain('At Black Creek, an injured bear fishes at the weir after dusk; its damaged paw makes the tracks look almost human.');
    asked = take(asked, THE_THING_AT_BLACK_CREEK, 'returnHome');
    expect(asked.character?.knowledge).toHaveLength(0);

    let witnessed = take(fresh(THE_THING_AT_BLACK_CREEK), THE_THING_AT_BLACK_CREEK, 'followBank');
    witnessed = take(witnessed, THE_THING_AT_BLACK_CREEK, 'waitAtDistance');
    witnessed = take(witnessed, THE_THING_AT_BLACK_CREEK, 'backAwayBear');
    expect(witnessed.character?.knowledge).toContain('At Black Creek, an injured bear fishes at the weir after dusk; its damaged paw makes the tracks look almost human.');
  });

  it('records the River Devil cause only after probing identifies the log', () => {
    let watched = take(fresh(THE_RIVER_DEVIL), THE_RIVER_DEVIL, 'inspectWater');
    expect(watched.character?.knowledge).not.toContain('Small boats were struck by a submerged log caught beneath the eddy at the river bend.');
    expect(THE_RIVER_DEVIL.scenes.riverCurrent.text).toMatch(/too low to see below the dark water/i);

    watched = take(watched, THE_RIVER_DEVIL, 'probeWithPole');
    expect(watched.character?.knowledge).toContain('Small boats were struck by a submerged log caught beneath the eddy at the river bend.');
    expect(watched.run?.sceneId).toBe('riverEvidence');
  });

  it('requires wheel-stopped proof for the badger Knowledge, including after save serialization', () => {
    let observed = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'watchOneTurn');
    expect(observed.run?.flags).not.toContain('millWheelStopped');
    observed = take(observed, THE_MILLERS_BEAST, 'openCulvertWithoutStoppingWheel');
    expect(observed.character?.knowledge).not.toContain('A badger nested behind the mill chute and used the culvert; stopping the wheel let it leave safely.');

    let stopped = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'stopWheel');
    expect(stopped.run?.flags).toContain('millWheelStopped');
    stopped = JSON.parse(JSON.stringify(stopped)) as SaveData;
    stopped = take(stopped, THE_MILLERS_BEAST, 'openCulvert');
    expect(stopped.character?.knowledge).toContain('A badger nested behind the mill chute and used the culvert; stopping the wheel let it leave safely.');
  });

  it('does not claim sound-response Knowledge on a direct retreat to the bank', () => {
    let retreated = take(fresh(THE_THING_BENEATH_THE_ICE), THE_THING_BENEATH_THE_ICE, 'backToNearBank');
    retreated = take(retreated, THE_THING_BENEATH_THE_ICE, 'waitForOthers');
    expect(retreated.character?.knowledge).not.toContain('A creature beneath river ice followed sharp sounds and turned away when the traveler moved quietly.');
    expect(THE_THING_BENEATH_THE_ICE.scenes.iceAfter.text).not.toMatch(/range and response to sound are now known/i);

    let tested = take(fresh(THE_THING_BENEATH_THE_ICE), THE_THING_BENEATH_THE_ICE, 'lieStill');
    tested = take(tested, THE_THING_BENEATH_THE_ICE, 'dropBuckle');
    expect(tested.character?.knowledge).toContain('A creature beneath river ice followed sharp sounds and turned away when the traveler moved quietly.');
  });
});
