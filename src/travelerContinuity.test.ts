import { describe, expect, it } from 'vitest';
import { choose, consumeFavor, failCharacter, grantContact, grantFavor, hasContact, hasFavor, meets, newCharacter, retireCharacter, sceneText, startRun } from './engine';
import { THE_LAST_CLEAN_APRON } from './scenarios/surpriseSocialBatch';
import { SUPPER_AT_THE_INN } from './scenarios/surpriseEverydayBatch';
import { COLD_STORAGE } from './scenarios/coldStorage';
import { loadSave, saveGame } from './storage';
import { NESSA_CONTACT, NESSA_MEAL_FAVOR, IVEN_CONTACT } from './travelerContinuity';
import type { SaveData } from './types';

function stateFor(scenario = THE_LAST_CLEAN_APRON, character = newCharacter('Continuity')): SaveData {
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, scenario) };
}

function take(state: SaveData, scenario: typeof THE_LAST_CLEAN_APRON | typeof SUPPER_AT_THE_INN, sceneId: string, choiceId: string): SaveData {
  state.run!.sceneId = sceneId;
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Missing choice ${sceneId}.${choiceId}`);
  return choose(state, scenario, choice);
}

describe('structured traveler Contacts and Favors', () => {
  it('keeps named Contact and one-use Favor distinct, idempotent, visible to requirements, and serializable', () => {
    let state = stateFor();
    state = grantContact(state, NESSA_CONTACT);
    state = grantContact(state, NESSA_CONTACT);
    state = grantFavor(state, NESSA_MEAL_FAVOR);
    state = grantFavor(state, NESSA_MEAL_FAVOR);
    expect(state.character?.contacts).toHaveLength(1);
    expect(state.character?.favors).toHaveLength(1);
    expect(hasContact(state.character, NESSA_CONTACT.id)).toBe(true);
    expect(hasFavor(state.character, NESSA_MEAL_FAVOR.id)).toBe(true);
    expect(meets({ contacts: [NESSA_CONTACT.id], favors: [NESSA_MEAL_FAVOR.id] }, state)).toBe(true);

    state = consumeFavor(state, NESSA_MEAL_FAVOR.id);
    expect(state.character?.contacts).toHaveLength(1);
    expect(state.character?.favors?.[0].status).toBe('consumed');
    expect(hasContact(state.character, NESSA_CONTACT.id)).toBe(true);
    expect(hasFavor(state.character, NESSA_MEAL_FAVOR.id)).toBe(false);
    expect(meets({ contacts: [NESSA_CONTACT.id], favors: [NESSA_MEAL_FAVOR.id] }, state)).toBe(false);
    state = grantFavor(state, NESSA_MEAL_FAVOR);
    expect(state.character?.favors?.[0].status).toBe('consumed');
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it('grants Nessa’s relationship and meal offer on the authored route, then consumes only the offer at callback', () => {
    let state = stateFor();
    state = take(state, THE_LAST_CLEAN_APRON, 'kitchen', 'askForDryCloth');
    state = take(state, THE_LAST_CLEAN_APRON, 'cupboard', 'cutSack');
    expect(state.character?.historyFlags).toContain('improvised_a_kitchen_work_cloth_from_clean_sack');
    expect(state.character?.contacts).toContainEqual(NESSA_CONTACT);
    expect(state.character?.favors).toContainEqual(NESSA_MEAL_FAVOR);
    expect(sceneText(THE_LAST_CLEAN_APRON.scenes.plating, state)).toMatch(/Nessa says to remember her offer/);

    state.run = startRun(state.character!, SUPPER_AT_THE_INN);
    expect(SUPPER_AT_THE_INN.scenes.kitchen.choices.find(({ id }) => id === 'callOnOldCourtesy')?.requirements)
      .toEqual({ contacts: [NESSA_CONTACT.id], favors: [NESSA_MEAL_FAVOR.id] });
    state = take(state, SUPPER_AT_THE_INN, 'kitchen', 'callOnOldCourtesy');
    expect(state.run?.sceneId).toBe('meal');
    expect(state.run?.message).toMatch(/Favor used/);
    expect(hasContact(state.character, NESSA_CONTACT.id)).toBe(true);
    expect(hasFavor(state.character, NESSA_MEAL_FAVOR.id)).toBe(false);
    expect(SUPPER_AT_THE_INN.scenes.meal.text).toMatch(/asks no work or debt in return/);
  });

  it('records Iven as a Contact only after a successful rescue debrief', () => {
    const character = newCharacter('Rescuer');
    const state = stateFor(COLD_STORAGE, character);
    expect(character.contacts).toEqual([]);
    expect(IVEN_CONTACT.sourceScenarioId).toBe(COLD_STORAGE.id);
    expect(COLD_STORAGE.scenes.loadingBay.textVariants?.[0].requirements?.contacts).toContain(IVEN_CONTACT.id);
    state.run!.sceneId = 'rescueDebrief';
    const decline = COLD_STORAGE.scenes.rescueDebrief.choices.find(({ id }) => id === 'declineColdStorageReward')!;
    const after = choose(state, COLD_STORAGE, decline);
    expect(after.character?.contacts).toContainEqual(IVEN_CONTACT);
  });

  it('migrates only exact legacy relationship evidence and clears traveler-bound continuity on lifecycle end', () => {
    const character = newCharacter('Old traveler');
    character.historyFlags = ['improvised_a_kitchen_work_cloth_from_clean_sack', 'was_kind_to_a_stranger'];
    const legacy = { version: 1, bank: ['graveCoin'], character: { ...character, contacts: undefined, favors: undefined }, run: null };
    const loaded = loadSave({ getItem: () => JSON.stringify(legacy) });
    expect(loaded.character?.contacts).toContainEqual(NESSA_CONTACT);
    expect(loaded.character?.favors).toContainEqual(NESSA_MEAL_FAVOR);
    expect(loaded.character?.contacts).toHaveLength(1);
    expect(loaded.bank).toEqual(['graveCoin']);
    const ended = retireCharacter(loaded);
    expect(ended.character).toBeNull();
    expect(ended.bank).toEqual(['graveCoin']);
    const abandoned = failCharacter(loaded);
    expect(abandoned.character).toBeNull();
    expect(abandoned.bank).toEqual(['graveCoin']);
  });

  it('round-trips Contacts and available/consumed Favors through the canonical save without touching the Bank', () => {
    let state = grantContact(stateFor(), NESSA_CONTACT);
    state = grantFavor(state, NESSA_MEAL_FAVOR);
    state = consumeFavor(state, NESSA_MEAL_FAVOR.id);
    let saved: string | null = null;
    saveGame(state, { setItem: (_key, value) => { saved = value; } });
    const restored = loadSave({ getItem: () => saved });
    expect(restored.character?.contacts).toContainEqual(NESSA_CONTACT);
    expect(restored.character?.favors).toContainEqual({ ...NESSA_MEAL_FAVOR, status: 'consumed' });
    expect(restored.bank).toEqual(['graveCoin']);
  });
});
