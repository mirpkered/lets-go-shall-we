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
  it('reserves the map symbol and private-letter disposition for routes that establish them', () => {
    const map = get('the-map-in-the-ledger');
    let copiedOnly = actIn(start(map), map, 'copyMap');
    expect(text(copiedOnly, map)).toMatch(/third stone’s mark remains unidentified/i);
    expect(text(copiedOnly, map)).not.toMatch(/water-gate mark can guide/i);

    let locationOnly = actIn(start(map), map, 'traceCreek');
    locationOnly = actIn(locationOnly, map, 'takeTrackBack');
    expect(text(locationOnly, map)).toMatch(/mark remains unidentified/i);

    let interpreted = actIn(start(map), map, 'traceCreek');
    interpreted = actIn(interpreted, map, 'checkStone');
    interpreted = actIn(interpreted, map, 'stoneRecord');
    interpreted = loadSave({ getItem: () => JSON.stringify(interpreted) });
    expect(text(interpreted, map)).toMatch(/identified water-gate mark/i);
    expect(interpreted.character?.knowledge).toContain('The third stone at the split pine marks an old mill water gate, not a buried cache.');

    const fort = get('the-last-room-in-the-fort');
    let inventoryOnly = actIn(start(fort), fort, 'readInventory');
    inventoryOnly = actIn(inventoryOnly, fort, 'planPermission');
    inventoryOnly = actIn(inventoryOnly, fort, 'openRoom');
    inventoryOnly = actIn(inventoryOnly, fort, 'roomCount');
    expect(text(inventoryOnly, fort)).toMatch(/letters’ ownership and eventual destination remain undetermined/i);
    expect(text(inventoryOnly, fort)).not.toMatch(/referred to the surgeon’s family/i);

    let identifiedAndReferred = actIn(start(fort), fort, 'readInventory');
    identifiedAndReferred = actIn(identifiedAndReferred, fort, 'planPermission');
    identifiedAndReferred = actIn(identifiedAndReferred, fort, 'openRoom');
    identifiedAndReferred = actIn(identifiedAndReferred, fort, 'roomLetters');
    identifiedAndReferred = actIn(identifiedAndReferred, fort, 'fortRecord');
    identifiedAndReferred = loadSave({ getItem: () => JSON.stringify(identifiedAndReferred) });
    expect(text(identifiedAndReferred, fort)).toMatch(/identified letters are referred to the surgeon’s family/i);
    expect(identifiedAndReferred.character?.knowledge).toContain('Room seven at the old fort was a temporary infirmary during a fever year, not an armory.');

    let waitedOutside = actIn(start(fort), fort, 'readInventory');
    waitedOutside = actIn(waitedOutside, fort, 'planPermission');
    waitedOutside = actIn(waitedOutside, fort, 'waitOutside');
    waitedOutside = actIn(waitedOutside, fort, 'fortRecord');
    expect(text(waitedOutside, fort)).toMatch(/identified letters are referred to the surgeon’s family/i);
  });

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

  it('does not infer neighbor agreement from returning the calf or reading the county entry aloud', () => {
    const scenario = get('the-old-survey-stone');
    let calfOnly = start(scenario);
    calfOnly = actIn(calfOnly, scenario, 'declineBoundary');
    calfOnly = actIn(calfOnly, scenario, 'calfReturn');
    expect(text(calfOnly, scenario)).toMatch(/calf is home/i);
    expect(text(calfOnly, scenario)).not.toMatch(/neighbors agree/i);
    expect(text(calfOnly, scenario)).toMatch(/neither neighbor .* agreed how to handle the gate/i);

    let countyEvidence = start(scenario);
    countyEvidence = actIn(countyEvidence, scenario, 'checkStone');
    countyEvidence = actIn(countyEvidence, scenario, 'marksLedger');
    countyEvidence = actIn(countyEvidence, scenario, 'askCounty');
    countyEvidence = actIn(countyEvidence, scenario, 'recordTell');
    expect(text(countyEvidence, scenario)).not.toMatch(/neighbors agree/i);
    expect(text(countyEvidence, scenario)).toMatch(/neither neighbor .* agreed how to handle the gate/i);
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

  it('summarizes the Forgotten Station freight link without claiming uninspected records as evidence', () => {
    const scenario = get('the-forgotten-station');
    let noticeOnly = start(scenario);
    noticeOnly = actIn(noticeOnly, scenario, 'enterWaiting');
    noticeOnly = actIn(noticeOnly, scenario, 'roomLeave');
    expect(text(noticeOnly, scenario)).toMatch(/still serves local freight/i);
    expect(text(noticeOnly, scenario)).not.toMatch(/book and chalk marks explain/i);

    let workerAndCrate = start(scenario);
    workerAndCrate = actIn(workerAndCrate, scenario, 'askRailman');
    workerAndCrate = actIn(workerAndCrate, scenario, 'workerAwning');
    workerAndCrate = actIn(workerAndCrate, scenario, 'awningWait');
    workerAndCrate = actIn(workerAndCrate, scenario, 'stationFinish');
    expect(text(workerAndCrate, scenario)).toMatch(/still serves local freight/i);
    expect(text(workerAndCrate, scenario)).not.toMatch(/book and chalk marks explain/i);

    let bookRecord = start(scenario);
    bookRecord = actIn(bookRecord, scenario, 'enterWaiting');
    bookRecord = actIn(bookRecord, scenario, 'readBook');
    bookRecord = actIn(bookRecord, scenario, 'bookCopy');
    expect(text(bookRecord, scenario)).toMatch(/still serves local freight/i);
    expect(text(bookRecord, scenario)).not.toMatch(/book and chalk marks explain/i);
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

describe('The Island When the Water Falls discovery continuity', () => {
  const scenario = get('the-island-when-the-water-falls');

  it('does not infer the island landing or submergence from safe-bank and uninspected-island routes', () => {
    let safeBank = start(scenario);
    safeBank = actIn(safeBank, scenario, 'waitWater');
    safeBank = actIn(safeBank, scenario, 'waitTurnBack');
    expect(text(safeBank, scenario)).not.toMatch(/freight landing|goes under|covers it/i);

    let postOnly = start(scenario);
    postOnly = actIn(postOnly, scenario, 'readPost');
    postOnly = actIn(postOnly, scenario, 'postRecord');
    expect(text(postOnly, scenario)).not.toMatch(/freight landing|goes under|covers it/i);

    let uninspectedBar = start(scenario);
    uninspectedBar = actIn(uninspectedBar, scenario, 'readPost');
    uninspectedBar = actIn(uninspectedBar, scenario, 'postCross');
    uninspectedBar = actIn(uninspectedBar, scenario, 'islandReturn');
    expect(text(uninspectedBar, scenario)).not.toMatch(/freight landing|goes under|covers it/i);
  });

  it('states the landing only after its foundation or receipt establishes the use', () => {
    let foundation = start(scenario);
    foundation = actIn(foundation, scenario, 'readPost');
    foundation = actIn(foundation, scenario, 'postCross');
    foundation = actIn(foundation, scenario, 'islandFoundation');
    foundation = actIn(foundation, scenario, 'foundationRecord');
    expect(text(foundation, scenario)).toMatch(/freight landing/i);
    expect(text(foundation, scenario)).not.toMatch(/gone under|covers it/i);
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) };
    saveGame(foundation, storage as unknown as Storage);
    foundation = loadSave(storage as unknown as Storage);
    expect(text(foundation, scenario)).toMatch(/freight landing/i);

    let receipt = start(scenario);
    receipt = actIn(receipt, scenario, 'readPost');
    receipt = actIn(receipt, scenario, 'postCross');
    receipt = actIn(receipt, scenario, 'islandTin', 0);
    receipt = actIn(receipt, scenario, 'tinReturn');
    expect(text(receipt, scenario)).toMatch(/freight landing/i);
    expect(text(receipt, scenario)).not.toMatch(/gone under|covers it/i);
  });

  it('limits the submerged-bar claim to the rescue route that establishes it', () => {
    let rescued = start(scenario);
    rescued = actIn(rescued, scenario, 'waitWater');
    rescued = actIn(rescued, scenario, 'waitRisk', 0.99);
    rescued = actIn(rescued, scenario, 'strandWait');
    rescued = actIn(rescued, scenario, 'islandRescueEnd');
    expect(text(rescued, scenario)).toMatch(/gone under since your rescue/i);
    expect(text(rescued, scenario)).not.toMatch(/freight landing/i);
  });
});

describe('The House under the Hill history continuity', () => {
  const scenario = get('the-house-under-the-hill');

  it('keeps no-contact and no-record routes neutral and does not claim a warning on direct departure', () => {
    let outside = start(scenario);
    outside = actIn(outside, scenario, 'lookWindow');
    outside = actIn(outside, scenario, 'roomRetreat');
    expect(text(outside, scenario)).toMatch(/history was not established/i);
    expect(text(outside, scenario)).not.toMatch(/landholder says|deed records|will mark .* closed|is warned/i);

    let upperOnly = start(scenario);
    upperOnly = actIn(upperOnly, scenario, 'enterHouse');
    upperOnly = actIn(upperOnly, scenario, 'upperOut');
    expect(text(upperOnly, scenario)).toMatch(/history was not established/i);
    expect(text(upperOnly, scenario)).not.toMatch(/landholder says|deed records|will mark .* closed|is warned/i);

    let directLeave = start(scenario);
    directLeave = actIn(directLeave, scenario, 'leaveHill');
    expect(text(directLeave, scenario)).not.toMatch(/landholder is warned|warned that|closure plan/i);
  });

  it('attributes flood abandonment to the landholder only after that account is heard', () => {
    let state = start(scenario);
    state = actIn(state, scenario, 'markSlope');
    state = actIn(state, scenario, 'landholderWait');
    state = actIn(state, scenario, 'roomRetreat');
    expect(text(state, scenario)).toMatch(/landholder says the house was abandoned after the spring flood/i);
    expect(text(state, scenario)).not.toMatch(/deed records|family’s move to higher ground|will mark .* closed|is warned/i);
  });

  it('attributes the move uphill to the deed route and preserves its proof across reload', () => {
    let state = start(scenario);
    state = actIn(state, scenario, 'lookWindow');
    state = actIn(state, scenario, 'takePapers');
    state = actIn(state, scenario, 'paperReturn');
    expect(text(state, scenario)).toMatch(/deed fragment records the family’s move to higher ground/i);
    expect(text(state, scenario)).not.toMatch(/landholder says|will mark .* closed|is warned/i);
    expect(state.character?.knowledge).toContain('The buried house was abandoned after a spring flood undermined the lower wall; the family moved uphill.');
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) };
    saveGame(state, storage as unknown as Storage);
    state = loadSave(storage as unknown as Storage);
    expect(text(state, scenario)).toMatch(/deed fragment records the family’s move to higher ground/i);
  });

  it('uses neutral legacy text when route proof is absent', () => {
    const legacy = start(scenario);
    legacy.run!.sceneId = 'discovery';
    expect(text(legacy, scenario)).toMatch(/history was not established/i);
    expect(text(legacy, scenario)).not.toMatch(/landholder says|deed records|will mark .* closed|is warned/i);
  });
});
