import type { InventorySource } from './types';

const sourceLabels: Record<InventorySource, string> = {
  starting: 'Starting gear', carried: 'Carried by traveler', found: 'Found or earned this adventure',
  temporary: 'Temporary this adventure', borrowed: 'Borrowed', supplied: 'Supplied for this work',
};

export function partitionAvailableGear(inventory: string[], carriedItems: string[], sources: Record<string, InventorySource> = {}) {
  const carried = new Set(carriedItems);
  const unique = [...new Set(inventory)];
  return {
    carried: unique.filter((id) => carried.has(id)),
    available: unique.filter((id) => !carried.has(id)).map((id) => ({ id, source: sources[id] ?? 'temporary' as const, label: sourceLabels[sources[id] ?? 'temporary'] })),
  };
}
