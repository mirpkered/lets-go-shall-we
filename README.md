# Let’s Go, Shall We?

A mobile-first, choice-driven text RPG prototype by Mirpworks. The current build includes 124 complete adventures across mystery, travel, work, community, commerce, animal, quiet-day, and supernatural themes, plus a reusable data-driven scenario engine, local autosave, character mortality, one-slot item continuity, and a death-proof bank.

## Run locally

```bash
npm install
npm run dev
```

## Verify and build

```bash
npm test
npm run build
```

The static output is written to `dist/`. `vite.config.ts` targets the `/lets-go-shall-we/` GitHub Pages project path.

## GitHub Pages

The canonical source lives on `main`. The verified contents of `dist/` are published from the `gh-pages` branch.

## Architecture

- `src/scenarios/`: data-only adventure definitions
- `src/engine.ts`: framework-independent requirements, effects, checks, combat, death, carry, and bank rules
- `src/storage.ts`: versioned local persistence
- `src/main.ts`: UI states and DOM rendering
- `src/styles.css`: phone-first presentation and action-grid rules
- `counter-service/`: the optional shared, anonymous adventure-completion aggregate (Cloudflare Worker + SQLite Durable Object)

## Traveler experience through survival

Each living traveler has a separate progression-completion count: an authored ending advances it only after more than five meaningful story transitions. Carry capacity is 1 item at 0–9 qualifying endings, 2 items at 10–19, and 3 items at 20 or more. Early authored endings still count toward the global community total, but not traveler milestones. This is practical preparation, not levels or permanent account progression; it resets when the traveler dies, is abandoned, or retires. The exact counting definition, milestone timing, and legacy-save behavior are documented in [Traveler Experience Through Survival](docs/TRAVELER-PROGRESSION.md).

## Bank disposal rule

Players may intentionally and permanently discard one banked item or empty the whole Bank after a clear confirmation. There is no undo or recovery. Disposal never happens automatically; the five-item capacity continues to preserve legacy over-capacity contents and blocks new deposits until reduced.

## Global adventure completion

When configured, the home screen displays **“Adventures completed by travelers: N”** after the shared total loads. The counter starts at `0` when its production service is first deployed; it does not estimate earlier local play. Every normal run reaching an authored terminal ending counts, including death and authored walk-away endings. Explicit **Abandon Adventure** does not count. Runs launched or manipulated in `?qa=1` do not count.

The home and resume screens choose one of five subdued illustrated scenes once per browser session. Refreshing or navigating between home and resume keeps that illustration; a new browser session chooses again. QA mode (`?qa=1`) adds Previous/Next preview controls on the home/resume screens. Gameplay keeps its existing background.

QA mode stores its test traveler and Bank under a separate local save key. QA launches and count/carry test controls therefore do not mark or alter a normal player’s saved run.

The browser sends only a random run UUID to the counter service. A single Cloudflare SQLite Durable Object stores the UUIDs and aggregate; a database primary key and insert trigger make repeated requests idempotent and serialize updates. No player identity, scenario, ending, choices, inventory, or save data is sent. Pending submissions stay in the local save and receive one quiet retry; gameplay never waits for the service. The counter URL is a public build setting (`VITE_GLOBAL_COMPLETION_COUNTER_URL`). Leave it unset for local development/tests; the UI remains unchanged and tests use mocks. Deploy `counter-service/wrangler.jsonc` with the **Deploy global completion counter** GitHub Actions workflow after adding the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Then set the public Worker URL as `VITE_GLOBAL_COMPLETION_COUNTER_URL` for the GitHub Pages build and publish the frontend. The counter is one shared total, not a player or win count. This is a narrowly scoped foundation, not a commitment to broader analytics.

## Scenario authoring rules

The linked [Connective Tissue / World Continuity Appendix](docs/WORLD-CONTINUITY.md) extends these rules for recurring people, places, history, events, and distinctive items. Its [continuity registry](docs/WORLD-CONTINUITY-REGISTRY.md) is a concise authoring aid; scenario files remain the source of truth.

- Important items, clues, and advantages must come from an explicit choice, a clearly narrated handoff, or a clearly described discovery. Avoid silent inventory grants.
- When a scenario supports multiple legitimate plans, explain each plan clearly and frame its risks consistently. Do not imply one is the intended answer; let the player weigh the tradeoffs.
- Story screens are one-time narrative moments. Scenario paths move forward and do not revisit a screen.
- Every scene should change the situation, reveal useful information, create risk, pay off an earlier choice, alter future options, or advance the central story. If it does none of these, consolidate or remove it.
- Character history is a small set of behavior flags, not an alignment score. It follows a living character across runs and is lost with that character; future scenarios can inspect it through choice requirements.
- **Traveler Narrative Frame:** the persistent character travels light, moves from place to place, takes work and opportunities as they come, and may help, refuse, or keep moving. They are capable, not automatically heroic or bound to a formal guild, rank, or profession. Vary adventure openings: hired, already traveling, stopping somewhere, coming across trouble, or beginning pre-arranged work. Coincidence is fine; do not over-explain. Every adventure must make sense for a fresh character. History may lightly flavor an opening or NPC reaction, but must not gate basic understanding or success. There is no global fame, reputation, alignment, or faction score; use relevant existing character-history flags selectively, and do not make every NPC recognize the traveler.
- **Canonical World Era / Period Consistency Rule:** the setting is a fictional pre-modern travel era inspired primarily by the late 19th century; its exact calendar year is unspecified. Keep its broad technological and social feel: railroads, horses, wagons, ferries, inns, mines, farms, lanterns, hand tools, printed notices, letters, manual machinery, and long-distance communication that takes time. Do not assume automobiles, personal telephones, radios, computers, GPS, internet, electronic alarms, electric flashlights, or modern emergency dispatch. Use direct speech, messengers, letters, bells, whistles, signal mirrors, lantern signals, or telegraph where a settlement actually has access. Let distance, weather, daylight, roads, animals, and mechanical condition matter without artificially increasing danger.
- **Historical Flexibility Rule:** this is historically inspired, not an exact-year simulation. Avoid obvious anachronisms, but do not reject a useful element over uncertain adoption dates if it broadly fits the era and does not create a modern-feeling solution. When exact accuracy conflicts with clear gameplay, preserve period feel and readability. Before introducing something unfamiliar, check transportation, lighting, communication, medicine, tools, buildings, infrastructure, terminology, and emergency response. Keep treatment accessible, the economy internally plausible rather than tied to exact historical prices, and firearms secondary to travel, judgment, problem-solving, and consequence.
- **Continuity Must Have Teeth:** across the adventure library, persistent characters, carried gear, money, and history must sometimes face meaningful risk. Mix low-stakes trouble with financial/property loss, item loss, NPC injury or death, player injury or death, safe walk-away choices, difficult rescues, and ugly tradeoffs. Not every story needs lethal danger, but long-term continuity should not be decorative.
- **Equipment Accessibility Rule:** an item in the character’s inventory is not automatically in hand. Respect when belongings are set aside, secured elsewhere, left on shore, out of reach, or impractical to use—especially during swimming, sleep, climbing, bathing, confinement, or separation from a pack. Offer an item action only when the fiction makes it accessible.
- **Employer-Supplied Tools Rule:** when the traveler is hired to do ordinary work, make the basic tools and materials needed for that job available from the employer or clearly identify them on site. Do not make carried gear a hidden prerequisite for routine work; carried items may provide a specific safer, quicker, or alternate method.
- **Tool Capability Rule:** give each tool only uses its actual shape, strength, and purpose support. Name what it acts on and what it can accomplish; a small repair tool is not a pry bar, rope does not lift a hillside, and light helps someone see but does not solve a mechanical problem. Do not offer a generic tool bonus where no concrete capability is described.
- **Conditional Incident Rule:** a scenario’s central crisis need not happen on every run. If the player’s choices keep them outside the circumstances that would trigger it, let the visit remain quiet or end without forcing the crisis.
- **Non-Inevitable Incident Rule:** when a dramatic event depends on participating in an activity, do not make that activity guarantee the event where quieter or lesser outcomes are plausible. Persist a run-level authored outcome so reloads do not reroll it; allow nothing unusual, a modest discovery, or a minor incident as well as the crisis.
- **Grounded Supernatural Rule:** supernatural events are unusual and exceptional in this world. Keep them quiet, serious, and grounded in the late-19th-century-inspired setting. Some events may have mundane explanations, some may remain ambiguous, and a few may be genuinely supernatural. Do not add spellcasting, mana, fantasy classes, routine monsters, magical combat, or supernatural stat bonuses.
- **Supernatural Item Rule:** unusual items may have narrow, atmospheric behaviors—reacting, revealing, warning, or changing one specific interaction. Do not make them universal detectors, keys, or combat upgrades. Review existing items before adding new ones, and do not force every relic into every strange adventure.
- **Recognizable Property Provenance:** when a character knowingly keeps distinctive property found unattended, record exactly what was taken in descriptive character history (and preserve the actual item only through the normal carry choice). Future recognition may invite an explanation, request, or gratitude; it is not automatic punishment. Do not turn the history into a theft, morality, or fame score.
- **Consequential Risk Rule / Fair Does Not Mean Safe:** fairness means a serious danger is understandable before the player commits, not that the player is protected from it. Clearly telegraphed choices may cause severe injury or death, NPC death, failed rescue, property or item loss, or lost money when appropriate. Do not use arbitrary death, and do not shield a character from a danger they knowingly choose.
- **Distant Intervention Rule:** when danger is visible but the player cannot immediately reach it, consider meaningful indirect actions such as warning, shouting, signaling, distracting, summoning others, or preparing help. These can work, partly help, fail, or alter later circumstances; direct physical access is not the only way to matter.
- **No-Win Situation Rule:** some situations cannot be completely fixed. Success may mean minimizing harm, preserving a life or possession, helping one person, keeping others calm, or escaping safely. Do not manufacture a perfect-victory route just because this is a game.
- **Known Reward / Known Risk:** when a dangerous choice offers a special reward, establish the meaningful benefit and the possible cost before the choice. Do not hide a major reward behind a death-risk decision solely to manipulate the player.
- Narration must not assume the character knows what the scenario data knows. Introduce an object, person, danger, or mystery in the current scene, or gate later references on prior discovery/knowledge; inventory possession and knowledge are separate states.
- **Mystery Motivation Rule:** before asking the player to investigate a disappearance, suspicious room, theft, contradiction, or hidden space, establish why it is unusual, why the player might care, what is known, and what remains uncertain. Make names, relationships, routes, and clues available through visible discoveries or testimony; scenario data alone is never player knowledge.
- Before naming a new NPC, check the existing adventure roster and prefer names not already used. Avoid repeatedly defaulting to the same small group of names; Eli and Mara have appeared often enough that they should not be reused casually in unrelated adventures. Reuse is welcome for an intentionally recurring character when that continuity is explicit. Do not mechanically rename established characters unless a duplicate is causing actual confusion.
- Establish physical relationships before a meaningful choice depends on them: where people, hazards, exits, vehicles, animals, and important objects are; which side of a barrier they occupy; and what connects to what. Use ordinary language before specialist terms, and narrate movement when anything changes position. Do not ask the player to act on an object or relationship that has not been introduced.
- **Rescue Diversity Rule:** review rescue methods already used across the library before authoring another. Do not default to a person pinned by an object, followed by prying/lifting it away. Let the rescue method grow from the hazard, geography, time pressure, available people, and believable gear: water/access, communication, evacuation, treatment, negotiation, route finding, or supported extraction can all be distinct forms. Keep a rescue’s physical problem and solution legible.
- **Important-Detail Reinforcement Rule:** repeat a decision-critical fact at the moment it affects a choice or consequence, especially when a route branches or time has passed. Reinforcement should feel like natural narration, not a repeated tutorial, and should preserve what the player has already learned.
- **Physical Evidence Rule:** evidence and clues must be observable in the scene’s actual physical conditions. Check that weather, water, darkness, distance, barriers, and viewpoint would allow the player to see, hear, or handle the clue described. Replace impossible traces or silently assumed evidence with something visible and plausible.
- **Future Scenario Categorization:** thematic randomization or category weighting is deferred until the adventure library has a complete, reviewed category taxonomy. Until then, scenario selection remains uniform among eligible adventures.
- **No-Scroll Screen Rule:** at 320×720 (strict baseline) and 390×844, the complete gameplay scene, current situation, and every available choice must fit without vertical or horizontal page scrolling. Check the longest reachable prose variant, name, hint, item/time/history/knowledge state, four-choice screen, ending, and reward state—not only defaults. Preserve readable type, usable tap targets, and the phone 2×2 grid for four choices. Tighten repetition or split into meaningful forward-only beats instead of shrinking type, clipping, or hiding content. A presentation-only split costs zero fictional minutes.
- **HUD Priority Rule:** adventure titles, scene labels, health, money, inventory controls and badges, buttons, and utilities must stay crisp and legible above decorative atmosphere. Put fog, vignette, glow, texture, and background art behind the interface; use a restrained opaque backplate or gradient when contrast needs help. Do not apply blur or low-contrast treatments to functional UI.
- **Run-Level Name Randomization:** when a non-recurring NPC may have a different name in each run, choose that name once at run start, persist it with the run, and use it consistently in narration and choices. Do not reroll after save/resume; keep canonical recurring characters fixed.
- Decide how fictional time works before authoring: whether pressure matters; which actions consume meaningful time; what changes at soft thresholds; whether any hard deadline is clearly foreshadowed; how narrative cues communicate urgency; whether equipment can save time through specific actions; and whether a broke, fresh character can still succeed. Put costs on choices (`timeCost`, in fictional minutes), and define scenario-specific `timePhases` only where useful. Time advances on authored choices only, never while the player reads, waits, or has the app closed. Use `minElapsedMinutes` / `maxElapsedMinutes` requirements and time-aware text variants to author state changes without mutating hidden state each render. Avoid a universal scenario duration or speedrun rewards.

## Current limitations

- One hundred twenty-four authored scenarios and one character slot
- Up to three carried item slots per experienced traveler and item-only banking
- No sound, installable service worker, save export, or native wrapper yet
- Random checks use browser randomness and are not seeded or replayable
- The global completion service is optional until Cloudflare deployment credentials and its public `workers.dev` endpoint are configured; no live total is shown while it is unconfigured

## Ongoing development input

Player feedback remains an ongoing input as the adventure library expands. Reports are especially useful for unfair decisions, unclear physical geography, continuity errors, predictable choice patterns, weak or favorite scenarios, forced item usage, and consequences that feel too weak or too severe. Suggestions help guide development, but not every request can be implemented. Feedback is voluntary through the in-game Contact & Feedback utility; messages open in the player's email app and are not submitted to a server.
