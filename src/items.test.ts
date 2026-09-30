import { describe, expect, it } from 'vitest';
import { ITEMS } from './items';

describe('period-grounded carryable items', () => {
  it('identifies the Miner’s Headlamp as a cap-mounted carbide lamp, not battery lighting', () => {
    expect(ITEMS.minerHeadlamp.name).toBe('Miner’s Headlamp');
    expect(ITEMS.minerHeadlamp.description).toContain('cap-mounted carbide lamp');
    expect(ITEMS.minerHeadlamp.description).toContain('water-fed burner');
    expect(ITEMS.minerHeadlamp.carryable).toBe(true);
  });
});
