import type { Scenario } from '../types';
import { BROKEN_BELL } from './brokenBell';
import { LAST_STOP } from './lastStop';

export const SCENARIOS: Scenario[] = [BROKEN_BELL, LAST_STOP];

const BY_ID = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getScenario(id: string): Scenario | undefined {
  return BY_ID.get(id);
}

export { BROKEN_BELL, LAST_STOP };
