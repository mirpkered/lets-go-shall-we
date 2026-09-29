# Let’s Go, Shall We?

A mobile-first, choice-driven text RPG prototype by Mirpworks. The current build includes three complete adventures—**For Whom the Bell Tolls**, **All Aboard!**, and **Aww, Rats!!**—plus a reusable data-driven scenario engine, local autosave, character mortality, one-slot item continuity, and a death-proof bank.

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

## Current limitations

- Three authored scenarios and one character slot
- One carried item slot and item-only banking
- No sound, installable service worker, save export, or native wrapper yet
- Random checks use browser randomness and are not seeded or replayable
