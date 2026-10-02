import type { Scenario, ScenarioDiversity, Scene } from '../types';
import { largeAdventure, largeEnd, largeScene, largeTags } from './largeContentTools';

export type SurpriseRisk = ScenarioDiversity['riskTier'];

/** Shared constructors only; every anthology entry owns its scene graph and consequences. */
export function anthologyTags(input: {
  hook: string; activities: string[]; role: string; tone: string; risk: SurpriseRisk;
  setting: string; structures: string[]; entry: string; rewards: string[];
  outcomes?: string[]; consequences?: string[]; fantasy?: ScenarioDiversity['fantasyDensity'];
}): ScenarioDiversity {
  const activityTags = new Set(['labor/repair', 'rescue/care', 'survival', 'negotiation/trade', 'investigation/mystery', 'travel/exploration', 'social interaction', 'animals', 'combat/defense', 'puzzle/problem-solving', 'moral prioritization', 'communication/witness', 'competition/game', 'other activity']);
  const tones = new Set(['peaceful', 'warm/hopeful', 'humorous/absurd', 'mysterious/eerie', 'adventurous', 'tense/dangerous', 'melancholy/tragic', 'grim', 'other tone']);
  const entries = new Set(['hired/posted work', 'stranded during travel', 'witnesses incident', 'asks for lodging', 'accidental encounter', 'invited/known contact', 'voluntary curiosity', 'buys/sells/trades', 'other entry']);
  const authoredActivities = input.activities.filter((activity) => activityTags.has(activity));
  const authoredTone = tones.has(input.tone) ? input.tone : 'other tone';
  const entry = entries.has(input.entry) ? input.entry : input.entry.includes('invited') ? 'invited/known contact' : 'accidental encounter';
  const result = largeTags({
    hook: input.hook, activity: authoredActivities[0] ?? 'social interaction', role: input.role,
    tone: authoredTone, risk: input.risk, setting: input.setting, fantasy: input.fantasy ?? 'NONE',
    structures: input.structures, entry: [input.entry], rewards: input.rewards,
    outcomes: input.outcomes, consequences: input.consequences,
  });
  result.activities = authoredActivities.length ? authoredActivities : ['social interaction'];
  result.playerRoles = [input.role];
  result.tones = [authoredTone];
  const structureText = input.structures.join(' ').toLowerCase();
  result.structures = ['branching narrative'];
  if (/multi-stage|performance|demonstration|negotiation|repair|investigation|information|reveal|audience|evidence|sequence|aftermath/.test(structureText)) result.structures.push('multi-stage sequence');
  if (/time|deadline|urgent|pressure|race|window/.test(structureText)) result.structures.push('time-pressure sequence');
  if (/variable|state|knowledge|random|run-specific/.test(structureText)) result.structures.push('run-specific variable');
  if (/quiet|vignette|brief|focused/.test(structureText)) result.structures.push('short focused sequence');
  if (/unusual|other|improvis|ritual|mistaken identity|social consequence/.test(structureText)) result.structures.push('other structure');
  result.entryShapes = [entry];
  result.rewardShapes = input.rewards;
  result.consequenceShapes = input.consequences ?? ['scenario-defined consequence'];
  return result;
}

export const anthologyScene = (id: string, title: string, text: string, choices: Scene['choices'], tone: Scene['tone'] = 'safe'): Scene => largeScene(id, title, text, choices, tone);
export const anthologyEnd = (id: string, title: string, text: string, ending: 'success' | 'death' = 'success'): Scene => largeEnd(id, title, text, ending);
export const anthologyStory = (id: string, title: string, subtitle: string, diversity: ScenarioDiversity, startScene: string, scenes: Record<string, Scene>): Scenario => largeAdventure(id, title, subtitle, diversity, startScene, scenes);
