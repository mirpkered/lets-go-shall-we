import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemCondition, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { ITEMS } from '../items';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_BROKEN_HARNESS } from './animalsBatch';
import { THE_TRESTLE_TABLE } from './surpriseEverydayBatch';
import { TRADES_APPRENTICESHIP_GENRE_BATCH as BATCH } from './tradesApprenticeshipGenreBatch';

describe('Trades / Apprenticeships / Practical Work batch', () => {
  it('registers 24 unique all-year Adventures with valid destinations and catalog-backed rewards', () => {
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(BATCH.map(({ id }) => id)).size).toBe(24);
    expect(BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(BATCH.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(BATCH).errors).toEqual([]);
    for (const scenario of BATCH) for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
      for (const item of choice.effects?.gainItems ?? []) expect(ITEMS[item], `${scenario.id}.${scene.id}.${choice.id}: ${item}`).toBeTruthy();
    }
  });

  it('transfers the released Carpenter’s Square through canonical reward placement and honors the coin alternative', () => {
    const scenario = BATCH[0];
    const character = newCharacter('Trade Batch Tester');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    for (const id of ['square', 'replace', 'takeTool']) {
      const scene = scenario.scenes[state.run!.sceneId];
      const choice = scene.choices.find(({ id: choiceId }) => choiceId === id)!;
      state = choose(state, scenario, choice, () => 0);
    }
    expect(state.run?.acquiredThisRun).toContain('carpenterSquare');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('carpenterSquare');
    state = finishRewardResolution(placeReward(state, 'carpenterSquare', 'carry'));
    expect(getCarriedItems(state.character)).toContain('carpenterSquare');

    const coinCharacter = newCharacter('Coin Alternative Tester');
    let coins: SaveData = { ...structuredClone(EMPTY_SAVE), character: coinCharacter, run: startRun(coinCharacter, scenario, () => 0) };
    for (const id of ['square', 'replace', 'takeCoins']) {
      const scene = scenario.scenes[coins.run!.sceneId];
      const choice = scene.choices.find(({ id: choiceId }) => choiceId === id)!;
      coins = choose(coins, scenario, choice, () => 0);
    }
    expect(coins.character?.money).toBe(coinCharacter.money + 2);
    expect(coins.run?.acquiredThisRun).not.toContain('carpenterSquare');
  });

  it('keeps route-earned Knowledge when taking wages and hides duplicate instruction on those routes', () => {
    const cases = [
      { id:'the-harness-stitch', route:['flex', 'reinforce'], deferredRoute:['flex', 'replace'], learnScene:'threads', learnChoice:'reinforce' },
      { id:'the-line-that-would-not-hold', route:['inspect', 'relay'], deferredRoute:['inspect', 'wrap'], learnScene:'splice', learnChoice:'relay' },
      { id:'the-press-before-noon', route:['wash', 'post'], deferredRoute:['wash', 'adjust'], learnScene:'test', learnChoice:'post' },
      { id:'the-ropewalk-splice', route:['mark', 'wait'], deferredRoute:['mark', 'relay'], learnScene:'load', learnChoice:'wait' },
      { id:'paper-under-the-press', route:['support', 'wait'], deferredRoute:['support', 'copy'], learnScene:'ink', learnChoice:'wait' },
      { id:'the-door-at-the-telephone-office', route:['lift', 'explain'], deferredRoute:['lift', 'refit'], learnScene:'hinge', learnChoice:'explain' },
      { id:'the-glasshouse-lanterns', route:['chimney', 'record'], deferredRoute:['chimney', 'test'], learnScene:'draft', learnChoice:'record' },
    ] as const;

    for (const { id, route, deferredRoute, learnScene, learnChoice } of cases) {
      const scenario = BATCH.find((entry) => entry.id === id)!;
      const character = newCharacter('Knowledge Route Tester');
      let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run:startRun(character, scenario, () => 0) };
      for (const choiceId of route) {
        const choice = scenario.scenes[state.run!.sceneId].choices.find(({ id: candidate }) => candidate === choiceId)!;
        expect(choice, `${id}.${state.run!.sceneId}.${choiceId}`).toBeTruthy();
        state = choose(state, scenario, choice, () => 0);
      }
      expect(state.run?.sceneId, id).toBe('settlement');
      const learning = scenario.scenes[learnScene].choices.find(({ id: candidate }) => candidate === learnChoice)!;
      const knowledge = learning.effects?.knowledge?.[0];
      expect(knowledge, `${id} learning route has Knowledge`).toBeTruthy();
      expect(state.character?.knowledge).toContain(knowledge);
      const instruction = scenario.scenes.settlement.choices.find(({ id: candidate }) => candidate === 'learnMethod')!;
      expect(meets(instruction.requirements, state), `${id} duplicate instruction is hidden`).toBe(false);
      const unlearnedCharacter = newCharacter('Deferred Teaching Tester');
      const unlearned: SaveData = { ...structuredClone(EMPTY_SAVE), character:unlearnedCharacter, run:startRun(unlearnedCharacter, scenario, () => 0) };
      expect(meets(instruction.requirements, unlearned), `${id} instruction remains available before route learning`).toBe(true);

      const materialOptions = scenario.scenes.settlement.choices.filter(({ id: candidate }) => ['takeCoins', 'takeTool', 'decline'].includes(candidate));
      for (const option of materialOptions) {
        const compensation = option.id;
        const compensated = choose(structuredClone(state), scenario, option, () => 0);
        expect(compensated.character?.knowledge, `${id} after ${compensation}`).toContain(knowledge);
      }
      const paid = choose(structuredClone(state), scenario, scenario.scenes.settlement.choices.find(({ id: candidate }) => candidate === 'takeCoins')!, () => 0);
      const storage = { value:'', setItem(_key:string,value:string){this.value=value;}, getItem(_key:string){return this.value;} };
      saveGame(paid, storage as never);
      expect(loadSave(storage as never).character?.knowledge, `${id} after save/reload`).toContain(knowledge);

      let deferredState: SaveData = { ...structuredClone(EMPTY_SAVE), character:newCharacter('Deferred Teaching Tester') };
      const deferredCharacter = deferredState.character!;
      deferredState.run = startRun(deferredCharacter, scenario, () => 0);
      for (const choiceId of deferredRoute) {
        const choice = scenario.scenes[deferredState.run!.sceneId].choices.find(({ id: candidate }) => candidate === choiceId)!;
        deferredState = choose(deferredState, scenario, choice, () => 0);
      }
      expect(deferredState.run?.sceneId, `${id} deferred route`).toBe('settlement');
      expect(deferredState.character?.knowledge).not.toContain(knowledge);
      expect(sceneText(scenario.scenes.settlement, deferredState), `${id} explicit NPC offer`).toMatch(/offers to show you the method now|Farah can show you how/i);
      const teach = scenario.scenes.settlement.choices.find(({ id: candidate }) => candidate === 'learnMethod')!;
      expect(meets(teach.requirements, deferredState), `${id} teaching offer`).toBe(true);
      expect(teach.label).toMatch(/show you|Farah to show/i);
      const deferredKnowledge = teach.effects?.knowledge?.[0];
      expect(deferredKnowledge, `${id} explicit teaching fact`).toBeTruthy();
      deferredState = choose(deferredState, scenario, teach, () => 0);
      expect(deferredState.character?.knowledge, `${id} after explicit teaching`).toContain(deferredKnowledge);
    }
  });

  it('keeps the two new work tools distinct, carryable Gear rather than temporary props', () => {
    expect(ITEMS.carpenterSquare).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.leatherRepairRoll).toMatchObject({ carryable: true, inventoryClass: 'GEAR' });
    expect(ITEMS.carpenterSquare.description).toContain('right-angle');
    expect(ITEMS.leatherRepairRoll.description).toContain('mending straps');
  });

  it('repairs or improves an owned Travel Rope through persistent condition/provenance effects', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-ropewalk-splice')!;
    const character = newCharacter('Rope Repair Tester');
    character.carriedItem = 'travelRope';
    character.carriedItems = ['travelRope'];
    const damagedRecord = { condition: 'DAMAGED' as const, upgrades: [], provenance: [] };
    let damaged: SaveData = { ...structuredClone(EMPTY_SAVE), character, itemStates: { travelRope: damagedRecord }, run: startRun(character, scenario, () => 0, { travelRope: damagedRecord }) };
    for (const id of ['mark', 'wait', 'repairOwnRope']) {
      const choice = scenario.scenes[damaged.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      damaged = choose(damaged, scenario, choice, () => 0);
    }
    expect(itemCondition(damaged, 'travelRope')).toBe('NORMAL');
    expect(damaged.itemStates?.travelRope?.provenance).toContain('Mended by Bram Saye at the ropewalk');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(damaged, storage as never);
    damaged = loadSave(storage as never);
    expect(itemCondition(damaged, 'travelRope')).toBe('NORMAL');
    expect(damaged.itemStates?.travelRope?.provenance).toContain('Mended by Bram Saye at the ropewalk');

    const soundCharacter = newCharacter('Rope Upgrade Tester');
    soundCharacter.carriedItem = 'travelRope';
    soundCharacter.carriedItems = ['travelRope'];
    const soundRecord = { condition: 'NORMAL' as const, upgrades: [], provenance: [] };
    let sound: SaveData = { ...structuredClone(EMPTY_SAVE), character: soundCharacter, itemStates: { travelRope: soundRecord }, run: startRun(soundCharacter, scenario, () => 0, { travelRope: soundRecord }) };
    for (const id of ['mark', 'wait', 'spliceOwnRope']) {
      const choice = scenario.scenes[sound.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === id)!;
      sound = choose(sound, scenario, choice, () => 0);
    }
    expect(sound.itemStates?.travelRope?.upgrades.map(({ id }) => id)).toContain('splicedEyes');
    expect(sound.itemStates?.travelRope?.provenance).toContain('Leather-whipped by Bram Saye at the ropewalk');
  });

  it('adds practical, optional callbacks for the two new tools in existing Adventures', () => {
    const squareChoice = THE_TRESTLE_TABLE.scenes.crate.choices.find(({ id }) => id === 'checkFrameWithSquare');
    expect(squareChoice?.requirements?.items).toContain('carpenterSquare');
    expect(THE_TRESTLE_TABLE.scenes.squareMeasured.text).toContain('frame is still true');
    const repairRollChoice = THE_BROKEN_HARNESS.scenes.harnessRepaired.choices.find(({ id }) => id === 'assistWithLeatherRepairRoll');
    expect(repairRollChoice?.requirements?.items).toContain('leatherRepairRoll');
    expect(THE_BROKEN_HARNESS.scenes.harnessServiceDone.textVariants?.some(({ requirements }) => requirements.flags?.includes('used_leather_repair_roll_at_harness_maker'))).toBe(true);
  });

  it('uses a carried Brass Plumb Bob to reveal alignment without treating it as a structural verdict', () => {
    const scenario = BATCH.find(({ id }) => id === 'the-second-brace')!;
    const makeState = (carried: boolean, bank: string[] = []): SaveData => {
      const character = newCharacter('Plumb Bob Tester');
      if (carried) { character.carriedItem = 'brassPlumbBob'; character.carriedItems = ['brassPlumbBob']; }
      return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
    };
    const choice = scenario.scenes.frame.choices.find(({ id }) => id === 'plumb')!;
    expect(meets(choice.requirements, makeState(false))).toBe(false);
    expect(meets(choice.requirements, makeState(false, ['brassPlumbBob']))).toBe(false);
    const carried = makeState(true);
    expect(meets(choice.requirements, carried)).toBe(true);
    const after = choose(carried, scenario, choice, () => 0);
    expect(sceneText(scenario.scenes.hiddenRot, after)).toMatch(/Brass Plumb Bob.*alignment problem.*cannot tell.*hairline opens.*damp plaster hid a split.*rotten end is cut back/i);
    expect(scenario.scenes.hiddenRot.choices.some(({label})=>label==='Cover the split and finish before the market')).toBe(true);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(after, storage as never);
    expect(sceneText(scenario.scenes.hiddenRot, loadSave(storage as never))).toMatch(/Brass Plumb Bob.*alignment problem.*cannot tell.*hairline opens.*damp plaster hid a split.*rotten end is cut back/i);
  });

  it('keeps diagnosis, transcription, and harness teaching distinct from completed work', () => {
    const fresh = (scenario: (typeof BATCH)[number]): SaveData => {
      const character = newCharacter('Trade Route Truth Tester');
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };
    const pick = (scenario: (typeof BATCH)[number], state: SaveData, sceneId: string, choiceId: string): SaveData => {
      const option = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId)!;
      expect(option, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
      expect(meets(option.requirements, state), `${scenario.id}.${sceneId}.${choiceId} requirements`).toBe(true);
      return choose(state, scenario, option, () => 0);
    };
    const resumed = (state: SaveData): SaveData => {
      const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
      saveGame(state, storage as never);
      return loadSave(storage as never);
    };

    const door = BATCH.find(({ id }) => id === 'the-door-that-swelled')!;
    let reset = pick(door, fresh(door), 'door', 'inspect');
    reset = pick(door, reset, 'settle', 'reset');
    reset = resumed(reset);
    expect(sceneText(door.scenes.settlement, reset)).toMatch(/resets the lower hinge.*tests the door.*latch turns freely/i);
    let explained = pick(door, fresh(door), 'door', 'inspect');
    explained = pick(door, explained, 'settle', 'explain');
    explained = resumed(explained);
    expect(sceneText(door.scenes.settlement, explained)).toMatch(/schedule a dry-day trim.*hinge has not been reset.*free movement is not established/i);
    expect(sceneText(door.scenes.settlement, explained)).not.toMatch(/hinge holds|latch turns freely/i);
    expect(explained.character?.knowledge).toContain('A door that binds at the sill after rain may have a settled hinge or swollen frame, not a faulty lock.');
    const pryToolOffer = door.scenes.settlement.choices.find(({ id }) => id === 'takeTool')!;
    expect(meets(pryToolOffer.requirements, explained)).toBe(true);
    expect(pryToolOffer.hint).toMatch(/route result above establishes whether the hinge was reset/i);

    const press = BATCH.find(({ id }) => id === 'paper-under-the-press')!;
    let copied = pick(press, fresh(press), 'ledger', 'support');
    copied = pick(press, copied, 'ink', 'copy');
    expect(copied.run?.sceneId).toBe('settlement');
    expect(sceneText(press.scenes.settlement, copied)).toMatch(/volume dries without losing its sewing.*gatherings remain legible for transcription/i);
    expect(sceneText(press.scenes.settlement, copied)).not.toMatch(/entries are copied/i);
    let deferred = pick(press, fresh(press), 'ledger', 'support');
    deferred = pick(press, deferred, 'ink', 'wait');
    deferred = resumed(deferred);
    expect(sceneText(press.scenes.settlement, deferred)).not.toMatch(/entries are copied/i);
    expect(deferred.character?.knowledge).toContain('A damp book can be opened by supported gatherings; forcing the whole spine flat risks tearing the sewing.');

    const harness = BATCH.find(({ id }) => id === 'the-horse-that-wore-one-strap')!;
    let refit = pick(harness, fresh(harness), 'trace', 'fit');
    refit = pick(harness, refit, 'load', 'refit');
    refit = resumed(refit);
    expect(sceneText(harness.scenes.settlement, refit)).toMatch(/refits the collar.*lighter wagon.*traces share the pull/i);
    let teachOnly = pick(harness, fresh(harness), 'trace', 'fit');
    teachOnly = pick(harness, teachOnly, 'load', 'teach');
    teachOnly = resumed(teachOnly);
    expect(sceneText(harness.scenes.settlement, teachOnly)).toMatch(/show the farmer the fit marks.*collar was not refit or tested.*balanced pull remains unestablished/i);
    expect(sceneText(harness.scenes.settlement, teachOnly)).not.toMatch(/traces share the pull/i);
    expect(teachOnly.character?.knowledge).toContain('Uneven trace wear can come from a collar that rides low on one shoulder; check fit under a turn.');
  });
});
