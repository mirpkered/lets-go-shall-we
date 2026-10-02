# Roadmap

This is an actionable project roadmap, not a transcript of every proposed idea. Status is based on the checked-in source and tests; see [Current Systems](CURRENT_SYSTEMS.md) for implementation detail. No dates or delivery promises are implied.

## Now — trust and validate the expanded library

- Continue hands-on playtesting across the 301-adventure library; fix confirmed continuity, state, fairness, save, payoff, and reward defects surgically.
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
