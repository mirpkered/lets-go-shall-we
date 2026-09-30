import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, runText, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import { loadSave, SAVE_KEY, saveGame } from '../storage';
import type { Choice, SaveData } from '../types';
import { BURNING_LOFT } from './burningLoft';
import { SCENARIOS } from './index';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Loft Tester');
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, BURNING_LOFT, () => 0) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = BURNING_LOFT.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, BURNING_LOFT, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return BURNING_LOFT.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function reachBeamCleared(state = fresh()): SaveData {
  state = act(state, 'enterFromLane');
  expect(state.run?.sceneId).toBe('insideShop');
  state = act(state, 'shiftFallenBeam');
  expect(state.run?.sceneId).toBe('beamCleared');
  return state;
}

describe('The Burning Loft', () => {
  it('registers as a random adventure and a direct QA launch', () => {
    expect(SCENARIOS).toContain(BURNING_LOFT);
    expect(selectScenario(SCENARIOS, BURNING_LOFT.id, () => 0)).not.toBe(BURNING_LOFT);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start The Burning Loft');
    expect(startAdventure({ version: 1, bank: [], character: null, run: null }, BURNING_LOFT).run?.scenarioId).toBe(BURNING_LOFT.id);
  });

  it('uses an unused randomized person name and preserves it in the exact run save', () => {
    const state = fresh();
    const name = state.run!.randomSelections?.trappedPerson;
    expect(name).toBe('Tamsin');
    expect(BURNING_LOFT.runRandomSelections?.[0].values.map(({ value }) => value)).not.toContain('Eli');
    expect(BURNING_LOFT.runRandomSelections?.[0].values.map(({ value }) => value)).not.toContain('Mara');
    expect(sceneText(BURNING_LOFT.scenes.roadsideFire, state)).toContain(name);
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.randomSelections).toEqual(state.run?.randomSelections);
    expect(sceneText(BURNING_LOFT.scenes.roadsideFire, resumed)).toBe(sceneText(BURNING_LOFT.scenes.roadsideFire, state));
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    saveGame(state, storage);
    expect(values.has(SAVE_KEY)).toBe(true);
    expect(loadSave(storage).run?.randomSelections).toEqual(state.run?.randomSelections);
  });

  it('lets a fresh, broke character rescue the apprentice by staying outside', () => {
    let state = act(fresh(), 'fetchLadder');
    expect(timeStatus(BURNING_LOFT, state.run!.elapsedMinutes).phase?.id).toBe('smoke');
    state = act(state, 'guideDownLadder');
    expect(state.run?.sceneId).toBe('rewardOffer');
    expect(state.character?.historyFlags).toContain('rescued_person_from_fire');
    expect(state.run?.flags).toContain('personRescued');
    expect(state.character?.health).toBe(10);
    state = act(state, 'declineReward');
    expect(state.run?.sceneId).toBe('survivedEnding');
    expect(state.run?.status).toBe('success');
  });

  it('offers the promised, existing carryable tools without duplicates', () => {
    const opening = sceneText(BURNING_LOFT.scenes.roadsideFire, fresh());
    expect(opening).toContain('Folding Pry Tool or Fire Beater');
    let state = act(act(fresh(), 'fetchLadder'), 'guideDownLadder');
    expect(options(state).map((choice) => choice.id)).toEqual(['acceptPryTool', 'acceptFireBeater', 'declineReward']);
    state = act(state, 'acceptPryTool');
    expect(state.run?.acquiredThisRun).toContain('foldingPryTool');
    expect(ITEMS.foldingPryTool.carryable).toBe(true);
    const alreadyEquipped = fresh('foldingPryTool');
    alreadyEquipped.run!.sceneId = 'rewardOffer';
    alreadyEquipped.run!.visitedSceneIds = ['roadsideFire', 'rewardOffer'];
    expect(options(alreadyEquipped).map((choice) => choice.id)).not.toContain('acceptPryTool');
  });

  it('allows a distinct direct-entry route to save both people', () => {
    let state = reachBeamCleared();
    state = act(state, 'runOutTogether');
    expect(state.run?.sceneId).toBe('rewardOffer');
    state = act(state, 'acceptFireBeater');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('entered_burning_structure_for_stranger');
  });

  it('allows a safe walk-away that leaves the trapped person dead', () => {
    const state = act(fresh(), 'leaveTheFire');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.health).toBe(10);
    expect(BURNING_LOFT.scenes.walkAwayEnding.text).toMatch(/has not come out/i);
    expect(BURNING_LOFT.scenes.walkAwayEnding.text).not.toMatch(/escaped/i);
  });

  it('can kill the player after the apprentice reaches safety', () => {
    let state = reachBeamCleared();
    state = act(state, 'holdBeamForPerson', 0);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('playerDiesPersonLives');
    expect(BURNING_LOFT.scenes.playerDiesPersonLives.text).toContain('reaches the lane');
    expect(BURNING_LOFT.scenes.playerDiesPersonLives.text).toContain('You do not');
  });

  it('allows both to die only after the explicitly extreme final reach', () => {
    let state = reachBeamCleared();
    state = act(state, 'runOutTogether', 0.999);
    expect(state.run?.sceneId).toBe('lastChance');
    expect(BURNING_LOFT.scenes.lastChance.text).toMatch(/could kill you both/i);
    state = act(state, 'reachThroughFallenBeam', 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('bothDeadEnding');
  });

  it('preserves a retreat after failed entry instead of forcing a second attempt', () => {
    let state = act(fresh(), 'enterFromLane', 0.999);
    expect(state.run?.sceneId).toBe('entryInjury');
    expect(state.run?.health).toBe(8);
    expect(options(state).map((choice) => choice.id)).toContain('retreatAfterEntryInjury');
    state = act(state, 'retreatAfterEntryInjury');
    expect(state.run?.status).toBe('success');
    expect(state.run?.health).toBe(8);
  });

  it('makes gear improve odds without making smoke or structure safe', () => {
    const bare = BURNING_LOFT.scenes.roadsideFire.choices.find((choice) => choice.id === 'enterFromLane')!;
    expect(bare.chance?.probability).toBeGreaterThan(0);
    expect(bare.chance?.probability).toBeLessThan(1);
    expect(bare.chance?.bonusItems).toContain('smokeHood');
    expect(bare.chance?.bonusItems).toContain('heavyLeatherGloves');
    const hood = act(fresh('smokeHood'), 'enterFromLane', 0.7);
    expect(hood.run?.sceneId).toBe('insideShop');
    expect(BURNING_LOFT.scenes.insideShop.choices.find((choice) => choice.id === 'shiftFallenBeam')?.chance?.bonusItems).toContain('smokeHood');
  });

  it('offers a rope-assisted outside rescue and a field-bandage recovery route', () => {
    let state = act(act(fresh('travelRope'), 'callUp'), 'anchorRopeAtPost', 0.81);
    expect(state.run?.sceneId).toBe('rewardOffer');
    let hurt = act(fresh('fieldBandageRoll'), 'enterFromLane', 0.999);
    hurt = act(hurt, 'useFieldBandage');
    expect(hurt.run?.sceneId).toBe('bandagedOutside');
    expect(hurt.run?.health).toBe(9);
    expect(hurt.run?.inventory).not.toContain('fieldBandageRoll');
  });

  it('advances fictional time through the published fire phases', () => {
    let state = act(fresh(), 'callUp');
    expect(state.run?.elapsedMinutes).toBe(2);
    state = act(state, 'callNeighbors');
    expect(state.run?.elapsedMinutes).toBe(11);
    expect(timeStatus(BURNING_LOFT, state.run!.elapsedMinutes).phase?.id).toBe('spread');
    state = act(state, 'neighborsGuideDown', 0.999);
    expect(state.run?.elapsedMinutes).toBe(14);
    expect(timeStatus(BURNING_LOFT, state.run!.elapsedMinutes).phase?.id).toBe('failing');
    expect(sceneText(BURNING_LOFT.scenes.neighborRescueFail, state)).toMatch(/upper floor gives way/i);
  });

  it('foreshadows danger, states both exits and the reward before asking for risk', () => {
    const opening = sceneText(BURNING_LOFT.scenes.roadsideFire, fresh());
    expect(opening).toMatch(/outside.*safe/i);
    expect(opening).toMatch(/south doors/);
    expect(opening).toMatch(/loft window/);
    expect(opening).toMatch(/orchard ladder/);
    expect(opening).toMatch(/Folding Pry Tool or Fire Beater/);
    expect(BURNING_LOFT.scenes.roadsideFire.choices.find((choice) => choice.id === 'enterFromLane')?.hint).toMatch(/may kill you/i);
    expect(BURNING_LOFT.scenes.personOutsideYouInside.choices.find((choice) => choice.id === 'escapeBySouthDoor')?.hint).toMatch(/may kill you/i);
    expect(BURNING_LOFT.scenes.lastChance.choices.find((choice) => choice.id === 'reachThroughFallenBeam')?.hint).toMatch(/both of you/i);
  });

  it('keeps scenes concise and buttons short for the phone layout', () => {
    const copy = Object.values(BURNING_LOFT.scenes).flatMap((scene) => [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text)]);
    const longest = Math.max(...copy.map((text) => text.length));
    expect(longest).toBeLessThan(620);
    for (const scene of Object.values(BURNING_LOFT.scenes)) {
      expect(scene.choices.length, `${scene.id} choice count`).toBeLessThanOrEqual(4);
      for (const choice of scene.choices) expect(choice.label.length, `${scene.id}.${choice.id} label`).toBeLessThan(56);
    }
  });

  it('has a forward-only reachable graph with at least one valid action in every active state', () => {
    expect(findScenarioGraphProblems(BURNING_LOFT)).toEqual([]);
    const queue = [fresh(), fresh('smokeHood'), fresh('travelRope'), fresh('fireBeater'), fresh('fieldBandageRoll'), fresh('ironRopeClamp'), fresh('heavyLeatherGloves')];
    const seen = new Set<string>();
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const state = queue[cursor];
      if (state.run?.status !== 'active') continue;
      const signature = JSON.stringify([state.run.sceneId, state.run.elapsedMinutes, state.run.health, state.run.inventory, state.run.flags]);
      if (seen.has(signature)) continue;
      seen.add(signature);
      const scene = BURNING_LOFT.scenes[state.run.sceneId];
      const available = options(state);
      expect(available.length, `${scene.id} at ${state.run.elapsedMinutes} minutes`).toBeGreaterThan(0);
      expect(available.length, `${scene.id} must fit the 2×2 phone grid`).toBeLessThanOrEqual(4);
      for (const choice of available) {
        for (const roll of [0, 0.999]) {
          const next = choose(state, BURNING_LOFT, choice, () => roll);
          if (next.run?.status !== 'active') continue;
          expect(next.run.sceneId).not.toBe(state.run.sceneId);
          expect(state.run.visitedSceneIds ?? []).not.toContain(next.run.sceneId);
          queue.push(next);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
