# Human-QA Coherence Pass

Status: **IN PROGRESS — focused semantic disposition complete; broader coherence screen resumed**

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

## Validation and delivery state

- Focused Shortcut and QA-content tests: **27/27 passed**.
- Supper with Strangers, Traveler Memory, memory-presentation, and library-audit tests: **17 tests across 4 files passed** after the focused Outcome B disposition.
- Full suite after the Shortcut false-choice repair: **130 files, 2,554 tests passed**.
- TypeScript and production build: **passed**; the known large-bundle warning remains.
- Inventory remains 861 Adventures, 74 Gear definitions, and 32 stable Knowledge facts (also exercised by the passing registry/inventory validation tests).
- Audit JSON parses and still reports the original audit as `COMPLETE`; the two post-audit findings remain separately represented. No historical finding or disposition was changed in this pass.
- `git diff --check`: passed for the current report update; the semantic ledger was not changed.
- Weekly Scenario Batch remains paused. No scheduler change, push, merge, or deployment occurred.
