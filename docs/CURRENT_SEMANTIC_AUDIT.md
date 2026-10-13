# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint: registry positions 1–40 reviewed; 821 of 861 remain.
Next: position 41, *The Blue Hole*; next finding ID `CRA-F0018`.

## Current checkpoint

The canonical registry order is `SCENARIOS` in `src/scenarios/index.ts`. Positions 1–20 are carried forward from prior conversation review summaries; positions 21–40 were reviewed against current scenario source. Focused suites were run where existing relevant test files were available. No source or test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 21 |
| MINOR CONCERN | 3 |
| CONFIRMED DEFECT | 16 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed | 30 |

There are 17 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. Findings added in this execution are MEDIUM.

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
| 32 | The Missing Boat | CONFIRMED DEFECT | CRA-F0016 — self-guided rescues converge on text claiming the ferry crew checks the line. |
| 33 | After the Storm | HEALTHY | — |
| 34 | The Last Ferry | MINOR CONCERN | — |
| 35 | The Fallen Tree | HEALTHY | — |
| 36 | The Loose Team | HEALTHY | — |
| 37 | The Washout | HEALTHY | — |
| 38 | Poison the Well | CONFIRMED DEFECT | CRA-F0017 — wrong-source variants claim the well was closed after only the barrel was set aside. |
| 39 | Finders Keepers | HEALTHY | — |
| 40 | Only One Bullet | HEALTHY | — |

The timing concern in One Horse Short is not counted as a defect because the scene transition may abstract the travel time. In The Last Ferry, the far-bank travelers’ farmhouse location is under-described on the direct overnight route, but the initial setup does not rule out their already being there. In The Washout, “let team work” follows an explicit statement that the cart needs separate recovery and reasonably delegates that work; the route is not counted as a defect.

The Borrowed Horse concern is deliberately not counted as confirmed: the “walk to the farm and bring help back” choice transitions directly to a stable ending that says the mare is returned. The omitted physical handling is compressed, but the choice can reasonably imply the help-assisted return; current evidence does not establish a contradiction firmly enough to register a finding.

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** CRA-F0002, CRA-F0003, CRA-F0005, CRA-F0012–CRA-F0017.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. The After the Storm and Washout-focused suites passed: 11 tests across 3 files. Inventory and scenario-registry validation passed: 16 tests across 2 files, including the 861-Adventure registry assertion. These tests support, but do not substitute for, source route review. No gameplay repairs, test changes, deployment, or scheduler changes were made. The first checkpoint was committed locally; remote fetch/push is unavailable in this environment. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.
