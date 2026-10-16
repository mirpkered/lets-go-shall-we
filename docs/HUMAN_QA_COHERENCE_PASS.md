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

### Coherence-screen continuation — farm compensation and physical tool actions

After resolving the Last Stop semantic escalation, the bounded HQ-C01/HQ-C03 screen resumed with three live agriculture/ranch stories. These are focused source-path checks, not a new audit of the family.

| Adventure / route | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| The Cut Wire at Ash Pasture | HQ-C01 / HQ-C03 | **Plausible / coherent** | The Fencing Pliers option is available only when carried and usable; farm wire/staple is an alternative, while following the rut first leaves the fence gap open until the Traveler returns. The rush route has its own non-reward danger result. Only after the fence is made safe and the yearling is returned does the owner offer the announced two-coin wage or a personally owned pliers pair. No payment/tool reward is attached to the partial or danger outcomes. No ownership or action-method ambiguity established. |
| The Feed Bin with the Blue Seam | HQ-C01 / HQ-C03 | **Plausible / coherent** | Separating the sack does not claim its contents or tally are known; asking to check the tally sets the specific proof used by the records variant. Only the miller’s inspection confirms the seed-grain mistake and replacement, after which one coin or an inventoried feed-crew Farm Whistle is offered. The whistle’s source and limited use are stated; the route does not claim it taming livestock. Return-unopened and stop outcomes remain separate and receive no inspection reward. |
| The Apple Row after Hail | HQ-C01 / HQ-C03 | **No confirmed defect; plausible / needs live context** | Lifting the net requires a carried, usable Travel Rope; covering picked crates is a non-Gear alternative, while pulling from the fence has a distinct stop result. Only the rope route sets `appleNetLiftedForInspection`, and the next scene preserves that difference across save/reload. After a successful retie, the owner offers two coins or inventoried orchard Fencing Pliers; their stated wire/tie function is plausibly related to securing orchard netting, though how natural that in-kind option feels is best judged in play. No unsupported Gear access or route-state claim was found. |

This continuation adds three bounded source reviews and no new audit finding. Their existing agriculture regression tests exercise the rope/tool gate, route-state contrast, save/reload, payment, and provenance behavior; no tests or gameplay were changed for this screen.

### Coherence-screen continuation — contest rewards, quiet choices, and animal-care logistics

The next high-signal screen selected explicit contest payouts and post-result menus in `competitionGearGenreBatch.ts`, then checked a small set of deliberately quiet choices and animal-care actions surfaced by the same lexical scan. This is not a review of every competition or animal story, and the previously screened Dry Crossing Race, Lookout at Dusk, and Long Carry were skipped.

#### HQ-C01 — reward / choice naturalness

| Adventure / route | Disposition | Evidence |
| --- | --- | --- |
| The Match at the Brace | **HEALTHY / intentional** | The hammer is an announced prize; the two-coin judge’s fee is separately named before the trial. Unsafe/no-winner and rebuild routes do not inherit the prize. |
| The Knot before the Bell | **HEALTHY / intentional** | The clamp is posted before the lift; the late coin is limited to the runner-up route, and intervening to steady the other team voids the round and returns entry tokens. |
| The Chain at Twenty Paces | **HEALTHY / intentional** | The chain/coin choice follows a corrected, documented measurement; withdrawal or refusing a false measurement returns the stake without pretending a result was won. |
| The Quarry Step | **CONFIRMED POLISH ISSUE — repaired** | The opening posts a Folding Trail Marker, but an unverified bell result also offered an unannounced two-coin “participation purse” despite saying the judge could not record a safe finish. Removed that unsupported payout; the unverified route now closes without a prize, while the marker remains available only with `quarrySoundLedge` proof. |
| Five Marks on the Board | **HEALTHY / intentional** | The marker/coin alternatives follow a confirmed winning score; runner-up purse, tie-break, shared fair-fund split, and no-prize outcomes have distinct standings and consequences. |
| The Millwheel Hand | **HEALTHY / intentional** | The toolkit is awarded only after locating the peg and safe restart; the two-coin trial fee is named at the outset as a result option. Stopped/forced-risk outcomes receive no tool prize. |
| The Blind Trail Marker | **HEALTHY / intentional** | The rope is the announced prize for identifying linked evidence; the coin is a stated alternative for a correct reading, while a wrong guess or declining to overstate evidence earns no prize. |
| The Saw before Supper | **HEALTHY / intentional** | The pry tool is conditional on the sound-end correction; unverified or failed cuts have no prize, and the source distinguishes a safe replacement/withdrawal from a counted result. |
| The Bell Rope at Ferry End | **HEALTHY / intentional** | The posted whistle is earned by noticing the real hazard; the small fee is explicitly offered after the rescue, and helping re-moor the punt is concrete follow-through rather than unrelated labor. |
| The Iron Squares | **HEALTHY / intentional** | The square or its coin value follows a diagnosis under the gate’s normal load; an untested or appearance-only answer cannot claim either. |
| The Load on the Siding | **HEALTHY / intentional** | The strap is limited to the first-place route; second place receives its posted runner-up purse, while disqualification, spill, and withdrawal remain unrewarded. |
| The Hammer and the Ribbon | **HEALTHY / intentional** | The steel wedge is awarded only for the confirmed leading score. Participation/helper coin options occur only after a safe turn or actual help securing the frame; withdrawal returns the entry token. |
| The Bet at the Water Wheel | **HEALTHY / intentional** | The single one-coin stake, one-round cap, exact return-plus-winnings, loss, free observation, and no-wager lesson are explicit; no repeat wager or invented prize appears. |
| The Rigging on the Roof | **HEALTHY / intentional** | The mirror is the posted safe-lift prize; work pay and the weather-delay fee are named in the applicable result, and the unsupported cracked-anchor route cannot collect them as a safe finish. |
| The Quiet Card Count | **HEALTHY / intentional** | One hand and the maximum stake are stated before play. On a win, the announced case or one coin is a coherent prize-value choice; the stake is returned exactly once. Watching or asking for the method does not create a prize. |
| The Harness Stitch Trial | **HEALTHY / intentional** | The repair roll is announced; the same finding is available as two coins or no material compensation after the weak stitch is found, while unsafe/late tests do not receive the award. |
| The Fair-Weather Reading | **HEALTHY / intentional** | The cloak’s two-hour condition and participant purse are stated before the forecast. Warning the parade and submitting a score are genuinely competing actions once time/risk is live; no forecast proof means no cloak. |
| The Ferryman and the Stake | **HEALTHY / intentional** | The missing marker requires agreement to a shortened course before a finish can claim the posted whistle or its coin value; a tie, stop, or unagreed finish gets neither. |
| The Silent Score Slate | **HEALTHY / intentional** | The clamp is posted for a correct safe diagnosis; two coins are explicitly offered for assistance at the matching result. Leaving during the retest or stopping an unsafe load does not receive a prize. |
| The Last Clean Spoke | **PLAUSIBLE / NEEDS CONTEXT** | The wrench is posted, while two coins are described as payment “for the repair work instead” after the practice-wheel repair. That can be a reasonable wage-versus-tool settlement, but the opening does not clearly establish a wage alternative; no source-only basis to call it a definite polish defect. |
| The Seven-Inch Square | **HEALTHY / intentional** | The square is an announced prize for a practical measurement judgment; coin value and declining compensation are explicit alternatives after the owner’s window is fitted. |

The Quarry Step change is isolated to the unverified result and has a route-contrast regression. It does not change the safe-ledge proof gate, hazard outcome, or posted marker reward.

#### HQ-C02 / HQ-C03 — focused quiet-choice and physical-action candidates

| Adventure / route | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| The Swimming Hole — shore curiosity / departure | HQ-C02 | **HEALTHY / intentional** | Swimming, resting, looking along the shore, and leaving are different uses of a quiet stop. The shore result has a separate keep-or-leave choice because keeping the glass/stone changes the object state; “continue” is a complete departure, not an inevitable sibling action. |
| Skipping Stones — `bankCuriosity` | HQ-C02 / persistence watch | **POSSIBLE SEMANTIC DEFECT — ESCALATE** | The Traveler has already inspected the bank and the variant has established a feather, pottery shard, or no find before `rememberBankFind` (“Keep the little moment in mind”) versus `leaveBankFind`. Only the first records `noticed_a_small_riverbank_curiosity`. This may be a deliberate optional diary/roleplay choice, but the flag describes the already-completed observation; disposition needs a focused semantic determination. No source, test, or ledger change made in this area. |
| The Calf in the Mud — rope, boards, helper, and handoff routes | HQ-C03 | **HEALTHY / intentional** | The opening establishes firm footing, an approaching farmhand, and time for care. Rope is gated on carried, usable rope; gloves are independently gated for the wet-line method; boards and calling/handing over to the household remain actionable fallbacks. Failed pulls pause with the calf supported, and further attempts/handoff are explicit. |
| The Injured Dog — bandage offered to handler | HQ-C03 | **PLAUSIBLE / NEEDS CONTEXT** | The dog refuses touch; the player can back away or leave the bandage with the resident, who has said they will fetch the familiar handler. The handoff is plausible, though the transition does not separately narrate the resident carrying the bandage to the handler. No unsupported treatment or healing is claimed. |
| The Dog That Returns — owner variant / `dogHelped` | HQ-C03 / route-truth watch | **POSSIBLE SEMANTIC DEFECT — ESCALATE** | With `dogReason=owner`, `dogTruth` says the traveler with the twisted ankle asks for a message to the next farm. `offerPracticalHelp` only records `offered_help_after_following_road_dog`; the shared ending asserts “You leave a message” without naming the recipient or an explicit delivery action. The existing no-person/no-object repair is preserved, and the bundle variant remains correct. This may be implied by accepting the request and continuing down the road, but current source leaves delivery proof/means underspecified. Do not alter this Adventure pending semantic disposition. |

The two semantic candidates above are not added to the semantic ledger under coherence-pass authority. They do not undermine the independent contest-reward screen; they are recorded for explicit later disposition and the affected Adventures are otherwise left untouched.

#### Checkpoint validation and delivery

- Candidate tranche: **26 unique Adventures** — 21 HQ-C01 contest/reward stories, 2 quiet-choice HQ-C02 stories, and 3 HQ-C03 animal-care/physical-action stories. The already documented Dry Crossing Race, Lookout at Dusk, and Long Carry were skipped.
- HQ-C01 dispositions: **1 confirmed polish issue repaired**, **1 needs context**, **19 healthy/intentional**.
- HQ-C02 dispositions: **1 healthy/intentional**, **1 possible semantic candidate escalated**.
- HQ-C03 dispositions: **1 healthy/intentional**, **1 needs context**, **1 possible semantic candidate escalated**.
- Semantic candidates: **2** (Skipping Stones observation/history persistence; Dog That Returns message-delivery route truth). They remain outside the semantic ledger and are not included in the original 354-finding closure.
- Shared mechanisms investigated: the competition scene/result constructors were checked through their actual callers; no shared helper change was needed. Prize/fee evidence remained caller-specific.
- Polish repair: The Quarry Step’s unannounced two-coin payout was removed only from the result lacking proof of a safe route. Regression confirms that the direct bell route has only the no-prize close option; existing safe-lower-ledge award coverage remains intact.
- Focused tests: **53 passed across 3 files** (competition, animals, pleasant-day stories).
- Full suite: **130 files / 2,561 tests passed**, including QA long-press/storage coverage, registry validation, inventory validation, and the semantic library audit.
- TypeScript and production build: **passed**; existing large-bundle warning remains.
- Semantic ledger JSON parses and remains unchanged: original audit **354 findings, 0 open**; post-audit total **357 live findings, 0 open**. No finding ID, disposition, audit classification, or CRA-F0002 record changed.
- Inventory remains **861 Adventures, 74 Gear definitions, 32 stable Knowledge facts**.
- `git diff --check`: **passed**. Local-only checkpoint; no push, merge, or deployment. Banner QA remains intact; Weekly Scenario Batch remains paused.

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
- Three additional agriculture/ranch HQ-C01/HQ-C03 candidates were source-screened after the Last Stop repair; no confirmed coherence defect or source/test change resulted.
- Weekly Scenario Batch remains paused. No scheduler change, push, merge, or deployment occurred.

### Bounded coherence continuation — focused dispositions and community / quiet-story screen

The continuation began from the clean checkpoint `06311037c6a68cb5fc1d82a31c2ac2be8b72006a`. The two previously escalated candidates were reviewed first against their current source and focused tests. Neither conclusion changes the semantic ledger or the original 354-finding audit.

#### Focused dispositions

| Adventure / route | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| Skipping Stones — `riverbank → bankCuriosity → rememberBankFind / leaveBankFind` | HQ-C02 / persistence watch | **HEALTHY / intentional** | `inspectRiverbank` leads to the variant text that establishes the feather, pottery shard, or no find before either choice. The optional effect is a run-history note, not stable Knowledge used to teach or recognize an actionable fact. The choice is explicitly about whether to keep a small, valueless moment in mind; declining it does not deny that the Traveler saw the bank. This is a deliberate memory/roleplay distinction, unlike the already repaired Shortcut and Last Stop cases where reliable, useful teaching had already occurred. No source or ledger change warranted. |
| The Dog That Returns — owner route `dogTruth → offerPracticalHelp → dogHelped` | HQ-C03 / physical-action clarity | **PLAUSIBLE / coherent; no current semantic defect established** | The owner variant says the awake traveler asks for a message to the next farm. `offerPracticalHelp` accepts that request as the help route, and its result resolves the chosen help: “You leave a message.” The destination is supplied by the request immediately before the choice; continuing down the road is a plausible delivery path. The generic ending alternatives also fit the other random variants (placing the bundle by its marker, or giving the family room). The choice’s `offered_help_after_following_road_dog` History records the offer, while the ending narrates the route result; no separate delivery flag is consumed or asserted later. Existing animal tests cover all random states structurally plus the bundle and no-person variants; they do not contain a dedicated owner-message assertion, but current source does not prove a contradiction. No source or ledger change warranted. |

#### Additional independent candidates screened

| Adventure / route | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| The Town Pump — inspect / tool repair / resident-tool repair / spring hauling | HQ-C03; secondary HQ-C02 | **HEALTHY / intentional** | Inspection, asking for a resident’s tool, using a carried usable multi-tool, fitting the residents’ spare peg, and hauling spring water establish distinct knowledge or actions. The owned tool is gated and resident-tool and water-hauling fallbacks remain available. The repair and immediate water supply are meaningful alternatives under time/work constraints, not a false choice imposed by an inevitable ending. |
| One Boat, Too Many People — first-trip order / wait / longer road | HQ-C01 / HQ-C02 | **HEALTHY / intentional** | The ferryman can make only two trips before worsening weather, while three people need passage. Asking about urgency, suggesting who goes first, waiting, or taking the longer road therefore competes over a stated scarce resource; the text does not imply consensus where only the Traveler suggested an order. |
| What Did You See? — `roadsideQuestion` observation → report choice | semantic escalation; Knowledge-persistence watch | **POSSIBLE CURRENT CRA-C0002 SEMANTIC DEFECT — ESCALATE** | On entry, the selected `cartIncident` variant directly says the Traveler saw the wheel strike a stone, saw gravel slide, or saw the driver pull the reins. Only the corresponding “Report …” choice grants a stable Knowledge statement explicitly phrased as what the Traveler saw; `declineAccount` leaves without that fact. The report choice changes whether the neighbors receive an account, but not whether the observation occurred. This is a precise candidate for separate semantic disposition; no gameplay, test, or ledger change made, and this Adventure was not modified. Existing `communityBatch.test.ts` covers the report and Knowledge-positive path but does not assert Knowledge at observation entry or compare it against declining to report. |
| The Burnt Barn Fund — donation amount / labor / decline | HQ-C01 / HQ-C02 | **HEALTHY / intentional** | The coin box and safe cold-debris work are both voluntary ways of helping, and the menu asks the Traveler to choose a contribution rather than claiming both are impossible. One- and three-coin amounts are explicit, labor is a concrete hour, and declining creates no penalty or false promise. No evidence makes the selected form of help feel mechanically invented. |
| Winter Stores — count / ration / seek trade / leave | HQ-C01 / HQ-C02 | **PLAUSIBLE / coherent** | The shared stores cover several weeks, no one is starving, and an uncertain wagon may arrive late. Counting, proposing a ration plan, or seeking trade are distinct interventions with different time and household consequences; counting preserves uncertainty rather than promising supply arrival. No automatic outcome or reward is invented. |
| Still Waiting — company / schedule / tea / message | HQ-C02 / HQ-C03 | **HEALTHY / intentional** | Staying until the train arrives differs from leaving before it; passing along an estimate, fetching tea, or asking whether to send a note have explicit, distinct outcomes. When a note is sent, the operator is the stated delivery actor and the text preserves uncertainty about whether it reaches the train. No physical handoff or result is asserted on the keep-the-note route. |

The six additional candidates above were chosen from the current community and small-human-moment modules after excluding Adventures already dispositioned in this document. They are focused source reviews, not library-wide coverage. The sole new escalation is `What Did You See?`; its issue is isolated from the two original candidates and does not undermine unrelated HQ-C01/HQ-C03 screening. Under the semantic-escalation boundary, it remains outside the audit ledger and must receive separate disposition before any source change.

#### Validation and checkpoint

- Focused candidates: **8** — two prior escalation leads plus six independent candidates.
- Dispositions: **5 healthy / intentional**, **2 plausible / coherent**, **1 possible semantic defect escalated**. Skipping Stones is intentional; The Dog That Returns has no reproduced contradiction; What Did You See? is the new escalation.
- No polish repair was justified in this tranche; the Quarry Step repair and its regression remain untouched.
- The requested test invocation ran the repository’s full Vitest suite rather than only the named files: **130 files / 2,561 tests passed**. This includes the focused animals, pleasant-day, community, and content-depth suites, plus registry, library-audit, QA, and storage-related coverage.
- No source, test, ledger, deployment, or scheduler changes were made. `CRA-F0002` and the original 354-finding closure remain unchanged. Weekly Scenario Batch remains paused.
