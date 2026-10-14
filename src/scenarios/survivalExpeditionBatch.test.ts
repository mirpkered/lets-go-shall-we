import { describe, expect, it } from 'vitest';
import { analyzeScenarioLibrary, validateScenarioMetadata } from '../scenarioDiversity';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
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

function roundTrip(state: SaveData): SaveData {
  let raw: string | null = null;
  const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
  saveGame(state, storage);
  return loadSave(storage);
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
    expect(SCENARIOS).toHaveLength(861);
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

  it('keeps the seep at the basin when a successful dig establishes it there', () => {
    const dug = act(start(NO_WATER_AT_MILLERS_SPRING), NO_WATER_AT_MILLERS_SPRING, 'drySpring', 'digSpringBasin', 0);
    expect(dug.run?.flags).toContain('dugSpringSeepAtBasin');
    const restoredDug = roundTrip(dug);
    const dugText = sceneText(NO_WATER_AT_MILLERS_SPRING.scenes.springSeep, restoredDug);
    expect(dugText).toMatch(/seep gathers where you dug at the old basin/i);
    expect(dugText).not.toMatch(/beneath a fallen branch/i);

    let read = act(start(NO_WATER_AT_MILLERS_SPRING), NO_WATER_AT_MILLERS_SPRING, 'drySpring', 'readSpringGround');
    const readText = sceneText(NO_WATER_AT_MILLERS_SPRING.scenes.springSeep, read);
    expect(readText).toMatch(/shaded fold has a damp line beneath a fallen branch/i);
    expect(readText).not.toMatch(/where you dug at the old basin/i);

    const failed = act(start(NO_WATER_AT_MILLERS_SPRING), NO_WATER_AT_MILLERS_SPRING, 'drySpring', 'digSpringBasin', 0.999999);
    expect(failed.run?.sceneId).toBe('springSpent');
    expect(failed.run?.flags).not.toContain('dugSpringSeepAtBasin');
  });

  it('attributes rescue signals only to routes that actually signal', () => {
    let waiting = act(start(THE_PASS_BEFORE_SNOW), THE_PASS_BEFORE_SNOW, 'surveyShelter', 'pressPassSaddle', 0.999999);
    waiting = act(waiting, THE_PASS_BEFORE_SNOW, 'passWhiteout', 'crawlPassStone');
    expect(sceneText(THE_PASS_BEFORE_SNOW.scenes.passRescue, waiting)).not.toMatch(/your signal is answered/i);

    let signaled = act(start(THE_PASS_BEFORE_SNOW, ['trailWhistle']), THE_PASS_BEFORE_SNOW, 'surveyShelter', 'pressPassSaddle', 0.999999);
    signaled = act(signaled, THE_PASS_BEFORE_SNOW, 'passWhiteout', 'signalPassParty');
    const passStorage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(signaled, passStorage);
    expect(sceneText(THE_PASS_BEFORE_SNOW.scenes.passRescue, loadSave(passStorage))).toMatch(/your signal is answered/i);

    const splitFlood = () => act(start(ACROSS_THE_FLOODPLAIN), ACROSS_THE_FLOODPLAIN, 'floodHerd', 'moveSheepFlood', 0.999999);
    let guarded = act(splitFlood(), ACROSS_THE_FLOODPLAIN, 'floodSplit', 'bringPeopleCart');
    guarded = act(guarded, ACROSS_THE_FLOODPLAIN, 'cartHighGround', 'keepCartSafe');
    expect(sceneText(ACROSS_THE_FLOODPLAIN.scenes.floodRescue, guarded)).not.toMatch(/after your signal/i);

    let called = act(splitFlood(), ACROSS_THE_FLOODPLAIN, 'floodSplit', 'leaveFloodNow');
    const floodStorage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(called, floodStorage);
    expect(sceneText(ACROSS_THE_FLOODPLAIN.scenes.floodRescue, loadSave(floodStorage))).toMatch(/after your signal/i);
  });

  it('claims survey search marks only after the creek location is marked', () => {
    const declined = act(start(THE_LOST_SURVEY_PARTY), THE_LOST_SURVEY_PARTY, 'surveyTable', 'declineSurveySearch');
    expect(sceneText(THE_LOST_SURVEY_PARTY.scenes.surveyDelay, declined)).not.toMatch(/leave clear marks/i);

    let retreated = act(start(THE_LOST_SURVEY_PARTY), THE_LOST_SURVEY_PARTY, 'surveyTable', 'followSurveyPrints');
    retreated = act(retreated, THE_LOST_SURVEY_PARTY, 'surveySlope', 'leaveSurveySlope');
    expect(sceneText(THE_LOST_SURVEY_PARTY.scenes.surveyDelay, retreated)).not.toMatch(/leave clear marks/i);

    let marked = act(start(THE_LOST_SURVEY_PARTY), THE_LOST_SURVEY_PARTY, 'surveyTable', 'readSurveyBook');
    marked = act(marked, THE_LOST_SURVEY_PARTY, 'surveyNotebook', 'searchCreekSurvey');
    marked = act(marked, THE_LOST_SURVEY_PARTY, 'surveyCreek', 'avoidSurveyWater');
    const storage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(marked, storage);
    expect(sceneText(THE_LOST_SURVEY_PARTY.scenes.surveyDelay, loadSave(storage))).toMatch(/mark the creek/i);
    expect(sceneText(THE_LOST_SURVEY_PARTY.scenes.surveyDelay, loadSave(storage))).not.toMatch(/marks at the camp and slope/i);
  });

  it('keeps rope cost and rescue method truthful at the ravine endings', () => {
    const direct = act(start(THE_LAST_ROPE, ['travelRope']), THE_LAST_ROPE, 'ravineLedge', 'lowerRavineRope', 0);
    expect(direct.run?.sceneId).toBe('porterUp');
    expect(sceneText(THE_LAST_ROPE.scenes.porterUp, direct)).not.toMatch(/rope remains at the ravine|cannot be trusted again/i);

    let anchored = act(start(THE_LAST_ROPE, ['travelRope']), THE_LAST_ROPE, 'ravineLedge', 'inspectRavineAnchor');
    anchored = act(anchored, THE_LAST_ROPE, 'anchorTest', 'anchorPineRope');
    const ropeStorage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(anchored, ropeStorage);
    expect(sceneText(THE_LAST_ROPE.scenes.porterUp, loadSave(ropeStorage))).toMatch(/rope remains at the ravine/i);

    const fetchedCrew = act(start(THE_LAST_ROPE), THE_LAST_ROPE, 'ravineLedge', 'leaveRavine');
    expect(sceneText(THE_LAST_ROPE.scenes.ravineWait, fetchedCrew)).not.toMatch(/follows your call/i);

    const calledCrew = act(start(THE_LAST_ROPE), THE_LAST_ROPE, 'ravineLedge', 'callRavineHelp');
    const crewStorage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(calledCrew, crewStorage);
    expect(sceneText(THE_LAST_ROPE.scenes.ravineWait, loadSave(crewStorage))).toMatch(/follows your call/i);
  });

  it('does not turn one successful river crossing into a marked safe route', () => {
    const routes = [
      act(start(RIVER_WITHOUT_A_BRIDGE), RIVER_WITHOUT_A_BRIDGE, 'bridgeGone', 'fordFastRiver', 0),
      act(act(start(RIVER_WITHOUT_A_BRIDGE), RIVER_WITHOUT_A_BRIDGE, 'bridgeGone', 'followUpRiver'), RIVER_WITHOUT_A_BRIDGE, 'riverUpstream', 'crossBendRiver', 0),
      act(act(start(RIVER_WITHOUT_A_BRIDGE), RIVER_WITHOUT_A_BRIDGE, 'bridgeGone', 'seekRiverFerry'), RIVER_WITHOUT_A_BRIDGE, 'riverLanding', 'poleFerryAlone', 0),
      act(act(start(RIVER_WITHOUT_A_BRIDGE), RIVER_WITHOUT_A_BRIDGE, 'bridgeGone', 'followUpRiver'), RIVER_WITHOUT_A_BRIDGE, 'riverUpstream', 'keepMillRoad').run?.sceneId === 'riverMill'
        ? act(act(act(start(RIVER_WITHOUT_A_BRIDGE), RIVER_WITHOUT_A_BRIDGE, 'bridgeGone', 'followUpRiver'), RIVER_WITHOUT_A_BRIDGE, 'riverUpstream', 'keepMillRoad'), RIVER_WITHOUT_A_BRIDGE, 'riverMill', 'acceptMillBoat')
        : start(RIVER_WITHOUT_A_BRIDGE),
    ];
    for (const route of routes) {
      expect(route.run?.sceneId).toBe('riverAcross');
      expect(sceneText(RIVER_WITHOUT_A_BRIDGE.scenes.riverAcross, route)).not.toMatch(/safe route has been found and marked/i);
    }
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

  it('foreshadows the flooded-cave ledge fall and makes the fatal wait an explicit commitment', () => {
    const climb = THE_CAVE_BEFORE_THE_STORM.scenes.caveDryChamber.choices.find(({ id }) => id === 'climbCaveLedge')!;
    const wait = THE_CAVE_BEFORE_THE_STORM.scenes.caveDryChamber.choices.find(({ id }) => id === 'waitCaveLedge')!;
    expect(climb.hint).toMatch(/slip.*rising water/i);
    expect(climb.chance?.probability).toBeGreaterThan(0);
    expect(climb.chance?.probability).toBeLessThan(1);
    expect(climb.chance?.failureNext).toBe('caveDeath');
    expect(wait.label).toMatch(/rising water overtakes/i);
    expect(wait.hint).toMatch(/no way back/i);

    const ledge = start(THE_CAVE_BEFORE_THE_STORM);
    ledge.run!.sceneId = 'caveDryChamber';
    expect(act(ledge, THE_CAVE_BEFORE_THE_STORM, 'caveDryChamber', 'climbCaveLedge', 0).run?.sceneId).toBe('caveOverhang');
    expect(act(ledge, THE_CAVE_BEFORE_THE_STORM, 'caveDryChamber', 'climbCaveLedge', 0.999999).run?.status).toBe('death');
    expect(act(ledge, THE_CAVE_BEFORE_THE_STORM, 'caveDryChamber', 'waitCaveLedge').run?.status).toBe('death');
  });

  it('does not praise the successful forced-axle route as unhurried', () => {
    let forced = act(start(THE_BROKEN_AXLE), THE_BROKEN_AXLE, 'axleRoad', 'inspectAxleBreak');
    forced = act(forced, THE_BROKEN_AXLE, 'axleExamined', 'braceAfterLook', 0.999999);
    expect(forced.run?.sceneId).toBe('axleUnstable');
    forced = act(forced, THE_BROKEN_AXLE, 'axleUnstable', 'forceBrokenWagon', 0);
    expect(forced.run?.sceneId).toBe('axleSettlement');
    expect(sceneText(THE_BROKEN_AXLE.scenes.axleSettlement, forced)).not.toMatch(/without rushing it/i);
    expect(sceneText(THE_BROKEN_AXLE.scenes.axleSettlement, forced)).toMatch(/grateful that you brought the wagon in/i);

    let lightened = act(start(THE_BROKEN_AXLE), THE_BROKEN_AXLE, 'axleRoad', 'unloadAxle');
    lightened = act(lightened, THE_BROKEN_AXLE, 'axleLightened', 'slowAxleHome', 0);
    expect(sceneText(THE_BROKEN_AXLE.scenes.axleSettlement, lightened)).not.toMatch(/without rushing it/i);
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
    expect(THE_MARKERS_STOP.scenes.markerWest.text).not.toMatch(/glad you left your own sign/i);
    let marked = act(start(THE_MARKERS_STOP, ['foldingTrailMarker']), THE_MARKERS_STOP, 'markerEnd', 'markOwnReturn');
    marked = act(marked, THE_MARKERS_STOP, 'markerMarked', 'markerMarkedWest');
    expect(sceneText(THE_MARKERS_STOP.scenes.markerWest, marked)).toMatch(/glad you left your own sign/i);
    const markerStorage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(marked, markerStorage);
    expect(sceneText(THE_MARKERS_STOP.scenes.markerWest, loadSave(markerStorage))).toMatch(/glad you left your own sign/i);
    const wait = act(start(HOLD_UNTIL_MORNING), HOLD_UNTIL_MORNING, 'nightShelter', 'stayShelterNight');
    expect(wait.run?.sceneId).toBe('morningSignal');
    expect(HOLD_UNTIL_MORNING.scenes.morningSignal.text).toContain('No one was in danger');
    expect(THE_ABANDONED_CAMP.scenes.campAnswer.text).toContain('no evidence to turn an empty site into a rescue emergency');
  });

  it('keeps the solo thin-ice crossing separate from moving the traveler and cart', () => {
    let solo = act(start(THE_ICE_GIVES_WARNING), THE_ICE_GIVES_WARNING, 'iceWarning', 'crossIceAlone', 0);
    expect(solo.run?.sceneId).toBe('iceFarBank');
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceFarBank, solo)).not.toMatch(/traveler reaches the far bank with the cart/i);
    let cart = act(start(THE_ICE_GIVES_WARNING), THE_ICE_GIVES_WARNING, 'iceWarning', 'callIceWarning');
    cart = act(cart, THE_ICE_GIVES_WARNING, 'iceTravelerStops', 'leadIceUpstream');
    cart = act(cart, THE_ICE_GIVES_WARNING, 'iceGravelRoute', 'carryCartIceBend', 0);
    expect(cart.run?.sceneId).toBe('iceFarBank');
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceFarBank, cart)).toMatch(/traveler reaches the far bank with the cart/i);
    const storage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(cart, storage);
    const restored = loadSave(storage);
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceFarBank, restored)).toMatch(/traveler reaches the far bank with the cart/i);
  });

  it('does not invent a rescue rope or cart recovery on the ice endings', () => {
    const soloFailure = act(start(THE_ICE_GIVES_WARNING), THE_ICE_GIVES_WARNING, 'iceWarning', 'crossIceAlone', 0.999999);
    expect(soloFailure.run?.sceneId).toBe('iceBreak');
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceBreak, soloFailure)).not.toMatch(/rope/i);
    const actualLine = act(start(THE_ICE_GIVES_WARNING, ['travelRope']), THE_ICE_GIVES_WARNING, 'iceWarning', 'throwIceLine');
    expect(actualLine.run?.sceneId).toBe('iceTravelerStops');

    let left = act(start(THE_ICE_GIVES_WARNING, ['smallKnife', 'foremanMultiTool', 'steelWedge']), THE_ICE_GIVES_WARNING, 'iceWarning', 'callIceWarning');
    left = act(left, THE_ICE_GIVES_WARNING, 'iceTravelerStops', 'testIceSeam');
    left = act(left, THE_ICE_GIVES_WARNING, 'iceRead', 'leaveIceCart');
    const leftStorage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(left, leftStorage);
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceSafeWait, loadSave(leftStorage))).toMatch(/leave the cart on the near bank/i);

    const waited = act(act(start(THE_ICE_GIVES_WARNING), THE_ICE_GIVES_WARNING, 'iceWarning', 'callIceWarning'), THE_ICE_GIVES_WARNING, 'iceTravelerStops', 'waitIceThaw');
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceSafeWait, waited)).not.toMatch(/cart arrives later/i);
    expect(sceneText(THE_ICE_GIVES_WARNING.scenes.iceSafeWait, waited)).not.toMatch(/cart remains on the near bank/i);
  });

  it('distinguishes calling, waiting, and returning without contact at the abandoned camp', () => {
    const returned = act(act(start(THE_ABANDONED_CAMP), THE_ABANDONED_CAMP, 'emptyCamp', 'inspectCamp'), THE_ABANDONED_CAMP, 'campTracks', 'followStreamTracks');
    const noCrossing = act(returned, THE_ABANDONED_CAMP, 'campStream', 'returnEmptyCamp');
    expect(sceneText(THE_ABANDONED_CAMP.scenes.campAnswer, noCrossing)).not.toMatch(/no one answers/i);

    const called = act(start(THE_ABANDONED_CAMP), THE_ABANDONED_CAMP, 'emptyCamp', 'callAtCamp');
    const calledStorage = { value: '', getItem() { return this.value; }, setItem(_key: string, value: string) { this.value = value; } };
    saveGame(called, calledStorage);
    expect(sceneText(THE_ABANDONED_CAMP.scenes.campAnswer, loadSave(calledStorage))).toMatch(/you call out.*no one answers/i);

    const waited = act(act(start(THE_ABANDONED_CAMP), THE_ABANDONED_CAMP, 'emptyCamp', 'inspectCamp'), THE_ABANDONED_CAMP, 'campTracks', 'waitAtCamp');
    expect(sceneText(THE_ABANDONED_CAMP.scenes.campAnswer, waited)).toMatch(/wait.*no one returns/i);
  });

  it('keeps the wagon-slip damage and driver-only recovery route-specific', () => {
    let oilSafe = act(start(THE_LOAD_MUST_GO), THE_LOAD_MUST_GO, 'steepGrade', 'unloadOil');
    oilSafe = act(oilSafe, THE_LOAD_MUST_GO, 'loadLightened', 'moveLightenedWagon', 0.999999);
    expect(oilSafe.run?.sceneId).toBe('loadSlip');
    expect(sceneText(THE_LOAD_MUST_GO.scenes.loadSlip, oilSafe)).not.toMatch(/barrel has split/i);

    let beddingSafe = act(start(THE_LOAD_MUST_GO), THE_LOAD_MUST_GO, 'steepGrade', 'unloadBedding');
    beddingSafe = act(beddingSafe, THE_LOAD_MUST_GO, 'loadLightened', 'moveLightenedWagon', 0.999999);
    expect(sceneText(THE_LOAD_MUST_GO.scenes.loadSlip, beddingSafe)).not.toMatch(/bedding is soaked/i);

    const driverOnly = act(oilSafe, THE_LOAD_MUST_GO, 'loadSlip', 'saveDriverLoad');
    expect(driverOnly.run?.sceneId).toBe('loadArrival');
    const arrivalText = sceneText(THE_LOAD_MUST_GO.scenes.loadArrival, driverOnly);
    expect(arrivalText).toMatch(/wagon and medicine chest remain at the shelf/i);
    expect(arrivalText).not.toMatch(/with the medicine chest|listed for recovery/i);
  });

  it('remembers meeting the Empty Cabin trapper without inventing that encounter on other exits', () => {
    let met = act(start(THE_EMPTY_CABIN), THE_EMPTY_CABIN, 'cabinDoor', 'readCabinNote');
    met = act(met, THE_EMPTY_CABIN, 'cabinSigns', 'followCabinPrints');
    met = act(met, THE_EMPTY_CABIN, 'cabinStream', 'callCabinStream');
    met = act(met, THE_EMPTY_CABIN, 'cabinAnswer', 'walkWithTrapper');
    expect(sceneText(THE_EMPTY_CABIN.scenes.cabinRoad, met)).toMatch(/after meeting the trapper upstream/i);
    expect(sceneText(THE_EMPTY_CABIN.scenes.cabinRoad, met)).toMatch(/left the cabin open for a neighbor/i);

    const uninvestigated = act(start(THE_EMPTY_CABIN), THE_EMPTY_CABIN, 'cabinDoor', 'leaveCabinDoor');
    expect(sceneText(THE_EMPTY_CABIN.scenes.cabinRoad, uninvestigated)).not.toMatch(/meeting the trapper|neighbor expected/i);
  });

  it('keeps the shared ridge ending neutral across injured and uninjured routes', () => {
    const safeDescent = act(start(NIGHT_ON_THE_RIDGE), NIGHT_ON_THE_RIDGE, 'ridgeExposure', 'descendRidgeNow', 0);
    expect(safeDescent.run?.sceneId).toBe('ridgeTrees');
    const injured = act(start(NIGHT_ON_THE_RIDGE), NIGHT_ON_THE_RIDGE, 'ridgeExposure', 'descendRidgeNow', 0.99);
    expect(injured.run?.sceneId).toBe('ridgeBruise');
    const injuredDescent = act(injured, NIGHT_ON_THE_RIDGE, 'ridgeBruise', 'crawlRidgeDown');
    expect(injuredDescent.run?.sceneId).toBe('ridgeTrees');
    const ending = NIGHT_ON_THE_RIDGE.scenes.ridgeTrees.text;
    expect(ending).not.toMatch(/bruised shoulder|dry lantern/i);
    expect(ending).toMatch(/reach the trees below the exposed ridge/i);
    expect(NIGHT_ON_THE_RIDGE.scenes.ridgeBruise.text).toMatch(/hurts to bear weight/i);
  });
});
