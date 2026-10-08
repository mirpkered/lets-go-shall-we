import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, meets, newCharacter, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE } from '../storage';
import type { SaveData, Scenario } from '../types';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { HONEST_WORK_ADVENTURES } from './honestWorkBatch';

function start(scenario: Scenario, shift: string, item?: string): SaveData {
  const character = newCharacter('Work Tester');
  if (item) character.carriedItem = item;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  state.run!.randomSelections = { ...state.run!.randomSelections, shift };
  return state;
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function walkAll(scenario: Scenario, shift: string, item?: string): void {
  const queue = [start(scenario, shift, item)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(choices.length, `${scenario.title}.${scene.id} fits the action grid`).toBeLessThanOrEqual(4);
    for (const choice of choices) {
      const rolls = choice.chance || choice.effects?.combat ? [0, 0.999999] : [0];
      for (const roll of rolls) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
        queue.push(next);
      }
    }
  }
}

describe('honest work adventure batch', () => {
  it('registers ten distinct data-driven jobs with valid, forward-only graphs and phone-sized copy', () => {
    expect(HONEST_WORK_ADVENTURES).toHaveLength(10);
    expect(new Set(HONEST_WORK_ADVENTURES.map(({ id }) => id)).size).toBe(10);
    for (const scenario of HONEST_WORK_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      expect(scenario.timePhases?.[0].atMinutes).toBe(0);
      const quietWeight = scenario.runRandomSelections?.[0].values.find(({ value }) => value === 'quiet')?.weight;
      if (scenario.id === 'unload-before-dark') expect(quietWeight).toBe(0);
      else expect(quietWeight).toBeGreaterThan(1);
      const equipment = Object.values(scenario.scenes).flatMap(({ choices }) => choices).find(({ id }) => id === 'useCarriedTool')?.requirements?.items?.[0];
      if (equipment) expect(ITEMS[equipment]?.carryable, `${scenario.title} equipment`).toBe(true);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id} button`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id} hint`).toBeLessThanOrEqual(115);
        }
      }
    }
  });

  it('keeps every randomized active state actionable without revisiting a scene', () => {
    for (const scenario of HONEST_WORK_ADVENTURES) {
      const item = Object.values(scenario.scenes).flatMap(({ choices }) => choices).find(({ id }) => id === 'useCarriedTool')?.requirements?.items?.[0];
      for (const shift of ['quiet', 'complication']) {
        walkAll(scenario, shift);
        if (item) walkAll(scenario, shift, item);
      }
    }
  });

  it('pays for an ordinary shift and records the character’s work history', () => {
    const scenario = HONEST_WORK_ADVENTURES[0];
    let state = act(start(scenario, 'quiet'), scenario, 'hiring', 'beginWork');
    expect(scenario.scenes.work.textVariants?.length).toBeGreaterThan(0);
    state = act(state, scenario, 'work', 'finishQuiet');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(scenario.scenes.ordinaryFinish ? 4 : 0);
    expect(state.character?.historyFlags).toContain('completed_paid_livestock_drive');
    expect(state.character?.knowledge.length).toBeGreaterThan(0);
  });

  it('does not award a task-specific lesson for a generic job-terms question before the work begins', () => {
    const generic = HONEST_WORK_ADVENTURES.find(({ id }) => id === 'fence-line')!;
    let state = act(start(generic, 'quiet'), generic, 'hiring', 'askThenWork');
    expect(state.character?.knowledge).not.toContain('A visible boundary stake can settle a fence-line disagreement before the wire is tightened.');
    state = act(state, generic, 'work', 'finishQuiet');
    expect(state.character?.knowledge).toContain('A visible boundary stake can settle a fence-line disagreement before the wire is tightened.');

    const instructed = HONEST_WORK_ADVENTURES.find(({ id }) => id === 'cutting-timber')!;
    const taught = act(start(instructed, 'quiet'), instructed, 'hiring', 'askThenWork');
    expect(taught.character?.knowledge).toContain('A bound saw should be released by moving the wood from a clear side, not by pulling harder.');
  });

  it('credits short completed timber work and labels the foreman’s predetermined question specifically', () => {
    const scenario = HONEST_WORK_ADVENTURES.find(({ id }) => id === 'cutting-timber')!;
    expect(scenario.scenes.hiring.choices.find(({ id }) => id === 'askThenWork')?.label).toContain('bound saw safely');
    let state = act(start(scenario, 'quiet'), scenario, 'hiring', 'askThenWork');
    state = act(state, scenario, 'work', 'finishQuiet');
    expect(state.run?.sceneId).toBe('timberTally');
    state = act(state, scenario, 'timberTally', 'finishTimberLoad');
    expect(state.run?.completionQualification).toBe('substantive');
    expect(state.character?.money).toBe(4);
    expect(finishSuccess(state, null).character?.adventuresCompleted).toBe(1);
  });

  it('supports a fresh-character resolution, an item-assisted approach, and an imperfect failed check', () => {
    const scenario = HONEST_WORK_ADVENTURES[4];
    let state = act(start(scenario, 'complication'), scenario, 'hiring', 'askThenWork');
    state = act(state, scenario, 'work', 'addressIssue');
    const noGearChoices = scenario.scenes.complication.choices.filter(({ requirements }) => meets(requirements, state));
    expect(noGearChoices.map(({ id }) => id)).toContain('workCarefully');
    expect(noGearChoices.map(({ id }) => id)).not.toContain('useCarriedTool');
    state = act(state, scenario, 'complication', 'workCarefully', () => 0.999999);
    expect(state.run?.sceneId).toBe('imperfectFinish');
    expect(state.run?.status).toBe('success');
    expect(state.run?.health).toBe(9);
    expect(state.character?.historyFlags).toContain('completed_paid_roof_repair_had_setback');

    let equipped = act(start(scenario, 'complication', 'travelRope'), scenario, 'hiring', 'beginWork');
    equipped = act(equipped, scenario, 'work', 'addressIssue');
    equipped = act(equipped, scenario, 'complication', 'useCarriedTool');
    expect(equipped.run?.sceneId).toBe('cleanFinish');
    expect(equipped.character?.historyFlags).toContain('completed_paid_roof_repair_used_gear');
  });

  it('keeps ordinary hired work accessible without personal specialist Gear while offering carried tools as alternatives', () => {
    for (const scenario of HONEST_WORK_ADVENTURES) {
      const itemChoices = scenario.scenes.complication.choices.filter(({ requirements }) => (requirements?.items?.length ?? 0) > 0);
      if (itemChoices.length === 0) continue;

      let fresh = act(start(scenario, 'complication'), scenario, 'hiring', 'beginWork');
      fresh = act(fresh, scenario, 'work', 'addressIssue');
      const freshChoices = scenario.scenes.complication.choices.filter(({ requirements }) => meets(requirements, fresh));
      expect(freshChoices.map(({ id }) => id), `${scenario.title} fresh-worker options`).toContain('workCarefully');
      expect(freshChoices.map(({ id }) => id), `${scenario.title} fresh-worker options`).toContain('askForHelp');
      for (const itemChoice of itemChoices) {
        expect(freshChoices.map(({ id }) => id), `${scenario.title} does not require ${itemChoice.id}`).not.toContain(itemChoice.id);
        const itemId = itemChoice.requirements!.items![0];
        let equipped = act(start(scenario, 'complication', itemId), scenario, 'hiring', 'beginWork');
        equipped = act(equipped, scenario, 'work', 'addressIssue');
        const equippedChoices = scenario.scenes.complication.choices.filter(({ requirements }) => meets(requirements, equipped));
        expect(equippedChoices.map(({ id }) => id), `${scenario.title} with ${itemId}`).toContain(itemChoice.id);
        expect(equippedChoices.map(({ id }) => id), `${scenario.title} with ${itemId}`).toContain('workCarefully');
      }
    }
  });

  it('keeps a night watch quiet on most runs and does not manufacture a crime', () => {
    const scenario = HONEST_WORK_ADVENTURES.find(({ id }) => id === 'night-watch')!;
    expect(scenario.runRandomSelections?.[0].values.find(({ value }) => value === 'quiet')?.weight).toBe(4);
    expect(scenario.scenes.work.textVariants?.[0].text).toContain('no sign of anyone approaching');
    let state = act(start(scenario, 'quiet'), scenario, 'hiring', 'beginWork');
    state = act(state, scenario, 'work', 'finishQuiet');
    expect(state.character?.money).toBeGreaterThan(0);
    expect(state.run?.status).toBe('success');
  });

  it('uses a Field Bandage Roll only when a worker is present and consumes it when applied', () => {
    const scenario = HONEST_WORK_ADVENTURES.find(({ id }) => id === 'harvest-hand')!;
    let state = act(start(scenario, 'complication', 'fieldBandageRoll'), scenario, 'hiring', 'beginWork');
    state = act(state, scenario, 'work', 'addressIssue');
    expect(scenario.scenes.complication.choices.some(({ id }) => id === 'useCarriedTool')).toBe(true);
    state = act(state, scenario, 'complication', 'useCarriedTool');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).not.toContain('fieldBandageRoll');
    expect(state.character?.carriedItem).toBeNull();
  });

  it('lets the traveler leave early or share the repair without requiring money or special gear', () => {
    const scenario = HONEST_WORK_ADVENTURES[1];
    let early = act(start(scenario, 'complication'), scenario, 'hiring', 'beginWork');
    early = act(early, scenario, 'work', 'leaveEarly');
    expect(early.run?.status).toBe('success');
    expect(early.character?.money).toBe(1);

    let shared = act(start(scenario, 'complication'), scenario, 'hiring', 'beginWork');
    shared = act(shared, scenario, 'work', 'addressIssue');
    shared = act(shared, scenario, 'complication', 'askForHelp');
    expect(shared.run?.sceneId).toBe('helpedFinish');
    expect(shared.character?.historyFlags).toContain('completed_paid_fence_repair_shared_work');
  });
});
