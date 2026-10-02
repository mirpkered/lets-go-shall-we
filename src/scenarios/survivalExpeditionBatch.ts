import type { Scenario, SeasonKey } from '../types';

const end = (id: string, title: string, text: string, ending: 'success' | 'death' = 'success') => ({ id, title, text, ending, choices: [] as [] });
const season = (value: SeasonKey) => ({ season: value, months: value === 'WINTER' ? [12, 1, 2] : value === 'SPRING' ? [3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], weightBoost: 1.35 });
const tags = (distinctiveHook: string, riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE', availability: SeasonKey = 'ALL_YEAR', structures?: string[]) => ({
  playerRoles: ['traveler/passenger'], activities: ['survival', 'travel/exploration'], structures: structures ?? (riskTier === 'LOW' ? ['short focused sequence'] : riskTier === 'MODERATE' ? ['branching narrative', 'run-specific variable'] : riskTier === 'HIGH' ? ['multi-stage sequence', 'branching narrative'] : ['time-pressure sequence', 'branching narrative']),
  tones: ['adventurous', 'tense/dangerous'], settings: ['forest/wilderness/mountain'], riskTier, fantasyDensity: 'NONE' as const,
  supernaturalThreats: ['none specified'], combat: 'NONE' as const, length: 'STANDARD' as const,
  entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'escape/survival'],
  rewardShapes: ['money/item/knowledge/history possible', 'narrative-only payoff'], consequenceShapes: ['health/injury', 'time/opportunity'],
  distinctiveHook, availability: season(availability), historicalPresence: 'NONE' as const, historicalReferences: [], historicalPortrayal: 'NOT_APPLICABLE' as const,
});

export const THE_PASS_BEFORE_SNOW: Scenario = {
  id: 'the-pass-before-snow', title: 'The Pass Before Snow', subtitle: 'A mountain crossing narrows as the weather closes in.', startScene: 'surveyShelter', timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 90 }, { id: 'storm', label: 'Snowfall', atMinutes: 170 }],
  diversity: { ...tags('A pass crossing where the retreat window closes behind the party.', 'SEVERE', 'WINTER'), playerRoles: ['traveler/passenger', 'helper/rescuer'], entryShapes: ['stranded during travel', 'invited/known contact'], outcomeShapes: ['success/partial success', 'death', 'costly success/no-perfect-outcome possible'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    surveyShelter: { id: 'surveyShelter', title: 'The Pass Narrows', tone: 'warning', text: 'You are halfway up a mountain pass with two surveyors and their pack mule. The known shelter lies beyond a bare saddle. Behind you, the descent is still visible; snow clouds are already hiding the next ridge. Your party can turn back now, wait below a rock shelf, or try to reach the shelter.', choices: [
      { id: 'turnPassBack', label: 'Lead the party down while the trail shows', hint: 'The descent is steep, but the retreat window is open now.', timeCost: 25, next: 'passRetreat', effects: { historyFlags: ['retreated_before_snow_closed_mountain_pass'] } },
      { id: 'waitPassShelf', label: 'Wait beneath the near rock shelf', timeCost: 20, next: 'passShelf' },
      { id: 'pressPassSaddle', label: 'Cross the exposed saddle to shelter', hint: 'Wind is pushing snow across the ridge; a fall could be fatal.', timeCost: 45, chance: { probability: 0.59, bonusItems: ['weatherproofCloak', 'woolTravelBlanket'], bonusProbability: 0.12, successNext: 'passShelter', failureNext: 'passWhiteout', successMessage: 'You cross in a lull and reach the lee of the far ridge.', failureMessage: 'Snow sweeps across the saddle before the mule has crossed.' } },
      { id: 'checkPassBearing', label: 'Read the trail marks before deciding', requirements: { anyUsableItems: ['trailCompass', 'foldingTrailMarker'] }, timeCost: 8, next: 'passMarked', effects: { knowledge: ['The near descent remains passable while the trail markers can still be seen; the far saddle is exposed to the storm.'] } },
    ] },
    passMarked: { id: 'passMarked', title: 'A Narrow Window', tone: 'warning', text: 'The markers descend behind you and vanish ahead where snow crosses the saddle. The shelter is still reachable, but the party would have to cross the exposed crest before visibility fails.', choices: [
      { id: 'markedRetreat', label: 'Take the visible descent back', next: 'passRetreat' },
      { id: 'markedPress', label: 'Cross now while the markers hold', hint: 'A short lull may be enough; it is not guaranteed.', timeCost: 40, chance: { probability: 0.65, bonusItems: ['weatherproofCloak'], bonusProbability: 0.12, successNext: 'passShelter', failureNext: 'passWhiteout', successMessage: 'You keep the ridge in sight and reach the shelter door.', failureMessage: 'The trail vanishes before the mule clears the crest.' } },
    ] },
    passShelf: { id: 'passShelf', title: 'Snow on the Near Ridge', tone: 'warning', text: 'Snow begins to cover the trail behind you. The rock shelf keeps the party out of the wind, but it is no overnight shelter. The mule is steady; the saddle ahead is becoming harder to see.', choices: [
      { id: 'leavePassNow', label: 'Descend before the trail disappears', next: 'passRetreat', effects: { health: -1 } },
      { id: 'makePassShelter', label: 'Cross the saddle in the next lull', hint: 'The route is exposed and a stumble could be fatal.', timeCost: 30, chance: { probability: 0.54, successNext: 'passShelter', failureNext: 'passWhiteout', successMessage: 'The lull holds long enough to reach shelter.', failureMessage: 'The wind returns before the mule reaches the lee.' } },
    ] },
    passWhiteout: { id: 'passWhiteout', title: 'The Markers Go', tone: 'danger', text: 'The storm has erased the saddle from sight. The mule braces its legs; loose snow slides over the trail edge. You can crouch behind a stone rib and signal downhill, or attempt the last exposed stretch before the light goes.', choices: [
      { id: 'signalPassParty', label: 'Shelter behind stone and signal downhill', requirements: { anyUsableItems: ['trailWhistle', 'roadsideSignalMirror'] }, next: 'passRescue' },
      { id: 'crawlPassStone', label: 'Crawl to the stone rib and wait', next: 'passRescue', effects: { health: -2 } },
      { id: 'forcePassCross', label: 'Push across the exposed snow shelf', hint: 'The edge is hidden under fresh snow; a slip may be fatal.', chance: { probability: 0.34, successNext: 'passShelter', failureNext: 'passDeath', successMessage: 'You find the rock seam beneath the snow and reach the lee.', failureMessage: 'The shelf breaks under the party.' } },
    ] },
    passRetreat: end('passRetreat', 'Down Before the Snow', 'The surveyors turn back with you. They lose the afternoon’s crossing, not their lives; the mule carries the instruments to a lower inn where the pass can be tried another day.'),
    passShelter: end('passShelter', 'Beyond the Saddle', 'The party reaches the stone shelter together. Snow closes the saddle behind you, but the instruments and mule are safe; the surveyors mark the pass as closed until spring.'),
    passRescue: end('passRescue', 'Found Below the Ridge', 'Your signal is answered from the lower trail. A road crew climbs to the stone rib and guides everyone down one at a time. The pass remains uncrossed, but the party is alive.'),
    passDeath: end('passDeath', 'The Snow Shelf', 'The hidden edge gives way. The storm covers the broken trail before anyone below can reach you.', 'death'),
  },
};

export const NO_WATER_AT_MILLERS_SPRING: Scenario = {
  id: 'no-water-at-millers-spring', title: 'No Water at Miller’s Spring', subtitle: 'The expected spring has gone dry, and the ground still tells a story.', startScene: 'drySpring',
  diversity: { ...tags('A dry spring becomes a terrain-reading and effort-conservation problem.', 'MODERATE'), playerRoles: ['traveler/passenger', 'investigator/explorer'], activities: ['survival', 'travel/exploration', 'investigation/mystery'], entryShapes: ['stranded during travel', 'voluntary curiosity'], outcomeShapes: ['success/partial success', 'walk-away/refusal'], rewardShapes: ['money/item/knowledge/history possible', 'narrative-only payoff'], consequenceShapes: ['health/injury', 'time/opportunity'] },
  scenes: {
    drySpring: { id: 'drySpring', title: 'A Spring without Water', tone: 'warning', text: 'The marked spring is dry. A pale stain circles the stone basin, and the ground slopes into a shaded fold below it. The sun is high; you have a little water left, not enough for careless searching. A homestead roof is visible across the low pasture.', choices: [
      { id: 'readSpringGround', label: 'Read the damp soil below the basin', next: 'springSeep', effects: { knowledge: ['The dry spring’s damp soil points into the shaded fold below the basin.'] } },
      { id: 'askHomesteadSpring', label: 'Ask the homestead for water and news', timeCost: 20, next: 'springHouse' },
      { id: 'backtrackSpring', label: 'Return to the last marked water stop', next: 'springTurnback', effects: { historyFlags: ['turned_back_from_dry_millers_spring'] } },
      { id: 'digSpringBasin', label: 'Dig at the old basin', hint: 'The basin is hard stone; digging may waste strength without reaching water.', timeCost: 15, chance: { probability: 0.25, successNext: 'springSeep', failureNext: 'springSpent', successMessage: 'A thin seep gathers where the soil darkens.', failureMessage: 'The stone yields no water, and the heat takes more out of you than the effort should.' , failureEffects: { health: -2 } } },
    ] },
    springSeep: { id: 'springSeep', title: 'Where the Water Went', tone: 'safe', text: 'The shaded fold has a damp line beneath a fallen branch. The spring has shifted below ground, not vanished; clear stones lead toward a narrow runnel. You can follow it slowly or stop at the homestead and ask for a fuller vessel.', choices: [
      { id: 'followSpringRunoff', label: 'Follow the damp line to its source', timeCost: 15, chance: { probability: 0.72, successNext: 'springFound', failureNext: 'springHouse', successMessage: 'The runnel opens into a small clean pool beneath the roots.', failureMessage: 'The damp line disappears under dry gravel; the homestead remains the safer option.' } },
      { id: 'takeSpringHomestead', label: 'Ask the homestead for water', next: 'springHouse' },
    ] },
    springHouse: { id: 'springHouse', title: 'A House above the Draw', tone: 'safe', text: 'The household has a covered well and can spare a filled flask. They say the spring stopped after a hillside slide upstream. A fresh crack has opened above the old footpath, so they advise against digging there.', choices: [
      { id: 'acceptSpringWater', label: 'Accept water and take the safer road', next: 'springWater', effects: { historyFlags: ['received_water_at_millers_homestead'] } },
      { id: 'offerSpringWork', label: 'Help clear the household’s well path', next: 'springWater', effects: { knowledge: ['A hillside slide diverted Miller’s Spring beneath gravel; a new crack makes the old path unstable.'], historyFlags: ['helped_household_after_spring_shift'] } },
    ] },
    springSpent: end('springSpent', 'Strength Spent on Stone', 'You stop digging before the heat does worse harm. The homestead is still in sight, and the household brings water when they notice you sitting below the dry basin.'),
    springTurnback: end('springTurnback', 'Water by the Known Road', 'You return to the last marked water stop rather than spend the day searching. Miller’s Spring remains dry, but your strength and route are intact.'),
    springFound: end('springFound', 'A Spring beneath the Spring', 'The seep runs clear from under the roots. You refill what you can and mark the new source for the next traveler; the old stone basin can no longer be trusted as a guide.'),
    springWater: end('springWater', 'Water and a Warning', 'You leave with a full flask and a plain account of the hillside slide. The household will report the unstable path; you have water without mistaking a dry spring for a safe place to dig.'),
  },
};

export const THE_BROKEN_AXLE: Scenario = {
  id: 'the-broken-axle', title: 'The Broken Axle', subtitle: 'A wagon can be repaired, lightened, or left behind.', startScene: 'axleRoad',
  diversity: { ...tags('A wagon failure asks whether to save cargo, transport, or daylight.', 'HIGH'), playerRoles: ['helper/rescuer', 'accidental participant'], activities: ['labor/repair', 'survival', 'moral prioritization'], entryShapes: ['accidental encounter'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'escape/survival'], consequenceShapes: ['health/injury', 'time/opportunity', 'gear/property/objective'] },
  scenes: {
    axleRoad: { id: 'axleRoad', title: 'The Wheel Turns Crooked', tone: 'warning', text: 'A freight wagon has stopped on a firm roadside shelf. Its rear axle has split; the wheel leans inward, but the load is still stable. The driver and one child are unhurt. A settlement lies six miles behind, while daylight remains for only a few hours.', choices: [
      { id: 'inspectAxleBreak', label: 'Inspect the split axle and its load', timeCost: 5, next: 'axleExamined', effects: { knowledge: ['The wagon axle is split but can be braced if the load is lightened first.'] } },
      { id: 'useWrenchAxle', label: 'Brace the axle with your wheel wrench', requirements: { usableItems: ['compactWheelWrench'] }, hint: 'A brace may hold for a slow walk, not a full load at speed.', chance: { probability: 0.72, successNext: 'axleBraced', failureNext: 'axleUnstable', successMessage: 'The wrench and a timber wedge hold the split closed.', failureMessage: 'The cracked axle shifts under the first test.' } },
      { id: 'unloadAxle', label: 'Move the heaviest crates off the wagon', next: 'axleLightened', effects: { historyFlags: ['lightened_broken_wagon_axle'] } },
      { id: 'seekAxleHelp', label: 'Walk back for a cartwright', hint: 'The wagon is stable here, but the cartwright may not arrive before dark.', next: 'axleHelp' },
    ] },
    axleExamined: { id: 'axleExamined', title: 'A Short Brace', tone: 'warning', text: 'The break runs through the axle’s center. A sound timber brace can support a lighter wagon over the six miles, but no fastening will make it safe at speed. The family can wait here, unload, or ask you to fetch the cartwright.', choices: [
      { id: 'braceAfterLook', label: 'Brace it and travel slowly', chance: { probability: 0.63, successNext: 'axleBraced', failureNext: 'axleUnstable', successMessage: 'A slow test leaves the wheel straight.', failureMessage: 'The brace shifts before the load is moved.' } },
      { id: 'lightAfterLook', label: 'Unload crates before moving', next: 'axleLightened' },
      { id: 'helpAfterLook', label: 'Fetch the cartwright', next: 'axleHelp' },
    ] },
    axleUnstable: { id: 'axleUnstable', title: 'The Brace Slips', tone: 'danger', text: 'The wagon leans farther, though the crates remain on the shelf. The driver asks you not to force it. The safe choice now is to leave the cargo and walk to the cartwright, or unload until the wheel can turn freely.', choices: [
      { id: 'walkAxleHelp', label: 'Walk back for the cartwright', next: 'axleHelp' },
      { id: 'unloadAfterSlip', label: 'Unload until the wheel clears', next: 'axleLightened' },
      { id: 'forceBrokenWagon', label: 'Drive the wagon before dark', hint: 'The wheel is visibly crooked and the axle is no longer holding.', chance: { probability: 0.32, successNext: 'axleArrival', failureNext: 'axleLoss', successMessage: 'The wagon reaches the settlement at a crawl.', failureMessage: 'The axle folds and the wagon drops against the road.', failureEffects: { health: -2 } } },
    ] },
    axleLightened: { id: 'axleLightened', title: 'What the Wagon Can Carry', tone: 'warning', text: 'The heaviest crates sit safely under a tarp on the roadside shelf. With the load reduced, the driver can take the wagon slowly toward the cartwright; the crates will need a second trip.', choices: [
      { id: 'slowAxleHome', label: 'Walk the lightened wagon to town', chance: { probability: 0.78, successNext: 'axleArrival', failureNext: 'axleLoss', successMessage: 'The wheel holds over the remaining miles.', failureMessage: 'The brace shifts again and the wheel locks.', failureEffects: { health: -1 } } },
      { id: 'leaveAxleCrates', label: 'Leave the wagon and escort the family', next: 'axleHelp', effects: { historyFlags: ['left_cargo_for_later_cartwright_trip'] } },
    ] },
    axleBraced: { id: 'axleBraced', title: 'Slow Miles', tone: 'warning', text: 'The split stays closed under a careful hand test. The driver agrees to walk beside the wagon and stop at any new creak; the load is still heavy, and one hard rut could undo the brace.', choices: [
      { id: 'walkBracedAxle', label: 'Walk the wagon slowly to the cartwright', chance: { probability: 0.71, successNext: 'axleArrival', failureNext: 'axleLoss', successMessage: 'The brace holds until the cartwright takes the wheel.', failureMessage: 'A rut knocks the brace loose and drops the wheel.', failureEffects: { health: -1 } } },
      { id: 'reduceBracedLoad', label: 'Unload two crates before moving', next: 'axleLightened' },
    ] },
    axleHelp: end('axleHelp', 'A Repair in Daylight', 'The cartwright reaches the shelf before dark. The family and cargo stay together; the axle needs a new piece of hardwood, so the wagon remains overnight for a proper repair.'),
    axleArrival: end('axleArrival', 'The Cartwright’s Yard', 'The wagon reaches the settlement at walking pace. The cartwright takes the damaged axle apart; the family is safe, and any crates left on the roadside are listed for a return trip.'),
    axleLoss: end('axleLoss', 'The Wheel Gives Way', 'The wagon settles hard onto its side. The driver and child are clear, but the axle and some cargo are lost to the road before the cartwright can arrive.'),
  },
};

export const ACROSS_THE_FLOODPLAIN: Scenario = {
  id: 'across-the-floodplain', title: 'Across the Floodplain', subtitle: 'The water spreads wider while the ground changes beneath it.', startScene: 'floodHerd', timePhases: [{ id: 'firstWater', label: 'Water reaches the low ground', atMinutes: 0 }, { id: 'spreading', label: 'The flood spreads', atMinutes: 25 }],
  diversity: { ...tags('A moving floodplain forces a group to choose between livestock, supplies, and high ground.', 'SEVERE', 'SPRING'), playerRoles: ['helper/rescuer', 'witness'], activities: ['survival', 'animals', 'moral prioritization'], entryShapes: ['witnesses incident'], outcomeShapes: ['success/partial success', 'death', 'costly success/no-perfect-outcome possible'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    floodHerd: { id: 'floodHerd', title: 'Water between the Mounds', tone: 'danger', text: 'You are with a family moving six sheep across a broad lowland. Their cart is on the near gravel rise; the sheep are on a grass mound beyond a shallow side channel. Water is spreading from the main river, and the only clear ground lies toward a higher road to the north.', choices: [
      { id: 'moveSheepFlood', label: 'Drive the sheep north to the high road', hint: 'They can climb the bank, but the channel is widening.', timeCost: 12, chance: { probability: 0.72, successNext: 'sheepHighGround', failureNext: 'floodSplit', successMessage: 'The sheep climb the north bank in a tight group.', failureMessage: 'Two sheep balk at the channel and the family is split between mounds.' } },
      { id: 'saveCartFlood', label: 'Pull the cart onto the gravel rise', next: 'cartHighGround', effects: { historyFlags: ['saved_cart_before_flood_spread'] } },
      { id: 'signalFloodFamily', label: 'Signal the family to leave the cart', requirements: { anyUsableItems: ['trailWhistle', 'conductorWhistle'] }, next: 'familySignals' },
      { id: 'crossFloodChannel', label: 'Cross the side channel to the sheep', hint: 'The current is muddy and rising; a slip could drown you.', timeCost: 8, chance: { probability: 0.39, successNext: 'sheepHighGround', failureNext: 'floodDeath', successMessage: 'You reach the mound and guide the sheep to the north bank.', failureMessage: 'The channel pulls you under before you can regain the bank.' } },
    ] },
    floodSplit: { id: 'floodSplit', title: 'A Wider Channel', tone: 'danger', text: 'The main channel has widened between the family and the sheep. The cart remains on the gravel rise, but water is already running beneath its wheels. There is time for one clear move: secure the animals on the north bank or bring the people to the cart rise.', choices: [
      { id: 'northForSheep', label: 'Guide the sheep along the shallow edge', chance: { probability: 0.62, successNext: 'sheepHighGround', failureNext: 'floodLoss', successMessage: 'The sheep reach the higher road, one at a time.', failureMessage: 'The current breaks the group apart; the family cannot recover all six.' } },
      { id: 'bringPeopleCart', label: 'Keep the family and cart on the rise', next: 'cartHighGround' },
      { id: 'leaveFloodNow', label: 'Climb out and call for help from the road', next: 'floodRescue' },
    ] },
    sheepHighGround: { id: 'sheepHighGround', title: 'Above the Waterline', tone: 'warning', text: 'The sheep and family are on the north road. The cart is still on the gravel rise below; moving it now would mean returning through water that has covered the track.', choices: [
      { id: 'leaveCartFlood', label: 'Leave the cart and keep everyone uphill', next: 'floodSafe', effects: { historyFlags: ['abandoned_cart_to_save_people_and_sheep'] } },
      { id: 'returnCartFlood', label: 'Risk one trip back for the cart', hint: 'The track is covered and the water is rising quickly.', chance: { probability: 0.38, successNext: 'cartRecovered', failureNext: 'floodDeath', successMessage: 'You pull the cart clear as the water reaches the rise.', failureMessage: 'The current catches you before you reach the cart.' } },
    ] },
    cartHighGround: { id: 'cartHighGround', title: 'The Cart Is Clear', tone: 'warning', text: 'The cart is on the gravel rise with its load above water. The sheep remain on the far mound, and the channel between you is rising. You cannot move both at once without splitting the family.', choices: [
      { id: 'crossBackForSheep', label: 'Go for the sheep before the channel widens', hint: 'The cart will remain here; crossing the channel is dangerous.', chance: { probability: 0.48, successNext: 'sheepHighGround', failureNext: 'floodDeath', successMessage: 'You reach the sheep and bring them toward the north bank.', failureMessage: 'The current takes you off your feet.' } },
      { id: 'keepCartSafe', label: 'Stay with the family and guard the cart', next: 'floodRescue' },
    ] },
    familySignals: { id: 'familySignals', title: 'The Signal Carries', tone: 'warning', text: 'The family hears you and starts uphill, leaving the cart on the rise. The sheep are still on the far mound, but the higher road gives the group a place to wait for help.', choices: [
      { id: 'stayWithFamily', label: 'Stay with the family on high ground', next: 'floodSafe' },
      { id: 'trySheepSignal', label: 'Guide the sheep along the mound’s edge', chance: { probability: 0.52, successNext: 'sheepHighGround', failureNext: 'floodLoss', successMessage: 'The sheep follow one another up the north bank.', failureMessage: 'The flock scatters as water reaches the grass mound.' } },
    ] },
    floodSafe: end('floodSafe', 'The Road above the Flood', 'The family reaches the high road. The cart or a few sheep may remain below, but everyone you brought uphill is safe; the river will have to fall before anything left on the plain can be recovered.'),
    cartRecovered: end('cartRecovered', 'A Load above Water', 'The cart is hauled onto the north road. The family and sheep made it ahead; the river takes the low track, not the load.'),
    floodRescue: end('floodRescue', 'Help from the North Road', 'A road crew reaches the rise with ropes after your signal. They bring the family uphill; the cart and any sheep still beyond the channel must wait for the flood to fall.'),
    floodLoss: end('floodLoss', 'The Floodplain Spreads', 'The group withdraws before the channel cuts off the high road. Some animals are swept beyond reach, but no one is sent back into water that has become too deep to cross.'),
    floodDeath: end('floodDeath', 'The Main Channel', 'The flood pulls you beneath the muddy surface. The water covers the path before the family can reach you.', 'death'),
  },
};

export const THE_CAVE_BEFORE_THE_STORM: Scenario = {
  id: 'the-cave-before-the-storm', title: 'The Cave Before the Storm', subtitle: 'The cave is dry at its mouth, but something has been using it.', startScene: 'caveMouth',
  diversity: { ...tags('A shelter decision turns on reading animal sign and water marks before entering a cave.', 'HIGH'), playerRoles: ['traveler/passenger', 'investigator/explorer'], activities: ['survival', 'puzzle/problem-solving'], entryShapes: ['stranded during travel', 'voluntary curiosity'], outcomeShapes: ['success/partial success', 'escape/survival', 'death'], consequenceShapes: ['health/injury', 'death', 'time/opportunity'] },
  scenes: {
    caveMouth: { id: 'caveMouth', title: 'Shelter under the Hill', tone: 'warning', text: 'Rain is moving over the ridge. A cave mouth offers shelter, but muddy tracks lead in and out, and a high water stain crosses the wall just inside. A shallow rock overhang nearby is exposed but above the runoff. You can examine the marks, use the overhang, or enter the cave.', choices: [
      { id: 'readCaveMarks', label: 'Check the tracks and water stain', next: 'caveRead' },
      { id: 'useRockOverhang', label: 'Take shelter beneath the rock overhang', next: 'caveOverhang' },
      { id: 'enterCave', label: 'Enter the cave before the rain', hint: 'The water stain shows the cave has flooded before.', timeCost: 10, next: 'caveInside' },
    ] },
    caveRead: { id: 'caveRead', title: 'A Den, and a Flood Mark', tone: 'warning', text: 'The tracks are fresh and belong to a bear-sized animal. The stain is higher than your knee; storm water has rushed through here before. The overhang is small but lies above the channel.', choices: [
      { id: 'avoidCave', label: 'Wait at the overhang', next: 'caveOverhang', effects: { knowledge: ['The cave is used by a large animal and floods during heavy rain; the nearby overhang stands above the runoff.'] } },
      { id: 'quietCaveEntry', label: 'Enter only as far as dry stone', hint: 'A large animal may be deeper inside; do not block your exit.', next: 'caveInside' },
    ] },
    caveInside: { id: 'caveInside', title: 'The Cave Breathes', tone: 'danger', text: 'A large animal shifts in the dark beyond the dry stone. At the same time, rainwater begins running down the cave floor toward the entrance. The open mouth remains behind you; the overhang is only a short climb outside.', choices: [
      { id: 'backOutCave', label: 'Leave without approaching the animal', next: 'caveOverhang', effects: { historyFlags: ['withdrew_from_flooding_animal_cave'] } },
      { id: 'lightCaveExit', label: 'Use your lantern to retreat by the wall', requirements: { usableItems: ['lantern', 'roadmansLantern', 'minerHeadlamp'] }, next: 'caveOverhang' },
      { id: 'pushDeeperCave', label: 'Push past the animal to dry ground', hint: 'The animal has not attacked, but the water is rising and the exit is at your back.', chance: { probability: 0.31, successNext: 'caveDryChamber', failureNext: 'caveDeath', successMessage: 'You slip past the animal as it backs away from the rising water.', failureMessage: 'The startled animal blocks the narrow passage as runoff rises.', failureEffects: { health: -3 } } },
    ] },
    caveDryChamber: { id: 'caveDryChamber', title: 'A Dry Ledge', tone: 'danger', text: 'A ledge keeps you above the runoff, but the animal is between you and the entrance. You hear its breathing and the water climbing below. The ledge is a pause, not an overnight refuge.', choices: [
      { id: 'climbCaveLedge', label: 'Climb back over the dry ledge', chance: { probability: 0.62, successNext: 'caveOverhang', failureNext: 'caveDeath', successMessage: 'You cross the ledge while the animal retreats from the water.', failureMessage: 'Your foot slips toward the flooded floor.' } },
      { id: 'waitCaveLedge', label: 'Wait for the water to drain', hint: 'The rain is still falling; the ledge may not stay dry.', next: 'caveDeath' },
    ] },
    caveOverhang: end('caveOverhang', 'Above the Runoff', 'You wait beneath the rock overhang while water pours from the cave mouth. The animal stays inside and the storm passes without forcing you into its den.'),
    caveDeath: end('caveDeath', 'The Flooded Passage', 'The cave fills faster than you can climb. Water and the frightened animal leave no room to reach the entrance.', 'death'),
  },
};

export const THE_LOST_SURVEY_PARTY: Scenario = {
  id: 'the-lost-survey-party', title: 'The Lost Survey Party', subtitle: 'Three sets of marks disagree about where the crew went.', startScene: 'surveyTable',
  diversity: { ...tags('A search is solved by deciding which clue not to follow and where to place a signal.', 'HIGH'), playerRoles: ['helper/rescuer', 'investigator/explorer'], activities: ['investigation/mystery', 'communication/witness', 'survival'], entryShapes: ['asks for lodging', 'invited/known contact'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'death'], consequenceShapes: ['health/injury', 'death', 'time/opportunity'] },
  scenes: {
    surveyTable: { id: 'surveyTable', title: 'The Unreturned Crew', tone: 'warning', text: 'A survey crew missed its return day. At their last camp are three clues: a wet notebook points toward a creek, bootprints turn uphill, and a broken measuring rod lies beside the cleared road. The keeper asks you to help search before another night of rain.', choices: [
      { id: 'readSurveyBook', label: 'Read the damp notebook first', next: 'surveyNotebook', effects: { knowledge: ['The survey crew recorded a creek rise shortly before missing its return day.'] } },
      { id: 'followSurveyPrints', label: 'Follow the uphill bootprints', hint: 'They are fresh, but rain may have shifted the crew’s route.', next: 'surveySlope' },
      { id: 'markSurveyCamp', label: 'Set a return mark at the camp', requirements: { usableItems: ['foldingTrailMarker'] }, next: 'surveyCampMarked' },
      { id: 'declineSurveySearch', label: 'Leave the search to a larger party', next: 'surveyDelay' },
    ] },
    surveyNotebook: { id: 'surveyNotebook', title: 'The Creek Measurement', tone: 'warning', text: 'The last entry records a sudden rise at the creek and a note that the measuring rod should be moved. The uphill prints may belong to the crew returning from the bank, not going farther into the hills.', choices: [
      { id: 'searchCreekSurvey', label: 'Search the creek bank below the camp', next: 'surveyCreek' },
      { id: 'signalSurveyCrew', label: 'Signal from the ridge above camp', requirements: { anyUsableItems: ['roadsideSignalMirror', 'trailWhistle'] }, next: 'surveyAnswer' },
    ] },
    surveySlope: { id: 'surveySlope', title: 'Prints above the Road', tone: 'danger', text: 'The prints reach a steep slope and stop where runoff has cut the soil. Below, the creek is louder than it should be. A signal from the ridge would carry farther than continuing up the unstable slope.', choices: [
      { id: 'turnToSurveyRidge', label: 'Climb to the ridge and signal', next: 'surveyAnswer' },
      { id: 'descendSurveyCreek', label: 'Search below the washed slope', hint: 'Loose soil runs into a rising creek.', chance: { probability: 0.57, successNext: 'surveyCreek', failureNext: 'surveyInjury', successMessage: 'You find a sheltered ledge beside the creek.', failureMessage: 'The slope gives underfoot and you strike the bank.', failureEffects: { health: -3 } } },
      { id: 'leaveSurveySlope', label: 'Return to camp and wait for help', next: 'surveyDelay' },
    ] },
    surveyCampMarked: { id: 'surveyCampMarked', title: 'A Place to Return To', tone: 'safe', text: 'Your marker hangs above the old camp, visible from the road. From here the notebook and uphill prints can be checked without losing the way back.', choices: [
      { id: 'markedReadBook', label: 'Read the damp notebook', next: 'surveyNotebook' },
      { id: 'markedUphill', label: 'Check the uphill prints', next: 'surveySlope' },
    ] },
    surveyCreek: { id: 'surveyCreek', title: 'The Rod in the Water', tone: 'warning', text: 'The measuring rod is caught against a low willow, with a strip of the surveyor’s coat snagged below it. A person may be on the far bank, but the creek is too swift to cross safely.', choices: [
      { id: 'callSurveyor', label: 'Call across and wait for an answer', next: 'surveyAnswer' },
      { id: 'throwSurveyLine', label: 'Send a rope across from the high bank', requirements: { usableItems: ['travelRope'] }, hint: 'The rope can carry a signal or handhold, not a safe crossing in this current.', next: 'surveyAnswer', effects: { damageItems: ['travelRope'] } },
      { id: 'avoidSurveyWater', label: 'Mark the place and return with help', next: 'surveyDelay', effects: { historyFlags: ['marked_survey_party_creek_search'] } },
    ] },
    surveyAnswer: end('surveyAnswer', 'An Answer from the Willow', 'A surveyor answers from a high bank downstream. The rest of the crew sheltered in a tool hut after the creek rose; a search party follows your signal and brings them back together.'),
    surveyDelay: end('surveyDelay', 'A Larger Search', 'You leave clear marks at the camp and slope. A larger party searches the creek at first light; the crew is not found that evening, but no one is sent into the rising water alone.'),
    surveyInjury: end('surveyInjury', 'The Slope Breaks', 'You climb back to the road with a bruised side. The creek cannot be crossed safely, so you carry the last known location to the keeper and leave the search to a larger party.'),
  },
};

export const THREE_DAYS_TO_THE_RAILHEAD: Scenario = {
  id: 'three-days-to-the-railhead', title: 'Three Days to the Railhead', subtitle: 'An injured surveyor can travel, but not at the party’s old pace.', startScene: 'railheadCamp', timePhases: [{ id: 'dayOne', label: 'First day', atMinutes: 0 }, { id: 'dayTwo', label: 'Second day', atMinutes: 100 }],
  diversity: { ...tags('A three-day evacuation balances patient condition, transport, and party separation.', 'HIGH'), playerRoles: ['helper/rescuer', 'traveler/passenger'], activities: ['rescue/care', 'survival', 'moral prioritization'], entryShapes: ['witnesses incident'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'death'], consequenceShapes: ['health/injury', 'death', 'time/opportunity', 'relationship'] },
  scenes: {
    railheadCamp: { id: 'railheadCamp', title: 'A Badly Turned Ankle', tone: 'warning', text: 'A surveyor has a badly swollen ankle after a fall. The railhead is three days away on foot, but a shepherd’s hut lies half a day back. The patient is alert and can sit; forcing them to walk far may worsen the injury. The rest of the party has one serviceable pack frame.', choices: [
      { id: 'makeRailheadLitter', label: 'Build a light litter from the pack frame', next: 'litterBuilt', effects: { setFlags: ['patientOnLitter'] } },
      { id: 'seekRailheadWagon', label: 'Return to the shepherd’s hut for a cart', next: 'hutCart' },
      { id: 'useOwnedHorseRailhead', label: 'Use your boarded horse at a slow walk', requirements: { ownedAssets: ['olderChestnutHorse'] }, hint: 'The horse can carry one person, not the full survey load.', next: 'horseTransport' },
      { id: 'splitRailheadParty', label: 'Send two ahead for a cart', next: 'splitParty' },
    ] },
    litterBuilt: { id: 'litterBuilt', title: 'A Slow First Mile', tone: 'warning', text: 'The patient rests on the frame while two companions take the handles. The path is uneven; every mile costs effort, but the patient’s ankle stays still. You can travel at a steady pace, pause often, or use your rope to steady the frame on the next descent.', choices: [
      { id: 'steadyLitter', label: 'Keep a steady pace and rest often', next: 'railheadArrival', effects: { historyFlags: ['carried_injured_surveyor_toward_railhead'] } },
      { id: 'ropeLitter', label: 'Secure the frame with your Travel Rope', requirements: { usableItems: ['travelRope'] }, next: 'railheadArrival', effects: { damageItems: ['travelRope'], knowledge: ['A rope handline steadied the litter on a steep descent; the line is now damaged.'] } },
      { id: 'pushLitterFast', label: 'Push hard to reach the hut today', hint: 'The patient’s swelling is already severe; speed may make the injury worse.', chance: { probability: 0.41, successNext: 'railheadArrival', failureNext: 'patientWorse', successMessage: 'The litter reaches the hut before night.', failureMessage: 'A jolt worsens the ankle and forces an early stop.', failureEffects: { health: -1 } } },
    ] },
    hutCart: { id: 'hutCart', title: 'A Cart at the Hut', tone: 'safe', text: 'The shepherd has a small cart with a padded bed and agrees to lend it for the journey. The extra half-day is a real delay, but the patient can lie still while the party walks beside the wheels.', choices: [
      { id: 'takeHutCart', label: 'Use the cart and travel at walking pace', next: 'railheadArrival' },
      { id: 'stayHutOvernight', label: 'Rest the patient overnight first', next: 'patientRested', effects: { historyFlags: ['delayed_railhead_trip_for_patient_rest'] } },
    ] },
    splitParty: { id: 'splitParty', title: 'Two Paths for One Day', tone: 'warning', text: 'Two companions set out for the hut while you stay with the patient. They will return by night if the path remains open. The patient is warm beneath the camp blanket but cannot be left alone in the open.', choices: [
      { id: 'waitSplitParty', label: 'Keep watch and wait for the cart', next: 'hutCart' },
      { id: 'signalSplitParty', label: 'Signal if the weather turns', requirements: { anyUsableItems: ['trailWhistle', 'roadsideSignalMirror'] }, next: 'patientRested' },
    ] },
    patientWorse: { id: 'patientWorse', title: 'The Ankle Swells Further', tone: 'danger', text: 'The patient cannot bear any weight now. The railhead is still days away; the hut and its cart are the only route that avoids carrying them over the roughest ground.', choices: [
      { id: 'backToHut', label: 'Return to the hut for the cart', next: 'hutCart' },
      { id: 'restWorsePatient', label: 'Keep them still until help reaches camp', next: 'patientRested' },
    ] },
    horseTransport: { id: 'horseTransport', title: 'A Slow Ride', tone: 'safe', text: 'Your boarded horse carries the surveyor at a careful walk while the party keeps pace beside them. The patient’s ankle stays still, though the animal is tiring on the rough path. The shepherd’s hut is close enough to rest there, or you can continue slowly toward the railhead.', choices: [
      { id: 'restHorsePatient', label: 'Stop at the hut and rest the horse', next: 'patientRested', effects: { historyFlags: ['rested_owned_horse_during_rescue'] } },
      { id: 'continueHorseRailhead', label: 'Continue at the horse’s slow pace', next: 'railheadArrival', effects: { historyFlags: ['used_owned_horse_for_patient_transport'] } },
    ] },
    patientRested: end('patientRested', 'A Day Given Back', 'The patient rests while the party secures a cart and sends word ahead. The railhead journey takes longer, but the injured traveler is not made to spend a recoverable ankle for one day’s progress.'),
    railheadArrival: end('railheadArrival', 'The Railhead at Last', 'The party reaches the railhead with the surveyor alive. The patient’s ankle is still badly swollen and needs a doctor; the route, pace, and transport made the difference between arrival and further harm.'),
  },
};

export const WHITEOUT: Scenario = {
  id: 'whiteout', title: 'Whiteout', subtitle: 'When the trail disappears, spacing and direction matter more than speed.', startScene: 'whiteoutTrail', timePhases: [{ id: 'firstFlurry', label: 'Snow begins', atMinutes: 0 }, { id: 'whiteout', label: 'Visibility closes', atMinutes: 35 }],
  diversity: { ...tags('A group navigation problem turns on line discipline and recognizing terrain without sight.', 'SEVERE', 'WINTER'), playerRoles: ['traveler/passenger', 'helper/rescuer'], activities: ['survival', 'travel/exploration'], entryShapes: ['witnesses incident', 'stranded during travel'], outcomeShapes: ['success/partial success', 'death', 'escape/survival'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    whiteoutTrail: { id: 'whiteoutTrail', title: 'The Trail Is Gone', tone: 'danger', text: 'Snow has erased the trail across an open saddle. You are with two travelers; a low line of stone posts marks the route when visible. Wind presses from the west, and the ground falls away somewhere to the right. You can stop and anchor the group, follow the windbreak left, or keep the posts by compass.', choices: [
      { id: 'anchorWhiteout', label: 'Tie the group together and stop', requirements: { usableItems: ['travelRope'] }, next: 'anchoredGroup', effects: { historyFlags: ['anchored_group_during_whiteout'] } },
      { id: 'useWhiteoutCompass', label: 'Keep the compass bearing to the posts', requirements: { usableItems: ['trailCompass'] }, hint: 'A compass gives direction, not safe footing.', chance: { probability: 0.72, successNext: 'whiteoutPosts', failureNext: 'whiteoutDrift', successMessage: 'The bearing brings the party to a stone post.', failureMessage: 'The slope bends under the snow and carries you off the line.' } },
      { id: 'followWhiteoutWindbreak', label: 'Follow the low ground to the left', chance: { probability: 0.63, successNext: 'windbreakFound', failureNext: 'whiteoutDrift', successMessage: 'The low ground reaches a shallow sheltered hollow.', failureMessage: 'The hollow narrows into a drifted gully.' } },
      { id: 'pressWhiteoutStraight', label: 'Keep walking straight across the saddle', hint: 'The slope edge is hidden and the wind is pushing sideways.', chance: { probability: 0.32, successNext: 'whiteoutPosts', failureNext: 'whiteoutDeath', successMessage: 'A post appears through the snow ahead.', failureMessage: 'The ground falls sharply where the trail disappeared.' } },
    ] },
    whiteoutDrift: { id: 'whiteoutDrift', title: 'The Gully Fills', tone: 'danger', text: 'The group has reached a drifted gully. The wind still comes from the west, but the snow is deepening around your legs. The stone posts are no longer visible; a rope or a slow retreat along the windbreak may keep everyone together.', choices: [
      { id: 'ropeWhiteoutRetreat', label: 'Use rope to retrace the windbreak', requirements: { usableItems: ['travelRope'] }, next: 'anchoredGroup' },
      { id: 'crawlWhiteoutOut', label: 'Crawl back toward the lower ground', next: 'windbreakFound', effects: { health: -1 } },
      { id: 'stayWhiteoutGully', label: 'Keep moving deeper through the drift', hint: 'Snow is filling the gully faster than the group can climb.', next: 'whiteoutDeath' },
    ] },
    anchoredGroup: { id: 'anchoredGroup', title: 'A Line through the Snow', tone: 'warning', text: 'The rope keeps the travelers from separating. The storm is too thick to cross, but the group can feel the ground rising toward the lower windbreak. The rope may need to be left tied to the last stone post.', choices: [
      { id: 'waitAnchored', label: 'Stay anchored until visibility returns', next: 'whiteoutSafe' },
      { id: 'leaveRopePost', label: 'Leave the rope at the post and descend', next: 'windbreakFound', effects: { loseItems: ['travelRope'], historyFlags: ['sacrificed_rope_to_leave_whiteout'] } },
    ] },
    whiteoutPosts: { id: 'whiteoutPosts', title: 'A Stone Post by Touch', tone: 'warning', text: 'One post stands beneath the snow. Beyond it, the ground rises gently toward the marked road. The storm is easing, but it still hides the drop on the right.', choices: [
      { id: 'waitAtPost', label: 'Hold the post and wait for a break', next: 'whiteoutSafe' },
      { id: 'feelAlongPosts', label: 'Follow the posts with short steps', chance: { probability: 0.72, successNext: 'whiteoutSafe', failureNext: 'whiteoutDrift', successMessage: 'The posts lead the group to the lower road.', failureMessage: 'The next post is buried and the gully draws the group sideways.' } },
    ] },
    windbreakFound: end('windbreakFound', 'Below the Saddle', 'The low windbreak leads to a stand of trees and the marked road. The group loses time and the rope line if it was used, but everyone reaches ground where the snow no longer hides a drop.'),
    whiteoutSafe: end('whiteoutSafe', 'The Wind Opens', 'The storm thins enough to reveal the post line. You descend in short stages with the group together; the pass is not crossed today, but no one was left to guess alone.'),
    whiteoutDeath: end('whiteoutDeath', 'The Hidden Slope', 'The snow-covered ground breaks away beneath you. The others hear you fall, but the wind closes the gap before they can reach the edge.', 'death'),
  },
};

export const THE_LAST_ROPE: Scenario = {
  id: 'the-last-rope', title: 'The Last Rope', subtitle: 'One good line cannot serve every purpose at once.', startScene: 'ravineLedge',
  diversity: { ...tags('A single rope must be assigned either to a person, an anchor, or the traveler’s retreat.', 'SEVERE'), playerRoles: ['helper/rescuer'], activities: ['rescue/care', 'moral prioritization', 'survival'], entryShapes: ['witnesses incident'], outcomeShapes: ['success/partial success', 'death', 'costly success/no-perfect-outcome possible'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective'] },
  scenes: {
    ravineLedge: { id: 'ravineLedge', title: 'One Line, Three Needs', tone: 'danger', text: 'A porter is stranded on a broad ledge below a ravine path. A Travel Rope would be the only useful line here; none is lying nearby. The ledge is stable, but the anchor above is a cracked dead tree. The porter can wait while you inspect the stone wall and a living pine farther along the rim.', choices: [
      { id: 'inspectRavineAnchor', label: 'Test the stone and living pine anchors', next: 'anchorTest' },
      { id: 'lowerRavineRope', label: 'Lower the rope directly to the porter', requirements: { usableItems: ['travelRope'] }, hint: 'The dead tree cannot hold a full fall; the line may be lost.', chance: { probability: 0.58, successNext: 'porterUp', failureNext: 'ropeStrain', successMessage: 'The porter climbs while you hold the line from the path.', failureMessage: 'The dead tree tears loose and the line snaps tight.' , failureEffects: { damageItems: ['travelRope'], health: -2 } } },
      { id: 'callRavineHelp', label: 'Call for help from the marked road', next: 'ravineWait' },
      { id: 'leaveRavine', label: 'Retreat and bring a trained crew', next: 'ravineWait', effects: { historyFlags: ['withdrew_for_ravine_rescue_crew'] } },
    ] },
    anchorTest: { id: 'anchorTest', title: 'A Better Anchor', tone: 'warning', text: 'The dead tree is hollow at its roots. The living pine stands beyond a longer path, and a stone horn offers a wide route around the ravine. The porter can climb if the line is anchored well, but the rope will be left behind.', choices: [
      { id: 'anchorPineRope', label: 'Anchor the rope to the living pine', requirements: { usableItems: ['travelRope'] }, next: 'porterUp', effects: { loseItems: ['travelRope'], historyFlags: ['sacrificed_rope_to_rescue_ravine_porter'] } },
      { id: 'walkStoneHorn', label: 'Find the stone path to the ledge', next: 'porterWalked' },
      { id: 'callFromAnchor', label: 'Call the porter toward the stone path', next: 'ravineWait' },
    ] },
    ropeStrain: { id: 'ropeStrain', title: 'The Line Jerks', tone: 'danger', text: 'The failed anchor has damaged your rope. The porter remains on the stable ledge, but the line can no longer hold a full climb. A stone path curves around the ravine, or you can retreat to find a proper crew.', choices: [
      { id: 'walkAfterRope', label: 'Use the stone path to reach the ledge', next: 'porterWalked' },
      { id: 'retreatAfterRope', label: 'Return for a trained rescue crew', next: 'ravineWait' },
    ] },
    porterUp: end('porterUp', 'The Porter Reaches the Rim', 'The porter climbs onto the rim, shaken but able to walk. Your rope remains at the ravine or has taken the strain; the porter insists the cargo can be replaced, while the line cannot be trusted again today.'),
    porterWalked: end('porterWalked', 'The Long Stone Path', 'The stone path reaches the ledge without a rope. You guide the porter around the ravine at a slow pace; the cargo stays below until a proper crew can secure it.'),
    ravineWait: end('ravineWait', 'Help on the Marked Road', 'A rescue crew follows your call and lowers a sound line from the living pine. The porter is brought up safely; you gave up time and the cargo remains for a second trip.'),
  },
};

export const THE_EMPTY_CABIN: Scenario = {
  id: 'the-empty-cabin', title: 'The Empty Cabin', subtitle: 'A dry roof, a cold stove, and a note that does not explain the empty bed.', startScene: 'cabinDoor',
  diversity: { ...tags('An empty remote cabin offers shelter but asks the traveler to respect signs of its absent owner.', 'LOW'), playerRoles: ['traveler/passenger', 'investigator/explorer'], activities: ['survival', 'investigation/mystery'], tones: ['mysterious/eerie', 'peaceful', 'adventurous'], entryShapes: ['stranded during travel', 'accidental encounter'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery'], rewardShapes: ['lodging/food', 'narrative-only payoff'], consequenceShapes: ['time/opportunity'] },
  scenes: {
    cabinDoor: { id: 'cabinDoor', title: 'A Roof without a Keeper', tone: 'warning', text: 'Rain has begun, and a remote cabin door hangs open. Inside are a cold iron stove, a dry bench, and a note asking whoever finds it to leave the shutters unlatched. No food or firewood is visible. Wet footprints lead from the back door to the stream, not back again.', choices: [
      { id: 'readCabinNote', label: 'Read the note and inspect the room', next: 'cabinSigns', effects: { knowledge: ['The empty cabin’s note asks the finder to leave shutters unlatched; wet prints lead toward the stream.'] } },
      { id: 'useCabinShelter', label: 'Use the dry bench for shelter', next: 'cabinNight' },
      { id: 'leaveCabinDoor', label: 'Leave the cabin and seek a road shelter', next: 'cabinRoad' },
    ] },
    cabinSigns: { id: 'cabinSigns', title: 'A Room Kept Ready', tone: 'safe', text: 'The shutters are already unlatched. A blanket is folded on the bench but belongs to the cabin; the note does not invite taking it. From the back step you can see a narrow path down to the stream and a higher track to the road.', choices: [
      { id: 'followCabinPrints', label: 'Follow the prints as far as the stream', next: 'cabinStream' },
      { id: 'stayCabinNight', label: 'Stay on the bench until rain eases', next: 'cabinNight' },
      { id: 'closeCabinDoor', label: 'Leave the room as you found it', next: 'cabinRoad' },
    ] },
    cabinStream: { id: 'cabinStream', title: 'The Water Below the Door', tone: 'warning', text: 'At the stream, the footprints turn upstream and disappear on a stony shelf. The water is low and clear. No person is in sight; the track back to the cabin is still visible through the rain.', choices: [
      { id: 'callCabinStream', label: 'Call toward the upstream bend', next: 'cabinAnswer' },
      { id: 'returnCabinStream', label: 'Return to the cabin before dark', next: 'cabinNight' },
    ] },
    cabinAnswer: { id: 'cabinAnswer', title: 'A Reply in the Rain', tone: 'safe', text: 'A trapper answers from a low shelter upstream. They left the cabin door open for a neighbor expected after the storm, and ask you not to stoke the cold stove without dry fuel. The note was a practical welcome, not a warning.', choices: [
      { id: 'walkWithTrapper', label: 'Walk with the trapper to the road', next: 'cabinRoad', effects: { historyFlags: ['met_trapper_at_empty_cabin'] } },
      { id: 'thankTrapper', label: 'Return to the cabin and wait', next: 'cabinNight' },
    ] },
    cabinNight: end('cabinNight', 'A Dry Bench', 'The rain passes without another sign. You leave the folded blanket, note, and shutters as you found them; shelter was enough, and the empty bed remains the owner’s business.'),
    cabinRoad: end('cabinRoad', 'The Higher Track', 'You take the track back to the road. The cabin remains unforced and dry, and whatever brought its keeper to the stream is left uncertain rather than turned into a danger without evidence.'),
  },
};

export const THE_LONG_WAY_AROUND_EXPEDITION: Scenario = {
  id: 'the-long-way-around-expedition', title: 'The Long Way Around', subtitle: 'A deliberate detour becomes its own journey after the route changes.', startScene: 'routeCommitment', timePhases: [{ id: 'clearMorning', label: 'Clear morning', atMinutes: 0 }, { id: 'clouding', label: 'Clouds gather', atMinutes: 100 }],
  diversity: { ...tags('A route commitment changes later options when new ground information arrives.', 'HIGH'), playerRoles: ['traveler/passenger'], activities: ['travel/exploration', 'survival'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'walk-away/refusal'], consequenceShapes: ['health/injury', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    routeCommitment: { id: 'routeCommitment', title: 'The Long Fork', tone: 'safe', text: 'You carry a sealed parcel to a settlement beyond the hills. The old road crosses a steep ridge; a longer wagon track loops south through a wooded hollow. A drover says the ridge is open, but last night’s rain may have loosened its upper scree.', choices: [
      { id: 'chooseRidgeRoute', label: 'Take the ridge and save half a day', hint: 'The ridge is open, but loose stone may slow the descent.', next: 'ridgeCommitment' },
      { id: 'chooseLongRoute', label: 'Commit to the southern wagon track', next: 'southernCommitment', effects: { historyFlags: ['chose_long_route_before_conditions_worsened'] } },
      { id: 'askRouteDrover', label: 'Ask what the drover saw after the rain', next: 'routeAccount', effects: { knowledge: ['The ridge is open but may have loose scree; the southern wagon track is slower and sheltered.'] } },
    ] },
    routeAccount: { id: 'routeAccount', title: 'What the Drover Saw', tone: 'safe', text: 'The drover saw no fresh slide, only stones scattered across the upper track. They have not taken the ridge today. Both routes remain possible; the southern track is longer but has firm ground.', choices: [
      { id: 'ridgeAfterAccount', label: 'Take the ridge while it is clear', next: 'ridgeCommitment' },
      { id: 'southAfterAccount', label: 'Take the longer sheltered track', next: 'southernCommitment' },
    ] },
    ridgeCommitment: { id: 'ridgeCommitment', title: 'The Upper Scree', tone: 'warning', text: 'The ridge is passable, but a fresh fan of stone covers the direct descent. The parcel is dry under your coat. A narrow footpath reaches the lower road; turning back to the wagon track now costs most of the time you meant to save.', choices: [
      { id: 'crossScreeParcel', label: 'Cross the scree one careful step at a time', hint: 'Loose stones can move beneath you; falling would be serious.', chance: { probability: 0.62, successNext: 'parcelDelivered', failureNext: 'screeInjury', successMessage: 'You cross the fan with the parcel intact.', failureMessage: 'Stone rolls beneath your foot and you strike the slope.', failureEffects: { health: -3 } } },
      { id: 'takeFootpath', label: 'Take the narrow footpath downhill', next: 'footpathArrival' },
      { id: 'turnToSouth', label: 'Turn back and take the wagon track', next: 'southernCommitment' },
    ] },
    southernCommitment: { id: 'southernCommitment', title: 'The Track Bends South', tone: 'warning', text: 'The sheltered wagon track adds several miles. At a washed culvert, the road divides: a high footpath continues through the trees, while the wagon track crosses a shallow but muddy dip. The clouds have reached the ridge, so turning back no longer restores the lost half-day.', choices: [
      { id: 'takeHighFootpath', label: 'Carry the parcel along the high footpath', next: 'footpathArrival' },
      { id: 'crossMuddyDip', label: 'Cross the wagon track dip slowly', chance: { probability: 0.72, successNext: 'parcelDelivered', failureNext: 'parcelMud', successMessage: 'The firm edge holds and you reach the far track.', failureMessage: 'The mud takes your boot, but the parcel stays above it.', failureEffects: { health: -1 } } },
      { id: 'campSouthRoute', label: 'Shelter and finish after the weather passes', next: 'routeDelayed' },
    ] },
    screeInjury: end('screeInjury', 'The Ridge Costs Time', 'You leave the scree by the lower footpath with a badly bruised leg and the parcel still sealed. The settlement takes it a day late; the route chosen did not decide whether you arrived, only what arrival cost.'),
    parcelMud: end('parcelMud', 'A Muddy Delivery', 'You clean the parcel’s outer wrapping at a stream before continuing. It arrives intact and late; the longer route gave you room to stop when the dip proved worse than it looked.'),
    parcelDelivered: end('parcelDelivered', 'The Parcel Arrives', 'The sealed parcel reaches the settlement. The ridge saves time when it holds; the sheltered track offers more chances to pause. Neither route was a promise, and your choice shaped the day that followed.'),
    footpathArrival: end('footpathArrival', 'The Footpath Down', 'The footpath avoids both the loose fan and the muddy dip. You reach the settlement after losing the time you hoped to save, but the parcel and your footing remain sound.'),
    routeDelayed: end('routeDelayed', 'The Road Can Wait', 'You shelter until the cloud passes and deliver the parcel later. The journey misses its first schedule, but the sealed message and your strength remain intact.'),
  },
};

export const RIVER_WITHOUT_A_BRIDGE: Scenario = {
  id: 'river-without-a-bridge', title: 'River without a Bridge', subtitle: 'The crossing is gone, and the river is too strong to treat as a road.', startScene: 'bridgeGone',
  diversity: { ...tags('A vanished bridge leads to a route-and-message problem with no safe direct ford.', 'SEVERE'), playerRoles: ['traveler/passenger'], activities: ['travel/exploration', 'communication/witness', 'survival'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'death'], consequenceShapes: ['health/injury', 'death', 'time/opportunity', 'gear/property/objective'] },
  scenes: {
    bridgeGone: { id: 'bridgeGone', title: 'The Bridge Is Downstream', tone: 'danger', text: 'The timber bridge has been carried away. You stand on the near bank with a sealed letter; the opposite bank is visible across a fast, debris-filled channel. A sawmill road runs upstream and a ferry landing lies downstream, though neither can be seen from here.', choices: [
      { id: 'followUpRiver', label: 'Search upstream for a narrow crossing', next: 'riverUpstream' },
      { id: 'seekRiverFerry', label: 'Follow the bank toward the ferry landing', next: 'riverLanding' },
      { id: 'signalAcrossRiver', label: 'Signal the far-bank road crew', requirements: { anyUsableItems: ['roadsideSignalMirror', 'conductorWhistle', 'trailWhistle'] }, next: 'riverSignal' },
      { id: 'fordFastRiver', label: 'Enter the fast channel with the letter', hint: 'Floating debris and the visible current make this a serious drowning risk.', chance: { probability: 0.28, successNext: 'riverAcross', failureNext: 'riverDeath', successMessage: 'You reach a gravel tongue beyond the strongest current.', failureMessage: 'The current sweeps you beneath the broken bridge timbers.' } },
    ] },
    riverUpstream: { id: 'riverUpstream', title: 'A Shallow Bend', tone: 'warning', text: 'The current divides around a gravel bend upstream. It is shallower here but still above the knee, with loose stones underfoot. A high mill road continues farther along the near bank.', choices: [
      { id: 'crossBendRiver', label: 'Test the gravel bend on foot', hint: 'The water may be shallow enough, but the loose bed can shift.', chance: { probability: 0.59, successNext: 'riverAcross', failureNext: 'riverInjury', successMessage: 'You cross at the bend and keep the letter dry.', failureMessage: 'A stone rolls and the current knocks you down.', failureEffects: { health: -3 } } },
      { id: 'keepMillRoad', label: 'Continue to the mill road and ask for help', next: 'riverMill' },
    ] },
    riverLanding: { id: 'riverLanding', title: 'A Ferry without a Ferryman', tone: 'warning', text: 'The ferry is tied on your side, but the ferryman is away repairing the landing. The boat is sound, and its long ferry pole rests beside the near rail. A notice says he will return by evening. You can wait, walk to the mill for help, or try to pole across alone in the current.', choices: [
      { id: 'waitRiverFerry', label: 'Wait for the ferryman', next: 'riverCrossing' },
      { id: 'walkRiverMill', label: 'Ask the mill crew for a second hand', next: 'riverMill' },
      { id: 'poleFerryAlone', label: 'Take the ferry across alone', hint: 'The far landing is damaged and the current is pulling sideways.', chance: { probability: 0.42, successNext: 'riverAcross', failureNext: 'riverLoss', successMessage: 'You pole into the eddy below the far landing.', failureMessage: 'The ferry swings broadside and the pole slips away.', failureEffects: { health: -1 } } },
    ] },
    riverSignal: { id: 'riverSignal', title: 'A Reply across the Water', tone: 'safe', text: 'The crew sees your signal and points to the ferry landing below. They cannot cross the river themselves, but they will keep the far-side road clear until a boat arrives.', choices: [
      { id: 'followReplyLanding', label: 'Walk downstream to the ferry landing', next: 'riverLanding' },
      { id: 'signalRemainNear', label: 'Wait where the bank is firm', next: 'riverCrossing' },
    ] },
    riverMill: { id: 'riverMill', title: 'A Boat on the Mill Road', tone: 'safe', text: 'Two mill workers bring a flat-bottomed work skiff and tie its painter to a living tree. One rows while the other watches the downstream sweep; the crossing will take longer than a bridge but does not ask you to enter the current on foot.', choices: [
      { id: 'acceptMillBoat', label: 'Cross with the mill workers', next: 'riverAcross', effects: { historyFlags: ['accepted_mill_crew_river_crossing'] } },
      { id: 'waitRiverForFerry', label: 'Wait for the ferryman instead', next: 'riverCrossing' },
    ] },
    riverCrossing: end('riverCrossing', 'A Crossing by Boat', 'The ferryman returns and takes you across in the tied ferry. The letter stays dry, and the broken bridge is reported before another traveler approaches it at speed.'),
    riverAcross: end('riverAcross', 'The Far Bank', 'You reach the far bank with the letter intact, by boat or at the upstream bend. The bridge is gone, but a safe route has been found and marked for those behind you.'),
    riverInjury: end('riverInjury', 'A Hard Fall in the Current', 'You crawl back onto the near bank with a bruised leg and a wet letter. The mill road offers help; the channel has proved too unstable to cross alone.'),
    riverLoss: end('riverLoss', 'The Ferry Swings Free', 'You reach the near bank again, but the ferry’s painter is lost downstream. The mill crew must bring another boat; no one attempts the damaged landing on foot.'),
    riverDeath: end('riverDeath', 'Under the Timbers', 'The current carries you beneath the broken bridge. The far bank is close enough to see, but the debris-filled water leaves no hold.', 'death'),
  },
};

export const NIGHT_ON_THE_RIDGE: Scenario = {
  id: 'night-on-the-ridge', title: 'Night on the Ridge', subtitle: 'Darkness is coming above the tree line, with no rescue party in sight.', startScene: 'ridgeExposure', timePhases: [{ id: 'lastLight', label: 'Last light', atMinutes: 0 }, { id: 'nightfall', label: 'Nightfall', atMinutes: 35 }],
  diversity: { ...tags('A solo traveler must choose shelter placement and whether to descend in worsening light.', 'HIGH'), playerRoles: ['traveler/passenger'], activities: ['survival', 'travel/exploration'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'escape/survival', 'death'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective'] },
  scenes: {
    ridgeExposure: { id: 'ridgeExposure', title: 'Above the Trees', tone: 'warning', text: 'You are alone above the tree line as the last light fades. A shallow lee behind a boulder is out of the wind but exposed to lightning; a rough path descends toward trees, though its loose stones are hard to see. Thunder rolls beyond the ridge.', choices: [
      { id: 'descendRidgeNow', label: 'Descend while you can still see the path', hint: 'Loose stones make a fall possible, but the ridge is exposed.', timeCost: 20, chance: { probability: 0.68, successNext: 'ridgeTrees', failureNext: 'ridgeBruise', successMessage: 'You reach the first trees before dark.', failureMessage: 'You slip on a loose stone and strike your shoulder.', failureEffects: { health: -2 } } },
      { id: 'shelterRidgeLee', label: 'Crouch below the boulder’s low side', next: 'ridgeShelter' },
      { id: 'useRidgeLantern', label: 'Light your lantern and descend slowly', requirements: { anyUsableItems: ['lantern', 'roadmansLantern', 'minerHeadlamp'] }, next: 'ridgeTrees' },
    ] },
    ridgeBruise: { id: 'ridgeBruise', title: 'A Bruised Shoulder', tone: 'danger', text: 'You can move the arm, but it hurts to bear weight. The path below still reaches tree cover; the boulder’s lee remains available if you stop before the lightning reaches the ridge.', choices: [
      { id: 'crawlRidgeDown', label: 'Crawl toward the trees before dark', next: 'ridgeTrees', effects: { health: -1 } },
      { id: 'stayRidgeBruise', label: 'Take the low lee and wait', next: 'ridgeShelter' },
      { id: 'rushRidgeBruise', label: 'Run the exposed descent', hint: 'Your shoulder is hurt and the loose path is nearly dark.', chance: { probability: 0.29, successNext: 'ridgeTrees', failureNext: 'ridgeDeath', successMessage: 'You reach the trees before the next strike.', failureMessage: 'Your footing gives on the exposed slope.' } },
    ] },
    ridgeShelter: { id: 'ridgeShelter', title: 'Lightning over the Crest', tone: 'danger', text: 'A flash lights the ridge, then thunder follows almost at once. The boulder shields wind but not a direct strike. The lower path is visible for only a few breaths after each flash.', choices: [
      { id: 'waitLightning', label: 'Stay low until the storm moves east', next: 'ridgeMorning' },
      { id: 'moveRidgeTrees', label: 'Crawl off the crest toward tree cover', hint: 'Moving in lightning is dangerous, but the boulder is not safe from a direct strike.', chance: { probability: 0.62, successNext: 'ridgeTrees', failureNext: 'ridgeDeath', successMessage: 'You reach the trees between flashes.', failureMessage: 'A strike hits the crest as you cross the open slope.' } },
    ] },
    ridgeTrees: end('ridgeTrees', 'Below the Tree Line', 'You reach the trees with a bruised shoulder and a dry lantern. The ridge remains dangerous in the storm, but the lower ground offers shelter until the trail can be seen again.'),
    ridgeMorning: end('ridgeMorning', 'Light after the Storm', 'You keep low behind the boulder through the storm and descend at first light. The night is cold and uncomfortable, but waiting kept you off the exposed path during the lightning.'),
    ridgeDeath: end('ridgeDeath', 'The Exposed Crest', 'Lightning strikes the open ridge before you reach cover. The storm passes over the empty path.', 'death'),
  },
};

export const THE_MARKERS_STOP: Scenario = {
  id: 'the-markers-stop', title: 'The Markers Stop', subtitle: 'The trail signs end at a place where the land still gives clues.', startScene: 'markerEnd',
  diversity: { ...tags('A low-risk navigation puzzle asks what the missing markers do—and do not—prove.', 'LOW'), depthClass: 'ENCOUNTER', playerRoles: ['traveler/passenger', 'investigator/explorer'], activities: ['travel/exploration', 'puzzle/problem-solving'], tones: ['adventurous', 'peaceful'], entryShapes: ['accidental encounter', 'voluntary curiosity'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery'], rewardShapes: ['money/item/knowledge/history possible', 'narrative-only payoff'], consequenceShapes: ['time/opportunity'] },
  scenes: {
    markerEnd: { id: 'markerEnd', title: 'The Last Painted Stone', tone: 'safe', text: 'The trail markers end at a dry streambed. The old footpath continues on the far side, but no paint marks its entrance. A line of pale stones follows the stream west; birdsong comes from the tree line east. Nothing suggests an emergency.', choices: [
      { id: 'inspectMarkerEnd', label: 'Compare the painted stone with the ground', next: 'markerPattern', effects: { knowledge: ['Trail markers stop at a dry streambed; pale stones continue west and the old path may resume east.'] } },
      { id: 'followMarkerStones', label: 'Follow the pale stones west', next: 'markerWest' },
      { id: 'findMarkerTrees', label: 'Look for the path where birdsong rises', next: 'markerEast' },
      { id: 'markOwnReturn', label: 'Leave a marker for your return', requirements: { usableItems: ['foldingTrailMarker'] }, next: 'markerMarked' },
    ] },
    markerPattern: { id: 'markerPattern', title: 'Marks for a Work Crew', tone: 'safe', text: 'The paint is old, and the streambed has shifted. The pale stones were placed recently to keep pack animals on dry footing; the path probably resumes through the trees, but you cannot know whether it meets the same road.', choices: [
      { id: 'followCrewStones', label: 'Follow the pack stones west', next: 'markerWest' },
      { id: 'followBirdsEast', label: 'Search the tree line east', next: 'markerEast' },
      { id: 'leaveMarkerPath', label: 'Return to the marked trail', next: 'markerReturn' },
    ] },
    markerMarked: { id: 'markerMarked', title: 'Your Own Sign', tone: 'safe', text: 'Your marker stands at the streambed without pretending to know who removed the old paint. The west stones and the eastern tree line remain equally open.', choices: [
      { id: 'markerMarkedWest', label: 'Follow the stones west', next: 'markerWest' },
      { id: 'markerMarkedEast', label: 'Search the eastern tree line', next: 'markerEast' },
    ] },
    markerWest: end('markerWest', 'A Pack Track', 'The stones lead to a work crew’s supply track. The markers were removed when the old stream crossing dried; the crew is glad you left your own sign for travelers coming behind.'),
    markerEast: end('markerEast', 'The Old Path Returns', 'The path resumes among the trees and joins the same trail a mile later. The gap in markers was only a gap, but you now know where the older route runs.'),
    markerReturn: end('markerReturn', 'Back to the Painted Trail', 'You return to the last painted stone and continue along the familiar trail. The unmarked ground can wait for a map or a companion who knows it.'),
  },
};

export const THE_ICE_GIVES_WARNING: Scenario = {
  id: 'the-ice-gives-warning', title: 'The Ice Gives Warning', subtitle: 'The crossing has not failed yet; the traveler behind you has not seen the cracks.', startScene: 'iceWarning',
  diversity: { ...tags('A pre-emptive ice decision protects a group before anyone falls through.', 'SEVERE', 'WINTER'), playerRoles: ['witness', 'helper/rescuer'], activities: ['survival', 'communication/witness'], entryShapes: ['witnesses incident'], outcomeShapes: ['success/partial success', 'death', 'costly success/no-perfect-outcome possible'], consequenceShapes: ['health/injury', 'death', 'time/opportunity'] },
  scenes: {
    iceWarning: { id: 'iceWarning', title: 'A Crack Runs Ahead', tone: 'danger', text: 'You stand at the near bank of a frozen creek. A traveler with a handcart is already stepping onto the ice ahead of you. A dark line crosses the surface near the far bank, and water moves beneath a thin patch beside the reeds. The traveler has not seen it.', choices: [
      { id: 'callIceWarning', label: 'Call the traveler back to shore', next: 'iceTravelerStops', effects: { historyFlags: ['warned_cart_traveler_about_thin_ice'] } },
      { id: 'signalIceLight', label: 'Flash your lantern toward the thin patch', requirements: { anyUsableItems: ['lantern', 'roadmansLantern', 'roadsideSignalMirror'] }, next: 'iceTravelerStops' },
      { id: 'throwIceLine', label: 'Anchor a rope and offer a handline', requirements: { usableItems: ['travelRope'] }, next: 'iceTravelerStops' },
      { id: 'crossIceAlone', label: 'Cross before the traveler reaches the crack', hint: 'The dark line and moving water show that the ice may not hold your weight.', chance: { probability: 0.38, successNext: 'iceFarBank', failureNext: 'iceBreak', successMessage: 'You reach the far bank without stepping on the dark seam.', failureMessage: 'The ice opens beneath your leading foot.' } },
    ] },
    iceTravelerStops: { id: 'iceTravelerStops', title: 'Back from the Seam', tone: 'warning', text: 'The traveler stops and sees the dark crack. Their handcart is still on the near bank. The creek bends around a shallow gravel bar upstream, but reaching it means carrying the cart along a narrow snowy bank.', choices: [
      { id: 'leadIceUpstream', label: 'Guide the cart to the gravel bar', next: 'iceGravelRoute' },
      { id: 'waitIceThaw', label: 'Wait for daylight and ask at the mill', next: 'iceSafeWait' },
      { id: 'testIceSeam', label: 'Probe the ice from the bank', requirements: { usableItems: ['smallKnife', 'foremanMultiTool', 'steelWedge'] }, next: 'iceRead' },
    ] },
    iceRead: { id: 'iceRead', title: 'Water under the Skin', tone: 'danger', text: 'The probe breaks through the thin patch with little force. The dark seam is not a safe walking line; the cart cannot cross there today. The gravel bend upstream remains the only visible way across without waiting.', choices: [
      { id: 'moveIceCart', label: 'Take the cart toward the gravel bend', next: 'iceGravelRoute' },
      { id: 'leaveIceCart', label: 'Leave the cart and seek a mill road', next: 'iceSafeWait' },
    ] },
    iceGravelRoute: { id: 'iceGravelRoute', title: 'The Gravel Bend', tone: 'warning', text: 'The bar narrows the creek but exposes shallow water. The cart can be carried across in pieces, though the stones are slick and the current is cold. The mill road is farther upstream and remains dry.', choices: [
      { id: 'carryCartIceBend', label: 'Carry the cart across in pieces', chance: { probability: 0.72, successNext: 'iceFarBank', failureNext: 'iceColdFall', successMessage: 'The cart and traveler reach the far bank on foot.', failureMessage: 'A wheel slips in the shallows and you fall against the stones.', failureEffects: { health: -2 } } },
      { id: 'takeIceMillRoad', label: 'Use the longer dry mill road', next: 'iceSafeWait' },
    ] },
    iceBreak: end('iceBreak', 'The Creek Opens', 'The ice breaks under you. The traveler reaches for the rope from shore, but the current carries you under the sheet before they can pull you free.', 'death'),
    iceColdFall: end('iceColdFall', 'A Wet Crossing', 'You reach the far bank with a bruised leg and cold water in your clothes. The traveler and cart are safe; the mill’s warm room is now the first stop, not the town beyond.'),
    iceFarBank: end('iceFarBank', 'Across without the Thin Ice', 'The traveler reaches the far bank with the cart by the gravel bar or a careful line. The cracked seam remains undisturbed; you have prevented a crossing disaster rather than rescued someone already in the water.'),
    iceSafeWait: end('iceSafeWait', 'A Road That Holds', 'You take the longer mill road and report the thin crossing. The cart arrives later, but no one is asked to trust ice that has already shown water beneath it.'),
  },
};

export const THE_WASHED_OUT_CUT: Scenario = {
  id: 'the-washed-out-cut', title: 'The Washed-Out Cut', subtitle: 'A road cut is gone; the gap is not a bridge and should not be treated like one.', startScene: 'cutCollapse',
  diversity: { ...tags('A collapsed hillside cut requires communication and a long traverse rather than a bridge crossing.', 'HIGH'), playerRoles: ['traveler/passenger', 'witness'], activities: ['travel/exploration', 'communication/witness', 'survival'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'escape/survival'], consequenceShapes: ['health/injury', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    cutCollapse: { id: 'cutCollapse', title: 'The Road Ends at the Slide', tone: 'danger', text: 'A hillside has collapsed across the road cut. You stand on the west side with a cart driver; a pair of travelers waits on the east side. The gap is twenty feet across and drops into wet stone, not a river. The slope above is cracked, and both sides can still see each other.', choices: [
      { id: 'callAcrossCut', label: 'Call the east-side travelers to stay put', next: 'cutContact', effects: { historyFlags: ['warned_travelers_at_washed_cut'] } },
      { id: 'signalAcrossCut', label: 'Use a mirror or whistle to signal', requirements: { anyUsableItems: ['roadsideSignalMirror', 'trailWhistle', 'conductorWhistle'] }, next: 'cutContact' },
      { id: 'inspectCutSlope', label: 'Look for a way around the upper lip', next: 'cutTraverse' },
      { id: 'climbCutFace', label: 'Climb straight over the broken face', hint: 'Loose rock is falling from the cracked slope above.', chance: { probability: 0.29, successNext: 'cutEastSide', failureNext: 'cutFall', successMessage: 'You reach a stable ledge above the slide.', failureMessage: 'The cracked face sheds stone beneath your hands.', failureEffects: { health: -3 } } },
    ] },
    cutContact: { id: 'cutContact', title: 'Voices across the Gap', tone: 'warning', text: 'The east-side travelers answer and agree to remain back from the edge. One is a road surveyor; they know of a narrow traverse above the cut, but it is too tight for carts. The cart and its load will need to wait for repair.', choices: [
      { id: 'takeCutTraverse', label: 'Traverse above the slide on foot', next: 'cutTraverse' },
      { id: 'waitCutCrew', label: 'Stay visible until a repair crew arrives', next: 'cutRepair' },
      { id: 'retreatCut', label: 'Return to the last settlement', next: 'cutRetreat' },
    ] },
    cutTraverse: { id: 'cutTraverse', title: 'The Upper Lip', tone: 'danger', text: 'A narrow ledge runs above the slide, away from the falling face. It is wide enough for one person at a time but not for the cart. A living pine at each end can take a handline; loose rock still moves underfoot.', choices: [
      { id: 'ropeCutTraverse', label: 'Set your rope as a handline', requirements: { usableItems: ['travelRope'] }, chance: { probability: 0.78, bonusItems: ['ironRopeClamp'], bonusProbability: 0.1, successNext: 'cutEastSide', failureNext: 'cutInjury', successMessage: 'The line steadies each person across the ledge.', failureMessage: 'The line jerks against a sharp edge and you fall onto the lower shelf.', failureEffects: { health: -2, damageItems: ['travelRope'] } } },
      { id: 'walkCutLedge', label: 'Cross the ledge one at a time', hint: 'The route is narrow but stable if the party keeps distance.', chance: { probability: 0.67, successNext: 'cutEastSide', failureNext: 'cutInjury', successMessage: 'The party crosses with space between each traveler.', failureMessage: 'A loose stone rolls and bruises your leg.', failureEffects: { health: -2 } } },
      { id: 'stopCutLedge', label: 'Wait for the road crew', next: 'cutRepair' },
    ] },
    cutEastSide: end('cutEastSide', 'The Other Side of the Cut', 'Everyone reaches the east road, but the cart remains behind. The surveyor records the slide and arranges a proper road repair; the narrow ledge was a foot route, not a substitute bridge.'),
    cutRepair: end('cutRepair', 'A Crew at the Cut', 'The repair crew ropes off both approaches and begins clearing the slope from stable ground. The travelers remain visible to one another until a safe foot route is opened; the cart waits for the road itself.'),
    cutRetreat: end('cutRetreat', 'Back to the Settlement', 'You return west with the cart driver and report the cut. The travelers on the other side remain in view and have shelter nearby; no one is forced onto the cracked slope.'),
    cutInjury: end('cutInjury', 'A Fall to the Lower Shelf', 'You reach the lower shelf with a bruised leg. The traverse is abandoned until the repair crew arrives; the party is divided by the slide, but both sides have safe ground to wait on.'),
    cutFall: end('cutFall', 'Below the Cut', 'The cracked slope gives way beneath you. The gap is too steep for the others to reach you before more stone falls.', 'death'),
  },
};

export const THE_WRONG_VALLEY: Scenario = {
  id: 'the-wrong-valley', title: 'The Wrong Valley', subtitle: 'The water, sun, and slope tell you the route went wrong before the map does.', startScene: 'valleyMismatch',
  diversity: { ...tags('A navigation error is corrected by terrain reading, with a viable unknown-valley exit.', 'MODERATE'), playerRoles: ['traveler/passenger', 'investigator/explorer'], activities: ['travel/exploration', 'puzzle/problem-solving'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'escape/survival'], consequenceShapes: ['health/injury', 'time/opportunity'] },
  scenes: {
    valleyMismatch: { id: 'valleyMismatch', title: 'The Sun Is on the Wrong Side', tone: 'warning', text: 'You expected a west-facing valley, but the afternoon sun falls behind your right shoulder. The stream also runs uphill toward a notch that was not on your sketch. The ground is open and dry; you have not lost the trail completely.', choices: [
      { id: 'readWrongValley', label: 'Compare slope, sun, and water flow', next: 'valleyRead', effects: { knowledge: ['In the wrong valley, afternoon sun and stream direction helped identify the east-facing notch.'] } },
      { id: 'followWrongWater', label: 'Follow the stream downhill', next: 'valleyWater' },
      { id: 'climbWrongNotch', label: 'Climb to the notch for a view', hint: 'The slope is loose but not sheer; a fall would hurt, not trap you.', chance: { probability: 0.67, successNext: 'valleyNotch', failureNext: 'valleyBruise', successMessage: 'The notch reveals the road beyond the eastern ridge.', failureMessage: 'Loose shale slides beneath your boot.', failureEffects: { health: -2 } } },
      { id: 'backWrongValley', label: 'Return by your own tracks', next: 'valleyReturn' },
    ] },
    valleyRead: { id: 'valleyRead', title: 'An East-Facing Fold', tone: 'safe', text: 'The water runs away from the notch, and the sun angle places you east of the route. You can follow the stream to a farm road or climb the notch to confirm the road before choosing.', choices: [
      { id: 'followStreamOut', label: 'Follow the stream to lower ground', next: 'valleyWater' },
      { id: 'confirmNotch', label: 'Climb the notch for a wider view', next: 'valleyNotch' },
      { id: 'returnReadValley', label: 'Use your tracks to retrace the route', next: 'valleyReturn' },
    ] },
    valleyWater: { id: 'valleyWater', title: 'A Farm Road below', tone: 'safe', text: 'The stream meets a farm road with a waypost. It leads to the next settlement, not the ridge you intended. You have enough daylight to reach it, though it will take most of the afternoon.', choices: [
      { id: 'takeFarmRoad', label: 'Take the road to the settlement', next: 'valleyArrival', effects: { historyFlags: ['found_exit_from_wrong_valley_by_watercourse'] } },
      { id: 'askFarmRoad', label: 'Ask the farm for a route back west', next: 'valleyArrival', effects: { knowledge: ['A farm road in the east-facing valley leads to the settlement and the western ridge route.'] } },
    ] },
    valleyNotch: { id: 'valleyNotch', title: 'The Road beyond the Notch', tone: 'warning', text: 'The notch shows a road on the eastern slope and a darkening cloud over the ridge you meant to cross. Reaching the original route would take another climb; the farm road is lower and already visible.', choices: [
      { id: 'descendToFarmRoad', label: 'Descend to the visible farm road', next: 'valleyArrival' },
      { id: 'climbBackWest', label: 'Climb back toward the ridge route', hint: 'The cloud is moving toward that ridge, and the return climb is steep.', chance: { probability: 0.43, successNext: 'valleyReturn', failureNext: 'valleyBruise', successMessage: 'You regain the marked ridge before weather arrives.', failureMessage: 'The ridge path remains beyond the cloud and your footing fails.', failureEffects: { health: -2 } } },
    ] },
    valleyBruise: end('valleyBruise', 'A Slower Way Out', 'You leave the loose slope by the stream and reach the farm road with a bruised ankle. The planned route is lost for the day, but the valley has given you a safe way to a settlement.'),
    valleyReturn: end('valleyReturn', 'Back by Your Own Tracks', 'You follow your footprints to the last familiar ridge. The mistake costs daylight and the original crossing, but you return without trusting an unknown valley after dark.'),
    valleyArrival: end('valleyArrival', 'A Road with a Name', 'You reach a settlement by the lower farm road. It lies east of your intended route, but a waypost and local directions put the western ridge back within reach tomorrow.'),
  },
};

export const THE_ROCKS_START_MOVING: Scenario = {
  id: 'the-rocks-start-moving', title: 'The Rocks Start Moving', subtitle: 'A few stones fall first; the next sound may mean the slope is coming.', startScene: 'rockfallRoute',
  diversity: { ...tags('A short high-pressure rockfall escape asks which shelter remains outside the fall line.', 'SEVERE'), depthClass: 'ENCOUNTER', playerRoles: ['traveler/passenger', 'witness'], activities: ['survival', 'communication/witness'], entryShapes: ['witnesses incident'], outcomeShapes: ['success/partial success', 'death', 'escape/survival'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective'] },
  scenes: {
    rockfallRoute: { id: 'rockfallRoute', title: 'The First Stones', tone: 'danger', text: 'Small stones bounce across a narrow road cut beneath a fractured slope. A cart is behind you; a road worker is ahead near a stone recess on the left. The sound above is growing, and a clear stretch runs to the recess while the road behind remains open.', choices: [
      { id: 'warnWorkerRockfall', label: 'Shout for the worker to reach the recess', next: 'rockfallRecess', effects: { historyFlags: ['warned_road_worker_of_rockfall'] } },
      { id: 'runRecessRockfall', label: 'Run to the stone recess on the left', hint: 'The recess is outside the visible fall line, but reaching it means crossing the open cut.', chance: { probability: 0.67, successNext: 'rockfallRecess', failureNext: 'rockfallBruise', successMessage: 'You reach the recess as larger stones cross the road.', failureMessage: 'A stone clips your leg before you clear the open cut.', failureEffects: { health: -2 } } },
      { id: 'retreatRockfall', label: 'Retreat with the cart along the open road', next: 'rockfallRetreat' },
      { id: 'pullWorkerRockfall', label: 'Rush directly to the worker', hint: 'They are ahead in the fall line; another stone is already descending.', chance: { probability: 0.39, successNext: 'rockfallRescue', failureNext: 'rockfallDeath', successMessage: 'You reach the worker and both dive behind the recess wall.', failureMessage: 'The slope breaks before you reach them.' } },
    ] },
    rockfallRecess: { id: 'rockfallRecess', title: 'The Cut Fills', tone: 'danger', text: 'Stone covers the road where you stood. The worker is inside the recess, shaken but standing. The cart remains behind a low bend and cannot be reached until the slope settles.', choices: [
      { id: 'stayRockfallRecess', label: 'Stay behind the stone wall', next: 'rockfallSafe' },
      { id: 'leaveRockfallGear', label: 'Leave the cart and climb the upper path', next: 'rockfallSafe', effects: { historyFlags: ['abandoned_cart_to_escape_rockfall'] } },
    ] },
    rockfallBruise: { id: 'rockfallBruise', title: 'Stone across the Road', tone: 'danger', text: 'Your leg is bruised, but you can stand. The recess remains within a few strides; the road worker is crouched behind its wall, and another rumble rolls from above.', choices: [
      { id: 'crawlRockfallRecess', label: 'Crawl behind the recess wall', next: 'rockfallSafe' },
      { id: 'runRockfallBack', label: 'Retreat around the lower bend', next: 'rockfallRetreat' },
    ] },
    rockfallRescue: end('rockfallRescue', 'Behind the Recess Wall', 'You pull the worker into the recess as the larger fall blocks the road. The cart and cargo are inaccessible for now; both people are alive and the road crew can clear the cut when the slope stops moving.'),
    rockfallSafe: end('rockfallSafe', 'When the Slope Settles', 'The fall passes over the cut. You and the worker climb the upper path without the cart; the road is gone for the day, but the recess kept the party outside the slide.'),
    rockfallRetreat: end('rockfallRetreat', 'Below the Fall Line', 'You retreat around the lower bend before the cut collapses. The cart may be trapped beyond the slide, but no one is asked to cross beneath a slope that has already begun to move.'),
    rockfallDeath: end('rockfallDeath', 'The Slope Lets Go', 'The fractured slope gives way before you reach the worker. The road disappears beneath the fall.', 'death'),
  },
};

export const THE_TREE_ACROSS_THE_CREEK: Scenario = {
  id: 'the-tree-across-the-creek', title: 'The Tree across the Creek', subtitle: 'A fallen trunk reaches the other bank, but it is not a bridge.', startScene: 'treeCrossing',
  diversity: { ...tags('A makeshift log crossing must be tested against the safer but longer ford.', 'HIGH'), playerRoles: ['traveler/passenger'], activities: ['survival', 'travel/exploration'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'death', 'escape/survival'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective', 'time/opportunity'] },
  scenes: {
    treeCrossing: { id: 'treeCrossing', title: 'A Trunk over Moving Water', tone: 'warning', text: 'A storm-fallen tree reaches from this bank to the far bank above a fast creek. Its bark is slick and one root still flexes in the current. The marked ford is half a mile upstream, beyond a muddy rise. Your pack can be left on this bank.', choices: [
      { id: 'testTreeCrossing', label: 'Test the trunk from the bank', next: 'treeTest' },
      { id: 'useRopeTree', label: 'Secure your rope to the near-bank stump', requirements: { usableItems: ['travelRope'] }, hint: 'The stump is rooted, but the tree may still roll.', next: 'treeLine' },
      { id: 'takeMarkedFord', label: 'Walk to the marked ford', next: 'treeFord' },
      { id: 'throwPackTree', label: 'Throw your pack across before crossing', next: 'packAcross' },
    ] },
    treeTest: { id: 'treeTest', title: 'The Root Still Moves', tone: 'danger', text: 'The trunk flexes under a hard push. It can hold a single careful crossing if the root settles, but it could roll if weight shifts suddenly. The upstream ford remains marked and shallow enough to inspect.', choices: [
      { id: 'crawlTreeTrunk', label: 'Crawl across the trunk slowly', hint: 'A slip means cold, fast water below.', chance: { probability: 0.56, successNext: 'treeFarBank', failureNext: 'treeColdWater', successMessage: 'The trunk holds as you crawl to the far bank.', failureMessage: 'The trunk rolls and drops you into the creek.', failureEffects: { health: -2 } } },
      { id: 'walkTreeFord', label: 'Take the marked ford instead', next: 'treeFord' },
      { id: 'backFromTree', label: 'Turn back along the known path', next: 'treeReturn' },
    ] },
    treeLine: { id: 'treeLine', title: 'A Line for the Crossing', tone: 'warning', text: 'The rope is tied to the stump, but it cannot stop the trunk from rolling. The ford is still the safer route; the line may steady one crossing if you leave your pack and take the tree slowly.', choices: [
      { id: 'lineCrawlTree', label: 'Use the line and crawl across', chance: { probability: 0.7, successNext: 'treeFarBank', failureNext: 'treeColdWater', successMessage: 'The rope steadies your crawl to the far side.', failureMessage: 'The root turns and the line jerks you into the creek.', failureEffects: { health: -2, damageItems: ['travelRope'] } } },
      { id: 'lineTakeFord', label: 'Recover the rope and use the ford', next: 'treeFord' },
      { id: 'sacrificeTreeLine', label: 'Leave the rope as a handline and retreat', next: 'treeReturn', effects: { loseItems: ['travelRope'], historyFlags: ['left_rope_at_storm_fallen_tree_crossing'] } },
    ] },
    packAcross: { id: 'packAcross', title: 'The Pack on the Far Bank', tone: 'warning', text: 'The pack lands on the far bank, but the trunk still flexes and the creek runs hard underneath. Your essential gear is now across; you can take the tree, use the upstream ford, or leave the pack for a safer return later.', choices: [
      { id: 'crossAfterPack', label: 'Crawl across without the pack', chance: { probability: 0.52, successNext: 'treeFarBank', failureNext: 'treeColdWater', successMessage: 'You crawl to the far bank and recover the pack.', failureMessage: 'The trunk rolls beneath you.', failureEffects: { health: -2 } } },
      { id: 'goFordAfterPack', label: 'Walk upstream to the marked ford', next: 'treeFord' },
      { id: 'leavePackTree', label: 'Leave the pack and return later', next: 'treeReturn', effects: { historyFlags: ['left_pack_across_unstable_tree'] } },
    ] },
    treeFord: end('treeFord', 'The Marked Shallows', 'The ford takes longer, and the water reaches your knees, but its gravel bed holds. You cross with your pack and leave the storm-fallen trunk for no one to mistake as a sure bridge.'),
    treeFarBank: end('treeFarBank', 'The Trunk Holds Once', 'You reach the far bank by the fallen trunk. The crossing worked, but the root has shifted and no longer offers a reliable route for anyone following.'),
    treeColdWater: end('treeColdWater', 'A Cold Fall', 'You reach the bank soaked and bruised. The pack or rope may be lost to the creek; the marked ford remains the only reasonable way onward.'),
    treeReturn: end('treeReturn', 'Back along the Known Path', 'You return to the trail rather than turn the fallen tree into a bridge by assumption. The crossing may be tried later with help or left to the water.'),
  },
};

export const THE_ABANDONED_CAMP: Scenario = {
  id: 'the-abandoned-camp', title: 'The Abandoned Camp', subtitle: 'A meal is left out, but there is no sign of a struggle.', startScene: 'emptyCamp',
  diversity: { ...tags('An empty camp offers contradictory clues and a choice about property, search, and waiting.', 'MODERATE'), playerRoles: ['investigator/explorer', 'traveler/passenger'], activities: ['investigation/mystery', 'survival'], entryShapes: ['accidental encounter'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery'], rewardShapes: ['money/item/knowledge/history possible', 'narrative-only payoff'], consequenceShapes: ['time/opportunity', 'gear/property/objective'] },
  scenes: {
    emptyCamp: { id: 'emptyCamp', title: 'A Fire Left Warm', tone: 'warning', text: 'A small camp stands beside the trail. The fire is down to coals, a covered pot remains on a flat stone, and a bedroll is gone. No blood or broken gear is visible. Fresh tracks lead both toward the ridge and down to a stream.', choices: [
      { id: 'inspectCamp', label: 'Read the tracks around the fire', next: 'campTracks', effects: { knowledge: ['The abandoned camp had a warm fire, food covered in a pot, and tracks toward both ridge and stream.'] } },
      { id: 'callAtCamp', label: 'Call out and wait for an answer', next: 'campAnswer' },
      { id: 'leaveCampAlone', label: 'Leave the camp and keep to the trail', next: 'campLeave' },
      { id: 'takeCampFood', label: 'Take food from the covered pot', hint: 'The food belongs to whoever left the camp; there is no evidence it was abandoned for good.', next: 'campTaken', effects: { historyFlags: ['took_food_from_unattended_camp'] } },
    ] },
    campTracks: { id: 'campTracks', title: 'Two Ordinary Trails', tone: 'safe', text: 'The ridge bootprints head to a viewpoint. Lighter prints descend to the shallow stream; neither line shows a hurried departure, and the camp is not far from the road.', choices: [
      { id: 'followRidgeTracks', label: 'Follow the bootprints to the viewpoint', next: 'campRidge' },
      { id: 'followStreamTracks', label: 'Check where the stream prints lead', next: 'campStream', effects: { setFlags: ['streamTracksChecked'] } },
      { id: 'waitAtCamp', label: 'Wait by the trail without touching gear', next: 'campAnswer' },
    ] },
    campRidge: { id: 'campRidge', title: 'A View above the Camp', tone: 'safe', text: 'A traveler sits on the ridge sketching the valley. They left the bedroll and meal while checking the view; they say their stream trip was yesterday. That accounts for the traveler, but it does not identify the lighter prints. They ask you not to move their things.', choices: [
      { id: 'tellCamperTracks', label: 'Compare notes without guessing who left them', next: 'campReunion' },
      { id: 'leaveRidgeCamper', label: 'Return to the trail', next: 'campLeave' },
    ] },
    campStream: { id: 'campStream', title: 'A Bootprint at the Water', tone: 'warning', text: 'The stream is clear and shallow. A bootprint crosses to the opposite bank, then follows the water upstream toward the ridge path. The trail back to camp remains visible; there is no call or sign of injury, and the tracks do not identify their owner.', choices: [
      { id: 'followStreamCamper', label: 'Follow the prints to the ridge path', next: 'campRidge' },
      { id: 'returnEmptyCamp', label: 'Return without crossing the stream', next: 'campAnswer' },
    ] },
    campTaken: end('campTaken', 'Food for the Road', 'You take the food and leave a note at the camp describing what you saw. The choice saves your meal, but the traveler returns to find their covered pot empty and your note in its place.'),
    campAnswer: end('campAnswer', 'No One Answers', 'No one answers from the ridge or stream. You leave the food and bedroll undisturbed and tell the next road keeper where the camp stands; there was no evidence to turn an empty site into a rescue emergency.'),
    campLeave: end('campLeave', 'The Trail Keeps Going', 'You leave the camp as you found it. The traveler may return from either short path, and nothing in the quiet site proves they are lost.'),
    campReunion: { ...end('campReunion', 'A Camper Returns', 'The traveler returns to camp and finds the meal and gear untouched. Their account explains why they left, while the unclaimed stream prints remain just that: unclaimed. You leave without turning an ordinary absence into a certainty.'), textVariants: [
      { requirements: { flags: ['streamTracksChecked'] }, text: 'The traveler returns to camp and finds the meal and gear untouched. Their account places them on the ridge, not at the stream; you checked where the prints led, but could not prove whose they were. You part with a clear limit on what the evidence establishes.' },
    ] },
  },
};

export const THE_WIND_CHANGES: Scenario = {
  id: 'the-wind-changes', title: 'The Wind Changes', subtitle: 'The warning arrives as a smell and a direction before anything is visible.', startScene: 'windShift', timePhases: [{ id: 'steadyWind', label: 'Steady wind', atMinutes: 0 }, { id: 'windTurn', label: 'Wind turns', atMinutes: 18 }],
  diversity: { ...tags('An unseen grass fire is inferred from wind shift, ash, and animal movement before smoke appears.', 'HIGH'), playerRoles: ['traveler/passenger', 'witness'], activities: ['survival', 'travel/exploration'], entryShapes: ['accidental encounter'], outcomeShapes: ['success/partial success', 'escape/survival', 'death'], consequenceShapes: ['health/injury', 'death', 'gear/property/objective'] },
  scenes: {
    windShift: { id: 'windShift', title: 'Ash on the West Wind', tone: 'warning', text: 'You are crossing open grassland when the wind turns west. A dry, bitter smell follows, and birds lift from the western ditch all at once. No smoke is visible yet. A low stone wall offers cover, while the marked road runs east toward a farm.', choices: [
      { id: 'readWindSigns', label: 'Watch the grass and birds from the wall', next: 'windRead', effects: { knowledge: ['A west wind carried ash and drove birds east before smoke was visible over the grassland.'] } },
      { id: 'takeWindEastRoad', label: 'Leave by the marked road to the east', next: 'windEscape' },
      { id: 'climbWindRise', label: 'Climb the rise to see beyond the grass', hint: 'The wind is carrying dry ash; the ridge may be exposed if fire is moving.', chance: { probability: 0.68, successNext: 'windSeen', failureNext: 'windSmoke', successMessage: 'From the rise you see a grass fire still beyond the western ditch.', failureMessage: 'Smoke reaches the rise before you can get a clear view.', failureEffects: { health: -1 } } },
    ] },
    windRead: { id: 'windRead', title: 'The Birds Move East', tone: 'warning', text: 'The birds and loose ash both travel east with the wind. The west field is hidden by low ground, but the farm lies beyond the same open grass. The stone wall gives only a brief shelter, not a place to wait.', choices: [
      { id: 'leaveWindEast', label: 'Take the east road to the farm', next: 'windEscape' },
      { id: 'signalWindFarm', label: 'Signal the farm before leaving', requirements: { anyUsableItems: ['roadsideSignalMirror', 'trailWhistle'] }, next: 'windWarned' },
      { id: 'waitWindSmoke', label: 'Stay behind the wall until smoke appears', hint: 'The wind is carrying dry ash toward you; waiting may close the road.', next: 'windSmoke' },
    ] },
    windSeen: { id: 'windSeen', title: 'Fire beyond the Ditch', tone: 'danger', text: 'A thin line of flame moves through dry grass west of the road. The wind pushes it east toward the farm, while the east road remains clear. You can warn the farm from the rise or leave now.', choices: [
      { id: 'warnFromRise', label: 'Signal the farm from the rise', requirements: { anyUsableItems: ['roadsideSignalMirror', 'trailWhistle'] }, next: 'windWarned' },
      { id: 'leaveFromRise', label: 'Take the east road immediately', next: 'windEscape' },
    ] },
    windSmoke: { id: 'windSmoke', title: 'Smoke over the Wall', tone: 'danger', text: 'Smoke is now visible across the western grass. The east road is still clear, but the wall is no longer a safe place to watch from. The farm can be warned only from the rise; reaching it means moving toward the fire’s direction.', choices: [
      { id: 'runWindEast', label: 'Run east along the marked road', hint: 'The fire is behind you and the road ahead remains visible.', next: 'windEscape', effects: { health: -1 } },
      { id: 'riskWindSignal', label: 'Climb to signal the farm', hint: 'The hill is exposed to smoke and fire moving with the west wind.', chance: { probability: 0.44, successNext: 'windWarned', failureNext: 'windEscape', successMessage: 'The farm sees the warning and leaves east.', failureMessage: 'Smoke drives you off the rise; the farm must see the fire for itself.', failureEffects: { health: -2 } } },
    ] },
    windWarned: end('windWarned', 'The Farm Leaves in Time', 'The household takes the eastern road with you. The fire crosses the grass behind the stone wall; you warned them before the flame was visible from the yard.'),
    windEscape: end('windEscape', 'The Clear Road East', 'You reach the farm road ahead of the fire. Whether or not the household sees the smoke in time, you are clear of the grassland and carry a useful warning about the wind shift.'),
  },
};

export const THE_LOAD_MUST_GO: Scenario = {
  id: 'the-load-must-go', title: 'The Load Must Go', subtitle: 'A wagon’s weight has become more dangerous than what it carries.', startScene: 'steepGrade',
  diversity: { ...tags('A failing wagon on a steep grade requires an explicit sacrifice among cargo, supplies, and schedule.', 'HIGH'), playerRoles: ['helper/rescuer', 'traveler/passenger'], activities: ['survival', 'moral prioritization', 'labor/repair'], entryShapes: ['accidental encounter'], outcomeShapes: ['success/partial success', 'costly success/no-perfect-outcome possible', 'escape/survival'], consequenceShapes: ['health/injury', 'gear/property/objective', 'time/opportunity', 'money/wages'] },
  scenes: {
    steepGrade: { id: 'steepGrade', title: 'The Wheels Slide Back', tone: 'danger', text: 'A hired freight wagon has stopped on a steep clay road. Its brakes hold, but each wheel sinks a little as the rain softens the grade. The driver has three loads: a locked medicine chest for the settlement, barrels of lamp oil, and his own bedding. The low road below is washed out; the only safe turn is a level shelf above.', choices: [
      { id: 'unloadOil', label: 'Roll the oil barrels onto the level shelf', next: 'loadLightened', effects: { setFlags: ['sacrificed_oil_cargo'] } },
      { id: 'unloadBedding', label: 'Leave the bedding to lighten the wagon', next: 'loadLightened', effects: { setFlags: ['sacrificed_bedding'] } },
      { id: 'braceWheels', label: 'Brace the wheels with your steel wedge', requirements: { usableItems: ['steelWedge'] }, next: 'loadBraced', effects: { historyFlags: ['braced_freight_wagon_on_clay_grade'] } },
      { id: 'walkAwayLoad', label: 'Leave the wagon and get the driver uphill', next: 'loadAbandoned', effects: { historyFlags: ['abandoned_wagon_to_save_driver'] } },
    ] },
    loadLightened: { id: 'loadLightened', title: 'One Load Left Behind', tone: 'warning', text: 'The chosen load is on the level shelf and will not roll. The medicine chest and remaining freight can now move, but the driver has clearly lost either goods he was paid to deliver or the bedding he needs tonight.', choices: [
      { id: 'moveLightenedWagon', label: 'Walk the lighter wagon to the upper road', chance: { probability: 0.76, successNext: 'loadArrival', failureNext: 'loadSlip', successMessage: 'The wagon reaches level ground with the remaining load secure.', failureMessage: 'The clay shifts again and the rear wheel slides.', failureEffects: { health: -1 } } },
      { id: 'leaveLoadWagon', label: 'Keep the driver uphill and wait for a team', next: 'loadAbandoned' },
    ] },
    loadBraced: { id: 'loadBraced', title: 'The Wedge Holds', tone: 'danger', text: 'The wedge stops the rear wheel from rolling, but the clay continues to soften. The wagon can reach the level shelf if the driver unloads something first; the wedge is not a substitute for weight reduction.', choices: [
      { id: 'dropOilLoad', label: 'Leave the oil barrels for a second trip', next: 'loadLightened', effects: { setFlags: ['sacrificed_oil_cargo'] } },
      { id: 'dropBedLoad', label: 'Leave the bedding for a second trip', next: 'loadLightened', effects: { setFlags: ['sacrificed_bedding'] } },
      { id: 'holdLoadGrade', label: 'Hold position until a second team arrives', next: 'loadWait' },
    ] },
    loadSlip: { id: 'loadSlip', title: 'The Rear Wheel Slides', tone: 'danger', text: 'The wagon slips but stops at the shelf. The medicine chest is still tied down; one barrel has split and the driver’s bedding is soaked. The road above is safe on foot, while the wagon needs a second team.', choices: [
      { id: 'saveDriverLoad', label: 'Walk the driver to the upper road', next: 'loadArrival', effects: { historyFlags: ['saved_driver_after_wagon_slip'] } },
      { id: 'tryAgainLoad', label: 'Try to save the wagon before dark', hint: 'The wet grade has already moved the wagon once.', chance: { probability: 0.36, successNext: 'loadArrival', failureNext: 'loadLoss', successMessage: 'The driver’s second brace holds long enough to reach level ground.', failureMessage: 'The rear wheel slips over the shelf edge.', failureEffects: { health: -2 } } },
    ] },
    loadArrival: end('loadArrival', 'On Level Ground', 'The driver reaches the upper road with the medicine chest. The cargo left behind is named and listed for recovery; the wagon is not driven further until a second team arrives.'),
    loadWait: end('loadWait', 'A Team Comes Up', 'A second team arrives before the clay gives way. The wedge is recovered, and the freight is divided between two wagons; the delay costs an afternoon but no one or cargo is lost.'),
    loadAbandoned: end('loadAbandoned', 'Driver First', 'You get the driver onto the upper road and leave the wagon secured as best it can be. The medicine chest remains on the grade until help arrives; the choice saves a person, not the whole load.'),
    loadLoss: end('loadLoss', 'The Wagon Goes', 'The wagon slips over the shelf and breaks below. The driver is already uphill; the freight is lost, and the medicine chest will have to be replaced or recovered when the slope is safe.'),
  },
};

export const HOLD_UNTIL_MORNING: Scenario = {
  id: 'hold-until-morning', title: 'Hold until Morning', subtitle: 'A distant signal may be asking for help—or simply marking another camp.', startScene: 'nightShelter',
  diversity: { ...tags('A quiet survival vignette weighs a night signal against the cost of leaving shelter.', 'MODERATE'), playerRoles: ['traveler/passenger', 'witness'], activities: ['survival', 'communication/witness'], tones: ['peaceful', 'mysterious/eerie'], entryShapes: ['stranded during travel'], outcomeShapes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery'], rewardShapes: ['narrative-only payoff', 'relationship/referral'], consequenceShapes: ['time/opportunity'] },
  scenes: {
    nightShelter: { id: 'nightShelter', title: 'A Light across the Hollow', tone: 'warning', text: 'You have a dry shelter and enough firewood for the night. Across a dark hollow, a lantern flashes twice, then goes still. The ground between you is unfamiliar and drops toward a creek. The light may be a signal, but there is no call for help.', choices: [
      { id: 'stayShelterNight', label: 'Stay under shelter until first light', next: 'morningSignal', effects: { historyFlags: ['held_shelter_until_morning_after_distant_light'] } },
      { id: 'answerFromShelter', label: 'Answer with your own lantern', requirements: { anyUsableItems: ['lantern', 'roadmansLantern'] }, next: 'signalAnswer' },
      { id: 'walkTowardSignal', label: 'Walk toward the light along the high ground', hint: 'The creek and drop are unseen in darkness; keep the shelter within return distance.', chance: { probability: 0.52, successNext: 'signalTrail', failureNext: 'signalBruise', successMessage: 'You find a high path that bends toward the light.', failureMessage: 'A hidden rut twists your ankle before you can reach the hollow.', failureEffects: { health: -2 } } },
    ] },
    signalAnswer: { id: 'signalAnswer', title: 'A Light Answers Back', tone: 'safe', text: 'The lantern across the hollow flashes once in reply, then turns away from the creek. Someone has seen you, but has not asked you to cross. The safest reply is to keep the shelter visible and wait for daylight.', choices: [
      { id: 'waitAfterReply', label: 'Wait until morning before approaching', next: 'morningSignal' },
      { id: 'approachAfterReply', label: 'Follow the high path toward the light', next: 'signalTrail' },
    ] },
    signalTrail: { id: 'signalTrail', title: 'A Camp on the Far Rise', tone: 'warning', text: 'The light comes from a charcoal burner’s camp on a rise. They are safe, but the creek crossing below is higher than it looked in the dark. They ask whether you saw their second lantern, which fell behind the firewood stack.', choices: [
      { id: 'helpFindLantern', label: 'Help look around the camp in daylight', next: 'signalResolved', effects: { historyFlags: ['answered_charcoal_burner_signal'] } },
      { id: 'returnSignalShelter', label: 'Return by the high path to shelter', next: 'morningSignal' },
    ] },
    signalBruise: { id: 'signalBruise', title: 'The Hollow in the Dark', tone: 'warning', text: 'Your ankle is sore, and the light remains across the creek. The dry shelter is behind you; you can return by your tracks or call out and wait for daylight.', choices: [
      { id: 'returnBruisedShelter', label: 'Return to shelter by your tracks', next: 'morningSignal' },
      { id: 'callBruisedAcross', label: 'Call across the hollow', next: 'signalAnswer' },
    ] },
    morningSignal: end('morningSignal', 'The Light in Daylight', 'At dawn the distant light is a charcoal burner’s camp across a shallow bend. No one was in danger; waiting kept you warm and out of the dark creek hollow, and the burner waves when you pass in daylight.'),
    signalResolved: end('signalResolved', 'A Small Favor Returned', 'You find the lantern under the firewood and help carry it back to the rise. The burner points out a dry route to the road; your night’s caution and morning help both mattered.'),
  },
};

export const SURVIVAL_EXPEDITION_ADVENTURES: Scenario[] = [
  THE_PASS_BEFORE_SNOW, NO_WATER_AT_MILLERS_SPRING, THE_BROKEN_AXLE, ACROSS_THE_FLOODPLAIN,
  THE_CAVE_BEFORE_THE_STORM, THE_LOST_SURVEY_PARTY, THREE_DAYS_TO_THE_RAILHEAD, WHITEOUT,
  THE_LAST_ROPE, THE_EMPTY_CABIN, THE_LONG_WAY_AROUND_EXPEDITION, RIVER_WITHOUT_A_BRIDGE,
  NIGHT_ON_THE_RIDGE, THE_MARKERS_STOP, THE_ICE_GIVES_WARNING, THE_WASHED_OUT_CUT,
  THE_WRONG_VALLEY, THE_ROCKS_START_MOVING, THE_TREE_ACROSS_THE_CREEK, THE_ABANDONED_CAMP,
  THE_WIND_CHANGES, THE_LOAD_MUST_GO, HOLD_UNTIL_MORNING,
];
