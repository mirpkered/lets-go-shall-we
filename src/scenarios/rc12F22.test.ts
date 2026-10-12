import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { THE_BROKEN_WHEEL } from './brokenWheel';
import { DOWN_TO_THE_LAST_MATCH } from './downToTheLastMatch';
import { HUSH_NOW } from './hushNow';
import { TAKING_ON_WATER } from './takingOnWater';
import { THE_EMPTY_CRADLE } from './theEmptyCradle';
import { THE_SOUND_IN_THE_WELL } from './soundInWell';
import { THE_WEIGHT_OF_GOLD } from './weightOfGold';

function at(scenario: Scenario, sceneId: string, flags: string[] = []): SaveData {
  const character = newCharacter('F22 route tester');
  const state: SaveData = { version: 1, bank: [], character, run: startRun(character, scenario, () => 0) };
  state.run!.sceneId = sceneId;
  state.run!.flags = flags;
  return state;
}

describe('RC12 F22 route-state endings', () => {
  it('keeps touched scenario graphs connected', () => {
    for (const scenario of [THE_BROKEN_WHEEL, THE_SOUND_IN_THE_WELL]) {
      expect(findScenarioGraphProblems(scenario), scenario.id).toEqual([]);
    }
  });

  it('keeps Hush Now heifer return proof ahead of stale loose-heifer state', () => {
    const returned = sceneText(HUSH_NOW.scenes.safeEnding, at(HUSH_NOW, 'safeEnding', ['heiferLoose', 'heiferReturned']));
    expect(returned).toMatch(/heifer are back at the farm/i);
    expect(returned).not.toMatch(/heifer ran|not been found/i);
    const noAnimalThread = sceneText(HUSH_NOW.scenes.aftercare, at(HUSH_NOW, 'aftercare', ['scrapeWrapped']));
    expect(noAnimalThread).not.toMatch(/heifer|cattle|loose animal/i);
  });

  it('does not turn a shared stove fire into unproven bread and blanket sharing', () => {
    const state = at(DOWN_TO_THE_LAST_MATCH, 'dawnEnding', ['travelerInside', 'travelerWarmthShared']);
    const text = sceneText(DOWN_TO_THE_LAST_MATCH.scenes.dawnEnding, state);
    expect(text).toMatch(/shared stove fire warmed the room/i);
    expect(text).not.toMatch(/you shared bread and the spare blanket/i);
    const warden = sceneText(DOWN_TO_THE_LAST_MATCH.scenes.dawnEnding, at(DOWN_TO_THE_LAST_MATCH, 'dawnEnding', ['rescuedByWarden']));
    expect(warden).toMatch(/warden’s shelter/i);
    expect(warden).not.toMatch(/morning finds you, Eli, and Marta alive in the cabin/i);
    const wardenOffer = sceneText(DOWN_TO_THE_LAST_MATCH.scenes.rewardOffer, at(DOWN_TO_THE_LAST_MATCH, 'rewardOffer', ['rescuedByWarden']));
    expect(wardenOffer).toMatch(/warden’s shelter/i);
    expect(wardenOffer).not.toMatch(/Marta thanks you|cabin door/i);
  });

  it('does not move Nessa back to the shed threshold after the creek slip', () => {
    const neutral = sceneText(THE_EMPTY_CRADLE.scenes.childOutWithHelp, at(THE_EMPTY_CRADLE, 'childOutWithHelp'));
    expect(neutral).not.toMatch(/hold the door|eases Nessa onto the dry threshold/i);
    const highBank = at(THE_EMPTY_CRADLE, 'childOutWithHelp', ['nessaAlreadyOnHighBank']);
    const resumed = JSON.parse(JSON.stringify(highBank)) as SaveData;
    expect(sceneText(THE_EMPTY_CRADLE.scenes.childOutWithHelp, resumed)).toMatch(/already clear of the shed/i);
    const afterSlip = at(THE_EMPTY_CRADLE, 'creekReturnSlip');
    const wait = THE_EMPTY_CRADLE.scenes.creekReturnSlip.choices.find(({ id }) => id === 'waitForSearchersAfterSlip')!;
    const waited = choose(afterSlip, THE_EMPTY_CRADLE, wait, () => 0);
    expect(waited.run?.flags).toContain('nessaAlreadyOnHighBank');
    expect(sceneText(THE_EMPTY_CRADLE.scenes.childOutWithHelp, waited)).toMatch(/already clear of the shed/i);
  });

  it('keeps Pell’s role and return claims behind local route proof', () => {
    const neutral = sceneText(THE_WEIGHT_OF_GOLD.scenes.shipmentReturned, at(THE_WEIGHT_OF_GOLD, 'shipmentReturned'));
    expect(neutral).not.toMatch(/Pell’s role|Pell’s part|people on the road are safe/i);
    const informed = sceneText(THE_WEIGHT_OF_GOLD.scenes.shipmentReturned, at(THE_WEIGHT_OF_GOLD, 'shipmentReturned', ['pellRoleLearned']));
    expect(informed).toMatch(/Pell’s role is reported plainly/i);
    const withoutPell = sceneText(THE_WEIGHT_OF_GOLD.scenes.shipmentRewardEnding, at(THE_WEIGHT_OF_GOLD, 'shipmentRewardEnding'));
    expect(withoutPell).not.toMatch(/Pell has returned/i);
  });

  it('preserves explicitly discarded cargo without guessing other supply conditions', () => {
    const discarded = sceneText(TAKING_ON_WATER.scenes.rescueEnding, at(TAKING_ON_WATER, 'rescueEnding', ['cargoLightened']));
    expect(discarded).toMatch(/thrown overboard are lost/i);
    expect(discarded).not.toMatch(/ordinary food and cooking gear are soaked/i);
    const legacy = sceneText(TAKING_ON_WATER.scenes.rescueEnding, at(TAKING_ON_WATER, 'rescueEnding'));
    expect(legacy).toMatch(/does not establish the condition/i);
  });

  it('distinguishes leaving after the smith arrives from leaving the wagon unrecovered', () => {
    const smithState = at(THE_BROKEN_WHEEL, 'smithReturns', ['smithSummoned']);
    const leave = THE_BROKEN_WHEEL.scenes.smithReturns.choices.find(({ id }) => id === 'leaveWithThanks')!;
    const afterSmithState = choose(smithState, THE_BROKEN_WHEEL, leave, () => 0);
    const afterSmith = sceneText(THE_BROKEN_WHEEL.scenes.wagonAbandoned, afterSmithState);
    expect(afterSmith).toMatch(/smith remains beside the wagon/i);
    expect(afterSmith).not.toMatch(/owner must arrange recovery/i);
    const earlyLeave = sceneText(THE_BROKEN_WHEEL.scenes.wagonAbandoned, at(THE_BROKEN_WHEEL, 'wagonAbandoned'));
    expect(earlyLeave).toMatch(/owner must arrange recovery/i);
  });

  it('does not say the well worker was hauled up when the rope failure leaves them below', () => {
    const fall = at(THE_SOUND_IN_THE_WELL, 'wellFall');
    const climb = THE_SOUND_IN_THE_WELL.scenes.wellFall.choices.find(({ id }) => id === 'climbFromFall')!;
    expect(meets(climb.requirements, fall)).toBe(true);
    const failedClimb = choose(fall, THE_SOUND_IN_THE_WELL, climb, () => 0.99);
    expect(failedClimb.run?.flags).toContain('workerRemainedBelow');
    const failure = sceneText(THE_SOUND_IN_THE_WELL.scenes.playerDiesWorkerLives, failedClimb);
    expect(failure).toMatch(/rope tears free/i);
    expect(failure).toMatch(/remains below/i);
    expect(failure).not.toMatch(/hauled into the farmyard alive/i);
    const onRope = sceneText(THE_SOUND_IN_THE_WELL.scenes.playerDiesWorkerLives, at(THE_SOUND_IN_THE_WELL, 'playerDiesWorkerLives', ['workerOnRope']));
    expect(onRope).toMatch(/hauled into the farmyard alive/i);
    const legacy = sceneText(THE_SOUND_IN_THE_WELL.scenes.playerDiesWorkerLives, at(THE_SOUND_IN_THE_WELL, 'playerDiesWorkerLives'));
    expect(legacy).toMatch(/route does not establish where/i);
  });
});
