# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint reconciled by stable Adventure ID: 460 current registered Adventures reviewed; 401 of 861 remain.
Next: position 461, The Claimed Salvage (`the-claimed-salvage`; `src/scenarios/gearCorrectiveBatch.ts`); next finding ID `CRA-F0184`; next available cluster ID `CRA-C0008`.

## Current checkpoint

The canonical registry order is the live `SCENARIOS` array in `src/scenarios/index.ts`. This checkpoint has been reconciled against that array by stable ID. All 460 completed semantic reviews remain preserved; their original recorded positions were not uniformly aligned with the live registry. Historical batch headings retain the originally recorded ranges, while position cells in their tables show current live positions. Focused suites were supporting evidence only. No scenario source or gameplay test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 266 |
| MINOR CONCERN | 33 |
| CONFIRMED DEFECT | 161 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed current registered Adventures | 460 |

There are 183 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. The per-finding severity distribution is preserved in the JSON ledger. Historical batches remain documented below; positions 441–450 added eight findings (all MEDIUM), while the latest batch 451–460 was healthy throughout and added no findings.

## Registry position reconciliation

The JSON ledger is stable-ID-first: every reviewed Adventure has its current live registry position plus its pre-reconciliation position and delta. Of 460 recorded entries, 458 matched current stable IDs directly; two legacy IDs were resolved one-to-one by exact display title and the same source file, with the prior IDs retained as aliases. There are no duplicate reviewed identities or unresolved orphan reviews.

Position drift is nonuniform. Positions 1–120 matched directly. Recorded positions 121–345 map +4 to live positions; recorded positions 346–418 map +12. The two legacy October IDs resolve at current positions 176–177. These are checkpoint bookkeeping omissions/stale position labels; the gameplay source snapshot did not change from `cba101f0feba09c67543f942331ca38f765ebe14`.

The highest contiguous reviewed position is now 460. The formerly unreviewed positions 358–359 were reviewed, positions 360–372 were skipped because their stable IDs were already reviewed, and positions 373–460 were then reviewed in live-registry order. There are no gaps through position 460. The next unreviewed Adventure is position 461, The Claimed Salvage (`the-claimed-salvage`); 401 current registered Adventures remain.

## Audit batch (originally recorded positions 21–30; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 21 | The Man in the Ditch | HEALTHY | — |
| 22 | The Burning Loft | HEALTHY | — |
| 23 | Under the Ice | HEALTHY | — |
| 24 | The Borrowed Horse | MINOR CONCERN | — |
| 25 | A Seat by the Fire | HEALTHY | — |
| 26 | The Sound in the Well | CONFIRMED DEFECT | CRA-F0014 — optional farmhands are asserted at the rim after a climb-out route that did not summon them. |
| 27 | The Broken Wheel | HEALTHY | — |
| 28 | Three Miles to Rain | HEALTHY | — |
| 29 | The Empty Wagon | HEALTHY | — |
| 30 | The Bell After Midnight | CONFIRMED DEFECT | CRA-F0015 — shared safe ending says straw was soaked after routes that only move the stablehand or carry the lantern clear. |

## Audit batch (originally recorded positions 31–40; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 31 | One Horse Short | MINOR CONCERN | — |
| 32 | The Missing Boat | CONFIRMED DEFECT | CRA-F0017 — self-guided rescues converge on text claiming the ferry crew checks the line. |
| 33 | After the Storm | HEALTHY | — |
| 34 | The Last Ferry | MINOR CONCERN | — |
| 35 | The Fallen Tree | HEALTHY | — |
| 36 | The Loose Team | HEALTHY | — |
| 37 | The Washout | HEALTHY | — |
| 38 | Poison the Well | CONFIRMED DEFECT | CRA-F0018 — wrong-source variants claim the well was closed after only the barrel was set aside. |
| 39 | Finders Keepers | HEALTHY | — |
| 40 | Only One Bullet | HEALTHY | — |

The timing concern in One Horse Short is not counted as a defect because the scene transition may abstract the travel time. In The Last Ferry, the far-bank travelers’ farmhouse location is under-described on the direct overnight route, but the initial setup does not rule out their already being there. In The Washout, “let team work” follows an explicit statement that the cart needs separate recovery and reasonably delegates that work; the route is not counted as a defect.

The Borrowed Horse concern is deliberately not counted as confirmed: the “walk to the farm and bring help back” choice transitions directly to a stable ending that says the mare is returned. The omitted physical handling is compressed, but the choice can reasonably imply the help-assisted return; current evidence does not establish a contradiction firmly enough to register a finding.

## Audit batch (originally recorded positions 41–50; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 41 | The Blue Hole | CONFIRMED DEFECT | CRA-F0016 — withdrawing from an active drowning emergency reaches a quiet ending that erases the unresolved swimmer. |
| 42 | Silent Night? | HEALTHY | — |
| 43 | Bear with Me | HEALTHY | — |
| 44 | Give Me Whatcha Got | HEALTHY | — |
| 45 | The Long Drive | HEALTHY | — |
| 46 | Fence Line | HEALTHY | — |
| 47 | Harvest Hand | HEALTHY | — |
| 48 | Freight to Miller’s Fork | HEALTHY | — |
| 49 | A Roof Before Rain | HEALTHY | — |
| 50 | Night Watch | HEALTHY | — |

The Blue Hole witness is `drowningEmergency → firstSwim → turnBackEarly/floatInPlace → quietRest`: the scene says the swimmer is still calling for help, while the ending says no great event occurred. The same first-swim convergence also loses the minor calf-cramp variant; both are manifestations of one unresolved-event state being dropped.

## Audit batch (originally recorded positions 51–60; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 51 | Unload Before Dark | HEALTHY | — |
| 52 | The Mill Job | HEALTHY | — |
| 53 | Cutting Timber | HEALTHY | — |
| 54 | The Delivery Run | HEALTHY | — |
| 55 | Payment in Kind | HEALTHY | — |
| 56 | Short on the Wages | HEALTHY | — |
| 57 | Market Day | HEALTHY | — |
| 58 | The Horse Trade | HEALTHY | — |
| 59 | The Broken Crate | HEALTHY | — |
| 60 | Half Now | HEALTHY | — |

For positions 51–54, the shared work builder’s quiet/complication selection, rushed/early exits, careful/tool/help choices, success/failure outcomes, payment, and knowledge/history effects were compared with each job’s specific facts. Positions 55–60 were traced through their distinct purchase, wage-dispute, appraisal, damage-witness, and advance/scope branches. In particular, negotiation success/failure and the prior advance in Half Now were checked cumulatively; each ending’s claimed settlement matches its route effects. No new confirmed semantic defect was established.

## Audit batch (originally recorded positions 61–70; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 61 | Somebody Else’s Land | HEALTHY | — |
| 62 | The Pawned Tool | CONFIRMED DEFECT | CRA-F0019 — the hold-for-claim ending invents a missing brass hinge pin despite the setup saying the hinge moves freely. |
| 63 | Last Room, Higher Price | HEALTHY | — |
| 64 | Who Owns the Mule? | HEALTHY | — |
| 65 | The Town Pump | HEALTHY | — |
| 66 | One Boat, Too Many People | HEALTHY | — |
| 67 | The Meeting Hall | MINOR CONCERN | — |
| 68 | What Did You See? | HEALTHY | — |
| 69 | The Burnt Barn Fund | HEALTHY | — |
| 70 | Winter Stores | HEALTHY | — |

The Meeting Hall minor concern is a narrow duration mismatch: `heardAccounts.offerLimitedHelp` costs 30 minutes, but the shared `sharedLabor` ending says the Traveler lends an hour. The direct one-hour offer also reaches that ending. No larger route-state or outcome contradiction was established. In The Pawned Tool, both routes to `heldForClaim` preserve the rule’s described state; the shared ending nevertheless requires a claimant to describe a missing hinge pin, contrary to the opening’s freely moving brass hinge. This is registered as CRA-F0019 in the existing object/state-at-convergence cluster.

## Audit batch (originally recorded positions 71–80; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 71 | The Road Crew | CONFIRMED DEFECT | CRA-F0020 — four tool-use choices accept broken gear because they check ownership only. |
| 72 | A Place to Bury Him | HEALTHY | — |
| 73 | The Stray Fire | HEALTHY | — |
| 74 | The Closed Road | HEALTHY | — |
| 75 | The Faint Trail | HEALTHY | — |
| 76 | Camp Before Dark | HEALTHY | — |
| 77 | The Shortcut | HEALTHY | — |
| 78 | Creek on the Return | CONFIRMED DEFECT | CRA-F0021 — rope crossings accept a broken rope. |
| 79 | The Fog Comes Down | CONFIRMED DEFECT | CRA-F0022 — setting a lantern guarantees an unestablished traveler response and shared travel. |
| 80 | Dry Camp | CONFIRMED DEFECT | CRA-F0023 — a broken trail marker can be selected to mark the spring route. |

The gear-use findings share CRA-C0004. Engine requirements establish the distinction: `items` checks inventory inclusion, whereas `usableItems` also rejects an item whose condition is `BROKEN`. The Road Crew’s rope option correctly includes a usability gate, but its four other gear-use options do not. The Creek crossing’s two rope-use choices and Dry Camp’s marker-placement choice likewise omit that gate. CRA-F0022 is separately grouped with route-specific participant state: `foggyTrack.signalLantern` reaches `heardTravelers` without establishing that anyone is present or answers.

## Audit batch (originally recorded positions 81–90; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 81 | The Ridge or the Valley | CONFIRMED DEFECT | CRA-F0024 — a broken Signal Mirror can establish a successful signal and reply. |
| 82 | Marks on the Trail | CONFIRMED DEFECT | CRA-F0025 — one post-inspection marker-placement route accepts a broken marker. |
| 83 | A Night of Wind | HEALTHY | — |
| 84 | The Second Sunset | CONFIRMED DEFECT | CRA-F0026 — after-dark travel and blanket warmth accept broken gear. |
| 85 | The Stray Horse | HEALTHY | — |
| 86 | The Calf in the Mud | CONFIRMED DEFECT | CRA-F0027 — a broken rope can be used in the calf rescue attempt. |
| 87 | The Dog That Returns | CONFIRMED DEFECT | CRA-F0028 — the “nothing” variant reaches an ending importing absent people/objects and interventions. |
| 88 | The Broken Harness | HEALTHY | — |
| 89 | Loose in the Market | HEALTHY | — |
| 90 | The Ownerless Mule | CONFIRMED DEFECT | CRA-F0029 — direct stable-arrival success claims unestablished ownership claimants. |

CRA-F0024–CRA-F0027 extend CRA-C0004: physical Gear use is sometimes guarded by ownership (`items`/`anyItems`) instead of usability. The reviewed routes were distinguished from inspections and chance bonuses that the engine already filters by item condition. CRA-F0028 and CRA-F0029 extend CRA-C0001: selected variants/routes converge on text importing participants, objects, or interventions not established by that route. Position 83’s apparently unguarded rope retie is only reachable after a usable-rope gate; its failed attempt does not change the rope’s condition, so a BROKEN-rope retie route is unreachable in the authored flow.

## Audit batch (originally recorded positions 91–100; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 91 | The Injured Dog | HEALTHY | — |
| 92 | The Frightened Team | HEALTHY | — |
| 93 | The Bee Yard | CONFIRMED DEFECT | CRA-F0030 — hive-stand stabilization accepts a broken tool. |
| 94 | The Old Horse | MINOR CONCERN | — |
| 95 | Market Afternoon | HEALTHY | — |
| 96 | Gone Fishing | CONFIRMED DEFECT | CRA-F0031 — the Knowledge entry claims the creek bend’s name was shared, but the displayed answer gives only a geographic description. |
| 97 | The County Fair | HEALTHY | — |
| 98 | A Game of Cards | HEALTHY | — |
| 99 | The Swimming Hole | CONFIRMED DEFECT | CRA-F0032 — the “nothing found” variant still permits and records a keepsake. |
| 100 | Supper with Strangers | HEALTHY | — |

The Old Horse wording is retained as a minor concern: the terms scene says the horse “will still cost three coins” immediately before presenting work in exchange, while that route takes time and no money. CRA-F0030 is another use-versus-ownership Gear gate in CRA-C0004. CRA-F0031 joins CRA-C0002 because an explicit Knowledge claim is more specific than what the route’s visible dialogue supplies. CRA-F0032 joins CRA-C0001 because the selected “nothing” state does not constrain the available object-taking action or its shared result/history.

## Audit batch (originally recorded positions 101–110; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 101 | The Music Outside | HEALTHY | — |
| 102 | The Old Man’s Story | HEALTHY | — |
| 103 | A Good Night’s Sleep | HEALTHY | — |
| 104 | Skipping Stones | HEALTHY | — |
| 105 | The Injured Traveler | HEALTHY | — |
| 106 | That’s My Horse | HEALTHY | — |
| 107 | The Empty Purse | HEALTHY | — |
| 108 | A Very Good Deal | HEALTHY | — |
| 109 | The Broken Promise | HEALTHY | — |
| 110 | The Landlord’s Story | HEALTHY | — |

## Audit batch (originally recorded positions 111–120; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 111 | The Missing Sack | CONFIRMED DEFECT | CRA-F0033 — the shared account ending claims a resolution without route evidence. |
| 112 | A Borrowed Coat | HEALTHY | — |
| 113 | The False Guide | HEALTHY | — |
| 114 | The Debt at Supper | HEALTHY | — |
| 115 | The Lantern in the Marsh | MINOR CONCERN | Worker flags are set broadly, but current rendered outcomes guard them by the selected truth. |
| 116 | The House That Knocks | HEALTHY | — |
| 117 | The Grave Bell | CONFIRMED DEFECT | CRA-F0034 — ordinary bell causes still grant Knowledge that a keepsake reacted. |
| 118 | The Passenger Who Wasn’t There | HEALTHY | — |
| 119 | The Cold Room | CONFIRMED DEFECT | CRA-F0035 — direct stay inherits an innkeeper promise from a bypassed conversation. |
| 120 | The Voice in the Mine | MINOR CONCERN | The worker-encounter flag is set for non-worker explanations, but current text also checks the selected explanation. |

The Missing Sack’s `sendWordToStop` and roadside carter inquiry reach the resolution without a returned result; even some returned replies leave the sack missing, while the shared ending states it was found, left at another stop, or never loaded. The Grave Bell’s relic action records a generic reaction Knowledge fact for every cause although three ordinary variants explicitly say the coin did not change or the charm stayed slack. The Cold Room’s direct-stay route bypasses the innkeeper discussion but reaches an ending that reports a carpenter was promised. These are findings CRA-F0033–CRA-F0035. The two flag concerns in the Marsh and Mine are not counted as confirmed because current text variants also require the matching truth selection, preventing a false rendered claim.

The dispute routes preserve evidentiary limits: suspected theft stays unproven, a horse ownership claim stays unresolved, loupe condition is distinct from seller authority, and partial testimony does not become a ruling on the full agreement. Payment, purchase, and meal effects are gated and applied on their corresponding routes. Listening/memory and withdrawal paths do not gain facts that were not heard.

## Audit batch (originally recorded positions 121–130; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 125 | The Long Night | HEALTHY | — |
| 126 | The Doctor Is Three Miles Away | HEALTHY | — |
| 127 | When the Baby Comes | HEALTHY | — |
| 128 | The Red Flag | CONFIRMED DEFECT | CRA-F0036 — quiet-room monitoring reports a doctor-informed status without establishing contact. |
| 129 | The Telegram | HEALTHY | — |
| 130 | The Wrong Letter | HEALTHY | — |
| 131 | The Second Message | HEALTHY | — |
| 132 | Wire Down | HEALTHY | — |
| 133 | The Last Train Message | HEALTHY | — |
| 134 | Property Of... | MINOR CONCERN | The worker’s stated view shifts in the final limited-account outcome without an earlier explicit inference. |

The medical routes keep company/support separate from clinical treatment. In The Red Flag, the separate/watch outcome says the inn “keeps the doctor informed,” but that route does not send for or otherwise contact a doctor; only the separate doctor route explicitly sends a rider. This is CRA-F0036, a low-severity unsupported communication assertion. The five communication scenarios preserve message privacy, distinguish sender verification from content, and keep delivery/receipt outcomes route-specific. Property Of... protects the ownership uncertainty; its final accountRecorded wording (“stops treating that single act as proof”) implies an earlier inference by the worker that was not clearly stated, retained as a minor characterization-transition concern.

## Audit batch (originally recorded positions 131–140; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 135 | To the Magistrate | HEALTHY | — |
| 136 | The Warrant | HEALTHY | — |
| 137 | The Will | HEALTHY | — |
| 138 | Home Before Dark | HEALTHY | — |
| 139 | The Visitor | HEALTHY | — |
| 140 | The Back Door | CONFIRMED DEFECT | CRA-F0037 — the private-room departure route asserts an aunt destination established only in a different branch. |
| 141 | The Wake | HEALTHY | — |
| 142 | The Church Supper | HEALTHY | — |
| 143 | The Old Burial Ground | HEALTHY | — |
| 144 | At the Forge | HEALTHY | — |

The Back Door’s `privacy` branch establishes the trusted aunt as a destination. The separate `shelter` branch establishes only a private room and the resident’s choice to leave by the rear lane or wait until dawn, yet `shelter.leave` sends them to the aunt’s home. That route-specific, safety-sensitive destination leak is CRA-F0037 (MEDIUM, CRA-C0001). The legal, family, religious/community and craft routes otherwise keep decisions, payments, privacy, authority and work outcomes bounded by their selected paths.

## Audit batch (originally recorded positions 141–150; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 145 | The Morning Edition | HEALTHY | — |
| 146 | Hold Still | HEALTHY | — |
| 147 | The Undertaker’s Request | HEALTHY | — |
| 148 | The Watchmaker | HEALTHY | — |
| 149 | Before the Steamer Leaves | HEALTHY | — |
| 150 | The Missing Crate | HEALTHY | — |
| 151 | Locked Through | HEALTHY | — |
| 152 | At the Landing | HEALTHY | — |
| 153 | First Snow | HEALTHY | — |
| 154 | The Thaw | HEALTHY | — |

The specialized-trade routes preserve the editor’s authority over publication, distinguish an exposed/covered plate from a finished print, keep family decisions with the sister, and separate the watch’s maker from its owner and repair status. River-commerce outcomes keep counts, cargo identity, boarding decisions, and paid work tied to evidence or the actor with authority; the steamer baggage flow distinguishes verification, owner identification, and deferred checking. The two seasonal routes limit claims to what the traveler or farmer actually does: the boards support only foot/handcart travel, the cloak changes the traveler’s exposure rather than creek conditions, and the light snow remains a manageable inconvenience. No additional confirmed defects were identified.

## Audit batch (originally recorded positions 151–160; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 155 | Before the Frost | MINOR CONCERN | Work-to-dusk outcome tracks only 20 minutes and remains pre-dusk; exact timing is unspecified. |
| 156 | New Year’s Eve | HEALTHY | — |
| 157 | The Traveling Players | HEALTHY | — |
| 158 | The Miracle Tonic | HEALTHY | — |
| 159 | Three Rounds | HEALTHY | — |
| 160 | Dance Until Midnight | HEALTHY | — |
| 161 | The Speaker | HEALTHY | — |
| 162 | You Must Be the New Man | HEALTHY | — |
| 163 | That’s Him | HEALTHY | — |
| 164 | We Were Expecting Someone Else | HEALTHY | — |

The remaining seasonal stories preserve partial work and choice-specific rewards. Before the Frost has a minor timing-model concern: its gather action advances 20 minutes, but the full-harvest result says the work continues until light fades; the phase remains pre-dusk, and the source does not establish an exact sunset interval. The entertainment routes keep performer arrival, audience expectations, medical claims, consent, and the limits of the wind instrument explicit; The Speaker’s second demonstration gives the Traveler a direct explanatory/comparison choice. The first three mistaken-identity stories do not convert an assumption into a job, payment obligation, accusation, or repair; the actual clerk, repairer, or account check is only stated on the corresponding route. No additional confirmed defects were identified.

## Audit batch (originally recorded positions 161–170; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 165 | The Package | HEALTHY | — |
| 166 | Collection Day | HEALTHY | — |
| 167 | Out by Sundown | HEALTHY | — |
| 168 | The Mule Is Mine | MINOR CONCERN | `muleCareAgreed` is set but not consumed beyond the resulting scene. |
| 169 | The Sealed Crate | HEALTHY | — |
| 170 | Find Her | MINOR CONCERN | Search/errand reward terms are unclear on routes that return no address. |
| 171 | Dear Mary | HEALTHY | — |
| 172 | The Locket | HEALTHY | — |
| 173 | Supper for Two | HEALTHY | — |
| 174 | The Children’s Court | HEALTHY | — |

The parcel, employment, and small human stories keep custody, authority, privacy, and consent tied to their selected routes. Collection Day’s incoming coin is carried back to the shopkeeper while the one-coin effect corresponds to the stated errand wage; the mule stays in its pen while the debt is disputed. The Mule Is Mine has a redundant route flag, and Find Her leaves compensation unclear on unsuccessful/no-address routes; both are minor concerns, not confirmed semantic defects. The sealed-crate payment follows delivery. The Locket records a return only after recognition of its distinctive flower, while a single initial remains inconclusive. No additional confirmed defects were identified.

## Audit batch (originally recorded positions 171–180; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 175 | Still Waiting | HEALTHY | — |
| 176 | The Jack-o’-Lantern Contest | HEALTHY | — |
| 177 | All Hallows at the Boarding House | HEALTHY | — |
| 178 | The Masked Visitor | HEALTHY | — |
| 179 | The Halloween Dare | HEALTHY | — |
| 180 | The Scarecrow Changes Fields | CONFIRMED DEFECT | CRA-F0038 (MEDIUM) — observation-only routes inherit the farmhand’s admission/agreement and may record it as Knowledge. |
| 181 | The Harvest Mask | HEALTHY | — |
| 182 | The Witch at Miller’s Ford | HEALTHY | — |
| 183 | The Man in the Corn | HEALTHY | — |
| 184 | The Coffin Maker’s Extra Order | CONFIRMED DEFECT | CRA-F0039 (HIGH) — shared closure attributes the anonymous threat to the tailor without route proof. |

In The Scarecrow Changes Fields, `watchAfterDark -> inspectPeg -> scarecrowChoice` does not speak with the farmhand, yet the shared scene says the farmhand admitted moving the scarecrow and the follow-up says the farmhand agreed to notify the farmer. The `keepWatching` route also grants Knowledge that the farmhand moved it without an interview. These route-specific person/action and Knowledge facts are established only by the interview path (CRA-F0038, MEDIUM).

In The Coffin Maker’s Extra Order, returning payment or bringing the maker together reaches closure that says the tailor must answer, without establishing the tailor’s involvement. Preserving the order proves handwriting/delivery and a prior business connection only; the route that confronts the tailor and reaches the former partner establishes the measurements-for-intimidation explanation. Shared closure also records that culpability as Knowledge. The unproved attribution is CRA-F0039 (HIGH). October affinity, second-wave, and content-depth supporting suites passed (28 tests across three files); these tests do not replace the route traces.

## Audit batch (originally recorded positions 181–190; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 185 | The Skeleton in the Wagon | CONFIRMED DEFECT | CRA-F0040 (MEDIUM) — convergence invents a lot-number handoff and written shipment account on routes that did not inspect or record them. |
| 186 | The Headless Rider | MINOR CONCERN | Keeper-fetch/turn flags are written but not reflected in later route outcomes. |
| 187 | The Last House before the Woods | CONFIRMED DEFECT | CRA-F0041 (LOW) — common Knowledge identifies the caller as a stranger even when unseen. |
| 188 | The Séance at Bellweather House | CONFIRMED DEFECT | CRA-F0042 (MEDIUM) — shared ending claims a written answer, witnessed voice, and fee recovery across incompatible routes. |
| 189 | The Red Chalk Circle | CONFIRMED DEFECT | CRA-F0043 (HIGH) — boundary-escape route claims Orin is out without finding or rescuing him. |
| 190 | The Man Who Sleeps in the Graveyard | HEALTHY | — |
| 191 | The Widow’s Mirror | CONFIRMED DEFECT | CRA-F0044 (LOW) — shared ending asserts the glazier dismantles the mirror without that service being selected. |
| 192 | The Bone Box | HEALTHY | — |
| 193 | The Lantern at the Crossing | CONFIRMED DEFECT | CRA-F0045 (MEDIUM) — Spirit Glass reveal is available with a BROKEN Lantern. |
| 194 | The Quiet Room | HEALTHY | — |

The Skeleton in the Wagon’s shared settlement says the teacher takes the lot number back to school and gives the passerby a written shipment account even when the player only covers the crate or braces the axle without inspecting or recording the tag (CRA-F0040, MEDIUM). In The Headless Rider, the hood/lantern explanation and injury/horse/brother outcomes remain route-specific; the unused keeper-fetch and turn flags leave a minor action-feedback concern.

The Last House before the Woods unconditionally grants Knowledge that a stranger called from beyond the fence. On barred-door/shutter routes, the caller remains unidentified; only the caller-seen/fled variants establish a stranger (CRA-F0041, LOW). The Séance at Bellweather House funnels routes that never heard the voice or wrote down its answer into an ending that says the family keeps a written answer, the voice remains a shared account, and part of the fee is recovered. Those are route-specific discoveries/actions (CRA-F0042, MEDIUM).

In The Red Chalk Circle, a retreat or successful struggle at the disturbed boundary reaches `chalkAfter` without visiting the crawlspace, but the shared text says Orin is out (CRA-F0043, HIGH). The Widow’s Mirror uses a common ending claiming the glazier dismantles the mirror even after a simple carry-out or cover route that never requests the service (CRA-F0044, LOW). The Bone Box’s current post-definition variants truthfully distinguish burning and keeping the map; leaving the closed box to the broker leaves later custody to the broker. The Lantern at the Crossing checks that the Lantern owns Spirit Glass but not that the item is usable; engine requirements treat `itemUpgrades` separately from condition, so a BROKEN Lantern still exposes the clue (CRA-F0045, MEDIUM). The Quiet Room’s current post-definition patch correctly separates sealing the hatch from leaving before dawn.

## Audit batch (originally recorded positions 191–200; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 195 | The House with Two Cellars | CONFIRMED DEFECT | CRA-F0046 (MEDIUM) — common ending says jar names were copied even when the player never inspected them. |
| 196 | The Black Thread | CONFIRMED DEFECT | CRA-F0047 (MEDIUM) — shared resolution says the tailor opened the storeroom and threads were cut on routes that never did so. |
| 197 | The Medium Who Knows Too Much | CONFIRMED DEFECT | CRA-F0048 (MEDIUM) — paid-reading challenge can refund the same coin twice. |
| 198 | The Thing Under the Floorboards | MINOR CONCERN | Ending identifies the underfloor presence as the old owner’s remains without route proof. |
| 199 | The Candle That Will Not Go Out | HEALTHY | — |
| 200 | The Book Without a Title | CONFIRMED DEFECT | CRA-F0049 (MEDIUM) — ending says the printer copied a mark on routes that never examined it. |
| 201 | The Voice in the Well | CONFIRMED DEFECT | CRA-F0050 (HIGH) — departure/retreat inherits the mason’s cap and speaking-tube discovery. |
| 202 | The Empty Coffin | CONFIRMED DEFECT | CRA-F0051 (HIGH) — bypass routes claim the living cooper’s deception was solved. |
| 203 | The Man Who Came Back Wrong | CONFIRMED DEFECT | CRA-F0052 (MEDIUM) — shared ending imports sluice and footprint discoveries into bypass routes. |
| 204 | Hanging Charms | HEALTHY | — |

The House with Two Cellars always says the jar labels were copied, even when the player stays above, fastens the arch without recording names, or retreats after the skeleton appears; only the `readJarNames` route copies them (CRA-F0046, MEDIUM). In The Black Thread, `threadAfter` says the tailor opens his storeroom and the group cuts the strands together even after routes that leave the street or only tell neighbors; this is an incompatible shared resolution (CRA-F0047, MEDIUM).

The Medium Who Knows Too Much charges one coin, then applies a one-coin refund on `askSource` and another on the gated `acceptRefund`, yielding a net gain of one coin for a single fee (CRA-F0048, MEDIUM). This is a distinct compensation-accounting pattern, recorded as new cluster CRA-C0005. The Thing Under the Floorboards’ old-owner identity is not established by the current route; because it may be intended but lacks explicit evidence, it remains a minor concern rather than a confirmed finding.

The Book Without a Title’s common ending says the printer copies the repeated mark even when the Traveler closes the book or stops reading before inspecting/copying its margins (CRA-F0049, MEDIUM). The Voice in the Well sends direct leave and haul-back routes to text where a mason has capped the well and found a speaking tube, although those routes never call him or inspect the wall (CRA-F0050, HIGH). The Empty Coffin’s close/delay and avoid-accusation routes claim the missing-body cause is known despite never finding the living cooper in the side room (CRA-F0051, HIGH). The Man Who Came Back Wrong likewise says the miller sealed the drain and reports the second footprint set after routes that never inspect the sluice (CRA-F0052, MEDIUM). The patched Candle and Hanging Charms endings preserve their distinct leave, closure, entry, and inspection outcomes.

## Audit batch (originally recorded positions 201–210; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 205 | The Third Knock | HEALTHY | — |
| 206 | The Wrong Shadow | CONFIRMED DEFECT | CRA-F0053 (MEDIUM) — shared ending includes a lamplighter who was absent; CRA-F0054 (LOW) — Lantern use lacks a usable-item gate. |
| 207 | The Red Chapel | HEALTHY | — |
| 208 | The Man Who Wouldn’t Stay Dead | HEALTHY | — |
| 209 | Below the Old Fort | CONFIRMED DEFECT | CRA-F0055 (MEDIUM) — ending claims a copied route plan on routes that never found it; CRA-F0056 (LOW) — silvered knife use lacks a usable-item gate. |
| 210 | The Barrow Door | HEALTHY | — |
| 211 | The Hollow Man | CONFIRMED DEFECT | CRA-F0057 (LOW) — broken smallKnife still enables bone removal. |
| 212 | The Borrowed Face | MINOR CONCERN | Final text assumes a mirror/glazier follow-up even on dismissal without a mirror scene. |
| 213 | The Doorway with No Room | CONFIRMED DEFECT | CRA-F0058 (MEDIUM) — default seal/withdraw ending claims a second opening and builder measurements not established on those routes. |
| 214 | The Last Candle in the House | HEALTHY | — |

The Third Knock keeps its letter states and delivery choices distinct: the name is established before the player can carry it, and the sealed letter can be burned, left, returned at dawn, or delivered. The Wrong Shadow’s shared ending says both the lamplighter and Traveler saw the turn and that the lamplighter reached the crowded street even when the Traveler left or tested the shadow without calling him (CRA-F0053, MEDIUM). Its `testShadowLight` choice also physically uses the starting Lantern without requiring it to be usable (CRA-F0054, LOW).

The Red Chapel retains the route-specific Salt/Chalk interruption, trapped-participant movement, and retreat outcomes. In Below the Old Fort, the common resolution claims a copied route plan even from barracks/lamp/guard routes that never enter the powder room, where the plan is found (CRA-F0055, MEDIUM). The separate silvered-edge action checks the smallKnife upgrade but not whether the knife is usable (CRA-F0056, LOW). The Man Who Wouldn’t Stay Dead keeps its marker/stake evidence and retreat/failure outcomes bounded; the Barrow Door’s patched variants distinguish the son returned, left inside, outside call, and never-entered states.

The Hollow Man’s optional bone-removal action checks only knife ownership, so a BROKEN smallKnife can still perform the physical action (CRA-F0057, LOW); its other endings do not claim the missing worker was found. The Borrowed Face’s common ending assumes an inn mirror was covered and left for glazier inspection even on the direct dismissal route; because the inn could plausibly contain an unmentioned mirror, this remains a minor concern. The Doorway with No Room’s patches distinguish opening the far door and turning back, but the default ending still claims both openings were bricked in and builder measurements confirmed the impossible corridor on direct seal and threshold-measure/leave routes (CRA-F0058, MEDIUM). The Last Candle in the House’s current variants preserve waiting outside, inspection, and snuffing without inspection.

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** the complete membership is authoritative in the JSON ledger’s CRA-C0001 `findingIds` array. This cluster includes CRA-F0160–CRA-F0164. During checkpoint reconciliation, CRA-F0152, CRA-F0153, CRA-F0154, CRA-F0156, CRA-F0157, CRA-F0158, and CRA-F0159 were moved in the cluster index from CRA-C0006 to CRA-C0001 to match their unchanged finding records and audit notes; finding IDs, classifications, finding text, and semantic history were not changed.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004, CRA-F0031, CRA-F0034, CRA-F0041.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.
- **CRA-C0004 — Gear ownership treated as Gear usability:** CRA-F0020, CRA-F0021, CRA-F0023–CRA-F0027, CRA-F0030, CRA-F0045, CRA-F0054, CRA-F0056–CRA-F0057.
- **CRA-C0005 — A single fee can be refunded more than once:** CRA-F0048; an intermediate refund and follow-up refund both apply money effects for the same paid reading.
- **CRA-C0006 — Generic frontier archetypes promise unsupported actors or action outcomes:** CRA-F0128–CRA-F0137 and CRA-F0143–CRA-F0149. The seven corrected entries are not members of this Frontier-builder cluster.
- **CRA-C0007 — NPC consensus inferred from a unilateral route choice:** CRA-F0151 and CRA-F0155.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Audit continuation (live positions 421–430)

After correcting the cluster index to agree with each existing finding record, the consistency check passed. Continued in live `SCENARIOS` order from the first unreviewed stable ID. Procedural-comedy routes were traced through materially distinct choices, converged endings, object/privacy/plan outcomes, payments, and leave or unresolved results. No persistent Knowledge/History, rewards, or save-resume variants appeared in these ten graphs. Comedy, anthology, reward-correction, and registry suites passed 29 tests across four files as supporting evidence; route review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 421 | The Paper Mill Parade | CONFIRMED DEFECT | CRA-F0160 (MEDIUM) — the private-welcome route converges on large public lettering and a public wave. |
| 422 | The Mayor’s Missing Gavel | CONFIRMED DEFECT | CRA-F0161 (MEDIUM) — the labor ending says the gavel was returned to a drawer on routes that never returned it. |
| 423 | The Milkman and the Moon | HEALTHY | — |
| 424 | The Court of the Courtyard | HEALTHY | — |
| 425 | The Drying Room Schedule | HEALTHY | — |
| 426 | The Sheep-Counting Exam | HEALTHY | — |
| 427 | The Pearl Button | HEALTHY | — |
| 428 | The Wagon-Wheel Meeting | CONFIRMED DEFECT | CRA-F0162 (LOW) — the clear-lane route reaches an ending that claims an inspection location was agreed. |
| 429 | The Ferryman’s Sign | CONFIRMED DEFECT | CRA-F0163 (MEDIUM), CRA-F0164 (MEDIUM) — safety explanation claims the sign changed; a request for the ferryman to mark a path becomes a Traveler escort/cloth marker. |
| 430 | The Backwards Courtroom | HEALTHY | — |

These findings extend CRA-C0001; no new cluster was justified. The ledger now covers 430/861 Adventures (251 HEALTHY, 33 MINOR CONCERN, 146 CONFIRMED DEFECT, zero NEEDS MANUAL REVIEW) and contains 164 finding records. The next live position is 431, The Misplaced Pigeonhole (`the-misplaced-pigeonhole`), with 431 Adventures remaining and next finding ID CRA-F0165. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. The After the Storm and Washout-focused suites passed: 11 tests across 3 files. Inventory and scenario-registry validation passed: 16 tests across 2 files, including the 861-Adventure registry assertion. The Honest Work shared-builder suite passed: 12 tests. Batch 51–60 suites (`honestWorkBatch.test.ts` and `commerceBatch.test.ts`) passed: 27 tests across 2 files. Batch 61–70 Commerce and Community suites passed: 29 tests across 2 files. Batch 71–80 Community/Wilderness plus Gear-condition suites passed: 37 tests across 3 files. Batch 81–90 Wilderness, Animals, and Gear-condition suites passed: 35 tests across 3 files. Batch 91–100 animal and pleasant-day suites passed: 19 tests across 2 files. Batch 101–110 pleasant-day and dispute suites passed: 15 tests across 2 files. Batch 111–120 Disputes and Strange Roads suites passed: 23 tests across 2 files. Batch 121–130 second-wave, registry, and diversity suites passed: 20 tests across 3 files. Batch 131–140 second-wave, domestic payoff, and content-depth suites passed: 16 tests across 3 files. These tests support, but do not substitute for, source route review. No gameplay repairs, test changes, deployment, or scheduler changes were made. Checkpoints are committed locally; remote fetch/push is unavailable in this environment. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.

Batch 141–150 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, and `riverWaterWorkGenreBatch.test.ts`) passed: 24 tests across 3 files. These graph/reachability and related content checks support, but do not replace the route-level source review.

Batch 151–160 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, `compensationAccountingC2.test.ts`, and `qaContentCorrections.test.ts`) passed: 36 tests across 4 files. No gameplay source or tests were changed.

Batch 171–180 supporting suites (`octoberAffinityBatch.test.ts`, `secondWaveBatch.test.ts`, and `contentDepth.test.ts`) passed: 28 tests across 3 files. These support, but do not replace, the route-level source review. No gameplay source or tests were changed.

Batch 181–190 supporting suites (`octoberAffinityBatch.test.ts`, `occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `scenarioRegistryValidation.test.ts`) passed: 57 tests across 4 files. They support, but do not replace, the route-level source review. No gameplay source or tests were changed.

Batch 191–200 supporting suites (`occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `scenarioRegistryValidation.test.ts`) passed: 44 tests across 3 files. They support, but do not replace, the route-level source review. The root-cause cluster pointer was advanced to CRA-C0006 after adding CRA-C0005; no established cluster was renumbered. No gameplay source or tests were changed.

Batch 201–210 supporting suites (`occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `equipment.test.ts`) passed: 52 tests across 3 files. Scenario registry validation was rerun separately; checks support, but do not replace, the route-level source review. No gameplay source or tests were changed.

## Audit batch (originally recorded positions 211–220; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 215 | The Pass Before Snow | CONFIRMED DEFECT | CRA-F0059 (MEDIUM) — the shared rescue ending claims a signal was answered after a route that only crawls to shelter. |
| 216 | No Water at Miller’s Spring | CONFIRMED DEFECT | CRA-F0060 (MEDIUM) — a successful basin dig converges into text locating the seep in a different place. |
| 217 | The Broken Axle | CONFIRMED DEFECT | CRA-F0061 (LOW) — a successful rush-to-town route is praised as un-rushed. |
| 218 | Across the Floodplain | CONFIRMED DEFECT | CRA-F0062 (MEDIUM) — guarding the cart reaches a rescue ending that says the Traveler signaled. |
| 219 | The Cave Before the Storm | HEALTHY | — |
| 220 | The Lost Survey Party | CONFIRMED DEFECT | CRA-F0063 (MEDIUM) — refusal/retreat outcomes claim unmade search marks. |
| 221 | Three Days to the Railhead | HEALTHY | — |
| 222 | Whiteout | HEALTHY | — |
| 223 | The Last Rope | CONFIRMED DEFECT | CRA-F0064 (MEDIUM) — successful direct lowering inherits rope loss/strain; CRA-F0065 (LOW) — fetching a crew is narrated as calling one. |
| 224 | The Empty Cabin | HEALTHY | — |

The Pass Before Snow’s crawl-and-wait option and gear-gated downhill signal converge on `passRescue`, whose unconditional “Your signal is answered” only fits the latter (CRA-F0059). No Water at Miller’s Spring routes a successful dig at the old basin into `springSeep`, whose location text instead places the water below a branch in the shaded fold (CRA-F0060). In The Broken Axle, the successful `forceBrokenWagon` branch explicitly chooses to drive before dark, but the shared settlement praises the Traveler for not rushing (CRA-F0061). Across the Floodplain routes “Keep the family and cart on the rise” to a rescue ending that says the crew arrived after a signal, although that branch takes no signaling action (CRA-F0062).

The Lost Survey Party’s refusal and slope-retreat routes enter `surveyDelay`, which claims clear marks were left at both camp and slope; only the creek-avoidance route actually marks a place (CRA-F0063). The Last Rope has two independent route facts lost in convergence: the successful direct lowering route keeps an undamaged rope, while `porterUp` says it remains behind or took strain; and retreating to fetch a crew reaches `ravineWait`, which says the crew followed a call (CRA-F0064/F0065). The Cave Before the Storm, Three Days to the Railhead, Whiteout, and The Empty Cabin retain route-appropriate knowledge, item/participant state, consequences, and endings. Supporting Survival Expedition suite passed: 11 tests in one file, including exhaustive fresh-character route/chance exploration and selected gear branches; the separate registry release validation passed 3 tests and confirmed the 861-entry registry. Tests support but do not replace the source review.

## Audit batch (originally recorded positions 221–230; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 225 | The Long Way Around | HEALTHY | — |
| 226 | River without a Bridge | CONFIRMED DEFECT | CRA-F0066 (MEDIUM) — a successful crossing is described as a safe route marked for others, though no branch marks it and one branch is a hazardous ford. |
| 227 | Night on the Ridge | HEALTHY | — |
| 228 | The Markers Stop | HEALTHY | — |
| 229 | The Ice Gives Warning | CONFIRMED DEFECT | CRA-F0067 (MEDIUM) — solo failure invents a rope rescue; CRA-F0068 (MEDIUM) — “leave the cart” later says it arrives. |
| 230 | The Washed-Out Cut | MINOR CONCERN | No-contact wait can reach a repair-crew ending; the explicit wait choice makes this plausible but the alert path is unstated. |
| 231 | The Wrong Valley | HEALTHY | — |
| 232 | The Rocks Start Moving | HEALTHY | — |
| 233 | The Tree across the Creek | HEALTHY | — |
| 234 | The Abandoned Camp | CONFIRMED DEFECT | CRA-F0069 (LOW) — the silent return route reaches a shared ending that reports no answer to a call. |

River without a Bridge’s successful crossings converge on text saying a safe way has been found and marked for travelers behind, despite no route marking action and despite direct-current fording being an explicitly hazardous alternative (CRA-F0066). In The Ice Gives Warning, a failed solo crossing reaches an ending that introduces an unestablished rope rescue; a separate “leave the cart” route also shares an ending claiming the cart arrives later without any recovery or transport action (CRA-F0067/F0068). In The Abandoned Camp, returning from the stream without calling reaches `campAnswer`, which says no one answers from the ridge or stream (CRA-F0069); taking food also leads to an automatic note-writing aftermath, retained as a lesser player-agency concern. The Washed-Out Cut’s direct wait-for-crew route lacks a shown alert, but the option itself frames the crew as expected, so the ambiguity remains minor rather than a confirmed defect. The other six routesets retain their route-specific time, participant, Gear, Knowledge, location, and consequence distinctions. The Survival Expedition support suite passed 11 tests; it checks exhaustive route/chance reachability but is not a substitute for semantic review.

## Audit batch (originally recorded positions 231–240; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 235 | The Wind Changes | HEALTHY | — |
| 236 | The Load Must Go | CONFIRMED DEFECT | CRA-F0070 (MEDIUM) — the wagon-slip scene contradicts which load was left safe; CRA-F0071 (MEDIUM) — walking the driver out is narrated as bringing the medicine chest and listing cargo. |
| 237 | Hold until Morning | HEALTHY | — |
| 238 | The Christmas Goose | HEALTHY | — |
| 239 | The Last Parcel Before Christmas | CONFIRMED DEFECT | CRA-F0072 (MEDIUM) — an ambiguous address clue grants Knowledge asserting a specific intended recipient/location. |
| 240 | A Place at the Table | HEALTHY | — |
| 241 | Carolers at Wrong House | HEALTHY | — |
| 242 | Christmas Tree on Miller’s Hill | CONFIRMED DEFECT | CRA-F0073 (LOW) — a clean-fall route reaches text asserting split branches were cut. |
| 243 | Gift with No Name | HEALTHY | — |
| 244 | Christmas at Station | CONFIRMED DEFECT | CRA-F0074 (MEDIUM) — a shared ending grants History claiming station-helping participation after routes that leave or do not help. |

In The Load Must Go, `unloadOil`/`unloadBedding` each establish that the chosen load is safely shelved, but the later shared failure says both the barrel split and bedding soaked. Its `saveDriverLoad` route evacuates only the driver while the ending additionally claims the medicine chest arrived and left cargo was listed (CRA-F0070/F0071). The Last Parcel Before Christmas turns an explicitly ambiguous clerk recollection into persistent Knowledge of Nell’s intended bridge-side address, although the route later establishes she is staying with her aunt at the mill (CRA-F0072). Christmas Tree on Miller’s Hill’s clean-fall branch reaches square-arrival wording that says split branches were cut; only rough-fall cleanup establishes that (CRA-F0073). Christmas at Station unconditionally grants History that the Traveler spent the night helping passengers at the station, including routes where they leave by carter or walk to a farmhouse and routes that only wait or ride (CRA-F0074). A passive telegraph report in the coal-saving branch was retained as a minor concern, not a separate confirmed defect. Other batch routes retained truthful state and consequence distinctions. The combined Christmas affinity, Survival Expedition, and registry suites passed: 32 tests across 3 files. These tests support, but do not replace, route-level source review. No gameplay source or tests were changed.

Batch 231–240 added five findings, with no new CRA cluster required. Totals are now 157 HEALTHY, 15 MINOR CONCERN, and 68 CONFIRMED DEFECT across 240 reviewed Adventures; 621 remain. The next canonical registry entry is position 241, The Missing Stocking, and the next finding ID is CRA-F0075.

## Audit batch (originally recorded positions 241–250; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 245 | The Missing Stocking | CONFIRMED DEFECT | CRA-F0075 (LOW) — the quiet-return route is shown as if the brother confessed after the player chose not to hear his explanation. |
| 246 | The Toymaker’s Last Order | HEALTHY | — |
| 247 | The Pageant Problem | CONFIRMED DEFECT | CRA-F0076 (LOW) — shared rehearsal text asserts mutually exclusive substitute/returning-child states. |
| 248 | The Stranger’s Christmas Dinner | HEALTHY | — |
| 249 | Three Gifts, Two Labels | HEALTHY | — |
| 250 | The Christmas Visitor | HEALTHY | — |
| 251 | The Empty Chair at Midnight | HEALTHY | — |
| 252 | The Evergreen Door | HEALTHY | — |
| 253 | The Gift That Came Back | HEALTHY | — |
| 254 | The Snowbound Inn | HEALTHY | — |

In The Missing Stocking, `quietReturn` from the stable sets `stockingFound` and enters the reunion variant, which says the brother admits moving the stocking as a joke. The preceding stable scene only says he offers to explain; the player selected the alternative to avoid the public explanation, and no subsequent route state or scene establishes that he confesses privately (CRA-F0075). In The Pageant Problem, the common rehearsal prose asserts both a substitute innkeeper and a returning child regardless of branch. It therefore contradicts the prop-only path, Traveler substitution, sibling substitution, and child-return routes; the later performance variants do correctly distinguish the participant routes (CRA-F0076). The remaining eight Adventures preserve the important route distinctions: tool-repair versus simpler toy completion and delay; anonymous-donor uncertainty and correctly gated extra-bowl payment; gift-giver confirmation before parcel assignment; visitor claims versus letter proof; unresolved napkin mystery; cellar descent versus daylight/neighbor plans; family ownership decisions about the wooden bird; and paired/solo search, failure, and dawn discovery at the snowbound inn. The Christmas affinity and registry suites passed 21 tests across 2 files; these checks support but do not replace the source review. No gameplay source or tests were changed.

Batch 241–250 added two LOW-severity findings to CRA-C0001; no new cluster was required. Totals are now 165 HEALTHY, 15 MINOR CONCERN, and 70 CONFIRMED DEFECT across 250 reviewed Adventures; 611 remain. The next registry entry is position 251, Footprints around the House, and the next finding ID is CRA-F0077.

Batch 161–170 used the same four supporting suites: 36 tests passed across 4 files. These checks support, but do not replace, route-level source review.

## Audit batch (originally recorded positions 251–260; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 255 | Footprints around the House | HEALTHY | — |
| 256 | The Red Scarf in the Snow | HEALTHY | — |
| 257 | The Empty Sleigh | HEALTHY | — |
| 258 | The House with the Warm Window | HEALTHY | — |
| 259 | The Frozen Letter | CONFIRMED DEFECT | CRA-F0077 (MEDIUM) — the sealed-letter route grants Knowledge that the letter is not urgent without learning its contents. |
| 260 | The Longest Night | HEALTHY | — |
| 261 | The Ice Lanterns | HEALTHY | — |
| 262 | The Widow’s Firewood | CONFIRMED DEFECT | CRA-F0078 (MEDIUM) — accepting only the neighbor’s own wood still claims the miller’s logs were returned. |
| 263 | The Road under Snow | HEALTHY | — |
| 264 | The Frozen Millwheel | CONFIRMED DEFECT | CRA-F0079 (MEDIUM) — a gate-bracing success reaches the repaired-wheel outcome without route proof that the bearing was warmed. |

The Frozen Letter’s `mill.secureLetter` branch keeps the letter sealed but grants Knowledge that it is not an emergency warning. That conclusion appears only on the separate `askMiller` → `letterContext` route (CRA-F0077). In The Widow’s Firewood, `acceptOwnWood` joins the same settlement as `correctTheft`; only the latter separates and returns the miller’s logs, yet both settlement and ending claim they were returned (CRA-F0078). The Frozen Millwheel’s failed sluice-handle route can succeed by bracing the gate and having the miller close it, then reach `wheelFreed` without establishing bearing heat; the result, History, and payoff describe the full warmed-bearing/pressure-eased repair (CRA-F0079). The other seven Adventures keep route evidence and consequence distinctions coherent across their search, travel, rescue, refusal, object, and persistence paths. The Christmas affinity and registry suites passed 21 tests across 2 files; these checks support but do not replace the route-level review. No gameplay source or tests were changed.

Batch 251–260 added three MEDIUM findings to existing clusters; no new cluster was required. Totals are now 172 HEALTHY, 15 MINOR CONCERN, and 73 CONFIRMED DEFECT across 260 reviewed Adventures; 601 remain. The next registry entry is position 261, The Visitor at Midnight, and the next finding ID is CRA-F0080.

## Audit batch (originally recorded positions 261–270; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 265 | The Visitor at Midnight | CONFIRMED DEFECT | CRA-F0080 (MEDIUM) — the shelter route establishes a visitor is present, but the shared ending reopens whether anyone stood at the door. |
| 266 | The Bridge Goes Down | CONFIRMED DEFECT | CRA-F0081 (HIGH) — calling the driver to abandon the wagon sets rescue proof and enables text claiming he reached shore. |
| 267 | Smoke over Main Street | HEALTHY | — |
| 268 | The Train That Didn’t Stop | CONFIRMED DEFECT | CRA-F0082 (MEDIUM) — running alongside is credited with clearing the track and averting collision. |
| 269 | The Mine Gives Way | HEALTHY | — |
| 270 | Water Through the Door | HEALTHY | — |
| 271 | The Boiler Room | CONFIRMED DEFECT | CRA-F0083 (HIGH) — un-warned worker routes reach an ending that says workers were counted outside. |
| 272 | The Crowd Breaks | CONFIRMED DEFECT | CRA-F0084 (LOW) — a passive wait after failed crowd control grants History credit for guiding the crowd. |
| 273 | The Ferry Lists | HEALTHY | — |
| 274 | The Roof Comes In | CONFIRMED DEFECT | CRA-F0085 (MEDIUM) — bracing the wall alone reaches text claiming the visible pair are already outside. |

The Visitor at Midnight retains the uncertainty about identity and the missing tracks, but the `offerSafeShelter` route explicitly places the visitor in the outer room until the watch arrives; `midnightEnd` nevertheless questions whether anyone stood at the door (CRA-F0080). In The Bridge Goes Down, `childAcross.callFather` only calls the driver to abandon the wagon but sets `bridgePeopleSaved`, enabling the finale to say the driver reached shore; `muleSaved.muleCallDriver` repeats the unsupported proof (CRA-F0081). In The Train That Didn’t Stop, the `runAlongside` option enters `platformClear` without warning or clearing effects, yet the shared scene and later History/ending credit track clearance and collision prevention (CRA-F0082). The Boiler Room’s `tellForeman`/`inspectValve` routes bypass worker evacuation, while the foreman scene explicitly conditions workers being outside on the player having warned them; the shared aftermath/end still says workers are counted outside (CRA-F0083). The Crowd Breaks’ failed stand-call followed by `fallStayWall` only waits for stewards to act, but the later report grants History for helping guide the crowd (CRA-F0084). The Roof Comes In’s direct `braceNorth` branch reaches `wallBraced`, which unconditionally claims the visible pair are already outside even though only `eastPair` performs that evacuation (CRA-F0085). The other four Adventures preserve their rescue, object, and outcome distinctions across the reviewed routes.

Batch 261–270 added six findings to existing CRA-C0001/C0002 patterns; no new cluster was needed. Totals are now 176 HEALTHY, 15 MINOR CONCERN, and 79 CONFIRMED DEFECT across 270 reviewed Adventures; 591 remain. CRA-F0080–CRA-F0085 comprise two HIGH, three MEDIUM, and one LOW finding. The Christmas affinity, disaster state-aware, and registry suites passed 25 tests across 3 files; these checks support but do not replace the source review. No gameplay source or tests were changed. The next registry entry is position 271, The Powder Wagon, and the next finding ID is CRA-F0086.

## Audit batch (originally recorded positions 271–280; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 275 | The Powder Wagon | HEALTHY | — |
| 276 | After the Tornado | CONFIRMED DEFECT | CRA-F0086 (MEDIUM) — checking the cow’s gate sets the “moved” proof and makes the ending say it is safe. |
| 277 | The Second Wave | HEALTHY | — |
| 278 | Wanted in Red Creek | HEALTHY | — |
| 279 | The Man at the End of the Bar | CONFIRMED DEFECT | CRA-F0087 (MEDIUM) — exit routes that never hear from a clerk still say the clerk corrected the accusation. |
| 280 | The Stage Was Hit | CONFIRMED DEFECT | CRA-F0088 (MEDIUM) — the coach party is said to travel under escort even when no town help was summoned. |
| 281 | The Bounty Poster | HEALTHY | — |
| 282 | The Empty Jail | CONFIRMED DEFECT | CRA-F0089 (LOW) — waiting without contacting anyone reaches text asserting a clerk reviewed the charge book. |
| 283 | Three Men at the Water Trough | HEALTHY | — |
| 284 | The Rustled Herd | CONFIRMED DEFECT | CRA-F0090 (MEDIUM) — settlement combines market and holding-pasture counts when either source was not visited. |

After the stove is made safe in After the Tornado, the cow remains unresolved; choosing only to check its gate sets `tornadoCowMoved` and later counts it safe (CRA-F0086). The Man at the End of the Bar routes directly through the kitchen exit or a successful weapon diversion to `safeEnd` without contacting the clerk, but the ending says the clerk corrected the accusation (CRA-F0087). The Stage Was Hit permits waiting with survivors without warning town; the doctor/escort is conditional in the survivor scene but the ending makes escort unconditional (CRA-F0088). The Empty Jail’s wait-only route neither calls nor finds the clerk, yet `jailerBack` reports the clerk’s review and the wait scene refers to an unanswered call (CRA-F0089). The Rustled Herd can reach settlement from the brands alone, from market, or from the holding pasture, but settlement always combines the buyer’s twelve-calf receipt and the eighteen-cattle holding count (CRA-F0090). The other five Adventures preserve their route-specific knowledge, hazard control, rescue, suspicion, and animal/property outcomes.

Batch 271–280 added five findings to CRA-C0001; no new cluster was needed. Totals are now 181 HEALTHY, 15 MINOR CONCERN, and 84 CONFIRMED DEFECT across 280 reviewed Adventures; 581 remain. CRA-F0086–CRA-F0090 comprise four MEDIUM and one LOW finding. The disaster/western/registry suites passed 12 tests across 3 files; these checks support but do not replace source review. No gameplay source or tests were changed. The next registry entry is position 281, A Gun on the Table, and the next finding ID is CRA-F0091.

## Audit batch (originally recorded positions 281–290; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 285 | A Gun on the Table | CONFIRMED DEFECT | CRA-F0091 (MEDIUM) — routes that do not fetch the harvest book reach text asserting its repayment entry and a negotiated balance/date. |
| 286 | The Outlaw’s Mother | CONFIRMED DEFECT | CRA-F0092 (LOW) — handing the letter to the deputy grants History that family news was carried to the wanted son. |
| 287 | The False Deputy | HEALTHY | — |
| 288 | One Horse, Two Riders | HEALTHY | — |
| 289 | The Last Shot | CONFIRMED DEFECT | CRA-F0093 (LOW) — a retreat without signaling the rancher grants History credit for helping them leave. |
| 290 | The Map in the Ledger | CONFIRMED DEFECT | CRA-F0094 (LOW) — copying an unexplained map can end by naming its mark as a water gate. |
| 291 | The Town That Moved | HEALTHY | — |
| 292 | The Old Survey Stone | HEALTHY | — |
| 293 | The Sealed Mine Office | HEALTHY | — |
| 294 | The Room Behind the Chimney | CONFIRMED DEFECT | CRA-F0095 (MEDIUM) — partial or unexamined routes converge on claims that the family learned the room’s purpose and returned both objects. |

In A Gun on the Table, `distanceTalk` and the innkeeper’s `hallCall` both reach `book` without retrieving the harvest book, but that scene presents its eight-coin repayment entry as known. A successful grab-and-secure route bypasses the book yet reaches a settled ending that states the conditional four-coin balance and accepted date (CRA-F0091). The Outlaw’s Mother correctly gates delivery wording on `familyNewsDeliveredToSon`, but the separate `deputyLetter` choice grants History claiming family news was carried to the wanted son even though the letter was given to the deputy (CRA-F0092). In The Last Shot, `coverLeave` reaches retreat without signaling the rancher; the retreat scene says their safety depends on following a signal, but `retreatReport` still grants History credit for helping them leave (CRA-F0093). In The Map in the Ledger, copying the map or returning from the creek before reading the stone reaches an ending that identifies the mark as a water gate; that interpretation is established only by `stoneRecord` (CRA-F0094). The Room Behind the Chimney’s shared discovery claims both the purpose was learned and both objects were returned, although braced withdrawal learns no letter contents and retrieves nothing, while box and letter routes can return only one object (CRA-F0095). One Horse, Two Riders’ foot-follow branch permits the explicit `trackDoctor` action to take the stranger to the ranch house before the doctor-ending claim; other routes preserve the pouch/posse distinctions. The False Deputy preserves the distinction between reporting and escort, The Town That Moved’s discovery is supported by its visited marker/record routes, the Old Survey Stone’s calf-return claims remain correctly gated by `oldSurveyCalfReturned`, and the Sealed Mine Office uses route-specific variants to avoid importing private wage, notice, map, or drainage facts. Western outlaw, Lost Places, and registry suites passed 13 tests across 3 files. No gameplay source or tests were changed.

Batch 281–290 added five findings to existing CRA-C0001/C0002 patterns; no new cluster was required. Totals are now 186 HEALTHY, 15 MINOR CONCERN, and 89 CONFIRMED DEFECT across 290 reviewed Adventures; 571 remain. CRA-F0091–CRA-F0095 comprise two MEDIUM and three LOW findings. The western outlaw, Lost Places, and registry suites passed 13 tests across 3 files. No gameplay source or tests were changed. The next canonical registry entry is position 291, The Island When the Water Falls, and the next finding ID is CRA-F0096.

## Audit batch (originally recorded positions 291–300; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 295 | The Island When the Water Falls | CONFIRMED DEFECT | CRA-F0096 (LOW) — safe-bank/retreat routes conclude the island was a freight landing without visiting it. |
| 296 | The Forgotten Station | CONFIRMED DEFECT | CRA-F0097 (LOW) — discovery cites the book and chalk when the route did not inspect them. |
| 297 | The Cave with Worked Stone | HEALTHY | — |
| 298 | The Lost Payroll | HEALTHY | — |
| 299 | The House under the Hill | CONFIRMED DEFECT | CRA-F0098 (MEDIUM) — the ending supplies flood history and landholder closure after routes with no deed or landholder contact. |
| 300 | The Riverboat Cache | HEALTHY | — |
| 301 | The Last Room in the Fort | CONFIRMED DEFECT | CRA-F0099 (LOW) — a blankets-only inventory route still refers unidentified letters to the surgeon’s family. |
| 302 | The Thing at Black Creek | CONFIRMED DEFECT | CRA-F0100 (MEDIUM), CRA-F0101 (MEDIUM) — premature bear Knowledge; closure/participation attributed without sufficient route proof. |
| 303 | Teeth in the Mine | CONFIRMED DEFECT | CRA-F0102 (MEDIUM), CRA-F0103 (HIGH), CRA-F0104 (LOW) — a located miner becomes “not found,” a broken rope can complete rescue, and a trapped miner is implied to help carry the Traveler. |
| 304 | Something in the Corn | HEALTHY | — |

The Island When the Water Falls can end directly from waiting on the safe bank or reading the post without reaching the island, yet the ending definitively calls it a former freight landing (CRA-F0096). The Forgotten Station’s worker/account/crate routes converge on text crediting the book and chalk even when the player did not inspect both (CRA-F0097). The House under the Hill’s room-only retreat and upper-room exit assert a flood cause and landholder closure that those routes never establish (CRA-F0098). In The Last Room in the Fort, choosing to record blankets/cot only still leads to a county disposition of unidentified private letters (CRA-F0099). The Thing at Black Creek grants Knowledge before the keeper provides the claimed explanation (CRA-F0100), and multiple endings/history assert weir closure and farm protection without the necessary call or completed action (CRA-F0101). Teeth in the Mine resets one located miner to “not found” on withdrawal (CRA-F0102), accepts an owned-but-BROKEN rope for the rescue and related History (CRA-F0103), and after the brace failure says “the miners” drag the Traveler although the second miner remains trapped (CRA-F0104). The Cave with Worked Stone, Lost Payroll, Riverboat Cache, and Something in the Corn preserve their uncertainty, evidence, object custody, and outcome distinctions across the reviewed routes. Lost Places, Monster Hunt, and registry suites passed 19 tests across 3 files; graph/metadata tests support but do not replace source review. No gameplay source or tests were changed.

Batch 291–300 added nine findings to existing CRA-C0001/C0002/C0004 patterns; no new cluster was required. Totals are now 190 HEALTHY, 15 MINOR CONCERN, and 95 CONFIRMED DEFECT across 300 reviewed Adventures; 561 remain. CRA-F0096–CRA-F0104 comprise one HIGH, four MEDIUM, and four LOW findings. The Lost Places, Monster Hunt, and registry suites passed 19 tests across 3 files. No gameplay source or tests were changed. The next canonical registry entry is position 301, The Barrow Hound, and the next finding ID is CRA-F0105.

## Audit batch (originally recorded positions 301–310; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 305 | The Barrow Hound | CONFIRMED DEFECT | CRA-F0105 (LOW) — the marked-rim ending also claims the flock was moved to higher pasture. |
| 306 | The White Stag | CONFIRMED DEFECT | CRA-F0106 (MEDIUM) — shared closure says the farmer postponed the hunt and livestock caused crop loss on unresolved routes. |
| 307 | The Red-Eyed Boar | HEALTHY | — |
| 308 | The Bone-Eater | HEALTHY | — |
| 309 | The Lantern-Eater | CONFIRMED DEFECT | CRA-F0107 (LOW) — a route damages an exposed lantern, but successful-combat closure says it remains untouched while covered. |
| 310 | The Mire Horse | CONFIRMED DEFECT | CRA-F0108 (MEDIUM) — a mark-and-retreat route claims an unseen helper guides the Traveler and removes the false light. |
| 311 | The River Devil | CONFIRMED DEFECT | CRA-F0109 (MEDIUM) — Knowledge identifies a submerged log before the route probes beneath the dark water. |
| 312 | The Miller’s Beast | CONFIRMED DEFECT | CRA-F0110 (MEDIUM), CRA-F0111 (LOW) — Knowledge credits an unperformed wheel-stop; yard-guiding route says the badger exits via the culvert. |
| 313 | The Ashen Man | CONFIRMED DEFECT | CRA-F0112 (MEDIUM) — ember-only containment reaches text claiming the trapped worker is with family. |
| 314 | The Thing Beneath the Ice | CONFIRMED DEFECT | CRA-F0113 (MEDIUM) — a direct retreat route gains a sound-response conclusion without testing sound behavior. |

The Barrow Hound’s `markMound` route reaches an ending that also claims pasture relocation, which is only the separate `closePasture` outcome (CRA-F0105). The White Stag’s orchard-release and unresolved-hunter routes reach text that settles both farmer intent and the cause of crop damage without establishing either (CRA-F0106). In the Lantern-Eater, raising the lantern damages it before a successful strike reaches `campDawn`, whose text says it remained untouched while covered (CRA-F0107). The Mire Horse’s `markSkiff` route goes directly from evidence to `marshDeception` without meeting the helper, while the ending credits him with removing the light and guiding the Traveler (CRA-F0108). River Devil’s `inspectWater` grants the submerged-log conclusion before the later probe identifies the object (CRA-F0109). The Miller’s Beast grants stopping-wheel Knowledge on routes that leave the wheel turning, and its yard-guiding route shares an ending that says the badger exits by the culvert (CRA-F0110–F0111). In the Ashen Man, smothering the ember from the kiln interior does not free the worker, though the shared ending says the worker is safe with family (CRA-F0112). The Thing Beneath the Ice grants a specific sound-response conclusion on the direct retreat route that bypasses the sound-comparison scene (CRA-F0113).

The Red-Eyed Boar distinguishes opening the corridor from trap/charge outcomes; the Bone-Eater preserves observation, boundary, containment, and withdrawal variants. The current batch added six MEDIUM and three LOW findings to existing CRA-C0001 and CRA-C0002 patterns; no new cluster was required. Supporting Monster Hunt, Miller’s Beast F6, provenance, and registry tests passed (27 tests across four files); these support but do not replace the route review. No gameplay source or tests were changed. Totals are 192 HEALTHY, 15 MINOR CONCERN, and 103 CONFIRMED DEFECT across 310 reviewed Adventures; 551 remain. Next canonical registry entry: position 311, The Goat That Wouldn’t Stay Dead; next finding ID `CRA-F0114`.

## Audit batch (originally recorded positions 311–320; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 315 | The Goat That Wouldn’t Stay Dead | CONFIRMED DEFECT | CRA-F0114 (MEDIUM) — grave closure can credit the feed-tally explanation without visiting the ledger. |
| 316 | The Widow’s Beast | CONFIRMED DEFECT | CRA-F0115 (MEDIUM) — shared closure combines fence repair and stopping food even when routes establish only one or neither. |
| 317 | The Cellar Thing | CONFIRMED DEFECT | CRA-F0116 (HIGH) — fetching the keeper bypasses the seller rescue route but claims the seller reached the yard and the opening was boarded. |
| 318 | The Man Who Sheds His Skin | CONFIRMED DEFECT | CRA-F0117 (MEDIUM) — cousin contact is treated as proof of the tailor’s two-brother explanation. |
| 319 | The Pale Children of the Quarry | HEALTHY | — |
| 320 | The Antlered Thing | HEALTHY | — |
| 321 | The Last Trap | CONFIRMED DEFECT | CRA-F0118 (MEDIUM), CRA-F0119 (MEDIUM), CRA-F0120 (LOW) — shared results overstate dog recovery, trap disarming, and bedroll chronology. |
| 322 | The Broken Antler | CONFIRMED DEFECT | CRA-F0121 (MEDIUM) — a BROKEN knife can satisfy the physical wire-cut action. |
| 323 | The Man-Eater of Miller’s Gap | HEALTHY | — |
| 324 | The Cinder Hound | HEALTHY | — |

The Goat That Wouldn’t Stay Dead’s gravedigger route can bypass the feed ledger but still grant History for resolving the goat identities through its tally (CRA-F0114). The Widow’s Beast’s shared `widowAfter` result claims both repaired fencing and stopped feeding across independent or non-intervention routes (CRA-F0115). In The Cellar Thing, fetching the keeper from outside the cellar goes directly to rescue closure, whose text says the seller reached the yard and the keeper boarded the service opening although those events are established only through the voice/passage route (CRA-F0116). In The Man Who Sheds His Skin, asking for the cousin reaches the identity ending without meeting the tailor, yet the ending circulates the two-brother/exchanged-coat explanation (CRA-F0117). The Last Trap has three distinct mismatches: dogs are said to return when still unrecovered (CRA-F0118); wire/dog resolution is asserted after back-away routes that do not establish either (CRA-F0119); and a route that first sees the bedroll placed says the Traveler left before it was set (CRA-F0120). The Broken Antler requires a knife in inventory but not a usable knife for cutting wire, so BROKEN gear can complete the action (CRA-F0121).

The Pale Children of the Quarry, Antlered Thing, Man-Eater of Miller’s Gap, and Cinder Hound were reviewed across their materially distinct discovery, intervention, withdrawal, danger, and closure variants and retained uncertainty/outcome distinctions. The current batch added six findings to CRA-C0001, one to CRA-C0002, and one to CRA-C0004; no new cluster was needed. Focused route/choice, persistence, Monster Hunt, Gear-usability, I1 regression, and registry suites passed 48 tests across six files. These checks support but do not replace semantic source review. No gameplay source or tests were changed. Totals are now 196 HEALTHY, 15 MINOR CONCERN, and 109 CONFIRMED DEFECT across 320 reviewed Adventures; 541 remain. CRA-F0114–CRA-F0121 comprise one HIGH, six MEDIUM, and one LOW finding. The next canonical registry entry is position 321, The Three-Toed Track, and the next finding ID is CRA-F0122.

## Audit batch (originally recorded positions 321–330; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 325 | The Three-Toed Track | CONFIRMED DEFECT | CRA-F0122 (MEDIUM) — resolved routes claim sale terms were compared when they were not. |
| 326 | The Red Maw | HEALTHY | — |
| 327 | The Beast at the Toll Road | CONFIRMED DEFECT | CRA-F0123 (MEDIUM), CRA-F0124 (MEDIUM) — resolution overstates sack/horse recovery; a BROKEN knife can cut the control rope. |
| 328 | The Skin in the Tree | CONFIRMED DEFECT | CRA-F0125 (MEDIUM) — shared closure presumes landholder/warden intervention and animal release on routes that do not establish them. |
| 329 | The Thing That Mimics the Whistle | HEALTHY | — |
| 330 | The Stoneback | CONFIRMED DEFECT | CRA-F0126 (MEDIUM) — rope stabilization is narrated as cart rerouting and cessation of stack shifts. |
| 331 | The Roof Through the Trees | HEALTHY | — |
| 332 | The Camp with Fresh Ashes | MINOR CONCERN | — |
| 333 | The Floorboard That Was Replaced | HEALTHY | — |
| 334 | The Forgotten Sluice | HEALTHY | — |

The Three-Toed Track’s return-plate and payment routes reach `trackResolved` without comparing the sale note, though the shared ending says the terms were compared (CRA-F0122). In The Beast at the Toll Road, exposing or interrupting the staged attack reaches text claiming grain recovery and horse release without those outcomes being recorded (CRA-F0123); the control-rope action also accepts a broken small knife (CRA-F0124). The Skin in the Tree’s direct drag-mark route reaches the camp without asking the landholder, and mark-and-withdraw / solo snare-cut routes still claim warden removal and animal release (CRA-F0125). In The Stoneback, securing one loose stack with rope enters an ending that says the crew rerouted the cart and the creature stopped shifting stacks, outcomes established by separate upper-bench choices (CRA-F0126). The Red Maw, Thing That Mimics the Whistle, Roof Through the Trees, Floorboard That Was Replaced, and Forgotten Sluice preserved route-specific uncertainty and outcomes, including the sluice’s targeted override. Camp with Fresh Ashes is a minor wording concern: its cautious closure calls the unidentified person an absent worker and says only the Traveler’s tracks are new, without defining the watch interval.

That batch added four findings to CRA-C0001 and one to CRA-C0004; no new cluster was needed. Focused Monster Hunt, Frontier Discovery, Frontier RC12, final-choice, and registry suites passed 42 tests across five files. These checks support but do not replace semantic review. No source or test files were changed. At that checkpoint, totals were 201 HEALTHY, 16 MINOR CONCERN, and 113 CONFIRMED DEFECT across 330 reviewed Adventures; 531 remained. CRA-F0122–CRA-F0126 were all MEDIUM.

## Audit batch (originally recorded positions 331–340; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 335 | The Mule Trail | MINOR CONCERN | — |
| 336 | The Prospector’s Map | MINOR CONCERN | — |
| 337 | The Empty Assay Office | MINOR CONCERN | — |
| 338 | The Cabin with Two Locks | MINOR CONCERN | — |
| 339 | The Gold Dust in the Floorboards | MINOR CONCERN | — |
| 340 | The Old Hoist | CONFIRMED DEFECT | CRA-F0127 (MEDIUM) — tested hoist is later described as untouched. |
| 341 | The Camp Below the Slide | CONFIRMED DEFECT | CRA-F0128 (MEDIUM) — object-action choices do not resolve tool/chest acquisition. |
| 342 | The Hidden Tailings Pile | CONFIRMED DEFECT | CRA-F0129 (MEDIUM) — bilateral evidence-sharing choice has no established second party. |
| 343 | The Old Claim Cabin | HEALTHY | — |
| 344 | The Claim with No Name | CONFIRMED DEFECT | CRA-F0130 (MEDIUM) — bilateral evidence-sharing choice has no established second party. |

The Old Hoist tests the mechanism with loose timber, then both cautious closure and mishap text say it was left untouched (CRA-F0127). The Camp Below the Slide offers taking a loose tool or reaching for a chest, but successful routes never resolve whether either object is acquired or left (CRA-F0128). The Hidden Tailings Pile and The Claim with No Name inherit a generic “give both sides the same account” option without introducing or contacting the other party (CRA-F0129–CRA-F0130). The Old Claim Cabin preserves uncertainty about who worked the claim and what the find means; no contradiction was found. The Mule Trail, Prospector’s Map, Empty Assay Office, Cabin with Two Locks, and Gold Dust in the Floorboards have limited or repeated generic route payoffs, but their text does not assert a route-unsupported fact, so they remain minor concerns.

The batch added CRA-F0127 to the established route-state/convergence cluster CRA-C0001 and created CRA-C0006 for generic Frontier Discovery archetypes that promise unsupported actors or unresolved action outcomes (CRA-F0128–CRA-F0130). Frontier Discovery, registry, and diversity suites passed 31 tests across three files as supporting evidence; card-by-card route review remains authoritative. No gameplay source or tests were changed. At that checkpoint totals were 202 HEALTHY, 21 MINOR CONCERN, and 117 CONFIRMED DEFECT across 340 reviewed Adventures; 521 remained. All four new findings were MEDIUM.

## Audit batch (originally recorded positions 341–350; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 345 | The Broken Rocker Box | MINOR CONCERN | — |
| 346 | The Rusted Safe | MINOR CONCERN | — |
| 347 | The Cache Under the Stove | HEALTHY | — |
| 348 | The Washed-Out Claim | CONFIRMED DEFECT | CRA-F0131 (MEDIUM) — the promised shovel-taking action has no resolved acquisition outcome. |
| 349 | The Old Dredge | CONFIRMED DEFECT | CRA-F0132 (MEDIUM) — the ledger-markings investigation produces no reading/result. |
| 350 | The Derelict Stamp Mill | MINOR CONCERN | — |
| 351 | The Survey Stakes Are Wrong | HEALTHY | — |
| 360 | The Claim at Dry Creek | HEALTHY | — |
| 361 | Claim Jumpers at Sundown | CONFIRMED DEFECT | CRA-F0133 (MEDIUM) — evidence is “shared” with an absent employer who is never contacted. |
| 362 | The Man in the Abandoned Camp | MINOR CONCERN | — |

The Washed-Out Claim’s cautious action says to take the loose shovel, but it grants only general site insight; no item or route state records whether the shovel was taken, and later endings do not resolve its disposition (CRA-F0131). The Old Dredge offers reading the ledger-box markings from the bank, but neither the success route nor its ending supplies any marking or information result (CRA-F0132). Claim Jumpers at Sundown places visitors at the gate but represents the employer only through a posted map; its generic “give both sides the same account” choice claims bilateral sharing without a route to the absent employer (CRA-F0133). The Cache Under the Stove explicitly resolves coins/items and their effects; Survey Stakes Are Wrong has a card-specific route specialization that keeps observations separate; and Claim at Dry Creek has both groups physically present. The Broken Rocker Box, Rusted Safe, Derelict Stamp Mill, and Man in the Abandoned Camp contain repeated or under-resolved action prompts, but no definite unsupported fact, so they remain minor concerns.

The three confirmed findings join CRA-C0006, the generic Frontier archetype mismatch pattern. Supporting Frontier Discovery, registry, and diversity suites passed 31 tests across three files; route-level source inspection determined the classifications. No gameplay source or tests were changed. At the position-350 checkpoint the totals were 205 HEALTHY, 25 MINOR CONCERN, and 120 CONFIRMED DEFECT; 511 remained. All three findings were MEDIUM.

## Audit batch (originally recorded positions 351–360; table positions are live)

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 363 | The Timber Claim | CONFIRMED DEFECT | CRA-F0134 (MEDIUM) — a generic bilateral account is offered without any claimant present. |
| 364 | The Second Claim Marker | CONFIRMED DEFECT | CRA-F0135 (MEDIUM) — the same bilateral-sharing choice has no recipient. |
| 365 | The Claim That Pays Too Well | CONFIRMED DEFECT | CRA-F0136 (MEDIUM) — no second claimant/recipient is established for the shared account. |
| 366 | The Camp with Fresh-Cut Wood | CONFIRMED DEFECT | CRA-F0137 (MEDIUM) — the selected note-marker action is not resolved. |
| 367 | The Shaft Behind the Trees | MINOR CONCERN | — |
| 368 | The Old Ferry Landing | MINOR CONCERN | — |
| 369 | The Collapsed Storehouse | MINOR CONCERN | — |
| 370 | The Trail That Ends at Stone | MINOR CONCERN | — |
| 371 | The Toast Nobody Ordered | CONFIRMED DEFECT | CRA-F0138 (MEDIUM) — an unvisited couple-preference branch grants Knowledge. |
| 372 | An Invitation for Someone Else | CONFIRMED DEFECT | CRA-F0139 (MEDIUM) — “supper, then explain” ends before the explanation. |

The Timber Claim, Second Claim Marker, and Claim That Pays Too Well use a generic claim-sharing choice without a present or established second recipient; each is independently witnessed in its scenario-specific setup and routed through `shareRecord` (CRA-F0134–CRA-F0136). Camp with Fresh-Cut Wood offers leaving a note-like marker twice, but neither the route effect nor terminal text records that intervention (CRA-F0137). The Shaft Behind the Trees, Old Ferry Landing, Collapsed Storehouse, and Trail That Ends at Stone retain uncertainty and warned boundaries; their repeated or generic actions lack payoff detail but do not establish a concrete false state, so they remain minor concerns. In The Toast Nobody Ordered, the best-man aside does not reveal the couple’s preference, yet the offer-words route grants that exact Knowledge (CRA-F0138). An Invitation for Someone Else sends “Accept supper, then explain” directly to the meal ending without correcting the host’s mistaken identity (CRA-F0139).

The batch added four findings to CRA-C0006’s generic Frontier action/participant mismatch and one to CRA-C0002’s Knowledge-without-route-proof pattern; the missed explanation remains a standalone route-follow-through defect and is not forced into a cluster. Frontier Discovery, social anthology, registry, and diversity suites were supporting checks; they do not replace route review. No gameplay source or test files were changed. Totals are now 205 HEALTHY, 29 MINOR CONCERN, and 126 CONFIRMED DEFECT across 360 reviewed Adventures; 501 remain. All six new findings are MEDIUM. The next canonical registry entry is position 361, One Umbrella, Three Walkers, and the next finding ID is CRA-F0140.

## Audit continuation (live positions 121–124 and 352–357)

This continuation resumed at the first live-registry gap and reviewed the next ten unreviewed stable IDs in canonical order. Strange Roads and Frontier Discovery route graphs, outcomes, effects, History/Knowledge writes, relevant save/resume behavior, and available scenario-specific tests were traced. The focused suites passed 20 tests across three files; tests were supporting evidence, not the basis for route classifications.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 121 | The Woman at the Crossing | CONFIRMED DEFECT | CRA-F0140 (MEDIUM) — shared ending claims bridge inspection on detour/dawn routes; CRA-F0141 (MEDIUM) — dawn crossing failure is described as occurring in darkness. |
| 122 | The Black Dog | CONFIRMED DEFECT | CRA-F0142 (MEDIUM) — passing-help route claims an unestablished farmhand arrival. |
| 123 | The Room with No Door | HEALTHY | — |
| 124 | The Bell Beneath the Water | MINOR CONCERN | — |
| 352 | The Forgotten Powder Shed | MINOR CONCERN | — |
| 353 | The Creek Diversion | HEALTHY | — |
| 354 | The Locked Strongbox in the Ruins | CONFIRMED DEFECT | CRA-F0143 (MEDIUM) — successful pry action has no resolved opening/result. |
| 355 | The Broken Gate | CONFIRMED DEFECT | CRA-F0144 (MEDIUM) — cabin-help action has no cabin/occupant result; CRA-F0145 (MEDIUM) — bilateral report has no established recipient. |
| 356 | The Missing Assayer | HEALTHY | — |
| 357 | The Claim Jumper’s Story | CONFIRMED DEFECT | CRA-F0146 (MEDIUM) — generic bilateral report claims the absent owner receives the account. |

CRA-F0140–CRA-F0142 extend CRA-C0001’s route-specific outcome/participant continuity pattern. CRA-F0143–CRA-F0146 extend CRA-C0006’s generic Frontier archetype action/participant mismatch. No new cluster was necessary. The Bell Beneath the Water retains a minor concern for its innkeeper-sourced text variant on a direct shore-listening route; the nearby inn context makes this insufficiently clear to classify as a confirmed defect. The powder shed’s safe override avoids handling/explosion outcomes but leaves a repeated mark/warn action lightly resolved. The worker question in Claim Jumper’s Story is summarized rather than answered, but the existing accounts are compared without a proven false assertion.

The checkpoint now covers 370/861 Adventures: 208 HEALTHY, 31 MINOR CONCERN, 131 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 146 confirmed finding records. The contiguous reviewed frontier reaches position 357; 13 reviewed Adventures remain beyond the next gap, and only positions 358–359 remain unreviewed through the current maximum reviewed position 372. The next registry position is 358, The Forgotten Supply Cache (`the-forgotten-supply-cache`); next finding ID is CRA-F0147. Gameplay source and tests were unchanged.

## Audit continuation (live positions 358–359 and 373–380)

Resume used the stable-ID checkpoint rather than reviewed-count arithmetic. Positions 358–359 were the next unreviewed IDs. Positions 360–372 were already reviewed and skipped; review then continued with the next eight live-registry entries, positions 373–380. Frontier Discovery’s item/marking/risk/success paths and the eight social anthology graphs were traced through their distinct choices, state/effects, endings, refusals, rewards, and save/reload-relevant behavior. Supporting Frontier, anthology, I1-regression and registry suites passed 35 tests across four files.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 358 | The Forgotten Supply Cache | CONFIRMED DEFECT | CRA-F0147 (MEDIUM) — take-item endings claim the cache was marked without a marking action; the entry mark-and-leave route is also unresolved. |
| 359 | The Old Hydraulic Cut | CONFIRMED DEFECT | CRA-F0148 (MEDIUM) — entry mark-and-leave route does not establish a marker; CRA-F0149 (MEDIUM) — successful descent repeats the undecided prompt without resolving what the fitting showed. |
| 373 | One Umbrella, Three Walkers | HEALTHY | — |
| 374 | The Wrong Name at the Door | HEALTHY | — |
| 375 | The Empty Place Setting | HEALTHY | — |
| 376 | The Barber’s Quiet Customer | MINOR CONCERN | — |
| 377 | The Schoolroom Door | HEALTHY | — |
| 378 | The Farewell Quilt | HEALTHY | — |
| 379 | The Public Apology | CONFIRMED DEFECT | CRA-F0150 (MEDIUM) — the shared silence ending assigns an avoidance motive to a route that insists the sign is crooked. |
| 380 | The Last Clean Apron | HEALTHY | — |

CRA-F0147–CRA-F0149 extend CRA-C0006’s Frontier action/result mismatch pattern, including the marker-action omission already seen in CRA-F0137. CRA-F0150 extends CRA-C0001’s route-specific action/motive convergence pattern. No new cluster was required; CRA-C0007 remains the next available cluster ID. The Barber’s Quiet Customer remains a minor concern because the source does not establish whether the barber’s bereavement disclosure is overheard by the customer seated nearby. The route does not claim lasting care or resolution. No gameplay source or test files changed.

The checkpoint now covers 380/861 Adventures: 214 HEALTHY, 32 MINOR CONCERN, 134 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 150 finding records. The contiguous reviewed frontier reaches position 380 with no gaps through it. The next stable ID is position 381, The Quiet Applause (`the-quiet-applause`); 481 current registered Adventures remain. Next finding ID is CRA-F0151.

## Audit continuation (live positions 381–390)

Resumed from the first stable ID not already reviewed and inspected ten entries in live `SCENARIOS` order. Social-performer choices and the competition anthology’s game, recitation, documentation, demonstration, safety, award, and publication routes were traced through route conditions, state/effects, persistent History/Lore, refusals, alternate outcomes, and endings. The focused outcome-continuity, anthology, and registry suites passed 21 tests across three files; tests support, but do not replace, route review.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 381 | The Quiet Applause | HEALTHY | — |
| 382 | The Three-Ring Toss | HEALTHY | — |
| 383 | The Last Verse Contest | HEALTHY | — |
| 384 | Notes After the Ribbon | CONFIRMED DEFECT | CRA-F0151 (MEDIUM) — composite-card ending and persistent Lore assert baker agreement/collective authorship that the Traveler’s unilateral choice never establishes. |
| 385 | A Line for the Broadside | HEALTHY | — |
| 386 | The Clockmaker’s Demonstration | HEALTHY | — |
| 387 | The Bell-Ringer Trial | CONFIRMED DEFECT | CRA-F0152 (MEDIUM) — ground-bell judging ending names the apprentice winner and claims superior skill without establishing her comparative performance. |
| 388 | The Pie with No Recipe | HEALTHY | — |
| 389 | The Painted Sign | HEALTHY | — |
| 390 | The Whistle and the Wind | CONFIRMED DEFECT | CRA-F0153 (MEDIUM) — a shared round claims the Traveler made a call after the route only moves the judges. |

CRA-F0151 establishes a distinct consent/collective-authorship pattern, recorded as new cluster CRA-C0007. CRA-F0152 and CRA-F0153 extend CRA-C0001’s route-specific result/action continuity pattern. The Last Verse Contest’s delivery-rule scene itself states that each contestant receives a final stanza before the room votes; that route therefore does not skip the performances. The Quiet Applause preserves the singer’s refusal, while the other healthy competition routes keep prize, evidence, participation, and persistent outcome records within what their paths establish. No gameplay source or tests were changed.

The checkpoint now covers 390/861 Adventures: 221 HEALTHY, 32 MINOR CONCERN, 137 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 153 finding records. The contiguous reviewed frontier reaches position 390 with no gaps through it. Position 391, The Painted Mule (`the-painted-mule`), is next; 471 current registered Adventures remain. Next finding ID is CRA-F0154 and next cluster ID is CRA-C0008.

## Audit continuation (live positions 391–400)

Continued from the first stable ID not already reviewed. The competition anthology’s animal, parade, and demonstration routes plus the first seven everyday anthology routes were traced through their materially distinct choices, state/effects, persistent information, property/custody, timing, rewards, refusals, and endings. The focused anthology, outcome-continuity, and registry suites passed 21 tests across three files as supporting evidence.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 391 | The Painted Mule | CONFIRMED DEFECT | CRA-F0154 (MEDIUM) — the story-about-the-sign route says the boast was corrected although no correction/removal is selected. |
| 392 | The Tin-Can Orchestra | HEALTHY | — |
| 393 | The Tilt Table | HEALTHY | — |
| 394 | The Envelope Under the Teacup | HEALTHY | — |
| 395 | Two Dates on One Photograph | HEALTHY | — |
| 396 | A Notice Printed Backward | HEALTHY | — |
| 397 | Supper at the Inn | HEALTHY | — |
| 398 | The Cobbler’s Last Pair | CONFIRMED DEFECT | CRA-F0155 (MEDIUM) — split-pair ending asserts both customers agree though the dancer was not consulted; CRA-F0156 (MEDIUM) — partner-only route imports an unselected worker patch and agreement. |
| 399 | The Parcel with No Address | HEALTHY | — |
| 400 | The Clock That Kept Local Time | HEALTHY | — |

CRA-F0154–CRA-F0156 extend CRA-C0001’s route-specific action/outcome continuity pattern, except CRA-F0155, which joins the consent/collective-authorship cluster CRA-C0007 first established in the prior batch. No new cluster was needed. Two Dates on One Photograph grants its detailed composition Knowledge only after inspecting and sharing the negative-sleeve evidence. The first press-limit option in A Line for the Broadside is a minor decision-flow concern because the later layout choice can revise it; no contradictory final publication claim is forced. No gameplay source or tests changed.

The checkpoint now covers 400/861 Adventures: 228 HEALTHY, 33 MINOR CONCERN, 139 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 156 finding records. The contiguous reviewed frontier reaches position 400 with no gaps through it. Position 401, The Play with an Unwritten Ending (`the-play-with-an-unwritten-ending`), is next; 461 current registered Adventures remain. Next finding ID is CRA-F0157; next cluster ID is CRA-C0008.

## Audit continuation (live positions 401–410)

Continued in live `SCENARIOS` order after position 400. The remaining everyday anthology and first two procedural-comedy routes were traced across choices, state/effects, Knowledge gates, ownership/usability requirements, risk outcomes, refusals, and endings. Supporting anthology, continuity, Gear-correction, apprenticeship/Gear, and registry suites passed 41 tests across five files; route-level review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 401 | The Play with an Unwritten Ending | HEALTHY | — |
| 402 | A Chair Beside the Sickbed | HEALTHY | — |
| 403 | The Lamp Left in the Window | HEALTHY | — |
| 404 | The Pocket in the Curtain | CONFIRMED DEFECT | CRA-F0157 (LOW) — the opening exposes the full note, then offers to return it “unopened” or “unseen.” |
| 405 | The Trestle Table | HEALTHY | — |
| 406 | A Loaf Set Aside | HEALTHY | — |
| 407 | The Stage Rigging | HEALTHY | — |
| 408 | The Back-Room Lantern | HEALTHY | — |
| 409 | The Doorway Delivery | HEALTHY | — |
| 410 | The Queue with Two Ends | HEALTHY | — |

CRA-F0157 extends CRA-C0001’s route/action-state continuity pattern: the privacy-preserving option conflicts with information already disclosed to the Traveler. The singer’s privacy, consent to step down, and understudy participation remain distinct; only the “unopened/unseen” promise is defective. The patient’s requested care remains nonmedical; lamp/river information is Knowledge-gated; lantern and auger use remain gated by item usability; the stage hazard’s fatal branch is explicit; and the queue does not claim to know the disputed customers’ arrival order. No gameplay source or tests changed.

The checkpoint now covers 410/861 Adventures: 237 HEALTHY, 33 MINOR CONCERN, 140 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 157 finding records. The contiguous reviewed frontier reaches position 410 with no gaps through it. Position 411, The Clerk’s Second Stamp (`the-clerks-second-stamp`), is next; 451 current registered Adventures remain. Next finding ID is CRA-F0158; next cluster ID remains CRA-C0008.

## Audit continuation (live positions 411–420)

Continued in live registry order across the procedural-comedy set. The clerk-certificate signature requirement, humane animal judging, safe roof retrieval, shared-door delivery boundary, clock references, parcel provenance and correction, seating/fragile parcel, pigeon message privacy/delivery, scale-model purpose, and weather/feed observations were traced through their distinct paths and endings. Supporting comedy, anthology, playtest-correction, and registry suites passed 29 tests across four files.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 411 | The Clerk’s Second Stamp | CONFIRMED DEFECT | CRA-F0158 (MEDIUM) — an ending claims a usable certificate before the Traveler signs the required declaration. |
| 412 | The Patient Pig | HEALTHY | — |
| 413 | The Wardrobe on the Roof | HEALTHY | — |
| 414 | The House with Two Doorbells | HEALTHY | — |
| 415 | The Town Clock’s Argument | HEALTHY | — |
| 416 | The Baker and the Brown Paper | HEALTHY | — |
| 417 | The Sixth Chair | HEALTHY | — |
| 418 | The Pigeon Postscript | CONFIRMED DEFECT | CRA-F0159 (MEDIUM) — the sealed-note route receives a farm reply without contacting the owner. |
| 419 | The Tinsmith’s Tiny Door | HEALTHY | — |
| 420 | The Barnyard Weather Report | HEALTHY | — |

CRA-F0158–CRA-F0159 extend CRA-C0001’s action/result and route-specific source continuity pattern. The Clerk’s correct-line route alone records the Traveler’s declaration; the shared scrape/initial route says the usable certificate is ready before signing. The Pigeon Postscript’s explicit `callOwner` path is distinct and supported; the defect is only the no-contact `leaveSecond` path into the farm-reply ending. The doorbell suggestions are treated as accepted social outcomes because the endings explicitly narrate the neighbors’ agreement; no additional defect was inferred. No gameplay source or tests changed.

The checkpoint now covers 420/861 Adventures: 245 HEALTHY, 33 MINOR CONCERN, 142 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. There are 159 finding records. The contiguous reviewed frontier reaches position 420 with no gaps through it. Position 421, The Paper Mill Parade (`the-paper-mill-parade`), is next; 441 current registered Adventures remain. Next finding ID is CRA-F0160; next cluster ID remains CRA-C0008.

## Audit continuation (live positions 431–440)

Continued with the next ten stable IDs in `SCENARIOS` order, then crossed from the procedural-comedy set into the first seven deep-exploration scenarios. Review traced all meaningful choice routes, requirements, current/run state, Knowledge/History effects, reward and withdrawal paths, partial outcomes, and reachable endings. The deep-exploration graph/state, comedy, registry, and Gear-usability suites passed 43 tests across four files; these checks support, but do not replace, route-level review. Source files still match the recorded `cba101f0feba09c67543f942331ca38f765ebe14` snapshot.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 431 | The Misplaced Pigeonhole | CONFIRMED DEFECT | CRA-F0165 (MEDIUM) — resident pickup reaches an ending that claims the pigeonhole labels were corrected. |
| 432 | The Salute from the Wrong Porch | CONFIRMED DEFECT | CRA-F0166 (MEDIUM) — one captain’s account is treated as mutual understanding and continuing agreement. |
| 433 | The Candle Ends | HEALTHY | — |
| 434 | The Black Stair at Wren’s Mill | CONFIRMED DEFECT | CRA-F0167 (MEDIUM) — the no-bracing route reaches text claiming the lower wheel stopped. |
| 435 | The Last Door in Briar House | CONFIRMED DEFECT | CRA-F0168 (MEDIUM) — a window route reaches the second bedroom without establishing the stated closed-door condition. |
| 436 | The Iron Orchard | CONFIRMED DEFECT | CRA-F0169 (MEDIUM) — a BROKEN lantern/headlamp satisfies an action requiring a working flame to test mine air. |
| 437 | The Door Beneath the Road | CONFIRMED DEFECT | CRA-F0170 (MEDIUM) — shallow wagon recovery claims road-crew notification without a reporting route. |
| 438 | Beneath Saint Orra’s | CONFIRMED DEFECT | CRA-F0171 (MEDIUM), CRA-F0172 (MEDIUM) — shared exits claim unperformed damage marking and caretaker closure/acceptance. |
| 439 | The House at Mile Marker Nine | CONFIRMED DEFECT | CRA-F0173 (MEDIUM) — a stopped-clock route promises a reliable trigger for the disappeared earlier view. |
| 440 | The Deep Room at Harker Mine | CONFIRMED DEFECT | CRA-F0174 (MEDIUM), CRA-F0175 (HIGH) — broken-light usability leaks into mine actions; comparing the token after opening the seal claims an unperformed reseal. |

CRA-F0165, CRA-F0167–CRA-F0168, CRA-F0170–CRA-F0173, and CRA-F0175 extend existing CRA-C0001 (route-specific state/outcome at convergence). CRA-F0166 extends existing CRA-C0007 (NPC consensus inferred from a unilateral route). CRA-F0169 and CRA-F0174 extend existing CRA-C0004 (Gear ownership treated as Gear usability). No new cluster was needed; CRA-C0007 already exists, and the next unused cluster remains CRA-C0008.

The ledger now covers 460/861 Adventures: 266 HEALTHY, 33 MINOR CONCERN, 161 CONFIRMED DEFECT, and 0 NEEDS MANUAL REVIEW. It contains 183 findings. The reviewed frontier is contiguous through position 460. Position 461, The Claimed Salvage (`the-claimed-salvage`), is next; 401 Adventures remain and the next finding ID is CRA-F0184. No gameplay source, gameplay tests, design documents, deployment, or scheduler state changed; Weekly Scenario Batch remains paused.

## Audit continuation (live positions 441–450)

Reviewed the next ten stable IDs in live `SCENARIOS` order, crossing from deep-exploration stories into fixed-stock merchants. Routes were traced through equipment gates, alternate access, evidence and reporting, NPC responses, object recovery, payment/tool substitution, persistent effects, refusal/retreat, and fatal outcomes. Supporting deep-exploration, merchant, registry, and equipment suites passed 43 tests across four files; route-level source review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 441 | The Ferry Beneath the Ferry | CONFIRMED DEFECT | CRA-F0176 (MEDIUM) — the lower-waterline route claims to use a Travel Rope but is available without a usable rope. |
| 442 | The Lantern Vault | CONFIRMED DEFECT | CRA-F0177 (MEDIUM) — a supply-room-only route claims the cellar refuge purpose without seeing its supporting evidence. |
| 443 | The Hollow Fort | CONFIRMED DEFECT | CRA-F0178 (MEDIUM) — the shared return says workers stop stripping timber without the route telling them to stop. |
| 444 | The Road Through the Barrow | CONFIRMED DEFECT | CRA-F0179 (MEDIUM) — a secret-entry return claims keeper acceptance and crew consensus without either party responding. |
| 445 | The Bell Below the Water | HEALTHY | — |
| 446 | The Forgotten Platform | CONFIRMED DEFECT | CRA-F0180 (MEDIUM) — the report ending claims delivery of both map and ledger copies from routes that did not acquire them. |
| 447 | The White Chamber | CONFIRMED DEFECT | CRA-F0181–CRA-F0183 (MEDIUM) — broken rope passes as usable; a no-line route claims a taut rope; inspection-only paths claim pack recovery, delivery, and payment. |
| 448 | The Siding Tool Board | HEALTHY | — |
| 449 | The Ferryman’s Locker | HEALTHY | — |
| 450 | The Doctor’s Road Cart | HEALTHY | — |

The findings extend existing clusters: CRA-F0176 and CRA-F0181 use CRA-C0004 (Gear ownership/usability); CRA-F0179 uses CRA-C0007 (NPC consensus); CRA-F0177–CRA-F0178, CRA-F0180, and CRA-F0182–CRA-F0183 use CRA-C0001 (route-specific state/evidence lost at convergence). No new cluster was created. The ledger is contiguous through position 450; next is position 451, The Roadside Tinker (`the-roadside-tinker`), with 411 remaining and next finding CRA-F0184.

## Audit continuation (live positions 451–460)

Reviewed the next ten stable IDs in live `SCENARIOS` order: the remaining fixed-stock merchants followed by the first three Gear corrective Adventures. Merchant sales/purchases, item ownership and sale limits, prices, finite supplies, Knowledge-gated consultation, Gear allocation, tool-usability gates, route-result variants, wages/rewards/refusal, and outcome flags were traced. Supporting merchant, Gear-corrective, registry, and equipment suites passed 34 tests across four files.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 451 | The Roadside Tinker | HEALTHY | — |
| 452 | The Farm Gate Auction | HEALTHY | — |
| 453 | The Hill Outfitter | HEALTHY | — |
| 454 | The Winter Inn Clearance | HEALTHY | — |
| 455 | The Quarry Survey Table | HEALTHY | — |
| 456 | The Retired Lampwright | HEALTHY | — |
| 457 | The Chapel Restoration Shelf | HEALTHY | — |
| 458 | The Squire’s Pack | HEALTHY | — |
| 459 | The Last Survey | HEALTHY | — |
| 460 | The Quartermaster’s Tally | HEALTHY | — |

No additional findings or clusters were added. The last survey’s paced route itself establishes that the bypass developed after the first road measurement; the date/order statement is therefore supported alongside the dated-notebook path. The gear-state, recovery/stakes, inventory reward and caravan shifted-load variants remain route-specific. The ledger is contiguous through position 460; next is position 461, The Claimed Salvage (`the-claimed-salvage`), with 401 remaining and next finding CRA-F0184.
