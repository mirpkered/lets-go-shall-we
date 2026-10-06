import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { inventoryClass } from '../items';
import { eligibleScenarios } from '../scenarioSelection';
import { DEEP_EXPLORATION_ADVENTURES } from './deepExplorationBatch';
import { SCENARIOS, getScenario } from './index';

function assertBranchesAdvance(scenario: Scenario): void {
  const character = newCharacter('Exploration QA');
  const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  const pending = [initial];
  const visited = new Set<string>();
  while (pending.length) {
    const state = pending.shift()!;
    const run = state.run!;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.itemStates]);
    if (visited.has(key)) continue;
    visited.add(key);
    if (run.status !== 'active' || scene.ending) continue;
    const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    for (const choice of choices) {
      for (const roll of [0, 0.999999]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        pending.push(next);
      }
    }
    expect(visited.size, `${scenario.title} remains bounded`).toBeLessThan(5000);
  }
}

describe('deep exploration anthology', () => {
  it('registers fourteen stable, all-year deep adventures using the canonical schema', () => {
    expect(DEEP_EXPLORATION_ADVENTURES).toHaveLength(14);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(validateScenarioMetadata(DEEP_EXPLORATION_ADVENTURES)).toEqual([]);
    for (const scenario of DEEP_EXPLORATION_ADVENTURES) {
      expect(getScenario(scenario.id)).toBe(scenario);
      expect(scenario.diversity?.length).toBe('EPIC_SHORT');
      expect(scenario.diversity?.availability?.season).toBe('ALL_YEAR');
    }
  });

  it('keeps every route forward-only, reachable, actionable, and mobile-concise', () => {
    for (const scenario of DEEP_EXPLORATION_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      const reachable = new Set<string>();
      const todo = [scenario.startScene];
      while (todo.length) {
        const id = todo.pop()!;
        if (reachable.has(id)) continue;
        reachable.add(id);
        const scene = scenario.scenes[id]!;
        expect(scene.choices.length, `${scenario.title}.${id} choice count`).toBeLessThanOrEqual(4);
        expect(scene.text.length, `${scenario.title}.${id} compact scene`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${id} compact choice`).toBeLessThanOrEqual(70);
          for (const next of [choice.next, choice.chance?.successNext, choice.chance?.failureNext]) if (next) todo.push(next);
        }
      }
      expect(reachable.size, `${scenario.title} has no orphan scenes`).toBe(Object.keys(scenario.scenes).length);
      const maxRouteScenes = (id: string): number => {
        const scene = scenario.scenes[id]!;
        if (scene.ending) return 1;
        return 1 + Math.max(...scene.choices.flatMap((choice) => [choice.next, choice.chance?.successNext, choice.chance?.failureNext].filter((next): next is string => Boolean(next)).map(maxRouteScenes)));
      };
      expect(maxRouteScenes(scenario.startScene), `${scenario.title} has a genuinely deep engaged route`).toBeGreaterThanOrEqual(8);
      assertBranchesAdvance(scenario);
    }
  });

  it('keeps rescue/retreat routes distinct from deeper exploration', () => {
    const orchard = getScenario('iron-orchard')!;
    expect(orchard.scenes.rescueOnly.text).toMatch(/prospector is out/i);
    expect(orchard.scenes.rescueOnly.text).toMatch(/second descent/i);
    expect(orchard.scenes.rodEnding.text).not.toBe(orchard.scenes.rescueOnly.text);

    const harker = getScenario('deep-room-at-harker-mine')!;
    expect(harker.scenes.harkerRescueEnd.text).toMatch(/old worked-stone door remains unexplored/i);
    expect(harker.scenes.harkerDoor.text).toMatch(/way back remains clear/i);

    const mill = getScenario('black-stair-wrens-mill')!;
    expect(mill.scenes.floodGallery.text).toMatch(/runs back toward the millrace/i);
    expect(mill.scenes.chalkDoor.text).toMatch(/old chalk strokes/i);
    expect(mill.scenes.wheelHeld.choices.some(({ effects }) => effects?.gainItems?.includes('blackMillingStone'))).toBe(true);
  });

  it('recognizes the optional sounding rod and preserves a mid-adventure snapshot exactly', () => {
    const bell = getScenario('bell-below-the-water')!;
    const character = newCharacter('Saved Explorer');
    character.carriedItem = 'collapsibleSoundingRod';
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, bell, () => 0) };
    state.run!.sceneId = 'muddyPerimeter';
    const probe = bell.scenes.muddyPerimeter.choices.find(({ id }) => id === 'probeEdge')!;
    expect(meets(probe.requirements, state)).toBe(true);
    const next = choose(state, bell, probe, () => 0);
    expect(next.run?.sceneId).toBe('roofTop');
    expect(probe.effects?.knowledge).toContain('A narrow firm shelf reaches the roof opening.');

    const snapshot = structuredClone(next);
    expect(structuredClone(snapshot)).toEqual(next);
    const continued = choose(snapshot, bell, bell.scenes.roofTop.choices.find(({ id }) => id === 'southOpening')!, () => 0);
    expect(continued.run?.sceneId).toBe('upperBell');
    expect(snapshot.run?.sceneId).toBe('roofTop');
  });

  it('makes this all-year lane normally selectable and classifies only distinct authored exploration items', () => {
    const octoberPool = eligibleScenarios(SCENARIOS, [], 10);
    for (const scenario of DEEP_EXPLORATION_ADVENTURES) expect(octoberPool).toContain(scenario);
    expect(inventoryClass('collapsibleSoundingRod')).toBe('GEAR');
    for (const id of ['briarHouseSkeletonKey', 'redDoorToken', 'ironOrchardRodFragment', 'numberedLanternWick', 'blackMillingStone']) {
      expect(inventoryClass(id)).toBe('RELIC');
    }
    const awardScenarios = Object.fromEntries(['briarHouseSkeletonKey', 'redDoorToken', 'ironOrchardRodFragment', 'numberedLanternWick', 'blackMillingStone', 'collapsibleSoundingRod'].map((itemId) => [itemId,
      DEEP_EXPLORATION_ADVENTURES.filter((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) => choice.effects?.gainItems?.includes(itemId)))).map(({ id }) => id),
    ]));
    expect(awardScenarios).toEqual({
      briarHouseSkeletonKey: ['last-door-briar-house'], redDoorToken: ['door-beneath-the-road'],
      ironOrchardRodFragment: ['iron-orchard'], numberedLanternWick: ['lantern-vault'],
      blackMillingStone: ['black-stair-wrens-mill'], collapsibleSoundingRod: ['ferry-beneath-the-ferry', 'forgotten-platform'],
    });
  });

  it('keeps the Iron Orchard’s prospector fate conditional on whether the rescue occurred', () => {
    const orchard = getScenario('iron-orchard')!;
    const character = newCharacter('State-aware Explorer');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, orchard) };
    expect(sceneText(orchard.scenes.sealedOrchard, state)).toMatch(/not yet out/i);
    state.run!.flags.push('prospectorRescued');
    expect(sceneText(orchard.scenes.sealedOrchard, state)).toMatch(/already safe outside/i);
  });

  it('keeps Briar House key access established and distinct from Mile Marker Nine’s time-layer mystery', () => {
    const briar = getScenario('last-door-briar-house')!;
    const character = newCharacter('Door-State Explorer');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, briar) };
    const bookcase = briar.scenes.libraryFirst.choices.find(({ id }) => id === 'bookcase')!;
    expect(meets(bookcase.requirements, state)).toBe(false);
    state.run!.sceneId = 'pantryShift';
    const takeKey = briar.scenes.pantryShift.choices.find(({ id }) => id === 'key')!;
    const withKey = choose(state, briar, takeKey, () => 0);
    expect(withKey.run?.flags).toContain('hasBriarKey');
    expect(meets(bookcase.requirements, withKey)).toBe(true);
    expect(choose(withKey, briar, bookcase, () => 0).run?.sceneId).toBe('libraryShift');

    const mileMarker = getScenario('house-at-mile-marker-nine')!;
    expect(mileMarker.scenes.clockShift.text).toMatch(/has not moved the doors/i);
    expect(mileMarker.scenes.serviceRooms.text).toMatch(/connect.*same way each time/i);
  });

  it('creates optional Supply and Relic continuity without consuming either artifact', () => {
    const orra = getScenario('beneath-saint-orras')!;
    const character = newCharacter('Continuity Explorer');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, orra, () => 0) };
    const marks = choose(state, orra, orra.scenes.orraYard.choices.find(({ id }) => id === 'inspectMarks')!, () => 0);
    const chalk = orra.scenes.orraNiches.choices.find(({ id }) => id === 'takeCaretakerChalk')!;
    expect(meets(chalk.requirements, marks)).toBe(true);
    const prepared = choose(marks, orra, chalk, () => 0);
    expect(prepared.character?.supplies?.ritualChalk).toBe(1);
    expect(prepared.run?.sceneId).toBe('orraLanding');

    const harker = getScenario('deep-room-at-harker-mine')!;
    const plainCharacter = newCharacter('Without the fragment');
    const plain: SaveData = { ...structuredClone(EMPTY_SAVE), character: plainCharacter, run: startRun(plainCharacter, harker, () => 0) };
    plain.run!.sceneId = 'harkerDoor';
    const compare = harker.scenes.harkerDoor.choices.find(({ id }) => id === 'compareRodFragment')!;
    expect(meets(compare.requirements, plain)).toBe(false);
    const carriesFragment = newCharacter('With the fragment');
    carriesFragment.carriedItem = 'ironOrchardRodFragment';
    const equipped: SaveData = { ...structuredClone(EMPTY_SAVE), character: carriesFragment, run: startRun(carriesFragment, harker, () => 0) };
    equipped.run!.sceneId = 'harkerDoor';
    expect(meets(compare.requirements, equipped)).toBe(true);
    const recognized = choose(equipped, harker, compare, () => 0);
    expect(recognized.character?.knowledge).toContain('An Iron Orchard rod fragment answers the same low vibration as Harker’s old cage fittings; the resemblance does not identify what moved below either mine.');
    expect(recognized.run?.inventory).toContain('ironOrchardRodFragment');
  });

  it('makes the Harker rescue wage and practical tool a real mutually exclusive settlement choice', () => {
    const harker = getScenario('deep-room-at-harker-mine')!;
    const character = newCharacter('Rescue Worker');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, harker, () => 0) };
    state.run!.sceneId = 'minerOutside';
    const wage = harker.scenes.minerOutside.choices.find(({ id }) => id === 'leaveHarker')!;
    const tool = harker.scenes.minerOutside.choices.find(({ id }) => id === 'takeMultiToolInstead')!;
    expect(meets(wage.requirements, state)).toBe(true);
    expect(meets(tool.requirements, state)).toBe(true);
    const cashState = choose(state, harker, wage, () => 0);
    expect(cashState.character?.money).toBe(5);
    expect(cashState.character?.carriedItems).not.toContain('foremanMultiTool');
    const toolState = choose(state, harker, tool, () => 0);
    expect(toolState.character?.money).toBe(0);
    expect(toolState.run?.inventory).toContain('foremanMultiTool');
    expect(toolState.character?.historyFlags).toContain('accepted a mine tool instead of the Harker rescue wage');
  });

  it('recognizes the Red Door Token only at Harker’s matching old seal', () => {
    const harker = getScenario('deep-room-at-harker-mine')!;
    const character = newCharacter('Token Bearer');
    character.carriedItem = 'redDoorToken';
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, harker, () => 0) };
    state.run!.sceneId = 'harkerDeep';
    const compare = harker.scenes.harkerDeep.choices.find(({ id }) => id === 'compareToken')!;
    expect(meets(compare.requirements, state)).toBe(true);
    const result = choose(state, harker, compare, () => 0);
    expect(result.character?.knowledge).toContain('The Harker seal repeats the Red Door Token’s three-cut pattern in reverse; the matching convention links the marks, but does not identify a maker or creature.');
    expect(result.run?.inventory).toContain('redDoorToken');
  });

  it('lets Briar House’s own Skeleton Key bypass only its matching bookcase lock on a later visit', () => {
    const house = getScenario('last-door-briar-house')!;
    const plainCharacter = newCharacter('No House Key');
    const plain: SaveData = { ...structuredClone(EMPTY_SAVE), character: plainCharacter, run: startRun(plainCharacter, house, () => 0) };
    plain.run!.sceneId = 'libraryFirst';
    const keyChoice = house.scenes.libraryFirst.choices.find(({ id }) => id === 'briarSkeletonKey')!;
    expect(meets(keyChoice.requirements, plain)).toBe(false);

    const keyCharacter = newCharacter('Returning House Guest');
    keyCharacter.carriedItem = 'briarHouseSkeletonKey';
    const returning: SaveData = { ...structuredClone(EMPTY_SAVE), character: keyCharacter, run: startRun(keyCharacter, house, () => 0) };
    returning.run!.sceneId = 'libraryFirst';
    expect(meets(keyChoice.requirements, returning)).toBe(true);
    const opened = choose(returning, house, keyChoice, () => 0);
    expect(opened.run?.sceneId).toBe('libraryShift');
    expect(sceneText(house.scenes.libraryShift, opened)).toMatch(/not for locks elsewhere/i);
  });

  it('lets a traveler trade ferry inspection pay for an existing field tool', () => {
    const ferry = getScenario('ferry-beneath-the-ferry')!;
    const character = newCharacter('Ferry Inspector');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, ferry, () => 0) };
    state.run!.sceneId = 'timberFreed';
    const tool = ferry.scenes.timberFreed.choices.find(({ id }) => id === 'takeFerryRod')!;
    const cash = ferry.scenes.timberFreed.choices.find(({ id }) => id === 'tellFerryman')!;
    expect(meets(tool.requirements, state)).toBe(true);
    expect(choose(state, ferry, tool, () => 0).run?.inventory).toContain('collapsibleSoundingRod');
    expect(choose(state, ferry, cash, () => 0).character?.money).toBe(3);
    const duplicateCharacter = newCharacter('Already Has the Tool');
    duplicateCharacter.carriedItem = 'collapsibleSoundingRod';
    const duplicate: SaveData = { ...structuredClone(EMPTY_SAVE), character: duplicateCharacter, run: startRun(duplicateCharacter, ferry, () => 0) };
    duplicate.run!.sceneId = 'timberFreed';
    expect(meets(tool.requirements, duplicate)).toBe(false);
  });

  it('uses Ritual Chalk to mark one route through the White Chamber and consumes it', () => {
    const cave = getScenario('white-chamber')!;
    const character = newCharacter('Chalk Mapper');
    character.supplies = { ritualChalk: 1 };
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, cave, () => 0) };
    const mark = cave.scenes.whiteCaveMouth.choices.find(({ id }) => id === 'chalkCave')!;
    expect(meets(mark.requirements, state)).toBe(true);
    const result = choose(state, cave, mark, () => 0);
    expect(result.character?.supplies?.ritualChalk).toBeUndefined();
    expect(result.run?.flags).toContain('whiteChalkSet');
    expect(result.character?.knowledge).toContain('In the White Chamber, each chalk mark holds a known turn while the pale geometry repeats; it marks a route but does not reveal what lies beyond the sealed door.');
  });

  it('lets a fresh traveler receive, save, and optionally spend the prospector’s spare chalk before the first route choice', () => {
    const cave = getScenario('white-chamber')!;
    const character = newCharacter('Fresh Cave Traveler');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, cave, () => 0) };
    const request = cave.scenes.whiteCaveMouth.choices.find(({ id }) => id === 'askForChalk')!;
    expect(meets(request.requirements, initial)).toBe(true);
    const offered = choose(initial, cave, request, () => 0);
    expect(offered.character?.supplies?.ritualChalk).toBe(1);
    expect(offered.run?.sceneId).toBe('whiteChalkReady');
    let saved = '';
    saveGame(offered, { setItem: (_key, value) => { saved = value; } });
    const resumed = loadSave({ getItem: () => saved });
    expect(resumed.run?.sceneId).toBe('whiteChalkReady');
    expect(resumed.character?.supplies?.ritualChalk).toBe(1);
    const use = cave.scenes.whiteChalkReady.choices.find(({ id }) => id === 'markBendWithNewChalk')!;
    const spent = choose(resumed, cave, use, () => 0);
    expect(spent.character?.supplies?.ritualChalk).toBeUndefined();
    expect(spent.run?.flags).toContain('whiteChalkSet');
    const fullCharacter = newCharacter('Full Chalk Pouch');
    fullCharacter.supplies = { ritualChalk: 4 };
    const full: SaveData = { ...structuredClone(EMPTY_SAVE), character: fullCharacter, run: startRun(fullCharacter, cave, () => 0) };
    expect(meets(request.requirements, full)).toBe(false);
  });
});
