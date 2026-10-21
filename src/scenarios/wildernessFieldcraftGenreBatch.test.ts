import { describe, expect, it } from 'vitest';
import { choose, finishRewardResolution, getCarriedItems, itemState, meets, newCharacter, openRewardResolution, placeReward, sceneText, startRun } from '../engine';
import { eligibleScenarios } from '../scenarioSelection';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { ITEMS } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { SCENARIOS } from './index';
import { WILDERNESS_FIELDCRAFT_GENRE_BATCH } from './wildernessFieldcraftGenreBatch';
import type { SaveData, Scenario } from '../types';

function begin(scenario: Scenario): SaveData {
  const character = newCharacter('Field Tester');
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, id: string, random = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === id);
  expect(choice, `${scenario.id}.${scene.id}.${id}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.id}.${scene.id}.${id} requirements`).toBe(true);
  return choose(state, scenario, choice!, random);
}

describe('Gear Expansion Genre Batch 7 — Wilderness Work / Fieldcraft', () => {
  it('registers 24 unique Adventures, retains normal seasonal eligibility, and validates every destination', () => {
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH).toHaveLength(24);
    expect(SCENARIOS).toHaveLength(881);
    expect(new Set(WILDERNESS_FIELDCRAFT_GENRE_BATCH.map(({ id }) => id)).size).toBe(24);
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH.every(({ diversity }) => diversity?.depthClass === 'ADVENTURE')).toBe(true);
    expect(validateScenarioRegistry(WILDERNESS_FIELDCRAFT_GENRE_BATCH)).toEqual({ errors: [], warnings: [] });
    expect(WILDERNESS_FIELDCRAFT_GENRE_BATCH.filter(({ diversity }) => diversity?.combat === 'POSSIBLE').map(({ id }) => id).sort()).toEqual(['the-bear-at-the-berry-ridge', 'the-knife-in-the-grass']);
    const spring = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-alder-crossing')!;
    const winter = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-cold-rope-at-dawn')!;
    expect(eligibleScenarios([spring, winter], [], 4).map(({ id }) => id)).toEqual([spring.id]);
    expect(eligibleScenarios([spring, winter], [], 1).map(({ id }) => id)).toEqual([winter.id]);
    expect(eligibleScenarios([spring, winter], [], 7)).toEqual([]);
  });

  it('gives every story a real continuity opportunity and at least 18 stories a persistent Gear route', () => {
    let gearSources = 0;
    for (const scenario of WILDERNESS_FIELDCRAFT_GENRE_BATCH) {
      const choices = Object.values(scenario.scenes).flatMap(({ choices: entries }) => entries);
      const effects = choices.flatMap(({ effects: direct, chance }) => [direct, chance?.successEffects, chance?.failureEffects]).filter(Boolean);
      const hasContinuity = effects.some((effect) => (effect?.money ?? 0) > 0 || !!effect?.knowledge?.length || !!effect?.knowledgeEntries?.length || !!effect?.lore?.length || (effect?.gainItems ?? []).some((id) => ITEMS[id]?.carryable && ITEMS[id]?.inventoryClass === 'GEAR'));
      expect(hasContinuity, scenario.id).toBe(true);
      const gearChoices = choices.filter(({ effects }) => effects?.gainItems?.some((id) => ITEMS[id]?.inventoryClass === 'GEAR' && ITEMS[id]?.carryable));
      if (gearChoices.length) gearSources++;
      for (const choice of gearChoices) {
        const id = choice.effects!.gainItems!.find((itemId) => ITEMS[itemId]?.inventoryClass === 'GEAR')!;
        expect(choice.effects?.gainItemProvenance?.[id], `${scenario.id}.${choice.id}`).toBeTruthy();
        const state = begin(scenario);
        state.run!.sceneId = Object.keys(scenario.scenes).find((sceneId) => scenario.scenes[sceneId].choices.some(({ id: choiceId }) => choiceId === choice.id))!;
        const acquired = act(state, scenario, choice.id);
        expect(acquired.run?.inventory, `${scenario.id}.${choice.id}`).toContain(id);
      }
    }
    expect(gearSources).toBeGreaterThanOrEqual(18);
  });

  it('has a complete, acyclic and normally reachable graph for every Adventure', () => {
    for (const scenario of WILDERNESS_FIELDCRAFT_GENRE_BATCH) {
      const reached = new Set<string>();
      const pending = [scenario.startScene];
      while (pending.length) {
        const id = pending.pop()!;
        if (reached.has(id)) continue;
        reached.add(id);
        const scene = scenario.scenes[id];
        expect(scene, `${scenario.id}.${id} exists`).toBeDefined();
        for (const choice of scene.choices) {
          const combat = choice.effects?.combat;
          for (const destination of choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next, combat?.winNext, combat?.lossNext]) {
            if (destination) pending.push(destination);
          }
        }
      }
      expect(reached.size, scenario.id).toBe(Object.keys(scenario.scenes).length);
      const visiting = new Set<string>();
      const visited = new Set<string>();
      const visit = (id: string) => {
        if (visiting.has(id)) throw new Error(`${scenario.id} contains a cycle at ${id}`);
        if (visited.has(id)) return;
        visiting.add(id);
        for (const choice of scenario.scenes[id].choices) {
          const combat = choice.effects?.combat;
          for (const destination of choice.chance ? [choice.chance.successNext, choice.chance.failureNext] : [choice.next, combat?.winNext, combat?.lossNext]) if (destination) visit(destination);
        }
        visiting.delete(id);
        visited.add(id);
      };
      visit(scenario.startScene);
    }
  });

  it('acquires the Folding Field Spade through an explicit release and preserves it through save/resume', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-camp-below-the-cut')!;
    expect(ITEMS.foldingFieldSpade?.inventoryClass).toBe('GEAR');
    let state = begin(scenario);
    state.run!.sceneId = 'result';
    state = act(state, scenario, 'takeSpade');
    expect(state.run?.inventory).toContain('foldingFieldSpade');
    state = openRewardResolution(state);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldSpade');
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(state, storage as never);
    state = loadSave(storage as never);
    expect(state.run?.scenarioId).toBe(scenario.id);
    expect(state.run?.rewardPendingItems).toContain('foldingFieldSpade');
    state = finishRewardResolution(placeReward(state, 'foldingFieldSpade', 'carry'));
    expect(getCarriedItems(state.character)).toContain('foldingFieldSpade');
    expect(itemState(state, 'foldingFieldSpade').provenance.join(' ')).toContain('Released by foreman Eda');
  });

  it('records the camp runoff as another source of the existing water-path lesson without tying it to compensation', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-camp-below-the-cut')!;
    const fact = KNOWLEDGE_FACTS.waterPathBeforeWall;
    let state = begin(scenario);
    state = act(state, scenario, 'readSlope');
    state = act(state, scenario, 'divertWide');
    expect(state.character?.knowledgeKeys).toContain(fact.id);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);
    expect(state.character?.knowledge).toContain(fact.text);

    // Reaching the same learning point again does not duplicate the stable fact or its source.
    state = begin(scenario);
    state.character!.knowledgeKeys = [fact.id];
    state.character!.knowledge = [fact.text];
    state.character!.knowledgeSources = { [fact.id]: [scenario.id] };
    state = act(state, scenario, 'readSlope');
    state = act(state, scenario, 'divertWide');
    expect(state.character?.knowledgeKeys?.filter((id) => id === fact.id)).toHaveLength(1);
    expect(state.character?.knowledgeSources?.[fact.id]).toEqual([scenario.id]);

    const result = begin(scenario);
    result.run!.sceneId = 'result';
    for (const choiceId of ['takeCoins', 'declinePayment']) {
      const outcome = act(result, scenario, choiceId);
      expect(outcome.character?.knowledgeKeys).toContain(fact.id);
      expect(outcome.character?.knowledgeSources?.[fact.id]).toContain(scenario.id);
    }
  });

  it('uses owned field spade only for limited shallow drainage, not as an automatic crossing solution', () => {
    for (const [scenarioId, sceneId, choiceId] of [
      ['a-footing-in-the-fen', 'stake', 'drainEdge'],
      ['the-storm-cut-camp', 'marks', 'clearDrain'],
    ]) {
      const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === scenarioId)!;
      const state = begin(scenario);
      if (scenarioId === 'the-storm-cut-camp') state.run!.sceneId = 'marks';
      state.run!.inventory.push('foldingFieldSpade');
      const next = act(state, scenario, choiceId);
      expect(next.character?.historyFlags).toContain(choiceId === 'drainEdge' ? 'used_folding_field_spade_fen_edge' : 'used_folding_field_spade_storm_channel');
      expect(next.run?.sceneId).not.toMatch(/success|complete/i);
    }
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-storm-cut-camp')!;
    const withoutSpade = begin(scenario);
    withoutSpade.run!.sceneId = 'marks';
    expect(meets(scenario.scenes.marks.choices.find(({ id }) => id === 'clearDrain')?.requirements, withoutSpade)).toBe(false);
  });

  it('keeps dangerous wildlife and human threats avoidable, with the snare confrontation honestly signposted', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-knife-in-the-grass')!;
    const start = begin(scenario);
    expect(scenario.scenes.anchor.text).toMatch(/demands that you leave/i);
    expect(scenario.scenes.snare.choices.some(({ id }) => id === 'backAway')).toBe(true);
    let result = act(start, scenario, 'inspectLoop');
    result = act(result, scenario, 'talkDown');
    expect(result.run?.sceneId).toBe('withdrawn');
    expect(result.run?.status).not.toBe('death');
    const bear = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-bear-at-the-berry-ridge')!;
    result = act(begin(bear), bear, 'callHandBack');
    result = act(result, bear, 'leavePatch');
    expect(result.run?.sceneId).toBe('safe');
    expect(result.run?.status).not.toBe('death');
  });

  it('turns the ridge echo into a safe, consequential follow-up instead of an immediate ending', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-ridge-listener')!;
    let state = act(begin(scenario), scenario, 'enterGully');
    expect(state.run?.sceneId).toBe('gully');
    expect(scenario.scenes.gully.ending).toBeUndefined();
    expect(scenario.scenes.gully.choices.map(({ id }) => id)).toEqual(['answerFromRidge', 'markLastBearing']);
    state = act(state, scenario, 'answerFromRidge');
    expect(state.run?.sceneId).toBe('answer');
    state = act(state, scenario, 'keepSpacing');
    expect(state.run?.sceneId).toBe('person');
    state = act(state, scenario, 'walkSlow');
    expect(state.run?.sceneId).toBe('rescue');
  });

  it('keeps Spring Run evacuation claims separate by people, flock, and an unconfirmed wagon signal', () => {
    const spring = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-spring-run')!;

    let workers = act(begin(spring), spring, 'movePeople');
    expect(workers.run?.flags).toContain('springWorkersAtRidge');
    workers = act(workers, spring, 'raiseCloth');
    const workersText = sceneText(spring.scenes.partial, workers);
    expect(workersText).toMatch(/two workers are on the high ridge/i);
    expect(workersText).toMatch(/no completed crossing or flock evacuation is established/i);
    expect(workersText).not.toMatch(/flock is gathered|everyone stays out/i);
    const whistleProvenance = spring.scenes.partial.choices.find(({ id }) => id === 'takeWhistle')?.effects?.gainItemProvenance?.farmWhistle;
    expect(whistleProvenance).toMatch(/helped respond to a rising spring flood/i);
    expect(whistleProvenance).not.toMatch(/moved people and sheep/i);

    let sheep = act(begin(spring), spring, 'secureFlock');
    sheep = act(sheep, spring, 'holdGate');
    const sheepText = sceneText(spring.scenes.partial, sheep);
    expect(sheep.run?.flags).toContain('springFlockTurnedBack');
    expect(sheepText).toMatch(/sheep turn back from the flooded ditch/i);
    expect(sheepText).toMatch(/workers’ location is not confirmed/i);
    expect(sheepText).not.toMatch(/gathered above the flood|workers are on the high ridge/i);

    let signal = act(begin(spring), spring, 'reachWagon');
    signal = act(signal, spring, 'showHighMark');
    const signalText = sceneText(spring.scenes.partial, signal);
    expect(signal.run?.flags).toContain('springCrewSignaled');
    expect(signalText).toMatch(/does not confirm that the workers or flock are all clear/i);
    expect(signalText).not.toMatch(/wagon crew waits|flock is gathered|workers stay on the ridge/i);
  });

  it('requires a usable whistle before recording a Spring Run signal and keeps the cloth fallback', () => {
    const spring = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-spring-run')!;
    const reachRidge = () => act(begin(spring), spring, 'movePeople');
    const whistleChoice = spring.scenes.ridge.choices.find(({ id }) => id === 'signalWagon')!;
    const clothChoice = spring.scenes.ridge.choices.find(({ id }) => id === 'raiseCloth')!;

    const absent = reachRidge();
    expect(meets(whistleChoice.requirements, absent)).toBe(false);
    expect(meets(clothChoice.requirements, absent)).toBe(true);

    const sound = reachRidge();
    sound.run!.inventory.push('farmWhistle');
    sound.itemStates = { farmWhistle: { condition: 'NORMAL', upgrades: [], provenance: [] } };
    expect(meets(whistleChoice.requirements, sound)).toBe(true);
    expect(act(sound, spring, 'signalWagon').run?.flags).toContain('springCrewSignaled');

    const broken = reachRidge();
    broken.run!.inventory.push('farmWhistle');
    broken.itemStates = { farmWhistle: { condition: 'BROKEN', upgrades: [], provenance: [] } };
    expect(meets(whistleChoice.requirements, broken)).toBe(false);
    expect(meets(clothChoice.requirements, broken)).toBe(true);
    const clothSignal = act(broken, spring, 'raiseCloth');
    expect(clothSignal.run?.flags).toContain('springCrewSignaled');
    expect(sceneText(spring.scenes.partial, clothSignal)).toMatch(/you signal the far crew to stay put/i);
  });

  it('claims a carrier route only after the upper foot approach is established', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-alder-crossing')!;

    let shallow = act(begin(scenario), scenario, 'probeNearBank');
    shallow = act(shallow, scenario, 'testRope');
    shallow = act(shallow, scenario, 'markShallow');
    expect(shallow.run?.sceneId).toBe('partial');
    expect(shallow.run?.flags).not.toContain('alderCarrierSentOnFoot');
    expect(sceneText(scenario.scenes.partial, shallow)).toMatch(/marks only the shallow bank-side shelf/i);
    expect(sceneText(scenario.scenes.partial, shallow)).toMatch(/No safe crossing or route for the carrier/i);
    expect(sceneText(scenario.scenes.partial, shallow)).not.toMatch(/carrier on foot/i);

    let foot = act(begin(scenario), scenario, 'walkUpstream');
    foot = act(foot, scenario, 'clearBank');
    foot = act(foot, scenario, 'sendOnFoot');
    expect(foot.run?.flags).toContain('alderCarrierSentOnFoot');
    expect(sceneText(scenario.scenes.partial, foot)).toMatch(/send the carrier on foot while keeping the cart on the road/i);
    const resumed = loadSave({ getItem: () => JSON.stringify(foot) });
    expect(resumed.run?.flags).toContain('alderCarrierSentOnFoot');
    expect(sceneText(scenario.scenes.partial, resumed)).toMatch(/send the carrier on foot/i);

    const legacy = begin(scenario);
    legacy.run!.sceneId = 'partial';
    expect(sceneText(scenario.scenes.partial, legacy)).toMatch(/No safe crossing or route for the carrier/i);
  });

  it('treats public-water access as confirmed only after the route-book check', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-broken-cairn')!;

    const unverifiedRoutes = [
      () => {
        let state = act(begin(scenario), scenario, 'checkOldBase');
        return act(state, scenario, 'setNorth');
      },
      () => {
        const state = begin(scenario);
        state.run!.inventory.push('surveyChain');
        let measured = act(state, scenario, 'compareChain');
        measured = act(measured, scenario, 'markPublic');
        return measured;
      },
      () => act(act(begin(scenario), scenario, 'askDrover'), scenario, 'markNorth'),
    ];
    for (const route of unverifiedRoutes) {
      const state = route();
      expect(state.run?.sceneId).toBe('north');
      expect(state.run?.flags).not.toContain('brokenCairnPublicRouteVerified');
      expect(sceneText(scenario.scenes.north, state)).toMatch(/only as a provisional route clue/i);
      expect(sceneText(scenario.scenes.north, state)).toMatch(/route book has not authorized this path/i);
      expect(sceneText(scenario.scenes.north, state)).not.toMatch(/route book confirms/i);
    }

    let verified = act(begin(scenario), scenario, 'askDrover');
    verified = act(verified, scenario, 'checkBook');
    verified = act(verified, scenario, 'resetPublic');
    expect(verified.run?.flags).toContain('brokenCairnPublicRouteVerified');
    expect(sceneText(scenario.scenes.north, verified)).toMatch(/route book confirms that the northern path reaches public water/i);
    const resumed = loadSave({ getItem: () => JSON.stringify(verified) });
    expect(resumed.run?.flags).toContain('brokenCairnPublicRouteVerified');
    expect(sceneText(scenario.scenes.north, resumed)).toMatch(/southern gate is a landowner’s crossing/i);

    const legacy = begin(scenario);
    legacy.run!.sceneId = 'north';
    expect(sceneText(scenario.scenes.north, legacy)).toMatch(/only as a provisional route clue/i);
    expect(meets(scenario.scenes.north.choices.find(({ id }) => id === 'takeChain')?.requirements, legacy)).toBe(true);
    expect(scenario.scenes.north.choices.find(({ id }) => id === 'takeChain')?.effects?.gainItemProvenance?.surveyChain).toMatch(/award itself does not establish public access/i);
  });

  it('keeps the failed ice shortcut ending aligned with the established fracture', () => {
    const scenario = WILDERNESS_FIELDCRAFT_GENRE_BATCH.find(({ id }) => id === 'the-cold-rope-at-dawn')!;
    let state = act(begin(scenario), scenario, 'crossIce');
    expect(state.run?.sceneId).toBe('crack');
    state = act(state, scenario, 'retreatIce');
    expect(state.run?.sceneId).toBe('retreated');
    expect(sceneText(scenario.scenes.retreated, state)).toMatch(/leave the fractured ice alone/i);
    expect(sceneText(scenario.scenes.retreated, state)).toMatch(/bridge remains the only known route/i);
    expect(sceneText(scenario.scenes.retreated, state)).not.toMatch(/crossed|safe ice/i);
  });
});
