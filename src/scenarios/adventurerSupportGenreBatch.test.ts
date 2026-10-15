import { describe, expect, it } from 'vitest';
import { ITEMS } from '../items';
import { choose, finishRewardResolution, getCarriedItems, newCharacter, openRewardResolution, placeReward, sceneText, setItemCondition, startRun, meets } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import type { SaveData } from '../types';
import { ADVENTURER_SUPPORT_GENRE_BATCH } from './adventurerSupportGenreBatch';
import { SCENARIOS } from './index';

function start(scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], carriedItem?: string, bank: string[] = []): SaveData {
  const character = newCharacter('Support Batch Tester');
  if (carriedItem) { character.carriedItem = carriedItem; character.carriedItems = [carriedItem]; }
  return { ...structuredClone(EMPTY_SAVE), bank, character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], choiceId: string, roll = 0): SaveData {
  const current = scenario.scenes[state.run!.sceneId];
  const choice = current.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.id}.${current.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${current.id}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll);
}

function claimGear(scenario: (typeof ADVENTURER_SUPPORT_GENRE_BATCH)[number], combat = false): SaveData {
  let state = start(scenario);
  const prepChoice = scenario.scenes.preparation.choices[0];
  state = act(state, scenario, prepChoice.id);
  const response = scenario.scenes.complication.choices.find(({ id }) => id.startsWith('response_'))!;
  if (combat) state = act(state, scenario, 'standGround');
  else state = act(state, scenario, response.id);
  if (combat) state = act(state, scenario, 'continueAfterFight');
  if (state.run?.sceneId === 'followup') state = act(state, scenario, scenario.scenes.followup.choices[0].id);
  state = act(state, scenario, 'acceptGear');
  state = openRewardResolution(state);
  const itemId = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!.effects!.gainItems![0];
  state = finishRewardResolution(placeReward(state, itemId, 'carry'));
  expect(getCarriedItems(state.character)).toContain(itemId);
  return state;
}

describe('Adventurer Support / Squire / Henchman genre batch', () => {
  it('gates the Traveler-owned Trail Compass callback while preserving Rook’s supplied survey kit', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'glass-road')!;
    const compass = story.scenes.preparation.choices.find(({ id }) => id === 'kit_compass')!;
    expect(meets(compass.requirements, start(story))).toBe(false);
    expect(meets(compass.requirements, start(story, 'trailCompass'))).toBe(true);
    expect(meets(compass.requirements, setItemCondition(start(story, 'trailCompass'), 'trailCompass', 'BROKEN'))).toBe(false);
    expect(story.scenes.preparation.choices.some((choice) => meets(choice.requirements, start(story)))).toBe(true);
    const suppliedGlasses = story.scenes.preparation.choices.find(({ id }) => id === 'kit_glasses')!;
    expect(suppliedGlasses.requirements).toBeUndefined();
    expect(meets(suppliedGlasses.requirements, start(story))).toBe(true);
  });
  it('registers 24 distinct all-year Adventures with valid forward graphs and continuity outcomes', () => {
    expect(ADVENTURER_SUPPORT_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(ADVENTURER_SUPPORT_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE' && diversity.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioRegistry(ADVENTURER_SUPPORT_GENRE_BATCH).errors).toEqual([]);
    expect(validateScenarioRegistry(ADVENTURER_SUPPORT_GENRE_BATCH).warnings).toEqual([]);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE')).toHaveLength(6);
    expect(ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ scenes }) => scenes.followup)).toHaveLength(8);
  });

  it('uses the selected kit to determine which consequential support action is available', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH[0];
    let state = act(start(scenario), scenario, scenario.scenes.preparation.choices[0].id);
    const responses = scenario.scenes.complication.choices.filter(({ id }) => id.startsWith('response_'));
    expect(responses).toHaveLength(3);
    expect(responses.filter((choice) => meets(choice.requirements, state))).toHaveLength(3);
    state = act(state, scenario, responses[1].id);
    expect(state.run?.sceneId).toBe('followup');
    state = act(state, scenario, scenario.scenes.followup.choices[1].id);
    expect(state.run?.sceneId).toBe('settlement');
  });

  it('offers the Padded Pack Saddle only when carried and keeps animal weight limits in view', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-mule-load')!;
    const choice = scenario.scenes.preparation.choices.find(({ id }) => id === 'kit_pad')!;
    expect(meets(choice.requirements, start(scenario))).toBe(false);
    expect(meets(choice.requirements, start(scenario, undefined, ['paddedPackSaddle']))).toBe(false);
    const carried = start(scenario, 'paddedPackSaddle');
    expect(meets(choice.requirements, carried)).toBe(true);
    const after = act(carried, scenario, 'kit_pad');
    const consequence = scenario.scenes.complication.textVariants?.find(({ requirements }) => meets(requirements, after))?.text;
    expect(consequence).toMatch(/spreads.*pressure.*cannot correct a shifting load/i);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(after, storage as never);
    const resumed = loadSave(storage as never);
    expect(scenario.scenes.complication.textVariants?.find(({ requirements }) => meets(requirements, resumed))?.text).toBe(consequence);
  });

  it('offers canonical, explicit ownership transfer for all 24 Gear routes', () => {
    for (const scenario of ADVENTURER_SUPPORT_GENRE_BATCH) {
      const itemId = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!.effects!.gainItems![0];
      expect(ITEMS[itemId], scenario.title).toBeTruthy();
      expect(ITEMS[itemId].inventoryClass, scenario.title).toBe('GEAR');
      claimGear(scenario);
    }
  });

  it('keeps experience-learned Knowledge independent from wages, Gear, or refusal',()=>{
    for(const scenario of ADVENTURER_SUPPORT_GENRE_BATCH){
      expect(scenario.scenes.settlement.choices.some(({id})=>id==='keepKnowledge'),scenario.id).toBe(false);
      for(const choice of scenario.scenes.settlement.choices) expect(choice.effects?.knowledge,`${scenario.id}.${choice.id}`).toHaveLength(1);
    }
  });

  it('resolves all six authored combat routes without requiring combat for story completion', () => {
    const combatScenarios = ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE');
    for (const scenario of combatScenarios) claimGear(scenario, true);
    expect(combatScenarios).toHaveLength(6);
  });

  it('lets the traveler make a second decision after losing the Second Gunhand exchange', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-second-gunhand')!;
    let state = act(start(scenario), scenario, 'kit_whistle');
    state = act(state, scenario, 'standGround', 0.99);
    expect(state.run?.sceneId).toBe('retreat');
    expect(state.run?.health).toBeLessThan(newCharacter('Support Batch Tester').maxHealth);
    expect(scenario.scenes.retreat.choices).toHaveLength(2);

    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    state = act(state, scenario, 'retreat_withdraw');
    expect(state.run?.sceneId).toBe('retreatWithdraw');
    expect(scenario.scenes.retreatWithdraw.text).toMatch(/payroll/);
    expect(scenario.scenes.retreatWithdraw.text).toMatch(/robbers escape/);
  });

  it('shows the robbers before response choices on every Second Gunhand approach', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-second-gunhand')!;
    for (const approach of scenario.scenes.preparation.choices) {
      const state = act(start(scenario), scenario, approach.id);
      expect(state.run?.sceneId, approach.id).toBe('complication');
      const displayed = scenario.scenes.complication.textVariants!.find(({ requirements }) => meets(requirements, state));
      expect(displayed?.text, approach.id).toContain('Two armed robbers leave the trees');
      expect(displayed?.text, approach.id).toContain('order the driver down');
      expect(scenario.scenes.complication.choices.map(({ label }) => label).join(' '), approach.id).toMatch(/robbers/);
    }
  });

  it('gives each authored support-work combat loss a scene-specific follow-up decision', () => {
    const combatScenarios = ADVENTURER_SUPPORT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE');
    for (const scenario of combatScenarios) {
      let state = act(start(scenario), scenario, scenario.scenes.preparation.choices[0].id);
      state = act(state, scenario, 'standGround', 0.99);
      expect(state.run?.sceneId, scenario.id).toBe('retreat');
      expect(scenario.scenes.retreat.choices, scenario.id).toHaveLength(2);
      state = act(state, scenario, 'retreat_hold');
      expect(scenario.scenes[state.run!.sceneId].ending, scenario.id).toBe('success');
      expect(scenario.scenes[state.run!.sceneId].title, scenario.id).toBe('A Hard Withdrawal');
    }
  });

  it('registers the eight new practical tools as ordinary, carryable Gear', () => {
    const newIds = ['fieldGlasses', 'foldingBrushSaw', 'surveyChain', 'climbingPitons', 'packFrame', 'handAuger', 'collapsibleWaterPail', 'signalFlagSet'];
    for (const id of newIds) {
      expect(ITEMS[id]?.carryable).toBe(true);
      expect(ITEMS[id]?.inventoryClass).toBe('GEAR');
    }
  });

  it('blocks duplicates already carried or banked across every reward route', () => {
    for (const scenario of ADVENTURER_SUPPORT_GENRE_BATCH) {
      const choice = scenario.scenes.settlement.choices.find(({ id }) => id === 'acceptGear')!;
      const item = choice.effects!.gainItems![0];
      expect(meets(choice.requirements, start(scenario, item)), `${scenario.id} carried duplicate`).toBe(false);
      expect(meets(choice.requirements, start(scenario, undefined, [item])), `${scenario.id} banked duplicate`).toBe(false);
    }
  });

  it('preserves a selected new Gear reward through save, reload, and canonical placement', () => {
    const scenario = ADVENTURER_SUPPORT_GENRE_BATCH[0];
    let state = act(start(scenario), scenario, scenario.scenes.preparation.choices[0].id);
    state = act(state, scenario, scenario.scenes.complication.choices.find(({ id }) => id.startsWith('response_'))!.id);
    if (state.run?.sceneId === 'followup') state = act(state, scenario, scenario.scenes.followup.choices[0].id);
    state = act(state, scenario, 'acceptGear');
    state = openRewardResolution(state);
    const item = state.run?.rewardPendingItems?.[0];
    expect(item).toBeTruthy();
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    const reloaded = loadSave(storage as never);
    expect(reloaded.run?.scenarioId).toBe(scenario.id);
    expect(reloaded.run?.rewardPendingItems).toContain(item);
    const placed = finishRewardResolution(placeReward(reloaded, item!, 'carry'));
    expect(getCarriedItems(placed.character)).toContain(item);
  });

  it('presents mutually exclusive compensation accurately on both ordinary and combat-success routes', () => {
    const gunhand = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-second-gunhand')!;
    expect(gunhand.scenes.settlement.text).toMatch(/offers the agreed three-coin guard fee or/i);
    expect(gunhand.scenes.paid.text).toMatch(/accept 3 coins, not the Travel Rope/i);
    expect(gunhand.scenes.gear.text).toMatch(/spare rope/i);
    const blindCut = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-blind-cut')!;
    expect(blindCut.scenes.settlement.text).toMatch(/offers the agreed three-coin scout fee or/i);
    expect(blindCut.scenes.paid.text).toMatch(/accept 3 coins, not the Signal Flag Set/i);
    expect(blindCut.scenes.gear.text).toMatch(/spare set/i);
  });

  it('keeps each new support complication visible alongside the selected kit detail', () => {
    for (const scenario of ADVENTURER_SUPPORT_GENRE_BATCH) {
      for (const kit of scenario.scenes.preparation.choices) {
        const carried = kit.requirements?.items?.[0];
        let state = start(scenario, carried);
        state = act(state, scenario, kit.id);
        const displayed = sceneText(scenario.scenes.complication, state);
        expect(displayed, `${scenario.id}.${kit.id}: complication`).toContain(scenario.scenes.complication.text);
        expect(displayed.split(scenario.scenes.complication.text).length - 1, `${scenario.id}.${kit.id}: no duplicate complication`).toBe(1);
        const selectedDetail = scenario.scenes.complication.textVariants?.find(({ requirements }) => meets(requirements, state))?.text;
        expect(selectedDetail, `${scenario.id}.${kit.id}: selected kit detail`).toBeTruthy();
        expect(displayed).toContain(selectedDetail);
        const kitDetail = selectedDetail!.replace(scenario.scenes.complication.text, '').trim();
        expect(kitDetail.length, `${scenario.id}.${kit.id}: nonempty kit detail`).toBeGreaterThan(20);
        expect(displayed).toContain(kitDetail);
        expect(scenario.scenes.complication.choices.some(({ id }) => id.startsWith('response_') && meets(undefined, state)), scenario.id).toBe(true);
      }
    }
    const secondGunhand = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-second-gunhand')!;
    const gunhand = start(secondGunhand);
    const flagged = act(gunhand, secondGunhand, 'kit_flags');
    const threatText = sceneText(secondGunhand.scenes.complication, flagged);
    expect(threatText.match(/Two armed robbers leave the trees/g)).toHaveLength(1);
  });

  it('does not report the tin still below after the line route recovers it', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'three-points-down')!;
    let recovered = act(start(story), story, 'kit_pitons');
    recovered = act(recovered, story, 'response_line');
    expect(recovered.run?.sceneId).toBe('settlement');
    expect(sceneText(story.scenes.settlement, recovered)).toMatch(/tin comes up/);
    expect(sceneText(story.scenes.settlement, recovered)).not.toMatch(/tin is still visible|tin remains below/i);

    let left = act(start(story), story, 'kit_pitons');
    left = act(left, story, 'response_leave');
    expect(left.run?.sceneId).toBe('followup');
    left = act(left, story, 'followup_markFissure');
    expect(sceneText(story.scenes.followup, left)).toContain('The tin is still visible');
  });

  it('keeps spare-saw Gear provenance independent of whether Marr’s saw was used or damaged', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'saw-before-sunrise')!;
    const cases = [
      ['kit_axe', 'response_cutSmall'],
      ['kit_rope', 'response_secure'],
      ['kit_saw', 'response_wait'],
    ] as const;
    for (const [kit, response] of cases) {
      let state = act(start(story), story, kit);
      state = act(state, story, response);
      expect(state.run?.sceneId, `${kit}/${response}`).toBe('settlement');
      state = act(state, story, 'acceptGear');
      expect(state.run?.sceneId, `${kit}/${response}`).toBe('gear');
      expect(story.scenes.gear.text).toMatch(/separately owned spare Folding Brush Saw/i);
      expect(story.scenes.gear.text).not.toMatch(/damaged|lost a tooth|repair/i);
    }
  });

  it('does not make the rail-gate test route inherit the repaired-gate Gear provenance', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-rail-shed')!;
    const run = (response: string) => {
      let state = act(start(story), story, 'kit_toolkit');
      state = act(state, story, `response_${response}`);
      expect(state.run?.sceneId, response).toBe('settlement');
      const settlement = sceneText(story.scenes.settlement, state);
      state = act(state, story, 'acceptGear');
      expect(state.run?.sceneId, response).toBe('gear');
      expect(story.scenes.gear.text).toMatch(/spare Pocket Toolkit from her personal railway kit/i);
      expect(story.scenes.gear.text).not.toMatch(/repaired gate|signs off/i);
      return settlement;
    };

    expect(run('test')).toMatch(/counterweight moves freely/i);
    expect(run('open')).toMatch(/replaces it before reopening the gate/i);
    expect(run('defer')).toMatch(/approves a measured repair/i);
  });

  it('keeps the pry-tool handoff truthful whether the freight case is returned or left for others', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-wrong-cache')!;
    const run = (response: string) => {
      let state = act(start(story), story, 'kit_glasses');
      state = act(state, story, `response_${response}`);
      expect(state.run?.sceneId, response).toBe('settlement');
      const settlement = sceneText(story.scenes.settlement, state);
      state = act(state, story, 'acceptGear');
      expect(state.run?.sceneId, response).toBe('gear');
      expect(story.scenes.gear.text).toMatch(/separately owned duplicate Folding Pry Tool/i);
      expect(story.scenes.gear.text).toMatch(/does not depend on the freight case changing custody/i);
      expect(story.scenes.gear.text).not.toMatch(/clerk takes custody|clerk took custody/i);
      return settlement;
    };

    expect(run('wait')).toMatch(/asks the landowner to keep the cellar closed/i);
    expect(run('document')).toMatch(/case stays sealed/i);
    expect(run('return')).toMatch(/clerk signs the receipt/i);
  });

  it('does not credit recovered property after the Flooded Chest combat victory', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-flooded-chest')!;
    let combat = act(start(story), story, 'kit_rod');
    combat = act(combat, story, 'standGround', 0);
    expect(combat.run?.sceneId).toBe('afterFight');
    combat = act(combat, story, 'continueAfterFight');
    expect(combat.run?.sceneId).toBe('settlement');
    const combatSettlement = sceneText(story.scenes.settlement, combat);
    expect(combatSettlement).toMatch(/chest remains with its owners/i);
    expect(combatSettlement).not.toMatch(/recovered property|property recovered/i);

    let collarOnly = act(start(story), story, 'kit_rod');
    collarOnly = act(collarOnly, story, 'response_mark');
    const collarSettlement = sceneText(story.scenes.settlement, collarOnly);
    expect(collarSettlement).toMatch(/collar is reached/i);
    expect(collarSettlement).toMatch(/chest stays beyond the uncertain channel/i);
  });

  it('does not treat waiting for the lookout post as a signal being sent or received', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'daylight-flags')!;
    const run = (response: string) => {
      let state = act(start(story), story, 'kit_flags');
      state = act(state, story, `response_${response}`);
      expect(state.run?.sceneId, response).toBe('settlement');
      return sceneText(story.scenes.settlement, state);
    };

    expect(run('wait')).toMatch(/original message remains unconfirmed; no further signal is sent/i);
    expect(run('wait')).not.toMatch(/next flag signal is understood/i);
    expect(run('flags')).toMatch(/repeats the agreed red-white-red pattern/i);
    expect(run('runner')).toMatch(/courier reaches the station.*receives a clear acknowledgment/i);
  });

  it('does not condition the hound’s gear handoff on finding a person or watering the dog', () => {
    const story = ADVENTURER_SUPPORT_GENRE_BATCH.find(({ id }) => id === 'the-silent-hound')!;
    expect(story.scenes.gear.text).toMatch(/no missing person is claimed found/i);
    expect(story.scenes.gear.text).toMatch(/privately owned spare/i);
    for (const response of ['follow', 'water', 'withdraw']) {
      let state = act(start(story), story, 'kit_glasses');
      state = act(state, story, `response_${response}`);
      expect(state.run?.sceneId).toBe('settlement');
      const text = sceneText(story.scenes.settlement, state);
      if (response === 'follow') expect(text).toContain('You find a lost survey hand');
      if (response === 'water') expect(text).toContain('The animal drinks');
      if (response === 'withdraw') expect(text).toContain('instead of forcing the hound across');
    }
  });
});
