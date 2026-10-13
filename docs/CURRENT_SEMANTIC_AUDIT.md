# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint: registry positions 1–70 reviewed; 791 of 861 remain.
Next: position 71; next finding ID `CRA-F0020`.

## Current checkpoint

The canonical registry order is `SCENARIOS` in `src/scenarios/index.ts`. Positions 1–20 are carried forward from prior conversation review summaries; positions 21–70 were reviewed against current scenario source. Focused suites were run where existing relevant test files were available. No source or test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 48 |
| MINOR CONCERN | 4 |
| CONFIRMED DEFECT | 18 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed | 70 |

There are 19 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. Findings CRA-F0016–CRA-F0018 are HIGH, MEDIUM, MEDIUM respectively; CRA-F0019 is LOW. Batch 51–60 found no additional confirmed defects.

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

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** CRA-F0002, CRA-F0003, CRA-F0005, CRA-F0012–CRA-F0019.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. The After the Storm and Washout-focused suites passed: 11 tests across 3 files. Inventory and scenario-registry validation passed: 16 tests across 2 files, including the 861-Adventure registry assertion. The Honest Work shared-builder suite passed: 12 tests. Batch 51–60 suites (`honestWorkBatch.test.ts` and `commerceBatch.test.ts`) passed: 27 tests across 2 files. Batch 61–70 Commerce and Community suites (`commerceBatch.test.ts`, `communityBatch.test.ts`) passed: 29 tests across 2 files. These tests support, but do not substitute for, source route review. No gameplay repairs, test changes, deployment, or scheduler changes were made. Checkpoints are committed locally; remote fetch/push is unavailable in this environment. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.
