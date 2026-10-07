import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, sceneText, startAdventure, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import type { Choice, SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_WEIGHT_OF_GOLD } from './weightOfGold';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Freight Tester');
  character.carriedItem = carriedItem;
  return startAdventure({ version: 1, bank: [], character, run: null }, THE_WEIGHT_OF_GOLD);
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = THE_WEIGHT_OF_GOLD.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, THE_WEIGHT_OF_GOLD, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return THE_WEIGHT_OF_GOLD.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function explore(initial: SaveData): SaveData[] {
  const pending = [initial];
  const reached: SaveData[] = [];
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({ scene: run.sceneId, time: run.elapsedMinutes, hp: run.health, money: state.character?.money, inventory: run.inventory, flags: run.flags, history: state.character?.historyFlags, knowledge: state.character?.knowledge });
    if (seen.has(key)) continue;
    seen.add(key);
    reached.push(state);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable active scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} action count`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, THE_WEIGHT_OF_GOLD, choice, () => 0));
        pending.push(choose(state, THE_WEIGHT_OF_GOLD, choice, () => 0.999));
      } else pending.push(choose(state, THE_WEIGHT_OF_GOLD, choice, () => 0));
    }
  }
  return reached;
}

describe('The Weight of Gold', () => {
  it('is registered for random selection and direct QA launch only', () => {
    expect(SCENARIOS).toContain(THE_WEIGHT_OF_GOLD);
    expect(SCENARIOS).toContain(selectScenario(SCENARIOS, null, () => 0.999));
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start The Weight of Gold');
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
  });

  it('opens with plausible uncertainty and does not leak the hidden truth', () => {
    const text = sceneText(THE_WEIGHT_OF_GOLD.scenes.freightWreck, fresh());
    expect(text).toMatch(/wheel|axle/i);
    expect(text).toMatch(/cargo|gold|metal/i);
    expect(text).not.toMatch(/inside job|staged|Pell stole|planned theft/i);
    expect(THE_WEIGHT_OF_GOLD.scenes.axleEvidence.text).toMatch(/genuine accident/i);
    expect(THE_WEIGHT_OF_GOLD.scenes.cargoEvidence.text).toMatch(/no one is watching/i);
    expect(THE_WEIGHT_OF_GOLD.scenes.tracksEvidence.text).toMatch(/could be Pell|rescuer|stranger/i);
  });

  it('supports a fresh, broke, honest completion through search and rescue', () => {
    let state = act(fresh(), 'treatGuardFirst');
    state = act(state, 'askAdaAboutPell');
    state = act(state, 'followDragMarks');
    state = act(state, 'offerPellMedicalHelp');
    state = act(state, 'returnShipmentWithBoth');
    state = act(state, 'acceptFreightmansStrap');
    expect(state.run?.sceneId).toBe('shipmentRewardEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(state.run?.inventory).toContain('freightmansStrap');
    expect(state.character?.historyFlags).toContain('rescued_missing_guard');
    expect(state.character?.historyFlags).toContain('returned_valuable_shipment');
  });

  it('supports a people-first outcome that knowingly leaves the cargo unresolved', () => {
    let state = act(fresh(), 'treatGuardFirst');
    state = act(state, 'askAdaAboutPell');
    state = act(state, 'followDragMarks');
    state = act(state, 'offerPellMedicalHelp');
    state = act(state, 'leaveAfterReturningPell');
    expect(state.run?.sceneId).toBe('peopleSavedEnding');
    expect(state.character?.historyFlags).toContain('rescued_missing_guard');
    expect(THE_WEIGHT_OF_GOLD.scenes.peopleSavedEnding.text).toMatch(/freight remains exposed/i);
  });

  it('allows a cargo-first route with a real fictional-time cost', () => {
    let state = act(fresh(), 'inspectExposedCargo');
    state = act(state, 'coverCargo');
    expect(state.run?.elapsedMinutes).toBe(8);
    state = act(state, 'reachMilepost');
    expect(state.run?.elapsedMinutes).toBe(20);
    state = act(state, 'returnWithHelp');
    expect(state.run?.sceneId).toBe('shipmentReturned');
    state = act(state, 'acceptAssayersLoupe');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('shipmentRewardEnding');
    expect(state.run?.inventory).toContain('assayersLoupe');
    expect(state.character?.historyFlags).toContain('protected_freight_cargo');
  });

  it('lets the player steal openly as a choice and separately take coin unseen', () => {
    let bar = act(fresh(), 'inspectExposedCargo');
    bar = act(bar, 'takeGoldBar');
    expect(bar.character?.money).toBe(18);
    expect(bar.character?.historyFlags).toContain('stole_from_freight_wagon');
    expect(sceneText(THE_WEIGHT_OF_GOLD.scenes.heavyGoldTaken, bar)).toMatch(/climbing or running harder/i);
    bar = act(bar, 'leaveWithGold');
    expect(bar.run?.sceneId).toBe('stolenEscapeEnding');

    let coin = act(fresh(), 'inspectExposedCargo');
    expect(coin.run?.elapsedMinutes).toBe(3);
    coin = act(coin, 'pocketLooseCoin');
    expect(coin.run?.elapsedMinutes).toBe(5);
    expect(coin.character?.money).toBe(4);
    expect(coin.character?.historyFlags).toContain('pocketed_unclaimed_coin');
    expect(THE_WEIGHT_OF_GOLD.scenes.coinPocketed.text).toMatch(/whether anyone learns of it/i);
    coin = act(coin, 'takeFreightStrap');
    expect(coin.run?.inventory).toContain('freightmansStrap');
  });

  it('allows stolen weight to be abandoned for no net money gain', () => {
    let state = act(act(fresh(), 'inspectExposedCargo'), 'takeGoldBar');
    expect(state.character?.money).toBe(18);
    state = act(state, 'dropBarHelpGuard');
    expect(state.character?.money).toBe(0);
    expect(state.run?.sceneId).toBe('guardAccount');
    expect(state.character?.historyFlags).toContain('abandoned_stolen_cargo');
  });

  it('can uncover the inside job without claiming it caused the accident', () => {
    let state = act(fresh(), 'inspectWreck');
    state = act(state, 'checkAxleByHand');
    state = act(state, 'questionAdaAboutHarness');
    state = act(state, 'searchForPell');
    state = act(state, 'followDragMarks');
    state = act(state, 'askPellAboutRoute');
    expect(state.run?.sceneId).toBe('insideJobRevealed');
    expect(state.character?.knowledge).toContain('Pell chose the unlisted route to create a chance to take a bar after an expected axle failure.');
    expect(THE_WEIGHT_OF_GOLD.scenes.insideJobRevealed.text).toMatch(/axle still broke in the rut/i);
  });

  it('offers a no-reward walk-away ending', () => {
    let state = act(fresh(), 'inspectExposedCargo');
    state = act(state, 'coverCargo');
    state = act(state, 'leaveCoveredCargo');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('uses carried gear in an authored mechanical approach without requiring it', () => {
    const geared = act(fresh('pocketToolkit'), 'inspectWreck');
    expect(options(geared).map((choice) => choice.id)).toContain('checkAxleWithTool');
    expect(options(geared).map((choice) => choice.id)).not.toContain('checkAxleByHand');
    expect(options(geared).find((choice) => choice.id === 'checkAxleWithTool')?.timeCost).toBeLessThan(options(act(fresh(), 'inspectWreck')).find((choice) => choice.id === 'checkAxleByHand')?.timeCost ?? 0);
    expect(options(fresh()).length).toBeGreaterThan(1);
    const line = act(fresh('travelRope'), 'inspectWreck');
    expect(options(line).map((choice) => choice.id)).toContain('braceWithCarriedLine');
    const strap = act(fresh('freightmansStrap'), 'inspectWreck');
    expect(options(strap).map((choice) => choice.id)).toContain('braceWithCarriedLine');
  });

  it('makes waiting expose the scene to opportunists and supports both talk and force', () => {
    let state = act(fresh(), 'inspectExposedCargo');
    state = act(state, 'coverCargo');
    state = act(state, 'stayWithCargo');
    expect(timeStatus(THE_WEIGHT_OF_GOLD, state.run?.elapsedMinutes).phase?.id).toBe('dangerous');
    expect(sceneText(THE_WEIGHT_OF_GOLD.scenes.opportunists, state)).toMatch(/another cart|handcart/i);
    const risky = options(state).find((choice) => choice.id === 'standAgainstOpportunists')!;
    expect(risky.hint).toMatch(/outnumber|fight/i);
    const win = choose(state, THE_WEIGHT_OF_GOLD, risky, () => 0);
    expect(win.run?.sceneId).toBe('opportunistsDrivenOff');
    expect(win.run?.health).toBe(8);
  });

  it('lets a foreshadowed violent failure kill a low-health character through standard death handling', () => {
    let state = act(act(act(fresh(), 'inspectExposedCargo'), 'coverCargo'), 'stayWithCargo');
    state.run!.health = 1;
    state = act(state, 'standAgainstOpportunists', 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
  });

  it('preserves time, theft, money, knowledge, and history through save serialization', () => {
    let state = act(act(fresh(), 'inspectExposedCargo'), 'pocketLooseCoin');
    state = act(state, 'helpAfterCoin');
    const restored = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(restored.run?.elapsedMinutes).toBe(11);
    expect(restored.run?.visitedSceneIds).toEqual(state.run?.visitedSceneIds);
    expect(restored.character?.money).toBe(4);
    expect(restored.character?.historyFlags).toContain('stole_from_freight_wagon');
    expect(restored.run?.flags).toContain('tookLooseCoin');
    const dayLater = { ...restored, run: { ...restored.run!, startedAt: restored.run!.startedAt - 86_400_000 } };
    expect(dayLater.run?.elapsedMinutes).toBe(11);
  });

  it('keeps explicit rewards visible and history-based without any morality score', () => {
    expect(ITEMS.freightmansStrap.carryable).toBe(true);
    expect(ITEMS.assayersLoupe.carryable).toBe(true);
    expect(THE_WEIGHT_OF_GOLD.scenes.shipmentReturned.choices.some((choice) => choice.effects?.gainItems?.includes('freightmansStrap'))).toBe(true);
    expect(THE_WEIGHT_OF_GOLD.scenes.shipmentReturned.choices.some((choice) => choice.effects?.gainItems?.includes('assayersLoupe'))).toBe(true);
    expect(JSON.stringify(THE_WEIGHT_OF_GOLD)).not.toMatch(/morality|karma|alignment|greedScore/i);
    const granted = Object.values(THE_WEIGHT_OF_GOLD.scenes).flatMap((scene) => scene.choices.flatMap((choice) => choice.effects?.gainItems ?? []));
    expect(granted).toEqual(expect.arrayContaining(['freightmansStrap', 'assayersLoupe']));
    let reward = act(fresh(), 'treatGuardFirst');
    reward = act(reward, 'askAdaAboutPell');
    reward = act(reward, 'followDragMarks');
    reward = act(reward, 'offerPellMedicalHelp');
    reward = act(reward, 'returnShipmentWithBoth');
    reward = act(reward, 'acceptAssayersLoupe');
    expect(eligibleCarryItems(reward)).toContain('assayersLoupe');
  });

  it('has a forward-only graph and no reachable active dead end for fresh and geared characters', () => {
    expect(findScenarioGraphProblems(THE_WEIGHT_OF_GOLD)).toEqual([]);
    for (const carried of [null, 'pocketToolkit', 'travelRope', 'heavyLeatherGloves', 'ratCatchersHook']) {
      const reached = explore(fresh(carried));
      expect(reached.length).toBeGreaterThan(15);
      for (const state of reached) {
        const visited = state.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size).toBe(visited.length);
      }
    }
  });

  it('lets the player respond after a failed stand against the scavengers', () => {
    const state = fresh();
    state.run!.sceneId = 'opportunists';
    let result = act(state, 'standAgainstOpportunists', 0.99);
    expect(result.run?.sceneId).toBe('cargoLostEnding');
    expect(THE_WEIGHT_OF_GOLD.scenes.cargoLostEnding.ending).toBeUndefined();
    result = act(result, 'stayWithAdaAfterLoss');
    expect(THE_WEIGHT_OF_GOLD.scenes[result.run!.sceneId].title).toBe('Ada Is Not Left Behind');
    expect(THE_WEIGHT_OF_GOLD.scenes[result.run!.sceneId].text).toMatch(/scavengers keep the crate/i);
  });
});
