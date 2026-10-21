import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { ROAD_DANGER_GENRE_BATCH } from './roadDangerGenreBatch';
import { SCENARIOS } from './index';

function initial(scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number], item?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Road Tester');
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number], choiceId: string, random: () => number = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function reachSettlement(scenario: (typeof ROAD_DANGER_GENRE_BATCH)[number]): SaveData {
  let state = initial(scenario);
  const approach = scenario.scenes.approach.choices.find((choice) => meets(choice.requirements, state))!;
  state = act(state, scenario, approach.id);
  const noncombat = scenario.scenes.threat.choices.find((choice) => choice.id.startsWith('respond_') && meets(choice.requirements, state))!;
  state = act(state, scenario, noncombat.id);
  const ending = scenario.scenes.aftermath.choices.find((choice) => meets(choice.requirements, state));
  expect(ending, `${scenario.id} has an available aftermath choice`).toBeTruthy();
  state = act(state, scenario, ending!.id);
  return state;
}

describe('Road Danger / Highwaymen genre batch', () => {
  it('registers 24 unique all-year Adventures with valid destinations and an intentionally optional combat share', () => {
    expect(ROAD_DANGER_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(881);
    expect(new Set(ROAD_DANGER_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(ROAD_DANGER_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ROAD_DANGER_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ROAD_DANGER_GENRE_BATCH).warnings).toEqual([]);
    expect(ROAD_DANGER_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(12);
    expect(ROAD_DANGER_GENRE_BATCH.filter(({ scenes }) => scenes.settlement.choices.some(({ effects }) => effects?.gainItems?.length || effects?.gainSupplies && Object.keys(effects.gainSupplies).length))).toHaveLength(20);
  });

  it('uses canonical placement for every offered Gear reward and blocks carried or Bank duplicates', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH) {
      const choice = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear');
      if (!choice) continue;
      const item = choice.effects!.gainItems?.[0] ?? Object.keys(choice.effects!.gainSupplies ?? {})[0];
      expect(['GEAR', 'SUPPLY'], scenario.title).toContain(ITEMS[item]?.inventoryClass);
      if (ITEMS[item]?.inventoryClass === 'SUPPLY') {
        const before = reachSettlement(scenario);
        const after = act(before, scenario, 'acceptGear');
        expect(after.run?.supplies?.[item]).toBe((before.run?.supplies?.[item] ?? 0) + 1);
        continue;
      }
      expect(scenario.scenes.gear.text.length, scenario.title).toBeGreaterThan(15);
      expect(meets(choice.requirements, initial(scenario, item)), `${scenario.id} carried`).toBe(false);
      expect(meets(choice.requirements, initial(scenario, undefined, [item])), `${scenario.id} Banked`).toBe(false);
      let state = act(reachSettlement(scenario), scenario, 'acceptGear');
      state = openRewardResolution(state);
      expect(state.run?.rewardPendingItems).toContain(item);
      state = finishRewardResolution(placeReward(state, item, 'carry'));
      expect(getCarriedItems(state.character)).toContain(item);
    }
  });

  it('offers exact coin payment, reusable Knowledge, and explicit refusal without silently granting Gear', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH) {
      const state = reachSettlement(scenario);
      expect(scenario.scenes.settlement.choices.some(({id})=>id==='keepLesson'),scenario.id).toBe(false);
      for(const choice of scenario.scenes.settlement.choices) expect(choice.effects?.knowledge,`${scenario.id}.${choice.id}`).toHaveLength(1);
      const coins = scenario.scenes.settlement.choices.find(({ id }) => id === 'takeCoins')!;
      const paid = act(state, scenario, coins.id);
      expect(paid.character?.money).toBe(state.character!.money + (coins.effects?.money ?? 0));
      expect(paid.character?.knowledge).toContain(coins.effects?.knowledge?.[0]);
      const declined = act(state, scenario, 'decline');
      expect(declined.run?.status).toBe('success');
      expect(declined.run?.rewardPendingItems ?? []).toEqual([]);
      expect(declined.character?.money).toBe(state.character?.money);
    }
  });

  it('keeps combat optional and routes both favorable and unfavorable confrontations to an aftermath', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')) {
      let state = initial(scenario);
      state = act(state, scenario, scenario.scenes.approach.choices.find((choice) => meets(choice.requirements, state))!.id);
      expect(scenario.scenes.threat.choices.some((choice) => choice.id.startsWith('respond_') && meets(choice.requirements, state)), scenario.id).toBe(true);
      const fight = scenario.scenes.threat.choices.find(({ id }) => id === 'fight')!;
      expect(fight).toBeTruthy();
      const won = act(state, scenario, fight.id, () => 0);
      expect(won.run?.sceneId).toBe('fightWon');
      const recovered = act(won, scenario, scenario.scenes.fightWon.choices[0].id);
      expect(recovered.run?.sceneId).toBe('aftermath');
      const lost = act(state, scenario, fight.id, () => 1);
      expect(lost.run?.sceneId).toBe('fightLost');
      expect(lost.run?.status).not.toBe('death');
    }
  });

  it('preserves pending Gear placement through save and reload', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ scenes }) => scenes.settlement.choices.some(({ id }) => id === 'acceptGear'))!;
    let state = act(reachSettlement(scenario), scenario, 'acceptGear');
    state = openRewardResolution(state);
    const item = state.run?.rewardPendingItems?.[0];
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    const reloaded = loadSave(storage as never);
    expect(reloaded.run?.scenarioId).toBe(scenario.id);
    expect(reloaded.run?.rewardPendingItems).toContain(item);
    const placed = finishRewardResolution(placeReward(reloaded, item!, 'carry'));
    expect(getCarriedItems(placed.character)).toContain(item);
  });

  it('gives each new road tool distinct uses in at least two existing non-batch Adventures', () => {
    for (const item of ['foldingCarriageJack', 'lockableMapCase', 'lanternGuard']) {
      const callbacks = SCENARIOS.filter(({ id, scenes }) => !ROAD_DANGER_GENRE_BATCH.some((road) => road.id === id))
        .flatMap(({ id, scenes }) => Object.values(scenes).flatMap((scene) => scene.choices
          .filter(({ requirements }) => requirements?.items?.includes(item)).map((choice) => `${id}.${choice.id}`)));
      expect(callbacks.length, `${item}: ${callbacks.join(', ')}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps compensation offers distinct from accepted payment and suppresses the coin-only axle Gear offer', () => {
    const axle = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-axle-without-a-mark')!;
    expect(axle.scenes.settlement.choices.map(({ id }) => id)).not.toContain('acceptGear');
    expect(axle.scenes.settlement.choices.find(({ id }) => id === 'takeCoins')?.label).toBe('Take 3 coins');
    expect(axle.scenes.settlement.text).toMatch(/three-coin.*fee/i);
    expect(axle.scenes.coins.text).toMatch(/accept 3 coins/i);
    expect(axle.scenes.coins.text).not.toMatch(/jack/i);
    const paidAxle = act(reachSettlement(axle), axle, 'takeCoins');
    expect(paidAxle.run?.sceneId).toBe('coins');
    expect(paidAxle.character?.money).toBe(3);
    expect(paidAxle.character?.carriedItems).not.toContain('foldingCarriageJack');
    const gearAlternatives = ['the-horse-with-the-blue-rope', 'the-punctured-tireless-wheel', 'the-inn-yard-watch', 'the-second-rope', 'the-cold-iron-latch'];
    for (const id of gearAlternatives) {
      const story = ROAD_DANGER_GENRE_BATCH.find((candidate) => candidate.id === id)!;
      expect(story.scenes.settlement.text, id).toMatch(/offers|or a separate|or the/i);
      expect(story.scenes.coins.text, id).toMatch(/accept \d+ coins/i);
      expect(story.scenes.coins.text, id).not.toMatch(/instead of/i);
      expect(story.scenes.unpaid.text, id).toMatch(/decline compensation/i);
    }
  });

  it('keeps the common threat introduction in every approach-specific threat scene', () => {
    for (const scenario of ROAD_DANGER_GENRE_BATCH) {
      for (const approach of scenario.scenes.approach.choices) {
        const carried = approach.requirements?.items?.[0];
        let state = initial(scenario, carried);
        state = act(state, scenario, approach.id);
        const displayed = sceneText(scenario.scenes.threat, state);
        const selectedDetail = scenario.scenes.threat.textVariants?.find(({ requirements }) => meets(requirements, state))?.text;
        expect(selectedDetail, `${scenario.id}.${approach.id}: approach consequence`).toBeTruthy();
        expect(displayed).toContain(selectedDetail);
        expect(displayed, `${scenario.id}.${approach.id}: shared threat`).toContain(scenario.scenes.threat.text);
        expect(displayed.split(scenario.scenes.threat.text).length - 1, `${scenario.id}.${approach.id}: no duplicate setup`).toBe(1);
        expect(scenario.scenes.threat.choices.some(({ id }) => id.startsWith('respond_') && meets(undefined, state)), scenario.id).toBe(true);
      }
    }
  });

  it('keeps the missing waybill case unlocated across every approach, response, ending, and combat outcome', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-rain-on-the-waybill')!;
    const approaches = ['checkSeal', 'shelterDriver', 'askStation'];
    const responses = ['keepCaseDry', 'askNumber', 'standWithDriver'];

    for (const approach of approaches) {
      const start = initial(story, approach === 'checkSeal' ? 'lockableMapCase' : undefined);
      const atThreat = act(start, story, `approach_${approach}`);
      const threat = sceneText(story.scenes.threat, atThreat);
      expect(threat).toMatch(/claims the missing waybill case is beneath the wagon/i);
      expect(threat).not.toMatch(/reaches for the wet waybill case/i);

      for (const response of responses) {
        const atAftermath = act(atThreat, story, `respond_${response}`);
        const aftermath = sceneText(story.scenes.aftermath, atAftermath);
        expect(aftermath).toMatch(/waybill case remains unlocated|case remains unaccounted|case; its location remains unknown/i);
        expect(aftermath).not.toMatch(/clerk recovers the case|case is recovered|borrowed coat is returned/i);

        for (const ending of ['carryCase', 'waitBridge']) {
          const atSettlement = act(structuredClone(atAftermath), story, `ending_${ending}`);
          const settlement = sceneText(story.scenes.settlement, atSettlement);
          expect(settlement).not.toMatch(/recovered original|recovered the case|case is recovered/i);
          expect(settlement).toMatch(/missing waybill case remains unaccounted for/i);
          const gearChoice = story.scenes.settlement.choices.find(({ id }) => id === 'acceptGear');
          if (gearChoice && meets(gearChoice.requirements, atSettlement)) {
            const withGear = act(atSettlement, story, 'acceptGear');
            expect(sceneText(story.scenes.gear, withGear)).not.toMatch(/after documenting the recovered original/i);
            expect(sceneText(story.scenes.gear, withGear)).toMatch(/original waybill case remains missing/i);
          }
        }
      }
    }

    const atThreat = act(initial(story), story, 'approach_shelterDriver');
    const won = act(atThreat, story, 'fight', () => 0);
    expect(sceneText(story.scenes.fightWon, won)).not.toMatch(/wrong issue number|case is recovered/i);
    const afterWin = act(won, story, 'checkRoad');
    expect(sceneText(story.scenes.aftermath, afterWin)).toMatch(/no route establishes.*case was recovered/i);
    const lost = act(atThreat, story, 'fight', () => 0.99);
    expect(sceneText(story.scenes.fightLost, lost)).toMatch(/no recovery of the missing waybill case is established/i);
    expect(sceneText(story.scenes.fightLost, lost)).not.toMatch(/clerk gets the case/i);
  });

  it('does not say a purse was surrendered on the lantern routes that keep it', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-lantern-in-the-hedge')!;
    for (const response of ['callHouse', 'leavePurse', 'holdGate']) {
      let state = initial(story);
      state = act(state, story, story.scenes.approach.choices.find((choice) => meets(choice.requirements, state))!.id);
      state = act(state, story, `respond_${response}`);
      const aftermath = sceneText(story.scenes.aftermath, state);
      expect(state.run?.flags).toContain(`road_response_${response}`);
      expect(aftermath).not.toMatch(/purse you surrendered|poorer by the coins surrendered/i);
      for (const ending of ['reportNight', 'leaveHedge']) {
        const ended = act(state, story, `ending_${ending}`);
        const text = sceneText(story.scenes.settlement, ended);
        expect(text).not.toMatch(/purse you surrendered|poorer by the coins surrendered/i);
      }
    }
  });

  it('keeps outside-party confirmation tied to the route that establishes it', () => {
    const aftermathFor = (id: string, approach: string, response: string) => {
      const scenario = ROAD_DANGER_GENRE_BATCH.find(({ id: candidate }) => candidate === id)!;
      let state = act(initial(scenario), scenario, `approach_${approach}`);
      state = act(state, scenario, `respond_${response}`);
      return sceneText(scenario.scenes.aftermath, state);
    };

    expect(aftermathFor('the-glass-at-milepost-nine', 'warn', 'signalStation'))
      .toMatch(/field-glass case is left behind as the station answers/i);
    for (const response of ['coverDriver', 'recordFace']) {
      expect(aftermathFor('the-glass-at-milepost-nine', 'warn', response))
        .not.toMatch(/station answers|left behind as the station/i);
    }

    for (const response of ['keepDoor', 'offerWitness', 'followAtDistance']) {
      expect(aftermathFor('the-brass-notch', 'askClerk', response))
        .not.toMatch(/foreman confirms|confirms the man was not assigned/i);
    }

    for (const [approach, response] of [['inspectPost', 'waitBank'], ['watchSkiff', 'showCut'], ['findFerryman', 'callFerryman']]) {
      expect(aftermathFor('the-ferry-chain', approach, response))
        .not.toMatch(/ferryman confirms|confirms the stranger had no claim/i);
    }

    for (const response of ['searchWrapper', 'askStablehand', 'compareReceipt']) {
      const text = aftermathFor('the-courier-who-came-back', 'askRoute', response);
      expect(text).not.toMatch(/county clerk confirms|papers were never placed in the satchel/i);
      expect(text).toMatch(/do not establish whether the county papers were packed before Penn reached the inn/i);
    }

    const paperRoad = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-paper-road')!;
    let unaffected = act(initial(paperRoad), paperRoad, 'approach_eastOffice');
    unaffected = act(unaffected, paperRoad, 'respond_stayBack');
    expect(sceneText(paperRoad.scenes.aftermath, unaffected)).not.toMatch(/Pike confirms|Pike checks the ribbon/i);
    expect(sceneText(paperRoad.scenes.aftermath, unaffected)).toMatch(/contents have not been examined/i);
  });

  it('keeps the Cold Latch loan claim tied to the work-note evidence', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-cold-iron-latch')!;
    for (const approach of ['checkWorkNotes', 'followRope', 'askNeighbor']) {
      for (const response of ['compareMarks', 'askMill', 'callFamily']) {
        let state = act(initial(story), story, `approach_${approach}`);
        state = act(state, story, `respond_${response}`);
        const text = sceneText(story.scenes.aftermath, state);
        expect(text).not.toMatch(/neighbor admits borrowing|permissioned loan/i);
        if (approach === 'checkWorkNotes') {
          expect(text).toMatch(/work note records one spade loaned/i);
          expect(text).not.toMatch(/names the borrower|neighbor borrowed/i);
        } else {
          expect(text).not.toMatch(/work note records one spade loaned/i);
        }
      }
    }

    let documented = act(initial(story), story, 'approach_checkWorkNotes');
    documented = act(documented, story, 'respond_compareMarks');
    const documentedText = sceneText(story.scenes.aftermath, documented);
    expect(documentedText).toMatch(/one spade loaned last week/i);
    expect(documentedText).not.toMatch(/neighbor admits|names the borrower|with permission/i);

    const recordLoan = story.scenes.aftermath.choices.find(({ id }) => id === 'ending_recordLoan')!;
    expect(meets(recordLoan.requirements, act(initial(story), story, 'approach_followRope'))).toBe(false);
    expect(meets(recordLoan.requirements, documented)).toBe(true);
    documented = act(documented, story, 'ending_recordLoan');
    expect(sceneText(story.scenes.settlement, documented)).not.toMatch(/neighbor signs|loan is returned/i);
    expect(sceneText(story.scenes.settlement, documented)).toMatch(/note does not name the borrower/i);
    expect(sceneText(story.scenes.settlement, documented)).toMatch(/no return is recorded here/i);
  });

  it('claims the Grease Mark crew-wrench recovery only where the route establishes the drop', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-axle-grease-mark')!;
    for (const approach of ['stopWagon', 'checkToolBoard', 'signalWorkers']) {
      const start = () => initial(story, approach === 'checkToolBoard' ? 'compactWheelWrench' : undefined);
      for (const response of ['protectDriver', 'checkWheel']) {
        let state = act(start(), story, `approach_${approach}`);
        state = act(state, story, `respond_${response}`);
        expect(sceneText(story.scenes.aftermath, state)).not.toMatch(/crew recovers its wrench/i);
      }

      let returned = act(start(), story, `approach_${approach}`);
      returned = act(returned, story, 'respond_askReturn');
      expect(sceneText(story.scenes.aftermath, returned)).toMatch(/drops it and walks away/i);

      let fought = act(start(), story, `approach_${approach}`);
      fought = act(fought, story, 'fight', () => 0);
      expect(fought.run?.sceneId).toBe('fightWon');
      fought = act(fought, story, 'checkRoad');
      expect(sceneText(story.scenes.aftermath, fought)).not.toMatch(/crew recovers its wrench/i);
    }
  });

  it('does not place Pike at the toll shed after the east-office route sends her away', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-paper-road')!;
    let state = act(initial(scenario), scenario, 'approach_eastOffice');
    state = act(state, scenario, 'respond_stayBack');
    const text = sceneText(scenario.scenes.aftermath, state);
    expect(text).not.toMatch(/Pike confirms|Pike checks the ribbon|Pike is at the toll shed/i);
    expect(text).toMatch(/county date seal remains visible on the closed case/i);
    expect(text).toMatch(/contents have not been examined/i);

    state = act(initial(scenario), scenario, 'approach_checkTracks');
    state = act(state, scenario, 'respond_stayBack');
    expect(sceneText(scenario.scenes.aftermath, state)).not.toMatch(/Pike confirms|Pike checks the ribbon/i);
  });

  it('keeps the mill-road pin recovery claim conditional on an actual recovery route', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-mill-road-pursuit')!;
    let helped = act(initial(scenario), scenario, 'approach_followCart');
    helped = act(helped, scenario, 'respond_helpDriver');
    expect(sceneText(scenario.scenes.aftermath, helped)).not.toMatch(/pin is returned|pin back at the mill/i);
    expect(sceneText(scenario.scenes.aftermath, helped)).toMatch(/recovery and current custody are not assumed/i);
    helped = act(helped, scenario, 'ending_walkBack');
    const helpedSettlement = sceneText(scenario.scenes.settlement, helped);
    expect(helpedSettlement).not.toMatch(/after the pin is returned|checks the notch and secures the pin/i);
    expect(helpedSettlement).toMatch(/any recovered pin remains mill property/i);

    let recovered = act(initial(scenario), scenario, 'approach_followCart');
    recovered = act(recovered, scenario, 'respond_securePin');
    expect(sceneText(scenario.scenes.aftermath, recovered)).toMatch(/return the mill’s pin/i);
  });

  it('does not say Quill keeps or carries a private note on routes that never locate it', () => {
    const scenario = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-letter-under-the-seat')!;
    const combinations = [
      ['askEnvelope', 'matchReceipt'], ['askEnvelope', 'letQuillDecide'], ['askEnvelope', 'holdCoach'],
      ['askClerk', 'matchReceipt'], ['askClerk', 'letQuillDecide'], ['askClerk', 'holdCoach'],
      ['checkSeat', 'matchReceipt'], ['checkSeat', 'letQuillDecide'], ['checkSeat', 'holdCoach'],
    ] as const;
    for (const [approach, response] of combinations) {
      let state = act(initial(scenario), scenario, `approach_${approach}`);
      if (approach !== 'checkSeat') {
        expect(sceneText(scenario.scenes.threat, state)).not.toMatch(/note is addressed|Quill’s sealed note/i);
      }
      state = act(state, scenario, `respond_${response}`);
      const text = sceneText(scenario.scenes.aftermath, state);
      if (approach === 'checkSeat') {
        expect(text).toMatch(/folded note found beneath the seat remains sealed with Quill/i);
      } else {
        expect(text).not.toMatch(/Quill keeps her private note|note still sealed|note was found/i);
      }
      if (response === 'matchReceipt' && approach !== 'checkSeat') {
        expect(text).not.toMatch(/Quill’s sealed note|ownership of the private note/i);
      }
      for (const ending of ['ending_boardTogether', 'ending_stayClerk']) {
        const outcome = act(state, scenario, ending);
        const settlement = sceneText(scenario.scenes.settlement, outcome);
        expect(settlement).not.toMatch(/note still sealed|letter is safe|Quill keeps her private note/i);
      }
    }
    expect(scenario.scenes.gear.text).not.toMatch(/retaining her own letter/i);
    expect(scenario.scenes.gear.text).toMatch(/private papers are not transferred/i);
  });

  it('keeps the Stones in the Rut obstruction state tied to its approach', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-stones-in-the-rut')!;
    const aftermath = (approach: string, response: string, item?: string): SaveData => {
      let state = act(initial(story, item), story, `approach_${approach}`);
      state = act(state, story, `respond_${response}`);
      expect(state.run?.sceneId).toBe('aftermath');
      return state;
    };

    const responses: [string, string | undefined][] = [['openDitch', undefined], ['nameWitness', undefined], ['useWhistle', 'conductorWhistle']];
    for (const approach of ['inspectCord', 'warnFarm']) {
      for (const [response, item] of responses) {
        const text = sceneText(story.scenes.aftermath, aftermath(approach, response, item));
        expect(text).not.toMatch(/obstruction is cleared|road opens again|road is reopened/i);
        expect(text).not.toMatch(/cord was a lookout signal/i);
      }
    }
    expect(story.scenes.aftermath.title).toBe('After the Roadside Threat');
    for (const [response, item] of responses) {
      const movedRoute = aftermath('moveStones', response, item);
      expect(movedRoute.run?.flags).toContain('road_approach_moveStones');
      expect(sceneText(story.scenes.aftermath, movedRoute)).toMatch(/you moved the loose stones before the confrontation, and the road opened slowly/i);
    }
    let movedCombat = act(initial(story), story, 'approach_moveStones');
    movedCombat = act(movedCombat, story, 'fight', () => 0);
    expect(movedCombat.run?.sceneId).toBe('fightWon');
    movedCombat = act(movedCombat, story, 'checkRoad');
    expect(sceneText(story.scenes.aftermath, movedCombat)).toMatch(/you moved the loose stones before the confrontation, and the road opened slowly/i);

    for (const state of [aftermath('moveStones', 'openDitch'), aftermath('inspectCord', 'openDitch')]) {
      const warned = act(state, story, 'ending_markPinch');
      expect(sceneText(story.scenes.settlement, warned)).toMatch(/posts warnings at both approaches/i);
      expect(sceneText(story.scenes.settlement, warned)).toMatch(/while deciding when wagons can safely use the narrow stretch again/i);
    }

    let noMoveCombat = act(initial(story), story, 'approach_inspectCord');
    noMoveCombat = act(noMoveCombat, story, 'fight', () => 0);
    expect(noMoveCombat.run?.sceneId).toBe('fightWon');
    noMoveCombat = act(noMoveCombat, story, 'checkRoad');
    expect(sceneText(story.scenes.aftermath, noMoveCombat)).not.toMatch(/obstruction is cleared|road opens again/i);
  });

  it('keeps freight-number discovery and correction work on the response that establishes them', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-ledger-under-canvas')!;
    for (const approach of ['checkSeal', 'questionNightman', 'followTrack']) {
      for (const [response, identified] of [['askNumber', true], ['secureBook', false], ['callWitness', false]] as const) {
        let state = act(initial(story), story, `approach_${approach}`);
        state = act(state, story, `respond_${response}`);
        const text = sceneText(story.scenes.aftermath, state);
        const correction = story.scenes.aftermath.choices.find(({ id }) => id === 'ending_traceCrate')!;
        expect(meets(correction.requirements, state), `${approach}/${response} trace option`).toBe(identified);
        if (identified) {
          expect(text).toMatch(/county tool shipment is identified as misrouted/i);
          state = act(state, story, 'ending_traceCrate');
          expect(sceneText(story.scenes.settlement, state)).toMatch(/crate can be redirected/i);
        } else {
          expect(text).not.toMatch(/county tool shipment|misrouted|public-works crate|signed waybill/i);
          state = act(state, story, 'ending_leaveLedger');
          expect(sceneText(story.scenes.settlement, state)).not.toMatch(/corrected waybill|for carrying the signed waybill/i);
        }
        expect(sceneText(story.scenes.settlement, state)).toMatch(/duplicate Lockable Map Case from the yard’s surplus/i);
      }
    }
  });

  it('does not give the Second Rope driver a marked descent route unless the Traveler marked it', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-second-rope')!;
    for (const approach of ['steadyHorses', 'callOwner']) {
      let state = act(initial(story, 'travelRope'), story, `approach_${approach}`);
      expect(state.run?.flags).not.toContain('road_approach_markRetreat');
      state = act(state, story, 'fight', () => 1);
      expect(state.run?.sceneId).toBe('fightLost');
      expect(sceneText(story.scenes.fightLost, state)).not.toMatch(/marked route/i);
      expect(sceneText(story.scenes.fightLost, state)).toMatch(/cannot see how they leave the pass/i);
    }

    let marked = act(initial(story), story, 'approach_markRetreat');
    expect(marked.run?.flags).toContain('road_approach_markRetreat');
    expect(sceneText(story.scenes.threat, marked)).toMatch(/mark a safe turn-around point/i);
    marked = act(marked, story, 'fight', () => 1);
    expect(sceneText(story.scenes.fightLost, marked)).not.toMatch(/marked route/i);
  });

  it('keeps gate location and permit claims tied to the selected response', () => {
    const gate = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-closed-gate')!;
    for (const approach of ['readSign', 'askFamily', 'findRancher']) {
      for (const response of ['showPermit', 'openBackLane', 'callNeighbor']) {
        let state = act(initial(gate), gate, `approach_${approach}`);
        state = act(state, gate, `respond_${response}`);
        const aftermath = sceneText(gate.scenes.aftermath, state);
        expect(aftermath).not.toMatch(/county clerk is asked|the clerk is asked to confirm/i);
        expect(aftermath.includes('family takes the longer marked back lane')).toBe(response === 'openBackLane');
        expect(aftermath.includes('rancher confirms the seasonal closure has not begun')).toBe(response === 'showPermit');
        if (response === 'showPermit') expect(aftermath).toMatch(/without a separate clerk request/i);
        if (response === 'openBackLane') expect(aftermath).toMatch(/no separate clerk date-check is claimed/i);
        if (response === 'callNeighbor') {
          expect(aftermath).toMatch(/neighbor witnesses the riders abandoning the chain/i);
          expect(aftermath).toMatch(/nor a clerk date-check/i);
        }
      }
    }
  });

  it('offers the dropped pry-tool return only after that tool is dropped', () => {
    const camp = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-camp-with-two-fires')!;
    const returnTool = camp.scenes.aftermath.choices.find(({ id }) => id === 'ending_returnTool')!;
    for (const response of ['callWatch', 'closeGap', 'wakeCook']) {
      let state = act(initial(camp), camp, 'approach_secureHorse');
      state = act(state, camp, `respond_${response}`);
      expect(meets(returnTool.requirements, state), response).toBe(response === 'callWatch');
      if (response === 'callWatch') {
        expect(sceneText(camp.scenes.aftermath, state)).toMatch(/drops a pry tool/i);
        state = act(state, camp, 'ending_returnTool');
        expect(sceneText(camp.scenes.settlement, state)).toMatch(/owner identifies the tool as caravan property/i);
      } else {
        expect(sceneText(camp.scenes.aftermath, state)).not.toMatch(/drops a pry tool/i);
      }
    }
    const combat = act(act(initial(camp), camp, 'approach_secureHorse'), camp, 'fight', () => 0);
    const combatAftermath = act(combat, camp, 'checkRoad');
    expect(meets(returnTool.requirements, combatAftermath)).toBe(false);
    expect(camp.scenes.gear.text).toMatch(/separate from any tool left at the scene/i);
  });

  it('separates purse identification, a confession, and restitution by response', () => {
    const story = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-blue-thread')!;
    for (const response of ['countCoins', 'askFinder', 'callWoodcutter']) {
      let state = act(initial(story), story, 'approach_followThread');
      state = act(state, story, `respond_${response}`);
      const aftermath = sceneText(story.scenes.aftermath, state);
      expect(aftermath).not.toMatch(/returns the remaining coins|repays the missing coins/i);
      expect(aftermath.includes('finder admits taking two coins')).toBe(response === 'askFinder');
      if (response === 'countCoins') expect(aftermath).toMatch(/laundry ticket and takes back the purse/i);
      if (response === 'askFinder') expect(aftermath).toMatch(/no repayment is established/i);
      if (response === 'callWoodcutter') expect(aftermath).toMatch(/finder’s handling and any missing coins remain unestablished/i);
      state = act(state, story, 'ending_walkToInn');
      expect(sceneText(story.scenes.settlement, state)).not.toMatch(/finder’s account/i);
      expect(sceneText(story.scenes.settlement, state)).toMatch(/without assigning blame/i);
    }
  });

  it('keeps public-axle ownership distinct from physical return to the crew', () => {
    const axle = ROAD_DANGER_GENRE_BATCH.find(({ id }) => id === 'the-axle-without-a-mark')!;
    for (const [approach, response] of [['checkCrewBook', 'callForeman'], ['askSmith', 'refusePurchase'], ['stabilizeWagon', 'checkStamp']]) {
      let state = act(initial(axle), axle, `approach_${approach}`);
      state = act(state, axle, `respond_${response}`);
      const aftermath = sceneText(axle.scenes.aftermath, state);
      expect(aftermath).not.toMatch(/axle is returned to its crew/i);
      expect(aftermath).toMatch(/return to the crew is not established/i);
      if (response === 'callForeman') {
        state = act(state, axle, 'ending_giveStatement');
        expect(sceneText(axle.scenes.settlement, state)).toMatch(/axle remains in the smith’s custody/i);
      }
    }
  });
});
