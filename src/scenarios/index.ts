import type { Scenario } from '../types';
import { BROKEN_BELL } from './brokenBell';
import { LAST_STOP } from './lastStop';
import { AWW_RATS } from './awwRats';
import { WHATS_MINE } from './whatsMine';
import { THE_LAST_ROOM } from './theLastRoom';
import { DEAD_MANS_HAND } from './deadMansHand';
import { BRIDGE_OUT } from './bridgeOut';
import { THE_LONG_WAY_HOME } from './longWayHome';
import { NO_VACANCY } from './noVacancy';
import { COLD_STORAGE } from './coldStorage';
import { HIGH_WATER } from './highWater';
import { ONE_MORE_ROUND } from './oneMoreRound';
import { THE_ROAD_BELOW } from './theRoadBelow';
import { SMOKE_ON_THE_HILL } from './smokeOnTheHill';
import { THE_EMPTY_CRADLE } from './theEmptyCradle';
import { LAST_LIGHT_AT_MILLERS_CROSSING } from './lastLightAtMillersCrossing';
import { THE_WEIGHT_OF_GOLD } from './weightOfGold';
import { HUSH_NOW } from './hushNow';
import { DOWN_TO_THE_LAST_MATCH } from './downToTheLastMatch';
import { THE_MAN_IN_THE_DITCH } from './manInTheDitch';
import { TAKING_ON_WATER } from './takingOnWater';
import { BURNING_LOFT } from './burningLoft';
import { UNDER_THE_ICE } from './underTheIce';
import { THE_BORROWED_HORSE } from './borrowedHorse';
import { A_SEAT_BY_THE_FIRE } from './seatByTheFire';
import { THE_SOUND_IN_THE_WELL } from './soundInWell';
import { THE_BROKEN_WHEEL } from './brokenWheel';
import { THREE_MILES_TO_RAIN } from './threeMilesToRain';
import { THE_EMPTY_WAGON } from './emptyWagon';
import { THE_BELL_AFTER_MIDNIGHT } from './bellAfterMidnight';
import { ONE_HORSE_SHORT } from './oneHorseShort';
import { THE_MISSING_BOAT } from './missingBoat';
import { AFTER_THE_STORM } from './afterTheStorm';
import { THE_LAST_FERRY } from './lastFerry';
import { THE_FALLEN_TREE } from './fallenTree';
import { THE_LOOSE_TEAM } from './looseTeam';
import { THE_WASHOUT } from './washout';

export const SCENARIOS: Scenario[] = [BROKEN_BELL, LAST_STOP, AWW_RATS, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND, BRIDGE_OUT, THE_LONG_WAY_HOME, NO_VACANCY, COLD_STORAGE, HIGH_WATER, ONE_MORE_ROUND, THE_ROAD_BELOW, SMOKE_ON_THE_HILL, THE_EMPTY_CRADLE, LAST_LIGHT_AT_MILLERS_CROSSING, THE_WEIGHT_OF_GOLD, HUSH_NOW, TAKING_ON_WATER, DOWN_TO_THE_LAST_MATCH, THE_MAN_IN_THE_DITCH, BURNING_LOFT, UNDER_THE_ICE, THE_BORROWED_HORSE, A_SEAT_BY_THE_FIRE, THE_SOUND_IN_THE_WELL, THE_BROKEN_WHEEL, THREE_MILES_TO_RAIN, THE_EMPTY_WAGON, THE_BELL_AFTER_MIDNIGHT, ONE_HORSE_SHORT, THE_MISSING_BOAT, AFTER_THE_STORM, THE_LAST_FERRY, THE_FALLEN_TREE, THE_LOOSE_TEAM, THE_WASHOUT];

const BY_ID = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getScenario(id: string): Scenario | undefined {
  return BY_ID.get(id);
}

export { AWW_RATS, BROKEN_BELL, LAST_STOP, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND, BRIDGE_OUT, THE_LONG_WAY_HOME, NO_VACANCY, COLD_STORAGE, HIGH_WATER, ONE_MORE_ROUND, THE_ROAD_BELOW, SMOKE_ON_THE_HILL, THE_EMPTY_CRADLE, LAST_LIGHT_AT_MILLERS_CROSSING, THE_WEIGHT_OF_GOLD, HUSH_NOW, DOWN_TO_THE_LAST_MATCH, THE_MAN_IN_THE_DITCH, TAKING_ON_WATER, BURNING_LOFT, UNDER_THE_ICE, THE_BORROWED_HORSE, A_SEAT_BY_THE_FIRE, THE_SOUND_IN_THE_WELL, THE_BROKEN_WHEEL, THREE_MILES_TO_RAIN, THE_EMPTY_WAGON, THE_BELL_AFTER_MIDNIGHT, ONE_HORSE_SHORT, THE_MISSING_BOAT, AFTER_THE_STORM, THE_LAST_FERRY, THE_FALLEN_TREE, THE_LOOSE_TEAM, THE_WASHOUT };
