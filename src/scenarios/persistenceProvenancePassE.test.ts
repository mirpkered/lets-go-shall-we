import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';

const scenario = (id: string): Scenario => {
  const found = SCENARIOS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing scenario ${id}`);
  return found;
};

const begin = (adventure: Scenario, money = 5, item?: string): SaveData => {
  const character = newCharacter('Persistence Tester');
  character.money = money;
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, adventure, () => 0) };
};

const act = (state: SaveData, adventure: Scenario, id: string): SaveData => {
  const scene = adventure.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${adventure.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${adventure.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, adventure, choice!, () => 0);
};

describe('Pass E persistence and provenance accuracy', () => {
  it('keeps courier delay/refusal distinct and only releases Gear after a completed handoff', () => {
    const courier = scenario('the-wire-that-sang-twice');
    const refusal = act(begin(courier), courier, 'declineDelivery');
    expect(refusal.character?.historyFlags).toContain('courier_declined_delivery');
    expect(refusal.character?.historyFlags).not.toContain('courier_sent_unconfirmed_wire');
    expect(meets(courier.scenes.settle.choices.find(({ id }) => id === 'takeGear')?.requirements, refusal)).toBe(false);

    let delayed = act(begin(courier), courier, 'acceptDelivery');
    delayed = act(delayed, courier, 'verifyOutside');
    delayed = act(delayed, courier, 'holdOrReturn');
    delayed = act(delayed, courier, 'settleDelayed');
    expect(delayed.character?.historyFlags).toContain('courier_delayed_or_returned_message');
    expect(delayed.character?.historyFlags).not.toContain('courier_sent_unconfirmed_wire');
    expect(meets(courier.scenes.settle.choices.find(({ id }) => id === 'takeGear')?.requirements, delayed)).toBe(false);

    let completed = act(begin(courier), courier, 'acceptDelivery');
    completed = act(completed, courier, 'verifyOutside');
    completed = act(completed, courier, 'deliverAsKnown');
    expect(completed.run?.flags).toContain('courier_completed_handoff');
    expect(meets(courier.scenes.settle.choices.find(({ id }) => id === 'takeGear')?.requirements, completed)).toBe(true);
  });

  it('does not record the original deed as recovered when only the toy was taken', () => {
    const house = scenario('the-house-under-the-hill');
    let state = begin(house);
    state = act(state, house, 'enterHouse');
    state = act(state, house, 'upperToy');
    state = act(state, house, 'paperReturn');
    expect(state.character?.historyFlags).not.toContain('recovered a family deed fragment from a landslide-exposed house');
  });

  it('does not claim a Traveler stayed out of the water after they waded in', () => {
    const pool = scenario('the-blue-hole');
    let state = act(begin(pool), pool, 'wadeIn');
    state = act(state, pool, 'returnFromShallows');
    expect(state.character?.historyFlags).not.toContain('chose_not_to_enter_water');
    const dryRoute = act(begin(pool), pool, 'restOnBank');
    expect(dryRoute.character?.historyFlags).toContain('chose_not_to_enter_water');
  });

  it('prevents an armed-robbery history claim when an item is hidden and no cash is carried', () => {
    const robbery = scenario('give-me-whatcha-got');
    const state = begin(robbery, 0, 'travelRope');
    const choices = robbery.scenes.cashTaken.choices;
    const hideItem = choices.find(({ id }) => id === 'hideCarriedItemNoCash')!;
    expect(meets(hideItem.requirements, state)).toBe(true);
    const successFlags = hideItem.chance!.successEffects!.historyFlags ?? [];
    expect(successFlags).not.toContain('lost_property_to_robbers');
    expect(hideItem.chance!.failureEffects?.loseCarriedItem).toBe(true);
  });

  it('requires an agreed shortened course before the ferryman race can award its prize', () => {
    const race = scenario('the-ferryman-and-the-stake');
    let state = act(begin(race), race, 'startRace');
    expect(state.run?.sceneId).toBe('agreement');
    state = act(state, race, 'shortRace');
    expect(state.run?.flags).toContain('shortenedCourseAgreed');
    state = act(state, race, 'freePole');
    state = act(state, race, 'sprint');
    expect(state.run?.sceneId).toBe('win');
    expect(meets(race.scenes.win.choices.find(({ id }) => id === 'acceptPrize')?.requirements, state)).toBe(true);
    const legacyWin = begin(race);
    legacyWin.run!.sceneId = 'win';
    expect(meets(race.scenes.win.choices.find(({ id }) => id === 'acceptPrize')?.requirements, legacyWin)).toBe(false);
    expect(meets(race.scenes.win.choices.find(({ id }) => id === 'closeUnagreedFinish')?.requirements, legacyWin)).toBe(true);
  });

  it('does not describe a no-attack bear retreat as a response after an attack', () => {
    const bear = scenario('bear-with-me');
    expect(bear.scenes.bearHesitates.choices.find(({ id }) => id === 'keepDistance')?.effects?.historyFlags).toContain('chose_not_to_cross_after_bear_encounter');
    expect(bear.scenes.bearHesitates.choices.find(({ id }) => id === 'keepDistance')?.effects?.historyFlags).not.toContain('chose_not_to_cross_after_bear_attack');
    expect(bear.scenes.farBankReaction.choices.find(({ id }) => id === 'leaveAfterRetreat')?.effects?.historyFlags).not.toContain('chose_not_to_cross_after_bear_attack');
  });

  it('keeps route-specific records narrow for medical care, fire rescue, notices, and callbacks', () => {
    const longWay = scenario('the-long-way-home');
    const leaveClinic = Object.values(longWay.scenes).flatMap(({ choices }) => choices).find(({ id }) => id === 'leaveFromClinic')!;
    expect(leaveClinic.effects?.historyFlags).not.toContain('abandoned_injured_stranger');
    expect(leaveClinic.effects?.historyFlags).toContain('uncovered_strangers_truth');

    const highWater = scenario('high-water');
    const lateResident = highWater.scenes.residentLast.choices.find(({ id }) => id === 'carryResidentLateLast')!;
    expect(lateResident.effects?.historyFlags).toContain('prioritized_people_in_flood');
    expect(lateResident.effects?.historyFlags).not.toContain('stayed_too_long_to_save_property');

    const smoke = scenario('smoke-on-the-hill');
    const ropeRescue = Object.values(smoke.scenes).flatMap(({ choices }) => choices).find(({ id }) => id === 'rescueEliRope')!;
    expect(ropeRescue.effects?.historyFlags).not.toContain('entered_burning_structure');
    expect(ropeRescue.effects?.setFlags).not.toContain('entered_burning_structure');

    const burial = scenario('a-place-to-bury-him');
    expect(burial.scenes.chapelYard.choices.find(({ id }) => id === 'writeNotice')?.effects?.historyFlags).toBeUndefined();
    const invitation = scenario('an-invitation-for-someone-else');
    expect(Object.values(invitation.scenes).flatMap(({ choices }) => choices).find(({ id }) => id === 'offerToCarryNote')?.effects?.historyFlags).toBeUndefined();
  });

  it('describes actual recovery, observation, and provenance without route overclaims', () => {
    const mound = scenario('the-barrow-hound');
    const clearGap = mound.scenes.westSlope.choices.find(({ id }) => id === 'clearGap')!;
    expect(clearGap.effects?.historyFlags?.[0]).toBe('helped retrieve a sheep from a settling burial mound');
    expect(clearGap.effects?.historyFlags?.[0]).not.toContain('without crossing');

    const widow = scenario('the-widows-beast');
    expect(widow.scenes.widowYard.choices.find(({ id }) => id === 'declineBeast')?.effects?.historyFlags?.[0]).toContain('unidentified animal');

    const missingStocking = scenario('the-missing-stocking');
    expect(missingStocking.scenes.reunion.choices[0].effects?.historyFlags?.[0]).not.toContain('find Ada’s missing');
    const schoolhouse = scenario('the-slate-on-the-schoolhouse');
    expect(schoolhouse.scenes.settlement.text).toContain('inspecting the roof');
    expect(schoolhouse.scenes.settlement.text).not.toContain('clearing a branch');
    const boundPage = scenario('the-ledger-page-that-dried');
    expect(boundPage.scenes.observe.choices[0].label).toContain('protect the bound ledger');
    const rubbingKit = Object.values(boundPage.scenes).flatMap(({ choices }) => choices).find(({ effects }) => effects?.gainItemProvenance?.charcoalRubbingKit);
    expect(rubbingKit?.effects?.gainItemProvenance?.charcoalRubbingKit).toContain('ledger remains in the inn’s custody');

    const corn = scenario('something-in-the-corn');
    const closeGap = corn.scenes.rowEvidence.choices.find(({ id }) => id === 'keepFamilyAway');
    expect(closeGap?.effects?.historyFlags ?? []).not.toContain('closed_farm_fence_gap_after_identifying_night_visitor');
    expect(corn.scenes.cornContained.text).toContain('shape is not identified');

    const stag = scenario('the-white-stag');
    expect(stag.scenes.stagClaim.choices.find(({ id }) => id === 'declineStagHunt')?.effects?.historyFlags?.[0]).toContain('without proof of harm');
    expect(stag.scenes.stagAtOrchard.choices.find(({ id }) => id === 'leadFarmerAway')?.effects?.historyFlags?.[0]).toContain('identified_white_stag');

    const room = scenario('the-room-with-no-door');
    expect(room.scenes.planAndHall.choices.find(({ id }) => id === 'leaveDoorlessRoom')?.effects?.historyFlags ?? []).not.toContain('entered_room_with_no_door');
  });
});
