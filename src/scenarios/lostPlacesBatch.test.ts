import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData, Scenario } from '../types';
import { LOST_PLACES_ADVENTURES, THE_ROOM_BEHIND_THE_CHIMNEY } from './lostPlacesBatch';
import { SCENARIOS } from './index';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';

const begin=():SaveData=>{
  const character=newCharacter('Chimney Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_ROOM_BEHIND_THE_CHIMNEY,()=>0)};
};
const act=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_ROOM_BEHIND_THE_CHIMNEY.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scene.id}.${choiceId} availability`).toBe(true);
  return choose(state,THE_ROOM_BEHIND_THE_CHIMNEY,choice!);
};

function get(id: string): Scenario {
  const scenario = LOST_PLACES_ADVENTURES.find((entry) => entry.id === id);
  if (!scenario) throw new Error(`Missing Lost Places scenario ${id}`);
  return scenario;
}

function start(scenario: Scenario): SaveData {
  const character = newCharacter('Lost Places Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function actIn(state: SaveData, scenario: Scenario, choiceId: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function text(state: SaveData, scenario: Scenario): string {
  return sceneText(scenario.scenes[state.run!.sceneId], state);
}

describe('Lost Places route-accurate endings', () => {
  it('keeps the Old Survey Stone calf unresolved on the boundary-only route', () => {
    const scenario = get('the-old-survey-stone');
    let state = start(scenario);
    state = actIn(state, scenario, 'askNeighbors');
    state = actIn(state, scenario, 'askSurveyCopy');
    state = actIn(state, scenario, 'surveyShare');
    expect(text(state, scenario)).not.toMatch(/calf is home/i);
    state = actIn(state, scenario, 'surveyEnd');
    expect(text(state, scenario)).not.toMatch(/calf is returned/i);

    state = start(scenario);
    state = actIn(state, scenario, 'followLane');
    state = actIn(state, scenario, 'laneCalf');
    state = actIn(state, scenario, 'calfReturn');
    expect(text(state, scenario)).toMatch(/calf is home/i);
  });

  it('does not turn the Sealed Mine Office exterior title into private wage findings', () => {
    const scenario = get('the-sealed-mine-office');
    let state = start(scenario);
    state = actIn(state, scenario, 'lookShutter');
    state = actIn(state, scenario, 'windowLeave');
    expect(text(state, scenario)).not.toMatch(/wage book|miners transferred|payments made late/i);

    state = start(scenario);
    state = actIn(state, scenario, 'askOwner');
    state = actIn(state, scenario, 'acceptKey');
    state = actIn(state, scenario, 'openDrawer');
    state = actIn(state, scenario, 'recordShare');
    expect(text(state, scenario)).toMatch(/wage book shows payments made late.*miners transferred/i);
  });

  it('reserves the quarry-use inference for routes that inspect the cave niche', () => {
    const scenario = get('the-cave-with-worked-stone');
    let state = start(scenario);
    state = actIn(state, scenario, 'inspectCut');
    state = actIn(state, scenario, 'cutReturn');
    expect(text(state, scenario)).not.toMatch(/drill|quarry crew/i);

    state = start(scenario);
    state = actIn(state, scenario, 'stepInside');
    state = actIn(state, scenario, 'chamberNiche');
    state = actIn(state, scenario, 'nicheRecord');
    expect(text(state, scenario)).toMatch(/broken hand drill.*quarry mark/i);
  });

  it('distinguishes the Lost Payroll office record, intact search, disturbed drain, and unreconciled search', () => {
    const scenario = get('the-lost-payroll');
    let state = start(scenario);
    state = actIn(state, scenario, 'followCreek');
    state = actIn(state, scenario, 'sidingStop');
    expect(text(state, scenario)).not.toMatch(/payroll was returned|account paid/i);

    state = start(scenario);
    state = actIn(state, scenario, 'askRailHand');
    state = actIn(state, scenario, 'ledgerOffice');
    state = actIn(state, scenario, 'officeShare');
    expect(text(state, scenario)).toMatch(/duplicate shows the chest was returned.*account paid/i);

    state = start(scenario);
    state = actIn(state, scenario, 'followCreek');
    state = actIn(state, scenario, 'sidingTrench');
    state = actIn(state, scenario, 'trenchSearch', 0);
    expect(text(state, scenario)).toMatch(/drainage channel remained intact/i);

    state = start(scenario);
    state = actIn(state, scenario, 'followCreek');
    state = actIn(state, scenario, 'sidingTrench');
    state = actIn(state, scenario, 'trenchSearch', 0.99);
    state = actIn(state, scenario, 'slipLeave');
    expect(text(state, scenario)).toMatch(/ballast slid into the drainage cut/i);
  });

  it('keeps Riverboat Cache custody and recovery claims tied to the actual disposition', () => {
    const scenario = get('the-riverboat-cache');
    let state = start(scenario);
    state = actIn(state, scenario, 'askFerryman');
    state = actIn(state, scenario, 'claimsOpen');
    expect(text(state, scenario)).toMatch(/without a line/i);
    state = actIn(state, scenario, 'openLocker');
    state = actIn(state, scenario, 'contentsKeep');
    expect(text(state, scenario)).toMatch(/leave the ledger and weights with the hull/i);
    state = actIn(state, scenario, 'riverFinish');
    expect(text(state, scenario)).not.toMatch(/returned ledger corrects/i);

    state = start(scenario);
    state = actIn(state, scenario, 'checkMark');
    state = actIn(state, scenario, 'markSecure');
    state = actIn(state, scenario, 'openLocker');
    state = actIn(state, scenario, 'contentsLedger');
    expect(text(state, scenario)).toMatch(/receives the ledger as recovered freight/i);
    state = actIn(state, scenario, 'riverFinish');
    expect(text(state, scenario)).toMatch(/returned ledger corrects a long-missing shipment entry/i);

    state = start(scenario);
    state = actIn(state, scenario, 'askFerryman');
    state = actIn(state, scenario, 'claimsOpen');
    state = actIn(state, scenario, 'openLocker');
    state = actIn(state, scenario, 'contentsWeights');
    expect(text(state, scenario)).toMatch(/farmer inspects the salvage weights; you leave them beside the wreck/i);
  });

  it('keeps the five audit candidates registered without changing library size', () => {
    expect(SCENARIOS).toHaveLength(861);
    expect(validateScenarioRegistry(LOST_PLACES_ADVENTURES).errors).toEqual([]);
    expect(validateScenarioRegistry(LOST_PLACES_ADVENTURES).warnings).toEqual([]);
  });
});

describe('The Room Behind the Chimney outcome continuity',()=>{
  it('does not claim the room purpose or either return after leaving the braced contents for the family',()=>{
    let state=act(begin(),'braceChimney');
    state=act(state,'bracedLeave');
    expect(state.run?.sceneId).toBe('discovery');
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,state)).toMatch(/does not establish the room’s purpose/i);
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,state)).not.toMatch(/letters explain|box and the returned letters|sewing box is in the family’s care/i);
  });

  it('keeps box-only and letters-only outcomes distinct from returning both',()=>{
    let boxOnly=act(begin(),'braceChimney');
    boxOnly=act(boxOnly,'removeBox');
    boxOnly=act(boxOnly,'boxReturn');
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,boxOnly)).toMatch(/sewing box is in the family’s care/i);
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,boxOnly)).not.toMatch(/letters explain/i);

    let lettersOnly=act(begin(),'braceChimney');
    lettersOnly=act(lettersOnly,'openLetters');
    lettersOnly=act(lettersOnly,'lettersShare');
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,lettersOnly)).toMatch(/returned letters explain/i);
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,lettersOnly)).toMatch(/box’s return to the family was not established/i);
    expect(lettersOnly.character?.knowledge).toContain('The room behind the chimney was dry storage used by a sewing business after a neighboring shop fire.');
  });

  it('states both outcomes only after the householder takes the box and the letters are returned, preserving proof through reload',()=>{
    let state=act(begin(),'braceChimney');
    state=act(state,'removeBox');
    state=act(state,'boxRead');
    state=act(state,'lettersShare');
    expect(state.run?.flags).toContain('chimneyBoxReturned');
    expect(state.run?.flags).toContain('chimneyLettersReturned');
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,state)).toMatch(/family has the sewing box and the returned letters/i);
    const memory=new Map<string,string>();
    const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value)};
    saveGame(state,storage as unknown as Storage);
    state=loadSave(storage as unknown as Storage);
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,state)).toMatch(/family has the sewing box and the returned letters/i);
  });

  it('uses neutral text for a legacy ending without route proof',()=>{
    const legacy=begin();
    legacy.run!.sceneId='discovery';
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,legacy)).toMatch(/does not establish the room’s purpose/i);
    expect(sceneText(THE_ROOM_BEHIND_THE_CHIMNEY.scenes.discovery,legacy)).not.toMatch(/letters explain|box and the returned letters/i);
  });
});
