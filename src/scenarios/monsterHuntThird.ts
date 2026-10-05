import type { Scenario } from '../types';
import { huntEnd as end, huntMetadata as meta, huntScene as scene } from './monsterHuntTools';

export const THE_BROKEN_ANTLER: Scenario = {
  id: 'the-broken-antler', title: 'The Broken Antler', subtitle: 'An injured elk charges near a settlement whenever it is cornered.', startScene: 'antlerRoad',
  diversity: meta({ hook: 'A wounded elk is aggressive because a broken antler catches brush; clearing a broad escape lane can spare both animal and settlement.', activity: 'animals', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'MODERATE', setting: 'road and pasture', fantasy: 'NONE', combat: 'POSSIBLE', structure: 'animal welfare and escape corridor' }),
  scenes: {
    antlerRoad: scene('antlerRoad', 'The Animal at the Fence', 'A large elk stands near the settlement fence, breathing hard. One antler is broken and tangled in a wire loop. It has charged anyone who approached, but the field gate opens onto an empty hillside.', [
      { id: 'clearPeople', label: 'Move people back from the fence', next: 'elkSpace' },
      { id: 'inspectLoop', label: 'Inspect the wire from behind the gate', next: 'elkWire', effects: { knowledge: ['An injured elk charged when people crowded it; a broken antler was caught in a fence loop.'] } },
      { id: 'leaveElk', label: 'Keep away and call a wildlife handler', next: 'elkWaited' },
    ], 'warning'),
    elkSpace: scene('elkSpace', 'Room to Turn', 'The settlement clears the lane. The elk has more space but still cannot turn its head freely; the wire is caught in the broken antler, not around its neck. The open hillside is behind the animal.', [
      { id: 'openHillGate', label: 'Open the gate to the empty hillside', next: 'elkCorridor' },
      { id: 'useRopeFromFence', label: 'Reach for the wire with your rope', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, hint: 'The rope can pull the loose loop, not restrain the elk.', next: 'elkCorridor' },
      { id: 'approachWire', label: 'Approach the antler to free the wire', hint: 'The elk is injured and has charged before; keep an escape route.', chance: { probability: 0.47, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.13, successNext: 'elkFreed', failureNext: 'elkKick', successMessage: 'The loop slips free as the elk lowers its head.', failureMessage: 'The elk jerks its head and strikes you with the broken antler.', successEffects: { health: -1 }, failureEffects: { health: -4 } } },
    ], 'warning'),
    elkWire: scene('elkWire', 'Wire in the Antler', 'The wire loop is loose enough to move from outside the fence. The elk can back through the open hillside gate if the lane stays clear. No one needs to grab the antler itself.', [
      { id: 'openLane', label: 'Open the gate and clear the lane', next: 'elkCorridor' },
      { id: 'cutWire', label: 'Cut the loose wire from the fence', requirements: { items: ['smallKnife'] }, next: 'elkFreed', effects: { damageItems: ['smallKnife'] } },
      { id: 'waitHandler', label: 'Wait for a trained handler', next: 'elkWaited' },
    ]),
    elkCorridor: scene('elkCorridor', 'The Hill Path Open', 'The gate opens onto a broad slope away from houses. The elk steps toward it but the wire still catches the broken antler. You can clear the fence line from cover or let a handler approach from the hill side.', [
      { id: 'clearLoopFromCover', label: 'Pull the loop loose from behind the fence', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, next: 'elkFreed', effects: { damageItems: ['travelRope'] } },
      { id: 'waitWithSpace', label: 'Keep people back until help arrives', next: 'elkWaited' },
      { id: 'forceElkForward', label: 'Drive the elk through the gate', hint: 'It is frightened and could charge into the lane.', chance: { probability: 0.53, successNext: 'elkFreed', failureNext: 'elkKick', successMessage: 'The elk backs through the gate onto the open hill.', failureMessage: 'It wheels toward the fence and strikes out.', successEffects: { health: -1 }, failureEffects: { health: -4 } } },
    ]),
    elkFreed: end('elkFreed', 'The Hill Takes the Elk', 'The wire comes free and the elk walks uphill, favoring its injured antler. The settlement keeps the gate closed and calls a handler to assess the injury; no one tries to treat a wild animal by hand.'),
    elkWaited: end('elkWaited', 'A Handler Takes Over', 'People remain behind the fence until a trained handler arrives. The elk is not pursued; the broken antler and wire are left for someone equipped to separate them safely.'),
    elkKick: end('elkKick', 'A Hard Warning', 'The elk strikes your shoulder before moving through the open gate. The settlement keeps clear while a handler checks both the animal and your injury.'),
  },
};

export const THE_MAN_EATER_OF_MILLERS_GAP: Scenario = {
  id: 'the-man-eater-of-millers-gap', title: 'The Man-Eater of Miller’s Gap', subtitle: 'A large predator has learned to hunt livestock beside the narrow pass.', startScene: 'gapWarning',
  diversity: meta({ hook: 'A grounded cougar uses the pass’s blind bend and livestock trail; a planned withdrawal route matters as much as the hunt.', activity: 'combat/defense', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'SEVERE', setting: 'mountain pass', fantasy: 'NONE', combat: 'LIKELY', structure: 'planned ambush with explicit retreat route' }),
  scenes: {
    gapWarning: scene('gapWarning', 'A Pass Closed at Dusk', 'A drover has been mauled at Miller’s Gap, and two sheep are missing. Fresh tracks show a large cat follows the flock trail to a blind bend. The pass narrows between rock and a steep drop; a marked return path climbs behind you.', [
      { id: 'askDrover', label: 'Ask where the cat was last seen', next: 'catTracks', effects: { knowledge: ['A large cat at Miller’s Gap follows livestock along the blind bend before dusk.'] } },
      { id: 'moveSheep', label: 'Move the remaining sheep to the upper pen', next: 'sheepMoved' },
      { id: 'declineCatHunt', label: 'Close the pass and leave the hunt', next: 'gapClosed', effects: { historyFlags: ['closed a pass rather than hunt a large predator without a party'] } },
    ], 'danger'),
    catTracks: scene('catTracks', 'The Blind Bend', 'The cat’s prints cross the sheep trail and vanish above the rock wall. A dragged wool tuft points toward a ledge, not down the drop. The return path is clear; the drover offers a lantern and a warning bell but will not enter the gap.', [
      { id: 'markLedge', label: 'Mark the ledge and withdraw', next: 'gapClosed', effects: { knowledge: ['Tracks and dragged wool at Miller’s Gap point toward a ledge above the blind bend, but do not show whether the predator is still there.'] } },
      { id: 'setWarningBell', label: 'Set the bell at the upper pen', next: 'sheepMoved' },
      { id: 'enterBend', label: 'Enter the blind bend alone', hint: 'The tracks lead above the trail, and the drop leaves little room to escape.', chance: { probability: 0.28, successNext: 'catSeen', failureNext: 'catFatal', successMessage: 'You spot the cat before it drops from the ledge.', failureMessage: 'The cat lands behind you at the narrowest point.', failureEffects: { health: -10 } } },
    ], 'warning'),
    sheepMoved: scene('sheepMoved', 'A Pen above the Pass', 'The sheep are behind a stone pen above the gap. The bell is tied to the gate. No animal has approached since the flock moved. The tracks still point toward the ledge, but nothing shows whether the cat stayed there.', [
      { id: 'leavePassClosed', label: 'Keep the pass closed until daylight', next: 'gapClosed' },
      { id: 'watchFromRock', label: 'Watch from the broad upper rock', next: 'catSeen' },
      { id: 'followCatLedge', label: 'Follow the cat’s tracks along the ledge', hint: 'Loose gravel lies above a steep drop.', chance: { probability: 0.42, successNext: 'catSeen', failureNext: 'catFall', successMessage: 'You reach a broad ledge with a clear route back.', failureMessage: 'Gravel slides beneath your boot toward the drop.', failureEffects: { health: -5 } } },
    ]),
    catSeen: scene('catSeen', 'A Cat above the Trail', 'A mountain lion watches from the ledge, muscles low and still. It is a real predator and has taken livestock, but it has not attacked while you stay in the open. The marked retreat route remains behind the upper rock.', [
      { id: 'retreatLion', label: 'Withdraw and keep the pen secured', next: 'gapAfter', effects: { historyFlags: ['protected a flock from a mountain lion without pursuing it'] } },
      { id: 'ringBellLion', label: 'Ring the warning bell from cover', next: 'lionDriven' },
      { id: 'confrontLion', label: 'Confront the cat at the ledge', hint: 'It has attacked livestock and a drover; failure is likely fatal.', effects: { combat: { enemy: 'mountain lion', winChance: 0.2, damageOnWin: 4, damageOnLoss: 10, winNext: 'lionDriven', lossNext: 'catFatal' } } },
    ], 'danger'),
    lionDriven: end('lionDriven', 'The Pass Opens in Daylight', 'The bell carries through the gap and the cat withdraws uphill. The drover keeps the flock penned until daylight and calls an experienced hunter; the pass is not declared safe just because the animal has moved.'),
    gapAfter: end('gapAfter', 'A Pass Left Closed', 'The remaining sheep stay behind the upper wall. The drover marks the gap closed and sends for an experienced hunter. The cat has not been located, and the pass is no longer an easy path to the flock.'),
    gapClosed: end('gapClosed', 'The Hunt Can Wait', 'The drover closes Miller’s Gap and moves the flock uphill. No one enters the blind bend alone. The predator remains unlocated, but travelers are warned before they reach the narrow pass.'),
    catFall: end('catFall', 'Loose Gravel', 'You slide against the rock face and bruise your hip before the drover pulls you back. The flock stays penned. Tracks still lead above the pass, but the cat’s location remains unknown.'),
    catFatal: end('catFatal', 'The Narrow Bend', 'The predator strikes where the pass leaves no room to turn. The drover closes the route and does not send anyone after you.', 'death'),
  },
};

export const THE_CINDER_HOUND: Scenario = {
  id: 'the-cinder-hound', title: 'The Cinder Hound', subtitle: 'Warm pawprints appear only near places where a buried ember still burns.', startScene: 'ashPrints',
  diversity: meta({ hook: 'A supernatural hound returns to the unfinished fire that formed it; cooling the specific buried ember ends its route.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'HIGH', setting: 'burned woodland', fantasy: 'CONFIRMED_SUPERNATURAL', combat: 'AVOIDABLE', structure: 'heat trail to specific fire source' }),
  scenes: {
    ashPrints: scene('ashPrints', 'Prints Warm after Rain', 'A burned charcoal shed has been cold for days, yet warm pawprints appear around its ash pile after rain. The tracks lead to a second, older burn site uphill. A spring runs beside the path; the owner asks you to check whether another fire is starting.', [
      { id: 'tracePawprints', label: 'Follow the warm prints uphill', next: 'burnSite' },
      { id: 'checkShedAsh', label: 'Check the shed ash in daylight', next: 'buriedCoal' },
      { id: 'warnOwner', label: 'Warn the owner and leave', next: 'cinderWarned', effects: { historyFlags: ['warned a charcoal worker about warm pawprints near old burn sites'] } },
    ]),
    burnSite: scene('burnSite', 'A Hound in the Ash', 'A dog-shaped outline moves over the old burn site without bending the wet grass. It returns to a blackened stump and vanishes when the stump cools. The nearby spring is clear, and the downhill path remains open.', [
      { id: 'waitForReturn', label: 'Wait outside the burned ground', next: 'houndReturns', effects: { knowledge: ['The Cinder Hound returned to burn sites while a buried ember remained hot.'] } },
      { id: 'pourSpringWater', label: 'Carry spring water to the stump', next: 'emberQuenched' },
      { id: 'approachOutline', label: 'Approach the hound-shaped outline', hint: 'The ash is warm, and the shape disappears where the stump cools.', chance: { probability: 0.36, successNext: 'houndReturns', failureNext: 'cinderBurn', successMessage: 'The outline dissolves before you reach the stump.', failureMessage: 'Heat flares across the ash and burns your arm.', failureEffects: { health: -4 } } },
    ], 'warning'),
    buriedCoal: scene('buriedCoal', 'A Coal under the Ash', 'Beneath the wet top layer, one coal remains hot enough to glow. It is trapped under a charcoal beam; the beam is too heavy to lift by hand. Water from the nearby spring can reach it through the open side.', [
      { id: 'pourWaterCoal', label: 'Pour spring water through the side', next: 'emberQuenched', effects: { knowledge: ['The Cinder Hound faded when the last buried coal at its burn site was quenched.'] } },
      { id: 'turnBeam', label: 'Turn the beam with a pole', next: 'emberQuenched' },
      { id: 'leaveCoal', label: 'Mark the coal and keep away', next: 'cinderWarned' },
    ]),
    houndReturns: scene('houndReturns', 'A Track to the Last Coal', 'The outline returns to the stump, then fades over the hot coal beneath the beam. It never follows you beyond the burned ground. The spring remains within reach from the downhill side.', [
      { id: 'quenchLastCoal', label: 'Quench the coal from the downhill side', next: 'emberQuenched' },
      { id: 'leaveHoundSite', label: 'Leave and close the burn site', next: 'cinderWarned' },
      { id: 'touchCinderHound', label: 'Touch the warm outline', hint: 'It formed over live heat and has not approached the path.', next: 'cinderFatal', effects: { health: -10 } },
    ], 'warning'),
    emberQuenched: end('emberQuenched', 'The Ash Goes Cold', 'The last coal dims, and the hound outline vanishes with the heat. The owner closes the burned site until it can be cleared; no charm or salt was needed, only the unfinished ember that called it back.'),
    cinderWarned: end('cinderWarned', 'A Burn Site Marked', 'The owner marks the site and keeps workers away. The Cinder Hound has not followed anyone, but the buried coal remains hot and the prints may return.'),
    cinderBurn: end('cinderBurn', 'A Burn across the Arm', 'The heat catches your sleeve before you can pull back. The owner cools the burn and marks the site; the outline has faded, but the coal still glows beneath the beam.'),
    cinderFatal: end('cinderFatal', 'The Last Coal', 'The outline flares when touched. Heat closes over you before anyone can pull you from the burned ground.', 'death'),
  },
};

export const THE_THREE_TOED_TRACK: Scenario = {
  id: 'the-three-toed-track', title: 'The Three-Toed Track', subtitle: 'Farmers disagree wildly about the size of a creature whose prints share one shape.', startScene: 'trackReports',
  diversity: meta({ hook: 'Oversized tracks are a poacher’s three-pronged shoe used to conceal a sheep trail; witnesses disagree because they saw different impressions.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'farm road', fantasy: 'AMBIGUOUS', combat: 'AVOIDABLE', structure: 'contradictory witnesses and track comparison' }),
  scenes: {
    trackReports: scene('trackReports', 'A Track Too Large', 'Three-toed prints cross a farm lane. One farmer says they are as long as a boot; another says they are as wide as a dinner plate. Sheep are missing, but no one saw a creature. The muddy track turns toward a dry stone wall.', [
      { id: 'comparePrints', label: 'Measure prints at both accounts', next: 'trackCompare', effects: { knowledge: ['Reports of three-toed tracks differed because witnesses measured separate overlapping impressions.'] } },
      { id: 'askShepherd', label: 'Ask where the sheep were last seen', next: 'sheepPath' },
      { id: 'leaveTracks', label: 'Decline to follow the prints', next: 'tracksLeft' },
    ]),
    trackCompare: scene('trackCompare', 'Two Sizes, One Heel', 'The broad print is two overlapping impressions; the smaller one has a straight heel edge and three iron tips. The same pattern ends at a gap in the wall. Fresh sheep wool hangs on the far side.', [
      { id: 'followWallGap', label: 'Follow the wall gap from the road', next: 'poacherFound' },
      { id: 'showFarmer', label: 'Show both farmers the overlapping marks', next: 'trackAccount' },
      { id: 'avoidWallGap', label: 'Mark the gap and return to the farm', next: 'trackAccount' },
    ]),
    sheepPath: scene('sheepPath', 'Wool on the Wall', 'The shepherd last saw the flock near the same wall gap. A small cart track runs along its far side, but there is no sign of a struggle. The sheep may have been led, not taken by force.', [
      { id: 'checkCartTrack', label: 'Follow the cart track from the lane', next: 'poacherFound' },
      { id: 'questionNeighbor', label: 'Ask the neighbor about the wall gate', next: 'trackAccount' },
      { id: 'callForHelp', label: 'Call the shepherd and search together', next: 'poacherFound' },
    ]),
    trackAccount: scene('trackAccount', 'A Shoe Made to Mislead', 'A neighbor finds a three-pronged iron plate beside the wall. It fits a boot sole and leaves an exaggerated track. The neighbor admits making it to cover sheep moved through the gap, but says the sale was agreed with the flock owner.', [
      { id: 'checkAgreement', label: 'Ask the flock owner about the sale', next: 'poacherFound' },
      { id: 'returnPlate', label: 'Return the iron plate and leave', next: 'trackResolved' },
      { id: 'accuseTheft', label: 'Accuse the neighbor before checking', hint: 'The neighbor says the sheep were sold with permission.', next: 'trackArgument' },
    ]),
    poacherFound: scene('poacherFound', 'Sheep beyond the Wall', 'The missing sheep are in a neighboring pen. The three-toed plate was used to hide their route after a sale was disputed; the owner claims payment is still due. Both parties are present and unarmed.', [
      { id: 'compareSaleNote', label: 'Compare the sale note with the owner', next: 'trackResolved', effects: { historyFlags: ['resolved a disputed sheep sale after identifying false three-toed tracks'] } },
      { id: 'askForPayment', label: 'Ask the buyer to pay the agreed balance', next: 'trackResolved' },
      { id: 'leaveDispute', label: 'Leave the payment dispute to them', next: 'trackArgument' },
    ]),
    trackArgument: end('trackArgument', 'A Dispute Still Open', 'The sheep remain in the buyer’s pen and the payment is still disputed. You have shown the tracks were made by a boot plate, not a creature; the neighbors must settle the sale themselves.'),
    trackResolved: end('trackResolved', 'No Beast in the Mud', 'The sheep are accounted for and the sale terms are compared. The three-toed plate explains the strange prints, but whether the balance is owed depends on the note the neighbors hold.'),
    tracksLeft: end('tracksLeft', 'Prints Unfollowed', 'You leave the tracks by the wall. The sheep remain missing, and the reports still disagree about the size of whatever crossed the lane.'),
  },
};

export const THE_RED_MAW: Scenario = {
  id: 'the-red-maw', title: 'The Red Maw', subtitle: 'An old tunnel holds a creature whose feeding marks are unmistakable.', startScene: 'tunnelMouth',
  diversity: meta({ hook: 'A cavern predator guards a feeding chamber, but two exits and a decoy route let the traveler escape without killing it.', activity: 'survival', role: 'accidental participant', tone: 'tense/dangerous', risk: 'SEVERE', setting: 'old tunnel cavern', fantasy: 'DUNGEON_FANTASY', combat: 'AVOIDABLE', structure: 'reconnaissance, bait and alternate exits' }),
  scenes: {
    tunnelMouth: scene('tunnelMouth', 'The Red Scrape', 'A storm exposes an old tunnel in a hillside. Animal remains lie just inside, crushed rather than eaten. A red, wet mouth opens and closes in the dark. The entrance is stable, and a narrow side vent leads back to daylight.', [
      { id: 'markVent', label: 'Mark the side vent and retreat', next: 'tunnelRetreated', effects: { knowledge: ['The Red Maw feeds by crushing prey and guards the inner chamber; the side vent reaches daylight.'] } },
      { id: 'listenTunnel', label: 'Listen for movement before entering', next: 'tunnelEcho' },
      { id: 'refuseTunnel', label: 'Leave the tunnel to the owner', next: 'tunnelRetreated' },
    ], 'danger'),
    tunnelEcho: scene('tunnelEcho', 'A Second Passage', 'The creature scrapes stone from deeper inside. The side vent carries a draft and a strip of daylight. A wider passage leads toward the feeding chamber; no person is missing and no rescue requires entry.', [
      { id: 'inspectVent', label: 'Inspect the side vent from its mouth', next: 'ventRoute' },
      { id: 'setFoodBait', label: 'Leave food at the wider passage', next: 'baitRoute' },
      { id: 'enterFeedingChamber', label: 'Enter the chamber to face it', hint: 'The remains and crushing marks show lethal feeding behavior.', chance: { probability: 0.18, successNext: 'mawDeterred', failureNext: 'mawFatal', successMessage: 'The creature retreats into a fissure as the passage shakes.', failureMessage: 'The Red Maw rushes the narrow passage.', successEffects: { health: -4 }, failureEffects: { health: -10 } } },
    ], 'warning'),
    ventRoute: scene('ventRoute', 'Daylight through Stone', 'The side vent is narrow but firm, with a low ledge along one wall. It opens outside above the tunnel mouth. The creature’s scrape comes from the larger chamber and has not followed the draft.', [
      { id: 'crawlVent', label: 'Crawl through the vent and leave', next: 'tunnelEscaped', effects: { historyFlags: ['escaped a dungeon-fantasy predator without confronting it'] } },
      { id: 'markOtherExit', label: 'Mark the vent for future crews', next: 'tunnelRetreated' },
      { id: 'crawlTowardMaw', label: 'Crawl toward the sound instead', hint: 'The vent narrows toward the creature’s chamber.', next: 'mawFatal', effects: { health: -10 } },
    ]),
    baitRoute: scene('baitRoute', 'A Trail of Food', 'The creature follows the food to the wider passage and leaves the side vent clear. Its body scrapes along the stone, too broad for the vent. The entrance path remains open behind you.', [
      { id: 'leaveWhileMawFeeds', label: 'Use the clear vent to escape', next: 'tunnelEscaped' },
      { id: 'collapseLooseStones', label: 'Drop loose stones across the wide passage', next: 'mawDeterred' },
      { id: 'waitForCreature', label: 'Wait for it to finish feeding', next: 'tunnelRetreated' },
    ], 'warning'),
    tunnelEscaped: end('tunnelEscaped', 'Daylight beyond the Maw', 'You reach daylight through the side vent. The owner bars the tunnel mouth and marks the second exit for trained explorers. The Red Maw remains inside; survival, not a kill, was the objective.'),
    tunnelRetreated: end('tunnelRetreated', 'The Tunnel Sealed', 'You leave the tunnel and tell the owner where the side vent opens. The hillside entrance is marked dangerous; the creature remains below, and no one is sent in alone.'),
    mawDeterred: end('mawDeterred', 'A Passage Bought', 'Loose stones block the wider passage long enough for everyone to reach daylight. The Red Maw is delayed, not defeated; the tunnel remains closed.'),
    mawFatal: end('mawFatal', 'Inside the Red Maw’s Reach', 'The creature reaches the narrow passage before you can turn back. The entrance is sealed after the storm, and no one enters to recover what the tunnel keeps.', 'death'),
  },
};

export const THE_BEAST_AT_THE_TOLL_ROAD: Scenario = {
  id: 'the-beast-at-the-toll-road', title: 'The Beast at the Toll Road', subtitle: 'Something strikes loaded wagons at a narrow bend where the road has no shoulder.', startScene: 'tollPass',
  diversity: meta({ hook: 'A gang uses a chained hide-covered frame to fake a roadside beast while a real loose horse creates the collision danger.', activity: 'investigation/mystery', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'mountain road pass', fantasy: 'AMBIGUOUS', combat: 'POSSIBLE', structure: 'road geography and staged ambush exposure' }),
  scenes: {
    tollPass: scene('tollPass', 'The Narrow Bend', 'A wagon driver shows you a broken wheel where something struck from the brush. The road bends between a rock wall and a drop; there is no shoulder. Cargo sacks smell of grain, and a toll gate lies behind you.', [
      { id: 'inspectWheel', label: 'Inspect the wheel and roadside marks', next: 'passEvidence', effects: { knowledge: ['Wagons were struck at the toll bend where brush hides a chain and the road has no shoulder.'] } },
      { id: 'askTollKeeper', label: 'Ask the toll keeper about other wagons', next: 'tollAccount' },
      { id: 'avoidPass', label: 'Turn back to the wider road', next: 'tollRetreat' },
    ], 'warning'),
    passEvidence: scene('passEvidence', 'A Drag Mark in the Brush', 'The wheel was struck from the inside of the bend. A chain runs under the brush toward a hide-covered frame. Fresh hoofprints cross the road, separate from the chain; a loose horse may be nearby.', [
      { id: 'followChain', label: 'Follow the chain from the wall side', next: 'stagedBeast' },
      { id: 'findHorse', label: 'Look for the loose horse first', next: 'horseAtBend' },
      { id: 'warnDriver', label: 'Keep wagons at the toll gate', next: 'tollClosed' },
    ]),
    tollAccount: scene('tollAccount', 'A Pattern of Empty Sacks', 'The keeper says two wagons were struck and their grain sacks taken, but no driver saw a beast clearly. The next wagon is due before sunset. The road can be closed from the gate, though the detour adds half a day.', [
      { id: 'closeTollGate', label: 'Close the gate and warn the next wagon', next: 'tollClosed' },
      { id: 'inspectBrush', label: 'Inspect the bend with the driver', next: 'passEvidence' },
      { id: 'walkThroughPass', label: 'Walk the bend before another wagon arrives', next: 'horseAtBend' },
    ]),
    horseAtBend: scene('horseAtBend', 'A Frightened Horse', 'A loose horse stands in the brush, caught by a snagged lead rope. It shies toward the drop when approached. The toll road has no shoulder, but the horse can be freed from the wall side.', [
      { id: 'freeHorse', label: 'Free the lead rope from the wall side', next: 'stagedBeast' },
      { id: 'callTollKeeper', label: 'Call the toll keeper to bring a halter', next: 'tollClosed' },
      { id: 'grabHorse', label: 'Grab the horse’s lead at the bend', hint: 'The horse is frightened and can bolt toward the drop.', chance: { probability: 0.41, successNext: 'stagedBeast', failureNext: 'horseInjury', successMessage: 'The horse lets you free the snag from the wall side.', failureMessage: 'It bolts and knocks you against the rock.', failureEffects: { health: -4 } } },
    ], 'warning'),
    stagedBeast: scene('stagedBeast', 'A Beast on a Chain', 'The hide-covered frame swings across the road when a rope is pulled from a brush blind. Two men have been taking sacks after wagons stop. The loose horse’s lead was tied to the frame; no animal attacked the drivers.', [
      { id: 'raiseAlarm', label: 'Call the toll keeper and drivers', next: 'tollRevealed', effects: { historyFlags: ['exposed a false toll-road beast and protected the wagon route'] } },
      { id: 'cutControlRope', label: 'Cut the frame’s control rope', requirements: { items: ['smallKnife'] }, next: 'tollRevealed', effects: { damageItems: ['smallKnife'] } },
      { id: 'confrontMen', label: 'Confront the men at the brush blind', hint: 'They have the road blocked and may be armed.', chance: { probability: 0.48, successNext: 'tollRevealed', failureNext: 'tollInjury', successMessage: 'The men flee toward the upper trail.', failureMessage: 'One shoves you against the wall as the other escapes.', failureEffects: { health: -4 } } },
    ], 'danger'),
    tollRevealed: end('tollRevealed', 'The Road Reopened', 'The keeper opens the toll gate after recovering the sacks and freeing the horse. The frame is taken apart in daylight; the next wagon waits until the bend is cleared, and the drivers are warned that the animal was real even if the beast was not.'),
    tollRetreat: end('tollRetreat', 'A Longer Road', 'You turn back before the narrow bend. The driver takes the wider route with the cargo intact; the toll road remains closed until someone checks the brush.'),
    tollClosed: end('tollClosed', 'The Gate Stays Shut', 'The next wagon is warned and takes the longer road. No one is struck, but the false frame and loose horse remain beyond the toll gate until a crew can reach them.'),
    horseInjury: end('horseInjury', 'Against the Rock Wall', 'The horse bolts along the bend and escapes into the upper brush. You are bruised; the toll keeper closes the gate before another wagon arrives.'),
    tollInjury: end('tollInjury', 'The Brush Blind', 'The men flee after bruising you against the wall. The toll keeper recovers the loose horse and grain, but the false beast frame remains in the brush.'),
  },
};

export const THE_SKIN_IN_THE_TREE: Scenario = {
  id: 'the-skin-in-the-tree', title: 'The Skin in the Tree', subtitle: 'Fresh animal hides appear high in trees with no carcass below.', startScene: 'treeHide',
  diversity: meta({ hook: 'Hides hung high are bait for a scavenger and a signal in a poacher’s route; the empty ground is part of the evidence.', activity: 'investigation/mystery', role: 'investigator/explorer', tone: 'mysterious/eerie', risk: 'MODERATE', setting: 'forest road', fantasy: 'EERIE', combat: 'AVOIDABLE', structure: 'vertical evidence and bait recognition' }),
  scenes: {
    treeHide: scene('treeHide', 'A Hide above the Trail', 'A fresh animal hide hangs in a fork high above the forest road. No carcass lies beneath it. Another hide is visible farther uphill. A tree line borders the safe road, and the ground below the first branch is undisturbed.', [
      { id: 'inspectTreeBase', label: 'Inspect the ground below the hide', next: 'hideEvidence', effects: { knowledge: ['Fresh hides hung high above a forest trail were placed as bait, not left by a fallen carcass.'] } },
      { id: 'askRoadCrew', label: 'Ask the road crew who works this stretch', next: 'hideAccount' },
      { id: 'leaveHides', label: 'Leave the trees and continue on the road', next: 'hideLeft' },
    ]),
    hideEvidence: scene('hideEvidence', 'A Clean Patch of Ground', 'The hide is tied with a fresh cord. A narrow ladder track leads to the trunk, but no blood marks the roots. Under a nearby bush are drag marks pointing toward a shallow ravine.', [
      { id: 'followDragMarks', label: 'Follow the drag marks from the road', next: 'poacherCamp' },
      { id: 'lookAtSecondHide', label: 'Inspect the second hide from below', next: 'hideAccount' },
      { id: 'avoidRavine', label: 'Mark the ravine and stay on the road', next: 'hideLeft' },
    ]),
    hideAccount: scene('hideAccount', 'A Hunter’s Signal', 'A local hunter says a hide hung high attracts scavengers away from a snare line. The snare line is on private land, but the hunter did not set it and asks you not to cut anything before the owner is found.', [
      { id: 'askLandholder', label: 'Ask the landholder to inspect the snare line', next: 'poacherCamp' },
      { id: 'leavePrivateLand', label: 'Keep to the public road', next: 'hideLeft' },
      { id: 'followSecondHide', label: 'Follow the second hide from the road', next: 'poacherCamp' },
    ]),
    poacherCamp: scene('poacherCamp', 'The Ravine Camp', 'A poacher has hidden two snares and used the hides as a signal to retrieve them after dark. One snared animal is alive but exhausted. The poacher is not present; the landholder has arrived with a lantern.', [
      { id: 'freeAnimal', label: 'Ask the landholder to free the animal', next: 'hideResolved', effects: { historyFlags: ['helped a landholder remove hidden snares marked by hides in trees'] } },
      { id: 'markSnares', label: 'Mark the snares and withdraw', next: 'hideResolved', effects: { knowledge: ['Hides in trees marked a hidden snare line used by a poacher.'] } },
      { id: 'cutSnare', label: 'Cut the taut snare yourself', hint: 'The animal is alive and the wire is under tension.', chance: { probability: 0.48, successNext: 'hideResolved', failureNext: 'hideInjury', successMessage: 'The snare slackens and the animal pulls free.', failureMessage: 'The wire snaps back and cuts your hand.', failureEffects: { health: -3 } } },
    ], 'warning'),
    hideResolved: end('hideResolved', 'The Trees Cleared', 'The landholder calls a warden and removes the snares with help. The animal is released without a trophy; the hides are taken down, and the route is no longer marked for poaching.'),
    hideLeft: end('hideLeft', 'A Sign Not Followed', 'You stay on the public road and leave the hides in place. The trail remains unexplained, and you do not enter private ground without permission.'),
    hideInjury: end('hideInjury', 'A Snare under Tension', 'The wire cuts your hand before the landholder can secure it. The animal is freed by the time a warden arrives; the snares and hides are removed.'),
  },
};

export const THE_THING_THAT_MIMICS_THE_WHISTLE: Scenario = {
  id: 'thing-that-mimics-the-whistle', title: 'The Thing That Mimics the Whistle', subtitle: 'A call from the woods answers in the same rhythm, then changes one note.', startScene: 'whistleAnswer',
  diversity: meta({ hook: 'An entity copies a signal to draw listeners away from a road; the Conductor’s Whistle can test distance but is never a weapon.', activity: 'communication/witness', role: 'traveler/passenger', tone: 'mysterious/eerie', risk: 'HIGH', setting: 'forest road', fantasy: 'CONFIRMED_SUPERNATURAL', combat: 'AVOIDABLE', structure: 'signal protocol and sound-based navigation' }),
  scenes: {
    whistleAnswer: scene('whistleAnswer', 'A Reply from the Trees', 'On a forest road, a sharp whistle answers your call from the woods in the same rhythm. It repeats once, then adds a note you did not make. The road runs straight behind you to a house; the sound comes from a ravine to the left.', [
      { id: 'markSoundDirection', label: 'Mark the direction and continue on the road', next: 'whistleSafe' },
      { id: 'testWithWhistle', label: 'Test the distance with your Conductor’s Whistle', requirements: { items: ['conductorWhistle'] }, next: 'whistleTest', effects: { knowledge: ['A forest entity copied the Conductor’s Whistle and changed one note to draw listeners toward a ravine.'] } },
      { id: 'callAgain', label: 'Call again from the road', next: 'whistleTest' },
    ], 'warning'),
    whistleTest: scene('whistleTest', 'The Changed Note', 'The answer comes from the ravine, then from the trees behind it without crossing the open road. A branch moves against the wind. At the road edge, fresh soil has slumped away beneath a cracked, undercut bank; loose stones keep ticking down. The fence and road are firm, but the closer ground is not.', [
      { id: 'stopSignals', label: 'Stop signaling and stay on the road', next: 'whistleSafe' },
      { id: 'useWhistleOnce', label: 'Give one short call and listen', requirements: { items: ['conductorWhistle'] }, next: 'whistlePattern' },
      { id: 'enterRavine', label: 'Step onto the visibly undercut bank', hint: 'The soil is slumping; even a short approach could give way.', chance: { probability: 0.3, successNext: 'whistlePattern', failureNext: 'whistleScramble', successMessage: 'You reach the edge while keeping the firm road within reach.', failureMessage: 'The lip shears under your first step; you catch a root short of the drop.', failureEffects: { health: -2 } } },
    ]),
    whistleScramble: scene('whistleScramble', 'The Bank Gives Way', 'A strip of the undercut lip slides into the ravine. You catch a root before the drop, bruised and shaken; the firm fence line still leads back to the road. Across the gap, the whistle answers once.', [
      { id: 'retreatFromBank', label: 'Return to the road by the fence', next: 'whistleRoadRetreat' },
      { id: 'studyFromFence', label: 'Study the far bank without approaching', next: 'whistlePattern', effects: { knowledge: ['The whistle came from beyond a visibly unstable ravine bank; the road-side fence offers a safe retreat.'] } },
    ], 'warning'),
    whistlePattern: scene('whistlePattern', 'A Call That Has No Breath', 'The answer comes before your echo, then stops when the whistle is lowered. The branch movement stays on the far side of the ravine. From the firm fence line you can see the road back to the house; between you and the sound, the bank is cracked and undercut.', [
      { id: 'leaveFenceLine', label: 'Follow the fence to question the household', next: 'whistleHousehold', effects: { historyFlags: ['warned a household about a signal-mimicking presence in the woods'] } },
      { id: 'crossRavine', label: 'Cross the visibly undercut ravine bank', hint: 'The cracked lip is already shedding stones; a fall could be fatal.', chance: { probability: 0.27, successNext: 'whistleShapeWithdraws', failureNext: 'whistleFatal', successMessage: 'The shape withdraws beyond the ravine.', failureMessage: 'The undercut bank shears away beneath you.', failureEffects: { health: -10 } } },
      { id: 'breakWhistle', label: 'Throw the whistle into the ravine', requirements: { items: ['conductorWhistle'] }, next: 'whistleQuiet', effects: { loseItems: ['conductorWhistle'] } },
    ], 'danger'),
    whistleHousehold: scene('whistleHousehold', 'What the Household Heard', 'You follow the fence to the house. The household confirms hearing the same changed note from the ravine, but nobody saw anyone cross the road or leave the property. They will keep the path closed until daylight; the sound’s source remains beyond the bank.', [
      { id: 'helpClosePath', label: 'Help close the path until morning', next: 'whistleAfter' },
      { id: 'keepWatchFromHouse', label: 'Keep watch from the house-side fence', next: 'whistleHouseWatch' },
    ]),
    whistleHouseWatch: end('whistleHouseWatch', 'A Watch Kept from Firm Ground', 'You and the household watch the fence line from firm ground. The changed whistle does not sound again before dawn, and no one crosses the road. The ravine remains unexplained, but the household knows which path to keep closed.'),
    whistleQuiet: end('whistleQuiet', 'No More Answers', 'The calls stop when the signal is removed. You reach the house by the fence and explain the changed note; the presence remains beyond the ravine, but it no longer draws travelers from the road.'),
    whistleShapeWithdraws: end('whistleShapeWithdraws', 'The Shape Withdraws', 'You cross the bank and see the shape withdraw beyond the ravine. The ground still breaks underfoot, so you return to the firm fence and tell the household what you saw. The source of the changed whistle remains beyond reach.'),
    whistleRoadRetreat: end('whistleRoadRetreat', 'Back on the Firm Road', 'You return by the fence after the undercut lip gives way. The household remains at the road’s end, but you have not gone to speak with them. The changed whistle does not sound again before dawn, and its source remains across the ravine.'),
    whistleAfter: end('whistleAfter', 'A Road Kept Straight', 'After you help close the ravine path, the household keeps to the road until daylight. The answer does not come again before dawn. You do not learn what made it, but the route you chose has been checked with the people who live beside it.'),
    whistleSafe: end('whistleSafe', 'A Call Left Unanswered', 'You continue along the open road and do not follow the altered signal. The sound fades behind you; the house remains within sight.'),
    whistleFatal: end('whistleFatal', 'Beyond the Ravine', 'You leave the firm road and step onto the cracked, undercut bank despite the stones falling from its edge. It shears away beneath you before you can regain the fence. The last whistle answers from both sides of the ravine.', 'death'),
  },
};

export const THE_STONEBACK: Scenario = {
  id: 'the-stoneback', title: 'The Stoneback', subtitle: 'A quarry animal moves stone stacks when workers approach its den.', startScene: 'quarryStacks',
  diversity: meta({ hook: 'A stone-shelled burrower shifts unstable stacks to protect its den; rerouting the work avoids fighting or collapse.', activity: 'labor/repair', role: 'helper/rescuer', tone: 'tense/dangerous', risk: 'HIGH', setting: 'quarry', fantasy: 'FANTASY_THREAT', combat: 'AVOIDABLE', structure: 'vibration-triggered environmental defense' }),
  scenes: {
    quarryStacks: scene('quarryStacks', 'Stones Moved Overnight', 'Quarry workers find two stone stacks shifted away from a narrow cleft. No one is hurt, but a handcart was crushed. A stone-backed shape entered the cleft when the crew approached. The open haul road is behind you; the stacks are unstable.', [
      { id: 'inspectCleat', label: 'Inspect the shifted stones from the road', next: 'stonePattern', effects: { knowledge: ['The Stoneback shifted quarry stacks when vibration approached its den in the narrow cleft.'] } },
      { id: 'moveWorkers', label: 'Move the crew to the upper bench', next: 'stoneSafe' },
      { id: 'closeQuarry', label: 'Close the haul road and leave', next: 'stoneClosed' },
    ], 'warning'),
    stonePattern: scene('stonePattern', 'A Cleft under the Stack', 'Small claw marks run from the cleft to each moved stack. The creature pushes stones only when the heavy cart passes nearby. A firm upper bench offers another route for the crew, but it adds a day of hauling.', [
      { id: 'rerouteHaul', label: 'Reroute the cart to the upper bench', next: 'stoneRerouted', effects: { historyFlags: ['rerouted quarry work to protect a stone-backed creature’s den'] } },
      { id: 'useRopeStack', label: 'Secure the loose stack with your rope', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, next: 'stoneRerouted', effects: { damageItems: ['travelRope'] } },
      { id: 'approachCleft', label: 'Approach the cleft without a cart', next: 'stoneReveal' },
    ]),
    stoneReveal: scene('stoneReveal', 'A Shell of Quarry Stone', 'The creature shows a plated back crusted with quarry dust. It blocks the cleft but does not leave it. The workers’ cart vibrates the ground; the upper bench stays firm and out of its path.', [
      { id: 'leaveDenAlone', label: 'Keep workers on the upper bench', next: 'stoneRerouted' },
      { id: 'drawStonebackOut', label: 'Draw it away with a rolling stone', hint: 'The stacks above the cleft are loose and could collapse.', chance: { probability: 0.43, successNext: 'stoneRetreat', failureNext: 'stoneInjury', successMessage: 'The creature follows the rolling stone away from the cleft.', failureMessage: 'The upper stack shifts and sends stone across the road.', failureEffects: { health: -4 } } },
      { id: 'enterCleft', label: 'Enter the narrow cleft', hint: 'The creature is blocking the den and the stone stacks are unstable.', chance: { probability: 0.2, successNext: 'stoneRetreat', failureNext: 'stoneFatal', successMessage: 'The creature retreats deeper into the cleft.', failureMessage: 'The stack collapses across the narrow opening.', failureEffects: { health: -10 } } },
    ], 'danger'),
    stoneRerouted: end('stoneRerouted', 'A Quarry Route Changed', 'The crew moves its cart to the upper bench and leaves the cleft undisturbed. Work costs another day, but the Stoneback stops shifting the stacks. The crushed handcart is counted as a loss, not a trophy.'),
    stoneRetreat: end('stoneRetreat', 'The Cleared Cleft', 'The Stoneback withdraws into the cleft when the workers stop shaking the ground. The crew takes the upper route and leaves the loose stacks for a later, safer repair.'),
    stoneSafe: end('stoneSafe', 'Workers on the Upper Bench', 'The crew leaves the unstable stacks and works from firm ground. The Stoneback remains near its den; the quarry loses a day but no worker is asked to enter the cleft.'),
    stoneClosed: end('stoneClosed', 'The Road Closed', 'The quarry is closed until a foreman can inspect the stacks. The creature remains in the cleft, and the crushed cart is left where it fell.'),
    stoneInjury: end('stoneInjury', 'A Stack Gives Way', 'Stone shifts across the road and bruises your leg. The crew reaches the upper bench; the cleft remains blocked by loose rock.'),
    stoneFatal: end('stoneFatal', 'Beneath the Quarry Stack', 'The upper stones collapse into the narrow cleft before you can turn back. The crew retreats to the haul road.', 'death'),
  },
};

export const MONSTER_HUNT_THIRD = [THE_BROKEN_ANTLER, THE_MAN_EATER_OF_MILLERS_GAP, THE_CINDER_HOUND, THE_THREE_TOED_TRACK, THE_RED_MAW, THE_BEAST_AT_THE_TOLL_ROAD, THE_SKIN_IN_THE_TREE, THE_THING_THAT_MIMICS_THE_WHISTLE, THE_STONEBACK];
