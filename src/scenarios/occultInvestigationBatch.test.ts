import { describe, expect, it } from 'vitest';
import { choose, itemState, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { classifyScenario } from '../scenarioDiversity';
import type { SaveData, Scenario } from '../types';
import { OCCULT_INVESTIGATION_ADVENTURES as adventures } from './occultInvestigationBatch';
import { SCENARIOS } from './index';
import { BROKEN_BELL } from './brokenBell';

function fresh(scenario: Scenario, item?: string, supplies: Record<string, number> = {}): SaveData {
  const character = newCharacter('Occult Tester');
  if (item) character.carriedItem = item;
  character.supplies = { ...supplies };
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}
function act(state: SaveData, scenario: Scenario, id: string, roll = 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((c) => c.id === id);
  if (!choice) throw new Error(`No ${scenario.title}.${scene.id}.${id}`);
  if (!meets(choice.requirements, state)) throw new Error(`Unavailable ${scenario.title}.${scene.id}.${id}`);
  return choose(state, scenario, choice, () => roll);
}
function roundTrip(state: SaveData): SaveData {
  let raw: string | null = null;
  const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; } };
  saveGame(state, storage);
  return loadSave(storage);
}
function linkTargets(scene: Scenario['scenes'][string]): string[] {
  return scene.choices.flatMap((c) => [c.next, c.chance?.successNext, c.chance?.failureNext, c.effects?.combat?.winNext, c.effects?.combat?.lossNext].filter((x): x is string => !!x));
}
function assertPlayableGraph(scenario: Scenario, item?: string, supplies: Record<string, number> = {}): void {
  const queue = [fresh(scenario, item, supplies)];
  const seen = new Set<string>();
  let steps = 0;
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, state.character?.supplies, state.itemStates]);
    if (seen.has(key)) continue;
    seen.add(key);
    const scene = scenario.scenes[run.sceneId];
    expect(scene, `${scenario.title}.${run.sceneId}`).toBeTruthy();
    if (run.status !== 'active' || scene.ending) continue;
    const available = scene.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${scene.id} available action`).toBeGreaterThan(0);
    for (const choice of available) for (const roll of [0, .999999]) {
      const next = choose(state, scenario, choice, () => roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active', `${scenario.title}.${scene.id}.${choice.id} advances`).toBe(false);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length);
      queue.push(next);
    }
    expect(++steps, scenario.title).toBeLessThan(1500);
  }
}

describe('occult investigation adventures', () => {
  it('registers 27 distinct new stories without adding the rejected bell duplicate', () => {
    expect(adventures).toHaveLength(27);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    expect(SCENARIOS).toHaveLength(445);
    expect(SCENARIOS.some((s) => s.title === 'The Bell That Rings Below')).toBe(false);
  });

  it('keeps every new graph forward-only, reachable, actionable, and within four choices', () => {
    for (const scenario of adventures) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id)) continue;
        reached.add(id);
        const scene = scenario.scenes[id];
        expect(scene, `${scenario.title}.${id}`).toBeTruthy();
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}.${id}`).toBeGreaterThan(0);
        expect(scene.choices.length, `${scenario.title}.${id} mobile choices`).toBeLessThanOrEqual(4);
        for (const text of [scene.text, ...(scene.textVariants ?? []).map((v) => v.text)]) expect(text.length, `${scenario.title}.${id} concise screen`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${scenario.title}.${id} mobile label`).toBeLessThanOrEqual(70);
        pending.push(...linkTargets(scene));
      }
      expect(reached.size, scenario.title).toBe(Object.keys(scenario.scenes).length);
      assertPlayableGraph(scenario);
    }
  });

  it('classifies a range of fraud, eerie, confirmed, and dungeon stories with seasonal metadata', () => {
    const byTitle = (title: string) => adventures.find((s) => s.title === title)!;
    expect(classifyScenario(byTitle('The Séance at Bellweather House')).fantasyDensity).toBe('AMBIGUOUS');
    expect(classifyScenario(byTitle('The Quiet Room')).fantasyDensity).toBe('EERIE');
    expect(classifyScenario(byTitle('The Red Chapel')).fantasyDensity).toBe('FANTASY_THREAT');
    expect(classifyScenario(byTitle('Below the Old Fort')).fantasyDensity).toBe('DUNGEON_FANTASY');
    expect(classifyScenario(byTitle('Below the Old Fort')).riskTier).toBe('SEVERE');
    expect(byTitle('The Red Chapel').diversity?.availability).toMatchObject({ season: 'OCTOBER', months: [10] });
  });

  it('lets a fresh traveler resolve the chalk-room route without occult supplies', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'studyChalk');
    expect(state.run?.sceneId).toBe('chalkPattern');
    expect(meets(scenario.scenes.chalkPattern.choices.find((c) => c.id === 'useChalkSupply')!.requirements, state)).toBe(false);
    expect(meets(scenario.scenes.chalkPattern.choices.find((c) => c.id === 'liftFloor')!.requirements, state)).toBe(true);
  });

  it('consumes one Ritual Chalk and preserves its changed quantity through a save snapshot', () => {
    const scenario = adventures.find((s) => s.id === 'red-chalk-circle')!;
    let state = fresh(scenario, undefined, { ritualChalk: 2 });
    state = act(state, scenario, 'studyChalk');
    state = act(state, scenario, 'useChalkSupply');
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.character?.supplies?.ritualChalk).toBe(1);
    expect(resumed.run?.sceneId).toBe('chalkCrawl');
    expect(resumed.run?.supplyNotice).toContain('2 → 1');
  });

  it('lets a survivor accept an optional Supply replenishment without blocking the ending when the stack is full', () => {
    const scenario = adventures.find((s) => s.id === 'the-red-chapel')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'warnVillage');
    state = act(state, scenario, 'holdNeighborsBack');
    expect(state.run?.sceneId).toBe('redChapelAfter');
    state = act(state, scenario, 'acceptChapelChalk');
    expect(state.character?.supplies?.ritualChalk).toBe(1);
    expect(state.run?.sceneId).toBe('redChapelLeave');

    let full = fresh(scenario, undefined, { ritualChalk: 4 });
    full = act(full, scenario, 'warnVillage');
    full = act(full, scenario, 'holdNeighborsBack');
    expect(meets(scenario.scenes.redChapelAfter.choices.find((c) => c.id === 'acceptChapelChalk')!.requirements, full)).toBe(false);
    full = act(full, scenario, 'declineChapelChalk');
    expect(full.run?.status).toBe('success');
    expect(full.character?.supplies?.ritualChalk).toBe(4);
  });

  it('offers scarce Salt on a year-round fresh-traveler route and consumes it only for the matching thread threat', () => {
    const scenario = adventures.find((s) => s.id === 'the-black-thread')!;
    let state = fresh(scenario);
    const offer = scenario.scenes.blackThreadStreet.choices.find((c) => c.id === 'takeThreadSalt')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, scenario, 'takeThreadSalt');
    expect(state.character?.supplies).toEqual({ consecratedSalt: 1 });
    expect(state.run?.sceneId).toBe('threadWitness');
    state = roundTrip(state);
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.sceneId).toBe('threadWitness');
    state = act(state, scenario, 'findTailorYard');
    state = act(state, scenario, 'inspectRing');
    state = act(state, scenario, 'useSaltThread');
    expect(state.character?.supplies?.consecratedSalt).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('1 → 0');
    const resumed = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(resumed.character?.supplies?.consecratedSalt).toBeUndefined();
    expect(resumed.run?.sceneId).toBe('threadAfter');

    let full = fresh(scenario, undefined, { consecratedSalt: 3 });
    expect(meets(offer.requirements, full)).toBe(false);
    full = act(full, scenario, 'traceThread');
    expect(full.run?.sceneId).toBe('threadTailor');
  });

  it('offers two marked Nails without prior state, preserves the no-supply route, and consumes them explicitly at the arch', () => {
    const scenario = adventures.find((s) => s.id === 'house-with-two-cellars')!;
    let state = fresh(scenario);
    const offer = scenario.scenes.twoCellars.choices.find((c) => c.id === 'takeMarkedNailsAndDescend')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, scenario, 'takeMarkedNailsAndDescend');
    expect(state.character?.supplies).toEqual({ coldIronNails: 2 });
    expect(state.run?.sceneId).toBe('cellarLanding');
    const saved = roundTrip(state);
    expect(saved.character?.supplies?.coldIronNails).toBe(2);
    expect(saved.run?.sceneId).toBe('cellarLanding');
    state = act(state, scenario, 'nailArch');
    expect(state.character?.supplies?.coldIronNails).toBeUndefined();
    expect(state.run?.supplyNotice).toContain('2 → 0');

    let full = fresh(scenario, undefined, { coldIronNails: 6 });
    expect(meets(offer.requirements, full)).toBe(false);
    full = act(full, scenario, 'descendTwoCellars');
    expect(full.run?.sceneId).toBe('cellarLanding');
    expect(meets(scenario.scenes.cellarLanding.choices.find((c) => c.id === 'nailArch')!.requirements, full)).toBe(true);
  });

  it('offers one optional Consecrated Salt from the injured priest without making it a universal answer', () => {
    let state = fresh(BROKEN_BELL);
    state.run!.sceneId = 'priestFarewell';
    const offer = BROKEN_BELL.scenes.priestFarewell.choices.find(({ id }) => id === 'takeThresholdSalt')!;
    expect(meets(offer.requirements, state)).toBe(true);
    state = act(state, BROKEN_BELL, 'takeThresholdSalt');
    expect(state.character?.supplies?.consecratedSalt).toBe(1);
    expect(state.run?.sceneId).toBe('burialApproach');
    expect(BROKEN_BELL.scenes.priestFarewell.text).toMatch(/keeper is not mine to command/i);
    const full = fresh(BROKEN_BELL, undefined, { consecratedSalt: 3 });
    full.run!.sceneId = 'priestFarewell';
    expect(meets(offer.requirements, full)).toBe(false);
  });

  it('uses the existing Grave Token and Yew Charm for narrow discoveries, not universal protection', () => {
    const box = adventures.find((s) => s.id === 'the-bone-box')!;
    let state = fresh(box, 'graveCoin');
    state = act(state, box, 'inspectBox');
    expect(meets(box.scenes.boneBoxMarks.choices.find((c) => c.id === 'tokenBox')!.requirements, state)).toBe(true);
    state = act(state, box, 'tokenBox');
    expect(state.run?.sceneId).toBe('boneBoxToken');

    const barrow = adventures.find((s) => s.id === 'the-barrow-door')!;
    let plain = fresh(barrow);
    plain = act(plain, barrow, 'followPrints');
    expect(meets(barrow.scenes.barrowHall.choices.find((c) => c.id === 'yewAtThreshold')!.requirements, plain)).toBe(false);
    let warded = fresh(barrow, 'yewCharm');
    warded = act(warded, barrow, 'followPrints');
    expect(meets(barrow.scenes.barrowHall.choices.find((c) => c.id === 'yewAtThreshold')!.requirements, warded)).toBe(true);
  });

  it('awards the lantern Spirit Glass upgrade from the glazier with provenance', () => {
    const scenario = adventures.find((s) => s.id === 'the-widows-mirror')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'inspectBacking');
    state = act(state, scenario, 'askMason');
    expect(meets(scenario.scenes.mirrorMason.choices.find((c) => c.id === 'fitSpiritGlass')!.requirements, state)).toBe(true);
    state = act(state, scenario, 'fitSpiritGlass');
    expect(itemState(state, 'lantern').upgrades).toContainEqual(expect.objectContaining({ id: 'spiritGlass' }));
    expect(itemState(state, 'lantern').provenance).toContain('Fitted by the glazier after examining the widow’s mirror');

    const crossing = adventures.find((s) => s.id === 'lantern-at-the-crossing')!;
    let equipped = fresh(crossing);
    equipped.itemStates ??= {};
    equipped.itemStates.lantern = { condition: 'NORMAL', upgrades: [{ id: 'spiritGlass', provenance: 'Glazier' }], provenance: ['Glazier'] };
    equipped = act(equipped, crossing, 'watchCrossing');
    expect(meets(crossing.scenes.crossingMarks.choices.find((c) => c.id === 'useSpiritGlass')!.requirements, equipped)).toBe(true);
  });

  it('supports a dungeon retreat, a supernatural confrontation, and a foreshadowed lethal failure', () => {
    const fort = adventures.find((s) => s.id === 'below-the-old-fort')!;
    let retreat = act(fresh(fort), fort, 'retreatFort');
    expect(retreat.run?.sceneId).toBe('fortExit');
    let survive = fresh(fort);
    survive = act(survive, fort, 'enterBarracks');
    survive = act(survive, fort, 'crossQuietly');
    survive = act(survive, fort, 'breakLampAnchor');
    expect(survive.run?.status).toBe('success');

    const red = adventures.find((s) => s.id === 'the-red-chapel')!;
    let danger = fresh(red);
    danger = act(danger, red, 'enterChapel');
    danger = act(danger, red, 'severCircle', .99);
    expect(danger.run?.status).toBe('death');
    expect(danger.run?.sceneId).toBe('redChapelDeath');
  });
});
