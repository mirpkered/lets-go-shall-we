import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { RIVER_WATER_WORK_GENRE_BATCH as BATCH, RIVER_WATER_WORK_NARRATED_FEES } from './riverWaterWorkGenreBatch';
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
    expect(SCENARIOS).toHaveLength(861);
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

  it('limits the fresh millrace trend to the route that watches it and keeps a neutral stop result', () => {
    const mill = BATCH.find(({ id }) => id === 'the-flood-mark-on-the-mill-door')!;

    let moved = chooseAt(fresh(mill), mill, 'mark', 'move');
    const movedGate = sceneText(mill.scenes.gate, moved);
    expect(movedGate).toMatch(/millrace trend has not been established/i);
    expect(movedGate).not.toMatch(/reeds gather|water creep higher/i);
    moved = chooseAt(moved, mill, 'gate', 'clear');
    expect(moved.run?.sceneId).toBe('paid');
    expect(sceneText(mill.scenes.paid, moved)).toMatch(/grate is cleared and the water level eases/i);

    let observed = chooseAt(fresh(mill), mill, 'mark', 'observe');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(observed, storage as never);
    observed = loadSave(storage as never);
    expect(observed.run?.flags).toContain('mill_gate_watched');
    expect(sceneText(mill.scenes.gate, observed)).toMatch(/reeds gather.*millrace water creep higher/i);
    observed = chooseAt(observed, mill, 'gate', 'shut');
    expect(observed.run?.sceneId).toBe('partial');
    expect(sceneText(mill.scenes.partial, observed)).not.toMatch(/flour stays on the upper floor/i);
    expect(sceneText(mill.scenes.partial, observed)).toMatch(/loading does not resume here/i);
  });

  it('does not credit a rope replacement route with a splice inspection', () => {
    const rope = BATCH.find(({ id }) => id === 'the-wet-rope-at-dawn')!;
    let replacement = chooseAt(fresh(rope), rope, 'rope', 'replace');
    expect(replacement.run?.sceneId).toBe('paid');
    expect(sceneText(rope.scenes.paid, replacement)).toMatch(/taking the suspect line out of passenger service/i);
    expect(sceneText(rope.scenes.paid, replacement)).not.toMatch(/for the inspection|fibers catch at the splice/i);

    let inspected = chooseAt(fresh(rope), rope, 'rope', 'inspect');
    expect(inspected.run?.sceneId).toBe('choice');
    expect(sceneText(rope.scenes.choice, inspected)).toMatch(/fibers catch at the splice/i);
    inspected = chooseAt(inspected, rope, 'choice', 'retire');
    expect(inspected.run?.sceneId).toBe('paid');
    expect(sceneText(rope.scenes.paid, inspected)).toMatch(/taking the suspect line out of passenger service/i);
  });

  it('keeps the old-mark obstruction general and gates the timber identification on probing', () => {
    const bridge = BATCH.find(({ id }) => id === 'the-mark-below-the-waterline')!;
    let marked = chooseAt(fresh(bridge), bridge, 'bridge', 'mark');
    const general = sceneText(bridge.scenes.hazard, marked);
    expect(general).toMatch(/obstruction near the lower approach/i);
    expect(general).not.toMatch(/broken timber|near arch|current slackens/i);
    marked = chooseAt(marked, bridge, 'hazard', 'close');
    expect(sceneText(bridge.scenes.paid, marked)).toMatch(/lower-approach obstruction/i);
    marked = chooseAt(marked, bridge, 'paid', 'coin');
    expect(sceneText(bridge.scenes.done, marked)).not.toMatch(/timber/i);

    const probedStart = fresh(bridge);
    probedStart.run!.inventory.push('collapsibleSoundingRod');
    let probed = chooseAt(probedStart, bridge, 'bridge', 'probe');
    expect(probed.run?.flags).toContain('bridge_timber_probed');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(probed, storage as never);
    probed = loadSave(storage as never);
    expect(sceneText(bridge.scenes.hazard, probed)).toMatch(/usable rod catches a broken timber just below the near arch/i);
    probed = chooseAt(probed, bridge, 'hazard', 'close');
    expect(sceneText(bridge.scenes.paid, probed)).toMatch(/lower-approach obstruction/i);
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
    expect(flood.scenes.records.choices.find(({ id }) => id === 'tube')?.requirements).toEqual({ items: ['waterproofLedgerTube'], usableItems: ['waterproofLedgerTube'] });
    expect(flood.scenes.tubeUsed.text).toContain('not trusted underwater');
  });

  it('does not claim a far-bank response on the Boat Hook route', () => {
    const ferry = BATCH.find(({ id }) => id === 'the-ferry-that-would-not-turn')!;

    let signaled = fresh(ferry);
    signaled = chooseAt(signaled, ferry, 'ferry', 'signal');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(signaled, storage as never);
    signaled = loadSave(storage as never);
    const responseText = sceneText(ferry.scenes.slack, signaled);
    expect(signaled.run?.flags).toContain('pine_ferry_far_bank_signaled');
    expect(responseText).toMatch(/far-bank operator answers and slacks the upper line/i);
    expect(ferry.scenes.slack.text).not.toMatch(/far-bank operator answers|current relaxes/i);

    let hooked = fresh(ferry);
    hooked.run!.inventory.push('boatHook');
    hooked = chooseAt(hooked, ferry, 'ferry', 'hook');
    const hookText = sceneText(ferry.scenes.slack, hooked);
    expect(hookText).not.toMatch(/far-bank operator answers|slacks the upper line|current relaxes/i);
    expect(hookText).toMatch(/ferry remains held at the near bank/i);
    expect(ferry.scenes.slack.choices.find(({ id }) => id === 'clear')?.label).toBe('Clear the snag from the bank');

    const legacy = fresh(ferry);
    legacy.run!.sceneId = 'slack';
    const legacyText = sceneText(ferry.scenes.slack, legacy);
    expect(legacyText).toMatch(/ferry remains held at the near bank/i);
    expect(legacyText).not.toMatch(/far-bank operator answers|slacks the upper line/i);
  });

  it('adds capability-specific callbacks to earlier boat and water stories', () => {
    const hook = THE_MISSING_BOAT.scenes.ferryHelp.choices.find(({ id }) => id === 'catchPuntLineWithHook')!;
    expect(hook.requirements).toEqual({ items: ['boatHook'], usableItems: ['boatHook'] });
    expect(hook.hint).toContain('cannot span the channel');
    const bailer = TAKING_ON_WATER.scenes.waterMoved.choices.find(({ id }) => id === 'bailWithFoldingBailer')!;
    expect(bailer.requirements).toEqual({ items: ['foldingBailer'], usableItems: ['foldingBailer'] });
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

  it('grants all audited one-coin river closure fees on their qualifying transitions', () => {
    let routeCount = 0;
    for (const [scenarioId, endings] of Object.entries(RIVER_WATER_WORK_NARRATED_FEES)) {
      const scenario = BATCH.find(({ id }) => id === scenarioId)!;
      for (const [endingId, amount] of Object.entries(endings)) {
        const incoming = Object.values(scenario.scenes).flatMap((scene) => scene.choices
          .filter(({ next }) => next === endingId).map((choice) => ({ scene, choice })));
        expect(incoming.length, `${scenarioId}.${endingId}`).toBeGreaterThan(0);
        for (const { scene, choice } of incoming) {
          routeCount++;
          expect(choice.effects?.money).toBe(amount);
          const state = fresh(scenario);
          state.run!.sceneId = scene.id;
          expect(choose(state, scenario, choice, () => 0).character?.money).toBe(amount);
        }
      }
    }
    expect(Object.keys(RIVER_WATER_WORK_NARRATED_FEES)).toHaveLength(5);
    expect(routeCount).toBeGreaterThan(5);
  });
});
