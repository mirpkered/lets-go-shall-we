# Current-Library Semantic Audit

Status: **IN PROGRESS**
Source snapshot: `cba101f0feba09c67543f942331ca38f765ebe14`
Checkpoint: registry positions 1–30 reviewed; 831 of 861 remain.
Next: position 31, *The Empty Cabin*; next finding ID `CRA-F0016`.

## Current checkpoint

The canonical registry order is `SCENARIOS` in `src/scenarios/index.ts`. Positions 1–20 are carried forward from prior conversation review summaries; positions 21–30 were reviewed against current scenario source, with targeted tests run for positions 21–23. No source or test files were changed.

| Classification | Adventures |
| --- | ---: |
| HEALTHY | 15 |
| MINOR CONCERN | 1 |
| CONFIRMED DEFECT | 14 |
| NEEDS MANUAL REVIEW | 0 |
| Total reviewed | 30 |

There are 15 finding records so far. Severity metadata for findings CRA-F0001–CRA-F0010 is unavailable in the conversation carry-forward, so the ledger leaves it null rather than guessing. The detailed route witnesses for those ten findings are likewise explicitly marked as unrecovered. The two new findings in this batch are MEDIUM.

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

The Borrowed Horse concern is deliberately not counted as confirmed: the “walk to the farm and bring help back” choice transitions directly to a stable ending that says the mare is returned. The omitted physical handling is compressed, but the choice can reasonably imply the help-assisted return; current evidence does not establish a contradiction firmly enough to register a finding.

## Finding clusters

- **CRA-C0001 — Route-specific state lost at convergence:** CRA-F0002, CRA-F0003, CRA-F0005, CRA-F0012, CRA-F0013, CRA-F0014, CRA-F0015.
- **CRA-C0002 — Knowledge/History without route proof:** CRA-F0001, CRA-F0004.
- **CRA-C0003 — Elapsed-time proxy used as event proof:** CRA-F0011.

The detailed findings, witnesses, source provenance, and carry-forward limitations are in [current-semantic-audit-ledger.json](current-semantic-audit-ledger.json).

## Validation and process notes

The focused existing suites for The Man in the Ditch, The Burning Loft, and Under the Ice passed: 56 tests across 3 files. These tests support, but do not substitute for, the source route review. No gameplay repairs, test changes, deployment, scheduler changes, commit, or push have been made as part of this checkpoint yet. Weekly Scenario Batch remains paused.

The persistent ledger did not exist in this checkout before this run. The carry-forward limitation above is preserved so later batches can resume without pretending that chat-only prior evidence was re-examined or fully recovered. Future batches should append in registry order and retain this qualification unless the missing detail is recoverable from the original audit conversation/artifact.
