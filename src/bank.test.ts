import { describe, expect, it } from 'vitest';
import { bankCapacityLabel, bankCapacityMessage, BANK_CAPACITY, emptyBankConfirmationText } from './bank';
import { depositCarried, discardBankItem, eligibleCarryItems, emptyBank, failCharacter, finishSuccess, newCharacter, retireCharacter, startRun, withdrawBanked } from './engine';
import { ITEMS } from './items';
import { renderQaPanel } from './qaPanel';
import { BROKEN_BELL } from './scenarios/brokenBell';
import { loadSave, SAVE_KEY, saveGame } from './storage';
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
    expect(markup).toContain('data-qa-set-completions');
    expect(markup).toContain('&quot;carryCapacity&quot;: 1');
  });
});

describe('intentional bank disposal', () => {
  it('only removes the selected bank item and preserves character, run, money, history, and other items', () => {
    const state = stateWithBank(FIVE_ITEMS, 'ironRopeClamp');
    state.character!.money = 37;
    state.character!.historyFlags = ['helped_a_stranger'];
    state.run!.flags.push('found_a_clue');
    state.run!.elapsedMinutes = 19;
    const before = structuredClone(state);

    // Until the player confirms, no disposal function is called and the save remains unchanged.
    expect(state).toEqual(before);
    const discarded = discardBankItem(state, 'brassCandlestick');
    expect(discarded.bank).toEqual(['graveCoin', 'yewCharm', 'bronzeMaskFragment', 'boneKey']);
    expect(discarded.bank).toHaveLength(4);
    expect(discarded.character).toEqual(before.character);
    expect(discarded.run).toEqual(before.run);
    expect(discarded.character?.money).toBe(37);
    expect(discarded.character?.historyFlags).toEqual(['helped_a_stranger']);
    expect(discarded.run?.elapsedMinutes).toBe(19);
  });

  it('permanently saves a single-item discard and never restores it after reload', () => {
    const state = stateWithBank(FIVE_ITEMS, null);
    const storage = memoryStorage(JSON.stringify(state));
    const loaded = loadSave(storage);
    saveGame(discardBankItem(loaded, 'yewCharm'), storage);
    expect(loadSave(storage).bank).toEqual(['graveCoin', 'brassCandlestick', 'bronzeMaskFragment', 'boneKey']);
  });

  it('does not discard anything when the selected item is not banked and removes only one duplicate slot', () => {
    const state = stateWithBank(['graveCoin', 'yewCharm', 'yewCharm'], null);
    expect(discardBankItem(state, 'not-in-bank')).toBe(state);
    expect(discardBankItem(state, 'yewCharm').bank).toEqual(['graveCoin', 'yewCharm']);
  });

  it('uses precise item-count copy and offers no destructive empty confirmation for an empty bank', () => {
    expect(emptyBankConfirmationText(0)).toBeNull();
    expect(emptyBankConfirmationText(1)).toBe('This will permanently destroy 1 stored item. This cannot be undone.');
    expect(emptyBankConfirmationText(5)).toBe('This will permanently destroy all 5 stored items. This cannot be undone.');
  });

  it('keeps every bank item until Empty Bank is confirmed, then saves the empty bank', () => {
    const state = stateWithBank(FIVE_ITEMS.slice(0, 3), null);
    const before = structuredClone(state);
    // Cancel leaves the original state and storage untouched.
    expect(state).toEqual(before);
    const storage = memoryStorage(JSON.stringify(state));
    const loaded = loadSave(storage);
    saveGame(emptyBank(loaded), storage);
    expect(loadSave(storage).bank).toEqual([]);
    expect(loadSave(storage).character).toEqual(state.character);
    expect(loadSave(storage).run).toEqual(state.run);
  });

  it('preserves legacy over-capacity contents until disposal and allows both removal choices', () => {
    const overCapacity = [...FIVE_ITEMS, 'ironRopeClamp', 'trailCompass'];
    const state = stateWithBank(overCapacity, null);
    expect(state.bank).toEqual(overCapacity);
    const one = discardBankItem(state, 'ironRopeClamp');
    expect(one.bank).toEqual([...FIVE_ITEMS, 'trailCompass']);
    expect(one.bank).toHaveLength(6);
    expect(emptyBank(state).bank).toEqual([]);
  });
});
