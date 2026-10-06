import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { ITEMS } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { COMPETITION_GEAR_GENRE_BATCH } from './competitionGearGenreBatch';
import type { SaveData, Scenario } from '../types';

function begin(scenario: Scenario, money = 5): SaveData {
  const character = newCharacter('Contest Tester');
  character.money = money;
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: ReturnType<typeof begin>, scenario: Scenario, id: string, random = () => 0) {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

describe('Gear Expansion Genre Batch 6 — Competitions / Wagers / Challenges', () => {
  it('registers 24 unique, all-year Adventures with clean complete graphs and no new Gear IDs', () => {
    expect(COMPETITION_GEAR_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(709);
    expect(new Set(COMPETITION_GEAR_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(COMPETITION_GEAR_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(COMPETITION_GEAR_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    expect(COMPETITION_GEAR_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(0);
    const rewardedIds = new Set(COMPETITION_GEAR_GENRE_BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices.flatMap(({ effects }) => effects?.gainItems ?? []))));
    expect(rewardedIds.size).toBeGreaterThan(0);
    for (const id of rewardedIds) expect(ITEMS[id]?.inventoryClass).toBe('GEAR');
  });

  it('keeps every authored scene reachable from its normal entry', () => {
    for (const scenario of COMPETITION_GEAR_GENRE_BATCH) {
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id) || !scenario.scenes[id]) continue;
        reached.add(id);
        for (const choice of scenario.scenes[id].choices) {
          const destinations = choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next];
          for (const destination of destinations) {
            if (destination) pending.push(destination);
          }
        }
      }
      expect([...Object.keys(scenario.scenes)].filter((id) => !reached.has(id)), scenario.id).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
        expect(Boolean(choice.next || choice.chance || choice.effects?.combat), `${scenario.id}.${scene.id}.${choice.id} must resolve to another state`).toBe(true);
      }
    }
  });

  it('makes the water-wheel wager single-round, capped, and exact on win or loss', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    let state = begin(scenario, 3);
    state = act(state, scenario, 'stakeCoin');
    expect(state.character?.money).toBe(2);
    state = act(state, scenario, 'callNarrow', () => 0);
    expect(state.character?.money).toBe(4);
    expect(state.run?.sceneId).toBe('testNarrow');
    const loser = act(act(begin(scenario, 3), scenario, 'stakeCoin'), scenario, 'callWide', () => 0.99);
    expect(loser.character?.money).toBe(2);
    expect(loser.run?.sceneId).toBe('testNarrow');
  });

  it('keeps the inn wager one hand only and pays the agreed stake once', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-quiet-card-count')!;
    let state = begin(scenario, 3);
    state = act(state, scenario, 'playHand');
    expect(state.character?.money).toBe(2);
    state = act(state, scenario, 'callHigh');
    expect(state.run?.sceneId).toBe('won');
    state = act(state, scenario, 'takeOneCoin');
    expect(state.character?.money).toBe(4);
    expect(state.run?.sceneId).toBe('coinPrize');
    expect(scenario.scenes.coinPrize.choices).toHaveLength(0);

    let loss = begin(scenario, 3);
    loss = act(loss, scenario, 'playHand');
    loss = act(loss, scenario, 'callLow');
    expect(loss.character?.money).toBe(2);
    expect(loss.run?.sceneId).toBe('lost');
  });

  it('persists an explicitly won Gear prize through the real acquisition path', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-blind-trail-marker')!;
    let state = begin(scenario);
    state = act(state, scenario, 'compareStride');
    state = act(state, scenario, 'nameNarrowTrail');
    state = act(state, scenario, 'acceptRope');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('travelRope');
    expect(state.run?.acquiredThisRun).toContain('travelRope');
    expect(state.itemStates?.travelRope?.provenance).toContain('Awarded by guide Sen Harlow for correctly identifying the narrow trail from linked evidence in The Blind Trail Marker.');
  });

  it('grants the announced square only after the measured-frame result and prize choice', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-seven-inch-square')!;
    let state = begin(scenario);
    state = act(state, scenario, 'measureOpening');
    state = act(state, scenario, 'squareAndShim');
    expect(state.run?.sceneId).toBe('result');
    expect(state.run?.inventory).not.toContain('carpenterSquare');
    state = act(state, scenario, 'acceptSquarePrize');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('carpenterSquare');
    expect(JSON.stringify(state.itemStates?.carpenterSquare?.provenance)).toContain('Awarded by carpenter Willa');
  });

  it('routes every authored Gear prize through the canonical run inventory grant', () => {
    for (const scenario of COMPETITION_GEAR_GENRE_BATCH) for (const [sceneId, scene] of Object.entries(scenario.scenes)) {
      for (const choice of scene.choices.filter(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) {
        const state = begin(scenario);
        state.run!.sceneId = sceneId;
        for (const flag of choice.requirements?.flags ?? []) state.run!.flags.push(flag);
        const resulting = act(state, scenario, choice.id);
        for (const id of choice.effects?.gainItems ?? []) {
          expect(resulting.run?.inventory, `${scenario.id}.${sceneId}.${choice.id} grants ${id}`).toContain(id);
          expect(resulting.run?.acquiredThisRun).toContain(id);
        }
        expect(resulting.run?.status, `${scenario.id}.${sceneId}.${choice.id} completes its prize route`).toBe('success');
      }
    }
  });

  it('preserves a wager exactly across a save/resume boundary with no replay or second payout', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    let state = act(begin(scenario, 3), scenario, 'stakeCoin');
    const resumed = structuredClone(state);
    expect(resumed.character?.money).toBe(2);
    state = act(resumed, scenario, 'callNarrow', () => 0);
    expect(state.character?.money).toBe(4);
    expect(scenario.scenes[state.run!.sceneId].choices).toHaveLength(0);
  });

  it('does not expose a coin stake without the required funds', () => {
    const scenario = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-bet-at-the-water-wheel')!;
    const poor = begin(scenario, 0);
    expect(meets(scenario.scenes.brief.choices.find(({ id }) => id === 'stakeCoin')?.requirements, poor)).toBe(false);
    const card = COMPETITION_GEAR_GENRE_BATCH.find(({ id }) => id === 'the-quiet-card-count')!;
    expect(meets(card.scenes.table.choices.find(({ id }) => id === 'playHand')?.requirements, begin(card, 0))).toBe(false);
  });
});
