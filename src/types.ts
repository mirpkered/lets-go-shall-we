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
  lore: string[];
  knowledge: string[];
  adventuresCompleted: number;
}

export interface RunState {
  scenarioId: string;
  sceneId: string;
  health: number;
  inventory: string[];
  acquiredThisRun: string[];
  flags: string[];
  status: 'active' | 'success' | 'death';
  message: string | null;
  startedAt: number;
}

export interface SaveData {
  version: 1;
  bank: string[];
  character: Character | null;
  run: RunState | null;
}

export interface Requirement {
  items?: string[];
  anyItems?: string[];
  flags?: string[];
  notFlags?: string[];
  knowledge?: string[];
  minHealth?: number;
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
  gainItems?: string[];
  loseItems?: string[];
  knowledge?: string[];
  lore?: string[];
  money?: number;
  setFlags?: string[];
  clearFlags?: string[];
  combat?: CombatEffect;
}

export interface ChanceBranch {
  probability: number;
  successNext: string;
  failureNext: string;
  successMessage: string;
  failureMessage: string;
  successEffects?: Effects;
  failureEffects?: Effects;
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
}

export interface Scene {
  id: string;
  title: string;
  text: string;
  tone?: 'safe' | 'warning' | 'danger';
  choices: Choice[];
  ending?: 'success' | 'death';
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  startScene: string;
  scenes: Record<string, Scene>;
}
