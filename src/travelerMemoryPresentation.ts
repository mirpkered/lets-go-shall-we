export interface TravelerMemoryPreview {
  knowledge: string[];
  lore: string[];
  knowledgeCount: number;
  loreCount: number;
}

/** A compact, readable preview; history flags are internal continuity keys, not journal prose. */
export function travelerMemoryPreview(knowledge: string[] = [], lore: string[] = [], limit = 5): TravelerMemoryPreview {
  const recent = (entries: string[]) => {
    const unique = [...new Set(entries)];
    return limit > 0 ? unique.slice(-Math.floor(limit)).reverse() : [];
  };
  return { knowledge: recent(knowledge), lore: recent(lore), knowledgeCount: new Set(knowledge).size, loreCount: new Set(lore).size };
}
