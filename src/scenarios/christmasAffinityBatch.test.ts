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
  it('recognizes the Black Milling Stone as a comparison clue at an old mill bearing', () => {
    const scenario = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'frozen-millwheel')!;
    const character = newCharacter('Millwright Explorer');
    character.carriedItem = 'blackMillingStone';
    const state = fresh(scenario);
    state.character = character;
    state.run!.inventory.push('blackMillingStone');
    state.run!.sceneId = 'bearingClear';
    const compare = scenario.scenes.bearingClear.choices.find(({ id }) => id === 'compareOldWafer')!;
    expect(compare.requirements?.relics).toEqual(['blackMillingStone']);
    const result = pick(state, scenario, 'compareOldWafer');
    expect(result.character?.knowledge).toContain('A wafer from Wren’s buried millwheel bears a groove like the old stone bearing at this mill; it suggests a shared milling practice, not a common site or maker.');
    expect(result.run?.inventory).toContain('blackMillingStone');
  });

  it('registers 28 distinct stories and locks only holiday-dependent premises to December', () => {
    expect(CHRISTMAS_ADVENTURES).toHaveLength(28);
    expect(SCENARIOS).toHaveLength(861);
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

  it('keeps the stocking reunion truthful when the prank was not explained', () => {
    const stocking = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-missing-stocking')!;

    let quietReturn = pick(fresh(stocking), stocking, 'followHay');
    quietReturn = pick(quietReturn, stocking, 'checkStable');
    quietReturn = pick(quietReturn, stocking, 'quietReturn');
    const quietText = sceneText(stocking.scenes.reunion, quietReturn);
    expect(quietText).toMatch(/original stocking/i);
    expect(quietText).not.toMatch(/brother admits|family now knows why|prank/i);

    let replacement = pick(fresh(stocking), stocking, 'makeReplacement');
    replacement = pick(replacement, stocking, 'hangPaper');
    const replacementText = sceneText(stocking.scenes.reunion, replacement);
    expect(replacementText).toMatch(/paper stocking/i);
    expect(replacementText).not.toMatch(/family now knows why|carried toward the stable/i);

    let explained = pick(fresh(stocking), stocking, 'followHay');
    explained = pick(explained, stocking, 'checkStable');
    explained = pick(explained, stocking, 'truthStocking');
    expect(sceneText(stocking.scenes.reveal, explained)).toMatch(/brother explains/i);
    explained = pick(explained, stocking, 'stockingAfter');
    expect(sceneText(stocking.scenes.stockingAfter, explained)).toMatch(/brother repairs the stocking/i);
  });

  it('distinguishes a goose seen across the creek from one recovered', () => {
    const goose = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-christmas-goose')!;
    let state = pick(fresh(goose), goose, 'followPrints');
    state = pick(state, goose, 'leaveBird');
    expect(state.run?.flags).toContain('gooseSeenAcrossCreek');
    state = pick(state, goose, 'delayMeal');
    expect(sceneText(goose.scenes.yardSearch, state)).toMatch(/saw the goose across the creek earlier/i);
    expect(sceneText(goose.scenes.yardSearch, state)).not.toMatch(/no one has seen the goose/i);
    state = pick(state, goose, 'acceptMissing');
    expect(sceneText(goose.scenes.mealWithoutGoose, state)).toMatch(/last seen safe across the creek/i);

    const unseen = pick(pick(fresh(goose), goose, 'planOtherMeal'), goose, 'makePot');
    expect(sceneText(goose.scenes.mealWithoutGoose, unseen)).toMatch(/goose was not brought back before supper/i);
    expect(sceneText(goose.scenes.mealWithoutGoose, unseen)).not.toMatch(/across the creek/i);

    const legacySeen = structuredClone(state);
    legacySeen.run!.flags = legacySeen.run!.flags.filter((flag) => flag !== 'gooseSeenAcrossCreek');
    expect(sceneText(goose.scenes.mealWithoutGoose, legacySeen)).toMatch(/goose was not brought back before supper/i);
  });

  it('keeps the fallen-tree delay distinct from postponing the felling', () => {
    const tree = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'christmas-tree-millers-hill')!;
    let rough = pick(pick(fresh(tree), tree, 'joinRopeCrew'), tree, 'pullTreeNow', () => 0.999999);
    expect(rough.run?.sceneId).toBe('roughFall');
    rough = pick(rough, tree, 'callForHelp');
    expect(sceneText(tree.scenes.delay, rough)).toMatch(/tree lies on the slope short of the road/i);
    rough = pick(rough, tree, 'treeDelayEnd');
    expect(sceneText(tree.scenes.treeDelayEnd, rough)).toMatch(/fallen short of the road/i);

    let standing = pick(pick(fresh(tree), tree, 'inspectTree'), tree, 'delayTree');
    standing = pick(standing, tree, 'treeDelayEnd');
    expect(sceneText(tree.scenes.treeDelayEnd, standing)).toMatch(/does not reach the square tonight/i);
    expect(sceneText(tree.scenes.treeDelayEnd, standing)).not.toMatch(/fallen short/i);
  });

  it('mentions garland trimming only after the tree takes a branch-breaking fall', () => {
    const tree = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'christmas-tree-millers-hill')!;
    let clean = pick(pick(fresh(tree), tree, 'joinRopeCrew'), tree, 'pullTreeNow', () => 0);
    expect(clean.run?.sceneId).toBe('safeFall');
    clean = pick(clean, tree, 'haulTree');
    expect(clean.run?.sceneId).toBe('treeSquare');
    expect(sceneText(tree.scenes.treeSquare, clean)).not.toMatch(/split branches are cut/i);

    let rough = pick(pick(fresh(tree), tree, 'joinRopeCrew'), tree, 'pullTreeNow', () => 0.999999);
    expect(rough.run?.sceneId).toBe('roughFall');
    rough = pick(rough, tree, 'trimBranches');
    expect(sceneText(tree.scenes.treeSquare, rough)).toMatch(/split branches are cut for garland/i);
  });

  it('mentions the repaired carving tool only on the binding route', () => {
    const toy = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'toymakers-last-order')!;
    let repaired = pick(pick(fresh(toy), toy, 'inspectTool'), toy, 'bindHandle');
    repaired = pick(repaired, toy, 'carefulMane');
    expect(sceneText(toy.scenes.finishedHorse, repaired)).toMatch(/repaired tool/i);

    let simplified = pick(fresh(toy), toy, 'simplifyToy');
    simplified = pick(simplified, toy, 'carveSimple');
    expect(sceneText(toy.scenes.finishedHorse, simplified)).not.toMatch(/repaired tool/i);
    expect(sceneText(toy.scenes.finishedHorse, simplified)).toMatch(/tool is set aside for the night/i);
  });

  it('matches pageant performer acknowledgements to the selected route', () => {
    const pageant = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-pageant-problem')!;
    let traveler = pick(fresh(pageant), pageant, 'suggestSubstitute');
    traveler = pick(traveler, pageant, 'chooseGentlePace');
    expect(sceneText(pageant.scenes.performance, traveler)).toMatch(/you deliver the innkeeper’s brief lines/i);
    traveler = pick(traveler, pageant, 'takeCurtainCall');
    expect(sceneText(pageant.scenes.applause, traveler)).toMatch(/thanks you for stepping into the innkeeper’s brief part/i);
    expect(sceneText(pageant.scenes.applause, traveler)).not.toMatch(/children perform rather than replacing them with adults/i);

    let sibling = pick(fresh(pageant), pageant, 'findChild');
    sibling = pick(sibling, pageant, 'inviteSibling');
    sibling = pick(sibling, pageant, 'startOnTime');
    expect(sceneText(pageant.scenes.performance, sibling)).toMatch(/older sibling takes the innkeeper’s brief lines/i);

    let child = pick(fresh(pageant), pageant, 'findChild');
    child = pick(child, pageant, 'walkChildBack');
    child = pick(child, pageant, 'chooseGentlePace');
    expect(sceneText(pageant.scenes.performance, child)).toMatch(/returning child speaks the innkeeper’s lines/i);
  });

  it('states whether the Christmas visitor letter reached the family', () => {
    const visitor = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'the-christmas-visitor')!;
    let uncollected = pick(pick(fresh(visitor), visitor, 'askFromDoor'), visitor, 'letThemGo');
    expect(uncollected.run?.sceneId).toBe('departure');
    expect(sceneText(visitor.scenes.departure, uncollected)).toMatch(/family has not accepted a claim of ownership/i);
    expect(sceneText(visitor.scenes.departure, uncollected)).not.toMatch(/family has the letter|letter to consider/i);

    let read = pick(fresh(visitor), visitor, 'inviteGuest');
    read = pick(read, visitor, 'askForProof');
    read = pick(read, visitor, 'seekLetter');
    read = pick(read, visitor, 'bringLetter');
    expect(read.run?.flags).toContain('christmasVisitorLetterRead');
    read = pick(read, visitor, 'askThemToLeave');
    expect(sceneText(visitor.scenes.departure, read)).toMatch(/family has read the brother’s note/i);
    const legacyRead = structuredClone(read);
    legacyRead.run!.flags = legacyRead.run!.flags.filter((flag) => flag !== 'christmasVisitorLetterRead');
    expect(sceneText(visitor.scenes.departure, legacyRead)).toMatch(/stranger’s identity remains unestablished/i);
    expect(sceneText(visitor.scenes.departure, legacyRead)).not.toMatch(/unchecked lead/i);

    let supper = pick(fresh(visitor), visitor, 'inviteGuest');
    supper = pick(supper, visitor, 'askForProof');
    supper = pick(supper, visitor, 'shareMeal');
    supper = pick(supper, visitor, 'visitorMealEnd');
    expect(sceneText(visitor.scenes.visitorMealEnd, supper)).toMatch(/until they can retrieve and read the station letter/i);
    expect(sceneText(visitor.scenes.visitorMealEnd, supper)).not.toMatch(/keeps the brother’s note/i);
  });

  it('distinguishes passing the warm-window house from speaking with its resident', () => {
    const house = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'house-with-warm-window')!;
    let direct = pick(fresh(house), house, 'passHouse');
    expect(sceneText(house.scenes.pass, direct)).toMatch(/continue along the cold road/i);
    expect(sceneText(house.scenes.pass, direct)).not.toMatch(/meaning you have not learned/i);

    let spoke = pick(fresh(house), house, 'knockWarmHouse');
    spoke = pick(spoke, house, 'sayGoodnight');
    expect(spoke.run?.flags).toContain('warmHouseLampExplained');
    expect(sceneText(house.scenes.pass, spoke)).toMatch(/keeps the lamp lit for her absent son/i);

    let food = pick(fresh(house), house, 'knockWarmHouse');
    food = pick(food, house, 'leaveFood');
    food = pick(food, house, 'foodEnd');
    expect(sceneText(house.scenes.foodEnd, food)).toMatch(/no word about her son arrives tonight/i);
    expect(sceneText(house.scenes.foodEnd, food)).not.toMatch(/a message is left at the inn/i);
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

  it('does not identify the anonymous giver or motive from delivery evidence alone', () => {
    const scenario = CHRISTMAS_ADVENTURES.find(({ id }) => id === 'gift-with-no-name')!;
    const routes = [
      ['checkSeal', 'leaveGiftPrivate'],
      ['keepBoxClosed', 'morningAsk'],
      ['askGuests', 'askPorter', 'askGiver'],
    ] as const;
    for (const route of routes) {
      let state = fresh(scenario);
      for (const choiceId of route) state = pick(state, scenario, choiceId);
      expect(state.run!.sceneId).toBe('reveal');
      expect(scenario.scenes.reveal.text).toContain('None of that identifies the unnamed payer');
      expect(scenario.scenes.reveal.text).not.toContain('aunt');
      expect(scenario.scenes.reveal.text).not.toContain('brooch');
    }

    let invited = fresh(scenario);
    invited = pick(invited, scenario, 'checkSeal');
    invited = pick(invited, scenario, 'leaveGiftPrivate');
    invited = pick(invited, scenario, 'inviteAunt');
    expect(invited.run!.sceneId).toBe('auntArrives');
    expect(scenario.scenes.auntArrives.text).toContain('identifies herself');
    expect(scenario.scenes.auntArrives.text).toContain('She says');

    let accepted = fresh(scenario);
    accepted = pick(accepted, scenario, 'checkSeal');
    accepted = pick(accepted, scenario, 'leaveGiftPrivate');
    accepted = pick(accepted, scenario, 'acceptGift');
    expect(scenario.scenes.giftAccepted.text).toContain('giver and contents remain unknown');
  });
});
