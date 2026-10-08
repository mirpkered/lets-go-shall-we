import { describe, expect, it } from 'vitest';
import { choose, failCharacter, finishRewardResolution, meets, newCharacter, newRewardItems, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { AWW_RATS } from './awwRats';

function fresh(money = 0, carriedItem: string | null = null): SaveData {
  const character = newCharacter('Farmhand for a Day');
  character.money = money;
  character.carriedItem = carriedItem;
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, AWW_RATS) };
}

function act(state: SaveData, id: string, random = 0): SaveData {
  const scene = AWW_RATS.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `Choice ${id} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${id} should be available in ${scene.id}`).toBe(true);
  return choose(state, AWW_RATS, choice!, () => random);
}

function reachGrainDecision(state = fresh()): SaveData {
  state = act(state, 'inspectGrain');
  state = act(state, 'noteDust');
  return act(state, 'skipSupplies');
}

describe('Aww, Rats!!', () => {
  it('describes tools as offers until selected, then matches the accepted reward to final placement', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state = act(state, 'simpleTrap');
    state = act(state, 'checkTraps');
    expect(state.run?.sceneId).toBe('rewardClean');
    expect(sceneText(AWW_RATS.scenes.rewardClean, state)).toMatch(/choose one to accept/i);
    expect(sceneText(AWW_RATS.scenes.rewardClean, state)).not.toMatch(/either is yours to keep/i);
    expect(state.run?.acquiredThisRun).not.toContain('ratCatchersHook');

    state = act(state, 'takeHook');
    expect(state.run?.acquiredThisRun).toContain('ratCatchersHook');
    state = openRewardResolution(state);
    expect(newRewardItems(state)).toContain('ratCatchersHook');
    state = placeReward(state, 'ratCatchersHook', 'carry');
    expect(state.character?.carriedItems).toContain('ratCatchersHook');
    expect(state.run?.rewardPendingItems).toEqual([]);
    state = finishRewardResolution(state);
    expect(state.character?.carriedItems).toContain('ratCatchersHook');
  });

  it('lets a broke fresh character clear the nest with ordinary farm materials', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state = act(state, 'simpleTrap');
    state = act(state, 'checkTraps');
    state = act(state, 'takeHook');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('cleanEnding');
    expect(state.run?.inventory).toContain('ratCatchersHook');
  });

  it('supports a distinct sealing route and a containment ending', () => {
    let state = reachGrainDecision();
    state = act(state, 'isolateGrain');
    state = act(state, 'sealRoutes');
    state = act(state, 'braceBoards');
    state = act(state, 'finishSealing');
    state = act(state, 'takeGloves');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('containmentEnding');
    expect(state.run?.inventory).toContain('heavyLeatherGloves');
  });

  it('supports controlled smoke using ordinary farm-owned equipment as a third distinct route', () => {
    let state = act(fresh(), 'askAdvance');
    state = act(state, 'headToStore');
    state = act(state, 'buyBellows');
    state = act(state, 'salvageGrain', 0);
    state = act(state, 'smokeNest');
    state = act(state, 'bellowsSmoke');
    state = act(state, 'finishSmoke');
    state = act(state, 'takeGloves');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('costlyEnding');
    expect(state.character?.money).toBe(4);
  });

  it('makes grain preservation a genuine risk with understandable costs', () => {
    const start = act(fresh(), 'askAdvance');
    const paid = act(start, 'headToStore');
    const withSupplies = act(paid, 'skipSupplies');
    const saved = act(withSupplies, 'salvageGrain', 0);
    const lost = act(withSupplies, 'salvageGrain', 0.99);
    expect(saved.run?.flags).toContain('grainSaved');
    expect(saved.run?.sceneId).toBe('grainSalvaged');
    expect(lost.run?.flags).toContain('grainDestroyed');
    expect(lost.run?.flags).toContain('salvageFailed');
    expect(lost.run?.sceneId).toBe('grainSpoiled');
    expect(lost.character?.money).toBe(2);
  });

  it('lends ordinary farm supplies without charge while preserving legitimate money paths', () => {
    let state = act(fresh(), 'askAdvance');
    state = act(state, 'headToStore');
    expect(state.character?.money).toBe(4);
    state = act(state, 'buyTraps');
    expect(state.character?.money).toBe(4);
    expect(state.run?.inventory).toContain('ratBait');
    expect(state.run?.inventory).toContain('wireTraps');
    expect(state.run?.acquiredThisRun).toContain('wireTraps');
    const supplies = AWW_RATS.scenes.supplyShed.choices.find((choice) => choice.id === 'buyTraps')!;
    expect(supplies.label).toMatch(/take|borrow/i);
    expect(supplies.effects?.money ?? 0).toBe(0);
    expect(supplies.requirements?.minMoney).toBeUndefined();
    expect(AWW_RATS.scenes.supplyShed.text).not.toMatch(/farmer lays out|three choices|your choices/i);
    expect(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'destroyGrain')?.label).toBe('Discard the fouled grain');
    expect(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'destroyGrain')?.hint).toMatch(/grain dust/i);
    expect(AWW_RATS.scenes.grainDecision.text).not.toMatch(/lays out (the )?(three )?choices/i);
    expect(AWW_RATS.scenes.grainDecision.textVariants?.some((entry) => /leaves you to decide/i.test(entry.text))).toBe(true);
    expect(AWW_RATS.scenes.grainDecision.choices.find((choice) => choice.id === 'destroyGrain')?.effects?.money).toBe(-2);
  });

  it('makes carried toolkit useful without making it necessary', () => {
    let state = fresh(0, 'pocketToolkit');
    state = reachGrainDecision(state);
    state = act(state, 'isolateGrain');
    state = act(state, 'sealRoutes');
    expect(AWW_RATS.scenes.sealPlan.choices.filter((choice) => meets(choice.requirements, state)).map((choice) => choice.id)).toContain('toolSeal');
    state = act(state, 'toolSeal');
    expect(state.run?.sceneId).toBe('routesSealed');
  });

  it('lets a carried inspection mirror reveal a safe outer run and improve a later fresh route', () => {
    let bare = act(fresh(), 'followTracks');
    expect(AWW_RATS.scenes.tracksClue.choices.filter((choice) => meets(choice.requirements, bare)).map((choice) => choice.id)).not.toContain('inspectOuterRun');
    expect(AWW_RATS.scenes.trapPlan.text).not.toContain('The mirror showed you');

    let mirrored = act(fresh(0, 'foldingCardMirror'), 'followTracks');
    mirrored = act(mirrored, 'inspectOuterRun');
    expect(mirrored.run?.elapsedMinutes).toBe(11);
    expect(mirrored.run?.inventory).toContain('foldingCardMirror');
    expect(mirrored.run?.flags).toContain('outerRunViewed');
    expect(mirrored.character?.knowledge).toContain('The folding mirror shows an outer rat run beneath the loose sill; the hollow boards should not be crossed.');
    expect(sceneText(AWW_RATS.scenes.trapPlan, { ...mirrored, run: { ...mirrored.run!, sceneId: 'trapPlan' } })).toContain('The mirror showed you a narrow outer run');
    const values = new Map<string, string>();
    const storage = { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null };
    saveGame(mirrored, storage);
    mirrored = loadSave(storage);
    expect(mirrored.run?.sceneId).toBe('supplyShed');
    expect(mirrored.run?.visitedSceneIds).toContain('tracksClue');
    expect(mirrored.run?.flags).toContain('outerRunViewed');
    expect(mirrored.run?.inventory).toContain('foldingCardMirror');

    bare = act(bare, 'markCreekRoute');
    bare = act(bare, 'skipSupplies');
    bare = act(bare, 'destroyGrain');
    bare = act(bare, 'tryTraps');
    const bareAttempt = act(bare, 'simpleTrap', 0.65);
    expect(bareAttempt.run?.sceneId).toBe('trapBurst');

    mirrored = act(mirrored, 'skipSupplies');
    mirrored = act(mirrored, 'destroyGrain');
    mirrored = act(mirrored, 'tryTraps');
    const improvedAttempt = act(mirrored, 'simpleTrap', 0.65);
    expect(improvedAttempt.run?.sceneId).toBe('trapsWorking');
  });

  it('makes the smoke hood a quicker, safer option without hiding the fresh-character smoke route', () => {
    let bare = reachGrainDecision();
    bare = act(bare, 'destroyGrain');
    bare = act(bare, 'smokeNest');
    const bareChoices = AWW_RATS.scenes.smokePlan.choices.filter((choice) => meets(choice.requirements, bare)).map((choice) => choice.id);
    expect(bareChoices).toContain('dampSmoke');
    expect(bareChoices).not.toContain('hoodedDampSmoke');

    let hooded = reachGrainDecision(fresh(0, 'smokeHood'));
    hooded = act(hooded, 'destroyGrain');
    hooded = act(hooded, 'smokeNest');
    const hoodedChoices = AWW_RATS.scenes.smokePlan.choices.filter((choice) => meets(choice.requirements, hooded)).map((choice) => choice.id);
    expect(hoodedChoices).toContain('hoodedDampSmoke');
    expect(hoodedChoices).not.toContain('dampSmoke');
    expect(hoodedChoices.length).toBeLessThanOrEqual(4);
    const smoke = act(hooded, 'hoodedDampSmoke', 0.7);
    expect(smoke.run?.elapsedMinutes).toBe(27);
    expect(smoke.run?.sceneId).toBe('smokeClears');
    expect(smoke.run?.inventory).toContain('smokeHood');

    const failure = act(hooded, 'hoodedDampSmoke', 0.99);
    expect(failure.run?.sceneId).toBe('smokeDrifts');
    expect(failure.run?.health).toBe(9);
  });

  it('advances after a failed dangerous check and communicates the threat first', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state = act(state, 'simpleTrap', 0.99);
    expect(state.run?.sceneId).toBe('trapBurst');
    expect(state.run?.health).toBe(8);
    expect(AWW_RATS.scenes.trapBurst.text).toContain('visibly giving way');
    state = act(state, 'retreatSwarm');
    expect(state.run?.sceneId).toBe('survivalEnding');
    expect(state.run?.status).toBe('success');
  });

  it('offers no duplicate carry reward and describes how each new item is obtained', () => {
    const state = fresh(0, 'ratCatchersHook');
    state.run!.sceneId = 'rewardClean';
    const available = AWW_RATS.scenes.rewardClean.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.map((choice) => choice.id)).not.toContain('takeHook');
    expect(available.map((choice) => choice.id)).toContain('takeGloves');
    expect(AWW_RATS.scenes.rewardClean.text).toContain('offers one useful tool in thanks');
    expect(AWW_RATS.scenes.rewardClean.choices.find((choice) => choice.id === 'takeHook')?.effects?.gainItems).toContain('ratCatchersHook');
    expect(AWW_RATS.scenes.rewardClean.choices.find((choice) => choice.id === 'takeGloves')?.effects?.gainItems).toContain('heavyLeatherGloves');
  });

  it('applies standard death cleanup while leaving the bank intact', () => {
    let state = reachGrainDecision();
    state = act(state, 'destroyGrain');
    state = act(state, 'tryTraps');
    state.run!.health = 3;
    state = act(state, 'simpleTrap', 0.99);
    state.run!.health = 4;
    state = act(state, 'reachGate', 0.99);
    expect(state.run?.status).toBe('death');
    expect(state.run?.sceneId).toBe('__death');
    const failed = failCharacter(state);
    expect(failed.character).toBeNull();
    expect(failed.run).toBeNull();
    expect(failed.bank).toEqual(['graveCoin']);
  });
});
