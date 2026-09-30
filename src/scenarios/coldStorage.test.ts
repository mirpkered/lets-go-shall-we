import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startAdventure, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { COLD_STORAGE } from './coldStorage';
import type { Choice, SaveData } from '../types';

function fresh(carriedItem: string | null = null, money = 0): SaveData {
  const character = newCharacter('Cold Storage Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  return { version: 1, bank: [], character, run: startRun(character, COLD_STORAGE) };
}

function pick(state: SaveData, choiceId: string, random = () => 0): SaveData {
  const scene = COLD_STORAGE.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scene.id} has choice ${choiceId}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, COLD_STORAGE, choice!, random);
}

function available(state: SaveData): Choice[] {
  return COLD_STORAGE.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

describe('Cold Storage', () => {
  it('registers for random starts, avoids an immediate repeat, and uses the QA direct-launch route', () => {
    expect(SCENARIOS).toContain(COLD_STORAGE);
    expect(selectScenario(SCENARIOS, COLD_STORAGE.id, () => 0)).not.toBe(COLD_STORAGE);
    expect(startAdventure({ version: 1, bank: [], character: null, run: null }, COLD_STORAGE).run?.scenarioId).toBe('cold-storage');
    expect(COLD_STORAGE.id).toBe('cold-storage');
  });

  it('lets a fresh broke character reach and rescue Mara through the main door', () => {
    let state = fresh();
    state = pick(state, 'inspectDoor');
    state = pick(state, 'forceDoor');
    expect(state.run?.sceneId).toBe('workerFound');
    expect(available(state).map((choice) => choice.id)).toContain('rescueWithoutGear');
    state = pick(state, 'rescueWithoutGear');
    state = pick(state, 'declineColdStorageReward');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('rescued_cold_storage_worker');
  });

  it('keeps door-force risk foreshadowed and failure advances to a consequence scene', () => {
    const state = pick(pick(fresh(), 'inspectDoor'), 'forceDoor', () => 0.99);
    expect(state.run?.sceneId).toBe('doorBruised');
    expect(state.run?.health).toBe(9);
    expect(COLD_STORAGE.scenes.doorSurvey.choices.find((choice) => choice.id === 'forceDoor')?.hint).toMatch(/bowed|jam/i);
    expect(available(state).length).toBeGreaterThan(0);
  });

  it('uses a carried repair tool for a faster relay route than the untooled bypass', () => {
    const tooled = fresh('pocketToolkit');
    let state = pick(tooled, 'inspectControls');
    expect(available(state).map((choice) => choice.id)).toContain('repairRelayWithTool');
    state = pick(state, 'repairRelayWithTool');
    expect(state.run?.sceneId).toBe('workerFound');
    expect(state.run?.elapsedMinutes).toBe(9);
    const bare = pick(fresh(), 'inspectControls');
    expect(available(bare).map((choice) => choice.id)).toContain('manualRelayBypass');
    expect(COLD_STORAGE.scenes.controlSurvey.choices.find((choice) => choice.id === 'manualRelayBypass')?.timeCost).toBeGreaterThan(5);
  });

  it('provides a distinct service-channel route with a dangerous but survivable untooled attempt', () => {
    let state = pick(pick(fresh(), 'inspectDoor'), 'searchServiceRoute');
    state = pick(state, 'descendWithoutGear', () => 0.99);
    expect(state.run?.sceneId).toBe('serviceSlip');
    expect(state.run?.health).toBe(7);
    state = pick(state, 'steadyAndContinue');
    expect(state.run?.sceneId).toBe('workerFound');
  });

  it('supports outside help for free, while money can pay to shorten the wait', () => {
    let broke = pick(fresh(), 'callCrew');
    broke = pick(broke, 'waitForCrew');
    expect(broke.run?.sceneId).toBe('crewOnScene');
    const paid = pick(pick(fresh(null, 3), 'callCrew'), 'payForHauler');
    expect(paid.run?.sceneId).toBe('crewOnScene');
    expect(paid.character?.money).toBe(1);
    expect(paid.run?.elapsedMinutes).toBe(8);
  });

  it('offers the difficult supplies-versus-rescue choice and records either consequence', () => {
    let state = pick(pick(pick(fresh(), 'inspectStock'), 'leaveGoodsAndReachWorker'), 'secureGoodsBeforeRescue');
    expect(state.run?.sceneId).toBe('lateGoodsSecured');
    expect(state.character?.historyFlags).toContain('prioritized_goods_over_worker');
    state = pick(state, 'rescueAfterSavingGoods');
    expect(state.run?.status).toBe('active');
    expect(state.run?.flags).toContain('workerWorsened');

    const lost = pick(pick(pick(fresh(), 'inspectStock'), 'leaveGoodsAndReachWorker'), 'secureGoodsBeforeRescue', () => 0.99);
    expect(lost.run?.sceneId).toBe('lateGoodsLost');
    expect(lost.run?.flags).toContain('goodsSpoiled');
  });

  it('allows a partial success that gets the player clear while a crew takes over', () => {
    let state = pick(pick(fresh(), 'inspectDoor'), 'forceDoor');
    state = pick(state, 'waitForWorkerCrew');
    state = pick(state, 'stabilizeRackForLater');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('partialEnding');
    expect(state.character?.historyFlags).toContain('returned_with_help');
  });

  it('recognizes useful carried equipment and offers two new carryable rewards', () => {
    let state = pick(fresh('travelRope'), 'inspectDoor');
    state = pick(state, 'searchServiceRoute');
    const lowered = pick(state, 'descendWithGear');
    expect(lowered.run?.sceneId).toBe('workerFound');
    expect(lowered.run?.elapsedMinutes).toBe(17);
    expect(ITEMS.compactBlockAndTackle.carryable).toBe(true);
    expect(ITEMS.icehouseTongs.carryable).toBe(true);
    const rewards = COLD_STORAGE.scenes.rescueDebrief.choices;
    expect(rewards.map((choice) => choice.effects?.gainItems?.[0])).toContain('compactBlockAndTackle');
    expect(rewards.map((choice) => choice.effects?.gainItems?.[0])).toContain('icehouseTongs');
    const earned = pick(pick(pick(fresh(), 'inspectDoor'), 'forceDoor'), 'rescueWithoutGear');
    const withReward = pick(earned, 'takeBlockAndTackle');
    expect(withReward.run?.inventory).toContain('compactBlockAndTackle');
    expect(withReward.run?.acquiredThisRun).toContain('compactBlockAndTackle');
  });

  it('uses an insulating carried item to preserve goods without revealing the stock early', () => {
    const start = fresh('waxedCanvasSheet');
    expect(COLD_STORAGE.scenes.loadingBay.text).not.toContain('medicine');
    const survey = pick(start, 'inspectStock');
    expect(COLD_STORAGE.scenes.loadingBay.text).not.toContain('Mara is pinned');
    expect(available(survey).map((choice) => choice.id)).toContain('coverGoodsFast');
    const saved = pick(survey, 'coverGoodsFast');
    expect(saved.run?.sceneId).toBe('goodsSecured');
    expect(saved.character?.historyFlags).toContain('saved_community_supplies');
  });

  it('supports an outside crew that safely wins the rescue without requiring the player to buy help', () => {
    let state = pick(pick(fresh(), 'callCrew'), 'waitForCrew');
    state = pick(state, 'crewWinchDoor');
    state = pick(state, 'crewRescueDirect');
    expect(state.run?.sceneId).toBe('rescueDebrief');
    expect(state.run?.flags).toContain('helpArrived');
  });

  it('allows the foreshadowed unstable-rack failure to be fatal only after another desperate attempt', () => {
    let state = fresh();
    state.run!.health = 9;
    state = pick(pick(pick(state, 'inspectDoor'), 'forceDoor'), 'liftUnstableRack', () => 0.99);
    expect(state.run?.sceneId).toBe('rackShift');
    expect(state.run?.health).toBe(6);
    state = pick(state, 'secondRackPull', () => 0.99);
    expect(state.run?.status).toBe('death');
  });

  it('keeps all reachable scenes actionable and never revisits a story scene', () => {
    expect(findScenarioGraphProblems(COLD_STORAGE)).toEqual([]);
    const queue = [fresh()];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.flags, run.elapsedMinutes, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
      if (seen.has(key) || run.status !== 'active') continue;
      seen.add(key);
      const scene = COLD_STORAGE.scenes[run.sceneId];
      expect(scene, `reachable scene ${run.sceneId} exists`).toBeDefined();
      const choices = available(state);
      expect(choices.length, `${run.sceneId} has an available action`).toBeGreaterThan(0);
      expect(choices.length, `${run.sceneId} presents at most four actions`).toBeLessThanOrEqual(4);
      for (const choice of choices) {
        for (const roll of choice.chance ? [() => 0, () => 0.999999] : [() => 0]) {
          const next = choose(state, COLD_STORAGE, choice, roll);
          if (next.run?.status === 'active') {
            expect(next.run.visitedSceneIds?.length).toBe(new Set(next.run.visitedSceneIds).size);
            queue.push(next);
          }
        }
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });
});
