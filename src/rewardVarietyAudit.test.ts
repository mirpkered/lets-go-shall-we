import { describe, expect, it } from 'vitest';
import { inventoryClass, ITEMS } from './items';
import { SCENARIOS } from './scenarios';
import { primaryScenarioCategory } from './scenarioSelection';
import type { Effects, Scenario } from './types';

function possibleEffects(scenario: Scenario): Effects[] {
  return Object.values(scenario.scenes).flatMap((scene) => scene.choices.flatMap((choice) => [
    ...(choice.effects ? [choice.effects] : []),
    ...(choice.chance?.successEffects ? [choice.chance.successEffects] : []),
    ...(choice.chance?.failureEffects ? [choice.chance.failureEffects] : []),
  ]));
}

describe('authored reward variety audit', () => {
  it('keeps persistent item, supply, money, and narrative rewards visible across the current registry', () => {
    const report = {
      registered: SCENARIOS.length,
      gear: 0, relic: 0, supplies: 0, money: 0, knowledge: 0, lore: 0, history: 0, assets: 0, upgradesOrRepairs: 0,
      noTangibleReward: 0, itemByPrimaryCategory: {} as Record<string, number>,
    };
    for (const scenario of SCENARIOS) {
      const effects = possibleEffects(scenario);
      const gainedIds = effects.flatMap(({ gainItems = [] }) => gainItems);
      const hasGear = gainedIds.some((id) => inventoryClass(id) === 'GEAR' && !!ITEMS[id]?.carryable);
      const hasRelic = gainedIds.some((id) => inventoryClass(id) === 'RELIC' && !!ITEMS[id]?.carryable);
      const hasSupply = gainedIds.some((id) => inventoryClass(id) === 'SUPPLY') || effects.some(({ gainSupplies }) => Object.values(gainSupplies ?? {}).some((quantity) => quantity > 0));
      const hasMoney = effects.some(({ money }) => (money ?? 0) > 0);
      const hasAsset = effects.some(({ gainOwnedAssets }) => !!gainOwnedAssets?.length);
      const hasUpgrade = effects.some(({ addItemUpgrades, repairItems, replaceItems }) => !!addItemUpgrades?.length || !!repairItems?.length || !!replaceItems?.length);
      report.gear += Number(hasGear);
      report.relic += Number(hasRelic);
      report.supplies += Number(hasSupply);
      report.money += Number(hasMoney);
      report.knowledge += Number(effects.some(({ knowledge }) => !!knowledge?.length));
      report.lore += Number(effects.some(({ lore }) => !!lore?.length));
      report.history += Number(effects.some(({ historyFlags }) => !!historyFlags?.length));
      report.assets += Number(hasAsset);
      report.upgradesOrRepairs += Number(hasUpgrade);
      if (!hasGear && !hasRelic && !hasSupply && !hasMoney && !hasAsset && !hasUpgrade) report.noTangibleReward++;
      if (hasGear || hasRelic || hasSupply) {
        const category = primaryScenarioCategory(scenario);
        report.itemByPrimaryCategory[category] = (report.itemByPrimaryCategory[category] ?? 0) + 1;
      }
    }
    expect(report.registered).toBe(685);
    expect(report.gear).toBeGreaterThan(0);
    expect(report.relic).toBeGreaterThan(0);
    expect(report.supplies).toBeGreaterThan(0);
    expect(report.knowledge).toBeGreaterThan(0);
    expect(report.history).toBeGreaterThan(0);
    expect(report.noTangibleReward).toBeGreaterThan(0);
    expect(Object.keys(report.itemByPrimaryCategory).length).toBeGreaterThan(1);
  });
});
