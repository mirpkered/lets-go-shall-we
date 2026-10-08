import type { Scenario } from '../types';

const PATCH_TOOLS = ['pocketToolkit', 'foremanMultiTool'];
const SEAM_TOOLS = [...PATCH_TOOLS, 'foldingPryTool', 'ironRopeClamp'];
const WATERPROOF_PATCHES = ['waxedCanvasSheet'];
const STRAP_PATCHES = ['freightmansStrap'];
const WHISTLES = ['trailWhistle', 'conductorWhistle', 'farmWhistle'];

export const TAKING_ON_WATER: Scenario = {
  id: 'taking-on-water',
  title: 'Taking on Water',
  subtitle: 'A distant shore, a quiet leak, and more to save than time allows.',
  startScene: 'dampBoot',
  timePhases: [
    { id: 'seeping', label: 'A Slow Seep', atMinutes: 0 },
    { id: 'accumulating', label: 'Water Under the Gear', atMinutes: 9 },
    { id: 'ridingLow', label: 'Riding Low', atMinutes: 20 },
    { id: 'swamping', label: 'Taking on Water', atMinutes: 32 },
    { id: 'critical', label: 'The Shore Is Close', atMinutes: 44 },
  ],
  runRandomSelections: [
    { id: 'lakeCondition', values: [{ value: 'calm', weight: 45 }, { value: 'breezy', weight: 35 }, { value: 'coolWater', weight: 20 }] },
  ],
  scenes: {
    dampBoot: {
      id: 'dampBoot', title: 'A Damp Boot', tone: 'safe',
      text: 'You are alone in your canoe, well out on a broad lake. The nearest shore is visible, but a long paddle away. The water is manageable and the canoe has felt steady all morning.\n\nOne boot is damp. A little lake water may have come over the side; the food sack, bedroll, and cooking tin are packed around your feet.',
      textVariants: [{ requirements: { selections: { lakeCondition: 'breezy' } }, text: 'You are alone in your canoe, well out on a broad lake. The nearest shore is visible, but a long paddle away. A light breeze wrinkles the manageable water.\n\nOne boot is damp. A little lake water may have come over the side; the food sack, bedroll, and cooking tin are packed around your feet.' }, { requirements: { selections: { lakeCondition: 'coolWater' } }, text: 'You are alone in your canoe, well out on a broad lake. The nearest shore is visible, but a long paddle away. The water is manageable, though cool enough to make a swim unpleasant.\n\nOne boot is damp. A little lake water may have come over the side; the food sack, bedroll, and cooking tin are packed around your feet.' }, { requirements: { selections: { lakeCondition: 'calm' } }, text: 'You are alone in your canoe, well out on a broad lake. The nearest shore is visible, but a long paddle away. The lake lies almost flat, and the canoe has felt steady all morning.\n\nOne boot is damp. A little lake water may have come over the side; the food sack, bedroll, and cooking tin are packed around your feet.' }],
      choices: [
        { id: 'lookAtWater', label: 'Look where the water came from', timeCost: 3, next: 'waterMoved' },
        { id: 'checkLooseGear', label: 'Check the shifting gear', timeCost: 3, next: 'wetGear' },
        { id: 'paddleEarly', label: 'Turn toward shore and keep paddling', hint: 'The bank is visible, but not close.', timeCost: 12, next: 'directPaddle' },
      ],
    },
    waterMoved: {
      id: 'waterMoved', title: 'A Shallow Wash', tone: 'warning',
      text: 'A thin wash moves between the floor ribs when the canoe rocks. It could still be splash water, but it gathers instead of running back out. The shore has not moved any closer.',
      textVariants: [{ requirements: { minElapsedMinutes: 9 }, text: 'The wash returns with every small roll. A narrow line of water creeps along one floor rib while the shore remains a long paddle away.' }],
      choices: [
        { id: 'inspectSeamEarly', label: 'Trace the water along the hull', hint: 'You may find where the steady trickle begins.', timeCost: 4, next: 'seamFound' },
        { id: 'bailWithCollapsiblePail', label: 'Use your Collapsible Water Pail to bail once', hint: 'It can move water faster than a cooking tin, but it will not stop the leak.', requirements: { items: ['collapsibleWaterPail'] , usableItems: ['collapsibleWaterPail']}, timeCost: 2, effects: { setFlags: ['bailedOnce', 'leakSeen', 'usedCollapsiblePail'] }, next: 'bailFollowup' },
        { id: 'bailWithFoldingBailer', label: 'Use your Folding Bailer to clear the shallow water', hint: 'It clears water faster than a cup, but the hull still needs inspection.', requirements: { items: ['foldingBailer'] , usableItems: ['foldingBailer']}, timeCost: 2, effects: { setFlags: ['bailedOnce', 'leakSeen', 'usedFoldingBailer'] }, next: 'bailFollowup' },
        { id: 'bailFirst', label: 'Bail the water once', hint: 'This will steady the canoe for a while, not stop the source.', timeCost: 4, effects: { setFlags: ['bailedOnce', 'leakSeen'] }, next: 'bailFollowup' },
        { id: 'keepPaddlingFromWash', label: 'Paddle toward shore', timeCost: 12, next: 'directPaddle' },
      ],
    },
    wetGear: {
      id: 'wetGear', title: 'The Bag Has Shifted', tone: 'warning',
      text: 'The food sack has slid in a shallow wash. Its bottom is wet, and your coin purse sits in an outer pocket that is beginning to soak through. The bedroll and cooking tin are ordinary supplies; nothing has gone overboard.',
      choices: [
        { id: 'secureMoneyEarly', label: 'Move your coins into an inner pocket', hint: 'A short delay protects your money from the spreading water.', requirements: { minMoney: 1 }, timeCost: 2, effects: { setFlags: ['moneySecured'] }, next: 'moneyPacked' },
        { id: 'followWaterFromBag', label: 'Follow the wash toward its source', timeCost: 4, next: 'seamFound' },
        { id: 'paddleFromGear', label: 'Leave the gear and paddle for shore', timeCost: 12, next: 'directPaddle' },
      ],
    },
    directPaddle: {
      id: 'directPaddle', title: 'The Canoe Rides Heavier', tone: 'warning',
      text: 'Several strokes bring the shoreline nearer, but the canoe answers more slowly. Water slides around the floor ribs with each pull; this is more than splash. It has been entering for a while, and the seam is opening as the hull flexes.',
      textVariants: [
        { requirements: { selections: { lakeCondition: 'breezy' }, minElapsedMinutes: 32 }, text: 'The breeze drives small waves across the low side. Water enters faster; the canoe sits low, and a small wave comes over the edge. The near shore is closer, but you cannot spend much longer here.' },
        { requirements: { selections: { lakeCondition: 'coolWater' }, minElapsedMinutes: 32 }, text: 'The canoe sits low. Water pulses through the opened seam, and a small wave comes over the side. The visible shore is closer, but still a hard paddle through cold water.' },
        { requirements: { selections: { lakeCondition: 'coolWater' }, minElapsedMinutes: 20 }, text: 'The canoe rides lower and answers slowly. Water slides around the floor ribs with each pull; the seam has been leaking for a while and is opening as the hull flexes. The visible shore is still a long paddle away, and the water is cold.' },
        { requirements: { minElapsedMinutes: 32 }, text: 'The canoe sits low. Each stroke pushes water around the gear, and a small wave laps over the near side. The seam is opening faster as the hull flexes. The nearest shore is closer now, but you cannot spend much longer here.' },
      ],
      choices: [
        { id: 'inspectSeamAfterPaddle', label: 'Find the leak before it grows', hint: 'The water is clearly coming through the hull.', timeCost: 3, next: 'seamFound' },
        { id: 'paddleOnFromDirect', label: 'Keep the bow pointed at shore', hint: 'A direct crossing is still possible; the canoe is getting heavier.', timeCost: 14, chance: { probability: 0.9, lateProbability: 0.66, lateAfterMinutes: 32, bonusFlags: ['patchStrong', 'patchHeld', 'cargoLightened'], bonusSelections: { lakeCondition: 'calm' }, penaltySelections: { lakeCondition: 'breezy' }, bonusProbability: 0.08, penaltyProbability: 0.05, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'The bank comes within reach before the canoe settles any lower.', failureMessage: 'A wave washes across the low side. You are near shore, but the canoe swamps before you can beach it.' } },
        { id: 'signalFromDirectPaddle', label: 'Look for someone who can see you', timeCost: 2, effects: { setFlags: ['seenSkiff'] }, next: 'signalView' },
      ],
    },
    seamFound: {
      id: 'seamFound', title: 'The Loose Seam', tone: 'warning',
      text: 'You find a loosened seam where the canoe scraped submerged branches earlier. The hull flexed over the debris and opened one small gap; water has been seeping in ever since. The split is still narrow, but every minute of flexing widens it.',
      textVariants: [
        { requirements: { items: ['waxedCanvasSheet'] }, text: 'The loosened seam is small but steadily widening. Your Waxed Canvas Sheet can cover it without cutting or consuming the sheet; the shore remains a long paddle away.' },
        { requirements: { items: ['dealerCardKnife'] }, text: 'The loosened seam is small but steadily widening. Your Dealer’s Card Knife can trim your spare shirt into a cleaner-fitting patch; the knife itself will not be sacrificed.' },
        { requirements: { items: ['heavyLeatherGloves'] }, text: 'The loosened seam is small but steadily widening. Your Heavy Leather Gloves can protect your hands from the splintered edge while you press cloth into it.' },
        { requirements: { minElapsedMinutes: 32 }, text: 'You find the loosened seam where the canoe scraped submerged branches earlier. The split has widened; water pulses through whenever the hull flexes. The canoe rides low, and the shore is now the urgent problem.' },
      ],
      choices: [
        { id: 'patchWithWaxedCanvas', label: 'Cover the seam with waxed canvas', hint: 'The sheet sheds water and buys useful time; it will not make a permanent repair.', requirements: { items: WATERPROOF_PATCHES }, timeCost: 5, effects: { setFlags: ['patchStrong', 'leakSeen'] }, next: 'patchResult' },
        { id: 'cinchWithFreightmansStrap', label: 'Cinch cloth over the seam with your strap', hint: 'Use ordinary clothing under the broad strap; the strap stays intact.', requirements: { items: STRAP_PATCHES, notItems: WATERPROOF_PATCHES }, timeCost: 7, effects: { setFlags: ['patchHeld', 'leakSeen'] }, next: 'patchResult' },
        { id: 'tightenSeamFastener', label: 'Use your tool to work the seam fitting', hint: 'A toolkit, multi-tool, pry tool, or clamp can help steady the loosened fitting.', requirements: { anyItems: SEAM_TOOLS, notItems: [...WATERPROOF_PATCHES, ...STRAP_PATCHES] }, timeCost: 2, next: 'toolPatch' },
        { id: 'improviseClothPatch', label: 'Press spare cloth into the gap', hint: 'A crude patch is possible with your spare shirt, but it may slip.', requirements: { notItems: [...WATERPROOF_PATCHES, ...STRAP_PATCHES, ...SEAM_TOOLS] }, timeCost: 8, chance: { probability: 0.64, bonusItems: ['heavyLeatherGloves', 'dealerCardKnife'], bonusProbability: 0.18, successNext: 'patchResult', failureNext: 'patchSetback', successMessage: 'The cloth holds against the seam. It slows the leak, though water still works around its edge.', failureMessage: 'The cloth slips from the wet gap and the seam opens a little farther.', successEffects: { setFlags: ['patchCrude', 'leakSeen'], historyFlags: ['patched_canoe_with_improvised_material'] }, failureEffects: { health: -1, setFlags: ['leakWorsened', 'leakSeen'] } } },
        { id: 'goToPreparation', label: 'Secure what matters before choosing', timeCost: 3, next: 'gearPrep' },
        { id: 'paddleFromSeam', label: 'Stop working and head for shore', hint: 'The leak is real; every extra task costs crossing time.', timeCost: 2, next: 'shoreApproach' },
      ],
    },
    bailFollowup: {
      id: 'bailFollowup', title: 'A Briefly Lighter Canoe', tone: 'warning',
      text: 'The floor is clearer and the canoe steadier. A thin trickle is already returning. Bailing bought a little time but did not close the leak; now you know the water is coming from inside the hull.',
      textVariants: [{ requirements: { minElapsedMinutes: 32 }, text: 'The water returns almost as fast as you scoop it out. The canoe still rides low; another round of bailing will help only briefly, while the shore remains the surest way out.' }],
      choices: [
        { id: 'inspectAfterBail', label: 'Find the seam while the floor is clear', timeCost: 3, next: 'seamFound' },
        { id: 'prepareAfterBail', label: 'Secure money and carried gear', timeCost: 2, next: 'gearPrep' },
        { id: 'paddleAfterBail', label: 'Use the steadier canoe to paddle for shore', timeCost: 10, chance: { probability: 0.92, lateProbability: 0.7, lateAfterMinutes: 32, bonusFlags: ['cargoLightened'], bonusProbability: 0.06, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'The temporary stability is enough to reach the bank.', failureMessage: 'The seam keeps leaking; the canoe settles before you can beach it.' } },
        { id: 'bailAgain', label: 'Bail once more, knowing it will not last', hint: 'The second round takes longer and buys less time.', timeCost: 6, effects: { setFlags: ['bailedTwice'] }, next: 'lateBail' },
      ],
    },
    lateBail: {
      id: 'lateBail', title: 'Water Returns', tone: 'danger',
      text: 'The second bailing clears some water, but the seam is wider and the canoe sits low again. You cannot keep repeating this. The near shore is visible through the chop.',
      choices: [
        { id: 'lateBailPaddle', label: 'Paddle for the visible shore now', timeCost: 8, chance: { probability: 0.78, lateProbability: 0.58, lateAfterMinutes: 32, bonusFlags: ['patchStrong', 'patchHeld', 'cargoLightened'], bonusProbability: 0.08, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'You reach the shore before the canoe fills further.', failureMessage: 'The canoe swamps within sight of shore.' } },
        { id: 'lateBailSwim', label: 'Abandon the canoe and swim', timeCost: 2, next: 'swimDecision' },
      ],
    },
    toolPatch: {
      id: 'toolPatch', title: 'Working the Fitting', tone: 'warning',
      text: 'The seam has a small brass fitting beside an interior rib. Your carried tool can help, but forcing the wood will make the split worse.',
      textVariants: [
        { requirements: { items: ['pocketToolkit'] }, text: 'Your Pocket Toolkit’s narrow pliers can squeeze the loosened brass fitting snug without levering against the wood.' },
        { requirements: { items: ['foremanMultiTool'] }, text: 'The Foreman’s Multi-tool has a folding driver that can turn the small brass fitting without prying the hull.' },
        { requirements: { items: ['foldingPryTool'] }, text: 'Your Folding Pry Tool can ease the interior rib into line; too much leverage may widen the split.' },
        { requirements: { items: ['ironRopeClamp'] }, text: 'Your Iron Rope Clamp can press a cloth patch against the inner rib beside the seam; the curved hull keeps it from sealing the fitting alone.' },
      ],
      choices: [
        { id: 'tightenWithToolkit', label: 'Squeeze the fitting snug with your toolkit pliers', requirements: { items: ['pocketToolkit'] }, timeCost: 3, effects: { setFlags: ['patchStrong', 'leakSeen'] }, next: 'patchResult' },
        { id: 'tightenWithMultiTool', label: 'Turn the fitting with your multi-tool driver', requirements: { items: ['foremanMultiTool'] }, timeCost: 4, effects: { setFlags: ['patchStrong', 'leakSeen'] }, next: 'patchResult' },
        { id: 'alignWithPryTool', label: 'Ease the rib into line with your pry tool', hint: 'Leverage may align it, but forcing it could widen the split.', requirements: { items: ['foldingPryTool'] }, timeCost: 4, chance: { probability: 0.68, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'patchResult', failureNext: 'patchSetback', successMessage: 'You ease the rib into line and hold spare cloth against the gap.', failureMessage: 'The hull flexes under the leverage and the seam opens wider.', successEffects: { setFlags: ['patchHeld', 'leakSeen'] }, failureEffects: { health: -1, setFlags: ['leakWorsened', 'leakSeen'] } } },
        { id: 'clampClothToRib', label: 'Clamp cloth against the inner rib', hint: 'The clamp holds a patch in place, not the hull itself.', requirements: { items: ['ironRopeClamp'] }, timeCost: 3, effects: { setFlags: ['patchHeld', 'leakSeen', 'clampPatch'] }, next: 'patchResult' },
      ],
    },
    patchResult: {
      id: 'patchResult', title: 'A Temporary Hold', tone: 'warning',
      text: 'The patch slows the seep; it cannot make this hull sound again. You still have a distance to paddle, and any time spent here has let the canoe ride lower.',
      textVariants: [
        { requirements: { flags: ['patchStrong'] }, text: 'The waxed cover or tightened fitting slows the seep substantially, but flexing can loosen it again. You still have a distance to paddle.' },
        { requirements: { flags: ['woolBlanketWet'] }, text: 'The soaked wool holds for now. It has lost its warmth until dried, and it cannot make the hull sound again. You still have a distance to paddle.' },
        { requirements: { flags: ['knifePatch'] }, text: 'The fitted cloth cut with your card knife slows the seep. The knife remains yours; the hull still needs to reach shore.' },
      ],
      choices: [
        { id: 'patchSecureBelongings', label: 'Secure money and carried gear before moving', timeCost: 3, next: 'gearPrep' },
        { id: 'patchPaddleForShore', label: 'Take the slower leak and paddle now', timeCost: 10, chance: { probability: 0.92, lateProbability: 0.75, lateAfterMinutes: 32, bonusFlags: ['patchStrong', 'patchHeld'], bonusProbability: 0.06, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'The patch buys just enough time to reach land.', failureMessage: 'A wave lifts the canoe and water slips around the patch before you reach shore.' } },
        { id: 'patchThrowCargo', label: 'Throw food and cooking gear overboard', hint: 'The lighter canoe will paddle more easily; these ordinary supplies are lost.', timeCost: 2, effects: { setFlags: ['cargoLightened'], historyFlags: ['sacrificed_property_for_safety'] }, next: 'lighterCanoe' },
      ],
    },
    patchSetback: {
      id: 'patchSetback', title: 'The Seam Opens Further', tone: 'danger',
      text: 'The repair attempt did not hold. Water now pulses through the loosened seam and runs around the gear. Nothing has been lost yet, but the canoe rides lower and the shore is still a real distance away.',
      choices: [
        { id: 'setbackPaddle', label: 'Paddle for shore while the canoe still floats', hint: 'The leak is worse; continuing the repair is no longer wise.', timeCost: 8, chance: { probability: 0.76, lateProbability: 0.52, lateAfterMinutes: 32, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'You reach the near shore in the low canoe.', failureMessage: 'The canoe swamps before you can beach it.' } },
        { id: 'setbackSwim', label: 'Leave the canoe and swim for shore', timeCost: 2, next: 'swimDecision' },
        { id: 'setbackPrepare', label: 'Secure one last important possession', timeCost: 2, next: 'gearPrep' },
      ],
    },
    gearPrep: {
      id: 'gearPrep', title: 'What Can You Keep Dry?', tone: 'warning',
      text: 'Your coin purse and carried gear can be tucked under clothing or wrapped before the canoe swamps, but it costs a few minutes. The food, bedroll, and cooking tin are ordinary cargo. The lake keeps working at the seam while you decide.',
      textVariants: [{ requirements: { items: ['weatherproofBlanket'] }, text: 'Your weatherproof blanket can wrap your purse and carried gear without being cut or lost. The food, bedroll, and cooking tin are ordinary cargo. The lake keeps working at the seam while you decide.' }, { requirements: { items: ['travelRope'] }, text: 'Your travel rope can lash carried gear together or tether the canoe near shore; it is not a patch and cannot shorten the distance. The lake keeps working at the seam while you decide.' }],
      choices: [
        { id: 'secureAllGear', label: 'Bundle money and carried gear securely', hint: 'Tuck them inside clothing; this costs time but protects them if you swim.', requirements: { notItems: ['weatherproofBlanket', 'travelRope'] }, timeCost: 3, effects: { setFlags: ['moneySecured', 'carriedItemSecured', 'protected_carried_item_from_water'] }, next: 'gearSecured' },
        { id: 'secureWithTravelRope', label: 'Tie money and gear into one bundle', hint: 'The rope keeps loose possessions together if you swim; it does not seal the hull.', requirements: { items: ['travelRope'] }, timeCost: 3, effects: { setFlags: ['moneySecured', 'carriedItemSecured', 'protected_carried_item_from_water'] }, next: 'gearSecured' },
        { id: 'secureWithWeatherproofBlanket', label: 'Wrap money and gear in your weatherproof blanket', hint: 'The blanket stays intact and keeps the bundle drier if you swim.', requirements: { items: ['weatherproofBlanket'] , usableItems: ['weatherproofBlanket']}, timeCost: 3, effects: { setFlags: ['moneySecured', 'carriedItemSecured', 'protected_carried_item_from_water', 'blanketWrapped'] }, next: 'gearSecured' },
        { id: 'throwOrdinaryCargo', label: 'Discard the food and cooking gear', hint: 'The bedroll and food are ordinary supplies; this lightens the canoe.', timeCost: 2, effects: { setFlags: ['cargoLightened'], historyFlags: ['sacrificed_property_for_safety'] }, next: 'lighterCanoe' },
        { id: 'keepCanoeMoving', label: 'Stop preparing and paddle for shore', timeCost: 2, next: 'shoreApproach' },
        { id: 'prepareToSwim', label: 'Abandon the canoe and prepare to swim', hint: 'Unless secured, money and carried gear may be lost if left aboard.', timeCost: 1, next: 'swimDecision' },
      ],
    },
    moneyPacked: {
      id: 'moneyPacked', title: 'Coins Out of the Water', tone: 'warning',
      text: 'You move your coins into a buttoned inner pocket. The purse is safe from the water in the canoe, though the leak continues and the shore is still distant.',
      choices: [
        { id: 'moneyPaddle', label: 'Paddle for shore', timeCost: 2, next: 'shoreApproach' },
        { id: 'moneyInspect', label: 'Find the leak before it grows', timeCost: 2, next: 'seamFound' },
        { id: 'moneyDiscard', label: 'Throw ordinary food and gear overboard', timeCost: 2, effects: { setFlags: ['cargoLightened'], historyFlags: ['sacrificed_property_for_safety'] }, next: 'lighterCanoe' },
      ],
    },
    gearSecured: {
      id: 'gearSecured', title: 'A Small Bundle, Kept Close', tone: 'warning',
      text: 'You secure money and carried gear against your body. If you enter the water, the bundle can stay with you; the effort has not helped the canoe itself.',
      choices: [
        { id: 'gearPaddle', label: 'Paddle for shore now', timeCost: 2, next: 'shoreApproach' },
        { id: 'gearLighten', label: 'Discard food and cooking gear too', timeCost: 2, effects: { setFlags: ['cargoLightened'], historyFlags: ['sacrificed_property_for_safety'] }, next: 'lighterCanoe' },
        { id: 'gearSignal', label: 'Look for someone who can help', timeCost: 2, effects: { setFlags: ['seenSkiff'] }, next: 'signalView' },
      ],
    },
    lighterCanoe: {
      id: 'lighterCanoe', title: 'Less to Carry', tone: 'warning',
      text: 'The food and cooking tin are gone. The canoe rides a little higher, and your possessions remain with you. Water still enters through the seam; the nearest shore is visible ahead.',
      choices: [
        { id: 'lighterPaddle', label: 'Paddle steadily for shore', timeCost: 9, chance: { probability: 0.92, lateProbability: 0.72, lateAfterMinutes: 32, bonusFlags: ['patchStrong', 'patchHeld'], bonusProbability: 0.06, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'The lighter canoe reaches the bank.', failureMessage: 'The seam widens before the lighter canoe can reach shore.' } },
        { id: 'lighterSignal', label: 'Look for a boat or figure to signal', timeCost: 2, effects: { setFlags: ['seenSkiff'] }, next: 'signalView' },
        { id: 'lighterSwim', label: 'Leave the canoe and swim for shore', timeCost: 2, next: 'swimDecision' },
      ],
    },
    shoreApproach: {
      id: 'shoreApproach', title: 'The Near Shore', tone: 'danger',
      text: 'The near shore is plainly reachable, but not yet close enough to step out. The canoe is heavy with water. If you spend more time securing every possession, the seam may swamp it before you arrive.',
      textVariants: [
        { requirements: { flags: ['patchStrong'] }, text: 'Your patch is still holding, though the canoe sits low. The near shore is reachable with a steady paddle; more delay could undo the repair.' },
        { requirements: { selections: { lakeCondition: 'breezy' } }, text: 'Small waves now splash over the low side. The near shore is reachable, but another long delay could swamp the canoe before you arrive.' },
      ],
      choices: [
        { id: 'paddleLastLeg', label: 'Paddle the last stretch to shore', hint: 'The canoe is low, but reaching land is still possible.', timeCost: 9, chance: { probability: 0.88, lateProbability: 0.62, lateAfterMinutes: 32, bonusFlags: ['patchStrong', 'patchHeld', 'cargoLightened'], bonusProbability: 0.08, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'You bring the canoe into the shallows and step onto firm ground.', failureMessage: 'A small wave comes over the side. The canoe swamps, but the shore is within a hard swim.' } },
        { id: 'signalShore', label: 'Search the far shore for help', timeCost: 2, effects: { setFlags: ['seenSkiff'] }, next: 'signalView' },
        { id: 'swimFromShoreApproach', label: 'Leave the canoe and swim the remaining distance', hint: 'The water is cold and the distance will be tiring, but shore is reachable.', timeCost: 2, next: 'swimDecision' },
      ],
    },
    signalView: {
      id: 'signalView', title: 'A Moving Speck', tone: 'warning',
      text: 'Near the far shore, a small fishing skiff moves between the reeds. It is too distant to hear a normal shout. You can try a carried signal or wave the paddle; a response is possible, not certain.',
      choices: [
        { id: 'signalMirror', label: 'Flash your roadside signal mirror', hint: 'Daylight glints clearly across the open water.', requirements: { items: ['roadsideSignalMirror'] , usableItems: ['roadsideSignalMirror']}, timeCost: 3, chance: { probability: 0.9, successNext: 'rescueResponse', failureNext: 'signalNoResponse', successMessage: 'The fisherman sees the flashes and turns the skiff toward you.', failureMessage: 'The glare breaks across the chop; the skiff keeps moving for now.' } },
        { id: 'signalWhistle', label: 'Blow your whistle across the lake', requirements: { anyItems: WHISTLES }, timeCost: 3, chance: { probability: 0.72, bonusItems: ['conductorWhistle'], bonusProbability: 0.14, successNext: 'rescueResponse', failureNext: 'signalNoResponse', successMessage: 'The skiff turns toward the clear whistle.', failureMessage: 'The breeze carries the sound away; the skiff does not turn.' } },
        { id: 'waveForHelp', label: 'Wave the paddle and shout', hint: 'You may be seen, but distance and wind make it uncertain.', timeCost: 3, chance: { probability: 0.48, bonusSelections: { lakeCondition: 'calm' }, penaltySelections: { lakeCondition: 'breezy' }, bonusProbability: 0.12, penaltyProbability: 0.08, successNext: 'rescueResponse', failureNext: 'signalNoResponse', successMessage: 'The fisherman spots your movement and rows toward you.', failureMessage: 'The skiff passes behind the reeds without noticing.' } },
        { id: 'skipSignal', label: 'Turn toward the closest stretch of bank', timeCost: 1, next: 'signalReturn' },
      ],
    },
    signalReturn: {
      id: 'signalReturn', title: 'Back to the Near Shore', tone: 'danger',
      text: 'No one answered. The nearest bank remains visible, but the canoe has settled lower while you tried. You cannot safely circle back to the same stretch of water; choose the closest landing or swim the final distance.',
      choices: [
        { id: 'paddleAfterSignal', label: 'Paddle for the nearest landing', timeCost: 7, chance: { probability: 0.76, lateProbability: 0.54, lateAfterMinutes: 32, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'You reach the shallow edge before the canoe fills.', failureMessage: 'The seam widens and the canoe swamps within sight of land.' } },
        { id: 'swimAfterSignal', label: 'Leave the canoe and swim for shore', timeCost: 2, next: 'swimDecision' },
      ],
    },
    signalNoResponse: {
      id: 'signalNoResponse', title: 'No Answer Yet', tone: 'danger',
      text: 'The skiff does not respond. You have not lost anything, but the canoe has settled lower while you signaled. The near shore is still a hard paddle away; waiting for another chance is riskier.',
      choices: [
        { id: 'paddleAfterNoSignal', label: 'Paddle for the nearest bank', timeCost: 7, chance: { probability: 0.76, lateProbability: 0.54, lateAfterMinutes: 32, successNext: 'shoreLanding', failureNext: 'swampedNearShore', successMessage: 'You reach the shallows before the canoe fills further.', failureMessage: 'The canoe swamps, but you are close enough to swim.' } },
        { id: 'swimAfterNoSignal', label: 'Swim for shore with the canoe as flotation', timeCost: 2, next: 'swimDecision' },
      ],
    },
    rescueResponse: {
      id: 'rescueResponse', title: 'A Boat Turns Back', tone: 'safe',
      text: 'Someone on shore hears you and rows out in a small skiff. They help you aboard and tie the canoe alongside; water still sloshes among the cargo.',
      textVariants: [{ requirements: { flags: ['seenSkiff'] }, text: 'The fisherman from the far shore rows over and helps you aboard. He ties the canoe alongside; its seam still leaks and water sloshes among the cargo.' }],
      choices: [{ id: 'acceptRescue', label: 'Climb aboard and leave the canoe in tow', effects: { historyFlags: ['signaled_for_help'] }, next: 'rescueEnding' }],
    },
    swampedNearShore: {
      id: 'swampedNearShore', title: 'Water Over the Ribs', tone: 'danger',
      text: 'The canoe fills and rolls onto its side within sight of shore. The cold water reaches your waist, but the bank is near enough to swim. Your money and carried gear are still yours if you keep them close; leaving them in the canoe could lose them.',
      textVariants: [{ requirements: { selections: { lakeCondition: 'coolWater' } }, text: 'The canoe fills and rolls onto its side within sight of shore. Cold water closes around you; the bank is near enough to swim, but fatigue and chill are serious. Your money and carried gear are still yours if kept close. Leaving them in the canoe could lose them.' }],
      choices: [
        { id: 'holdCanoeToShore', label: 'Hold the canoe and kick toward shore', hint: 'It floats, but pushes water and tires you.', timeCost: 6, chance: { probability: 0.78, lateProbability: 0.62, lateAfterMinutes: 40, bonusItems: ['heavyLeatherGloves', 'woolTravelBlanket'], bonusFlags: ['carriedItemSecured', 'moneySecured'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.08, penaltyProbability: 0.1, successNext: 'shoreLanding', failureNext: 'swimDecision', successMessage: 'The swamped hull gives enough flotation to reach the bank.', failureMessage: 'The canoe drags at your arms; you catch a breath and must choose how to continue.' } },
        { id: 'swampedPrepare', label: 'Secure valuables before swimming', timeCost: 1, next: 'swimDecision' },
        { id: 'tetherCanoeWithRope', label: 'Use your rope to tow the canoe while swimming', hint: 'The line keeps it from drifting, though it adds drag.', requirements: { items: ['travelRope'] }, timeCost: 5, chance: { probability: 0.82, lateProbability: 0.68, lateAfterMinutes: 40, bonusFlags: ['carriedItemSecured', 'moneySecured'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.08, penaltyProbability: 0.1, successNext: 'shoreLanding', failureNext: 'swimDecision', successMessage: 'The rope keeps the canoe alongside until your feet find bottom.', failureMessage: 'The canoe tugs hard on the line; you reach a breath and can try without it.' } },
      ],
    },
    swimDecision: {
      id: 'swimDecision', title: 'The Last Distance', tone: 'danger',
      text: 'The canoe is no longer a reliable way to travel. The visible bank is still reachable by swimming, but distance and fatigue will matter. Tuck away what you can, keep the canoe as flotation, or deliberately leave possessions behind to swim unencumbered.',
      textVariants: [
        { requirements: { selections: { lakeCondition: 'coolWater' }, items: ['woolTravelBlanket'] }, text: 'The bank is reachable, but the water is cold enough to sap strength. Your wool blanket is packed close; a swim could soak it and cost you warmth. Secure what you can or hold the canoe.' },
        { requirements: { selections: { lakeCondition: 'coolWater' }, minElapsedMinutes: 40 }, text: 'The bank is reachable, but the water is cold and your arms are tiring. Secure what you can, hold the canoe, or knowingly leave possessions behind.' },
        { requirements: { selections: { lakeCondition: 'coolWater' } }, text: 'The bank is reachable, but the water is cold enough to sap strength. Secure what you can, hold the canoe, or knowingly leave possessions behind.' },
        { requirements: { minElapsedMinutes: 40 }, text: 'You have spent a long time on the water. The bank remains reachable, but your arms are tiring and the water chills you. The final swim is dangerous; leaving gear behind must be your choice, not an accident.' },
      ],
      choices: [
        { id: 'secureBeforeSwim', label: 'Secure money and carried gear against your body', hint: 'Costs time, but keeps them with you if you reach land.', requirements: { notFlags: ['moneySecured', 'carriedItemSecured'] }, timeCost: 2, effects: { setFlags: ['moneySecured', 'carriedItemSecured', 'protected_carried_item_from_water'] }, next: 'swimSecured' },
        { id: 'swimHoldingCanoe', label: 'Hold the canoe as flotation and swim', timeCost: 7, chance: { probability: 0.76, lateProbability: 0.56, lateAfterMinutes: 40, bonusItems: ['heavyLeatherGloves', 'woolTravelBlanket'], bonusFlags: ['carriedItemSecured', 'moneySecured'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.1, penaltyProbability: 0.12, successNext: 'shoreLanding', failureNext: 'swimStruggle', successMessage: 'Keeping one arm over the hull, you kick until your feet find the bank.', failureMessage: 'Your grip slips and your arms falter. You stay afloat, but lose strength.' } },
        { id: 'swimLeavePossessions', label: 'Leave money and carried gear in canoe; swim light', hint: 'This knowingly leaves all unsecured carried items and money behind for good.', requirements: { notFlags: ['moneySecured', 'carriedItemSecured'] }, effects: { loseMoney: true, loseCarriedItems: true, setFlags: ['possessionsLeftBehind'], historyFlags: ['abandoned_canoe', 'sacrificed_property_for_safety'] }, timeCost: 5, chance: { probability: 0.86, lateProbability: 0.66, lateAfterMinutes: 40, penaltySelections: { lakeCondition: 'coolWater' }, penaltyProbability: 0.1, successNext: 'shoreLanding', failureNext: 'swimStruggle', successMessage: 'Lighter, you reach the bank and leave the canoe behind.', failureMessage: 'Even unencumbered, cold water and fatigue slow you. You reach floating wood and catch your breath.' } },
        { id: 'lastColdSwim', label: 'Make one final swim through the cold', hint: 'If this fails, exhaustion and cold may kill you. The canoe is close enough to hold instead.', requirements: { minElapsedMinutes: 40 }, timeCost: 5, chance: { probability: 0.42, lateProbability: 0.3, lateAfterMinutes: 48, bonusItems: ['heavyLeatherGloves'], bonusFlags: ['cargoLightened', 'patchStrong'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.08, penaltyProbability: 0.08, successNext: 'shoreLanding', failureNext: 'deathEnding', successMessage: 'With a final burst you reach the bank.', failureMessage: 'The cold finally takes your strength.' } },
      ],
    },
    swimSecured: {
      id: 'swimSecured', title: 'What You Could Save', tone: 'danger',
      text: 'Your money and carried gear are tucked close. The food, bedroll, cooking tin, and canoe may be lost, but you can still keep the important bundle with you. The nearest shore remains a tiring swim.',
      textVariants: [{ requirements: { items: ['woolTravelBlanket'] }, text: 'Your money and carried gear are tucked close. Your wool blanket is packed with you; if it stays dry, it can help restore warmth on shore.' }],
      choices: [
        { id: 'securedSwimWithCanoe', label: 'Keep hold of the canoe and swim', timeCost: 6, chance: { probability: 0.82, lateProbability: 0.64, lateAfterMinutes: 40, bonusItems: ['heavyLeatherGloves'], bonusFlags: ['cargoLightened', 'patchStrong'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.08, penaltyProbability: 0.1, successNext: 'shoreLanding', failureNext: 'swimStruggle', successMessage: 'The hull keeps you afloat until the bank rises beneath your feet.', failureMessage: 'The cold saps your arms. You cling to the hull, still afloat.' } },
        { id: 'securedTetheredSwim', label: 'Tether the canoe with your travel rope', requirements: { items: ['travelRope'], usableItems: ['travelRope'] }, hint: 'The rope keeps the hull close, but adds drag in the water.', timeCost: 5, chance: { probability: 0.84, lateProbability: 0.68, lateAfterMinutes: 40, bonusItems: ['heavyLeatherGloves'], penaltySelections: { lakeCondition: 'coolWater' }, bonusProbability: 0.08, penaltyProbability: 0.1, successNext: 'shoreLanding', failureNext: 'swimStruggle', successMessage: 'The tether keeps the canoe near as you reach the shallows.', failureMessage: 'The hull pulls against the line; you keep hold and catch your breath.' } },
        { id: 'securedSwimWithoutHull', label: 'Leave the canoe and swim to shore', hint: 'Your protected bundle stays with you; the canoe will be lost.', effects: { setFlags: ['abandoned_canoe'] }, timeCost: 4, chance: { probability: 0.88, lateProbability: 0.7, lateAfterMinutes: 40, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.08, successNext: 'shoreLanding', failureNext: 'swimStruggle', successMessage: 'You swim without the hull’s drag and make the shallows.', failureMessage: 'The cold slows you before the shore. You catch a piece of floating wood.' } },
      ],
    },
    swimStruggle: {
      id: 'swimStruggle', title: 'A Breath on Floating Wood', tone: 'danger',
      text: 'You catch the canoe’s gunwale and keep your head above water. Your arms ache and the shore is still a hard swim, but you are not sinking. If your money or carried gear was deliberately left behind, it is gone; anything secured remains with you.',
      choices: [
        { id: 'restThenSwim', label: 'Rest against the hull, then kick for shore', hint: 'The pause costs time, but gives your arms a chance to recover.', timeCost: 4, chance: { probability: 0.78, lateProbability: 0.58, lateAfterMinutes: 44, bonusItems: ['woolTravelBlanket', 'heavyLeatherGloves'], bonusProbability: 0.08, successNext: 'shoreLanding', failureNext: 'deathEnding', successMessage: 'After a breath, you find a little strength and reach the bank.', failureMessage: 'Cold and exhaustion overcome you before you can reach shore.' } },
        { id: 'callFromWater', label: 'Shout and wave for the distant skiff', requirements: { flags: ['seenSkiff'] }, timeCost: 2, chance: { probability: 0.58, bonusItems: WHISTLES, bonusProbability: 0.18, successNext: 'rescueResponse', failureNext: 'swimStruggleFinal', successMessage: 'The skiff turns at last and rows toward you.', failureMessage: 'The skiff does not see you through the chop.' } },
        { id: 'callTowardShore', label: 'Wave and shout toward the shore', requirements: { notFlags: ['seenSkiff'] }, timeCost: 2, chance: { probability: 0.44, bonusItems: WHISTLES, bonusProbability: 0.18, successNext: 'rescueResponse', failureNext: 'swimStruggleFinal', successMessage: 'Someone near shore hears you and a skiff starts out.', failureMessage: 'No answer comes across the water.' } },
      ],
    },
    swimStruggleFinal: {
      id: 'swimStruggleFinal', title: 'Still Afloat', tone: 'danger',
      text: 'The skiff has not answered. You are still holding the canoe; the nearest shore is reachable, but your strength is fading. Another desperate swim may be fatal.',
      choices: [
        { id: 'holdForWardens', label: 'Hold on and keep calling for help', timeCost: 4, chance: { probability: 0.68, successNext: 'rescueResponse', failureNext: 'deathEnding', successMessage: 'The fisherman hears you and rows back.', failureMessage: 'Your strength gives out before help arrives.' } },
        { id: 'desperateSwim', label: 'Risk one final swim for shore', hint: 'You are exhausted; failure may be fatal.', timeCost: 3, chance: { probability: 0.38, successNext: 'shoreLanding', failureNext: 'deathEnding', successMessage: 'You find a final burst of strength and reach land.', failureMessage: 'You cannot keep your head above the water.' } },
      ],
    },
    shoreLanding: {
      id: 'shoreLanding', title: 'Feet on the Bank', tone: 'safe',
      text: 'You reach the nearest shore. The canoe is safe if you brought it in; otherwise it drifts or lies swamped nearby. The water has made the choice for some ordinary cargo, but anything you secured or kept on you remains yours.',
      choices: [{ id: 'finishAtShore', label: 'Catch your breath on solid ground', next: 'shoreEnding' }],
    },
    shoreEnding: { id: 'shoreEnding', title: 'A Long Paddle Behind You', text: 'The lake settles behind the near shore. You saved yourself and what you deliberately kept close; the rest can be replaced. The canoe is beached if you brought it in, or can be recovered when the water calms.', choices: [], ending: 'success' },
    rescueEnding: {
      id: 'rescueEnding', title: 'Seen in Time', text: 'The fisherman brings you and the canoe to the landing. Anything you secured or kept with you is safe; ordinary food and cooking gear are soaked.', choices: [], ending: 'success',
      textVariants: [
        { requirements: { flags: ['possessionsLeftBehind'] }, text: 'The fisherman brings you and the canoe to the landing. Any unsecured money or carried gear you left behind is not recovered. You are safe.' },
      ],
    },
    deathEnding: { id: 'deathEnding', title: 'The Cold Takes Hold', text: 'The shore was visible, but cold water and exhaustion left you without the strength to reach it. The canoe drifts beyond the reeds.', choices: [], ending: 'death' },
  },
};
