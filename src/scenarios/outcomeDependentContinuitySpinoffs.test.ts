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
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, familyRun)).toContain('You accepted Mara’s family-transmitted ending');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, printedRun)).toContain('You favored the printed version');
    expect(sceneText(A_LINE_FOR_THE_BROADSIDE.scenes.proof, printedRun)).not.toContain('proof of where it began');
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
  });
});
