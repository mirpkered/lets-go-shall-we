import { describe, expect, it } from 'vitest';
import { newCharacter, sceneText, startRun } from './engine';
import { EMPTY_SAVE } from './storage';
import { NESSA_CONTACT } from './travelerContinuity';
import type { Scenario } from './types';
import { BRIDGE_OUT } from './scenarios/bridgeOut';
import { DEAD_MANS_HAND } from './scenarios/deadMansHand';
import { DOWN_TO_THE_LAST_MATCH } from './scenarios/downToTheLastMatch';
import { HIGH_WATER } from './scenarios/highWater';
import { HUSH_NOW } from './scenarios/hushNow';
import { LAST_LIGHT_AT_MILLERS_CROSSING } from './scenarios/lastLightAtMillersCrossing';
import { THE_LONG_WAY_HOME } from './scenarios/longWayHome';
import { THE_EMPTY_CRADLE } from './scenarios/theEmptyCradle';
import { THE_LAST_ROOM } from './scenarios/theLastRoom';
import { THE_WEIGHT_OF_GOLD } from './scenarios/weightOfGold';
import { SUPPER_AT_THE_INN, THE_FAVOR_RETURNED_IN_FLOUR } from './scenarios/surpriseEverydayBatch';

function state(scenario: Scenario, historyFlags: string[] = [], hasNessa = false) {
  const character = newCharacter('Information Boundary Tester');
  character.historyFlags = historyFlags;
  character.contacts = hasNessa ? [NESSA_CONTACT] : [];
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

describe('NPC and Traveler information boundaries', () => {
  it.each([
    [BRIDGE_OUT, 'arrival', 'rescued_missing_person', 'An earlier rescue comes to mind'],
    [BRIDGE_OUT, 'travelerAssessment', 'refused_mine_rescue', 'You remember turning back'],
    [DEAD_MANS_HAND, 'watchedFirstHand', 'rescued_missing_person', 'An earlier rescue comes to mind'],
    [DEAD_MANS_HAND, 'bartenderOpening', 'rescued_missing_person', 'An earlier rescue comes to mind'],
    [DEAD_MANS_HAND, 'boonePrivate', 'rescued_missing_person', 'Your earlier rescue comes to mind'],
    [DOWN_TO_THE_LAST_MATCH, 'cabinArrival', 'rescued_cold_storage_worker', 'A memory of carrying someone out of danger'],
    [DOWN_TO_THE_LAST_MATCH, 'travelerAtDoor', 'rescued_stranded_traveler', 'You remember helping a stranded traveler'],
    [HIGH_WATER, 'floodArrival', 'organized_flood_evacuation', 'You remember organizing a flood evacuation'],
    [HIGH_WATER, 'floodArrival', 'prioritized_property_in_flood', 'A past flood choice comes to mind'],
    [HUSH_NOW, 'farmhouseArrival', 'rescued_missing_family_member', 'You remember bringing someone home'],
    [HUSH_NOW, 'farmhouseArrival', 'protected_livestock', 'You remember helping frightened livestock'],
    [LAST_LIGHT_AT_MILLERS_CROSSING, 'crossroads', 'searched_for_missing_traveler', 'You have searched for a missing traveler before'],
    [LAST_LIGHT_AT_MILLERS_CROSSING, 'farmhouse', 'escorted_injured_traveler', 'You remember escorting an injured traveler'],
    [THE_LONG_WAY_HOME, 'encounter', 'rescued_missing_person', 'A previous search for a missing person comes to mind'],
    [THE_LONG_WAY_HOME, 'encounter', 'refused_mine_rescue', 'You remember turning away from a rescue before'],
    [THE_EMPTY_CRADLE, 'searchAlarm', 'found_missing_child', 'You remember helping find a missing child before'],
    [THE_LAST_ROOM, 'hostAccount', 'returned_for_help', 'You remember returning for help in an earlier emergency'],
  ] as const)('keeps %s.%s prior History in the Traveler’s perspective', (scenario, sceneId, flag, memoryText) => {
    const returning = state(scenario, [flag]);
    const text = sceneText(scenario.scenes[sceneId], returning);
    expect(text).toContain(memoryText);
    expect(text).not.toMatch(/recognizes you|recognises you|has heard you|heard from .* that you|remembers that you/i);
  });

  it('only lets Nessa recognize the Traveler when the matching Contact exists', () => {
    const freshText = sceneText(SUPPER_AT_THE_INN.scenes.kitchen, state(SUPPER_AT_THE_INN));
    expect(freshText).not.toMatch(/recognizes you|spare apron/i);
    const knownText = sceneText(SUPPER_AT_THE_INN.scenes.kitchen, state(SUPPER_AT_THE_INN, [], true));
    expect(knownText).toContain('Nessa recognizes you from the evening the spare apron ran out');
  });

  it('keeps the flour-bakery story self-contained for a fresh Traveler', () => {
    const fresh = state(THE_FAVOR_RETURNED_IN_FLOUR);
    const allText = Object.values(THE_FAVOR_RETURNED_IN_FLOUR.scenes).map((scene) => sceneText(scene, fresh)).join(' ');
    expect(allText).not.toMatch(/earlier favor|earlier help|earlier day|previously helped|old help/i);
    expect(allText).toContain('one warm loaf');
    expect(allText).toContain('neighbor');
  });

  it('does not let a prior cargo-theft History flag make Ada know what happened in this run', () => {
    const returning = state(THE_WEIGHT_OF_GOLD, ['stole_from_freight_wagon']);
    const historyOnly = sceneText(THE_WEIGHT_OF_GOLD.scenes.guardAccount, returning);
    expect(historyOnly).not.toMatch(/notices that you have been among the cargo|sees the bar you lifted/i);

    returning.run!.flags = ['tookGoldBar'];
    expect(sceneText(THE_WEIGHT_OF_GOLD.scenes.guardAccount, returning)).toContain('Ada sees the bar you lifted from the cargo');
  });
});
