# RC12 Verification Status

## Verification complete — Batch 5

Current-source verification remains complete. Pass I1 implements a bounded subset of the verified queue; it does not reopen historical verification or alter the canonical matrix.

- Schema: `lgsw.rc12-verification.v1`
- Source main reviewed: `c314b7561ada076832f1c5d99d49e1a976b00c40`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Batch 5: **8/8 reviewed**; ambiguous: **0**; assignments left unreviewed: **0**.
- Assignment status: `VERIFIED_HEALTHY_REPAIRED` 111; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 2; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 31; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 0.
- Adventure status (derived from child assignments): **94 reconciled**, **30 open**, **0 unreviewed**; total **124**.
- Review completion: **144/144 assignments (100%)** and **124/124 Adventures (100%)**. Review completion is not repair completion.
- All eight Batch 5 findings are MEDIUM. Two are now verified healthy; six remain reproducible.

## Implementation Pass I1

- Baseline: `036e1212adbe191089d6985a1fec9d252b8872d4`; branch: `codex/rc12-implementation-i1-20261012`.
- Repaired and regression-covered **21 assignments across 20 Adventures**. No new finding or Adventure was added.
- Ledger totals now: `VERIFIED_HEALTHY_REPAIRED` 132; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 2; `OPEN_REPRODUCIBLE` 10; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 0.
- Derived Adventure totals: **114 reconciled**, **10 open**, **0 unreviewed** (124 total).
- The HIGH `the-ice-gives-warning` finding was repaired using a run-local route-proof flag with a neutral no-proof fallback. Multi-finding `bridge-out` received both open RC12 repairs.
- Cross-cluster findings were not implemented. All non-RC12 boundary findings remain in their owning clusters.

### I1 repaired assignments

`bridge-out` — O01-020, O01-021; `the-ice-gives-warning` — R125-034; `a-gun-on-the-table` — R125-063; `only-one-bullet` — RO29-15; `one-horse-short` — RO29-03; `the-broken-rail-at-crow-field` — R616-034; `the-clamp-beneath-the-press` — R616-022; `the-irrigation-stone-at-south-field` — R616-030; `the-last-at-the-cobbler` — R371-050; `the-last-clean-apron` — R371-004; `the-last-room` — O01-012; `the-last-survey` — R371-025; `the-man-who-sheds-his-skin` — R125-083; `the-markers-stop` — R125-032; `the-needle-at-the-north-station` — R616-023; `the-public-apology` — R371-003; `the-quartermasters-tally` — R371-024; `the-whistle-and-the-wind` — R371-005; `the-winds-other-side` — R616-003; `silent-night` — RO29-18.

### Pass I1 deferred queue (superseded by I2-DEEP)

| Adventure | Finding / severity | Current verified contradiction | I1 disposition |
|---|---|---|---|
| `dead-mans-hand` | O01-017 / MEDIUM | Failed tackle route inherits gunshot/leg-wound aftermath | Deferred: RC14 event chronology and RC15 location/outcome are coupled; needs route-specific result split and tests. |
| `the-burning-loft` | O15-024 / MEDIUM | Rope failure narrates a ladder that was not fetched | Deferred: shared failure endpoint also carries RC11 rescue consequences; isolate narration without altering rescue/risk behavior. |
| `the-lantern-in-the-hedge` | R371-045 / HIGH | Withdrawal/call-house ending claims a purse was surrendered | Deferred: RC02 payment accounting is attached; RC12 text split is possible but should be designed with payment boundary tests. |
| `the-long-way-home` | O01-024 / MEDIUM | Handover ending promises future care/warden record despite route-specific ongoing treatment | Deferred: multiple attached RC14/RC07/RC09/RC05 findings and a shared handover builder make an isolated repair unsafe in I1. |
| `the-road-below` | O01-044 / MEDIUM | Failed outside bracing becomes an inside fall | Deferred: route/location state overlaps RC15/RC14/RC09/RC02; likely needs a route-specific result transition, not text-only masking. |
| `the-silent-hound` | R371-036 / HIGH | Search withdrawal concludes missing person was found | Deferred: RC02 reward/gear settlement and shared support builder are coupled to outcome narration. |
| `the-mineshaft-lamp` | R371-059 / MEDIUM | Fee ending confirms a lower lamp that remains uncertain | Deferred: attached RC02 payment/accounting concerns; use a neutral unresolved-lower-light route result. |
| `the-silted-toolbox` | R371-060 / MEDIUM | Limited recovery fee claims a private chest was returned | Deferred: attached RC02 ownership/payment boundary; separate recovery and fee result before text change. |
| `three-points-down` | R371-035 / MEDIUM | Recovered tin is described as still below in generated follow-up | Deferred: shared helper affects an attached RC02 finding; update route-aware follow-up in a dedicated test wave. |
| `under-the-ice` | O15-026 / LOW | Successful rope catch followed by failed haul is retold as a missed throw | Deferred: attached RC14 chronology; split catch-success from haul-failure state without broad rescue changes. |

I1 used existing route state except three narrow run-local proof flags (`returnedCoachCoat`, `cartAndTravelerAcross`, and `ownMarkerPlaced` for route-specific marker thanks). Missing proof uses neutral text; no persistent save schema, gear, stable Knowledge, or History was added. The selected fixed/shared endings received focused regression coverage in their family suites and `src/scenarios/rc12I1Regression.test.ts`.

## Batch 5 dispositions (verification snapshot)

- `a-gun-on-the-table` — R125-063, MEDIUM — **OPEN_REPRODUCIBLE**. `room.grabGun` goes directly to `weaponSafe`; that scene states the book’s eight-coin payment and four-coin balance although this route never reads the book.
- `give-me-whatcha-got` — RO29-22, MEDIUM — **VERIFIED_HEALTHY_REPAIRED**. Refusal sets `refusedSearchShot`, and `shotPlayer` has truthful refusal-specific text distinct from the `rushedArmedRobber` text. Inspected `giveMeWhatchaGot.ts`; the injury route remains accurately described.
- `only-one-bullet` — RO29-15, MEDIUM — **OPEN_REPRODUCIBLE**. `stayWithPerson` reaches an ending that introduces a neighbor without requesting help; `askGroundAgain` failure while the Traveler stays present reaches an ending saying they were away. Inspected `onlyOneBullet.ts` and `groundedConsequenceBatch.test.ts`.
- `the-markers-stop` — R125-032, MEDIUM — **OPEN_REPRODUCIBLE**. `followMarkerStones` reaches `markerWest`, which thanks the Traveler for leaving a sign despite no marker action. Inspected `survivalExpeditionBatch.ts` and its existing route test.
- `the-quartermasters-tally` — R371-024, MEDIUM — **OPEN_REPRODUCIBLE**. Securing tools means flour shifts, but `leftLoad` unconditionally says the shifted chest is secured. Inspected `gearCorrectiveBatch.ts` and its tests.
- `the-wheel-of-the-return-wagon` — R616-020, MEDIUM — **VERIFIED_HEALTHY_REPAIRED**. `return_pump_prioritised` selects text that says the pump is hand-carried first; current regression asserts the “delivered later” claim is absent, including a neutral legacy fallback. Inspected `expeditionLogisticsGenreBatch.ts` and its test.
- `the-winds-other-side` — R616-003, MEDIUM — **OPEN_REPRODUCIBLE**. Brush-bench route reaches `partial`, which claims sparks spread although sparks are only established by the stone-lee route. R616-004 is separate RC13 scope and remains untouched.
- `three-points-down` — R371-035, MEDIUM — **OPEN_REPRODUCIBLE**. The line response says the tin comes up, then generated follow-up says it remains visible below and offers choices that leave it. R371-033 is separate RC02 scope and remains untouched.

## Pre-I1 verified-open queue (historical snapshot; superseded by I1 cleanup queue above)

Each row identifies a current route-state contradiction. “Other cluster” is a boundary warning, not permission to implement that cluster.

| Adventure | Finding / severity | Source | Audit witness → current contradiction | Other cluster |
|---|---|---|---|---|
| `a-gun-on-the-table` | R125-063 / MEDIUM | `westernOutlawBatch.ts` | `room.grabGun` → `weaponSafe`; unread book contents are stated | — |
| `bridge-out` | O01-020 / MEDIUM | `bridgeOut.ts` | hand/strap crossing → `ropeSuccess`; claims a frayed rope despite no usable rope | RC11 O01-019 |
| `bridge-out` | O01-021 / MEDIUM | `bridgeOut.ts` | failed brace → leave-after-repair → turn-back; says danger was not worsened although support shifted | RC11 O01-019 |
| `dead-mans-hand` | O01-017 / MEDIUM | `deadMansHand.ts` | failed tackle → `gunshotAftermath`; invents a gunshot and leg wound on a tackle-only failure | RC14 O01-015; RC15 O01-016 |
| `one-horse-short` | RO29-03 / MEDIUM | `oneHorseShort.ts` | full-load slow-walk → `lateMill`; says some cargo remains behind | — |
| `only-one-bullet` | RO29-15 / MEDIUM | `onlyOneBullet.ts` | stay-with-person / present failure → shared endings; invents neighbor and Traveler absence | — |
| `silent-night` | RO29-18 / MEDIUM | `silentNight.ts` | drunken/threat calm routes → `argumentCools`; inserts satchel disposition from property route | RC14 RO29-19 |
| `the-broken-rail-at-crow-field` | R616-034 / MEDIUM | `agricultureRanchAnimalWorkGenreBatch.ts` | pens-only route → `partial`; claims rail was braced and pays for bracing | RC03 R616-032 |
| `the-burning-loft` | O15-024 / MEDIUM | `burningLoft.ts` | rope failure without fetching ladder → `ladderFailure`; narrates ladder rescue failure | RC11 O15-025 |
| `the-clamp-beneath-the-press` | R616-022 / MEDIUM | `equipmentTestingGenreBatch.ts` | wedge route → `proof`; says clamp holds | — |
| `the-ice-gives-warning` | R125-034 / HIGH | `survivalExpeditionBatch.ts` | solo crossing → `iceFarBank`; implies cart rescue/rope and disaster prevention | RC09 R125-033 |
| `the-irrigation-stone-at-south-field` | R616-030 / MEDIUM | `agricultureRanchAnimalWorkGenreBatch.ts` | wait route → `partial`; says displaced divider stayed closed | RC03 R616-028 |
| `the-lantern-in-the-hedge` | R371-045 / HIGH | `roadDangerGenreBatch.ts` | withdrawal/leave-purse routes → endings; claims purse surrendered without loss effect | RC02 R371-044 |
| `the-last-at-the-cobbler` | R371-050 / MEDIUM | `tradesApprenticeshipGenreBatch.ts` | replacement-upper route → settlement; says patch was accepted | — |
| `the-last-clean-apron` | R371-004 / MEDIUM | `surpriseSocialBatch.ts` | on-time cook route → thanks; says supper was delayed | — |
| `the-last-room` | O01-012 / MEDIUM | `theLastRoom.ts` | leave after confession → walk-away ending; erases confession already heard | RC07 O01-013; RC05 O01-014 |
| `the-last-survey` | R371-025 / MEDIUM | `gearCorrectiveBatch.ts` | current-route-only → wage ending; says both old and new lines were recorded | — |
| `the-long-way-home` | O01-024 / MEDIUM | `longWayHome.ts` | clinic/trail handover → shared ending; substitutes future promise for treatment underway and invents uncontacted warden record | RC14 O01-023; RC07 O01-025; RC09 O01-026; RC05 O01-027 |
| `the-man-who-sheds-his-skin` | R125-083 / MEDIUM | `monsterHuntSecond.ts` | return-coat without tailor → identity ending; asserts twin-brother discovery | — |
| `the-markers-stop` | R125-032 / MEDIUM | `survivalExpeditionBatch.ts` | follow stones west → `markerWest`; thanks Traveler for a sign never placed | — |
| `the-mineshaft-lamp` | R371-059 / MEDIUM | `salvageRecoveryGenreBatch.ts` | take-fee → paid; treats both lamps as identified although lower light may be reflection | RC02 R371-054 |
| `the-needle-at-the-north-station` | R616-023 / MEDIUM | `equipmentTestingGenreBatch.ts` | reopen contact route → paid; says message traveled by rider when no rider was sent | — |
| `the-public-apology` | R371-003 / MEDIUM | `surpriseSocialBatch.ts` | name source then withdraw → apology; says source was not named | — |
| `the-quartermasters-tally` | R371-024 / MEDIUM | `gearCorrectiveBatch.ts` | tools secured, flour shifts → `leftLoad`; identifies chest as shifted load | — |
| `the-road-below` | O01-044 / MEDIUM | `theRoadBelow.ts` | brace failure outside → `entrySlip`; turns safe withdrawal into a fall below | RC15 O01-045; RC14 O01-046; RC09 O01-047; RC02 O01-048 |
| `the-silent-hound` | R371-036 / HIGH | `adventurerSupportGenreBatch.ts` | withdraw/search-later → gear ending; says missing hand was found and dog watered | RC02 R371-033 |
| `the-silted-toolbox` | R371-060 / MEDIUM | `salvageRecoveryGenreBatch.ts` | authorized box recovery → paid; claims private chest returned | RC02 R371-054 |
| `the-whistle-and-the-wind` | R371-005 / MEDIUM | `surpriseCompetitionBatch.ts` | lark route → round; retells it as kettle imitation | — |
| `the-winds-other-side` | R616-003 / MEDIUM | `wildernessFieldcraftGenreBatch.ts` | brush bench → `partial`; imports sparks from the separate stone-lee route | RC13 R616-004 |
| `three-points-down` | R371-035 / MEDIUM | `adventurerSupportGenreBatch.ts` | recovered tin → generated follow-up; changes recovered tin back to left below | RC02 R371-033 |
| `under-the-ice` | O15-026 / LOW | `underTheIce.ts` | successful rope catch, failed haul → `ropeMiss`; rewrites it as a missed first throw | RC14 O15-027 |

Queue totals: **31 open assignments across 30 Adventures**; severity **3 HIGH, 27 MEDIUM, 1 LOW**. There are **4 multi-finding open Adventures**: `bridge-out` (O01-020, O01-021), `the-last-room` (O01-012 plus its healthy sibling), `the-long-way-home` (O01-024 plus its healthy sibling), and `the-road-below` (O01-044 plus its healthy sibling). Eighteen open assignments have attached cross-cluster findings; keep those root causes out of the RC12 repair scope unless independently authorized.

## Suggested implementation waves

- **Wave A — multi-finding Adventures:** `bridge-out` (both open findings), `the-last-room`, `the-long-way-home`, `the-road-below`. Preserve already healthy sibling findings.
- **Wave B — shared convergence mechanisms:** group only after confirming the same mechanism. Candidate families include stale route/method claims (`the-clamp-beneath-the-press`, `the-whistle-and-the-wind`, `the-broken-rail-at-crow-field`); object/person state reversals (`three-points-down`, `the-silted-toolbox`, `the-mineshaft-lamp`, `the-lantern-in-the-hedge`); and outcome/location convergence (`the-burning-loft`, `the-ice-gives-warning`, `under-the-ice`, `dead-mans-hand`).
- **Wave C — isolated reproducible cases:** remaining rows in the open queue, including the six newly confirmed Batch 5 defects.
- **Wave D — ambiguous cases:** none currently.
- **Wave E — cross-cluster-sensitive review:** independently validate RC12 scope for assignments with RC02/03/05/07/09/11/13/14/15 attachments; do not absorb those fixes.

The pre-I1 recommendation above is retained as verification history only. The ten-row queue below records the state handed from I1 to I2-DEEP; it is not current open work.

## Pass I2-DEEP — final forensic closure

**RC12 — CLOSED**, mechanically derived from the finding-level ledger after current-source repairs.

- Starting queue: 10 `OPEN_REPRODUCIBLE` assignments across 10 Adventures; 3 HIGH, 6 MEDIUM, 1 LOW. No ambiguous or unreviewed assignments.
- Implementation source commit: `1eca1a7` (`Repair final RC12 route convergence defects`).
- Disposition: 10 repaired independently in RC12; 0 reassigned; 0 blocked. Attached non-RC12 findings remain with their owning clusters.
- Final assignment totals: `VERIFIED_HEALTHY_REPAIRED` 142; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 2; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 0; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 0 (144 total).
- Final Adventure totals: **124 reconciled**, **0 open**, **0 unreviewed**.
- `dead-mans-hand` (O01-017): separated tackle failure from fired-shot aftermath; regression contrasts no-shot/no-wound with the actual gunshot route. RC14/RC15 untouched.
- `the-burning-loft` (O15-024): made the shared rescue-failure endpoint route-neutral; rescue consequences remain unchanged. RC11 untouched.
- `the-lantern-in-the-hedge` (R371-045): removed purse-surrender claims from both endings for all response routes; coin/economy mechanics unchanged. RC02 untouched.
- `the-long-way-home` (O01-024): split clinic handover from trail handover, preserving I1 name/call discovery behavior. RC14/RC07/RC09/RC05 untouched.
- `the-mineshaft-lamp` (R371-059): fee text limits claims to the cleared upper cut and leaves the lower light unidentified. RC02 untouched.
- `the-road-below` (O01-044): failed outside bracing now remains above ground and offers outside continuations; prior `neriEncountered`/`roadWarned` behavior preserved. RC15/RC14/RC09/RC02 untouched.
- `the-silent-hound` (R371-036): Gear transfer no longer claims the missing hand was found or dog watered; route-specific response narration remains. RC02 untouched.
- `the-silted-toolbox` (R371-060): fee text no longer claims return of the private chest after authorized-box-only recovery. RC02 untouched.
- `three-points-down` (R371-035): recovered-tin response uses existing response proof to bypass the still-below follow-up; leave/withdraw routes retain it. RC02 untouched.
- `under-the-ice` (O15-026): neutral rope fallback is truthful after either an initial miss or a failed haul; no new state, including for legacy saves. RC14 untouched.
- No new flags, persistent facts, save schema, Gear, or Knowledge were added. The same-Adventure scan also removed the false dropped-pistol action exposed by the gunshot aftermath.
- I2 route regressions cover the relevant route contrasts and fallbacks. Full suite, build/type check, registry, inventory, audit/library and ledger validation were run for this delivery.
- No authoring rule required change. Weekly Scenario Batch remains paused. No unrelated root-cause work was implemented.

All ten I2-DEEP cases are now `VERIFIED_HEALTHY_REPAIRED`; no RC12 implementation queue remains.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

Verification batches changed no gameplay source or tests. I1 changed only the listed RC12 scenario text/run-local proof and their regression tests; no unrelated root-cause implementation was included. Pages deployment is handled as part of I1 delivery. Weekly Scenario Batch remains paused.
