# Let’s Go, Shall We?

Let’s Go, Shall We? is a mobile-first, choice-driven text RPG by Mirpworks. Each short adventure follows a persistent traveler through a fictional world inspired by the late 19th century. Stories are self-contained; the traveler’s survival, money, history, knowledge, and carried equipment make the wider journey accumulate without levels, accounts, or cloud saves.

The current registry contains **175 playable adventures**. The game uses a reusable, data-driven scenario engine, forward-only scenes, fictional time in authored stories, local save/resume, character death and retirement, a persistent five-item Bank, and a carry capacity that can grow from one to three items for a living traveler.

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
- [Canonical design rules](docs/DESIGN_RULES.md)
- [Adventure authoring checklist](docs/AUTHORING_CHECKLIST.md)
- [Adventure library status](docs/ADVENTURE_LIBRARY.md)
- [Persistent item roster](docs/ITEMS.md)
- [Traveler progression details and save migration](docs/TRAVELER-PROGRESSION.md)
- [Roadmap](docs/ROADMAP.md)
- [World continuity appendix and registry](docs/WORLD-CONTINUITY.md) · [registry](docs/WORLD-CONTINUITY-REGISTRY.md)
- [Library ending/reward audit](docs/LIBRARY-ENDING-REWARD-AUDIT.md)

Player feedback is voluntary through the in-game Contact & Feedback utility. It opens the player’s email app; messages are not submitted to a game server.
