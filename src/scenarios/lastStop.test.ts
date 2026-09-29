import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import type { SaveData, Scenario } from '../types';
import { BROKEN_BELL } from './brokenBell';
import { LAST_STOP } from './lastStop';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Test Traveler');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, LAST_STOP) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = LAST_STOP.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, LAST_STOP, choice!, () => random);
}

describe('The Last Stop', () => {
  it('supports a fresh-character brake route to a survivable ending', () => {
    let state = fresh();
    for (const id of ['board', 'conductor', 'learn', 'seat', 'settle', 'findConductor', 'takeCharge', 'brake', 'knownMethod', 'hold']) state = act(state, id);
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('messyEnding');
  });

  it('supports a distinct clean locomotive repair route', () => {
    let state = fresh();
    state.run!.sceneId = 'locomotive';
    state.run!.inventory.push('pocketToolkit');
    state = act(state, 'repair');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('cleanEnding');
    expect(state.run?.inventory).toContain('signalLens');
  });

  it('makes a failed roof crossing harmful without making failure arbitrary', () => {
    let state = fresh();
    state.run!.sceneId = 'roofAccess';
    state = act(state, 'crossRoof', 0.99);
    expect(state.run?.sceneId).toBe('roofSlip');
    expect(state.run?.health).toBe(7);
    expect(state.run?.status).toBe('active');
  });

  it('lets a carried Brass Candlestick bypass the roof crossing', () => {
    const state = fresh(0, 'brassCandlestick');
    state.run!.sceneId = 'roofAccess';
    const available = LAST_STOP.scenes.roofAccess.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).toContain('smashWindow');
    expect(act(state, 'smashWindow').run?.sceneId).toBe('locomotive');
  });

  it('supports earning and spending character money', () => {
    let state = fresh();
    state = act(state, 'helpPorter');
    expect(state.character?.money).toBe(4);
    state = act(state, 'visitKiosk');
    state = act(state, 'buyTools');
    expect(state.character?.money).toBe(0);
    expect(state.run?.inventory).toContain('pocketToolkit');
    expect(state.run?.acquiredThisRun).toContain('pocketToolkit');
  });

  it('preserves the difficult uncoupling choice and its distinct ending', () => {
    let state = fresh();
    state.run!.sceneId = 'couplingChoice';
    state = act(state, 'cutLoose');
    expect(state.run?.flags).toContain('carsUncoupled');
    state = act(state, 'lightBrake');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('uncoupledEnding');
  });

  it('supports a personal-survival ending that does not claim the train was saved', () => {
    let state = fresh(0, 'travelRope');
    state.run!.sceneId = 'escapePoint';
    state = act(state, 'ropeExit');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('escapeEnding');
    expect(LAST_STOP.scenes.escapeEnding.text).toContain('not the same as victory');
  });

  it('uses the standard death handling after a clearly dangerous failed action', () => {
    let state = fresh();
    state.run!.sceneId = 'engineBurn';
    state.run!.health = 5;
    state = act(state, 'retry', 0.99);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
  });
});

describe.each([BROKEN_BELL, LAST_STOP])('$title reachable-state safety', (scenario: Scenario) => {
  it('never reaches an active non-ending scene with zero available actions', () => {
    const character = newCharacter('Graph Walker');
    character.money = 8;
    const initial: SaveData = { version: 1, bank: [], character, run: startRun(character, scenario) };
    const queue = [initial];
    const visited = new Set<string>();
    const deadEnds: string[] = [];
    const positiveItems = new Set(Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap((choice) => [
      ...(choice.requirements?.items ?? []), ...(choice.requirements?.anyItems ?? []),
    ])));
    const positiveFlags = new Set(Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap((choice) => choice.requirements?.flags ?? [])));

    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const currentCharacter = state.character!;
      const key = JSON.stringify({
        scene: run.sceneId,
        inventory: run.inventory.filter((id) => positiveItems.has(id)).sort(),
        flags: run.flags.filter((id) => positiveFlags.has(id)).sort(),
        knowledge: [...currentCharacter.knowledge].sort(),
      });
      if (visited.has(key)) continue;
      visited.add(key);
      if (run.status !== 'active') continue;

      const scene = scenario.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      const available = scene.choices.filter((choice) => meets(choice.requirements, state));
      if (!available.length) {
        deadEnds.push(`${run.sceneId} at ${run.health} health with [${run.inventory.join(', ')}]`);
        continue;
      }

      for (const choice of available) {
        queue.push(choose(state, scenario, choice, () => 0));
        if (choice.chance || choice.effects?.combat) queue.push(choose(state, scenario, choice, () => 0.999999));
      }
    }

    expect(deadEnds, `Reachable dead ends:\n${deadEnds.join('\n')}`).toEqual([]);
    expect(visited.size).toBeGreaterThan(20);
  }, 20_000);
});
