import { describe, expect, it } from 'vitest';
import { ITEMS } from '../items';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { ESCORT_PROTECTION_GENRE_BATCH } from './escortProtectionGenreBatch';

function destinations(scenario: (typeof ESCORT_PROTECTION_GENRE_BATCH)[number], sceneId: string): string[] {
  const scene = scenario.scenes[sceneId];
  return scene.choices.flatMap((choice) => [
    ...(choice.next ? [choice.next] : []),
    ...(choice.effects?.combat ? [choice.effects.combat.winNext, choice.effects.combat.lossNext] : []),
    ...(choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : []),
  ]).filter((id): id is string => Boolean(id));
}

describe('Escort / Protection genre batch', () => {
  it('registers thirty unique all-year Adventures with valid forward destinations', () => {
    expect(ESCORT_PROTECTION_GENRE_BATCH).toHaveLength(30);
    expect(SCENARIOS).toHaveLength(541);
    expect(new Set(ESCORT_PROTECTION_GENRE_BATCH.map(({ id }) => id)).size).toBe(30);
    expect(ESCORT_PROTECTION_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ESCORT_PROTECTION_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ESCORT_PROTECTION_GENRE_BATCH).warnings).toEqual([]);
    expect(ESCORT_PROTECTION_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(8);
    for (const scenario of ESCORT_PROTECTION_GENRE_BATCH) {
      const seen = new Set<string>();
      const active = new Set<string>();
      const visit = (id: string) => {
        expect(scenario.scenes[id], `${scenario.id}.${id} exists`).toBeTruthy();
        if (active.has(id)) throw new Error(`${scenario.id} contains a cycle at ${id}`);
        if (seen.has(id)) return;
        active.add(id); seen.add(id);
        const scene = scenario.scenes[id];
        expect(Boolean(scene.ending || scene.choices.length > 0), `${scenario.id}.${id} is actionable or terminal`).toBe(true);
        for (const target of destinations(scenario, id)) visit(target);
        active.delete(id);
      };
      visit(scenario.startScene);
      expect([...seen].sort(), scenario.id).toEqual(Object.keys(scenario.scenes).sort());
    }
  });

  it('keeps all authored Gear references valid and gives the stretcher grounded rescue uses', () => {
    for (const scenario of ESCORT_PROTECTION_GENRE_BATCH) {
      for (const scene of Object.values(scenario.scenes)) {
        for (const option of scene.choices) {
          for (const id of option.requirements?.items ?? []) expect(ITEMS[id], `${scenario.id}.${option.id}:${id}`).toBeTruthy();
        }
      }
    }
    expect(ITEMS.foldingFieldStretcher.inventoryClass).toBe('GEAR');
    const batchIds = new Set(ESCORT_PROTECTION_GENRE_BATCH.map(({ id }) => id));
    const callbackCount = SCENARIOS.filter(({ id }) => !batchIds.has(id)).flatMap(({ scenes }) => Object.values(scenes)
      .flatMap((scene) => scene.choices.filter(({ requirements }) => requirements?.items?.includes('foldingFieldStretcher')))).length;
    expect(callbackCount).toBeGreaterThanOrEqual(2);
  });

  it('transfers the crew stretcher only after the traveler accepts it as a retired spare', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-lumber-crew-at-the-gully')!;
    const character = newCharacter('Stretcher Tester');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const borrow = scenario.scenes.gully.choices.find(({ id }) => id === 'crewStretcher')!;
    state = choose(state, scenario, borrow, () => 0);
    expect(state.run?.sceneId).toBe('rescue');
    expect(getCarriedItems(state.character)).not.toContain('foldingFieldStretcher');
    const accept = scenario.scenes.rescue.choices.find(({ id }) => id === 'acceptCrewStretcher')!;
    state = choose(state, scenario, accept, () => 0);
    expect(state.run?.sceneId).toBe('workerSafe');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldStretcher');
    state = finishRewardResolution(placeReward(state, 'foldingFieldStretcher', 'carry'));
    expect(getCarriedItems(state.character)).toContain('foldingFieldStretcher');
    expect(state.character?.historyFlags).toContain('received_folding_field_stretcher_from_lumber_crew');
  });

  it('does not rewrite confidential cargo contents into player knowledge', () => {
    const courier = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-courier-relay-box')!;
    expect(courier.scenes.handoff.text).toContain('not carry it onward');
    expect(courier.scenes.stable.text).not.toMatch(/the letter says|the document reveals/i);
    expect(courier.scenes.breach.text).toContain('refuses to break');
  });
});
