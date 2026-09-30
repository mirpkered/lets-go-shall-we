import type { Choice, Scenario } from '../types';

const RESCUE_GEAR = ['smokeHood', 'heavyLeatherGloves', 'minerHeadlamp'];
const BEAM_GEAR = ['foldingPryTool', 'bridgewrightHammer', 'steelWedge', 'heavyLeatherGloves', 'compactBlockAndTackle'];

function rewardChoices(): Choice[] {
  return [
    { id: 'acceptPryTool', label: 'Accept the Folding Pry Tool', requirements: { notItems: ['foldingPryTool'] }, effects: { gainItems: ['foldingPryTool'] }, next: 'survivedEnding' },
    { id: 'acceptFireBeater', label: 'Accept the Fire Beater', requirements: { notItems: ['fireBeater'] }, effects: { gainItems: ['fireBeater'] }, next: 'survivedEnding' },
    { id: 'declineReward', label: 'Thank them and leave without a tool', next: 'survivedEnding' },
  ];
}

function entryAttempt(id: string, label: string, successNext = 'insideShop', failureNext = 'entryInjury'): Choice {
  return {
    id, label, hint: 'The doorway is full of smoke and the roof is bowing. Going in may kill you.', timeCost: 1,
    chance: {
      probability: 0.58, lateProbability: 0.34, lateAfterMinutes: 14,
      bonusItems: RESCUE_GEAR, bonusProbability: 0.16,
      successNext, failureNext,
      successMessage: 'You stay low and reach the stairwell beneath the loft.',
      failureMessage: 'Smoke closes over you. You stumble back into the yard, bruised and coughing.',
      successEffects: { health: -1, setFlags: ['enteredFire'], historyFlags: ['entered_burning_structure_for_stranger'] },
      failureEffects: { health: -2, setFlags: ['enteredFire'], historyFlags: ['entered_burning_structure_for_stranger'] },
    },
  };
}

export const BURNING_LOFT: Scenario = {
  id: 'the-burning-loft',
  title: 'The Burning Loft',
  subtitle: 'One person is trapped above a failing workshop. You are still safe outside.',
  startScene: 'roadsideFire',
  timePhases: [
    { id: 'smoke', label: 'Smoke Building', atMinutes: 0 },
    { id: 'spread', label: 'Fire Spreading', atMinutes: 7 },
    { id: 'failing', label: 'Structure Failing', atMinutes: 14 },
    { id: 'collapse', label: 'Collapse Imminent', atMinutes: 22 },
  ],
  runRandomSelections: [
    { id: 'trappedPerson', values: ['Tamsin', 'Winifred', 'Hollis', 'Dorian', 'Petra', 'Hester', 'Lyle', 'Gwen', 'Cormac', 'Ansel'].map((value) => ({ value })) },
  ],
  scenes: {
    roadsideFire: {
      id: 'roadsideFire', title: 'Smoke at the Shop', tone: 'warning',
      text: 'You stand on the lane, outside a carriage-maker’s west wall. You are safe. Smoke rolls from the open south doors; {{trappedPerson}}, the apprentice, calls from the loft window above them. The shopkeeper says one falling beam crushed the only stair. An orchard ladder rests in the open yard. The roof bows. Nearby help is several minutes away. The shopkeeper offers a Folding Pry Tool or Fire Beater if {{trappedPerson}} comes out.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'You are still outside and safe. Smoke hides part of the loft window; {{trappedPerson}} called from it a moment ago. The fallen beam still blocks the only stair. The roof now groans above the open south doors. An orchard ladder is in the yard; nearby help is several minutes away.' }],
      choices: [
        { id: 'callUp', label: 'Call to {{trappedPerson}} at the window', hint: 'A quick answer may reveal how they can get down.', timeCost: 2, next: 'windowAnswer', effects: { knowledge: ['{{trappedPerson}} is alert at the loft window and can move without help.'] } },
        { id: 'fetchLadder', label: 'Bring the orchard ladder to the window', hint: 'Stay outside; the ladder is in the open yard.', timeCost: 4, next: 'ladderReady', effects: { setFlags: ['ladderReady'] } },
        entryAttempt('enterFromLane', 'Enter through the south doors'),
        { id: 'leaveTheFire', label: 'Keep to the road and leave', hint: 'You will remain safe; no one is yet at the loft.', timeCost: 24, next: 'walkAwayEnding', effects: { historyFlags: ['chose_safety_over_fire_rescue'] } },
      ],
    },
    windowAnswer: {
      id: 'windowAnswer', title: 'A Voice Above the Smoke', tone: 'warning',
      text: '{{trappedPerson}} answers from the east-facing loft window. They can stand, but the fallen beam blocks the stair. A fixed gatepost sits below the window; a long rope could reach it from the sill. The shopkeeper remains in the lane, clear of the fire.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: '{{trappedPerson}} answers weakly from the loft window. The smoke is thicker now, and the roof groans over the blocked stair. The gatepost is below the sill; a rope might still reach, but a miss would cost time.' }],
      choices: [
        { id: 'fetchLadderAfterCall', label: 'Set the orchard ladder below the window', timeCost: 4, next: 'ladderReady', effects: { setFlags: ['ladderReady'] } },
        { id: 'anchorRopeAtPost', label: 'Anchor your rope to the gatepost', hint: 'A line gives them another way down; smoke and heat still make the window dangerous.', requirements: { items: ['travelRope'] }, timeCost: 3, chance: { probability: 0.82, lateProbability: 0.58, lateAfterMinutes: 14, bonusItems: ['ironRopeClamp'], bonusProbability: 0.1, successNext: 'rewardOffer', failureNext: 'ladderFailure', successMessage: 'The line holds. {{trappedPerson}} reaches the yard without you entering the shop.', failureMessage: 'The line slips from the sill. You stay outside, but {{trappedPerson}} is still trapped.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] }, failureEffects: { setFlags: ['ropeSlipped'] } } },
        { id: 'callNeighbors', label: 'Send the shopkeeper for nearby help', hint: 'Safer than entering, but the walk takes time.', timeCost: 9, next: 'neighborsArrive', effects: { setFlags: ['helpSummoned'] } },
        entryAttempt('enterAfterCalling', 'Go in while they can still answer'),
      ],
    },
    ladderReady: {
      id: 'ladderReady', title: 'A Ladder to the Loft', tone: 'warning',
      text: 'The ladder stands against the east wall beneath the loft window. The shopkeeper holds its feet from the clear yard. {{trappedPerson}} can see the rungs. You remain outside, but wind shakes the upper end and the roof keeps settling.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The ladder reaches the window, though the smoke is now pouring past it. The shopkeeper braces the feet. The next roof shift could knock the ladder sideways.' }],
      choices: [
        { id: 'guideDownLadder', label: 'Guide {{trappedPerson}} down the ladder', hint: 'You stay outside; the upper rungs are shaking.', requirements: { notItems: ['travelRope'] }, timeCost: 3, chance: { probability: 0.77, lateProbability: 0.48, lateAfterMinutes: 14, bonusItems: ['heavyLeatherGloves', 'ironRopeClamp'], bonusProbability: 0.12, successNext: 'rewardOffer', failureNext: 'ladderFailure', successMessage: '{{trappedPerson}} reaches the yard. You never crossed the burning doorway.', failureMessage: 'A rung jerks against the wall. You catch the ladder; {{trappedPerson}} remains at the window.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] }, failureEffects: { setFlags: ['ladderShifted'] } } },
        { id: 'secureAndGuideWithRope', label: 'Secure the ladder with your rope', hint: 'The line steadies the ladder, but the roof and window remain dangerous.', requirements: { items: ['travelRope'] }, timeCost: 3, chance: { probability: 0.89, lateProbability: 0.67, lateAfterMinutes: 14, bonusItems: ['ironRopeClamp'], bonusProbability: 0.08, successNext: 'rewardOffer', failureNext: 'ladderFailure', successMessage: 'The rope holds the ladder firm while {{trappedPerson}} climbs down.', failureMessage: 'The line shifts under the load. You keep your footing; {{trappedPerson}} is still above.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] }, failureEffects: { setFlags: ['ladderShifted'] } } },
        entryAttempt('enterFromLadder', 'Leave the ladder and enter the shop'),
        { id: 'retreatFromLadder', label: 'Back away and leave the rescue to others', hint: 'You remain safe, but the ladder is not yet a rescue.', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    neighborsArrive: {
      id: 'neighborsArrive', title: 'Help at the Gate', tone: 'danger',
      text: 'Two neighbors reach the yard with another ladder. They stay outside the south doors; no one is willing to pretend the roof is sound. {{trappedPerson}} is still at the loft window. The extra hands can steady a ladder, but the delay has made the climb worse.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The neighbors arrive as the loft roof begins to sag. They can brace the ladder from outside, but the window is nearly lost in smoke. No one can promise {{trappedPerson}} will make it down.' }],
      choices: [
        { id: 'neighborsGuideDown', label: 'Let the neighbors steady the ladder', hint: 'You stay outside; the long wait has weakened the rescue window.', timeCost: 3, chance: { probability: 0.72, lateProbability: 0.39, lateAfterMinutes: 14, bonusItems: ['travelRope', 'ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'rewardOffer', failureNext: 'neighborRescueFail', successMessage: 'The neighbors hold the ladder firm. {{trappedPerson}} reaches the lane.', failureMessage: 'The ladder twists away from the window. The neighbors pull it clear before anyone is hurt.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] }, failureEffects: { setFlags: ['ladderShifted'] } } },
        entryAttempt('enterWithNeighborsWaiting', 'Enter before the window disappears'),
        { id: 'stopAtTheGate', label: 'Stay outside and leave with the neighbors', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    neighborRescueFail: {
      id: 'neighborRescueFail', title: 'The Window Goes Dark', tone: 'danger',
      text: 'The ladder is back on the ground. You are safe in the yard, but smoke has swallowed the window. The neighbors call {{trappedPerson}}’s name and hear nothing.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The upper floor gives way behind the smoke. The neighbors cannot reach {{trappedPerson}}. You are still outside and unharmed; the rescue is over.' }],
      choices: [
        { ...entryAttempt('lastEntryAfterNeighbors', 'Make one last attempt to enter'), requirements: { maxElapsedMinutes: 13 } },
        { id: 'leaveBeforeCollapse', label: 'Leave with the neighbors', requirements: { maxElapsedMinutes: 13 }, next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
        { id: 'leaveAfterCollapse', label: 'Leave the collapsed workshop', requirements: { minElapsedMinutes: 14 }, next: 'npcLostEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    ladderFailure: {
      id: 'ladderFailure', title: 'The Ladder Shifts', tone: 'danger',
      text: 'The ladder slips away from the loft window. You and the shopkeeper catch it before it falls. {{trappedPerson}} remains above the smoke, and you are still on safe ground.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The ladder slips as the roof groans. The window is gone behind smoke, and no answer comes from {{trappedPerson}}. You are still safe in the yard.' }],
      choices: [
        entryAttempt('enterAfterLadderFailure', 'Go through the south doors now', 'insideAfterLadder'),
        { id: 'sendForHelpAfterLadder', label: 'Send for help and hold the lane', hint: 'You stay out of danger; the delay may cost the rescue.', timeCost: 9, next: 'neighborsArrive', effects: { setFlags: ['helpSummoned'] } },
        { id: 'leaveAfterLadderFailure', label: 'Retreat to the road', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    entryInjury: {
      id: 'entryInjury', title: 'Driven Back to the Yard', tone: 'danger',
      text: 'You are back outside with a bruised shoulder and raw lungs. {{trappedPerson}} still calls from above. The south doors remain open, but smoke pours lower now. A second entry is possible; it is not safer.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'You stumble back into the yard with a bruised shoulder. The roof groans over the south doors, and {{trappedPerson}} no longer answers. You can still leave; going back in may kill you.' }],
      choices: [
        { id: 'callHelpAfterInjury', label: 'Wait for the neighbors to return', hint: 'You stay outside. The wait may leave no time for another rescue.', timeCost: 10, next: 'neighborsAfterInjury', effects: { setFlags: ['helpSummoned'] } },
        { id: 'useFieldBandage', label: 'Wrap your shoulder before deciding', hint: 'It eases the injury, not the smoke or roof danger.', requirements: { items: ['fieldBandageRoll'] }, timeCost: 2, next: 'bandagedOutside', effects: { health: 1, loseItems: ['fieldBandageRoll'] } },
        { id: 'retreatAfterEntryInjury', label: 'Stay out and retreat to the road', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    bandagedOutside: {
      id: 'bandagedOutside', title: 'A Wrapped Shoulder', tone: 'warning',
      text: 'The bandage steadies your shoulder. It cannot clear the smoke or strengthen the roof. The orchard ladder and neighbors are still options, and the open doors still lead into danger.',
      choices: [
        { id: 'neighborsAfterBandage', label: 'Wait for the neighbors to return', hint: 'You stay outside; the rescue window is shrinking.', timeCost: 8, next: 'neighborsAfterInjury', effects: { setFlags: ['helpSummoned'] } },
        { id: 'retreatBandaged', label: 'Keep yourself out of the fire', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    insideShop: {
      id: 'insideShop', title: 'Under the Loft', tone: 'danger',
      text: 'You are just inside the south doors, below the loft. A charred beam lies across the only stair. {{trappedPerson}} is beyond it, near the east window. The doorway is behind you. Smoke is already at chest height; the roof beam above the stair is splitting.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'Inside the south doors, smoke hangs low and the roof beam has split farther. The stair is still blocked. {{trappedPerson}} is beyond it near the east window. The open doorway is only a few steps behind you.' }],
      choices: [
        { id: 'shiftFallenBeam', label: 'Shift the beam off the stair', hint: 'A Smoke Hood, gloves, wedge, or pry tool may help; none makes this safe.', timeCost: 3, chance: { probability: 0.64, lateProbability: 0.43, lateAfterMinutes: 14, bonusItems: [...RESCUE_GEAR, ...BEAM_GEAR], bonusProbability: 0.16, successNext: 'beamCleared', failureNext: 'beamSlip', successMessage: 'The beam rolls far enough to reopen the stair, but the roof keeps moving.', failureMessage: 'The beam jerks. You get clear with a blow to your side.', successEffects: { health: -1, setFlags: ['beamMoved'] }, failureEffects: { health: -2, setFlags: ['beamSlipped'] } } },
        { id: 'beatSmallThresholdFlame', label: 'Beat down the small flame by the stair', hint: 'A Fire Beater can clear reachable floor flame, not the burning roof.', requirements: { items: ['fireBeater'] }, timeCost: 2, next: 'thresholdCleared', effects: { setFlags: ['thresholdFireBeaten'] } },
        { id: 'retreatFromInside', label: 'Back out through the south doors', hint: 'You can still retreat; {{trappedPerson}} remains above.', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    insideAfterLadder: {
      id: 'insideAfterLadder', title: 'Under the Loft', tone: 'danger',
      text: 'You reach the stairwell through the south doors. The charred beam still blocks the stair, and {{trappedPerson}} waits beyond it near the east window. The orchard ladder remains outside. The roof cracks above the smoke.',
      choices: [
        { id: 'shiftBeamAfterLadderEntry', label: 'Shift the beam off the stair', hint: 'Smoke Hood, gloves, wedge, or pry tool can help; the roof may still fall.', timeCost: 3, chance: { probability: 0.6, lateProbability: 0.38, lateAfterMinutes: 14, bonusItems: [...RESCUE_GEAR, ...BEAM_GEAR], bonusProbability: 0.16, successNext: 'beamCleared', failureNext: 'beamSlip', successMessage: 'The beam rolls aside. The stair is open, but the roof is still moving.', failureMessage: 'The beam jerks back. You get clear with a painful blow.', successEffects: { health: -1, setFlags: ['beamMoved'] }, failureEffects: { health: -2, setFlags: ['beamSlipped'] } } },
        { id: 'retreatAfterLadderEntry', label: 'Back out through the south doors', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    neighborsAfterInjury: {
      id: 'neighborsAfterInjury', title: 'Help Returns', tone: 'danger',
      text: 'The neighbors return with a ladder and brace its feet from the clear yard. The roof has sagged further while you waited. {{trappedPerson}} is still at the window, but the smoke is closing in.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The neighbors return as the loft begins to collapse. They can steady one attempt with the ladder, but {{trappedPerson}} may not survive another delay.' }],
      choices: [
        { id: 'neighborsAfterInjuryRescue', label: 'Guide {{trappedPerson}} down with the neighbors', hint: 'The ladder is steady; the late timing is not.', timeCost: 4, chance: { probability: 0.68, lateProbability: 0.37, lateAfterMinutes: 14, bonusItems: ['travelRope', 'ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'rewardOffer', failureNext: 'npcLostEnding', successMessage: 'The neighbors hold the ladder as {{trappedPerson}} reaches the lane.', failureMessage: 'The loft gives way before {{trappedPerson}} reaches the ladder.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] } } },
        { id: 'leaveAfterHelpReturns', label: 'Stay outside and leave with the neighbors', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    thresholdCleared: {
      id: 'thresholdCleared', title: 'A Clear Step', tone: 'danger',
      text: 'The Fire Beater presses out the small flame on the floor beside the stair. The beam above still burns, and {{trappedPerson}} remains beyond it. The south doors stay open behind you.',
      choices: [
        { id: 'shiftBeamAfterBeating', label: 'Move the fallen beam now', hint: 'The cleared floor helps, but the roof is still failing.', timeCost: 2, chance: { probability: 0.68, lateProbability: 0.46, lateAfterMinutes: 14, bonusFlags: ['thresholdFireBeaten'], bonusProbability: 0.12, bonusItems: [...RESCUE_GEAR, ...BEAM_GEAR], successNext: 'beamCleared', failureNext: 'beamSlip', successMessage: 'The beam moves off the stair. You and {{trappedPerson}} are still beneath the failing roof.', failureMessage: 'The beam shifts back and throws you against the wall.', successEffects: { health: -1, setFlags: ['beamMoved'] }, failureEffects: { health: -2, setFlags: ['beamSlipped'] } } },
        { id: 'retreatAfterBeating', label: 'Retreat through the open doors', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    beamSlip: {
      id: 'beamSlip', title: 'The Beam Drops Back', tone: 'danger',
      text: 'The beam slams down again. You are bruised, but the south doorway is still open behind you. {{trappedPerson}} is still above it. The roof is cracking loudly; you may retreat, tend your injury, or try once more.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The beam slams down again. You are hurt, the roof is cracking, and {{trappedPerson}} is still above you. The doorway remains open, but one more attempt could bring the loft down.' }],
      choices: [
        { id: 'pushBeamAgain', label: 'Make one more attempt at the beam', hint: 'The roof is failing. A bad shift could trap or kill you.', timeCost: 2, chance: { probability: 0.52, lateProbability: 0.33, lateAfterMinutes: 14, bonusItems: [...RESCUE_GEAR, ...BEAM_GEAR], bonusProbability: 0.14, successNext: 'beamCleared', failureNext: 'lastChance', successMessage: 'You find a better grip and get the beam aside.', failureMessage: 'The beam cuts across the passage. You cannot reach the window without a final dangerous effort.', successEffects: { health: -1, setFlags: ['beamMoved'] }, failureEffects: { health: -2, setFlags: ['beamSlipped'] } } },
        { id: 'bandageAtBeam', label: 'Use your bandage before retreating or trying again', requirements: { items: ['fieldBandageRoll'] }, timeCost: 2, next: 'bandagedBeam', effects: { health: 1, loseItems: ['fieldBandageRoll'] } },
        { id: 'retreatFromBeamSlip', label: 'Back out while the doorway is open', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    bandagedBeam: {
      id: 'bandagedBeam', title: 'One More Breath', tone: 'danger',
      text: 'The bandage gives your side some support. The roof does not wait, and {{trappedPerson}} is still on the far side of the fallen beam. The open south door remains your way out.',
      choices: [
        { id: 'pushAfterBandage', label: 'Try the beam once more', hint: 'The bandage will not protect you from a collapse.', timeCost: 2, chance: { probability: 0.54, lateProbability: 0.34, lateAfterMinutes: 14, bonusItems: [...RESCUE_GEAR, ...BEAM_GEAR], bonusProbability: 0.14, successNext: 'beamCleared', failureNext: 'lastChance', successMessage: 'The beam rolls clear enough to open the stair.', failureMessage: 'The beam comes down between you and the window.', successEffects: { health: -1, setFlags: ['beamMoved'] }, failureEffects: { health: -2, setFlags: ['beamSlipped'] } } },
        { id: 'retreatAfterBandage', label: 'Leave through the open south doors', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    beamCleared: {
      id: 'beamCleared', title: 'The Stair Opens', tone: 'danger',
      text: 'The beam shifts off the stair. {{trappedPerson}} can reach you now, but the roof above the landing is split and shedding sparks. The south doors are only a few steps away. You may both get out—or the next shift may take you both.',
      choices: [
        { id: 'runOutTogether', label: 'Run for the south doors together', hint: 'The roof is failing over the short route.', timeCost: 1, chance: { probability: 0.81, lateProbability: 0.64, lateAfterMinutes: 14, bonusItems: RESCUE_GEAR, bonusProbability: 0.1, successNext: 'rewardOffer', failureNext: 'lastChance', successMessage: 'You reach the lane together before the stair shifts again.', failureMessage: 'The beam falls between you and the doors. You are separated inside the shop.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'survived_structural_fire'] }, failureEffects: { health: -1, setFlags: ['beamSeparated'] } } },
        { id: 'holdBeamForPerson', label: 'Hold the beam while {{trappedPerson}} runs', hint: 'You may get them out. The beam could kill you—or both of you.', timeCost: 1, chance: { probability: 0.62, lateProbability: 0.48, lateAfterMinutes: 14, bonusItems: [...BEAM_GEAR, 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'playerDiesPersonLives', failureNext: 'bothDeadEnding', successMessage: '{{trappedPerson}} reaches the lane. The beam drops before you can follow.', failureMessage: 'The beam breaks across both of you. The loft comes down.', successEffects: { health: -10, setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire', 'entered_burning_structure_for_stranger'] }, failureEffects: { health: -10 } } },
        { id: 'retreatFromOpenStair', label: 'Get yourself out before the roof shifts', hint: 'You leave {{trappedPerson}} inside; the outcome may be fatal.', next: 'retreatEnding', effects: { historyFlags: ['retreated_from_failing_rescue'] } },
      ],
    },
    lastChance: {
      id: 'lastChance', title: 'Separated by the Fall', tone: 'danger',
      text: 'You are near the south doors; {{trappedPerson}} is beyond the fallen beam, still answering. The roof is breaking up. Retreat is possible now. Reaching them may save a life, but a failure here could kill you both.',
      textVariants: [{ requirements: { minElapsedMinutes: 14 }, text: 'The shop is coming down. You can still crawl through the south doors, but {{trappedPerson}} is beyond the beam and growing quiet. One last reach could save them—or leave neither of you alive.' }],
      choices: [
        { id: 'reachThroughFallenBeam', label: 'Reach through the fallen beam for them', hint: 'Extreme danger: the roof may fall on both of you.', timeCost: 1, chance: { probability: 0.48, lateProbability: 0.28, lateAfterMinutes: 14, bonusItems: ['travelRope', 'ironRopeClamp', 'smokeHood', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'personOutsideYouInside', failureNext: 'bothDeadEnding', successMessage: 'You push {{trappedPerson}} through to the lane. You are still inside as the loft shifts.', failureMessage: 'The roof falls before either of you can get clear.', successEffects: { setFlags: ['personRescued'], historyFlags: ['rescued_person_from_fire'] }, failureEffects: { health: -10 } } },
        { id: 'crawlOutAlone', label: 'Leave as the loft collapses', hint: 'You will survive; {{trappedPerson}} will not make it out.', timeCost: 12, next: 'npcLostEnding', effects: { historyFlags: ['chose_safety_over_fire_rescue', 'retreated_from_failing_rescue'] } },
      ],
    },
    personOutsideYouInside: {
      id: 'personOutsideYouInside', title: 'One Life Out', tone: 'danger',
      text: '{{trappedPerson}} is safe in the lane with the shopkeeper. You are still inside the workshop. Smoke lowers across the south doors, and a cracked beam has begun to fall between you and the opening. You have to get out now.',
      choices: [
        { id: 'escapeBySouthDoor', label: 'Run for the south doors', hint: 'If the falling beam cuts you off, it may kill you.', timeCost: 1, chance: { probability: 0.78, lateProbability: 0.58, lateAfterMinutes: 14, bonusItems: RESCUE_GEAR, bonusProbability: 0.12, successNext: 'rewardOffer', failureNext: 'playerDiesPersonLives', successMessage: 'You roll clear of the beam and reach the lane.', failureMessage: 'The beam catches you before you reach the doors. {{trappedPerson}} is safe outside.', failureEffects: { health: -10 }, successEffects: { historyFlags: ['survived_structural_fire'] } } },
        { id: 'climbOutWindow', label: 'Climb out through the loft window', hint: 'The ladder is moving. A fall could kill you, though it is safer than the smoky doorway.', requirements: { flags: ['ladderReady'] }, timeCost: 2, chance: { probability: 0.86, lateProbability: 0.69, lateAfterMinutes: 14, bonusItems: ['travelRope', 'ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'rewardOffer', failureNext: 'playerDiesPersonLives', successMessage: 'The ladder holds until you reach the yard.', failureMessage: 'The ladder kicks away. {{trappedPerson}} is already safe, but you are caught inside.', failureEffects: { health: -10 }, successEffects: { historyFlags: ['survived_structural_fire'] } } },
      ],
    },
    retreatEnding: {
      id: 'retreatEnding', title: 'Back on the Lane', tone: 'warning', ending: 'success',
      text: 'You reach the road alive. The shopkeeper and neighbors keep calling from the gate. {{trappedPerson}} has not come out, and you do not stay to see what the fire decides. You leave with no promise that anyone escaped.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Keeps Going', tone: 'warning', ending: 'success',
      text: 'You leave the settlement and remain unharmed. By the time the roof collapses, {{trappedPerson}} has not come out. No one returns from the burning shop.',
      choices: [],
    },
    npcLostEnding: {
      id: 'npcLostEnding', title: 'The Loft Gives Way', tone: 'warning', ending: 'success',
      text: 'You reach the lane alive. The loft collapses before anyone can reach {{trappedPerson}}. The shopkeeper confirms there is no response beneath the fallen roof.',
      choices: [],
    },
    bothDeadEnding: {
      id: 'bothDeadEnding', title: 'The Roof Comes Down', tone: 'danger', ending: 'death',
      text: 'The last beam breaks. The loft and stair collapse before either you or {{trappedPerson}} can get clear.',
      choices: [],
    },
    playerDiesPersonLives: {
      id: 'playerDiesPersonLives', title: 'One Life Out', tone: 'danger', ending: 'death',
      text: '{{trappedPerson}} reaches the lane. You do not. The roof falls across the doorway as the shopkeeper pulls them away from the smoke.',
      choices: [],
    },
    rewardOffer: {
      id: 'rewardOffer', title: 'A Promise Kept', tone: 'safe',
      text: '{{trappedPerson}} is outside and alive. You are out too. The shopkeeper thanks you without pretending the rescue was certain. The Folding Pry Tool and Fire Beater are still on the workbench; you may take one or leave both.',
      choices: rewardChoices(),
    },
    survivedEnding: {
      id: 'survivedEnding', title: 'Clear of the Smoke', tone: 'safe', ending: 'success',
      text: 'You and {{trappedPerson}} are safe outside. The shop is badly damaged, and the roof continues to burn. The neighbors take over while you leave the yard together.',
      choices: [],
    },
  },
};
