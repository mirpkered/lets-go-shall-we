# Current-Library Semantic Audit

Status: **IN PROGRESS — LIVE REGISTRY RECONCILED**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Registry order source: `src/scenarios/index.ts`; registry snapshot SHA: `5676b85c4c4d4c84d18e7558f1968870961686bb`.
Current live registry: 861 Adventures; 826 live Adventures reviewed; 35 remain. First live gap: position 731, The Fencing Pliers at Willow Turn (`the-fence-pliers-at-willow-turn`). Next finding ID `CRA-F0350`; next available cluster ID `CRA-C0012`.

## Current checkpoint

The canonical registry order is the live exported `SCENARIOS` array in `src/scenarios/index.ts`; stable ID is primary and position is derived. Reconciliation now separates **826 live-reviewed** Adventures from **24 reviewed-but-unregistered historical** records. The historical records and their seven attached findings remain preserved in `adventures` and `unregisteredReviewedAdventures`, but do not count toward live coverage or live defect totals. The latest 20 completed reviews map by stable ID to current positions 809–828; their semantic notes and findings were preserved while their positions were corrected. Historical batch text below is retained as history and must not be read as live-coverage accounting. No scenario source or gameplay test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 460 |
| MINOR CONCERN | 58 |
| CONFIRMED DEFECT | 308 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed live Adventures | 826 |
| Live Adventures remaining | 35 |

There are 349 finding records in the preserved audit history: 342 attached to live registered Adventures and seven attached to unregistered records. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing; these account for 10 unrecovered severity values. Live severity totals are HIGH 13, MEDIUM 273, LOW 46, plus 10 unrecovered values.

### Live-registry reconciliation

The 24 unregistered reviewed Adventure IDs are recorded in the JSON `unregisteredReviewedAdventures` section. All 24 source files still exist, but those IDs are absent from the exported live `SCENARIOS` array; this is unregistered/draft content, not deleted source or duplicate replacement. The original 11 wilderness draft records remain preserved along with 13 additional unregistered records from later recorded batches.

Those 24 records comprise 15 HEALTHY, 2 MINOR CONCERN, and 7 CONFIRMED DEFECT classifications. Their seven findings are CRA-F0239–CRA-F0242, CRA-F0275, CRA-F0276, and CRA-F0281. Historical cluster memberships are CRA-C0001: 2 and CRA-C0004: 5. Current live cluster counts are CRA-C0001 220, C0002 18, C0003 1, C0004 34, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, C0010 11, and C0011 15 (336 clustered live findings); six live findings are unclustered.

Coverage invariant: **861 registered = 826 reviewed + 35 remaining**. The verified unreviewed position ranges are **731–732** and **829–861**. The first unreviewed live entry is position 731, `the-fence-pliers-at-willow-turn` — The Fencing Pliers at Willow Turn — `src/scenarios/agricultureRanchAnimalWorkGenreBatch.ts`.

## Registry position reconciliation (historical note; superseded by live-registry correction above)

The earlier reconciliation paragraph below reflects a stale checkpoint and is superseded by the correction above. The current ledger is stable-ID-first; 639 records count as live reviews, while 11 reviewed records are segregated as unregistered history. Two live position shifts are corrected by stable ID; unregistered draft records do not have live positions.

Position drift is nonuniform. Positions 1–120 matched directly. Recorded positions 121–345 map +4 to live positions; recorded positions 346–418 map +12. The two legacy October IDs resolve at current positions 176–177. These are checkpoint bookkeeping omissions/stale position labels; the gameplay source snapshot did not change from `cba101f0feba09c67543f942331ca38f765ebe14`.

The earlier position-650 statement is historical only and is not live coverage. The highest contiguous live-reviewed position is 639, with no gaps. The next unreviewed live Adventure is position 640, Weighed Before Dawn (`weighed-before-dawn`); 222 current registered Adventures remain.

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

## Audit continuation (live positions 461–470)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order, spanning the remaining Gear Corrective entries and first five Adventurer Support entries. Traced salvage ownership/reporting, old versus fresh depth measurements, load/axle routes and delayed inspection, airflow diagnosis, bridge stabilization and closure, distant-person responses, tool-specific trail clearing, disputed boundary evidence, recovery versus leaving the cave tin, and animal load/harness outcomes. Supporting Gear Corrective, Adventurer Support, registry, and equipment suites passed 44 tests across four files; tests support but do not replace the route review.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 461 | The Claimed Salvage | HEALTHY | — |
| 462 | The Sounding Line | HEALTHY | — |
| 463 | The Wheel Before Dawn | CONFIRMED DEFECT | CRA-F0184 (MEDIUM) — inspection claims a lightened load on routes that never unload or shift the freight. |
| 464 | The Apprentice’s Light | HEALTHY | — |
| 465 | The Bridge Crew’s Wedge | MINOR CONCERN | — the no-tool inspection route still says the Traveler’s tool choice affected how the beam was held. |
| 466 | The Glass Road | HEALTHY | — response variants distinguish hearing the missing assistant from finding only tracks. |
| 467 | Saw Before Sunrise | CONFIRMED DEFECT | CRA-F0185 (MEDIUM) — the spare-saw ending calls Marr’s saw damaged without any route establishing tooth loss. |
| 468 | A Chain of Sight | HEALTHY | — both survey lines, supporting testimony and unresolved ownership remain separate. |
| 469 | Three Points Down | HEALTHY | — recovered tin goes directly to a recovery-specific result; leave/withdraw paths retain the tin-below follow-up. |
| 470 | The Mule Load | HEALTHY | — equipment limits, animal state, second-mule follow-up and reward remain route-consistent. |

CRA-F0184 and CRA-F0185 extend CRA-C0001 (route-specific load/object-condition state lost at a shared result); no new cluster was created. The ledger is contiguous through position 470; next is position 471, The Pilot Hole (`pilot-hole`), with 391 remaining and next finding CRA-F0186.

## Audit continuation (live positions 471–480)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced bridge repair and diagnosis versus completion; flag/whistle/mirror communication; salvage-anchor and owner-paperwork routes; hound scent/person/watering outcomes; disputed tool custody and combat withdrawals; changed-current chest/collar outcomes; rain/roof safety; uncertain ambush evidence and combat; mine-lift test-load versus person safety; and rail-gate diagnosis, repair, sign-off, and Gear handoff. Supporting Adventurer Support, registry, and equipment suites passed 31 tests across three files; route-level source review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 471 | The Pilot Hole | HEALTHY | — |
| 472 | Flags at the Cut | CONFIRMED DEFECT | CRA-F0186 (MEDIUM) — waiting for the clerk to move to the lookout does not establish that a subsequent flag signal was sent and understood. |
| 473 | The Unseated Winch | HEALTHY | — |
| 474 | The Silent Hound | HEALTHY | — recovery, scent report, and watering remain distinct; direct route regression covers the person-found contrast. |
| 475 | The Iron Claim | HEALTHY | — disputed-tool custody, clerk evidence, and injury withdrawals do not award the disputed auger. |
| 476 | The Flooded Chest | CONFIRMED DEFECT | CRA-F0187 (MEDIUM) — combat victory reaches a generic result claiming recovered property although no recovery path ran. |
| 477 | The Roofline | HEALTHY | — unsafe roof work is postponed and each response protects a different route-established priority. |
| 478 | The Blind Cut | HEALTHY | — suspected ambush remains uncertainty; combat and report routes retain separate outcomes. |
| 479 | The Old Pulley | HEALTHY | — a test bucket is not treated as proof that the cable can carry a person. |
| 480 | The Rail Shed at Noon | CONFIRMED DEFECT | CRA-F0188 (MEDIUM) — diagnosis-only counterweight testing can reach an ending claiming the gate was repaired and signed off. |

CRA-F0186–CRA-F0188 extend CRA-C0001 (route-specific communication, recovery, and repair-completion states lost at shared results); no new cluster was created. The ledger is contiguous through position 480; next is position 481, A Dry Place for the Powder (`the-wet-powder`), with 381 remaining and next finding CRA-F0189.

## Audit continuation (live positions 481–490)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced powder-shed boundary isolation and licensed handling; brush/marker routes versus property boundaries; bridge-closure signals and far-end response; sealed freight custody versus statement/documentation; rough-water passenger safety and mooring; expedition load/sample delivery; washed-out trail detour and both-end closure; cave airflow and partner retreat; payroll escort, fight/withdrawal consequences; and the milepost lookout, station response, evidence recovery, restitution and consent. Supporting Adventurer Support, Road Danger, registry, and equipment suites were used as supporting evidence; route-level review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 481 | A Dry Place for the Powder | HEALTHY | — the shed stays closed and explosive material is never handled. |
| 482 | The Brush Line | HEALTHY | — old property markers, public route, and owner authority remain distinct. |
| 483 | The Missing Brace | MINOR CONCERN | — flags are described as “agreed” without setup; the response immediately confirms receipt and safe closure. |
| 484 | The Wrong Cache | CONFIRMED DEFECT | CRA-F0189 (MEDIUM) — a statement-only ending can reach a Gear reward that claims clerk custody of a case left at the site. |
| 485 | The Rough-Water Watch | HEALTHY | — passenger movement, delayed line use, and combat outcomes preserve the safe-water state. |
| 486 | The Ash Frame | HEALTHY | — sample delivery, fitting recovery, rest and temporary repair outcomes remain distinct. |
| 487 | The Storm Marker | HEALTHY | — detour, meeting and both-end closure routes preserve the hiker’s location and creek-path status. |
| 488 | The Lamp in the Cut | HEALTHY | — airflow diagnosis does not claim the stone moved or cave was cleared. |
| 489 | The Second Gunhand | HEALTHY | — patrol, negotiation, combat, injury and withdrawal preserve payroll/road outcomes. |
| 490 | The Glass at Milepost Nine | CONFIRMED DEFECT | CRA-F0190 (MEDIUM) — aftermath imports “station answered” causality on cover/description routes that never contact it. |

CRA-F0189–CRA-F0190 extend CRA-C0001 (route-specific custody and communication outcomes lost at shared results); no new cluster was created. The ledger is contiguous through position 490; next is position 491, The Screw Jack Road (`the-screw-jack-road`), with 371 remaining and next finding CRA-F0191.

## Audit continuation (live positions 491–500)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order within the Road Danger genre batch. Traced approach flags and shared threat text, response-specific aftermath variants, physical recovery/obstacle changes, end states, combat win/loss and withdrawal, optional Gear/coin/refusal rewards, Knowledge grants, and custody/provenance. The focused Road Danger, registry, and equipment suites passed 23 tests across three files as supporting evidence; route-level source review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 491 | The Screw Jack Road | MINOR CONCERN | — non-combat exits do not explicitly narrate jack abandonment or axle stabilization before the common aftermath/reward; the jack’s presence under the axle makes the transition plausible, so this remains compressed rather than a confirmed contradiction. |
| 492 | The Paper Road | CONFIRMED DEFECT | CRA-F0191 (MEDIUM) — after Pike is sent east, the shared response and aftermath still require her presence at the toll shed to identify/check the case. |
| 493 | The Stones in the Rut | CONFIRMED DEFECT | CRA-F0192 (MEDIUM) — shared aftermath claims the obstruction is cleared on routes that never move the stones. |
| 494 | The Ledger Under Canvas | CONFIRMED DEFECT | CRA-F0193 (MEDIUM) — the shared result reveals what the copied freight number means on branches that never learn it. |
| 495 | The Horse with the Blue Rope | HEALTHY | — the unpaid balance is verified before release; horse/tack stay in stable custody and the gloves are separate compensation. |
| 496 | The Lantern in the Hedge | HEALTHY | — current response and aftermath text preserve purse loss versus safe retreat; focused regression covers the distinction. |
| 497 | The Bridge Keeper Isn’t Home | HEALTHY | — false-fee response/combat outcomes, closure/reopening, and the privately owned spare strap remain route-consistent. |
| 498 | The Wheel with the Clean Cut | CONFIRMED DEFECT | CRA-F0194 (MEDIUM) — the trace-splicing ending names Freightman’s Strap as the method but has no possession/usability gate. |
| 499 | The Inn-Yard Watch | HEALTHY | — all outcomes represent the return and owner identification; damaged inn tack and separate key-case transfer stay distinguished. |
| 500 | The Mill-Road Pursuit | CONFIRMED DEFECT | CRA-F0195 (MEDIUM) — helpDriver only lifts the cart, but shared aftermath and reward claim the axle pin was returned. |

CRA-F0191–CRA-F0193 and CRA-F0195 extend CRA-C0001 (route-specific person, obstacle, information, and recovery state lost at convergence). CRA-F0194 establishes CRA-C0008, a distinct missing availability gate for a named Gear-dependent action; CRA-C0004 remains specifically about broken Gear being treated as usable. No gameplay source or tests changed. The ledger is contiguous through position 500; next is position 501, The Letter Under the Seat (`the-letter-under-the-seat`), with 361 remaining and next finding CRA-F0196.

## Audit continuation (live positions 501–510)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced missing-note recovery and receipt evidence; rope-gated horse/team actions, marked retreat and combat loss; badge, tool-mark and authority responses; ferry-chain/ferryman presence and alternate crossings; courier receipt/wrapper/empty-satchel evidence; right-of-way permit, back-lane and date-check outcomes; camp watch responses and pry-tool custody; purse identity, confession, restitution and reporting; public axle ownership versus smith custody; and the missing waybill case, the Traveler’s separate Lockable Map Case, and coat/case return. The focused Road Danger, registry, and equipment suites passed 23 tests across three files as supporting evidence; route-level source review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 501 | The Letter Under the Seat | CONFIRMED DEFECT | CRA-F0196 (MEDIUM) — aftermath claims Quill keeps the note even when no approach finds it. |
| 502 | The Second Rope | CONFIRMED DEFECT | CRA-F0197 (MEDIUM) — combat loss says the driver takes the marked route although only one approach marks it. |
| 503 | The Brass Notch | CONFIRMED DEFECT | CRA-F0198 (MEDIUM) — shared aftermath attributes an assignment confirmation to the foreman on routes that never contact him. |
| 504 | The Ferry Chain | CONFIRMED DEFECT | CRA-F0199 (MEDIUM) — shared aftermath attributes confirmation to a ferryman not found or called on some branches. |
| 505 | The Courier Who Came Back | CONFIRMED DEFECT | CRA-F0200 (MEDIUM) — the clerk’s “never placed in the satchel” confirmation exceeds the evidence gathered on every response path. |
| 506 | The Closed Gate | CONFIRMED DEFECT | CRA-F0201 (MEDIUM) — shared text imports back-lane movement and a permit-date request not selected on all branches. |
| 507 | The Camp with Two Fires | CONFIRMED DEFECT | CRA-F0202 (MEDIUM) — a return-tool ending is available when the route never establishes that the pry tool was dropped. |
| 508 | The Blue Thread | CONFIRMED DEFECT | CRA-F0203 (MEDIUM) — shared aftermath asserts confession and repayment on branches that establish neither. |
| 509 | The Axle without a Mark | CONFIRMED DEFECT | CRA-F0204 (MEDIUM) — aftermath says the public axle is returned while the route keeps it in smith custody. |
| 510 | The Rain on the Waybill | CONFIRMED DEFECT | CRA-F0205 (MEDIUM) — shared threat/aftermath makes the missing case present and recovered without a recovery route. |

CRA-F0196–CRA-F0205 extend CRA-C0001 (route-specific object, location, authority, information, custody, and outcome facts lost at convergence); no new cluster was needed. No gameplay source or tests changed. The ledger is contiguous through position 510; next is position 511, The Cold Latch (`the-cold-iron-latch`), with 351 remaining and next finding CRA-F0206.

## Audit continuation (live positions 511–520)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced shed-note/ownership/loan evidence, wrench custody after retreat and combat, carried-case/handline alternatives at the ford, payroll preparation and false-toll branches, crate bracing and glass-damage alternatives, sealed-statement custody and escort consent, flock/cart/partial-herding outcomes, ferry-line inspection and distinct crossing methods, and trackside lamp/tool/whistle responses. A source-module correction assigns positions 511–520 to `src/scenarios/escortProtectionGenreBatch.ts`. The corresponding Escort/Protection, registry, and equipment suites passed 21 tests across three files; route-level source traces remain authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 511 | The Cold Latch | CONFIRMED DEFECT | CRA-F0206 (MEDIUM) — shared aftermath claims a permissioned neighbor loan on routes that establish no loan. |
| 512 | The Forked Shadow | HEALTHY | — tentative purse claim, clerk/inn confirmation, custody and witness compensation remain consistent. |
| 513 | The Grease Mark | CONFIRMED DEFECT | CRA-F0207 (MEDIUM) — aftermath claims crew-wrench recovery after protective/check-wheel responses that establish no drop or handoff. |
| 514 | The Doctor Before the Ford | CONFIRMED DEFECT | CRA-F0208 (MEDIUM) — case-first response claims the doctor clings to a handline even after the no-rope departure. |
| 515 | The Pay Carriage at Dusk | HEALTHY | — ridge, signal, farm-track, combat-win and withdrawal outcomes preserve payroll custody and wage differences. |
| 516 | The Crate of Window Glass | MINOR CONCERN | — brace/wrap flags have no visible downstream effect; intact glass is not explicitly guaranteed, so no definite contradiction is established. |
| 517 | The Witness under Escort | HEALTHY | — statement remains sealed; consent, refusal, office, refuge and confrontation outcomes preserve Nell’s agency. |
| 518 | The Shepherd’s Return | HEALTHY | — flock, cart, split-herd, neighbor, timing and wage outcomes match the selected route. |
| 519 | The Ferry for the Midwife | MINOR CONCERN | — the skiff relay shares an ending that says “by cart”; an onward cart transfer is plausible but not stated. |
| 520 | The Lanterns at Camp Four | HEALTHY | — signal, identify, warn and rush outcomes distinguish the worker, tool-board and injury results. |

CRA-F0206–CRA-F0208 extend CRA-C0001 (route-specific information, object custody, and physical aid lost or assumed at convergence); no new cluster was needed. The source-module metadata correction for positions 511–520 is reflected in the ledger; the audit source itself did not change. No gameplay source or tests changed. The ledger is contiguous through position 520; next is position 521, The Courier Relay Box (`the-courier-relay-box`), with 341 remaining and next finding CRA-F0209.

## Audit continuation (live positions 521–530)

Reviewed the next ten stable IDs in live `SCENARIOS` order. Traced courier custody and receipt/signature alternatives; load and hub management; herd, telegraph-pole and safe-delay routes; ledger/deed priority and water exposure; icehouse watch, evacuation and shipment loss; horse-hoof inspection, prior stone removal and farrier arrival; survey crew evacuation versus instrument-case movement; sealed medical-letter custody and privacy; ice-road/hand-carried feed outcomes; and public-verge authority, crew withdrawal, combat and wage outcomes. The focused Escort/Protection, registry, and equipment suites passed 21 tests across three files as supporting evidence; source-route review remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 521 | The Courier Relay Box | HEALTHY | — keeper verification, Amos’s signed transfer, refusal, seal confidentiality and combat outcomes preserve custody. |
| 522 | The Wagon with the Lame Wheel | HEALTHY | — Gear-gated repair, load handling, doctor arrival, split delivery and waiting preserve people and wagon states. |
| 523 | The Quiet Cattle Drive | HEALTHY | — usable-whistle/rope, herd split, back-fence, pole-lowering and late-animal outcomes are distinct. |
| 524 | The Archive through the Rain | HEALTHY | — ledger/deed priority, dry-sill custody, protected transfer and rain damage follow the selected route. |
| 525 | The Night Guard at the Icehouse | HEALTHY | — watch, lamp inspection, evacuation, entry and ice-loss states preserve worker safety and shipment outcomes. |
| 526 | The Horse for the Farrier | CONFIRMED DEFECT | CRA-F0209 (MEDIUM) — the shared farrier arrival says the farrier removes a stone already eased out by the Traveler. |
| 527 | The Missing Survey Case | CONFIRMED DEFECT | CRA-F0210 (MEDIUM) — the case reaches the track after a crew-first evacuation route that never moves it. |
| 528 | The Smallpox Letter | HEALTHY | — sealed-letter privacy, custody receipt, refusal, witnessed handoff and delivery remain consistent. |
| 529 | The Winter Feed Sled | HEALTHY | — long road, tested ice, partial hand-carried feed and deliberate unsafe crossing yield distinct outcomes. |
| 530 | The Fence at Crow Road | HEALTHY | — authority inquiry, withdrawal, commissioner verification, combat and injured withdrawal preserve crew/wage outcomes. |

CRA-F0209–CRA-F0210 extend CRA-C0001 (prior action and object-location facts lost at a shared outcome); no new cluster was needed. No gameplay source or tests changed. The ledger is contiguous through position 530; next is position 531, The Glass-Plate Box (`the-glass-plate-box`), with 331 remaining and next finding CRA-F0211.

## Audit continuation (live positions 531–540)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced glass/camera custody and damaged cargo, mail-sack/passenger/porter outcomes, bridge-chest securing before evacuation and combat, both child-recovery routes, telegraph closure/marker/gloves/mirror/tester and repair methods, food/horse/team outcomes, fog/boardwalk/porter/jar variants, stretcher ownership and transfer, coffin-cart restraint/carry/delay paths, and warehouse fire/theft/evacuation outcomes. Apparent convergence compression is supported by explicit intervening scene state or plausible named-NPC follow-through; no confirmed defect or distinct minor concern was established. All ten are HEALTHY. The focused Escort/Protection, registry, and equipment suites passed 21 tests across three files as supporting evidence; route-level source traces remain authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 531 | The Glass-Plate Box | HEALTHY | — box-first, camera-first, turnback, and combat outcomes preserve plate/camera condition and delivery timing. |
| 532 | The Night Mail Train | HEALTHY | — the agent’s return and parcel-room logging is explicit; porter involvement is tied to the whistle route and sacks remain sealed. |
| 533 | The Bridge Pins | HEALTHY | — the alternate move route’s beam scene establishes the chest as secure before the tied-to-cart partial result; worker clearance and combat outcomes stay distinct. |
| 534 | The Lost Child’s Lantern | HEALTHY | — gate recovery, ditch retreat, brother signaling, and farm-lantern return preserve child locations and separate meal/wick from coin outcomes. |
| 535 | The Telegraph Repair Car | HEALTHY | — named Gear gates include usability; firm-pole tester/relay text distinguishes continuity from pole safety. |
| 536 | The Supper Wagon | HEALTHY | — cook-supplied cover, Traveler whistle, rest/delay, hand-carry, horse return, and usable-hammer outcomes remain distinct. |
| 537 | The Fence at the Fog Line | HEALTHY | — marker/rope usability, intact versus missing-plank paths, porter assistance, and jar custody match the selected route. |
| 538 | The Lumber Crew at the Gully | HEALTHY | — owned/borrowed stretcher, acceptance, rope rescue, saw-first, and strain outcomes preserve person/equipment priorities. |
| 539 | The Quiet Coffin Cart | HEALTHY | — usable rope/wedge methods, turnback, steadying versus unload/carry, and the two-coin arrival fee align. |
| 540 | The Silent Warehouse Shift | HEALTHY | — order-specific evacuation variants preserve crate/worker sequencing; combat win/loss and watch outcomes do not claim an unchosen evacuation method. |

No finding or cluster ID was consumed; next finding remains CRA-F0211 and next available cluster remains CRA-C0009. The ledger is contiguous through position 540; next is position 541, The Last Mile of the Medicine Wagon (`the-last-mile-of-the-medicine-wagon`), with 321 current registered Adventures remaining. No gameplay source or tests changed; Weekly Scenario Batch remains paused.

## Audit continuation (live positions 541–550)

Reviewed ten previously unreviewed Adventures in live `SCENARIOS` order. Traced the medicine-wagon side path, load/transfer, delay and sounding-rod test; sheepfold watch, lamp, whistle response, lamb, creek and dawn branches; broken-axle care/load/delegation and driver/axle outcomes; brace measurement, plumb, square, unsafe fit, repair and share branches; wheel inspection/replacement/delay; blue iron inspection, redraw, pin-and-return and failed strike; harness inspection/replacement/reinforcement; lantern walk/fit, reshape/replace and shipment refusal; roof rope/yard-clear, brace/wait and climb/fall; telegraph splice inspection, usable toolkit/tester, repair/relay and shock routes. Three current contradictions were recorded. The helper-generated axle choice includes both ownership and usability gates, so it was not misclassified as a defect. Seven Adventures are healthy. Focused Escort/Protection, Trades/Apprenticeship, registry and equipment suites passed 28 tests across four files as supporting evidence; source route review remains authoritative. No gameplay source or tests changed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 541 | The Last Mile of the Medicine Wagon | CONFIRMED DEFECT | CRA-F0211 (MEDIUM) — the sounding-rod route claims a farm cart takes the medicine despite no cart or transfer being established on that route. |
| 542 | The Watch at the Sheepfold | CONFIRMED DEFECT | CRA-F0212 (MEDIUM) — the non-whistle lamb-check route reaches shared text saying the neighbor secures a loose ewe without establishing the neighbor or ewe. |
| 543 | The Broken Axle Relay | HEALTHY | — the generated Folding Carriage Jack choice includes a usable-item gate; care, axle, delegation and delay outcomes remain distinct. |
| 544 | The Second Brace | CONFIRMED DEFECT | CRA-F0213 (MEDIUM) — a BROKEN Joiner’s Folding Rule passes an items-only diagonal-measurement gate and sets measurement proof. |
| 545 | A Rim before Rain | HEALTHY | — the wheel wrench requires usability; replacement, accepted delay and premature-wedge failure remain distinct. |
| 546 | The Iron That Went Blue | HEALTHY | — Miriam’s NPC repair between pin-setting and return establishes the settled hinge result. |
| 547 | The Harness Stitch | HEALTHY | — replacement reduces load, reinforcement sends one wagon at a time, and unsafe reuse fails separately. |
| 548 | The Lantern on the Lower Hook | HEALTHY | — reshaping/replacement produce a tested guard; sending it back delays handoff before repair. |
| 549 | The Roofline in Wind | HEALTHY | — rope/yard safety routes lead to the sound-rafter repair after bracing or waiting; climbing reaches a separate fall outcome. |
| 550 | The Line That Would Not Hold | HEALTHY | — usable-tool gates, dry-wrap/relay outcomes and the climb hazard remain distinct; the lesson flag prevents duplicate teaching. |

CRA-F0211 and CRA-F0212 extend CRA-C0001; CRA-F0213 extends CRA-C0004. No new cluster was established. The ledger is contiguous through position 550; next is position 551, The Press before Noon (`the-press-before-noon`), with 311 current registered Adventures remaining and next finding CRA-F0214.

## Audit continuation (live positions 551–560)

Reviewed ten Adventures in live `SCENARIOS` order. Traced the press’s margin comparison/clean-and-retest/corrected-short-notice outcomes; ferry gate inspection, usable-tool, replacement-pin wait, and force-failure routes; mill alignment, bearing diagnosis, safe cleaning/diversion, and overload spill; lane closure, usable rod, shoring, second-mason delay, and unsafe mortar; cobbler comparison, patch/replacement, and no-charge dispute; rope splice marking, clamp/load methods, relay/delay, repair/upgrade of the Traveler’s own rope, and failure; door-gap/usable-pry diagnosis, hinge reset versus explain/schedule and unsafe planing; supported/canvas book opening, transcription versus waiting, and press failure; boat level/cover/early launch, safe cure/cargo transfer and bucket test; and horse collar fit, gloves, unsuitable trace replacement, refit versus teach-only, and settlement.

Four current contradictions were recorded. A broken Folding Rule can satisfy the press margin-measurement choice because it has an ownership-only gate. On the swollen-door explain/schedule branch, the shared result claims an unperformed hinge reset. The damp-book wait branch refuses to copy entries but reaches a result claiming they were copied. The harness teach-only branch reaches a result claiming the collar was refitted and load balanced. The ferry pin wait is explicitly a wait for replacement; the mill divert says repair safely, the quoin route waits for a second mason, and the ropewalk clamp is usable, so those are not defects. Focused Trades/Apprenticeship, registry, and equipment suites passed 21 tests across three files as supporting evidence; current route tracing remains authoritative. No gameplay source or tests changed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 551 | The Press before Noon | CONFIRMED DEFECT | CRA-F0214 (MEDIUM) — a BROKEN Joiner’s Folding Rule passes an ownership-only physical measurement gate. |
| 552 | The Ferry Gate Pin | HEALTHY | — inspection/support, replacement-pin delay, force failure, and settlement distinguish the repair paths. |
| 553 | The Belt at the Mill | HEALTHY | — safe cleaning or flour diversion precedes the repair/test result; overload reaches a separate spill outcome. |
| 554 | The Stone Quoin | HEALTHY | — the alternative waits for a second mason before reset; premature mortar reaches a separate failure result. |
| 555 | The Last at the Cobbler | HEALTHY | — accepted repair remedies and a no-charge daylight dispute remain distinct. |
| 556 | The Ropewalk Splice | HEALTHY | — clamp usability, gradual resplice test, own-rope condition repairs/upgrades and the failed load are route-specific. |
| 557 | The Door that Swelled | CONFIRMED DEFECT | CRA-F0215 (MEDIUM) — explain/schedule reaches a shared ending that claims a hinge reset never performed on that branch. |
| 558 | Paper under the Press | CONFIRMED DEFECT | CRA-F0216 (MEDIUM) — a wait/refusal route reaches settlement text claiming intact entries were copied. |
| 559 | The Boat Seam in the Yard | HEALTHY | — the leak diagnosis leads to an ashore cure/bucket-test path or explicit cargo transfer to a sound ferry. |
| 560 | The Horse that Wore One Strap | CONFIRMED DEFECT | CRA-F0217 (MEDIUM) — teach-only reaches a settlement claiming the collar was refitted and traces balanced. |

CRA-F0214 extends CRA-C0004; CRA-F0215–CRA-F0217 extend CRA-C0001. No new cluster was established. The ledger is contiguous through position 560; next is position 561, The Clock above the Market (`the-clock-above-the-market`), with 301 current registered Adventures remaining and next finding CRA-F0218.

## Audit continuation (live positions 561–570)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. Traced timing and wrong-regulator failure; usable glove/bit gates, fixing-point and shoring variants; chain measurement, stop-block marking, siding closure and empty-car testing; telephone-office diagnosis, explanation-only versus hinge/lock refit and premature replacement; pump joint inspection, usable tools, drain failure, cup reseating/replacement and trough test; ladder/rope safety, lath diagnosis and tie failure; lantern airflow record versus cap/air-hole repair and outdoor test; toolbox ownership/provenance, limited recovery, authorized release and deferral; roof access, owner authorization and distinct intact, bent and apprentice-stock guards; and siding evidence, stabilization/support, limited recovery, defer and combat outcomes.

Five current contradictions were recorded. At the long-measure settlement, marking a stop block or closing the siding is described as though a stop block had been installed and an empty-car test passed. The telephone-office explanation-only route reaches text claiming a hinge/lock refit. The slate ladder-tie choice accepts a BROKEN Travel Rope through an ownership-only item gate. The glasshouse airflow-record route reaches text claiming both lamps were repaired and tested. The siding-spill result asserts return of listed equipment and release of a duplicate rod without route proof of retrieval/return or duplicate authorization. Other examined routes preserved their relevant action, custody, location, safety and outcome distinctions; no distinct minor concerns were established. Focused Trades/Apprenticeship, registry, and equipment suites passed 21 tests across three files as supporting evidence; route-level source tracing remains authoritative. No gameplay source or tests changed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 561 | The Clock above the Market | HEALTHY | — silence, repair, wrong-regulator failure and payment/decline outcomes preserve what was done. |
| 562 | The Drill at Old Number Seven | HEALTHY | — usable-glove gate, fixing-point diagnosis, shoring and force-failure routes remain distinct. |
| 563 | The Long Measure at Milepost Nine | CONFIRMED DEFECT | CRA-F0218 (MEDIUM) — marking/closing the siding reaches a result claiming a stop block caught an empty test car. |
| 564 | The Door at the Telephone Office | CONFIRMED DEFECT | CRA-F0219 (MEDIUM) — explanation-only reaches a shared result claiming an unperformed hinge/lock refit. |
| 565 | The Pump between Fields | HEALTHY | — usable-tool gate, both safe cup repairs, trough test and early-drain failure align. |
| 566 | The Slate on the Schoolhouse | CONFIRMED DEFECT | CRA-F0220 (MEDIUM) — a BROKEN Travel Rope passes the ownership-only ladder-tie gate. |
| 567 | The Glasshouse Lanterns | CONFIRMED DEFECT | CRA-F0221 (MEDIUM) — airflow recording alone reaches a successful repair/test result. |
| 568 | The Toolbox at Low Water | HEALTHY | — crew/private ownership, limited recovery, release authorization and deferral are distinguished. |
| 569 | The Roof Under Ash | HEALTHY | — owner transfer, intact/bent stock, apprentice property, recovery and deferral remain distinct. |
| 570 | The Siding Spill | CONFIRMED DEFECT | CRA-F0222 (MEDIUM) — the result asserts unproved equipment return and duplicate-rod release. |

CRA-F0218, CRA-F0219, CRA-F0221 and CRA-F0222 extend CRA-C0001; CRA-F0220 extends CRA-C0004. No new cluster was established. The ledger is contiguous through position 570; next is position 571, The Camp That Wasn’t Empty (`the-camp-that-wasnt-empty`), with 291 current registered Adventures remaining and next finding CRA-F0223.

## Audit continuation (live positions 571–580)

Reviewed the next ten stable IDs in live `SCENARIOS` order. Traced camp call/tracks/glasses and the survey hand’s return; barn-list, brace and two competing tool claims; quarry access from the staged upper beam, frayed-line limit, safe notes, and optional combat win/loss; ferry depth/landing/claimant variants and later deckhand authorization; cellar ledger protection, tenant boundary and return; signal mirror board/inventory/maker evidence and serial verification; mule/handler safety, frame lift and sealed medicine parcel; washout wedge/light/ownership routes and the unstable bank limit; bank-side ledger recovery, sealed clasp and worker-copy issue; and milepost county stamp/record/second-mark evidence plus wedge ownership and clearance.

Three current contradictions were recorded. The camp reward releases a rope explicitly described as frayed/written off but omits a condition override; the engine defaults a newly granted item without a recorded condition to NORMAL. The washout’s only recovery step can advance despite all access variants preserving the explicit unstable-bank/no-entry boundary, then claims the serviceable lanterns were returned and offers the damaged lamp. At the milepost, the routes identify the stamped pry tool and/or inspect a date but do not establish abandonment or county clearance for the separate unmarked wedge, while the reward settlement asserts that clearance. The other seven Adventures’ action, safety, ownership, location, deferred, fee, refusal and reward distinctions were consistent on the traced paths. No gameplay test runner was available in this checkout (`node_modules/.bin` is absent); source-route review and direct engine semantics were used, and no tests were modified.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 571 | The Camp That Wasn’t Empty | CONFIRMED DEFECT | CRA-F0223 (MEDIUM) — a written-off frayed Travel Rope is granted with default NORMAL/usable condition. |
| 572 | The List Behind the Barn Wall | HEALTHY | — old mark/sale history and the separate Gate Hook owner are distinguished; bracing does not authorize entry. |
| 573 | The Quarry’s Last Lift | HEALTHY | — staged upper-beam access, frayed-line limit, sealed notes, company/foreman ownership and optional combat remain distinct. |
| 574 | The Ferry Chest Below the Landing | HEALTHY | — contents clue supports but does not transfer the chest; the absent owner authorizes it before return/reward. |
| 575 | What the Storm Left in the Cellar | HEALTHY | — public ledger recovery is separated from the tenant’s sealed private case. |
| 576 | The Charred Signal Post | HEALTHY | — inventory loss report is not treated as identity proof; serial verification precedes the spare reward. |
| 577 | The Pack Frame in the Ravine | HEALTHY | — replacement is gated to the rope-lift and limited-recovery route; medicine remains separate. |
| 578 | The Lantern Crate in the Washout | CONFIRMED DEFECT | CRA-F0224 (MEDIUM) — the outcome claims recovered/returned lamps despite the route’s explicit unsafe-bank boundary. |
| 579 | The Ledger at the Weir | HEALTHY | — sealed recovery, worker-copy request and duplicate-tool wage remain distinct. |
| 580 | Iron at Milepost Nine | CONFIRMED DEFECT | CRA-F0225 (MEDIUM) — the reward asserts county clearance/abandonment for an unmarked wedge not established by any route. |

CRA-F0223 establishes CRA-C0009 (an explicitly damaged/frayed Gear reward defaulting to healthy condition). CRA-F0224 and CRA-F0225 extend CRA-C0001 for unsupported recovery/location and ownership facts at settlement. The ledger is contiguous through position 580; next is position 581, The Bell Creek Drift (`the-bell-creek-drift`), with 281 current registered Adventures remaining and next finding CRA-F0226.

## Audit continuation (live positions 581–590)

Reviewed the next ten stable IDs in live `SCENARIOS` order. Traced wet strap condition/stitch evidence, owner return, spare reward/repair and optional confrontation; snow-cache bearing, hollow-pocket and call/response routes; press inventory, reimbursement receipt and sealed complaint case; gravel-bar wait/sounding/line-pull, ferry-line and blanket custody; scrap pile separation, missing-tool ledger, borrower/gauge dependency, clerk and optional thief; tunnel call/tag/wedge routes while keeping beyond the fall line; fence repair history, custodian record and disputed-boundary permission; greenhouse glove/sheet/hook routes, unsafe overhead frame and tray protection; upper-cut lamp lowering and untouched lower glow; and bridge-case lift/content identification, sealed custody and later owner opening.

Three contradictions were recorded. The Bell Creek property text calls the second driver’s spare sound, but the shared story’s `repair:true` sets the gained spare to DAMAGED. At the station yard, the railway’s release of the wrench is explicitly conditional on returning the borrowed track gauge; the owner-trace route and reward offer do not establish or gate that return. At the glasshouse, the shared evidence setup says the seed trays are covered even on the gloves and drainage-hook routes; only the estate-sheet route covers them, and the inherited state feeds the shared preservation reward. The snow leader’s cache/assistant events are explicitly described as later NPC follow-through after the Traveler locates the separated party, not as Traveler-completed recovery. Other reviewed routes preserved their stated safety, property, and custody distinctions. Focused tests were unavailable because this checkout has no local package binaries; no test files were changed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 581 | The Bell Creek Drift | CONFIRMED DEFECT | CRA-F0226 (MEDIUM) — an explicitly sound spare Freightman’s Strap is granted as DAMAGED. |
| 582 | The Cache Beneath the Snow Fence | HEALTHY | — separated-party response and shared-cache ownership remain distinct; the leader’s later reunion/recovery follows the located party. |
| 583 | The Plates in the Pressroom | HEALTHY | — receipt resolves the toolkit claim; company type and sealed complaint case remain separate. |
| 584 | The Boat on the Gravel Bar | HEALTHY | — waiting, shore sounding and owner-guided line pull distinguish boat access; line, pail and named blanket return/compensation are separated. |
| 585 | The Heap Behind the Station | CONFIRMED DEFECT | CRA-F0227 (MEDIUM) — the wrench reward is offered without the stated borrowed-track-gauge return prerequisite. |
| 586 | The Pack at the Tunnel Mouth | HEALTHY | — the Traveler stays outside unsafe rubble; the wedge route retrieves only the pack beyond the fall line. |
| 587 | The Find Along the Fence Line | HEALTHY | — work order and custodian resolve tool history, while disputed land access requires joint permission. |
| 588 | Glass from the Gutter | CONFIRMED DEFECT | CRA-F0228 (MEDIUM) — gloves/hook routes inherit a false claim that the seed trays were covered. |
| 589 | The Lamp in the Upper Cut | HEALTHY | — the upper lamp can be lowered safely; the lower light remains unidentified and untouched. |
| 590 | The Chest in the Old Bridge | HEALTHY | — case remains sealed through recovery and identification; the family’s key and county return precede the duplicate reward. |

CRA-F0226 extends CRA-C0009, the Gear-reward condition-mismatch pattern. CRA-F0227 and CRA-F0228 extend CRA-C0001. No new cluster was established. The ledger is contiguous through position 590; next is position 591, The Warehouse After Rain (`the-warehouse-after-rain`), with 271 current registered Adventures remaining and next finding CRA-F0229.

## Audit continuation (live positions 591–600)

Reviewed the next ten stable IDs in live `SCENARIOS` order. For the warehouse, traced all three access choices and their evidence variants, the stamped contractor tool and explicit sale, the sealed crates, tenant-owned trunk, payment/fee alternative, refusal, and defer paths. For the competition batch, traced both brace loading methods, bowline versus clamp rigging, damaged-chain repeat and withdrawal, dry/wet/partial creek outcomes, unsafe quarry shelf and retreat/ledge routes, lookout signal and worker-rescue branches, beam methods/race and result variants, wind-adjusted throws and tie-break/share branches, and the millwheel peg/belt inspection, stop, forced-turn, and prize/fee routes. Existing focused tests were inspected for knot winner/runner-up distinction, lookout Knowledge/compensation, crossing prize qualification, Long Carry method/Knowledge/save behavior, and Millwheel forced-turn handling. Their coverage is supporting evidence; route/source analysis remains authoritative. The local package test runner is unavailable in this checkout, and no tests were changed.

Four contradictions were recorded. In The Match at the Brace, a full sudden load cracks both braces but still reaches the shared award/winner result claiming Nell’s brace was safe. At The Quarry Step, a direct climb-to-top success reaches a bell scene that asserts the Traveler used the lower sound ledge and avoided the cracked shelf, then offers the completion prize. At The Lookout at Dusk, chart/seen routes reach scoring without recording a signal call or correctness result, yet the winner’s Field Glasses remain claimable. At The Chain at Twenty Paces, the sole described Survey Chain has a flattened link and is explicitly due for repair, but its prize reward records no condition; the engine defaults the acquired item to NORMAL. These first three extend CRA-C0001 and the Gear-condition case extends CRA-C0009. The other six Adventures were healthy; no minor concern or new cluster was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 591 | The Warehouse After Rain | HEALTHY | — the former contractor confirms and sells the marked pry tool; sealed cargo and the tenant’s unopened trunk remain distinct, with the price/fee alternatives explicit. |
| 592 | The Match at the Brace | CONFIRMED DEFECT | CRA-F0229 (MEDIUM) — the sudden-load route cracks both braces but can still award Nell the “safe” result. |
| 593 | The Knot before the Bell | HEALTHY | — winner, runner-up, helping, safety stop, withdrawal, method Knowledge, and compensation remain route-distinct. |
| 594 | The Chain at Twenty Paces | CONFIRMED DEFECT | CRA-F0232 (MEDIUM) — the bent chain due for repair is granted at default NORMAL condition. |
| 595 | The Dry Crossing Race | HEALTHY | — blanket reward is limited to dry finishes; damp and wet outcomes offer only partial payment or refusal. |
| 596 | The Quarry Step | CONFIRMED DEFECT | CRA-F0230 (HIGH) — direct climb success inherits the lower-ledged safe completion and prize without establishing hazard avoidance. |
| 597 | The Lookout at Dusk | CONFIRMED DEFECT | CRA-F0231 (MEDIUM) — Field Glasses can be claimed without a recorded signal answer or correct result. |
| 598 | The Long Carry | HEALTHY | — Knowledge-method variants and winner-only frame reward match the traced safe, late, and winning routes. |
| 599 | Five Marks on the Board | HEALTHY | — high, close, low, tie-break win/failure, negotiated split, and withdrawal lead to distinct fair prize outcomes. |
| 600 | The Millwheel Hand | HEALTHY | — the toolkit follows a found/refitted peg and clean hand test; unsafe continuation, report, and damage routes never reach it. |

The ledger now covers positions 1–600 without gaps (600 reviewed, 261 remaining), with 352 HEALTHY, 38 MINOR CONCERN, 210 CONFIRMED DEFECT, and zero NEEDS MANUAL REVIEW. There are 232 findings. Next is position 601, The Blind Trail Marker (`the-blind-trail-marker`), and next finding ID CRA-F0233; CRA-C0010 remains the next available cluster ID.

## Audit continuation (live positions 601–610)

Reviewed the next ten stable IDs in live `SCENARIOS` order. Traced the false-track/dead-end/reconsideration and prize routes; split-log inspection/reorientation and replacement versus direct cut, binding reset, stop, and chance outcomes; ferry signal instructions, current observation, punt rescue, line attempt, late call, refusal and whistle; old/new hinge evidence, post wear, load test and square prize; low/high strap placement, cart-stop correction, recentering, chance finish and prize tiers; target reset/revised round and no-placement coin outcome; the capped waterwheel wager, no-stake observation, call settlement and save/resume; roof-anchor inspection, weather postponement, direct sling, safe finish, street clearing and fee; the finite card stake, free viewing, guess, refund, prize and refusal; and harness fold inspection, fixed-winch stop, tear/risk and helper outcomes. Existing focused tests were inspected for trail reward acquisition, siding flags/legacy saves, ferry refusal, waterwheel wager persistence, and card wager affordability. They are supporting evidence only; route/source review is authoritative. The local package runner remains unavailable and no tests were changed.

Three contradictions were recorded, all extending CRA-C0001. At the saw trial, direct cutting bypasses the stated requirement to turn and re-mark the discovered split log, yet can reach a counted clean-cut result and tool prize. At The Iron Squares, choosing the visibly new hinge from the history scene skips the working-load test but enters the result that narrates that test and offers the diagnosis prize. At The Rigging on the Roof, tying the sling and starting without anchor inspection can reach a finish that says the work used a sound anchor, despite only the explicit relocation routes establishing the sound beam. Seven other Adventures were healthy; no minor concern or new cluster was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 601 | The Blind Trail Marker | HEALTHY | — false-line/dead-end recovery preserves the evidence; the Travel Rope prize follows the correct trail explanation. |
| 602 | The Saw before Supper | CONFIRMED DEFECT | CRA-F0233 (MEDIUM) — the split-log correction can be bypassed before a counted cut/prize. |
| 603 | The Bell Rope at Ferry End | HEALTHY | — the whistle follows an effective stop signal; late call, released line and refusal do not claim it. |
| 604 | The Iron Squares | CONFIRMED DEFECT | CRA-F0234 (MEDIUM) — a wrong appearance-based choice reaches the unperformed load-test result and diagnosis prize. |
| 605 | The Load on the Siding | HEALTHY | — strap methods, recentering and winner/runner-up/loss/disqualification outcomes remain gated by their route state. |
| 606 | The Hammer and the Ribbon | HEALTHY | — the first safe mark has no placement; winner Gear requires the revised-round leading score. |
| 607 | The Bet at the Water Wheel | HEALTHY | — one funded wager settles once; free observation, loss and saved continuation do not create extra payouts. |
| 608 | The Rigging on the Roof | CONFIRMED DEFECT | CRA-F0235 (HIGH) — direct sling setup can reach a finish claiming a sound anchor without establishing one. |
| 609 | The Quiet Card Count | HEALTHY | — the single affordable wager returns or loses only its stated amount; free viewers cannot claim a prize. |
| 610 | The Harness Stitch Trial | HEALTHY | — inspection/stop routes prove the fault; tear and close-call routes receive no prize, while a wrong appearance guess is not awarded to the Traveler. |

The ledger now covers positions 1–610 without gaps (610 reviewed, 251 remaining), with 359 HEALTHY, 38 MINOR CONCERN, 213 CONFIRMED DEFECT, and zero NEEDS MANUAL REVIEW. There are 235 findings. Next is position 611, The Fair-Weather Reading (`the-fair-weather-reading`), and next finding ID CRA-F0236; CRA-C0010 remains the next available cluster ID.

## Audit continuation (live positions 611–620)

Reviewed the next ten unreviewed stable IDs in live `SCENARIOS` order. In The Fair-Weather Reading, traced ridge/flag observation, the cook’s warning sign, warning the parade, submission and both forecast outcomes, cloak/coin/refusal choices, the qualified-forecast flag, and legacy resumption at the score scene. In The Ferryman and the Stake, traced marker inspection/reset, short-course agreement, refusal, snag recovery, safe stop/tie, chance win/loss, prize and legacy win fallback. In The Silent Score Slate, traced stale figures, anchor inspection, current-load sag, safe stop before the final block, repeated ground-level test, leaving, unsafe continuation, and prize/no-prize outcomes. In The Last Clean Spoke, traced practice/customer wheel separation, cracked hub, customer repair/wait, quarter-turn correction, fast/failed tightening, stop, and wrench/wage outcomes. In The Seven-Inch Square, traced measured opening, hinge-side requirement, plan revision/force-fit, square-and-shim/fitted-opening standards, caliper-gated shim sizing, joint owner/Willa decision, and prize/coin/refusal/withdrawal. Existing focused competition tests were inspected for the weather forecast gate/legacy result, stake-course legacy gate, and usable caliper gate.

For the runoff camp, traced direct diversion, gauge trace-before-diversion, neighbor-identified channel clearing, shallow drain/outlet check, tent/store relocation, Gear/coin/refusal, and stable Knowledge routes. For the Alder crossing, traced near-bank probing, rope deflection and limited shelf marking, upstream search, bank clearing, foot/cart split, rising-water observation, closure and survey reward. For the missing marker, traced fence/map and compass evidence, wet-hollow retreat, ridge/glasses sighting, report versus approach, crew reset and spare/coin outcome. For the gray mare, traced gate and fresh-track evidence, handler call, mud failure, wait/hold versus guided return and search compensation; the relevant compensation regression was inspected. For smoke in the draw, traced ridge observation, warning, uphill evacuation, direct descent/retreat chance, brush-gap, containment and fire-crew response, and Gear/coin outcome. Existing wilderness tests were inspected for camp Knowledge/Gear persistence and registry graph coverage. Tests were not run because this checkout has no local package test binaries; route-level source review remains authoritative. No source or gameplay tests changed.

One current contradiction was confirmed. In The Alder Crossing, `edge.markShallow` marks only the near shallow shelf and warns against crossing loaded after the rope bows downstream and the deeper bend remains unsafe, but enters the shared `partial` ending that says the carrier gets a safer route to the road bridge. The alternate route that actually clears the upper approach and sends the carrier on foot is the only branch establishing that broader route. CRA-F0236 extends CRA-C0001. The other nine Adventures were healthy; no distinct minor concern or new root-cause pattern was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 611 | The Fair-Weather Reading | HEALTHY | — the cloak requires the run-local qualifying-forecast flag; a legacy score save has neutral text and no cloak access without recorded proof. |
| 612 | The Ferryman and the Stake | HEALTHY | — every fresh race requires an agreed shortened course, and legacy win resumption cannot claim an unproved prize. |
| 613 | The Silent Score Slate | HEALTHY | — the clamp follows a correct pre-final-block call or a separately verified retest; unsafe, late and leave routes do not win it. |
| 614 | The Last Clean Spoke | HEALTHY | — the contest wrench follows correction and a light-load check on the separate practice wheel; customer hub and fast/failed routes remain distinct. |
| 615 | The Seven-Inch Square | HEALTHY | — frame fit, shim/caliper method, owner standard, force-fit failure and reward options are route-consistent and the caliper action is usability-gated. |
| 616 | The Camp Below the Cut | HEALTHY | — diversion, old-line clearing, drain/outlet check and raised-bench relocation establish the distinct safe runoff outcomes; Knowledge/payment remain route-appropriate. |
| 617 | The Alder Crossing | CONFIRMED DEFECT | CRA-F0236 (MEDIUM) — a shallow-shelf-only survey inherits the claim that the carrier has a safer route to the road bridge. |
| 618 | The Mile Without a Marker | HEALTHY | — uncertain ruts remain uncertain; the marker is located before the crew resets it and offers its spare. |
| 619 | The Hobbled Gray | HEALTHY | — handler-led recovery, Traveler-guided return, mud failure, Gear/coin choice and one-coin search fees remain distinct. |
| 620 | The Smoke Along the Draw | HEALTHY | — warning/evacuation, ridge retreat, brush-gap limitation, crew response and containment reward routes preserve their outcomes. |

The ledger now covers positions 1–620 without gaps (620 reviewed, 241 remaining), with 368 HEALTHY, 38 MINOR CONCERN, 214 CONFIRMED DEFECT, and zero NEEDS MANUAL REVIEW. There are 236 findings. Next is position 621, The Wind’s Other Side (`the-winds-other-side`), and next finding ID CRA-F0237; CRA-C0010 remains the next available cluster ID.

## Audit continuation (live positions 621–630)

Reviewed ten unreviewed Adventures in live `SCENARIOS` order. Traced the stone-lee/brush-bench and fire routes; fen probing, guide-line, spade and deferred-board variants; the cold-rope fracture and retreat; uncertain tracks versus the answered ridge search and rescue; reed-bed signals, guide/crew approaches and deferred pack recovery; mule inspection, safe shoulder, pull-forward and handler outcomes; cairn/chain/drover/book evidence and authorization; dry-match fuel/stove alternatives; rain shelter, cloak and exposed-contour routes; and salt-lick signs, herd calls, calf search and farmer outcomes. Relevant wilderness, Gear and compensation tests were inspected as supporting evidence, including the wind-bench regression; the local test runner is unavailable, so tests were not run. Route/source tracing remains authoritative. No source or gameplay tests changed.

One current contradiction was confirmed. In The Broken Cairn, three routes reach the shared north result without verifying the pasture boundary or authoritative route-book access: the frost-shifted socket, a chain measurement that explicitly cannot resolve the boundary, and the drover’s uncertain gate statement. Only the book-check route establishes that the northern track is public water access, yet the shared result states this as fact on all routes. CRA-F0237 extends CRA-C0001. The Cold Rope at Dawn is a minor wording concern: its terminal “leave the ice intact” phrase is ambiguous after the preceding scene establishes a fracture, but it does not claim a successful crossing. Eight Adventures were healthy; no new cluster was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 621 | The Wind’s Other Side | HEALTHY | — the brush-bench partial does not inherit stone-lee sparks; bedding, stores, fire and Knowledge claims fit each route. |
| 622 | A Footing in the Fen | HEALTHY | — probing, line and bearing stop short of proving a safe center crossing; the spade only drains the edge and requires usable Gear. |
| 623 | The Cold Rope at Dawn | MINOR CONCERN | — no crossing occurs after the first-weight fracture; terminal “leave the ice intact” wording is ambiguous about the already-fractured sheet. |
| 624 | Where the Print Ends | HEALTHY | — incomplete tracks remain uncertain; the rescue branch follows a direct response and location of the injured hand. |
| 625 | The Reed Bed Signal | HEALTHY | — a glint is not treated as a person until answered; guide/crew rescue and deferred pack recovery remain distinct. |
| 626 | The Mule’s Last Step | HEALTHY | — refusal is not treated as proof of a specific collapse; safe return, forced lead/slip, fee and Knowledge outcomes differ correctly. |
| 627 | The Broken Cairn | CONFIRMED DEFECT | CRA-F0237 (MEDIUM) — shared north result asserts public-water authorization without boundary or route-book proof. |
| 628 | One Dry Match | HEALTHY | — usable Match Case gate, relocated stove versus attended small flame, and fuel/compensation claims stay distinct. |
| 629 | Rain on the Return Path | HEALTHY | — shelter, wait, cloak, exposed contour, retreat/marker and compensation outcomes preserve their route evidence. |
| 630 | The Salt Lick Trail | HEALTHY | — sign, herd call, calf discovery and farmer lead/hold routes support the resulting claims and reward. |

The ledger now covers positions 1–630 without gaps (630 reviewed, 231 remaining), with 376 HEALTHY, 39 MINOR CONCERN, 215 CONFIRMED DEFECT, and zero NEEDS MANUAL REVIEW. There are 237 findings. Next is position 631, The Leaning Pine (`the-leaning-pine`), next finding ID CRA-F0238; CRA-C0010 remains the next available cluster ID.

## Audit continuation (live positions 631–640)

Reviewed ten unreviewed Adventures in live `SCENARIOS` order. Traced trunk tension, limited brush clearing, direct pull/retreat, bypass and trained-crew outcomes; spring-flood people/flock/wagon priorities and failure routes; ridge-bell/whistle bearings, fog, gully echo and rescue; seep-source protection, boiling/rationing, higher search and known-creek fallback; snare evidence, withdrawal, threat negotiation and combat outcomes; animal-track uncertainty and safe-bend water; shelf retrieval using ridge/anchor/guide-line variants; night sound versus east-road landmarks; tilted bridge, flood marks, worker/cache identification and usable-spade route; and coop-board repair, uncertain prints, secure-shed and hedge search. Relevant wilderness, Gear, engine-requirement and compensation tests were inspected as support but not run because local package binaries are unavailable. Source-route review remains authoritative; no gameplay source or tests changed.

Two current contradictions were confirmed. In The Spring Run, `flood.movePeople -> ridge.signalWagon/raiseCloth -> partial` establishes workers on the ridge but not the flock, while `flood.reachWagon -> call.showHighMark -> partial` only signals the far crew to wait; neither local group is moved. The shared result nevertheless says workers remain on the ridge and the flock is gathered above flood. CRA-F0238 extends CRA-C0001. In The Night Bird’s Turn, `call.answerCall` physically uses the Trail Whistle but requires only inventory ownership; `engine.ts` rejects BROKEN gear only when `usableItems` is present. The broken-whistle state therefore still enables the action and its reply/reunion result. CRA-F0239 extends CRA-C0004. Eight Adventures are healthy; no minor concern or new cluster was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 631 | The Leaning Pine | HEALTHY | — loaded trunk stays hazardous after loose brush is cleared; direct pull retreats, bypass and crew cut remain separate. |
| 632 | The Spring Run | CONFIRMED DEFECT | CRA-F0238 (HIGH) — shared flood-safe result claims worker/flock relocation on routes that only signal or move one group. |
| 633 | The Ridge Listener | HEALTHY | — bell sound is not a bearing; visual confirmation, repeat call, gully retreat and marker-road rescue preserve evidence. |
| 634 | The Water at the High Bench | HEALTHY | — limited boiling, channel protection, known-creek retreat and small-supply fallback remain distinct. |
| 635 | The Knife in the Grass | HEALTHY | — uncertain snare evidence does not identify its setter; withdrawal, combat, report, payment and loss routes remain distinct. |
| 636 | The Blue Shadow at the Creek | HEALTHY | — tracks show recent use, not current animal location; the guide checks the open bend before watering. |
| 637 | The Rope on the High Shelf | HEALTHY | — unsafe climb retreats; anchor angle and second guide line distinguish safe case recovery from deferral. |
| 638 | The Night Bird’s Turn | CONFIRMED DEFECT | CRA-F0239 (MEDIUM) — an ownership-only Trail Whistle gate allows a BROKEN whistle to establish a signal reply. |
| 639 | The Storm-Cut Camp | HEALTHY | — prints remain uncertain, tilted bridge crossing retreats, and cache fee follows actual ridge/cache recovery. |
| 640 | The Fox at the Egg Box | HEALTHY | — fox-sized tracks do not establish a fox or missing-hen fate; secure/repair and wait outcomes remain truthful. |

The ledger now covers positions 1–640 without gaps (640 reviewed, 221 remaining), with 384 HEALTHY, 39 MINOR CONCERN, 217 CONFIRMED DEFECT, and zero NEEDS MANUAL REVIEW. There are 239 findings. Next is position 641, The Ravine Bedroll (`the-ravine-bedroll`), next finding ID CRA-F0240; CRA-C0010 remains the next available cluster ID.

## Audit continuation (live positions 641–650)

Reviewed ten unreviewed Adventures in live `SCENARIOS` order. Traced the ravine call/answer and person-before-property routes; cloud-shadow discrimination and minimum counts; windbreak voice search and lower-road rescue; old cut versus flood-detour markers; pack unloading/rebalance and unstable tightening; old snow-depth mark versus active wind/visibility; spring-box cleaning versus runoff diversion and known creek; bear/person withdrawal, combat and injury; measured ridge bearing, signal flag, compass, retreat and whiteout; and hollow/overhang/ridge shelter, runoff and possible-animal variants. The applicable engine Gear-condition semantics and related Gear/compensation tests were inspected as supporting evidence; focused tests were not run because this checkout has no local package binaries. Route/source analysis remains authoritative. No gameplay source or tests changed.

Three current contradictions were confirmed, each extending CRA-C0004. In The Ravine Bedroll, `bedroll.lowerRope` tests only ownership even though the line is physically anchored and used to reach/retrieve the bedroll. In The Cairn below the Cloud, `survey.setFlag` tests only ownership although the resulting route assumes a visible, set return flag; its compass alternative correctly requires usable condition. In The Hollow Log Shelter, `overhang.secureBlanket` accepts either blanket through `anyItems` alone, then claims it blocks wind; a BROKEN blanket can satisfy that gate. Seven Adventures were healthy; no distinct minor concern or new root-cause pattern was established.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 641 | The Ravine Bedroll | CONFIRMED DEFECT | CRA-F0240 (MEDIUM) — BROKEN Travel Rope can satisfy the physical anchor/retrieval route. |
| 642 | The Cloud-Shadow Count | HEALTHY | — moving animals are separated from moving shadow; all reports retain minimum/obscured-count uncertainty. |
| 643 | The Cold Shelf | HEALTHY | — direct call and lower-road crew locate the traveler without claiming an exposed-saddle crossing. |
| 644 | The Cut-Branch Marker | HEALTHY | — old cut and newer detour are contextualized; uncertain marks can be deferred and crossings checked from bank. |
| 645 | The Pack That Shifted | HEALTHY | — narrow-trail slip resets on firm ground; completed carry and case-left outcomes remain distinct. |
| 646 | The Snow Line on the Stump | HEALTHY | — past depth is not a forecast; near-mile opening keeps the far pass closed. |
| 647 | The Spring Box in the Mud | HEALTHY | — cleaning alone does not authorize water use; runoff is diverted and water allowed to clear, or creek used. |
| 648 | The Bear at the Berry Ridge | HEALTHY | — tracks do not locate the bear; person-first ridge, withdrawal, injury and retreat routes remain distinct. |
| 649 | The Cairn below the Cloud | CONFIRMED DEFECT | CRA-F0241 (MEDIUM) — a BROKEN Signal Flag Set can establish a visible return flag. |
| 650 | The Hollow Log Shelter | CONFIRMED DEFECT | CRA-F0242 (MEDIUM) — a BROKEN blanket passes the windbreak gate and is credited with blocking wind. |

Historical batch-end report, superseded by the live-registry reconciliation above: the old checkpoint treated 11 draft/unregistered records as live. Do not use its 650/211 coverage or classification totals for current coverage. The corrected live state is 639 reviewed / 222 remaining; next is position 640, Weighed Before Dawn (`weighed-before-dawn`). Finding and cluster sequence remains CRA-F0243 / CRA-C0010.

## Live-registry continuation (positions 640–649)

Resumed from the reconciled stable-ID checkpoint at source snapshot `cba101f0feba09c67543f942331ca38f765ebe14`. The 11 unregistered historical records remain segregated and do not contribute to live coverage. Route-level source review completed the next ten actual live Adventures, positions 640–649. Seven are HEALTHY; three current defects were recorded as CRA-F0243–CRA-F0245, all extending CRA-C0001 (route-specific state or knowledge lost at convergence). No new cluster was created. Focused tests passed: `pnpm exec vitest run src/scenarios/expeditionLogisticsGenreBatch.test.ts src/scenarios/rc03AccountingC3.test.ts` — 19 tests across 2 files.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 640 | Weighed Before Dawn (`weighed-before-dawn`) | HEALTHY | — load, usable Gear, ridge actions, partial returns, payment/refusal, and Knowledge outcomes retain route proof. |
| 641 | The Fourth Mule (`the-fourth-mule`) | CONFIRMED DEFECT | CRA-F0243 (MEDIUM) — after leaving bedding cached, shared safe text says all goods remain together. |
| 642 | The Cache Ledger (`the-cache-ledger`) | HEALTHY | — taking cache stock prevents preservation rewards; saved run state retains the distinction across reload. |
| 643 | Two Crates Short (`two-crates-short`) | CONFIRMED DEFECT | CRA-F0244 (MEDIUM) — weighing sealed crates alone leads to unsupported chalk-mark and missing-crate-location knowledge. |
| 644 | The Ledge Store (`the-ledge-store`) | HEALTHY | — lift, hand-carry, blocked return, lantern, scout, partial, and reward routes remain distinct. |
| 645 | The Wrong Waybill (`the-wrong-waybill`) | HEALTHY | — delay preserves custody; open inspection and foreman verification support the exchange/release claims. |
| 646 | The Third Trip (`the-third-trip`) | HEALTHY | — load priority, trip count, delayed water crossing, partial delivery, and completion pay remain route-specific. |
| 647 | The Cook-Box Count (`the-cook-box-count`) | HEALTHY | — equal portions remain partial; reserve, runner resupply, wage, and Knowledge claims are gated by their actions. |
| 648 | Canvas Over the Crate (`the-canvas-over-the-crate`) | HEALTHY | — only the raise/move inspection route claims the fitting was found; carry and return routes use neutral variants. |
| 649 | The Second Wagon (`the-second-wagon`) | CONFIRMED DEFECT | CRA-F0245 (MEDIUM) — the “carry only the water” route reaches partial text claiming both food and water arrive. |

Current live coverage is **649 reviewed / 212 remaining of 861**. Live classifications: **391 HEALTHY, 39 MINOR CONCERN, 219 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **241 live findings** (the four findings CRA-F0239–CRA-F0242 remain historical `UNREGISTERED_SOURCE` records). The current live cluster totals are CRA-C0001 168, CRA-C0002 18, CRA-C0003 1, CRA-C0004 22, CRA-C0005 1, CRA-C0006 17, CRA-C0007 4, CRA-C0008 1, CRA-C0009 3; six legacy live findings have no recoverable cluster assignment and remain unassigned rather than inferred.

The first unreviewed live Adventure is position **650**, **The Paper Tube** (`the-paper-tube`), `src/scenarios/expeditionLogisticsGenreBatch.ts`. Next finding ID: **CRA-F0246**. Next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 650–659)

Continued from the persisted stable-ID checkpoint and reviewed the next ten live Adventures in registry order. Traced packet custody and dry storage; shared three-task completion; ration/resupply and turnback; lantern allocation and daylight limits; storehouse tally/issue/refusal; ferry priority and partial loads; staging alternatives; crate-only versus crew-location discovery; cart bracing versus split cargo delivery; and stale/current map evidence with hazard turnback. Six Adventures are HEALTHY, The Paper Tube is a MINOR CONCERN, and three MEDIUM confirmed convergence defects (CRA-F0246–CRA-F0248) extend CRA-C0001. No new cluster was created. The expedition-logistics and accounting support suites passed 19 tests across two files; these tests support, but do not replace, the route-level source review.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 650 | The Paper Tube (`the-paper-tube`) | MINOR CONCERN | — the wrap-to-transfer choice mentions a high dry locker although the described ferry locker is damp and the dry passenger box is a separate request route. |
| 651 | Three Crews, One Tool (`three-crews-one-tool`) | CONFIRMED DEFECT | CRA-F0246 (MEDIUM) — successful task branches converge on a claim that all three tasks were completed without route proof for every task. |
| 652 | The Empty Feed Sack (`the-empty-feed-sack`) | HEALTHY | — runner resupply, split rations, crate location, turnback, strain, and rewards remain route-specific. |
| 653 | The Spare Lantern Issue (`the-spare-lantern-issue`) | HEALTHY | — allocation, daylight boundary, call-back, return, and reward variants preserve their state. |
| 654 | The Storehouse Key (`the-storehouse-key`) | HEALTHY | — tally, issue/return, refusal, and completion reward outcomes remain distinct. |
| 655 | The Ferry Load Order (`the-ferry-load-order`) | HEALTHY | — cargo priority, line clearing, rush/wait partials, and tool-trunk delivery are represented accurately. |
| 656 | The Staging Board (`the-staging-board`) | HEALTHY | — relabel and jack-first staging routes establish their different chain handling before completion. |
| 657 | The Quiet Resupply (`the-quiet-resupply`) | CONFIRMED DEFECT | CRA-F0247 (MEDIUM) — securing the crate alone reaches text that claims the crew was found above the cut. |
| 658 | The Broken Handcart (`the-broken-handcart`) | CONFIRMED DEFECT | CRA-F0248 (MEDIUM) — bracing without caching timber reaches a result that says the timber arrives later. |
| 659 | The Duplicate Map (`the-duplicate-map`) | HEALTHY | — the stale-copy delay and hazard-driven turnback do not claim safe passage or unsupported recovery. |

Current live coverage is **659 reviewed / 202 remaining of 861**. Live classifications: **397 HEALTHY, 40 MINOR CONCERN, 222 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **248 findings in preserved history**, of which **244 are attached to live Adventures** and four remain `UNREGISTERED_SOURCE`. Live severity totals are HIGH 13, MEDIUM 182, LOW 39, with 10 unrecovered legacy severity values. Live cluster counts: CRA-C0001 171, C0002 18, C0003 1, C0004 22, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3; six live findings remain unclustered because their legacy cluster assignments are unrecovered.

The next unreviewed live Adventure is position **660**, **The Last Dry Rope** (`the-last-dry-rope`), `src/scenarios/expeditionLogisticsGenreBatch.ts`. Next finding ID: **CRA-F0249**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 660–669)

Reviewed the next ten actual unreviewed Adventures in live registry order. Traced dry-line assignment and safe lift alternatives; office record/message custody and late crew return; sample/pump load variants and stop-before-descent; north-flag/south-lantern handoff verification; gauge reading versus anchor-only inspection and manual comparison; bench-clamp fit/overhead misuse; caliper misuse versus pin/plate repair; intermittent telegraph splice testing and repair; pad fitting versus girth inspection/overload; and two-site rainfall versus upper-only measurement and tributary/crossing decisions. Six Adventures are HEALTHY. Four confirmed defects, CRA-F0249–CRA-F0252, extend CRA-C0001; no new cluster was needed. Focused expedition logistics, equipment-testing, and accounting suites passed 34 tests across three files. Tests are supporting evidence; findings are based on route-level source review.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 660 | The Last Dry Rope (`the-last-dry-rope`) | HEALTHY | — dry-line priority, crew/medicine move, hand-carry, tied-off chest, wait/partial and compensation routes do not overclaim a heavy lift. |
| 661 | The Empty Camp Office (`the-empty-camp-office`) | CONFIRMED DEFECT | CRA-F0249 (LOW) — leaving the books unsecured while preserving the sealed envelope can still receive reward credit for securing working records. |
| 662 | The Return Wagon (`the-wheel-of-the-return-wagon`) | HEALTHY | — sample-first, pump-first, rebalanced and stop/second-trip outcomes have matching route-specific text. |
| 663 | The Night Stage (`the-night-stage`) | HEALTHY | — caller identity is checked before box handoff; wait/retrieve and unsafe approach remain distinct. |
| 664 | The Line Under Load (`the-line-under-load`) | CONFIRMED DEFECT | CRA-F0250 (MEDIUM) — anchor-only inspection and hand comparison converge on claims of gauge readings/repeat not performed. |
| 665 | The Clamp That Walked (`the-clamp-that-walked`) | HEALTHY | — clamp limits are explicit; overhead and forced-use routes stop safely, and successful bench repairs have a fitting action. |
| 666 | The Caliper at the Siding (`the-caliper-at-the-siding`) | HEALTHY | — pin comparison/fitting supports the diagnosis; long-frame misuse and delayed replacement do not claim a repair. |
| 667 | The Needle at the North Station (`the-needle-at-the-north-station`) | HEALTHY | — splice isolation, repair, repeat answers, hand-delivery, and safe hold outcomes are distinguished. |
| 668 | The Saddle That Sat Crooked (`the-saddle-that-sat-crooked`) | CONFIRMED DEFECT | CRA-F0251 (MEDIUM) — girth-inspection-only route inherits pad-fit and centered-walk claims without fitting the pad. |
| 669 | The Rain Cup at Mill Run (`the-rain-cup-at-mill-run`) | CONFIRMED DEFECT | CRA-F0252 (LOW) — upper-only placement reaches a two-site rainfall comparison and a reward claim that both sites were recorded. |

Current live coverage is **669 reviewed / 192 remaining of 861**. Live classifications: **403 HEALTHY, 40 MINOR CONCERN, 226 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **252 findings in preserved history**, of which **248 are attached to live Adventures** and four remain `UNREGISTERED_SOURCE`. Live severity totals are HIGH 13, MEDIUM 185, LOW 40, with 10 unrecovered legacy severity values. Live cluster counts: CRA-C0001 175, C0002 18, C0003 1, C0004 22, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3; six live findings remain unclustered because their legacy cluster assignments are unrecovered.

The next unreviewed live Adventure is position **670**, **The Plumb Line on the Trestle** (`the-plumb-line-on-the-trestle`), `src/scenarios/equipmentTestingGenreBatch.ts`. Next finding ID: **CRA-F0253**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 670–679)

Reviewed ten further unreviewed Adventures in live registry order. Traced sample-post versus working-structure measurements; spare-wheel tool tests versus rim inspection; flame-screen testing versus vent inspection and signal orientation; jack footing and independent load support; rope-eye condition/upgrade gates and persistent provenance; buckle seam test versus acceptance/decline of a persistent upgrade; barn draft/reference/brace routes; document-hood versus locked-case custody; same-plank reversal versus straight-edge level checks; and tensioner half-turn, leather padding, gauge, abrasion, ordinary-knot and full-turn stop routes. Six Adventures are HEALTHY. Four MEDIUM findings, CRA-F0253–CRA-F0256, extend CRA-C0001; no new cluster was needed. The focused equipment-testing suite passed 15 tests; the source route traces remain the basis for each classification.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 670 | The Plumb Line on the Trestle (`the-plumb-line-on-the-trestle`) | HEALTHY | — the sample reading is not treated as a verdict on the cracked trestle; unsafe reopening is blocked. |
| 671 | The New Spoke Key (`the-new-spoke-key`) | CONFIRMED DEFECT | CRA-F0253 (MEDIUM) — rim-only inspection reaches a scene asserting a spare-key fit and tooth-failure test that was not performed. |
| 672 | The Lantern in Crosswind (`the-lantern-in-crosswind`) | CONFIRMED DEFECT | CRA-F0254 (MEDIUM) — vent-only inspection inherits leeward flame and hinge-orientation test results. |
| 673 | The Carriage Jack Demonstration (`the-carriage-jack-demonstration`) | HEALTHY | — demonstration itself establishes the lift and bent brace; soft ground and unsupported holding are stopped. |
| 674 | The Rope Eye Retested (`the-rope-eye-retested`) | HEALTHY | — only a normal, unreinforced rope is upgraded after a ground-drag test; suspended-load proof is refused. |
| 675 | The Freightman’s Buckle Trial (`the-freightmans-buckle-trial`) | CONFIRMED DEFECT | CRA-F0255 (MEDIUM) — declining the upgrade still receives text saying the persistent buckle upgrade was applied. |
| 676 | The Plumb Bob in the Barn (`the-plumb-bob-in-the-barn`) | HEALTHY | — draft settling, measurement limits, bracing/closure and optional lesson/payment remain distinct. |
| 677 | The Field Case with a Seam (`the-field-case-with-a-seam`) | HEALTHY | — the original stays in the lockable case while a duplicate tests the hood; a wet original is refused. |
| 678 | The Glass Level Disagrees (`the-glass-level-disagrees`) | CONFIRMED DEFECT | CRA-F0256 (MEDIUM) — straight-edge check receives a diagnosis claiming a same-plank reversal test and vial fault. |
| 679 | The Test in the Windbreak (`the-test-in-the-windbreak`) | HEALTHY | — the unsafe full turn stops; measured pull is distinguished from abrasion, and the ordinary-knot alternative remains available. |

Current live coverage is **679 reviewed / 182 remaining of 861**. Live classifications: **409 HEALTHY, 40 MINOR CONCERN, 230 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **256 findings in preserved history**, of which **252 are attached to live Adventures** and four remain `UNREGISTERED_SOURCE`. Live severity totals are HIGH 13, MEDIUM 189, LOW 40, with 10 unrecovered legacy severity values. Live cluster counts: CRA-C0001 179, C0002 18, C0003 1, C0004 22, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3; six live findings remain unclustered because their legacy cluster assignments are unrecovered.

The next unreviewed live Adventure is position **680**, **The Needle in the Grain Shed** (`the-needle-in-the-grain-shed`), `src/scenarios/equipmentTestingGenreBatch.ts`. Next finding ID: **CRA-F0257**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 680–689)

Reviewed ten more currently unreviewed Adventures in live order. Traced weighing versus seam-only inspection and ownership refusal; lantern-cage hinge tightening versus existing-guard comparison and rain cover; controlled handcart rim trials; clamp versus wedge on the press guide; cookhouse draft observation and vent/plate safety; zero calibration versus known-weight comparison and latch repair; rope-sleeve inspection and anchor limits; wet-pad control/overload/girth retest; Redbank guide-line inspection and passenger hold; and crate recovery by boat hook versus sheltered skiff with seal/tally custody. Five Adventures are HEALTHY. Five findings were added: three convergence/result-state findings CRA-F0257, CRA-F0258, and CRA-F0260 extend CRA-C0001; two broken-Gear physical-use gates CRA-F0259 and CRA-F0261 extend CRA-C0004. The focused equipment-testing and river-water suites passed 24 tests across two files; source-route tracing remains authoritative.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 680 | The Needle in the Grain Shed (`the-needle-in-the-grain-shed`) | CONFIRMED DEFECT | CRA-F0257 (LOW) — seam-only inspection reaches text claiming a sack-weight measurement. |
| 681 | The False Comfort of a Guard (`the-false-comfort-of-a-guard`) | CONFIRMED DEFECT | CRA-F0258 (LOW) — fitting an existing guard inherits text that the prototype hinge was tightened and tested. |
| 682 | The Handcart with the New Wheel (`the-handcart-with-the-new-wheel`) | HEALTHY | — controlled flat/rope tests expose the failed rim, while the sound old wheel takes the load home. |
| 683 | The Clamp beneath the Press (`the-clamp-beneath-the-press`) | CONFIRMED DEFECT | CRA-F0259 (MEDIUM) — BROKEN Folding Bench Clamp passes an ownership-only physical-use gate. |
| 684 | The Bellows That Drew Too Hard (`the-bellows-that-drew-too-hard`) | HEALTHY | — full burn is refused; small-fire success requires the high vent and the known-plate alternative stops the prototype. |
| 685 | The Spring That Would Not Return (`the-spring-that-would-not-return`) | CONFIRMED DEFECT | CRA-F0260 (LOW) — known-weight comparison inherits a narrative that says the zero check was performed. |
| 686 | The Rope That Frayed in the Sleeve (`the-rope-that-frayed-in-the-sleeve`) | HEALTHY | — only the crew line is tested; full loading is blocked and patching requires an unloaded retest. |
| 687 | The Saddle Pad in the Rain (`the-saddle-pad-in-the-rain`) | HEALTHY | — heavy-load strain is stopped; control, girth adjustment, light retest and drying remain distinct. |
| 688 | The Ferry Line at Redbank (`the-ferry-line-at-redbank`) | HEALTHY | — passengers stay ashore, usable gauge/hand inspection options are distinct, and the line is replaced before loading. |
| 689 | The Crate Beyond the Piles (`the-crate-beyond-the-piles`) | CONFIRMED DEFECT | CRA-F0261 (MEDIUM) — BROKEN Boat Hook passes an ownership-only crate-retrieval gate. |

Current live coverage is **689 reviewed / 172 remaining of 861**. Live classifications: **414 HEALTHY, 40 MINOR CONCERN, 235 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **261 findings in preserved history**, of which **257 are attached to live Adventures** and four remain `UNREGISTERED_SOURCE`. Live severity totals are HIGH 13, MEDIUM 191, LOW 43, with 10 unrecovered legacy severity values. Live cluster counts: CRA-C0001 182, C0002 18, C0003 1, C0004 24, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3; six live findings remain unclustered because their legacy cluster assignments are unrecovered.

The next unreviewed live Adventure is position **690**, **The Ford with the White Stone** (`the-ford-with-the-white-stone`), `src/scenarios/riverWaterWorkGenreBatch.ts`. Next finding ID: **CRA-F0262**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 690–699)

Reviewed the next ten currently unreviewed Adventures in exported `SCENARIOS` order. The route review covered bank sounding/observation and ford detours; tied-skiff bailing/unloading and patching; adding a mooring line versus moving the lighter; alternate ferry closure signals and acknowledgment; far-bank signaling versus Boat Hook branch movement; plank/line clearance; sounding versus old-mark comparison; flood-load sequencing with and without the Ledger Tube; wet-line inspection versus replacement; and channel sounding versus waiting for the pilot. Unsafe direct crossing, loaded testing, loaded-line pulling, boarding a moving ferry, and following an obsolete buoy are stopped. Reward, Knowledge, partial-delay, and persistent Gear effects were traced; none of these routes introduces run-local or save/reload-dependent proof state.

Two Adventures are HEALTHY, one is MINOR CONCERN, and seven have confirmed defects. Nine finding records were added: five ownership-only physical-Gear gates extend CRA-C0004; four route-specific action/NPC/test-result claims extend CRA-C0001. No new cluster was justified; CRA-C0010 remains the next unused cluster ID. The focused river-work, Gear-condition, and registry suites passed 23 tests across three files. These tests support but do not replace the route traces.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 690 | The Ford with the White Stone (`the-ford-with-the-white-stone`) | CONFIRMED DEFECT | CRA-F0262 (MEDIUM, CRA-C0004) — BROKEN Collapsible Sounding Rod passes the ownership-only probe gate. |
| 691 | The Skiff That Took Water (`the-skiff-that-took-water`) | MINOR CONCERN | — subtitle says the crew is aboard, but the entry scene puts both deckhands on the landing; routes keep them ashore. |
| 692 | The Mooring at Cotter Slip (`the-mooring-at-cotter-slip`) | CONFIRMED DEFECT | CRA-F0263 (MEDIUM, CRA-C0004) — BROKEN Travel Rope can pass the second-line gate; CRA-F0264 (MEDIUM, CRA-C0001) — moving the lighter inherits text claiming a second line was set and the chafe point protected. |
| 693 | The Lantern at the Lower Landing (`the-lantern-at-the-lower-landing`) | CONFIRMED DEFECT | CRA-F0265 (MEDIUM, CRA-C0004) — BROKEN Signal Flag Set or signal mirror passes the physical signaling gate. |
| 694 | The Ferry That Would Not Turn (`the-ferry-that-would-not-turn`) | CONFIRMED DEFECT | CRA-F0266 (MEDIUM, CRA-C0001) — Boat Hook branch movement inherits a far-bank response despite no signal. |
| 695 | The Rope under the Plank (`the-rope-under-the-plank`) | HEALTHY | — usable-gloves and carpenter-lift routes both establish slack and board removal; loaded-line pulling is refused. |
| 696 | The Mark Below the Waterline (`the-mark-below-the-waterline`) | CONFIRMED DEFECT | CRA-F0267 (MEDIUM, CRA-C0004) — BROKEN Sounding Rod passes the probe gate; CRA-F0268 (MEDIUM, CRA-C0001) — old-mark comparison inherits a specific timber/material/visibility finding. |
| 697 | The Case on the Flood Step (`the-case-on-the-flood-step`) | HEALTHY | — document-load order and tube-first index protection remain coherent; wait/neighbor-box paths stay partial. |
| 698 | The Wet Rope at Dawn (`the-wet-rope-at-dawn`) | CONFIRMED DEFECT | CRA-F0269 (LOW, CRA-C0001) — replace/tag-out route inherits the tactile splice-flex result. |
| 699 | The Channel That Moved (`the-channel-that-moved`) | CONFIRMED DEFECT | CRA-F0270 (MEDIUM, CRA-C0004) — BROKEN Collapsible Sounding Rod passes the physical channel-sounding gate. |

Current live coverage is **699 reviewed / 162 remaining of 861**. Live classifications: **416 HEALTHY, 41 MINOR CONCERN, 242 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **270 findings in preserved history**, of which **266 are attached to live Adventures** and four remain `UNREGISTERED_SOURCE`. Live severity totals are HIGH 13, MEDIUM 199, LOW 44, plus 10 unrecovered legacy values. Live cluster counts are CRA-C0001 186, C0002 18, C0003 1, C0004 29, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3 (260 clustered live findings); six live findings are unclustered. CRA-C0004 has 33 historical memberships including four unregistered findings; its live count is 29.

The next unreviewed live Adventure is position **700**, **The Sound under the Pontoon** (`the-sound-under-the-pontoon`), `src/scenarios/riverWaterWorkGenreBatch.ts`. Next finding ID: **CRA-F0271**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 700–709)

Reviewed ten more Adventures in the live exported order. Traced pontoon probing versus observing a current change, ownership dispute versus watch intervention on sealed night cargo, spade/rod clearing versus probing at the ferry wheel, glasses versus a bank-side call to recover a reed-channel boat, agreed crosswind signals and load restrictions, berth-collar inspection versus historical drawing, shortened regatta versus withdrawal, dry-side pump testing versus idle/closure, Boat Hook versus Travel Rope gate retrieval, and Slate Ferry investigation/repair/report branches. Unsafe boarding, wading, forced cranking, prying, full-load testing, and wet-bank pursuit are stopped. Partial outcomes, rewards, Knowledge, and released Gear were checked; no persistent route-proof state is introduced.

Six Adventures are HEALTHY, one is MINOR CONCERN, and three have confirmed MEDIUM findings CRA-F0271–CRA-F0273, all extending existing CRA-C0004. The iron-ring inspection route leaves the keeper’s independent use of the berth drawing unstated, so it remains a minor provenance concern rather than a confirmed finding. No new cluster was needed; CRA-C0010 remains unused. River-work, Gear-condition, and registry suites passed 23 tests across three files as supporting evidence.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 700 | The Sound under the Pontoon (`the-sound-under-the-pontoon`) | CONFIRMED DEFECT | CRA-F0271 (MEDIUM, CRA-C0004) — BROKEN Collapsible Sounding Rod passes the pontoon-probe gate. |
| 701 | The Night Cargo with Two Marks (`the-night-cargo-with-two-marks`) | HEALTHY | — sealed cargo stays with verified owners; recording marks is not treated as an ownership verdict. |
| 702 | The Ferry Wheel in the Silt (`the-ferry-wheel-in-the-silt`) | CONFIRMED DEFECT | CRA-F0272 (MEDIUM, CRA-C0004) — BROKEN Field Spade or Sounding Rod passes an ownership-only physical-use gate. |
| 703 | The Boat Beyond the Reeds (`the-boat-beyond-the-reeds`) | HEALTHY | — unusable mud is avoided; glasses are checked usable and recovery remains owner-controlled. |
| 704 | The Cable Ferry in Crosswind (`the-cable-ferry-in-crosswind`) | HEALTHY | — safe signals coordinate both banks; reopening is limited-load and wait remains closed/partial. |
| 705 | The Iron Ring at Low Water (`the-iron-ring-at-low-water`) | MINOR CONCERN | — the inspection route reaches a berth-drawing result without clarifying that the keeper consulted the drawing independently. |
| 706 | The Damaged Oar before the Race (`the-damaged-oar-before-the-race`) | HEALTHY | — grounded test exposes the split; shortened spare-oar trial and withdrawal remain distinct. |
| 707 | The Flooded Cellar Pump (`the-flooded-cellar-pump`) | HEALTHY | — dry-side test only clears shallow water; it is not represented as a flood barrier or evacuation. |
| 708 | The Boat Hook at the Cattle Bank (`the-boat-hook-at-the-cattle-bank`) | CONFIRMED DEFECT | CRA-F0273 (MEDIUM, CRA-C0004) — BROKEN Boat Hook or Travel Rope passes the gate-retrieval/secure route. |
| 709 | The Line Cut at Slate Ferry (`the-line-cut-at-slate-ferry`) | HEALTHY | — allegations remain testimony, eyewitness reporting stays precise, and the replacement is tested empty before reopening. |

Current live coverage is **709 reviewed / 152 remaining of 861**. Live classifications are **422 HEALTHY, 42 MINOR CONCERN, 245 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **273 findings in preserved history**, including **269 live** and four `UNREGISTERED_SOURCE`. Live severity totals: HIGH 13, MEDIUM 202, LOW 44, plus 10 unrecovered legacy values. Live cluster counts: CRA-C0001 186, C0002 18, C0003 1, C0004 32, C0005 1, C0006 17, C0007 4, C0008 1, C0009 3 (263 clustered live findings), with six live findings unclustered. CRA-C0004 has 36 historical assignments including four unregistered records; 32 are live.

The next unreviewed live Adventure is position **710**, **The Flood Mark on the Mill Door** (`the-flood-mark-on-the-mill-door`), `src/scenarios/riverWaterWorkGenreBatch.ts`. Next finding ID: **CRA-F0274**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed.

## Live-registry continuation (positions 710–719)

Reviewed ten Adventures in the live exported order. For the mill-door scenario, traced sack relocation versus active gate/water observation, below-mark loading refusal, intake clearing versus shutdown, and coin/gauge settlement. The returned-empty boat traced tally comparison versus dry-bank eddy inspection, unsafe dive refusal, cargo location reconciliation, and coin/strap settlement. Bridge debris traced detour/closure, farmer-first versus warning-boards-first, and stopped pier climbing. Freight net traced ashore testing versus moving cargo, people-first versus cargo-first, and refused net-as-mooring. Old lock traced Boat Hook/Travel Rope retrieval versus unsafe climb, sealed property return, and compensation. The passenger route preserved consent and sealed-letter/decline variants. Wet manifest traced duplicate, drying, and usable Ledger Tube paths plus the sealed-crate refusal. The spring flood preserved high-ground wait versus ridge passage and stopped ford use. Morning Bend traced signal versus marker handling, and barge rudder work stayed tied until fitted repair; temporary testing did not authorize the fast reach. Reward, partial, Gear, and persistent effects were checked; no new route flags or save-dependent state are involved.

Four Adventures are HEALTHY, three are MINOR CONCERN, and three have confirmed defects CRA-F0274–CRA-F0276. CRA-F0274 and CRA-F0275 extend CRA-C0001 for route-specific observation/discovery lost at convergence; CRA-F0276 extends CRA-C0004 for BROKEN Boat Hook/Travel Rope passing ownership-only physical-use gates. The freight-net crate release and marker-route worker response are retained as minor because the text permits intervening scene events but does not spell them out. The wet-manifest page-drying route similarly leaves the clerk's duplicate lookup implicit. No new cluster was justified; CRA-C0010 remains unused. River-water, Gear-condition, and registry suites passed 23 tests across three files; tests support but do not replace route review.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 710 | The Flood Mark on the Mill Door (the-flood-mark-on-the-mill-door) | CONFIRMED DEFECT | CRA-F0274 (LOW, CRA-C0001) — sack relocation inherits a millrace/debris observation made only on the watch-and-compare route. |
| 711 | The Boat That Came Back Empty (the-boat-that-came-back-empty) | CONFIRMED DEFECT | CRA-F0275 (MEDIUM, CRA-C0001) — dry-bank eddy inspection inherits a tally mismatch and second-landing chest location established only by comparing the records. |
| 712 | The Bridge Debris and the Ferry (the-bridge-debris-and-the-ferry) | HEALTHY | — farmer-first/boards-first outcomes, road closure, and reward remain route-consistent; pier climb is stopped. |
| 713 | The Freight Net at Dry Creek (the-freight-net-at-dry-creek) | MINOR CONCERN | — one empty crate becomes loose after being described contained; the transition is under-specified, not conclusively contradictory. |
| 714 | The Old Lock at Ferry Cut (the-old-lock-at-ferry-cut) | CONFIRMED DEFECT | CRA-F0276 (MEDIUM, CRA-C0004) — BROKEN Boat Hook or Travel Rope passes physical retrieval gates. |
| 715 | The Ferry Passenger Who Would Not Land (the-ferry-passenger-who-would-not-land) | HEALTHY | — consent, sealed-letter delivery, and refusal/decline remain distinct. |
| 716 | The Wet Manifest at East Wharf (the-wet-manifest-at-east-wharf) | MINOR CONCERN | — page-drying reaches duplicate-based claim text without clarifying the clerk's independent lookup; crate remains sealed. |
| 717 | The Spring Flood at Lower Meadow (the-spring-flood-at-lower-meadow) | HEALTHY | — ridge crossing versus high-ground delay is truthful; flooded-ford use is stopped. |
| 718 | The Driftwood at Morning Bend (the-driftwood-at-morning-bend) | MINOR CONCERN | — marker-move route shares text that workers step back, without specifying their independent response. |
| 719 | The Barge That Lost Its Rudder Pin (the-barge-that-lost-its-rudder-pin) | HEALTHY | — temporary pin test occurs tied against no current and never authorizes travel in the fast reach. |

Current live coverage is **719 reviewed / 142 remaining of 861**. Live classifications are **426 HEALTHY, 45 MINOR CONCERN, 248 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There are **276 findings in preserved history**, including **272 live** and four UNREGISTERED_SOURCE. Live severity totals: HIGH 13, MEDIUM 204, LOW 45, plus 10 unrecovered legacy values. Live cluster counts: CRA-C0001 188, C0002 18, C0003 1, C0004 33, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3 (266 clustered live findings), with six live findings unclustered. CRA-C0004 has 37 historical assignments including four unregistered records; 33 are live.

The next unreviewed live Adventure is position **720**, **The Cold Water at Stone Steps** (the-cold-water-at-stone-steps), src/scenarios/riverWaterWorkGenreBatch.ts. Next finding ID: **CRA-F0277**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Live-registry continuation (positions 720–729)

Completed ten route-level reviews in current live `SCENARIOS` order. Traced the icy-step/usable-glove versus hand-braced ramp, foot-only ferry crossing and pram hold; cut fence closure versus trail-first pursuit and herd-watch delegation; boundary-stake evidence versus unilateral placement; grounded harness patch test and transfer to the sound spare; blue-sealed sack separation versus delivery-tally inspection; held gate versus usable hook and herd reset; horse evacuation versus direct lantern lowering; short-furrow plow test and final-row stop; rope-lifted orchard net versus covering picked crates; and dog-alert/drain-screen rescue versus chase refusal. Gear ownership/condition distinctions, partial outcomes, reward and wage provenance, and unsafe-action stops were checked. No source or gameplay tests were changed.

Seven Adventures are HEALTHY; three have confirmed MEDIUM defects CRA-F0277–CRA-F0279, all extending CRA-C0001. CRA-F0277 is an unsupported delivery-tally/seed-grain discovery on the sack-separation route. CRA-F0278 is inaccurate Lantern Guard reward provenance on the direct-lantern route, which never evacuates the horses. CRA-F0279 is an orchard convergence that claims the net was lifted and bruising observed on the picked-crate-cover route. No new cluster was needed; CRA-C0010 remains unused. River-water/agriculture route suites, Gear-condition coverage, and registry validation are supporting checks, not substitutes for these route traces.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 720 | The Cold Water at Stone Steps (`the-cold-water-at-stone-steps`) | HEALTHY | — usable gloves or hand bracing establish the higher ramp; icy-step use stops, and the pram remains ashore. |
| 721 | The Cut Wire at Ash Pasture (`the-cut-wire-at-ash-pasture`) | HEALTHY | — herd remains behind the second rail; solo trail, owner custody, calm resolution, and rush/flight outcomes stay distinct. |
| 722 | The Last Post at Miller Fence (`the-last-post-at-miller-fence`) | HEALTHY | — unilateral post placement is stopped; the boundary book and both owners precede permanent placement. |
| 723 | The Harness before the Lime Run (`the-harness-before-the-lime-run`) | HEALTHY | — patched strap is only hand-tested; load transfers to sound spare before road travel, while delay remains partial. |
| 724 | The Feed Bin with the Blue Seam (`the-feed-bin-with-the-blue-seam`) | CONFIRMED DEFECT | CRA-F0277 (MEDIUM, CRA-C0001) — sack separation inherits tally and seed-grain findings without checking or learning them. |
| 725 | The Loose Gate at Thorn Brook (`the-loose-gate-at-thorn-brook`) | HEALTHY | — sound-pin repair precedes herd movement; clearing the bucket differs from closing the gate for handler reset. |
| 726 | Lantern Smoke in the Hayloft (`the-lantern-smoke-in-the-hayloft`) | CONFIRMED DEFECT | CRA-F0278 (MEDIUM, CRA-C0001) — direct lantern lowering can earn persistent reward provenance claiming the horses were evacuated. |
| 727 | The Plowshare before Rain (`the-plowshare-before-rain`) | HEALTHY | — refitted pin and short test precede final furrow; wait keeps team unhitched and plow covered. |
| 728 | The Apple Row after Hail (`the-apple-row-after-hail`) | CONFIRMED DEFECT | CRA-F0279 (MEDIUM, CRA-C0001) — covering crates inherits the net-lift and upper-bruising result. |
| 729 | The Dog at North Gate (`the-dog-at-north-gate`) | HEALTHY | — dog stays clear while handler/hook frees lamb; reward does not credit the dog with the rescue. |

At the position 720–729 checkpoint, live coverage was **729 reviewed / 132 remaining of 861**. Live classifications were **433 HEALTHY, 45 MINOR CONCERN, 251 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There were **279 findings in preserved history**, including **275 live** and four `UNREGISTERED_SOURCE`. Live severity totals were HIGH 13, MEDIUM 207, LOW 45, plus 10 unrecovered legacy values. Live cluster counts were CRA-C0001 191, C0002 18, C0003 1, C0004 33, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3 (269 clustered live findings), with six live findings unclustered. The next unreviewed live Adventure at that checkpoint was position **730**, **The Hay Wagon in Soft Ground** (`the-hay-wagon-in-soft-ground`), `src/scenarios/agricultureRanchAnimalWorkGenreBatch.ts`. Next finding ID: **CRA-F0280**; next available cluster ID: **CRA-C0010**. Weekly Scenario Batch remained paused.

## Live-registry continuation (positions 730–739)

Completed ten route-level reviews in live `SCENARIOS` order. Traced high-side unloading and blocked-jack recovery; trough closure/clean pail versus pipe inspection; machine-idle and handler-led steer/calf movement; record comparison versus witness consultation and shared-pen hold; saddle evidence, repair/report/threat and return; fleece-sack relocation versus sheep evacuation and race closure; lantern/gate management around a calving stall and the prohibited birth-handling route; first-load/second-load harvesting versus field-cover wait; suspended-hoist lowering versus stair inspection and lockout; and temporary irrigation restoration versus waiting for joint owners. Failure, partial work, non-occurrence, Gear condition, reward provenance, and ownership effects were checked.

Four Adventures are HEALTHY, three are MINOR CONCERN, and three have confirmed defects with four findings CRA-F0280–CRA-F0283. CRA-F0280, CRA-F0281, and CRA-F0283 extend CRA-C0001 for route-specific inspection, animal-location, and outcome proof lost at convergence. CRA-F0282 extends CRA-C0004 because a BROKEN Travel Rope passes an ownership-only physical-use gate. The calf witness source, lantern movement during the calving transition, and grain-hoist guide adjustment remain minor because NPC/intervening action is plausible but under-described. Agriculture, Gear-condition, and registry suites passed 22 tests across three files as supporting evidence; no gameplay source or tests changed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 730 | The Hay Wagon in Soft Ground (`the-hay-wagon-in-soft-ground`) | HEALTHY | — unload/firm-block recovery or delayed work remains distinct; unsafe push is stopped. |
| 731 | The Trough after Thaw (`the-trough-after-thaw`) | CONFIRMED DEFECT | CRA-F0280 (MEDIUM, CRA-C0001) — trough closure inherits a pipe-clear inspection result. |
| 732 | The Steer in the Threshing Lane (`the-steer-in-the-threshing-lane`) | HEALTHY | — idle machinery and paired steer/calf movement precede restart; waiting remains partial. |
| 733 | The Calf with Two Ear Notches (`the-calf-with-two-ear-notches`) | MINOR CONCERN | — records route enters a scene with a milker witness recollection not explicitly solicited. |
| 734 | The Saddle Marks on the Wagon (`the-saddle-marks-on-the-wagon`) | HEALTHY | — evidence locates owner-confirmed tack; accusation is held, threat is interrupted, and repair/report outcomes differ. |
| 735 | The Sheep Wash at Cold Creek (`the-sheep-wash-at-cold-creek`) | CONFIRMED DEFECT | CRA-F0281 (HIGH, CRA-C0001) — moving sacks inherits an unsupported flock-uphill location. |
| 736 | The Calving Lamp at Three Oaks (`the-calfing-lamp-at-three-oaks`) | MINOR CONCERN | — shared text assumes lantern movement on gate-first setup; other actors may move it. |
| 737 | The Dry Row before the Threshing (`the-dry-row-before-the-threshing`) | CONFIRMED DEFECT | CRA-F0282 (MEDIUM, CRA-C0004) — BROKEN Travel Rope can secure cover; CRA-F0283 (MEDIUM, CRA-C0001) — covered-field wait claims crop delivery without a load/transport route. |
| 738 | The Grain Lift at Low Barn (`the-grain-lift-at-low-barn`) | MINOR CONCERN | — empty hoist test says the guide was shifted though no choice names that repair; operator work may be implicit. |
| 739 | The Irrigation Stone at South Field (`the-irrigation-stone-at-south-field`) | HEALTHY | — final split follows joint owner inspection; blocking/holding and wait outcomes preserve shared access. |

At the position 730–739 checkpoint, live coverage was **739 reviewed / 122 remaining of 861**. Live classifications were **437 HEALTHY, 48 MINOR CONCERN, 254 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. There were **283 findings in preserved history**, including **279 live** and four `UNREGISTERED_SOURCE`. Live severity totals were HIGH 14, MEDIUM 210, LOW 45, plus 10 unrecovered legacy values. Live cluster counts were CRA-C0001 194, C0002 18, C0003 1, C0004 34, C0005 1, C0006 17, C0007 4, C0008 1, and C0009 3 (273 clustered live findings), with six live findings unclustered. The next unreviewed live Adventure at that checkpoint was position **740**, **The Red Lantern in the Pig Shed** (`the-red-lantern-in-the-pig-shed`), `src/scenarios/agricultureRanchAnimalWorkGenreBatch.ts`. Next finding ID: **CRA-F0284**; next available cluster ID: **CRA-C0010**. Weekly Scenario Batch remained paused.

## Live-registry continuation (positions 750–759)

Completed ten route-level reviews in live `SCENARIOS` order. The agriculture routes traced tarp/gate and animal movement, feed-bin repair versus relocation, tool ownership and release, saddle bill versus rut evidence, and route-specific rewards. The investigation story-builder routes traced physical evidence inquiries through interpretation and settlement, including combat interruption, Knowledge acquisition, Gear rewards, and old-save settlement fallback. Investigation outcomes preserve uncertainty, but several named tool actions in the first seven builder stories lack availability gates.

The source review identified eight confirmed-defect Adventures with thirteen MEDIUM findings CRA-F0287–CRA-F0299. CRA-F0287–CRA-F0289, CRA-F0291, and CRA-F0296–CRA-F0299 extend CRA-C0001 for route-specific setup, evidence, discovery, and agreement outcomes lost at convergence. CRA-F0290, CRA-F0292–CRA-F0295 extend CRA-C0008: the Survey Chain, Assayer’s Loupe, Field Calipers, Waterproof Ledger Tube, and Heavy Leather Gloves choices are explicitly tool uses but lack inventory/usable-condition gates. The Old Fence Tool and Ash Line remain MINOR CONCERN because their continuity gaps could be explained by NPC/off-screen actions but are under-specified; no additional defect was inferred. The Scrape Beneath the Lock is CONFIRMED DEFECT: its shared evidence scene says the spare key turns and leaves a mark even on the cart-crew-inquiry route, which did not test the key. Agriculture, investigation-evidence, Gear-condition, and registry suites passed 32 tests across four files as supporting evidence; route tracing remains the basis for classifications.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 750 | The Foal in the Windbreak (`the-foal-in-the-windbreak`) | CONFIRMED DEFECT | CRA-F0287 (MEDIUM, CRA-C0001) — mare-relocation enters passage text asserting tarp-secure and rail-lowering actions that route did not establish. |
| 751 | The Last Bin at Winter Yard (`the-last-bin-at-winter-yard`) | CONFIRMED DEFECT | CRA-F0288 (MEDIUM, CRA-C0001) — board-brace route can reach partial result claiming sacks were raised. |
| 752 | The Old Fence Tool at Red House (`the-old-fence-tool-at-red-house`) | MINOR CONCERN | — compare-only route shares a records scene with the farmer’s recollection; whether volunteered is not explicit. |
| 753 | The Scrape Beneath the Lock (`the-scrape-beneath-the-lock`) | CONFIRMED DEFECT | CRA-F0296 (MEDIUM, CRA-C0001) — cart-crew inquiry route inherits key-turn evidence; Knowledge, combat outcomes, and usable Pocket Toolkit gate otherwise remain consistent. |
| 754 | The Two Widths at Morrow Road (`the-two-widths-at-morrow-road`) | CONFIRMED DEFECT | CRA-F0289 (MEDIUM, CRA-C0001) — track-only route gets crate discovery and inventory request is narrated as accusation; CRA-F0290 (MEDIUM, CRA-C0008) — Survey Chain use has no availability gate. |
| 755 | The Seal with the Second Notch (`the-seal-with-the-second-notch`) | CONFIRMED DEFECT | CRA-F0291 (MEDIUM, CRA-C0001) — held crate route claims receiver acceptance; CRA-F0292 (MEDIUM, CRA-C0008) — Assayer’s Loupe use has no availability gate. |
| 756 | The Ash Line at Cooper Shed (`the-ash-line-at-cooper-shed`) | MINOR CONCERN | — combat interruption introduces an unexplained “disputed item”; no definite route contradiction is established. |
| 757 | The Gate Pin at South Pasture (`the-gate-pin-at-south-pasture`) | CONFIRMED DEFECT | CRA-F0293 (MEDIUM, CRA-C0008) — Field Calipers comparison has no availability gate; CRA-F0297 (MEDIUM, CRA-C0001) — neighbor-inquiry route inherits socket-fit examination. |
| 758 | The Ledger Page That Dried (`the-ledger-page-that-dried`) | CONFIRMED DEFECT | CRA-F0294 (MEDIUM, CRA-C0008) — Waterproof Ledger Tube handling has no availability gate; CRA-F0298 (MEDIUM, CRA-C0001) — tube/clerk routes inherit the pressure-mark discovery. |
| 759 | The Rope Fibers on the Ferry Cleat (`the-rope-fibers-on-the-ferry-cleat`) | CONFIRMED DEFECT | CRA-F0295 (MEDIUM, CRA-C0008) — Heavy Leather Gloves handling has no availability gate; CRA-F0299 (MEDIUM, CRA-C0001) — last-securement inquiry inherits splice examination. |

The current live checkpoint is **759 reviewed / 102 remaining of 861**: **444 HEALTHY, 50 MINOR CONCERN, 265 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. Preserved history contains **299 findings**: **295 live** and four unregistered. Live severity totals are HIGH 14, MEDIUM 226, LOW 45, plus 10 unrecovered legacy values. Live clusters are CRA-C0001 204, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 6, C0009 3 (289 clustered), with six unclustered. The first unreviewed live Adventure is position **760**, **The Switch That Faced East** (`the-switch-that-faced-east`), `src/scenarios/investigationEvidenceGenreBatch.ts`. Next finding ID: **CRA-F0300**; next available cluster ID: **CRA-C0010**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Live-registry continuation (positions 760–769)

Completed ten route-level reviews in current live registry order through the investigation-evidence builder. For each story, the inspection alternatives, shared evidence scene, interpretation/response choices, settlement, Knowledge and Gear effects, and any combat interruption were compared. The first explicit tool-use routes were checked against the helper’s per-story equipment requirements; legacy-compatible settlement Knowledge grants and Gear provenance were also traced. Existing investigation, Gear-condition, and registry suites passed 24 tests across three files as supporting checks, not as substitutes for source review.

Eight Adventures have confirmed defects with eleven MEDIUM findings CRA-F0300–CRA-F0310. Six extend CRA-C0001 for shared evidence scenes importing a physical comparison, measurement, or discovery not established by every incoming inquiry route. Five extend CRA-C0008 for named equipment actions without inventory/usable-condition gates. The Dry Footprints remains a MINOR CONCERN because the chronology result is compatible with the opening scene but its route-specific establishment is unclear; the Glass in the Lantern Room is HEALTHY, including its usable mirror gate and bounded repair/charge outcomes. No new CRA cluster was needed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 760 | The Switch That Faced East (`the-switch-that-faced-east`) | CONFIRMED DEFECT | CRA-F0300 (MEDIUM, CRA-C0001) — non-tool inquiry can receive the bent-pin inspection result. |
| 761 | The Stone under the Floorboard (`the-stone-under-the-floorboard`) | CONFIRMED DEFECT | CRA-F0301 (MEDIUM, CRA-C0001) — mirror/plan routes inherit rod-measured void result; CRA-F0302 (MEDIUM, CRA-C0008) — sounding-rod use has no availability gate. |
| 762 | The Missing Shears at the Mill (`the-missing-shears-at-the-mill`) | CONFIRMED DEFECT | CRA-F0303 (MEDIUM, CRA-C0001) — shared test reveals a beneath-bench thread without a route that searches there. |
| 763 | The Boot Mark in the Ash (`the-boot-mark-in-the-ash`) | CONFIRMED DEFECT | CRA-F0304 (MEDIUM, CRA-C0001) — worker-timing inquiry inherits print-size comparison; CRA-F0305 (MEDIUM, CRA-C0008) — folding-rule measurement has no availability gate. |
| 764 | The Two Seals at Blackwater Dock (`the-two-seals-at-blackwater-dock`) | CONFIRMED DEFECT | CRA-F0306 (MEDIUM, CRA-C0001) — non-crew routes inherit Bell Landing testimony; CRA-F0307 (MEDIUM, CRA-C0008) — ledger-tube use has no availability gate. |
| 765 | The Stone Chips at the Quarry (`the-stone-chips-at-the-quarry`) | CONFIRMED DEFECT | CRA-F0308 (MEDIUM, CRA-C0008) — Field Calipers and Survey Chain measurements have no availability gates. |
| 766 | The Empty Hook in the Tool Room (`the-empty-hook-in-the-tool-room`) | CONFIRMED DEFECT | CRA-F0309 (MEDIUM, CRA-C0001) — repair-bench route inherits the issue-book sign-out result. |
| 767 | The Chalk Line at the Old Boundary (`the-chalk-line-at-the-old-boundary`) | CONFIRMED DEFECT | CRA-F0310 (MEDIUM, CRA-C0008) — Survey Chain measurement has no availability gate. |
| 768 | The Glass in the Lantern Room (`the-glass-in-the-lantern-room`) | HEALTHY | — usable Folding Card Mirror gate, uncertain cause, prospective repair, and non-accusatory outcomes are consistent. |
| 769 | The Dry Footprints in Wet Clay (`the-dry-footprints-in-wet-clay`) | MINOR CONCERN | — route-specific wet-trail chronology is not explicit, but no post-seal crossing is claimed. |


## Live-registry continuation (positions 770–779)

Completed ten route-level reviews in live registry order: the last seven included investigation-builder stories, followed by the first three industrial machine-work stories. Inspection paths were traced separately from shared findings, responses, and final compensation. For the industrial stories, Gear gates, repair/shutdown/rush routes, test-before-restart, injury/partial consequences, Knowledge persistence, reward eligibility, and safe handoff were checked. Investigation Knowledge/settlement fallbacks and tool-specific gates were reviewed; these source distinctions, not the tests, determine the classifications.

Six Adventures have confirmed defects with seven MEDIUM findings CRA-F0311–CRA-F0317. Six extend CRA-C0001 for unsupported route-specific inspection, interpretation, and repair results at convergence. CRA-F0316 extends CRA-C0008 because the Assayer’s Loupe action lacks an inventory/usable-condition gate. The Red Thread at the Bridge and first three industrial Adventures are HEALTHY; no minor concern or new cluster was identified. Investigation-evidence, industrial mill/rail, Gear-condition, and registry suites passed 33 tests across four files as supporting checks.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 770 | The Bent Pin in the Harvest Engine (`the-bent-pin-in-the-harvest-engine`) | CONFIRMED DEFECT | CRA-F0311 (MEDIUM, CRA-C0001) — joint inspection route receives repair-completion text. |
| 771 | The Map with Two Norths (`the-map-with-two-norths`) | CONFIRMED DEFECT | CRA-F0312 (MEDIUM, CRA-C0001) — protected-copy route receives orientation/scale analysis. |
| 772 | The Wax on the Keyhole (`the-wax-on-the-keyhole`) | CONFIRMED DEFECT | CRA-F0313 (MEDIUM, CRA-C0001) — staff/key inquiry routes inherit wax comparison. |
| 773 | The Quiet Bell at Milepost Four (`the-quiet-bell-at-milepost-four`) | CONFIRMED DEFECT | CRA-F0314 (MEDIUM, CRA-C0001) — witness/window inquiry routes inherit rope-mechanism test. |
| 774 | The Notches on the Old Millstone (`the-notches-on-the-old-millstone`) | CONFIRMED DEFECT | CRA-F0315 (MEDIUM, CRA-C0001) — foundation-history inquiry inherits mark comparison; CRA-F0316 (MEDIUM, CRA-C0008) — Assayer’s Loupe use has no availability gate. |
| 775 | The Red Thread at the Bridge (`the-red-thread-at-the-bridge`) | HEALTHY | — marker purpose is stated at entry; evidence limits and bridge closure remain truthful. |
| 776 | The Sealed Letter at Cedar Post (`the-sealed-letter-at-cedar-post`) | CONFIRMED DEFECT | CRA-F0317 (MEDIUM, CRA-C0001) — courier/ledger route receives witness-book signature verification. |
| 777 | The Belt That Slapped Back (`the-belt-that-slapped-back`) | HEALTHY | — usable multi-tool gate, isolated repair, hand/unloaded test, load complication, and no-injury rush result remain consistent. |
| 778 | One Tooth on the Sawmill (`one-tooth-on-the-sawmill`) | HEALTHY | — usable glove gate, log isolation, hand pass, secondary chip, and partial/unsafe outcomes remain distinct. |
| 779 | The East Siding Points (`the-east-siding-points`) | HEALTHY | — usable toolkit gate and stop signal remain; halfway-catching lock prevents unsupported safe-clear claim. |


## Live-registry continuation (positions 780–789)

Completed ten route-level reviews of industrial mill/rail work scenarios. For each machine, the inspection Gear gate, observation alternative, shutdown and repair sequence, test-before-restart branch, full-load/rush outcome, partial/withdrawal path, machine-specific complication, Knowledge, and compensation/reward effects were checked. The same helper preserves the test/shutdown/rush distinction and withholds specified rewards after a rushed failure. Industrial mill/rail, Gear-condition, and registry suites passed 23 tests across three files as supporting checks.

Nine Adventures are HEALTHY. The Rivet at Car Seven remains a MINOR CONCERN: its optional file action explicitly leaves a possibly cracked hole to the fitter but then proceeds to the short empty-car movement test without clarifying why that test is safe before fitter inspection. The route is controlled and does not prove an unsafe event, so this was not promoted to a confirmed defect. No new finding or cluster was added.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 780 | The Load under the Warehouse Hoist (`the-load-under-the-warehouse-hoist`) | HEALTHY | — rated rigging, blocking, empty-hook test, and later sling-split discovery remain distinct; no loaded lift is certified. |
| 781 | The Pump below Number Three (`the-pump-below-number-three`) | HEALTHY | — isolated pin replacement and shallow-channel test reveal reduced discharge before full-flow claim. |
| 782 | The Warm Bearing at Noon (`the-warm-bearing-at-noon`) | HEALTHY | — unloaded test does not clear load recurrence; the line remains shut for scoring inspection. |
| 783 | The Rivet at Car Seven (`the-rivet-at-car-seven`) | MINOR CONCERN | — optional burr-file route reaches a short movement test before fitter inspection of possible cracked hole; rationale is under-specified. |
| 784 | The Semaphore in the Rain (`the-semaphore-in-the-rain`) | HEALTHY | — full linkage travel is tested, but rain-obscured sight line keeps junction closed. |
| 785 | The Grain under the Guard (`the-grain-under-the-guard`) | HEALTHY | — lockout/gloves/empty-run sequence is respected; continued feed leakage keeps fault open. |
| 786 | The Hoist That Would Not Set Down (`the-hoist-that-would-not-set-down`) | HEALTHY | — empty brake test is not treated as loaded capacity; bent lifting eye prevents another lift. |
| 787 | The Lathe Chip (`the-lathe-chip`) | HEALTHY | — isolated rest repair and scrap test do not claim the already-undersize production shaft is usable. |
| 788 | The Winch’s Uneven Pull (`the-winches-uneven-pull`) | HEALTHY | — empty tub test exposes a loaded wheel defect; system remains out of service. |
| 789 | The Steam Pipe behind the Washroom (`the-steam-pipe-behind-the-washroom`) | HEALTHY | — normal gauge does not negate scald risk; valve isolation, cooling, fitter reseal, and second weak seam remain explicit. |

At the preceding 780–789 checkpoint, live coverage was **789 reviewed / 72 remaining of 861**: **458 HEALTHY, 52 MINOR CONCERN, 279 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. That checkpoint carried 317 history findings (313 live and four unregistered), with live clusters C0001 216, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, and six unclustered. The current checkpoint is summarized below after positions 790–799.

## Live-registry continuation (positions 790–799)

Completed ten route-level reviews of the industrial mill/rail builder. For each story, the materially distinct paths were traced through inspection (named Gear or observation/shutdown), diagnosis, repair/hold/rush, safe test/stop, full-load failure, partial withdrawal, settlement, Knowledge, and reward. The common diagnosis scene concatenates the story’s `complication` text before the player selects repair, hold, or rush; the same text is then repeated in the test scene. In all ten records, the complication describes a later discovery, repair, or test outcome, creating a chronology defect before the outcome-producing action. This demonstrably shared builder mechanism establishes CRA-C0010.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 790 | The Tool Peg on Night Shift (`the-tool-peg-on-night-shift`) | CONFIRMED DEFECT | CRA-F0318 (MEDIUM, CRA-C0010) — diagnosis says the spanner is unknown and also already found in the fitter’s drawer before the search/repair choice. |
| 791 | The Misfed Grain Gate (`the-misfed-grain-gate`) | CONFIRMED DEFECT | CRA-F0319 (MEDIUM, CRA-C0010) — low-flow gate hold and damp second-bin discovery are disclosed before stop replacement/test. |
| 792 | The Dragging Brake at Bell Yard (`the-dragging-brake-at-bell-yard`) | CONFIRMED DEFECT | CRA-F0320 (MEDIUM, CRA-C0010) — cleared shoes and postponed loaded test are reported before spring replacement/empty test. |
| 793 | The Shaft Marks at Ash Mill (`the-shaft-marks-at-ash-mill`) | CONFIRMED DEFECT | CRA-F0321 (MEDIUM, CRA-C0010) — hand-turn success and uneven block compression appear before millwright inspection/hand-turn test. |
| 794 | The Jam at the Sorting Table (`the-sorting-table-jam`) | CONFIRMED DEFECT | CRA-F0322 (MEDIUM, CRA-C0010) — the running table and held unlabeled parcel are reported before clearing the jam. |
| 795 | The Cable over Foundry Road (`the-cable-over-foundry-road`) | CONFIRMED DEFECT | CRA-F0323 (MEDIUM, CRA-C0010) — free empty-carrier movement and the cracked anchor discovery precede worker clearance and rigger inspection. |
| 796 | The Ore Cart on the Incline (`the-ore-cart-on-the-incline`) | CONFIRMED DEFECT | CRA-F0324 (MEDIUM, CRA-C0010) — empty-cart brake success and cracked rim are disclosed before added chocking/unloading/testing. |
| 797 | The Bell before the Restart (`the-bell-before-the-restart`) | CONFIRMED DEFECT | CRA-F0325 (MEDIUM, CRA-C0010) — crew whistle response and foreman admission appear before signal agreement and test. |
| 798 | The Oil on the Switch Rod (`the-oil-on-the-switch-rod`) | CONFIRMED DEFECT | CRA-F0326 (MEDIUM, CRA-C0010) — free movement and oval lock-hole discovery appear before cleaning/lubrication/double-throw test. |
| 799 | The Sparks at the Belt House (`the-sparks-at-the-belt-house`) | CONFIRMED DEFECT | CRA-F0327 (MEDIUM, CRA-C0010) — cleared splice and oil-waste discovery appear before splice replacement/cleanup/test. |

The supporting industrial mill/rail, Gear-condition, and registry suites passed **23 tests across three files**. Tests are supporting evidence; the findings are based on the shared-builder source and each story’s current complication text. No scenario source or gameplay tests were changed.

At the 790–799 checkpoint, live coverage was **799 reviewed / 62 remaining of 861**: **458 HEALTHY, 52 MINOR CONCERN, 289 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. That checkpoint had 327 history findings (323 live and four unregistered), including 10 CRA-C0010 chronology findings. The current checkpoint is summarized below after positions 800–809.

## Live-registry continuation (positions 800–809)

Completed ten route-level reviews spanning the last Industrial Mill/Rail story and the first nine Medical Rescue/Support stories. For the industrial case, the usable-caliper, observation, repair, hold, full-load, unloaded-test, partial, Knowledge, and compensation routes were traced. Its diagnosis scene repeats the post-test complication before any repair/test choice, extending CRA-C0010.

For each medical story, the assessment choices and their usable-Gear requirements, patient/caregiver state, follow-up stay/transfer/abandon choices, lesson qualification, compensation, reward, and save/resume behavior were traced. The shared close scene’s compensation/lesson variants were compared against routes that leave the patient, attempt an unsafe carry, or do not establish transfer. Four precise route-specific handoff contradictions extend CRA-C0001. Two unsafe-action aftermaths remain MINOR CONCERN because the text leaves the immediate result under-specified but does not establish a definite false claim. Three other medical stories are HEALTHY.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 800 | The Slow Wheel at Copper Mill (`the-slow-wheel-at-copper-mill`) | CONFIRMED DEFECT | CRA-F0328 (MEDIUM, CRA-C0010) — the click-is-gone/full-inspection complication appears in diagnosis before repair or test. |
| 801 | The Millwright’s Hand (`the-millwrights-hand`) | CONFIRMED DEFECT | CRA-F0329 (MEDIUM, CRA-C0001) — leave-to-secure-mill route ends claiming trained care/handoff while doctor is miles away and no one is established as staying. |
| 802 | The Stonecutter’s Narrow Way (`the-stonecutters-narrow-way`) | CONFIRMED DEFECT | CRA-F0330 (MEDIUM, CRA-C0001) — unresolved loose-stair stretcher attempt can end as completed trained-care handoff. |
| 803 | Lanterns at Milepost Nine (`lanterns-at-milepost-nine`) | CONFIRMED DEFECT | CRA-F0331 (MEDIUM, CRA-C0001) — passenger explicitly left beside the road can end with a claimed handoff despite coach/doctor not returning. |
| 804 | The Roofer’s Breath (`the-roofers-breath`) | HEALTHY | — roofer is already on level ground with carpenter present; no unsupported diagnosis or return-to-roof claim. |
| 805 | The Ferry-Keeper’s Shoulder (`the-ferry-keepers-shoulder`) | MINOR CONCERN | — pull-by-shoulder route has no explicit immediate consequence before settlement; no definite injury claim is made. |
| 806 | A Hand under the Wagon (`a-hand-under-the-wagon`) | MINOR CONCERN | — coat-pull under a rocking load has no explicit result/load-state update before handoff; no conclusively false outcome is established. |
| 807 | The Doctor’s Case on the Wrong Road (`the-doctors-case-on-the-wrong-road`) | HEALTHY | — wrong-road case run is not narrated as a successful delivery; family remains with child. |
| 808 | The Smoke Room at Cedar Inn (`the-smoke-room-at-cedar-inn`) | HEALTHY | — cook remains outside under doctor’s care; pantry boundary and no-reentry claim remain truthful. |
| 809 | The Quarry Call Below (`the-quarry-call-below`) | CONFIRMED DEFECT | CRA-F0332 (MEDIUM, CRA-C0001) — blocked-ladder attempt reaches completed-handoff text while worker remains below and rescue lead stays at rim. |

The industrial mill/rail, medical rescue/support, Gear-condition, and registry suites passed **31 tests across four files**. The medical suite also checks route-specific lesson eligibility, Gear usability, and save/resume; it does not replace the route-level witness review. No scenario source or gameplay test was changed.

The current live checkpoint is **809 reviewed / 52 remaining of 861**: **461 HEALTHY, 54 MINOR CONCERN, 294 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. Preserved history contains **332 findings**: **328 live** and four unregistered. Live severity totals are HIGH 14, MEDIUM 259, LOW 45, plus 10 unrecovered legacy values. Live cluster counts are CRA-C0001 220, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, and C0010 11 (322 clustered), with six unclustered. The first unreviewed live Adventure is position **810**, **The Soaked Post Road** (`the-frozen-post-road`), `src/scenarios/medicalRescueSupportGenreBatch.ts`. Next finding ID: **CRA-F0333**; next available cluster ID: **CRA-C0011**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Live-registry continuation (positions 810–819)

Completed ten route-level reviews of medical rescue/support scenarios. Across each graph, assessment and usable-Gear gates, patient and caregiver locations, stay/transfer/withdrawal decisions, lesson and compensation eligibility, persistent state, and endings were traced. Five Adventures are HEALTHY. Three remain MINOR CONCERN because a hazardous attempt’s immediate aftermath is under-specified without a provably false result. Two have confirmed completed-care handoff claims without route proof of arrival or transfer; both extend CRA-C0001. Medical rescue/support, Gear-condition, and registry suites passed **22 tests across three files** as supporting checks.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 810 | The Soaked Post Road (`the-frozen-post-road`) | CONFIRMED DEFECT | CRA-F0333 (MEDIUM, CRA-C0001) — continuing walk away from the ready shelter can end with a completed-care handoff claim without arrival or transfer. |
| 811 | The Count at the Mine Mouth (`the-mine-mouth-count`) | HEALTHY | — the two missing miners remain unaccounted for; no route claims they were found or the unstable drift entered safely. |
| 812 | The Night Watchman’s Lamp (`the-night-watchmans-lamp`) | MINOR CONCERN | — a dizzy patient can be hurried across the yard without an explicit immediate result, though no injury or diagnosis is asserted. |
| 813 | The Signal on the Ridge (`the-signal-on-the-ridge`) | CONFIRMED DEFECT | CRA-F0334 (MEDIUM, CRA-C0001) — direct scree-descent attempt reaches completed-handoff wording without a person-state transition or transfer. |
| 814 | The Splintered Door at South Ward (`the-splintered-door-at-south-ward`) | HEALTHY | — caregiver remains with the patient; the pry action is gated to an empty outer hinge. |
| 815 | The Collapsed Shed Door (`the-collapsed-shed-door`) | MINOR CONCERN | — pull beneath the shifting beam has no explicit result before generic handoff, but no definite false rescue claim is made. |
| 816 | The Rail Carriage Step (`the-rail-carriage-step`) | HEALTHY | — conductor remains with the passenger or holds boarding; the ending does not claim a completed lift. |
| 817 | The Sickroom at Red Hollow (`the-sickroom-at-red-hollow`) | HEALTHY | — neighbor presence and patient condition remain explicit; no diagnosis or recovery is invented. |
| 818 | The Trapper at the Culvert (`the-trapper-at-the-culvert`) | HEALTHY | — driver cover remains available and unsafe reach does not claim the trap disarmed or supplies recovered. |
| 819 | The Sleeper under the Platform (`the-sleeper-under-the-platform`) | MINOR CONCERN | — pulling before checking the cart load has no explicit immediate outcome, but no extraction or injury is asserted. |

The live checkpoint is now **819 reviewed / 42 remaining of 861**: **466 HEALTHY, 57 MINOR CONCERN, 296 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. Preserved history contains **334 findings**: **330 live** and four unregistered. Live severity totals are HIGH 14, MEDIUM 261, LOW 45, plus 10 unrecovered legacy values. Live cluster counts are CRA-C0001 222, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, and C0010 11 (322 clustered), with six unclustered. The first unreviewed live Adventure is position **820**, **The Farmer’s Daughter at the Icehouse** (`the-farmers-daughter-at-the-icehouse`), `src/scenarios/medicalRescueSupportGenreBatch.ts`. Next finding ID: **CRA-F0335**; next available cluster ID: **CRA-C0011**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Live-registry continuation (positions 820–829)

Completed five medical rescue/support scenarios and the first five construction/building scenarios. For the medical cases, the materially distinct support and movement choices, responsible-person presence, unsafe actions, referral/transfer, Gear, Knowledge eligibility, rewards, and close variants were checked. Two are HEALTHY; three are MINOR CONCERN because an unsafe action lacks a specific immediate consequence, but no definite false outcome is asserted.

The five construction scenarios share a concrete builder defect. `start.inspect` and `start.rush` both enter `work`; that scene unconditionally includes the story-specific `methodResult`, even though the player’s `measure` choice is only offered afterward. Thus the unperformed Carpenter’s Square, rope, clamp, trim, or sounding-rod result is disclosed to every incoming route. CRA-F0335–CRA-F0339 record each assignment under new CRA-C0011, “Method result disclosed before method choice.”

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 820 | The Farmer’s Daughter at the Icehouse (`the-farmers-daughter-at-the-icehouse`) | MINOR CONCERN | — premature carry down the narrow steps has no explicit immediate result; no definite injury or false handoff is claimed. |
| 821 | The Foggy Lane to the Doctor (`the-foggy-lane-to-the-doctor`) | HEALTHY | — innkeeper-guided patient route and Traveler-goes-ahead handoff retain an attendant; no diagnosis or arrival is invented. |
| 822 | The Camp Cook’s Burned Sleeve (`the-camp-cook-with-the-burned-sleeve`) | MINOR CONCERN | — pulling stuck fabric has no stated immediate result; no successful treatment or removal is claimed. |
| 823 | The Dog Handler at the Switchback (`the-dog-handler-at-the-switchback`) | MINOR CONCERN | — shale-shortcut choice separates handler and dog without a stated reunion or consequence; no reunion is claimed later. |
| 824 | The Evacuation Bell at Pine Crossing (`the-evacuation-bell-at-pine-crossing`) | HEALTHY | — residents remain with the reeve/team on high ground; the closed-bridge cart choice does not claim their evacuation. |
| 825 | The Square at Mill Street (`the-square-at-mill-street`) | CONFIRMED DEFECT | CRA-F0335 (MEDIUM, CRA-C0011) — square measurement result appears in `work` before `work.measure`. |
| 826 | The Roof That Held Its Breath (`the-roof-that-held-its-breath`) | CONFIRMED DEFECT | CRA-F0336 (MEDIUM, CRA-C0011) — rope/shoring result appears before the Travel Rope method is selected. |
| 827 | Three Knots on the Platform (`three-knots-on-the-platform`) | CONFIRMED DEFECT | CRA-F0337 (MEDIUM, CRA-C0011) — clamp result and sinking-post discovery appear before the clamp choice. |
| 828 | The Wall Beneath the Plaster (`the-wall-beneath-the-plaster`) | CONFIRMED DEFECT | CRA-F0338 (MEDIUM, CRA-C0011) — trim-removal discovery appears before the Pocket Toolkit choice. |
| 829 | The Riverward Retaining Wall (`the-riverward-retaining-wall`) | CONFIRMED DEFECT | CRA-F0339 (MEDIUM, CRA-C0011) — sounding-rod ground result appears before the measurement choice. |

Construction/building (13), medical rescue/support (8), Gear condition (11), and registry (3) suites passed **35 tests across four files**. These tests support choice reachability, usable-Gear gates, route variants, partial/alternate outcomes, and persistence; they do not directly assert the chronology defects, which are witnessed in current source. No scenario source or gameplay tests changed.

The live checkpoint is now **829 reviewed / 32 remaining of 861**: **468 HEALTHY, 60 MINOR CONCERN, 301 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. Preserved history contains **339 findings**: **335 live** and four unregistered. Live severity totals are HIGH 14, MEDIUM 266, LOW 45, plus 10 unrecovered legacy values. Live cluster counts are CRA-C0001 222, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, C0010 11, and C0011 5 (329 clustered), with six unclustered. The first unreviewed live Adventure is position **830**, **The Barn Door That Wasn’t Square** (`the-barn-door-that-wasnt-square`), `src/scenarios/constructionBuildingStructuralWorkGenreBatch.ts`. Next finding ID: **CRA-F0340**; next available cluster ID: **CRA-C0012**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.

## Live-registry continuation (positions 830–839)

Completed ten route-level reviews of the construction/building structural-work builder. The stories cover a binding barn door, deteriorating schoolhouse support, split porch timber, moving inn landing, disputed shed ownership, bell-tower brace, hidden drain path, scaffold ladder, fire-damaged chimney tie, and grain-cart ramp. Across each, the specific measurement/tool result is embedded in the shared `work` scene before `measure` is selected. Consequently inspect and rush entrants are told the result without performing the action; applicable Gear requirements do not prevent the disclosure. These ten findings CRA-F0340–CRA-F0349 extend CRA-C0011. For each, closure, safe/alternate/partial outcomes, Knowledge/Lore variants, ownership or authority boundaries, reward conditions, and any load/person safety state were also reviewed.

| Position | Adventure | Classification | Finding |
| ---: | --- | --- | --- |
| 830 | The Barn Door That Wasn’t Square (`the-barn-door-that-wasnt-square`) | CONFIRMED DEFECT | CRA-F0340 (MEDIUM, CRA-C0011) — hinge/post measurement result precedes the Carpenter’s Square action. |
| 831 | The Wedge at the Schoolhouse (`the-wedge-at-the-schoolhouse`) | CONFIRMED DEFECT | CRA-F0341 (MEDIUM, CRA-C0011) — wedge and rot result precedes the Steel Wedge action. |
| 832 | The Last Board at Harper Yard (`the-last-board-at-harper-yard`) | CONFIRMED DEFECT | CRA-F0342 (MEDIUM, CRA-C0011) — auger/split result precedes the Hand Auger test. |
| 833 | The Joint That Opened in Winter (`the-joint-that-opened-in-winter`) | CONFIRMED DEFECT | CRA-F0343 (MEDIUM, CRA-C0011) — joint/landing comparison precedes the comparison action. |
| 834 | The Shed with Two Roofs (`the-shed-with-two-roofs`) | CONFIRMED DEFECT | CRA-F0344 (MEDIUM, CRA-C0011) — base/opening inspection result precedes external inspection. |
| 835 | The Brace Before the Bell (`the-brace-before-the-bell`) | CONFIRMED DEFECT | CRA-F0345 (MEDIUM, CRA-C0011) — plumb-line result precedes measurement. |
| 836 | The Stone That Kept the Water (`the-stone-that-kept-the-water`) | CONFIRMED DEFECT | CRA-F0346 (MEDIUM, CRA-C0011) — drain-channel direction precedes tracing with the lantern. |
| 837 | The Ladder in the West Yard (`the-ladder-in-the-west-yard`) | CONFIRMED DEFECT | CRA-F0347 (MEDIUM, CRA-C0011) — rope-secure/split-lashing result precedes the usable Travel Rope action. |
| 838 | The Chimney That Pulled Away (`the-chimney-that-pulled-away`) | CONFIRMED DEFECT | CRA-F0348 (MEDIUM, CRA-C0011) — protected board-removal result precedes the glove-gated method. |
| 839 | The Ramp for the Grain Cart (`the-ramp-for-the-grain-cart`) | CONFIRMED DEFECT | CRA-F0349 (MEDIUM, CRA-C0011) — support-foot comparison precedes setting aside load and comparing feet. |

The construction/building suite passed **13 tests**; Gear-condition and registry suites passed **14 tests** in the prior combined run. The existing tests establish choice reachability, usable-Gear restrictions, alternate/partial outcomes, and persistence, but do not assert the method-result chronology defect; the shared source directly establishes it. No gameplay source or tests changed.

The live checkpoint is now **839 reviewed / 22 remaining of 861**: **468 HEALTHY, 60 MINOR CONCERN, 311 CONFIRMED DEFECT, 0 NEEDS MANUAL REVIEW**. Preserved history contains **349 findings**: **345 live** and four unregistered. Live severity totals are HIGH 14, MEDIUM 276, LOW 45, plus 10 unrecovered legacy values. Live cluster counts are CRA-C0001 222, C0002 18, C0003 1, C0004 35, C0005 1, C0006 17, C0007 4, C0008 12, C0009 3, C0010 11, and C0011 15 (339 clustered), with six unclustered. The first unreviewed live Adventure is position **840**, **The Wedge at the Schoolhouse** (`the-wedge-at-the-schoolhouse`), `src/scenarios/constructionBuildingStructuralWorkGenreBatch.ts`. Next finding ID: **CRA-F0350**; next available cluster ID: **CRA-C0012**. No gameplay source or tests were changed; Weekly Scenario Batch remains paused.
