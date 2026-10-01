import { describe, expect, it } from 'vitest';
import { choose, forceQaEasterEgg, newCharacter, sceneText, startAdventure } from './engine';
import { EASTER_EGGS, EASTER_EGG_CHANCE, rollEasterEgg } from './easterEggs';
import { loadSave, SAVE_KEY } from './storage';
import type { SaveData, Scenario } from './types';

const quietScenario: Scenario = {
  id: 'egg-test', title: 'Egg test', subtitle: '', startScene: 'market',
  scenes: {
    market: { id: 'market', title: 'Market', text: 'The square is calm.', easterEggContext: 'market', choices: [{ id: 'move', label: 'Move along', next: 'inn' }] },
    inn: { id: 'inn', title: 'Inn', text: 'The common room is quiet.', easterEggContext: 'inn', choices: [{ id: 'finish', label: 'Finish', next: 'done' }] },
    done: { id: 'done', title: 'Done', text: 'The adventure ends.', ending: 'success', choices: [] },
  },
};
const zeros = () => 0;

describe('rare Easter egg events', () => {
  it('uses a rare 2% check, with deterministic failure and eligible success', () => {
    expect(EASTER_EGG_CHANCE).toBeGreaterThanOrEqual(0.01);
    expect(EASTER_EGG_CHANCE).toBeLessThanOrEqual(0.03);
    expect(rollEasterEgg('market', [], () => 0.99)).toBeNull();
    expect(rollEasterEgg('market', [], zeros)).not.toBeNull();
  });

  it('never fires in a scene without a declared context', () => {
    const scenario = { ...quietScenario, startScene: 'plain', scenes: { plain: { id: 'plain', title: 'Plain', text: 'Nothing odd.', choices: [] } } };
    const character = newCharacter();
    const state = startAdventure({ version: 1, bank: [], character, run: null }, scenario, zeros);
    expect(state.run?.easterEggEvent).toBeUndefined();
    expect(state.recentEasterEggIds).toBeUndefined();
  });

  it('respects the QA-only automatic-event disable switch', () => {
    const character = newCharacter('QA disable');
    const qaState = startAdventure({ version: 1, bank: [], character, run: null }, quietScenario, () => 0.99, true);
    qaState.run!.qaEasterEggDisabled = true;
    qaState.run!.qaMode = false;
    const next = choose(qaState, quietScenario, quietScenario.scenes.market.choices[0], zeros);
    expect(next.run?.sceneId).toBe('inn');
    expect(next.run?.easterEggEvent).toBeUndefined();
  });

  it('fires at most once per run, persists exact text, and does not alter gameplay or progression', () => {
    const character = newCharacter('Flavor only');
    character.money = 7;
    character.lore = ['old tale'];
    character.knowledge = ['known road'];
    const initial: SaveData = { version: 1, bank: ['graveCoin'], character, run: null };
    const started = startAdventure(initial, quietScenario, zeros);
    const event = started.run!.easterEggEvent!;
    expect(event.sceneId).toBe('market');
    expect(sceneText(quietScenario.scenes.market, started)).toContain(event.text);
    expect(started.run?.qualifyingStoryTransitions).toBe(0);
    expect(started.run?.inventory).toEqual(['smallKnife', 'lantern']);
    expect(started.run?.flags).toEqual([]);
    expect(started.character?.money).toBe(7);
    expect(started.character?.lore).toEqual(['old tale']);
    expect(started.character?.knowledge).toEqual(['known road']);
    expect(started.bank).toEqual(['graveCoin']);
    expect(started.pendingGlobalCompletions).toBeUndefined();

    const stored = JSON.stringify(started);
    const reload = loadSave({ getItem: (key) => key === SAVE_KEY ? stored : null }, SAVE_KEY);
    expect(reload.run?.easterEggEvent).toEqual(event);
    expect(sceneText(quietScenario.scenes.market, reload)).toContain(event.text);
    const next = choose(reload, quietScenario, quietScenario.scenes.market.choices[0], zeros);
    expect(next.run?.easterEggEvent).toEqual(event);
    expect(next.run?.sceneId).toBe('inn');
    expect(next.run?.qualifyingStoryTransitions).toBe(1);
    expect(next.recentEasterEggIds).toHaveLength(1);
  });

  it('prefers a context-eligible event not recently seen when possible', () => {
    const first = rollEasterEgg('market', [], zeros)!;
    const next = rollEasterEgg('market', [first.id], zeros)!;
    expect(next.id).not.toBe(first.id);
    expect(next.contexts).toContain('market');
  });

  it('allows QA to force a specific event without affecting player history or counters', () => {
    const character = newCharacter('QA');
    const run = { ...startAdventure({ version: 1 as const, bank: [], character, run: null }, quietScenario, () => 0.99, true).run!, qaMode: true };
    const before: SaveData = { version: 1, bank: ['oldKey'], character, run, recentScenarioIds: ['other'], recentEasterEggIds: ['old-egg'], pendingGlobalCompletions: ['existing'] };
    const egg = EASTER_EGGS.find((item) => item.id === 'traveler-with-towel')!;
    const forced = forceQaEasterEgg(before, egg);
    expect(forced.run?.easterEggEvent).toEqual({ id: egg.id, sceneId: 'market', text: egg.text });
    expect(forced.recentScenarioIds).toEqual(['other']);
    expect(forced.recentEasterEggIds).toEqual(['old-egg']);
    expect(forced.pendingGlobalCompletions).toEqual(['existing']);
    expect(forced.bank).toEqual(['oldKey']);
    expect(forced.character?.adventuresCompleted).toBe(0);
  });
});
