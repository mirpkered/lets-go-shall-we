# Persistent Item Roster

`src/items.ts` is the source of truth for item IDs, names, descriptions, and carryability. This page inventories its **44 carryable items** to support authoring and reduce duplication. Starting Small Knife and Lantern are not carryable. Local keys, clues, and temporary objects are run-only and are not listed here.

“Useful in” describes a plausible capability/theme, not a guaranteed bonus or a promise that every named scenario currently checks that item. Scenario requirements and tests define actual interactions. Items do not stack generic bonuses.

| ID | Player-facing name | Distinct function | Useful in | Use / overlap note |
|---|---|---|---|---|
| `brassCandlestick` | Brass Candlestick | Heavy improvised weapon | Close danger, blunt leverage | Reusable; overlaps only with other blunt tools/weapons where physically suitable. |
| `bronzeMaskFragment` | Bronze Mask Fragment | Mysterious, atmospheric relic | Strange or supernatural scenes | Reusable; intentionally narrow/uncertain, not a universal detector. |
| `graveCoin` | Grave Coin | Valuable trade token | Bargaining, ferries, collectors | Reusable until spent; overlaps currency only in specific fiction. |
| `yewCharm` | Yew Charm | Small protective keepsake with narrow story meaning | Folklore/supernatural scenes | Reusable; not a general protection stat. |
| `pocketToolkit` | Pocket Toolkit | Pliers, driver, punch, and oil for compact repairs | Railway/mechanical work | Reusable; not a heavy pry tool or universal repair kit. |
| `travelRope` | Travel Rope | Braided line with locking hook | Rescue, hauling, securing, climbing | Reusable; access, anchor, reach, and load still matter. |
| `conductorWhistle` | Conductor’s Whistle | Loud signal over machinery/weather | Rail or distant signaling | Reusable; does not guarantee anyone hears or responds. |
| `signalLens` | Crimson Signal Lens | Red glass with an unusual warmth | Rail signals / narrow artifact callbacks | Reusable; atmospheric, not a universal clue reader. |
| `ratCatchersHook` | Rat-Catcher’s Hook | Reach and shift debris without entering a dark space | Farm work, confined spaces | Reusable; distinct from a pry bar or weapon. |
| `heavyLeatherGloves` | Heavy Leather Gloves | Protect hands from rough surfaces and heat | Farm, repair, rescue | Reusable; not medical protection or unlimited heat safety. |
| `minerHeadlamp` | Miner’s Headlamp | Hands-free focused light | Dark mines, passages, repair | Reusable; lighting improves sight only. |
| `foremanMultiTool` | Foreman’s Multi-tool | Folding tool for small repairs | Road, wagon, machinery | Reusable; overlaps compact repair tools; avoid stacking indistinct bonuses. |
| `foldingPryTool` | Folding Pry Tool | Careful leverage in tight spaces | Latches, small obstructions | Reusable; not heavy structural lifting. |
| `brassRoomKey` | Brass Room Key | Keepsake key with worn number | Inns, doors, recognition | Reusable; only opens a lock when that lock is established as matching. |
| `dealerCardKnife` | Dealer’s Card Knife | Fine blade for cards, cord, careful cutting | Gambling/table scenes, light utility | Reusable; distinct from a general weapon. |
| `foldingCardMirror` | Folding Card Mirror | View into tight spaces | Inspection, narrow sight lines | Reusable; needs light/angle and cannot reveal hidden facts magically. |
| `bridgewrightHammer` | Bridgewright’s Hammer | Controlled setting of pegs and small repairs | Bridges, timber, repair work | Reusable; overlaps ordinary hammer only where scale fits. |
| `ironRopeClamp` | Iron Rope Clamp | Secure line when wet knots are unreliable | Wet rescues, rigging | Reusable; complements rope, does not replace an anchor. |
| `weatherproofCloak` | Weatherproof Cloak | Shed rain and wind | Travel, exposure, cold weather | Reusable; does not make dangerous water or severe cold safe. |
| `trailCompass` | Trail Compass | Maintain direction in poor visibility | Navigation, fog, open country | Reusable; does not identify a destination or route by itself. |
| `waxedCanvasSheet` | Waxed Canvas Sheet | Temporary cover and rough patch | Camp, rain, cargo, simple repairs | Reusable; not a rigid brace or permanent repair. |
| `compactStoveTool` | Compact Stove Tool | Adjust latches, stove plates, stubborn fittings | Cabin/stove scenes | Reusable; distinct from a general toolkit through stove access. |
| `compactBlockAndTackle` | Compact Block-and-Tackle | Pulley leverage for heavy loads in tight spaces | Hoisting, controlled load movement | Reusable; requires sound anchor and suitable line. |
| `icehouseTongs` | Icehouse Tongs | Move awkward objects without placing hands beneath them | Ice, hot/cold awkward objects | Reusable; reach and grip limits remain. |
| `brassBottleOpener` | Brass Bottle Opener | Open bottles; narrow end can pry a small cover/latch | Domestic, small latch scenes | Reusable; not a general pry bar. |
| `drainageHook` | Drainage Hook | Reach behind grates and shift debris | Culverts, drains, waterworks | Reusable; distinct long reach, not a lifting tool. |
| `steelWedge` | Steel Wedge | Hold a brace, door, or loose structure in place | Repair, stabilization | Reusable; does not create structural support by itself. |
| `roadmansLantern` | Roadman’s Lantern | Shuttered flame resists wet air | Night travel, road work | Reusable; distinct from the starting lantern by weather reliability. |
| `smokeHood` | Smoke Hood | Treated cloth buys clearer breathing in smoke/dust | Smoke, fire, dusty work | Reusable as authored; limited protection, not a guarantee. |
| `fireBeater` | Fire Beater | Press out small ground fires from a safer distance | Brush/grass fires | Reusable; not for structural fires or close indoor flames. |
| `trailWhistle` | Trail Whistle | Sharp call across rough country | Companions, outdoor signaling | Reusable; distinct from the conductor’s louder railway-oriented whistle. |
| `weatherproofBlanket` | Weatherproof Blanket | Wool warmth with waxed rain-shedding exterior | Cold, wet travel and shelter | Reusable; overlaps other blankets by stronger wet-weather use. |
| `compactWheelWrench` | Compact Wheel Wrench | Wheel hubs, bolts, and field repairs | Carts, wagons, road travel | Reusable; specific to wheel hardware. |
| `foldingTrailMarker` | Folding Trail Marker | Mark a route visibly | Navigation, backtracking prevention | Reusable; placing it may leave it behind if the story says so. |
| `freightmansStrap` | Freightman’s Strap | Secure awkward loads | Cargo, wagons, hauling | Reusable; overlaps rope but binds loads rather than providing long reach. |
| `assayersLoupe` | Assayer’s Loupe | Inspect fine marks and small details | Trade, ownership, close inspection | Reusable; reveals only details physically present and visible. |
| `farmWhistle` | Farm Whistle | Call livestock/farmhands with a low clear tone | Farm and animal scenes | Reusable; does not guarantee an animal response. |
| `gateHook` | Gate Hook | Lift latches and draw wire clear of a gate | Farms, fences, livestock | Reusable; specific to reachable gate/wire mechanisms. |
| `windproofMatchCase` | Windproof Match Case | Keep a few matches dry | Camp, fire, wet travel | Reusable container; matches inside may be consumed by authored actions. |
| `woolTravelBlanket` | Wool Travel Blanket | Compact insulation on a cold road | Camp, cold, overnight stays | Reusable; overlaps weatherproof blanket, but prioritizes warmth over rain shedding. |
| `fieldBandageRoll` | Field Bandage Roll | Clean gauze for basic roadside first aid | Human first aid | Consumable when the scenario says so; not a universal veterinary treatment. |
| `roadsideSignalMirror` | Roadside Signal Mirror | Aim a reflected signal across open country | Rescue, distant communication | Reusable; needs sun/line of sight and does not guarantee response. |
| `foundPocketWatch` | Silver Pocket Watch | Working watch with former owner’s name | Timekeeping, provenance callbacks | Reusable; recognizable ownership may matter; no generic time bonus. |
| `joinersFoldingRule` | Joiner’s Folding Rule | Measure and lay out simple work | Carpentry, repairs, property disputes | Reusable; supports careful measurement, not surveying-grade precision. |

Before adding another carryable, check for a narrow capability already represented above. Prefer money, knowledge, history, or a narrative reward when another tool would overlap without adding a distinct future use.
