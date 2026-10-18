import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { A_BORROWED_COAT, A_VERY_GOOD_DEAL, DISPUTE_ADVENTURES, THE_BROKEN_PROMISE, THE_DEBT_AT_SUPPER, THE_EMPTY_PURSE, THE_FALSE_GUIDE, THE_INJURED_TRAVELER, THE_LANDLORDS_STORY, THE_MISSING_SACK } from './disputesBatch';

const WATCH_OWNERS = ['Tavren', 'Isolde', 'Araminta', 'Fenella', 'Leofric'];

function start(scenario: Scenario, selections: Record<string, string> = {}, money = 2, historyFlags: string[] = [], inventory: string[] = []): SaveData {
  const character = newCharacter('Dispute Tester');
  character.money = money;
  character.historyFlags = [...historyFlags];
  const run = startRun(character, scenario, () => 0);
  run.inventory = [...inventory];
  run.randomSelections = { ...run.randomSelections, ...selections };
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

function selectionSets(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((all, group) =>
    all.flatMap((base) => group.values.map(({ value }) => ({ ...base, [group.id]: value }))), [{}]);
}

function explore(scenario: Scenario, selections: Record<string, string>, money = 2): number {
  const queue = [start(scenario, selections, money)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.lore, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    expect(sceneText(scene!, state)).not.toMatch(/\{\{[^}]+\}\}/);
    if (scene!.ending) continue;
    const available = scene!.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene!.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene!.id} fits four-button layout`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance || choice.effects?.combat ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene!.id}.${choice.id} advances`).toBe(false);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(20_000);
  }
  return seen.size;
}

describe('deception, disputes, and self-interest adventure batch', () => {
  it('registers ten distinct, concise, forward-only adventures', () => {
    expect(DISPUTE_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(861);
    expect(DISPUTE_ADVENTURES.map(({ title }) => title)).toEqual([
      'The Injured Traveler', 'That’s My Horse', 'The Empty Purse', 'A Very Good Deal', 'The Broken Promise',
      'The Landlord’s Story', 'The Missing Sack', 'A Borrowed Coat', 'The False Guide', 'The Debt at Supper',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of DISPUTE_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? []), ...(choice.effects?.gainItems ?? []), ...(choice.effects?.loseItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title}.${scene.id} references known item ${id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores all authored variants for funded and broke characters without dead ends or scene revisits', () => {
    for (const scenario of DISPUTE_ADVENTURES) {
      for (const selections of selectionSets(scenario)) {
        expect(explore(scenario, selections, 3), scenario.title).toBeGreaterThan(0);
        expect(explore(scenario, selections, 0), `${scenario.title} without money`).toBeGreaterThan(0);
      }
    }
  }, 60_000);

  it('keeps the loupe offer uncertain, optional, and affordable only with enough coin', () => {
    expect(selectionSets(A_VERY_GOOD_DEAL)).toHaveLength(4);
    const broke = start(A_VERY_GOOD_DEAL, { saleReason: 'bargain' }, 0);
    expect(A_VERY_GOOD_DEAL.scenes.cheapLoupe.choices.filter(({ requirements }) => meets(requirements, broke)).map(({ id }) => id)).not.toContain('buyLoupe');
    const buyer = act(start(A_VERY_GOOD_DEAL, { saleReason: 'damaged' }, 3), A_VERY_GOOD_DEAL, 'cheapLoupe', 'buyLoupe');
    expect(buyer.character?.money).toBe(0);
    expect(buyer.run?.inventory).toContain('assayersLoupe');
    expect(A_VERY_GOOD_DEAL.scenes.cheapLoupe.text).toContain('priced below the usual market rate');
    expect(A_VERY_GOOD_DEAL.scenes.saleInspected.text).toContain('not whether the seller has a right to sell it');
  });

  it('preserves the broken-promise fragment the Traveler remembers whether or not they testify', () => {
    const variants = [
      { selection: 'oneCoin', report: 'giveLimitedAccountCoin', decline: 'declinePromiseCoin', fact: 'You heard one traveler offer a coin for something, but did not hear the full agreement.', visible: 'I can give you a coin for that' },
      { selection: 'ifPaid', report: 'giveLimitedAccountPaid', decline: 'declinePromisePaid', fact: 'You heard a conditional offer to share payment if a cart job paid, but not the agreed amount or date.', visible: 'If the cart job pays, I’ll share' },
      { selection: 'noTerms', report: 'sayHeardNoTerms', decline: 'declinePromiseNoTerms', fact: 'You heard only that one traveler needed help with a cart, not whether payment was promised.', visible: 'heard no amount, date, or clear promise' },
    ];
    for (const variant of variants) {
      const state = start(THE_BROKEN_PROMISE, { heardFragment: variant.selection });
      expect(sceneText(THE_BROKEN_PROMISE.scenes.roadsideDispute, state)).toContain(variant.visible);
      for (const choiceId of [variant.report, variant.decline]) {
        const result = act(state, THE_BROKEN_PROMISE, 'roadsideDispute', choiceId);
        expect(result.character?.knowledge).toContain(variant.fact);
      }
    }
    expect(THE_BROKEN_PROMISE.scenes.roadsideDispute.choices.find(({ id }) => id === 'giveLimitedAccountPaid')?.requirements?.selections).toEqual({ heardFragment: 'ifPaid' });
  });

  it('persists entry-established dispute facts independently of the Traveler’s next action', () => {
    const cases = [
      { scenario: THE_INJURED_TRAVELER, scene: 'roadsideRequest', fact: 'A traveler beside a milestone held a swollen wrist and asked for help reaching a healer.', choices: ['giveInjuryMoney', 'offerWaterInjury', 'sendForInnkeeper', 'declineInjury'], selections: [{}] },
      { scenario: THE_EMPTY_PURSE, scene: 'innComplaint', fact: 'An inn guest reported a missing purse after supper; no witness saw it taken.', choices: ['letHostSearch', 'askGuestDetails', 'stayOutPurse', 'leaveInnPurse'], selections: selectionSets(THE_EMPTY_PURSE) },
      { scenario: THE_MISSING_SACK, scene: 'wagonStop', fact: 'A flour sack was missing after shared wagon transport; the driver and shopkeeper remembered different counts.', choices: ['checkWagonLedger', 'askLastStop', 'lookAlongRoad', 'leaveSackDispute'], selections: selectionSets(THE_MISSING_SACK) },
      { scenario: THE_DEBT_AT_SUPPER, scene: 'supperDispute', fact: 'Two inn guests disagreed about a small loan and whether it had been repaid.', choices: ['leaveDebtTable', 'listenDebtAccounts', 'askDebtNote', 'offerDebtMediation'], selections: [{}] },
    ];

    for (const entry of cases) {
      for (const selections of entry.selections) {
        const initial = start(entry.scenario, selections, 3);
        for (const choiceId of entry.choices) {
          const result = act(initial, entry.scenario, entry.scene, choiceId);
          expect(result.character?.knowledge, `${entry.scenario.id}.${choiceId}`).toContain(entry.fact);
        }
        const declined = act(initial, entry.scenario, entry.scene, entry.choices.at(-1)!);
        const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
        saveGame(declined, storage as never);
        const resumed = loadSave(storage as never);
        expect(resumed.character?.knowledge, `${entry.scenario.id} save/reload`).toContain(entry.fact);
      }
    }
  });

  it('keeps the missing-sack account tied to an actual reply from the previous inn', () => {
    const noReplyText = (selections: Record<string, string>, route: 'loading' | 'search') => {
      let state = start(THE_MISSING_SACK, selections);
      if (route === 'loading') {
        state = act(state, THE_MISSING_SACK, 'wagonStop', 'checkWagonLedger');
        state = act(state, THE_MISSING_SACK, 'loadingMarks', 'sendWordToStop');
      } else {
        state = act(state, THE_MISSING_SACK, 'wagonStop', 'lookAlongRoad');
        state = act(state, THE_MISSING_SACK, 'roadsideSearch', 'askRoadsideSearch');
      }
      expect(state.run?.sceneId).toBe('sackAccountFound');
      return sceneText(THE_MISSING_SACK.scenes.sackAccountFound, state);
    };

    for (const outcome of ['wrongStop', 'slipped', 'neverLoaded', 'taken']) {
      const selections = { sackOutcome: outcome };
      for (const route of ['loading', 'search'] as const) {
        expect(noReplyText(selections, route)).toMatch(/cause remains open|no reply has arrived/i);
        expect(noReplyText(selections, route)).not.toMatch(/sack is found|found at another stop|never loaded/i);
      }

      let replied = start(THE_MISSING_SACK, selections);
      replied = act(replied, THE_MISSING_SACK, 'wagonStop', 'askLastStop');
      replied = act(replied, THE_MISSING_SACK, 'lastStopAsked', 'acceptSackReply');
      const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
      saveGame(replied, storage as never);
      replied = loadSave(storage as never);
      const text = sceneText(THE_MISSING_SACK.scenes.sackAccountFound, replied);
      if (outcome === 'wrongStop') expect(text).toMatch(/previous inn reports finding the sack/i);
      else if (outcome === 'neverLoaded') expect(text).toMatch(/wagon arrived already short/i);
      else expect(text).toMatch(/sack remains missing/i);
    }
  });

  it('uses exact Finders Keepers watch provenance as a natural, non-verdict callback', () => {
    for (const owner of WATCH_OWNERS) {
      const state = start(A_BORROWED_COAT, { coatClaimant: owner }, 2, [`finder_took_watch_from_${owner}`]);
      expect(sceneText(A_BORROWED_COAT.scenes.coatClaim, state)).toContain(`silver watch you took from unattended belongings`);
      const acknowledge = A_BORROWED_COAT.scenes.coatClaim.choices.filter(({ requirements }) => meets(requirements, state));
      expect(acknowledge.map(({ id }) => id)).toContain(`admitWatch_${owner}`);
      const admitted = act(state, A_BORROWED_COAT, 'coatClaim', `admitWatch_${owner}`);
      expect(admitted.character?.historyFlags).toContain(`acknowledged_taking_watch_from_${owner}`);
      expect(sceneText(A_BORROWED_COAT.scenes.watchAcknowledged, admitted)).toContain('does not prove the coat is theirs');
    }
    const mismatched = start(A_BORROWED_COAT, { coatClaimant: 'Tavren' }, 2, ['finder_took_watch_from_Isolde']);
    expect(sceneText(A_BORROWED_COAT.scenes.coatClaim, mismatched)).not.toContain('silver watch you took');
    expect(A_BORROWED_COAT.scenes.coatClaim.choices.filter(({ requirements }) => meets(requirements, mismatched)).map(({ id }) => id)).not.toContain('admitWatch_Tavren');
  });

  it('makes the landlord compromise earn concrete repair terms and consequences', () => {
    let state = act(start(THE_LANDLORDS_STORY), THE_LANDLORDS_STORY, 'roomComplaint', 'hearLandlord');
    state = act(state, THE_LANDLORDS_STORY, 'accountsCompared', 'suggestSplitRoom');
    expect(state.run?.sceneId).toBe('roomCompromise');
    expect(THE_LANDLORDS_STORY.scenes.roomCompromise.text).toContain('supply plaster');
    state = act(state, THE_LANDLORDS_STORY, 'roomCompromise', 'boarderWorksForShare');
    expect(state.run?.status).toBe('success');
    expect(THE_LANDLORDS_STORY.scenes[state.run!.sceneId].text).toContain('repair will be made');
    expect(findScenarioGraphProblems(THE_LANDLORDS_STORY)).toEqual([]);
  });

  it('makes safely holding the disputed coat a consequential middle step', () => {
    let state = act(start(A_BORROWED_COAT, { coatClaimant: 'Tavren' }), A_BORROWED_COAT, 'coatClaim', 'askInnkeeperCoat');
    expect(state.run?.sceneId).toBe('coatHeld');
    expect(sceneText(A_BORROWED_COAT.scenes.coatHeld, state)).toContain('bought time, not settled ownership');
    state = act(state, A_BORROWED_COAT, 'coatHeld', 'askBothReturn');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('kept_a_disputed_coat_safe_for_review');
    expect(A_BORROWED_COAT.scenes[state.run!.sceneId].text).toContain('prevents a hasty handover');
    expect(findScenarioGraphProblems(A_BORROWED_COAT)).toEqual([]);
  });

  it('lets the traveler hire a capable guide or safely decline every uncertain offer', () => {
    const hired = act(start(THE_FALSE_GUIDE, { guideQuality: 'competent' }, 2), THE_FALSE_GUIDE, 'guideOffer', 'hireGuide');
    expect(hired.character?.money).toBe(0);
    expect(sceneText(THE_FALSE_GUIDE.scenes.guideRoute, hired)).toContain('points out the true pass trail');
    const broke = start(THE_FALSE_GUIDE, { guideQuality: 'dishonest' }, 0);
    expect(THE_FALSE_GUIDE.scenes.guideOffer.choices.filter(({ requirements }) => meets(requirements, broke)).map(({ id }) => id)).toContain('takeKnownRoad');
    expect(THE_FALSE_GUIDE.scenes.guideOffer.text).toContain('marked lower road takes longer but is known to be open');
  });
});
