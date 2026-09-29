import type { Choice, Scenario } from '../types';

const MAP_KNOWLEDGE = 'The old survey map marks a side drift that reaches the lower workings above the flooded rail bed.';
const AIR_KNOWLEDGE = 'The mine air is poorer near the flooded rail bed; a lantern flame leans low there, while the upper ledges still draw air.';
const RESCUE_HISTORY = ['rescued_missing_person', 'kept_rescue_promise'];

function extractionChoices(delayed: boolean): Choice[] {
  const clean = delayed ? 'thanksCostly' : 'thanksClean';
  return [
    {
      id: 'workWinch', label: 'Work the old rescue winch', hint: 'The brake is rusted; a toolkit or braced tunnel should help.',
      chance: {
        probability: delayed ? 0.32 : 0.46, bonusItems: ['pocketToolkit', 'foremanMultiTool'], bonusFlags: ['tunnelBraced', 'highAirRoute'], bonusProbability: 0.24,
        successNext: clean, failureNext: 'rescueCollapse', successMessage: 'The drum turns. Slowly, the slumped beam lifts clear.', failureMessage: 'The cable slips on the drum and the roof jolts.',
        successEffects: { historyFlags: RESCUE_HISTORY }, failureEffects: { health: -1, setFlags: ['rescueStructureShifted'] },
      },
    },
    {
      id: 'rigRope', label: 'Rig a rope lift for Eli', hint: 'A long pull can work, but the damaged ledge may shift.', requirements: { items: ['travelRope'] },
      chance: {
        probability: delayed ? 0.55 : 0.69, bonusItems: ['heavyLeatherGloves', 'minerHeadlamp', 'ratCatchersHook'], bonusProbability: 0.16,
        successNext: 'thanksCostly', failureNext: 'rescueCollapse', successMessage: 'The rope holds. You haul together until Eli slides free.', failureMessage: 'The rope bites into the ledge and the support cracks.',
        successEffects: { health: -1, historyFlags: RESCUE_HISTORY }, failureEffects: { health: -2, setFlags: ['rescueStructureShifted'] },
      },
    },
    {
      id: 'clearBeam', label: 'Shoulder the beam clear', hint: 'Fast if it moves; the timber overhead is already splitting.',
      chance: {
        probability: delayed ? 0.36 : 0.53, bonusItems: ['heavyLeatherGloves', 'ratCatchersHook', 'brassCandlestick'], bonusFlags: ['tunnelBraced'], bonusProbability: 0.15,
        successNext: 'thanksCostly', failureNext: 'rescueCollapse', successMessage: 'The beam rolls far enough for Eli to crawl clear.', failureMessage: 'The timber shifts against your shoulder and the roof sheds rock.',
        successEffects: { health: -2, historyFlags: RESCUE_HISTORY }, failureEffects: { health: -2, setFlags: ['rescueStructureShifted'] },
      },
    },
    { id: 'bringHelp', label: 'Climb out and bring a rescue crew', hint: 'It costs time, but trained hands can rig the surface winch.', next: 'outsideForHelp', effects: { setFlags: ['leftForHelp'] } },
  ];
}

function rewardChoices(ending: string): Choice[] {
  return [
    { id: 'takeHeadlampReward', label: 'Accept Eli’s spare miner headlamp', hint: 'He insists you take the sound lamp he carried in.', requirements: { notItems: ['minerHeadlamp'] }, effects: { gainItems: ['minerHeadlamp'] }, next: ending },
    { id: 'takeMultiToolReward', label: 'Accept the foreman’s multi-tool', hint: 'The retired foreman offers his repair tool in thanks.', requirements: { notItems: ['foremanMultiTool'] }, effects: { gainItems: ['foremanMultiTool'] }, next: ending },
    { id: 'declineReward', label: 'Leave with what you brought', next: ending },
  ];
}

export const WHATS_MINE: Scenario = {
  id: 'whats-mine',
  title: 'What’s Mine is Mine',
  subtitle: 'A missing brother. An abandoned mine. A choice about what is worth bringing back.',
  startScene: 'mineRequest',
  scenes: {
    mineRequest: {
      id: 'mineRequest', title: 'A Sister at the Mine Gate', tone: 'warning',
      text: 'Mara waits beside the chained mouth of an abandoned silver mine. Her brother Eli went inside before dawn to retrieve their father’s survey book. He has been gone six hours. The old workings have rotten supports, flooded levels, and pockets of bad air. Mara asks if you will search for him.',
      choices: [
        { id: 'acceptSearch', label: 'Agree to look for Eli', hint: 'The mine is dangerous, and no one can promise what waits inside.', effects: { historyFlags: ['accepted_dangerous_rescue'] }, next: 'preparation' },
        { id: 'hearMore', label: 'Ask what Eli was looking for', next: 'maraExplains' },
        { id: 'refuseSearch', label: 'Decline the rescue', hint: 'You are not required to enter the mine.', effects: { historyFlags: ['refused_mine_rescue'] }, next: 'refusalEnding' },
      ],
    },
    maraExplains: {
      id: 'maraExplains', title: 'The Survey Book',
      text: 'Eli believed the survey book would settle an old boundary dispute and show where their father had worked the silver seam. He took a lantern and said he knew the main rail drift. No one has heard from him since.',
      choices: [
        { id: 'acceptAfterAccount', label: 'Go in after him', effects: { historyFlags: ['accepted_dangerous_rescue'], knowledge: ['Eli entered by the old rail drift while looking for his father’s survey book.'] }, next: 'preparation' },
        { id: 'declineAfterAccount', label: 'Tell Mara you cannot help', effects: { historyFlags: ['refused_mine_rescue'] }, next: 'refusalEnding' },
      ],
    },
    preparation: {
      id: 'preparation', title: 'Before the Descent',
      text: 'The retired foreman keeps a few supplies by the gate. A survey map of the upper workings costs two coins; a coil of travel rope costs three; a miner’s headlamp costs four. You can also go in with your own kit. None of it makes the old supports safe.',
      choices: [
        { id: 'buyMap', label: 'Buy the upper-level survey map — 2 coins', requirements: { minMoney: 2, notItems: ['mineSurveyMap'] }, effects: { money: -2, gainItems: ['mineSurveyMap'], knowledge: [MAP_KNOWLEDGE] }, next: 'mineMouth' },
        { id: 'buyRope', label: 'Buy travel rope — 3 coins', requirements: { minMoney: 3, notItems: ['travelRope'] }, effects: { money: -3, gainItems: ['travelRope'] }, next: 'mineMouth' },
        { id: 'buyHeadlamp', label: 'Buy a miner’s headlamp — 4 coins', requirements: { minMoney: 4, notItems: ['minerHeadlamp'] }, effects: { money: -4, gainItems: ['minerHeadlamp'] }, next: 'mineMouth' },
        { id: 'enterWithoutPurchase', label: 'Keep your money and enter', next: 'mineMouth' },
      ],
    },
    mineMouth: {
      id: 'mineMouth', title: 'The Mouth of the Old Workings', tone: 'warning',
      text: 'The chain hangs loose where Eli cut it. One fresh bootprint crosses the dust. The main rail drift slopes into darkness; a ladder descends beside it, its lower rungs bent. A breath of stale air rolls out, then fades.',
      choices: [
        { id: 'followRailDrift', label: 'Follow Eli’s prints along the rails', next: 'railGallery' },
        { id: 'climbBentLadder', label: 'Descend the bent ladder carefully', hint: 'Several rungs flex under your weight.', chance: { probability: 0.72, successNext: 'ladderLanding', failureNext: 'ladderFall', successMessage: 'You reach the landing without putting your weight on the worst rungs.', failureMessage: 'A rung snaps; you hit the landing hard.', failureEffects: { health: -2 } } },
        { id: 'takeMappedDrift', label: 'Use the map’s upper side drift', requirements: { items: ['mineSurveyMap'] }, next: 'mappedDrift' },
        { id: 'ropeDownOldShaft', label: 'Lower yourself down the old shaft', requirements: { items: ['travelRope'] }, hint: 'The rope gives a controlled descent beside the broken ladder.', next: 'ropeDescent' },
      ],
    },
    railGallery: { id: 'railGallery', title: 'A Tool in the Dust', text: 'A small wrench lies beside a fresh scrape in the rail. Eli dropped it in a hurry. Beyond it, the rails disappear under a low rock shelf.', choices: [{ id: 'duckUnderShelf', label: 'Follow the scrape under the shelf', effects: { knowledge: ['Eli passed through the main rail drift and continued below the low shelf.'] }, next: 'lowerTunnel' }] },
    ladderLanding: { id: 'ladderLanding', title: 'The Bent Ladder’s Foot', text: 'The ladder flexed, but holds. On the landing, an oil lamp burns low beside a chalk arrow pointing toward the upper air current.', choices: [{ id: 'crossLanding', label: 'Follow the chalk arrow', effects: { knowledge: [AIR_KNOWLEDGE] }, next: 'lowerTunnel' }] },
    ladderFall: { id: 'ladderFall', title: 'A Hard Landing', tone: 'warning', text: 'You land against the rock shelf, bruised but able to stand. The bottom rungs sway above you. A scrape in the dust leads onward, away from the damaged ladder.', choices: [{ id: 'leaveBrokenLadder', label: 'Follow the scrape deeper', next: 'lowerTunnel' }] },
    mappedDrift: { id: 'mappedDrift', title: 'The Upper Side Drift', text: 'The map guides you onto an old ventilation ledge above the flooded rails. Fresh boot marks cross a chalk line; Eli came this way, avoiding the lower water.', choices: [{ id: 'followMapMarks', label: 'Follow Eli’s boot marks', effects: { setFlags: ['highAirRoute'] }, next: 'lowerTunnel' }] },
    ropeDescent: { id: 'ropeDescent', title: 'A Controlled Descent', text: 'You anchor the rope to a sound iron ring and lower yourself past the broken ladder. A fresh boot mark at the bottom points toward the upper workings, not the flooded rails.', choices: [{ id: 'followRopeBootmark', label: 'Follow the fresh mark', next: 'lowerTunnel' }] },
    lowerTunnel: {
      id: 'lowerTunnel', title: 'The Lower Tunnel', tone: 'warning',
      text: 'The tunnel narrows. Eli’s bootprints appear and vanish beneath drifts of silver-gray dust. Somewhere ahead, metal taps twice. A vein of silver glints from a split in the wall; above it, old timbers groan.',
      choices: [
        { id: 'followScrape', label: 'Follow the fresh scrape beneath the supports', next: 'supportApproach' },
        { id: 'testMineAir', label: 'Check the air near the flooded rail bed', next: 'airPocket' },
        { id: 'inspectSilverVein', label: 'Look closer at the exposed silver', effects: { setFlags: ['silverVeinFound'] }, next: 'silverSeam' },
      ],
    },
    airPocket: { id: 'airPocket', title: 'Where the Flame Leans', tone: 'warning', text: 'Your lantern flame gutters low near the flooded rail bed. On the upper ledge it straightens again. The old mine carries air unevenly; the side ledge is safer to breathe along, but the tapping comes from below.', choices: [{ id: 'keepToUpperAir', label: 'Stay on the upper ledge toward the tapping', effects: { knowledge: [AIR_KNOWLEDGE], setFlags: ['highAirRoute'] }, next: 'supportApproach' }] },
    silverSeam: {
      id: 'silverSeam', title: 'The Silver Showing',
      text: 'A narrow seam of bright ore lies loose at the crack. It could be sold, but pulling it free will take a few minutes under the failing supports. The tapping below stops, then starts again.',
      choices: [
        { id: 'leaveSilverForEli', label: 'Leave the ore and follow the tapping', effects: { historyFlags: ['left_valuables_to_save_person'] }, next: 'supportApproach' },
        { id: 'takeSilverSample', label: 'Chip off a sample before moving on', hint: 'The roof is shifting; this delays your search, but the silver may be worth something.', effects: { money: 5, setFlags: ['tookSilver', 'personWeakened'], historyFlags: ['chose_silver_over_rescue'] }, next: 'silverDelay' },
      ],
    },
    silverDelay: { id: 'silverDelay', title: 'The Tap Goes Quiet', tone: 'warning', text: 'The ore comes free, bright against the dust. By the time you pocket it, the tapping has stopped. A weak cough answers from farther in. The supports are settling and the search has cost time.', choices: [{ id: 'hurryAfterSilver', label: 'Move toward the cough as the roof shifts', next: 'supportShift' }] },
    supportApproach: {
      id: 'supportApproach', title: 'The Shifting Supports', tone: 'danger',
      text: 'A timber bows over the passage. Dust falls with each groan. You hear someone breathing behind it. The beam might be braced, or you could slip along a narrow shelf before it drops.',
      choices: [
        { id: 'braceSupports', label: 'Brace the timber with loose rail ties', hint: 'A firm brace could steady this stretch; the wood is cracked.', chance: { probability: 0.72, successNext: 'bracedApproach', failureNext: 'supportShift', successMessage: 'The tie holds the beam for now.', failureMessage: 'The brace slips and the ceiling sheds stone.', successEffects: { setFlags: ['tunnelBraced'] }, failureEffects: { health: -1, setFlags: ['rescueStructureShifted'] } } },
        { id: 'squeezePastSupport', label: 'Squeeze along the narrow shelf', hint: 'There is room, but the ledge crumbles at the edge.', chance: { probability: 0.67, successNext: 'squeezeApproach', failureNext: 'supportShift', successMessage: 'You keep low and clear the beam.', failureMessage: 'The shelf breaks under your heel.', failureEffects: { health: -2, setFlags: ['rescueStructureShifted'] } } },
        { id: 'followMetalTaps', label: 'Call out and follow the answer', next: 'trappedEli' },
        { id: 'useKnownAirway', label: 'Take the upper ventilation ledge', requirements: { knowledge: [AIR_KNOWLEDGE] }, effects: { setFlags: ['highAirRoute'] }, next: 'ventilationRoute' },
      ],
    },
    bracedApproach: { id: 'bracedApproach', title: 'A Beam Held in Place', text: 'The rail tie bites against the wall. The timber still complains, but the passage is stable for the moment. The breathing behind the rock is closer now.', choices: [{ id: 'movePastBrace', label: 'Go to the voice beyond the beam', next: 'trappedEli' }] },
    squeezeApproach: { id: 'squeezeApproach', title: 'Beyond the Narrow Shelf', text: 'You clear the ledge as grit spills behind you. The way back is still open, but the passage cannot take another shift. A voice answers from the next chamber.', choices: [{ id: 'answerVoice', label: 'Go toward the voice', next: 'trappedEli' }] },
    supportShift: { id: 'supportShift', title: 'The Roof Moves', tone: 'danger', text: 'The timber drops a handspan. You are bruised, and the way behind you is narrowing. A cough comes from the other side of the beam.', choices: [{ id: 'pressOnAfterShift', label: 'Push through before it settles again', next: 'trappedEliDelayed' }, { id: 'retreatBeforeCollapse', label: 'Climb out while the passage is open', effects: { historyFlags: ['left_mine_before_finding_missing_person'] }, next: 'escapeEnding' }] },
    ventilationRoute: { id: 'ventilationRoute', title: 'The Upper Airway', text: 'The side ledge carries a faint draft. Your flame steadies as you follow it over the weak floor and reach the far side of the supports without disturbing them.', choices: [{ id: 'followAirToVoice', label: 'Follow the cough ahead', next: 'trappedEli' }] },
    trappedEli: {
      id: 'trappedEli', title: 'Eli Behind the Fall', tone: 'danger',
      text: 'Eli is alive, pinned behind a fallen beam with one leg trapped. He can speak, but cannot climb or lift himself free. The old winch is still bolted into the wall; the roof above him is cracked. Your choices could save him—or bring the rest down.',
      choices: extractionChoices(false),
    },
    trappedEliDelayed: {
      id: 'trappedEliDelayed', title: 'A Weaker Voice', tone: 'danger',
      text: 'You reach Eli through the settling passage. He is alive and pinned behind the same fallen beam, but the extra collapse has left him weaker. The winch remains bolted to the wall. The roof above both of you is cracked.',
      choices: extractionChoices(true),
    },
    rescueCollapse: {
      id: 'rescueCollapse', title: 'The Rescue Chamber Shifts', tone: 'danger',
      text: 'The beam lurches. Eli is still alive, but another attempt may bring down the roof. The entrance is reachable, and the silver seam is behind you. You cannot do everything before the next shift.',
      choices: [
        { id: 'lastPull', label: 'Make one last pull on the beam', hint: 'A clear danger: if it slips again, you may be badly hurt.', chance: { probability: 0.43, successNext: 'thanksCostly', failureNext: 'mineAftershock', successMessage: 'The beam rolls aside and Eli crawls clear.', failureMessage: 'The ceiling drops between you and the passage.', successEffects: { health: -2, historyFlags: RESCUE_HISTORY }, failureEffects: { health: -4 } } },
        { id: 'leaveForRescueCrew', label: 'Get out and bring the rescue crew', next: 'outsideForHelp', effects: { setFlags: ['leftForHelp'] } },
        { id: 'leaveEliBehind', label: 'Get yourself out while you can', effects: { historyFlags: ['abandoned_injured_person'] }, next: 'abandonedEnding' },
        { id: 'takeSilverAndLeave', label: 'Take the exposed silver and leave', requirements: { flags: ['silverVeinFound'] }, hint: 'The ore is within reach; Eli is still trapped.', effects: { money: 8, historyFlags: ['chose_silver_over_rescue', 'abandoned_injured_person'] }, next: 'profitEnding' },
      ],
    },
    mineAftershock: { id: 'mineAftershock', title: 'Cut Off Below', tone: 'danger', text: 'Rock seals the direct passage. You can hear Eli on the other side, still answering. The old ventilation rise remains open, though getting a rescue crew back in will take time.', choices: [{ id: 'climbOutForHelp', label: 'Use the rise to get help', next: 'outsideForHelp', effects: { setFlags: ['leftForHelp'] } }, { id: 'saveYourselfAftershock', label: 'Leave the mine alone', next: 'abandonedEnding', effects: { historyFlags: ['abandoned_injured_person'] } }] },
    outsideForHelp: {
      id: 'outsideForHelp', title: 'Back with a Rescue Crew', tone: 'warning',
      text: 'You reach the surface and return with the retired foreman and two local miners. Eli is still answering below. The crew has a surface winch, but needs a route that will not send them through the flooded level.',
      choices: [
        { id: 'guideBySurveyMap', label: 'Guide them along the mapped side drift', requirements: { knowledge: [MAP_KNOWLEDGE] }, chance: { probability: 0.86, successNext: 'thanksHelp', failureNext: 'helpDelayed', successMessage: 'The map brings the crew to the stable upper ledge.', failureMessage: 'A washed-out mark costs the crew precious time.', successEffects: { historyFlags: [...RESCUE_HISTORY, 'returned_for_help'] }, failureEffects: { historyFlags: ['returned_for_help'] } } },
        { id: 'guideWithoutMap', label: 'Lead the crew by the fresh bootprints', requirements: { notKnowledge: [MAP_KNOWLEDGE] }, chance: { probability: 0.67, successNext: 'thanksHelp', failureNext: 'helpDelayed', successMessage: 'The fresh tracks lead the crew to Eli.', failureMessage: 'A drift of rock hides the prints; the crew has to search again.', successEffects: { historyFlags: [...RESCUE_HISTORY, 'returned_for_help'] }, failureEffects: { historyFlags: ['returned_for_help'] } } },
      ],
    },
    helpDelayed: { id: 'helpDelayed', title: 'The Crew Loses Time', tone: 'warning', text: 'The first route has shifted. The foreman can rig the winch from a safer ledge, though Eli is growing weaker; a direct lift would be faster and rougher.', choices: [
      { id: 'rigSurfaceWinch', label: 'Set the surface winch from the ledge', chance: { probability: 0.73, successNext: 'thanksHelp', failureNext: 'partialAidEnding', successMessage: 'The crew lowers the line and brings Eli up alive.', failureMessage: 'The ledge will not hold the winch; the crew stabilizes Eli but cannot extract him tonight.', successEffects: { historyFlags: [...RESCUE_HISTORY, 'returned_for_help'] }, failureEffects: { historyFlags: ['returned_for_help'] } } },
      { id: 'rapidCrewLift', label: 'Attempt a faster direct lift', hint: 'The injured leg may worsen, but the roof is moving.', chance: { probability: 0.58, successNext: 'thanksCostly', failureNext: 'partialAidEnding', successMessage: 'The crew pulls Eli clear before the next shift.', failureMessage: 'The crew reaches Eli and stabilizes him, but must leave him with medics below.', successEffects: { health: -1, historyFlags: [...RESCUE_HISTORY, 'returned_for_help'] }, failureEffects: { historyFlags: ['returned_for_help'] } } },
    ] },
    refusalEnding: { id: 'refusalEnding', title: 'The Mine Gate Closes', text: 'You tell Mara you cannot go in. She nods once, still frightened, and turns to seek help elsewhere. You leave with what you brought; there is no payment or prize for a search you did not make.', choices: [], ending: 'success' },
    escapeEnding: { id: 'escapeEnding', title: 'Back in Daylight', text: 'You climb out before the lower supports give way. Eli remains somewhere below, and you have no certainty about what happened to him. Mara turns back toward the village to find help.', choices: [], ending: 'success' },
    abandonedEnding: { id: 'abandonedEnding', title: 'One Set of Footprints', text: 'You make it to the surface alone. Eli is still beneath the mine, and you know the rescue is unfinished. The choice to leave belongs to this journey and this character; another story may see it differently.', choices: [], ending: 'success' },
    profitEnding: { id: 'profitEnding', title: 'Silver in Your Pocket', text: 'You leave with the ore while Eli remains trapped below. It will bring money, but there is no mistaking what you put first when the mine began to close.', choices: [], ending: 'success' },
    partialAidEnding: { id: 'partialAidEnding', title: 'Alive, but Not Yet Out', text: 'The crew reaches Eli and stabilizes his injuries, but the mine will not let them bring him to the surface tonight. He is alive with trained rescuers beside him; the extraction remains unfinished.', choices: [], ending: 'success' },
    thanksClean: { id: 'thanksClean', title: 'A Brother Brought Home', text: 'The winch holds. Eli reaches daylight shaken but safe. Mara and the foreman each offer something useful in thanks; choose one, or leave with your own gear.', choices: rewardChoices('cleanRescueEnding') },
    thanksCostly: { id: 'thanksCostly', title: 'Out by Inches', text: 'Eli reaches daylight alive. The rescue leaves bruises, torn rope, and a fresh scar in the mine roof. Mara and the foreman offer one useful piece of equipment in thanks.', choices: rewardChoices('costlyRescueEnding') },
    thanksHelp: { id: 'thanksHelp', title: 'More Hands, More Time', text: 'The rescue crew brings Eli out alive. It took longer, but the work was shared and the mine was not asked to bear one more desperate pull. Mara offers you a useful piece of gear.', choices: rewardChoices('helpRescueEnding') },
    cleanRescueEnding: { id: 'cleanRescueEnding', title: 'A Clear Way Home', text: 'Eli is safe, the upper supports held, and the survey book can wait for another day. Mara walks her brother home while the foreman closes the mine gate.', choices: [], ending: 'success' },
    costlyRescueEnding: { id: 'costlyRescueEnding', title: 'A Rescue at a Price', text: 'Eli is alive above ground. You leave the mine sore and the lower workings unstable, but the person you came for is going home.', choices: [], ending: 'success' },
    helpRescueEnding: { id: 'helpRescueEnding', title: 'The Crew Gets Him Out', text: 'Eli is carried to the surface and into the hands of the village medic. You chose to return with help; the mine is still there, but no longer has him alone.', choices: [], ending: 'success' },
  },
};
