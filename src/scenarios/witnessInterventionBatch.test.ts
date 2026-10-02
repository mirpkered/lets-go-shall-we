import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, runText, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { renderQaPanel } from '../qaPanel';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { BEAR_WITH_ME, GIVE_ME_WHATCHA_GOT, SCENARIOS, SILENT_NIGHT } from './index';
import type { SaveData, Scenario } from '../types';

const BATCH: Scenario[] = [SILENT_NIGHT, BEAR_WITH_ME, GIVE_ME_WHATCHA_GOT];

function start(scenario: Scenario, selections: Record<string, string> = {}, carriedItem: string | null = null, money = 0): SaveData {
  const character = newCharacter('Witness Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  const state: SaveData = { ...structuredClone(EMPTY_SAVE), bank: ['brassCandlestick'], character, run: startRun(character, scenario, () => 0) };
  state.run!.randomSelections = { ...state.run!.randomSelections, ...selections };
  return state;
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, random = () => 0): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice?.requirements, state)).toBe(true);
  return choose(state, scenario, choice!, random);
}

function explore(scenario: Scenario, selections: Record<string, string>, item: string | null = null, money = 0): number {
  const queue = [start(scenario, selections, item, money)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} has an available action`).toBeGreaterThan(0);
    expect(available.length, `${scenario.title}.${scene.id} fits four-button layout`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      for (const roll of choice.chance || choice.effects?.combat ? [0, 0.999999] : [0]) {
        queue.push(choose(state, scenario, choice, () => roll));
      }
    }
    expect(seen.size).toBeLessThan(20_000);
  }
  return seen.size;
}

function combinations(scenario: Scenario): Record<string, string>[] {
  return (scenario.runRandomSelections ?? []).reduce<Record<string, string>[]>((out, selection) =>
    out.flatMap((base) => selection.values.map(({ value }) => ({ ...base, [selection.id]: value }))), [{}]);
}

describe('witness and intervention scenario batch', () => {
  it('registers all three adventures and exposes QA launch controls', () => {
    expect(SCENARIOS).toHaveLength(237);
    expect(BATCH.map(({ title }) => title)).toEqual(['Silent Night?', 'Bear with Me', 'Give Me Whatcha Got']);
    const names = BATCH.flatMap((scenario) => (scenario.runRandomSelections ?? [])
      .filter(({ id }) => /^(guest|innkeeper|camper|robber|patron)$/i.test(id))
      .flatMap(({ values }) => values.map(({ value }) => value)));
    expect(new Set(names).size).toBe(names.length);
    const qa = renderQaPanel(true, structuredClone(EMPTY_SAVE), SCENARIOS, ITEMS);
    for (const scenario of BATCH) expect(qa).toContain(`data-qa-start="${scenario.id}"`);
    for (const scenario of BATCH) expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
  });

  it('keeps every randomized active branch forward-only, actionable, and within four choices', () => {
    for (const selections of combinations(SILENT_NIGHT)) {
      expect(explore(SILENT_NIGHT, selections), SILENT_NIGHT.title).toBeGreaterThan(0);
      expect(explore(SILENT_NIGHT, selections, 'fieldBandageRoll'), SILENT_NIGHT.title).toBeGreaterThan(0);
    }
    for (const selections of combinations(BEAR_WITH_ME)) {
      expect(explore(BEAR_WITH_ME, selections), BEAR_WITH_ME.title).toBeGreaterThan(0);
      expect(explore(BEAR_WITH_ME, selections, 'trailWhistle'), BEAR_WITH_ME.title).toBeGreaterThan(0);
      expect(explore(BEAR_WITH_ME, selections, 'fieldBandageRoll'), BEAR_WITH_ME.title).toBeGreaterThan(0);
    }
    for (const selections of combinations(GIVE_ME_WHATCHA_GOT)) {
      expect(explore(GIVE_ME_WHATCHA_GOT, selections), GIVE_ME_WHATCHA_GOT.title).toBeGreaterThan(0);
      expect(explore(GIVE_ME_WHATCHA_GOT, selections, 'pocketToolkit', 8), GIVE_ME_WHATCHA_GOT.title).toBeGreaterThan(0);
    }
  }, 60_000);

  it('allows harmless sleep and informed, risky intervention in Silent Night?', () => {
    const quiet = start(SILENT_NIGHT, { argument: 'drunken', escalation: 'settles' });
    const slept = act(quiet, SILENT_NIGHT, 'wakingInnocently', 'ignoreArgument');
    expect(sceneText(SILENT_NIGHT.scenes.morningAfterSleep, slept)).toContain('argument appears to have ended');
    expect(slept.character?.historyFlags).toContain('slept_through_inn_incident');

    let informed = start(SILENT_NIGHT, { argument: 'threat', escalation: 'fatality', guest: 'Cyrilla' });
    informed = act(informed, SILENT_NIGHT, 'wakingInnocently', 'listenFromBed');
    expect(sceneText(SILENT_NIGHT.scenes.listeningAtDoor, informed)).toContain('more serious than noise');
    informed = act(informed, SILENT_NIGHT, 'listeningAtDoor', 'sleepAfterListening');
    expect(sceneText(SILENT_NIGHT.scenes.morningAfterHearing, informed)).toContain('a guest died');

    let calmed = start(SILENT_NIGHT, { argument: 'drunken' });
    calmed = act(calmed, SILENT_NIGHT, 'wakingInnocently', 'askForQuiet');
    calmed = act(calmed, SILENT_NIGHT, 'quietRequest', 'calmRequest', () => 0);
    expect(calmed.run?.sceneId).toBe('argumentCools');

    let worsened = start(SILENT_NIGHT, { argument: 'threat' }, 'fieldBandageRoll');
    worsened = act(worsened, SILENT_NIGHT, 'wakingInnocently', 'goSee');
    expect(sceneText(SILENT_NIGHT.scenes.commonRoom, worsened)).toContain('small knife is visible');
    worsened = act(worsened, SILENT_NIGHT, 'commonRoom', 'speakFromDoor', () => 0.999999);
    expect(worsened.run?.sceneId).toBe('tempersRise');
    worsened = act(worsened, SILENT_NIGHT, 'tempersRise', 'separateEscalated', () => 0.999999);
    expect(worsened.run?.sceneId).toBe('knifeInjury');
    expect(worsened.run?.health).toBe(5);
    worsened = act(worsened, SILENT_NIGHT, 'knifeInjury', 'bandageInnWound');
    expect(worsened.run?.inventory).not.toContain('fieldBandageRoll');
    expect(worsened.run?.sceneId).toBe('morningAfterInjury');
  });

  it('supports distant warnings, uncertain bear behavior, and informed crossing choices', () => {
    let quiet = start(BEAR_WITH_ME, { bearEvent: 'quiet' });
    quiet = act(quiet, BEAR_WITH_ME, 'campAcrossWater', 'tendOwnFire');
    expect(sceneText(BEAR_WITH_ME.scenes.eveningAtCamp, quiet)).not.toContain('bear comes out');
    quiet = act(quiet, BEAR_WITH_ME, 'eveningAtCamp', 'quietEvening');
    expect(quiet.run?.status).toBe('success');

    let warned = start(BEAR_WITH_ME, { bearEvent: 'approach', bearMood: 'wary', camperFate: 'injured' });
    warned = act(warned, BEAR_WITH_ME, 'campAcrossWater', 'waveAcross');
    expect(sceneText(BEAR_WITH_ME.scenes.eveningAtCamp, warned)).toContain('cannot reach them directly');
    warned = act(warned, BEAR_WITH_ME, 'eveningAtCamp', 'shoutWarning', () => 0);
    expect(warned.run?.sceneId).toBe('bearHesitates');
    expect(warned.character?.historyFlags).toContain('warned_camper_of_bear');

    let ignored = start(BEAR_WITH_ME, { bearEvent: 'approach', bearMood: 'unbothered', camperFate: 'killed', crossing: 'ford' });
    ignored = act(ignored, BEAR_WITH_ME, 'campAcrossWater', 'callAcross');
    ignored = act(ignored, BEAR_WITH_ME, 'eveningAtCamp', 'stayAtCamp');
    expect(sceneText(BEAR_WITH_ME.scenes.bearAdvances, ignored)).toContain('cannot tell whether');
    ignored = act(ignored, BEAR_WITH_ME, 'bearAdvances', 'callAfterBear');
    expect(sceneText(BEAR_WITH_ME.scenes.callingAcross, ignored)).toContain('does not tell you whether the camper is dead');
    ignored = act(ignored, BEAR_WITH_ME, 'callingAcross', 'searchAfterCall');
    ignored = act(ignored, BEAR_WITH_ME, 'crossingSearch', 'crossFord', () => 0);
    expect(sceneText(BEAR_WITH_ME.scenes.reachedCamper, ignored)).toContain('did not survive');
    expect(ignored.character?.historyFlags).toContain('crossed_to_far_bank_after_bear_attack');

    let rescued = start(BEAR_WITH_ME, { bearEvent: 'approach', camperFate: 'injured', crossing: 'ford' });
    rescued = act(rescued, BEAR_WITH_ME, 'campAcrossWater', 'callAcross');
    rescued = act(rescued, BEAR_WITH_ME, 'eveningAtCamp', 'stayAtCamp');
    rescued = act(rescued, BEAR_WITH_ME, 'bearAdvances', 'searchAfterBear');
    rescued = act(rescued, BEAR_WITH_ME, 'crossingSearch', 'crossFord', () => 0);
    rescued = act(rescued, BEAR_WITH_ME, 'reachedCamper', 'guideInjuredCamper');
    expect(rescued.character?.historyFlags).toContain('crossed_water_for_injured_camper');

    let drowned = start(BEAR_WITH_ME, { bearEvent: 'approach', camperFate: 'injured', crossing: 'noFord' });
    drowned = act(drowned, BEAR_WITH_ME, 'campAcrossWater', 'callAcross');
    drowned = act(drowned, BEAR_WITH_ME, 'eveningAtCamp', 'stayAtCamp');
    drowned = act(drowned, BEAR_WITH_ME, 'bearAdvances', 'searchAfterBear');
    drowned = act(drowned, BEAR_WITH_ME, 'crossingSearch', 'riskTheSwim', () => 0.999999);
    expect(sceneText(BEAR_WITH_ME.scenes.sweptDownstream, drowned)).toContain('your strength is failing');
    drowned = act(drowned, BEAR_WITH_ME, 'sweptDownstream', 'pushAgainstCurrent', () => 0.999999);
    expect(drowned.run?.status).toBe('death');
  });

  it('makes compliance, concealment, calming, and armed resistance distinct robbery choices', () => {
    const bank = ['brassCandlestick'];
    let compliant = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'nervous' }, 'pocketToolkit', 8);
    compliant.bank = [...bank];
    compliant = act(compliant, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'complyWithRobbers');
    expect(meets({ maxMoney: 0 }, compliant)).toBe(false);
    compliant = act(compliant, GIVE_ME_WHATCHA_GOT, 'cashTaken', 'handOverMoney');
    expect(compliant.character?.money).toBe(0);
    compliant = act(compliant, GIVE_ME_WHATCHA_GOT, 'afterCashDemand', 'giveItemToNervousCrew');
    expect(compliant.character?.carriedItem).toBeNull();
    expect(compliant.bank).toEqual(bank);
    expect(compliant.character?.historyFlags).toContain('lost_property_to_robbers');

    let concealedCash = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'controlled' }, 'pocketToolkit', 8);
    concealedCash.bank = [...bank];
    concealedCash = act(concealedCash, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'complyWithRobbers');
    concealedCash = act(concealedCash, GIVE_ME_WHATCHA_GOT, 'cashTaken', 'hideMoney', () => 0);
    expect(concealedCash.character?.money).toBe(8);
    expect(concealedCash.character?.historyFlags).toContain('concealed_property_during_robbery');
    expect(concealedCash.bank).toEqual(bank);

    let lostItem = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'nervous' }, 'pocketToolkit', 5);
    lostItem.bank = [...bank];
    lostItem = act(lostItem, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'complyWithRobbers');
    lostItem = act(lostItem, GIVE_ME_WHATCHA_GOT, 'cashTaken', 'hideCarriedItem', () => 0.999999);
    expect(lostItem.run?.sceneId).toBe('caughtHidingItem');
    expect(sceneText(GIVE_ME_WHATCHA_GOT.scenes.caughtHidingItem, lostItem)).toContain('takes it from you');
    expect(lostItem.character?.carriedItem).toBeNull();
    expect(lostItem.bank).toEqual(bank);

    let fresh = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'controlled' });
    expect(meets({ maxMoney: 0 }, fresh)).toBe(true);
    fresh = act(fresh, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'complyWithRobbers');
    fresh = act(fresh, GIVE_ME_WHATCHA_GOT, 'cashTaken', 'noMoneyToHandOver');
    fresh = act(fresh, GIVE_ME_WHATCHA_GOT, 'afterCashDemand', 'stayVisibleToRobbers');
    expect(fresh.run?.status).toBe('success');
    expect(fresh.bank).toEqual(['brassCandlestick']);

    let intervene = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'nervous', patronMove: 'bolts' });
    intervene = act(intervene, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'steadyPatron', () => 0.999999);
    intervene = act(intervene, GIVE_ME_WHATCHA_GOT, 'patronPanics', 'pullPatronDown', () => 0);
    expect(intervene.run?.sceneId).toBe('briefOpening');
    intervene = act(intervene, GIVE_ME_WHATCHA_GOT, 'briefOpening', 'rushArmedRobber', () => 0.999999);
    expect(intervene.run?.status).toBe('death');

    let shot = start(GIVE_ME_WHATCHA_GOT, { crewStyle: 'controlled', gunOutcome: 'patronKilled' });
    shot = act(shot, GIVE_ME_WHATCHA_GOT, 'bankRobbery', 'steadyPatron', () => 0.999999);
    shot = act(shot, GIVE_ME_WHATCHA_GOT, 'patronPanics', 'callPatronBack', () => 0.999999);
    expect(sceneText(GIVE_ME_WHATCHA_GOT.scenes.gunshotInBank, shot)).toContain('They fall and do not move');
  });

  it('persists selected people, incident conditions, and robbery behavior through save/resume', () => {
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) };
    for (const scenario of BATCH) {
      const state = start(scenario);
      saveGame(state, storage as unknown as Storage);
      expect(loadSave(storage as unknown as Storage).run?.randomSelections).toEqual(state.run?.randomSelections);
    }
    const state = start(GIVE_ME_WHATCHA_GOT, { robber: 'Mirek', crewStyle: 'nervous', patron: 'Jory' });
    expect(runText('{{robber}} and {{patron}}', JSON.parse(JSON.stringify(state)) as SaveData)).toBe('Mirek and Jory');
  });

  it('keeps authored prose and controls compact for phone screens', () => {
    for (const scenario of BATCH) {
      const longestNames = Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => [id, values.map(({ value }) => value).sort((a, b) => b.length - a.length)[0]]));
      for (const scene of Object.values(scenario.scenes)) {
        for (const copy of [scene.text, ...(scene.textVariants ?? []).map(({ text }) => text)]) {
          const rendered = runText(copy, { run: { randomSelections: longestNames } } as SaveData);
          expect(rendered.length, `${scenario.title}.${scene.id} copy`).toBeLessThanOrEqual(420);
          expect(rendered).not.toContain('{{');
        }
        for (const choice of scene.choices) {
          expect(choice.label.length, `${scenario.title}.${scene.id}.${choice.id}`).toBeLessThanOrEqual(70);
          if (choice.hint) expect(choice.hint.length, `${scenario.title}.${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
        }
      }
    }
  });
});
