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
    expect(SCENARIOS).toHaveLength(861);
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
    expect(harker.scenes.harkerRescueEnd.text).toMatch(/deeper question unresolved/i);
    expect(harker.scenes.harkerRescueEnd.textVariants?.some(({ requirements }) => requirements.flags?.includes('harkerDoorEntered'))).toBe(true);
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

  it('does not promise a reliable clock trigger after either stopping or bypassing the clock', () => {
    const scenario = getScenario('house-at-mile-marker-nine')!;
    const character = newCharacter('Marker Nine Route Test');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const take = (state: SaveData, sceneId: string, choiceId: string) => choose(
      state,
      scenario,
      scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId)!,
      () => 0,
    );

    let stoppedClock = initial;
    for (const [scene, choice] of [
      ['markerRoad', 'frontHouse'], ['houseKitchen', 'clockKitchen'], ['clockShift', 'porchDoor'],
      ['impossiblePorch', 'trunk'], ['clockLetters', 'stopNow'], ['clockStopped', 'leaveStopped'],
    ]) stoppedClock = take(stoppedClock, scene, choice);
    expect(stoppedClock.run?.sceneId).toBe('routeEnding');
    expect(sceneText(scenario.scenes.routeEnding, stoppedClock)).not.toMatch(/leaves with a reliable way to trigger/i);

    let bypassedClock = initial;
    for (const [scene, choice] of [
      ['markerRoad', 'barnHouse'], ['houseBarn', 'cellarFromBarn'], ['houseCellar', 'followService'], ['serviceRooms', 'leaveService'],
    ]) bypassedClock = take(bypassedClock, scene, choice);
    expect(bypassedClock.run?.sceneId).toBe('routeEnding');
    expect(sceneText(scenario.scenes.routeEnding, bypassedClock)).toMatch(/fixed service route/i);
    expect(sceneText(scenario.scenes.routeEnding, bypassedClock)).not.toMatch(/leaves with a reliable way to trigger/i);
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

  it('keeps Saint Orra departure and closure claims tied to the actions taken', () => {
    const orra = getScenario('beneath-saint-orras')!;
    const route = (steps: Array<[string, string]>): SaveData => {
      const character = newCharacter('Saint Orra Route QA');
      let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, orra, () => 0) };
      for (const [sceneId, choiceId] of steps) {
        expect(state.run?.sceneId).toBe(sceneId);
        const choice = orra.scenes[sceneId].choices.find(({ id }) => id === choiceId);
        expect(choice).toBeDefined();
        state = choose(state, orra, choice!);
      }
      return state;
    };

    const copiedMarks = route([['orraYard', 'inspectMarks'], ['orraNiches', 'copyNiches']]);
    expect(sceneText(orra.scenes.orraExit, copiedMarks)).not.toMatch(/damage is marked/i);
    const partialRetreat = route([['orraYard', 'descendOrra'], ['orraLanding', 'retreatLanding']]);
    expect(sceneText(orra.scenes.orraExit, partialRetreat)).not.toMatch(/damage is marked/i);
    const describedRoom = route([['orraYard', 'descendOrra'], ['orraLanding', 'recordsBelow'], ['orraHiddenRoom', 'describeChamber']]);
    expect(sceneText(orra.scenes.orraExit, describedRoom)).not.toMatch(/damage is marked/i);
    const copiedRecord = route([['orraYard', 'askCaretaker'], ['orraRecords', 'copyRecords']]);
    expect(sceneText(orra.scenes.orraExit, copiedRecord)).not.toMatch(/damage is marked/i);
    const markedDamage = route([['orraYard', 'leaveOrra']]);
    expect(sceneText(orra.scenes.orraExit, markedDamage)).toMatch(/mark the rain damage/i);

    const archivedName = route([
      ['orraYard', 'descendOrra'], ['orraLanding', 'counterweight'], ['orraOssuary', 'copyName'], ['orraName', 'keepCopy'],
    ]);
    const archiveText = sceneText(orra.scenes.orraResolved, archivedName);
    expect(archiveText).not.toMatch(/caretaker accepts|closes the counterweight room/i);
    expect(archiveText).toMatch(/archive/i);

    const closedAndTold = route([['orraYard', 'descendOrra'], ['orraLanding', 'counterweight'], ['orraOssuary', 'closeOssuary']]);
    expect(sceneText(orra.scenes.orraResolved, closedAndTold)).toMatch(/caretaker accepts.*closes the counterweight room/i);
    const restoredAndShared = route([
      ['orraYard', 'descendOrra'], ['orraLanding', 'counterweight'], ['orraOssuary', 'copyName'], ['orraName', 'restoreStone'],
    ]);
    expect(sceneText(orra.scenes.orraResolved, restoredAndShared)).toMatch(/caretaker accepts.*closes the counterweight room/i);
    const legacyResolved = route([]);
    legacyResolved.run!.sceneId = 'orraResolved';
    expect(sceneText(orra.scenes.orraResolved, legacyResolved)).not.toMatch(/caretaker accepts|closes the counterweight room/i);
    expect(sceneText(orra.scenes.orraResolved, JSON.parse(JSON.stringify(closedAndTold)) as SaveData)).toMatch(/caretaker accepts.*closes the counterweight room/i);
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

  it('claims the Harker lower seal was restored only after an explicit reseal action', () => {
    const harker = getScenario('deep-room-at-harker-mine')!;

    const tokenBearer = newCharacter('Token Bearer');
    tokenBearer.carriedItem = 'redDoorToken';
    const comparisonOnly: SaveData = { ...structuredClone(EMPTY_SAVE), character: tokenBearer, run: startRun(tokenBearer, harker, () => 0) };
    comparisonOnly.run!.sceneId = 'harkerDeep';
    const compared = choose(comparisonOnly, harker, harker.scenes.harkerDeep.choices.find(({ id }) => id === 'compareToken')!, () => 0);
    expect(compared.run?.sceneId).toBe('harkerResealed');
    expect(sceneText(harker.scenes.harkerResealed, compared)).not.toMatch(/lower seal is restored/i);
    expect(compared.character?.knowledge).toContain('The Harker seal repeats the Red Door Token’s three-cut pattern in reverse; the matching convention links the marks, but does not identify a maker or creature.');

    const resealer = newCharacter('Mine Worker');
    const explicitReseal: SaveData = { ...structuredClone(EMPTY_SAVE), character: resealer, run: startRun(resealer, harker, () => 0) };
    explicitReseal.run!.sceneId = 'harkerDeep';
    const resealed = choose(explicitReseal, harker, harker.scenes.harkerDeep.choices.find(({ id }) => id === 'resealHarker')!, () => 0);
    expect(resealed.run?.sceneId).toBe('harkerDoorResealed');
    expect(sceneText(harker.scenes.harkerDoorResealed, resealed)).toMatch(/lower seal is restored/i);

    const surveyor = newCharacter('Mine Surveyor');
    const copiedAndResealed: SaveData = { ...structuredClone(EMPTY_SAVE), character: surveyor, run: startRun(surveyor, harker, () => 0) };
    copiedAndResealed.run!.sceneId = 'harkerDoor';
    const copy = choose(copiedAndResealed, harker, harker.scenes.harkerDoor.choices.find(({ id }) => id === 'copyEvidence')!, () => 0);
    expect(copy.run?.sceneId).toBe('harkerDoorResealed');
    expect(sceneText(harker.scenes.harkerDoorResealed, copy)).toMatch(/lower seal is restored/i);

    const fragmentBearer = newCharacter('Orchard Surveyor');
    fragmentBearer.carriedItem = 'ironOrchardRodFragment';
    const fragmentComparison: SaveData = { ...structuredClone(EMPTY_SAVE), character: fragmentBearer, run: startRun(fragmentBearer, harker, () => 0) };
    fragmentComparison.run!.sceneId = 'harkerDoor';
    const comparedFragment = choose(fragmentComparison, harker, harker.scenes.harkerDoor.choices.find(({ id }) => id === 'compareRodFragment')!, () => 0);
    expect(comparedFragment.run?.sceneId).toBe('harkerResealed');
    expect(sceneText(harker.scenes.harkerResealed, comparedFragment)).not.toMatch(/lower seal is restored/i);

    const returningTraveler = newCharacter('Returning Traveler');
    const legacy: SaveData = { ...structuredClone(EMPTY_SAVE), character: returningTraveler, run: startRun(returningTraveler, harker, () => 0) };
    legacy.run!.sceneId = 'harkerResealed';
    expect(sceneText(harker.scenes.harkerResealed, legacy)).not.toMatch(/lower seal is restored/i);
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

  it('keeps White Chamber rope and pack claims tied to actions actually taken', () => {
    const cave = getScenario('white-chamber')!;
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = cave.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      expect(meets(choice!.requirements, state), `${sceneId}.${choiceId} requirements`).toBe(true);
      return choose(state, cave, choice!, () => 0);
    };
    const start = (name: string, withRope = false): SaveData => {
      const character = newCharacter(name);
      if (withRope) character.carriedItem = 'travelRope';
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, cave, () => 0) };
    };
    const toPackRoom = (state: SaveData, entryChoice: 'askForChalk' | 'ropeCave'): SaveData => {
      if (entryChoice === 'askForChalk') {
        state = act(state, 'whiteCaveMouth', 'askForChalk');
        state = act(state, 'whiteChalkReady', 'saveChalkForLater');
        expect(state.run?.flags).not.toContain('whiteChalkSet');
      } else {
        state = act(state, 'whiteCaveMouth', 'ropeCave');
        expect(state.run?.flags).toContain('whiteLineSet');
      }
      state = act(state, 'whiteFirstRoom', 'followDraft');
      state = act(state, 'whiteDraftRoom', 'downDraft');
      state = act(state, 'whiteMechanism', 'followMapped');
      return state;
    };

    let unmarked = toPackRoom(start('No Line or Chalk'), 'askForChalk');
    expect(unmarked.run?.flags).not.toContain('whiteLineSet');
    unmarked = act(unmarked, 'whitePackRoom', 'inspectSeal');
    expect(sceneText(cave.scenes.whiteSeal, unmarked)).toMatch(/pack remains beside the door/i);
    expect(sceneText(cave.scenes.whiteSeal, unmarked)).not.toMatch(/pack is already recovered/i);
    expect(cave.scenes.whiteSeal.choices.find(({ id }) => id === 'openSeal')?.label).not.toMatch(/rope/i);

    const copied = act(structuredClone(unmarked), 'whiteSeal', 'copySeal');
    expect(copied.run?.sceneId).toBe('whiteResolved');
    expect(sceneText(cave.scenes.whiteResolved, copied)).toMatch(/pack remains beside the sealed door/i);
    expect(sceneText(cave.scenes.whiteResolved, copied)).not.toMatch(/prospector gets the pack|recovered pack/i);
    expect(copied.character?.money).toBe(4);

    const opened = act(unmarked, 'whiteSeal', 'openSeal');
    expect(opened.run?.flags).not.toContain('whiteLineSet');
    expect(opened.run?.flags).not.toContain('whiteChalkSet');
    expect(sceneText(cave.scenes.whiteDeep, opened)).not.toMatch(/rope remains taut/i);
    const tracing = act(opened, 'whiteDeep', 'leaveRod');
    expect(sceneText(cave.scenes.whiteFragment, tracing)).toMatch(/pack remains beside the chamber/i);
    expect(sceneText(cave.scenes.whiteFragment, tracing)).not.toMatch(/recovered pack|prospector receives the pack/i);
    expect(tracing.character?.money).toBe(4);

    let unropedWheel = start('Unroped Wheel Route');
    unropedWheel = act(unropedWheel, 'whiteCaveMouth', 'askForChalk');
    unropedWheel = act(unropedWheel, 'whiteChalkReady', 'saveChalkForLater');
    unropedWheel = act(unropedWheel, 'whiteFirstRoom', 'followWear');
    unropedWheel = act(unropedWheel, 'whiteWearRoom', 'followEcho');
    unropedWheel = act(unropedWheel, 'whiteEchoRoom', 'turnWheel');
    expect(unropedWheel.run?.flags).not.toContain('whiteLineSet');
    expect(sceneText(cave.scenes.whiteReversed, unropedWheel)).not.toMatch(/line tied outside/i);
    expect(cave.scenes.whiteReversed.choices.find(({ id }) => id === 'retreatWheel')?.label).not.toMatch(/rope|chalk/i);

    const roped = toPackRoom(start('Roped Route', true), 'ropeCave');
    expect(roped.run?.flags).toContain('whiteLineSet');
    const safeRecovery = act(roped, 'whitePackRoom', 'takePack');
    expect(sceneText(cave.scenes.whiteRescueEnd, safeRecovery)).toMatch(/prospector receives the pack/i);
    expect(safeRecovery.character?.historyFlags).toContain('retrieved the prospector’s pack from the white cave');
  });

  it('qualifies Briar House conclusions by whether the hidden bedroom was reached', () => {
    const house = getScenario('last-door-briar-house')!;
    const character = newCharacter('Briar House Reader');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, house, () => 0) };
    initial.run!.sceneId = 'hallOne';
    const letterOnly = choose(initial, house, house.scenes.hallOne.choices.find(({ id }) => id === 'compareLetter')!, () => 0);
    expect(sceneText(house.scenes.letterEnding, letterOnly)).toMatch(/account of writing about someone associated with Briar House/i);

    const bedroom = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'bedroomShift' } };
    const entered = choose(bedroom, house, house.scenes.bedroomShift.choices.find(({ id }) => id === 'closeBedroom')!, () => 0);
    expect(entered.run?.flags).toContain('briarSecondBedroomReached');
    let saved = '';
    saveGame(entered, { setItem: (_key, value) => { saved = value; } });
    const resumed = loadSave({ getItem: () => saved });
    const confirmed = choose(resumed, house, house.scenes.secondBedroom.choices.find(({ id }) => id === 'readLetters')!, () => 0);
    expect(sceneText(house.scenes.letterEnding, confirmed)).toMatch(/confirm that the rooms concealed a person/i);
    expect(sceneText(house.scenes.houseUnderstood, confirmed)).toMatch(/letters in the hidden bedroom explain whom/i);

    const legacy = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'letterEnding' } };
    expect(sceneText(house.scenes.letterEnding, legacy)).toMatch(/account of writing about someone associated with Briar House/i);
  });

  it('keeps the Iron Orchard ending accurate when a rod was removed', () => {
    const orchard = getScenario('iron-orchard')!;
    const traveler = newCharacter('Rod Inspector');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, orchard, () => 0) };
    initial.run!.sceneId = 'stakeGallery';
    const pulled = choose(initial, orchard, orchard.scenes.stakeGallery.choices.find(({ id }) => id === 'removeRod')!, () => 0);
    expect(pulled.run?.flags).toContain('rodRemoved');
    const sealed = choose(pulled, orchard, orchard.scenes.openedDeep.choices.find(({ id }) => id === 'sealDeep')!, () => 0);
    expect(sceneText(orchard.scenes.sealedOrchard, sealed)).toMatch(/one rod was pulled from the floor/i);
    expect(sceneText(orchard.scenes.sealedOrchard, sealed)).toMatch(/the others remain in place/i);

    const left = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'stakeGallery' } };
    const untouched = choose(left, orchard, orchard.scenes.stakeGallery.choices.find(({ id }) => id === 'retreatStakes')!, () => 0);
    expect(sceneText(orchard.scenes.sealedOrchard, untouched)).toMatch(/the rods remain where they were found/i);
  });

  it('does not tell the road crew an unrecovered wagon can take the detour', () => {
    const road = getScenario('door-beneath-the-road')!;
    const traveler = newCharacter('Road Reporter');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, road, () => 0) };
    initial.run!.sceneId = 'driverAccount';
    const report = choose(initial, road, road.scenes.driverAccount.choices.find(({ id }) => id === 'reportHole')!, () => 0);
    expect(sceneText(road.scenes.roadReport, report)).toMatch(/wagon still needs to be recovered/i);
    expect(sceneText(road.scenes.roadReport, report)).not.toMatch(/wagon can use the detour/i);
    expect(road.scenes.shallowRoad.text).toMatch(/wagon and its cargo are recovered/i);
  });

  it('varies Harker Mine closure for direct rescue, crew rescue, and entered lower room', () => {
    const harker = getScenario('deep-room-at-harker-mine')!;
    const traveler = newCharacter('Harker Rescuer');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, harker, () => 0) };
    const drift = choose(initial, harker, harker.scenes.harkerMouth.choices.find(({ id }) => id === 'mainDrift')!, () => 0);
    const found = choose(drift, harker, harker.scenes.harkerDrift.choices.find(({ id }) => id === 'crawlDrift')!, () => 0);
    const rescued = choose(found, harker, harker.scenes.harkerMiner.choices.find(({ id }) => id === 'freeMiner')!, () => 0);
    const directExit = choose(rescued, harker, harker.scenes.minerOutside.choices.find(({ id }) => id === 'leaveHarker')!, () => 0);
    expect(sceneText(harker.scenes.harkerRescueEnd, directExit)).not.toMatch(/foreman and two miners bring/i);
    expect(sceneText(harker.scenes.harkerRescueEnd, directExit)).not.toMatch(/door remains unexplored/i);

    const inspect = choose(rescued, harker, harker.scenes.minerOutside.choices.find(({ id }) => id === 'inspectDeepDoor')!, () => 0);
    expect(inspect.run?.flags).toContain('harkerDoorEntered');
    const retreat = choose(inspect, harker, harker.scenes.harkerDoor.choices.find(({ id }) => id === 'retreatDoor')!, () => 0);
    expect(sceneText(harker.scenes.harkerRescueEnd, retreat)).toMatch(/saw the worked-stone room/i);
    expect(sceneText(harker.scenes.harkerRescueEnd, retreat)).toMatch(/without opening the lower door/i);

    const waiting = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'harkerWaiting' } };
    const crewOutcome = choose(waiting, harker, harker.scenes.harkerWaiting.choices.find(({ id }) => id === 'leaveMine')!, () => 0);
    expect(sceneText(harker.scenes.harkerRescueEnd, crewOutcome)).toMatch(/foreman leads two miners/i);
    const legacy = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'harkerRescueEnd' } };
    expect(sceneText(harker.scenes.harkerRescueEnd, legacy)).toMatch(/deeper question unresolved/i);
  });

  it('states the ferry’s cause and inspection settlement only after the timber was freed', () => {
    const ferry = getScenario('ferry-beneath-the-ferry')!;
    const traveler = newCharacter('Ferry Explorer');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, ferry, () => 0) };
    initial.run!.sceneId = 'ferryCache';
    const copiedSlate = choose(initial, ferry, ferry.scenes.ferryCache.choices.find(({ id }) => id === 'copyToll')!, () => 0);
    expect(sceneText(ferry.scenes.ferryHistory, copiedSlate)).toMatch(/older crossing lies beneath the present ferry/i);
    expect(sceneText(ferry.scenes.ferryHistory, copiedSlate)).not.toMatch(/pays three coins|cause of the strike is settled/i);
    expect(copiedSlate.character?.money).toBe(0);

    const road = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'oldRoad' } };
    const freed = choose(road, ferry, ferry.scenes.oldRoad.choices.find(({ id }) => id === 'freeTimber')!, () => 0);
    expect(freed.run?.flags).toContain('ferryTimberCleared');
    const paid = choose(freed, ferry, ferry.scenes.timberFreed.choices.find(({ id }) => id === 'tellFerryman')!, () => 0);
    expect(paid.character?.money).toBe(3);
    expect(sceneText(ferry.scenes.ferryHistory, paid)).toMatch(/pays three coins/i);
    expect(sceneText(ferry.scenes.ferryHistory, paid)).toMatch(/when you freed the timber/i);
  });

  it('keeps the Lantern Vault closure neutral unless the night register room was entered', () => {
    const vault = getScenario('lantern-vault')!;
    const traveler = newCharacter('Vault Reader');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, vault, () => 0) };
    const left = choose(initial, vault, vault.scenes.innCellar.choices.find(({ id }) => id === 'leaveVault')!, () => 0);
    expect(sceneText(vault.scenes.vaultEnding, left)).not.toMatch(/without opening any numbered room/i);
    expect(sceneText(vault.scenes.vaultEnding, left)).toMatch(/other numbered rooms remain unexamined/i);

    const entered = choose(initial, vault, vault.scenes.innCellar.choices.find(({ id }) => id === 'seven')!, () => 0);
    const copied = choose(entered, vault, vault.scenes.vaultSeven.choices.find(({ id }) => id === 'copyEntries')!, () => 0);
    const ended = choose(copied, vault, vault.scenes.vaultLedger.choices.find(({ id }) => id === 'closeRack')!, () => 0);
    expect(ended.run?.flags).toContain('vaultSevenEntered');
    expect(sceneText(vault.scenes.vaultEnding, ended)).toMatch(/examining the night register in numbered room seven/i);
    expect(sceneText(vault.scenes.vaultEnding, ended)).toMatch(/other numbered rooms remain unexamined/i);

    const legacy = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'vaultEnding' } };
    expect(sceneText(vault.scenes.vaultEnding, legacy)).toMatch(/account of what your route established/i);
  });

  it('does not give the drain-only Hollow Fort route credit for the unseen roster or escape tunnel', () => {
    const fort = getScenario('hollow-fort')!;
    const traveler = newCharacter('Fort Drainage Inspector');
    traveler.carriedItem = 'drainageHook';
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, fort, () => 0) };
    const cistern = choose(initial, fort, fort.scenes.fortYard.choices.find(({ id }) => id === 'cistern')!, () => 0);
    const drained = choose(cistern, fort, fort.scenes.fortCistern.choices.find(({ id }) => id === 'drainCistern')!, () => 0);
    expect(drained.run?.flags).toContain('fortDrainClear');
    const report = choose(drained, fort, fort.scenes.fortDrained.choices.find(({ id }) => id === 'reportDrain')!, () => 0);
    expect(sceneText(fort.scenes.fortResolution, report)).toMatch(/cleared drain carries water toward the outer slope/i);
    expect(sceneText(fort.scenes.fortResolution, report)).toMatch(/roster.*remain unexamined/i);
    expect(sceneText(fort.scenes.fortResolution, report)).not.toMatch(/workers preserve the escape route and the flood roster/i);
  });

  it('qualifies Hollow Fort record and escape-route closure details by the route actually taken', () => {
    const fort = getScenario('hollow-fort')!;
    const traveler = newCharacter('Fort Bastion Explorer');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, fort, () => 0) };
    initial.run!.sceneId = 'fortDrained';
    initial.run!.flags.push('fortDrainClear');
    const entered = choose(initial, fort, fort.scenes.fortDrained.choices.find(({ id }) => id === 'lowerBastion')!, () => 0);
    const copied = choose(entered, fort, fort.scenes.fortBastion.choices.find(({ id }) => id === 'copyRoster')!, () => 0);
    expect(sceneText(fort.scenes.fortResolution, copied)).toMatch(/copied the flood roster in the lower bastion/i);
    expect(sceneText(fort.scenes.fortResolution, copied)).not.toMatch(/preserve both the record and route/i);

    const tunnel = { ...structuredClone(initial), run: { ...initial.run!, sceneId: 'fortPowder' } };
    const escaped = choose(tunnel, fort, fort.scenes.fortPowder.choices.find(({ id }) => id === 'escapeTunnel')!, () => 0);
    expect(escaped.run?.flags).toContain('fortEscapeRouteFound');
    const farEntry = choose(escaped, fort, fort.scenes.fortTunnel.choices.find(({ id }) => id === 'farBastion')!, () => 0);
    const fullRecord = choose(farEntry, fort, fort.scenes.fortBastion.choices.find(({ id }) => id === 'copyRoster')!, () => 0);
    expect(sceneText(fort.scenes.fortResolution, fullRecord)).toMatch(/preserve both the record and route/i);
  });

  it('does not claim workers stopped timber work unless the route establishes the request', () => {
    const fort = getScenario('hollow-fort')!;
    const traveler = newCharacter('Fort Work Boundary Test');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character: traveler, run: startRun(traveler, fort, () => 0) };

    const archive = choose(initial, fort, fort.scenes.fortYard.choices.find(({ id }) => id === 'archive')!, () => 0);
    const comparedPlan = choose(archive, fort, fort.scenes.fortArchive.choices.find(({ id }) => id === 'compareWall')!, () => 0);
    expect(comparedPlan.run?.sceneId).toBe('fortMarked');
    expect(sceneText(fort.scenes.fortMarked, comparedPlan)).toMatch(/whether the workers stop stripping timber is not established/i);

    const cistern = choose(initial, fort, fort.scenes.fortYard.choices.find(({ id }) => id === 'cistern')!, () => 0);
    const measured = choose(cistern, fort, fort.scenes.fortCistern.choices.find(({ id }) => id === 'measureCistern')!, () => 0);
    expect(measured.run?.sceneId).toBe('fortMarked');
    expect(sceneText(fort.scenes.fortMarked, measured)).not.toMatch(/workers stop stripping timber near the hollow wall/i);
    const archived = choose(cistern, fort, fort.scenes.fortCistern.choices.find(({ id }) => id === 'archiveCistern')!, () => 0);
    expect(archived.run?.sceneId).toBe('fortMarked');
    expect(sceneText(fort.scenes.fortMarked, archived)).not.toMatch(/workers stop stripping timber near the hollow wall/i);

    const asked = choose(initial, fort, fort.scenes.fortYard.choices.find(({ id }) => id === 'walkAwayFort')!, () => 0);
    expect(asked.run?.flags).toContain('fortWorkersAskedToPause');
    expect(sceneText(fort.scenes.fortMarked, asked)).toMatch(/you asked the workers to leave the hollow wall alone/i);
    expect(sceneText(fort.scenes.fortMarked, asked)).not.toMatch(/whether they comply is established/i);
  });
});
