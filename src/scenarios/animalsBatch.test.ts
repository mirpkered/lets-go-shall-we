import { describe, expect, it } from 'vitest';
import { choose, failCharacter, finishSuccess, getCarriedItems, meets, newCharacter, retireCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave, SAVE_KEY } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  ANIMAL_ADVENTURES, LOOSE_IN_THE_MARKET, THE_BEE_YARD, THE_BROKEN_HARNESS,
  THE_CALF_IN_THE_MUD, THE_DOG_THAT_RETURNS, THE_FRIGHTENED_TEAM,
  THE_INJURED_DOG, THE_OLD_HORSE, THE_OWNERLESS_MULE, THE_STRAY_HORSE,
} from './animalsBatch';

function start(scenario: Scenario, selections: Record<string, string> = {}, item?: string, money = 0): SaveData {
  const character = newCharacter('Animal Batch Tester');
  character.money = money;
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

function selectionsFor(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((all, group) =>
    all.flatMap((base) => group.values.map(({ value }) => ({ ...base, [group.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, item?: string, money = 0): number {
  const queue = [start(scenario, selections, item, money)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    expect(sceneText(scene, state)).not.toMatch(/\{\{[^}]+\}\}/);
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} is actionable`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} has at most four choices`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      const outcomes = choice.chance ? [0, 0.999999] : [0];
      for (const roll of outcomes) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} progresses`).toBe(false);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(20_000);
  }
  return seen.size;
}

describe('animals and working stock adventure batch', () => {
  it('registers ten unique, forward-only adventures with concise mobile copy and valid item references', () => {
    expect(ANIMAL_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(330);
    expect(ANIMAL_ADVENTURES.map(({ title }) => title)).toEqual([
      'The Stray Horse', 'The Calf in the Mud', 'The Dog That Returns', 'The Broken Harness',
      'Loose in the Market', 'The Ownerless Mule', 'The Injured Dog', 'The Frightened Team',
      'The Bee Yard', 'The Old Horse',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of ANIMAL_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} text`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title} uses known item ${id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores every authored truth, chance outcome, and relevant carried item without dead ends or revisits', () => {
    for (const scenario of ANIMAL_ADVENTURES) {
      for (const selections of selectionsFor(scenario)) expect(explore(scenario, selections), scenario.title).toBeGreaterThan(0);
    }
    for (const item of ['travelRope', 'freightmansStrap', 'heavyLeatherGloves', 'farmWhistle', 'gateHook', 'fieldBandageRoll', 'pocketToolkit', 'foremanMultiTool']) {
      for (const scenario of ANIMAL_ADVENTURES) {
        for (const selections of selectionsFor(scenario)) expect(explore(scenario, selections, item), `${scenario.title} with ${item}`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps the loose horse low-stakes and does not imply an emergency', () => {
    expect(THE_STRAY_HORSE.scenes.horseRoad.text).toContain('there is no rider in sight');
    expect(THE_STRAY_HORSE.scenes.horseRoad.choices.map(({ id }) => id)).toContain('leaveHorse');
    const tracked = act(start(THE_STRAY_HORSE), THE_STRAY_HORSE, 'horseRoad', 'lookHorseTracks');
    expect(tracked.character?.knowledge.at(-1)).toContain('hoofprints');
  });

  it('makes the calf rescue practical, collaborative, and recoverable after a failed pull', () => {
    expect(THE_CALF_IN_THE_MUD.scenes.muddyGate.text).toContain('The bank is firm beneath your feet');
    expect(THE_CALF_IN_THE_MUD.scenes.muddyGate.text).toContain('there is time to work carefully');
    const attempt = act(start(THE_CALF_IN_THE_MUD), THE_CALF_IN_THE_MUD, 'muddyGate', 'callFarmhand');
    const failed = act(attempt, THE_CALF_IN_THE_MUD, 'helpArrives', 'pullTogether', () => 0.999999);
    expect(failed.run?.sceneId).toBe('pauseCalf');
    expect(THE_CALF_IN_THE_MUD.scenes.helpArrives.choices.find(({ id }) => id === 'pullTogether')?.chance?.probability).toBeGreaterThan(0.7);
  });

  it('keeps dog outcomes grounded, variable, and cautious around injury', () => {
    expect(selectionsFor(THE_DOG_THAT_RETURNS)).toHaveLength(4);
    for (const selection of selectionsFor(THE_DOG_THAT_RETURNS)) expect(explore(THE_DOG_THAT_RETURNS, selection)).toBeGreaterThan(0);
    expect(THE_INJURED_DOG.scenes.dogResting.text).toContain('growls when you step nearer');
    expect(THE_INJURED_DOG.scenes.dogBandageOffered.text).toContain('would not make the paw heal at once');
    expect(THE_INJURED_DOG.scenes.dogResting.choices.find(({ id }) => id === 'useCleanBandage')?.requirements?.items).toContain('fieldBandageRoll');
  });

  it('uses work gear as a temporary support, never as a substitute for proper harness repair', () => {
    expect(THE_BROKEN_HARNESS.scenes.cartLane.text).toContain('One leather strap from its harness has split');
    expect(THE_BROKEN_HARNESS.scenes.strapBraced.text).toContain('not a replacement for the split harness');
    const state = start(THE_BROKEN_HARNESS, {}, 'freightmansStrap');
    expect(THE_BROKEN_HARNESS.scenes.cartLane.choices.filter(({ requirements }) => meets(requirements, state)).map(({ id }) => id)).toContain('offerStrap');
    expect(THE_CALF_IN_THE_MUD.scenes.ropeReady.choices.find(({ id }) => id === 'ropeWithHandler')?.chance?.bonusItems).toContain('heavyLeatherGloves');
  });

  it('avoids forced ownership judgments and frames the old horse around suitable work', () => {
    expect(THE_OWNERLESS_MULE.scenes.muleCompared.text).toContain('not legal proof');
    expect(THE_OLD_HORSE.scenes.horseTerms.text).toContain('price');
    const poor = start(THE_OLD_HORSE, {}, undefined, 0);
    expect(THE_OLD_HORSE.scenes.horseTerms.choices.filter(({ requirements }) => meets(requirements, poor)).map(({ id }) => id)).not.toContain('buyOlderHorse');
    const buyer = start(THE_OLD_HORSE, {}, undefined, 5);
    const deal = act(buyer, THE_OLD_HORSE, 'horseOffer', 'askPriceTerms');
    const bought = act(deal, THE_OLD_HORSE, 'horseTerms', 'buyOlderHorse');
    expect(bought.character?.money).toBe(2);
    expect(bought.character?.historyFlags).toContain('bought_older_horse_for_light_work');
    expect(bought.character?.ownedAssets).toEqual([{ id: 'olderChestnutHorse', name: 'Older Chestnut Horse', description: 'Your horse, boarded at the farm where you bought her. Suited to light work and an easy pace.' }]);
    expect(getCarriedItems(bought.character)).toEqual([]);
    const worker = act(act(start(THE_OLD_HORSE), THE_OLD_HORSE, 'horseOffer', 'askPriceTerms'), THE_OLD_HORSE, 'horseTerms', 'workForHorse');
    expect(worker.character?.ownedAssets?.map(({ id }) => id)).toEqual(['olderChestnutHorse']);
    expect(worker.character?.money).toBe(0);
    expect(worker.run?.completionQualification).toBe('substantive');
    const persisted = finishSuccess({ ...worker, run: { ...worker.run!, rewardSelectionOpen: false } }, null);
    expect(persisted.character?.ownedAssets?.[0].id).toBe('olderChestnutHorse');
    expect(persisted.bank).toEqual([]);
    const memory = new Map([[SAVE_KEY, JSON.stringify(persisted)]]);
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } as unknown as Storage;
    expect(loadSave(storage).character?.ownedAssets?.[0].name).toBe('Older Chestnut Horse');
    expect(failCharacter(persisted).character).toBeNull();
    expect(retireCharacter(persisted).character).toBeNull();
    const declined = act(start(THE_OLD_HORSE), THE_OLD_HORSE, 'horseOffer', 'declineOldHorse');
    expect(declined.character?.ownedAssets).toEqual([]);
  });

  it('gives successful loose-goat routes a distinct market aftermath before completion', () => {
    const initial = start(LOOSE_IN_THE_MARKET);
    const reached = act(initial, LOOSE_IN_THE_MARKET, 'marketLane', 'standClearMarket');
    expect(reached.run?.sceneId).toBe('ownerHandlesGoat');
    const aftermath = act(reached, LOOSE_IN_THE_MARKET, 'ownerHandlesGoat', 'marketAftercareOwner');
    expect(aftermath.run?.sceneId).toBe('marketAftercare');
    const complete = act(aftermath, LOOSE_IN_THE_MARKET, 'marketAftercare', 'declineMarketCoin');
    expect(complete.run?.sceneId).toBe('marketHelpComplete');
    expect(complete.run?.completionQualification).toBe('substantive');
    expect(complete.run?.status).toBe('success');
    expect(complete.character?.historyFlags).toContain('helped_return_market_goat');
  });

  it('keeps the team and apiary safe without forcing contact or a dramatic incident', () => {
    expect(THE_FRIGHTENED_TEAM.scenes.teamRoad.text).toContain('not out of control');
    expect(selectionsFor(THE_FRIGHTENED_TEAM)).toHaveLength(3);
    expect(THE_BEE_YARD.scenes.apiaryGate.text).toContain('The public path is outside the fence');
    expect(THE_BEE_YARD.scenes.standSteadied.text).toContain('The hive stays closed');
  });
});
