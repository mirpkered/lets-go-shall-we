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
import { POISON_THE_WELL } from './poisonTheWell';
import { FINDERS_KEEPERS } from './findersKeepers';
import { ONLY_ONE_BULLET } from './onlyOneBullet';
import { THE_BLUE_HOLE } from './theBlueHole';
import { SILENT_NIGHT } from './silentNight';
import { BEAR_WITH_ME } from './bearWithMe';
import { GIVE_ME_WHATCHA_GOT } from './giveMeWhatchaGot';
import { HONEST_WORK_ADVENTURES } from './honestWorkBatch';
import { COMMERCE_ADVENTURES } from './commerceBatch';
import { COMMUNITY_ADVENTURES } from './communityBatch';
import { WILDERNESS_ADVENTURES } from './wildernessBatch';
import { ANIMAL_ADVENTURES } from './animalsBatch';
import { PLEASANT_DAY_ADVENTURES } from './pleasantDaysBatch';
import { DISPUTE_ADVENTURES } from './disputesBatch';
import { STRANGE_ROADS_ADVENTURES } from './strangeRoadsBatch';
import { MEDICAL_CARE_ADVENTURES } from './medicalBatch';
import { COMMUNICATION_ADVENTURES } from './communicationBatch';
import { LEGAL_PROCESS_ADVENTURES } from './legalProcessBatch';
import { DOMESTIC_ADVENTURES } from './domesticBatch';
import { RELIGION_CUSTOM_ADVENTURES } from './religionCustomBatch';
import { SPECIALIZED_TRADE_ADVENTURES } from './specializedTradesBatch';
import { RIVER_COMMERCE_ADVENTURES } from './riverCommerceBatch';
import { SEASONAL_LIFE_ADVENTURES } from './seasonalLifeBatch';
import { ENTERTAINMENT_ADVENTURES } from './entertainmentBatch';
import { MISTAKEN_IDENTITY_ADVENTURES } from './mistakenIdentityBatch';
import { QUESTIONABLE_EMPLOYMENT_ADVENTURES } from './questionableEmploymentBatch';
import { SMALL_HUMAN_MOMENT_ADVENTURES } from './smallHumanMomentsBatch';

export const SCENARIOS: Scenario[] = [
  BROKEN_BELL, LAST_STOP, AWW_RATS, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND, BRIDGE_OUT, THE_LONG_WAY_HOME,
  NO_VACANCY, COLD_STORAGE, HIGH_WATER, ONE_MORE_ROUND, THE_ROAD_BELOW, SMOKE_ON_THE_HILL,
  THE_EMPTY_CRADLE, LAST_LIGHT_AT_MILLERS_CROSSING, THE_WEIGHT_OF_GOLD, HUSH_NOW, TAKING_ON_WATER,
  DOWN_TO_THE_LAST_MATCH, THE_MAN_IN_THE_DITCH, BURNING_LOFT, UNDER_THE_ICE, THE_BORROWED_HORSE,
  A_SEAT_BY_THE_FIRE, THE_SOUND_IN_THE_WELL, THE_BROKEN_WHEEL, THREE_MILES_TO_RAIN, THE_EMPTY_WAGON,
  THE_BELL_AFTER_MIDNIGHT, ONE_HORSE_SHORT, THE_MISSING_BOAT, AFTER_THE_STORM, THE_LAST_FERRY,
  THE_FALLEN_TREE, THE_LOOSE_TEAM, THE_WASHOUT, POISON_THE_WELL, FINDERS_KEEPERS, ONLY_ONE_BULLET,
  THE_BLUE_HOLE, SILENT_NIGHT, BEAR_WITH_ME, GIVE_ME_WHATCHA_GOT,
  ...HONEST_WORK_ADVENTURES, ...COMMERCE_ADVENTURES, ...COMMUNITY_ADVENTURES, ...WILDERNESS_ADVENTURES,
  ...ANIMAL_ADVENTURES, ...PLEASANT_DAY_ADVENTURES, ...DISPUTE_ADVENTURES, ...STRANGE_ROADS_ADVENTURES,
  ...MEDICAL_CARE_ADVENTURES, ...COMMUNICATION_ADVENTURES, ...LEGAL_PROCESS_ADVENTURES, ...DOMESTIC_ADVENTURES,
  ...RELIGION_CUSTOM_ADVENTURES, ...SPECIALIZED_TRADE_ADVENTURES, ...RIVER_COMMERCE_ADVENTURES,
  ...SEASONAL_LIFE_ADVENTURES, ...ENTERTAINMENT_ADVENTURES, ...MISTAKEN_IDENTITY_ADVENTURES,
  ...QUESTIONABLE_EMPLOYMENT_ADVENTURES, ...SMALL_HUMAN_MOMENT_ADVENTURES,
];

const BY_ID = new Map(SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getScenario(id: string): Scenario | undefined {
  return BY_ID.get(id);
}

export { AWW_RATS, BROKEN_BELL, LAST_STOP, WHATS_MINE, THE_LAST_ROOM, DEAD_MANS_HAND, BRIDGE_OUT, THE_LONG_WAY_HOME, NO_VACANCY, COLD_STORAGE, HIGH_WATER, ONE_MORE_ROUND, THE_ROAD_BELOW, SMOKE_ON_THE_HILL, THE_EMPTY_CRADLE, LAST_LIGHT_AT_MILLERS_CROSSING, THE_WEIGHT_OF_GOLD, HUSH_NOW, DOWN_TO_THE_LAST_MATCH, THE_MAN_IN_THE_DITCH, TAKING_ON_WATER, BURNING_LOFT, UNDER_THE_ICE, THE_BORROWED_HORSE, A_SEAT_BY_THE_FIRE, THE_SOUND_IN_THE_WELL, THE_BROKEN_WHEEL, THREE_MILES_TO_RAIN, THE_EMPTY_WAGON, THE_BELL_AFTER_MIDNIGHT, ONE_HORSE_SHORT, THE_MISSING_BOAT, AFTER_THE_STORM, THE_LAST_FERRY, THE_FALLEN_TREE, THE_LOOSE_TEAM, THE_WASHOUT, POISON_THE_WELL, FINDERS_KEEPERS, ONLY_ONE_BULLET, THE_BLUE_HOLE, SILENT_NIGHT, BEAR_WITH_ME, GIVE_ME_WHATCHA_GOT, HONEST_WORK_ADVENTURES, COMMERCE_ADVENTURES, COMMUNITY_ADVENTURES, WILDERNESS_ADVENTURES, ANIMAL_ADVENTURES, PLEASANT_DAY_ADVENTURES, DISPUTE_ADVENTURES, STRANGE_ROADS_ADVENTURES };
