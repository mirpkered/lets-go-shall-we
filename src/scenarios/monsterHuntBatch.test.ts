import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { inventoryClass, ITEMS } from '../items';
import { scenarioRiskTier } from '../riskClassification';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { eligibleScenarioResult, simulateScenarioSelection } from '../scenarioSelection';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { EMPTY_SAVE, loadSave } from '../storage';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { MONSTER_HUNT_FIRST } from './monsterHuntFirst';
import { MONSTER_HUNT_SECOND } from './monsterHuntSecond';
import { MONSTER_HUNT_THIRD } from './monsterHuntThird';

const MONSTER_HUNT_ADVENTURES = [...MONSTER_HUNT_FIRST, ...MONSTER_HUNT_SECOND, ...MONSTER_HUNT_THIRD];

function fresh(scenario: Scenario, item?: string): SaveData {
  const character = newCharacter('Monster Hunt Tester');
  if (item) character.carriedItems = [item];
  const run = startRun(character, scenario, () => 0);
  return { ...structuredClone(EMPTY_SAVE), character, run };
}

function take(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId} exists`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

function explore(scenario: Scenario, item?: string): void {
  const queue = [fresh(scenario, item)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.randomSelections, state.character?.money, state.character?.knowledge, state.character?.historyFlags]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId} exists`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the 2x2 grid`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance || choice.effects?.combat ? [0, 0.999999] : [0]) {
        const next = choose(state, scenario, choice, () => roll);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        const visited = next.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size, `${scenario.title}.${choice.id} never revisits a scene`).toBe(visited.length);
        queue.push(next);
      }
    }
    expect(seen.size, `${scenario.title} branch state count remains bounded`).toBeLessThan(2500);
  }
}

describe('Monster Hunt / Creature Threat batch', () => {
  it('registers 29 distinct adventures with valid metadata, graph targets, and concise mobile actions', () => {
    expect(MONSTER_HUNT_ADVENTURES).toHaveLength(29);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(MONSTER_HUNT_ADVENTURES.map(({ id }) => id)).size).toBe(29);
    expect(MONSTER_HUNT_ADVENTURES.every((scenario) => SCENARIOS.includes(scenario))).toBe(true);
    expect(validateScenarioMetadata(MONSTER_HUNT_ADVENTURES)).toEqual([]);
    for (const scenario of MONSTER_HUNT_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      expect(scenarioRiskTier(scenario), scenario.title).toBe(scenario.diversity?.riskTier);
      for (const scene of Object.values(scenario.scenes)) {
        expect(scene.text.length, `${scenario.title}.${scene.id} text`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
          const requirements = choice.requirements;
          const requiredItems = [
            ...(requirements?.items ?? []), ...(requirements?.usableItems ?? []), ...(requirements?.notUsableItems ?? []),
            ...(requirements?.anyUsableItems ?? []), ...(requirements?.gear ?? []), ...(requirements?.usableGear ?? []),
            ...(requirements?.relics ?? []), ...(requirements?.temporaryEquipment ?? []), ...(requirements?.notItems ?? []),
            ...(requirements?.anyItems ?? []), ...Object.keys(requirements?.itemConditions ?? {}), ...Object.keys(requirements?.itemUpgrades ?? {}),
            ...Object.keys(requirements?.gearUpgrades ?? {}), ...Object.keys(requirements?.supplies ?? {}), ...Object.keys(requirements?.canAddSupplies ?? {}),
          ];
          for (const itemId of requiredItems) {
            expect(ITEMS[itemId], `${scenario.title} uses known item ${itemId}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('keeps Broken Antler endings consistent with whether the loop was actually freed', () => {
    const scenario = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-broken-antler')!;
    let freed = fresh(scenario);
    freed = take(freed, scenario, 'inspectLoop');
    freed = take(freed, scenario, 'cutWire');
    expect(freed.run?.sceneId).toBe('elkFreed');
    expect(scenario.scenes.elkFreed.text).toContain('broken antler clear of the wire');
    expect(scenario.scenes.elkFreed.text).not.toMatch(/favoring its injured antler/i);

    let moved = fresh(scenario);
    moved = take(moved, scenario, 'clearPeople');
    moved = take(moved, scenario, 'openHillGate');
    moved = take(moved, scenario, 'forceElkForward', 0);
    expect(moved.run?.sceneId).toBe('elkMoved');
    expect(scenario.scenes.elkMoved.text).toContain('the loop still catches its broken antler');

    let struck = fresh(scenario);
    struck = take(struck, scenario, 'clearPeople');
    struck = take(struck, scenario, 'approachWire', 0.999999);
    expect(struck.run?.sceneId).toBe('elkKick');
    expect(scenario.scenes.elkKick.text).not.toContain('moving through the open gate');
  });

  it('keeps White Stag hunt and boundary outcomes limited to route-established facts', () => {
    const scenario = MONSTER_HUNT_FIRST.find(({ id }) => id === 'the-white-stag')!;
    const ending = (state: SaveData) => sceneText(scenario.scenes.stagAfter, state);
    const unsupportedClaims = /farmer postpones the hunt|crop loss is traced to livestock|landholders still have to mend/i;

    let orchard = take(fresh(scenario), scenario, 'inspectCropEdges');
    orchard = take(orchard, scenario, 'followDeerTracks');
    orchard = take(orchard, scenario, 'letStagPass');
    expect(ending(orchard)).not.toMatch(unsupportedClaims);
    expect(orchard.character?.knowledge).toContain('A pale, limping stag fed beyond the orchard fence and left when given room.');

    let huntersLeft = take(fresh(scenario), scenario, 'inspectCropEdges');
    huntersLeft = take(huntersLeft, scenario, 'searchForHunters');
    huntersLeft = take(huntersLeft, scenario, 'leaveHunters');
    expect(ending(huntersLeft)).not.toMatch(unsupportedClaims);
    expect(ending(huntersLeft)).toMatch(/what happens to the broken boundary/i);

    let fenceMended = take(fresh(scenario), scenario, 'inspectCropEdges');
    fenceMended = take(fenceMended, scenario, 'searchForHunters');
    fenceMended = take(fenceMended, scenario, 'mendFence');
    expect(ending(fenceMended)).toMatch(/helped the hunters mend the boundary fence/i);
    expect(ending(fenceMended)).not.toMatch(unsupportedClaims);
    const reloaded = loadSave({ getItem: () => JSON.stringify(fenceMended) });
    expect(ending(reloaded)).toMatch(/helped the hunters mend the boundary fence/i);

    let asked = take(fresh(scenario), scenario, 'askNeighbor');
    asked = take(asked, scenario, 'leaveStagAlone');
    expect(ending(asked)).toMatch(/whether the farmer pursues a later hunt remains undecided/i);
    expect(ending(asked)).not.toMatch(/farmer postpones the hunt/i);
  });

  it('explores fresh-character routes through both outcomes of every risky choice without dead ends or revisits', () => {
    for (const scenario of MONSTER_HUNT_ADVENTURES) explore(scenario);
  });

  it('keeps optional gear helpful without making it a fresh-character gate', () => {
    for (const scenario of MONSTER_HUNT_ADVENTURES) {
      const start = fresh(scenario);
      const opening = scenario.scenes[scenario.startScene];
      expect(opening.choices.some((choice) => meets(choice.requirements, start)), `${scenario.title} starts for a fresh traveler`).toBe(true);
    }
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'the-river-devil')!, 'travelRope');
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'the-lantern-eater')!, 'lantern');
    explore(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!, 'conductorWhistle');
  });

  it('keeps The Last Trap outcomes within the actions each route establishes', () => {
    const scenario = MONSTER_HUNT_SECOND.find(({ id }) => id === 'the-last-trap')!;
    const textAt = (sceneId: string, state: SaveData) => sceneText(scenario.scenes[sceneId], state);
    const reload = (state: SaveData) => loadSave({ getItem: () => JSON.stringify(state) });
    const falseResolution = /dogs (?:return with the trapper|are recovered)|traps are taken down|trapper disarms the wire/i;

    let freedDogs = take(fresh(scenario), scenario, 'questionPlan');
    freedDogs = take(freedDogs, scenario, 'offerTwoPersonWatch');
    freedDogs = reload(take(freedDogs, scenario, 'freeDogs'));
    expect(textAt('trapResolved', freedDogs)).toMatch(/free the dogs and retreat/i);
    expect(textAt('trapResolved', freedDogs)).not.toMatch(falseResolution);

    let withdrew = take(fresh(scenario), scenario, 'inspectOldTraps');
    withdrew = take(withdrew, scenario, 'followDenTracks');
    withdrew = reload(take(withdrew, scenario, 'withdrawDen'));
    expect(textAt('trapResolved', withdrew)).not.toMatch(falseResolution);

    let creatureWithdrew = take(fresh(scenario), scenario, 'inspectOldTraps');
    creatureWithdrew = take(creatureWithdrew, scenario, 'moveBedroll');
    creatureWithdrew = reload(take(creatureWithdrew, scenario, 'approachDen', 0));
    expect(creatureWithdrew.run?.sceneId).toBe('trapResolved');
    expect(textAt('trapResolved', creatureWithdrew)).not.toMatch(falseResolution);

    let disabled = take(fresh(scenario), scenario, 'questionPlan');
    disabled = reload(take(disabled, scenario, 'takeChain'));
    expect(textAt('trapperStopped', disabled)).toMatch(/disable the wire trap/i);
    expect(textAt('trapperStopped', disabled)).not.toMatch(/dogs (?:return|are recovered)/i);

    let ledAway = take(fresh(scenario), scenario, 'questionPlan');
    ledAway = take(ledAway, scenario, 'offerTwoPersonWatch');
    ledAway = reload(take(ledAway, scenario, 'backTrapperAway'));
    expect(textAt('trapperStopped', ledAway)).toMatch(/lead the trapper away/i);
    expect(textAt('trapperStopped', ledAway)).not.toMatch(falseResolution);

    let signaled = take(fresh(scenario), scenario, 'inspectOldTraps');
    signaled = take(signaled, scenario, 'followDenTracks');
    signaled = reload(take(signaled, scenario, 'signalTrapperBack'));
    expect(textAt('trapperStopped', signaled)).toMatch(/signal the trapper to stay back/i);
    expect(textAt('trapperStopped', signaled)).not.toMatch(falseResolution);

    let leftAfterPlacement = take(fresh(scenario), scenario, 'questionPlan');
    leftAfterPlacement = reload(take(leftAfterPlacement, scenario, 'walkAwayTrap'));
    expect(textAt('trapLeft', leftAfterPlacement)).not.toMatch(/before the trapper sets his bedroll/i);
    expect(textAt('trapLeft', leftAfterPlacement)).toMatch(/what the trapper does next is unknown/i);
  });

  it('preserves each miner’s known location and participation through withdrawal or injury', () => {
    const scenario = MONSTER_HUNT_FIRST.find(({ id }) => id === 'teeth-in-the-mine')!;
    const textAt = (sceneId: string, state: SaveData) => sceneText(scenario.scenes[sceneId], state);
    const reload = (state: SaveData) => loadSave({ getItem: () => JSON.stringify(state) });

    const unanswered = take(fresh(scenario), scenario, 'leaveMine');
    expect(textAt('mineWaited', unanswered)).not.toMatch(/one miner answered from the side chamber/i);

    let heardViaShaft = take(fresh(scenario), scenario, 'listenShaft');
    heardViaShaft = reload(take(heardViaShaft, scenario, 'withdrawMine'));
    expect(textAt('mineWaited', heardViaShaft)).toMatch(/one miner’s answer from the side chamber/i);
    expect(textAt('mineWaited', heardViaShaft)).toMatch(/the second miner remains unaccounted for/i);
    expect(textAt('mineWaited', heardViaShaft)).not.toMatch(/the missing pair are not yet found/i);

    let heardAfterQuestion = take(fresh(scenario), scenario, 'questionForeman');
    heardAfterQuestion = take(heardAfterQuestion, scenario, 'callIntoShaft');
    heardAfterQuestion = reload(take(heardAfterQuestion, scenario, 'withdrawMine'));
    expect(textAt('mineWaited', heardAfterQuestion)).toMatch(/one miner’s answer from the side chamber/i);

    let injury = take(fresh(scenario, 'lantern'), scenario, 'questionForeman');
    injury = take(injury, scenario, 'takeAirShaft');
    injury = take(injury, scenario, 'enterCollapsedDrift', 0);
    injury = take(injury, scenario, 'holdBrace', 0.999999);
    expect(injury.run?.sceneId).toBe('mineInjury');
    expect(textAt('mineInjury', injury)).toMatch(/you get clear of the passage/i);
    expect(textAt('mineInjury', injury)).toMatch(/the second miner remains behind the brace/i);
    expect(textAt('mineInjury', injury)).not.toMatch(/the miners drag you/i);

    let success = take(fresh(scenario, 'lantern'), scenario, 'questionForeman');
    success = take(success, scenario, 'takeAirShaft');
    success = take(success, scenario, 'enterCollapsedDrift', 0);
    success = take(success, scenario, 'holdBrace', 0);
    expect(success.run?.sceneId).toBe('minersRescued');
    expect(textAt('minersRescued', success)).toMatch(/both miners emerge/i);
  });

  it('makes ordinary curiosity at the ravine survivable, while keeping a warned crossing lethal', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    const curious = take(fresh(scenario), scenario, 'callAgain');
    const stumbled = take(curious, scenario, 'enterRavine', 0.999999);
    expect(stumbled.run?.sceneId).toBe('whistleScramble');
    expect(stumbled.run?.status).toBe('active');
    expect(stumbled.run!.health).toBeGreaterThan(0);
    const encoded = JSON.stringify(stumbled);
    const resumed = loadSave({ getItem: () => encoded });
    expect(resumed.run?.sceneId).toBe('whistleScramble');
    expect(resumed.run?.health).toBe(stumbled.run?.health);
    const retreated = take(resumed, scenario, 'retreatFromBank');
    expect(retreated.run?.sceneId).toBe('whistleRoadRetreat');
    expect(retreated.run?.status).toBe('success');

    const committed = take(curious, scenario, 'enterRavine', 0);
    expect(committed.run?.sceneId).toBe('whistlePattern');
    const crossed = take(committed, scenario, 'crossRavine', 0.999999);
    expect(crossed.run?.sceneId).toBe('whistleFatal');
    expect(crossed.run?.status).toBe('death');
  });

  it('keeps the Miller’s Gap location uncertain until the cat is directly seen', () => {
    const scenario = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-man-eater-of-millers-gap')!;
    const tracks = take(fresh(scenario), scenario, 'askDrover');
    const bend = scenario.scenes.catTracks;
    const enter = bend.choices.find(({ id }) => id === 'enterBend')!;
    expect(enter.hint).toMatch(/tracks lead above the trail/i);
    expect(enter.hint).not.toMatch(/the cat is above/i);
    expect(enter.hint).toMatch(/drop leaves little room to escape/i);

    const marked = take(tracks, scenario, 'markLedge');
    expect(marked.character?.knowledge.join(' ')).toMatch(/tracks and dragged wool .* point toward a ledge/i);
    expect(marked.character?.knowledge.join(' ')).toMatch(/do not show whether the predator is still there/i);

    const sheepMoved = take(fresh(scenario), scenario, 'moveSheep');
    expect(scenario.scenes.sheepMoved.text).toMatch(/nothing shows whether the cat stayed there/i);
    const slipped = take(sheepMoved, scenario, 'followCatLedge', 0.999999);
    expect(slipped.run?.sceneId).toBe('catFall');
    expect(scenario.scenes.catFall.text).toMatch(/cat’s location remains unknown/i);
    expect(scenario.scenes.gapAfter.text).toMatch(/cat’s present whereabouts are uncertain/i);

    const directSighting = take(sheepMoved, scenario, 'watchFromRock');
    expect(directSighting.run?.sceneId).toBe('catSeen');
    expect(scenario.scenes.catSeen.text).toMatch(/mountain lion watches from the ledge/i);
    const withdrawnAfterSighting = take(directSighting, scenario, 'retreatLion');
    expect(sceneText(scenario.scenes.gapAfter, withdrawnAfterSighting)).toMatch(/saw the mountain lion watching from the ledge/i);
    expect(sceneText(scenario.scenes.gapAfter, withdrawnAfterSighting)).toMatch(/whereabouts now are unknown/i);
    const glassesRoute = take(fresh(scenario, 'fieldGlasses'), scenario, 'moveSheep');
    const glassChoice = scenario.scenes.sheepMoved.choices.find(({ id }) => id === 'watchWithFieldGlasses')!;
    expect(meets(glassChoice.requirements, glassesRoute)).toBe(true);
    expect(take(glassesRoute, scenario, glassChoice.id).run?.sceneId).toBe('catSeenAtDistance');
    expect(meets(glassChoice.requirements, sheepMoved)).toBe(false);
    expect(scenario.scenes.catSeenAtDistance.text).toMatch(/has not noticed you on the broad upper rock/i);
  });

  it('keeps sale-note comparison and quarry outcomes on the routes that establish them', () => {
    const track = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-three-toed-track')!;
    let returnedPlate = take(fresh(track), track, 'comparePrints');
    returnedPlate = take(returnedPlate, track, 'showFarmer');
    returnedPlate = take(returnedPlate, track, 'returnPlate');
    const plateOnlyText = sceneText(track.scenes.trackResolved, returnedPlate);
    expect(plateOnlyText).toMatch(/has not established the sheep’s location or compared the sale note/i);
    expect(plateOnlyText).not.toMatch(/sheep are accounted for|sale terms are compared/i);

    let paymentRequest = take(fresh(track), track, 'comparePrints');
    paymentRequest = take(paymentRequest, track, 'followWallGap');
    paymentRequest = take(paymentRequest, track, 'askForPayment');
    expect(paymentRequest.run?.flags).toContain('threeToedSheepLocated');
    expect(paymentRequest.run?.flags).not.toContain('threeToedSaleNoteCompared');
    paymentRequest = loadSave({ getItem: () => JSON.stringify(paymentRequest) });
    const paymentText = sceneText(track.scenes.trackResolved, paymentRequest);
    expect(paymentText).toMatch(/sheep are accounted for in the neighboring pen/i);
    expect(paymentText).toMatch(/sale note has not been compared/i);

    let noteCompared = take(fresh(track), track, 'comparePrints');
    noteCompared = take(noteCompared, track, 'followWallGap');
    noteCompared = take(noteCompared, track, 'compareSaleNote');
    expect(noteCompared.run?.flags).toContain('threeToedSaleNoteCompared');
    noteCompared = loadSave({ getItem: () => JSON.stringify(noteCompared) });
    const comparedText = sceneText(track.scenes.trackResolved, noteCompared);
    expect(comparedText).toMatch(/owner and buyer compare the sale note/i);
    expect(comparedText).not.toMatch(/sale note has not been compared/i);

    const legacyTrack = fresh(track);
    legacyTrack.run!.sceneId = 'trackResolved';
    const neutralTrack = sceneText(track.scenes.trackResolved, legacyTrack);
    expect(neutralTrack).toMatch(/has not established the sheep’s location or compared the sale note/i);

    const stoneback = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-stoneback')!;
    let rerouted = take(fresh(stoneback), stoneback, 'inspectCleat');
    rerouted = take(rerouted, stoneback, 'rerouteHaul');
    expect(rerouted.run?.flags).toContain('stoneCartReroutedToUpperBench');
    rerouted = loadSave({ getItem: () => JSON.stringify(rerouted) });
    const reroutedText = sceneText(stoneback.scenes.stoneRerouted, rerouted);
    expect(reroutedText).toMatch(/crew moves its cart to the upper bench/i);
    expect(reroutedText).not.toMatch(/stoneback stops shifting/i);

    let ropeSecured = take(fresh(stoneback, 'travelRope'), stoneback, 'inspectCleat');
    ropeSecured = take(ropeSecured, stoneback, 'useRopeStack');
    expect(ropeSecured.run?.flags).toContain('stoneLooseStackSecured');
    ropeSecured = loadSave({ getItem: () => JSON.stringify(ropeSecured) });
    const ropeText = sceneText(stoneback.scenes.stoneRerouted, ropeSecured);
    expect(ropeText).toMatch(/secure the loose stack with your rope/i);
    expect(ropeText).toMatch(/has not rerouted its cart/i);

    let workersMoved = take(fresh(stoneback), stoneback, 'inspectCleat');
    workersMoved = take(workersMoved, stoneback, 'approachCleft');
    workersMoved = take(workersMoved, stoneback, 'leaveDenAlone');
    expect(workersMoved.run?.flags).toContain('stoneWorkersKeptOnUpperBench');
    const workerText = sceneText(stoneback.scenes.stoneRerouted, workersMoved);
    expect(workerText).toMatch(/workers stay on the upper bench/i);
    expect(workerText).toMatch(/does not establish a cart reroute/i);

    const legacyStoneback = fresh(stoneback);
    legacyStoneback.run!.sceneId = 'stoneRerouted';
    const neutralStoneback = sceneText(stoneback.scenes.stoneRerouted, legacyStoneback);
    expect(neutralStoneback).toMatch(/does not establish that the cart was rerouted/i);
    expect(neutralStoneback).not.toMatch(/crew moves its cart|workers stay on the upper bench/i);
  });

  it('does not turn toll-road exposure into recovery of the horse or stolen sacks', () => {
    const scenario = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-beast-at-the-toll-road')!;
    let exposed = take(fresh(scenario), scenario, 'inspectWheel');
    exposed = take(exposed, scenario, 'followChain');
    exposed = take(exposed, scenario, 'raiseAlarm');
    expect(exposed.run?.flags).not.toContain('tollHorseLeadFreed');
    const exposedText = sceneText(scenario.scenes.tollRevealed, exposed);
    expect(exposedText).toMatch(/false frame is exposed/i);
    expect(exposedText).toMatch(/grain sacks remain unaccounted for/i);
    expect(exposedText).toMatch(/does not establish that the horse was freed/i);
    expect(exposedText).not.toMatch(/keeper opens the toll gate|recovering the sacks|freeing the horse/i);

    let freedHorse = take(fresh(scenario), scenario, 'askTollKeeper');
    freedHorse = take(freedHorse, scenario, 'walkThroughPass');
    freedHorse = take(freedHorse, scenario, 'freeHorse');
    expect(freedHorse.run?.flags).toContain('tollHorseLeadFreed');
    freedHorse = take(freedHorse, scenario, 'raiseAlarm');
    freedHorse = loadSave({ getItem: () => JSON.stringify(freedHorse) });
    const freedText = sceneText(scenario.scenes.tollRevealed, freedHorse);
    expect(freedText).toMatch(/horse’s lead is free/i);
    expect(freedText).toMatch(/final place is not established/i);
    expect(freedText).toMatch(/grain sacks remain unaccounted for/i);

    const grabbedHorse = take(take(fresh(scenario), scenario, 'askTollKeeper'), scenario, 'walkThroughPass');
    expect(take(grabbedHorse, scenario, 'grabHorse', 0).run?.flags).toContain('tollHorseLeadFreed');

    let failedConfrontation = take(fresh(scenario), scenario, 'inspectWheel');
    failedConfrontation = take(failedConfrontation, scenario, 'followChain');
    failedConfrontation = take(failedConfrontation, scenario, 'confrontMen', 0.999999);
    const injuryText = sceneText(scenario.scenes.tollInjury, failedConfrontation);
    expect(injuryText).toMatch(/one man shoves you against the wall as the other escapes/i);
    expect(injuryText).toMatch(/no recovery of the horse or sacks is established/i);
    expect(injuryText).not.toMatch(/keeper recovers/i);

    const legacyReveal = fresh(scenario);
    legacyReveal.run!.sceneId = 'tollRevealed';
    expect(sceneText(scenario.scenes.tollRevealed, legacyReveal)).toMatch(/does not establish that the horse was freed/i);
  });

  it('keeps snare rescue, landholder presence, and warden cleanup distinct', () => {
    const scenario = MONSTER_HUNT_THIRD.find(({ id }) => id === 'the-skin-in-the-tree')!;
    let direct = take(fresh(scenario), scenario, 'inspectTreeBase');
    direct = take(direct, scenario, 'followDragMarks');
    const campText = sceneText(scenario.scenes.poacherCamp, direct);
    expect(campText).toMatch(/no landholder has been contacted on this route/i);
    expect(campText).not.toMatch(/landholder has arrived/i);
    const freeWithoutContact = scenario.scenes.poacherCamp.choices.find(({ id }) => id === 'freeAnimal')!;
    const callLandholder = scenario.scenes.poacherCamp.choices.find(({ id }) => id === 'callLandholder')!;
    expect(meets(freeWithoutContact.requirements, direct)).toBe(false);
    expect(meets(callLandholder.requirements, direct)).toBe(true);

    let called = take(direct, scenario, 'callLandholder');
    expect(called.run?.sceneId).toBe('landholderArrives');
    expect(sceneText(scenario.scenes.landholderArrives, called)).toMatch(/landholder arrives with a lantern/i);
    called = take(called, scenario, 'askLandholderFree');
    called = loadSave({ getItem: () => JSON.stringify(called) });
    const landholderFreed = sceneText(scenario.scenes.hideResolved, called);
    expect(landholderFreed).toMatch(/landholder frees the exhausted animal from one snare/i);
    expect(landholderFreed).toMatch(/second snare and the hides remain/i);
    expect(landholderFreed).toMatch(/no warden visit or full removal is established/i);

    let markOnly = take(fresh(scenario), scenario, 'inspectTreeBase');
    markOnly = take(markOnly, scenario, 'followDragMarks');
    markOnly = take(markOnly, scenario, 'markSnares');
    const markedText = sceneText(scenario.scenes.hideResolved, markOnly);
    expect(markedText).toMatch(/mark the two-snare line and withdraw/i);
    expect(markedText).toMatch(/animal remains caught/i);
    expect(markedText).not.toMatch(/animal is released|hides are taken down/i);

    let travelerFreed = take(fresh(scenario), scenario, 'inspectTreeBase');
    travelerFreed = take(travelerFreed, scenario, 'followDragMarks');
    travelerFreed = take(travelerFreed, scenario, 'cutSnare', 0);
    const travelerText = sceneText(scenario.scenes.hideResolved, travelerFreed);
    expect(travelerText).toMatch(/your cut frees the exhausted animal from one snare/i);
    expect(travelerText).toMatch(/no landholder or warden action is established/i);

    let injured = take(fresh(scenario), scenario, 'inspectTreeBase');
    injured = take(injured, scenario, 'followDragMarks');
    injured = take(injured, scenario, 'cutSnare', 0.999999);
    const injuryText = sceneText(scenario.scenes.hideInjury, injured);
    expect(injuryText).toMatch(/retreat before the exhausted animal is freed/i);
    expect(injuryText).toMatch(/no warden response established/i);
    expect(injuryText).not.toMatch(/animal is freed by the time a warden arrives|snares and hides are removed/i);

    let invited = take(fresh(scenario), scenario, 'askRoadCrew');
    invited = take(invited, scenario, 'askLandholder');
    expect(invited.run?.flags).toContain('hideLandholderAtCamp');
    expect(meets(freeWithoutContact.requirements, invited)).toBe(true);
    expect(sceneText(scenario.scenes.poacherCamp, invited)).toMatch(/landholder arrives with a lantern/i);
    invited = take(invited, scenario, 'freeAnimal');
    expect(sceneText(scenario.scenes.hideResolved, invited)).toMatch(/landholder frees the exhausted animal/i);

    const legacyResult = fresh(scenario);
    legacyResult.run!.sceneId = 'hideResolved';
    expect(sceneText(scenario.scenes.hideResolved, legacyResult)).toMatch(/animal’s disposition and any later removal .* not established/i);
  });

  it('keeps road-side observation available without entering the unstable ravine', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    const observed = take(take(fresh(scenario), scenario, 'callAgain'), scenario, 'stopSignals');
    expect(observed.run?.sceneId).toBe('whistleSafe');
    expect(observed.run?.status).toBe('success');
    expect(observed.run!.health).toBeGreaterThan(0);
  });

  it('makes the house route in A Road Kept Straight an investigation before its stopping choice', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-that-mimics-the-whistle')!;
    let state = take(fresh(scenario, 'conductorWhistle'), scenario, 'callAgain');
    state = take(state, scenario, 'useWhistleOnce');
    state = take(state, scenario, 'leaveFenceLine');
    expect(state.run?.sceneId).toBe('whistleHousehold');
    expect(scenario.scenes.whistleHousehold.text).toMatch(/household confirms hearing the same changed note/i);
    expect(scenario.scenes.whistleHousehold.choices.map(({ label }) => label)).toEqual([
      'Help close the path until morning', 'Keep watch from the house-side fence',
    ]);
    expect(take(state, scenario, 'keepWatchFromHouse').run?.sceneId).toBe('whistleHouseWatch');
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
  });

  it('does not infer weir closure or farm action from Black Creek bear outcomes', () => {
    const scenario = MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-at-black-creek')!;

    let withdrew = fresh(scenario);
    withdrew = take(withdrew, scenario, 'followBank');
    withdrew = take(withdrew, scenario, 'waitAtDistance');
    withdrew = take(withdrew, scenario, 'backAwayBear');
    const withdrawalText = sceneText(scenario.scenes.bearWithdrawn, withdrew);
    expect(withdrawalText).toMatch(/leave the bear its route to the water/i);
    expect(withdrawalText).not.toMatch(/keeper closes|farm moves its dogs/i);

    let rushed = fresh(scenario);
    rushed = take(rushed, scenario, 'followBank');
    rushed = take(rushed, scenario, 'waitAtDistance');
    rushed = take(rushed, scenario, 'rushBear', 0);
    const rushText = sceneText(scenario.scenes.bearDriven, rushed);
    expect(rushText).toMatch(/bear retreats along the creek/i);
    expect(rushText).not.toMatch(/keeper|weir shut/i);

    let called = fresh(scenario);
    called = take(called, scenario, 'followBank');
    called = take(called, scenario, 'waitAtDistance');
    called = take(called, scenario, 'callKeeperBear');
    const callText = sceneText(scenario.scenes.bearKeeperCalled, called);
    expect(callText).toMatch(/do not see whether the keeper heard/i);
    expect(callText).not.toMatch(/keeper closes|weir shut/i);
    expect(called.character?.historyFlags).toContain('called toward the weir keeper after seeing a bear at Black Creek');
    expect(called.character?.historyFlags).not.toContain('helped close a fish weir to keep a bear from the farm');
  });

  it('varies creature truth, risk, and combat rather than making every hunt a kill', () => {
    const densities = new Set(MONSTER_HUNT_ADVENTURES.map(({ diversity }) => diversity?.fantasyDensity));
    const combat = new Set(MONSTER_HUNT_ADVENTURES.map(({ diversity }) => diversity?.combat));
    const risk = MONSTER_HUNT_ADVENTURES.reduce<Record<string, number>>((counts, scenario) => {
      const tier = scenarioRiskTier(scenario);
      counts[tier] = (counts[tier] ?? 0) + 1;
      return counts;
    }, {});
    expect(densities.size).toBeGreaterThanOrEqual(5);
    expect(combat.has('NONE')).toBe(true);
    expect(combat.has('AVOIDABLE')).toBe(true);
    expect(combat.has('POSSIBLE')).toBe(true);
    expect(risk).toEqual({ SEVERE: 7, HIGH: 12, MODERATE: 9, LOW: 1 });
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.ending === 'death'))).toBe(true);
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.ending === 'success' && /retreat|leave|close|withdraw|wait/i.test(scene.title)))).toBe(true);
    expect(MONSTER_HUNT_ADVENTURES.flatMap((scenario) => Object.values(scenario.scenes)).flatMap((scene) => scene.choices)
      .flatMap((choice) => choice.effects?.gainItems ?? []).filter((id) => /tooth|claw|horn|hide|bone|skull|fang/i.test(ITEMS[id]?.name ?? id))).toEqual([]);
    expect(MONSTER_HUNT_ADVENTURES.some((scenario) => Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) => choice.effects?.combat)))).toBe(true);
    expect(inventoryClass('travelRope')).toBe('GEAR');
  });

  it('keeps season eligibility and weighted selection integrated with recent-exclusion simulation', () => {
    const october = eligibleScenarioResult(MONSTER_HUNT_ADVENTURES, [], 10).scenarios;
    expect(october).not.toContain(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'thing-beneath-the-ice'));
    expect(october).toContain(MONSTER_HUNT_ADVENTURES.find(({ id }) => id === 'something-in-the-corn'));
    const recent = ['thing-at-black-creek'];
    expect(eligibleScenarioResult(MONSTER_HUNT_ADVENTURES, recent, 10).scenarios.map(({ id }) => id)).not.toContain('thing-at-black-creek');
    const result = simulateScenarioSelection(MONSTER_HUNT_ADVENTURES, recent, { selectionMonth: 10 }, 1000, (() => {
      let seed = 9137;
      return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646;
    })());
    expect(result.draws).toBe(1000);
    expect(Object.values(result.scenarioCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(Object.values(result.riskCounts).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(result.seasonalCount).toBeGreaterThan(0);
    expect(result.recentFallbackCount).toBe(0);
  }, 15_000);
});
