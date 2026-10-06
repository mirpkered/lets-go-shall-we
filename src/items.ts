import type { InventoryClass, Item } from './types';

export const ITEMS: Record<string, Item> = {
  smallKnife: { id: 'smallKnife', name: 'Small Knife', description: 'Plain, sharp, and better than bare hands.', category: 'weapon', carryable: false, inventoryClass: 'GEAR' },
  lantern: { id: 'lantern', name: 'Lantern', description: 'Its warm flame pushes back the crypt-dark.', category: 'tool', carryable: false, inventoryClass: 'GEAR', maxUpgrades: 1, upgrades: [{ id: 'spiritGlass', name: 'Spirit glass', description: 'A specialist fits a red-edged pane that reveals certain old marks in lamplight, but does not identify what made them.' }] },
  brassCandlestick: { id: 'brassCandlestick', name: 'Brass Candlestick', description: 'Heavy enough to serve as an improvised weapon.', category: 'weapon', carryable: true },
  boneKey: { id: 'boneKey', name: 'Bone Key', description: 'A finger-bone carved with tiny warding marks.', category: 'run-only', carryable: false },
  ironHandbell: { id: 'ironHandbell', name: 'Iron Handbell', description: 'Cold iron, old soil in its seams. Its clapper is missing.', category: 'run-only', carryable: false },
  blackClapper: { id: 'blackClapper', name: 'Black Iron Clapper', description: 'Far too heavy for the little handbell.', category: 'run-only', carryable: false },
  bronzeMaskFragment: { id: 'bronzeMaskFragment', name: 'Bronze Mask Fragment', description: 'Warm in moonlight. Its purpose is unknown.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
  graveCoin: { id: 'graveCoin', name: 'Grave Coin', description: 'A silver funeral token accepted by collectors and ferrymen.', category: 'valuable', carryable: true, inventoryClass: 'RELIC' },
  yewCharm: { id: 'yewCharm', name: 'Yew Charm', description: 'A tiny ward tied with the priest’s red thread.', category: 'charm', carryable: true, inventoryClass: 'RELIC' },
  ritualChalk: { id: 'ritualChalk', name: 'Ritual Chalk', description: 'A short stick of marked chalk used for one careful boundary or sign.', category: 'consumable', carryable: false, inventoryClass: 'SUPPLY', stackLimit: 4 },
  consecratedSalt: { id: 'consecratedSalt', name: 'Consecrated Salt', description: 'A sealed pinch of salt prepared for a specific warding use.', category: 'consumable', carryable: false, inventoryClass: 'SUPPLY', stackLimit: 3 },
  coldIronNails: { id: 'coldIronNails', name: 'Cold-Iron Nails', description: 'A few heavy nails reserved for a particular fastening or folk ward.', category: 'consumable', carryable: false, inventoryClass: 'SUPPLY', stackLimit: 6 },
  pocketToolkit: { id: 'pocketToolkit', name: 'Pocket Toolkit', description: 'A compact railway kit: pliers, driver, punch, and oil.', category: 'tool', carryable: true },
  travelRope: { id: 'travelRope', name: 'Travel Rope', description: 'Twenty feet of good braided cord with a locking hook.', category: 'tool', carryable: true, maxUpgrades: 1, upgrades: [{ id: 'splicedEyes', name: 'Spliced hook eye', description: 'A short leather whipping binds the hook eye more securely to the rope.' }] },
  conductorWhistle: { id: 'conductorWhistle', name: 'Conductor’s Whistle', description: 'A bright brass whistle that carries over machinery and weather.', category: 'valuable', carryable: true },
  signalLens: { id: 'signalLens', name: 'Crimson Signal Lens', description: 'Thick red glass from an old railway signal, warm at its center.', category: 'artifact', carryable: true },
  railwayMap: { id: 'railwayMap', name: 'Railway Map', description: 'A folded route map marked with gradients, sidings, and mileposts.', category: 'run-only', carryable: false },
  brakeKey: { id: 'brakeKey', name: 'Brake Cabinet Key', description: 'A square iron key on a red cord.', category: 'run-only', carryable: false },
  workGloves: { id: 'workGloves', name: 'Work Gloves', description: 'Thick leather gloves made for hot iron and rough cable.', category: 'run-only', carryable: false },
  ratBait: { id: 'ratBait', name: 'Farm Bait Tin', description: 'A small tin of seed and dried apple for setting practical traps.', category: 'run-only', carryable: false },
  wireTraps: { id: 'wireTraps', name: 'Wire Traps', description: 'Two sturdy spring traps borrowed from the farm store.', category: 'run-only', carryable: false },
  smokeBellows: { id: 'smokeBellows', name: 'Hand Bellows', description: 'A compact bellows for directing damp, cool smoke from a safe distance.', category: 'run-only', carryable: false },
  ratCatchersHook: { id: 'ratCatchersHook', name: 'Rat-Catcher’s Hook', description: 'A stout iron hook useful for shifting debris without reaching into dark spaces.', category: 'tool', carryable: true },
  heavyLeatherGloves: { id: 'heavyLeatherGloves', name: 'Heavy Leather Gloves', description: 'A well-made pair of thick farm gloves, sound enough for another hard day.', category: 'armor', carryable: true },
  minerHeadlamp: { id: 'minerHeadlamp', name: 'Miner’s Headlamp', description: 'A cap-mounted carbide lamp; its water-fed burner and reflector cast a bright, steady beam.', category: 'tool', carryable: true },
  foremanMultiTool: { id: 'foremanMultiTool', name: 'Foreman’s Multi-tool', description: 'A worn but dependable folding tool for small repairs.', category: 'tool', carryable: true },
  mineSurveyMap: { id: 'mineSurveyMap', name: 'Mine Survey Map', description: 'A folded map of the old levels and a marked side drift.', category: 'run-only', carryable: false },
  foldingPryTool: { id: 'foldingPryTool', name: 'Folding Pry Tool', description: 'A compact brass-and-steel tool made for careful leverage.', category: 'tool', carryable: true },
  brassRoomKey: { id: 'brassRoomKey', name: 'Brass Room Key', description: 'An old inn key, its number worn smooth by years of travel.', category: 'artifact', carryable: true },
  innCellarKey: { id: 'innCellarKey', name: 'Unmarked Cellar Key', description: 'A local key to the Lantern House service passage.', category: 'run-only', carryable: false },
  dealerCardKnife: { id: 'dealerCardKnife', name: 'Dealer’s Card Knife', description: 'A slim spring-steel blade for trimming cards, cord, and other careful work.', category: 'weapon', carryable: true },
  foldingCardMirror: { id: 'foldingCardMirror', name: 'Folding Card Mirror', description: 'A palm-sized inspection mirror with a brass hinge, useful for seeing into tight spaces.', category: 'tool', carryable: true },
  bridgewrightHammer: { id: 'bridgewrightHammer', name: 'Bridgewright’s Hammer', description: 'A compact, well-balanced hammer for setting pegs and careful repairs.', category: 'tool', carryable: true },
  ironRopeClamp: { id: 'ironRopeClamp', name: 'Iron Rope Clamp', description: 'A sturdy clamp for securing a line when wet knots cannot be trusted.', category: 'tool', carryable: true },
  weatherproofCloak: { id: 'weatherproofCloak', name: 'Weatherproof Cloak', description: 'A dry oilskin cloak that sheds rain and wind on a long walk.', category: 'armor', carryable: true },
  trailCompass: { id: 'trailCompass', name: 'Trail Compass', description: 'A small brass compass, steady enough to keep a route in poor visibility.', category: 'tool', carryable: true },
  waxedCanvasSheet: { id: 'waxedCanvasSheet', name: 'Waxed Canvas Sheet', description: 'A tough, water-shedding sheet useful for temporary cover and rough repairs.', category: 'tool', carryable: true },
  compactStoveTool: { id: 'compactStoveTool', name: 'Compact Stove Tool', description: 'A short iron tool for adjusting latches, stove plates, and stubborn fittings.', category: 'tool', carryable: true },
  reserveBlanket: { id: 'reserveBlanket', name: 'Reserve Blanket', description: 'A dry wool blanket borrowed from the inn’s limited emergency stores.', category: 'run-only', carryable: false },
  compactBlockAndTackle: { id: 'compactBlockAndTackle', name: 'Compact Block-and-Tackle', description: 'A small pulley set with a sound line, useful for lifting heavy loads in tight spaces.', category: 'tool', carryable: true },
  icehouseTongs: { id: 'icehouseTongs', name: 'Icehouse Tongs', description: 'Long-handled steel tongs for moving awkward objects without putting your hands beneath them.', category: 'tool', carryable: true },
  brassBottleOpener: { id: 'brassBottleOpener', name: 'Brass Bottle Opener', description: 'A sturdy brass opener with a narrow end that can pry a small cover or latch.', category: 'tool', carryable: true },
  drainageHook: { id: 'drainageHook', name: 'Drainage Hook', description: 'A long-handled steel hook for reaching behind grates and shifting debris.', category: 'tool', carryable: true },
  steelWedge: { id: 'steelWedge', name: 'Steel Wedge', description: 'A stout wedge for holding a brace, door, or loose structure in place.', category: 'tool', carryable: true },
  roadmansLantern: { id: 'roadmansLantern', name: 'Roadman’s Lantern', description: 'A shuttered storm lantern built to keep its flame steady in wet air.', category: 'tool', carryable: true },
  smokeHood: { id: 'smokeHood', name: 'Smoke Hood', description: 'A compact, treated-cloth hood that buys a little clearer breathing in smoke and dust.', category: 'armor', carryable: true },
  fireBeater: { id: 'fireBeater', name: 'Fire Beater', description: 'A flat, springy tool for pressing out small ground fires and shifting hot brush from a safe distance.', category: 'tool', carryable: true },
  trailWhistle: { id: 'trailWhistle', name: 'Trail Whistle', description: 'A clear, sharp whistle for calling companions across rough country.', category: 'tool', carryable: true },
  weatherproofBlanket: { id: 'weatherproofBlanket', name: 'Weatherproof Blanket', description: 'A compact wool blanket with a waxed outer layer to hold off cold rain.', category: 'armor', carryable: true },
  compactWheelWrench: { id: 'compactWheelWrench', name: 'Compact Wheel Wrench', description: 'A sturdy travel wrench for wheel hubs, bolts, and field repairs.', category: 'tool', carryable: true },
  foldingTrailMarker: { id: 'foldingTrailMarker', name: 'Folding Trail Marker', description: 'A bright, hinged marker that can be placed or hung to make a route easier to follow.', category: 'tool', carryable: true },
  freightmansStrap: { id: 'freightmansStrap', name: 'Freightman’s Strap', description: 'A broad, well-stitched leather strap for securing awkward loads.', category: 'tool', carryable: true, maxUpgrades: 1, upgrades: [{ id: 'stitchedBuckle', name: 'Reinforced buckle stitching', description: 'A harness maker adds a second row of stitching around the buckle loops.' }] },
  assayersLoupe: { id: 'assayersLoupe', name: 'Assayer’s Loupe', description: 'A brass-rimmed lens for reading fine marks and inspecting small details.', category: 'tool', carryable: true },
  farmWhistle: { id: 'farmWhistle', name: 'Farm Whistle', description: 'A clear, low-pitched whistle used to call livestock and farmhands without shouting.', category: 'tool', carryable: true },
  gateHook: { id: 'gateHook', name: 'Gate Hook', description: 'A stout hooked tool for lifting latches and drawing wire clear of a gate.', category: 'tool', carryable: true },
  windproofMatchCase: { id: 'windproofMatchCase', name: 'Windproof Match Case', description: 'A brass case that keeps a few matches dry in wind and wet weather.', category: 'tool', carryable: true },
  woolTravelBlanket: { id: 'woolTravelBlanket', name: 'Wool Travel Blanket', description: 'A compact, tightly woven blanket that holds warmth on a cold road.', category: 'armor', carryable: true },
  fieldBandageRoll: { id: 'fieldBandageRoll', name: 'Field Bandage Roll', description: 'A clean, tightly wrapped roll of gauze for practical roadside first aid.', category: 'consumable', carryable: true },
  roadsideSignalMirror: { id: 'roadsideSignalMirror', name: 'Roadside Signal Mirror', description: 'A polished steel mirror with a sighting notch for signaling across open country.', category: 'tool', carryable: true },
  foundPocketWatch: { id: 'foundPocketWatch', name: 'Silver Pocket Watch', description: 'A working silver watch with a former owner’s name engraved inside.', category: 'valuable', carryable: true },
  joinersFoldingRule: { id: 'joinersFoldingRule', name: 'Joiner’s Folding Rule', description: 'A hinged hardwood measuring rule, worn smooth at the joints but accurate for careful layout work.', category: 'tool', carryable: true },
  collapsibleSoundingRod: { id: 'collapsibleSoundingRod', name: 'Collapsible Sounding Rod', description: 'A brass-tipped folding probe for testing depth, silt, and hollow ground from firm footing; it is not a climbing support.', category: 'tool', carryable: true },
  fieldGlasses: { id: 'fieldGlasses', name: 'Field Glasses', description: 'A compact pair of brass-mounted binoculars for identifying distant movement and landmarks in clear light.', category: 'tool', carryable: true },
  foldingBrushSaw: { id: 'foldingBrushSaw', name: 'Folding Brush Saw', description: 'A short folding saw for cutting green branches and light brush; it is not built for timber.', category: 'tool', carryable: true },
  surveyChain: { id: 'surveyChain', name: 'Survey Chain', description: 'A linked measuring chain for comparing long ground distances and setting a straight line between visible points.', category: 'tool', carryable: true },
  climbingPitons: { id: 'climbingPitons', name: 'Climbing Pitons', description: 'A small set of reusable steel anchors for sound rock, used with a rope and removed when the route is finished.', category: 'tool', carryable: true },
  packFrame: { id: 'packFrame', name: 'Pack Frame', description: 'A light ash frame with shoulder straps that keeps bulky loads clear of the back and distributes their weight.', category: 'tool', carryable: true },
  handAuger: { id: 'handAuger', name: 'Hand Auger', description: 'A T-handled boring tool for making narrow pilot holes in timber without splitting the board.', category: 'tool', carryable: true },
  collapsibleWaterPail: { id: 'collapsibleWaterPail', name: 'Collapsible Water Pail', description: 'A riveted canvas pail with a removable hoop, made for carrying water when a rigid bucket is awkward to pack.', category: 'tool', carryable: true },
  signalFlagSet: { id: 'signalFlagSet', name: 'Signal Flag Set', description: 'Two brightly colored cloth flags for agreed daylight signals around bends or across a short, visible distance.', category: 'tool', carryable: true },
  briarHouseSkeletonKey: { id: 'briarHouseSkeletonKey', name: 'Briar House Skeleton Key', description: 'A narrow old key left by the traveler once hidden in Briar House. Its odd teeth fit no known modern lock.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
  redDoorToken: { id: 'redDoorToken', name: 'Red Door Token', description: 'A red-marked fitting from an old underground waystation seal. Its maker and wider purpose are unknown.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
  ironOrchardRodFragment: { id: 'ironOrchardRodFragment', name: 'Iron Orchard Rod Fragment', description: 'A short piece of an iron rod found already driven into the Orchard’s worked stone. It vibrates faintly near no known mechanism.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
  numberedLanternWick: { id: 'numberedLanternWick', name: 'Numbered Lantern Wick', description: 'A brass-tagged wick from the Lantern Vault’s former travel office. It is a record of the room, not a key to every numbered door.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
  blackMillingStone: { id: 'blackMillingStone', name: 'Black Milling Stone', description: 'A small black stone wafer from the older wheel beneath Wren’s Mill. Its marks predate the mill and have no known practical use.', category: 'artifact', carryable: true, inventoryClass: 'RELIC' },
};

const relicIds = new Set(['bronzeMaskFragment', 'graveCoin', 'signalLens', 'yewCharm']);

// Legacy definitions receive a one-time explicit class at catalog load; future items
// should set inventoryClass directly so exceptions are visible in the item record.
for (const item of Object.values(ITEMS)) {
  item.inventoryClass ??= item.stackLimit ? 'SUPPLY'
    : relicIds.has(item.id) ? 'RELIC'
      : item.carryable || item.id === 'smallKnife' || item.id === 'lantern' ? 'GEAR'
        : 'TEMPORARY';
}

/** A migration-safe class for every catalog entry; explicit item metadata wins. */
export function inventoryClass(itemId: string): InventoryClass {
  return ITEMS[itemId]?.inventoryClass ?? 'TEMPORARY';
}

export function itemsOfClass(itemClass: InventoryClass): Item[] {
  return Object.values(ITEMS).filter((item) => inventoryClass(item.id) === itemClass);
}

export const STARTING_ITEMS = ['smallKnife', 'lantern'];
