import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, newCharacter, sceneText, startRun } from '../engine';
import { THE_INJURED_DOG } from './animalsBatch';
import { COMMUNICATION_ADVENTURES } from './communicationBatch';
import { THE_INJURED_TRAVELER } from './disputesBatch';
import { OCTOBER_AFFINITY_ADVENTURES } from './octoberAffinityBatch';
import { QUESTIONABLE_EMPLOYMENT_ADVENTURES } from './questionableEmploymentBatch';
import { THE_ABANDONED_CAMP } from './survivalExpeditionBatch';
import { THE_SHORTCUT } from './wildernessBatch';
import { OCCULT_INVESTIGATION_ADVENTURES } from './occultInvestigationBatch';
import { SMALL_HUMAN_MOMENT_ADVENTURES } from './smallHumanMomentsBatch';
import { ENTERTAINMENT_ADVENTURES } from './entertainmentBatch';
import type { SaveData, Scenario } from '../types';

function begin(scenario: Scenario): SaveData {
  const character = newCharacter('Playtest traveler');
  return { version: 1, bank: [], character, run: startRun(character, scenario) };
}

function act(state: SaveData, scenario: Scenario, choiceId: string): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Missing ${scenario.id}.${scene.id}.${choiceId}`);
  return choose(state, scenario, choice, () => 0);
}

describe('targeted QA content corrections', () => {
  it('establishes the Headless Rider as local lore without claiming the tale is fully explained', () => {
    const rider = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-headless-rider')!;
    expect(rider.scenes.ridgeRumor.text).toContain('old Headless Rider tale');
    expect(rider.scenes.riderFinish.text).not.toContain('headless rider explained');
    expect(rider.scenes.riderFinish.textVariants?.every(({ text }) => !text.includes('headless rider explained'))).toBe(true);
    let state = begin(rider);
    for (const choice of ['watchRider', 'signalStop', 'offerHelp', 'helpRider', 'riderFinish']) state = act(state, rider, choice);
    expect(state.run?.sceneId).toBe('riderFinish');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('makes The Right Recipient develop beyond recognizing the sender', () => {
    const telegram = COMMUNICATION_ADVENTURES.find(({ id }) => id === 'the-telegram')!;
    let state = begin(telegram);
    state = act(state, telegram, 'take-ask');
    state = act(state, telegram, 'ask-askGuests');
    expect(state.run?.sceneId).toBe('ask-askGuests');
    expect(telegram.scenes['ask-askGuests'].text).toContain('The other knows a family');
    state = act(state, telegram, 'hearSecondGuest');
    expect(state.run?.sceneId).toBe('recipientSecondAccount');
    state = act(state, telegram, 'verifyAfterAccount');
    state = act(state, telegram, 'deliverVerified');
    expect(state.run?.sceneId).toBe('recipientDelivered');
    expect(state.run?.status).toBe('success');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('shows the consequence of comparing the mule papers before completion', () => {
    const mule = QUESTIONABLE_EMPLOYMENT_ADVENTURES.find(({ id }) => id === 'the-mule-is-mine')!;
    let state = begin(mule);
    state = act(state, mule, 'take-paper');
    state = act(state, mule, 'paper-copy');
    expect(state.run?.sceneId).toBe('paper-copy');
    state = act(state, mule, 'bringPapersTogether');
    expect(mule.scenes.muleDatesCompared.text).toContain('The payment note predates the pledge');
    state = act(state, mule, 'confirmMuleCare');
    expect(state.run?.sceneId).toBe('muleCareAgreed');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('lets the traveler contribute an observation after the dog handler arrives', () => {
    let state = begin(THE_INJURED_DOG);
    state = act(state, THE_INJURED_DOG, 'lookForDogOwner');
    state = act(state, THE_INJURED_DOG, 'waitForDogHandler');
    expect(state.run?.sceneId).toBe('dogHandlerArrives');
    state = act(state, THE_INJURED_DOG, 'describeDogPaw');
    expect(state.run?.sceneId).toBe('dogHandlerObserved');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('shows the stable outcome after an innkeeper sends for help', () => {
    let state = begin(THE_INJURED_TRAVELER);
    state = act(state, THE_INJURED_TRAVELER, 'sendForInnkeeper');
    state = act(state, THE_INJURED_TRAVELER, 'stayForHealer');
    expect(state.run?.sceneId).toBe('localHelp');
    expect(THE_INJURED_TRAVELER.scenes.localHelp.text).toContain('settles the traveler on a bench inside');
    state = act(state, THE_INJURED_TRAVELER, 'stayForMessenger');
    expect(state.run?.sceneId).toBe('localHelpStayed');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('counts An Earned Account through Knowledge and the carving contest through its one-coin reward', () => {
    const witch = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-witch-at-millers-ford')!;
    let witchState = begin(witch);
    for (const choice of ['speakHealer', 'askForEvidence', 'showRoot', 'witchReward']) witchState = act(witchState, witch, choice);
    expect(witchState.run?.sceneId).toBe('witchReward');
    expect(witchState.character?.knowledge).toContain('Miller’s Ford healer’s willow-bark tea must be made only from sound bark with clean water.');
    expect(witchState.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(witchState, null).character?.adventuresCompleted).toBe(1);

    const contest = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'jack-o-lantern-contest')!;
    let contestState = begin(contest);
    for (const choice of ['enterCarve', 'simpleFace', 'shareAfterContest', 'contestComplete']) contestState = act(contestState, contest, choice);
    expect(contestState.character?.money).toBe(1);
    expect(finishSuccess(contestState, null).character?.adventuresCompleted).toBe(1);
  });

  it('clarifies the wearable harvest mask and records the injury-specific aftermath', () => {
    const mask = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-harvest-mask')!;
    let state = begin(mask);
    state = act(state, mask, 'inspectCarving');
    state = act(state, mask, 'testBriefly');
    state = act(state, mask, 'keepMaskOn');
    state = act(state, mask, 'recoverMask');
    expect(state.run?.flags).toContain('maskFall');
    state = act(state, mask, 'maskFinish');
    expect(mask.scenes.maskFinish.textVariants?.[0].text).toContain('leaves you bruised');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('keeps the Halloween choices grounded in an established role and contest custom', () => {
    const dare = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-halloween-dare')!;
    expect(dare.scenes.dareInvitation.text).toContain('you pass the abandoned toll house');
    expect(dare.scenes.dareInvitation.text).toContain('cracked stone lintel');
    expect(dare.scenes.dareDeclined.completionQualification).toBe('nonSubstantive');
    const contest = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'jack-o-lantern-contest')!;
    expect(contest.scenes.contestYard.text).toContain('Each Halloween, the village gathers');
    expect(contest.scenes.contestYard.text).not.toContain('fictional');
    expect(contest.scenes.contestDeclined.completionQualification).toBe('nonSubstantive');
  });

  it('does not turn the stream tracks into a confirmed identity in A Camper Returns', () => {
    const checked = begin(THE_ABANDONED_CAMP);
    let state = checked;
    for (const choice of ['inspectCamp', 'followStreamTracks', 'followStreamCamper', 'tellCamperTracks']) state = act(state, THE_ABANDONED_CAMP, choice);
    expect(state.run?.sceneId).toBe('campReunion');
    expect(sceneText(THE_ABANDONED_CAMP.scenes.campReunion, state)).toContain('could not prove whose they were');
    expect(sceneText(THE_ABANDONED_CAMP.scenes.campReunion, state)).not.toContain('thanks you for checking the stream track');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(state.character?.scenarioPlayCounts?.[THE_ABANDONED_CAMP.id]).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('counts The Children’s Court after one clearly described replay procedure', () => {
    const court = SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!;
    let state = begin(court);
    for (const choice of ['take-listen', 'listen-replay', 'replayMarked', 'takeReplayShot']) state = act(state, court, choice);
    expect(state.run?.sceneId).toBe('clearShot');
    expect(court.scenes.replaySetup.text).toContain('each child will take one shot');
    expect(court.scenes.clearShot.text).toContain('Both children have now taken exactly one shot');
    state = act(state, court, 'settleClearReplay');
    expect(state.run?.sceneId).toBe('friendlyRematch');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('keeps The Speaker’s clearer demonstration player-involved and countable', () => {
    const speaker = ENTERTAINMENT_ADVENTURES.find(({ id }) => id === 'the-speaker')!;
    let state = begin(speaker);
    state = act(state, speaker, 'take-question');
    state = act(state, speaker, 'question-listen');
    expect(state.run?.sceneId).toBe('question-listen');
    expect(state.run?.status).toBe('active');
    expect(speaker.scenes['question-listen'].text).toContain('The naturalist waits for your answer');
    state = act(state, speaker, 'explainLimit');
    expect(state.run?.sceneId).toBe('speakerExplainsLimit');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('gives Miles Saved a calm story beat and counts the authored resolution immediately', () => {
    let state = begin(THE_SHORTCUT);
    state = choose(state, THE_SHORTCUT, THE_SHORTCUT.scenes.roadsideOffer.choices.find(({ id }) => id === 'takeCutoff')!, () => 0);
    expect(state.run?.sceneId).toBe('shortRoute');
    state = act(state, THE_SHORTCUT, 'noteFirmCut');
    expect(state.run?.sceneId).toBe('shortRouteComplete');
    expect(state.character?.knowledge).toContain('The shortcut over the rise follows white stones across firm ridge ground and rejoins the old road beyond the wet hollow.');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('makes carrying the Third Knock letter an actual delivery with a final choice', () => {
    const thirdKnock = OCCULT_INVESTIGATION_ADVENTURES.find(({ id }) => id === 'the-third-knock')!;
    let state = begin(thirdKnock);
    for (const choice of ['watchLetter', 'readLetterAloud', 'carryLetter']) state = act(state, thirdKnock, choice);
    expect(state.run?.sceneId).toBe('letterInHand');
    expect(state.run?.flags).toContain('letterTakenForDelivery');
    state = act(state, thirdKnock, 'carryToFerryman');
    expect(state.run?.sceneId).toBe('letterAtFerry');
    state = act(state, thirdKnock, 'tellFerrymanKnocks');
    expect(state.run?.sceneId).toBe('letterDeliveredTold');
    expect(thirdKnock.scenes.letterDeliveredTold.text).toContain('No living hand wrote that name');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });
});
