import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { THE_BOUNTY_POSTER, THE_EMPTY_JAIL, THE_MAN_AT_THE_END_OF_THE_BAR, THE_OUTLAWS_MOTHER, THE_RUSTLED_HERD, THE_STAGE_WAS_HIT } from './westernOutlawBatch';

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
const beginBar=():SaveData=>{
  const character=newCharacter('Bar Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_MAN_AT_THE_END_OF_THE_BAR,()=>0)};
};
const actBar=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_MAN_AT_THE_END_OF_THE_BAR.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  return choose(state,THE_MAN_AT_THE_END_OF_THE_BAR,choice!,()=>0);
};
const beginStage=():SaveData=>{
  const character=newCharacter('Stage Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_STAGE_WAS_HIT,()=>0)};
};
const actStage=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_STAGE_WAS_HIT.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  return choose(state,THE_STAGE_WAS_HIT,choice!,()=>0);
};
const beginJail=():SaveData=>{
  const character=newCharacter('Jail Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_EMPTY_JAIL,()=>0)};
};
const actJail=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_EMPTY_JAIL.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scene.id}.${choiceId} availability`).toBe(true);
  return choose(state,THE_EMPTY_JAIL,choice!);
};
const beginHerd=():SaveData=>{
  const character=newCharacter('Herd Tester');
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_RUSTLED_HERD,()=>0)};
};
const actHerd=(state:SaveData,choiceId:string):SaveData=>{
  const scene=THE_RUSTLED_HERD.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scene.id}.${choiceId} availability`).toBe(true);
  return choose(state,THE_RUSTLED_HERD,choice!);
};

describe('The Rustled Herd evidence continuity',()=>{
  it('keeps marks-only, receipt-only, and holding-only reports distinct from the full comparison',()=>{
    let state=actHerd(beginHerd(),'inspectBrands');
    state=actHerd(state,'brandsReport');
    expect(state.run?.flags).toContain('herdBrandsReported');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).toMatch(/marks alone do not settle/i);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).not.toMatch(/twelve calves|eighteen|six too high/i);
    state=actHerd(state,'settlementLeave');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settled,state)).toMatch(/does not establish a complete count/i);

    state=actHerd(beginHerd(),'readTracks');
    state=actHerd(state,'marketTrack');
    state=actHerd(state,'marketReceipt');
    expect(state.run?.flags).toContain('herdMarketEvidenceSeen');
    expect(state.character?.knowledge).toContain('The market buyer paid for twelve calves with the neighbor’s smaller brand; the rest of the missing herd remains unaccounted for.');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).toMatch(/receipt accounts for twelve calves.*holding pasture has not been counted/i);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).not.toMatch(/holding pasture accounts for eighteen|together, those counts/i);

    state=actHerd(beginHerd(),'readTracks');
    state=actHerd(state,'holdingTrack');
    state=actHerd(state,'holdingConfer');
    expect(state.run?.flags).toContain('herdHoldingCountSeen');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).toMatch(/holding pasture contains eighteen cattle.*sale receipt has not been checked/i);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).not.toMatch(/receipt accounts for twelve calves|together, those counts/i);
  });

  it('resolves the count only after both evidence sources are brought together and preserves the result through reload',()=>{
    let state=actHerd(beginHerd(),'readTracks');
    state=actHerd(state,'marketTrack');
    state=actHerd(state,'marketFollow');
    state=actHerd(state,'holdingConfer');
    expect(state.run?.flags).toContain('herdMarketEvidenceSeen');
    expect(state.run?.flags).toContain('herdHoldingCountSeen');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).toMatch(/twelve calves.*eighteen/i);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settlement,state)).toMatch(/thirty cattle/i);
    state=actHerd(state,'settlementLeave');
    expect(sceneText(THE_RUSTLED_HERD.scenes.settled,state)).toMatch(/accounted for by brand, receipt, and holding-pasture count/i);
    const memory=new Map<string,string>();
    const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value)};
    saveGame(state,storage as unknown as Storage);
    state=loadSave(storage as unknown as Storage);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settled,state)).toMatch(/accounted for by brand, receipt, and holding-pasture count/i);
  });

  it('uses a neutral legacy fallback when route evidence flags are absent',()=>{
    const legacy=beginHerd();
    legacy.run!.sceneId='settled';
    expect(sceneText(THE_RUSTLED_HERD.scenes.settled,legacy)).toMatch(/does not establish a complete count/i);
    expect(sceneText(THE_RUSTLED_HERD.scenes.settled,legacy)).not.toMatch(/twelve calves.*eighteen/i);
  });
});

describe('The Empty Jail clerk-presence continuity',()=>{
  it('keeps the no-contact wait truthful and only adds the book review after the clerk returns',()=>{
    let state=actJail(beginJail(),'waitJailer');
    state=actJail(state,'waitStay');
    expect(state.run?.sceneId).toBe('jailerBack');
    expect(state.run?.flags).not.toContain('jailClerkWithTraveler');
    expect(sceneText(THE_EMPTY_JAIL.scenes.wait,state)).not.toMatch(/no officer has answered your call/i);
    expect(sceneText(THE_EMPTY_JAIL.scenes.jailerBack,state)).not.toMatch(/clerk finds no entry/i);
    expect(THE_EMPTY_JAIL.scenes.jailerBack.choices.some(({id})=>id==='jailerClerkAccount')).toBe(false);
    expect(THE_EMPTY_JAIL.scenes.jailerBack.choices.some(({id})=>id==='jailerCallClerk')).toBe(true);

    state=actJail(state,'jailerCallClerk');
    state=actJail(state,'clerkReturn');
    expect(state.run?.sceneId).toBe('jailerBackWithClerk');
    expect(state.run?.flags).toContain('jailClerkWithTraveler');
    const memory=new Map<string,string>();
    const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value)};
    saveGame(state,storage as unknown as Storage);
    state=loadSave(storage as unknown as Storage);
    expect(sceneText(THE_EMPTY_JAIL.scenes.jailerBackWithClerk,state)).toMatch(/clerk finds no entry/i);
    expect(THE_EMPTY_JAIL.scenes.jailerBackWithClerk.choices.some(({id})=>id==='jailerClerkAccount')).toBe(true);
  });

  it('uses neutral text for a legacy jailer-return save without clerk-presence proof',()=>{
    const legacy=beginJail();
    legacy.run!.sceneId='jailerBack';
    expect(sceneText(THE_EMPTY_JAIL.scenes.jailerBack,legacy)).not.toMatch(/clerk finds no entry/i);
  });
});

describe('The Stage Was Hit escort outcome truth',()=>{
  it('does not turn local aid or a town warning into an unestablished escort',()=>{
    let localAid=actStage(beginStage(),'treatPassenger');
    localAid=actStage(localAid,'helpStayCoach');
    localAid=actStage(localAid,'stageAccount');
    expect(localAid.run?.sceneId).toBe('stageEnd');
    expect(sceneText(THE_STAGE_WAS_HIT.scenes.stageEnd,localAid)).not.toMatch(/under escort/i);

    let townHelp=actStage(beginStage(),'rideTown');
    townHelp=actStage(townHelp,'warnStay');
    townHelp=actStage(townHelp,'stageAccount');
    expect(townHelp.run?.sceneId).toBe('stageEnd');
    expect(THE_STAGE_WAS_HIT.scenes.townWarn.text).toMatch(/constable and a doctor/i);
    expect(sceneText(THE_STAGE_WAS_HIT.scenes.stageEnd,townHelp)).not.toMatch(/under escort/i);
  });
});

describe('The Man at the End of the Bar route-truth continuity',()=>{
  it('does not claim the clerk corrected the accusation unless the Traveler heard the correction',()=>{
    let quiet=actBar(beginBar(),'quietKitchen');
    quiet=actBar(quiet,'alleyLeave');
    expect(sceneText(THE_MAN_AT_THE_END_OF_THE_BAR.scenes.safeEnd,quiet)).not.toMatch(/clerk.s account corrects the accusation/i);

    let armed=actBar(beginBar(),'drawFirst');
    armed=actBar(armed,'gunLeave');
    expect(sceneText(THE_MAN_AT_THE_END_OF_THE_BAR.scenes.safeEnd,armed)).not.toMatch(/clerk.s account corrects the accusation/i);

    let heard=actBar(beginBar(),'askReason');
    heard=actBar(heard,'askClerk');
    heard=JSON.parse(JSON.stringify(heard)) as SaveData;
    heard=actBar(heard,'clerkSlipOut');
    heard=actBar(heard,'alleyLeave');
    expect(sceneText(THE_MAN_AT_THE_END_OF_THE_BAR.scenes.safeEnd,heard)).toMatch(/clerk.s account corrects the accusation/i);

    const legacy=beginBar();
    legacy.run!.sceneId='safeEnd';
    expect(sceneText(THE_MAN_AT_THE_END_OF_THE_BAR.scenes.safeEnd,legacy)).not.toMatch(/clerk.s account corrects the accusation/i);
  });
});

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

describe('The Outlaw’s Mother message-state continuity',()=>{
  const startMother=():SaveData=>{
    const character=newCharacter('Message Tester');
    return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,THE_OUTLAWS_MOTHER,()=>0)};
  };
  const actMother=(state:SaveData,choiceId:string):SaveData=>{
    const scene=THE_OUTLAWS_MOTHER.scenes[state.run!.sceneId];
    const choice=scene.choices.find(({id})=>id===choiceId);
    expect(choice,`${scene.id}.${choiceId}`).toBeTruthy();
    return choose(state,THE_OUTLAWS_MOTHER,choice!);
  };

  it('does not report delivery after the Traveler refuses the transfer',()=>{
    let refused=actMother(startMother(),'carrySealed');
    refused=actMother(refused,'refuseTransfer');
    expect(sceneText(THE_OUTLAWS_MOTHER.scenes.departure,refused)).toMatch(/without proof that the family message reached its destination/i);
    expect(sceneText(THE_OUTLAWS_MOTHER.scenes.departure,refused)).not.toMatch(/family news reaches the son/i);

    let delivered=actMother(startMother(),'carrySealed');
    delivered=actMother(delivered,'handLetter');
    delivered=actMother(delivered,'leaveMan');
    expect(sceneText(THE_OUTLAWS_MOTHER.scenes.departure,delivered)).toMatch(/family news reaches the son/i);
    const memory=new Map<string,string>();
    const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value)};
    saveGame(delivered,storage as unknown as Storage);
    expect(sceneText(THE_OUTLAWS_MOTHER.scenes.departure,loadSave(storage as unknown as Storage))).toMatch(/family news reaches the son/i);
    const legacy=startMother();
    legacy.run!.sceneId='departure';
    expect(sceneText(THE_OUTLAWS_MOTHER.scenes.departure,legacy)).toMatch(/without proof/i);
  });
});
