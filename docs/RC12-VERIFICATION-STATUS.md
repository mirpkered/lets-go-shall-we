# RC12 Verification Status

Batch 4 — current-source verification only. Gameplay and gameplay tests are unchanged.

- Schema: `lgsw.rc12-verification.v1`
- Source main reviewed: `fe943130a570b33c57e632a91021781d3373311e`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Batch 4: **30/30 reviewed**; ambiguous: **0**; prior assignments rechecked: **0**.
- Assignment review: **136/144 (94.4%)**; unreviewed: **8**.
- Adventure review: **92 reconciled**, **24 open**, **8 with unreviewed assignments**; 116/124 have no unreviewed child assignment (**93.5%**).
- Assignment statuses: `VERIFIED_HEALTHY_REPAIRED` 109; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 2; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 25; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 8.

## Batch 4 reviewed

Regression-backed healthy:
- `the-old-survey-stone` — R125-067
- `the-sealed-mine-office` — R125-068
- `the-riverboat-cache` — R125-073
- `the-halloween-dare` — R125-008
- `the-headless-rider` — R125-013
- `the-goat-wouldnt-stay-dead` — R125-081
- `the-man-eater-of-millers-gap` — R125-087
- `toymakers-last-order` — R125-043
- `the-millwheel-hand` — P08
- `the-last-ferry` — RO29-05
- `the-outlaws-mother` — R125-064

Source-traced healthy:
- `the-millers-beast` — R125-080: current convergence no longer states the wheel stopped; injury variants preserve whether the belt or badger caused harm.
- `the-frightened-team` — P32: current endings distinguish leaving the team from a later settled walk; the inspected opt-out claim no longer appears.

Still reproducible:
- `the-clamp-beneath-the-press` — R616-022: wedge route says clamp holds.
- `the-needle-at-the-north-station` — R616-023: no-rider route inherits rider delivery.
- `the-mineshaft-lamp` — R371-059: lower lamp/light disposition is asserted without proof.
- `the-silted-toolbox` — R371-060: limited recovery claims private chest returned.
- `the-man-who-sheds-his-skin` — R125-083: return-coat route inherits twin-brother discovery.
- `dead-mans-hand` — O01-017: shot/tackle outcomes converge without preserving the actual event.
- `the-broken-rail-at-crow-field` — R616-034: pens-only route claims a brace was set.
- `the-irrigation-stone-at-south-field` — R616-030: wait route leaves divider open but ending says closed.
- `the-burning-loft` — O15-024: rope failure without fetched ladder enters ladder-failure text about a ladder.
- `one-horse-short` — RO29-03: full-load slow route says cargo remains behind.
- `the-whistle-and-the-wind` — R371-005: lark route inherits kettle-performance text.
- `the-last-survey` — R371-025: current-only route says both map lines were recorded.
- `the-last-at-the-cobbler` — R371-050: replacement-upper route says patch accepted.
- `the-last-clean-apron` — R371-004: cook-on-time route can inherit late-supper closure.
- `the-public-apology` — R371-003: naming the source is followed by “without naming its source.”
- `silent-night` — RO29-18: non-property arguments inherit satchel disposition.
- `under-the-ice` — O15-026: successful rope catch followed by failed haul is retold as a missed first throw.

## Current open reproducible queue

Previously open and retained:
- `the-last-room` — O01-012
- `bridge-out` — O01-020, O01-021
- `the-long-way-home` — O01-024
- `the-road-below` — O01-044
- `the-ice-gives-warning` — R125-034
- `the-lantern-in-the-hedge` — R371-045
- `the-silent-hound` — R371-036

Newly verified in Batch 4:
- `the-clamp-beneath-the-press` — R616-022
- `the-needle-at-the-north-station` — R616-023
- `the-mineshaft-lamp` — R371-059
- `the-silted-toolbox` — R371-060
- `the-man-who-sheds-his-skin` — R125-083
- `dead-mans-hand` — O01-017
- `the-broken-rail-at-crow-field` — R616-034
- `the-irrigation-stone-at-south-field` — R616-030
- `the-burning-loft` — O15-024
- `one-horse-short` — RO29-03
- `the-whistle-and-the-wind` — R371-005
- `the-last-survey` — R371-025
- `the-last-at-the-cobbler` — R371-050
- `the-last-clean-apron` — R371-004
- `the-public-apology` — R371-003
- `silent-night` — RO29-18
- `under-the-ice` — O15-026

No open ambiguous assignments.

## Batch 5 queue

Review all eight remaining single-finding assignments:
- `a-gun-on-the-table` — R125-063 (MEDIUM)
- `give-me-whatcha-got` — RO29-22 (MEDIUM)
- `only-one-bullet` — RO29-15 (MEDIUM)
- `the-markers-stop` — R125-032 (MEDIUM)
- `the-quartermasters-tally` — R371-024 (MEDIUM)
- `the-wheel-of-the-return-wagon` — R616-020 (MEDIUM)
- `the-winds-other-side` — R616-003 (MEDIUM)
- `three-points-down` — R371-035 (MEDIUM)

Review all eight, then derive completion and the implementation queue. Preserve all 25 reproducible openings; do not repair them in the verification program.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

No gameplay source or gameplay tests changed. No Pages deployment occurred. Weekly Scenario Batch remains paused.
