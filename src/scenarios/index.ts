import type { Scenario } from '../types';
import { BROKEN_BELL } from './brokenBell';
import { LAST_STOP } from './lastStop';
import { AWW_RATS } from './awwRats';
import { WHATS_MINE } from './whatsMine';
import { THE_LAST_ROOM } from './theLastRoom';
import { DEAD_MANS_HAND } from './deadMansHand';

export const SCENARIOS: Scenario[] = [BROKEN_BELL, LAST_STOP, AWW_RATS, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND];

const BY_ID = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getScenario(id: string): Scenario | undefined {
  return BY_ID.get(id);
}

export { AWW_RATS, BROKEN_BELL, LAST_STOP, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND };
