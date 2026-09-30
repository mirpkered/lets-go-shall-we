import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import type { Choice, SaveData } from '../types';
import { SCENARIOS, UNDER_THE_ICE } from './index';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Lake Traveler');
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, UNDER_THE_ICE, () => 0) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = UNDER_THE_ICE.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, UNDER_THE_ICE, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return UNDER_THE_ICE.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function explore(initial: SaveData): SaveData[] {
  const pending = [initial];
  const visited = new Map<string, SaveData>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({
      scene: run.sceneId, time: run.elapsedMinutes, health: run.health, inventory: run.inventory,
      flags: run.flags, randomSelections: run.randomSelections,
    });
    if (visited.has(key)) continue;
    visited.set(key, state);
    expect(new Set(run.visitedSceneIds).size, `${run.sceneId} has not revisited a scene`).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `${run.sceneId} at ${run.elapsedMinutes} minutes has an action`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} has at most four actions`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, UNDER_THE_ICE, choice, () => 0));
        pending.push(choose(state, UNDER_THE_ICE, choice, () => 0.999));
      } else pending.push(choose(state, UNDER_THE_ICE, choice, () => 0));
    }
  }
  return [...visited.values()];
}

describe('Under the Ice', () => {
  it('registers for random selection and direct QA launch', () => {
    expect(SCENARIOS).toContain(UNDER_THE_ICE);
    expect(SCENARIOS).toContain(selectScenario(SCENARIOS, null, () => 0.999));
    expect(selectScenario(SCENARIOS, UNDER_THE_ICE.id, () => 0)).not.toBe(UNDER_THE_ICE);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start Under the Ice');
  });

  it('introduces the victim and clear geography while the player remains safe on shore', () => {
    const state = fresh();
    const opening = sceneText(UNDER_THE_ICE.scenes.lakeShore, state);
    expect(opening).toContain('north shore');
    expect(opening).toContain('twenty feet out');
    expect(opening).toContain('conscious');
    expect(opening).toContain(state.run?.randomSelections?.victim);
    expect(opening).toContain('You are safe where you stand');
    expect(options(state).map(({ id }) => id)).toEqual(['crawlTowardVictim', 'runForHelp', 'leaveTheLake']);
  });

  it('persists the randomized victim and ice condition with the run', () => {
    const state = fresh();
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.randomSelections).toEqual(state.run?.randomSelections);
    expect(sceneText(UNDER_THE_ICE.scenes.lakeShore, resumed)).toBe(sceneText(UNDER_THE_ICE.scenes.lakeShore, state));
    expect(UNDER_THE_ICE.runRandomSelections?.[0].values.map(({ value }) => value)).not.toContain('Eli');
    expect(UNDER_THE_ICE.runRandomSelections?.[0].values.map(({ value }) => value)).not.toContain('Mara');
    const lateState = fresh();
    lateState.run!.elapsedMinutes = 8;
    expect(sceneText(UNDER_THE_ICE.scenes.lakeShore, lateState)).toMatch(/water has reached their shoulders/i);
  });

  it('lets a fresh character save both people through an early direct rescue', () => {
    let state = act(fresh(), 'crawlTowardVictim', 0);
    expect(state.run?.sceneId).toBe('atTheHole');
    state = act(state, 'pullVictimToShore', 0);
    expect(state.run?.sceneId).toBe('afterExtraction');
    state = act(state, 'carryToShelter', 0);
    expect(state.run?.sceneId).toBe('bothSurvive');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('rescued_person_from_ice');
  });

  it('offers a safe walk-away ending without moralizing', () => {
    const state = act(fresh(), 'leaveTheLake');
    expect(state.run?.sceneId).toBe('victimLostEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('chose_personal_safety_at_ice');
    expect(UNDER_THE_ICE.scenes.victimLostEnding.text).not.toMatch(/coward|shame|should have/i);
  });

  it('supports a rope rescue and allows a blanket to help after extraction', () => {
    let state = act(fresh('travelRope'), 'throwTravelRope', 0);
    expect(state.run?.sceneId).toBe('ropeTaut');
    state = act(state, 'haulFromShore', 0);
    expect(state.run?.sceneId).toBe('afterExtraction');
    const blanket = fresh('weatherproofBlanket');
    blanket.run!.sceneId = 'afterExtraction';
    blanket.run!.visitedSceneIds = ['lakeShore', 'afterExtraction'];
    expect(options(blanket).map(({ id }) => id)).toContain('wrapAndShelter');
    state = act(blanket, 'wrapAndShelter');
    expect(state.run?.sceneId).toBe('bothSurvive');
  });

  it('allows the player to survive while a delayed rescue fails', () => {
    let state = act(fresh(), 'runForHelp', 0.999);
    expect(state.run?.sceneId).toBe('helpUnheard');
    state = act(state, 'runToFarmhouse');
    expect(state.run?.sceneId).toBe('farmerArrivesLate');
    state = act(state, 'stayWithFarmer');
    expect(state.run?.sceneId).toBe('victimLostEnding');
    expect(state.run?.status).toBe('success');
  });

  it('uses whistles and signal mirrors to improve the chance help hears the call', () => {
    const withoutSignal = act(fresh(), 'runForHelp', 0.5);
    const withWhistle = act(fresh('conductorWhistle'), 'runForHelp', 0.5);
    expect(withoutSignal.run?.sceneId).toBe('helpUnheard');
    expect(withWhistle.run?.sceneId).toBe('helpHeard');
    expect(UNDER_THE_ICE.scenes.lakeShore.choices.find(({ id }) => id === 'runForHelp')?.chance?.bonusItems).toContain('roadsideSignalMirror');
  });

  it('lets help arrive and assist from the firm bank without requiring carried gear', () => {
    let state = act(fresh(), 'runForHelp', 0);
    state = act(state, 'waitForFarmer');
    expect(state.run?.sceneId).toBe('farmerArrives');
    state = act(state, 'pullWithFarmer', 0);
    expect(state.run?.sceneId).toBe('afterExtraction');
  });

  it('foreshadows and resolves a direct fall-through risk without forcing death', () => {
    const warning = UNDER_THE_ICE.scenes.lakeShore.choices.find(({ id }) => id === 'crawlTowardVictim')?.hint;
    expect(warning).toMatch(/ice is visibly split/i);
    let state = act(fresh(), 'crawlTowardVictim', 0.999);
    expect(state.run?.sceneId).toBe('throughTheIce');
    expect(state.run?.health).toBe(8);
    state = act(state, 'fightTowardBank', 0);
    expect(state.run?.sceneId).toBe('victimLostEnding');
    expect(state.run?.status).toBe('success');
  });

  it('allows the player to die in the water while the victim survives', () => {
    let state = act(fresh(), 'crawlTowardVictim', 0.999);
    state = act(state, 'fightTowardBank', 0.999);
    expect(state.run?.sceneId).toBe('playerDiesVictimLives');
    expect(state.run?.status).toBe('death');
    expect(sceneText(UNDER_THE_ICE.scenes.playerDiesVictimLives, state)).toMatch(/someone reaches the lake in time/i);
  });

  it('supports retreat, player sacrifice, and the rare both-die desperate outcome', () => {
    let state = act(fresh(), 'crawlTowardVictim', 0);
    state = act(state, 'retreatFromCracks');
    expect(state.run?.sceneId).toBe('victimLostEnding');

    state = act(fresh(), 'crawlTowardVictim', 0);
    state = act(state, 'pushVictimClear', 0);
    expect(state.run?.sceneId).toBe('playerDiesVictimLives');
    expect(state.run?.status).toBe('death');

    state = act(fresh(), 'crawlTowardVictim', 0);
    state = act(state, 'pushVictimClear', 0.999);
    expect(state.run?.sceneId).toBe('bothDie');
    expect(state.run?.status).toBe('death');
  });

  it('advances fictional time through clear exposure phases', () => {
    expect(UNDER_THE_ICE.timePhases?.map(({ label }) => label)).toEqual(['Calling for Help', 'Losing Strength', 'Going Numb', 'Going Under']);
    let state = fresh();
    expect(timeStatus(UNDER_THE_ICE, 0).phase?.id).toBe('calling');
    state = act(state, 'runForHelp', 0);
    expect(state.run?.elapsedMinutes).toBe(3);
    state = act(state, 'waitForFarmer');
    expect(state.run?.elapsedMinutes).toBe(7);
    expect(timeStatus(UNDER_THE_ICE, state.run!.elapsedMinutes).phase?.id).toBe('losingStrength');
  });

  it('has an acyclic, forward-only reachable graph with at least one action at every active state', () => {
    expect(findScenarioGraphProblems(UNDER_THE_ICE)).toEqual([]);
    const states = explore(fresh());
    expect(states.some((state) => state.run?.sceneId === 'bothSurvive')).toBe(true);
    expect(states.some((state) => state.run?.sceneId === 'playerDiesVictimLives')).toBe(true);
    expect(states.some((state) => state.run?.sceneId === 'bothDie')).toBe(true);
    expect(states.some((state) => state.run?.sceneId === 'victimLostEnding')).toBe(true);
  });
});
