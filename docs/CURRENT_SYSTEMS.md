# Current Systems

This is a code-checked summary of the implementation on `main`. For scenario-level inventories and audit limits, see [Adventure Library Status](ADVENTURE_LIBRARY.md) and the [ending/reward audit](LIBRARY-ENDING-REWARD-AUDIT.md).

## Play and persistence

- **175 registered adventures**, selected with soft risk-tier weighting. Normal play has no scenario picker. Selection excludes up to the five most recently ended scenarios; if that would empty a small eligible pool, the exclusion window is reduced until a choice exists. Traveler completion count and the latest eight completed/death risk tiers influence only selection weights; abandonment still enters scenario-repeat history, while QA uses a separate save and never changes player history.
- The internal LOW / MODERATE / HIGH / SEVERE classification describes authored consequences, not genre. Selection uses no fixed cadence and does not scale a selected story’s odds, enemies, or character stats. Full library assessment: [Scenario Risk Audit](SCENARIO-RISK-AUDIT.md).
- Adventure scenes are forward-only narrative moments. Scene visits, run-level randomized names/selections, flags, inventory, health, money, fictional elapsed time, and relevant event state are persisted for exact resume.
- Fictional time advances only through authored player choices. The UI does not advance it while reading or while the browser is closed.
- A living character starts at 10/10 health, may acquire character-specific history, lore, knowledge, money, and gear, and can die or be voluntarily retired. Death, retirement, and abandonment end that character; the persistent Bank is separate.
- Local browser storage is the save system. There are no accounts, cloud saves, multiplayer, or server-side gameplay. Save schema is still version 1; `src/storage.ts` applies safe defaults and targeted legacy migrations, including the legacy single-item carry alias and visited-scene/progression reconstruction.
- Four choices use the phone-oriented 2×2 grid; the interface adapts for fewer choices. The app includes Mirpworks launch splash, title-screen scene rotation, gameplay HUD, About, Contact & Feedback, Bank, reward placement, and retirement flows.

## Traveler continuity, rewards, and Bank

- Persistent carryables are item-specific; the current catalog has **44 carryable items**. Starting Small Knife and Lantern are run equipment, not carryable rewards.
- A traveler has one carry slot at 0–9 qualifying completions, two at 10–19, and three at 20+. An authored ending advances the count when explicitly substantive or when persistent carried gear or currency changed over the run; transition count is diagnostic only. QA and explicit abandonment do not count. The newly unlocked slot is available on the next adventure. Count resets with that traveler’s death, abandonment, or retirement; no stat levels or account progression exist.
- Character-bound owned property is tracked separately from inventory and the five-item Bank. It is visible under Owned property, uses no carried slot, and is cleared with that traveler.
- The Bank is item-only, survives death and character changes, and has a nominal capacity of **five**. Existing legacy over-capacity contents are preserved; deposits stop until space is made. Players can withdraw, swap, discard one item, or empty the Bank with explicit confirmation. Disposal is intentional and irreversible.
- At authored endings, a named persistent item reward can be carried (within capacity), deposited directly into available Bank space, or explicitly declined. Choose-one rewards remain exclusive. Full carry plus full Bank never silently overwrites or discards an item. Ending reward placement is not general Bank management.
- Money, lore, knowledge, and history belong to the living traveler. They are not bankable and are lost when that traveler is lost. Authored outcomes may grant wages, money, gear, information, history, relationships, or a quiet narrative payoff; not every adventure grants material reward.

## Randomization and optional incidents

- The normal selector uses the whole eligible adventure pool uniformly; category/theme sequencing is not implemented. The most recent five ended scenarios are excluded when possible. The list persists in the normal save. QA direct launches do not change it.
- Run-level NPC name selections are chosen at run start and saved; reload does not reroll them.
- Conditional incidents and time-aware text are authored in scenario data. Rare Easter eggs have a **2% per eligible scene-entry chance**, at most one per run, a local recent-seen list, and no gameplay, reward, knowledge, history, or progression effect. They do not establish crossover canon.
- Five title-screen illustrations are selected per browser session, with QA previous/next preview. The current SVG scenes are recognized as too subdued/abstract to read as five distinct illustrated destinations. A richer art pass and cross-session repeat prevention remain future work; the framework itself is implemented.

## QA and public/shared services

- `?qa=1` reveals direct launch for each registered scenario, explicit HIGH/SEVERE quick launches, current risk tier, recent risk history and next-selection tier weights, plus state inspection (scenario, scene, visited IDs, inventory, flags, money, health, history, lore, knowledge, Bank, time, progression, recent selections, and Easter-egg state); clear-run; reset-character; clear-QA-save; set health/time/completion count; force item into run/loadout; Easter-egg preview/toggle; and home-art preview. Normal play has none of these controls. QA uses a separate local key and suppresses progression/counter accounting.
- The global counter has a browser client, Cloudflare Worker + SQLite Durable Object source, idempotent run-ID submission, and a manual deployment workflow. The inspected checked-in production bundle contains no configured counter endpoint, so the counter is **implemented but not verified production-active**. Do not claim that a public total is live without checking the deployed build and endpoint. If configured, it receives only a random run UUID; authored endings count (including death and walk-away), explicit abandonment does not, and duplicate run submissions are idempotent. No identity, scenario, choice, inventory, or save data is sent. Failure is non-blocking and queued locally for quiet retry.
- Hosting is static GitHub Pages under `/lets-go-shall-we/`; no backend is required for play. The optional counter is the only service component and does not host gameplay or saves.

## Current verification snapshot

The last reported full run passed **792 tests across 52 test files**, with the production build succeeding. This is a dated verification snapshot, not a guarantee that every registered adventure has received hands-on playtesting. Check fresh test/build results before release.
