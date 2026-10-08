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
  state=act(state,scenario,'close');
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

  it('shows owned construction tools only when usable and preserves non-Gear work routes',()=>{
    const roof=BATCH.find(({id})=>id==='the-roof-that-held-its-breath')!;
    const measure=roof.scenes.work.choices.find(({id})=>id==='measure')!;
    const fresh=initial(roof);
    expect(meets(measure.requirements,fresh)).toBe(false);
    expect(roof.scenes.work.choices.some(({id})=>id==='shore')).toBe(true);
    const equipped=initial(roof);
    equipped.character!.carriedItem='travelRope';
    equipped.character!.carriedItems=['travelRope'];
    equipped.run!.inventory.push('travelRope');
    expect(meets(measure.requirements,equipped)).toBe(true);
    equipped.itemStates={travelRope:{condition:'BROKEN',upgrades:[],provenance:[]}};
    expect(meets(measure.requirements,equipped)).toBe(false);

    const clamp=BATCH.find(({id})=>id==='three-knots-on-the-platform')!;
    expect(clamp.scenes.work.choices.find(({id})=>id==='measure')?.requirements?.usableItems).toContain('foldingBenchClamp');
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

  it('grants experience-learned Knowledge before compensation and limits prior-learning recall to three explicit fits',()=>{
    const facts=Object.values(KNOWLEDGE_FACTS).filter(({id})=>BATCH.some(({scenes})=>scenes.reveal.choices.some(({effects})=>effects?.knowledgeEntries?.some((entry)=>entry.id===id))));
    expect(facts).toHaveLength(8);
    for(const fact of facts){
      const grant=BATCH.flatMap(({scenes})=>scenes.reveal.choices).filter(({effects})=>effects?.knowledgeEntries?.some((entry)=>entry.id===fact.id));
      expect(grant.length).toBeGreaterThanOrEqual(3);
    }
    const targets=[
      ['the-joint-that-opened-in-winter','the-roof-that-held-its-breath',KNOWLEDGE_FACTS.winterJointMovement.id],
      ['the-stone-that-kept-the-water','the-riverward-retaining-wall',KNOWLEDGE_FACTS.waterPathBeforeWall.id],
      ['the-ladder-in-the-west-yard','three-knots-on-the-platform',KNOWLEDGE_FACTS.scaffoldFootAndLashing.id],
    ] as const;
    const knowledgeCallbacks=BATCH.flatMap(({scenes})=>Object.values(scenes)).flatMap((scene)=>scene.textVariants??[]).filter(({requirements})=>requirements.knowledgeKeys);
    expect(knowledgeCallbacks).toHaveLength(8);
    for(const [sourceId,targetId,factId] of targets){
      const target=BATCH.find(({id})=>id===targetId)!;
      const variants=target.scenes.start.textVariants??[];
      const sourcedVariants=variants.filter(({requirements})=>requirements?.knowledgeSources?.[factId]);
      const fallback=variants.find(({requirements})=>requirements?.knowledgeKeys?.includes(factId)&&!requirements.knowledgeSources);
      expect(sourcedVariants.some(({requirements})=>requirements?.knowledgeSources?.[factId]?.includes(sourceId))).toBe(true);
      expect(fallback).toBeTruthy();
      const fresh=initial(target);
      const freshChoices=target.scenes.start.choices.map(({id})=>id);
      expect(sceneText(target.scenes.start,fresh)).toBe(target.scenes.start.text);
      const recalled=initial(target);
      recalled.character!.knowledgeKeys=[factId];
      expect(meets(sourcedVariants[0].requirements,recalled)).toBe(false);
      expect(sceneText(target.scenes.start,recalled)).toBe(fallback!.text);
      recalled.character!.knowledgeSources={[factId]:['some-other-adventure']};
      expect(meets(sourcedVariants[0].requirements,recalled)).toBe(false);
      expect(sceneText(target.scenes.start,recalled)).toBe(fallback!.text);
      recalled.character!.knowledgeSources={[factId]:[sourceId]};
      const sourced=sourcedVariants.find(({requirements})=>requirements?.knowledgeSources?.[factId]?.includes(sourceId))!;
      expect(meets(sourced.requirements,recalled)).toBe(true);
      expect(sceneText(target.scenes.start,recalled)).toBe(sourced.text);
      expect(target.scenes.start.choices.map(({id})=>id)).toEqual(freshChoices);
      const inspect=target.scenes.start.choices.find(({id})=>id==='inspect')!;
      expect(choose(fresh,target,inspect).run?.sceneId).toBe('work');
      expect(choose(recalled,target,inspect).run?.sceneId).toBe('work');
    }
    expect(BATCH.find(({id})=>id==='the-riverward-retaining-wall')!.scenes.start.textVariants?.some(({requirements})=>requirements?.knowledgeSources?.[KNOWLEDGE_FACTS.waterPathBeforeWall.id]?.includes('the-camp-below-the-cut'))).toBe(true);
    expect(BATCH.find(({id})=>id==='three-knots-on-the-platform')!.scenes.start.textVariants?.some(({requirements})=>requirements?.knowledgeSources?.[KNOWLEDGE_FACTS.scaffoldFootAndLashing.id]?.includes('three-knots-on-the-platform'))).toBe(true);
  });

  it('records Three Knots as a second source of scaffold Knowledge before the compensation choice',()=>{
    const scenario=BATCH.find(({id})=>id==='three-knots-on-the-platform')!;
    const fact=KNOWLEDGE_FACTS.scaffoldFootAndLashing;
    let state=initial(scenario);
    state=act(state,scenario,'inspect');
    state=act(state,scenario,'close');
    state=act(state,scenario,'resolve');
    expect(state.run?.sceneId).toBe('settle');
    expect(state.character?.knowledgeKeys).toContain(fact.id);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);
    expect(state.character?.knowledge).toContain(fact.text);

    const source=BATCH.find(({id})=>id==='the-ladder-in-the-west-yard')!;
    let second=initial(source);
    second.character=state.character;
    second.run=startRun(second.character!,source,()=>0);
    second=act(second,source,'inspect');
    second=act(second,source,'close');
    second=act(second,source,'resolve');
    second=act(second,source,'wage');
    expect(second.character?.knowledgeKeys?.filter((id)=>id===fact.id)).toHaveLength(1);
    expect(second.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id,source.id]);
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

  it('keeps Knowledge recall in narration while retaining the separate Lore recognition choice',()=>{
    for(const scenario of BATCH){
      const reveal=Object.values(scenario.scenes).find((scene)=>scene.id==='reveal')!;
      const loreCallback=reveal.choices.find(({id})=>id==='connectLocalHistory');
      expect(reveal.choices.some(({id})=>id==='applyKnownMethod')).toBe(false);
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
    expect(knowledgeState.character?.knowledgeSources?.[KNOWLEDGE_FACTS.winterJointMovement.id]).toEqual([knowledgeStory.id]);
    const knowledgeStorage={value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    saveGame(knowledgeState,knowledgeStorage as never);
    expect(loadSave(knowledgeStorage as never).character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.winterJointMovement.id);
    expect(loadSave(knowledgeStorage as never).character?.knowledgeSources?.[KNOWLEDGE_FACTS.winterJointMovement.id]).toEqual([knowledgeStory.id]);

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
