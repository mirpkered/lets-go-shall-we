import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS } from './index';
import { BRIDGE_OUT } from './bridgeOut';
import type { SaveData } from '../types';
import { loadSave, saveGame } from '../storage';

function fresh(money = 0, carriedItem: string | null = null, historyFlags: string[] = [], rolls = [0, 0, 0]): SaveData {
  const character = newCharacter('Crossing Tester');
  character.money = money;
  character.carriedItem = carriedItem;
  character.historyFlags = historyFlags;
  return { version: 1, bank: [], character, run: startRun(character, BRIDGE_OUT, () => rolls.shift() ?? 0) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = BRIDGE_OUT.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, BRIDGE_OUT, choice!, () => roll);
}

describe('Bridge Out', () => {
  it('registers for random play, avoids immediate repeats, and appears in QA direct launch', () => {
    expect(SCENARIOS).toContain(BRIDGE_OUT);
    expect(selectScenario(SCENARIOS, BRIDGE_OUT.id, () => 0)?.id).not.toBe(BRIDGE_OUT.id);
    const state = fresh();
    state.run = null;
    const qa = renderQaPanel(true, state, SCENARIOS, ITEMS);
    expect(qa).toContain('Start Bridge Out');
    expect(qa).toContain('data-qa-start="bridge-out"');
    expect(renderQaPanel(false, state, SCENARIOS, ITEMS)).toBe('');
  });

  it('lets a broke, unequipped character stabilize the bridge and finish safely', () => {
    let state = fresh();
    state = act(state, 'inspectSupports');
    expect(state.character?.knowledge).toContain('The upstream support is split below the waterline; a quick plank repair alone will not hold.');
    state = act(state, 'braceByHand', 0);
    expect(state.run?.sceneId).toBe('repairSuccess');
    state = act(state, 'acceptBridgeHammer');
    expect(state.run?.inventory).toContain('bridgewrightHammer');
    expect(state.run?.acquiredThisRun).toContain('bridgewrightHammer');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('saved_people_over_cargo');
  });

  it('supports a rope-led rescue and explicitly awards the iron clamp', () => {
    let state = fresh(0, 'travelRope');
    state = act(state, 'speakWithTravelers');
    state = act(state, 'useTravelRope', 0);
    expect(state.run?.sceneId).toBe('ropeSuccess');
    state = act(state, 'acceptIronClamp');
    expect(state.run?.inventory).toContain('ironRopeClamp');
    expect(state.run?.status).toBe('success');
    expect(ITEMS.ironRopeClamp.carryable).toBe(true);
  });

  it('lets a fresh character scout and use the alternate ford', () => {
    let state = fresh();
    state = act(state, 'scoutDownstream');
    expect(state.character?.knowledge).toContain('A shallow gravel shelf lies downstream; its crossing condition is uncertain.');
    expect(timeStatus(BRIDGE_OUT, state.run?.elapsedMinutes).phase?.id).toBe('rising');
    state = act(state, 'crossEarlyFord', 0);
    state = act(state, 'completeFordRoute');
    expect(state.run?.sceneId).toBe('fordEnding');
    expect(state.run?.status).toBe('success');
  });

  it('allows a nonjudgmental turn-back ending without spending time on a plan', () => {
    const state = act(fresh(), 'turnBack');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('turnBackEnding');
    expect(state.character?.historyFlags).toContain('walked_away_from_bridge_rescue');
    expect(state.run?.elapsedMinutes).toBe(1);
  });

  it('makes the people-versus-cargo choice consequential without framing either as evil', () => {
    let peopleFirst = act(fresh(), 'speakWithTravelers');
    peopleFirst = act(peopleFirst, 'considerWagon');
    peopleFirst = act(peopleFirst, 'peopleBeforeWagon');
    expect(peopleFirst.character?.historyFlags).toContain('saved_people_over_cargo');
    expect(peopleFirst.run?.sceneId).toBe('peopleFirst');

    let cargoFirst = act(fresh(), 'speakWithTravelers');
    cargoFirst = act(cargoFirst, 'considerWagon');
    cargoFirst = act(cargoFirst, 'wagonBeforePeople', 0);
    expect(cargoFirst.run?.sceneId).toBe('cargoSuccess');
    cargoFirst = act(cargoFirst, 'acceptRopeClamp');
    expect(cargoFirst.character?.historyFlags).toContain('saved_cargo_over_people');
    expect(cargoFirst.run?.status).toBe('success');
  });

  it('supports a costly success where people cross but property is lost', () => {
    let state = act(fresh(), 'speakWithTravelers');
    state = act(state, 'considerWagon');
    state = act(state, 'freeWagonLoad', 0);
    expect(state.run?.sceneId).toBe('costlySuccess');
    expect(state.run?.flags).toContain('medicineSaved');
    state = act(state, 'leaveCostlyCrossing');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyEnding');
  });

  it('lets carried tools improve repair time while bare-handed repair remains viable', () => {
    const tool = fresh(0, 'pocketToolkit');
    const bare = fresh();
    const toolStart = act(tool, 'inspectSupports');
    const bareStart = act(bare, 'inspectSupports');
    const toolRepair = act(toolStart, 'braceWithTools');
    const bareRepair = act(bareStart, 'braceByHand');
    expect(toolRepair.run?.elapsedMinutes).toBe(12);
    expect(bareRepair.run?.elapsedMinutes).toBe(17);
    expect(toolRepair.run?.sceneId).toBe('repairSuccess');
    expect(bareRepair.run?.sceneId).toBe('repairSuccess');
  });

  it('changes the ford opportunity and warning as fictional time advances', () => {
    let early = act(fresh(), 'scoutDownstream');
    const earlyChoices = BRIDGE_OUT.scenes.fordAssessment.choices.filter((choice) => meets(choice.requirements, early));
    expect(earlyChoices.map((choice) => choice.id)).toContain('crossEarlyFord');
    expect(earlyChoices.map((choice) => choice.id)).not.toContain('crossLateFord');
    expect(sceneText(BRIDGE_OUT.scenes.fordAssessment, early)).not.toContain('nearly covered');

    let late = act(fresh(0, null, [], [0.5, 0, 0]), 'inspectSupports');
    late = act(late, 'leaveSupportForPeople');
    late = act(late, 'searchForLowerCrossing');
    expect(late.run?.elapsedMinutes).toBe(25);
    const lateChoices = BRIDGE_OUT.scenes.fordAssessment.choices.filter((choice) => meets(choice.requirements, late));
    expect(lateChoices.map((choice) => choice.id)).toContain('crossLateFord');
    expect(lateChoices.map((choice) => choice.id)).not.toContain('crossEarlyFord');
    expect(sceneText(BRIDGE_OUT.scenes.fordAssessment, late)).toContain('nearly covered');
  });

  it('advances a failed repair into a changed situation with further actions', () => {
    let state = act(fresh(), 'inspectSupports');
    state = act(state, 'braceByHand', 0.99);
    expect(state.run?.sceneId).toBe('repairFailure');
    expect(state.run?.health).toBe(8);
    expect(BRIDGE_OUT.scenes.repairFailure.choices.length).toBeGreaterThan(0);
    state = act(state, 'helpAfterRepair');
    expect(state.run?.sceneId).toBe('peopleFirst');
  });

  it('has a clearly warned dangerous ford failure and a lethal route only after accumulated injury', () => {
    let state = act(fresh(), 'scoutDownstream');
    state = act(state, 'crossEarlyFord', 0.99);
    expect(state.run?.sceneId).toBe('fordFailure');
    expect(state.run?.health).toBe(8);
    expect(sceneText(BRIDGE_OUT.scenes.fordAssessment, state)).toContain('no longer an easy walk');
    state.run!.health = 3;
    state.run!.sceneId = 'fordAfterDelay';
    state.run!.visitedSceneIds = [...(state.run!.visitedSceneIds ?? []), 'fordAfterDelay'];
    state = act(state, 'attemptDelayedFord', 0.99);
    expect(state.run?.status).toBe('death');
  });

  it('keeps discoveries gated until the character finds them, with an optional history callback', () => {
    const freshStart = fresh();
    expect(sceneText(BRIDGE_OUT.scenes.arrival, freshStart)).not.toContain('recognizes that you have helped');
    expect(sceneText(BRIDGE_OUT.scenes.arrival, freshStart)).not.toContain('split below the waterline');
    expect(sceneText(BRIDGE_OUT.scenes.arrival, freshStart)).not.toContain('gravel shelf');
    const knownFord = act(fresh(), 'scoutDownstream');
    expect(sceneText(BRIDGE_OUT.scenes.fordAssessment, knownFord)).toContain('lower stones');
    const returning = fresh(0, null, ['rescued_missing_person']);
    expect(sceneText(BRIDGE_OUT.scenes.arrival, returning)).toContain('knows of your earlier rescue');
    const declinedBefore = fresh(0, null, ['refused_mine_rescue']);
    expect(sceneText(BRIDGE_OUT.scenes.travelerAssessment, declinedBefore)).toContain('once declined a rescue');
    expect(BRIDGE_OUT.scenes.arrival.choices.every((choice) => !choice.requirements?.historyFlags)).toBe(true);
  });

  it('establishes the physical setup before choices and never implies unseen draft animals', () => {
    const start = fresh();
    const opening = sceneText(BRIDGE_OUT.scenes.arrival, start);
    expect(opening).toContain('near bank');
    expect(opening).toContain('far bank');
    expect(opening).toContain('hole in its middle');
    expect(opening).toContain('Nobody is stranded across');
    expect(opening).toContain('wagon');
    expect(opening).toContain('No animals');
    expect(opening).toContain(start.run?.randomSelections?.travelerOne);
    expect(opening).toContain(start.run?.randomSelections?.travelerTwo);
    expect(opening).toContain('river');
    expect(opening.length).toBeLessThan(390);
    expect(BRIDGE_OUT.scenes.arrival.choices.every((choice) => (choice.label + (choice.hint ?? '')).length < 70)).toBe(true);

    const travelers = act(fresh(), 'speakWithTravelers');
    const travelerText = sceneText(BRIDGE_OUT.scenes.travelerAssessment, travelers);
    expect(travelerText).toContain('near bank');
    expect(travelerText).toContain('far bank');
    expect(travelerText).toContain('leather cargo strap');

    const choiceCopy = Object.values(BRIDGE_OUT.scenes).flatMap((scene) => scene.choices.flatMap((choice) => [
      choice.label,
      choice.hint ?? '',
      choice.chance?.successMessage ?? '',
      choice.chance?.failureMessage ?? '',
    ])).join(' ');
    expect(choiceCopy).not.toMatch(/\b(?:horses?|mules?|oxen|traces?)\b/i);
    expect(choiceCopy).toContain('Use the wagon’s leather strap as a handline');
    expect(choiceCopy).toContain('Set your rope as a bridge handline');
  });

  it('makes the cargo dilemma explicit and narrates position changes across the river', () => {
    let state = act(fresh(), 'speakWithTravelers');
    state = act(state, 'considerWagon');
    const dilemma = sceneText(BRIDGE_OUT.scenes.cargoDecision, state);
    expect(dilemma).toContain('near bank');
    expect(dilemma).toContain('medicine and travel supplies');
    expect(dilemma).toContain('split bridge');
    expect(dilemma).toContain('river is rising');

    state = act(fresh(0, 'travelRope'), 'speakWithTravelers');
    state = act(state, 'useTravelRope', 0);
    expect(state.run?.sceneId).toBe('ropeSuccess');
    expect(BRIDGE_OUT.scenes.ropeSuccess.text).toContain('reach the far bank');
    expect(BRIDGE_OUT.scenes.ropeSuccess.text).toContain('wagon remains on the near bank');

    let delayed = act(fresh(), 'speakWithTravelers');
    delayed = act(delayed, 'improviseGuideLine', 0.999);
    expect(delayed.run?.sceneId).toBe('ropeSlip');
    delayed = act(delayed, 'moveToPeoplePlan');
    expect(delayed.run?.flags).toContain('eliAcross');
    delayed = act(delayed, 'leadMaraDownstream');
    expect(delayed.run?.sceneId).toBe('fordAfterDelay');
    expect(sceneText(BRIDGE_OUT.scenes.fordAfterDelay, delayed)).toContain(`${delayed.run?.randomSelections?.travelerTwo} is already waiting on the far bank`);
  });

  it('makes every item award explicit and protects unique rewards from duplicate acquisition', () => {
    const awards = [BRIDGE_OUT.scenes.repairSuccess.choices[0], BRIDGE_OUT.scenes.cargoSuccess.choices[0], BRIDGE_OUT.scenes.ropeSuccess.choices[0]];
    expect(awards.map((choice) => choice.effects?.gainItems?.[0])).toEqual(['bridgewrightHammer', 'ironRopeClamp', 'ironRopeClamp']);
    expect(BRIDGE_OUT.scenes.repairSuccess.text).toContain('offers you the bridgewright’s spare hammer');
    expect(BRIDGE_OUT.scenes.cargoSuccess.text).toContain('gives you the spare iron rope clamp');
    expect(BRIDGE_OUT.scenes.ropeSuccess.text).toContain('offers you the sturdy iron clamp');
    expect(BRIDGE_OUT.scenes.repairSuccess.choices[0].requirements?.notItems).toContain('bridgewrightHammer');
    expect(BRIDGE_OUT.scenes.ropeSuccess.choices[0].requirements?.notItems).toContain('ironRopeClamp');
    expect(ITEMS.bridgewrightHammer.carryable).toBe(true);
    expect(ITEMS.ironRopeClamp.carryable).toBe(true);
  });

  it('has a forward-only graph and no reachable active state without a valid action', () => {
    expect(findScenarioGraphProblems(BRIDGE_OUT)).toEqual([]);
    const queue = [fresh()];
    const seen = new Set<string>();
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = [run.sceneId, run.health, run.elapsedMinutes, [...run.inventory].sort().join(','), [...run.flags].sort().join(','), [...(state.character?.knowledge ?? [])].sort().join(','), [...(state.character?.historyFlags ?? [])].sort().join(',')].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = BRIDGE_OUT.scenes[run.sceneId];
      const actions = scene.choices.filter((choice) => meets(choice.requirements, state));
      expect(actions.length, `reachable active scene ${scene.id} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
      for (const choice of actions) {
        queue.push(choose(state, BRIDGE_OUT, choice, () => 0));
        if (choice.chance) queue.push(choose(state, BRIDGE_OUT, choice, () => 0.999999));
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });

  it('rolls all three downstream conditions once and filters crossings without rerolls', () => {
    const expected = [[0.34999, 'crossable'], [0.35, 'risky'], [0.69999, 'risky'], [0.7, 'tooHigh']] as const;
    for (const [roll, condition] of expected) {
      const state = fresh(0, null, [], [roll, 0, 0]);
      expect(state.run?.randomSelections?.fordState).toBe(condition);
      state.run!.sceneId = 'fordAssessment';
      const available = BRIDGE_OUT.scenes.fordAssessment.choices.filter((choice) => meets(choice.requirements, state)).map((choice) => choice.id);
      expect(available.includes('crossEarlyFord')).toBe(condition === 'crossable');
      expect(available.includes('crossLateFord')).toBe(condition === 'risky');
      expect(available).toContain('leaveFordForHelp');
    }
  });

  it('persists randomized names and ford condition through save/resume and migrates older active runs once', () => {
    let raw: string | null = null;
    const memory = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
    const state = fresh(0, null, [], [0.51, 0.15, 0.55]);
    const names = state.run!.randomSelections;
    expect(names?.travelerOne).toBe('June');
    expect(names?.travelerTwo).toBe('Harlan');
    expect(names?.travelerOne).not.toBe(names?.travelerTwo);
    expect(sceneText(BRIDGE_OUT.scenes.arrival, state)).toContain('June');
    saveGame(state, memory);
    const resumed = loadSave(memory);
    expect(resumed.run?.randomSelections).toEqual(names);
    expect(sceneText(BRIDGE_OUT.scenes.arrival, resumed)).toContain('Harlan');

    const legacy = structuredClone(state);
    delete legacy.run!.randomSelections;
    saveGame(legacy, memory);
    const migrated = loadSave(memory);
    const migratedValues = migrated.run?.randomSelections;
    const reloaded = loadSave(memory);
    expect(reloaded.run?.randomSelections).toEqual(migratedValues);
  });

  it('uses only approved distinct NPC name pools consistently and exposes selections only in QA', () => {
    const state = fresh(0, null, [], [0.9, 0.29, 0.88]);
    const first = state.run!.randomSelections!.travelerOne;
    const second = state.run!.randomSelections!.travelerTwo;
    expect(['Clara', 'June', 'Ruth', 'Lydia', 'Nora', 'Ada', 'Elsie', 'Cora', 'Mabel', 'Rose']).toContain(first);
    expect(['Amos', 'Wade', 'Silas', 'Calvin', 'Otis', 'Harlan', 'Emmett', 'Jonah', 'Everett', 'Isaac']).toContain(second);
    expect(first).not.toBe(second);
    expect([first, second]).not.toContain('Eli');
    expect([first, second]).not.toContain('Mara');
    const allCopy = Object.values(BRIDGE_OUT.scenes).flatMap((scene) => [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text), ...scene.choices.map((choice) => `${choice.label} ${choice.hint ?? ''}`)]).join(' ');
    expect(allCopy).not.toMatch(/\b(?:Eli|Mara)\b/);
    const qa = renderQaPanel(true, state, SCENARIOS, ITEMS);
    expect(qa).toContain('travelerOne');
    expect(qa).toContain('fordState');
    expect(renderQaPanel(false, state, SCENARIOS, ITEMS)).not.toContain('randomSelections');
  });

  it('makes late hand-crossing odds worse, while early walking remains viable', () => {
    const early = fresh();
    early.run!.sceneId = 'peopleFirst';
    const earlyChoice = BRIDGE_OUT.scenes.peopleFirst.choices.find((choice) => choice.id === 'guideByHand')!;
    expect(choose(early, BRIDGE_OUT, earlyChoice, () => 0.5).run?.sceneId).toBe('ropeSuccess');
    const late = structuredClone(early);
    late.run!.sceneId = 'peopleFirst';
    late.run!.elapsedMinutes = 25;
    const lateChoice = BRIDGE_OUT.scenes.peopleFirst.choices.find((choice) => choice.id === 'guideByHand')!;
    expect(choose(late, BRIDGE_OUT, lateChoice, () => 0.5).run?.sceneId).toBe('partialCrossing');
  });

  it('offers a low-impact wait ending without special item, money, or history rewards', () => {
    let state = act(fresh(), 'speakWithTravelers');
    state = act(state, 'considerWagon');
    state = act(state, 'waitForRiver');
    expect(state.run?.sceneId).toBe('waitEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toEqual([]);
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.run?.inventory).not.toContain('bridgewrightHammer');
  });

  it('keeps Bridge Out scene and choice copy within the phone no-scroll authoring budget', () => {
    for (const scene of Object.values(BRIDGE_OUT.scenes)) {
      const variants = [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text)];
      for (const copy of variants) expect(copy.replace(/\{\{\w+\}\}/g, 'Harlan').length, `${scene.id} story copy`).toBeLessThanOrEqual(400);
      expect(scene.choices.length, `${scene.id} choice grid`).toBeLessThanOrEqual(4);
      for (const choice of scene.choices) {
        expect(choice.label.replace(/\{\{\w+\}\}/g, 'Harlan').length, `${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
        expect(choice.hint?.length ?? 0, `${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
      }
    }
  });

  it('keeps all randomized crossing conditions forward-only and actionable', () => {
    for (const roll of [0, 0.5, 0.9]) {
      const queue = [fresh(0, null, [], [roll, 0, 0])];
      const visited = new Set<string>();
      while (queue.length) {
        const state = queue.shift()!;
        const run = state.run!;
        const key = [run.sceneId, run.elapsedMinutes, run.health, run.randomSelections?.fordState, [...run.flags].sort().join(',')].join('|');
        if (visited.has(key)) continue;
        visited.add(key);
        if (run.status !== 'active') continue;
        const scene = BRIDGE_OUT.scenes[run.sceneId];
        const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
        expect(choices.length, `${run.randomSelections?.fordState} at ${scene.id}`).toBeGreaterThan(0);
        for (const choice of choices) {
          queue.push(choose(state, BRIDGE_OUT, choice, () => 0));
          if (choice.chance) queue.push(choose(state, BRIDGE_OUT, choice, () => 0.999999));
        }
      }
      expect(visited.size).toBeGreaterThan(15);
    }
  });

  it('offers a valid destination on every accessible action and completes all outcomes', () => {
    for (const scene of Object.values(BRIDGE_OUT.scenes)) {
      if (scene.ending) expect(scene.choices).toHaveLength(0);
      else expect(scene.choices.length).toBeGreaterThan(0);
      expect(scene.choices.length).toBeLessThanOrEqual(4);
    }
    expect(BRIDGE_OUT.scenes.turnBackEnding.ending).toBe('success');
    expect(BRIDGE_OUT.scenes.helpEnding.ending).toBe('success');
  });
});
