import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { RIVER_WATER_WORK_GENRE_BATCH as BATCH } from './riverWaterWorkGenreBatch';
import { THE_MISSING_BOAT } from './missingBoat';
import { TAKING_ON_WATER } from './takingOnWater';

const fresh = (scenario: Scenario): SaveData => {
  const character = newCharacter('River Work Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};
const chooseAt = (state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData => {
  const scene = scenario.scenes[sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${sceneId} requirements`).toBe(true);
  state.run!.sceneId = sceneId;
  return choose(state, scenario, choice!);
};

describe('Gear Expansion Genre Batch 10 — River / Ferry / Water Work', () => {
  it('registers 24 stable all-year Adventures with valid, reachable, acyclic graphs', () => {
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(24);
    expect(BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(BATCH)).toEqual({ errors: [], warnings: [] });
    for (const scenario of BATCH) {
      expect(findScenarioGraphProblems(scenario), scenario.id).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const choice of scene.choices) {
          for (const itemId of choice.effects?.gainItems ?? []) expect(ITEMS[itemId], `${scenario.id} grants ${itemId}`).toBeTruthy();
        }
      }
    }
  });

  it('makes every story leave meaningful continuity and gives most a legitimate Gear path', () => {
    let gearRoutes = 0;
    for (const scenario of BATCH) {
      const choices = Object.values(scenario.scenes).flatMap(({ choices: sceneChoices }) => sceneChoices);
      expect(choices.some(({ effects }) => !!effects?.gainItems?.length || (effects?.money ?? 0) > 0 || !!effects?.knowledge?.length || !!effects?.lore?.length), scenario.title).toBe(true);
      if (choices.some(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) gearRoutes += 1;
    }
    expect(gearRoutes).toBeGreaterThanOrEqual(18);
  });

  it('adds three ordinary, useful, capability-limited Gear items', () => {
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
    expect(ITEMS.boatHook).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.boatHook.description).toContain('cannot anchor a vessel');
    expect(ITEMS.foldingBailer.description).toContain('cannot keep up with a leak');
    expect(ITEMS.waterproofLedgerTube.description).toContain('not guaranteed watertight if submerged');
    for (const id of ['boatHook', 'foldingBailer', 'waterproofLedgerTube']) {
      expect(BATCH.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some(({ effects }) => effects?.gainItems?.includes(id)))), id).toBe(true);
    }
  });

  it('places every new item through canonical Gear rewards and preserves provenance', () => {
    const ids = ['boatHook', 'foldingBailer', 'waterproofLedgerTube'];
    for (const itemId of ids) {
      const found = BATCH.flatMap((scenario) => Object.values(scenario.scenes).flatMap((scene) => scene.choices
        .filter((choice) => choice.effects?.gainItems?.includes(itemId)).map((choice) => ({ scenario, scene, choice })))).at(0)!;
      let state = fresh(found.scenario);
      state.run!.sceneId = found.scene.id;
      state = choose(state, found.scenario, found.choice);
      expect(state.run?.acquiredThisRun).toContain(itemId);
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems).toContain(itemId);
      state = finishRewardResolution(placeReward(state, itemId, 'carry'));
      expect(getCarriedItems(state.character)).toContain(itemId);
      expect(state.itemStates?.[itemId]?.provenance.join(' ')).toMatch(/Traveler|gives|releases|gifts/i);
    }
  });

  it('keeps water danger grounded and provides land-based alternatives', () => {
    const ford = BATCH.find(({ id }) => id === 'the-ford-with-the-white-stone')!;
    expect(ford.scenes.ford.text).toContain('brown water moving faster through the middle');
    expect(ford.scenes.stop.text).toContain('crew checks the downstream gravel bar');
    const skiff = BATCH.find(({ id }) => id === 'the-skiff-that-took-water')!;
    expect(skiff.scenes.stop.text).toContain('pushing off would place the loaded boat in the current');
    const flood = BATCH.find(({ id }) => id === 'the-case-on-the-flood-step')!;
    expect(flood.scenes.records.choices.find(({ id }) => id === 'tube')?.requirements).toEqual({ items: ['waterproofLedgerTube'] });
    expect(flood.scenes.tubeUsed.text).toContain('not trusted underwater');
  });

  it('adds capability-specific callbacks to earlier boat and water stories', () => {
    const hook = THE_MISSING_BOAT.scenes.ferryHelp.choices.find(({ id }) => id === 'catchPuntLineWithHook')!;
    expect(hook.requirements).toEqual({ items: ['boatHook'] });
    expect(hook.hint).toContain('cannot span the channel');
    const bailer = TAKING_ON_WATER.scenes.waterMoved.choices.find(({ id }) => id === 'bailWithFoldingBailer')!;
    expect(bailer.requirements).toEqual({ items: ['foldingBailer'] });
    const state = fresh(TAKING_ON_WATER);
    expect(meets(bailer.requirements, state)).toBe(false);
    state.run!.inventory.push('foldingBailer');
    expect(meets(bailer.requirements, state)).toBe(true);
  });

  it('uses the Waterproof Ledger Tube to keep a working copy readable without opening cargo', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-wet-manifest-at-east-wharf')!;
    const choice = scenario.scenes.manifest.choices.find(({ id }) => id === 'tube')!;
    let state = fresh(scenario);
    state.run!.inventory.push('waterproofLedgerTube');
    expect(meets(choice.requirements, state)).toBe(true);
    state = chooseAt(state, scenario, 'manifest', 'tube');
    expect(state.character?.historyFlags).toContain('used_ledger_tube_to_protect_wet_manifest');
    expect(scenario.scenes.claim.textVariants?.[0].text).toContain('remained readable');
    expect(scenario.scenes.manifest.choices.find(({ id }) => id === 'open')?.next).toBe('stop');
  });

  it('does not turn boat hooks, bailing, or a tube into a universal water solution', () => {
    expect(ITEMS.boatHook.description).toContain('strong current');
    expect(ITEMS.foldingBailer.description).toContain('overloaded craft');
    expect(ITEMS.waterproofLedgerTube.description).toContain('submerged');
    const gearChoices = BATCH.flatMap((scenario) => Object.values(scenario.scenes).flatMap(({ choices }) => choices))
      .filter(({ requirements }) => requirements?.items?.some((id) => ['boatHook', 'foldingBailer', 'waterproofLedgerTube'].includes(id)));
    expect(gearChoices.length).toBeGreaterThanOrEqual(6);
  });
});
