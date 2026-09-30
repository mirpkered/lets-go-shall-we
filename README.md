# Let’s Go, Shall We?

A mobile-first, choice-driven text RPG prototype by Mirpworks. The current build includes twenty-one complete adventures—**For Whom the Bell Tolls**, **All Aboard!**, **Aww, Rats!!**, **What’s Mine is Mine**, **The Last Room on the Left**, **Dead Man’s Hand**, **Bridge Out**, **The Long Way Home**, **No Vacancy**, **Cold Storage**, **High Water**, **One More Round**, **The Road Below**, **Smoke on the Hill**, **The Empty Cradle**, **Last Light at Miller’s Crossing**, **The Weight of Gold**, **Hush Now**, **Down to the Last Match**, **The Man in the Ditch**, and **Taking on Water**—plus a reusable data-driven scenario engine, local autosave, character mortality, one-slot item continuity, and a death-proof bank.

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

## Bank disposal rule

Players may intentionally and permanently discard one banked item or empty the whole Bank after a clear confirmation. There is no undo or recovery. Disposal never happens automatically; the five-item capacity continues to preserve legacy over-capacity contents and blocks new deposits until reduced.

## Global adventure completion

When configured, the home screen displays **“Adventures completed by travelers: N”** after the shared total loads. The counter starts at `0` when its production service is first deployed; it does not estimate earlier local play. Every normal run reaching an authored terminal ending counts, including death and authored walk-away endings. Explicit **Abandon Adventure** does not count. Runs launched or manipulated in `?qa=1` do not count.

The browser sends only a random run UUID to the counter service. A single Cloudflare SQLite Durable Object stores the UUIDs and aggregate; a database primary key and insert trigger make repeated requests idempotent and serialize updates. No player identity, scenario, ending, choices, inventory, or save data is sent. Pending submissions stay in the local save and receive one quiet retry; gameplay never waits for the service. The counter URL is a public build setting (`VITE_GLOBAL_COMPLETION_COUNTER_URL`). Leave it unset for local development/tests; the UI remains unchanged and tests use mocks. Deploy `counter-service/wrangler.jsonc` with the **Deploy global completion counter** GitHub Actions workflow after adding the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Then set the public Worker URL as `VITE_GLOBAL_COMPLETION_COUNTER_URL` for the GitHub Pages build and publish the frontend. The counter is one shared total, not a player or win count. This is a narrowly scoped foundation, not a commitment to broader analytics.

## Scenario authoring rules

- Important items, clues, and advantages must come from an explicit choice, a clearly narrated handoff, or a clearly described discovery. Avoid silent inventory grants.
- When a scenario supports multiple legitimate plans, explain each plan clearly and frame its risks consistently. Do not imply one is the intended answer; let the player weigh the tradeoffs.
- Story screens are one-time narrative moments. Scenario paths move forward and do not revisit a screen.
- Every scene should change the situation, reveal useful information, create risk, pay off an earlier choice, alter future options, or advance the central story. If it does none of these, consolidate or remove it.
- Character history is a small set of behavior flags, not an alignment score. It follows a living character across runs and is lost with that character; future scenarios can inspect it through choice requirements.
- **Traveler Narrative Frame:** the persistent character travels light, moves from place to place, takes work and opportunities as they come, and may help, refuse, or keep moving. They are capable, not automatically heroic or bound to a formal guild, rank, or profession. Vary adventure openings: hired, already traveling, stopping somewhere, coming across trouble, or beginning pre-arranged work. Coincidence is fine; do not over-explain. Every adventure must make sense for a fresh character. History may lightly flavor an opening or NPC reaction, but must not gate basic understanding or success. There is no global fame, reputation, alignment, or faction score; use relevant existing character-history flags selectively, and do not make every NPC recognize the traveler.
- **Canonical World Era / Period Consistency Rule:** the setting is a fictional pre-modern travel era inspired primarily by the late 19th century; its exact calendar year is unspecified. Keep its broad technological and social feel: railroads, horses, wagons, ferries, inns, mines, farms, lanterns, hand tools, printed notices, letters, manual machinery, and long-distance communication that takes time. Do not assume automobiles, personal telephones, radios, computers, GPS, internet, electronic alarms, electric flashlights, or modern emergency dispatch. Use direct speech, messengers, letters, bells, whistles, signal mirrors, lantern signals, or telegraph where a settlement actually has access. Let distance, weather, daylight, roads, animals, and mechanical condition matter without artificially increasing danger.
- **Historical Flexibility Rule:** this is historically inspired, not an exact-year simulation. Avoid obvious anachronisms, but do not reject a useful element over uncertain adoption dates if it broadly fits the era and does not create a modern-feeling solution. When exact accuracy conflicts with clear gameplay, preserve period feel and readability. Before introducing something unfamiliar, check transportation, lighting, communication, medicine, tools, buildings, infrastructure, terminology, and emergency response. Keep treatment accessible, the economy internally plausible rather than tied to exact historical prices, and firearms secondary to travel, judgment, problem-solving, and consequence.
- **Continuity Must Have Teeth:** across the adventure library, persistent characters, carried gear, money, and history must sometimes face meaningful risk. Mix low-stakes trouble with financial/property loss, item loss, NPC injury or death, player injury or death, safe walk-away choices, difficult rescues, and ugly tradeoffs. Not every story needs lethal danger, but long-term continuity should not be decorative.
- **Consequential Risk Rule / Fair Does Not Mean Safe:** fairness means a serious danger is understandable before the player commits, not that the player is protected from it. Clearly telegraphed choices may cause severe injury or death, NPC death, failed rescue, property or item loss, or lost money when appropriate. Do not use arbitrary death, and do not shield a character from a danger they knowingly choose.
- **Known Reward / Known Risk:** when a dangerous choice offers a special reward, establish the meaningful benefit and the possible cost before the choice. Do not hide a major reward behind a death-risk decision solely to manipulate the player.
- Narration must not assume the character knows what the scenario data knows. Introduce an object, person, danger, or mystery in the current scene, or gate later references on prior discovery/knowledge; inventory possession and knowledge are separate states.
- **Mystery Motivation Rule:** before asking the player to investigate a disappearance, suspicious room, theft, contradiction, or hidden space, establish why it is unusual, why the player might care, what is known, and what remains uncertain. Make names, relationships, routes, and clues available through visible discoveries or testimony; scenario data alone is never player knowledge.
- Before naming a new NPC, check the existing adventure roster and prefer names not already used. Avoid repeatedly defaulting to the same small group of names; Eli and Mara have appeared often enough that they should not be reused casually in unrelated adventures. Reuse is welcome for an intentionally recurring character when that continuity is explicit. Do not mechanically rename established characters unless a duplicate is causing actual confusion.
- Establish physical relationships before a meaningful choice depends on them: where people, hazards, exits, vehicles, animals, and important objects are; which side of a barrier they occupy; and what connects to what. Use ordinary language before specialist terms, and narrate movement when anything changes position. Do not ask the player to act on an object or relationship that has not been introduced.
- **No-Scroll Screen Rule:** at 320×720 (strict baseline) and 390×844, the complete gameplay scene, current situation, and every available choice must fit without vertical or horizontal page scrolling. Check the longest reachable prose variant, name, hint, item/time/history/knowledge state, four-choice screen, ending, and reward state—not only defaults. Preserve readable type, usable tap targets, and the phone 2×2 grid for four choices. Tighten repetition or split into meaningful forward-only beats instead of shrinking type, clipping, or hiding content. A presentation-only split costs zero fictional minutes.
- **HUD Priority Rule:** adventure titles, scene labels, health, money, inventory controls and badges, buttons, and utilities must stay crisp and legible above decorative atmosphere. Put fog, vignette, glow, texture, and background art behind the interface; use a restrained opaque backplate or gradient when contrast needs help. Do not apply blur or low-contrast treatments to functional UI.
- **Run-Level Name Randomization:** when a non-recurring NPC may have a different name in each run, choose that name once at run start, persist it with the run, and use it consistently in narration and choices. Do not reroll after save/resume; keep canonical recurring characters fixed.
- Decide how fictional time works before authoring: whether pressure matters; which actions consume meaningful time; what changes at soft thresholds; whether any hard deadline is clearly foreshadowed; how narrative cues communicate urgency; whether equipment can save time through specific actions; and whether a broke, fresh character can still succeed. Put costs on choices (`timeCost`, in fictional minutes), and define scenario-specific `timePhases` only where useful. Time advances on authored choices only, never while the player reads, waits, or has the app closed. Use `minElapsedMinutes` / `maxElapsedMinutes` requirements and time-aware text variants to author state changes without mutating hidden state each render. Avoid a universal scenario duration or speedrun rewards.

## Current limitations

- Twenty-one authored scenarios and one character slot
- One carried item slot and item-only banking
- No sound, installable service worker, save export, or native wrapper yet
- Random checks use browser randomness and are not seeded or replayable
- The global completion service is optional until Cloudflare deployment credentials and its public `workers.dev` endpoint are configured; no live total is shown while it is unconfigured

## Ongoing development input

Player feedback remains an ongoing input as the adventure library expands. Reports are especially useful for unfair decisions, unclear physical geography, continuity errors, predictable choice patterns, weak or favorite scenarios, forced item usage, and consequences that feel too weak or too severe. Suggestions help guide development, but not every request can be implemented. Feedback is voluntary through the in-game Contact & Feedback utility; messages open in the player's email app and are not submitted to a server.
