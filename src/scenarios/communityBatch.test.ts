import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import {
  A_PLACE_TO_BURY_HIM, COMMUNITY_ADVENTURES, ONE_BOAT_TOO_MANY, THE_BURNT_BARN_FUND,
  THE_CLOSED_ROAD, THE_MEETING_HALL, THE_ROAD_CREW, THE_STRAY_FIRE, THE_TOWN_PUMP,
  WHAT_DID_YOU_SEE, WINTER_STORES,
} from './communityBatch';

function start(scenario: Scenario, selections: Record<string, string> = {}, item?: string, money = 0, history: string[] = []): SaveData {
  const character = newCharacter('Community Tester');
  character.money = money;
  character.historyFlags = [...history];
  if (item) character.carriedItem = item;
  const run = startRun(character, scenario, () => 0);
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
    expect(available.length, `${scenario.title}.${scene.id} exposes an action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the action grid`).toBeLessThanOrEqual(4);
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

describe('community and civic life adventure batch', () => {
  it('makes the Winter Stores ration agreement respond to a real household concern', () => {
    let state = act(start(WINTER_STORES), WINTER_STORES, 'storehouse', 'suggestRation');
    expect(state.run?.sceneId).toBe('rationPlan');
    expect(WINTER_STORES.scenes.rationPlan.text).toMatch(/youngest|portions/);
    state = act(state, WINTER_STORES, 'rationPlan', 'trialRations');
    expect(state.run?.status).toBe('success');
    expect(WINTER_STORES.scenes[state.run!.sceneId].text).toMatch(/one week|reserve/);
  });

  it('registers ten forward-only stories with concise, mobile-sized scenes', () => {
    expect(COMMUNITY_ADVENTURES).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(431);
    expect(COMMUNITY_ADVENTURES.map(({ title }) => title)).toEqual([
      'The Town Pump', 'One Boat, Too Many People', 'The Meeting Hall', 'What Did You See?',
      'The Burnt Barn Fund', 'Winter Stores', 'The Road Crew', 'A Place to Bury Him',
      'The Stray Fire', 'The Closed Road',
    ]);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const scenario of COMMUNITY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map(({ text: variant }) => variant)]) {
          expect(text.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          for (const id of [...(choice.requirements?.items ?? []), ...(choice.requirements?.notItems ?? []), ...(choice.requirements?.anyItems ?? [])]) {
            expect(ITEMS[id], `${scenario.title} references existing item ${id}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('explores every authored variation and risky outcome without dead ends or scene revisits', () => {
    for (const scenario of COMMUNITY_ADVENTURES) {
      for (const selections of selectionCombos(scenario)) explore(scenario, selections);
    }
    explore(THE_TOWN_PUMP, {}, 'foremanMultiTool');
    explore(THE_ROAD_CREW, {}, 'travelRope');
    explore(THE_ROAD_CREW, {}, 'foremanMultiTool');
    explore(THE_ROAD_CREW, {}, 'joinersFoldingRule');
  });

  it('separates the failed pump supply from contamination and offers repair or hauling', () => {
    expect(THE_TOWN_PUMP.scenes.pumpSquare.text.toLowerCase()).not.toContain('poison');
    const startState = start(THE_TOWN_PUMP);
    expect(THE_TOWN_PUMP.scenes.pumpSquare.choices.filter(({ requirements }) => meets(requirements, startState)).map(({ id }) => id))
      .toEqual(['inspectPump', 'haulWater', 'askForTheTool', 'leavePumpSquare']);
    const repair = act(startState, THE_TOWN_PUMP, 'pumpSquare', 'inspectPump');
    const fixed = act(repair, THE_TOWN_PUMP, 'pumpFitting', 'fitSparePeg');
    expect(fixed.run?.status).toBe('success');
    const supply = act(start(THE_TOWN_PUMP), THE_TOWN_PUMP, 'pumpSquare', 'haulWater');
    expect(supply.run?.status).toBe('success');
  });

  it('keeps ferry passage a shared choice instead of assigning moral rank', () => {
    const landing = ONE_BOAT_TOO_MANY.scenes.landing.text;
    expect(landing).toContain('one passenger at a time');
    expect(landing).toContain('none of you has a claim to the first place');
    expect(ONE_BOAT_TOO_MANY.scenes.urgencyShared.text).toContain('Neither asks you to rank their need');
    expect(ONE_BOAT_TOO_MANY.scenes.landing.choices.find(({ id }) => id === 'offerToWait')?.effects?.historyFlags)
      .toContain('offered_to_wait_for_shared_passage');
  });

  it('keeps the meeting practical and the traveler free to listen, help, speak, or leave', () => {
    const choices = THE_MEETING_HALL.scenes.openMeeting.choices.map(({ id }) => id);
    expect(choices).toEqual(['listen', 'offerLabor', 'speakBriefly', 'leaveMeeting']);
    expect(THE_MEETING_HALL.scenes.openMeeting.text).toContain('no one expects you to decide it');
    expect(selectionCombos(THE_MEETING_HALL)).toHaveLength(3);
  });

  it('limits witness accounts to narrated observations and lets careful history shape the framing', () => {
    const wheel = start(WHAT_DID_YOU_SEE, { cartIncident: 'wheel' });
    expect(sceneText(WHAT_DID_YOU_SEE.scenes.roadsideQuestion, wheel)).toContain('left wheel strike a buried stone');
    expect(WHAT_DID_YOU_SEE.scenes.roadsideQuestion.choices.filter(({ requirements }) => meets(requirements, wheel)).map(({ id }) => id))
      .toEqual(['rememberWheelStone', 'declineAccount']);
    const account = act(wheel, WHAT_DID_YOU_SEE, 'roadsideQuestion', 'rememberWheelStone');
    expect(account.character?.knowledge.at(-1)).toContain('buried stone');
    expect(act(account, WHAT_DID_YOU_SEE, 'wheelMemory', 'giveWheelAccount').character?.historyFlags).toContain('gave_limited_cart_witness_account');

    const driver = start(WHAT_DID_YOU_SEE, { cartIncident: 'driver' });
    expect(WHAT_DID_YOU_SEE.scenes.roadsideQuestion.choices.filter(({ requirements }) => meets(requirements, driver)).map(({ id }) => id))
      .toEqual(['rememberDriver', 'declineAccount']);
    expect(sceneText(WHAT_DID_YOU_SEE.scenes.roadsideQuestion, start(WHAT_DID_YOU_SEE, { cartIncident: 'driver' }, undefined, 0, ['gave_limited_horse_trade_opinion'])))
      .toContain('A past horse-trade question taught you');
  });

  it('makes the barn contribution voluntary and keeps winter planning uncertain but actionable', () => {
    const poor = start(THE_BURNT_BARN_FUND);
    expect(THE_BURNT_BARN_FUND.scenes.barnyard.choices.filter(({ requirements }) => meets(requirements, poor)).map(({ id }) => id))
      .toEqual(['offerLabor', 'declineFund']);
    const donation = act(start(THE_BURNT_BARN_FUND, {}, undefined, 3), THE_BURNT_BARN_FUND, 'barnyard', 'donateOne');
    expect(donation.character?.money).toBe(2);
    expect(THE_BURNT_BARN_FUND.scenes.barnyard.text).toContain('voluntary coin');
    expect(WINTER_STORES.scenes.storehouse.text).toContain('A supply wagon may come late');
    expect(WINTER_STORES.scenes.storesCounted.choices.map(({ id }) => id)).toEqual(['shareRationSuggestion', 'joinTradeSearch', 'finishCounting']);
  });

  it('uses carried road tools only when present and offers pay, passage, or a detour', () => {
    const noTool = start(THE_ROAD_CREW);
    expect(THE_ROAD_CREW.scenes.roadsideWork.choices.filter(({ requirements }) => meets(requirements, noTool)).map(({ id }) => id))
      .toEqual(['takePaidWork', 'helpForPassage', 'takeDetour']);
    const withRule = act(start(THE_ROAD_CREW, {}, 'joinersFoldingRule'), THE_ROAD_CREW, 'roadsideWork', 'takePaidWork');
    const work = act(withRule, THE_ROAD_CREW, 'paidWorksite', 'useFoldingRule');
    expect(work.character?.money).toBe(4);
    expect(work.character?.historyFlags).toContain('used_folding_rule_on_road_crew');
    const rope = act(start(THE_ROAD_CREW, {}, 'travelRope'), THE_ROAD_CREW, 'roadsideWork', 'useYourRope');
    const risky = THE_ROAD_CREW.scenes.ropeWork.choices.find(({ id }) => id === 'pullTogether')!;
    expect(risky.chance?.successNext).not.toBe(risky.chance?.failureNext);
    expect(risky.hint).toContain('wet timber');
    expect(rope.run?.sceneId).toBe('ropeWork');
  });

  it('keeps burial practical and respectful, with belongings handled only from the described table', () => {
    expect(A_PLACE_TO_BURY_HIM.scenes.chapelYard.text).toContain('belongings—a coat, a folded letter, and a purse—are laid on a table');
    const state = act(start(A_PLACE_TO_BURY_HIM), A_PLACE_TO_BURY_HIM, 'chapelYard', 'checkBelongings');
    expect(state.run?.sceneId).toBe('belongingsRecorded');
    expect(state.character?.knowledge.at(-1)).toContain('coat, folded letter, and purse');
    expect(state.run?.inventory).toContain('smallKnife');
    expect(state.run?.status).toBe('active');
  });

  it('lets fire witnesses report only a detail they actually saw, without assigning blame', () => {
    for (const [cause, choice] of [['wind', 'reportSpark'], ['stove', 'reportOpenStove']] as const) {
      const state = start(THE_STRAY_FIRE, { fireClue: cause });
      const available = THE_STRAY_FIRE.scenes.afterFlames.choices.filter(({ requirements }) => meets(requirements, state)).map(({ id }) => id);
      expect(available).toContain(choice);
      expect(available).not.toContain(cause === 'wind' ? 'reportOpenStove' : 'reportSpark');
    }
    const late = start(THE_STRAY_FIRE, { fireClue: 'lateArrival' });
    expect(THE_STRAY_FIRE.scenes.afterFlames.choices.filter(({ requirements }) => meets(requirements, late)).map(({ id }) => id))
      .toEqual(['offerRepair', 'leaveFire']);
    expect(THE_STRAY_FIRE.scenes.limitedAccount.text).toContain('cannot establish how the fire started');
  });

  it('foreshadows the closed ford risk, permits retreat, and leaves a successful crossing possible', () => {
    expect(THE_CLOSED_ROAD.scenes.fordApproach.text).toContain('water is higher than the road edge');
    expect(THE_CLOSED_ROAD.scenes.fordApproach.choices.find(({ id }) => id === 'crossFord')?.hint).toContain('sweep away your pack');
    const startState = act(start(THE_CLOSED_ROAD), THE_CLOSED_ROAD, 'fordApproach', 'crossFord');
    expect(startState.run?.sceneId).toBe('fordAttempt');
    const succeed = act(startState, THE_CLOSED_ROAD, 'fordAttempt', 'pressThrough', () => 0);
    expect(succeed.run?.sceneId).toBe('fordCrossed');
    const fail = act(start(THE_CLOSED_ROAD), THE_CLOSED_ROAD, 'fordApproach', 'crossFord');
    expect(act(fail, THE_CLOSED_ROAD, 'fordAttempt', 'pressThrough', () => 0.999999).run?.sceneId).toBe('slippedAtFord');
  });
});
