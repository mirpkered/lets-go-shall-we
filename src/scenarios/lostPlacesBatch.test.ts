import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { THE_ROOM_BEHIND_THE_CHIMNEY } from './lostPlacesBatch';

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
