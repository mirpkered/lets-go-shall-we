# Scenario Diversity and Seasonal Framework

This framework exists to help the library grow toward hundreds or 1,000+ adventures without turning authoring into a fixed form. Metadata is internal, never a quality score, and never player-facing.

## Classification dimensions

`src/scenarioDiversity.ts` supplies a complete searchable classification for every registered scenario. Legacy adventures are classified from their authored title, subtitle, scenes, variants, choices, endings, risk, and effects; specific author decisions can override any dimension through `Scenario.diversity`. Legacy inferences are a review aid rather than infallible canon. Authors of new adventures should set `distinctiveHook` and seasonal availability intentionally, then correct any inaccurate inferred values.

The model covers player role, activity, structure, tone, setting, canonical risk tier, fantasy/supernatural density, supernatural threat, combat presence, length class, entry shape, outcome shape, reward shape, consequence shape, seasonal availability, historical presence, named historical references, portrayal, and a short distinguishing hook. Multiple tags are supported. Risk, tone, length, fantasy, combat, season, and historical presence are independent.

Historical presence is NONE, INSPIRED, CAMEO, FEATURED, or HISTORICAL_EVENT. CAMEO and FEATURED entries require a named reference and a GROUNDED, LEGENDARY, or MIXED portrayal; HISTORICAL_EVENT requires a named event. INSPIRED may remain unnamed. NONE is the fallback for the legacy library. References are counted in the report so future authors can notice the same figure being reused; the wider structural/similarity report also helps reveal repeated cameo setups such as stage appearances or public demonstrations. Historical metadata is an authoring/audit dimension and also has a modest scenario-selection modifier for CAMEO, FEATURED, and HISTORICAL_EVENT. All currently registered scenarios classify as NONE, so that modifier has no effect on today’s library. It does not change story gameplay.

Historical references are rare, grounded allusions within a broadly late-19th-century-inspired atmosphere, not a fixed global calendar. Keep the fictional world independent rather than forcing exact dates or real geography onto it. Distinguish what is established fact, what people at the time say about a figure, and what later tellings add. Cameos can appear in ordinary work or public performance—including exhibitions, fairs, and sideshows—or in a conjunction with the supernatural/fantastical, but do not confer an inherent gameplay effect or demand a callback. Wild Bill Hickok and Calamity Jane are possible future reference points only; no stories featuring them are being authored in this framework pass.

Fantasy density supports NONE, AMBIGUOUS, EERIE, CONFIRMED_SUPERNATURAL, FANTASY_THREAT, and DUNGEON_FANTASY. Threat tags include ghosts, revenants, skeletons/animated bones, cursed people or animals, strange beasts, rituals/cults, haunted objects, ancient guardians, and unexplained phenomena. Animated skeletons and undead are valid but exceptional world content—not routine workers, shopkeepers, or generic filler enemies. Combat describes whether authored combat is absent, avoidable, possible, likely, unavoidable, or multiple; it does not add a combat engine.

Length is VIGNETTE, STANDARD, EXTENDED, or EPIC_SHORT, estimated from meaningful scene depth rather than word count. The scene-count estimate is a coarse warning for review, not a target.

## Current registry snapshot

The current registry has 370 adventures. Risk, seasonal availability, and historical-presence counts are recorded in [Current Systems](CURRENT_SYSTEMS.md). Historical presence is currently 370 NONE. Counts in the dated batch sections below describe those release snapshots and should not be read as the latest registry totals.

The 40-adventure remote-discovery/frontier-claims batch is all-year and grounded (fantasy density NONE). Its openings mostly use voluntary curiosity; claim evidence, salvage provenance, remote occupation, and structural hazards are represented in the authored hooks and scene graphs. Existing selection category weighting and recent-scenario exclusion apply normally. The batch does not add Contacts/Favors, items, or a parallel persistence model.

## Seasonal availability

Season is explicit metadata (`Scenario.diversity.availability`): ALL_YEAR, a named month, broad season, or CUSTOM with explicit months. Optional month/day bounds and a bounded selection boost leave room for future date windows. Current random selection reads the browser’s local month and performs a metadata filter; it does not call a service. October and December tags mean the entire month, not only a single holiday date. Out-of-season stories are ineligible; a modest per-scenario seasonal boost is applied only after category and risk weighting, capped so a seasonal story cannot overwhelm the pool. New games are filtered; active saves and earned property/rewards are untouched.

QA can temporarily override the effective selection month and directly launch any registered seasonal adventure at any time. The override is held in QA UI memory only, not in player saves. A seasonal scenario can later be offered in an explicit archive without changing its normal-rotation availability.

An ALL_YEAR entry may declare `affinityMonths` to receive its `weightBoost` only in those months while remaining eligible in every month. October affinity therefore enriches October selection without acting as a lock. It uses the same category → risk → replay weighted selector; it does not bypass category balancing, current-traveler replay pressure, or recent-scenario exclusion. The QA seasonal panel names the effective boost for its selected month. The Halloween expansion uses a modest 1.35 boost in October and 1.0 otherwise. The only October-locked premises are **The Jack-o’-Lantern Contest**, **All Hallows at the Boarding House**, **The Masked Visitor**, and **The Halloween Dare**, each dependent on a locally observed Halloween gathering, contest, or dare.

## Monster Hunt / Creature Threat batch

This 29-adventure batch is a new library pillar, not a genre conversion. Its range includes grounded wildlife, uncertain reports, human hoaxes, folklore, confirmed supernatural entities, and one compact dungeon-fantasy threat. Stable IDs are registered in `src/scenarios/index.ts`; each has authored risk, fantasy, combat, activity, role, setting, structure, and distinctive-hook metadata. `src/riskClassification.ts` explicitly matches the authored risk tiers. No new item, trophy, parallel Contacts/Favors model, or persistent-threat subsystem was added; character discoveries use existing Knowledge/History, and damage uses existing item-condition state.

| Adventure | Stable ID | Risk / explanation | Combat | Season | Activity / player role | Structure and distinctive hook |
|---|---|---|---|---|---|---|
| The Thing at Black Creek | `thing-at-black-creek` | HIGH / AMBIGUOUS | POSSIBLE | ALL_YEAR | investigation / investigator | Tracks converge on an injured bear raiding a fish weir; territorial boundary |
| Teeth in the Mine | `teeth-in-the-mine` | SEVERE / FANTASY_THREAT | AVOIDABLE | ALL_YEAR | rescue / helper | Sound-led mine rescue; predator copies the warning bell |
| Something in the Corn | `something-in-the-corn` | HIGH / AMBIGUOUS | POSSIBLE | ALL_YEAR; October affinity | animals / helper | Farm watch and open-field boundary; missing hens draw a low shape |
| The Barrow Hound | `the-barrow-hound` | MODERATE / NONE | NONE | ALL_YEAR | rescue / helper | A working hound warns of unstable burial ground while a sheep is freed from the firm west slope |
| The White Stag | `the-white-stag` | MODERATE / AMBIGUOUS | NONE | ALL_YEAR | animals / witness | Separates crop damage from tracks; ethical refusal remains viable |
| The Red-Eyed Boar | `the-red-eyed-boar` | HIGH / NONE | POSSIBLE | ALL_YEAR | animals / helper | Wind and an escape corridor matter more than cornering a boar |
| The Bone-Eater | `the-bone-eater` | SEVERE / CONFIRMED_SUPERNATURAL | AVOIDABLE | ALL_YEAR | investigation / helper | Cemetery feeding boundary; protect mourners rather than kill |
| The Lantern-Eater | `the-lantern-eater` | HIGH / CONFIRMED_SUPERNATURAL | AVOIDABLE | ALL_YEAR | survival / helper | Exposed light draws a presence away from a shared camp |
| The Mire Horse | `the-mire-horse` | HIGH / AMBIGUOUS | AVOIDABLE | ALL_YEAR | travel / investigator | Safe-plank route and hoof evidence distinguish lure from horse |
| The River Devil | `the-river-devil` | HIGH / AMBIGUOUS | NONE | ALL_YEAR | travel / helper | Hull strikes are diagnosed from shore as a submerged log hazard |
| The Miller’s Beast | `the-millers-beast` | MODERATE / AMBIGUOUS | AVOIDABLE | ALL_YEAR | labor / investigator | Wheel cadence routes a mill visitor; stopping machinery enables capture |
| The Ashen Man | `the-ashen-man` | SEVERE / CONFIRMED_SUPERNATURAL | AVOIDABLE | ALL_YEAR | investigation / witness | Compare fire witnesses and contain the ember it follows |
| The Thing Beneath the Ice | `thing-beneath-the-ice` | SEVERE / FANTASY_THREAT | AVOIDABLE | WINTER | survival / accidental participant | Sound-following shadow makes the ice itself the urgent hazard |
| The Goat That Wouldn’t Stay Dead | `the-goat-that-wouldnt-stay-dead` | LOW / AMBIGUOUS | NONE | ALL_YEAR | investigation / investigator | Dark comedy tested by ear notches and a feed ledger |
| The Widow’s Beast | `the-widows-beast` | MODERATE / AMBIGUOUS | AVOIDABLE | ALL_YEAR | social / investigator | Widow’s wary guardian also keeps a real predator away |
| The Cellar Thing | `the-cellar-thing` | MODERATE / AMBIGUOUS | AVOIDABLE | ALL_YEAR | investigation / investigator | Sound localization leads outside through an abandoned coal passage |
| The Man Who Sheds His Skin | `the-man-who-sheds-his-skin` | HIGH / AMBIGUOUS | POSSIBLE | ALL_YEAR | investigation / investigator | Costume changes and laundry marks test a transformation rumor |
| The Pale Children of the Quarry | `the-pale-children-of-the-quarry` | MODERATE / EERIE | NONE | ALL_YEAR | investigation / investigator | Viewpoint reconnaissance reveals adult night workers, not endangered children |
| The Antlered Thing | `the-antlered-thing` | SEVERE / FANTASY_THREAT | AVOIDABLE | ALL_YEAR | survival / accidental participant | Marked territorial arches and explicit evacuation routes |
| The Last Trap | `the-last-trap` | HIGH / AMBIGUOUS | POSSIBLE | ALL_YEAR | social / helper | Trapper’s obsession creates the competing-risk decision |
| The Broken Antler | `the-broken-antler` | MODERATE / NONE | POSSIBLE | ALL_YEAR | animals / helper | Injury drives aggression; clear an escape corridor instead of cornering |
| The Man-Eater of Miller’s Gap | `the-man-eater-of-millers-gap` | SEVERE / NONE | LIKELY | ALL_YEAR | combat / helper | Grounded predator hunt weighs livestock defense against retreat |
| The Cinder Hound | `the-cinder-hound` | HIGH / CONFIRMED_SUPERNATURAL | AVOIDABLE | ALL_YEAR | investigation / investigator | A specific buried ember anchors the hound to an unfinished fire |
| The Three-Toed Track | `the-three-toed-track` | MODERATE / AMBIGUOUS | AVOIDABLE | ALL_YEAR | investigation / investigator | Conflicting scale reports resolve as a poacher’s three-pronged shoe |
| The Red Maw | `the-red-maw` | SEVERE / DUNGEON_FANTASY | AVOIDABLE | ALL_YEAR | survival / accidental participant | Reconnaissance, bait, two exits, and retreat from a feeding chamber |
| The Beast at the Toll Road | `the-beast-at-the-toll-road` | HIGH / AMBIGUOUS | POSSIBLE | ALL_YEAR | investigation / helper | A hide-frame hoax and genuine loose horse share a narrow bend |
| The Skin in the Tree | `the-skin-in-the-tree` | MODERATE / EERIE | AVOIDABLE | ALL_YEAR | investigation / investigator | Vertical hide evidence reveals a poaching signal and live snare |
| The Thing That Mimics the Whistle | `thing-that-mimics-the-whistle` | HIGH / CONFIRMED_SUPERNATURAL | AVOIDABLE | ALL_YEAR | communication / traveler | A changed note and impossible sound position warn against a ravine |
| The Stoneback | `the-stoneback` | HIGH / FANTASY_THREAT | AVOIDABLE | ALL_YEAR | labor / helper | Quarry vibration threatens stacks; rerouting avoids its den |

The batch uses no generic trophy rewards. Current systems do not provide structured Contacts, Favors, or persistent-threat records, so this pass deliberately does not invent parallel data models; durable outcomes are expressed through established history, knowledge, health, and gear-condition fields. No seasonal lock was added except the winter-bound ice threat; the October corn adventure remains available all year with an October affinity.

### Overlap decisions

**The Bell-Worm** remains excluded to protect the identity of **For Whom the Bell Tolls**. **The Borrowed Face** was not duplicated because it already exists. **The Chapel Beast** was dropped after comparison with **For Whom the Bell Tolls** and **Red Chapel**. **The Rag Man** was dropped as too close to **The Hollow Man**. **The Thing in the Smokehouse** was dropped as too close to **The Cellar Thing**. **The Night Feeder** was dropped because its farm stakeout overlaps **Something in the Corn**. **The Screamer in the Pines** overlaps the sound-led **Thing That Mimics the Whistle**. **The Wolf at Black Creek** and **The Hollow Tracks** were not included because they add less structural distance than the creek evidence and track-investigation stories already selected. No new bell-, chapel-, well-, or generic tracks-to-monster story was added; **Barrow Door**, **Below the Old Fort**, **The Third Knock**, and **Aww, Rats!!** remain separate existing adventures and were not rewritten.

## Normal adventure selection and anti-repetition

Normal selection is a two-stage weighted draw, not a fixed rotation. Stage one chooses evenly among the distinct **primary activity** categories present in the season-eligible, recent-excluded pool. The category reuses `ScenarioDiversity.activities`: its first authored/inferred tag is the primary category, so there is no parallel category registry. A broad category therefore receives a fair chance without gaining extra influence merely because it contains more adventures.

Recent category starts gently reduce that category’s stage-one weight. The bounded, newest-first traveler history holds up to eight categories; each matching entry contributes `1 / (1 + 0.45 × position)` to recent representation, and the category multiplier is `max(0.18, 1 / (1 + 1.15 × representation))`. A category absent from the recent window recovers to full weight. This is pressure, not a rotation guarantee.

Stage two chooses an adventure inside the chosen category. Its relative weight is the product of:

- the current soft risk-tier share divided among available adventures of that tier within the category (including the existing long-traveler and recent-danger adjustments);
- the authored seasonal boost, clamped to 1–2.25, after out-of-season filtering;
- a modest historical-presence factor: NONE/INSPIRED 1.00, CAMEO 0.82, FEATURED 0.68, HISTORICAL_EVENT 0.74;
- the per-traveler replay factor: first completed play 1.00, second 0.15, third 0.045, fourth and later 0.012.

All weights remain positive. A traveler’s scenario-play map is sparse and increases exactly once on reaching an authored success or death ending; QA runs, abandonment, refresh, and incomplete exits do not count as completed plays. Category history records a normal scenario start (including a later-abandoned run). Both histories belong to that traveler and disappear on death, retirement, or abandonment. Existing exact scenario recency remains device-level across travelers: the latest five ended/abandoned normal scenarios are excluded when possible, releasing the oldest exclusion only when the seasonal pool would otherwise be empty. Legacy saves receive empty traveler histories; active runs resume unchanged. QA simulation copies all histories and never mutates the real save. Easter-egg recency remains a separate flavor system and is not a scenario-selection input.

Season and historical presence are the currently authored special-selection metadata; the project has no independent scenario-level “special” field. Do not make Easter-egg contexts or recent Easter-egg appearances affect adventure weighting.

The original four-entry seasonal snapshot was First Snow (WINTER), The Thaw (SPRING), Before the Frost (AUTUMN), and New Year’s Eve (DECEMBER). Subsequent Halloween, occult, survival, and Christmas batches expanded this. The current exact counts are in [Current Systems](CURRENT_SYSTEMS.md). Autumn, winter, spring, and year-round stories remain distinct; a seasonal setting does not make a story supernatural. Future seasonal ideas are possibilities, not a generated queue or a requirement that each theme be used.

## Christmas / December-affinity batch

At that release snapshot, the Christmas / December-affinity batch added 28 adventures and brought the registry to 265. Sixteen depended on Christmas customs or the holiday itself and were December-locked at ×1.6. Twelve remained available all year: seven received a December-only ×1.35 affinity and five received a winter-month (December–February) ×1.25 affinity. Subsequent releases changed overall seasonal counts. These boosts use the existing category → risk → replay selector; they do not bypass recent-scenario exclusion or current-traveler replay pressure. Christmas is not a primary selection category.

The Twelve Knocks was omitted after comparison with The Third Knock and Seven Knocks on the Barn: its repeated-knock structure did not have enough distance from both existing stories. No new persistent gear or supply was needed. Durable Contact/Favor fields are not present in the current character model; story-specific continuity is represented with existing history and knowledge records.

| Adventure | Primary activity | Availability | Role / structure / entry | Tone · risk · fantasy · combat | Climax and payoff |
|---|---|---|---|---|---|
| The Christmas Goose | animals | December locked | helper · branching/multi-stage · invited/accidental | humorous · LOW · NONE · NONE | Recover the goose, share a meal, or change supper when it stays missing. |
| The Last Parcel Before Christmas | travel/exploration | December locked | helper · branching/multi-stage · invited/accidental | adventurous · MODERATE · NONE · NONE | Resolve two similar addresses and a muddy route; the recipient learns why the parcel matters. |
| A Place at the Table | social interaction | December locked | guest · branching/multi-stage · invited/accidental | melancholy · LOW · NONE · NONE | Decide whether to seek an absent relative or respect the absence; family names the old dispute. |
| The Carolers at the Wrong House | social interaction | December locked | accidental participant · branching/multi-stage · invited/accidental | humorous · LOW · NONE · NONE | Correct a repeated address mistake while honoring an overlooked household. |
| The Christmas Tree on Miller’s Hill | labor/repair | December locked | worker · branching/multi-stage · invited/accidental | tense · HIGH · NONE · NONE | Lower the tree clear of road and horse; wages reflect completed work and damage. |
| The Gift with No Name | investigation/mystery | December locked | investigator · branching/multi-stage · invited/accidental | mysterious · MODERATE · NONE · NONE | Trace conflicting parcel accounts; return it or let an estranged aunt speak. |
| Christmas at the Station | moral prioritization | December locked | traveler · branching/multi-stage · invited/accidental | hopeful · MODERATE · NONE · NONE | Share limited supper/coal or risk the road; all passengers are accounted for at dawn. |
| The Missing Stocking | puzzle/problem-solving | December locked | helper · branching/multi-stage · invited/accidental | humorous · LOW · NONE · NONE | Find a prank-carried stocking or make a replacement; ending distinguishes the two. |
| The Toymaker’s Last Order | labor/repair | December locked | worker · branching/multi-stage · invited/accidental | hopeful · MODERATE · NONE · NONE | Protect an injured hand and cracked tool; the recipient reacts to the simpler toy or delay. |
| The Pageant Problem | competition/game | December locked | guest · branching/multi-stage · invited/accidental | humorous · MODERATE · NONE · NONE | Repair a prop, return a player, or substitute; audience response closes the performance. |
| The Stranger’s Christmas Dinner | investigation/mystery | December locked | guest · branching/multi-stage · invited/accidental | mysterious · LOW · AMBIGUOUS · NONE | Follow an old ledger or accept anonymous hospitality; kindness is passed onward. |
| Three Gifts, Two Labels | puzzle/problem-solving | December locked | accidental participant · branching/multi-stage · invited/accidental | humorous · LOW · NONE · NONE | Ask rather than open parcels; recipients get the right gifts without losing surprise. |
| The Christmas Visitor | investigation/mystery | December locked | guest · branching/multi-stage · invited/accidental | mysterious · MODERATE · AMBIGUOUS · NONE | A private letter partly corroborates a visitor’s account but not identity. |
| The Empty Chair at Midnight | social interaction | December locked | guest · branching/multi-stage · invited/accidental | melancholy · MODERATE · EERIE · NONE | Investigate a napkin fold or share grief; the family chooses what the open place means. |
| The Evergreen Door | investigation/mystery | December locked | investigator · branching/multi-stage · invited/accidental | eerie · HIGH · EERIE · NONE | Explore a flood-safety custom and cellar sounds; wait, secure the shutter, or risk the stair. |
| The Gift That Came Back | investigation/mystery | December locked | investigator · branching/multi-stage · invited/accidental | eerie · MODERATE · AMBIGUOUS · NONE | Trace a returning keepsake to a family joke around an unspoken apology. |
| The Snowbound Inn | moral prioritization | winter affinity · Dec–Feb ×1.25 | traveler · branching/multi-stage · stranded/accidental | tense · MODERATE · NONE · NONE | Share space or search carefully; account for the absent traveler before departure. |
| Footprints around the House | investigation/mystery | winter affinity · Dec–Feb ×1.25 | investigator · branching/multi-stage · stranded/accidental | eerie · MODERATE · AMBIGUOUS · NONE | Compare wind, shutter, fox, and boot evidence; explain the ring without erasing unease. |
| The Red Scarf in the Snow | rescue/care | December affinity · ×1.35 | helper · branching/multi-stage · stranded/accidental | tense · HIGH · NONE · NONE | Search with a partner, signal, or retreat; the scarf proves a hunter’s marker. |
| The Empty Sleigh | animals | December affinity · ×1.35 | investigator · branching/time-pressure · stranded/accidental | tense · HIGH · NONE · NONE | Secure the horse, trace the turn, and find an injured driver; bent runner is reported. |
| The House with the Warm Window | investigation/mystery | winter affinity · Dec–Feb ×1.25 | traveler · branching/multi-stage · stranded/accidental | eerie · MODERATE · EERIE · NONE | Choose whether to intrude or carry a note; a location is found, not a guaranteed reunion. |
| The Frozen Letter | investigation/mystery | December affinity · ×1.35 | investigator · branching/multi-stage · stranded/accidental | mysterious · MODERATE · NONE · NONE | Preserve a sealed letter and restore its route instead of inventing urgency. |
| The Longest Night | survival | winter affinity · Dec–Feb ×1.25 | traveler · time-pressure/branching · stranded/accidental | tense · MODERATE · AMBIGUOUS · NONE | Distinguish fox, branch, and courier; shelter, retreat, or guide the person below. |
| The Ice Lanterns | investigation/mystery | winter affinity · Dec–Feb ×1.25 | helper · branching/multi-stage · stranded/accidental | eerie · MODERATE · AMBIGUOUS · NONE | Follow bank tracks and call the far shore; the child never crosses thin ice. |
| The Widow’s Firewood | investigation/mystery | winter affinity · Dec–Feb ×1.25 | accidental participant · branching/multi-stage · stranded/accidental | hopeful · LOW · NONE · NONE | Trace marked logs to borrowed tools and debt; distinguish repayment from stolen wood. |
| The Road under Snow | travel/exploration | winter affinity · Dec–Feb ×1.25 | traveler · branching/multi-stage · stranded/accidental | tense · HIGH · NONE · NONE | Reconstruct the road from fence and drainage; retreat, reach shelter, or risk the drift. |
| The Frozen Millwheel | labor/repair | winter affinity · Dec–Feb ×1.25 | worker · time-pressure/multi-stage · stranded/accidental | tense · HIGH · NONE · NONE | Lower water pressure before warming the bearing; wait, repair, damage, or die in the race. |
| The Visitor at Midnight | social interaction | December affinity · ×1.35 | traveler · branching/multi-stage · stranded/accidental | eerie · MODERATE · AMBIGUOUS · NONE | Check an inconsistent shelter request at a safe threshold; the old key remains unexplained. |

Primary activities span animals (2), travel/exploration (2), social interaction (4), labor/repair (3), investigation/mystery (10), moral prioritization (2), puzzle/problem-solving (2), competition/game (1), rescue/care (1), and survival (1). Seasonal weighting remains independent of these categories. The selector’s authored risk classification is LOW 7, MODERATE 15, HIGH 6, SEVERE 0; three scenarios contain narrowly authored death routes, each classified HIGH and foreshadowed in the scene. Fantasy density is NONE 18, AMBIGUOUS 7, EERIE 3, with no confirmed-supernatural or fantasy-threat entry and no combat route. At the 265-story snapshot, risk distribution was LOW 128, MODERATE 73, HIGH 43, SEVERE 21.

## Disaster, western, and lost-places expansion

The 36-story expansion raises the current registry to **301**. The twelve disaster/rescue stories emphasize triage and state-aware aftermath; the western stories center on reputation, evidence, standoffs, property, and survival; the lost-places stories balance discovery against ownership, limited access, and retreat. All are year-round and use existing engine/state systems without adding equipment categories or backend features. Current risk distribution is LOW 129, MODERATE 83, HIGH 60, SEVERE 29.

Disaster & Rescue: The Bridge Goes Down; Smoke over Main Street; The Train That Didn’t Stop; The Mine Gives Way; Water Through the Door; The Boiler Room; The Crowd Breaks; The Ferry Lists; The Roof Comes In; The Powder Wagon; After the Tornado; The Second Wave.

Western / Outlaw: Wanted in Red Creek; The Man at the End of the Bar; The Stage Was Hit; The Bounty Poster; The Empty Jail; Three Men at the Water Trough; The Rustled Herd; A Gun on the Table; The Outlaw’s Mother; The False Deputy; One Horse, Two Riders; The Last Shot.

Treasure, Exploration & Lost Places: The Map in the Ledger; The Town That Moved; The Old Survey Stone; The Sealed Mine Office; The Room Behind the Chimney; The Island When the Water Falls; The Forgotten Station; The Cave with Worked Stone; The Lost Payroll; The House under the Hill; The Riverboat Cache; The Last Room in the Fort.

## Library audit and future batches

The QA panel’s “Generate library diversity report” builds one row per registered adventure, including stable ID, title, all metadata, scene count, and choice-count signature. It also reports tag distributions, likely metadata near-neighbors, and repeated choice-count shapes. Similarity uses shared metadata dimensions; the structural warning compares scene count and choice-count sequence. Neither is a rejection: distinct authored decisions may justify overlap. This O(n²) comparison is audit-only and never runs during Begin Adventure.

### Current gap snapshot

The first generated snapshot for 175 registered adventures (2026-10-01) is a prompt for human review, not a definitive score. Tags overlap, and legacy keyword classification can mistake a passing mention for a central activity. The QA report is the current data source; do not apply that dated snapshot to the later 301-adventure registry.

- **Risk:** 111 LOW, 35 MODERATE, 20 HIGH, 9 SEVERE. Low-risk stories dominate by count, while meaningful lethal danger remains a smaller share.
- **Fantasy/combat:** 169 NONE, 5 EERIE, 1 CONFIRMED_SUPERNATURAL; no current scenario classifies as an explicit fantasy threat or dungeon fantasy. Combat presence is NONE 163, AVOIDABLE 6, POSSIBLE 5, MULTIPLE 1 (the broader literary word matcher and explicit combat metadata need author review). Grounded social content is therefore the clear center of gravity; exceptional undead/monster and compact dungeon experiences are a genuine future option, not a required quota.
- **Length:** 3 VIGNETTE, 138 STANDARD, 13 EXTENDED, 21 EPIC_SHORT. Short focused stories are likely undercounted by the scene-count fallback and deserve explicit overrides when reviewed.
- **Tone/settings:** town/market/inn (106), domestic interior (87), farm (84), river/ferry/lake (80), and road/bridge (129) appear frequently. Shore/dock (13), workshop/mill/quarry/warehouse (12), and church/graveyard/ruin (14) are comparatively sparse. Peaceful (112) and hopeful/warm (155) coexist with tension (109); humorous/absurd tone (10) and grim tone (3) are less common.
- **Role/entry/activity:** broad tags often identify helper/rescuer (120) and traveler/passenger (133). Hired work (8), accidental encounter (5), stranded travel (7), invitation/known contact (7), and voluntary curiosity (1) are sparse; future work can begin from self-directed motives or unusual traveler roles. Repeated choices should also go beyond labor/trade/travel framing.
- **Outcomes/rewards/consequences:** peaceful resolution is available in 105; refusal/walk-away in 47; negotiated compromise in 21. The coarse scan sees no tangible persistent reward in 39 and explicit relationship/referral payoff in only 4, suggesting callbacks and social rewards deserve attention without adding item quotas.
- **Repetition warnings:** the initial metadata similarity heuristic flagged 390 pairs, while exact scene-count plus choice-count signatures matched for 1,306 pairs. The structural result is expected to be noisy for the older generated three-route batches; the similarity set includes warning pairs such as For Whom the Bell Tolls / All Aboard! and Aww, Rats!! / Cold Storage. These are review prompts, not conclusions that their fiction is interchangeable. More author-authored metadata will improve precision.
- **Seasonal gaps (historical note):** the original 175-adventure snapshot had four season-bound stories and no October-tagged adventure. Halloween, occult, survival, and Christmas expansions have since changed that; see the current counts above and in Current Systems.

Use the report before every large batch:

1. Inspect the current matrix and known callback/continuity rules.
2. Identify genuine underrepresented settings, activities, roles, structures, tones, risks, fantasy densities, combat levels, lengths, entry shapes, outcomes, rewards, and consequences.
3. Choose target gaps, then vary structure and pacing inside the batch itself.
4. Keep peaceful stories peaceful; do not fill a taxonomy cell just to satisfy a count.
5. Give each story one distinguishing feature beyond names and scenery.
6. Re-run the report and read each warning as a request for human comparison—not an automatic duplication verdict.
7. Re-check forward-only flow, fair consequence, state-aware narration, fresh-traveler viability, and mobile fit.

## October expansion matrix

The 2026-10-01 expansion adds twelve stories to the 175-story inventory snapshot above. “Primary category” is the first authored activity tag used by the selector; Halloween is never a category. Risk below is the engine’s consequence classification (not an authorial mood label). All twelve contain no combat action; the severe threat is environmental/animal danger.

| Adventure | Primary / availability | Role · structure | Risk · fantasy · combat | Entry → climax → outcome | Reward · consequence · distinctive hook |
|---|---|---|---|---|---|
| The Jack-o’-Lantern Contest | competition/game · OCTOBER_LOCKED | guest · branching event | LOW · NONE · NONE | contest invite → repair, rain protection, or fair judgment → judged entry or early refusal | optional coin, lore/history · rain or disputed copying · a sturdy carving can outperform a fine but fragile design |
| All Hallows at the Boarding House | social interaction · OCTOBER_LOCKED | guest · social-to-investigation | LOW · AMBIGUOUS · NONE | Halloween stories → source comparison and loose stair → key-story explanation or chosen privacy | coin, knowledge/history · avoids false accusation; key remains missing · a guest repeats a house-ledger detail |
| The Masked Visitor | investigation/mystery · OCTOBER_LOCKED | witness · evidence chain | LOW · NONE · NONE | parcel swap → timing, thread, and accounts → papers recovered or uncertainty preserved | knowledge/history · rent papers may be delayed · masked confusion is not treated as proof of theft |
| The Halloween Dare | survival · OCTOBER_LOCKED | helper/rescuer · branching rescue | MODERATE · AMBIGUOUS · NONE | visible unsafe toll house → voice-guided exit, outside help, or risky crossing → rescue and closure / refusal | coin, knowledge/history · possible injury · a real structural hazard explains the misleading shadow |
| The Scarecrow Changes Fields | investigation/mystery · ALL_YEAR + October ×1.35 | accidental witness · branching investigation | LOW · AMBIGUOUS · NONE | farmer’s report → tracks, accounts, and watch → anchoring choice with unresolved drag mark | coin, history · time and possible worker distrust · wind turns a loose head while a farmhand admits one move |
| The Harvest Mask | investigation/mystery · ALL_YEAR + October ×1.35 | witness · clue-to-risk branch | MODERATE · EERIE · NONE | farm sale → compare repeated vision with carving/oil → stop use or accept an injury risk | lore/history · possible injury; mask withheld · same landscape appears to unrelated wearers |
| The Witch at Miller’s Ford | social interaction · ALL_YEAR + October ×1.35 | helper/rescuer · crowd mediation | LOW · AMBIGUOUS · NONE | healer under accusation → compare testimony and spoiled remedy → crowd waits or healer leaves | knowledge/history · community trust remains unsettled · danger comes first from frightened neighbors, not a caricatured witch |
| The Man in the Corn | survival · ALL_YEAR + October ×1.35 | helper/rescuer · branching search with risk | SEVERE · AMBIGUOUS · NONE | missing hand and movement → hold the fence, call, retreat, or enter → rescue/search at daylight or death | coin, knowledge/history · livestock/property risk; lethal trench/boar branch · cross-row tracks conceal both a trench and a wild boar |
| The Coffin Maker’s Extra Order | investigation/mystery · ALL_YEAR + October ×1.35 | investigator · evidence and warning | LOW · AMBIGUOUS · NONE | anonymous paid order → trace tailor’s crossed sevens and disputed debt → return/seal threat without building coffin | knowledge/history · threat relationship exposed · dimensions match a living customer but paper ownership traces to a tailor |
| The Skeleton in the Wagon | investigation/mystery · ALL_YEAR + October ×1.35 | witness · provenance inquiry | LOW · NONE · NONE | wagon breakdown and disputed remains → verify receipt and lot tag → cargo covered; identity unresolved | meal, knowledge/history · lesson delayed and family uncertainty remains · a legitimate school receipt does not identify whose bones they are |
| The Headless Rider | investigation/mystery · ALL_YEAR + October ×1.35 | traveler · sighting-to-social reveal | MODERATE · EERIE · NONE | ridge silhouette → track hurt horse and hidden passenger → shelter and report, or leave choices to them | knowledge/history · possible injury and disputed horse borrowing · lantern alignment hides a hooded worker escaping an abusive employer |
| The Last House before the Woods | survival · ALL_YEAR + October ×1.35 | guest · household boundary test | MODERATE · EERIE · NONE | offered room with a plain warning → hear/see an unknown caller → stay behind the bar or risk the door | breakfast, knowledge/history · possible injury and household alarm · ordinary safety rules prove useful without confirming a haunting |

This batch deliberately does not add The Seven Knocks on the Barn, The Screaming Well, The Empty Costume, cemetery lanterns, or a second masked supper: their central hooks are too close to The Third Knock, The Sound in the Well, The Hollow Man, existing bell/graveyard stories, and The Masked Visitor respectively. The Bone Orchard / twice-dug grave / bone buyer cluster was deferred rather than multiplying burial-investigation structures already present. “The Lanterns in the Cemetery” is likewise not added because cemetery lights would overlap the graveyard/lantern library. “The Door with the Pumpkin Mark” and “The Gourd Race” were dropped: the first depends on an invented local custom and the second adds little beyond the carving contest. These are overlap decisions, not claims that the concepts are unusable after substantial retooling.

## Occult investigation expansion matrix

The occult batch brings the registry to 214 adventures. These authored risk counts reflect consequences, not genre labels: LOW 119, MODERATE 54, HIGH 27, SEVERE 14. Within the 27 new stories, risk is LOW 1, MODERATE 15, HIGH 7, SEVERE 4. The density spread is 9 AMBIGUOUS, 8 EERIE, 3 CONFIRMED_SUPERNATURAL, 5 FANTASY_THREAT, and 2 DUNGEON_FANTASY. Nine are October-locked; the rest remain year-round. Most have no combat; danger is concentrated in optional or likely confrontations, and dungeon encounters include retreat routes.

| Adventure | Density / risk | Distinctive investigation or danger |
|---|---|---|
| The Séance at Bellweather House | AMBIGUOUS · MODERATE · October | A concealed bell trick shares the room with an unexplained private voice. |
| The Red Chalk Circle | CONFIRMED_SUPERNATURAL · HIGH | A missing tenant and an empty coat react to a broken boundary. |
| The Man Who Sleeps in the Graveyard | AMBIGUOUS · MODERATE · October | Tracks stop at a fresh grave; the family’s account remains uncertain. |
| The Widow’s Mirror | EERIE · MODERATE | A warped backing explains some—but not the first—reflection. |
| The Bone Box | AMBIGUOUS · MODERATE | A provenance record and shared dream complicate ownership of a tiny box. |
| The Lantern at the Crossing | AMBIGUOUS · HIGH | A moving light folds the road’s distance and may reveal a lost traveler. |
| The Quiet Room | EERIE · MODERATE | Sound ends at a threshold above a sealed speaking tube. |
| The House with Two Cellars | DUNGEON_FANTASY · SEVERE · October | Optional forward-only descent, unstable powder room, skeletal guard, and retreat. |
| The Black Thread | AMBIGUOUS · MODERATE | Doorway knots lead to a coffin handle and an empty storeroom. |
| The Medium Who Knows Too Much | AMBIGUOUS · MODERATE | Bought descriptions explain part of a reading, but not one private detail. |
| The Thing Under the Floorboards | FANTASY_THREAT · HIGH | A voice beneath a boarding house follows the evacuated residents. |
| The Candle That Will Not Go Out | EERIE · MODERATE | A hidden inner wick points to a dangerous old service passage. |
| The Book Without a Title | AMBIGUOUS · LOW | Readers report different text while sharing one fresh printer’s mark. |
| The Voice in the Well | CONFIRMED_SUPERNATURAL · SEVERE | A speaking tube and a voice answering before speech remain difficult to separate. |
| The Empty Coffin | AMBIGUOUS · MODERATE | A missing body becomes a living person hidden from creditors. |
| The Man Who Came Back Wrong | EERIE · MODERATE | Two sets of bootprints diverge at a sealed mill culvert. |
| Hanging Charms | AMBIGUOUS · MODERATE | Local doorway bundles remember a fever; one empty cottage resists easy explanation. |
| The Third Knock | EERIE · HIGH · October | A blank letter names a dead sailor’s living shipmate after three knocks. |
| The Wrong Shadow | CONFIRMED_SUPERNATURAL · HIGH | A shadow turns against its owner; sustained attention can be lethal. |
| The Red Chapel | FANTASY_THREAT · SEVERE · October | A misunderstood burial rite animates an empty coat and traps a participant. |
| The Man Who Wouldn’t Stay Dead | FANTASY_THREAT · SEVERE · October | An outlaw’s shadow, not repeated injury, reveals the stopping condition. |
| Below the Old Fort | DUNGEON_FANTASY · SEVERE · October | Barracks, powder store, signal chamber, optional loot, skeleton, and retreat. |
| The Barrow Door | FANTASY_THREAT · HIGH · October | Returning a stolen grave pin resolves a guardian encounter without a chapel/bell repeat. |
| The Hollow Man | FANTASY_THREAT · HIGH · October | Work clothes, fox bones, and a figure that crosses the field. |
| The Borrowed Face | EERIE · MODERATE | Independent witnesses share a description; a reflection answers late. |
| The Doorway with No Room | EERIE · HIGH | A measured corridor is longer than the house that contains it. |
| The Last Candle in the House | EERIE · MODERATE | One house-wide extinction leaves a single flame over a buried walking stick. |

Relic overlap was deliberately restrained: the Grave Token fits a display mark but is not a key; the Yew Charm is recognized at a specific burial threshold but does not command guardians; the Bone Key remains a local Broken Bell object. No new persistent occult Relics were added. Ritual Chalk, Consecrated Salt, and Cold-Iron Nails are optional and explicitly consumed in scenario choices. A glazier’s provenance-backed Spirit Glass upgrade on the existing Lantern reveals a particular old road mark; it does not detect all spirits. “The Bell That Rings Below” remains rejected to protect For Whom the Bell Tolls; no second bell-centered chapel descent was authored.

## Survival & Expedition batch

The survival family adds 23 adventures and brings the playable registry to 237. Its authored risk distribution is LOW 2, MODERATE 4, HIGH 10, SEVERE 7. Availability is ALL_YEAR 19, SPRING 1, WINTER 3. Scene graphs range from short focused vignettes to multi-stage branches; all are intended to remain standard bite-sized adventures rather than long expeditions. Terrain, navigation, transport, shelter, rescues, and deliberate retreat are not interchangeable versions of a generic storm escalation.

The library-shape heuristic raises five review pairs because they share scene-count and per-scene choice-count signatures: No Water at Miller’s Spring / The Rocks Start Moving (water search vs. rockfall response), Whiteout / The Wrong Valley (group movement in a blizzard vs. route correction), The Last Rope / The Markers Stop (rescue-tool triage vs. trail interpretation), The Empty Cabin / The Wind Changes (shelter and signs vs. fire movement), and The Ice Gives Warning / The Abandoned Camp (ice crossing vs. property and tracks). Review found these are different situations and decision themes; the warnings reflect graph shape only, not a repeated authored choice sequence. Retain them as candidates for human review if later stories make the choice rhythm feel repetitive.

| Adventure | Risk / entry | Structure, climax, and outcome shape | Distinctive hook |
|---|---|---|---|
| The Pass Before Snow | SEVERE · WINTER · stranded party | Retreat window → exposed saddle or shelter → descent, rescue, crossing, or death | The party can turn back while the trail is still visible. |
| No Water at Miller’s Spring | MODERATE · ALL_YEAR · dry source | Terrain reading / household knowledge → locate seep, accept water, or turn back | Effort conservation matters more than a thirst meter. |
| The Broken Axle | HIGH · ALL_YEAR · accidental encounter | Repair, unload, fetch help, or move slowly → graded cargo/transport result | Driver and child are safe while wagon, cargo, and daylight compete. |
| Across the Floodplain | SEVERE · SPRING · witness/helper | Water spreads across separate mounds → choose people, cart, or sheep | A rising broad flood changes the available ground during play. |
| The Cave Before the Storm | HIGH · ALL_YEAR · shelter decision | Read animal sign and flood marks → enter, withdraw, or risk a dry ledge | The cave is both animal den and known runoff channel. |
| The Lost Survey Party | HIGH · ALL_YEAR · requested search | Notebook, prints, creek, and signal clues split the search | A clue is used to decide where not to search; retreat is valid. |
| Three Days to the Railhead | HIGH · ALL_YEAR · injured companion | Litter, borrowed cart, owned horse, split party, pacing | Transport and patient condition shape a multi-day evacuation. |
| Whiteout | SEVERE · WINTER · group already exposed | Navigation by bearing, windbreak, posts, rope, or waiting | Rope keeps companions together; a compass gives direction, not footing. |
| The Last Rope | SEVERE · ALL_YEAR · rescue witness | Inspect anchor, spend the rope, take a stone route, or call a crew | The single line cannot safely serve the rescuer, porter, and cargo. |
| The Empty Cabin | LOW · ALL_YEAR · shelter found | Read a note, follow prints, wait, or leave | A quiet shelter mystery has no compulsory danger or stolen supplies. |
| The Long Way Around | HIGH · ALL_YEAR · courier-by-circumstance | Route commitment changes later terrain, parcel risk, and daylight | The story explores consequences after the route has already been chosen. |
| River without a Bridge | SEVERE · ALL_YEAR · blocked courier route | Find ford, ferry, work skiff, signal, or risk the current | A vanished bridge creates a route and communication problem, not a bridge repair. |
| Night on the Ridge | HIGH · ALL_YEAR · solo exposure | Descent versus lightning shelter, then injury-aware movement | The climax is shelter placement during a storm, not rescue. |
| The Markers Stop | LOW · ALL_YEAR · navigation curiosity | Inspect, follow work stones, find old path, or return | The marker gap has ordinary explanations and no hidden crisis. |
| The Ice Gives Warning | SEVERE · WINTER · witness before an accident | Warn a cart traveler; use a gravel bend or dry mill road | Preventive rescue avoids repeating an under-ice victim scenario. |
| The Washed-Out Cut | HIGH · ALL_YEAR · road blockage | Signal across, traverse upper lip, wait for repair, or retreat | The gap is a collapsed hillside cut with a foot route but no cart route. |
| The Wrong Valley | MODERATE · ALL_YEAR · route error discovered | Infer direction from sun/water/slope; choose farm road, notch, or tracks | An unknown valley can still offer a safe exit. |
| The Rocks Start Moving | SEVERE · ALL_YEAR · observed rockfall | Short high-pressure warning / recess / retreat / rescue | A stone recess and clear retreat race a visibly moving slope. |
| The Tree across the Creek | HIGH · ALL_YEAR · improvised crossing | Test trunk, secure line, throw pack, ford, or return | The fallen tree may work once but is never assumed to be a bridge. |
| The Abandoned Camp | MODERATE · ALL_YEAR · incidental discovery | Compare tracks, call, follow one trail, leave property, or take food | Absence is not automatically a crisis; ownership choices still matter. |
| The Wind Changes | HIGH · ALL_YEAR · environmental sign | Read ash/birds, leave, signal farm, or risk late warning | Fire is inferred from wind and animal movement before smoke appears. |
| The Load Must Go | HIGH · ALL_YEAR · hired freight by circumstance | Sacrifice oil or bedding, brace, wait, save the driver, or risk the wagon | The choice names the cargo cost rather than silently losing a load. |
| Hold until Morning | MODERATE · ALL_YEAR · night shelter | Stay put, answer, investigate along a high path, or return | Waiting is a substantive safe choice; the light proves ordinary by dawn. |

No new persistent Gear or mundane Supply was added. Existing rope, compass, lanterns, signal devices, wheel wrench, wedge, blankets, bandage, and character-owned horse alter specific routes. Injury uses the existing persistent health value; no separate medical or contact system was invented. Favor/referral callbacks use character history and knowledge fields where the fiction supports them. Owned-horse access is optional, and no asset is silently removed. Sacrifices and losses are explicit in the authored choice effects.

Do not make a universal scenario template. The framework measures variety and reveals gaps; flexible scenario data remains the authoring medium.

