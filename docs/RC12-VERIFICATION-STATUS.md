# RC12 Verification Status

Checkpoint batch 2 — current-source verification only; gameplay is unchanged.

- Schema: `lgsw.rc12-verification.v1`
- Current main reviewed: `0a700af2cc71ea27e82e3b8a318b4b091425ad48`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Batch 2: **30/30 reviewed**; ambiguous: **0**; prior assignments rechecked: **0**.
- Cumulative assignment review: **76/144 (52.8%)**; unreviewed: **68**.
- Adventure review: **52 reconciled**, **4 open**, **68 with unreviewed assignments** (45.2% reviewed).
- Assignment statuses: `VERIFIED_HEALTHY_REPAIRED` 71; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 0; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 5; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 68.

## Batch 2

Reviewed all 16 remaining `COU-01` assignments; the current Courier regression iterates every registered courier story and distinguishes completed handoff from refusal/delay. Also reviewed 14 single-finding cases in the Occult Investigation, Christmas Affinity, Competition Gear, and Gear Corrective families using focused tests for the exact audited route distinction.

### Assignments reviewed this batch

- `bell-before-the-wire` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `blue-chalk-milepost` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `blue-room-dispatch` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `copy-that-came-back` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `copyists-pencil` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `flooded-relay-book` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `horse-change-ledger` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `initials-on-the-wire` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `last-station-keepers-route` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `morning-the-warning-arrived` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `paper-boat-at-high-water` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `postal-road-after-the-flood` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `rain-on-the-relay` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `station-mark-in-margin` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `station-without-a-clock` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `the-wire-that-sang-twice` — COU-01: VERIFIED_HEALTHY_REPAIRED
- `below-the-old-fort` — R125-025: VERIFIED_HEALTHY_REPAIRED
- `book-without-a-title` — R125-020: VERIFIED_HEALTHY_REPAIRED
- `christmas-tree-millers-hill` — R125-040: VERIFIED_HEALTHY_REPAIRED
- `house-with-warm-window` — R125-049: VERIFIED_HEALTHY_REPAIRED
- `red-chalk-circle` — R125-016: VERIFIED_HEALTHY_REPAIRED
- `the-bell-rope-at-ferry-end` — P10: VERIFIED_HEALTHY_REPAIRED
- `the-christmas-goose` — R125-038: VERIFIED_HEALTHY_REPAIRED
- `the-christmas-visitor` — R125-046: VERIFIED_HEALTHY_REPAIRED
- `the-empty-coffin` — R125-021: VERIFIED_HEALTHY_REPAIRED
- `the-fair-weather-reading` — P17: VERIFIED_HEALTHY_REPAIRED
- `the-man-who-came-back-wrong` — R125-022: VERIFIED_HEALTHY_REPAIRED
- `the-pageant-problem` — R125-044: VERIFIED_HEALTHY_REPAIRED
- `the-squires-pack` — R371-023: VERIFIED_HEALTHY_REPAIRED
- `the-third-knock` — R125-023: VERIFIED_HEALTHY_REPAIRED

### Open reproducible assignments

- **bridge-out / O01-020 (MEDIUM)** — A non-rope hand-crossing route converges on text claiming a rope was used and frayed; current tests do not assert the hand-crossing ending.
- **bridge-out / O01-021 (MEDIUM)** — The failed-repair route worsens the bridge, then shares text saying it was not made more dangerous.
- **the-last-room / O01-012 (MEDIUM)** — Current source retains the contradiction: leaving after confession records identifiedSilas/learned truth, but shared text says the account’s truth remains unknown. The current tests do not cover this specific contrast.
- **the-long-way-home / O01-024 (MEDIUM)** — Current shared ending still states a doctor visit and warden record despite route variants that do not establish those same events; no test directly contrasts both handover routes.
- **the-road-below / O01-044 (MEDIUM)** — The failure result says the Traveler pulls clear before the edge slumps, but entrySlip narrates being struck as the bank slumps behind them; the same result does not preserve the stated position.

### Open ambiguous assignments

None.

### Next batch priority

Continue with the next 25–35 unreviewed single-finding assignments, prioritizing remaining high-severity cases with exact current regression coverage, then group medium findings by shared mechanism. The JSON ledger remains the authoritative queue.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

Review completion is not repair completion. The five open assignments remain reserved for a separately authorized implementation pass. Gameplay source and gameplay tests were not changed; no Pages deployment occurred; Weekly Scenario Batch remains paused.
