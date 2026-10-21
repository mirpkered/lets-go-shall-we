import { describe, expect, it } from 'vitest';
import { choose, itemState, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { COMPETITION_GEAR_GENRE_BATCH } from './competitionGearGenreBatch';
import type { SaveData, Scenario } from '../types';

function begin(scenario: Scenario, money = 5): SaveData {
  const character = newCharacter('Contest Tester');
  character.money = money;
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: ReturnType<typeof begin>, scenario: Scenario, id: string, random = () => 0) {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

describe('Gear Expansion Genre Batch 6 — Competitions / Wagers / Challenges', () => {
  it('awards the bent Survey Chain as damaged only on the corrected-measure prize route', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-chain-at-twenty-paces')!;
    let noPrize = begin(scenario);
    noPrize = act(noPrize, scenario, 'inspectChain');
    noPrize = act(noPrize, scenario, 'reportFault');
    expect(noPrize.run?.sceneId).toBe('honest');
    expect(noPrize.run?.inventory).not.toContain('surveyChain');

    let prize = begin(scenario);
    prize = act(prize, scenario, 'inspectChain');
    prize = act(prize, scenario, 'submitMeasure');
    prize = act(prize, scenario, 'acceptChain');
    expect(prize.run?.inventory).toContain('surveyChain');
    expect(itemState(prize, 'surveyChain').condition).toBe('DAMAGED');
    expect(prize.character?.historyFlags).toContain('won_survey_chain_measure_trial');

    let coinWinner = begin(scenario);
    coinWinner = act(coinWinner, scenario, 'inspectChain');
    coinWinner = act(coinWinner, scenario, 'submitMeasure');
    coinWinner = act(coinWinner, scenario, 'takeCoins');
    expect(coinWinner.character?.money).toBe(7);
    expect(coinWinner.run?.inventory).not.toContain('surveyChain');
  });
  it('retains practical Knowledge independently of competition compensation', () => {
    const siding = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-load-on-the-siding')!;
    const sidingLesson = 'A high strap restrains a load but can pull its center of weight sideways on a curve.';
    const sidingToRunnerUp = () => {
      let state = begin(siding);
      state = act(state, siding, 'strapHigh');
      expect(sceneText(siding.scenes.roll, state)).toMatch(/pulls its weight toward one side/i);
      state = act(state, siding, 'keepRolling', () => 0);
      expect(state.run?.sceneId).toBe('fast');
      expect(state.character?.knowledge).toContain(sidingLesson);
      return state;
    };
    const runnerUpPaid = act(sidingToRunnerUp(), siding, 'acceptRunnerUp');
    expect(runnerUpPaid.character?.money).toBe(7);
    expect(runnerUpPaid.character?.knowledge).toContain(sidingLesson);
    const sidingStorage = { value:'', setItem(_key:string,value:string){this.value=value;}, getItem(_key:string){return this.value;} };
    saveGame(runnerUpPaid, sidingStorage as never);
    expect(loadSave(sidingStorage as never).character?.knowledge).toContain(sidingLesson);
    const runnerUpDeclined = act(sidingToRunnerUp(), siding, 'declineRunnerUp');
    expect(runnerUpDeclined.character?.knowledge).toContain(sidingLesson);

    const longCarry = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-long-carry')!;
    const beamLesson = 'A long beam travels more safely when carriers change at marked rests before the load begins twisting.';
    const balancedFinish = () => {
      let state = begin(longCarry);
      state = act(state, longCarry, 'balanceBeam');
      expect(state.character?.knowledge).toContain(beamLesson);
      return act(state, longCarry, 'keepEven');
    };
    const beamPaid = act(balancedFinish(), longCarry, 'takeThreeCoins');
    expect(beamPaid.character?.money).toBe(8);
    expect(beamPaid.character?.knowledge).toContain(beamLesson);
    const learnedFinish = balancedFinish();
    expect(meets(longCarry.scenes.finish.choices.find(({ id }) => id === 'declinePurse')?.requirements, learnedFinish)).toBe(false);
    expect(meets(longCarry.scenes.finish.choices.find(({ id }) => id === 'declinePurseAfterLearning')?.requirements, learnedFinish)).toBe(true);
    const learnedDecline = act(learnedFinish, longCarry, 'declinePurseAfterLearning');
    expect(learnedDecline.character?.knowledge).toContain(beamLesson);
    const beamGear = (() => {
      let state = begin(longCarry);
      state = act(state, longCarry, 'balanceBeam');
      state = act(state, longCarry, 'pushHard', () => 0);
      return act(state, longCarry, 'takeWonFrame');
    })();
    expect(beamGear.character?.knowledge).toContain(beamLesson);
    const deferredFinish = (() => {
      let state = begin(longCarry);
      state = act(state, longCarry, 'dragBeam');
      return act(state, longCarry, 'keepEven');
    })();
    expect(deferredFinish.character?.knowledge).not.toContain(beamLesson);
    expect(sceneText(longCarry.scenes.finish, deferredFinish)).toMatch(/offers to demonstrate the carrier changes/i);
    const beamDeclined = act(deferredFinish, longCarry, 'declinePurse');
    expect(beamDeclined.character?.knowledge).toContain(beamLesson);
    const storage = { value:'', setItem(_key:string,value:string){this.value=value;}, getItem(_key:string){return this.value;} };
    saveGame(beamPaid, storage as never);
    expect(loadSave(storage as never).character?.knowledge).toContain(beamLesson);
    const unpaidLate = (() => {
      let state = begin(longCarry);
      state = act(state, longCarry, 'dragBeam');
      state = act(state, longCarry, 'pushHard', () => 0.99);
      return state;
    })();
    expect(unpaidLate.run?.sceneId).toBe('late');
    expect(unpaidLate.character?.knowledge).not.toContain(beamLesson);
    expect(sceneText(longCarry.scenes.late, unpaidLate)).toMatch(/offers to demonstrate the carrier changes/i);
    const taughtLate = act(unpaidLate, longCarry, 'declineLate');
    expect(taughtLate.character?.knowledge).toContain(beamLesson);

    const harness = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-harness-stitch-trial')!;
    const stitchLesson = 'Flex a harness strap at its fold; worn stitches can fail there before the leather looks damaged.';
    const safeStitchResult = (stopPull: boolean) => {
      let state = begin(harness);
      if (stopPull) {
        state = act(state, harness, 'pullTest');
        state = act(state, harness, 'stopPull');
      } else {
        state = act(state, harness, 'flexStitch');
        state = act(state, harness, 'replaceThread');
      }
      expect(state.run?.sceneId).toBe('safeResult');
      expect(state.character?.knowledge).toContain(stitchLesson);
      return state;
    };
    for (const choice of ['takeRoll', 'takeTwoCoins', 'learnStitch']) {
      const after = act(safeStitchResult(choice === 'takeTwoCoins'), harness, choice);
      expect(after.character?.knowledge, choice).toContain(stitchLesson);
    }
    for (const choice of harness.scenes.safeResult.choices) expect(choice.effects?.knowledge).toEqual([stitchLesson]);
  });

  it('registers 24 unique, all-year Adventures with clean complete graphs and no new Gear IDs', () => {
    expect(COMPETITION_GEAR_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(881);
    expect(new Set(COMPETITION_GEAR_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(COMPETITION_GEAR_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(COMPETITION_GEAR_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    expect(COMPETITION_GEAR_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(0);
    const rewardedIds = new Set(COMPETITION_GEAR_GENRE_BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices.flatMap(({ effects }) => effects?.gainItems ?? []))));
    expect(rewardedIds.size).toBeGreaterThan(0);
    for (const id of rewardedIds) expect(ITEMS[id]?.inventoryClass).toBe('GEAR');
  });

  it('keeps every authored scene reachable from its normal entry', () => {
    for (const scenario of COMPETITION_GEAR_GENRE_BATCH) {
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id) || !scenario.scenes[id]) continue;
        reached.add(id);
        for (const choice of scenario.scenes[id].choices) {
          const destinations = choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next];
          for (const destination of destinations) {
            if (destination) pending.push(destination);
          }
        }
      }
      expect([...Object.keys(scenario.scenes)].filter((id) => !reached.has(id)), scenario.id).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
        expect(Boolean(choice.next || choice.chance || choice.effects?.combat), `${scenario.id}.${scene.id}.${choice.id} must resolve to another state`).toBe(true);
      }
    }
  });

  it('makes the water-wheel wager single-round, capped, and exact on win or loss', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    let state = begin(scenario, 3);
    state = act(state, scenario, 'stakeCoin');
    expect(state.character?.money).toBe(2);
    state = act(state, scenario, 'callNarrow', () => 0);
    expect(state.character?.money).toBe(4);
    expect(state.run?.sceneId).toBe('testNarrow');
    const loser = act(act(begin(scenario, 3), scenario, 'stakeCoin'), scenario, 'callWide', () => 0.99);
    expect(loser.character?.money).toBe(2);
    expect(loser.run?.sceneId).toBe('testNarrow');
    expect(sceneText(scenario.scenes.testNarrow, loser)).toMatch(/call was wrong.*keeps the one-coin stake/i);

    const wrongWide = act(act(begin(scenario, 3), scenario, 'stakeCoin'), scenario, 'callNarrow', () => 0.99);
    expect(wrongWide.character?.money).toBe(2);
    expect(wrongWide.run?.sceneId).toBe('testWide');
    expect(sceneText(scenario.scenes.testWide, wrongWide)).toMatch(/call was wrong.*keeps the one-coin stake/i);
    const correctWide = act(act(begin(scenario, 3), scenario, 'stakeCoin'), scenario, 'callWide', () => 0);
    expect(correctWide.character?.money).toBe(4);
    expect(sceneText(scenario.scenes.testWide, correctWide)).toMatch(/returns your one-coin stake and pays one coin in winnings/i);
  });

  it('keeps the inn wager one hand only and pays the agreed stake once', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-quiet-card-count')!;
    let state = begin(scenario, 3);
    state = act(state, scenario, 'playHand');
    expect(state.character?.money).toBe(2);
    state = act(state, scenario, 'callHigh');
    expect(state.run?.sceneId).toBe('won');
    state = act(state, scenario, 'takeOneCoin');
    expect(state.character?.money).toBe(4);
    expect(state.run?.sceneId).toBe('coinPrize');
    expect(scenario.scenes.coinPrize.choices).toHaveLength(0);

    let loss = begin(scenario, 3);
    loss = act(loss, scenario, 'playHand');
    loss = act(loss, scenario, 'callLow');
    expect(loss.character?.money).toBe(2);
    expect(loss.run?.sceneId).toBe('lost');

    let instructional = begin(scenario, 3);
    instructional = act(instructional, scenario, 'playHand');
    expect(scenario.scenes.hand.choices.filter(({ requirements }) => meets(requirements, instructional)).map(({ id }) => id)).toContain('askMethodAfterStake');
    expect(scenario.scenes.hand.choices.filter(({ requirements }) => meets(requirements, instructional)).map(({ id }) => id)).not.toContain('askMethod');
    instructional = act(instructional, scenario, 'askMethodAfterStake');
    expect(instructional.character?.money).toBe(3);
    expect(sceneText(scenario.scenes.lesson, instructional)).toMatch(/returns your one-coin stake/i);

    const noStake = act(begin(scenario, 3), scenario, 'watchOnly');
    expect(scenario.scenes.hand.choices.filter(({ requirements }) => meets(requirements, noStake)).map(({ id }) => id)).toContain('askMethod');
    expect(scenario.scenes.hand.choices.filter(({ requirements }) => meets(requirements, noStake)).map(({ id }) => id)).not.toContain('askMethodAfterStake');
  });

  it('persists an explicitly won Gear prize through the real acquisition path', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-blind-trail-marker')!;
    let state = begin(scenario);
    state = act(state, scenario, 'compareStride');
    state = act(state, scenario, 'nameNarrowTrail');
    state = act(state, scenario, 'acceptRope');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('travelRope');
    expect(state.run?.acquiredThisRun).toContain('travelRope');
    expect(state.itemStates?.travelRope?.provenance).toContain('Awarded by guide Sen Harlow for correctly identifying the narrow trail from linked evidence in The Blind Trail Marker.');
  });

  it('grants the announced square only after the measured-frame result and prize choice', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-seven-inch-square')!;
    let state = begin(scenario);
    state = act(state, scenario, 'measureOpening');
    state = act(state, scenario, 'squareAndShim');
    expect(state.run?.sceneId).toBe('result');
    expect(state.run?.inventory).not.toContain('carpenterSquare');
    state = act(state, scenario, 'acceptSquarePrize');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('carpenterSquare');
    expect(JSON.stringify(state.itemStates?.carpenterSquare?.provenance)).toContain('Awarded by carpenter Willa');
  });

  it('preserves approach, placement, and exclusive prize tiers in The Load on the Siding', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-load-on-the-siding')!;
    let low = act(begin(scenario), scenario, 'strapLow');
    expect(low.run?.flags).toContain('siding_strap_low');
    expect(low.run?.flags).not.toContain('siding_strap_high');
    expect(meets(scenario.scenes.roll.choices.find(({ id }) => id === 'continueLow')!.requirements, low)).toBe(true);
    expect(meets(scenario.scenes.roll.choices.find(({ id }) => id === 'keepRolling')!.requirements, low)).toBe(false);
    low = act(low, scenario, 'continueLow');
    expect(low.run?.flags).toContain('siding_trial_winner');
    expect(scenario.scenes.result.choices.map(({ id }) => id)).toEqual(['takeStrap', 'declineWinnerPrize']);
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'takeStrap')!.requirements, low)).toBe(true);
    const legacyWinnerSave = begin(scenario);
    legacyWinnerSave.run!.sceneId = 'result';
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'takeStrap')!.requirements, legacyWinnerSave)).toBe(true);
    low = act(low, scenario, 'takeStrap');
    expect(low.run?.inventory).toContain('freightmansStrap');

    let high = act(begin(scenario), scenario, 'strapHigh');
    expect(high.run?.flags).toContain('siding_strap_high');
    expect(meets(scenario.scenes.roll.choices.find(({ id }) => id === 'keepRolling')!.requirements, high)).toBe(true);
    high = JSON.parse(JSON.stringify(high)) as SaveData;
    expect(high.run?.flags).toContain('siding_strap_high');
    high = act(high, scenario, 'keepRolling', () => 0);
    expect(high.run?.sceneId).toBe('fast');
    expect(high.run?.flags).toContain('siding_trial_runner_up');
    expect(scenario.scenes.fast.choices.map(({ id }) => id)).toEqual(['acceptRunnerUp', 'declineRunnerUp']);
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'takeStrap')!.requirements, high)).toBe(false);
    const legacyRunnerUpSave = begin(scenario);
    legacyRunnerUpSave.run!.sceneId = 'fast';
    expect(meets(scenario.scenes.fast.choices[0].requirements, legacyRunnerUpSave)).toBe(true);
    high = act(high, scenario, 'acceptRunnerUp');
    expect(high.character?.money).toBe(7);
    expect(high.run?.inventory).not.toContain('freightmansStrap');

    const lost = act(act(begin(scenario), scenario, 'strapHigh'), scenario, 'keepRolling', () => 0.99);
    expect(lost.run?.sceneId).toBe('spill');
    expect(lost.run?.flags).toContain('siding_trial_lost');
  });

  it('keeps the siding rail-inspection and disqualification routes distinct and unrewarded', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-load-on-the-siding')!;
    let state = act(begin(scenario), scenario, 'inspectCart');
    state = act(state, scenario, 'straightenStop');
    expect(state.run?.sceneId).toBe('load');
    state = act(state, scenario, 'loadHigh');
    expect(state.run?.flags).toContain('siding_strap_high');
    state = act(state, scenario, 'steadyCart');
    expect(state.run?.flags).toContain('siding_trial_winner');
    expect(state.run?.flags).toContain('siding_load_recentered');

    let withdrawn = act(begin(scenario), scenario, 'strapLow');
    withdrawn = act(withdrawn, scenario, 'callSafeStop');
    expect(withdrawn.run?.sceneId).toBe('stopped');
    expect(withdrawn.run?.flags).toContain('siding_trial_disqualified');
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'takeStrap')!.requirements, withdrawn)).toBe(false);
  });

  it('does not show the runner-up purse on a winning Knot before the Bell route', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-knot-before-the-bell')!;
    let winner = act(begin(scenario), scenario, 'learnKnot');
    winner = act(winner, scenario, 'finishLift', () => 0);
    expect(winner.run?.sceneId).toBe('result');
    expect(scenario.scenes.result.choices.map(({ id }) => id)).toEqual(['claimClamp', 'decline']);
    winner = act(winner, scenario, 'claimClamp');
    expect(winner.run?.inventory).toContain('ironRopeClamp');

    let runnerUp = act(begin(scenario), scenario, 'learnKnot');
    runnerUp = act(runnerUp, scenario, 'finishLift', () => 0.99);
    expect(runnerUp.run?.sceneId).toBe('loss');
    expect(scenario.scenes.loss.choices.map(({ id }) => id)).toEqual(['claimLateCoin', 'declineLateCoin']);
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'claimClamp')!.requirements, runnerUp)).toBe(false);
  });

  it('retains the bowline lesson from the chosen method independently of prize or purse', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-knot-before-the-bell')!;
    const bowline = 'A bowline held the contest barrel securely when the standing line was inspected before loading.';
    const clamp = begin(scenario);
    expect(act(clamp, scenario, 'learnKnot').character?.knowledge).toContain(bowline);
    expect(act(clamp, scenario, 'useClamp').character?.knowledge).not.toContain(bowline);

    let winner = act(clamp, scenario, 'learnKnot');
    winner = act(winner, scenario, 'finishLift', () => 0);
    const knowledgeBeforePrize = winner.character!.knowledge;
    winner = act(winner, scenario, 'claimClamp');
    expect(winner.character?.knowledge).toEqual(knowledgeBeforePrize);
    expect(winner.run?.inventory).toContain('ironRopeClamp');

    let runnerUp = act(clamp, scenario, 'learnKnot');
    runnerUp = act(runnerUp, scenario, 'finishLift', () => 0.99);
    const knowledgeBeforePurse = runnerUp.character!.knowledge;
    runnerUp = act(runnerUp, scenario, 'claimLateCoin');
    expect(runnerUp.character?.knowledge).toEqual(knowledgeBeforePurse);
    expect(runnerUp.character?.money).toBe(6);
  });

  it('grants the lookout lesson when the extra movement is actually investigated, not as a prize alternative', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-lookout-at-dusk')!;
    const lesson = 'A moving cloth outside a signal course may be a person in trouble, not part of the contest.';
    let state = act(begin(scenario), scenario, 'nakedEye');
    state = act(state, scenario, 'checkRidge');
    expect(state.character?.knowledge).toContain(lesson);
    expect(scenario.scenes.worker.choices.map(({ id }) => id)).toEqual(['takeGlasses', 'takeCoin', 'declineHelperFee']);
    const beforeCompensation = state.character!.knowledge;
    state = act(state, scenario, 'takeCoin');
    expect(state.character?.knowledge).toEqual(beforeCompensation);
    expect(state.character?.money).toBe(6);

    let wind = act(begin(scenario), scenario, 'askSpotter');
    wind = act(wind, scenario, 'checkRidgeFirst');
    expect(wind.character?.knowledge).toContain(lesson);
  });

  it('ties the brace hammer to a recorded gradual-load result', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-match-at-the-brace')!;
    const gradual = act(begin(scenario), scenario, 'testSlow');
    expect(gradual.run?.flags).toContain('brace_gradual_test');
    expect(sceneText(scenario.scenes.strain, gradual)).toMatch(/gradual load holds on Nell’s brace/i);
    expect(meets(scenario.scenes.strain.choices.find(({ id }) => id === 'awardNell')?.requirements, gradual)).toBe(true);

    const resumed = loadSave({ getItem: () => JSON.stringify(gradual) });
    expect(resumed.run?.flags).toContain('brace_gradual_test');
    expect(meets(scenario.scenes.strain.choices.find(({ id }) => id === 'awardNell')?.requirements, resumed)).toBe(true);
    const winner = act(resumed, scenario, 'awardNell');
    expect(winner.run?.inventory).toContain('bridgewrightHammer');
    expect(sceneText(scenario.scenes.winner, winner)).toMatch(/Nell receives the ribbon/i);

    let harsh = act(begin(scenario), scenario, 'testFast');
    expect(sceneText(scenario.scenes.strain, harsh)).toMatch(/both braces crack/i);
    expect(meets(scenario.scenes.strain.choices.find(({ id }) => id === 'awardNell')?.requirements, harsh)).toBe(false);
    harsh = act(harsh, scenario, 'voidUnsafe');
    expect(harsh.character?.knowledge).toContain('A brace should be loaded gradually; a sudden test can damage both the repair and the part it supports.');

    const oldHarshResult = begin(scenario);
    oldHarshResult.run!.sceneId = 'winner';
    oldHarshResult.run!.flags.push('brace_harsh_test');
    expect(sceneText(scenario.scenes.winner, oldHarshResult)).toMatch(/does not establish a safe winner/i);

    let unproven = begin(scenario);
    unproven.run!.sceneId = 'strain';
    expect(sceneText(scenario.scenes.strain, unproven)).toMatch(/test method is not recorded/i);
    expect(meets(scenario.scenes.strain.choices.find(({ id }) => id === 'awardNell')?.requirements, unproven)).toBe(false);
  });

  it('awards the lookout glasses only after the correct signal is recorded', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-lookout-at-dusk')!;
    let correct = act(begin(scenario), scenario, 'askSpotter');
    correct = act(correct, scenario, 'callChanged');
    expect(correct.run?.flags).toContain('lookout_signal_correct');
    expect(sceneText(scenario.scenes.scoring, correct)).toMatch(/judge confirms that it was the changed signal/i);
    expect(meets(scenario.scenes.scoring.choices.find(({ id }) => id === 'claimGlass')?.requirements, correct)).toBe(true);

    const resumed = loadSave({ getItem: () => JSON.stringify(correct) });
    expect(resumed.run?.flags).toContain('lookout_signal_correct');
    correct = act(resumed, scenario, 'claimGlass');
    expect(correct.run?.inventory).toContain('fieldGlasses');
    expect(sceneText(scenario.scenes.prize, correct)).toMatch(/judge confirms your call/i);
    expect(sceneText(scenario.scenes.prize, correct)).not.toMatch(/survey hand back/i);

    let noCall = act(begin(scenario), scenario, 'nakedEye');
    noCall = act(noCall, scenario, 'stayContest');
    expect(noCall.run?.sceneId).toBe('scoring');
    expect(sceneText(scenario.scenes.scoring, noCall)).toMatch(/did not record which signal you called/i);
    expect(meets(scenario.scenes.scoring.choices.find(({ id }) => id === 'claimGlass')?.requirements, noCall)).toBe(false);
    expect(meets(scenario.scenes.scoring.choices.find(({ id }) => id === 'claimCoin')?.requirements, noCall)).toBe(true);
    const noCallCoin = act(noCall, scenario, 'claimCoin');
    expect(sceneText(scenario.scenes.coin, noCallCoin)).toMatch(/does not establish a winner/i);

    let legacy = begin(scenario);
    legacy.run!.sceneId = 'scoring';
    expect(sceneText(scenario.scenes.scoring, legacy)).toMatch(/did not record which signal you called/i);
    expect(meets(scenario.scenes.scoring.choices.find(({ id }) => id === 'claimGlass')?.requirements, legacy)).toBe(false);

    const legacyPrize = begin(scenario);
    legacyPrize.run!.sceneId = 'prize';
    expect(sceneText(scenario.scenes.prize, legacyPrize)).toMatch(/does not preserve which route earned the Field Glasses/i);

    let helper = act(begin(scenario), scenario, 'askSpotter');
    helper = act(helper, scenario, 'checkRidgeFirst');
    expect(helper.run?.sceneId).toBe('worker');
    helper = act(helper, scenario, 'takeGlasses');
    expect(helper.run?.inventory).toContain('fieldGlasses');
    expect(sceneText(scenario.scenes.prize, helper)).toMatch(/helped bring the survey hand back/i);
  });

  it('counts the saw prize only after the split log is turned and re-marked', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-saw-before-supper-trial')!;
    let corrected = act(begin(scenario), scenario, 'inspectLog');
    corrected = act(corrected, scenario, 'turnLog');
    expect(corrected.run?.flags).toContain('saw_sound_end_established');
    corrected = act(corrected, scenario, 'easeBlade');
    expect(corrected.run?.sceneId).toBe('finish');
    expect(sceneText(scenario.scenes.finish, corrected)).toMatch(/turned to its sound end/i);
    expect(meets(scenario.scenes.finish.choices.find(({ id }) => id === 'takePryTool')?.requirements, corrected)).toBe(true);
    const resumed = loadSave({ getItem: () => JSON.stringify(corrected) });
    expect(resumed.run?.flags).toContain('saw_sound_end_established');
    corrected = act(resumed, scenario, 'takePryTool');
    expect(corrected.run?.inventory).toContain('foldingPryTool');

    let skipped = act(begin(scenario), scenario, 'startCut');
    skipped = act(skipped, scenario, 'easeBlade');
    expect(sceneText(scenario.scenes.finish, skipped)).toMatch(/did not establish the required turn-and-re-mark correction/i);
    expect(meets(scenario.scenes.finish.choices.find(({ id }) => id === 'takePryTool')?.requirements, skipped)).toBe(false);
    expect(meets(scenario.scenes.finish.choices.find(({ id }) => id === 'takeTwo')?.requirements, skipped)).toBe(false);
    skipped = act(skipped, scenario, 'closeUnverifiedFinish');
    expect(skipped.run?.sceneId).toBe('unverified');

    let unprovenFast = act(begin(scenario), scenario, 'startCut');
    unprovenFast = act(unprovenFast, scenario, 'pullHard', () => 0);
    expect(unprovenFast.run?.sceneId).toBe('fast');
    expect(sceneText(scenario.scenes.fast, unprovenFast)).toMatch(/did not establish the required turn-and-re-mark correction/i);
    expect(meets(scenario.scenes.fast.choices.find(({ id }) => id === 'acceptFastPryTool')?.requirements, unprovenFast)).toBe(false);
    expect(meets(scenario.scenes.fast.choices.find(({ id }) => id === 'takeFastCoins')?.requirements, unprovenFast)).toBe(false);
    unprovenFast = act(unprovenFast, scenario, 'closeUnverifiedFast');
    expect(unprovenFast.run?.sceneId).toBe('unverified');

    const legacy = begin(scenario);
    legacy.run!.sceneId = 'finish';
    expect(sceneText(scenario.scenes.finish, legacy)).toMatch(/did not establish the required turn-and-re-mark correction/i);
    expect(meets(scenario.scenes.finish.choices.find(({ id }) => id === 'takePryTool')?.requirements, legacy)).toBe(false);
  });

  it('requires a recorded normal-load test before the Iron Squares diagnosis prize', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-iron-squares')!;
    let tested = act(begin(scenario), scenario, 'askSmith');
    tested = act(tested, scenario, 'measurePost');
    tested = act(tested, scenario, 'askForLoad');
    expect(tested.run?.flags).toContain('iron_squares_normal_load_tested');
    expect(sceneText(scenario.scenes.result, tested)).toMatch(/older hinge fits better/i);
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'acceptSquare')?.requirements, tested)).toBe(true);
    const resumed = loadSave({ getItem: () => JSON.stringify(tested) });
    expect(resumed.run?.flags).toContain('iron_squares_normal_load_tested');
    tested = act(resumed, scenario, 'acceptSquare');
    expect(tested.run?.inventory).toContain('carpenterSquare');

    let appearanceOnly = act(begin(scenario), scenario, 'askSmith');
    appearanceOnly = act(appearanceOnly, scenario, 'chooseNew');
    expect(appearanceOnly.run?.sceneId).toBe('historyWrong');
    expect(sceneText(scenario.scenes.historyWrong, appearanceOnly)).toMatch(/gate has not been tested under load/i);
    expect(appearanceOnly.run?.inventory).not.toContain('carpenterSquare');

    const legacy = begin(scenario);
    legacy.run!.sceneId = 'result';
    expect(sceneText(scenario.scenes.result, legacy)).toMatch(/does not record a normal-load test/i);
    expect(meets(scenario.scenes.result.choices.find(({ id }) => id === 'acceptSquare')?.requirements, legacy)).toBe(false);
    const direct = act(act(begin(scenario), scenario, 'checkGap'), scenario, 'chooseOld');
    expect(direct.run?.sceneId).toBe('correct');
  });

  it('keeps Hammer and Ribbon rewards tied to an established result', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-hammer-and-the-ribbon')!;

    // A clean first mark followed by the range pause has no recorded placement.
    let unranked = act(begin(scenario), scenario, 'throwNow');
    unranked = act(unranked, scenario, 'resumeSafely');
    expect(unranked.run?.sceneId).toBe('score');
    expect(scenario.scenes.score.text).toContain('before any placement is established');
    expect(scenario.scenes.score.choices.map(({ id }) => id)).toEqual(['takeCoin']);
    unranked = act(unranked, scenario, 'takeCoin');
    expect(unranked.character?.money).toBe(6);
    expect(unranked.run?.inventory).not.toContain('steelWedge');
    expect(unranked.run?.sceneId).toBe('coin');
    expect(scenario.scenes.coin.text).toContain('Wedge goes only to the confirmed highest scorer');

    // The revised-round success explicitly confirms the leading score and alone
    // exposes the winner's prize or its equivalent coin value.
    let winner = act(begin(scenario), scenario, 'callHold');
    winner = act(winner, scenario, 'takeTurn', () => 0);
    expect(winner.run?.sceneId).toBe('win');
    expect(scenario.scenes.win.text).toContain('confirms your score leads');
    expect(scenario.scenes.win.choices.map(({ id }) => id)).toEqual(['acceptWonWedge', 'takeWonCoins']);
    winner = act(winner, scenario, 'acceptWonWedge');
    expect(winner.run?.inventory).toContain('steelWedge');

    let winningCoinChoice = act(begin(scenario), scenario, 'callHold');
    winningCoinChoice = act(winningCoinChoice, scenario, 'takeTurn', () => 0);
    winningCoinChoice = act(winningCoinChoice, scenario, 'takeWonCoins');
    expect(winningCoinChoice.character?.money).toBe(7);
    expect(winningCoinChoice.run?.inventory).not.toContain('steelWedge');

    // A recorded miss or withdrawal cannot reach the winner-only reward scene.
    let miss = act(begin(scenario), scenario, 'callHold');
    miss = act(miss, scenario, 'takeTurn', () => 0.99);
    expect(miss.run?.sceneId).toBe('miss');
    expect(miss.run?.inventory).not.toContain('steelWedge');
    expect(scenario.scenes.miss.choices.map(({ id }) => id)).toEqual(['takeMissCoin', 'declineMiss']);

    let withdrawn = act(begin(scenario), scenario, 'askJudge');
    withdrawn = act(withdrawn, scenario, 'withdrawRange');
    expect(withdrawn.run?.sceneId).toBe('withdrawn');
    expect(withdrawn.run?.inventory).not.toContain('steelWedge');
  });

  it('keeps Dry Crossing blanket awards exclusive to dry finishes', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-dry-crossing-race')!;
    let dry = act(begin(scenario), scenario, 'studyCurrent');
    dry = act(dry, scenario, 'safeLine');
    expect(dry.run?.sceneId).toBe('safeFinish');
    expect(scenario.scenes.safeFinish.text).toContain('sacks arrive dry');
    dry = act(dry, scenario, 'takeDryBlanket');
    expect(dry.run?.inventory).toContain('weatherproofBlanket');

    let wet = act(begin(scenario), scenario, 'studyCurrent');
    wet = act(wet, scenario, 'quickLine', () => 0.99);
    expect(wet.run?.sceneId).toBe('wetFinish');
    expect(wet.run?.inventory).not.toContain('weatherproofBlanket');
    expect(wet.run?.sceneId).not.toBe('blanket');

    let damp = act(begin(scenario), scenario, 'strapSacks');
    damp = act(damp, scenario, 'rushLoad', () => 0.99);
    expect(damp.run?.sceneId).toBe('finish');
    expect(damp.run?.inventory).not.toContain('weatherproofBlanket');
    expect(scenario.scenes.finish.choices.map(({ id }) => id)).toEqual(['takePartial', 'givePrizeAway']);
  });

  it('keeps The Long Carry winner’s frame on the explicitly confirmed win route', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-long-carry')!;
    let careful = act(begin(scenario), scenario, 'balanceBeam');
    careful = act(careful, scenario, 'keepEven');
    expect(careful.run?.sceneId).toBe('finish');
    expect(scenario.scenes.finish.choices.map(({ id }) => id)).toEqual(['takeThreeCoins', 'declinePurse', 'declinePurseAfterLearning']);
    expect(careful.run?.inventory).not.toContain('packFrame');

    let winner = act(begin(scenario), scenario, 'balanceBeam');
    winner = act(winner, scenario, 'pushHard', () => 0);
    expect(winner.run?.sceneId).toBe('won');
    winner = act(winner, scenario, 'takeWonFrame');
    expect(winner.run?.inventory).toContain('packFrame');
  });

  it('awards the Fair-Weather cloak only after a forecast meets the posted two-hour test', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-fair-weather-reading')!;

    let qualified = begin(scenario);
    qualified = act(qualified, scenario, 'readRidge');
    qualified = act(qualified, scenario, 'forecastRainWindow');
    expect(qualified.run?.flags).toContain('fair_weather_forecast_qualified');
    const qualifiedRewards = scenario.scenes.score.choices.filter((choice) => meets(choice.requirements, qualified));
    expect(qualifiedRewards.map(({ id }) => id)).toEqual(['takeCloak', 'takeCoin', 'declinePrize']);
    qualified = act(qualified, scenario, 'takeCloak');
    expect(qualified.run?.inventory).toContain('weatherproofCloak');
    expect(qualified.run?.acquiredThisRun).toContain('weatherproofCloak');
    expect(qualified.run?.sceneId).toBe('prize');

    let missed = begin(scenario);
    missed = act(missed, scenario, 'studyFlags');
    missed = act(missed, scenario, 'forecastRainLater');
    const missedRewards = scenario.scenes.noPrizeScore.choices.filter((choice) => meets(choice.requirements, missed));
    expect(missedRewards.map(({ id }) => id)).toEqual(['takeCoinAfterMiss', 'declineAfterMiss']);
    missed = act(missed, scenario, 'takeCoinAfterMiss');
    expect(missed.character?.money).toBe(6);
    expect(missed.run?.inventory).not.toContain('weatherproofCloak');

    let declined = begin(scenario);
    declined = act(declined, scenario, 'readRidge');
    declined = act(declined, scenario, 'forecastRainWindow');
    declined = act(declined, scenario, 'declinePrize');
    expect(declined.character?.money).toBe(5);
    expect(declined.run?.inventory).not.toContain('weatherproofCloak');
    expect(declined.run?.sceneId).toBe('declined');
  });

  it('keeps legacy saves at the old Fair-Weather result scene playable without inventing a qualifying forecast', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-fair-weather-reading')!;
    const legacy = begin(scenario);
    legacy.run!.sceneId = 'score';
    const available = scenario.scenes.score.choices.filter((choice) => meets(choice.requirements, legacy));
    expect(available.map(({ id }) => id)).toEqual(['takeCoin', 'declinePrize']);
    expect(scenario.scenes.score.textVariants?.some(({ text }) => /saved run has no recorded forecast result/i.test(text))).toBe(true);
    const continued = act(legacy, scenario, 'takeCoin');
    expect(continued.character?.money).toBe(6);
    expect(continued.run?.inventory).not.toContain('weatherproofCloak');
  });

  it('keeps Bell Rope refusal and prize endings distinct while retaining the learned signal lesson', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bell-rope-at-ferry-end')!;
    const signalLesson = 'A signal is useful only when the person who can act can see or hear it; place a lookout accordingly.';

    let declined = begin(scenario);
    declined = act(declined, scenario, 'repeatRules');
    declined = act(declined, scenario, 'warnCrew');
    declined = act(declined, scenario, 'declinePrize');
    expect(declined.run?.sceneId).toBe('declinedWhistle');
    expect(sceneText(scenario.scenes.declinedWhistle, declined)).toMatch(/decline the Farm Whistle/i);
    expect(sceneText(scenario.scenes.declinedWhistle, declined)).not.toMatch(/accept the Farm Whistle/i);
    expect(declined.run?.inventory).not.toContain('farmWhistle');
    expect(declined.character?.knowledge).toContain(signalLesson);

    let accepted = begin(scenario);
    accepted = act(accepted, scenario, 'repeatRules');
    accepted = act(accepted, scenario, 'warnCrew');
    accepted = act(accepted, scenario, 'claimWhistle');
    accepted = act(accepted, scenario, 'acceptWhistle');
    expect(accepted.run?.sceneId).toBe('whistleEnd');
    expect(sceneText(scenario.scenes.whistleEnd, accepted)).not.toMatch(/accept the Farm Whistle/i);
    expect(accepted.run?.inventory).toContain('farmWhistle');

    const legacyEnding = begin(scenario);
    legacyEnding.run!.sceneId = 'whistleEnd';
    expect(sceneText(scenario.scenes.whistleEnd, legacyEnding)).not.toMatch(/accept|decline the Farm Whistle/i);
  });

  it('describes the Millwheel forced-turn outcome separately without changing its risk result', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-millwheel-hand')!;

    let forcedSuccess = begin(scenario);
    forcedSuccess = act(forcedSuccess, scenario, 'tightenBelt');
    forcedSuccess = act(forcedSuccess, scenario, 'forceTurn', () => 0);
    expect(forcedSuccess.run?.sceneId).toBe('forcedStopped');
    expect(sceneText(scenario.scenes.forcedStopped, forcedSuccess)).toMatch(/force one more turn after Pella calls for an immediate stop/i);
    expect(sceneText(scenario.scenes.forcedStopped, forcedSuccess)).not.toMatch(/your caution prevents/i);
    expect(forcedSuccess.run?.inventory).not.toContain('pocketToolkit');

    let forcedFailure = begin(scenario);
    forcedFailure = act(forcedFailure, scenario, 'tightenBelt');
    forcedFailure = act(forcedFailure, scenario, 'forceTurn', () => 0.99);
    expect(forcedFailure.run?.sceneId).toBe('damaged');

    let reported = begin(scenario);
    reported = act(reported, scenario, 'inspectPeg');
    reported = act(reported, scenario, 'reportWear');
    expect(reported.run?.sceneId).toBe('stopped');
    expect(sceneText(scenario.scenes.stopped, reported)).not.toMatch(/your caution/i);
    expect(sceneText(scenario.scenes.stopped, reported)).toMatch(/toolkit is not awarded/i);
    const legacyStopped = begin(scenario);
    legacyStopped.run!.sceneId = 'stopped';
    expect(sceneText(scenario.scenes.stopped, legacyStopped)).not.toMatch(/your caution/i);
  });

  it('keeps the Fair-Weather prize closure limited to the qualifying forecast', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-fair-weather-reading')!;

    let qualified = begin(scenario);
    qualified = act(qualified, scenario, 'readRidge');
    qualified = act(qualified, scenario, 'forecastRainWindow');
    qualified = act(qualified, scenario, 'takeCloak');
    expect(qualified.run?.sceneId).toBe('prize');
    expect(sceneText(scenario.scenes.prize, qualified)).toMatch(/forecast met the posted two-hour test/i);
    expect(sceneText(scenario.scenes.prize, qualified)).not.toMatch(/parade|route change/i);
    expect(qualified.run?.inventory).toContain('weatherproofCloak');

    let warned = begin(scenario);
    warned = act(warned, scenario, 'askOldCook');
    warned = act(warned, scenario, 'warnCamp');
    expect(warned.run?.sceneId).toBe('warning');
    expect(sceneText(scenario.scenes.warning, warned)).toMatch(/takes the lower path/i);
  });

  it('routes every authored Gear prize through the canonical run inventory grant', () => {
    for (const scenario of COMPETITION_GEAR_GENRE_BATCH) for (const [sceneId, scene] of Object.entries(scenario.scenes)) {
      for (const choice of scene.choices.filter(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) {
        const state = begin(scenario);
        state.run!.sceneId = sceneId;
        for (const flag of choice.requirements?.flags ?? []) state.run!.flags.push(flag);
        const resulting = act(state, scenario, choice.id);
        for (const id of choice.effects?.gainItems ?? []) {
          expect(resulting.run?.inventory, `${scenario.id}.${sceneId}.${choice.id} grants ${id}`).toContain(id);
          expect(resulting.run?.acquiredThisRun).toContain(id);
        }
        expect(resulting.run?.status, `${scenario.id}.${sceneId}.${choice.id} completes its prize route`).toBe('success');
      }
    }
  });

  it('preserves a wager exactly across a save/resume boundary with no replay or second payout', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    let state = act(begin(scenario, 3), scenario, 'stakeCoin');
    const resumed = structuredClone(state);
    expect(resumed.character?.money).toBe(2);
    state = act(resumed, scenario, 'callNarrow', () => 0);
    expect(state.character?.money).toBe(4);
    expect(scenario.scenes[state.run!.sceneId].choices).toHaveLength(0);
  });

  it('does not expose a coin stake without the required funds', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    const poor = begin(scenario, 0);
    expect(meets(scenario.scenes.brief.choices.find(({ id }) => id === 'stakeCoin')?.requirements, poor)).toBe(false);
    const card = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-quiet-card-count')!;
    expect(meets(card.scenes.table.choices.find(({ id }) => id === 'playHand')?.requirements, begin(card, 0))).toBe(false);
  });

  it('awards the quarry marker only when the sound lower ledge is established', () => {
    const quarry = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-quarry-step')!;
    let direct = act(begin(quarry), quarry, 'climbQuick', () => 0);
    expect(direct.run?.sceneId).toBe('bell');
    expect(sceneText(quarry.scenes.bell, direct)).toMatch(/does not establish whether you stayed off the cracked upper shelf/i);
    expect(meets(quarry.scenes.bell.choices.find(({ id }) => id === 'acceptMarker')?.requirements, direct)).toBe(false);
    expect(quarry.scenes.bell.choices.filter((choice) => meets(choice.requirements, direct)).map(({ id }) => id)).toEqual(['closeUnverifiedTrial']);
    direct = act(direct, quarry, 'closeUnverifiedTrial');
    expect(quarry.scenes.unverified.text).toMatch(/records no safe finish or prize/i);

    let safe = act(begin(quarry), quarry, 'declineUpper');
    safe = act(safe, quarry, 'askSafeRule');
    expect(safe.run?.flags).toContain('quarrySoundLedge');
    expect(sceneText(quarry.scenes.bell, safe)).toMatch(/from the sound lower ledge/i);
    safe = act(safe, quarry, 'acceptMarker');
    expect(safe.run?.inventory).toContain('foldingTrailMarker');

    let traversed = act(begin(quarry), quarry, 'testLowerHolds');
    traversed = act(traversed, quarry, 'moveToLedge', () => 0);
    expect(traversed.run?.flags).toContain('quarrySoundLedge');
    expect(sceneText(quarry.scenes.bell, traversed)).toMatch(/without touching the cracked shelf/i);
  });

  it('awards the roof-lift completion only after the sound beam is established', () => {
    const roof = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-rigging-on-the-roof')!;
    let direct = act(begin(roof), roof, 'tieSling');
    direct = act(direct, roof, 'lowerAndReset');
    expect(sceneText(roof.scenes.finish, direct)).toMatch(/does not establish that the cracked nearest ring was avoided/i);
    expect(meets(roof.scenes.finish.choices.find(({ id }) => id === 'takeMirror')?.requirements, direct)).toBe(false);
    direct = act(direct, roof, 'closeUnverifiedLift');
    expect(roof.scenes.unverified.text).toMatch(/no route proof establishes that the cracked nearest ring was avoided/i);

    let rushed = act(begin(roof), roof, 'tieSling');
    rushed = act(rushed, roof, 'rushBundle', () => 0);
    expect(rushed.run?.sceneId).toBe('win');
    expect(meets(roof.scenes.win.choices.find(({ id }) => id === 'acceptRoofMirror')?.requirements, rushed)).toBe(false);
    rushed = act(rushed, roof, 'closeUnverifiedWin');
    expect(rushed.run?.sceneId).toBe('unverified');

    let safe = act(begin(roof), roof, 'inspectAnchor');
    safe = act(safe, roof, 'useBeam');
    safe = act(safe, roof, 'lowerAndReset');
    expect(safe.run?.flags).toContain('roofSoundBeamUsed');
    const resumed = loadSave({ getItem: () => JSON.stringify(safe) });
    expect(sceneText(roof.scenes.finish, resumed)).toMatch(/judges the work on the sound beam anchor/i);
    expect(meets(roof.scenes.finish.choices.find(({ id }) => id === 'takeMirror')?.requirements, resumed)).toBe(true);
    safe = act(resumed, roof, 'takeMirror');
    expect(safe.run?.inventory).toContain('roadsideSignalMirror');

    let weather = act(begin(roof), roof, 'waitWeather');
    weather = act(weather, roof, 'secureLine');
    expect(weather.run?.flags).toContain('roofSoundBeamUsed');
  });
});
