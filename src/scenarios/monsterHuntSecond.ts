import type { Scenario } from '../types';
import { huntEnd as end, huntMetadata as meta, huntScene as scene } from './monsterHuntTools';

export const THE_MILLERS_BEAST: Scenario = {
  id: 'the-millers-beast', title: 'The Miller’s Beast', subtitle: 'A night visitor crosses behind moving gears without eating the grain.', startScene: 'millNoise',
  diversity: meta({ hook: 'A mill animal navigates machinery by listening for the wheel cadence; stopping the mill changes its route.', activity: 'labor/repair', role: 'investigator/explorer', tone: 'tense/dangerous', risk: 'MODERATE', setting: 'mill workshop', fantasy: 'AMBIGUOUS', combat: 'AVOIDABLE', structure: 'mechanical timing and live capture' }),
  scenes: {
    millNoise: scene('millNoise', 'Scrapes after Closing', 'The miller shows you grain sacks torn open but barely eaten. Every night, scrapes cross the floor while the wheel turns. A belt and exposed gear teeth run beside the lower aisle; the miller has shut the loading door.', [
      { id: 'inspectSacks', label: 'Compare the tears with the grain trail', next: 'millEvidence' },
      { id: 'listenToWheel', label: 'Listen from the safe upper walk', next: 'millCadence' },
      { id: 'leaveMill', label: 'Ask the miller to keep the mill closed', next: 'millClosed' },
    ], 'warning'),
    millEvidence: scene('millEvidence', 'Grain Left Untouched', 'The sacks are opened from below, and the grain is pushed aside rather than eaten. Small muddy prints follow the wall behind the belt. The miller says a rat could not lift the grain door, but a person could reach the loading latch from outside.', [
      { id: 'checkLoadingLatch', label: 'Check the outside loading latch', next: 'millLatch' },
      { id: 'watchMillWall', label: 'Watch the wall from the upper walk', next: 'millCadence' },
      { id: 'setEmptyCrate', label: 'Place an empty crate away from the gears', next: 'millVisitor' },
    ]),
    millCadence: scene('millCadence', 'Steps between the Turning', 'The scrapes pause whenever the wheel knocks, then cross during the quieter beat. A low shape slips behind the grain chute without touching the belt. The miller can stop the wheel from the upper lever.', [
      { id: 'stopWheel', label: 'Ask the miller to stop the wheel', next: 'millVisitor' },
      { id: 'watchOneTurn', label: 'Wait for one more wheel turn', next: 'millVisitor' },
      { id: 'reachBehindBelt', label: 'Reach behind the moving belt', hint: 'The belt can catch a sleeve or hand.', chance: { probability: 0.43, successNext: 'millVisitor', failureNext: 'millInjury', successMessage: 'Your hand reaches the wall before the next belt turn.', failureMessage: 'The belt catches your sleeve and throws you back.', failureEffects: { health: -4 } } },
    ], 'warning'),
    millLatch: scene('millLatch', 'A Latch from Outside', 'The latch bears fresh tool marks, but the prints stop under a broken drain cover. No one has been inside the mill since closing. The route ends at a dry culvert beyond the wheel house.', [
      { id: 'waitForOutside', label: 'Watch the culvert from daylight', next: 'millHuman' },
      { id: 'askMillerAboutTools', label: 'Ask who can reach the outer latch', next: 'millHuman' },
      { id: 'returnInside', label: 'Check the lower aisle without the wheel', next: 'millVisitor' },
    ]),
    millVisitor: scene('millVisitor', 'A Shape beside the Chute', 'With the wheel stopped, a large badger comes from the wall gap. It has been nesting behind the chute and tearing sacks for straw, not food. It freezes when the miller steps toward its burrow; the culvert offers a way out.', [
      { id: 'openCulvert', label: 'Open the culvert route and step back', next: 'badgerLeaves', effects: { knowledge: ['A badger nested behind the mill chute and used the culvert; stopping the wheel let it leave safely.'] } },
      { id: 'guideOutside', label: 'Guide it toward the open yard', next: 'badgerLeaves' },
      { id: 'cornerBadger', label: 'Corner it before it reaches the gears', hint: 'The badger is trapped between the chute and machinery.', chance: { probability: 0.35, successNext: 'badgerLeaves', failureNext: 'millInjury', successMessage: 'It bolts through the culvert.', failureMessage: 'It bites through your glove and darts under the belt.', failureEffects: { health: -3 } } },
    ], 'warning'),
    millHuman: scene('millHuman', 'Someone at the Drain', 'A mill apprentice admits using the outer latch to sleep in the dry culvert. They tore the sacks for bedding, then fled when they heard the wheel. They are embarrassed, not armed; the miller is angry about the damage.', [
      { id: 'askApprenticeRepair', label: 'Have the apprentice help replace the sacks', next: 'millRepaid', effects: { historyFlags: ['helped a mill apprentice repair damage caused by hiding in a culvert'] } },
      { id: 'tellMillerTruth', label: 'Tell the miller who opened the latch', next: 'millRepaid' },
      { id: 'leaveApprentice', label: 'Leave the matter to the miller', next: 'millClosed' },
    ]),
    badgerLeaves: end('badgerLeaves', 'The Wheel Turns Empty', 'The badger leaves through the culvert and the miller patches the wall. The torn sacks are replaced before the next grinding; the mill can turn again without trapping an animal behind its gears.'),
    millRepaid: end('millRepaid', 'Sacks Replaced', 'The apprentice helps replace the torn sacks and agrees to ask for shelter rather than hide in the mill. The miller keeps the outer latch repaired; no beast was in the machinery.'),
    millClosed: end('millClosed', 'A Mill Kept Shut', 'The miller closes the loading door and waits for daylight before inspecting the culvert. The damaged grain is lost, but no one reaches behind the turning belt.'),
    millInjury: end('millInjury', 'The Lower Aisle', 'The belt tears your sleeve and leaves your arm bruised. The miller stops the wheel and closes the building until a proper repair and animal check can be made.'),
  },
};

export const THE_ASHEN_MAN: Scenario = {
  id: 'the-ashen-man', title: 'The Ashen Man', subtitle: 'Witnesses describe a burned figure walking away from a fire that took no lives.', startScene: 'burnedHouse',
  diversity: meta({ hook: 'A figure from a house fire follows the only surviving ember to a kiln where a hidden witness is trapped.', activity: 'investigation/mystery', role: 'witness', tone: 'mysterious/eerie', risk: 'SEVERE', setting: 'burned house woodland', fantasy: 'CONFIRMED_SUPERNATURAL', combat: 'AVOIDABLE', structure: 'witness comparison and ember containment' }),
  scenes: {
    burnedHouse: scene('burnedHouse', 'The Figure in the Ash', 'A small house burned before dawn. The family escaped, and no one is missing. Two witnesses saw a soot-black figure walk from the smoke toward an old kiln; neither saw it catch fire. Warm ash marks the path, but the house itself is cold.', [
      { id: 'questionWitnesses', label: 'Ask each witness where it turned', next: 'witnessAccounts', effects: { knowledge: ['After a house fire, two witnesses saw an ash-covered figure walk toward an old kiln.'] } },
      { id: 'inspectAshTrail', label: 'Follow the warm ash from outside', next: 'kilnPath' },
      { id: 'leaveAshen', label: 'Warn the family and go for the fire crew', next: 'ashWarned' },
    ], 'warning'),
    witnessAccounts: scene('witnessAccounts', 'Two Versions of the Walk', 'One witness says the figure crossed the yard; the other says it stayed near the stone wall. Both agree it stopped at the kiln door. The fire crew has gone to the far barn, and no one has checked the kiln.', [
      { id: 'checkKilnDoor', label: 'Check the kiln from the outside', next: 'kilnPath' },
      { id: 'askFamilyAboutKiln', label: 'Ask the family what was stored there', next: 'kilnInterior' },
      { id: 'waitForCrew', label: 'Keep everyone away until the crew returns', next: 'ashWarned' },
    ]),
    kilnPath: scene('kilnPath', 'Warm Prints on Cold Ground', 'The prints are warm but not burning. They end at the kiln door; the latch is hot on one side only. A voice coughs from within, and you hear a person answer when the family calls their name.', [
      { id: 'openKilnDoor', label: 'Open the kiln door with a long pole', next: 'kilnRescue' },
      { id: 'callThroughDoor', label: 'Tell the trapped person to move back', next: 'kilnRescue' },
      { id: 'forceDoor', label: 'Pull the hot latch by hand', hint: 'The iron is visibly hot and smoke leaks at the seam.', chance: { probability: 0.38, successNext: 'kilnRescue', failureNext: 'ashInjury', successMessage: 'The latch lifts before the heat reaches your skin.', failureMessage: 'The iron burns your palm and the latch sticks.', failureEffects: { health: -3 } } },
    ], 'danger'),
    kilnInterior: scene('kilnInterior', 'Someone in the Kiln', 'The family remembers stacking dry boards in the kiln the previous evening. A hired worker hid there during the fire and is now trapped behind a warped door. The ash figure is outside the kiln, facing the last live ember under the boards.', [
      { id: 'pullWorkerClear', label: 'Guide the worker away from the ember', next: 'kilnRescue' },
      { id: 'smotherEmber', label: 'Smother the ember from the side opening', next: 'emberStopped', effects: { knowledge: ['The Ashen Man followed a live ember from the burned house; it faded when that ember was smothered.'] } },
      { id: 'retreatKiln', label: 'Get the family back and wait for the crew', next: 'ashWarned' },
    ], 'warning'),
    kilnRescue: scene('kilnRescue', 'The Worker Reaches Daylight', 'The worker crawls out, coughing but able to walk. Beyond the kiln, the ash figure has stopped at the smoldering board stack. The fire crew is arriving from the road; you can leave the ember for them or smother it from the clear side.', [
      { id: 'smotherFromSide', label: 'Smother the ember from the clear side', next: 'emberStopped', effects: { historyFlags: ['rescued a kiln worker after a fire and contained the last ember'] } },
      { id: 'leaveForCrew', label: 'Keep clear and let the fire crew handle it', next: 'ashAfter' },
      { id: 'approachAshFigure', label: 'Approach the figure with the lantern', requirements: { items: ['lantern'] }, hint: 'The figure is standing beside a live ember and the boards may reignite.', chance: { probability: 0.31, successNext: 'emberStopped', failureNext: 'ashFatal', successMessage: 'The lantern’s bright pane shows the ember beneath the ash.', failureMessage: 'The figure flares with the rekindled fire.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
    ]),
    emberStopped: end('emberStopped', 'The Ash Goes Cold', 'The ember is smothered and the ash figure fades with it. The worker is safe with the family; the fire crew takes over the burned house. Witnesses still disagree about what walked from the smoke.'),
    ashAfter: end('ashAfter', 'The Fire Crew Takes Over', 'The crew smothers the ember while you keep the family and rescued worker back. The ash figure is gone by the time the kiln cools. No one claims to know whether it was a presence or a shape in smoke.'),
    ashWarned: end('ashWarned', 'A Warning Kept', 'You keep the family away and bring the fire crew. They find a live ember at the kiln and a worker inside, alive but smoke-shaken. The figure is no longer seen.'),
    ashInjury: end('ashInjury', 'A Burned Hand', 'The hot latch burns your palm. The worker is still brought out when the fire crew arrives, and they smother the ember from the side opening.'),
    ashFatal: end('ashFatal', 'The Ember Walks Again', 'The boards flare before the crew can reach you. The family gets clear, but the ash figure and the ember vanish together into the smoke.', 'death'),
  },
};

export const THE_THING_BENEATH_THE_ICE: Scenario = {
  id: 'thing-beneath-the-ice', title: 'The Thing Beneath the Ice', subtitle: 'Something follows the traveler’s steps under the frozen river.', startScene: 'iceFootsteps',
  diversity: meta({ hook: 'A moving shadow tracks sound across thin river ice; the safe solution is to leave its surface, not rescue someone below.', activity: 'survival', role: 'accidental participant', tone: 'tense/dangerous', risk: 'SEVERE', setting: 'winter river', fantasy: 'FANTASY_THREAT', combat: 'AVOIDABLE', structure: 'sound and surface pressure', season: { season: 'WINTER', months: [12,1,2], weightBoost: 1.6 } }),
  scenes: {
    iceFootsteps: scene('iceFootsteps', 'A Shadow Keeps Pace', 'You are on a marked winter crossing when a dark shape moves beneath the ice, keeping pace with your steps. The nearest bank is ten paces behind you; the far bank is farther ahead. Hairline cracks spread where the shadow turns.', [
      { id: 'backToNearBank', label: 'Back toward the bank you left', hint: 'The ice is cracking under the moving shadow; do not run.', next: 'iceBank' },
      { id: 'lieStill', label: 'Stop and listen for the movement', next: 'iceSound' },
      { id: 'runAcrossIce', label: 'Run for the far bank', hint: 'The cracks are widening beneath you; a fall into the river is lethal.', chance: { probability: 0.35, successNext: 'farIceBank', failureNext: 'iceFatal', successMessage: 'You reach the far bank as the ice breaks behind you.', failureMessage: 'The ice opens beneath your next step.', failureEffects: { health: -10 } } },
    ], 'danger'),
    iceSound: scene('iceSound', 'A Turn under the Surface', 'The shadow moves toward the loudest sound: first your boot scrape, then a loose buckle tapping against the ice. There is no voice, hand, or person visible below. A drifted snowbank offers a low way to the near shore.', [
      { id: 'crawlSnowbank', label: 'Crawl toward the near snowbank', next: 'iceBank' },
      { id: 'dropBuckle', label: 'Drop the tapping buckle and move slowly', next: 'farIceBank', effects: { knowledge: ['A creature beneath river ice followed sharp sounds and turned away when the traveler moved quietly.'] } },
      { id: 'stampIce', label: 'Stamp to drive it away', hint: 'The shadow follows sound and the ice is already cracked.', chance: { probability: 0.26, successNext: 'iceBank', failureNext: 'iceFatal', successMessage: 'The creature turns toward the bank, giving you a moment to crawl.', failureMessage: 'The ice breaks beneath the repeated blows.', failureEffects: { health: -10 } } },
    ], 'warning'),
    iceBank: scene('iceBank', 'The Bank Holds', 'You reach packed snow at the bank. The shadow follows beneath the edge and bumps the ice once, then turns toward the center channel. A local crossing marker stands on solid ground, and a longer bridge route is open.', [
      { id: 'markThinIce', label: 'Mark the crossing as unsafe', next: 'iceAfter', effects: { historyFlags: ['marked an unsafe river crossing after a creature followed footsteps under ice'] } },
      { id: 'waitForOthers', label: 'Warn the next travelers from shore', next: 'iceAfter', effects: { knowledge: ['Something beneath the winter river followed sharp sounds but did not leave the ice.'] } },
      { id: 'goOntoIceAgain', label: 'Step back out to watch the shadow', hint: 'The ice has cracked, and the creature follows sound beneath it.', next: 'iceFatal' },
    ]),
    farIceBank: end('farIceBank', 'The Crossing Left Behind', 'You reach solid ground without crossing the shadow’s path again. The local bridge remains the safer route; no one is missing beneath the ice, and the moving shape has not left the river.'),
    iceAfter: end('iceAfter', 'A Mark on the Bank', 'The crossing is marked unsafe and travelers are sent to the bridge. The creature remains beneath the river, but its range and response to sound are now known.'),
    iceFatal: end('iceFatal', 'Under the River Ice', 'The ice breaks before you reach firm ground. The dark shape turns beneath the opening, and the winter current closes over it.', 'death'),
  },
};

export const THE_GOAT_THAT_WOULDNT_STAY_DEAD: Scenario = {
  id: 'the-goat-wouldnt-stay-dead', title: 'The Goat That Wouldn’t Stay Dead', subtitle: 'A farmer swears the same goat has died twice and returned by morning.', startScene: 'goatClaim',
  diversity: meta({ hook: 'The repeated resurrection is a mistaken identity between near-identical goats, revealed by ear notches and a feed ledger.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'humorous/absurd', risk: 'LOW', setting: 'farm stable', fantasy: 'AMBIGUOUS', combat: 'NONE', structure: 'comic claim tested by physical records' }),
  scenes: {
    goatClaim: scene('goatClaim', 'A Goat Back from the Dead', 'A farmer points to a gray goat and says it died last night, after dying once earlier in the week. The animal is alive, eating, and wearing no tag. Two similar goats stand in a neighboring pen; the farmer asks you to check before calling the story a miracle.', [
      { id: 'compareNotches', label: 'Compare the goats’ ear notches', next: 'goatMarks', effects: { knowledge: ['The farm’s near-identical gray goats were distinguished by small ear notches, not coat color.'] } },
      { id: 'askStablehand', label: 'Ask the stablehand what was buried', next: 'goatLedger' },
      { id: 'leaveGoat', label: 'Decline the tale and continue on', next: 'goatLeave' },
    ]),
    goatMarks: scene('goatMarks', 'Three Gray Coats', 'One goat has a square notch; another has a split ear. The living goat has neither. The farmer remembers burying a goat with a split ear, but cannot recall which pen it came from.', [
      { id: 'checkLedger', label: 'Check the feed marks in the stable book', next: 'goatLedger' },
      { id: 'askGravedigger', label: 'Ask who dug the shallow grave', next: 'goatBurial' },
      { id: 'stopInquiry', label: 'Let the farmer keep the mystery', next: 'goatAfter', effects: { historyFlags: ['left_goat_identity_unresolved'] } },
    ]),
    goatLedger: scene('goatLedger', 'A Feed Tally', 'The stablehand marked one gray goat as missing after a gate blew open. The farmer buried another goat with a split ear two days later. No one checked the ear before the burial; the gate was repaired after the first goat wandered back.', [
      { id: 'openBurial', label: 'Check the shallow grave in daylight', next: 'goatBurial' },
      { id: 'showTally', label: 'Show the farmer the feed tally', next: 'goatAfter', effects: { historyFlags: ['resolved_goat_identity_with_feed_tally'] } },
      { id: 'askNeighbor', label: 'Ask the neighbor about the loose goat', next: 'goatAfter', effects: { historyFlags: ['resolved_goat_identity_with_neighbor_account'] } },
    ]),
    goatBurial: scene('goatBurial', 'An Empty Shallow Grave', 'The grave is empty. The farmer admits the lid was never weighted; a scavenger may have dragged the carcass away, or someone moved it. The living goat’s ears match neither the buried animal nor the missing one.', [
      { id: 'closeGrave', label: 'Close the grave and mend the gate', next: 'goatAfter', effects: { historyFlags: ['helped a farmer resolve a repeated-goat death through ear marks and a feed tally', 'closed_goat_grave_and_checked_gate'] } },
      { id: 'leaveGrave', label: 'Leave the grave for the farmer to close', next: 'goatAfter', effects: { historyFlags: ['left_goat_grave_for_farmer_to_close'] } },
      { id: 'claimMiracle', label: 'Tell the farmer the goat returned', next: 'goatAfter', effects: { historyFlags: ['called_living_goat_a_miracle'] } },
    ]),
    goatAfter: { ...end('goatAfter', 'Three Goats, One Story', 'The farmer counts three different goats: one wandered, one was buried, and the one before you was never missing. The empty grave remains unexplained, but the gate is fixed and the living animals are counted.'), textVariants: [
      { requirements: { historyFlags: ['left_goat_identity_unresolved'] }, text: 'You leave the farmer with the tally and the marked goats but do not settle which animal was buried. The gate remains repaired from the earlier escape; the empty grave and the repeated-death story remain unresolved.' },
      { requirements: { historyFlags: ['resolved_goat_identity_with_feed_tally'] }, text: 'You show the stable book beside the ear marks. The farmer can separate the goat that wandered from the one buried and the living animal that was never missing; the empty grave still has no certain explanation.' },
      { requirements: { historyFlags: ['resolved_goat_identity_with_neighbor_account'] }, text: 'The neighbor recalls the loose gray goat coming back after the gate blew open. The farmer compares that account with the ear marks and feed tally: three animals, not one returning from the dead. The empty grave remains unexplained.' },
      { requirements: { historyFlags: ['closed_goat_grave_and_checked_gate'] }, text: 'You close the shallow grave and check the repaired gate with the farmer. The ear marks and feed tally separate the three goats; no one claims to know what happened to the body.' },
      { requirements: { historyFlags: ['left_goat_grave_for_farmer_to_close'] }, text: 'You leave the grave for the farmer to close. The earlier gate repair still holds, and the ear marks and tally distinguish the three goats; what happened to the body remains uncertain.' },
      { requirements: { historyFlags: ['called_living_goat_a_miracle'] }, text: 'You tell the farmer the goat returned. The ear marks and feed tally still point to three different animals, though the empty grave keeps part of the story unsettled.' },
    ] },
    goatLeave: end('goatLeave', 'A Tale Left at the Farm', 'You leave the farmer with the living goat and the story of its two deaths. The gate is still mended, and no animal is in immediate danger.'),
  },
};

export const THE_WIDOWS_BEAST: Scenario = {
  id: 'the-widows-beast', title: 'The Widow’s Beast', subtitle: 'A creature circles one house but never approaches the widow herself.', startScene: 'widowYard',
  diversity: meta({ hook: 'A widow protects a wary wolfdog she once fed; the alleged beast is also driving a real predator from her yard.', activity: 'social interaction', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'rural homestead', fantasy: 'AMBIGUOUS', combat: 'AVOIDABLE', structure: 'conflicting motives and voluntary coexistence' }),
  scenes: {
    widowYard: scene('widowYard', 'A Shape by the Fence', 'A widow asks you to look at a large shape circling her yard after dark. It has never entered the house or threatened her. Neighbors want it driven away because their sheep are nervous; a broken fence opens toward the woods.', [
      { id: 'askWidowBehavior', label: 'Ask when the shape comes near', next: 'widowAccount', effects: { knowledge: ['A large animal circled a widow’s yard but never crossed her house threshold.'] } },
      { id: 'inspectFence', label: 'Inspect the fence and tracks', next: 'widowTracks' },
      { id: 'declineBeast', label: 'Refuse to hunt without evidence', next: 'widowLeave', effects: { historyFlags: ['refused to hunt a creature protecting a widow without evidence'] } },
    ]),
    widowAccount: scene('widowAccount', 'Food Left at the Steps', 'The widow says she left scraps outside after a hard winter. The animal now waits beyond the yard fence. She does not want it fed indoors, and does not know whether it has killed any sheep.', [
      { id: 'watchFromWindow', label: 'Watch the yard from inside', next: 'widowWatch' },
      { id: 'askNeighborLoss', label: 'Ask the neighbors what they lost', next: 'widowNeighbors' },
      { id: 'askWidowStopFeeding', label: 'Help her stop leaving food outside', next: 'widowAfter' },
    ]),
    widowTracks: scene('widowTracks', 'Two Sets of Tracks', 'One broad set circles the house and ends at the broken fence. Smaller prints enter the sheep pen and turn back toward the woods. The large animal has not entered the pen; the smaller predator may have.', [
      { id: 'repairFence', label: 'Help close the broken fence', next: 'widowAfter', effects: { historyFlags: ['repaired a widow’s fence after separating two animal trails'] } },
      { id: 'watchTracks', label: 'Watch the yard from the tree line', next: 'widowWatch' },
      { id: 'tellNeighbors', label: 'Show the neighbors both trails', next: 'widowNeighbors' },
    ]),
    widowWatch: scene('widowWatch', 'A Dog at the Boundary', 'At dusk a gray wolfdog comes to the fence and stays outside. It looks toward the woods whenever the sheep move. A smaller animal approaches the pen, then turns away when the dog growls. The widow watches from her doorway.', [
      { id: 'leaveDogRoom', label: 'Leave the dog room to retreat', next: 'widowAfter', effects: { knowledge: ['A wolfdog circled a widow’s home and drove a smaller predator from the sheep pen.'] } },
      { id: 'closeYardGate', label: 'Close the yard gate and protect the sheep', next: 'widowAfter' },
      { id: 'driveDog', label: 'Drive the dog from the fence', hint: 'It is wary and has not entered the yard; cornering it may provoke a bite.', chance: { probability: 0.56, successNext: 'widowAfter', failureNext: 'widowBite', successMessage: 'The dog backs toward the woods without turning on you.', failureMessage: 'The dog snaps when you block its retreat.', failureEffects: { health: -3 } } },
    ]),
    widowNeighbors: scene('widowNeighbors', 'A Lost Lamb', 'The neighbors lost one lamb, but the tracks lead through the broken fence in both directions. They agree to mend the fence before deciding which animal was responsible. The widow asks that the dog not be chased into the woods.', [
      { id: 'mediateFence', label: 'Help the neighbors mend the shared fence', next: 'widowAfter', effects: { historyFlags: ['helped neighbors postpone blame and repair a shared fence'] } },
      { id: 'leaveDispute', label: 'Leave the neighbors to decide', next: 'widowLeave' },
      { id: 'organizeWatch', label: 'Arrange a watch from the road', next: 'widowWatch' },
    ]),
    widowAfter: end('widowAfter', 'A Boundary Kept', 'The neighbors repair the fence and the widow stops leaving food on the steps. The wolfdog remains outside the yard, free to leave. Its presence may have protected the sheep, but the lamb’s loss is still uncertain.'),
    widowLeave: end('widowLeave', 'A Hunt Not Taken', 'You leave without driving the animal away. The widow keeps to the house and the neighbors keep their sheep behind the damaged fence until they decide what to do.'),
    widowBite: end('widowBite', 'A Dog’s Warning', 'The wolfdog bites once, then slips through the fence toward the woods. The widow closes the gate; the animal had not crossed into her yard before you blocked its escape.'),
  },
};

export const THE_CELLAR_THING: Scenario = {
  id: 'the-cellar-thing', title: 'The Cellar Thing', subtitle: 'Scratching beneath a boarding house comes from a sealed coal passage.', startScene: 'cellarBoards',
  diversity: meta({ hook: 'A cellar sound imitates scratching because an abandoned coal passage carries noise from a person trapped outside the house.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'boarding house cellar', fantasy: 'AMBIGUOUS', combat: 'AVOIDABLE', structure: 'sound localization and exterior route' }),
  scenes: {
    cellarBoards: scene('cellarBoards', 'Scratching under the Floor', 'Guests hear scratching below a boarding house cellar. The keeper has nailed boards over a coal chute; dust falls from the seam whenever the sound comes. No one has heard a voice, and the house has a back stair leading outside.', [
      { id: 'listenAtSeam', label: 'Listen at the boarded coal chute', next: 'cellarSound' },
      { id: 'inspectOutsideWall', label: 'Inspect the outside cellar wall', next: 'cellarExterior' },
      { id: 'leaveCellar', label: 'Ask the keeper to keep the door shut', next: 'cellarClosed' },
    ], 'warning'),
    cellarSound: scene('cellarSound', 'A Sound from Beyond the Wall', 'The scraping stops when you move across the cellar, then returns from the far side of the chute. A faint cough follows it. The boards are sound; the sound seems to come from outside the foundation.', [
      { id: 'openBackStair', label: 'Go outside and check the foundation', next: 'cellarExterior' },
      { id: 'callThroughBoards', label: 'Call through the coal chute', next: 'cellarVoice' },
      { id: 'removeBoards', label: 'Pull away the nailed boards', hint: 'The boards may give way toward a narrow, unstable passage.', next: 'cellarPassage' },
    ]),
    cellarExterior: scene('cellarExterior', 'A Coal Door in the Earth', 'Outside, a low coal passage runs beneath the back wall and ends at a collapsed grate. Fresh boot marks stop at the grate. The passage is too narrow to enter standing; the house remains above firm ground.', [
      { id: 'callGrate', label: 'Call through the collapsed grate', next: 'cellarVoice' },
      { id: 'liftGrate', label: 'Lift the loose grate from outside', next: 'cellarPassage' },
      { id: 'fetchKeeper', label: 'Fetch the keeper and a lantern', next: 'cellarRescue' },
    ]),
    cellarVoice: scene('cellarVoice', 'A Person Answers', 'A coal seller answers from beyond the grate. He entered through a low service opening and became trapped when loose earth blocked the return. The scratching was his buckle against stone; he has not been underground overnight.', [
      { id: 'clearGrate', label: 'Clear the grate from outside', next: 'cellarRescue' },
      { id: 'sendForCrew', label: 'Bring the keeper and a second helper', next: 'cellarRescue' },
      { id: 'enterPassage', label: 'Crawl into the passage alone', hint: 'Loose earth is already blocking the passage.', chance: { probability: 0.42, successNext: 'cellarRescue', failureNext: 'cellarInjury', successMessage: 'You reach the seller and guide him toward the grate.', failureMessage: 'The passage slumps and pins your leg.', failureEffects: { health: -4 } } },
    ]),
    cellarPassage: scene('cellarPassage', 'The Coal Seller’s Route', 'The boards open onto a narrow coal passage. The seller is visible beyond a fallen basket, and the return grate is partly blocked with earth. The keeper stands at the cellar stair with a lantern; the house above has not shifted.', [
      { id: 'guideSellerOut', label: 'Guide the seller toward the cellar stair', next: 'cellarRescue' },
      { id: 'backOutCellar', label: 'Back out and clear the grate outside', next: 'cellarRescue' },
      { id: 'pushEarth', label: 'Push through the loose earth', hint: 'The ceiling is soft and the passage is narrow.', chance: { probability: 0.51, successNext: 'cellarRescue', failureNext: 'cellarInjury', successMessage: 'The earth shifts enough for the seller to crawl through.', failureMessage: 'The low ceiling drops soil across your shoulder.', failureEffects: { health: -4 } } },
    ], 'warning'),
    cellarRescue: end('cellarRescue', 'The Scratching Stops', 'The coal seller reaches the yard and the keeper boards the old service opening. The sound had a human cause, but the passage is still unsafe and will be filled before the house is used again.'),
    cellarClosed: end('cellarClosed', 'A Door Kept Shut', 'The keeper keeps guests away from the cellar and sends for a mason in daylight. The scratching continues once after you leave; no one enters the boarded chute alone.'),
    cellarInjury: end('cellarInjury', 'A Narrow Escape', 'The keeper and seller pull you back before the passage closes. Your leg is bruised, and the keeper boards the chute until a mason can fill it safely.'),
  },
};

export const THE_MAN_WHO_SHEDS_HIS_SKIN: Scenario = {
  id: 'the-man-who-sheds-his-skin', title: 'The Man Who Sheds His Skin', subtitle: 'The same traveler is described in two towns, with one detail changed each time.', startScene: 'identityClaim',
  diversity: meta({ hook: 'A supposed shapeshifter is tracked through costume changes and a shared laundry mark, then confronted without presuming a supernatural cause.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'HIGH', setting: 'road and inn', fantasy: 'AMBIGUOUS', combat: 'POSSIBLE', structure: 'identity comparison and pursuit' }),
  scenes: {
    identityClaim: scene('identityClaim', 'A Different Coat at Every Stop', 'At an inn, two residents claim the same man visited their towns on one day. One describes a red coat and a scar; the other saw a gray coat and a smooth face. Both mention a missing brass button. A coach road connects the towns.', [
      { id: 'compareDetails', label: 'Compare the descriptions point by point', next: 'identityEvidence', effects: { knowledge: ['Witnesses describing the supposed shapeshifter both noticed a missing brass button.'] } },
      { id: 'askLaundry', label: 'Ask who repaired the coats', next: 'laundryMark' },
      { id: 'leaveClaim', label: 'Leave the account untested', next: 'identityLeft' },
    ]),
    identityEvidence: scene('identityEvidence', 'The Button in Common', 'The witnesses disagree on height and face but agree the brass button sat at the left cuff. The innkeeper says a traveling tailor repaired two coats at the coach stop. No one saw a body change.', [
      { id: 'findTailor', label: 'Ask the coach stop for the tailor', next: 'tailorFound' },
      { id: 'followCoachRoad', label: 'Follow the coach road to the next stop', next: 'coachTracks' },
      { id: 'warnResidents', label: 'Warn both towns without naming a cause', next: 'identityLeft' },
    ]),
    laundryMark: scene('laundryMark', 'A Mark inside the Collar', 'A laundress remembers two coats with the same stitched mark inside the collar. She returned one coat to a traveler and kept the other for a missing cousin. The two men may be related, but their present whereabouts are unknown.', [
      { id: 'searchCoachStop', label: 'Search for the traveler at the coach stop', next: 'tailorFound' },
      { id: 'askForCousin', label: 'Ask the laundress to contact her cousin', next: 'identityAfter' },
      { id: 'leaveLaundry', label: 'Let the laundress make contact privately', next: 'identityLeft' },
    ]),
    coachTracks: scene('coachTracks', 'A Coat in the Luggage Rack', 'A coach driver remembers one passenger changing coats at a roadside stop after rain. A damp gray coat remains in the rack, its cuff missing the same brass button. The passenger walked toward a repair shed.', [
      { id: 'goRepairShed', label: 'Go to the repair shed in daylight', next: 'tailorFound' },
      { id: 'returnCoat', label: 'Return the coat to the driver', next: 'identityAfter' },
      { id: 'chaseAtDusk', label: 'Chase the passenger into the brush', hint: 'You have no clear view of who is ahead.', chance: { probability: 0.43, successNext: 'tailorFound', failureNext: 'identityInjury', successMessage: 'You reach the shed and find the passenger there.', failureMessage: 'You fall on the wet roadside while the passenger escapes.', failureEffects: { health: -2 } } },
    ]),
    tailorFound: scene('tailorFound', 'Two Brothers, Two Coats', 'The tailor admits the missing-button coats belong to twin brothers who travel separately. One wore a scarf over a burn scar; the other had no scar. They changed coats after one was mistaken for a debtor. Neither transformed, though both let the rumor grow.', [
      { id: 'askBrothersSettle', label: 'Ask the tailor to send each brother a message', next: 'identityAfter', effects: { knowledge: ['The apparent shapeshifter was two twin brothers who traded coats to avoid a debt collector.'] } },
      { id: 'exposeRumor', label: 'Tell the innkeeper what the coats show', next: 'identityAfter', effects: { historyFlags: ['resolved a shapeshifter rumor by tracing two matching coats'] } },
      { id: 'letRumorStand', label: 'Keep the brothers’ reason private', next: 'identityAfter' },
    ]),
    identityAfter: end('identityAfter', 'No Change of Skin', 'The towns receive an account of two brothers and their exchanged coats. The debt dispute is not settled, but the shapeshifter rumor has a human explanation; the brothers’ reasons remain theirs.'),
    identityLeft: end('identityLeft', 'A Story Between Towns', 'You leave the claim unresolved. The residents keep their separate accounts, and no one is accused without proof.'),
    identityInjury: end('identityInjury', 'The Roadside Fall', 'You bruise your knee in the wet brush and lose the passenger’s trail. The coat and the two accounts remain at the coach stop.'),
  },
};

export const THE_PALE_CHILDREN_OF_THE_QUARRY: Scenario = {
  id: 'the-pale-children-of-the-quarry', title: 'The Pale Children of the Quarry', subtitle: 'Small pale figures watch from unused cuts, but no children are missing.', startScene: 'quarryReport',
  diversity: meta({ hook: 'Pale quarry watchers are adult night workers in dust masks, whose hidden shift protects a dangerous informal shelter.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'quarry', fantasy: 'EERIE', combat: 'NONE', structure: 'viewpoint reconnaissance and respectful discovery' }),
  scenes: {
    quarryReport: scene('quarryReport', 'Small Figures on the Cut', 'Quarry workers report pale figures watching from an unused cut after dark. No children are missing from the settlement. The upper rim is fenced; a safe service road descends to the lower bench.', [
      { id: 'askQuarryCrew', label: 'Ask the crew which cut they saw', next: 'quarryView' },
      { id: 'walkServiceRoad', label: 'Take the marked service road', next: 'quarryBench' },
      { id: 'leaveQuarry', label: 'Ask the foreman to close the cut', next: 'quarryClosed' },
    ]),
    quarryView: scene('quarryView', 'Chalk on the Stone', 'From the safe rim, the figures appear knee-high. A chalk line crosses the wall at the same height as an adult’s shoulder on the lower bench. Their pale faces turn away whenever a lantern points toward them.', [
      { id: 'dimLantern', label: 'Keep the lantern low and descend', next: 'quarryBench' },
      { id: 'callAcross', label: 'Call from the fenced rim', next: 'quarryAnswer' },
      { id: 'recordShapes', label: 'Record the shapes and report them', next: 'quarryClosed', effects: { knowledge: ['Pale figures in the quarry appeared small from the upper rim; a chalk line showed the viewpoint was misleading.'] } },
    ]),
    quarryBench: scene('quarryBench', 'The Lower Bench', 'From the lower service road the pale figures are full height. They wear cloth dust masks and quarry coats. A lantern is covered, and a small fire burns behind a stack of stone away from the cut edge.', [
      { id: 'announceYourself', label: 'Announce yourself from the road', next: 'quarryWorkers' },
      { id: 'leaveFood', label: 'Leave food at the road and withdraw', next: 'quarryAfter' },
      { id: 'approachStack', label: 'Approach the stone stack unseen', hint: 'Loose quarry stone can shift beneath your feet.', chance: { probability: 0.47, successNext: 'quarryWorkers', failureNext: 'quarryInjury', successMessage: 'You reach the stack without disturbing the stone.', failureMessage: 'A loose stone rolls under your boot.', failureEffects: { health: -3 } } },
    ], 'warning'),
    quarryAnswer: scene('quarryAnswer', 'A Worker Answers', 'A person calls back from below and asks you not to alert the foreman. Three quarry hands sleep near the lower bench between shifts; their dust masks made them look small from the rim. They are hiding because their shift was not entered in the company book.', [
      { id: 'askAboutSafety', label: 'Ask whether the lower bench is safe', next: 'quarryWorkers' },
      { id: 'leaveThemPrivate', label: 'Leave without naming the workers', next: 'quarryAfter', effects: { historyFlags: ['respected quarry workers’ privacy after verifying the pale figures'] } },
      { id: 'tellForeman', label: 'Tell the foreman where they are', next: 'quarryAfter' },
    ]),
    quarryWorkers: scene('quarryWorkers', 'Three Workers at Rest', 'The workers explain the false child-shapes and show you the stable lower road they use. One cut is unsafe because a warning rope was moved, not because anything lives there. They ask you to tell the foreman about the rope without naming who slept below.', [
      { id: 'reportRope', label: 'Report the moved warning rope', next: 'quarryAfter', effects: { knowledge: ['Pale quarry figures were workers in dust masks; the real hazard was a moved warning rope above an unsafe cut.'] } },
      { id: 'keepSecret', label: 'Keep their shelter location private', next: 'quarryAfter', effects: { historyFlags: ['protected quarry workers’ shelter while reporting an unsafe cut'] } },
      { id: 'returnToRim', label: 'Return to the safe road', next: 'quarryAfter' },
    ]),
    quarryAfter: end('quarryAfter', 'The Cut Closed', 'The unsafe cut is closed and the warning rope restored. The foreman does not learn who used the lower bench; the pale watchers were people, and the quarry’s danger remains ordinary but serious.'),
    quarryClosed: end('quarryClosed', 'The Rim Kept Clear', 'The foreman closes the upper path until daylight. No children are missing, and no one enters the quarry after dark.'),
    quarryInjury: end('quarryInjury', 'Stone underfoot', 'A loose stone bruises your ankle. The workers help you back to the service road, and the foreman closes the lower cut until the footing is cleared.'),
  },
};

export const THE_ANTLERED_THING: Scenario = {
  id: 'the-antlered-thing', title: 'The Antlered Thing', subtitle: 'A branch-crowned presence builds arches from fallen wood around its territory.', startScene: 'forestMarks',
  diversity: meta({ hook: 'An original forest entity builds branch arches along a territory and attacks only when people cross its marked line.', activity: 'survival', role: 'accidental participant', tone: 'tense/dangerous', risk: 'SEVERE', setting: 'forest wilderness', fantasy: 'FANTASY_THREAT', combat: 'AVOIDABLE', structure: 'territorial boundary and evacuation' }),
  scenes: {
    forestMarks: scene('forestMarks', 'Scratches above the Deer Line', 'A road crew finds bark scraped high above any deer and two carcasses hung in a forked tree. Fallen branches form an arch across the old trail. The crew has a safe path back to the road; one worker went beyond the arch and has not answered.', [
      { id: 'studyArch', label: 'Study the branch arch from the road side', next: 'forestBoundary', effects: { knowledge: ['The Antlered Thing marked a forest boundary with branch arches and attacked beyond that line.'] } },
      { id: 'callWorker', label: 'Call the missing worker from outside', next: 'workerAnswer' },
      { id: 'leaveForest', label: 'Lead the crew back to the road', next: 'forestEvacuated' },
    ], 'warning'),
    forestBoundary: scene('forestBoundary', 'A Line of Broken Wood', 'The arch is built from freshly broken limbs, all pointing inward. Beyond it the branches are stripped high on the trunks. No blood or drag marks lead back. The worker’s hat lies just past the arch; the trail out is clear.', [
      { id: 'throwHatBack', label: 'Pull the hat back without crossing', next: 'workerAnswer' },
      { id: 'markBoundary', label: 'Mark the trail and retreat', next: 'forestEvacuated', effects: { historyFlags: ['marked a forest boundary and evacuated a work crew'] } },
      { id: 'crossArch', label: 'Cross the arch to search', hint: 'The branches are a deliberate boundary; something has marked the ground beyond.', chance: { probability: 0.31, successNext: 'workerAnswer', failureNext: 'antlerAttack', successMessage: 'You cross quietly and hear the worker answer.', failureMessage: 'The arch shudders, and something strikes from above.', failureEffects: { health: -5 } } },
    ]),
    workerAnswer: scene('workerAnswer', 'A Voice beyond the Arch', 'The worker answers from behind a fallen trunk, alive but afraid to cross back. The branch-crowned shape moves between trees above him. It has not crossed the arch toward the crew; the open road is behind you.', [
      { id: 'callWorkerBack', label: 'Call the worker along the clear trail', next: 'workerOut' },
      { id: 'leaveWorker', label: 'Keep the crew back and seek help', next: 'forestEvacuated', effects: { setFlags: ['heardWorkerBeyondArch'] } },
      { id: 'approachCreature', label: 'Approach the antlered shape', hint: 'It is above the trail and has already struck once.', chance: { probability: 0.2, successNext: 'workerOut', failureNext: 'antlerFatal', successMessage: 'It withdraws into the higher branches.', failureMessage: 'It drops from the tree before you can turn.', failureEffects: { health: -10 } } },
    ], 'danger'),
    workerOut: scene('workerOut', 'Back beyond the Branches', 'The worker reaches the road side of the arch. The shape remains above the marked trail, watching but not pursuing. The road crew can abandon this stretch or cut a new path around the boundary.', [
      { id: 'abandonForestRoad', label: 'Abandon the trail and leave', next: 'forestEvacuated', effects: { historyFlags: ['evacuated a worker from the Antlered Thing’s marked territory'] } },
      { id: 'cutDetour', label: 'Mark a detour around the trees', next: 'forestDetour', effects: { knowledge: ['The Antlered Thing stayed within the branch-arch territory and did not pursue travelers onto the road.'] } },
    ]),
    forestDetour: end('forestDetour', 'A Road around the Territory', 'The crew marks a detour and leaves the branch arches untouched. The missing worker is safe; the entity keeps its territory, and no one treats the forest as cleared.'),
    forestEvacuated: { ...end('forestEvacuated', 'The Trail Abandoned', 'The road crew leaves the marked forest. The worker’s fate is not confirmed; the branch arches remain, and the road is closed until a larger party can assess the area.'), textVariants: [{ requirements: { flags: ['heardWorkerBeyondArch'] }, text: 'The worker’s voice remains beyond the branch arch, alive but unwilling to cross while the shape watches. The crew leaves for trained help; the trail is closed until a larger party can return.' }] },
    antlerAttack: end('antlerAttack', 'The Arch Answers', 'A branch-thick limb strikes you from above. The crew pulls you to the road; the missing worker remains beyond the boundary.'),
    antlerFatal: end('antlerFatal', 'Under the Crowned Branches', 'The antlered shape drops from the trees and pins you beyond the arch. The crew retreats without crossing the marked line again.', 'death'),
  },
};

export const THE_LAST_TRAP: Scenario = {
  id: 'the-last-trap', title: 'The Last Trap', subtitle: 'A trapper’s final plan may be more dangerous than the creature he hunts.', startScene: 'trapperCamp',
  diversity: meta({ hook: 'A trapper plans to use himself as bait; the player must decide whether to protect him, stop him, or share the risk.', activity: 'social interaction', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'forest camp', fantasy: 'AMBIGUOUS', combat: 'POSSIBLE', structure: 'dispute with hunter obsession and competing plans' }),
  scenes: {
    trapperCamp: scene('trapperCamp', 'One Trap Left', 'A trapper asks for help setting one last trap for a creature that has taken his dogs and sprung every steel jaw. His final plan uses his own bedroll as bait. A clear ridge path leads back to camp; the traps are visible in the brush.', [
      { id: 'inspectOldTraps', label: 'Inspect the sprung traps', next: 'trapEvidence', effects: { knowledge: ['A trapper’s animal avoids steel traps and circles bedrolls downwind.'] } },
      { id: 'questionPlan', label: 'Ask why he plans to use himself as bait', next: 'trapperArgument' },
      { id: 'leaveTrapper', label: 'Refuse the hunt and return to the road', next: 'trapLeft' },
    ], 'warning'),
    trapEvidence: scene('trapEvidence', 'A Turn around the Wire', 'The traps are sprung from the far side, as if the animal circled them downwind. One set of tracks continues toward a den; another set belongs to the trapper’s dogs and turns back. The bedroll sits in the animal’s path.', [
      { id: 'moveBedroll', label: 'Move the bedroll to the open ridge', next: 'trapperPlan' },
      { id: 'followDenTracks', label: 'Follow the animal tracks only to the ridge', next: 'denBoundary' },
      { id: 'disableTrap', label: 'Disable the traps and stop the setup', next: 'trapperArgument', effects: { historyFlags: ['stopped a trapper from using himself as bait'] } },
    ]),
    trapperArgument: scene('trapperArgument', 'The Trapper Will Not Wait', 'The trapper says the animal has taken his dogs and he cannot bear another night of waiting. His bedroll is already placed beside the den path. He will listen, but he is reaching for the trap chain.', [
      { id: 'offerTwoPersonWatch', label: 'Offer a watch from the ridge', next: 'trapperPlan' },
      { id: 'takeChain', label: 'Take the chain and disable the trap', next: 'trapperStopped' },
      { id: 'walkAwayTrap', label: 'Leave him to his own choice', next: 'trapLeft' },
    ], 'warning'),
    trapperPlan: scene('trapperPlan', 'The Den beyond the Ridge', 'From the ridge, you see a young animal at the den mouth. The trapper’s missing dogs are tied behind a fallen log, alive but wary. The adult creature watches from cover; it is guarding its young, not hunting the camp.', [
      { id: 'freeDogs', label: 'Free the dogs and retreat together', next: 'trapResolved', effects: { knowledge: ['The trapper’s quarry was guarding young at a den; it avoided people who stayed beyond the ridge.'] } },
      { id: 'backTrapperAway', label: 'Lead the trapper away from the den', next: 'trapperStopped' },
      { id: 'approachDen', label: 'Approach the adult creature', hint: 'It is guarding young and has a clear route toward you.', chance: { probability: 0.26, successNext: 'trapResolved', failureNext: 'trapFatal', successMessage: 'The creature retreats with its young deeper into cover.', failureMessage: 'It charges when you enter the den boundary.', successEffects: { health: -3 }, failureEffects: { health: -10 } } },
    ], 'danger'),
    denBoundary: scene('denBoundary', 'A Den under the Roots', 'A young animal lies under the roots, alive. The adult’s tracks circle the den and point away from camp. The trapper is behind you, close enough to hear but not yet in sight of the young.', [
      { id: 'signalTrapperBack', label: 'Signal the trapper to stay back', next: 'trapperStopped' },
      { id: 'withdrawDen', label: 'Withdraw without disturbing the den', next: 'trapResolved' },
      { id: 'takeYoung', label: 'Take the young animal as bait', hint: 'The adult is guarding it. This will likely provoke a lethal charge.', next: 'trapFatal', effects: { health: -10 } },
    ], 'danger'),
    trapperStopped: end('trapperStopped', 'The Trap Disarmed', 'The trapper disarms the wire and leaves the den alone. His dogs are recovered from the ridge; he is angry that the hunt ended, but he no longer plans to use himself or the young animal as bait.'),
    trapResolved: end('trapResolved', 'A Hunt Called Off', 'The dogs return with the trapper and the den is left undisturbed. He agrees to abandon this ground until the young animal has left. No creature is killed, and the traps are taken down.'),
    trapLeft: end('trapLeft', 'The Last Trap Left Behind', 'You leave before the trapper sets his bedroll. You do not know whether he followed your warning; the den remains near the path, and the traps are still in his hands.'),
    trapFatal: end('trapFatal', 'At the Den', 'The adult creature strikes when you cross the den boundary. The trapper reaches the ridge too late to pull you away.', 'death'),
  },
};

export const MONSTER_HUNT_SECOND = [THE_MILLERS_BEAST, THE_ASHEN_MAN, THE_THING_BENEATH_THE_ICE, THE_GOAT_THAT_WOULDNT_STAY_DEAD, THE_WIDOWS_BEAST, THE_CELLAR_THING, THE_MAN_WHO_SHEDS_HIS_SKIN, THE_PALE_CHILDREN_OF_THE_QUARRY, THE_ANTLERED_THING, THE_LAST_TRAP];
