import { describe, expect, it } from 'vitest';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { DISASTER_RESCUE_ADVENTURES } from './disasterRescueBatch';
import { WESTERN_OUTLAW_ADVENTURES } from './westernOutlawBatch';
import { LOST_PLACES_ADVENTURES } from './lostPlacesBatch';

const BATCH = [...DISASTER_RESCUE_ADVENTURES, ...WESTERN_OUTLAW_ADVENTURES, ...LOST_PLACES_ADVENTURES];

function assertEveryAvailableBranch(scenario: Scenario, carriedItem?: string): void {
  const character = newCharacter('Expansion QA');
  if (carriedItem) character.carriedItem = carriedItem;
  const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  const pending = [initial];
  const visited = new Set<string>();
  let examined = 0;
  while (pending.length) {
    const state = pending.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.itemStates]);
    if (visited.has(key)) continue;
    visited.add(key);
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (run.status !== 'active' || scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} available action`).toBeGreaterThan(0);
    for (const choice of available) for (const roll of [0, 0.999999]) {
      const next = choose(state, scenario, choice, () => roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      pending.push(next);
    }
    expect(++examined, scenario.title).toBeLessThan(3000);
  }
}

describe('disaster, western, and lost-place expansion', () => {
  it('registers all 36 new adventures with stable unique IDs and complete metadata', () => {
    expect(BATCH).toHaveLength(36);
    expect(SCENARIOS).toHaveLength(589);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(validateScenarioMetadata(BATCH)).toEqual([]);
  });

  it('keeps every new scenario forward-only, reachable, actionable, and within four choices', () => {
    for (const scenario of BATCH) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}.${scene.id}`).toBeGreaterThan(0);
        expect(scene.choices.length, `${scenario.title}.${scene.id}`).toBeLessThanOrEqual(4);
        for (const text of [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text)]) expect(text.length, `${scenario.title}.${scene.id} no-scroll copy`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${scenario.title}.${scene.id} mobile label`).toBeLessThanOrEqual(70);
      }
      assertEveryAvailableBranch(scenario);
    }
  });

  it('includes distinct crisis, western, and exploration decision patterns', () => {
    expect(DISASTER_RESCUE_ADVENTURES).toHaveLength(12);
    expect(WESTERN_OUTLAW_ADVENTURES).toHaveLength(12);
    expect(LOST_PLACES_ADVENTURES).toHaveLength(12);
    for (const group of [DISASTER_RESCUE_ADVENTURES, WESTERN_OUTLAW_ADVENTURES, LOST_PLACES_ADVENTURES]) {
      expect(group.some(({ scenes }) => Object.values(scenes).some(({ ending }) => ending === 'death'))).toBe(true);
    }
  });

  it('keeps disaster endings honest about who actually reached safety', () => {
    const bridge = DISASTER_RESCUE_ADVENTURES.find(({ id }) => id === 'the-bridge-goes-down')!;
    const character = newCharacter('State Test');
    const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, bridge) };
    expect(sceneText(bridge.scenes.bridgeEnd, state)).not.toMatch(/driver.*daughter.*mule reach/i);
    state.run!.flags.push('bridgePeopleSaved');
    expect(sceneText(bridge.scenes.bridgeEnd, state)).toMatch(/driver and his daughter reach the west bank/i);
    expect(sceneText(bridge.scenes.bridgeEnd, state)).toMatch(/mule’s position remains uncertain/i);
    state.run!.flags.push('bridgeMuleFreed');
    expect(sceneText(bridge.scenes.bridgeEnd, state)).toMatch(/driver, his daughter, and the mule reach the west bank/i);

    const ferry = DISASTER_RESCUE_ADVENTURES.find(({ id }) => id === 'the-ferry-lists')!;
    expect(ferry.scenes.ferryEnd.text).toMatch(/who reached the landing.*unaccounted names remain/i);
    const tornado = DISASTER_RESCUE_ADVENTURES.find(({ id }) => id === 'after-the-tornado')!;
    expect(tornado.scenes.tornadoEnd.text).toMatch(/child is with them only if found.*cow is safe only if freed or moved/i);
  });
});
