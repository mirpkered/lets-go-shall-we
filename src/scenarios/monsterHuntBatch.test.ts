import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { inventoryClass, ITEMS } from '../items';
import { scenarioRiskTier } from '../riskClassification';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { eligibleScenarioResult, simulateScenarioSelection } from '../scenarioSelection';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { EMPTY_SAVE, loadSave } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { MONSTER_HUNT_FIRST } from './monsterHuntFirst';
import { MONSTER_HUNT_SECOND } from './monsterHuntSecond';
import { MONSTER_HUNT_THIRD } from './monsterHuntThird';

const MONSTER_HUNT_ADVENTURES = [...MONSTER_HUNT_FIRST, ...MONSTER_HUNT_SECOND, ...MONSTER_HUNT_THIRD];

function fresh(scenario: Scenario, item?: string): SaveData {
  const character = newCharacter('Monster Hunt Tester');
  if (item) character.carriedItems = [item];
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function take(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId} exists`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

function explore(scenario: Scenario, item?: string): void {
  const queue = [fresh(scenario, item)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.randomSelections, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId} exists`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the 2x2 grid`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance || choice.effects?.combat ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        const visited = next.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size, `${scenario.title}.${choice.id} never revisits a scene`).toBe(visited.length);
        queue.push(next);
      }
    }
    expect(seen.size, `${scenario.title} branch state count remains bounded`).toBeLessThan(2500);
  }
}

describe('Monster Hunt / Creature Threat batch', () => {
  it('registers 29 distinct adventures with valid metadata, graph targets, and concise mobile actions', () => {
    expect(MONSTER_HUNT_ADVENTURES).toHaveLength(29);
    expect(SCENARIOS).toHaveLength(709);
    expect(new Set(MONSTER_HUNT_ADVENTURES.map(({ id }) => id)).size).toBe(29);
    expect(MONSTER_HUNT_ADVENTURES.every((scenario) => SCENARIOS.includes(scenario))).toBe(true);
    expect(validateScenarioMetadata(MONSTER_HUNT_ADVENTURES)).toEqual([]);
    for (const scenario of MONSTER_HUNT_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      expect(scenarioRiskTier(scenario), scenario.title).toBe(scenario.diversity?.riskTier);
      for (const scene of Object.values(scenario.scenes)) {
        expect(scene.text.length, `${scenario.title}.${scene.id} text`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          const requirements = choice.requirements;
          const requiredItems = [
            ...(requirements?.items ?? []), ...(requirements?.usableItems ?? []), ...(requirements?.notUsableItems ?? []),
            ...(requirements?.anyUsableItems ?? []), ...(requirements?.gear ?? []), ...(requirements?.usableGear ?? []),
            ...(requirements?.relics ?? []), ...(requirements?.temporaryEquipment ?? []), ...(requirements?.notItems ?? []),
            ...(requirements?.anyItems ?? []), ...Object.keys(requirements?.itemConditions ?? {}), ...Object.keys(requirements?.itemUpgrades ?? {}),
            ...Object.keys(requirements?.gearUpgrades ?? {}), ...Object.keys(requirements?.supplies ?? {}), ...Object.keys(requirements?.canAddSupplies ?? {}),
          ];
          for (const itemId of requiredItems) {
            expect(ITEMS[itemId], `${scenario.title} uses known item ${itemId}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores fresh-character routes through both outcomes of every risky choice without dead ends or revisits', () => {
    for (const scenario of MONSTER_HUNT_ADVENTURES) explore(scenario);
  });

  it('keeps optional gear helpful without making it a fresh-character gate', () => {
    for (const scenario of MONSTER_HUNT_ADVENTURES) {
      const start = fresh(scenario);
      const opening = scenario.scenes[scenario.startScene];
      expect(opening.choices.some((choice) => meets(choice.requirements, start)), `${scenario.title} starts for a fresh traveler`).toBe(true);
    }
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'the-river-devil')!, 'travelRope');
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'the-lantern-eater')!, 'lantern');
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!, 'conductorWhistle');
  });

  it('makes ordinary curiosity at the ravine survivable, while keeping a warned crossing lethal', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    const curious = take(fresh(scenario), scenario, 'callAgain');
    const stumbled = take(curious, scenario, 'enterRavine', 0.999999);
    expect(stumbled.run?.sceneId).toBe('whistleScramble');
    expect(stumbled.run?.status).toBe('active');
    expect(stumbled.run!.health).toBeGreaterThan(0);
    const encoded = JSON.stringify(stumbled);
    const resumed = loadSave({ getItem: () => encoded });
    expect(resumed.run?.sceneId).toBe('whistleScramble');
    expect(resumed.run?.health).toBe(stumbled.run?.health);
    const retreated = take(resumed, scenario, 'retreatFromBank');
    expect(retreated.run?.sceneId).toBe('whistleRoadRetreat');
    expect(retreated.run?.status).toBe('success');

    const committed = take(curious, scenario, 'enterRavine', 0);
    expect(committed.run?.sceneId).toBe('whistlePattern');
    const crossed = take(committed, scenario, 'crossRavine', 0.999999);
    expect(crossed.run?.sceneId).toBe('whistleFatal');
    expect(crossed.run?.status).toBe('death');
  });

  it('keeps the Miller’s Gap location uncertain until the cat is directly seen', () => {
    const scenario = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-man-eater-of-millers-gap')!;
    const tracks = take(fresh(scenario), scenario, 'askDrover');
    const bend = scenario.scenes.catTracks;
    const enter = bend.choices.find(({ id }) => id === 'enterBend')!;
    expect(enter.hint).toMatch(/tracks lead above the trail/i);
    expect(enter.hint).not.toMatch(/the cat is above/i);
    expect(enter.hint).toMatch(/drop leaves little room to escape/i);

    const marked = take(tracks, scenario, 'markLedge');
    expect(marked.character?.knowledge.join(' ')).toMatch(/tracks and dragged wool .* point toward a ledge/i);
    expect(marked.character?.knowledge.join(' ')).toMatch(/do not show whether the predator is still there/i);

    const sheepMoved = take(fresh(scenario), scenario, 'moveSheep');
    expect(scenario.scenes.sheepMoved.text).toMatch(/nothing shows whether the cat stayed there/i);
    const slipped = take(sheepMoved, scenario, 'followCatLedge', 0.999999);
    expect(slipped.run?.sceneId).toBe('catFall');
    expect(scenario.scenes.catFall.text).toMatch(/cat’s location remains unknown/i);
    expect(scenario.scenes.gapAfter.text).toMatch(/cat has not been located/i);

    const directSighting = take(sheepMoved, scenario, 'watchFromRock');
    expect(directSighting.run?.sceneId).toBe('catSeen');
    expect(scenario.scenes.catSeen.text).toMatch(/mountain lion watches from the ledge/i);
    const glassesRoute = take(fresh(scenario, 'fieldGlasses'), scenario, 'moveSheep');
    const glassChoice = scenario.scenes.sheepMoved.choices.find(({ id }) => id === 'watchWithFieldGlasses')!;
    expect(meets(glassChoice.requirements, glassesRoute)).toBe(true);
    expect(take(glassesRoute, scenario, glassChoice.id).run?.sceneId).toBe('catSeenAtDistance');
    expect(meets(glassChoice.requirements, sheepMoved)).toBe(false);
    expect(scenario.scenes.catSeenAtDistance.text).toMatch(/has not noticed you on the broad upper rock/i);
  });

  it('keeps road-side observation available without entering the unstable ravine', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    const observed = take(take(fresh(scenario), scenario, 'callAgain'), scenario, 'stopSignals');
    expect(observed.run?.sceneId).toBe('whistleSafe');
    expect(observed.run?.status).toBe('success');
    expect(observed.run!.health).toBeGreaterThan(0);
  });

  it('makes the house route in A Road Kept Straight an investigation before its stopping choice', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    let state = take(fresh(scenario, 'conductorWhistle'), scenario, 'callAgain');
    state = take(state, scenario, 'useWhistleOnce');
    state = take(state, scenario, 'leaveFenceLine');
    expect(state.run?.sceneId).toBe('whistleHousehold');
    expect(scenario.scenes.whistleHousehold.text).toMatch(/household confirms hearing the same changed note/i);
    expect(scenario.scenes.whistleHousehold.choices.map(({ label }) => label)).toEqual([
      'Help close the path until morning', 'Keep watch from the house-side fence',
    ]);
    expect(take(state, scenario, 'keepWatchFromHouse').run?.sceneId).toBe('whistleHouseWatch');
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
  });

  it('varies creature truth, risk, and combat rather than making every hunt a kill', () => {
    const densities = new Set(MONSTER_HUNT_ADVENTURES.map(({ diversity }) => diversity?.fantasyDensity));
    const combat = new Set(MONSTER_HUNT_ADVENTURES.map(({ diversity }) => diversity?.combat));
    const risk = MONSTER_HUNT_ADVENTURES.reduce<Record<string, number>>((counts, scenario) => {
      const tier = scenarioRiskTier(scenario);
      counts[tier] = (counts[tier] ?? 0) + 1;
      return counts;
    }, {});
    expect(densities.size).toBeGreaterThanOrEqual(5);
    expect(combat.has('NONE')).toBe(true);
    expect(combat.has('AVOIDABLE')).toBe(true);
    expect(combat.has('POSSIBLE')).toBe(true);
    expect(risk).toEqual({ SEVERE: 7, HIGH: 12, MODERATE: 9, LOW: 1 });
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.ending === 'death'))).toBe(true);
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.ending === 'success' && /retreat|leave|close|withdraw|wait/i.test(scene.title)))).toBe(true);
    expect(MONSTER_HUNT_ADVENTURES.flatMap((scenario) => Object.values(scenario.scenes)).flatMap((scene) => scene.choices)
      .flatMap((choice) => choice.effects?.gainItems ?? []).filter((id) => /tooth|claw|horn|hide|bone|skull|fang/i.test(ITEMS[id]?.name ?? id))).toEqual([]);
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) => choice.effects?.combat)))).toBe(true);
    expect(inventoryClass('travelRope')).toBe('GEAR');
  });

  it('keeps season eligibility and weighted selection integrated with recent-exclusion simulation', () => {
    const october = eligibleScenarioResult(MONSTER_HUNT_ADVENTURES, [], 10).scenarios;
    expect(october).not.toContain(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-beneath-the-ice'));
    expect(october).toContain(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'something-in-the-corn'));
    const recent = ['thing-at-black-creek'];
    expect(eligibleScenarioResult(MONSTER_HUNT_ADVENTURES, recent, 10).scenarios.map(({ id }) => id)).not.toContain('thing-at-black-creek');
    const result = simulateScenarioSelection(MONSTER_HUNT_ADVENTURES, recent, { selectionMonth: 10 }, 1000, (() => {
      let seed = 9137;
      return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646;
    })());
    expect(result.draws).toBe(1000);
    expect(Object.values(result.scenarioCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(Object.values(result.riskCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(result.seasonalCount).toBeGreaterThan(0);
    expect(result.recentFallbackCount).toBe(0);
  }, 15_000);
});
