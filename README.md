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

## Scenario authoring rules

- Important items, clues, and advantages must come from an explicit choice, a clearly narrated handoff, or a clearly described discovery. Avoid silent inventory grants.
- When a scenario supports multiple legitimate plans, explain each plan clearly and frame its risks consistently. Do not imply one is the intended answer; let the player weigh the tradeoffs.
- Story screens are one-time narrative moments. Scenario paths move forward and do not revisit a screen.
- Every scene should change the situation, reveal useful information, create risk, pay off an earlier choice, alter future options, or advance the central story. If it does none of these, consolidate or remove it.
- Character history is a small set of behavior flags, not an alignment score. It follows a living character across runs and is lost with that character; future scenarios can inspect it through choice requirements.
- Narration must not assume the character knows what the scenario data knows. Introduce an object, person, danger, or mystery in the current scene, or gate later references on prior discovery/knowledge; inventory possession and knowledge are separate states.
- Before naming a new NPC, check the existing adventure roster and prefer names not already used. Avoid repeatedly defaulting to the same small group of names; Eli and Mara have appeared often enough that they should not be reused casually in unrelated adventures. Reuse is welcome for an intentionally recurring character when that continuity is explicit. Do not mechanically rename established characters unless a duplicate is causing actual confusion.
- Establish physical relationships before a meaningful choice depends on them: where people, hazards, exits, vehicles, animals, and important objects are; which side of a barrier they occupy; and what connects to what. Use ordinary language before specialist terms, and narrate movement when anything changes position. Do not ask the player to act on an object or relationship that has not been introduced.
- **No-Scroll Screen Rule:** on supported phone sizes (390×844 and 320×720), every gameplay scene must fit without page scrolling: story, situation, and all choices stay in view. Shorten or split prose into forward-only beats instead of shrinking type or placing story in a scrollable panel. Preserve readable text and the choice layout.
- **Run-Level Name Randomization:** when a non-recurring NPC may have a different name in each run, choose that name once at run start, persist it with the run, and use it consistently in narration and choices. Do not reroll after save/resume; keep canonical recurring characters fixed.
- Decide how fictional time works before authoring: whether pressure matters; which actions consume meaningful time; what changes at soft thresholds; whether any hard deadline is clearly foreshadowed; how narrative cues communicate urgency; whether equipment can save time through specific actions; and whether a broke, fresh character can still succeed. Put costs on choices (`timeCost`, in fictional minutes), and define scenario-specific `timePhases` only where useful. Time advances on authored choices only, never while the player reads, waits, or has the app closed. Use `minElapsedMinutes` / `maxElapsedMinutes` requirements and time-aware text variants to author state changes without mutating hidden state each render. Avoid a universal scenario duration or speedrun rewards.

## Current limitations

- Twenty-one authored scenarios and one character slot
- One carried item slot and item-only banking
- No sound, installable service worker, save export, or native wrapper yet
- Random checks use browser randomness and are not seeded or replayable
