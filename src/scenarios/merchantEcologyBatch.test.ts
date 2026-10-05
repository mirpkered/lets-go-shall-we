import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, openRewardResolution, placeReward, startRun } from '../engine';
import { ITEMS } from '../items';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import { findScenarioGraphProblems } from '../scenarioGraph';
import { validateScenarioRegistry } from '../scenarioRegistryValidation';
import { eligibleScenarios } from '../scenarioSelection';
import { SCENARIOS } from './index';
import { FIXED_STOCK_MERCHANTS, RETIRED_LAMPWRIGHT } from './merchantEcologyBatch';
import { THE_LAMP_LEFT_IN_THE_WINDOW } from './surpriseEverydayBatch';
import { THE_BROKEN_WHEEL } from './brokenWheel';
import type { SaveData, Scenario } from '../types';

function start(scenario: Scenario, money = 0, carried: string[] = [], bank: string[] = []): SaveData {
  const character = newCharacter('Merchant Tester');
  character.money = money;
  character.carriedItems = carried;
  character.carriedItem = carried[0] ?? null;
  return { version: 1, bank, character, run: startRun(character, scenario) };
}

function act(state: SaveData, scenario: Scenario, sceneId: string, choiceId: string): SaveData {
  expect(state.run?.sceneId).toBe(sceneId);
  const choice = scenario.scenes[sceneId].choices.find((entry) => entry.id === choiceId);
  expect(choice, `${scenario.title}.${sceneId}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${scenario.title}.${sceneId}.${choiceId}`).toBe(true);
  return choose(state, scenario, choice!);
}

describe('fixed-stock merchant ecology', () => {
  it('registers ten distinct all-year low-risk encounters with clean, concise, reachable graphs', () => {
    expect(FIXED_STOCK_MERCHANTS).toHaveLength(10);
    expect(SCENARIOS).toHaveLength(463);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(SCENARIOS.length);
    for (const merchant of FIXED_STOCK_MERCHANTS) {
      expect(findScenarioGraphProblems(merchant), merchant.title).toEqual([]);
      expect(merchant.diversity).toMatchObject({ depthClass: 'ENCOUNTER', riskTier: 'LOW' });
      for (const month of [1, 4, 7, 10, 12]) expect(eligibleScenarios(SCENARIOS, [], month)).toContain(merchant);
      for (const scene of Object.values(merchant.scenes)) {
        expect(scene.choices.length, `${merchant.title}.${scene.id} action count`).toBeLessThanOrEqual(4);
        expect(scene.text.length, `${merchant.title}.${scene.id} copy`).toBeLessThanOrEqual(400);
        for (const choice of scene.choices) expect(choice.label.length, `${merchant.title}.${choice.id}`).toBeLessThanOrEqual(70);
      }
    }
    expect(validateScenarioRegistry(SCENARIOS).errors).toEqual([]);
  });

  it('sells fixed existing stock only at posted prices, with duplicates and unaffordable offers hidden', () => {
    for (const merchant of FIXED_STOCK_MERCHANTS) {
      const stockScene = merchant.scenes.stock;
      const purchases = stockScene.choices.filter(({ effects }) => effects?.gainItems?.length || effects?.gainSupplies);
      expect(purchases.length, merchant.title).toBe(3);
      for (const choice of purchases) {
        const itemId = choice.effects?.gainItems?.[0] ?? Object.keys(choice.effects?.gainSupplies ?? {})[0];
        expect(ITEMS[itemId], `${merchant.title} ${itemId}`).toBeTruthy();
        const purchasePrice = Math.abs(choice.effects?.money ?? 0);
        const poor = start(merchant, purchasePrice - 1);
        const owned = start(merchant, 100, [itemId]);
        const banked = start(merchant, 100, [], [itemId]);
        expect(meets(choice.requirements, poor), `${merchant.title} poor`).toBe(false);
        if (ITEMS[itemId].inventoryClass !== 'SUPPLY') {
          expect(meets(choice.requirements, owned), `${merchant.title} duplicate carried`).toBe(false);
          expect(meets(choice.requirements, banked), `${merchant.title} duplicate banked`).toBe(false);
        }

        const buyer = start(merchant, 20);
        buyer.run!.sceneId = 'stock';
        const bought = choose(buyer, merchant, choice);
        expect(bought.run?.sceneId).toBe(`receipt_${itemId}`);
        expect(bought.character?.money).toBe(20 - purchasePrice);
        if (ITEMS[itemId].inventoryClass === 'SUPPLY') {
          const quantity = choice.effects?.gainSupplies?.[itemId] ?? 0;
          expect(bought.character?.supplies?.[itemId]).toBe(quantity);
        } else {
          expect(bought.run?.inventory).toContain(itemId);
          const pending = openRewardResolution(bought);
          expect(pending.run?.rewardPendingItems).toContain(itemId);
          const placed = placeReward(pending, itemId, 'carry');
          expect(placed.character?.carriedItems).toContain(itemId);
        }
      }
    }
  });

  it('keeps sales selective, carried-only, one-at-a-time, and below every corresponding buy price', () => {
    const resalePrices = new Map<string, number[]>();
    for (const merchant of FIXED_STOCK_MERCHANTS) {
      const seller = merchant.scenes.buyer;
      if (!seller) continue;
      for (const choice of seller.choices.filter(({ effects }) => effects?.loseItems?.length)) {
        const itemId = choice.effects!.loseItems![0];
        const price = choice.effects?.money ?? 0;
        resalePrices.set(itemId, [...(resalePrices.get(itemId) ?? []), price]);
        const carried = start(merchant, 0, [itemId]);
        const atBuyer = act(carried, merchant, 'entry', 'offerCarriedGear');
        const sold = act(atBuyer, merchant, 'buyer', choice.id);
        expect(sold.run?.inventory).not.toContain(itemId);
        expect(sold.character?.carriedItems).not.toContain(itemId);
        expect(sold.character?.money).toBe(price);
        const banked = start(merchant, 0, [], [itemId]);
        expect(meets(choice.requirements, banked)).toBe(false);
      }
    }
    for (const merchant of FIXED_STOCK_MERCHANTS) for (const choice of merchant.scenes.stock.choices) {
      const itemId = choice.effects?.gainItems?.[0];
      if (!itemId) continue;
      for (const resale of resalePrices.get(itemId) ?? []) expect(resale).toBeLessThanOrEqual(Math.abs(choice.effects?.money ?? 0));
    }
  });

  it('applies exact Supply quantities and respects stack caps at the restoration shelf', () => {
    const chalk = FIXED_STOCK_MERCHANTS.find(({ id }) => id === 'the-chapel-restoration-shelf')!;
    const nails = chalk.scenes.stock.choices.find(({ effects }) => effects?.gainSupplies?.coldIronNails)!;
    const buyer = start(chalk, 2);
    buyer.run!.sceneId = 'stock';
    const bought = choose(buyer, chalk, nails);
    expect(bought.character?.money).toBe(0);
    expect(bought.character?.supplies?.coldIronNails).toBe(2);
    const full = start(chalk, 2);
    full.character!.supplies = { coldIronNails: 5 };
    full.run!.sceneId = 'stock';
    expect(meets(nails.requirements, full)).toBe(false);
  });

  it('recognizes the Numbered Lantern Wick, records reusable knowledge, and lets it inform a later independent lamp scene', () => {
    const traveler = start(RETIRED_LAMPWRIGHT, 0, ['numberedLanternWick']);
    const explained = act(traveler, RETIRED_LAMPWRIGHT, 'entry', 'askAboutWick');
    const learned = act(explained, RETIRED_LAMPWRIGHT, 'wickHistory', 'rememberWickSystem');
    expect(learned.character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.numberedRefugeLampSystem.id);
    expect(learned.character?.knowledge).toContain(KNOWLEDGE_FACTS.numberedRefugeLampSystem.text);

    const later = start(THE_LAMP_LEFT_IN_THE_WINDOW);
    later.character!.knowledgeKeys = [KNOWLEDGE_FACTS.numberedRefugeLampSystem.id];
    later.character!.knowledge = [KNOWLEDGE_FACTS.numberedRefugeLampSystem.text];
    const callback = THE_LAMP_LEFT_IN_THE_WINDOW.scenes.street.choices.find(({ id }) => id === 'explainOldLampMarks')!;
    expect(meets(callback.requirements, later)).toBe(true);
    const clarified = choose(later, THE_LAMP_LEFT_IN_THE_WINDOW, callback);
    expect(clarified.run?.sceneId).toBe('lampCode');
    expect(THE_LAMP_LEFT_IN_THE_WINDOW.scenes.lampCode.text).toContain('no tag, no sequence');
  });

  it('lets a purchased wheel wrench matter later without replacing the ordinary smith route', () => {
    const holder = start(THE_BROKEN_WHEEL, 0, ['compactWheelWrench']);
    holder.character!.historyFlags.push('bought_at_roadside_tinker_compactWheelWrench');
    const text = THE_BROKEN_WHEEL.scenes.hubDamage.textVariants?.find(({ requirements }) => meets(requirements, holder))?.text;
    expect(text).toContain('roadside tinker');
    const choice = THE_BROKEN_WHEEL.scenes.hubDamage.choices.find(({ id }) => id === 'useWheelWrench')!;
    expect(meets(choice.requirements, holder)).toBe(true);
    const result = choose({ ...holder, run: { ...holder.run!, sceneId: 'hubDamage' } }, THE_BROKEN_WHEEL, choice, () => 0);
    expect(result.run?.sceneId).toBe('marketArrival');
    expect(THE_BROKEN_WHEEL.scenes.hubDamage.choices.some(({ id }) => id === 'sendDriverToSmith')).toBe(true);
  });
});
