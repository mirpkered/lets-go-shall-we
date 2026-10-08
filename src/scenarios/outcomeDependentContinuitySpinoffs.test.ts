import { describe, expect, it } from 'vitest';
import { choose, newCharacter, sceneText, startAdventure } from '../engine';
import { eligibleScenarioResult, selectScenario } from '../scenarioSelection';
import { LOTTE_PIE_CONTACT, OUTCOME_HISTORY_FLAGS } from '../travelerContinuity';
import type { SaveData, Scenario } from '../types';
import { A_LINE_FOR_THE_BROADSIDE, COMPETITION_SURPRISE_ADVENTURES, NOTES_AFTER_THE_RIBBON, THE_LAST_VERSE_CONTEST, THE_PIE_WITH_NO_RECIPE } from './surpriseCompetitionBatch';
import { SCENARIOS } from './index';

const baseSave = (name: string): SaveData => ({ version: 1, bank: [], character: newCharacter(name), run: null });

function play(scenario: Scenario, state: SaveData, choiceIds: string[]): SaveData {
  let current = state;
  for (const choiceId of choiceIds) {
    const scene = scenario.scenes[current.run!.sceneId];
    const choice = scene.choices.find(({ id }) => id === choiceId);
    if (!choice) throw new Error(`Missing choice ${scenario.id}.${scene.id}.${choiceId}`);
    current = choose(current, scenario, choice, () => 0);
  }
  return current;
}

function pieOutcome(...choiceIds: string[]): SaveData {
  return play(THE_PIE_WITH_NO_RECIPE, startAdventure(baseSave('Pie tester'), THE_PIE_WITH_NO_RECIPE), choiceIds);
}

function verseOutcome(...choiceIds: string[]): SaveData {
  return play(THE_LAST_VERSE_CONTEST, startAdventure(baseSave('Verse tester'), THE_LAST_VERSE_CONTEST), choiceIds);
}

describe('outcome-dependent continuity spin-offs', () => {
  it('registers exactly two new Adventures without changing existing stable IDs', () => {
    expect(SCENARIOS).toHaveLength(861);
    expect(SCENARIOS.filter(({ id }) => ['notes-after-the-ribbon', 'a-line-for-the-broadside'].includes(id))).toHaveLength(2);
    expect(THE_PIE_WITH_NO_RECIPE.id).toBe('the-pie-with-no-recipe');
    expect(THE_LAST_VERSE_CONTEST.id).toBe('the-last-verse-contest');
    expect(COMPETITION_SURPRISE_ADVENTURES).toContain(NOTES_AFTER_THE_RIBBON);
    expect(COMPETITION_SURPRISE_ADVENTURES).toContain(A_LINE_FOR_THE_BROADSIDE);
  });

  it('records Lotte and the exact fair result only when Hester receives the ribbon', () => {
    const hester = pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPlum');
    expect(hester.character?.historyFlags).toContain(OUTCOME_HISTORY_FLAGS.awardedHestersPie);
    expect(hester.character?.contacts?.map(({ id }) => id)).toContain(LOTTE_PIE_CONTACT.id);

    for (const other of [
      pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardApple'),
      pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPear'),
      pieOutcome('askAboutRecipe', 'separateRecipeAndPrize', 'splitRibbon'),
      pieOutcome('declineAward'),
    ]) {
      expect(other.character?.historyFlags).not.toContain(OUTCOME_HISTORY_FLAGS.awardedHestersPie);
      expect(other.character?.contacts?.map(({ id }) => id)).not.toContain(LOTTE_PIE_CONTACT.id);
    }
  });

  it('keeps Notes After the Ribbon out of the fresh pool and requires both outcome and Contact', () => {
    const fresh = newCharacter('Fresh');
    expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, fresh).scenarios).toEqual([]);
    expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, fresh).seasonEligibleCount).toBe(0);
    expect(selectScenario([NOTES_AFTER_THE_RIBBON], [], () => 0, { character: fresh })).toBeUndefined();

    const hester = pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPlum');
    const historyOnly = { ...hester.character!, contacts: [] };
    expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, historyOnly).scenarios).toEqual([]);
    expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, hester.character).scenarios).toEqual([NOTES_AFTER_THE_RIBBON]);
    expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, hester.character).seasonEligibleCount).toBe(1);
    expect(selectScenario([NOTES_AFTER_THE_RIBBON], [], () => 0, { character: hester.character })?.id).toBe(NOTES_AFTER_THE_RIBBON.id);

    for (const other of [
      pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardApple'),
      pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPear'),
      pieOutcome('askAboutRecipe', 'separateRecipeAndPrize', 'splitRibbon'),
      pieOutcome('declineAward'),
    ]) expect(eligibleScenarioResult([NOTES_AFTER_THE_RIBBON], [], 7, other.character).scenarios).toEqual([]);
  });

  it('lets Lotte follow through with a new documentation problem, not a second contest', () => {
    const source = pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPlum');
    const start = startAdventure(source, NOTES_AFTER_THE_RIBBON);
    const result = play(NOTES_AFTER_THE_RIBBON, start, ['readHesterCard', 'compareHesterNotes', 'keepAccountsSeparate']);
    expect(result.character?.contacts?.map(({ id }) => id)).toContain(LOTTE_PIE_CONTACT.id);
    expect(result.character?.historyFlags).toContain('preserved_separate_mrs_orrow_recipe_memories');
    expect(result.character?.lore).toContain('At a county-fair table, Hester and Lotte’s distinct memories of Mrs. Orrow’s plum-and-pepper pie method were recorded under their own names; neither account establishes an original recipe.');
    expect(result.character?.knowledge).toEqual(source.character?.knowledge);
    expect(result.character?.favors).toEqual(source.character?.favors);

    const composite = play(NOTES_AFTER_THE_RIBBON, startAdventure(source, NOTES_AFTER_THE_RIBBON), ['askValeClaim', 'leaveWithoutNamingAnOriginal', 'labelWorkingComposite']);
    expect(composite.character?.lore).toContain('The fair bakers made a working plum-and-pepper pie card from Hester’s measures and Lotte’s seasoning phrase, labeled as their composite rather than Mrs. Orrow’s original recipe.');
    const deferred = play(NOTES_AFTER_THE_RIBBON, startAdventure(source, NOTES_AFTER_THE_RIBBON), ['readLotteCard', 'compareLotteNotes', 'deferTheCard']);
    expect(deferred.character?.lore).toEqual(source.character?.lore);
  });

  it('reorients the player and keeps Vale outside the Mrs. Orrow recipe disagreement', () => {
    const source = pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPlum');
    const state = startAdventure(source, NOTES_AFTER_THE_RIBBON);
    const opening = sceneText(NOTES_AFTER_THE_RIBBON.scenes.notes, state);

    expect(opening).toContain('At the last fair, Hester’s plum-and-pepper pie won the ribbon');
    expect(opening).toContain('Hester recalls Mrs. Orrow’s measures and folded crust; Lotte remembers');
    expect(opening).toContain('Lotte asked to compare notes afterward');
    expect(opening).toContain('a supper needs a display card');
    expect(opening).toContain('Vale’s pear filling was her own');
    expect(opening).toContain('she made no claim to Orrow’s method');
    expect(NOTES_AFTER_THE_RIBBON.scenes.notes.choices.find(({ id }) => id === 'askValeClaim')?.label).toBe('Ask Vale how her pear filling should be credited');
  });

  it('gives each supper-card decision its own persistent, truthful result', () => {
    const source = pieOutcome('tasteBeforeNames', 'judgeTasteOnly', 'awardPlum');
    const routes = [
      { choices: ['readHesterCard', 'compareHesterNotes', 'keepAccountsSeparate'], flag: 'preserved_separate_mrs_orrow_recipe_memories', lore: true },
      { choices: ['readLotteCard', 'compareLotteNotes', 'labelWorkingComposite'], flag: 'labeled_fair_bakers_working_recipe_composite', lore: true },
      { choices: ['readHesterCard', 'compareHesterNotes', 'printOnlyTastingNotes'], flag: 'kept_recipe_claim_out_of_fair_supper_notes', lore: false },
      { choices: ['readLotteCard', 'compareLotteNotes', 'deferTheCard'], flag: 'deferred_mrs_orrow_recipe_record_for_more_accounts', lore: false },
    ];

    for (const route of routes) {
      const result = play(NOTES_AFTER_THE_RIBBON, startAdventure(source, NOTES_AFTER_THE_RIBBON), route.choices);
      expect(result.character?.historyFlags).toContain(route.flag);
      expect(result.character?.lore.length).toBe(source.character!.lore.length + (route.lore ? 1 : 0));
      expect(result.character?.knowledge).toEqual(source.character?.knowledge);
      expect(result.character?.favors).toEqual(source.character?.favors);
      expect(result.character?.contacts?.map(({ id }) => id)).toContain(LOTTE_PIE_CONTACT.id);
    }
  });

  it('records family and printed Last Verse Contest outcomes separately while retaining legacy Knowledge', () => {
    const family = verseOutcome('askForSource', 'compareVersions', 'judgeByMemory');
    expect(family.character?.historyFlags).toContain(OUTCOME_HISTORY_FLAGS.acceptedFamilyVerse);
    expect(family.character?.knowledge).toContain('The recitation contest accepted a family-transmitted verse absent from the printed broadside.');

    const printed = verseOutcome('hearAllReciters', 'judgeByPrint');
    expect(printed.character?.historyFlags).toContain(OUTCOME_HISTORY_FLAGS.favoredPrintedVerse);
    expect(printed.character?.historyFlags).not.toContain(OUTCOME_HISTORY_FLAGS.acceptedFamilyVerse);
    expect(printed.character?.knowledge).not.toContain('The recitation contest accepted a family-transmitted verse absent from the printed broadside.');

    const audience = verseOutcome('hearAllReciters', 'askForAudienceChoice');
    expect(audience.character?.historyFlags).not.toContain(OUTCOME_HISTORY_FLAGS.acceptedFamilyVerse);
    expect(audience.character?.historyFlags).not.toContain(OUTCOME_HISTORY_FLAGS.favoredPrintedVerse);
  });

  it('gates A Line for the Broadside to either meaningful contest outcome and changes the opening', () => {
    expect(eligibleScenarioResult([A_LINE_FOR_THE_BROADSIDE], [], 7, newCharacter('Fresh')).scenarios).toEqual([]);
    const family = verseOutcome('askForSource', 'compareVersions', 'judgeByMemory');
    const printed = verseOutcome('hearAllReciters', 'judgeByPrint');
    const audience = verseOutcome('hearAllReciters', 'askForAudienceChoice');
    expect(eligibleScenarioResult([A_LINE_FOR_THE_BROADSIDE], [], 7, family.character).scenarios).toEqual([A_LINE_FOR_THE_BROADSIDE]);
    expect(eligibleScenarioResult([A_LINE_FOR_THE_BROADSIDE], [], 7, printed.character).scenarios).toEqual([A_LINE_FOR_THE_BROADSIDE]);
    expect(eligibleScenarioResult([A_LINE_FOR_THE_BROADSIDE], [], 7, audience.character).scenarios).toEqual([]);

    const familyRun = startAdventure(family, A_LINE_FOR_THE_BROADSIDE);
    const printedRun = startAdventure(printed, A_LINE_FOR_THE_BROADSIDE);
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, familyRun)).toContain('you accepted Mara Bell’s family-transmitted ending');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, printedRun)).toContain('you favored the ending in the printed broadside');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, printedRun)).not.toContain('proof of where it began');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, familyRun)).toContain('absent from the printed broadside');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, familyRun)).toContain('printer Ansel Reed has left space on a new broadside');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, printedRun)).toContain('how it should handle that unverified version');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, familyRun)).toContain('asks whether to print it, attribute it, note it, or leave the old text unchanged');
  });

  it('stores Lore only when a family verse is actually preserved and creates Ansel as a Contact', () => {
    const family = verseOutcome('askForSource', 'compareVersions', 'judgeByMemory');
    const start = startAdventure(family, A_LINE_FOR_THE_BROADSIDE);
    const oral = play(A_LINE_FOR_THE_BROADSIDE, start, ['askMara', 'takeVersionToProof', 'printFamilyWithSource']);
    expect(oral.character?.lore).toContain('Mara Bell’s family-transmitted missing verse was printed beside the town broadside as an oral variant; its age and origin remain unverified.');
    expect(oral.character?.contacts?.map(({ id }) => id)).toContain('ansel-reed-printer');
    expect(oral.character?.favors).toEqual(family.character?.favors);
    expect(oral.character?.knowledge).toEqual(family.character?.knowledge);

    const noVerse = play(A_LINE_FOR_THE_BROADSIDE, startAdventure(family, A_LINE_FOR_THE_BROADSIDE), ['inspectOldBroadside', 'markTheBlank', 'printSourceNoteOnly']);
    expect(noVerse.character?.lore).toEqual(family.character?.lore);
    expect(noVerse.character?.historyFlags).toContain('noted_unverified_family_verse_without_printing_it');

    const printed = verseOutcome('hearAllReciters', 'judgeByPrint');
    const both = play(A_LINE_FOR_THE_BROADSIDE, startAdventure(printed, A_LINE_FOR_THE_BROADSIDE), ['askAnselSpace', 'chooseTwoColumns', 'printBothVersions']);
    expect(both.character?.lore).toContain('Ansel Reed’s broadside preserves Mara Bell’s family-transmitted missing verse beside the printed version as an oral variant; its age and origin remain unverified.');

    const sourceNote = play(A_LINE_FOR_THE_BROADSIDE, startAdventure(family, A_LINE_FOR_THE_BROADSIDE), ['askMara', 'takeVersionToProof', 'printSourceNoteOnly']);
    expect(sourceNote.character?.historyFlags).toContain('noted_unverified_family_verse_without_printing_it');
    expect(sourceNote.character?.lore).toEqual(family.character?.lore);
    expect(sourceNote.character?.contacts?.map(({ id }) => id)).toContain('ansel-reed-printer');

    const unchanged = play(A_LINE_FOR_THE_BROADSIDE, startAdventure(family, A_LINE_FOR_THE_BROADSIDE), ['inspectOldBroadside', 'markTheBlank', 'keepOldText']);
    expect(unchanged.character?.historyFlags).toContain('kept_broadside_unchanged_over_unverified_verse');
    expect(unchanged.character?.lore).toEqual(family.character?.lore);
  });
});
