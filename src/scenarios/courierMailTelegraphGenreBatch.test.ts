import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import type { SaveData } from '../types';
import { COURIER_CONSEQUENCE_MATRIX, COURIER_BATCH_PRIMARY_LANES, COURIER_MAIL_TELEGRAPH_GENRE_BATCH } from './courierMailTelegraphGenreBatch';
import { SCENARIOS } from './index';

const fresh = (scenario: (typeof COURIER_MAIL_TELEGRAPH_GENRE_BATCH)[number], item?: string): SaveData => {
  const character = newCharacter('Courier Tester');
  if (item) { character.carriedItem = item; character.carriedItems = [item]; }
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
};
const act = (state: SaveData, scenario: (typeof COURIER_MAIL_TELEGRAPH_GENRE_BATCH)[number], choiceId: string): SaveData => {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  expect(choice, `${scenario.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${choiceId}`).toBe(true);
  return choose(state, scenario, choice!);
};

describe('Courier / Mail / Telegraph / Message Work batch', () => {
  it('registers 24 unique reachable all-year Adventures with an exact 8/8/8 continuity balance', () => {
    expect(COURIER_MAIL_TELEGRAPH_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(859);
    expect(new Set(COURIER_MAIL_TELEGRAPH_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(COURIER_BATCH_PRIMARY_LANES).toEqual({ GEAR: 8, KNOWLEDGE: 8, LORE: 8 });
    expect(Object.keys(KNOWLEDGE_FACTS)).toHaveLength(32);
    const authoredLore = new Set(SCENARIOS.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices.flatMap(({ effects }) => effects?.lore ?? []))));
    expect(authoredLore).toHaveLength(46);
    expect(validateScenarioRegistry(COURIER_MAIL_TELEGRAPH_GENRE_BATCH)).toMatchObject({ errors: [], warnings: [] });
    expect(COURIER_CONSEQUENCE_MATRIX).toHaveLength(24);
    for (const scenario of COURIER_MAIL_TELEGRAPH_GENRE_BATCH) {
      expect(scenario.diversity?.availability?.season).toBe('ALL_YEAR');
      expect(Object.values(scenario.scenes).some(({choices})=>choices.some(({effects})=>effects?.knowledgeEntries?.length)) || scenario.scenes.settle.choices.some(({ effects }) => effects?.lore?.length || effects?.gainItems?.length)).toBe(true);
    }
  });

  it('gives every newly grantable Knowledge fact and Lore entry an authored recognition callback', () => {
    const facts = new Set(COURIER_MAIL_TELEGRAPH_GENRE_BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices.flatMap(({ effects }) => effects?.knowledgeEntries?.map(({ id }) => id) ?? []))));
    const lore = new Set(COURIER_MAIL_TELEGRAPH_GENRE_BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ choices }) => choices.flatMap(({ effects }) => effects?.lore ?? []))));
    const variants = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.flatMap(({ scenes }) => Object.values(scenes).flatMap(({ textVariants }) => textVariants ?? []));
    for (const id of facts) expect(variants.some(({ requirements }) => requirements?.knowledgeKeys?.includes(id)), `Knowledge callback for ${id}`).toBe(true);
    for (const entry of lore) expect(variants.some(({ requirements }) => requirements?.lore?.includes(entry)), `Lore callback for ${entry}`).toBe(true);
  });

  it('grants the eight message conventions demonstrated in handling before any compensation choice',()=>{
    const primaryKnowledgeIds=new Set(['station-mark-in-margin','seal-that-cooled-wrong','copy-that-came-back','flooded-relay-book','initials-on-the-wire','town-name-that-moved','bell-before-the-wire','horse-change-ledger']);
    const knowledgeStories=COURIER_MAIL_TELEGRAPH_GENRE_BATCH.filter(({id})=>primaryKnowledgeIds.has(id));
    expect(knowledgeStories).toHaveLength(8);
    for(const scenario of knowledgeStories){
      const handlingFact=scenario.scenes.handling.choices.flatMap(({effects})=>effects?.knowledgeEntries??[]);
      expect(handlingFact.length).toBeGreaterThan(0);
      expect(scenario.scenes.settle.choices.some(({id})=>id==='keepKnowledge')).toBe(false);
      let state=fresh(scenario);
      state=act(state,scenario,'acceptDelivery');
      state=act(state,scenario,scenario.scenes.handling.choices[0].id);
      expect(state.character?.knowledgeKeys?.length).toBeGreaterThan(0);
      expect(state.character?.knowledgeSources?.[state.character!.knowledgeKeys![0]]).toEqual([scenario.id]);
    }
  });

  it('records the Bell before the Wire convention once without repeating the lesson in the ending',()=>{
    const scenario=COURIER_MAIL_TELEGRAPH_GENRE_BATCH.find(({id})=>id==='bell-before-the-wire')!;
    const fact=KNOWLEDGE_FACTS.telegraphOfficeBellConvention;
    let state=fresh(scenario);
    state=act(state,scenario,'acceptDelivery');
    state=act(state,scenario,'carryNow');
    expect(state.character?.knowledgeKeys?.filter((id)=>id===fact.id)).toHaveLength(1);
    expect(state.character?.knowledge?.filter((entry)=>entry===fact.text)).toHaveLength(1);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);
    state=act(state,scenario,'deliverAsKnown');
    state=act(state,scenario,'settleDelivered');
    expect(scenario.scenes.settle.choices.some(({next})=>next==='knowledgeEnding')).toBe(false);
    state=act(state,scenario,'takeFee');
    expect(state.run?.sceneId).toBe('paid');
    expect(sceneText(scenario.scenes.paid,state)).not.toContain(fact.text);
    expect(sceneText(scenario.scenes.knowledgeEnding,state)).not.toContain(fact.text);
    expect(state.character?.knowledgeKeys?.filter((id)=>id===fact.id)).toHaveLength(1);
  });

  it('preserves explicit delivery, delay, refusal, and uncertainty choices as persistent History', () => {
    for (const scenario of COURIER_MAIL_TELEGRAPH_GENRE_BATCH) {
      let state = fresh(scenario);
      state = act(state, scenario, 'acceptDelivery');
      state = act(state, scenario, 'carryNow');
      state = act(state, scenario, 'deliverAsKnown');
      expect(state.run?.sceneId).toBe('delivered');
      state = act(state, scenario, 'settleDelivered');
      expect(state.run?.sceneId).toBe('settle');
      expect(state.character?.historyFlags).toContain(COURIER_CONSEQUENCE_MATRIX.find(({ id }) => id === scenario.id)!.positive);

      let delayed = fresh(scenario);
      delayed = act(delayed, scenario, 'acceptDelivery');
      delayed = act(delayed, scenario, 'verifyOutside');
      delayed = act(delayed, scenario, 'holdOrReturn');
      expect(delayed.character?.historyFlags).toContain(COURIER_CONSEQUENCE_MATRIX.find(({ id }) => id === scenario.id)!.negative);
      expect(delayed.character?.money).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps sealed correspondence closed unless the explicit open choice is made, and records the breach', () => {
    const sealed = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.filter(({ scenes }) => scenes.handling.choices.some(({ id }) => id === 'openSealedMessage'));
    expect(sealed.length).toBeGreaterThanOrEqual(5);
    for (const scenario of sealed) {
      let state = fresh(scenario);
      state = act(state, scenario, 'acceptDelivery');
      expect(state.run?.flags).not.toContain('courier_opened_message');
      state = act(state, scenario, 'keepSealedMessage');
      expect(state.character?.historyFlags).toContain('courier_kept_message_sealed');
      state = act(state, scenario, 'deliverAsKnown');
      const deliveryText = scenario.scenes.delivered.textVariants?.find(({ requirements }) => meets(requirements, state))?.text ?? scenario.scenes.delivered.text;
      expect(deliveryText).toContain('deliver the correspondence sealed');

      let opened = fresh(scenario);
      opened = act(opened, scenario, 'acceptDelivery');
      opened = act(opened, scenario, 'openSealedMessage');
      expect(opened.run?.flags).toContain('courier_opened_message');
      expect(opened.character?.historyFlags).toContain('opened_private_courier_letter');
      expect(scenario.scenes.opened.text).toContain('You open the correspondence.');
      expect(scenario.scenes.opened.text).toContain('do not establish the sender’s motive');
      opened = act(opened, scenario, 'concealOpening');
      expect(opened.character?.historyFlags).toContain('courier_concealed_confidentiality_breach');
    }
  });

  it('makes the signposted physical and informational hazards produce proportionate consequences', () => {
    const exposed = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.find(({ id }) => id === 'mailbag-at-milepost-nine')!;
    let state = fresh(exposed);
    state = act(state, exposed, 'acceptDelivery');
    state = act(state, exposed, 'carryNow');
    state = act(state, exposed, 'takeHazard');
    expect(state.run?.health).toBe(9);
    expect(state.character?.historyFlags).toContain('courier_took_signposted_hazard');

    let watcher = fresh(exposed);
    watcher = act(watcher, exposed, 'acceptDelivery');
    watcher = act(watcher, exposed, 'verifyOutside');
    watcher = act(watcher, exposed, 'confrontWatcher');
    expect(watcher.character?.historyFlags).toContain('courier_seen_by_message_interceptor');
  });

  it('charges only for an explicitly chosen duplicate dispatch and never permits a negative balance', () => {
    const scenario = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.find(({ id }) => id === 'the-wire-that-sang-twice')!;
    const poor = fresh(scenario);
    let blocked = act(poor, scenario, 'acceptDelivery');
    blocked = act(blocked, scenario, 'carryNow');
    expect(scenario.scenes.decision.choices.find(({ id }) => id === 'payForDuplicate')?.requirements?.minMoney).toBe(1);
    expect(meets(scenario.scenes.decision.choices.find(({ id }) => id === 'payForDuplicate')?.requirements, blocked)).toBe(false);
    let funded = fresh(scenario);
    funded.character!.money = 1;
    funded = act(funded, scenario, 'acceptDelivery');
    funded = act(funded, scenario, 'carryNow');
    funded = act(funded, scenario, 'payForDuplicate');
    expect(funded.character?.money).toBe(0);
    expect(funded.character?.historyFlags).toContain('courier_paid_to_duplicate_message');
  });

  it('damages the document tube only on the warned submerged shortcut and does not silently remove Gear', () => {
    const flood = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.find(({ id }) => id === 'paper-boat-at-high-water')!;
    let state = fresh(flood, 'waterproofLedgerTube');
    state = act(state, flood, 'acceptDelivery');
    state = act(state, flood, 'floodedShortcut');
    expect(state.character?.carriedItems).toContain('waterproofLedgerTube');
    expect(state.itemStates?.waterproofLedgerTube?.condition).toBe('DAMAGED');
    expect(state.character?.historyFlags).toContain('courier_packet_delayed_by_flood');
  });

  it('persists Knowledge, Lore, and History across save/resume without duplicate Knowledge', () => {
    const scenario = COURIER_MAIL_TELEGRAPH_GENRE_BATCH.find(({ id }) => id === 'station-mark-in-margin')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'acceptDelivery');
    state = act(state, scenario, 'verifyOutside');
    state = act(state, scenario, 'warnAndQualify');
    state = act(state, scenario, 'settleWarned');
    const factId = KNOWLEDGE_FACTS.telegraphRepeatConvention.id;
    expect(state.character?.knowledgeKeys).toContain(factId);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    const resumed = loadSave(storage as never);
    expect(resumed.character?.knowledgeKeys).toContain(factId);
    expect(resumed.character?.historyFlags).toContain('courier_stated_uncertainty_before_action');
  });

  it('lets the earlier Last Train Message remember a confidentiality breach', async () => {
    const { COMMUNICATION_ADVENTURES } = await import('./communicationBatch');
    const earlier = COMMUNICATION_ADVENTURES.find(({ id }) => id === 'the-last-train-message')!;
    const state = fresh(COURIER_MAIL_TELEGRAPH_GENRE_BATCH[0]);
    state.character!.historyFlags.push('opened_private_courier_letter');
    expect(sceneText(earlier.scenes.passengerDecision, state)).toContain('once opened private correspondence');
  });
});
