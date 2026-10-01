import { describe, expect, it } from 'vitest';
import { partitionAvailableGear } from './inventoryPresentation';

describe('Available Gear presentation', () => {
  it('separates persistent carried gear from starting and temporary adventure gear', () => {
    const result = partitionAvailableGear(['smallKnife', 'lantern', 'travelRope'], ['travelRope'], {
      smallKnife: 'starting', lantern: 'supplied', travelRope: 'carried',
    });
    expect(result.carried).toEqual(['travelRope']);
    expect(result.available).toEqual([
      { id: 'smallKnife', source: 'starting', label: 'Starting gear' },
      { id: 'lantern', source: 'supplied', label: 'Supplied for this work' },
    ]);
  });

  it('keeps the zero-slot-used meaning clear when several items remain available', () => {
    const result = partitionAvailableGear(['smallKnife', 'lantern'], [], {});
    expect(result.carried).toEqual([]);
    expect(result.available).toHaveLength(2);
    expect(result.available.every(({ label }) => label === 'Temporary this adventure')).toBe(true);
  });
});
