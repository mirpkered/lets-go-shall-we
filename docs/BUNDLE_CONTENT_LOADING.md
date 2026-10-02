# Bundle and Content Loading Audit

## Current architecture

The production build is a static Vite site for GitHub Pages. The scenario registry in `src/scenarios/index.ts` imports every registered scenario body synchronously. Normal selection, active-run resume, and the QA picker all use this same registry; `getScenario` is a synchronous ID lookup. Stable scenario IDs and save data therefore do not currently require any content-loading migration.

This is simple and reliable, but means the browser downloads and parses the entire scenario library on initial load. At the audit baseline of 445 registered adventures, Vite produced one 2.576 MB minified JavaScript chunk (727.9 KB gzip), plus 31.5 KB CSS (8.18 KB gzip). Vite transformed 108 modules; 86 were scenario modules. Their rendered contribution was about 2.71 MB before final bundle minification. The remaining application code, including engine/UI and QA, was much smaller. There are no runtime third-party dependencies; package dependencies are development/build/test tools. Source maps were not emitted.

The current player-facing startup path loads the full registry before the Home screen can select a scenario or resume an active run. Images under `public/` are copied as static assets but are not bundled into the JS; only the selected Home background is referenced at runtime. `public/icons/app-icon-source.png` was not referenced by the application and was moved intact to `design-assets/app-icon-source.png`, so it remains available to maintainers without being copied into the production site.

## Optimization decision

The unused 2.31 MB public icon source is excluded from the deployable asset tree without deleting the source artwork. No runtime dependency removal or helper deduplication was justified by the bundle report.

Scenario lazy loading is deferred. A meaningful initial-load reduction requires a lightweight metadata-only registry and asynchronous scenario resolution. That changes the synchronous contracts shared by weighted selection, exact active-run resume, migration, QA direct-launch, and many tests. Splitting current registry imports into static chunks would not reduce the initial download because all chunks remain synchronously reachable. A metadata/body split is promising for a larger library, but should be introduced as a dedicated architecture change with explicit loading/error/retry and offline-cache coverage rather than as a bundler-only adjustment.

At the current average content size, linear growth to 1,000 similarly sized adventures would put the JS bundle in the rough range of 5.8 MB minified / 1.6 MB gzip. This is a directional estimate, not a build measurement; future content size and compression may differ. Revisit metadata/body separation before approaching that scale.

## Regression invariants for a future loader

- Keep stable scenario IDs and persisted active-run IDs unchanged.
- Resolve an active run's exact scenario before rendering or mutating the run; a failed fetch must leave its save intact and offer retry.
- Keep selector metadata for the entire library available without downloading all scene text.
- Let QA explicitly load the selected scenario and retain access to the complete registry.
- Preserve seasonal eligibility, replay weighting, static GitHub Pages deployment, and normal browser caching.
- Test old and newly added scenarios, save/resume, QA launch, and load failure before enabling lazy content in production.
