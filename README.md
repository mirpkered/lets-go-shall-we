# Let’s Go, Shall We?

Let’s Go, Shall We? is a mobile-first, choice-driven text RPG by Mirpworks. Each short adventure follows a persistent traveler through a fictional world inspired by the late 19th century. Stories are self-contained; the traveler’s survival, money, history, knowledge, and carried equipment make the wider journey accumulate without levels, accounts, or cloud saves.

The current registry contains **861 playable adventures**, including two outcome-rooted follow-ups that enter normal selection only after their specific contest outcomes. The game uses a reusable, data-driven scenario engine, forward-only scenes, fictional time in authored stories, local save/resume, character death and retirement, a persistent five-item Bank, and a carry capacity that can grow from one to three Gear slots for a living traveler. See [Current Systems](docs/CURRENT_SYSTEMS.md) for implementation boundaries and [Roadmap](docs/ROADMAP.md) for what is actually next.

## Run, test, build

```bash
npm install
npm run dev
npm test
npm run build
```

The static production output is `dist/`. Vite is configured for the GitHub Pages project path `/lets-go-shall-we/`.

## Publishing and QA

The public game is [Let’s Go, Shall We?](https://mirpkered.github.io/lets-go-shall-we/). The static client is published from the `gh-pages` branch; source and scenario authoring live on `main`. There is no gameplay backend. The optional completion-counter service is separate; see [current systems](docs/CURRENT_SYSTEMS.md) for its verified status.

Append `?qa=1` to the public URL to reveal mobile-friendly testing tools. QA has a separate local save and supports direct scenario launch, state inspection, run/character reset, fictional-time and health controls, item controls, completion-count testing, Easter-egg preview, and home-scene preview. QA activity does not count toward normal traveler progression or the community counter.

## Project map

- `src/scenarios/` — registered, data-driven adventures
- `src/engine.ts`, `src/storage.ts`, `src/bank.ts` — story state, persistence, progression, and Bank rules
- `src/main.ts`, `src/styles.css` — browser UI and mobile-first presentation
- `public/` — static browser assets
- `counter-service/` — optional anonymous aggregate counter service

## Canonical references

- [Implemented systems and verified status](docs/CURRENT_SYSTEMS.md)
- [Architecture and scale audit](docs/ARCHITECTURE-SCALE-AUDIT.md)
- [Canonical design rules](docs/DESIGN_RULES.md)
- [Adventure authoring checklist](docs/AUTHORING_CHECKLIST.md)
- [Adventure library status](docs/ADVENTURE_LIBRARY.md)
- [Persistent item roster](docs/ITEMS.md)
- [Traveler progression details and save migration](docs/TRAVELER-PROGRESSION.md)
- [Roadmap](docs/ROADMAP.md)
- [World continuity appendix and registry](docs/WORLD-CONTINUITY.md) · [registry](docs/WORLD-CONTINUITY-REGISTRY.md)
- [Library ending/reward audit](docs/LIBRARY-ENDING-REWARD-AUDIT.md)

The Contact & Feedback source now uses an in-game form and a server-side route on the existing Cloudflare Worker; production sending is pending Worker/provider and Pages endpoint configuration. Feedback is designed to be anonymous; an optional reply address is used only as reply-to when supplied. Only the message and small diagnostic context are sent, never the local save. Provider credentials remain server-side.
