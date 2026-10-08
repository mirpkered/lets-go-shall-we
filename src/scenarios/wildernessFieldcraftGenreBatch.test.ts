import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemState, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { eligibleScenarios } from '../scenarioSelection';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { WILDERNESS_FIELDCRAFT_GENRE_BATCH } from './wildernessFieldcraftGenreBatch';
import type { SaveData, Scenario } from '../types';

function begin(scenario: Scenario): SaveData {
  const character = newCharacter('Field Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, id: string, random = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

describe('Gear Expansion Genre Batch 7 — Wilderness Work / Fieldcraft', () => {
  it('registers 24 unique Adventures, retains normal seasonal eligibility, and validates every destination', () => {
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(WILDERNESS_FIELDCRAFT_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(validateScenarioRegistry(WILDERNESS_FIELDCRAFT_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE').map(({ id }) => id).sort()).toEqual(['the-bear-at-the-berry-ridge', 'the-knife-in-the-grass']);
    const spring = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-alder-crossing')!;
    const winter = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-cold-rope-at-dawn')!;
    expect(eligibleScenarios([spring, winter], [], 4).map(({ id }) => id)).toEqual([spring.id]);
    expect(eligibleScenarios([spring, winter], [], 1).map(({ id }) => id)).toEqual([winter.id]);
    expect(eligibleScenarios([spring, winter], [], 7)).toEqual([]);
  });

  it('gives every story a real continuity opportunity and at least 18 stories a persistent Gear route', () => {
    let gearSources = 0;
    for (const scenario of WILDERNESS_FIELDCRAFT_GENRE_BATCH) {
      const choices = Object.values(scenario.scenes).flatMap(({ choices: entries }) => entries);
      const effects = choices.flatMap(({ effects: direct, chance }) => [direct, chance?.successEffects, chance?.failureEffects]).filter(Boolean);
      const hasContinuity = effects.some((effect) => (effect?.money ?? 0) > 0 || !!effect?.knowledge?.length || !!effect?.knowledgeEntries?.length || !!effect?.lore?.length || (effect?.gainItems ?? []).some((id) => ITEMS[id]?.carryable && ITEMS[id]?.inventoryClass === 'GEAR'));
      expect(hasContinuity, scenario.id).toBe(true);
      const gearChoices = choices.filter(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR' && ITEMS[id]?.carryable));
      if (gearChoices.length) gearSources++;
      for (const choice of gearChoices) {
        const id = choice.effects!.gainItems!.find((itemId) => ITEMS[itemId]?.inventoryClass === 'GEAR')!;
        expect(choice.effects?.gainItemProvenance?.[id], `${scenario.id}.${choice.id}`).toBeTruthy();
        const state = begin(scenario);
        state.run!.sceneId = Object.keys(scenario.scenes).find((sceneId) => scenario.scenes[sceneId].choices.some(({ id: choiceId }) => choiceId === choice.id))!;
        const acquired = act(state, scenario, choice.id);
        expect(acquired.run?.inventory, `${scenario.id}.${choice.id}`).toContain(id);
      }
    }
    expect(gearSources).toBeGreaterThanOrEqual(18);
  });

  it('has a complete, acyclic and normally reachable graph for every Adventure', () => {
    for (const scenario of WILDERNESS_FIELDCRAFT_GENRE_BATCH) {
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id)) continue;
        reached.add(id);
        const scene = scenario.scenes[id];
        expect(scene, `${scenario.id}.${id} exists`).toBeDefined();
        for (const choice of scene.choices) {
          const combat = choice.effects?.combat;
          for (const destination of choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next, combat?.winNext, combat?.lossNext]) {
            if (destination) pending.push(destination);
          }
        }
      }
      expect(reached.size, scenario.id).toBe(Object.keys(scenario.scenes).length);
      const visiting = new Set<string>();
      const visited = new Set<string>();
      const visit = (id: string) => {
        if (visiting.has(id)) throw new Error(`${scenario.id} contains a cycle at ${id}`);
        if (visited.has(id)) return;
        visiting.add(id);
        for (const choice of scenario.scenes[id].choices) {
          const combat = choice.effects?.combat;
          for (const destination of choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next, combat?.winNext, combat?.lossNext]) if (destination) visit(destination);
        }
        visiting.delete(id);
        visited.add(id);
      };
      visit(scenario.startScene);
    }
  });

  it('acquires the Folding Field Spade through an explicit release and preserves it through save/resume', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-camp-below-the-cut')!;
    expect(ITEMS.foldingFieldSpade?.inventoryClass).toBe('GEAR');
    let state = begin(scenario);
    state.run!.sceneId = 'result';
    state = act(state, scenario, 'takeSpade');
    expect(state.run?.inventory).toContain('foldingFieldSpade');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldSpade');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.run?.scenarioId).toBe(scenario.id);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldSpade');
    state = finishRewardResolution(placeReward(state, 'foldingFieldSpade', 'carry'));
    expect(getCarriedItems(state.character)).toContain('foldingFieldSpade');
    expect(itemState(state, 'foldingFieldSpade').provenance.join(' ')).toContain('Released by foreman Eda');
  });

  it('records the camp runoff as another source of the existing water-path lesson without tying it to compensation', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-camp-below-the-cut')!;
    const fact = KNOWLEDGE_FACTS.waterPathBeforeWall;
    let state = begin(scenario);
    state = act(state, scenario, 'readSlope');
    state = act(state, scenario, 'divertWide');
    expect(state.character?.knowledgeKeys).toContain(fact.id);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);
    expect(state.character?.knowledge).toContain(fact.text);

    // Reaching the same learning point again does not duplicate the stable fact or its source.
    state = begin(scenario);
    state.character!.knowledgeKeys = [fact.id];
    state.character!.knowledge = [fact.text];
    state.character!.knowledgeSources = { [fact.id]: [scenario.id] };
    state = act(state, scenario, 'readSlope');
    state = act(state, scenario, 'divertWide');
    expect(state.character?.knowledgeKeys?.filter((id) => id === fact.id)).toHaveLength(1);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);

    const result = begin(scenario);
    result.run!.sceneId = 'result';
    for (const choiceId of ['takeCoins', 'declinePayment']) {
      const outcome = act(result, scenario, choiceId);
      expect(outcome.character?.knowledgeKeys).toContain(fact.id);
      expect(outcome.character?.knowledgeSources?.[fact.id]).toContain(scenario.id);
    }
  });

  it('uses owned field spade only for limited shallow drainage, not as an automatic crossing solution', () => {
    for (const [scenarioId, sceneId, choiceId] of [
      ['a-footing-in-the-fen', 'stake', 'drainEdge'],
      ['the-storm-cut-camp', 'marks', 'clearDrain'],
    ]) {
      const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
      const state = begin(scenario);
      if (scenarioId === 'the-storm-cut-camp') state.run!.sceneId = 'marks';
      state.run!.inventory.push('foldingFieldSpade');
      const next = act(state, scenario, choiceId);
      expect(next.character?.historyFlags).toContain(choiceId === 'drainEdge' ? 'used_folding_field_spade_fen_edge' : 'used_folding_field_spade_storm_channel');
      expect(next.run?.sceneId).not.toMatch(/success|complete/i);
    }
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-storm-cut-camp')!;
    const withoutSpade = begin(scenario);
    withoutSpade.run!.sceneId = 'marks';
    expect(meets(scenario.scenes.marks.choices.find(({ id }) => id === 'clearDrain')?.requirements, withoutSpade)).toBe(false);
  });

  it('keeps dangerous wildlife and human threats avoidable, with the snare confrontation honestly signposted', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-knife-in-the-grass')!;
    const start = begin(scenario);
    expect(scenario.scenes.anchor.text).toMatch(/demands that you leave/i);
    expect(scenario.scenes.snare.choices.some(({ id }) => id === 'backAway')).toBe(true);
    let result = act(start, scenario, 'inspectLoop');
    result = act(result, scenario, 'talkDown');
    expect(result.run?.sceneId).toBe('withdrawn');
    expect(result.run?.status).not.toBe('death');
    const bear = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-bear-at-the-berry-ridge')!;
    result = act(begin(bear), bear, 'callHandBack');
    result = act(result, bear, 'leavePatch');
    expect(result.run?.sceneId).toBe('safe');
    expect(result.run?.status).not.toBe('death');
  });

  it('turns the ridge echo into a safe, consequential follow-up instead of an immediate ending', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-ridge-listener')!;
    let state = act(begin(scenario), scenario, 'enterGully');
    expect(state.run?.sceneId).toBe('gully');
    expect(scenario.scenes.gully.ending).toBeUndefined();
    expect(scenario.scenes.gully.choices.map(({ id }) => id)).toEqual(['answerFromRidge', 'markLastBearing']);
    state = act(state, scenario, 'answerFromRidge');
    expect(state.run?.sceneId).toBe('answer');
    state = act(state, scenario, 'keepSpacing');
    expect(state.run?.sceneId).toBe('person');
    state = act(state, scenario, 'walkSlow');
    expect(state.run?.sceneId).toBe('rescue');
  });
});
