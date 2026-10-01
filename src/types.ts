import type { EasterEggContext } from './easterEggs';
export type ItemCategory = 'weapon' | 'armor' | 'tool' | 'charm' | 'relic' | 'consumable' | 'valuable' | 'artifact' | 'run-only';
export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export type FantasyDensity = 'NONE' | 'AMBIGUOUS' | 'EERIE' | 'CONFIRMED_SUPERNATURAL' | 'FANTASY_THREAT' | 'DUNGEON_FANTASY';
export type CombatPresence = 'NONE' | 'AVOIDABLE' | 'POSSIBLE' | 'LIKELY' | 'UNAVOIDABLE' | 'MULTIPLE';
export type LengthClass = 'VIGNETTE' | 'STANDARD' | 'EXTENDED' | 'EPIC_SHORT';
export type SeasonKey = 'ALL_YEAR' | 'OCTOBER' | 'DECEMBER' | 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN' | 'CUSTOM';
export type HistoricalPresence = 'NONE' | 'INSPIRED' | 'CAMEO' | 'FEATURED' | 'HISTORICAL_EVENT';
export type HistoricalPortrayal = 'GROUNDED' | 'LEGENDARY' | 'MIXED' | 'NOT_APPLICABLE';
export interface SeasonAvailability { season: SeasonKey; months?: number[]; startMonthDay?: string; endMonthDay?: string; weightBoost?: number }
export interface ScenarioDiversity {
  playerRoles: string[]; activities: string[]; structures: string[]; tones: string[]; settings: string[];
  riskTier: RiskTier; fantasyDensity: FantasyDensity; supernaturalThreats: string[]; combat: CombatPresence; length: LengthClass;
  entryShapes: string[]; outcomeShapes: string[]; rewardShapes: string[]; consequenceShapes: string[];
  distinctiveHook: string; availability: SeasonAvailability;
  historicalPresence: HistoricalPresence; historicalReferences: string[]; historicalPortrayal: HistoricalPortrayal;
}

export interface RecentRiskEntry { scenarioId: string; tier: RiskTier }

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  carryable: boolean;
}

export interface Character {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  money: number;
  carriedItem: string | null;
  /** Canonical persistent loadout. carriedItem remains as a legacy first-slot alias. */
  carriedItems?: string[];
  lore: string[];
  knowledge: string[];
  adventuresCompleted: number;
  historyFlags: string[];
  /** Character-bound property; unlike gear, these assets are not carried or banked. */
  ownedAssets?: OwnedAsset[];
}

export interface OwnedAsset {
  id: string;
  name: string;
  description: string;
}

export type InventorySource = 'starting' | 'carried' | 'found' | 'temporary' | 'borrowed' | 'supplied';

export interface RunState {
  runId?: string;
  qaMode?: boolean;
  globalCompletionQueued?: boolean;
  /** Marks global authored-ending handling independently from traveler progression. */
  authoredEndingRecorded?: boolean;
  riskHistoryRecorded?: boolean;
  completionCountRecorded?: boolean;
  completionMilestoneReached?: 10 | 20;
  /** Meaningful forward story transitions completed in this run. */
  qualifyingStoryTransitions?: number;
  /** Persistent state at run start, used to recognize real completion outcomes. */
  startingMoney?: number;
  startingCarriedItems?: string[];
  /** Provenance for the broad usable inventory shown during this adventure. */
  inventorySources?: Record<string, InventorySource>;
  completionQualification?: 'substantive' | 'nonSubstantive';
  scenarioId: string;
  /** Captured at run start so the selection diagnostic/history remains stable across reloads. */
  riskTier?: RiskTier;
  sceneId: string;
  health: number;
  inventory: string[];
  acquiredThisRun: string[];
  flags: string[];
  visitedSceneIds?: string[];
  randomSelections?: Record<string, string>;
  status: 'active' | 'success' | 'death';
  rewardSelectionOpen?: boolean;
  rewardCarrySelection?: string[];
  /** Persistent item rewards not yet explicitly carried, banked, or declined. */
  rewardPendingItems?: string[];
  message: string | null;
  startedAt: number;
  elapsedMinutes?: number;
  scenarioSaveVersion?: number;
  easterEggEvent?: { id: string; sceneId: string; text: string };
  qaEasterEggDisabled?: boolean;
}

export interface TimePhase {
  id: string;
  label: string;
  atMinutes: number;
}

export interface SaveData {
  version: 1;
  bank: string[];
  character: Character | null;
  run: RunState | null;
  mostRecentScenarioId?: string | null;
  recentScenarioIds?: string[];
  /** Newest first. Legacy saves start with an empty history; QA runs never enter it. */
  recentRiskHistory?: RecentRiskEntry[];
  pendingGlobalCompletions?: string[];
  recentEasterEggIds?: string[];
}

export interface Requirement {
  items?: string[];
  notItems?: string[];
  anyItems?: string[];
  flags?: string[];
  notFlags?: string[];
  knowledge?: string[];
  notKnowledge?: string[];
  historyFlags?: string[];
  minHealth?: number;
  minMoney?: number;
  maxMoney?: number;
  minElapsedMinutes?: number;
  maxElapsedMinutes?: number;
  selections?: Record<string, string>;
}

export interface CombatEffect {
  enemy: string;
  winChance: number;
  damageOnWin?: number;
  damageOnLoss: number;
  winNext: string;
  lossNext: string;
}

export interface Effects {
  health?: number;
  loseMoney?: boolean;
  loseCarriedItem?: boolean;
  loseCarriedItems?: boolean;
  gainItems?: string[];
  loseItems?: string[];
  knowledge?: string[];
  lore?: string[];
  historyFlags?: string[];
  gainOwnedAssets?: OwnedAsset[];
  inventorySources?: Record<string, InventorySource>;
  money?: number;
  setFlags?: string[];
  clearFlags?: string[];
  combat?: CombatEffect;
}

export interface ChanceBranch {
  probability: number;
  lateProbability?: number;
  lateAfterMinutes?: number;
  successNext: string;
  failureNext: string;
  successMessage: string;
  failureMessage: string;
  successEffects?: Effects;
  failureEffects?: Effects;
  bonusItems?: string[];
  bonusFlags?: string[];
  bonusSelections?: Record<string, string>;
  penaltySelections?: Record<string, string>;
  bonusProbability?: number;
  penaltyProbability?: number;
}

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  requirements?: Requirement;
  unavailableText?: string;
  effects?: Effects;
  chance?: ChanceBranch;
  next?: string;
  timeCost?: number;
}

export interface Scene {
  id: string;
  title: string;
  text: string;
  textVariants?: { requirements: Requirement; text: string }[];
  tone?: 'safe' | 'warning' | 'danger';
  choices: Choice[];
  ending?: 'success' | 'death';
  /** Explicitly classify the story outcome; persistent money/gear changes can qualify automatically. */
  completionQualification?: 'substantive' | 'nonSubstantive';
  /** Defaults to true. Set false for a presentation-only continuation screen. */
  countsForProgression?: boolean;
  easterEggContext?: EasterEggContext;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  startScene: string;
  saveVersion?: number;
  timePhases?: TimePhase[];
  runRandomSelections?: RunRandomSelection[];
  /** Optional authorial overrides; legacy scenarios receive audited keyword/content classification. */
  diversity?: Partial<ScenarioDiversity>;
  scenes: Record<string, Scene>;
}

export interface RunRandomSelection {
  id: string;
  values: { value: string; weight?: number }[];
}
