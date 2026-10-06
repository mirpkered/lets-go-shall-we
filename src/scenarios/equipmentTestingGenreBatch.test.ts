import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS, itemsOfClass } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { EQUIPMENT_TESTING_GENRE_BATCH as BATCH } from './equipmentTestingGenreBatch';
import { THE_BROKEN_HARNESS } from './animalsBatch';
import { WILDERNESS_FIELDCRAFT_GENRE_BATCH } from './wildernessFieldcraftGenreBatch';
import { TRADES_APPRENTICESHIP_GENRE_BATCH } from './tradesApprenticeshipGenreBatch';
import { COMPETITION_GEAR_GENRE_BATCH } from './competitionGearGenreBatch';
import { EXPEDITION_LOGISTICS_GENRE_BATCH } from './expeditionLogisticsGenreBatch';

const memoryStorage = () => ({ value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } });

describe('Equipment Testing / Inventors / Field Trials batch', () => {
  it('registers 24 unique, all-year Adventures with a valid reachable graph', () => {
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(709);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(24);
    expect(BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(BATCH).errors).toEqual([]);
  });

  it('adds seven mundane, distinct and carryable tools with explicit limits', () => {
    const ids = ['fieldCalipers', 'lineTensionGauge', 'foldingBenchClamp', 'brassPlumbBob', 'telegraphLineTester', 'paddedPackSaddle', 'fieldRainGauge'];
    for (const id of ids) {
      expect(ITEMS[id], id).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
      expect(ITEMS[id].description.length).toBeGreaterThan(60);
    }
    expect(itemsOfClass('GEAR')).toHaveLength(69);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(67);
    expect(ITEMS.fieldCalipers.description).toContain('small parts');
    expect(ITEMS.lineTensionGauge.description).toContain('cannot certify an anchor');
    expect(ITEMS.foldingBenchClamp.description).toContain('not a lifting clamp');
    expect(ITEMS.brassPlumbBob.description).toContain('wind');
    expect(ITEMS.telegraphLineTester.description).toContain('cannot repair a line');
    expect(ITEMS.paddedPackSaddle.description).toContain('cannot make an excessive load humane');
    expect(ITEMS.fieldRainGauge.description).toContain('not a forecast or flood depth');
  });

  it('places each new tool through the canonical Gear reward flow within ordinary capacity', () => {
    const ids = ['fieldCalipers', 'lineTensionGauge', 'foldingBenchClamp', 'brassPlumbBob', 'telegraphLineTester', 'paddedPackSaddle', 'fieldRainGauge'];
    for (const itemId of ids) {
      const found = BATCH.flatMap((scenario) => Object.values(scenario.scenes).flatMap((scene) => scene.choices
        .filter((choice) => choice.effects?.gainItems?.includes(itemId))
        .map((choice) => ({ scenario, scene, choice })))).at(0);
      expect(found, itemId).toBeTruthy();
      const character = newCharacter(`Inventory test ${itemId}`);
      let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, found!.scenario, () => 0) };
      state.run!.sceneId = found!.scene.id;
      state = choose(state, found!.scenario, found!.choice, () => 0);
      expect(state.run?.acquiredThisRun, itemId).toContain(itemId);
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems, itemId).toContain(itemId);
      state = finishRewardResolution(placeReward(state, itemId, 'carry'));
      expect(getCarriedItems(state.character), itemId).toContain(itemId);
      expect(getCarriedItems(state.character)).toHaveLength(1);
    }
  });

  it('keeps prototype trials consequential without allowing a reading to certify unsafe equipment', () => {
    expect(BATCH.find(({ id }) => id === 'the-line-under-load')?.scenes.reading.text).toContain('anchor eye confirms it is shifting');
    expect(BATCH.find(({ id }) => id === 'the-handcart-with-the-new-wheel')?.scenes.test.text).toContain('bright line opens at the join');
    expect(BATCH.find(({ id }) => id === 'the-glass-level-disagrees')?.scenes.level.text).toContain('bubble shifts');
    expect(BATCH.find(({ id }) => id === 'the-carriage-jack-demonstration')?.scenes.lift.text).toContain('hairline bend');
  });

  it('upgrades existing owned equipment in place and persists its history through save/resume', () => {
    const ropeScenario = BATCH.find(({ id }) => id === 'the-rope-eye-retested')!;
    const character = newCharacter('Prototype Tester');
    character.carriedItem = 'travelRope';
    character.carriedItems = ['travelRope'];
    const record = { condition: 'NORMAL' as const, upgrades: [], provenance: [] };
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, itemStates: { travelRope: record }, run: startRun(character, ropeScenario, () => 0, { travelRope: record }) };
    for (const id of ['checkRope', 'finishUpgrade']) {
      const choice = ropeScenario.scenes[state.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      state = choose(state, ropeScenario, choice, () => 0);
    }
    expect(state.run?.acquiredThisRun).not.toContain('travelRope');
    expect(state.itemStates?.travelRope?.upgrades.map(({ id }) => id)).toContain('splicedEyes');
    const storage = memoryStorage();
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.itemStates?.travelRope?.upgrades.map(({ id }) => id)).toContain('splicedEyes');
    expect(getCarriedItems(state.character)).toContain('travelRope');

    const strapScenario = BATCH.find(({ id }) => id === 'the-freightmans-buckle-trial')!;
    const strapOwner = newCharacter('Strap Tester');
    strapOwner.carriedItem = 'freightmansStrap';
    strapOwner.carriedItems = ['freightmansStrap'];
    const strapRecord = { condition: 'NORMAL' as const, upgrades: [], provenance: [] };
    let strap: SaveData = { ...structuredClone(EMPTY_SAVE), character: strapOwner, itemStates: { freightmansStrap: strapRecord }, run: startRun(strapOwner, strapScenario, () => 0, { freightmansStrap: strapRecord }) };
    for (const id of ['inspectSeam', 'accept']) {
      const choice = strapScenario.scenes[strap.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      strap = choose(strap, strapScenario, choice, () => 0);
    }
    expect(strap.itemStates?.freightmansStrap?.upgrades.map(({ id }) => id)).toContain('stitchedBuckle');
    expect(getCarriedItems(strap.character)).toContain('freightmansStrap');
  });

  it('uses new tools in established stories and in later field trials', () => {
    expect(TRADES_APPRENTICESHIP_GENRE_BATCH.find(({ id }) => id === 'the-line-that-would-not-hold')?.scenes.signal.choices.some(({ requirements }) => requirements?.items?.includes('telegraphLineTester'))).toBe(true);
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-camp-below-the-cut')?.scenes.runoff.choices.some(({ requirements }) => requirements?.items?.includes('fieldRainGauge'))).toBe(true);
    expect(COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-seven-inch-square')?.scenes.measure.choices.some(({ requirements }) => requirements?.items?.includes('fieldCalipers'))).toBe(true);
    expect(BATCH.find(({ id }) => id === 'the-test-in-the-windbreak')?.scenes.strain.choices.some(({ requirements }) => requirements?.items?.includes('lineTensionGauge'))).toBe(true);
    expect(BATCH.find(({ id }) => id === 'the-saddle-pad-in-the-rain')?.scenes.pad.choices.some(({ requirements }) => requirements?.items?.includes('paddedPackSaddle'))).toBe(true);
    expect(EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'weighed-before-dawn')?.scenes.ridge.choices.some(({ requirements }) => requirements?.items?.includes('lineTensionGauge'))).toBe(true);
  });

  it('keeps persistent rewards catalog-backed and records an explicit transfer source', () => {
    const grants = BATCH.flatMap((scenario) => Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap((choice) => (choice.effects?.gainItems ?? []).map((item) => ({ scenario, scene, choice, item })))));
    expect(grants.length).toBeGreaterThan(10);
    for (const { scenario, scene, choice, item } of grants) {
      expect(ITEMS[item], `${scenario.id}.${scene.id}.${choice.id}`).toBeTruthy();
      expect(choice.effects?.gainItemProvenance?.[item]?.length).toBeGreaterThan(12);
    }
  });
});
