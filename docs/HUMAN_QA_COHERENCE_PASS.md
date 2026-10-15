# Human-QA Coherence Pass

Status: **IN PROGRESS — paused for separate semantic disposition**

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

### Separate semantic-disposition candidate — Supper with Strangers

- **Adventure:** `supper-with-strangers`
- **Scene:** `supperStories`
- **Route:** the road-topic variant directly tells the Traveler that a carter says the east road is dry after rain but the low ford may still be muddy.
- **Persistence:** the player must then select “Remember the east road and ford” to persist substantially the same fact; “Let the conversation drift on” leaves without it.
- **Why it needs separate handling:** the scene appears to establish the information before the meta-choice. This may be a route-proof/Knowledge persistence defect, not merely polish. Do not change the closed CRA ledger or repair this case as part of this coherence pass. First decide and document its semantic disposition under a separately authorized focused review.

This pass therefore does **not** claim an exhaustive, route-level review of all 861 Adventures. The wider candidate sweep paused at this semantic boundary. No other candidate was promoted from a search hit alone.

## Validation and delivery state

- Focused Shortcut and QA-content tests: **27/27 passed**.
- Full suite after the Shortcut false-choice repair: **130 files, 2,554 tests passed**.
- TypeScript and production build: **passed**; the known large-bundle warning remains.
- Inventory remains 861 Adventures, 74 Gear definitions, and 32 stable Knowledge facts (also exercised by the passing registry/inventory validation tests).
- Audit JSON parses and still reports the original audit as `COMPLETE`; the two post-audit findings remain separately represented. No historical finding or disposition was changed in this pass.
- `git diff --check`: passed after the report and ledger evidence update, before checkpointing.
- Weekly Scenario Batch remains paused. No scheduler change, push, merge, or deployment occurred.
