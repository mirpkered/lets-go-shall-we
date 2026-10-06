import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemState, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { SALVAGE_RECOVERY_GENRE_BATCH } from './salvageRecoveryGenreBatch';
import type { SaveData } from '../types';

function initial(scenario: (typeof SALVAGE_RECOVERY_GENRE_BATCH)[number], carried?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Recovery Tester');
  character.money = 5;
  if (carried) { character.carriedItem = carried; character.carriedItems = [carried]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
}
function act(state: SaveData, scenario: (typeof SALVAGE_RECOVERY_GENRE_BATCH)[number], id: string, random: () => number = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}
function decision(scenario: (typeof SALVAGE_RECOVERY_GENRE_BATCH)[number]): SaveData {
  let state = initial(scenario);
  state = act(state, scenario, scenario.scenes.arrival.choices[0].id);
  state = act(state, scenario, 'traceOwnership');
  return state;
}

describe('Salvage / Recovery / Reclamation genre batch', () => {
  it('registers 24 distinct all-year Adventures with valid destinations and no duplicate IDs', () => {
    expect(SALVAGE_RECOVERY_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(685);
    expect(new Set(SALVAGE_RECOVERY_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(SALVAGE_RECOVERY_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(SALVAGE_RECOVERY_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(SALVAGE_RECOVERY_GENRE_BATCH).warnings).toEqual([]);
    expect(SALVAGE_RECOVERY_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(4);
  });

  it('offers only catalog Gear, blocks already-owned copies, and records owner-release provenance', () => {
    const gearStories = SALVAGE_RECOVERY_GENRE_BATCH.filter(({ scenes }) => scenes.decision.choices.some(({ id }) => id === 'acceptReleasedGear'));
    expect(gearStories).toHaveLength(24);
    for (const scenario of gearStories) {
      const offer = scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
      const id = offer.effects!.gainItems![0];
      expect(ITEMS[id]?.inventoryClass, scenario.id).toBe('GEAR');
      expect(offer.effects?.gainItemProvenance?.[id], scenario.id).toBeTruthy();
      expect(meets(offer.requirements, initial(scenario, id)), `${scenario.id} carried copy`).toBe(false);
      expect(meets(offer.requirements, initial(scenario, undefined, [id])), `${scenario.id} Banked copy`).toBe(false);
      if (scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')?.effects?.money) {
        const poor = decision(scenario);
        poor.character!.money = 0;
        expect(meets(offer.requirements, poor), `${scenario.id} insufficient purchase funds`).toBe(false);
      }
      let state = act(decision(scenario), scenario, 'acceptReleasedGear');
      expect(state.character?.money).toBe(5 - (offer.effects?.money ? -offer.effects.money : 0));
      expect(state.run?.inventorySources?.[id]).toBe('found');
      expect(itemState(state, id).provenance).toContain(offer.effects!.gainItemProvenance![id]);
      if (offer.effects?.gainItemConditions?.[id]) expect(itemState(state, id).condition).toBe(offer.effects.gainItemConditions[id]);
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems).toContain(id);
      state = finishRewardResolution(placeReward(state, id, 'carry'));
      expect(getCarriedItems(state.character)).toContain(id);
    }
  });

  it('keeps fee, Knowledge, refusal, and deferred ownership outcomes mutually exclusive', () => {
    for (const scenario of SALVAGE_RECOVERY_GENRE_BATCH) {
      const start = decision(scenario);
      const fee = act(start, scenario, 'takeFee');
      expect(fee.character?.money).toBe(start.character!.money + scenario.scenes.decision.choices.find(({ id }) => id === 'takeFee')!.effects!.money!);
      expect(fee.run?.inventory).not.toContain(scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')?.effects?.gainItems?.[0]);
      const lesson = act(start, scenario, 'keepLesson');
      expect(lesson.character?.knowledge.length).toBeGreaterThan(start.character!.knowledge.length);
      const refused = act(start, scenario, 'refuseAll');
      expect(refused.character?.money).toBe(start.character?.money);
      expect(refused.run?.acquiredThisRun).toEqual([]);
      let deferred = act(initial(scenario), scenario, scenario.scenes.arrival.choices[0].id);
      deferred = act(deferred, scenario, 'deferRecovery');
      expect(deferred.run?.sceneId).toBe('deferred');
      expect(deferred.run?.inventory).not.toContain(scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')?.effects?.gainItems?.[0]);
    }
  });

  it('preserves recovered item condition and provenance through save/resume and reward placement', () => {
    const scenario = SALVAGE_RECOVERY_GENRE_BATCH.find(({ scenes }) => scenes.decision.choices.some(({ effects }) => effects?.gainItemConditions))!;
    const offer = scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    const item = offer.effects!.gainItems![0];
    let state = act(decision(scenario), scenario, 'acceptReleasedGear');
    state = openRewardResolution(state);
    const storage = { value:'', setItem(_key:string, value:string) { this.value=value; }, getItem(_key:string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.run?.scenarioId).toBe(scenario.id);
    expect(itemState(state, item).condition).toBe('DAMAGED');
    expect(itemState(state, item).provenance).toContain(offer.effects!.gainItemProvenance![item]);
    state = finishRewardResolution(placeReward(state, item, 'carry'));
    expect(getCarriedItems(state.character)).toContain(item);
    expect(itemState(state, item).condition).toBe('DAMAGED');
  });

  it('offers genuine, state-gated repairs for damaged carried tools without granting duplicates or wages', () => {
    for (const [scenarioId, item] of [['the-lost-lantern-crate','roadmansLantern'], ['the-bell-creek-drift','freightmansStrap']]) {
      const scenario = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
      let state = initial(scenario, item);
      state.itemStates = { [item]:{ condition:'DAMAGED', upgrades:[], provenance:['Older trip'] } };
      state = act(state, scenario, scenario.scenes.arrival.choices[0].id);
      state = act(state, scenario, 'traceOwnership');
      const repair = scenario.scenes.decision.choices.find(({ id }) => id === 'repairOwnedGear')!;
      expect(meets(repair.requirements, state)).toBe(true);
      state = act(state, scenario, 'repairOwnedGear');
      expect(state.run?.sceneId).toBe('repaired');
      expect(itemState(state, item).condition).toBe('NORMAL');
      expect(itemState(state, item).provenance).toContain(`Repaired during ${scenario.title}`);
      expect(getCarriedItems(state.character)).toContain(item);
      expect(state.character?.money).toBe(5);
      expect(state.run?.acquiredThisRun).toEqual([]);
    }
  });

  it('keeps four hostile recovery confrontations optional, consequential, and non-looting', () => {
    for (const scenario of SALVAGE_RECOVERY_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')) {
      const start = initial(scenario);
      let state = act(start, scenario, scenario.scenes.arrival.choices[0].id);
      expect(scenario.scenes.evidence.choices.some(({ id }) => id === 'deferRecovery' && meets(scenario.scenes.evidence.choices.find((choice) => choice.id === id)!.requirements, state))).toBe(true);
      const won = act(state, scenario, 'standGround', () => 0);
      expect(won.run?.sceneId).toBe('fightWon');
      expect(won.run?.inventory).toEqual(state.run?.inventory);
      const recovered = act(won, scenario, 'resumeRecovery');
      expect(recovered.run?.sceneId).toBe('decision');
      const lost = act(state, scenario, 'standGround', () => 0.999999);
      expect(lost.run?.sceneId).toBe('fightLost');
      expect(lost.run?.status).toBe('success');
      expect(lost.run?.acquiredThisRun).toEqual([]);
    }
  });
});
