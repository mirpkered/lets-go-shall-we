import type { RiskTier, Scenario } from './types';

const SEVERE_SCENARIOS = new Set([
  'under-the-ice', 'taking-on-water', 'high-water', 'no-vacancy', 'the-missing-boat',
  'the-burning-loft', 'the-sound-in-the-well', 'the-washout', 'the-blue-hole',
  'the-man-in-the-corn',
]);

const HIGH_SCENARIOS = new Set([
  'broken-bell', 'last-stop', 'aww-rats', 'the-last-room', 'dead-mans-hand', 'the-long-way-home',
  'cold-storage', 'the-road-below', 'smoke-on-the-hill', 'the-man-in-the-ditch', 'down-to-the-last-match',
  'the-fallen-tree', 'the-loose-team', 'only-one-bullet', 'bear-with-me', 'give-me-whatcha-got',
  'whats-mine', 'the-empty-cradle', 'last-light-at-millers-crossing', 'the-weight-of-gold',
]);

const MODERATE_SCENARIOS = new Set([
  'bridge-out', 'the-borrowed-horse', 'the-broken-wheel', 'three-miles-to-rain', 'one-horse-short',
  'the-last-ferry', 'poison-the-well', 'silent-night', 'the-frightened-team', 'the-calf-in-the-mud',
  'the-stray-fire', 'the-faint-trail', 'camp-before-dark', 'the-shortcut', 'creek-on-the-return',
  'the-fog-comes-down', 'dry-camp', 'the-ridge-or-the-valley', 'a-night-of-wind', 'the-second-sunset',
  'the-voice-in-the-mine', 'the-cold-room', 'the-long-night', 'first-snow', 'the-thaw', 'before-the-frost',
]);

/** Scenario-level authored stakes only. This never modifies a run's odds or character stats. */
export function scenarioRiskTier(scenario: Pick<Scenario, 'id' | 'scenes'>): RiskTier {
  if (SEVERE_SCENARIOS.has(scenario.id)) return 'SEVERE';
  if (HIGH_SCENARIOS.has(scenario.id)) return 'HIGH';
  if (MODERATE_SCENARIOS.has(scenario.id)) return 'MODERATE';
  if (Object.values(scenario.scenes).some((scene) => scene.ending === 'death')) return 'HIGH';
  if (Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) => choice.effects?.health !== undefined || choice.chance?.failureEffects?.health !== undefined || choice.chance?.successEffects?.health !== undefined || choice.effects?.combat !== undefined))) return 'MODERATE';
  return 'LOW';
}

export const RISK_TIERS: RiskTier[] = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];

export function hasAuthoredDeathEnding(scenario: Pick<Scenario, 'scenes'>): boolean {
  return Object.values(scenario.scenes).some((scene) => scene.ending === 'death');
}

export function hasHealthLossBranch(scenario: Pick<Scenario, 'scenes'>): boolean {
  return Object.values(scenario.scenes).some((scene) => scene.choices.some((choice) =>
    (choice.effects?.health ?? 0) < 0
    || (choice.chance?.failureEffects?.health ?? 0) < 0
    || (choice.chance?.successEffects?.health ?? 0) < 0
    || (choice.effects?.combat?.damageOnLoss ?? 0) > 0
    || (choice.effects?.combat?.damageOnWin ?? 0) > 0,
  ));
}
