# Equipment Evolution and Item Audit

This is an internal authoring/audit record, not a player-facing gear score. The item registry remains [`src/items.ts`](../src/items.ts); the 44-row role/overlap roster is [`ITEMS.md`](ITEMS.md).

## Canonical behavior

- Persistent items are `NORMAL`, `DAMAGED`, or `BROKEN`. Old saves with no item-state record resolve to `NORMAL` with no upgrades.
- No passive wear or numeric durability exists. Apply damage/breakage only when an authored event explicitly puts that item under unusual strain and narrates the state change. A first damaging event moves NORMAL to DAMAGED; a later damaging event may break it. Explicit `breakItems` is reserved for clearly severe events.
- DAMAGED gear remains usable unless a scene says otherwise. BROKEN gear remains owned and visible, but does not satisfy `usableItems`/`anyUsableItems` requirements or provide item-based odds bonuses. A repair must be authored in a plausible place; no universal repair button exists in normal play.
- Named upgrades alter a specific capability, keep the stable item ID, and never use another carry slot. Compatible upgrades may coexist up to the item's authored cap; same-group upgrades replace. No item is automatically removed, downgraded, or replaced. Replacement/disposal must be explicit.
- Item state follows the same item ID through carried inventory and the five-place Bank. Banked state survives character loss; unbanked state is lost on death, abandonment, or retirement. Ending reward placement uses the existing carry/Bank/decline flow.
- Meaningful changes to gear retained by a surviving traveler count toward traveler completion progression. Run-only item changes do not. QA activity remains isolated and gives no progression.

## Implemented pilot

| Item | Authored use references* | Upgrade / condition implementation | Overlap and obsolescence review |
|---|---:|---|---|
| `brassCandlestick` | 43 / 17 modules | No upgrade candidate. No authored wear event; not a durable tool. | Improvised weapon/leverage has narrow reach; overlaps only with suitable blunt tools. Active. |
| `bronzeMaskFragment` | 42 / 1 | No wear/repair/upgrade; mysterious relic, not ordinary equipment. | Deliberately atmospheric and narrow; no obsolescence. |
| `graveCoin` | 7 / 2 | No upgrade or condition; value is spent through fiction. | Trade/collector niche, distinct from ordinary money. Active. |
| `yewCharm` | 6 / 2 | No generic protective upgrade or damage. | Narrow folklore callback; not a stat item. Active. |
| `pocketToolkit` | 39 / 20 | No current damage/repair or upgrade source. | Compact adjustments/repairs; not heavy leverage. Active, some overlap with multi-tools by scale. |
| `travelRope` | 141 / 35 | `Spliced hook eye` upgrade, earned from the harness maker and improves the runaway-team line check. A failed bridge handline strains it (NORMAL→DAMAGED; a later authored strain may break it); the harness maker can repair it. | Strongly used; complements clamp/strap, does not replace anchors. Active. |
| `conductorWhistle` | 13 / 9 | No condition or upgrade. | Railway/distant signaling niche; distinct from the trail whistle. Active. |
| `signalLens` | 12 / 2 | No wear or upgrade; artifact recognition only. | Narrow rail/supernatural callbacks. Active. |
| `ratCatchersHook` | 40 / 17 | No current condition/upgrade source. | Reach tool for debris; overlaps hooks only where reach and task fit. Active. |
| `heavyLeatherGloves` | 95 / 29 | No authored damage/upgrade source in this pass. | Protects hands, not health/medical treatment. Active and widely relevant. |
| `minerHeadlamp` | 51 / 18 | No authored condition/upgrade source. | Hands-free light; overlaps lantern only in illumination, not weather/hand availability. Active. |
| `foremanMultiTool` | 43 / 21 | No authored condition/upgrade source. | Small repairs; avoid stacking with toolkit/hammer without distinct use. Active. |
| `foldingPryTool` | 38 / 15 | No authored condition/upgrade source. | Fine leverage, not structural lifting. Active. |
| `brassRoomKey` | 3 / 2 | No repair/upgrade. | Recognition/lock callback only; keep the lock explicitly matched. Active. |
| `dealerCardKnife` | 6 / 2 | No condition/upgrade; light cutting use only. | Fine blade, not a general weapon. Active. |
| `foldingCardMirror` | 7 / 4 | No condition/upgrade. | Inspection at a tight angle; cannot reveal hidden information. Active. |
| `bridgewrightHammer` | 22 / 16 | No authored condition/upgrade source. | Peg-setting/small repair role; ordinary hammer overlap is fiction-dependent. Active. |
| `ironRopeClamp` | 49 / 16 | No wear/upgrade; retain as an accessory to a sound line. | Complements rather than replaces rope or anchor. Active. |
| `weatherproofCloak` | 26 / 14 | No authored condition/upgrade source. | Rain/wind protection; not a substitute for safe water crossing. Active. |
| `trailCompass` | 17 / 6 | No condition/upgrade. | Direction, not destination-finding; distinct from route markers. Active. |
| `waxedCanvasSheet` | 13 / 6 | No authored condition/upgrade source. | Temporary cover/patch, not a rigid brace. Active. |
| `compactStoveTool` | 6 / 4 | No authored condition/upgrade source. | Stove/latch-specific access; not an all-purpose toolkit. Active but niche. |
| `compactBlockAndTackle` | 16 / 5 | No authored condition/upgrade source. | Heavy-load leverage needs sound anchor/line; distinct from a hand rope. Active. |
| `icehouseTongs` | 9 / 3 | No authored condition/upgrade source. | Reach to move awkward objects; not a universal gripping tool. Active. |
| `brassBottleOpener` | 7 / 4 | No authored condition/upgrade source. | Bottle/small-latch use only; not a pry bar. Active. |
| `drainageHook` | 12 / 5 | No authored condition/upgrade source. | Long reach behind grates; distinct from short hooks. Active. |
| `steelWedge` | 18 / 8 | No authored condition/upgrade source. | Holds a prepared brace; does not create one. Active. |
| `roadmansLantern` | 10 / 4 | No authored condition/upgrade source. | Weather-resistant portable light; distinct from starting lantern. Active. |
| `smokeHood` | 13 / 3 | No authored condition/upgrade source. | Limited smoke/dust protection; no universal fire safety. Active. |
| `fireBeater` | 6 / 2 | No authored condition/upgrade source. | Ground fire tool only, not structural fire response. Active. |
| `trailWhistle` | 13 / 10 | No condition/upgrade. | Outdoor companion signal; distinct from conductor's whistle. Active. |
| `weatherproofBlanket` | 15 / 8 | No authored condition/upgrade source. | Warmth plus rain shedding; overlaps wool blanket with a different emphasis. Active. |
| `compactWheelWrench` | 6 / 4 | No authored condition/upgrade source. | Wheel hardware/field repair, not general repairs. Active. |
| `foldingTrailMarker` | 10 / 4 | No wear/upgrade; may be left at a location only when narrated. | Route marking, not direction-finding. Active. |
| `freightmansStrap` | 50 / 17 | `Reinforced buckle stitching` upgrade; earned at the harness maker. It is visibly strained when it bears a cart brace in The Broken Harness; repairable there if damaged/broken. | Binds loads; overlaps rope only for load securing, not reach. Active. |
| `assayersLoupe` | 10 / 5 | No wear/upgrade. | Fine marks only; no truth/ownership detector. Active. |
| `farmWhistle` | 22 / 10 | No condition/upgrade. | Low farm call; animal response is never guaranteed. Active. |
| `gateHook` | 11 / 4 | No authored condition/upgrade source. | Reachable gate/wire latches; not a pry bar. Active. |
| `windproofMatchCase` | 8 / 2 | Case stays persistent; contents may be consumed only by authored choices. | Container, distinct from a fuel source. Active. |
| `woolTravelBlanket` | 17 / 7 | No authored condition/upgrade source. | Warmth first; overlaps weatherproof blanket without replacing it. Active. |
| `fieldBandageRoll` | 37 / 12 | Consumable use remains an explicit story effect; do not model ordinary use as durability. | Human first aid, not universal veterinary medicine. Active. |
| `roadsideSignalMirror` | 11 / 6 | No condition/upgrade. | Sun/line-of-sight signal; no guaranteed response. Active. |
| `foundPocketWatch` | 3 / 2 | No generic timing bonus, condition, or upgrade. | Provenance/recognition callbacks; active. |
| `joinersFoldingRule` | 14 / 3 | No condition/upgrade. | Careful layout, not surveying-grade precision. Active. |

\*Counts are literal item-ID references in non-test files under `src/scenarios/`, not a count of unique reachable choices. The module count is approximate for batched files, which can contain several adventures; it is a concentration signal, not a claim that each reference is a distinct gameplay use. No current item is marked obsolete or removed.

## Next audit opportunities

Keep the pilot small. Broaden damage only where a scenario puts a specific persistent item under unusual load and can show it. Prefer a repair scene in an already plausible workshop or service stop. Before adding another upgrade, ensure its provenance, authored acquisition, visible condition, functional advantage, capacity behavior, and save/Bank behavior all have tests. Reassess the highest-reference tools for distinct, actually reachable uses rather than granting them generic bonuses.

