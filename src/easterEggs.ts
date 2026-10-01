export type EasterEggContext = 'depot' | 'market' | 'fair' | 'inn' | 'roadside' | 'field' | 'wagon' | 'newspaper' | 'landing';

export interface EasterEgg {
  id: string;
  label: string;
  contexts: EasterEggContext[];
  text: string;
}

export const EASTER_EGG_CHANCE = 0.02;
export const RECENT_EASTER_EGG_WINDOW = 6;

export const EASTER_EGGS: EasterEgg[] = [
  { id: 'quantum-leap', label: 'Eccentric stranger (Al / Ziggy)', contexts: ['depot', 'inn'], text: 'A traveler mutters, “Al, tell Ziggy that will not help,” then notices you listening and asks whether the train is on time.' },
  { id: 'stopped-clock', label: 'Clock stopped at 10:04', contexts: ['depot'], text: 'The platform clock has stopped at 10:04; the stationmaster says he wound it twice today.' },
  { id: 'dysentery-ledger', label: 'Dry travel-ledger note', contexts: ['wagon', 'inn'], text: 'A road ledger records that one traveler “died of dysentery,” in the same dry hand as the mile counts.' },
  { id: 'one-more-job', label: 'One more job', contexts: ['market', 'inn'], text: 'A stranger tells his companion that one more job and a little more money will settle everything. The companion only sighs.' },
  { id: 'six-fingered-man', label: 'Six-fingered swordsman', contexts: ['market', 'fair', 'depot'], text: 'A passing swordsman asks whether anyone has seen a man with six fingers on his right hand, then moves along.' },
  { id: 'inland-coconut', label: 'Inland coconut', contexts: ['market', 'fair'], text: 'A seller turns a coconut over in both hands and wonders how it traveled so far inland.' },
  { id: 'empty-field-wheeze', label: 'Wheeze in an empty field', contexts: ['field', 'roadside'], text: 'A faint mechanical wheeze crosses the empty field. The grass stirs, but nothing is there.' },
  { id: 'safer-place', label: 'Artifact kept somewhere safer', contexts: ['market', 'fair'], text: 'An antiquarian declines a curious relic: “It belongs somewhere safer, where it can be kept whole.”' },
  { id: 'traveler-with-towel', label: 'Traveler with a towel', contexts: ['inn', 'landing'], text: 'A traveler folds a towel over one arm and says they never leave home without it.' },
  { id: 'lights-over-field', label: 'Lights over a field', contexts: ['inn', 'market', 'newspaper'], text: 'The county paper mentions lights over a field; nearby farmers disagree whether they were only lanterns.' },
  { id: 'bellweather-hollow', label: 'Unlisted place on a sign', contexts: ['roadside'], text: 'A weathered sign names Bellweather Hollow, though no one nearby can place it on a map. It points nowhere you need to go.' },
];

export function getEasterEgg(id: string): EasterEgg | undefined {
  return EASTER_EGGS.find((egg) => egg.id === id);
}

export function rollEasterEgg(context: EasterEggContext, recentlySeen: string[], random = Math.random): EasterEgg | null {
  if (random() >= EASTER_EGG_CHANCE) return null;
  const eligible = EASTER_EGGS.filter((egg) => egg.contexts.includes(context));
  if (!eligible.length) return null;
  const unseen = eligible.filter((egg) => !recentlySeen.includes(egg.id));
  const pool = unseen.length ? unseen : eligible;
  const selected = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool[selected] ?? null;
}
