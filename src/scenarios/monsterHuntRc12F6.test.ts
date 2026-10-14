import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave } from '../storage';
import type { SaveData, Scenario } from '../types';
import { THE_LANTERN_EATER, THE_MIRE_HORSE } from './monsterHuntFirst';
import { THE_CELLAR_THING, THE_GOAT_THAT_WOULDNT_STAY_DEAD, THE_MILLERS_BEAST, THE_ANTLERED_THING } from './monsterHuntSecond';
import { THE_MAN_EATER_OF_MILLERS_GAP } from './monsterHuntThird';
import { THE_PALE_CHILDREN_OF_THE_QUARRY } from './monsterHuntSecond';
import { THE_SKIN_IN_THE_TREE } from './monsterHuntThird';

function fresh(scenario: Scenario): SaveData {
  const character = newCharacter('RC12 Monster Hunt Tester');
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function take(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId} exists`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

describe('RC12 Monster Hunt converged endings', () => {
  it('keeps Lantern-Eater dawn text truthful about whether the lantern was exposed and damaged', () => {
    let exposed = fresh(THE_LANTERN_EATER);
    exposed.run!.inventory.push('lantern');
    exposed.itemStates = { lantern: { condition: 'NORMAL', upgrades: [], provenance: [] } };
    exposed = take(exposed, THE_LANTERN_EATER, 'shieldLamp');
    exposed = take(exposed, THE_LANTERN_EATER, 'raiseLantern');
    expect(exposed.itemStates?.lantern?.condition).toBe('NORMAL');
    exposed = take(exposed, THE_LANTERN_EATER, 'strikeShape', 0);
    expect(exposed.run?.sceneId).toBe('campDawn');
    const exposedText = sceneText(THE_LANTERN_EATER.scenes.campDawn, exposed);
    expect(exposedText).toMatch(/raised your lantern.*dimmed the flame without touching the glass/i);
    expect(exposedText).not.toMatch(/remains as it is|while covered/i);

    let covered = take(fresh(THE_LANTERN_EATER), THE_LANTERN_EATER, 'stayByFire');
    covered = take(covered, THE_LANTERN_EATER, 'holdUntilDawn');
    expect(sceneText(THE_LANTERN_EATER.scenes.campDawn, covered)).toMatch(/lantern remains as it is.*never touched it while covered/i);
  });

  it('does not invent helper intervention on the Mire Horse mark-and-retreat route', () => {
    let markedSkiff = take(fresh(THE_MIRE_HORSE), THE_MIRE_HORSE, 'inspectReeds');
    markedSkiff = take(markedSkiff, THE_MIRE_HORSE, 'markSkiff');
    const retreatText = sceneText(THE_MIRE_HORSE.scenes.marshDeception, markedSkiff);
    expect(THE_MIRE_HORSE.scenes.marshDeception.title).not.toMatch(/no horse/i);
    expect(retreatText).toMatch(/return to dry ground/i);
    expect(retreatText).not.toMatch(/helper.*(answers|guides|takes down)|light.*taken down|next traveler.*warn/i);

    let askedForGuide = take(fresh(THE_MIRE_HORSE), THE_MIRE_HORSE, 'inspectReeds');
    askedForGuide = take(askedForGuide, THE_MIRE_HORSE, 'followBoots');
    askedForGuide = take(askedForGuide, THE_MIRE_HORSE, 'askForHelp');
    const resumed = loadSave({ getItem: () => JSON.stringify(askedForGuide) });
    expect(sceneText(THE_MIRE_HORSE.scenes.marshDeception, resumed)).toMatch(/helper answers your request and guides you back/i);
    expect(sceneText(THE_MIRE_HORSE.scenes.marshDeception, resumed)).not.toMatch(/takes down|warned/i);

    let calledForGuide = take(fresh(THE_MIRE_HORSE), THE_MIRE_HORSE, 'callFigure');
    calledForGuide = take(calledForGuide, THE_MIRE_HORSE, 'enterReeds');
    calledForGuide = take(calledForGuide, THE_MIRE_HORSE, 'callForGuide');
    expect(sceneText(THE_MIRE_HORSE.scenes.marshDeception, calledForGuide)).toMatch(/helper answers your request and guides you back/i);

    let mudFailure = take(fresh(THE_MIRE_HORSE), THE_MIRE_HORSE, 'callFigure');
    mudFailure = take(mudFailure, THE_MIRE_HORSE, 'enterReeds');
    mudFailure = take(mudFailure, THE_MIRE_HORSE, 'reachPlanks', 0.999);
    expect(mudFailure.run?.sceneId).toBe('marshSinkingWorse');
    expect(sceneText(THE_MIRE_HORSE.scenes.marshSinkingWorse, mudFailure)).toMatch(/does not establish who reached you/i);
    expect(sceneText(THE_MIRE_HORSE.scenes.marshSinkingWorse, mudFailure)).not.toMatch(/helper reaches|pulls you|light is taken down/i);

    const legacyWithoutProof = fresh(THE_MIRE_HORSE);
    legacyWithoutProof.run!.sceneId = 'marshDeception';
    expect(sceneText(THE_MIRE_HORSE.scenes.marshDeception, legacyWithoutProof)).toMatch(/does not establish the horse-shaped light’s final state/i);
    expect(sceneText(THE_MIRE_HORSE.scenes.marshDeception, legacyWithoutProof)).not.toMatch(/helper answers|guides you back/i);
  });

  it('does not turn fetching the cellar keeper into a completed rescue or boarded opening', () => {
    let fetchOnly = take(fresh(THE_CELLAR_THING), THE_CELLAR_THING, 'inspectOutsideWall');
    fetchOnly = take(fetchOnly, THE_CELLAR_THING, 'fetchKeeper');
    const neutral = sceneText(THE_CELLAR_THING.scenes.cellarRescue, fetchOnly);
    expect(neutral).toMatch(/seller’s arrival in the yard.*not confirmed/i);
    expect(neutral).toMatch(/keeper’s decision to board.*not confirmed/i);
    expect(neutral).not.toMatch(/seller reaches the yard|keeper boards/i);

    let escorted = take(take(fresh(THE_CELLAR_THING), THE_CELLAR_THING, 'listenAtSeam'), THE_CELLAR_THING, 'removeBoards');
    escorted = take(escorted, THE_CELLAR_THING, 'guideSellerOut');
    expect(escorted.run?.flags).toContain('cellarSellerAtYard');
    const resumed = loadSave({ getItem: () => JSON.stringify(escorted) });
    const safe = sceneText(THE_CELLAR_THING.scenes.cellarRescue, resumed);
    expect(safe).toMatch(/guide the coal seller out to the yard/i);
    expect(safe).toMatch(/keeper has not yet boarded/i);

    let failed = take(take(fresh(THE_CELLAR_THING), THE_CELLAR_THING, 'listenAtSeam'), THE_CELLAR_THING, 'removeBoards');
    failed = take(failed, THE_CELLAR_THING, 'pushEarth', 0.999);
    const failure = sceneText(THE_CELLAR_THING.scenes.cellarInjury, failed);
    expect(failure).toMatch(/seller’s position.*remain unconfirmed/i);
    expect(failure).not.toMatch(/seller pull you back|keeper boards/i);
  });

  it('distinguishes a safely evacuated worker from an unconfirmed worker', () => {
    const foundWorker = take(take(fresh(THE_ANTLERED_THING), THE_ANTLERED_THING, 'callWorker'), THE_ANTLERED_THING, 'callWorkerBack');
    const safelyEvacuated = take(foundWorker, THE_ANTLERED_THING, 'abandonForestRoad');
    const resumed = loadSave({ getItem: () => JSON.stringify(safelyEvacuated) });
    const safeText = sceneText(THE_ANTLERED_THING.scenes.forestEvacuated, resumed);
    expect(safeText).toMatch(/worker reached the road safely/i);
    expect(safeText).not.toMatch(/fate is not confirmed/i);

    const leftAtEntry = take(fresh(THE_ANTLERED_THING), THE_ANTLERED_THING, 'leaveForest');
    const fallback = sceneText(THE_ANTLERED_THING.scenes.forestEvacuated, leftAtEntry);
    expect(fallback).toMatch(/worker’s fate is not confirmed/i);
    expect(fallback).not.toMatch(/reached the road safely/i);
  });

  it('keeps the mill visitor and injury closure truthful to the actual event', () => {
    const watched = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'watchOneTurn');
    expect(sceneText(THE_MILLERS_BEAST.scenes.millVisitor, watched)).not.toMatch(/with the wheel stopped/i);

    const badgerRoute = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'inspectSacks'), THE_MILLERS_BEAST, 'setEmptyCrate');
    const bitten = take(badgerRoute, THE_MILLERS_BEAST, 'cornerBadger', 0.999999);
    expect(bitten.run?.sceneId).toBe('millInjury');
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, bitten)).toMatch(/badger bites through your glove/i);
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, bitten)).not.toMatch(/belt catches your sleeve/i);

    const beltRoute = take(take(fresh(THE_MILLERS_BEAST), THE_MILLERS_BEAST, 'listenToWheel'), THE_MILLERS_BEAST, 'reachBehindBelt', 0.999999);
    expect(beltRoute.run?.sceneId).toBe('millInjury');
    const oldUnqualifiedSave = structuredClone(beltRoute);
    oldUnqualifiedSave.run!.flags = [];
    expect(sceneText(THE_MILLERS_BEAST.scenes.millInjury, oldUnqualifiedSave)).not.toMatch(/badger bites|belt catches/i);
  });

  it('leaves the goat mystery unresolved without claiming unchecked records or repairs', () => {
    const markedGoats = take(fresh(THE_GOAT_THAT_WOULDNT_STAY_DEAD), THE_GOAT_THAT_WOULDNT_STAY_DEAD, 'compareNotches');
    const stopped = take(markedGoats, THE_GOAT_THAT_WOULDNT_STAY_DEAD, 'stopInquiry');
    const text = sceneText(THE_GOAT_THAT_WOULDNT_STAY_DEAD.scenes.goatAfter, stopped);
    expect(text).toMatch(/marked goats/i);
    expect(text).toMatch(/stable book|burial/i);
    expect(text).toMatch(/remain unresolved/i);
    expect(text).not.toMatch(/leave the farmer with the tally/i);
    expect(text).not.toMatch(/gate remains repaired/i);
    expect(text).not.toMatch(/empty grave remains/i);
  });

  it('remembers a direct mountain-lion sighting without claiming its current location is known', () => {
    const sheepMoved = take(fresh(THE_MAN_EATER_OF_MILLERS_GAP), THE_MAN_EATER_OF_MILLERS_GAP, 'moveSheep');
    const sighted = take(sheepMoved, THE_MAN_EATER_OF_MILLERS_GAP, 'watchFromRock');
    const withdrew = take(sighted, THE_MAN_EATER_OF_MILLERS_GAP, 'retreatLion');
    const text = sceneText(THE_MAN_EATER_OF_MILLERS_GAP.scenes.gapAfter, withdrew);
    expect(text).toMatch(/saw the mountain lion watching from the ledge/i);
    expect(text).toMatch(/whereabouts now are unknown/i);
    expect(text).not.toMatch(/cat has not been located/i);

    const legacyFallback = sceneText(THE_MAN_EATER_OF_MILLERS_GAP.scenes.gapAfter, fresh(THE_MAN_EATER_OF_MILLERS_GAP));
    expect(legacyFallback).toMatch(/present whereabouts are uncertain/i);
    expect(legacyFallback).not.toMatch(/never saw|has not been located/i);
  });

  it('keeps the quarry shelter disclosure attached to the route that made it', () => {
    const seenFromRim = take(fresh(THE_PALE_CHILDREN_OF_THE_QUARRY), THE_PALE_CHILDREN_OF_THE_QUARRY, 'askQuarryCrew');
    const calledAcross = take(seenFromRim, THE_PALE_CHILDREN_OF_THE_QUARRY, 'callAcross');
    const told = take(calledAcross, THE_PALE_CHILDREN_OF_THE_QUARRY, 'tellForeman');
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, told)).toMatch(/told the foreman where the workers sheltered/i);
    const resumedTold = loadSave({ getItem: () => JSON.stringify(told) });
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, resumedTold)).toMatch(/told the foreman where the workers sheltered/i);

    const privateAtRim = take(take(fresh(THE_PALE_CHILDREN_OF_THE_QUARRY), THE_PALE_CHILDREN_OF_THE_QUARRY, 'askQuarryCrew'), THE_PALE_CHILDREN_OF_THE_QUARRY, 'callAcross');
    const keptPrivate = take(privateAtRim, THE_PALE_CHILDREN_OF_THE_QUARRY, 'leaveThemPrivate');
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, keptPrivate)).toMatch(/what the foreman learned/i);
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, keptPrivate)).not.toMatch(/you told the foreman/i);
    const legacy = fresh(THE_PALE_CHILDREN_OF_THE_QUARRY);
    legacy.run!.sceneId = 'quarryAfter';
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, legacy)).toMatch(/what the foreman learned/i);

    let reportedRope = take(fresh(THE_PALE_CHILDREN_OF_THE_QUARRY), THE_PALE_CHILDREN_OF_THE_QUARRY, 'askQuarryCrew');
    reportedRope = take(reportedRope, THE_PALE_CHILDREN_OF_THE_QUARRY, 'dimLantern');
    reportedRope = take(reportedRope, THE_PALE_CHILDREN_OF_THE_QUARRY, 'announceYourself');
    reportedRope = take(reportedRope, THE_PALE_CHILDREN_OF_THE_QUARRY, 'reportRope');
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, reportedRope)).toMatch(/reported the moved warning rope/i);
    expect(sceneText(THE_PALE_CHILDREN_OF_THE_QUARRY.scenes.quarryAfter, reportedRope)).not.toMatch(/warning rope restored|cut closed/i);
  });

  it('preserves learned hide explanations on withdrawal and keeps older saves neutral', () => {
    let clueOnly = take(fresh(THE_SKIN_IN_THE_TREE), THE_SKIN_IN_THE_TREE, 'inspectTreeBase');
    clueOnly = take(clueOnly, THE_SKIN_IN_THE_TREE, 'avoidRavine');
    expect(sceneText(THE_SKIN_IN_THE_TREE.scenes.hideLeft, clueOnly)).toMatch(/examining the tied hide and the drag marks/i);
    expect(sceneText(THE_SKIN_IN_THE_TREE.scenes.hideLeft, clueOnly)).toMatch(/purpose remains uncertain/i);

    let informed = take(fresh(THE_SKIN_IN_THE_TREE), THE_SKIN_IN_THE_TREE, 'askRoadCrew');
    informed = take(informed, THE_SKIN_IN_THE_TREE, 'leavePrivateLand');
    const resumed = loadSave({ getItem: () => JSON.stringify(informed) });
    expect(sceneText(THE_SKIN_IN_THE_TREE.scenes.hideLeft, resumed)).toMatch(/hearing the hunter explain/i);
    expect(sceneText(THE_SKIN_IN_THE_TREE.scenes.hideLeft, resumed)).not.toMatch(/what the trail means remains unestablished/i);

    const legacy = fresh(THE_SKIN_IN_THE_TREE);
    legacy.run!.sceneId = 'hideLeft';
    expect(sceneText(THE_SKIN_IN_THE_TREE.scenes.hideLeft, legacy)).toMatch(/remains unestablished on this route/i);
  });
});
