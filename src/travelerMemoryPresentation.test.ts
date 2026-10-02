import { describe, expect, it } from 'vitest';
import { travelerMemoryPreview } from './travelerMemoryPresentation';

describe('traveler memory preview', () => {
  it('shows the newest distinct Knowledge and Lore without exposing History keys', () => {
    expect(travelerMemoryPreview(['fact one', 'fact two', 'fact one', 'fact three'], ['tale one', 'tale two'], 2)).toEqual({
      knowledge: ['fact three', 'fact two'], lore: ['tale two', 'tale one'], knowledgeCount: 3, loreCount: 2,
    });
  });

  it('handles missing memory and a zero preview limit', () => {
    expect(travelerMemoryPreview()).toEqual({ knowledge: [], lore: [], knowledgeCount: 0, loreCount: 0 });
    expect(travelerMemoryPreview(['one'], ['tale'], 0)).toEqual({ knowledge: [], lore: [], knowledgeCount: 1, loreCount: 1 });
  });
});
