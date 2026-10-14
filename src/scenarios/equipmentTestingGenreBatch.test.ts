import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS, itemsOfClass } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { EQUIPMENT_TESTING_EDITORIAL_DRAFT as AUTHORED, EQUIPMENT_TESTING_GENRE_BATCH as BATCH, EQUIPMENT_TESTING_NARRATED_FEES } from './equipmentTestingGenreBatch';
import { THE_BROKEN_HARNESS } from './animalsBatch';
import { WILDERNESS_FIELDCRAFT_GENRE_BATCH } from './wildernessFieldcraftGenreBatch';
import { TRADES_APPRENTICESHIP_GENRE_BATCH } from './tradesApprenticeshipGenreBatch';
import { COMPETITION_GEAR_GENRE_BATCH } from './competitionGearGenreBatch';
import { EXPEDITION_LOGISTICS_GENRE_BATCH } from './expeditionLogisticsGenreBatch';

const memoryStorage = () => ({ value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } });

describe('Equipment Testing / Inventors / Field Trials batch', () => {
  it('does not narrate a clamp when the printer chose the wooden wedge', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-clamp-beneath-the-press')!;
    const character = newCharacter('Press Test');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    state.run!.sceneId = 'press';
    const wedge = scenario.scenes.press.choices.find(({ id }) => id === 'useWedge')!;
    const result = choose(state, scenario, wedge, () => 0);
    expect(result.run?.sceneId).toBe('proof');
    expect(scenario.scenes.proof.text).not.toMatch(/clamp holds/i);
  });

  it('registers 24 unique, all-year Adventures with a valid reachable graph', () => {
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(24);
    expect(BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(BATCH).errors).toEqual([]);
    for (const id of ['the-tester-who-left-the-shop', 'the-rain-cup-at-the-bridge', 'the-caliper-for-the-new-buckle', 'the-square-that-lied-on-the-ramp', 'the-quiet-gauge-at-the-river-gate']) {
      expect(AUTHORED.some(({ id: authoredId }) => authoredId === id), `${id} remains in the authoring draft`).toBe(true);
      expect(SCENARIOS.some(({ id: registeredId }) => registeredId === id), `${id} is not added to the 861-Adventure registry`).toBe(false);
    }
  });

  it('does not compare two rainfall sites until both cups have been placed', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-rain-cup-at-mill-run')!;
    const character = newCharacter('Rain Cup Route Test');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };

    let oneSite = choose(initial, scenario, scenario.scenes.cup.choices.find(({ id }) => id === 'upperOnly')!);
    expect(oneSite.run?.sceneId).toBe('upperReading');
    expect(scenario.scenes.upperReading.text).toMatch(/records rainfall at that stake only/i);
    expect(scenario.scenes.upperReading.text).not.toMatch(/pasture cup shows more rain|both sites were recorded/i);

    const singleReading = choose(oneSite, scenario, scenario.scenes.upperReading.choices.find(({ id }) => id === 'keepSingleReading')!);
    expect(singleReading.run?.sceneId).toBe('singleReading');
    expect(scenario.scenes.singleReading.text).toMatch(/mill-yard comparison remains unknown/i);

    const completedComparison = choose(oneSite, scenario, scenario.scenes.upperReading.choices.find(({ id }) => id === 'placeMillCup')!);
    expect(completedComparison.run?.sceneId).toBe('result');
    expect(scenario.scenes.result.text).toMatch(/pasture cup shows more rain/i);

    const bothSites = choose(initial, scenario, scenario.scenes.cup.choices.find(({ id }) => id === 'placeBoth')!);
    expect(bothSites.run?.sceneId).toBe('result');
    expect(scenario.scenes.result.text).toMatch(/pasture cup shows more rain/i);
  });

  it('keeps rim inspection separate from testing the altered spoke key', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-new-spoke-key')!;
    const character = newCharacter('Spoke Key Route Test');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };

    const inspect = choose(initial, scenario, scenario.scenes.wheel.choices.find(({ id }) => id === 'inspectRim')!);
    expect(inspect.run?.sceneId).toBe('rimInspection');
    expect(scenario.scenes.rimInspection.text).not.toMatch(/jaw fits|bright burr|soft tooth/i);

    const defer = choose(inspect, scenario, scenario.scenes.rimInspection.choices.find(({ id }) => id === 'deferTest')!);
    expect(defer.run?.sceneId).toBe('unverified');
    expect(scenario.scenes.unverified.text).toMatch(/altered key has not been tested/i);

    const testAfterInspecting = choose(inspect, scenario, scenario.scenes.rimInspection.choices.find(({ id }) => id === 'testAfterInspection')!);
    expect(testAfterInspecting.run?.sceneId).toBe('result');
    expect(scenario.scenes.result.text).toMatch(/jaw fits the spare nipple/i);

    const testFirst = choose(initial, scenario, scenario.scenes.wheel.choices.find(({ id }) => id === 'testSpare')!);
    expect(testFirst.run?.sceneId).toBe('result');
    expect(scenario.scenes.result.text).toMatch(/bright burr shows one tooth is too soft/i);
  });

  it('adds seven mundane, distinct and carryable tools with explicit limits', () => {
    const ids = ['fieldCalipers', 'lineTensionGauge', 'foldingBenchClamp', 'brassPlumbBob', 'telegraphLineTester', 'paddedPackSaddle', 'fieldRainGauge'];
    for (const id of ids) {
      expect(ITEMS[id], id).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
      expect(ITEMS[id].description.length).toBeGreaterThan(60);
    }
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
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

  it('keeps lessons demonstrated in completed field tests independent of the compensation selected', () => {
    const testedSettlements = [
      ['the-line-under-load', 'result', 'lesson'],
      ['the-caliper-at-the-siding', 'offer', 'learn'],
      ['the-needle-at-the-north-station', 'offer', 'lesson'],
      ['the-saddle-that-sat-crooked', 'result', 'lesson'],
      ['the-rain-cup-at-mill-run', 'offer', 'learn'],
      ['the-carriage-jack-demonstration', 'result', 'lesson'],
      ['the-glass-level-disagrees', 'paid', 'knowledge'],
      ['the-handcart-with-the-new-wheel', 'safe', 'knowledge'],
      ['the-rope-that-frayed-in-the-sleeve', 'result', 'lesson'],
    ] as const;
    for (const [scenarioId, sceneId, learningChoiceId] of testedSettlements) {
      const scenario = AUTHORED.find(({ id }) => id === scenarioId)!;
      expect(scenario, scenarioId).toBeDefined();
      const choices = scenario.scenes[sceneId].choices;
      const learned = choices.find(({ id }) => id === learningChoiceId)?.effects?.knowledge;
      expect(learned?.length, `${scenarioId} declares the tested lesson`).toBeGreaterThan(0);
      for (const choice of choices) {
        expect(choice.effects?.knowledge, `${scenarioId}.${choice.id}`).toEqual(learned);
      }
      expect(choices.find(({ id }) => id === learningChoiceId)?.label).toBe('Decline material compensation');
    }

    const line = BATCH.find(({ id }) => id === 'the-line-under-load')!;
    const character = newCharacter('Field Trial Tester');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, line, () => 0) };
    for (const choiceId of ['lowTest', 'stopAndReset']) {
      const choice = line.scenes[state.run!.sceneId].choices.find(({ id }) => id === choiceId)!;
      state = choose(state, line, choice);
    }
    const lesson = line.scenes.result.choices.find(({ id }) => id === 'lesson')!.effects!.knowledge![0];
    const coinChoice = line.scenes.result.choices.find(({ id }) => id === 'coins')!;
    const coinState = choose(state, line, coinChoice);
    expect(coinState.character?.money).toBe(2);
    expect(coinState.character?.knowledge).toContain(lesson);

    const gearChoice = line.scenes.result.choices.find(({ id }) => id === 'keep')!;
    const gearState = choose(state, line, gearChoice);
    expect(gearState.run?.acquiredThisRun).toContain('lineTensionGauge');
    expect(gearState.character?.knowledge).toContain(lesson);

    const noPaymentChoice = line.scenes.result.choices.find(({ id }) => id === 'lesson')!;
    const noPaymentState = choose(state, line, noPaymentChoice);
    expect(noPaymentState.character?.money).toBe(0);
    expect(noPaymentState.character?.knowledge).toContain(lesson);
    expect(noPaymentState.character?.knowledge?.filter((entry) => entry === lesson)).toHaveLength(1);
  });

  it('does not grant a test lesson when the Traveler refuses before the test, or turn optional instruction into automatic Knowledge', () => {
    const line = BATCH.find(({ id }) => id === 'the-line-under-load')!;
    const character = newCharacter('Early Withdrawal Tester');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, line, () => 0) };
    const refuse = line.scenes.brief.choices.find(({ id }) => id === 'refuseHigh')!;
    const stopped = choose(initial, line, refuse);
    expect(stopped.character?.knowledge).not.toContain(line.scenes.result.choices.find(({ id }) => id === 'lesson')!.effects!.knowledge![0]);

    const plumb = BATCH.find(({ id }) => id === 'the-plumb-bob-in-the-barn')!;
    expect(plumb.scenes.safe.choices.find(({ id }) => id === 'coin')?.effects?.knowledge).toBeUndefined();
    expect(plumb.scenes.safe.choices.find(({ id }) => id === 'lesson')?.effects?.knowledge).toHaveLength(1);
  });

  it('records completed Equipment Testing findings before settlement and keeps them across every material choice', () => {
    const routes = [
      ['the-telegraph-tester-in-the-storm', ['testBothEnds', 'temporary'], 'offer', 'A continuity test during calm weather does not clear a line that fails under wind; record conditions and repeat after movement.'],
      ['the-tester-who-left-the-shop', ['checkSlate', 'returnAndRecord'], 'offer', 'Instrument sign-out needs a return entry as well as an issue entry; a missing slot does not by itself prove theft.'],
      ['the-rain-cup-at-the-bridge', ['observeStream', 'divert'], 'result', 'A sheltered rain reading can differ from an exposed slope; inspect upstream runoff and the structure directly before reopening a crossing.'],
      ['the-caliper-for-the-new-buckle', ['useRule', 'markAndReplace'], 'offer', 'A buckle pin must fit sound leather; a narrower pin cannot restore a worn or split loop.'],
      ['the-square-that-lied-on-the-ramp', ['dryFrame', 'planeBoard'], 'offer', 'Reverse a square on a known straight edge before correcting a wet or warped frame; reference surfaces can be the source of an apparent error.'],
      ['the-quiet-gauge-at-the-river-gate', ['checkGate', 'keepRecord'], 'offer', 'A low local rain reading does not explain a rising millrace by itself; inspect upstream flow and the outlet for obstructions.'],
    ] as const;
    const chooseId = (state: SaveData, scenario: (typeof AUTHORED)[number], id: string) => {
      const currentScene = scenario.scenes[state.run!.sceneId];
      const choice = currentScene.choices.find(({ id: choiceId }) => choiceId === id);
      expect(choice, `${scenario.id}.${currentScene.id}.${id}`).toBeDefined();
      return choose(state, scenario, choice!, () => 0);
    };

    for (const [scenarioId, route, settlementId, fact] of routes) {
      const scenario = AUTHORED.find(({ id }) => id === scenarioId)!;
      expect(scenario, scenarioId).toBeDefined();
      const character = newCharacter(`RC04 ${scenarioId}`);
      if (scenarioId === 'the-telegraph-tester-in-the-storm') {
        character.carriedItem = 'telegraphLineTester';
        character.carriedItems = ['telegraphLineTester'];
      }
      let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
      for (const choiceId of route) state = chooseId(state, scenario, choiceId);
      expect(state.character?.knowledge, `${scenarioId} earns its finding before settlement`).toContain(fact);

      const settlement = scenario.scenes[settlementId];
      expect(settlement.choices.every(({ effects }) => effects?.knowledge?.includes(fact)), `${scenarioId} legacy settlement choices preserve proven learning`).toBe(true);
      for (const choice of settlement.choices) {
        const outcome = choose(state, scenario, choice, () => 0);
        expect(outcome.character?.knowledge, `${scenarioId}.${choice.id}`).toContain(fact);
        const storage = memoryStorage();
        saveGame(outcome, storage as never);
        const restored = loadSave(storage as never);
        expect(restored.character?.knowledge, `${scenarioId}.${choice.id} reload`).toContain(fact);
        expect(restored.character?.knowledge?.filter((entry) => entry === fact)).toHaveLength(1);
      }
    }
  });

  it('does not grant these findings on routes that stop before the relevant test or discovery', () => {
    const earlyExits = [
      ['the-telegraph-tester-in-the-storm', 'climbNow', 'A continuity test during calm weather does not clear a line that fails under wind; record conditions and repeat after movement.'],
      ['the-tester-who-left-the-shop', 'accuseLast', 'Instrument sign-out needs a return entry as well as an issue entry; a missing slot does not by itself prove theft.'],
      ['the-rain-cup-at-the-bridge', 'openDeck', 'A sheltered rain reading can differ from an exposed slope; inspect upstream runoff and the structure directly before reopening a crossing.'],
      ['the-caliper-for-the-new-buckle', 'forceLoop', 'A buckle pin must fit sound leather; a narrower pin cannot restore a worn or split loop.'],
      ['the-square-that-lied-on-the-ramp', 'cutFrame', 'Reverse a square on a known straight edge before correcting a wet or warped frame; reference surfaces can be the source of an apparent error.'],
      ['the-quiet-gauge-at-the-river-gate', 'openSluice', 'A low local rain reading does not explain a rising millrace by itself; inspect upstream flow and the outlet for obstructions.'],
    ] as const;
    for (const [scenarioId, choiceId, fact] of earlyExits) {
      const scenario = AUTHORED.find(({ id }) => id === scenarioId)!;
      const character = newCharacter(`Early exit ${scenarioId}`);
      const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
      const choice = scenario.scenes[initial.run!.sceneId].choices.find(({ id }) => id === choiceId)!;
      const result = choose(initial, scenario, choice, () => 0);
      expect(result.character?.knowledge, `${scenarioId}.${choiceId}`).not.toContain(fact);
    }
  });

  it('offers Nell’s plumb-reading lesson as explicit deferred teaching, not as knowledge already retained', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-plumb-bob-in-the-barn')!;
    const settlement = scenario.scenes.safe;
    expect(settlement.text).toContain('says she can show you how to get a true plumb reading');
    const coin = settlement.choices.find(({ id }) => id === 'coin')!;
    const teaching = settlement.choices.find(({ id }) => id === 'lesson')!;
    expect(coin.effects?.knowledge).toBeUndefined();
    expect(teaching.label).toContain('let Nell show you the method');
    expect(teaching.effects?.knowledge).toHaveLength(1);
  });

  it('keeps The Glass Level Disagrees as the healthy compensation reference', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-glass-level-disagrees')!;
    const paid = scenario.scenes.paid;
    const learning = paid.choices.find(({ id }) => id === 'knowledge')!;
    expect(learning.label).toBe('Decline material compensation');
    for (const choice of paid.choices) expect(choice.effects?.knowledge).toEqual(learning.effects?.knowledge);
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

  it('grants each audited one-coin partial test fee on the qualifying route only', () => {
    for (const [scenarioId, endings] of Object.entries(EQUIPMENT_TESTING_NARRATED_FEES)) {
      const scenario = BATCH.find(({ id }) => id === scenarioId)!;
      for (const [endingId, amount] of Object.entries(endings)) {
        const incoming = Object.values(scenario.scenes).flatMap((scene) => scene.choices
          .filter(({ next }) => next === endingId).map((choice) => ({ scene, choice })));
        expect(incoming.length, `${scenarioId}.${endingId}`).toBeGreaterThan(0);
        for (const { scene, choice } of incoming) {
          expect(choice.effects?.money).toBe(amount);
          const character = newCharacter('Partial Test Wage');
          const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
          state.run!.sceneId = scene.id;
          expect(choose(state, scenario, choice, () => 0).character?.money).toBe(amount);
        }
      }
    }
    expect(Object.keys(EQUIPMENT_TESTING_NARRATED_FEES)).toHaveLength(6);
  });
});
