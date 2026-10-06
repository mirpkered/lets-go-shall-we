import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, startRun, meets } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { GEAR_CORRECTIVE_ADVENTURES, THE_APPRENTICES_LIGHT, THE_BRIDGE_CREWS_WEDGE, THE_CLAIMED_SALVAGE, THE_LAST_SURVEY, THE_QUARTERMASTERS_TALLY, THE_SOUNDING_LINE, THE_SQUIRES_PACK, THE_WHEEL_BEFORE_DAWN } from './gearCorrectiveBatch';
import { THE_TRESTLE_TABLE } from './surpriseEverydayBatch';
import type { SaveData, Scenario } from '../types';

function start(scenario: Scenario, item?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Gear Batch Tester');
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), character, bank, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, choiceId: string): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => 0);
}

function acquire(scenario: Scenario, route: string[], itemId: string): SaveData {
  let state = start(scenario);
  for (const choice of route) state = act(state, scenario, choice);
  expect(state.run?.status).toBe('success');
  expect(state.run?.acquiredThisRun).toContain(itemId);
  state = openRewardResolution(state);
  expect(state.run?.rewardPendingItems).toContain(itemId);
  state = placeReward(state, itemId, 'carry');
  state = finishRewardResolution(state);
  expect(getCarriedItems(state.character)).toContain(itemId);
  return state;
}

describe('corrective Gear Adventure batch', () => {
  it('registers eight unique all-year Adventures with seven legitimate persistent Gear paths', () => {
    expect(GEAR_CORRECTIVE_ADVENTURES).toHaveLength(8);
    expect(SCENARIOS).toHaveLength(487);
    expect(new Set(GEAR_CORRECTIVE_ADVENTURES.map(({ id }) => id)).size).toBe(8);
    expect(GEAR_CORRECTIVE_ADVENTURES.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(GEAR_CORRECTIVE_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    const gearRewardScenarios = GEAR_CORRECTIVE_ADVENTURES.filter((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) => choice.effects?.gainItems?.length)));
    expect(gearRewardScenarios).toHaveLength(7);
    expect(validateScenarioRegistry(GEAR_CORRECTIVE_ADVENTURES).errors).toEqual([]);
    expect(validateScenarioRegistry(GEAR_CORRECTIVE_ADVENTURES).warnings).toEqual([]);
  });

  it('makes the squire’s preparation choice change a later practical action and grants the chosen thank-you reward', () => {
    const rope = acquire(THE_SQUIRES_PACK, ['giveRope', 'useRopeOnShelf', 'continueAfterRope', 'takeRopeAsThanks'], 'travelRope');
    expect(rope.character?.carriedItem).toBe('travelRope');
    const toolkit = act(act(start(THE_SQUIRES_PACK), THE_SQUIRES_PACK, 'giveToolkit'), THE_SQUIRES_PACK, 'useToolkitOnMarker');
    expect(toolkit.run?.sceneId).toBe('toolkitMarker');
    const marker = act(act(start(THE_SQUIRES_PACK), THE_SQUIRES_PACK, 'giveMarker'), THE_SQUIRES_PACK, 'useMarkerForReturn');
    expect(marker.run?.sceneId).toBe('markerReturn');
  });

  it('grants distinct existing Gear through hand-off, wages-in-kind, ferry work, repair, and apprenticeship', () => {
    acquire(THE_LAST_SURVEY, ['measureStones', 'recordNewEdge', 'acceptRule'], 'joinersFoldingRule');
    acquire(THE_QUARTERMASTERS_TALLY, ['secureFlour', 'unloadAndRestack', 'acceptStrap'], 'freightmansStrap');
    acquire(THE_SOUNDING_LINE, ['askAboutOldMarks', 'compareCurrentWater', 'markOnlyFirmApproach', 'acceptRod'], 'collapsibleSoundingRod');
    acquire(THE_WHEEL_BEFORE_DAWN, ['checkPinWithWrench', 'coolAndInspect', 'keepWrenchAsReleasedTool'], 'compactWheelWrench');
    acquire(THE_APPRENTICES_LIGHT, ['checkCaseSeam', 'shieldOpening', 'acceptMatchCase'], 'windproofMatchCase');
    acquire(THE_BRIDGE_CREWS_WEDGE, ['seatWedge', 'stopAndReset', 'acceptSpareHammer'], 'bridgewrightHammer');
  });

  it('keeps salvage ownership unresolved and never silently grants the named chest', () => {
    let state = start(THE_CLAIMED_SALVAGE);
    state = act(state, THE_CLAIMED_SALVAGE, 'inspectCamp');
    state = act(state, THE_CLAIMED_SALVAGE, 'followRoadTrack');
    state = act(state, THE_CLAIMED_SALVAGE, 'markCampLocation');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.character?.knowledge).toHaveLength(1);
  });

  it('offers no duplicate folding rule when it is already carried or banked', () => {
    const carried = start(THE_LAST_SURVEY, 'joinersFoldingRule');
    const banked = start(THE_LAST_SURVEY, undefined, ['joinersFoldingRule']);
    expect(meets(THE_LAST_SURVEY.scenes.settlement.choices.find(({ id }) => id === 'acceptRule')?.requirements, carried)).toBe(false);
    expect(meets(THE_LAST_SURVEY.scenes.settlement.choices.find(({ id }) => id === 'acceptRule')?.requirements, banked)).toBe(false);
  });

  it('recognizes a carried Survey Chain as a distinct long-distance measurement tool', () => {
    const carried = start(THE_LAST_SURVEY, 'surveyChain');
    expect(meets(THE_LAST_SURVEY.scenes.milepost.choices.find(({ id }) => id === 'measureWithSurveyChain')?.requirements, carried)).toBe(true);
    expect(meets(THE_LAST_SURVEY.scenes.milepost.choices.find(({ id }) => id === 'measureWithSurveyChain')?.requirements, start(THE_LAST_SURVEY))).toBe(false);
    const measured = act(carried, THE_LAST_SURVEY, 'measureWithSurveyChain');
    expect(measured.run?.sceneId).toBe('chainMeasure');
    expect(act(measured, THE_LAST_SURVEY, 'recordBothMeasures').run?.sceneId).toBe('settlement');
  });

  it('uses a carried Hand Auger for a safe market-table repair without requiring it', () => {
    const carried = start(THE_TRESTLE_TABLE, 'handAuger');
    let state = act(carried, THE_TRESTLE_TABLE, 'warnSeller');
    state = act(state, THE_TRESTLE_TABLE, 'fetchCrate');
    expect(meets(THE_TRESTLE_TABLE.scenes.crate.choices.find(({ id }) => id === 'borePilotHoleWithAuger')?.requirements, state)).toBe(true);
    state = act(state, THE_TRESTLE_TABLE, 'borePilotHoleWithAuger');
    expect(state.run?.sceneId).toBe('jointRepaired');
    expect(act(state, THE_TRESTLE_TABLE, 'acceptRepairCoin').character?.money).toBe(1);
    let freshState = start(THE_TRESTLE_TABLE);
    freshState = act(freshState, THE_TRESTLE_TABLE, 'warnSeller');
    freshState = act(freshState, THE_TRESTLE_TABLE, 'fetchCrate');
    expect(meets(THE_TRESTLE_TABLE.scenes.crate.choices.find(({ id }) => id === 'borePilotHoleWithAuger')?.requirements, freshState)).toBe(false);
  });

  it('preserves the resolved Gear reward through save and reload before placement', () => {
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    let pending = start(THE_WHEEL_BEFORE_DAWN);
    pending = act(pending, THE_WHEEL_BEFORE_DAWN, 'checkPinWithWrench');
    pending = act(pending, THE_WHEEL_BEFORE_DAWN, 'coolAndInspect');
    pending = act(pending, THE_WHEEL_BEFORE_DAWN, 'keepWrenchAsReleasedTool');
    pending = openRewardResolution(pending);
    saveGame(pending, storage as never);
    const reloaded = loadSave(storage as never);
    expect(reloaded.run?.scenarioId).toBe(THE_WHEEL_BEFORE_DAWN.id);
    expect(reloaded.run?.rewardPendingItems).toContain('compactWheelWrench');
    const placed = finishRewardResolution(placeReward(reloaded, 'compactWheelWrench', 'carry'));
    expect(getCarriedItems(placed.character)).toContain('compactWheelWrench');
  });

  it('preserves an earned tool at full carry capacity when the player banks it', () => {
    let state = start(THE_WHEEL_BEFORE_DAWN, 'travelRope');
    state = act(state, THE_WHEEL_BEFORE_DAWN, 'checkPinWithWrench');
    state = act(state, THE_WHEEL_BEFORE_DAWN, 'coolAndInspect');
    state = act(state, THE_WHEEL_BEFORE_DAWN, 'keepWrenchAsReleasedTool');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('compactWheelWrench');
    state = finishRewardResolution(placeReward(state, 'compactWheelWrench', 'bank'));
    expect(getCarriedItems(state.character)).toEqual(['travelRope']);
    expect(state.bank).toContain('compactWheelWrench');
  });
});
