import { describe, expect, it } from 'vitest';
import { analyzeScenarioLibrary, scenarioAvailableInMonth, validateScenarioMetadata, classifyScenario } from '../scenarioDiversity';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { eligibleScenarioResult, scenarioSelectionWeights, selectionDiagnostics, simulateScenarioSelection } from '../scenarioSelection';
import { scenarioRiskTier } from '../riskClassification';
import { auditContentQuality } from '../contentQuality';
import { choose, newCharacter, sceneText, startRun } from '../engine';
import { ITEMS } from '../items';
import { renderQaPanel } from '../qaPanel';
import type { SaveData, Scenario } from '../types';
import { CHRISTMAS_ADVENTURES } from './christmasAffinityBatch';
import { SCENARIOS } from './index';

function fresh(scenario: Scenario): SaveData {
  const character = newCharacter('December Test');
  return { version: 1, bank: [], character, run: startRun(character, scenario) };
}
function pick(state: SaveData, scenario: Scenario, choiceId: string, random = () => 0): SaveData {
  const scene = scenario.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  if (!choice) throw new Error(`Missing ${scenario.title}.${scene.id}.${choiceId}`);
  return choose(state, scenario, choice, random);
}

describe('Christmas and winter-affinity adventures', () => {
  it('registers 28 distinct stories and locks only holiday-dependent premises to December', () => {
    expect(CHRISTMAS_ADVENTURES).toHaveLength(28);
    expect(SCENARIOS).toHaveLength(445);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    const locked = CHRISTMAS_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'DECEMBER');
    expect(locked.map(({ title }) => title)).toEqual([
      'The Christmas Goose', 'The Last Parcel Before Christmas', 'A Place at the Table', 'The Carolers at the Wrong House',
      'The Christmas Tree on Miller’s Hill', 'The Gift with No Name', 'Christmas at the Station', 'The Missing Stocking',
      'The Toymaker’s Last Order', 'The Pageant Problem', 'The Stranger’s Christmas Dinner', 'Three Gifts, Two Labels',
      'The Christmas Visitor', 'The Empty Chair at Midnight', 'The Evergreen Door', 'The Gift That Came Back',
    ]);
    for (const scenario of locked) {
      expect(scenarioAvailableInMonth(scenario, 12), scenario.title).toBe(true);
      for (const month of [1, 2, 3, 7, 11]) expect(scenarioAvailableInMonth(scenario, month), scenario.title).toBe(false);
    }
    expect(CHRISTMAS_ADVENTURES.some(({ title }) => title === 'The Twelve Knocks')).toBe(false);
  });

  it('keeps winter and December affinity stories eligible year-round with only modest authored boosts', () => {
    const affinity = CHRISTMAS_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR');
    expect(affinity).toHaveLength(12);
    for (const scenario of affinity) for (let month = 1; month <= 12; month++) expect(scenarioAvailableInMonth(scenario, month), scenario.title).toBe(true);
    const dec = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'last-parcel-before-christmas')!;
    const decemberAffinity = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-frozen-letter')!;
    const winterAffinity = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'road-under-snow')!;
    expect(scenarioSelectionWeights([dec], { selectionMonth: 12 })[0].seasonalWeight).toBe(1.6);
    expect(scenarioSelectionWeights([dec], { selectionMonth: 1 })).toEqual([]);
    expect(scenarioSelectionWeights([decemberAffinity], { selectionMonth: 12 })[0].seasonalWeight).toBe(1.35);
    expect(scenarioSelectionWeights([decemberAffinity], { selectionMonth: 1 })[0].seasonalWeight).toBe(1);
    expect(scenarioSelectionWeights([winterAffinity], { selectionMonth: 12 })[0].seasonalWeight).toBe(1.25);
    expect(scenarioSelectionWeights([winterAffinity], { selectionMonth: 1 })[0].seasonalWeight).toBe(1.25);
    expect(scenarioSelectionWeights([winterAffinity], { selectionMonth: 7 })[0].seasonalWeight).toBe(1);
  });

  it('keeps seasonal eligibility separate from recent exclusion and replay pressure', () => {
    const locked = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'christmas-at-the-station')!;
    const affinity = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'snowbound-inn')!;
    expect(eligibleScenarioResult([locked, affinity], [locked.id], 12).scenarios.map(({ id }) => id)).toEqual([affinity.id]);
    const replayed = selectionDiagnostics([locked, affinity], [], { selectionMonth: 12, scenarioPlayCounts: { [affinity.id]: 1 } });
    expect(replayed.scenarios.find(({ scenario }) => scenario.id === affinity.id)?.replayWeight).toBe(0.15);
    expect(replayed.scenarios.find(({ scenario }) => scenario.id === affinity.id)?.seasonalWeight).toBe(1.25);
    const july = eligibleScenarioResult([locked, affinity], [], 7);
    expect(july.scenarios.map(({ id }) => id)).toEqual([affinity.id]);
  });

  it('shows December and winter affinity accurately in QA and leaves a started run alone when the month changes', () => {
    const winter = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'road-under-snow')!;
    const affinity = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-frozen-letter')!;
    const december = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'last-parcel-before-christmas')!;
    const empty: SaveData = { version: 1, bank: [], character: null, run: null };
    expect(renderQaPanel(true, empty, [winter], ITEMS, 1)).toContain('eligible · Winter affinity ×1.25');
    expect(renderQaPanel(true, empty, [affinity], ITEMS, 12)).toContain('eligible · December affinity ×1.35');
    expect(renderQaPanel(true, empty, [affinity], ITEMS, 7)).toContain('eligible · December affinity inactive');
    expect(renderQaPanel(true, empty, [december], ITEMS, 7)).toContain('out of season');
    const active = fresh(december);
    expect(scenarioAvailableInMonth(december, 7)).toBe(false);
    expect(active.run?.sceneId).toBe(december.startScene);
  });

  it('shows meaningful Christmas play, safe-route choice, and state-matched consequences', () => {
    const goose = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-christmas-goose')!;
    let state = pick(fresh(goose), goose, 'followPrints');
    expect(state.run?.sceneId).toBe('creek');
    state = pick(state, goose, 'coaxGoose');
    expect(state.run?.sceneId).toBe('reunion');
    expect(goose.scenes.reunion.text).not.toMatch(/neighbor arrives|apology/i);

    const stocking = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-missing-stocking')!;
    let found = pick(fresh(stocking), stocking, 'askBrother');
    found = pick(found, stocking, 'searchStable');
    found = pick(found, stocking, 'quietReturn');
    expect(sceneText(stocking.scenes.reunion, found)).toMatch(/original stocking/i);

    const station = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'christmas-at-the-station')!;
    const fedChildren = pick(pick(pick(fresh(station), station, 'organizeSoup'), station, 'serveChildren'), station, 'sharedAfter');
    expect(sceneText(station.scenes.sharedMeal, fedChildren)).toMatch(/children receive the first hot bowls/i);
    const shared = pick(pick(fresh(station), station, 'organizeSoup'), station, 'stretchSoup');
    expect(sceneText(station.scenes.sharedMeal, shared)).not.toMatch(/children receive the first hot bowls/i);
  });

  it('keeps the non-urgent miller-letter branch reachable as its own deliberate ending', () => {
    const letter = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-frozen-letter')!;
    let state = pick(fresh(letter), letter, 'liftSatchel');
    state = pick(state, letter, 'takeToMill');
    state = pick(state, letter, 'askMiller');
    state = pick(state, letter, 'contextEnd');
    expect(state.run?.status).toBe('success');
    expect(state.run?.sceneId).toBe('contextEnd');
    expect(letter.scenes.contextEnd.text).toContain('not an emergency');
    expect(findScenarioGraphProblems(letter)).toEqual([]);
  });

  it('lets a foreshadowed route under snow succeed and keeps its failed escalation stateful', () => {
    const road = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'road-under-snow')!;
    let safe = pick(fresh(road), road, 'traceFence');
    safe = pick(safe, road, 'crossRidge', () => 0);
    expect(safe.run?.sceneId).toBe('ridge');
    safe = pick(safe, road, 'followHighPosts');
    expect(safe.run?.sceneId).toBe('farmGate');
    let failed = pick(pick(fresh(road), road, 'traceFence'), road, 'crossRidge', () => 0.999999);
    expect(failed.run?.sceneId).toBe('slide');
    failed = pick(failed, road, 'climbPosts', () => 0.999999);
    expect(failed.run?.sceneId).toBe('roadDeath');
    expect(failed.run?.status).toBe('death');
  });

  it('simulates December, January, and July through the shared selector without category lock-in', () => {
    const seeded = (initial: number) => { let seed = initial; return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646; };
    const dec = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 12 }, 500, seeded(1212));
    const jan = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 1 }, 500, seeded(101));
    const jul = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 7 }, 500, seeded(707));
    const lockedIds = CHRISTMAS_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'DECEMBER').map(({ id }) => id);
    const affinityIds = CHRISTMAS_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR').map(({ id }) => id);
    expect(lockedIds.some((id) => (dec.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    expect(lockedIds.every((id) => (jan.scenarioCounts[id] ?? 0) === 0 && (jul.scenarioCounts[id] ?? 0) === 0)).toBe(true);
    expect(affinityIds.some((id) => (dec.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    expect(affinityIds.some((id) => (jan.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    expect(affinityIds.some((id) => (jul.scenarioCounts[id] ?? 0) > 0)).toBe(true);
    for (const report of [dec, jan, jul]) expect(Object.keys(report.categoryCounts).length).toBeGreaterThan(1);
    const christmasActivities = new Set(CHRISTMAS_ADVENTURES.filter(({ diversity }) => diversity?.availability?.season === 'DECEMBER').map((entry) => classifyScenario(entry).activities[0]));
    expect(christmasActivities.size).toBeGreaterThan(4);
  }, 20_000);

  it('validates all authored metadata, forward-only graphs, action counts, and concise mobile labels', () => {
    expect(validateScenarioMetadata(CHRISTMAS_ADVENTURES)).toEqual([]);
    for (const scenario of CHRISTMAS_ADVENTURES) {
      expect(scenarioRiskTier(scenario), scenario.title).toBe(scenario.diversity?.riskTier);
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const entry of Object.values(scenario.scenes)) {
        if (!entry.ending) expect(entry.choices.length, `${scenario.title}: ${entry.id}`).toBeGreaterThan(0);
        expect(entry.choices.length, `${scenario.title}: ${entry.id}`).toBeLessThanOrEqual(4);
        for (const choice of entry.choices) expect(choice.label.length, `${scenario.title}: ${choice.id}`).toBeLessThanOrEqual(44);
      }
    }
    const analysis = analyzeScenarioLibrary(CHRISTMAS_ADVENTURES);
    expect(analysis.total).toBe(28);
    const quality = auditContentQuality(CHRISTMAS_ADVENTURES);
    expect(quality.scenarioCount).toBe(28);
    expect(quality.warningCounts.ONE_WAGER_TERMINAL).toBe(0);
    expect(quality.warningCounts.PROCEDURAL_TERMINAL).toBe(0);
    expect(quality.warningCounts.AGREEMENT_TERMINAL).toBe(0);
  });

  it('maintains different structures, including distinct visitor and table stories', () => {
    const titles = CHRISTMAS_ADVENTURES.map(({ title }) => title);
    expect(titles).toContain('The Christmas Visitor');
    expect(titles).toContain('The Visitor at Midnight');
    expect(titles).toContain('A Place at the Table');
    expect(titles).toContain('The Empty Chair at Midnight');
    const visitor = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-christmas-visitor')!;
    const midnight = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'visitor-at-midnight')!;
    expect(visitor.diversity?.availability?.season).toBe('DECEMBER');
    expect(midnight.diversity?.availability?.season).toBe('ALL_YEAR');
    expect(midnight.diversity?.availability?.affinityMonths).toEqual([12]);
    expect(visitor.scenes.door.text).not.toBe(midnight.scenes.door.text);
    expect(visitor.scenes.door.choices.map(({ id }) => id)).toContain('inviteGuest');
    expect(midnight.scenes.door.choices.map(({ id }) => id)).toContain('refuseVisitor');
  });
});
