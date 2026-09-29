import { describe, expect, it } from 'vitest';
import { choose, depositCarried, failCharacter, finishSuccess, meets, newCharacter, startRun, withdrawBanked } from './engine';
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
    state = select(state, 'naveAfterCandle', 'descendWithCandle');
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
    const withBrass = select(select(fresh(), 'chapelNave', 'takeCandlestick'), 'naveAfterCandle', 'descendWithCandle');
    const options = BROKEN_BELL.scenes.chestClue.choices.filter((choice) => meets(choice.requirements, { ...withBrass, run: { ...withBrass.run!, sceneId: 'chestClue' } }));
    expect(options.map((choice) => choice.id)).toContain('wedgeChest');
    expect(BROKEN_BELL.scenes.burialApproach.choices.find((choice) => choice.id === 'fightBrass')?.requirements?.items).toContain('brassCandlestick');
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
    state = select(state, 'naveAfterCandle', 'descendWithCandle');
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
