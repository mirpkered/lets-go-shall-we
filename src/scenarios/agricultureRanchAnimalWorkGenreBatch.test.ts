import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { AGRICULTURE_RANCH_ANIMAL_WORK_GENRE_BATCH as BATCH } from './agricultureRanchAnimalWorkGenreBatch';
import { FENCE_LINE } from './honestWorkBatch';

const fresh = (scenario: Scenario): SaveData => {
  const character = newCharacter('Rural Work Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};

describe('Gear Expansion Genre Batch 11 — Agriculture / Ranch / Animal Work', () => {
  it('registers 24 unique Adventures with valid, reachable, acyclic graphs', () => {
    expect(BATCH).toHaveLength(30);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(30);
    expect(validateScenarioRegistry(BATCH)).toEqual({ errors: [], warnings: [] });
    for (const scenario of BATCH) expect(findScenarioGraphProblems(scenario), scenario.id).toEqual([]);
  });

  it('offers continuity in every story and legitimate Gear in at least 18', () => {
    let gearRoutes = 0;
    for (const scenario of BATCH) {
      const choices = Object.values(scenario.scenes).flatMap(({ choices: sceneChoices }) => sceneChoices);
      expect(choices.some(({ effects }) => !!effects?.gainItems?.length || (effects?.money ?? 0) > 0 || !!effects?.knowledge?.length || !!effects?.lore?.length), scenario.id).toBe(true);
      if (choices.some(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) gearRoutes++;
      for (const choice of choices) for (const item of choice.effects?.gainItems ?? []) expect(ITEMS[item], `${scenario.id} grants ${item}`).toBeTruthy();
    }
    expect(gearRoutes).toBeGreaterThanOrEqual(18);
  });

  it('adds only a broadly useful, capability-limited carryable Gear item', () => {
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
    expect(ITEMS.fencingPliers).toMatchObject({ name: 'Fencing Pliers', carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.fencingPliers.description).toContain('cannot pull posts');
    expect(BATCH.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some(({ effects }) => effects?.gainItems?.includes('fencingPliers'))))).toBe(true);
  });

  it('transfers Fencing Pliers only through explicit compensation, preserving provenance and capacity rules', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-last-post-at-miller-fence')!;
    const choice = scenario.scenes.earned.choices.find(({ id }) => id === 'tool')!;
    const state = fresh(scenario);
    state.run!.sceneId = 'earned';
    const rewarded = choose(state, scenario, choice);
    expect(rewarded.run?.acquiredThisRun).toContain('fencingPliers');
    const resolved = finishRewardResolution(placeReward(openRewardResolution(rewarded), 'fencingPliers', 'carry'));
    expect(getCarriedItems(resolved.character)).toContain('fencingPliers');
    expect(resolved.itemStates?.fencingPliers?.provenance.join(' ')).toMatch(/releases|transfers/i);
    expect(BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices)).filter(({ effects }) => effects?.gainItems?.includes('fencingPliers')).every(({ requirements }) => requirements?.notOwnedItems?.includes('fencingPliers'))).toBe(true);
  });

  it('gives the new tool a meaningful existing-library callback without replacing the work', () => {
    const choice = Object.values(FENCE_LINE.scenes).flatMap(({ choices }) => choices).find(({ requirements }) => requirements?.items?.includes('fencingPliers'))!;
    expect(choice.label).toContain('wire tie');
    expect(choice.hint).toContain('cannot replace a rotten post');
  });

  it('keeps ownership, humane handling, seasonal gates, and wages explicit', () => {
    const seasonal = BATCH.filter(({ diversity }) => diversity?.availability?.season !== 'ALL_YEAR');
    expect(seasonal.map(({ diversity }) => diversity?.availability?.season).sort()).toEqual(['AUTUMN', 'AUTUMN', 'WINTER', 'WINTER']);
    expect(BATCH.find(({ id }) => id === 'the-red-lantern-in-the-pig-shed')?.scenes.lantern.choices[0].label.toLowerCase()).toContain('move the pigs');
    expect(BATCH.find(({ id }) => id === 'the-cut-wire-at-ash-pasture')?.scenes.resolved.choices.some(({ effects }) => effects?.money === 2)).toBe(true);
    expect(BATCH.some(({ id }) => id === 'the-frozen-pump-at-lower-pasture' && Object.values(BATCH.find((entry) => entry.id === id)!.scenes).some(({ choices }) => choices.some(({ effects }) => effects?.money === 1)))).toBe(true);
  });

  it('does not persist temporary farm tools or animal supplies as inventory items', () => {
    for (const id of ['farmWire', 'feedSack', 'stableLead', 'farmLantern']) expect(ITEMS[id]).toBeUndefined();
    expect(itemsOfClass('SUPPLY').map(({ id }) => id).sort()).toEqual(['coldIronNails', 'consecratedSalt', 'ritualChalk']);
  });
});
