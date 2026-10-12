# RC12 Verification Status

Checkpoint batch 1 — current-source verification only; gameplay is unchanged.

- Schema: `lgsw.rc12-verification.v1`
- Baseline and reviewed main: `14ad5e08aeed7745845a78cb7043f39347fdbd77`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Assignments reviewed: **46/144 (31.9%)**; unreviewed: **98**.
- Adventures: **22 reconciled**, **4 open**, **98 with unreviewed assignments**.
- Assignment statuses: `UNREVIEWED` 98; `VERIFIED_HEALTHY_REPAIRED` 41; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 0; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 5; `OPEN_AMBIGUOUS` 0.

## Batch 1

Seeded 16 courier assignments from direct current test coverage, then reviewed 30 additional assignments: all 22 assignments in the ten non-courier multi-finding Adventures, plus eight single-finding Adventures with targeted route/source evidence. All 18 multi-finding Adventures are now fully reviewed. No earlier checkpoint assignments required recheck.

### Open reproducible assignments

- **bridge-out / O01-020 (MEDIUM)** — A non-rope hand-crossing route converges on text claiming a rope was used and frayed; current tests do not assert the hand-crossing ending.\n- **bridge-out / O01-021 (MEDIUM)** — The failed-repair route worsens the bridge, then shares text saying it was not made more dangerous.\n- **the-last-room / O01-012 (MEDIUM)** — Current source retains the contradiction: leaving after confession records identifiedSilas/learned truth, but shared text says the account’s truth remains unknown. The current tests do not cover this specific contrast.\n- **the-long-way-home / O01-024 (MEDIUM)** — Current shared ending still states a doctor visit and warden record despite route variants that do not establish those same events; no test directly contrasts both handover routes.\n- **the-road-below / O01-044 (MEDIUM)** — The failure result says the Traveler pulls clear before the edge slumps, but entrySlip narrates being struck as the bank slumps behind them; the same result does not preserve the stated position.

### Remaining multi-finding Adventures with unreviewed assignments

None. All 18 have every confirmed assignment classified.

### Next batch

Continue with approximately 30 unreviewed single-finding assignments, prioritizing direct regression coverage and shared mechanisms. The JSON ledger is the authoritative source for the unreviewed queue; the four F24 noncanonical items below remain excluded.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

This is review progress, not repair completion. Five assignments remain open and must be handled in a later, separately authorized repair pass.
