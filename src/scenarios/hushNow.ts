import type { Scenario } from '../types';

const GATE_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'ratCatchersHook', 'steelWedge', 'brassBottleOpener', 'gateHook'];
const SIGNALS = ['trailWhistle', 'farmWhistle'];

export const HUSH_NOW: Scenario = {
  id: 'hush-now',
  title: 'Hush Now',
  subtitle: 'A farmhouse gone quiet, restless animals, and someone who has not come home.',
  startScene: 'farmhouseArrival',
  timePhases: [
    { id: 'uneasy', label: 'Uneasy Evening', atMinutes: 0 },
    { id: 'worsening', label: 'Light Fading', atMinutes: 12 },
    { id: 'dangerous', label: 'The Animals Stir', atMinutes: 24 },
    { id: 'critical', label: 'A Weak Reply', atMinutes: 38 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 52 },
  ],
  scenes: {
    farmhouseArrival: {
      id: 'farmhouseArrival', title: 'A House Holding Its Breath', tone: 'warning',
      text: 'Rain ticks against the farmhouse windows. Inside, Mara and her son Ben speak in whispers while sheep stamp somewhere beyond the wall. A cow gives one sharp bellow, then goes quiet. Nell, the farmhand, went out to check a gate before dusk and has not returned. Mara says something is moving near the barn. Ben thinks it may be Nell coming back. Neither has gone to look.',
      textVariants: [
        { requirements: { historyFlags: ['rescued_missing_family_member'] }, text: 'Mara recognizes you as someone who has brought a missing person home before. She still whispers: sheep stamp outside, a cow has bellowed once, and Nell went to check a gate before dusk but has not returned. Something moved near the barn; no one knows what.' },
        { requirements: { historyFlags: ['protected_livestock'] }, text: 'Mara has heard that you know how to handle frightened animals. Rain ticks at the windows. Sheep stamp beyond the wall, a cow has bellowed once, and Nell has not returned from checking a gate before dusk.' },
        { requirements: { historyFlags: ['used_force_in_rescue'] }, text: 'Mara notices your steady, guarded manner and asks you not to rush outside. Sheep stamp beyond the wall, a cow has bellowed once, and Nell has not returned from checking a gate before dusk.' },
      ],
      choices: [
        { id: 'askWhatHappened', label: 'Ask the household what they know', timeCost: 3, next: 'householdAccounts' },
        { id: 'listenAtDoor', label: 'Listen quietly at the back door', timeCost: 3, next: 'quietListening', effects: { setFlags: ['keptQuiet'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'lookThroughWindow', label: 'Study the yard from the window', timeCost: 3, next: 'windowView' },
        { id: 'leaveNow', label: 'Leave without getting involved', next: 'walkAwayEnding', effects: { historyFlags: ['abandoned_farmhouse_problem'] } },
      ],
    },
    householdAccounts: {
      id: 'householdAccounts', title: 'Three Versions of the Same Evening', tone: 'warning',
      text: 'Mara heard a scrape by the barn and thinks an animal may have broken loose. Ben heard two knocks from beyond the north fence and thinks Nell is trying to get back without frightening the sheep. Their grandfather says the old drainage cut carries sound strangely in the rain. The gate was already stiff this morning; none of them saw Nell leave.',
      choices: [
        { id: 'askBenToShowNorthSide', label: 'Ask Ben to point out the north side', timeCost: 3, next: 'northYard' },
        { id: 'checkMissingCoat', label: 'Check what Nell took with her', timeCost: 3, next: 'coatHook' },
        { id: 'inspectTheLivestock', label: 'See how the animals are reacting', timeCost: 5, next: 'livestockClue' },
        { id: 'callForNeighbor', label: 'Go for a neighboring farm', hint: 'The walk is safe, but it will cost time before anyone searches.', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    quietListening: {
      id: 'quietListening', title: 'A Sound Beneath the Rain', tone: 'warning',
      text: 'You wait without speaking. Between the rain and the restless hooves comes a faint, uneven tapping from somewhere downhill. It stops when the cow shifts, then starts again. It could be a loose shutter, a branch, or someone trying not to call out.',
      choices: [
        { id: 'followQuietTapping', label: 'Follow the tapping without calling', timeCost: 6, next: 'downhillSound', effects: { knowledge: ['A faint uneven tapping carries from the drainage cut downhill; it pauses when the livestock move.'], setFlags: ['heardDownhillTapping'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'observeAnimalsQuietly', label: 'Watch which way the sheep face', timeCost: 4, next: 'livestockClue', effects: { knowledge: ['The sheep bunch away from the north fence and keep looking toward the drainage cut.'] } },
        { id: 'waitInsideQuietly', label: 'Wait quietly for another sound', hint: 'The delay may make the next sound clearer, but Nell has already been out a while.', timeCost: 22, next: 'afterWaiting', effects: { setFlags: ['waitedQuietly'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'quietlyFetchNeighbor', label: 'Fetch a neighbor without calling out', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['stayed_quiet_during_farm_crisis', 'left_for_help'] } },
      ],
    },
    windowView: {
      id: 'windowView', title: 'Movement at the Fence', tone: 'warning',
      text: 'A low shape shifts beyond the fence, then vanishes behind the shed. The sheep bunch against the far side of their pen. You cannot tell whether the shape was a person, an animal, or a tarp moving in the wind. The back gate hangs at an angle, and the rain is making the yard hard to read.',
      choices: [
        { id: 'approachFenceQuietly', label: 'Go out and inspect the fence quietly', timeCost: 6, next: 'northYard', effects: { setFlags: ['keptQuiet'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'callOutWithoutSignal', label: 'Call Nell’s name from the doorway', requirements: { notItems: SIGNALS }, hint: 'A voice may reach her, but startled livestock can break through a weak gate.', timeCost: 3, chance: { probability: 0.58, successNext: 'downhillAnswer', failureNext: 'animalsStartled', successMessage: 'Someone answers from downhill. The sheep bunch tighter as your voice carries.', failureMessage: 'No voice answers. The cow crashes against the pen and the sheep surge toward the north fence.', successEffects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['madeNoise', 'livestockPanicked'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'signalWithWhistle', label: 'Use your whistle to call for Nell', requirements: { anyItems: SIGNALS }, hint: 'A sharp signal may reach farther—and startle the penned animals.', timeCost: 2, chance: { probability: 0.76, bonusItems: SIGNALS, bonusProbability: 0.12, successNext: 'downhillAnswer', failureNext: 'animalsStartled', successMessage: 'A weak reply comes from downhill, though the whistle sets the sheep moving.', failureMessage: 'The whistle startles the sheep. The cow surges toward the gate, and no one answers.', failureEffects: { setFlags: ['madeNoise', 'livestockPanicked'], historyFlags: ['called_out_during_farm_crisis'] }, successEffects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'searchWithHeadlamp', label: 'Use your headlamp to read the yard', requirements: { items: ['minerHeadlamp'] }, timeCost: 4, next: 'northYard', effects: { knowledge: ['The clearest prints lead from the north gate toward the drainage cut.'] } },
        { id: 'searchWithLantern', label: 'Take the lantern into the yard', requirements: { notItems: ['minerHeadlamp'], items: ['lantern'] }, hint: 'The light helps with tracks but makes your position visible.', timeCost: 5, next: 'northYard', effects: { setFlags: ['carriedOpenLight'], knowledge: ['The clearest prints lead from the north gate toward the drainage cut.'] } },
      ],
    },
    coatHook: {
      id: 'coatHook', title: 'The Empty Peg', tone: 'warning',
      text: 'Nell’s rain cape and work gloves are gone, but the lantern she usually takes is still on its hook. Ben says she might have borrowed a light from the barn. Mara remembers Nell saying she would only be a minute at the gate. The missing lantern makes the low tapping harder to explain.',
      choices: [
        { id: 'checkNorthYardFromCoat', label: 'Follow the prints toward the north gate', timeCost: 5, next: 'northYard', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'listenAfterCoatClue', label: 'Listen for the tapping again', timeCost: 3, next: 'downhillSound', effects: { setFlags: ['keptQuiet'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'seekNeighborFromCoat', label: 'Get help before going outside', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    northYard: {
      id: 'northYard', title: 'The North Yard', tone: 'warning',
      text: 'Rain has softened the ground. There are bootprints by the gate and broad, split hoofprints crossing them. A length of fence wire is bent outward, though the post is not pulled from the ground. From here the drainage cut slopes toward a stand of alders. The tracks could belong to someone entering, someone leaving, or an animal pushing through.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The rain has blurred most of the bootprints. The broad hoof marks still point away from the bent gate, toward the drainage cut. The sheep are louder now, and the yard is getting difficult to cross safely.' }],
      choices: [
        { id: 'inspectGateMechanism', label: 'Check how the gate came open', timeCost: 4, next: 'fenceLine' },
        { id: 'followPrintsToCut', label: 'Follow the mixed tracks downhill', timeCost: 7, next: 'personTrail', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'callFromNorthYard', label: 'Call toward the drainage cut', requirements: { notItems: SIGNALS }, hint: 'The sound may guide Nell, but could send the cow through the weak gate.', timeCost: 2, chance: { probability: 0.62, successNext: 'downhillAnswer', failureNext: 'animalsStartled', successMessage: 'A faint answer comes from the drainage cut.', failureMessage: 'The cow bolts against the gate at the sound; you step clear as the sheep scatter.', successEffects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['madeNoise', 'livestockPanicked'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'returnForHelpFromYard', label: 'Go for a neighbor before the light fades', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    fenceLine: {
      id: 'fenceLine', title: 'A Gate Left Ajar', tone: 'warning',
      text: 'The latch is bent but not broken, and the wire was pushed from inside the yard. A tuft of pale hair clings to the hinge. The marks point to an animal getting out, but they do not explain the bootprints or the tapping downhill. Handling the wet wire bare-handed could cut you; the gate is under enough strain to snap back.',
      choices: [
        { id: 'checkGateWithTool', label: 'Use a carried tool to test the latch', requirements: { anyItems: GATE_TOOLS }, hint: 'A tool lets you inspect the bent latch without putting your hand in the wire.', timeCost: 3, next: 'gateEvidence', effects: { knowledge: ['The gate was pushed open from inside; pale livestock hair is caught on the hinge.'] } },
        { id: 'checkGateByHand', label: 'Ease the latch open by hand', requirements: { notItems: GATE_TOOLS }, hint: 'The wet wire is taut and may snap back toward your fingers.', timeCost: 5, chance: { probability: 0.68, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.18, successNext: 'gateEvidence', failureNext: 'gateSnaps', successMessage: 'You ease the latch clear and see a fresh smear of pale hair.', failureMessage: 'The wire springs back and cuts your palm; the gate clatters against its post.', successEffects: { knowledge: ['The gate was pushed open from inside; pale livestock hair is caught on the hinge.'] }, failureEffects: { health: -1, setFlags: ['madeNoise', 'livestockPanicked'] } } },
        { id: 'useHookOnLatch', label: 'Work the latch with your hook', requirements: { items: ['ratCatchersHook'] }, hint: 'The hook can move the latch without reaching through the wire.', timeCost: 3, next: 'gateEvidence', effects: { knowledge: ['The gate was pushed open from inside; pale livestock hair is caught on the hinge.'] } },
        { id: 'followTracksInstead', label: 'Leave the gate and follow the hoofprints', timeCost: 6, next: 'heiferTrail', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
      ],
    },
    gateEvidence: {
      id: 'gateEvidence', title: 'The Gate’s Direction', tone: 'warning',
      text: 'The bent latch faces out, but the scrape marks start on the yard side. Whatever pressed through was inside the fence first. Broad hoofprints lead toward the alders; smaller bootprints follow them, then stop near the drainage cut. This is evidence of an animal getting loose, not proof of what happened to Nell.',
      choices: [
        { id: 'followHoofprints', label: 'Follow the hoofprints toward the alders', timeCost: 6, next: 'heiferTrail' },
        { id: 'followBootprintsFromGate', label: 'Follow the bootprints toward the drain', timeCost: 6, next: 'personTrail', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'quietlyCalmSheep', label: 'Settle the sheep before continuing', timeCost: 5, next: 'animalsCalmed', effects: { historyFlags: ['protected_livestock', 'stayed_quiet_during_farm_crisis'] } },
      ],
    },
    gateSnaps: {
      id: 'gateSnaps', title: 'The Latch Strikes Back', tone: 'danger',
      text: 'The wire catches your palm and the gate slams against its post. The clatter sends the sheep surging to the far side of the pen. Nothing answers from the drainage cut, but the hoofprints are clear in the churned mud. The gate is now too strained to handle without help or a tool.',
      choices: [
        { id: 'followHoovesAfterSnap', label: 'Follow the broad hoofprints', timeCost: 5, next: 'heiferTrail' },
        { id: 'callNeighborAfterSnap', label: 'Go for help with the fence', timeCost: 12, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'protectSheepAfterSnap', label: 'Keep the sheep back from the gate', timeCost: 4, next: 'animalsStartled', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    livestockClue: {
      id: 'livestockClue', title: 'The Empty Heifer Stall', tone: 'warning',
      text: 'The sheep are pressed into the south corner of the pen, facing away from the north gate. The heifer stall is empty and its wooden latch hangs open. Fresh hoof marks lead through the yard, but rain and overlapping bootprints make their direction uncertain. The animals are frightened, not injured.',
      choices: [
        { id: 'calmAnimalsQuietly', label: 'Calm the sheep with a low voice', timeCost: 5, chance: { probability: 0.72, bonusItems: ['travelRope', 'heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'animalsCalmed', failureNext: 'animalsStartled', successMessage: 'The sheep settle enough to stop pressing the weak fence.', failureMessage: 'A cow shifts in the stall; the sheep break toward the gate before you can calm them.', successEffects: { historyFlags: ['protected_livestock', 'stayed_quiet_during_farm_crisis'] }, failureEffects: { setFlags: ['livestockPanicked'] } } },
        { id: 'followHoovesFromPen', label: 'Follow the hoof marks into the yard', timeCost: 6, next: 'heiferTrail' },
        { id: 'repairGateFromPen', label: 'Secure the gate before the sheep push through', requirements: { anyItems: GATE_TOOLS }, timeCost: 4, next: 'animalsCalmed', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'askForAnimalHelp', label: 'Ask the household to hold the sheep', timeCost: 4, next: 'householdHelpsAnimals', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    householdHelpsAnimals: {
      id: 'householdHelpsAnimals', title: 'Hands at the Pen', tone: 'safe',
      text: 'Ben and Mara keep the sheep from crowding the fence while you check the yard. The animals settle a little when the people they know are beside them. Nell is still missing, and the hoofprints disappear toward the low ground.',
      choices: [
        { id: 'searchAfterSheepSettle', label: 'Follow the hoofprints downhill', timeCost: 6, next: 'heiferTrail', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'listenAfterSheepSettle', label: 'Listen for Nell from the fence', timeCost: 3, next: 'downhillSound', effects: { setFlags: ['keptQuiet'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'stayWithHouseholdAnimals', label: 'Stay with the animals and household', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    animalsCalmed: {
      id: 'animalsCalmed', title: 'A Little Room to Think', tone: 'safe',
      text: 'The sheep stop pushing the fence. Their breathing is still quick, but the pen is no longer at risk of breaking. The hoofprints continue toward the alders, and the faint tapping has not returned. Nell has been outside longer than anyone intended.',
      choices: [
        { id: 'searchAfterCalming', label: 'Follow the tracks toward Nell', timeCost: 6, next: 'heiferTrail', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'followTappingAfterCalming', label: 'Follow the tapping toward the drainage cut', timeCost: 5, next: 'drainageLip', effects: { knowledge: ['The faint tapping comes from the drainage cut beyond the north gate.'] } },
        { id: 'stayWithSafeAnimals', label: 'Stay and keep the livestock safe', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    heiferTrail: {
      id: 'heiferTrail', title: 'Tracks in the Wet Grass', tone: 'warning',
      text: 'The broad hoofprints lead across the lower pasture. One track stumbles, and the soft ground is gouged where something heavy slid. A narrower boot trail keeps beside it, then bends toward the old drainage cut. The track is consistent with a farm animal in distress, but you still have not seen Nell.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'Rain is filling the hoofprints. The heavy track has stumbled toward the drainage cut; the smaller boot trail follows it. The light is nearly gone, and you hear no clear call from Nell.' }],
      choices: [
        { id: 'followTrailToDrain', label: 'Follow both tracks to the drainage cut', timeCost: 6, next: 'drainageLip', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'secureHeiferWithRope', label: 'Use your rope to secure the loose heifer', requirements: { items: ['travelRope'] }, hint: 'The animal is frightened; a secure line can stop it reaching the road.', timeCost: 5, next: 'heiferSecured', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'goForHelpFromPasture', label: 'Get a neighbor before going farther', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    heiferSecured: {
      id: 'heiferSecured', title: 'A Lead on the Frightened Heifer', tone: 'warning',
      text: 'The rope gives you a safe distance from the heifer. It is trembling and mud-streaked, but has no visible wound. The track ends at the drainage cut where the bootprints and hoof marks cross. You can keep the animal from wandering or follow the faint tapping below.',
      choices: [
        { id: 'followCutAfterRoping', label: 'Follow the tapping to the drainage cut', timeCost: 5, next: 'drainageLip' },
        { id: 'leadHeiferHome', label: 'Lead the heifer back to the stable', timeCost: 8, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'callHouseholdAfterRoping', label: 'Signal the household to hold the secured animals', timeCost: 3, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    personTrail: {
      id: 'personTrail', title: 'The Prints That Stop', tone: 'warning',
      text: 'The bootprints cross the hoof marks, then end at the lip of the drainage cut. A lantern-sized dent marks the mud, but no lantern is there. The slope is slick and undercut; a careful descent may work, while rushing could take you into the ditch.',
      choices: [
        { id: 'followPrintsToDrain', label: 'Descend where the prints stop', hint: 'The wet bank is undercut. A slip could hurt you before anyone can help.', timeCost: 6, chance: { probability: 0.64, bonusItems: ['heavyLeatherGloves', 'minerHeadlamp'], bonusProbability: 0.16, successNext: 'drainageLip', failureNext: 'bankSlip', successMessage: 'You find a stable foothold and reach the lower path.', failureMessage: 'The wet bank gives way; you catch a root but strike your shoulder.', failureEffects: { health: -2 } } },
        { id: 'callAtPrints', label: 'Call from the safe bank', hint: 'Someone below may answer, but a shout may unsettle the livestock.', timeCost: 2, chance: { probability: 0.68, successNext: 'downhillAnswer', failureNext: 'animalsStartled', successMessage: 'A weak reply comes from below.', failureMessage: 'The rain swallows your voice; the sheep surge at another sound.', successEffects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['madeNoise', 'livestockPanicked'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'bringRopeToPrints', label: 'Secure a rope before descending', requirements: { items: ['travelRope'] }, timeCost: 4, next: 'drainageLip' },
        { id: 'getNeighborAtPrints', label: 'Return for a neighbor and more light', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    downhillSound: {
      id: 'downhillSound', title: 'The Drainage Cut', tone: 'warning',
      text: 'The tapping comes from a shallow cut beneath the pasture. Rainwater runs through it in a thin stream. You hear three uneven knocks, then a pause. The bank is slick, and the livestock are still shifting behind you. Nothing here tells you who is below.',
      choices: [
        { id: 'approachCutQuietly', label: 'Approach the cut without speaking', timeCost: 4, next: 'drainageLip', effects: { setFlags: ['keptQuiet'], historyFlags: ['stayed_quiet_during_farm_crisis'] } },
        { id: 'answerTheTapping', label: 'Tap back against the fence post', timeCost: 2, next: 'downhillAnswer', effects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } },
        { id: 'protectAnimalsInstead', label: 'Protect the livestock instead of descending', timeCost: 5, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'fetchHelpFromCut', label: 'Get a neighbor to search the ditch', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    downhillAnswer: {
      id: 'downhillAnswer', title: 'A Reply in the Rain', tone: 'warning',
      text: 'A weak voice answers from the drainage cut: “Here. Don’t bring the cow down.” The voice is human, but the words are hard to make out. The animals react to your call, and the ground below is still dangerous.',
      choices: [
        { id: 'goToVoiceAtCut', label: 'Follow the voice to the drainage cut', timeCost: 4, next: 'drainageLip', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'getHelpAfterReply', label: 'Get a neighbor before descending', timeCost: 12, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'settleHerdAfterReply', label: 'Keep the household and animals behind the stable gate', timeCost: 5, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    afterWaiting: {
      id: 'afterWaiting', title: 'The Second Sound', tone: 'danger',
      text: 'You wait in the kitchen. The tapping comes again—three knocks, then a long silence. The sheep have started to push the fence and the cow is breathing hard in its stall. Waiting gave you a clearer direction, but the animals and the person outside have less time.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'After the long wait, the tapping comes again, weaker this time. The sheep are pushing the fence and the cow has worked its latch loose. A response may still come from downhill, but the livestock are now in danger.' }],
      choices: [
        { id: 'followSecondKnock', label: 'Go toward the second knock', timeCost: 4, next: 'downhillAnswer', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'callAfterWaiting', label: 'Call Nell’s name from the doorway', requirements: { notItems: SIGNALS }, timeCost: 2, next: 'downhillAnswer', effects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } },
        { id: 'secureAnimalsAfterWait', label: 'Keep the sheep from breaking the fence', timeCost: 6, next: 'animalsStartled', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'leaveAfterWaiting', label: 'Leave and bring help from the road', timeCost: 12, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    animalsStartled: {
      id: 'animalsStartled', title: 'The Pen Gives a Shudder', tone: 'danger',
      text: 'The sheep bunch hard against one another and the heifer hits the gate from the yard side. You step clear before the latch gives way. The animals are loose in the north yard now; the fence clatter may have reached the drainage cut, but the safest route is no longer obvious.',
      choices: [
        { id: 'followLooseHeifer', label: 'Follow the heifer before it reaches the road', timeCost: 5, next: 'heiferTrail', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'callOutAfterPanic', label: 'Call Nell’s name over the noise', requirements: { notItems: SIGNALS }, timeCost: 2, next: 'downhillAnswer', effects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } },
        { id: 'useWhistleAfterPanic', label: 'Use your whistle to guide the animals', requirements: { anyItems: SIGNALS }, hint: 'The signal may turn the herd, but it could draw them toward you.', timeCost: 2, chance: { probability: 0.68, successNext: 'heiferTrail', failureNext: 'livestockLostEnding', successMessage: 'The heifer turns toward the familiar sound and away from the road.', failureMessage: 'The whistle sends the heifer bolting through the open field.', successEffects: { historyFlags: ['called_out_during_farm_crisis', 'protected_livestock'] }, failureEffects: { historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'retreatFromLooseAnimals', label: 'Get the household behind the stable door', timeCost: 3, next: 'livestockEnding' },
      ],
    },
    drainageLip: {
      id: 'drainageLip', title: 'Below the Bank', tone: 'danger',
      text: 'A rain cape is caught on a root below the bank. From the ditch comes a small scrape, then a breath. The soil is undercut and slick, and the stream is rising around the lower stones. You can see a shape beneath a fallen gate brace, but not whether it is moving.',
      textVariants: [{ requirements: { minElapsedMinutes: 38 }, text: 'The stream has risen around the lower stones. The rain cape is still caught on the root, and the shape beneath the gate brace gives a faint movement. The bank is now dangerous to descend without a line.' }],
      choices: [
        { id: 'descendWithRope', label: 'Secure your rope and descend', requirements: { items: ['travelRope'] }, hint: 'The undercut bank is slick; a line gives you a safer way back.', timeCost: 5, chance: { probability: 0.84, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.1, successNext: 'personFound', failureNext: 'bankSlip', successMessage: 'The line holds as you reach the lower shelf.', failureMessage: 'The bank shifts under the line. You catch yourself, but strike a stone.', failureEffects: { health: -2 } } },
        { id: 'descendCarefully', label: 'Climb down the slick bank carefully', requirements: { notItems: ['travelRope'] }, hint: 'The bank is visibly undercut. A slip could cause a serious fall.', timeCost: 7, chance: { probability: 0.56, bonusItems: ['heavyLeatherGloves', 'minerHeadlamp'], bonusProbability: 0.16, successNext: 'personFound', failureNext: 'bankSlip', successMessage: 'You find a stable foothold and reach the lower shelf.', failureMessage: 'The wet bank gives way; you hit the stream edge hard.', failureEffects: { health: -3 } } },
        { id: 'callDownFromLip', label: 'Call to the shape from solid ground', hint: 'A reply may confirm who is below; the call could startle the livestock.', timeCost: 2, chance: { probability: 0.7, successNext: 'personFound', failureNext: 'herdAfterNoise', successMessage: 'The shape answers, and you hear a human voice beneath the brace.', failureMessage: 'Only the rain answers; the cow breaks toward the north yard.', successEffects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['madeNoise', 'livestockPanicked'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'bringHelpToLip', label: 'Go for help before trying the bank', timeCost: 14, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    bankSlip: {
      id: 'bankSlip', title: 'The Bank Gives Way', tone: 'danger',
      text: 'The undercut bank collapses under your boot. You strike the stream edge and drag yourself clear, sore and wet. The route below cannot be approached alone now. The trapped shape still moves; the neighbor farm is uphill, and the north gate is a safer way around.',
      choices: [
        { id: 'goForNeighborAfterSlip', label: 'Get a neighbor to help with the descent', timeCost: 12, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'takeNorthRouteAfterSlip', label: 'Signal the neighbor from the upper bank', timeCost: 6, next: 'upperBankRoute', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'retreatAfterSlip', label: 'Stop the search and protect the household', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    herdAfterNoise: {
      id: 'herdAfterNoise', title: 'A Safer Place to Stand', tone: 'danger',
      text: 'The shout draws no reply from the bank, but it does send the livestock into the north yard. You stay on firm ground rather than risk another descent. From here you can keep the household safe or get trained help to the ditch.',
      choices: [
        { id: 'fetchHelpAfterNoise', label: 'Get a neighbor and a safer rescue line', timeCost: 10, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'secureHouseholdAfterNoise', label: 'Bring the household behind the stable gate', timeCost: 3, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'leaveAfterNoiseAtDitch', label: 'Leave the search for trained help', next: 'walkAwayEnding', effects: { historyFlags: ['abandoned_farmhouse_problem'] } },
      ],
    },
    upperBankRoute: {
      id: 'upperBankRoute', title: 'The Firm Ground Above', tone: 'warning',
      text: 'You reach the firm path above the undercut bank. The person below is still answering faintly, but another descent from this side would be unsafe. The neighbor’s farm lies uphill, and the household can keep the animals behind the stable gate while help is fetched.',
      choices: [
        { id: 'getHelpFromUpperBank', label: 'Fetch the neighbor and a safer line', timeCost: 10, next: 'neighborArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'signalHouseFromUpperBank', label: 'Signal the farmhouse to secure the animals', timeCost: 3, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'leaveFromUpperBank', label: 'Leave the search to the household', next: 'walkAwayEnding', effects: { historyFlags: ['abandoned_farmhouse_problem'] } },
      ],
    },
    personFound: {
      id: 'personFound', title: 'Nell Beneath the Brace', tone: 'warning',
      text: 'The shape is Nell, conscious but pinned by a fallen gate brace. She was trying to lead the frightened heifer away from the sheep when the gate dropped across her leg. The heifer is loose nearby; the cattle and sheep were reacting to it, not a predator or stranger. Nell has been tapping a fence staple against the stone, afraid a shout would send the animal over the road.',
      choices: [
        { id: 'liftBraceWithTool', label: 'Lever the brace with a carried tool', requirements: { anyItems: GATE_TOOLS }, hint: 'The brace is heavy; leverage can free her without pulling at the injured leg.', timeCost: 4, chance: { probability: 0.86, bonusItems: GATE_TOOLS, bonusProbability: 0.1, successNext: 'reunited', failureNext: 'braceStrain', successMessage: 'The lever lifts the brace enough for Nell to slide clear.', failureMessage: 'The brace shifts and drops back. Nell’s leg is still pinned, and you wrench your shoulder.', failureEffects: { health: -1 } } },
        { id: 'liftBraceWithRope', label: 'Use your rope to raise the brace', requirements: { items: ['travelRope'] }, hint: 'The line keeps the load off your hands, but the wet brace may slip.', timeCost: 5, chance: { probability: 0.8, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'reunited', failureNext: 'braceStrain', successMessage: 'The rope holds while Nell slides her leg free.', failureMessage: 'The wet line slips a little; the brace settles and scrapes your arm.', failureEffects: { health: -1 } } },
        { id: 'liftBraceByHand', label: 'Lift the brace together by hand', requirements: { notItems: [...GATE_TOOLS, 'travelRope'] }, hint: 'It is heavy and angled over Nell’s leg; a failed lift could worsen her injury.', timeCost: 7, chance: { probability: 0.58, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'reunited', failureNext: 'braceStrain', successMessage: 'You find enough leverage to lift while Nell pulls her leg clear.', failureMessage: 'The brace shifts back before Nell can move; you take a painful knock.', failureEffects: { health: -2 } } },
        { id: 'callForHelpAtNell', label: 'Call the household down to help lift', timeCost: 8, next: 'neighborLiftsNell', effects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } },
      ],
    },
    braceStrain: {
      id: 'braceStrain', title: 'The Brace Shifts', tone: 'danger',
      text: 'The brace drops back before Nell can pull free. She winces but remains alert. The bank is still unstable, and the wet wood is heavier than it looked. You need another pair of hands or a safer way to lift it.',
      choices: [
        { id: 'bringNeighborToBrace', label: 'Get a neighbor to help lift', timeCost: 10, next: 'neighborLiftsNell', effects: { historyFlags: ['left_for_help'] } },
        { id: 'tryAgainWithHousehold', label: 'Call Mara and Ben down carefully', timeCost: 6, next: 'neighborLiftsNell', effects: { setFlags: ['madeNoise'], historyFlags: ['called_out_during_farm_crisis'] } },
        { id: 'backOffBrace', label: 'Leave the brace and protect the animals', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    neighborArrives: {
      id: 'neighborArrives', title: 'A Lantern on the Lane', tone: 'warning',
      text: 'Your neighbor arrives with a storm lantern and a coil of fence wire. He heard the sheep from his own barn and was already worried. He does not know where Nell is, but he can hold the gate or help search the drainage cut. The delay has cost some light.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The neighbor arrives with a storm lantern after a long walk. The sheep are straining the fence now. He can help search the drainage cut, but the delay has made the descent more dangerous.' }],
      choices: [
        { id: 'searchCutWithNeighbor', label: 'Search the drainage cut together', timeCost: 6, next: 'neighborRescue', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'securePenWithNeighbor', label: 'Have him secure the livestock first', timeCost: 5, next: 'neighborSecuresAnimals', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'payForQuickWire', label: 'Pay him 3 coins for the spare gate wire', requirements: { minMoney: 3 }, hint: 'The wire will secure the broken pen quickly, but costs 3 coins.', timeCost: 3, next: 'neighborSecuresAnimals', effects: { money: -3, historyFlags: ['protected_livestock'] } },
        { id: 'askNeighborToFetchMoreHelp', label: 'Send him for a second pair of hands', timeCost: 12, next: 'neighborRescue', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    neighborSecuresAnimals: {
      id: 'neighborSecuresAnimals', title: 'Wire on the Gate', tone: 'safe',
      text: 'The neighbor ties the weak gate shut with fresh wire. The sheep settle behind the repaired pen, but Nell is still outside. In the rain, you hear one faint knock from the drainage cut.',
      choices: [
        { id: 'goToDrainAfterWire', label: 'Follow the knock toward the drainage cut', timeCost: 4, next: 'neighborRescue', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'stayWithAnimalsAfterWire', label: 'Stay with the secured livestock', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'sendNeighborForNell', label: 'Send the neighbor to find Nell', timeCost: 7, next: 'neighborRescue', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
      ],
    },
    neighborRescue: {
      id: 'neighborRescue', title: 'Two Sets of Hands', tone: 'warning',
      text: 'The neighbor holds a lantern steady while you search the lower path. He hears a faint tap from behind the gate brace and answers with a knock of his own. Someone below answers back. The descent remains slick, but you now have a light and another person to keep the line secure.',
      choices: [
        { id: 'descendWithNeighbor', label: 'Descend together to the answering knock', timeCost: 5, next: 'personFound', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'letNeighborDescend', label: 'Have the neighbor go down while you hold the line', requirements: { items: ['travelRope'] }, timeCost: 4, next: 'personFound', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'returnToHouseWithNeighbor', label: 'Ask the neighbor to take the household to safety', timeCost: 4, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    neighborLiftsNell: {
      id: 'neighborLiftsNell', title: 'Help at the Brace', tone: 'warning',
      text: 'Mara and the neighbor hold the gate brace while you guide Nell’s leg clear. More hands make the lift safer, though the wet ground still shifts beneath them. The sheep are quieter now, and the heifer remains somewhere beyond the fence.',
      choices: [
        { id: 'liftTogether', label: 'Lift together on a steady count', timeCost: 4, chance: { probability: 0.88, successNext: 'reunited', failureNext: 'braceStrainWithHelp', successMessage: 'The brace rises evenly and Nell pulls her leg free.', failureMessage: 'The brace slips before the count is finished; everyone lets go safely.', failureEffects: { health: -1 } } },
        { id: 'secureHouseholdBeforeLift', label: 'Have Ben take the sheep to the stable first', timeCost: 5, next: 'animalsHeldForLift', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    animalsHeldForLift: {
      id: 'animalsHeldForLift', title: 'The Yard Settles', tone: 'warning',
      text: 'Ben has moved the sheep behind the stable gate, leaving the adults room to work. Nell is still pinned, but the loose heifer is no longer pressing against the fence. With the animals out of the way, you can make a steadier lift.',
      choices: [
        { id: 'liftWithStableYard', label: 'Lift the brace together', timeCost: 4, chance: { probability: 0.88, successNext: 'reunited', failureNext: 'braceStrainWithHelp', successMessage: 'The brace rises evenly and Nell slides free.', failureMessage: 'The wet brace twists before Nell can move; everyone catches it safely.', failureEffects: { health: -1 } } },
        { id: 'getNellProfessionalHelp', label: 'Have the neighbor fetch a rescue team', timeCost: 10, next: 'delayedRescueEnding', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    braceStrainWithHelp: {
      id: 'braceStrainWithHelp', title: 'The Brace Settles Back', tone: 'danger',
      text: 'The brace slips from the first lift. The neighbor keeps it from falling fully and nobody is crushed, but Nell’s leg remains pinned. The bank is deteriorating; one careful adjustment may work, or the neighbor can bring a rescue team while you keep the brace steady.',
      choices: [
        { id: 'adjustBraceWithHelp', label: 'Adjust the brace and try one careful lift', hint: 'You have help now, but the wet support is still shifting.', timeCost: 4, chance: { probability: 0.72, bonusItems: GATE_TOOLS, bonusProbability: 0.14, successNext: 'reunited', failureNext: 'delayedRescueEnding', successMessage: 'The support holds long enough for Nell to pull free.', failureMessage: 'The brace shifts again. The neighbor leaves for trained help while you keep Nell sheltered.', failureEffects: { health: -1 } } },
        { id: 'sendForRescueTeam', label: 'Keep the brace steady and send for rescue help', timeCost: 8, next: 'delayedRescueEnding', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    reunited: {
      id: 'reunited', title: 'A Breath at Last', tone: 'safe',
      text: 'Nell is free, shaken, and able to stand with support. She confirms the heifer got out when the stiff latch failed; she followed it to keep it away from the road, then the brace fell. The noise, hoofprints, and tapping all belonged to one bad evening—not an intruder. The heifer is still loose.',
      choices: [
        { id: 'leadHeiferWithRope', label: 'Lead the heifer back with your rope', requirements: { items: ['travelRope'] }, timeCost: 7, next: 'rewardOffer', effects: { historyFlags: ['protected_livestock', 'rescued_missing_family_member'] } },
        { id: 'calmHeiferByHand', label: 'Calm the heifer and walk it back slowly', requirements: { notItems: ['travelRope'] }, hint: 'The animal is frightened; a sudden move could send it toward the road.', timeCost: 8, chance: { probability: 0.6, bonusItems: ['heavyLeatherGloves', 'farmWhistle', 'trailWhistle'], bonusProbability: 0.15, successNext: 'rewardOffer', failureNext: 'heiferBreaksAway', successMessage: 'The heifer follows your steady voice back toward the pen.', failureMessage: 'The heifer shies away and runs toward the open pasture.', successEffects: { historyFlags: ['protected_livestock', 'rescued_missing_family_member'] }, failureEffects: { historyFlags: ['rescued_missing_family_member'] } } },
        { id: 'getNellHomeFirst', label: 'Take Nell to the farmhouse first', timeCost: 5, next: 'peopleSafeEnding', effects: { historyFlags: ['rescued_missing_family_member'] } },
        { id: 'askNeighborForHeifer', label: 'Ask the neighbor to handle the heifer', timeCost: 5, next: 'rewardOffer', effects: { historyFlags: ['protected_livestock', 'rescued_missing_family_member'] } },
      ],
    },
    heiferBreaksAway: {
      id: 'heiferBreaksAway', title: 'The Heifer Runs', tone: 'danger',
      text: 'The heifer shies from you and runs into the dark pasture. You stay clear of its hooves; no one is hurt, but the animal is headed toward the road. Nell is safe now, and the household can decide whether to search for the heifer or wait for daylight.',
      choices: [
        { id: 'followHeiferAtDistance', label: 'Follow at a safe distance', timeCost: 7, chance: { probability: 0.58, successNext: 'rewardOffer', failureNext: 'livestockLostEnding', successMessage: 'The heifer turns back toward the familiar yard as Nell calls softly.', failureMessage: 'The heifer vanishes across the pasture before you can keep pace.', successEffects: { historyFlags: ['protected_livestock', 'rescued_missing_family_member'] }, failureEffects: { historyFlags: ['rescued_missing_family_member'] } } },
        { id: 'leaveHeiferForMorning', label: 'Keep Nell safe and leave the search for morning', next: 'peopleSafeEnding', effects: { historyFlags: ['rescued_missing_family_member'] } },
        { id: 'askNeighborToTrackHeifer', label: 'Ask the neighbor to watch the road', timeCost: 5, next: 'neighborHeiferSearch', effects: { historyFlags: ['rescued_missing_family_member'] } },
      ],
    },
    neighborHeiferSearch: {
      id: 'neighborHeiferSearch', title: 'A Lantern Goes to the Road', tone: 'warning',
      text: 'The neighbor takes his lantern along the road while Nell stays with the household. You can hear the heifer moving in the pasture, but the dark makes chasing it unsafe. The pen is secured and the missing person is home.',
      choices: [
        { id: 'stayHomeAfterSearch', label: 'Stay with Nell and the household', next: 'peopleSafeEnding', effects: { historyFlags: ['rescued_missing_family_member'] } },
        { id: 'waitForHeiferAtGate', label: 'Wait quietly by the repaired gate', timeCost: 10, next: 'rewardOffer', effects: { historyFlags: ['protected_livestock', 'rescued_missing_family_member'] } },
      ],
    },
    rewardOffer: {
      id: 'rewardOffer', title: 'A Quiet Thank-You', tone: 'safe',
      text: 'With Nell home and the livestock safe, the household offers you a choice of practical thanks: a clear farm whistle or a stout gate hook. Neither changes what happened tonight; both are useful tools for the road.',
      choices: [
        { id: 'acceptFarmWhistle', label: 'Take the farm whistle', requirements: { notItems: ['farmWhistle'] }, effects: { gainItems: ['farmWhistle'] }, next: 'safeHouseholdEnding' },
        { id: 'acceptGateHook', label: 'Take the gate hook', requirements: { notItems: ['gateHook'] }, effects: { gainItems: ['gateHook'] }, next: 'safeHouseholdEnding' },
        { id: 'declineFarmReward', label: 'Thank them and leave without a reward', next: 'safeHouseholdEnding' },
      ],
    },
    safeHouseholdEnding: {
      id: 'safeHouseholdEnding', title: 'The House Speaks Again', tone: 'safe', ending: 'success',
      text: 'The sheep settle and the household stops whispering. Nell’s leg will need attention, and the gate needs a proper repair in daylight, but the heifer is back and everyone is safe. The family remembers what you chose to do while the road outside was dark.',
      choices: [],
    },
    peopleSafeEnding: {
      id: 'peopleSafeEnding', title: 'Nell Comes Home', tone: 'safe', ending: 'success',
      text: 'Nell reaches the farmhouse with help. The household is together, but the heifer remains somewhere beyond the fence and the sheep will need watching. You chose to get a person to safety before trying to settle everything else.',
      choices: [],
    },
    delayedRescueEnding: {
      id: 'delayedRescueEnding', title: 'Help on the Way', tone: 'warning', ending: 'success',
      text: 'The neighbor keeps the brace from shifting while trained help is fetched. Nell is cold and frightened, but she is answering and no longer alone. The animals are behind the stable gate. The rescue will take longer than you wanted, and the household will remember that you stayed.',
      choices: [],
    },
    livestockEnding: {
      id: 'livestockEnding', title: 'A Pen Secured for the Night', tone: 'safe', ending: 'success',
      text: 'The household gets behind the stable door and the sheep are kept from the broken gate. Nell remains missing, so the family will need to search at first light. The animals are safe for now; the rest is left unresolved.',
      choices: [],
    },
    livestockLostEnding: {
      id: 'livestockLostEnding', title: 'Hooves in the Dark', tone: 'warning', ending: 'success',
      text: 'The heifer disappears beyond the pasture before anyone can turn it. The household closes the stable and keeps the sheep safe, but the animal may be on the road. Nell has not been found, and the family will need help in daylight.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Keeps Moving', tone: 'safe', ending: 'success',
      text: 'You leave the farmhouse as the rain darkens the road. The family is still together inside, but Nell and the livestock remain outside the circle of lamplight. You do not learn what made the sounds or what the household does next.',
      choices: [],
    },
  },
};
