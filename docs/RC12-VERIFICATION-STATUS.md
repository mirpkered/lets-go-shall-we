# RC12 Verification Status

## Verification complete — Batch 5

Current-source verification is complete. This is a bookkeeping result, not a gameplay repair pass. No scenario behavior or gameplay tests were changed.

- Schema: `lgsw.rc12-verification.v1`
- Source main reviewed: `c314b7561ada076832f1c5d99d49e1a976b00c40`
- Canonical matrix: 109 confirmed finding records, 144 finding–Adventure assignments, 124 Adventures (106 single-finding, 18 multi-finding, maximum 3 findings per Adventure).
- Batch 5: **8/8 reviewed**; ambiguous: **0**; assignments left unreviewed: **0**.
- Assignment status: `VERIFIED_HEALTHY_REPAIRED` 111; `VERIFIED_HEALTHY_NO_LONGER_REPRODUCES` 2; `VERIFIED_FALSE_POSITIVE` 0; `VERIFIED_REASSIGNED_NOT_INDEPENDENT_RC12` 0; `OPEN_REPRODUCIBLE` 31; `OPEN_AMBIGUOUS` 0; `UNREVIEWED` 0.
- Adventure status (derived from child assignments): **94 reconciled**, **30 open**, **0 unreviewed**; total **124**.
- Review completion: **144/144 assignments (100%)** and **124/124 Adventures (100%)**. Review completion is not repair completion.
- All eight Batch 5 findings are MEDIUM. Two are now verified healthy; six remain reproducible.

## Batch 5 dispositions

- `a-gun-on-the-table` — R125-063, MEDIUM — **OPEN_REPRODUCIBLE**. `room.grabGun` goes directly to `weaponSafe`; that scene states the book’s eight-coin payment and four-coin balance although this route never reads the book.
- `give-me-whatcha-got` — RO29-22, MEDIUM — **VERIFIED_HEALTHY_REPAIRED**. Refusal sets `refusedSearchShot`, and `shotPlayer` has truthful refusal-specific text distinct from the `rushedArmedRobber` text. Inspected `giveMeWhatchaGot.ts`; the injury route remains accurately described.
- `only-one-bullet` — RO29-15, MEDIUM — **OPEN_REPRODUCIBLE**. `stayWithPerson` reaches an ending that introduces a neighbor without requesting help; `askGroundAgain` failure while the Traveler stays present reaches an ending saying they were away. Inspected `onlyOneBullet.ts` and `groundedConsequenceBatch.test.ts`.
- `the-markers-stop` — R125-032, MEDIUM — **OPEN_REPRODUCIBLE**. `followMarkerStones` reaches `markerWest`, which thanks the Traveler for leaving a sign despite no marker action. Inspected `survivalExpeditionBatch.ts` and its existing route test.
- `the-quartermasters-tally` — R371-024, MEDIUM — **OPEN_REPRODUCIBLE**. Securing tools means flour shifts, but `leftLoad` unconditionally says the shifted chest is secured. Inspected `gearCorrectiveBatch.ts` and its tests.
- `the-wheel-of-the-return-wagon` — R616-020, MEDIUM — **VERIFIED_HEALTHY_REPAIRED**. `return_pump_prioritised` selects text that says the pump is hand-carried first; current regression asserts the “delivered later” claim is absent, including a neutral legacy fallback. Inspected `expeditionLogisticsGenreBatch.ts` and its test.
- `the-winds-other-side` — R616-003, MEDIUM — **OPEN_REPRODUCIBLE**. Brush-bench route reaches `partial`, which claims sparks spread although sparks are only established by the stone-lee route. R616-004 is separate RC13 scope and remains untouched.
- `three-points-down` — R371-035, MEDIUM — **OPEN_REPRODUCIBLE**. The line response says the tin comes up, then generated follow-up says it remains visible below and offers choices that leave it. R371-033 is separate RC02 scope and remains untouched.

## Exact current open implementation queue

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

Recommendation: **one large but bounded implementation pass, followed by a small validation/cleanup pass**. Thirty open Adventures and 31 assignments are still substantial, but all are individually identified and reproducible; most are local route-state/text mismatches. The four multi-finding cases and cross-cluster boundaries justify wave-level tests and a cleanup pass. No further verification batch or historical reconstruction is needed.

## Supplemental noncanonical historical work

- `the-empty-cabin` — false positive; excluded from the canonical denominator.
- `the-pale-children-of-the-quarry` — minor concern; excluded from the canonical denominator.
- `the-skin-in-the-tree` — minor concern; excluded from the canonical denominator.
- `the-empty-wagon` — minor concern; excluded from the canonical denominator.

No gameplay source or gameplay tests changed during verification. No Pages deployment occurred. Weekly Scenario Batch remains paused.
