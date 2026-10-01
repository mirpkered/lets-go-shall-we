import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startAdventure } from '../engine';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { SCENARIOS } from './index';
import {
  A_SEAT_BY_THE_FIRE, AFTER_THE_STORM, THE_BELL_AFTER_MIDNIGHT,
  THE_BORROWED_HORSE, THE_BROKEN_WHEEL, THE_EMPTY_WAGON, THE_FALLEN_TREE,
  THE_LAST_FERRY, THE_LOOSE_TEAM, THE_MISSING_BOAT, ONE_HORSE_SHORT,
  THE_SOUND_IN_THE_WELL, THREE_MILES_TO_RAIN, THE_WASHOUT,
} from './index';
import type { SaveData, Scenario } from '../types';

const BATCH: Scenario[] = [THE_BORROWED_HORSE, A_SEAT_BY_THE_FIRE, THE_SOUND_IN_THE_WELL, THE_BROKEN_WHEEL, THREE_MILES_TO_RAIN, THE_EMPTY_WAGON, THE_BELL_AFTER_MIDNIGHT, THE_LAST_FERRY, THE_FALLEN_TREE, ONE_HORSE_SHORT, THE_MISSING_BOAT, AFTER_THE_STORM, THE_LOOSE_TEAM, THE_WASHOUT];

function start(scenario: Scenario, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Batch Tester');
  character.carriedItem = carriedItem;
  return startAdventure({ version: 1, bank: [], character, run: null }, scenario);
}

function assertReachableStates(scenario: Scenario, carriedItem: string | null = null): number {
  const queue = [start(scenario, carriedItem)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.flags, run.visitedSceneIds, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size, `${scenario.title} visited scenes`).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId} exists`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} reachable active actions`).toBeGreaterThan(0);
    for (const choice of available) {
      const outcomes = choice.chance || choice.effects?.combat ? [0, 0.999999] : [0];
      for (const randomValue of outcomes) {
        const next = choose(state, scenario, choice, () => randomValue);
        expect(next.run?.status !== 'active' || next.run.sceneId !== run.sceneId, `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(true);
        expect(String(next.run?.message ?? ''), `${scenario.title}.${scene.id}.${choice.id} progresses`).not.toContain('already passed');
        queue.push(next);
      }
    }
    expect(seen.size, `${scenario.title} bounded graph`).toBeLessThan(20_000);
  }
  return seen.size;
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, random);
}

describe('grounded adventure expansion batch', () => {
  it('registers all fourteen adventures and validates every graph as forward-only', () => {
    expect(BATCH).toHaveLength(14);
    for (const scenario of BATCH) {
      expect(SCENARIOS).toContain(scenario);
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        expect(scene.choices.length, `${scenario.title}.${scene.id} choices`).toBeLessThanOrEqual(4);
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}.${scene.id} active choices`).toBeGreaterThan(0);
      }
    }
  });

  it('explores every reachable branch for active dead ends and scene revisits', () => {
    for (const scenario of BATCH) expect(assertReachableStates(scenario), scenario.title).toBeGreaterThan(0);
  });

  it('keeps every story copy within the mobile authoring budget using the longest random names', () => {
    for (const scenario of BATCH) {
      const selections = Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => [id, values.map(({ value }) => value).sort((a, b) => b.length - a.length)[0]]));
      const state = { run: { randomSelections: selections } } as SaveData;
      for (const scene of Object.values(scenario.scenes)) {
        for (const copy of [scene.text, ...(scene.textVariants ?? []).map(({ text }) => text)]) {
          const rendered = copy.replace(/\{\{([\w-]+)\}\}/g, (_match, key: string) => selections[key] ?? '');
          expect(rendered.length, `${scenario.title}.${scene.id} story`).toBeLessThanOrEqual(400);
          expect(rendered).not.toContain('{{');
        }
        for (const choice of scene.choices) {
          const label = choice.label.replace(/\{\{([\w-]+)\}\}/g, (_match, key: string) => selections[key] ?? '');
          expect(label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
        }
      }
      const first = start(scenario);
      const resumed = JSON.parse(JSON.stringify(first)) as SaveData;
      expect(resumed.run?.randomSelections).toEqual(first.run?.randomSelections);
      const opening = scenario.scenes[scenario.startScene];
      if (opening.choices[0]) {
        const continued = choose(first, scenario, opening.choices[0], () => 0);
        expect(continued.run?.randomSelections).toEqual(first.run?.randomSelections);
        expect(JSON.parse(JSON.stringify(continued)).run?.visitedSceneIds).toEqual(continued.run?.visitedSceneIds);
      }
    }
  });

  it('gives fresh characters multiple viable, distinct outcomes in the lower-risk stories', () => {
    let state = act(start(THE_BORROWED_HORSE), THE_BORROWED_HORSE, 'roadSigns', 'walkTheMare');
    expect(state.run?.sceneId).toBe('lateArrival');
    state = act(start(THE_BORROWED_HORSE), THE_BORROWED_HORSE, 'roadSigns', 'pushForNoon');
    expect(state.run?.sceneId).toBe('paidArrival');
    expect(state.character?.money).toBe(3);

    expect(act(start(A_SEAT_BY_THE_FIRE), A_SEAT_BY_THE_FIRE, 'crowdedRoom', 'offerCot').run?.sceneId).toBe('benchNight');
    expect(act(start(A_SEAT_BY_THE_FIRE), A_SEAT_BY_THE_FIRE, 'crowdedRoom', 'keepCot').run?.sceneId).toBe('keptCot');

    state = act(start(THE_BROKEN_WHEEL), THE_BROKEN_WHEEL, 'roadsideWagon', 'inspectWheel');
    const paidLate = act(state, THE_BROKEN_WHEEL, 'hubDamage', 'lightenAndDrag');
    expect(paidLate.run?.sceneId).toBe('lateMarket');
    expect(paidLate.character?.money).toBe(1);
    expect(act(start(THE_BROKEN_WHEEL), THE_BROKEN_WHEEL, 'roadsideWagon', 'walkForSmith').run?.sceneId).toBe('smithReturns');

    expect(act(start(ONE_HORSE_SHORT), ONE_HORSE_SHORT, 'roadsideParty', 'lightenLoad').run?.sceneId).toBe('lightenedWagon');
    expect(act(start(ONE_HORSE_SHORT), ONE_HORSE_SHORT, 'roadsideParty', 'returnForHorse').run?.sceneId).toBe('farmStable');
  });

  it('supports distinct shelter and weather choices without requiring carried gear', () => {
    expect(act(start(THREE_MILES_TO_RAIN), THREE_MILES_TO_RAIN, 'openRoad', 'headForInn').run?.sceneId).toBe('innArrival');
    const helped = act(start(THREE_MILES_TO_RAIN), THREE_MILES_TO_RAIN, 'openRoad', 'helpSecureCart');
    const shelter = act(helped, THREE_MILES_TO_RAIN, 'cartSecured', 'waitInSheepShelter');
    expect(shelter.run?.sceneId).toBe('sharedShelter');
    expect(act(shelter, THREE_MILES_TO_RAIN, 'sharedShelter', 'partAfterRain').run?.sceneId).toBe('shelterEnding');
    expect(act(start(THE_EMPTY_WAGON), THE_EMPTY_WAGON, 'wagonOnRoad', 'continueRoad').run?.sceneId).toBe('wagonLeftEnding');
    expect(act(start(THE_EMPTY_WAGON), THE_EMPTY_WAGON, 'wagonOnRoad', 'followFootprints').run?.sceneId).toBe('driverFound');
    expect(act(start(THE_BELL_AFTER_MIDNIGHT), THE_BELL_AFTER_MIDNIGHT, 'innAtNight', 'stayInBed').run?.sceneId).toBe('morningAfterBell');
    const keeper = act(start(THE_BELL_AFTER_MIDNIGHT), THE_BELL_AFTER_MIDNIGHT, 'innAtNight', 'wakeTheKeeper');
    expect(act(keeper, THE_BELL_AFTER_MIDNIGHT, 'keeperWakes', 'douseStraw').run?.sceneId).toBe('stableSafe');
  });

  it('covers rescue, waiting, risk, and death branches in the higher-risk stories', () => {
    let state = act(start(THE_SOUND_IN_THE_WELL), THE_SOUND_IN_THE_WELL, 'farmyardWell', 'callDown');
    state = act(state, THE_SOUND_IN_THE_WELL, 'voiceBelow', 'waitForOwner');
    expect(act(state, THE_SOUND_IN_THE_WELL, 'ropeArrives', 'lowerFarmLoop').run?.sceneId).toBe('rescuedWorker');
    state = act(start(THE_SOUND_IN_THE_WELL), THE_SOUND_IN_THE_WELL, 'farmyardWell', 'callDown');
    state = act(state, THE_SOUND_IN_THE_WELL, 'voiceBelow', 'descendWell', () => 0.99);
    expect(state.run?.sceneId).toBe('wellFall');
    expect(act(state, THE_SOUND_IN_THE_WELL, 'wellFall', 'grabWorkerInFall', () => 0.99).run?.status).toBe('death');

    expect(act(start(THE_LAST_FERRY), THE_LAST_FERRY, 'ferryLanding', 'walkToUpperCrossing').run?.sceneId).toBe('fordArrival');
    const atDamage = act(start(THE_LAST_FERRY), THE_LAST_FERRY, 'ferryLanding', 'inspectFerryLine');
    expect(act(atDamage, THE_LAST_FERRY, 'lineDamage', 'askFerrymanToWait').run?.sceneId).toBe('ferryReset');

    const pinned = act(start(THE_FALLEN_TREE), THE_FALLEN_TREE, 'roadBlocked', 'lookUnderBranches');
    expect(act(pinned, THE_FALLEN_TREE, 'driverPinned', 'callToDriver').run?.sceneId).toBe('farmHelp');
    const danger = act(pinned, THE_FALLEN_TREE, 'driverPinned', 'liftByHand', () => 0.99);
    expect(danger.run?.sceneId).toBe('treeShifts');
    expect(act(start(THE_FALLEN_TREE), THE_FALLEN_TREE, 'roadBlocked', 'turnBack').run?.sceneId).toBe('detourEnding');

    expect(act(start(THE_MISSING_BOAT), THE_MISSING_BOAT, 'emptyLanding', 'callBoatOwner').run?.sceneId).toBe('downstreamBank');
    const signal = act(start(THE_MISSING_BOAT), THE_MISSING_BOAT, 'emptyLanding', 'enterCurrent', () => 0.99);
    expect(signal.run?.sceneId).toBe('riverRescue');
    const overShelf = start(THE_MISSING_BOAT);
    overShelf.run!.sceneId = 'waterOverShelf';
    overShelf.run!.visitedSceneIds = ['emptyLanding', 'downstreamBank', 'ferryHelp', 'waterOverShelf'];
    expect(act(overShelf, THE_MISSING_BOAT, 'waterOverShelf', 'waitBoatCrew').run?.sceneId).toBe('lastCrewAttempt');

    expect(act(start(THE_LOOSE_TEAM), THE_LOOSE_TEAM, 'roadJunction', 'openPastureGate').run?.sceneId).toBe('horsesTurnedAftermath');
    const reckless = act(start(THE_LOOSE_TEAM), THE_LOOSE_TEAM, 'roadJunction', 'runAlongside', () => 0.99);
    expect(reckless.run?.sceneId).toBe('wagonAtFork');

    const washoutRisk = act(start(THE_WASHOUT), THE_WASHOUT, 'upperRoad', 'stepAcrossGap', () => 0.99);
    expect(washoutRisk.run?.sceneId).toBe('edgeCollapse');
    expect(act(start(THE_WASHOUT), THE_WASHOUT, 'upperRoad', 'findUpperTrail').run?.sceneId).toBe('upperTrailFound');
  });

  it('keeps storm cleanup and shelter stories actionable with a fresh character', () => {
    const triage = act(start(AFTER_THE_STORM), AFTER_THE_STORM, 'damagedFarm', 'askFarmhandPriority');
    expect(act(triage, AFTER_THE_STORM, 'farmhandPriority', 'followFarmhandPriority').run?.sceneId).toBe('goatsReturned');
    expect(act(start(AFTER_THE_STORM), AFTER_THE_STORM, 'damagedFarm', 'findGoats').run?.sceneId).toBe('goatsReturned');
  });

  it('uses carried gear as an optional advantage without gating a fresh-character route', () => {
    const withRope = start(THE_WASHOUT, 'travelRope');
    const marked = act(withRope, THE_WASHOUT, 'upperRoad', 'markRoad');
    const atEdge = act(marked, THE_WASHOUT, 'roadMarked', 'secureEdge');
    expect(act(atEdge, THE_WASHOUT, 'ropeAtEdge', 'followRidgeRope').run?.sceneId).toBe('upperTrailFound');
    expect(act(start(THE_WASHOUT), THE_WASHOUT, 'upperRoad', 'findUpperTrail').run?.sceneId).toBe('upperTrailFound');

    const withLight = start(THE_BELL_AFTER_MIDNIGHT, 'minerHeadlamp');
    expect(act(withLight, THE_BELL_AFTER_MIDNIGHT, 'innAtNight', 'takeLightOutside').run?.sceneId).toBe('stableYard');
  });

  it('keeps random name pools unique within each story and exposes every new adventure in QA tools', async () => {
    for (const scenario of BATCH) {
      for (const pool of scenario.runRandomSelections ?? []) {
        expect(new Set(pool.values.map(({ value }) => value)).size, `${scenario.title}.${pool.id}`).toBe(pool.values.length);
      }
    }
    const { ITEMS } = await import('../items');
    const { renderQaPanel } = await import('../qaPanel');
    const qa = renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS);
    for (const scenario of BATCH) expect(qa).toContain(`Start ${scenario.title}`);
  });
});
