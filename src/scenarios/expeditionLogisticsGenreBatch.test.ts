import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { SCENARIOS } from './index';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { EXPEDITION_LOGISTICS_GENRE_BATCH } from './expeditionLogisticsGenreBatch';
import type { SaveData, Scenario } from '../types';

const fresh = (scenario: Scenario): SaveData => {
  const character = newCharacter('Logistics Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};
const take = (state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData => {
  const scene = scenario.scenes[sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${sceneId} requirements`).toBe(true);
  state.run!.sceneId = sceneId;
  return choose(state, scenario, choice!);
};

describe('Gear Expansion Genre Batch 8 — Expedition Logistics / Supply / Staging', () => {
  it('registers 24 unique Adventures with valid, reachable, acyclic story graphs', () => {
    expect(EXPEDITION_LOGISTICS_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(EXPEDITION_LOGISTICS_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(EXPEDITION_LOGISTICS_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(validateScenarioRegistry(EXPEDITION_LOGISTICS_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    for (const scenario of EXPEDITION_LOGISTICS_GENRE_BATCH) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const choice of scene.choices) for (const itemId of choice.effects?.gainItems ?? []) expect(ITEMS[itemId], `${scenario.id} grants ${itemId}`).toBeTruthy();
      }
    }
  });

  it('gives every operation a continuity payoff and most a legitimate Gear route', () => {
    let gearRoutes = 0;
    for (const scenario of EXPEDITION_LOGISTICS_GENRE_BATCH) {
      const effects = Object.values(scenario.scenes).flatMap(({ choices }) => choices).map(({ effects }) => effects).filter(Boolean);
      expect(effects.some((effect) => (effect?.money ?? 0) > 0 || !!effect?.knowledge?.length || !!effect?.lore?.length || !!effect?.gainItems?.length), scenario.title).toBe(true);
      if (effects.some((effect) => effect?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR'))) gearRoutes += 1;
    }
    expect(gearRoutes).toBeGreaterThanOrEqual(18);
  });

  it('does not report food delivered when the Second Wagon route carries only water', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-second-wagon')!;

    let handCarried = fresh(scenario);
    handCarried = take(handCarried, scenario, 'wheel', 'takeWater');
    const deliveredText = sceneText(scenario.scenes.partial, handCarried);
    expect(deliveredText).toMatch(/receives water and food carried ahead by hand/i);

    let waterOnly = fresh(scenario);
    waterOnly = take(waterOnly, scenario, 'wheel', 'secureWheel');
    waterOnly = take(waterOnly, scenario, 'repair', 'abandon');
    const waterOnlyText = sceneText(scenario.scenes.partial, waterOnly);
    expect(waterOnlyText).not.toMatch(/receives water and food|carried ahead by hand/i);
    expect(waterOnlyText).toMatch(/camp misses its planned work/i);

    let hardPush = fresh(scenario);
    hardPush = take(hardPush, scenario, 'wheel', 'lighten');
    hardPush = take(hardPush, scenario, 'light', 'pushHard');
    expect(sceneText(scenario.scenes.partial, hardPush)).not.toMatch(/receives water and food|carried ahead by hand/i);
  });

  it('keeps expedition allocations temporary and makes the player honor the load choice', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'weighed-before-dawn')!;
    let state = fresh(scenario);
    const startingInventory = [...state.run!.inventory];
    state = take(state, scenario, 'yard', 'takeRope');
    expect(state.run?.flags).toContain('expedition_rope_packed');
    expect(state.run?.inventory).toEqual(startingInventory);
    state = take(state, scenario, 'ridge', 'secureByRope');
    expect(state.run?.inventory).toEqual(startingInventory);
    expect(state.character?.historyFlags).toContain('used_rope_to_secure_survey_load');

    const gated = scenario.scenes.yard.choices.find(({ id }) => id === 'weighLoads')!;
    expect(meets(gated.requirements, fresh(scenario))).toBe(false);
    const scaleRun = fresh(scenario);
    scaleRun.run!.inventory.push('cargoBalanceScale');
    expect(meets(gated.requirements, scaleRun)).toBe(true);
  });

  it('keeps cached bedding out of the Fourth Mule safe outcome unless the route returns for it', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-fourth-mule')!;
    let cached = fresh(scenario);
    cached = take(cached, scenario, 'string', 'leaveBedding');
    expect(cached.run?.flags).toContain('fourth_mule_bedding_cached');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(cached, storage as never);
    cached = loadSave(storage as never);
    cached = take(cached, scenario, 'camp', 'useBlanket');
    const cachedEnding = sceneText(scenario.scenes.safe, cached);
    expect(cachedEnding).toMatch(/bedding was left at the staging shed/i);
    expect(cachedEnding).not.toMatch(/goods remain together/i);

    let handCarried = fresh(scenario);
    handCarried = take(handCarried, scenario, 'string', 'splitByHand');
    handCarried = take(handCarried, scenario, 'camp', 'useBlanket');
    expect(sceneText(scenario.scenes.safe, handCarried)).toMatch(/load remains as placed by the chosen plan/i);
    expect(sceneText(scenario.scenes.safe, handCarried)).not.toMatch(/bedding was left at the staging shed/i);

    let returned = fresh(scenario);
    returned = take(returned, scenario, 'string', 'leaveBedding');
    returned = take(returned, scenario, 'camp', 'returnBedding');
    expect(returned.run?.sceneId).toBe('paid');
    expect(sceneText(scenario.scenes.paid, returned)).toMatch(/bedding or daylight was spent/i);

    const legacy = fresh(scenario);
    legacy.run!.sceneId = 'safe';
    const legacyText = sceneText(scenario.scenes.safe, legacy);
    expect(legacyText).toMatch(/load remains as placed by the chosen plan/i);
    expect(legacyText).not.toMatch(/goods remain together|bedding was left at the staging shed/i);
  });

  it('does not place the Quiet Resupply crew at the cut until the uphill print is followed', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-quiet-resupply')!;
    let sheltered = fresh(scenario);
    sheltered = take(sheltered, scenario, 'camp', 'secureCrate');
    expect(sheltered.run?.flags).toContain('resupply_crate_sheltered');
    const shelteredText = sceneText(scenario.scenes.tracks, sheltered);
    expect(shelteredText).toMatch(/no route proof here establishes the crew’s location or current needs/i);
    expect(shelteredText).not.toMatch(/two workers|crew needs bandages/i);
    expect(meets(scenario.scenes.tracks.choices.find(({ id }) => id === 'carryEssentials')?.requirements, sheltered)).toBe(false);
    expect(meets(scenario.scenes.tracks.choices.find(({ id }) => id === 'returnForAll')?.requirements, sheltered)).toBe(true);

    let found = fresh(scenario);
    found = take(found, scenario, 'camp', 'followPrint');
    expect(found.run?.flags).toContain('resupply_followed_crew');
    expect(sceneText(scenario.scenes.tracks, found)).toMatch(/following the uphill print brings you to two workers/i);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(found, storage as never);
    found = loadSave(storage as never);
    expect(meets(scenario.scenes.tracks.choices.find(({ id }) => id === 'carryEssentials')?.requirements, found)).toBe(true);
    found = take(found, scenario, 'tracks', 'carryEssentials');
    expect(found.run?.sceneId).toBe('paid');

    const legacy = fresh(scenario);
    legacy.run!.sceneId = 'tracks';
    expect(sceneText(scenario.scenes.tracks, legacy)).toMatch(/no route proof here establishes the crew’s location or current needs/i);
    expect(meets(scenario.scenes.tracks.choices.find(({ id }) => id === 'carryEssentials')?.requirements, legacy)).toBe(false);
  });

  it('reports Broken Handcart timber delivery from the selected load route', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-broken-handcart')!;
    let braced = fresh(scenario);
    braced.run!.inventory.push('pocketToolkit');
    braced = take(braced, scenario, 'cart', 'braceHandle');
    braced = take(braced, scenario, 'cut', 'protectOil');
    expect(braced.run?.sceneId).toBe('paid');
    expect(sceneText(scenario.scenes.paid, braced)).toMatch(/food, lamp oil, and timber wedges together/i);
    expect(sceneText(scenario.scenes.paid, braced)).not.toMatch(/wedges remain for a later trip/i);

    let splitLoad = fresh(scenario);
    splitLoad = take(splitLoad, scenario, 'cart', 'reduceLoad');
    splitLoad = take(splitLoad, scenario, 'cut', 'deliverEssentials');
    expect(sceneText(scenario.scenes.paid, splitLoad)).toMatch(/food and lamp oil; the timber wedges remain for a later trip/i);
    expect(sceneText(scenario.scenes.paid, splitLoad)).not.toMatch(/wedges together/i);

    let relay = fresh(scenario);
    relay = take(relay, scenario, 'cart', 'relaySmallLoads');
    relay = take(relay, scenario, 'cut', 'carryFood');
    expect(relay.run?.sceneId).toBe('partial');
    expect(sceneText(scenario.scenes.partial, relay)).toMatch(/second trip/i);

    const legacy = fresh(scenario);
    legacy.run!.sceneId = 'paid';
    expect(sceneText(scenario.scenes.paid, legacy)).toMatch(/does not establish whether or when the timber wedges reached/i);
    expect(sceneText(scenario.scenes.paid, legacy)).not.toMatch(/wedges together|remain for a later trip/i);
  });

  it('acquires the Cargo Balance Scale only through explicit release and preserves pending placement across save/resume', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-third-trip')!;
    let state = fresh(scenario);
    state = take(state, scenario, 'complete', 'scale');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('cargoBalanceScale');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.run?.scenarioId).toBe(scenario.id);
    state = finishRewardResolution(placeReward(state, 'cargoBalanceScale', 'carry'));
    expect(getCarriedItems(state.character)).toContain('cargoBalanceScale');
    expect(state.itemStates?.cargoBalanceScale?.provenance.join(' ')).toContain('Given by surveyor Vale');
  });

  it('makes the new scale useful without letting it replace evidence or route judgment', () => {
    const weighed = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'weighed-before-dawn')!;
    expect(weighed.scenes.yard.choices.find(({ id }) => id === 'weighLoads')?.requirements).toEqual({ items: ['cargoBalanceScale'], usableItems: ['cargoBalanceScale'] });
    const crates = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'two-crates-short')!;
    expect(crates.scenes.manifest.choices.find(({ id }) => id === 'weighSealed')?.requirements).toEqual({ items: ['cargoBalanceScale'], usableItems: ['cargoBalanceScale'] });
    expect(crates.scenes.siding.text).toMatch(/not stolen/i);
  });

  it('keeps the scale-only Two Crates Short route from inventing copied marks or a crate location', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'two-crates-short')!;
    const scaleOnly = fresh(scenario);
    scaleOnly.run!.inventory.push('cargoBalanceScale');
    let weighed = take(scaleOnly, scenario, 'manifest', 'weighSealed');
    const weighedText = sceneText(scenario.scenes.marks, weighed);
    expect(weighedText).toMatch(/weighed, but that does not establish/i);
    expect(weighedText).not.toMatch(/chalk marks were copied|crate.*under the platform ramp/i);
    expect(meets(scenario.scenes.marks.choices.find(({ id }) => id === 'secureIt')?.requirements, weighed)).toBe(true);
    weighed = take(weighed, scenario, 'marks', 'secureIt');
    expect(sceneText(scenario.scenes.siding, weighed)).toMatch(/medical crate is under the ramp/i);

    let waybill = fresh(scenario);
    waybill = take(waybill, scenario, 'manifest', 'checkWaybill');
    expect(sceneText(scenario.scenes.marks, waybill)).toMatch(/chalk marks were copied/i);
    expect(sceneText(scenario.scenes.marks, waybill)).not.toMatch(/crate.*under the platform ramp/i);
    expect(meets(scenario.scenes.marks.choices.find(({ id }) => id === 'secureIt')?.requirements, waybill)).toBe(true);
    waybill = take(waybill, scenario, 'marks', 'secureIt');
    expect(sceneText(scenario.scenes.siding, waybill)).toMatch(/medical crate is under the ramp/i);

    const legacy = fresh(scenario);
    legacy.run!.sceneId = 'marks';
    expect(sceneText(scenario.scenes.marks, legacy)).toMatch(/location remains unknown/i);
    expect(sceneText(scenario.scenes.marks, legacy)).not.toMatch(/chalk marks were copied|crate.*under the platform ramp/i);
  });

  it('ties Empty Camp Office settlement credit to the shared signal-and-wait action, not book security', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-empty-camp-office')!;
    for (const [officeChoice, booksSecured] of [['secureBooks', true], ['leaveMessage', false]] as const) {
      let state = fresh(scenario);
      state = take(state, scenario, 'office', officeChoice);
      expect(state.run?.flags).toContain(booksSecured ? 'office_books_secured' : 'office_signal_set');
      if (!booksSecured) expect(state.run?.flags).not.toContain('office_books_secured');
      state = take(state, scenario, 'signal', 'waitCrew');
      const text = sceneText(scenario.scenes.paid, state);
      expect(text).toMatch(/waiting at the office with a visible signal/i);
      expect(text).toMatch(/respecting the sealed message/i);
      expect(text).not.toMatch(/for securing the working records/i);
      expect(scenario.scenes.paid.choices.map(({ id }) => id)).toEqual(['tube', 'coin']);
    }
  });

  it('does not say every Three Crews task is complete after any single successful allocation route', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'three-crews-one-tool')!;
    const routes = [
      [['board', 'stoveFirst'], ['cook', 'record']],
      [['board', 'bridgeFirst'], ['bridge', 'borrow']],
      [['board', 'measureFirst'], ['survey', 'correct']],
    ] as const;

    for (const route of routes) {
      let state = fresh(scenario);
      for (const [sceneId, choiceId] of route) state = take(state, scenario, sceneId, choiceId);
      expect(state.run?.sceneId).toBe('finish');
      const text = sceneText(scenario.scenes.finish, state);
      expect(text).toMatch(/work handled on this route is resolved/i);
      expect(text).toMatch(/anything still waiting stays on the board/i);
      expect(text).not.toMatch(/all three tasks are completed|every task is complete/i);
    }
  });

  it('keeps Cache Ledger rewards and outcomes truthful when supplies were taken', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-cache-ledger')!;
    let preserved = fresh(scenario);
    preserved = take(preserved, scenario, 'cache', 'inspectMarks');
    preserved = take(preserved, scenario, 'evidence', 'notifyCrew');
    expect(scenario.scenes.paid.choices.filter((choice) => meets(choice.requirements, preserved)).map(({ id }) => id)).toEqual(['marker', 'coins']);
    expect(sceneText(scenario.scenes.paid, preserved)).toMatch(/bringing the cache question to them/i);

    let used = fresh(scenario);
    used = take(used, scenario, 'cache', 'takeWhatRemains');
    used = take(used, scenario, 'shortage', 'follow');
    expect(used.run?.flags).toContain('cache_resealed');
    const cacheStorage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(used, cacheStorage as never);
    used = loadSave(cacheStorage as never);
    expect(used.run?.sceneId).toBe('paid');
    const moneyBeforeStockReport = used.character?.money;
    expect(scenario.scenes.paid.choices.filter((choice) => meets(choice.requirements, used)).map(({ id }) => id)).toEqual(['reportUse']);
    expect(sceneText(scenario.scenes.paid, used)).toMatch(/cloth and tinder helped the camp/i);
    used = take(used, scenario, 'paid', 'reportUse');
    expect(sceneText(scenario.scenes.usedStockReport, used)).toMatch(/without a reward for preserving stock/i);
    expect(used.character?.money).toBe(moneyBeforeStockReport);
    expect(used.run?.inventory).not.toContain('foldingTrailMarker');

    let stopped = fresh(scenario);
    stopped = take(stopped, scenario, 'cache', 'takeWhatRemains');
    stopped = take(stopped, scenario, 'shortage', 'stop');
    expect(sceneText(scenario.scenes.partial, stopped)).toMatch(/cloth and tinder helped the camp/i);
    expect(sceneText(scenario.scenes.partial, stopped)).not.toMatch(/no cache goods are claimed/i);
  });

  it('keeps Canvas Over the Crate findings limited to routes that inspected the packing', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-canvas-over-the-crate')!;
    let inspected = fresh(scenario);
    inspected = take(inspected, scenario, 'shed', 'raiseCase');
    inspected = take(inspected, scenario, 'inspection', 'delay');
    expect(sceneText(scenario.scenes.paid, inspected)).toMatch(/missing brass fitting is found/i);

    let transported = fresh(scenario);
    transported = take(transported, scenario, 'shed', 'carryOut');
    transported = take(transported, scenario, 'risk', 'wait');
    expect(sceneText(scenario.scenes.paid, transported)).toMatch(/case stays dry/i);
    expect(sceneText(scenario.scenes.paid, transported)).not.toMatch(/fitting is found/i);

    let carriedToShed = fresh(scenario);
    carriedToShed = take(carriedToShed, scenario, 'shed', 'carryOut');
    carriedToShed = take(carriedToShed, scenario, 'risk', 'carry');
    expect(sceneText(scenario.scenes.partial, carriedToShed)).toMatch(/survey does not proceed from the current setup/i);
    expect(sceneText(scenario.scenes.partial, carriedToShed)).not.toMatch(/measurement limitation/i);
  });

  it('does not claim the ferry box was borrowed on The Paper Tube routes that never used it', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-paper-tube')!;
    let deckRoute = fresh(scenario);
    deckRoute = take(deckRoute, scenario, 'packet', 'wrapTube');
    deckRoute = take(deckRoute, scenario, 'transfer', 'holdLine');
    deckRoute = take(deckRoute, scenario, 'paid', 'wage');
    expect(deckRoute.run?.sceneId).toBe('coinEnd');
    expect(sceneText(scenario.scenes.coinEnd, deckRoute)).not.toMatch(/return the borrowed ferry box/i);
    expect(deckRoute.character?.money).toBe(2);

    let lockerRoute = fresh(scenario);
    lockerRoute = take(lockerRoute, scenario, 'packet', 'useLocker');
    lockerRoute = take(lockerRoute, scenario, 'locker', 'returnBox');
    expect(sceneText(scenario.scenes.locker, lockerRoute)).toMatch(/returned before the next crossing/i);
    lockerRoute = take(lockerRoute, scenario, 'paid', 'wage');
    expect(sceneText(scenario.scenes.coinEnd, lockerRoute)).not.toMatch(/return the borrowed ferry box/i);
  });

  it('limits Empty Feed Sack resupply rewards to the route that sent a runner', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-empty-feed-sack')!;
    let resupplied = fresh(scenario);
    resupplied = take(resupplied, scenario, 'feed', 'rest');
    resupplied = take(resupplied, scenario, 'wait', 'receive');
    expect(sceneText(scenario.scenes.paid, resupplied)).toMatch(/runner returns with the farm’s measured feed bundle/i);
    expect(scenario.scenes.paid.choices.filter((choice) => meets(choice.requirements, resupplied)).map(({ id }) => id)).toEqual(['whistle', 'coin']);

    let rationOnly = fresh(scenario);
    rationOnly = take(rationOnly, scenario, 'feed', 'divide');
    rationOnly = take(rationOnly, scenario, 'move', 'restMule');
    expect(rationOnly.run?.flags).not.toContain('feed_runner_sent');
    const moneyBeforeNoResupply = rationOnly.character?.money;
    expect(sceneText(scenario.scenes.paid, rationOnly)).toMatch(/no runner or farm resupply has arrived/i);
    expect(scenario.scenes.paid.choices.filter((choice) => meets(choice.requirements, rationOnly)).map(({ id }) => id)).toEqual(['closeRationPlan']);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(rationOnly, storage as never);
    rationOnly = loadSave(storage as never);
    expect(scenario.scenes.paid.choices.filter((choice) => meets(choice.requirements, rationOnly)).map(({ id }) => id)).toEqual(['closeRationPlan']);
    rationOnly = take(rationOnly, scenario, 'paid', 'closeRationPlan');
    expect(sceneText(scenario.scenes.rationManaged, rationOnly)).toMatch(/no farm runner or new feed has reached/i);
    expect(rationOnly.character?.money).toBe(moneyBeforeNoResupply);
    expect(rationOnly.run?.inventory).not.toContain('farmWhistle');
  });

  it('renders Return Wagon delivery order from the route actually chosen', () => {
    const scenario = EXPEDITION_LOGISTICS_GENRE_BATCH.find(({ id }) => id === 'the-wheel-of-the-return-wagon')!;

    let samplesFirst = fresh(scenario);
    samplesFirst = take(samplesFirst, scenario, 'return', 'samplesFirst');
    samplesFirst = take(samplesFirst, scenario, 'check', 'guardSamples');
    expect(sceneText(scenario.scenes.paid, samplesFirst)).toMatch(/pump is delivered later/i);

    let pumpFirst = fresh(scenario);
    pumpFirst = take(pumpFirst, scenario, 'return', 'pumpFirst');
    pumpFirst = take(pumpFirst, scenario, 'check', 'handCarryPump');
    expect(sceneText(scenario.scenes.paid, pumpFirst)).toMatch(/hand-carry the pump .* first/i);
    expect(sceneText(scenario.scenes.paid, pumpFirst)).not.toMatch(/pump is delivered later/i);

    let split = fresh(scenario);
    split.run!.inventory.push('packFrame');
    split = take(split, scenario, 'return', 'splitEvenly');
    split = take(split, scenario, 'check', 'rebalance');
    expect(sceneText(scenario.scenes.paid, split)).toMatch(/rebalanced across carriers/i);
    expect(sceneText(scenario.scenes.paid, split)).not.toMatch(/pump is delivered later/i);

    const legacy = fresh(scenario);
    legacy.run!.sceneId = 'paid';
    expect(sceneText(scenario.scenes.paid, legacy)).toMatch(/return load is accounted for at a safe pace/i);
    expect(sceneText(scenario.scenes.paid, legacy)).not.toMatch(/pump is delivered later/i);
  });
});
