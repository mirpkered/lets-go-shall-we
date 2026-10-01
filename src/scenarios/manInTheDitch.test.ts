import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, sceneText, startAdventure, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { isQaMode, selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import type { Choice, SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_MAN_IN_THE_DITCH } from './manInTheDitch';

function fresh(carriedItem: string | null = null, money = 0, historyFlags: string[] = []): SaveData {
  const character = newCharacter('Road Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  character.historyFlags = historyFlags;
  return startAdventure({ version: 1, bank: [], character, run: null }, THE_MAN_IN_THE_DITCH);
}

function options(state: SaveData): Choice[] {
  const scene = THE_MAN_IN_THE_DITCH.scenes[state.run!.sceneId];
  return scene.choices.filter((choice) => meets(choice.requirements, state));
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = THE_MAN_IN_THE_DITCH.scenes[state.run!.sceneId];
  const choice = options(state).find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  return choose(state, THE_MAN_IN_THE_DITCH, choice!, () => roll);
}

function reachPouch(state = fresh()): SaveData {
  state = act(state, 'inspectRoadside');
  state = act(state, 'inspectWagonRuts');
  state = act(state, 'retrievePouchByHand');
  expect(state.run?.sceneId).toBe('pouchRecovered');
  return state;
}

function explore(initial: SaveData): { states: SaveData[]; scenes: Set<string> } {
  const pending = [initial];
  const states: SaveData[] = [];
  const scenes = new Set<string>();
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({ scene: run.sceneId, time: run.elapsedMinutes, health: run.health, money: state.character?.money, inventory: run.inventory, flags: run.flags, history: state.character?.historyFlags, knowledge: state.character?.knowledge });
    if (seen.has(key)) continue;
    seen.add(key);
    states.push(state);
    scenes.add(run.sceneId);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable active scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} action count`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, THE_MAN_IN_THE_DITCH, choice, () => 0));
        pending.push(choose(state, THE_MAN_IN_THE_DITCH, choice, () => 0.999));
      } else pending.push(choose(state, THE_MAN_IN_THE_DITCH, choice, () => 0));
    }
  }
  return { states, scenes };
}

describe('The Man in the Ditch', () => {
  it('registers for random selection and QA launch without exposing a player picker', () => {
    expect(SCENARIOS).toContain(THE_MAN_IN_THE_DITCH);
    const afterLastMatch = selectScenario(SCENARIOS, 'down-to-the-last-match', () => 0.999);
    expect(SCENARIOS).toContain(afterLastMatch);
    expect(afterLastMatch?.id).not.toBe('down-to-the-last-match');
    expect(selectScenario(SCENARIOS, THE_MAN_IN_THE_DITCH.id, () => 0.999)).not.toBe(THE_MAN_IN_THE_DITCH);
    expect(isQaMode('?qa=1')).toBe(true);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start The Man in the Ditch');
  });

  it('opens with three plausible readings and keeps the hidden truth out of the opening', () => {
    const opening = sceneText(THE_MAN_IN_THE_DITCH.scenes.roadsideDiscovery, fresh());
    expect(opening).toMatch(/robbed/i);
    expect(opening).not.toMatch(/payroll|partner|failed theft|accomplice|mill pouch/i);
    expect(options(fresh()).map((choice) => choice.id)).toEqual(['helpImmediately', 'askWhatHappened', 'inspectRoadside', 'leaveImmediately']);
    const earlyClues = sceneText(THE_MAN_IN_THE_DITCH.scenes.firstEvidence, { ...fresh(), run: { ...fresh().run!, sceneId: 'firstEvidence' } });
    expect(earlyClues).toMatch(/ambush|argument|fall/i);
  });

  it('supports help-first without making that route naive or consequence-free', () => {
    let state = fresh();
    state = act(state, 'helpImmediately');
    expect(state.run?.flags).toContain('manStabilized');
    expect(state.character?.historyFlags).toContain('helped_injured_stranger');
    state = act(state, 'letRowanExplain');
    expect(state.run?.sceneId).toBe('rowanAccountHelped');
    expect(state.run?.elapsedMinutes).toBe(9);
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.rowanAccountHelped, state)).toMatch(/purse|two men/i);
  });

  it('supports investigation-first, with useful evidence and visible injury cost', () => {
    let state = fresh();
    state = act(state, 'askWhatHappened');
    expect(state.run?.sceneId).toBe('firstAccount');
    state = act(state, 'searchTracksAfterQuestions');
    expect(state.run?.sceneId).toBe('evidenceAfterQuestions');
    expect(state.run?.elapsedMinutes).toBe(9);
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.evidenceAfterQuestions, state)).toMatch(/prints|breathing/i);
    expect(state.run?.flags).toContain('investigatedBeforeAid');
  });

  it('allows the player to trust the plausible account and still get Rowan to safety', () => {
    let state = fresh();
    state = act(state, 'helpImmediately');
    state = act(state, 'letRowanExplain');
    state = act(state, 'askAboutHisBoots');
    state = act(state, 'giveRowanBenefit');
    state = act(state, 'escortBarehanded', 0);
    expect(state.run?.sceneId).toBe('escortSuccess');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.escortSuccess, state)).not.toMatch(/failed theft|partner fled/i);
  });

  it('reveals the single underlying truth through physical evidence or a supported confrontation', () => {
    let state = reachPouch();
    expect(state.character?.money).toBe(0);
    state = act(state, 'readPayList');
    expect(state.character?.knowledge).toContain('The pouch is marked for the orchard mill payroll, not Rowan.');
    state = act(state, 'confrontWithWagonEvidence');
    expect(state.run?.sceneId).toBe('confrontationReveal');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.confrontationReveal, state)).toMatch(/a partner tried to divert the mill payroll/i);
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.confrontationReveal, state)).toMatch(/threw Rowan off balance into the ditch|left him hurt/i);
  });

  it('keeps the payroll confession gated until the pouch is found and ties aid callbacks to this run', () => {
    let state = fresh();
    state = act(state, 'helpImmediately');
    state = act(state, 'letRowanExplain');
    state.run!.sceneId = 'confrontationReveal';
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.confrontationReveal, state)).not.toMatch(/payroll|partner fled|failed theft/i);
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.confrontationReveal, state)).not.toMatch(/bandage on his arm/i);
    expect(options(state).map((choice) => choice.id)).not.toContain('followPartnerTracks');
    const withPouch = act(reachPouch(), 'keepPouchForWarden');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.confrontationReveal, withPouch)).toMatch(/admits he and a partner tried to divert the mill payroll/i);
    expect(options(withPouch).map((choice) => choice.id)).toContain('followPartnerTracks');
    expect(THE_MAN_IN_THE_DITCH.scenes.roadsideDiscovery.text).toMatch(/brief shower|ground is soft|orchard trees/i);
    expect(THE_MAN_IN_THE_DITCH.scenes.firstEvidence.text).toMatch(/gap in the orchard trees/i);
  });

  it('supports a wrong accusation that causes distrust but advances toward a safe outcome', () => {
    let state = fresh();
    state = act(state, 'askWhatHappened');
    state = act(state, 'searchTracksAfterQuestions');
    state = act(state, 'confrontFromPrints');
    expect(state.run?.sceneId).toBe('contradictionWithSuspicion');
    expect(state.run?.status).toBe('active');
    state = act(state, 'steadyBeforeConfronting');
    expect(state.run?.sceneId).toBe('steadyingConfrontation');
    expect(options(state).length).toBeGreaterThan(0);
  });

  it('supports outside help without requiring investigation or prior gear', () => {
    let state = fresh();
    state = act(state, 'askWhatHappened');
    state = act(state, 'fetchHelpBeforeQuestions');
    expect(state.run?.elapsedMinutes).toBe(21);
    state = act(state, 'letFarmerTakeRowan');
    expect(state.run?.status).toBe('active');
    state = act(state, 'takeFarmBandage');
    expect(state.run?.status).toBe('success');
    expect(state.run?.acquiredThisRun).toContain('fieldBandageRoll');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.helpReturns, { ...state, run: { ...state.run!, sceneId: 'helpReturns' } })).toMatch(/pouch|mill/i);
  });

  it('allows walking away without moralizing or granting an item or money', () => {
    let state = fresh();
    state = act(state, 'leaveImmediately');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('walkAwayEnding');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.character?.money).toBe(0);
    expect(state.character?.historyFlags).toContain('left_injured_man_behind');
  });

  it('makes money/property decisions explicit and records a deliberate taking', () => {
    let state = reachPouch(fresh(null, 0));
    expect(state.character?.money).toBe(0);
    expect(options(state).map((choice) => choice.id)).toContain('takeTwoCoins');
    state = act(state, 'takeTwoCoins');
    expect(state.character?.money).toBe(2);
    expect(state.run?.flags).toContain('tookCoinsFromPouch');
    state = act(state, 'keepHelpingAfterReveal');
    state = act(state, 'waitForOwner');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.ownerArrives, state)).toMatch(/two coins are missing/i);
    state = act(state, 'returnPouchToOwner');
    expect(state.run?.sceneId).toBe('propertyReturnedEnding');
  });

  it('uses carried tools to change time, access, and rescue odds', () => {
    expect(THE_MAN_IN_THE_DITCH.scenes.wagonTurnoff.choices.find((choice) => choice.id === 'useRatHookForPouch')?.timeCost).toBe(2);
    expect(THE_MAN_IN_THE_DITCH.scenes.wagonTurnoff.choices.find((choice) => choice.id === 'retrievePouchByHand')?.chance?.bonusItems).toContain('heavyLeatherGloves');
    expect(THE_MAN_IN_THE_DITCH.scenes.wagonTurnoff.choices.find((choice) => choice.id === 'useToolOnBuckle')?.timeCost).toBeLessThan(THE_MAN_IN_THE_DITCH.scenes.wagonTurnoff.choices.find((choice) => choice.id === 'inspectBuckleAtWagon')?.timeCost ?? Infinity);
    expect(THE_MAN_IN_THE_DITCH.scenes.escortAttempt.choices.find((choice) => choice.id === 'escortWithRope')?.chance?.probability).toBeGreaterThan(THE_MAN_IN_THE_DITCH.scenes.escortAttempt.choices.find((choice) => choice.id === 'escortBarehanded')?.chance?.probability ?? 0);
    expect(THE_MAN_IN_THE_DITCH.scenes.partnerTrail.choices.find((choice) => choice.id === 'descendCulvertBank')?.chance?.bonusItems).toContain('minerHeadlamp');
    expect(THE_MAN_IN_THE_DITCH.scenes.aidBeforeQuestions.choices.find((choice) => choice.id === 'useFieldBandageNow')?.timeCost).toBeLessThan(5);
    let hooked = fresh('ratCatchersHook');
    hooked = act(hooked, 'inspectRoadside');
    hooked = act(hooked, 'inspectWagonRuts');
    const beforeHook = hooked.run!.elapsedMinutes!;
    hooked = act(hooked, 'useRatHookForPouch');
    expect(hooked.run?.sceneId).toBe('pouchRecovered');
    expect(hooked.run?.elapsedMinutes).toBe(beforeHook + 2);
  });

  it('uses fictional time for worsening injury, evidence loss, and narrower rescue options', () => {
    const early = fresh();
    const late = structuredClone(early);
    late.run!.sceneId = 'firstAccount';
    late.run!.elapsedMinutes = 20;
    expect(timeStatus(THE_MAN_IN_THE_DITCH, 0).phase?.id).toBe('stable');
    expect(timeStatus(THE_MAN_IN_THE_DITCH, 21).phase?.id).toBe('dangerous');
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.firstAccount, late)).toMatch(/shivers|bleeding/i);
    const earlyEvidence = structuredClone(early);
    earlyEvidence.run!.sceneId = 'evidenceAfterQuestions';
    const lateEvidence = structuredClone(earlyEvidence);
    lateEvidence.run!.elapsedMinutes = 20;
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.evidenceAfterQuestions, lateEvidence)).toMatch(/rain has washed away/i);
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.evidenceAfterQuestions, earlyEvidence)).not.toMatch(/washed away the finer prints/i);

    const rescue = fresh('travelRope');
    rescue.run!.sceneId = 'escortAttempt';
    rescue.run!.elapsedMinutes = 37;
    expect(options(rescue).map((choice) => choice.id)).toContain('escortWithRope');
    rescue.run!.elapsedMinutes = 38;
    expect(options(rescue).map((choice) => choice.id)).not.toContain('escortWithRope');
    expect(options(rescue).map((choice) => choice.id)).toContain('lateEscortWithGear');
  });

  it('does not use wall-clock time and preserves injury, evidence, and phase state on resume', () => {
    let state = fresh();
    state.run!.startedAt -= 86_400_000;
    state = act(state, 'askWhatHappened');
    state = act(state, 'searchTracksAfterQuestions');
    expect(state.run?.elapsedMinutes).toBe(9);
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.run?.elapsedMinutes).toBe(9);
    expect(resumed.run?.flags).toEqual(state.run?.flags);
    expect(resumed.run?.sceneId).toBe('evidenceAfterQuestions');
    expect(timeStatus(THE_MAN_IN_THE_DITCH, resumed.run!.elapsedMinutes).phase?.id).toBe('worsening');
  });

  it('uses history lightly without blocking a fresh character', () => {
    const known = fresh(null, 0, ['rescued_stranded_traveler']);
    known.run!.sceneId = 'contradictionWithTrust';
    expect(sceneText(THE_MAN_IN_THE_DITCH.scenes.contradictionWithTrust, known)).toMatch(/learned before/i);
    const freshState = fresh();
    expect(options(freshState)).toHaveLength(4);
    expect(THE_MAN_IN_THE_DITCH.scenes.contradictionWithTrust.choices.find((choice) => choice.id === 'giveRowanBenefit')?.requirements).toBeUndefined();
  });

  it('offers only explicit, carryable rewards and respects the one-item selection flow', () => {
    expect(ITEMS.fieldBandageRoll.carryable).toBe(true);
    expect(ITEMS.roadsideSignalMirror.carryable).toBe(true);
    const rewards = Object.values(THE_MAN_IN_THE_DITCH.scenes).flatMap((scene) => scene.choices.filter((choice) => choice.effects?.gainItems));
    expect(rewards.map((choice) => choice.effects?.gainItems?.[0])).toEqual(expect.arrayContaining(['fieldBandageRoll', 'roadsideSignalMirror']));
    expect(rewards.every((choice) => /bandage|mirror/i.test(choice.label))).toBe(true);
    const bandageReward = fresh();
    bandageReward.run!.inventory.push('fieldBandageRoll');
    bandageReward.run!.acquiredThisRun.push('fieldBandageRoll');
    expect(eligibleCarryItems(bandageReward)).toContain('fieldBandageRoll');
    const alreadyHasMirror = fresh('roadsideSignalMirror');
    alreadyHasMirror.run!.sceneId = 'ownerArrives';
    alreadyHasMirror.run!.flags.push('pouchRecovered');
    expect(options(alreadyHasMirror).map((choice) => choice.id)).not.toContain('acceptSignalMirror');
  });

  it('keeps moral ambiguity contextual and does not add a morality or score system', () => {
    expect(JSON.stringify(THE_MAN_IN_THE_DITCH)).not.toMatch(/morality|karma|score|alignment/i);
    expect(THE_MAN_IN_THE_DITCH.scenes.resolutionChoice.text).toMatch(/no way to undo/i);
  });

  it('warns before a dangerous failure and permits death only after a second exposed attempt', () => {
    let state = fresh();
    state.run!.sceneId = 'partnerTrail';
    const descent = THE_MAN_IN_THE_DITCH.scenes.partnerTrail.choices.find((choice) => choice.id === 'descendCulvertBank')!;
    expect(descent.hint).toMatch(/fast water|fatal/i);
    state = choose(state, THE_MAN_IN_THE_DITCH, descent, () => 0.999);
    expect(state.run?.sceneId).toBe('culvertFall');
    expect(state.run?.status).toBe('active');
    expect(state.run?.health).toBe(6);
    const secondTry = THE_MAN_IN_THE_DITCH.scenes.culvertFall.choices.find((choice) => choice.id === 'riskSecondCulvertClimb')!;
    expect(secondTry.hint).toMatch(/fall into the millrace could kill/i);
    state = choose(state, THE_MAN_IN_THE_DITCH, secondTry, () => 0.999);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('culvertDeath');
  });

  it('has a forward-only graph with no duplicate unique rewards and no reachable dead ends', () => {
    expect(findScenarioGraphProblems(THE_MAN_IN_THE_DITCH)).toEqual([]);
    const profiles = [fresh(), fresh('travelRope'), fresh('fieldBandageRoll'), fresh('ratCatchersHook'), fresh('minerHeadlamp'), fresh('heavyLeatherGloves'), fresh('pocketToolkit', 3), fresh(null, 0, ['helped_injured_stranger', 'rescued_stranded_traveler'])];
    const scenes = new Set<string>();
    const allStates: SaveData[] = [];
    for (const profile of profiles) {
      const result = explore(profile);
      result.scenes.forEach((scene) => scenes.add(scene));
      allStates.push(...result.states);
    }
    expect([...Object.keys(THE_MAN_IN_THE_DITCH.scenes)].filter((id) => !scenes.has(id))).toEqual([]);
    expect(allStates.some((state) => state.run?.status === 'success')).toBe(true);
    expect(allStates.some((state) => state.run?.status === 'death')).toBe(true);
    const hiddenTruth = /partner fled|failed theft|tried to divert the mill payroll|his part in the theft/i;
    for (const state of allStates) {
      const run = state.run!;
      const authorizedReveal = run.flags.includes('confrontedStory')
        || ['confrontationReveal', 'farmerEvidenceEnding', 'walkAwayAfterReveal'].includes(run.sceneId)
        || (run.flags.includes('pouchRecovered') && run.sceneId === 'resolutionChoice')
        || (run.flags.includes('pouchRecovered') && ['wardenResolution', 'wardenRewardEnding'].includes(run.sceneId));
      if (!authorizedReveal) expect(sceneText(THE_MAN_IN_THE_DITCH.scenes[run.sceneId], state), `${run.sceneId} does not leak hidden truth`).not.toMatch(hiddenTruth);
    }
    for (const scene of Object.values(THE_MAN_IN_THE_DITCH.scenes)) {
      const rewardedIds = scene.choices.flatMap((choice) => choice.effects?.gainItems ?? []);
      for (const item of ['fieldBandageRoll', 'roadsideSignalMirror']) {
        expect(rewardedIds.filter((id) => id === item).length).toBeLessThanOrEqual(1);
      }
    }
    expect(allStates.every((state) => !state.character?.historyFlags?.some((flag) => /score|morality/i.test(flag)))).toBe(true);
  });
});
