import { describe, expect, it } from 'vitest';
import { findScenarioGraphProblems } from './scenarioGraph';
import { SCENARIOS } from './scenarios';

function reachableSceneIds(scenario: (typeof SCENARIOS)[number]): Set<string> {
  const visited = new Set<string>();
  const queue = [scenario.startScene];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const scene = scenario.scenes[id];
    if (!scene) continue;
    for (const choice of scene.choices) {
      for (const target of [choice.next, choice.chance?.successNext, choice.chance?.failureNext, choice.effects?.combat?.winNext, choice.effects?.combat?.lossNext]) {
        if (target) queue.push(target);
      }
    }
  }
  // Health reaching zero is routed to the scenario-authored terminal by engine code.
  if (scenario.scenes.__death) visited.add('__death');
  return visited;
}

describe('registered scenario graph audit', () => {
  it('keeps graphs valid and explicitly accounts for unreachable save-compatibility scenes', () => {
    // These stable scene IDs were retained for active saves after authored routes changed.
    const retainedSaveScenes: Record<string, string[]> = {
      'broken-bell': ['clapperAtAltar', 'deathBell', 'legacyChest', 'legacyChestJam', 'legacyKeeper', 'legacyResume', 'legacyReunion', 'legacyWarning', 'partialReturn'],
      'hush-now': ['legacyAfterRescue', 'legacyRescue', 'legacyResume'],
      'smoke-over-main-street': ['fireDeath'],
      'the-last-room': ['guestAccused', 'wrongAccusationEnding'],
      'the-last-shot': ['lastShotDeath'],
      'the-roof-comes-in': ['roofDeath'],
    };
    const found: Record<string, string[]> = {};
    for (const scenario of SCENARIOS) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      const reachable = reachableSceneIds(scenario);
      const orphans = Object.keys(scenario.scenes).filter((id) => !reachable.has(id));
      if (orphans.length) found[scenario.id] = orphans.sort();
    }
    expect(found).toEqual(retainedSaveScenes);
  });
});
