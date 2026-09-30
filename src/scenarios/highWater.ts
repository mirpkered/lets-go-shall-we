import type { Choice, Scene, Scenario } from '../types';

type Priority = 'resident' | 'livestock' | 'medicine' | 'store';
type Window = 'first' | 'second' | 'last';

const ATTEMPTED: Record<Priority, string> = {
  resident: 'residentAttempted', livestock: 'livestockAttempted', medicine: 'medicineAttempted', store: 'storeAttempted',
};
const SAVED: Record<Priority, string> = {
  resident: 'residentSafe', livestock: 'livestockSafe', medicine: 'medicineSafe', store: 'storeSafe',
};
const WINDOW: Record<Window, string> = { first: 'priorityWindowOne', second: 'priorityWindowTwo', last: 'priorityWindowThree' };
const AFTER_WINDOW: Record<Window, string> = { first: 'waterDeepens', second: 'waterCrest', last: 'aftermathDecision' };
const TOOL_GEAR = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'bridgewrightHammer', 'ironRopeClamp', 'brassCandlestick', 'waxedCanvasSheet'];
const MEDICINE_GEAR = ['ratCatchersHook', 'minerHeadlamp', 'waxedCanvasSheet', 'weatherproofCloak', 'drainageHook'];

function priorityChoice(kind: Priority, window: Window, label: string, sceneId: string, timeCost: number): Choice {
  const suffix = `${window[0].toUpperCase()}${window.slice(1)}`;
  const previous = window === 'first' ? [] : [WINDOW[window === 'second' ? 'first' : 'second']];
  return {
    id: `go${kind[0].toUpperCase()}${kind.slice(1)}${suffix}`,
    label,
    requirements: { notFlags: [ATTEMPTED[kind]] },
    effects: { clearFlags: previous, setFlags: [WINDOW[window]] },
    next: sceneId,
    timeCost,
  };
}

function resultScene(kind: Priority, window: Window, title: string, safeText: string, missedText: string): Scene {
  const suffix = `${window[0].toUpperCase()}${window.slice(1)}`;
  return {
    id: `${kind}${suffix}Outcome`,
    title,
    text: missedText,
    textVariants: [{ requirements: { flags: [SAVED[kind]] }, text: safeText }],
    choices: [{ id: `moveOnFrom${kind}${suffix}`, label: window === 'last' ? 'Head for the remaining dry road' : 'See what the river has taken now', timeCost: 1, next: AFTER_WINDOW[window] }],
  };
}

function taskScene(kind: 'resident' | 'livestock' | 'medicine' | 'store', window: Window): Scene {
  const suffix = `${window[0].toUpperCase()}${window.slice(1)}`;
  const id = `${kind}${suffix}`;
  const outcome = `${kind}${suffix}Outcome`;
  const attempt = ATTEMPTED[kind];
  const success = SAVED[kind];
  const successFlags = kind === 'resident' || kind === 'livestock'
    ? ['earnedRopeReward']
    : ['earnedClampReward'];
  const successHistory: Record<typeof kind, string> = {
    resident: 'prioritized_people_in_flood', livestock: 'rescued_livestock', medicine: 'retrieved_medicine_during_flood', store: 'prioritized_property_in_flood',
  };
  const note = kind === 'resident'
    ? 'An older resident is calling from the riverside cottage. Water has reached the lower step; the lane back uphill is still visible, but not for long.'
    : kind === 'livestock'
      ? 'The stable door is buckling against a frightened animal inside. High ground is only a few fields away, but the yard is turning to mud.'
      : kind === 'medicine'
        ? 'A clinic volunteer shows you the medicine cabinet above the low corridor. The sealed cases are needed at the hill shelter, and water is pushing under the door.'
        : 'The storekeeper is trying to raise the last dry crates above the floor. A shutter faces the river; if it gives, the lower stock will be ruined.';
  const choices: Choice[] = [];

  if (kind === 'resident') {
    choices.push({
      id: `ropeResident${suffix}`, label: 'Secure a line and guide the resident uphill', hint: 'A rope makes the wet lane quicker and gives them something steady to hold.',
      requirements: { items: ['travelRope'] }, timeCost: window === 'first' ? 5 : 8,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_people_in_flood'] },
      chance: { probability: window === 'last' ? 0.69 : 0.89, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.08, successNext: outcome, failureNext: outcome, successMessage: 'The line holds, and you get the resident above the water.', failureMessage: 'The line snags on a fence; the resident reaches the upper room, but the lane is lost.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `hookResident${suffix}`, label: 'Catch the porch rail with your iron hook', requirements: { items: ['ratCatchersHook'] }, timeCost: 6,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_people_in_flood'] },
      chance: { probability: 0.81, successNext: outcome, failureNext: outcome, successMessage: 'The hook catches the rail long enough to steady the crossing.', failureMessage: 'The hook skates off the wet iron; you reach the resident, but the lane is cut.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    });
    choices.push({
      id: `carryResidentEarly${suffix}`, label: 'Help the resident walk the lane', hint: 'Without a line, the slick path takes time and a steady grip.',
      requirements: { notItems: ['travelRope', 'ratCatchersHook'], maxElapsedMinutes: 24 }, timeCost: 9,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_people_in_flood'] },
      chance: { probability: 0.68, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.15, successNext: outcome, failureNext: outcome, successMessage: 'You keep a firm hold and reach the upper lane together.', failureMessage: 'The current sweeps across the path; the resident gets upstairs, but you cannot bring them out yet.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `carryResidentLate${suffix}`, label: 'Reach the resident through the flooded lane', hint: 'The porch steps are submerged and debris is moving fast.',
      requirements: { notItems: ['travelRope', 'ratCatchersHook'], minElapsedMinutes: 25 }, timeCost: 14,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_people_in_flood', 'stayed_too_long_to_save_property'] },
      chance: { probability: 0.43, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.16, successNext: outcome, failureNext: outcome, successMessage: 'You get the resident clear just before the lane disappears.', failureMessage: 'A branch strikes your shoulder; the resident is safe upstairs, but the water cuts off the exit.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -2, setFlags: [`${kind}AttemptFailed`] } },
    });
  } else if (kind === 'livestock') {
    choices.push({
      id: `tetherAnimals${suffix}`, label: 'Tether the animals to your travel rope', hint: 'The line keeps the panicked animals together on the flooded yard.',
      requirements: { items: ['travelRope'] }, timeCost: window === 'first' ? 8 : 10,
      effects: { setFlags: [attempt] },
      chance: { probability: window === 'last' ? 0.71 : 0.88, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.1, successNext: outcome, failureNext: outcome, successMessage: 'The animals follow the taut line to the ridge.', failureMessage: 'A frightened animal pulls hard; the line keeps you upright, but the gate jams.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    });
    choices.push({
      id: `leadAnimalsDry${suffix}`, label: 'Lead the animals along the dry yard', hint: 'The yard is muddy but still passable; panicked animals may bolt.',
      requirements: { notItems: ['travelRope'], maxElapsedMinutes: 25 }, timeCost: 11,
      effects: { setFlags: [attempt] },
      chance: { probability: 0.65, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.16, successNext: outcome, failureNext: outcome, successMessage: 'The animals follow your voice to the higher field.', failureMessage: 'One animal bolts through a broken rail; the stable is still too low to leave.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `wadeForAnimals${suffix}`, label: 'Wade into the stable yard', hint: 'The route is under brown water and the current is pulling at the fence.',
      requirements: { notItems: ['travelRope'], minElapsedMinutes: 18 }, timeCost: 15,
      effects: { setFlags: [attempt] },
      chance: { probability: 0.42, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.17, successNext: outcome, failureNext: outcome, successMessage: 'You open the stable from the high side and guide the animals out.', failureMessage: 'Water slams the gate against your leg; the animals stay inside as you retreat.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -3, setFlags: [`${kind}AttemptFailed`] } },
    });
  } else if (kind === 'medicine') {
    choices.push({
      id: `snagMedicine${suffix}`, label: 'Pull the floating case in with your hook', requirements: { items: ['ratCatchersHook'] }, timeCost: window === 'last' ? 5 : 3,
      effects: { setFlags: [attempt], knowledge: ['The clinic stored its flood medicines in a sealed case above the corridor floor.'] },
      chance: { probability: window === 'last' ? 0.71 : 0.9, successNext: outcome, failureNext: outcome, successMessage: 'The hook catches the sealed case before the current takes it.', failureMessage: 'The hook slips from the wet handle and the case drifts out of reach.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `searchMedicine${suffix}`, label: 'Find and carry the medicine by headlamp', requirements: { items: ['minerHeadlamp'] }, timeCost: window === 'last' ? 7 : 4,
      effects: { setFlags: [attempt], knowledge: ['The clinic stored its flood medicines in a sealed case above the corridor floor.'] },
      chance: { probability: window === 'last' ? 0.67 : 0.86, successNext: outcome, failureNext: outcome, successMessage: 'Your headlamp finds the cabinet above the waterline.', failureMessage: 'The lamp picks out the case, but the flooded cabinet will not open in time.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `wrapMedicine${suffix}`, label: 'Wrap the case in your waterproof sheet', requirements: { anyItems: ['waxedCanvasSheet', 'weatherproofCloak'] }, timeCost: 5,
      effects: { setFlags: [attempt], knowledge: ['The clinic stored its flood medicines in a sealed case above the corridor floor.'] },
      chance: { probability: 0.84, successNext: outcome, failureNext: outcome, successMessage: 'The wrapping keeps the sealed case dry as you carry it uphill.', failureMessage: 'The current pulls the wrapped case against the doorframe and tears it away.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    });
    choices.push({
      id: `carryMedicineEarly${suffix}`, label: 'Carry the medicine case out by hand', hint: 'The clinic corridor is still passable, but water is at the door.',
      requirements: { notItems: MEDICINE_GEAR, maxElapsedMinutes: 24 }, timeCost: 8,
      effects: { setFlags: [attempt], knowledge: ['The clinic stored its flood medicines in a sealed case above the corridor floor.'] },
      chance: { probability: 0.69, successNext: outcome, failureNext: outcome, successMessage: 'You get the medicine to the hill shelter before the lane floods.', failureMessage: 'The case catches on the doorway; water reaches the lower shelf as you retreat.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `wadeForMedicine${suffix}`, label: 'Wade back for the medicine', hint: 'The corridor is flooded; the cabinet may already be underwater.',
      requirements: { notItems: MEDICINE_GEAR, minElapsedMinutes: 25 }, timeCost: 13,
      effects: { setFlags: [attempt], knowledge: ['The clinic stored its flood medicines in a sealed case above the corridor floor.'] },
      chance: { probability: 0.38, successNext: outcome, failureNext: outcome, successMessage: 'You find the sealed case above the moving water and make it back.', failureMessage: 'The water pushes you from the cabinet; the medicine is lost to the current.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -2, setFlags: [`${kind}AttemptFailed`] } },
    });
  } else {
    choices.push({
      id: `braceStore${suffix}`, label: 'Brace the shutter with your repair gear', hint: 'A tool, clamp, or sturdy sheet can hold the lower shutter closed.',
      requirements: { anyItems: TOOL_GEAR }, timeCost: window === 'last' ? 7 : 4,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_property_in_flood'] },
      chance: { probability: window === 'last' ? 0.73 : 0.92, successNext: outcome, failureNext: outcome, successMessage: 'The brace holds the shutter long enough to lift the last dry crates.', failureMessage: 'The shutter bucks under a wave; the lower stock is wet, but the upper shelves hold.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { setFlags: [`${kind}AttemptFailed`] } },
    });
    choices.push({
      id: `braceStoreDry${suffix}`, label: 'Stack crates against the dry-side shutter', hint: 'The door is bowing; the work is possible by hand but will take longer.',
      requirements: { notItems: TOOL_GEAR, maxElapsedMinutes: 24 }, timeCost: 9,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_property_in_flood'] },
      chance: { probability: 0.64, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: outcome, failureNext: outcome, successMessage: 'The crates hold while the storekeeper moves the supplies upstairs.', failureMessage: 'The lower shutter gives way before the crates are set.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -1, setFlags: [`${kind}AttemptFailed`] } },
    }, {
      id: `braceStoreFlooded${suffix}`, label: 'Hold the shutter against the current', hint: 'Water is already pressing through the lower seam; failure may injure you.',
      requirements: { notItems: TOOL_GEAR, minElapsedMinutes: 25 }, timeCost: 15,
      effects: { setFlags: [attempt], historyFlags: ['prioritized_property_in_flood', 'stayed_too_long_to_save_property'] },
      chance: { probability: 0.36, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.14, successNext: outcome, failureNext: outcome, successMessage: 'You hold the shutter while the last crates are carried above the water.', failureMessage: 'A plank snaps back and bruises your arm; the current takes the lower stock.', successEffects: { setFlags: [success, ...successFlags], historyFlags: [successHistory[kind]] }, failureEffects: { health: -2, setFlags: [`${kind}AttemptFailed`] } },
    });
  }

  return {
    id,
    title: kind === 'resident' ? 'The Riverside Cottage' : kind === 'livestock' ? 'At the Stable Gate' : kind === 'medicine' ? 'The Clinic Cabinet' : 'The General Store',
    tone: window === 'last' ? 'danger' : 'warning',
    text: note,
    textVariants: window === 'first' ? [] : [{ requirements: { minElapsedMinutes: 25 }, text: kind === 'resident'
      ? 'The cottage lane is now under brown water. The resident has climbed above the first-floor windowsill; the current is carrying branches past the porch.'
      : kind === 'livestock'
        ? 'The stable yard is flooded to the lower rail. The animals are panicked, and the gate is jammed against the current.'
        : kind === 'medicine'
          ? 'Water has entered the clinic corridor. The medicine case is still above the cabinet shelf, but the door now pushes back against the current.'
          : 'Water is pushing beneath the store shutter. The storekeeper has only a few minutes to move the upper crates before the lower shelves are lost.' }],
    choices,
  };
}

function objectiveOutcome(kind: Priority, window: Window): Scene {
  const names: Record<Priority, [string, string, string]> = {
    resident: ['The Cottage Lane', 'The resident reaches higher ground with your help.', 'The resident is above the water, but the route out has been cut off.'],
    livestock: ['The Stable Gate', 'The animals reach the ridge, though they leave the stable and lower field behind.', 'The gate jams in the rising water; the animals are still inside.'],
    medicine: ['The Clinic on Higher Ground', 'The sealed medicine case reaches the hill shelter before the clinic floods.', 'The clinic corridor is lost to the current; the shelter will have to manage without that case.'],
    store: ['The Store Shutters', 'The shutter holds long enough for the storekeeper to move the supplies above the water.', 'The lower stock is wet and the shutter is damaged; the storekeeper leaves the rest behind.'],
  };
  return resultScene(kind, window, names[kind][0], names[kind][1], names[kind][2]);
}

function missionEntryChoices(window: 'second' | 'last'): Choice[] {
  const prefix = window === 'second' ? 'The water is over the low path now. ' : 'Only one more attempt fits before you leave. ';
  return [
    priorityChoice('resident', window, `${prefix}Go to the riverside cottage`, `resident${window[0].toUpperCase()}${window.slice(1)}`, window === 'second' ? 4 : 5),
    priorityChoice('livestock', window, `${prefix}Reach the stable`, `livestock${window[0].toUpperCase()}${window.slice(1)}`, window === 'second' ? 4 : 5),
    priorityChoice('medicine', window, `${prefix}Try for the clinic medicine`, `medicine${window[0].toUpperCase()}${window.slice(1)}`, window === 'second' ? 3 : 5),
    priorityChoice('store', window, `${prefix}Protect the general store`, `store${window[0].toUpperCase()}${window.slice(1)}`, window === 'second' ? 3 : 5),
  ];
}

export const HIGH_WATER: Scenario = {
  id: 'high-water',
  title: 'High Water',
  subtitle: 'A rising river, a small settlement, and more to save than time allows.',
  startScene: 'floodArrival',
  timePhases: [
    { id: 'rising', label: 'RISING — THE ROAD IS OPEN', atMinutes: 0 },
    { id: 'deepening', label: 'DEEPENING — LOW PATHS ARE WET', atMinutes: 12 },
    { id: 'dangerous', label: 'DANGEROUS — THE CURRENT IS STRONG', atMinutes: 26 },
    { id: 'critical', label: 'CRITICAL — THE LAST DRY ROAD', atMinutes: 42 },
    { id: 'aftermath', label: 'AFTERMATH — THE RIVER HAS TURNED', atMinutes: 58 },
  ],
  scenes: {
    floodArrival: {
      id: 'floodArrival', title: 'The River Road', tone: 'warning',
      text: 'Rain has soaked the valley for two days. The river is already over its banks, but the road into the settlement is still passable. From the rise you can see a cottage beside the water, a stable at the edge of a field, and a storekeeper moving crates. The bridge road climbs toward a hill, though the rain is getting heavier. No one here can do everything before the river rises again.',
      textVariants: [
        { requirements: { historyFlags: ['organized_flood_evacuation'] }, text: 'Rain has soaked the valley for two days. A few residents recognize you from the evacuation you organized before; one waves you toward the hill and asks where your help is needed. The river is over its banks, but the road remains passable for now. A cottage, a stable, and a store all sit close to the water.' },
        { requirements: { historyFlags: ['prioritized_property_in_flood'] }, text: 'Rain has soaked the valley for two days. A storekeeper recognizes you from another hard choice about what to protect and asks plainly what you intend to save this time. The river is already over its banks, but the road and bridge still appear passable.' },
      ],
      choices: [
        { id: 'reachCottageFirst', label: 'Go to the riverside cottage', timeCost: 2, effects: { setFlags: [WINDOW.first] }, next: 'residentFirst' },
        { id: 'reachStableFirst', label: 'Head for the stable', timeCost: 4, effects: { setFlags: [WINDOW.first] }, next: 'livestockFirst' },
        { id: 'reachMarketFirst', label: 'Check the clinic and store', timeCost: 2, effects: { setFlags: [WINDOW.first] }, next: 'marketTriage' },
        { id: 'leaveBeforeCrest', label: 'Take the open road uphill now', hint: 'The bridge is passable, but rain and current are worsening.', effects: { historyFlags: ['abandoned_settlement_before_crest'] }, next: 'earlyEscapeEnding' },
      ],
    },
    marketTriage: {
      id: 'marketTriage', title: 'The Market Block', tone: 'warning',
      text: 'The storekeeper is stacking crates while a clinic volunteer points out the sealed medicine case kept above the low corridor. The rain is pushing water through the market lane. You have time to focus on one of these places before the lower path changes.',
      choices: [
        { id: 'prioritizeMedicineFirst', label: 'Get the clinic medicine to the hill shelter', next: 'medicineFirst' },
        { id: 'prioritizeStoreFirst', label: 'Help brace the store and raise its supplies', next: 'storeFirst' },
        { id: 'leaveMarketEarly', label: 'Leave while the bridge road is clear', effects: { historyFlags: ['abandoned_settlement_before_crest'] }, next: 'earlyEscapeEnding' },
      ],
    },
    waterDeepens: {
      id: 'waterDeepens', title: 'Water over the Low Path', tone: 'warning',
      text: 'Your first effort is behind you. Water now covers the dirt path between the lower homes and the market; rain drums harder on the roofs. There is time for another priority, but not for every one.',
      textVariants: [
        { requirements: { minElapsedMinutes: 26 }, text: 'Your first effort is behind you. The lower lane has become a brown channel carrying branches past the doors. The stable yard and clinic corridor are harder to reach, and the storekeeper is calling people uphill. There is time for one more priority, not all of them.' },
        { requirements: { minElapsedMinutes: 12 }, text: 'Your first effort is behind you. Water has reached the porch steps and the road shoulder is disappearing. The barn path is still open, but it will take longer to cross; the bridge supports groan in the rain.' },
        { requirements: { flags: ['residentSafe'] }, text: 'The resident is on higher ground, but water now covers the path between the cottage and market. A stable, clinic medicine case, and store supplies remain at risk.' },
      ],
      choices: [...missionEntryChoices('second'), { id: 'seekOutsideHelpRising', label: 'Send for the village rescue crew', timeCost: 1, next: 'outsideHelp' }],
    },
    waterCrest: {
      id: 'waterCrest', title: 'The Last Dry Crossing', tone: 'danger',
      text: 'Two places have had your attention. Rainwater now joins the river across the low street, and the bridge road shudders under floating debris. You can make one last attempt elsewhere, call for help, or move toward the hill route before it disappears.',
      textVariants: [{ requirements: { minElapsedMinutes: 42 }, text: 'The river covers the main road. The bridge is still visible, but a support groans each time a tree limb strikes it. The ridge path is narrowing too. You have time for one final attempt, help, or escape—not all three.' }],
      choices: [...missionEntryChoices('last'),
        { id: 'seekOutsideHelpCrest', label: 'Call the rescue crew before routes close', timeCost: 1, next: 'outsideHelp' },
        { id: 'moveToBridge', label: 'Head for the bridge and hill path', hint: 'The supports are shaking; you have been warned the crossing may fail.', timeCost: 2, next: 'aftermathDecision' },
      ],
    },
    residentFirst: taskScene('resident', 'first'), residentSecond: taskScene('resident', 'second'), residentLast: taskScene('resident', 'last'),
    livestockFirst: taskScene('livestock', 'first'), livestockSecond: taskScene('livestock', 'second'), livestockLast: taskScene('livestock', 'last'),
    medicineFirst: taskScene('medicine', 'first'), medicineSecond: taskScene('medicine', 'second'), medicineLast: taskScene('medicine', 'last'),
    storeFirst: taskScene('store', 'first'), storeSecond: taskScene('store', 'second'), storeLast: taskScene('store', 'last'),
    residentFirstOutcome: objectiveOutcome('resident', 'first'), residentSecondOutcome: objectiveOutcome('resident', 'second'), residentLastOutcome: objectiveOutcome('resident', 'last'),
    livestockFirstOutcome: objectiveOutcome('livestock', 'first'), livestockSecondOutcome: objectiveOutcome('livestock', 'second'), livestockLastOutcome: objectiveOutcome('livestock', 'last'),
    medicineFirstOutcome: objectiveOutcome('medicine', 'first'), medicineSecondOutcome: objectiveOutcome('medicine', 'second'), medicineLastOutcome: objectiveOutcome('medicine', 'last'),
    storeFirstOutcome: objectiveOutcome('store', 'first'), storeSecondOutcome: objectiveOutcome('store', 'second'), storeLastOutcome: objectiveOutcome('store', 'last'),
    outsideHelp: {
      id: 'outsideHelp', title: 'A Call across the Rain', tone: 'warning',
      text: 'The village rescue crew is assembling on the far side of the river. A runner can bring them in, but the trip will take a long time. The storekeeper offers two coins for a second hauler and cart; that route is faster, though neither promises what will still be reachable when they arrive.',
      choices: [
        { id: 'payForHauler', label: 'Pay two coins for a faster crew', requirements: { minMoney: 2 }, timeCost: 9, effects: { money: -2, setFlags: ['helpCalled', 'paidFloodHauler'], historyFlags: ['returned_with_flood_help'] }, next: 'crewArrives' },
        { id: 'sendRunner', label: 'Send a runner and wait for the crew', hint: 'No money required, but the river will rise during the wait.', timeCost: 17, effects: { setFlags: ['helpCalled'], historyFlags: ['returned_with_flood_help'] }, next: 'crewArrives' },
      ],
    },
    crewArrives: {
      id: 'crewArrives', title: 'Boats at the Upper Lane', tone: 'warning',
      text: 'The rescue crew arrives with a flat-bottomed boat. They can help organize an evacuation from the higher side, or take you aboard now. There is no time to send them back through the settlement for every animal and crate.',
      textVariants: [{ requirements: { minElapsedMinutes: 42 }, text: 'The rescue crew reaches the upper lane by boat. The lower road and bridge are under water now. They can organize a last evacuation from the high side, or take you aboard; there is no safe trip back for every animal and crate.' }],
      choices: [
        { id: 'organizeFloodEvacuation', label: 'Organize a final evacuation with the crew', timeCost: 5, effects: { setFlags: ['communityEvacuated', 'residentAttempted', 'residentSafe', 'earnedRopeReward'], historyFlags: ['organized_flood_evacuation', 'returned_with_flood_help', 'prioritized_people_in_flood'] }, next: 'thankYouHill' },
        { id: 'boardRescueBoat', label: 'Board the boat and leave the lower settlement', effects: { setFlags: ['personalEvacuated'], historyFlags: ['returned_with_flood_help'] }, next: 'highGroundEnding' },
      ],
    },
    aftermathDecision: {
      id: 'aftermathDecision', title: 'The Bridge in the Current', tone: 'danger',
      text: 'The bridge deck is slick and a support groans beneath the brown water. Branches and broken boards are striking the posts. Crossing is possible, but a rope gives a much better chance; a footpath beside the ridge fence is slower and can still knock you down. You can also try the bridge without a line, knowing it may fail.',
      choices: [
        { id: 'crossWithRope', label: 'Rig your rope across the bridge', hint: 'The rope gives you a guide, but the weakened supports remain dangerous.', requirements: { items: ['travelRope'] }, timeCost: 5, chance: { probability: 0.76, bonusItems: ['ironRopeClamp'], bonusProbability: 0.12, successNext: 'thankYouHill', failureNext: 'bridgeFailure', successMessage: 'The rope holds while you cross above the hard current.', failureMessage: 'A support shears away before you reach the far end.' } },
        { id: 'crossUnroped', label: 'Risk the bridge without a rope', hint: 'The river is striking the supports; a failure could be fatal.', requirements: { notItems: ['travelRope'] }, timeCost: 6, chance: { probability: 0.46, successNext: 'thankYouHill', failureNext: 'bridgeFailure', successMessage: 'You keep to the center and make the hill road.', failureMessage: 'The deck drops beneath the current before you reach the far side.' } },
        { id: 'takeRidgeFootpath', label: 'Follow the slower ridge fence', hint: 'Less exposed than the bridge, but muddy and easy to lose in the rain.', timeCost: 8, chance: { probability: 0.72, successNext: 'thankYouHill', failureNext: 'ridgeSlip', successMessage: 'The fence guides you to the hill road.', failureMessage: 'You slip against the fence and the current knocks you down.', failureEffects: { health: -2, setFlags: ['ridgeEscapeInjured'] } } },
      ],
    },
    ridgeSlip: {
      id: 'ridgeSlip', title: 'The Fence Holds', tone: 'danger',
      text: 'The fence catches your coat before the current can pull you away. You are bruised, soaked, and still below the hill road. The water keeps climbing; crawling along the fence is your last practical route.',
      choices: [{ id: 'crawlAlongFence', label: 'Crawl to the hill road', timeCost: 4, next: 'thankYouHill' }],
    },
    thankYouHill: {
      id: 'thankYouHill', title: 'A Thank-You on the Hill',
      text: 'The settlement’s volunteers are taking stock on higher ground. The rain has not stopped, and the river has decided what will be carried away. You can leave with what you brought, or accept a tool offered for helping your neighbors.',
      textVariants: [
        { requirements: { flags: ['residentSafe', 'livestockSafe'] }, text: 'The resident and the animals are on higher ground. A volunteer thanks you for the time you spent getting them clear and offers a sound rope from the shared rescue kit.' },
        { requirements: { flags: ['medicineSafe', 'storeSafe'] }, text: 'The medicine reached shelter and the store’s upper supplies stayed dry. The storekeeper offers a rope clamp from the repair chest for the work you did.' },
        { requirements: { flags: ['residentSafe'] }, text: 'The resident is warm on the hill. They thank you for choosing the cottage when the lower lane was still passable; the volunteers offer a travel rope from their shared kit.' },
        { requirements: { flags: ['livestockSafe'] }, text: 'The animals are on the ridge field. The stablehand offers you a travel rope, saying it is better used on the next difficult road.' },
        { requirements: { flags: ['medicineSafe'] }, text: 'The clinic medicine is safe at the shelter. A volunteer offers a rope clamp from the repair chest for helping preserve it.' },
        { requirements: { flags: ['storeSafe'] }, text: 'The store’s upper supplies are dry. The storekeeper offers a rope clamp from the repair chest for helping save them.' },
      ],
      choices: [
        { id: 'acceptFloodRope', label: 'Accept a travel rope', requirements: { flags: ['earnedRopeReward'], notItems: ['travelRope'] }, effects: { gainItems: ['travelRope'] }, next: 'highGroundEnding' },
        { id: 'acceptFloodClamp', label: 'Accept an iron rope clamp', requirements: { flags: ['earnedClampReward'], notItems: ['ironRopeClamp'] }, effects: { gainItems: ['ironRopeClamp'] }, next: 'highGroundEnding' },
        { id: 'leaveWithoutFloodGift', label: 'Thank them and leave without a tool', next: 'highGroundEnding' },
      ],
    },
    earlyEscapeEnding: {
      id: 'earlyEscapeEnding', title: 'The Hill before the Crest', ending: 'success',
      text: 'You take the open road uphill before the river closes it. The settlement is still below you in the rain; you do not know what each family managed to save. You survived, and the decision to leave belongs to you.',
      choices: [],
    },
    highGroundEnding: {
      id: 'highGroundEnding', title: 'Above the Waterline', ending: 'success',
      text: 'You reach the hill as the river spreads across the lower road. The settlement is not untouched, and no one claims every loss could have been prevented. You saved what your remaining time allowed and found a way out.',
      textVariants: [
        { requirements: { flags: ['residentSafe', 'livestockSafe', 'medicineSafe'] }, text: 'The resident is warm, the animals are on the ridge, and the medicine reaches the shelter. The general store’s lower stock is lost. You saved what the remaining time allowed; no one calls the outcome perfect.' },
        { requirements: { flags: ['residentSafe', 'livestockSafe', 'storeSafe'] }, text: 'The resident is safe, the animals reach high ground, and the store’s upper supplies remain dry. The clinic medicine is lost to the flooded corridor. You saved what your remaining time allowed.' },
        { requirements: { flags: ['residentSafe', 'medicineSafe', 'storeSafe'] }, text: 'The resident reaches shelter, the clinic medicine is dry, and the store’s upper crates hold. The stable was too far to reach again. The settlement will have to rebuild what the river took.' },
        { requirements: { flags: ['livestockSafe', 'medicineSafe', 'storeSafe'] }, text: 'The animals reach the ridge, the medicine reaches the shelter, and the store’s upper supplies remain dry. Neighbors say the cottage family took the higher lane without waiting for help. No one could save every place.' },
        { requirements: { flags: ['communityEvacuated'] }, text: 'The crew carries residents to the upper lane and organizes the last evacuation. The animals and lower supplies remain behind, but people reach shelter together.' },
        { requirements: { flags: ['residentSafe', 'medicineSafe'] }, text: 'The resident reaches shelter with you, and the clinic medicine is dry. The store and stable take the worst of the flood.' },
        { requirements: { flags: ['residentSafe', 'storeSafe'] }, text: 'The resident is safe and the store’s upper crates hold. The medicine and stable are lost to the rising water.' },
        { requirements: { flags: ['livestockSafe', 'medicineSafe'] }, text: 'The animals reach the ridge and the medicine reaches the hill shelter. The cottage and store are left to the flood crew.' },
        { requirements: { flags: ['livestockSafe', 'storeSafe'] }, text: 'The stable animals are safe and the store’s upper supplies survive. The clinic and riverside home are beyond your reach.' },
        { requirements: { flags: ['medicineSafe', 'storeSafe'] }, text: 'The medicine and upper store supplies survive the flood. The stable and riverside home are left for the crew to search.' },
        { requirements: { flags: ['residentSafe'] }, text: 'The resident is with you on the hill. The river keeps rising around the places you could not reach.' },
        { requirements: { flags: ['livestockSafe'] }, text: 'The animals are safe on the ridge. The river keeps rising around the places you could not reach.' },
        { requirements: { flags: ['medicineSafe'] }, text: 'The clinic’s medicine reaches shelter. The river keeps rising around the places you could not reach.' },
        { requirements: { flags: ['storeSafe'] }, text: 'The store’s upper supplies stay dry. The river keeps rising around the places you could not reach.' },
      ],
      choices: [],
    },
    bridgeFailure: {
      id: 'bridgeFailure', title: 'The Bridge Gives Way', ending: 'death', tone: 'danger',
      text: 'The weakened bridge breaks beneath the flood current. The choice was warned as dangerous, and the river leaves no way back to the hill.',
      choices: [],
    },
  },
};
