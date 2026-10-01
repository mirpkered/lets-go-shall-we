import { describe, expect, it } from 'vitest';
import { choose, eligibleCarryItems, meets, newCharacter, runText, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { loadSave, saveGame, SAVE_KEY } from '../storage';
import { renderQaPanel } from '../qaPanel';
import type { Choice, SaveData } from '../types';
import { SCENARIOS } from './index';
import { HUSH_NOW } from './hushNow';

function fresh(carriedItem: string | null = null): SaveData {
  const character = newCharacter('Hush Tester');
  character.carriedItem = carriedItem;
  return { version: 1, bank: [], character, run: startRun(character, HUSH_NOW, () => 0) };
}

function act(state: SaveData, id: string, roll = 0): SaveData {
  const scene = HUSH_NOW.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scene.id} offers ${id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${id} requirements`).toBe(true);
  return choose(state, HUSH_NOW, choice!, () => roll);
}

function options(state: SaveData): Choice[] {
  return HUSH_NOW.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

function explore(initial: SaveData): SaveData[] {
  const pending = [initial];
  const reached: SaveData[] = [];
  const seen = new Set<string>();
  while (pending.length) {
    const state = pending.pop()!;
    const run = state.run!;
    const key = JSON.stringify({ scene: run.sceneId, health: run.health, inventory: run.inventory, flags: run.flags, time: run.elapsedMinutes });
    if (seen.has(key)) continue;
    seen.add(key);
    reached.push(state);
    if (run.status !== 'active') continue;
    const available = options(state);
    expect(available.length, `reachable active scene ${run.sceneId} at ${run.elapsedMinutes} minutes`).toBeGreaterThan(0);
    expect(available.length, `${run.sceneId} action count`).toBeLessThanOrEqual(4);
    for (const choice of available) {
      if (choice.chance || choice.effects?.combat) {
        pending.push(choose(state, HUSH_NOW, choice, () => 0));
        pending.push(choose(state, HUSH_NOW, choice, () => 0.999));
      } else pending.push(choose(state, HUSH_NOW, choice, () => 0));
    }
  }
  return reached;
}

describe('Hush Now structural rewrite', () => {
  it('is registered for random selection and direct QA launch', () => {
    expect(SCENARIOS).toContain(HUSH_NOW);
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, SCENARIOS, ITEMS)).toContain('Start Hush Now');
    expect(renderQaPanel(false, empty, SCENARIOS, ITEMS)).toBe('');
  });

  it('establishes the hired-help context and a usable farm map before asking for action', () => {
    const state = fresh();
    const opening = sceneText(HUSH_NOW.scenes.farmhouseArrival, state);
    expect(opening).toMatch(/hired.*mending a sheep-pen gate/i);
    expect(opening).toMatch(/farmhouse.*west.*yard/i);
    expect(opening).toMatch(/stable.*north/i);
    expect(opening).toMatch(/sheep pen.*south/i);
    expect(opening).toMatch(/pasture slopes east.*drainage cut/i);
    expect(opening).toMatch(/west gate opens to the road/i);
    expect(opening).toMatch(/worked together since noon/i);
    expect(opening).not.toMatch(/heifer|loose rail|pinned|injury/i);
    expect(state.run?.randomSelections?.farmOwner).toBeTruthy();
    expect(state.run?.randomSelections?.farmChild).toBeTruthy();
    expect(state.run?.randomSelections?.farmhand).toBeTruthy();
    expect(new Set(Object.values(state.run!.randomSelections!)).size).toBe(3);
  });

  it('keeps every Hush Now scene and choice inside the shared phone-copy budget', () => {
    const longestNames = Object.fromEntries((HUSH_NOW.runRandomSelections ?? []).map(({ id, values }) => [
      id, values.map((entry) => entry.value).sort((a, b) => b.length - a.length)[0] ?? '',
    ]));
    const state = { run: { randomSelections: longestNames } } as SaveData;
    const copy = Object.values(HUSH_NOW.scenes).flatMap((scene) => [
      { scene: scene.id, kind: 'scene text', text: scene.text },
      ...(scene.textVariants ?? []).map((variant) => ({ scene: scene.id, kind: 'variant', text: variant.text })),
      ...scene.choices.map((choice) => ({ scene: scene.id, kind: `choice ${choice.id}`, text: `${choice.label}${choice.hint ? ` — ${choice.hint}` : ''}` })),
    ]).map((entry) => ({ ...entry, text: runText(entry.text, state) }));
    const longest = copy.sort((a, b) => b.text.length - a.text.length)[0];
    expect(longest.text.length, `${longest.scene} ${longest.kind}: ${longest.text}`).toBeLessThanOrEqual(460);
  });

  it('keeps names stable through serialization and moves old active saves through a safe transition', () => {
    const state = fresh();
    const selectedNames = state.run?.randomSelections;
    const savedValues = new Map<string, string>();
    const storage = { getItem: (key: string) => savedValues.get(key) ?? null, setItem: (key: string, value: string) => savedValues.set(key, value) };
    saveGame(state, storage);
    const saved = loadSave(storage);
    expect(saved.run?.randomSelections).toEqual(selectedNames);
    expect(saved.run?.visitedSceneIds).toEqual(['farmhouseArrival']);

    const oldRun = { ...startRun(state.character!, HUSH_NOW, () => 0), scenarioSaveVersion: 0, sceneId: 'neighborLiftsNell', health: 6, inventory: ['smallKnife', 'lantern', 'travelRope'], flags: ['hasClapper'], visitedSceneIds: ['farmhouseArrival', 'personFound', 'neighborLiftsNell'] };
    const values = new Map([[SAVE_KEY, JSON.stringify({ version: 1, bank: ['graveCoin'], character: state.character, run: oldRun })]]);
    const migrated = loadSave({ getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
    expect(migrated.run?.sceneId).toBe('legacyRescue');
    expect(migrated.run?.health).toBe(6);
    expect(migrated.run?.inventory).toContain('travelRope');
    expect(migrated.run?.flags).toContain('hasClapper');
    expect(migrated.run?.elapsedMinutes).toBe(0);
    expect(migrated.run?.randomSelections).toMatchObject({ farmOwner: 'Mara', farmChild: 'Ben', farmhand: 'Nell' });
    expect(migrated.run?.visitedSceneIds).toContain('legacyRescue');
    expect(migrated.bank).toEqual(['graveCoin']);
  });

  it('allows a fresh, broke character to find and free the worker with employer-provided equipment', () => {
    let state = act(fresh(), 'askOwner');
    state = act(state, 'searchWithOwner');
    state = act(state, 'followTracks');
    state = act(state, 'approachCut');
    state = act(state, 'climbDownFromBank');
    expect(state.run?.sceneId).toBe('workerFound');
    expect(options(state).map((choice) => choice.id)).toContain('liftRailTogether');
    state = act(state, 'liftRailTogether');
    state = act(state, 'takeWorkerHome');
    state = act(state, 'acceptFarmReward');
    state = act(state, 'acceptGateHook');
    expect(state.run?.sceneId).toBe('safeEnding');
    expect(state.run?.status).toBe('success');
    expect(state.character?.money).toBe(0);
    expect(eligibleCarryItems(state)).toContain('gateHook');
  });

  it('gives the Foreman’s Multi-tool only its plausible small-fastener use, not pry-bar leverage', () => {
    let state = act(fresh('foremanMultiTool'), 'lookIntoYard');
    state = act(state, 'followTracks');
    state = act(state, 'approachCut');
    state = act(state, 'climbDownFromBank');
    const visible = options(state).map((choice) => choice.id);
    expect(visible).toContain('turnPinWithMultiTool');
    expect(visible).not.toContain('liftRailWithFarmBar');
    expect(HUSH_NOW.scenes.workerFound.choices.find((choice) => choice.id === 'turnPinWithMultiTool')?.hint).toMatch(/loosens this small pin/i);
    expect(HUSH_NOW.scenes.workerFound.textVariants?.find((variant) => variant.requirements.items?.includes('foremanMultiTool'))?.text).toMatch(/not strong or long enough to lever/i);
    state = act(state, 'turnPinWithMultiTool');
    expect(state.run?.sceneId).toBe('workerFreed');
  });

  it('uses rope, a purpose-built pry tool, and light in concrete ways', () => {
    const ropeRoute = fresh('travelRope');
    let rope = act(ropeRoute, 'lookIntoYard');
    rope = act(rope, 'followTracks');
    rope = act(rope, 'approachCut');
    expect(options(rope).map((choice) => choice.id)).toContain('ropeDownToRail');
    expect(HUSH_NOW.scenes.workerFound.choices.find((choice) => choice.id === 'raiseRailWithRope')?.hint).toMatch(/oak.*anchor/i);

    let pry = act(fresh('foldingPryTool'), 'lookIntoYard');
    pry = act(pry, 'followTracks');
    pry = act(pry, 'approachCut');
    pry = act(pry, 'climbDownFromBank');
    expect(options(pry).map((choice) => choice.id)).toContain('leverRailWithPryTool');

    expect(sceneText(HUSH_NOW.scenes.bankSearch, fresh())).toMatch(/loose sheep-gate rail.*rain cape/i);
    expect(sceneText(HUSH_NOW.scenes.bankSearch, fresh('minerHeadlamp'))).toMatch(/your light shows/i);
  });

  it('uses a bandage only for the explicitly superficial palm scrape', () => {
    const state = fresh('fieldBandageRoll');
    expect(HUSH_NOW.scenes.workerFreed.text).toMatch(/shallow scrape on one palm/i);
    expect(HUSH_NOW.scenes.workerFreed.choices.find((choice) => choice.id === 'wrapWorkerScrape')?.hint).toMatch(/not treat the sore ankle/i);
    let rescue = act(state, 'lookIntoYard');
    rescue = act(rescue, 'followTracks');
    rescue = act(rescue, 'approachCut');
    rescue = act(rescue, 'climbDownFromBank');
    rescue = act(rescue, 'liftRailByHand');
    const bandaged = act(rescue, 'wrapWorkerScrape');
    expect(bandaged.run?.inventory).not.toContain('fieldBandageRoll');
    expect(bandaged.run?.flags).toContain('scrapeWrapped');
    expect(HUSH_NOW.scenes.aftercare.textVariants?.find((variant) => variant.requirements.flags?.includes('scrapeWrapped'))?.text).toMatch(/bandage did not treat it/i);
  });

  it('keeps the incident uncertain until observed and lets the traveler leave without omniscient narration', () => {
    const opening = sceneText(HUSH_NOW.scenes.farmhouseArrival, fresh());
    expect(opening).not.toMatch(/heifer|drainage cut.*worker|gate rail.*fallen/i);
    const yard = act(fresh(), 'lookIntoYard');
    expect(sceneText(HUSH_NOW.scenes.yardInspection, yard)).toMatch(/heifer’s stall.*empty/i);
    expect(HUSH_NOW.scenes.walkAwayEnding.text).toMatch(/do not know whether/i);
    const left = act(fresh(), 'leaveNow');
    expect(left.run?.status).toBe('success');
    expect(left.run?.sceneId).toBe('walkAwayEnding');
  });

  it('advances risky failures into useful consequence scenes and preserves a rescue option', () => {
    let state = act(fresh(), 'lookIntoYard');
    state = act(state, 'callTowardCut', 0.999);
    expect(state.run?.sceneId).toBe('looseHeifer');
    expect(options(state).map((choice) => choice.id)).toContain('letOwnerHandleHeifer');

    let fall = act(fresh(), 'lookIntoYard');
    fall = act(fall, 'followTracks');
    fall = act(fall, 'approachCut');
    fall.run!.health = 1;
    fall = act(fall, 'climbDownFromBank', 0.999);
    expect(fall.run?.status).toBe('death');
    expect(fall.run?.sceneId).toBe('__death');
  });

  it('keeps story geography explicit when moving from house to yard, pasture, and bank', () => {
    expect(HUSH_NOW.scenes.yardInspection.text).toMatch(/step east.*farmhouse.*yard/i);
    expect(HUSH_NOW.scenes.pastureSearch.text).toMatch(/move east.*farmhouse and stable behind/i);
    expect(HUSH_NOW.scenes.bankSearch.text).toMatch(/firm ground below the oak/i);
    expect(HUSH_NOW.scenes.helpArrives.text).toMatch(/joins you on the north bank/i);
    expect(HUSH_NOW.scenes.workerFreed.text).toMatch(/climb the slope to firm ground/i);
    expect(HUSH_NOW.scenes.aftercare.text).toMatch(/at the farmhouse/i);
  });

  it('has a forward-only graph and no reachable active zero-action scene for fresh and geared characters', () => {
    expect(findScenarioGraphProblems(HUSH_NOW)).toEqual([]);
    for (const carried of [null, 'travelRope', 'foremanMultiTool', 'foldingPryTool', 'ratCatchersHook', 'minerHeadlamp', 'farmWhistle', 'fieldBandageRoll']) {
      const reached = explore(fresh(carried));
      expect(reached.length).toBeGreaterThan(10);
      for (const state of reached) {
        const visited = state.run?.visitedSceneIds ?? [];
        expect(new Set(visited).size).toBe(visited.length);
        expect(Boolean(HUSH_NOW.scenes[state.run!.sceneId].choices.length) || state.run?.status !== 'active').toBe(true);
      }
    }

    let forcedGear = act(fresh(), 'lookIntoYard');
    forcedGear = act(forcedGear, 'followTracks');
    forcedGear = act(forcedGear, 'approachCut');
    forcedGear = act(forcedGear, 'climbDownFromBank');
    forcedGear.run!.inventory.push(...Object.values(ITEMS).filter((item) => item.carryable).map((item) => item.id));
    forcedGear.run!.flags.push('adultHelperPresent', 'hasFarmBar');
    expect(options(forcedGear).length, 'QA force-added gear must not overflow the action grid').toBeLessThanOrEqual(4);
  });
});
