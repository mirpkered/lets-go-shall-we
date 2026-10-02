import type { Choice, Scenario } from '../types';

const ENTRY_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'bridgewrightHammer', 'brassCandlestick', 'steelWedge'];
const GRATE_TOOLS = ['ratCatchersHook', 'pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'steelWedge'];
const BRACE_TOOLS = ['ratCatchersHook', 'drainageHook', 'pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'steelWedge'];
const LIGHT_GEAR = ['minerHeadlamp', 'roadmansLantern'];
const WORK_GEAR = ['heavyLeatherGloves', 'travelRope', 'ironRopeClamp', 'weatherproofCloak'];

function grateChoice(withTool: boolean): Choice {
  return {
    id: withTool ? 'freeGrateWithTool' : 'freeGrateByHand',
    label: withTool ? 'Work the grate with a carried tool' : 'Clear the grate by hand',
    hint: withTool ? 'A hook or lever can reach the corroded catch.' : 'The bars are heavy; forcing them may shift the muddy bank.',
    requirements: withTool ? { anyItems: GRATE_TOOLS } : { notItems: GRATE_TOOLS },
    timeCost: withTool ? 4 : 10,
    chance: {
      probability: withTool ? 0.86 : 0.58,
      bonusItems: withTool ? GRATE_TOOLS : undefined,
      bonusProbability: 0.08,
      successNext: 'lowCulvert',
      failureNext: 'grateJams',
      successMessage: 'The catch turns. The grate opens far enough for you to pass.',
      failureMessage: 'The grate moves, then jams as silt presses against the frame.',
      successEffects: { setFlags: ['alternateAccessOpened'], historyFlags: ['entered_collapsed_passage'] },
      failureEffects: { health: withTool ? -1 : -2, setFlags: ['grateJammed'] },
    },
  };
}

function braceChoice(withTool: boolean): Choice {
  return {
    id: withTool ? 'braceWithGear' : 'braceWithLooseTimber',
    label: withTool ? 'Clear the side drain with your tool' : 'Scoop silt from the side drain',
    hint: withTool ? 'A hook or narrow tool can draw packed silt away from the raised outlet.' : 'The outlet is reachable, but the rising flow makes the work slower.',
    requirements: withTool ? { anyItems: BRACE_TOOLS } : { notItems: BRACE_TOOLS },
    timeCost: withTool ? 5 : 9,
    chance: {
      probability: withTool ? 0.84 : 0.63,
      bonusItems: withTool ? BRACE_TOOLS : undefined,
      bonusProbability: withTool ? 0.08 : undefined,
      successNext: 'bracedWorker',
      failureNext: 'braceFailed',
      successMessage: 'The packed silt comes free. Water drains through the side outlet, lowering the current across Neri’s shelf.',
      failureMessage: 'The silt shifts, but the current surges back before the outlet clears. You retreat with scraped hands.',
      successEffects: { setFlags: ['drainCleared'] },
      failureEffects: { health: withTool ? -1 : -2, setFlags: ['chamberShifted'] },
    },
  };
}

function surveyChoice(withLamp: boolean): Choice {
  return {
    id: withLamp ? 'surveySideChannelWithLamp' : 'surveySideChannelByLantern',
    label: withLamp ? 'Use your headlamp to trace the side channel' : 'Trace the side channel by lantern light',
    hint: withLamp ? 'A focused beam finds the maintenance ring quickly.' : 'Your lantern works, but shadows make the narrow joints harder to read.',
    requirements: withLamp ? { anyItems: LIGHT_GEAR } : { notItems: LIGHT_GEAR },
    timeCost: withLamp ? 2 : 7,
    chance: {
      probability: withLamp ? 0.9 : 0.66,
      bonusItems: withLamp ? LIGHT_GEAR : undefined,
      bonusProbability: 0.06,
      successNext: 'channelSurvey',
      failureNext: 'timberShift',
      successMessage: 'The maintenance ring and side run are clear in the light.',
      failureMessage: 'A shadow hides a loose joint; stone shifts before you find the side run.',
      successEffects: { knowledge: ['The side channel runs toward a second outlet below the road.'] },
      failureEffects: { health: -1, setFlags: ['chamberShifted'] },
    },
  };
}

function rewardChoices(ending: string): Choice[] {
  return [
    { id: `acceptDrainageHook${ending}`, label: 'Accept the drainage hook', requirements: { notItems: ['drainageHook'] }, effects: { gainItems: ['drainageHook'] }, next: ending },
    { id: `acceptSteelWedge${ending}`, label: 'Accept the steel wedge', requirements: { notItems: ['steelWedge'] }, effects: { gainItems: ['steelWedge'] }, next: ending },
    { id: `acceptRoadmansLantern${ending}`, label: 'Accept the Roadman’s Lantern', requirements: { notItems: ['roadmansLantern'] }, effects: { gainItems: ['roadmansLantern'] }, next: ending },
    { id: `declineRoadReward${ending}`, label: 'Thank the crew and leave without gear', next: ending },
  ];
}

export const THE_ROAD_BELOW: Scenario = {
  id: 'the-road-below',
  title: 'The Road Below',
  subtitle: 'A broken road, a buried culvert, and a voice beneath the mud.',
  startScene: 'roadsideDiscovery',
  timePhases: [
    { id: 'unstable', label: 'Unstable', atMinutes: 0 },
    { id: 'shifting', label: 'Shifting', atMinutes: 10 },
    { id: 'dangerous', label: 'Dangerous', atMinutes: 22 },
    { id: 'critical', label: 'Critical', atMinutes: 34 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 48 },
  ],
  scenes: {
    roadsideDiscovery: {
      id: 'roadsideDiscovery', title: 'The Broken Shoulder', tone: 'warning',
      text: 'Heavy rain has cut half the road shoulder away. A dark opening shows beneath the cracked surface, edged with old stone and fresh mud. Pebbles still tick down the slope. A canvas work bag lies near the lip; you cannot see how far the opening goes or whether anyone is below.',
      textVariants: [{ requirements: { historyFlags: ['rescued_trapped_traveler'] }, text: 'The road shoulder has slumped into a dark opening beneath the cracked surface. You have pulled someone from a collapse before; still, the pebbles ticking down the slope warn that this one is moving.' }],
      choices: [
        { id: 'inspectFreshTracks', label: 'Examine the tracks and dropped bag', timeCost: 3, next: 'freshTracks', effects: { knowledge: ['A set of muddy bootprints leads from the work bag toward the collapsed opening.'] } },
        { id: 'callIntoOpening', label: 'Call down and listen', timeCost: 2, next: 'heardCall' },
        { id: 'markRoadForTravelers', label: 'Warn traffic away from the weak edge', timeCost: 3, next: 'markedRoad', effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users'] } },
        { id: 'leaveAtDiscovery', label: 'Keep to firm ground and move on', effects: { historyFlags: ['left_collapsed_road'] }, next: 'turnBackEnding' },
      ],
    },
    freshTracks: {
      id: 'freshTracks', title: 'Mud at the Lip', tone: 'warning',
      text: 'The work bag contains a folded level, a lunch tin, and a spare wick. Two sets of boot marks overlap in the mud, then one disappears at the opening. The newer prints are sharp-edged. The bag tells you someone was here recently, not where they went.',
      choices: [
        { id: 'followTracksToOpening', label: 'Look over the opening from firm ground', timeCost: 2, next: 'hazardAssessment', effects: { setFlags: ['tracksSeen'] } },
        { id: 'listenAfterTracks', label: 'Listen for a reply below', timeCost: 2, next: 'heardCall', effects: { setFlags: ['tracksSeen'] } },
        { id: 'markRoadAfterTracks', label: 'Mark the road before anyone approaches', timeCost: 3, next: 'markedRoad', effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users'] } },
        { id: 'leaveAfterTracks', label: 'Leave the unstable shoulder alone', effects: { historyFlags: ['left_collapsed_road'] }, next: 'turnBackEnding' },
      ],
    },
    heardCall: {
      id: 'heardCall', title: 'Two Knocks Below', tone: 'warning',
      text: 'After your call, two dull knocks answer from somewhere below. They could be a person or loose stone striking the old channel. The sound is real; its source and distance are not clear. More rain taps the road above.',
      choices: [
        { id: 'approachAfterKnocks', label: 'Study the opening and the road edge', timeCost: 2, next: 'hazardAssessment', effects: { setFlags: ['heardTapping'], knowledge: ['Two knocks answer from below the road; their source is uncertain.'] } },
        { id: 'markRoadAfterKnocks', label: 'Mark the road before investigating', timeCost: 3, next: 'markedRoad', effects: { setFlags: ['heardTapping', 'roadWarned'], historyFlags: ['protected_road_users'] } },
        { id: 'goForHelpAfterKnocks', label: 'Go for the nearby road crew', timeCost: 14, next: 'outsideHelp', effects: { setFlags: ['heardTapping'], historyFlags: ['left_for_outside_help'] } },
        { id: 'leaveAfterKnocks', label: 'Leave without entering', effects: { historyFlags: ['left_collapsed_road'] }, next: 'turnBackEnding' },
      ],
    },
    markedRoad: {
      id: 'markedRoad', title: 'A Warning on the Road', tone: 'warning',
      text: 'You stretch a bright strip of cloth across the approach and stack stones where a driver will see them. The road remains passable on its inland side, but a loaded cart should not cross the broken shoulder. With traffic warned, you can assess the opening without someone blundering onto it.',
      choices: [
        { id: 'assessAfterMarking', label: 'Inspect the exposed stonework', timeCost: 2, next: 'hazardAssessment', effects: { knowledge: ['The exposed stonework appears to be an old road-drain culvert.'] } },
        { id: 'callForCrewFromRoad', label: 'Go to the road crew for help', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'leaveAfterMarking', label: 'Leave the warning in place and move on', effects: { historyFlags: ['left_collapsed_road'] }, next: 'warningEnding' },
      ],
    },
    hazardAssessment: {
      id: 'hazardAssessment', title: 'The Edge Will Not Hold', tone: 'danger',
      text: 'The exposed stonework is an old storm-drain culvert buried beneath the road. The near bank is undercut; water threads through a crack above it. You can descend quickly, spend time bracing the lip, search downhill for the outlet, or leave for the road crew. None of those routes can tell you yet whether the knocks came from a person.',
      textVariants: [
        { requirements: { flags: ['roadWarned'] }, text: 'The exposed stonework is an old storm-drain culvert beneath the road. Your marker keeps travelers away from the weak edge. Water threads through a crack above it; you can descend, brace the lip first, search downhill for the outlet, or go for the road crew.' },
        { requirements: { minElapsedMinutes: 22 }, text: 'The old storm-drain culvert is visible beneath the road. The edge sheds dirt with each passing cart, and water is starting to run down the stone. A direct descent is still possible, but the bank is visibly worse than when you arrived.' },
      ],
      choices: [
        { id: 'chooseDirectDescent', label: 'Descend through the roadside opening', hint: 'Fastest route; the loose lip may move under your weight.', timeCost: 1, effects: { historyFlags: ['entered_collapsed_passage', 'risked_collapse_for_rescue'] }, next: 'directDescent' },
        { id: 'chooseBraceFirst', label: 'Stabilize the lip before entering', hint: 'This costs time, but may keep the opening from slumping.', timeCost: 1, next: 'braceLip' },
        { id: 'scoutLowerOutlet', label: 'Search downhill for the culvert outlet', hint: 'A longer walk may avoid the failed road shoulder.', timeCost: 2, next: 'outletApproach' },
        { id: 'seekOutsideHelp', label: 'Go for the nearby road crew', hint: 'Help takes time to fetch; the road will keep shifting meanwhile.', requirements: { notFlags: ['roadCrewSummoned'] }, timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
      ],
    },
    directDescent: {
      id: 'directDescent', title: 'Down the Loose Bank', tone: 'danger',
      text: 'The dirt is damp and the stones are only partly seated. A thin crack runs across the road directly above you. You can take a careful foothold or drop quickly before more rain arrives; either way, a slip could bruise you and further weaken the opening.',
      choices: [
        { id: 'carefulDirectDescent', label: 'Climb down one foothold at a time', timeCost: 3, chance: { probability: 0.67, bonusItems: ['travelRope', 'heavyLeatherGloves'], bonusProbability: 0.16, successNext: 'firstChamber', failureNext: 'entrySlip', successMessage: 'You find the stone ledges and reach the culvert floor.', failureMessage: 'The bank shears beneath your boot. You land hard as mud blocks part of the opening.', successEffects: { setFlags: ['directEntrySuccess'] }, failureEffects: { health: -2, setFlags: ['entranceCompromised'] } } },
        { id: 'dropBeforeItMoves', label: 'Drop to the channel floor quickly', hint: 'The fall is short, but loose stone is already moving.', timeCost: 1, chance: { probability: 0.52, bonusItems: ['travelRope'], bonusProbability: 0.12, successNext: 'firstChamber', failureNext: 'entrySlip', successMessage: 'You drop clear of the crumbling face and land on packed silt.', failureMessage: 'A stone rolls underfoot and you strike the wall on the way down.', successEffects: { setFlags: ['directEntrySuccess'] }, failureEffects: { health: -3, setFlags: ['entranceCompromised'] } } },
        { id: 'retreatFromDirectLip', label: 'Back away from the edge', effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    entrySlip: {
      id: 'entrySlip', title: 'The Lip Gives Way', tone: 'danger',
      text: 'The loose bank slumps behind you. You take a hard knock, but the fall is survivable; the warning signs were there in the cracking road and running mud. The direct opening is now choked with soil, and water is finding a faster way down.',
      choices: [
        { id: 'followWaterAfterSlip', label: 'Follow the channel away from the blocked entrance', timeCost: 3, next: 'mainChannel' },
        { id: 'checkFirstChamberAfterSlip', label: 'Get your bearings in the stone chamber', timeCost: 2, next: 'firstChamber' },
        { id: 'retreatThroughCrack', label: 'Climb out before the next shift', timeCost: 2, effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    braceLip: {
      id: 'braceLip', title: 'Hold the Road Edge', tone: 'warning',
      text: 'A split beam from the roadworks lies near the ditch. Bracing the lip may keep the road from shedding more soil, but setting it takes time beside the runoff. A passing cart makes the surface tremble overhead.',
      choices: [
        { id: 'braceLipWithGear', label: 'Set a brace with your carried tool', hint: 'A pry tool, wedge, hammer, or clamp gives a steadier seat.', requirements: { anyItems: ENTRY_TOOLS }, timeCost: 5, chance: { probability: 0.85, bonusItems: ENTRY_TOOLS, bonusProbability: 0.08, successNext: 'stabilizedEntry', failureNext: 'entrySlip', successMessage: 'Your tool seats the brace against solid stone; the lip stops shedding soil.', failureMessage: 'The prop skews as the road flexes. You pull clear before the edge slumps.', successEffects: { setFlags: ['roadBraced', 'stabilizedEntry'], historyFlags: ['stabilized_road_collapse'] }, failureEffects: { health: -1, setFlags: ['entranceCompromised'] } } },
        { id: 'braceLipByHand', label: 'Pack loose timber under the edge', hint: 'Possible without tools, but slower and less certain.', requirements: { notItems: ENTRY_TOOLS }, timeCost: 9, chance: { probability: 0.64, successNext: 'stabilizedEntry', failureNext: 'entrySlip', successMessage: 'The rough timber holds the lip long enough to make a careful descent.', failureMessage: 'The timber twists under the load and mud slides around your boots.', successEffects: { setFlags: ['roadBraced', 'stabilizedEntry'], historyFlags: ['stabilized_road_collapse'] }, failureEffects: { health: -1, setFlags: ['entranceCompromised'] } } },
        { id: 'leaveBraceUnfinished', label: 'Stop bracing and go for the outlet instead', timeCost: 2, next: 'outletApproach' },
      ],
    },
    stabilizedEntry: {
      id: 'stabilizedEntry', title: 'A Lip That Holds', tone: 'safe',
      text: 'The brace takes the worst of the road’s weight. It will not hold indefinitely, but the opening is no longer shedding soil at every vibration. Water still runs into the culvert; the safer entrance has cost several minutes.',
      choices: [
        { id: 'descendAfterBracing', label: 'Climb down into the first chamber', timeCost: 4, effects: { historyFlags: ['entered_collapsed_passage'] }, next: 'firstChamber' },
        { id: 'getHelpAfterBracing', label: 'Leave the brace and fetch the crew', timeCost: 14, effects: { historyFlags: ['left_for_outside_help'] }, next: 'outsideHelp' },
        { id: 'markAndWithdrawAfterBracing', label: 'Mark the road and leave the culvert', timeCost: 2, effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users', 'left_collapsed_road'] }, next: 'warningEnding' },
      ],
    },
    outletApproach: {
      id: 'outletApproach', title: 'The Downhill Mouth', tone: 'warning',
      text: 'Below the road, water leaves a muddy fan at a half-buried stone outlet. The iron grate is bent inward and furred with rust. The bank here is firmer than the collapse, though runoff has begun to pool around the lower bars.',
      textVariants: [{ requirements: { minElapsedMinutes: 22 }, text: 'The downhill outlet is firmer than the road collapse, but water is now pooling against the bent grate. The wet bank has begun to slump. A long delay here will make the crawl beyond it harder.' }],
      choices: [
        grateChoice(true),
        grateChoice(false),
        { id: 'followOuterDrain', label: 'Trace the channel around the bank', hint: 'A longer crawl may bypass the jammed grate.', timeCost: 9, next: 'lowCulvert', effects: { setFlags: ['alternateAccessOpened'], historyFlags: ['entered_collapsed_passage'] } },
        { id: 'leaveOutlet', label: 'Leave the outlet and seek the crew', timeCost: 2, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
      ],
    },
    grateJams: {
      id: 'grateJams', title: 'Silt Against the Bars', tone: 'danger',
      text: 'The grate shifts but does not open. Silt pushes against its lower edge, and your hands are scraped. The failed attempt has changed the access: a narrow drain seam is visible beside the frame, but the outlet is starting to fill.',
      choices: [
        { id: 'squeezeDrainSeam', label: 'Squeeze through the narrow side seam', hint: 'The gap is tight and water is rising around it.', timeCost: 4, chance: { probability: 0.68, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'lowCulvert', failureNext: 'lowCulvert', successMessage: 'You turn sideways and clear the stone lip.', failureMessage: 'The seam scrapes your shoulder, but you work through without forcing the grate.', successEffects: { setFlags: ['alternateAccessOpened'] }, failureEffects: { health: -1, setFlags: ['outletScraped'] } } },
        { id: 'traceSeamByHook', label: 'Use a hook or wedge to lift the side catch', requirements: { anyItems: ['ratCatchersHook', 'steelWedge', 'pocketToolkit'] }, timeCost: 3, next: 'lowCulvert', effects: { setFlags: ['alternateAccessOpened'] } },
        { id: 'backFromJammedGrate', label: 'Back away and go for outside help', timeCost: 2, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
      ],
    },
    lowCulvert: {
      id: 'lowCulvert', title: 'Under the Lower Road', tone: 'warning',
      text: 'The outlet opens into a low, stone-lined drain. It predates the road and carries rainwater toward the creek. You kneel in shallow flow. Above the waterline, a fresh mud smear marks the raised stone ledge and ends deeper in; the lower access avoided the loose bank, but it is wet and cramped.',
      textVariants: [{ requirements: { minElapsedMinutes: 22 }, text: 'The old drain is filling from the creekward end. Water is ankle-deep and pushes silt ahead of it. The mud smear remains on the raised ledge above the flow; returning is possible, but crossing the main channel later may not be.' }],
      choices: [
        { id: 'crawlFromOutletToMain', label: 'Follow the mud smear along the ledge', timeCost: 4, next: 'mainChannel', effects: { setFlags: ['foundAlternateRoute'] } },
        { id: 'guideLineFromOutlet', label: 'Secure a guide line before going farther', hint: 'A carried rope or clamp makes retreat easier if water rises.', requirements: { anyItems: ['travelRope', 'ironRopeClamp', 'compactBlockAndTackle'] }, timeCost: 3, next: 'mainChannel', effects: { setFlags: ['guideLineSecured'] } },
        { id: 'turnBackFromLowDrain', label: 'Return to the open air', effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    firstChamber: {
      id: 'firstChamber', title: 'The Old Drain', tone: 'warning',
      text: 'You reach a small stone chamber where the culvert narrows. It is ordinary road drainage, not a hidden hall: runoff has scoured the floor and an iron maintenance ring is set into one wall. A line of fresh mud marks heads deeper. The road above creaks under traffic.',
      textVariants: [
        { requirements: { anyItems: ['minerHeadlamp', 'lantern', 'roadmansLantern'] }, text: 'Your light catches the stone joints and the iron maintenance ring. This is an old road-drain culvert. Fresh mud marks lead deeper, and the road above creaks under traffic.' },
        { requirements: { minElapsedMinutes: 22 }, text: 'The chamber is an old road-drain culvert. Water now runs over the scoured floor, and dirt sifts from a joint overhead whenever a cart passes. Fresh mud marks continue deeper.' },
      ],
      choices: [
        { id: 'followFreshMarks', label: 'Follow the fresh marks toward the tapping', timeCost: 4, next: 'mainChannel', effects: { knowledge: ['This is an old stone storm-drain culvert beneath the road.'] } },
        surveyChoice(true),
        surveyChoice(false),
        { id: 'retreatFromFirstChamber', label: 'Climb back toward open air', timeCost: 2, effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    channelSurvey: {
      id: 'channelSurvey', title: 'A Second Way Through', tone: 'warning',
      text: 'The maintenance ring is fixed to a narrow side channel. It was built to let road workers clear silt from the culvert. A current of air moves through it, but the stone throat is tight and the water comes from the creekward end.',
      choices: [
        { id: 'takeSideChannel', label: 'Follow the side channel toward the airflow', hint: 'The route is narrow but avoids the loose chamber roof.', timeCost: 6, next: 'mainChannel', effects: { setFlags: ['foundSideChannel'] } },
        { id: 'pullSideGrateWithHook', label: 'Reach the inner catch with your hook', requirements: { anyItems: ['ratCatchersHook', 'drainageHook'] }, timeCost: 3, next: 'mainChannel', effects: { setFlags: ['foundSideChannel'] } },
        { id: 'leaveSurvey', label: 'Return to the entrance and stop', effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    mainChannel: {
      id: 'mainChannel', title: 'Water in the Main Run', tone: 'warning',
      text: 'The main channel bends beneath the road. A fresh mud smear continues along the raised ledge, and two knocks answer from farther in. Water trickles along the wall. The stone arch is intact for now, though fine dirt falls when a cart crosses above.',
      textVariants: [
        { requirements: { minElapsedMinutes: 22 }, text: 'The main channel is taking on water. The arch sheds grit with every cart overhead, and a side run remains open where the wall has cracked. The tapping is farther in; the direct arch is becoming harder to reach.' },
        { requirements: { minElapsedMinutes: 34 }, text: 'Water now pushes through the main run and the stone arch flexes under traffic. A narrow side channel remains passable, but the direct route toward the tapping is partly blocked. The road above may not hold another loaded cart.' },
        { requirements: { flags: ['guideLineSecured'] }, text: 'Your guide line trails back toward the lower outlet. The main channel bends ahead; the mud smear follows the raised ledge, and two knocks answer from beyond the arch.' },
      ],
      choices: [
        { id: 'followArchEarly', label: 'Follow the tapping through the stone arch', hint: 'The arch is passable now; dirt is already falling from it.', requirements: { maxElapsedMinutes: 21 }, timeCost: 3, effects: { setFlags: ['risked_collapse_for_rescue'] }, next: 'trappedWorker' },
        { id: 'useSideRunLate', label: 'Take the narrow side run around the arch', hint: 'Longer route, less exposure to the failing roof.', requirements: { minElapsedMinutes: 22 }, timeCost: 7, effects: { setFlags: ['foundSideChannel'] }, next: 'trappedWorker' },
        { id: 'shoreMainArch', label: 'Prop the rattling arch before moving', requirements: { anyItems: BRACE_TOOLS }, timeCost: 6, chance: { probability: 0.82, bonusItems: BRACE_TOOLS, bonusProbability: 0.08, successNext: 'trappedWorker', failureNext: 'timberShift', successMessage: 'The prop takes the pressure and the tapping grows clearer.', failureMessage: 'The stone shifts as the prop turns; you retreat from falling grit.', successEffects: { setFlags: ['archPropped'] }, failureEffects: { health: -1, setFlags: ['chamberShifted'] } } },
        { id: 'retreatFromMainChannel', label: 'Turn back before the channel floods', timeCost: 1, effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    timberShift: {
      id: 'timberShift', title: 'The Arch Shifts', tone: 'danger',
      text: 'A support stone rolls and clips your shoulder. The channel remains open, but the main arch is no longer safe to cross directly. The side run is still visible; water has climbed another few inches.',
      choices: [
        { id: 'takeSideRunAfterShift', label: 'Use the narrow side run', timeCost: 4, next: 'trappedWorker', effects: { setFlags: ['foundSideChannel'] } },
        { id: 'callCrewFromShift', label: 'Retreat and bring the road crew', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'retreatAfterShift', label: 'Get clear of the culvert', effects: { historyFlags: ['left_collapsed_road'] }, next: 'personLeftEnding' },
      ],
    },
    trappedWorker: {
      id: 'trappedWorker', title: 'Neri on the High Shelf', tone: 'danger',
      text: 'Beyond the arch, a road surveyor named Neri stands on a raised stone shelf. A fallen beam blocks the low passage between you; it has not fallen on him. His ankle is hurt, and the creek-fed current below the shelf is already too strong to cross safely. Water is rising toward his feet. A narrow side drain may lower it, but the road above still carries traffic.',
      textVariants: [
        { requirements: { historyFlags: ['rescued_trapped_traveler'] }, text: 'Neri stands on the raised shelf beyond the fallen beam. You have helped someone through a collapse before; here the immediate danger is water closing the gap between you, not a weight on Neri. His ankle is hurt, and the road above keeps shaking loose grit.' },
        { requirements: { minElapsedMinutes: 34 }, text: 'Water now covers the lower shelf stones and is rising around Neri’s boots. The beam still blocks the low passage, but it has not struck him. He asks you not to cross the current blindly. The side drain, a guided crossing, or the road crew remain possible.' },
      ],
      choices: [
        { id: 'pullNeriFreeNow', label: 'Guide Neri across the flooded gap', hint: 'The current is swift and the shelf is slick; a fall could injure you both.', timeCost: 5, chance: { probability: 0.48, bonusItems: WORK_GEAR, bonusProbability: 0.2, successNext: 'rescuedNeri', failureNext: 'rescueFailure', successMessage: 'You find a steady foothold and guide Neri across to your side.', failureMessage: 'The current sweeps you back against the wall. You are bruised, and Neri remains on the shelf.', successEffects: { setFlags: ['personFreed'], historyFlags: ['rescued_trapped_traveler', 'risked_collapse_for_rescue'] }, failureEffects: { health: -3, setFlags: ['chamberShifted', 'rescueAttemptFailed'] } } },
        { id: 'braceBeforeFreeing', label: 'Find a way to lower the water first', hint: 'Neri points out a side drain partly packed with silt.', timeCost: 2, next: 'bracePlan' },
        { id: 'leaveToGetCrew', label: 'Leave Neri and fetch the road crew', hint: 'They can close the road and bring a supported line; water will keep rising.', timeCost: 16, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'retreatFromNeri', label: 'Retreat and mark the road as closed', effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users', 'abandoned_trapped_person'] }, next: 'personLeftEnding' },
      ],
    },
    bracePlan: {
      id: 'bracePlan', title: 'The Side Drain', tone: 'warning',
      text: 'From your side of the fallen beam, Neri points to a low outlet beside the arch. It should carry water away from the shelf, but its mouth is packed with silt. Clearing it will take time in the current; if it fails, the water may rise before the crew can return.',
      choices: [braceChoice(true), braceChoice(false), { id: 'stopBracingAndPull', label: 'Try the flooded crossing now', hint: 'The current has not eased; a slip could injure you.', timeCost: 1, next: 'rescueFailure', effects: { health: -1, setFlags: ['chamberShifted'] } }],
    },
    braceFailed: {
      id: 'braceFailed', title: 'The Current Pushes Back', tone: 'danger',
      text: 'The silt shifts but the drain mouth remains blocked. The current shoves you against the stone and scrapes your shoulder. Neri is still on the shelf; the water has risen another few inches. You can try a different approach or fetch the road crew.',
      choices: [
        { id: 'tryLiftAfterBraceFailure', label: 'Try to clear the outlet from the ledge', timeCost: 3, chance: { probability: 0.42, bonusItems: ['ratCatchersHook', 'drainageHook'], bonusProbability: 0.18, successNext: 'bracedWorker', failureNext: 'rescueFailure', successMessage: 'You work the packed silt loose and water begins to drain.', failureMessage: 'The runoff surges and forces you back from the outlet.', successEffects: { setFlags: ['drainCleared'] }, failureEffects: { health: -2, setFlags: ['chamberShifted'] } } },
        { id: 'getCrewAfterFailedBrace', label: 'Withdraw and bring the road crew', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'leaveAfterFailedBrace', label: 'Retreat to firm ground', effects: { historyFlags: ['abandoned_trapped_person'] }, next: 'personLeftEnding' },
      ],
    },
    bracedWorker: {
      id: 'bracedWorker', title: 'Water Falling', tone: 'warning',
      text: 'The side drain is open and the water level has dropped below the shelf edge. Neri can now step across, but his ankle is weak and the stones are slick. A rope makes a useful handline; without one, you can guide him slowly from the ledge.',
      textVariants: [{ requirements: { flags: ['foundSideChannel'] }, text: 'From the side channel, you cleared the silted outlet. Water drains away from the shelf, leaving Neri a narrow route across; his ankle is weak, and the stones remain slick.' }],
      choices: [
        { id: 'extractWithRope', label: 'Set a rope handline across the gap', hint: 'A line gives Neri a steady guide over the slick stones.', requirements: { anyItems: ['travelRope', 'compactBlockAndTackle'] }, timeCost: 4, chance: { probability: 0.88, bonusItems: ['ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.08, successNext: 'rescuedNeri', failureNext: 'rescueFailure', successMessage: 'The handline holds and Neri crosses one careful step at a time.', failureMessage: 'The line slips against wet stone. You both retreat before the current catches you.', successEffects: { setFlags: ['personFreed'], historyFlags: ['rescued_trapped_traveler'] }, failureEffects: { health: -1, setFlags: ['chamberShifted'] } } },
        { id: 'liftTogetherAfterBrace', label: 'Guide Neri across one step at a time', hint: 'No special gear needed; the lower water makes the crossing possible.', timeCost: 6, chance: { probability: 0.74, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'rescuedNeri', failureNext: 'rescueFailure', successMessage: 'You steady Neri as he crosses the slick stones.', failureMessage: 'His injured ankle slips. You both retreat before the current catches you.', successEffects: { setFlags: ['personFreed'], historyFlags: ['rescued_trapped_traveler'] }, failureEffects: { health: -2, setFlags: ['chamberShifted'] } } },
        { id: 'waitForCrewAtBrace', label: 'Keep the brace and wait for help', timeCost: 8, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'leaveNeriBraced', label: 'Withdraw while the support still holds', effects: { historyFlags: ['abandoned_trapped_person'] }, next: 'personLeftEnding' },
      ],
    },
    rescueFailure: {
      id: 'rescueFailure', title: 'Driven Back by Water', tone: 'danger',
      text: 'The current drives you back against the wall. Neri is still on the shelf, but the water now covers the lowest stones and the first route is no longer safe. The side drain or the road crew offer different ways forward; repeating the same crossing would be a poor choice.',
      choices: [
        { id: 'repositionAfterFailedLift', label: 'Move to a safer angle for one more attempt', timeCost: 4, next: 'sideAngleAttempt', effects: { setFlags: ['foundSideChannel'] } },
        { id: 'goForCrewAfterFailure', label: 'Retreat and fetch the road crew', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'retreatAfterRescueFailure', label: 'Get out before the water rises further', effects: { historyFlags: ['abandoned_trapped_person'] }, next: 'personLeftEnding' },
      ],
    },
    sideAngleAttempt: {
      id: 'sideAngleAttempt', title: 'The Upper Ledge', tone: 'danger',
      text: 'You reach a narrow upper ledge that passes around the fallen beam. From here you can lower a line to Neri’s shelf, but the wet stone shifts beneath your feet and water is nearly level with his boots.',
      choices: [
        { id: 'pullFromSideWithLine', label: 'Lower a rope handline to Neri', requirements: { anyItems: ['travelRope', 'compactBlockAndTackle'] }, timeCost: 3, chance: { probability: 0.72, bonusItems: ['ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'rescuedNeri', failureNext: 'finalRescueFailure', successMessage: 'Neri grips the line and reaches the upper ledge.', failureMessage: 'The line slips in the runoff. You secure yourself before trying again.', successEffects: { setFlags: ['personFreed'], historyFlags: ['rescued_trapped_traveler'] }, failureEffects: { health: -2, setFlags: ['chamberShifted'] } } },
        { id: 'pullFromSideByHand', label: 'Reach down and steady Neri', requirements: { notItems: ['travelRope', 'compactBlockAndTackle'] }, timeCost: 5, chance: { probability: 0.52, bonusItems: ['heavyLeatherGloves', 'steelWedge'], bonusProbability: 0.14, successNext: 'rescuedNeri', failureNext: 'finalRescueFailure', successMessage: 'You steady Neri as he climbs to the upper ledge.', failureMessage: 'Your grip slips on the wet stone and you both back away.', successEffects: { setFlags: ['personFreed'], historyFlags: ['rescued_trapped_traveler', 'risked_collapse_for_rescue'] }, failureEffects: { health: -2, setFlags: ['chamberShifted'] } } },
        { id: 'callCrewFromSideAttempt', label: 'Give up the pull and fetch the crew', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
      ],
    },
    finalRescueFailure: {
      id: 'finalRescueFailure', title: 'No Safe Grip Remains', tone: 'danger',
      text: 'The second approach fails, and water now covers Neri’s shelf. He is conscious, but you can no longer reach him safely from here. You can still lead the road crew back with a supported line; any more unassisted crossing risks being swept into the deeper channel.',
      choices: [
        { id: 'getCrewAfterLastFailure', label: 'Get the crew and winch', timeCost: 14, next: 'outsideHelp', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'withdrawAfterLastFailure', label: 'Leave the culvert and mark the road', effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users', 'abandoned_trapped_person'] }, next: 'personLeftEnding' },
      ],
    },
    rescuedNeri: {
      id: 'rescuedNeri', title: 'Back on Firm Stone', tone: 'warning',
      text: 'Neri has crossed to your side and can put weight on his leg, though he needs your shoulder. The route back is still open. Above, the road edge remains cracked and the cloth warning is visible only if you placed it. You can secure the road before leaving or get Neri to safety now.',
      textVariants: [{ requirements: { flags: ['roadBraced', 'roadWarned'] }, text: 'Neri has reached your side and leans on your shoulder. Your brace still holds the lip and the road warning is visible above. The crew can secure the site when you reach them; for now, the route out remains passable.' }],
      choices: [
        { id: 'secureRoadWithGear', label: 'Secure the edge with your tool or rope', hint: 'A wedge, tool, clamp, or line can hold the warning barrier in place.', requirements: { anyItems: [...ENTRY_TOOLS, 'travelRope', 'ironRopeClamp'] }, timeCost: 7, next: 'cleanRescueRewards', effects: { setFlags: ['roadSecured', 'roadWarned'], historyFlags: ['stabilized_road_collapse', 'protected_road_users'] } },
        { id: 'markRoadAfterRescue', label: 'Mark the road and guide Neri to cover', timeCost: 9, next: 'costlyRescueRewards', effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users'] } },
        { id: 'leaveWithNeriNow', label: 'Get Neri to safety without securing the road', timeCost: 3, next: 'costlyRescueRewards' },
      ],
    },
    outsideHelp: {
      id: 'outsideHelp', title: 'At the Road Crew Camp', tone: 'warning',
      text: 'A road crew is working near the next mile marker with a hand winch and spare props. You explain the collapsed culvert and the signs below. The foreman agrees to come, but warns that carrying gear back will take time. You can pay the cart driver to bring the winch ahead of the crew.',
      textVariants: [{ requirements: { minElapsedMinutes: 34 }, text: 'The crew reaches the road after a long walk. The foreman sees how far the shoulder has fallen and sends the cart for the winch; runoff is already pouring from the culvert. If anyone is below, the rescue must be careful.' }],
      choices: [
        { id: 'bringCrewToRoad', label: 'Lead the crew back to the collapse', timeCost: 12, effects: { setFlags: ['roadCrewSummoned'], historyFlags: ['called_road_crew'] }, next: 'crewArrival' },
        { id: 'payCartForWinch', label: 'Pay 2 coins to bring the winch ahead', hint: 'The faster cart may save time, but spends your carried money.', requirements: { minMoney: 2 }, timeCost: 5, effects: { money: -2, setFlags: ['roadCrewSummoned', 'winchReady'], historyFlags: ['called_road_crew'] }, next: 'crewArrival' },
        { id: 'warnRoadCrewOnly', label: 'Ask them to close the road and search later', timeCost: 5, effects: { setFlags: ['roadWarned'], historyFlags: ['protected_road_users'] }, next: 'warningEnding' },
      ],
    },
    crewArrival: {
      id: 'crewArrival', title: 'Winch at the Opening', tone: 'warning',
      text: 'The crew closes the road and lowers a supported line to the raised shelf through the stable side access. Neri answers from below. The winch gives him a handhold and helps the crew bring him up the wet slope into open air; no one tries to shift the fallen beam.',
      textVariants: [
        { requirements: { flags: ['winchReady'] }, text: 'The cart brings the hand winch ahead of the crew. With traffic stopped, they lower a supported line through the stable access and bring Neri up without asking you to enter the failing culvert.' },
        { requirements: { minElapsedMinutes: 48 }, text: 'The crew closes the road and lowers a supported line. Water has partly filled the drain, but Neri answers from the raised shelf and the winch helps him climb out slowly.' },
      ],
      choices: [
        { id: 'helpCrewSecureRoad', label: 'Help brace the road after the rescue', timeCost: 7, next: 'cleanRescueRewards', effects: { setFlags: ['roadSecured', 'roadWarned'], historyFlags: ['rescued_trapped_traveler', 'stabilized_road_collapse', 'protected_road_users'] } },
        { id: 'leaveAfterCrewRescue', label: 'Leave once Neri is in the crew’s care', next: 'costlyRescueRewards', effects: { historyFlags: ['rescued_trapped_traveler'] } },
      ],
    },
    cleanRescueRewards: {
      id: 'cleanRescueRewards', title: 'A Road Held for Morning',
      text: 'Neri is safe, the road is marked, and the crew has shored the weak shoulder until permanent repairs can begin. The foreman offers two useful pieces of spare road gear; carry only one into the next adventure.',
      choices: rewardChoices('cleanRescueEnding'),
    },
    costlyRescueRewards: {
      id: 'costlyRescueRewards', title: 'Out Before the Next Shift', tone: 'warning',
      text: 'Neri is safe, but the road edge slumps before the crew can brace it. The route is closed until repairs arrive. The foreman offers a practical tool for the help you gave; choose one item to carry forward.',
      choices: rewardChoices('costlyRescueEnding'),
    },
    cleanRescueEnding: {
      id: 'cleanRescueEnding', title: 'The Road Holds', ending: 'success',
      text: 'Neri rests beside the road crew, and the braced shoulder is marked for repair. The old culvert did its job for generations; the newer road simply outlasted its maintenance.' ,
      choices: [],
    },
    costlyRescueEnding: {
      id: 'costlyRescueEnding', title: 'A Road Closed Until Morning', ending: 'success',
      text: 'Neri is rescued, but the shoulder has collapsed across the road. No one can cross until the crew rebuilds it. Your rescue succeeded; the road did not stay open.',
      choices: [],
    },
    personLeftEnding: {
      id: 'personLeftEnding', title: 'The Passage Goes Quiet', ending: 'success',
      text: 'You retreat to firm ground and leave the culvert to the road crew. The opening is marked as dangerous, but you do not know whether Neri was found. Leaving kept you from taking a risk you could not accept.',
      choices: [],
    },
    warningEnding: {
      id: 'warningEnding', title: 'The Road Is Closed', ending: 'success',
      text: 'The warning keeps traffic away from the broken shoulder. The crew will inspect the culvert before reopening the road. You do not enter, and you do not know whether anyone was below; the immediate danger to travelers is contained.',
      choices: [],
    },
    turnBackEnding: {
      id: 'turnBackEnding', title: 'Firm Ground', ending: 'success',
      text: 'You take the sound side of the road and leave the opening behind. Rain keeps falling, but the cracked shoulder is out of your path. You do not know what lies under the road.',
      completionQualification: 'nonSubstantive',
      choices: [],
    },
  },
};
