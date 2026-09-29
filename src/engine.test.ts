import { describe, expect, it } from 'vitest';
import { choose, depositCarried, failCharacter, finishSuccess, meets, newCharacter, startRun, withdrawBanked } from './engine';
import { BROKEN_BELL } from './scenarios/brokenBell';
import type { SaveData } from './types';

function fresh(): SaveData {
  const character = newCharacter('Test');
  return { version: 1, bank: [], character, run: startRun(character, BROKEN_BELL) };
}

describe('adventure engine', () => {
  it('starts with exact base health and gear', () => {
    const state = fresh();
    expect(state.run?.health).toBe(10);
    expect(state.run?.inventory).toEqual(['smallKnife', 'lantern']);
  });

  it('autosave-compatible choices preserve an exact serializable run state', () => {
    const state = fresh();
    const choice = BROKEN_BELL.scenes.chapelExterior.choices.find((c) => c.id === 'inspectRope')!;
    const next = choose(state, BROKEN_BELL, choice, () => 0);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
    expect(next.run?.sceneId).toBe('ropeClue');
    expect(next.character?.knowledge).toHaveLength(1);
  });

  it('lets a foreshadowed risky action both succeed and fail', () => {
    const state = fresh();
    state.run!.sceneId = 'cellarWindow';
    const choice = BROKEN_BELL.scenes.cellarWindow.choices[0];
    expect(choose(state, BROKEN_BELL, choice, () => 0.2).run?.health).toBe(10);
    expect(choose(state, BROKEN_BELL, choice, () => 0.9).run?.health).toBe(8);
  });

  it('supports the peaceful return route', () => {
    const state = fresh();
    state.run!.sceneId = 'maskedParley';
    state.run!.inventory.push('ironHandbell', 'blackClapper');
    const choice = BROKEN_BELL.scenes.maskedParley.choices.find((entry) => entry.id === 'returnBoth')!;
    const next = choose(state, BROKEN_BELL, choice);
    expect(next.run?.status).toBe('success');
    expect(next.run?.inventory).toContain('bronzeMaskFragment');
    expect(next.run?.inventory).not.toContain('ironHandbell');
  });

  it('lets a player with the snatched clapper return for the handbell', () => {
    const state = fresh();
    state.run!.sceneId = 'keeperAfterSnatch';
    state.run!.inventory.push('blackClapper');
    state.run!.inventory.push('boneKey');
    state.run!.acquiredThisRun.push('blackClapper');
    state.run!.flags.push('hasClapper');

    const available = BROKEN_BELL.scenes.keeperAfterSnatch.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).toContain('returnForBell');

    const next = choose(state, BROKEN_BELL, available.find((choice) => choice.id === 'returnForBell')!);
    expect(next.run?.sceneId).toBe('returnToChapel');
    expect(next.run?.inventory).toContain('blackClapper');
    const recover = BROKEN_BELL.scenes.returnToChapel.choices.find((choice) => choice.id === 'unlockReturnChest')!;
    const recovered = choose(next, BROKEN_BELL, recover);
    expect(recovered.run?.sceneId).toBe('bellRecoveredScene');
    expect(recovered.run?.inventory).toContain('ironHandbell');
    const returnBoth = BROKEN_BELL.scenes.bellRecoveredScene.choices.find((choice) => choice.id === 'returnTogether')!;
    const peaceful = choose(recovered, BROKEN_BELL, returnBoth);
    expect(peaceful.run?.status).toBe('success');
    expect(peaceful.run?.sceneId).toBe('peaceEnding');
  });

  it('supports returning the handbell before taking the clapper', () => {
    const state = fresh();
    state.run!.sceneId = 'maskedParley';
    state.run!.inventory.push('ironHandbell');
    const returnBell = BROKEN_BELL.scenes.maskedParley.choices.find((choice) => choice.id === 'returnBell')!;
    const half = choose(state, BROKEN_BELL, returnBell);
    expect(half.run?.sceneId).toBe('partialReturn');
    const lift = BROKEN_BELL.scenes.partialReturn.choices.find((choice) => choice.id === 'takeClapperNow')!;
    const held = choose(half, BROKEN_BELL, lift);
    expect(held.run?.sceneId).toBe('clapperAtAltar');
    const place = BROKEN_BELL.scenes.clapperAtAltar.choices.find((choice) => choice.id === 'returnLastClapper')!;
    expect(choose(held, BROKEN_BELL, place).run?.sceneId).toBe('peaceEnding');
  });

  it('advances a failed clapper attempt and never offers a duplicate unique object', () => {
    const state = fresh();
    state.run!.sceneId = 'keeperWarning';
    state.run!.visitedSceneIds = ['chapelExterior', 'keeperWarning'];
    const attempt = BROKEN_BELL.scenes.keeperWarning.choices.find((choice) => choice.id === 'tryClapperAgain')!;
    const failed = choose(state, BROKEN_BELL, attempt, () => 0.99);
    expect(failed.run?.sceneId).toBe('keeperAfterClapperFailure');
    expect(failed.run?.health).toBe(6);
    expect(failed.run?.inventory).not.toContain('blackClapper');

    const alreadyHasClapper = structuredClone(state);
    alreadyHasClapper.run!.sceneId = 'maskedParley';
    alreadyHasClapper.run!.inventory.push('blackClapper');
    alreadyHasClapper.run!.flags.push('hasClapper');
    expect(BROKEN_BELL.scenes.maskedParley.choices.filter((choice) => meets(choice.requirements, alreadyHasClapper)).map((choice) => choice.id)).not.toContain('takeClapper');

    const alreadyHasBell = structuredClone(state);
    alreadyHasBell.run!.sceneId = 'underStairs';
    alreadyHasBell.run!.inventory.push('ironHandbell');
    expect(BROKEN_BELL.scenes.underStairs.choices.filter((choice) => meets(choice.requirements, alreadyHasBell)).map((choice) => choice.id)).not.toContain('unlockChest');
    expect(BROKEN_BELL.scenes.underStairs.choices.filter((choice) => meets(choice.requirements, alreadyHasBell)).map((choice) => choice.id)).not.toContain('forceChest');
  });

  it('moves failed dangerous checks into a new consequence scene', () => {
    const state = fresh();
    state.run!.sceneId = 'cellarWindow';
    const choice = BROKEN_BELL.scenes.cellarWindow.choices.find((entry) => entry.id === 'climb')!;
    const failure = choose(state, BROKEN_BELL, choice, () => 0.99);
    expect(failure.run?.sceneId).toBe('windowFall');
    expect(failure.run?.health).toBe(8);
    expect(failure.run?.visitedSceneIds).toContain('windowFall');
  });

  it('never reaches an active non-ending state with zero available choices', () => {
    const initial = fresh();
    const queue: SaveData[] = [initial];
    const visited = new Set<string>();
    const deadEnds: string[] = [];

    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const character = state.character!;
      const key = JSON.stringify({
        scene: run.sceneId,
        inventory: [...run.inventory].sort(),
        flags: [...run.flags].sort(),
        knowledge: [...character.knowledge].sort(),
      });
      if (visited.has(key)) continue;
      visited.add(key);
      if (run.status !== 'active') continue;

      const scene = BROKEN_BELL.scenes[run.sceneId];
      expect(scene, `Missing scene: ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const available = scene.choices.filter((choice) => meets(choice.requirements, state));
      if (!available.length) {
        deadEnds.push(`${run.sceneId} with inventory [${run.inventory.join(', ')}] and flags [${run.flags.join(', ')}]`);
        continue;
      }

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

    expect(deadEnds, `Reachable dead ends:\n${deadEnds.join('\n')}`).toEqual([]);
    expect(visited.size).toBeGreaterThan(20);
  });

  it('supports the combat-capable completion route', () => {
    const state = fresh();
    state.run!.sceneId = 'burialApproach';
    state.run!.inventory.push('ironHandbell');
    const fight = BROKEN_BELL.scenes.burialApproach.choices.find((c) => c.id === 'fight')!;
    const won = choose(state, BROKEN_BELL, fight, () => 0.1);
    expect(won.run?.sceneId).toBe('keeperDefeated');
    const finish = BROKEN_BELL.scenes.keeperDefeated.choices.find((c) => c.id === 'sealWithBell')!;
    expect(choose(won, BROKEN_BELL, finish).run?.status).toBe('success');
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
