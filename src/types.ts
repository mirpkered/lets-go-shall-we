export type ItemCategory = 'weapon' | 'armor' | 'tool' | 'charm' | 'relic' | 'consumable' | 'valuable' | 'artifact' | 'run-only';

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
}

export interface RunState {
  runId?: string;
  qaMode?: boolean;
  globalCompletionQueued?: boolean;
  completionCountRecorded?: boolean;
  completionMilestoneReached?: 10 | 20;
  scenarioId: string;
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
  message: string | null;
  startedAt: number;
  elapsedMinutes?: number;
  scenarioSaveVersion?: number;
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
  pendingGlobalCompletions?: string[];
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
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  startScene: string;
  saveVersion?: number;
  timePhases?: TimePhase[];
  runRandomSelections?: RunRandomSelection[];
  scenes: Record<string, Scene>;
}

export interface RunRandomSelection {
  id: string;
  values: { value: string; weight?: number }[];
}
