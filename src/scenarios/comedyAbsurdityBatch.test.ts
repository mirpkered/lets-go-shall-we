import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE } from '../storage';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioMetadata } from '../scenarioDiversity';
import { auditContentQuality } from '../contentQuality';
import { simulateScenarioSelection } from '../scenarioSelection';
import { renderQaPanel } from '../qaPanel';
import { ITEMS } from '../items';
import type { SaveData } from '../types';
import { SCENARIOS } from './index';
import { THE_COMEDY_ABSURDITY_ADVENTURES } from './comedyAbsurdityBatch';

function assertReachableActions(scenario: (typeof THE_COMEDY_ABSURDITY_ADVENTURES)[number]): void {
  const character = newCharacter('Comedy QA');
  const start: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
  const pending = [start];
  const visited = new Set<string>();
  while (pending.length) {
    const state = pending.shift()!;
    const run = state.run!;
    const key = `${run.sceneId}:${run.status}:${run.visitedSceneIds?.join(',')}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const current = scenario.scenes[run.sceneId];
    expect(current, `${scenario.title}.${run.sceneId}`).toBeDefined();
    if (current.ending || run.status !== 'active') continue;
    const available = current.choices.filter((choice) => meets(choice.requirements, state));
    expect(available.length, `${scenario.title}.${current.id} has an available action`).toBeGreaterThan(0);
    for (const choice of available) {
      const next = choose(state, scenario, choice, () => 0.999999);
      expect(next.run?.sceneId, `${scenario.title}.${current.id}.${choice.id} advances`).not.toBe(current.id);
      expect(new Set(next.run?.visitedSceneIds).size).toBe(next.run?.visitedSceneIds?.length ?? 0);
      pending.push(next);
    }
    expect(visited.size, scenario.title).toBeLessThan(300);
  }
}

describe('comedy and absurdity additions', () => {
  it('registers 25 unique all-year adventures with complete canonical metadata', () => {
    expect(THE_COMEDY_ABSURDITY_ADVENTURES).toHaveLength(25);
    expect(SCENARIOS).toHaveLength(861);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    expect(validateScenarioMetadata(THE_COMEDY_ABSURDITY_ADVENTURES)).toEqual([]);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.every(({ diversity }) => diversity?.availability?.season === 'ALL_YEAR')).toBe(true);
  });

  it('does not invent an inspection plan when the Wagon-Wheel Meeting only clears the cart lane', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-wagon-wheel-meeting')!;
    const character = newCharacter('Wagon Wheel Route QA');
    const start: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let laneOnly = act(start, 'green', 'moveSpeakers');
    laneOnly = act(laneOnly, 'circle', 'keepLaneOpen');
    expect(laneOnly.run?.sceneId).toBe('laneClear');
    expect(sceneText(scenario.scenes.laneClear, laneOnly)).toMatch(/no first inspection point is agreed/i);

    let markedPlan = act(start, 'green', 'useSpokes');
    markedPlan = act(markedPlan, 'spokes', 'markStart');
    expect(markedPlan.run?.sceneId).toBe('plan');
    expect(sceneText(scenario.scenes.plan, markedPlan)).toMatch(/agree where to inspect first/i);

    let clerkPlan = act(start, 'green', 'moveSpeakers');
    clerkPlan = act(clerkPlan, 'circle', 'passNotes');
    expect(sceneText(scenario.scenes.notes, clerkPlan)).toMatch(/foreman agrees to inspect the first hundred yards/i);
    clerkPlan = act(clerkPlan, 'notes', 'leaveNotes');
    expect(clerkPlan.run?.sceneId).toBe('plan');
    expect(sceneText(scenario.scenes.plan, clerkPlan)).toMatch(/agree where to inspect first/i);
  });

  it('keeps the unsigned scraped certificate distinct from the signed valid form', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-clerks-second-stamp')!;
    const character = newCharacter('Certificate Route QA');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let copyRoute = act(initial, 'counter', 'askForNewCopy');
    copyRoute = act(copyRoute, 'copy', 'scrape');
    expect(copyRoute.run?.sceneId).toBe('scraped');

    let initialFirstRoute = act(initial, 'counter', 'explainNeed');
    initialFirstRoute = act(initialFirstRoute, 'purpose', 'signNow');
    initialFirstRoute = act(initialFirstRoute, 'signatureCheck', 'askClerkInitial');
    expect(initialFirstRoute.run?.sceneId).toBe('scraped');

    for (const state of [copyRoute, initialFirstRoute]) {
      const text = scenario.scenes[state.run!.sceneId].text;
      expect(text).toMatch(/name and arrival date are still unsigned/i);
      expect(text).toMatch(/certificate is not yet usable/i);
    }

    let signedRoute = act(initial, 'counter', 'explainNeed');
    signedRoute = act(signedRoute, 'purpose', 'signNow');
    signedRoute = act(signedRoute, 'signatureCheck', 'signCorrectLine');
    expect(signedRoute.run?.sceneId).toBe('signed');
    expect(scenario.scenes.signed.text).toMatch(/signature completes.*declaration/i);
    expect(scenario.scenes.signed.text).toMatch(/receives a valid form/i);
  });

  it('respects the returning worker’s request for a small private welcome', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-paper-mill-parade')!;
    const character = newCharacter('Paper Mill Route QA');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let privateRoute = act(initial, 'yard', 'askPurpose');
    privateRoute = act(privateRoute, 'purpose', 'askWorker');
    privateRoute = act(privateRoute, 'worker', 'respectQuiet');
    expect(privateRoute.run?.sceneId).toBe('quietWelcome');
    expect(scenario.scenes.quietWelcome.text).toMatch(/small and private/i);
    expect(scenario.scenes.quietWelcome.text).not.toMatch(/the banner welcomes the returning worker in large letters/i);
    expect(scenario.scenes.quietWelcome.text).not.toMatch(/they wave from the mill gate/i);

    let prominentRoute = act(initial, 'yard', 'askPurpose');
    prominentRoute = act(prominentRoute, 'purpose', 'writeWelcome');
    expect(prominentRoute.run?.sceneId).toBe('welcome');
    expect(scenario.scenes.welcome.text).toMatch(/large letters/i);
    expect(scenario.scenes.welcome.text).toMatch(/wave from the mill gate/i);
  });

  it('does not claim the missing gavel was returned on the labor route', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-mayors-missing-gavel')!;
    const character = newCharacter('Gavel Route QA');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let notLocated = act(initial, 'hall', 'askPurpose');
    notLocated = act(notLocated, 'purpose', 'useBell');
    notLocated = act(notLocated, 'meeting', 'offerLabor');
    expect(notLocated.run?.sceneId).toBe('work');
    expect(scenario.scenes.work.text).not.toMatch(/gavel is returned to its drawer/i);
    expect(scenario.scenes.work.text).toMatch(/without settling where the gavel is/i);

    let leftInBasket = act(initial, 'hall', 'findObject');
    leftInBasket = act(leftInBasket, 'search', 'keepBell');
    leftInBasket = act(leftInBasket, 'meeting', 'offerLabor');
    expect(leftInBasket.run?.sceneId).toBe('work');
    expect(scenario.scenes.work.text).not.toMatch(/gavel is returned to its drawer/i);

    let explicitlyReturned = act(initial, 'hall', 'findObject');
    explicitlyReturned = act(explicitlyReturned, 'search', 'returnGavel');
    expect(explicitlyReturned.run?.sceneId).toBe('found');
    expect(scenario.scenes.found.text).toMatch(/gavel returns to the table/i);
  });

  it('keeps resident pickup separate from correcting the reversed mail labels', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-misplaced-pigeonhole')!;
    const character = newCharacter('Pigeonhole Route QA');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let ownerPickup = act(initial, 'desk', 'askGuests');
    ownerPickup = act(ownerPickup, 'residents', 'letEachTake');
    expect(ownerPickup.run?.sceneId).toBe('collected');
    expect(scenario.scenes.collected.text).toMatch(/take the letters they recognize without opening them/i);
    expect(scenario.scenes.collected.text).toMatch(/reversed labels remain in place/i);
    expect(scenario.scenes.collected.text).not.toMatch(/keeper turns the labels/i);

    let roomSort = act(initial, 'desk', 'checkLabels');
    roomSort = act(roomSort, 'register', 'sortByRoom');
    expect(roomSort.run?.sceneId).toBe('sorted');
    expect(scenario.scenes.sorted.text).toMatch(/keeper turns the labels/i);
    expect(scenario.scenes.sorted.text).toMatch(/next post can be sorted without repeating the mistake/i);

    let labelCorrection = act(initial, 'desk', 'askGuests');
    labelCorrection = act(labelCorrection, 'residents', 'correctLabels');
    expect(labelCorrection.run?.sceneId).toBe('held');
    expect(scenario.scenes.held.text).toMatch(/keeper corrects the labels/i);
  });

  it('keeps each graph forward-only, connected, actionable, concise, and within four choices', () => {
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(findScenarioGraphProblems(scenario), scenario.title).toEqual([]);
      for (const entry of Object.values(scenario.scenes)) {
        expect(entry.choices.length, `${scenario.title}.${entry.id}`).toBeLessThanOrEqual(4);
        expect(entry.text.length, `${scenario.title}.${entry.id} no-scroll copy`).toBeLessThanOrEqual(400);
        for (const choice of entry.choices) expect(choice.label.length, `${scenario.title}.${entry.id}`).toBeLessThanOrEqual(70);
      }
      assertReachableActions(scenario);
    }
  });

  it('makes every added story eligible in normal selection and available for direct QA launch', () => {
    const qa = renderQaPanel(true, { ...structuredClone(EMPTY_SAVE), character: newCharacter('QA'), run: null }, SCENARIOS, ITEMS);
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(qa).toContain(`data-qa-start="${scenario.id}"`);
    }
    let seed = 48;
    const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    const result = simulateScenarioSelection(SCENARIOS, [], { selectionMonth: 6 }, 30000, random);
    for (const scenario of THE_COMEDY_ABSURDITY_ADVENTURES) {
      expect(result.scenarioCounts[scenario.id] ?? 0, `${scenario.title} appears in normal selection`).toBeGreaterThan(0);
    }
  });

  it('varies comic engines rather than repeating one premise family', () => {
    const hooks = THE_COMEDY_ABSURDITY_ADVENTURES.map(({ diversity }) => diversity?.distinctiveHook?.toLowerCase());
    expect(new Set(hooks).size).toBe(hooks.length);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('animals'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('communication/witness'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('negotiation/trade'))).toBe(true);
    expect(THE_COMEDY_ABSURDITY_ADVENTURES.some(({ diversity }) => diversity?.activities?.includes('puzzle/problem-solving'))).toBe(true);
    expect(new Set(THE_COMEDY_ABSURDITY_ADVENTURES.map(({ scenes }) => Object.keys(scenes).length)).size).toBeGreaterThan(3);
  });

  it('has no high-severity content-quality warnings after human overlap and payoff review', () => {
    const report = auditContentQuality(THE_COMEDY_ABSURDITY_ADVENTURES);
    expect(report.scenarioCount).toBe(25);
    expect(report.warnings.filter(({ severity }) => severity === 'HIGH')).toEqual([]);
  });

  it('gives the sorted-note route a witnessed delivery payoff without exposing either message', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-pigeon-postscript')!;
    const character = newCharacter('Message Route QA');
    let state: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    for (const choiceId of ['readAddresses', 'deliverKnown']) {
      const current = scenario.scenes[state.run!.sceneId];
      state = choose(state, scenario, current.choices.find(({ id }) => id === choiceId)!);
    }
    const ending = scenario.scenes[state.run!.sceneId];
    expect(ending.title).toBe('Messages Find Their Way');
    expect(ending.text).toMatch(/miller’s mark in the delivery book/i);
    expect(ending.text).toMatch(/keeps the other message sealed/i);
    expect(ending.text).toMatch(/sender’s privacy are safe/i);
    expect(ending.text).not.toMatch(/the note says|message reads/i);
  });

  it('requires farm contact before a farm reply identifies the sealed note', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-pigeon-postscript')!;
    const character = newCharacter('Pigeon Route QA');
    const initial: SaveData = { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      expect(state.run?.sceneId).toBe(sceneId);
      const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId);
      expect(choice, `${sceneId}.${choiceId}`).toBeTruthy();
      return choose(state, scenario, choice!);
    };

    let leftSealed = act(initial, 'office', 'readAddresses');
    leftSealed = act(leftSealed, 'addresses', 'leaveSecond');
    expect(leftSealed.run?.sceneId).toBe('heldUnidentified');
    expect(scenario.scenes.heldUnidentified.text).toMatch(/no one has contacted the farm/i);
    expect(scenario.scenes.heldUnidentified.text).not.toMatch(/farm replies/i);

    let waitedWithoutContact = act(initial, 'office', 'freeBird');
    waitedWithoutContact = act(waitedWithoutContact, 'notes', 'waitOwner');
    expect(waitedWithoutContact.run?.sceneId).toBe('waitedUnidentified');
    expect(scenario.scenes.waitedUnidentified.text).toMatch(/farm has not been contacted/i);
    expect(scenario.scenes.waitedUnidentified.text).toMatch(/note remains unidentified/i);

    let contacted = act(initial, 'office', 'callOwner');
    contacted = act(contacted, 'owner', 'openWindow');
    expect(contacted.run?.sceneId).toBe('identified');
    expect(scenario.scenes.identified.text).toMatch(/farm replies that the second note belongs/i);
  });

  it('makes the wardrobe chip an honest, consequential choice rather than a hidden identical ending', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-doorway-delivery')!;
    expect(findScenarioGraphProblems(scenario)).toEqual([]);
    const chipChoices = scenario.scenes.panel.choices;
    expect(chipChoices.find(({ id }) => id === 'reassemble')?.next).toBe('upstairs');
    expect(chipChoices.find(({ id }) => id === 'leaveMenders')?.next).toBe('menders');
    expect(scenario.scenes.upstairs.text).toMatch(/show the owner/i);
    expect(scenario.scenes.menders.text).toMatch(/misses the supper deadline/i);
    expect(scenario.scenes.menders.text).toMatch(/no one mistakes it for a finished repair/i);
  });

  it('keeps the ferryman endings faithful to sign-turning, explanation, escort, and marking requests', () => {
    const scenario = THE_COMEDY_ABSURDITY_ADVENTURES.find(({ id }) => id === 'the-ferrymans-sign')!;
    const start = (): SaveData => {
      const character = newCharacter('Ferry Route QA');
      return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, scenario, () => 0) };
    };
    const act = (state: SaveData, sceneId: string, choiceId: string): SaveData => {
      const current = scenario.scenes[state.run!.sceneId];
      expect(current.id).toBe(sceneId);
      const choice = current.choices.find(({ id }) => id === choiceId);
      expect(choice).toBeDefined();
      return choose(state, scenario, choice!);
    };

    let explained = act(start(), 'landing', 'callTravelers');
    explained = act(explained, 'redirect', 'explainSafety');
    expect(sceneText(scenario.scenes.signFixed, explained)).not.toMatch(/sign points to the upstream/i);
    expect(sceneText(scenario.scenes.signFixed, explained)).toMatch(/point out the new rope/i);

    let turned = act(start(), 'landing', 'askFerryman');
    turned = act(turned, 'reason', 'turnBoard');
    expect(sceneText(scenario.scenes.signFixed, turned)).toMatch(/turn the sign toward the upstream/i);
    turned = JSON.parse(JSON.stringify(turned)) as SaveData;
    expect(sceneText(scenario.scenes.signFixed, turned)).toMatch(/turn the sign toward the upstream/i);

    let escorted = act(start(), 'landing', 'callTravelers');
    escorted = act(escorted, 'redirect', 'offerWalk');
    expect(sceneText(scenario.scenes.walked, escorted)).toMatch(/walk the travelers to the new landing/i);
    expect(sceneText(scenario.scenes.walked, escorted)).not.toMatch(/pale cloth/i);
    escorted = JSON.parse(JSON.stringify(escorted)) as SaveData;
    expect(sceneText(scenario.scenes.walked, escorted)).toMatch(/walk the travelers to the new landing/i);

    let requested = act(start(), 'landing', 'askFerryman');
    requested = act(requested, 'reason', 'markPath');
    expect(sceneText(scenario.scenes.walked, requested)).toMatch(/ask the ferryman to mark the towpath/i);
    expect(sceneText(scenario.scenes.walked, requested)).not.toMatch(/you walk the travelers|pale cloth/i);

    expect(sceneText(scenario.scenes.signFixed, start())).toMatch(/not established by this ending/i);
    expect(sceneText(scenario.scenes.walked, start())).toMatch(/no completed escort or towpath mark/i);
  });
});
