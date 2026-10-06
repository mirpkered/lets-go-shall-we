import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { ITEMS } from '../items';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { CONSTRUCTION_BATCH_PRIMARY_LANES, CONSTRUCTION_BUILDING_STRUCTURAL_WORK_BATCH as BATCH } from './constructionBuildingStructuralWorkGenreBatch';

const initial=(scenario:(typeof BATCH)[number]):SaveData=>{
  const character=newCharacter('Builder’s Helper');
  return {version:1,bank:[],character,run:startRun(character,scenario,()=>0)};
};
const act=(state:SaveData,scenario:(typeof BATCH)[number],id:string):SaveData=>{
  const choice=scenario.scenes[state.run!.sceneId].choices.find((entry)=>entry.id===id);
  expect(choice,`${scenario.id}.${state.run!.sceneId}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scenario.id}.${state.run!.sceneId}.${id} requirements`).toBe(true);
  return choose(state,scenario,choice!);
};
const reachSettlement=(scenario:(typeof BATCH)[number])=>{
  let state=initial(scenario);
  state=act(state,scenario,'inspect');
  state=act(state,scenario,'measure');
  state=act(state,scenario,'resolve');
  expect(state.run?.sceneId).toBe('settle');
  return state;
};

describe('Construction / Building / Structural Work batch',()=>{
  it('adds 24 unique, reachable, year-round Adventures with balanced primary continuity',()=>{
    expect(BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(BATCH.map(({id})=>id)).size).toBe(24);
    expect(CONSTRUCTION_BATCH_PRIMARY_LANES).toEqual({GEAR:8,KNOWLEDGE:8,LORE:8});
    expect(validateScenarioRegistry(BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(BATCH).warnings).toEqual([]);
    expect(BATCH.every(({diversity})=>diversity?.availability?.season==='ALL_YEAR')).toBe(true);
    expect(BATCH.every(({scenes})=>scenes.start&&scenes.work&&scenes.reveal&&scenes.settle)).toBe(true);
  });

  it('provides clear structural alternatives and consequential rush/force routes without arbitrary death',()=>{
    for(const scenario of BATCH){
      expect(scenario.scenes.start.choices.some(({id})=>id==='withdraw')).toBe(true);
      expect(scenario.scenes.start.choices.some(({id})=>id==='rush')).toBe(true);
      expect(scenario.scenes.work.choices.some(({id})=>id==='force')).toBe(true);
      expect(scenario.scenes.reveal.choices.some(({id})=>id==='alternate')).toBe(true);
      expect(Object.values(scenario.scenes).every(({ending})=>ending!=='death')).toBe(true);
      expect(scenario.scenes.settle.text).toContain('structure');
    }
  });

  it('keeps primary reward choices exclusive, state-aware, and persistent',()=>{
    const gearRecords=BATCH.filter(({scenes})=>scenes.settle.choices.some(({id})=>id==='keepGear'));
    expect(gearRecords).toHaveLength(8);
    for(const scenario of BATCH){
      const state=reachSettlement(scenario);
      const settle=scenario.scenes.settle.choices;
      expect(settle.some(({id})=>id==='wage')).toBe(true);
      if(scenario.scenes.settle.choices.some(({id})=>id==='keepGear')){
        const gearChoice=settle.find(({id})=>id==='keepGear')!;
        expect(gearChoice.effects?.gainItems).toHaveLength(1);
        expect(gearChoice.effects?.gainItemProvenance?.[gearChoice.effects.gainItems![0]]).toBeTruthy();
        expect(meets(gearChoice.requirements,state)).toBe(true);
        const owned=structuredClone(state);
        owned.character!.carriedItems=[gearChoice.effects!.gainItems![0]];
        owned.character!.carriedItem=gearChoice.effects!.gainItems![0];
        expect(meets(gearChoice.requirements,owned)).toBe(false);
      }
    }
  });

  it('registers each new Knowledge fact once and gives every fact a later narration callback',()=>{
    const facts=Object.values(KNOWLEDGE_FACTS).filter(({id})=>BATCH.some(({scenes})=>scenes.settle.choices.some(({effects})=>effects?.knowledgeEntries?.some((entry)=>entry.id===id))));
    expect(facts).toHaveLength(8);
    for(const fact of facts){
      const grant=BATCH.flatMap(({scenes})=>scenes.settle.choices).filter(({effects})=>effects?.knowledgeEntries?.some((entry)=>entry.id===fact.id));
      expect(grant).toHaveLength(1);
      const callback=BATCH.flatMap(({scenes})=>Object.values(scenes)).flatMap((scene)=>scene.textVariants??[]).find(({requirements})=>requirements.knowledgeKeys?.includes(fact.id));
      expect(callback,`${fact.id} callback`).toBeTruthy();
      const state=initial(BATCH[0]);
      state.character!.knowledgeKeys=[fact.id];
      expect(meets(callback!.requirements,state)).toBe(true);
    }
  });

  it('recognizes all new Lore entries later and keeps their history distinct from Knowledge',()=>{
    const loreGrants=BATCH.flatMap(({scenes})=>scenes.settle.choices.flatMap(({effects})=>effects?.lore??[]));
    expect(loreGrants.length).toBeGreaterThanOrEqual(8);
    expect(new Set(loreGrants).size).toBe(loreGrants.length);
    for(const entry of loreGrants){
      const callback=BATCH.flatMap(({scenes})=>Object.values(scenes)).flatMap((scene)=>scene.textVariants??[]).find(({requirements})=>requirements.lore?.includes(entry));
      expect(callback,'Lore callback').toBeTruthy();
      const state=initial(BATCH[0]);
      state.character!.lore=[entry];
      expect(meets(callback!.requirements,state)).toBe(true);
    }
  });

  it('changes available follow-up choices when prior Knowledge or Lore is present',()=>{
    for(const scenario of BATCH){
      const reveal=Object.values(scenario.scenes).find((scene)=>scene.id==='reveal')!;
      const knowledgeCallback=reveal.choices.find(({id})=>id==='applyKnownMethod');
      const loreCallback=reveal.choices.find(({id})=>id==='connectLocalHistory');
      if(knowledgeCallback?.requirements?.knowledgeKeys?.[0]){
        const state=initial(scenario);
        state.character!.knowledgeKeys=[knowledgeCallback.requirements.knowledgeKeys[0]];
        expect(meets(knowledgeCallback.requirements,state)).toBe(true);
        expect(sceneText(reveal,state)).not.toBe(reveal.text);
      }
      if(loreCallback?.requirements?.lore?.[0]){
        const state=initial(scenario);
        state.character!.lore=[loreCallback.requirements.lore[0]];
        expect(meets(loreCallback.requirements,state)).toBe(true);
        expect(sceneText(reveal,state)).not.toBe(reveal.text);
      }
    }
  });

  it('persists acquired construction Knowledge and Lore through save/resume',()=>{
    const knowledgeStory=BATCH.find(({id})=>id==='the-joint-that-opened-in-winter')!;
    let knowledgeState=reachSettlement(knowledgeStory);
    knowledgeState=act(knowledgeState,knowledgeStory,'learn');
    const knowledgeStorage={value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    saveGame(knowledgeState,knowledgeStorage as never);
    expect(loadSave(knowledgeStorage as never).character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.winterJointMovement.id);

    const loreStory=BATCH.find(({id})=>id==='the-tower-without-its-shadow')!;
    let loreState=reachSettlement(loreStory);
    loreState=act(loreState,loreStory,'recordLore');
    const loreStorage={value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    saveGame(loreState,loreStorage as never);
    const loadedLore=loadSave(loreStorage as never).character?.lore??[];
    expect(loadedLore).toContain(loreStory.scenes.settle.choices.find(({id})=>id==='recordLore')!.effects!.lore![0]);
    expect(EMPTY_SAVE.character).toBeNull();
  });

  it('offers existing practical Gear with explicit transfer provenance and no catalog bloat',()=>{
    const rewards=BATCH.flatMap(({scenes})=>scenes.settle.choices.filter(({id})=>id==='keepGear').flatMap(({effects})=>effects?.gainItems??[]));
    expect(new Set(rewards).size).toBeGreaterThanOrEqual(5);
    for(const id of rewards) expect(ITEMS[id].inventoryClass).toBe('GEAR');
    expect(ITEMS.carpenterSquare.description).toContain('alignment');
  });

  it('routes a released construction tool through ordinary capacity-aware reward placement',()=>{
    const scenario=BATCH[0];
    let state=reachSettlement(scenario);
    const item=scenario.scenes.settle.choices.find(({id})=>id==='keepGear')!.effects!.gainItems![0];
    state=act(state,scenario,'keepGear');
    state=openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain(item);
    state=finishRewardResolution(placeReward(state,item,'carry'));
    expect(getCarriedItems(state.character)).toContain(item);
    expect(state.character?.carriedItems).toHaveLength(1);
  });
});
