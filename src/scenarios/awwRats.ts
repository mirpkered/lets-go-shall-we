import type { Choice, Scenario } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

const strategies = (): Choice[] => [
  { id: 'tryTraps', label: 'Set a line of baited traps', hint: 'Quiet and selective; success depends on bait and placement.', next: 'trapPlan' },
  { id: 'sealRoutes', label: 'Seal the access routes', hint: 'Keeps rats from the stores, but a poor brace may fail.', next: 'sealPlan' },
  { id: 'smokeNest', label: 'Drive them out with cool smoke', hint: 'Can clear the nest quickly; smoke and livestock need careful handling.', next: 'smokePlan' },
];

const rewards = (ending: string): Choice[] => [
  { id: 'takeHook', label: 'Accept the Rat-Catcher’s Hook', requirements: { notItems: ['ratCatchersHook'] }, effects: { gainItems: ['ratCatchersHook'] }, next: ending },
  { id: 'takeGloves', label: 'Accept the Heavy Leather Gloves', requirements: { notItems: ['heavyLeatherGloves'] }, effects: { gainItems: ['heavyLeatherGloves'] }, next: ending },
  { id: 'leaveReward', label: 'Leave the farm without a tool', next: ending },
];

export const AWW_RATS: Scenario = {
  id: 'aww-rats',
  title: 'Aww, Rats!!',
  subtitle: 'A missing sack, a worried farmer, and a problem under the floorboards.',
  startScene: 'farmArrival',
  timePhases: [
    { id: 'dusk', label: 'Dusk on the Farm', atMinutes: 0 },
    { id: 'spreading', label: 'The Rats Are Spreading', atMinutes: 20 },
    { id: 'late', label: 'The Farm at Risk', atMinutes: 45 },
  ],
  scenes: {
    farmArrival: {
      id: 'farmArrival', title: 'A Quiet Farm, for Now',
      text: 'The farmer meets you beside the granary, trying to sound casual. Two sacks have been gnawed open, and the hens have stopped laying. “I saw a rat the size of a boot,” says a farmhand. “Could’ve been a small boot,” the farmer adds. Grain keeps vanishing, and the animals sleep only a few steps away.',
      choices: [
        { id: 'inspectGrain', label: 'Check the granary', hint: 'The damaged sacks may show what is drawing them in.', timeCost: 6, next: 'grainClue' },
        { id: 'followTracks', label: 'Follow the tracks by the barn', hint: 'Look for a route in and out.', timeCost: 8, next: 'tracksClue' },
        { id: 'askFarmhand', label: 'Ask the farmhand what they saw', timeCost: 4, next: 'farmhandClue' },
        { id: 'askAdvance', label: 'Ask for a small work advance', hint: 'The farmer can spare four coins from the repair fund.', timeCost: 2, effects: { money: 4, knowledge: ['The rats have been seen near both the granary and the animal pens.'] }, next: 'advancePaid' },
      ],
    },
    advancePaid: {
      id: 'advancePaid', title: 'Four Coins Up Front',
      text: 'The farmer counts out four coins, grateful you agreed to help. The storehouse has a few supplies for sale, but the rat problem is already costing the farm grain.',
      choices: [{ id: 'headToStore', label: 'Look over the farm supplies', next: 'supplyShed' }],
    },
    grainClue: {
      id: 'grainClue', title: 'The Torn Sacks',
      text: 'Fine grain dust coats a broad trail beneath the sacks. The lowest boards are scratched from inside the wall. Chaff hangs in the air; the farmer warns that open flame near the dust could flash across the whole store.',
      choices: [
        { id: 'noteDust', label: 'Remember the fire risk and inspect supplies', timeCost: 3, effects: { knowledge: ['Grain dust can flash dangerously near open flame.'], lore: ['The granary stores most of the farm’s winter feed.'] }, next: 'supplyShed' },
        { id: 'inspectFoundation', label: 'Trace the scratches toward the foundation', timeCost: 5, effects: { knowledge: ['Rats are entering through a damaged granary sill.'] }, next: 'supplyShed' },
      ],
    },
    tracksClue: {
      id: 'tracksClue', title: 'Tracks Beneath the Barn',
      text: 'Small tracks thread between the barn and the feed store. One set disappears under a loose sill; another runs toward a drain that slopes to the creek. The barn floor flexes above a hollow pocket.',
      choices: [
        { id: 'markCreekRoute', label: 'Mark the drain and continue', timeCost: 4, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.barnDrainToCreek], setFlags: ['creekRouteMarked'] }, next: 'supplyShed' },
        { id: 'inspectOuterRun', label: 'Inspect the hollow with your card mirror', hint: 'You can look beneath the loose sill without stepping onto the weak boards.', requirements: { items: ['foldingCardMirror'] }, timeCost: 3, effects: { knowledge: ['The folding mirror shows an outer rat run beneath the loose sill; the hollow boards should not be crossed.'], setFlags: ['outerRunViewed'] }, next: 'supplyShed' },
        { id: 'inspectFeed', label: 'Check what is feeding them', timeCost: 5, effects: { knowledge: ['Rats are feeding on spilled grain between the barn and store.'] }, next: 'supplyShed' },
      ],
    },
    farmhandClue: {
      id: 'farmhandClue', title: 'The Farmhand’s Account',
      text: 'The farmhand has seen rats dart from the granary toward the henhouse after dusk. The dog will not go near the barn floor, where scratching comes from beneath the boards. “I can hold a lantern outside,” they offer, “but I won’t crawl under there.”',
      choices: [
        { id: 'learnAnimalRisk', label: 'Keep the animals away and inspect supplies', timeCost: 3, effects: { knowledge: ['Rats may flee from the barn toward the henhouse if disturbed.'] }, next: 'supplyShed' },
        { id: 'askForTunnel', label: 'Ask where the sound is loudest', timeCost: 3, effects: { knowledge: ['The main nest seems to be under the hollow barn floor.'] }, next: 'supplyShed' },
      ],
    },
    supplyShed: {
      id: 'supplyShed', title: 'The Farm Store',
      text: 'The farmer shows you the farm’s supplies: sturdy wire traps and bait, older traps with oat scraps, and a hand bellows that can direct damp smoke without bringing flame near the grain dust. He lends you the sturdy traps or bellows for the job; the older traps are less reliable, but usable. The choice of method is yours.',
      choices: [
        { id: 'buyTraps', label: 'Take the sturdy baited wire traps', timeCost: 2, requirements: { notItems: ['wireTraps'] }, effects: { gainItems: ['ratBait', 'wireTraps'], setFlags: ['boughtRatTraps'] }, next: 'grainDecision' },
        { id: 'buyBellows', label: 'Borrow the farm’s hand bellows', timeCost: 2, requirements: { notItems: ['smokeBellows'] }, effects: { gainItems: ['smokeBellows'], setFlags: ['boughtBellows'] }, next: 'grainDecision' },
        { id: 'borrowTraps', label: 'Borrow the old traps and oat scraps', timeCost: 2, requirements: { notItems: ['wireTraps', 'ratBait'] }, effects: { gainItems: ['wireTraps', 'ratBait'], setFlags: ['borrowedRatTraps'] }, next: 'grainDecision' },
        { id: 'skipSupplies', label: 'Use the farm’s ordinary materials', next: 'grainDecision' },
      ],
    },
    grainDecision: {
      id: 'grainDecision', title: 'The Granary Gives Way', tone: 'warning',
      text: 'A board drops inward. Under the granary, a broad nest connects several tunnels; rats stream between it and the damaged sill. Some grain is fouled, while a few sacks still look clean. The farmer explains that hidden spoilage may run deeper and any open route could reinfest saved feed. He leaves the decision to you.',
      textVariants: [{ requirements: { minElapsedMinutes: 23 }, text: 'A board drops inward. Under the granary, a broad nest connects several tunnels; rats have spread from the sill into the lower feed bins. The grain that looked salvageable is now fouled through. The farmer warns the damaged stores cannot safely be kept, then leaves you to decide what to do next.' }],
      choices: [
        { id: 'destroyGrain', label: 'Discard the fouled grain', timeCost: 10, hint: 'Certain feed loss, but it removes food without risking flame near grain dust.', effects: { money: -2, setFlags: ['grainDestroyed'] }, next: 'grainDiscarded' },
        { id: 'salvageGrain', label: 'Try to save the clean-looking sacks', timeCost: 12, hint: 'Some may be sound; the hidden contamination is uncertain.', requirements: { maxElapsedMinutes: 22 }, chance: { probability: 0.55, successNext: 'grainSalvaged', failureNext: 'grainSpoiled', successMessage: 'You separate a useful portion before the spoilage spreads.', failureMessage: 'The damage runs deeper than it looked; the sacks must be discarded.', successEffects: { setFlags: ['grainSaved'] }, failureEffects: { money: -2, setFlags: ['grainDestroyed', 'salvageFailed'] } } },
        { id: 'isolateGrain', label: 'Seal the grain off until the nest is handled', timeCost: 5, hint: 'Preserves the chance of saving it, but risks reinfestation.', effects: { setFlags: ['grainIsolated'] }, next: 'grainIsolated' },
      ],
    },
    grainDiscarded: { id: 'grainDiscarded', title: 'The Empty Feed Bins', text: 'The damaged sacks are hauled out and set aside for disposal. Losing the feed hurts, but the rats have less to eat if your plan closes the routes.', choices: strategies() },
    grainSalvaged: { id: 'grainSalvaged', title: 'Some Grain Saved', text: 'A portion looks clean enough to keep, sealed in sound barrels. The farmer will watch it closely; any gap in the rat routes could undo the work.', choices: strategies() },
    grainSpoiled: { id: 'grainSpoiled', title: 'The Spoilage Runs Deep', tone: 'warning', text: 'The sacks that looked clean are fouled inside. You and the farmer remove them too. The lost feed stings, but the remaining infestation can no longer reach it.', choices: strategies() },
    grainIsolated: { id: 'grainIsolated', title: 'A Barrier Around the Stores', text: 'The farmer helps raise the usable grain onto clean bins and isolate it behind a temporary barrier. The food may be saved, though any tunnel left open could bring the rats back.', choices: strategies() },
    trapPlan: {
      id: 'trapPlan', title: 'Bait, Patience, and a Narrow Gap',
      text: 'The nest has several exits, and the floor above it is weak. Traps can reduce the colony without sending rats toward the animals. Place them outside the hollow; reaching beneath the boards is dangerous. Better traps or a toolkit can make the setup more reliable.', tone: 'warning',
      textVariants: [
        { requirements: { flags: ['outerRunViewed'], minElapsedMinutes: 45 }, text: 'The mirror showed you a narrow outer run beneath the loose sill. The colony has spread toward the animal pens while you worked; place traps from solid ground along the route, away from the hollow boards.' },
        { requirements: { flags: ['outerRunViewed'] }, text: 'The mirror showed you a narrow outer run beneath the loose sill. Place the traps from solid ground along that route; the hollow center of the barn floor is still unsafe.' },
        { requirements: { minElapsedMinutes: 45 }, text: 'The nest has several exits, and the floor above it is weak. The colony has had time to spread toward the animal pens. Traps can still reduce it without sending rats directly among the livestock; place them outside the hollow, not beneath the boards.' },
      ],
      choices: [
        { id: 'baitedWire', label: 'Set the purchased bait and wire traps', timeCost: 8, requirements: { items: ['ratBait', 'wireTraps'], flags: ['boughtRatTraps'] , usableItems: ['wireTraps']}, chance: { probability: 0.84, successNext: 'trapsWorking', failureNext: 'trapBurst', successMessage: 'The bait draws the rats to the wire line, away from the pens.', failureMessage: 'The first rush snaps a wire and scatters the nest toward the barn door.', failureEffects: { health: -1 } } },
        { id: 'borrowedBait', label: 'Set the borrowed traps with oat scraps', timeCost: 10, requirements: { items: ['ratBait', 'wireTraps'], flags: ['borrowedRatTraps'] }, chance: { probability: 0.66, successNext: 'trapsWorking', failureNext: 'trapBurst', successMessage: 'The older springs hold; the rats take the bait.', failureMessage: 'The old springs fail under the rush; rats scatter toward the door.', failureEffects: { health: -1 } } },
        { id: 'toolTrap', label: 'Tune the trap line with your toolkit', timeCost: 4, requirements: { items: ['pocketToolkit'] }, chance: { probability: 0.82, successNext: 'trapsWorking', failureNext: 'trapBurst', successMessage: 'You adjust the springs and guide the rats away from the pens.', failureMessage: 'The floorboard gives under your weight; rats scatter into the barn.', failureEffects: { health: -2 } } },
        { id: 'simpleTrap', label: 'Set a rough line with farm scraps', timeCost: 12, requirements: { notItems: ['ratBait'] }, chance: { probability: 0.59, bonusFlags: ['outerRunViewed'], bonusProbability: 0.12, successNext: 'trapsWorking', failureNext: 'trapBurst', successMessage: 'The makeshift bait line works better than expected.', failureMessage: 'The rough bait draws a rush before the traps are ready.', failureEffects: { health: -2 } } },
      ],
    },
    trapsWorking: { id: 'trapsWorking', title: 'A Quieter Barn', text: 'The trap line catches the first wave at the outer run. The farmhand keeps the hens behind a closed gate while the remaining scratching fades under the granary.', choices: [{ id: 'checkTraps', label: 'Check the line from outside the hollow', next: 'rewardClean' }] },
    trapBurst: {
      id: 'trapBurst', title: 'The Nest Breaks Open', tone: 'danger',
      text: 'A board cracks and the nest surges into the barn. The swarm is loud, fast, and close to the hens; the low pocket beneath you is visibly giving way. You can retreat and save yourself, or risk reaching the narrow nest mouth to slam its outer gate. A bad collapse could bury you.',
      choices: [
        { id: 'retreatSwarm', label: 'Shut the animal gate and get clear', hint: 'The farm is not fully safe, but you can escape unharmed.', next: 'survivalEnding' },
        { id: 'reachGate', label: 'Reach the nest gate', hint: 'The floor is cracking; failure could be fatal.', chance: { probability: 0.58, successNext: 'rewardClean', failureNext: 'nestCollapse', successMessage: 'You slam the gate and the swarm turns into the empty outer run.', failureMessage: 'The hollow floor gives way beneath you.', failureEffects: { health: -5 } } },
        { id: 'candlestickWedge', label: 'Wedge the outer gate with the candlestick', requirements: { items: ['brassCandlestick'] }, effects: { loseItems: ['brassCandlestick'] }, next: 'rewardContained' },
      ],
    },
    nestCollapse: {
      id: 'nestCollapse', title: 'Under the Broken Boards', tone: 'danger',
      text: 'You land among loose boards at the edge of the nest pocket. The farmer and farmhand pull the outside hatch shut behind you. Ahead, an inner board gate blocks the deeper run; the low passage around it is still shifting, and every breath sends dust from the cracks. You have one clear route out; forcing the gate could be fatal.',
      choices: [
        { id: 'crawlOut', label: 'Crawl toward the daylight', hint: 'Slow and painful, but away from the unstable nest.', effects: { health: -2 }, next: 'survivalEnding' },
        { id: 'pushDeeper', label: 'Force the inner gate shut', hint: 'The floor may collapse completely.', chance: { probability: 0.42, successNext: 'rewardContained', failureNext: '__death', successMessage: 'You force the gate shut and get clear as the pocket collapses.', failureMessage: 'The floor gives way beneath the low passage.' } },
      ],
    },
    sealPlan: {
      id: 'sealPlan', title: 'Close Every Route',
      text: 'The damaged sill and creek drain are the main openings. A rough timber hatch covers the outer nest mouth on an old hinge. Sealing the openings can keep rats away from the stores while the nest runs out of food. The barn floor is hollow, so brace the hatch and sill from firm ground rather than standing over the cavity.', tone: 'warning',
      choices: [
        { id: 'toolSeal', label: 'Reinforce the sill with your toolkit', timeCost: 5, requirements: { items: ['pocketToolkit'] }, chance: { probability: 0.88, successNext: 'routesSealed', failureNext: 'sealBreach', successMessage: 'The boards hold and the tunnel closes flush.', failureMessage: 'A hidden gap defeats the first brace.', failureEffects: { health: -1 } } },
        { id: 'ropeSeal', label: 'Pull the hatch into place with your rope', timeCost: 6, requirements: { items: ['travelRope'] }, chance: { probability: 0.82, successNext: 'routesSealed', failureNext: 'sealBreach', successMessage: 'The rope lets you draw the hatch tight from firm ground.', failureMessage: 'The old hinge shifts and the hatch slips back.', failureEffects: { health: -1 } } },
        { id: 'candlestickSeal', label: 'Wedge the sill with the brass candlestick', timeCost: 4, requirements: { items: ['brassCandlestick'] }, effects: { loseItems: ['brassCandlestick'] }, next: 'routesSealed' },
        { id: 'braceBoards', label: 'Brace the boards with farm timber', timeCost: 12, chance: { probability: 0.68, successNext: 'routesSealed', failureNext: 'sealBreach', successMessage: 'The timber braces the openings; the scratching fades.', failureMessage: 'A board bows inward and the rats find a gap.', failureEffects: { health: -1 } } },
      ],
    },
    routesSealed: { id: 'routesSealed', title: 'The Scratching Stops', text: 'The sill and drain are closed from firm ground. The farmer marks them for permanent repair and keeps the feed behind the new barrier. This is not a dramatic victory, but the farm is safe from the nest tonight.', choices: [{ id: 'finishSealing', label: 'Check the outside barriers and finish', next: 'rewardContained' }] },
    sealBreach: {
      id: 'sealBreach', title: 'A Gap Remains', tone: 'warning',
      text: 'One brace shifts, and scratching returns beneath the granary. The route is narrower but not sealed; the farmhand can hold the animal gate while you try the outside brace once more. The hollow floor remains unsafe to cross.',
      choices: [
        { id: 'secondBrace', label: 'Set a wider brace from the outside', chance: { probability: 0.73, successNext: 'routesSealed', failureNext: 'containmentEnding', successMessage: 'The wider timber catches and closes the opening.', failureMessage: 'The old foundation keeps moving; the opening cannot be sealed tonight.', failureEffects: { health: -1 } } },
        { id: 'securePens', label: 'Secure the animals and leave the nest isolated', next: 'rewardContained' },
        { id: 'withdrawFromSeal', label: 'Withdraw before the boards shift again', next: 'survivalEnding' },
      ],
    },
    smokePlan: {
      id: 'smokePlan', title: 'Smoke, Not Flame',
      text: 'The farmer explains the risk plainly: dry straw or a naked flame near grain dust could set the granary alight. A safe attempt uses damp sacks and a low, controlled source outside the store, with the animals moved behind closed gates. The hand bellows can keep you farther from the tunnel mouth.', tone: 'warning',
      choices: [
        { id: 'bellowsSmoke', label: 'Direct cool smoke with the bellows', timeCost: 5, requirements: { items: ['smokeBellows'] }, chance: { probability: 0.84, successNext: 'smokeClears', failureNext: 'smokeDrifts', successMessage: 'The damp smoke moves through the nest and out toward the creek.', failureMessage: 'A change in the breeze pushes smoke toward the animal pens.', failureEffects: { health: -1 } } },
        { id: 'ropeSmoke', label: 'Lower a damp sack with your rope', timeCost: 7, requirements: { items: ['travelRope'] }, chance: { probability: 0.77, successNext: 'smokeClears', failureNext: 'smokeDrifts', successMessage: 'The sack settles at the tunnel mouth; the rats flee toward the creek.', failureMessage: 'The sack catches on a root and smoke curls toward the pens.', failureEffects: { health: -1 } } },
        { id: 'hoodedDampSmoke', label: 'Set the damp smoke close in your hood', timeCost: 8, hint: 'The hood cuts smoke exposure, not the grain-dust fire risk. Keep the ember outside.', requirements: { items: ['smokeHood'] }, chance: { probability: 0.66, bonusItems: ['smokeHood'], bonusProbability: 0.12, successNext: 'smokeClears', failureNext: 'smokeDrifts', successMessage: 'The hood lets you settle the damp sacks close to the outlet; controlled smoke drives the colony toward the creek.', failureMessage: 'A shift in the breeze pushes smoke toward the barn; the animals stir, but the hood keeps your breathing clearer.', failureEffects: { health: -1 } } },
        { id: 'dampSmoke', label: 'Use damp sacks and a low brazier outside', timeCost: 12, hint: 'The grain-dust fire risk is visible; keep flame outside.', requirements: { notItems: ['smokeHood'] }, chance: { probability: 0.66, successNext: 'smokeClears', failureNext: 'smokeDrifts', successMessage: 'The controlled smoke drives the colony toward the creek outlet.', failureMessage: 'The breeze turns the smoke toward the barn; the animals stir.', failureEffects: { health: -2 } } },
      ],
    },
    smokeClears: { id: 'smokeClears', title: 'A Rush Toward the Creek', text: 'The rats pour from the marked creek outlet rather than the granary. The farmer and farmhand close the outer gate after the last of them, saving the animals and most of the usable stores. The damp smoke leaves a mess, but no fire.', choices: [{ id: 'finishSmoke', label: 'Close the outlet and finish the work', next: 'rewardCostly' }] },
    smokeDrifts: {
      id: 'smokeDrifts', title: 'Smoke at the Pens', tone: 'warning',
      text: 'The smoke shifts toward the animal pens. The farmhand shuts the inner gate while the farmer opens the creek-side outlet. The rats are moving toward that opening, but the path is narrow and the floor still trembles.',
      choices: [
        { id: 'openCreekGate', label: 'Open the marked creek outlet from firm ground', requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.barnDrainToCreek.id] }, next: 'rewardCostly' },
        { id: 'useBellowsAgain', label: 'Redirect the smoke with the bellows', requirements: { items: ['smokeBellows'] }, chance: { probability: 0.72, successNext: 'rewardCostly', failureNext: 'rewardContained', successMessage: 'The bellows pushes the swarm through the creek outlet.', failureMessage: 'You stop the smoke and keep the rats penned away from the animals.' } },
        { id: 'stopTheSmoke', label: 'Douse the brazier and protect the animals', next: 'rewardContained' },
      ],
    },
    rewardClean: { id: 'rewardClean', title: 'A Job Well Done', text: 'The nest is closed off and the rats no longer reach the farm stores. The farmer offers one useful tool in thanks: a long iron hook for moving debris, or a pair of heavy leather gloves. Both have been used here; choose one to accept, or leave both for the next repair.', choices: rewards('cleanEnding') },
    rewardContained: { id: 'rewardContained', title: 'Safe for Tonight', text: 'The farm is safe for the night, though the foundation needs lasting repair. In thanks, the farmer offers a stout iron hook or a pair of heavy leather gloves; choose one to keep, or leave both for the next repair.', choices: rewards('containmentEnding') },
    rewardCostly: { id: 'rewardCostly', title: 'The Nest Empties', text: 'The colony is driven from the farm, but the work costs grain and leaves the barn needing attention. The farmer offers a Rat-Catcher’s Hook or Heavy Leather Gloves from the storehouse. You may keep one as part of your pay, or take neither.', choices: rewards('costlyEnding') },
    cleanEnding: { id: 'cleanEnding', title: 'Quiet in the Granary', text: 'The rats are gone from the store and the animals are safe. The farmer has a clean granary, useful feed, and a story about the traveler who listened before reaching under the floorboards.', choices: [], ending: 'success' },
    containmentEnding: { id: 'containmentEnding', title: 'A Farm Safe for Tonight', text: 'The animals and remaining stores are protected. Some rats may still be beyond the sealed line, and a proper foundation repair remains, but no one has to sleep beside the scratching tonight.', choices: [], ending: 'success' },
    costlyEnding: { id: 'costlyEnding', title: 'A Hard-Won Clearing', text: 'The rat problem is cleared from the farm, but some feed and time are lost. The farmer starts repairs at first light. It is not a tidy victory; it is a safer farm, and that is enough for tonight.', choices: [], ending: 'success' },
    survivalEnding: { id: 'survivalEnding', title: 'Out Before the Boards Fall', text: 'You make it clear of the barn with your skin intact. The farmer secures the animals and keeps the granary closed, but the nest will need another attempt. You have survived; the farm’s problem is not fully solved.', choices: [], ending: 'success' },
    __death: { id: '__death', title: 'Beneath the Granary', text: 'The hollow floor gives way before anyone can reach you. The farmer and farmhand pull the outside hatch shut to save the animals from the collapse.', choices: [], ending: 'death' },
  },
};
