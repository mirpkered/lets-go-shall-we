import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  STRANGE_ROADS_ADVENTURES, THE_BELL_BENEATH_THE_WATER, THE_BLACK_DOG,
  THE_COLD_ROOM, THE_GRAVE_BELL, THE_HOUSE_THAT_KNOCKS,
  THE_LANTERN_IN_THE_MARSH, THE_PASSENGER_WHO_WASN_T_THERE,
  THE_ROOM_WITH_NO_DOOR, THE_VOICE_IN_THE_MINE, THE_WOMAN_AT_THE_CROSSING,
} from './strangeRoadsBatch';

const RELICS = ['bronzeMaskFragment', 'graveCoin', 'yewCharm', 'brassRoomKey', 'signalLens'];

function start(scenario: Scenario, selections: Record<string, string> = {}, carriedItem: string | null = null, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Strange Roads Tester');
  character.carriedItem = carriedItem;
  character.historyFlags = [...historyFlags];
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

function selectionSets(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((all, group) =>
    all.flatMap((base) => group.values.map(({ value }) => ({ ...base, [group.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, carriedItem: string | null = null): number {
  const queue = [start(scenario, selections, carriedItem)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.historyFlags, state.character?.knowledge]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') {
      expect(run.status, `${scenario.title} remains completable for a fresh character`).toBe('success');
      continue;
    }
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    expect(sceneText(scene!, state)).not.toMatch(/\{\{[^}]+\}\}/);
    if (scene!.ending) continue;
    const available = scene!.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene!.id} exposes an action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene!.id} stays within the four-choice layout`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance || choice.effects?.combat ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene!.id}.${choice.id} advances`).toBe(false);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(20_000);
  }
  return seen.size;
}

describe('strange roads and supernatural adventure batch', () => {
  it('registers ten compact, forward-only adventures with no unknown item references', () => {
    expect(STRANGE_ROADS_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(861);
    expect(STRANGE_ROADS_ADVENTURES.map(({ title }) => title)).toEqual([
      'The Lantern in the Marsh', 'The House That Knocks', 'The Grave Bell',
      'The Passenger Who Wasn’t There', 'The Cold Room', 'The Voice in the Mine',
      'The Woman at the Crossing', 'The Black Dog', 'The Room with No Door', 'The Bell Beneath the Water',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of STRANGE_ROADS_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} fits the authored copy budget`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? []), ...(choice.effects?.gainItems ?? []), ...(choice.effects?.loseItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title}.${scene.id} references known item ${id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores every authored truth, chance result, and relevant carried-item path without dead ends or revisits', () => {
    const itemByScenario: Record<string, string[]> = {
      [THE_LANTERN_IN_THE_MARSH.id]: ['signalLens'],
      [THE_GRAVE_BELL.id]: ['graveCoin', 'yewCharm'],
      [THE_ROOM_WITH_NO_DOOR.id]: ['brassRoomKey'],
      [THE_BELL_BENEATH_THE_WATER.id]: ['graveCoin'],
    };
    for (const scenario of STRANGE_ROADS_ADVENTURES) {
      for (const selections of selectionSets(scenario)) {
        expect(explore(scenario, selections), scenario.title).toBeGreaterThan(0);
        for (const item of itemByScenario[scenario.id] ?? []) {
          expect(explore(scenario, selections, item), `${scenario.title} with ${item}`).toBeGreaterThan(0);
        }
      }
    }
  }, 60_000);

  it('keeps the lantern encounter risky but survivable and makes the signal lens specific', () => {
    const missedFooting = act(start(THE_LANTERN_IN_THE_MARSH, { marshLight: 'lostTraveler' }), THE_LANTERN_IN_THE_MARSH, 'marshSighting', 'followMarshLight', () => 0.999999);
    expect(missedFooting.run?.health).toBe(9);
    expect(missedFooting.run?.status).toBe('success');
    const lens = act(start(THE_LANTERN_IN_THE_MARSH, { marshLight: 'nightWorkers' }, 'signalLens'), THE_LANTERN_IN_THE_MARSH, 'marshSighting', 'watchMarshLight');
    const examined = act(lens, THE_LANTERN_IN_THE_MARSH, 'marshObserved', 'lensOnMarsh');
    expect(examined.character?.knowledge).toContain('Through the Crimson Signal Lens, a faint red blink appeared once beyond the marsh reeds.');
    expect(THE_LANTERN_IN_THE_MARSH.scenes.marshNearLight.textVariants?.some(({ text }) => /lens/i.test(text))).toBe(false);
  });

  it('varies ordinary and unexplained knocks without implying a person behind an unsafe wall', () => {
    const mouse = start(THE_HOUSE_THAT_KNOCKS, { knockCause: 'mouse' });
    const inspect = act(mouse, THE_HOUSE_THAT_KNOCKS, 'knockingRoom', 'inspectBothRooms');
    expect(sceneText(THE_HOUSE_THAT_KNOCKS.scenes.wallInspected, inspect)).toContain('A small mouse darts');
    const unexplained = start(THE_HOUSE_THAT_KNOCKS, { knockCause: 'unexplained' });
    const eerie = act(unexplained, THE_HOUSE_THAT_KNOCKS, 'knockingRoom', 'inspectBothRooms');
    expect(sceneText(THE_HOUSE_THAT_KNOCKS.scenes.wallInspected, eerie)).toContain('three gentle knocks answer');
    expect(THE_HOUSE_THAT_KNOCKS.scenes.wallInspected.text).toContain('nothing suggests a person could fit');
  });

  it('makes the grave keepsakes react narrowly without identifying the bell’s cause', () => {
    const coin = act(start(THE_GRAVE_BELL, { graveBellCause: 'unexplained' }, 'graveCoin'), THE_GRAVE_BELL, 'cemeteryBell', 'readGraveBellRelic');
    expect(sceneText(THE_GRAVE_BELL.scenes.bellRelicResponse, coin)).toContain('The Grave Coin grows cold for a moment');
    const charm = act(start(THE_GRAVE_BELL, { graveBellCause: 'unexplained' }, 'yewCharm'), THE_GRAVE_BELL, 'cemeteryBell', 'readGraveBellRelic');
    expect(sceneText(THE_GRAVE_BELL.scenes.bellRelicResponse, charm)).toContain('The Yew Charm’s red thread draws taut');
    const ordinaryCoin = act(start(THE_GRAVE_BELL, { graveBellCause: 'groundskeeper' }, 'graveCoin'), THE_GRAVE_BELL, 'cemeteryBell', 'readGraveBellRelic');
    expect(sceneText(THE_GRAVE_BELL.scenes.bellRelicResponse, ordinaryCoin)).toContain('The Grave Coin remains at its usual temperature');
    expect(sceneText(THE_GRAVE_BELL.scenes.bellRelicResponse, coin)).not.toContain('identifies the cause');
  });

  it('keeps the passenger mystery unresolved and records the meeting in character history', () => {
    const state = act(start(THE_PASSENGER_WHO_WASN_T_THERE, { passengerTruth: 'unexplained' }), THE_PASSENGER_WHO_WASN_T_THERE, 'coachPassenger', 'askCoachConductor');
    expect(state.character?.historyFlags).toContain('met_unremembered_passenger');
    expect(sceneText(THE_PASSENGER_WHO_WASN_T_THERE.scenes.passengerAsked, state)).toContain('finds no ticket stub');
    expect(THE_PASSENGER_WHO_WASN_T_THERE.scenes.passengerAsked.text).not.toContain('ghost');
  });

  it('makes the woman’s signal relevant to independently visible bridge danger', () => {
    expect(THE_WOMAN_AT_THE_CROSSING.scenes.crossingFigure.text).toContain('Water clouds around one bridge support');
    expect(THE_WOMAN_AT_THE_CROSSING.scenes.crossingExamined.text).toContain('fresh grit washing out beneath one arch');
    const warning = start(THE_WOMAN_AT_THE_CROSSING, { crossingFigureTruth: 'warning' });
    const called = act(warning, THE_WOMAN_AT_THE_CROSSING, 'crossingFigure', 'callToCrossingWoman');
    expect(sceneText(THE_WOMAN_AT_THE_CROSSING.scenes.crossingCall, called)).toContain('She points again to the support');
    const crossed = act(act(warning, THE_WOMAN_AT_THE_CROSSING, 'crossingFigure', 'inspectBridgeFromBank'), THE_WOMAN_AT_THE_CROSSING, 'crossingExamined', 'crossCarefullyAtDusk', () => 0);
    expect(crossed.run?.sceneId).toBe('crossingPassed');
    expect(sceneText(THE_WOMAN_AT_THE_CROSSING.scenes.crossingPassed, crossed)).toContain('accepting a risk');
    const slipped = act(act(warning, THE_WOMAN_AT_THE_CROSSING, 'crossingFigure', 'inspectBridgeFromBank'), THE_WOMAN_AT_THE_CROSSING, 'crossingExamined', 'crossCarefullyAtDusk', () => 0.999999);
    expect(slipped.run?.sceneId).toBe('crossingScramble');
    expect(slipped.run?.health).toBe(9);
    const detour = act(warning, THE_WOMAN_AT_THE_CROSSING, 'crossingFigure', 'takeCrossingDetour');
    expect(sceneText(THE_WOMAN_AT_THE_CROSSING.scenes.crossingDetourArrival, detour)).toContain('marked road brings you around');
  });

  it('does not conjure water for the black dog and lets help lead to meaningful assistance', () => {
    expect(THE_BLACK_DOG.scenes.blackDogRoad.choices.map(({ id }) => id)).not.toContain('offerBlackDogWater');
    expect(Object.values(THE_BLACK_DOG.scenes).flatMap(({ text, textVariants = [] }) => [text, ...textVariants.map(({ text: variant }) => variant)])
      .join(' ')).not.toContain('The dog drinks');
    let state = act(start(THE_BLACK_DOG, { blackDogTruth: 'lostTraveler' }), THE_BLACK_DOG, 'blackDogRoad', 'followBlackDog');
    state = act(state, THE_BLACK_DOG, 'dogFollowed', 'helpDitchTraveler');
    expect(state.run?.sceneId).toBe('dogTravelerHelped');
    expect(sceneText(THE_BLACK_DOG.scenes.dogTravelerHelped, state)).toContain('fell from a cart');
    state = act(state, THE_BLACK_DOG, 'dogTravelerHelped', 'followDogForHelp');
    expect(state.run?.status).toBe('success');
    expect(THE_BLACK_DOG.scenes[state.run!.sceneId].text).toContain('The dog leads you to a farmhand');
  });

  it('does not identify the mine voice unless the traveler reaches its source', () => {
    const state = start(THE_VOICE_IN_THE_MINE, { mineVoice: 'unexplained' });
    expect(THE_VOICE_IN_THE_MINE.scenes.mineCall.text).not.toContain('guide’s voice says');
    const reached = act(state, THE_VOICE_IN_THE_MINE, 'mineCall', 'followMineVoice', () => 0);
    expect(sceneText(THE_VOICE_IN_THE_MINE.scenes.mineVoiceReached, reached)).toContain('exact tone');
  });

  it('keeps the bridge and black-dog encounters grounded, with opt-in follow-up history', () => {
    expect(THE_WOMAN_AT_THE_CROSSING.scenes.crossingFigure.text).toContain('far bank');
    expect(THE_WOMAN_AT_THE_CROSSING.scenes.crossingFigure.text).toContain('near bank');
    const follower = act(start(THE_BLACK_DOG, { blackDogTruth: 'vanishes' }), THE_BLACK_DOG, 'blackDogRoad', 'followBlackDog');
    expect(follower.character?.historyFlags).toContain('followed_black_dog');
    expect(sceneText(THE_BLACK_DOG.scenes.dogFollowed, follower)).toContain('There is no gate, traveler, or dog');
  });

  it('limits the Brass Room Key to the specific old maintenance lock and keeps the lake legend optional', () => {
    const opened = act(start(THE_ROOM_WITH_NO_DOOR, { doorlessRoomTruth: 'storageNook' }, 'brassRoomKey'), THE_ROOM_WITH_NO_DOOR, 'planAndHall', 'useBrassKeyAtPanel');
    expect(sceneText(THE_ROOM_WITH_NO_DOOR.scenes.keyAtPanel, opened)).toContain('opens only a narrow maintenance panel');
    expect(THE_ROOM_WITH_NO_DOOR.scenes.planAndHall.text).not.toContain('magic key');
    const left = act(start(THE_BELL_BENEATH_THE_WATER, { waterBellTruth: 'unexplained' }), THE_BELL_BENEATH_THE_WATER, 'lakeLegend', 'leaveWaterBell');
    expect(left.run?.status).toBe('success');
  });

  it('persists authored variant selections and history during save/resume', () => {
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) };
    const state = start(THE_BLACK_DOG, { blackDogTruth: 'lostTraveler' });
    const followed = act(state, THE_BLACK_DOG, 'blackDogRoad', 'followBlackDog');
    saveGame(followed, storage as unknown as Storage);
    const resumed = loadSave(storage as unknown as Storage);
    expect(resumed.run?.randomSelections).toEqual(followed.run?.randomSelections);
    expect(resumed.character?.historyFlags).toContain('followed_black_dog');
  });

  it('leaves irrelevant relics without forced effects or supernatural stat bonuses', () => {
    for (const scenario of STRANGE_ROADS_ADVENTURES) {
      for (const scene of Object.values(scenario.scenes)) {
        for (const choice of scene.choices) {
          expect(JSON.stringify(choice.effects ?? {})).not.toMatch(/supernatural.*bonus|ghost.*resistance/i);
        }
      }
    }
    expect(RELICS).toContain('bronzeMaskFragment');
    expect(STRANGE_ROADS_ADVENTURES.flatMap(({ scenes }) => Object.values(scenes)).flatMap(({ choices }) => choices).some(({ requirements }) => requirements?.items?.includes('bronzeMaskFragment'))).toBe(false);
  });
});
