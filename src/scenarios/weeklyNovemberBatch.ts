import type { Choice, Scenario, Scene } from '../types';

const n = (id: string, title: string, text: string, choices: Choice[], tone: Scene['tone'] = 'safe'): Scene => ({ id, title, text, choices, tone });
const e = (id: string, title: string, text: string): Scene => ({ id, title, text, ending: 'success', choices: [] });
const yearRound = { season: 'ALL_YEAR' as const, weightBoost: 1 };

/** Individually authored November 2026 scenarios; shared helpers only construct scene records. */
export const WEEKLY_NOVEMBER_ADVENTURES: Scenario[] = [
  {
    id: 'the-slipway-at-low-water', title: 'The Slipway at Low Water', subtitle: 'A boat is settling against a stone ramp as the harbor empties faster than its owner expected.', startScene: 'ramp',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'At a tidal slipway, a shallow launch ramp and a settling boat make unloading order matter more than force.', availability: yearRound },
    scenes: {
      ramp: n('ramp', 'Keel on the Lower Course', 'At the stone slipway, the tide is ebbing and a small cargo boat has settled onto its lower boards. The keel is supported, but the stern cargo still presses toward the water. Owner Jorin offers two coins for help unloading the light cargo or keeping the hull steady until the next tide.', [
        { id: 'checkLanding', label: 'Walk the ramp and identify the firm unloading stones', next: 'stones' },
        { id: 'askJorin', label: 'Ask which cargo must stay dry first', next: 'cargo' },
        { id: 'takeLine', label: 'Check the shore line before anyone shifts the load', next: 'line' },
      ], 'warning'),
      stones: n('stones', 'A Firm Place to Stand', 'Two broad stones remain wet but level above the water. The lowest plank flexes under a boot; it is not a safe place for a heavy lift.', [
        { id: 'markFirmStones', label: 'Mark the level stones as the only unloading place', next: 'plan' },
        { id: 'askForHands', label: 'Ask the crew to bring the light crates ashore first', next: 'cargo' },
      ]),
      cargo: n('cargo', 'What Must Stay Dry', 'Jorin names a flour sack and a wrapped tin of boat fittings. Neither is urgent enough to justify stepping onto the flexing plank; the rest can wait for the next tide.', [
        { id: 'unloadSmallCargo', label: 'Unload the two named pieces from the firm stones', next: 'work' },
        { id: 'waitForTide', label: 'Leave the cargo aboard until the water rises', next: 'waited' },
      ]),
      line: n('line', 'A Line under Strain', 'The bow line is sound but has gone taut against a low ring. It can hold the boat steady while the crew unloads from shore; it cannot pull the hull back into deeper water.', [
        { id: 'useHook', label: 'Use a carried Boat Hook to draw slack toward shore', next: 'hooked', requirements: { usableGear: ['boatHook'] }, unavailableText: 'No usable Boat Hook is carried.' },
        { id: 'callCrew', label: 'Ask the crew to ease the line while you watch the hull', next: 'plan' },
      ]),
      hooked: n('hooked', 'Slack within Reach', 'The hook brings the line clear of the low ring, but the boat remains settled on the ramp. The crew still needs to keep the cargo centered as it comes ashore.', [
        { id: 'keepLoadCentered', label: 'Unload the flour and fittings from the level stones', next: 'work' },
        { id: 'stopForTide', label: 'Stop and wait for the rising water', next: 'waited' },
      ]),
      plan: n('plan', 'A Shore-Side Order', 'Jorin agrees that the keel should stay supported. The crew can unload the two light pieces first, or wait and keep all cargo aboard; nobody needs to stand on the flexing plank.', [
        { id: 'beginLightUnload', label: 'Unload only the named light cargo from shore', next: 'work' },
        { id: 'holdLoad', label: 'Keep the cargo aboard until the tide returns', next: 'waited' },
      ]),
      work: n('work', 'The Stern Comes Level', 'The flour and fittings come ashore without shifting the heavier crates. The hull settles more evenly, though it remains grounded until the next tide.', [
        { id: 'acceptWage', label: 'Take the agreed two-coin unloading wage', next: 'paid', effects: { money: 2, historyFlags: ['helped_unload_slipway_cargo_at_low_water'] } },
        { id: 'declineWage', label: 'Leave the wage with Jorin for the next crew', next: 'unpaidHelp', effects: { historyFlags: ['declined_slipway_unloading_wage'] } },
      ]),
      paid: e('paid', 'A Level Boat at Rest', 'The two named pieces are dry on shore, the hull rests evenly on the ramp, and Jorin pays the agreed wage. The heavier cargo stays aboard for the returning tide.'),
      unpaidHelp: e('unpaidHelp', 'Cargo Kept Dry', 'The flour and fittings are safe on shore and the hull rests evenly. You leave the agreed wage with Jorin for the crew that will bring the heavier cargo in.'),
      waited: e('waited', 'The Water Will Return', 'No cargo is moved while the boat is grounded. Jorin keeps watch on the line and will resume unloading when the water lifts the hull.'),
    },
  },
  {
    id: 'the-salt-grass-after-the-surge', title: 'The Salt Grass after the Surge', subtitle: 'A salt gatherer must decide which flats can still be worked after storm water crosses the low beds.', startScene: 'flats',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A small salt harvest is partly crossed by surge water, so tested quality and a buyer’s deadline compete.', availability: yearRound },
    scenes: {
      flats: n('flats', 'A White Edge, a Wet Center', 'On the open salt flats, the outer ridges have dried white while a lower pan is still covered by a thin sheet of surge water. Gatherer Orla has one buyer arriving before noon and asks which beds can be offered honestly.', [
        { id: 'tasteSample', label: 'Compare a dry ridge sample with a damp-center sample', next: 'samples' },
        { id: 'checkChannels', label: 'Walk the shallow outlet channel before gathering', next: 'outlet' },
        { id: 'askBuyerTerms', label: 'Ask the buyer what quality the order requires', next: 'terms' },
      ]),
      samples: n('samples', 'Two Different Crystals', 'The ridge sample is clean and dry. The lower pan tastes brackish and carries a trace of dark silt; it should not be mixed into the same sack.', [
        { id: 'separateBeds', label: 'Keep the dry ridge salt separate from the lower pan', next: 'terms' },
        { id: 'leaveLowerPan', label: 'Leave the lower pan untouched until it dries', next: 'outlet' },
      ]),
      outlet: n('outlet', 'Where the Surge Went', 'The outlet is clear at the far end, but the lowest channel still holds standing water. It can drain by afternoon; forcing a cut now would wash more mud across the bed.', [
        { id: 'waitDrain', label: 'Let the shallow channel drain before returning', next: 'terms' },
        { id: 'workDryRidge', label: 'Gather only the already-dry ridge salt', next: 'sorted' },
      ]),
      terms: n('terms', 'A Smaller Honest Lot', 'The buyer will accept a smaller lot today if its source is clear. Orla can sell the dry ridge salt for the offered two coins or keep it for a later order; the lower pan is not ready.', [
        { id: 'sellDryLot', label: 'Sell the dry ridge lot for the agreed two coins', next: 'sold', effects: { money: 2, historyFlags: ['sold_separate_dry_salt_lot_after_surge'] } },
        { id: 'holdLot', label: 'Hold the salt rather than promise the larger amount', next: 'held' },
      ]),
      sorted: n('sorted', 'A Clean Sack, a Smaller Yield', 'The dry ridge salt fills only part of a sack. When the buyer returns to the flats, they offer two coins for this smaller lot; the lower bed remains separate and unpromised.', [
        { id: 'offerSmallLot', label: 'Offer the smaller dry lot at the stated price', next: 'sold', effects: { money: 2, historyFlags: ['sold_separate_dry_salt_lot_after_surge'] } },
        { id: 'keepForLater', label: 'Keep the salt for a later order', next: 'held' },
      ]),
      sold: e('sold', 'The Lot Stays Honest', 'The buyer takes only the dry ridge salt and pays the agreed two coins. The lower pan drains on its own time, without being passed off as part of the clean lot.'),
      held: e('held', 'A Bed Left to Dry', 'Orla keeps the gathered salt off the scale. The buyer leaves without the larger lot, and the lower pan remains separate until its water drains.'),
    },
  },
  {
    id: 'the-towline-at-bent-post', title: 'The Towline at the Bent Post', subtitle: 'A canal barge reaches a leaning towpath post just as the current begins to turn.', startScene: 'bend',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A moving barge and a damaged towpath post make release timing more important than pulling harder.', availability: yearRound },
    scenes: {
      bend: n('bend', 'The Line Starts to Sing', 'A loaded barge moves along the canal under tow. At a sharp bend, the line scrapes a post whose base has lifted from the bank. The barge is not yet against it; if the line catches, the horse team could be pulled off the towpath.', [
        { id: 'signalDriver', label: 'Signal the teamster to slow before the bend', next: 'slowed' },
        { id: 'inspectBank', label: 'Check the post from the firm path edge', next: 'bank' },
        { id: 'callCrew', label: 'Call the barge crew to ready a controlled release', next: 'crew' },
      ], 'warning'),
      slowed: n('slowed', 'The Team Holds Back', 'The teamster eases the horses to a walk. The line slackens, but the barge keeps drifting with the canal current and needs the crew to guide its bow clear.', [
        { id: 'releaseOnSignal', label: 'Call for the crew to release the line at slack', next: 'release' },
        { id: 'waitForBarge', label: 'Wait for the crew to bring the bow alongside', next: 'alongside' },
      ]),
      bank: n('bank', 'The Post Cannot Take a Pull', 'The post leans toward the water and its earth has cracked. It may hold a loose line, but it cannot take the barge’s full moving weight.', [
        { id: 'markPost', label: 'Mark the post out of use and warn the teamster', next: 'slowed', effects: { historyFlags: ['marked_bent_canal_towpost_unsafe'] } },
        { id: 'useHook', label: 'Use a carried Boat Hook to guide the loose line clear', next: 'hook', requirements: { usableGear: ['boatHook'] }, unavailableText: 'No usable Boat Hook is carried.' },
      ]),
      crew: n('crew', 'Hands at the Bow', 'The barge crew hears you and moves to the bow. They can control the vessel if the towline is eased; nobody has yet released it or shifted the cargo.', [
        { id: 'easeLine', label: 'Ask the teamster to ease while the crew takes the bow', next: 'release' },
        { id: 'stopTow', label: 'Stop the team and bring the barge alongside', next: 'alongside' },
      ]),
      hook: n('hook', 'A Line Drawn from the Post', 'The hook lifts the slack line over the broken edge. It does not secure the barge; the crew must still take the bow before the team moves again.', [
        { id: 'crewTakeBow', label: 'Have the crew guide the barge clear before towing', next: 'release' },
        { id: 'holdForTie', label: 'Keep the team stopped until a sound tie is chosen', next: 'alongside' },
      ]),
      release: n('release', 'The Barge Clears the Bend', 'The team eases, the crew guides the bow, and the loose line comes free before it reaches the cracked post. The cargo stays aboard and the barge makes no claim on the weakened bank.', [
        { id: 'recordPost', label: 'Mark the post and report it to the canal keeper', next: 'reported', effects: { historyFlags: ['prevented_towline_from_loading_bent_post'] } },
        { id: 'continueTow', label: 'Continue only after the team takes the clear bank line', next: 'continued' },
      ]),
      alongside: e('alongside', 'Stopped before the Post', 'The barge is brought to the bank before the damaged post can take its weight. The tow waits for a sound line and a repair; the cargo remains aboard.'),
      reported: e('reported', 'A Warning Left at the Bend', 'The keeper receives the location of the cracked post, and the tow resumes along the clear bank line. Your warning records a hazard; it does not certify the post repaired.'),
      continued: e('continued', 'A Clear Line for the Tow', 'The team uses the open bank line and the barge clears the bend. The bent post remains out of service for the canal keeper to inspect.'),
    },
  },
  {
    id: 'the-net-floats-behind-the-breakwater', title: 'The Net Floats behind the Breakwater', subtitle: 'A fishing crew finds its net snagged on stone as the water begins to turn through the harbor mouth.', startScene: 'harbor',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A snagged fishing net can be recovered only by choosing how much gear to risk as the tide turns.', availability: yearRound },
    scenes: {
      harbor: n('harbor', 'A Line under the Stone', 'Behind the breakwater, a net float is pinned below the surface where the harbor current curls around a submerged stone. The crew owns the net and has a small open boat alongside; no one is in the water. They ask whether to recover the net before the turn.', [
        { id: 'watchFloat', label: 'Watch the float through one passing surge', next: 'surge' },
        { id: 'askCrewPlan', label: 'Ask the crew which part of the net is still clear', next: 'plan' },
        { id: 'measureFromShore', label: 'Sound from the breakwater before moving the boat', next: 'depth' },
      ], 'warning'),
      surge: n('surge', 'The Float Goes Under', 'The float disappears on the strongest pull and returns on the weaker one. The net is not carrying a person, but a hard pull at the wrong moment could tear its lead line.', [
        { id: 'waitWeakPull', label: 'Wait for the weaker pull and recover only the clear edge', next: 'edge' },
        { id: 'leaveNet', label: 'Leave the net until the next safe water', next: 'left' },
      ]),
      plan: n('plan', 'The Clear Edge', 'The crew can hold the boat on the lee side and take in the loose upper mesh. The lead line remains caught; the crew will not row over it or ask anyone to dive.', [
        { id: 'takeLooseMesh', label: 'Bring in the loose mesh and leave the lead line', next: 'edge' },
        { id: 'waitForTurn', label: 'Keep the boat clear until the current slackens', next: 'left' },
      ]),
      depth: n('depth', 'A Reachable Edge', 'A marked pole used by the crew finds firm bottom just beyond the wall, then a deeper pocket at the snag. Sounding from shore can compare depth; it cannot hook the net or make the boat safe over the pocket.', [
        { id: 'useBoatHook', label: 'Use a carried Boat Hook on the loose upper mesh', next: 'edge', requirements: { usableGear: ['boatHook'] }, unavailableText: 'No usable Boat Hook is carried.' },
        { id: 'stayOnShore', label: 'Leave the net and keep the boat on the lee side', next: 'left' },
      ]),
      edge: n('edge', 'A Smaller Catch of Net', 'The crew recovers the upper mesh without disturbing the lead line. The net is usable but incomplete; the trapped section will need slack water and a better angle.', [
        { id: 'markForReturn', label: 'Mark the snag and return with the next slack tide', next: 'marked' },
        { id: 'acceptLoss', label: 'Cut only the damaged lead section loose', next: 'cut' },
      ]),
      marked: e('marked', 'The Net Waits for Slack Water', 'The crew keeps the recovered mesh and leaves the trapped lead line where it is. The snag is marked for a return at slack water; no one claims the full net was recovered.'),
      cut: e('cut', 'A Net Shorter by One Section', 'The crew cuts away only the caught lead section and keeps the rest of the net. The lost piece remains beneath the stone, and the boat returns to the lee side.'),
      left: e('left', 'A Safer Tide to Come', 'The boat stays on the lee side and the net remains snagged. The crew will return only when the current gives them a safer angle.'),
    },
  },
  {
    id: 'the-quarry-weighbridge', title: 'The Quarry Weighbridge', subtitle: 'A stone cart rocks on the yard scale, and the quarry clerk wants a weight before the next team arrives.', startScene: 'yard',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A rocking quarry platform threatens the accuracy of a load record and the next cart’s safe approach.', availability: yearRound },
    scenes: {
      yard: n('yard', 'A Needle that Will Not Settle', 'At the open quarry yard, a loaded handcart stands on the weighing platform. Its needle swings even after the wheels stop. Clerk Fenna has one copied tare for a different cart and offers three coins if you can witness an accurate tally before the next team arrives.', [
        { id: 'checkPlatform', label: 'Look at the platform corners while the cart stays still', next: 'corners' },
        { id: 'compareTare', label: 'Compare the cart mark with the old tare sheet', next: 'sheet' },
        { id: 'holdNextCart', label: 'Ask the next team to wait beyond the painted line', next: 'queue' },
      ]),
      corners: n('corners', 'One Corner Sinks', 'The rear corner drops a finger-width when the cart crosses it. The platform is not level under load, so the moving needle cannot certify a weight.', [
        { id: 'closeScale', label: 'Close the scale until the platform is checked', next: 'closed' },
        { id: 'moveToFirmPad', label: 'Move the cart to the firm marked pad for counting', next: 'pad' },
      ]),
      sheet: n('sheet', 'A Tare for Another Cart', 'The sheet names a narrow two-wheel cart; this load sits on a wider quarry wagon. Subtracting the old tare would create a precise-looking but unsupported net weight.', [
        { id: 'keepGrossOnly', label: 'Record the gross reading as unsettled', next: 'closed' },
        { id: 'inspectPlatform', label: 'Check the platform before deciding whether to weigh again', next: 'corners' },
      ]),
      queue: n('queue', 'Room beyond the Line', 'The next team waits on firm ground beyond the painted line. The loaded cart can be moved off the scale first, but the platform should remain closed until its corner is checked.', [
        { id: 'clearPlatform', label: 'Move the cart to the firm marked pad', next: 'pad' },
        { id: 'postNotice', label: 'Post a notice that the scale is not giving a settled reading', next: 'closed' },
      ]),
      pad: n('pad', 'Count the Load without a False Weight', 'The cart is off the platform and its blocks are counted against the order. This confirms the number of blocks, not their exact weight; the next load can wait for a level scale.', [
        { id: 'takeWitnessPay', label: 'Accept the agreed three-coin tally wage', next: 'paid', effects: { money: 3, historyFlags: ['witnessed_quarry_load_count_without_false_weight'] } },
        { id: 'leaveRecordUnsigned', label: 'Leave the weight line unsigned until recalibration', next: 'unsigned' },
      ]),
      closed: e('closed', 'The Scale Is Closed', 'Fenna marks the scale out of service and keeps the gross reading unsettled. The next team waits on firm ground; no unsupported tare is entered.'),
      paid: e('paid', 'A Tally with Its Limits', 'The clerk pays the agreed witness wage for counting the blocks. The book records quantity only; the scale and net weight remain unverified.'),
      unsigned: e('unsigned', 'No Weight Invented', 'The quarry cart stays off the scale and the weight line stays unsigned. Fenna will reopen the bridge only after the platform is checked.'),
    },
  },
  {
    id: 'lime-kiln-windward-stack', title: 'The Lime Kiln’s Windward Stack', subtitle: 'A shifting wind carries hot kiln dust toward the workers’ shelter before the burn is finished.', startScene: 'kiln',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A lime-burn crew must decide whether to protect the batch or move people as a hot dust plume changes direction.', availability: yearRound },
    scenes: {
      kiln: n('kiln', 'The Wind Turns across the Yard', 'At the open lime yard, a banked kiln is still hot. A gust turns its pale dust toward the crew shelter, where two workers are eating. The kiln tender can close the upper vent slowly, but doing so may spoil the batch; approaching the hot mouth is unsafe.', [
        { id: 'warnWorkers', label: 'Call the workers out of the shelter first', next: 'cleared' },
        { id: 'watchWind', label: 'Watch the plume from the marked cool line', next: 'plume' },
        { id: 'askTender', label: 'Ask the tender what can be closed from the lever side', next: 'lever' },
      ], 'danger'),
      cleared: n('cleared', 'The Shelter Is Empty', 'The workers move behind the stone wall before the next gust. Dust still crosses the yard, and the batch remains hot; nobody has changed the kiln vent.', [
        { id: 'holdFromWall', label: 'Keep everyone behind the wall until the gust passes', next: 'waited' },
        { id: 'askLever', label: 'Have the tender assess the cool-side vent lever', next: 'lever' },
      ]),
      plume: n('plume', 'A Narrower Drift', 'The cloud thins between gusts but still moves across the shelter door. The marked line remains outside the hot ground; a quiet interval is not proof the wind has settled.', [
        { id: 'keepShelterClosed', label: 'Keep the shelter closed and wait for a steady direction', next: 'waited' },
        { id: 'callTender', label: 'Ask the tender to use the cool-side lever', next: 'lever' },
      ]),
      lever: n('lever', 'The Cool-Side Lever', 'The tender shows the lever that partly closes the upper vent from behind a stone screen. It can reduce the plume and may spoil this burn; it cannot cool the kiln at once.', [
        { id: 'closePartly', label: 'Have the tender partly close the vent while you watch the yard', next: 'reduced' },
        { id: 'protectBatch', label: 'Keep the vent setting and hold people behind the wall', next: 'waited' },
      ]),
      reduced: n('reduced', 'Dust Falls Short of the Shelter', 'The tender partly closes the vent from the cool side. The plume falls short of the shelter, but the batch will need another check before it can be called sound.', [
        { id: 'recordBatchLoss', label: 'Record the interrupted burn for the kiln owner', next: 'recorded', effects: { historyFlags: ['stopped_lime_kiln_dust_reaching_crew_shelter'] } },
        { id: 'waitForCooling', label: 'Keep the yard clear until the kiln cools', next: 'waited' },
      ]),
      recorded: e('recorded', 'The Yard Kept Clear', 'The workers remain behind the wall while the kiln cools. The owner knows the batch was interrupted; no one claims the lime is ready or the kiln repaired.'),
      waited: e('waited', 'A Burn Left Unjudged', 'The crew stays behind the stone wall until the tender can check the wind and the kiln. The batch may be spoiled, but no worker is asked to cross the hot dust.'),
    },
  },
  {
    id: 'the-split-fir-mark', title: 'The Split Fir Mark', subtitle: 'A timber crew pauses before cutting a tree whose faded mark may mean leave it standing.', startScene: 'fork',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A forestry crew checks an ambiguous tree mark against the current field register before an irreversible cut.', availability: yearRound },
    scenes: {
      fork: n('fork', 'The Fir before the Cut', 'A coppice crew has paused before a split fir whose old white mark is partly hidden by bark. The crew’s copied sheet lists the next trees to fell but does not explain this mark. Forester Vale offers two coins for a field record before the saws start.', [
        { id: 'compareMarks', label: 'Compare the fir with nearby current paint marks', next: 'ridge' },
        { id: 'inspectBark', label: 'Read the faded mark without cutting or scraping bark', next: 'mark' },
        { id: 'askCrew', label: 'Ask what the copied felling sheet says', next: 'hollow' },
      ], 'warning'),
      hollow: n('hollow', 'A Sheet without a Mark Key', 'The crew’s copied sheet lists numbered stems but no color key. It cannot tell them whether the old white stripe is a retention mark or a route note, and the saws remain on the ground.', [
        { id: 'askForester', label: 'Ask Vale to check the current retention register', next: 'tally' },
        { id: 'holdCrew', label: 'Keep the crew paused until the register is checked', next: 'setdown' },
      ]),
      mark: n('mark', 'White Paint under Weathered Bark', 'The white stripe continues around the split but has faded at the tree’s shaded side. It is not a fresh route mark, and the bark should not be scraped to make it easier to read.', [
        { id: 'checkRegister', label: 'Compare the mark with Vale’s current tree register', next: 'tally' },
        { id: 'leaveUncut', label: 'Leave the fir uncut until Vale returns', next: 'left' },
      ]),
      ridge: n('ridge', 'A Different Color on the Cut Line', 'Nearby stems listed for felling carry fresh red paint. The split fir’s white mark is older and different; color suggests a distinction, but only the current register can establish what it means.', [
        { id: 'verifyWhiteMark', label: 'Have Vale verify the white mark against retention notes', next: 'tally' },
        { id: 'stopForToday', label: 'Keep the saws down rather than guess at the mark', next: 'left' },
      ]),
      tally: n('tally', 'Retain the Split Fir', 'Vale’s current retention note assigns the white mark to trees left standing along the coppice edge. The fir is not part of today’s cut; Vale can record the check and send the crew to listed red-marked stems.', [
        { id: 'recordRetention', label: 'Record the checked mark and reassign the crew', next: 'shifted', effects: { money: 2, historyFlags: ['recorded_split_fir_retention_mark_before_cut'] } },
        { id: 'delayWork', label: 'Leave the lot unchanged until the forester returns', next: 'left' },
      ]),
      setdown: n('setdown', 'The Saws Stay on the Ground', 'No one has cut the fir. The crew’s copy does not include a key for the white paint; Vale can compare the retention note now or return with the register later.', [
        { id: 'checkBeforeCut', label: 'Ask Vale to check the retention note before cutting', next: 'tally' },
        { id: 'endForNow', label: 'End the work until the register is brought back', next: 'left' },
      ]),
      shifted: e('shifted', 'A Mark Read before the Saw', 'Vale pays the two-coin field-record wage and reassigns the crew to listed stems. The split fir remains standing under its retention mark; no one treats nearby red marks as permission to cut it.'),
      left: e('left', 'An Uncut Tree and a Waiting Crew', 'The saws stay down and the fir remains standing. The work waits for Vale’s current register, so the faded mark is not guessed at or turned into a route instruction.'),
    },
  },
  {
    id: 'the-churchyard-drain', title: 'The Churchyard Drain', subtitle: 'Rainwater is cutting a new channel between old stones and the public footpath.', startScene: 'path',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A churchyard caretaker and a road warden disagree about diverting runoff without disturbing unmarked ground.', availability: yearRound },
    scenes: {
      path: n('path', 'Water between the Stones', 'After heavy rain, a narrow runoff channel crosses the churchyard path and carries loose soil toward two old markers. Caretaker Eda asks for help before Sunday foot traffic returns; the road warden says a shallow diversion could follow the outer wall.', [
        { id: 'traceWater', label: 'Follow the water from the upper path to the wall', next: 'source' },
        { id: 'checkMarkers', label: 'Ask Eda which stones must not be moved', next: 'stones' },
        { id: 'askWarden', label: 'Ask the warden where the public path can drain', next: 'warden' },
      ]),
      source: n('source', 'The Channel Begins above the Gate', 'The runoff begins at a broken gutter outside the yard. Filling the cut inside the graveyard would hide the water for a day but send the next rain across the same stones.', [
        { id: 'repairGutter', label: 'Ask the warden to clear the gutter before filling soil', next: 'warden' },
        { id: 'keepPathClosed', label: 'Close the narrow path until the source is corrected', next: 'closed' },
      ]),
      stones: n('stones', 'Old Names, No New Boundary', 'Eda can identify the two marked stones, but the ground beyond them has no reliable boundary. No one should dig or relocate earth there to make a neat channel.', [
        { id: 'divertAlongWall', label: 'Lay a shallow surface run along the outer wall', next: 'wall' },
        { id: 'markAndWait', label: 'Mark the wet section and wait for the warden', next: 'closed' },
      ]),
      warden: n('warden', 'A Public Path, a Private Yard', 'The warden will clear the gutter and can lay a shallow surface run outside the markers. The churchyard can remain open if the path is tested before Sunday.', [
        { id: 'testWallRun', label: 'Help set the surface run along the outer wall', next: 'wall' },
        { id: 'waitForCrew', label: 'Leave the path closed until the warden’s crew arrives', next: 'closed' },
      ]),
      wall: n('wall', 'The Water Takes the Outer Edge', 'The shallow run follows the wall and drains beyond the gate. A bucket of rainwater confirms the path; this small test does not prove the gutter will hold through another storm.', [
        { id: 'reopenWithNotice', label: 'Reopen the path with a note about the new channel', next: 'open' },
        { id: 'keepMarked', label: 'Keep the edge marked for the warden’s next inspection', next: 'marked' },
      ]),
      open: e('open', 'A Path Kept Above the Water', 'The path opens with the channel visible along the outer wall. Eda keeps the two old markers undisturbed, and the warden will inspect the gutter after the next heavy rain.'),
      marked: e('marked', 'A Small Test, Not a Promise', 'The surface run drains the test water, but the path remains marked for inspection. No one treats one bucket as proof against the next storm.'),
      closed: e('closed', 'A Path Held until the Gutter Is Clear', 'The narrow section stays closed while the warden addresses the broken gutter. The stones remain undisturbed, and Sunday visitors are directed along the outer walk.'),
    },
  },
  {
    id: 'the-steps-at-st-brigids-yard', title: 'The Steps at St. Brigid’s Yard', subtitle: 'A funeral party reaches a stone stair whose middle tread has shifted in the rain.', startScene: 'steps',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A funeral route needs a dignified alternative when a familiar exterior stair has become uneven.', availability: yearRound },
    scenes: {
      steps: n('steps', 'The Middle Tread', 'Outside St. Brigid’s yard, the stone steps climb from the lane to the chapel door. Rain has shifted the middle tread, leaving one edge high. The funeral party is waiting below; the sexton can open a longer level path through the side gate.', [
        { id: 'checkTread', label: 'Check whether the shifted stone can move under a light foot', next: 'test' },
        { id: 'askSexton', label: 'Ask how the side gate route meets the chapel walk', next: 'side' },
        { id: 'warnParty', label: 'Tell the party the steps are uneven before anyone climbs', next: 'wait' },
      ], 'warning'),
      test: n('test', 'A Stone That Rocks', 'The tread rocks under a careful test. No one has fallen, but a person carrying a wreath could catch a foot on the raised edge.', [
        { id: 'barSteps', label: 'Keep the steps closed until the stone is reset', next: 'closed' },
        { id: 'openSide', label: 'Use the level side path with the sexton’s help', next: 'side' },
      ]),
      side: n('side', 'The Longer Level Walk', 'The side gate opens onto a level gravel walk around the yard. It adds several minutes, but the party can walk without crossing the loose tread.', [
        { id: 'guideParty', label: 'Guide the party along the level walk', next: 'arrival' },
        { id: 'waitForRepair', label: 'Ask the party to wait for a mason to check the step', next: 'closed' },
      ]),
      wait: n('wait', 'A Pause at the Lane', 'The party knows the middle tread is loose. The sexton can open the side walk now, or everyone can wait until a mason checks the stone.', [
        { id: 'takeSide', label: 'Open the side gate and take the longer level walk', next: 'arrival' },
        { id: 'waitMason', label: 'Keep the party at the lane until the step is checked', next: 'closed' },
      ]),
      arrival: n('arrival', 'At the Chapel Door', 'The party reaches the chapel without using the shifted tread. The sexton keeps the side gate open for the return and asks the mason to reset the stone before the steps reopen.', [
        { id: 'stayForReturn', label: 'Stay to guide the return along the side walk', next: 'returned' },
        { id: 'leaveRouteMarked', label: 'Leave the side route marked for the sexton', next: 'marked' },
      ]),
      returned: e('returned', 'The Longer Way Back', 'The party returns along the level walk. The funeral has reached its destination without using the loose tread; the stone remains closed for repair.'),
      marked: e('marked', 'A Route Left Clear', 'The side gate stays open and marked for the return. The party reaches the chapel, and no one claims the shifted stone has been repaired.'),
      closed: e('closed', 'The Steps Stay Closed', 'The sexton directs the party to wait or use the lane while a mason is called. The middle tread is not treated as safe just because it held one light test.'),
    },
  },
  {
    id: 'the-east-orchard-water-turn', title: 'The East Orchard Water Turn', subtitle: 'A shared irrigation race cannot serve the upper and lower rows at once before dusk.', startScene: 'race',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'Two orchard leases depend on one short water turn, and the chosen sequence affects which rows receive irrigation before dark.', availability: yearRound },
    scenes: {
      race: n('race', 'One Gate, Two Rows', 'At East Orchard, the irrigation race feeds an upper leased row and a lower family row. A storm has filled the channel with leaves, and there is enough water for one full turn before dusk. Keeper Maud asks you to help clear the gate and record the order.', [
        { id: 'clearGate', label: 'Clear leaves from the shared gate without opening it', next: 'gate' },
        { id: 'askUpper', label: 'Ask the upper grower what the next dry day will cost', next: 'upper' },
        { id: 'askLower', label: 'Ask the lower family what they can lose by waiting', next: 'lower' },
      ]),
      gate: n('gate', 'Leaves, Not a Broken Hinge', 'The gate moves freely once the leaves are lifted. Its notches show the last turn ended at the lower row, but not who was promised the next one.', [
        { id: 'compareBook', label: 'Check Maud’s turn book before releasing water', next: 'book' },
        { id: 'leaveClosed', label: 'Keep the gate closed until both growers are present', next: 'held' },
      ]),
      upper: n('upper', 'A Row Close to Picking', 'The upper apples are nearly ready and can be picked tomorrow if watered today. The grower does not claim priority over the lower row, but asks that the turn be recorded.', [
        { id: 'checkOrder', label: 'Check the written order before opening the gate', next: 'book' },
        { id: 'offerSplit', label: 'Ask both growers whether a shorter split turn will help', next: 'split' },
      ]),
      lower: n('lower', 'A Young Row below the Race', 'The lower trees are newly planted and their roots sit in dry ground. The family can wait one day if the race is opened tomorrow, but they do not know the upper row’s condition.', [
        { id: 'checkOrder', label: 'Check the written order before opening the gate', next: 'book' },
        { id: 'offerSplit', label: 'Ask both growers whether a shorter split turn will help', next: 'split' },
      ]),
      book: n('book', 'The Turn Written for Today', 'Maud’s book gives the next full turn to the upper row. The lower family accepts tomorrow’s turn if the date is written beside the gate, not left to memory.', [
        { id: 'recordUpper', label: 'Open the full turn for the upper row and record tomorrow below', next: 'upperFlow', effects: { historyFlags: ['recorded_east_orchard_water_turns_for_both_rows'] } },
        { id: 'askBoth', label: 'Bring both growers to agree before water is released', next: 'split' },
      ]),
      split: n('split', 'A Short Turn for Each', 'Both growers agree to a short first flow if Maud can close the gate between rows. She offers one coin for the gate work and written sequence; the water will reach neither row as deeply as a full turn.', [
        { id: 'splitFlow', label: 'Run the agreed short turns and mark the sequence', next: 'splitEnd', effects: { money: 1, historyFlags: ['recorded_east_orchard_water_turns_for_both_rows'] } },
        { id: 'keepFullTurn', label: 'Use the written full turn and schedule the lower row tomorrow', next: 'upperFlow', effects: { historyFlags: ['recorded_east_orchard_water_turns_for_both_rows'] } },
      ]),
      upperFlow: e('upperFlow', 'A Turn Kept in the Book', 'The upper row receives the full flow, and tomorrow’s lower-row turn is written beside the gate. The families know what was watered and when the next turn is due.'),
      splitEnd: e('splitEnd', 'Two Short Flows before Dusk', 'Both rows receive a shallow first flow. Maud pays one coin for the gate work; neither row is described as fully watered, and the next turn remains on the board.'),
      held: e('held', 'Water Held until the Growers Meet', 'The gate remains closed while Maud brings both growers together. The leaves are cleared, but no water or priority is assigned in their absence.'),
    },
  },
  {
    id: 'the-rain-board-above-the-bee-boxes', title: 'The Rain Board above the Bee Boxes', subtitle: 'A beekeeper’s cover has slid in a gust, and a warm rain is moving toward the apiary.', startScene: 'apiary',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A shifted apiary cover needs attention without opening a hive or asking an untrained traveler to handle bees.', availability: yearRound },
    scenes: {
      apiary: n('apiary', 'A Cover on the Windward Edge', 'On a warm afternoon, beekeeper Nella finds one rain board shifted across a row of closed hive boxes. The bees are at the entrances, not swarming. A light rain is moving in, and she asks you to help without opening a box or standing in the flight path.', [
        { id: 'checkClearPath', label: 'Check the clear path between the shed and the hives', next: 'path' },
        { id: 'askNellaMethod', label: 'Ask how Nella can reseat the board from the lee side', next: 'method' },
        { id: 'waitForLull', label: 'Wait behind the marked line for the gust to ease', next: 'lull' },
      ]),
      path: n('path', 'A Clear Walk between Boxes', 'The shed stands behind the hive row, with a wide path along the lee fence. A spare board rests on the shed’s outside rack; it belongs to Nella and is not part of your carried equipment.', [
        { id: 'bringSpareBoard', label: 'Bring Nella’s spare board along the lee path', next: 'ready' },
        { id: 'clearPathOnly', label: 'Move the empty crate that blocks the lee path', next: 'method' },
      ]),
      method: n('method', 'Nella Keeps the Hive Closed', 'Nella will lift the windward edge from the lee side while you keep the spare board clear of the bees’ flight path. The hive boxes stay shut; no smoke, veil, or hive tool is needed from you.', [
        { id: 'standByShed', label: 'Stand by the shed and pass the board when asked', next: 'ready' },
        { id: 'leaveToNella', label: 'Leave the hive row to Nella and keep the path clear', next: 'closed' },
      ]),
      lull: n('lull', 'The Gust Lets Go', 'The cover stops lifting for a moment. Nella can catch its lower edge from behind the fence; the hives remain closed and the path on the lee side is clear.', [
        { id: 'bringBoard', label: 'Bring the spare board along the lee path', next: 'ready' },
        { id: 'letNellaWork', label: 'Let Nella reseat the cover while you stay behind the line', next: 'secured' },
      ]),
      ready: n('ready', 'The Board at the Lee Fence', 'The spare board reaches the fence without crossing the bees’ flight path. Nella can set it over the shifted cover from the inside edge; one corner may need a second support after the rain passes.', [
        { id: 'holdBoardEdge', label: 'Hold the board’s outer edge from beyond the marked line', next: 'secured' },
        { id: 'leaveBoardForNella', label: 'Set the board down and let Nella fit it alone', next: 'secured' },
      ]),
      secured: n('secured', 'The Cover Sits Flat', 'Nella seats the board without opening the hive. The first rain beads on the outer surface; the corner support still needs a daylight check when the wind has settled.', [
        { id: 'leaveSupportMarked', label: 'Mark the corner for Nella’s daylight check', next: 'watched' },
        { id: 'closeWork', label: 'Leave the closed boxes with Nella for the next check', next: 'closed' },
      ]),
      watched: e('watched', 'A Cover Checked from the Outside', 'The boxes remain closed and the bee path stays clear. Nella will inspect the corner support in daylight; the rain board has not been treated as a repair to the hive itself.'),
      closed: e('closed', 'The Hive Row Left to Its Keeper', 'Nella keeps the hive row and its cover under her care. The bees remain undisturbed, and the path stays clear while the rain passes.'),
    },
  },
  {
    id: 'the-charcoal-watch-under-wind', title: 'The Charcoal Watch under Wind', subtitle: 'A charcoal burner sees ash lift from a cooling mound as the wind shifts toward a dry brush line.', startScene: 'mound',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A remote charcoal mound is cooling beside dry brush, and the traveler must distinguish a passing ash lift from a spreading ground fire.', availability: yearRound },
    scenes: {
      mound: n('mound', 'Ash over the Brush', 'At a woodland charcoal camp, one cooling mound gives off a thin ash plume. A fresh gust carries it toward dry brush. No flame is visible outside the earth cover, and burner Osric says opening the mound could feed the heat with air.', [
        { id: 'inspectGround', label: 'Check the brush line from the cleared earth path', next: 'ground' },
        { id: 'askBurner', label: 'Ask Osric where the water pail and damp earth stand', next: 'tools' },
        { id: 'callCrew', label: 'Call the other burner before approaching the mound', next: 'crew' },
      ], 'danger'),
      ground: n('ground', 'No Flame beyond the Clearing', 'The brush holds no visible ember or smoke. Ash has settled on the cleared path; the wind is still shifting, so the mound remains watched rather than opened.', [
        { id: 'wetBrushEdge', label: 'Dampen the nearest brush edge from the clear path', next: 'damp' },
        { id: 'watchAnotherGust', label: 'Keep a second person watching through the next gust', next: 'watch' },
      ]),
      tools: n('tools', 'Water and Earth beside the Shed', 'The camp has a full pail and damp earth at the shed. These can cool an exposed ember from the clearing; they cannot make the sealed mound safe to open.', [
        { id: 'usePail', label: 'Dampen the brush edge from the clearing', next: 'damp' },
        { id: 'leaveMoundSealed', label: 'Keep the mound sealed and post a second watcher', next: 'watch' },
      ]),
      crew: n('crew', 'Two People at the Clearing', 'The second burner arrives with a shovel. They can watch opposite edges of the clearing while you and Osric decide whether to dampen the nearest brush.', [
        { id: 'splitWatch', label: 'Set two watches and leave the mound sealed', next: 'watch' },
        { id: 'dampenTogether', label: 'Dampen the brush edge together from clear ground', next: 'damp' },
      ]),
      damp: n('damp', 'The Nearest Brush Is Wet', 'Water darkens the brush nearest the mound. No flame had crossed the clearing, and the cooling cover stays closed while the burners check the wind again.', [
        { id: 'recordWatch', label: 'Record the wind shift and keep the mound under watch', next: 'safe', effects: { historyFlags: ['watched_charcoal_mound_through_wind_shift'] } },
        { id: 'leaveCamp', label: 'Leave the cooling mound for its assigned burners', next: 'handoff' },
      ]),
      watch: n('watch', 'A Watch through the Gust', 'The wind falls and no ember reaches the brush. The burners keep the mound sealed; its heat and the dry line still need watching until cooling is complete.', [
        { id: 'stayUntilSettled', label: 'Stay for the next check and report the wind change', next: 'safe', effects: { historyFlags: ['watched_charcoal_mound_through_wind_shift'] } },
        { id: 'leaveWatch', label: 'Hand the watch back to Osric and depart', next: 'handoff' },
      ]),
      safe: e('safe', 'A Clearing Kept Clear', 'The brush edge remains damp and the mound stays sealed through the next check. The wind has passed without a ground fire; the burners continue their ordinary cooling watch.'),
      handoff: e('handoff', 'The Watch Returns to Its Crew', 'Osric and the second burner take over the cooling watch. No fire crossed the cleared path, and the mound remains sealed.'),
    },
  },
  {
    id: 'the-spring-below-the-ridge', title: 'The Spring below the Ridge', subtitle: 'A remote camp’s water trough has gone dry, though the spring still runs somewhere below the ridge.', startScene: 'camp',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A remote camp must distinguish a blocked feeder from a dry spring before moving its water stores.', availability: yearRound },
    scenes: {
      camp: n('camp', 'An Empty Trough', 'At a ridge camp, the trough is dry but the spring box still makes a faint sound beneath the slope. The camp cook has one barrel for drinking and asks whether to spend it searching or carry it to the next station.', [
        { id: 'traceFeeder', label: 'Follow the feeder channel from the box to the trough', next: 'channel' },
        { id: 'checkSpring', label: 'Listen at the spring box before opening it', next: 'box' },
        { id: 'measureSlope', label: 'Use a carried sounding rod to check the runoff ditch', next: 'ditch', requirements: { usableGear: ['collapsibleSoundingRod'] }, unavailableText: 'No usable Collapsible Sounding Rod is carried.' },
      ]),
      channel: n('channel', 'A Leaf Plug at the Bend', 'A mat of leaves blocks the open feeder channel. Water reaches the bend and stops; the trough itself is intact, and the drinking barrel remains sealed.', [
        { id: 'clearPlug', label: 'Clear the leaf plug from the bank without opening the box', next: 'flow' },
        { id: 'carryBarrel', label: 'Keep the barrel sealed and carry it onward', next: 'depart' },
      ]),
      box: n('box', 'Water behind the Cover', 'The spring box is damp and cool. Its cover is fastened; opening it could introduce soil, and the sound alone does not show whether the feeder is blocked.', [
        { id: 'followChannel', label: 'Check the open feeder channel first', next: 'channel' },
        { id: 'leaveBoxClosed', label: 'Leave the box closed and ration the sealed barrel', next: 'depart' },
      ]),
      ditch: n('ditch', 'A Shallow Side Run', 'The rod finds a shallow side run full of leaves. It can compare depth from the bank, but it cannot prove the spring’s supply or make the slope safe to enter.', [
        { id: 'clearSideRun', label: 'Clear the shallow run from the firm bank', next: 'flow' },
        { id: 'stopSearch', label: 'Stop the search before the bank softens', next: 'depart' },
      ]),
      flow: n('flow', 'The Trough Fills Slowly', 'Water moves through the cleared feeder and begins to refill the trough. It is a small flow, not a promise of a full camp supply; the barrel remains sealed for drinking.', [
        { id: 'recordSource', label: 'Mark the feeder bend for the next camp hand', next: 'marked' },
        { id: 'leaveWithBarrel', label: 'Leave the water barrel sealed and move on', next: 'depart' },
      ]),
      marked: e('marked', 'A Source Marked, a Barrel Kept', 'The feeder trickles into the trough, and the next camp hand will know where the leaves gathered. The drinking barrel stays sealed; the spring has not been measured for a full day.'),
      depart: e('depart', 'Water Kept for the Road', 'The cook keeps the sealed barrel for drinking and the spring box closed. The dry trough remains unresolved for the next camp hand.'),
    },
  },
  {
    id: 'the-knife-grinders-sunday-wheel', title: 'The Knife-Grinder’s Sunday Wheel', subtitle: 'A traveling sharpener has time for one more blade before the market bell, but the wheel is running unevenly.', startScene: 'stall',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A mobile knife grinder must decide whether to take one more customer when a wheel begins to run unevenly.', availability: yearRound },
    scenes: {
      stall: n('stall', 'A Wheel that Wavers', 'At an open Sunday market, grinder Pavo pedals a small stone wheel. Its edge has begun to wobble, and one customer is waiting with a kitchen knife while another has already paid for a short draw. Pavo asks you to watch the wheel before taking another blade.', [
        { id: 'watchWheel', label: 'Watch the wheel’s edge against the fixed guide', next: 'wobble' },
        { id: 'askCustomer', label: 'Ask the waiting customer how much edge they need', next: 'need' },
        { id: 'checkStand', label: 'Check whether the stand has shifted on the paving', next: 'stand' },
      ]),
      wobble: n('wobble', 'A Wide Turn at the Rim', 'The stone stays on its axle but the rim moves side to side. A light draw might still take an edge, though the customer would receive uneven work; the stand itself has not been checked.', [
        { id: 'stopWheel', label: 'Stop the wheel before another blade is brought near', next: 'stopped' },
        { id: 'inspectStand', label: 'Check the stand feet before judging the stone', next: 'stand' },
      ]),
      need: n('need', 'A Job That Can Wait', 'The customer needs a clean edge for kitchen work tomorrow, not an emergency cut today. They can return after the wheel is checked, though Pavo will lose this sale.', [
        { id: 'offerReturn', label: 'Offer a return after the stand and stone are checked', next: 'stopped' },
        { id: 'askForInspectionPay', label: 'Ask Pavo to inspect the stand before grinding', next: 'inspection' },
      ]),
      stand: n('stand', 'A Loose Foot', 'One stand foot rests on a raised paving stone. Pavo can level the stand with a proper shim from the kit; a carried Carpenter’s Square could compare the frame but would not stabilize it.', [
        { id: 'useSquare', label: 'Use a carried Carpenter’s Square to compare the frame', next: 'compared', requirements: { usableGear: ['carpenterSquare'] }, unavailableText: 'No usable Carpenter’s Square is carried.' },
        { id: 'askPavoToShim', label: 'Have Pavo stop and level the stand with his own shim', next: 'leveled' },
      ]),
      compared: n('compared', 'A Comparison, Not a Repair', 'The frame is square, but the loose foot still rocks on the paving. Pavo’s own shim can level the stand; your square has not repaired the wheel.', [
        { id: 'letPavoLevel', label: 'Let Pavo level the stand before he tests the wheel', next: 'leveled' },
        { id: 'closeForToday', label: 'Close the stall without another grinding job', next: 'closed' },
      ]),
      leveled: n('leveled', 'A Test Draw on the Spare Stone', 'Pavo levels the stand and makes one light draw on a spare stone. The rim still wavers, so he offers one coin for the stand check and closes the stall until the wheel is trued.', [
        { id: 'takeInspectionCoin', label: 'Accept one coin for the stand check and lost time', next: 'paid', effects: { money: 1, historyFlags: ['helped_close_grinder_stall_before_uneven_blade_work'] } },
        { id: 'declineInspectionCoin', label: 'Decline payment and leave the customer informed', next: 'closed' },
      ]),
      inspection: e('inspection', 'No Blade on an Uneven Stone', 'Pavo checks the stand and tells the customer why the work must wait. The market closes without a new blade being ground.'),
      stopped: e('stopped', 'The Wheel Stopped in Time', 'Pavo stops the wheel before bringing another blade near it. The waiting customer can return after the stone and stand are checked.'),
      paid: e('paid', 'A Stall Closed with Its Work Honest', 'Pavo pays one coin for the inspection help, then closes the stall. No customer receives a finished edge from the uneven wheel.'),
      closed: e('closed', 'A Job for Another Day', 'The stall closes and the customer is told to return after the wheel is checked. No blade was ground on the wavering stone.'),
    },
  },
  {
    id: 'the-queue-at-market-cross', title: 'The Queue at Market Cross', subtitle: 'A repair stall’s waiting customers have crowded the public pump lane just as water carriers arrive.', startScene: 'market',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A market repairer must keep customer work moving while restoring a clear approach to the public hand pump.', availability: yearRound },
    scenes: {
      market: n('market', 'The Pump Lane Fills', 'At Market Cross, repairer Ren’s waiting customers have formed a queue across the marked approach to the public hand pump. Two water carriers arrive with empty casks. Ren has an apprentice at the stall and offers two coins for moving the bench and recording a clear queue line.', [
        { id: 'checkPaintedLine', label: 'Check the pump’s marked access arc from the public lane', next: 'arc' },
        { id: 'askCarriers', label: 'Ask the water carriers how much space their casks need', next: 'carriers' },
        { id: 'askRen', label: 'Ask Ren how long the repair queue can wait', next: 'customers' },
      ]),
      arc: n('arc', 'The Painted Access Arc', 'A white arc around the pump leaves room for a person to draw water and turn a full cask. Ren’s bench sits just inside it; moving the bench back to the stall line would clear the approach but narrow the waiting space.', [
        { id: 'moveToStallLine', label: 'Move the bench back to Ren’s marked stall line', next: 'layout' },
        { id: 'pauseForCasks', label: 'Close repairs until the carriers have filled their casks', next: 'closed' },
      ]),
      carriers: n('carriers', 'A Straight Pull for the Casks', 'The carriers need a straight approach so they can set each full cask beside the pump without lifting it over the queue. They can wait a short while, but the next public filling turn must remain clear.', [
        { id: 'moveBenchFirst', label: 'Ask Ren and the apprentice to move the bench now', next: 'layout' },
        { id: 'serveCasksFirst', label: 'Pause repairs until both carriers draw water', next: 'closed' },
      ]),
      customers: n('customers', 'Repairs That Can Wait a Turn', 'Ren’s customers have left boots and two harness straps at the stall. The apprentice can keep the work safe while Ren shifts the bench; no repair is damaged by a brief pause.', [
        { id: 'shiftTogether', label: 'Move the bench with Ren and the apprentice', next: 'layout' },
        { id: 'closeForTurn', label: 'Close repairs until the public pump is clear', next: 'closed' },
      ]),
      layout: n('layout', 'A Queue beside the Stall', 'Ren and the apprentice move the bench behind the marked stall line. The pump arc is clear, the repair queue now waits along the seller row, and the boots and straps stay on the work board.', [
        { id: 'acceptPay', label: 'Accept Ren’s two coins and chalk the new queue line', next: 'recorded', effects: { money: 2, historyFlags: ['marked_market_repair_queue_clear_of_public_pump'] } },
        { id: 'declinePay', label: 'Decline payment and leave the space for Ren to mark', next: 'clear' },
        { id: 'checkNextTurn', label: 'Wait for the next cask before finishing the layout', next: 'deferred' },
      ]),
      recorded: e('recorded', 'A Clear Turn at the Pump', 'The pump approach remains open and the customers wait along the seller row. Ren pays two coins for the bench move and a visible chalk queue line; the repairs resume at their stall.'),
      clear: e('clear', 'The Pump Lane Stays Open', 'The bench remains behind the stall line and the pump arc is clear. Ren keeps the offered coins and continues the repairs after the carriers leave.'),
      deferred: e('deferred', 'One More Cask before the Mark', 'The bench is back from the pump arc, but the queue line is not yet chalked. Ren finishes the layout after the next public filling turn.'),
      closed: e('closed', 'The Carriers Take Their Turn', 'Ren pauses repairs until the water carriers fill their casks. The pump approach clears for public use, and the work waits safely on the board.'),
    },
  },
  {
    id: 'the-fish-cart-before-the-toll', title: 'The Fish Cart before the Toll', subtitle: 'A chilled fish load reaches the toll road with a cracked slat and a delay at the weighing shed.', startScene: 'cart',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A moving fish cart must choose between a quick toll crossing and a load check that risks missing the market window.', availability: yearRound },
    scenes: {
      cart: n('cart', 'A Slat under the Basket', 'A fish cart waits before the toll road. One side slat is cracked below the top basket, and the toll keeper is weighing a wagon ahead. The fishmonger offers one coin for safe extra handling before the ice begins to melt.', [
        { id: 'checkLoad', label: 'Check how the baskets sit over the cracked slat', next: 'load' },
        { id: 'askTollkeeper', label: 'Ask whether the cart can wait off the road', next: 'space' },
        { id: 'offerBrace', label: 'Ask the fishmonger what can support the basket', next: 'brace' },
      ], 'warning'),
      load: n('load', 'Weight over the Split', 'The heavy basket rests directly above the crack. The lower basket is light enough to move by hand; crossing now could drop the top load into the road.', [
        { id: 'unstack', label: 'Move the heavy basket to the ground before crossing', next: 'ground' },
        { id: 'delay', label: 'Wait for help rather than lift it alone', next: 'space' },
      ]),
      space: n('space', 'A Shoulder off the Road', 'The toll keeper points to a level shoulder beyond the gate. The cart can wait there without blocking the line, but the market window will grow shorter.', [
        { id: 'moveShoulder', label: 'Move the cart onto the level shoulder and ask for support', next: 'brace' },
        { id: 'askFishmonger', label: 'Ask the fishmonger to bring the spare board', next: 'brace' },
      ]),
      brace: n('brace', 'A Spare Board on the Cart', 'The fishmonger carries a short board for keeping baskets apart. It can spread the load for a short handcart move, but it cannot repair the split slat or support a fast crossing.', [
        { id: 'fitBoard', label: 'Fit the board and walk the cart across slowly', next: 'crossing' },
        { id: 'unloadInstead', label: 'Unload the heavy basket and cross with a lighter cart', next: 'ground' },
      ]),
      ground: n('ground', 'The Heavy Basket on Firm Ground', 'The basket is lowered beside the cart. The fishmonger can ask for another pair of hands or carry the load in two trips; the cracked slat stays visible.', [
        { id: 'twoTrips', label: 'Carry the lighter baskets across in two trips', next: 'market', effects: { money: 1, historyFlags: ['carried_fish_cart_load_across_toll_in_two_trips'] } },
        { id: 'waitHelper', label: 'Wait for a second handler before lifting the basket', next: 'waited' },
      ]),
      crossing: n('crossing', 'A Slow Crossing', 'The board holds the baskets during a slow walk, but the cracked slat still flexes. The cart reaches the far shoulder; the fishmonger must choose whether to stop at the market or return for a proper repair.', [
        { id: 'sellToday', label: 'Take the cart to the nearby market before the ice melts', next: 'market', effects: { money: 1, historyFlags: ['crossed_toll_with_supported_fish_cart_load'] } },
        { id: 'repairFirst', label: 'Keep the load on the shoulder and repair the slat first', next: 'waited' },
      ]),
      market: e('market', 'Fish Delivered, Cart Still Needing Repair', 'The baskets reach the market before the ice melts. The fishmonger pays the agreed coin for the extra handling; the cracked slat remains a repair, not a completed fix.'),
      waited: e('waited', 'The Cart Held off the Road', 'The load stays on firm ground and the cart does not cross with the split slat unsupported. The market window may pass while another handler or a repair is arranged.'),
    },
  },
  {
    id: 'the-temporary-line-at-hayfield', title: 'The Temporary Line at Hayfield', subtitle: 'Two tenant families need a workable grazing boundary before the surveyor can return with the land book.', startScene: 'field',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A temporary pasture agreement records competing tenant needs without asking a traveler to make a legal boundary ruling.', availability: yearRound },
    scenes: {
      field: n('field', 'A Line Needed for Tonight', 'At Hayfield, two tenant families share the pasture until the land surveyor returns with the estate book tomorrow. The west flock needs the near trough; the east family has cut hay on the far strip. Neither old stake remains, and neither family asks you to decide who owns the ground.', [
        { id: 'checkFieldBook', label: 'Read the surveyor’s temporary-use note', next: 'record' },
        { id: 'askBothTenants', label: 'Ask what each family needs before morning', next: 'meeting' },
        { id: 'walkPublicEdge', label: 'Trace the visible fence and trough from the lane', next: 'edge' },
      ]),
      record: n('record', 'A Short Agreement, Not a Title', 'The surveyor’s note allows both families to use the near trough tonight and reserves the cut hay for the tenant who mowed it. It is a one-day arrangement, not proof of the legal boundary.', [
        { id: 'readTermsTogether', label: 'Read the temporary terms to both families', next: 'meeting' },
        { id: 'deferToSurveyor', label: 'Keep the pasture unchanged until the surveyor returns', next: 'deferred' },
      ]),
      edge: n('edge', 'Fence and Trough', 'The existing fence encloses the trough but does not mark the hay strip. From the public lane you can show both families where the water access lies; you cannot establish the buried boundary from these visible features.', [
        { id: 'bringThemTogether', label: 'Bring both tenants to discuss a one-night arrangement', next: 'meeting' },
        { id: 'leaveNoMarker', label: 'Leave the disputed strip unmarked for the surveyor', next: 'deferred' },
      ]),
      meeting: n('meeting', 'Use through Morning', 'The west tenant agrees to share the trough if the sheep stay inside the old fence. The east tenant will leave the cut hay stacked until the land book is checked. Both know this settles tonight’s use only.', [
        { id: 'recordTemporaryUse', label: 'Write the one-night terms for both families', next: 'agreed', effects: { money: 2, historyFlags: ['recorded_temporary_hayfield_use_until_survey'] } },
        { id: 'waitForSurveyor', label: 'Leave the disputed strip unused until the surveyor returns', next: 'deferred' },
      ]),
      agreed: e('agreed', 'A Temporary Line Everyone Can See', 'Both families receive the written one-night terms, and the surveyor pays two coins for the field record. The hay strip remains with the tenant who cut it; the legal boundary is still for the land book to establish.'),
      deferred: e('deferred', 'The Ground Left Unassigned', 'Neither family uses the disputed strip tonight. The visible fence and trough remain as they were, and the surveyor will return with the estate book before any line is treated as settled.'),
    },
  },
  {
    id: 'the-wheel-that-ticks-at-willow-bend', title: 'The Wheel That Ticks at Willow Bend', subtitle: 'A steady millwheel begins to strike once every turn while a customer’s grain is already in the hopper.', startScene: 'race',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A miller chooses whether to stop an uneven wheel mid-batch, preserving grain quality at the cost of a delayed order.', availability: yearRound },
    scenes: {
      race: n('race', 'A Tick at Every Turn', 'At Willow Bend Mill, a clear tick sounds once each time the waterwheel passes its lowest point. Miller Sorn has a small customer batch in the hopper. The wheel is turning at its ordinary pace; the tick is new, but no one has touched the machinery.', [
        { id: 'checkTailrace', label: 'Look from the platform for a changing wheel speed', next: 'ford' },
        { id: 'askAboutBatch', label: 'Ask Sorn how much grain is already between the stones', next: 'wheel' },
        { id: 'listenAtBearing', label: 'Listen at the bearing from behind the rail', next: 'handle' },
      ]),
      ford: n('ford', 'The Water Runs Evenly', 'The tailrace carries a steady flow, and the wheel’s pace does not surge. The tick repeats as one paddle reaches the lower turn; the sound seems to come from the axle side, not the race gate.', [
        { id: 'askSornCheckBearing', label: 'Ask Sorn to check the axle bearing from the platform', next: 'handle' },
        { id: 'stopToListen', label: 'Ask Sorn to stop the wheel before another batch', next: 'closedRace' },
      ]),
      wheel: n('wheel', 'Grain in the Stones', 'A small measure of grain is already between the stones. If Sorn stops now, that portion must be sifted out before the stones start again; another full sack has not been fed.', [
        { id: 'stopBeforeNextSack', label: 'Ask Sorn to stop before feeding the next sack', next: 'closedRace' },
        { id: 'finishCurrentSack', label: 'Let Sorn finish this sack while you watch the tick', next: 'handle' },
      ]),
      handle: n('handle', 'A Mark on the Bearing Cap', 'From behind the rail, the tick aligns with a fresh bright mark on the bearing cap. Only Sorn can stop and inspect the mill’s own mechanism; the Traveler has no reason to reach across the guard.', [
        { id: 'askSornRelease', label: 'Have Sorn stop and inspect the bearing cap', next: 'closedRace' },
        { id: 'leaveRunning', label: 'Let Sorn decide whether to finish the measured batch', next: 'warning' },
      ]),
      closedRace: n('closedRace', 'The Stones Fall Quiet', 'Sorn closes the feed and stops the wheel from its platform. He finds a loose bearing peg and takes the small amount of grain between the stones out by hand; the wheel needs the millwright before it runs again.', [
        { id: 'recordFinding', label: 'Record the loose peg and the delayed order', next: 'recorded', effects: { historyFlags: ['stopped_willow_bend_millwheel_for_loose_peg'] } },
        { id: 'leaveToSorn', label: 'Leave Sorn to contact the millwright and customer', next: 'warning' },
      ]),
      recorded: e('recorded', 'A Batch Delayed, a Fault Named', 'Sorn receives the record of the loose peg and tells the customer the order will be late. The grain between the stones is sifted out; no one claims the bearing has been repaired.'),
      warning: e('warning', 'The Mill Keeps Its Own Decision', 'Sorn decides whether to stop the wheel or finish the measured batch, then handles the customer and calls the millwright if needed. The Traveler does not touch the guarded mechanism.'),
    },
  },
  {
    id: 'the-coachs-unclaimed-dispatch', title: 'The Coach’s Unclaimed Dispatch', subtitle: 'A sealed dispatch remains beneath a coach seat after two passengers reach the same posting stop.', startScene: 'stop',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A way-station clerk must resolve competing claims to a sealed dispatch using route-specific evidence before the coach departs.', availability: yearRound },
    scenes: {
      stop: n('stop', 'A Packet beneath the Seat', 'At a way-station, driver Elowen finds a sealed dispatch beneath the rear coach seat. Courier Bram says it belongs on his eastbound route; market agent Lysa says her office expects a price circular before tomorrow. The wax is intact, and the coach leaves when the fresh team is harnessed.', [
        { id: 'askForRecords', label: 'Ask both passengers what route records they can show', next: 'claims' },
        { id: 'inspectCover', label: 'Read the outside marks without breaking the seal', next: 'marks' },
        { id: 'holdPacket', label: 'Leave it sealed for the stationmaster', next: 'held' },
      ]),
      claims: n('claims', 'Two Different Routes', 'Bram remembers the packet boarding at Ashcombe, but that stop handles several carriers. Lysa has a docket number for a westbound market circular. Neither claim alone identifies this dispatch.', [
        { id: 'checkDocket', label: 'Compare both accounts with the station book', next: 'proof' },
        { id: 'readLabel', label: 'Read the packet label before checking the book', next: 'marks' },
      ]),
      marks: n('marks', 'East Road, Office Copy', 'The outer label names the East Road post and marks the contents as an office copy. It does not name Lysa’s market or Bram as its courier; the station book can identify which carrier signed for that route.', [
        { id: 'checkBook', label: 'Check the carrier column in the station book', next: 'proof' },
        { id: 'holdPacket', label: 'Keep the sealed packet in the clerk’s locked drawer', next: 'held' },
      ]),
      proof: n('proof', 'One Entry Matches the Seal', 'The station book records Bram’s initials beside an East Road office packet and the same two-notch seal drawn on its receipt. Lysa’s docket is for a market price circular from the westbound carrier.', [
        { id: 'entrustBram', label: 'Record Bram’s receipt and hand him the sealed packet', next: 'delivered', effects: { historyFlags: ['returned_east_road_dispatch_to_recorded_carrier'] } },
        { id: 'keepForClerk', label: 'Keep the packet sealed until the stationmaster returns', next: 'held' },
      ]),
      delivered: e('delivered', 'The Packet Takes Its Route', 'The station book records Bram’s receipt before the coach leaves. The seal remains intact, and Lysa’s separate westbound circular is still expected from its own carrier.'),
      held: e('held', 'A Sealed Packet in Trust', 'The packet stays sealed in the clerk’s locked drawer for the stationmaster. The coach leaves without assigning it to either passenger.'),
    },
  },
  {
    id: 'the-ferry-lantern-on-the-moving-bank', title: 'The Ferry Lantern on the Moving Bank', subtitle: 'A ferry landing has shifted after rain, and a lantern still marks the old waiting place.', startScene: 'landing',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A familiar ferry lantern now stands beside a shifted bank, so travelers must distinguish a landing marker from a safe place to board.', availability: yearRound },
    scenes: {
      landing: n('landing', 'Light beside the Old Landing', 'At dusk, a ferry lantern hangs from its usual post, but rain has cut a channel through the bank below it. The ferry is tied on the far side and has not answered the first call. Two travelers wait behind you, unsure where to stand.', [
        { id: 'inspectBank', label: 'Check the bank edge from the upper path', next: 'edge' },
        { id: 'callFerryman', label: 'Call across from the marked upper landing', next: 'answer' },
        { id: 'moveTravelers', label: 'Move the waiting travelers back from the cut', next: 'clear' },
      ], 'warning'),
      edge: n('edge', 'The Post Stands, the Bank Does Not', 'The lantern post remains upright, but the soil beneath the lower step has washed away. The light marks the old waiting place, not a safe boarding edge tonight.', [
        { id: 'markUpperPath', label: 'Mark the upper path as the only waiting place', next: 'clear' },
        { id: 'waitForReply', label: 'Stay above the bank and call for the ferryman', next: 'answer' },
      ]),
      answer: n('answer', 'A Voice from the Far Side', 'The ferryman answers that the boat is secured across the current and cannot come in until the landing is checked. No crossing has begun, and the lantern remains on the old post.', [
        { id: 'askForMorning', label: 'Ask the ferryman to return after daylight inspection', next: 'closed' },
        { id: 'keepWatch', label: 'Wait on the upper path while the ferryman holds the boat', next: 'watch' },
      ]),
      clear: n('clear', 'The Waiting Place Moved Back', 'The travelers stand on the upper path behind the cut. The lantern can be seen from there, but it does not tell the ferryman that anyone is ready to board.', [
        { id: 'postClosure', label: 'Post a temporary closure at the upper path', next: 'closed' },
        { id: 'callFromSafeGround', label: 'Call again from the marked upper landing', next: 'answer' },
      ]),
      watch: n('watch', 'The Boat Held across the Current', 'The ferryman keeps the boat tied on the far side while the travelers remain above the cut. The water falls slowly, but darkness still hides the washed edge.', [
        { id: 'leaveNotice', label: 'Leave a closure notice for the morning road', next: 'closed' },
        { id: 'depart', label: 'Take the upper road to the next crossing', next: 'departed' },
      ]),
      closed: e('closed', 'The Lantern Left above the Cut', 'The ferry does not run tonight. The waiting place is moved to the upper path, and the lantern remains visible on its old post until the landing can be checked in daylight.'),
      departed: e('departed', 'The Next Crossing by Road', 'You take the upper road with the travelers. The ferry remains tied on the far side, and no one treats the old lantern as proof that the bank is safe.'),
    },
  },
];
