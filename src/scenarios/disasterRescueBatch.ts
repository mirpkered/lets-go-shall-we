import type { Scenario } from '../types';
import { largeAdventure, largeEnd as end, largeScene as scene, largeTags as tags } from './largeContentTools';

const A = (id: string, title: string, subtitle: string, _activity: string, risk: 'HIGH' | 'SEVERE', hook: string, scenes: Scenario['scenes'], start: string, role = 'helper/rescuer') => largeAdventure(id, title, subtitle, tags({ hook, activity: 'rescue/care', role, tone: 'tense/dangerous', risk, setting: 'town/market/inn', combat: 'NONE', structures: ['branching narrative', 'time-pressure sequence'], outcomes: ['success/partial success', 'escape/survival', 'costly success/no-perfect-outcome possible'] }), start, scenes);

export const THE_BRIDGE_GOES_DOWN = A('the-bridge-goes-down', 'The Bridge Goes Down', 'A crossing fails while people, a wagon, and a mule are still on it.', 'disaster/rescue', 'SEVERE', 'A bridge collapse forces an immediate choice between rescuing people, animal, and cargo.', {
  span: scene('span', 'The Middle Span', 'You are on the west bank as a wagon crosses the timber bridge. A support cracks; the rear wheels drop, leaving the driver and his daughter on the sagging middle span. Their mule is still hitched at the far end. The river below is fast, and the bridge is moving.', [
    { id: 'callDriver', label: 'Tell the driver to leave the wagon', next: 'driverMoves', effects: { setFlags: ['bridgeDriverWarned'] } },
    { id: 'throwLine', label: 'Anchor your rope on the west bank', requirements: { usableItems: ['travelRope'] }, hint: 'The line can steady one crossing, but the cracked rail may cut it.', next: 'lineAcross', effects: { damageItems: ['travelRope'] } },
    { id: 'reachChild', label: 'Cross the shaking boards for the child', hint: 'The span is already sinking; a second break may be fatal.', chance: { probability: 0.56, successNext: 'childAcross', failureNext: 'bridgeDeath', successMessage: 'You reach the child and pull her onto the west bank.', failureMessage: 'A plank tears free beneath you.' } },
    { id: 'leaveBridge', label: 'Clear the bank and call for help', next: 'bankClear' },
  ], 'danger'),
  driverMoves: scene('driverMoves', 'One Person at a Time', 'The driver hears you and starts toward the west bank with his daughter. The mule pulls against the wagon; the load is still dragging the rear wheels toward the broken support.', [
    { id: 'takeDaughter', label: 'Guide the child onto firm ground', next: 'childAcross' },
    { id: 'freeMule', label: 'Cut the mule loose from the wagon', requirements: { usableItems: ['smallKnife'] }, next: 'muleSaved', effects: { setFlags: ['bridgeMuleFreed'] } },
    { id: 'haulWagon', label: 'Pull the wagon toward the west bank', requirements: { usableItems: ['travelRope'] }, hint: 'The wagon is heavier than the failing span can bear.', chance: { probability: 0.38, successNext: 'wagonSaved', failureNext: 'bridgeDrop', successMessage: 'The wagon shifts a few feet onto the sound end.', failureMessage: 'The rear support gives under the load.' } },
  ], 'warning'),
  lineAcross: scene('lineAcross', 'A Handhold over Water', 'The rope reaches the driver, but only the near rail is sound. He can send his daughter first, or cut the mule loose before leaving. There is no safe way to save the wagon and everyone on the bridge.', [
    { id: 'lineChild', label: 'Bring the child across first', chance: { probability: 0.78, successNext: 'childAcross', failureNext: 'bridgeDrop', successMessage: 'The line holds as the child reaches the bank.', failureMessage: 'The rope catches on a splintering rail.' } },
    { id: 'lineMule', label: 'Steady the mule while it steps free', next: 'muleSaved', effects: { setFlags: ['bridgeMuleFreed'] } },
    { id: 'lineWithdraw', label: 'Pull back before the rail breaks', next: 'bankClear' },
  ], 'danger'),
  bankClear: scene('bankClear', 'The Span Lets Go', 'You reach the west bank. The driver and child are still on the bridge; the mule is beyond them, and the wagon is pulling the deck lower with every jolt. A farmhand is running from the road with another length of rope.', [
    { id: 'shoutDriverNow', label: 'Shout for the driver to abandon the load', next: 'driverMoves', effects: { setFlags: ['bridgeDriverWarned'] } },
    { id: 'holdForFarmhand', label: 'Hold the bank clear until help arrives', next: 'bridgeAftermath', effects: { setFlags: ['bridgeWaited'] } },
    { id: 'rushSpan', label: 'Rush back across the sagging boards', hint: 'A second crossing is more dangerous than the first.', chance: { probability: 0.3, successNext: 'childAcross', failureNext: 'bridgeDeath', successMessage: 'You reach the child in the last steady moment.', failureMessage: 'The span drops into the current.' } },
  ], 'danger'),
  childAcross: scene('childAcross', 'The Child Reaches Shore', 'The girl is on firm ground. Her father is still on the bridge, and the mule is fighting the wagon’s weight. A deep crack travels from the middle support toward the far bank.', [
    { id: 'callFather', label: 'Call the driver to leave the wagon', next: 'bridgeAftermath', effects: { setFlags: ['bridgePeopleSaved'] } },
    { id: 'turnForMule', label: 'Go back for the mule', hint: 'The span may not hold another crossing.', chance: { probability: 0.48, successNext: 'muleSaved', failureNext: 'bridgeDrop', successMessage: 'The mule steps clear as the deck settles.', failureMessage: 'The wagon shifts and the boards part.' } },
    { id: 'saveCrate', label: 'Reach for the tied document chest', hint: 'The chest is cargo; the driver is still in danger.', chance: { probability: 0.42, successNext: 'wagonSaved', failureNext: 'bridgeDrop', successMessage: 'You drag the small chest onto the bank.', failureMessage: 'The deck tears away before you can turn back.' } },
  ], 'danger'),
  muleSaved: scene('muleSaved', 'The Mule Is Free', 'The mule reaches the west bank without the wagon. The driver and child remain on the bridge, while the wagon load keeps the broken span under strain.', [
    { id: 'muleCallDriver', label: 'Call the driver to leave the wagon', next: 'bridgeAftermath', effects: { setFlags: ['bridgeMuleFreed', 'bridgePeopleSaved'] } },
    { id: 'muleReturnForDriver', label: 'Cross back for the driver', hint: 'The mule is safe, but the deck is still failing.', chance: { probability: 0.42, successNext: 'bridgeAftermath', failureNext: 'bridgeDeath', successMessage: 'You reach the driver before the outer boards break.', failureMessage: 'The span drops away beneath you.' }, effects: { setFlags: ['bridgeMuleFreed', 'bridgePeopleSaved'] } },
    { id: 'muleLeaveWagon', label: 'Keep everyone off the bridge', next: 'bridgeAftermath', effects: { setFlags: ['bridgeMuleFreed'] } },
  ], 'warning'),
  wagonSaved: scene('wagonSaved', 'A Little Cargo, Not the Wagon', 'The document chest is on the bank, but the wagon remains caught across the split. The driver has reached the near side; his daughter is with you. The mule is still at the far end.', [
    { id: 'leaveWagonNow', label: 'Leave the wagon and clear the bank', next: 'bridgeAftermath', effects: { setFlags: ['bridgeCargoSaved', 'bridgePeopleSaved'] } },
    { id: 'tryMuleAgain', label: 'Signal the driver to free the mule', next: 'bridgeAftermath', effects: { setFlags: ['bridgeCargoSaved', 'bridgePeopleSaved', 'bridgeMuleFreed'] } },
    { id: 'holdBridge', label: 'Try one more pull on the wagon', hint: 'The span has no sound support under the load.', chance: { probability: 0.28, successNext: 'bridgeAftermath', failureNext: 'bridgeDrop', successMessage: 'The wagon slides one wheel-length before you stop.', failureMessage: 'The center drops under the strain.' }, effects: { setFlags: ['bridgeCargoSaved'] } },
  ], 'danger'),
  bridgeDrop: scene('bridgeDrop', 'The Far Rail Breaks', 'The wagon falls into the river and the bridge separates. You are on the west bank; the current hides the cargo. The driver is on your side, but the mule’s position is unclear beyond the broken deck.', [
    { id: 'searchNearWater', label: 'Keep everyone back from the broken edge', next: 'bridgeAftermath', effects: { health: -1, setFlags: ['bridgePeopleSaved'] } },
    { id: 'reachForWagon', label: 'Climb down toward the drifting wagon', hint: 'The current is strong and the bank is undercut.', chance: { probability: 0.24, successNext: 'bridgeAftermath', failureNext: 'bridgeDeath', successMessage: 'You pull a floating document case from an eddy.', failureMessage: 'The undercut bank gives way.' }, effects: { setFlags: ['bridgePeopleSaved'] } },
  ], 'danger'),
  bridgeAftermath: scene('bridgeAftermath', 'The River Takes the Span', 'The last timbers settle into the current. The surviving travelers gather on the west bank while the road crew counts who made it off. The crossing is gone; only what reached shore can be recovered.', [
    { id: 'bridgeLeave', label: 'Help the survivors reach the farm road', next: 'bridgeEnd' },
  ]),
  bridgeEnd: { ...end('bridgeEnd', 'No Crossing Left', 'The wagon and most cargo are lost. The road crew closes both approaches and records whose positions are still unknown.'), textVariants: [
    { requirements: { flags: ['bridgePeopleSaved', 'bridgeMuleFreed'] }, text: 'The driver, his daughter, and the mule reach the west bank. The wagon and most cargo are lost; the road crew closes both approaches and records the collapse.' },
    { requirements: { flags: ['bridgePeopleSaved'] }, text: 'The driver and his daughter reach the west bank. The mule’s position remains uncertain beyond the broken deck. The wagon and most cargo are lost; the road crew closes both approaches.' },
    { requirements: { flags: ['bridgeMuleFreed'] }, text: 'The mule reaches the west bank. The driver and his daughter are not confirmed ashore before the span goes; the road crew closes both approaches and begins a search.' },
  ] },
  bridgeDeath: end('bridgeDeath', 'Under the Broken Span', 'The bridge gives way while you are on or below it. The current carries the broken timbers downstream.', 'death'),
}, 'span');

export const SMOKE_OVER_MAIN_STREET = A('smoke-over-main-street', 'Smoke over Main Street', 'A shop fire is moving toward the next roof.', 'disaster/rescue', 'HIGH', 'A spreading town fire forces choices among warning, evacuation, and property.', {
  street: scene('street', 'The Draper’s Windows', 'Smoke pushes from a draper’s upper windows. The neighboring bakery shares a wooden roofline; its baker is still inside, while a stable gate stands open across the street. A bucket line has started, but the flames are already above the lintel.', [
    { id: 'warnBakery', label: 'Get the baker out of the next shop', next: 'bakeryClear', effects: { setFlags: ['fireBakerWarned'] } },
    { id: 'moveStableHorse', label: 'Lead the loose horse away from smoke', next: 'horseClear', effects: { setFlags: ['fireHorseSafe'] } },
    { id: 'joinBuckets', label: 'Carry water to the roofline', hint: 'The fire is above reach; a falling beam could strike the line.', chance: { probability: 0.64, successNext: 'fireLine', failureNext: 'fireScorch', successMessage: 'The wet roof edge holds while the next building is cleared.', failureMessage: 'A burning shutter falls and scatters the bucket line.', failureEffects: { health: -2 } } },
    { id: 'retreatStreet', label: 'Move back and clear the street', next: 'streetClear' },
  ], 'danger'),
  bakeryClear: scene('bakeryClear', 'The Neighboring Door', 'The baker comes out coughing and says an apprentice may still be in the rear room. Smoke now rolls over the roof seam. The town bell is sounding; the fire crew is two streets away.', [
    { id: 'searchRear', label: 'Call into the rear room from the door', chance: { probability: 0.61, successNext: 'apprenticeOut', failureNext: 'fireScorch', successMessage: 'The apprentice answers and follows your voice to the door.', failureMessage: 'A beam cracks inside; you are forced back.', failureEffects: { health: -2 } } },
    { id: 'keepBakerMoving', label: 'Take the baker beyond the next corner', next: 'streetClear' },
    { id: 'soakRoofEdge', label: 'Help wet the shared roof edge', next: 'fireLine' },
  ], 'warning'),
  horseClear: scene('horseClear', 'Away from the Stable', 'The horse is on the open lane and no longer trapped behind the stable gate. A boy takes its lead rope. The draper’s fire has reached the bakery roof seam, where bucket carriers are struggling to keep their line together.', [
    { id: 'horseBuckets', label: 'Carry water to the roofline', next: 'fireLine' },
    { id: 'horseWarnBake', label: 'Help clear the bakery', next: 'bakeryClear' },
    { id: 'horseRetreat', label: 'Keep people clear of the falling eaves', next: 'streetClear' },
  ]),
  fireLine: scene('fireLine', 'The Roof Edge Holds', 'A wet strip of roof slows the flames, but the draper’s upper floor cannot be saved. The baker and apprentice are outside if you brought them out; the fire crew arrives and asks which neighboring side still needs clearing.', [
    { id: 'checkPeople', label: 'Count people before property', next: 'fireAftermath', effects: { setFlags: ['fireCheckedPeople'] } },
    { id: 'protectBakery', label: 'Keep the wet strip over the bakery', next: 'fireAftermath', effects: { setFlags: ['fireBakeryProtected'] } },
  ], 'warning'),
  fireScorch: scene('fireScorch', 'The Fire Jumps the Seam', 'A gust carries sparks across the shared eaves. The bakery roof catches at one corner. You have been driven back from the door, and the fire crew is now on the street with ladders.', [
    { id: 'scorchWarnPeople', label: 'Call everyone out of the bakery', next: 'fireAftermath', effects: { health: -1, setFlags: ['fireCheckedPeople'] } },
    { id: 'scorchLeave', label: 'Clear the street and let the crew enter', next: 'fireAftermath' },
  ], 'danger'),
  apprenticeOut: scene('apprenticeOut', 'The Apprentice Answers', 'The apprentice reaches the street. The baker confirms the rear room is empty, and the fire crew raises a ladder beneath the shared roof. The draper’s loss is unavoidable; the bakery can still be defended.', [
    { id: 'apprenticeDefend', label: 'Help keep the bakery roof wet', next: 'fireAftermath', effects: { setFlags: ['fireCheckedPeople', 'fireBakeryProtected'] } },
    { id: 'apprenticeRetreat', label: 'Guide them beyond the smoke', next: 'fireAftermath', effects: { setFlags: ['fireCheckedPeople'] } },
  ]),
  streetClear: scene('streetClear', 'A Clear Lane', 'People have moved beyond the falling shutters. The stable horse is safe only if you led it out; the baker remains responsible for the bakery door. The crew needs room for its ladder and pump cart.', [
    { id: 'streetCrew', label: 'Make room for the fire crew', next: 'fireAftermath', effects: { setFlags: ['fireStreetClear'] } },
    { id: 'streetBaker', label: 'Call the baker from the doorway', next: 'fireAftermath', effects: { setFlags: ['fireCheckedPeople'] } },
  ]),
  fireAftermath: scene('fireAftermath', 'After the Bell', 'The crew contains the fire at the draper’s burned upper floor. The bakery is saved only if you helped defend its roof; people and animals are accounted for only where they were actually brought clear. The street fills with neighbors carrying blankets and lists.', [
    { id: 'fireLeave', label: 'Help carry the injured to the inn', next: 'fireEnd' },
  ]),
  fireEnd: end('fireEnd', 'The Shops at Dawn', 'By dawn the draper’s shop is lost, but the fire has not taken the whole block. The bakery roof is saved only if the wet strip held; otherwise the crew records damage there too. The stable horse is clear only if someone led it out. The baker remembers who helped at the door.'),
  fireDeath: end('fireDeath', 'The Upper Floor', 'A burning beam falls before you can get clear of the shopfront.', 'death'),
}, 'street');

export const THE_TRAIN_THAT_DIDNT_STOP = A('the-train-that-didnt-stop', 'The Train That Didn’t Stop', 'A damaged train rushes past a station that expected it to brake.', 'disaster/rescue', 'HIGH', 'A runaway train passes the player; intervention from the station may prevent a worse collision.', {
  platform: scene('platform', 'Past the Platform', 'The passenger train should have stopped, but it races through the station with sparks at one wheel and a hand waving from the rear door. A goods train is due from the north in twelve minutes. The station has a red danger lamp and a siding lever; the telegraph room is open.', [
    { id: 'showRedLamp', label: 'Raise the red lamp toward the line', next: 'signalSeen', effects: { setFlags: ['trainSignalUsed'] } },
    { id: 'sendTelegraph', label: 'Send warning to the north signal box', next: 'telegraphSent', effects: { knowledge: ['The north goods train can be held only if its signal box receives warning before the next bell.'] } },
    { id: 'pullSiding', label: 'Open the empty siding for the train', hint: 'The switch is stiff; mis-setting it could send the train toward a closed buffer.', chance: { probability: 0.58, successNext: 'sidingOpen', failureNext: 'switchJam', successMessage: 'The points shift toward the empty siding.', failureMessage: 'The lever jams halfway; the signal remains at danger.' } },
    { id: 'runAlongside', label: 'Run after the last carriage', hint: 'The train is moving too fast to board safely.', next: 'platformClear', effects: { health: -1 } },
  ], 'danger'),
  signalSeen: scene('signalSeen', 'A Hand at the Rear Door', 'Someone inside answers the red lamp with a lantern flash. The train cannot stop here, but the driver may be able to coast into a siding if the line ahead is clear.', [
    { id: 'signalTelegraph', label: 'Warn the north signal box as well', next: 'telegraphSent' },
    { id: 'signalWait', label: 'Keep the platform clear', next: 'platformClear' },
  ]),
  telegraphSent: scene('telegraphSent', 'The Wire Answers', 'The north box returns the message: the goods train is being held. A signalman asks whether the damaged passenger train has a clear siding or should be left on the main line.', [
    { id: 'telegraphSwitch', label: 'Open the empty siding', next: 'sidingOpen' },
    { id: 'telegraphClear', label: 'Keep workers off the track', next: 'platformClear' },
  ]),
  sidingOpen: scene('sidingOpen', 'A Track Kept Clear', 'The train’s guard sees the open points and signals back. It slows into the siding, scraping one carriage step but avoiding the held goods line. Passengers are still aboard, and the engine is steaming hard.', [
    { id: 'boardStopped', label: 'Wait for the train to stop fully', next: 'trainAftermath' },
    { id: 'approachEngine', label: 'Approach the engine from the platform', hint: 'Hot iron and a moving train remain dangerous.', next: 'trainAftermath', effects: { health: -1 } },
  ], 'warning'),
  switchJam: scene('switchJam', 'The Points Refuse', 'The lever stops halfway. The signalman orders everyone off the track and uses the fixed danger signal. The train is still approaching the next junction; the goods train is held, but the passenger crew has no confirmed route.', [
    { id: 'jamSignal', label: 'Keep the danger signal raised', next: 'trainAftermath' },
    { id: 'jamForce', label: 'Force the lever while the line is live', hint: 'The switch could throw beneath the train.', chance: { probability: 0.36, successNext: 'sidingOpen', failureNext: 'trainDeath', successMessage: 'The points settle before the train reaches them.', failureMessage: 'The mechanism kicks back as the wheels arrive.' } },
  ], 'danger'),
  platformClear: scene('platformClear', 'No One on the Rails', 'You keep the passengers and station hands away from the track. The goods train remains a threat only if the warning fails; the stationmaster sends a rider to the next signal post while the passenger train vanishes around the bend.', [
    { id: 'clearWait', label: 'Wait for word from the next station', next: 'trainAftermath' },
    { id: 'clearRide', label: 'Take the station horse to warn ahead', next: 'trainRider', requirements: { ownedAssets: ['olderChestnutHorse'] } },
  ]),
  trainRider: scene('trainRider', 'Ahead of the Line', 'Your horse carries you to the next signal post before the passenger train arrives. The signalman sees the hand-lamp warning and holds the goods train. The passenger train coasts onto a service spur with its wheels locked.', [
    { id: 'riderReturn', label: 'Return with the signalman’s report', next: 'trainAftermath', effects: { historyFlags: ['warned a signal post before a train collision'] } },
  ]),
  trainAftermath: scene('trainAftermath', 'Passengers on the Ballast', 'The passenger train is stopped or held only after the next signal crew acts. A brakeman has a burned hand and the passengers are shaken; the north goods train is safe if the warning reached it. The stationmaster writes down exactly what signals you sent.', [
    { id: 'trainReport', label: 'Give the stationmaster your account', next: 'trainSettlement', effects: { knowledge: ['The north signal box can hold a train when the wire is working; the hand lamp is the fallback.'], historyFlags: ['helped avert a rail collision at a country station'] } },
  ]),
  trainSettlement: scene('trainSettlement', 'A Country Station’s Thanks', 'Your account is in the signal log. The stationmaster offers two coins for your time or a compact Pocket Toolkit retired from the station’s maintenance set; it has been checked and is no longer assigned to the crew.', [
    { id: 'takeTrainCoins', label: 'Accept two coins for your help', next: 'trainEnd', effects: { money: 2 } },
    { id: 'takeStationToolkit', label: 'Take the Pocket Toolkit instead of the coins', requirements: { notOwnedItems: ['pocketToolkit'] }, next: 'trainEnd', effects: { gainItems: ['pocketToolkit'] } },
    { id: 'leaveTrainPayment', label: 'Thank the stationmaster and take no payment', next: 'trainEnd' },
  ]),
  trainEnd: end('trainEnd', 'Held Before the Junction', 'No collision follows. The passenger train must be inspected before it travels again, and one damaged step will cost the railway time. A passenger grips your hand and thanks you for keeping them off the line; the stationmaster says your clear account gave the crews time to act and keeps it with the signal log.'),
  trainDeath: end('trainDeath', 'The Live Points', 'The train reaches the switch before you can get clear of its moving iron.', 'death'),
}, 'platform');

export const THE_MINE_GIVES_WAY = A('the-mine-gives-way', 'The Mine Gives Way', 'A collapse separates miners who can still answer from those who cannot.', 'disaster/rescue', 'SEVERE', 'Rescue depends on air, sound, and choosing which unstable route to test.', {
  mouth: scene('mouth', 'Two Calls below Ground', 'A section of the mine has slumped. Two miners answer from the near drift; a third signal comes from beyond the blocked crosscut. Fresh dust hangs in the entrance and a prop timber is bowed. The foreman says the old ventilation raise may still be open.', [
    { id: 'mapRaise', label: 'Read the posted level map', next: 'raiseRoute', effects: { knowledge: ['The old ventilation raise reaches the far drift by a longer, timbered route.'] } },
    { id: 'nearMiners', label: 'Lead the answering miners out first', next: 'minersOut', effects: { setFlags: ['nearMinersSaved'] } },
    { id: 'callFar', label: 'Signal the far miner before moving', next: 'farSignal' },
    { id: 'enterDust', label: 'Crawl under the bowed timber', hint: 'The roof is still shedding stone; another fall may kill you.', chance: { probability: 0.4, successNext: 'nearMiners', failureNext: 'mineDeath', successMessage: 'You reach the near drift without shifting the prop.', failureMessage: 'The timber snaps as you pass.' } },
  ], 'danger'),
  raiseRoute: scene('raiseRoute', 'The Ventilation Raise', 'The map shows a laddered raise that meets the far drift beyond the collapse. It is narrow, but the foreman says the ladder was inspected last week. The two near miners are still calling; air is getting stale in their pocket.', [
    { id: 'takeRaise', label: 'Use the inspected raise', next: 'farSide', effects: { health: -1 } },
    { id: 'nearFirst', label: 'Bring the near miners out first', next: 'minersOut', effects: { setFlags: ['nearMinersSaved'] } },
  ], 'warning'),
  nearMiners: scene('nearMiners', 'The Near Drift', 'Both miners are conscious, coughing in the dust. One can walk; the other has a bruised leg. Their safe route back runs past the bent prop, while the last tapping from the far drift has grown faint.', [
    { id: 'walkNearOut', label: 'Take the walking miner to the mouth', next: 'minersOut', effects: { setFlags: ['nearMinersSaved'] } },
    { id: 'braceNear', label: 'Brace the prop before moving them', requirements: { usableItems: ['travelRope'] }, next: 'minersOut', effects: { damageItems: ['travelRope'], setFlags: ['nearMinersSaved'] } },
    { id: 'leaveNearForFar', label: 'Follow the last tapping first', next: 'farSignal', effects: { setFlags: ['nearMinersLeft'] } },
  ], 'danger'),
  farSignal: scene('farSignal', 'Three Taps, Then Silence', 'You tap the rail and hear three weak replies from beyond the crosscut. The old raise is the only mapped route there; forcing the rubble would put a rescuer under the same roof.', [
    { id: 'useRaiseNow', label: 'Reach the far drift by the raise', next: 'farSide' },
    { id: 'bringNearNow', label: 'Get the near miners out first', next: 'minersOut', effects: { setFlags: ['nearMinersSaved', 'farMinerUnreached'] } },
    { id: 'summonCrew', label: 'Send for the mine rescue crew', next: 'mineCrew' },
  ], 'warning'),
  farSide: scene('farSide', 'Beyond the Collapse', 'The raise opens beside the far drift. One miner is trapped behind a fallen ore cart but answers clearly. Dust falls from a crack above the cart; you can shift the load from the side or mark the location for the rescue crew.', [
    { id: 'shiftOreCart', label: 'Move the cart from the stable side', hint: 'The cart may roll into the cracked roof line.', chance: { probability: 0.59, successNext: 'farMinerOut', failureNext: 'mineCaveIn', successMessage: 'The cart rolls clear without striking the roof prop.', failureMessage: 'The cart catches and shakes loose more stone.', failureEffects: { health: -2 } } },
    { id: 'markFarDrift', label: 'Mark the drift and call the rescue crew', next: 'mineCrew' },
    { id: 'retreatFar', label: 'Return while the raise remains stable', next: 'mineCrew', effects: { setFlags: ['farMinerUnreached'] } },
  ], 'danger'),
  minersOut: scene('minersOut', 'Air at the Mouth', 'The near miners reach fresh air. The far signal is no longer clear. The foreman has sent for a crew with proper timber; entering again may still reach the trapped miner, but the bowed prop is moving.', [
    { id: 'nearWaitCrew', label: 'Keep the entrance clear for rescuers', next: 'mineCrew', effects: { setFlags: ['nearMinersSaved'] } },
    { id: 'nearReturn', label: 'Go back through the raise for the far miner', next: 'farSide', effects: { setFlags: ['nearMinersSaved'] } },
  ]),
  farMinerOut: scene('farMinerOut', 'The Trapped Miner Walks', 'The miner is free but limping. You have brought them to the raise; the near drift still needs a head count, and the rescue crew is arriving at the mouth.', [
    { id: 'mineCount', label: 'Give the foreman the locations and count', next: 'mineAftermath', effects: { setFlags: ['farMinerSaved'] } },
  ]),
  mineCaveIn: scene('mineCaveIn', 'A Second Fall', 'The roof sheds stone and seals the far drift. You reach the raise bruised and coughing. The near miners are out if you brought them; the far miner can no longer be heard.', [
    { id: 'mineCaveReport', label: 'Show the crew the marked drift', next: 'mineAftermath', effects: { health: -2, setFlags: ['farMinerUnreached'] } },
  ], 'danger'),
  mineCrew: scene('mineCrew', 'Rescue Timber at the Mouth', 'The trained crew checks the bowed prop before entering. They can recover the near miners first, but the far raise needs fresh timber and time. The foreman asks which signals and routes you personally verified.', [
    { id: 'crewGuide', label: 'Guide them to the last clear signal', next: 'mineAftermath', effects: { historyFlags: ['guided a mine rescue crew by verified signals'] } },
  ]),
  mineAftermath: scene('mineAftermath', 'Counted at the Lamp Board', 'The foreman marks each miner found, each route sealed, and the timber still unsafe. Those brought outside are counted by name; anyone beyond an unheard collapse remains missing, not presumed safe.', [
    { id: 'mineLeave', label: 'Leave the count with the rescue crew', next: 'mineEnd' },
  ]),
  mineEnd: end('mineEnd', 'The Mine Closed', 'The entrance is barred until the supports are replaced. Your account gives the crew a verified route, but it cannot promise that every trapped worker survived.'),
  mineDeath: end('mineDeath', 'Under the Prop', 'The bowed timber gives way before you can reach the open drift.', 'death'),
}, 'mouth');

export const WATER_THROUGH_THE_DOOR = A('water-through-the-door', 'Water Through the Door', 'A flash flood reaches a low settlement before the road clears.', 'disaster/rescue', 'SEVERE', 'Rising floodwater forces a choice among a trapped resident, livestock, records, and a closing escape route.', {
  lane: scene('lane', 'The Waterline at the Step', 'A fast brown flood runs through the lower street. An older tenant is still inside the last house, a goat is tied in a low shed, and a document box rests on the porch above the water. The west lane rises to the hill; the east ford is already covered.', [
    { id: 'warnTenant', label: 'Call the tenant toward the west door', next: 'tenantResponds', effects: { setFlags: ['floodTenantWarned'] } },
    { id: 'freeGoat', label: 'Untie the goat from the low shed', requirements: { usableItems: ['smallKnife'] }, next: 'goatFree' },
    { id: 'saveDocuments', label: 'Reach for the porch document box', hint: 'The step is under moving water; the box is not worth a life.', chance: { probability: 0.5, successNext: 'boxSaved', failureNext: 'floodSlip', successMessage: 'You take the box from the porch without entering the current.', failureMessage: 'The step shifts and the current knocks you down.', failureEffects: { health: -2 } } },
    { id: 'takeWestLane', label: 'Lead people uphill now', next: 'floodEvacuation' },
  ], 'danger'),
  tenantResponds: scene('tenantResponds', 'A Voice behind the Door', 'The tenant answers from the back room. The front step is submerged; a side yard slopes upward to the lane, while the tied goat is still in the low shed. The rain is easing but the river is not.', [
    { id: 'sideYardTenant', label: 'Guide the tenant through the side yard', next: 'tenantOut', effects: { setFlags: ['floodTenantSafe'] } },
    { id: 'waitTenant', label: 'Show them the rising waterline', next: 'floodEvacuation', effects: { setFlags: ['floodTenantWarned'] } },
    { id: 'returnGoat', label: 'Free the goat before the shed floods', next: 'goatFree' },
  ], 'warning'),
  goatFree: scene('goatFree', 'The Goat on the Hill', 'The goat is on higher ground and shaking water from its coat. The tenant has not yet reached the west lane, and the document box remains on the porch.', [
    { id: 'goatGuideTenant', label: 'Return to guide the tenant uphill', next: 'tenantOut', effects: { setFlags: ['floodGoatSafe', 'floodTenantSafe'] } },
    { id: 'goatTakeBox', label: 'Retrieve the porch document box', next: 'boxSaved', effects: { setFlags: ['floodGoatSafe'] } },
    { id: 'goatEvacuate', label: 'Leave before the lane closes', next: 'floodEvacuation', effects: { setFlags: ['floodGoatSafe'] } },
  ]),
  boxSaved: scene('boxSaved', 'Paper above the Water', 'The box is on high ground, though its lower papers are soaked. The flood pushes debris through the side yard. You can still reach the tenant by the raised garden path, but the shed is now fully under water.', [
    { id: 'boxReachTenant', label: 'Use the raised garden path to the house', next: 'tenantOut', effects: { setFlags: ['floodBoxSaved', 'floodTenantSafe'] } },
    { id: 'boxLeave', label: 'Carry the box uphill and warn the neighbors', next: 'floodEvacuation', effects: { setFlags: ['floodBoxSaved'] } },
  ], 'warning'),
  floodSlip: scene('floodSlip', 'The Step Gives', 'You reach the bank injured, empty-handed. The document box is gone from the porch, and the current has reached the tenant’s side yard. You can still warn from higher ground, but entering the flood is no longer sensible.', [
    { id: 'slipCall', label: 'Call the tenant toward the west lane', next: 'tenantOut', effects: { health: -1, setFlags: ['floodTenantSafe'] } },
    { id: 'slipEvacuate', label: 'Warn the next row of houses', next: 'floodEvacuation', effects: { health: -1 } },
  ], 'danger'),
  tenantOut: scene('tenantOut', 'On the Raised Lane', 'The tenant reaches the hill road with you. The goat is safe only if you freed it; the documents are safe only if you carried the box. Water is entering the next house, whose occupants have already heard the warning.', [
    { id: 'tenantHelpNeighbors', label: 'Help the next household reach the hill', next: 'floodAftermath', effects: { setFlags: ['floodNeighborsWarned'] } },
    { id: 'tenantStayHigh', label: 'Keep everyone above the waterline', next: 'floodAftermath' },
  ]),
  floodEvacuation: scene('floodEvacuation', 'The West Lane Holds', 'The west lane remains passable for a short time. The water is too strong to return through the lower street. You can guide the people who heard your warning or stay on high ground and signal the next house.', [
    { id: 'evacGuide', label: 'Guide the waiting neighbors uphill', next: 'floodAftermath', effects: { setFlags: ['floodNeighborsWarned'] } },
    { id: 'evacSignal', label: 'Signal from the hill road', next: 'floodAftermath' },
  ], 'warning'),
  floodAftermath: scene('floodAftermath', 'After the Water Passes', 'The flood drops by evening, leaving mud lines across the doors. People are accounted for only if they reached the hill; the low shed and porch are damaged, and any uncollected records are soaked or gone.', [
    { id: 'floodReport', label: 'Help list the losses for the village', next: 'floodEnd', effects: { knowledge: ['The west lane stayed above the flash flood; the covered east ford did not.'], historyFlags: ['helped a lower street evacuate during a flash flood'] } },
  ]),
  floodEnd: end('floodEnd', 'Mud on the Doorstep', 'The family returns only after the river falls. The tenant, goat, box, and neighbors fare according to what you moved or warned; the lower street will need repair before anyone settles back in.'),
}, 'lane');

export const THE_BOILER_ROOM = A('the-boiler-room', 'The Boiler Room', 'A mill boiler begins to knock while the afternoon shift is still inside.', 'disaster/rescue', 'HIGH', 'Early warning may prevent an explosion, but workers must be moved before anyone risks the valve.', {
  yard: scene('yard', 'A Knock under the Floor', 'A mill boiler knocks out of rhythm, and a wet line of steam escapes near the gauge. Workers are above in the weaving room. The foreman says the main shutoff is in the boiler room; the pressure gauge is climbing past its chalk mark.', [
    { id: 'warnShift', label: 'Get the workers outside first', next: 'workersOut', effects: { setFlags: ['boilerShiftWarned'] } },
    { id: 'tellForeman', label: 'Tell the foreman to shut the feed', next: 'foremanActs' },
    { id: 'inspectValve', label: 'Inspect the feed valve from the doorway', next: 'valveSeen', effects: { knowledge: ['The boiler knock worsens when the feed valve remains open; the main shutoff is reachable from the doorway.'] } },
    { id: 'retreatBoiler', label: 'Clear the yard and call the town engineer', next: 'boilerWait' },
  ], 'warning'),
  workersOut: scene('workersOut', 'A Shift in the Yard', 'Most workers come outside, but one machinist stays to finish a gear measurement. The foreman is heading for the boiler door; steam hisses louder under the gauge.', [
    { id: 'callMachinist', label: 'Bring the last worker away from the mill', next: 'foremanActs', effects: { setFlags: ['boilerShiftWarned'] } },
    { id: 'assistForeman', label: 'Help the foreman reach the shutoff', next: 'valveSeen' },
    { id: 'keepDistance', label: 'Keep the crowd behind the stone wall', next: 'boilerWait' },
  ], 'warning'),
  foremanActs: scene('foremanActs', 'The Feed Is Closed', 'The foreman closes the water feed, but pressure is still in the boiler. The gauge needle trembles at the chalk mark. The town engineer is on the road; the workers are outside if you warned them.', [
    { id: 'ventBoiler', label: 'Open the low vent from outside', next: 'vented' },
    { id: 'holdYard', label: 'Wait behind the stone wall', next: 'boilerWait' },
    { id: 'forceDoorBoiler', label: 'Enter to turn the hot main wheel', hint: 'Steam is escaping and the pressure is not falling.', chance: { probability: 0.42, successNext: 'vented', failureNext: 'boilerDeath', successMessage: 'The vent opens before the pipe shakes loose.', failureMessage: 'The pipe bursts as you cross the room.', failureEffects: { health: -4 } } },
  ], 'danger'),
  valveSeen: scene('valveSeen', 'The Wheel behind Steam', 'From the doorway, you can see the shutoff wheel but not the cracked joint behind it. A turn might stop the feed; crossing the room means passing the leaking pipe. The foreman is outside with the crew.', [
    { id: 'turnWheel', label: 'Turn the wheel from the doorway', chance: { probability: 0.64, successNext: 'vented', failureNext: 'boilerBurst', successMessage: 'The feed closes and the knock slows.', failureMessage: 'The wheel sticks; the gauge keeps climbing.' } },
    { id: 'backToYard', label: 'Back away and keep workers clear', next: 'boilerWait' },
    { id: 'sendEngineer', label: 'Wait for the town engineer', next: 'boilerWait' },
  ], 'danger'),
  vented: scene('vented', 'Pressure Falls', 'Steam vents into the open yard and the knock becomes a steady hiss. The boiler does not explode, but the mill is out of work until its pipe is inspected. The engineer arrives with a second gauge.', [
    { id: 'boilerAccount', label: 'Show the engineer the cracked joint', next: 'boilerAftermath', effects: { historyFlags: ['helped clear workers before a mill boiler was shut down'] } },
  ]),
  boilerWait: scene('boilerWait', 'Behind the Stone Wall', 'You keep people outside the boiler room. The foreman stops the mill feed from the yard control, and the engineer arrives before the gauge passes its mark. The day’s work is lost, but the pressure begins to fall.', [
    { id: 'waitEngineer', label: 'Give the engineer room to inspect', next: 'boilerAftermath' },
  ]),
  boilerBurst: scene('boilerBurst', 'A Pipe Lets Go', 'The boiler casing holds, but a steam pipe tears loose. The yard control shuts the feed; one worker is burned and the machinery room is damaged. You can help move the injured worker or keep clear for the engineer.', [
    { id: 'boilerAidBurn', label: 'Help the injured worker to the pump', next: 'boilerAftermath', effects: { health: -2, setFlags: ['boilerWorkerHurt'] } },
    { id: 'boilerClear', label: 'Clear the doorway for the engineer', next: 'boilerAftermath' },
  ], 'danger'),
  boilerAftermath: scene('boilerAftermath', 'The Mill Falls Quiet', 'The engineer marks the damaged joint for replacement. No one restarts the boiler today; workers are counted outside, and the miller offers two coins for your help. The mill also has a worn Foreman’s Multi-tool left from a recent repair-chest replacement.', [
    { id: 'boilerLeave', label: 'Accept the two-coin payment', next: 'boilerEnd', effects: { money: 2 } },
    { id: 'boilerTakeTool', label: 'Take the Foreman’s Multi-tool instead of 2 coins', requirements: { notOwnedItems: ['foremanMultiTool'] }, next: 'boilerEnd', effects: { gainItems: ['foremanMultiTool'] } },
    { id: 'boilerRepairTool', label: 'Repair your damaged Pocket Toolkit instead of taking cash', requirements: { items: ['pocketToolkit'], itemConditions: { pocketToolkit: ['DAMAGED', 'BROKEN'] } }, next: 'boilerEnd', effects: { repairItems: ['pocketToolkit'], repairItemProvenance: { pocketToolkit: 'Repaired at the mill after the boiler shutdown' } } },
  ]),
  boilerEnd: end('boilerEnd', 'Work Stopped in Time', 'The mill loses a shift, not its boiler house. Workers are counted outside, and the engineer marks the damaged joint for replacement.'),
  boilerDeath: end('boilerDeath', 'The Boiler Door', 'The pressurized pipe bursts before you reach the shutoff.', 'death'),
}, 'yard');

export const THE_CROWD_BREAKS = A('the-crowd-breaks', 'The Crowd Breaks', 'A false fire cry sends a packed platform moving toward one narrow stair.', 'disaster/rescue', 'HIGH', 'Crowd danger is shaped by position, open exits, and calm information, not force.', {
  platform: scene('platform', 'A Cry and a Surge', 'A bell rings at the county exhibition hall and someone shouts “Fire!” No smoke is visible. The crowd surges toward the east stair; a west gate is open, and a child has fallen beside a pillar. A horse cart blocks part of the lane.', [
    { id: 'openWestGate', label: 'Point people toward the west gate', next: 'gateFlow', effects: { setFlags: ['crowdGateOpened'] } },
    { id: 'liftChild', label: 'Reach the fallen child by the pillar', chance: { probability: 0.62, successNext: 'childClear', failureNext: 'crowdFall', successMessage: 'You lift the child into the gap beside the pillar.', failureMessage: 'The crowd pushes you against the cart.', failureEffects: { health: -2 } } },
    { id: 'clearCart', label: 'Move the cart away from the west lane', next: 'cartClear' },
    { id: 'climbStand', label: 'Climb the stand and call for order', hint: 'The stand is crowded too; a fall could injure you.', chance: { probability: 0.48, successNext: 'calmCall', failureNext: 'crowdFall', successMessage: 'Your voice carries over the nearest rows.', failureMessage: 'The rail shifts as people press against it.', failureEffects: { health: -2 } } },
  ], 'danger'),
  gateFlow: scene('gateFlow', 'The Open Gate', 'People begin moving toward the west gate in smaller groups. The child remains beside the pillar, and the cart still narrows the lane. A constable at the far end confirms there is no fire in the hall.', [
    { id: 'gateChild', label: 'Lift the child once the flow eases', next: 'childClear', effects: { setFlags: ['crowdFalseAlarm'] } },
    { id: 'gateTellTruth', label: 'Pass the constable’s word forward', next: 'crowdSettles', effects: { setFlags: ['crowdFalseAlarm'] } },
  ], 'warning'),
  childClear: scene('childClear', 'A Child in Open Air', 'The child reaches the west gate with a scraped knee. The east stair is still jammed; the cart can be moved only after people stop pressing past it.', [
    { id: 'childOpenGate', label: 'Help widen the west-gate flow', next: 'crowdSettles', effects: { setFlags: ['crowdChildSafe'] } },
    { id: 'childClearTruth', label: 'Tell the constable the cry was false', next: 'crowdSettles', effects: { setFlags: ['crowdChildSafe', 'crowdFalseAlarm'] } },
  ]),
  cartClear: scene('cartClear', 'Room by the Wall', 'The cart rolls against the wall and opens another passage. You keep your hands clear of the wheel; a teamster steadies the shaft. The west gate is now the broadest way out.', [
    { id: 'cartGate', label: 'Guide people through the west gate', next: 'crowdSettles', effects: { setFlags: ['crowdGateOpened'] } },
    { id: 'cartChild', label: 'Check the fallen child by the pillar', next: 'childClear' },
  ]),
  calmCall: scene('calmCall', 'A Voice over the Heads', 'Your call slows the nearest rows. The constable confirms the hall is clear of fire and sends two stewards toward the east stair. The child and blocked cart still need attention.', [
    { id: 'callChild', label: 'Get the child to the west gate', next: 'childClear', effects: { setFlags: ['crowdFalseAlarm'] } },
    { id: 'callCart', label: 'Open the lane beside the cart', next: 'cartClear', effects: { setFlags: ['crowdFalseAlarm'] } },
  ]),
  crowdFall: scene('crowdFall', 'On the Stone Floor', 'You are knocked down and bruise your shoulder. Stewards open the west gate, but no one can move back against the surge until it thins. The child is still beside the pillar.', [
    { id: 'fallStayWall', label: 'Keep against the wall until the surge thins', next: 'crowdSettles', effects: { health: -1 } },
    { id: 'fallCrawlChild', label: 'Crawl to the child after the first wave', next: 'childClear', effects: { health: -1, setFlags: ['crowdFalseAlarm'] } },
  ], 'danger'),
  crowdSettles: scene('crowdSettles', 'The Hall Empties', 'The crowd reaches the open air without a crush. The constable confirms there was no fire; the shout came from a dropped lantern mistaken for flame. The child is safe only if you reached them, and the cart is clear only if someone moved it.', [
    { id: 'crowdReport', label: 'Give the stewards a clear account', next: 'crowdEnd', effects: { historyFlags: ['helped guide a crowd away from a false alarm'] } },
  ]),
  crowdEnd: end('crowdEnd', 'Outside the Exhibition Hall', 'The hall closes for inspection of the dropped lantern and the damaged stair rail. Stewards thank the people who opened another way out; the injured are taken to the fair’s first-aid tent.'),
}, 'platform');

export const THE_FERRY_LISTS = A('the-ferry-lists', 'The Ferry Lists', 'A loaded crossing takes water on one side and tilts toward the current.', 'disaster/rescue', 'SEVERE', 'A ferry’s uneven load makes saving passengers compete with cargo, livestock, and the boat itself.', {
  deck: scene('deck', 'Water at the Low Rail', 'The ferry is halfway across with twelve passengers, a mule, and two freight crates. Water enters at the downstream rail, and the deck lists toward it. The boatman says the bilge pump is jammed; the landing is still visible upstream.', [
    { id: 'movePassengers', label: 'Move passengers toward the high rail', next: 'balanced', effects: { setFlags: ['ferryPeopleMoved'] } },
    { id: 'dumpCrates', label: 'Push the freight crates overboard', next: 'cargoGone', effects: { setFlags: ['ferryCargoLost'] } },
    { id: 'freeMule', label: 'Free the mule from its stall rope', requirements: { usableItems: ['smallKnife'] }, next: 'muleDeck' },
    { id: 'reachPump', label: 'Clear the jammed bilge pump', requirements: { anyUsableItems: ['pocketToolkit', 'foremanMultiTool'] }, hint: 'The pump is below the listing rail and its handle is under strain.', chance: { probability: 0.61, successNext: 'pumpWorks', failureNext: 'ferrySwamped', successMessage: 'The jam clears and water begins to fall.', failureMessage: 'The pump rod snaps as the deck tilts farther.', failureEffects: { health: -1 } } },
  ], 'danger'),
  balanced: scene('balanced', 'The High Side', 'The passengers crowd the upper rail as the boatman turns the bow upstream. The ferry steadies, but water still leaks in and the mule keeps shifting. One crate can be cut loose; the landing is close enough to reach if the boat holds.', [
    { id: 'balanceCutCrate', label: 'Cut one crate loose', next: 'cargoGone', effects: { setFlags: ['ferryPeopleMoved', 'ferryCargoLost'] } },
    { id: 'balancePump', label: 'Work the jammed pump', requirements: { anyUsableItems: ['pocketToolkit', 'foremanMultiTool'] }, next: 'pumpWorks' },
    { id: 'balanceLanding', label: 'Keep the bow toward the landing', next: 'ferryLanding', effects: { setFlags: ['ferryPeopleMoved'] } },
  ], 'warning'),
  cargoGone: scene('cargoGone', 'Freight in the Current', 'The crates sink or drift away, taking the boat’s heavy side with them. The ferry rises a little, but water still crosses the low rail. The mule is braced against its stall; the landing is now the safest goal.', [
    { id: 'cargoSteer', label: 'Help steer for the landing', next: 'ferryLanding', effects: { setFlags: ['ferryCargoLost'] } },
    { id: 'cargoFreeMule', label: 'Free the mule before the turn', requirements: { usableItems: ['smallKnife'] }, next: 'muleDeck', effects: { setFlags: ['ferryCargoLost'] } },
  ]),
  muleDeck: scene('muleDeck', 'The Mule on the Deck', 'The mule is free but frightened. The boatman asks everyone to hold still while he turns for the landing; the bilge water is ankle-deep and the low rail is only a handspan above it.', [
    { id: 'muleLanding', label: 'Guide the mule toward the landing', next: 'ferryLanding', effects: { setFlags: ['ferryMuleSafe'] } },
    { id: 'mulePump', label: 'Try the bilge pump while it turns', requirements: { anyUsableItems: ['pocketToolkit', 'foremanMultiTool'] }, next: 'pumpWorks', effects: { setFlags: ['ferryMuleSafe'] } },
    { id: 'muleHold', label: 'Keep the passengers on the high side', next: 'ferrySwamped', effects: { setFlags: ['ferryMuleSafe'] } },
  ], 'warning'),
  pumpWorks: scene('pumpWorks', 'Water Falls below the Boards', 'The pump clears enough water for the boatman to keep the deck level. The ferry reaches the landing under its own power; a crate is lost only if you cut it loose, and the mule is safe only if freed.', [
    { id: 'pumpCount', label: 'Help count passengers at the landing', next: 'ferryAftermath', effects: { setFlags: ['ferryPeopleSaved'] } },
  ]),
  ferryLanding: scene('ferryLanding', 'The Bow Finds Mud', 'The boatman grounds the bow at the landing. Passengers step onto firm shore in pairs. Water remains in the hold, and one crate may have gone over; the ferry cannot make another crossing today.', [
    { id: 'landingCount', label: 'Check the deck against the passenger list', next: 'ferryAftermath', effects: { setFlags: ['ferryPeopleSaved'] } },
    { id: 'landingPump', label: 'Help bail from the shore side', next: 'ferryAftermath', effects: { setFlags: ['ferryPeopleSaved'] } },
  ]),
  ferrySwamped: scene('ferrySwamped', 'Water over the Deck', 'The ferry settles lower into the river. The boatman throws a line to the landing; the passengers can reach shore if they abandon the cargo and move one at a time.', [
    { id: 'swampLine', label: 'Send passengers along the shore line', requirements: { usableItems: ['travelRope'] }, next: 'ferryAftermath', effects: { damageItems: ['travelRope'], setFlags: ['ferryPeopleSaved', 'ferryCargoLost'] } },
    { id: 'swampSwim', label: 'Swim the short distance to the landing', hint: 'The current is strong and the ferry is turning broadside.', chance: { probability: 0.45, successNext: 'ferryAftermath', failureNext: 'ferryDeath', successMessage: 'You reach the mud landing and help pull a passenger in.', failureMessage: 'The current takes you away from the line.', failureEffects: { health: -4 } }, effects: { setFlags: ['ferryCargoLost'] } },
    { id: 'swampStay', label: 'Hold the passenger line from the deck', next: 'ferryAftermath', effects: { setFlags: ['ferryCargoLost'] } },
  ], 'danger'),
  ferryAftermath: scene('ferryAftermath', 'The Crossing Is Closed', 'The boat is moored and the passengers are counted. Cargo is lost if it was cut loose or remained aboard when the ferry flooded; the mule is safe only if freed. The boatman will not risk another crossing until the hull is patched.', [
    { id: 'ferryLeave', label: 'Walk with the passengers to the inn', next: 'ferryEnd', effects: { historyFlags: ['helped passengers reach shore from a listing ferry'] } },
  ]),
  ferryEnd: end('ferryEnd', 'A Ferry Moored for Repair', 'Passengers who reached the landing walk to the inn before dark; any unaccounted names remain on the boatman’s list. Cargo and mule have separate fates, recorded before the ferry is moored for repair.'),
  ferryDeath: end('ferryDeath', 'Below the Landing', 'The current pulls you under before the shore line can reach you.', 'death'),
}, 'deck');

export const THE_ROOF_COMES_IN = A('the-roof-comes-in', 'The Roof Comes In', 'A public hall sheds part of its roof while people shelter inside.', 'disaster/rescue', 'HIGH', 'Rescue routes change with the roof’s failing supports and the building’s remaining exits.', {
  hall: scene('hall', 'Dust in the Meeting Hall', 'A storm tears shingles from the town hall. Part of the roof drops across the west aisle; two people are visible near the east door, and a voice answers from behind the collapsed platform. The north wall is bowed. Rain still beats on the roof.', [
    { id: 'eastPair', label: 'Guide the visible pair through the east door', next: 'pairOut', effects: { setFlags: ['roofPairSafe'] } },
    { id: 'callPlatform', label: 'Call to the voice behind the platform', next: 'voiceAnswers' },
    { id: 'braceNorth', label: 'Brace the bowed wall with a bench', next: 'wallBraced', effects: { setFlags: ['roofWallBraced'] } },
    { id: 'leaveHall', label: 'Clear the outside door and call carpenters', next: 'roofCrew' },
  ], 'danger'),
  pairOut: scene('pairOut', 'Rain beyond the East Door', 'The two people reach the yard and move away from the walls. The voice behind the platform answers again. A carpenter outside says the north wall is bowing farther and can bring a long beam if the entry stays clear.', [
    { id: 'pairCallVoice', label: 'Ask the trapped person to keep answering', next: 'voiceAnswers' },
    { id: 'pairFetchBeam', label: 'Hold the door for the carpenter’s beam', next: 'wallBraced' },
    { id: 'pairRetreat', label: 'Keep everyone clear of the hall', next: 'roofCrew', effects: { setFlags: ['roofPairSafe'] } },
  ]),
  voiceAnswers: scene('voiceAnswers', 'A Voice under the Platform', 'The trapped person is conscious, with one leg pinned by a fallen bench rather than the roof. Dust keeps falling from the bowed north wall. You can reach them from the east side, or wait for the carpenter’s beam.', [
    { id: 'shiftBench', label: 'Lift the bench from the clear side', hint: 'The platform is stable; the north wall is not.', chance: { probability: 0.65, successNext: 'personOut', failureNext: 'roofSecondFall', successMessage: 'The bench shifts enough for the person to crawl free.', failureMessage: 'A roof brace cracks above the aisle.', failureEffects: { health: -1 } } },
    { id: 'waitBeam', label: 'Wait for the carpenter’s beam', next: 'wallBraced' },
    { id: 'markPosition', label: 'Mark the spot and withdraw', next: 'roofCrew' },
  ], 'warning'),
  wallBraced: scene('wallBraced', 'A Beam against the North Wall', 'The carpenter’s beam props the wall from the yard. The hall will not be safe for long, but the east aisle is open to the platform and the two visible people are already outside.', [
    { id: 'beamReach', label: 'Reach the person under the platform', next: 'personOut' },
    { id: 'beamKeepOut', label: 'Hold the doorway clear for rescuers', next: 'roofCrew' },
  ], 'warning'),
  personOut: scene('personOut', 'The Last Person Reaches Rain', 'The trapped person is outside with a strained ankle. The east pair are safe if you guided them out. The north wall remains braced only while the carpenter holds the beam in place.', [
    { id: 'roofFinalCount', label: 'Give the carpenter the room count', next: 'roofAftermath', effects: { setFlags: ['roofPersonSafe'] } },
  ]),
  roofSecondFall: scene('roofSecondFall', 'The Aisle Narrows', 'A brace cracks and a strip of roof falls across the west side. You retreat to the yard with a bruised arm. No one can safely reach the platform until the carpenters shore the north wall.', [
    { id: 'roofSecondCall', label: 'Tell the crew where the voice came from', next: 'roofCrew', effects: { health: -1 } },
  ], 'danger'),
  roofCrew: scene('roofCrew', 'Carpenters at the Door', 'The carpenters shore the north wall from outside and take over the search. People are counted in the yard; the person behind the platform is located only if you gave a clear position.', [
    { id: 'roofGiveAccount', label: 'Stay to give the rescue crew your account', next: 'roofAftermath', effects: { historyFlags: ['helped evacuate a town hall after roof collapse'] } },
  ]),
  roofAftermath: scene('roofAftermath', 'The Hall Is Closed', 'The roof is covered with canvas and the hall is closed until repaired. The rescued people are taken to the inn to be checked; the town meeting must move to the schoolroom.', [
    { id: 'roofLeave', label: 'Carry the warning to the schoolroom', next: 'roofEnd' },
  ]),
  roofEnd: end('roofEnd', 'A Meeting Moved Indoors', 'The town posts a notice on the schoolroom door and counts those rescued. The storm passes without another collapse; the hall will need a new roof before it can open.'),
  roofDeath: end('roofDeath', 'The North Wall', 'The bowed wall gives way before you can reach the east door.', 'death'),
}, 'hall');

export const THE_POWDER_WAGON = A('the-powder-wagon', 'The Powder Wagon', 'A wagon of blasting powder has overturned beside a busy road.', 'disaster/rescue', 'HIGH', 'The safe response is distance, warning, and controlling nearby ignition—not handling explosives.', {
  road: scene('road', 'A Cart on Its Side', 'A freight wagon lies on its side beside the rail works. A painted mark on its crate warns of blasting powder; one wheel still turns, and a lantern burns in a ditch ten paces away. Two workers are walking toward the wreck, unaware.', [
    { id: 'warnWorkers', label: 'Call the workers back from the wagon', next: 'workersBack', effects: { setFlags: ['powderWorkersWarned'] } },
    { id: 'signalRoad', label: 'Stop traffic beyond the bend', next: 'roadStopped' },
    { id: 'moveLantern', label: 'Draw the burning lantern away by its handle', hint: 'The flame is near the powder and the ground is scattered with splinters.', chance: { probability: 0.53, successNext: 'lanternMoved', failureNext: 'powderDeath', successMessage: 'You carry the lantern well back from the wreck.', failureMessage: 'The lantern falls among the wagon boards.' } },
    { id: 'approachCrate', label: 'Inspect the powder crates closely', hint: 'Do not touch or shift a marked crate beside a turning wheel.', next: 'powderRetreat', effects: { health: -1 } },
  ], 'danger'),
  workersBack: scene('workersBack', 'A Marked Load', 'The workers stop when you point out the warning mark. The lantern still burns in the ditch, and a team of horses is approaching from the road. No one should lift or open a powder crate.', [
    { id: 'warnTeam', label: 'Signal the team to stop short', next: 'roadStopped', effects: { setFlags: ['powderTeamHeld'] } },
    { id: 'lanternFromHere', label: 'Use the ditch bank to shield the flame', next: 'lanternMoved' },
    { id: 'sendForCrew', label: 'Send a worker for the blasting foreman', next: 'powderCrew' },
  ], 'warning'),
  roadStopped: scene('roadStopped', 'Traffic Held at the Bend', 'The road is clear around the wreck. The lantern is still burning near the boards, and the blasting foreman is on the rail works. Wind is carrying sparks away from the wagon for now.', [
    { id: 'roadLantern', label: 'Carry the lantern beyond the road ditch', next: 'lanternMoved' },
    { id: 'roadForeman', label: 'Wait for the powder foreman', next: 'powderCrew' },
  ], 'warning'),
  lanternMoved: scene('lanternMoved', 'Light Beyond the Danger Line', 'The flame is well away from the marked cargo. The foreman arrives with two workers and confirms the crates are still tied inside the wagon; they will be removed only after the road is closed and the wheel is blocked.', [
    { id: 'powderHoldLine', label: 'Keep travelers behind the bend', next: 'powderAftermath', effects: { setFlags: ['powderRoadClosed'] } },
    { id: 'powderAccount', label: 'Tell the foreman what moved and what did not', next: 'powderAftermath', effects: { knowledge: ['The powder crates stayed tied inside the overturned wagon; the danger was the nearby flame and passing traffic.'] } },
  ]),
  powderRetreat: scene('powderRetreat', 'A Safe Distance', 'You step back without touching the crates. The workers see the warning paint when you call it out; the horse team is stopped before the bend.', [
    { id: 'retreatWarn', label: 'Keep everyone beyond the bend', next: 'powderCrew', effects: { setFlags: ['powderWorkersWarned', 'powderTeamHeld'] } },
  ]),
  powderCrew: scene('powderCrew', 'The Blasting Foreman Arrives', 'The foreman blocks the road, extinguishes the ditch lantern from the safe side, and checks the wagon’s load marks. The powder remains contained. A wheelwright will right the wagon after the area is cleared.', [
    { id: 'powderHelpClear', label: 'Help guide the road crew around the bend', next: 'powderAftermath', effects: { historyFlags: ['helped isolate an overturned powder wagon without handling the cargo'] } },
  ]),
  powderAftermath: scene('powderAftermath', 'The Road Opens Again', 'The foreman confirms no crate was opened and no powder spilled. The workers and horse team are safe if they were stopped before reaching the wreck; the traffic delay lasts the rest of the afternoon.', [
    { id: 'powderLeave', label: 'Take the cleared road onward', next: 'powderEnd' },
  ]),
  powderEnd: end('powderEnd', 'No Spark Reaches the Load', 'The wagon is righted after the blasting crew arrives. You leave with the road open and the knowledge that the warning paint mattered more than curiosity.'),
  powderDeath: end('powderDeath', 'The Wagon Ignites', 'The flame reaches the powder load before anyone can get beyond the bend.', 'death'),
}, 'road');

export const AFTER_THE_TORNADO = A('after-the-tornado', 'After the Tornado', 'The storm has passed; daylight and help are both in short supply.', 'disaster/rescue', 'SEVERE', 'Aftermath triage allocates limited time among missing people, injured stock, fire risk, and blocked roads.', {
  crossroads: scene('crossroads', 'A Road under Broken Branches', 'The tornado has moved east. A farmhouse roof is torn open; a child is missing from the yard, a cow is pinned by a fallen gate, and smoke rises from the kitchen chimney at an odd angle. The north road is blocked, but the south lane is clear.', [
    { id: 'callMissing', label: 'Call for the missing child', next: 'childSearch' },
    { id: 'checkKitchen', label: 'Check the smoking kitchen first', next: 'stoveHazard' },
    { id: 'freeCow', label: 'Free the cow from the fallen gate', next: 'cowFreed' },
    { id: 'sendForHelp', label: 'Take the south lane for help', next: 'helpRider' },
  ], 'warning'),
  childSearch: scene('childSearch', 'A Reply near the Wash Shed', 'You hear a faint answer from the wash shed beyond the tree line. The south lane is open to a neighbor with a wagon. The smoke still rises from the kitchen, and the cow remains pinned.', [
    { id: 'reachChild', label: 'Follow the answer to the wash shed', next: 'childFound', effects: { setFlags: ['tornadoChildFound'] } },
    { id: 'callNeighbor', label: 'Call the neighbor to search with you', next: 'helpRider' },
    { id: 'childPrioritizeCow', label: 'Leave a clear signal and free the cow', next: 'cowFreed', effects: { setFlags: ['tornadoChildUnfound'] } },
  ]),
  stoveHazard: scene('stoveHazard', 'Smoke under the Eaves', 'The kitchen stove pipe has pulled loose, but the fire is low and no flame has reached the roof. The missing child’s tracks end near the wash shed; the cow is still pinned by the gate.', [
    { id: 'stoveSmother', label: 'Close the stove damper and clear the hearth', next: 'stoveSafe', effects: { setFlags: ['tornadoFireSafe'] } },
    { id: 'stoveChild', label: 'Call toward the wash shed', next: 'childSearch' },
    { id: 'stoveCow', label: 'Free the cow before the gate shifts', next: 'cowFreed' },
  ]),
  cowFreed: scene('cowFreed', 'The Cow Stands', 'The cow gets up with a cut flank and moves to the orchard. You have not treated it, but it can walk. The child and the kitchen still need attention; the south lane remains open.', [
    { id: 'cowChild', label: 'Follow the child’s tracks to the shed', next: 'childFound', effects: { setFlags: ['tornadoCowSafe'] } },
    { id: 'cowKitchen', label: 'Check the stove pipe before wind returns', next: 'stoveSafe', effects: { setFlags: ['tornadoCowSafe'] } },
    { id: 'cowGetHelp', label: 'Take the south lane for help', next: 'helpRider', effects: { setFlags: ['tornadoCowSafe'] } },
  ]),
  childFound: scene('childFound', 'Under the Wash Shed Bench', 'The child is frightened but unharmed beneath a bench. The kitchen smoke has thinned only if the stove was made safe; the cow is safe only if freed. A neighbor’s wagon is coming up the south lane.', [
    { id: 'childCheckHome', label: 'Bring the child to the farmhouse', next: 'tornadoAftermath', effects: { setFlags: ['tornadoChildFound'] } },
    { id: 'childWarnNeighbor', label: 'Bring the child to the farmhouse', next: 'tornadoAftermath', effects: { setFlags: ['tornadoChildFound'] } },
  ]),
  stoveSafe: scene('stoveSafe', 'A Hearth without Smoke', 'The stove is cold and the kitchen is safe for now. The house has lost part of its roof, so the family cannot stay through another storm. The child and cow are still unresolved.', [
    { id: 'safeSearch', label: 'Search the wash shed for the child', next: 'childFound', effects: { setFlags: ['tornadoFireSafe'] } },
    { id: 'safeCow', label: 'Check the fallen gate in the orchard', next: 'tornadoAftermath', effects: { setFlags: ['tornadoFireSafe', 'tornadoCowMoved'] } },
  ]),
  helpRider: scene('helpRider', 'Help on the South Lane', 'The neighbor arrives with a wagon and two blankets. They can carry the family and a person needing care, but cannot take the cow and household goods together. The north road remains blocked by fallen trees.', [
    { id: 'loadFamily', label: 'Load the family and anyone injured', next: 'tornadoAftermath', effects: { setFlags: ['tornadoFamilyMoved'] } },
    { id: 'sendNeighborSearch', label: 'Ask the neighbor to search the wash shed', next: 'tornadoAftermath', effects: { setFlags: ['tornadoFamilyMoved'] } },
    { id: 'leaveCow', label: 'Use the wagon for the cow instead', next: 'tornadoAftermath', effects: { setFlags: ['tornadoCowMoved'] } },
  ]),
  tornadoAftermath: scene('tornadoAftermath', 'A House No One Can Keep Tonight', 'The family moves to the schoolhouse before dusk. The child, cow, and stove are accounted for only according to what was found, moved, or secured. The damaged roof and blocked north road will take a crew, not one traveler, to repair.', [
    { id: 'tornadoReport', label: 'Give the neighbors a list of what remains', next: 'tornadoEnd', effects: { knowledge: ['The south lane remained open after the tornado; the north road was blocked by fallen trees.'], historyFlags: ['helped a farm family triage tornado damage'] } },
  ]),
  tornadoEnd: end('tornadoEnd', 'The Schoolhouse Shelter', 'Neighbors organize the next day’s search and repair. The family shelters at the schoolhouse. The child is with them only if found at the wash shed; the cow is safe only if freed or moved, and the stove was made safe only if its feed was shut. The damaged roof still needs a crew.'),
}, 'crossroads');

export const THE_SECOND_WAVE = A('the-second-wave-large', 'The Second Wave', 'The first rescue is over when the river sends another surge downstream.', 'disaster/rescue', 'SEVERE', 'A second surge turns apparent rescue into another evacuation decision.', {
  bank: scene('bank', 'Clear of the First Surge', 'You have just helped two people from a river skiff onto the near bank. Their boat is caught in willow roots. Upstream, a line of dark debris rides a sudden rise in the river; a third traveler is on a gravel spit below the bend.', [
    { id: 'warnSpit', label: 'Shout to the traveler on the gravel spit', next: 'travelerHears', effects: { setFlags: ['waveTravelerWarned'] } },
    { id: 'moveRescued', label: 'Take the two rescued people uphill', next: 'peopleUphill', effects: { setFlags: ['waveFirstPairSafe'] } },
    { id: 'signalBoat', label: 'Signal the ferry landing for help', next: 'landingSignal' },
    { id: 'reachSpit', label: 'Wade toward the gravel spit', hint: 'The debris line is moving faster than a person can wade.', chance: { probability: 0.28, successNext: 'travelerHears', failureNext: 'waveDeath', successMessage: 'You reach the near edge and shout a warning.', failureMessage: 'The surge catches you before you reach the spit.' } },
  ], 'danger'),
  travelerHears: scene('travelerHears', 'A Reply from the Spit', 'The traveler hears but cannot cross the channel. The surge is carrying branches and fence boards. The two people you rescued are at the water’s edge unless you moved them uphill.', [
    { id: 'travelerUseRope', label: 'Throw a line from the high bank', requirements: { usableItems: ['travelRope'] }, next: 'lineRescue', effects: { damageItems: ['travelRope'] } },
    { id: 'travelerSignal', label: 'Signal the landing crew upstream', next: 'landingSignal' },
    { id: 'travelerMovePair', label: 'Get the first pair beyond the flood mark', next: 'peopleUphill', effects: { setFlags: ['waveFirstPairSafe'] } },
  ], 'warning'),
  peopleUphill: scene('peopleUphill', 'Above the Flood Mark', 'The first pair are safe above the bank. The traveler remains on the spit, and the surge is still upstream. The old tow path climbs to a stone marker where a signal can be seen from the landing.', [
    { id: 'uphillSignal', label: 'Signal from the stone marker', next: 'landingSignal', effects: { setFlags: ['waveFirstPairSafe'] } },
    { id: 'uphillRope', label: 'Lower your rope from the high bank', requirements: { usableItems: ['travelRope'] }, next: 'lineRescue', effects: { damageItems: ['travelRope'], setFlags: ['waveFirstPairSafe'] } },
    { id: 'uphillRetreat', label: 'Retreat farther from the river', next: 'waveAftermath', effects: { setFlags: ['waveFirstPairSafe', 'waveTravelerUnreached'] } },
  ]),
  landingSignal: scene('landingSignal', 'The Landing Bell Answers', 'A ferry crew answers from upstream but cannot cross until the surge passes. They can launch a small rescue boat from the far landing afterward. The traveler must stay above the debris line until then.', [
    { id: 'waitHigh', label: 'Keep everyone at the stone marker', next: 'waveAftermath', effects: { setFlags: ['waveFirstPairSafe'] } },
    { id: 'lineWhileWait', label: 'Hold a rope ready from the high bank', requirements: { usableItems: ['travelRope'] }, next: 'lineRescue', effects: { damageItems: ['travelRope'] } },
  ], 'warning'),
  lineRescue: scene('lineRescue', 'The Line Goes Tight', 'The rope reaches the gravel spit, but the current is pulling sideways. The traveler can clip on and wait for the smaller boat, or try to cross the last shallow channel while it is still visible.', [
    { id: 'clipWait', label: 'Secure the traveler and hold the line', next: 'waveAftermath', effects: { setFlags: ['waveTravelerSaved'] } },
    { id: 'crossShallow', label: 'Cross the shallow channel together', hint: 'Debris is already entering the channel; a fall may be fatal.', chance: { probability: 0.46, successNext: 'waveAftermath', failureNext: 'waveDeath', successMessage: 'You cross before the surge reaches the spit.', failureMessage: 'A branch strikes the line and pulls you into the current.', failureEffects: { health: -3 } }, effects: { setFlags: ['waveTravelerSaved'] } },
  ], 'danger'),
  waveAftermath: scene('waveAftermath', 'After the Second Surge', 'The debris line passes and the river drops again. People reach high ground only if moved or secured there; the boat and any loose cargo have gone. A rescue crew will search the banks at first light for anyone still missing.', [
    { id: 'waveAccount', label: 'Give the crew your last known positions', next: 'waveEnd', effects: { knowledge: ['The second river surge arrived after the first skiff rescue and carried debris through the lower channel.'], historyFlags: ['warned others after a second river surge'] } },
  ]),
  waveEnd: end('waveEnd', 'The River Recedes', 'The rescued pair are safe if they reached the high marker; the third traveler is safe only if the line or crew reached them. The second surge makes the rescue incomplete for anyone whose position was lost in the debris.'),
  waveDeath: end('waveDeath', 'In the Second Surge', 'The debris-filled surge pulls you under before you can reach the high bank.', 'death'),
}, 'bank');

export const DISASTER_RESCUE_ADVENTURES: Scenario[] = [THE_BRIDGE_GOES_DOWN, SMOKE_OVER_MAIN_STREET, THE_TRAIN_THAT_DIDNT_STOP, THE_MINE_GIVES_WAY, WATER_THROUGH_THE_DOOR, THE_BOILER_ROOM, THE_CROWD_BREAKS, THE_FERRY_LISTS, THE_ROOF_COMES_IN, THE_POWDER_WAGON, AFTER_THE_TORNADO, THE_SECOND_WAVE];
