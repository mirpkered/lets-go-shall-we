import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { ITEMS, itemsOfClass } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { INDUSTRIAL_MILL_RAIL_GEAR_BATCH } from './industrialMillRailWorkGenreBatch';

const initial = (scenario:(typeof INDUSTRIAL_MILL_RAIL_GEAR_BATCH)[number], gear?:string):SaveData => {
  const character = newCharacter('Industrial Tester');
  if (gear) { character.carriedItem = gear; character.carriedItems = [gear]; }
  return {...structuredClone(EMPTY_SAVE),character,run:startRun(character,scenario,()=>0)};
};
const act = (state:SaveData,scenario:(typeof INDUSTRIAL_MILL_RAIL_GEAR_BATCH)[number],id:string):SaveData => {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({id:choiceId})=>choiceId===id);
  expect(choice,`${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements,state),`${scenario.id}.${scene.id}.${id}`).toBe(true);
  return choose(state,scenario,choice!);
};

describe('Industrial / Mill / Rail Work genre batch',()=>{
  it('registers 24 distinct reachable, all-year industrial work Adventures',()=>{
    expect(INDUSTRIAL_MILL_RAIL_GEAR_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(INDUSTRIAL_MILL_RAIL_GEAR_BATCH.map(({id})=>id)).size).toBe(24);
    expect(validateScenarioRegistry(INDUSTRIAL_MILL_RAIL_GEAR_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(INDUSTRIAL_MILL_RAIL_GEAR_BATCH).warnings).toEqual([]);
    expect(INDUSTRIAL_MILL_RAIL_GEAR_BATCH.every(({scenes})=>scenes.inspect && scenes.diagnose && scenes.test && scenes.settle && scenes.settle.choices.length===3)).toBe(true);
  });

  it('keeps a no-tool inspection route and makes carried repair tools optional advantages',()=>{
    const belt=INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({id})=>id==='the-belt-that-slapped-back')!;
    expect(meets(belt.scenes.inspect.choices.find(({id})=>id==='inspect')!.requirements,initial(belt))).toBe(false);
    expect(meets(belt.scenes.inspect.choices.find(({id})=>id==='observe')!.requirements,initial(belt))).toBe(true);
    expect(meets(belt.scenes.inspect.choices.find(({id})=>id==='inspect')!.requirements,initial(belt,'foremanMultiTool'))).toBe(true);
    const file=INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({id})=>id==='the-rivet-at-car-seven')!;
    expect(file.scenes.diagnose.choices.some(({requirements})=>requirements?.items?.includes('machinistFileSet'))).toBe(true);
    const brake=INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({id})=>id==='the-dragging-brake-at-bell-yard')!;
    expect(brake.scenes.diagnose.choices.some(({requirements})=>requirements?.items?.includes('machinistFileSet'))).toBe(true);
  });

  it('grants learned Knowledge before settlement and keeps compensation choices exclusive',()=>{
    for (const scenario of INDUSTRIAL_MILL_RAIL_GEAR_BATCH) {
      let state=initial(scenario);
      state=act(state,scenario,'observe');
      state=act(state,scenario,'repair');
      state=act(state,scenario,'slow');
      expect(state.run?.sceneId,'settlement reached').toBe('settle');
      const settlement=scenario.scenes.settle;
      expect(settlement.choices.some(({effects})=>effects?.money)).toBe(true);
      expect(settlement.choices.some(({id})=>id==='declineFee')).toBe(true);
      expect(settlement.choices.some(({id})=>id==='knowledge')).toBe(false);
      expect(settlement.choices.some(({effects})=>effects?.gainItems?.length)).toBe(true);
      if(scenario.id==='the-sorting-table-jam') expect(state.character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.sortingTableFeedJam.id);
      const startingMoney=state.character!.money;
      const wage=act(state,scenario,'wage');
      expect(wage.character!.money).toBe(startingMoney+scenario.scenes.settle.choices[0].effects!.money!);
      if(scenario.id==='the-sorting-table-jam') expect(wage.character?.knowledgeSources?.[KNOWLEDGE_FACTS.sortingTableFeedJam.id]).toEqual([scenario.id]);
    }
  });

  it('keeps the Sorting Table lesson across coin, no-fee, and clamp compensation without stacking rewards',()=>{
    const scenario=INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({id})=>id==='the-sorting-table-jam')!;
    const settle=()=>{let state=initial(scenario);state=act(state,scenario,'observe');state=act(state,scenario,'repair');return act(state,scenario,'slow');};
    const fact=KNOWLEDGE_FACTS.sortingTableFeedJam;
    for(const [choiceId,coin,clamp] of [['wage',1,false],['declineFee',0,false],['gear',0,true]] as const){
      let result=act(settle(),scenario,choiceId);
      if(clamp) result=openRewardResolution(result);
      expect(result.character?.knowledgeKeys?.filter((id)=>id===fact.id)).toHaveLength(1);
      expect(result.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);
      expect(result.character?.money).toBe(coin);
      expect(result.run?.rewardPendingItems?.includes('foldingBenchClamp')??false).toBe(clamp);
    }
  });

  it('migrates the exact legacy Sorting Table lesson sentence to the stable Knowledge ID',()=>{
    const fact=KNOWLEDGE_FACTS.sortingTableFeedJam;
    const storage={value:JSON.stringify({version:1,bank:[],character:{...newCharacter('Legacy Industrial Tester'),knowledge:[fact.text],knowledgeKeys:undefined},run:null}),setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    expect(loadSave(storage as never).character?.knowledgeKeys).toContain(fact.id);
  });

  it('makes rushed full-load restarts consequential but nonlethal, with a clear safe alternative',()=>{
    for (const scenario of INDUSTRIAL_MILL_RAIL_GEAR_BATCH) {
      let state=initial(scenario);
      state=act(state,scenario,'observe');
      state=act(state,scenario,'rush');
      expect(state.run?.sceneId).toBe('unsafe');
      state=act(state,scenario,'secure');
      expect(state.run?.sceneId).toBe('settle');
      expect(state.character!.health).toBeGreaterThan(0);
      expect(scenario.scenes.unsafe.text).toContain('crew hits the stop');
    }
  });

  it('persists the new Machinist’s File Set through reward placement and save/resume',()=>{
    expect(ITEMS.machinistFileSet.description).toContain('cannot align a shaft');
    expect(itemsOfClass('GEAR').some(({id})=>id==='machinistFileSet')).toBe(true);
    const scenario=INDUSTRIAL_MILL_RAIL_GEAR_BATCH.find(({id})=>id==='the-lathe-chip')!;
    let state=initial(scenario);
    state=act(state,scenario,'observe'); state=act(state,scenario,'repair'); state=act(state,scenario,'slow'); state=act(state,scenario,'gear'); state=openRewardResolution(state);
    const storage={value:'',setItem(_key:string,value:string){this.value=value;},getItem(_key:string){return this.value;}};
    saveGame(state,storage as never);
    const reloaded=loadSave(storage as never);
    expect(reloaded.run?.rewardPendingItems).toContain('machinistFileSet');
    const placed=finishRewardResolution(placeReward(reloaded,'machinistFileSet','carry')).character;
    expect(getCarriedItems(placed)).toContain('machinistFileSet');
  });
});
