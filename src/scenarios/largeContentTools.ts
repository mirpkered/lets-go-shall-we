import type { Scenario, ScenarioDiversity, Scene, SeasonAvailability } from '../types';

export type LargeRisk = ScenarioDiversity['riskTier'];
export type LargeFantasy = ScenarioDiversity['fantasyDensity'];

export const largeScene = (id: string, title: string, text: string, choices: Scene['choices'], tone: Scene['tone'] = 'safe'): Scene => ({ id, title, text, choices, tone });
export const largeEnd = (id: string, title: string, text: string, ending: 'success' | 'death' = 'success'): Scene => ({ id, title, text, ending, choices: [] });

const ACTIVITY_TAGS = ['labor/repair', 'rescue/care', 'survival', 'negotiation/trade', 'investigation/mystery', 'travel/exploration', 'social interaction', 'animals', 'combat/defense', 'puzzle/problem-solving', 'moral prioritization', 'communication/witness'];
const STRUCTURE_TAGS = ['short focused sequence', 'multi-stage sequence', 'branching narrative', 'time-pressure sequence', 'run-specific variable', 'other structure'];
const TONE_TAGS = ['peaceful', 'warm/hopeful', 'humorous/absurd', 'mysterious/eerie', 'adventurous', 'tense/dangerous', 'melancholy/tragic', 'grim', 'other tone'];
const OUTCOME_TAGS = ['success/partial success', 'death', 'costly success/no-perfect-outcome possible', 'peaceful resolution', 'escape/survival', 'unresolved mystery', 'walk-away/refusal', 'negotiated compromise', 'scenario-defined resolution'];
const SETTING_TAGS = ['railroad/train/station', 'farm/homestead', 'town/market/inn', 'river/ferry/lake', 'road/bridge', 'forest/wilderness/mountain', 'mine/cave/underground', 'church/graveyard/ruin', 'workshop/mill/quarry/warehouse', 'domestic interior', 'shore/dock', 'other setting'];

export function largeTags(input: {
  hook: string; activity: string; role: string; tone: string; risk: LargeRisk; setting: string;
  fantasy?: LargeFantasy; combat?: ScenarioDiversity['combat']; structures?: string[];
  entry?: string[]; rewards?: string[]; outcomes?: string[]; consequences?: string[];
}): ScenarioDiversity {
  const dangerous = input.risk === 'HIGH' || input.risk === 'SEVERE';
  const settingText = input.setting.toLowerCase();
  const setting = /train|rail|station/.test(settingText) ? 'railroad/train/station'
    : /farm|house|homestead/.test(settingText) ? 'farm/homestead'
      : /river|ferry|lake|water|island|boat/.test(settingText) ? 'river/ferry/lake'
        : /mine|cave|underground/.test(settingText) ? 'mine/cave/underground'
          : /forest|wood|mountain|ridge|valley/.test(settingText) ? 'forest/wilderness/mountain'
            : /road|bridge|open country/.test(settingText) ? 'road/bridge'
              : /house|room|chimney|fort/.test(settingText) ? 'domestic interior'
                : /mill|workshop|quarry/.test(settingText) ? 'workshop/mill/quarry/warehouse'
                  : /shore|dock|landing/.test(settingText) ? 'shore/dock' : 'town/market/inn';
  const structureText = (input.structures ?? []).join(' ').toLowerCase();
  const structures = ['branching narrative'];
  if (structureText.includes('multi-stage') || structureText.includes('evidence') || structureText.includes('exploration') || structureText.includes('payoff')) structures.push('multi-stage sequence');
  if (/time|window|urgent|narrow|retreat|unstable|pressure/.test(structureText)) structures.push('time-pressure sequence');
  if (!structures.some((tag) => STRUCTURE_TAGS.includes(tag))) structures.push('multi-stage sequence');
  const tones = TONE_TAGS.includes(input.tone) ? [input.tone] : ['adventurous'];
  return {
    distinctiveHook: input.hook,
    playerRoles: [input.role], activities: [ACTIVITY_TAGS.includes(input.activity) ? input.activity : 'investigation/mystery'],
    structures: structures.length ? structures : ['branching narrative', 'multi-stage sequence'],
    tones, settings: [setting], riskTier: input.risk,
    fantasyDensity: input.fantasy ?? 'NONE',
    supernaturalThreats: (input.fantasy ?? 'NONE') === 'NONE' ? ['none specified'] : ['unexplained phenomenon'],
    combat: input.combat ?? 'NONE', length: input.risk === 'SEVERE' ? 'EXTENDED' : 'STANDARD',
    entryShapes: input.entry ?? ['accidental encounter'],
    outcomeShapes: (input.outcomes ?? ['success/partial success', 'walk-away/refusal', ...(dangerous ? ['escape/survival', 'costly success/no-perfect-outcome possible'] : [])]).filter((tag) => OUTCOME_TAGS.includes(tag)),
    rewardShapes: ['money/item/knowledge/history possible', 'narrative-only payoff'],
    consequenceShapes: ['time/opportunity', ...(dangerous ? ['health/injury', 'gear/property/objective'] : [])],
    availability: { season: 'ALL_YEAR', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], weightBoost: 1 } satisfies SeasonAvailability,
    historicalPresence: 'NONE', historicalReferences: [], historicalPortrayal: 'NOT_APPLICABLE',
  };
}

export function largeAdventure(id: string, title: string, subtitle: string, diversity: ScenarioDiversity, startScene: string, scenes: Record<string, Scene>): Scenario {
  const endings = Object.values(scenes).filter((entry) => entry.ending);
  if (endings.some((entry) => entry.ending === 'death')) {
    if (!diversity.outcomeShapes.includes('death')) diversity.outcomeShapes.push('death');
    if (!diversity.consequenceShapes.includes('death')) diversity.consequenceShapes.push('death');
  }
  return { id, title, subtitle, diversity, startScene, scenes };
}
