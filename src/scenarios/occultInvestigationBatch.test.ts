import { describe, expect, it } from 'vitest';
import { choose, itemState, meets, newCharacter, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { classifyScenario } from '../scenarioDiversity';
import type { SaveData, Scenario } from '../types';
import { OCCULT_INVESTIGATION_ADVENTURES as adventures } from './occultInvestigationBatch';
import { SCENARIOS } from './index';

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
    expect(SCENARIOS).toHaveLength(214);
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
