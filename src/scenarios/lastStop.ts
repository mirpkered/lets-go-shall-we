import type { Scenario } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

export const LAST_STOP: Scenario = {
  id: 'last-stop',
  title: 'All Aboard!',
  subtitle: 'One train. No brakes. A bridge that is no longer there.',
  startScene: 'stationPlatform',
  timePhases: [
    { id: 'evening', label: 'Evening Journey', atMinutes: 0 },
    { id: 'descent', label: 'The Descent', atMinutes: 15 },
    { id: 'approaching', label: 'Blackstone Ahead', atMinutes: 30 },
    { id: 'critical', label: 'The Bridge Is Near', atMinutes: 45 },
  ],
  scenes: {
    stationPlatform: {
      id: 'stationPlatform', title: 'All Aboard', easterEggContext: 'depot',
      text: 'The evening local waits beneath a haze of steam: locomotive, service car, and three green passenger coaches. Porters call destinations. A timetable promises a quiet arrival at Bellweather before midnight.',
      choices: [
        { id: 'helpPorter', label: 'Help the porter', hint: 'A few trunks remain on the platform.', timeCost: 5, effects: { money: 4, setFlags: ['earnedTip'] }, next: 'platformAfterHelp' },
        { id: 'studyRoute', label: 'Study the route board', hint: 'The map shows grades and sidings.', timeCost: 4, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding], setFlags: ['studiedRoute'] }, next: 'platformAfterStudy' },
        { id: 'visitKiosk', label: 'Visit the platform kiosk', timeCost: 3, next: 'stationKiosk' },
        { id: 'board', label: 'Board the train', timeCost: 1, next: 'passengerCar' },
      ],
    },
    platformAfterHelp: {
      id: 'platformAfterHelp', title: 'A Few Coins for the Journey',
      text: 'The porter presses four coins into your palm. The platform kiosk has modest travel goods; the train waits beneath its veil of steam.',
      choices: [
        { id: 'kioskAfterHelp', label: 'Visit the platform kiosk', next: 'stationKiosk' },
        { id: 'boardAfterHelp', label: 'Board the train', next: 'passengerCar' },
      ],
    },
    platformAfterStudy: {
      id: 'platformAfterStudy', title: 'The Mountain Route',
      text: 'The timetable looks ordinary, but the line descends sharply after Milepost 47. A maintenance siding climbs away before Blackstone Bridge.',
      choices: [
        { id: 'kioskAfterStudy', label: 'Visit the platform kiosk', next: 'stationKiosk' },
        { id: 'boardAfterStudy', label: 'Board the train', next: 'passengerCar' },
      ],
    },
    stationKiosk: {
      id: 'stationKiosk', title: 'Last-Minute Provisions',
      text: 'The kiosk keeper has practical odds and ends among the sweets: a compact toolkit, a hooked travel rope, and a folded railway map. None looks especially heroic.',
      choices: [
        { id: 'buyTools', label: 'Toolkit — 4 coins', timeCost: 2, requirements: { minMoney: 4, notOwnedItems: ['pocketToolkit'] }, effects: { money: -4, gainItems: ['pocketToolkit'] }, next: 'kioskPurchase' },
        { id: 'buyRope', label: 'Travel rope — 3 coins', timeCost: 2, requirements: { minMoney: 3, notOwnedItems: ['travelRope'] }, effects: { money: -3, gainItems: ['travelRope'] }, next: 'kioskPurchase' },
        { id: 'buyMap', label: 'Railway map — 2 coins', timeCost: 2, requirements: { minMoney: 2, notOwnedItems: ['railwayMap'] }, effects: { money: -2, gainItems: ['railwayMap'], knowledgeEntries: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding] }, next: 'kioskPurchase' },
        { id: 'board', label: 'Board the train', timeCost: 1, next: 'passengerCar' },
      ],
    },
    kioskPurchase: {
      id: 'kioskPurchase', title: 'Ready for the Journey',
      text: 'Your purchase is packed away. The porter calls the final boarding warning as steam rolls across the platform.',
      choices: [{ id: 'boardAfterPurchase', label: 'Board the train', next: 'passengerCar' }],
    },
    passengerCar: {
      id: 'passengerCar', title: 'The Evening Local',
      text: 'Lamplight rocks across velvet seats as the train gathers an easy rhythm. A surveyor reads in the corner. Forward lies the service car; behind, the conductor checks tickets. Rain begins to bead on the glass.',
      choices: [
        { id: 'conductor', label: 'Speak with the conductor', timeCost: 4, next: 'conductorCar' },
        { id: 'service', label: 'Explore the service car', timeCost: 5, next: 'serviceCar' },
        { id: 'surveyor', label: 'Talk to the surveyor', timeCost: 5, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding], setFlags: ['talkedSurveyor'] }, next: 'surveyorAfterTalk' },
        { id: 'settle', label: 'Watch the countryside', hint: 'Let the journey carry you awhile.', timeCost: 18, next: 'quietJourney' },
      ],
    },
    surveyorAfterTalk: {
      id: 'surveyorAfterTalk', title: 'A Note About Milepost 47',
      text: 'The surveyor folds the map. “The siding is steep, but it was built to hold maintenance wagons. If we reach it slowly, it may save the coaches.”',
      choices: [
        { id: 'conductorAfterSurvey', label: 'Speak with the conductor', next: 'conductorCar' },
        { id: 'serviceAfterSurvey', label: 'Explore the service car', next: 'serviceCar' },
        { id: 'quietAfterSurvey', label: 'Settle in for the journey', next: 'quietJourney' },
      ],
    },
    conductorCar: {
      id: 'conductorCar', title: 'The Conductor’s Alcove',
      text: 'Conductor Vale points out the red emergency cabinet. “Handwheel vents the brake line: turn, hold, lock. Never wrench it loose all at once.” A square iron key hangs beside his timetable; the locked maintenance case is in the service car.',
      choices: [
        { id: 'learn', label: 'Remember the procedure', timeCost: 3, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.baggageBrakeHandwheel], setFlags: ['learnedBrake'] }, next: 'conductorExplains' },
        { id: 'inspectKey', label: 'Ask Vale for the cabinet key', timeCost: 2, effects: { gainItems: ['brakeKey'] }, next: 'conductorKeyHandoff' },
        { id: 'service', label: 'Visit the service car', next: 'serviceCar' },
        { id: 'seat', label: 'Return to your seat', next: 'quietJourney' },
      ],
    },
    conductorExplains: {
      id: 'conductorExplains', title: 'The Conductor’s Instructions',
      text: 'Vale explains the handwheel procedure. The cabinet key remains on its hook beside the timetable if you need it; the baggage diagram is in the next car.',
      choices: [
        { id: 'serviceAfterTalk', label: 'Explore the service car', next: 'serviceCar' },
        { id: 'seatAfterTalk', label: 'Settle in for the journey', next: 'quietJourney' },
      ],
    },
    conductorKeyHandoff: {
      id: 'conductorKeyHandoff', title: 'The Cabinet Key',
      text: 'Vale unhooks the square iron key and places it in your palm. “The maintenance case is in the baggage car. There’s a compact railway toolkit inside.”',
      choices: [
        { id: 'serviceWithKey', label: 'Open the maintenance case', next: 'serviceCar' },
        { id: 'seatWithKey', label: 'Keep the key and return to your seat', next: 'quietJourney' },
      ],
    },
    serviceCar: {
      id: 'serviceCar', title: 'Baggage and Brass',
      text: 'Crates are strapped beneath a wall-mounted brake handwheel. A faded diagram shows the pipe running beneath every coach. Leather work gloves rest beside a locked maintenance case; through its slats you can make out a compact toolkit.',
      choices: [
        { id: 'studyBrake', label: 'Study the brake diagram', timeCost: 6, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.baggageBrakeHandwheel], setFlags: ['learnedBrake'] }, next: 'serviceDiscovery' },
        { id: 'takeGloves', label: 'Take the work gloves', timeCost: 1, effects: { gainItems: ['workGloves'] }, next: 'serviceDiscovery' },
        { id: 'openCase', label: 'Open the maintenance case', timeCost: 4, requirements: { items: ['brakeKey'], notItems: ['pocketToolkit'] }, effects: { gainItems: ['pocketToolkit'] }, next: 'serviceDiscovery' },
        { id: 'seats', label: 'Leave the baggage car', next: 'serviceDiscovery' },
      ],
    },
    serviceDiscovery: {
      id: 'serviceDiscovery', title: 'A Useful Discovery',
      text: 'You take one last look at the service car’s diagram and fittings. The passenger coaches are just behind you; the train is ready to continue its journey.',
      choices: [
        { id: 'coachAfterService', label: 'Continue the journey', next: 'quietJourney' },
      ],
    },
    valeAftercare: {
      id: 'valeAftercare', title: 'The Whistle in Vale’s Hand',
      text: 'Vale’s breathing steadies. Grateful, he unclips his brass whistle and presses it into your hand, then repeats the brake procedure. The remaining passengers are waiting for someone to take charge.',
      choices: [
        { id: 'emergencyAfterCare', label: 'Move through the train', next: 'emergencyHub' },
        { id: 'routeAfterCare', label: 'Ask about the track', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding] }, next: 'routeBriefing' },
      ],
    },
    routeBriefing: {
      id: 'routeBriefing', title: 'The Siding Before the Gorge',
      text: 'Vale confirms the surveyor’s warning: a maintenance siding climbs away before Blackstone Bridge. The coaches sway hard as the train begins its final descent.',
      choices: [
        { id: 'emergencyAfterRoute', label: 'Take charge of the crisis', next: 'emergencyHub' },
        { id: 'serviceAfterRoute', label: 'Check the service brake', next: 'serviceEmergency' },
      ],
    },
    quietJourney: {
      id: 'quietJourney', title: 'Too Fast', tone: 'warning',
      text: 'The pleasant rhythm sharpens. Cups creep across tables. A station flashes past without slowing, followed by a red signal. From ahead comes a long metallic shriek—and then no braking sound at all.',
      choices: [
        { id: 'findConductor', label: 'Find the conductor', next: 'firstSigns' },
        { id: 'checkBrake', label: 'Check the service car', next: 'serviceEmergency' },
      ],
    },
    firstSigns: {
      id: 'firstSigns', title: 'Something Is Wrong', tone: 'warning',
      text: 'Vale lies against a partition, dazed and bleeding. “Regulator jammed open,” he says. “Engineer hurt. Blackstone Bridge washed out this morning. We have six miles of descent.” The coaches sway harder with every turn.',
      choices: [
        { id: 'helpVale', label: 'Bind Vale’s wound', effects: { gainItems: ['conductorWhistle'], knowledgeEntries: [KNOWLEDGE_FACTS.baggageBrakeHandwheel], setFlags: ['helpedVale'] }, next: 'valeAftercare' },
        { id: 'askRoute', label: 'Ask about the track', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding], setFlags: ['askedRoute'] }, next: 'routeBriefing' },
        { id: 'takeCharge', label: 'Move through the train', next: 'emergencyHub' },
      ],
    },
    serviceEmergency: {
      id: 'serviceEmergency', title: 'The Broken Brake Line', tone: 'danger',
      text: 'The service car bucks beneath your feet. A coupling jolt has torn the automatic brake linkage loose. The wall handwheel remains, but its locking pawl chatters violently. Beyond the forward door, the locomotive is two exposed roofs away.',
      choices: [
        { id: 'handwheel', label: 'Work the handwheel', next: 'baggageBrake' },
        { id: 'findStaff', label: 'Find the conductor', next: 'staffAfterBrake' },
        { id: 'roof', label: 'Go forward over the roofs', next: 'roofAccess' },
      ],
    },
    staffAfterBrake: {
      id: 'staffAfterBrake', title: 'Vale Reaches the Service Car', tone: 'warning',
      text: 'Vale limps in behind you, pressing a cloth to his brow. He confirms the engineer cannot reach the controls. The handwheel can bleed off speed; the exposed roof leads to the regulator, and the couplings can separate the passenger coaches. Each plan carries a different risk.',
      choices: [
        { id: 'useBrakeAfterStaff', label: 'Work the handwheel', next: 'baggageBrake' },
        { id: 'moveForwardAfterStaff', label: 'Go forward over the roofs', next: 'roofAccess' },
      ],
    },
    emergencyHub: {
      id: 'emergencyHub', title: 'Six Miles to Blackstone', tone: 'danger',
      text: 'Passengers brace in the aisle as the train plunges down the grade. The service brake may slow the train enough for a rough run-off before the bridge. The locomotive regulator might close and stop it, but the route is over two exposed roofs. Uncoupling could send the passenger coaches toward a rising maintenance siding while lightening the engine section. A gravel bank offers a risky escape for one person, not a way to save the train. None is certain.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'Passengers brace in the aisle as the train plunges down the grade. Blackstone Bridge is closer now, its missing span a dark break beyond the rain. The service brake may still slow the train enough for a rough run-off. The locomotive regulator might close and stop it, but the route is over two exposed roofs. Uncoupling could send the passenger coaches toward a rising maintenance siding while lightening the engine section. A gravel bank offers a risky escape for one person, not a way to save the train. None is certain.' }],
      choices: [
        { id: 'brake', label: 'Try the service brake', timeCost: 3, next: 'baggageBrake' },
        { id: 'engine', label: 'Try for the locomotive', timeCost: 2, next: 'roofAccess' },
        { id: 'uncouple', label: 'Separate the passenger coaches', timeCost: 6, next: 'couplingChoice' },
        { id: 'escape', label: 'Aim for the gravel bank', timeCost: 3, next: 'escapePoint' },
      ],
    },
    baggageBrake: {
      id: 'baggageBrake', title: 'The Shuddering Handwheel', tone: 'danger',
      text: 'The wheel is hot and fighting the pressure. Its locking tooth is cracked. Turn too little and nothing happens; vent too quickly and the rear brakes may seize, throwing the coaches sideways.',
      choices: [
        { id: 'knownMethod', label: 'Turn, hold, then lock', timeCost: 6, requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.baggageBrakeHandwheel.id] }, effects: { setFlags: ['brakesApplied'] }, next: 'brakesHolding' },
        { id: 'toolRepair', label: 'Repair the locking tooth', timeCost: 4, requirements: { items: ['pocketToolkit'] }, effects: { setFlags: ['brakesApplied', 'brakeRepaired'] }, next: 'brakesHolding' },
        { id: 'wedgeBrass', label: 'Wedge it with the candlestick', timeCost: 5, requirements: { items: ['brassCandlestick'] }, effects: { setFlags: ['brakesApplied'], loseItems: ['brassCandlestick'] }, next: 'brakesHolding' },
        { id: 'forceWheel', label: 'Force the wheel', timeCost: 8, hint: 'It may slow the train—or kick free.', chance: { probability: 0.55, successNext: 'brakesHolding', failureNext: 'brakeKickback', successMessage: 'The line hisses. Brakes bite along the train.', failureMessage: 'The wheel kicks loose and throws you into the crates.', successEffects: { setFlags: ['brakesApplied'] }, failureEffects: { health: -4 } } },
      ],
    },
    brakeKickback: {
      id: 'brakeKickback', title: 'Thrown Against the Crates', tone: 'danger',
      text: 'Your shoulder burns. The handwheel still spins, but you now understand where it catches. The bridge is closer; another mistake may be the last.',
      choices: [
        { id: 'tryAgain', label: 'Try the wheel again', hint: 'The danger is now unmistakable.', chance: { probability: 0.7, successNext: 'brakesHolding', failureNext: 'brakeSecondKickback', successMessage: 'This time you catch and hold the wheel.', failureMessage: 'The iron handle strikes you again.', successEffects: { setFlags: ['brakesApplied'] }, failureEffects: { health: -4 } } },
        { id: 'roof', label: 'Try for the locomotive', next: 'roofAccess' },
        { id: 'uncouple', label: 'Go to the couplings', next: 'couplingChoice' },
      ],
    },
    brakeSecondKickback: {
      id: 'brakeSecondKickback', title: 'The Handwheel Breaks Free', tone: 'danger',
      text: 'The locking tooth snaps. The brake line can no longer be controlled from here, but the locomotive and the rear coupling are still within reach.',
      choices: [
        { id: 'roofAfterWheel', label: 'Try for the locomotive', next: 'roofAccess' },
        { id: 'coupleAfterWheel', label: 'Go to the couplings', next: 'couplingChoice' },
      ],
    },
    brakesHolding: {
      id: 'brakesHolding', title: 'Speed Bought with Sparks', tone: 'warning',
      text: 'Blue sparks stream past the windows. The train is slowing, but not enough to stop before Blackstone. Keeping the brake engaged may force a survivable run-off into the brush. The regulator ahead might still close for a full stop, though the roof crossing is dangerous. Separating the coaches could lighten the engine section but leaves the passengers to the siding. The gravel bank remains a last chance for you alone.',
      choices: [
        { id: 'front', label: 'Try for the locomotive', next: 'roofAccess' },
        { id: 'hold', label: 'Keep the brake engaged', effects: { gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' },
        { id: 'couple', label: 'Separate the passenger coaches', next: 'couplingChoice' },
        { id: 'escapeAfterBrake', label: 'Try the gravel bank', next: 'escapePoint' },
      ],
    },
    roofAccess: {
      id: 'roofAccess', title: 'Into the Rain', tone: 'danger',
      text: 'The forward vestibule is jammed. Outside, rain lashes the roof and telegraph poles blur past. Crossing is possible, but one bad step means the ballast. The locked side window offers a less elegant route.',
      choices: [
        { id: 'toolWindow', label: 'Unfasten the window', timeCost: 3, requirements: { items: ['pocketToolkit'] }, next: 'locomotive' },
        { id: 'smashWindow', label: 'Smash it with brass', timeCost: 2, requirements: { items: ['brassCandlestick'] }, next: 'locomotive' },
        { id: 'ropeCross', label: 'Clip on the travel rope', timeCost: 4, requirements: { items: ['travelRope'] }, next: 'locomotive' },
        { id: 'crossRoof', label: 'Cross the roof', timeCost: 8, hint: 'The speed and slick iron make this extremely dangerous.', chance: { probability: 0.55, successNext: 'locomotive', failureNext: 'roofSlip', successMessage: 'You crawl into the locomotive cab.', failureMessage: 'Your boot slips. You catch a rain gutter with one hand.', failureEffects: { health: -3 } } },
      ],
    },
    roofSlip: {
      id: 'roofSlip', title: 'One Hand Above the Rails', tone: 'danger',
      text: 'Your boots hammer the coach side. The gutter is bending. You can haul yourself up, swing through a window, or let go near the approaching gravel embankment.',
      choices: [
        { id: 'haul', label: 'Haul yourself up', hint: 'A hard pull with no safe failure.', chance: { probability: 0.65, successNext: 'locomotive', failureNext: 'roofInjury', successMessage: 'You roll onto the roof and reach the cab.', failureMessage: 'The gutter tears another inch.', failureEffects: { health: -3 } } },
        { id: 'window', label: 'Swing through a window', chance: { probability: 0.75, successNext: 'roofWindowRecovery', failureNext: 'roofInjury', successMessage: 'Glass and passengers break your fall.', failureMessage: 'You strike the carriage side hard.', failureEffects: { health: -2 } } },
        { id: 'drop', label: 'Drop at the embankment', hint: 'Personal survival is possible; the train will go on.', chance: { probability: 0.6, successNext: 'escapeEnding', failureNext: 'roofInjury', successMessage: 'You tumble through wet gravel and come to a stop alive.', failureMessage: 'You hit the slope badly and barely keep your grip.', failureEffects: { health: -4 } } },
      ],
    },
    roofWindowRecovery: {
      id: 'roofWindowRecovery', title: 'Through the Side Window', tone: 'warning',
      text: 'You land in the service passage amid startled passengers. The locomotive is still ahead, and the coupling remains behind you.',
      choices: [
        { id: 'continueToCab', label: 'Continue to the locomotive', next: 'locomotive' },
        { id: 'tryCouplings', label: 'Reach the couplings', next: 'couplingChoice' },
      ],
    },
    roofInjury: {
      id: 'roofInjury', title: 'A Grip on the Ladder', tone: 'danger',
      text: 'You catch a side ladder before the wheels take you. Your arms shake and the bridge is close. You can secure yourself for the impact or make one last dangerous attempt to jump clear.',
      choices: [
        { id: 'secureForImpact', label: 'Hold on and brace', effects: { gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' },
        { id: 'jumpFromLadder', label: 'Jump for the gravel', hint: 'A fall may be fatal.', chance: { probability: 0.4, successNext: 'escapeEnding', failureNext: 'fatalFall', successMessage: 'You roll clear of the rails, badly bruised but alive.', failureMessage: 'The ground strikes before you can tuck and roll.' } },
      ],
    },
    locomotive: {
      id: 'locomotive', title: 'The Runaway Engine', tone: 'danger',
      text: 'The engineer is conscious but pinned. The regulator linkage has jumped its guide; the main lever thrashes with every rail joint. Steam hides the brake valves. Blackstone Gorge opens ahead through the rain.',
      textVariants: [{ requirements: { minElapsedMinutes: 45 }, text: 'The engineer is conscious but pinned. The regulator linkage has jumped its guide; the main lever thrashes with every rail joint. Steam hides the brake valves. The broken span at Blackstone Bridge is nearly upon you.' }],
      choices: [
        { id: 'repair', label: 'Repair the regulator', timeCost: 5, requirements: { items: ['pocketToolkit'] }, effects: { gainItems: ['signalLens'], money: 3 }, next: 'cleanEnding' },
        { id: 'glovedLever', label: 'Reseat the hot linkage', timeCost: 6, requirements: { items: ['workGloves'] }, effects: { health: -1, gainItems: ['signalLens'], money: 3 }, next: 'cleanEnding' },
        { id: 'brakeSequence', label: 'Coordinate both brakes', timeCost: 4, requirements: { flags: ['brakesApplied'] }, effects: { gainItems: ['signalLens'], money: 3 }, next: 'cleanEnding' },
        { id: 'grabLever', label: 'Grab the regulator', timeCost: 8, hint: 'The lever is visibly hot and bucking hard.', chance: { probability: 0.5, successNext: 'cleanEnding', failureNext: 'engineBurn', successMessage: 'The linkage drops home. The engine begins to answer.', failureMessage: 'Steam burns your hands and the lever throws you back.', successEffects: { gainItems: ['signalLens'], money: 3 }, failureEffects: { health: -5 } } },
      ],
    },
    engineBurn: {
      id: 'engineBurn', title: 'Steam and Splintered Wood', tone: 'danger',
      text: 'Your hands are burned and the bridge is almost visible. The service brake may still buy a survivable crash. Or you can try the regulator once more, knowing exactly how it moves.',
      choices: [
        { id: 'brake', label: 'Brace for a survivable crash', next: 'engineBrakeRescue' },
        { id: 'retry', label: 'Try the regulator again', hint: 'Failure may kill you.', chance: { probability: 0.7, successNext: 'cleanEnding', failureNext: 'engineBurnSecond', successMessage: 'You force the guide into place.', failureMessage: 'The lever lashes across your chest.', successEffects: { gainItems: ['signalLens'], money: 3 }, failureEffects: { health: -6 } } },
        { id: 'escape', label: 'Look for a way off', next: 'escapePoint' },
      ],
    },
    engineBurnSecond: {
      id: 'engineBurnSecond', title: 'The Lever Falls Away', tone: 'danger',
      text: 'The regulator linkage is beyond your reach now. Steam and the broken bridge fill the cab windows. The only remaining action is to brace for the impact.',
      choices: [{ id: 'braceInCab', label: 'Brace against the boiler', effects: { health: -2, gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' }],
    },
    engineBrakeRescue: {
      id: 'engineBrakeRescue', title: 'Manual Brake Pressure', tone: 'warning',
      text: 'You pull the manual valve and hold it open. The train will not stop, but the service car’s earlier brake work gives it enough drag to leave the rails before the gorge.',
      choices: [{ id: 'holdManualBrake', label: 'Hold the valve and brace', effects: { gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' }],
    },
    couplingChoice: {
      id: 'couplingChoice', title: 'Who Keeps the Weight?', tone: 'warning',
      text: 'At the coupling, the choice is cruel. Cut loose the three passenger coaches and the lighter engine section may stop. The coaches should roll backward toward the maintenance siding—but without the locomotive, passengers will face that risk alone. Keep everyone together and the brakes must hold the full train.',
      choices: [
        { id: 'cutLoose', label: 'Uncouple the coaches', timeCost: 7, effects: { setFlags: ['carsUncoupled'] }, next: 'separatedFront' },
        { id: 'stayTogether', label: 'Keep everyone together', timeCost: 2, next: 'togetherAttempt' },
        { id: 'warnPassengers', label: 'Warn and organize them', timeCost: 4, requirements: { items: ['conductorWhistle'] }, effects: { setFlags: ['passengersReady'] }, next: 'couplingAfterWarning' },
      ],
    },
    couplingAfterWarning: {
      id: 'couplingAfterWarning', title: 'Passengers Brace for Impact', tone: 'warning',
      text: 'The whistle gets everyone moving toward the rear platforms. They understand the siding is uncertain, but panic has given way to preparation. The coupling is still within reach.',
      choices: [
        { id: 'cutAfterWarning', label: 'Uncouple the coaches', effects: { setFlags: ['carsUncoupled', 'passengersReady'] }, next: 'separatedFront' },
        { id: 'keepTogetherAfterWarning', label: 'Keep everyone together', next: 'togetherAttempt' },
      ],
    },
    togetherAttempt: {
      id: 'togetherAttempt', title: 'One Last Attempt Together', tone: 'warning',
      text: 'You keep the coaches coupled. The passengers crouch between the seats as you direct them to brace. The combined weight makes a clean stop impossible, but the train may still leave the rails short of the gorge.',
      choices: [
        { id: 'braceTogether', label: 'Brace the passengers', effects: { gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' },
      ],
    },
    separatedFront: {
      id: 'separatedFront', title: 'Two Trains Now', tone: 'danger',
      text: 'The pin comes free. The passenger coaches fall behind, gathering toward the rising siding, while the engine and service car leap ahead. Their lost weight gives you one narrow chance to stop the front section.',
      choices: [
        { id: 'lightBrake', label: 'Brake the lighter section', effects: { money: 1 }, next: 'uncoupledEnding' },
        { id: 'engine', label: 'Reach the engine', next: 'locomotive' },
        { id: 'returnCars', label: 'Leap back to the coaches', requirements: { flags: ['passengersReady'] }, chance: { probability: 0.72, successNext: 'uncoupledEnding', failureNext: 'carriageGrab', successMessage: 'Hands catch yours and drag you onto the rear platform.', failureMessage: 'You miss the rail and catch the side ladder.', failureEffects: { health: -3 } } },
      ],
    },
    carriageGrab: {
      id: 'carriageGrab', title: 'Between the Divided Cars', tone: 'danger',
      text: 'You cling to the side ladder as the gap widens. The passenger coaches are already rolling toward the siding; you can hold on and let them carry you clear, or try to jump onto the trackside gravel.',
      choices: [
        { id: 'stayOnCarriage', label: 'Hold on and brace', next: 'uncoupledEnding' },
        { id: 'jumpFromGap', label: 'Jump to the gravel', hint: 'The gap and speed make this dangerous.', chance: { probability: 0.45, successNext: 'escapeEnding', failureNext: 'fatalFall', successMessage: 'You roll into the gravel beside the siding.', failureMessage: 'You fall beneath the moving cars.' } },
      ],
    },
    escapePoint: {
      id: 'escapePoint', title: 'The Gravel Embankment', tone: 'danger',
      text: 'A long gravel bank rises beside the track before the gorge. Jumping at this speed could break every bone; staying aboard risks the missing bridge. This route saves only you.',
      choices: [
        { id: 'ropeExit', label: 'Lower yourself by rope', requirements: { items: ['travelRope'] }, effects: { health: -2 }, next: 'escapeEnding' },
        { id: 'mappedJump', label: 'Jump at the soft shoulder', requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.blackstoneMaintenanceSiding.id] }, chance: { probability: 0.72, successNext: 'escapeEnding', failureNext: 'escapeInjury', successMessage: 'You hit mud, roll, and stop short of the rocks.', failureMessage: 'You mistime the leap and slam into the slope.', failureEffects: { health: -5 } } },
        { id: 'blindJump', label: 'Jump for the gravel', hint: 'The landing is fast, rough, and uncertain.', chance: { probability: 0.45, successNext: 'escapeEnding', failureNext: 'escapeInjury', successMessage: 'The gravel tears at you, but you survive.', failureMessage: 'The ground hits harder than expected.', failureEffects: { health: -6 } } },
        { id: 'stay', label: 'Stay aboard and brace', next: 'escapeInjury' },
      ],
    },
    escapeInjury: {
      id: 'escapeInjury', title: 'Still Aboard', tone: 'danger',
      text: 'The doorframe catches you before you fall beneath the wheels. Hurt and shaken, you remain aboard. The service brake and coupling are still reachable, but time is almost gone.',
      choices: [
        { id: 'brace', label: 'Brace for the impact', effects: { gainItems: ['signalLens'], money: 2 }, next: 'messyEnding' },
        { id: 'jumpAgain', label: 'Try the jump again', hint: 'Your injuries make this desperate.', chance: { probability: 0.55, successNext: 'escapeEnding', failureNext: 'fatalFall', successMessage: 'You clear the step and roll into the rain.', failureMessage: 'You strike the rocks below.' } },
      ],
    },
    cleanEnding: {
      id: 'cleanEnding', title: 'Stopped at Milepost Forty-Seven',
      text: 'The regulator closes. Brake pressure builds, wheel by wheel, until the train stops with its lamps shining across the broken rails. The passengers step down trembling but alive. A trackside signal has lost its crimson glass lens in the storm; you find it intact in the ballast and pocket it. The engineer presses three coins into your hand as thanks.',
      choices: [], ending: 'success',
    },
    messyEnding: {
      id: 'messyEnding', title: 'A Survivable Wreck',
      text: 'You hold the brake until the iron glows. The train leaves the rails in a shower of stone before the bridge, tearing through brush instead of empty air. There are broken windows and broken bones—but voices answer when the conductor calls. In the wreckage, you spot an intact crimson lens from a trackside signal and take it with you. Passengers press two coins into your hand for keeping them together.',
      choices: [], ending: 'success',
    },
    uncoupledEnding: {
      id: 'uncoupledEnding', title: 'The Divided Train',
      text: 'The lightened front section grinds to a stop short of the gorge. Far uphill, the passenger coaches roll onto the maintenance siding and vanish around the bend. A whistle answers from the distant coaches at last. You saved them by leaving them to a danger they had to face alone.',
      choices: [], ending: 'success',
    },
    escapeEnding: {
      id: 'escapeEnding', title: 'One Passenger Missing',
      text: 'You lie in wet gravel as the red tail lamps race toward Blackstone. You are alive, carrying only what you managed to keep as you left the train. What happens beyond the bend is carried away by the storm—and survival, this time, is not the same as victory.',
      choices: [], ending: 'success',
    },
    fatalFall: {
      id: 'fatalFall', title: 'The Trackside Takes You', tone: 'danger',
      text: 'The speed and stone leave no time to recover. The train races on toward the gorge, carrying the last echo of the whistle.',
      choices: [], ending: 'death',
    },
  },
};
