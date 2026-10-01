# Scenario Diversity and Seasonal Framework

This framework exists to help the library grow toward hundreds or 1,000+ adventures without turning authoring into a fixed form. Metadata is internal, never a quality score, and never player-facing.

## Classification dimensions

`src/scenarioDiversity.ts` supplies a complete searchable classification for every registered scenario. Legacy adventures are classified from their authored title, subtitle, scenes, variants, choices, endings, risk, and effects; specific author decisions can override any dimension through `Scenario.diversity`. Legacy inferences are a review aid rather than infallible canon. Authors of new adventures should set `distinctiveHook` and seasonal availability intentionally, then correct any inaccurate inferred values.

The model covers player role, activity, structure, tone, setting, canonical risk tier, fantasy/supernatural density, supernatural threat, combat presence, length class, entry shape, outcome shape, reward shape, consequence shape, seasonal availability, historical presence, named historical references, portrayal, and a short distinguishing hook. Multiple tags are supported. Risk, tone, length, fantasy, combat, season, and historical presence are independent.

Historical presence is NONE, INSPIRED, CAMEO, FEATURED, or HISTORICAL_EVENT. CAMEO and FEATURED entries require a named reference and a GROUNDED, LEGENDARY, or MIXED portrayal; HISTORICAL_EVENT requires a named event. INSPIRED may remain unnamed. NONE is the fallback for the legacy library. References are counted in the report so future authors can notice the same figure being reused; the wider structural/similarity report also helps reveal repeated cameo setups such as stage appearances or public demonstrations. This is an authoring/audit dimension only and has no effect on normal selection or gameplay.

Historical references are rare, grounded allusions within a broadly late-19th-century-inspired atmosphere, not a fixed global calendar. Keep the fictional world independent rather than forcing exact dates or real geography onto it. Distinguish what is established fact, what people at the time say about a figure, and what later tellings add. Cameos can appear in ordinary work or public performance—including exhibitions, fairs, and sideshows—or in a conjunction with the supernatural/fantastical, but do not confer an inherent gameplay effect or demand a callback. Wild Bill Hickok and Calamity Jane are possible future reference points only; no stories featuring them are being authored in this framework pass.

Fantasy density supports NONE, AMBIGUOUS, EERIE, CONFIRMED_SUPERNATURAL, FANTASY_THREAT, and DUNGEON_FANTASY. Threat tags include ghosts, revenants, skeletons/animated bones, cursed people or animals, strange beasts, rituals/cults, haunted objects, ancient guardians, and unexplained phenomena. Animated skeletons and undead are valid but exceptional world content—not routine workers, shopkeepers, or generic filler enemies. Combat describes whether authored combat is absent, avoidable, possible, likely, unavoidable, or multiple; it does not add a combat engine.

Length is VIGNETTE, STANDARD, EXTENDED, or EPIC_SHORT, estimated from meaningful scene depth rather than word count. The scene-count estimate is a coarse warning for review, not a target.

## Seasonal availability

Season is explicit metadata (`Scenario.diversity.availability`): ALL_YEAR, a named month, broad season, or CUSTOM with explicit months. Optional month/day bounds and a bounded selection boost leave room for future date windows. Current random selection reads the browser’s local month and performs only a cheap metadata filter; it does not scan story text or call a service. October and December tags mean the entire month, not only a single holiday date. A modest per-scenario boost applies after recent-story exclusion and risk-tier weighting, capped so a seasonal story cannot overwhelm the pool. New games are filtered; active saves and earned property/rewards are untouched.

QA can temporarily override the effective selection month and directly launch any registered seasonal adventure at any time. The override is held in QA UI memory only, not in player saves. A seasonal scenario can later be offered in an explicit archive without changing its normal-rotation availability.

Existing clearly seasonal entries: First Snow (WINTER), The Thaw (SPRING), Before the Frost (AUTUMN), and New Year’s Eve (DECEMBER). Autumn, winter, spring, and year-round stories remain distinct; a seasonal setting does not make a story supernatural. October content space may include peaceful harvest/fair stories, masks, bonfires, eerie roads, burial places, skeletons, revenants, monster hunts, rituals, mini-dungeons, or comic misunderstandings. December space may include community gatherings, deliveries, winter travel, lodging, charity, folklore, supernatural visitors, danger, and quiet festive stories. These are possibilities for future batches, not a generated queue or a requirement that each theme be used.

## Library audit and future batches

The QA panel’s “Generate library diversity report” builds one row per registered adventure, including stable ID, title, all metadata, scene count, and choice-count signature. It also reports tag distributions, likely metadata near-neighbors, and repeated choice-count shapes. Similarity uses shared metadata dimensions; the structural warning compares scene count and choice-count sequence. Neither is a rejection: distinct authored decisions may justify overlap. This O(n²) comparison is audit-only and never runs during Begin Adventure.

### Current gap snapshot

The first generated snapshot for 175 registered adventures (2026-10-01) is a prompt for human review, not a definitive score. Tags overlap, and legacy keyword classification can mistake a passing mention for a central activity. The QA report is the current data source.

- **Risk:** 112 LOW, 34 MODERATE, 20 HIGH, 9 SEVERE. Low-risk stories dominate by count, while meaningful lethal danger remains a smaller share.
- **Fantasy/combat:** 169 NONE, 5 EERIE, 1 CONFIRMED_SUPERNATURAL; no current scenario classifies as an explicit fantasy threat or dungeon fantasy. Combat presence is NONE 163, AVOIDABLE 6, POSSIBLE 5, MULTIPLE 1 (the broader literary word matcher and explicit combat metadata need author review). Grounded social content is therefore the clear center of gravity; exceptional undead/monster and compact dungeon experiences are a genuine future option, not a required quota.
- **Length:** 3 VIGNETTE, 138 STANDARD, 13 EXTENDED, 21 EPIC_SHORT. Short focused stories are likely undercounted by the scene-count fallback and deserve explicit overrides when reviewed.
- **Tone/settings:** town/market/inn (106), domestic interior (87), farm (84), river/ferry/lake (80), and road/bridge (129) appear frequently. Shore/dock (13), workshop/mill/quarry/warehouse (12), and church/graveyard/ruin (14) are comparatively sparse. Peaceful (112) and hopeful/warm (155) coexist with tension (109); humorous/absurd tone (10) and grim tone (3) are less common.
- **Role/entry/activity:** broad tags often identify helper/rescuer (120) and traveler/passenger (133). Hired work (8), accidental encounter (5), stranded travel (7), invitation/known contact (7), and voluntary curiosity (1) are sparse; future work can begin from self-directed motives or unusual traveler roles. Repeated choices should also go beyond labor/trade/travel framing.
- **Outcomes/rewards/consequences:** peaceful resolution is available in 105; refusal/walk-away in 47; negotiated compromise in 21. The coarse scan sees no tangible persistent reward in 39 and explicit relationship/referral payoff in only 4, suggesting callbacks and social rewards deserve attention without adding item quotas.
- **Repetition warnings:** the initial metadata similarity heuristic flagged 390 pairs, while exact scene-count plus choice-count signatures matched for 1,306 pairs. The structural result is expected to be noisy for the older generated three-route batches; the similarity set includes warning pairs such as For Whom the Bell Tolls / All Aboard! and Aww, Rats!! / Cold Storage. These are review prompts, not conclusions that their fiction is interchangeable. More author-authored metadata will improve precision.
- **Seasonal gaps:** four stories are currently season-bound (one each winter, spring, autumn, December); there is no October-tagged adventure yet. October variety is a plausible future batch, not something to simulate by relabeling existing stories.

Use the report before every large batch:

1. Inspect the current matrix and known callback/continuity rules.
2. Identify genuine underrepresented settings, activities, roles, structures, tones, risks, fantasy densities, combat levels, lengths, entry shapes, outcomes, rewards, and consequences.
3. Choose target gaps, then vary structure and pacing inside the batch itself.
4. Keep peaceful stories peaceful; do not fill a taxonomy cell just to satisfy a count.
5. Give each story one distinguishing feature beyond names and scenery.
6. Re-run the report and read each warning as a request for human comparison—not an automatic duplication verdict.
7. Re-check forward-only flow, fair consequence, state-aware narration, fresh-traveler viability, and mobile fit.

Do not make a universal scenario template. The framework measures variety and reveals gaps; flexible scenario data remains the authoring medium.

