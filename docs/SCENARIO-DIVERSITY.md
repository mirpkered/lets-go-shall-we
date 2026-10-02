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

Season is explicit metadata (`Scenario.diversity.availability`): ALL_YEAR, a named month, broad season, or CUSTOM with explicit months. Optional month/day bounds and a bounded selection boost leave room for future date windows. Current random selection reads the browser’s local month and performs a metadata filter; it does not call a service. October and December tags mean the entire month, not only a single holiday date. Out-of-season stories are ineligible; a modest per-scenario seasonal boost is applied only after category and risk weighting, capped so a seasonal story cannot overwhelm the pool. New games are filtered; active saves and earned property/rewards are untouched.

QA can temporarily override the effective selection month and directly launch any registered seasonal adventure at any time. The override is held in QA UI memory only, not in player saves. A seasonal scenario can later be offered in an explicit archive without changing its normal-rotation availability.

An ALL_YEAR entry may declare `affinityMonths` to receive its `weightBoost` only in those months while remaining eligible in every month. October affinity therefore enriches October selection without acting as a lock. It uses the same category → risk → replay weighted selector; it does not bypass category balancing, current-traveler replay pressure, or recent-scenario exclusion. The QA seasonal panel names the effective boost for its selected month. The Halloween expansion uses a modest 1.35 boost in October and 1.0 otherwise. The only October-locked premises are **The Jack-o’-Lantern Contest**, **All Hallows at the Boarding House**, **The Masked Visitor**, and **The Halloween Dare**, each dependent on a locally observed Halloween gathering, contest, or dare.

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

Existing clearly seasonal entries: First Snow (WINTER), The Thaw (SPRING), Before the Frost (AUTUMN), and New Year’s Eve (DECEMBER). Autumn, winter, spring, and year-round stories remain distinct; a seasonal setting does not make a story supernatural. October content space may include peaceful harvest/fair stories, masks, bonfires, eerie roads, burial places, skeletons, revenants, monster hunts, rituals, mini-dungeons, or comic misunderstandings. December space may include community gatherings, deliveries, winter travel, lodging, charity, folklore, supernatural visitors, danger, and quiet festive stories. These are possibilities for future batches, not a generated queue or a requirement that each theme be used.

## Library audit and future batches

The QA panel’s “Generate library diversity report” builds one row per registered adventure, including stable ID, title, all metadata, scene count, and choice-count signature. It also reports tag distributions, likely metadata near-neighbors, and repeated choice-count shapes. Similarity uses shared metadata dimensions; the structural warning compares scene count and choice-count sequence. Neither is a rejection: distinct authored decisions may justify overlap. This O(n²) comparison is audit-only and never runs during Begin Adventure.

### Current gap snapshot

The first generated snapshot for 175 registered adventures (2026-10-01) is a prompt for human review, not a definitive score. Tags overlap, and legacy keyword classification can mistake a passing mention for a central activity. The QA report is the current data source.

- **Risk:** 111 LOW, 35 MODERATE, 20 HIGH, 9 SEVERE. Low-risk stories dominate by count, while meaningful lethal danger remains a smaller share.
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

