import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { EMPTY_SAVE, loadSave } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { AGRICULTURE_NARRATED_WAGE_PAYMENTS, AGRICULTURE_RANCH_ANIMAL_WORK_GENRE_BATCH as BATCH } from './agricultureRanchAnimalWorkGenreBatch';
import { FENCE_LINE } from './honestWorkBatch';

const fresh = (scenario: Scenario): SaveData => {
  const character = newCharacter('Rural Work Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};

const take = (state: SaveData, scenario: Scenario, choiceId: string): SaveData => {
  const current = scenario.scenes[state.run!.sceneId]!;
  const choice = current.choices.find(({ id }) => id === choiceId);
  expect(choice, `${current.id}.${choiceId} exists`).toBeTruthy();
  return choose(state, scenario, choice!);
};

describe('Gear Expansion Genre Batch 11 — Agriculture / Ranch / Animal Work', () => {
  it('keeps orchard inspection and spring-pipe findings on the routes that establish them', () => {
    const appleRow = BATCH.find(({ id }) => id === 'the-apple-row-after-hail')!;
    let crateCover = take(fresh(appleRow), appleRow, 'cover');
    const coverText = sceneText(appleRow.scenes.work, crateCover);
    expect(coverText).toMatch(/crates are covered/i);
    expect(coverText).toMatch(/does not establish whether the net was lifted clear or whether the upper row has fresh bruises/i);
    expect(coverText).not.toContain('The net is lifted clear, but the upper row has fresh bruises.');

    let ropeLift = fresh(appleRow);
    ropeLift.run!.inventory.push('travelRope');
    ropeLift.itemStates = { travelRope: { condition: 'NORMAL', upgrades: [], provenance: [] } };
    ropeLift = take(ropeLift, appleRow, 'lift');
    expect(ropeLift.run?.flags).toContain('appleNetLiftedForInspection');
    ropeLift = loadSave({ getItem: () => JSON.stringify(ropeLift) });
    expect(sceneText(appleRow.scenes.work, ropeLift)).toMatch(/net is lifted clear, but the upper row has fresh bruises/i);

    const trough = BATCH.find(({ id }) => id === 'the-trough-after-thaw')!;
    const closedOnly = take(fresh(trough), trough, 'close');
    const closedText = sceneText(trough.scenes.check, closedOnly);
    expect(closedText).toMatch(/condition of the spring pipe has not been established/i);
    expect(closedText).not.toMatch(/the pipe is clear/i);

    let inspectedPipe = take(fresh(trough), trough, 'pipe');
    expect(inspectedPipe.run?.flags).toContain('thawSpringPipeInspected');
    inspectedPipe = loadSave({ getItem: () => JSON.stringify(inspectedPipe) });
    expect(sceneText(trough.scenes.check, inspectedPipe)).toMatch(/the pipe is clear/i);
  });

  it('does not confuse crop cover or bin bracing with moving stored goods', () => {
    const oats = BATCH.find(({ id }) => id === 'the-dry-row-before-the-threshing')!;
    let covered = take(fresh(oats), oats, 'cover');
    covered = take(covered, oats, 'crew');
    const coveredResult = sceneText(oats.scenes.result, covered);
    expect(coveredResult).toMatch(/rows remain in the field/i);
    expect(coveredResult).toMatch(/transfer to the barn is not established/i);
    expect(coveredResult).not.toMatch(/dry rows reach the barn/i);

    let loaded = take(fresh(oats), oats, 'near');
    loaded = take(loaded, oats, 'return');
    expect(loaded.run?.flags).toContain('oatsRemainingRowsReachedBarn');
    loaded = loadSave({ getItem: () => JSON.stringify(loaded) });
    expect(sceneText(oats.scenes.result, loaded)).toMatch(/dry rows reach the barn/i);

    let coverReward = take(fresh(oats), oats, 'cover');
    coverReward = take(coverReward, oats, 'crew');
    const strap = oats.scenes.result.choices.find(({ id }) => id === 'strap')!;
    coverReward = choose(coverReward, oats, strap);
    coverReward = finishRewardResolution(placeReward(openRewardResolution(coverReward), 'freightmansStrap', 'carry'));
    const strapProvenance = coverReward.itemStates?.freightmansStrap?.provenance.join(' ') ?? '';
    expect(strapProvenance).toMatch(/helped protect the dry rows/i);
    expect(strapProvenance).not.toMatch(/rows reached the barn/i);

    const winterBin = BATCH.find(({ id }) => id === 'the-last-bin-at-winter-yard')!;
    let braced = take(fresh(winterBin), winterBin, 'board');
    braced = take(braced, winterBin, 'raise');
    const bracedText = sceneText(winterBin.scenes.partial, braced);
    expect(bracedText).toMatch(/does not establish where the sealed sacks were left/i);
    expect(bracedText).not.toMatch(/sacks stay raised|moving the feed/i);

    let movedSacks = take(fresh(winterBin), winterBin, 'sacks');
    movedSacks = take(movedSacks, winterBin, 'raise');
    expect(movedSacks.run?.flags).toContain('winterFeedSacksRaised');
    movedSacks = loadSave({ getItem: () => JSON.stringify(movedSacks) });
    expect(sceneText(winterBin.scenes.partial, movedSacks)).toMatch(/sacks stay raised/i);
    expect(sceneText(winterBin.scenes.partial, movedSacks)).toMatch(/coin for moving the feed/i);
  });

  it('keeps the feed-sack record check and shears recollection attached to the routes that establish them', () => {
    const feed = BATCH.find(({ id }) => id === 'the-feed-bin-with-the-blue-seam')!;
    const separated = take(fresh(feed), feed, 'separate');
    const separateText = sceneText(feed.scenes.records, separated);
    expect(separateText).toMatch(/delivery entry and the reason for the blue wax have not been checked/i);
    expect(separateText).not.toMatch(/tally lists two plain sacks|farmhand recalls that the miller/i);
    expect(feed.scenes.records.choices.map(({ id }) => id)).toEqual(['return', 'call']);

    let checked = take(fresh(feed), feed, 'ask');
    expect(checked.run?.flags).toContain('blueSeamTallyChecked');
    checked = loadSave({ getItem: () => JSON.stringify(checked) });
    const checkedText = sceneText(feed.scenes.records, checked);
    expect(checkedText).toMatch(/tally lists two plain sacks/i);
    expect(checkedText).toMatch(/farmhand recalls that the miller sometimes uses blue wax for seed grain/i);

    const shears = BATCH.find(({ id }) => id === 'the-sheep-shears-that-went-missing')!;
    let sackSearch = take(fresh(shears), shears, 'rack');
    sackSearch = take(sackSearch, shears, 'sack');
    const sackText = sceneText(shears.scenes.found, sackSearch);
    expect(sackText).toMatch(/shears are found intact/i);
    expect(sackText).toMatch(/does not establish how they came to be set aside/i);
    expect(sackText).not.toMatch(/shearer recalls placing them on the shelf/i);

    let askedShearer = take(fresh(shears), shears, 'rack');
    askedShearer = take(askedShearer, shears, 'ask');
    expect(askedShearer.run?.flags).toContain('shearerRetracedLastCut');
    askedShearer = loadSave({ getItem: () => JSON.stringify(askedShearer) });
    expect(sceneText(shears.scenes.found, askedShearer)).toMatch(/shearer recalls placing them on the shelf/i);

    let shedSearch = take(fresh(shears), shears, 'gate');
    shedSearch = take(shedSearch, shears, 'return');
    expect(sceneText(shears.scenes.shed, shedSearch)).toMatch(/shears are on a clean shelf inside the closed tool shed/i);
  });

  it('registers 24 unique Adventures with valid, reachable, acyclic graphs', () => {
    expect(BATCH).toHaveLength(30);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(30);
    expect(validateScenarioRegistry(BATCH)).toEqual({ errors: [], warnings: [] });
    for (const scenario of BATCH) expect(findScenarioGraphProblems(scenario), scenario.id).toEqual([]);
  });

  it('offers continuity in every story and legitimate Gear in at least 18', () => {
    let gearRoutes = 0;
    for (const scenario of BATCH) {
      const choices = Object.values(scenario.scenes).flatMap(({ choices: sceneChoices }) => sceneChoices);
      expect(choices.some(({ effects }) => !!effects?.gainItems?.length || (effects?.money ?? 0) > 0 || !!effects?.knowledge?.length || !!effects?.lore?.length), scenario.id).toBe(true);
      if (choices.some(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) gearRoutes++;
      for (const choice of choices) for (const item of choice.effects?.gainItems ?? []) expect(ITEMS[item], `${scenario.id} grants ${item}`).toBeTruthy();
    }
    expect(gearRoutes).toBeGreaterThanOrEqual(18);
  });

  it('adds only a broadly useful, capability-limited carryable Gear item', () => {
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
    expect(ITEMS.fencingPliers).toMatchObject({ name: 'Fencing Pliers', carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.fencingPliers.description).toContain('cannot pull posts');
    expect(BATCH.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some(({ effects }) => effects?.gainItems?.includes('fencingPliers'))))).toBe(true);
  });

  it('transfers Fencing Pliers only through explicit compensation, preserving provenance and capacity rules', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-last-post-at-miller-fence')!;
    const choice = scenario.scenes.earned.choices.find(({ id }) => id === 'tool')!;
    const state = fresh(scenario);
    state.run!.sceneId = 'earned';
    const rewarded = choose(state, scenario, choice);
    expect(rewarded.run?.acquiredThisRun).toContain('fencingPliers');
    const resolved = finishRewardResolution(placeReward(openRewardResolution(rewarded), 'fencingPliers', 'carry'));
    expect(getCarriedItems(resolved.character)).toContain('fencingPliers');
    expect(resolved.itemStates?.fencingPliers?.provenance.join(' ')).toMatch(/releases|transfers/i);
    expect(BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices)).filter(({ effects }) => effects?.gainItems?.includes('fencingPliers')).every(({ requirements }) => requirements?.notOwnedItems?.includes('fencingPliers'))).toBe(true);
  });

  it('gives the new tool a meaningful existing-library callback without replacing the work', () => {
    const choice = Object.values(FENCE_LINE.scenes).flatMap(({ choices }) => choices).find(({ requirements }) => requirements?.items?.includes('fencingPliers'))!;
    expect(choice.label).toContain('wire tie');
    expect(choice.hint).toContain('cannot replace a rotten post');
  });

  it('keeps ownership, humane handling, seasonal gates, and wages explicit', () => {
    const seasonal = BATCH.filter(({ diversity }) => diversity?.availability?.season !== 'ALL_YEAR');
    expect(seasonal.map(({ diversity }) => diversity?.availability?.season).sort()).toEqual(['AUTUMN', 'AUTUMN', 'WINTER', 'WINTER']);
    expect(BATCH.find(({ id }) => id === 'the-red-lantern-in-the-pig-shed')?.scenes.lantern.choices[0].label.toLowerCase()).toContain('move the pigs');
    expect(BATCH.find(({ id }) => id === 'the-cut-wire-at-ash-pasture')?.scenes.resolved.choices.some(({ effects }) => effects?.money === 2)).toBe(true);
    expect(BATCH.some(({ id }) => id === 'the-frozen-pump-at-lower-pasture' && Object.values(BATCH.find((entry) => entry.id === id)!.scenes).some(({ choices }) => choices.some(({ effects }) => effects?.money === 1)))).toBe(true);
  });

  it('grants the exact narrated partial-work payment only on each qualifying farm route', () => {
    let routeCount = 0;
    for (const [scenarioId, endings] of Object.entries(AGRICULTURE_NARRATED_WAGE_PAYMENTS)) {
      const scenario = BATCH.find(({ id }) => id === scenarioId)!;
      for (const [endingId, amount] of Object.entries(endings)) {
        const incoming = Object.values(scenario.scenes).flatMap((scene) => scene.choices
          .filter(({ next }) => next === endingId).map((choice) => ({ scene, choice })));
        expect(incoming.length, `${scenarioId}.${endingId} has a qualifying transition`).toBeGreaterThan(0);
        for (const { scene, choice } of incoming) {
          routeCount++;
          expect(choice.effects?.money, `${scenarioId}.${scene.id}.${choice.id}`).toBe(amount);
          const state = fresh(scenario);
          state.run!.sceneId = scene.id;
          const paid = choose(state, scenario, choice, () => 0);
          expect(paid.run?.sceneId).toBe(endingId);
          expect(paid.character?.money).toBe(amount);
        }
      }
    }
    expect(Object.keys(AGRICULTURE_NARRATED_WAGE_PAYMENTS)).toHaveLength(23);
    expect(routeCount).toBeGreaterThan(23);

    const alreadyCorrect = BATCH.find(({ id }) => id === 'the-cut-wire-at-ash-pasture')!;
    const resolved = alreadyCorrect.scenes.resolved.choices.find(({ id }) => id === 'coin')!;
    const paid = choose(fresh(alreadyCorrect), alreadyCorrect, resolved, () => 0);
    expect(paid.character?.money).toBe(2);
  });

  it('does not persist temporary farm tools or animal supplies as inventory items', () => {
    for (const id of ['farmWire', 'feedSack', 'stableLead', 'farmLantern']) expect(ITEMS[id]).toBeUndefined();
    expect(itemsOfClass('SUPPLY').map(({ id }) => id).sort()).toEqual(['coldIronNails', 'consecratedSalt', 'ritualChalk']);
  });

  it('keeps Lantern Guard provenance truthful across animal-handling routes', () => {
    const earnLanternGuard = (scenarioId: string, route: string[]) => {
      const scenario = BATCH.find(({ id }) => id === scenarioId)!;
      let state = fresh(scenario);
      for (const step of route) {
        const [sceneId, choiceId] = step.split('.');
        state.run!.sceneId = sceneId!;
        const choice = scenario.scenes[sceneId!]!.choices.find(({ id }) => id === choiceId)!;
        state = choose(state, scenario, choice);
      }
      const visitedSceneIds = [...(state.run?.visitedSceneIds ?? [])];
      const guard = scenario.scenes.safe.choices.find(({ id }) => id === 'guard')!;
      state = choose(state, scenario, guard);
      state = finishRewardResolution(placeReward(openRewardResolution(state), 'lanternGuard', 'carry'));
      return { state, visitedSceneIds };
    };

    const hayloftDirect = earnLanternGuard('the-lantern-smoke-in-the-hayloft', ['smoke.lantern']);
    const hayloftEvacuated = earnLanternGuard('the-lantern-smoke-in-the-hayloft', ['smoke.animals', 'yard.lower']);
    expect(hayloftDirect.visitedSceneIds).not.toContain('yard');
    expect(hayloftEvacuated.visitedSceneIds).toContain('yard');
    for (const { state } of [hayloftDirect, hayloftEvacuated]) {
      const provenance = state.itemStates?.lanternGuard?.provenance.join(' ') ?? '';
      expect(provenance).toMatch(/smoking lantern is taken out of service/i);
      expect(provenance).not.toMatch(/horses were led clear/i);
    }

    const pigsRemainPenned = earnLanternGuard('the-red-lantern-in-the-pig-shed', ['lantern.sack', 'check.handler']);
    const pigsMoved = earnLanternGuard('the-red-lantern-in-the-pig-shed', ['lantern.pigs', 'yard.cover']);
    expect(pigsRemainPenned.visitedSceneIds).toContain('check');
    expect(pigsRemainPenned.visitedSceneIds).not.toContain('yard');
    expect(pigsMoved.visitedSceneIds).toContain('yard');
    for (const { state } of [pigsRemainPenned, pigsMoved]) {
      const provenance = state.itemStates?.lanternGuard?.provenance.join(' ') ?? '';
      expect(provenance).toMatch(/ember is out and the lantern is removed/i);
      expect(provenance).toMatch(/does not imply the pigs were moved from their pen/i);
      expect(provenance).not.toMatch(/after the Traveler helped move the animals/i);
    }
  });
});
