import { describe, expect, it } from 'vitest';
import { choose, depositCarried, failCharacter, finishSuccess, meets, newCharacter, sceneText, startRun, withdrawBanked } from './engine';
import { BROKEN_BELL } from './scenarios/brokenBell';
import { findScenarioGraphProblems } from './scenarioGraph';
import type { SaveData } from './types';

function fresh(): SaveData {
  const character = newCharacter('Test');
  return { version: 1, bank: [], character, run: startRun(character, BROKEN_BELL) };
}
function select(state: SaveData, sceneId: string, choiceId: string, random = () => 0): SaveData {
  state.run!.sceneId = sceneId;
  const choice = BROKEN_BELL.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  if (!choice) throw new Error(`Missing choice ${sceneId}.${choiceId}`);
  return choose(state, BROKEN_BELL, choice, random);
}

describe('adventure engine', () => {
  it('starts with exact base health and gear', () => {
    const state = fresh();
    expect(state.run?.health).toBe(10);
    expect(state.run?.inventory).toEqual(['smallKnife', 'lantern']);
  });

  it('clears the persistent carried-item pointer when a choice explicitly consumes that item', () => {
    const character = newCharacter('Consumed Gear');
    character.carriedItem = 'fieldBandageRoll';
    const scenario = {
      id: 'consumed-gear-test', title: 'Consumed gear', subtitle: '', startScene: 'start',
      scenes: {
        start: { id: 'start', title: 'Start', text: 'The bandage is used.', choices: [{ id: 'use', label: 'Use it', effects: { loseItems: ['fieldBandageRoll'] }, next: 'done' }] },
        done: { id: 'done', title: 'Done', text: 'Finished.', choices: [], ending: 'success' as const },
      },
    };
    const initial = { version: 1 as const, bank: [], character, run: startRun(character, scenario) };
    const next = choose(initial, scenario, scenario.scenes.start.choices[0]);
    expect(next.run?.inventory).not.toContain('fieldBandageRoll');
    expect(next.character?.carriedItem).toBeNull();
  });

  it('queues every authored terminal outcome once, including death and walk-away, but not abandonment or QA', () => {
    const endingScenario = {
      id: 'counter-test', title: 'Counter test', subtitle: '', startScene: 'start',
      scenes: {
        start: { id: 'start', title: 'Start', text: 'End it.', choices: [{ id: 'finish', label: 'Finish', next: 'walkAway' }] },
        walkAway: { id: 'walkAway', title: 'Walk away', text: 'The story closes.', choices: [], ending: 'success' as const },
      },
    };
    const character = newCharacter('Counter');
    const initial = { version: 1 as const, bank: ['graveCoin'], character, run: startRun(character, endingScenario) };
    const choice = endingScenario.scenes.start.choices[0];
    const completed = choose(initial, endingScenario, choice);
    expect(completed.run?.status).toBe('success');
    expect(completed.pendingGlobalCompletions).toEqual([initial.run.runId]);
    expect(completed.character?.adventuresCompleted).toBe(0);
    expect(choose(completed, endingScenario, choice).pendingGlobalCompletions).toEqual(completed.pendingGlobalCompletions);
    const resumedThenAbandoned = failCharacter(JSON.parse(JSON.stringify(initial)) as SaveData);
    expect(resumedThenAbandoned.pendingGlobalCompletions).toBeUndefined();
    expect(resumedThenAbandoned.bank).toEqual(['graveCoin']);
    expect(finishSuccess(completed, null).pendingGlobalCompletions).toEqual([initial.run.runId]);

    const qaRun = { ...startRun(character, endingScenario), qaMode: true };
    const qaCompleted = choose({ ...initial, run: qaRun }, endingScenario, choice);
    expect(qaCompleted.pendingGlobalCompletions).toBeUndefined();

    const lethalScenario = { ...endingScenario, scenes: {
      start: { id: 'start', title: 'Start', text: 'Danger.', choices: [{ id: 'fall', label: 'Take the risk', next: 'fatal' as const, effects: { health: -10 } }] },
      fatal: { id: 'fatal', title: 'Fatal ending', text: 'The player dies.', choices: [], ending: 'death' as const },
    } };
    const lethal = { ...initial, run: { ...startRun(character, lethalScenario), health: 1 } };
    const died = choose(lethal, lethalScenario, lethalScenario.scenes.start.choices[0]);
    expect(died.run?.status).toBe('death');
    expect(died.pendingGlobalCompletions).toEqual([lethal.run.runId]);
    expect(died.bank).toEqual(['graveCoin']);
  });

  it('assigns a new ID to each adventure and preserves the same one through state transitions', () => {
    const character = newCharacter('Run IDs');
    const first = startRun(character, BROKEN_BELL);
    const second = startRun(character, BROKEN_BELL);
    expect(first.runId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(second.runId).not.toBe(first.runId);
    const save: SaveData = { version: 1, bank: [], character, run: first };
    const resumed = JSON.parse(JSON.stringify(save)) as SaveData;
    expect(resumed.run?.runId).toBe(first.runId);
    expect(resumed.run?.runId).not.toBe(second.runId);
  });

  it('autosave-compatible choices preserve an exact serializable run state', () => {
    const next = select(fresh(), 'chapelExterior', 'inspectRope');
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
    expect(next.run?.sceneId).toBe('ropeClue');
    expect(next.character?.knowledge).toHaveLength(1);
  });

  it('lets a foreshadowed risky action both succeed and fail', () => {
    const state = fresh();
    const success = select(state, 'cellarWindow', 'climbCarefully', () => 0.2);
    const failed = select(state, 'cellarWindow', 'climbCarefully', () => 0.99);
    expect(success.run?.sceneId).toBe('cellarLanding');
    expect(success.run?.health).toBe(10);
    expect(failed.run?.sceneId).toBe('windowFall');
    expect(failed.run?.health).toBe(8);
  });

  it('supports peaceful return from a fresh character using evidence and explicit items', () => {
    let state = fresh();
    state = select(state, 'chapelExterior', 'callOut');
    expect(state.character?.knowledge).toContain('The soot inscription reads: DO NOT RING IT BELOW.');
    state = select(state, 'voiceBelow', 'enterAfterCall');
    state = select(state, 'chapelNave', 'takeCandlestick');
    expect(state.run?.inventory).toContain('brassCandlestick');
    state = select(state, 'naveAfterCandle', 'followKnockWithCandle');
    state = select(state, 'rugInvestigation', 'raiseRugAfterKnock');
    state = select(state, 'trapdoorFound', 'descendHiddenStair');
    state = select(state, 'underStairs', 'findPriestBelow');
    expect(BROKEN_BELL.scenes.priestAfterHound.title).toContain('Below');
    state = select(state, 'priestAfterHound', 'askPriest');
    expect(state.run?.inventory).not.toContain('boneKey');
    state = select(state, 'priestAccount', 'requestKeyAndWard');
    expect(state.run?.inventory).toContain('boneKey');
    state = select(state, 'priestFarewell', 'returnToChestAfterPriest');
    state = select(state, 'chestAfterPriest', 'unlockChest');
    expect(state.run?.inventory).toContain('ironHandbell');
    state = select(state, 'bellFoundAfterPriest', 'goKeeperWithRecoveredBell');
    state = select(state, 'burialApproach', 'speak');
    state = select(state, 'maskedParley', 'observeGesture');
    state = select(state, 'keeperSign', 'liftClapper');
    state = select(state, 'clapperTaken', 'returnNowWithBoth');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('bronzeMaskFragment');
    expect(state.run?.inventory).not.toContain('ironHandbell');
    expect(state.run?.inventory).not.toContain('blackClapper');
    expect(new Set(state.run?.visitedSceneIds ?? []).size).toBe(state.run?.visitedSceneIds?.length);
  });

  it('gives early clue and candlestick meaningful later payoffs', () => {
    const cluePath = select(select(fresh(), 'chapelExterior', 'callOut'), 'voiceBelow', 'enterAfterCall');
    expect(cluePath.character?.knowledge).toContain('The soot inscription reads: DO NOT RING IT BELOW.');
    let withBrass = select(fresh(), 'chapelNave', 'takeCandlestick');
    withBrass = select(withBrass, 'naveAfterCandle', 'followKnockWithCandle');
    withBrass = select(withBrass, 'rugInvestigation', 'raiseRugAfterKnock');
    withBrass = select(withBrass, 'trapdoorFound', 'descendHiddenStair');
    withBrass = select(withBrass, 'underStairs', 'inspectChest');
    const options = BROKEN_BELL.scenes.chestClue.choices.filter((choice) => meets(choice.requirements, withBrass));
    expect(options.map((choice) => choice.id)).toContain('wedgeChest');
    expect(BROKEN_BELL.scenes.burialApproach.choices.find((choice) => choice.id === 'fightBrass')?.requirements?.items).toContain('brassCandlestick');
  });

  it('does not reveal the trapdoor before the character discovers it', () => {
    const nave = BROKEN_BELL.scenes.chapelNave;
    expect(nave.text.toLowerCase()).not.toContain('trapdoor');
    expect(nave.choices.find((choice) => choice.id === 'liftPrayerRug')?.label.toLowerCase()).not.toContain('trapdoor');
    let state = select(fresh(), 'chapelNave', 'takeCandlestick');
    expect(state.run?.sceneId).toBe('naveAfterCandle');
    expect(BROKEN_BELL.scenes.naveAfterCandle.text.toLowerCase()).not.toContain('trapdoor');
    expect(BROKEN_BELL.scenes.naveAfterCandle.choices.some((choice) => choice.id === 'descendWithCandle')).toBe(false);
    state = select(fresh(), 'chapelNave', 'liftPrayerRug');
    expect(state.run?.sceneId).toBe('trapdoorFound');
    expect(state.run?.flags).toContain('discoveredTrapdoor');
    expect(BROKEN_BELL.scenes.trapdoorFound.text.toLowerCase()).toContain('trapdoor');
  });

  it('keeps the chapel investigation open after taking the candlestick', () => {
    const state = select(fresh(), 'chapelNave', 'takeCandlestick');
    const followup = BROKEN_BELL.scenes.naveAfterCandle;
    expect(state.run?.inventory).toContain('brassCandlestick');
    expect(followup.choices.map((choice) => choice.label)).toEqual(expect.arrayContaining([
      'Search the vestry for evidence', 'Study the muddy prints', 'Follow the knock near the rug',
    ]));
    expect(followup.choices.every((choice) => choice.next !== 'underStairs')).toBe(true);
    expect(select(state, 'naveAfterCandle', 'searchVestryWithCandle').run?.sceneId).toBe('priestNotes');
    expect(select(state, 'naveAfterCandle', 'studyPrintsWithCandle').run?.sceneId).toBe('mudTrail');
  });

  it('describes the handbell only when carried or previously discovered', () => {
    const scene = BROKEN_BELL.scenes.burialApproach;
    const unknown = fresh();
    expect(sceneText(scene, unknown).toLowerCase()).not.toContain('bell');
    const known = fresh();
    known.character!.knowledge.push('A cold iron handbell was taken from beneath the chapel.');
    expect(sceneText(scene, known)).toContain('remember the iron handbell taken from below');
    const carrying = fresh();
    carrying.run!.inventory.push('ironHandbell');
    expect(sceneText(scene, carrying)).toContain('handbell in your possession');
    expect(sceneText(BROKEN_BELL.scenes.keeperSign, unknown)).not.toContain('handbell');
    expect(sceneText(BROKEN_BELL.scenes.keeperSign, known)).toContain('remember the handbell taken from below');
    expect(sceneText(BROKEN_BELL.scenes.keeperSign, carrying)).toContain('handbell in your possession');
    expect(sceneText(BROKEN_BELL.scenes.clapperTaken, unknown)).not.toContain('handbell');
    expect(sceneText(BROKEN_BELL.scenes.clapperTaken, known)).toContain('points toward the handbell and the hollow');
    expect(sceneText(BROKEN_BELL.scenes.clapperTaken, carrying)).toContain('handbell you carry');
  });

  it('keeps endings limited to facts the character encountered', () => {
    const unknown = fresh();
    const retreat = sceneText(BROKEN_BELL.scenes.retreatEnding, unknown).toLowerCase();
    expect(retreat).not.toContain('livestock');
    expect(retreat).not.toContain('priest');
    const escorted = fresh();
    escorted.run!.flags.push('escortedPriest');
    expect(sceneText(BROKEN_BELL.scenes.retreatEnding, escorted)).toContain('guide the injured priest');
    for (const endingId of ['retreatEnding', 'peaceEnding', 'hardEnding']) {
      expect(BROKEN_BELL.scenes[endingId].text.toLowerCase()).not.toContain('livestock');
    }
    expect(sceneText(BROKEN_BELL.scenes.oneRelicEnding, unknown)).not.toContain('priest');
  });

  it('does not grant the bone key for binding the priest; the player must ask', () => {
    let state = select(fresh(), 'underStairs', 'findPriestBelow');
    state = select(state, 'priestAfterHound', 'bindPriest');
    expect(state.run?.inventory).not.toContain('boneKey');
    expect(state.character?.knowledge).toContain('The soot inscription reads: DO NOT RING IT BELOW.');
    state = select(state, 'priestStabilized', 'askAfterBinding');
    state = select(state, 'priestAccount', 'requestKeyAndWard');
    expect(state.run?.inventory).toContain('boneKey');
    expect(state.run?.inventory).toContain('yewCharm');
  });

  it('offers a real candlestick chest use and consumes it when used', () => {
    let state = select(fresh(), 'chapelNave', 'takeCandlestick');
    state = select(state, 'naveAfterCandle', 'followKnockWithCandle');
    state = select(state, 'rugInvestigation', 'raiseRugAfterKnock');
    state = select(state, 'trapdoorFound', 'descendHiddenStair');
    state = select(state, 'underStairs', 'inspectChest');
    const atChest = { ...state, run: { ...state.run!, sceneId: 'chestClue' } };
    const wedge = BROKEN_BELL.scenes.chestClue.choices.find((choice) => choice.id === 'wedgeChest')!;
    const result = choose(atChest, BROKEN_BELL, wedge);
    expect(result.run?.sceneId).toBe('chestForcedOpen');
    expect(result.run?.inventory).toContain('ironHandbell');
    expect(result.run?.inventory).not.toContain('brassCandlestick');
  });

  it('does not duplicate unique relic acquisitions or reacquire the bell', () => {
    const state = fresh();
    state.run!.inventory.push('blackClapper');
    state.run!.sceneId = 'keeperSign';
    let available = BROKEN_BELL.scenes.keeperSign.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).not.toContain('takeClapperNoBell');
    state.run!.inventory.push('ironHandbell', 'boneKey', 'bronzeMaskFragment');
    state.run!.sceneId = 'chestClue';
    available = BROKEN_BELL.scenes.chestClue.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).not.toContain('forceChest');
    expect(available.map((choice) => choice.id)).not.toContain('wedgeChest');
  });

  it('advances a failed risky keeper action into a changed consequence scene', () => {
    const failed = select(fresh(), 'burialApproach', 'snatch', () => 0.99);
    expect(failed.run?.sceneId).toBe('keeperWarning');
    expect(failed.run?.health).toBe(7);
    expect(failed.run?.inventory).not.toContain('blackClapper');
  });

  it('supports dangerous but possible and lethal combat paths', () => {
    const prepared = fresh();
    prepared.run!.inventory.push('ironHandbell');
    const won = select(prepared, 'burialApproach', 'fightKnife', () => 0.1);
    expect(won.run?.sceneId).toBe('keeperDefeated');
    const finished = select(won, 'keeperDefeated', 'takeBothAfterFight');
    expect(finished.run?.status).toBe('success');
    const loss = select(prepared, 'burialApproach', 'fightKnife', () => 0.99);
    expect(loss.run?.health).toBe(3);
    const lethal = select(loss, 'keeperAfterFight', 'fightAgain', () => 0.99);
    expect(lethal.run?.status).toBe('death');
  });

  it('validates the complete Bell graph as forward-only', () => {
    expect(findScenarioGraphProblems(BROKEN_BELL)).toEqual([]);
  });

  it('never reaches an active non-ending state with zero available choices or revisits a scene', () => {
    const queue: SaveData[] = [fresh()];
    const seenStates = new Set<string>();
    const deadEnds: string[] = [];
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), knowledge: [...state.character!.knowledge].sort() });
      if (seenStates.has(key)) continue;
      seenStates.add(key);
      if (run.status !== 'active') continue;
      const scene = BROKEN_BELL.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const available = scene.choices.filter((choice) => meets(choice.requirements, state));
      if (!available.length) deadEnds.push(run.sceneId);
      for (const choice of available) {
        const outcomes = [choose(state, BROKEN_BELL, choice, () => 0)];
        if (choice.chance || choice.effects?.combat) outcomes.push(choose(state, BROKEN_BELL, choice, () => 0.999999));
        for (const outcome of outcomes) {
          const visits = outcome.run?.visitedSceneIds ?? [];
          expect(new Set(visits).size).toBe(visits.length);
          if (outcome.run) expect(visits).toContain(outcome.run.sceneId);
          queue.push(outcome);
        }
      }
    }
    expect(deadEnds).toEqual([]);
    expect(seenStates.size).toBeGreaterThan(20);
  });

  it('retains one selected carryable reward and strips the run', () => {
    const state = fresh();
    state.run!.status = 'success';
    state.run!.inventory.push('bronzeMaskFragment');
    const next = finishSuccess(state, 'bronzeMaskFragment');
    expect(next.run).toBeNull();
    expect(next.character?.carriedItem).toBe('bronzeMaskFragment');
  });

  it('keeps banked items through death or abandonment', () => {
    const state = fresh();
    state.bank = ['yewCharm'];
    state.character!.money = 12;
    const next = failCharacter(state);
    expect(next.bank).toEqual(['yewCharm']);
    expect(next.character).toBeNull();
    expect(next.run).toBeNull();
  });

  it('moves gear between the character and bank without duplication', () => {
    let state = fresh();
    state.character!.carriedItem = 'graveCoin';
    state = depositCarried(state);
    expect(state.bank).toEqual(['graveCoin']);
    expect(state.character?.carriedItem).toBeNull();
    state = withdrawBanked(state, 'graveCoin');
    expect(state.bank).toEqual([]);
    expect(state.character?.carriedItem).toBe('graveCoin');
  });
});
