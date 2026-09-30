import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS } from './index';
import { HIGH_WATER } from './highWater';
import type { Choice, SaveData } from '../types';

function fresh(carriedItem: string | null = null, money = 0): SaveData {
  const character = newCharacter('High Water Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  return { version: 1, bank: [], character, run: startRun(character, HIGH_WATER) };
}

function act(state: SaveData, choiceId: string, random = () => 0): SaveData {
  const scene = HIGH_WATER.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scene.id} has choice ${choiceId}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, HIGH_WATER, choice!, random);
}

function options(state: SaveData): Choice[] {
  return HIGH_WATER.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function reachCrestAfterPeopleAndAnimals(): SaveData {
  let state = act(fresh(), 'reachCottageFirst');
  state = act(state, 'carryResidentEarlyFirst');
  state = act(state, 'moveOnFromresidentFirst');
  state = act(state, 'goLivestockSecond');
  state = act(state, 'leadAnimalsDrySecond');
  return act(state, 'moveOnFromlivestockSecond');
}

describe('High Water', () => {
  it('registers for random repeat-avoiding play and direct QA launch', () => {
    expect(SCENARIOS).toContain(HIGH_WATER);
    expect(HIGH_WATER.id).toBe('high-water');
    expect(selectScenario(SCENARIOS, HIGH_WATER.id, () => 0)).not.toBe(HIGH_WATER);
    const state = startAdventure({ version: 1, bank: [], character: null, run: null }, HIGH_WATER);
    expect(state.run?.scenarioId).toBe(HIGH_WATER.id);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start High Water');
  });

  it('lets a fresh broke character save people, animals, and medicine, then escape without perfecting the settlement', () => {
    let state = reachCrestAfterPeopleAndAnimals();
    expect(state.character?.money).toBe(0);
    expect(state.run?.flags).toContain('residentSafe');
    expect(state.run?.flags).toContain('livestockSafe');
    expect(options(state).map((choice) => choice.id)).toEqual(['goMedicineLast', 'goStoreLast', 'seekOutsideHelpCrest', 'moveToBridge']);
    state = act(state, 'goMedicineLast');
    state = act(state, 'wadeForMedicineLast');
    expect(state.run?.sceneId).toBe('medicineLastOutcome');
    state = act(state, 'moveOnFrommedicineLast');
    state = act(state, 'takeRidgeFootpath');
    state = act(state, 'acceptFloodRope');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('highGroundEnding');
    expect(state.run?.flags).not.toContain('storeSafe');
    expect(state.run?.flags).toContain('medicineSafe');
    expect(state.run?.acquiredThisRun).toContain('travelRope');
    expect(state.character?.historyFlags).toContain('prioritized_people_in_flood');
    expect(state.character?.historyFlags).toContain('rescued_livestock');
  });

  it('supports a property-first choice without framing it as morally wrong', () => {
    let state = act(act(act(fresh(), 'reachMarketFirst'), 'prioritizeStoreFirst'), 'braceStoreDryFirst');
    expect(state.run?.flags).toContain('storeSafe');
    expect(state.character?.historyFlags).toContain('prioritized_property_in_flood');
    state = act(state, 'moveOnFromstoreFirst');
    state = act(state, 'goResidentSecond');
    state = act(state, 'carryResidentEarlySecond');
    state = act(state, 'moveOnFromresidentSecond');
    state = act(state, 'moveToBridge');
    state = act(state, 'takeRidgeFootpath');
    expect(sceneText(HIGH_WATER.scenes.highGroundEnding, state)).toContain('resident is safe and the store’s upper crates hold');
    expect(sceneText(HIGH_WATER.scenes.highGroundEnding, state)).not.toMatch(/wrong|selfish|bad person/i);
  });

  it('supports a livestock-first route and records the rescue only on success', () => {
    let state = act(fresh(), 'reachStableFirst');
    const failed = act(state, 'leadAnimalsDryFirst', () => 0.999);
    expect(failed.run?.flags).toContain('livestockAttempted');
    expect(failed.run?.flags).not.toContain('livestockSafe');
    expect(failed.character?.historyFlags).not.toContain('rescued_livestock');
    state = act(state, 'leadAnimalsDryFirst', () => 0);
    expect(state.run?.flags).toContain('livestockSafe');
    expect(state.character?.historyFlags).toContain('rescued_livestock');
  });

  it('reveals and can recover clinic medicine through an item-assisted route', () => {
    const before = fresh('ratCatchersHook');
    expect(HIGH_WATER.scenes.floodArrival.text).not.toContain('medicine case');
    let state = act(before, 'reachMarketFirst');
    expect(HIGH_WATER.scenes.marketTriage.text).toContain('medicine case');
    state = act(state, 'prioritizeMedicineFirst');
    state = act(state, 'snagMedicineFirst');
    expect(state.run?.flags).toContain('medicineSafe');
    expect(state.character?.knowledge.some((entry) => entry.includes('medicine'))).toBe(true);
    expect(state.character?.historyFlags).toContain('retrieved_medicine_during_flood');
  });

  it('allows outside help without money and makes paying for a hauler faster', () => {
    let broke = reachCrestAfterPeopleAndAnimals();
    broke = act(broke, 'seekOutsideHelpCrest');
    broke = act(broke, 'sendRunner');
    expect(broke.run?.sceneId).toBe('crewArrives');
    expect(broke.run?.elapsedMinutes).toBeGreaterThanOrEqual(40);
    broke = act(broke, 'organizeFloodEvacuation');
    expect(broke.character?.historyFlags).toContain('organized_flood_evacuation');
    expect(broke.character?.historyFlags).toContain('returned_with_flood_help');

    let paid = reachCrestAfterPeopleAndAnimals();
    paid.character!.money = 2;
    paid = act(paid, 'seekOutsideHelpCrest');
    paid = act(paid, 'payForHauler');
    expect(paid.character?.money).toBe(0);
    expect(paid.run?.elapsedMinutes).toBeLessThan(broke.run?.elapsedMinutes ?? 0);
  });

  it('allows a clean early escape before the flood crest without granting a reward', () => {
    const state = act(fresh(), 'leaveBeforeCrest');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('earlyEscapeEnding');
    expect(state.character?.historyFlags).toContain('abandoned_settlement_before_crest');
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('makes late work slower and riskier while warning before low routes become dangerous', () => {
    const early = fresh();
    early.run!.sceneId = 'livestockSecond';
    early.run!.elapsedMinutes = 18;
    const earlyIds = options(early).map((choice) => choice.id);
    expect(earlyIds).toContain('leadAnimalsDrySecond');
    expect(earlyIds).toContain('wadeForAnimalsSecond');
    early.run!.elapsedMinutes = 26;
    const lateIds = options(early).map((choice) => choice.id);
    expect(lateIds).not.toContain('leadAnimalsDrySecond');
    expect(lateIds).toContain('wadeForAnimalsSecond');
    expect(HIGH_WATER.scenes.livestockSecond.textVariants?.[0].text).toMatch(/flooded|current/i);
    expect(HIGH_WATER.scenes.waterDeepens.textVariants?.[0].text).toContain('brown channel');
    expect(HIGH_WATER.scenes.waterCrest.textVariants?.[0].text).toContain('bridge is still visible');
  });

  it('uses the fictional clock only for chosen actions and preserves its phase through serialization', () => {
    let state = fresh();
    state.run!.startedAt -= 7 * 24 * 60 * 60 * 1000;
    expect(timeStatus(HIGH_WATER, state.run!.elapsedMinutes).phase?.id).toBe('rising');
    state = act(state, 'reachStableFirst');
    expect(state.run?.elapsedMinutes).toBe(4);
    state.run!.elapsedMinutes = 26;
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.elapsedMinutes).toBe(26);
    expect(timeStatus(HIGH_WATER, resumed.run!.elapsedMinutes).phase?.id).toBe('dangerous');
    expect(timeStatus(HIGH_WATER, 12).phase?.id).toBe('deepening');
    expect(timeStatus(HIGH_WATER, 42).phase?.id).toBe('critical');
    expect(timeStatus(HIGH_WATER, 58).phase?.id).toBe('aftermath');
  });

  it('lets tools shorten structural work and lets gloves improve a no-tool attempt', () => {
    let toolState = act(act(fresh('pocketToolkit'), 'reachMarketFirst'), 'prioritizeStoreFirst');
    const toolChoice = options(toolState).find((choice) => choice.id === 'braceStoreFirst')!;
    expect(toolChoice.timeCost).toBe(4);
    const bare = act(act(fresh(), 'reachMarketFirst'), 'prioritizeStoreFirst');
    const handChoice = options(bare).find((choice) => choice.id === 'braceStoreDryFirst')!;
    expect(handChoice.timeCost).toBeGreaterThan(toolChoice.timeCost ?? 0);
    expect(handChoice.chance?.bonusItems).toContain('heavyLeatherGloves');
    toolState = act(toolState, 'braceStoreFirst');
    expect(toolState.run?.flags).toContain('storeSafe');
  });

  it('uses gloves with livestock and a rope to improve access and later escape odds', () => {
    const gloves = act(fresh('heavyLeatherGloves'), 'reachStableFirst');
    const manual = HIGH_WATER.scenes.livestockFirst.choices.find((choice) => choice.id === 'leadAnimalsDryFirst')!;
    expect(manual.chance?.bonusItems).toContain('heavyLeatherGloves');
    const ropeState = fresh('travelRope');
    ropeState.run!.sceneId = 'aftermathDecision';
    const ropeCross = options(ropeState).find((choice) => choice.id === 'crossWithRope')!;
    expect(ropeCross.chance?.probability).toBeGreaterThan(HIGH_WATER.scenes.aftermathDecision.choices.find((choice) => choice.id === 'crossUnroped')!.chance!.probability);
    expect(ropeCross.chance?.bonusItems).toContain('ironRopeClamp');
    expect(gloves.run?.sceneId).toBe('livestockFirst');
  });

  it('offers only explicitly acquired carryable rewards and suppresses duplicate tools', () => {
    const state = act(act(act(fresh(), 'reachMarketFirst'), 'prioritizeStoreFirst'), 'braceStoreDryFirst');
    const rewardIds = HIGH_WATER.scenes.thankYouHill.choices.flatMap((choice) => choice.effects?.gainItems ?? []);
    expect(rewardIds).toEqual(['travelRope', 'ironRopeClamp']);
    expect(rewardIds.every((id) => ITEMS[id]?.carryable)).toBe(true);
    const alreadyHasRope = fresh('travelRope');
    alreadyHasRope.run!.sceneId = 'thankYouHill';
    alreadyHasRope.run!.flags = ['earnedRopeReward'];
    expect(options(alreadyHasRope).map((choice) => choice.id)).not.toContain('acceptFloodRope');
    expect(state.run?.acquiredThisRun).not.toContain('travelRope');
  });

  it('keeps prior-history callbacks optional for a fresh character', () => {
    const freshState = fresh();
    const ordinaryText = sceneText(HIGH_WATER.scenes.floodArrival, freshState);
    expect(ordinaryText).toContain('Rain has soaked the valley');
    expect(ordinaryText).not.toContain('recognize you from the evacuation');
    freshState.character!.historyFlags.push('organized_flood_evacuation');
    expect(sceneText(HIGH_WATER.scenes.floodArrival, freshState)).toContain('recognize you from the evacuation');
    freshState.character!.historyFlags = ['prioritized_property_in_flood'];
    expect(sceneText(HIGH_WATER.scenes.floodArrival, freshState)).toContain('asks plainly what you intend to save');
  });

  it('foreshadows fatal danger and retains a less exposed escape alternative', () => {
    let state = reachCrestAfterPeopleAndAnimals();
    state = act(state, 'moveToBridge');
    expect(HIGH_WATER.scenes.aftermathDecision.text).toMatch(/support groans|dangerous/i);
    expect(options(state).map((choice) => choice.id)).toContain('takeRidgeFootpath');
    state = act(state, 'crossUnroped', () => 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('bridgeFailure');
  });

  it('lets a failed but survivable ridge escape advance to a new consequence and recover', () => {
    let state = reachCrestAfterPeopleAndAnimals();
    state = act(state, 'moveToBridge');
    state = act(state, 'takeRidgeFootpath', () => 0.999);
    expect(state.run?.sceneId).toBe('ridgeSlip');
    expect(state.run?.health).toBe(8);
    state = act(state, 'crawlAlongFence');
    state = act(state, 'leaveWithoutFloodGift');
    expect(state.run?.status).toBe('success');
  });

  it('cannot reach a state where every settlement objective is saved', () => {
    const queue = [fresh()];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.flags, run.elapsedMinutes, state.character?.money, state.character?.historyFlags, state.character?.knowledge]);
      if (seen.has(key) || run.status !== 'active') continue;
      seen.add(key);
      expect(run.flags).not.toEqual(expect.arrayContaining(['residentSafe', 'livestockSafe', 'medicineSafe', 'storeSafe']));
      const scene = HIGH_WATER.scenes[run.sceneId];
      expect(scene, `reachable scene ${run.sceneId} exists`).toBeDefined();
      const choices = options(state);
      expect(choices.length, `${run.sceneId} has an available action`).toBeGreaterThan(0);
      expect(choices.length, `${run.sceneId} has at most four simultaneous actions`).toBeLessThanOrEqual(4);
      for (const choice of choices) {
        for (const roll of choice.chance ? [() => 0, () => 0.999999] : [() => 0]) {
          const next = choose(state, HIGH_WATER, choice, roll);
          if (next.run?.status === 'active') {
            expect(next.run.visitedSceneIds?.length).toBe(new Set(next.run.visitedSceneIds).size);
            queue.push(next);
          }
        }
      }
    }
    expect(seen.size).toBeGreaterThan(30);
  });

  it('has a forward-only graph with every destination defined', () => {
    expect(findScenarioGraphProblems(HIGH_WATER)).toEqual([]);
  });
});
