# RC12 Verification Status

Batch 3 — current-source verification only. Gameplay and gameplay tests are unchanged.

- Schema: `lgsw.rc12-verification.v1`
- Source main reviewed: `2d988d892be715d5e844cf64ab2a48368552570d`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Batch 3: **30/30 reviewed**; ambiguous: **0**; prior assignments rechecked: **0**.
- Assignment review: **106/144 (73.6%)**; unreviewed: **38**.
- Adventure review: **79 reconciled**, **7 open**, **38 with unreviewed assignments**; 86/124 have no unreviewed child assignment (**69.4%**).
- Assignment statuses: `VERIFIED_HEALTHY_REPAIRED` 98; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 0; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 8; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 38.

## Batch 3

Reviewed all 14 unreviewed HIGH assignments first. Eleven are verified healthy: The Bridge Goes Down, The Washout, High Water, all six canonical CON-02 construction stories, Ferry Beneath the Ferry, and The Antlered Thing. Three remain reproducible: The Ice Gives Warning (solo route inherits cart-crossing result), The Lantern in the Hedge (non-surrender routes inherit “poorer by the coins surrendered”), and The Silent Hound (withdrawal inherits “missing hand is found”).

The remaining 16 reviewed assignments were supported by focused current tests in the Deep Exploration, Frontier Discovery, October Affinity, Expedition Logistics, and Lost Places suites. The detailed per-assignment evidence is in the JSON checkpoint.

### Assignments reviewed

- `the-bridge-goes-down` — R125-054: VERIFIED_HEALTHY_REPAIRED
- `the-washout` — RO29-10: VERIFIED_HEALTHY_REPAIRED
- `high-water` — O01-035: VERIFIED_HEALTHY_REPAIRED
- `ferry-beneath-the-ferry` — R371-016: VERIFIED_HEALTHY_REPAIRED
- `the-antlered-thing` — R125-085: VERIFIED_HEALTHY_REPAIRED
- `the-ice-gives-warning` — R125-034: OPEN_REPRODUCIBLE
- `the-lantern-in-the-hedge` — R371-045: OPEN_REPRODUCIBLE
- `the-silent-hound` — R371-036: OPEN_REPRODUCIBLE
- `the-hall-with-the-mismatched-stone` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `the-lodge-wall-under-new-paint` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `the-old-well-house` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `the-ramp-for-the-grain-cart` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `the-school-bell-frame` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `the-theater-that-never-opened` — CON-02: VERIFIED_HEALTHY_REPAIRED
- `all-hallows-boarding-house` — R125-007: VERIFIED_HEALTHY_REPAIRED
- `deep-room-at-harker-mine` — R371-015: VERIFIED_HEALTHY_REPAIRED
- `door-beneath-the-road` — R371-013: VERIFIED_HEALTHY_REPAIRED
- `floorboard-that-was-replaced` — RF331-02: VERIFIED_HEALTHY_REPAIRED
- `forgotten-sluice` — RF331-03: VERIFIED_HEALTHY_REPAIRED
- `iron-orchard` — R371-012: VERIFIED_HEALTHY_REPAIRED
- `jack-o-lantern-contest` — R125-006: VERIFIED_HEALTHY_REPAIRED
- `lantern-vault` — R371-018: VERIFIED_HEALTHY_REPAIRED
- `last-door-briar-house` — R371-011: VERIFIED_HEALTHY_REPAIRED
- `the-cache-ledger` — R616-012: VERIFIED_HEALTHY_REPAIRED
- `the-canvas-over-the-crate` — R616-016: VERIFIED_HEALTHY_REPAIRED
- `the-empty-feed-sack` — R616-018: VERIFIED_HEALTHY_REPAIRED
- `the-paper-tube` — R616-017: VERIFIED_HEALTHY_REPAIRED
- `the-cave-with-worked-stone` — R125-070: VERIFIED_HEALTHY_REPAIRED
- `the-lost-payroll` — R125-071: VERIFIED_HEALTHY_REPAIRED
- `the-missing-assayer` — F351-003: VERIFIED_HEALTHY_REPAIRED

## Current open reproducible assignments

- **bridge-out / O01-020 (MEDIUM)** — Non-rope hand-crossing still converges on rope-used/frayed wording.
- **bridge-out / O01-021 (MEDIUM)** — Failed repair worsens the bridge, but shared text says it was not made more dangerous.
- **the-last-room / O01-012 (MEDIUM)** — Learned truth is followed by shared wording that the account remains unknown.
- **the-long-way-home / O01-024 (MEDIUM)** — Shared closure asserts doctor/warden events not established on every route.
- **the-road-below / O01-044 (MEDIUM)** — Failure-position statements conflict at the shared result.
- **the-ice-gives-warning / R125-034 (HIGH)** — Solo crossing receives the cart’s gravel-bar/handline arrival claim.
- **the-lantern-in-the-hedge / R371-045 (HIGH)** — Call-house/hold-gate routes inherit the purse-surrender result.
- **the-silent-hound / R371-036 (HIGH)** — Search withdrawal inherits a found-person settlement.

No open ambiguous assignments.

## Next verification priority

No unreviewed HIGH assignments remain. Review the next 25–35 unreviewed assignments, favoring same-mechanism groups with direct regression coverage, then isolated MEDIUM findings. Continue treating the eight open assignments as verification findings only; implementation is outside this program.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

Review completion is not repair completion. No gameplay or gameplay-test changes were made, no Pages deployment occurred, and Weekly Scenario Batch remains paused.
