import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startAdventure, startRun, timeStatus } from '../engine';
import { ITEMS } from '../items';
import { renderQaPanel } from '../qaPanel';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { selectScenario } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { TAKING_ON_WATER } from './takingOnWater';
import type { Choice, SaveData } from '../types';

function fresh(carriedItem: string | null = null, money = 0, lakeRoll = 0): SaveData {
  const character = newCharacter('Lake Tester');
  character.carriedItem = carriedItem;
  character.money = money;
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, TAKING_ON_WATER, () => lakeRoll) };
}

function act(state: SaveData, choiceId: string, roll = 0): SaveData {
  const scene = TAKING_ON_WATER.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scene.id} has choice ${choiceId}`).toBeDefined();
  expect(meets(choice!.requirements, state), `${scene.id}.${choiceId} is available`).toBe(true);
  return choose(state, TAKING_ON_WATER, choice!, () => roll);
}

function discoverSeam(state: SaveData): SaveData {
  state = act(state, 'lookAtWater');
  expect(state.run?.sceneId).toBe('waterMoved');
  return act(state, 'inspectSeamEarly');
}

function available(state: SaveData): Choice[] {
  return TAKING_ON_WATER.scenes[state.run!.sceneId].choices.filter((choice) => meets(choice.requirements, state));
}

describe('Taking on Water', () => {
  it('registers for random starts, repeat avoidance, and direct QA launch', () => {
    expect(SCENARIOS).toContain(TAKING_ON_WATER);
    expect(TAKING_ON_WATER.title).toBe('Taking on Water');
    expect(selectScenario(SCENARIOS, TAKING_ON_WATER.id, () => 0)).not.toBe(TAKING_ON_WATER);
    expect(startAdventure({ version: 1, bank: [], character: null, run: null }, TAKING_ON_WATER).run?.scenarioId).toBe(TAKING_ON_WATER.id);
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, SCENARIOS, ITEMS)).toContain('Start Taking on Water');
    expect(renderQaPanel(false, fresh(), SCENARIOS, ITEMS)).toBe('');
  });

  it('opens with gradual clues and reveals the one grounded cause only after investigation', () => {
    const state = fresh();
    const opening = sceneText(TAKING_ON_WATER.scenes.dampBoot, state);
    expect(opening).toContain('alone');
    expect(opening).toContain('shore is visible');
    expect(opening).toContain('One boot is damp');
    expect(opening.toLowerCase()).not.toContain('leak');
    expect(opening.toLowerCase()).not.toContain('seam');
    const firstObservation = act(state, 'lookAtWater');
    expect(sceneText(TAKING_ON_WATER.scenes.waterMoved, firstObservation)).toContain('could still be splash water');
    const inspected = act(firstObservation, 'inspectSeamEarly');
    expect(sceneText(TAKING_ON_WATER.scenes.seamFound, inspected)).toContain('scraped submerged branches');
    expect(sceneText(TAKING_ON_WATER.scenes.seamFound, inspected)).toContain('opened one small gap');
  });

  it('allows a fresh broke character to paddle directly to safety early', () => {
    let state = act(fresh(), 'paddleEarly');
    expect(state.run?.elapsedMinutes).toBe(12);
    state = act(state, 'paddleOnFromDirect', 0);
    expect(state.run?.sceneId).toBe('shoreLanding');
    state = act(state, 'finishAtShore');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('shoreEnding');
    expect(state.character?.money).toBe(0);
  });

  it('makes bailing useful once, then advances to a less effective second attempt', () => {
    let state = act(act(fresh(), 'lookAtWater'), 'bailFirst');
    expect(state.run?.sceneId).toBe('bailFollowup');
    expect(state.run?.flags).toContain('bailedOnce');
    expect(sceneText(TAKING_ON_WATER.scenes.bailFollowup, state)).toContain('bought a little time');
    state = act(state, 'bailAgain');
    expect(state.run?.sceneId).toBe('lateBail');
    expect(state.run?.flags).toContain('bailedTwice');
    expect(available(state).map((choice) => choice.id)).not.toContain('bailAgain');
  });

  it('lets an unequipped fresh character make a crude temporary cloth patch', () => {
    const state = act(discoverSeam(fresh()), 'improviseClothPatch', 0);
    expect(state.run?.sceneId).toBe('patchResult');
    expect(state.run?.flags).toContain('patchCrude');
    expect(state.run?.inventory).toEqual(['smallKnife', 'lantern']);
    expect(state.run?.acquiredThisRun).toEqual([]);
  });

  it('uses Waxed Canvas as the strongest nonconsumed patch material', () => {
    const state = act(discoverSeam(fresh('waxedCanvasSheet')), 'patchWithWaxedCanvas');
    expect(state.run?.sceneId).toBe('patchResult');
    expect(state.run?.flags).toContain('patchStrong');
    expect(state.run?.inventory).toContain('waxedCanvasSheet');
    expect(state.run?.elapsedMinutes).toBe(12);
  });

  it('uses Freightman’s Strap to hold ordinary cloth against the hull', () => {
    const state = act(discoverSeam(fresh('freightmansStrap')), 'cinchWithFreightmansStrap');
    expect(state.run?.flags).toContain('patchHeld');
    expect(state.run?.inventory).toContain('freightmansStrap');
    expect(TAKING_ON_WATER.scenes.seamFound.choices.find((choice) => choice.id === 'cinchWithFreightmansStrap')?.hint).toMatch(/ordinary clothing/);
  });

  it.each(['pocketToolkit', 'foremanMultiTool'])('tightens the loosened brass seam fitting with %s', (item) => {
    let state = discoverSeam(fresh(item));
    state = act(state, 'tightenSeamFastener');
    expect(state.run?.sceneId).toBe('toolPatch');
    expect(sceneText(TAKING_ON_WATER.scenes.toolPatch, state).toLowerCase()).toContain(item === 'pocketToolkit' ? 'narrow pliers' : 'folding driver');
    state = act(state, item === 'pocketToolkit' ? 'tightenWithToolkit' : 'tightenWithMultiTool');
    expect(state.run?.flags).toContain('patchStrong');
  });

  it('uses the card knife for precise cloth cutting without sacrificing it', () => {
    const state = discoverSeam(fresh('dealerCardKnife'));
    expect(sceneText(TAKING_ON_WATER.scenes.seamFound, state)).toContain('trim your spare shirt');
    const patch = TAKING_ON_WATER.scenes.seamFound.choices.find((choice) => choice.id === 'improviseClothPatch')!;
    expect(patch.chance?.bonusItems).toContain('dealerCardKnife');
    expect(patch.effects?.loseItems ?? []).not.toContain('dealerCardKnife');
  });

  it('uses the folding pry tool only as a warned, risky way to align the rib', () => {
    let state = act(discoverSeam(fresh('foldingPryTool')), 'tightenSeamFastener');
    expect(sceneText(TAKING_ON_WATER.scenes.toolPatch, state)).toContain('too much leverage may widen the split');
    state = act(state, 'alignWithPryTool', 0.99);
    expect(state.run?.sceneId).toBe('patchSetback');
    expect(state.run?.health).toBe(9);
    expect(available(state).length).toBeGreaterThan(0);
  });

  it('uses the Iron Rope Clamp only to compress cloth against an interior rib', () => {
    let state = act(discoverSeam(fresh('ironRopeClamp')), 'tightenSeamFastener');
    expect(sceneText(TAKING_ON_WATER.scenes.toolPatch, state)).toContain('curved hull keeps it from sealing the fitting alone');
    state = act(state, 'clampClothToRib');
    expect(state.run?.flags).toContain('clampPatch');
    expect(state.run?.inventory).toContain('ironRopeClamp');
  });

  it('uses gloves to reduce the risk of pressing cloth against a splintered seam', () => {
    const state = discoverSeam(fresh('heavyLeatherGloves'));
    expect(sceneText(TAKING_ON_WATER.scenes.seamFound, state)).toContain('protect your hands from the splintered edge');
    expect(TAKING_ON_WATER.scenes.seamFound.choices.find((choice) => choice.id === 'improviseClothPatch')?.chance?.bonusItems).toContain('heavyLeatherGloves');
  });

  it('uses a weatherproof blanket to keep carried possessions dry without consuming it', () => {
    let state = act(discoverSeam(fresh('weatherproofBlanket', 6)), 'goToPreparation');
    expect(sceneText(TAKING_ON_WATER.scenes.gearPrep, state)).toContain('without being cut or lost');
    state = act(state, 'secureWithWeatherproofBlanket');
    expect(state.run?.flags).toContain('moneySecured');
    expect(state.run?.flags).toContain('carriedItemSecured');
    expect(state.run?.inventory).toContain('weatherproofBlanket');
    expect(state.character?.money).toBe(6);
  });

  it('keeps a wool blanket as warmth gear rather than treating it as waterproof repair material', () => {
    const state = act(discoverSeam(fresh('woolTravelBlanket')), 'goToPreparation');
    expect(sceneText(TAKING_ON_WATER.scenes.swimSecured, { ...state, run: { ...state.run!, sceneId: 'swimSecured', flags: [...state.run!.flags, 'moneySecured', 'carriedItemSecured'] } })).toContain('help restore warmth');
    expect(TAKING_ON_WATER.scenes.seamFound.choices.find((choice) => choice.id === 'improviseClothPatch')).toBeDefined();
  });

  it('supports ordinary cargo sacrifice without changing persistent money or carried gear', () => {
    let state = act(discoverSeam(fresh('travelRope', 4)), 'goToPreparation');
    state = act(state, 'throwOrdinaryCargo');
    expect(state.run?.sceneId).toBe('lighterCanoe');
    expect(state.run?.flags).toContain('cargoLightened');
    expect(state.run?.inventory).toContain('travelRope');
    expect(state.character?.money).toBe(4);
    expect(state.character?.historyFlags).toContain('sacrificed_property_for_safety');
  });

  it('does not lose money or carried gear unless the player explicitly leaves them to swim', () => {
    let state = act(fresh('travelRope', 7), 'paddleEarly');
    state = act(state, 'paddleOnFromDirect', 0);
    expect(state.run?.status).toBe('active');
    expect(state.character?.money).toBe(7);
    expect(state.character?.carriedItem).toBe('travelRope');
    let abandoned = fresh('travelRope', 7);
    abandoned = { ...abandoned, run: { ...abandoned.run!, sceneId: 'swimDecision', elapsedMinutes: 42, visitedSceneIds: [...abandoned.run!.visitedSceneIds!, 'swimDecision'] } };
    abandoned = act(abandoned, 'swimLeavePossessions', 0);
    expect(abandoned.character?.money).toBe(0);
    expect(abandoned.character?.carriedItem).toBeNull();
    expect(abandoned.run?.inventory).not.toContain('travelRope');
    expect(abandoned.run?.flags).toContain('possessionsLeftBehind');
    expect(abandoned.bank).toEqual(['graveCoin']);
    const secured = { ...fresh('travelRope', 7), run: { ...fresh('travelRope', 7).run!, sceneId: 'swimDecision', flags: ['moneySecured', 'carriedItemSecured'], visitedSceneIds: ['dampBoot', 'swimDecision'] } };
    expect(available(secured).map((choice) => choice.id)).not.toContain('swimLeavePossessions');
  });

  it('uses Travel Rope to tether the canoe during a swim', () => {
    const state = { ...fresh('travelRope'), run: { ...fresh('travelRope').run!, sceneId: 'swampedNearShore', visitedSceneIds: ['dampBoot', 'swampedNearShore'] } };
    expect(available(state).map((choice) => choice.id)).toContain('tetherCanoeWithRope');
    const result = act(state, 'tetherCanoeWithRope', 0);
    expect(result.run?.sceneId).toBe('shoreLanding');
    expect(result.run?.inventory).toContain('travelRope');
  });

  it('supports signal mirror and whistle rescue, plus a nonresponse route that keeps play moving', () => {
    const mirror = { ...fresh('roadsideSignalMirror'), run: { ...fresh('roadsideSignalMirror').run!, sceneId: 'signalView', visitedSceneIds: ['dampBoot', 'signalView'] } };
    expect(act(mirror, 'signalMirror', 0).run?.sceneId).toBe('rescueResponse');
    const whistle = { ...fresh('conductorWhistle'), run: { ...fresh('conductorWhistle').run!, sceneId: 'signalView', visitedSceneIds: ['dampBoot', 'signalView'] } };
    expect(act(whistle, 'signalWhistle', 0).run?.sceneId).toBe('rescueResponse');
    const noAnswer = act({ ...fresh(), run: { ...fresh().run!, sceneId: 'signalView', visitedSceneIds: ['dampBoot', 'signalView'] } }, 'waveForHelp', 0.99);
    expect(noAnswer.run?.sceneId).toBe('signalNoResponse');
    expect(available(noAnswer).length).toBeGreaterThan(0);
  });

  it('makes cool water modestly harder to swim in and persists the selected condition across reload', () => {
    const cool = fresh(null, 0, 0.95);
    expect(cool.run?.randomSelections?.lakeCondition).toBe('coolWater');
    expect(sceneText(TAKING_ON_WATER.scenes.dampBoot, cool)).toContain('cool enough to make a swim unpleasant');
    const serialized = JSON.parse(JSON.stringify(cool)) as SaveData;
    expect(serialized.run?.randomSelections).toEqual(cool.run?.randomSelections);
    const swimChance = TAKING_ON_WATER.scenes.swimDecision.choices.find((choice) => choice.id === 'swimHoldingCanoe')!.chance!;
    expect(swimChance.penaltySelections?.lakeCondition).toBe('coolWater');
    expect(swimChance.penaltyProbability).toBeGreaterThan(0);
  });

  it('lets the persisted lake condition modestly change paddle odds without making either result certain', () => {
    const calm = fresh(null, 0, 0);
    const breezy = fresh(null, 0, 0.5);
    const prepare = (state: SaveData): SaveData => ({ ...state, run: { ...state.run!, sceneId: 'directPaddle', visitedSceneIds: [...state.run!.visitedSceneIds!, 'directPaddle'] } });
    expect(act(prepare(calm), 'paddleOnFromDirect', 0.93).run?.sceneId).toBe('shoreLanding');
    expect(act(prepare(breezy), 'paddleOnFromDirect', 0.93).run?.sceneId).toBe('swampedNearShore');
    expect(TAKING_ON_WATER.scenes.directPaddle.choices.find((choice) => choice.id === 'paddleOnFromDirect')?.chance?.probability).toBeGreaterThan(0);
  });

  it('uses the authored leak phases to communicate worsening conditions', () => {
    expect(timeStatus(TAKING_ON_WATER, 0).phase?.id).toBe('seeping');
    expect(timeStatus(TAKING_ON_WATER, 9).phase?.id).toBe('accumulating');
    expect(timeStatus(TAKING_ON_WATER, 20).phase?.id).toBe('ridingLow');
    expect(timeStatus(TAKING_ON_WATER, 32).phase?.id).toBe('swamping');
    expect(timeStatus(TAKING_ON_WATER, 44).phase?.id).toBe('critical');
  });

  it('supports swimming with the canoe and a foreshadowed cold-water death risk only at the desperate end', () => {
    const freshSwim = { ...fresh(), run: { ...fresh().run!, sceneId: 'swimDecision', visitedSceneIds: ['dampBoot', 'swimDecision'] } };
    expect(available(freshSwim).map((choice) => choice.id)).toContain('swimHoldingCanoe');
    expect(act(freshSwim, 'swimHoldingCanoe', 0).run?.sceneId).toBe('shoreLanding');
    const desperate = { ...fresh(), run: { ...fresh().run!, sceneId: 'swimDecision', elapsedMinutes: 44, visitedSceneIds: ['dampBoot', 'swimDecision'] } };
    const lastChoice = available(desperate).find((choice) => choice.id === 'lastColdSwim')!;
    expect(lastChoice.hint).toMatch(/may kill you/i);
    expect(lastChoice.chance?.probability).toBeGreaterThan(0);
    expect(act(desperate, 'lastColdSwim', 0.99).run?.sceneId).toBe('deathEnding');
  });

  it('preserves active run condition, elapsed leak phase, money, inventory, and flags through serialization', () => {
    let state = act(discoverSeam(fresh('waxedCanvasSheet', 3, 0.5)), 'patchWithWaxedCanvas');
    state = JSON.parse(JSON.stringify(state)) as SaveData;
    expect(state.run?.sceneId).toBe('patchResult');
    expect(state.run?.elapsedMinutes).toBe(12);
    expect(state.run?.randomSelections?.lakeCondition).toBe('breezy');
    expect(state.run?.flags).toContain('patchStrong');
    expect(state.run?.inventory).toContain('waxedCanvasSheet');
    expect(state.character?.money).toBe(3);
  });

  it('has a forward-only actionable graph with at most four visible choices for fresh and single-item characters', () => {
    expect(findScenarioGraphProblems(TAKING_ON_WATER)).toEqual([]);
    for (const carried of [null, 'waxedCanvasSheet', 'freightmansStrap', 'pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'ironRopeClamp', 'dealerCardKnife', 'heavyLeatherGloves', 'weatherproofBlanket', 'woolTravelBlanket', 'travelRope', 'roadsideSignalMirror', 'conductorWhistle']) {
      const queue = [fresh(carried, 2)];
      const seen = new Set<string>();
      while (queue.length) {
        const state = queue.shift()!;
        const run = state.run!;
        const key = [run.sceneId, run.elapsedMinutes, run.health, run.status, run.randomSelections?.lakeCondition, [...run.flags].sort().join(','), [...run.inventory].sort().join(',')].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        if (run.status !== 'active') continue;
        const scene = TAKING_ON_WATER.scenes[run.sceneId];
        const actions = available(state);
        expect(actions.length, `${carried ?? 'fresh'} at ${scene.id}`).toBeGreaterThan(0);
        expect(actions.length, `${carried ?? 'fresh'} choice count at ${scene.id}`).toBeLessThanOrEqual(4);
        for (const choice of actions) {
          for (const roll of choice.chance ? [0, 0.999999] : [0]) {
            const next = choose(state, TAKING_ON_WATER, choice, () => roll);
            expect(next.run?.visitedSceneIds?.filter((id, index, list) => list.indexOf(id) !== index)).toEqual([]);
            queue.push(next);
          }
        }
      }
      expect(seen.size).toBeGreaterThan(10);
    }
  });

  it('keeps even QA force-added gear from overflowing the four-button choice grid', () => {
    const state = fresh();
    state.run!.inventory = [...new Set([...state.run!.inventory, ...Object.values(ITEMS).filter((item) => item.carryable).map((item) => item.id)])];
    state.run!.sceneId = 'seamFound';
    state.run!.visitedSceneIds = [...state.run!.visitedSceneIds!, 'waterMoved', 'seamFound'];
    expect(available(state).length).toBeLessThanOrEqual(4);
    const atTools = { ...state, run: { ...state.run!, sceneId: 'toolPatch', visitedSceneIds: [...state.run!.visitedSceneIds!, 'toolPatch'] } };
    expect(available(atTools).length).toBeLessThanOrEqual(4);
    const atSwim = { ...state, run: { ...state.run!, sceneId: 'swimDecision', elapsedMinutes: 44, visitedSceneIds: [...state.run!.visitedSceneIds!, 'swimDecision'] } };
    expect(available(atSwim).length).toBeLessThanOrEqual(4);
  });

  it('keeps screen copy brief, gives no hidden rewards, and never alters banked items', () => {
    for (const scene of Object.values(TAKING_ON_WATER.scenes)) {
      for (const copy of [scene.text, ...(scene.textVariants ?? []).map((variant) => variant.text)]) {
        expect(copy.length, `${scene.id} story`).toBeLessThanOrEqual(400);
      }
      expect(scene.choices.length, scene.id).toBeLessThanOrEqual(10);
      expect(scene.choices.some((choice) => choice.effects?.gainItems?.length)).toBe(false);
      for (const choice of scene.choices) {
        expect(choice.label.length, `${scene.id}.${choice.id} label`).toBeLessThanOrEqual(70);
        expect(choice.hint?.length ?? 0, `${scene.id}.${choice.id} hint`).toBeLessThanOrEqual(115);
      }
    }
    const state = { ...fresh('travelRope', 5), bank: ['graveCoin', 'bronzeMaskFragment'] };
    const abandoned = { ...state, run: { ...state.run!, sceneId: 'swimDecision', visitedSceneIds: [...state.run!.visitedSceneIds!, 'swimDecision'] } };
    expect(act(abandoned, 'swimLeavePossessions').bank).toEqual(['graveCoin', 'bronzeMaskFragment']);
  });
});
