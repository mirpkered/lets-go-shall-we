import { describe, expect, it } from 'vitest';
import { choose, failCharacter, finishSuccess, meets, newCharacter, retireCharacter, startAdventure, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS, WHATS_MINE } from './index';
import type { SaveData } from '../types';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Test Traveler');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, WHATS_MINE) };
}

function pick(state: SaveData, choiceId: string, random = () => 0): SaveData {
  const sceneId = state.run!.sceneId;
  const choice = WHATS_MINE.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  if (!choice) throw new Error(`Missing action ${sceneId}.${choiceId}`);
  if (!meets(choice.requirements, state)) throw new Error(`Unavailable action ${sceneId}.${choiceId}`);
  return choose(state, WHATS_MINE, choice, random);
}

function reachEli(state: SaveData): SaveData {
  state = pick(state, 'acceptSearch');
  state = pick(state, 'enterWithoutPurchase');
  state = pick(state, 'followRailDrift');
  state = pick(state, 'duckUnderShelf');
  state = pick(state, 'followScrape');
  return pick(state, 'followMetalTaps');
}

describe('What’s Mine is Mine', () => {
  it('makes refusal a clean ending with no reward and records the choice on this character', () => {
    const state = fresh(7);
    const originalInventory = [...state.run!.inventory];
    const next = pick(state, 'refuseSearch');
    expect(next.run?.sceneId).toBe('refusalEnding');
    expect(next.run?.status).toBe('success');
    expect(next.run?.inventory).toEqual(originalInventory);
    expect(next.run?.acquiredThisRun).toEqual([]);
    expect(next.character?.money).toBe(7);
    expect(next.character?.historyFlags).toContain('refused_mine_rescue');
    expect(WHATS_MINE.scenes.refusalEnding.text).not.toMatch(/reward|compensation/i);
  });

  it('persists behavior history across successful adventures and drops it on death or retirement', () => {
    let state = pick(fresh(), 'refuseSearch');
    state = finishSuccess(state, null);
    expect(state.character?.historyFlags).toContain('refused_mine_rescue');
    const next = startAdventure(state, SCENARIOS[0]);
    expect(next.character?.historyFlags).toContain('refused_mine_rescue');
    expect(meets({ historyFlags: ['refused_mine_rescue'] }, next)).toBe(true);
    const doomed = fresh();
    doomed.run!.health = 1;
    let dead = pick(doomed, 'acceptSearch');
    dead = pick(dead, 'enterWithoutPurchase');
    dead = pick(dead, 'climbBentLadder', () => 0.99);
    expect(dead.run?.status).toBe('death');
    expect(failCharacter({ ...dead, character: { ...dead.character!, historyFlags: ['refused_mine_rescue'] } }).character).toBeNull();
    const retired = retireCharacter({ ...next, bank: ['graveCoin'] });
    expect(retired.character).toBeNull();
    expect(retired.run).toBeNull();
    expect(retired.bank).toEqual(['graveCoin']);
  });

  it('supports a fresh-character winch rescue without money or carry-over gear', () => {
    let state = reachEli(fresh());
    expect(state.run?.sceneId).toBe('trappedEli');
    state = pick(state, 'workWinch', () => 0);
    expect(state.run?.sceneId).toBe('thanksClean');
    expect(state.character?.historyFlags).toContain('rescued_missing_person');
    expect(state.character?.historyFlags).toContain('kept_rescue_promise');
    state = pick(state, 'declineReward');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('cleanRescueEnding');
    expect(state.run?.inventory).not.toContain('minerHeadlamp');
    expect(state.run?.inventory).not.toContain('foremanMultiTool');
  });

  it('supports a distinct rope extraction with a carried rope', () => {
    let state = reachEli(fresh(0, 'travelRope'));
    expect(WHATS_MINE.scenes.trappedEli.choices.filter((choice) => meets(choice.requirements, state)).map((entry) => entry.id)).toContain('rigRope');
    state = pick(state, 'rigRope', () => 0);
    expect(state.run?.sceneId).toBe('thanksCostly');
    state = pick(state, 'takeMultiToolReward');
    expect(state.run?.inventory).toContain('foremanMultiTool');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyRescueEnding');
  });

  it('lets a carried toolkit improve the winch odds without being required', () => {
    const state = reachEli(fresh(0, 'pocketToolkit'));
    const winch = WHATS_MINE.scenes.trappedEli.choices.find((choice) => choice.id === 'workWinch')!;
    expect(winch.chance?.probability).toBe(0.46);
    expect(winch.chance?.bonusItems).toContain('pocketToolkit');
    expect(pick(state, 'workWinch', () => 0.6).run?.sceneId).toBe('thanksClean');
  });

  it('makes the purchased map and its knowledge unlock a later safer route', () => {
    let state = pick(fresh(2), 'acceptSearch');
    state = pick(state, 'buyMap');
    expect(state.run?.inventory).toContain('mineSurveyMap');
    expect(state.character?.knowledge).toContain('The old survey map marks a side drift that reaches the lower workings above the flooded rail bed.');
    expect(WHATS_MINE.scenes.mineMouth.choices.filter((choice) => meets(choice.requirements, state)).map((choice) => choice.id)).toContain('takeMappedDrift');
  });

  it('allows an outside-help rescue and records the return with a crew', () => {
    let state = reachEli(fresh());
    state = pick(state, 'bringHelp');
    expect(state.run?.sceneId).toBe('outsideForHelp');
    state = pick(state, 'guideWithoutMap', () => 0);
    expect(state.run?.sceneId).toBe('thanksHelp');
    expect(state.character?.historyFlags).toContain('returned_for_help');
    expect(state.character?.historyFlags).toContain('rescued_missing_person');
    state = pick(state, 'takeHeadlampReward');
    expect(state.run?.sceneId).toBe('helpRescueEnding');
  });

  it('foreshadows the ladder hazard and advances a failed attempt with injury', () => {
    let state = pick(fresh(), 'acceptSearch');
    state = pick(state, 'enterWithoutPurchase');
    state = pick(state, 'climbBentLadder', () => 0.99);
    expect(state.run?.sceneId).toBe('ladderFall');
    expect(state.run?.health).toBe(8);
    expect(state.run?.visitedSceneIds).toContain('ladderFall');
  });

  it('records the silver temptation and changes the rescue situation', () => {
    let state = fresh();
    state = pick(state, 'acceptSearch');
    state = pick(state, 'enterWithoutPurchase');
    state = pick(state, 'followRailDrift');
    state = pick(state, 'duckUnderShelf');
    state = pick(state, 'inspectSilverVein');
    state = pick(state, 'takeSilverSample');
    expect(state.character?.money).toBe(5);
    expect(state.character?.historyFlags).toContain('chose_silver_over_rescue');
    expect(state.run?.flags).toContain('personWeakened');
    state = pick(state, 'hurryAfterSilver');
    state = pick(state, 'pressOnAfterShift');
    expect(state.run?.sceneId).toBe('trappedEliDelayed');
    const winch = WHATS_MINE.scenes.trappedEliDelayed.choices.find((choice) => choice.id === 'workWinch')!;
    expect(winch.chance?.probability).toBeLessThan(WHATS_MINE.scenes.trappedEli.choices.find((choice) => choice.id === 'workWinch')?.chance?.probability ?? 1);
  });

  it('offers a difficult late tradeoff and supports the profit-first outcome', () => {
    let state = fresh();
    state = pick(state, 'acceptSearch');
    state = pick(state, 'enterWithoutPurchase');
    state = pick(state, 'followRailDrift');
    state = pick(state, 'duckUnderShelf');
    state = pick(state, 'inspectSilverVein');
    state = pick(state, 'takeSilverSample');
    state = pick(state, 'hurryAfterSilver');
    state = pick(state, 'pressOnAfterShift');
    state = pick(state, 'workWinch', () => 0.99);
    state = pick(state, 'takeSilverAndLeave', () => 0);
    expect(state.run?.sceneId).toBe('profitEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(13);
    expect(state.character?.historyFlags).toContain('abandoned_injured_person');
    expect(WHATS_MINE.scenes.rescueCollapse.choices.map((choice) => choice.label)).toContain('Get out and bring the rescue crew');
    expect(WHATS_MINE.scenes.rescueCollapse.choices.map((choice) => choice.label)).toContain('Make one last pull on the beam');
  });

  it('provides a difficult-choice branch to leave or rescue after a failed extraction', () => {
    let state = reachEli(fresh());
    state = pick(state, 'workWinch', () => 0.99);
    const choices = WHATS_MINE.scenes.rescueCollapse.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.map((choice) => choice.id)).toEqual(expect.arrayContaining(['leaveForRescueCrew', 'leaveEliBehind', 'lastPull']));
    state = pick(state, 'leaveEliBehind');
    expect(state.run?.sceneId).toBe('abandonedEnding');
    expect(state.character?.historyFlags).toContain('abandoned_injured_person');
  });

  it('requires explicit actions for all important items and prevents duplicate reward choices', () => {
    const purchase = WHATS_MINE.scenes.preparation.choices.find((choice) => choice.id === 'buyRope')!;
    expect(purchase.label).toMatch(/Buy travel rope/);
    expect(purchase.effects?.gainItems).toEqual(['travelRope']);
    const reward = WHATS_MINE.scenes.thanksClean.choices.find((choice) => choice.id === 'takeHeadlampReward')!;
    expect(reward.label).toContain('Accept Eli’s spare miner headlamp');
    let state = fresh(4);
    state = pick(state, 'acceptSearch');
    state = pick(state, 'buyHeadlamp');
    expect(state.run?.inventory).toContain('minerHeadlamp');
    const alreadyHasLamp = { ...state, run: { ...state.run!, sceneId: 'thanksClean' } };
    expect(WHATS_MINE.scenes.thanksClean.choices.filter((choice) => meets(choice.requirements, alreadyHasLamp)).map((choice) => choice.id)).not.toContain('takeHeadlampReward');
    expect(ITEMS.minerHeadlamp.carryable).toBe(true);
    expect(ITEMS.foremanMultiTool.carryable).toBe(true);
    const alreadyHasMap = fresh(2);
    alreadyHasMap.run!.inventory.push('mineSurveyMap');
    expect(WHATS_MINE.scenes.preparation.choices.filter((choice) => meets(choice.requirements, alreadyHasMap)).map((choice) => choice.id)).not.toContain('buyMap');
  });

  it('validates this adventure as a forward-only graph with reachable actions', () => {
    expect(findScenarioGraphProblems(WHATS_MINE)).toEqual([]);
    for (const scene of Object.values(WHATS_MINE.scenes)) expect(scene.choices.length).toBeLessThanOrEqual(4);
    const character = newCharacter('Graph walker');
    const initial: SaveData = { version: 1, bank: [], character, run: startRun(character, WHATS_MINE) };
    const queue = [initial];
    const seen = new Set<string>();
    const deadEnds: string[] = [];
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), history: [...(state.character?.historyFlags ?? [])].sort(), knowledge: [...(state.character?.knowledge ?? [])].sort(), money: state.character?.money, health: run.health });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = WHATS_MINE.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const actions = scene.choices.filter((choice) => meets(choice.requirements, state));
      if (!actions.length) deadEnds.push(run.sceneId);
      for (const action of actions) {
        const outcomes = [choose(state, WHATS_MINE, action, () => 0)];
        if (action.chance || action.effects?.combat) outcomes.push(choose(state, WHATS_MINE, action, () => 0.999999));
        for (const outcome of outcomes) {
          const visits = outcome.run?.visitedSceneIds ?? [];
          expect(new Set(visits).size).toBe(visits.length);
          if (outcome.run) expect(visits).toContain(outcome.run.sceneId);
          queue.push(outcome);
        }
      }
    }
    expect(deadEnds).toEqual([]);
    expect(seen.size).toBeGreaterThan(20);
  });

  it('registers for random selection, repeat avoidance, and direct QA start', () => {
    expect(SCENARIOS).toContain(WHATS_MINE);
    expect(selectScenario(SCENARIOS, null, () => 0.999)).toBe(WHATS_MINE);
    expect(selectScenario(SCENARIOS, WHATS_MINE.id, () => 0.999)).not.toBe(WHATS_MINE);
    const state = startAdventure({ version: 1, bank: [], character: null, run: null }, WHATS_MINE);
    expect(state.run?.scenarioId).toBe(WHATS_MINE.id);
    expect(state.run?.sceneId).toBe('mineRequest');
  });

  it('keeps unique scene visits when resuming a serialized run', () => {
    let state = reachEli(fresh());
    state = pick(state, 'bringHelp');
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    resumed.run!.sceneId = 'outsideForHelp';
    expect(pick(resumed, 'guideWithoutMap', () => 0).run?.sceneId).toBe('thanksHelp');
    expect(new Set(resumed.run?.visitedSceneIds).size).toBe(resumed.run?.visitedSceneIds?.length);
  });
});
