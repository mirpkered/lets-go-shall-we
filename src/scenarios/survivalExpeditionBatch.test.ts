import { describe, expect, it } from 'vitest';
import { analyzeScenarioLibrary, validateScenarioMetadata } from '../scenarioDiversity';
import { choose, meets, newCharacter, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { scenarioRiskTier } from '../riskClassification';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  ACROSS_THE_FLOODPLAIN, HOLD_UNTIL_MORNING, NIGHT_ON_THE_RIDGE, NO_WATER_AT_MILLERS_SPRING,
  RIVER_WITHOUT_A_BRIDGE, SURVIVAL_EXPEDITION_ADVENTURES, THE_ABANDONED_CAMP, THE_BROKEN_AXLE,
  THE_CAVE_BEFORE_THE_STORM, THE_EMPTY_CABIN, THE_ICE_GIVES_WARNING, THE_LAST_ROPE,
  THE_LOAD_MUST_GO, THE_LOST_SURVEY_PARTY, THE_LONG_WAY_AROUND_EXPEDITION, THE_MARKERS_STOP,
  THE_PASS_BEFORE_SNOW, THE_ROCKS_START_MOVING, THE_TREE_ACROSS_THE_CREEK, THE_WASHED_OUT_CUT,
  THE_WIND_CHANGES, THE_WRONG_VALLEY, THREE_DAYS_TO_THE_RAILHEAD, WHITEOUT,
} from './survivalExpeditionBatch';

function start(scenario: Scenario, gear: string[] = [], ownedAssets: NonNullable<SaveData['character']>['ownedAssets'] = []): SaveData {
  const character = newCharacter('Expedition Tester');
  character.carriedItems = [...gear];
  character.carriedItem = gear[0] ?? null;
  character.ownedAssets = ownedAssets;
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, roll = 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function explore(scenario: Scenario, gear: string[] = [], ownedAssets: NonNullable<SaveData['character']>['ownedAssets'] = []): void {
  const queue = [start(scenario, gear, ownedAssets)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.historyFlags, state.character?.ownedAssets, state.itemStates]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (scene.ending) continue;
    const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(choices.length, `${scenario.title}.${scene.id} fits the mobile grid`).toBeLessThanOrEqual(4);
    for (const choice of choices) {
      for (const roll of choice.chance ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(30000);
  }
}

describe('survival and expedition adventure batch', () => {
  it('registers 23 unique, forward-only adventures with complete current diversity metadata', () => {
    expect(SURVIVAL_EXPEDITION_ADVENTURES).toHaveLength(23);
    expect(SCENARIOS).toHaveLength(589);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(validateScenarioMetadata(SCENARIOS)).toEqual([]);
    for (const scenario of SURVIVAL_EXPEDITION_ADVENTURES) expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
    const classified = analyzeScenarioLibrary(SURVIVAL_EXPEDITION_ADVENTURES);
    expect(classified.classified).toBe(23);
    expect(new Set(classified.rows.map(({ sceneCount }) => sceneCount)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(classified.rows.map(({ choiceCounts }) => choiceCounts)).size).toBeGreaterThanOrEqual(15);
    expect(classified.distributions.availability).toEqual({ ALL_YEAR: 19, SPRING: 1, WINTER: 3 });
    expect(classified.distributions.riskTier).toEqual({ LOW: 2, MODERATE: 4, HIGH: 10, SEVERE: 7 });
  });

  it('explores every fresh-character route, chance outcome, and action-gated gear branch without revisits or dead ends', () => {
    for (const scenario of SURVIVAL_EXPEDITION_ADVENTURES) explore(scenario);
    for (const gear of [
      ['trailCompass'], ['foldingTrailMarker'], ['travelRope'], ['steelWedge'], ['compactWheelWrench'],
      ['weatherproofCloak'], ['woolTravelBlanket'], ['fieldBandageRoll'], ['roadsideSignalMirror'],
      ['trailWhistle'], ['roadmansLantern'], ['lantern', 'trailCompass'],
    ]) for (const scenario of [THE_PASS_BEFORE_SNOW, THE_BROKEN_AXLE, WHITEOUT, THE_LAST_ROPE, RIVER_WITHOUT_A_BRIDGE, THE_ICE_GIVES_WARNING, THE_WASHED_OUT_CUT, NIGHT_ON_THE_RIDGE]) explore(scenario, gear);
  });

  it('keeps early retreat safe and preserves a viable route for a fresh traveler', () => {
    const retreat = act(start(THE_PASS_BEFORE_SNOW), THE_PASS_BEFORE_SNOW, 'surveyShelter', 'turnPassBack');
    expect(retreat.run?.sceneId).toBe('passRetreat');
    expect(retreat.run?.health).toBe(10);
    expect(THE_PASS_BEFORE_SNOW.scenes.passRetreat.text).toContain('lose the afternoon’s crossing, not their lives');
    const spring = act(start(NO_WATER_AT_MILLERS_SPRING), NO_WATER_AT_MILLERS_SPRING, 'drySpring', 'askHomesteadSpring');
    expect(spring.run?.sceneId).toBe('springHouse');
    expect(THE_CAVE_BEFORE_THE_STORM.scenes.caveMouth.choices.some(({ id }) => id === 'useRockOverhang')).toBe(true);
    expect(THE_EMPTY_CABIN.scenes.cabinDoor.choices.some(({ id }) => id === 'useCabinShelter')).toBe(true);
  });

  it('makes risky environmental choices possible, foreshadowed, and consequential', () => {
    const floodRisk = ACROSS_THE_FLOODPLAIN.scenes.floodHerd.choices.find(({ id }) => id === 'crossFloodChannel')!;
    expect(floodRisk.hint).toMatch(/drown/i);
    expect(floodRisk.chance?.probability).toBeGreaterThan(0);
    expect(floodRisk.chance?.probability).toBeLessThan(1);
    const rush = act(start(ACROSS_THE_FLOODPLAIN), ACROSS_THE_FLOODPLAIN, 'floodHerd', 'crossFloodChannel', 0);
    expect(rush.run?.sceneId).toBe('sheepHighGround');
    const death = act(start(ACROSS_THE_FLOODPLAIN), ACROSS_THE_FLOODPLAIN, 'floodHerd', 'crossFloodChannel', 0.999999);
    expect(death.run?.sceneId).toBe('floodDeath');
    expect(scenarioRiskTier(ACROSS_THE_FLOODPLAIN)).toBe('SEVERE');
    expect(Object.values(WHITEOUT.scenes).some(({ ending }) => ending === 'death')).toBe(true);
  });

  it('uses equipment capability and records explicit strain, loss, and injury', () => {
    const dry = start(THE_LAST_ROPE);
    expect(THE_LAST_ROPE.scenes.ravineLedge.choices.filter(({ requirements }) => meets(requirements, dry)).map(({ id }) => id)).not.toContain('lowerRavineRope');
    const rope = act(start(THE_LAST_ROPE, ['travelRope']), THE_LAST_ROPE, 'ravineLedge', 'inspectRavineAnchor');
    const sacrifice = act(rope, THE_LAST_ROPE, 'anchorTest', 'anchorPineRope');
    expect(sacrifice.run?.inventory).not.toContain('travelRope');
    const slip = act(start(THE_TREE_ACROSS_THE_CREEK, ['travelRope']), THE_TREE_ACROSS_THE_CREEK, 'treeCrossing', 'useRopeTree');
    const failed = act(slip, THE_TREE_ACROSS_THE_CREEK, 'treeLine', 'lineCrawlTree', 0.999999);
    expect(failed.run?.health).toBe(8);
    expect(failed.itemStates?.travelRope?.condition).toBe('DAMAGED');
    const snapshot = structuredClone(failed);
    expect(snapshot.run?.health).toBe(8);
    expect(snapshot.itemStates?.travelRope?.condition).toBe('DAMAGED');
  });

  it('models asset-aware transport, no-perfect-outcome cargo choices, and help that does not require a legacy contact', () => {
    const fresh = start(THREE_DAYS_TO_THE_RAILHEAD);
    expect(THREE_DAYS_TO_THE_RAILHEAD.scenes.railheadCamp.choices.filter(({ requirements }) => meets(requirements, fresh)).map(({ id }) => id)).not.toContain('useOwnedHorseRailhead');
    const horse = start(THREE_DAYS_TO_THE_RAILHEAD, [], [{ id: 'olderChestnutHorse', name: 'Older Chestnut Horse', description: 'A boarded pack horse.' }]);
    expect(THREE_DAYS_TO_THE_RAILHEAD.scenes.railheadCamp.choices.filter(({ requirements }) => meets(requirements, horse)).map(({ id }) => id)).toContain('useOwnedHorseRailhead');
    expect(act(horse, THREE_DAYS_TO_THE_RAILHEAD, 'railheadCamp', 'useOwnedHorseRailhead').run?.sceneId).toBe('horseTransport');
    expect(THE_LOAD_MUST_GO.scenes.steepGrade.choices.map(({ id }) => id)).toEqual(['unloadOil', 'unloadBedding', 'braceWheels', 'walkAwayLoad']);
    const signal = start(THE_LOST_SURVEY_PARTY);
    expect(THE_LOST_SURVEY_PARTY.scenes.surveyCreek.choices.filter(({ requirements }) => meets(requirements, signal)).map(({ id }) => id)).toContain('avoidSurveyWater');
    expect(Object.values(ITEMS).filter(({ inventoryClass }) => inventoryClass === 'SUPPLY').map(({ id }) => id).sort()).toEqual(['coldIronNails', 'consecratedSalt', 'ritualChalk']);
    expect(THE_LAST_ROPE.scenes.ravineLedge.text).toContain('A Travel Rope would be the only useful line here; none is lying nearby.');
    expect(THE_LOAD_MUST_GO.scenes.steepGrade.choices.find(({ id }) => id === 'braceWheels')?.requirements?.usableItems).toEqual(['steelWedge']);
  });

  it('keeps calm navigation and waiting stories quiet rather than manufacturing emergencies', () => {
    const marker = act(start(THE_MARKERS_STOP), THE_MARKERS_STOP, 'markerEnd', 'followMarkerStones');
    expect(marker.run?.sceneId).toBe('markerWest');
    expect(THE_MARKERS_STOP.scenes.markerWest.text).toContain('work crew’s supply track');
    const wait = act(start(HOLD_UNTIL_MORNING), HOLD_UNTIL_MORNING, 'nightShelter', 'stayShelterNight');
    expect(wait.run?.sceneId).toBe('morningSignal');
    expect(HOLD_UNTIL_MORNING.scenes.morningSignal.text).toContain('No one was in danger');
    expect(THE_ABANDONED_CAMP.scenes.campAnswer.text).toContain('no evidence to turn an empty site into a rescue emergency');
  });
});
