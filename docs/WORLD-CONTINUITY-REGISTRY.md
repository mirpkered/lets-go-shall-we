# World Continuity Registry

A concise authoring reference for high-value established connections. This is not an exhaustive NPC database or an alternate canon source: verify details in the linked scenario and item definitions before reusing them. Identical names are not proof that two characters are the same person. Update this page only when an element is likely to support a meaningful future callback.

## Places

| Established place | Current source | Continuity notes |
| --- | --- | --- |
| Miller’s Crossing | `src/scenarios/lastLightAtMillersCrossing.ts` | A crossroads where the traveler may investigate an overturned wagon and search for Mara. No wider regional map is established here. |
| The Lantern House | `src/scenarios/noVacancy.ts`; `src/scenarios/theLastRoom.ts` | The same named inn appears in both adventures. No Vacancy names Ada as innkeeper; The Last Room leaves its innkeeper unnamed, so do not assume identity without an authored link. |
| Alderbrook | `src/scenarios/theEmptyCradle.ts` | A small settlement where Nessa went missing. It can recognize a current character with `found_missing_child`; fresh travelers receive the ordinary account. |

## People and name cautions

- No cross-adventure NPC identity is currently designated here as a canonical recurring person. Scenario files contain both fixed names and run-randomized name pools; inspect them before assigning a name.
- Ada is the named Lantern House innkeeper in No Vacancy. The Bridge Out randomized `travelerOne` pool also contains Ada; treat that as a different person unless a future edit explicitly establishes otherwise. Avoid extending this collision to new NPCs.
- Within an adventure, do not infer a recurring identity from repeated names unless the narrative makes the connection clear.

## Character-history hooks

Use only if the active character still has the flag, and keep the response specific to the recorded action.

| History flag | Source / meaning | Good callback scope |
| --- | --- | --- |
| `found_missing_child` | The Empty Cradle; found Nessa | A family may remember a prior missing-child search. |
| `organized_emergency_shelter` | No Vacancy; helped organize shelter | Inn staff may remember practical help during a shelter crisis. |
| `gave_up_shelter_for_other` | No Vacancy; yielded a safe place to another traveler | A directly relevant host may remember that choice. |
| `rescued_person_from_fire` | Burning Loft; helped someone escape a fire | A nearby worker may have heard of that specific rescue if word could plausibly travel. |
| `rescued_trapped_traveler` | The Road Below; freed a person trapped in a collapse | A work crew may recognize the specific rescue, not a general reputation. |
| `stabilized_road_collapse` | The Road Below; helped brace a road collapse | A later road crew may know the road was stabilized. |
| `finder_took_watch_from_{{owner}}` | Finders Keepers; kept a named owner’s silver pocket watch | A matching owner/claimant can recognize that exact watch and its provenance. |
| `saved_wagon_cargo_after_breakdown` | Broken Wheel; protected cargo after a wagon breakdown | A relevant carrier may recall this work if they plausibly heard of it. |
| `sat_with_a_fevered_boarder` | The Long Night; sat with an ill boarder while help was arranged | A later caregiver may recognize the practical act, not infer medical skill. |
| `helped_deliver_a_private_telegram` | The Telegram; carried a private message discreetly | A callback may note the delivery without revealing its private contents. |
| `escorted_a_disputed_debt_claim` | To the Magistrate; accompanied a willing clerk to have both accounts heard | This records a peaceful escort, not a legal judgment or enforcement role. |
| `shared_a_memory_at_a_wake` | The Wake; offered a modest memory during a neighbor’s wake | A callback belongs in a related remembrance, not as a reputation. |
| `contributed_to_a_community_supper` | The Church Supper; contributed one coin to the shared meal | A local organizer may recall the contribution without treating it as status. |
| `worked_a_half_day_at_the_forge` | At the Forge; helped with safe shop tasks | A smith may remember useful labor, not treat the traveler as a trained smith. |
| `shared_new_year_supper_on_the_road` | New Year’s Eve; shared a road story at an inn supper | A later guest may recall the shared evening only with plausible contact. |
| `returned_a_found_locket_to_its_owner` | The Locket; returned a modest found keepsake | If the owner is specifically established later, acknowledge this exact return. |
| `kept_an_unidentified_found_locket` | The Locket; kept an unclaimed locket without learning its owner | Do not invent the owner or imply the traveler knows who lost it. |
| `shared_supper_with_a_homesick_traveler` | Supper for Two; shared a meal and listened to an immigrant traveler | A callback may recall the meal, not claim a lasting bond absent further play. |

Character-history flags are behavior records, not scores. The lists in source are broader than this short index; search the scenario definitions before adding or using a flag. History is character-specific and does not transfer after death, abandonment, or retirement.

## Distinctive item provenance and unusual continuity

| Item | Established origin / identity | Current continuity boundary |
| --- | --- | --- |
| Silver Pocket Watch (`foundPocketWatch`) | Finders Keepers; engraved with a run-randomized former owner’s name | Exact owner history is recorded; A Borrowed Coat can respond to a matching claim. Do not identify a different owner or assume theft. |
| Grave Coin (`graveCoin`) | For Whom the Bell Tolls; silver funeral token found with the handbell | A keepsake with a narrow response in The Grave Bell; it is not a general supernatural detector. |
| Yew Charm (`yewCharm`) | For Whom the Bell Tolls; ward tied with the priest’s red thread | A quiet, narrow response in The Grave Bell; preserve the red-thread description. |
| Bronze Mask Fragment (`bronzeMaskFragment`) | For Whom the Bell Tolls; fragment from the old burial’s masked keeper | Its purpose remains unknown; Strange Roads does not use it as a universal solution. |
| Crimson Signal Lens (`signalLens`) | All Aboard!; thick red glass from an old railway signal | The Lantern in the Marsh offers one restrained, uncertain response. |
| Brass Room Key (`brassRoomKey`) | The Last Room on the Left; old inn key with its number worn smooth | A modest memento; the key is not interchangeable with location-specific keys. |

## World events and current callback cautions

- Last Light at Miller’s Crossing records `searched_for_missing_traveler`. Its current history-conditioned opening uses the phrase “reputation for careful searches,” which is broader than the specific flag supports. If that scene is next revised, prefer a modest report that someone heard about that particular earlier search; do not imply fame or success.
- The scenarios include recurring motifs and narrowly supernatural item reactions, but no mandatory chronology or global event plot. Keep each adventure understandable if it is the player’s first.
- No other public event is promoted here to region-wide news without checking how many people witnessed it and how word could travel.

## Source of truth

Scenario titles, names, randomized pools, locations, exact history flags, item definitions, acquisition choices, and provenance live in `src/scenarios/` and `src/items.ts`. This registry is an index and warning list, not permission to change established facts.
