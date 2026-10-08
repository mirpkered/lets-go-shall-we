import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS } from './index';
import { ONE_MORE_ROUND } from './oneMoreRound';
import type { Choice, SaveData } from '../types';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Tavern Tester');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, ONE_MORE_ROUND) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = ONE_MORE_ROUND.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, ONE_MORE_ROUND, choice!, () => random);
}

function options(state: SaveData): Choice[] {
  return ONE_MORE_ROUND.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

describe('One More Round', () => {
  it('reminds the player plainly of the broken-window dispute without changing the evidence chain', () => {
    expect(ONE_MORE_ROUND.scenes.disputeEscalates.text).toContain('The old dispute over Rafe’s broken-window bill makes Sella quicker to suspect him.');
    expect(ONE_MORE_ROUND.scenes.disputeEscalates.text).not.toContain('old window debt');
    expect(ONE_MORE_ROUND.scenes.rafeAccount.text).toContain('did break Sella’s front window last winter');
    expect(ONE_MORE_ROUND.scenes.disputeEscalates.choices.map((choice) => choice.id)).toContain('searchFromDispute');
    expect(ONE_MORE_ROUND.scenes.purseFound.text).toContain('that is a different matter');
    expect(ONE_MORE_ROUND.scenes.purseFound.choices.map((choice) => choice.id)).toContain('returnPurseNoDebt');
  });

  it('registers for repeat-avoiding random play and direct QA launch', () => {
    expect(SCENARIOS).toContain(ONE_MORE_ROUND);
    expect(selectScenario(SCENARIOS, ONE_MORE_ROUND.id, () => 0)).not.toBe(ONE_MORE_ROUND);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start One More Round');
    expect(startAdventure(empty, ONE_MORE_ROUND).run?.scenarioId).toBe(ONE_MORE_ROUND.id);
  });

  it('lets a fresh broke character find the purse and resolve the accusation', () => {
    let state = fresh();
    for (const id of ['listenFromBar', 'questionServerEarly', 'bringServerAccountToGroup', 'searchFromDispute', 'searchBenchByHand', 'returnPurseNoDebt', 'declineTavernRewardtruthEnding']) state = act(state, id);
    expect(state.run?.sceneId).toBe('truthEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('exposed_tavern_truth');
  });

  it('supports a separate peaceful route without requiring a history callback', () => {
    let state = act(act(fresh(), 'listenFromBar'), 'stepInBeforeAccusation');
    state = act(state, 'talkThemDown');
    expect(state.run?.sceneId).toBe('quietRewards');
    state = act(state, 'declineTavernRewardpeacefulEnding');
    expect(state.run?.sceneId).toBe('peacefulEnding');
    expect(state.character?.historyFlags).toContain('broke_up_tavern_fight');
  });

  it('allows a wrong accusation and records its social consequence', () => {
    let state = act(fresh(), 'listenFromBar');
    state = act(state, 'lookAtCounter');
    state = act(state, 'goToConfrontation');
    state = act(state, 'accuseRafe');
    state = act(state, 'leaveAfterAccusing');
    expect(state.run?.sceneId).toBe('falseAccusationEnding');
    expect(state.character?.historyFlags).toContain('falsely_accused_patron');
  });

  it('permits walking away without a reward', () => {
    const state = act(fresh(), 'leaveAtArrival');
    expect(state.run?.sceneId).toBe('walkAwayAtArrival');
    expect(state.run?.completionQualification).toBe('nonSubstantive');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('has distinct early and late one-more-round consequences', () => {
    let early = act(fresh(1), 'orderFirstRound');
    expect(early.character?.money).toBe(0);
    early = act(early, 'watchTheStool');
    expect(early.run?.flags).toContain('orderedOneMoreRound');
    expect(early.character?.knowledge.some((entry) => entry.includes('Pell bumped'))).toBe(true);

    let late = act(fresh(1), 'askRafeAboutDebt');
    late = act(late, 'askServerForRafe');
    const elapsedBeforeWait = late.run?.elapsedMinutes;
    late = act(late, 'waitForMoreConversation');
    expect(late.run?.elapsedMinutes).toBe((elapsedBeforeWait ?? 0) + 6);
    expect(timeStatus(ONE_MORE_ROUND, late.run?.elapsedMinutes).phase?.label).toBe('Heated');
    late = act(late, 'orderLateRound');
    expect(late.run?.sceneId).toBe('lateRoundHazard');
    expect(late.run?.flags).toContain('lateRoundMadeThingsWorse');
    expect(late.character?.money).toBe(0);
  });

  it('uses a carried Rat-Catcher’s Hook to improve a search and reduce its time cost', () => {
    let state = act(fresh(0, 'ratCatchersHook'), 'listenFromBar');
    state = act(state, 'questionServerEarly');
    state = act(state, 'searchAfterServer');
    const before = state.run!.elapsedMinutes ?? 0;
    state = act(state, 'searchBenchWithGear');
    expect(state.run?.sceneId).toBe('purseFound');
    expect(state.run!.elapsedMinutes! - before).toBe(3);
  });

  it('uses the new Brass Bottle Opener as a practical inspection tool', () => {
    let state = act(act(fresh(0, 'brassBottleOpener'), 'askRafeAboutDebt'), 'askRafeWhereHeStood');
    state = act(state, 'inspectTillFromDispute');
    expect(state.run?.sceneId).toBe('cashboxInspection');
    expect(options(state).map((choice) => choice.id)).toContain('inspectTillWithTool');
    expect(options(state).map((choice) => choice.id)).not.toContain('inspectTillByHand');
    state = act(state, 'inspectTillWithTool');
    expect(state.run?.sceneId).toBe('cashboxClue');
  });

  it('allows a risky search to fail without ending the story, while moving time and scene forward', () => {
    let state = act(act(act(fresh(), 'listenFromBar'), 'questionServerEarly'), 'searchAfterServer');
    const failed = act(state, 'searchBenchByHand', 0.999);
    expect(failed.run?.sceneId).toBe('searchMissed');
    expect(failed.run?.status).toBe('active');
    expect(failed.run!.elapsedMinutes).toBeGreaterThan(state.run!.elapsedMinutes!);
    expect(failed.run?.flags).toContain('searchFailed');
  });

  it('spends character money to settle the separate debt without claiming the purse was found', () => {
    let state = act(act(fresh(2), 'listenFromBar'), 'askSellaAboutPurse');
    state = act(state, 'payRafeDebt');
    expect(state.character?.money).toBe(0);
    expect(state.run?.sceneId).toBe('paidDebtEnding');
    expect(ONE_MORE_ROUND.scenes.paidDebtEnding.text).toContain('purse is still missing');
  });

  it('supports a gear-based physical intervention and offers visible carry rewards', () => {
    let state = act(act(fresh(0, 'heavyLeatherGloves'), 'listenFromBar'), 'stepInBeforeAccusation');
    const separate = options(state).find((choice) => choice.id === 'separateWithGear');
    expect(separate).toBeDefined();
    state = act(state, 'separateWithGear');
    state = act(state, 'leaveAfterStoppingFight');
    expect(state.run?.sceneId).toBe('fightStoppedEnding');

    state = act(act(act(act(fresh(), 'listenFromBar'), 'questionServerEarly'), 'searchAfterServer'), 'searchBenchByHand', 0);
    state = act(state, 'returnPurseNoDebt');
    expect(options(state).map((choice) => choice.label)).toContain('Accept the brass bottle opener');
    expect(options(state).map((choice) => choice.label)).toContain('Accept the heavy leather gloves');
    state = act(state, 'acceptBottleOpenertruthEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toContain('brassBottleOpener');
    expect(ITEMS.brassBottleOpener.carryable).toBe(true);
  });

  it('keeps the actual truth hidden until the purse is recovered', () => {
    const state = fresh();
    for (const id of ['tavernArrival', 'heardArgument', 'rafeAccount', 'sellaAccount', 'serverAccount', 'roundPause', 'pellAccount', 'disputeEscalates', 'confrontation']) {
      const text = sceneText(ONE_MORE_ROUND.scenes[id], state);
      expect(text).not.toMatch(/caught in the split bench|was not taken from the room/i);
    }
    expect(ONE_MORE_ROUND.scenes.purseFound.text).toMatch(/wedged inside the bench|caught in the split bench/i);
  });

  it('preserves elapsed fictional time and the exact active scene through a save-shaped copy', () => {
    let state = act(act(fresh(), 'askRafeAboutDebt'), 'askRafeWhereHeStood');
    const resumed = structuredClone(state);
    expect(resumed.run?.sceneId).toBe(state.run?.sceneId);
    expect(resumed.run?.elapsedMinutes).toBe(state.run?.elapsedMinutes);
    expect(resumed.run?.visitedSceneIds).toEqual(state.run?.visitedSceneIds);
    expect(sceneText(ONE_MORE_ROUND.scenes.disputeEscalates, resumed)).toBe(sceneText(ONE_MORE_ROUND.scenes.disputeEscalates, state));
  });

  it('does not give invisible rewards or duplicate an already-held unique opener', () => {
    for (const scene of Object.values(ONE_MORE_ROUND.scenes)) {
      for (const choice of scene.choices) {
        for (const itemId of choice.effects?.gainItems ?? []) expect(choice.label.toLowerCase()).toContain(ITEMS[itemId].name.toLowerCase());
      }
    }
    let state = act(act(fresh(0, 'brassBottleOpener'), 'listenFromBar'), 'questionServerEarly');
    state = act(state, 'searchAfterServer');
    state = act(state, 'searchBenchByHand');
    state = act(state, 'returnPurseNoDebt');
    expect(options(state).map((choice) => choice.id)).not.toContain('acceptBottleOpenertruthEnding');
  });

  it('makes a dangerous bare-handed intervention risky but foreshadowed', () => {
    let state = fresh();
    state.run!.sceneId = 'threatMoment';
    state.run!.visitedSceneIds = ['tavernArrival', 'threatMoment'];
    state.run!.health = 5;
    expect(ONE_MORE_ROUND.scenes.threatMoment.text).toMatch(/jagged neck|sharp edge/i);
    state = act(state, 'stepBetweenBarehanded', 0.999);
    expect(state.run?.status).toBe('death');
  });

  it('validates the forward-only graph and every reachable active scene keeps an action', () => {
    expect(findScenarioGraphProblems(ONE_MORE_ROUND)).toEqual([]);
    for (const scene of Object.values(ONE_MORE_ROUND.scenes)) {
      expect(scene.choices.length).toBeLessThanOrEqual(4);
      if (!scene.ending) expect(scene.choices.length).toBeGreaterThan(0);
    }
    const queue: SaveData[] = [fresh(3)];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), knowledge: [...state.character!.knowledge].sort(), history: [...state.character!.historyFlags].sort(), money: state.character!.money, health: run.health, elapsed: run.elapsedMinutes });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = ONE_MORE_ROUND.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const available = options(state);
      expect(available.length, `${scene.id} must have an available action`).toBeGreaterThan(0);
      for (const choice of available) {
        const outcomes = [choose(state, ONE_MORE_ROUND, choice, () => 0)];
        if (choice.chance) outcomes.push(choose(state, ONE_MORE_ROUND, choice, () => 0.999999));
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
