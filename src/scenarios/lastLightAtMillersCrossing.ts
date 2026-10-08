import type { Choice, Scenario } from '../types';

const REPAIR_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'compactWheelWrench', 'bridgewrightHammer'];

function repairChoice(withTool: boolean): Choice {
  return {
    id: withTool ? 'braceWheelWithTool' : 'tryToBraceWheelByHand',
    label: withTool ? 'Brace the wheel with your carried tool' : 'Try to brace the wheel by hand',
    hint: withTool ? 'A proper lever can keep the cracked hub from shifting.' : 'The wagon is tilted on a loose rut; the hub may slip while you work.',
    requirements: withTool ? { anyItems: REPAIR_TOOLS } : { notItems: REPAIR_TOOLS },
    timeCost: withTool ? 4 : 8,
    chance: {
      probability: withTool ? 0.9 : 0.62,
      bonusItems: withTool ? ['heavyLeatherGloves'] : ['heavyLeatherGloves'],
      bonusProbability: 0.06,
      successNext: 'wheelBraced',
      failureNext: 'wheelStrain',
      successMessage: withTool ? 'The lever seats a block beneath the axle. The wheel will hold for a short move.' : 'You wedge a timber beneath the axle, though the hub still creaks under strain.',
      failureMessage: 'The timber shifts. You wrench your wrist clear as the wagon settles back into the rut.',
      failureEffects: { health: -1 },
    },
  };
}

function ditchChoice(withRope: boolean): Choice {
  return {
    id: withRope ? 'descendDitchWithRope' : 'descendDitchCarefully',
    label: withRope ? 'Secure the rope and descend' : 'Climb down the loose bank carefully',
    hint: withRope ? 'The wet slope is steep, but the line gives you a way back.' : 'Loose stones and fading light make the bank a real risk.',
    requirements: withRope ? { items: ['travelRope'] } : { notItems: ['travelRope'] },
    timeCost: withRope ? 5 : 7,
    chance: {
      probability: withRope ? 0.9 : 0.61,
      bonusItems: ['heavyLeatherGloves'],
      bonusProbability: 0.08,
      successNext: 'travelerFound',
      failureNext: 'slopeSlip',
      successMessage: 'You reach a narrow shelf below the road, where a traveler answers from behind the reeds.',
      failureMessage: 'The bank slumps under your boot. You catch a root before the ditch bottom, but take a hard knock.',
      successEffects: { setFlags: ['foundAtDitch'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] },
      failureEffects: { health: -1 },
    },
  };
}

function rewardChoices(): Choice[] {
  return [
    { id: 'acceptCompactWheelWrench', label: 'Take the compact wheel wrench', requirements: { notItems: ['compactWheelWrench'] }, effects: { gainItems: ['compactWheelWrench'] }, next: 'bothSafeEnding' },
    { id: 'acceptFoldingTrailMarker', label: 'Take the folding trail marker', requirements: { notItems: ['foldingTrailMarker'] }, effects: { gainItems: ['foldingTrailMarker'] }, next: 'bothSafeEnding' },
    { id: 'declineRoadsideReward', label: 'Thank them and travel on without a reward', next: 'bothSafeEnding' },
  ];
}

export const LAST_LIGHT_AT_MILLERS_CROSSING: Scenario = {
  id: 'last-light-at-millers-crossing',
  title: 'Last Light at Miller’s Crossing',
  subtitle: 'A broken wheel, a missing traveler, and a road going dark.',
  startScene: 'crossroads',
  timePhases: [
    { id: 'late-afternoon', label: 'Late Afternoon', atMinutes: 0 },
    { id: 'dusk', label: 'Dusk', atMinutes: 12 },
    { id: 'last-light', label: 'Last Light', atMinutes: 24 },
    { id: 'dark', label: 'Dark', atMinutes: 34 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 46 },
  ],
  scenes: {
    crossroads: {
      id: 'crossroads', title: 'Miller’s Crossing', tone: 'warning',
      text: 'The sun hangs low over a three-way rural crossing. An overloaded wagon lies on its side beside the ditch; a wheel is half-buried in the road, and sacks and a small travel case are scattered nearby. One traveler, Hal, sits against the post with a cut brow and a stiff leg. His companion Mara is nowhere in sight. “We can’t stay until dark,” he says. “She may have been thrown clear.” The wheel, the road, and the footprints all offer different stories.',
      textVariants: [{ requirements: { historyFlags: ['searched_for_missing_traveler'] }, text: 'You have searched for a missing traveler before; the memory returns as you reach Miller’s Crossing. An overturned wagon lies beside the ditch, one wheel half-buried in the road. Hal is hurt; his companion Mara is missing. “We can’t stay until dark,” he says. “She may have been thrown clear.” The wheel, road, and footprints offer different stories.' }],
      choices: [
        { id: 'helpHalFirst', label: 'Check Hal’s injuries', hint: 'He is conscious, but the road is getting colder and dimmer.', timeCost: 4, next: 'halStabilized', effects: { historyFlags: ['joined_crossroads_search'] } },
        { id: 'inspectWagonFirst', label: 'Inspect the overturned wagon', timeCost: 4, next: 'wagonEvidence', effects: { historyFlags: ['joined_crossroads_search'] } },
        { id: 'callForMara', label: 'Call for the missing traveler', timeCost: 2, next: 'roadsideCall', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'continuePastCrossing', label: 'Continue on before dark', next: 'walkAwayEnding', effects: { historyFlags: ['abandoned_crossroads_search'] } },
      ],
    },
    halStabilized: {
      id: 'halStabilized', title: 'The Injured Driver', tone: 'warning',
      text: 'Hal can stand with help. His leg is bruised, not broken, and he can speak clearly. He says the wagon lurched at the crossing and Mara must have fallen from it. He keeps glancing toward the old tollpost on the eastern road. Shadows are lengthening.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'Hal can stand with help, though his leg is badly stiff. His story remains that Mara fell from the wagon; he keeps glancing toward the old tollpost. The eastern prints are already difficult to distinguish.' }],
      choices: [
        { id: 'carryHalWithStretcher', label: 'Carry Hal to the farmhouse on your Folding Field Stretcher', requirements: { items: ['foldingFieldStretcher'] , usableItems: ['foldingFieldStretcher']}, hint: 'A second pair of hands is still needed to lift him safely.', timeCost: 12, next: 'farmhouse', effects: { setFlags: ['survivorEscorted', 'stretcherUsedForHal'], historyFlags: ['escorted_injured_traveler', 'returned_for_help'] } },
        { id: 'askHalWhatHappened', label: 'Ask Hal to explain the crash', timeCost: 3, next: 'halTestimony' },
        { id: 'inspectWagonWithHal', label: 'Check the wheel and scattered cargo', timeCost: 4, next: 'wagonEvidence' },
        { id: 'escortHalToFarm', label: 'Walk Hal to the nearby farmhouse', hint: 'It is safer for him there, but the detour will cost daylight.', timeCost: 10, next: 'farmhouse', effects: { setFlags: ['survivorEscorted'], historyFlags: ['escorted_injured_traveler', 'returned_for_help'] } },
        { id: 'pointHalTowardFarmAndLeave', label: 'Point Hal toward the farm and continue on', hint: 'He can walk with support; the nearby family can take over.', timeCost: 1, next: 'walkAwayEnding', effects: { setFlags: ['helpedHalThenLeft'], historyFlags: ['abandoned_crossroads_search'] } },
      ],
    },
    roadsideCall: {
      id: 'roadsideCall', title: 'A Voice in the Wind', tone: 'warning',
      text: 'Your call carries beyond the crossing, then fades into the tree line. No one answers. A light cloth is snagged on a low fence near the eastern track; beyond it, the road bends toward an old tollpost. Hal says the sound may have been the wind, though he is not looking at the fence.',
      choices: [
        { id: 'followClothTowardTollpost', label: 'Check the cloth and eastern tracks', timeCost: 5, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'checkDitchAfterCall', label: 'Search the ditch below the wagon', timeCost: 4, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'helpHalAfterCalling', label: 'Return to Hal and check his injuries', timeCost: 2, next: 'halStabilized' },
      ],
    },
    wagonEvidence: {
      id: 'wagonEvidence', title: 'The Wagon on Its Side', tone: 'warning',
      text: 'One side of the wagon is crushed against the road bank. The exposed wheel is cracked, but the break is partly hidden under mud. A leather travel case is missing its clasp; several small bootprints leave the road, while deeper scuffs cross the ditch. Either person could have walked away, or been thrown clear.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The road shadows have swallowed the smaller prints. The cracked wheel is still visible, and the travel case lies open. Scuffs descend toward the ditch; a thinner line of bootprints leads east to the old tollpost.' }],
      choices: [
        { id: 'inspectHubWithTool', label: 'Inspect the wheel hub with your tool', requirements: { anyItems: REPAIR_TOOLS }, hint: 'The tool can clear mud from the split without shifting the wagon.', timeCost: 3, next: 'mechanicalInspection', effects: { setFlags: ['identifiedBrokenHub'], knowledge: ['The wheel hub split at the road rut; the wagon damage is consistent with an accident.'] } },
        { id: 'inspectHubByHand', label: 'Clear mud from the wheel by hand', requirements: { notItems: REPAIR_TOOLS }, timeCost: 5, next: 'mechanicalInspection', effects: { setFlags: ['identifiedBrokenHub'], knowledge: ['The wheel hub split at the road rut; the wagon damage is consistent with an accident.'] } },
        { id: 'retrieveCaseWithHook', label: 'Use your hook to retrieve the case from the ditch', requirements: { items: ['ratCatchersHook'] }, timeCost: 2, next: 'cargoEvidence', effects: { knowledge: ['The travel case was dragged toward the ditch, but no clear sign says whether it was stolen.'] } },
        { id: 'readTracksByCargo', label: 'Follow the scattered cargo and bootprints', requirements: { notItems: ['ratCatchersHook'] }, timeCost: 5, next: 'trackFork', effects: { historyFlags: ['searched_for_missing_traveler'] } },
      ],
    },
    cargoEvidence: {
      id: 'cargoEvidence', title: 'The Open Travel Case', tone: 'warning',
      text: 'The case is empty except for a torn paper wrapper. Its clasp broke outward, but the muddy marks around it overlap the wagon’s own tracks. A hurried passenger could have dropped it; so could someone searching the wreck. The clue raises a theft theory without proving one.',
      choices: [
        { id: 'followCargoMarksToDitch', label: 'Check the scuffs below the road', timeCost: 4, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'followCargoMarksEast', label: 'Follow the bootprints toward the tollpost', timeCost: 5, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'askHalAboutCase', label: 'Ask Hal who owned the case', timeCost: 2, next: 'halTestimony' },
      ],
    },
    mechanicalInspection: {
      id: 'mechanicalInspection', title: 'A Split Hub', tone: 'warning',
      text: 'Once the mud is cleared, the break is plain: the wheel hub split where the road drops into a deep rut. The damage looks like a mechanical failure, not a deliberate cut. Footprints are still visible beyond the wagon, but the fading light makes it hard to tell when they were made.',
      choices: [
        { id: 'followFreshTracksFromWagon', label: 'Follow the freshest tracks from the wagon', timeCost: 4, next: 'trackFork', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'confrontHalWithWheelEvidence', label: 'Ask Hal why he said Mara was thrown', hint: 'The wheel explains the crash, not where she went.', timeCost: 3, next: 'halConfession', effects: { historyFlags: ['confronted_survivor'] } },
        repairChoice(true),
        repairChoice(false),
      ],
    },
    halTestimony: {
      id: 'halTestimony', title: 'A Story with a Missing Piece', tone: 'warning',
      text: 'Hal says he heard a thump when the wagon tipped and assumed Mara had been thrown clear. When you ask why she was not riding beside him, he pauses: they argued at the eastern marker, and she stepped down to walk. He thought she would turn back. He did not see where she went after the wheel broke.',
      choices: [
        { id: 'checkWheelAfterStory', label: 'Inspect the damaged wheel', timeCost: 4, next: 'mechanicalInspection', effects: { setFlags: ['identifiedBrokenHub'] } },
        { id: 'followEastAfterStory', label: 'Search the road she had been walking', timeCost: 4, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'walkHalToFarmAfterStory', label: 'Get Hal to the farmhouse before searching', timeCost: 10, next: 'farmhouse', effects: { setFlags: ['survivorEscorted'], historyFlags: ['escorted_injured_traveler', 'returned_for_help'] } },
      ],
    },
    halConfession: {
      id: 'halConfession', title: 'What Hal Left Out', tone: 'warning',
      text: 'Hal looks down at the broken hub. “I told you she was thrown because I was frightened and ashamed. We argued about the shortcut. Mara got out before the wagon tipped and walked toward the old tollpost. I tried to follow in the wagon; then the wheel split in the rut.” He is not sure whether she reached the marker.',
      choices: [
        { id: 'searchTollpostFromConfession', label: 'Follow Mara’s route toward the tollpost', timeCost: 4, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'searchDitchFromConfession', label: 'Check the ditch before assuming she reached it', timeCost: 4, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'getHelpAfterConfession', label: 'Bring searchers before following the trail', timeCost: 12, next: 'farmhouse', effects: { historyFlags: ['returned_for_help', 'uncovered_crash_truth'] } },
      ],
    },
    wheelBraced: {
      id: 'wheelBraced', title: 'A Short Move, Not a Repair', tone: 'warning',
      text: 'The brace will hold long enough to roll the wagon to firmer ground, but it cannot make the damaged wheel roadworthy. Hal can travel slowly if someone guides him. The eastern tracks remain the most direct sign of Mara’s route.',
      choices: [
        { id: 'guideBracedWagonToFarm', label: 'Guide Hal and the wagon to the farmhouse', timeCost: 8, next: 'farmhouse', effects: { setFlags: ['survivorEscorted'], historyFlags: ['escorted_injured_traveler', 'returned_for_help'] } },
        { id: 'leaveBracedWagonFollowTracks', label: 'Leave the wagon and follow the tracks east', timeCost: 4, next: 'trackFork', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'callForHelpAfterBrace', label: 'Signal the farm for searchers', timeCost: 10, next: 'farmhouse', effects: { historyFlags: ['returned_for_help'] } },
      ],
    },
    wheelStrain: {
      id: 'wheelStrain', title: 'The Brace Slips', tone: 'danger',
      text: 'The timber shifts before the wheel can be secured. Your wrist is sore, and the hub is too unstable to move without proper leverage. Hal asks you not to waste more daylight on the wagon while Mara is still missing.',
      choices: [
        { id: 'leaveWheelAndFollowTracks', label: 'Leave the wheel and follow the tracks', timeCost: 3, next: 'trackFork', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'seekLeverageAtFarm', label: 'Get help and a proper lever from the farm', timeCost: 10, next: 'farmhouse', effects: { historyFlags: ['returned_for_help'] } },
        { id: 'escortHalAfterBraceFails', label: 'Get Hal to shelter before dark', timeCost: 8, next: 'farmhouse', effects: { setFlags: ['survivorEscorted'], historyFlags: ['escorted_injured_traveler', 'returned_for_help'] } },
      ],
    },
    trackFork: {
      id: 'trackFork', title: 'Two Lines in the Mud', tone: 'warning',
      text: 'The tracks split beyond the crossing. A narrow line of bootprints follows the eastern road toward the tollpost; heavier scuffs descend through reeds into the ditch. Neither set proves Mara’s route. The sun is touching the tree line, and the damp ground is softening.',
      textVariants: [
        { requirements: { minElapsedMinutes: 34 }, text: 'Dark has settled across the fork. The ditch scuffs are hard to read, while the eastern footprints almost disappear against the road. A headlamp can preserve detail; a search without light may lose the trail.' },
        { requirements: { minElapsedMinutes: 24 }, text: 'Only the last light reaches the fork. The ditch scuffs remain visible, but the eastern prints are fading fast. A lamp can preserve the search; without one, the safer route is toward the marked road.' },
        { requirements: { minElapsedMinutes: 12 }, text: 'At dusk, rain-softened mud blurs the smaller prints. The scuffs still descend toward the ditch, and a thinner line of bootprints points east to the tollpost.' },
      ],
      choices: [
        { id: 'followFreshDitchTrail', label: 'Follow the ditch scuffs while they are clear', requirements: { maxElapsedMinutes: 11 }, timeCost: 6, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'followDitchAtDusk', label: 'Follow the ditch scuffs at dusk', requirements: { minElapsedMinutes: 12, maxElapsedMinutes: 23 }, timeCost: 7, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'followDitchWithHeadlamp', label: 'Use your headlamp to read the ditch trail', requirements: { items: ['minerHeadlamp'], minElapsedMinutes: 24 }, timeCost: 5, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler', 'searched_after_dark'] } },
        { id: 'followDitchWithFarmLantern', label: 'Use the borrowed lantern to read the ditch trail', requirements: { flags: ['borrowedFarmLantern'], notItems: ['minerHeadlamp'], minElapsedMinutes: 24 }, timeCost: 6, next: 'ditchEdge', effects: { historyFlags: ['searched_for_missing_traveler', 'searched_after_dark'] } },
        { id: 'searchDitchInDarkWithoutLamp', label: 'Try to follow the ditch trail in darkness', requirements: { notItems: ['minerHeadlamp'], notFlags: ['borrowedFarmLantern'], minElapsedMinutes: 24 }, hint: 'The dark hides loose stones and weakens the trail.', timeCost: 8, chance: { probability: 0.36, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.08, successNext: 'ditchEdge', failureNext: 'tracksObscured', successMessage: 'A pale mark on a reed keeps the trail visible long enough to reach the bank.', failureMessage: 'The trail vanishes in the dark. You lose time searching the wrong side of the ditch.', failureEffects: { setFlags: ['tracksObscured'] } }, effects: { historyFlags: ['searched_for_missing_traveler', 'searched_after_dark'] } },
        { id: 'markForkForSearchers', label: 'Mark the fork and signal the farmhands', requirements: { items: ['foldingTrailMarker'] }, hint: 'A bright marker lets searchers follow both trails without guessing.', timeCost: 8, next: 'searchersArrive', effects: { setFlags: ['markedTrailForSearchers'], historyFlags: ['searched_for_missing_traveler', 'returned_for_help'] } },
        { id: 'followEastTracks', label: 'Follow the footprints toward the tollpost', timeCost: 6, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'seekSearchersFromFork', label: 'Signal the farmhands to meet you on the trail', timeCost: 12, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help'] } },
      ],
    },
    tracksObscured: {
      id: 'tracksObscured', title: 'A Trail Half-Lost', tone: 'warning',
      text: 'The trail breaks where wagon ruts cross the wet ground. You have lost several minutes, but a few bootprints still point east. A nearby farmhouse has a lantern and people who can help; the ditch is now difficult to approach safely alone.',
      choices: [
        { id: 'continueEastAfterLostTrail', label: 'Take the remaining prints toward the tollpost', timeCost: 5, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
        { id: 'askFarmForHelpAfterLostTrail', label: 'Bring searchers from the farm to this trail', timeCost: 10, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help'] } },
        { id: 'stopAfterTrailLost', label: 'Tell the farm where you last saw the tracks', next: 'partialSearchEnding' },
      ],
    },
    ditchEdge: {
      id: 'ditchEdge', title: 'The Steep Shoulder', tone: 'danger',
      text: 'The road shoulder drops into a narrow, reed-filled ditch. A pale strip of cloth is caught below, but the lower bank is slick and undercut. You hear no voice. From the eastern road, a weathered toll marker is still visible in the fading light.',
      textVariants: [{ requirements: { minElapsedMinutes: 34 }, text: 'The ditch is nearly black. The pale cloth is difficult to distinguish from the reeds, and the loose bank is unsafe to rush. A rope or a careful call from high ground would reduce the danger.' }],
      choices: [
        ditchChoice(true),
        ditchChoice(false),
        { id: 'callFromSafeBank', label: 'Call down from the firm road edge', hint: 'This avoids the steepest part of the bank, but costs more time.', timeCost: 5, chance: { probability: 0.76, bonusItems: ['conductorWhistle', 'trailWhistle'], bonusProbability: 0.12, successNext: 'travelerFound', failureNext: 'tracksObscured', successMessage: 'A voice answers from below. You find a safer sloped approach along the ditch.', failureMessage: 'Only the wind replies. You still have the road toward the tollpost or can seek help.', successEffects: { setFlags: ['foundAtDitch'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] }, failureEffects: { setFlags: ['tracksObscured'] } } },
        { id: 'takeFirmRoadToTollpost', label: 'Use the firm road toward the toll marker', timeCost: 5, next: 'milepostApproach', effects: { historyFlags: ['searched_for_missing_traveler'] } },
      ],
    },
    slopeSlip: {
      id: 'slopeSlip', title: 'The Bank Gives Way', tone: 'danger',
      text: 'The slope crumbles beneath you. You catch a root before reaching the ditch floor, but the fall bruises your shoulder. The dark makes another descent unsafe; the firm road still leads toward the tollpost, and the farmhouse can send help.',
      choices: [
        { id: 'climbToTollpostAfterSlip', label: 'Climb back to the road and follow the marker', timeCost: 5, next: 'milepostApproach' },
        { id: 'getHelpAfterSlopeSlip', label: 'Ask the farmhouse for a lantern and help', timeCost: 10, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help'] } },
        { id: 'withdrawAfterSlopeSlip', label: 'Stop searching and report the ditch location', next: 'partialSearchEnding', effects: { historyFlags: ['abandoned_crossroads_search'] } },
      ],
    },
    milepostApproach: {
      id: 'milepostApproach', title: 'The Old Toll Marker', tone: 'warning',
      text: 'The eastern prints reach an old toll marker. A strip from a blue scarf is tied around its lower post, and one set of bootprints turns down the embankment before returning to the road. It could be Mara’s, though the crossing sees other travelers. The sun is almost gone.',
      textVariants: [{ requirements: { minElapsedMinutes: 34 }, text: 'The toll marker is almost lost in darkness. The blue scarf strip still catches the faint light, but the prints beneath it are no longer readable without a lantern. A headlamp, a borrowed lamp, or outside help could preserve the search.' }],
      choices: [
        { id: 'searchMarkerBeforeDark', label: 'Search around the marker in the remaining light', requirements: { maxElapsedMinutes: 33 }, timeCost: 5, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'searchMarkerWithHeadlamp', label: 'Use your headlamp to inspect the marker', requirements: { items: ['minerHeadlamp'], minElapsedMinutes: 34 }, timeCost: 4, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'searched_after_dark', 'uncovered_crash_truth'] } },
        { id: 'searchMarkerWithFarmLamp', label: 'Use the borrowed farm lantern to inspect the marker', requirements: { flags: ['borrowedFarmLantern'], notItems: ['minerHeadlamp'], minElapsedMinutes: 34 }, timeCost: 4, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'searched_after_dark', 'uncovered_crash_truth'] } },
        { id: 'searchMarkerInDark', label: 'Feel along the marker without a light', requirements: { notItems: ['minerHeadlamp'], notFlags: ['borrowedFarmLantern'], minElapsedMinutes: 34 }, hint: 'The bank is uneven and you may miss a small sign in the dark.', timeCost: 7, chance: { probability: 0.42, successNext: 'travelerFound', failureNext: 'darkSearchSetback', successMessage: 'You find a fresh scuff below the marker and a traveler waiting in the lee of the bank.', failureMessage: 'The dark hides the trail. You find a torn strap but cannot safely follow it farther.', successEffects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'searched_after_dark', 'uncovered_crash_truth'] }, failureEffects: { historyFlags: ['searched_after_dark'] } } },
        { id: 'seekHelpFromMarker', label: 'Signal the farmhouse for searchers', timeCost: 10, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help'] } },
      ],
    },
    darkSearchSetback: {
      id: 'darkSearchSetback', title: 'A Search Paused by Darkness', tone: 'warning',
      text: 'You find a torn strap below the marker but cannot tell where the prints go. The bank is too uneven to keep searching by touch. The farmhouse is lit, and the people there can continue the search with lamps at first light.',
      choices: [
        { id: 'getSearchersFromDarkSetback', label: 'Bring searchers and lanterns from the farmhouse', timeCost: 8, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help', 'searched_after_dark'] } },
        { id: 'waitForMorningWithFarmers', label: 'Wait with the farm family until morning', timeCost: 5, next: 'morningSearch', effects: { historyFlags: ['searched_after_dark'] } },
        { id: 'endDarkSearch', label: 'Leave the clue for the local searchers', next: 'partialSearchEnding', effects: { historyFlags: ['searched_after_dark'] } },
      ],
    },
    morningSearch: {
      id: 'morningSearch', title: 'The Road at First Light', tone: 'warning',
      text: 'The sun returns, but the wet ground has been crossed by farmhands and passing carts. A fresh line of prints appears near the toll marker, and someone answers when the searchers call. The night cost time, not every chance of finding Mara.',
      choices: [
        { id: 'followMorningPrints', label: 'Follow the fresh prints with the searchers', timeCost: 5, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'leaveMorningSearchToFarm', label: 'Let the farmhands take over the search', next: 'partialSearchEnding' },
      ],
    },
    farmhouse: {
      id: 'farmhouse', title: 'A Lamp in the Farm Window', tone: 'safe',
      text: 'The nearest farmhouse is a short walk south. The family has a lantern and is willing to help, though gathering people and reaching the crossing will cost more daylight. Hal can rest here if you brought him; if not, he remains at the wagon.',
      textVariants: [
        { requirements: { historyFlags: ['escorted_injured_traveler'] }, text: 'You remember escorting an injured traveler before. The farm family offers a lantern and agrees to search; Hal can rest here while they go, or you can take the light toward the toll marker yourself.' },
        { requirements: { flags: ['survivorEscorted'] }, text: 'Hal is settled by the hearth. The farm family offers a lantern and will search, though gathering people and reaching the crossing will cost daylight.' },
      ],
      choices: [
        { id: 'sendFarmhandsToSearch', label: 'Ask the farmhands to search with you', timeCost: 12, next: 'searchersArrive', effects: { historyFlags: ['returned_for_help'] } },
        { id: 'borrowFarmLanternForMarker', label: 'Borrow a lantern and return to the toll marker', timeCost: 6, next: 'milepostApproach', effects: { setFlags: ['borrowedFarmLantern'], historyFlags: ['returned_for_help'] } },
        { id: 'leaveHalAtFarmSearchAlone', label: 'Leave Hal resting and continue the search', timeCost: 5, next: 'trackFork', effects: { setFlags: ['borrowedFarmLantern'], historyFlags: ['returned_for_help', 'searched_for_missing_traveler'] } },
        { id: 'leaveSituationWithFarm', label: 'Leave the situation in the family’s hands', next: 'partialSearchEnding' },
      ],
    },
    searchersArrive: {
      id: 'searchersArrive', title: 'More Hands at the Crossing', tone: 'warning',
      text: 'Two farmhands arrive with lamps. They have not seen Mara, but one noticed a blue scarf at the old toll marker and another saw scuffs below the road. They can split up, though the light is nearly gone.',
      textVariants: [{ requirements: { flags: ['markedTrailForSearchers'] }, text: 'Two farmhands arrive with lamps and follow the bright folding marker you left at the fork. One takes the scuffs toward the ditch; the other follows the eastern bootprints. They can split up without trampling either trail.' }],
      choices: [
        { id: 'searchDitchWithFarmhands', label: 'Search the ditch together', timeCost: 5, next: 'travelerFound', effects: { setFlags: ['foundAtDitch'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'searchMarkerWithFarmhands', label: 'Check beneath the toll marker', timeCost: 5, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
        { id: 'splitSearchParty', label: 'Split the group between both clues', timeCost: 7, next: 'travelerFound', effects: { setFlags: ['foundAtMarker'], historyFlags: ['searched_for_missing_traveler', 'uncovered_crash_truth'] } },
      ],
    },
    travelerFound: {
      id: 'travelerFound', title: 'Mara Is Found', tone: 'warning',
      text: 'Mara is shaken and has sprained an ankle, but can speak and stand with support. She says she got out before the wagon tipped after she and Hal argued over taking a shortcut. She walked toward the old toll marker, then slipped while trying to cut down the bank. “I didn’t want to climb back into that argument,” she says. The cracked wheel explains the crash; neither traveler caused it deliberately.',
      textVariants: [
        { requirements: { flags: ['foundAtDitch'] }, text: 'Mara is shaken and has sprained an ankle, but can speak and stand with support. She says she left the wagon before it tipped after arguing with Hal over the shortcut. She tried to cut down the bank and slipped. “I didn’t want to climb back into that argument,” she says. The cracked wheel explains the crash; neither traveler caused it deliberately.' },
        { requirements: { flags: ['foundAtMarker'] }, text: 'Mara waits beneath the old toll marker, shaken and with a sprained ankle. She left the wagon before it tipped after arguing with Hal over the shortcut, then walked east to cool off. “I didn’t want to climb back into that argument,” she says. The cracked wheel explains the crash; neither traveler caused it deliberately.' },
      ],
      choices: [
        { id: 'returnMaraToHal', label: 'Walk back together and check on Hal', requirements: { notFlags: ['survivorEscorted'] }, timeCost: 9, next: 'reunion', effects: { historyFlags: ['uncovered_crash_truth', 'protected_injured_traveler'] } },
        { id: 'bringMaraToHalAtFarm', label: 'Bring Mara to the farmhouse where Hal is resting', requirements: { flags: ['survivorEscorted'] }, timeCost: 5, next: 'reunion', effects: { historyFlags: ['uncovered_crash_truth', 'protected_injured_traveler'] } },
        { id: 'escortMaraToFarm', label: 'Take Mara to the farmhouse first', hint: 'She is safe there, but Hal will remain alone for now.', timeCost: 9, next: 'maraAtFarm' },
        { id: 'respectMaraRequest', label: 'Respect her wish for space and send help for Hal', timeCost: 7, next: 'maraAtFarm', effects: { setFlags: ['respectedMaraSpace'], historyFlags: ['uncovered_crash_truth', 'returned_for_help'] } },
        { id: 'leaveAfterFindingMara', label: 'Tell the farm where she is, then continue on', next: 'partialSearchEnding', effects: { historyFlags: ['uncovered_crash_truth'] } },
      ],
    },
    maraAtFarm: {
      id: 'maraAtFarm', title: 'A Safe Place to Rest', tone: 'safe',
      text: 'The farm family gives Mara a chair, a dry blanket, and water. She asks not to be put back in the wagon with Hal immediately; she wants a little time before they speak. Hal is still at the crossing with his injured leg.',
      textVariants: [{ requirements: { flags: ['respectedMaraSpace'] }, text: 'The farm family gives Mara a chair, a dry blanket, and water. She is relieved you did not pressure her to return to Hal. He is still at the crossing with his injured leg, and the farmhands can reach him separately.' }],
      choices: [
        { id: 'askFarmhandsToBringHal', label: 'Have the farmhands bring Hal here separately', requirements: { notFlags: ['survivorEscorted'] }, timeCost: 10, next: 'reunion', effects: { historyFlags: ['returned_for_help'] } },
        { id: 'returnAloneForHal', label: 'Go back for Hal while Mara rests', requirements: { notFlags: ['survivorEscorted'] }, timeCost: 9, next: 'reunion', effects: { historyFlags: ['escorted_injured_traveler'] } },
        { id: 'giveThemSpaceAtFarm', label: 'Stay while both rest, without forcing a conversation', requirements: { flags: ['survivorEscorted'] }, next: 'safeApartEnding', effects: { historyFlags: ['stayed_while_travelers_settled_at_farm'] } },
        { id: 'leaveMaraSafeForMorning', label: 'Leave Mara with the farm family and trust them with the rest', next: 'safeApartEnding', effects: { historyFlags: ['left_travelers_in_farm_care'] } },
      ],
    },
    reunion: {
      id: 'reunion', title: 'A Quiet Reunion', tone: 'safe',
      text: 'Hal is brought to the farmhouse with help. Mara agrees to speak with him after they have both rested; no one asks them to settle the argument tonight. The wheel failure and the route of Mara’s walk are understood, and both travelers are safe. Hal offers you a practical tool from the wagon, or a folding marker for future roads.',
      choices: rewardChoices(),
    },
    bothSafeEnding: {
      id: 'bothSafeEnding', title: 'The Crossing Settles', tone: 'safe', ending: 'success',
      text: 'With the travelers sheltered, the crossing is left to the farmhands. The wheel failed in the rut, and Mara left on foot after an argument, not because someone took her. You spent the last of the light learning enough to bring both people to safety.' ,
      choices: [],
    },
    safeApartEnding: {
      id: 'safeApartEnding', title: 'A Little Distance', tone: 'safe', ending: 'success',
      text: 'Mara rests safely with the farm family. Hal is brought in separately, and the two travelers can decide when to speak. You did not force a reunion to make the rescue complete.' ,
      textVariants: [
        { requirements: { flags: ['survivorEscorted'], historyFlags: ['stayed_while_travelers_settled_at_farm'] }, text: 'Both travelers are safe at the farmhouse. You stay until the family has them settled in separate rooms, then leave them to speak when they are ready.' },
        { requirements: { flags: ['survivorEscorted'], historyFlags: ['left_travelers_in_farm_care'] }, text: 'Both travelers are safe at the farmhouse. You leave them in the family’s care before they speak; Mara rests in a separate room, and no one presses for an account tonight.' },
        { requirements: { notFlags: ['survivorEscorted'], historyFlags: ['left_travelers_in_farm_care'] }, text: 'Mara is safe with the farm family, but Hal is still at the crossing. You leave the family your account and trust them to send help for his injured leg; you do not see that handoff yourself.' },
        { requirements: { flags: ['survivorEscorted'] }, text: 'Both travelers are already safe at the farmhouse. Mara rests in a separate room while Hal is tended by the farm family; no one pressures them to speak before they are ready.' },
      ],
      choices: [],
    },
    partialSearchEnding: {
      id: 'partialSearchEnding', title: 'The Search Changes Hands', tone: 'warning', ending: 'success',
      text: 'You tell the farmhouse what the tracks and wreck revealed. The local searchers take over with lamps and a clearer idea of where to look. You leave without knowing the final outcome; the remaining search is no longer yours alone.' ,
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Continues', tone: 'safe', ending: 'success',
      text: 'You continue down the road. The farm lies close enough for Hal to call for help, and the local people know a traveler is missing. You do not know what happened next, and the story does not judge your choice to keep going.' ,
      textVariants: [{ requirements: { flags: ['helpedHalThenLeft'] }, text: 'After checking Hal’s injuries, you point him toward the nearby farmhouse. He can walk with support, and the family there can take over. Mara is still missing; you do not know what happened next, and the story does not judge your choice to continue on.' }],
      choices: [],
    },
  },
};
