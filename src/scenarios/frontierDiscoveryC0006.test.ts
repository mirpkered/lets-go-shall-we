import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData } from '../types';
import { FRONTIER_DISCOVERY_ADVENTURES } from './frontierDiscoveryBatch';

const byId = (id: string) => FRONTIER_DISCOVERY_ADVENTURES.find((scenario) => scenario.id === id)!;

function start(id: string): SaveData {
  const scenario = byId(id);
  const character = newCharacter(`C0006 ${id}`);
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, choiceId: string, roll = 0): SaveData {
  const scenario = byId(state.run!.scenarioId);
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scene.id}.${choiceId}`).toBeTruthy();
  return choose(state, scenario, choice!, () => roll);
}

function claimDecision(id: string): SaveData {
  return act(act(start(id), 'approach'), 'readEvidence');
}

describe('CRA-C0006 Frontier Discovery route-truth repairs', () => {
  it.each([
    ['the-hidden-tailings-pile', /no claimant was present or contacted/i],
    ['the-claim-with-no-name', /no claimant was identified or contacted/i],
    ['the-timber-claim', /no claimant was present or contacted/i],
    ['the-second-claim-marker', /no claimant was present or contacted/i],
  ])('%s keeps evidence local when no counterparty is established', (id, expected) => {
    const scenario = byId(id);
    const decision = claimDecision(id);
    const recordChoice = scenario.scenes[decision.run!.sceneId].choices.find(({ id: choiceId }) => choiceId === 'shareRecord')!;
    expect(recordChoice.label).toMatch(/for yourself/i);
    const privateRecord = act(decision, 'shareRecord');
    expect(scenario.scenes[privateRecord.run!.sceneId].text).toMatch(expected);
    expect(privateRecord.character?.historyFlags).not.toContain(`shared evidence about ${scenario.title.toLowerCase()}`);

    const keptPrivate = act(decision, 'keepRecord');
    expect(scenario.scenes[keptPrivate.run!.sceneId].text).not.toMatch(/another side received|both sides/i);
  });

  it('keeps the Broken Gate account private and separately resolves the cabin-help investigation', () => {
    const scenario = byId('the-broken-gate');
    const decision = claimDecision(scenario.id);
    const recorded = act(decision, 'shareRecord');
    expect(scenario.scenes[recorded.run!.sceneId].text).toMatch(/no claimant was present or contacted/i);
    expect(recorded.character?.historyFlags).not.toContain(`shared evidence about ${scenario.title.toLowerCase()}`);

    const checked = act(act(start(scenario.id), 'approach'), 'followEvidence');
    expect(checked.run?.sceneId).toBe(`${scenario.id}CabinCheck`);
    expect(scenario.scenes[checked.run!.sceneId].text).toMatch(/call from outside.*no one answers or appears/i);
    expect(scenario.scenes[checked.run!.sceneId].text).toMatch(/does not establish that the cabin is empty/i);
    expect(scenario.scenes[checked.run!.sceneId].choices.map(({ id }) => id)).toEqual(['returnToFork', 'leaveFromCabin']);
    const returned = act(checked, 'returnToFork');
    expect(returned.run?.sceneId).toBe(`${scenario.id}CounterAccount`);
    const contrast = act(start(scenario.id), 'turnAway');
    expect(contrast.run?.sceneId).toBe(`${scenario.id}Left`);
    expect(scenario.scenes[contrast.run!.sceneId].text).not.toMatch(/checked the cabin/i);
  });

  it('reports only what the claim-watch employer actually receives', () => {
    const scenario = byId('the-claim-that-pays-too-well');
    const decision = claimDecision(scenario.id);
    const toldEmployer = act(decision, 'shareRecord');
    expect(scenario.scenes[decision.run!.sceneId].choices.find(({ id }) => id === 'shareRecord')!.label).toMatch(/tell the prospector/i);
    expect(scenario.scenes[toldEmployer.run!.sceneId].text).toMatch(/you tell the prospector/i);
    expect(scenario.scenes[toldEmployer.run!.sceneId].text).toMatch(/unseen occupant receives no report/i);
    expect(toldEmployer.character?.historyFlags).toContain('told the prospector what was observed at the claim and locked shed');
  });

  it('limits Claim Jumpers at Sundown sharing to the two present visitors, not the absent employer', () => {
    const scenario = byId('claim-jumpers-at-sundown');
    const decision = claimDecision(scenario.id);
    const shared = act(decision, 'shareRecord');
    expect(scenario.scenes[decision.run!.sceneId].choices.find(({ id }) => id === 'shareRecord')!.label).toMatch(/two visitors/i);
    expect(scenario.scenes[shared.run!.sceneId].text).toMatch(/give the two visitors your account/i);
    expect(scenario.scenes[shared.run!.sceneId].text).toMatch(/employer has not been contacted/i);
    expect(shared.character?.historyFlags).toContain('gave the two visitors an account of the claim papers at sundown');
  });

  it('limits Claim Jumper’s Story sharing to the present worker, not the absent owner', () => {
    const scenario = byId('the-claim-jumpers-story');
    const decision = claimDecision(scenario.id);
    const shared = act(decision, 'shareRecord');
    expect(scenario.scenes[decision.run!.sceneId].choices.find(({ id }) => id === 'shareRecord')!.label).toMatch(/give the worker/i);
    expect(scenario.scenes[shared.run!.sceneId].text).toMatch(/absent owner has not received it/i);
    expect(shared.character?.historyFlags).toContain('gave the present worker an account of the claim map and owner letter');
  });

  it('makes the Camp Below the Slide inspect-only at the stable edge and resolves the risky chest reach', () => {
    const scenario = byId('camp-below-the-slide');
    let edge = act(start(scenario.id), 'approach');
    expect(scenario.scenes[edge.run!.sceneId].choices.find(({ id }) => id === 'testGround')!.label).toMatch(/inspect/i);
    edge = act(edge, 'testGround');
    expect(scenario.scenes[edge.run!.sceneId].text).toMatch(/inspect the loose tool.*without taking it/i);
    edge = act(edge, 'advanceFromStable');
    const cautious = act(edge, 'closeCarefully');
    expect(scenario.scenes[cautious.run!.sceneId].text).not.toMatch(/tool (?:is )?taken|chest recovered/i);

    const reached = act(act(start(scenario.id), 'approach'), 'pressOn', 0);
    expect(reached.run?.sceneId).toBe(`${scenario.id}ReachResult`);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/reach the chest.*remains pinned/i);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/without freeing or carrying it/i);
    const failed = act(act(start(scenario.id), 'approach'), 'pressOn', 0.999999);
    expect(scenario.scenes[failed.run!.sceneId].ending).toBe('death');
  });

  it('makes the Washed-Out Claim shovel option an inspection and states that it remains in place', () => {
    const scenario = byId('the-washed-out-claim');
    let state = act(start(scenario.id), 'approach');
    expect(scenario.scenes[state.run!.sceneId].choices.find(({ id }) => id === 'testGround')!.label).toMatch(/inspect/i);
    state = act(state, 'testGround');
    expect(scenario.scenes[state.run!.sceneId].text).toMatch(/inspect the shovel.*not recover or carry it/i);
    state = act(state, 'retreatFromStable');
    expect(scenario.scenes[state.run!.sceneId].text).not.toMatch(/shovel was taken/i);
    const contrast = act(act(start(scenario.id), 'approach'), 'withdrawEarly');
    expect(scenario.scenes[contrast.run!.sceneId].ending).toBe('success');
  });

  it('resolves both Old Dredge investigations without claiming unread records', () => {
    const scenario = byId('the-old-dredge');
    let bank = act(start(scenario.id), 'approach');
    expect(scenario.scenes[bank.run!.sceneId].choices.find(({ id }) => id === 'testGround')!.label).toMatch(/try to read/i);
    bank = act(bank, 'testGround');
    expect(scenario.scenes[bank.run!.sceneId].text).toMatch(/markings are too worn to read/i);
    expect(scenario.scenes[bank.run!.sceneId].text).toMatch(/no ledger contents or owner are established/i);

    const reached = act(act(start(scenario.id), 'approach'), 'pressOn', 0);
    expect(reached.run?.sceneId).toBe(`${scenario.id}LedgerBoxReached`);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/reach the bolted ledger box/i);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/does not open, so its contents remain unknown/i);
    const failed = act(act(start(scenario.id), 'approach'), 'pressOn', 0.999999);
    expect(scenario.scenes[failed.run!.sceneId].ending).toBe('death');
  });

  it('resolves a successful strongbox pry while preserving the sealed and withdrawal contrasts', () => {
    const scenario = byId('locked-strongbox-in-the-ruins');
    const decision = act(act(start(scenario.id), 'approach'), 'followEvidence');
    const opened = act(decision, 'takeRisk', 0);
    expect(opened.run?.sceneId).toBe(`${scenario.id}Bold`);
    expect(scenario.scenes[opened.run!.sceneId].text).toMatch(/pry opens the strongbox/i);
    expect(scenario.scenes[opened.run!.sceneId].text).toMatch(/contents are not identified/i);
    const sealed = act(decision, 'takeCareful');
    expect(scenario.scenes[sealed.run!.sceneId].text).toMatch(/strongbox stays sealed/i);
    const withdrawal = act(act(start(scenario.id), 'approach'), 'leaveEvidence');
    expect(scenario.scenes[withdrawal.run!.sceneId].text).toMatch(/turn back/i);
  });

  it('records the chosen Camp marker but leaves the waiting route distinct', () => {
    const scenario = byId('camp-with-fresh-cut-wood');
    const decision = act(act(start(scenario.id), 'approach'), 'readEvidence');
    const marked = act(decision, 'closeCarefully');
    expect(marked.character?.historyFlags).toContain('left a visible note-like marker from the road at the prepared camp');
    expect(scenario.scenes[marked.run!.sceneId].text).toMatch(/leave a visible marker beside the prepared camp/i);
    const waited = act(decision, 'continueSearch');
    expect(scenario.scenes[waited.run!.sceneId].text).not.toMatch(/leave a visible marker/i);
    expect(waited.character?.historyFlags).not.toContain('left a visible note-like marker from the road at the prepared camp');
  });

  it('distinguishes the Forgotten Supply Cache marker and item-taking routes', () => {
    const scenario = byId('the-forgotten-supply-cache');
    const markedAtEntry = act(start(scenario.id), 'markAndLeave');
    expect(markedAtEntry.character?.historyFlags).toContain('marked the trail cache location before moving on');
    expect(scenario.scenes[markedAtEntry.run!.sceneId].text).toMatch(/mark the cache location/i);

    const decision = act(act(start(scenario.id), 'approach'), 'readEvidence');
    const marked = act(decision, 'markCacheForOwner');
    expect(scenario.scenes[marked.run!.sceneId].text).toMatch(/mark the waxed bundle/i);
    const choseItem = act(decision, 'takeOneFromCache');
    const rope = act(choseItem, 'takeTravelRope');
    expect(rope.run?.acquiredThisRun).toContain('travelRope');
    expect(scenario.scenes[rope.run!.sceneId].text).toMatch(/leave no marker on this route/i);
    expect(scenario.scenes[rope.run!.sceneId].text).not.toMatch(/you mark the cache/i);
    const blanket = act(choseItem, 'takeWoolBlanket');
    expect(blanket.run?.acquiredThisRun).toContain('woolTravelBlanket');
    expect(scenario.scenes[blanket.run!.sceneId].text).toMatch(/leave no marker on this route/i);
    const leftUntouched = act(decision, 'leaveCacheUntouched');
    expect(scenario.scenes[leftUntouched.run!.sceneId].text).not.toMatch(/cache is marked/i);
  });

  it('records the Old Hydraulic Cut marker separately from turning away and resolves a successful descent', () => {
    const scenario = byId('the-old-hydraulic-cut');
    const marked = act(start(scenario.id), 'markAndLeave');
    expect(marked.character?.historyFlags).toContain('marked the danger at the old hydraulic cut before leaving');
    expect(scenario.scenes[marked.run!.sceneId].text).toMatch(/mark the danger at the cut/i);
    const turnedAway = act(start(scenario.id), 'turnAway');
    expect(turnedAway.character?.historyFlags).not.toContain('marked the danger at the old hydraulic cut before leaving');

    const reached = act(act(start(scenario.id), 'approach'), 'pressOn', 0);
    expect(reached.run?.sceneId).toBe(`${scenario.id}FittingReached`);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/reach the iron fitting/i);
    expect(scenario.scenes[reached.run!.sceneId].text).toMatch(/learn no ore location or ownership/i);
    const failed = act(act(start(scenario.id), 'approach'), 'pressOn', 0.999999);
    expect(scenario.scenes[failed.run!.sceneId].ending).toBe('death');
  });
});
