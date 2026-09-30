import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { THE_EMPTY_CRADLE } from './theEmptyCradle';
import type { Choice, SaveData } from '../types';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Cradle Tester');
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, THE_EMPTY_CRADLE) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = THE_EMPTY_CRADLE.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, THE_EMPTY_CRADLE, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return THE_EMPTY_CRADLE.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function exploreReachable(initial: SaveData): SaveData[] {
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
    for (const choice of available) {
      if (choice.chance) {
        pending.push(choose(state, THE_EMPTY_CRADLE, choice, () => 0));
        pending.push(choose(state, THE_EMPTY_CRADLE, choice, () => 0.999));
      } else pending.push(choose(state, THE_EMPTY_CRADLE, choice, () => 0));
    }
  }
  return reached;
}

describe('The Empty Cradle', () => {
  it('registers for surprise selection and direct QA launch', () => {
    expect(SCENARIOS).toContain(THE_EMPTY_CRADLE);
    expect(selectScenario(SCENARIOS, THE_EMPTY_CRADLE.id, () => 0)).not.toBe(THE_EMPTY_CRADLE);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start The Empty Cradle');
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
  });

  it('keeps the opening uncertain and makes theories learnable instead of revealing the answer', () => {
    expect(THE_EMPTY_CRADLE.scenes.searchAlarm.text).toMatch(/missing for about twenty minutes/i);
    expect(THE_EMPTY_CRADLE.scenes.searchAlarm.text).not.toMatch(/pump house|tin boat|trapped/i);
    expect(THE_EMPTY_CRADLE.scenes.familyAccounts.text).toMatch(/tin boat/);
    expect(THE_EMPTY_CRADLE.scenes.yardClues.text).toMatch(/could have come from a scarf or a feed tie/);
  });

  it('lets a fresh broke character find Nessa and reach the ending without gear', () => {
    let state = act(fresh(), 'inspectYardFirst');
    state = act(state, 'followDogPrints');
    state = act(state, 'continueFromOrchard');
    state = act(state, 'followDogToPumpHouse');
    state = act(state, 'callAndListenAtShed');
    state = act(state, 'freePumpShedDoorByHand');
    expect(state.run?.sceneId).toBe('childOut');
    state = act(state, 'takeHighPathHome');
    state = act(state, 'acceptTrailWhistle');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('safeReturnEnding');
    expect(state.character?.money).toBe(0);
    expect(state.run?.inventory).toContain('trailWhistle');
    expect(state.character?.historyFlags).toContain('joined_missing_child_search');
  });

  it('supports a distinct search-party rescue and a different item reward', () => {
    let state = act(fresh(), 'sendForSearchersEarly');
    state = act(state, 'partyTakeDogWest');
    state = act(state, 'approachShedWithParty');
    state = act(state, 'bringNeighborsToShed');
    state = act(state, 'keepNessaWarmWhileHelpersWork');
    expect(state.run?.sceneId).toBe('childOutWithHelp');
    state = act(state, 'takeChildHomeWithParty');
    state = act(state, 'acceptWeatherproofBlanket');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('weatherproofBlanket');
    expect(THE_EMPTY_CRADLE.scenes.safeReturnEnding.text).toMatch(/careful search took time/i);
  });

  it('supports a late, partial rescue after time has worsened', () => {
    let state = act(fresh(), 'sendForSearchersEarly');
    state = act(state, 'partyCheckHayloft');
    state = act(state, 'followDogAfterHayloft');
    state = act(state, 'checkWashoutForTracks', 0);
    state = act(state, 'followPrintToPumpHouse');
    state = act(state, 'callAndListenAtShed');
    expect(timeStatus(THE_EMPTY_CRADLE, state.run?.elapsedMinutes).phase?.id).toBe('critical');
    state = act(state, 'shelterAndSignalAtDoor');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('lateRescueEnding');
    expect(state.character?.historyFlags).toContain('found_missing_child');
  });

  it('lets the player follow the plausible creek theory and recover from a wrong lead', () => {
    let state = act(act(fresh(), 'questionFamilyFirst'), 'followCreekAfterQuestions');
    state = act(state, 'traceCreekEarly');
    expect(state.run?.sceneId).toBe('creekFalseLead');
    expect(THE_EMPTY_CRADLE.scenes.creekFalseLead.text).toMatch(/narrowed the choices rather than ended the search/i);
    state = act(state, 'followServiceTrackAfterCreek');
    state = act(state, 'followDogToPumpHouse');
    expect(state.run?.sceneId).toBe('oldPumpShed');
  });

  it('keeps money irrelevant and supports a no-cost choice rather than gating success', () => {
    const state = act(fresh(), 'questionFamilyFirst');
    expect(state.character?.money).toBe(0);
    expect(options(state).map((choice) => choice.id)).toContain('checkHayloftFromTestimony');
    expect(THE_EMPTY_CRADLE.scenes.safeReturnEnding.ending).toBe('success');
  });

  it('supports the difficult choice to spend time gathering helpers versus acting alone', () => {
    const solo = act(fresh(), 'inspectYardFirst');
    const withHelp = act(fresh(), 'sendForSearchersEarly');
    expect(withHelp.run?.elapsedMinutes).toBeGreaterThan(solo.run?.elapsedMinutes ?? 0);
    expect(THE_EMPTY_CRADLE.scenes.searchPartyArrives.text).toMatch(/search different places at once/i);
    expect(THE_EMPTY_CRADLE.scenes.oldPumpShed.choices.map((choice) => choice.id)).toContain('bringNeighborsToShed');
  });

  it('foreshadows a risky washout check and advances failure with injury', () => {
    let state = act(act(act(fresh(), 'inspectYardFirst'), 'followDogPrints'), 'continueFromOrchard');
    state = act(state, 'checkWashoutForTracks', 0.999);
    expect(state.run?.sceneId).toBe('slipAtWashout');
    expect(state.run?.health).toBe(9);
    expect(options(state).map((choice) => choice.id)).toContain('continueUpperTrack');
    state = act(state, 'continueUpperTrack');
    expect(state.run?.sceneId).toBe('oldPumpShed');
  });

  it('allows a low-health failed check to cause death through the normal death state', () => {
    let state = act(act(act(fresh(), 'inspectYardFirst'), 'followDogPrints'), 'continueFromOrchard');
    state.run!.health = 1;
    state = act(state, 'checkWashoutForTracks', 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
  });

  it('uses carried headlamp and tools as useful alternatives without requiring them', () => {
    let lamp = act(act(fresh('minerHeadlamp'), 'inspectYardFirst'), 'followDogPrints');
    lamp.run!.sceneId = 'creekSearch';
    lamp.run!.elapsedMinutes = 18;
    expect(options(lamp).map((choice) => choice.id)).toContain('traceCreekWithHeadlamp');
    expect(options(lamp).find((choice) => choice.id === 'traceCreekWithHeadlamp')?.timeCost).toBe(3);

    let tool = act(act(act(fresh('pocketToolkit'), 'inspectYardFirst'), 'followDogPrints'), 'continueFromOrchard');
    tool = act(tool, 'followDogToPumpHouse');
    tool = act(tool, 'callAndListenAtShed');
    expect(options(tool).map((choice) => choice.id)).toContain('freePumpShedDoorWithTool');
    expect(options(tool).map((choice) => choice.id)).not.toContain('freePumpShedDoorByHand');
    const toolChoice = options(tool).find((choice) => choice.id === 'freePumpShedDoorWithTool')!;
    expect(toolChoice.timeCost).toBe(4);
    expect(toolChoice.chance?.probability).toBe(0.88);

    let bare = act(act(act(fresh(), 'inspectYardFirst'), 'followDogPrints'), 'continueFromOrchard');
    bare = act(bare, 'followDogToPumpHouse');
    bare = act(bare, 'callAndListenAtShed');
    const handChoice = options(bare).find((choice) => choice.id === 'freePumpShedDoorByHand')!;
    expect(handChoice.timeCost).toBeGreaterThan(toolChoice.timeCost ?? 0);
    expect(handChoice.chance?.probability).toBeLessThan(toolChoice.chance?.probability ?? 1);
  });

  it('uses a prior rescue as a light trust callback while leaving fresh characters fully playable', () => {
    const returning = fresh();
    returning.character!.historyFlags = ['found_missing_child'];
    expect(sceneText(THE_EMPTY_CRADLE.scenes.searchAlarm, returning)).toMatch(/recognizes you as someone/i);
    const freshText = sceneText(THE_EMPTY_CRADLE.scenes.searchAlarm, fresh());
    expect(freshText).not.toMatch(/recognizes you as someone/i);
    expect(options(fresh()).length).toBeGreaterThan(0);
  });

  it('preserves the exact fictional-time and visited-scene state through local-save serialization', () => {
    let state = act(fresh(), 'inspectYardFirst');
    state = act(state, 'followDogPrints');
    const restored = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(restored.run?.sceneId).toBe('orchardFalseLead');
    expect(restored.run?.elapsedMinutes).toBe(state.run?.elapsedMinutes);
    expect(restored.run?.visitedSceneIds).toEqual(state.run?.visitedSceneIds);
    expect(restored.run?.visitedSceneIds).toEqual(['searchAlarm', 'yardClues', 'orchardFalseLead']);
  });

  it('changes creek and track cues as fictional time passes, without wall-clock effects', () => {
    const state = act(fresh(), 'questionFamilyFirst');
    expect(timeStatus(THE_EMPTY_CRADLE, state.run?.elapsedMinutes).phase?.id).toBe('recent');
    const late = { ...state, run: { ...state.run!, sceneId: 'creekSearch', elapsedMinutes: 30 } };
    expect(sceneText(THE_EMPTY_CRADLE.scenes.creekSearch, late)).toMatch(/cover the lowest prints/i);
    expect(sceneText(THE_EMPTY_CRADLE.scenes.creekSearch, state)).not.toMatch(/cover the lowest prints/i);
  });

  it('offers a respectful withdrawal ending without guaranteeing an outcome or reward', () => {
    const state = act(fresh(), 'continuePastAlderbrook');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('refusalEnding');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(THE_EMPTY_CRADLE.scenes.refusalEnding.text).toMatch(/does not judge your choice/i);
  });

  it('has a forward-only graph and no reachable active zero-choice state for fresh and geared characters', () => {
    expect(findScenarioGraphProblems(THE_EMPTY_CRADLE)).toEqual([]);
    for (const carried of [null, 'minerHeadlamp', 'pocketToolkit', 'travelRope']) {
      const reached = exploreReachable(fresh(carried));
      expect(reached.length).toBeGreaterThan(10);
      for (const state of reached) {
        const visited = state.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size).toBe(visited.length);
      }
    }
  });
});
