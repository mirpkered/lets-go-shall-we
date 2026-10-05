import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { FRONTIER_DISCOVERY_ADVENTURES } from './frontierDiscoveryBatch';

const scenario = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-missing-assayer')!;

function start(): SaveData {
  const character = newCharacter('Assayer Route Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
  expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!);
}

describe('The Missing Assayer investigation payoff', () => {
  it('shows the ridge being followed, preserves the intermediate scene on save/resume, and keeps the fate unresolved', () => {
    let state = act(start(), 'the-missing-assayerStart', 'approach');
    state = act(state, 'the-missing-assayerEvidence', 'followRidgeTrail');
    expect(state.run?.sceneId).toBe('the-missing-assayerDecision');
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/follow the trail to the blind shoulder/i);

    let serialized = '';
    const storage = { setItem: (_key: string, value: string) => { serialized = value; }, getItem: () => serialized };
    saveGame(state, storage);
    state = loadSave(storage);
    expect(state.run?.sceneId).toBe('the-missing-assayerDecision');

    state = act(state, 'the-missing-assayerDecision', 'traceToSaddle');
    expect(state.run?.sceneId).toBe('the-missing-assayerBold');
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/continues toward the old assay road/i);
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/cannot be dated or identified/i);
    expect(scenario.scenes[state.run!.sceneId].text).not.toMatch(/found the assayer|the assayer was dead|the assayer had been killed/i);
  });

  it('shows what waiting and reporting accomplish instead of ending on the setup evidence', () => {
    let waiting = act(start(), 'the-missing-assayerStart', 'approach');
    waiting = act(waiting, 'the-missing-assayerEvidence', 'callFromDoor');
    expect(scenario.scenes[waiting.run!.sceneId].text).toMatch(/no one answers/i);
    waiting = act(waiting, 'the-missing-assayerWait', 'leaveStationNote');
    expect(scenario.scenes[waiting.run!.sceneId].text).toMatch(/leave a note at the station/i);
    expect(scenario.scenes[waiting.run!.sceneId].text).toMatch(/whereabouts remain unknown/i);

    let reporting = act(start(), 'the-missing-assayerStart', 'approach');
    reporting = act(reporting, 'the-missing-assayerEvidence', 'leaveWord');
    expect(scenario.scenes[reporting.run!.sceneId].text).toMatch(/you give the clerk the assayer’s description/i);
    reporting = act(reporting, 'the-missing-assayerReport', 'leaveReport');
    expect(scenario.scenes[reporting.run!.sceneId].text).toMatch(/report is recorded/i);
    expect(scenario.scenes[reporting.run!.sceneId].text).toMatch(/do not settle whether it was voluntary/i);
  });
});
