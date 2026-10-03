import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS } from './index';
import { NO_VACANCY } from './noVacancy';
import type { SaveData } from '../types';

function fresh(carriedItem: string | null = null, money = 0): SaveData {
  const character = newCharacter('No Vacancy Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  return { version: 1, bank: [], character, run: startRun(character, NO_VACANCY) };
}

function pick(state: SaveData, choiceId: string, random = () => 0): SaveData {
  const scene = NO_VACANCY.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scene.id} has choice ${choiceId}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, NO_VACANCY, choice!, random);
}

describe('No Vacancy', () => {
  it('registers for random repeat-avoiding play and direct QA launch', () => {
    expect(SCENARIOS).toContain(NO_VACANCY);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start No Vacancy');
    expect(NO_VACANCY.id).toBe('no-vacancy');
  });

  it('lets a fresh broke character succeed by allocating the room and sheltering upstairs', () => {
    expect(NO_VACANCY.scenes.keeperAccount.text).toMatch(/upstairs.*safe for now/i);
    expect(NO_VACANCY.scenes.guestAccounts.text).toMatch(/rescue crew he expects.*no crew/i);
    let state = pick(fresh(), 'askAda');
    state = pick(state, 'giveUpRoom');
    state = pick(state, 'roomForFamily');
    state = pick(state, 'holdTogether');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlySuccessEnding');
    expect(state.character?.money).toBe(0);
    expect(sceneText(NO_VACANCY.scenes.costlySuccessEnding, state)).toContain('Lena and her child get the only dry room');
    expect(NO_VACANCY.scenes.roofCrisis.text).toMatch(/bottom stair.*upstairs room.*still dry/i);
  });

  it('supports a different success route by repairing the window before allocating shelter', () => {
    let state = pick(fresh(), 'inspectHouse');
    state = pick(state, 'repairByHand', () => 0);
    expect(state.run?.flags).toContain('windowBraced');
    state = pick(state, 'roomForAmos');
    state = pick(state, 'trustTheBrace');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('orderRestoredEnding');
  });

  it('allows the misleading-authority claim to be investigated without revealing it beforehand', () => {
    const before = pick(fresh(), 'hearGuests');
    expect(NO_VACANCY.scenes.guestAccounts.text).not.toContain('schoolteacher');
    expect(sceneText(NO_VACANCY.scenes.guestAccounts, before)).not.toContain('schoolteacher');
    const after = pick(before, 'checkValeClaim');
    expect(after.run?.sceneId).toBe('valeRevealed');
    expect(sceneText(NO_VACANCY.scenes.valeRevealed, after)).toContain('schoolteacher and volunteer, not a county marshal');
    const exposed = pick(after, 'exposeVale');
    expect(exposed.character?.historyFlags).toContain('exposed_false_claim');
    expect(exposed.character?.knowledge.join(' ')).toContain('warning about the creek gauge is accurate');
  });

  it('allows leaving without forcing the player to manage the emergency', () => {
    let state = pick(fresh(), 'hearGuests');
    state = pick(state, 'leaveInn');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.character?.historyFlags).toContain('abandoned_overcrowded_inn');
  });

  it('records a costly success and a wrong-priority outcome without moral scoring', () => {
    let state = pick(fresh(), 'askAda');
    state = pick(state, 'offerBlanket');
    state = pick(state, 'keepDryRoom');
    state = pick(state, 'holdTogether');
    expect(state.run?.sceneId).toBe('costlySuccessEnding');
    expect(sceneText(NO_VACANCY.scenes.costlySuccessEnding, state)).toContain('You keep the dry room');
    expect(Object.keys(state.character ?? {})).not.toContain('morality');
  });

  it('reveals the consequence of trusting Vale’s claimed authority only after that choice', () => {
    let state = pick(fresh(), 'hearGuests');
    state = pick(state, 'askLena');
    state = pick(state, 'roomForVale');
    expect(sceneText(NO_VACANCY.scenes.roofCrisis, state)).not.toContain('schoolteacher');
    state = pick(state, 'holdTogether');
    expect(sceneText(NO_VACANCY.scenes.costlySuccessEnding, state)).toContain('Only after the storm do you learn he was a volunteer, not a marshal');
  });

  it('lets money buy optional carryable rewards, but never blocks a broke route', () => {
    let state = pick(fresh(), 'earnSupplyMoney');
    expect(state.run?.sceneId).toBe('supplyPayment');
    expect(state.character?.money).toBe(3);
    state = pick(state, 'browseGoods');
    state = pick(state, 'buyCanvas');
    expect(state.character?.money).toBe(1);
    expect(state.run?.inventory).toContain('waxedCanvasSheet');
    expect(state.run?.acquiredThisRun).toContain('waxedCanvasSheet');
    expect(ITEMS.waxedCanvasSheet.carryable).toBe(true);
    expect(ITEMS.compactStoveTool.carryable).toBe(true);
    const choices = NO_VACANCY.scenes.innGoods.choices;
    expect(choices.find((choice) => choice.id === 'buyCanvas')?.effects?.gainItems).toEqual(['waxedCanvasSheet']);
    expect(choices.find((choice) => choice.id === 'buyStoveTool')?.effects?.gainItems).toEqual(['compactStoveTool']);
    expect(choices.find((choice) => choice.id === 'buyMatchCase')?.effects?.gainItems).toEqual(['windproofMatchCase']);
    expect(meets(choices.find((choice) => choice.id === 'buyStoveTool')?.requirements, fresh())).toBe(false);
    expect(meets(NO_VACANCY.scenes.supplyPayment.choices.find((choice) => choice.id === 'browseGoods')?.requirements, fresh())).toBe(true);
  });

  it('offers the existing Windproof Match Case as a modest, optional purchase after work', () => {
    let state = pick(fresh(), 'earnSupplyMoney');
    state = pick(state, 'browseGoods');
    expect(state.run?.sceneId).toBe('innGoods');
    const purchase = NO_VACANCY.scenes.innGoods.choices.find((choice) => choice.id === 'buyMatchCase')!;
    expect(meets(purchase.requirements, state)).toBe(true);
    state = pick(state, 'buyMatchCase');
    expect(state.character?.money).toBe(1);
    expect(state.run?.inventory).toContain('windproofMatchCase');
    expect(state.character?.historyFlags).toContain('bought_windproof_match_case_at_lantern_house');
    expect(state.run?.sceneId).toBe('shelterAllocation');

    let broke = fresh();
    broke.run!.sceneId = 'innGoods';
    expect(meets(purchase.requirements, broke)).toBe(false);
    const owner = fresh('windproofMatchCase', 3);
    owner.run!.sceneId = 'innGoods';
    expect(meets(purchase.requirements, owner)).toBe(false);
  });

  it('uses carried tools to make the structural repair faster and more reliable', () => {
    const state = pick(fresh('pocketToolkit'), 'inspectHouse');
    const toolAction = NO_VACANCY.scenes.houseInspection.choices.find((choice) => choice.id === 'repairWithGear')!;
    const handAction = NO_VACANCY.scenes.houseInspection.choices.find((choice) => choice.id === 'repairByHand')!;
    expect(meets(toolAction.requirements, state)).toBe(true);
    expect(meets(handAction.requirements, state)).toBe(false);
    expect(toolAction.timeCost).toBeLessThan(handAction.timeCost!);
    expect(toolAction.chance?.probability).toBeGreaterThan(handAction.chance?.probability ?? 0);
    const repaired = choose(state, NO_VACANCY, toolAction, () => 0);
    expect(repaired.run?.flags).toContain('windowBraced');
  });

  it('advances fictional time only through choices and intensifies narration at thresholds', () => {
    let state = pick(fresh(), 'inspectHouse');
    expect(state.run?.elapsedMinutes).toBe(4);
    state.run!.elapsedMinutes = 46;
    expect(timeStatus(NO_VACANCY, 46).phase?.id).toBe('critical');
    expect(sceneText(NO_VACANCY.scenes.roofCrisis, { ...state, run: { ...state.run!, sceneId: 'roofCrisis' } })).toContain('yard is a moving sheet of water');
    expect(NO_VACANCY.scenes.guestAccounts.choices.find((choice) => choice.id === 'checkValeClaim')?.timeCost).toBeGreaterThan(0);
    expect(NO_VACANCY.scenes.houseInspection.choices.find((choice) => choice.id === 'repairByHand')?.timeCost).toBe(12);
    expect(NO_VACANCY.scenes.houseInspection.choices.find((choice) => choice.id === 'repairWithGear')?.timeCost).toBe(5);
    const critical = fresh();
    critical.run!.sceneId = 'roofCrisis';
    critical.run!.elapsedMinutes = 45;
    expect(meets(NO_VACANCY.scenes.roofCrisis.choices.find((choice) => choice.id === 'secureWindowByHand')?.requirements, critical)).toBe(false);
    expect(meets(NO_VACANCY.scenes.roofCrisis.choices.find((choice) => choice.id === 'evacuateHouse')?.requirements, critical)).toBe(true);
  });

  it('keeps limited shelter and blankets distinct, and gives fresh characters the same core options', () => {
    const state = fresh();
    const keeper = pick(state, 'askAda');
    expect(sceneText(NO_VACANCY.scenes.keeperAccount, keeper)).toContain('one dry private room');
    const borrowed = pick(keeper, 'offerBlanket');
    expect(borrowed.run?.inventory).toContain('reserveBlanket');
    expect(ITEMS.reserveBlanket.carryable).toBe(false);
    expect(sceneText(NO_VACANCY.scenes.shelterAllocation, borrowed)).toContain('Lena’s child has one of the reserve blankets');
    expect(NO_VACANCY.scenes.shelterAllocation.choices).toHaveLength(4);
    expect(NO_VACANCY.scenes.shelterAllocation.choices.map((choice) => choice.id)).toEqual(['roomForFamily', 'roomForAmos', 'roomForVale', 'keepDryRoom']);
  });

  it('allows evacuation, a foreshadowed failed crossing, and death only after a dangerous check', () => {
    let state = pick(fresh(), 'askAda');
    state = pick(state, 'giveUpRoom');
    state = pick(state, 'roomForFamily');
    state = pick(state, 'evacuateHouse');
    const crossing = NO_VACANCY.scenes.floodedYard.choices.find((choice) => choice.id === 'crossWithoutRope')!;
    expect(crossing.hint).toContain('fall could injure you');
    state = choose(state, NO_VACANCY, crossing, () => 0.99);
    expect(state.run?.sceneId).toBe('washedStep');
    expect(state.run?.health).toBe(6);
    state.run!.health = 2;
    const desperate = NO_VACANCY.scenes.washedStepAgain.choices.find((choice) => choice.id === 'catchPorchLine')!;
    const dead = choose({ ...state, run: { ...state.run!, sceneId: 'washedStepAgain' } }, NO_VACANCY, desperate, () => 0.99);
    expect(dead.run?.status).toBe('death');
  });

  it('keeps history callbacks descriptive and never blocks a new character', () => {
    expect(NO_VACANCY.scenes.innArrival.textVariants?.[0].requirements?.historyFlags).toEqual(['organized_emergency_shelter']);
    const state = fresh();
    expect(NO_VACANCY.scenes.innArrival.choices.filter((choice) => meets(choice.requirements, state))).toHaveLength(4);
    expect(NO_VACANCY.scenes.keeperAccount.choices.filter((choice) => meets(choice.requirements, state)).length).toBeGreaterThanOrEqual(3);
  });

  it('has explicit, non-duplicating item acquisitions and does not reveal facts before discovery', () => {
    const claimTextBeforeDiscovery = NO_VACANCY.scenes.innArrival.text + NO_VACANCY.scenes.guestAccounts.text + NO_VACANCY.scenes.keeperAccount.text;
    expect(claimTextBeforeDiscovery).not.toContain('schoolteacher');
    expect(claimTextBeforeDiscovery).not.toContain('not a county marshal');
    expect(NO_VACANCY.scenes.innGoods.choices.find((choice) => choice.id === 'buyCanvas')?.label).toContain('Buy a waxed canvas sheet');
    expect(NO_VACANCY.scenes.innGoods.choices.find((choice) => choice.id === 'buyCanvas')?.requirements?.notItems).toContain('waxedCanvasSheet');
    expect(NO_VACANCY.scenes.keeperAccount.choices.find((choice) => choice.id === 'offerBlanket')?.effects?.gainItems).toEqual(['reserveBlanket']);
    expect(NO_VACANCY.scenes.keeperAccount.choices.find((choice) => choice.id === 'offerBlanket')?.requirements?.notItems).toContain('reserveBlanket');
    expect(NO_VACANCY.scenes.shelterAllocation.choices.find((choice) => choice.id === 'roomForVale')?.label).not.toContain('volunteer');
  });

  it('has a forward-only reachable graph with at most four actions and no active dead ends', () => {
    expect(findScenarioGraphProblems(NO_VACANCY)).toEqual([]);
    const queue: SaveData[] = [fresh(), fresh('pocketToolkit', 3)];
    const seen = new Set<string>();
    const deadEnds: string[] = [];
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, flags: [...run.flags].sort(), items: [...run.inventory].sort(), money: state.character?.money, health: run.health, time: run.elapsedMinutes, knowledge: state.character?.knowledge, history: state.character?.historyFlags });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = NO_VACANCY.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const actions = scene.choices.filter((choice) => meets(choice.requirements, state));
      expect(actions.length).toBeLessThanOrEqual(4);
      if (!actions.length) deadEnds.push(scene.id);
      expect(actions.length, `No available action at ${scene.id}`).toBeGreaterThan(0);
      for (const action of actions) {
        const outcomes = [choose(state, NO_VACANCY, action, () => 0)];
        if (action.chance || action.effects?.combat) outcomes.push(choose(state, NO_VACANCY, action, () => 0.999999));
        for (const outcome of outcomes) {
          if (outcome.run) {
            expect(new Set(outcome.run.visitedSceneIds).size).toBe(outcome.run.visitedSceneIds?.length);
            expect(outcome.run.visitedSceneIds).toContain(outcome.run.sceneId);
            queue.push(JSON.parse(JSON.stringify(outcome)) as SaveData);
          }
        }
      }
    }
    expect(deadEnds).toEqual([]);
    expect(seen.size).toBeGreaterThan(20);
  });
});
