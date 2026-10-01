import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  A_NIGHT_OF_WIND, CAMP_BEFORE_DARK, CREEK_ON_THE_RETURN, DRY_CAMP, MARKS_ON_THE_TRAIL,
  THE_FAINT_TRAIL, THE_FOG_COMES_DOWN, THE_RIDGE_OR_THE_VALLEY, THE_SECOND_SUNSET,
  THE_SHORTCUT, WILDERNESS_ADVENTURES,
} from './wildernessBatch';

function start(scenario: Scenario, selections: Record<string, string> = {}, item?: string): SaveData {
  const character = newCharacter('Wilderness Tester');
  if (item) character.carriedItem = item;
  const run = startRun(character, scenario, () => 0);
  run.randomSelections = { ...run.randomSelections, ...selections };
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function selectionCombos(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((current, selection) =>
    current.flatMap((entry) => selection.values.map(({ value }) => ({ ...entry, [selection.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, item?: string): void {
  const queue = [start(scenario, selections, item)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} exposes an action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the action grid`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(1000);
  }
}

describe('wilderness, navigation, and camp life adventure batch', () => {
  it('registers ten forward-only stories with concise phone-sized copy', () => {
    expect(WILDERNESS_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(94);
    expect(WILDERNESS_ADVENTURES.map(({ title }) => title)).toEqual([
      'The Faint Trail', 'Camp Before Dark', 'The Shortcut', 'Creek on the Return',
      'The Fog Comes Down', 'Dry Camp', 'The Ridge or the Valley', 'Marks on the Trail',
      'A Night of Wind', 'The Second Sunset',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of WILDERNESS_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title} references existing item ${id}`).toBeTruthy();
          }
          if (choice.chance) {
            expect(choice.chance.successNext).toBeTruthy();
            expect(choice.chance.failureNext).toBeTruthy();
            expect(choice.chance.probability).toBeGreaterThan(0);
            expect(choice.chance.probability).toBeLessThan(1);
          }
        }
      }
    }
  });

  it('explores every authored variation and both outcomes without dead ends or revisits', () => {
    for (const scenario of WILDERNESS_ADVENTURES) {
      for (const selections of selectionCombos(scenario)) explore(scenario, selections);
    }
    for (const item of ['trailCompass', 'foldingTrailMarker']) explore(THE_FAINT_TRAIL, {}, item);
    for (const item of ['weatherproofCloak']) explore(CAMP_BEFORE_DARK, {}, item);
    for (const item of ['trailCompass']) explore(THE_SHORTCUT, { shortcutGround: 'rough' }, item);
    for (const item of ['travelRope']) explore(CREEK_ON_THE_RETURN, { creekTrend: 'steady' }, item);
    for (const item of ['minerHeadlamp', 'roadmansLantern', 'trailCompass']) explore(THE_FOG_COMES_DOWN, { fogCompany: 'nearby' }, item);
    for (const item of ['foldingTrailMarker']) explore(DRY_CAMP, {}, item);
    for (const item of ['weatherproofCloak', 'roadsideSignalMirror']) explore(THE_RIDGE_OR_THE_VALLEY, { weather: 'clouding' }, item);
    for (const item of ['foldingTrailMarker']) explore(MARKS_ON_THE_TRAIL, { markerKind: 'hunter' }, item);
    for (const item of ['travelRope', 'weatherproofCloak', 'weatherproofBlanket', 'woolTravelBlanket', 'windproofMatchCase']) explore(A_NIGHT_OF_WIND, {}, item);
    for (const item of ['roadmansLantern', 'weatherproofBlanket', 'woolTravelBlanket', 'windproofMatchCase']) explore(THE_SECOND_SUNSET, {}, item);
  });

  it('keeps the faint trail recoverable and makes a marker useful without guaranteeing a route', () => {
    const uncertain = act(start(THE_FAINT_TRAIL), THE_FAINT_TRAIL, 'trailhead', 'followFaintTrace', () => 0.999999);
    expect(uncertain.run?.sceneId).toBe('uncertainGround');
    const marker = act(start(THE_FAINT_TRAIL, {}, 'foldingTrailMarker'), THE_FAINT_TRAIL, 'trailhead', 'followFaintTrace', () => 0.999999);
    const marked = act(marker, THE_FAINT_TRAIL, 'uncertainGround', 'markTrail');
    expect(marked.run?.sceneId).toBe('markedTrail');
    expect(marked.character?.knowledge.at(-1)).toContain('marker was placed');
    expect(THE_FAINT_TRAIL.scenes.uncertainGround.choices.find(({ id }) => id === 'returnFromTracks')).toBeTruthy();
  });

  it('treats stopping early as a complete, safe camp choice before pressing farther', () => {
    const state = start(CAMP_BEFORE_DARK);
    const stop = act(state, CAMP_BEFORE_DARK, 'forkAtDusk', 'campOnShelf');
    expect(stop.run?.sceneId).toBe('earlyCamp');
    expect(CAMP_BEFORE_DARK.scenes.earlyCamp.text).toContain('no penalty for stopping before the road demands one');
    const push = act(start(CAMP_BEFORE_DARK), CAMP_BEFORE_DARK, 'forkAtDusk', 'pushToShelter', () => 0);
    expect(push.run?.sceneId).toBe('reachedShelter');
    expect(act(start(CAMP_BEFORE_DARK), CAMP_BEFORE_DARK, 'forkAtDusk', 'pushToShelter', () => 0.999999).run?.sceneId).toBe('shelterAfterDark');
  });

  it('makes the shortcut viable, but lowers its odds when the ground is rough', () => {
    const firm = start(THE_SHORTCUT, { shortcutGround: 'firm' });
    const rough = start(THE_SHORTCUT, { shortcutGround: 'rough' });
    const shortcut = THE_SHORTCUT.scenes.roadsideOffer.choices.find(({ id }) => id === 'takeCutoff')!;
    expect(meets(shortcut.requirements, firm)).toBe(true);
    expect(shortcut.chance?.probability).toBeGreaterThan(0.5);
    expect(shortcut.chance?.penaltySelections?.shortcutGround).toBe('rough');
    expect(THE_SHORTCUT.scenes.roadsideOffer.choices.find(({ id }) => id === 'stayOnRoad')).toBeTruthy();
    expect(rough.run?.randomSelections?.shortcutGround).toBe('rough');
  });

  it('foreshadows creek danger and leaves wait, detour, and risky crossing options', () => {
    expect(CREEK_ON_THE_RETURN.scenes.nearBank.text).toContain('stones are now mostly underwater');
    const state = start(CREEK_ON_THE_RETURN, { creekTrend: 'easing' });
    const waited = act(state, CREEK_ON_THE_RETURN, 'nearBank', 'waitForCreek');
    expect(sceneText(CREEK_ON_THE_RETURN.scenes.waterWatched, waited)).toContain('creek drops a little');
    const risk = CREEK_ON_THE_RETURN.scenes.waterWatched.choices.find(({ id }) => id === 'riskCreekAfterWait')!;
    expect(risk.hint).toContain('current still runs');
    expect(risk.chance?.successNext).not.toBe(risk.chance?.failureNext);
  });

  it('keeps fog ordinary, and uses lights only for nearby footing or visibility', () => {
    expect(THE_FOG_COMES_DOWN.scenes.foggyTrack.text).toContain('Low fog settles across the ordinary road');
    const fresh = start(THE_FOG_COMES_DOWN);
    expect(THE_FOG_COMES_DOWN.scenes.foggyTrack.choices.find(({ id }) => id === 'lightGround')?.requirements?.items).toContain('minerHeadlamp');
    expect(THE_FOG_COMES_DOWN.scenes.foggyTrack.choices.filter(({ requirements }) => meets(requirements, fresh)).map(({ id }) => id))
      .not.toContain('lightGround');
    expect(THE_FOG_COMES_DOWN.scenes.foggyTrack.choices.find(({ id }) => id === 'stopForFog')).toBeTruthy();
    expect(THE_FOG_COMES_DOWN.scenes.roadBend.textVariants?.find(({ requirements }) => meets(requirements, start(THE_FOG_COMES_DOWN, { fogCompany: 'alone' })))?.text)
      .toContain('no other traveler answers your call');
  });

  it('keeps a dry camp manageable and makes the next day’s water route visible', () => {
    const broke = start(DRY_CAMP);
    expect(DRY_CAMP.scenes.dryHollow.choices.filter(({ requirements }) => meets(requirements, broke)).map(({ id }) => id))
      .toEqual(['rationForNight', 'searchNearHollow', 'returnToSpring']);
    const marked = act(start(DRY_CAMP, {}, 'foldingTrailMarker'), DRY_CAMP, 'dryHollow', 'changeTomorrowRoute');
    expect(marked.run?.sceneId).toBe('morningRoute');
    expect(DRY_CAMP.scenes.rationedCamp.text).toContain('reach the marked spring in the morning');
  });

  it('keeps ridge and valley both viable and lets weather and elapsed time inform the exposed route', () => {
    const ridge = THE_RIDGE_OR_THE_VALLEY.scenes.twoRoutes.choices.find(({ id }) => id === 'takeRidge')!;
    const valley = THE_RIDGE_OR_THE_VALLEY.scenes.twoRoutes.choices.find(({ id }) => id === 'takeValley')!;
    expect(ridge.chance?.successNext).toBe('ridgeArrival');
    expect(ridge.chance?.failureNext).toBe('ridgePause');
    expect(valley.next).toBe('valleyArrival');
    expect(ridge.chance?.lateAfterMinutes).toBeLessThan(95);
    const direct = act(start(THE_RIDGE_OR_THE_VALLEY), THE_RIDGE_OR_THE_VALLEY, 'twoRoutes', 'takeRidge', () => 0.6);
    expect(direct.run?.sceneId).toBe('ridgeArrival');
    const checked = act(start(THE_RIDGE_OR_THE_VALLEY), THE_RIDGE_OR_THE_VALLEY, 'twoRoutes', 'checkWeather');
    expect(act(checked, THE_RIDGE_OR_THE_VALLEY, 'weatherWatched', 'ridgeAfterWeather', () => 0.6).run?.sceneId).toBe('ridgePause');
  });

  it('allows ordinary interpretations of trail markers without turning them into a forced mystery', () => {
    for (const markerKind of ['crew', 'hunter', 'oldRoute']) {
      const looked = act(start(MARKS_ON_THE_TRAIL, { markerKind }), MARKS_ON_THE_TRAIL, 'markedJunction', 'inspectMarks');
      const text = sceneText(MARKS_ON_THE_TRAIL.scenes.marksInspected, looked);
      expect(text).toMatch(/may|might|could/);
      expect(text).not.toContain('culprit');
    }
    expect(MARKS_ON_THE_TRAIL.scenes.markedJunction.choices.find(({ id }) => id === 'stayOldPath')).toBeTruthy();
  });

  it('makes existing wind and bedding gear useful without guaranteeing shelter', () => {
    for (const id of ['trailCompass', 'foldingTrailMarker', 'roadmansLantern', 'minerHeadlamp', 'weatherproofCloak', 'weatherproofBlanket', 'woolTravelBlanket', 'windproofMatchCase', 'travelRope', 'roadsideSignalMirror']) {
      expect(ITEMS[id]?.carryable, `${id} remains carryable`).toBe(true);
    }
    const ropeChoice = A_NIGHT_OF_WIND.scenes.windyCamp.choices.find(({ id }) => id === 'tieShelterRope')!;
    expect(ropeChoice.chance?.successNext).not.toBe(ropeChoice.chance?.failureNext);
    const cloak = act(start(A_NIGHT_OF_WIND, {}, 'weatherproofCloak'), A_NIGHT_OF_WIND, 'windyCamp', 'shieldCloak');
    expect(cloak.run?.sceneId).toBe('cloakWindbreak');
    expect(A_NIGHT_OF_WIND.scenes.cloakWindbreak.text).toContain('well clear of the fire');
  });

  it('makes the second sunset a nonlethal choice among camping, shelter, lantern travel, and company', () => {
    expect(THE_SECOND_SUNSET.scenes.longRoadEvening.choices.map(({ id }) => id)).toEqual([
      'campOnKnoll', 'seekFarmhouse', 'continueWithLantern', 'followTravelers',
    ]);
    expect(THE_SECOND_SUNSET.scenes.campedKnoll.text).toContain('destination will still be there in the morning');
    const lantern = start(THE_SECOND_SUNSET, {}, 'roadmansLantern');
    expect(THE_SECOND_SUNSET.scenes.longRoadEvening.choices.filter(({ requirements }) => meets(requirements, lantern)).map(({ id }) => id))
      .toContain('continueWithLantern');
    expect(Object.values(THE_SECOND_SUNSET.scenes).every(({ ending }) => ending !== 'death')).toBe(true);
  });
});
