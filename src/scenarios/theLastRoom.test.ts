import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, meets, newCharacter, startAdventure, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { SCENARIOS, THE_LAST_ROOM } from './index';
import type { SaveData } from '../types';
import { loadSave, SAVE_KEY } from '../storage';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Inn Guest');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, THE_LAST_ROOM) };
}

function pick(state: SaveData, choiceId: string, random = () => 0): SaveData {
  const sceneId = state.run!.sceneId;
  const choice = THE_LAST_ROOM.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  if (!choice) throw new Error(`Missing action ${sceneId}.${choiceId}`);
  if (!meets(choice.requirements, state)) throw new Error(`Unavailable action ${sceneId}.${choiceId}`);
  return choose(state, THE_LAST_ROOM, choice, random);
}

function toCellar(state: SaveData): SaveData {
  state = pick(state, 'askGuests');
  state = pick(state, 'compareRegister');
  state = pick(state, 'checkServiceDoor');
  state = pick(state, 'inspectCellarScuffs');
  return pick(state, 'openAfterClues');
}

function toCellarWithoutName(state: SaveData): SaveData {
  state = pick(state, 'askGuests');
  state = pick(state, 'followYardAccount');
  state = pick(state, 'followMudMarks');
  state = pick(state, 'goToServiceHall');
  state = pick(state, 'inspectCellarScuffs');
  return pick(state, 'openAfterClues');
}

describe('The Last Room on the Left', () => {
  it('supports a fresh-character resolution by bringing the innkeeper and guests together', () => {
    let state = pick(fresh(), 'askInnkeeper');
    state = pick(state, 'askServicePassage');
    state = pick(state, 'askInnkeeperForTruth');
    state = pick(state, 'helpWithInnkeeper');
    expect(state.run?.sceneId).toBe('cellarEntry');
    state = pick(state, 'liftWithInnkeeper');
    state = pick(state, 'guideTheLift');
    expect(state.run?.sceneId).toBe('silasFree');
    state = pick(state, 'acceptFoldingTool');
    expect(state.run?.sceneId).toBe('quietEnding');
    expect(state.run?.status).toBe('success');
    expect(state.run?.inventory).toContain('foldingPryTool');
    expect(state.character?.historyFlags).toContain('uncovered_inn_truth');
  });

  it('supports a distinct authority-led rescue without requiring money or carry-over gear', () => {
    let state = pick(fresh(), 'askInnkeeper');
    state = pick(state, 'askAboutRoom');
    state = pick(state, 'knockGently');
    state = pick(state, 'followTapping');
    state = pick(state, 'askInnkeeperForTruth');
    state = pick(state, 'callAuthorities');
    expect(state.run?.sceneId).toBe('authoritiesCalled');
    state = pick(state, 'assistAuthorities');
    expect(state.run?.sceneId).toBe('silasFree');
    expect(state.run?.status).toBe('active');
  });

  it('introduces the mystery without revealing the missing traveler’s name before discovery', () => {
    const state = fresh();
    expect(THE_LAST_ROOM.scenes.arrival.text).toMatch(/Nell, the inn’s maid/);
    expect(THE_LAST_ROOM.scenes.arrival.text).toMatch(/chair and narrow table shoved against the door from the hallway side/);
    expect(THE_LAST_ROOM.scenes.arrival.text).toMatch(/storm has made the road dangerous to search/);
    expect(THE_LAST_ROOM.scenes.arrival.text).not.toMatch(/Silas|Vale/);
    expect(state.run?.visitedSceneIds).toEqual(['arrival']);
    const cellar = toCellar(fresh());
    expect(THE_LAST_ROOM.scenes.cellarEntry.text).not.toMatch(/Silas Vale/);
    expect(pick(cellar, 'askHisName').run?.sceneId).toBe('cellarIdentity');
    expect(THE_LAST_ROOM.scenes.cellarIdentity.text).toContain('Silas Vale');
  });

  it('keeps name-aware narration gated to routes that identify Silas', () => {
    const unknown = toCellarWithoutName(fresh());
    const known = pick(fresh(), 'askInnkeeper');
    expect(unknown.run?.flags).not.toContain('identifiedSilas');
    expect(known.run?.flags).toContain('identifiedSilas');
    expect(THE_LAST_ROOM.scenes.cellarEntry.textVariants?.some((variant) => variant.text.includes('Silas Vale') && variant.requirements?.flags?.includes('identifiedSilas'))).toBe(true);
  });

  it('makes the cellar route, rescue anchor, and hidden room space physically explicit', () => {
    const start = fresh();
    let state = pick(start, 'inspectRoom');
    state = pick(state, 'inspectBarricade');
    expect(state.run?.sceneId).toBe('latchClue');
    expect(THE_LAST_ROOM.scenes.latchClue.text).toMatch(/furniture was pushed from your side/);
    expect(THE_LAST_ROOM.scenes.latchClue.choices.find((choice) => choice.id === 'useMirrorAtDoor')?.next).toBe('mirrorRoomClue');
    const mirrorState = { ...state, run: { ...state.run!, inventory: [...state.run!.inventory, 'foldingCardMirror'] } };
    const checked = pick(mirrorState, 'useMirrorAtDoor');
    expect(checked.run?.sceneId).toBe('mirrorRoomClue');
    expect(THE_LAST_ROOM.scenes.mirrorRoomClue.text).toMatch(/It cannot show the far side of the room/);
    const cellar = toCellar(fresh(0, 'travelRope'));
    expect(THE_LAST_ROOM.scenes.cellarEntry.text).toMatch(/support post stands beside the shelf/);
    expect(THE_LAST_ROOM.scenes.cellarEntry.choices.find((choice) => choice.id === 'rigRopeForSilas')?.label).toMatch(/cellar post/);
    expect(cellar.run?.sceneId).toBe('cellarEntry');
  });

  it('migrates legacy active saves to explicit name and cellar knowledge without resetting the run', () => {
    const legacy = fresh();
    legacy.run!.sceneId = 'cellarEntry';
    legacy.run!.visitedSceneIds = ['arrival', 'hostAccount', 'serviceHall', 'cellarEntry'];
    legacy.run!.flags = [];
    delete legacy.run!.scenarioSaveVersion;
    const storage = {
      getItem: (key: string) => key === SAVE_KEY ? JSON.stringify(legacy) : null,
    };
    const loaded = loadSave(storage as Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>>);
    expect(loaded.run?.sceneId).toBe('cellarEntry');
    expect(loaded.run?.flags).toContain('identifiedSilas');
    expect(loaded.run?.flags).toContain('knowsCellar');
    expect(loaded.run?.visitedSceneIds).toEqual(legacy.run!.visitedSceneIds);
  });

  it('does not infer Silas’s identity when a current-version player has not discovered it', () => {
    const current = toCellarWithoutName(fresh());
    const storage = { getItem: (key: string) => key === SAVE_KEY ? JSON.stringify(current) : null };
    const loaded = loadSave(storage as Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>>);
    expect(loaded.run?.scenarioSaveVersion).toBe(THE_LAST_ROOM.saveVersion);
    expect(loaded.run?.flags).not.toContain('identifiedSilas');
    expect(loaded.run?.sceneId).toBe('cellarEntry');
  });

  it('does not offer an accusation before the player has evidence about the blocked room', () => {
    const corridor = pick(pick(fresh(), 'inspectRoom'), 'inspectBarricade');
    expect(THE_LAST_ROOM.scenes.corridor.choices.some((choice) => /accuse/i.test(choice.label))).toBe(false);
    expect(THE_LAST_ROOM.scenes.latchClue.choices.some((choice) => /accuse/i.test(choice.label))).toBe(false);
    expect(THE_LAST_ROOM.scenes.guestAccused.text).toContain('without evidence');
    expect(corridor.run?.sceneId).toBe('latchClue');
  });

  it('treats walking away as a valid ending without moral judgment or reward', () => {
    const state = pick(fresh(), 'leaveInn');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('walkAwayAtArrival');
    expect(state.run?.completionQualification).toBe('nonSubstantive');
    expect(state.run?.acquiredThisRun).toEqual([]);
    expect(state.character?.historyFlags).toContain('walked_away_from_inn_problem');
    expect(THE_LAST_ROOM.scenes.walkAwayEnding.text).not.toMatch(/coward|selfish|shame/i);
  });

  it('lets careful investigation uncover contradictions and the cellar truth', () => {
    let state = pick(fresh(), 'askGuests');
    state = pick(state, 'compareRegister');
    state = pick(state, 'checkServiceDoor');
    expect(state.character?.knowledge).toContain('The register names Silas Vale and notes that his travel case was stored below.');
    state = pick(state, 'inspectCellarScuffs');
    state = pick(state, 'openAfterClues');
    expect(state.run?.sceneId).toBe('cellarEntry');
    expect(THE_LAST_ROOM.scenes.cellarEntry.text).toMatch(/injured man\. He is conscious/);
  });

  it('supports forceful entry but records it and does not resolve the mystery', () => {
    let state = pick(fresh(), 'askInnkeeper');
    state = pick(state, 'askAboutRoom');
    state = pick(state, 'forceDoor', () => 0);
    expect(state.run?.sceneId).toBe('roomEntered');
    expect(state.run?.flags).toContain('forcedEntry');
    expect(state.character?.historyFlags).toContain('forced_entry_without_proof');
    expect(THE_LAST_ROOM.scenes.roomEntered.text).not.toMatch(/Vale is in the cellar|Silas is in the cellar/);
    state = pick(state, 'goCheckBelow');
    expect(state.run?.sceneId).toBe('serviceHall');
  });

  it('lets a carried toolkit quietly bypass the barricade without revealing the truth', () => {
    let state = pick(fresh(0, 'pocketToolkit'), 'askInnkeeper');
    state = pick(state, 'askAboutRoom');
    state = pick(state, 'inspectBarricade');
    expect(THE_LAST_ROOM.scenes.latchClue.choices.filter((choice) => meets(choice.requirements, state)).map((choice) => choice.id)).toContain('quietToolEntry');
    state = pick(state, 'quietToolEntry');
    expect(state.run?.sceneId).toBe('roomEntered');
    expect(state.run?.flags).toContain('quietEntry');
    expect(state.run?.inventory).toContain('pocketToolkit');
    expect(THE_LAST_ROOM.scenes.roomEntered.text).not.toMatch(/Vale is in the cellar|Silas is in the cellar/);
    expect(THE_LAST_ROOM.scenes.roomEntered.choices.map((choice) => choice.id)).toContain('goCheckBelow');
  });

  it('lets carried rope improve a rescue route without being required', () => {
    let state = toCellar(fresh(0, 'travelRope'));
    const ropeAction = THE_LAST_ROOM.scenes.cellarEntry.choices.find((choice) => choice.id === 'rigRopeForSilas')!;
    expect(meets(ropeAction.requirements, state)).toBe(true);
    expect(ropeAction.chance?.probability).toBe(0.68);
    expect(ropeAction.chance?.bonusProbability).toBe(0.12);
    state = pick(state, 'rigRopeForSilas', () => 0);
    expect(state.run?.sceneId).toBe('silasFree');
    expect(state.run?.flags).toContain('ropeRescue');
    expect(state.run?.inventory).toContain('travelRope');
    expect(meets(ropeAction.requirements, toCellar(fresh()))).toBe(false);
    const freshCellar = toCellar(fresh());
    expect(THE_LAST_ROOM.scenes.cellarEntry.choices.filter((choice) => meets(choice.requirements, freshCellar)).length).toBeGreaterThan(0);
  });

  it('uses money for an optional rope without making it necessary', () => {
    const before = fresh(3);
    const state = pick(before, 'askInnkeeper');
    const bought = pick(state, 'buyRope');
    expect(bought.character?.money).toBe(1);
    expect(bought.run?.inventory).toContain('travelRope');
    expect(meets(undefined, fresh(0))).toBe(true);
    expect(THE_LAST_ROOM.scenes.hostAccount.choices.find((choice) => choice.id === 'buyRope')?.requirements?.minMoney).toBe(2);
  });

  it('provides a subtle history callback while keeping fresh characters fully playable', () => {
    const freshState = pick(fresh(), 'askInnkeeper');
    const returning = fresh();
    returning.character!.historyFlags = ['returned_for_help'];
    const returningState = pick(returning, 'askInnkeeper');
    expect(freshState.run?.sceneId).toBe(returningState.run?.sceneId);
    expect(THE_LAST_ROOM.scenes.hostAccount.textVariants?.[0].text).toContain('returning for help in an earlier emergency');
    const continued = startAdventure({ ...returningState, run: null }, SCENARIOS[0]);
    expect(continued.character?.historyFlags).toContain('returned_for_help');
  });

  it('persists meaningful history and removes run-only access keys after successful completion', () => {
    let state = pick(fresh(), 'askGuests');
    state = pick(state, 'visitRoom');
    state = pick(state, 'askNell');
    state = pick(state, 'believeNell');
    expect(state.character?.historyFlags).toContain('trusted_testimony_over_evidence');
    expect(state.character?.historyFlags).toContain('intervened_in_inn_dispute');
    state = pick(state, 'inspectCellarScuffs');
    state = pick(state, 'openAfterClues');
    state = pick(state, 'getHelpForSilas');
    state = pick(state, 'guideTheLift');
    state = pick(state, 'acceptBrassKey');
    const completed = finishSuccess(state, 'brassRoomKey');
    expect(completed.character?.historyFlags).toContain('intervened_in_inn_dispute');
    expect(completed.character?.carriedItem).toBe('brassRoomKey');
    expect(completed.character?.adventuresCompleted).toBe(1);
    expect(ITEMS.innCellarKey.carryable).toBe(false);
    expect(ITEMS.foldingPryTool.carryable).toBe(true);
    expect(ITEMS.brassRoomKey.carryable).toBe(true);
  });

  it('only grants named rewards through explicit visible choices and prevents duplicates', () => {
    const state = fresh();
    const rewardChoices = THE_LAST_ROOM.scenes.silasFree.choices;
    expect(rewardChoices.map((choice) => choice.label)).toEqual(expect.arrayContaining([
      'Accept the innkeeper’s folding pry tool', 'Keep the old brass room key as a memento', 'Decline a reward and leave',
    ]));
    expect(rewardChoices.find((choice) => choice.id === 'acceptFoldingTool')?.effects?.gainItems).toEqual(['foldingPryTool']);
    const ownsBoth = { ...state, run: { ...state.run!, sceneId: 'silasFree', inventory: [...state.run!.inventory, 'foldingPryTool', 'brassRoomKey'] } };
    const available = rewardChoices.filter((choice) => meets(choice.requirements, ownsBoth));
    expect(available.map((choice) => choice.id)).toEqual(['declineInnReward']);
    expect(THE_LAST_ROOM.scenes.latchClue.choices.find((choice) => choice.id === 'hookKey')?.effects?.gainItems).toEqual(['innCellarKey']);
  });

  it('keeps history flags and registered scenario IDs compatible with random and QA launch', () => {
    expect(SCENARIOS).toContain(THE_LAST_ROOM);
    const randomPick = selectScenario(SCENARIOS, null, () => 0.999);
    expect(SCENARIOS).toContain(randomPick);
    expect(selectScenario(SCENARIOS, THE_LAST_ROOM.id, () => 0.999)).not.toBe(THE_LAST_ROOM);
    const launched = startAdventure({ version: 1, bank: [], character: null, run: null }, THE_LAST_ROOM);
    expect(launched.run?.scenarioId).toBe(THE_LAST_ROOM.id);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start The Last Room on the Left');
    expect(renderQaPanel(false, launched, SCENARIOS, ITEMS)).toBe('');
  });

  it('supports a foreshadowed dangerous route where accumulated injury can kill', () => {
    let state = toCellar(fresh(0, 'pocketToolkit'));
    state = pick(state, 'pryShelf', () => 0.999);
    expect(state.run?.sceneId).toBe('cellarSlip');
    expect(state.run?.health).toBe(8);
    state = pick(state, 'retryWithTool', () => 0.999);
    expect(state.run?.sceneId).toBe('cellarSlipAgain');
    expect(state.run?.health).toBe(5);
    state = pick(state, 'tryLastLift', () => 0.999);
    expect(state.run?.status).toBe('death');
  });

  it('validates every reachable scene, choice outcome, and serialized visit as forward-only and actionable', () => {
    expect(findScenarioGraphProblems(THE_LAST_ROOM)).toEqual([]);
    const character = newCharacter('Graph Walker');
    const queue: SaveData[] = [{ version: 1, bank: [], character, run: startRun(character, THE_LAST_ROOM) }];
    const seen = new Set<string>();
    const deadEnds: string[] = [];
    while (queue.length) {
      const state = queue.shift()!;
      const run = state.run!;
      const key = JSON.stringify({ scene: run.sceneId, inventory: [...run.inventory].sort(), flags: [...run.flags].sort(), history: [...(state.character?.historyFlags ?? [])].sort(), knowledge: [...(state.character?.knowledge ?? [])].sort(), money: state.character?.money, health: run.health });
      if (seen.has(key)) continue;
      seen.add(key);
      if (run.status !== 'active') continue;
      const scene = THE_LAST_ROOM.scenes[run.sceneId];
      expect(scene, `Missing scene ${run.sceneId}`).toBeDefined();
      if (scene.ending) continue;
      const actions = scene.choices.filter((choice) => meets(choice.requirements, state));
      if (!actions.length) deadEnds.push(run.sceneId);
      expect(actions.length).toBeLessThanOrEqual(4);
      for (const action of actions) {
        const outcomes = [choose(state, THE_LAST_ROOM, action, () => 0)];
        if (action.chance || action.effects?.combat) outcomes.push(choose(state, THE_LAST_ROOM, action, () => 0.999999));
        for (const outcome of outcomes) {
          if (outcome.run) {
            const visits = outcome.run.visitedSceneIds ?? [];
            expect(new Set(visits).size).toBe(visits.length);
            expect(visits).toContain(outcome.run.sceneId);
            const resumed = JSON.parse(JSON.stringify(outcome)) as SaveData;
            expect(resumed.run?.visitedSceneIds).toEqual(visits);
          }
          queue.push(outcome);
        }
      }
    }
    expect(deadEnds).toEqual([]);
    expect(seen.size).toBeGreaterThan(35);
  });
});
