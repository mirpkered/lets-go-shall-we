import { describe, expect, it } from 'vitest';
import { choose, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, setItemCondition, startRun } from '../engine';
import { ITEMS, itemsOfClass } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { MEDICAL_RESCUE_SUPPORT_GEAR_BATCH } from './medicalRescueSupportGenreBatch';

const fresh = (scenario:(typeof MEDICAL_RESCUE_SUPPORT_GEAR_BATCH)[number], item?:string):SaveData => {
  const character=newCharacter('Rescue Tester');
  if(item){character.carriedItem=item;character.carriedItems=[item];}
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,scenario,()=>0)};
};
const act=(state:SaveData,scenario:(typeof MEDICAL_RESCUE_SUPPORT_GEAR_BATCH)[number],choiceId:string):SaveData=>{
  const scene=scenario.scenes[state.run!.sceneId];
  const choice=scene.choices.find(({id})=>id===choiceId);
  expect(choice,`${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scenario.id}.${scene.id}.${choiceId}`).toBe(true);
  return choose(state,scenario,choice!);
};

describe('Medical / Rescue Support / Evacuation genre batch',()=>{
  it('registers 24 distinct, reachable all-year Adventures with continuity choices',()=>{
    expect(MEDICAL_RESCUE_SUPPORT_GEAR_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.map(({id})=>id)).size).toBe(24);
    expect(MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.filter(({scenes})=>scenes.settle.choices.some(({id})=>id==='gear'))).toHaveLength(22);
    expect(validateScenarioRegistry(MEDICAL_RESCUE_SUPPORT_GEAR_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(MEDICAL_RESCUE_SUPPORT_GEAR_BATCH).warnings).toEqual([]);
    for(const scenario of MEDICAL_RESCUE_SUPPORT_GEAR_BATCH){
      expect(scenario.scenes.assess.choices.length).toBeGreaterThanOrEqual(3);
      expect(scenario.scenes.decision.choices).toHaveLength(3);
      expect(scenario.scenes.settle.choices.some(({effects})=>effects?.knowledge?.length)).toBe(true);
    }
  });

  it('makes every assessment action and follow-up resolve distinctly without hidden diagnosis',()=>{
    for(const scenario of MEDICAL_RESCUE_SUPPORT_GEAR_BATCH){
      for(const first of scenario.scenes.assess.choices){
        const prepared=act(fresh(scenario,first.requirements?.items?.[0]),scenario,first.id);
        expect(prepared.run?.sceneId).toBe('decision');
        for(const next of scenario.scenes.decision.choices){
          const resolved=act(prepared,scenario,next.id);
          expect(resolved.run?.sceneId).toBe('settle');
          const settleText=scenario.scenes.settle.textVariants?.find(({requirements})=>meets(requirements,resolved))?.text ?? scenario.scenes.settle.text;
          expect(settleText).toBeTruthy();
          expect(settleText).not.toMatch(/diagnos(?:e|is) (?:the|a) (?:fracture|concussion|internal bleeding)/i);
        }
      }
    }
  });

  it('shows named owned-Gear actions only when that Gear is usable, while supplied equipment and fresh routes remain available',()=>{
    const story=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.find(({id})=>id==='lanterns-at-milepost-nine')!;
    const freshState=fresh(story);
    expect(story.scenes.assess.choices.some(({id})=>id==='useGear' && meets(story.scenes.assess.choices.find((choice)=>choice.id==='useGear')!.requirements,freshState))).toBe(false);
    expect(story.scenes.assess.choices.filter((choice)=>meets(choice.requirements,freshState)).length).toBeGreaterThanOrEqual(2);

    const owned=fresh(story,'trailWhistle');
    const gearChoice=story.scenes.assess.choices.find(({id})=>id==='useGear')!;
    expect(meets(gearChoice.requirements,owned)).toBe(true);
    expect(meets(gearChoice.requirements,setItemCondition(owned,'trailWhistle','BROKEN'))).toBe(false);

    const suppliedStory=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.find(({id})=>id==='the-frozen-post-road')!;
    const suppliedChoice=suppliedStory.scenes.assess.choices.find(({id})=>id==='protect')!;
    expect(suppliedChoice.label).toContain('waystation’s spare wool blanket');
    expect(meets(suppliedChoice.requirements,fresh(suppliedStory))).toBe(true);
  });

  it('does not combine coin, Knowledge, and Gear compensation, and consumes a used bandage',()=>{
    const mill=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.find(({id})=>id==='the-millwrights-hand')!;
    let state=fresh(mill,'fieldBandageRoll');
    state=act(state,mill,'useGear');
    expect(state.run?.inventory).not.toContain('fieldBandageRoll');
    state=act(state,mill,'stay');
    const base=state.character!.money;
    const paid=act(state,mill,'wage');
    expect(paid.character!.money).toBe(base+2);
    expect(paid.run?.rewardPendingItems ?? []).toHaveLength(0);
    const learned=act(state,mill,'learn');
    expect(learned.character!.knowledge).toContain(mill.scenes.settle.choices[0].effects!.knowledge![0]);
    expect(learned.character!.money).toBe(base);
    const gear=openRewardResolution(act(state,mill,'gear'));
    expect(gear.run?.rewardPendingItems).toContain('foremanMultiTool');
    expect(gear.character!.money).toBe(base);
  });

  it('uses the Canvas Rescue Sling as a limited support option and preserves it through save/resume',()=>{
    expect(ITEMS.canvasRescueSling).toMatchObject({carryable:true,inventoryClass:'GEAR'});
    expect(ITEMS.canvasRescueSling.description).toContain('needs helpers');
    expect(itemsOfClass('GEAR')).toHaveLength(74);
    expect(itemsOfClass('GEAR').filter(({carryable})=>carryable)).toHaveLength(72);
    const quarry=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.find(({id})=>id==='the-stonecutters-narrow-way')!;
    const callbacks=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.filter(({scenes})=>scenes.assess.choices.some(({requirements})=>requirements?.items?.includes('canvasRescueSling')));
    expect(callbacks.map(({id})=>id)).toEqual(expect.arrayContaining(['the-collapsed-shed-door','the-evacuation-bell-at-pine-crossing','the-dog-handler-at-the-switchback']));
    let state=fresh(quarry);
    state=act(state,quarry,'protect');
    state=act(state,quarry,'stay');
    state=openRewardResolution(act(state,quarry,'gear'));
    const storage={value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    saveGame(state,storage as never);
    const resumed=loadSave(storage as never);
    expect(resumed.run?.rewardPendingItems).toContain('canvasRescueSling');
  });

  it('preserves Gear capacity and avoids duplicate carried or Banked slings',()=>{
    const quarry=MEDICAL_RESCUE_SUPPORT_GEAR_BATCH.find(({id})=>id==='the-stonecutters-narrow-way')!;
    let state=fresh(quarry,'travelRope');
    state=act(state,quarry,'protect'); state=act(state,quarry,'stay'); state=openRewardResolution(act(state,quarry,'gear'));
    expect(getCarriedItems(state.character)).toEqual(['travelRope']);
    expect(state.run?.rewardPendingItems).toContain('canvasRescueSling');
    const capacityBlocked=placeReward(state,'canvasRescueSling','carry');
    expect(getCarriedItems(capacityBlocked.character)).not.toContain('canvasRescueSling');
    expect(capacityBlocked.run?.rewardPendingItems).toContain('canvasRescueSling');
    const banked=placeReward(capacityBlocked,'canvasRescueSling','bank');
    expect(banked.bank).toContain('canvasRescueSling');
    expect(placeReward(banked,'canvasRescueSling','bank').bank.filter((id)=>id==='canvasRescueSling')).toHaveLength(1);
    const alreadyBanked=fresh(quarry);
    alreadyBanked.bank.push('canvasRescueSling');
    expect(meets(quarry.scenes.settle.choices.find(({id})=>id==='gear')?.requirements,alreadyBanked)).toBe(false);
    expect(itemsOfClass('GEAR').filter(({id})=>id==='canvasRescueSling')).toHaveLength(1);
  });
});
