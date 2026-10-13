# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint: registry positions 1–160 reviewed; 701 of 861 remain.
Next: position 161; next finding ID `CRA-F0038`.

## Current checkpoint

The canonical registry order is `SCENARIOS` in `src/scenarios/index.ts`. Positions 1–20 are carried forward from prior conversation review summaries; positions 21–110 were reviewed against current scenario source. Focused suites were run where existing relevant test files were available. No source or test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 115 |
| MINOR CONCERN | 9 |
| CONFIRMED DEFECT | 36 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed | 160 |

There are 37 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. Findings CRA-F0016–CRA-F0018 are HIGH, MEDIUM, MEDIUM respectively; CRA-F0019, CRA-F0023–CRA-F0026, CRA-F0028–CRA-F0032, CRA-F0034–CRA-F0036 are LOW; CRA-F0027, CRA-F0033, and CRA-F0037 are MEDIUM. Batch 51–60 found no additional confirmed defects.

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

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** CRA-F0002, CRA-F0003, CRA-F0005, CRA-F0012–CRA-F0019, CRA-F0022, CRA-F0028–CRA-F0029, CRA-F0032–CRA-F0033, CRA-F0035–CRA-F0037.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004, CRA-F0031, CRA-F0034.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.
- **CRA-C0004 — Gear ownership treated as Gear usability:** CRA-F0020, CRA-F0021, CRA-F0023–CRA-F0027, CRA-F0030.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. The After the Storm and Washout-focused suites passed: 11 tests across 3 files. Inventory and scenario-registry validation passed: 16 tests across 2 files, including the 861-Adventure registry assertion. The Honest Work shared-builder suite passed: 12 tests. Batch 51–60 suites (`honestWorkBatch.test.ts` and `commerceBatch.test.ts`) passed: 27 tests across 2 files. Batch 61–70 Commerce and Community suites passed: 29 tests across 2 files. Batch 71–80 Community/Wilderness plus Gear-condition suites passed: 37 tests across 3 files. Batch 81–90 Wilderness, Animals, and Gear-condition suites passed: 35 tests across 3 files. Batch 91–100 animal and pleasant-day suites passed: 19 tests across 2 files. Batch 101–110 pleasant-day and dispute suites passed: 15 tests across 2 files. Batch 111–120 Disputes and Strange Roads suites passed: 23 tests across 2 files. Batch 121–130 second-wave, registry, and diversity suites passed: 20 tests across 3 files. Batch 131–140 second-wave, domestic payoff, and content-depth suites passed: 16 tests across 3 files. These tests support, but do not substitute for, source route review. No gameplay repairs, test changes, deployment, or scheduler changes were made. Checkpoints are committed locally; remote fetch/push is unavailable in this environment. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.

Batch 141–150 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, and `riverWaterWorkGenreBatch.test.ts`) passed: 24 tests across 3 files. These graph/reachability and related content checks support, but do not replace the route-level source review.

Batch 151–160 supporting suites (`secondWaveBatch.test.ts`, `contentDepth.test.ts`, `compensationAccountingC2.test.ts`, and `qaContentCorrections.test.ts`) passed: 36 tests across 4 files. No gameplay source or tests were changed.
