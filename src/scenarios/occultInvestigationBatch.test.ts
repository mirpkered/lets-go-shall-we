import { describe, expect, it } from 'vitest';
import { choose, itemState, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { classifyScenario } from '../scenarioDiversity';
import type { SaveData, Scenario } from '../types';
import { OCCULT_INVESTIGATION_ADVENTURES as adventures } from './occultInvestigationBatch';
import { SCENARIOS } from './index';
import { BROKEN_BELL } from './brokenBell';

function fresh(scenario: Scenario, item?: string, supplies: Record<string, number> = {}): SaveData {
  const character = newCharacter('Occult Tester');
  if (item) character.carriedItem = item;
  character.supplies = { ...supplies };
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}
function act(state: SaveData, scenario: Scenario, id: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((c) => c.id === id);
  if (!choice) throw new Error(`No ${scenario.title}.${scene.id}.${id}`);
  if (!meets(choice.requirements, state)) throw new Error(`Unavailable ${scenario.title}.${scene.id}.${id}`);
  return choose(state, scenario, choice, () => roll);
}
function roundTrip(state: SaveData): SaveData {
  let raw: string | null = null;
  const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
  saveGame(state, storage);
  return loadSave(storage);
}
function linkTargets(scene: Scenario['scenes'][string]): string[] {
  return scene.choices.flatMap((c) => [c.next, c.chance?.successNext, c.chance?.failureNext, c.effects?.combat?.winNext, c.effects?.combat?.lossNext].filter((x): x is string => !!x));
}
function assertPlayableGraph(scenario: Scenario, item?: string, supplies: Record<string, number> = {}): void {
  const queue = [fresh(scenario, item, supplies)];
  const seen = new Set<string>();
  let steps = 0;
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.character?.supplies, state.itemStates]);
    if (seen.has(key)) continue;
    seen.add(key);
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (run.status !== 'active' || scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} available action`).toBeGreaterThan(0);
    for (const choice of available) for (const roll of [0, .999999]) {
      const next = choose(state, scenario, choice, () => roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(++steps, scenario.title).toBeLessThan(1500);
  }
}

describe('occult investigation adventures', () => {
  it('keeps Bellweather closure claims within the voice, written-answer, and fee evidence', () => {
    const scenario = adventures.find((s) => s.id === 'seance-at-bellweather-house')!;

    let noVoice = fresh(scenario);
    noVoice = act(noVoice, scenario, 'inspectRoom');
    noVoice = act(noVoice, scenario, 'confrontMedium');
    noVoice = act(noVoice, scenario, 'endHouseSeance');
    const neutral = sceneText(scenario.scenes.bellweatherAfter, noVoice);
    expect(neutral).not.toMatch(/keeps the written answer|voice remains an account|recover part of the fee/i);
    expect(neutral).toMatch(/no written answer/i);

    let heardOnly = fresh(scenario);
    heardOnly = act(heardOnly, scenario, 'sitAsWitness');
    heardOnly = act(heardOnly, scenario, 'breakCircle');
    heardOnly = act(heardOnly, scenario, 'stayBellweather');
    expect(sceneText(scenario.scenes.bellweatherAfter, heardOnly)).toMatch(/different accounts of the voice/i);
    expect(sceneText(scenario.scenes.bellweatherAfter, heardOnly)).not.toMatch(/keeps the written answer|recover part of the fee/i);

    let written = fresh(scenario);
    written = act(written, scenario, 'sitAsWitness');
    written = act(written, scenario, 'askForProof');
    written = roundTrip(act(written, scenario, 'recordAnswer'));
    const recorded = sceneText(scenario.scenes.bellweatherAfter, written);
    expect(recorded).toMatch(/keeps the written answer/i);
    expect(recorded).toMatch(/voice and cold breath remain unexplained/i);
    expect(recorded).not.toMatch(/recover part of the fee/i);
    expect(written.character?.lore).toContain('At Bellweather House, a trick and an unexplained voice shared the same séance.');

    let watchedContinuation = fresh(scenario);
    watchedContinuation = act(watchedContinuation, scenario, 'inspectRoom');
    watchedContinuation = act(watchedContinuation, scenario, 'confrontMedium');
    watchedContinuation = act(watchedContinuation, scenario, 'continueUnderWatch');
    watchedContinuation = act(watchedContinuation, scenario, 'endSeanceNow');
    expect(sceneText(scenario.scenes.bellweatherAfter, watchedContinuation)).toMatch(/different accounts of the voice/i);
  });

  it('does not invent the lamplighter’s shared travel or witness status at the shadow ending', () => {
    const scenario = adventures.find((s) => s.id === 'the-wrong-shadow')!;

    let alone = fresh(scenario);
    alone = act(alone, scenario, 'leaveShadowAlley');
    const soloEnding = sceneText(scenario.scenes.shadowAfter, alone);
    expect(soloEnding).toMatch(/only you witnessed the shadow turn/i);
    expect(soloEnding).not.toMatch(/lamplighter reaches the crowded street|both of you saw it turn/i);

    let lanternRoute = fresh(scenario, 'lantern');
    lanternRoute = act(lanternRoute, scenario, 'testShadowLight');
    lanternRoute = act(lanternRoute, scenario, 'coverLight');
    expect(sceneText(scenario.scenes.shadowAfter, lanternRoute)).not.toMatch(/lamplighter reaches the crowded street|both of you saw it turn/i);

    let separate = fresh(scenario);
    separate = act(separate, scenario, 'callLamplighter');
    separate = act(separate, scenario, 'leaveLamplighter');
    expect(sceneText(scenario.scenes.shadowAfter, separate)).not.toMatch(/lamplighter reaches the crowded street|both of you saw it turn/i);

    let together = fresh(scenario);
    together = act(together, scenario, 'callLamplighter');
    together = roundTrip(act(together, scenario, 'walkWithLamplighter'));
    const togetherEnding = sceneText(scenario.scenes.shadowAfter, together);
    expect(togetherEnding).toMatch(/walk into the lit street together/i);
    expect(togetherEnding).toMatch(/he saw it facing the wall when he returned/i);
    expect(togetherEnding).not.toMatch(/both of you saw it turn|his shadow follows again there/i);
    expect(together.character?.historyFlags).toContain('witnessed_late_shadow');
  });

  it('registers 27 distinct new stories without adding the rejected bell duplicate', () => {
    expect(adventures).toHaveLength(27);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    expect(SCENARIOS).toHaveLength(861);
    expect(SCENARIOS.some((s) => s.title === 'The Bell That Rings Below')).toBe(false);
  });

  it('keeps every new graph forward-only, reachable, actionable, and within four choices', () => {
    for (const scenario of adventures) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id)) continue;
        reached.add(id);
        const scene = scenario.scenes[id];
        expect(scene, `${scenario.title}.${id}`).toBeTruthy();
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}.${id}`).toBeGreaterThan(0);
        expect(scene.choices.length, `${scenario.title}.${id} mobile choices`).toBeLessThanOrEqual(4);
        for (const text of [scene.text, ...(scene.textVariants ?? []).map((v) => v.text)]) expect(text.length, `${scenario.title}.${id} concise screen`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${scenario.title}.${id} mobile label`).toBeLessThanOrEqual(70);
        pending.push(...linkTargets(scene));
      }
      expect(reached.size, scenario.title).toBe(Object.keys(scenario.scenes).length);
      assertPlayableGraph(scenario);
    }
  });

  it('classifies a range of fraud, eerie, confirmed, and dungeon stories with seasonal metadata', () => {
    const byTitle = (title: string) => adventures.find((s) => s.title === title)!;
    expect(classifyScenario(byTitle('The Séance at Bellweather House')).fantasyDensity).toBe('AMBIGUOUS');
    expect(classifyScenario(byTitle('The Quiet Room')).fantasyDensity).toBe('EERIE');
    expect(classifyScenario(byTitle('The Red Chapel')).fantasyDensity).toBe('FANTASY_THREAT');
    expect(classifyScenario(byTitle('Below the Old Fort')).fantasyDensity).toBe('DUNGEON_FANTASY');
    expect(classifyScenario(byTitle('Below the Old Fort')).riskTier).toBe('SEVERE');
    expect(byTitle('The Red Chapel').diversity?.availability).toMatchObject({ season: 'OCTOBER', months: [10] });
  });

  it('lets a fresh traveler resolve the chalk-room route without occult supplies', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'studyChalk');
    expect(state.run?.sceneId).toBe('chalkPattern');
    expect(meets(scenario.scenes.chalkPattern.choices.find((c) => c.id === 'useChalkSupply')!.requirements, state)).toBe(false);
    expect(meets(scenario.scenes.chalkPattern.choices.find((c) => c.id === 'liftFloor')!.requirements, state)).toBe(true);
  });

  it('keeps the dry-well ending neutral unless the Traveler reaches the speaking tube', () => {
    const scenario = adventures.find((s) => s.id === 'voice-in-the-well')!;

    let leave = fresh(scenario);
    leave = act(leave, scenario, 'leaveWell');
    expect(sceneText(scenario.scenes.wellAfter, leave)).toMatch(/source remains unexplained/i);
    expect(sceneText(scenario.scenes.wellAfter, leave)).not.toMatch(/mason caps|speaking tube/i);

    let withdraw = fresh(scenario);
    withdraw = act(withdraw, scenario, 'testEcho');
    withdraw = act(withdraw, scenario, 'askForHelpAtWell');
    withdraw = act(withdraw, scenario, 'haulLanternBack');
    expect(sceneText(scenario.scenes.wellAfter, withdraw)).toMatch(/source remains unexplained/i);
    expect(sceneText(scenario.scenes.wellAfter, withdraw)).not.toMatch(/mason caps|speaking tube/i);

    let inspect = fresh(scenario);
    inspect = act(inspect, scenario, 'lowerLantern');
    inspect = act(inspect, scenario, 'climbWell', 0);
    expect(inspect.run?.flags).toContain('foundSpeakingTube');
    inspect = roundTrip(inspect);
    expect(sceneText(scenario.scenes.wellAfter, inspect)).toMatch(/find an old speaking tube/i);
    expect(sceneText(scenario.scenes.wellAfter, inspect)).not.toMatch(/mason caps/i);
  });

  it('shows the person pulled from the ditch before the Light Behind You ending', () => {
    const scenario = adventures.find(({ id }) => id === 'lantern-at-the-crossing')!;
    const start = fresh(scenario);
    const follow = act(start, scenario, 'followLight');
    const helped = act(follow, scenario, 'pullStrangerFree');
    expect(helped.run?.sceneId).toBe('crossingTraveler');
    expect(scenario.scenes.crossingTraveler.text).toMatch(/help an exhausted traveler climb out/i);
    expect(scenario.scenes.crossingTraveler.text).toMatch(/cannot explain the missing hours/i);
    const ending = act(helped, scenario, 'escortTraveler');
    expect(ending.run?.sceneId).toBe('crossingAfter');
    expect(scenario.scenes.crossingAfter.text).toMatch(/guide the exhausted traveler to the open road/i);
    expect(scenario.scenes.crossingAfter.text).toMatch(/whether anyone carried it/i);

    const steppedDown = act(follow, scenario, 'stepIntoDitch', 0);
    expect(steppedDown.run?.sceneId).toBe('crossingTraveler');
    const observedOnly = act(act(fresh(scenario), scenario, 'watchCrossing'), scenario, 'leaveMark');
    expect(observedOnly.run?.sceneId).toBe('crossingWithdrawEnd');
    expect(scenario.scenes.crossingWithdrawEnd.text).not.toMatch(/you guide the exhausted traveler/i);
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
  });

  it('offers the unused marked chalk only after Orin is recovered and the room is secured', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'studyChalk');
    state = act(state, scenario, 'liftFloor');
    state = act(state, scenario, 'pullOrinOut');
    expect(state.run?.sceneId).toBe('chalkAfter');
    const take = scenario.scenes.chalkAfter.choices.find((c) => c.id === 'takeRoomChalk')!;
    expect(meets(take.requirements, state)).toBe(true);
    state = roundTrip(act(state, scenario, 'takeRoomChalk'));
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('accepted_unused_chalk_from_boarded_room');

    const full = fresh(scenario, undefined, { ritualChalk: 4 });
    full.run!.sceneId = 'chalkAfter';
    expect(meets(take.requirements, full)).toBe(false);
    expect(act(full, scenario, 'leaveRoomChalk').run?.status).toBe('success');
  });

  it('consumes one Ritual Chalk and preserves its changed quantity through a save snapshot', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    let state = fresh(scenario, undefined, { ritualChalk: 2 });
    state = act(state, scenario, 'studyChalk');
    state = act(state, scenario, 'useChalkSupply');
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.character?.supplies?.ritualChalk).toBe(1);
    expect(resumed.run?.sceneId).toBe('chalkCrawl');
    expect(resumed.run?.supplyNotice).toContain('2 → 1');
  });

  it('lets a survivor accept an optional Supply replenishment without blocking the ending when the stack is full', () => {
    const scenario = adventures.find((s) => s.id === 'the-red-chapel')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'warnVillage');
    state = act(state, scenario, 'holdNeighborsBack');
    expect(state.run?.sceneId).toBe('redChapelAfter');
    state = act(state, scenario, 'acceptChapelChalk');
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    expect(state.run?.sceneId).toBe('redChapelLeave');

    let full = fresh(scenario, undefined, { ritualChalk: 4 });
    full = act(full, scenario, 'warnVillage');
    full = act(full, scenario, 'holdNeighborsBack');
    expect(meets(scenario.scenes.redChapelAfter.choices.find((c) => c.id === 'acceptChapelChalk')!.requirements, full)).toBe(false);
    full = act(full, scenario, 'declineChapelChalk');
    expect(full.run?.status).toBe('success');
    expect(full.character?.supplies?.ritualChalk).toBe(4);
  });

  it('uses one Consecrated Salt to test the specific broken chalk-circle gap', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    const choice = scenario.scenes.chalkPattern.choices.find(({ id }) => id === 'testGapWithSalt')!;
    const without = fresh(scenario);
    without.run!.sceneId = 'chalkPattern';
    expect(meets(choice.requirements, without)).toBe(false);
    let state = fresh(scenario, undefined, { consecratedSalt: 2 });
    state.run!.sceneId = 'chalkPattern';
    expect(choice.label).toContain('Consecrated Salt');
    state = roundTrip(act(state, scenario, 'testGapWithSalt'));
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.flags).toContain('saltTestedChalkRoomGap');
    expect(sceneText(scenario.scenes.chalkCrawl, state)).toContain('drew toward the gap');
    expect(sceneText(scenario.scenes.chalkCrawl, state)).not.toContain('protection against the empty coat');
    expect(act(without, scenario, 'leavePattern').run?.status).toBe('success');
  });

  it('keeps the Red Chalk Circle aftermath conditional on whether Orin was found', () => {
    const scenario = adventures.find(({ id }) => id === 'red-chalk-circle')!;
    let retreat = fresh(scenario);
    retreat = act(retreat, scenario, 'crossCircle');
    retreat = act(retreat, scenario, 'retreatFromChalk');
    expect(sceneText(scenario.scenes.chalkAfter, retreat)).toMatch(/nature of the empty coat is unexplained/i);
    expect(sceneText(scenario.scenes.chalkAfter, retreat)).not.toMatch(/Orin is out/i);

    let found = fresh(scenario);
    found = act(found, scenario, 'studyChalk');
    found = act(found, scenario, 'liftFloor');
    found = act(found, scenario, 'callForHands');
    found = roundTrip(found);
    expect(found.run?.sceneId).toBe('chalkAfter');
    expect(sceneText(scenario.scenes.chalkAfter, found)).toMatch(/Orin is found alive/i);
  });

  it('does not give the Book Without a Title printer knowledge before examining the mark', () => {
    const scenario = adventures.find(({ id }) => id === 'book-without-a-title')!;
    const unopened = act(fresh(scenario), scenario, 'closeBook');
    expect(sceneText(scenario.scenes.bookAfter, unopened)).not.toMatch(/repeated printer’s mark/i);
    expect(sceneText(scenario.scenes.bookAfter, unopened)).not.toMatch(/printer takes a copy/i);

    let examined = fresh(scenario);
    examined = act(examined, scenario, 'copyMarks');
    examined = act(examined, scenario, 'tearMarkedPage');
    examined = roundTrip(examined);
    expect(sceneText(scenario.scenes.bookAfter, examined)).toMatch(/printer recognizes the repeated mark/i);
  });

  it('keeps the Empty Coffin cause unknown unless the cooper is found', () => {
    const scenario = adventures.find(({ id }) => id === 'the-empty-coffin')!;
    const delayed = act(fresh(scenario), scenario, 'closeCoffin');
    expect(sceneText(scenario.scenes.coffinAfter, delayed)).toBe('The burial is delayed.');

    let found = fresh(scenario);
    found = act(found, scenario, 'inspectCoffin');
    found = act(found, scenario, 'followTracks');
    found = act(found, scenario, 'helpBrotherEscape');
    found = roundTrip(found);
    expect(sceneText(scenario.scenes.coffinAfter, found)).toMatch(/cooper is found alive/i);
    expect(sceneText(scenario.scenes.coffinAfter, found)).toMatch(/help the brothers leave town/i);
  });

  it('keeps The Man Who Came Back Wrong aftermath neutral until the sluice is inspected', () => {
    const scenario = adventures.find(({ id }) => id === 'the-man-who-came-back-wrong')!;
    let noInspection = fresh(scenario);
    noInspection = act(noInspection, scenario, 'giveSpace');
    expect(sceneText(scenario.scenes.workerAfter, noInspection)).toMatch(/account of the worker’s return remains unresolved/i);
    expect(sceneText(scenario.scenes.workerAfter, noInspection)).not.toMatch(/miller secures the drain/i);

    let inspected = fresh(scenario);
    inspected = act(inspected, scenario, 'askPrivateDetail');
    inspected = act(inspected, scenario, 'inspectSluice');
    inspected = act(inspected, scenario, 'takeWorkerHome');
    inspected = roundTrip(inspected);
    expect(sceneText(scenario.scenes.workerAfter, inspected)).toMatch(/two sets of prints/i);
    expect(sceneText(scenario.scenes.workerAfter, inspected)).toMatch(/walk the worker home/i);
  });

  it('does not give The Third Knock reader a name on the burned or unread-letter routes', () => {
    const scenario = adventures.find(({ id }) => id === 'the-third-knock')!;
    let burned = fresh(scenario);
    burned = act(burned, scenario, 'watchLetter');
    burned = act(burned, scenario, 'burnLetter');
    expect(sceneText(scenario.scenes.thirdKnockAfter, burned)).toMatch(/no name was revealed/i);
    expect(sceneText(scenario.scenes.thirdKnockAfter, burned)).not.toMatch(/name it showed stays with you/i);

    let unread = fresh(scenario);
    unread = act(unread, scenario, 'leaveHouseKnock');
    expect(sceneText(scenario.scenes.thirdKnockAfter, unread)).toMatch(/before its name appears/i);

    let readAndLeft = fresh(scenario);
    readAndLeft = act(readAndLeft, scenario, 'watchLetter');
    readAndLeft = act(readAndLeft, scenario, 'readLetterAloud');
    readAndLeft = act(readAndLeft, scenario, 'keepLetterHome');
    readAndLeft = roundTrip(readAndLeft);
    expect(sceneText(scenario.scenes.thirdKnockAfter, readAndLeft)).toMatch(/name appears on the page/i);
    expect(sceneText(scenario.scenes.thirdKnockAfter, readAndLeft)).toMatch(/do not carry it to the ferryman/i);
  });

  it('preserves Below the Old Fort route facts at the two converged closures', () => {
    const scenario = adventures.find(({ id }) => id === 'below-the-old-fort')!;
    let untouched = fresh(scenario);
    untouched = act(untouched, scenario, 'retreatFort');
    expect(sceneText(scenario.scenes.fortExit, untouched)).not.toMatch(/tool chest|route plan/i);

    let chest = fresh(scenario);
    chest = act(chest, scenario, 'openPowderRoom');
    chest = act(chest, scenario, 'takeToolFort');
    expect(sceneText(scenario.scenes.fortExit, chest)).toMatch(/take the tool chest/i);
    expect(sceneText(scenario.scenes.fortExit, chest)).not.toMatch(/rooms undisturbed/i);

    let noPlan = fresh(scenario);
    noPlan = act(noPlan, scenario, 'enterBarracks');
    noPlan = act(noPlan, scenario, 'crossQuietly');
    noPlan = act(noPlan, scenario, 'breakLampAnchor');
    const noPlanEnding = sceneText(scenario.scenes.fortAfter, noPlan);
    expect(noPlanEnding).toMatch(/no route plan was found/i);
    expect(noPlanEnding).not.toMatch(/find the old route plan|copied route plan/i);

    let routePlan = fresh(scenario);
    routePlan = act(routePlan, scenario, 'openPowderRoom');
    routePlan = act(routePlan, scenario, 'pushThroughFort', 0);
    expect(routePlan.run?.sceneId).toBe('fortGreen');
    routePlan = roundTrip(routePlan);
    routePlan = act(routePlan, scenario, 'breakLampAnchor');
    const ending = sceneText(scenario.scenes.fortAfter, routePlan);
    expect(ending).toMatch(/find the old route plan/i);
    expect(ending).toMatch(/break the green lamp’s bracket/i);
    expect(ending).not.toMatch(/skeleton collapses/i);
  });

  it.each([
    ['ritualChalk', 'breakCircleInsideWithChalk', 'chalkBrokeChapelLine', 'chalk'],
    ['consecratedSalt', 'interruptInsideWithSalt', 'saltBrokeChapelLine', 'Salt'],
  ])('makes %s usable after a direct chapel entry without watching from the ridge', (supply, choiceId, flag, resultText) => {
    const scenario = adventures.find((s) => s.id === 'the-red-chapel')!;
    let state = fresh(scenario, undefined, { [supply]: 1 });
    state = act(state, scenario, 'enterChapel');
    expect(state.run?.sceneId).toBe('redChapelInside');
    const choice = scenario.scenes.redChapelInside.choices.find(({ id }) => id === choiceId)!;
    expect(choice.label).toMatch(/Ritual Chalk|Consecrated Salt/);
    expect(meets(choice.requirements, state)).toBe(true);
    state = act(state, scenario, choiceId);
    expect(state.run?.sceneId).toBe('redChapelAfter');
    expect(state.run?.flags).toContain(flag);
    expect(state.character?.supplies?.[supply]).toBeUndefined();
    expect(sceneText(scenario.scenes.redChapelAfter, state)).toContain(resultText);
  });

  it('lets a traveler test the impossible passage with Chalk from either approach', () => {
    const scenario = adventures.find((s) => s.id === 'doorway-with-no-room')!;
    const without = fresh(scenario);
    expect(meets(scenario.scenes.doorInside.choices.find(({ id }) => id === 'markFarDoor')!.requirements, without)).toBe(false);
    let state = fresh(scenario, undefined, { ritualChalk: 1 });
    state = act(state, scenario, 'enterPassage');
    expect(state.run?.sceneId).toBe('doorInside');
    state = act(state, scenario, 'markFarDoor');
    expect(state.run?.status).toBe('success');
    expect(state.character?.supplies?.ritualChalk).toBeUndefined();
    expect(state.character?.knowledge).toContain('In the passage behind the plaster, the same chalk stroke appeared at both ends of a corridor longer than the house. The repeated mark confirms the space cannot be measured as an ordinary room.');
    expect(sceneText(scenario.scenes.doorAfter, roundTrip(state))).toContain('The chalk stroke you made at the far door appears beside the first mark');
    expect(sceneText(scenario.scenes.doorAfter, state)).not.toMatch(/builder’s measurements|bricks in both openings/i);
  });

  it('keeps impossible-passage closure claims within the route and current-run proof', () => {
    const scenario = adventures.find((s) => s.id === 'doorway-with-no-room')!;

    let sealed = fresh(scenario);
    sealed = act(sealed, scenario, 'sealDoorway');
    expect(sceneText(scenario.scenes.doorAfter, sealed)).toMatch(/no builder’s measurements or sealing of both openings is established/i);

    let measuredThenLeft = fresh(scenario);
    measuredThenLeft = act(measuredThenLeft, scenario, 'measureDoor');
    measuredThenLeft = act(measuredThenLeft, scenario, 'leavePassage');
    expect(sceneText(scenario.scenes.doorAfter, measuredThenLeft)).toMatch(/no builder’s measurements or sealing of both openings is established/i);

    let turnBack = fresh(scenario);
    turnBack = act(turnBack, scenario, 'enterPassage');
    turnBack = act(turnBack, scenario, 'turnBackDoor');
    expect(sceneText(scenario.scenes.doorAfter, roundTrip(turnBack))).toMatch(/turn back without opening the far door/i);
    expect(sceneText(scenario.scenes.doorAfter, turnBack)).not.toMatch(/builder confirms|bricks in both openings/i);

    let opened = fresh(scenario);
    opened = act(opened, scenario, 'enterPassage');
    opened = act(opened, scenario, 'openSecondDoor');
    expect(sceneText(scenario.scenes.doorAfter, opened)).toMatch(/open the far door into the bedroom/i);
    expect(sceneText(scenario.scenes.doorAfter, opened)).not.toMatch(/builder’s measurements|bricks in both openings/i);

    sealed.character!.historyFlags.push('opened_far_door_in_impossible_passage', 'turned_back_from_impossible_passage');
    expect(sceneText(scenario.scenes.doorAfter, sealed)).not.toMatch(/open the far door into the bedroom|turn back without opening/i);
  });

  it('offers one optional chapel-prepared Salt packet and respects its stack cap', () => {
    const scenario = adventures.find((s) => s.id === 'the-red-chapel')!;
    let state = fresh(scenario);
    state.run!.sceneId = 'redChapelAfter';
    const salt = scenario.scenes.redChapelAfter.choices.find((c) => c.id === 'acceptChapelSalt')!;
    expect(meets(salt.requirements, state)).toBe(true);
    state = act(state, scenario, 'acceptChapelSalt');
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.status).toBe('success');

    const full = fresh(scenario, undefined, { consecratedSalt: 3 });
    full.run!.sceneId = 'redChapelAfter';
    expect(meets(salt.requirements, full)).toBe(false);
    expect(act(full, scenario, 'declineChapelChalk').run?.status).toBe('success');
  });

  it('lets a fresh traveler take and then spend the housekeeper’s specific spare nail', () => {
    const scenario = adventures.find((s) => s.id === 'thing-under-floorboards')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'listenBoard');
    expect(state.run?.sceneId).toBe('floorListening');
    const acquire = scenario.scenes.floorListening.choices.find((c) => c.id === 'takeSpareNail')!;
    expect(meets(acquire.requirements, state)).toBe(true);
    state = act(state, scenario, 'takeSpareNail');
    expect(state.character?.supplies?.coldIronNails).toBe(1);
    state = roundTrip(state);
    expect(state.run?.sceneId).toBe('floorUnder');
    state = act(state, scenario, 'pinGapWithNail');
    expect(state.character?.supplies?.coldIronNails).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('1 → 0');

    const full = fresh(scenario, undefined, { coldIronNails: 6 });
    full.run!.sceneId = 'floorListening';
    expect(meets(acquire.requirements, full)).toBe(false);
  });

  it('lets a previous Nail holder pin the lifting board before opening the floor', () => {
    const scenario = adventures.find((s) => s.id === 'thing-under-floorboards')!;
    const use = scenario.scenes.floorTrap.choices.find(({ id }) => id === 'pinBulgeWithNail')!;
    let absent = fresh(scenario);
    absent = act(absent, scenario, 'setTrap');
    expect(meets(use.requirements, absent)).toBe(false);
    let state = fresh(scenario, undefined, { coldIronNails: 3 });
    state = act(state, scenario, 'setTrap');
    state = roundTrip(state);
    expect(state.run?.sceneId).toBe('floorTrap');
    state = act(state, scenario, 'pinBulgeWithNail');
    expect(state.character?.supplies?.coldIronNails).toBe(2);
    expect(state.run?.flags).toContain('pinnedLiftingBoardWithColdIron');
    expect(sceneText(scenario.scenes.floorAfter, state)).toContain('holds the lifting board down');
    expect(state.run?.status).toBe('success');
    expect(act(absent, scenario, 'openFloor').run?.sceneId).toBe('floorUnder');
  });

  it('lets a Nail holder secure a gas-marked passage cover without treating the Nail as a ward', () => {
    const scenario = adventures.find((s) => s.id === 'candle-that-will-not-go-out')!;
    const use = scenario.scenes.candleSeam.choices.find(({ id }) => id === 'securePassageWithNail')!;
    let absent = fresh(scenario);
    absent = act(absent, scenario, 'inspectWax');
    absent = act(absent, scenario, 'openShopSeam');
    expect(meets(use.requirements, absent)).toBe(false);
    let state = fresh(scenario, undefined, { coldIronNails: 2 });
    state = act(state, scenario, 'inspectWax');
    state = act(state, scenario, 'openShopSeam');
    state = roundTrip(act(state, scenario, 'securePassageWithNail'));
    expect(state.character?.supplies?.coldIronNails).toBe(1);
    expect(state.run?.flags).toContain('shopPassageBoardPinned');
    expect(sceneText(scenario.scenes.candleAfter, state)).toContain('keeps the loose board shut');
    expect(sceneText(scenario.scenes.candleAfter, state)).toContain('no one enters while stale gas may remain');
  });

  it('offers scarce Salt on a year-round fresh-traveler route and consumes it only for the matching thread threat', () => {
    const scenario = adventures.find((s) => s.id === 'the-black-thread')!;
    let state = fresh(scenario);
    const offer = scenario.scenes.blackThreadStreet.choices.find((c) => c.id === 'takeThreadSalt')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, scenario, 'takeThreadSalt');
    expect(state.character?.supplies).toEqual({ consecratedSalt: 1 });
    expect(state.run?.sceneId).toBe('threadWitness');
    state = roundTrip(state);
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.sceneId).toBe('threadWitness');
    state = act(state, scenario, 'findTailorYard');
    state = act(state, scenario, 'inspectRing');
    state = act(state, scenario, 'useSaltThread');
    expect(state.character?.supplies?.consecratedSalt).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('1 → 0');
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.character?.supplies?.consecratedSalt).toBeUndefined();
    expect(resumed.run?.sceneId).toBe('threadAfter');

    let full = fresh(scenario, undefined, { consecratedSalt: 3 });
    expect(meets(offer.requirements, full)).toBe(false);
    full = act(full, scenario, 'traceThread');
    expect(full.run?.sceneId).toBe('threadTailor');
  });

  it('offers two marked Nails without prior state, preserves the no-supply route, and consumes them explicitly at the arch', () => {
    const scenario = adventures.find((s) => s.id === 'house-with-two-cellars')!;
    let state = fresh(scenario);
    const offer = scenario.scenes.twoCellars.choices.find((c) => c.id === 'takeMarkedNailsAndDescend')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, scenario, 'takeMarkedNailsAndDescend');
    expect(state.character?.supplies).toEqual({ coldIronNails: 2 });
    expect(state.run?.sceneId).toBe('cellarLanding');
    const saved = roundTrip(state);
    expect(saved.character?.supplies?.coldIronNails).toBe(2);
    expect(saved.run?.sceneId).toBe('cellarLanding');
    state = act(state, scenario, 'nailArch');
    expect(state.character?.supplies?.coldIronNails).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('2 → 0');

    let full = fresh(scenario, undefined, { coldIronNails: 6 });
    expect(meets(offer.requirements, full)).toBe(false);
    full = act(full, scenario, 'descendTwoCellars');
    expect(full.run?.sceneId).toBe('cellarLanding');
    expect(meets(scenario.scenes.cellarLanding.choices.find((c) => c.id === 'nailArch')!.requirements, full)).toBe(true);
  });

  it('claims the cellar jar names were copied only on the copy route', () => {
    const scenario = adventures.find((s) => s.id === 'house-with-two-cellars')!;

    let stayedAbove = act(fresh(scenario), scenario, 'stayAboveCellar');
    expect(sceneText(scenario.scenes.cellarAfter, stayedAbove)).toMatch(/jar labels remain unrecorded/i);

    let securedArch = act(act(fresh(scenario), scenario, 'takeMarkedNailsAndDescend'), scenario, 'nailArch');
    expect(sceneText(scenario.scenes.cellarAfter, securedArch)).toMatch(/jar labels remain unrecorded/i);

    let retreated = act(act(act(fresh(scenario), scenario, 'descendTwoCellars'), scenario, 'pushArch'), scenario, 'retreatCellar');
    expect(sceneText(scenario.scenes.cellarAfter, retreated)).toMatch(/jar labels remain unrecorded/i);

    let copied = act(act(fresh(scenario), scenario, 'descendTwoCellars'), scenario, 'readJarNames');
    copied = roundTrip(copied);
    expect(sceneText(scenario.scenes.cellarAfter, copied)).toMatch(/you copied the jar names/i);
    expect(copied.character?.knowledge).toContain('The second cellar held jars bearing family names and an iron-lined sealed arch.');
  });

  it('offers contextual chapel Supplies and consumes Salt only as a boundary-reading aid', () => {
    let state = fresh(BROKEN_BELL);
    state.run!.sceneId = 'priestFarewell';
    state = act(state, BROKEN_BELL, 'inspectThresholdKit');
    const kit = BROKEN_BELL.scenes.priestSupplies;
    const salt = kit.choices.find(({ id }) => id === 'takeThresholdSalt')!;
    const nails = kit.choices.find(({ id }) => id === 'takeThresholdNails')!;
    expect(meets(salt.requirements, state)).toBe(true);
    state = act(state, BROKEN_BELL, 'takeThresholdSalt');
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.sceneId).toBe('burialApproach');
    expect(kit.text).toMatch(/weapon against the keeper/i);
    const full = fresh(BROKEN_BELL, undefined, { consecratedSalt: 3 });
    full.run!.sceneId = 'priestSupplies';
    expect(meets(salt.requirements, full)).toBe(false);
    const nailState = fresh(BROKEN_BELL);
    nailState.run!.sceneId = 'priestSupplies';
    expect(meets(nails.requirements, nailState)).toBe(true);
    expect(act(nailState, BROKEN_BELL, 'takeThresholdNails').character?.supplies?.coldIronNails).toBe(2);

    state.run!.sceneId = 'maskedParley';
    state = act(state, BROKEN_BELL, 'testSaltBoundary');
    expect(state.character?.supplies?.consecratedSalt).toBeUndefined();
    expect(state.character?.knowledge).toContain('At the old burial, consecrated salt trembled toward the clapper when the chamber drew sound inward; it did not stop the keeper or explain its nature.');
    expect(state.run?.sceneId).toBe('keeperSign');
  });

  it('uses the existing Grave Token and Yew Charm for narrow discoveries, not universal protection', () => {
    const box = adventures.find((s) => s.id === 'the-bone-box')!;
    let state = fresh(box, 'graveCoin');
    state = act(state, box, 'inspectBox');
    expect(meets(box.scenes.boneBoxMarks.choices.find((c) => c.id === 'tokenBox')!.requirements, state)).toBe(true);
    state = act(state, box, 'tokenBox');
    expect(state.run?.sceneId).toBe('boneBoxToken');

    const barrow = adventures.find((s) => s.id === 'the-barrow-door')!;
    let plain = fresh(barrow);
    plain = act(plain, barrow, 'followPrints');
    expect(meets(barrow.scenes.barrowHall.choices.find((c) => c.id === 'yewAtThreshold')!.requirements, plain)).toBe(false);
    let warded = fresh(barrow, 'yewCharm');
    warded = act(warded, barrow, 'followPrints');
    expect(meets(barrow.scenes.barrowHall.choices.find((c) => c.id === 'yewAtThreshold')!.requirements, warded)).toBe(true);
  });

  it('awards the lantern Spirit Glass upgrade from the glazier with provenance', () => {
    const scenario = adventures.find((s) => s.id === 'the-widows-mirror')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'inspectBacking');
    state = act(state, scenario, 'askMason');
    expect(meets(scenario.scenes.mirrorMason.choices.find((c) => c.id === 'fitSpiritGlass')!.requirements, state)).toBe(true);
    state = act(state, scenario, 'fitSpiritGlass');
    expect(itemState(state, 'lantern').upgrades).toContainEqual(expect.objectContaining({ id: 'spiritGlass' }));
    expect(itemState(state, 'lantern').provenance).toContain('Fitted by the glazier after examining the widow’s mirror');

    const crossing = adventures.find((s) => s.id === 'lantern-at-the-crossing')!;
    let equipped = fresh(crossing);
    equipped.itemStates ??= {};
    equipped.itemStates.lantern = { condition: 'NORMAL', upgrades: [{ id: 'spiritGlass', provenance: 'Glazier' }], provenance: ['Glazier'] };
    equipped = act(equipped, crossing, 'watchCrossing');
    expect(meets(crossing.scenes.crossingMarks.choices.find((c) => c.id === 'useSpiritGlass')!.requirements, equipped)).toBe(true);
  });

  it('does not claim the glazier dismantled the widow’s mirror unless that repair was chosen', () => {
    const scenario = adventures.find((s) => s.id === 'the-widows-mirror')!;
    let carried = fresh(scenario);
    carried = act(carried, scenario, 'carryMirrorOut');
    const unaltered = sceneText(scenario.scenes.mirrorAfter, carried);
    expect(unaltered).not.toMatch(/glazier takes the mirror apart/i);
    expect(unaltered).toMatch(/no repair is established/i);

    let repaired = fresh(scenario);
    repaired = act(repaired, scenario, 'inspectBacking');
    repaired = act(repaired, scenario, 'askMason');
    repaired = act(repaired, scenario, 'allowRepair');
    repaired = roundTrip(repaired);
    const repairedText = sceneText(scenario.scenes.mirrorAfter, repaired);
    expect(repairedText).toMatch(/glazier takes the mirror apart/i);
    expect(repairedText).toMatch(/warped silver/i);
  });

  it('supports a dungeon retreat, a supernatural confrontation, and a foreshadowed lethal failure', () => {
    const fort = adventures.find((s) => s.id === 'below-the-old-fort')!;
    let retreat = act(fresh(fort), fort, 'retreatFort');
    expect(retreat.run?.sceneId).toBe('fortExit');
    let survive = fresh(fort);
    survive = act(survive, fort, 'enterBarracks');
    survive = act(survive, fort, 'crossQuietly');
    survive = act(survive, fort, 'breakLampAnchor');
    expect(survive.run?.status).toBe('success');

    const red = adventures.find((s) => s.id === 'the-red-chapel')!;
    let danger = fresh(red);
    danger = act(danger, red, 'enterChapel');
    danger = act(danger, red, 'severCircle', .99);
    expect(danger.run?.status).toBe('death');
    expect(danger.run?.sceneId).toBe('redChapelDeath');
  });

  it('keeps Earth over the Door state-aware and gives the player a decision after engaging', () => {
    const barrow = adventures.find((s) => s.id === 'the-barrow-door')!;
    let closedEarly = act(fresh(barrow), barrow, 'resealMound');
    expect(closedEarly.run?.sceneId).toBe('barrowAfter');
    expect(sceneText(barrow.scenes.barrowAfter, closedEarly)).toMatch(/no one has entered/i);
    expect(barrow.scenes.barrowAfter.choices).toHaveLength(2);
    closedEarly = act(closedEarly, barrow, 'coverAndRecord');
    expect(barrow.scenes[closedEarly.run!.sceneId].text).not.toMatch(/son returns the pin/i);

    let rescue = act(fresh(barrow), barrow, 'askFarmer');
    rescue = act(rescue, barrow, 'enterForSon');
    rescue = act(rescue, barrow, 'returnPin');
    expect(sceneText(barrow.scenes.barrowAfter, rescue)).toMatch(/pin has been returned/i);
    const resumed = roundTrip(rescue);
    expect(sceneText(barrow.scenes.barrowAfter, resumed)).toMatch(/pin has been returned/i);
    rescue = act(rescue, barrow, 'markAndSeekHelp');
    expect(barrow.scenes[rescue.run!.sceneId].text).toMatch(/local keeper/i);
  });
});
