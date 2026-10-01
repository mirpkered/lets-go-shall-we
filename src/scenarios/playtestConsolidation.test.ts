import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import type { SaveData, Scenario } from '../types';
import { THE_LOOSE_TEAM } from './looseTeam';
import { ONE_HORSE_SHORT } from './oneHorseShort';
import { THREE_MILES_TO_RAIN } from './threeMilesToRain';
import { THE_MISSING_BOAT } from './missingBoat';
import { SMOKE_ON_THE_HILL } from './smokeOnTheHill';
import { THE_LAST_FERRY } from './lastFerry';

function fresh(scenario: Scenario): SaveData {
  const character = newCharacter('Playtest');
  return { version: 1, bank: [], character, run: startRun(character, scenario) };
}

function act(scenario: Scenario, state: SaveData, id: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} is available`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

describe('playtest consolidation aftermath and continuity', () => {
  it('keeps the Loose Team handler behind the team and distinguishes failed from successful warnings', () => {
    const opening = THE_LOOSE_TEAM.scenes.roadJunction.text;
    expect(opening).toMatch(/uphill shoulder/);
    expect(opening).toMatch(/handler.*behind the wagon/);
    expect(THE_LOOSE_TEAM.scenes.workersClear.choices.map(({ id }) => id)).not.toContain('pullHandler');
    expect(THE_LOOSE_TEAM.scenes.workersClear.choices.find(({ id }) => id === 'helpHandler')?.label).toMatch(/Call to guide/);

    let failed = act(THE_LOOSE_TEAM, fresh(THE_LOOSE_TEAM), 'warnWorkers', 0.999);
    expect(failed.run?.flags).toContain('workerWarningFailed');
    const transitionsBeforeAftermath = failed.run?.qualifyingStoryTransitions;
    failed = act(THE_LOOSE_TEAM, failed, 'openGateLate', 0);
    expect(failed.run?.sceneId).toBe('horsesTurnedAftermath');
    expect(failed.run?.qualifyingStoryTransitions).toBe(transitionsBeforeAftermath);
    expect(sceneText(THE_LOOSE_TEAM.scenes.horsesTurnedAftermath, failed)).toMatch(/only come out after the wagon turns away/);
    expect(sceneText(THE_LOOSE_TEAM.scenes.horsesTurnedAftermath, failed)).not.toMatch(/warning sent them/);
    failed = act(THE_LOOSE_TEAM, failed, 'leaveAfterPastureTurn');
    expect(failed.run?.sceneId).toBe('horsesTurned');
    expect(failed.run?.status).toBe('success');

    let warned = act(THE_LOOSE_TEAM, fresh(THE_LOOSE_TEAM), 'warnWorkers', 0);
    warned = act(THE_LOOSE_TEAM, warned, 'openGateNow', 0);
    expect(warned.run?.sceneId).toBe('horsesTurnedAftermath');
    expect(sceneText(THE_LOOSE_TEAM.scenes.horsesTurnedAftermath, warned)).toMatch(/where your warning sent them/);
    warned = act(THE_LOOSE_TEAM, warned, 'leaveAfterPastureTurn');
    expect(warned.run?.sceneId).toBe('horsesTurned');
    expect(sceneText(THE_LOOSE_TEAM.scenes.horsesTurned, warned)).toMatch(/safe behind the marker/);
  });

  it('shows the Last Ferry overnight wait before its morning crossing', () => {
    let state = act(THE_LAST_FERRY, fresh(THE_LAST_FERRY), 'waitForMorning');
    expect(state.run?.sceneId).toBe('nightAtLanding');
    expect(state.run?.qualifyingStoryTransitions).toBe(0);
    expect(state.character?.historyFlags).toContain('waited_for_ferry_repair');
    expect(sceneText(THE_LAST_FERRY.scenes.nightAtLanding, state)).toMatch(/current keeps up its steady noise through the dark/);
    state = act(THE_LAST_FERRY, state, 'crossAtFirstLight');
    expect(state.run?.sceneId).toBe('morningFerry');
    expect(state.run?.status).toBe('success');
  });

  it('gives each major Loose Team resolution an aftermath before its preserved ending', () => {
    const immediateSuccesses = [
      ['horsesTurnedAftermath', 'horsesTurned'],
      ['wagonTurnedAftermath', 'wagonTurned'],
      ['teamStoppedAftermath', 'teamStopped'],
      ['wagonLostAftermath', 'wagonLost'],
    ] as const;
    for (const [aftermathId, endingId] of immediateSuccesses) {
      const scene = THE_LOOSE_TEAM.scenes[aftermathId];
      expect(scene.ending).toBeUndefined();
      expect(scene.countsForProgression).toBe(false);
      expect(scene.choices).toHaveLength(1);
      expect(scene.choices[0].next).toBe(endingId);
      expect(THE_LOOSE_TEAM.scenes[endingId].ending).toBe('success');
      expect(scene.text.length).toBeGreaterThan(80);
    }
    expect(THE_LOOSE_TEAM.scenes.teamStoppedAftermath.textVariants?.some(({ text }) => /bruised leg/.test(text))).toBe(true);
    expect(THE_LOOSE_TEAM.scenes.wagonLostAftermath.textVariants?.some((variant) => variant.requirements.flags?.includes('workerWarningFailed') && /scramble clear only as the team veers away/.test(variant.text))).toBe(true);
  });

  it('gives the horse-safe, job-lost route a quiet payoff before completion', () => {
    let state = act(ONE_HORSE_SHORT, fresh(ONE_HORSE_SHORT), 'returnForHorse');
    expect(state.run?.sceneId).toBe('farmStable');
    expect(state.run?.status).toBe('active');
    expect(sceneText(ONE_HORSE_SHORT.scenes.farmStable, state)).toMatch(/delivery note will go unread and the agreed fee is lost/);
    state = act(ONE_HORSE_SHORT, state, 'leaveAfterStableCare');
    expect(state.run?.status).toBe('success');
    expect(sceneText(ONE_HORSE_SHORT.scenes.stableDeparture, state)).toMatch(/fee is gone/);
    expect(ONE_HORSE_SHORT.scenes.farmStable.text).not.toMatch(/fire|attack|crisis/i);
  });

  it('lets the cart-and-shelter branch share a peaceful aftermath before ending', () => {
    let state = act(THREE_MILES_TO_RAIN, fresh(THREE_MILES_TO_RAIN), 'helpSecureCart');
    state = act(THREE_MILES_TO_RAIN, state, 'waitInSheepShelter');
    expect(state.run?.sceneId).toBe('sharedShelter');
    expect(state.run?.status).toBe('active');
    expect(sceneText(THREE_MILES_TO_RAIN.scenes.sharedShelter, state)).toMatch(/share a heel of bread/);
    expect(sceneText(THREE_MILES_TO_RAIN.scenes.sharedShelter, state)).not.toMatch(/danger|emergency|attack/i);
    state = act(THREE_MILES_TO_RAIN, state, 'partAfterRain');
    expect(state.run?.sceneId).toBe('shelterEnding');
    expect(state.run?.status).toBe('success');
  });

  it('clarifies the Missing Boat geometry and puts a rescue beat before its ending', () => {
    const opening = THE_MISSING_BOAT.scenes.emptyLanding.text;
    expect(opening).toMatch(/near bank/);
    expect(opening).toMatch(/midstream gravel bar/);
    expect(opening).toMatch(/far bank/);
    expect(opening).toMatch(/wet catch makes the punt too heavy to free alone/);
    expect(opening).toMatch(/bow is buried/);

    let state = act(THE_MISSING_BOAT, fresh(THE_MISSING_BOAT), 'callBoatOwner');
    expect(THE_MISSING_BOAT.scenes.downstreamBank.text).toMatch(/You remain on the near bank/);
    state = act(THE_MISSING_BOAT, state, 'walkBankToShelf', 0);
    expect(state.run?.sceneId).toBe('safeLanding');
    expect(state.run?.status).toBe('active');
    expect(sceneText(THE_MISSING_BOAT.scenes.safeLanding, state)).toMatch(/punt is hauled above the waterline/);
    state = act(THE_MISSING_BOAT, state, 'partAfterRescue');
    expect(state.run?.sceneId).toBe('rescueEnding');
    expect(state.run?.status).toBe('success');

    let wading = act(THE_MISSING_BOAT, fresh(THE_MISSING_BOAT), 'enterCurrent', 0);
    expect(wading.run?.sceneId).toBe('barWithMyrna');
    expect(THE_MISSING_BOAT.scenes.barWithMyrna.text).toMatch(/You are now on the midstream gravel bar with/);
  });

  it('shows known barn occupants only when this traveler learned of them', () => {
    let unknown = act(SMOKE_ON_THE_HILL, fresh(SMOKE_ON_THE_HILL), 'approachQuickly');
    unknown = act(SMOKE_ON_THE_HILL, unknown, 'inspectYardPump');
    unknown = act(SMOKE_ON_THE_HILL, unknown, 'workPumpByHand', 0.999);
    unknown = act(SMOKE_ON_THE_HILL, unknown, 'bucketAfterPumpFail');
    unknown = act(SMOKE_ON_THE_HILL, unknown, 'holdWaterLine');
    expect(unknown.run?.sceneId).toBe('houseAftermath');
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.houseAftermath, unknown)).toMatch(/never learned who or what was inside/);
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.houseAftermath, unknown)).not.toMatch(/Eli was outside|goats are safe/);

    let known = act(SMOKE_ON_THE_HILL, fresh(SMOKE_ON_THE_HILL), 'approachQuickly');
    known = act(SMOKE_ON_THE_HILL, known, 'checkBarnAtGate');
    known = act(SMOKE_ON_THE_HILL, known, 'protectHouseBeforeRescue');
    known = act(SMOKE_ON_THE_HILL, known, 'clearFirebreakByHand');
    known = act(SMOKE_ON_THE_HILL, known, 'secureHouseAfterBreak');
    expect(known.run?.sceneId).toBe('houseAftermath');
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.houseAftermath, known)).toMatch(/heard Eli calling from the loft and goats in the lower stall/);
    expect(sceneText(SMOKE_ON_THE_HILL.scenes.houseAftermath, known)).not.toMatch(/never learned who or what/);
    known = act(SMOKE_ON_THE_HILL, known, 'leaveAfterHouseFire');
    expect(known.run?.sceneId).toBe('propertyProtectedEnding');
    expect(known.run?.status).toBe('success');
  });
});
