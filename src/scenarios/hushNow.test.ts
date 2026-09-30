import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, sceneText, startAdventure, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import type { Choice, SaveData } from '../types';
import { SCENARIOS } from './index';
import { HUSH_NOW } from './hushNow';

function fresh(carriedItem: string | null = null, money = 0): SaveData {
  const character = newCharacter('Hush Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  return startAdventure({ version: 1, bank: [], character, run: null }, HUSH_NOW);
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = HUSH_NOW.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, HUSH_NOW, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return HUSH_NOW.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function explore(initial: SaveData): SaveData[] {
  const pending = [initial];
  const reached: SaveData[] = [];
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    // Choice availability depends on scene, health, money, and inventory here;
    // history and knowledge alter narration only, while time is covered separately.
    const key = JSON.stringify({ scene: run.sceneId, health: run.health, money: state.character?.money, inventory: run.inventory });
    if (seen.has(key)) continue;
    seen.add(key);
    reached.push(state);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable active scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} action count`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, HUSH_NOW, choice, () => 0));
        pending.push(choose(state, HUSH_NOW, choice, () => 0.999));
      } else pending.push(choose(state, HUSH_NOW, choice, () => 0));
    }
  }
  return reached;
}

describe('Hush Now', () => {
  it('is registered for random selection and direct QA launch', () => {
    expect(SCENARIOS).toContain(HUSH_NOW);
    expect(SCENARIOS).toContain(selectScenario(SCENARIOS, null, () => 0.999));
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start Hush Now');
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
  });

  it('starts uncertain, gives at least three plausible readings, and keeps the truth hidden', () => {
    const opening = sceneText(HUSH_NOW.scenes.farmhouseArrival, fresh());
    expect(opening).toMatch(/sheep|cow/i);
    expect(opening).toMatch(/has not returned/i);
    expect(opening).not.toMatch(/heifer|predator|trespasser|pinned/i);
    expect(HUSH_NOW.scenes.householdAccounts.text).toMatch(/animal may have broken loose/i);
    expect(HUSH_NOW.scenes.householdAccounts.text).toMatch(/Nell is trying to get back/i);
    expect(HUSH_NOW.scenes.householdAccounts.text).toMatch(/drainage cut carries sound strangely/i);
    expect(HUSH_NOW.scenes.personFound.text).toMatch(/lead the frightened heifer away/i);
  });

  it('supports a fresh, broke, quiet success without requiring carried gear', () => {
    let state = act(fresh(), 'listenAtDoor');
    state = act(state, 'followQuietTapping');
    state = act(state, 'approachCutQuietly');
    state = act(state, 'descendCarefully', 0);
    expect(state.run?.sceneId).toBe('personFound');
    state = act(state, 'liftBraceByHand', 0);
    state = act(state, 'calmHeiferByHand', 0);
    state = act(state, 'acceptFarmWhistle');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('safeHouseholdEnding');
    expect(state.run?.inventory).toContain('farmWhistle');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('stayed_quiet_during_farm_crisis');
    expect(state.character?.historyFlags).toContain('rescued_missing_family_member');
    expect(state.character?.historyFlags).toContain('protected_livestock');
  });

  it('supports a deliberate-noise success and a noise-caused livestock setback', () => {
    let helps = act(fresh(), 'lookThroughWindow');
    helps = act(helps, 'callOutWithoutSignal', 0);
    expect(helps.run?.sceneId).toBe('downhillAnswer');
    expect(helps.character?.historyFlags).toContain('called_out_during_farm_crisis');
    expect(helps.run?.flags).toContain('madeNoise');
    helps = act(helps, 'goToVoiceAtCut');
    helps = act(helps, 'descendCarefully', 0);
    expect(helps.run?.sceneId).toBe('personFound');

    let harms = act(fresh(), 'lookThroughWindow');
    harms = act(harms, 'callOutWithoutSignal', 0.999);
    expect(harms.run?.sceneId).toBe('animalsStartled');
    expect(harms.run?.flags).toContain('livestockPanicked');
    expect(options(harms).map((choice) => choice.id)).toContain('followLooseHeifer');
  });

  it('uses an carried whistle as a louder contextual signal, not a permanent stat', () => {
    const signal = act(fresh('trailWhistle'), 'lookThroughWindow');
    expect(options(signal).map((choice) => choice.id)).toContain('signalWithWhistle');
    expect(options(signal).map((choice) => choice.id)).not.toContain('callOutWithoutSignal');
    const success = act(signal, 'signalWithWhistle', 0);
    const failure = act(signal, 'signalWithWhistle', 0.999);
    expect(success.run?.sceneId).toBe('downhillAnswer');
    expect(failure.run?.sceneId).toBe('animalsStartled');
    expect(HUSH_NOW).not.toHaveProperty('noise');
  });

  it('supports livestock-first care before choosing whether to search for Nell', () => {
    let state = act(fresh(), 'askWhatHappened');
    state = act(state, 'inspectTheLivestock');
    expect(state.run?.sceneId).toBe('livestockClue');
    state = act(state, 'calmAnimalsQuietly', 0);
    expect(state.run?.sceneId).toBe('animalsCalmed');
    expect(state.character?.historyFlags).toContain('protected_livestock');
    state = act(state, 'searchAfterCalming');
    expect(state.run?.sceneId).toBe('heiferTrail');
  });

  it('supports seeking outside help and a real no-cost route for broke characters', () => {
    let broke = act(fresh(), 'askWhatHappened');
    broke = act(broke, 'callForNeighbor');
    expect(broke.character?.money).toBe(0);
    expect(options(broke).map((choice) => choice.id)).toContain('searchCutWithNeighbor');
    expect(options(broke).map((choice) => choice.id)).not.toContain('payForQuickWire');
    broke = act(broke, 'searchCutWithNeighbor');
    broke = act(broke, 'descendWithNeighbor');
    expect(broke.run?.sceneId).toBe('personFound');

    let paid = act(fresh(null, 3), 'askWhatHappened');
    paid = act(paid, 'callForNeighbor');
    expect(options(paid).map((choice) => choice.id)).toContain('payForQuickWire');
    paid = act(paid, 'payForQuickWire');
    expect(paid.character?.money).toBe(0);
    expect(paid.run?.sceneId).toBe('neighborSecuresAnimals');
  });

  it('offers a walk-away ending without moral judgment or an automatic reward', () => {
    const state = act(fresh(), 'leaveNow');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(HUSH_NOW.scenes.walkAwayEnding.text).not.toMatch(/good person|bad person|judg/i);
  });

  it('lets a wrong suspicion recover through evidence instead of an instant punishment', () => {
    let state = act(fresh(), 'lookThroughWindow');
    expect(sceneText(HUSH_NOW.scenes.windowView, state)).toMatch(/person, an animal, or a tarp/i);
    state = act(state, 'approachFenceQuietly');
    state = act(state, 'inspectGateMechanism');
    state = act(state, 'checkGateByHand', 0);
    expect(state.run?.sceneId).toBe('gateEvidence');
    expect(state.character?.knowledge).toContain('The gate was pushed open from inside; pale livestock hair is caught on the hinge.');
    expect(options(state).map((choice) => choice.id)).toContain('followHoofprints');
  });

  it('makes waiting advance the clock and visibly worsen the situation without wall-clock effects', () => {
    let state = act(fresh(), 'listenAtDoor');
    state = act(state, 'waitInsideQuietly');
    expect(state.run?.elapsedMinutes).toBe(25);
    expect(timeStatus(HUSH_NOW, state.run?.elapsedMinutes).phase?.id).toBe('dangerous');
    expect(sceneText(HUSH_NOW.scenes.afterWaiting, state)).toMatch(/tapping comes again, weaker/i);
    const restored = JSON.parse(JSON.stringify(state)) as SaveData;
    restored.run!.startedAt -= 86_400_000;
    expect(restored.run?.elapsedMinutes).toBe(25);
    expect(restored.run?.flags).toContain('waitedQuietly');
    expect(restored.run?.visitedSceneIds).toEqual(state.run?.visitedSceneIds);

    let noisy = act(fresh(), 'lookThroughWindow');
    noisy = act(noisy, 'callOutWithoutSignal', 0);
    const resumedNoise = JSON.parse(JSON.stringify(noisy)) as SaveData;
    expect(resumedNoise.run?.flags).toContain('madeNoise');
    expect(resumedNoise.character?.historyFlags).toContain('called_out_during_farm_crisis');
    expect(resumedNoise.run?.sceneId).toBe('downhillAnswer');
  });

  it('uses carried tools and rope to change access, time, and rescue odds', () => {
    let tool = act(fresh('pocketToolkit'), 'lookThroughWindow');
    tool = act(tool, 'approachFenceQuietly');
    tool = act(tool, 'inspectGateMechanism');
    expect(options(tool).map((choice) => choice.id)).toContain('checkGateWithTool');
    const toolChoice = options(tool).find((choice) => choice.id === 'checkGateWithTool')!;
    const bare = act(act(act(fresh(), 'lookThroughWindow'), 'approachFenceQuietly'), 'inspectGateMechanism');
    const bareChoice = options(bare).find((choice) => choice.id === 'checkGateByHand')!;
    expect(toolChoice.timeCost).toBeLessThan(bareChoice.timeCost ?? Infinity);

    let rope = act(fresh('travelRope'), 'lookThroughWindow');
    rope = act(rope, 'approachFenceQuietly');
    rope = act(rope, 'followPrintsToCut');
    expect(options(rope).map((choice) => choice.id)).toContain('bringRopeToPrints');
    rope = act(rope, 'bringRopeToPrints');
    expect(options(rope).map((choice) => choice.id)).toContain('descendWithRope');
    expect(HUSH_NOW.scenes.drainageLip.choices.find((choice) => choice.id === 'descendWithRope')?.chance?.probability)
      .toBeGreaterThan(HUSH_NOW.scenes.drainageLip.choices.find((choice) => choice.id === 'descendCarefully')?.chance?.probability ?? 1);

    let hook = act(fresh('ratCatchersHook'), 'lookThroughWindow');
    hook = act(hook, 'approachFenceQuietly');
    hook = act(hook, 'inspectGateMechanism');
    expect(options(hook).map((choice) => choice.id)).toContain('useHookOnLatch');

    const lamp = act(fresh('minerHeadlamp'), 'lookThroughWindow');
    expect(options(lamp).map((choice) => choice.id)).toContain('searchWithHeadlamp');
  });

  it('supports two carryable, visibly offered rewards and avoids duplicate reward choices', () => {
    expect(ITEMS.farmWhistle.carryable).toBe(true);
    expect(ITEMS.gateHook.carryable).toBe(true);
    expect(HUSH_NOW.scenes.rewardOffer.choices.some((choice) => choice.effects?.gainItems?.includes('farmWhistle'))).toBe(true);
    expect(HUSH_NOW.scenes.rewardOffer.choices.some((choice) => choice.effects?.gainItems?.includes('gateHook'))).toBe(true);

    const alreadyHasWhistle = fresh('farmWhistle');
    alreadyHasWhistle.run!.sceneId = 'rewardOffer';
    const available = options(alreadyHasWhistle).map((choice) => choice.id);
    expect(available).not.toContain('acceptFarmWhistle');
    expect(available).toContain('acceptGateHook');

    let reward = act(fresh(), 'listenAtDoor');
    reward = act(reward, 'followQuietTapping');
    reward = act(reward, 'approachCutQuietly');
    reward = act(reward, 'callDownFromLip', 0);
    reward = act(reward, 'liftBraceByHand', 0);
    reward = act(reward, 'calmHeiferByHand', 0);
    reward = act(reward, 'acceptGateHook');
    expect(eligibleCarryItems(reward)).toContain('gateHook');
    expect(reward.run?.acquiredThisRun.filter((id) => id === 'gateHook')).toHaveLength(1);
  });

  it('uses prior history as a light callback while leaving fresh characters fully playable', () => {
    const returning = fresh();
    returning.character!.historyFlags = ['rescued_missing_family_member'];
    expect(sceneText(HUSH_NOW.scenes.farmhouseArrival, returning)).toMatch(/brought a missing person home before/i);
    const newPlayer = fresh();
    expect(sceneText(HUSH_NOW.scenes.farmhouseArrival, newPlayer)).not.toMatch(/recognizes you/i);
    expect(options(newPlayer).length).toBeGreaterThan(0);
  });

  it('allows a clearly foreshadowed failed descent to cause death through normal handling', () => {
    let state = act(act(act(fresh(), 'lookThroughWindow'), 'approachFenceQuietly'), 'followPrintsToCut');
    state.run!.health = 1;
    expect(HUSH_NOW.scenes.personTrail.choices.find((choice) => choice.id === 'followPrintsToDrain')?.hint).toMatch(/hurt/i);
    state = act(state, 'followPrintsToDrain', 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
  });

  it('has a forward-only graph and no reachable active zero-action state for fresh and geared characters', () => {
    expect(findScenarioGraphProblems(HUSH_NOW)).toEqual([]);
    for (const carried of [null, 'travelRope', 'pocketToolkit', 'minerHeadlamp', 'trailWhistle', 'ratCatchersHook']) {
      const reached = explore(fresh(carried));
      expect(reached.length).toBeGreaterThan(20);
      for (const state of reached) {
        const visited = state.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size).toBe(visited.length);
      }
    }
  });
});
