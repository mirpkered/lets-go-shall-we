import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, newCharacter, startRun } from '../engine';
import { THE_INJURED_DOG } from './animalsBatch';
import { COMMUNICATION_ADVENTURES } from './communicationBatch';
import { THE_INJURED_TRAVELER } from './disputesBatch';
import { OCTOBER_AFFINITY_ADVENTURES } from './octoberAffinityBatch';
import { QUESTIONABLE_EMPLOYMENT_ADVENTURES } from './questionableEmploymentBatch';
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
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('lets the traveler contribute an observation after the dog handler arrives', () => {
    let state = begin(THE_INJURED_DOG);
    state = act(state, THE_INJURED_DOG, 'lookForDogOwner');
    state = act(state, THE_INJURED_DOG, 'waitForDogHandler');
    expect(state.run?.sceneId).toBe('dogHandlerArrives');
    state = act(state, THE_INJURED_DOG, 'describeDogPaw');
    expect(state.run?.sceneId).toBe('dogHandlerObserved');
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
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('counts An Earned Account through Knowledge and the carving contest through its one-coin reward', () => {
    const witch = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-witch-at-millers-ford')!;
    let witchState = begin(witch);
    for (const choice of ['speakHealer', 'askForEvidence', 'showRoot', 'witchReward']) witchState = act(witchState, witch, choice);
    expect(witchState.run?.sceneId).toBe('witchReward');
    expect(witchState.character?.knowledge).toContain('Miller’s Ford healer’s willow-bark tea must be made only from sound bark with clean water.');
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
});
