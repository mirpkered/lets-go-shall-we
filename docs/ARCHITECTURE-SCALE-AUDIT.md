# Architecture & Scale Audit

Audit snapshot: 2026-10-01  
Source baseline: `56326232d926c7ee1f8bed7002b1fb1adfdb31b1`  
Scope: architecture, authoring path, scale and verification. No scenario content or gameplay code was changed.

## Follow-up: authoring architecture at 445 scenarios (2026-10-02)

This section records the follow-up implementation; the 301-scenario measurements below remain historical and are not current counts.

- `src/scenarios/index.ts` remains the sole registry assembly point. The same `SCENARIOS` collection feeds normal selection, ID lookup, and QA direct launch. A new release-time `validateScenarioRegistry()` composes metadata and graph validation with duplicate display-title warnings and item, Supply, Contact, Favor, and owned-asset reference checks. It is exercised by one global test and a 1,000-entry synthetic registry test; it does not run on app startup.
- The anthology and monster-hunt scene/end constructors were exact pass-through duplicates of `largeScene` / `largeEnd`. They now re-export those canonical constructors. `largeScene` gained optional `textVariants` support so that consolidation retains the anthology adapter’s prior capability. No scenario files, scenario IDs, scene IDs, or authored outcomes needed migration.
- Metadata adapters remain family-specific: `anthologyTags` carries broader structure/entry normalization, and `huntMetadata` handles threat/season/reward metadata. The specialized frontier/deep-exploration and legacy `authorAdventure` builders remain optional shape-specific tools. `authorAdventure` still produces a fixed opening→route→two-endings pattern; it is not the default authoring pathway and should only be used when that authored structure fits.
- One malformed requirement was found by the new reference gate in *The Island When the Water Falls*: `roadmanLantern` did not match the catalog ID `roadmansLantern`. The requirement now uses the existing catalog ID. This fixes the signal-route item check without changing the scenario or save identifiers.
- Risk remains a known compatibility exception: effective runtime risk is currently owned by `src/riskClassification.ts`, while optional `diversity.riskTier` declarations can disagree. The earlier audit found 47 such disagreements in the then-current roster. This pass did not change selector weights or reclassify those scenarios because doing so without a scenario-by-scenario compatibility reconciliation could change live selection behavior. New authors are told which runtime classifier currently governs; a later migration should reconcile this explicitly.

The canonical authoring entry point is documented in `docs/AUTHORING_CHECKLIST.md` under “How to add one adventure correctly.”

## Executive summary

The codebase is in good shape for continued growth from its current **301 registered adventures**. Scenario execution is data-driven, lookup is indexed, core persistent systems have central owners, and the full test suite passed. A big-bang rewrite is not warranted.

The principal correctness concern is split ownership of risk: scenario metadata declares risk tiers, while selection and QA derive tiers from a second ID-based classifier. In this snapshot, **15 of 301** explicit risk declarations disagree with the tier actually used. Before more batches land, establish one authority and validate it. The other near-term concern is save evolution: a version-1 save with a long inline sequence of defaults and special migrations is still manageable, but an unsupported/corrupt save currently falls through a catch path that returns a fresh empty state. That should be made explicit and recoverable before adding another year of fields.

For scale, the selector is linear in the library and remained responsive in synthetic checks; the whole-library diversity comparison is quadratic and becomes the first obvious audit bottleneck. The main bundle is currently about **2.07 MB raw / 569 KB gzip** because all scenario modules are statically included. Neither fact requires an immediate runtime rewrite, but both should be measured again as the library approaches 500–1,000 entries.

## KEEP AS-IS

| System | Evidence and assessment |
|---|---|
| Scenario execution | Typed `Scenario` / `Scene` / `Choice` / `Effects` data drives the shared engine. Keep narrative decisions authored per scenario; do not replace them with scenario factories. |
| Registry lookup | `src/scenarios/index.ts` is the sole registry assembly point and builds a `Map` for O(1) ID lookup. Registration is manual once, not repeated in runtime consumers. |
| Selector separation | `src/scenarioSelection.ts` keeps eligibility, recent-ID exclusion, category weighting, risk weighting, seasonal affinity, replay weighting and final selection in a distinct module. The work per normal selection is O(n), not a scan of story text at each choice. |
| Run/save isolation | Active run state is persisted independently of a newly selected scenario. QA selection simulation uses copied histories; QA runs are marked and excluded from normal progression/global completion paths. Storage has a separate QA key. |
| Rewards and Bank | `src/rewardResolution.ts`, `src/bank.ts` and engine reward operations provide one authored reward-resolution path, including carry/Bank/decline handling and capacity protection. This is preferable to scenario-specific storage mutation. |
| Equipment model | `src/items.ts` is the item catalog; engine-owned helpers handle capacity, condition, upgrade, repair and supplies. The taxonomy needs a legacy cleanup (below), not a replacement. |
| Ending idempotence | Authored-ending recording, completion-count recording and reward resolution have explicit deduplication state. Ending-related bookkeeping is split across lifecycle phases for valid reasons; do not collapse it into one opaque “complete run” function just for stylistic uniformity. |
| Authoring audits | Graph, metadata, diversity and content-quality audits are opt-in/test/QA work, not part of normal player launch. This protects mobile startup. |
| Minimal player identity | There is no XP/level tree, quest log or combat HUD. Keep the story-first interface and persistent consequences rather than exposing every internal field. |

## CONSOLIDATE NOW

All findings in this section are **CONSOLIDATE NOW**.

| Priority | Finding, evidence and impact | Recommended bounded fix | Effort / risk |
|---|---|---|---|
| HIGH | **Risk has two authorities.** `Scenario.diversity.riskTier` is authored per scenario, but `src/riskClassification.ts` classifies through central ID sets/fallbacks. `src/scenarioDiversity.ts` spreads the authored metadata and then overwrites its tier with the derived result. **15/301** explicit declarations disagree with the effective tier; e.g. *The Witch at Miller’s Ford* declares HIGH but is used as LOW, and *The Voice in the Well* declares SEVERE but is used as HIGH. The current metadata validator sees the resolved tier, so it does not report this drift. Selection, audits and QA can therefore disagree with author intent without a warning. | Choose one canonical tier source. Prefer a validated explicit tier with a deliberate legacy fallback during migration; reconcile the 15 mismatches individually, then remove the obsolete ID override path. Add a validator/test that fails when authored and effective values diverge. | SMALL–MEDIUM / MEDIUM |
| HIGH | **Persistent-save evolution is implicit.** `src/storage.ts` reads `SaveData.version: 1`, casts parsed JSON, then applies a long ordered block of defaults, aliases and scenario-specific migrations. Unsupported/malformed input is caught and returned as `EMPTY_SAVE`; the raw data is not preserved or surfaced as unsupported. A future-version save opened by an older build can therefore look like a new game, creating a serious trust/data-recovery risk. | In a focused pass, make parsing and migration explicit: validate the envelope, preserve a backup of the original string before migration, distinguish corrupt from newer-unsupported versions, and use ordered migration functions when the schema genuinely changes. Do not bump the version without a real migration. Add tests for corrupted, partial, future-version and active-run fixtures. | MEDIUM / MEDIUM |
| MEDIUM | **Stable scenario IDs are a convention, not a protected contract.** Saves store IDs; registry lookup depends on those IDs. There is no checked-in ID lock/rename map. Renaming/removing an ID can strand an active save even if the scenario graph is healthy. | Add a lightweight test fixture/manifest of shipped IDs, or an explicit alias/migration map for intentional renames. The test should prevent accidental removal/rename without making new registrations cumbersome. | SMALL / LOW |
| MEDIUM | **Scenario reference validation is distributed.** Graph checks validate scene targets; item checks and scenario-specific tests vary by batch. There is no one registry-level validation entry point that checks unique scenario/scene IDs, valid start scenes, effect/reward item IDs and supply references together. An invalid `gainItems` ID can reach runtime inventory as an unrecognized string unless an author-specific test catches it. | Add a reusable registry validator called by one global test. Keep heuristic content warnings non-blocking; make broken IDs/references hard failures. Reuse catalog and graph helpers rather than adding another validator framework. | MEDIUM / LOW |

These are the only items recommended before more large batches. The first two affect core truth/data safety; the latter two cheaply prevent authoring mistakes from becoming saves.

## BEFORE 1,000 SCENARIOS

All findings in this section are **BEFORE 1,000**.

| Priority | Finding, evidence and impact | Recommended bounded fix | Effort / risk |
|---|---|---|---|
| MEDIUM | **Diversity audit is O(n²).** `analyzeScenarioLibrary()` compares every pair and recomputes structural shape inside pair processing. Current 301-scenario run: ~352 ms. Synthetic 1,000: ~2.32 s. The 1,000-case warnings are intentionally noisy for cloned fixtures; a several-thousand whole-library run was not attempted because pair count and warning output grow rapidly. | Cache normalized rows/shapes once, compare only plausible peers (e.g. same coarse category or structure), and cap/summarize near-duplicate output. Keep a full-library mode for deliberate review. Rebenchmark at 500 and 1,000 real scenarios before shipping optimization. | MEDIUM / MEDIUM |
| MEDIUM | **All story data is in the main bundle.** Production build: 2,074.06 KB JavaScript raw / 569.06 KB gzip; 29.97 KB CSS raw / 7.86 KB gzip. Vite emits its >500 KB chunk advisory. Current startup has no demonstrated failure, but a roughly linear increase in authored content could make first load costly on mobile. | Track measured mobile load/build size at 500 and 1,000 scenarios. Only then consider chunking by content packs or lazy loading; do not add dynamic loading speculatively because it complicates GitHub Pages paths and offline/local behavior. | MEDIUM / MEDIUM–HIGH |
| LOW | **QA picker becomes a very long rendered list.** `src/qaPanel.ts` renders direct-launch buttons for every adventure and all applicable seasonal descriptions when QA is enabled. At 301 this is acceptable for an internal panel but awkward on a phone; 1,000 controls will be unwieldy. Normal players do not render the panel. | Add a title/ID filter and optionally virtualize or group by category only when practical QA use degrades. Preserve direct launch and the normal/QA separation. | MEDIUM / LOW |
| LOW | **Scenario index is a merge hotspot.** Every batch modifies `src/scenarios/index.ts`; central ID-based risk sets and the large QA panel are other shared files. This is manageable now but likely to conflict during parallel batch work. | Keep one registry, but move registrations into a small number of curated pack registries imported by the root index. Consider this only when index conflicts become recurrent; avoid file proliferation now. | MEDIUM / MEDIUM |
| LOW | **Test coverage patterns are strong but repetitive.** There are 63 test files and 1,037 passing tests; several reusable graph/actionability patterns are repeated in scenario-batch tests. | Extract test-only fixtures/assertion helpers for registry-wide invariants. Do not generate scenarios from them. Start with the global suite so scenario authors inherit coverage automatically. | SMALL–MEDIUM / LOW |

## DEFER

| Finding | Priority | Timing | Effort | Risk | Assessment and recommendation |
|---|---|---|---|---|---|
| Contacts/Favors/threat entities | LOW | LATER | LARGE | MEDIUM | These structured models are not present in `Character` today. History flags, Knowledge and scenario flags cover current authored use. Do not add empty generic subsystems until real scenarios need multi-step contact/favor/threat state. |
| One universal terminal function | LOW | LATER | MEDIUM | MEDIUM | Completion bookkeeping is staged across authored ending, reward resolution, death/abandonment and retirement. Explicit idempotency guards make this coherent. Retain the phases; consolidate only if tests demonstrate an actual bypass or duplicated state bug. |
| Narrative helper/factory expansion | LOW | LATER | MEDIUM | HIGH | Shared checks/effect helpers are appropriate for mechanical behavior; the current typed scenario data allows distinct narrative graphs. Do not abstract common story beats into a template factory. |
| Rich reward system for every reward class | LOW | LATER | LARGE | MEDIUM | Money, persistent gear, supplies, relics, assets, history and knowledge have meaningful existing representations. Contacts, lodging/access and treatment are not all first-class reward records; use authored effects until repeated concrete needs justify a unified extension. |
| Full test-framework redesign | LOW | LATER | LARGE | HIGH | Existing suite exercises graph reachability, save migration, selector, rewards, inventory, QA and responsive layout. It is large but passing. Add registry validation and selective test helpers instead of replacing the suite. |
| Several-thousand diversity run | LOW | LATER | SMALL | LOW | The pairwise cost is evident from the 1,000-case measurement. A 3,000-case run was not performed because cloned-library output would be dominated by quadratic duplicate warnings and risk unnecessary memory/output use. Revisit after pruning/capping. |

## OPTIONAL IMPROVEMENTS

| Feature | Priority | Timing | Effort | Risk | Recommendation |
|---|---|---|---|---|---|
| Traveler / Possessions view | LOW | OPTIONAL | MEDIUM | LOW | **Useful later.** Gear, Supplies, Relics, Assets and Bank are distinct and can be confusing as the character system grows. A concise view would be helpful, but is not a scale blocker. |
| Contextual item details/provenance | LOW | OPTIONAL | SMALL–MEDIUM | LOW | **Later.** Upgrade/condition/provenance data already exists. Expose it more clearly only if players need to make carry/repair decisions; avoid rarity/color systems. |
| Lightweight traveler history | LOW | OPTIONAL | MEDIUM | LOW | **Useful later, after a compact design.** The character already has completion count, history flags, category history and play counts, but not a polished recent-outcomes journal. A few recent authored outcomes could make persistence legible; it must not become a quest log. |
| Retirement summary | LOW | OPTIONAL | SMALL | LOW | **Unnecessary now.** Retirement is functional; a summary is polish rather than architecture or player safety. |

## Duplicate and parallel systems

- **Risk tier:** real overlapping authority; consolidate as above.
- **Inventory class vs item category:** distinct concepts (persistent/storage class vs practical item type), not a duplicate by definition. However, legacy inference from `carryable`, stack limit and a relic-ID set in `src/items.ts` means classification has more than one path. Keep compatibility now; move legacy items to explicit `inventoryClass` when each is touched, then remove inference only after coverage proves it safe.
- **`carriedItem` vs `carriedItems`:** the plural collection is canonical; singular field is a compatibility alias normalized by storage/engine. Safe to keep during migration; do not author new code against the singular alias.
- **Recent scenario fields:** `recentScenarioIds` is the list; `mostRecentScenarioId` is a legacy/convenience alias. Storage migration normalizes them. Keep until legacy-save fixtures establish safe removal.
- **Completion counters:** traveler progression, authored completion and anonymous aggregate completion are separate concepts, with separate flags/deduplication. This is appropriate separation, not duplication.
- **Season metadata:** selection and display/QA both use shared availability helpers; retain that ownership.

## Authoring path and ownership

The normal path is clear for story structure: author a typed `Scenario`/scene graph in a scenario module, export/register it through `src/scenarios/index.ts`, use catalog IDs and engine effects, then add focused tests. Scenario behavior remains authored, while persistence and reward placement stay in shared engine systems.

The path is **not yet fully single-source** for risk and release validation. Authors can specify risk metadata that is ignored by effective classification, and reference checks are not uniformly registry-wide. A brief authoring checklist should say which field is authoritative until risk is unified. Avoid adding further per-scenario persistence code; use `Effects` and reward resolution.

Canonical ownership observed:

| Concern | Current owner |
|---|---|
| Registration / lookup | `src/scenarios/index.ts` |
| Eligibility / weighted choice | `src/scenarioSelection.ts` |
| Diversity and season metadata | `src/scenarioDiversity.ts` |
| Effective risk | `src/riskClassification.ts` (currently conflicts with declared risk metadata) |
| Run mechanics / traveler lifecycle | `src/engine.ts` |
| Save/load/defaults/migration | `src/storage.ts` |
| Item definitions and classification | `src/items.ts` |
| Bank operations/capacity | `src/bank.ts` |
| Reward choice and placement | `src/rewardResolution.ts` plus engine application |
| QA rendering/control | `src/qaPanel.ts` and QA event handling in the app shell |
| Graph/content audits | `src/scenarioGraph.ts`, `src/contentQuality.ts`, `src/scenarioDiversity.ts` |

## Selection, history and run lifecycle

The selector separates seasonal hard eligibility, recent scenario exclusions, category weighting, risk targets, replay attenuation, seasonal affinity, historical/special weighting and final weighted choice. It relaxes the oldest recent exclusions when needed rather than dead-ending the selector. QA direct launch intentionally bypasses normal eligibility; that is an explicit test affordance. Selection diagnostics are O(n), acceptable at current size.

Device recent IDs/risk history, traveler category history, traveler scenario-play counts and completion progression are stored separately. Death/abandonment/retirement clear the active traveler according to the current design while Bank/device-level state survives. Authored ending and completion flags prevent duplicate processing. Active runs are not overwritten by normal start; QA requires explicit clearing before launching another.

## Save and migration health

Local persistence is appropriate for the static Pages app and does not store the whole scenario library—only traveler/run state. Save/load is centralized in `src/storage.ts`; active state includes scenario ID, scene ID, visit list, inventory, flags, fictional time and related run fields. Tests cover old defaults and scenario migrations.

The risk is **migration policy**, not storage volume: schema version remains 1 while the inline migration/default sequence has grown. Unknown/newer/corrupt data currently becomes an empty save at the API boundary with no preserved backup or distinct user-visible status. Add recovery semantics before broad schema growth. No cloud, account or backend dependency is introduced by gameplay saves.

## Content audits, QA and diagnostics

- The content-quality analyzer is not called on normal gameplay paths. Current analysis was ~23 ms at 301 scenarios; synthetic 1,000 was ~59 ms in the local Node benchmark. It reports 1,107 terminal routes / 771 warnings at 301, and 3,751 routes / 2,573 warnings for the synthetic cloned 1,000 case. These are heuristic warnings, not proof of flaws; cloned scenario shapes naturally create noise.
- The diversity analyzer is the quadratic path and the first audit to optimize if needed.
- QA includes direct launch, full state inspection (scenario/scene/visited IDs, inventory, flags, money, health, lore, knowledge, history, Bank, Assets, Supplies, item states), selector explanations/simulation, seasonal override, diversity/content reports, time/health/completion controls, Gear/Relic/Supply manipulation, condition/repair/upgrade controls and Easter egg controls.
- High-value QA gaps: direct, safe setup for Knowledge/History/Assets and controlled reward-resolution scenarios; a search field for the 301-entry launcher; explanation of failed item/effect references and save migration decisions. Do not add mutation knobs until test use demonstrates value, and keep all mutations explicitly QA-only.
- QA HTML escapes text with `safeText`; normal mode returns no QA panel. Static local-first architecture has no unexpected gameplay telemetry. The optional completion-counter service is a separately documented exception, not a scenario backend.

## Scale results

Measurements are a synthetic smoke check in local Node tooling on this desktop, not an iPhone benchmark or user-perceived latency guarantee.

| Workload | Registry/selector diagnostics | Selection simulation | Diversity report | Content-quality report |
|---|---:|---:|---:|---:|
| Current 301 | ~165 ms | ~328 ms / 1,000 draws | ~352 ms | ~23 ms; 1,107 routes / 771 warnings |
| Synthetic 1,000 | ~561 ms | existing selector test also exercises 1,000 starts (~2.18 s including test harness) | ~2.32 s | ~59 ms; 3,751 routes / 2,573 warnings |
| Synthetic 3,000 | ~1.57 s diagnostics | not separately profiled | not run; pairwise warning explosion is expected | not run |

Benchmark order warms shared classification caches; timings are approximate. The 1,000-library simulation is not a real dataset and cloned graphs inflate similarity warnings. The measured evidence supports continuing content work, with diversity pruning and bundle measurement before the 1,000 milestone.

## Accessibility and mobile-level architecture notes

The interface is responsive and the full suite includes `src/responsiveLayout.test.ts` (7 tests). Choice count/layout and actionability are covered by registry/scenario tests. QA is intentionally hidden in normal mode. This audit did not perform hands-on assistive-technology or real-device profiling; preserve keyboard focus, accessible names and touch targets in future UI changes. The major mobile performance watch item is initial JS transfer, not per-choice story evaluation.

## Recommended next coding pass

One bounded pass, with no scenario prose changes:

1. Unify explicit/effective risk tier and individually reconcile the 15 mismatches; add a hard mismatch validator.
2. Add one registry-wide structural/reference validator for stable IDs, scene graph, start scene and item/supply/effect references; use it in tests.
3. Harden save-envelope recovery: distinguish corrupt and future-version saves and retain a recoverable backup; add migration fixtures without invalidating active saves.

Keep selection mathematics, lifecycle flow, content loading and narrative modules otherwise unchanged. Re-run selection, metadata, save migration, reward, inventory and full regression tests. Do not deploy for this documentation-only audit.

## Validation

- Full test suite: **63 files passed; 1,037 tests passed** (2026-10-01).
- Production build: **passed** (`tsc && vite build`). Vite reports the existing >500 KB chunk advisory; output was 2,074.06 KB JS raw / 569.06 KB gzip and 29.97 KB CSS raw / 7.86 KB gzip.
- Scenario graph/actionability, save migration, selector, reward, inventory, QA and responsive tests are included in the full passing suite. The selector suite includes a synthetic 1,000-scenario/1,000-start case.
- No gameplay code or scenario content changed. This report is documentation-only; no deployment is needed.
- Final source code remains at baseline `56326232d926c7ee1f8bed7002b1fb1adfdb31b1`.
