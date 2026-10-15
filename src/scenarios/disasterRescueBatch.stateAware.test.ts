import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import type { SaveData, Scenario } from '../types';
import { AFTER_THE_TORNADO, THE_BOILER_ROOM, THE_BRIDGE_GOES_DOWN, THE_CROWD_BREAKS, THE_ROOF_COMES_IN, THE_TRAIN_THAT_DIDNT_STOP } from './disasterRescueBatch';

function fresh(scenario: Scenario = THE_CROWD_BREAKS, carriedItem?: string): SaveData {
  const character = newCharacter('State Tester');
  if (carriedItem) character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, id: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function finishAfterOpeningGate(): SaveData {
  let state = fresh();
  state = act(state, THE_CROWD_BREAKS, 'openWestGate');
  state = act(state, THE_CROWD_BREAKS, 'gateTellTruth');
  state = act(state, THE_CROWD_BREAKS, 'crowdReport');
  return state;
}

function finishAfterHelpingChild(): SaveData {
  let state = fresh();
  state = act(state, THE_CROWD_BREAKS, 'liftChild', 0);
  state = act(state, THE_CROWD_BREAKS, 'childClearTruth');
  state = act(state, THE_CROWD_BREAKS, 'crowdReport');
  return state;
}

describe('state-aware shared aftermath narration', () => {
  it('credits crowd guidance only on routes that actually direct people through the west gate', () => {
    let passive = act(fresh(), THE_CROWD_BREAKS, 'climbStand', 0.999);
    passive = act(passive, THE_CROWD_BREAKS, 'fallStayWall');
    passive = act(passive, THE_CROWD_BREAKS, 'crowdReport');
    expect(passive.character?.historyFlags).not.toContain('guided people toward the exhibition hall west gate during a crowd surge');

    const guided = finishAfterOpeningGate();
    expect(guided.character?.historyFlags).toContain('guided people toward the exhibition hall west gate during a crowd surge');
  });

  it('records only the stationmaster account after a run-alongside route, not rail-clearing credit', () => {
    let state = act(fresh(), THE_TRAIN_THAT_DIDNT_STOP, 'runAlongside');
    expect(state.run?.sceneId).toBe('platformClear');
    expect(THE_TRAIN_THAT_DIDNT_STOP.scenes.platformClear.text).not.toMatch(/you keep the passengers|station hands away/i);
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'clearWait');
    state = act(state, THE_TRAIN_THAT_DIDNT_STOP, 'trainReport');
    expect(state.character?.historyFlags).toContain('gave the stationmaster an account of a damaged passenger train');
    expect(state.character?.historyFlags).not.toContain('helped avert a rail collision at a country station');
    expect(THE_TRAIN_THAT_DIDNT_STOP.scenes.trainEnd.text).not.toMatch(/thanks you for keeping them off the line|your clear account gave crews time/i);

    let signaled = act(fresh(), THE_TRAIN_THAT_DIDNT_STOP, 'showRedLamp');
    signaled = act(signaled, THE_TRAIN_THAT_DIDNT_STOP, 'signalWait');
    signaled = act(signaled, THE_TRAIN_THAT_DIDNT_STOP, 'clearWait');
    signaled = act(signaled, THE_TRAIN_THAT_DIDNT_STOP, 'trainReport');
    expect(signaled.character?.historyFlags).toContain('gave the stationmaster an account of a damaged passenger train');
  });

  it('does not claim unidentified injuries were taken to first aid when the child was not reached', () => {
    const state = finishAfterOpeningGate();
    expect(state.run?.sceneId).toBe('crowdEnd');
    const text = THE_CROWD_BREAKS.scenes.crowdEnd.text;
    expect(text).toContain('first-aid tent remains open for anyone hurt');
    expect(text).not.toMatch(/the injured are taken/i);
  });

  it('keeps the same aftermath truthful after the child is reached and has a scraped knee', () => {
    const state = finishAfterHelpingChild();
    expect(state.run?.sceneId).toBe('crowdEnd');
    const text = THE_CROWD_BREAKS.scenes.crowdEnd.text;
    expect(text).toContain('first-aid tent remains open for anyone hurt');
    expect(text).not.toMatch(/the injured are taken/i);
  });

  it('does not presume anyone was rescued when the roof crew takes over without a located person', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'leaveHall');
    state = act(state, THE_ROOF_COMES_IN, 'roofGiveAccount');
    expect(state.run?.sceneId).toBe('roofAftermath');
    const text = THE_ROOF_COMES_IN.scenes.roofAftermath.text;
    expect(text).toContain('Anyone brought out is taken to the inn');
    expect(text).not.toMatch(/the rescued people are taken/i);
  });

  it('acknowledges the inn check without overclaiming after a direct rescue', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'callPlatform');
    state = act(state, THE_ROOF_COMES_IN, 'shiftBench', 0);
    state = act(state, THE_ROOF_COMES_IN, 'roofFinalCount');
    expect(state.run?.sceneId).toBe('roofAftermath');
    expect(THE_ROOF_COMES_IN.scenes.roofAftermath.text).toContain('Anyone brought out is taken to the inn');
  });

  it('does not claim the visible pair are outside after wall bracing alone', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'braceNorth');
    expect(state.run?.sceneId).toBe('wallBraced');
    expect(state.run?.flags).not.toContain('roofPairSafe');
    state = JSON.parse(JSON.stringify(state)) as SaveData;

    const scene = THE_ROOF_COMES_IN.scenes.wallBraced;
    const variant = scene.textVariants?.find(({ requirements }) => meets(requirements, state));
    expect(scene.text).not.toMatch(/two visible people are already outside/i);
    expect(variant?.text).toBeUndefined();
  });

  it('retains the outside-pair claim after guiding them through the east door before bracing', () => {
    let state = fresh(THE_ROOF_COMES_IN);
    state = act(state, THE_ROOF_COMES_IN, 'eastPair');
    state = JSON.parse(JSON.stringify(state)) as SaveData;
    state = act(state, THE_ROOF_COMES_IN, 'pairFetchBeam');
    expect(state.run?.sceneId).toBe('wallBraced');
    expect(state.run?.flags).toContain('roofPairSafe');

    const scene = THE_ROOF_COMES_IN.scenes.wallBraced;
    const variant = scene.textVariants?.find(({ requirements }) => meets(requirements, state));
    expect(variant?.text).toMatch(/two visible people are already outside/i);
  });

  it('does not treat checking the fallen gate as moving the cow', () => {
    let state = fresh(AFTER_THE_TORNADO);
    state = act(state, AFTER_THE_TORNADO, 'checkKitchen');
    state = act(state, AFTER_THE_TORNADO, 'stoveSmother');
    state = act(state, AFTER_THE_TORNADO, 'safeCow');
    expect(state.run?.sceneId).toBe('tornadoAftermath');
    expect(state.run?.flags).toContain('tornadoFireSafe');
    expect(state.run?.flags).not.toContain('tornadoCowMoved');

    let moved = fresh(AFTER_THE_TORNADO);
    moved = act(moved, AFTER_THE_TORNADO, 'sendForHelp');
    moved = act(moved, AFTER_THE_TORNADO, 'leaveCow');
    expect(moved.run?.sceneId).toBe('tornadoAftermath');
    expect(moved.run?.flags).toContain('tornadoCowMoved');
  });

  it('does not treat calling the bridge driver as proof he reached shore', () => {
    let state = fresh(THE_BRIDGE_GOES_DOWN);
    state = act(state, THE_BRIDGE_GOES_DOWN, 'reachChild', 0);
    expect(state.run?.sceneId).toBe('childAcross');
    state = act(state, THE_BRIDGE_GOES_DOWN, 'callFather');
    state = act(state, THE_BRIDGE_GOES_DOWN, 'bridgeLeave');
    const ending = THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd;
    expect(ending.text).not.toMatch(/driver reaches the west bank/i);
    expect(ending.textVariants?.some(({ text }) => /driver.*reach(?:es)? the west bank/i.test(text))).toBe(false);
    expect(state.run?.flags).toContain('bridgeChildSaved');
    expect(state.run?.flags).not.toContain('bridgePeopleSaved');

    let mule = fresh(THE_BRIDGE_GOES_DOWN, 'smallKnife');
    mule = act(mule, THE_BRIDGE_GOES_DOWN, 'callDriver');
    mule = act(mule, THE_BRIDGE_GOES_DOWN, 'freeMule');
    expect(mule.run?.sceneId).toBe('muleSaved');
    mule = act(mule, THE_BRIDGE_GOES_DOWN, 'muleCallDriver');
    mule = act(mule, THE_BRIDGE_GOES_DOWN, 'bridgeLeave');
    const muleEnding = THE_BRIDGE_GOES_DOWN.scenes.bridgeEnd;
    expect(muleEnding.text).not.toMatch(/driver reaches the west bank/i);
    expect(muleEnding.textVariants?.some(({ text }) => /driver.*reach(?:es)? the west bank/i.test(text))).toBe(false);
    expect(mule.run?.flags).toContain('bridgeMuleFreed');
    expect(mule.run?.flags).not.toContain('bridgePeopleSaved');
  });

  it('does not convert a boiler warning into a claim that every worker evacuated', () => {
    let unwarned = fresh(THE_BOILER_ROOM);
    unwarned = act(unwarned, THE_BOILER_ROOM, 'tellForeman');
    unwarned = act(unwarned, THE_BOILER_ROOM, 'ventBoiler');
    unwarned = act(unwarned, THE_BOILER_ROOM, 'boilerAccount');
    expect(unwarned.run?.sceneId).toBe('boilerAftermath');
    expect(THE_BOILER_ROOM.scenes.boilerAftermath.text).not.toMatch(/workers are counted outside/i);
    unwarned = act(unwarned, THE_BOILER_ROOM, 'boilerLeave');
    expect(THE_BOILER_ROOM.scenes.boilerEnd.text).not.toMatch(/workers are counted outside/i);

    let warnedButIncomplete = fresh(THE_BOILER_ROOM);
    warnedButIncomplete = act(warnedButIncomplete, THE_BOILER_ROOM, 'warnShift');
    warnedButIncomplete = act(warnedButIncomplete, THE_BOILER_ROOM, 'assistForeman');
    warnedButIncomplete = act(warnedButIncomplete, THE_BOILER_ROOM, 'turnWheel', 0);
    warnedButIncomplete = act(warnedButIncomplete, THE_BOILER_ROOM, 'boilerAccount');
    expect(warnedButIncomplete.run?.flags).toContain('boilerShiftWarned');
    expect(warnedButIncomplete.run?.sceneId).toBe('boilerAftermath');
    expect(THE_BOILER_ROOM.scenes.boilerAftermath.text).not.toMatch(/workers are counted outside/i);
  });
});
