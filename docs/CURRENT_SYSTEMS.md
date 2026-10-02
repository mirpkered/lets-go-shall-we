# Current Systems

This document describes the checked-in implementation at the current source revision. Code and tests are authoritative; planned work belongs in [Roadmap](ROADMAP.md). Status labels distinguish working code from a partial foundation or future idea. The registry currently contains **330 playable adventures**. See [Adventure Library Status](ADVENTURE_LIBRARY.md) for its inventory snapshot and [Scenario Diversity](SCENARIO-DIVERSITY.md) for the complete metadata and selector rules.

## System status

| System | Status | Current behavior / boundary |
|---|---|---|
| Scenario engine and registry | IMPLEMENTED | Data-driven forward-only scenes; choices, requirements, checks, effects, endings, run-randomized values, fictional time, and per-scenario save-version migration. Stable scenario IDs are save data. |
| Active run and local save/resume | IMPLEMENTED | Browser local storage saves the character, scenario, scene, health, inventory sources, flags, visits, time, random selections, and reward-resolution state. Closing the browser is not abandonment. Schema version is 1 with targeted safe defaults/migrations. |
| Death, abandonment, retirement | IMPLEMENTED | Each ends the current character and clears unbanked character-bound continuity; the Bank and device-level repeat/risk/Easter-egg histories remain separate. Explicit abandonment is not a completed adventure and does not grant progression/counter credit. |
| Bank | IMPLEMENTED | Device-persistent; capacity 5; stores Gear and Relics only. Deposits, withdrawals, swaps, discard, and emptying are explicit. Legacy over-capacity contents are preserved; no silent overwrite. |
| Gear and carry capacity | IMPLEMENTED | 40 persistent Gear definitions; living traveler capacity is 1/2/3 Gear slots at 0–9/10–19/20+ qualifying completions. The starting Small Knife and Lantern are run gear, not persistent carry rewards. |
| Relics | IMPLEMENTED | Four persistent Relics; separate from Gear slots and without the Gear-slot hard cap. Bankable. |
| Supplies | IMPLEMENTED | Three typed, character-bound stack types (Ritual Chalk, Consecrated Salt, Cold-Iron Nails), with quantities, item-specific caps, and four distinct stack slots. Cannot be banked; lost with character death/abandonment/retirement. |
| Temporary Adventure Equipment | IMPLEMENTED | Run-only inventory and borrowed/supplied objects use run inventory/source records and are removed with the run. |
| Owned Assets | IMPLEMENTED | Structured, character-bound property is tracked apart from carried inventory; uses no Gear slot, cannot be banked, and ends with its traveler. |
| Gear condition, upgrades, repair | IMPLEMENTED | Per-item NORMAL/DAMAGED/BROKEN state, named compatible upgrades, and provenance persist in inventory or Bank. Wear is authored and event-driven; no passive durability tick. Broken Gear is owned but fails usable-equipment checks. |
| Ending rewards | IMPLEMENTED | Supports money, Gear/Relics, Supplies, upgrades/repairs/replacements, Assets, Knowledge, Lore, and History where authored. Named persistent item rewards can be carried, banked directly when space exists, or declined; choose-one rewards remain exclusive. Ending reward placement is not general Bank management. |
| Contacts and Favors | PARTIAL | Stories may record relationship/referral consequences as descriptive History flags. There is no structured contact roster, favor balance, redemption ledger, or guaranteed callback service. |
| Injuries and recovery | PARTIAL | Health is numeric and persistent for a living traveler; authored events can reduce or restore it. There is no separate injury record, condition taxonomy, or time-based recovery model. |
| Knowledge, Lore, History | IMPLEMENTED | Character-bound arrays of authored facts/discoveries and behavior flags. They are not bankable and do not transfer to a new traveler. Narration should be gated by current-character knowledge. |
| Persistent threats / callbacks | PARTIAL | Individual stories can encode consequences in History/Knowledge, and later scenarios can check those fields. There is no general structured threat/contact/world-event registry. |
| Traveler completion / progression | IMPLEMENTED | A substantive authored ending or qualifying persistent change advances the living traveler’s count and may unlock the next Gear slot. Adventure count, global count, and story rewards are distinct. No permanent stat levels. Death, abandonment, and retirement end this traveler’s progression. |
| Global Adventure Counter | PARTIAL | Worker, SQLite Durable Object, client queue/retry logic, tests, and manual GitHub Actions deployment workflow exist. Production display/submission is enabled only when `VITE_GLOBAL_COMPLETION_COUNTER_URL` is set to a deployed HTTPS endpoint. The checked-in deployment record does not verify a live endpoint/total; do not describe the public counter as active until that is confirmed. It is anonymous aggregate data, not authentication or gameplay storage. |
| Risk tiers and selection | IMPLEMENTED | LOW/MODERATE/HIGH/SEVERE authored-consequence tiers feed soft selection weights only. They do not scale a scenario’s internal success odds, enemies, or character stats. Current distribution: LOW 130, MODERATE 91, HIGH 73, SEVERE 36. |
| Seasonal locks and affinity | IMPLEMENTED | Local device month filters new normal starts; explicit ALL_YEAR affinity metadata adds a capped weight boost without excluding the story outside its affinity. Existing runs/rewards remain valid across month changes. |
| Historical-content metadata | PARTIAL | Metadata and a selection modifier are implemented, but all 330 current scenarios classify as `NONE`; there is no currently tagged historical cameo/event content. The modifier is therefore dormant for this registry. |
| Special content / Easter eggs | IMPLEMENTED | Rare optional scene flavor is separate from scenario selection. It has a 2% roll at eligible scene entry, at most one event per run, local recent-seen history, and no gameplay/reward/progression effect. There is no separate scenario-level “special” selector field. |
| Scenario diversity audit | IMPLEMENTED | All 330 scenarios receive metadata; similarity and structural-pattern checks are on-demand authoring warnings, not quality scores or selection gates. |
| Content-quality audit | IMPLEMENTED | On-demand route-level heuristics flag possible thin/procedural/payoff issues with evidence. Warnings overlap and can be false positives; review routes manually. This is not a hard release gate. Its first 175-scenario report is a dated snapshot, not a current 330-scenario audit. |
| Responsive / no-scroll standard | PARTIAL | The 320×720 and 390×844 no-scroll target is canonical and has responsive/layout tests. It remains an authoring/release check, not a guarantee that every long scene or utility panel in all 330 adventures has been manually verified at both sizes. |
| QA tools and selector diagnostics | IMPLEMENTED | `?qa=1` uses a separate save. It offers direct scenario launch, run/character/save controls, state inspection and test controls, fictional month override, selector weights/diagnostics and isolated 100/1,000-start simulation, diversity report, content-quality report, and Easter-egg/home-art previews. QA does not mutate normal player history or count toward progression/counter. |
| Hosting | IMPLEMENTED | Static GitHub Pages under `/lets-go-shall-we/`; gameplay and local saves require no backend. No accounts, cloud saves, multiplayer, or server-side gameplay. A mobile wrapper/PWA is not currently implemented. |

## Registry shape

The last documented 301-scenario primary-activity snapshot was: labor/repair 124; investigation/mystery 37; rescue/care 36; survival 34; negotiation/trade 31; travel/exploration 20; social interaction 7; animals 4; moral prioritization 3; competition/game 2; puzzle/problem-solving 2; communication/witness 1. The Monster Hunt batch adds a deliberately mixed set of rescue, animals, investigation, survival, travel, social, combat, labor, and communication tags; see [Scenario Diversity](SCENARIO-DIVERSITY.md) for the batch classification. These tags are authoring/selection categories inferred or authored from scenario content, not exclusive genres; each story may carry several activity tags. A fresh generated distribution should replace this dated snapshot after the next full metadata reconciliation.

Season metadata currently counts 292 ALL_YEAR scenarios, 13 OCTOBER-locked, 17 DECEMBER-locked, five WINTER, two SPRING, and one AUTUMN. Twenty-one ALL_YEAR entries additionally carry seasonal-affinity months. These counts are metadata assignments (not unique holiday/theme counts); some seasonal themes may overlap in meaning. Historical presence is NONE for all 330 current entries. No independent scenario-level special-content tag exists. Current effective risk counts are 130 LOW, 92 MODERATE, 72 HIGH, and 36 SEVERE.

Major represented content families include commerce and property; community/domestic life; paid work; animals and working stock; quiet recreation; disputes and testimony; crime/noir-lite; comedy/absurdity; occult and supernatural investigation; survival/expedition; seasonal Halloween/October and Christmas/December stories; disaster/rescue; Western/outlaw; and treasure/exploration/lost places. The machine-readable registry is `src/scenarios/index.ts`; inferred metadata is not a substitute for checking an individual story.

## Persistence boundaries

| Scope | Persisted information |
|---|---|
| Current run (device save) | Scenario/scene, character snapshot, health, inventory and sources, flags, visited scene IDs, random selections, elapsed fictional minutes, and pending ending-reward resolution. |
| Living character | Money, carried Gear, item condition/upgrades/provenance, Supplies, Lore, Knowledge, History, owned Assets, qualifying completion count, category-start history, and per-scenario authored-ending play counts. |
| Device-level local save | Bank; most-recent/recent ended scenario IDs (up to five); recent risk history (up to eight); recent Easter-egg IDs; pending counter submissions. Exact scenario-repeat history survives character death/retirement. |
| Bank-persistent | Gear and Relics only; five normal slots. No money, Supplies, Assets, Lore, Knowledge, or History. |
| World-public / shared | No shared story-world state. If separately deployed and configured, the optional counter exposes only one anonymous aggregate completion total. |

QA state uses a separate local-storage key; QA activity is isolated from the normal save. Legacy category/replay histories default safely when absent, and active runs receive targeted migrations rather than a blanket save reset.

## Scenario selection: implemented pipeline

The actual implementation is in `src/scenarioSelection.ts` and `src/scenarioDiversity.ts`; expanded values and examples are documented in [Scenario Diversity](SCENARIO-DIVERSITY.md).

1. Filter out scenarios unavailable in the browser’s local month.
2. Exclude up to the latest five ended/abandoned normal scenario IDs held at device level. If no scenario would remain, relax the oldest exclusions until at least one is eligible. QA direct launch bypasses normal eligibility intentionally.
3. Select a primary activity category using recency-weighted category recovery. The eight-entry, newest-first start history is character-bound; each matching category contributes `1 / (1 + 0.45 × position)`, then its relative category multiplier is `max(0.18, 1 / (1 + 1.15 × representation))`. This is a soft anti-streak weight, not a fixed rotation.
4. Within the selected category, distribute a soft risk-tier target across the available scenarios of each tier. The target interpolates from LOW/MODERATE/HIGH/SEVERE = 56/27/13/4% toward 27/32/30/11% as qualifying traveler completions rise, using `1 - exp(-completed / 12)`. Up to eight recent risk outcomes mildly raise risk after low-only history; up to three recent HIGH/SEVERE outcomes reduce HIGH/SEVERE weights. All tiers remain possible; there is no guaranteed cadence.
5. Multiply by seasonal affinity (at least 1, capped at 2.25), historical presence (CAMEO .82, FEATURED .68, HISTORICAL_EVENT .74; NONE/INSPIRED 1), and per-traveler replay weight (0 plays 1; 1 play .15; 2 plays .045; 3+ plays .012). The current library’s historical factor is inert because all entries are NONE.

Per-traveler category history records a normal start, including a run later abandoned; per-traveler scenario replay count increases only on authored success/death endings. Both clear when that character ends. Device recent-scenario history records ended/abandoned normal runs and survives character replacement. Recent risk history is device-level and tracks completed/death outcomes. QA simulations work on copies and do not update either history. Easter-egg history is separate.

## Content audit and verification notes

The first content-quality report reviewed 809 terminal routes across the earlier 175-scenario registry on 2026-10-01. Its counts are preserved as a historical triage snapshot in this document and the audit report; they are not a current report over the 330-scenario registry. Generate a fresh report in QA before citing current warning totals. Similarity, quality, and responsive checks are aids for human review, not claims that every route has received hands-on playtesting.

## References

- [Canonical design rules](DESIGN_RULES.md)
- [Adventure authoring checklist](AUTHORING_CHECKLIST.md)
- [Adventure library inventory and snapshot limits](ADVENTURE_LIBRARY.md)
- [Items and inventory classes](ITEMS.md)
- [Scenario diversity and selection details](SCENARIO-DIVERSITY.md)
- [Traveler progression and migration](TRAVELER-PROGRESSION.md)
- [Roadmap](ROADMAP.md)
