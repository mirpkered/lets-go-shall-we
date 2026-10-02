import type { EasterEggContext } from './easterEggs';
export type ItemCategory = 'weapon' | 'armor' | 'tool' | 'charm' | 'relic' | 'consumable' | 'valuable' | 'artifact' | 'run-only';
export type InventoryClass = 'GEAR' | 'SUPPLY' | 'RELIC' | 'ASSET' | 'TEMPORARY';
export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export type FantasyDensity = 'NONE' | 'AMBIGUOUS' | 'EERIE' | 'CONFIRMED_SUPERNATURAL' | 'FANTASY_THREAT' | 'DUNGEON_FANTASY';
export type CombatPresence = 'NONE' | 'AVOIDABLE' | 'POSSIBLE' | 'LIKELY' | 'UNAVOIDABLE' | 'MULTIPLE';
export type LengthClass = 'VIGNETTE' | 'STANDARD' | 'EXTENDED' | 'EPIC_SHORT';
/** Intended content lane; length alone never implies quality or exploration depth. */
export type ScenarioDepthClass = 'ENCOUNTER' | 'ADVENTURE' | 'DEEP_EXPLORATION';
export type SeasonKey = 'ALL_YEAR' | 'OCTOBER' | 'DECEMBER' | 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN' | 'CUSTOM';
export type HistoricalPresence = 'NONE' | 'INSPIRED' | 'CAMEO' | 'FEATURED' | 'HISTORICAL_EVENT';
export type HistoricalPortrayal = 'GROUNDED' | 'LEGENDARY' | 'MIXED' | 'NOT_APPLICABLE';
export interface SeasonAvailability { season: SeasonKey; months?: number[]; startMonthDay?: string; endMonthDay?: string; weightBoost?: number; /** Optional months in which an ALL_YEAR affinity boost applies. */ affinityMonths?: number[] }
export interface ScenarioDiversity {
  playerRoles: string[]; activities: string[]; structures: string[]; tones: string[]; settings: string[];
  riskTier: RiskTier; fantasyDensity: FantasyDensity; supernaturalThreats: string[]; combat: CombatPresence; length: LengthClass; depthClass: ScenarioDepthClass;
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
  upgrades?: ItemUpgradeDefinition[];
  maxUpgrades?: number;
  /** Persistent class; run-only equipment is TEMPORARY. Missing legacy values are safely inferred. */
  inventoryClass?: InventoryClass;
  /** Persistent supply stack size; supply quantity is stored on the character, not in carriedItems. */
  stackLimit?: number;
}

export type SupplyInventory = Record<string, number>;

/** A named, character-bound person/relationship the Traveler may plausibly meet again. */
export interface TravelerContact {
  id: string;
  name: string;
  role: string;
  sourceScenarioId: string;
  notes?: string;
}

/** A specific, non-stackable offer. Re-granting an existing ID never refreshes consumption. */
export interface TravelerFavor {
  id: string;
  contactId?: string;
  description: string;
  sourceScenarioId: string;
  status: 'available' | 'consumed';
}

export interface ItemUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  /** Upgrades in the same group replace one another. */
  group?: string;
}
export type ItemCondition = 'NORMAL' | 'DAMAGED' | 'BROKEN';
export interface PersistentItemState {
  condition: ItemCondition;
  upgrades: { id: string; provenance?: string }[];
  provenance: string[];
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
  /** Stable IDs for reusable Knowledge facts; prose remains in knowledge for player display. */
  knowledgeKeys?: string[];
  adventuresCompleted: number;
  /** Hidden traveler-bound quick exits; three unique endings earn one full completion. */
  quickExitCreditRemainder?: 0 | 1 | 2;
  /** Exact scenario/ending pairs already credited, preventing repeat farming. */
  quickExitEndingIds?: string[];
  historyFlags: string[];
  /** Newest-first primary activity categories started by this traveler. */
  scenarioCategoryHistory?: string[];
  /** Sparse counts of authored endings reached; abandoned and QA runs are excluded. */
  scenarioPlayCounts?: Record<string, number>;
  /** Character-bound property; unlike gear, these assets are not carried or banked. */
  ownedAssets?: OwnedAsset[];
  /** Character-bound limited-use resources, keyed by supply item ID. */
  supplies?: SupplyInventory;
  /** Named, character-bound relationships; not reputation or a score. */
  contacts?: TravelerContact[];
  /** Named, character-bound callable offers/obligations; not currency. */
  favors?: TravelerFavor[];
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
  startingItemStates?: Record<string, PersistentItemState>;
  startingSupplies?: SupplyInventory;
  /** Current run snapshot of the traveler’s persistent Supply stacks. */
  supplies?: SupplyInventory;
  supplyNotice?: string;
  supplyRewarded?: boolean;
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
  /** Persistent state keyed by unique item ID; carried and banked gear keep their exact state. */
  itemStates?: Record<string, PersistentItemState>;
  mostRecentScenarioId?: string | null;
  recentScenarioIds?: string[];
  /** Newest first. Legacy saves start with an empty history; QA runs never enter it. */
  recentRiskHistory?: RecentRiskEntry[];
  pendingGlobalCompletions?: string[];
  recentEasterEggIds?: string[];
}

export interface Requirement {
  items?: string[];
  usableItems?: string[];
  notUsableItems?: string[];
  anyUsableItems?: string[];
  itemConditions?: Record<string, ItemCondition[]>;
  itemUpgrades?: Record<string, string[]>;
  gear?: string[];
  usableGear?: string[];
  gearUpgrades?: Record<string, string[]>;
  relics?: string[];
  supplies?: Record<string, number>;
  canAddSupplies?: Record<string, number>;
  contacts?: string[];
  /** Requires each named Favor to still be available. */
  favors?: string[];
  ownedAssets?: string[];
  temporaryEquipment?: string[];
  notItemUpgrades?: Record<string, string[]>;
  notItems?: string[];
  anyItems?: string[];
  flags?: string[];
  notFlags?: string[];
  knowledge?: string[];
  /** Stable reusable Knowledge IDs. Legacy saves are upgraded from known matching prose. */
  knowledgeKeys?: string[];
  notKnowledgeKeys?: string[];
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
  gainSupplies?: Record<string, number>;
  consumeSupplies?: Record<string, number>;
  damageItems?: string[];
  breakItems?: string[];
  repairItems?: string[];
  repairItemProvenance?: Record<string, string>;
  addItemUpgrades?: { itemId: string; upgradeId: string; provenance?: string }[];
  replaceItems?: { oldItemId: string; newItemId: string; provenance?: string }[];
  loseItems?: string[];
  knowledge?: string[];
  /** Award readable fact text and its stable query identity together. */
  knowledgeEntries?: { id: string; text: string }[];
  lore?: string[];
  historyFlags?: string[];
  gainOwnedAssets?: OwnedAsset[];
  gainContacts?: TravelerContact[];
  gainFavors?: TravelerFavor[];
  consumeFavors?: string[];
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
  bonusUpgrades?: { itemId: string; upgradeId: string }[];
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
  /** Success endings count as substantive by default; brief authored exits opt into hidden quick credit. */
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
