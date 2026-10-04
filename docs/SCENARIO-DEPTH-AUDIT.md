# Scenario Depth & Substance Audit

Internal snapshot for the library-wide retrofit pass. The QA Content Quality panel and registry tests provide route-level detail; this note records the review baseline and changes without treating lexical warnings as confirmed defects.

## Registry snapshot

- 445 registered adventures; 1,629 ending route variants reviewed by the content-quality heuristics.
- Current intended depth classification: 49 Encounter, 380 Adventure, 16 Deep Exploration (445 total).
- The 16 Deep Exploration entries are explicit in current metadata. Compact Encounter classification reflects authorial intent and story scale, not a raw scene-count threshold. Legacy scenarios with explicitly authored `VIGNETTE` metadata classify as Encounter; legacy metadata built through the standard authoring helpers defaults to Adventure. Length is not a quality grade and does not override an explicit intended lane.
- The graph audit found no invalid targets, cycles, or unaccounted unreachable scenes. Seventeen retained unreachable IDs are deliberately preserved in six existing adventures for stable-scene/save compatibility, including migration entry scenes and older authored endings. Engine-routed `__death` nodes are accounted for separately. Do not remove a retained scene without checking its active-save history.

## Review warnings

After narrowing the audit to avoid treating explicit walk-away/refusal routes and conclusive death endings as missing payoff, the library produces 855 warning instances across 245 adventures:

| Warning | Route flags |
| --- | ---: |
| Obvious action may reach terminal | 106 |
| Procedural terminal / handoff | 93 |
| One-wager terminal | 0 |
| Agreement may be terminal payoff | 5 |
| Routine task feedback | 127 |
| Work/game performance feedback | 127 |
| Visible payoff may be unclear | 397 |

These are human-review candidates, not quality failures. The wording/evidence regexes intentionally err toward surfacing short routes. For example, The Road Crew and Find Her accumulate warnings while their outcomes already show paid work, privacy consequences, visible evidence, or a changed relationship. The County Fair and Gone Fishing are intentionally quiet, with distinct fair/riverbank payoffs. Do not rewrite these merely to reduce warning totals. The speaker demonstration route was already repaired in prior work and now asks the traveler to interpret or compare the readings.

## Repairs in this pass

- When the Baby Comes: each of six outcomes now shows a concise, route-specific effect after the midwife takes over (room ready, household quieted, hallway clear, or another helper arriving). No medical role or outcome is invented for the traveler.
- The Frozen Letter: the branch where the miller confirms the letter is not urgent now reaches its own existing `contextEnd` ending instead of collapsing into the generic sealed-letter ending.
- The Cache under the Stove: removed a generated mishap terminal that had no route when that cache’s cautious, non-risky option was authored. It was an unreachable template artifact, not an authored save continuation.
- Content-quality heuristics: exclude explicit quick exits and conclusive death terminals from shallow missing-payoff warnings; stop treating a physical iron stake as a wager.
- Registry audit: all scenario graphs now have a global reachability and graph-validity test. The enumerated retained compatibility scenes are explicit so new orphan scenes fail the test.

## Reward distribution snapshot

Authored effects currently mention an item opportunity in 61 scenarios, including 56 for persistent Gear and 7 for Relics; direct `gainSupplies` appears in 1 scenario. Money appears in 66 scenarios, Knowledge in 255, Lore in 14, History in 299, an Owned Asset in 1, and repair/upgrade effects in 2. The item catalogue contains 43 Gear, 9 Relics, 3 Supplies, and 12 temporary items. This pass adds no rewards or carryables: the verified changes are resolution/continuity fixes, and item rewards should remain tied to provenance and route choices.

A 10,000-selection all-year simulation selected at least one of the 60 item-bearing scenarios it encountered in the sample; this is reachability at the scenario-selection layer, not a claim that the optional item route was taken. Item opportunities are still concentrated in a minority of stories and often require a particular route, so continue monitoring ordinary play, but do not inflate reward frequency without playtest evidence.

## Remaining audit boundary

Lexical review cannot reliably identify false branching, knowledge leaks, unclear roles, passive self-resolution, or whether a quiet beat is emotionally satisfying. Those require route reading and playtests; warnings remain advisory. Known unhealthy code paths fixed here are covered by scenario tests, while existing completion, reward resolution, selection weighting, saves, and traveler progression remain on their canonical systems.

## Release-candidate gap review

The follow-up review of the nine named live-play cases confirmed their repairs are present in the registered routes and covered by `src/scenarios/playtestRewardCorrections.test.ts`: **The Form Was Waiting for a Name**, **The Last Train Message**, **Held Before the Junction**, **Unload Before Dark**, **One Letter Held for Its Owner**, **The Claim with No Name**, **What Did You See?** (the tipped-cart route), **One Horse, Two Riders**, and **The Three-Ring Toss** (the disputed fair prize). The related laundry staging correction is also covered there. No duplicate scenario IDs or new scenario graphs were needed for this pass.

The experience audit found the proposed niches already represented by distinct registered stories: grounded deduction and physical evidence (**The Missing Crate**, **The Three-Toed Track**, **What Did You See?**); reasonable competing obligations (**Winter Stores**, **One Boat, Too Many People**); witness and information choices (**The Last Train Message**, **The Telegram**); games and contests (**A Coin for the Table**, **The Children’s Court**, **The Jack-o’-Lantern Contest**); animal behavior beyond simple rescue/attack (**The Mule Is Mine**, **The White Stag**); non-employer social situations and generosity tradeoffs (**The Burnt Barn Fund**, **The Meeting Hall**); incomplete-information mistakes (**The Wrong Letter**, **The Locket**); and meaningful refusals/walk-aways across work, travel, and exploration. These examples are evidence of coverage, not a claim that every route has been manually playtested. No additional scenario was justified by this review.

For release-candidate stability, major scenario creation is frozen after this review until promotional release. Continue to address bugs, broken routes, clear playtest defects, and release blockers; do not add scenarios to balance category counts or because time remains.
