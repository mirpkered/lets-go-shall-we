import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import type { SaveData } from '../types';
import { THE_BOUNTY_POSTER } from './westernOutlawBatch';

const begin=():SaveData=>{
  const character=newCharacter('Bounty Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_BOUNTY_POSTER,()=>0)};
};
const act=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_BOUNTY_POSTER.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  return choose(state,THE_BOUNTY_POSTER,choice!);
};

describe('The Bounty Poster route/evidence integrity',()=>{
  it('routes the livery choice to the household inquiry it actually describes',()=>{
    let state=act(begin(),'askTeacher');
    state=act(state,'teacherLivery');
    const choice=THE_BOUNTY_POSTER.scenes.livery.choices.find(({id})=>id==='liveryBrand')!;
    expect(choice.label).toMatch(/household.*permission/i);
    state=act(state,'liveryBrand');
    expect(state.run?.sceneId).toBe('witness');
    expect(THE_BOUNTY_POSTER.scenes.witness.text).toContain('confirms Tomas brought the mare');
    expect(THE_BOUNTY_POSTER.scenes.witness.text).not.toContain('brand');
  });

  it('keeps livery evidence and testimony bounded rather than turning either into a theft verdict',()=>{
    expect(THE_BOUNTY_POSTER.scenes.livery.text).toContain('cannot say who owns it');
    expect(THE_BOUNTY_POSTER.scenes.witness.text).toContain('may have grown from a missed return, not a theft');
    expect(THE_BOUNTY_POSTER.scenes.teacher.text).toContain('does not know whether it was the rancher’s horse or whether permission had been given');
    expect(THE_BOUNTY_POSTER.scenes.teacher.text).toContain('before sunrise');
    expect(THE_BOUNTY_POSTER.scenes.witness.text).toContain('expected her before dawn');
    expect(THE_BOUNTY_POSTER.scenes.witness.text).not.toMatch(/returned (?:at|before) dawn/i);
  });

  it('does not invent Tomas’s agreement, the fence debt, or the mare’s return in shared closure',()=>{
    const rancherChallenge=act(act(act(begin(),'askRancher'),'rancherPost'),'bountyClose');
    expect(rancherChallenge.run?.sceneId).toBe('settled');
    const sentTomas=act(act(act(begin(),'seekTomas'),'tellTomasLeave'),'bountyClose');
    expect(sentTomas.run?.sceneId).toBe('settled');
    let witnessed=act(begin(),'seekTomas');
    witnessed=act(witnessed,'askHousehold');
    witnessed=act(witnessed,'witnessTellRancher');
    witnessed=act(witnessed,'bountyClose');
    expect(witnessed.run?.sceneId).toBe('settled');
    const closure=THE_BOUNTY_POSTER.scenes.settled.text;
    expect(closure).toContain('No bounty changes hands');
    expect(closure).toContain('withdraws the theft claim');
    expect(closure).not.toMatch(/Tomas agrees|mend the stable fence|horse returns to the ranch|child.s family keeps its privacy/i);
  });
});
