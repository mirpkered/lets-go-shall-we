import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { auditContentQuality } from '../contentQuality';
import { analyzeScenarioLibrary, validateScenarioMetadata } from '../scenarioDiversity';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { scenarioRiskTier } from '../riskClassification';
import { simulateScenarioSelection } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { ITEMS } from '../items';
import { EMPTY_SAVE, loadSave } from '../storage';
import { LOTTE_PIE_CONTACT, NESSA_CONTACT, NESSA_MEAL_FAVOR, OUTCOME_HISTORY_FLAGS } from '../travelerContinuity';
import type { SaveData, Scenario } from '../types';
import { SCENARIOS } from './index';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { COMPETITION_SURPRISE_ADVENTURES } from './surpriseCompetitionBatch';
import { EVERYDAY_SURPRISE_ADVENTURES } from './surpriseEverydayBatch';
import { SOCIAL_SURPRISE_ADVENTURES } from './surpriseSocialBatch';

const ANTHOLOGY = [...SOCIAL_SURPRISE_ADVENTURES, ...COMPETITION_SURPRISE_ADVENTURES, ...EVERYDAY_SURPRISE_ADVENTURES];

function start(scenario: Scenario, historyFlags: string[] = [], money = 2): SaveData {
  const character = newCharacter('Anthology Tester');
  character.historyFlags = [...historyFlags];
  character.money = money;
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string, roll?: number): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId} requirements`).toBe(true);
  return choose(state, scenario, choice!, () => roll ?? 0);
}

function explore(scenario: Scenario): number {
  const queue = [start(scenario)];
  const seen = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const run = state.run!;
    const key = JSON.stringify([run.sceneId, run.status, run.health, run.inventory, run.flags, run.visitedSceneIds, run.elapsedMinutes, state.character?.money, state.character?.historyFlags, state.character?.knowledge, state.character?.lore]);
    if (seen.has(key)) continue;
    seen.add(key);
    expect(new Set(run.visitedSceneIds).size, `${scenario.title} has no scene revisit`).toBe(run.visitedSceneIds?.length);
    if (run.status !== 'active') continue;
    const current = scenario.scenes[run.sceneId];
    expect(current, `${scenario.title}.${run.sceneId} exists`).toBeTruthy();
    expect(current.ending, `${scenario.title}.${current.id} active scene is not terminal`).toBeFalsy();
    const choices = current.choices.filter((choice) => meets(choice.requirements, state));
    expect(choices.length, `${scenario.title}.${current.id} has a valid action`).toBeGreaterThan(0);
    expect(choices.length, `${scenario.title}.${current.id} fits the 2x2 grid`).toBeLessThanOrEqual(4);
    for (const choice of choices) for (const roll of choice.chance ? [0, 0.999999] : [0]) {
      const next = choose(state, scenario, choice, () => roll);
      expect(next.run?.sceneId === run.sceneId && next.run?.status === 'active').toBe(false);
      queue.push(next);
    }
    expect(seen.size).toBeLessThan(3000);
  }
  return seen.size;
}

describe('surprise anthology and library gap-fill', () => {
  it('adds 38 distinct all-year adventures without changing existing stable IDs', () => {
    expect(ANTHOLOGY).toHaveLength(38);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(ANTHOLOGY.map(({ id }) => id)).size).toBe(38);
    expect(ANTHOLOGY.every((scenario) => SCENARIOS.includes(scenario))).toBe(true);
    expect(ANTHOLOGY.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
    expect(validateScenarioMetadata(ANTHOLOGY)).toEqual([]);
    expect(ANTHOLOGY.filter(({ diversity }) => diversity?.activities?.includes('competition/game')).length).toBeGreaterThanOrEqual(5);
    expect(ANTHOLOGY.filter(({ diversity }) => diversity?.activities?.includes('communication/witness')).length).toBeGreaterThanOrEqual(5);
    expect(SCENARIOS.slice(370, 408).map(({ id }) => id)).toEqual(ANTHOLOGY.map(({ id }) => id));
    const qaMarkup = renderQaPanel(true, structuredClone(EMPTY_SAVE), SCENARIOS, ITEMS);
    for (const scenario of ANTHOLOGY) expect(qaMarkup).toContain(`data-qa-start="${scenario.id}"`);
  });

  it('uses individually authored forward-only graphs with no active dead ends, unresolved labels, or oversized choice screens', () => {
    const shapes = new Set<string>();
    for (const scenario of ANTHOLOGY) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      shapes.add(Object.values(scenario.scenes).map(({ choices }) => choices.length).join('-'));
      for (const current of Object.values(scenario.scenes)) {
        expect(current.text.length, `${scenario.title}.${current.id} copy`).toBeLessThanOrEqual(400);
        expect(current.text).not.toMatch(/\{\{[^}]+\}\}/);
        expect(current.choices.length).toBeLessThanOrEqual(4);
        for (const choice of current.choices) expect(choice.label.length, `${scenario.title}.${current.id}.${choice.id}`).toBeLessThanOrEqual(70);
      }
      expect(explore(scenario), `${scenario.title} explores authored states`).toBeGreaterThan(1);
    }
    expect(shapes.size).toBeGreaterThanOrEqual(16);
  });

  it('gives games and demonstrations more than a single entry choice and a terminal result', () => {
    for (const scenario of COMPETITION_SURPRISE_ADVENTURES) {
      const activeScenes = Object.values(scenario.scenes).filter(({ ending }) => !ending);
      expect(activeScenes.length, scenario.title).toBeGreaterThanOrEqual(3);
      expect(Object.values(scenario.scenes).some(({ choices }) => choices.some(({ next }) => next && !scenario.scenes[next].ending)), scenario.title).toBe(true);
    }
    const audit = analyzeScenarioLibrary(COMPETITION_SURPRISE_ADVENTURES);
    expect(audit.structuralWarnings.length).toBeLessThan(20);
  });

  it('keeps The Pie with No Recipe centered on a clear, informed contest judgment', () => {
    const pie = COMPETITION_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-pie-with-no-recipe')!;
    expect(pie.id).toBe('the-pie-with-no-recipe');
    expect(pie.diversity?.playerRoles).toContain('judge');
    expect(pie.scenes.tasting.text).toMatch(/keeper asks you to judge taste, texture, and execution—not recipe ownership/i);

    const tastingNotes = pie.scenes.flavor.text;
    for (const detail of ['Hester’s plum-and-pepper pie', 'Lotte’s apple pie', 'Vale’s pear tart']) {
      expect(tastingNotes).toContain(detail);
    }
    expect(pie.scenes.accounts.text).toMatch(/keeper offers slices by card/i);
    expect(pie.scenes.accounts.text).toMatch(/ribbon goes to the entry you judge best/i);
    expect(pie.scenes.accounts.textVariants?.[0].requirements).toEqual({ flags: ['pie_entries_tasted'] });
    expect(pie.scenes.rule.text).toMatch(/prize is for the pie, not ownership/i);

    const award = pie.scenes.award;
    expect(award.choices.map(({ label }) => label)).toEqual([
      'Award Hester’s plum-and-pepper pie',
      'Award Lotte’s apple pie',
      'Award Vale’s pear tart',
      'Ask for a shared ribbon',
    ]);
    expect(award.choices.map(({ next }) => next)).toEqual(['winner', 'winnerApple', 'winnerPear', 'shared']);

    const fresh = start(pie);
    const alreadyTasted = act(fresh, pie, 'tasting', 'tasteBeforeNames');
    expect(meets(pie.scenes.accounts.textVariants![0].requirements, fresh)).toBe(false);
    expect(meets(pie.scenes.accounts.textVariants![0].requirements, alreadyTasted)).toBe(true);
    for (const [choiceId, endingId] of [
      ['awardPlum', 'winner'],
      ['awardApple', 'winnerApple'],
      ['awardPear', 'winnerPear'],
      ['splitRibbon', 'shared'],
    ] as const) {
      let result = act(start(pie), pie, 'tasting', 'tasteBeforeNames');
      result = act(result, pie, 'flavor', 'judgeTasteOnly');
      result = act(result, pie, 'award', choiceId);
      expect(result.run?.sceneId).toBe(endingId);
      expect(result.run?.status).toBe('success');
      expect(result.character?.knowledge).toEqual([]);
      expect(result.character?.knowledgeKeys).toEqual([]);
      expect(result.character?.lore).toEqual([]);
      expect(result.character?.historyFlags).toEqual(choiceId === 'awardPlum' ? [OUTCOME_HISTORY_FLAGS.awardedHestersPie] : []);
      expect(result.character?.contacts?.some(({ id }) => id === LOTTE_PIE_CONTACT.id)).toBe(choiceId === 'awardPlum');
    }
    for (const current of Object.values(pie.scenes)) for (const choice of current.choices) {
      expect(choice.effects?.knowledge).toBeUndefined();
      expect(choice.effects?.lore).toBeUndefined();
      if (current.id === 'award' && choice.id === 'awardPlum') {
        expect(choice.effects?.historyFlags).toEqual([OUTCOME_HISTORY_FLAGS.awardedHestersPie]);
        expect(choice.effects?.gainContacts).toEqual([LOTTE_PIE_CONTACT]);
      } else {
        expect(choice.effects?.historyFlags).toBeUndefined();
      }
    }
    const recipeFirst = act(act(start(pie), pie, 'tasting', 'askAboutRecipe'), pie, 'accounts', 'separateRecipeAndPrize');
    expect(recipeFirst.run?.sceneId).toBe('award');
    const keeperRoute = act(act(act(start(pie), pie, 'tasting', 'askAboutRecipe'), pie, 'accounts', 'askFairKeeper'), pie, 'rule', 'acceptRule');
    expect(keeperRoute.run?.sceneId).toBe('award');
    expect(pie.scenes.winner.text).toMatch(/Hester accepts the ribbon/i);
    expect(pie.scenes.winnerApple.text).toMatch(/Lotte accepts the ribbon/i);
    expect(pie.scenes.winnerPear.text).toMatch(/Vale accepts the ribbon/i);
    expect(pie.scenes.shared.text).toMatch(/share the ribbon/i);
  });

  it('uses current-run history, knowledge, and carried gear only when the related experience exists', () => {
    const supper = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'supper-at-the-inn')!;
    const fresh = start(supper);
    expect(supper.scenes.kitchen.choices.find(({ id }) => id === 'callOnOldCourtesy')?.requirements).toEqual({ contacts: [NESSA_CONTACT.id], favors: [NESSA_MEAL_FAVOR.id] });
    expect(meets(supper.scenes.kitchen.choices.find(({ id }) => id === 'callOnOldCourtesy')!.requirements, fresh)).toBe(false);
    const legacy = start(supper, ['improvised_a_kitchen_work_cloth_from_clean_sack']);
    const returning = loadSave({ getItem: () => JSON.stringify(legacy) });
    expect(meets(supper.scenes.kitchen.choices.find(({ id }) => id === 'callOnOldCourtesy')!.requirements, returning)).toBe(true);

    const lamp = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-back-room-lantern')!;
    const withKit = start(lamp);
    expect(meets(lamp.scenes.shop.choices.find(({ id }) => id === 'useLantern')!.requirements, withKit)).toBe(true);
    const withoutLantern = structuredClone(withKit);
    withoutLantern.run!.inventory = withoutLantern.run!.inventory.filter((id) => id !== 'lantern');
    expect(meets(lamp.scenes.shop.choices.find(({ id }) => id === 'useLantern')!.requirements, withoutLantern)).toBe(false);
    expect(lamp.scenes.shop.choices.some(({ id }) => id === 'searchByTouch')).toBe(true);

    const care = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'a-chair-beside-the-sickbed')!;
    const knows = start(care, [KNOWLEDGE_FACTS.riverBendSupper.text]);
    knows.character!.knowledge = [KNOWLEDGE_FACTS.riverBendSupper.text];
    knows.character!.knowledgeKeys = [KNOWLEDGE_FACTS.riverBendSupper.id];
    expect(meets(care.scenes.company.choices.find(({ id }) => id === 'shareKnownRiverFact')!.requirements, knows)).toBe(true);
    expect(meets(care.scenes.company.choices.find(({ id }) => id === 'shareKnownRiverFact')!.requirements, start(care))).toBe(false);
  });

  it('lets the traveler err, exploit ambiguity, and see a consequence without guaranteed moral punishment', () => {
    const toss = COMPETITION_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-three-ring-toss')!;
    expect(Object.values(toss.scenes).flatMap(({ choices }) => choices).every(({ effects }) => effects?.money === undefined)).toBe(true);
    expect(toss.diversity?.rewardShapes).toEqual(['narrative-only payoff']);

    const parcel = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-parcel-with-no-address')!;
    let state = act(start(parcel), parcel, 'counter', 'askEachMercer');
    state = act(state, parcel, 'claims', 'takeWrongfulRisk');
    state = act(state, parcel, 'opened', 'giveBookToClaimant');
    expect(state.run?.sceneId).toBe('taken');
    expect(state.character?.historyFlags).toContain('opened_an_unclaimed_parcel_to_resolve_a_station_dispute');

    const curtain = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-pocket-in-the-curtain')!;
    const quietChoice = act(start(curtain), curtain, 'curtain', 'keepNote');
    expect(quietChoice.run?.sceneId).toBe('kept');
    expect(quietChoice.run?.status).toBe('success');
  });

  it('keeps explicit danger fair and accurately resolves injury and death branches', () => {
    const stage = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-stage-rigging')!;
    const risky = stage.scenes.stage.choices.find(({ id }) => id === 'grabLooseLine')!;
    expect(risky.hint).toMatch(/load is twisting overhead/i);
    expect(risky.chance?.probability).toBeGreaterThan(0);
    expect(risky.chance?.probability).toBeLessThan(1);
    expect(act(start(stage), stage, 'stage', 'grabLooseLine', 0).run?.status).toBe('success');
    expect(act(start(stage), stage, 'stage', 'grabLooseLine', 0.999999).run?.status).toBe('death');
    expect(scenarioRiskTier(stage)).toBe('HIGH');

    const table = EVERYDAY_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-trestle-table')!;
    const hurt = act(start(table), table, 'market', 'holdLeg', 0.999999);
    expect(hurt.run?.health).toBe(9);
    expect(hurt.run?.sceneId).toBe('cut');
    const asked = act(act(act(start(table), table, 'market', 'warnSeller'), table, 'warning', 'fetchCrate'), table, 'crate', 'askForPayment');
    expect(asked.run?.sceneId).toBe('safe');
    const paid = act(asked, table, 'safe', 'takeMarketCoin');
    const offered = act(act(act(start(table), table, 'market', 'warnSeller'), table, 'warning', 'fetchCrate'), table, 'crate', 'finishMarket');
    const accepted = act(offered, table, 'safe', 'takeMarketCoin');
    const unpaid = act(offered, table, 'safe', 'declineMarketCoin');
    expect(paid.character?.money).toBe(3);
    expect(accepted.character?.money).toBe(3);
    expect(unpaid.character?.money).toBe(2);
    expect(unpaid.run?.sceneId).toBe('safeEnd');
    expect(scenarioRiskTier(table)).toBe('MODERATE');
  });

  it('preserves exact state across a save/reload boundary and keeps the selector shared', () => {
    const story = SOCIAL_SURPRISE_ADVENTURES.find(({ id }) => id === 'the-toast-nobody-ordered')!;
    const state = act(start(story), story, 'supper', 'askCouple');
    const restored = structuredClone(state);
    expect(restored).toEqual(state);
    expect(act(restored, story, 'couple', 'honorBride')).toEqual(act(state, story, 'couple', 'honorBride'));

    let seed = 30862;
    const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    const result = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 6 }, 1000, random);
    expect(Object.values(result.scenarioCounts).reduce((total, count) => total + count, 0)).toBe(1000);
    expect(result.scenarioCounts['the-stage-rigging'] ?? 0).toBeLessThan(30);
    expect(result.seasonalCount).toBeLessThan(1000);
  });

  it('keeps the collection inside the selector’s low-risk share and without new combat or fantasy', () => {
    expect(ANTHOLOGY.filter((scenario) => scenarioRiskTier(scenario) === 'LOW').length).toBe(36);
    expect(ANTHOLOGY.filter((scenario) => scenarioRiskTier(scenario) === 'MODERATE').length).toBe(1);
    expect(ANTHOLOGY.filter((scenario) => scenarioRiskTier(scenario) === 'HIGH').length).toBe(1);
    expect(ANTHOLOGY.every(({ diversity }) => diversity?.fantasyDensity === 'NONE')).toBe(true);
    expect(ANTHOLOGY.every(({ diversity }) => diversity?.combat === 'NONE')).toBe(true);
    const quality = auditContentQuality(ANTHOLOGY);
    expect(quality.warnings.filter(({ severity }) => severity === 'HIGH')).toEqual([]);
  });
});
