import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { SCENARIOS } from './index';
import { ONE_MORE_ROUND } from './oneMoreRound';
import { LAST_LIGHT_AT_MILLERS_CROSSING } from './lastLightAtMillersCrossing';
import { SILENT_NIGHT } from './silentNight';
import { OCCULT_INVESTIGATION_ADVENTURES } from './occultInvestigationBatch';
import type { SaveData, Scenario } from '../types';

function stateAt(scenario: Scenario, sceneId: string, flags: string[] = [], carriedItem?: string): SaveData {
  const character = newCharacter('Choice Tester');
  if (carriedItem) character.carriedItem = carriedItem;
  const state: SaveData = { version: 1, bank: [], character, run: startRun(character, scenario, () => 0) };
  state.run!.sceneId = sceneId;
  state.run!.flags = [...flags];
  return state;
}

function take(scenario: Scenario, state: SaveData, choiceId: string): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.title}.${scene.id} offers ${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, () => 0);
}

function endingText(scenario: Scenario, state: SaveData): string {
  return sceneText(scenario.scenes[state.run!.sceneId], state);
}

describe('final-choice consequence audit', () => {
  it('distinguishes requesting separation from giving the constable an account', () => {
    const separate = take(ONE_MORE_ROUND, stateAt(ONE_MORE_ROUND, 'constableArrives'), 'acceptConstableSeparation');
    const report = take(ONE_MORE_ROUND, stateAt(ONE_MORE_ROUND, 'constableArrives'), 'makeStatementWithoutEvidence');
    expect(separate.run?.sceneId).toBe('authorityEnding');
    expect(report.run?.sceneId).toBe('authorityEnding');
    expect(separate.character?.historyFlags).toContain('asked_constable_to_separate_guests');
    expect(report.character?.historyFlags).toContain('gave_account_without_requesting_separation');
    expect(endingText(ONE_MORE_ROUND, separate)).toContain('You ask the constable to keep Sella and Rafe apart');
    expect(endingText(ONE_MORE_ROUND, report)).toContain('You give the constable your account');
  });

  it('distinguishes staying while rescued travelers settle from leaving them in farm care', () => {
    const stay = take(LAST_LIGHT_AT_MILLERS_CROSSING, stateAt(LAST_LIGHT_AT_MILLERS_CROSSING, 'maraAtFarm', ['survivorEscorted']), 'giveThemSpaceAtFarm');
    const leave = take(LAST_LIGHT_AT_MILLERS_CROSSING, stateAt(LAST_LIGHT_AT_MILLERS_CROSSING, 'maraAtFarm', ['survivorEscorted']), 'leaveMaraSafeForMorning');
    expect(stay.character?.historyFlags).toContain('stayed_while_travelers_settled_at_farm');
    expect(leave.character?.historyFlags).toContain('left_travelers_in_farm_care');
    expect(endingText(LAST_LIGHT_AT_MILLERS_CROSSING, stay)).toContain('You stay until the family has them settled');
    expect(endingText(LAST_LIGHT_AT_MILLERS_CROSSING, leave)).toContain('You leave them in the family’s care');
  });

  it('preserves the distinction between witnessing and delegating an inn dispute', () => {
    const witness = take(SILENT_NIGHT, stateAt(SILENT_NIGHT, 'innkeeperArrives'), 'stayAsWitness');
    const delegate = take(SILENT_NIGHT, stateAt(SILENT_NIGHT, 'innkeeperArrives'), 'letInnkeeperHandle');
    expect(witness.character?.historyFlags).toContain('witnessed_innkeeper_separate_guests');
    expect(delegate.character?.historyFlags).toContain('left_innkeeper_to_handle_dispute');
    expect(endingText(SILENT_NIGHT, witness)).toContain('You stay in the lit doorway');
    expect(endingText(SILENT_NIGHT, delegate)).not.toContain('You stay in the lit doorway');
  });

  it('reflects whether the Traveler reports the false deputy or accepts the smith’s escort', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'the-false-deputy')!;
    const report = take(scenario, stateAt(scenario, 'verified'), 'verifyRecord');
    const escorted = take(scenario, stateAt(scenario, 'verified'), 'verifyFollow');
    expect(report.character?.historyFlags).toContain('gave_description_of_false_deputy');
    expect(escorted.character?.historyFlags).toContain('took_smith_escort_past_false_deputy');
    expect(endingText(scenario, report)).toContain('The real deputy receives a witness account and a description');
    expect(endingText(scenario, escorted)).toContain('you leave without giving your own description');
  });

  it('records the different physical dispositions of the Bone Box contents', () => {
    const scenario = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'the-bone-box')!;
    const burn = take(scenario, stateAt(scenario, 'boneBoxOpen'), 'burnBoxLining');
    const keepMap = take(scenario, stateAt(scenario, 'boneBoxOpen'), 'takeMapOnly');
    const leave = take(scenario, stateAt(scenario, 'boneBoxOpen'), 'returnBoxBroker');
    expect(endingText(scenario, burn)).toContain('The lining and folded map burn together');
    expect(endingText(scenario, keepMap)).toContain('You keep the folded quarry map');
    expect(endingText(scenario, leave)).toContain('The broker locks the box in an iron drawer');
    expect(burn.character?.historyFlags).toContain('burned_bone_box_lining_and_map');
    expect(keepMap.character?.historyFlags).toContain('kept_map_from_bone_box');
  });

  it('does not claim the hatch was sealed when the Traveler leaves the quiet room', () => {
    const scenario = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'the-quiet-room')!;
    const sealed = take(scenario, stateAt(scenario, 'quietRoomNight'), 'sealHatch');
    const left = take(scenario, stateAt(scenario, 'quietRoomNight'), 'sleepElsewhere');
    expect(sealed.run?.sceneId).toBe('quietRoomAfter');
    expect(endingText(scenario, sealed)).toContain('the innkeeper boards the hatch');
    expect(left.run?.sceneId).toBe('quietRoomLeft');
    expect(endingText(scenario, left)).toContain('without asking the innkeeper to board the hatch');
  });

  it('records whether people or cargo were handled first in the warehouse fire response', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'the-silent-warehouse-shift')!;
    const cargoFirst = take(scenario, stateAt(scenario, 'apron'), 'water');
    const peopleFirst = take(scenario, stateAt(scenario, 'apron'), 'people');
    expect(cargoFirst.character?.historyFlags).toContain('moved_warehouse_crates_before_fetching_water');
    expect(peopleFirst.character?.historyFlags).toContain('cleared_warehouse_workers_before_moving_crates');
    expect(endingText(scenario, cargoFirst)).toContain('move the sealed oil crates away');
    expect(endingText(scenario, peopleFirst)).toContain('get the watchman and clerk clear');
  });

  it('acknowledges blanket warming versus handing the swimmer’s aftercare to others', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'the-blue-hole')!;
    const warm = take(scenario, stateAt(scenario, 'bothReachBank', [], 'woolTravelBlanket'), 'warmAfterRescue');
    const delegate = take(scenario, stateAt(scenario, 'bothReachBank'), 'letOthersCare');
    expect(endingText(scenario, warm)).toContain('You wrap ');
    expect(endingText(scenario, warm)).toContain('in your wool blanket');
    expect(endingText(scenario, delegate)).toContain('You step back');
    expect(warm.character?.historyFlags).toContain('warmed_swimmer_with_blanket');
    expect(delegate.character?.historyFlags).toContain('left_swimmer_aftercare_to_others');
  });

  it('does not claim the board was inspected on routes that only snuffed the candle or waited outside', () => {
    const scenario = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'last-candle-in-the-house')!;
    const opened = take(scenario, stateAt(scenario, 'lastCandleRoom'), 'liftBoardCandle');
    const closed = take(scenario, stateAt(scenario, 'lastCandleRoom'), 'snuffLastCandle');
    const waited = take(scenario, stateAt(scenario, 'lastCandleHouse'), 'leaveHouseCandle');
    const candlePassage = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'candle-that-will-not-go-out')!;
    const doused = take(candlePassage, stateAt(candlePassage, 'candleWax'), 'douseBothWicks');
    const left = take(candlePassage, stateAt(candlePassage, 'relightingCandle'), 'leaveCandle');
    expect(endingText(scenario, opened)).toContain('you lift the board and find a shallow space');
    expect(endingText(scenario, closed)).toContain('without lifting the loose board');
    expect(endingText(scenario, closed)).not.toContain('find a shallow space');
    expect(endingText(scenario, waited)).toContain('without entering the room');
    expect(endingText(scenario, waited)).not.toContain('find a shallow space');
    expect(endingText(candlePassage, doused)).toContain('douse both wicks without opening the floor');
    expect(endingText(candlePassage, left)).toContain('leave before the candle relights in another room');
  });

  it('keeps the goat mystery unresolved when the Traveler declines to test it and reflects the evidence route chosen', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'the-goat-wouldnt-stay-dead')!;
    const decline = take(scenario, stateAt(scenario, 'goatMarks'), 'stopInquiry');
    const tally = take(scenario, stateAt(scenario, 'goatLedger'), 'showTally');
    const neighbor = take(scenario, stateAt(scenario, 'goatLedger'), 'askNeighbor');
    const closeGrave = take(scenario, stateAt(scenario, 'goatBurial'), 'closeGrave');
    const leaveGrave = take(scenario, stateAt(scenario, 'goatBurial'), 'leaveGrave');
    expect(endingText(scenario, decline)).toContain('do not settle which animal was buried');
    expect(endingText(scenario, tally)).toContain('show the stable book');
    expect(endingText(scenario, neighbor)).toContain('neighbor recalls the loose gray goat');
    expect(endingText(scenario, closeGrave)).toContain('You close the shallow grave');
    expect(endingText(scenario, leaveGrave)).toContain('You leave the grave for the farmer to close');
  });

  it('acknowledges whether the Traveler warned the approaching wagoner', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'three-men-at-the-water-trough')!;
    const warned = take(scenario, stateAt(scenario, 'retreat'), 'retreatTellWagon');
    const left = take(scenario, stateAt(scenario, 'retreat'), 'retreatGo');
    expect(endingText(scenario, warned)).toContain('You warn the approaching wagoner');
    expect(endingText(scenario, left)).toContain('without warning the approaching wagoner');
  });

  it('distinguishes closing, entering, and leaving the candle passage', () => {
    const candle = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'candle-that-will-not-go-out')!;
    const seal = take(candle, stateAt(candle, 'candleSeam'), 'sealCandlePassage');
    const follow = take(candle, stateAt(candle, 'candleSeam'), 'followCandlePassage');
    expect(endingText(candle, seal)).toContain('without entering the gas-marked passage');
    expect(endingText(candle, follow)).toContain('follow the passage only as far as the soot-dark turn');

    const charms = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'hanging-charms')!;
    const enter = take(charms, stateAt(charms, 'charmsEmptyDoor'), 'enterCottage');
    const closed = take(charms, stateAt(charms, 'charmsEmptyDoor'), 'leaveCottageCharms');
    expect(endingText(charms, enter)).toContain('you enter the empty cottage');
    expect(endingText(charms, closed)).toContain('leave the cottage shut');

    const doorway = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'doorway-with-no-room')!;
    const opened = take(doorway, stateAt(doorway, 'doorInside'), 'openSecondDoor');
    const retreated = take(doorway, stateAt(doorway, 'doorInside'), 'turnBackDoor');
    expect(endingText(doorway, opened)).toContain('open the far door into the bedroom');
    expect(endingText(doorway, retreated)).toContain('follow the chalk marks back');
  });
});
