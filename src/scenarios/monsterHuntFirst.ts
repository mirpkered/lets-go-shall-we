import type { Scenario } from '../types';
import { huntEnd as end, huntMetadata as meta, huntScene as scene } from './monsterHuntTools';

export const THE_THING_AT_BLACK_CREEK: Scenario = {
  id: 'thing-at-black-creek', title: 'The Thing at Black Creek', subtitle: 'Animals avoid the water after dusk, and the tracks do not agree.', startScene: 'creekSigns',
  diversity: meta({ hook: 'Three explanations for crooked tracks converge at a creek where an injured bear has learned to raid a fish weir.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'HIGH', setting: 'creek woodland', fantasy: 'AMBIGUOUS', combat: 'POSSIBLE', structure: 'evidence to territorial boundary' }),
  scenes: {
    creekSigns: scene('creekSigns', 'Water after Sundown', 'A farm dog balks at Black Creek after dusk. Beside the bank are broad paw marks and a line of shallow, almost foot-shaped impressions. The creek bends under a rock shelf; the farm stands uphill behind you. No one has seen what made them.', [
      { id: 'askWeirKeeper', label: 'Ask the weir keeper what changed', next: 'weirAccount', effects: { knowledge: ['At Black Creek, crooked tracks appeared near a fish weir after an injured animal began visiting at dusk.'] } },
      { id: 'followBank', label: 'Follow the creek bank upstream', next: 'shelfTracks' },
      { id: 'leaveCreek', label: 'Warn the farm and leave the creek alone', next: 'creekWarned', effects: { historyFlags: ['warned a farm away from Black Creek after dusk'] } },
    ], 'warning'),
    weirAccount: scene('weirAccount', 'The Empty Fish Weir', 'The keeper says fish vanish from the weir, but no animal has been attacked. One front paw print is deeper than the other. The keeper can close the weir for a night; the farm would lose a day’s catch.', [
      { id: 'watchWeir', label: 'Watch the weir from the bank', next: 'creekReveal' },
      { id: 'closeWeir', label: 'Ask the keeper to close the weir', next: 'closedWeir' },
      { id: 'returnHome', label: 'Leave before full dark', next: 'creekWarned' },
    ]),
    shelfTracks: scene('shelfTracks', 'Prints under the Rock Shelf', 'The crooked impressions turn toward a low shelf above the water. A fish scale and coarse black hair cling to the stone. Something large has been lying there, but the prints lead back toward the creek rather than the farm.', [
      { id: 'waitAtDistance', label: 'Wait well back from the shelf', next: 'creekReveal' },
      { id: 'callFromBank', label: 'Call out from the open bank', next: 'creekReveal' },
      { id: 'retreatShelf', label: 'Mark the place and retreat', next: 'creekWarned', effects: { knowledge: ['A broad animal shelter under the Black Creek shelf lies between the weir and deeper water.'] } },
    ], 'warning'),
    creekReveal: scene('creekReveal', 'One Paw in the Mud', 'At dusk a black bear limps from the shelf, fishes once, then turns when it smells you. Its damaged front paw makes the prints look almost human. It has not seen you yet; the steep bank leaves room to withdraw.', [
      { id: 'backAwayBear', label: 'Give the bear the creek and withdraw', next: 'bearWithdrawn', effects: { knowledge: ['The Black Creek tracks were made by a bear favoring an injured front paw; it came for fish and avoided people.'] } },
      { id: 'callKeeperBear', label: 'Call the weir keeper from the bank', next: 'bearDriven', effects: { historyFlags: ['helped close a fish weir to keep a bear from the farm'] } },
      { id: 'rushBear', label: 'Rush the bear before it turns', hint: 'It is larger than you and has a clear escape route. A failed rush could be fatal.', chance: { probability: 0.27, successNext: 'bearDriven', failureNext: 'bearFatal', successMessage: 'The bear bolts down the creek rather than face you.', failureMessage: 'The bear turns and reaches you before you can retreat.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    closedWeir: scene('closedWeir', 'A Night without a Catch', 'The keeper lifts the weir gate and lets the trapped fish pass downstream. From the bank, you hear one splash beneath the shelf and then silence. The farm will lose tonight’s catch, but no animal is drawn toward the houses.', [
      { id: 'leaveClosedWeir', label: 'Leave the creek closed until morning', next: 'creekOutcome', effects: { historyFlags: ['chose livestock safety over one night of fishing'] } },
      { id: 'watchAfterClosing', label: 'Stay back and watch the bank', next: 'creekReveal' },
    ]),
    bearWithdrawn: end('bearWithdrawn', 'The Creek Keeps Its Distance', 'You leave the bear its route to the water. The keeper closes the weir for the night, and the farm moves its dogs indoors. The animal remains wild and unpursued.'),
    bearDriven: end('bearDriven', 'A Clear Bank', 'The bear retreats along the creek and does not turn toward the farm. The keeper will leave the weir shut until the animal moves on; the tracks are understood, though the lost catch cannot be recovered.'),
    creekOutcome: end('creekOutcome', 'Fish Gone Downstream', 'The farm accepts one missed catch in exchange for keeping the bear away from its dogs and pens. Nothing proves the animal was more than a wounded bear, but its tracks will be watched.'),
    creekWarned: end('creekWarned', 'A Warning, Not a Hunt', 'You warn the farm to keep people and dogs away from Black Creek after dusk. The animals stay uphill. You leave without deciding what made the tracks.'),
    bearFatal: end('bearFatal', 'At the Water’s Edge', 'The bear’s injured paw does not slow its charge enough. By the time the keeper reaches the bank, the creek has gone dark.', 'death'),
  },
};

export const TEETH_IN_THE_MINE: Scenario = {
  id: 'teeth-in-the-mine', title: 'Teeth in the Mine', subtitle: 'A sealed mine drift answers the rescue bell with a sound from below.', startScene: 'mineMouth',
  diversity: meta({ hook: 'A trapped miner answers through an old air shaft while a cave predator copies the warning bell.', activity: 'rescue/care', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'SEVERE', setting: 'mine underground', fantasy: 'FANTASY_THREAT', combat: 'AVOIDABLE', structure: 'sound-led underground rescue with retreat' }),
  scenes: {
    mineMouth: scene('mineMouth', 'The Sealed Drift', 'A fall of stone sealed the lower mine passage yesterday. Two miners are missing beyond it. The foreman has barred the entrance; through a narrow air shaft comes a weak knock, then three quick taps like the rescue bell. A hand lantern burns at the mouth, and a clear path leads back outside.', [
      { id: 'questionForeman', label: 'Ask what the missing miners knew', next: 'mineAccount', effects: { knowledge: ['A sealed mine drift has a narrow air shaft that carries sound from the lower workings.'] } },
      { id: 'listenShaft', label: 'Listen at the air shaft', next: 'mineEcho' },
      { id: 'leaveMine', label: 'Refuse the descent and send for miners', next: 'mineWaited', effects: { historyFlags: ['refused an unsafe mine descent and called trained rescuers'] } },
    ], 'warning'),
    mineAccount: scene('mineAccount', 'The Air Route', 'The foreman says the shaft opens into a side chamber, not the sealed drift. The missing pair had a chalk board for messages, but no one has answered since noon. The main collapse may shift if disturbed.', [
      { id: 'takeAirShaft', label: 'Use the narrow air shaft', requirements: { items: ['lantern'] }, next: 'sideChamber' },
      { id: 'markAndWait', label: 'Mark the shaft and wait for a crew', next: 'mineWaited' },
      { id: 'callIntoShaft', label: 'Call the miners from the entrance', next: 'mineEcho' },
    ]),
    mineEcho: scene('mineEcho', 'An Answer from the Wrong Side', 'The three quick taps come again—from deeper inside the sealed drift, not the air shaft. A miner replies from the shaft chamber with two slow knocks. The repeated rescue pattern is bait, but someone is alive in the side chamber.', [
      { id: 'followRealKnocks', label: 'Enter toward the slow knocks', requirements: { items: ['lantern'] }, next: 'sideChamber' },
      { id: 'repeatBellSignal', label: 'Answer with the rescue bell', next: 'mineAmbush' },
      { id: 'withdrawMine', label: 'Withdraw and bring the full crew', next: 'mineWaited' },
    ], 'warning'),
    sideChamber: scene('sideChamber', 'A Miner at the Air Shaft', 'One miner crouches beside the shaft mouth, breathing but unable to climb the last ledge. Beyond him, pale teeth show between stones in the sealed drift. The thing waits where falling rock has trapped the second miner; the return passage remains open behind you.', [
      { id: 'lowerRope', label: 'Lower your rope to the living miner', requirements: { items: ['travelRope'] }, next: 'minerOut', effects: { historyFlags: ['used rope to rescue a miner from a collapsed drift'] } },
      { id: 'guideUp', label: 'Guide the miner up one step at a time', next: 'minerOut' },
      { id: 'retreatWithMiner', label: 'Lead the miner back without searching farther', next: 'mineRetreat' },
      { id: 'enterCollapsedDrift', label: 'Crawl toward the second miner', hint: 'The ceiling shifts and teeth wait beyond the loose stone. Retreat is still open, but this is a lethal risk.', chance: { probability: 0.34, successNext: 'secondMiner', failureNext: 'mineFatal', successMessage: 'You reach a pocket behind the collapse before the creature turns.', failureMessage: 'The creature lunges as the roof stone shifts.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    secondMiner: scene('secondMiner', 'Two Voices, One Narrow Way', 'The second miner is wedged behind a timber brace. The creature blocks the direct crawl, but a low water drain leads back toward the shaft. The first miner can crawl out alone if you show the route.', [
      { id: 'useDrain', label: 'Guide both miners through the drain', next: 'minersRescued', effects: { knowledge: ['The mine creature follows repeated rescue knocks but avoids the low drainage passage.'] } },
      { id: 'holdBrace', label: 'Hold the brace while the miner crawls out', hint: 'The timber is bowing under loose rock; a failure could be fatal.', chance: { probability: 0.59, bonusItems: ['travelRope'], bonusProbability: 0.16, successNext: 'minersRescued', failureNext: 'mineInjury', successMessage: 'The brace holds long enough for both miners to pass.', failureMessage: 'The brace slips; you get clear, but the second miner remains behind it.', successEffects: { health: -1 }, failureEffects: { health: -4 } } },
      { id: 'abandonSecondMiner', label: 'Retreat with the first miner', next: 'mineRetreat', effects: { historyFlags: ['escaped a mine creature after rescuing one trapped miner'] } },
    ], 'danger'),
    mineAmbush: scene('mineAmbush', 'The Bell Answered Back', 'A rush of claws scrapes the shaft wall. You are still near the entrance, and the first miner has heard the creature too. The foreman is waiting outside with a brace pole.', [
      { id: 'pullMinerOut', label: 'Pull the miner back toward the mouth', next: 'mineRetreat', effects: { historyFlags: ['retreated from a mine creature with one miner'] } },
      { id: 'useBracePole', label: 'Have the foreman bar the shaft', next: 'mineContained', effects: { knowledge: ['A heavy brace can block the mine creature’s narrow path for a short time.'] } },
      { id: 'standFightMine', label: 'Stand in the passage with your knife', hint: 'The creature is at arm’s reach in a confined shaft; failure is likely fatal.', chance: { probability: 0.22, successNext: 'mineContained', failureNext: 'mineFatal', successMessage: 'You force it back long enough to escape.', failureMessage: 'The creature reaches you before the miner can move.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    minerOut: end('minerOut', 'A Miner in Daylight', 'The rescued miner reaches daylight and tells the crew the three-tap signal was copied from their bell. The foreman seals the side shaft and sends a trained party for the second miner; you do not go back alone.'),
    minersRescued: end('minersRescued', 'Two Miners at the Mouth', 'Both miners emerge through the drain, shaken but alive. The foreman bars that route until a full crew can shore the drift. No one claims the teeth belonged to an ordinary animal.'),
    mineRetreat: end('mineRetreat', 'The Shaft Is Sealed Again', 'You and the living miner reach the mine mouth. The foreman orders the shaft barred and gathers an experienced crew; one miner remains beyond the unstable drift, and the creature is still inside.'),
    mineWaited: end('mineWaited', 'A Crew Goes Below', 'You keep the mine mouth closed and bring trained rescuers. The missing pair are not yet found, but no one enters alone or follows the copied bell signal.'),
    mineContained: end('mineContained', 'Stone against the Shaft', 'The foreman bars the narrow way with the brace pole while you retreat. The living miner is brought out; the lower drift stays sealed until a proper crew can reach the second worker.'),
    mineInjury: end('mineInjury', 'A Costly Retreat', 'The brace slips and catches your shoulder before the miners drag you toward the air shaft. The trapped worker remains behind the stone, and the foreman closes the route.'),
    mineFatal: end('mineFatal', 'Below the Sealed Drift', 'The creature reaches you in the confined passage. The foreman hears the lantern fall, then bars the shaft to keep the rest of the crew from following.', 'death'),
  },
};

export const SOMETHING_IN_THE_CORN: Scenario = {
  id: 'something-in-the-corn', title: 'Something in the Corn', subtitle: 'A low shape crosses the rows against the wind.', startScene: 'cornGate',
  diversity: meta({ hook: 'A farm’s missing hens lead to a low-moving shape that uses the corn rows as cover, not a universal monster weakness.', activity: 'animals', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'farm field', fantasy: 'AMBIGUOUS', combat: 'POSSIBLE', structure: 'protective watch and choice of field boundary', season: { season: 'ALL_YEAR', months: [1,2,3,4,5,6,7,8,9,10,11,12], weightBoost: 1.35, affinityMonths: [10] } }),
  scenes: {
    cornGate: scene('cornGate', 'Rows against the Wind', 'At a farm gate, the owner shows you two missing hens and a narrow path pressed through the corn. Wind moves the tops one way; something low crossed against it. The family stays behind the gate, and a lantern is already lit there.', [
      { id: 'inspectRowEdge', label: 'Inspect the pressed row from the gate', next: 'rowEvidence', effects: { knowledge: ['A low animal crossed the corn rows against the wind and left a narrow trail near the farm gate.'] } },
      { id: 'guardPens', label: 'Guard the hen pens with the family', next: 'penWatch' },
      { id: 'leaveCorn', label: 'Ask the family to stay inside and leave', next: 'cornEvacuated' },
    ], 'warning'),
    rowEvidence: scene('rowEvidence', 'A Trail That Bends', 'The path bends around the field’s stone boundary and ends at a gap beneath the outer fence. A dark bristle and a smear of feed lie there. The corn is dense enough to hide a boar, a person crawling, or something smaller.', [
      { id: 'followFence', label: 'Follow the fence from outside', next: 'boarReveal' },
      { id: 'waitByGap', label: 'Wait by the gap from the open gate', next: 'penWatch' },
      { id: 'keepFamilyAway', label: 'Close the gap and end the watch', next: 'cornContained', effects: { historyFlags: ['closed a farm fence gap after identifying a night visitor'] } },
    ]),
    penWatch: scene('penWatch', 'A Scrape against the Boards', 'Near midnight, claws scrape the outer hen pen. A low bristled back passes between two rows. The family remains inside the gate; the boar is focused on the feed bin and has not noticed you.', [
      { id: 'openSideGate', label: 'Open the side gate toward open pasture', next: 'boarDiverted', effects: { knowledge: ['A boar came to the cornfield for feed and left when an open pasture route was available.'] } },
      { id: 'bangGate', label: 'Strike the gate and drive it off', next: 'boarDriven' },
      { id: 'rushRows', label: 'Rush into the rows after it', hint: 'The boar is close, unseen in tall corn, and can charge through the narrow rows.', chance: { probability: 0.31, successNext: 'boarDriven', failureNext: 'boarFatal', successMessage: 'The sudden movement turns the boar toward the open field.', failureMessage: 'The boar charges through the rows before you can reach the gate.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    boarReveal: scene('boarReveal', 'The Visitor in the Row', 'A large boar pushes through a gap at the far fence, its eyes red from irritation and dust. It has not been attacking people; it follows the smell of stored feed. The path to the gate is clear, but the boar could charge if cornered.', [
      { id: 'leaveGapOpen', label: 'Give it the open pasture route', next: 'boarDiverted' },
      { id: 'closeGapBehind', label: 'Close the fence after it passes', next: 'boarContained' },
      { id: 'cornerBoar', label: 'Corner it between the rows', hint: 'The animal has no open route if you close in. It may charge.', chance: { probability: 0.28, successNext: 'boarDriven', failureNext: 'boarFatal', successMessage: 'The boar breaks through the thin fence and runs for the woods.', failureMessage: 'The boar charges before you can turn aside.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    boarDiverted: end('boarDiverted', 'The Rows Fall Still', 'The boar takes the open pasture route and disappears beyond the far fence. The owner moves feed indoors and repairs the gap in daylight; the hens are lost, but no one is hurt.'),
    boarDriven: end('boarDriven', 'Out beyond the Fence', 'The boar breaks from the corn and runs toward the woods. The family stays behind the gate while the owner boards the feed bin. The eyes were irritated, not a sign of anything supernatural.'),
    cornContained: end('cornContained', 'The Pens Shut for the Night', 'The family closes the hen pens and leaves the gap alone until daylight. The shape is not identified, but no one enters the rows or risks cornering it.'),
    boarContained: end('boarContained', 'A Gap Closed', 'The family keeps the hen pen shut and the owner repairs the fence. The visitor does not return that night. The corn still hides whatever may cross it later, but this farm is no longer an easy feeding place.'),
    cornEvacuated: end('cornEvacuated', 'A Farm Kept Indoors', 'The family stays inside and leaves the pens closed until daylight. You do not identify the shape, but you have made sure no one goes alone into the rows.'),
    boarFatal: end('boarFatal', 'Between the Rows', 'The boar has no room to turn away. It drives through the narrow rows before the family can open the gate.', 'death'),
  },
};

export const THE_BARROW_HOUND: Scenario = {
  id: 'the-barrow-hound', title: 'The Barrow Hound', subtitle: 'A farm dog blocks a cracked burial mound while a sheep bell sounds below.', startScene: 'barrowEdge',
  diversity: meta({ hook: 'A working hound keeps people off a settling burial mound while a lost sheep can be reached from the firm western slope.', activity: 'rescue/care', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'MODERATE', setting: 'burial mound', fantasy: 'NONE', combat: 'NONE', structure: 'animal warning and safer-route rescue' }),
  scenes: {
    barrowEdge: scene('barrowEdge', 'The Hound at the Mound', 'A shepherd stands on the firm west side of an old burial mound. His black farm hound blocks the cracked south rim; a sheep’s bell sounds below the turf. The shepherd’s spade lies beside him, and the mound’s west slope is unbroken.', [
      { id: 'askShepherd', label: 'Ask how the sheep got below', next: 'shepherdAccount' },
      { id: 'studyCrack', label: 'Study the crack from firm ground', next: 'moundRim' },
      { id: 'leaveMound', label: 'Warn the shepherd and leave', next: 'moundWarned', effects: { historyFlags: ['warned a shepherd away from a settling burial mound'] } },
    ], 'warning'),
    shepherdAccount: scene('shepherdAccount', 'A Bell under the Turf', 'The shepherd says one sheep wandered onto the mound before the grass gave way. The dog barked at the crack and nipped his sleeve when he tried the south rim. The west slope is firm, but loose soil falls from the opening.', [
      { id: 'circleWest', label: 'Take the firm west slope', next: 'westSlope' },
      { id: 'holdDogBack', label: 'Have the shepherd hold the hound back', next: 'dogSecured' },
      { id: 'leaveSheep', label: 'Keep everyone clear and call a crew', next: 'moundWarned' },
    ]),
    moundRim: scene('moundRim', 'A Settling Roof', 'From the west, you can see a shallow hollow where the south rim has slumped inward. The sheep is in a low pocket beneath the turf; the old stonework above it is cracked. The hound stays on firm ground and will not cross the opening.', [
      { id: 'useWestSlope', label: 'Reach the pocket from the west', next: 'westSlope' },
      { id: 'secureDog', label: 'Ask the shepherd to secure the hound', next: 'dogSecured' },
      { id: 'stepOnRim', label: 'Step onto the cracked rim', hint: 'The roof is split and soil is already falling into the hollow.', chance: { probability: 0.48, successNext: 'westSlope', failureNext: 'moundSlip', successMessage: 'You cross before the turf shifts.', failureMessage: 'The edge gives way beneath your foot.', successEffects: { health: -1 }, failureEffects: { health: -3 } } },
    ], 'warning'),
    dogSecured: scene('dogSecured', 'The Hound on a Lead', 'The shepherd clips a lead to the hound’s collar and holds it on the firm west slope. The dog keeps staring toward the hollow but stops blocking the path. The cracked south rim still looks unsafe.', [
      { id: 'reachFromWest', label: 'Approach the sheep from the west', next: 'westSlope' },
      { id: 'withdrawWithShepherd', label: 'Leave the sheep for a digging crew', next: 'moundWarned' },
    ]),
    westSlope: scene('westSlope', 'A Shallow Pocket', 'The hound stays with the shepherd as you circle to the firm west slope. A narrow gap opens into the sheep’s pocket from this side; the cracked south roof does not extend over it. The shepherd has his spade ready.', [
      { id: 'callSheepOut', label: 'Call the sheep through the low gap', next: 'sheepFreed', effects: { knowledge: ['A farm hound at the burial mound warned people away from a settling south rim; the sheep could be reached from firm ground on the west.'] } },
      { id: 'clearGap', label: 'Clear the low gap with the spade', next: 'sheepFreed', effects: { historyFlags: ['helped retrieve a sheep from a settling burial mound without crossing its cracked rim'] } },
      { id: 'crawlUnderCrack', label: 'Crawl beneath the cracked south roof', hint: 'The stones above the south rim are split and the turf is falling inward.', chance: { probability: 0.36, successNext: 'sheepFreed', failureNext: 'moundSlip', successMessage: 'You reach the sheep and guide it into the low west gap.', failureMessage: 'The loose roof drops soil across the pocket.', successEffects: { health: -1 }, failureEffects: { health: -4 } } },
    ], 'warning'),
    moundSlip: scene('moundSlip', 'The Rim Gives Way', 'The south edge collapses a few feet into the hollow. You are bruised, but the west slope remains firm; the shepherd keeps the hound back while the sheep answers from the pocket.', [
      { id: 'retreatWest', label: 'Move to the firm west slope', next: 'westSlopeAfterSlip' },
      { id: 'stopRescue', label: 'Back away and call a digging crew', next: 'moundWarned' },
    ], 'danger'),
    westSlopeAfterSlip: scene('westSlopeAfterSlip', 'The West Gap Still Holds', 'From the firm west slope, you can reach the sheep through the low gap without crossing the collapsed rim. The shepherd keeps the hound back while loose turf continues to settle on the south side.', [
      { id: 'callSheepAfterSlip', label: 'Call the sheep through the low gap', next: 'sheepFreed' },
      { id: 'clearGapAfterSlip', label: 'Clear the low gap with the spade', next: 'sheepFreed' },
      { id: 'withdrawAfterSlip', label: 'Leave the rescue to a digging crew', next: 'moundWarned' },
    ], 'warning'),
    sheepFreed: scene('sheepFreed', 'The Hound Checks the Sheep', 'The sheep squeezes through the low west gap and climbs to firm ground. The hound sniffs its face, then settles beside the shepherd. The south rim has slumped farther inward; no one needs to climb onto it.', [
      { id: 'markMound', label: 'Mark the cracked south rim', next: 'moundResolved' },
      { id: 'closePasture', label: 'Move the flock away from the mound', next: 'flockMoved' },
    ]),
    moundResolved: end('moundResolved', 'A Warning Well Read', 'The shepherd marks the cracked rim and moves the flock to higher pasture. The hound stays with the sheep, not the burial mound; its warning came from the collapsing ground, not an old curse.'),
    flockMoved: end('flockMoved', 'The Flock Kept Clear', 'The sheep are moved to higher pasture until the mound can be inspected. The shepherd thanks you for using the firm west slope; the hound returns to its flock.'),
    moundWarned: end('moundWarned', 'A Rescue Deferred', 'The shepherd keeps people and animals off the cracked mound and calls a digging crew. The sheep remains below the turf for now, but no one climbs onto the settling south rim.'),
  },
};

export const THE_WHITE_STAG: Scenario = {
  id: 'the-white-stag', title: 'The White Stag', subtitle: 'A pale stag is blamed for losses no one has actually seen it cause.', startScene: 'stagClaim',
  diversity: meta({ hook: 'A disputed hunt turns on separating crop damage from a rare animal’s tracks and choosing whether to spend a season’s goodwill protecting it.', activity: 'animals', role: 'witness', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'farm woodland', fantasy: 'AMBIGUOUS', combat: 'NONE', structure: 'evidence and ethical refusal' }),
  scenes: {
    stagClaim: scene('stagClaim', 'A Pale Shape at the Field', 'A farmer asks you to join a hunt for a white stag blamed for spoiled crops and two missing hunters. No one has found a body. A neighbor says the stag was seen at the far orchard, where a low fence is broken.', [
      { id: 'inspectCropEdges', label: 'Compare the crop damage with the tracks', next: 'stagEvidence' },
      { id: 'askNeighbor', label: 'Ask the neighbor what they saw', next: 'stagWitness' },
      { id: 'declineStagHunt', label: 'Decline the hunt and move on', next: 'stagDeclined', effects: { historyFlags: ['declined a hunt for a rare white stag without proof of harm'] } },
    ]),
    stagEvidence: scene('stagEvidence', 'Hooves beside the Fence', 'The damaged rows are trampled in several directions, as if livestock scattered through them. A narrow set of deer tracks follows the fence but does not enter the field. The farmer’s missing hunters had been arguing over a boundary before they left.', [
      { id: 'followDeerTracks', label: 'Follow the stag tracks to the orchard', next: 'stagAtOrchard', effects: { knowledge: ['The pale stag’s tracks stayed outside the damaged crop; livestock made the trampled rows.'] } },
      { id: 'searchForHunters', label: 'Search the boundary path for the hunters', next: 'huntersFound' },
      { id: 'stopHuntEvidence', label: 'Show the farmer the livestock tracks', next: 'stagAfter' },
    ]),
    stagWitness: scene('stagWitness', 'Two Different Sightings', 'The neighbor saw the stag leave the orchard at dawn. The farmer saw pale movement after dark but cannot say it was the same animal. The broken fence points toward a nearby pasture, not the crops.', [
      { id: 'checkPasture', label: 'Check the pasture fence with the farmer', next: 'huntersFound' },
      { id: 'leaveStagAlone', label: 'Ask the farmer to postpone the hunt', next: 'stagAfter' },
      { id: 'seekStag', label: 'Watch the orchard without a weapon', next: 'stagAtOrchard' },
    ]),
    stagAtOrchard: scene('stagAtOrchard', 'A Stag at the Orchard Edge', 'A pale stag feeds beyond the fence, limping slightly. It lifts its head when you move but does not charge. The orchard is quiet; there is no sign that it has harmed anyone.', [
      { id: 'letStagPass', label: 'Leave a clear path toward the woods', next: 'stagAfter', effects: { knowledge: ['A pale, limping stag fed beyond the orchard fence and left when given room.'] } },
      { id: 'leadFarmerAway', label: 'Call the farmer away from the orchard', next: 'stagAfter', effects: { historyFlags: ['prevented a hunt before the animal was identified as a stag'] } },
      { id: 'approachStag', label: 'Approach the injured stag', hint: 'A frightened animal can kick if cornered.', chance: { probability: 0.61, successNext: 'stagAfter', failureNext: 'stagInjured', successMessage: 'The stag slips through the open fence and reaches the woods.', failureMessage: 'The stag kicks free and leaves you bruised.', failureEffects: { health: -2 } } },
    ]),
    huntersFound: scene('huntersFound', 'A Boundary Dispute', 'The two hunters are alive on opposite sides of a fallen fence, arguing over whose livestock trampled the crops. Their tracks mix with the stag’s only near the orchard. The animal is nowhere in sight.', [
      { id: 'mendFence', label: 'Help both hunters mend the fence', next: 'stagAfter', effects: { historyFlags: ['helped resolve a crop-loss accusation after separating stag and livestock tracks'] } },
      { id: 'tellTracks', label: 'Show them where the stag tracks end', next: 'stagAfter', effects: { knowledge: ['Two hunters were found arguing over a fence; their livestock caused the crop damage, not the white stag.'] } },
      { id: 'leaveHunters', label: 'Leave them to settle the boundary', next: 'stagAfter' },
    ]),
    stagAfter: end('stagAfter', 'No Shot Fired', 'The farmer postpones the hunt. The crop loss is traced to livestock crossing the broken fence, while the pale stag remains a rare sight rather than proven culprit. The two landholders still have to mend their boundary.'),
    stagDeclined: end('stagDeclined', 'A Hunt Left Behind', 'You leave without joining the hunt. The farmer may still choose to pursue the stag, but you have not treated rumor as proof.'),
    stagInjured: end('stagInjured', 'A Bruised Pursuit', 'The stag clears the fence and vanishes into the trees. Your bruise will fade; the farmer still has no evidence that the animal caused the crop loss.'),
  },
};

export const THE_RED_EYED_BOAR: Scenario = {
  id: 'the-red-eyed-boar', title: 'The Red-Eyed Boar', subtitle: 'A trap-wise boar has learned the farms’ feeding routes.', startScene: 'boarReport',
  diversity: meta({ hook: 'A boar defeats familiar traps by circling downwind; a safe drive depends on opening a corridor rather than cornering it.', activity: 'animals', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'farm woodland', fantasy: 'NONE', combat: 'POSSIBLE', structure: 'wind and corridor defense' }),
  scenes: {
    boarReport: scene('boarReport', 'The Trap That Was Turned', 'A farmhand shows you a sprung trap and a deep cut across his trouser leg. A huge boar has taken feed from three farms and now circles downwind of every trap. Its eyes are bloodshot, and the last attack happened beside the orchard gate.', [
      { id: 'inspectTrap', label: 'Inspect how the trap was turned', next: 'boarPattern', effects: { knowledge: ['The red-eyed boar circles traps downwind and avoids the baited approach.'] } },
      { id: 'moveLivestock', label: 'Move the animals behind the stone wall', next: 'boarProtected' },
      { id: 'refuseBoar', label: 'Decline the hunt and leave the farms', next: 'boarRefused' },
    ], 'warning'),
    boarPattern: scene('boarPattern', 'A Route through the Wind', 'The boar’s prints skirt the bait and follow the wind toward the orchard gate. A dry-stone wall blocks one side; the gate opens to an empty grazing lot. The farmer has rope and a lantern at the barn, but asks what you think rather than choosing for you.', [
      { id: 'openGrazingLot', label: 'Open the gate to the empty grazing lot', next: 'boarDrive' },
      { id: 'watchDownwind', label: 'Wait upwind beyond the stone wall', next: 'boarApproach' },
      { id: 'setTrapAgain', label: 'Reset the trap near the feed', hint: 'The boar has already learned to circle the bait.', chance: { probability: 0.43, successNext: 'boarCaught', failureNext: 'boarCharge', successMessage: 'The trap catches one foreleg; the boar breaks for the open lot.', failureMessage: 'The boar circles downwind and charges the trap line.', failureEffects: { health: -4 } } },
    ]),
    boarProtected: scene('boarProtected', 'Animals behind Stone', 'The livestock are behind the wall. Their feed remains outside, and fresh rooting appears near the orchard gate. The boar is not in sight; the wall gives you a safe position while the owner can open the grazing lot.', [
      { id: 'openAfterMove', label: 'Open the empty lot as a route away', next: 'boarDrive' },
      { id: 'waitSafe', label: 'Keep watch from behind the wall', next: 'boarApproach' },
      { id: 'stopHunt', label: 'Leave the boar to trained hunters', next: 'boarRefused' },
    ]),
    boarApproach: scene('boarApproach', 'The Sound of Rooting', 'The boar roots beside the feed bin, eyes streaming from dust and infection. It has not noticed you behind the wall. The grazing gate stands open to one side; rushing it would leave no safe retreat.', [
      { id: 'driveWithLight', label: 'Use the lantern to guide it toward the gate', requirements: { items: ['lantern'] }, next: 'boarDrive', effects: { knowledge: ['The boar avoided the open lantern and turned toward the clear grazing gate.'] } },
      { id: 'quietlyOpenGate', label: 'Open the gate from behind the wall', next: 'boarDrive' },
      { id: 'chargeBoar', label: 'Rush it with your knife', hint: 'It is larger than you and already injured; a charge may be fatal.', chance: { probability: 0.24, successNext: 'boarDriven', failureNext: 'boarFatal', successMessage: 'The boar turns away and crashes through the outer hedge.', failureMessage: 'The boar charges before you can get behind the wall.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    boarDrive: scene('boarDrive', 'A Clear Way Out', 'With the empty lot open, the boar turns away from the pens and follows the scent of feed through the gate. The wall separates it from the animals. You can keep the route clear or try to shut the gate behind it.', [
      { id: 'letBoarGo', label: 'Let it leave the farms', next: 'boarDriven', effects: { historyFlags: ['drove a trap-wise boar away without killing it'] } },
      { id: 'closeGateBoar', label: 'Close the gate after it passes', next: 'boarCaught' },
      { id: 'followBoar', label: 'Follow it beyond the hedge', hint: 'The open lot is safe; beyond it the brush gives the boar cover.', next: 'boarCharge', effects: { health: -2 } },
    ]),
    boarCharge: scene('boarCharge', 'The Hedge Gives Way', 'The boar bursts through the hedge and runs along the wall. The gate is still open, and the livestock remain behind stone. There is room to step away, but not to block its path.', [
      { id: 'stepBehindWall', label: 'Get behind the wall and let it pass', next: 'boarDriven' },
      { id: 'shutGateFromSide', label: 'Shut the grazing gate from the side', next: 'boarCaught' },
      { id: 'standGroundBoar', label: 'Stand in its path', hint: 'The boar is charging through a narrow gap.', chance: { probability: 0.18, successNext: 'boarDriven', failureNext: 'boarFatal', successMessage: 'It veers through the open gate at the last moment.', failureMessage: 'The boar strikes before you can move.', successEffects: { health: -4 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    boarDriven: end('boarDriven', 'The Pens Stay Quiet', 'The boar leaves the farm boundary. The owner moves feed inside and asks a licensed hunter to check the outlying wood; no trophy is taken, and the animal may still be somewhere beyond the farms.'),
    boarCaught: end('boarCaught', 'A Gate Shut at Dawn', 'The boar is contained beyond the grazing lot until trained help arrives. The farmer will not approach it; the trap line is dismantled, and the animals stay behind the stone wall.'),
    boarRefused: end('boarRefused', 'A Hunt Left to Others', 'You refuse to pursue a wounded boar through unfamiliar ground. The farms move feed indoors and call a local hunter; the danger is real, but it is not yours to face without preparation.'),
    boarFatal: end('boarFatal', 'The Boar’s Charge', 'The narrow gate leaves no room to turn away. The farmer finds the wall broken where the boar forced through.', 'death'),
  },
};

export const THE_BONE_EATER: Scenario = {
  id: 'the-bone-eater', title: 'The Bone-Eater', subtitle: 'Only fragments disappear from the old cemetery, until someone disturbs them.', startScene: 'cemeteryBones',
  diversity: meta({ hook: 'A cemetery creature feeds on remains and becomes dangerous only when mourners disturb its feeding ground.', activity: 'investigation/mystery', role: 'helper/rescuer', tone: 'mysterious/eerie', risk: 'SEVERE', setting: 'cemetery', fantasy: 'CONFIRMED_SUPERNATURAL', combat: 'AVOIDABLE', structure: 'respectful observation and boundary restoration' }),
  scenes: {
    cemeteryBones: scene('cemeteryBones', 'Fragments by the Grave', 'A gravekeeper finds small bone fragments carried from old graves to a shallow hollow beneath the yew hedge. No fresh grave is open and no living person is missing. The keeper asks you to watch while they fetch the parish records.', [
      { id: 'observeHedge', label: 'Watch the hollow from the path', next: 'boneAtNight', effects: { knowledge: ['A cemetery creature carried old bone fragments to a hollow beneath the yew hedge.'] } },
      { id: 'checkGraveEdges', label: 'Check whether any grave was opened', next: 'graveEvidence' },
      { id: 'leaveCemetery', label: 'Ask the keeper to close the grounds', next: 'cemeteryClosed', effects: { historyFlags: ['asked a gravekeeper to close a cemetery after unexplained bone movement'] } },
    ], 'warning'),
    graveEvidence: scene('graveEvidence', 'Old Earth, No Open Grave', 'The soil is settled and the markers are intact. The fragments are from old animal bones stored with a nineteenth-century burial custom; nothing living has been taken. A narrow burrow reaches the hollow from beneath the wall.', [
      { id: 'waitForCreature', label: 'Wait for the burrow’s visitor', next: 'boneAtNight' },
      { id: 'blockBurrow', label: 'Ask the keeper to block the burrow', next: 'boneContained' },
      { id: 'digBurrow', label: 'Dig into the burrow', hint: 'The burrow is narrow and the keeper warns something uses it.', next: 'boneDisturbed', effects: { health: -2 } },
    ]),
    boneAtNight: scene('boneAtNight', 'The Small Shape', 'After dusk a pale, long-limbed creature comes through the burrow and gathers one fragment. It ignores you while you remain on the path. When a mourner steps toward the hollow, it bares teeth and holds its ground.', [
      { id: 'warnMourner', label: 'Keep the mourner on the path', next: 'boneBoundary', effects: { historyFlags: ['kept a mourner outside a cemetery creature’s feeding hollow'] } },
      { id: 'leaveBoneQuietly', label: 'Let it finish and withdraw', next: 'boneAfter', effects: { knowledge: ['The Bone-Eater fed on old remains and guarded its hollow when approached; it did not pursue observers.'] } },
      { id: 'driveCreature', label: 'Drive it from the hollow', hint: 'It has shown teeth only when the hollow is approached.', chance: { probability: 0.39, successNext: 'boneContained', failureNext: 'boneAttack', successMessage: 'The creature retreats down its burrow.', failureMessage: 'It lunges when you cross the hollow’s edge.', successEffects: { health: -1 }, failureEffects: { health: -5 } } },
    ], 'danger'),
    boneBoundary: scene('boneBoundary', 'A Boundary, Not a Grave', 'The keeper finds a small stone ring around the hollow in the old grounds ledger. Its boundary had fallen beneath leaves. The creature has retreated into the burrow; the keeper can restore the stones without entering.', [
      { id: 'restoreStones', label: 'Help restore the stone ring', next: 'boneAfter', effects: { knowledge: ['The cemetery’s old stone ring marked a boundary around the Bone-Eater’s feeding hollow.'] } },
      { id: 'closeBurrow', label: 'Close the burrow from the path', next: 'boneContained' },
      { id: 'enterHollow', label: 'Cross the ring and scatter the bones', hint: 'The creature guards this hollow and has already threatened a mourner.', chance: { probability: 0.25, successNext: 'boneContained', failureNext: 'boneFatal', successMessage: 'The creature flees into the lower ground.', failureMessage: 'It strikes before you can leave the hollow.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ]),
    boneDisturbed: scene('boneDisturbed', 'A Scrape under the Wall', 'The creature answers from below the stone wall. The gravekeeper pulls you back to the path; no grave was opened, but the burrow is now loose and stones have shifted around the hollow.', [
      { id: 'sealFromPath', label: 'Seal the burrow from the path', next: 'boneContained' },
      { id: 'restoreBoundary', label: 'Replace the loose boundary stones', next: 'boneAfter' },
      { id: 'retreatCemetery', label: 'Close the gate and retreat', next: 'cemeteryClosed' },
    ], 'warning'),
    boneAfter: end('boneAfter', 'The Old Ground Left Quiet', 'The keeper restores the stone ring and leaves the old remains where they were found. The creature returns to its hollow after the grounds empty. No living person was prey, but the cemetery will stay closed after dusk.'),
    boneContained: end('boneContained', 'The Burrow Barred', 'The keeper blocks the burrow and marks the hollow as unsafe to disturb. The creature is contained for now, not destroyed; the old graves remain intact.'),
    cemeteryClosed: end('cemeteryClosed', 'The Gate Shut at Dusk', 'The keeper closes the cemetery and posts a warning at the gate. The source of the movement remains below the wall, but no one is sent into the hollow.'),
    boneAttack: end('boneAttack', 'The Hollow Bites Back', 'The creature claws your arm before vanishing through the burrow. The keeper closes the grounds and calls for help; the old bones remain scattered.'),
    boneFatal: end('boneFatal', 'Within the Ring', 'The creature strikes when you cross its boundary. The gravekeeper closes the gate, leaving the old hollow undisturbed.', 'death'),
  },
};

export const THE_LANTERN_EATER: Scenario = {
  id: 'the-lantern-eater', title: 'The Lantern-Eater', subtitle: 'Camp lights go dark one by one while something circles beyond the trees.', startScene: 'campLights',
  diversity: meta({ hook: 'A light-seeking presence uses the glow of lanterns to draw travelers away from a shared campfire.', activity: 'survival', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'forest camp', fantasy: 'CONFIRMED_SUPERNATURAL', combat: 'AVOIDABLE', structure: 'light as lure and signal' }),
  scenes: {
    campLights: scene('campLights', 'The First Light Goes Out', 'At a roadside camp, three travelers set their lamps around one fire. The nearest lamp gutters without wind; beyond it, a pale glow appears between the trees. The camp stands on open ground with a clear road behind it.', [
      { id: 'shieldLamp', label: 'Shield your lantern and watch the trees', requirements: { items: ['lantern'] }, next: 'lightPattern', effects: { knowledge: ['The Lantern-Eater moved toward exposed light and stopped when the flame was shielded.'] } },
      { id: 'stayByFire', label: 'Keep everyone beside the central fire', next: 'campCircle' },
      { id: 'leaveCamp', label: 'Lead the travelers onto the open road', next: 'campLeft', effects: { historyFlags: ['led travelers away from a light-seeking presence'] } },
    ], 'warning'),
    lightPattern: scene('lightPattern', 'A Glow Moves toward Glow', 'The pale point shifts toward every uncovered flame and stops when all lamps are hooded. The travelers’ fire still burns. Beyond the trees, a low branch bends under a weight that makes no sound.', [
      { id: 'hoodOtherLamps', label: 'Ask everyone to hood their lamps', next: 'campDark' },
      { id: 'raiseLantern', label: 'Raise the lantern to draw it closer', requirements: { items: ['lantern'] }, hint: 'The glow has followed every exposed flame so far.', next: 'lightApproach', effects: { damageItems: ['lantern'] } },
      { id: 'takeRoadLight', label: 'Move together toward the open road', next: 'campLeft' },
    ]),
    campCircle: scene('campCircle', 'The Fire Holds', 'The travelers gather around the fire and cover their lamps. The pale glow stops at the tree line. No one is hurt, but the horses will not approach the woods and the road remains clear behind camp.', [
      { id: 'holdUntilDawn', label: 'Keep watch until first light', next: 'campDawn', effects: { historyFlags: ['kept a shared campfire watch through a strange night'] } },
      { id: 'leaveDarkCamp', label: 'Travel together by the open road', next: 'campLeft' },
      { id: 'scatterLights', label: 'Set one hooded lamp away from camp', next: 'lightApproach' },
    ]),
    campDark: scene('campDark', 'Darkness at the Tree Line', 'The glow moves along the trees but does not cross the dark edge of the camp. It seems to lose the travelers when the lamps are covered. The fire is low; the road is open, and a lantern is still burning under a coat.', [
      { id: 'leaveWithoutLight', label: 'Leave together while the road is clear', next: 'campLeft' },
      { id: 'waitDark', label: 'Wait behind the fire until dawn', next: 'campDawn' },
      { id: 'offerFalseLight', label: 'Place a covered lamp away from camp', next: 'lightApproach' },
    ], 'warning'),
    lightApproach: scene('lightApproach', 'A Shape at the Flame', 'The pale glow rises from the ground into a thin, jointed shape. It leans toward the lantern and dims it without touching the glass. The road is still behind you, and the travelers are gathered in the firelight.', [
      { id: 'dropLightAndLeave', label: 'Set the lantern down and retreat', next: 'campLeft', effects: { historyFlags: ['escaped a light-seeking entity without fighting it'] } },
      { id: 'coverFlame', label: 'Cover the flame and step into darkness', next: 'coveredRetreat' },
      { id: 'strikeShape', label: 'Strike the shape with your knife', hint: 'The blade may not affect a light-shaped body; close contact is dangerous.', chance: { probability: 0.3, successNext: 'campDawn', failureNext: 'lanternFatal', successMessage: 'The shape collapses into a fading glow.', failureMessage: 'The glow wraps around your face and takes the lantern flame.', successEffects: { health: -4 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    coveredRetreat: scene('coveredRetreat', 'The Light Loses Its Hold', 'You hood the lantern and step back toward the road. The pale shape stops at the edge of the firelight; the other travelers are already together behind you.', [
      { id: 'leaveTogether', label: 'Leave the camp together', next: 'campLeft' },
      { id: 'waitForDawn', label: 'Stay together until first light', next: 'coveredDawn' },
    ], 'warning'),
    coveredDawn: end('coveredDawn', 'A Dark Lamp at Dawn', 'At first light the glow has vanished beyond the tree line. The covered lamp kept the travelers together through the night, and no one followed the strange light into the woods.'),
    campDawn: end('campDawn', 'The Lamps at Morning', 'At first light the pale glow is gone. The travelers keep their lamps hooded until they reach the next settlement. Your lantern remains as it is; the presence never touched it while covered.'),
    campLeft: end('campLeft', 'The Road beyond the Trees', 'The travelers leave together by the open road. One lamp is lost to the night, but no one follows the glow into the woods. You do not learn what it was.'),
    lanternFatal: end('lanternFatal', 'A Flame Taken', 'The light closes over you before the others can pull you back. At dawn, only the lantern’s dark casing remains beside the road.', 'death'),
  },
};

export const THE_MIRE_HORSE: Scenario = {
  id: 'the-mire-horse', title: 'The Mire Horse', subtitle: 'A horse-shaped light appears beyond the safe path through the marsh.', startScene: 'marshPath',
  diversity: meta({ hook: 'A marsh lure may be an escaped horse or a criminal signal; safe ground and hoof evidence separate the possibilities.', activity: 'travel/exploration', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'HIGH', setting: 'marsh woodland', fantasy: 'AMBIGUOUS', combat: 'AVOIDABLE', structure: 'route choice across unstable ground' }),
  scenes: {
    marshPath: scene('marshPath', 'A Horse Beyond the Reeds', 'You follow a raised plank path across a marsh at dusk. Beyond the reeds, a pale horse-shaped figure stands on ground that appears lower than the waterline. A small bell rings once. The marked path continues behind you toward dry land.', [
      { id: 'inspectReeds', label: 'Look for hoofprints from the path', next: 'marshEvidence' },
      { id: 'callFigure', label: 'Call toward the figure without leaving the path', next: 'marshAnswer' },
      { id: 'turnBackMarsh', label: 'Return to dry ground', next: 'marshRetreat', effects: { historyFlags: ['turned back from a marsh light rather than leave the marked path'] } },
    ], 'warning'),
    marshEvidence: scene('marshEvidence', 'No Weight in the Mud', 'The figure’s outline wavers in the reeds. There are no fresh hoofprints on the visible bank, only boot tracks running from a dry hummock to a hidden skiff tied below the planks. A second bell answers from deeper in the marsh.', [
      { id: 'markSkiff', label: 'Mark the hidden skiff and retreat', next: 'marshDeception', effects: { knowledge: ['A horse-shaped marsh light was used as a lure beside a hidden skiff and fresh bootprints.'] } },
      { id: 'followBoots', label: 'Follow the bootprints along dry hummocks', next: 'marshHummocks' },
      { id: 'stepIntoMud', label: 'Step off the planks toward the figure', hint: 'The bank has no hoofprints and the mud is waterlogged.', chance: { probability: 0.4, successNext: 'marshHummocks', failureNext: 'marshSinking', successMessage: 'You reach the dry hummock beside the hidden skiff.', failureMessage: 'The mud gives way beneath your boot.', failureEffects: { health: -3 } } },
    ]),
    marshAnswer: scene('marshAnswer', 'A Bell from the Wrong Place', 'The figure does not turn. The bell rings again from behind you, near the skiff. A loose horse could not make a sound from two places at once; someone may be moving through the reeds.', [
      { id: 'followSound', label: 'Follow the bell along the plank path', next: 'marshHummocks' },
      { id: 'warnNextTraveler', label: 'Warn the next traveler and return', next: 'marshRetreat', effects: { historyFlags: ['warned a traveler about a false horse-light in the marsh'] } },
      { id: 'enterReeds', label: 'Chase the figure through the reeds', hint: 'The path is firm; the reeds hide deep water and unstable mud.', next: 'marshSinking', effects: { health: -3 } },
    ], 'warning'),
    marshHummocks: scene('marshHummocks', 'A Man with a Bell', 'From the next dry hummock you see a ferryman’s helper with a hand bell beside the hidden skiff. The horse shape is a lamp hung behind reeds. He says he uses it to draw stranded travelers toward his boat, but it can also lead them into deep mud.', [
      { id: 'askForHelp', label: 'Ask him to guide you back to the path', next: 'marshDeception' },
      { id: 'takeBell', label: 'Take the bell and lead him out', next: 'marshDeception', effects: { historyFlags: ['stopped a false marsh signal used to draw travelers off the path'] } },
      { id: 'confrontHelper', label: 'Confront him beside the skiff', hint: 'The narrow hummock leaves little room to retreat.', chance: { probability: 0.55, successNext: 'marshDeception', failureNext: 'marshSinking', successMessage: 'He steps aside and lets you pass.', failureMessage: 'He shoves you off the hummock into the soft edge.', failureEffects: { health: -3 } } },
    ]),
    marshSinking: scene('marshSinking', 'The Path under the Water', 'Your boot sinks into mud up to the ankle. The raised planks are still within reach, and the hidden bell has stopped. Nothing is pulling you under, but struggling in place will make the footing worse.', [
      { id: 'reachPlanks', label: 'Reach back to the raised planks', chance: { probability: 0.65, bonusItems: ['travelRope'], bonusProbability: 0.15, successNext: 'marshRetreat', failureNext: 'marshSinkingWorse', successMessage: 'You pull free onto the planks.', failureMessage: 'The mud gives way again and costs you time.', failureEffects: { health: -2 } } },
      { id: 'callForGuide', label: 'Call for the ferryman’s helper', next: 'marshDeception' },
      { id: 'stayStill', label: 'Hold still and wait for help', next: 'marshRetreat' },
    ], 'danger'),
    marshDeception: end('marshDeception', 'No Horse in the Mire', 'The helper takes down the false horse-light and leads you to dry ground. The marsh horse was a lamp and a bell, not a creature; the unsafe path was still real, and the next traveler will be warned.'),
    marshRetreat: end('marshRetreat', 'Dry Ground at Dusk', 'You return to the marked path and reach dry ground. The horse-shaped light remains beyond the reeds, unexplained but no longer worth following.'),
    marshSinkingWorse: end('marshSinkingWorse', 'A Muddy Rescue', 'The helper reaches you from the hummock and pulls you onto the planks. You are bruised and wet; the false light is taken down before anyone else follows it.'),
  },
};

export const THE_RIVER_DEVIL: Scenario = {
  id: 'the-river-devil', title: 'The River Devil', subtitle: 'A force strikes small boats from below at one bend in the river.', startScene: 'riverLanding',
  diversity: meta({ hook: 'Repeated hull strikes come from a submerged log wedged beneath a bend; survival requires changing the crossing, not killing a monster.', activity: 'travel/exploration', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'river ferry landing', fantasy: 'AMBIGUOUS', combat: 'NONE', structure: 'water-route diagnosis and evacuation' }),
  scenes: {
    riverLanding: scene('riverLanding', 'A Blow beneath the Boat', 'At the ferry landing, a boatman shows you a split plank from a skiff struck beneath the same bend twice. The water is high but not flooding. A slow eddy turns around a dark stump midstream, and the opposite bank is visible.', [
      { id: 'inspectWater', label: 'Watch the current around the stump', next: 'riverCurrent', effects: { knowledge: ['Small boats were struck by a submerged log caught beneath the eddy at the river bend.'] } },
      { id: 'askBoatman', label: 'Ask who saw the last strike', next: 'riverWitness' },
      { id: 'avoidBend', label: 'Take the longer ferry route', next: 'riverSafe' },
    ], 'warning'),
    riverWitness: scene('riverWitness', 'A Rope Pulled Sideways', 'A ferryman felt a line catch under the hull and pull sideways. The boat drifted back to the same landing. He refuses another crossing at the bend until someone checks the stump from shore.', [
      { id: 'watchStump', label: 'Watch the eddy from the landing', next: 'riverCurrent' },
      { id: 'sendFerryLong', label: 'Send passengers by the upstream landing', next: 'riverSafe' },
      { id: 'probeFromShore', label: 'Probe the shallow edge from firm ground', next: 'riverEvidence' },
    ]),
    riverCurrent: scene('riverCurrent', 'The Water Turns Back', 'A branch caught under the stump pulls hard against the current. It is long enough to strike a hull but too low to see below the dark water. The ferry has a pole and a rope, both on the landing; no one needs to enter the river.', [
      { id: 'probeWithPole', label: 'Probe the stump from the landing', next: 'riverEvidence' },
      { id: 'markRoute', label: 'Mark the bend and close this landing', next: 'riverSafe', effects: { historyFlags: ['closed a river landing after identifying a submerged strike hazard'] } },
      { id: 'wadeToStump', label: 'Wade toward the stump', hint: 'The current circles under the stump and can pull a person beneath it.', chance: { probability: 0.34, successNext: 'riverEvidence', failureNext: 'riverFatal', successMessage: 'You reach the shallow side of the snag.', failureMessage: 'The eddy pulls you under before you can reach the stump.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ], 'warning'),
    riverEvidence: scene('riverEvidence', 'A Log under the Eddy', 'The pole catches a heavy log pinned below the stump. One end swings into the boat lane whenever the current rises. The ferryman can pull from shore if the skiffs are kept upstream.', [
      { id: 'pullLogRope', label: 'Use the ferry rope to pull from shore', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, next: 'riverCleared', effects: { damageItems: ['travelRope'] } },
      { id: 'waitForLowerWater', label: 'Wait until the water drops', next: 'riverSafe' },
      { id: 'tryPoleAlone', label: 'Shift the log with the ferry pole', chance: { probability: 0.5, successNext: 'riverCleared', failureNext: 'riverInjury', successMessage: 'The log turns away from the boat lane.', failureMessage: 'The log springs back and strikes the pole.', failureEffects: { health: -3 } } },
    ]),
    riverCleared: end('riverCleared', 'The Bend Opens', 'The log rolls into the shallows and is secured on the bank. The ferry can resume at a reduced pace; no creature is found, only a hazard the river had hidden.'),
    riverSafe: end('riverSafe', 'A Longer Crossing', 'The ferryman closes the bend and uses the upstream landing. Passengers lose time, but the skiffs stay intact. The river’s force remains real even without a devil beneath it.'),
    riverInjury: end('riverInjury', 'The Pole Snaps', 'The pole breaks and the log swings back under the eddy. The ferryman closes the landing and tends your bruised hands; a longer route remains open.'),
    riverFatal: end('riverFatal', 'Under the Bend', 'The current catches you beneath the snag. The ferryman closes the landing before another boat is sent into the eddy.', 'death'),
  },
};

export const MONSTER_HUNT_FIRST = [THE_THING_AT_BLACK_CREEK, TEETH_IN_THE_MINE, SOMETHING_IN_THE_CORN, THE_BARROW_HOUND, THE_WHITE_STAG, THE_RED_EYED_BOAR, THE_BONE_EATER, THE_LANTERN_EATER, THE_MIRE_HORSE, THE_RIVER_DEVIL];
