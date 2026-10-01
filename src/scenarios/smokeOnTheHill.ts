import type { Choice, Scenario } from '../types';

const FIRE_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'bridgewrightHammer', 'ratCatchersHook', 'fireBeater'];
const BREATHING_GEAR = ['smokeHood', 'minerHeadlamp'];
const RESCUE_GEAR = ['travelRope', 'smokeHood', 'minerHeadlamp'];

function firebreakChoice(withTools: boolean): Choice {
  return {
    id: withTools ? 'clearFirebreakWithTool' : 'clearFirebreakByHand',
    label: withTools ? 'Cut a firebreak with your carried tool' : 'Scrape a firebreak with the shovel nearby',
    hint: withTools ? 'A hook or stout tool clears brush faster, but sparks may still jump the gap.' : 'The shovel is usable, though the wind and dry grass make this slow work.',
    requirements: withTools ? { anyItems: FIRE_TOOLS } : { notItems: FIRE_TOOLS },
    timeCost: withTools ? 5 : 10,
    chance: {
      probability: withTools ? 0.84 : 0.61,
      bonusItems: withTools ? FIRE_TOOLS : undefined,
      bonusProbability: withTools ? 0.08 : undefined,
      successNext: 'firebreakHolds',
      failureNext: 'firebreakFails',
      successMessage: 'The scraped strip is wide enough. The wind carries sparks across it, but the grass beyond does not catch.',
      failureMessage: 'A gust sends sparks over the half-cleared strip. The grass catches on the far side; you step back before it reaches you.',
      successEffects: { setFlags: ['firebreakHeld'], historyFlags: ['stopped_fire_spread'] },
      failureEffects: { health: -1, setFlags: ['fireSpread'] },
    },
  };
}

function loftRescueChoice(kind: 'rope' | 'hood' | 'bare'): Choice {
  const isRope = kind === 'rope';
  const isHood = kind === 'hood';
  return {
    id: `rescueEli${kind[0].toUpperCase()}${kind.slice(1)}`,
    label: isRope ? 'Lower a rope through the loft window' : isHood ? 'Cover up and enter through the side door' : 'Crawl beneath the smoke to reach the ladder',
    hint: isRope ? 'The rope gives Eli a line to follow without crossing the worst of the smoke.' : isHood ? 'The hood helps with smoke, but the hot, shifting loft remains dangerous.' : 'Smoke is already lowering under the eaves; you may have only one short attempt.',
    requirements: isRope ? { items: ['travelRope'] } : isHood ? { anyItems: BREATHING_GEAR } : { notItems: RESCUE_GEAR },
    timeCost: isRope || isHood ? 5 : 7,
    effects: { setFlags: ['entered_burning_structure', 'tried_person_rescue'], historyFlags: ['entered_burning_structure'] },
    chance: {
      probability: isRope ? 0.89 : isHood ? 0.84 : 0.63,
      bonusItems: isRope ? ['smokeHood', 'heavyLeatherGloves'] : isHood ? ['heavyLeatherGloves', 'travelRope'] : ['heavyLeatherGloves'],
      bonusProbability: 0.08,
      successNext: 'eliRescued',
      failureNext: 'loftSlip',
      successMessage: isRope ? 'The line holds. Eli finds it through the smoke, and you guide him clear.' : 'You reach Eli, keep low, and help him out before the roof shifts.',
      failureMessage: 'A burning brace drops across the route. You pull clear with a painful knock; another entry would be a serious gamble.',
      successEffects: { setFlags: ['eliSafe', 'sawBarnOccupants'], historyFlags: ['rescued_person_from_fire'] },
      failureEffects: { health: -2, setFlags: ['loftRouteBlocked'] },
    },
  };
}

function rewardChoices(ending: string): Choice[] {
  return [
    { id: `acceptSmokeHood${ending}`, label: 'Accept the smoke hood', requirements: { notItems: ['smokeHood'] }, effects: { gainItems: ['smokeHood'] }, next: ending },
    { id: `acceptFireBeater${ending}`, label: 'Accept the fire beater', requirements: { notItems: ['fireBeater'] }, effects: { gainItems: ['fireBeater'] }, next: ending },
    { id: `declineFireReward${ending}`, label: 'Thank them and leave without equipment', next: ending },
  ];
}

export const SMOKE_ON_THE_HILL: Scenario = {
  id: 'smoke-on-the-hill',
  title: 'Smoke on the Hill',
  subtitle: 'A distant plume, a shifting wind, and a choice made before the whole story is clear.',
  startScene: 'distantSmoke',
  timePhases: [
    { id: 'uncertain', label: 'Uncertain', atMinutes: 0 },
    { id: 'active', label: 'Active', atMinutes: 8 },
    { id: 'spreading', label: 'Spreading', atMinutes: 18 },
    { id: 'critical', label: 'Critical', atMinutes: 30 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 42 },
  ],
  scenes: {
    distantSmoke: {
      id: 'distantSmoke', title: 'Smoke on the Hill', tone: 'warning',
      text: 'A gray plume rises beyond the far ridge, where a lone homestead sits above the road. From here it could be a chimney, a controlled brush burn, or smoke carried from something gone wrong. No flame or person is visible. The wind is moving toward the dry grass below the hill.',
      textVariants: [
        { requirements: { historyFlags: ['rescued_person_from_fire'] }, text: 'Smoke rises beyond the far ridge. You have brought someone out of a burning place before, but from here this could still be a chimney, a controlled brush burn, or trouble. No flame or person is visible; the wind is moving toward dry grass.' },
        { requirements: { historyFlags: ['left_for_outside_help'] }, text: 'Smoke rises beyond the far ridge. You have gone for help before; still, this could be a chimney, a controlled burn, or a call for assistance. No flame or person is visible, and the wind is carrying the plume toward dry grass.' },
      ],
      choices: [
        { id: 'approachQuickly', label: 'Take the direct slope toward the smoke', hint: 'Fastest route, but the loose hillside and uncertain source make it harder going.', timeCost: 2, chance: { probability: 0.78, bonusItems: ['trailCompass', 'weatherproofCloak'], bonusProbability: 0.08, successNext: 'homesteadGate', failureNext: 'roughArrival', successMessage: 'You find a firm line down the slope and reach the lower road quickly.', failureMessage: 'Loose stones skid underfoot. You make it down, shaken and scraped, but lose time.', failureEffects: { health: -1 } } },
        { id: 'observeFromRoad', label: 'Climb to a rise and watch the plume', hint: 'A higher view costs a few minutes but may clarify the wind and direction.', timeCost: 3, next: 'ridgeObservation', effects: { knowledge: ['The smoke from the hill shifts low toward the eastern grass when the wind gusts.'] } },
        { id: 'goWarnNeighbors', label: 'Find the nearest neighbors and ask them to come', timeCost: 14, next: 'neighborsArrive', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'continuePastSmoke', label: 'Keep to your road and move on', next: 'walkAwayEnding', effects: { historyFlags: ['left_possible_fire_uninvestigated'] } },
      ],
    },
    ridgeObservation: {
      id: 'ridgeObservation', title: 'A Change in the Wind', tone: 'warning',
      text: 'From a rise in the road, the plume separates into two parts: a narrow column above the house and a lower smear drifting across the slope. That might be a cooking fire plus a brush burn. It might also be wind carrying smoke downhill. A short observation clarified the wind, not the source.',
      textVariants: [{ requirements: { minElapsedMinutes: 18 }, text: 'The wind has strengthened. The lower smoke now trails across the dry grass instead of lifting cleanly; what began as a distant question is becoming an active risk.' }],
      choices: [
        { id: 'takeFarmLane', label: 'Approach by the longer farm lane', hint: 'Safer footing; it costs several minutes.', timeCost: 6, next: 'homesteadGate' },
        { id: 'takeSteepCut', label: 'Use the steep cut to reach the property sooner', hint: 'The slope is loose; a stumble could cost time or health.', timeCost: 2, chance: { probability: 0.69, bonusItems: ['trailCompass', 'weatherproofCloak'], bonusProbability: 0.1, successNext: 'homesteadGate', failureNext: 'roughArrival', successMessage: 'You keep your footing and reach the property.', failureMessage: 'A patch of loose shale slides beneath you. You reach the lane with a bruised shoulder.', failureEffects: { health: -1 } } },
        { id: 'rideForNeighborsFromRidge', label: 'Ride to the nearest neighbors for help', timeCost: 13, next: 'neighborsArrive', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'leaveAfterWatching', label: 'Leave after checking from a distance', next: 'walkAwayEnding', effects: { historyFlags: ['left_possible_fire_uninvestigated'] } },
      ],
    },
    roughArrival: {
      id: 'roughArrival', title: 'A Scrape on the Slope', tone: 'warning',
      text: 'You catch yourself against a fence post. The slope has cost a little skin and a few minutes; smoke continues to move toward the grass. The property entrance is just ahead, or you can turn back without going closer.',
      choices: [
        { id: 'continueFromRoughArrival', label: 'Continue to the homestead gate', timeCost: 2, next: 'homesteadGate' },
        { id: 'retreatFromSlope', label: 'Turn back to the road', next: 'personalEscapeEnding' },
      ],
    },
    homesteadGate: {
      id: 'homesteadGate', title: 'At the Farm Gate', tone: 'danger',
      text: 'This is no longer just a distant plume. A brush pile has burned through its ring of stones and lit the grass beside a small hay barn. The farmhouse chimney is cold. No one is in sight; a pump stands by the yard, and a loose gate knocks in the wind.',
      textVariants: [{ requirements: { minElapsedMinutes: 18 }, text: 'The brush fire has reached the grass beside the hay barn. Sparks catch in the weeds and the wind keeps pushing them uphill toward the house. The farmhouse chimney is cold; no one is visible. A pump stands by the yard.' }],
      choices: [
        { id: 'checkBarnAtGate', label: 'Go to the barn and call inside', timeCost: 2, next: 'barnDiscovery', effects: { setFlags: ['sawBarnOccupants'], knowledge: ['A voice and frightened goats are inside the smoky hay barn.'] } },
        { id: 'inspectYardPump', label: 'Check the yard pump and water trough', timeCost: 2, next: 'pumpDiscovery' },
        { id: 'fetchNeighborsFromGate', label: 'Get help from the nearest neighbors', hint: 'A rider may be faster, but costs 2 coins if you can spare it.', timeCost: 12, next: 'neighborsArrive', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'hireRiderFromGate', label: 'Pay 2 coins to send a rider for help', requirements: { minMoney: 2 }, timeCost: 5, effects: { money: -2, historyFlags: ['left_for_outside_help'] }, next: 'neighborsArrive' },
      ],
    },
    barnDiscovery: {
      id: 'barnDiscovery', title: 'The Barn Door', tone: 'danger',
      text: 'Now you can hear a man shouting from the loft and goats beating at a stall gate below him. Eli, the farmhand, is trapped above the main door; smoke is already gathering under the rafters. The side door is warped but reachable. A safer rescue may take time, and the fire is still moving outside.',
      textVariants: [
        { requirements: { minElapsedMinutes: 30 }, text: 'Eli shouts from the loft while goats crowd the lower stall. Smoke has sunk almost to the ladder, and the roof timbers pop overhead. You can still attempt a rescue, but there is no time to search for every possible advantage.' },
        { requirements: { minElapsedMinutes: 18 }, text: 'Eli shouts from the loft while the goats crowd the lower stall. Smoke now fills the route to the lower gate; you cannot reach it safely. The loft is still reachable for one brief attempt, or you can leave and protect yourself.' },
      ],
      choices: [
        loftRescueChoice('rope'),
        loftRescueChoice('hood'),
        loftRescueChoice('bare'),
        { id: 'freeGoatsFirst', label: 'Open the lower stall and drive the goats out', requirements: { maxElapsedMinutes: 17 }, timeCost: 7, next: 'goatRescueAttempt', effects: { historyFlags: ['prioritized_livestock_during_fire'] } },
        { id: 'protectHouseBeforeRescue', label: 'Clear a firebreak toward the farmhouse', timeCost: 3, next: 'firebreakAttempt', effects: { historyFlags: ['prioritized_property_during_fire'] } },
        { id: 'retreatFromBarn', label: 'Back away and seek help', next: 'retreatFromFireEnding', effects: { historyFlags: ['left_burning_homestead'] } },
      ],
    },
    loftSlip: {
      id: 'loftSlip', title: 'The Ladder Shifts', tone: 'danger',
      text: 'A hot brace has blocked the direct route. Your bruises and coughing are warning enough: the roof is moving, and the smoke is lowering. Eli is still calling, but another attempt from inside could leave you trapped too.',
      choices: [
        { id: 'retreatAfterLoftSlip', label: 'Get clear and bring help', timeCost: 2, next: 'retreatFromFireEnding', effects: { historyFlags: ['left_for_outside_help'] } },
        { id: 'tryWindowAfterSlip', label: 'Use the loft window from outside', hint: 'A rope makes this possible; without one, the drop and heat are dangerous.', requirements: { items: ['travelRope'] }, timeCost: 3, chance: { probability: 0.74, bonusItems: ['smokeHood', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'eliRescued', failureNext: 'personalEscapeEnding', successMessage: 'The rope reaches the sill and Eli climbs down as the roof shifts.', failureMessage: 'The line snags on a hot shutter. You retreat before the window gives way.', successEffects: { setFlags: ['eliSafe', 'sawBarnOccupants'], historyFlags: ['rescued_person_from_fire'] }, failureEffects: { health: -1 } } },
      ],
    },
    eliRescued: {
      id: 'eliRescued', title: 'Out of the Smoke', tone: 'warning',
      text: 'Eli is coughing but on his feet. He says the goats are still in the lower stall and that the fire began when a gust tipped a lantern beside a brush pile he had been tending. The house lies upwind for now; grass is catching in spots.',
      textVariants: [{ requirements: { minElapsedMinutes: 18 }, text: 'Eli is out, coughing hard. The tipped lantern started the brush pile; wind carried the fire to the barn, and now sparks are reaching the grass toward the house. The goats remain inside.' }],
      choices: [
        { id: 'takeGoatsAfterEli', label: 'Return for the goats with Eli’s directions', timeCost: 5, next: 'goatRescueAttempt', effects: { historyFlags: ['prioritized_livestock_during_fire'] } },
        { id: 'protectHouseAfterEli', label: 'Secure a firebreak toward the house', timeCost: 3, next: 'firebreakAttempt', effects: { setFlags: ['prioritized_property_during_fire'], historyFlags: ['prioritized_property_during_fire'] } },
        { id: 'getWaterAfterEli', label: 'Use the yard pump to douse the grass', timeCost: 3, next: 'pumpDiscovery' },
        { id: 'leaveWithEli', label: 'Lead Eli away from the burning barn', next: 'eliThanks' },
      ],
    },
    eliThanks: {
      id: 'eliThanks', title: 'A Tool for the Road', tone: 'safe',
      text: 'Safe on the lane, Eli thanks you for coming back through the smoke. He insists you take one of his two spare pieces of rescue gear: a smoke hood for bad air, or a fire beater for small ground fires. You can take one or leave both for the next crew.',
      choices: rewardChoices('rescuedPersonEnding'),
    },
    goatRescueAttempt: {
      id: 'goatRescueAttempt', title: 'A Gate in the Smoke', tone: 'danger',
      text: 'The stall latch is hot and the goats are pushing against it. Smoke is thicker near the floor. You can work from the outer gate, or use a carried tool or gloves to avoid gripping the heated latch directly.',
      choices: [
        { id: 'openGoatGateWithGear', label: 'Use your tool or gloves on the latch', requirements: { anyItems: ['ratCatchersHook', 'pocketToolkit', 'foremanMultiTool', 'heavyLeatherGloves', 'brassCandlestick'] }, timeCost: 4, chance: { probability: 0.86, bonusItems: ['smokeHood', 'travelRope'], bonusProbability: 0.08, successNext: 'goatsSaved', failureNext: 'goatsLost', successMessage: 'The latch shifts. The goats surge into the yard and follow the fence uphill.', failureMessage: 'The latch slips and swings back. You clear the doorway as smoke fills the passage.', successEffects: { setFlags: ['goatsSafe'], historyFlags: ['rescued_livestock_from_fire'] }, failureEffects: { health: -1, setFlags: ['goatsLost'] } } },
        { id: 'openGoatGateByHand', label: 'Lift the latch with a wrapped sleeve', requirements: { notItems: ['ratCatchersHook', 'pocketToolkit', 'foremanMultiTool', 'heavyLeatherGloves', 'brassCandlestick'] }, hint: 'The iron is hot and the animals are panicking; take care not to get pinned.', timeCost: 7, chance: { probability: 0.65, successNext: 'goatsSaved', failureNext: 'goatsLost', successMessage: 'You lift the latch and guide the goats out in a noisy rush.', failureMessage: 'A goat knocks you off balance. You get clear, but the gate catches again.', successEffects: { setFlags: ['goatsSafe'], historyFlags: ['rescued_livestock_from_fire'] }, failureEffects: { health: -2, setFlags: ['goatsLost'] } } },
      ],
    },
    goatsSaved: {
      id: 'goatsSaved', title: 'Up the Fence Line', tone: 'warning',
      text: 'The goats reach a bare patch above the yard. The barn is still burning, and the fire has begun to cross the grass toward the house. You have saved the animals; the next minutes can only be spent on one more priority.',
      choices: [
        { id: 'breakAfterGoats', label: 'Clear a strip between the fire and house', timeCost: 5, next: 'firebreakAttempt', effects: { historyFlags: ['prioritized_property_during_fire'] } },
        { id: 'pumpAfterGoats', label: 'Try the yard pump against the grass fire', timeCost: 3, next: 'pumpDiscovery' },
        { id: 'leaveAfterGoats', label: 'Take the goats and get clear', next: 'animalsSavedEnding' },
      ],
    },
    goatsLost: {
      id: 'goatsLost', title: 'The Stall Holds', tone: 'danger',
      text: 'The gate will not open in time. You are clear of the doorway, but the goats remain inside. Smoke is moving down across the yard; another entry would risk both you and Eli if he is still in the loft.',
      choices: [
        { id: 'makeBreakAfterGoatsLost', label: 'Keep the fire from reaching the house', timeCost: 4, next: 'firebreakAttempt' },
        { id: 'getPumpAfterGoatsLost', label: 'Try to get water flowing', timeCost: 2, next: 'pumpDiscovery' },
        { id: 'retreatAfterGoatsLost', label: 'Move away from the barn', next: 'retreatFromFireEnding' },
      ],
    },
    firebreakAttempt: {
      id: 'firebreakAttempt', title: 'Sparks in the Dry Grass', tone: 'danger',
      text: 'Sparks are skipping ahead of the fire. The grass is dry enough to catch, and the wind is strengthening. A spade lies beside the fence; cutting a wide strip may stop the spread, but it will cost time while the barn continues to burn.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The fire has reached the fence line. Sparks are crossing faster than you can watch them; the roof has begun to sag. A final firebreak may still protect the house, but there is no safe time for a second attempt.' }],
      choices: [firebreakChoice(true), firebreakChoice(false), { id: 'leaveFirebreak', label: 'Abandon the line and get clear', next: 'retreatFromFireEnding' }],
    },
    firebreakHolds: {
      id: 'firebreakHolds', title: 'The Wind Tests the Line', tone: 'warning',
      text: 'The cleared strip holds for now. Beyond it, the barn roof pops and a low gray layer slides through the yard. You have slowed the spread, but the smoke makes it hard to tell what remains inside.',
      textVariants: [{ requirements: { flags: ['eliSafe'] }, text: 'The cleared strip holds. Eli is safe outside the yard, while the barn roof pops behind you. Smoke has lowered across the fence, but the farmhouse is still beyond the break.' }],
      choices: [
        { id: 'secureHouseAfterBreak', label: 'Keep the firebreak clear around the house', timeCost: 4, next: 'houseAftermath', effects: { historyFlags: ['protected_property_from_fire'] } },
        { id: 'leaveAfterBreak', label: 'Stay behind the safe line and withdraw', next: 'fireContainedEnding' },
      ],
    },
    firebreakFails: {
      id: 'firebreakFails', title: 'The Wind Jumps the Gap', tone: 'danger',
      text: 'Sparks land beyond the strip and catch in the grass. You stamp out the nearest patch, but the wind keeps feeding the fire toward the house. Your warning was visible; the spread has simply outrun this attempt.',
      choices: [
        { id: 'lookForPumpAfterBreakFail', label: 'Find water before the next gust', timeCost: 2, next: 'pumpDiscovery' },
        { id: 'retreatAfterBreakFail', label: 'Withdraw from the yard', next: 'retreatFromFireEnding' },
      ],
    },
    pumpDiscovery: {
      id: 'pumpDiscovery', title: 'The Yard Pump', tone: 'warning',
      text: 'The hand pump draws from a shallow well. Its handle is stiff, and the hose coupling has slipped, but the trough holds enough water for a short effort. Smoke drifts over the yard; working on the pump will cost minutes.',
      textVariants: [{ requirements: { minElapsedMinutes: 18 }, text: 'The hand pump is stiff and its coupling has slipped. The barn roof crackles in the stronger wind. The trough water can still help, but this will not put out the whole fire.' }],
      choices: [
        { id: 'repairPumpWithTool', label: 'Fix the coupling with a carried tool', requirements: { anyItems: ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'brassBottleOpener'] }, timeCost: 3, chance: { probability: 0.88, successNext: 'pumpReady', failureNext: 'pumpFails', successMessage: 'The fitting seats, and water reaches the hose.', failureMessage: 'The old coupling splits under pressure. The trough is still available, but the pump cannot be used.', successEffects: { setFlags: ['pumpWorking'] }, failureEffects: { setFlags: ['pumpBroken'] } } },
        { id: 'workPumpByHand', label: 'Seat the coupling and work the handle', requirements: { notItems: ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'brassBottleOpener'] }, hint: 'You can try without tools, but the worn fitting may fail.', timeCost: 6, chance: { probability: 0.64, successNext: 'pumpReady', failureNext: 'pumpFails', successMessage: 'After several strokes, the coupling holds and water runs.', failureMessage: 'The coupling slips again. You can still use the open trough, but the pump will not help.', successEffects: { setFlags: ['pumpWorking'] }, failureEffects: { setFlags: ['pumpBroken'] } } },
        { id: 'useTroughWater', label: 'Carry water from the trough by hand', timeCost: 7, next: 'waterAtGrass' },
        { id: 'leavePump', label: 'Leave the pump and get clear', next: 'retreatFromFireEnding' },
      ],
    },
    pumpReady: {
      id: 'pumpReady', title: 'Water in the Hose', tone: 'warning',
      text: 'The pump is working, though the flow is narrow. You can wet the grass between the barn and house, or carry water to someone still near the outbuilding. The fire will keep moving while you choose.',
      choices: [
        { id: 'douseGrassWithPump', label: 'Wet the grass between barn and house', timeCost: 4, next: 'waterAtGrass', effects: { setFlags: ['waterUsedOnFire'] } },
        { id: 'wetGrassTowardBarn', label: 'Wet the grass beyond the yard fence', timeCost: 4, next: 'waterAtGrass' },
        { id: 'withdrawFromWorkingPump', label: 'Leave the hose running and retreat', next: 'fireContainedEnding' },
      ],
    },
    pumpFails: {
      id: 'pumpFails', title: 'A Split Coupling', tone: 'warning',
      text: 'The old coupling gives way. The trough remains, but the pump is out of action. A failed repair has cost time, not trapped you; smoke now gathers lower in the yard.',
      choices: [
        { id: 'bucketAfterPumpFail', label: 'Carry water from the trough', timeCost: 7, next: 'waterAtGrass' },
        { id: 'retreatAfterPumpFail', label: 'Withdraw from the property', next: 'retreatFromFireEnding' },
      ],
    },
    waterAtGrass: {
      id: 'waterAtGrass', title: 'A Wet Strip', tone: 'warning',
      text: 'Water darkens a narrow strip of grass. It may slow the fire toward the house, but it cannot quench the barn. Smoke hides the yard beyond the fence; if anyone is still there, you will need to decide whether to go back.',
      textVariants: [{ requirements: { flags: ['eliSafe'] }, text: 'The wet strip slows sparks toward the house. Eli is clear, but the goats and barn remain at risk. You cannot cover every part of the yard with this small supply.' }],
      choices: [
        { id: 'holdWaterLine', label: 'Stay to protect the farmhouse', timeCost: 2, next: 'houseAftermath', effects: { historyFlags: ['protected_property_from_fire'] } },
        { id: 'leaveWaterLine', label: 'Withdraw before the smoke lowers further', next: 'fireContainedEnding' },
      ],
    },
    neighborsArrive: {
      id: 'neighborsArrive', title: 'Help on the Lane', tone: 'warning',
      text: 'The neighbors reach the property with a handcart and wet sacks. The smoke has spread from the brush pile to the barn; from the lane they cannot tell whether anyone or any animals remain inside. They can help with one task, not every task at once.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The neighbors arrive as the barn roof begins to sag. They can hold a line and guide someone out, or keep sparks from the farmhouse. The goats are still unseen; there is time for one coordinated effort.' }],
      choices: [
        { id: 'neighborsCheckBarn', label: 'Ask them to search the barn with you', timeCost: 3, next: 'barnWithNeighbors', effects: { setFlags: ['sawBarnOccupants'] } },
        { id: 'neighborsMakeFirebreak', label: 'Have them widen the firebreak', timeCost: 3, next: 'firebreakWithNeighbors' },
        { id: 'neighborsBringWater', label: 'Set up the pump and carry water', timeCost: 3, next: 'pumpReady' },
        { id: 'neighborsEscortedAway', label: 'Ask them to watch the lane while you withdraw', next: 'outsideHelpEnding' },
      ],
    },
    barnWithNeighbors: {
      id: 'barnWithNeighbors', title: 'A Second Pair of Hands', tone: 'danger',
      text: 'At the barn, the neighbors hear Eli above and the goats behind the lower gate. They can hold the ladder or open the stall, but doing both would expose everyone to the same failing roof.',
      textVariants: [{ requirements: { minElapsedMinutes: 18 }, text: 'The roof has begun to sag, and smoke sinks beneath the loft. Eli is above; the goats remain behind the lower gate, but the neighbors can only make one brief attempt before the roof becomes unsafe.' }],
      choices: [
        { id: 'neighborsLiftEli', label: 'Have them steady the ladder for Eli', timeCost: 3, chance: { probability: 0.88, bonusItems: ['travelRope', 'smokeHood', 'minerHeadlamp'], bonusProbability: 0.08, successNext: 'eliRescued', failureNext: 'loftSlip', successMessage: 'With the neighbors holding the ladder, Eli gets down before the brace shifts.', failureMessage: 'The ladder twists against the wall. Everyone backs out as smoke fills the loft.', successEffects: { setFlags: ['eliSafe'], historyFlags: ['rescued_person_from_fire'] }, failureEffects: { health: -1 } } },
        { id: 'neighborsOpenGoatStall', label: 'Have them hold the gate while you guide goats out', requirements: { maxElapsedMinutes: 17 }, timeCost: 4, next: 'goatRescueAttempt', effects: { historyFlags: ['prioritized_livestock_during_fire'] } },
        { id: 'neighborsHoldHouseSide', label: 'Send them to guard the farmhouse side', timeCost: 2, next: 'houseAftermath', effects: { historyFlags: ['protected_property_from_fire'] } },
        { id: 'retreatWithNeighbors', label: 'Withdraw together from the barn', next: 'outsideHelpEnding' },
      ],
    },
    firebreakWithNeighbors: {
      id: 'firebreakWithNeighbors', title: 'The Firebreak Holds', tone: 'warning',
      text: 'Together, you scrape and wet a wide strip. The sparks stop short of the farmhouse for now. The barn remains involved; the neighbors can help you check it, or they can hold the safe side of the line while you leave the yard.',
      choices: [
        { id: 'checkBarnAfterNeighborsBreak', label: 'Search the barn with the neighbors', timeCost: 3, next: 'barnWithNeighbors' },
        { id: 'securePropertyWithNeighbors', label: 'Stay and protect the farmhouse', next: 'houseAftermath', effects: { historyFlags: ['protected_property_from_fire'] } },
        { id: 'leaveAfterNeighborsBreak', label: 'Leave while the firebreak holds', next: 'outsideHelpEnding' },
      ],
    },
    retreatFromFireEnding: {
      id: 'retreatFromFireEnding', title: 'Back to the Lane', tone: 'warning',
      text: 'You get beyond the fence before the smoke lowers further. The barn remains in danger, but you are clear. You can warn the next traveler from the road or keep moving; neither choice changes what happened inside.',
      choices: [
        { id: 'warnFromLane', label: 'Warn travelers and leave the gate marked', effects: { historyFlags: ['warned_travelers_of_fire'] }, next: 'personalEscapeEnding' },
        { id: 'leaveFromLane', label: 'Continue down the road', effects: { historyFlags: ['left_burning_homestead'] }, next: 'walkAwayEnding' },
      ],
    },
    rescuedPersonEnding: {
      id: 'rescuedPersonEnding', title: 'A Costly Rescue', tone: 'safe', ending: 'success',
      text: 'Eli is safe on the lane. The barn and its animals are lost to the fire, but the house remains beyond the spreading grass. The rescue mattered; so did the time it required.',
      choices: [],
    },
    animalsSavedEnding: {
      id: 'animalsSavedEnding', title: 'The Goats Reach High Ground', tone: 'safe', ending: 'success',
      text: 'The goats are safe above the yard. The barn is damaged, and you cannot tell whether anyone reached the lane before the smoke thickened. You chose the lives you could reach.',
      choices: [],
    },
    houseAftermath: {
      id: 'houseAftermath', title: 'The House Stands', tone: 'safe',
      text: 'The wet strip holds while the barn burns down to its frame. You never learned who or what was inside. The neighbors check the farmhouse as the sparks die; the house is safe, but the choice has a cost.',
      textVariants: [
        { requirements: { flags: ['sawBarnOccupants', 'eliSafe', 'goatsSafe'] }, text: 'The wet strip holds while the barn burns down to its frame. Eli and the goats are outside, coughing and shaken, as the neighbors check the farmhouse. The house is safe; the barn is gone.' },
        { requirements: { flags: ['sawBarnOccupants', 'eliSafe', 'goatsLost'] }, text: 'The wet strip holds while the barn burns down to its frame. Eli is outside with the neighbors, but you saw the goats behind the lower stall when you left it. The house is safe; the barn and the animals still inside are lost.' },
        { requirements: { flags: ['sawBarnOccupants', 'goatsLost'] }, text: 'The wet strip holds while the barn burns down to its frame. The goats you saw behind the lower stall did not get out; Eli’s fate is still unknown. The house is safe, but the fire has taken the barn.' },
        { requirements: { flags: ['sawBarnOccupants', 'eliSafe'] }, text: 'The wet strip holds while the barn burns down to its frame. Eli is outside with the neighbors. You had heard the goats in the lower stall, but smoke hid their fate when you withdrew. The house is safe; the barn is gone.' },
        { requirements: { flags: ['sawBarnOccupants', 'goatsSafe'] }, text: 'The wet strip holds while the barn burns down to its frame. The goats are safe above the yard. You had heard Eli calling from the loft, but do not know whether he escaped before the roof fell. The house is safe; the barn is gone.' },
        { requirements: { flags: ['sawBarnOccupants'] }, text: 'The wet strip holds while the barn burns down to its frame. You had heard Eli calling from the loft and goats in the lower stall, but smoke hid what happened to those still inside when you chose the house. The house is safe; the barn is gone.' },
        { requirements: { flags: ['eliSafe'] }, text: 'The wet strip holds while the barn burns down to its frame. Eli is safe outside the yard, but you never learned who or what else was in the barn. The house is safe; the barn is gone.' },
      ],
      choices: [{ id: 'leaveAfterHouseFire', label: 'Leave with the neighbors', next: 'propertyProtectedEnding' }],
    },
    propertyProtectedEnding: {
      id: 'propertyProtectedEnding', title: 'The House Stands', tone: 'safe', ending: 'success',
      text: 'The farmhouse stands beyond the scorched yard. You leave knowing the barn is gone and that protecting the house meant spending time you could not give elsewhere.',
      textVariants: [
        { requirements: { flags: ['eliSafe', 'goatsSafe'] }, text: 'The farmhouse stands, and Eli and the goats are safe outside. The barn is gone. You leave with them as the neighbors begin counting what can be salvaged.' },
        { requirements: { flags: ['eliSafe', 'goatsLost'] }, text: 'The farmhouse stands and Eli is safe. The goats you knew were behind the stall did not get out before the barn fell. You leave with the neighbors in the quiet after the fire.' },
        { requirements: { flags: ['eliSafe'] }, text: 'The farmhouse stands and Eli is safe. You never learned who or what else was in the barn. You leave with the neighbors as the fire settles.' },
      ],
      choices: [],
    },
    fireContainedEnding: {
      id: 'fireContainedEnding', title: 'Beyond the Fireline', tone: 'safe', ending: 'success',
      text: 'The fire is held to the barn and the scorched grass. The farmhouse is safe for now, though the barn is badly damaged. No one can save every part of the property in the time available.',
      choices: [],
    },
    outsideHelpEnding: {
      id: 'outsideHelpEnding', title: 'The Neighbors Take the Line', tone: 'safe', ending: 'success',
      text: 'The neighbors keep the lane clear and hold the wet line around the farmhouse. Their help limits the spread, though the barn is badly damaged. You acted before knowing everything, and brought others before the last route closed.',
      choices: [],
    },
    personalEscapeEnding: {
      id: 'personalEscapeEnding', title: 'Clear of the Smoke', tone: 'safe', ending: 'success',
      text: 'You reach the road with a cough and a scrape, but no worse injury. Smoke keeps rising behind you. You chose not to go farther into a structure already shifting in the heat.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Continues', tone: 'safe', ending: 'success',
      text: 'You continue along the road. The smoke remains behind the ridge. From where you are, you cannot know whether it was a small accident or a fire that needed help. You chose to leave before the facts were clear.',
      choices: [],
    },
  },
};
