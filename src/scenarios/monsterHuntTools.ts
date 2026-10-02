import type { ScenarioDiversity, SeasonAvailability } from '../types';
import { largeTags } from './largeContentTools';

export { largeScene as huntScene, largeEnd as huntEnd } from './largeContentTools';

export function huntMetadata(input: {
  hook: string; activity: string; role: string; tone: string; risk: ScenarioDiversity['riskTier']; setting: string;
  fantasy?: ScenarioDiversity['fantasyDensity']; combat?: ScenarioDiversity['combat']; structure?: string;
  season?: SeasonAvailability; threats?: string[]; rewards?: string[]; consequences?: string[];
}): ScenarioDiversity {
  const metadata = largeTags({
    hook: input.hook,
    activity: input.activity,
    role: input.role,
    tone: input.tone,
    risk: input.risk,
    setting: input.setting,
    fantasy: input.fantasy,
    combat: input.combat,
    structures: [input.structure ?? 'multi-stage payoff'],
    outcomes: ['success/partial success', 'walk-away/refusal', ...(input.risk === 'HIGH' || input.risk === 'SEVERE' ? ['escape/survival', 'costly success/no-perfect-outcome possible'] : [])],
  });
  if (input.season) metadata.availability = input.season;
  if (input.threats) metadata.supernaturalThreats = input.threats;
  if (input.rewards) metadata.rewardShapes = input.rewards;
  if (input.consequences) metadata.consequenceShapes = input.consequences;
  return metadata;
}
