# Roadmap

This is an actionable project roadmap, not a transcript of every proposed idea. Status is based on the checked-in source and tests; see [Current Systems](CURRENT_SYSTEMS.md) for implementation detail. No dates or delivery promises are implied.

## Now — trust and validate the expanded library

- Continue hands-on playtesting across the 445-adventure library; fix confirmed continuity, state, fairness, save, payoff, and reward defects surgically.
- Use QA content-quality, diversity, and selector diagnostics as review aids; manually verify high-confidence findings instead of treating heuristic warnings as failures.
- Track hands-on coverage separately from authored/test coverage so “registered” is not mistaken for “playtested.”
- Validate long-lived and fresh travelers through the 10/20 completion Gear-capacity milestones, death, abandonment, retirement, Bank, reward resolution, and legacy save migration.
- Playtest event-driven Gear wear, repair, upgrades, replacement, and Bank/death continuity across more items before expanding durability mechanics.
- Confirm deployment/configuration of the optional global Adventure Counter before describing it as live; the client requires a verified Worker URL in the production build.
- Keep current-state documentation aligned with code after each systems or large-content pass.

## Next — focused foundations

- Complete the next requested architecture audit against the documented system boundaries; fix only demonstrated issues and preserve local-save compatibility.
- Improve the Journey Record / traveler-history presentation if playtesting shows the current status and accumulated continuity are hard to understand.
- Review persistent callback quality: History/Knowledge flags should be specific, reusable, and surfaced only when the current traveler learned them.
- Continue item/reward economy review using fictional provenance and distinct function; avoid reward quotas and redundant carryables.
- Keep testing mobile screens at 320×720 and 390×844; address confirmed no-scroll failures without shrinking text or touch targets.

## Later — accepted but not immediate

- **Precarious Start scenario lane — PLANNED / FUTURE, not implemented.** Revisit only after the current Deep Exploration pass, library-wide Scenario Depth & Substance Audit, and resulting stabilization/fix work are complete. The content queue stays closed to new feature/content implementation until then. A Precarious Start opens after ordinary safety has already been disrupted: the Traveler is already in an active problem, rather than merely being invited into someone else’s. This is a structural opening type, not a genre or a requirement to wake injured, amnesiac, or confused. Vary physical danger, social trouble, mystery/contradiction, resource trouble, environmental pressure, continuity-driven openings, time pressure, mechanical failure, travel problems, and supernatural ambiguity. “Wake up somewhere hurt and confused” is only one possible subset.
  - Candidate openings include realizing something is wrong mid-action; a missing resource at the worst moment; being trapped but fully conscious or already pursued; an on-screen injury or sudden illness; escalating environmental danger; a familiar place having changed; suspicious evidence on the Traveler; an accusation already underway; someone immediately depending on the Traveler; a prior choice already gone wrong; mechanical failure or social danger; impossible/altered surroundings; a dangerous object in hand; a prior promise becoming relevant; a clock already running; contradictory known facts; or realizing the Traveler made a mistake.
  - **Precarious Start Continuity Rule:** Never invent prior ownership, knowledge, obligations, injuries, relationships, promises, assets, or actions. Openings must be supported by this Traveler’s actual canonical persistent state and item identities. For example, missing rope requires that Traveler to own the relevant rope/cord; a missing horse requires the owned asset; a failing old injury requires that injury; a called-in favor requires the Contact/Favor; a reacting relic must be carried; used gear must currently be carried; and an already-open letter requires a legitimate letter/document state. If required state is absent, the scenario/variant is ineligible. Do not fake prior history or silently create temporary continuity.
  - Future eligibility may depend on Gear, Supplies, Relics, Owned Assets, injuries, Contacts, Favors, debts/obligations if implemented, carried letters/documents, known locations, prior History/Knowledge, and other persistent state. Use canonical IDs and respect relevant condition, upgrade, and damage state exactly. Do not add a parallel state or eligibility system where existing metadata/selector support can serve later.
  - The opening condition may itself be evidence (such as reduced condition, injury, missing item, contamination, suspicion, environmental danger, altered route, time pressure, unexplained object, or damaged Gear), but it must remain fair: give enough physical/contextual evidence to reason about what may have happened, allow initial assumptions to be wrong, and never punish the player for unknowable information.
  - Precarious Start can combine with Encounter, Adventure, or Deep Exploration and with crime, survival, comedy, mystery, supernatural, travel, social, rescue, historical, or seasonal content. Treat it as a structural opening type—not a genre silo; use current metadata cleanly if/when implementation is approved.
  - Approved future candidates (preserved, not scheduled for implementation): **The Missing Rope; The Wrong Wagon; The Bitter Supper; Smoke Before Dawn; The Broken Descent; The Empty Water Skin; The Locked Room From Inside; The River Took Something; The Rider Behind You; The Barricade That Wasn’t There; The Name in the Ledger; Blood on the Sleeve; The Key in Your Pocket; The Horse Is Gone; The Camp Has Been Moved; The Wrong Trail; The Last Ferry Is Already Loose; The Train Is Not Slowing; The Lantern Goes Out Below; The Package Starts Moving; The Road Ends Behind You; The Well Water Tastes Wrong; Everyone Goes Quiet; You’re the One They Sent For; The Crowd Thinks You Saw It; The Door Locks Behind You; The Bridge Moves Underfoot; The Boot Is Missing; The Appointment You Don’t Remember Making; The Injured Stranger Knows Your Name; The Road Sign Is Impossible; The Clock Has Already Started; The Debt Comes Due; The Favor Is Called In; The Old Injury Gives Way; The Relic Reacts First; Someone Has Used Your Gear; The Horse Refuses the Road; The Letter Is Already Open; The Wrong Person Thanks You; The Town Is Expecting You.**
- Replace the five subdued home-scene SVG variants with distinct, recognizable illustrations and prevent immediate repetition across new sessions.
- Consider a lightweight PWA or native wrapper while keeping gameplay and saves client-side; no backend migration is implied.
- Consider richer structured Contacts/Favors, injury/recovery, or persistent-threat models only if repeated authored needs justify the additional state and migration burden. These are not implemented systems today.
- Revisit counter deployment and abuse limitations if a verified anonymous aggregate becomes a product priority.

## Maybe — exploratory

- Additional selection dimensions beyond the implemented category/risk/season/historical/replay weights.
- Shared world-state callbacks or collectible/curiosity systems beyond current character History/Knowledge and device-local state.
- Additional content lanes such as maritime/river, traveling show, industrial/rail-yard, medical/recovery, folklore, monster hunt, heist/infiltration, mystery/disappearance, or hospitality/inn stories. These are candidate themes, not committed queues.
- Analytics beyond the minimal anonymous completion aggregate.

## Done — major foundations in the current codebase

- Static GitHub Pages hosting under `/lets-go-shall-we/`, with no gameplay backend, accounts, cloud saves, or multiplayer.
- Data-driven forward-only scenario engine; local autosave/resume; fictional story time; death, abandonment, and retirement behavior.
- Five-slot persistent Bank for Gear/Relics; 1→2→3 Gear capacity milestones; typed Supplies, Relics, Assets, item condition, upgrades, repair, and safe ending-reward placement.
- Normal weighted scenario selection with seasonal eligibility, category recovery, risk pressure, historical-presence modifier, character replay penalty, and recent exact-scenario exclusion.
- Separate QA save with direct launch, state tools, selector simulation/diagnostics, seasonal override, diversity report, and content-quality audit.
- Scenario metadata and broad content foundations: commerce/property, community/domestic, work, animals, recreation, disputes, crime/noir-lite, comedy/absurdity, occult, survival/expedition, Halloween/October, Christmas/December, disaster/rescue, Western/outlaw, and treasure/exploration/lost places.
- Anonymous global counter implementation and deployment workflow; production activation remains unverified/configuration-dependent as documented in [Current Systems](CURRENT_SYSTEMS.md).

## Content pipeline status

The content families listed under **Done** are represented in the current registry; their presence does not mean every route has been hand-playtested. No additional named batch is marked queued by this roadmap. Older batch proposals and structural snapshots remain historical planning references unless explicitly moved into Now or Next. Seasonal locking and affinity are implemented, but future October/December stories are not presumed or scheduled.
