import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { SCENARIOS } from './index';
import { DEAD_MANS_HAND } from './deadMansHand';
import type { SaveData } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

function fresh(money = 0, carriedItem: string | null = null, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Traveler');
  character.money = money;
  character.carriedItem = carriedItem;
  character.historyFlags = historyFlags;
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, DEAD_MANS_HAND) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = DEAD_MANS_HAND.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, DEAD_MANS_HAND, choice!, () => roll);
}

function reachRisingTension(state = fresh()): SaveData {
  state = act(state, 'watchFromRail');
  return act(state, 'watchMercerFromRail');
}

describe('Dead Man’s Hand', () => {
  it('registers for random play, avoids immediate repeats, and appears in QA direct launch', async () => {
    const { selectScenario } = await import('../scenarioSelection');
    const { renderQaPanel } = await import('../qaPanel');
    expect(SCENARIOS).toContain(DEAD_MANS_HAND);
    expect(selectScenario(SCENARIOS, DEAD_MANS_HAND.id, () => 0)?.id).not.toBe(DEAD_MANS_HAND.id);
    const noRun = fresh();
    noRun.run = null;
    const qa = renderQaPanel(true, noRun, SCENARIOS, ITEMS);
    expect(qa).toContain('Start Dead Man’s Hand');
    expect(qa).toContain('data-qa-start="dead-mans-hand"');
    expect(renderQaPanel(false, noRun, SCENARIOS, ITEMS)).toBe('');
  });

  it('offers an observer route that can de-escalate the dispute without spending money', () => {
    let state = reachRisingTension();
    expect(state.character?.money).toBe(0);
    state = act(state, 'speakPrivatelyToBoone');
    state = act(state, 'askBooneToShowMarker');
    state = act(state, 'tellBooneToStandDown');
    expect(state.run?.sceneId).toBe('peacefulEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('prevented_saloon_violence');
  });

  it('supports a card-player route that can expose Mercer and explicitly award one carryable item', () => {
    let state = fresh(2);
    state = act(state, 'takeOpenSeat');
    state = act(state, 'buyIntoHand');
    expect(state.character?.money).toBe(0);
    state = act(state, 'callOneHand', 0);
    expect(state.run?.sceneId).toBe('handWon');
    expect(state.character?.money).toBe(3);
    state = act(state, 'standAfterWin');
    state = act(state, 'inspectWithoutTool', 0);
    expect(state.character?.knowledge).toContain('Mercer marked the backs of three aces with tiny half-moon nicks and reads them by touch.');
    state = act(state, 'bringMarksToTable');
    state = act(state, 'showMarkedAces');
    expect(state.run?.sceneId).toBe('exposureReward');
    expect(state.run?.inventory).not.toContain('dealerCardKnife');
    expect(state.run?.inventory).not.toContain('foldingCardMirror');
    state = act(state, 'acceptDealerKnife');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('dealerCardKnife');
    expect(state.run?.acquiredThisRun).toContain('dealerCardKnife');
    expect(state.character?.historyFlags).toContain('exposed_card_cheat');
  });

  it('uses an assayer’s loupe to inspect the card marks quickly without gating the untooled route', () => {
    const bare = reachRisingTension();
    const bareChoices = DEAD_MANS_HAND.scenes.risingTension.choices.filter((choice) => meets(choice.requirements, bare)).map((choice) => choice.id);
    expect(bareChoices).toContain('inspectWithoutTool');
    expect(bareChoices).not.toContain('inspectWithTool');
    const handInspected = act(bare, 'inspectWithoutTool', 0);

    const louped = reachRisingTension(fresh(0, 'assayersLoupe'));
    const loupedChoices = DEAD_MANS_HAND.scenes.risingTension.choices.filter((choice) => meets(choice.requirements, louped)).map((choice) => choice.id);
    expect(loupedChoices).toContain('inspectWithTool');
    expect(loupedChoices).not.toContain('inspectWithoutTool');
    const inspected = act(louped, 'inspectWithTool');
    expect(inspected.run?.elapsedMinutes).toBe((louped.run?.elapsedMinutes ?? 0) + 3);
    expect(handInspected.run?.elapsedMinutes).toBe((bare.run?.elapsedMinutes ?? 0) + 8);
    expect(inspected.run?.sceneId).toBe('markedDeckProof');
    expect(inspected.run?.inventory).toContain('assayersLoupe');
    expect(inspected.character?.knowledge).toContain('Mercer marked the backs of three aces with tiny half-moon nicks and reads them by touch.');
  });

  it('makes a paid hand a bounded money choice with clear wins and losses', () => {
    let state = act(fresh(2), 'takeOpenSeat');
    state = act(state, 'buyIntoHand');
    const won = act(state, 'callOneHand', 0);
    const lost = act(state, 'callOneHand', 0.99);
    expect(won.character?.money).toBe(3);
    expect(won.run?.flags).toContain('wonSaloonHand');
    expect(lost.character?.money).toBe(0);
    expect(lost.run?.sceneId).toBe('handLost');
    expect(lost.run?.flags).toContain('lostSaloonHand');
    expect(DEAD_MANS_HAND.scenes.handWon.text).toContain('three-dollar win');
    expect(DEAD_MANS_HAND.scenes.handLost.text).toContain('two-dollar stake is gone');
  });

  it('supports one narrative bluff with the same capped stake and distinct social reaction', () => {
    let state = act(fresh(2), 'takeOpenSeat');
    state = act(state, 'buyIntoHand');
    const bluff = DEAD_MANS_HAND.scenes.playerHand.choices.find((choice) => choice.id === 'bluffOneHand')!;
    expect(bluff.hint).toContain('same two-dollar stake');
    const won = act(state, 'bluffOneHand', 0);
    const lost = act(state, 'bluffOneHand', 0.99);
    expect(won.character?.money).toBe(3);
    expect(won.run?.flags).toContain('bluffedMercer');
    expect(lost.character?.money).toBe(0);
    expect(lost.run?.sceneId).toBe('handLost');
    expect(lost.run?.flags).toContain('bluffedMercer');
  });

  it('allows a wrong accusation and stores the behavior as character history', () => {
    let state = act(fresh(), 'watchFromRail');
    state = act(state, 'watchAdaFromRail');
    state = act(state, 'speakPrivatelyToBoone');
    state = act(state, 'askBooneToShowMarker');
    state = act(state, 'accuseAda');
    expect(state.run?.sceneId).toBe('wrongAccusationEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('falsely_accused_ada');
    expect(JSON.parse(JSON.stringify(state)).character.historyFlags).toContain('falsely_accused_ada');
  });

  it('treats walking away as a valid ending and records it without judgment', () => {
    const state = act(fresh(), 'leaveAtArrival');
    expect(state.run?.sceneId).toBe('walkAwayAtArrival');
    expect(state.run?.completionQualification).toBe('nonSubstantive');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('walked_away_from_saloon_dispute');
    expect(DEAD_MANS_HAND.scenes.walkAwayEnding.text).toContain('not yours to settle');
  });

  it('supports violent but survivable intervention after clearly warned danger', () => {
    let state = act(fresh(), 'takeOpenSeat');
    state = act(state, 'sitWithoutBet');
    state = act(state, 'foldAndWatch');
    state = act(state, 'watchMercersThumb');
    state = act(state, 'speakPrivatelyToBoone');
    state = act(state, 'askBooneToShowMarker');
    state = act(state, 'stepBetweenThem', 0.99);
    expect(state.run?.sceneId).toBe('gunDrawn');
    expect(state.run?.health).toBe(9);
    expect(DEAD_MANS_HAND.scenes.gunDrawn.text).toContain('could get you shot');
    state = act(state, 'knockPistolAside', 0);
    expect(state.run?.sceneId).toBe('weaponDown');
    state = act(state, 'letBooneGo');
    expect(state.run?.sceneId).toBe('violentSurvivalEnding');
    expect(state.run?.status).toBe('success');
  });

  it('allows death only after the pistol is visibly raised and an explicitly lethal rush fails', () => {
    const state = fresh();
    state.run!.sceneId = 'gunDrawn';
    expect(DEAD_MANS_HAND.scenes.gunDrawn.tone).toBe('danger');
    const dead = act(state, 'knockPistolAside', 0.99);
    expect(dead.run?.status).toBe('death');
    expect(dead.run?.sceneId).toBe('__death');
  });

  it('lets tools save time and certainty without making them a prerequisite', () => {
    const tooled = reachRisingTension(fresh(0, 'pocketToolkit'));
    const noTool = reachRisingTension();
    const fast = act(tooled, 'inspectWithTool');
    const carefulSuccess = act(noTool, 'inspectWithoutTool', 0);
    const carefulFailure = act(noTool, 'inspectWithoutTool', 0.99);
    expect(fast.run?.elapsedMinutes).toBe(8);
    expect(carefulSuccess.run?.elapsedMinutes).toBe(13);
    expect(carefulFailure.run?.sceneId).toBe('uncertainCards');
    expect(carefulFailure.run?.status).toBe('active');
    expect(DEAD_MANS_HAND.scenes.uncertainCards.choices).toHaveLength(1);
    const proofOptions = DEAD_MANS_HAND.scenes.risingTension.choices.filter((choice) => meets(choice.requirements, tooled));
    expect(proofOptions.map((choice) => choice.id)).toContain('inspectWithTool');
    expect(fast.run?.inventory).toContain('pocketToolkit');
  });

  it('changes the available response and warning as the fictional clock advances', () => {
    const early = reachRisingTension();
    const late = structuredClone(early);
    late.run!.elapsedMinutes = 15;
    const earlyChoices = DEAD_MANS_HAND.scenes.risingTension.choices.filter((choice) => meets(choice.requirements, early));
    const lateChoices = DEAD_MANS_HAND.scenes.risingTension.choices.filter((choice) => meets(choice.requirements, late));
    expect(earlyChoices.map((choice) => choice.id)).toContain('fetchMarshal');
    expect(lateChoices.map((choice) => choice.id)).not.toContain('fetchMarshal');
    expect(lateChoices.length).toBeGreaterThan(0);
    expect(sceneText(DEAD_MANS_HAND.scenes.risingTension, late)).toContain('office across the street is dark');
    expect(timeStatus(DEAD_MANS_HAND, 19).phase?.id).toBe('voicesRising');
    expect(timeStatus(DEAD_MANS_HAND, 20).phase?.id).toBe('handsNearBelts');
    let waiting = act(fresh(), 'watchFromRail');
    waiting = act(waiting, 'waitAnotherRound');
    expect(waiting.run?.elapsedMinutes).toBe(15);
    expect(waiting.run?.status).toBe('active');
  });

  it('uses history as optional trust, while a new character retains every core route', () => {
    const freshState = fresh();
    const knownHistory = fresh(0, null, ['rescued_missing_person']);
    expect(sceneText(DEAD_MANS_HAND.scenes.bartenderOpening, knownHistory)).toContain('recognizes you from the mine rescue');
    expect(sceneText(DEAD_MANS_HAND.scenes.bartenderOpening, freshState)).not.toContain('recognizes you from the mine rescue');
    expect(DEAD_MANS_HAND.scenes.saloonArrival.choices.map((choice) => choice.id)).toEqual(expect.arrayContaining(['takeOpenSeat', 'watchFromRail', 'speakToMabel', 'leaveAtArrival']));
    expect(DEAD_MANS_HAND.scenes.saloonArrival.choices.every((choice) => !choice.requirements?.historyFlags)).toBe(true);
  });

  it('keeps hidden methods out of the narration until the character finds them', () => {
    const unknowing = fresh();
    expect(sceneText(DEAD_MANS_HAND.scenes.saloonArrival, unknowing).toLowerCase()).not.toContain('marked ace');
    expect(sceneText(DEAD_MANS_HAND.scenes.risingTension, unknowing).toLowerCase()).not.toContain('half-moon nick');
    expect(DEAD_MANS_HAND.scenes.markedDeckProof.text.toLowerCase()).toContain('half-moon nicks');
    const informed = structuredClone(unknowing);
    informed.character!.knowledge.push(KNOWLEDGE_FACTS.markedAces.text);
    informed.character!.knowledgeKeys!.push(KNOWLEDGE_FACTS.markedAces.id);
    expect(sceneText(DEAD_MANS_HAND.scenes.readyConfrontation, informed)).toContain('three aces carry matching half-moon nicks');
  });

  it('does not silently grant rewards and prevents duplicate carryable acquisitions', () => {
    const state = fresh();
    state.run!.sceneId = 'exposureReward';
    const rewardScene = DEAD_MANS_HAND.scenes.exposureReward;
    expect(rewardScene.text).toContain('offers one useful object');
    expect(state.run?.inventory).not.toContain('dealerCardKnife');
    expect(state.run?.inventory).not.toContain('foldingCardMirror');
    for (const choice of rewardScene.choices.filter((entry) => entry.effects?.gainItems)) {
      expect(choice.label.toLowerCase()).toContain('accept');
      expect(choice.hint).toMatch(/hands|places it in your hand/i);
    }
    state.run!.inventory.push('dealerCardKnife');
    const available = rewardScene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).not.toContain('acceptDealerKnife');
    expect(available.map((choice) => choice.id)).toContain('acceptCardMirror');
    expect(ITEMS.dealerCardKnife.carryable).toBe(true);
    expect(ITEMS.foldingCardMirror.carryable).toBe(true);
  });

  it('validates a forward-only graph and never reaches a zero-action active scene', () => {
    expect(findScenarioGraphProblems(DEAD_MANS_HAND)).toEqual([]);
    const queue: SaveData[] = [fresh(4)];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), knowledge: [...state.character!.knowledge].sort(), history: [...state.character!.historyFlags].sort(), money: state.character!.money, health: run.health, elapsed: run.elapsedMinutes });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = DEAD_MANS_HAND.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
      expect(choices.length, `${run.sceneId} must always have an available action`).toBeGreaterThan(0);
      for (const choice of choices) {
        const outcomes = [choose(state, DEAD_MANS_HAND, choice, () => 0)];
        if (choice.chance) outcomes.push(choose(state, DEAD_MANS_HAND, choice, () => 0.999999));
        for (const outcome of outcomes) {
          const visits = outcome.run?.visitedSceneIds ?? [];
          expect(new Set(visits).size).toBe(visits.length);
          if (outcome.run) expect(visits).toContain(outcome.run.sceneId);
          queue.push(outcome);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });
});
