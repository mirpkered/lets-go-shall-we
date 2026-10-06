import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { SCENARIOS } from './index';
import { COMMERCE_ADVENTURES, HALF_NOW, LAST_ROOM_HIGHER_PRICE, MARKET_DAY, PAYMENT_IN_KIND, SHORT_ON_THE_WAGES, SOMEBODY_ELSES_LAND, THE_BROKEN_CRATE, THE_HORSE_TRADE, THE_PAWNED_TOOL, WHO_OWNS_THE_MULE } from './commerceBatch';
import { FENCE_LINE } from './honestWorkBatch';
import type { SaveData, Scenario } from '../types';

function start(scenario: Scenario, selections: Record<string, string> = {}, item?: string, money = 0): SaveData {
  const character = newCharacter('Commerce Tester');
  character.money = money;
  if (item) character.carriedItem = item;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  state.run!.randomSelections = { ...state.run!.randomSelections, ...selections };
  return state;
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function selectionCombos(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((current, selection) =>
    current.flatMap((entry) => selection.values.map(({ value }) => ({ ...entry, [selection.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, item?: string): void {
  const queue = [start(scenario, selections, item)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} exposes a choice`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the action layout`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(1000);
  }
}

describe('commerce, bargains, and property adventure batch', () => {
  it('registers ten distinct stories with forward-only graphs and concise mobile copy', () => {
    expect(COMMERCE_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(565);
    expect(COMMERCE_ADVENTURES.map(({ title }) => title)).toEqual([
      'Payment in Kind', 'Short on the Wages', 'Market Day', 'The Horse Trade', 'The Broken Crate',
      'Half Now', 'Somebody Else’s Land', 'The Pawned Tool', 'Last Room, Higher Price', 'Who Owns the Mule?',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of COMMERCE_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id}`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id}`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title} references ${id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores every authored cause and chance result without dead ends or scene revisits', () => {
    for (const scenario of COMMERCE_ADVENTURES) {
      for (const selections of selectionCombos(scenario)) {
        explore(scenario, selections);
        if (scenario === SOMEBODY_ELSES_LAND) explore(scenario, selections, 'joinersFoldingRule');
        if (scenario === THE_BROKEN_CRATE) explore(scenario, selections, 'foundPocketWatch');
      }
    }
  });

  it('offers balanced in-kind wages and a clearly described, earnable carryable rule', () => {
    const ruleOption = PAYMENT_IN_KIND.scenes.settlement.choices.find(({ id }) => id === 'takeRuleAndCoin')!;
    expect(ruleOption.effects?.gainItems).toContain('joinersFoldingRule');
    expect(meets(ruleOption.requirements, start(PAYMENT_IN_KIND))).toBe(true);
    let paid = act(start(PAYMENT_IN_KIND), PAYMENT_IN_KIND, 'settlement', 'takeRuleAndCoin');
    expect(paid.run?.inventory).toContain('joinersFoldingRule');
    expect(paid.character?.money).toBe(2);
    expect(paid.character?.historyFlags).toContain('accepted_tool_instead_of_full_wages');
    expect(meets(ruleOption.requirements, start(PAYMENT_IN_KIND, {}, 'joinersFoldingRule'))).toBe(false);

    let flour = act(start(PAYMENT_IN_KIND), PAYMENT_IN_KIND, 'settlement', 'takeFlourAndCoin');
    expect(flour.character?.money).toBe(2);
    expect(flour.run?.status).toBe('success');
  });

  it('keeps wage disagreement peaceful and supports challenge, witness, compromise, and walking away', () => {
    let state = act(start(SHORT_ON_THE_WAGES, { reason: 'cheating' }), SHORT_ON_THE_WAGES, 'payOffer', 'askForCount');
    expect(SHORT_ON_THE_WAGES.scenes.account.textVariants?.find(({ requirements }) => meets(requirements, state))?.text).toContain('four-coin amount');
    state = act(state, SHORT_ON_THE_WAGES, 'account', 'proposeOneMore', () => 0);
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(3);
    expect(state.character?.historyFlags).toContain('negotiated_fair_wages');

    let witness = act(start(SHORT_ON_THE_WAGES, { reason: 'hardship' }), SHORT_ON_THE_WAGES, 'payOffer', 'askWitness');
    witness = act(witness, SHORT_ON_THE_WAGES, 'witness', 'requestSharedCount');
    expect(witness.character?.money).toBe(3);
    expect(witness.character?.historyFlags).toContain('settled_wage_dispute_with_witness');
    expect(act(start(SHORT_ON_THE_WAGES), SHORT_ON_THE_WAGES, 'payOffer', 'leaveWageDispute').run?.status).toBe('success');
  });

  it('makes purchases and sales voluntary, affordable, and records what changed hands', () => {
    const poor = start(MARKET_DAY);
    expect(MARKET_DAY.scenes.marketSquare.choices.filter(({ requirements }) => meets(requirements, poor)).map(({ id }) => id)).toEqual(['comparePrices']);
    let buyer = act(start(MARKET_DAY, {}, undefined, 3), MARKET_DAY, 'marketSquare', 'buyFoldingRule');
    expect(buyer.character?.money).toBe(0);
    expect(buyer.run?.inventory).toContain('joinersFoldingRule');
    let seller = act(start(MARKET_DAY, {}, 'foundPocketWatch'), MARKET_DAY, 'marketSquare', 'sellPocketWatch');
    expect(seller.character?.money).toBe(3);
    expect(seller.run?.inventory).not.toContain('foundPocketWatch');
    expect(seller.character?.historyFlags).toContain('sold_silver_pocket_watch_at_market');
  });

  it('offers a sound, existing travel rope as an optional market purchase', () => {
    const poor = act(start(MARKET_DAY), MARKET_DAY, 'marketSquare', 'comparePrices');
    expect(poor.run?.sceneId).toBe('toolStall');
    expect(MARKET_DAY.scenes.toolStall.choices.filter(({ requirements }) => meets(requirements, poor)).map(({ id }) => id)).not.toContain('buyTravelRope');

    const buyer = act(start(MARKET_DAY, {}, undefined, 3), MARKET_DAY, 'marketSquare', 'comparePrices');
    const bought = act(buyer, MARKET_DAY, 'toolStall', 'buyTravelRope');
    expect(bought.character?.money).toBe(0);
    expect(bought.run?.inventory).toContain('travelRope');
    expect(bought.character?.historyFlags).toContain('bought_travel_rope_at_market');

    const owner = act(start(MARKET_DAY, {}, 'travelRope', 4), MARKET_DAY, 'marketSquare', 'comparePrices');
    expect(MARKET_DAY.scenes.toolStall.choices.filter(({ requirements }) => meets(requirements, owner)).map(({ id }) => id)).not.toContain('buyTravelRope');

    const bankedRope = start(MARKET_DAY, {}, undefined, 4);
    bankedRope.bank.push('travelRope');
    bankedRope.run!.sceneId = 'toolStall';
    expect(meets(MARKET_DAY.scenes.toolStall.choices.find(({ id }) => id === 'buyTravelRope')!.requirements, bankedRope)).toBe(false);
  });

  it('makes two useful existing trail tools available through a separate, optional market stall', () => {
    const freshTraveler = act(start(MARKET_DAY, {}, undefined, 4), MARKET_DAY, 'marketSquare', 'comparePrices');
    const tools = act(freshTraveler, MARKET_DAY, 'toolStall', 'browseTrailGoods');
    expect(tools.run?.sceneId).toBe('trailOutfitter');

    const markerBuyer = act(start(MARKET_DAY, {}, undefined, 2), MARKET_DAY, 'marketSquare', 'comparePrices');
    const markerStall = act(markerBuyer, MARKET_DAY, 'toolStall', 'browseTrailGoods');
    const marker = act(markerStall, MARKET_DAY, 'trailOutfitter', 'buyTrailMarker');
    expect(marker.character?.money).toBe(0);
    expect(marker.run?.inventory).toContain('foldingTrailMarker');
    expect(marker.character?.historyFlags).toContain('bought_trail_marker_at_market');

    const mirrorBuyer = act(start(MARKET_DAY, {}, undefined, 4), MARKET_DAY, 'marketSquare', 'comparePrices');
    const mirrorStall = act(mirrorBuyer, MARKET_DAY, 'toolStall', 'browseTrailGoods');
    const mirror = act(mirrorStall, MARKET_DAY, 'trailOutfitter', 'buySignalMirror');
    expect(mirror.character?.money).toBe(0);
    expect(mirror.run?.inventory).toContain('roadsideSignalMirror');
    const raw = { value: '' };
    saveGame(mirror, { setItem: (_key, value) => { raw.value = value; } });
    const resumed = loadSave({ getItem: () => raw.value });
    expect(resumed.run?.inventory).toContain('roadsideSignalMirror');
    expect(resumed.character?.money).toBe(0);

    const alreadyOwns = start(MARKET_DAY, {}, 'foldingTrailMarker', 4);
    alreadyOwns.run!.sceneId = 'trailOutfitter';
    expect(meets(MARKET_DAY.scenes.trailOutfitter.choices.find(({ id }) => id === 'buyTrailMarker')!.requirements, alreadyOwns)).toBe(false);
  });

  it('makes the horse opinion limited to visible condition and tack', () => {
    let stiff = act(start(THE_HORSE_TRADE, { horseCondition: 'stiff' }), THE_HORSE_TRADE, 'yard', 'walkHorse');
    expect(THE_HORSE_TRADE.scenes.walkObserved.textVariants?.find(({ requirements }) => meets(requirements, stiff))?.text).toContain('not proof of an injury');
    stiff = act(stiff, THE_HORSE_TRADE, 'walkObserved', 'reportOnlyWhatSeen');
    expect(stiff.character?.historyFlags).toContain('gave_limited_horse_trade_opinion');
    const tack = act(start(THE_HORSE_TRADE), THE_HORSE_TRADE, 'yard', 'inspectTack');
    expect(THE_HORSE_TRADE.scenes.tackObserved.text).toContain('does not show a split');
  });

  it('retains witnessed damage limits and unresolved responsibility for the broken crate', () => {
    const unseen = start(THE_BROKEN_CRATE, { damageCause: 'unseen' });
    expect(THE_BROKEN_CRATE.scenes.receivingYard.choices.filter(({ requirements }) => meets(requirements, unseen)).map(({ id }) => id)).not.toContain('stateWhatWitnessed');
    let state = act(start(THE_BROKEN_CRATE, { damageCause: 'loadingSlip' }), THE_BROKEN_CRATE, 'receivingYard', 'inspectCrate');
    state = act(state, THE_BROKEN_CRATE, 'crateInspection', 'askToCheckTally');
    state = act(state, THE_BROKEN_CRATE, 'packingNote', 'carrierPays');
    expect(state.run?.status).toBe('success');
    expect(THE_BROKEN_CRATE.scenes.carrierAccount.text).toContain('may have been weakened earlier');
  });

  it('pays the advance once and keeps changed work scope negotiable', () => {
    let state = act(start(HALF_NOW), HALF_NOW, 'offer', 'takeAdvance');
    expect(state.character?.money).toBe(3);
    state = act(state, HALF_NOW, 'storeroom', 'finishOriginalScope');
    expect(state.character?.money).toBe(6);
    expect(state.character?.historyFlags).toContain('completed_work_to_original_terms');
    let quit = act(start(HALF_NOW), HALF_NOW, 'offer', 'takeAdvance');
    quit = act(quit, HALF_NOW, 'storeroom', 'quitWithAdvance');
    expect(quit.character?.money).toBe(3);
  });

  it('uses the folding rule as limited property evidence in both land stories', () => {
    let land = act(start(SOMEBODY_ELSES_LAND, {}, 'joinersFoldingRule'), SOMEBODY_ELSES_LAND, 'ditchWork', 'inspectMarker');
    land = act(land, SOMEBODY_ELSES_LAND, 'markerEvidence', 'measurePostSpacing');
    expect(land.run?.sceneId).toBe('limitedEvidence');
    expect(land.character?.knowledge.some((entry) => entry.includes('does not prove who owns'))).toBe(true);

    let fence = start(FENCE_LINE, { shift: 'complication' }, 'joinersFoldingRule');
    fence = act(fence, FENCE_LINE, 'hiring', 'beginWork');
    fence = act(fence, FENCE_LINE, 'work', 'addressIssue');
    const useRule = FENCE_LINE.scenes.complication.choices.find(({ id }) => id === 'useSecondTool')!;
    expect(meets(useRule.requirements, fence)).toBe(true);
    fence = choose(fence, FENCE_LINE, useRule);
    expect(fence.run?.sceneId).toBe('cleanFinish');
  });

  it('preserves uncertainty when the pawned tool account is incomplete', () => {
    let state = act(start(THE_PAWNED_TOOL, { sellerAccount: 'unclear' }, undefined, 2), THE_PAWNED_TOOL, 'stall', 'askSellerAccount');
    expect(THE_PAWNED_TOOL.scenes.sellerAccount.textVariants?.find(({ requirements }) => meets(requirements, state))?.text).toContain('cannot verify');
    state = act(state, THE_PAWNED_TOOL, 'sellerAccount', 'buyAfterAccount');
    expect(state.run?.inventory).toContain('joinersFoldingRule');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('bought_joiners_rule_after_uncertain_ownership_account');
  });

  it('keeps lodging choices available to a broke traveler without making the innkeeper a villain', () => {
    const broke = start(LAST_ROOM_HIGHER_PRICE);
    const available = LAST_ROOM_HIGHER_PRICE.scenes.innDoor.choices.filter(({ requirements }) => meets(requirements, broke));
    expect(available.map(({ id }) => id)).toEqual(['askForAlternatives', 'stayUnderPorch']);
    let state = act(broke, LAST_ROOM_HIGHER_PRICE, 'innDoor', 'askForAlternatives');
    state = act(state, LAST_ROOM_HIGHER_PRICE, 'roomAlternatives', 'stableLoft');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(LAST_ROOM_HIGHER_PRICE.scenes.innDoor.text).toContain('other rooms filled before the storm');
  });

  it('does not claim to solve the mule ownership question from a brand or a remembered habit', () => {
    let state = act(start(WHO_OWNS_THE_MULE, { muleMark: 'clearMark' }), WHO_OWNS_THE_MULE, 'stableYard', 'inspectMark');
    expect(WHO_OWNS_THE_MULE.scenes.markInspected.textVariants?.find(({ requirements }) => meets(requirements, state))?.text).toContain('could fit either account');
    state = act(state, WHO_OWNS_THE_MULE, 'markInspected', 'holdForLedger');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('neutralHold');
    expect(WHO_OWNS_THE_MULE.scenes.neutralHold.text).toContain('partly unresolved');
  });
});
