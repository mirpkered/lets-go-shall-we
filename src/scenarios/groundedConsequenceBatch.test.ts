import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, runText, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { renderQaPanel } from '../qaPanel';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { FINDERS_KEEPERS, ONLY_ONE_BULLET, POISON_THE_WELL, SCENARIOS, THE_BLUE_HOLE } from './index';
import type { SaveData, Scenario } from '../types';

const BATCH: Scenario[] = [POISON_THE_WELL, FINDERS_KEEPERS, ONLY_ONE_BULLET, THE_BLUE_HOLE];

function start(scenario: Scenario, selections: Record<string, string> = {}, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Batch Tester');
  character.carriedItem = carriedItem;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  state.run!.randomSelections = { ...state.run!.randomSelections, ...selections };
  return state;
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, random);
}

function exploreAll(scenario: Scenario, selections: Record<string, string>): number {
  const queue = [start(scenario, selections)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.acquiredThisRun, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.health, state.character?.money, state.character?.historyFlags, state.character?.knowledge]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} exposes an action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits the mobile action grid`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      const values = choice.chance || choice.effects?.combat ? [0, 0.999999] : [0];
      for (const value of values) {
        const next = choose(state, scenario, choice, () => value);
        expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
        queue.push(next);
      }
    }
    expect(seen.size).toBeLessThan(20_000);
  }
  return seen.size;
}

function selectionCombos(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((current, selection) =>
    current.flatMap((entry) => selection.values.map((value) => ({ ...entry, [selection.id]: value.value }))), [{}]);
}

describe('grounded consequence scenario batch', () => {
  it('registers four distinct adventures with acyclic graphs and no more than four simultaneous actions', () => {
    expect(BATCH).toHaveLength(4);
    const incidentalNames = BATCH.flatMap((scenario) => (scenario.runRandomSelections ?? [])
      .filter(({ id }) => /host|owner|person|swimmer|helper/i.test(id))
      .flatMap(({ values }) => values.map(({ value }) => value)));
    expect(new Set(incidentalNames).size).toBe(incidentalNames.length);
    for (const scenario of BATCH) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}.${scene.id} has choices`).toBeGreaterThan(0);
      }
    }
    const qa = renderQaPanel(true, structuredClone(EMPTY_SAVE), SCENARIOS, ITEMS);
    for (const scenario of BATCH) expect(qa).toContain(`data-qa-start="${scenario.id}"`);
  });

  it('explores every randomized state and risky outcome for zero-action scenes and revisits', () => {
    for (const scenario of BATCH) {
      for (const selections of selectionCombos(scenario)) expect(exploreAll(scenario, selections), scenario.title).toBeGreaterThan(0);
    }
  });

  it('keeps longest randomized copy within the phone authoring budget', () => {
    for (const scenario of BATCH) {
      const longest = Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => [id, values.map(({ value }) => value).sort((a, b) => b.length - a.length)[0]]));
      const state = { run: { randomSelections: longest } } as SaveData;
      for (const scene of Object.values(scenario.scenes)) {
        for (const text of [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text)]) {
          const rendered = runText(text, { run: { randomSelections: longest } } as SaveData);
          expect(rendered.length, `${scenario.title}.${scene.id}`).toBeLessThanOrEqual(400);
          expect(rendered).not.toContain('{{');
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
        }
      }
    }
  });

  it('investigates a contaminated well, recovers from an innocent-well assumption, and warns before exposure', () => {
    let state = start(POISON_THE_WELL, { source: 'wellRunoff', setting: 'farm', host: 'Gilda' });
    state = act(state, POISON_THE_WELL, 'arrival', 'inspectWell');
    expect(sceneText(POISON_THE_WELL.scenes.wellInspection, state)).toContain('rain ran down the slope');
    state = act(state, POISON_THE_WELL, 'wellInspection', 'warnWell');
    state = act(state, POISON_THE_WELL, 'wellSetAside', 'wellWasCause');
    expect(state.run?.status).toBe('success');
    expect(state.character?.knowledge).toContain('Rain runoff can foul an unprotected well.');

    state = start(POISON_THE_WELL, { source: 'waterBarrel', setting: 'roadsideInn', host: 'Eamon' });
    state = act(state, POISON_THE_WELL, 'arrival', 'inspectWell');
    state = act(state, POISON_THE_WELL, 'wellInspection', 'warnWell');
    state = act(state, POISON_THE_WELL, 'wellSetAside', 'wrongWellBarrel');
    expect(sceneText(POISON_THE_WELL.scenes.wrongSource, state)).toContain('sick all drank from the covered barrel');
    state = act(state, POISON_THE_WELL, 'wrongSource', 'recoverBarrel');
    expect(state.run?.status).toBe('success');
    expect(state.character?.knowledge).toContain('A fouled water barrel can sicken people even when a nearby well is sound.');

    state = start(POISON_THE_WELL, { source: 'spoiledStew' });
    state = act(state, POISON_THE_WELL, 'arrival', 'inspectFood');
    state = act(state, POISON_THE_WELL, 'foodInspection', 'tasteWarning');
    expect(sceneText(POISON_THE_WELL.scenes.tasteWarning, state)).toContain('you accept a real chance of feeling sick');
    state = act(state, POISON_THE_WELL, 'tasteWarning', 'tasteStewIfSource');
    expect(state.run?.health).toBe(8);
    expect(state.run?.flags).toContain('ate_suspect_food');
  });

  it('offers the replaced drainage hook only after the debris-specific cleanup route', () => {
    let state = start(POISON_THE_WELL, { source: 'wellDebris', setting: 'farm', host: 'Gilda' });
    state = act(state, POISON_THE_WELL, 'arrival', 'inspectWell');
    state = act(state, POISON_THE_WELL, 'wellInspection', 'askTimelineFromWell');
    state = act(state, POISON_THE_WELL, 'reportsCollected', 'reportDebrisCause');
    expect(state.run?.sceneId).toBe('debrisAftercare');
    const offer = POISON_THE_WELL.scenes.debrisAftercare.choices.find(({ id }) => id === 'acceptOldDrainageHook')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, POISON_THE_WELL, 'debrisAftercare', 'acceptOldDrainageHook');
    expect(state.run?.inventory).toContain('drainageHook');
    expect(state.character?.historyFlags).toContain('received_old_drainage_hook_after_well_cleanup');
    expect(state.run?.status).toBe('success');

    const owner = start(POISON_THE_WELL, { source: 'wellDebris' }, 'drainageHook');
    owner.run!.sceneId = 'debrisAftercare';
    expect(POISON_THE_WELL.scenes.debrisAftercare.choices.filter(({ id }) => id === 'acceptOldDrainageHook').some(({ requirements }) => meets(requirements, owner))).toBe(false);
  });

  it('uses accessible carryable tools for inspection without requiring equipment', () => {
    const withRope = start(POISON_THE_WELL, { source: 'wellDebris' }, 'travelRope');
    const wellActions = POISON_THE_WELL.scenes.wellInspection.choices.filter((choice) => meets(choice.requirements, withRope));
    expect(wellActions.map(({ id }) => id)).toContain('sampleWell');
    expect(wellActions.length).toBeLessThanOrEqual(4);
    const withMirror = start(POISON_THE_WELL, { source: 'wellRunoff' }, 'foldingCardMirror');
    expect(POISON_THE_WELL.scenes.wellInspection.choices.filter((choice) => meets(choice.requirements, withMirror)).map(({ id }) => id)).toContain('mirrorWellLip');
    expect(ITEMS.foldingCardMirror.carryable).toBe(true);
  });

  it('keeps Finders Keepers quiet and records exact choices without overwriting the carried item', () => {
    let state = start(FINDERS_KEEPERS, { place: 'roadside camp', owner: 'Tavren' }, 'travelRope');
    expect(act(state, FINDERS_KEEPERS, 'abandonedPlace', 'leaveUntouched').run?.status).toBe('success');
    expect(act(start(FINDERS_KEEPERS), FINDERS_KEEPERS, 'abandonedPlace', 'secureThings').character?.historyFlags).toContain('safeguarded_found_property');
    state = act(state, FINDERS_KEEPERS, 'abandonedPlace', 'lookForOwner');
    expect(sceneText(FINDERS_KEEPERS.scenes.ownerClue, state)).toContain('Three coins sit in the purse');
    expect(sceneText(FINDERS_KEEPERS.scenes.ownerClue, state)).toContain('name engraved inside');
    state = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(state.run?.randomSelections?.owner).toBe('Tavren');
    state = act(state, FINDERS_KEEPERS, 'ownerClue', 'takeWatch');
    expect(state.character?.carriedItem).toBe('travelRope');
    expect(state.character?.historyFlags).toContain('finder_took_silver_pocket_watch');
    expect(state.character?.historyFlags).toContain('finder_took_watch_from_Tavren');
    expect(state.run?.inventory).toContain('foundPocketWatch');
    expect(ITEMS.foundPocketWatch.carryable).toBe(true);
    expect(eligibleCarryItems(state)).toContain('foundPocketWatch');
    expect(FINDERS_KEEPERS.scenes.keptWatch.choices).toEqual([]);
    expect(state.run?.sceneId).toBe('keptWatch');

    let moneyState = start(FINDERS_KEEPERS);
    moneyState = act(moneyState, FINDERS_KEEPERS, 'abandonedPlace', 'lookForOwner');
    moneyState = act(moneyState, FINDERS_KEEPERS, 'ownerClue', 'takeCoins');
    expect(moneyState.character?.money).toBe(3);
    expect(moneyState.character?.historyFlags).toContain('finder_took_three_coins');
    expect(moneyState.character?.historyFlags).toContain('finder_took_purse_from_Tavren');
  });

  it('handles the armed crisis without chamber odds or a guaranteed dialogue solution', () => {
    let state = start(ONLY_ONE_BULLET, { person: 'Wulfric', state: 'shaken' });
    state = act(state, ONLY_ONE_BULLET, 'roadsideCrisis', 'speakDistant');
    state = act(state, ONLY_ONE_BULLET, 'firstReply', 'listen');
    state = act(state, ONLY_ONE_BULLET, 'listening', 'offerCompany', () => 0);
    expect(state.run?.sceneId).toBe('weaponLowered');
    state = act(state, ONLY_ONE_BULLET, 'weaponLowered', 'stayWithPerson');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('talked_armed_person_down');

    let withdraw = start(ONLY_ONE_BULLET);
    withdraw = act(withdraw, ONLY_ONE_BULLET, 'roadsideCrisis', 'withdrawForHelp');
    withdraw = act(withdraw, ONLY_ONE_BULLET, 'helpAway', 'keepWalking');
    expect(withdraw.run?.sceneId).toBe('safeWithdrawal');
    expect(withdraw.character?.historyFlags).toContain('withdrew_from_armed_crisis');

    let lost = start(ONLY_ONE_BULLET);
    lost = act(lost, ONLY_ONE_BULLET, 'roadsideCrisis', 'speakDistant');
    lost = act(lost, ONLY_ONE_BULLET, 'firstReply', 'stayBack');
    lost = act(lost, ONLY_ONE_BULLET, 'tensionRises', 'askGroundAgain', () => 0.999999);
    expect(lost.run?.sceneId).toBe('crisisLost');
    expect(lost.character?.historyFlags).toContain('armed_person_died');

    const shot = act(start(ONLY_ONE_BULLET), ONLY_ONE_BULLET, 'roadsideCrisis', 'rushWeapon', () => 0.999999);
    expect(shot.run?.status).toBe('death');
    const copy = Object.values(ONLY_ONE_BULLET.scenes).flatMap((scene) => [scene.text, ...scene.choices.map(({ label, hint }) => `${label} ${hint ?? ''}`)]).join(' ');
    expect(copy).not.toMatch(/1\s*(in|of)\s*6|cylinder index|safe chamber/i);
    expect(copy).toContain('cannot verify');
    expect(copy).not.toMatch(/say the right words|magic phrase/i);
  });

  it('allows Blue Hole quiet, find, minor, and emergency visits without swim-trigger certainty', () => {
    let quiet = start(THE_BLUE_HOLE, { visitOutcome: 'drowningEmergency' });
    quiet = act(quiet, THE_BLUE_HOLE, 'sunnyBank', 'leaveBlueHole');
    expect(quiet.run?.status).toBe('success');
    expect(quiet.run?.sceneId).toBe('leftBank');
    expect(quiet.character?.historyFlags).toContain('chose_not_to_enter_water');

    let swim = start(THE_BLUE_HOLE, { visitOutcome: 'quiet' });
    swim = act(swim, THE_BLUE_HOLE, 'sunnyBank', 'wadeIn');
    swim = act(swim, THE_BLUE_HOLE, 'shallows', 'swimOut');
    swim = act(swim, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    expect(sceneText(THE_BLUE_HOLE.scenes.deepWater, swim)).toContain('Nothing is wrong');
    swim = act(swim, THE_BLUE_HOLE, 'deepWater', 'quietSwimEnd');
    expect(swim.run?.status).toBe('success');

    let find = start(THE_BLUE_HOLE, { visitOutcome: 'interestingFind' });
    find = act(find, THE_BLUE_HOLE, 'sunnyBank', 'wadeIn');
    find = act(find, THE_BLUE_HOLE, 'shallows', 'swimOut');
    find = act(find, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    find = act(find, THE_BLUE_HOLE, 'deepWater', 'retrieveToken');
    expect(find.character?.money).toBe(1);
    expect(find.character?.historyFlags).toContain('found_object_at_blue_hole');

    let minor = start(THE_BLUE_HOLE, { visitOutcome: 'minorIncident' });
    minor = act(minor, THE_BLUE_HOLE, 'sunnyBank', 'wadeIn');
    minor = act(minor, THE_BLUE_HOLE, 'shallows', 'swimOut');
    minor = act(minor, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    minor = act(minor, THE_BLUE_HOLE, 'deepWater', 'crampToShore', () => 0.999);
    expect(minor.run?.sceneId).toBe('minorRecovered');
  });

  it('keeps carried gear on shore during rescue, persists victim state, and supports distinct outcomes', () => {
    let state = start(THE_BLUE_HOLE, { visitOutcome: 'drowningEmergency', victimState: 'panicking' }, 'travelRope');
    state = act(state, THE_BLUE_HOLE, 'sunnyBank', 'talkFirst');
    state = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(state.run?.randomSelections?.victimState).toBe('panicking');
    state = act(state, THE_BLUE_HOLE, 'shoreTalk', 'enterAfterTalk');
    state = act(state, THE_BLUE_HOLE, 'shallows', 'swimOut');
    state = act(state, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    expect(sceneText(THE_BLUE_HOLE.scenes.deepWater, state)).toContain('your pack, rope, and other gear are on shore');
    const waterActions = THE_BLUE_HOLE.scenes.deepWater.choices.filter((choice) => meets(choice.requirements, state));
    expect(waterActions.some((choice) => choice.requirements?.items?.includes('travelRope'))).toBe(false);
    expect(waterActions.some((choice) => choice.id === 'callFromWater')).toBe(true);

    const direct = act(state, THE_BLUE_HOLE, 'deepWater', 'drowningDirect', () => 0);
    expect(direct.run?.sceneId).toBe('bothReachBank');
    expect(direct.run?.inventory).toContain('travelRope');
    const postRescueActions = THE_BLUE_HOLE.scenes.bothReachBank.choices.filter((choice) => meets(choice.requirements, direct));
    expect(postRescueActions.map(({ id }) => id)).toContain('letOthersCare');

    let lost = start(THE_BLUE_HOLE, { visitOutcome: 'drowningEmergency', victimState: 'briefly submerged' });
    lost = act(lost, THE_BLUE_HOLE, 'sunnyBank', 'wadeIn');
    lost = act(lost, THE_BLUE_HOLE, 'shallows', 'swimOut');
    lost = act(lost, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    lost = act(lost, THE_BLUE_HOLE, 'deepWater', 'drowningCoach', () => 0.999999);
    expect(lost.run?.sceneId).toBe('victimLost');
    expect(lost.run?.status).toBe('success');

    let playerLost = start(THE_BLUE_HOLE, { visitOutcome: 'drowningEmergency', victimState: 'panicking' });
    playerLost = act(playerLost, THE_BLUE_HOLE, 'sunnyBank', 'wadeIn');
    playerLost = act(playerLost, THE_BLUE_HOLE, 'shallows', 'swimOut');
    playerLost = act(playerLost, THE_BLUE_HOLE, 'firstSwim', 'swimFarther');
    playerLost = act(playerLost, THE_BLUE_HOLE, 'deepWater', 'drowningDirect', () => 0.999999);
    expect(playerLost.run?.sceneId).toBe('waterStruggle');
    playerLost = act(playerLost, THE_BLUE_HOLE, 'waterStruggle', 'kickForShallows', () => 0.999999);
    expect(playerLost.run?.status).toBe('death');
  });

  it('preserves the randomized cause and adventure outcome through local save serialization', () => {
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) };
    const state = start(THE_BLUE_HOLE, { visitOutcome: 'drowningEmergency', victimState: 'cramping', swimmer: 'Lettice' });
    saveGame(state, storage as unknown as Storage);
    expect(loadSave(storage as unknown as Storage).run?.randomSelections).toEqual(state.run?.randomSelections);
    const well = start(POISON_THE_WELL, { source: 'wellRunoff' });
    saveGame(well, storage as unknown as Storage);
    expect(loadSave(storage as unknown as Storage).run?.randomSelections?.source).toBe('wellRunoff');
  });
});
