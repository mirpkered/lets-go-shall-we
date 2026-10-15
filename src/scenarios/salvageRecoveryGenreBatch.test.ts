import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemState, meets, newCharacter, openRewardResolution, placeReward, sceneText, setItemCondition, startRun } from '../engine';
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
  const firstAvailable = scenario.scenes.arrival.choices.find((choice) => meets(choice.requirements, state));
  expect(firstAvailable, `${scenario.id} fresh-arrival fallback`).toBeTruthy();
  state = act(state, scenario, firstAvailable!.id);
  state = act(state, scenario, 'traceOwnership');
  return state;
}
function beginFresh(scenario: (typeof SALVAGE_RECOVERY_GENRE_BATCH)[number], state = initial(scenario)): SaveData {
  const firstAvailable = scenario.scenes.arrival.choices.find((choice) => meets(choice.requirements, state));
  expect(firstAvailable, `${scenario.id} fresh-arrival fallback`).toBeTruthy();
  return act(state, scenario, firstAvailable!.id);
}

describe('Salvage / Recovery / Reclamation genre batch', () => {
  it('gates named personal tools, rejects broken tools, and preserves explicit site-supplied equipment', () => {
    const toolbox = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-silted-toolbox')!;
    const ropeChoice = toolbox.scenes.arrival.choices.find(({ id }) => id === 'carefulAccess')!;
    const rodChoice = toolbox.scenes.arrival.choices.find(({ id }) => id === 'verifyFirst')!;
    expect(meets(ropeChoice.requirements, initial(toolbox))).toBe(false);
    expect(meets(rodChoice.requirements, initial(toolbox))).toBe(false);
    expect(meets(ropeChoice.requirements, initial(toolbox, 'travelRope'))).toBe(true);
    expect(meets(ropeChoice.requirements, setItemCondition(initial(toolbox, 'travelRope'), 'travelRope', 'BROKEN'))).toBe(false);
    expect(toolbox.scenes.arrival.choices.some((choice) => meets(choice.requirements, initial(toolbox)))).toBe(true);

    const quarry = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-quarry-winch')!;
    const stagedBlock = quarry.scenes.arrival.choices[0];
    expect(stagedBlock.requirements).toBeUndefined();
    expect(meets(stagedBlock.requirements, initial(quarry))).toBe(true);
  });
  it('registers 24 distinct all-year Adventures with valid destinations and no duplicate IDs', () => {
    expect(SALVAGE_RECOVERY_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
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
      let eligible = decision(scenario);
      if (scenario.id === 'the-missing-pack-frame') {
        const ordinaryRoute = decision(scenario);
        expect(meets(offer.requirements, ordinaryRoute), 'frame reward is unavailable without the qualifying recovery').toBe(false);
        eligible = act(initial(scenario, 'travelRope'), scenario, 'verifyFirst');
        eligible = act(eligible, scenario, 'secureRecovery');
      } else if (scenario.id === 'the-station-yard-heap') {
        const ownerTraceOnly = decision(scenario);
        expect(meets(offer.requirements, ownerTraceOnly), 'wrench release is unavailable until the borrowed gauge is returned').toBe(false);
        eligible = beginFresh(scenario);
        eligible = act(eligible, scenario, 'secureRecovery');
      } else if (scenario.id === 'the-siding-spill') {
        eligible = act(initial(scenario), scenario, 'holdAndAsk');
        eligible = act(eligible, scenario, 'secureRecovery');
      } else if (scenario.id === 'the-iron-at-milepost-nine') {
        eligible = act(initial(scenario), scenario, 'verifyFirst');
        eligible = act(eligible, scenario, 'secureRecovery');
      } else if (scenario.id === 'the-lost-lantern-crate') {
        eligible = act(initial(scenario), scenario, 'holdAndAsk');
        eligible = act(eligible, scenario, 'secureRecovery');
      }
      expect(meets(offer.requirements, eligible), `${scenario.id} qualifying route`).toBe(true);
      let state = act(eligible, scenario, 'acceptReleasedGear');
      expect(state.character?.money).toBe(5 - (offer.effects?.money ? -offer.effects.money : 0));
      expect(state.run?.inventorySources?.[id]).toBe('found');
      expect(itemState(state, id).provenance).toContain(offer.effects!.gainItemProvenance![id]);
      if (offer.effects?.gainItemConditions?.[id]) expect(itemState(state, id).condition).toBe(offer.effects.gainItemConditions[id]);
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems).toContain(id);
      state = finishRewardResolution(placeReward(state, id, 'carry'));
      if (scenario.id !== 'the-missing-pack-frame') expect(getCarriedItems(state.character)).toContain(id);
      else expect(state.run?.inventory).toContain(id);
    }
  });

  it('requires the borrowed track-gauge handoff before releasing the station-yard wrench', () => {
    const heap = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-station-yard-heap')!;
    const offer = heap.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(heap.scenes.evidence.choices.find(({ id }) => id === 'secureRecovery')?.label).toMatch(/return the borrowed track gauge/i);

    for (const approach of heap.scenes.arrival.choices) {
      let traced = act(initial(heap), heap, approach.id);
      expect(sceneText(heap.scenes.evidence, traced)).toMatch(/borrowed track gauge is uncovered beneath the wrench/i);
      traced = act(traced, heap, 'traceOwnership');
      expect(sceneText(heap.scenes.decision, traced)).toMatch(/does not return the buried gauge/i);
      expect(meets(offer.requirements, traced)).toBe(false);
    }

    let returned = beginFresh(heap);
    returned = act(returned, heap, 'secureRecovery');
    expect(returned.run?.flags).toContain('the-station-yard-heap_limited_recovery');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(returned, storage as never);
    returned = loadSave(storage as never);
    expect(sceneText(heap.scenes.decision, returned)).toMatch(/return the borrowed track gauge to railway stores/i);
    expect(sceneText(heap.scenes.decision, returned)).toMatch(/return condition is met/i);
    expect(meets(offer.requirements, returned)).toBe(true);

    let challenged = beginFresh(heap);
    challenged = act(challenged, heap, 'standGround', () => 0);
    challenged = act(challenged, heap, 'resumeRecovery');
    expect(sceneText(heap.scenes.decision, challenged)).not.toContain('You return the borrowed track gauge to railway stores.');
    expect(meets(offer.requirements, challenged)).toBe(false);
  });

  it('requires the held-cart case return before releasing the siding duplicate rod', () => {
    const siding = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-siding-spill')!;
    const secure = siding.scenes.evidence.choices.find(({ id }) => id === 'secureRecovery')!;
    const offer = siding.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(secure.label).toMatch(/return the listed case/i);

    for (const approach of siding.scenes.arrival.choices.filter(({ id }) => id !== 'holdAndAsk')) {
      let state = act(initial(siding, approach.requirements?.items?.[0]), siding, approach.id);
      expect(meets(secure.requirements, state), approach.id).toBe(false);
      state = act(state, siding, 'traceOwnership');
      expect(meets(offer.requirements, state), approach.id).toBe(false);
      state = act(state, siding, 'takeFee');
      expect(sceneText(siding.scenes.paid, state)).toMatch(/does not establish that the listed case was returned/i);
    }

    let returned = act(initial(siding), siding, 'holdAndAsk');
    expect(sceneText(siding.scenes.evidence, returned)).toMatch(/worker steadies the cart/i);
    returned = act(returned, siding, 'secureRecovery');
    expect(sceneText(siding.scenes.decision, returned)).toMatch(/return the listed case unopened/i);
    expect(sceneText(siding.scenes.decision, returned)).toMatch(/confirms the separate trackside rod is a duplicate/i);
    expect(meets(offer.requirements, returned)).toBe(true);
    returned = act(returned, siding, 'acceptReleasedGear');
    expect(returned.run?.inventory).toContain('collapsibleSoundingRod');
  });

  it('requires foreman-led safe shoring and lamp return before releasing the damaged washout lantern', () => {
    const washout = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-lost-lantern-crate')!;
    const secure = washout.scenes.evidence.choices.find(({ id }) => id === 'secureRecovery')!;
    const offer = washout.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(secure.label).toMatch(/shore the shelf.*return the three serviceable lamps/i);

    for (const approach of washout.scenes.arrival.choices.filter(({ id }) => id !== 'holdAndAsk')) {
      let state = act(initial(washout, approach.requirements?.items?.[0]), washout, approach.id);
      const routeText = sceneText(washout.scenes.evidence, state);
      if (approach.id === 'carefulAccess') expect(routeText).toMatch(/larger shelf still shifts and must not be entered/i);
      if (approach.id === 'verifyFirst') expect(routeText).toMatch(/without requiring anyone to climb down/i);
      expect(meets(secure.requirements, state), approach.id).toBe(false);
      state = act(state, washout, 'traceOwnership');
      expect(sceneText(washout.scenes.decision, state)).toMatch(/does not stabilize the bank or return the serviceable lamps/i);
      expect(meets(offer.requirements, state), approach.id).toBe(false);
      state = act(state, washout, 'takeFee');
      expect(sceneText(washout.scenes.paid, state)).toMatch(/lantern is not transferred/i);
    }

    let secured = act(initial(washout), washout, 'holdAndAsk');
    expect(sceneText(washout.scenes.evidence, secured)).toMatch(/foreman marks the intact lamps for return/i);
    secured = act(secured, washout, 'secureRecovery');
    expect(sceneText(washout.scenes.decision, secured)).toMatch(/crew shores the exposed shelf from the stable road/i);
    expect(sceneText(washout.scenes.decision, secured)).toMatch(/returns them to the county/i);
    expect(meets(offer.requirements, secured)).toBe(true);

    const storage = { value:'', setItem(_key:string, value:string) { this.value=value; }, getItem(_key:string) { return this.value; } };
    saveGame(secured, storage as never);
    secured = loadSave(storage as never);
    expect(meets(offer.requirements, secured)).toBe(true);
    secured = act(secured, washout, 'acceptReleasedGear');
    expect(secured.run?.inventory).toContain('roadmansLantern');
    expect(itemState(secured, 'roadmansLantern').condition).toBe('DAMAGED');
  });

  it('releases the milepost wedge only after the signed county clearance route and return action', () => {
    const milepost = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-iron-at-milepost-nine')!;
    const secure = milepost.scenes.evidence.choices.find(({ id }) => id === 'secureRecovery')!;
    const offer = milepost.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(secure.label).toMatch(/signed.*clearance/i);

    for (const approach of milepost.scenes.arrival.choices.filter(({ id }) => id !== 'verifyFirst')) {
      let state = act(initial(milepost, approach.requirements?.items?.[0]), milepost, approach.id);
      expect(meets(secure.requirements, state), approach.id).toBe(false);
      state = act(state, milepost, 'traceOwnership');
      expect(meets(offer.requirements, state), approach.id).toBe(false);
      state = act(state, milepost, 'takeFee');
      expect(sceneText(milepost.scenes.paid, state)).toMatch(/establishes no equipment transfer/i);
    }

    let cleared = act(initial(milepost), milepost, 'verifyFirst');
    expect(sceneText(milepost.scenes.evidence, cleared)).toMatch(/county-signed notice/i);
    cleared = act(cleared, milepost, 'secureRecovery');
    expect(sceneText(milepost.scenes.decision, cleared)).toMatch(/signed ditch-clearance notice identifies the unmarked wedge as abandoned/i);
    expect(sceneText(milepost.scenes.decision, cleared)).toMatch(/return the stamped pry tool/i);
    expect(meets(offer.requirements, cleared)).toBe(true);
    cleared = act(cleared, milepost, 'acceptReleasedGear');
    expect(cleared.run?.inventory).toContain('steelWedge');
  });

  it('keeps material compensation exclusive while experience-earned Knowledge survives every resolved route', () => {
    for (const scenario of SALVAGE_RECOVERY_GENRE_BATCH) {
      const start = decision(scenario);
      const fee = act(start, scenario, 'takeFee');
      expect(fee.character?.money).toBe(start.character!.money + scenario.scenes.decision.choices.find(({ id }) => id === 'takeFee')!.effects!.money!);
      expect(fee.character?.knowledge).toContain(scenario.scenes.decision.choices.find(({id})=>id==='takeFee')!.effects!.knowledge![0]);
      expect(fee.run?.inventory).not.toContain(scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')?.effects?.gainItems?.[0]);
      const lesson = act(start, scenario, 'keepLesson');
      expect(lesson.character?.knowledge.length).toBeGreaterThan(start.character!.knowledge.length);
      expect(lesson.character?.money).toBe(start.character?.money);
      expect(lesson.run?.acquiredThisRun).toEqual([]);
      const refused = lesson;
      expect(refused.character?.money).toBe(start.character?.money);
      expect(refused.run?.acquiredThisRun).toEqual([]);
      let deferred = beginFresh(scenario);
      deferred = act(deferred, scenario, 'deferRecovery');
      expect(deferred.run?.sceneId).toBe('deferred');
      expect(deferred.character?.knowledge.length).toBeGreaterThan(0);
      expect(deferred.run?.inventory).not.toContain(scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')?.effects?.gainItems?.[0]);
    }
  });

  it('preserves recovered item condition and provenance through save/resume and reward placement', () => {
    const scenario = SALVAGE_RECOVERY_GENRE_BATCH.find(({ scenes }) => scenes.decision.choices.some(({ effects }) => effects?.gainItemConditions))!;
    const offer = scenario.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    const item = offer.effects!.gainItems![0];
    let state = scenario.id === 'the-lost-lantern-crate'
      ? act(act(initial(scenario), scenario, 'holdAndAsk'), scenario, 'secureRecovery')
      : decision(scenario);
    state = act(state, scenario, 'acceptReleasedGear');
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

  it('matches the camp rope and Bell Creek spare conditions to the exact awarded items', () => {
    const camp = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-camp-that-wasnt-empty')!;
    const campOffer = camp.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(campOffer.effects?.gainItemConditions?.travelRope).toBe('DAMAGED');
    const campAward = act(decision(camp), camp, 'acceptReleasedGear');
    expect(itemState(campAward, 'travelRope').condition).toBe('DAMAGED');

    const bell = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-bell-creek-drift')!;
    const bellOffer = bell.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
    expect(bellOffer.effects?.gainItemConditions?.freightmansStrap).toBeUndefined();
    const bellAward = act(decision(bell), bell, 'acceptReleasedGear');
    expect(itemState(bellAward, 'freightmansStrap').condition).toBe('NORMAL');
    expect(bell.scenes.decision.choices.some(({ id }) => id === 'repairOwnedGear')).toBe(true);
  });

  it('offers genuine, state-gated repairs for damaged carried tools without granting duplicates or wages', () => {
    for (const [scenarioId, item] of [['the-lost-lantern-crate','roadmansLantern'], ['the-bell-creek-drift','freightmansStrap']]) {
      const scenario = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
      let state = initial(scenario, item);
      state.itemStates = { [item]:{ condition:'DAMAGED', upgrades:[], provenance:['Older trip'] } };
      state = beginFresh(scenario, state);
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
      let state = beginFresh(scenario, start);
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

  it('preserves recovery and ownership setup in access- and decision-specific scene variants', () => {
    for (const scenario of SALVAGE_RECOVERY_GENRE_BATCH) {
      for (const access of scenario.scenes.arrival.choices) {
        const carried = access.requirements?.items?.[0];
        const entered = act(initial(scenario, carried), scenario, access.id);
        const evidence = sceneText(scenario.scenes.evidence, entered);
        expect(evidence, `${scenario.id}.${access.id}: common recovery context`).toContain(scenario.scenes.evidence.text);
        expect(evidence.split(scenario.scenes.evidence.text).length - 1, `${scenario.id}.${access.id}: setup once`).toBe(1);
        expect(scenario.scenes.evidence.choices.some(({ id }) => id === 'traceOwnership' && meets(undefined, entered)), scenario.id).toBe(true);

        for (const decisionChoice of ['traceOwnership', 'secureRecovery']) {
          const choice = scenario.scenes.evidence.choices.find(({ id }) => id === decisionChoice)!;
          const selectedId = decisionChoice === 'secureRecovery' && !meets(choice.requirements, entered) ? 'traceOwnership' : decisionChoice;
          const state = act(entered, scenario, selectedId);
          const decisionText = sceneText(scenario.scenes.decision, state);
          expect(decisionText, `${scenario.id}.${decisionChoice}: ownership/release setup`).toContain(scenario.scenes.decision.text);
          expect(decisionText.split(scenario.scenes.decision.text).length - 1, `${scenario.id}.${decisionChoice}: setup once`).toBe(1);
          expect(decisionText.length).toBeGreaterThan(scenario.scenes.decision.text.length);
          expect(scenario.scenes.decision.choices.some(({ id }) => id === 'acceptReleasedGear'), scenario.id).toBe(true);
        }
      }
    }
  });

  it('keeps the limited toolbox recovery from claiming the private chest was returned', () => {
    const story = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-silted-toolbox')!;
    let state = beginFresh(story, initial(story, 'collapsibleSoundingRod'));
    state = act(state, story, 'secureRecovery');
    state = act(state, story, 'takeFee');
    expect(state.run?.sceneId).toBe('paid');
    expect(state.run?.status).toBe('success');
    expect(sceneText(story.scenes.paid, state)).toMatch(/private carpenter’s chest is not part of this handover/i);
    expect(sceneText(story.scenes.paid, state)).not.toMatch(/return the carpenter’s marked chest/i);
  });

  it('keeps the mineshaft fee route from claiming the unidentified lower light was recovered', () => {
    const story = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-mineshaft-lamp')!;
    let state = beginFresh(story, initial(story, 'roadmansLantern'));
    state = act(state, story, 'secureRecovery');
    state = act(state, story, 'takeFee');
    expect(state.run?.sceneId).toBe('paid');
    expect(sceneText(story.scenes.paid, state)).toMatch(/lower light remains unidentified and untouched/i);
    expect(sceneText(story.scenes.paid, state)).not.toMatch(/leave both lamps/i);
  });

  it('keeps seed-tray protection and greenhouse compensation truthful across access methods', () => {
    const story = SALVAGE_RECOVERY_GENRE_BATCH.find(({ id }) => id === 'the-glasshouse-gutter')!;
    for (const [access, establishesCover, carried] of [
      ['carefulAccess', false, 'heavyLeatherGloves'],
      ['verifyFirst', true, undefined],
      ['holdAndAsk', false, 'drainageHook'],
    ] as const) {
      let state = act(initial(story, carried), story, access);
      const evidence = sceneText(story.scenes.evidence, state);
      expect(evidence, access).not.toMatch(/seed trays are covered/i);
      if (establishesCover) expect(evidence).toMatch(/sheet diverts rain from the seedlings/i);
      else expect(evidence).not.toMatch(/sheet diverts rain from the seedlings/i);

      state = act(state, story, 'secureRecovery');
      const decisionText = sceneText(story.scenes.decision, state);
      expect(decisionText).not.toMatch(/thanks for preserving the seed beds|returns the cloak to its owner/i);
      const gear = story.scenes.decision.choices.find(({ id }) => id === 'acceptReleasedGear')!;
      expect(meets(gear.requirements, state), access).toBe(true);
      state = act(state, story, 'acceptReleasedGear');
      expect(story.scenes.gear.text).toMatch(/help with the greenhouse cleanup/i);
      expect(story.scenes.gear.text).not.toMatch(/seed beds were protected|seed trays were covered/i);
    }

    let paid = beginFresh(story);
    paid = act(paid, story, 'secureRecovery');
    paid = act(paid, story, 'takeFee');
    expect(sceneText(story.scenes.paid, paid)).toMatch(/no estate equipment changes hands/i);
    expect(sceneText(story.scenes.paid, paid)).not.toMatch(/finish covering the seedlings/i);
  });
});
