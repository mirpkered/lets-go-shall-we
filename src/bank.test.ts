import { describe, expect, it } from 'vitest';
import { bankCapacityLabel, bankCapacityMessage, BANK_CAPACITY } from './bank';
import { depositCarried, eligibleCarryItems, failCharacter, finishSuccess, newCharacter, retireCharacter, startRun, withdrawBanked } from './engine';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';
import { BROKEN_BELL } from './scenarios/brokenBell';
import { loadSave, SAVE_KEY } from './storage';
import type { SaveData } from './types';

const FIVE_ITEMS = ['graveCoin', 'yewCharm', 'brassCandlestick', 'bronzeMaskFragment', 'boneKey'];

function stateWithBank(bank: string[] = [], carriedItem: string | null = 'smallKnife'): SaveData {
  const character = newCharacter('Bank Tester');
  character.carriedItem = carriedItem;
  return { version: 1, bank, character, run: startRun(character, BROKEN_BELL) };
}

function memoryStorage(serialized: string): Storage {
  const values = new Map([[SAVE_KEY, serialized]]);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
}

describe('persistent bank capacity', () => {
  it('centralizes the limit and shows the current count clearly', () => {
    expect(BANK_CAPACITY).toBe(5);
    expect(bankCapacityLabel(3)).toBe('3/5');
    expect(bankCapacityMessage(3)).toBeNull();
    expect(bankCapacityMessage(5)).toContain('up to 5 items');
    expect(bankCapacityMessage(6)).toContain('Existing items are preserved');
  });

  it('accepts deposits below capacity and allows a fifth item', () => {
    const underLimit = depositCarried(stateWithBank(FIVE_ITEMS.slice(0, 3), 'ironRopeClamp'));
    expect(underLimit.bank).toEqual([...FIVE_ITEMS.slice(0, 3), 'ironRopeClamp']);
    expect(underLimit.character?.carriedItem).toBeNull();

    const fifth = depositCarried(stateWithBank(FIVE_ITEMS.slice(0, 4), 'ironRopeClamp'));
    expect(fifth.bank).toEqual([...FIVE_ITEMS.slice(0, 4), 'ironRopeClamp']);
    expect(fifth.bank).toHaveLength(BANK_CAPACITY);
    expect(fifth.character?.carriedItem).toBeNull();
  });

  it('refuses a silent sixth deposit and does not overwrite or lose either item', () => {
    const full = stateWithBank(FIVE_ITEMS, 'ironRopeClamp');
    const rejected = depositCarried(full);
    expect(rejected).toEqual(full);
    expect(rejected.bank).toEqual(FIVE_ITEMS);
    expect(rejected.character?.carriedItem).toBe('ironRopeClamp');
  });

  it('requires an explicit valid replacement and swaps both items without loss', () => {
    const full = stateWithBank(FIVE_ITEMS, 'ironRopeClamp');
    expect(depositCarried(full, 'not-in-bank')).toEqual(full);
    const swapped = depositCarried(full, 'yewCharm');
    expect(swapped.bank).toEqual(['graveCoin', 'ironRopeClamp', 'brassCandlestick', 'bronzeMaskFragment', 'boneKey']);
    expect(swapped.character?.carriedItem).toBe('yewCharm');
  });

  it('keeps full-bank adventure rewards available as carried items', () => {
    const full = stateWithBank(FIVE_ITEMS, 'travelRope');
    full.run!.status = 'success';
    full.run!.inventory.push('ironRopeClamp');
    full.run!.acquiredThisRun.push('ironRopeClamp');
    expect(eligibleCarryItems(full)).toEqual(['travelRope', 'ironRopeClamp']);
    expect(ITEMS.ironRopeClamp.carryable).toBe(true);
    const reward = finishSuccess(full, 'ironRopeClamp');
    expect(reward.character?.carriedItem).toBe('ironRopeClamp');
    expect(reward.bank).toEqual(FIVE_ITEMS);
    expect(reward.run).toBeNull();

    const keptExistingGear = finishSuccess(full, 'travelRope');
    expect(keptExistingGear.character?.carriedItem).toBe('travelRope');
    expect(keptExistingGear.bank).toEqual(FIVE_ITEMS);
  });

  it('preserves oversized legacy banks and blocks deposits until the player withdraws down to the limit', () => {
    const legacyBank = [...FIVE_ITEMS, 'ironRopeClamp'];
    const legacy = stateWithBank(legacyBank, null);
    const loaded = loadSave(memoryStorage(JSON.stringify(legacy)));
    expect(loaded.bank).toEqual(legacyBank);
    expect(bankCapacityMessage(loaded.bank.length)).toContain('6 items');

    loaded.character!.carriedItem = 'trailCompass';
    expect(depositCarried(loaded)).toEqual(loaded);
    const reduced = withdrawBanked({ ...loaded, character: { ...loaded.character!, carriedItem: null } }, 'graveCoin');
    expect(reduced.bank).toEqual(FIVE_ITEMS.slice(1).concat('ironRopeClamp'));
    expect(reduced.character?.carriedItem).toBe('graveCoin');
    expect(reduced.bank).toHaveLength(BANK_CAPACITY);
  });

  it('loads older saves at or below capacity without changing their bank contents', () => {
    const savedBank = FIVE_ITEMS.slice(0, 4);
    const legacy = stateWithBank(savedBank, null);
    const loaded = loadSave(memoryStorage(JSON.stringify(legacy)));
    expect(loaded.bank).toEqual(savedBank);
    expect(loaded.character?.carriedItem).toBeNull();
  });

  it('preserves bank contents through death, abandonment, and retirement', () => {
    const full = stateWithBank(FIVE_ITEMS, 'ironRopeClamp');
    const death = { ...full, run: { ...full.run!, status: 'death' as const } };
    expect(failCharacter(death).bank).toEqual(FIVE_ITEMS);
    expect(failCharacter(full).bank).toEqual(FIVE_ITEMS);
    expect(retireCharacter(full).bank).toEqual(FIVE_ITEMS);
  });

  it('keeps carried equipment separate from bank capacity and reports both values in QA', () => {
    const state = stateWithBank(FIVE_ITEMS, 'smallKnife');
    expect(state.bank).toHaveLength(BANK_CAPACITY);
    expect(state.character?.carriedItem).toBe('smallKnife');
    const markup = renderQaPanel(true, state, [BROKEN_BELL], ITEMS);
    expect(markup).toContain('&quot;bankCount&quot;: 5');
    expect(markup).toContain('&quot;bankCapacity&quot;: 5');
  });
});
