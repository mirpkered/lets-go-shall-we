import type { Scenario } from '../types';

const SIGNAL_GEAR = ['conductorWhistle', 'trailWhistle', 'farmWhistle', 'roadsideSignalMirror'];
const ROPE_GEAR = ['travelRope', 'ironRopeClamp', 'freightmansStrap', 'heavyLeatherGloves'];
const WARM_GEAR = ['weatherproofBlanket', 'woolTravelBlanket', 'weatherproofCloak'];

export const UNDER_THE_ICE: Scenario = {
  id: 'under-the-ice',
  title: 'Under the Ice',
  subtitle: 'Someone is in the water. The shore beneath your feet is still solid.',
  startScene: 'lakeShore',
  timePhases: [
    { id: 'calling', label: 'Calling for Help', atMinutes: 0 },
    { id: 'losingStrength', label: 'Losing Strength', atMinutes: 4 },
    { id: 'goingNumb', label: 'Going Numb', atMinutes: 8 },
    { id: 'submerging', label: 'Going Under', atMinutes: 12 },
  ],
  runRandomSelections: [
    { id: 'victim', values: ['Imogen', 'Lucette', 'Bram', 'Calder', 'Odette', 'Pella', 'Gideon', 'Veda', 'Ferris', 'Wilma'].map((value) => ({ value })) },
    { id: 'iceCondition', values: [{ value: 'thickNearShore' }, { value: 'windy' }, { value: 'weakShelf' }] },
  ],
  scenes: {
    lakeShore: {
      id: 'lakeShore', title: 'A Crack Across the Lake', tone: 'danger',
      text: 'You are on firm ground at the north shore. About twenty feet out, a traveler has fallen through the ice. They are conscious, gasping their name—{{victim}}—while gripping the ragged edge. The ice between you is split; no one else is in sight. A farmhouse with a warm room lies several minutes up the farm lane. You are safe where you stand.',
      textVariants: [
        { requirements: { minElapsedMinutes: 8 }, text: 'From firm ground at the north shore, you can still see {{victim}} in the ragged hole about twenty feet out. Their arms shake, and the water has reached their shoulders. The cracked ice is no safer. You remain on solid shore.' },
        { requirements: { minElapsedMinutes: 4 }, text: 'You remain safe on the north shore. {{victim}} still grips the ragged hole twenty feet out, but their arms are shaking and their replies come slowly. Cracks cross the ice between you.' },
        { requirements: { selections: { iceCondition: 'windy' } }, text: 'You stand on firm ground at the north shore. A conscious traveler named {{victim}} is in open water about twenty feet out, gripping a ragged hole. Wind carries their calls away from the farm lane. The ice between you is split, but you are safe on shore.' },
        { requirements: { selections: { iceCondition: 'weakShelf' } }, text: 'You stand on firm ground at the north shore. A traveler named {{victim}} has fallen through about twenty feet out. The ice around the hole is thin and sagging, with cracks reaching toward land. They are conscious and holding the edge. You are safe on shore; a farmhouse is several minutes up the lane.' },
      ],
      choices: [
        {
          id: 'throwTravelRope', label: 'Throw your rope from solid ground', hint: 'The line can reach the hole from shore. A clamp or strap may help it hold.',
          requirements: { items: ['travelRope'] }, timeCost: 1,
          chance: { probability: 0.72, lateProbability: 0.52, lateAfterMinutes: 8, bonusItems: ['ironRopeClamp', 'freightmansStrap', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'ropeTaut', failureNext: 'ropeMiss', successMessage: 'The loop lands within reach. {{victim}} catches it, and you stay on firm ground.', failureMessage: 'The line falls short and skitters across wet ice. {{victim}} is still holding on.' },
        },
        {
          id: 'crawlTowardVictim', label: 'Crawl toward {{victim}}', hint: 'The ice is visibly split. It may break beneath you; gloves help you grip but cannot make it safe.', timeCost: 2,
          chance: { probability: 0.55, lateProbability: 0.34, lateAfterMinutes: 4, bonusItems: ['heavyLeatherGloves', 'icehouseTongs', 'drainageHook'], bonusProbability: 0.1, bonusSelections: { iceCondition: 'thickNearShore' }, penaltySelections: { iceCondition: 'weakShelf' }, penaltyProbability: 0.18, successNext: 'atTheHole', failureNext: 'throughTheIce', successMessage: 'You spread your weight and reach the firmer edge beside the hole. Cracks travel under your elbows.', failureMessage: 'The shelf snaps beneath you. Cold water closes over your legs before you catch the broken edge.' , failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } },
        },
        {
          id: 'runForHelp', label: 'Run to the farm lane and call for help', hint: 'You stay off the ice, but a rescuer must still reach the lake. A whistle or mirror carries farther.', timeCost: 3,
          chance: { probability: 0.3, lateProbability: 0.18, lateAfterMinutes: 4, bonusItems: SIGNAL_GEAR, bonusProbability: 0.42, penaltySelections: { iceCondition: 'windy' }, penaltyProbability: 0.12, successNext: 'helpHeard', failureNext: 'helpUnheard', successMessage: 'A figure answers from the lane and runs toward the lake with a long fence rail.', failureMessage: 'No one answers. The lane is empty, and {{victim}} is still in the water.', successEffects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_instead_of_direct_rescue'] } },
        },
        { id: 'leaveTheLake', label: 'Back away and leave the lake', hint: 'You remain safe. The farm lane is too far for help to arrive in time without someone calling first.', next: 'victimLostEnding', effects: { historyFlags: ['chose_personal_safety_at_ice'] } },
      ],
    },
    ropeTaut: {
      id: 'ropeTaut', title: 'The Line Holds', tone: 'warning',
      text: '{{victim}} has the rope around one arm. You brace on the firm shore and begin drawing them toward you. The line is wet, and each pull drags their chest across the fractured edge. A sudden jerk could break the ice or burn through your grip.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: '{{victim}} still grips the line, but their hands are slowing. You are anchored on shore; one hard pull may bring them clear, while a slip could lose the rope.' }],
      choices: [
        { id: 'haulFromShore', label: 'Pull {{victim}} toward the bank', hint: 'You stay on solid ground. The wet line and broken ice make the pull uncertain.', timeCost: 2, chance: { probability: 0.75, lateProbability: 0.47, lateAfterMinutes: 8, bonusItems: ['ironRopeClamp', 'freightmansStrap', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'afterExtraction', failureNext: 'ropeMiss', successMessage: 'The line stays firm. {{victim}} slides over the edge onto the bank.', failureMessage: 'The rope jerks free. You stay on shore, but {{victim}} slips back against the hole.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] }, failureEffects: { setFlags: ['ropeFailed'] } } },
        { id: 'backAwayFromRope', label: 'Let the line go and retreat', hint: 'You remain safe, but {{victim}} cannot hold the edge much longer.', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    ropeMiss: {
      id: 'ropeMiss', title: 'The Rope Falls Short', tone: 'danger',
      text: 'You remain on firm ground. The first throw missed, and {{victim}} has lost some strength keeping hold of the ice. The line is still in your hands; you can try again, but every pull and throw takes time.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'You are safe on shore, but {{victim}} can barely keep their chin above the water. The rope missed again; the next attempt may be the last.' }],
      choices: [
        { id: 'retryRope', label: 'Throw the rope again from shore', requirements: { items: ['travelRope'] }, timeCost: 1, chance: { probability: 0.64, lateProbability: 0.36, lateAfterMinutes: 8, bonusItems: ['ironRopeClamp', 'freightmansStrap', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'afterExtraction', failureNext: 'ropeMissAgain', successMessage: 'The hook catches near {{victim}}. You keep hold of the line and draw them onto shore.', failureMessage: 'The hook skips away across the wet ice.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] } } },
        { id: 'crawlAfterRopeMiss', label: 'Crawl toward them despite the cracks', hint: 'The shelf is thinner near the hole; it can break under you.', timeCost: 2, chance: { probability: 0.42, lateProbability: 0.22, lateAfterMinutes: 4, bonusItems: ['heavyLeatherGloves', 'icehouseTongs', 'drainageHook'], bonusProbability: 0.1, penaltySelections: { iceCondition: 'weakShelf' }, penaltyProbability: 0.15, successNext: 'atTheHole', failureNext: 'throughTheIce', successMessage: 'You inch to the hole. The shelf cracks beneath your weight.', failureMessage: 'The ice gives way before you reach {{victim}}.', failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } } },
        { id: 'retreatAfterMiss', label: 'Stop and leave the rescue to others', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    ropeMissAgain: {
      id: 'ropeMissAgain', title: 'A Weakening Grip', tone: 'danger',
      text: 'The second throw misses. {{victim}} is still visible, but their fingers keep sliding from the rim. Your rope remains usable. The farm lane is behind you; you cannot wait long and still reach them.',
      choices: [
        { id: 'lastRopeThrow', label: 'Make one last throw from the bank', requirements: { items: ['travelRope'] }, timeCost: 1, chance: { probability: 0.56, lateProbability: 0.28, lateAfterMinutes: 8, bonusItems: ['ironRopeClamp', 'freightmansStrap'], bonusProbability: 0.12, successNext: 'afterExtraction', failureNext: 'victimLostEnding', successMessage: 'The hook catches. {{victim}} closes both hands around the rope, and you pull them onto shore.', failureMessage: 'The line lands beyond reach. {{victim}} slips beneath the water.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] } } },
        { id: 'leaveAfterTwoMisses', label: 'Get yourself off the ice and leave', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    helpHeard: {
      id: 'helpHeard', title: 'Someone Is Coming', tone: 'warning',
      text: 'A farmer has heard you and is running down the lane with a long fence rail. They are not at the shore yet. {{victim}} is still conscious, but their grip is weakening. You can wait on firm ground or risk the ice while help is on the way.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'The farmer is still running toward the lake with the fence rail. {{victim}} now answers only with a faint movement. You are safe on shore, but waiting longer may close the rescue window.' }],
      choices: [
        { id: 'waitForFarmer', label: 'Wait on shore for the farmer', hint: 'The farmer can reach you in a few minutes; {{victim}} may not have that long.', timeCost: 4, next: 'farmerArrives', effects: { setFlags: ['farmerAtShore'] } },
        { id: 'crawlWhileHelpRuns', label: 'Crawl out before the farmer arrives', hint: 'The ice is split. A fall could leave both of you in the water.', timeCost: 1, chance: { probability: 0.48, lateProbability: 0.27, lateAfterMinutes: 8, bonusItems: ['heavyLeatherGloves', 'icehouseTongs', 'drainageHook'], bonusProbability: 0.1, penaltySelections: { iceCondition: 'weakShelf' }, penaltyProbability: 0.15, successNext: 'atTheHole', failureNext: 'throughTheIce', successMessage: 'You reach the edge while the farmer closes the distance.', failureMessage: 'The ice breaks beneath your chest.', failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } } },
        { id: 'leaveWhileHelpRuns', label: 'Leave before the farmer reaches the lake', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    helpUnheard: {
      id: 'helpUnheard', title: 'No Answer from the Lane', tone: 'danger',
      text: 'You reach the open lane, but no one answers your call. You are still on firm ground. {{victim}} is farther out on the lake, shivering at the broken edge. A farmhouse lies beyond the bend; running there would take longer.',
      choices: [
        { id: 'runToFarmhouse', label: 'Run farther and bring someone back', hint: 'This is safer for you, but the round trip will take several minutes.', timeCost: 5, next: 'farmerArrivesLate', effects: { setFlags: ['farmerAtShore', 'helpSummoned'], historyFlags: ['sought_help_instead_of_direct_rescue'] } },
        { id: 'returnToIce', label: 'Return to the shore and crawl out', hint: 'The shelf is already cracked; going out may put you through.', timeCost: 1, chance: { probability: 0.38, lateProbability: 0.2, lateAfterMinutes: 8, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'atTheHole', failureNext: 'throughTheIce', successMessage: 'You spread your weight and reach the ragged hole.', failureMessage: 'A crack opens beneath you and the ice gives way.', failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } } },
        { id: 'leaveAfterUnheard', label: 'Stay on shore and leave', next: 'victimLostEnding', effects: { historyFlags: ['chose_personal_safety_at_ice'] } },
      ],
    },
    farmerArrives: {
      id: 'farmerArrives', title: 'A Rail from the Shore', tone: 'warning',
      text: 'The farmer reaches the north bank and lies flat on firm ground, pushing a long fence rail toward {{victim}}. You stay beside them on shore. The rail can reach the hole, but the far end is slick and the ice around it is breaking apart.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'The farmer lies flat on shore with the fence rail. {{victim}} is barely moving now. The rail may reach, but the ice near the hole is buckling.' }],
      choices: [
        { id: 'pullWithFarmer', label: 'Pull the rail together from shore', hint: 'You both stay on firm ground, but the slick rail may slip away.', timeCost: 1, chance: { probability: 0.66, lateProbability: 0.36, lateAfterMinutes: 8, bonusItems: ['travelRope', 'ironRopeClamp', 'freightmansStrap'], bonusProbability: 0.1, successNext: 'afterExtraction', failureNext: 'victimLostEnding', successMessage: 'The farmer braces the rail as you pull. {{victim}} slides onto firm ground.', failureMessage: 'The rail slips from {{victim}}’s hands. You and the farmer stay safe on shore.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] } } },
        { id: 'crawlWithFarmerHoldingLine', label: 'Crawl out while the farmer holds your belt', hint: 'A second person can pull you back, but the ice may still break beneath you.', timeCost: 1, chance: { probability: 0.52, lateProbability: 0.3, lateAfterMinutes: 8, bonusItems: ['heavyLeatherGloves', 'travelRope', 'freightmansStrap'], bonusProbability: 0.12, penaltySelections: { iceCondition: 'weakShelf' }, penaltyProbability: 0.12, successNext: 'atTheHole', failureNext: 'throughTheIce', successMessage: 'The farmer keeps hold as you reach the hole.', failureMessage: 'The shelf drops. The farmer cannot keep you from falling through.', failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } } },
        { id: 'leaveWithFarmer', label: 'Leave the lake with the farmer', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    farmerArrivesLate: {
      id: 'farmerArrivesLate', title: 'Too Much Lost Time', tone: 'danger',
      text: 'You return with a farmer and the fence rail, but {{victim}} has slipped beneath the surface. The farmer keeps you on firm ground while they search the hole. No one asks you to step onto the broken ice.',
      choices: [
        { id: 'stayWithFarmer', label: 'Stay on shore and help search', next: 'victimLostEnding', effects: { historyFlags: ['sought_help_instead_of_direct_rescue'] } },
        { id: 'leaveAfterLateHelp', label: 'Leave the lake with the farmer', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
      ],
    },
    atTheHole: {
      id: 'atTheHole', title: 'At the Broken Edge', tone: 'danger',
      text: 'You are flat on the ice at the hole’s edge. {{victim}} can reach your hands. Cracks spread beneath your chest, and the shelf is sagging into dark water. One more movement may put you through. You can still back toward solid shore.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'At the broken edge, you reach {{victim}}. Their hands are numb and your arms are shaking. The shelf is sagging. Another pull may save them—or break the ice beneath both of you.' }],
      choices: [
        { id: 'pullVictimToShore', label: 'Pull {{victim}} onto the stable shelf', hint: 'The shelf is cracking under you both. You may fall through before reaching shore.', timeCost: 1, chance: { probability: 0.62, lateProbability: 0.36, lateAfterMinutes: 8, bonusItems: ['heavyLeatherGloves', 'freightmansStrap', 'travelRope'], bonusProbability: 0.12, bonusSelections: { iceCondition: 'thickNearShore' }, penaltySelections: { iceCondition: 'weakShelf' }, penaltyProbability: 0.14, successNext: 'afterExtraction', failureNext: 'rescueSlipping', successMessage: 'You roll {{victim}} onto firmer ice and drag them toward shore.', failureMessage: 'The shelf collapses a little farther. You catch the broken edge, but {{victim}} is slipping away.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['risked_life_on_thin_ice', 'rescued_person_from_ice'] }, failureEffects: { health: -2, historyFlags: ['risked_life_on_thin_ice'] } } },
        { id: 'retreatFromCracks', label: 'Back away while you still can', hint: 'This saves you from the weakening shelf. {{victim}} may not survive the delay.', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
        { id: 'pushVictimClear', label: 'Shove them clear, even if the shelf breaks', hint: 'This is a desperate last move. You may save {{victim}} at the cost of your own life; failure may take both of you.', timeCost: 1, chance: { probability: 0.24, lateProbability: 0.12, lateAfterMinutes: 8, successNext: 'playerDiesVictimLives', failureNext: 'bothDie', successMessage: 'You shove {{victim}} onto the stable shelf as the ice breaks beneath you.', failureMessage: 'The shelf gives way before either of you reaches firm ground.', successEffects: { setFlags: ['victimWasPushedClear'] } } },
      ],
    },
    rescueSlipping: {
      id: 'rescueSlipping', title: 'The Shelf Is Giving Way', tone: 'danger',
      text: 'You are still on the ice, but the hole has widened beneath you. {{victim}} is losing their grip. Cracks run toward the north bank; you can still back away, though you may not get another chance to reach them.',
      choices: [
        { id: 'retreatFromSlippingShelf', label: 'Back away to the firm shore', next: 'victimLostEnding', effects: { historyFlags: ['retreated_from_ice_rescue'] } },
        { id: 'oneLastPull', label: 'Make one last pull for {{victim}}', hint: 'Your own footing is nearly gone. You may fall through if the pull fails.', timeCost: 1, chance: { probability: 0.4, lateProbability: 0.22, lateAfterMinutes: 8, bonusItems: ['travelRope', 'freightmansStrap', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'afterExtraction', failureNext: 'throughTheIce', successMessage: 'With a final pull, you slide {{victim}} onto firmer ice.', failureMessage: 'The shelf breaks beneath you. You fall into the lake beside {{victim}}.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['risked_life_on_thin_ice', 'rescued_person_from_ice'] }, failureEffects: { health: -2 } } },
        { id: 'sacrificeForVictim', label: 'Push them clear and abandon your footing', hint: 'A desperate move with a real chance that both of you die.', timeCost: 1, chance: { probability: 0.2, lateProbability: 0.1, lateAfterMinutes: 8, successNext: 'playerDiesVictimLives', failureNext: 'bothDie', successMessage: 'You force {{victim}} onto the stable shelf. The ice breaks beneath you.', failureMessage: 'The shelf breaks before you can move {{victim}} clear.', successEffects: { setFlags: ['victimWasPushedClear'] } } },
      ],
    },
    throughTheIce: {
      id: 'throughTheIce', title: 'Cold Water', tone: 'danger',
      text: 'You have fallen through near the hole and caught the ragged edge with both hands. Your legs are numb in the water. {{victim}} is still within reach, but the ice around you is breaking. The solid bank is behind you; one more desperate movement could kill you.',
      choices: [
        { id: 'fightTowardBank', label: 'Kick toward the near shore', hint: 'You may pull yourself out and survive while {{victim}} slips under; if your grip fails, you may not survive the water.', timeCost: 1, chance: { probability: 0.68, lateProbability: 0.42, lateAfterMinutes: 8, bonusItems: ['travelRope', 'ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'victimLostEnding', failureNext: 'playerDiesVictimLives', successMessage: 'You claw onto the solid bank. {{victim}} disappears beneath the broken ice.', failureMessage: 'Your grip fails and the water closes over your head. {{victim}} is still alive at the edge when someone reaches the lake.', successEffects: { historyFlags: ['survived_fall_through_ice'] } } },
        { id: 'pushVictimFromWater', label: 'Push {{victim}} onto the shelf at any cost', hint: 'This is an extreme risk. You may save them and die, or both of you may go under.', timeCost: 1, chance: { probability: 0.27, lateProbability: 0.14, lateAfterMinutes: 8, successNext: 'playerDiesVictimLives', failureNext: 'bothDie', successMessage: 'You push {{victim}} onto the shelf. Your hands lose the edge as they reach safety.', failureMessage: 'The shelf breaks apart before {{victim}} can reach it.', successEffects: { setFlags: ['victimWasPushedClear'] } } },
      ],
    },
    afterExtraction: {
      id: 'afterExtraction', title: 'Back on Solid Ground', tone: 'warning',
      text: '{{victim}} is out of the water, but can barely answer. You are both on the north bank, away from the broken ice. Wet clothes and wind are draining their strength. A warm shelter lies up the farm lane; getting there quickly matters.',
      choices: [
        { id: 'wrapAndShelter', label: 'Wrap them and reach the nearby shelter', hint: 'A dry blanket or windproof cloak slows exposure; it is not a cure for the cold.', requirements: { anyItems: WARM_GEAR }, timeCost: 2, next: 'bothSurvive', effects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] } },
        { id: 'carryToShelter', label: 'Carry them to the settlement', hint: 'They are weak and soaked. A blanket or cloak improves the chance they survive the walk.', timeCost: 4, chance: { probability: 0.7, lateProbability: 0.5, lateAfterMinutes: 8, bonusItems: WARM_GEAR, bonusProbability: 0.16, successNext: 'bothSurvive', failureNext: 'victimLostEnding', successMessage: 'You reach the heated lakeside house before the cold takes {{victim}}’s strength.', failureMessage: '{{victim}} stops responding before the settlement can warm them.', successEffects: { setFlags: ['victimExtracted'], historyFlags: ['rescued_person_from_ice'] }, failureEffects: { setFlags: ['victimExtracted'] } } },
        { id: 'seekImmediateShelter', label: 'Get inside the nearest farm shed', hint: 'The shed blocks the wind, but it has no fire. The cold remains serious.', timeCost: 2, chance: { probability: 0.62, lateProbability: 0.43, lateAfterMinutes: 8, bonusItems: WARM_GEAR, bonusProbability: 0.14, successNext: 'bothSurvive', failureNext: 'victimLostEnding', successMessage: 'The shed blocks the wind while the farmer brings dry clothes and heat.', failureMessage: 'The shed is too cold to warm {{victim}} in time.', successEffects: { setFlags: ['victimExtracted'] }, failureEffects: { setFlags: ['victimExtracted'] } } },
      ],
    },
    victimLostEnding: {
      id: 'victimLostEnding', title: 'The Lake Keeps Its Silence', tone: 'warning', ending: 'success', choices: [],
      text: 'You remain alive on the north shore. {{victim}} does not come back above the water. The lane is empty, and the lake grows quiet around the broken ice. There is no blame in what happened, only the cold fact of it.',
      textVariants: [
        { requirements: { flags: ['victimExtracted', 'farmerAtShore'] }, text: '{{victim}} was pulled onto the north bank, but the cold took them before the farmhouse could warm them. The farmer stays beside you, away from the broken ice. This was exposure after rescue, not a drowning beneath the shelf.' },
        { requirements: { flags: ['victimExtracted'] }, text: '{{victim}} was pulled onto the north bank, but the cold took them before the farmhouse could warm them. The rescue succeeded; the exposure afterward did not.' },
        { requirements: { flags: ['farmerAtShore'] }, text: 'You remain alive on the north shore. {{victim}} does not come back above the water. The farmer stays beside you, keeping both of you away from the broken ice. There is no blame in what happened, only the cold fact of it.' },
      ],
    },
    bothSurvive: {
      id: 'bothSurvive', title: 'Warmth on the Shore', tone: 'safe', ending: 'success', choices: [],
      text: '{{victim}} is wrapped and breathing beside the stove in the farmhouse. You sit nearby until warmth returns to your hands. Outside, the lake continues cracking beyond the window, but both of you are on solid ground.',
    },
    playerDiesVictimLives: {
      id: 'playerDiesVictimLives', title: 'One Reaches the Shore', tone: 'danger', ending: 'death', choices: [],
      text: 'Someone reaches the lake in time to pull {{victim}} from the edge. You do not make it back from the broken ice.',
      textVariants: [{ requirements: { flags: ['victimWasPushedClear'] }, text: '{{victim}} reaches the firm shelf and crawls toward land. You do not make it back from the broken ice. Their voice is the last thing you hear before the lake swallows every other sound.' }],
    },
    bothDie: {
      id: 'bothDie', title: 'The Ice Gives Way', tone: 'danger', ending: 'death', choices: [],
      text: 'The broken shelf collapses beneath both of you. The dark water closes over the hole before anyone can reach it.',
    },
  },
};
