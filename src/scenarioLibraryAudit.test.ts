import { describe, expect, it } from 'vitest';
import { findScenarioGraphProblems } from './scenarioGraph';
import { SCENARIOS } from './scenarios';
import { SALVAGE_RECOVERY_GENRE_BATCH } from './scenarios/salvageRecoveryGenreBatch';

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
      'the-forgotten-supply-cache': ['the-forgotten-supply-cacheMishap'],
      'the-last-room': ['guestAccused', 'wrongAccusationEnding'],
      'the-last-train-message': ['deliver-private', 'deliver-wait', 'porter-deliverNow', 'verify-carry'],
      'the-last-shot': ['lastShotDeath'],
      'the-roof-comes-in': ['roofDeath'],
      'the-belt-that-slapped-back': ['learned'],
      'one-tooth-on-the-sawmill': ['learned'],
      'the-east-siding-points': ['learned'],
      'the-load-under-the-warehouse-hoist': ['learned'],
      'the-pump-below-number-three': ['learned'],
      'the-warm-bearing-at-noon': ['learned'],
      'the-rivet-at-car-seven': ['learned'],
      'the-semaphore-in-the-rain': ['learned'],
      'the-grain-under-the-guard': ['learned'],
      'the-hoist-that-would-not-set-down': ['learned'],
      'the-lathe-chip': ['learned'],
      'the-winches-uneven-pull': ['learned'],
      'the-steam-pipe-behind-the-washroom': ['learned'],
      'the-tool-peg-on-night-shift': ['learned'],
      'the-misfed-grain-gate': ['learned'],
      'the-shaft-marks-at-ash-mill': ['learned'],
      'the-oil-on-the-switch-rod': ['learned'],
      'the-cable-over-foundry-road': ['learned'],
      'the-ore-cart-on-the-incline': ['learned'],
      'the-bell-before-the-restart': ['learned'],
      'the-sorting-table-jam': ['learned'],
      'the-dragging-brake-at-bell-yard': ['learned'],
      'the-sparks-at-the-belt-house': ['learned'],
      'the-slow-wheel-at-copper-mill': ['learned'],
      'the-brace-before-the-bell': ['knowledgeEnding'],
      'the-chimney-that-pulled-away': ['knowledgeEnding'],
      'the-joint-that-opened-in-winter': ['knowledgeEnding'],
      'the-ladder-in-the-west-yard': ['knowledgeEnding'],
      'the-ramp-for-the-grain-cart': ['knowledgeEnding'],
      'the-shed-with-two-roofs': ['knowledgeEnding'],
      'the-stone-that-kept-the-water': ['knowledgeEnding'],
      'the-tower-bell-anchor': ['knowledgeEnding'],
      'station-mark-in-margin': ['knowledgeEnding'],
      'seal-that-cooled-wrong': ['knowledgeEnding'],
      'copy-that-came-back': ['knowledgeEnding'],
      'flooded-relay-book': ['knowledgeEnding'],
      'initials-on-the-wire': ['knowledgeEnding'],
      'town-name-that-moved': ['knowledgeEnding'],
      'bell-before-the-wire': ['knowledgeEnding'],
      'horse-change-ledger': ['knowledgeEnding'],
      ...Object.fromEntries(SALVAGE_RECOVERY_GENRE_BATCH.map(({id})=>[id,['unpaid']])),
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
