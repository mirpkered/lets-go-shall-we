import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave } from '../storage';
import type { SaveData, Scenario } from '../types';
import { THE_GOAT_THAT_WOULDNT_STAY_DEAD, THE_MILLERS_BEAST, THE_ANTLERED_THING } from './monsterHuntSecond';
import { THE_MAN_EATER_OF_MILLERS_GAP } from './monsterHuntThird';

function fresh(scenario: Scenario): SaveData {
  const character = newCharacter('RC12 Monster Hunt Tester');
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function take(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId} exists`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

describe('RC12 Monster Hunt converged endings', () => {
  it('distinguishes a safely evacuated worker from an unconfirmed worker', () => {
    const foundWorker = take(take(fresh(THE_ANTLERED_THING), THE_ANTLERED_THING, 'callWorker'), THE_ANTLERED_THING, 'callWorkerBack');
    const safelyEvacuated = take(foundWorker, THE_ANTLERED_THING, 'abandonForestRoad');
    const resumed = loadSave({ getItem: () => JSON.stringify(safelyEvacuated) });
    const safeText = sceneText(THE_ANTLERED_THING.scenes.forestEvacuated, resumed);
    expect(safeText).toMatch(/worker reached the road safely/i);
    expect(safeText).not.toMatch(/fate is not confirmed/i);

    const leftAtEntry = take(fresh(THE_ANTLERED_THING), THE_ANTLERED_THING, 'leaveForest');
    const fallback = sceneText(THE_ANTLERED_THING.scenes.forestEvacuated, leftAtEntry);
    expect(fallback).toMatch(/worker’s fate is not confirmed/i);
    expect(fallback).not.toMatch(/reached the road safely/i);
  });

  it('keeps the mill visitor and injury closure truthful to the actual event', () => {
    const watched = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'watchOneTurn');
    expect(sceneText(THE_MILLERS_BEAST.scenes.millVisitor, watched)).not.toMatch(/with the wheel stopped/i);

    const badgerRoute = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'inspectSacks'), THE_MILLERS_BEAST, 'setEmptyCrate');
    const bitten = take(badgerRoute, THE_MILLERS_BEAST, 'cornerBadger', 0.999999);
    expect(bitten.run?.sceneId).toBe('millInjury');
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, bitten)).toMatch(/badger bites through your glove/i);
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, bitten)).not.toMatch(/belt catches your sleeve/i);

    const beltRoute = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'reachBehindBelt', 0.999999);
    expect(beltRoute.run?.sceneId).toBe('millInjury');
    const oldUnqualifiedSave = structuredClone(beltRoute);
    oldUnqualifiedSave.run!.flags = [];
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, oldUnqualifiedSave)).not.toMatch(/badger bites|belt catches/i);
  });

  it('leaves the goat mystery unresolved without claiming unchecked records or repairs', () => {
    const markedGoats = take(fresh(THE_GOAT_THAT_WOULDNT_STAY_DEAD), THE_GOAT_THAT_WOULDNT_STAY_DEAD, 'compareNotches');
    const stopped = take(markedGoats, THE_GOAT_THAT_WOULDNT_STAY_DEAD, 'stopInquiry');
    const text = sceneText(THE_GOAT_THAT_WOULDNT_STAY_DEAD.scenes.goatAfter, stopped);
    expect(text).toMatch(/marked goats/i);
    expect(text).toMatch(/stable book|burial/i);
    expect(text).toMatch(/remain unresolved/i);
    expect(text).not.toMatch(/leave the farmer with the tally/i);
    expect(text).not.toMatch(/gate remains repaired/i);
    expect(text).not.toMatch(/empty grave remains/i);
  });

  it('remembers a direct mountain-lion sighting without claiming its current location is known', () => {
    const sheepMoved = take(fresh(THE_MAN_EATER_OF_MILLERS_GAP), THE_MAN_EATER_OF_MILLERS_GAP, 'moveSheep');
    const sighted = take(sheepMoved, THE_MAN_EATER_OF_MILLERS_GAP, 'watchFromRock');
    const withdrew = take(sighted, THE_MAN_EATER_OF_MILLERS_GAP, 'retreatLion');
    const text = sceneText(THE_MAN_EATER_OF_MILLERS_GAP.scenes.gapAfter, withdrew);
    expect(text).toMatch(/saw the mountain lion watching from the ledge/i);
    expect(text).toMatch(/whereabouts now are unknown/i);
    expect(text).not.toMatch(/cat has not been located/i);

    const legacyFallback = sceneText(THE_MAN_EATER_OF_MILLERS_GAP.scenes.gapAfter, fresh(THE_MAN_EATER_OF_MILLERS_GAP));
    expect(legacyFallback).toMatch(/present whereabouts are uncertain/i);
    expect(legacyFallback).not.toMatch(/never saw|has not been located/i);
  });
});
