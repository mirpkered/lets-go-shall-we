# Human-QA Coherence Pass

Status: **IN PROGRESS — bounded coherence screen active; Last Stop semantic escalation repaired and reconciled**

This is a separate player-experience review. It does not reopen, renumber, or alter the completed 354-finding semantic audit. The original completion record remains intact; post-audit semantic discoveries stay in the ledger's separate `postAuditHumanQa` section.

## Review categories

- **HQ-C01 — Reward / choice naturalness:** technically valid reward choices that feel mechanically paired with unrelated labor or kindness.
- **HQ-C02 — False exclusivity:** choices that cannot meaningfully compete because actions can coexist or one is inevitable.
- **HQ-C03 — Gear provenance / physical-action clarity:** ownership, condition, location, actor, or physical means that are not sufficiently established or salient.

## Seed reviews

| Adventure | Category | Disposition | Evidence and action |
| --- | --- | --- | --- |
| The Dry Crossing Race — “The Judge Checks the Flour” | HQ-C01 | **Plausible / needs context** | The damp sack costs the announced blanket prize; the miller offers a one-coin partial purse or no payment. Helping reset the stones has a direct course-safety purpose for the next teams. The pairing may feel constructed, but the current scene gives the unpaid option a believable consequence. No change made. |
| The Shortcut — “Miles Saved” | HQ-C02 | **Confirmed and repaired** | After a successful shortcut, the scene has already established the ridge, stones, and junction. “Pause to take in the view” and “continue along the road” were not competing actions; continuing was effectively inevitable. The observation now resolves as an ending without a final choice. The firm-ridge Knowledge is granted at successful route completion, not through an optional “remember” choice. Failure and established-road routes still do not receive it. |
| Paper Boat at High Water | HQ-C03 / post-audit semantic | **Ownership defect repaired; physical clarity needs context** | The earlier shared-builder text claimed “your Waterproof Ledger Tube” for a fresh Traveler before an optional post-handoff Gear reward. New post-audit finding CRA-F0362 records that semantic defect separately from the completed audit and its repair. Current narration is neutral when the item is absent and distinguishes owned usable from owned BROKEN Gear. The flooded shortcut remains gated on carrying a usable tube. The tube is offered only after a completed handoff as an explicit optional part of pay, with its source described in the reward ending; acquisition presentation was not otherwise changed. The runner/signal physical means were screened but no additional definite defect was established; retain as a needs-context prompt for live QA. |

## Broader source-pattern screen

A lexical screen of scenario source covered “remember,” “pause,” “continue,” view-taking, payment/decline, runner/signal, and named-Gear narration patterns. Search hits were treated as leads, not findings. A concrete stop candidate emerged before further discovery:

### Supper with Strangers — focused post-audit disposition

- **Adventure:** `supper-with-strangers`
- **Scene:** `supperStories`
- **Route:** the road-topic variant directly tells the Traveler that a carter says the east road is dry after rain but the low ford may still be muddy.
- **Persistence:** the player must then select “Remember the east road and ford” to persist substantially the same fact; “Let the conversation drift on” leaves without it.
- **Route-truth review:** the Traveler directly hears the carter's qualified report, but does not independently verify the road or ford. The saved sentence is explicitly attributed (“A carter said…”) and preserves the uncertainty (“might still be muddy”); it is one-off free-text memory, not a new stable Knowledge fact. The `rememberRoadSupper` choice therefore records deliberate retention of uncertain testimony rather than converting it to objective road truth. The other topic variants similarly gate their own account/memory. The listener can also leave the conversation without retaining it.
- **Disposition:** **no semantic defect (Outcome B)**. No source or ledger change is warranted. The persistent-memory choice is a meaningful roleplay/retention option, not enough evidence of a false-exclusive or misleading action by itself. The original audit remains closed and unchanged.

This pass does **not** claim an exhaustive, route-level review of all 861 Adventures. A lexical screen generated leads, but only candidates documented here received focused review; no other candidate was promoted from a search hit alone.

### Additional focused coherence leads screened

| Adventure / route | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| The Locket — keep / remember / return | HQ-C02 | **No confirmed false exclusivity; optional polish** | After choosing to keep the found locket, the Traveler may retain a short memory of where it was found or reverse course and leave it with the market keeper. These are distinct outcomes (keep versus return); the memory record is a deliberate roleplay choice, not an assertion that the earlier discovery did not happen. The extra memory-only step may feel small, but source alone does not establish a misleading or materially non-competing choice. |
| The Children’s Court — replay, shared turns, or let the children choose | HQ-C02 | **Plausible / coherent** | The branches offer different ways to settle or leave the dispute. Replay can remain inconclusive; shared turns settle only the next turn; or the children choose their own rule. The endings preserve uncertainty about the original shot rather than pretending it was proven. |
| Dear Mary — dictation, phrasing help, or decline | HQ-C02 | **Plausible / coherent** | The routes differ in the Traveler’s role, and the letter’s author retains control over wording, final sentence, and whether to send it. Their outcomes do not collapse into one inevitable action. |
| Supper for Two — listen, share a story, ask about a letter, or sit quietly | HQ-C02 | **Plausible / coherent** | These routes lead to distinct conversation, errand, and departure outcomes; the offered actions cannot all be performed in the same short interaction. No route promises a result that another inevitable choice then erases. |
| The Long Carry — posted purse versus a foreman’s method demonstration | HQ-C01 | **Plausible / intentional exchange** | The safe-finish and late-finish scenes offer the posted material payment or, instead, a requested demonstration. The lesson option is unavailable once the Traveler has already learned the method, and its result accurately describes the foreman demonstrating it. |
| The Lookout at Dusk — helper compensation | HQ-C01 | **Plausible / needs live context** | After the foreman brings the injured survey hand back, the Traveler may accept the announced glasses prize, take a one-coin helper’s fee, or decline material compensation. The choices read as alternative compensation for the same interruption/help, not unrelated labor. Whether the glasses or coin feels proportionate is a player-experience question; no source-level semantic defect was established. |

These are bounded source reviews of the listed choice/result families, not a library-wide route audit. No gameplay, test, or original-audit disposition change was justified by these candidates.

### Shared assistance-and-settlement builder screen

**Candidates screened: 24 caller cards** in `adventurerSupportGenreBatch.ts` (`glass-road`, `saw-before-sunrise`, `chain-of-sight`, `three-points-down`, `the-mule-load`, `pilot-hole`, `daylight-flags`, `the-unseated-winch`, `the-silent-hound`, `the-iron-claim`, `the-flooded-chest`, `the-roofline`, `the-blind-cut`, `the-old-pulley`, `the-rail-shed`, `the-wet-powder`, `the-brush-line`, `the-missing-brace`, `the-wrong-cache`, `the-rough-water-watch`, `the-ash-frame`, `the-storm-marker`, `the-lamp-in-the-cut`, and `the-second-gunhand`). The common builder and its caller inputs were reviewed as one repeated HQ-C01/HQ-C03 pattern; this is a bounded template/caller-configuration screen, not a claim that every outcome in all 24 stories received a new route-by-route audit.

- **HQ-C01 — HEALTHY / INTENTIONAL at the shared-template level.** The helper reaches settlement after the card’s described work/consequence, then offers the scene’s separately explained spare Gear, its agreed coin amount, or leaving without compensation. The `gearSource` and custom `settlement` text explain why that item is available; the generic “agreed hand-off” button does not itself grant it unless chosen. The common menu does not require additional unpaid labor, and each option applies the work’s Knowledge regardless of compensation, consistent with learning already established by the completed work. The 24 caller-specific settlement explanations were checked for an evident unrelated task/reward pairing; none was promoted to a confirmed polish issue.
- **HQ-C03 — HEALTHY / INTENTIONAL at the shared-template level.** The shared preparation menu turns each caller’s kit entry into a choice, gates named owned tools where `requiresItem` is specified, and appends caller-authored consequences to the complication. The handoff result uses each caller’s `gearSource`; the actual inventory gain is confined to the explicit settlement choice. Representative physical routes checked include `glass-road` (call/wait, circle by the eastern slope, or signal the nearby naturalist), `daylight-flags` (station clerk, flags, or a courier physically walking to the station), `the-roofline` (ladder tied to the porch, ground cover, or moving bedding), and `the-unseated-winch` (sound piling, release to fenders, or use of the gangplank). Actors, equipment ownership, and physical means are stated in the scene inputs; no new clarity defect was established in this template screen.

### Post-audit semantic repair — Last Stop Knowledge persistence

- **Adventure:** `last-stop`; finding CRA-F0002 (the existing repaired C0001 finding remains untouched).
- **Current-source witness:** `passengerCar.conductor → conductorCar`. Before any choice is made, the displayed scene gives the complete reliable procedure: “Handwheel vents the brake line: turn, hold, lock. Never wrench it loose all at once.” This entails the same operational fact as `KNOWLEDGE_FACTS.baggageBrakeHandwheel`: “The baggage-car handwheel can vent the vacuum brake line if it is turned, held, then locked.” Nevertheless, only `conductorCar.learn` (“Remember the procedure”) currently grants that stable Knowledge fact and sets `learnedBrake`; choosing `inspectKey`, `service`, or `seat` leaves the scene without it. The later `conductorExplains` text repeats that Vale explains the procedure, but it is reachable only after choosing `learn`. Separately, `serviceCar.studyBrake` grants the fact after the diagram is studied.
- **Route-proof finding:** the route establishes that the Traveler was told the full, reliable handwheel method before the optional persistence choice. The route does not establish whether the Traveler consciously rehearsed or deliberately committed it to memory; however, the current stable Knowledge entry represents knowing the fact, not a separate act of memorization. The displayed teaching therefore precedes and does not depend on the “Remember” choice.
- **Focused test review:** `src/scenarios/lastStop.test.ts` verifies the emergency route by explicitly choosing `learn`, then uses that Knowledge for `knownMethod`. Its other Last Stop assertions cover ending truth, route state, save/reload for unrelated flags, and physical choices. It has no assertion comparing Knowledge after the conductor’s displayed instruction when the player selects `learn` versus `inspectKey`, `service`, or `seat`; no existing test resolves this persistence boundary.
- **Disposition:** **CONFIRMED POST-AUDIT CRA-C0002 DEFECT — REPAIRED as CRA-F0364 (MEDIUM).** The existing stable Knowledge fact is now granted on both transitions that first show Vale’s complete procedure. The choice-only “Remember the procedure” gate and redundant explanation-only scene were removed; the meaningful key, service-car, and return-to-seat choices remain. The service-car diagram remains an independent acquisition route. No stable Knowledge definition or save schema changed.
- **Regression evidence:** `lastStop.test.ts` verifies Knowledge exists on entering `conductorCar`, persists after each remaining sibling choice and save/reload, is granted through the post-surveyor conductor entry and diagram study, and remains absent on a route that never reaches Vale’s teaching. The existing CRA-F0002 passenger-contribution route regression remains intact and passes.
- **Audit boundary:** CRA-F0364 is recorded in the separate `postAuditHumanQa` section under CRA-C0002. The original 354-finding audit closure, original finding set, and CRA-F0002 disposition remain unchanged. No new CRA cluster was needed.

The Last Stop semantic issue is resolved. The bounded HQ-C01/HQ-C03 screen may resume from the point where this candidate interrupted it; previously completed seed reviews remain complete.

## Validation and delivery state

- Focused Shortcut and QA-content tests: **27/27 passed**.
- Supper with Strangers, Traveler Memory, memory-presentation, and library-audit tests: **17 tests across 4 files passed** after the focused Outcome B disposition.
- Bounded screen validation: QA long-press, library-audit, and inventory/presentation tests: **26 tests across 4 files passed**; these confirm the existing QA entry and inventory behavior remain intact.
- Full suite after the Shortcut false-choice repair: **130 files, 2,554 tests passed**.
- TypeScript and production build: **passed**; the known large-bundle warning remains.
- Inventory remains 861 Adventures, 74 Gear definitions, and 32 stable Knowledge facts (also exercised by the passing registry/inventory validation tests).
- Audit JSON parses and still reports the original audit as `COMPLETE`; three post-audit findings remain separately represented. No original finding text, ID, or disposition was changed in this repair.
- The Last Stop issue is recorded as post-audit finding CRA-F0364, separately from the original 354-finding closure; all 357 current live findings are dispositioned and 0 remain open.
- Focused Last Stop, engine, Traveler Memory, memory presentation, storage, library audit, and inventory tests pass (**93 tests across 7 files**). Full suite passes (**130 files / 2,561 tests**); TypeScript and production build pass with the existing bundle-size warning. Full validation and delivery state are recorded in the current audit status document.
- Weekly Scenario Batch remains paused. No scheduler change, push, merge, or deployment occurred.
