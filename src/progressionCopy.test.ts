import { describe, expect, it } from 'vitest';
import { endedTravelerMilestoneCopy, gearCapacityMilestoneCopy } from './progressionCopy';

describe('Gear capacity milestone copy', () => {
  it('describes new capacity as room for future equipment, not prior ownership or expertise', () => {
    expect(gearCapacityMilestoneCopy(10)).toContain('room for another useful item if one comes your way');
    expect(gearCapacityMilestoneCopy(20)).toContain('more room for the equipment you choose to carry');
    expect(gearCapacityMilestoneCopy(10)).not.toMatch(/you.ve learned|you know what deserves/i);
    expect(gearCapacityMilestoneCopy(20)).not.toMatch(/you.ve learned|you know what deserves/i);
  });

  it('keeps death milestone acknowledgments factual without claiming Gear experience', () => {
    expect(endedTravelerMilestoneCopy(10)).toBe('This traveler completed 10 adventures. Their journey ends here.');
    expect(endedTravelerMilestoneCopy(20)).toBe('This traveler completed 20 adventures. Their journey ends here.');
  });
});
