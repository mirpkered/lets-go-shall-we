import { describe, expect, it } from 'vitest';
import { ITEMS } from '../items';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { ESCORT_NARRATED_WAGE_PAYMENTS, ESCORT_PROTECTION_GENRE_BATCH } from './escortProtectionGenreBatch';

function destinations(scenario: (typeof ESCORT_PROTECTION_GENRE_BATCH)[number], sceneId: string): string[] {
  const scene = scenario.scenes[sceneId];
  return scene.choices.flatMap((choice) => [
    ...(choice.next ? [choice.next] : []),
    ...(choice.effects?.combat ? [choice.effects.combat.winNext, choice.effects.combat.lossNext] : []),
    ...(choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : []),
  ]).filter((id): id is string => Boolean(id));
}

describe('Escort / Protection genre batch', () => {
  it('registers thirty unique all-year Adventures with valid forward destinations', () => {
    expect(ESCORT_PROTECTION_GENRE_BATCH).toHaveLength(30);
    expect(SCENARIOS).toHaveLength(881);
    expect(new Set(ESCORT_PROTECTION_GENRE_BATCH.map(({ id }) => id)).size).toBe(30);
    expect(ESCORT_PROTECTION_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ESCORT_PROTECTION_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ESCORT_PROTECTION_GENRE_BATCH).warnings).toEqual([]);
    expect(ESCORT_PROTECTION_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(8);
    for (const scenario of ESCORT_PROTECTION_GENRE_BATCH) {
      const seen = new Set<string>();
      const active = new Set<string>();
      const visit = (id: string) => {
        expect(scenario.scenes[id], `${scenario.id}.${id} exists`).toBeTruthy();
        if (active.has(id)) throw new Error(`${scenario.id} contains a cycle at ${id}`);
        if (seen.has(id)) return;
        active.add(id); seen.add(id);
        const scene = scenario.scenes[id];
        expect(Boolean(scene.ending || scene.choices.length > 0), `${scenario.id}.${id} is actionable or terminal`).toBe(true);
        for (const target of destinations(scenario, id)) visit(target);
        active.delete(id);
      };
      visit(scenario.startScene);
      expect([...seen].sort(), scenario.id).toEqual(Object.keys(scenario.scenes).sort());
    }
  });

  it('keeps all authored Gear references valid and gives the stretcher grounded rescue uses', () => {
    for (const scenario of ESCORT_PROTECTION_GENRE_BATCH) {
      for (const scene of Object.values(scenario.scenes)) {
        for (const option of scene.choices) {
          for (const id of option.requirements?.items ?? []) expect(ITEMS[id], `${scenario.id}.${option.id}:${id}`).toBeTruthy();
        }
      }
    }
    expect(ITEMS.foldingFieldStretcher.inventoryClass).toBe('GEAR');
    const batchIds = new Set(ESCORT_PROTECTION_GENRE_BATCH.map(({ id }) => id));
    const callbackCount = SCENARIOS.filter(({ id }) => !batchIds.has(id)).flatMap(({ scenes }) => Object.values(scenes)
      .flatMap((scene) => scene.choices.filter(({ requirements }) => requirements?.items?.includes('foldingFieldStretcher')))).length;
    expect(callbackCount).toBeGreaterThanOrEqual(2);
  });

  it('shows the Weatherproof Cloak option only when usable Gear is carried and keeps a fresh route', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-smallpox-letter')!;
    const makeState = (item?: string): SaveData => {
      const character = newCharacter('Smallpox Letter Tester');
      if (item) { character.carriedItem = item; character.carriedItems = [item]; }
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };
    const cloak = scenario.scenes.post.choices.find(({ id }) => id === 'cloak')!;
    const freshState = makeState();
    expect(meets(cloak.requirements, freshState)).toBe(false);
    expect(scenario.scenes.post.choices.filter((choice) => meets(choice.requirements, freshState)).map(({ id }) => id)).toEqual(['ask']);
    const usableCloak = makeState('weatherproofCloak');
    expect(meets(cloak.requirements, usableCloak)).toBe(true);
    expect(scenario.scenes.post.choices.filter((choice) => meets(choice.requirements, usableCloak)).map(({ id }) => id)).toEqual(['cloak', 'ask']);
    usableCloak.itemStates = { weatherproofCloak: { condition: 'BROKEN', upgrades: [], provenance: [] } };
    expect(meets(cloak.requirements, usableCloak)).toBe(false);
    expect(scenario.scenes.post.choices.filter((choice) => meets(choice.requirements, usableCloak)).map(({ id }) => id)).toEqual(['ask']);
  });

  it('only says the doctor is clinging to a handline when the route established one', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-doctor-before-the-ford')!;
    const makeState = (withRope: boolean): SaveData => {
      const character = newCharacter('Ford Route Tester');
      if (withRope) { character.carriedItem = 'travelRope'; character.carriedItems = ['travelRope']; }
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };

    let noHandline = makeState(false);
    noHandline = choose(noHandline, scenario, scenario.scenes.departure.choices.find(({ id }) => id === 'case')!, () => 0);
    noHandline = choose(noHandline, scenario, scenario.scenes.crossing.choices.find(({ id }) => id === 'casefirst')!, () => 0);
    const noHandlineText = sceneText(scenario.scenes.caseFirst, noHandline);
    expect(noHandlineText).toMatch(/struggling to keep her footing/i);
    expect(noHandlineText).not.toMatch(/clinging to the handline/i);

    let handline = makeState(true);
    handline = choose(handline, scenario, scenario.scenes.departure.choices.find(({ id }) => id === 'rope')!, () => 0);
    handline = choose(handline, scenario, scenario.scenes.crossing.choices.find(({ id }) => id === 'casefirst')!, () => 0);
    const handlineText = sceneText(scenario.scenes.caseFirst, handline);
    expect(handline.run?.flags).toContain('doctor_rope_line');
    expect(handlineText).toMatch(/clinging to the handline/i);
  });

  it('lets a carried Telegraph Line Tester confirm continuity from firm ground, but not pole safety', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-telegraph-repair-car')!;
    const makeState = (carried: boolean, bank: string[] = []) => {
      const character = newCharacter('Telegraph Tester');
      if (carried) { character.carriedItem = 'telegraphLineTester'; character.carriedItems = ['telegraphLineTester']; }
      return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
    };
    const choice = scenario.scenes.inspect.choices.find(({ id }) => id === 'tester')!;
    expect(meets(choice.requirements, makeState(false))).toBe(false);
    expect(meets(choice.requirements, makeState(false, ['telegraphLineTester']))).toBe(false);
    const carried = makeState(true);
    expect(meets(choice.requirements, carried)).toBe(true);
    const after = choose(carried, scenario, choice, () => 0);
    expect(after.run?.sceneId).toBe('partial');
    expect(sceneText(scenario.scenes.partial, after)).toMatch(/confirms continuity.*does not make the leaning pole safe/i);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(after, storage as never);
    const resumed = loadSave(storage as never);
    expect(sceneText(scenario.scenes.partial, resumed)).toMatch(/confirms continuity.*does not make the leaning pole safe/i);
  });

  it('transfers the crew stretcher only after the traveler accepts it as a retired spare', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-lumber-crew-at-the-gully')!;
    const character = newCharacter('Stretcher Tester');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const borrow = scenario.scenes.gully.choices.find(({ id }) => id === 'crewStretcher')!;
    state = choose(state, scenario, borrow, () => 0);
    expect(state.run?.sceneId).toBe('rescue');
    expect(getCarriedItems(state.character)).not.toContain('foldingFieldStretcher');
    const accept = scenario.scenes.rescue.choices.find(({ id }) => id === 'acceptCrewStretcher')!;
    state = choose(state, scenario, accept, () => 0);
    expect(state.run?.sceneId).toBe('workerSafe');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldStretcher');
    state = finishRewardResolution(placeReward(state, 'foldingFieldStretcher', 'carry'));
    expect(getCarriedItems(state.character)).toContain('foldingFieldStretcher');
    expect(state.character?.historyFlags).toContain('received_folding_field_stretcher_from_lumber_crew');
  });

  it('does not rewrite confidential cargo contents into player knowledge', () => {
    const courier = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-courier-relay-box')!;
    expect(courier.scenes.handoff.text).toContain('not carry it onward');
    expect(courier.scenes.stable.text).not.toMatch(/the letter says|the document reveals/i);
    expect(courier.scenes.breach.text).toContain('refuses to break');
  });

  it('grants each narrated escort wage only on its paid ending route, once, and preserves existing reward choices', () => {
    let routeCount = 0;
    for (const [scenarioId, endings] of Object.entries(ESCORT_NARRATED_WAGE_PAYMENTS)) {
      const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
      for (const [endingId, amount] of Object.entries(endings)) {
        const incoming = Object.values(scenario.scenes).flatMap((scene) => scene.choices
          .filter(({ next }) => next === endingId).map((choice) => ({ scene, choice })));
        expect(incoming.length, `${scenarioId}.${endingId} has a direct paid route`).toBeGreaterThan(0);
        for (const { scene, choice } of incoming) {
          routeCount++;
          expect(choice.effects?.money, `${scenarioId}.${scene.id}.${choice.id}`).toBe(amount);
          const character = newCharacter('Wage Route Tester');
          const requiredItems = choice.requirements?.items ?? [];
          character.carriedItems = [...requiredItems];
          character.carriedItem = requiredItems[0] ?? null;
          let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
          state.run!.sceneId = scene.id;
          state = choose(state, scenario, choice, () => 0);
          expect(state.character?.money, `${scenarioId}.${scene.id}.${choice.id} pays ${amount}`).toBe(amount);
          const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
          saveGame(state, storage as never);
          expect(loadSave(storage as never).character?.money).toBe(amount);
        }
      }
    }
    expect(Object.keys(ESCORT_NARRATED_WAGE_PAYMENTS)).toHaveLength(20);
    expect(routeCount).toBeGreaterThan(20);
    const noWage = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-wagon-with-the-lame-wheel')!;
    for (const [sceneId, choiceId] of [['repair', 'stop'], ['unload', 'all']] as const) {
      const choice = noWage.scenes[sceneId].choices.find(({ id }) => id === choiceId)!;
      expect(choice.next).toBe('wait');
      expect(choice.effects?.money ?? 0).toBe(0);
      const character = newCharacter('Unpaid Route Tester');
      const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, noWage, () => 0) };
      state.run!.sceneId = sceneId;
      expect(choose(state, noWage, choice, () => 0).character?.money).toBe(0);
    }
    const twoCoinFee = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-quiet-coffin-cart')!;
    expect(twoCoinFee.scenes.brake.choices.find(({ id }) => id === 'steady')?.effects?.money).toBe(2);
    const excludedCrewPayment = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-fence-at-crow-road')!;
    expect(excludedCrewPayment.scenes.fight.text).toContain('pays the crew');
    expect(excludedCrewPayment.scenes.fight.choices).toHaveLength(0);
  });

  it('pays the Pay Carriage base wage on both combat outcomes without stacking direct-route pay', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-pay-carriage-at-dusk')!;
    const makeState = (sceneId: string): SaveData => {
      const character = newCharacter('Payroll Escort Tester');
      const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
      state.run!.sceneId = sceneId;
      return state;
    };
    const signal = choose(makeState('stop'), scenario, scenario.scenes.stop.choices.find(({ id }) => id === 'signal')!, () => 0);
    const farmTrack = choose(makeState('clause'), scenario, scenario.scenes.clause.choices.find(({ id }) => id === 'turn')!, () => 0);
    const wonFight = choose(makeState('stop'), scenario, scenario.scenes.stop.choices.find(({ id }) => id === 'fight')!, () => 0);
    const withdrew = choose(makeState('stop'), scenario, scenario.scenes.stop.choices.find(({ id }) => id === 'fight')!, () => 0.999999);

    expect([signal.character?.money, farmTrack.character?.money, wonFight.character?.money, withdrew.character?.money]).toEqual([3, 3, 3, 3]);
    expect(wonFight.run?.sceneId).toBe('arrival');
    expect(withdrew.run?.sceneId).toBe('withdraw');
    expect(sceneText(scenario.scenes.withdraw, withdrew)).toContain('withholds the danger bonus');
    for (const state of [wonFight, withdrew]) {
      const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
      saveGame(state, storage as never);
      expect(loadSave(storage as never).character?.money).toBe(3);
    }
  });

  it('keeps hoof treatment, instrument custody, and medicine transport tied to their routes', () => {
    const fresh = (scenario: (typeof ESCORT_PROTECTION_GENRE_BATCH)[number], gear?: string): SaveData => {
      const character = newCharacter('Route Truth Tester');
      if (gear) { character.carriedItem = gear; character.carriedItems = [gear]; }
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };
    const pick = (state: SaveData, scenario: (typeof ESCORT_PROTECTION_GENRE_BATCH)[number], sceneId: string, choiceId: string): SaveData => {
      const option = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId)!;
      expect(option, `${scenario.id}.${sceneId}.${choiceId}`).toBeTruthy();
      expect(meets(option.requirements, state), `${scenario.id}.${sceneId}.${choiceId} requirements`).toBe(true);
      return choose(state, scenario, option, () => 0);
    };

    const farrier = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-horse-for-the-farrier')!;
    let eased = pick(fresh(farrier, 'heavyLeatherGloves'), farrier, 'street', 'gloves');
    eased = pick(eased, farrier, 'hoof', 'ease');
    expect(sceneText(farrier.scenes.arrived, eased)).not.toMatch(/farrier removes the stone/i);
    expect(sceneText(farrier.scenes.arrived, eased)).toMatch(/checks the hoof.*shoe needs resetting/i);
    let pendingStone = pick(fresh(farrier), farrier, 'street', 'lead');
    pendingStone = pick(pendingStone, farrier, 'lane', 'ask');
    expect(sceneText(farrier.scenes.arrived, pendingStone)).not.toMatch(/farrier removes the stone/i);
    expect(sceneText(farrier.scenes.arrived, pendingStone)).toMatch(/checks the hoof/i);

    const survey = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-missing-survey-case')!;
    let peopleFirst = pick(fresh(survey), survey, 'cut', 'workers');
    peopleFirst = pick(peopleFirst, survey, 'evacuate', 'call');
    expect(peopleFirst.run?.sceneId).toBe('partialNoCase');
    expect(sceneText(survey.scenes.partialNoCase, peopleFirst)).toMatch(/case remains below the threatened cut.*condition and recovery are not established/i);
    expect(sceneText(survey.scenes.partialNoCase, peopleFirst)).not.toMatch(/case reaches the track/i);
    let caseMoved = pick(fresh(survey, 'freightmansStrap'), survey, 'cut', 'case');
    caseMoved = pick(caseMoved, survey, 'cart', 'roll');
    expect(caseMoved.run?.sceneId).toBe('partial');
    expect(sceneText(survey.scenes.partial, caseMoved)).toMatch(/case reaches the track, scratched but usable/i);

    const medicine = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-last-mile-of-the-medicine-wagon')!;
    const testedSpan = pick(fresh(medicine, 'collapsibleSoundingRod'), medicine, 'bridge', 'cross');
    expect(testedSpan.run?.sceneId).toBe('test');
    expect(sceneText(medicine.scenes.test, testedSpan)).toMatch(/medicine remains with the driver.*patient waits.*no alternate transport/i);
    expect(sceneText(medicine.scenes.test, testedSpan)).not.toMatch(/farm cart takes the medicine/i);
    let transferred = pick(fresh(medicine), medicine, 'bridge', 'wagon');
    transferred = pick(transferred, medicine, 'load', 'transfer');
    expect(transferred.run?.sceneId).toBe('delivered');
    expect(sceneText(medicine.scenes.delivered, transferred)).toMatch(/farm cart takes the medicine to the patient/i);
  });

  it('does not import the neighboring loose-ewe intervention into a lamb-only watch', () => {
    const scenario = ESCORT_PROTECTION_GENRE_BATCH.find(({ id }) => id === 'the-watch-at-the-sheepfold')!;
    const start = (gear?: string): SaveData => {
      const character = newCharacter('Sheepfold Route Tester');
      if (gear) { character.carriedItem = gear; character.carriedItems = [gear]; }
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };
    const pick = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      const option = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId)!;
      expect(option, `${sceneId}.${choiceId}`).toBeTruthy();
      expect(meets(option.requirements, state), `${sceneId}.${choiceId} requirements`).toBe(true);
      return choose(state, scenario, option, () => 0);
    };

    let lambOnly = pick(start(), 'fold', 'stay');
    lambOnly = pick(lambOnly, 'approach', 'lamb');
    expect(lambOnly.run?.sceneId).toBe('lambSafe');
    expect(sceneText(scenario.scenes.lambSafe, lambOnly)).toMatch(/lamb is back with its mother/i);
    expect(sceneText(scenario.scenes.lambSafe, lambOnly)).not.toMatch(/neighbor secures the loose ewe/i);
    expect(sceneText(scenario.scenes.lambSafe, lambOnly)).toMatch(/no neighboring loose-ewe intervention/i);

    let neighborRoute = pick(start('farmWhistle'), 'fold', 'answer');
    neighborRoute = pick(neighborRoute, 'response', 'open');
    expect(neighborRoute.run?.sceneId).toBe('safe');
    expect(sceneText(scenario.scenes.safe, neighborRoute)).toMatch(/neighbor secures the loose ewe/i);
  });
});
