import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, setItemCondition, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { OUTCOME_HISTORY_FLAGS } from '../travelerContinuity';
import { FRONTIER_DISCOVERY_ADVENTURES } from './frontierDiscoveryBatch';
import { INVESTIGATION_EVIDENCE_GENRE_BATCH } from './investigationEvidenceGenreBatch';
import { THE_MAP_IN_THE_LEDGER } from './lostPlacesBatch';
import { A_LINE_FOR_THE_BROADSIDE, THE_LAST_VERSE_CONTEST } from './surpriseCompetitionBatch';
import { THE_SCHOOLROOM_DOOR } from './surpriseSocialBatch';
import { ESCORT_PROTECTION_GENRE_BATCH } from './escortProtectionGenreBatch';

function fresh(scenario: Scenario, carried: string[] = [], bank: string[] = []): SaveData {
  const character = newCharacter('Live QA Tester');
  character.carriedItems = carried;
  character.carriedItem = carried[0] ?? null;
  return { ...structuredClone(EMPTY_SAVE), character, bank, run: startRun(character, scenario, () => 0) };
}

function pick(state: SaveData, scenario: Scenario, choiceId: string): SaveData {
  const current = scenario.scenes[state.run!.sceneId];
  const choice = current.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${current.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${current.id}.${choiceId}`).toBe(true);
  return choose(state, scenario, choice!);
}

describe('focused live-play QA repairs', () => {
  it('names the printed and invented versions before the Schoolroom Door choice', () => {
    const scene = THE_SCHOOLROOM_DOOR.scenes.lines;
    expect(scene.text).toMatch(/invented ending.*printed ending from the recitation text/i);
    expect(scene.choices.map(({ id, next }) => [id, next])).toEqual([
      ['letVote', 'performance'], ['keepPrintedEnding', 'student'],
    ]);
  });

  it('makes the Old Hydraulic Cut’s safe investigation purpose and result explicit without inventing a reward', () => {
    const scenario = FRONTIER_DISCOVERY_ADVENTURES.find(({ id }) => id === 'the-old-hydraulic-cut')!;
    expect(scenario.scenes[scenario.startScene].text).toMatch(/trace the pipe to understand how water reached the excavation/i);
    let state = pick(fresh(scenario), scenario, 'approach');
    state = pick(state, scenario, 'testGround');
    state = pick(state, scenario, 'advanceFromStable');
    state = pick(state, scenario, 'closeCarefully');
    const ending = scenario.scenes[state.run!.sceneId];
    expect(ending.title).toBe('A Careful Account');
    expect(ending.text).toMatch(/following the pipe.*explains how water reached the excavation/i);
    expect(ending.text).toMatch(/lower face remains unstable.*leave it untested for ore/i);
    expect(state.character?.money).toBe(0);
  });

  it('gates the Bent Pin caliper method on carried, usable Field Calipers', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-bent-pin-in-the-harvest-engine')!;
    const choice = scenario.scenes.observe.choices.find(({ id }) => id === 'measure')!;
    expect(choice.label).toMatch(/Field Calipers/);
    expect(meets(choice.requirements, fresh(scenario))).toBe(false);
    expect(meets(choice.requirements, fresh(scenario, [], ['fieldCalipers']))).toBe(false);
    expect(meets(choice.requirements, setItemCondition(fresh(scenario, ['fieldCalipers']), 'fieldCalipers', 'BROKEN'))).toBe(false);
    expect(meets(choice.requirements, fresh(scenario, ['fieldCalipers']))).toBe(true);
    expect(scenario.scenes.observe.choices.some((option) => meets(option.requirements, fresh(scenario)))).toBe(true);
  });

  it('retains the Bent Pin inspection lesson before compensation, regardless of the chosen payout', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-bent-pin-in-the-harvest-engine')!;
    const lesson = 'A damaged part may be a consequence of a jam rather than its cause; inspect connected components before blaming the last hand.';
    for (const payout of ['wage', 'tool', 'decline']) {
      let state = pick(fresh(scenario), scenario, 'compare');
      state = pick(state, scenario, 'careful');
      expect(state.run?.sceneId).toBe('settlement');
      expect(state.character?.knowledge).toContain(lesson);
      const choice = scenario.scenes.settlement.choices.find(({ id }) => id === payout)!;
      expect(choice).toBeTruthy();
      state = pick(state, scenario, payout);
      expect(state.character?.knowledge).toContain(lesson);
    }
    expect(scenario.scenes.settlement.choices.find(({ id }) => id === 'recordLesson')).toBeUndefined();
    expect(scenario.scenes.settlement.choices.find(({ id }) => id === 'decline')?.label).toMatch(/material compensation/i);
  });

  it('establishes the Last Verse judging context while preserving outcomes and follow-up eligibility', () => {
    const recitals = THE_LAST_VERSE_CONTEST.scenes.recitals;
    expect(recitals.text).toMatch(/finished for the book prize/i);
    expect(recitals.text).toMatch(/judge asks which version should win/i);
    expect(recitals.choices.map(({ id, next }) => [id, next])).toEqual([
      ['judgeByMemory', 'family'], ['judgeByPrint', 'printed'], ['askForAudienceChoice', 'audience'],
    ]);
    expect(THE_LAST_VERSE_CONTEST.scenes.family.text).toMatch(/awards the book to Mara Bell/i);
    expect(THE_LAST_VERSE_CONTEST.scenes.audience.text).toMatch(/crowd’s favorite, not the oldest or truest/i);
    expect(A_LINE_FOR_THE_BROADSIDE.selectionRequirements).toEqual([
      { historyFlags: [OUTCOME_HISTORY_FLAGS.acceptedFamilyVerse] },
      { historyFlags: [OUTCOME_HISTORY_FLAGS.favoredPrintedVerse] },
    ]);
  });

  it('gives a fresh Traveler a non-Gear cattle-drive alternative and distinct outcomes', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-quiet-cattle-drive')!;
    const start = scenario.scenes.range;
    expect(start.text).toMatch(/back fence gives the drover room/i);
    expect(start.choices.filter(({ requirements }) => meets(requirements, fresh(scenario))).map(({ id }) => id)).toEqual(['backFence', 'wait']);
    const detour = pick(fresh(scenario), scenario, 'backFence');
    expect(detour.run?.sceneId).toBe('backFence');
    expect(scenario.scenes.backFence.text).toMatch(/turns the herd along the back fence.*detour costs time/i);
    const wait = pick(fresh(scenario), scenario, 'wait');
    expect(wait.run?.sceneId).toBe('delay');
    expect(scenario.scenes.delay.text).toMatch(/herd waits until the crew lowers the pole/i);
  });

  it('persists the Old Water-Gate map location only when the Traveler explicitly copies it', () => {
    const copy = THE_MAP_IN_THE_LEDGER.scenes.ledger.choices.find(({ id }) => id === 'copyMap')!;
    expect(copy.effects?.historyFlags).toContain('retained_old_water_gate_location_from_mill_ledger');
    const copied = pick(fresh(THE_MAP_IN_THE_LEDGER), THE_MAP_IN_THE_LEDGER, 'copyMap');
    expect(copied.character?.historyFlags).toContain('retained_old_water_gate_location_from_mill_ledger');
    const stored = new Map<string, string>();
    const storage = { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => { stored.set(key, value); } };
    saveGame(copied, storage);
    expect(loadSave(storage).character?.historyFlags).toContain('retained_old_water_gate_location_from_mill_ledger');
    const declined = pick(fresh(THE_MAP_IN_THE_LEDGER), THE_MAP_IN_THE_LEDGER, 'leaveLedger');
    expect(declined.character?.historyFlags).not.toContain('retained_old_water_gate_location_from_mill_ledger');
  });
});
