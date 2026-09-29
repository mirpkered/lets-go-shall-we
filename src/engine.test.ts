import { describe, expect, it } from 'vitest';
import { choose, depositCarried, failCharacter, finishSuccess, newCharacter, startRun, withdrawBanked } from './engine';
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
    const choice = BROKEN_BELL.scenes.chapelExterior.choices.find((c) => c.id === 'rope')!;
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
    const choice = BROKEN_BELL.scenes.maskedParley.choices[0];
    const next = choose(state, BROKEN_BELL, choice);
    expect(next.run?.status).toBe('success');
    expect(next.run?.inventory).toContain('bronzeMaskFragment');
    expect(next.run?.inventory).not.toContain('ironHandbell');
  });

  it('supports the combat-capable completion route', () => {
    const state = fresh();
    state.run!.sceneId = 'burialApproach';
    state.run!.inventory.push('ironHandbell');
    const fight = BROKEN_BELL.scenes.burialApproach.choices.find((c) => c.id === 'fight')!;
    const won = choose(state, BROKEN_BELL, fight, () => 0.1);
    expect(won.run?.sceneId).toBe('keeperDefeated');
    const finish = BROKEN_BELL.scenes.keeperDefeated.choices.find((c) => c.id === 'seal')!;
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
