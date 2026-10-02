import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { SCENARIOS } from './index';
import { WHAT_DID_YOU_SEE } from './communityBatch';
import { HONEST_WORK_ADVENTURES, HARVEST_HAND, CUTTING_TIMBER } from './honestWorkBatch';
import { LEGAL_PROCESS_ADVENTURES } from './legalProcessBatch';
import { LOOSE_IN_THE_MARKET } from './animalsBatch';
import { SMALL_HUMAN_MOMENT_ADVENTURES } from './smallHumanMomentsBatch';
import { A_GAME_OF_CARDS } from './pleasantDaysBatch';
import { THE_LANDLORDS_STORY } from './disputesBatch';
import { RIVER_COMMERCE_ADVENTURES } from './riverCommerceBatch';
import { ENTERTAINMENT_ADVENTURES } from './entertainmentBatch';

function start(scenario: Scenario, selections: Record<string, string> = {}): SaveData {
  const character = newCharacter('Content Tester');
  const run = startRun(character, scenario, () => 0);
  run.randomSelections = { ...run.randomSelections, ...selections };
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

describe('content depth and payoff audit fixes', () => {
  it('records the current library size and limits edits to clearly thin examples', () => {
    expect(SCENARIOS).toHaveLength(445);
    expect(LEGAL_PROCESS_ADVENTURES.find(({ id }) => id === 'property-of')?.scenes.witnessRequested.text).toContain('specific question to answer');
    expect(HONEST_WORK_ADVENTURES).toHaveLength(10);
    expect(LOOSE_IN_THE_MARKET.scenes.marketAftercare.text).toContain('offering a coin for your time');
    expect(LOOSE_IN_THE_MARKET.scenes.marketHelpComplete.text).toContain('goat safely settled');
  });

  it('turns Property Of into a live, neutral dispute with a visible response and no assumed verdict', () => {
    const scenario = LEGAL_PROCESS_ADVENTURES.find(({ id }) => id === 'property-of')!;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    let state = act(start(scenario), scenario, 'opening', 'inspectMarks');
    state = act(state, scenario, 'mark', 'askAboutRepair');
    expect(state.run?.sceneId).toBe('marksResponse');
    expect(scenario.scenes.marksResponse.text).toContain('bring someone who remembers the loan');
    state = act(state, scenario, 'marksResponse', 'waitForWitnessMarks');
    expect(state.run?.status).toBe('success');
    expect(scenario.scenes[state.run!.sceneId].text).toContain('No one is awarded the box');

    let neutral = act(start(scenario), scenario, 'opening', 'reportUnloading');
    neutral = act(neutral, scenario, 'witness', 'stateOnlyWhatSaw');
    neutral = act(neutral, scenario, 'unloadingResponse', 'leaveAccount');
    expect(scenario.scenes[neutral.run!.sceneId].text).toContain('does not prove the loan ended');
  });

  it('shows Harvest Hand output, teamwork, bonus pay, and a fair setback branch', () => {
    const scenario = HARVEST_HAND;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    let steady = act(start(scenario, { shift: 'quiet' }), scenario, 'hiring', 'beginWork');
    steady = act(steady, scenario, 'work', 'finishQuiet');
    expect(steady.run?.sceneId).toBe('harvestTally');
    steady = act(steady, scenario, 'harvestTally', 'steadyHarvest');
    expect(steady.character?.money).toBe(4);
    expect(scenario.scenes[steady.run!.sceneId].text).toContain('four rows');

    let bonus = act(start(scenario, { shift: 'quiet' }), scenario, 'hiring', 'beginWork');
    bonus = act(bonus, scenario, 'work', 'finishQuiet');
    bonus = act(bonus, scenario, 'harvestTally', 'pushHarvest', () => 0);
    expect(bonus.character?.money).toBe(5);
    expect(bonus.character?.historyFlags).toContain('earned_harvest_row_bonus');

    let setback = act(start(scenario, { shift: 'quiet' }), scenario, 'hiring', 'beginWork');
    setback = act(setback, scenario, 'work', 'finishQuiet');
    setback = act(setback, scenario, 'harvestTally', 'pushHarvest', () => 0.999999);
    expect(setback.run?.health).toBe(10);
    expect(setback.character?.money).toBe(2);
    expect(scenario.scenes[setback.run!.sceneId].text).toContain('foreman steadies the loose binding hook');
  });

  it('shows Cutting Timber production and an optional paid extra load with communicated risk', () => {
    expect(findScenarioGraphProblems(CUTTING_TIMBER)).toEqual([]);
    let regular = act(start(CUTTING_TIMBER, { shift: 'quiet' }), CUTTING_TIMBER, 'hiring', 'beginWork');
    regular = act(regular, CUTTING_TIMBER, 'work', 'finishQuiet');
    expect(regular.run?.sceneId).toBe('timberTally');
    regular = act(regular, CUTTING_TIMBER, 'timberTally', 'finishTimberLoad');
    expect(regular.character?.money).toBe(4);
    expect(CUTTING_TIMBER.scenes[regular.run!.sceneId].text).toContain('two assigned cart-loads');

    let bonus = act(start(CUTTING_TIMBER, { shift: 'quiet' }), CUTTING_TIMBER, 'hiring', 'beginWork');
    bonus = act(bonus, CUTTING_TIMBER, 'work', 'finishQuiet');
    bonus = act(bonus, CUTTING_TIMBER, 'timberTally', 'extraTimberLoad', () => 0);
    expect(bonus.character?.money).toBe(5);
    expect(CUTTING_TIMBER.scenes[bonus.run!.sceneId].text).toContain('third short cart-load');
    expect(CUTTING_TIMBER.scenes.timberTally.choices.find(({ id }) => id === 'extraTimberLoad')?.hint).toContain('bound branch');
  });

  it('makes an honest witness account visibly narrow the dispute without forcing a verdict', () => {
    const wheel = start(WHAT_DID_YOU_SEE, { cartIncident: 'wheel' });
    let state = act(wheel, WHAT_DID_YOU_SEE, 'roadsideQuestion', 'rememberWheelStone');
    state = act(state, WHAT_DID_YOU_SEE, 'wheelMemory', 'giveWheelAccount');
    expect(state.run?.status).toBe('success');
    expect(sceneText(WHAT_DID_YOU_SEE.scenes[state.run!.sceneId], state)).toContain('agree to inspect the wheel');
    expect(sceneText(WHAT_DID_YOU_SEE.scenes[state.run!.sceneId], state)).not.toContain('decide who caused it');

    const unclear = start(WHAT_DID_YOU_SEE, { cartIncident: 'driver' });
    let limited = act(unclear, WHAT_DID_YOU_SEE, 'roadsideQuestion', 'rememberDriver');
    limited = act(limited, WHAT_DID_YOU_SEE, 'driverMemory', 'admitPoorView');
    expect(sceneText(WHAT_DID_YOU_SEE.scenes[limited.run!.sceneId], limited)).toContain('next question is narrower');
  });

  it('makes the marble replay one fair shot per child, without a second arbitration', () => {
    const scenario = SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    expect(scenario.scenes.listen.text).not.toBe(scenario.scenes.accounts.text);
    expect(scenario.scenes.listen.text).toContain('The first child');
    expect(scenario.scenes.accounts.text).toContain('The second child');
    let state = act(start(scenario), scenario, 'opening', 'take-listen');
    state = act(state, scenario, 'listen', 'listen-replay');
    state = act(state, scenario, 'accounts', 'replayMarked');
    expect(scenario.scenes.replaySetup.text).toContain('each child will take one shot');
    state = act(state, scenario, 'replaySetup', 'takeReplayShot', () => 0);
    expect(state.run?.sceneId).toBe('clearShot');
    expect(scenario.scenes.clearShot.text).toContain('exactly one shot');
    state = act(state, scenario, 'clearShot', 'settleClearReplay');
    expect(state.run?.status).toBe('success');
    const endingText = scenario.scenes[state.run!.sceneId].text;
    state = finishSuccess(state, []);
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(endingText).toContain('without reopening the first argument');

    let close = act(start(scenario), scenario, 'opening', 'take-listen');
    close = act(close, scenario, 'listen', 'listen-replay');
    close = act(close, scenario, 'accounts', 'replayMarked');
    close = act(close, scenario, 'replaySetup', 'takeReplayShot', () => 0.999999);
    expect(close.run?.sceneId).toBe('closeShot');
    close = act(close, scenario, 'closeShot', 'shareCloseTurns');
    expect(scenario.scenes[close.run!.sceneId].text).toContain('each take one shot');
    close = finishSuccess(close, []);
    expect(close.character?.adventuresCompleted).toBe(1);
  });

  it('gives The Speaker’s second demonstration a traveler decision and authored completion', () => {
    const scenario = ENTERTAINMENT_ADVENTURES.find(({ id }) => id === 'the-speaker')!;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    let state = act(start(scenario), scenario, 'opening', 'take-question');
    state = act(state, scenario, 'question', 'question-listen');
    expect(state.run?.sceneId).toBe('question-listen');
    expect(scenario.scenes[state.run!.sceneId].choices).toHaveLength(2);
    expect(state.run?.status).toBe('active');
    state = act(state, scenario, 'question-listen', 'explainLimit');
    expect(state.run?.status).toBe('success');
    const endingText = scenario.scenes[state.run!.sceneId].text;
    state = finishSuccess(state, []);
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(endingText).toContain('crowd begins asking practical questions');
  });

  it('keeps a deliberate short opt-out in the marble story and all reviewed graphs forward-only', () => {
    const reviewed = [
      LEGAL_PROCESS_ADVENTURES.find(({ id }) => id === 'property-of')!, HARVEST_HAND, CUTTING_TIMBER,
      WHAT_DID_YOU_SEE, SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!,
      LOOSE_IN_THE_MARKET,
    ];
    for (const scenario of reviewed) expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
    const short = act(start(SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!),
      SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!, 'opening', 'take-stayOut');
    expect(short.run?.sceneId).toBe('stayOut');
    const left = act(short, SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!, 'stayOut', 'stayOut-leave');
    expect(left.run?.status).toBe('success');
    expect(SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!.scenes.watchGame.text).toContain('start over');
  });

  it('turns A Coin for the Table into a real stop-or-continue card session with bounded stakes', () => {
    expect(findScenarioGraphProblems(A_GAME_OF_CARDS)).toEqual([]);
    let win = start(A_GAME_OF_CARDS);
    win.character!.money = 3;
    win = act(win, A_GAME_OF_CARDS, 'cardTable', 'playFriendlyHand', () => 0);
    expect(win.run?.sceneId).toBe('cardsWon');
    expect(A_GAME_OF_CARDS.scenes.cardsWon.choices.map(({ id }) => id)).toEqual(['stopAfterWin', 'secondHandAfterWin']);
    win = act(win, A_GAME_OF_CARDS, 'cardsWon', 'secondHandAfterWin', () => 0.99);
    expect(win.run?.sceneId).toBe('cardsSecondLoss');
    expect(win.character?.money).toBe(3);

    let loss = start(A_GAME_OF_CARDS);
    loss.character!.money = 2;
    loss = act(loss, A_GAME_OF_CARDS, 'cardTable', 'playFriendlyHand', () => 0.99);
    expect(loss.run?.sceneId).toBe('cardsLost');
    loss = act(loss, A_GAME_OF_CARDS, 'cardsLost', 'secondHandAfterLoss', () => 0);
    expect(loss.run?.sceneId).toBe('cardsSecondWin');
    expect(loss.character?.money).toBe(2);
  });

  it('makes A Small Compromise spell out terms and follow through before completion', () => {
    expect(findScenarioGraphProblems(THE_LANDLORDS_STORY)).toEqual([]);
    let state = act(start(THE_LANDLORDS_STORY), THE_LANDLORDS_STORY, 'roomComplaint', 'hearLandlord');
    state = act(state, THE_LANDLORDS_STORY, 'accountsCompared', 'suggestSplitRoom');
    expect(state.run?.sceneId).toBe('roomCompromise');
    expect(THE_LANDLORDS_STORY.scenes.roomCompromise.text).toMatch(/cannot pay half|supply plaster|help patch/i);
    state = act(state, THE_LANDLORDS_STORY, 'roomCompromise', 'boarderWorksForShare');
    expect(state.run?.status).toBe('success');
    expect(THE_LANDLORDS_STORY.scenes[state.run!.sceneId].text).toMatch(/repair will be made|help apply it/i);
  });

  it('gives Baggage Sorted a second useful judgment and state-aware work payoff', () => {
    const scenario = RIVER_COMMERCE_ADVENTURES.find(({ id }) => id === 'before-the-steamer-leaves')!;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    let state = act(start(scenario), scenario, 'opening', 'take-trunks');
    state = act(state, scenario, 'trunks', 'trunks-sort');
    expect(state.run?.sceneId).toBe('baggageTally');
    state = act(state, scenario, 'baggageTally', 'verifyBaggageTag');
    expect(state.run?.sceneId).toBe('baggageVerified');
    expect(state.character?.money).toBe(2);
    expect(scenario.scenes.baggageVerified.text).toMatch(/tag|porter|owners|two coins/i);

    let slower = act(start(scenario), scenario, 'opening', 'take-trunks');
    slower = act(slower, scenario, 'trunks', 'trunks-sort');
    slower = act(slower, scenario, 'baggageTally', 'askBaggageOwners');
    expect(scenario.scenes[slower.run!.sceneId].text).toMatch(/delay|one coin/i);
    expect(slower.character?.money).toBe(1);

    let trusted = act(start(scenario), scenario, 'opening', 'take-trunks');
    trusted = act(trusted, scenario, 'trunks', 'trunks-sort');
    trusted = act(trusted, scenario, 'baggageTally', 'trustPorterBaggage');
    expect(trusted.run?.sceneId).toBe('trunks-sort');
    expect(scenario.scenes[trusted.run!.sceneId].text).toMatch(/question travels with the boat|confirm the owner/i);
    expect(trusted.character?.money).toBe(1);
  });
});
