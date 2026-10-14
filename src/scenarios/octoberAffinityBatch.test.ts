import { describe, expect, it } from 'vitest';
import { choose, finishSuccess, newCharacter, sceneText, startRun } from '../engine';
import { scenarioAvailableInMonth, classifyScenario } from '../scenarioDiversity';
import { eligibleScenarios, scenarioSelectionWeights, selectionDiagnostics, simulateScenarioSelection } from '../scenarioSelection';
import type { SaveData, Scenario } from '../types';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { renderQaPanel } from '../qaPanel';
import { ITEMS } from '../items';
import { SCENARIOS } from './index';
import { OCTOBER_AFFINITY_ADVENTURES } from './octoberAffinityBatch';
import { loadSave, SAVE_KEY, saveGame } from '../storage';

function stateAt(scenario: Scenario): SaveData {
  const character = newCharacter('Test Traveler');
  return { version: 1, bank: [], character, run: startRun(character, scenario) };
}
function pick(state: SaveData, scenario: Scenario, choiceId: string, random = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Missing ${scenario.id}.${scene.id}.${choiceId}`);
  return choose(state, scenario, choice, random);
}

describe('Halloween and October-affinity adventures', () => {
  it('registers twelve stable, distinct stories and leaves direct Halloween traditions locked only in October', () => {
    expect(OCTOBER_AFFINITY_ADVENTURES).toHaveLength(12);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    const locked = OCTOBER_AFFINITY_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'OCTOBER');
    expect(locked.map(({ title }) => title)).toEqual(['The Jack-o’-Lantern Contest', 'All Hallows at the Boarding House', 'The Masked Visitor', 'The Halloween Dare']);
    for (const scenario of locked) {
      expect(scenarioAvailableInMonth(scenario, 10)).toBe(true);
      for (const month of [1, 4, 7, 9, 11, 12]) expect(scenarioAvailableInMonth(scenario, month)).toBe(false);
    }
  });

  it('keeps affinity stories eligible in every month and applies their boost only in October', () => {
    const affinity = OCTOBER_AFFINITY_ADVENTURES.filter(({ diversity }) => diversity?.availability?.affinityMonths?.includes(10));
    expect(affinity).toHaveLength(8);
    for (const scenario of affinity) for (let month = 1; month <= 12; month++) expect(scenarioAvailableInMonth(scenario, month)).toBe(true);
    const sample = affinity[0];
    const july = scenarioSelectionWeights([sample], { selectionMonth: 7 })[0];
    const october = scenarioSelectionWeights([sample], { selectionMonth: 10 })[0];
    expect(july.seasonalWeight).toBe(1);
    expect(october.seasonalWeight).toBe(1.35);
    const qa = renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, [sample], ITEMS, 10);
    expect(qa).toContain('October affinity ×1.35');
    expect(renderQaPanel(true, { version: 1, bank: [], character: null, run: null }, [sample], ITEMS, 7)).toContain('eligible · October affinity inactive');
    const started = startRun(newCharacter('Date Change'), sample);
    expect(started.scenarioId).toBe(sample.id);
    expect(scenarioAvailableInMonth(sample, 1)).toBe(true);
    expect(started.sceneId).toBe(sample.startScene);
  });

  it('does not let October affinity bypass the existing recent-scenario exclusion or replay pressure', () => {
    const affinity = OCTOBER_AFFINITY_ADVENTURES.find(({ diversity }) => diversity?.availability?.affinityMonths?.includes(10))!;
    const other = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id !== affinity.id && classifyScenario({ ...affinity, id: `${affinity.id}-other`, title: 'Other' }).activities[0] === classifyScenario(affinity).activities[0])!;
    expect(eligibleScenarios([affinity, other], [affinity.id], 10).map(({ id }) => id)).not.toContain(affinity.id);
    const diagnostics = selectionDiagnostics([affinity, other], [], { selectionMonth: 10, scenarioPlayCounts: { [affinity.id]: 1 } });
    expect(diagnostics.scenarios.find(({ scenario }) => scenario.id === affinity.id)?.replayWeight).toBe(0.15);
    expect(diagnostics.scenarios.find(({ scenario }) => scenario.id === affinity.id)?.seasonalWeight).toBe(1.35);
  });

  it('simulates October and summer in the shared selector without letting seasonal stories bypass balancing', () => {
    const random = () => { let seed = 2407; return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646; };
    const october = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 10 }, 1000, random());
    const july = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 7 }, 1000, random());
    const lockedIds = OCTOBER_AFFINITY_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'OCTOBER').map(({ id }) => id);
    const affinityIds = OCTOBER_AFFINITY_ADVENTURES.filter(({ diversity }) => diversity?.availability?.affinityMonths?.includes(10)).map(({ id }) => id);
    expect(lockedIds.some((id) => (october.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    expect(lockedIds.every((id) => (july.scenarioCounts[id] ?? 0) === 0)).toBe(true);
    expect(affinityIds.some((id) => (october.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    expect(affinityIds.some((id) => (july.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    const noLockedStories = SCENARIOS.filter(({ diversity }) => diversity?.availability?.season !== 'OCTOBER');
    const octShare = selectionDiagnostics(noLockedStories, [], { selectionMonth: 10 }).scenarios.filter(({ scenario }) => affinityIds.includes(scenario.id)).reduce((sum, row) => sum + row.weight, 0);
    const julyShare = selectionDiagnostics(noLockedStories, [], { selectionMonth: 7 }).scenarios.filter(({ scenario }) => affinityIds.includes(scenario.id)).reduce((sum, row) => sum + row.weight, 0);
    expect(octShare).toBeGreaterThan(julyShare);
    expect(octShare).toBeLessThan(0.3);
    expect(new Set(Object.keys(october.categoryCounts)).size).toBeGreaterThan(1);
  }, 15_000);

  it('keeps every reachable story graph forward-only with a valid action on active scenes', () => {
    for (const scenario of OCTOBER_AFFINITY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const scene of Object.values(scenario.scenes)) {
        if (!scene.ending) expect(scene.choices.length, `${scenario.title}: ${scene.id}`).toBeGreaterThan(0);
        for (const choice of scene.choices) expect(choice.label.length).toBeLessThanOrEqual(44);
      }
    }
  });

  it('gives the carving contest performance feedback, event consequence, and an intentional refusal path', () => {
    const contest = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'jack-o-lantern-contest')!;
    const refused = pick(stateAt(contest), contest, 'leaveContest');
    expect(refused.run?.sceneId).toBe('contestDeclined');
    const entered = pick(stateAt(contest), contest, 'enterCarve');
    const carved = pick(entered, contest, 'simpleFace');
    const judged = pick(carved, contest, 'shareAfterContest');
    expect(judged.character?.money).toBe(1);
    expect(judged.run?.sceneId).toBe('contestAftermath');
    const ended = pick(judged, contest, 'contestComplete');
    expect(ended.run?.sceneId).toBe('contestComplete');
    expect(ended.run?.status).toBe('success');
    expect(ended.character?.lore.some((entry) => entry.includes('Halloween carving contest'))).toBe(true);
    expect(ended.character?.adventuresCompleted).toBe(1);

    let judge = stateAt(contest);
    for (const choice of ['judge', 'describeEvidence', 'contestThanks']) judge = pick(judge, contest, choice);
    expect(judge.run?.sceneId).toBe('contestSocialAftermath');
    expect(judge.character?.money).toBe(0);
    expect(judge.run?.status).toBe('success');
    expect(contest.scenes.contestSocialAftermath.textVariants?.[0].text).toContain('not a share of the entrants’ purse');
    expect(judge.character?.adventuresCompleted).toBe(1);

    let helper = stateAt(contest);
    for (const choice of ['helpDisplay', 'holdCover', 'contestThanks']) helper = pick(helper, contest, choice);
    expect(helper.run?.sceneId).toBe('contestSocialAftermath');
    expect(contest.scenes.contestSocialAftermath.textVariants?.[1].text).toContain('holding the canvas');
    expect(helper.character?.money).toBe(0);

    let prioritized = stateAt(contest);
    for (const choice of ['helpDisplay', 'moveBest', 'contestThanks']) prioritized = pick(prioritized, contest, choice);
    expect(sceneText(contest.scenes.contestSocialAftermath, prioritized)).not.toMatch(/remember you holding the canvas/i);
    expect(sceneText(contest.scenes.contestSocialAftermath, prioritized)).toMatch(/not a share of the entrants’ purse/i);
  });

  it('keeps All Hallows aftermath route-true when the key story is left unexplored', () => {
    const house = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'all-hallows-boarding-house')!;
    let leftAlone = stateAt(house);
    leftAlone = pick(leftAlone, house, 'askKeeper');
    leftAlone = pick(leftAlone, house, 'leaveKeyAlone');
    expect(sceneText(house.scenes.boardingAfter, leftAlone)).toMatch(/no one has established where Mr\. Venn learned the detail/i);
    expect(sceneText(house.scenes.boardingAfter, leftAlone)).not.toMatch(/paper strip is read|ledger note gives/i);
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } as unknown as Storage;
    saveGame(leftAlone, adapter);
    leftAlone = loadSave(adapter);
    expect(sceneText(house.scenes.boardingAfter, leftAlone)).toMatch(/no one has established where Mr\. Venn learned the detail/i);
    leftAlone = pick(leftAlone, house, 'boardingEnd');
    expect(sceneText(house.scenes.boardingEnd, leftAlone)).not.toMatch(/ordinary explanation|Venn stays to repair/i);

    let paperRead = stateAt(house);
    for (const choice of ['inspectStair', 'readPaper', 'helpKeeperSettle']) paperRead = pick(paperRead, house, choice);
    expect(sceneText(house.scenes.boardingAfter, paperRead)).toMatch(/paper strip is read with the keeper and returned to the ledger/i);
    expect(sceneText(house.scenes.boardingAfter, paperRead)).toMatch(/key is not recovered/i);
  });

  it('does not transfer the Halloween Dare shadow explanation to an outside rescue', () => {
    const dare = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-halloween-dare')!;
    let outside = stateAt(dare);
    for (const choice of ['callYouthOut', 'guideYouth', 'leaveOutsideRescue']) outside = pick(outside, dare, choice);
    expect(sceneText(dare.scenes.dareAfter, outside)).toMatch(/what caused the movement in the back room remains unknown/i);
    expect(sceneText(dare.scenes.dareAfter, outside)).not.toMatch(/hanging coat/i);

    let entered = stateAt(dare);
    entered = pick(entered, dare, 'enterDareHouse');
    entered = pick(entered, dare, 'crossGap', () => 0);
    entered = pick(entered, dare, 'leaveAfterRescue');
    expect(sceneText(dare.scenes.dareAfter, entered)).toMatch(/moving shadow was a hanging coat in the draft/i);
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } as unknown as Storage;
    saveGame(entered, adapter);
    const resumed = loadSave(adapter);
    expect(sceneText(dare.scenes.dareAfter, resumed)).toMatch(/moving shadow was a hanging coat in the draft/i);
  });

  it('retains the Headless Rider motive the Traveler already learned before leaving', () => {
    const rider = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-headless-rider')!;
    let state = stateAt(rider);
    for (const choice of ['callRider', 'offerHelp', 'leaveRiderTruth']) state = pick(state, rider, choice);
    const ending = sceneText(rider.scenes.riderFinish, state);
    expect(ending).toMatch(/used a hood and lantern to avoid recognition/i);
    expect(ending).toMatch(/older ridge tale remains unresolved/i);
    expect(ending).not.toMatch(/do not learn why it was made/i);
  });

  it('preserves a completed contest replay penalty across sequential content additions', () => {
    const contest = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'jack-o-lantern-contest')!;
    let state = stateAt(contest);
    for (const choice of ['enterCarve', 'simpleFace', 'shareAfterContest', 'contestComplete']) state = pick(state, contest, choice);
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(state.character?.scenarioPlayCounts?.[contest.id]).toBe(1);
    expect(state.recentScenarioIds?.[0]).toBe(contest.id);
    state = finishSuccess(state, null);
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) } as unknown as Storage;
    saveGame(state, storage);
    const addedOne = { ...contest, id: 'migration-added-october-one', title: 'New October Story One' };
    const firstDeployment = loadSave(storage);
    saveGame(firstDeployment, storage);
    const addedTwo = { ...contest, id: 'migration-added-october-two', title: 'New October Story Two' };
    const afterDeployment = loadSave(storage);
    const registry = [...SCENARIOS, addedOne, addedTwo];

    expect(afterDeployment.character?.id).toBe(state.character?.id);
    expect(afterDeployment.character?.adventuresCompleted).toBe(1);
    expect(afterDeployment.character?.scenarioPlayCounts?.[contest.id]).toBe(1);
    expect(afterDeployment.recentScenarioIds?.[0]).toBe(contest.id);
    expect(eligibleScenarios(registry, afterDeployment.recentScenarioIds, 10).some(({ id }) => id === contest.id)).toBe(false);
    const pressure = { scenarioPlayCounts: afterDeployment.character!.scenarioPlayCounts, categoryHistory: afterDeployment.character!.scenarioCategoryHistory, selectionMonth: 10 };
    const playedWeight = scenarioSelectionWeights(registry, pressure).find(({ scenario }) => scenario.id === contest.id)!;
    const freshWeight = scenarioSelectionWeights(registry, { categoryHistory: pressure.categoryHistory, selectionMonth: 10 }).find(({ scenario }) => scenario.id === contest.id)!;
    expect(playedWeight.replayWeight).toBe(0.15);
    expect(playedWeight.weight).toBeLessThan(freshWeight.weight);
    expect(scenarioSelectionWeights(registry, pressure).find(({ scenario }) => scenario.id === addedOne.id)?.completedPlays).toBe(0);
    expect(scenarioSelectionWeights(registry, pressure).find(({ scenario }) => scenario.id === addedTwo.id)?.completedPlays).toBe(0);

    // The exact replay-weight comparison above is deterministic; a 1,000-draw
    // Monte Carlo comparison was too noisy to reliably detect this small
    // weight change as unrelated all-year scenarios are added to the library.
  }, 15_000);

  it('makes the dare’s risk visible and allows both success and a costly fall', () => {
    const dare = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-halloween-dare')!;
    const atInside = pick(stateAt(dare), dare, 'enterDareHouse');
    const crossed = pick(atInside, dare, 'crossGap', () => 0);
    expect(crossed.run?.sceneId).toBe('dareRescue');
    const fell = pick(atInside, dare, 'crossGap', () => 0.99);
    expect(fell.run?.health).toBe(5);
    expect(fell.run?.sceneId).toBe('dareInjured');
  });

  it('allows the warned cornfield risk to succeed or become a lethal run ending', () => {
    const corn = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-man-in-the-corn')!;
    let state = stateAt(corn);
    state = pick(state, corn, 'enterCorn');
    const survived = pick(state, corn, 'pressCorn', () => 0);
    expect(survived.run?.status).toBe('active');
    expect(survived.run?.sceneId).toBe('cornFound');
    const died = pick(state, corn, 'pressCorn', () => 0.99);
    expect(died.run?.status).toBe('death');
    expect(died.run?.sceneId).toBe('cornKilled');
  });

  it('gives the masked-parcel mystery a fair evidence chain and state-aware aftermath', () => {
    const mystery = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-masked-visitor')!;
    let state = stateAt(mystery);
    state = pick(state, mystery, 'checkParcel');
    state = pick(state, mystery, 'checkYard');
    state = pick(state, mystery, 'speakPrivately');
    state = pick(state, mystery, 'searchCoats');
    state = pick(state, mystery, 'returnPapers');
    expect(state.run?.sceneId).toBe('maskedAfter');
    const text = mystery.scenes.maskedAfter.textVariants?.find(({ requirements }) => requirements.flags?.includes('papersRecovered'))?.text;
    expect(text).toContain('papers back');
    expect(text).toContain('No guest is blamed');
  });

  it('keeps the scarecrow observation route from inventing a farmhand admission, agreement, or Knowledge', () => {
    const scarecrow = OCTOBER_AFFINITY_ADVENTURES.find(({ id }) => id === 'the-scarecrow-changes-fields')!;

    let observed = stateAt(scarecrow);
    observed = pick(observed, scarecrow, 'watchAfterDark');
    observed = pick(observed, scarecrow, 'inspectPeg');
    expect(sceneText(scarecrow.scenes.scarecrowChoice, observed)).toMatch(/no account establishes who moved it/i);
    expect(sceneText(scarecrow.scenes.scarecrowChoice, observed)).not.toMatch(/farmhand admits/i);
    observed = pick(observed, scarecrow, 'anchorScarecrow');
    expect(sceneText(scarecrow.scenes.scarecrowAfter, observed)).not.toMatch(/farmhand agrees/i);

    let watched = stateAt(scarecrow);
    watched = pick(watched, scarecrow, 'watchAfterDark');
    watched = pick(watched, scarecrow, 'keepWatchingWithoutInterview');
    expect(watched.character?.knowledge).not.toContain('A loose peg and wind could turn the scarecrow toward the barn; a farmhand had also moved it between fields once.');

    let interviewed = stateAt(scarecrow);
    interviewed = pick(interviewed, scarecrow, 'askWorkers');
    interviewed = pick(interviewed, scarecrow, 'compareCloth');
    expect(sceneText(scarecrow.scenes.scarecrowChoice, interviewed)).toMatch(/farmhand admits moving it once/i);
    interviewed = pick(interviewed, scarecrow, 'askFarmhandOwnIt');
    expect(sceneText(scarecrow.scenes.scarecrowAfter, interviewed)).toMatch(/they agree to tell the farmer/i);

    let learned = stateAt(scarecrow);
    learned = pick(learned, scarecrow, 'askWorkers');
    learned = pick(learned, scarecrow, 'setWatch');
    learned = pick(learned, scarecrow, 'keepWatching');
    expect(learned.character?.knowledge).toContain('A loose peg and wind could turn the scarecrow toward the barn; a farmhand had also moved it between fields once.');
  });
});
