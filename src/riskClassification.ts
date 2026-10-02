import type { RiskTier, Scenario } from './types';

const SEVERE_SCENARIOS = new Set([
  'under-the-ice', 'taking-on-water', 'high-water', 'no-vacancy', 'the-missing-boat',
  'the-burning-loft', 'the-sound-in-the-well', 'the-washout', 'the-blue-hole',
  'the-man-in-the-corn',
  'house-with-two-cellars', 'the-red-chapel', 'below-the-old-fort', 'the-man-who-wouldnt-stay-dead',
  'the-pass-before-snow', 'across-the-floodplain', 'whiteout', 'the-last-rope', 'river-without-a-bridge', 'the-ice-gives-warning', 'the-rocks-start-moving',
  'the-bridge-goes-down', 'the-mine-gives-way', 'water-through-the-door', 'the-ferry-lists', 'after-the-tornado', 'the-second-wave-large', 'the-last-shot', 'the-house-under-the-hill',
  'teeth-in-the-mine', 'the-bone-eater', 'the-ashen-man', 'thing-beneath-the-ice', 'the-antlered-thing', 'the-man-eater-of-millers-gap', 'the-red-maw',
]);

const HIGH_SCENARIOS = new Set([
  'broken-bell', 'last-stop', 'aww-rats', 'the-last-room', 'dead-mans-hand', 'the-long-way-home',
  'cold-storage', 'the-road-below', 'smoke-on-the-hill', 'the-man-in-the-ditch', 'down-to-the-last-match',
  'the-fallen-tree', 'the-loose-team', 'only-one-bullet', 'bear-with-me', 'give-me-whatcha-got',
  'whats-mine', 'the-empty-cradle', 'last-light-at-millers-crossing', 'the-weight-of-gold',
  'red-chalk-circle', 'lantern-at-the-crossing', 'thing-under-floorboards', 'the-wrong-shadow', 'the-hollow-man', 'doorway-with-no-room',
  'the-broken-axle', 'the-cave-before-the-storm', 'the-lost-survey-party', 'three-days-to-the-railhead', 'the-long-way-around-expedition',
  'night-on-the-ridge', 'the-washed-out-cut', 'the-tree-across-the-creek', 'the-wind-changes', 'the-load-must-go',
  'christmas-tree-millers-hill', 'red-scarf-in-the-snow', 'the-empty-sleigh', 'road-under-snow', 'frozen-millwheel', 'evergreen-door',
  'smoke-over-main-street', 'the-train-that-didnt-stop', 'the-boiler-room', 'the-crowd-breaks', 'the-roof-comes-in', 'the-powder-wagon',
  'the-man-at-the-end-of-the-bar', 'the-stage-was-hit', 'the-empty-jail', 'three-men-at-the-water-trough', 'a-gun-on-the-table', 'the-false-deputy', 'one-horse-two-riders',
  'the-sealed-mine-office', 'the-island-when-the-water-falls', 'the-cave-with-worked-stone', 'the-riverboat-cache',
  'thing-at-black-creek', 'something-in-the-corn', 'the-red-eyed-boar', 'the-lantern-eater', 'the-mire-horse', 'the-river-devil',
  'the-man-who-sheds-his-skin', 'the-last-trap', 'the-cinder-hound', 'the-beast-at-the-toll-road', 'thing-that-mimics-the-whistle', 'the-stoneback',
]);

const MODERATE_SCENARIOS = new Set([
  'bridge-out', 'the-borrowed-horse', 'the-broken-wheel', 'three-miles-to-rain', 'one-horse-short',
  'the-last-ferry', 'poison-the-well', 'silent-night', 'the-frightened-team', 'the-calf-in-the-mud',
  'the-stray-fire', 'the-faint-trail', 'camp-before-dark', 'the-shortcut', 'creek-on-the-return',
  'the-fog-comes-down', 'dry-camp', 'the-ridge-or-the-valley', 'a-night-of-wind', 'the-second-sunset',
  'the-voice-in-the-mine', 'the-cold-room', 'the-long-night', 'first-snow', 'the-thaw', 'before-the-frost',
  'seance-at-bellweather-house', 'man-who-sleeps-in-graveyard', 'the-widows-mirror', 'the-bone-box', 'the-quiet-room',
  'the-black-thread', 'medium-knows-too-much', 'candle-that-will-not-go-out', 'book-without-a-title', 'the-empty-coffin',
  'the-man-who-came-back-wrong', 'hanging-charms', 'the-third-knock', 'the-borrowed-face', 'last-candle-in-the-house',
  'no-water-at-millers-spring', 'the-wrong-valley', 'the-abandoned-camp', 'hold-until-morning',
  'last-parcel-before-christmas', 'gift-with-no-name', 'christmas-at-the-station', 'toymakers-last-order', 'the-pageant-problem',
  'snowbound-inn', 'footprints-around-the-house', 'house-with-warm-window', 'the-frozen-letter', 'the-longest-night', 'ice-lanterns', 'visitor-at-midnight',
  'the-christmas-visitor', 'empty-chair-at-midnight', 'gift-that-came-back',
  'wanted-in-red-creek', 'the-bounty-poster', 'the-rustled-herd', 'the-outlaws-mother', 'the-map-in-the-ledger', 'the-old-survey-stone', 'the-room-behind-the-chimney', 'the-forgotten-station', 'the-lost-payroll', 'the-last-room-in-the-fort',
  'the-white-stag', 'the-barrow-hound', 'the-millers-beast', 'the-widows-beast', 'the-cellar-thing', 'the-pale-children-of-the-quarry', 'the-broken-antler', 'the-three-toed-track', 'the-skin-in-the-tree',
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
