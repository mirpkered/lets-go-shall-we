import { describe, expect, it } from 'vitest';
import { choose, damageItem, meets, newCharacter, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { isQaMode, selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { SMOKE_ON_THE_HILL } from './smokeOnTheHill';
import type { Choice, SaveData } from '../types';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Hill Fire Tester');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, SMOKE_ON_THE_HILL) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = SMOKE_ON_THE_HILL.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, SMOKE_ON_THE_HILL, choice!, () => random);
}

function options(state: SaveData): Choice[] {
  return SMOKE_ON_THE_HILL.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function reachBarn(state = fresh()): SaveData {
  state = act(state, 'approachQuickly');
  state = act(state, 'checkBarnAtGate');
  expect(state.run?.sceneId).toBe('barnDiscovery');
  return state;
}

describe('Smoke on the Hill', () => {
  it('registers for random repeat-avoiding play and direct QA launch', () => {
    expect(SCENARIOS).toContain(SMOKE_ON_THE_HILL);
    expect(selectScenario(SCENARIOS, SMOKE_ON_THE_HILL.id, () => 0)).not.toBe(SMOKE_ON_THE_HILL);
    expect(isQaMode('?qa=1')).toBe(true);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start Smoke on the Hill');
    expect(startAdventure({ version: 1, bank: [], character: null, run: null }, SMOKE_ON_THE_HILL).run?.scenarioId).toBe(SMOKE_ON_THE_HILL.id);
  });

  it('keeps the three early interpretations uncertain and does not reveal undiscovered people or animals', () => {
    const opening = SMOKE_ON_THE_HILL.scenes.distantSmoke.text;
    expect(opening).toMatch(/chimney/);
    expect(opening).toMatch(/controlled brush burn/);
    expect(opening).toMatch(/something gone wrong/);
    expect(opening).not.toMatch(/Eli|goats|trapped|lantern tipped/i);
    expect(SMOKE_ON_THE_HILL.scenes.homesteadGate.text).not.toMatch(/Eli|goats|farmhand/i);
  });

  it('lets a fresh broke character rescue Eli and complete the item-choice ending', () => {
    let state = act(reachBarn(), 'rescueEliBare');
    state = act(state, 'leaveWithEli');
    expect(state.run?.sceneId).toBe('eliThanks');
    expect(state.run?.acquiredThisRun).toEqual([]);
    state = act(state, 'declineFireRewardrescuedPersonEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('rescuedPersonEnding');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('rescued_person_from_fire');
  });

  it('supports cautious observation before choosing the farm lane', () => {
    let state = act(fresh(), 'observeFromRoad');
    expect(state.run?.elapsedMinutes).toBe(3);
    expect(state.character?.knowledge).toContain('The smoke from the hill shifts low toward the eastern grass when the wind gusts.');
    state = act(state, 'takeFarmLane');
    expect(state.run?.elapsedMinutes).toBe(9);
    expect(state.run?.sceneId).toBe('homesteadGate');
    expect(timeStatus(SMOKE_ON_THE_HILL, state.run!.elapsedMinutes).phase?.id).toBe('active');
  });

  it('supports the livestock-first route as a distinct imperfect success', () => {
    let state = act(reachBarn(), 'freeGoatsFirst');
    state = act(state, 'openGoatGateByHand');
    expect(state.run?.sceneId).toBe('goatsSaved');
    expect(state.character?.historyFlags).toContain('rescued_livestock_from_fire');
    state = act(state, 'leaveAfterGoats');
    expect(state.run?.status).toBe('success');
    expect(SMOKE_ON_THE_HILL.scenes.animalsSavedEnding.text).toContain('cannot tell whether anyone reached the lane');
  });

  it('supports a property-first firebreak outcome without requiring gear', () => {
    let state = reachBarn();
    state = act(state, 'protectHouseBeforeRescue');
    expect(state.run?.sceneId).toBe('firebreakAttempt');
    state = act(state, 'clearFirebreakByHand');
    expect(state.run?.sceneId).toBe('firebreakHolds');
    state = act(state, 'secureHouseAfterBreak');
    expect(state.run?.sceneId).toBe('houseAftermath');
    expect(state.run?.status).toBe('active');
    state = act(state, 'leaveAfterHouseFire');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('stopped_fire_spread');
    expect(state.character?.historyFlags).toContain('protected_property_from_fire');
  });

  it('makes a failed firebreak check advance with injury and a visibly spreading fire', () => {
    let state = reachBarn();
    state = act(state, 'protectHouseBeforeRescue');
    state = act(state, 'clearFirebreakByHand', 0.999);
    expect(state.run?.sceneId).toBe('firebreakFails');
    expect(state.run?.health).toBe(9);
    expect(state.run?.flags).toContain('fireSpread');
    expect(options(state).map((choice) => choice.id)).toContain('lookForPumpAfterBreakFail');
  });

  it('supports neighbor help and a faster paid rider while preserving a broke route', () => {
    let paid = act(act(fresh(2), 'approachQuickly'), 'hireRiderFromGate');
    expect(paid.character?.money).toBe(0);
    expect(paid.run?.elapsedMinutes).toBe(7);
    expect(paid.character?.historyFlags).toContain('left_for_outside_help');
    paid = act(paid, 'neighborsMakeFirebreak');
    paid = act(paid, 'leaveAfterNeighborsBreak');
    expect(paid.run?.status).toBe('success');

    let broke = act(fresh(), 'goWarnNeighbors');
    expect(broke.run?.elapsedMinutes).toBe(14);
    broke = act(broke, 'neighborsEscortedAway');
    expect(broke.run?.status).toBe('success');
  });

  it('allows a no-cost pump route and a tool improves time and odds without being mandatory', () => {
    let state = act(act(fresh(0, 'pocketToolkit'), 'approachQuickly'), 'inspectYardPump');
    const toolChoice = options(state).find((choice) => choice.id === 'repairPumpWithTool')!;
    expect(toolChoice.timeCost).toBe(3);
    expect(toolChoice.label).toMatch(/Toolkit.*Multi-tool.*pry tool.*opener/);
    state = act(state, 'repairPumpWithTool');
    expect(state.run?.sceneId).toBe('pumpReady');

    let noTool = act(act(fresh(), 'approachQuickly'), 'inspectYardPump');
    const handChoice = options(noTool).find((choice) => choice.id === 'workPumpByHand')!;
    expect(handChoice.timeCost).toBe(6);
    expect(handChoice.chance?.probability).toBeLessThan(toolChoice.chance?.probability ?? 1);
    noTool = act(noTool, 'workPumpByHand');
    expect(['pumpReady', 'pumpFails']).toContain(noTool.run?.sceneId);
    if (noTool.run?.sceneId === 'pumpFails') noTool = act(noTool, 'bucketAfterPumpFail');
    else noTool = act(noTool, 'douseGrassWithPump');
    noTool = act(noTool, 'leaveWaterLine');
    expect(noTool.run?.status).toBe('success');

    let brokenTool = damageItem(damageItem(fresh(0, 'pocketToolkit'), 'pocketToolkit'), 'pocketToolkit');
    brokenTool = act(act(brokenTool, 'approachQuickly'), 'inspectYardPump');
    expect(options(brokenTool).some(({ id }) => id === 'repairPumpWithTool')).toBe(false);
    expect(options(brokenTool).some(({ id }) => id === 'workPumpByHand')).toBe(true);
  });

  it('uses rope and smoke protection to make a smoky rescue faster and more reliable', () => {
    const bare = options(reachBarn()).find((choice) => choice.id === 'rescueEliBare')!;
    const ropeState = reachBarn(fresh(0, 'travelRope'));
    const rope = options(ropeState).find((choice) => choice.id === 'rescueEliRope')!;
    expect(options(ropeState).map((choice) => choice.id)).not.toContain('rescueEliBare');
    expect(rope.timeCost).toBeLessThan(bare.timeCost ?? Infinity);
    expect(rope.chance?.probability).toBeGreaterThan(bare.chance?.probability ?? 0);

    const hoodState = reachBarn(fresh(0, 'smokeHood'));
    const hood = options(hoodState).find((choice) => choice.id === 'rescueEliHood')!;
    expect(hood.timeCost).toBeLessThan(bare.timeCost ?? Infinity);
    expect(hood.chance?.probability).toBeGreaterThan(bare.chance?.probability ?? 0);
  });

  it('allows walking away without implying cowardice or granting an invisible reward', () => {
    let state = act(fresh(), 'continuePastSmoke');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(SMOKE_ON_THE_HILL.scenes.walkAwayEnding.text).not.toMatch(/coward|shame/i);
  });

  it('changes text and closes the livestock opportunity as fictional fire conditions worsen', () => {
    let state = act(fresh(), 'observeFromRoad');
    state = act(state, 'rideForNeighborsFromRidge');
    state = act(state, 'neighborsCheckBarn');
    expect(state.run?.elapsedMinutes).toBe(19);
    expect(state.run?.sceneId).toBe('barnWithNeighbors');
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.distantSmoke, { ...state, run: { ...state.run!, sceneId: 'distantSmoke', elapsedMinutes: 0 } })).toMatch(/far ridge/);
    const earlyText = sceneText(SMOKE_ON_THE_HILL.scenes.barnWithNeighbors, { ...state, run: { ...state.run!, elapsedMinutes: 14 } });
    const lateText = sceneText(SMOKE_ON_THE_HILL.scenes.barnWithNeighbors, state);
    expect(lateText).toMatch(/roof has begun to sag/);
    expect(lateText).not.toBe(earlyText);
    expect(options(state).map((choice) => choice.id)).not.toContain('neighborsOpenGoatStall');
    expect(timeStatus(SMOKE_ON_THE_HILL, 30).phase?.id).toBe('critical');
  });

  it('does not advance time while the player waits and preserves exact time and visited scenes in a save', () => {
    let state = act(fresh(), 'observeFromRoad');
    state.run!.startedAt -= 86_400_000;
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.elapsedMinutes).toBe(3);
    expect(resumed.run?.visitedSceneIds).toEqual(['distantSmoke', 'ridgeObservation']);
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.ridgeObservation, resumed)).toBe(SMOKE_ON_THE_HILL.scenes.ridgeObservation.text);
    expect(resumed.run?.elapsedMinutes).toBe(3);
  });

  it('foreshadows injury and lets a severe failed entry become lethal only when health is already low', () => {
    let state = reachBarn();
    state.run!.health = 4;
    state = act(state, 'rescueEliBare', 0.99);
    expect(state.run?.sceneId).toBe('loftSlip');
    expect(state.run?.health).toBe(2);
    expect(SMOKE_ON_THE_HILL.scenes.loftSlip.text).toMatch(/roof is moving|smoke is lowering/);

    let low = reachBarn();
    low.run!.health = 2;
    low = act(low, 'rescueEliBare', 0.99);
    expect(low.run?.status).toBe('death');
  });

  it('offers rewards explicitly, and never offers a duplicate unique reward', () => {
    const state = act(reachBarn(), 'rescueEliBare');
    const thanks = act(state, 'leaveWithEli');
    const labels = options(thanks).map((choice) => choice.label);
    expect(labels).toContain('Accept the smoke hood');
    expect(labels).toContain('Accept the fire beater');
    const carryingHood = structuredClone(thanks);
    carryingHood.run!.inventory.push('smokeHood');
    expect(options(carryingHood).map((choice) => choice.id)).not.toContain('acceptSmokeHoodrescuedPersonEnding');
    const accepted = act(thanks, 'acceptFireBeaterrescuedPersonEnding');
    expect(accepted.run?.acquiredThisRun).toContain('fireBeater');
    expect(ITEMS.fireBeater.carryable).toBe(true);
    expect(ITEMS.smokeHood.carryable).toBe(true);
  });

  it('keeps fresh-character routes available when history callbacks are absent', () => {
    const newArrival = fresh();
    expect(newArrival.character?.historyFlags).toEqual([]);
    expect(options(newArrival).map((choice) => choice.id)).toContain('approachQuickly');
    const veteran = fresh();
    veteran.character!.historyFlags.push('rescued_person_from_fire');
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.distantSmoke, veteran)).toContain('You have brought someone out of a burning place before');
    expect(options(veteran).map((choice) => choice.id)).toContain('approachQuickly');
  });

  it('has a forward-only graph and every reachable active state retains an action', () => {
    expect(findScenarioGraphProblems(SMOKE_ON_THE_HILL)).toEqual([]);
    const queue = [fresh(), fresh(0, 'travelRope'), fresh(0, 'smokeHood'), fresh(0, 'pocketToolkit')];
    const visited = new Set<string>();
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const state = queue[cursor];
      const signature = JSON.stringify([state.run?.sceneId, state.run?.elapsedMinutes, state.run?.health, state.run?.inventory, state.run?.flags, state.character?.historyFlags]);
      if (visited.has(signature) || state.run?.status !== 'active') continue;
      visited.add(signature);
      const scene = SMOKE_ON_THE_HILL.scenes[state.run!.sceneId];
      const available = options(state);
      expect(available.length, `${scene.id} should remain actionable`).toBeGreaterThan(0);
      expect(available.length, `${scene.id} should expose no more than four actions`).toBeLessThanOrEqual(4);
      for (const choice of available) {
        for (const roll of [0, 0.999]) {
          const next = choose(state, SMOKE_ON_THE_HILL, choice, () => roll);
          if (next.run?.status === 'active') queue.push(next);
        }
      }
    }
    expect(visited.size).toBeGreaterThan(10);
  });
});
