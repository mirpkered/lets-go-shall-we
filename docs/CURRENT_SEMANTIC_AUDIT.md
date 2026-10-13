# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint: registry positions 1–290 reviewed; 571 of 861 remain.
Next: position 291; next finding ID `CRA-F0097`.

## Current checkpoint

The canonical registry order is `SCENARIOS` in `src/scenarios/index.ts`. Positions 1–20 are carried forward from prior conversation review summaries; positions 21–290 were reviewed against current scenario source. Focused suites were run where existing relevant test files were available. No source or test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 186 |
| MINOR CONCERN | 15 |
| CONFIRMED DEFECT | 89 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed | 290 |

There are 95 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. Findings CRA-F0016–CRA-F0018 are HIGH, MEDIUM, MEDIUM respectively; CRA-F0019, CRA-F0023–CRA-F0026, CRA-F0028–CRA-F0032, CRA-F0034–CRA-F0036, CRA-F0041, CRA-F0044, CRA-F0054, CRA-F0056–CRA-F0057, CRA-F0061, CRA-F0065, CRA-F0069, CRA-F0073, CRA-F0075, CRA-F0076, CRA-F0084, CRA-F0089, CRA-F0092–CRA-F0094 are LOW; CRA-F0027, CRA-F0033, CRA-F0037–CRA-F0038, CRA-F0040, CRA-F0042, CRA-F0045–CRA-F0049, CRA-F0052–CRA-F0053, CRA-F0055, CRA-F0059–CRA-F0060, CRA-F0062–CRA-F0064, CRA-F0066–CRA-F0068, CRA-F0070–CRA-F0072, CRA-F0074, CRA-F0077–CRA-F0080, CRA-F0082, CRA-F0085–CRA-F0088, CRA-F0090–CRA-F0091, and CRA-F0095 are MEDIUM; CRA-F0039, CRA-F0043, CRA-F0050, CRA-F0051, CRA-F0081, and CRA-F0083 are HIGH. The current batch added two MEDIUM and three LOW findings.

## Positions 21–30

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

## Positions 31–40

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

## Positions 41–50

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

## Positions 51–60

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

## Positions 61–70

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

## Positions 71–80

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

## Positions 81–90

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

## Positions 91–100

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

## Positions 101–110

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

## Positions 111–120

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

## Positions 121–130

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 121 | The Long Night | HEALTHY | — |
| 122 | The Doctor Is Three Miles Away | HEALTHY | — |
| 123 | When the Baby Comes | HEALTHY | — |
| 124 | The Red Flag | CONFIRMED DEFECT | CRA-F0036 — quiet-room monitoring reports a doctor-informed status without establishing contact. |
| 125 | The Telegram | HEALTHY | — |
| 126 | The Wrong Letter | HEALTHY | — |
| 127 | The Second Message | HEALTHY | — |
| 128 | Wire Down | HEALTHY | — |
| 129 | The Last Train Message | HEALTHY | — |
| 130 | Property Of... | MINOR CONCERN | The worker’s stated view shifts in the final limited-account outcome without an earlier explicit inference. |

The medical routes keep company/support separate from clinical treatment. In The Red Flag, the separate/watch outcome says the inn “keeps the doctor informed,” but that route does not send for or otherwise contact a doctor; only the separate doctor route explicitly sends a rider. This is CRA-F0036, a low-severity unsupported communication assertion. The five communication scenarios preserve message privacy, distinguish sender verification from content, and keep delivery/receipt outcomes route-specific. Property Of... protects the ownership uncertainty; its final accountRecorded wording (“stops treating that single act as proof”) implies an earlier inference by the worker that was not clearly stated, retained as a minor characterization-transition concern.

## Positions 131–140

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 131 | To the Magistrate | HEALTHY | — |
| 132 | The Warrant | HEALTHY | — |
| 133 | The Will | HEALTHY | — |
| 134 | Home Before Dark | HEALTHY | — |
| 135 | The Visitor | HEALTHY | — |
| 136 | The Back Door | CONFIRMED DEFECT | CRA-F0037 — the private-room departure route asserts an aunt destination established only in a different branch. |
| 137 | The Wake | HEALTHY | — |
| 138 | The Church Supper | HEALTHY | — |
| 139 | The Old Burial Ground | HEALTHY | — |
| 140 | At the Forge | HEALTHY | — |

The Back Door’s `privacy` branch establishes the trusted aunt as a destination. The separate `shelter` branch establishes only a private room and the resident’s choice to leave by the rear lane or wait until dawn, yet `shelter.leave` sends them to the aunt’s home. That route-specific, safety-sensitive destination leak is CRA-F0037 (MEDIUM, CRA-C0001). The legal, family, religious/community and craft routes otherwise keep decisions, payments, privacy, authority and work outcomes bounded by their selected paths.

## Positions 141–150

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 141 | The Morning Edition | HEALTHY | — |
| 142 | Hold Still | HEALTHY | — |
| 143 | The Undertaker’s Request | HEALTHY | — |
| 144 | The Watchmaker | HEALTHY | — |
| 145 | Before the Steamer Leaves | HEALTHY | — |
| 146 | The Missing Crate | HEALTHY | — |
| 147 | Locked Through | HEALTHY | — |
| 148 | At the Landing | HEALTHY | — |
| 149 | First Snow | HEALTHY | — |
| 150 | The Thaw | HEALTHY | — |

The specialized-trade routes preserve the editor’s authority over publication, distinguish an exposed/covered plate from a finished print, keep family decisions with the sister, and separate the watch’s maker from its owner and repair status. River-commerce outcomes keep counts, cargo identity, boarding decisions, and paid work tied to evidence or the actor with authority; the steamer baggage flow distinguishes verification, owner identification, and deferred checking. The two seasonal routes limit claims to what the traveler or farmer actually does: the boards support only foot/handcart travel, the cloak changes the traveler’s exposure rather than creek conditions, and the light snow remains a manageable inconvenience. No additional confirmed defects were identified.

## Positions 151–160

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 151 | Before the Frost | MINOR CONCERN | Work-to-dusk outcome tracks only 20 minutes and remains pre-dusk; exact timing is unspecified. |
| 152 | New Year’s Eve | HEALTHY | — |
| 153 | The Traveling Players | HEALTHY | — |
| 154 | The Miracle Tonic | HEALTHY | — |
| 155 | Three Rounds | HEALTHY | — |
| 156 | Dance Until Midnight | HEALTHY | — |
| 157 | The Speaker | HEALTHY | — |
| 158 | You Must Be the New Man | HEALTHY | — |
| 159 | That’s Him | HEALTHY | — |
| 160 | We Were Expecting Someone Else | HEALTHY | — |

The remaining seasonal stories preserve partial work and choice-specific rewards. Before the Frost has a minor timing-model concern: its gather action advances 20 minutes, but the full-harvest result says the work continues until light fades; the phase remains pre-dusk, and the source does not establish an exact sunset interval. The entertainment routes keep performer arrival, audience expectations, medical claims, consent, and the limits of the wind instrument explicit; The Speaker’s second demonstration gives the Traveler a direct explanatory/comparison choice. The first three mistaken-identity stories do not convert an assumption into a job, payment obligation, accusation, or repair; the actual clerk, repairer, or account check is only stated on the corresponding route. No additional confirmed defects were identified.

## Positions 161–170

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 161 | The Package | HEALTHY | — |
| 162 | Collection Day | HEALTHY | — |
| 163 | Out by Sundown | HEALTHY | — |
| 164 | The Mule Is Mine | MINOR CONCERN | `muleCareAgreed` is set but not consumed beyond the resulting scene. |
| 165 | The Sealed Crate | HEALTHY | — |
| 166 | Find Her | MINOR CONCERN | Search/errand reward terms are unclear on routes that return no address. |
| 167 | Dear Mary | HEALTHY | — |
| 168 | The Locket | HEALTHY | — |
| 169 | Supper for Two | HEALTHY | — |
| 170 | The Children’s Court | HEALTHY | — |

The parcel, employment, and small human stories keep custody, authority, privacy, and consent tied to their selected routes. Collection Day’s incoming coin is carried back to the shopkeeper while the one-coin effect corresponds to the stated errand wage; the mule stays in its pen while the debt is disputed. The Mule Is Mine has a redundant route flag, and Find Her leaves compensation unclear on unsuccessful/no-address routes; both are minor concerns, not confirmed semantic defects. The sealed-crate payment follows delivery. The Locket records a return only after recognition of its distinctive flower, while a single initial remains inconclusive. No additional confirmed defects were identified.

## Positions 171–180

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 171 | Still Waiting | HEALTHY | — |
| 172 | The Jack-o’-Lantern Contest | HEALTHY | — |
| 173 | All Hallows at the Boarding House | HEALTHY | — |
| 174 | The Masked Visitor | HEALTHY | — |
| 175 | The Halloween Dare | HEALTHY | — |
| 176 | The Scarecrow Changes Fields | CONFIRMED DEFECT | CRA-F0038 (MEDIUM) — observation-only routes inherit the farmhand’s admission/agreement and may record it as Knowledge. |
| 177 | The Harvest Mask | HEALTHY | — |
| 178 | The Witch at Miller’s Ford | HEALTHY | — |
| 179 | The Man in the Corn | HEALTHY | — |
| 180 | The Coffin Maker’s Extra Order | CONFIRMED DEFECT | CRA-F0039 (HIGH) — shared closure attributes the anonymous threat to the tailor without route proof. |

In The Scarecrow Changes Fields, `watchAfterDark -> inspectPeg -> scarecrowChoice` does not speak with the farmhand, yet the shared scene says the farmhand admitted moving the scarecrow and the follow-up says the farmhand agreed to notify the farmer. The `keepWatching` route also grants Knowledge that the farmhand moved it without an interview. These route-specific person/action and Knowledge facts are established only by the interview path (CRA-F0038, MEDIUM).

In The Coffin Maker’s Extra Order, returning payment or bringing the maker together reaches closure that says the tailor must answer, without establishing the tailor’s involvement. Preserving the order proves handwriting/delivery and a prior business connection only; the route that confronts the tailor and reaches the former partner establishes the measurements-for-intimidation explanation. Shared closure also records that culpability as Knowledge. The unproved attribution is CRA-F0039 (HIGH). October affinity, second-wave, and content-depth supporting suites passed (28 tests across three files); these tests do not replace the route traces.

## Positions 181–190

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 181 | The Skeleton in the Wagon | CONFIRMED DEFECT | CRA-F0040 (MEDIUM) — convergence invents a lot-number handoff and written shipment account on routes that did not inspect or record them. |
| 182 | The Headless Rider | MINOR CONCERN | Keeper-fetch/turn flags are written but not reflected in later route outcomes. |
| 183 | The Last House before the Woods | CONFIRMED DEFECT | CRA-F0041 (LOW) — common Knowledge identifies the caller as a stranger even when unseen. |
| 184 | The Séance at Bellweather House | CONFIRMED DEFECT | CRA-F0042 (MEDIUM) — shared ending claims a written answer, witnessed voice, and fee recovery across incompatible routes. |
| 185 | The Red Chalk Circle | CONFIRMED DEFECT | CRA-F0043 (HIGH) — boundary-escape route claims Orin is out without finding or rescuing him. |
| 186 | The Man Who Sleeps in the Graveyard | HEALTHY | — |
| 187 | The Widow’s Mirror | CONFIRMED DEFECT | CRA-F0044 (LOW) — shared ending asserts the glazier dismantles the mirror without that service being selected. |
| 188 | The Bone Box | HEALTHY | — |
| 189 | The Lantern at the Crossing | CONFIRMED DEFECT | CRA-F0045 (MEDIUM) — Spirit Glass reveal is available with a BROKEN Lantern. |
| 190 | The Quiet Room | HEALTHY | — |

The Skeleton in the Wagon’s shared settlement says the teacher takes the lot number back to school and gives the passerby a written shipment account even when the player only covers the crate or braces the axle without inspecting or recording the tag (CRA-F0040, MEDIUM). In The Headless Rider, the hood/lantern explanation and injury/horse/brother outcomes remain route-specific; the unused keeper-fetch and turn flags leave a minor action-feedback concern.

The Last House before the Woods unconditionally grants Knowledge that a stranger called from beyond the fence. On barred-door/shutter routes, the caller remains unidentified; only the caller-seen/fled variants establish a stranger (CRA-F0041, LOW). The Séance at Bellweather House funnels routes that never heard the voice or wrote down its answer into an ending that says the family keeps a written answer, the voice remains a shared account, and part of the fee is recovered. Those are route-specific discoveries/actions (CRA-F0042, MEDIUM).

In The Red Chalk Circle, a retreat or successful struggle at the disturbed boundary reaches `chalkAfter` without visiting the crawlspace, but the shared text says Orin is out (CRA-F0043, HIGH). The Widow’s Mirror uses a common ending claiming the glazier dismantles the mirror even after a simple carry-out or cover route that never requests the service (CRA-F0044, LOW). The Bone Box’s current post-definition variants truthfully distinguish burning and keeping the map; leaving the closed box to the broker leaves later custody to the broker. The Lantern at the Crossing checks that the Lantern owns Spirit Glass but not that the item is usable; engine requirements treat `itemUpgrades` separately from condition, so a BROKEN Lantern still exposes the clue (CRA-F0045, MEDIUM). The Quiet Room’s current post-definition patch correctly separates sealing the hatch from leaving before dawn.

## Positions 191–200

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 191 | The House with Two Cellars | CONFIRMED DEFECT | CRA-F0046 (MEDIUM) — common ending says jar names were copied even when the player never inspected them. |
| 192 | The Black Thread | CONFIRMED DEFECT | CRA-F0047 (MEDIUM) — shared resolution says the tailor opened the storeroom and threads were cut on routes that never did so. |
| 193 | The Medium Who Knows Too Much | CONFIRMED DEFECT | CRA-F0048 (MEDIUM) — paid-reading challenge can refund the same coin twice. |
| 194 | The Thing Under the Floorboards | MINOR CONCERN | Ending identifies the underfloor presence as the old owner’s remains without route proof. |
| 195 | The Candle That Will Not Go Out | HEALTHY | — |
| 196 | The Book Without a Title | CONFIRMED DEFECT | CRA-F0049 (MEDIUM) — ending says the printer copied a mark on routes that never examined it. |
| 197 | The Voice in the Well | CONFIRMED DEFECT | CRA-F0050 (HIGH) — departure/retreat inherits the mason’s cap and speaking-tube discovery. |
| 198 | The Empty Coffin | CONFIRMED DEFECT | CRA-F0051 (HIGH) — bypass routes claim the living cooper’s deception was solved. |
| 199 | The Man Who Came Back Wrong | CONFIRMED DEFECT | CRA-F0052 (MEDIUM) — shared ending imports sluice and footprint discoveries into bypass routes. |
| 200 | Hanging Charms | HEALTHY | — |

The House with Two Cellars always says the jar labels were copied, even when the player stays above, fastens the arch without recording names, or retreats after the skeleton appears; only the `readJarNames` route copies them (CRA-F0046, MEDIUM). In The Black Thread, `threadAfter` says the tailor opens his storeroom and the group cuts the strands together even after routes that leave the street or only tell neighbors; this is an incompatible shared resolution (CRA-F0047, MEDIUM).

The Medium Who Knows Too Much charges one coin, then applies a one-coin refund on `askSource` and another on the gated `acceptRefund`, yielding a net gain of one coin for a single fee (CRA-F0048, MEDIUM). This is a distinct compensation-accounting pattern, recorded as new cluster CRA-C0005. The Thing Under the Floorboards’ old-owner identity is not established by the current route; because it may be intended but lacks explicit evidence, it remains a minor concern rather than a confirmed finding.

The Book Without a Title’s common ending says the printer copies the repeated mark even when the Traveler closes the book or stops reading before inspecting/copying its margins (CRA-F0049, MEDIUM). The Voice in the Well sends direct leave and haul-back routes to text where a mason has capped the well and found a speaking tube, although those routes never call him or inspect the wall (CRA-F0050, HIGH). The Empty Coffin’s close/delay and avoid-accusation routes claim the missing-body cause is known despite never finding the living cooper in the side room (CRA-F0051, HIGH). The Man Who Came Back Wrong likewise says the miller sealed the drain and reports the second footprint set after routes that never inspect the sluice (CRA-F0052, MEDIUM). The patched Candle and Hanging Charms endings preserve their distinct leave, closure, entry, and inspection outcomes.

## Positions 201–210

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 201 | The Third Knock | HEALTHY | — |
| 202 | The Wrong Shadow | CONFIRMED DEFECT | CRA-F0053 (MEDIUM) — shared ending includes a lamplighter who was absent; CRA-F0054 (LOW) — Lantern use lacks a usable-item gate. |
| 203 | The Red Chapel | HEALTHY | — |
| 204 | The Man Who Wouldn’t Stay Dead | HEALTHY | — |
| 205 | Below the Old Fort | CONFIRMED DEFECT | CRA-F0055 (MEDIUM) — ending claims a copied route plan on routes that never found it; CRA-F0056 (LOW) — silvered knife use lacks a usable-item gate. |
| 206 | The Barrow Door | HEALTHY | — |
| 207 | The Hollow Man | CONFIRMED DEFECT | CRA-F0057 (LOW) — broken smallKnife still enables bone removal. |
| 208 | The Borrowed Face | MINOR CONCERN | Final text assumes a mirror/glazier follow-up even on dismissal without a mirror scene. |
| 209 | The Doorway with No Room | CONFIRMED DEFECT | CRA-F0058 (MEDIUM) — default seal/withdraw ending claims a second opening and builder measurements not established on those routes. |
| 210 | The Last Candle in the House | HEALTHY | — |

The Third Knock keeps its letter states and delivery choices distinct: the name is established before the player can carry it, and the sealed letter can be burned, left, returned at dawn, or delivered. The Wrong Shadow’s shared ending says both the lamplighter and Traveler saw the turn and that the lamplighter reached the crowded street even when the Traveler left or tested the shadow without calling him (CRA-F0053, MEDIUM). Its `testShadowLight` choice also physically uses the starting Lantern without requiring it to be usable (CRA-F0054, LOW).

The Red Chapel retains the route-specific Salt/Chalk interruption, trapped-participant movement, and retreat outcomes. In Below the Old Fort, the common resolution claims a copied route plan even from barracks/lamp/guard routes that never enter the powder room, where the plan is found (CRA-F0055, MEDIUM). The separate silvered-edge action checks the smallKnife upgrade but not whether the knife is usable (CRA-F0056, LOW). The Man Who Wouldn’t Stay Dead keeps its marker/stake evidence and retreat/failure outcomes bounded; the Barrow Door’s patched variants distinguish the son returned, left inside, outside call, and never-entered states.

The Hollow Man’s optional bone-removal action checks only knife ownership, so a BROKEN smallKnife can still perform the physical action (CRA-F0057, LOW); its other endings do not claim the missing worker was found. The Borrowed Face’s common ending assumes an inn mirror was covered and left for glazier inspection even on the direct dismissal route; because the inn could plausibly contain an unmentioned mirror, this remains a minor concern. The Doorway with No Room’s patches distinguish opening the far door and turning back, but the default ending still claims both openings were bricked in and builder measurements confirmed the impossible corridor on direct seal and threshold-measure/leave routes (CRA-F0058, MEDIUM). The Last Candle in the House’s current variants preserve waiting outside, inspection, and snuffing without inspection.

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** CRA-F0002, CRA-F0003, CRA-F0005, CRA-F0012–CRA-F0019, CRA-F0022, CRA-F0028–CRA-F0029, CRA-F0032–CRA-F0033, CRA-F0035–CRA-F0040, CRA-F0042–CRA-F0044, CRA-F0046–CRA-F0047, CRA-F0049–CRA-F0053, CRA-F0055, CRA-F0058–CRA-F0069.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004, CRA-F0031, CRA-F0034, CRA-F0041.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.
- **CRA-C0004 — Gear ownership treated as Gear usability:** CRA-F0020, CRA-F0021, CRA-F0023–CRA-F0027, CRA-F0030, CRA-F0045, CRA-F0054, CRA-F0056–CRA-F0057.
- **CRA-C0005 — A single fee can be refunded more than once:** CRA-F0048; an intermediate refund and follow-up refund both apply money effects for the same paid reading.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. The After the Storm and Washout-focused suites passed: 11 tests across 3 files. Inventory and scenario-registry validation passed: 16 tests across 2 files, including the 861-Adventure registry assertion. The Honest Work shared-builder suite passed: 12 tests. Batch 51–60 suites (`honestWorkBatch.test.ts` and `commerceBatch.test.ts`) passed: 27 tests across 2 files. Batch 61–70 Commerce and Community suites passed: 29 tests across 2 files. Batch 71–80 Community/Wilderness plus Gear-condition suites passed: 37 tests across 3 files. Batch 81–90 Wilderness, Animals, and Gear-condition suites passed: 35 tests across 3 files. Batch 91–100 animal and pleasant-day suites passed: 19 tests across 2 files. Batch 101–110 pleasant-day and dispute suites passed: 15 tests across 2 files. Batch 111–120 Disputes and Strange Roads suites passed: 23 tests across 2 files. Batch 121–130 second-wave, registry, and diversity suites passed: 20 tests across 3 files. Batch 131–140 second-wave, domestic payoff, and content-depth suites passed: 16 tests across 3 files. These tests support, but do not substitute for, source route review. No gameplay repairs, test changes, deployment, or scheduler changes were made. Checkpoints are committed locally; remote fetch/push is unavailable in this environment. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.

Batch 141–150 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, and `riverWaterWorkGenreBatch.test.ts`) passed: 24 tests across 3 files. These graph/reachability and related content checks support, but do not replace the route-level source review.

Batch 151–160 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, `compensationAccountingC2.test.ts`, and `qaContentCorrections.test.ts`) passed: 36 tests across 4 files. No gameplay source or tests were changed.

Batch 171–180 supporting suites (`octoberAffinityBatch.test.ts`, `secondWaveBatch.test.ts`, and `contentDepth.test.ts`) passed: 28 tests across 3 files. These support, but do not replace, the route-level source review. No gameplay source or tests were changed.

Batch 181–190 supporting suites (`octoberAffinityBatch.test.ts`, `occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `scenarioRegistryValidation.test.ts`) passed: 57 tests across 4 files. They support, but do not replace, the route-level source review. No gameplay source or tests were changed.

Batch 191–200 supporting suites (`occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `scenarioRegistryValidation.test.ts`) passed: 44 tests across 3 files. They support, but do not replace, the route-level source review. The root-cause cluster pointer was advanced to CRA-C0006 after adding CRA-C0005; no established cluster was renumbered. No gameplay source or tests were changed.

Batch 201–210 supporting suites (`occultInvestigationBatch.test.ts`, `finalChoiceConsequenceAudit.test.ts`, and `equipment.test.ts`) passed: 52 tests across 3 files. Scenario registry validation was rerun separately; checks support, but do not replace, the route-level source review. No gameplay source or tests were changed.

## Positions 211–220

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 211 | The Pass Before Snow | CONFIRMED DEFECT | CRA-F0059 (MEDIUM) — the shared rescue ending claims a signal was answered after a route that only crawls to shelter. |
| 212 | No Water at Miller’s Spring | CONFIRMED DEFECT | CRA-F0060 (MEDIUM) — a successful basin dig converges into text locating the seep in a different place. |
| 213 | The Broken Axle | CONFIRMED DEFECT | CRA-F0061 (LOW) — a successful rush-to-town route is praised as un-rushed. |
| 214 | Across the Floodplain | CONFIRMED DEFECT | CRA-F0062 (MEDIUM) — guarding the cart reaches a rescue ending that says the Traveler signaled. |
| 215 | The Cave Before the Storm | HEALTHY | — |
| 216 | The Lost Survey Party | CONFIRMED DEFECT | CRA-F0063 (MEDIUM) — refusal/retreat outcomes claim unmade search marks. |
| 217 | Three Days to the Railhead | HEALTHY | — |
| 218 | Whiteout | HEALTHY | — |
| 219 | The Last Rope | CONFIRMED DEFECT | CRA-F0064 (MEDIUM) — successful direct lowering inherits rope loss/strain; CRA-F0065 (LOW) — fetching a crew is narrated as calling one. |
| 220 | The Empty Cabin | HEALTHY | — |

The Pass Before Snow’s crawl-and-wait option and gear-gated downhill signal converge on `passRescue`, whose unconditional “Your signal is answered” only fits the latter (CRA-F0059). No Water at Miller’s Spring routes a successful dig at the old basin into `springSeep`, whose location text instead places the water below a branch in the shaded fold (CRA-F0060). In The Broken Axle, the successful `forceBrokenWagon` branch explicitly chooses to drive before dark, but the shared settlement praises the Traveler for not rushing (CRA-F0061). Across the Floodplain routes “Keep the family and cart on the rise” to a rescue ending that says the crew arrived after a signal, although that branch takes no signaling action (CRA-F0062).

The Lost Survey Party’s refusal and slope-retreat routes enter `surveyDelay`, which claims clear marks were left at both camp and slope; only the creek-avoidance route actually marks a place (CRA-F0063). The Last Rope has two independent route facts lost in convergence: the successful direct lowering route keeps an undamaged rope, while `porterUp` says it remains behind or took strain; and retreating to fetch a crew reaches `ravineWait`, which says the crew followed a call (CRA-F0064/F0065). The Cave Before the Storm, Three Days to the Railhead, Whiteout, and The Empty Cabin retain route-appropriate knowledge, item/participant state, consequences, and endings. Supporting Survival Expedition suite passed: 11 tests in one file, including exhaustive fresh-character route/chance exploration and selected gear branches; the separate registry release validation passed 3 tests and confirmed the 861-entry registry. Tests support but do not replace the source review.

## Positions 221–230

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 221 | The Long Way Around | HEALTHY | — |
| 222 | River without a Bridge | CONFIRMED DEFECT | CRA-F0066 (MEDIUM) — a successful crossing is described as a safe route marked for others, though no branch marks it and one branch is a hazardous ford. |
| 223 | Night on the Ridge | HEALTHY | — |
| 224 | The Markers Stop | HEALTHY | — |
| 225 | The Ice Gives Warning | CONFIRMED DEFECT | CRA-F0067 (MEDIUM) — solo failure invents a rope rescue; CRA-F0068 (MEDIUM) — “leave the cart” later says it arrives. |
| 226 | The Washed-Out Cut | MINOR CONCERN | No-contact wait can reach a repair-crew ending; the explicit wait choice makes this plausible but the alert path is unstated. |
| 227 | The Wrong Valley | HEALTHY | — |
| 228 | The Rocks Start Moving | HEALTHY | — |
| 229 | The Tree across the Creek | HEALTHY | — |
| 230 | The Abandoned Camp | CONFIRMED DEFECT | CRA-F0069 (LOW) — the silent return route reaches a shared ending that reports no answer to a call. |

River without a Bridge’s successful crossings converge on text saying a safe way has been found and marked for travelers behind, despite no route marking action and despite direct-current fording being an explicitly hazardous alternative (CRA-F0066). In The Ice Gives Warning, a failed solo crossing reaches an ending that introduces an unestablished rope rescue; a separate “leave the cart” route also shares an ending claiming the cart arrives later without any recovery or transport action (CRA-F0067/F0068). In The Abandoned Camp, returning from the stream without calling reaches `campAnswer`, which says no one answers from the ridge or stream (CRA-F0069); taking food also leads to an automatic note-writing aftermath, retained as a lesser player-agency concern. The Washed-Out Cut’s direct wait-for-crew route lacks a shown alert, but the option itself frames the crew as expected, so the ambiguity remains minor rather than a confirmed defect. The other six routesets retain their route-specific time, participant, Gear, Knowledge, location, and consequence distinctions. The Survival Expedition support suite passed 11 tests; it checks exhaustive route/chance reachability but is not a substitute for semantic review.

## Positions 231–240

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 231 | The Wind Changes | HEALTHY | — |
| 232 | The Load Must Go | CONFIRMED DEFECT | CRA-F0070 (MEDIUM) — the wagon-slip scene contradicts which load was left safe; CRA-F0071 (MEDIUM) — walking the driver out is narrated as bringing the medicine chest and listing cargo. |
| 233 | Hold until Morning | HEALTHY | — |
| 234 | The Christmas Goose | HEALTHY | — |
| 235 | The Last Parcel Before Christmas | CONFIRMED DEFECT | CRA-F0072 (MEDIUM) — an ambiguous address clue grants Knowledge asserting a specific intended recipient/location. |
| 236 | A Place at the Table | HEALTHY | — |
| 237 | Carolers at Wrong House | HEALTHY | — |
| 238 | Christmas Tree on Miller’s Hill | CONFIRMED DEFECT | CRA-F0073 (LOW) — a clean-fall route reaches text asserting split branches were cut. |
| 239 | Gift with No Name | HEALTHY | — |
| 240 | Christmas at Station | CONFIRMED DEFECT | CRA-F0074 (MEDIUM) — a shared ending grants History claiming station-helping participation after routes that leave or do not help. |

In The Load Must Go, `unloadOil`/`unloadBedding` each establish that the chosen load is safely shelved, but the later shared failure says both the barrel split and bedding soaked. Its `saveDriverLoad` route evacuates only the driver while the ending additionally claims the medicine chest arrived and left cargo was listed (CRA-F0070/F0071). The Last Parcel Before Christmas turns an explicitly ambiguous clerk recollection into persistent Knowledge of Nell’s intended bridge-side address, although the route later establishes she is staying with her aunt at the mill (CRA-F0072). Christmas Tree on Miller’s Hill’s clean-fall branch reaches square-arrival wording that says split branches were cut; only rough-fall cleanup establishes that (CRA-F0073). Christmas at Station unconditionally grants History that the Traveler spent the night helping passengers at the station, including routes where they leave by carter or walk to a farmhouse and routes that only wait or ride (CRA-F0074). A passive telegraph report in the coal-saving branch was retained as a minor concern, not a separate confirmed defect. Other batch routes retained truthful state and consequence distinctions. The combined Christmas affinity, Survival Expedition, and registry suites passed: 32 tests across 3 files. These tests support, but do not replace, route-level source review. No gameplay source or tests were changed.

Batch 231–240 added five findings, with no new CRA cluster required. Totals are now 157 HEALTHY, 15 MINOR CONCERN, and 68 CONFIRMED DEFECT across 240 reviewed Adventures; 621 remain. The next canonical registry entry is position 241, The Missing Stocking, and the next finding ID is CRA-F0075.

## Positions 241–250

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 241 | The Missing Stocking | CONFIRMED DEFECT | CRA-F0075 (LOW) — the quiet-return route is shown as if the brother confessed after the player chose not to hear his explanation. |
| 242 | The Toymaker’s Last Order | HEALTHY | — |
| 243 | The Pageant Problem | CONFIRMED DEFECT | CRA-F0076 (LOW) — shared rehearsal text asserts mutually exclusive substitute/returning-child states. |
| 244 | The Stranger’s Christmas Dinner | HEALTHY | — |
| 245 | Three Gifts, Two Labels | HEALTHY | — |
| 246 | The Christmas Visitor | HEALTHY | — |
| 247 | The Empty Chair at Midnight | HEALTHY | — |
| 248 | The Evergreen Door | HEALTHY | — |
| 249 | The Gift That Came Back | HEALTHY | — |
| 250 | The Snowbound Inn | HEALTHY | — |

In The Missing Stocking, `quietReturn` from the stable sets `stockingFound` and enters the reunion variant, which says the brother admits moving the stocking as a joke. The preceding stable scene only says he offers to explain; the player selected the alternative to avoid the public explanation, and no subsequent route state or scene establishes that he confesses privately (CRA-F0075). In The Pageant Problem, the common rehearsal prose asserts both a substitute innkeeper and a returning child regardless of branch. It therefore contradicts the prop-only path, Traveler substitution, sibling substitution, and child-return routes; the later performance variants do correctly distinguish the participant routes (CRA-F0076). The remaining eight Adventures preserve the important route distinctions: tool-repair versus simpler toy completion and delay; anonymous-donor uncertainty and correctly gated extra-bowl payment; gift-giver confirmation before parcel assignment; visitor claims versus letter proof; unresolved napkin mystery; cellar descent versus daylight/neighbor plans; family ownership decisions about the wooden bird; and paired/solo search, failure, and dawn discovery at the snowbound inn. The Christmas affinity and registry suites passed 21 tests across 2 files; these checks support but do not replace the source review. No gameplay source or tests were changed.

Batch 241–250 added two LOW-severity findings to CRA-C0001; no new cluster was required. Totals are now 165 HEALTHY, 15 MINOR CONCERN, and 70 CONFIRMED DEFECT across 250 reviewed Adventures; 611 remain. The next registry entry is position 251, Footprints around the House, and the next finding ID is CRA-F0077.

Batch 161–170 used the same four supporting suites: 36 tests passed across 4 files. These checks support, but do not replace, route-level source review.

## Positions 251–260

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 251 | Footprints around the House | HEALTHY | — |
| 252 | The Red Scarf in the Snow | HEALTHY | — |
| 253 | The Empty Sleigh | HEALTHY | — |
| 254 | The House with the Warm Window | HEALTHY | — |
| 255 | The Frozen Letter | CONFIRMED DEFECT | CRA-F0077 (MEDIUM) — the sealed-letter route grants Knowledge that the letter is not urgent without learning its contents. |
| 256 | The Longest Night | HEALTHY | — |
| 257 | The Ice Lanterns | HEALTHY | — |
| 258 | The Widow’s Firewood | CONFIRMED DEFECT | CRA-F0078 (MEDIUM) — accepting only the neighbor’s own wood still claims the miller’s logs were returned. |
| 259 | The Road under Snow | HEALTHY | — |
| 260 | The Frozen Millwheel | CONFIRMED DEFECT | CRA-F0079 (MEDIUM) — a gate-bracing success reaches the repaired-wheel outcome without route proof that the bearing was warmed. |

The Frozen Letter’s `mill.secureLetter` branch keeps the letter sealed but grants Knowledge that it is not an emergency warning. That conclusion appears only on the separate `askMiller` → `letterContext` route (CRA-F0077). In The Widow’s Firewood, `acceptOwnWood` joins the same settlement as `correctTheft`; only the latter separates and returns the miller’s logs, yet both settlement and ending claim they were returned (CRA-F0078). The Frozen Millwheel’s failed sluice-handle route can succeed by bracing the gate and having the miller close it, then reach `wheelFreed` without establishing bearing heat; the result, History, and payoff describe the full warmed-bearing/pressure-eased repair (CRA-F0079). The other seven Adventures keep route evidence and consequence distinctions coherent across their search, travel, rescue, refusal, object, and persistence paths. The Christmas affinity and registry suites passed 21 tests across 2 files; these checks support but do not replace the route-level review. No gameplay source or tests were changed.

Batch 251–260 added three MEDIUM findings to existing clusters; no new cluster was required. Totals are now 172 HEALTHY, 15 MINOR CONCERN, and 73 CONFIRMED DEFECT across 260 reviewed Adventures; 601 remain. The next registry entry is position 261, The Visitor at Midnight, and the next finding ID is CRA-F0080.

## Positions 261–270

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 261 | The Visitor at Midnight | CONFIRMED DEFECT | CRA-F0080 (MEDIUM) — the shelter route establishes a visitor is present, but the shared ending reopens whether anyone stood at the door. |
| 262 | The Bridge Goes Down | CONFIRMED DEFECT | CRA-F0081 (HIGH) — calling the driver to abandon the wagon sets rescue proof and enables text claiming he reached shore. |
| 263 | Smoke over Main Street | HEALTHY | — |
| 264 | The Train That Didn’t Stop | CONFIRMED DEFECT | CRA-F0082 (MEDIUM) — running alongside is credited with clearing the track and averting collision. |
| 265 | The Mine Gives Way | HEALTHY | — |
| 266 | Water Through the Door | HEALTHY | — |
| 267 | The Boiler Room | CONFIRMED DEFECT | CRA-F0083 (HIGH) — un-warned worker routes reach an ending that says workers were counted outside. |
| 268 | The Crowd Breaks | CONFIRMED DEFECT | CRA-F0084 (LOW) — a passive wait after failed crowd control grants History credit for guiding the crowd. |
| 269 | The Ferry Lists | HEALTHY | — |
| 270 | The Roof Comes In | CONFIRMED DEFECT | CRA-F0085 (MEDIUM) — bracing the wall alone reaches text claiming the visible pair are already outside. |

The Visitor at Midnight retains the uncertainty about identity and the missing tracks, but the `offerSafeShelter` route explicitly places the visitor in the outer room until the watch arrives; `midnightEnd` nevertheless questions whether anyone stood at the door (CRA-F0080). In The Bridge Goes Down, `childAcross.callFather` only calls the driver to abandon the wagon but sets `bridgePeopleSaved`, enabling the finale to say the driver reached shore; `muleSaved.muleCallDriver` repeats the unsupported proof (CRA-F0081). In The Train That Didn’t Stop, the `runAlongside` option enters `platformClear` without warning or clearing effects, yet the shared scene and later History/ending credit track clearance and collision prevention (CRA-F0082). The Boiler Room’s `tellForeman`/`inspectValve` routes bypass worker evacuation, while the foreman scene explicitly conditions workers being outside on the player having warned them; the shared aftermath/end still says workers are counted outside (CRA-F0083). The Crowd Breaks’ failed stand-call followed by `fallStayWall` only waits for stewards to act, but the later report grants History for helping guide the crowd (CRA-F0084). The Roof Comes In’s direct `braceNorth` branch reaches `wallBraced`, which unconditionally claims the visible pair are already outside even though only `eastPair` performs that evacuation (CRA-F0085). The other four Adventures preserve their rescue, object, and outcome distinctions across the reviewed routes.

Batch 261–270 added six findings to existing CRA-C0001/C0002 patterns; no new cluster was needed. Totals are now 176 HEALTHY, 15 MINOR CONCERN, and 79 CONFIRMED DEFECT across 270 reviewed Adventures; 591 remain. CRA-F0080–CRA-F0085 comprise two HIGH, three MEDIUM, and one LOW finding. The Christmas affinity, disaster state-aware, and registry suites passed 25 tests across 3 files; these checks support but do not replace the source review. No gameplay source or tests were changed. The next registry entry is position 271, The Powder Wagon, and the next finding ID is CRA-F0086.

## Positions 271–280

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 271 | The Powder Wagon | HEALTHY | — |
| 272 | After the Tornado | CONFIRMED DEFECT | CRA-F0086 (MEDIUM) — checking the cow’s gate sets the “moved” proof and makes the ending say it is safe. |
| 273 | The Second Wave | HEALTHY | — |
| 274 | Wanted in Red Creek | HEALTHY | — |
| 275 | The Man at the End of the Bar | CONFIRMED DEFECT | CRA-F0087 (MEDIUM) — exit routes that never hear from a clerk still say the clerk corrected the accusation. |
| 276 | The Stage Was Hit | CONFIRMED DEFECT | CRA-F0088 (MEDIUM) — the coach party is said to travel under escort even when no town help was summoned. |
| 277 | The Bounty Poster | HEALTHY | — |
| 278 | The Empty Jail | CONFIRMED DEFECT | CRA-F0089 (LOW) — waiting without contacting anyone reaches text asserting a clerk reviewed the charge book. |
| 279 | Three Men at the Water Trough | HEALTHY | — |
| 280 | The Rustled Herd | CONFIRMED DEFECT | CRA-F0090 (MEDIUM) — settlement combines market and holding-pasture counts when either source was not visited. |

After the stove is made safe in After the Tornado, the cow remains unresolved; choosing only to check its gate sets `tornadoCowMoved` and later counts it safe (CRA-F0086). The Man at the End of the Bar routes directly through the kitchen exit or a successful weapon diversion to `safeEnd` without contacting the clerk, but the ending says the clerk corrected the accusation (CRA-F0087). The Stage Was Hit permits waiting with survivors without warning town; the doctor/escort is conditional in the survivor scene but the ending makes escort unconditional (CRA-F0088). The Empty Jail’s wait-only route neither calls nor finds the clerk, yet `jailerBack` reports the clerk’s review and the wait scene refers to an unanswered call (CRA-F0089). The Rustled Herd can reach settlement from the brands alone, from market, or from the holding pasture, but settlement always combines the buyer’s twelve-calf receipt and the eighteen-cattle holding count (CRA-F0090). The other five Adventures preserve their route-specific knowledge, hazard control, rescue, suspicion, and animal/property outcomes.

Batch 271–280 added five findings to CRA-C0001; no new cluster was needed. Totals are now 181 HEALTHY, 15 MINOR CONCERN, and 84 CONFIRMED DEFECT across 280 reviewed Adventures; 581 remain. CRA-F0086–CRA-F0090 comprise four MEDIUM and one LOW finding. The disaster/western/registry suites passed 12 tests across 3 files; these checks support but do not replace source review. No gameplay source or tests were changed. The next registry entry is position 281, A Gun on the Table, and the next finding ID is CRA-F0091.

## Positions 281–290

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 281 | A Gun on the Table | CONFIRMED DEFECT | CRA-F0091 (MEDIUM) — routes that do not fetch the harvest book reach text asserting its repayment entry and a negotiated balance/date. |
| 282 | The Outlaw’s Mother | CONFIRMED DEFECT | CRA-F0092 (LOW) — handing the letter to the deputy grants History that family news was carried to the wanted son. |
| 283 | The False Deputy | HEALTHY | — |
| 284 | One Horse, Two Riders | HEALTHY | — |
| 285 | The Last Shot | CONFIRMED DEFECT | CRA-F0093 (LOW) — a retreat without signaling the rancher grants History credit for helping them leave. |
| 286 | The Map in the Ledger | CONFIRMED DEFECT | CRA-F0094 (LOW) — copying an unexplained map can end by naming its mark as a water gate. |
| 287 | The Town That Moved | HEALTHY | — |
| 288 | The Old Survey Stone | HEALTHY | — |
| 289 | The Sealed Mine Office | HEALTHY | — |
| 290 | The Room Behind the Chimney | CONFIRMED DEFECT | CRA-F0095 (MEDIUM) — partial or unexamined routes converge on claims that the family learned the room’s purpose and returned both objects. |

In A Gun on the Table, `distanceTalk` and the innkeeper’s `hallCall` both reach `book` without retrieving the harvest book, but that scene presents its eight-coin repayment entry as known. A successful grab-and-secure route bypasses the book yet reaches a settled ending that states the conditional four-coin balance and accepted date (CRA-F0091). The Outlaw’s Mother correctly gates delivery wording on `familyNewsDeliveredToSon`, but the separate `deputyLetter` choice grants History claiming family news was carried to the wanted son even though the letter was given to the deputy (CRA-F0092). In The Last Shot, `coverLeave` reaches retreat without signaling the rancher; the retreat scene says their safety depends on following a signal, but `retreatReport` still grants History credit for helping them leave (CRA-F0093). In The Map in the Ledger, copying the map or returning from the creek before reading the stone reaches an ending that identifies the mark as a water gate; that interpretation is established only by `stoneRecord` (CRA-F0094). The Room Behind the Chimney’s shared discovery claims both the purpose was learned and both objects were returned, although braced withdrawal learns no letter contents and retrieves nothing, while box and letter routes can return only one object (CRA-F0095). One Horse, Two Riders’ foot-follow branch permits the explicit `trackDoctor` action to take the stranger to the ranch house before the doctor-ending claim; other routes preserve the pouch/posse distinctions. The False Deputy preserves the distinction between reporting and escort, The Town That Moved’s discovery is supported by its visited marker/record routes, the Old Survey Stone’s calf-return claims remain correctly gated by `oldSurveyCalfReturned`, and the Sealed Mine Office uses route-specific variants to avoid importing private wage, notice, map, or drainage facts. Western outlaw, Lost Places, and registry suites passed 13 tests across 3 files. No gameplay source or tests were changed.

Batch 281–290 added five findings to existing CRA-C0001/C0002 patterns; no new cluster was required. Totals are now 186 HEALTHY, 15 MINOR CONCERN, and 89 CONFIRMED DEFECT across 290 reviewed Adventures; 571 remain. CRA-F0091–CRA-F0095 comprise two MEDIUM and three LOW findings. The western outlaw, Lost Places, and registry suites passed 13 tests across 3 files. No gameplay source or tests were changed. The next canonical registry entry is position 291, The Island When the Water Falls, and the next finding ID is CRA-F0096.
