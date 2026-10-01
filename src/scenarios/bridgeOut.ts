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
  runRandomSelections: [
    { id: 'fordState', values: [{ value: 'crossable', weight: 35 }, { value: 'risky', weight: 35 }, { value: 'tooHigh', weight: 30 }] },
    { id: 'travelerOne', values: ['Clara', 'June', 'Ruth', 'Lydia', 'Nora', 'Ada', 'Elsie', 'Cora', 'Mabel', 'Rose'].map((value) => ({ value })) },
    { id: 'travelerTwo', values: ['Amos', 'Wade', 'Silas', 'Calvin', 'Otis', 'Harlan', 'Emmett', 'Jonah', 'Everett', 'Isaac'].map((value) => ({ value })) },
  ],
  scenes: {
    arrival: {
      id: 'arrival', title: 'The Broken Crossing', tone: 'warning',
      text: 'You approach from the near bank. The bridge to the far bank has a hole in its middle; a shelter stands up the road.\n\nA wagon is stuck in river mud beside the near end. Runoff eats at one wheel; a surge could wash away its medicine and supplies.\n\n{{travelerOne}} braces it. Her injured brother {{travelerTwo}} sits on firm ground. No animals are hitched. Nobody is stranded across.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: '{{travelerOne}} knows of your earlier rescue. You approach from the near bank. The bridge to the far bank has a hole in its middle; a shelter stands up the road.\n\nA wagon is stuck in river mud beside the near end. Runoff eats at one wheel; a surge could wash away its medicine and supplies.\n\n{{travelerOne}} braces it. Her injured brother {{travelerTwo}} sits on firm ground. No animals are hitched. Nobody is stranded across.' }],
      choices: [
        { id: 'inspectSupports', label: 'Check the bridge supports', hint: 'Could a repair hold?', timeCost: 5, effects: { knowledge: ['The upstream support is split below the waterline; a quick plank repair alone will not hold.'], setFlags: ['foundSplitSupport'] }, next: 'supportAssessment' },
        { id: 'speakWithTravelers', label: 'Ask the travelers', hint: 'Learn who is hurt and what they hope to save.', timeCost: 3, effects: { knowledge: ['{{travelerOne}} will leave the wagon if needed, but hopes to save her late mother’s medicine chest. {{travelerTwo}} can walk with help.'], setFlags: ['heardTravelersPriorities'] }, next: 'travelerAssessment' },
        { id: 'scoutDownstream', label: 'Scout downstream', hint: 'The lower crossing is uncertain; this costs time.', timeCost: 17, effects: { knowledge: ['A shallow gravel shelf lies downstream; its crossing condition is uncertain.'], setFlags: ['foundDownstreamFord'] }, next: 'fordAssessment' },
        { id: 'turnBack', label: 'Take the long road', hint: 'Leave; they must decide without you.', timeCost: 1, effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    supportAssessment: {
      id: 'supportAssessment', title: 'A Split Beneath the Water', tone: 'warning',
      text: 'You step onto the near end of the bridge and find the upstream support split just below the waterline. {{travelerOne}} and {{travelerTwo}} stay on the near bank beside the wagon. The remaining deck could be braced to carry people one at a time, but the repair needs leverage and careful timing. The water has not yet reached the wagon axle.',
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
      text: 'The timber slips with a crack, throwing river water across your sleeves. You have a bruised shoulder, not a broken arm, and the support has shifted—but the failed attempt has made the weak point unmistakable. On the near bank, {{travelerOne}} pulls {{travelerTwo}} farther from the edge. The bridge is worse; the people are still here.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'The brace slips as the water surges. Your shoulder takes the blow, and the support shifts another inch. The wagon is sinking into the near-bank mud. There is no time for another repair attempt, but {{travelerOne}} and {{travelerTwo}} are still within reach on that bank.' }],
      choices: [
        { id: 'helpAfterRepair', label: 'Get {{travelerTwo}} and {{travelerOne}} across by hand', timeCost: 4, effects: { setFlags: ['repairAttemptFailed'] }, next: 'peopleFirst' },
        { id: 'sendThemDownstream', label: 'Leave the repair and return to {{travelerOne}} and {{travelerTwo}}', timeCost: 3, effects: { setFlags: ['repairAttemptFailed'] }, next: 'travelerAssessment' },
        { id: 'leaveAfterRepair', label: 'Leave before the approach gives way', timeCost: 1, effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    repairSuccess: {
      id: 'repairSuccess', title: 'A Bridge That Holds', tone: 'warning',
      text: 'The brace takes the weight. You guide {{travelerTwo}} across the narrow surviving deck to the far bank first, then {{travelerOne}} follows without the wagon. The medicine chest stays on the near bank, but both travelers reach safety. When the rain eases, {{travelerOne}} offers you the bridgewright’s spare hammer, a tool she had kept in the wagon for repairs.',
      choices: [
        { id: 'acceptBridgeHammer', label: 'Accept the bridgewright’s hammer', hint: '{{travelerOne}} places the well-kept tool in your hand.', requirements: { notItems: ['bridgewrightHammer'] }, effects: { gainItems: ['bridgewrightHammer'], historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'repairEnding' },
        { id: 'declineBridgeHammer', label: 'Thank {{travelerOne}} and leave it with her', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'repairEnding' },
      ],
    },
    travelerAssessment: {
      id: 'travelerAssessment', title: 'People Before the Plan', tone: 'warning',
      text: '{{travelerOne}} and {{travelerTwo}} are with you on the near bank. The bridge to the far bank has a broken middle; {{travelerTwo}} can walk with help. The wagon sits near the river, sinking in mud as runoff cuts beneath it. Its loose leather cargo strap can steady a person, not carry the wagon. Medicine and supplies are aboard. {{travelerOne}} will leave them if needed.',
      textVariants: [
        { requirements: { minElapsedMinutes: 25 }, text: 'The river has eaten more of the near-bank approach. {{travelerOne}} and {{travelerTwo}} stay on high ground; the wagon sinks lower, its medicine and supplies aboard. Its loose leather strap lies by the wheel. The bridge groans across the water. There may not be time to save both people and property.' },
        { requirements: { historyFlags: ['refused_mine_rescue'] }, text: '{{travelerOne}} remembers that you once declined a rescue, but asks for help anyway. You, {{travelerOne}}, and {{travelerTwo}} stand on the near bank; the far side is beyond the broken bridge. {{travelerTwo}} can walk with help. The wagon sinks near the river. Its loose leather strap lies by the wheel, and its medicine and supplies may be left behind.' },
      ],
      choices: [
        { id: 'useTravelRope', label: 'Set your rope as a bridge handline', hint: 'Anchor it on this bank to steady {{travelerOne}} and {{travelerTwo}} across the broken deck.', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, timeCost: 5, chance: { probability: 0.86, bonusItems: SAFE_HANDLING, bonusUpgrades: [{ itemId: 'travelRope', upgradeId: 'splicedEyes' }], bonusProbability: 0.1, successNext: 'ropeSuccess', failureNext: 'ropeSlip', successMessage: 'The rope holds firm as you guide {{travelerTwo}} and {{travelerOne}} across one at a time.', failureMessage: 'The line jerks loose under a hard pull; no one falls, but the crossing is harder now.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -1, damageItems: ['travelRope'], setFlags: ['lineSlipped'] } } },
        { id: 'improviseGuideLine', label: 'Use the wagon’s leather strap as a handline', hint: 'It is shorter and rougher than a travel rope, but can steady a careful crossing.', requirements: { notUsableItems: ['travelRope'] }, timeCost: 9, chance: { probability: 0.62, bonusItems: SAFE_HANDLING, bonusProbability: 0.14, successNext: 'ropeSuccess', failureNext: 'ropeSlip', successMessage: 'The leather strap holds as you guide both travelers across in careful turns.', failureMessage: 'The rough strap burns through your grip and snaps loose of its first knot.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -2, setFlags: ['lineSlipped'] } } },
        { id: 'searchForLowerCrossing', label: 'Take them downstream to scout', hint: 'It costs time to check the uncertain shelf.', timeCost: 18, effects: { knowledge: ['A shallow gravel shelf lies downstream; its crossing condition is uncertain.'], setFlags: ['foundDownstreamFord'] }, next: 'fordAssessment' },
        { id: 'considerWagon', label: 'Try to save the wagon as well', hint: 'This gives the cargo a chance, but the extra load risks the crossing.', timeCost: 5, next: 'cargoDecision' },
      ],
    },
    ropeSlip: {
      id: 'ropeSlip', title: 'The Line Runs Loose', tone: 'danger',
      text: 'The improvised line snaps free and whips across the wet stones. No one has fallen, but your palm is cut and {{travelerTwo}} is frightened. You, {{travelerOne}}, and {{travelerTwo}} are still on the near bank. The bridge groans; trying the same crossing again from this spot would be a poor bet. A lower route or a slower plan remains possible.',
      choices: [
        { id: 'moveToPeoplePlan', label: 'Abandon the line and guide them by the deck', timeCost: 4, effects: { health: -1, historyFlags: ['helped_stranded_travelers'], setFlags: ['lineSlipped', 'peopleAcross', 'eliAcross', 'cargoLeft'] }, next: 'partialCrossing' },
        { id: 'sendPeopleToBank', label: 'Lead them along the near bank to the lower crossing', timeCost: 3, effects: { setFlags: ['lineSlipped'] }, next: 'fordAfterDelay' },
        { id: 'leaveThemSafe', label: 'Move them back from the edge and turn away', effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    peopleFirst: {
      id: 'peopleFirst', title: 'One Careful Crossing', tone: 'warning',
      text: 'The wagon stays on the near bank. You and {{travelerTwo}} will cross the remaining deck first; {{travelerOne}} follows. The narrow boards still hold, though water laps over the lowest plank. The medicine and supplies must be left behind.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'The wagon stays on the near bank. The river has reached the first planks and the deck shudders under each surge. {{travelerTwo}} needs your arm; {{travelerOne}} can follow. You can still try, but waiting longer will close this route.' }],
      choices: [
        { id: 'steadyWithRope', label: 'Use the rope to steady {{travelerTwo}}', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, timeCost: 5, chance: { probability: 0.84, lateProbability: 0.57, lateAfterMinutes: 25, bonusItems: SAFE_HANDLING, bonusUpgrades: [{ itemId: 'travelRope', upgradeId: 'splicedEyes' }], bonusProbability: 0.1, successNext: 'ropeSuccess', failureNext: 'partialCrossing', successMessage: 'The rope steadies {{travelerTwo}} over the damaged section and {{travelerOne}} follows.', failureMessage: 'The rope catches a splinter; {{travelerTwo}} reaches the bank, but you take the full strain.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, damageItems: ['travelRope'], setFlags: ['peopleAcross', 'cargoLeft'] } } },
        { id: 'guideByHand', label: 'Walk beside {{travelerTwo}} across the deck', requirements: { notUsableItems: ['travelRope'] }, timeCost: 8, chance: { probability: 0.68, lateProbability: 0.36, lateAfterMinutes: 25, bonusItems: SAFE_HANDLING, bonusProbability: 0.12, successNext: 'ropeSuccess', failureNext: 'partialCrossing', successMessage: '{{travelerTwo}} makes it across with {{travelerOne}} close behind.', failureMessage: 'A plank drops under your heel; {{travelerTwo}} makes the bank, but you are hurt and {{travelerOne}} is still on this side.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['eliAcross', 'cargoLeft'] } } },
        { id: 'retreatFromDeck', label: 'Retreat and take the lower route', timeCost: 2, effects: { setFlags: ['peoplePlanFailed'] }, next: 'fordAfterDelay' },
      ],
    },
    partialCrossing: {
      id: 'partialCrossing', title: 'One Side of the River', tone: 'danger',
      text: '{{travelerTwo}} has reached the far bank. You and {{travelerOne}} remain on the near bank beside the wagon, but the damaged deck is no longer safe for another crossing. The bridge is changing under the water; a downstream path is still open if {{travelerOne}} can manage the longer walk.',
      choices: [
        { id: 'leadMaraDownstream', label: 'Take {{travelerOne}} to the downstream ford', timeCost: 4, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, next: 'fordAfterDelay' },
        { id: 'signalEliForHelp', label: 'Ask {{travelerTwo}} to call for help from the far bank', hint: 'He is safe, but help will take time to arrive.', timeCost: 12, effects: { historyFlags: ['returned_with_help'], setFlags: ['eliAcross', 'helpSummoned'] }, next: 'helpArrives' },
        { id: 'leaveAfterPartial', label: 'Move {{travelerOne}} clear and leave', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    cargoDecision: {
      id: 'cargoDecision', title: 'The Medicine Chest', tone: 'warning',
      text: '{{travelerOne}} stands with {{travelerTwo}} on the near bank, beside the wagon sunk in mud. It carries their medicine and travel supplies. Taking them across first protects the people but leaves the wagon; pulling the wagon first risks loading the split bridge while they wait. The river is rising. You cannot safely do everything.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'Runoff has carved a channel under the wagon’s downhill wheel; it may slide into the river. {{travelerOne}} and {{travelerTwo}} are on high ground. The bridge groans between this bank and the far side. You can try the heavy wagon, leave it and cross with the people, or wait for help while the supplies remain at risk.' }],
      choices: [
        { id: 'peopleBeforeWagon', label: 'Take {{travelerTwo}} and {{travelerOne}} first; leave the wagon', timeCost: 7, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLeft'] }, next: 'peopleFirst' },
        { id: 'wagonBeforePeople', label: 'Risk the wagon crossing first', hint: 'Its weight may shift the split support; the people wait on firm ground.', requirements: { maxElapsedMinutes: 37 }, timeCost: 6, chance: { probability: 0.53, lateProbability: 0.28, lateAfterMinutes: 25, bonusItems: BRIDGE_TOOLS, bonusProbability: 0.16, successNext: 'cargoSuccess', failureNext: 'wagonShift', successMessage: 'The wagon rolls across while the support holds. {{travelerTwo}} and {{travelerOne}} are still safe on this bank.', failureMessage: 'A wheel drops between the planks and the support lurches toward the current.', successEffects: { historyFlags: ['saved_cargo_over_people'], setFlags: ['cargoAcross'] }, failureEffects: { health: -2, setFlags: ['cargoLost', 'bridgeWorsened'] } } },
        { id: 'freeWagonLoad', label: 'Unload medicine, then risk the lighter wagon', hint: 'The reduced load helps, but the crossing still takes time.', requirements: { maxElapsedMinutes: 37 }, timeCost: 12, chance: { probability: 0.7, lateProbability: 0.38, lateAfterMinutes: 25, bonusItems: BRIDGE_TOOLS, bonusProbability: 0.12, successNext: 'costlySuccess', failureNext: 'wagonShift', successMessage: 'The lighter wagon crosses, and {{travelerOne}} and {{travelerTwo}} follow while the brace holds.', failureMessage: 'Even lightened, the wagon catches a broken plank and slides toward the support.', successEffects: { historyFlags: ['helped_stranded_travelers'], setFlags: ['peopleAcross', 'cargoAcross', 'medicineSaved'] }, failureEffects: { health: -2, setFlags: ['cargoLost', 'bridgeWorsened'] } } },
        { id: 'waitForRiver', label: 'Wait on high ground for the river to fall', hint: 'The people are safe here; the wagon may be lost.', timeCost: 45, next: 'waitEnding' },
      ],
    },
    wagonShift: {
      id: 'wagonShift', title: 'The Wagon Lurches', tone: 'danger',
      text: 'The wagon shifts hard enough to snap one of its leather cargo straps. {{travelerOne}} jumps clear; the medicine chest stays tied down by the other straps, and no one is beneath the wagon. The bridge is no longer safe to load. You and the travelers are still on the near bank. You can leave the property and move them away from the water, or wait for outside help.',
      choices: [
        { id: 'abandonWagonHelpPeople', label: 'Leave the wagon and get everyone clear', timeCost: 3, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLost'] }, next: 'peopleFirst' },
        { id: 'waitForHelpAtWagon', label: 'Signal for help and keep the wagon secured', timeCost: 10, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'walkAwayFromWagon', label: 'Move to safety and leave the crossing', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    cargoSuccess: {
      id: 'cargoSuccess', title: 'A Choice {{travelerOne}} Made With You', tone: 'warning',
      text: 'The wagon reaches the far bank first. {{travelerOne}} and {{travelerTwo}} follow across and are unharmed, though {{travelerTwo}} waits longer than he wanted to. {{travelerOne}} opens the medicine chest to confirm it survived and gives you the spare iron rope clamp she had kept with the wagon. She says it may be more useful to you than to her now.',
      choices: [
        { id: 'acceptRopeClamp', label: 'Accept {{travelerOne}}’s iron rope clamp', hint: 'She hands you the compact, sturdy clamp.', requirements: { notItems: ['ironRopeClamp'] }, effects: { gainItems: ['ironRopeClamp'], historyFlags: ['helped_stranded_travelers', 'saved_cargo_over_people'] }, next: 'cargoEnding' },
        { id: 'declineRopeClamp', label: 'Thank her and leave it with the wagon', effects: { historyFlags: ['helped_stranded_travelers', 'saved_cargo_over_people'] }, next: 'cargoEnding' },
      ],
    },
    costlySuccess: {
      id: 'costlySuccess', title: 'Everything Across, Not Everything Saved', tone: 'warning',
      text: 'The lightened wagon reaches the far side with {{travelerOne}} and {{travelerTwo}}, but the medicine chest breaks loose on the last jolt and disappears into the current. {{travelerOne}} is disappointed and relieved at once. She thanks you for getting her brother across and makes no claim that the choice was simple.',
      choices: [
        { id: 'leaveCostlyCrossing', label: 'Continue downriver with them', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'costlyEnding' },
      ],
    },
    fordAssessment: {
      id: 'fordAssessment', title: 'A Gravel Shelf Downstream', tone: 'warning',
      text: 'You have led {{travelerOne}} and {{travelerTwo}} down the near bank. The gravel shelf crosses diagonally below a bend; the far bank is opposite. The water is swift, and the route’s condition is clear now.',
      textVariants: [
        { requirements: { selections: { fordState: 'tooHigh' } }, text: 'The shelf is under brown water. This crossing is not passable; the bridge groans upstream. You, {{travelerOne}}, and {{travelerTwo}} are on the near bank.' },
        { requirements: { selections: { fordState: 'risky' }, minElapsedMinutes: 25 }, text: 'The stones are nearly covered, with branches spinning over them. {{travelerOne}} and {{travelerTwo}} are beside you on the near bank. A slip could sweep someone downstream.' },
        { requirements: { selections: { fordState: 'risky' } }, text: 'Water runs over the shelf. The stones are hard to see and the current tugs at your boots. {{travelerOne}} and {{travelerTwo}} are beside you on the near bank; crossing is possible, but dangerous.' },
        { requirements: { selections: { fordState: 'crossable' }, minElapsedMinutes: 25 }, text: 'Water covers the lower stones and carries small branches. {{travelerOne}} and {{travelerTwo}} are beside you on the near bank. The shelf remains passable, but no longer an easy walk.' },
        { requirements: { selections: { fordState: 'crossable' }, minElapsedMinutes: 12 }, text: 'Water has climbed over some lower stones. {{travelerOne}} and {{travelerTwo}} are with you on the near bank. The shelf is crossable, but needs a careful guide.' },
      ],
      choices: [
        { id: 'crossEarlyFord', label: 'Guide them across the gravel shelf', hint: 'The stones are visible; the river still runs fast.', requirements: { selections: { fordState: 'crossable' } }, timeCost: 8, chance: { probability: 0.86, lateProbability: 0.6, lateAfterMinutes: 25, bonusItems: SAFE_HANDLING, bonusProbability: 0.1, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You find stable stones and guide {{travelerOne}} and {{travelerTwo}} across.', failureMessage: 'A submerged stone turns underfoot; all three of you reach the far bank shaken and bruised.', successEffects: { historyFlags: ['helped_stranded_travelers'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -2, setFlags: ['fordTried'] } } },
        { id: 'crossLateFord', label: 'Try the fast, flooded shelf', hint: 'A bad step could sweep someone downstream; gloves improve your grip.', requirements: { selections: { fordState: 'risky' } }, timeCost: 8, chance: { probability: 0.62, lateProbability: 0.4, lateAfterMinutes: 25, bonusItems: SAFE_HANDLING, bonusProbability: 0.16, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You find a line through the current and lead both travelers across.', failureMessage: 'The current takes your footing; you reach the far side bruised, with the travelers shaken.', successEffects: { historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['fordTried'] } } },
        { id: 'shelterFromFord', label: 'Lead them back to the roadside shelter', timeCost: 4, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'shelterEnding' },
        { id: 'leaveFordForHelp', label: 'Mark the route and fetch help', hint: 'The longer wait will likely cost the cargo and close the ford.', timeCost: 16, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
      ],
    },
    fordFailure: {
      id: 'fordFailure', title: 'The Current Takes Your Footing', tone: 'danger',
      text: 'A stone turns under the current. You, {{travelerOne}}, and {{travelerTwo}} reach the far bank downstream, bruised but out of the water. Your ribs ache; the ford is too deep to try again. The wagon remains on the near bank, beyond reach. You can signal for help or lead the travelers away by the road.',
      choices: [
        { id: 'signalFromFord', label: 'Signal the far road for help', timeCost: 9, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'takeLongRoad', label: 'Lead them away by the long road', timeCost: 4, effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'], setFlags: ['peopleAcross', 'cargoLost'] }, next: 'fordSuccess' },
        { id: 'leaveThemSheltered', label: 'Make sure they are sheltered, then leave', effects: { historyFlags: ['abandoned_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    fordAfterDelay: {
      id: 'fordAfterDelay', title: 'The Lower Bank', tone: 'warning',
      text: 'You have followed the near bank downstream from the bridge. {{travelerOne}} and {{travelerTwo}} are with you. The gravel shelf crosses the river below a bend; its path is muddy and steep, and the rising water now makes it a risky wade. Move carefully, one at a time.',
      textVariants: [{ requirements: { flags: ['eliAcross'] }, text: 'You and {{travelerOne}} have followed the near bank downstream from the bridge; {{travelerTwo}} is already waiting on the far bank. The gravel shelf crosses the river below a bend. Its path is muddy and steep, and the rising water now makes a crossing risky. You and {{travelerOne}} must wade carefully, one at a time, to join him.' }],
      choices: [
        { id: 'attemptDelayedFord', label: 'Wade the shelf to the far bank', hint: 'The warning is clear: the current may knock someone down.', timeCost: 7, chance: { probability: 0.52, bonusItems: SAFE_HANDLING, bonusProbability: 0.12, successNext: 'fordSuccess', failureNext: 'fordFailure', successMessage: 'You hold a line through the current and reach the far bank.', failureMessage: 'The current takes your footing, but you reach the far bank bruised.', successEffects: { health: -1, historyFlags: ['helped_stranded_travelers', 'led_risky_crossing'], setFlags: ['peopleAcross', 'cargoLeft'] }, failureEffects: { health: -3, setFlags: ['fordTried'] } } },
        { id: 'waitForRoadHelp', label: 'Wait on high ground and signal for help', timeCost: 12, effects: { historyFlags: ['returned_with_help'], setFlags: ['helpSummoned', 'cargoLost'] }, next: 'helpArrives' },
        { id: 'leaveFromLowerBank', label: 'Leave by the road without crossing', effects: { historyFlags: ['walked_away_from_bridge_rescue'] }, next: 'turnBackEnding' },
      ],
    },
    fordSuccess: {
      id: 'fordSuccess', title: 'A Longer Way Across', tone: 'safe',
      text: 'You, {{travelerOne}}, and {{travelerTwo}} reach the far bank downstream. The wagon and its cargo remain on the near bank, but the crossing is made without asking the broken bridge to carry another load. {{travelerOne}} thanks you for taking the longer route while there was still time.',
      textVariants: [
        { requirements: { flags: ['fordTried'] }, text: 'You, {{travelerOne}}, and {{travelerTwo}} are on the far bank downstream, bruised from the failed first attempt. The wagon and supplies remain on the near bank. You chose the longer road rather than risk another crossing.' },
        { requirements: { flags: ['helpSummoned'] }, text: 'Help arrives along the far road and guides the travelers to the crossing. The wagon remains on the near bank, but everyone is safe and the bridge can be closed before another cart approaches.' },
        { requirements: { flags: ['eliAcross'] }, text: 'You and {{travelerOne}} reach the far bank downstream, where {{travelerTwo}} is waiting. The wagon and its cargo remain on the near bank; you avoided asking the broken bridge to carry another load.' },
      ],
      choices: [
        { id: 'completeFordRoute', label: 'Continue with the travelers', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'fordEnding' },
      ],
    },
    helpArrives: {
      id: 'helpArrives', title: 'Hands From the Far Road', tone: 'safe',
      text: 'Road wardens arrive along both river roads, reaching the near and far approaches with spare rope and a small hand winch. They bring anyone still separated onto high ground, then mark the bridge closed. {{travelerOne}}’s wagon remains on the near bank until the water falls. Nobody pretends the delay was free, but no one is left in the current.',
      choices: [
        { id: 'leaveWithWardens', label: 'Leave with the wardens and travelers', effects: { historyFlags: ['helped_stranded_travelers', 'returned_with_help', 'saved_people_over_cargo'] }, next: 'helpEnding' },
      ],
    },
    ropeSuccess: {
      id: 'ropeSuccess', title: 'A Line Held Firm', tone: 'safe',
      text: '{{travelerOne}} and {{travelerTwo}} reach the far bank one at a time. The wagon remains on the near bank, and the rope is frayed where it scraped the stone. Once everyone is safe, {{travelerOne}} offers you the sturdy iron clamp from her wagon gear, useful for securing a line without trusting a wet knot.',
      choices: [
        { id: 'acceptIronClamp', label: 'Accept the iron rope clamp', hint: '{{travelerOne}} hands it over after the rescue; it is yours to keep.', requirements: { notItems: ['ironRopeClamp'] }, effects: { gainItems: ['ironRopeClamp'], historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'ropeEnding' },
        { id: 'leaveIronClamp', label: 'Leave the clamp with {{travelerOne}}', effects: { historyFlags: ['helped_stranded_travelers', 'saved_people_over_cargo'] }, next: 'ropeEnding' },
      ],
    },
    turnBackEnding: {
      id: 'turnBackEnding', title: 'The Long Road',
      text: 'You take the road back before the crossing becomes worse. The travelers remain on high ground with shelter nearby and a clear warning not to approach the bridge. You have not solved their problem, but you have left without making it more dangerous.', choices: [], ending: 'success',
    },
    shelterEnding: { id: 'shelterEnding', title: 'A Dry Place to Wait', text: 'You lead {{travelerOne}} and {{travelerTwo}} back up the near-bank road to the wayside shelter. They are safe from the river, though the wagon and its supplies remain at risk. The crossing can wait for the wardens and lower water.', choices: [], ending: 'success' },
    waitEnding: { id: 'waitEnding', title: 'When the Water Falls', text: 'You keep the travelers on high ground and wait. By morning, the river has eased enough for wardens to guide them across. The wagon’s supplies are soaked; some may be lost. You chose caution, and the crossing was not yours to command.', choices: [], ending: 'success' },
    repairEnding: { id: 'repairEnding', title: 'A Narrow Passage', text: 'The brace holds long enough for two people, not a wagon. {{travelerOne}} and {{travelerTwo}} continue toward the nearest settlement while the damaged bridge is marked closed. The river keeps rising behind you.', choices: [], ending: 'success' },
    ropeEnding: { id: 'ropeEnding', title: 'People Across', text: '{{travelerOne}} and {{travelerTwo}} are safe on the far bank. Their wagon remains behind, but they have time to return for it when the water falls. The bridge is left to the river.', choices: [], ending: 'success' },
    cargoEnding: { id: 'cargoEnding', title: 'The Wagon Makes It', text: 'The wagon and its medicine chest reach the far bank. {{travelerOne}} and {{travelerTwo}} are safe, though they waited while the heavier load crossed. The bridge is closed before anyone else attempts it.', choices: [], ending: 'success' },
    costlyEnding: { id: 'costlyEnding', title: 'Safe, at a Cost', text: '{{travelerOne}} and {{travelerTwo}} make it across with the lighter wagon, but the medicine chest is gone to the river. Nobody calls the choice easy. The bridge is closed, and the three of you continue by the road.', choices: [], ending: 'success' },
    fordEnding: { id: 'fordEnding', title: 'The Downstream Crossing', text: 'The longer route gets the travelers across while the bridge continues to fail behind them. The wagon and its cargo remain, but {{travelerOne}} has her brother and the road wardens know the crossing is unsafe.', choices: [], ending: 'success' },
    helpEnding: { id: 'helpEnding', title: 'A Rescue Shared', text: 'The road wardens escort everyone away from the water. The wagon will be recovered later, if it can be. {{travelerOne}} thanks you for buying enough time for help to arrive.', choices: [], ending: 'success' },
  },
};

