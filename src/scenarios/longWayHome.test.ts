import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS } from './index';
import { THE_LONG_WAY_HOME } from './longWayHome';
import type { SaveData } from '../types';

function fresh(carriedItem: string | null = null, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Wayfarer');
  character.carriedItem = carriedItem;
  character.historyFlags = historyFlags;
  return { version: 1, bank: [], character, run: startRun(character, THE_LONG_WAY_HOME) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = THE_LONG_WAY_HOME.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, THE_LONG_WAY_HOME, choice!, () => roll);
}

function reachStormViaDirect(state = fresh(), roll = 0): SaveData {
  state = act(state, 'askAboutJourney');
  state = act(state, 'takeHerAtHerWord');
  state = act(state, state.run!.inventory.some((item) => ['travelRope', 'ratCatchersHook', 'ironRopeClamp', 'minerHeadlamp'].includes(item)) ? 'directWithGear' : 'directWithoutGear', roll);
  return state;
}

function reachTown(state: SaveData): SaveData {
  state = act(state, 'takeUpperRoadToTown');
  return state;
}

describe('The Long Way Home', () => {
  it('registers for random selection, repeat avoidance, and QA direct launch', () => {
    expect(SCENARIOS).toContain(THE_LONG_WAY_HOME);
    expect(selectScenario(SCENARIOS, THE_LONG_WAY_HOME.id, () => 0)?.id).not.toBe(THE_LONG_WAY_HOME.id);
    const state = fresh();
    state.run = null;
    const qa = renderQaPanel(true, state, SCENARIOS, ITEMS);
    expect(qa).toContain('Start The Long Way Home');
    expect(qa).toContain('data-qa-start="the-long-way-home"');
    expect(renderQaPanel(false, state, SCENARIOS, ITEMS)).toBe('');
  });

  it('lets a broke, fresh character escort Anna to care by the direct route', () => {
    let state = reachStormViaDirect(fresh(), 0);
    expect(state.run?.sceneId).toBe('stormTurn');
    state = reachTown(state);
    expect(state.run?.sceneId).toBe('townCare');
    state = act(state, 'letWardenReview');
    expect(state.run?.sceneId).toBe('rewardOffer');
    expect(state.run?.inventory).not.toContain('weatherproofCloak');
    state = act(state, 'acceptWeatherproofCloak');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('weatherproofCloak');
    expect(state.run?.acquiredThisRun).toContain('weatherproofCloak');
    expect(state.character?.historyFlags).toContain('escorted_injured_stranger');
  });

  it('supports the slower upper-trail route and a shelter-first rescue', () => {
    let safe = act(fresh(), 'askAboutJourney');
    safe = act(safe, 'takeHerAtHerWord');
    safe = act(safe, 'takeUpperRidge');
    expect(safe.run?.elapsedMinutes).toBe(19);
    safe = act(safe, 'continueFromRidge');
    safe = act(safe, 'takeUpperRoadToTown');
    safe = act(safe, 'standWithRowan');
    safe = act(safe, 'acceptTrailCompass');
    expect(safe.run?.sceneId).toBe('safeArrivalEnding');
    expect(safe.run?.status).toBe('success');
    expect(safe.run?.inventory).toContain('trailCompass');

    let shelter = act(fresh(), 'inspectInjury');
    shelter = act(shelter, 'escortUnwrapped');
    shelter = act(shelter, 'reachStoneShelter');
    expect(shelter.run?.sceneId).toBe('shelterStop');
    shelter = act(shelter, 'restThroughSquall');
    expect(shelter.run?.flags).toContain('waitedShelter');
    shelter = act(shelter, 'resumeAfterShelter');
    shelter = act(shelter, 'takeUpperRoadToTown');
    expect(shelter.run?.status).toBe('active');
    shelter = act(shelter, 'letWardenReview');
    expect(shelter.run?.status).toBe('active');
    shelter = act(shelter, 'declineAllGifts');
    expect(shelter.run?.status).toBe('success');
    expect(shelter.character?.historyFlags).toContain('sheltered_instead_of_pushing_on');
  });

  it('offers refusal and limited aid without condemning the player or granting a reward', () => {
    const refused = act(fresh(), 'leaveAtMilepost');
    expect(refused.run?.sceneId).toBe('abandonedEnding');
    expect(refused.run?.status).toBe('success');
    expect(refused.character?.historyFlags).toContain('abandoned_injured_stranger');

    const limited = act(fresh(), 'giveBasicAid');
    expect(limited.run?.sceneId).toBe('limitedAidEnding');
    expect(limited.run?.status).toBe('success');
    expect(limited.run?.inventory).not.toContain('weatherproofCloak');
    expect(limited.run?.inventory).not.toContain('trailCompass');
    expect(limited.character?.historyFlags).toContain('gave_limited_aid_to_stranger');
  });

  it('supports the trust branch and the concealed-truth route', () => {
    let state = reachStormViaDirect(fresh(), 0);
    state = act(state, 'askAnnaAboutRowan');
    expect(state.run?.sceneId).toBe('revelation');
    expect(THE_LONG_WAY_HOME.scenes.revelation.text).toContain('She admits the theft');
    state = act(state, 'protectRowanAtClinic');
    expect(state.run?.flags).toContain('trustedRowan');
    expect(state.character?.historyFlags).toContain('protected_stranger_from_pursuer');
    expect(state.character?.historyFlags).toContain('uncovered_strangers_truth');
    state = act(state, 'standWithRowan');
    expect(state.run?.sceneId).toBe('rewardOffer');
  });

  it('shows why the pursuer is looking without making his claim conclusive', () => {
    let state = reachStormViaDirect(fresh(), 0);
    state = act(state, 'hearLanternMansClaim');
    expect(state.run?.sceneId).toBe('pursuerAccount');
    expect(THE_LONG_WAY_HOME.scenes.pursuerAccount.text).toContain('does not settle what happened');
    state = act(state, 'handLedgerToBenn');
    expect(state.run?.sceneId).toBe('handOverEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('abandoned_injured_stranger');
  });

  it('keeps outside help available and does not require choosing a side', () => {
    let state = act(fresh(), 'askAboutJourney');
    state = act(state, 'takeHerAtHerWord');
    state = act(state, 'reachStoneShelter');
    state = act(state, 'signalShepherd');
    expect(state.run?.sceneId).toBe('helpRendezvous');
    state = act(state, 'bringBothToClinic');
    expect(sceneText(THE_LONG_WAY_HOME.scenes.townCare, state)).toContain('Anna gives her real name');
    state = act(state, 'letWardenReview');
    expect(state.character?.historyFlags).toContain('sought_help_for_stranger');
    state = act(state, 'declineAllGifts');
    expect(state.run?.status).toBe('success');
  });

  it('makes treatment cost time and heavy gloves reduce that cost', () => {
    const bare = act(fresh(), 'inspectInjury');
    const treatedBare = act(bare, 'wrapWithoutGloves');
    const gloved = act(fresh('heavyLeatherGloves'), 'inspectInjury');
    const treatedGloved = act(gloved, 'wrapWithGloves');
    expect(treatedBare.run?.elapsedMinutes).toBe(12);
    expect(treatedGloved.run?.elapsedMinutes).toBe(9);
    expect(treatedGloved.run?.flags).toContain('woundSupported');
    expect(treatedGloved.character?.knowledge).toContain('You wrapped Anna’s ankle firmly; it is supported, though she will still need to rest and move carefully.');
  });

  it('makes rope or other descent gear faster and safer without requiring it', () => {
    let geared = act(fresh('travelRope'), 'askAboutJourney');
    geared = act(geared, 'takeHerAtHerWord');
    const afterGear = act(geared, 'directWithGear', 0.7);
    expect(afterGear.run?.sceneId).toBe('stormTurn');
    expect(afterGear.run?.elapsedMinutes).toBe(9);

    let untooled = act(fresh(), 'askAboutJourney');
    untooled = act(untooled, 'takeHerAtHerWord');
    const afterNoGear = act(untooled, 'directWithoutGear', 0.8);
    expect(afterNoGear.run?.sceneId).toBe('slopeFailure');
    expect(afterNoGear.run?.elapsedMinutes).toBe(10);
    expect(afterNoGear.run?.health).toBe(7);
  });

  it('uses all four fictional-time phases and gives the player a safe late option', () => {
    expect(timeStatus(THE_LONG_WAY_HOME, 0).phase?.id).toBe('early');
    expect(timeStatus(THE_LONG_WAY_HOME, 12).phase?.id).toBe('worsening');
    expect(timeStatus(THE_LONG_WAY_HOME, 25).phase?.id).toBe('dangerous');
    expect(timeStatus(THE_LONG_WAY_HOME, 38).phase?.id).toBe('critical');

    let state = act(fresh(), 'askAboutJourney');
    state = act(state, 'askWhatSheIsAvoiding');
    state = act(state, 'respectHerBoundary');
    state = act(state, 'reachStoneShelter');
    state = act(state, 'restThroughSquall');
    state = act(state, 'resumeAfterShelter');
    expect(state.run?.elapsedMinutes).toBe(38);
    state = act(state, 'takeUpperRoadToTown');
    expect(state.run?.status).toBe('active');
    expect(state.run?.health).toBe(10);
    expect(sceneText(THE_LONG_WAY_HOME.scenes.stormTurn, { ...state, run: { ...state.run!, elapsedMinutes: 38 } })).toContain('water now carries branches');
  });

  it('makes injury support and shelter change later risk instead of erasing the injury', () => {
    expect(THE_LONG_WAY_HOME.scenes.journeyPlan.textVariants?.some((variant) => variant.requirements?.minElapsedMinutes === 25 && variant.text.includes('ankle has begun to swell'))).toBe(true);
    const crossing = THE_LONG_WAY_HOME.scenes.stormTurn.choices.find((choice) => choice.id === 'crossSwollenStream')!;
    expect(crossing.chance?.probability).toBe(0.48);
    expect(crossing.chance?.bonusItems).toContain('travelRope');
    expect(crossing.chance?.bonusFlags).toContain('waitedShelter');
    expect(THE_LONG_WAY_HOME.scenes.shelterStop.choices.find((choice) => choice.id === 'restThroughSquall')?.timeCost).toBe(14);
    expect(THE_LONG_WAY_HOME.scenes.slopeFailure.text).toContain('ankle twists.');
  });

  it('keeps the opening free of facts the player has not discovered', () => {
    const state = fresh();
    const opening = sceneText(THE_LONG_WAY_HOME.scenes.encounter, state);
    expect(opening).not.toContain('Rowan');
    expect(opening).not.toContain('payroll ledger');
    expect(opening).not.toContain('foreman');
    expect(THE_LONG_WAY_HOME.scenes.journeyPlan.text).not.toContain('ledger');
    expect(THE_LONG_WAY_HOME.scenes.stormTurn.text).toContain('Rowan, wait');
    expect(THE_LONG_WAY_HOME.scenes.revelation.text).toContain('tally clerk');
  });

  it('offers each carryable reward explicitly and prevents duplicate unique rewards', () => {
    const state = reachStormViaDirect(fresh(), 0);
    const town = reachTown(state);
    town.run!.sceneId = 'rewardOffer';
    expect(town.run?.inventory).not.toContain('weatherproofCloak');
    expect(town.run?.inventory).not.toContain('trailCompass');
    expect(THE_LONG_WAY_HOME.scenes.rewardOffer.text).toContain('asks you to take it');
    expect(THE_LONG_WAY_HOME.scenes.rewardOffer.text).toContain('offers a small trail compass');
    expect(THE_LONG_WAY_HOME.scenes.rewardOffer.choices[0].requirements?.notItems).toContain('weatherproofCloak');
    expect(THE_LONG_WAY_HOME.scenes.rewardOffer.choices[1].requirements?.notItems).toContain('trailCompass');
    expect(ITEMS.weatherproofCloak.carryable).toBe(true);
    expect(ITEMS.trailCompass.carryable).toBe(true);
    town.run!.inventory.push('weatherproofCloak', 'trailCompass');
    expect(THE_LONG_WAY_HOME.scenes.rewardOffer.choices.filter((choice) => meets(choice.requirements, town)).map((choice) => choice.id)).toEqual(['declineAllGifts']);
  });

  it('supports existing character-history callbacks without blocking a fresh character', () => {
    const freshState = fresh();
    const known = fresh(null, ['rescued_missing_person']);
    const wary = fresh(null, ['refused_mine_rescue']);
    expect(sceneText(THE_LONG_WAY_HOME.scenes.encounter, freshState)).not.toContain('has heard you helped');
    expect(sceneText(THE_LONG_WAY_HOME.scenes.encounter, known)).toContain('has heard you helped');
    expect(sceneText(THE_LONG_WAY_HOME.scenes.encounter, wary)).toContain('notices your hesitation');
    expect(THE_LONG_WAY_HOME.scenes.encounter.choices.every((choice) => !choice.requirements?.historyFlags)).toBe(true);
  });

  it('foreshadows the flooded stream and permits a dangerous failure before death', () => {
    let state = reachStormViaDirect(fresh(), 0.99);
    expect(state.run?.sceneId).toBe('slopeFailure');
    state = act(state, 'continueAfterSlip');
    expect(state.run?.sceneId).toBe('stormTurn');
    expect(THE_LONG_WAY_HOME.scenes.stormTurn.text).toContain('visibly slick');
    state = act(state, 'crossSwollenStream', 0.99);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
  });

  it('validates a forward-only graph with no reachable active scene lacking an available action', () => {
    expect(findScenarioGraphProblems(THE_LONG_WAY_HOME)).toEqual([]);
    const queue = [fresh()];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = [run.sceneId, run.health, run.elapsedMinutes, [...run.inventory].sort().join(','), [...run.flags].sort().join(','), [...(state.character?.knowledge ?? [])].sort().join(','), [...(state.character?.historyFlags ?? [])].sort().join(',')].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = THE_LONG_WAY_HOME.scenes[run.sceneId];
      const available = scene.choices.filter((choice) => meets(choice.requirements, state));
      expect(available.length, `reachable active scene ${scene.id} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
      for (const choice of available) {
        queue.push(choose(state, THE_LONG_WAY_HOME, choice, () => 0));
        if (choice.chance) queue.push(choose(state, THE_LONG_WAY_HOME, choice, () => 0.999999));
      }
    }
    expect(seen.size).toBeGreaterThan(35);
  });

  it('keeps every story scene within four choices and endings terminal', () => {
    for (const scene of Object.values(THE_LONG_WAY_HOME.scenes)) {
      expect(scene.choices.length).toBeLessThanOrEqual(4);
      if (scene.ending) expect(scene.choices).toHaveLength(0);
      else expect(scene.choices.length).toBeGreaterThan(0);
    }
  });
});
