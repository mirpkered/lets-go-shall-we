import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { analyzeScenarioLibrary } from '../scenarioDiversity';
import { renderQaPanel } from '../qaPanel';
import { EMPTY_SAVE } from '../storage';
import { SCENARIOS } from './index';
import { WEEKLY_NOVEMBER_ADVENTURES } from './weeklyNovemberBatch';
import type { SaveData, Scenario } from '../types';

function start(scenario: Scenario, carriedItem: string | null = null): SaveData {
  const character = newCharacter('November Batch Tester');
  character.carriedItem = carriedItem;
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function advance(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${sceneId}.${choiceId} is available`).toBe(true);
  return choose(state, scenario, choice!, () => 0);
}

function exploreEveryRoute(scenario: Scenario, carriedItem: string | null = null): void {
  const queue = [start(scenario, carriedItem)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.inventory, run.flags, run.visitedSceneIds, state.character?.money, state.character?.historyFlags, state.character?.lore]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.id}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.id}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.id}.${scene.id} fits the four-choice screen`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      const next = choose(state, scenario, choice, () => 0);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.id}.${scene.id}.${choice.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(seen.size).toBeLessThan(10_000);
  }
}

const byId = (id: string) => WEEKLY_NOVEMBER_ADVENTURES.find((scenario) => scenario.id === id)!;

describe('weekly November Adventure batch', () => {
  it('adds 20 distinct year-round Adventures without changing Gear or stable Knowledge catalogs', () => {
    expect(WEEKLY_NOVEMBER_ADVENTURES).toHaveLength(20);
    expect(new Set(WEEKLY_NOVEMBER_ADVENTURES.map(({ id }) => id)).size).toBe(20);
    expect(new Set(WEEKLY_NOVEMBER_ADVENTURES.map(({ title }) => title)).size).toBe(20);
    expect(WEEKLY_NOVEMBER_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(SCENARIOS).toHaveLength(901);
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(Object.keys(KNOWLEDGE_FACTS)).toHaveLength(32);
    expect(WEEKLY_NOVEMBER_ADVENTURES.some(({ scenes }) => Object.values(scenes).some(({ choices }) => choices.some(({ effects }) => effects?.gainItems?.length || effects?.gainSupplies || effects?.knowledge?.length || effects?.knowledgeEntries?.length)))).toBe(false);
    const continuityStories = WEEKLY_NOVEMBER_ADVENTURES.filter(({ scenes }) => Object.values(scenes).some(({ choices }) => choices.some(({ effects }) => Boolean(effects && (effects.money !== undefined || effects.loseMoney || effects.historyFlags?.length || effects.lore?.length || effects.knowledge?.length || effects.knowledgeEntries?.length || effects.gainContacts?.length || effects.gainFavors?.length || effects.gainItems?.length || effects.gainSupplies || effects.addItemUpgrades?.length || effects.repairItems?.length || effects.replaceItems?.length || effects.gainOwnedAssets?.length)))));
    expect(continuityStories).toHaveLength(14);
  });

  it('has valid reachable graphs, bounded screens, and QA launch entries', () => {
    const qa = renderQaPanel(true, structuredClone(EMPTY_SAVE), SCENARIOS, ITEMS);
    for (const scenario of WEEKLY_NOVEMBER_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        if (!scene.ending) expect(scene.choices.length, `${scenario.id}.${scene.id}`).toBeGreaterThan(0);
        expect(scene.text.length, `${scenario.id}.${scene.id} text`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${scenario.id}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
      }
      expect(qa).toContain(`data-qa-start="${scenario.id}"`);
      exploreEveryRoute(scenario);
    }
  });

  it('keeps carried-tool options optional and within their stated capability', () => {
    const toolScenarios: [string, string][] = [
      ['the-slipway-at-low-water', 'boatHook'],
      ['the-towline-at-bent-post', 'boatHook'],
      ['the-net-floats-behind-the-breakwater', 'boatHook'],
      ['the-spring-below-the-ridge', 'collapsibleSoundingRod'],
      ['the-knife-grinders-sunday-wheel', 'carpenterSquare'],
    ];
    for (const [id, item] of toolScenarios) {
      const scenario = byId(id);
      const fresh = start(scenario);
      const gearState = start(scenario, item);
      const optionalChoices = Object.values(scenario.scenes).flatMap((scene) => scene.choices).filter(({ requirements }) => requirements?.usableGear?.includes(item));
      expect(optionalChoices.length, `${id} offers ${item}`).toBeGreaterThan(0);
      for (const choice of optionalChoices) {
        expect(meets(choice.requirements, fresh)).toBe(false);
        expect(meets(choice.requirements, gearState)).toBe(true);
      }
      exploreEveryRoute(scenario, item);
    }
  });

  it('keeps route outcomes and payment tied to explicit choices', () => {
    const slipway = byId('the-slipway-at-low-water');
    let state = start(slipway);
    for (const [scene, choice] of [['ramp', 'askJorin'], ['cargo', 'unloadSmallCargo'], ['work', 'acceptWage']] as const) state = advance(state, slipway, scene, choice);
    expect(state.character?.money).toBe(2);
    expect(state.character?.historyFlags).toContain('helped_unload_slipway_cargo_at_low_water');

    const salt = byId('the-salt-grass-after-the-surge');
    state = start(salt);
    for (const [scene, choice] of [['flats', 'checkChannels'], ['outlet', 'workDryRidge'], ['sorted', 'offerSmallLot']] as const) state = advance(state, salt, scene, choice);
    expect(state.character?.money).toBe(2);
    expect(state.character?.historyFlags).toContain('sold_separate_dry_salt_lot_after_surge');

    const net = byId('the-net-floats-behind-the-breakwater');
    state = start(net);
    for (const [scene, choice] of [['harbor', 'watchFloat'], ['surge', 'leaveNet']] as const) state = advance(state, net, scene, choice);
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toEqual([]);

    const dispatch = byId('the-coachs-unclaimed-dispatch');
    state = start(dispatch);
    for (const [scene, choice] of [['stop', 'inspectCover'], ['marks', 'checkBook'], ['proof', 'entrustBram']] as const) state = advance(state, dispatch, scene, choice);
    expect(state.character?.historyFlags).toContain('returned_east_road_dispatch_to_recorded_carrier');

    state = start(dispatch);
    state = advance(state, dispatch, 'stop', 'holdPacket');
    expect(state.character?.historyFlags).not.toContain('returned_east_road_dispatch_to_recorded_carrier');

    const marketQueue = byId('the-queue-at-market-cross');
    state = start(marketQueue);
    for (const [scene, choice] of [['market', 'askCarriers'], ['carriers', 'moveBenchFirst'], ['layout', 'acceptPay']] as const) state = advance(state, marketQueue, scene, choice);
    expect(state.character?.money).toBe(2);
    expect(state.character?.historyFlags).toContain('marked_market_repair_queue_clear_of_public_pump');

    state = start(marketQueue);
    for (const [scene, choice] of [['market', 'askRen'], ['customers', 'closeForTurn']] as const) state = advance(state, marketQueue, scene, choice);
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).not.toContain('marked_market_repair_queue_clear_of_public_pump');
  });

  it('reports diversity warnings for manual classification without treating counts as defects', () => {
    const audit = analyzeScenarioLibrary(WEEKLY_NOVEMBER_ADVENTURES);
    expect(audit.classified).toBe(20);
    expect(audit.total).toBe(20);
    expect(audit.similarityWarnings).toEqual(expect.any(Array));
    expect(audit.structuralWarnings).toEqual(expect.any(Array));
  });
});
