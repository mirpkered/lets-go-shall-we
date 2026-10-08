import type { Scenario } from '../types';

const FARM_LIGHTS = ['lantern', 'minerHeadlamp', 'roadmansLantern'];
const OPTIONAL_RESCUE_GEAR = ['foremanMultiTool', 'foldingPryTool', 'ratCatchersHook', 'travelRope', 'compactBlockAndTackle', 'steelWedge'];

export const HUSH_NOW: Scenario = {
  id: 'hush-now',
  title: 'Hush Now',
  subtitle: 'A hard evening’s work, a restless farm, and someone missing from the crew.',
  startScene: 'farmhouseArrival',
  saveVersion: 1,
  runRandomSelections: [
    { id: 'farmOwner', values: [{ value: 'Delia' }, { value: 'Yara' }, { value: 'Corra' }, { value: 'Maelin' }] },
    { id: 'farmChild', values: [{ value: 'Pip' }, { value: 'Davy' }, { value: 'Nettie' }, { value: 'Toby' }] },
    { id: 'farmhand', values: [{ value: 'Carys' }, { value: 'Orrin' }, { value: 'Emlyn' }, { value: 'Tovan' }] },
  ],
  timePhases: [
    { id: 'evening', label: 'Rainy Evening', atMinutes: 0 },
    { id: 'darkening', label: 'Light Fading', atMinutes: 15 },
    { id: 'risingWater', label: 'Water in the Cut', atMinutes: 32 },
    { id: 'late', label: 'Late Evening', atMinutes: 48 },
  ],
  scenes: {
    farmhouseArrival: {
      id: 'farmhouseArrival', title: 'A Day’s Work', tone: 'warning',
      text: 'You were hired for a day mending a sheep-pen gate; supper and two coins are promised. You and {{farmhand}} worked together since noon. The farmhouse is west of the yard, the stable north, and the sheep pen south. Beyond it, a low pasture slopes east to a shallow drainage cut; the west gate opens to the road. {{farmOwner}} and {{farmChild}} are inside with you. {{farmhand}} went to check the pen gate before dusk and has not returned. Rain taps the windows; the sheep stamp.',
      textVariants: [
        { requirements: { historyFlags: ['rescued_missing_family_member'] }, text: 'You were hired to mend a sheep-pen gate; supper and two coins were agreed. {{farmOwner}} remembers that you brought a missing person home before. The farmhouse is west of the yard, the stable north, and the sheep pen south; the pasture slopes east to the drainage cut. The west gate opens to the road. {{farmhand}} worked with you all day, checked the pen gate before dusk, and has not returned.' },
        { requirements: { historyFlags: ['protected_livestock'] }, text: '{{farmOwner}} has heard you can handle frightened animals. The farmhouse is west of the yard, the stable north, and the sheep pen south; the pasture slopes east to the drainage cut. {{farmhand}} worked with you all day, checked the pen gate before dusk, and has not returned.' },
      ],
      choices: [
        { id: 'askOwner', label: 'Ask {{farmOwner}} what happened', timeCost: 2, next: 'householdTalk' },
        { id: 'lookIntoYard', label: 'Look into the yard from the door', timeCost: 2, next: 'yardInspection' },
        { id: 'fetchNeighbor', label: 'Fetch a neighbor before searching', hint: 'The road is safe, but the walk will cost time.', timeCost: 12, next: 'neighborSearch' },
        { id: 'leaveNow', label: 'Take the road and leave', next: 'walkAwayEnding', effects: { historyFlags: ['left_farmhand_unsearched'] } },
      ],
    },
    householdTalk: {
      id: 'householdTalk', title: 'What They Know', tone: 'warning',
      text: '{{farmOwner}} says {{farmhand}} went south through the yard to the sheep pen, not east toward the drainage cut. {{farmChild}} heard the pen gate strike its post once, then heard nothing. No one saw {{farmhand}} after that. {{farmOwner}} can go with you; the child will stay inside. The short iron gate bar and shovel supplied for your work still rest on the rack beside the stable door.',
      choices: [
        { id: 'searchWithOwner', label: 'Go to the pen with {{farmOwner}}', timeCost: 5, next: 'yardInspection', effects: { setFlags: ['adultHelperPresent'] } },
        { id: 'takeFarmBar', label: 'Take the farm’s gate bar and search', timeCost: 4, next: 'pastureWithFarmBar', effects: { setFlags: ['hasFarmBar'] } },
        { id: 'secureAnimalsFirst', label: 'Secure the sheep before searching', timeCost: 6, next: 'penSecured', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'leaveAfterTalk', label: 'Leave without searching', next: 'walkAwayEnding', effects: { historyFlags: ['left_farmhand_unsearched'] } },
      ],
    },
    yardInspection: {
      id: 'yardInspection', title: 'The Work Yard', tone: 'warning',
      text: 'You step east from the farmhouse into the yard. The stable is on your left, the sheep pen on your right, and the gate to the low pasture stands open ahead. The heifer’s stall inside the stable is empty. Fresh hoofprints and {{farmhand}}’s bootprints cross the wet ground toward the east slope. A loose gate rail lies nearby; ordinary farm tools are within reach at the stable rack.',
      choices: [
        { id: 'followTracks', label: 'Follow the prints toward the low pasture', timeCost: 6, next: 'pastureSearch', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'takeGateBarFromYard', label: 'Take the farm’s iron gate bar', timeCost: 2, next: 'pastureWithFarmBar', effects: { setFlags: ['hasFarmBar'] } },
        { id: 'secureSheep', label: 'Close the pen before the sheep push out', timeCost: 5, next: 'penSecured', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'callTowardCut', label: 'Call {{farmhand}} from the yard', hint: 'The empty stall and fresh prints suggest an animal may be out; a shout could send it toward the road.', timeCost: 2, chance: { probability: 0.68, successNext: 'replyAtBank', failureNext: 'looseHeifer', successMessage: 'A faint human answer carries back from the drainage cut.', failureMessage: 'The heifer bursts from the pasture gate and runs toward the road.', successEffects: { knowledge: ['A person is alive near the drainage cut east of the sheep pen.'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['heiferLoose'], historyFlags: ['called_out_during_farm_crisis'] } } },
      ],
    },
    penSecured: {
      id: 'penSecured', title: 'Room to Work', tone: 'safe',
      text: 'You close the pen gate and settle the sheep back from it. The animals are frightened but unhurt. The open pasture gate and the prints leading east are still clear. {{farmOwner}} can stay with the sheep or come with you toward the drainage cut.',
      choices: [
        { id: 'searchAfterSecuring', label: 'Search the low pasture', timeCost: 5, next: 'pastureSearch', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'ownerComesAfterSecuring', label: 'Ask {{farmOwner}} to come along', timeCost: 3, next: 'pastureSearch', effects: { setFlags: ['adultHelperPresent'] } },
        { id: 'remainWithSheep', label: 'Stay by the secured pen for the night', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    pastureWithFarmBar: {
      id: 'pastureWithFarmBar', title: 'A Tool from the Stable Rack', tone: 'warning',
      text: 'You take the short iron gate bar supplied for the day’s work and follow the hoofprints east from the pen. The ground dips toward the drainage cut. A stout oak stands on its north bank; the rain has darkened the soil below it.',
      choices: [
        { id: 'followBarTracks', label: 'Follow the prints to the drainage cut', timeCost: 5, next: 'bankSearch', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'returnBarSecureSheep', label: 'Use the bar to secure the pen instead', timeCost: 5, next: 'penSecured', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'callFromBarRoute', label: 'Call down the east slope', timeCost: 2, chance: { probability: 0.72, successNext: 'replyAtBank', failureNext: 'looseHeifer', successMessage: 'A faint voice answers from beyond the oak.', failureMessage: 'The heifer bolts toward the road at the sound.', successEffects: { knowledge: ['A person is alive near the drainage cut east of the sheep pen.'] }, failureEffects: { setFlags: ['heiferLoose'] } } },
      ],
    },
    pastureSearch: {
      id: 'pastureSearch', title: 'Prints Below the Pen', tone: 'warning',
      text: 'You move east through the low pasture, leaving the farmhouse and stable behind. The prints end beside the drainage cut below the oak. A rain cape is caught on a root on the north bank. The cut is only waist-deep in places, but rainwater is running through it and the muddy sides are steep.',
      textVariants: [
        { requirements: { minElapsedMinutes: 32 }, text: 'You move east through the low pasture, leaving the farmhouse and stable behind. Rainwater now runs swiftly through the waist-deep cut. The prints end below the oak; a rain cape is caught on a root on the north bank. Its muddy sides are steep, and the light is fading.' },
        { requirements: { anyItems: FARM_LIGHTS }, text: 'You move east through the low pasture, leaving the farmhouse and stable behind. By your light, the prints end beside the drainage cut below the oak; a rain cape is caught on a root on the north bank. Water runs through the waist-deep cut, whose muddy sides are steep.' },
      ],
      choices: [
        { id: 'approachCut', label: 'Approach the cut from the oak’s firm ground', hint: 'The bank is steep and wet; a slip could injure you.', timeCost: 5, next: 'bankSearch', effects: { historyFlags: ['searched_for_missing_farmhand'] } },
        { id: 'callFromPasture', label: 'Call {{farmhand}} from the bank', hint: 'A shout may startle livestock near the farmyard and make the wet tracks harder to read.', timeCost: 2, chance: { probability: 0.72, successNext: 'replyAtBank', failureNext: 'looseHeifer', successMessage: 'A faint human reply comes from inside the cut.', failureMessage: 'The heifer breaks from the pasture gate and runs toward the road.', successEffects: { knowledge: ['A person is alive in the drainage cut below the oak.'], historyFlags: ['called_out_during_farm_crisis'] }, failureEffects: { setFlags: ['heiferLoose'], historyFlags: ['called_out_during_farm_crisis'] } } },
        { id: 'callOwnerFromPasture', label: 'Call uphill for {{farmOwner}} to help', timeCost: 6, next: 'helpArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'turnBackPasture', label: 'Turn back and leave the search', next: 'walkAwayEnding', effects: { historyFlags: ['left_farmhand_unsearched'] } },
      ],
    },
    neighborSearch: {
      id: 'neighborSearch', title: 'A Second Lantern', tone: 'warning',
      text: 'You walk along the west road to the neighboring farm and return with its owner, carrying a storm lantern. {{farmOwner}} joins you from the farmhouse; the child stays inside. Neither adult has seen {{farmhand}}. Together you follow the clear prints east across the low pasture to the oak above the drainage cut. The rain is steady, but you have two adults and good light.',
      choices: [
        { id: 'searchCutWithNeighbor', label: 'Search the cut together', timeCost: 7, next: 'bankSearch', effects: { setFlags: ['adultHelperPresent'], historyFlags: ['searched_for_missing_farmhand', 'left_for_help'] } },
        { id: 'neighborSecurePen', label: 'Have the neighbor secure the sheep', timeCost: 6, next: 'penSecured', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'endNeighborSearch', label: 'Leave the rest for daylight', next: 'livestockEnding' },
      ],
    },
    replyAtBank: {
      id: 'replyAtBank', title: 'A Voice Below', tone: 'warning',
      text: 'A weak reply comes from the drainage cut below the oak. You are on the north bank, with the farmhouse uphill to the west. The cut runs east beneath you; rainwater is gathering around its lower stones. You can still call for another adult before climbing down.',
      choices: [
        { id: 'descendAfterReply', label: 'Climb down carefully to the voice', hint: 'The bank is slick and water is rising; a slip could cause a hard fall.', timeCost: 5, chance: { probability: 0.68, bonusItems: FARM_LIGHTS, bonusProbability: 0.14, successNext: 'workerFound', failureNext: 'bankSlip', successMessage: 'You find firm footholds and reach the lower shelf.', failureMessage: 'The muddy bank slides under your boot; you strike a stone on the way down.', failureEffects: { health: -2 } } },
        { id: 'getOwnerFromVoice', label: 'Call uphill for {{farmOwner}}', timeCost: 5, next: 'helpArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'secureSheepFromVoice', label: 'Go back to secure the sheep first', timeCost: 6, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'leaveVoice', label: 'Leave the cut and return to the road', next: 'walkAwayEnding', effects: { historyFlags: ['left_farmhand_unsearched'] } },
      ],
    },
    bankSearch: {
      id: 'bankSearch', title: 'The North Bank', tone: 'danger',
      text: 'From firm ground below the oak, you see the rain cape snagged on a root and a loose sheep-gate rail lying partly in the cut. A faint scrape comes from behind it. The opposite bank is steeper; the farmhouse is uphill to the west. Water has begun to cover the lowest stones. You know someone may be down there, but not how badly they are hurt.',
      textVariants: [
        { requirements: { anyItems: FARM_LIGHTS }, text: 'Your light shows the north bank is firm beneath the oak. Below, a loose sheep-gate rail lies partly in the cut and a rain cape is caught on a root. A faint scrape comes from behind the rail. Water covers the lowest stones; the opposite bank is steeper.' },
        { requirements: { flags: ['adultHelperPresent'] }, text: 'You and {{farmOwner}} stand on firm ground below the oak. A loose sheep-gate rail lies partly in the cut, with a rain cape caught on a root. A faint scrape comes from behind the rail. Water covers the lowest stones, and the opposite bank is steep.' },
      ],
      choices: [
        { id: 'climbDownFromBank', label: 'Climb down to inspect the rail', hint: 'The mud is slick and water is rising; a fall could badly hurt you.', timeCost: 5, chance: { probability: 0.62, bonusItems: FARM_LIGHTS, bonusProbability: 0.16, successNext: 'workerFound', failureNext: 'bankSlip', successMessage: 'You find a stable route to the lower shelf.', failureMessage: 'The bank gives under your weight and you hit the lower stones.', failureEffects: { health: -2 } } },
        { id: 'ropeDownToRail', label: 'Anchor your rope at the oak and descend', requirements: { items: ['travelRope'] }, hint: 'The stout oak anchors a return line, but the wet bank can still shift.', timeCost: 4, chance: { probability: 0.82, bonusItems: ['heavyLeatherGloves', 'minerHeadlamp'], bonusProbability: 0.1, successNext: 'workerFound', failureNext: 'bankSlip', successMessage: 'The anchored line holds as you reach the shelf.', failureMessage: 'The bank slumps under the line and throws you against a stone.', failureEffects: { health: -2 } } },
        { id: 'callForAdult', label: 'Call uphill for another pair of hands', timeCost: 5, next: 'helpArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'leaveFromBank', label: 'Leave the cut and protect the household', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    bankSlip: {
      id: 'bankSlip', title: 'A Hard Fall', tone: 'danger',
      text: 'The wet bank gives way before you reach the lower shelf. You strike the stones and scramble back to firm ground with a bruised side. The rain cape and gate rail are still below; another solo descent would be a poor risk. The oak gives you a clear place to anchor a rope, and the farmhouse is uphill to the west.',
      choices: [
        { id: 'ropeAfterSlip', label: 'Use your rope from the oak', requirements: { items: ['travelRope'] }, timeCost: 4, next: 'workerFound', effects: { setFlags: ['usedRopeAtBank'] } },
        { id: 'callAfterSlip', label: 'Call uphill for help', timeCost: 4, next: 'helpArrives', effects: { historyFlags: ['left_for_help'] } },
        { id: 'stopAfterSlip', label: 'Stop the search and protect the sheep', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    looseHeifer: {
      id: 'looseHeifer', title: 'Hooves on the Road', tone: 'danger',
      text: 'The heifer has run west out of the low pasture and stopped near the road gate. It is frightened, not charging, but a passing wagon could startle it again. The drainage cut remains east of you, beyond the oak; the farmhouse is behind you to the west.',
      choices: [
        { id: 'guideHeiferBack', label: 'Guide the heifer toward the stable', hint: 'Move slowly; a sudden approach may send it into the road.', timeCost: 5, chance: { probability: 0.64, bonusItems: ['farmWhistle', 'trailWhistle', 'travelRope'], bonusProbability: 0.14, successNext: 'heiferReturned', failureNext: 'heiferLost', successMessage: 'The heifer turns from the road and walks toward the yard.', failureMessage: 'The heifer trots through the west gate and out of sight.', successEffects: { historyFlags: ['protected_livestock'], setFlags: ['heiferReturned'] }, failureEffects: { historyFlags: ['lost_farm_livestock'] } } },
        { id: 'letOwnerHandleHeifer', label: 'Call {{farmOwner}} to guide it back', timeCost: 5, next: 'heiferReturned', effects: { setFlags: ['heiferReturned'], historyFlags: ['protected_livestock'] } },
        { id: 'leaveHeiferAtRoad', label: 'Leave the heifer and continue east', timeCost: 4, next: 'bankSearch' },
      ],
    },
    heiferLost: {
      id: 'heiferLost', title: 'Beyond the West Gate', tone: 'warning',
      text: 'The heifer disappears along the road. No one is hurt, but it may take the farm some time to find it. The drainage cut is still east across the pasture; the sheep remain penned near the stable.',
      choices: [
        { id: 'continueAfterHeifer', label: 'Continue toward the drainage cut', timeCost: 4, next: 'bankSearch' },
        { id: 'stopAfterHeifer', label: 'Return to the household', next: 'livestockEnding' },
      ],
    },
    heiferReturned: {
      id: 'heiferReturned', title: 'Back Behind the Stable', tone: 'safe',
      text: 'The heifer follows the yard fence back to the stable. The sheep are penned and no animal is on the road. From the yard, the east pasture slopes down to the drainage cut; the farmhouse door remains behind you to the west.',
      choices: [
        { id: 'continueSearchAfterHeifer', label: 'Continue east to the drainage cut', timeCost: 4, next: 'bankSearch', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'endSearchAfterHeifer', label: 'Return to the household for the night', next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
      ],
    },
    helpArrives: {
      id: 'helpArrives', title: 'Two Adults at the Bank', tone: 'warning',
      text: '{{farmOwner}} joins you on the north bank with the farm lantern and the short iron gate bar from the stable rack. The child remains safely at the farmhouse. Together you can see the loose rail and the water rising around the lower stones. The bar is made for gate work, not for bearing a whole hillside; you will use it only to lift one end of the light rail.',
      choices: [
        { id: 'descendWithOwner', label: 'Descend together and inspect the rail', timeCost: 4, next: 'workerFound', effects: { setFlags: ['adultHelperPresent', 'hasFarmBar'] } },
        { id: 'secureAnimalsWithOwner', label: 'Have {{farmOwner}} secure the livestock', timeCost: 5, next: 'livestockEnding', effects: { historyFlags: ['protected_livestock'] } },
        { id: 'sendOwnerForHelp', label: 'Send {{farmOwner}} for a neighbor', timeCost: 12, next: 'delayedRescueEnding', effects: { historyFlags: ['left_for_help'] } },
      ],
    },
    workerFound: {
      id: 'workerFound', title: 'Beneath the Loose Rail', tone: 'danger',
      text: '{{farmhand}} is conscious on the lower shelf. A single light rail from the sheep gate pins a boot and trouser cuff; it has not crushed the leg. {{farmhand}} can pull free if the rail is raised a few inches. Water is running along the edge of the shelf, not yet over it. The detached rail is awkward, but not a beam or part of the bank. A stout oak stands on the north bank within reach of a rope. Keep the load controlled and do not pull the trapped leg.',
      textVariants: [
        { requirements: { items: ['foremanMultiTool'] }, text: '{{farmhand}} is conscious on the lower shelf. A single light gate rail pins a boot and trouser cuff. Your Foreman’s Multi-tool can turn the small hinge pin at the rail’s loose end; it is not strong or long enough to lever the rail up. Water is running along the shelf edge.' },
        { requirements: { flags: ['adultHelperPresent'] }, text: '{{farmhand}} is conscious on the lower shelf. A single light rail pins a boot and trouser cuff, not the leg. {{farmOwner}} is beside you; together you can lift its free end a few inches. Water runs along the shelf edge.' },
        { requirements: { anyItems: FARM_LIGHTS }, text: 'By your light, {{farmhand}} is clearly conscious on the lower shelf. A single light gate rail pins a boot and trouser cuff, not the leg itself. {{farmhand}} can pull free if it rises a few inches. Water runs along the shelf edge, not over it. The loose rail is awkward, not a structural beam.' },
      ],
      choices: [
        { id: 'liftRailWithFarmBar', label: 'Use the farm gate bar to raise one end', requirements: { flags: ['hasFarmBar'] }, hint: 'It is supplied for the farm work. Lift only the loose rail’s free end.', timeCost: 4, chance: { probability: 0.84, bonusFlags: ['adultHelperPresent'], bonusProbability: 0.1, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The gate bar lifts the loose rail just enough for {{farmhand}} to pull free.', failureMessage: 'The rail twists in the mud and settles back without striking {{farmhand}}.', failureEffects: { health: -1 } } },
        { id: 'liftRailTogether', label: 'Lift the loose rail with {{farmOwner}}', requirements: { flags: ['adultHelperPresent'] }, hint: 'The rail is light enough for two adults; lift only its free end.', timeCost: 4, chance: { probability: 0.82, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'You lift together while {{farmhand}} pulls the boot free.', failureMessage: 'The rail slips back into the mud; {{farmhand}} remains pinned but unhurt.', failureEffects: { health: -1 } } },
        { id: 'turnPinWithMultiTool', label: 'Remove the hinge pin and swing the rail clear', requirements: { items: ['foremanMultiTool'] }, hint: 'The folding driver loosens this small pin; it is not being used as a lever.', timeCost: 5, next: 'workerFreed', effects: { setFlags: ['multiToolReleasedRail'] } },
        { id: 'leverRailWithPryTool', label: 'Use your Folding Pry Tool under the rail', requirements: { items: ['foldingPryTool'], notItems: ['foremanMultiTool'] , usableItems: ['foldingPryTool']}, hint: 'Its short leverage can raise this loose rail a few inches; it cannot move the bank or a heavy beam.', timeCost: 4, chance: { probability: 0.78, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The short pry tool lifts the rail while {{farmhand}} pulls free.', failureMessage: 'The muddy rail slips off the short tool and settles back.', failureEffects: { health: -1 } } },
        { id: 'shiftRailWithHook', label: 'Draw the loose rail with your Rat-Catcher’s Hook', requirements: { items: ['ratCatchersHook'], usableItems: ['ratCatchersHook'], notItems: ['foremanMultiTool', 'foldingPryTool'] }, hint: 'The hook can pull the rail’s free end sideways; it cannot lift the trapped person.', timeCost: 5, chance: { probability: 0.68, bonusItems: FARM_LIGHTS, bonusProbability: 0.12, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The hooked end slides aside and {{farmhand}} frees the boot.', failureMessage: 'The hook slips from the wet rail, which settles back safely.', failureEffects: { health: -1 } } },
        { id: 'raiseRailWithRope', label: 'Loop your rope around the loose rail', requirements: { items: ['travelRope'], notItems: ['foremanMultiTool', 'foldingPryTool', 'ratCatchersHook'] }, hint: 'The oak on the north bank is a sound anchor; the line can pull the rail sideways, not lift the earth.', timeCost: 5, chance: { probability: 0.78, bonusItems: ['ironRopeClamp', 'freightmansStrap'], bonusProbability: 0.12, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The line around the oak draws the loose rail clear.', failureMessage: 'The wet knot slips and the rail settles back.', failureEffects: { health: -1 } } },
        { id: 'raiseRailWithBlockAndTackle', label: 'Anchor the pulley set at the oak', requirements: { items: ['compactBlockAndTackle'], notItems: ['foremanMultiTool', 'foldingPryTool', 'ratCatchersHook', 'travelRope'] }, hint: 'The small pulley set lifts only the loose gate rail, not the bank or the trapped person.', timeCost: 5, chance: { probability: 0.84, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The pulley takes the rail’s weight while {{farmhand}} slides free.', failureMessage: 'The wet line slips and the rail settles back.', failureEffects: { health: -1 } } },
        { id: 'steadyRailWithWedge', label: 'Set your steel wedge under the lifted rail', requirements: { items: ['steelWedge'], notItems: ['foremanMultiTool', 'foldingPryTool', 'ratCatchersHook', 'travelRope', 'compactBlockAndTackle'] , usableItems: ['steelWedge']}, hint: 'You can raise this light rail by hand, then wedge its free end before {{farmhand}} pulls clear.', timeCost: 5, chance: { probability: 0.78, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'The wedge holds the rail high enough for {{farmhand}} to free the boot.', failureMessage: 'The wedge skates across the wet wood and the rail settles back.', failureEffects: { health: -1 } } },
        { id: 'liftRailByHand', label: 'Raise the light rail by hand', requirements: { notFlags: ['adultHelperPresent'], notItems: OPTIONAL_RESCUE_GEAR }, hint: 'A single rail is manageable, but wet mud makes it easy to lose your grip.', timeCost: 5, chance: { probability: 0.66, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'workerFreed', failureNext: 'braceShifts', successMessage: 'You raise the loose end while {{farmhand}} slides free.', failureMessage: 'The rail slips from your grip; {{farmhand}} remains pinned, shaken but alert.', failureEffects: { health: -1 } } },
        { id: 'callForHelpAtWorker', label: 'Call uphill for another adult', requirements: { notFlags: ['adultHelperPresent'] }, timeCost: 5, next: 'helpAtWorker' },
      ],
    },
    braceShifts: {
      id: 'braceShifts', title: 'The Rail Slips Back', tone: 'danger',
      text: 'The rail settles back into the mud. {{farmhand}}’s boot is still pinned, but the leg is not crushed. The waterline has crept closer to the shelf. Your first attempt has not made the situation worse; another set of hands or a better-controlled pull would help.',
      choices: [
        { id: 'askOwnerAfterSlip', label: 'Call uphill for {{farmOwner}}', requirements: { notFlags: ['adultHelperPresent'] }, timeCost: 4, next: 'helpAtWorker' },
        { id: 'useRopeAfterSlip', label: 'Secure the rail with your rope', requirements: { items: ['travelRope'] }, timeCost: 4, next: 'workerFreed', effects: { setFlags: ['usedRopeAtBank'] } },
        { id: 'tryFarmBarAfterSlip', label: 'Use the farm gate bar with help', requirements: { flags: ['hasFarmBar', 'adultHelperPresent'] }, timeCost: 3, next: 'workerFreed' },
        { id: 'holdAndWait', label: 'Keep the rail steady until help arrives', requirements: { flags: ['adultHelperPresent'] }, timeCost: 6, next: 'delayedRescueEnding', effects: { historyFlags: ['stayed_with_injured_worker'] } },
      ],
    },
    helpAtWorker: {
      id: 'helpAtWorker', title: 'More Hands on the Bank', tone: 'warning',
      text: '{{farmOwner}} reaches the north bank carrying the stable’s short gate bar. The child stays at the house. You explain where the rail pins {{farmhand}}’s boot. The two of you can lift its free end while {{farmhand}} slides clear; the water is nearing the shelf, so there is little room for repeated attempts.',
      choices: [
        { id: 'liftWithOwnerAtWorker', label: 'Lift the rail together on a count', timeCost: 3, chance: { probability: 0.88, successNext: 'workerFreed', failureNext: 'delayedRescueEnding', successMessage: 'The two of you raise it evenly, and {{farmhand}} pulls free.', failureMessage: 'The rail shifts before the count is finished; you both let it settle safely and wait for more help.' } },
        { id: 'barWithOwnerAtWorker', label: 'Use the gate bar under the free end', timeCost: 3, chance: { probability: 0.92, successNext: 'workerFreed', failureNext: 'delayedRescueEnding', successMessage: 'The bar gives you a steady lift while {{farmhand}} slides clear.', failureMessage: 'The wet rail rolls off the bar; no one is struck, and you wait for more help.' } },
        { id: 'keepWaterWatch', label: 'Hold the rail and wait for more help', timeCost: 6, next: 'delayedRescueEnding', effects: { historyFlags: ['stayed_with_injured_worker'] } },
      ],
    },
    workerFreed: {
      id: 'workerFreed', title: 'Back on Firm Ground', tone: 'safe',
      text: '{{farmhand}} pulls free and sits on the north bank. With your support, they climb the slope to firm ground. The boot is muddy and the ankle sore, but it bears weight. A shallow scrape on one palm is the only open wound.',
      textVariants: [{ requirements: { flags: ['adultHelperPresent'] }, text: '{{farmhand}} pulls free and sits on the north bank. You and {{farmOwner}} support them up the slope to firm ground. The boot is muddy and the ankle sore, but it bears weight. A shallow scrape on one palm is the only open wound.' }],
      choices: [
        { id: 'takeWorkerHome', label: 'Walk {{farmhand}} back to the farmhouse', timeCost: 6, next: 'aftercare', effects: { historyFlags: ['rescued_missing_family_member'] } },
        { id: 'wrapWorkerScrape', label: 'Walk {{farmhand}} home and wrap the palm scrape', requirements: { items: ['fieldBandageRoll'] }, hint: 'It can cover the shallow palm scrape, not treat the sore ankle.', timeCost: 8, next: 'aftercare', effects: { loseItems: ['fieldBandageRoll'], setFlags: ['scrapeWrapped'], historyFlags: ['rescued_missing_family_member'] } },
      ],
    },
    aftercare: {
      id: 'aftercare', title: 'Supper Kept Warm', tone: 'safe',
      text: 'At the farmhouse, {{farmhand}} rests by the stove while {{farmOwner}} checks the ankle and cleans the small scrape. The foot was not crushed; it will need rest, not a miracle cure. The child is safe inside. The family can repair the gate in daylight.',
      textVariants: [
        { requirements: { flags: ['heiferLoose'] }, text: 'At the farmhouse, {{farmhand}} rests by the stove while {{farmOwner}} checks the ankle and cleans the small scrape. The foot was not crushed; it will need rest. The child and sheep are safe, but the heifer ran toward the west road and has not been found.' },
        { requirements: { flags: ['heiferReturned'] }, text: 'At the farmhouse, {{farmhand}} rests by the stove while {{farmOwner}} checks the ankle and cleans the small scrape. The foot was not crushed; it will need rest. The child, sheep, and heifer are all back at the farm.' },
        { requirements: { flags: ['scrapeWrapped'] }, text: 'At the farmhouse, {{farmhand}} rests by the stove with the shallow palm scrape cleanly wrapped. The ankle is sore but bears weight; the bandage did not treat it. The child is safe, and the rain makes another search for the loose heifer a poor choice tonight.' },
      ],
      choices: [
        { id: 'acceptFarmReward', label: 'Accept one practical thank-you', timeCost: 2, next: 'rewardOffer', effects: { historyFlags: ['rescued_missing_family_member'] } },
        { id: 'declineFarmReward', label: 'Thank the family and leave', next: 'safeEnding', effects: { historyFlags: ['rescued_missing_family_member'] } },
      ],
    },
    rewardOffer: {
      id: 'rewardOffer', title: 'A Quiet Thank-You', tone: 'safe',
      text: 'The family offers a choice of practical thanks: a clear farm whistle or a stout gate hook. Neither changes what happened tonight. Both are useful on the road, and you may take only one.',
      choices: [
        { id: 'acceptFarmWhistle', label: 'Take the farm whistle', requirements: { notItems: ['farmWhistle'] }, effects: { gainItems: ['farmWhistle'] }, next: 'safeEnding' },
        { id: 'acceptGateHook', label: 'Take the gate hook', requirements: { notItems: ['gateHook'] }, effects: { gainItems: ['gateHook'] }, next: 'safeEnding' },
        { id: 'declineFarmReward', label: 'Decline the extra reward', next: 'safeEnding' },
      ],
    },
    delayedRescueEnding: {
      id: 'delayedRescueEnding', title: 'A Long Wait in the Rain', tone: 'warning', ending: 'success',
      text: 'The loose rail is kept steady while help is fetched from the neighboring farm. {{farmhand}} is cold and frightened, but conscious. The rain is still falling; the family has chosen a careful rescue over another rushed lift.',
      choices: [],
    },
    safeEnding: {
      id: 'safeEnding', title: 'The House Speaks Again', tone: 'safe', ending: 'success',
      text: '{{farmhand}} rests by the stove with the family nearby. The sheep are penned and the child is safe. The gate needs a proper repair in daylight, but the missing worker is home. The family remembers that you had a choice about staying.',
      textVariants: [
        { requirements: { flags: ['heiferLoose'] }, text: '{{farmhand}} rests by the stove with the family nearby. The sheep are penned and the child is safe, but the heifer ran toward the west road and has not been found. The family remembers that you brought their worker home.' },
        { requirements: { flags: ['heiferReturned'] }, text: '{{farmhand}} rests by the stove with the family nearby. The sheep and heifer are back at the farm, and the child is safe. The gate needs a proper repair in daylight. The family remembers that you had a choice about staying.' },
      ],
      choices: [],
    },
    livestockEnding: {
      id: 'livestockEnding', title: 'A Pen Secured for the Night', tone: 'safe', ending: 'success',
      text: 'The sheep are behind the closed pen gate, and the household stays together at the farmhouse. {{farmhand}} remains missing in the rain. The family will search again at first light; you do not learn what happened after you left the yard.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Keeps Moving', tone: 'safe', ending: 'success',
      text: 'You take the west road away from the farmhouse. Rain softens the prints behind you. You do not know whether {{farmhand}} returns or what the family does next.',
      choices: [],
    },
    // Active pre-rewrite saves are moved here without losing health, inventory, flags, discoveries, or time.
    legacyResume: {
      id: 'legacyResume', title: 'A Search Already Underway', tone: 'warning',
      text: 'Your earlier search is preserved: the same people, equipment, discoveries, and elapsed story time remain. The new account begins from the farm’s north pasture, with the drainage cut east of the sheep pen and the farmhouse uphill to the west.',
      choices: [
        { id: 'legacyContinueSearch', label: 'Continue toward the drainage cut', timeCost: 2, next: 'bankSearch' },
        { id: 'legacyCallOwner', label: 'Call uphill for the farm owner', timeCost: 3, next: 'helpArrives' },
        { id: 'legacyLeave', label: 'Leave the search for daylight', next: 'livestockEnding' },
      ],
    },
    legacyRescue: {
      id: 'legacyRescue', title: 'The Rescue Resumes', tone: 'warning',
      text: 'Your saved search had already reached {{farmhand}} at the fallen gate rail. That discovery and your earlier choices remain part of this character’s account. The rail still pins a boot, the leg is not crushed, and water is approaching the shelf.',
      choices: [
        { id: 'legacyLiftRail', label: 'Continue the careful lift', timeCost: 1, next: 'workerFreed' },
        { id: 'legacyGetHelp', label: 'Call uphill for another adult', timeCost: 3, next: 'helpAtWorker' },
        { id: 'legacyWaitForRescue', label: 'Keep the rail steady for trained help', timeCost: 1, next: 'delayedRescueEnding' },
      ],
    },
    legacyAfterRescue: {
      id: 'legacyAfterRescue', title: 'The Search’s Aftermath', tone: 'safe',
      text: 'Your saved choices already brought {{farmhand}} clear of the fallen gate rail. Character, equipment, discoveries, and story time are intact. The household is together, though the sheep pen still needs its daylight repair.',
      choices: [
        { id: 'legacyTakeWhistle', label: 'Take the farm whistle', requirements: { notItems: ['farmWhistle'] }, effects: { gainItems: ['farmWhistle'] }, next: 'safeEnding' },
        { id: 'legacyTakeHook', label: 'Take the gate hook', requirements: { notItems: ['gateHook'] }, effects: { gainItems: ['gateHook'] }, next: 'safeEnding' },
        { id: 'legacyLeaveThanks', label: 'Thank the family and leave', next: 'safeEnding' },
      ],
    },
  },
};
