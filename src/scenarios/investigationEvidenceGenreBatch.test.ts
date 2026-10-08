import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, setItemCondition, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { INVESTIGATION_EVIDENCE_GENRE_BATCH } from './investigationEvidenceGenreBatch';
import { SCENARIOS } from './index';

const initial = (scenario: (typeof INVESTIGATION_EVIDENCE_GENRE_BATCH)[number], item?: string, bank: string[] = []): SaveData => {
  const character = newCharacter('Evidence Tester');
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run:startRun(character,scenario,() => 0) };
};
const act = (state: SaveData, scenario: (typeof INVESTIGATION_EVIDENCE_GENRE_BATCH)[number], choiceId: string, random: () => number = () => 0): SaveData => {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice,`${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scenario.id}.${scene.id}.${choiceId}`).toBe(true);
  return choose(state,scenario,choice!,random);
};
const reachSettlement = (scenario: (typeof INVESTIGATION_EVIDENCE_GENRE_BATCH)[number], action = 'careful'): SaveData => {
  let state = initial(scenario);
  const firstAvailable = scenario.scenes.observe.choices.find((choice) => meets(choice.requirements,state));
  expect(firstAvailable,`${scenario.id} fresh-observation fallback`).toBeTruthy();
  state = act(state,scenario,firstAvailable!.id);
  state = act(state,scenario,scenario.diversity?.combat === 'POSSIBLE' ? 'callWitness' : action);
  return state;
};

describe('Investigation / Evidence / Specialist Tools genre batch', () => {
  it('hides explicitly personal inspection-tool actions unless the matching tool is usable', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-stone-under-the-floorboard')!;
    const mirror = scenario.scenes.observe.choices.find(({ id }) => id === 'compare')!;
    expect(meets(mirror.requirements, initial(scenario))).toBe(false);
    expect(meets(mirror.requirements, initial(scenario, 'foldingCardMirror'))).toBe(true);
    expect(meets(mirror.requirements, setItemCondition(initial(scenario, 'foldingCardMirror'), 'foldingCardMirror', 'BROKEN'))).toBe(false);
    expect(scenario.scenes.observe.choices.some((choice) => meets(choice.requirements, initial(scenario)))).toBe(true);
  });
  it('registers 24 unique reachable Adventures with evidence interpretation and continuity', () => {
    expect(INVESTIGATION_EVIDENCE_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(INVESTIGATION_EVIDENCE_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(validateScenarioRegistry(INVESTIGATION_EVIDENCE_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(INVESTIGATION_EVIDENCE_GENRE_BATCH).warnings).toEqual([]);
    expect(INVESTIGATION_EVIDENCE_GENRE_BATCH.every(({ scenes }) => scenes.observe.choices.length >= 3 && scenes.test.choices.length >= 2 && scenes.settlement.textVariants?.length === 3)).toBe(true);
    expect(INVESTIGATION_EVIDENCE_GENRE_BATCH.filter(({ scenes }) => scenes.settlement.choices.some(({ effects }) => effects?.gainItems?.length))).toHaveLength(24);
  });

  it('keeps conclusions calibrated for careful, verification, and accusation choices', () => {
    for (const scenario of INVESTIGATION_EVIDENCE_GENRE_BATCH) {
      for (const action of (scenario.diversity?.combat === 'POSSIBLE' ? ['careful'] : ['careful','verify','accuse'])) {
        const state = reachSettlement(scenario,action);
        expect(state.run?.sceneId,scenario.id).toBe('settlement');
        const ending = scenario.scenes.settlement.textVariants!.find(({ requirements }) => meets(requirements,state));
        expect(ending,`${scenario.id}.${action}`).toBeTruthy();
        expect(ending!.text.length,`${scenario.id}.${action}`).toBeGreaterThan(55);
        if (action === 'accuse') expect(ending!.text).not.toMatch(/is guilty|stole it|started the fire|proved .* did it/i);
      }
    }
  });

  it('offers explicit wages or released, duplicate-safe Gear with canonical provenance', () => {
    for (const scenario of INVESTIGATION_EVIDENCE_GENRE_BATCH) {
      const state = reachSettlement(scenario);
      const wage = scenario.scenes.settlement.choices.find(({ id }) => id === 'wage')!;
      const paid = act(state,scenario,'wage');
      expect(paid.character?.money).toBe(state.character!.money + (wage.effects?.money ?? 0));
      const offer = scenario.scenes.settlement.choices.find(({ id }) => id === 'tool')!;
      const item = offer.effects!.gainItems![0];
      expect(ITEMS[item]?.inventoryClass,'catalog item').toBe('GEAR');
      expect(offer.effects?.gainItemProvenance?.[item]?.length).toBeGreaterThan(30);
      expect(meets(offer.requirements,initial(scenario,item))).toBe(false);
      expect(meets(offer.requirements,initial(scenario,undefined,[item]))).toBe(false);
      let granted = act(state,scenario,'tool');
      granted = openRewardResolution(granted);
      expect(granted.run?.rewardPendingItems).toContain(item);
      granted = finishRewardResolution(placeReward(granted,item,'carry'));
      expect(getCarriedItems(granted.character)).toContain(item);
      expect(ITEMS[item]?.carryable).toBe(true);
    }
  });

  it('persists each new specialist tool as ordinary carryable Gear', () => {
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({ carryable }) => carryable)).toHaveLength(72);
    expect(ITEMS.waxImpressionKit.description).toContain('cannot identify who made it');
    expect(ITEMS.charcoalRubbingKit.description).toContain('cannot date or authenticate');
    for (const id of ['waxImpressionKit','charcoalRubbingKit']) {
      const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ scenes }) => scenes.settlement.choices.some(({ effects }) => effects?.gainItems?.includes(id)))!;
      const state = reachSettlement(scenario);
      let pending = act(state,scenario,'tool');
      pending = openRewardResolution(pending);
      const storage = { value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;} };
      saveGame(pending,storage as never);
      const resumed = loadSave(storage as never);
      expect(resumed.run?.rewardPendingItems).toContain(id);
      expect(getCarriedItems(finishRewardResolution(placeReward(resumed,id,'carry')).character)).toContain(id);
    }
  });

  it('uses both specialist tools in distinct non-introduction investigations', () => {
    const callbacks = {
      waxImpressionKit:['the-scrape-beneath-the-lock','the-two-seals-at-blackwater-dock','the-wax-on-the-keyhole'],
      charcoalRubbingKit:['the-notches-on-the-old-millstone','the-chalk-line-at-the-old-boundary'],
    };
    for (const [item, ids] of Object.entries(callbacks)) for (const id of ids) {
      const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id: scenarioId }) => scenarioId === id)!;
      const choice = scenario.scenes.observe.choices.find(({ requirements }) => requirements?.items?.includes(item));
      expect(choice,`${id} uses ${item}`).toBeTruthy();
      expect(meets(choice!.requirements,initial(scenario,item))).toBe(true);
      expect(choice!.label).toMatch(/wax|rubbing|notch|seal|mark/i);
    }
  });

  it('keeps physical danger avoidable and resolves both hostile routes without unsupported blame', () => {
    for (const scenario of INVESTIGATION_EVIDENCE_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')) {
      const start = initial(scenario);
      const studied = act(start,scenario,scenario.scenes.observe.choices[0].id);
      const safe = act(studied,scenario,'callWitness');
      expect(safe.run?.sceneId).toBe('settlement');
      const won = act(studied,scenario,'standGround',() => 0);
      expect(won.run?.sceneId).toBe('settlement');
      const hurt = act(studied,scenario,'standGround',() => 1);
      expect(hurt.run?.sceneId).toBe('settlement');
      expect(hurt.run!.health).toBeLessThan(studied.run!.health);
    }
  });
});
