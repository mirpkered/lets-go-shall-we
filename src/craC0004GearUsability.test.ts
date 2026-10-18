import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from './engine';
import { EMPTY_SAVE } from './storage';
import type { ItemCondition, SaveData, Scenario } from './types';
import { SCENARIOS } from './scenarios';

type Gate = {
  finding: string;
  scenarioId: string;
  sceneId: string;
  choiceId: string;
  gear: string[];
};

const gates: Gate[] = [
  ...['useMultiTool', 'useFoldingRule', 'volunteerWithTool', 'volunteerWithRule'].map((choiceId) => ({
    finding: 'CRA-F0020', scenarioId: 'the-road-crew', sceneId: choiceId.startsWith('volunteer') ? 'volunteerWorksite' : 'paidWorksite', choiceId,
    gear: [choiceId.includes('Rule') ? 'joinersFoldingRule' : 'foremanMultiTool'],
  })),
  { finding: 'CRA-F0021', scenarioId: 'creek-on-the-return', sceneId: 'nearBank', choiceId: 'useTravelRope', gear: ['travelRope'] },
  { finding: 'CRA-F0021', scenarioId: 'creek-on-the-return', sceneId: 'downstreamShelf', choiceId: 'handlineCross', gear: ['travelRope'] },
  { finding: 'CRA-F0023', scenarioId: 'dry-camp', sceneId: 'dryHollow', choiceId: 'changeTomorrowRoute', gear: ['foldingTrailMarker'] },
  { finding: 'CRA-F0024', scenarioId: 'the-ridge-or-the-valley', sceneId: 'twoRoutes', choiceId: 'signalFromFork', gear: ['roadsideSignalMirror'] },
  { finding: 'CRA-F0025', scenarioId: 'marks-on-the-trail', sceneId: 'marksInspected', choiceId: 'markJunctionAfterLook', gear: ['foldingTrailMarker'] },
  { finding: 'CRA-F0026', scenarioId: 'the-second-sunset', sceneId: 'longRoadEvening', choiceId: 'continueWithLantern', gear: ['roadmansLantern'] },
  { finding: 'CRA-F0026', scenarioId: 'the-second-sunset', sceneId: 'campedKnoll', choiceId: 'useBlanket', gear: ['weatherproofBlanket', 'woolTravelBlanket'] },
  { finding: 'CRA-F0027', scenarioId: 'the-calf-in-the-mud', sceneId: 'muddyGate', choiceId: 'prepareRopePull', gear: ['travelRope'] },
  { finding: 'CRA-F0027', scenarioId: 'the-calf-in-the-mud', sceneId: 'ropeReady', choiceId: 'ropeWithHandler', gear: ['travelRope'] },
  { finding: 'CRA-F0030', scenarioId: 'the-bee-yard', sceneId: 'apiaryGate', choiceId: 'steadyStandTool', gear: ['pocketToolkit', 'foremanMultiTool', 'gateHook'] },
  { finding: 'CRA-F0045', scenarioId: 'lantern-at-the-crossing', sceneId: 'crossingMarks', choiceId: 'useSpiritGlass', gear: ['lantern'] },
  { finding: 'CRA-F0054', scenarioId: 'the-wrong-shadow', sceneId: 'lateShadow', choiceId: 'testShadowLight', gear: ['lantern'] },
  { finding: 'CRA-F0056', scenarioId: 'below-the-old-fort', sceneId: 'fortGreen', choiceId: 'useSilverFort', gear: ['smallKnife'] },
  { finding: 'CRA-F0057', scenarioId: 'the-hollow-man', sceneId: 'hollowField', choiceId: 'removeBones', gear: ['smallKnife'] },
  { finding: 'CRA-F0408', scenarioId: 'house-with-two-cellars', sceneId: 'cellarBrokenArch', choiceId: 'fightCellarSkeleton', gear: ['smallKnife'] },
  { finding: 'CRA-F0103', scenarioId: 'teeth-in-the-mine', sceneId: 'sideChamber', choiceId: 'lowerRope', gear: ['travelRope'] },
  { finding: 'CRA-F0121', scenarioId: 'the-broken-antler', sceneId: 'elkWire', choiceId: 'cutWire', gear: ['smallKnife'] },
  { finding: 'CRA-F0124', scenarioId: 'the-beast-at-the-toll-road', sceneId: 'stagedBeast', choiceId: 'cutControlRope', gear: ['smallKnife'] },
  { finding: 'CRA-F0169', scenarioId: 'iron-orchard', sceneId: 'centralShaft', choiceId: 'testAir', gear: ['lantern', 'minerHeadlamp'] },
  { finding: 'CRA-F0174', scenarioId: 'deep-room-at-harker-mine', sceneId: 'airShaftHarker', choiceId: 'testDraft', gear: ['lantern', 'minerHeadlamp'] },
  { finding: 'CRA-F0174', scenarioId: 'deep-room-at-harker-mine', sceneId: 'harkerOutside', choiceId: 'descendHarker', gear: ['minerHeadlamp'] },
  { finding: 'CRA-F0176', scenarioId: 'ferry-beneath-the-ferry', sceneId: 'lowerWater', choiceId: 'followOldRoad', gear: ['travelRope'] },
  { finding: 'CRA-F0181', scenarioId: 'white-chamber', sceneId: 'whiteCaveMouth', choiceId: 'ropeCave', gear: ['travelRope'] },
  { finding: 'CRA-F0213', scenarioId: 'the-second-brace', sceneId: 'frame', choiceId: 'measure', gear: ['joinersFoldingRule'] },
  { finding: 'CRA-F0214', scenarioId: 'the-press-before-noon', sceneId: 'press', choiceId: 'measure', gear: ['joinersFoldingRule'] },
  { finding: 'CRA-F0220', scenarioId: 'the-slate-on-the-schoolhouse', sceneId: 'slate', choiceId: 'rope', gear: ['travelRope'] },
  { finding: 'CRA-F0259', scenarioId: 'the-clamp-beneath-the-press', sceneId: 'press', choiceId: 'markPath', gear: ['foldingBenchClamp'] },
  { finding: 'CRA-F0261', scenarioId: 'the-crate-beyond-the-piles', sceneId: 'dock', choiceId: 'boatHook', gear: ['boatHook'] },
  { finding: 'CRA-F0262', scenarioId: 'the-ford-with-the-white-stone', sceneId: 'ford', choiceId: 'probe', gear: ['collapsibleSoundingRod'] },
  { finding: 'CRA-F0263', scenarioId: 'the-mooring-at-cotter-slip', sceneId: 'barge', choiceId: 'rope', gear: ['travelRope'] },
  { finding: 'CRA-F0265', scenarioId: 'the-lantern-at-the-lower-landing', sceneId: 'lamp', choiceId: 'flags', gear: ['signalFlagSet'] },
  { finding: 'CRA-F0265', scenarioId: 'the-lantern-at-the-lower-landing', sceneId: 'lamp', choiceId: 'mirror', gear: ['roadsideSignalMirror'] },
  { finding: 'CRA-F0267', scenarioId: 'the-mark-below-the-waterline', sceneId: 'bridge', choiceId: 'probe', gear: ['collapsibleSoundingRod'] },
  { finding: 'CRA-F0270', scenarioId: 'the-channel-that-moved', sceneId: 'marker', choiceId: 'rod', gear: ['collapsibleSoundingRod'] },
  { finding: 'CRA-F0271', scenarioId: 'the-sound-under-the-pontoon', sceneId: 'pontoon', choiceId: 'probe', gear: ['collapsibleSoundingRod'] },
  { finding: 'CRA-F0272', scenarioId: 'the-ferry-wheel-in-the-silt', sceneId: 'winch', choiceId: 'clear', gear: ['foldingFieldSpade'] },
  { finding: 'CRA-F0272', scenarioId: 'the-ferry-wheel-in-the-silt', sceneId: 'winch', choiceId: 'probe', gear: ['collapsibleSoundingRod'] },
  { finding: 'CRA-F0273', scenarioId: 'the-boat-hook-at-the-cattle-bank', sceneId: 'gate', choiceId: 'hook', gear: ['boatHook'] },
  { finding: 'CRA-F0273', scenarioId: 'the-boat-hook-at-the-cattle-bank', sceneId: 'gate', choiceId: 'rope', gear: ['travelRope'] },
  { finding: 'CRA-F0283', scenarioId: 'the-dry-row-before-the-threshing', sceneId: 'wait', choiceId: 'rope', gear: ['travelRope'] },
  { finding: 'CRA-F0286', scenarioId: 'the-pasture-bell-before-dusk', sceneId: 'bell', choiceId: 'glasses', gear: ['fieldGlasses'] },
];

const scenarioFor = (scenarioId: string): Scenario => {
  const scenario = SCENARIOS.find(({ id }) => id === scenarioId);
  if (!scenario) throw new Error(`Missing registered scenario ${scenarioId}`);
  return scenario;
};

function stateFor(scenario: Scenario, gear: string[], condition: ItemCondition): SaveData {
  const character = newCharacter('CRA-C0004 Gear Test');
  const run = startRun(character, scenario, () => 0);
  run.inventory = [...new Set([...run.inventory, ...gear])];
  const itemStates = Object.fromEntries(gear.map((id) => [id, {
    condition,
    upgrades: id === 'lantern' ? [{ id: 'spiritGlass' }] : id === 'smallKnife' ? [{ id: 'silveredEdge' }] : [],
    provenance: [],
  }]));
  return { ...structuredClone(EMPTY_SAVE), character, run, itemStates };
}

describe('CRA-C0004 Gear usability requirements', () => {
  it.each(gates)('$finding $scenarioId.$sceneId.$choiceId rejects broken or absent Gear', ({ scenarioId, sceneId, choiceId, gear }) => {
    const scenario = scenarioFor(scenarioId);
    const choice = scenario.scenes[sceneId]?.choices.find(({ id }) => id === choiceId);
    expect(choice, `${scenarioId}.${sceneId}.${choiceId}`).toBeTruthy();

    expect(meets(choice!.requirements, stateFor(scenario, gear, 'NORMAL'))).toBe(true);
    expect(meets(choice!.requirements, stateFor(scenario, gear, 'BROKEN'))).toBe(false);
    const absent = stateFor(scenario, gear, 'NORMAL');
    absent.run!.inventory = absent.run!.inventory.filter((id) => !gear.includes(id));
    expect(meets(choice!.requirements, absent)).toBe(false);
  });

  it('does not grant the Teeth in the Mine rescue or History credit when the rope is absent or broken', () => {
    const scenario = scenarioFor('teeth-in-the-mine');
    const sideChamber = scenario.scenes.sideChamber;
    const lowerRope = sideChamber.choices.find(({ id }) => id === 'lowerRope')!;

    for (const condition of ['NORMAL', 'BROKEN'] as const) {
      let state = stateFor(scenario, ['travelRope'], condition);
      state = choose(state, scenario, scenario.scenes.mineMouth.choices.find(({ id }) => id === 'listenShaft')!);
      state = choose(state, scenario, scenario.scenes.mineEcho.choices.find(({ id }) => id === 'followRealKnocks')!);
      expect(state.run?.sceneId).toBe('sideChamber');

      if (condition === 'BROKEN') {
        expect(meets(lowerRope.requirements, state)).toBe(false);
        const rejected = choose(state, scenario, lowerRope);
        expect(rejected.run?.sceneId).toBe('sideChamber');
        expect(rejected.character?.historyFlags ?? []).not.toContain('used rope to rescue a miner from a collapsed drift');
      } else {
        expect(meets(lowerRope.requirements, state)).toBe(true);
        const rescued = choose(state, scenario, lowerRope);
        expect(rescued.run?.sceneId).toBe('minerOut');
        expect(rescued.character?.historyFlags).toContain('used rope to rescue a miner from a collapsed drift');
      }
    }

    const absent = stateFor(scenario, [], 'NORMAL');
    let atSideChamber = choose(absent, scenario, scenario.scenes.mineMouth.choices.find(({ id }) => id === 'listenShaft')!);
    atSideChamber = choose(atSideChamber, scenario, scenario.scenes.mineEcho.choices.find(({ id }) => id === 'followRealKnocks')!);
    expect(meets(lowerRope.requirements, atSideChamber)).toBe(false);
    const rejected = choose(atSideChamber, scenario, lowerRope);
    expect(rejected.run?.sceneId).toBe('sideChamber');
    expect(rejected.character?.historyFlags ?? []).not.toContain('used rope to rescue a miner from a collapsed drift');
  });
});
