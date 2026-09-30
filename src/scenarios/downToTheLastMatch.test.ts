import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, sceneText, startAdventure, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { selectScenario } from '../scenarioSelection';
import type { Choice, SaveData } from '../types';
import { SCENARIOS } from './index';
import { DOWN_TO_THE_LAST_MATCH } from './downToTheLastMatch';

function fresh(carriedItem: string | null = null, money = 0, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Winter Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  character.historyFlags = historyFlags;
  return startAdventure({ version: 1, bank: [], character, run: null }, DOWN_TO_THE_LAST_MATCH);
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const run = state.run!;
  const scene = DOWN_TO_THE_LAST_MATCH.scenes[run.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, DOWN_TO_THE_LAST_MATCH, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return DOWN_TO_THE_LAST_MATCH.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function explore(initial: SaveData): { states: SaveData[]; scenes: Set<string> } {
  const pending = [initial];
  const states: SaveData[] = [];
  const scenes = new Set<string>();
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({
      scene: run.sceneId, time: run.elapsedMinutes, health: run.health, money: state.character?.money,
      inventory: run.inventory, flags: run.flags, history: state.character?.historyFlags, knowledge: state.character?.knowledge,
    });
    if (seen.has(key)) continue;
    seen.add(key);
    states.push(state);
    scenes.add(run.sceneId);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} actions`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, DOWN_TO_THE_LAST_MATCH, choice, () => 0));
        pending.push(choose(state, DOWN_TO_THE_LAST_MATCH, choice, () => 0.999));
      } else pending.push(choose(state, DOWN_TO_THE_LAST_MATCH, choice, () => 0));
    }
  }
  return { states, scenes };
}

describe('Down to the Last Match', () => {
  it('is registered for random selection and QA direct launch only', () => {
    expect(SCENARIOS).toContain(DOWN_TO_THE_LAST_MATCH);
    const afterDitch = selectScenario(SCENARIOS, 'the-man-in-the-ditch', () => 0.999);
    expect(SCENARIOS).toContain(afterDitch);
    expect(afterDitch?.id).not.toBe('the-man-in-the-ditch');
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start Down to the Last Match');
  });

  it('opens with a survivable shelter while keeping undiscovered facts out of narration', () => {
    const state = fresh();
    const opening = sceneText(DOWN_TO_THE_LAST_MATCH.scenes.cabinArrival, state);
    expect(opening).toContain('stove is lit');
    expect(opening).toContain('last dry match');
    expect(opening).not.toContain('Eli');
    expect(opening).not.toContain('reserve sack');
    expect(opening).not.toContain('flue seam');
  });

  it('lets a broke fresh character conserve fuel and survive without outside gear', () => {
    let state = fresh();
    state = act(state, 'checkWood');
    state = act(state, 'rationKindling');
    state = act(state, 'conserveMatchAndKindling');
    state = act(state, 'waitForTheWind');
    expect(state.run?.elapsedMinutes).toBe(12);
    state = act(state, 'holdInsideFromStorm');
    expect(timeStatus(DOWN_TO_THE_LAST_MATCH, state.run!.elapsedMinutes).phase?.id).toBe('bitter');
    expect(options(state).map((choice) => choice.id)).toContain('feedSavedKindling');
    expect(options(state).map((choice) => choice.id)).not.toContain('holdEmbersAlone');
    state = act(state, 'feedSavedKindling');
    state = act(state, 'waitForGrayLight');
    state = act(state, 'declineCabinReward');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('conserved_last_match');
  });

  it('offers paid reserve fuel only after discovery and never requires money to finish', () => {
    const broke = fresh();
    const arrivedAtCaretaker = act(broke, 'talkToMarta');
    expect(options(arrivedAtCaretaker).some((choice) => choice.id === 'buyReserveWood')).toBe(false);
    let state = fresh(null, 2);
    state = act(state, 'talkToMarta');
    state = act(state, 'buyReserveWood');
    expect(state.character?.money).toBe(0);
    expect(state.run?.flags).toContain('reserveFuelBought');
    state = act(state, 'bringReserveInside');
    expect(state.run?.sceneId).toBe('planBeforeNight');
  });

  it('supports sacrificing property and records the cost', () => {
    let state = fresh();
    state = act(state, 'checkWood');
    state = act(state, 'rationKindling');
    state = act(state, 'burnChairEarly');
    expect(state.run?.flags).toContain('propertyBurned');
    expect(state.character?.historyFlags).toContain('burned_property_for_survival');
    state = act(state, 'watchChairFuel');
    expect(DOWN_TO_THE_LAST_MATCH.scenes[state.run!.sceneId].title).toBe('Three Knocks at the Door');
  });

  it('makes spending the match early remove later match choices while saving it preserves alternatives', () => {
    let spent = fresh();
    spent = act(spent, 'inspectStove');
    spent = act(spent, 'markFlueLeak');
    spent = act(spent, 'useLastMatchEarly');
    spent = act(spent, 'watchTheFire');
    spent = act(spent, 'holdInsideFromStorm');
    expect(spent.run?.flags).toContain('lastMatchSpent');
    expect(options(spent).map((choice) => choice.id)).not.toContain('useMatchToRelight');
    expect(options(spent).map((choice) => choice.id)).not.toContain('useMatchToSignal');

    let saved = fresh();
    saved = act(saved, 'inspectStove');
    saved = act(saved, 'markFlueLeak');
    saved = act(saved, 'conserveMatchAndKindling');
    saved = act(saved, 'waitForTheWind');
    saved = act(saved, 'holdInsideFromStorm');
    expect(options(saved).map((choice) => choice.id)).toContain('useMatchToRelight');
    expect(options(saved).map((choice) => choice.id)).toContain('useMatchToSignal');
  });

  it('supports a successful outside-fuel run and a foreshadowed failed trip', () => {
    let state = fresh('heavyLeatherGloves');
    state = act(state, 'watchWeather');
    state = act(state, 'fastenInnerShutter');
    state = act(state, 'conserveMatchAndKindling');
    state = act(state, 'waitForTheWind');
    state = act(state, 'fetchFuelBeforeWhiteout');
    const preparedChoice = DOWN_TO_THE_LAST_MATCH.scenes.fuelTrip.choices.find((choice) => choice.id === 'gatherWithWarmGear')!;
    const bareChoice = DOWN_TO_THE_LAST_MATCH.scenes.fuelTrip.choices.find((choice) => choice.id === 'gatherBarehanded')!;
    expect(preparedChoice.timeCost).toBeLessThan(bareChoice.timeCost!);
    state = act(state, 'gatherWithWarmGear', 0);
    expect(state.run?.flags).toContain('woodGathered');
    expect(state.run?.elapsedMinutes).toBeGreaterThanOrEqual(20);
    state = act(state, 'feedRecoveredWood');
    expect(state.run?.flags).toContain('fireFed');

    let failed = fresh();
    failed = act(failed, 'watchWeather');
    failed = act(failed, 'markDoorAndWindow');
    failed = act(failed, 'conserveMatchAndKindling');
    failed = act(failed, 'waitForTheWind');
    failed = act(failed, 'fetchFuelBeforeWhiteout');
    expect(DOWN_TO_THE_LAST_MATCH.scenes.fuelTrip.choices.find((choice) => choice.id === 'gatherBarehanded')?.hint).toMatch(/numbing|slick/i);
    failed = act(failed, 'gatherBarehanded', 0.999);
    expect(failed.run?.sceneId).toBe('fuelTripSlip');
    expect(failed.run?.health).toBe(7);
    failed = act(failed, 'returnAfterFuelSlip');
    expect(failed.run?.sceneId).toBe('criticalCold');
  });

  it('uses item-specific repairs and safer outdoor actions', () => {
    let toolUser = fresh('pocketToolkit');
    toolUser = act(toolUser, 'inspectStove');
    toolUser = act(toolUser, 'markFlueLeak');
    expect(options(toolUser).map((choice) => choice.id)).toContain('repairFlueWithTool');
    expect(options(toolUser).map((choice) => choice.id)).not.toContain('repairFlueByHand');
    expect(DOWN_TO_THE_LAST_MATCH.scenes.planBeforeNight.choices.find((choice) => choice.id === 'repairFlueWithTool')?.timeCost).toBeLessThan(DOWN_TO_THE_LAST_MATCH.scenes.planBeforeNight.choices.find((choice) => choice.id === 'repairFlueByHand')?.timeCost!);
    expect(DOWN_TO_THE_LAST_MATCH.scenes.fuelTrip.choices.find((choice) => choice.id === 'gatherWithWarmGear')?.chance?.probability)
      .toBeGreaterThan(DOWN_TO_THE_LAST_MATCH.scenes.fuelTrip.choices.find((choice) => choice.id === 'gatherBarehanded')?.chance?.probability!);
    expect(DOWN_TO_THE_LAST_MATCH.scenes.criticalCold.choices.find((choice) => choice.id === 'leaveInCriticalCold')?.chance?.bonusItems).toContain('travelRope');
  });

  it('supports inviting, helping, sharing, and refusing the stranded courier without moralized outcomes', () => {
    let invited = fresh();
    invited = act(invited, 'talkToMarta');
    invited = act(invited, 'declineReserveWood');
    invited = act(invited, 'repairFlueByHand', 0);
    invited = act(invited, 'faceStormWithRepairedStove');
    invited = act(invited, 'openForKnocker');
    expect(invited.run?.sceneId).toBe('travelerAtDoor');
    invited = act(invited, 'bringEliInside');
    invited = act(invited, 'shareBreadAndBlanket');
    invited = act(invited, 'settleAfterSharing');
    expect(options(invited).map((choice) => choice.id)).toContain('shareLastWood');
    expect(options(invited).map((choice) => choice.id)).toContain('keepLastWood');
    invited = act(invited, 'shareLastWood');
    invited = act(invited, 'stayWithSharedFire');
    invited = act(invited, 'acceptWoolBlanket');
    expect(invited.run?.status).toBe('success');
    expect(invited.run?.acquiredThisRun).toContain('woolTravelBlanket');
    expect(eligibleCarryItems(invited)).toContain('woolTravelBlanket');
    expect(sceneText(DOWN_TO_THE_LAST_MATCH.scenes.dawnEnding, invited)).toContain('Eli');

    let refused = fresh();
    refused = act(refused, 'inspectStove');
    refused = act(refused, 'markFlueLeak');
    refused = act(refused, 'conserveMatchAndKindling');
    refused = act(refused, 'waitForTheWind');
    refused = act(refused, 'openForKnocker');
    refused = act(refused, 'refuseEliShelter');
    refused = act(refused, 'stayAfterRefusal');
    refused = act(refused, 'feedSavedKindling');
    refused = act(refused, 'waitForGrayLight');
    expect(refused.character?.historyFlags).toContain('refused_shelter_in_cold');
    expect(sceneText(DOWN_TO_THE_LAST_MATCH.scenes.rewardOffer, refused)).toContain('cannot know whether they found');
  });

  it('changes the outdoor route with fictional cold and never uses real-world waiting', () => {
    let state = fresh();
    state.run!.sceneId = 'stormFront';
    state.run!.elapsedMinutes = 29;
    expect(options(state).map((choice) => choice.id)).toContain('fetchFuelBeforeWhiteout');
    expect(options(state).map((choice) => choice.id)).not.toContain('fetchFuelInWhiteout');
    state.run!.elapsedMinutes = 30;
    expect(options(state).map((choice) => choice.id)).not.toContain('fetchFuelBeforeWhiteout');
    expect(options(state).map((choice) => choice.id)).toContain('fetchFuelInWhiteout');
    const exit = DOWN_TO_THE_LAST_MATCH.scenes.criticalCold.choices;
    expect(exit.find((choice) => choice.id === 'leaveBeforeDawnEarly')?.chance?.probability)
      .toBeGreaterThan(exit.find((choice) => choice.id === 'leaveInCriticalCold')?.chance?.probability!);

    let clock = fresh();
    clock.run!.sceneId = 'criticalCold';
    clock.run!.elapsedMinutes = 34;
    clock.run!.startedAt -= 86_400_000;
    const afterWait = choose(clock, DOWN_TO_THE_LAST_MATCH, exit.find((choice) => choice.id === 'useMatchToRelight')!);
    expect(afterWait.run?.elapsedMinutes).toBe(36);
    expect(timeStatus(DOWN_TO_THE_LAST_MATCH, afterWait.run!.elapsedMinutes).phase?.id).toBe('bitter');
  });

  it('records the history callback while allowing an entirely fresh character', () => {
    const knownRescuer = fresh(null, 0, ['rescued_cold_storage_worker']);
    expect(sceneText(DOWN_TO_THE_LAST_MATCH.scenes.cabinArrival, knownRescuer)).toContain('Marta has heard you');
    const firstTimers = fresh();
    expect(options(firstTimers).length).toBe(4);
    expect(options(firstTimers).some((choice) => choice.id === 'watchWeather')).toBe(true);
  });

  it('offers new items explicitly, once, and within the ordinary one-slot carry flow', () => {
    expect(ITEMS.windproofMatchCase.carryable).toBe(true);
    expect(ITEMS.woolTravelBlanket.carryable).toBe(true);
    const choices = DOWN_TO_THE_LAST_MATCH.scenes.rewardOffer.choices;
    expect(choices.find((choice) => choice.id === 'acceptWindproofCase')?.effects?.gainItems).toContain('windproofMatchCase');
    expect(choices.find((choice) => choice.id === 'acceptWoolBlanket')?.effects?.gainItems).toContain('woolTravelBlanket');
    expect(choices.every((choice) => choice.next === 'dawnEnding')).toBe(true);
    const alreadyHasBlanket = fresh('woolTravelBlanket');
    alreadyHasBlanket.run!.sceneId = 'rewardOffer';
    expect(options(alreadyHasBlanket).map((choice) => choice.id)).not.toContain('acceptWoolBlanket');
    expect(options(alreadyHasBlanket).map((choice) => choice.id)).toContain('declineCabinReward');
    expect(DOWN_TO_THE_LAST_MATCH.scenes.roadWardensCabin.choices.find((choice) => choice.id === 'takeMatchCaseAtWarden')?.requirements?.notItems).toContain('windproofMatchCase');
  });

  it('supports a warned, consequential exposure route that can become fatal only after a second failure', () => {
    const exit = DOWN_TO_THE_LAST_MATCH.scenes.criticalCold.choices.find((choice) => choice.id === 'leaveBeforeDawnEarly')!;
    expect(exit.hint).toMatch(/fall|exposed/i);
    let state = fresh();
    state.run!.sceneId = 'criticalCold';
    state.run!.elapsedMinutes = 34;
    state = act(state, 'leaveBeforeDawnEarly', 0.999);
    expect(state.run?.sceneId).toBe('snowbank');
    expect(state.run?.health).toBe(7);
    expect(DOWN_TO_THE_LAST_MATCH.scenes.snowbank.text).toMatch(/second exposed push|may finish/i);
    state = act(state, 'pushForWardenLight', 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('fatalExposure');
  });

  it('preserves fictional time and resource flags across a serialized resume', () => {
    let state = fresh();
    state = act(state, 'checkWood');
    state = act(state, 'rationKindling');
    state = act(state, 'conserveMatchAndKindling');
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.elapsedMinutes).toBe(state.run?.elapsedMinutes);
    expect(resumed.run?.flags).toEqual(state.run?.flags);
    expect(resumed.run?.sceneId).toBe('matchConserved');
  });

  it('has a forward-only graph and every reachable active state offers an action', () => {
    expect(findScenarioGraphProblems(DOWN_TO_THE_LAST_MATCH)).toEqual([]);
    const profiles = [fresh(), fresh(null, 2), fresh('pocketToolkit'), fresh('travelRope'), fresh('heavyLeatherGloves'), fresh('windproofMatchCase')];
    const allScenes = new Set<string>();
    const allStates: SaveData[] = [];
    for (const profile of profiles) {
      const reached = explore(profile);
      reached.scenes.forEach((id) => allScenes.add(id));
      allStates.push(...reached.states);
    }
    expect([...Object.keys(DOWN_TO_THE_LAST_MATCH.scenes)].filter((id) => !allScenes.has(id))).toEqual([]);
    expect(allScenes.has('fatalExposure')).toBe(true);
    expect(allStates.some((state) => state.run?.status === 'success')).toBe(true);
    expect(allStates.some((state) => state.run?.status === 'death')).toBe(true);
  });
});
