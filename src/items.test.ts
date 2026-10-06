import { describe, expect, it } from 'vitest';
import { ITEMS } from './items';

describe('period-grounded carryable items', () => {
  it('identifies the Miner’s Headlamp as a cap-mounted carbide lamp, not battery lighting', () => {
    expect(ITEMS.minerHeadlamp.name).toBe('Miner’s Headlamp');
    expect(ITEMS.minerHeadlamp.description).toContain('cap-mounted carbide lamp');
    expect(ITEMS.minerHeadlamp.description).toContain('water-fed burner');
    expect(ITEMS.minerHeadlamp.carryable).toBe(true);
  });

  it('keeps the Joiner’s Folding Rule carryable and accurately described', () => {
    expect(ITEMS.joinersFoldingRule.name).toBe('Joiner’s Folding Rule');
    expect(ITEMS.joinersFoldingRule.description).toContain('measuring rule');
    expect(ITEMS.joinersFoldingRule.carryable).toBe(true);
  });

  it('keeps the road-batch practical tools distinct, mundane, and carryable', () => {
    expect(ITEMS.foldingCarriageJack.description).toContain('firm, level ground');
    expect(ITEMS.lockableMapCase.description).toContain('not theft-proof');
    expect(ITEMS.lanternGuard.description).toContain('does not improve the flame');
    for (const id of ['foldingCarriageJack', 'lockableMapCase', 'lanternGuard']) {
      expect(ITEMS[id].carryable).toBe(true);
      expect(ITEMS[id].inventoryClass).toBe('GEAR');
    }
  });

  it('defines the Folding Field Stretcher as practical carryable Gear', () => {
    expect(ITEMS.foldingFieldStretcher.description).toContain('carrying an injured person');
    expect(ITEMS.foldingFieldStretcher.description).toContain('does not make an unsafe route safe');
    expect(ITEMS.foldingFieldStretcher.carryable).toBe(true);
    expect(ITEMS.foldingFieldStretcher.inventoryClass).toBe('GEAR');
  });
});
