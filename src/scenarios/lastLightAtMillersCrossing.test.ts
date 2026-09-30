import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { LAST_LIGHT_AT_MILLERS_CROSSING } from './lastLightAtMillersCrossing';
import type { Choice, SaveData } from '../types';

function fresh(carriedItem: string | null = null, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Crossing Tester');
  character.carriedItem = carriedItem;
  character.historyFlags = historyFlags;
  return { version: 1, bank: [], character, run: startRun(character, LAST_LIGHT_AT_MILLERS_CROSSING) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = LAST_LIGHT_AT_MILLERS_CROSSING.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, LAST_LIGHT_AT_MILLERS_CROSSING, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return LAST_LIGHT_AT_MILLERS_CROSSING.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function atScene(sceneId: string, elapsedMinutes: number, carriedItem: string | null = null): SaveData {
  const state = fresh(carriedItem);
  state.run!.sceneId = sceneId;
  state.run!.elapsedMinutes = elapsedMinutes;
  state.run!.visitedSceneIds = ['crossroads', sceneId];
  return state;
}

function traverse(initial: SaveData): SaveData[] {
  const pending = [initial];
  const reached: SaveData[] = [];
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({ scene: run.sceneId, time: run.elapsedMinutes, health: run.health, items: run.inventory, flags: run.flags });
    if (seen.has(key)) continue;
    seen.add(key);
    reached.push(state);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable active scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} action count`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance) {
        pending.push(choose(state, LAST_LIGHT_AT_MILLERS_CROSSING, choice, () => 0));
        pending.push(choose(state, LAST_LIGHT_AT_MILLERS_CROSSING, choice, () => 0.999));
      } else pending.push(choose(state, LAST_LIGHT_AT_MILLERS_CROSSING, choice, () => 0));
    }
  }
  return reached;
}

function finishAtReunion(state: SaveData, reward = 'declineRoadsideReward'): SaveData {
  state = act(state, options(state).some((choice) => choice.id === 'bringMaraToHalAtFarm') ? 'bringMaraToHalAtFarm' : 'returnMaraToHal');
  return act(state, reward);
}

describe('Last Light at Miller’s Crossing', () => {
  it('registers for random repeat-avoiding selection and direct QA launch', () => {
    expect(SCENARIOS).toContain(LAST_LIGHT_AT_MILLERS_CROSSING);
    expect(selectScenario(SCENARIOS, LAST_LIGHT_AT_MILLERS_CROSSING.id, () => 0)).not.toBe(LAST_LIGHT_AT_MILLERS_CROSSING);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start Last Light at Miller’s Crossing');
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
  });

  it('keeps the opening uncertain while presenting several plausible explanations', () => {
    const opening = LAST_LIGHT_AT_MILLERS_CROSSING.scenes.crossroads.text;
    expect(opening).toMatch(/wagon lies on its side/i);
    expect(opening).toMatch(/may have been thrown clear/i);
    expect(opening).not.toMatch(/argued|shortcut|stolen|wheel hub split|walked toward/i);
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.wagonEvidence.text).toMatch(/Either person could have walked away, or been thrown clear/i);
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.cargoEvidence.text).toMatch(/without proving one/i);
  });

  it('lets a fresh broke character find Mara and bring both travelers to safety', () => {
    let state = act(fresh(), 'callForMara');
    state = act(state, 'followClothTowardTollpost');
    state = act(state, 'searchMarkerBeforeDark');
    expect(state.run?.sceneId).toBe('travelerFound');
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.travelerFound.text).toMatch(/argued over taking a shortcut/i);
    state = finishAtReunion(state);
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('bothSafeEnding');
    expect(state.character?.money).toBe(0);
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('supports a tracking-first route through the ditch clues', () => {
    let state = act(fresh(), 'inspectWagonFirst');
    state = act(state, 'readTracksByCargo');
    expect(options(state).map((choice) => choice.id)).toContain('followFreshDitchTrail');
    state = act(state, 'followFreshDitchTrail');
    expect(state.run?.sceneId).toBe('ditchEdge');
    state = act(state, 'callFromSafeBank', 0);
    expect(state.run?.sceneId).toBe('travelerFound');
  });

  it('supports an injured-traveler escort and outside-help search route', () => {
    let state = act(fresh(), 'helpHalFirst');
    state = act(state, 'escortHalToFarm');
    expect(state.character?.historyFlags).toContain('escorted_injured_traveler');
    state = act(state, 'sendFarmhandsToSearch');
    state = act(state, 'searchMarkerWithFarmhands');
    expect(state.run?.sceneId).toBe('travelerFound');
    state = finishAtReunion(state, 'acceptCompactWheelWrench');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('compactWheelWrench');
    expect(ITEMS.compactWheelWrench.carryable).toBe(true);
  });

  it('supports repair and investigation that reveal the crash cause', () => {
    let state = act(fresh('pocketToolkit'), 'inspectWagonFirst');
    state = act(state, 'inspectHubWithTool');
    expect(state.character?.knowledge).toContain('The wheel hub split at the road rut; the wagon damage is consistent with an accident.');
    state = act(state, 'braceWheelWithTool');
    expect(state.run?.sceneId).toBe('wheelBraced');
    state = act(state, 'leaveBracedWagonFollowTracks');
    expect(state.run?.sceneId).toBe('trackFork');
  });

  it('allows testimony to be challenged with evidence without assuming guilt', () => {
    let state = act(fresh(), 'inspectWagonFirst');
    state = act(state, 'inspectHubByHand');
    state = act(state, 'confrontHalWithWheelEvidence');
    expect(state.run?.sceneId).toBe('halConfession');
    expect(state.character?.historyFlags).toContain('confronted_survivor');
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.halConfession.text).toMatch(/frightened and ashamed/i);
    state = act(state, 'searchTollpostFromConfession');
    expect(state.run?.sceneId).toBe('milepostApproach');
    expect(state.character?.historyFlags).toContain('uncovered_crash_truth');
  });

  it('allows the player to leave without judgment or invisible rewards', () => {
    let state = act(fresh(), 'continuePastCrossing');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.character?.historyFlags).toContain('abandoned_crossroads_search');
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.walkAwayEnding.text).not.toMatch(/coward|shame|selfish/i);
  });

  it('allows brief aid and directions to shelter before leaving the deeper search', () => {
    let state = act(fresh(), 'helpHalFirst');
    state = act(state, 'pointHalTowardFarmAndLeave');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.status).toBe('success');
    expect(sceneText(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.walkAwayEnding, state)).toMatch(/point him toward the nearby farmhouse/i);
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.character?.historyFlags).toContain('abandoned_crossroads_search');
  });

  it('lets the player respect Mara’s wish for space instead of forcing an immediate reunion', () => {
    const state = atScene('travelerFound', 25);
    state.run!.flags.push('foundAtMarker');
    let apart = act(state, 'respectMaraRequest');
    expect(apart.run?.sceneId).toBe('maraAtFarm');
    expect(apart.run?.flags).toContain('respectedMaraSpace');
    apart = act(apart, 'leaveMaraSafeForMorning');
    expect(apart.run?.sceneId).toBe('safeApartEnding');
    expect(apart.run?.status).toBe('success');
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.safeApartEnding.text).not.toMatch(/wrong|selfish|shame/i);
  });

  it('preserves a late rescue route with a headlamp and narrows unlit options', () => {
    const darkWithLight = atScene('trackFork', 34, 'minerHeadlamp');
    const darkWithoutLight = atScene('trackFork', 34);
    expect(timeStatus(LAST_LIGHT_AT_MILLERS_CROSSING, 34).phase?.id).toBe('dark');
    expect(options(darkWithLight).map((choice) => choice.id)).toContain('followDitchWithHeadlamp');
    expect(options(darkWithLight).map((choice) => choice.id)).not.toContain('searchDitchInDarkWithoutLamp');
    expect(options(darkWithoutLight).map((choice) => choice.id)).toContain('searchDitchInDarkWithoutLamp');
    expect(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.milepostApproach.textVariants?.[0].text).toMatch(/lantern/i);

    let lateRescue = act(darkWithLight, 'followDitchWithHeadlamp');
    lateRescue = act(lateRescue, 'callFromSafeBank', 0);
    expect(lateRescue.run?.sceneId).toBe('travelerFound');
    lateRescue = finishAtReunion(lateRescue);
    expect(lateRescue.run?.status).toBe('success');
    expect(lateRescue.character?.historyFlags).toContain('searched_after_dark');
  });

  it('lets time-consuming crash investigation reduce available daylight and makes a wrong track recoverable', () => {
    const quick = act(fresh(), 'callForMara');
    const careful = act(fresh(), 'inspectWagonFirst');
    expect(careful.run?.elapsedMinutes).toBeGreaterThan(quick.run?.elapsedMinutes ?? 0);
    expect(timeStatus(LAST_LIGHT_AT_MILLERS_CROSSING, 12).phase?.id).toBe('dusk');
    let state = atScene('trackFork', 25);
    state = act(state, 'searchDitchInDarkWithoutLamp', 0.999);
    expect(state.run?.sceneId).toBe('tracksObscured');
    expect(options(state).length).toBeGreaterThan(0);
    state = act(state, 'continueEastAfterLostTrail');
    expect(state.run?.sceneId).toBe('milepostApproach');
  });

  it('uses rope, gloves, tools, hook, and headlamp to change odds, time, or access', () => {
    const bareDitch = options(atScene('ditchEdge', 12)).find((choice) => choice.id === 'descendDitchCarefully')!;
    const ropeDitch = options(atScene('ditchEdge', 12, 'travelRope')).find((choice) => choice.id === 'descendDitchWithRope')!;
    expect(ropeDitch.timeCost).toBeLessThan(bareDitch.timeCost ?? Infinity);
    expect(ropeDitch.chance?.probability).toBeGreaterThan(bareDitch.chance?.probability ?? 0);

    const toolHub = LAST_LIGHT_AT_MILLERS_CROSSING.scenes.wagonEvidence.choices.find((choice) => choice.id === 'inspectHubWithTool')!;
    const handHub = LAST_LIGHT_AT_MILLERS_CROSSING.scenes.wagonEvidence.choices.find((choice) => choice.id === 'inspectHubByHand')!;
    expect(toolHub.timeCost).toBeLessThan(handHub.timeCost ?? Infinity);
    expect(options(act(fresh('ratCatchersHook'), 'inspectWagonFirst')).map((choice) => choice.id)).toContain('retrieveCaseWithHook');
    expect(options(atScene('milepostApproach', 34, 'minerHeadlamp')).map((choice) => choice.id)).toContain('searchMarkerWithHeadlamp');
    const markerChoice = options(atScene('trackFork', 10, 'foldingTrailMarker')).find((choice) => choice.id === 'markForkForSearchers');
    expect(markerChoice?.timeCost).toBe(8);
    const noMarkerChoices = options(atScene('trackFork', 10)).map((choice) => choice.id);
    expect(noMarkerChoices).not.toContain('markForkForSearchers');
  });

  it('fails risky checks with foreshadowed consequences, including death only at critical health', () => {
    let state = act(fresh(), 'inspectWagonFirst');
    state = act(state, 'readTracksByCargo');
    state = act(state, 'followFreshDitchTrail');
    state = act(state, 'descendDitchCarefully', 0.999);
    expect(state.run?.sceneId).toBe('slopeSlip');
    expect(state.run?.health).toBe(9);
    expect(options(state).map((choice) => choice.id)).toContain('climbToTollpostAfterSlip');

    let fatal = act(fresh(), 'inspectWagonFirst');
    fatal = act(fatal, 'readTracksByCargo');
    fatal = act(fatal, 'followFreshDitchTrail');
    fatal.run!.health = 1;
    fatal = act(fatal, 'descendDitchCarefully', 0.999);
    expect(fatal.run?.status).toBe('death');
    expect(fatal.run?.sceneId).toBe('__death');
  });

  it('offers two explicit carry-over rewards and never duplicates a carried reward', () => {
    let state = fresh('compactWheelWrench');
    state.run!.sceneId = 'reunion';
    state.run!.visitedSceneIds = ['crossroads', 'reunion'];
    expect(options(state).map((choice) => choice.id)).not.toContain('acceptCompactWheelWrench');
    expect(options(state).map((choice) => choice.id)).toContain('acceptFoldingTrailMarker');
    state = act(state, 'acceptFoldingTrailMarker');
    expect(state.run?.inventory.filter((item) => item === 'foldingTrailMarker')).toHaveLength(1);
    expect(state.run?.acquiredThisRun).toContain('foldingTrailMarker');
  });

  it('uses prior history as a light callback without blocking a fresh character', () => {
    const returning = fresh(null, ['searched_for_missing_traveler']);
    expect(sceneText(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.crossroads, returning)).toMatch(/recognizes your reputation/i);
    const firstRun = fresh();
    expect(sceneText(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.crossroads, firstRun)).not.toMatch(/recognizes your reputation/i);
    expect(options(firstRun)).toHaveLength(4);
  });

  it('keeps fictional time frozen during reading and preserves exact time and visited scenes on resume', () => {
    let state = act(fresh(), 'callForMara');
    state = act(state, 'followClothTowardTollpost');
    const snapshot = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(snapshot.run?.sceneId).toBe('milepostApproach');
    expect(snapshot.run?.elapsedMinutes).toBe(7);
    expect(snapshot.run?.visitedSceneIds).toEqual(['crossroads', 'roadsideCall', 'milepostApproach']);
    expect(sceneText(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.milepostApproach, snapshot)).toBe(sceneText(LAST_LIGHT_AT_MILLERS_CROSSING.scenes.milepostApproach, snapshot));
    expect(snapshot.run?.elapsedMinutes).toBe(7);
  });

  it('has a forward-only reachable graph with no zero-action states for fresh and equipped characters', () => {
    expect(findScenarioGraphProblems(LAST_LIGHT_AT_MILLERS_CROSSING)).toEqual([]);
    for (const item of [null, 'minerHeadlamp', 'travelRope', 'pocketToolkit', 'ratCatchersHook', 'foldingTrailMarker']) {
      const states = traverse(fresh(item));
      expect(states.length).toBeGreaterThan(12);
      for (const state of states) {
        const visited = state.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size).toBe(visited.length);
      }
    }
  });
});
