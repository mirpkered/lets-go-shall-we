import type { Scenario } from '../types';

const BRIDGE_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'brassCandlestick', 'steelWedge'];
const SAFE_HANDLING = ['heavyLeatherGloves'];

export const BRIDGE_OUT: Scenario = {
  id: 'bridge-out',
  title: 'Bridge Out',
  subtitle: 'A swollen river, a broken crossing, and only so much time to help.',
  startScene: 'arrival',
  timePhases: [
    { id: 'holding', label: 'High Water, Holding', atMinutes: 0 },
    { id: 'rising', label: 'The River Is Rising', atMinutes: 12 },
    { id: 'shifting', label: 'The Bridge Is Shifting', atMinutes: 25 },
    { id: 'critical', label: 'Crossing at the Edge', atMinutes: 38 },
  ],
  scenes: {
    arrival: {
      id: 'arrival', title: 'The Broken Crossing', tone: 'warning',
      text: 'You approach from the near bank. The old bridge starts beside you and reaches toward the far bank. Several planks have washed from its middle, leaving one narrow lane across a cracked, sagging deck. On your side, a small hand wagon sits crooked in the muddy approach, its front wheel sinking. No animals are hitched to it; Mara hauls it herself. She braces the wheel while her injured brother Eli sits beneath the canvas. Rain stipples the rising river, and branches strike the bridge supports. No one is stranded across the river. If the water keeps climbing, the wagon and the remaining bridge may be lost; Mara and Eli are on firm ground for now.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: 'Mara recognizes that you have helped stranded people before and gives you room to look. You approach from the near bank. The old bridge starts beside you and reaches toward the far bank. Several planks have washed from its middle, leaving one narrow lane across a cracked, sagging deck. On your side, a small hand wagon sits crooked in the muddy approach, its front wheel sinking. No animals are hitched to it; Mara hauls it herself. She braces the wheel while her injured brother Eli sits beneath the canvas. Rain stipples the rising river, and branches strike the bridge supports. No one is stranded across the river. If the water keeps climbing, the wagon and the remaining bridge may be lost; Mara and Eli are on firm ground for now.' }],
      choices: [
        { id: 'inspectSupports', label: 'Check the surviving supports', hint: 'A close look may reveal whether the bridge can hold a repair.', timeCost: 5, effects: { knowledge: ['The upstream support is split below the waterline; a quick plank repair alone will not hold.'], setFlags: ['foundSplitSupport'] }, next: 'supportAssessment' },
        { id: 'speakWithTravelers', label: 'Ask what the travelers need first', hint: 'Learn who is hurt and what they are trying to save.', timeCost: 3, effects: { knowledge: ['Mara will leave the wagon if needed, but hopes to save her late mother’s medicine chest. Eli can walk with help.'], setFlags: ['heardTravelersPriorities'] }, next: 'travelerAssessment' },
        { id: 'scoutDownstream', label: 'Scout the riverbank for another crossing', hint: 'It will take time, but the bridge is not the only possibility.', timeCost: 17, effects: { knowledge: ['A shallow gravel shelf downstream may be fordable, though the current is already covering its lower stones.'], setFlags: ['foundDownstreamFord'] }, next: 'fordAssessment' },
        { id: 'turnBack', label: 'Turn back and take the long road', hint: 'Leaving is a valid choice; the travelers will decide what to do without you.', timeCost: 1, effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    supportAssessment: {
      id: 'supportAssessment', title: 'A Split Beneath the Water', tone: 'warning',
      text: 'You step onto the near end of the bridge and find the upstream support split just below the waterline. Mara and Eli stay on the near bank beside the wagon. The remaining deck could be braced to carry people one at a time, but the repair needs leverage and careful timing. The water has not yet reached the wagon axle.',
      textVariants: [
        { requirements: { minElapsedMinutes: 25 }, text: 'The split support shifts as a branch slams against it. The wagon wheel is now half sunk in mud. A brace could still help, but working beneath this span is more dangerous than it was a few minutes ago.' },
        { requirements: { minElapsedMinutes: 12 }, text: 'The water has climbed against the split support. A branch slams into it hard enough to shake the remaining deck. A brace could still help, but you can feel the time narrowing.' },
      ],
      choices: [
        { id: 'braceWithTools', label: 'Brace the support with your tool', hint: 'A toolkit, multi-tool, pry tool, or heavy brass candlestick gives better leverage.', requirements: { anyItems: BRIDGE_TOOLS }, timeCost: 7, chance: { probability: 0.78, bonusItems: SAFE_HANDLING, bonusProbability: 0.12, successNext: 'repairSuccess', failureNext: 'repairFailure', successMessage: 'Your tool seats the brace against sound timber before the support shifts.', failureMessage: 'The support moves while you set the brace; the deck drops another inch.', successEffects: { historyFlags: ['repaired_dangerous_crossing'], setFlags: ['bridgeBraced'] }, failureEffects: { health: -1, setFlags: ['bridgeWorsened'] } } },
        { id: 'braceByHand', label: 'Try a slow brace with loose timber', hint: 'Possible without tools, but you will work longer beside the current.', requirements: { notItems: BRIDGE_TOOLS }, timeCost: 12, chance: { probability: 0.54, successNext: 'repairSuccess', failureNext: 'repairFailure', successMessage: 'A wedged length of timber holds long enough to make a narrow passage.', failureMessage: 'The rough brace slips and the broken deck shifts under your hands.', successEffects: { historyFlags: ['repaired_dangerous_crossing'], setFlags: ['bridgeBraced'] }, failureEffects: { health: -2, setFlags: ['bridgeWorsened'] } } },
        { id: 'leaveSupportForPeople', label: 'Stop work and help the travelers instead', timeCost: 2, effects: { setFlags: ['leftRepairPlan'] }, next: 'travelerAssessment' },
      ],
    },
    repairFailure: {
      id: 'repairFailure', title: 'The Brace Slips', tone: 'danger',
      text: 'The timber slips with a crack, throwing river water across your sleeves. You have a bruised shoulder, not a broken arm, and the support has shifted—but the failed attempt has made the weak point unmistakable. On the near bank, Mara pulls Eli farther from the edge. The bridge is worse; the people are still here.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'The brace slips as the water surges. Your shoulder takes the blow, and the support shifts another inch. The wagon is sinking into the near-bank mud. There is no time for another repair attempt, but Mara and Eli are still within reach on that bank.' }],
      choices: [
        { id: 'helpAfterRepair', label: 'Get Eli and Mara across by hand', timeCost: 4, effects: { setFlags: ['repairAttemptFailed'] }, next: 'peopleFirst' },
        { id: 'sendThemDownstream', label: 'Leave the repair and return to Mara and Eli', timeCost: 3, effects: { setFlags: ['repairAttemptFailed'] }, next: 'travelerAssessment' },
        { id: 'leaveAfterRepair', label: 'Leave before the approach gives way', timeCost: 1, effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    repairSuccess: {
      id: 'repairSuccess', title: 'A Bridge That Holds', tone: 'warning',
      text: 'The brace takes the weight. You guide Eli across the narrow surviving deck to the far bank first, then Mara follows without the wagon. The medicine chest stays on the near bank, but both travelers reach safety. When the rain eases, Mara offers you the bridgewright’s spare hammer, a tool she had kept in the wagon for repairs.',
      choices: [
        { id: 'acceptBridgeHammer', label: 'Accept the bridgewright’s hammer', hint: 'Mara places the well-kept tool in your hand.', requirements: { notItems: ['bridgewrightHammer'] }, effects: { gainItems: ['bridgewrightHammer'], historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'repairEnding' },
        { id: 'declineBridgeHammer', label: 'Thank Mara and leave it with her', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'repairEnding' },
      ],
    },
    travelerAssessment: {
      id: 'travelerAssessment', title: 'People Before the Plan', tone: 'warning',
      text: 'Mara and Eli are together with you on the near bank; the far bank is across the broken bridge. Eli can stand, though he cannot move quickly. No animals are hitched to the wagon. A long leather strap that held its cargo lies loose beside the wheel; it can serve as a handline, though it is rougher and shorter than a travel rope. The wagon holds a medicine chest and ordinary trade goods. Mara will leave the cargo if needed, but asks you to hear the risks before deciding for her.',
      textVariants: [
        { requirements: { historyFlags: ['refused_mine_rescue'] }, text: 'Mara has heard that you once declined a rescue; she keeps her distance but still asks plainly for help. She and Eli are with you on the near bank, opposite the far bank beyond the broken bridge. Eli can stand, though he cannot move quickly. No animals are hitched to the wagon. Its long leather cargo strap lies loose beside the muddy wheel. The wagon holds medicine and trade goods. Mara will leave the cargo if needed, but asks you to hear the risks before deciding for her.' },
        { requirements: { minElapsedMinutes: 25 }, text: 'Mara and Eli are still on the near bank with you. Eli can stand, but the wagon wheel is now deep in mud and the bridge makes a low, repeated groan. No animals are hitched to the wagon. Its long leather cargo strap lies beside the wheel. The medicine chest and trade goods cannot both be saved with the people if the crossing shifts again.' },
      ],
      choices: [
        { id: 'useTravelRope', label: 'Set your rope as a bridge handline', hint: 'Anchor it on this bank to steady Mara and Eli across the broken deck.', requirements: { items: ['travelRope'] }, timeCost: 5, chance: { probability: 0.86, bonusItems: SAFE_HANDLING, bonusProbability: 0.1, successNext: 'ropeSuccess', failureNext: 'ropeSlip', successMessage: 'The rope holds firm as you guide Eli and Mara across one at a time.', failureMessage: 'The line jerks loose under a hard pull; no one falls, but the crossing is harder now.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -1, setFlags: ['lineSlipped'] } } },
        { id: 'improviseGuideLine', label: 'Use the wagon’s leather strap as a handline', hint: 'It is shorter and rougher than a travel rope, but can steady a careful crossing.', requirements: { notItems: ['travelRope'] }, timeCost: 9, chance: { probability: 0.62, bonusItems: SAFE_HANDLING, bonusProbability: 0.14, successNext: 'ropeSuccess', failureNext: 'ropeSlip', successMessage: 'The leather strap holds as you guide both travelers across in careful turns.', failureMessage: 'The rough strap burns through your grip and snaps loose of its first knot.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -2, setFlags: ['lineSlipped'] } } },
        { id: 'searchForLowerCrossing', label: 'Search downstream for a lower crossing', hint: 'A longer look may find a safer route, but the river keeps rising.', timeCost: 18, effects: { knowledge: ['A shallow gravel shelf downstream may be fordable, though the current is already covering its lower stones.'], setFlags: ['foundDownstreamFord'] }, next: 'fordAssessment' },
        { id: 'considerWagon', label: 'Try to save the wagon as well', hint: 'This gives the cargo a chance, but the extra load risks the crossing.', timeCost: 5, next: 'cargoDecision' },
      ],
    },
    ropeSlip: {
      id: 'ropeSlip', title: 'The Line Runs Loose', tone: 'danger',
      text: 'The improvised line snaps free and whips across the wet stones. No one has fallen, but your palm is cut and Eli is frightened. You, Mara, and Eli are still on the near bank. The bridge groans; trying the same crossing again from this spot would be a poor bet. A lower route or a slower plan remains possible.',
      choices: [
        { id: 'moveToPeoplePlan', label: 'Abandon the line and guide them by the deck', timeCost: 4, effects: { health: -1, historyFlags: ['helped_stranded_travelers'], setFlags: ['lineSlipped', 'peopleAcross', 'eliAcross', 'cargoLeft'] }, next: 'partialCrossing' },
        { id: 'sendPeopleToBank', label: 'Lead them along the near bank to the lower crossing', timeCost: 3, effects: { setFlags: ['lineSlipped'] }, next: 'fordAfterDelay' },
        { id: 'leaveThemSafe', label: 'Move them back from the edge and turn away', effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    peopleFirst: {
      id: 'peopleFirst', title: 'One Careful Crossing', tone: 'warning',
      text: 'The wagon stays behind. Eli will need an arm over the remaining deck, while Mara can follow under her own power. Water splashes over the first broken plank. You have warned them that a slip is possible and that the cargo cannot go with them.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'The wagon stays behind. Eli will need your arm over the remaining deck, now shuddering with each surge. Mara can follow on her own. You have warned them that a slip is possible and that the cargo cannot go with them.' }],
      choices: [
        { id: 'steadyWithRope', label: 'Use the rope to steady Eli', requirements: { items: ['travelRope'] }, timeCost: 5, chance: { probability: 0.84, bonusItems: SAFE_HANDLING, bonusProbability: 0.1, successNext: 'ropeSuccess', failureNext: 'partialCrossing', successMessage: 'The rope steadies Eli over the damaged section and Mara follows.', failureMessage: 'The rope catches a splinter; Eli reaches the bank, but you take the full strain.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['peopleAcross', 'cargoLeft'] } } },
        { id: 'guideByHand', label: 'Walk beside Eli across the remaining deck', requirements: { notItems: ['travelRope'] }, timeCost: 8, chance: { probability: 0.61, bonusItems: SAFE_HANDLING, bonusProbability: 0.12, successNext: 'ropeSuccess', failureNext: 'partialCrossing', successMessage: 'Eli makes it across with Mara close behind.', failureMessage: 'A plank drops under your heel; Eli makes the bank, but you are hurt and Mara is still on this side.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['eliAcross', 'cargoLeft'] } } },
        { id: 'retreatFromDeck', label: 'Retreat and take the lower route', timeCost: 2, effects: { setFlags: ['peoplePlanFailed'] }, next: 'fordAfterDelay' },
      ],
    },
    partialCrossing: {
      id: 'partialCrossing', title: 'One Side of the River', tone: 'danger',
      text: 'Eli has reached the far bank. You and Mara remain on the near bank beside the wagon, but the damaged deck is no longer safe for another crossing. The bridge is changing under the water; a downstream path is still open if Mara can manage the longer walk.',
      choices: [
        { id: 'leadMaraDownstream', label: 'Take Mara to the downstream ford', timeCost: 4, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, next: 'fordAfterDelay' },
        { id: 'signalEliForHelp', label: 'Ask Eli to call for help from the far bank', hint: 'He is safe, but help will take time to arrive.', timeCost: 12, effects: { historyFlags: ['returned_with_help'], setFlags: ['eliAcross', 'helpSummoned'] }, next: 'helpArrives' },
        { id: 'leaveAfterPartial', label: 'Move Mara clear and leave', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    cargoDecision: {
      id: 'cargoDecision', title: 'The Medicine Chest', tone: 'warning',
      text: 'Mara explains the choice without pretending it is easy. The wagon is still on the near-bank approach, and its medicine chest holds supplies she promised to deliver. Pulling the wagon across the broken bridge first may save it, but the added weight could shift the weak support while Eli and Mara are still on this bank. Taking them across first is safer for them, but likely leaves the wagon and the medicine behind. The rising river is narrowing the time for either plan.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'Water is already at the wagon axle on the near-bank approach. Mara explains the choice plainly: pull the wagon across the broken bridge first and the weak support may shift while Eli and Mara are still here, or take the people across first and leave her family’s medicine chest. The river is making the choice for you soon.' }],
      choices: [
        { id: 'peopleBeforeWagon', label: 'Take Eli and Mara first; leave the wagon', timeCost: 7, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, next: 'peopleFirst' },
        { id: 'wagonBeforePeople', label: 'Pull the wagon across before the people', hint: 'The added weight may shift the support; Mara agrees to the risk.', timeCost: 6, chance: { probability: 0.53, bonusItems: BRIDGE_TOOLS, bonusProbability: 0.16, successNext: 'cargoSuccess', failureNext: 'wagonShift', successMessage: 'The wagon rolls across while the support holds. Eli and Mara are still safe on this bank.', failureMessage: 'A wheel drops between the planks and the support lurches toward the current.', successEffects: { historyFlags: ['saved_cargo_over_people'], setFlags: ['cargoAcross'] }, failureEffects: { health: -2, setFlags: ['cargoLost', 'bridgeWorsened'] } } },
        { id: 'freeWagonLoad', label: 'Unload the chest, then use the lighter wagon', hint: 'Takes time but reduces the load and gives the people a chance to follow.', timeCost: 12, chance: { probability: 0.7, bonusItems: BRIDGE_TOOLS, bonusProbability: 0.12, successNext: 'costlySuccess', failureNext: 'wagonShift', successMessage: 'The lighter wagon crosses, and Mara and Eli follow while the brace holds.', failureMessage: 'Even lightened, the wagon catches a broken plank and slides toward the support.', successEffects: { historyFlags: ['helped_stranded_travelers'], setFlags: ['peopleAcross', 'cargoAcross', 'medicineSaved'] }, failureEffects: { health: -2, setFlags: ['cargoLost', 'bridgeWorsened'] } } },
      ],
    },
    wagonShift: {
      id: 'wagonShift', title: 'The Wagon Lurches', tone: 'danger',
      text: 'The wagon shifts hard enough to snap one of its leather cargo straps. Mara jumps clear; the medicine chest stays tied down by the other straps, and no one is beneath the wagon. The bridge is no longer safe to load. You and the travelers are still on the near bank. You can leave the property and move them away from the water, or wait for outside help.',
      choices: [
        { id: 'abandonWagonHelpPeople', label: 'Leave the wagon and get everyone clear', timeCost: 3, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLost'] }, next: 'peopleFirst' },
        { id: 'waitForHelpAtWagon', label: 'Signal for help and keep the wagon secured', timeCost: 10, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'walkAwayFromWagon', label: 'Move to safety and leave the crossing', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    cargoSuccess: {
      id: 'cargoSuccess', title: 'A Choice Mara Made With You', tone: 'warning',
      text: 'The wagon reaches the far bank first. Mara and Eli follow across and are unharmed, though Eli waits longer than he wanted to. Mara opens the medicine chest to confirm it survived and gives you the spare iron rope clamp she had kept with the wagon. She says it may be more useful to you than to her now.',
      choices: [
        { id: 'acceptRopeClamp', label: 'Accept Mara’s iron rope clamp', hint: 'She hands you the compact, sturdy clamp.', requirements: { notItems: ['ironRopeClamp'] }, effects: { gainItems: ['ironRopeClamp'], historyFlags: ['helped_stranded_travelers', 'saved_cargo_over_people'] }, next: 'cargoEnding' },
        { id: 'declineRopeClamp', label: 'Thank her and leave it with the wagon', effects: { historyFlags: ['helped_stranded_travelers', 'saved_cargo_over_people'] }, next: 'cargoEnding' },
      ],
    },
    costlySuccess: {
      id: 'costlySuccess', title: 'Everything Across, Not Everything Saved', tone: 'warning',
      text: 'The lightened wagon reaches the far side with Mara and Eli, but the medicine chest breaks loose on the last jolt and disappears into the current. Mara is disappointed and relieved at once. She thanks you for getting her brother across and makes no claim that the choice was simple.',
      choices: [
        { id: 'leaveCostlyCrossing', label: 'Continue downriver with them', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'costlyEnding' },
      ],
    },
    fordAssessment: {
      id: 'fordAssessment', title: 'A Gravel Shelf Downstream', tone: 'warning',
      text: 'You bring Mara and Eli with you down the near bank from the broken bridge. The gravel shelf crosses the river diagonally below a bend; its lower stones are wet but visible. It will take the three of you a while to reach it, and the current is quicker than it looks. If you go now, the crossing may be manageable; wait too long, and the shelf will be under water.',
      textVariants: [
        { requirements: { minElapsedMinutes: 25 }, text: 'The lower stones are nearly covered now. The ford is still possible, but the current has picked up branches and the crossing is no longer a safe walk. The bridge is shifting behind you; if the travelers try the ford, they will need your help.' },
        { requirements: { minElapsedMinutes: 12 }, text: 'The lower stones are partly covered now. The ford is still possible, but the current is stronger than when you first saw it. The travelers will need a guide.' },
      ],
      choices: [
        { id: 'crossEarlyFord', label: 'Guide them across the gravel shelf', hint: 'The longer walk is calmer than the broken bridge—for now.', requirements: { maxElapsedMinutes: 24 }, timeCost: 8, chance: { probability: 0.78, bonusItems: SAFE_HANDLING, bonusProbability: 0.1, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You find stable stones and guide Mara and Eli across before the shelf floods.', failureMessage: 'A submerged stone turns underfoot; you all reach the bank, shaken and bruised.', successEffects: { historyFlags: ['helped_stranded_travelers'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -2, setFlags: ['fordTried'] } } },
        { id: 'crossLateFord', label: 'Attempt the flooded gravel shelf', hint: 'The water is higher; a fall could injure you.', requirements: { minElapsedMinutes: 25 }, timeCost: 8, chance: { probability: 0.49, bonusItems: SAFE_HANDLING, bonusProbability: 0.14, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You pick a line through the stronger current and get the travelers across.', failureMessage: 'The current knocks you down and bruises your ribs before you reach the far bank.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['fordTried'] } } },
        { id: 'useFordForPeopleOnly', label: 'Take the people; leave the wagon', timeCost: 5, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, next: 'fordSuccess' },
        { id: 'leaveFordForHelp', label: 'Mark the route and fetch help', hint: 'The longer wait will likely cost the cargo and close the ford.', timeCost: 16, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
      ],
    },
    fordFailure: {
      id: 'fordFailure', title: 'The Current Takes Your Footing', tone: 'danger',
      text: 'A stone turns under the current. You and the travelers reach the far bank downstream, bruised but out of the water. Your ribs ache, and the ford is too deep to try the same way again. The wagon remains on the near bank, beyond reach. You can shelter on this bank while signaling for help, or lead the travelers away by the safer road.',
      choices: [
        { id: 'signalFromFord', label: 'Signal the far road for help', timeCost: 9, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'takeLongRoad', label: 'Lead them away by the long road', timeCost: 4, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLost'] }, next: 'fordSuccess' },
        { id: 'leaveThemSheltered', label: 'Make sure they are sheltered, then leave', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    fordAfterDelay: {
      id: 'fordAfterDelay', title: 'The Lower Bank', tone: 'warning',
      text: 'You have followed the near bank downstream from the bridge. Mara and Eli are with you. The gravel shelf crosses the river below a bend; its path is muddy and steep, and the rising water now makes it a risky wade. Move carefully, one at a time.',
      textVariants: [{ requirements: { flags: ['eliAcross'] }, text: 'You and Mara have followed the near bank downstream from the bridge; Eli is already waiting on the far bank. The gravel shelf crosses the river below a bend. Its path is muddy and steep, and the rising water now makes a crossing risky. You and Mara must wade carefully, one at a time, to join him.' }],
      choices: [
        { id: 'attemptDelayedFord', label: 'Wade the shelf to the far bank', hint: 'The warning is clear: the current may knock someone down.', timeCost: 7, chance: { probability: 0.52, bonusItems: SAFE_HANDLING, bonusProbability: 0.12, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You hold a line through the current and reach the far bank.', failureMessage: 'The current takes your footing, but you reach the far bank bruised.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['fordTried'] } } },
        { id: 'waitForRoadHelp', label: 'Wait on high ground and signal for help', timeCost: 12, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'leaveFromLowerBank', label: 'Leave by the road without crossing', effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    fordSuccess: {
      id: 'fordSuccess', title: 'A Longer Way Across', tone: 'safe',
      text: 'You, Mara, and Eli reach the far bank downstream. The wagon and its cargo remain on the near bank, but the crossing is made without asking the broken bridge to carry another load. Mara thanks you for taking the longer route while there was still time.',
      textVariants: [
        { requirements: { flags: ['helpSummoned'] }, text: 'Help arrives along the far road and guides the travelers to the crossing. The wagon remains on the near bank, but everyone is safe and the bridge can be closed before another cart approaches.' },
        { requirements: { flags: ['eliAcross'] }, text: 'You and Mara reach the far bank downstream, where Eli is waiting. The wagon and its cargo remain on the near bank; you avoided asking the broken bridge to carry another load.' },
      ],
      choices: [
        { id: 'completeFordRoute', label: 'Continue with the travelers', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'fordEnding' },
      ],
    },
    helpArrives: {
      id: 'helpArrives', title: 'Hands From the Far Road', tone: 'safe',
      text: 'Road wardens arrive along both river roads, reaching the near and far approaches with spare rope and a small hand winch. They bring anyone still separated onto high ground, then mark the bridge closed. Mara’s wagon remains on the near bank until the water falls. Nobody pretends the delay was free, but no one is left in the current.',
      choices: [
        { id: 'leaveWithWardens', label: 'Leave with the wardens and travelers', effects: { historyFlags: ['helped_stranded_travelers', 'returned_with_help', 'saved_people_over_cargo'] }, next: 'helpEnding' },
      ],
    },
    ropeSuccess: {
      id: 'ropeSuccess', title: 'A Line Held Firm', tone: 'safe',
      text: 'Mara and Eli reach the far bank one at a time. The wagon remains on the near bank, and the rope is frayed where it scraped the stone. Once everyone is safe, Mara offers you the sturdy iron clamp from her wagon gear, useful for securing a line without trusting a wet knot.',
      choices: [
        { id: 'acceptIronClamp', label: 'Accept the iron rope clamp', hint: 'Mara hands it over after the rescue; it is yours to keep.', requirements: { notItems: ['ironRopeClamp'] }, effects: { gainItems: ['ironRopeClamp'], historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'ropeEnding' },
        { id: 'leaveIronClamp', label: 'Leave the clamp with Mara', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'ropeEnding' },
      ],
    },
    turnBackEnding: {
      id: 'turnBackEnding', title: 'The Long Road',
      text: 'You take the road back before the crossing becomes worse. The travelers remain on high ground with shelter nearby and a clear warning not to approach the bridge. You have not solved their problem, but you have left without making it more dangerous.', choices: [], ending: 'success',
    },
    repairEnding: { id: 'repairEnding', title: 'A Narrow Passage', text: 'The brace holds long enough for two people, not a wagon. Mara and Eli continue toward the nearest settlement while the damaged bridge is marked closed. The river keeps rising behind you.', choices: [], ending: 'success' },
    ropeEnding: { id: 'ropeEnding', title: 'People Across', text: 'Mara and Eli are safe on the far bank. Their wagon remains behind, but they have time to return for it when the water falls. The bridge is left to the river.', choices: [], ending: 'success' },
    cargoEnding: { id: 'cargoEnding', title: 'The Wagon Makes It', text: 'The wagon and its medicine chest reach the far bank. Mara and Eli are safe, though they waited while the heavier load crossed. The bridge is closed before anyone else attempts it.', choices: [], ending: 'success' },
    costlyEnding: { id: 'costlyEnding', title: 'Safe, at a Cost', text: 'Mara and Eli make it across with the lighter wagon, but the medicine chest is gone to the river. Nobody calls the choice easy. The bridge is closed, and the three of you continue by the road.', choices: [], ending: 'success' },
    fordEnding: { id: 'fordEnding', title: 'The Downstream Crossing', text: 'The longer route gets the travelers across while the bridge continues to fail behind them. The wagon and its cargo remain, but Mara has her brother and the road wardens know the crossing is unsafe.', choices: [], ending: 'success' },
    helpEnding: { id: 'helpEnding', title: 'A Rescue Shared', text: 'The road wardens escort everyone away from the water. The wagon will be recovered later, if it can be. Mara thanks you for buying enough time for help to arrive.', choices: [], ending: 'success' },
  },
};
