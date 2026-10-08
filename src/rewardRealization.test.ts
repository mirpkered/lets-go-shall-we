import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from './engine';
import { SCENARIOS } from './scenarios';
import type { SaveData } from './types';

const paidGearChoices = [
  ['What’s Mine is Mine', 'preparation', 'buyRope', 'travelRope', 3],
  ['What’s Mine is Mine', 'preparation', 'buyHeadlamp', 'minerHeadlamp', 4],
  ['The Last Room on the Left', 'hostAccount', 'buyRope', 'travelRope', 2],
  ['No Vacancy', 'innGoods', 'buyCanvas', 'waxedCanvasSheet', 2],
  ['No Vacancy', 'innGoods', 'buyStoveTool', 'compactStoveTool', 3],
  ['No Vacancy', 'innGoods', 'buyMatchCase', 'windproofMatchCase', 2],
  ['The Pawned Tool', 'stall', 'buyRule', 'joinersFoldingRule', 2],
  ['The Pawned Tool', 'sellerAccount', 'buyAfterAccount', 'joinersFoldingRule', 2],
  ['The Pawned Tool', 'markSeen', 'buyAfterMark', 'joinersFoldingRule', 2],
  ['A Very Good Deal', 'cheapLoupe', 'buyLoupe', 'assayersLoupe', 3],
  ['A Very Good Deal', 'saleExplained', 'buyAfterExplanation', 'assayersLoupe', 3],
  ['A Very Good Deal', 'saleInspected', 'buyInspectedLoupe', 'assayersLoupe', 3],
] as const;

function purchaseState(scenarioTitle: string, sceneId: string, itemId: string, banked: boolean): SaveData {
  const scenario = SCENARIOS.find(({ title }) => title === scenarioTitle)!;
  const character = newCharacter('Reward audit traveler');
  character.money = 10;
  const run = startRun(character, scenario);
  run.sceneId = sceneId;
  const state: SaveData = { version: 1, bank: ['graveCoin', ...(banked ? [itemId] : [])], character, run };
  return state;
}

describe('reward realization integrity', () => {
  it.each(paidGearChoices)('does not charge for a paid Gear offer already held in the Bank: %s / %s.%s', (title, sceneId, choiceId, itemId, price) => {
    const scenario = SCENARIOS.find(({ title: candidate }) => candidate === title)!;
    const choice = scenario.scenes[sceneId].choices.find(({ id }) => id === choiceId)!;

    const banked = purchaseState(title, sceneId, itemId, true);
    expect(meets(choice.requirements, banked)).toBe(false);
    const rejected = choose(banked, scenario, choice);
    expect(rejected.character?.money).toBe(10);
    expect(rejected.run?.inventory).not.toContain(itemId);
    expect(rejected.run?.sceneId).toBe(sceneId);

    const available = purchaseState(title, sceneId, itemId, false);
    expect(meets(choice.requirements, available)).toBe(true);
    const purchased = choose(available, scenario, choice);
    expect(purchased.character?.money).toBe(10 - price);
    expect(purchased.run?.inventory).toContain(itemId);
  });
});
