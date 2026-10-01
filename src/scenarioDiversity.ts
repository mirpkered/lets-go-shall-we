import type { CombatPresence, FantasyDensity, HistoricalPortrayal, HistoricalPresence, LengthClass, Scenario, ScenarioDiversity, SeasonAvailability } from './types';
import { hasAuthoredDeathEnding, hasHealthLossBranch, scenarioRiskTier } from './riskClassification';

const MONTHS: Record<string, number[]> = {
  ALL_YEAR: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], OCTOBER: [10], DECEMBER: [12],
  WINTER: [12, 1, 2], SPRING: [3, 4, 5], SUMMER: [6, 7, 8], AUTUMN: [9, 10, 11],
};
const SETTING_RULES: [string, RegExp][] = [
  ['railroad/train/station', /train|railroad|railway|station|locomotive|carriage/], ['farm/homestead', /farm|barn|stable|field|pasture|sheep|goat|horse|mule|harness/],
  ['town/market/inn', /market|town|village|inn|tavern|boarding house|shop|store|street/], ['river/ferry/lake', /river|creek|water|ferry|boat|lake|ford|flood/],
  ['road/bridge', /road|trail|bridge|crossing|wagon|cart|mile/], ['forest/wilderness/mountain', /forest|woods|woodland|mountain|ridge|valley|wilderness|camp|trail/],
  ['mine/cave/underground', /mine|cave|underground|tunnel|shaft|below/], ['church/graveyard/ruin', /church|chapel|grave|cemetery|burial|ruin|crypt/],
  ['workshop/mill/quarry/warehouse', /workshop|mill|quarry|warehouse|factory|forge/], ['domestic interior', /cabin|house|room|kitchen|bedroom|attic|cellar|inside/],
  ['shore/dock', /shore|dock|harbor|landing|bank of the/],
];
const TONE_RULES: [string, RegExp][] = [
  ['peaceful', /quiet|peaceful|pleasant|rest|sleep|day off|fishing|swim|music/], ['warm/hopeful', /thank|help|share|welcome|family|together|kindness|safe/],
  ['humorous/absurd', /funny|laugh|foolish|ridiculous|comic|absurd|silly/], ['mysterious/eerie', /mystery|strange|unexplained|whisper|shadow|haunt|ghost|odd/],
  ['adventurous', /explore|journey|search|discover|venture|follow/], ['tense/dangerous', /danger|warning|risk|urgent|storm|fire|ice|collapse|attack|chase|escape/],
  ['melancholy/tragic', /dead|death|grief|lost|mourning|regret|alone/], ['grim', /blood|drown|burning|buried alive|desperate/],
];
const ACTIVITY_RULES: [string, RegExp][] = [
  ['labor/repair', /repair|fix|work|job|labor|build|mend|haul|harvest/], ['rescue/care', /rescue|save|pull .* out|injured|wound|bandage|help .* trapped/],
  ['survival', /survive|cold|storm|stranded|shelter|food|fuel|last match/], ['negotiation/trade', /pay|coin|price|sell|buy|bargain|offer|deal|owe|trade|wage/],
  ['investigation/mystery', /investigat|search|clue|evidence|missing|who owns|what happened|secret/], ['travel/exploration', /travel|route|road|trail|cross|journey|explore|destination/],
  ['social interaction', /talk|speak|listen|meet|share|conversation|story|visit|gathering/], ['animals', /horse|mule|dog|cat|goat|sheep|calf|cow|team|animal|livestock/],
  ['combat/defense', /fight|attack|weapon|combat|enemy|creature|defend|guard/], ['puzzle/problem-solving', /mechanism|key|lock|riddle|pattern|bell|signal|figure out|choose what to do/],
  ['moral prioritization', /cannot save|which .* first|choose who|leave .* behind|risk .* to save|one .* or the other/], ['communication/witness', /message|letter|witness|tell what|warning|signal|testimony/],
];
const THREAT_RULES: [string, RegExp][] = [
  ['ghost/apparition', /ghost|apparition|specter|phantom/], ['revenant/undead', /revenant|undead|zombie|animated dead|rises from the grave/],
  ['skeleton/animated bones', /skeleton|skeletal|animated bones/], ['cursed human/animal', /curse|cursed|possessed/], ['strange beast', /monster|beast|creature|thing in the dark/],
  ['ritual/cult', /ritual|cult|ceremony/], ['haunted object', /haunted object|cursed object|object .* whispers/], ['ancient guardian', /guardian|ancient.*watcher/],
  ['unexplained phenomenon', /impossible|vanished|unexplained|no footprints|voice with no/],
];

function allText(s: Scenario): string {
  return `${s.title} ${s.subtitle} ${Object.values(s.scenes).map((scene) => `${scene.title} ${scene.text} ${(scene.textVariants ?? []).map((v) => v.text).join(' ')} ${scene.choices.map((c) => `${c.label} ${c.hint ?? ''}`).join(' ')}`).join(' ')}`.toLowerCase();
}
function matching(text: string, rules: [string, RegExp][]): string[] { return rules.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag); }
function inferDensity(text: string, threats: string[]): FantasyDensity {
  if (/dungeon|crypt crawl|multiple chambers/.test(text) && threats.length) return 'DUNGEON_FANTASY';
  if (/skeleton|revenant|undead|animated bones|real ghost|confirmed ghost|monster attacks|creature attacks/.test(text)) return 'FANTASY_THREAT';
  if (/supernatural|haunt|ghost|curse|impossible|unexplained|apparition|strange voice/.test(text)) return /clearly|truly|real ghost|genuine|undead|skeleton|curse takes hold/.test(text) ? 'CONFIRMED_SUPERNATURAL' : 'EERIE';
  if (/rumor of a ghost|might be haunted|perhaps a ghost|could be a ghost|strange light|unexplained/.test(text)) return 'AMBIGUOUS';
  return 'NONE';
}
function inferCombat(s: Scenario, text: string): CombatPresence {
  const combats = Object.values(s.scenes).flatMap((scene) => scene.choices).filter((choice) => choice.effects?.combat).length;
  const combatTerms = /fight|attack|weapon|enemy|creature|combat/.test(text);
  if (combats > 1) return 'MULTIPLE';
  if (combats === 1) return hasAuthoredDeathEnding(s) ? 'LIKELY' : 'POSSIBLE';
  if (!combatTerms) return 'NONE';
  return hasAuthoredDeathEnding(s) ? 'AVOIDABLE' : 'POSSIBLE';
}
function inferredAvailability(s: Scenario, text: string): SeasonAvailability {
  const explicit = s.diversity?.availability;
  if (explicit) return { ...explicit, months: explicit.months ? [...explicit.months] : MONTHS[explicit.season] ?? [], weightBoost: explicit.weightBoost ?? (explicit.season === 'ALL_YEAR' ? 1 : 1.6) };
  // Mentioning weather, holidays or a season is not by itself a calendar gate.
  void text;
  return { season: 'ALL_YEAR', months: MONTHS.ALL_YEAR, weightBoost: 1 };
}

/** Complete fallback classification keeps the full legacy library searchable while authors can override any field explicitly. */
export function classifyScenario(scenario: Scenario): ScenarioDiversity {
  const text = allText(scenario);
  const sceneCount = Object.keys(scenario.scenes).length;
  const threats = matching(text, THREAT_RULES);
  const fantasyDensity: FantasyDensity = scenario.diversity?.fantasyDensity ?? inferDensity(text, threats);
  const combat: CombatPresence = scenario.diversity?.combat ?? inferCombat(scenario, text);
  const risk = scenarioRiskTier(scenario);
  const death = hasAuthoredDeathEnding(scenario);
  const persistentReward = Object.values(scenario.scenes).some((scene) => scene.choices.some((c) => (c.effects?.gainItems?.length ?? 0) > 0 || (c.effects?.money ?? 0) > 0 || (c.effects?.historyFlags?.length ?? 0) > 0 || (c.effects?.knowledge?.length ?? 0) > 0 || (c.effects?.lore?.length ?? 0) > 0));
  const endings = Object.values(scenario.scenes).filter((scene) => scene.ending);
  const inferred: ScenarioDiversity = {
    playerRoles: matching(text, [['worker', /job|work|wage|employer|labor/], ['helper/rescuer', /help|rescue|save|injured|stranded/], ['witness', /witness|saw|testimony|accident/], ['traveler/passenger', /road|travel|inn|train|ferry|journey/], ['investigator/explorer', /search|clue|mystery|explore|discover/], ['negotiator/buyer/seller', /buy|sell|price|pay|bargain|owe|deal/], ['guest', /inn|meal|invited|lodging|stay the night/], ['accidental participant', /suddenly|by chance|happens to|wrong place/]]).slice(0, 3),
    activities: matching(text, ACTIVITY_RULES).slice(0, 4),
    structures: [sceneCount <= 4 ? 'short focused sequence' : sceneCount >= 12 ? 'multi-stage sequence' : 'branching narrative', ...(scenario.timePhases?.length ? ['time-pressure sequence'] : []), ...(Object.keys(scenario.runRandomSelections ?? {}).length ? ['run-specific variable'] : [])],
    tones: matching(text, TONE_RULES).slice(0, 4),
    settings: matching(text, SETTING_RULES).slice(0, 5),
    riskTier: risk, fantasyDensity,
    supernaturalThreats: threats,
    combat,
    length: sceneCount <= 4 ? 'VIGNETTE' : sceneCount <= 11 ? 'STANDARD' : sceneCount <= 20 ? 'EXTENDED' : 'EPIC_SHORT',
    entryShapes: matching(text, [['hired/posted work', /hired|job offer|posted work|employer/], ['stranded during travel', /stranded|missed the|cannot cross|blocked road/], ['witnesses incident', /witness|you see|you hear|nearby when/], ['asks for lodging', /inn|lodging|room for the night/], ['accidental encounter', /by chance|happens upon|come across|finds? .* on the road/], ['invited/known contact', /invited|friend|acquaintance|knows you/], ['voluntary curiosity', /curious|decide to investigate|follow the sound/], ['buys/sells/trades', /buy|sell|trade|market|merchant/]]).slice(0, 2),
    outcomeShapes: [...(endings.some((e) => e.ending === 'success') ? ['success/partial success'] : []), ...(death ? ['death'] : []), ...(risk === 'SEVERE' ? ['costly success/no-perfect-outcome possible'] : []), ...(matching(text, [['peaceful resolution', /peacefully|calm|settle|reconcile|returns? home/], ['escape/survival', /escape|survive|retreat|leave safely/], ['unresolved mystery', /never learn|remains unknown|unresolved/], ['walk-away/refusal', /walk away|leave without|refuse|move on/], ['negotiated compromise', /compromise|agree to|meet halfway/]]))],
    rewardShapes: [...(persistentReward ? ['money/item/knowledge/history possible'] : []), ...(matching(text, [['lodging/food', /meal|food|room for the night|shelter/], ['relationship/referral', /referral|recommend|remember your help|trusts you/], ['narrative-only payoff', /thanks|conversation|part ways|quiet evening/]])), ...(!persistentReward ? ['no tangible persistent reward detected'] : [])],
    consequenceShapes: [...(hasHealthLossBranch(scenario) ? ['health/injury'] : []), ...(death ? ['death'] : []), ...(matching(text, [['money/wages', /lose .*coin|payment|wages|fee|price/], ['gear/property/objective', /lose .*item|broken|destroy|abandon|property|objective fails/], ['time/opportunity', /too late|missed|wait|delay|by morning/], ['relationship', /angry|trust|argument|relationship/]])), ...(!death && !hasHealthLossBranch(scenario) ? ['no serious physical loss detected'] : [])],
    distinctiveHook: scenario.diversity?.distinctiveHook ?? scenario.subtitle.slice(0, 180),
    availability: inferredAvailability(scenario, text),
    historicalPresence: 'NONE',
    historicalReferences: [],
    historicalPortrayal: 'NOT_APPLICABLE',
  };
  const metadata = scenario.diversity;
  const complete = { ...inferred, ...metadata, riskTier: risk, availability: inferredAvailability(scenario, text) } as ScenarioDiversity;
  const listFallbacks: Partial<Record<keyof ScenarioDiversity, string>> = { playerRoles: 'other role', activities: 'other activity', structures: 'other structure', tones: 'other tone', settings: 'other setting', supernaturalThreats: 'none specified', entryShapes: 'other entry', outcomeShapes: 'scenario-defined resolution', rewardShapes: 'narrative-only payoff', consequenceShapes: 'scenario-defined consequence' };
  for (const [field, fallback] of Object.entries(listFallbacks)) if (!(complete[field as keyof ScenarioDiversity] as string[]).length) Object.assign(complete, { [field]: [fallback] });
  complete.distinctiveHook = complete.distinctiveHook.trim() || scenario.subtitle.trim() || scenario.title;
  return complete;
}

export function scenarioAvailableInMonth(scenario: Scenario, month: number): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  const availability = getSeasonAvailability(scenario);
  const months = availability.months ?? MONTHS[availability.season] ?? [];
  if (!months.includes(month)) return false;
  if (availability.startMonthDay && availability.endMonthDay) {
    const day = new Date().getDate();
    const date = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availability.startMonthDay <= availability.endMonthDay
      ? date >= availability.startMonthDay && date <= availability.endMonthDay
      : date >= availability.startMonthDay || date <= availability.endMonthDay;
  }
  return true;
}

/** Runtime selection reads only explicit seasonal metadata; legacy adventures are all-year and are never text-scanned. */
export function getSeasonAvailability(scenario: Scenario): SeasonAvailability {
  const availability = scenario.diversity?.availability;
  if (!availability) return { season: 'ALL_YEAR', months: MONTHS.ALL_YEAR, weightBoost: 1 };
  return { ...availability, months: availability.months ? [...availability.months] : MONTHS[availability.season] ?? [], weightBoost: availability.weightBoost ?? (availability.season === 'ALL_YEAR' ? 1 : 1.6) };
}

export interface SimilarityWarning { firstId: string; secondId: string; score: number; sharedDimensions: string[] }
function similarity(a: ScenarioDiversity, b: ScenarioDiversity): { score: number; shared: string[] } {
  const jaccard = (left: string[], right: string[]) => {
    const union = new Set([...left, ...right]);
    return union.size ? [...new Set(left)].filter((tag) => right.includes(tag)).length / union.size : 0;
  };
  const dimensions: [string, number][] = [
    ['role', jaccard(a.playerRoles, b.playerRoles)], ['activity', jaccard(a.activities, b.activities)],
    ['structure', jaccard(a.structures, b.structures)], ['tone', jaccard(a.tones, b.tones)], ['setting', jaccard(a.settings, b.settings)],
    ['risk', a.riskTier === b.riskTier ? 1 : 0], ['length', a.length === b.length ? 1 : 0], ['fantasy', a.fantasyDensity === b.fantasyDensity ? 1 : 0],
    ['entry', jaccard(a.entryShapes, b.entryShapes)], ['outcome', jaccard(a.outcomeShapes, b.outcomeShapes)], ['reward', jaccard(a.rewardShapes, b.rewardShapes)],
  ];
  const shared = dimensions.filter(([, score]) => score >= 0.5).map(([dimension]) => dimension);
  return { score: dimensions.reduce((sum, [, score]) => sum + score, 0) / dimensions.length, shared };
}

/** Audit-time O(n²) only; never called by normal Begin Adventure selection. */
export function analyzeScenarioLibrary(scenarios: Scenario[]): { classified: number; total: number; rows: { id: string; title: string; metadata: ScenarioDiversity; sceneCount: number; choiceCounts: string }[]; distributions: Record<string, Record<string, number>>; historicalReferenceCounts: Record<string, number>; similarityWarnings: SimilarityWarning[]; structuralWarnings: { firstId: string; secondId: string; sceneCount: number; choiceCounts: string }[] } {
  const entries = scenarios.map((scenario) => ({ scenario, metadata: classifyScenario(scenario) }));
  const rows = entries.map(({ scenario, metadata }) => ({ id: scenario.id, title: scenario.title, metadata, sceneCount: Object.keys(scenario.scenes).length, choiceCounts: Object.values(scenario.scenes).map((scene) => scene.choices.length).join('-') }));
  const dimensions: (keyof ScenarioDiversity)[] = ['playerRoles', 'activities', 'structures', 'tones', 'settings', 'riskTier', 'fantasyDensity', 'supernaturalThreats', 'combat', 'length', 'entryShapes', 'outcomeShapes', 'rewardShapes', 'consequenceShapes', 'availability', 'historicalPresence', 'historicalPortrayal'];
  const distributions: Record<string, Record<string, number>> = {};
  for (const dimension of dimensions) {
    const counts: Record<string, number> = {};
    for (const { metadata } of entries) {
      const value = metadata[dimension];
      const values = Array.isArray(value) ? value : dimension === 'availability' ? [(value as SeasonAvailability).season] : [String(value)];
      for (const tag of values) counts[String(tag)] = (counts[String(tag)] ?? 0) + 1;
    }
    distributions[dimension] = counts;
  }
  const historicalReferenceCounts: Record<string, number> = {};
  for (const { metadata } of entries) for (const reference of metadata.historicalReferences) {
    const normalized = reference.trim();
    if (normalized) historicalReferenceCounts[normalized] = (historicalReferenceCounts[normalized] ?? 0) + 1;
  }
  const similarityWarnings: SimilarityWarning[] = [];
  const structuralWarnings: { firstId: string; secondId: string; sceneCount: number; choiceCounts: string }[] = [];
  for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
    const first = entries[i], second = entries[j];
    const compared = similarity(first.metadata, second.metadata);
    const core = compared.shared.filter((dimension) => ['activity', 'structure', 'setting', 'entry', 'outcome', 'reward'].includes(dimension)).length;
    if (compared.score >= 0.72 && core >= 4) similarityWarnings.push({ firstId: first.scenario.id, secondId: second.scenario.id, score: Number(compared.score.toFixed(2)), sharedDimensions: compared.shared });
    const shape = (scenario: Scenario) => Object.values(scenario.scenes).map((scene) => scene.choices.length).join('-');
    const aShape = shape(first.scenario), bShape = shape(second.scenario);
    if (first.scenario.id !== second.scenario.id && Object.keys(first.scenario.scenes).length === Object.keys(second.scenario.scenes).length && aShape === bShape) structuralWarnings.push({ firstId: first.scenario.id, secondId: second.scenario.id, sceneCount: Object.keys(first.scenario.scenes).length, choiceCounts: aShape });
  }
  return { classified: entries.filter(({ metadata }) => !!metadata.distinctiveHook && !!metadata.availability && !!metadata.length).length, total: scenarios.length, rows, distributions, historicalReferenceCounts, similarityWarnings, structuralWarnings };
}

export function validateScenarioMetadata(scenarios: Scenario[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  const tagRules: Partial<Record<keyof ScenarioDiversity, string[]>> = {
    playerRoles: ['worker', 'helper/rescuer', 'witness', 'traveler/passenger', 'investigator/explorer', 'negotiator/buyer/seller', 'guest', 'accidental participant', 'other role'],
    activities: ['labor/repair', 'rescue/care', 'survival', 'negotiation/trade', 'investigation/mystery', 'travel/exploration', 'social interaction', 'animals', 'combat/defense', 'puzzle/problem-solving', 'moral prioritization', 'communication/witness', 'other activity'],
    structures: ['short focused sequence', 'multi-stage sequence', 'branching narrative', 'time-pressure sequence', 'run-specific variable', 'other structure'],
    tones: ['peaceful', 'warm/hopeful', 'humorous/absurd', 'mysterious/eerie', 'adventurous', 'tense/dangerous', 'melancholy/tragic', 'grim', 'other tone'],
    settings: [...SETTING_RULES.map(([tag]) => tag), 'other setting'],
    supernaturalThreats: [...THREAT_RULES.map(([tag]) => tag), 'none specified'],
    entryShapes: ['hired/posted work', 'stranded during travel', 'witnesses incident', 'asks for lodging', 'accidental encounter', 'invited/known contact', 'voluntary curiosity', 'buys/sells/trades', 'other entry'],
    outcomeShapes: ['success/partial success', 'death', 'costly success/no-perfect-outcome possible', 'peaceful resolution', 'escape/survival', 'unresolved mystery', 'walk-away/refusal', 'negotiated compromise', 'scenario-defined resolution'],
    rewardShapes: ['money/item/knowledge/history possible', 'lodging/food', 'relationship/referral', 'narrative-only payoff', 'no tangible persistent reward detected'],
    consequenceShapes: ['health/injury', 'death', 'money/wages', 'gear/property/objective', 'time/opportunity', 'relationship', 'no serious physical loss detected', 'scenario-defined consequence'],
  };
  const historicalPresences: HistoricalPresence[] = ['NONE', 'INSPIRED', 'CAMEO', 'FEATURED', 'HISTORICAL_EVENT'];
  const historicalPortrayals: HistoricalPortrayal[] = ['GROUNDED', 'LEGENDARY', 'MIXED', 'NOT_APPLICABLE'];
  for (const scenario of scenarios) {
    if (ids.has(scenario.id)) issues.push(`Duplicate scenario ID: ${scenario.id}`);
    ids.add(scenario.id);
    const metadata = classifyScenario(scenario);
    if (!metadata.distinctiveHook.trim()) issues.push(`${scenario.id}: missing distinguishing hook`);
    if (!FANTASY_DENSITIES.includes(metadata.fantasyDensity)) issues.push(`${scenario.id}: invalid fantasy density`);
    if (!COMBAT_PRESENCES.includes(metadata.combat)) issues.push(`${scenario.id}: invalid combat presence`);
    if (!LENGTH_CLASSES.includes(metadata.length)) issues.push(`${scenario.id}: invalid length class`);
    if (!['LOW', 'MODERATE', 'HIGH', 'SEVERE'].includes(metadata.riskTier)) issues.push(`${scenario.id}: invalid risk tier`);
    if (!historicalPresences.includes(metadata.historicalPresence)) issues.push(`${scenario.id}: invalid historical presence`);
    if (!historicalPortrayals.includes(metadata.historicalPortrayal)) issues.push(`${scenario.id}: invalid historical portrayal`);
    if (metadata.historicalPresence === 'CAMEO' || metadata.historicalPresence === 'FEATURED') {
      if (!metadata.historicalReferences.length || metadata.historicalReferences.some((reference) => !reference.trim())) issues.push(`${scenario.id}: ${metadata.historicalPresence} requires a named historical reference`);
      if (metadata.historicalPortrayal === 'NOT_APPLICABLE') issues.push(`${scenario.id}: ${metadata.historicalPresence} requires a portrayal label`);
    }
    if (metadata.historicalPresence === 'HISTORICAL_EVENT' && !metadata.historicalReferences.length) issues.push(`${scenario.id}: HISTORICAL_EVENT requires a named event reference`);
    if (metadata.historicalPresence === 'NONE' && metadata.historicalReferences.length) issues.push(`${scenario.id}: NONE cannot list historical references`);
    for (const [dimension, allowed] of Object.entries(tagRules)) {
      const values = metadata[dimension as keyof ScenarioDiversity];
      if (Array.isArray(values)) for (const value of values) if (!allowed!.includes(value)) issues.push(`${scenario.id}: invalid ${dimension} tag “${value}”`);
    }
    const months = metadata.availability.months ?? [];
    if (!months.length || months.some((month) => !Number.isInteger(month) || month < 1 || month > 12)) issues.push(`${scenario.id}: invalid seasonal month configuration`);
    if (metadata.availability.weightBoost !== undefined && (metadata.availability.weightBoost < 1 || metadata.availability.weightBoost > 5)) issues.push(`${scenario.id}: seasonal boost outside safe bounds`);
    const datePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if ((metadata.availability.startMonthDay || metadata.availability.endMonthDay) && !(metadata.availability.startMonthDay && metadata.availability.endMonthDay && datePattern.test(metadata.availability.startMonthDay) && datePattern.test(metadata.availability.endMonthDay))) issues.push(`${scenario.id}: incomplete/invalid seasonal date window`);
  }
  return issues;
}

export const FANTASY_DENSITIES: FantasyDensity[] = ['NONE', 'AMBIGUOUS', 'EERIE', 'CONFIRMED_SUPERNATURAL', 'FANTASY_THREAT', 'DUNGEON_FANTASY'];
export const COMBAT_PRESENCES: CombatPresence[] = ['NONE', 'AVOIDABLE', 'POSSIBLE', 'LIKELY', 'UNAVOIDABLE', 'MULTIPLE'];
export const LENGTH_CLASSES: LengthClass[] = ['VIGNETTE', 'STANDARD', 'EXTENDED', 'EPIC_SHORT'];
export const SEASON_MONTHS = MONTHS;

