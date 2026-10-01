import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { THE_ROAD_BELOW } from './theRoadBelow';
import type { Choice, SaveData } from '../types';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Road Rescue Tester');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, THE_ROAD_BELOW) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = THE_ROAD_BELOW.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, THE_ROAD_BELOW, choice!, () => random);
}

function options(state: SaveData): Choice[] {
  return THE_ROAD_BELOW.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function reachDirectRescue(state = fresh()): SaveData {
  for (const id of ['callIntoOpening', 'approachAfterKnocks', 'chooseDirectDescent', 'carefulDirectDescent', 'followFreshMarks', 'followArchEarly']) state = act(state, id);
  expect(state.run?.sceneId).toBe('trappedWorker');
  return state;
}

describe('The Road Below', () => {
  it('registers for random repeat-avoiding play and direct QA launch', () => {
    expect(SCENARIOS).toContain(THE_ROAD_BELOW);
    expect(selectScenario(SCENARIOS, THE_ROAD_BELOW.id, () => 0)).not.toBe(THE_ROAD_BELOW);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start The Road Below');
    expect(startAdventure(empty, THE_ROAD_BELOW).run?.scenarioId).toBe(THE_ROAD_BELOW.id);
  });

  it('supports a fresh broke character through the slower brace-first rescue route', () => {
    let state = fresh();
    for (const id of ['inspectFreshTracks', 'followTracksToOpening', 'chooseBraceFirst', 'braceLipByHand', 'descendAfterBracing', 'followFreshMarks', 'useSideRunLate', 'braceBeforeFreeing', 'braceWithLooseTimber', 'liftTogetherAfterBrace', 'markRoadAfterRescue', 'acceptSteelWedgecostlyRescueEnding']) state = act(state, id);
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyRescueEnding');
    expect(state.run?.acquiredThisRun).toContain('steelWedge');
    expect(state.character?.historyFlags).toContain('rescued_trapped_traveler');
    expect(state.character?.historyFlags).toContain('stabilized_road_collapse');
  });

  it('supports a fast direct descent with a costly rescue ending', () => {
    let state = act(reachDirectRescue(), 'pullNeriFreeNow');
    expect(state.run?.sceneId).toBe('rescuedNeri');
    state = act(state, 'leaveWithNeriNow');
    expect(state.run?.sceneId).toBe('costlyRescueRewards');
    state = act(state, 'declineRoadRewardcostlyRescueEnding');
    expect(state.run?.status).toBe('success');
    expect(THE_ROAD_BELOW.scenes.costlyRescueEnding.text).toContain('shoulder has collapsed across the road');
  });

  it('supports the distinct lower-outlet route around the failed shoulder', () => {
    let state = fresh();
    for (const id of ['inspectFreshTracks', 'followTracksToOpening', 'scoutLowerOutlet', 'followOuterDrain', 'crawlFromOutletToMain', 'followArchEarly']) state = act(state, id);
    expect(state.run?.sceneId).toBe('trappedWorker');
    expect(state.run?.flags).toContain('foundAlternateRoute');
  });

  it('supports outside help and a paid faster winch delivery', () => {
    let state = fresh(2);
    for (const id of ['callIntoOpening', 'goForHelpAfterKnocks', 'payCartForWinch', 'helpCrewSecureRoad', 'acceptDrainageHookcleanRescueEnding']) state = act(state, id);
    expect(state.character?.money).toBe(0);
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('cleanRescueEnding');
    expect(state.run?.acquiredThisRun).toContain('drainageHook');
    expect(state.character?.historyFlags).toContain('called_road_crew');
  });

  it('allows a no-cost outside-help route for a fresh broke character', () => {
    let state = act(act(fresh(), 'callIntoOpening'), 'goForHelpAfterKnocks');
    state = act(state, 'bringCrewToRoad');
    state = act(state, 'leaveAfterCrewRescue');
    state = act(state, 'declineRoadRewardcostlyRescueEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyRescueEnding');
  });

  it('lets the player warn road users and leave without entering', () => {
    let state = act(fresh(), 'markRoadForTravelers');
    state = act(state, 'leaveAfterMarking');
    expect(state.run?.sceneId).toBe('warningEnding');
    expect(state.character?.historyFlags).toContain('protected_road_users');
    expect(state.character?.historyFlags).toContain('left_collapsed_road');
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('uses the Miner’s Headlamp to survey faster and with lower risk', () => {
    const state = fresh(0, 'minerHeadlamp');
    state.run!.sceneId = 'firstChamber';
    state.run!.visitedSceneIds = ['roadsideDiscovery', 'firstChamber'];
    const before = state.run!.elapsedMinutes!;
    const choices = options(state);
    expect(choices.map((choice) => choice.id)).toContain('surveySideChannelWithLamp');
    expect(choices.map((choice) => choice.id)).not.toContain('surveySideChannelByLantern');
    const next = act(state, 'surveySideChannelWithLamp');
    expect(next.run?.sceneId).toBe('channelSurvey');
    expect(next.run!.elapsedMinutes! - before).toBe(2);
  });

  it('uses Travel Rope to make the risky direct descent more reliable', () => {
    const bare = act(act(act(fresh(), 'callIntoOpening'), 'approachAfterKnocks'), 'chooseDirectDescent');
    const bareResult = act(bare, 'carefulDirectDescent', 0.75);
    expect(bareResult.run?.sceneId).toBe('entrySlip');
    const rope = act(act(act(fresh(0, 'travelRope'), 'callIntoOpening'), 'approachAfterKnocks'), 'chooseDirectDescent');
    const ropeResult = act(rope, 'carefulDirectDescent', 0.75);
    expect(ropeResult.run?.sceneId).toBe('firstChamber');
  });

  it('changes the main-channel route as water and structural danger increase', () => {
    const early = fresh();
    early.run!.sceneId = 'mainChannel';
    early.run!.visitedSceneIds = ['roadsideDiscovery', 'mainChannel'];
    expect(options(early).map((choice) => choice.id)).toContain('followArchEarly');
    expect(options(early).map((choice) => choice.id)).not.toContain('useSideRunLate');
    const heldTooLong = structuredClone(early);
    heldTooLong.run!.elapsedMinutes = 34;
    const lateOptions = options(heldTooLong).map((choice) => choice.id);
    expect(lateOptions).toContain('useSideRunLate');
    expect(lateOptions).not.toContain('followArchEarly');
    expect(sceneText(THE_ROAD_BELOW.scenes.mainChannel, heldTooLong)).toMatch(/main channel is taking on water/i);
    expect(timeStatus(THE_ROAD_BELOW, 34).phase?.label).toBe('Critical');
  });

  it('keeps real-world waiting out of fictional time and preserves the exact saved state', () => {
    const state = reachDirectRescue();
    const before = state.run!.elapsedMinutes;
    sceneText(THE_ROAD_BELOW.scenes.trappedWorker, state);
    expect(state.run?.elapsedMinutes).toBe(before);
    const resumed = structuredClone(state);
    expect(resumed.run?.sceneId).toBe('trappedWorker');
    expect(resumed.run?.elapsedMinutes).toBe(before);
    expect(resumed.run?.visitedSceneIds).toEqual(state.run?.visitedSceneIds);
    expect(resumed.run?.flags).toEqual(state.run?.flags);
  });

  it('keeps the person and culvert origin unknown before they are found', () => {
    for (const id of ['roadsideDiscovery', 'freshTracks', 'heardCall', 'markedRoad', 'hazardAssessment', 'directDescent', 'outletApproach', 'lowCulvert', 'firstChamber', 'channelSurvey', 'mainChannel']) {
      const text = THE_ROAD_BELOW.scenes[id].text;
      expect(text).not.toMatch(/Neri|surveyor is pinned|trapped beneath/i);
    }
    expect(THE_ROAD_BELOW.scenes.trappedWorker.text).toContain('Neri');
    expect(THE_ROAD_BELOW.scenes.hazardAssessment.text).toContain('storm-drain culvert');
  });

  it('uses visible above-water evidence and makes the rescue about water and access, not a pinned body', () => {
    expect(THE_ROAD_BELOW.scenes.lowCulvert.text).toMatch(/above the waterline.*mud smear/i);
    expect(THE_ROAD_BELOW.scenes.lowCulvert.text).not.toMatch(/boot scuffs/i);
    expect(THE_ROAD_BELOW.scenes.lowCulvert.choices.find((choice) => choice.id === 'crawlFromOutletToMain')?.label).toMatch(/mud smear/i);
    expect(THE_ROAD_BELOW.scenes.trappedWorker.text).toMatch(/raised stone shelf.*fallen beam blocks the low passage.*has not fallen on him/i);
    expect(THE_ROAD_BELOW.scenes.trappedWorker.text).toMatch(/current below the shelf is already too strong to cross safely/i);
    expect(THE_ROAD_BELOW.scenes.bracePlan.text).toMatch(/low outlet.*water away.*packed with silt/i);
    expect(THE_ROAD_BELOW.scenes.bracedWorker.text).toMatch(/water level has dropped.*shelf edge/i);
    for (const id of ['trappedWorker', 'bracePlan', 'braceFailed', 'bracedWorker', 'rescueFailure', 'sideAngleAttempt', 'finalRescueFailure']) {
      expect(THE_ROAD_BELOW.scenes[id].text).not.toMatch(/pinned beneath|free his leg|lift the slab/i);
    }
  });

  it('offers every acquired item visibly and prevents duplicate unique rewards', () => {
    for (const scene of Object.values(THE_ROAD_BELOW.scenes)) {
      for (const choice of scene.choices) {
        for (const itemId of choice.effects?.gainItems ?? []) expect(choice.label.toLowerCase()).toContain(ITEMS[itemId].name.toLowerCase());
      }
    }
    const state = fresh(0, 'steelWedge');
    state.run!.sceneId = 'cleanRescueRewards';
    state.run!.visitedSceneIds = ['roadsideDiscovery', 'cleanRescueRewards'];
    const offered = options(state).map((choice) => choice.id);
    expect(offered).not.toContain('acceptSteelWedgecleanRescueEnding');
    expect(offered).toContain('acceptDrainageHookcleanRescueEnding');
  });

  it('makes a failed direct entry advance into a changed situation', () => {
    const state = act(act(act(fresh(), 'callIntoOpening'), 'approachAfterKnocks'), 'chooseDirectDescent');
    const failure = act(state, 'dropBeforeItMoves', 0.99);
    expect(failure.run?.sceneId).toBe('entrySlip');
    expect(failure.run?.health).toBe(7);
    expect(failure.run?.flags).toContain('entranceCompromised');
    expect(options(failure).length).toBeGreaterThan(0);
  });

  it('foreshadows a lethal extraction failure before allowing death', () => {
    let state = reachDirectRescue();
    state.run!.health = 2;
    expect(THE_ROAD_BELOW.scenes.trappedWorker.text).toMatch(/current below the shelf is already too strong|water now covers the lower shelf/i);
    state = act(state, 'pullNeriFreeNow', 0.99);
    expect(state.run?.status).toBe('death');
    expect(state.run?.health).toBe(0);
  });

  it('uses history only as a callback and leaves the full route open to fresh characters', () => {
    const state = fresh();
    expect(options(state).map((choice) => choice.id)).toHaveLength(4);
    const callback = fresh();
    callback.character!.historyFlags.push('rescued_trapped_traveler');
    expect(sceneText(THE_ROAD_BELOW.scenes.roadsideDiscovery, callback)).toMatch(/pulled someone from a collapse before/i);
    expect(options(callback).map((choice) => choice.id)).toEqual(options(state).map((choice) => choice.id));
  });

  it('validates the forward-only graph and has no reachable zero-action active state', () => {
    expect(findScenarioGraphProblems(THE_ROAD_BELOW)).toEqual([]);
    for (const scene of Object.values(THE_ROAD_BELOW.scenes)) {
      expect(scene.choices.length).toBeLessThanOrEqual(4);
      if (!scene.ending) expect(scene.choices.length).toBeGreaterThan(0);
    }
    const queue: SaveData[] = [fresh(2)];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), history: [...state.character!.historyFlags].sort(), money: state.character!.money, health: run.health, elapsed: run.elapsedMinutes });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = THE_ROAD_BELOW.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const available = options(state);
      expect(available.length, `${scene.id} must expose an action`).toBeGreaterThan(0);
      for (const choice of available) {
        const outcomes = [choose(state, THE_ROAD_BELOW, choice, () => 0)];
        if (choice.chance) outcomes.push(choose(state, THE_ROAD_BELOW, choice, () => 0.999999));
        for (const outcome of outcomes) {
          const visits = outcome.run?.visitedSceneIds ?? [];
          expect(new Set(visits).size).toBe(visits.length);
          if (outcome.run) expect(visits).toContain(outcome.run.sceneId);
          queue.push(outcome);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(30);
  });
});
