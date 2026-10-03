import type { Scenario } from '../types';

const ending = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });

export const THE_STRAY_HORSE: Scenario = {
  id: 'the-stray-horse', title: 'The Stray Horse', subtitle: 'A saddled horse stands loose beside the road.', startScene: 'horseRoad',
  runRandomSelections: [{ id: 'horseOrigin', values: [{ value: 'orchard' }, { value: 'drover' }, { value: 'unknown' }] }],
  scenes: {
    horseRoad: { id: 'horseRoad', title: 'A Horse by the Milepost', tone: 'safe', text: 'A saddled bay horse stands beside the road, reins dragging in the dust. It is alert but not panicked, and there is no rider in sight. A hedge gives it room to step away. You can leave it be, look for tracks, or approach slowly.', choices: [
      { id: 'leaveHorse', label: 'Leave the horse room and continue', next: 'leftHorse' },
      { id: 'lookHorseTracks', label: 'Look for fresh hoofprints nearby', timeCost: 5, next: 'horseTracks', effects: { knowledge: ['A saddled bay horse stood loose beside the milepost, with fresh hoofprints leading toward the orchard lane.'] } },
      { id: 'approachHorse', label: 'Approach from the side with an open hand', hint: 'A loose horse can shy; do not reach suddenly for its reins.', timeCost: 4, chance: { probability: 0.68, bonusItems: ['farmWhistle'], bonusProbability: 0.12, successNext: 'horseSettled', failureNext: 'horseStepsAway', successMessage: 'The horse watches you, then lowers its head enough for you to take the reins.', failureMessage: 'The horse sidesteps beyond reach. It stays by the hedge, but you give it more room.' } },
    ] },
    horseTracks: { id: 'horseTracks', title: 'Prints in the Dust', tone: 'safe', text: 'The freshest hoofprints leave the road toward a nearby orchard. A second, older set returns from that lane. You have no sign that anyone is hurt; the horse may simply have slipped its tether.', choices: [
      { id: 'followHoofprints', label: 'Follow the prints toward the orchard', timeCost: 12, next: 'orchardOwner' },
      { id: 'waitForRider', label: 'Wait nearby without blocking the road', timeCost: 15, next: 'horseOwnerFound' },
      { id: 'returnRoad', label: 'Leave the horse and take the road', next: 'leftHorse' },
    ] },
    horseSettled: { id: 'horseSettled', title: 'Steady at the Hedge', tone: 'safe', text: 'The horse stands quietly while you hold its reins. You are beside the road, not equipped to take another person’s mount far away. The orchard lane is close, and you can wait for someone who knows the animal.', choices: [
      { id: 'leadToOrchard', label: 'Lead the horse toward the nearby orchard', timeCost: 10, next: 'orchardOwner' },
      { id: 'waitWithHorse', label: 'Wait here for its rider', timeCost: 12, next: 'horseOwnerFound' },
      { id: 'releaseHorse', label: 'Let it go and continue on', next: 'leftHorse' },
    ] },
    horseStepsAway: { id: 'horseStepsAway', title: 'Beyond Easy Reach', tone: 'warning', text: 'The horse has moved farther along the hedge, still walking rather than running. It is safe for now, but closing quickly could make it bolt toward the road.', choices: [
      { id: 'followSlowly', label: 'Follow at a distance toward the orchard lane', timeCost: 10, next: 'orchardOwner' },
      { id: 'stopHorseAttempt', label: 'Stop and let it settle before trying again', timeCost: 8, chance: { probability: 0.62, bonusItems: ['farmWhistle'], bonusProbability: 0.16, successNext: 'horseSettled', failureNext: 'leftHorse', successMessage: 'After a quiet pause, the horse allows you to approach.', failureMessage: 'The horse walks out of sight beyond the hedge. You do not chase it toward the road.' } },
      { id: 'leaveSteppedHorse', label: 'Keep clear and continue down the road', next: 'leftHorse' },
    ] },
    orchardOwner: { id: 'orchardOwner', title: 'Someone at the Orchard Gate', tone: 'safe', text: 'At the orchard gate, a worker recognizes the saddle but cannot say whose horse it is. They offer to ask along the lane while you decide whether to wait.', textVariants: [
      { requirements: { selections: { horseOrigin: 'orchard' } }, text: 'At the orchard gate, a worker recognizes the horse as one kept for short trips between the trees. It likely slipped a loose tether; no one has been reported missing.' },
      { requirements: { selections: { horseOrigin: 'drover' } }, text: 'At the orchard gate, a worker says a drover passed this morning with several mounts. The bay may have slipped its lead, but the road has not brought word of trouble.' },
      { requirements: { selections: { horseOrigin: 'unknown' } }, text: 'At the orchard gate, no one recognizes the bay. The worker offers to ask at the next farm, but there is no sign of an emergency.' },
    ], choices: [
      { id: 'askOrchardWorker', label: 'Ask the worker to check with nearby farms', timeCost: 5, next: 'horseOwnerFound', effects: { historyFlags: ['helped_reunite_loose_horse'] } },
      { id: 'leaveOrchardHorse', label: 'Leave the horse in the worker’s care', next: 'horseLeftAtOrchard', effects: { historyFlags: ['left_loose_horse_with_local_care'] } },
    ] },
    horseOwnerFound: ending('horseOwnerFound', 'A Familiar Rein', 'A rider arrives from the orchard lane and recognizes the horse at once. The animal is led home at an easy walk. No larger trouble was hidden in the loose reins.'),
    horseLeftAtOrchard: ending('horseLeftAtOrchard', 'A Safe Gate', 'The orchard worker closes the gate and will ask the neighboring farms about the horse. You have left it somewhere safer without claiming to know its owner.'),
    leftHorse: ending('leftHorse', 'The Road Continues', 'You leave the horse space beside the hedge and continue. It remains visible from the road for a while; someone from the nearby farms may notice it.'),
  },
};

export const THE_CALF_IN_THE_MUD: Scenario = {
  id: 'the-calf-in-the-mud', title: 'The Calf in the Mud', subtitle: 'A young calf needs a careful pull onto firm ground.', startScene: 'muddyGate',
  scenes: {
    muddyGate: { id: 'muddyGate', title: 'The Soft Hollow', tone: 'warning', text: 'A calf is stuck belly-deep in a muddy hollow just inside a pasture gate. Its head is above the mud and it is breathing, but each kick sinks its legs farther. The bank is firm beneath your feet. A farmhand is running from the house; there is time to work carefully.', choices: [
      { id: 'callFarmhand', label: 'Call the farmhand and wait for help', timeCost: 5, next: 'helpArrives' },
      { id: 'prepareRopePull', label: 'Lay a rope low around the calf’s chest', requirements: { items: ['travelRope'] }, hint: 'A broad, low pull avoids the calf’s neck and legs.', timeCost: 4, next: 'ropeReady' },
      { id: 'makeFirmFooting', label: 'Lay boards from the gate to the firm bank', timeCost: 7, next: 'boardsReady' },
      { id: 'leaveCalf', label: 'Fetch the household instead of entering the pasture', next: 'householdFetched' },
    ] },
    helpArrives: { id: 'helpArrives', title: 'Two on Firm Ground', tone: 'safe', text: 'The farmhand arrives with a second person and a short length of harness rope. They stay on the firm bank and explain where a pull will support the calf without tightening around its throat.', choices: [
      { id: 'pullTogether', label: 'Pull together, slowly, from the firm bank', timeCost: 5, chance: { probability: 0.82, successNext: 'calfFree', failureNext: 'pauseCalf', successMessage: 'The calf slides onto the boards and scrambles onto firm ground.', failureMessage: 'The mud holds fast. The calf is tiring, so the farmhand asks for a pause and a different angle.' } },
      { id: 'layBoardsWithHelp', label: 'Lay boards to spread its weight first', timeCost: 6, next: 'boardsReady' },
      { id: 'fetchMoreHelp', label: 'Fetch one more person and a stronger plank', timeCost: 8, next: 'boardsReady' },
    ] },
    ropeReady: { id: 'ropeReady', title: 'A Low, Broad Pull', tone: 'warning', text: 'Your rope is arranged around the calf’s chest, clear of its neck. The farmhand reaches the gate and can help guide the line. Pulling hard could hurt the calf; a slow lift may work, but boards would spread its weight better.', choices: [
      { id: 'ropeWithHandler', label: 'Pull gently while the farmhand guides it', timeCost: 4, chance: { probability: 0.78, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'calfFree', failureNext: 'pauseCalf', successMessage: 'The calf finds the boards and climbs free with the rope supporting its chest.', failureMessage: 'The rope slips on the muddy coat. You stop before it tightens and the farmhand repositions it.' } },
      { id: 'boardsAfterRope', label: 'Use boards before trying the rope', timeCost: 6, next: 'boardsReady' },
      { id: 'waitForMoreHands', label: 'Wait for another helper to arrive', timeCost: 5, next: 'helpArrives' },
    ] },
    boardsReady: { id: 'boardsReady', title: 'A Wider Path', tone: 'safe', text: 'The boards rest across the softest mud, making a broad route toward the firm bank. The calf is tired but still alert. With help from the gate, a steady pull is safer than lifting it by the legs.', choices: [
      { id: 'boardsPull', label: 'Guide the calf across the boards', timeCost: 5, chance: { probability: 0.84, successNext: 'calfFree', failureNext: 'pauseCalf', successMessage: 'The calf scrambles over the boards and reaches the firm bank.', failureMessage: 'A board shifts, so everyone stops. The calf is still supported and can be repositioned.' } },
      { id: 'bringMoreBoards', label: 'Ask the farmhand for two more boards', timeCost: 5, next: 'extraBoards' },
      { id: 'stopForHousehold', label: 'Let the household take over the rescue', next: 'householdFetched' },
    ] },
    pauseCalf: { id: 'pauseCalf', title: 'A Needed Pause', tone: 'warning', text: 'The first attempt did not free the calf. It is still breathing and supported at the edge of the boards. The farmhand keeps it calm while another person brings a wider plank.', choices: [
      { id: 'tryWiderBoards', label: 'Try again with the wider plank', timeCost: 4, chance: { probability: 0.78, successNext: 'calfFree', failureNext: 'householdFetched', successMessage: 'The wider plank holds, and the calf crawls onto the bank.', failureMessage: 'The calf remains stuck but stable. The household takes over with more equipment.' } },
      { id: 'handOverCalf', label: 'Leave the careful work to the household', next: 'householdFetched' },
    ] },
    extraBoards: { id: 'extraBoards', title: 'A Wider Plank', tone: 'safe', text: 'A second plank reaches the firm bank. The farmhand checks that it cannot slide before anyone tries again. The calf is tired, so there will be no third attempt if this one does not hold.', choices: [
      { id: 'pullAcrossExtraBoards', label: 'Guide the calf across the wider plank', timeCost: 4, chance: { probability: 0.8, successNext: 'calfFree', failureNext: 'householdFetched', successMessage: 'The calf scrambles onto the firm bank, supported by the wider plank.', failureMessage: 'The calf remains stuck but stable; the household takes over with more equipment.' } },
      { id: 'handOverExtraBoards', label: 'Let the household finish the rescue', next: 'householdFetched' },
    ] },
    calfFree: ending('calfFree', 'Back on Firm Ground', 'The calf stands unsteadily, then leans against the farmhand. It will need watching and a quiet place to rest, but the rescue was a matter of patient leverage, not force.'),
    householdFetched: ending('householdFetched', 'More Hands at the Gate', 'The household brings boards and a broad sling from the barn. You leave the rescue to people with the right equipment; the calf remains supported while they work.'),
  },
};

export const THE_DOG_THAT_RETURNS: Scenario = {
  id: 'the-dog-that-returns', title: 'The Dog That Returns', subtitle: 'A road dog keeps coming back to one bend.', startScene: 'roadBend',
  runRandomSelections: [{ id: 'dogReason', values: [{ value: 'owner' }, { value: 'bundle' }, { value: 'pups' }, { value: 'nothing' }] }],
  scenes: {
    roadBend: { id: 'roadBend', title: 'Back at the Same Bend', tone: 'safe', text: 'A lean brown dog walks ahead, then returns to the same bend in the road. It does not bark or bare its teeth; it watches you from the grass verge. The path beyond is clear. You may keep walking, observe from a distance, or call softly.', choices: [
      { id: 'continueDogBend', label: 'Continue along the open road', next: 'dogIgnored' },
      { id: 'watchDogBend', label: 'Watch where the dog goes next', timeCost: 5, next: 'dogFollowed', effects: { knowledge: ['A brown dog repeatedly returned to the same bend in the road.'] } },
      { id: 'callDogBend', label: 'Call softly and leave food nearby', timeCost: 4, chance: { probability: 0.58, successNext: 'dogApproaches', failureNext: 'dogKeepsDistance', successMessage: 'The dog approaches to sniff the food, keeping a cautious distance from your hand.', failureMessage: 'The dog waits until you step back before taking the food.' } },
    ] },
    dogFollowed: { id: 'dogFollowed', title: 'What the Dog Guards', tone: 'safe', text: 'The dog trots to a shaded pull-off and looks back. It may be waiting for something or someone, but there is no immediate danger and no one has called for help. From the road, you can inspect the place without cornering the animal.', textVariants: [
      { requirements: { selections: { dogReason: 'owner' } }, text: 'The dog trots to a shaded pull-off where a traveler sits with a twisted ankle, awake and able to answer. The traveler says the dog has been staying close since the fall.' },
      { requirements: { selections: { dogReason: 'bundle' } }, text: 'The dog trots to a shaded pull-off and noses a small dropped bundle beside a milestone. No one is nearby, and the road remains clear.' },
      { requirements: { selections: { dogReason: 'pups' } }, text: 'The dog trots to a shaded pull-off and stops near a shallow nest beneath a hedge. A few pups are tucked well back from the road; the dog keeps its distance from you.' },
      { requirements: { selections: { dogReason: 'nothing' } }, text: 'The dog trots to a shaded pull-off, sniffs the grass, and lies down. Nothing appears lost or injured; this may simply be a familiar resting place.' },
    ], choices: [
      { id: 'checkPullOff', label: 'Look over the pull-off without crowding the dog', timeCost: 4, next: 'dogTruth' },
      { id: 'leaveDogPullOff', label: 'Give the dog space and return to the road', next: 'dogIgnored' },
    ] },
    dogApproaches: { id: 'dogApproaches', title: 'A Cautious Visitor', tone: 'safe', text: 'The dog takes the food and sniffs your empty hand. It stays wary, then walks back toward the same shaded bend. You can follow at a distance or leave it to its own path.', choices: [
      { id: 'followAfterFood', label: 'Follow the dog at a respectful distance', timeCost: 5, next: 'dogFollowed' },
      { id: 'leaveAfterFood', label: 'Continue without following', next: 'dogIgnored' },
    ] },
    dogKeepsDistance: { id: 'dogKeepsDistance', title: 'Food Taken Afterward', tone: 'safe', text: 'The dog waits until you step away before eating. It does not approach, but returns to the bend once it has finished.', choices: [
      { id: 'observeAfterFood', label: 'Watch from the road shoulder', timeCost: 4, next: 'dogFollowed' },
      { id: 'leaveAfterDistance', label: 'Leave the dog in peace', next: 'dogIgnored' },
    ] },
    dogTruth: { id: 'dogTruth', title: 'A Small, Ordinary Need', tone: 'safe', text: 'You understand why the dog keeps returning. Nothing in the scene requires you to take charge; help can be offered without trying to make the dog trust you at once.', textVariants: [
      { requirements: { selections: { dogReason: 'owner' } }, text: 'The traveler’s ankle is swollen but not bent out of shape. They ask for a message to the next farm, while the dog settles beside them.' },
      { requirements: { selections: { dogReason: 'bundle' } }, text: 'The bundle holds a lunch cloth and a small hand tool. The dog had been nosing it, perhaps drawn by the smell; its owner may be farther down the road.' },
      { requirements: { selections: { dogReason: 'pups' } }, text: 'The pups are warm and quiet beneath the hedge. Their mother watches you, but does not advance while you keep your distance.' },
      { requirements: { selections: { dogReason: 'nothing' } }, text: 'The dog has no person or object to lead you to. It rests in the shade, then looks toward the road as if deciding whether to follow.' },
    ], choices: [
      { id: 'offerPracticalHelp', label: 'Offer simple help, then continue', timeCost: 5, next: 'dogHelped', effects: { historyFlags: ['offered_help_after_following_road_dog'] } },
      { id: 'leaveDogTruth', label: 'Leave the dog and pull-off undisturbed', next: 'dogIgnored' },
    ] },
    dogHelped: ending('dogHelped', 'The Dog Stays Close', 'You leave a message, set the bundle beside the marker, or simply give the family room—whatever the moment asks. The dog remains cautious, but its repeated return has helped someone notice what mattered.'),
    dogIgnored: ending('dogIgnored', 'Along the Road', 'You continue down the road. The dog stays by the bend, free to follow its own routine; you have no reason to turn a quiet moment into a crisis.'),
  },
};

export const THE_BROKEN_HARNESS: Scenario = {
  id: 'the-broken-harness', title: 'The Broken Harness', subtitle: 'A cart can wait while its harness is repaired.', startScene: 'cartLane',
  scenes: {
    cartLane: { id: 'cartLane', title: 'A Cart at the Roadside', tone: 'warning', text: 'A mule stands hitched to a small cart on the firm roadside. One leather strap from its harness has split, leaving the cart crooked but not rolling. The driver holds the mule by its lead and has already unloaded the heaviest crate. No one is hurt.', choices: [
      { id: 'inspectHarness', label: 'Look at the split strap and cart load', timeCost: 4, next: 'strapAssessed', effects: { knowledge: ['A roadside cart’s harness strap split; unloading weight and keeping the mule still made repair safer.'] } },
      { id: 'offerStrap', label: 'Offer your Freightman’s Strap as a brace', requirements: { items: ['freightmansStrap'], usableItems: ['freightmansStrap'] }, hint: 'It can steady the load, but is not a proper harness repair.', timeCost: 3, next: 'strapBraced' },
      { id: 'offerRope', label: 'Use your rope to keep the cart steady', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, timeCost: 4, next: 'cartSecured' },
      { id: 'leaveCart', label: 'Let the driver handle the repair', next: 'driverContinues' },
    ] },
    strapAssessed: { id: 'strapAssessed', title: 'A Split Leather Strap', tone: 'safe', text: 'The broken piece is part of the cart harness, not the mule’s leg gear. The driver has a spare buckle but needs both hands to fit a new strip. With the cart still unloaded and the mule held calmly, there is room to help.', choices: [
      { id: 'helpFitHarness', label: 'Help fit the spare leather strip', timeCost: 10, chance: { probability: 0.74, bonusItems: ['pocketToolkit', 'foremanMultiTool'], bonusProbability: 0.13, successNext: 'harnessRepaired', failureNext: 'repairPaused', successMessage: 'The buckle holds the replacement strip firmly.', failureMessage: 'The buckle will not bite the worn leather; the driver pauses before loading again.' } },
      { id: 'redistributeCartLoad', label: 'Move weight into the cart’s center', timeCost: 6, next: 'loadBalanced' },
      { id: 'holdMuleSteady', label: 'Hold the lead while the driver repairs', timeCost: 5, next: 'harnessRepaired' },
    ] },
    strapBraced: { id: 'strapBraced', title: 'A Temporary Brace', tone: 'safe', text: 'The Freightman’s Strap holds the cart level while the mule rests. It is a brace for the journey to the next farm, not a replacement for the split harness. The driver will keep the load light.', choices: [
      { id: 'walkToFarmBrace', label: 'Walk with the mule to the nearby farm', timeCost: 12, next: 'harnessRepaired', effects: { historyFlags: ['helped_brace_broken_cart_harness'], damageItems: ['freightmansStrap'] } },
      { id: 'releaseBrace', label: 'Leave the strap and let the driver decide', next: 'driverContinues' },
    ] },
    cartSecured: { id: 'cartSecured', title: 'Stopped on Firm Ground', tone: 'safe', text: 'Your rope holds the cart still on the verge while the driver checks the harness. The mule can rest without the cart tugging against it. A nearby farm has leather and a proper buckle.', choices: [
      { id: 'walkSecuredCart', label: 'Help lead the mule to the nearby farm', timeCost: 12, next: 'harnessRepaired' },
      { id: 'leaveSecuredCart', label: 'Let the driver take it from here', next: 'driverContinues' },
    ] },
    loadBalanced: { id: 'loadBalanced', title: 'A Lighter, Even Load', tone: 'safe', text: 'The crates sit evenly over the cart axle, and the mule is given water before the harness is touched. The driver can make a short, slow trip to a farm with spare leather.', choices: [
      { id: 'guideBalancedCart', label: 'Walk beside the mule to the farm', timeCost: 10, next: 'harnessRepaired' },
      { id: 'driverTakesBalanced', label: 'Let the driver continue at a walk', next: 'driverContinues' },
    ] },
    repairPaused: { id: 'repairPaused', title: 'No Need to Force It', tone: 'warning', text: 'The first fit did not hold. The driver keeps the cart unloaded and the mule resting; a nearby farm has a harness maker who can replace the strip properly.', choices: [
      { id: 'takePausedToFarm', label: 'Help walk the cart to the harness maker', timeCost: 12, next: 'harnessRepaired' },
      { id: 'stepBackPaused', label: 'Leave the repair to the driver and maker', next: 'driverContinues' },
    ] },
    harnessRepaired: { id: 'harnessRepaired', title: 'At the Harness Maker', tone: 'safe', text: 'The split harness strap is replaced with sound leather. The driver checks the buckle and gives the mule a little rest before loading again. The harness maker can mend or strengthen carried load gear if you want to take a moment.', choices: [
      { id: 'repairFreightmansStrap', label: 'Have the maker mend your strap', requirements: { items: ['freightmansStrap'], itemConditions: { freightmansStrap: ['DAMAGED', 'BROKEN'] } }, timeCost: 5, next: 'harnessServiceDone', effects: { repairItems: ['freightmansStrap'], repairItemProvenance: { freightmansStrap: 'Mended by the harness maker' }, setFlags: ['harnessMakerMendedStrap'] } },
      { id: 'reinforceFreightmansStrap', label: 'Ask for stronger buckle stitching', requirements: { items: ['freightmansStrap'], usableItems: ['freightmansStrap'], notItemUpgrades: { freightmansStrap: ['stitchedBuckle'] } }, timeCost: 6, next: 'harnessServiceDone', effects: { addItemUpgrades: [{ itemId: 'freightmansStrap', upgradeId: 'stitchedBuckle', provenance: 'Reinforced by the harness maker' }] } },
      { id: 'askAboutRope', label: 'Ask the maker to inspect your rope', requirements: { items: ['travelRope'] }, timeCost: 2, next: 'ropeService' },
      { id: 'leaveHarnessMaker', label: 'Thank the maker and continue', next: 'harnessServiceDone' },
    ] },
    ropeService: { id: 'ropeService', title: 'Line in Need of Care', tone: 'safe', text: 'The harness maker checks the rope on a clean bench. A frayed or shortened line can be mended by cutting back to sound braid; a sound rope can instead have its hook eye leather-whipped against wear. Neither service makes a rope safe to use beyond its stated limits.', choices: [
      { id: 'repairTravelRope', label: 'Have the maker mend the worn rope', requirements: { items: ['travelRope'], itemConditions: { travelRope: ['DAMAGED', 'BROKEN'] } }, timeCost: 7, next: 'harnessServiceDone', effects: { repairItems: ['travelRope'], repairItemProvenance: { travelRope: 'Mended by the roadside harness maker' }, setFlags: ['harnessMakerRepairedRope'] } },
      { id: 'spliceRopeHookEye', label: 'Bind the hook eye on your sound rope', requirements: { items: ['travelRope'], usableItems: ['travelRope'], itemConditions: { travelRope: ['NORMAL'] }, notItemUpgrades: { travelRope: ['splicedEyes'] } }, timeCost: 6, next: 'harnessServiceDone', effects: { addItemUpgrades: [{ itemId: 'travelRope', upgradeId: 'splicedEyes', provenance: 'Leather-whipped by the harness maker' }] } },
      { id: 'leaveRopeService', label: 'Leave the rope as it is', next: 'harnessServiceDone' },
    ] },
    harnessServiceDone: { id: 'harnessServiceDone', title: 'A Sound Strap Again', tone: 'safe', text: 'The driver reloads only after checking the buckle and giving the mule a little rest. Your help saved time without asking the animal to pull against broken gear.', textVariants: [
      { requirements: { items: ['freightmansStrap'], itemUpgrades: { freightmansStrap: ['stitchedBuckle'] } }, text: 'The driver reloads only after checking the buckle and giving the mule a little rest. The harness maker’s extra stitching sits neatly around your own strap’s buckle; your gear has been improved without taking a pack slot.' },
      { requirements: { items: ['travelRope'], itemUpgrades: { travelRope: ['splicedEyes'] } }, text: 'The driver reloads only after checking the buckle and giving the mule a little rest. A short leather whipping now secures your rope’s hook eye more firmly; the improvement adds no pack weight.' },
      { requirements: { flags: ['harnessMakerMendedStrap'], items: ['freightmansStrap'], itemConditions: { freightmansStrap: ['NORMAL'] } }, text: 'The driver reloads only after checking the buckle and giving the mule a little rest. Your own strap has been mended sound again, and the cart moves off at an easy walk.' },
      { requirements: { flags: ['harnessMakerRepairedRope'], items: ['travelRope'], itemConditions: { travelRope: ['NORMAL'] } }, text: 'The driver reloads only after checking the buckle and giving the mule a little rest. The harness maker cut back the frayed rope and bound its sound braid; it is whole again, though shorter.' },
    ], choices: [], ending: 'success' },
    driverContinues: ending('driverContinues', 'A Pause by the Road', 'The driver keeps the mule on firm ground and plans to reach the nearby harness maker at a walk. The cart can wait; the animal is not made to pull on a failed strap.'),
  },
};

export const LOOSE_IN_THE_MARKET: Scenario = {
  id: 'loose-in-the-market', title: 'Loose in the Market', subtitle: 'A young goat slips into a crowded market lane.', startScene: 'marketLane',
  scenes: {
    marketLane: { id: 'marketLane', title: 'The Open Gate', tone: 'warning', text: 'A young goat has slipped through an open pen gate and is walking between market stalls. It is not charging, but people carrying baskets are starting to crowd the lane. The owner is closing the far gate while a child holds the lead rope from a safe distance.', choices: [
      { id: 'closeMarketGate', label: 'Use the Gate Hook to close the far gate', requirements: { items: ['gateHook'] }, timeCost: 3, next: 'laneContained' },
      { id: 'clearMarketLane', label: 'Ask people to open a clear lane', timeCost: 3, next: 'laneCleared' },
      { id: 'guideMarketGoat', label: 'Guide the goat slowly toward its owner', timeCost: 4, chance: { probability: 0.66, bonusItems: ['farmWhistle'], bonusProbability: 0.15, successNext: 'goatReturned', failureNext: 'goatPauses', successMessage: 'The goat follows the open lane toward the familiar voice of its owner.', failureMessage: 'The goat stops beside a stall, unsettled by the crowd but not hurt.' } },
      { id: 'standClearMarket', label: 'Stay clear and let the owner manage it', next: 'ownerHandlesGoat' },
    ] },
    laneContained: { id: 'laneContained', title: 'The Lane Narrows Safely', tone: 'safe', text: 'The far gate is shut, so the goat cannot reach the busy road. The market lane remains open on the near side, and the owner calls from the pen without rushing the animal.', choices: [
      { id: 'walkGoatGate', label: 'Walk slowly beside the goat to its pen', timeCost: 4, chance: { probability: 0.78, bonusItems: ['farmWhistle'], bonusProbability: 0.1, successNext: 'goatReturned', failureNext: 'goatPauses', successMessage: 'The goat recognizes the pen and steps through the gate.', failureMessage: 'It pauses at the threshold; the owner brings feed to coax it.' } },
      { id: 'openNearLane', label: 'Keep people back while the owner coaxes it', timeCost: 3, next: 'goatReturned' },
    ] },
    laneCleared: { id: 'laneCleared', title: 'A Little Room', tone: 'safe', text: 'The shoppers make a clear path between the stalls. The goat can see its owner now, and the child has stepped behind the pen rail with the lead rope ready.', choices: [
      { id: 'guideAfterClear', label: 'Guide the goat toward the waiting lead', timeCost: 4, chance: { probability: 0.76, successNext: 'goatReturned', failureNext: 'goatPauses', successMessage: 'With room to move, the goat follows the owner’s call.', failureMessage: 'The goat pauses at a basket; the owner takes over with feed.' } },
      { id: 'letOwnerAfterClear', label: 'Let the owner call it back', next: 'goatReturned' },
    ] },
    goatPauses: { id: 'goatPauses', title: 'A Moment to Settle', tone: 'warning', text: 'The goat has stopped beside a stall. It is not trapped, but sudden movement could send it into another part of the market. The owner has brought a handful of feed.', choices: [
      { id: 'waitFeed', label: 'Hold the lane open while it eats', timeCost: 3, next: 'goatReturned' },
      { id: 'stepBackFeed', label: 'Step back and give the owner room', next: 'ownerHandlesGoat' },
    ] },
    goatReturned: { id: 'goatReturned', title: 'Back Behind the Rail', tone: 'safe', text: 'The goat is back inside its pen, and the owner has the gate latched. Shoppers return to their stalls while the owner checks that nothing was knocked over.', choices: [{ id: 'marketAftercare', label: 'Stay while the market settles', next: 'marketAftercare', effects: { setFlags: ['marketGoatReturned'] } }] },
    ownerHandlesGoat: { id: 'ownerHandlesGoat', title: 'Room for the Owner', tone: 'safe', text: 'The owner uses familiar feed and a quiet voice to bring the goat back. You kept the lane clear and avoided turning a manageable market mishap into a chase.', choices: [{ id: 'marketAftercareOwner', label: 'Stay while the market settles', next: 'marketAftercare', effects: { setFlags: ['marketGoatOwnerHandled'] } }] },
    marketAftercare: { id: 'marketAftercare', title: 'The Lane Clears', tone: 'safe', text: 'The owner checks the latch and gathers the scattered feed while the shoppers make room. The goat is settled, the stalls are undamaged, and the lane begins to sound like a market again. “You gave me a hand when I needed one,” the owner says, offering a coin for your time.', choices: [
      { id: 'acceptMarketCoin', label: 'Accept the owner’s coin and move on', next: 'marketHelpComplete', effects: { money: 1, historyFlags: ['helped_return_market_goat'] } },
      { id: 'declineMarketCoin', label: 'Decline the coin and wish them well', next: 'marketHelpComplete', effects: { historyFlags: ['helped_return_market_goat'] } },
    ] },
    marketHelpComplete: { id: 'marketHelpComplete', title: 'Market Business Resumes', text: 'The owner returns to the pen, and the shoppers reclaim the lane without further trouble. You leave after seeing the goat safely settled.', ending: 'success', completionQualification: 'substantive', choices: [] },
  },
};

export const THE_OWNERLESS_MULE: Scenario = {
  id: 'the-ownerless-mule', title: 'The Ownerless Mule', subtitle: 'A calm mule waits near the settlement road.', startScene: 'muleGreen',
  runRandomSelections: [{ id: 'muleClue', values: [{ value: 'brand' }, { value: 'tack' }, { value: 'witness' }] }],
  scenes: {
    muleGreen: { id: 'muleGreen', title: 'A Mule by the Green', tone: 'safe', text: 'A gray mule stands tied loosely to a fence near the settlement green. It has water and shade, but no one is beside it. The road is busy enough that leaving it loose would be unwise; the animal appears calm. You can wait, look at its tack, or ask nearby residents.', choices: [
      { id: 'waitForMuleOwner', label: 'Wait nearby for someone to return', timeCost: 12, next: 'muleClaimant' },
      { id: 'inspectMuleTack', label: 'Look for a name or mark on its tack', timeCost: 4, next: 'muleClueSeen', effects: { knowledge: ['A gray mule waited by the settlement green with a worn saddle and a small identifying mark.'] } },
      { id: 'askMuleResidents', label: 'Ask the closest shopkeepers about it', timeCost: 4, next: 'muleClaimant' },
      { id: 'leaveMuleGreen', label: 'Leave it watered and continue on', next: 'muleLeft' },
    ] },
    muleClueSeen: { id: 'muleClueSeen', title: 'An Incomplete Mark', tone: 'safe', text: 'The tack is worn but serviceable. {{muleClueText}} The mark may help someone identify the mule, but it is not proof of ownership by itself.', textVariants: [
      { requirements: { selections: { muleClue: 'brand' } }, text: 'A small brand is partly hidden beneath the mane. It is too worn to identify a farm with confidence.' },
      { requirements: { selections: { muleClue: 'tack' } }, text: 'A stitched repair on the saddle bears a maker’s mark rather than an owner’s name.' },
      { requirements: { selections: { muleClue: 'witness' } }, text: 'A resident remembers seeing the mule arrive with a traveler, but did not see who tied it here.' },
    ], choices: [
      { id: 'showMarkAtStable', label: 'Ask the stable keeper to recognize the mark', timeCost: 6, next: 'muleClaimant' },
      { id: 'leadMuleStable', label: 'Lead it to the settlement stable', timeCost: 6, chance: { probability: 0.76, bonusItems: ['farmWhistle'], bonusProbability: 0.12, successNext: 'muleAtStable', failureNext: 'muleClaimant', successMessage: 'The mule walks beside you to the stable without pulling.', failureMessage: 'The mule balks at the busy street. You stop and ask the stable keeper to come to it.' } },
      { id: 'leaveAfterMark', label: 'Leave it with water and tell a shopkeeper', next: 'muleLeft' },
    ] },
    muleClaimant: { id: 'muleClaimant', title: 'Two Stories, One Mule', tone: 'warning', text: 'A traveler and a local farmer both say the mule has worked for them. Neither has clear papers or a distinctive brand to settle it. The stable keeper offers to keep the animal watered while they compare what they remember.', choices: [
      { id: 'askBothMuleStories', label: 'Ask each person what work the mule knows', timeCost: 5, next: 'muleCompared', effects: { knowledge: ['Two people separately claimed a gray mule; neither had conclusive proof.'] } },
      { id: 'leaveMuleKeeper', label: 'Leave the disagreement to the stable keeper', next: 'muleAtStable' },
      { id: 'walkAwayMule', label: 'Step away without choosing an owner', next: 'muleLeft' },
    ] },
    muleCompared: { id: 'muleCompared', title: 'What the Mule Remembers', tone: 'safe', text: 'The animal responds to both people’s familiar calls, though it turns first toward the farmer holding a feed pail. That suggests familiarity, not legal proof. The stable keeper can hold it until the neighbors speak.', choices: [
      { id: 'leaveMuleStable', label: 'Let the stable keeper hold it safely', next: 'muleAtStable', effects: { historyFlags: ['witnessed_uncertain_mule_ownership'] } },
      { id: 'declineMuleJudgment', label: 'Decline to decide and continue', next: 'muleLeft' },
    ] },
    muleAtStable: ending('muleAtStable', 'Water and a Waiting Stall', 'The mule is kept in shade with water while the two claimants compare their accounts. The animal is safe for now; you have not pretended that a partial mark or familiar call settles the matter.'),
    muleLeft: ending('muleLeft', 'An Unsettled Claim', 'You leave the mule watered and tell someone nearby where it is. The claim remains uncertain, but the animal is no longer unattended beside the road.'),
  },
};

export const THE_INJURED_DOG: Scenario = {
  id: 'the-injured-dog', title: 'The Injured Dog', subtitle: 'A wary dog rests beside the road with a sore paw.', startScene: 'dogResting',
  scenes: {
    dogResting: { id: 'dogResting', title: 'A Paw Kept Off the Ground', tone: 'warning', text: 'A black-and-white dog lies beside a roadside trough, holding one front paw above the dirt. It watches you closely and growls when you step nearer. The paw may be cut, but the dog is not trapped; a fence gap gives it room to retreat.', choices: [
      { id: 'leaveDogWater', label: 'Leave water and give it space', next: 'dogWaterLeft', effects: { historyFlags: ['left_water_for_injured_dog'] } },
      { id: 'lookForDogOwner', label: 'Ask at the nearby house for its owner', timeCost: 5, next: 'dogOwnerSought' },
      { id: 'offerDogFood', label: 'Set food down and step back', timeCost: 3, next: 'dogFoodSet' },
      { id: 'useCleanBandage', label: 'Offer your clean bandage from a distance', requirements: { items: ['fieldBandageRoll'] }, hint: 'It might cover a small cut only if the dog allows help; it is no cure.', next: 'dogBandageOffered' },
    ] },
    dogOwnerSought: { id: 'dogOwnerSought', title: 'A Familiar Coat', tone: 'safe', text: 'A nearby resident recognizes the dog as a working animal from the next farm. They will fetch its handler, who knows how to approach it. Until then, the dog remains by the trough.', choices: [
      { id: 'waitForDogHandler', label: 'Wait at a distance for the handler', timeCost: 8, next: 'dogHandlerArrives' },
      { id: 'leaveDogOwner', label: 'Tell the resident and continue on', next: 'dogHandlerLater' },
    ] },
    dogFoodSet: { id: 'dogFoodSet', title: 'No Sudden Touch', tone: 'safe', text: 'You put the food down and retreat. The dog eats only after you are several paces away, then settles beside the water. It has not become tame, but its breathing is easier.', choices: [
      { id: 'fetchDogHandler', label: 'Ask the nearby farm to send its handler', timeCost: 6, next: 'dogHandlerArrives' },
      { id: 'leaveDogFed', label: 'Leave it food and move on', next: 'dogWaterLeft' },
    ] },
    dogBandageOffered: { id: 'dogBandageOffered', title: 'A Choice for the Handler', tone: 'warning', text: 'The dog keeps its paw tucked close and growls when the bandage comes near. You can leave it for the handler, who knows the dog, or back away and let it rest. Trying to restrain it could earn a bite and would not make the paw heal at once.', choices: [
      { id: 'leaveBandageHandler', label: 'Leave the bandage with the resident', next: 'dogHandlerArrives' },
      { id: 'stepAwayBandage', label: 'Put the bandage away and give it space', next: 'dogWaterLeft' },
    ] },
    dogHandlerArrives: { id: 'dogHandlerArrives', title: 'Known Hands', tone: 'safe', text: 'The handler arrives with a lead and a familiar voice. The dog lowers its head but keeps the paw raised. The handler asks what you noticed before they guide it away; they will decide how to inspect and treat their own dog.', choices: [
      { id: 'describeDogPaw', label: 'Describe the raised paw and the trough', next: 'dogHandlerObserved', effects: { historyFlags: ['helped a familiar handler find an injured dog'] } },
      { id: 'letHandlerApproach', label: 'Step back and let them approach', next: 'dogHandlerQuiet' },
    ] },
    dogHandlerObserved: ending('dogHandlerObserved', 'A Useful Observation', 'The handler checks the paw in the yard, away from the road, and thanks you for noting where the dog had settled. The handler makes the treatment decision; you helped them begin with a clearer picture.'),
    dogHandlerQuiet: ending('dogHandlerQuiet', 'The Dog Goes Home', 'The dog follows its handler at an easy pace, still favoring the paw. You leave them space to inspect it safely at the farm.'),
    dogHandlerLater: ending('dogHandlerLater', 'Help Left in Good Hands', 'You tell the resident where the dog is resting, then continue on. The handler will come from the next farm and approach it in familiar surroundings.'),
    dogWaterLeft: ending('dogWaterLeft', 'Room to Rest', 'The dog has water and room to retreat. Someone nearby knows where it was resting and can check again. You have helped without demanding trust from an injured animal.'),
  },
};

export const THE_FRIGHTENED_TEAM: Scenario = {
  id: 'the-frightened-team', title: 'The Frightened Team', subtitle: 'Two horses refuse a stretch of open road.', startScene: 'teamRoad',
  runRandomSelections: [{ id: 'teamCause', values: [{ value: 'canvas' }, { value: 'ground' }, { value: 'scent' }] }],
  scenes: {
    teamRoad: { id: 'teamRoad', title: 'The Horses Will Not Step On', tone: 'warning', text: 'Two harnessed horses stand before a narrow stretch of road, ears forward and hooves planted. Their driver holds the reins without striking them. You can see the road ahead, but not what lies around the bend. The team is frightened, not out of control.', choices: [
      { id: 'askDriverTeam', label: 'Ask the driver what happened', timeCost: 2, next: 'teamExplained', effects: { knowledge: ['A two-horse team balked before a narrow road bend; its driver chose not to force them.'] } },
      { id: 'inspectRoadTeam', label: 'Inspect the road from the safe shoulder', timeCost: 4, next: 'teamCauseSeen' },
      { id: 'giveTeamSpace', label: 'Give the team room and take a side path', next: 'teamPassed' },
      { id: 'quietTeam', label: 'Speak calmly from beyond the harness', timeCost: 3, chance: { probability: 0.56, bonusItems: ['farmWhistle'], bonusProbability: 0.15, successNext: 'teamSettles', failureNext: 'teamExplained', successMessage: 'The horses lower their heads but stay where they are, breathing more evenly.', failureMessage: 'The horses remain tense; the driver asks you to inspect the road instead.' } },
    ] },
    teamExplained: { id: 'teamExplained', title: 'The Driver Waits', tone: 'safe', text: 'The driver says the horses have balked at this bend before, though never for long. The path is firm and there is room to turn the cart around. A quick look ahead may explain what they see or smell.', choices: [
      { id: 'inspectAfterDriver', label: 'Look around the bend from the shoulder', timeCost: 4, next: 'teamCauseSeen' },
      { id: 'leadWideDetour', label: 'Help guide the cart around the wide verge', timeCost: 8, next: 'teamDetour' },
      { id: 'leaveTeamDriver', label: 'Leave the driver to choose his route', next: 'teamPassed' },
    ] },
    teamCauseSeen: { id: 'teamCauseSeen', title: 'Something Unfamiliar', tone: 'safe', text: 'You have found a possible reason for their refusal. The horses are still held safely, and no one needs to force them forward.', textVariants: [
      { requirements: { selections: { teamCause: 'canvas' } }, text: 'A pale canvas sheet has blown against the fence and lifts in the breeze. The road beneath it is sound; the moving shape is unfamiliar to the horses.' },
      { requirements: { selections: { teamCause: 'ground' } }, text: 'The road surface at the bend has slumped into a shallow rut. It is not a deep drop, but a loaded cart would lurch there.' },
      { requirements: { selections: { teamCause: 'scent' } }, text: 'A strong musky scent drifts from brush beyond the road. You see no animal, only tracks leading away from the verge.' },
    ], choices: [
      { id: 'clearCauseTeam', label: 'Make the road look or feel safer', timeCost: 5, next: 'teamSettles' },
      { id: 'useWhistleTeam', label: 'Call the driver with your Farm Whistle', requirements: { items: ['farmWhistle'] }, timeCost: 2, next: 'teamSettles' },
      { id: 'chooseTeamDetour', label: 'Take the wider route around the bend', timeCost: 8, next: 'teamDetour' },
      { id: 'letTeamWait', label: 'Let the horses rest before moving', timeCost: 8, next: 'teamSettles' },
    ] },
    teamSettles: { id: 'teamSettles', title: 'A Slower Start', tone: 'safe', text: 'The driver gives the horses a moment and chooses a walking pace. Their ears ease forward; they are calmer, though the team will still need careful handling at the bend.', choices: [
      { id: 'walkTeamPast', label: 'Walk with the driver past the bend', timeCost: 8, chance: { probability: 0.74, successNext: 'teamPassed', failureNext: 'teamDetour', successMessage: 'The team steps forward at a walk and clears the bend.', failureMessage: 'The horses stop again, so the driver turns toward the wider route.' } },
      { id: 'turnTeamDetour', label: 'Take the wider route instead', timeCost: 8, next: 'teamDetour' },
    ] },
    teamDetour: ending('teamDetour', 'Room to Turn', 'The driver guides the cart around by the broad verge. It takes longer, but the horses pass the unfamiliar place without being forced. Their caution has cost time, not safety.'),
    teamPassed: ending('teamPassed', 'A Calm Pace', 'The team moves on at a walk once the bend is no longer a surprise. The driver thanks you for looking before insisting; animals often notice a change before people do.'),
  },
};

export const THE_BEE_YARD: Scenario = {
  id: 'the-bee-yard', title: 'The Bee Yard', subtitle: 'A quiet apiary has one hive leaning out of line.', startScene: 'apiaryGate',
  diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
  scenes: {
    apiaryGate: { id: 'apiaryGate', title: 'Beyond the Low Fence', tone: 'warning', text: 'A small apiary stands behind a low fence, its wooden hives set in rows. A goat has rubbed one stand crooked; bees circle the shifted lid, but there is no swarm in the air. The beekeeper is away in the orchard. The public path is outside the fence.', choices: [
      { id: 'waitBeekeeper', label: 'Wait outside for the beekeeper', timeCost: 8, next: 'beekeeperReturns' },
      { id: 'moveGoatApiary', label: 'Ask the farmhand to lead the goat away', timeCost: 4, next: 'goatMoved' },
      { id: 'steadyStandTool', label: 'Use a small tool to steady the empty stand', requirements: { anyItems: ['pocketToolkit', 'foremanMultiTool', 'gateHook'] }, hint: 'Do not open the hive; first make the work area safe.', timeCost: 5, next: 'standSteadied' },
      { id: 'leaveApiary', label: 'Stay outside the fence and continue on', next: 'apiaryLeft' },
    ] },
    goatMoved: { id: 'goatMoved', title: 'The Yard Cleared', tone: 'safe', text: 'The farmhand leads the goat behind a separate rail fence. The crooked hive stand remains inside the apiary, and the bees keep circling the lid. The beekeeper should handle the hive itself.', choices: [
      { id: 'steadyApiaryStand', label: 'Hold the stand level while the farmhand braces it', timeCost: 5, next: 'standSteadied' },
      { id: 'waitAfterGoat', label: 'Wait outside for the beekeeper', timeCost: 6, next: 'beekeeperReturns' },
      { id: 'leaveAfterGoat', label: 'Let the beekeeper finish the repair', next: 'apiaryLeft' },
    ] },
    standSteadied: { id: 'standSteadied', title: 'The Hive Stands Level', tone: 'safe', text: 'With the goat away, you steady the wooden stand while the farmhand wedges a block beneath it. The hive stays closed. The circling bees begin to settle, and the beekeeper returns before anyone touches the lid.', choices: [
      { id: 'leaveBeesToKeeper', label: 'Let the beekeeper inspect the hive', next: 'beekeeperReturns', effects: { historyFlags: ['helped_secure_apiary_stand'] } },
      { id: 'continueAfterStand', label: 'Continue along the public path', next: 'apiaryLeft' },
    ] },
    beekeeperReturns: ending('beekeeperReturns', 'A Steady Row of Hives', 'The beekeeper checks the closed hive and finds no lasting damage. The goat is kept away from the stands, and the bees return to their ordinary work. No one needed to handle a hive without experience.'),
    apiaryLeft: ending('apiaryLeft', 'Outside the Fence', 'You leave the apiary closed to the public path. The beekeeper will find the crooked stand and the goat’s tracks; the hive itself has not been opened or disturbed.'),
  },
};

export const THE_OLD_HORSE: Scenario = {
  id: 'the-old-horse', title: 'The Old Horse', subtitle: 'A fair price depends on what the horse is asked to do.', startScene: 'horseOffer',
  runRandomSelections: [{ id: 'horseWork', values: [{ value: 'cart' }, { value: 'shortRides' }, { value: 'rest' }] }],
  scenes: {
    horseOffer: { id: 'horseOffer', title: 'A Modest Offer', tone: 'safe', text: 'At a farm gate, an older chestnut horse is offered for a modest price. It stands quietly and bears a few gray hairs around the muzzle. The seller says it has worked many years, but does not promise it can do every job. You may ask what work it knows, inspect its tack, or decline.', choices: [
      { id: 'askHorseWork', label: 'Ask what work the horse still handles', timeCost: 3, next: 'horseWorkKnown', effects: { knowledge: ['An older chestnut horse was offered cheaply; its suitable work depends on pace and load.'] } },
      { id: 'inspectOldHorseTack', label: 'Inspect the saddle and harness fit', timeCost: 4, next: 'horseInspected' },
      { id: 'declineOldHorse', label: 'Thank the seller and decline', next: 'horseDeclined' },
      { id: 'askPriceTerms', label: 'Ask whether the price can be discussed', timeCost: 2, next: 'horseTerms' },
    ] },
    horseWorkKnown: { id: 'horseWorkKnown', title: 'A Smaller Day’s Work', tone: 'safe', text: 'The seller explains what the horse knows and what it should not be asked to do. {{workDetail}} The price is open to discussion, and the horse can stay in its familiar stall if you decide not to buy.', textVariants: [
      { requirements: { selections: { horseWork: 'cart' } }, text: 'The horse is steady with a light cart on level roads, but should not haul a heavy load uphill.' },
      { requirements: { selections: { horseWork: 'shortRides' } }, text: 'The horse knows short rides and a calm walk, but no longer has the wind for a long day in the saddle.' },
      { requirements: { selections: { horseWork: 'rest' } }, text: 'The horse has earned a lighter life. It is sound at a walk, though the seller would rather see it kept for easy work and rest.' },
    ], choices: [
      { id: 'inspectHorseAfterTalk', label: 'Look over the horse and its tack', timeCost: 4, next: 'horseInspected' },
      { id: 'discussHorsePrice', label: 'Discuss a price suited to lighter work', timeCost: 3, next: 'horseTerms' },
      { id: 'declineAfterTalk', label: 'Leave the horse with its current owner', next: 'horseDeclined' },
    ] },
    horseInspected: { id: 'horseInspected', title: 'Fit for an Easy Pace', tone: 'safe', text: 'The tack is serviceable, though one strap is worn and should be replaced before a long journey. The horse stands evenly and accepts a gentle touch from the handler; this is no guarantee beyond the work you have been told about.', choices: [
      { id: 'offerFairHorsePrice', label: 'Offer a lower price for light work only', timeCost: 3, next: 'horseTerms', effects: { knowledge: ['The older chestnut stands evenly at rest, but one tack strap needs replacing before travel.'] } },
      { id: 'declineInspectedHorse', label: 'Decline rather than overwork it', next: 'horseDeclined' },
    ] },
    horseTerms: { id: 'horseTerms', title: 'A Price and an Honest Limit', tone: 'safe', text: 'The seller accepts that the horse’s useful work is limited and lowers the price. It will still cost three coins, and a buyer should have a place to keep it. You can buy, offer work in exchange, or leave the agreement alone.', choices: [
      { id: 'buyOlderHorse', label: 'Buy the horse for three coins', requirements: { minMoney: 3 }, effects: { money: -3, historyFlags: ['bought_older_horse_for_light_work'], gainOwnedAssets: [{ id: 'olderChestnutHorse', name: 'Older Chestnut Horse', description: 'Your horse, boarded at the farm where you bought her. Suited to light work and an easy pace.' }] }, next: 'horseBought' },
      { id: 'workForHorse', label: 'Offer a day’s farm work instead', timeCost: 25, next: 'horseBought', effects: { historyFlags: ['worked_for_older_horse'], gainOwnedAssets: [{ id: 'olderChestnutHorse', name: 'Older Chestnut Horse', description: 'Your horse, boarded at the farm where you bought her. Suited to light work and an easy pace.' }] } },
      { id: 'walkFromHorseDeal', label: 'Leave without buying', next: 'horseDeclined' },
    ] },
    horseBought: { ...ending('horseBought', 'A Lighter Arrangement', 'The older chestnut is yours now, but she stays boarded at the farm while suitable care and a modest workload are arranged. She is suited to light work and an easy pace, not a long or heavy journey.'), completionQualification: 'substantive' },
    horseDeclined: ending('horseDeclined', 'No Deal Needed', 'The seller keeps the horse in its familiar stall. It will continue at the easy pace it knows, and you continue without taking on an animal you cannot properly keep.'),
  },
};

export const ANIMAL_ADVENTURES: Scenario[] = [THE_STRAY_HORSE, THE_CALF_IN_THE_MUD, THE_DOG_THAT_RETURNS, THE_BROKEN_HARNESS, LOOSE_IN_THE_MARKET, THE_OWNERLESS_MULE, THE_INJURED_DOG, THE_FRIGHTENED_TEAM, THE_BEE_YARD, THE_OLD_HORSE];

