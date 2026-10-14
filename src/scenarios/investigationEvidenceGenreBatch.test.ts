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
  it('keeps investigation action results attached to the action that establishes them', () => {
    const outcomeText = (scenario: (typeof INVESTIGATION_EVIDENCE_GENRE_BATCH)[number], state: SaveData) =>
      scenario.scenes.settlement.textVariants?.find(({ requirements }) => meets(requirements, state))?.text ?? scenario.scenes.settlement.text;

    const widths = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-two-widths-at-morrow-road')!;
    const followedTrack = reachSettlement(widths, 'careful');
    expect(outcomeText(widths, followedTrack)).toMatch(/ends at the road fork.*crate remains unaccounted for/i);
    expect(outcomeText(widths, followedTrack)).not.toMatch(/owner finds the crate behind a feed partition/i);
    const inventoryRequested = reachSettlement(widths, 'accuse');
    expect(outcomeText(widths, inventoryRequested)).toMatch(/ask the yard owner to inventory.*check is still pending/i);
    expect(outcomeText(widths, inventoryRequested)).not.toMatch(/teamster refuses the accusation|delays his pay/i);

    const seal = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-seal-with-the-second-notch')!;
    const heldForSender = reachSettlement(seal, 'careful');
    expect(outcomeText(seal, heldForSender)).toMatch(/held for the sender’s written confirmation.*has not accepted responsibility/i);
    expect(outcomeText(seal, heldForSender)).not.toMatch(/receiver accepts responsibility/i);
    const witnessedAcceptance = reachSettlement(seal, 'verify');
    expect(outcomeText(seal, witnessedAcceptance)).toMatch(/receiver accepts responsibility.*witnessed exception/i);

    const engine = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-bent-pin-in-the-harvest-engine')!;
    const heldStopped = reachSettlement(engine, 'careful');
    expect(outcomeText(engine, heldStopped)).toMatch(/engine stays stopped.*not secured the guard or replaced the pin/i);
    expect(outcomeText(engine, heldStopped)).not.toMatch(/guard is secured and the pin replaced/i);
    const repairChosen = reachSettlement(engine, 'verify');
    expect(outcomeText(engine, repairChosen)).toMatch(/guard is secured and the pin replaced/i);
  });

  it.each([
    { scenarioId: 'the-map-with-two-norths', resultRoutes: ['measure'], result: /comparing the map with Survey Chain distances confirms.*reduced copy/i, unsupported: /smaller arrow aligns with the map’s folded orientation|scale discrepancy comes from a reduced copy/i },
    { scenarioId: 'the-scrape-beneath-the-lock', resultRoutes: ['measure'], result: /spare key turns stiffly.*shallow line on the inside lip/i, unsupported: /The key turns stiffly and leaves a shallow line/i },
    { scenarioId: 'the-switch-that-faced-east', resultRoutes: ['ask'], result: /pin is bent at its exposed end/i, unsupported: /pin is bent at its exposed end/i },
    { scenarioId: 'the-two-seals-at-blackwater-dock', resultRoutes: ['ask'], result: /crew names Bell Landing/i, unsupported: /crew names Bell Landing/i },
    { scenarioId: 'the-empty-hook-in-the-tool-room', resultRoutes: ['measure', 'ask'], result: /hammer (?:assigned|was issued) to the bridge crew/i, unsupported: /hammer (?:assigned|was issued) to the bridge crew/i },
    { scenarioId: 'the-gate-pin-at-south-pasture', resultRoutes: ['measure'], result: /old polished side fits the socket/i, unsupported: /fits the socket/i },
    { scenarioId: 'the-ledger-page-that-dried', resultRoutes: ['compare'], result: /next sheet preserves part of the line/i, unsupported: /two coin marks/i },
    { scenarioId: 'the-rope-fibers-on-the-ferry-cleat', resultRoutes: ['measure', 'compare'], result: /inner strands are stretched/i, unsupported: /inner strands are stretched/i },
    { scenarioId: 'the-stone-under-the-floorboard', resultRoutes: ['measure'], result: /rod finds a narrow void/i, unsupported: /rod finds a narrow void/i },
    { scenarioId: 'the-boot-mark-in-the-ash', resultRoutes: ['measure', 'compare'], result: /print is close to the porter’s size/i, unsupported: /porter’s size/i },
    { scenarioId: 'the-wax-on-the-keyhole', resultRoutes: ['measure'], result: /wax matches the recorder’s seal stick/i, unsupported: /wax matches/i },
    { scenarioId: 'the-quiet-bell-at-milepost-four', resultRoutes: ['measure'], result: /rope has slipped through its worn eye/i, unsupported: /rope has slipped/i },
    { scenarioId: 'the-notches-on-the-old-millstone', resultRoutes: ['measure'], result: /notches are older than the date scratch/i, unsupported: /notches are older/i },
    { scenarioId: 'the-sealed-letter-at-cedar-post', resultRoutes: ['measure'], result: /signature belongs to the recipient’s household/i, unsupported: /signature belongs/i },
  ])('$scenarioId only presents route-established inspection results', ({ scenarioId, resultRoutes, result, unsupported }) => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
    const testScene = scenario.scenes.test;
    for (const observation of scenario.scenes.observe.choices) {
      const gear = observation.requirements?.items?.[0];
      let state = initial(scenario, gear);
      state = act(state, scenario, observation.id);
      const selected = testScene.textVariants?.find(({ requirements }) => meets(requirements, state))?.text ?? testScene.text;
      if (resultRoutes.includes(observation.id)) expect(selected, observation.id).toMatch(result);
      else {
        if (scenarioId === 'the-map-with-two-norths' && observation.id === 'ask') expect(selected).toMatch(/remains flat and protected.*Map Case/i);
        else expect(selected, observation.id).toBe(testScene.text);
        expect(selected, observation.id).not.toMatch(unsupported);
      }
    }
  });

  it('does not reveal the missing shears beneath the bench before the explicit search action', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-missing-shears-at-the-mill')!;
    for (const observation of scenario.scenes.observe.choices) {
      const state = act(initial(scenario), scenario, observation.id);
      const selected = scenario.scenes.test.textVariants?.find(({ requirements }) => meets(requirements, state))?.text ?? scenario.scenes.test.text;
      expect(selected).not.toMatch(/thread.*caught beneath|shears.*under the bench/i);
    }
    let searched = act(act(initial(scenario), scenario, 'ask'), scenario, 'careful');
    const ending = scenario.scenes.settlement.textVariants?.find(({ requirements }) => meets(requirements, searched))?.text ?? scenario.scenes.settlement.text;
    expect(ending).toMatch(/shears turn up under the bench/i);
  });

  it('hides explicitly personal inspection-tool actions unless the matching tool is usable', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-stone-under-the-floorboard')!;
    const mirror = scenario.scenes.observe.choices.find(({ id }) => id === 'compare')!;
    expect(meets(mirror.requirements, initial(scenario))).toBe(false);
    expect(meets(mirror.requirements, initial(scenario, 'foldingCardMirror'))).toBe(true);
    expect(meets(mirror.requirements, setItemCondition(initial(scenario, 'foldingCardMirror'), 'foldingCardMirror', 'BROKEN'))).toBe(false);
    expect(scenario.scenes.observe.choices.some((choice) => meets(choice.requirements, initial(scenario)))).toBe(true);
  });

  it('requires a carried, usable Map Case and gives its route an acknowledged preservation consequence', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-map-with-two-norths')!;
    const choice = scenario.scenes.observe.choices.find(({ id }) => id === 'ask')!;
    expect(choice.label).toMatch(/Lockable Map Case/);
    expect(meets(choice.requirements, initial(scenario))).toBe(false);
    expect(meets(choice.requirements, initial(scenario, undefined, ['lockableMapCase']))).toBe(false);
    expect(meets(choice.requirements, setItemCondition(initial(scenario, 'lockableMapCase'), 'lockableMapCase', 'BROKEN'))).toBe(false);
    expect(meets(choice.requirements, initial(scenario, 'lockableMapCase', ['lockableMapCase']))).toBe(true);

    let state = act(initial(scenario, 'lockableMapCase', ['lockableMapCase']), scenario, 'ask');
    expect(state.run?.flags).toContain('map_copy_secured');
    const testVariant = scenario.scenes.test.textVariants!.find(({ requirements }) => meets(requirements, state));
    expect(testVariant?.text).toMatch(/remains flat and protected.*Map Case.*later reference/i);
    expect(testVariant?.text).toMatch(/does not resolve the scale or orientation/i);
    expect(testVariant?.text).not.toMatch(/smaller arrow aligns with the map’s folded orientation|scale discrepancy comes from a reduced copy/i);
    const visible = scenario.scenes.test.choices.filter(({ requirements }) => meets(requirements, state));
    expect(visible.map(({ id }) => id)).toEqual(['carefulWithCopy', 'verifyWithCopy', 'accuseWithCopy']);
    expect(visible[0].label).toMatch(/take the protected copy out/i);
    expect(visible[1].label).toMatch(/keep the protected working copy/i);
    state = act(state, scenario, 'carefulWithCopy');
    const ending = scenario.scenes.settlement.textVariants!.find(({ requirements }) => meets(requirements, state));
    expect(ending?.text).toMatch(/take the protected copy out.*return it to the clerk/i);
  });

  it('retains the map lesson regardless of fee, Gear, or no-compensation choice', () => {
    const scenario = INVESTIGATION_EVIDENCE_GENRE_BATCH.find(({ id }) => id === 'the-map-with-two-norths')!;
    const toSettlement = () => {
      let state = initial(scenario);
      state = act(state, scenario, 'measure');
      return act(state, scenario, 'careful');
    };
    for (const id of ['wage', 'tool', 'decline']) {
      const before = toSettlement();
      const choice = scenario.scenes.settlement.choices.find(({ id: choiceId }) => choiceId === id)!;
      expect(choice, id).toBeTruthy();
      expect(choice.effects?.knowledge, id).toEqual(['A map can preserve direction while losing scale; check its purpose and orientation before relying on measurements.']);
      const after = act(before, scenario, id);
      expect(after.character?.knowledge).toContain('A map can preserve direction while losing scale; check its purpose and orientation before relying on measurements.');
    }
    expect(scenario.scenes.settlement.choices.find(({ id }) => id === 'recordLesson')).toBeUndefined();
    expect(scenario.scenes.settlement.choices.find(({ id }) => id === 'decline')?.label).not.toMatch(/lesson|method/i);
  });

  it('records investigation findings before settlement, independent of material compensation', () => {
    for (const scenario of INVESTIGATION_EVIDENCE_GENRE_BATCH.filter(({ id }) => id !== 'the-map-with-two-norths')) {
      const before = reachSettlement(scenario);
      const lessonChoice = scenario.scenes.test.choices.find(({ id }) => id === (scenario.diversity?.combat === 'POSSIBLE' ? 'callWitness' : 'careful'))!;
      const knowledge = lessonChoice.effects?.knowledge?.[0];
      expect(knowledge, `${scenario.id} learns from the evidence before settlement`).toBeTruthy();
      expect(before.character?.knowledge).toContain(knowledge);
      const settlement = scenario.scenes.settlement;
      const noCompensation = settlement.choices.find(({ label }) => /Decline.*material compensation/i.test(label));
      expect(noCompensation, scenario.id).toBeTruthy();
      for (const choice of settlement.choices) expect(choice.effects?.knowledge, `${scenario.id}.${choice.id} compatibility-safe grant`).toEqual([knowledge]);
      for (const choice of settlement.choices) {
        let after = act(before, scenario, choice.id);
        expect(after.character?.knowledge, `${scenario.id}.${choice.id}`).toContain(knowledge);
        const storage = { value:'', setItem(_key:string,value:string){this.value=value;}, getItem(_key:string){return this.value;} };
        saveGame(after, storage as never);
        after = loadSave(storage as never);
        expect(after.character?.knowledge, `${scenario.id}.${choice.id} save/reload`).toContain(knowledge);
      }
    }
  });
  it('registers 24 unique reachable Adventures with evidence interpretation and continuity', () => {
    expect(INVESTIGATION_EVIDENCE_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(INVESTIGATION_EVIDENCE_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(validateScenarioRegistry(INVESTIGATION_EVIDENCE_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(INVESTIGATION_EVIDENCE_GENRE_BATCH).warnings).toEqual([]);
    expect(INVESTIGATION_EVIDENCE_GENRE_BATCH.every(({ scenes }) => scenes.observe.choices.length >= 3 && scenes.test.choices.length >= 2 && (scenes.settlement.textVariants?.length ?? 0) >= 3)).toBe(true);
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
