import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { analyzeScenarioLibrary, validateScenarioMetadata } from '../scenarioDiversity';
import { auditContentQuality } from '../contentQuality';
import { simulateScenarioSelection } from '../scenarioSelection';
import { scenarioRiskTier } from '../riskClassification';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { FRONTIER_DISCOVERY_ADVENTURES } from './frontierDiscoveryBatch';

function explore(scenarioIndex: number): void {
  const scenario = FRONTIER_DISCOVERY_ADVENTURES[scenarioIndex];
  const character = newCharacter('Frontier QA');
  const queue: SaveData[] = [{ ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) }];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (run.status !== 'active' || scene.ending) continue;
    const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${scene.id} remains actionable`).toBeGreaterThan(0);
    expect(choices.length, `${scenario.title}.${scene.id} mobile grid`).toBeLessThanOrEqual(4);
    for (const choice of choices) for (const roll of choice.chance ? [0, 0.999999] : [0]) {
      const next = choose(state, scenario, choice, () => roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active').toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(seen.size).toBeLessThan(150);
  }
}

describe('remote discovery and frontier claims batch', () => {
  it('registers 40 distinct all-year adventures with valid diversity metadata', () => {
    expect(FRONTIER_DISCOVERY_ADVENTURES).toHaveLength(40);
    expect(SCENARIOS).toHaveLength(709);
    expect(new Set(FRONTIER_DISCOVERY_ADVENTURES.map(({ id }) => id)).size).toBe(40);
    expect(FRONTIER_DISCOVERY_ADVENTURES.every((scenario) => SCENARIOS.includes(scenario))).toBe(true);
    expect(validateScenarioMetadata(FRONTIER_DISCOVERY_ADVENTURES)).toEqual([]);
    expect(FRONTIER_DISCOVERY_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
  });

  it('keeps every graph forward-only, reachable, actionable, compact, and within the 2x2 choice limit', () => {
    for (const scenario of FRONTIER_DISCOVERY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        expect(scene.choices.length, `${scenario.title}.${scene.id}`).toBeLessThanOrEqual(4);
        expect(scene.text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${scenario.title}.${scene.id} label`).toBeLessThanOrEqual(70);
      }
      expect(Object.values(scenario.scenes).some(({ text }) => /trail back remains clear, and the evidence does not prove more than you observed/i.test(text)), scenario.title).toBe(false);
    }
    for (let index = 0; index < FRONTIER_DISCOVERY_ADVENTURES.length; index += 1) explore(index);
  });

  it('makes environmental discovery, contested claims, salvage decisions, and structural retreat authored patterns', () => {
    const graphShapes = new Set(FRONTIER_DISCOVERY_ADVENTURES.map(({ scenes }) => Object.values(scenes).map(({ choices }) => choices.length).join('-')));
    expect(graphShapes.size).toBeGreaterThanOrEqual(4);
    expect(FRONTIER_DISCOVERY_ADVENTURES.filter(({ diversity }) => diversity?.entryShapes?.includes('voluntary curiosity')).length).toBeGreaterThan(14);
    expect(FRONTIER_DISCOVERY_ADVENTURES.filter(({ title }) => /claim|survey/i.test(title)).length).toBeGreaterThan(8);
    expect(FRONTIER_DISCOVERY_ADVENTURES.filter((scenario) => scenarioRiskTier(scenario) === 'HIGH')).toHaveLength(6);
    expect(FRONTIER_DISCOVERY_ADVENTURES.some(({ scenes }) => Object.values(scenes).some(({ choices }) => choices.some(({ chance }) => chance)))).toBe(true);
    expect(FRONTIER_DISCOVERY_ADVENTURES.every(({ scenes }) => Object.values(scenes).some(({ ending }) => ending === 'success'))).toBe(true);
  });

  it('foreshadows each lethal structural route and leaves an authored chance of success', () => {
    const lethal = FRONTIER_DISCOVERY_ADVENTURES.filter(({ scenes }) => Object.values(scenes).some(({ ending }) => ending === 'death'));
    expect(lethal.map(({ id }) => id).sort()).toEqual([
      'camp-below-the-slide', 'the-collapsed-storehouse', 'the-derelict-stamp-mill',
      'the-old-dredge', 'the-old-hydraulic-cut', 'the-washed-out-claim',
    ]);
    for (const scenario of lethal) {
      const danger = Object.values(scenario.scenes).flatMap(({ choices }) => choices).find(({ chance }) => chance?.failureNext === Object.values(scenario.scenes).find(({ ending }) => ending === 'death')?.id)!;
      expect(danger.hint, scenario.title).toBeTruthy();
      expect(danger.chance!.probability, scenario.title).toBeGreaterThan(0);
      expect(danger.chance!.probability, scenario.title).toBeLessThan(1);
      expect(scenario.scenes[danger.chance!.successNext].ending).not.toBe('death');
    }
  });

  it('keeps theft/ownership ambiguity and a quiet discovery outcome as authored player choices', () => {
    const cache = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-cache-under-the-stove')!;
    const cacheDecision = Object.values(cache.scenes).find(({ title }) => title === 'Take, Leave, or Risk More')!;
    expect(cacheDecision.text).toMatch(/stored property, not random debris/i);
    expect(cacheDecision.choices.some(({ label }) => /take/i.test(label))).toBe(true);
    expect(cacheDecision.choices.some(({ label }) => /restore/i.test(label))).toBe(true);
    expect(cache.scenes[`${cache.id}Mishap`]).toBeUndefined();
    const quiet = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-old-claim-cabin')!;
    expect(Object.values(quiet.scenes).some(({ text }) => /no letter explains|no certain account/i.test(text))).toBe(true);
    expect(quiet.diversity?.fantasyDensity).toBe('NONE');
  });

  it('does not leak undiscovered facts on an early exit and pays out the explicitly taken cache coins once', () => {
    const cabin = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-cache-under-the-stove')!;
    const character = newCharacter('Cache Test');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, cabin, () => 0) };
    const early = choose(initial, cabin, cabin.scenes[cabin.startScene].choices.find(({ id }) => id === 'markAndLeave')!);
    expect(early.character?.knowledge).toEqual([]);
    const evidence = choose(initial, cabin, cabin.scenes[cabin.startScene].choices.find(({ id }) => id === 'approach')!);
    const decision = choose(evidence, cabin, cabin.scenes[evidence.run!.sceneId].choices.find(({ id }) => id === 'readEvidence')!);
    const taken = choose(decision, cabin, cabin.scenes[decision.run!.sceneId].choices.find(({ id }) => id === 'takeRisk')!);
    expect(taken.character?.money).toBe(2);
    expect(taken.character?.historyFlags).toContain('took two coins from an identified cache beneath a cabin stove');
  });

  it('honors the Forgotten Supply Cache take choice with a named, persistent item and state-aware outcomes', () => {
    const cache = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-forgotten-supply-cache')!;
    const fresh = (items: string[] = []) => {
      const character = newCharacter('Cache Route Tester');
      character.carriedItems = items;
      character.carriedItem = items[0] ?? null;
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, cache, () => 0) };
    };
    const act = (state: SaveData, choiceId: string) => {
      const current = cache.scenes[state.run!.sceneId];
      const choice = current.choices.find(({ id }) => id === choiceId);
      expect(choice, `${current.id}.${choiceId}`).toBeTruthy();
      expect(meets(choice!.requirements, state)).toBe(true);
      return choose(state, cache, choice!);
    };
    const enterDecision = (state: SaveData) => act(act(state, 'approach'), 'readEvidence');

    const left = enterDecision(fresh());
    const leftEnding = act(left, 'leaveCacheUntouched');
    expect(leftEnding.run?.sceneId).toBe('the-forgotten-supply-cacheEvidenceLeft');
    expect(cache.scenes[leftEnding.run!.sceneId].text).toMatch(/turn back/i);
    const marked = enterDecision(fresh());
    const markedEnding = act(marked, 'markCacheForOwner');
    expect(markedEnding.run?.sceneId).toBe('the-forgotten-supply-cacheCautious');
    expect(cache.scenes[markedEnding.run!.sceneId].text).toMatch(/cache’s placement and fresh prints are recorded/i);

    let take = enterDecision(fresh());
    take = act(take, 'takeOneFromCache');
    expect(take.run?.sceneId).toBe('the-forgotten-supply-cacheChooseItem');
    const saved = new Map<string, string>();
    const storage = { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => { saved.set(key, value); } };
    saveGame(take, storage);
    take = loadSave(storage);
    take = act(take, 'takeTravelRope');
    expect(take.run?.acquiredThisRun).toContain('travelRope');
    expect(cache.scenes[take.run!.sceneId].text).toMatch(/take the Travel Rope/i);
    expect(cache.scenes[take.run!.sceneId].text).toMatch(/owner may return/i);

    let rewards = openRewardResolution(take);
    expect(rewards.run?.rewardPendingItems).toContain('travelRope');
    rewards = placeReward(rewards, 'travelRope', 'carry');
    expect(rewards.character?.carriedItems).toContain('travelRope');
    expect(placeReward(rewards, 'travelRope', 'carry').character?.carriedItems).toEqual(rewards.character?.carriedItems);

    const alreadyOwnsRope = fresh(['travelRope']);
    let chooseItem = act(enterDecision(alreadyOwnsRope), 'takeOneFromCache');
    const itemScene = cache.scenes[chooseItem.run!.sceneId];
    expect(meets(itemScene.choices.find(({ id }) => id === 'takeTravelRope')!.requirements, chooseItem)).toBe(false);
    expect(meets(itemScene.choices.find(({ id }) => id === 'takeWoolBlanket')!.requirements, chooseItem)).toBe(true);
    chooseItem = act(chooseItem, 'takeWoolBlanket');
    expect(chooseItem.run?.acquiredThisRun).toContain('woolTravelBlanket');
    expect(cache.scenes[chooseItem.run!.sceneId].text).toMatch(/take the Wool Travel Blanket/i);
    let bothOwned: SaveData = fresh(['travelRope', 'woolTravelBlanket']);
    bothOwned = act(enterDecision(bothOwned), 'takeOneFromCache');
    expect(cache.scenes[bothOwned.run!.sceneId].choices.filter((choice) => meets(choice.requirements, bothOwned)).map(({ id }) => id)).toEqual(['returnItemToCache']);

    const bankedCharacter = newCharacter('Banked Rope QA');
    const bankedRope: SaveData = { ...structuredClone(EMPTY_SAVE), character: bankedCharacter, run: startRun(bankedCharacter, cache, () => 0), bank: ['travelRope'] };
    const bankedChoice = act(enterDecision(bankedRope), 'takeOneFromCache');
    expect(meets(cache.scenes[bankedChoice.run!.sceneId].choices.find(({ id }) => id === 'takeTravelRope')!.requirements, bankedChoice)).toBe(false);

    const fullPack = fresh(['pocketToolkit']);
    let fullReward = act(enterDecision(fullPack), 'takeOneFromCache');
    fullReward = act(fullReward, 'takeTravelRope');
    let fullPending = openRewardResolution(fullReward);
    expect(fullPending.run?.rewardPendingItems).toContain('travelRope');
    fullPending = placeReward(fullPending, 'travelRope', 'carry');
    expect(fullPending.run?.rewardPendingItems).toContain('travelRope');
    fullPending = placeReward(fullPending, 'travelRope', 'bank');
    expect(fullPending.bank).toContain('travelRope');
  });

  it('has no direct-action high-severity ending warnings and records library similarity for human review', () => {
    const quality = auditContentQuality(FRONTIER_DISCOVERY_ADVENTURES);
    expect(quality.warnings.filter(({ severity }) => severity === 'HIGH')).toEqual([]);
    const audit = analyzeScenarioLibrary(FRONTIER_DISCOVERY_ADVENTURES);
    expect(audit.total).toBe(40);
    expect(audit.rows.every(({ metadata }) => Boolean(metadata.distinctiveHook))).toBe(true);
  });

  it('keeps the enlarged exploration family inside the shared category and repeat-balancing selector', () => {
    let seed = 20261002;
    const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    const simulation = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 6 }, 1000, random);
    expect(Math.max(...Object.values(simulation.categoryCounts))).toBeLessThan(1000 * 0.45);
    expect(simulation.scenarioCounts['the-cache-under-the-stove']).toBeLessThan(30);
    expect(simulation.seasonalCount).toBeLessThan(1000);
  });
});
