# Roadmap

This roadmap separates stabilization from possible expansion. It has no promised dates; completed work belongs in current-system documentation, not in an open-task list.

## Now — stabilize and verify

- Continue hands-on playtesting across the expanded library; fix clear continuity, state, fairness, and save regressions.
- Use the on-demand content-substance audit to triage abrupt/procedural endings before future bulk-generation passes; resolve only high-confidence cases and retain human review for soft warnings.
- Verify payoff and reward changes in actual play, not only structural scans.
- Confirm traveler progression thresholds and multi-item carry behavior through long-lived and fresh travelers.
- Complete deployment and verification of the anonymous global Adventure Counter using the existing `dark-scene-308e` Worker; add the returned HTTPS `workers.dev` URL to the static production build before presenting the total as live.
- Recheck recent-adventure exclusion, reward-to-Bank, full-carry/full-Bank, save migration, and QA isolation.
- Playtest event-driven equipment damage, harness-maker repair/upgrades, and Bank/death state continuity before expanding upgrades to more items.
- Keep documentation aligned with the implementation.

## Next — consolidate the library

- Expand playtest coverage across all registered adventures and mark which have hands-on coverage.
- Review scenario balance, risk/consequence consistency, item usefulness/overlap, and the practical money economy.
- Review the risk-tier selection balance from play data and author reviews; the current selector uses soft completion-count and recent-risk weighting, without altering in-story odds.
- Review world-continuity callbacks and high-confidence weak scenarios without forcing crossovers.
- Reassess reward frequency from real play, keeping fictional provenance and varied narrative rewards ahead of item quotas.
- Treat long-term library growth (potentially 1,000+ adventures) as a core creative goal, but put meaningful diversity ahead of raw quantity. Use the diversity matrix and its gap/similarity warnings before any large generation batch.
- Seasonal availability is now supported. Future October and December batches are possibilities, not dated commitments; fantasy, skeleton/undead, and choice-driven combat stories fit the taxonomy without requiring a general combat engine.

## Later — presentation and optional platform work

- Replace the five subdued home-scene SVG variants with distinct, detailed illustrations while preserving the existing rotation framework; prevent immediate repeat across sessions.
- Consider additional audio/atmosphere and further visual polish.
- Explore a PWA or mobile-app wrapper without moving saves or gameplay to a backend.
- Improve the Journey Record / traveler-history presentation if playtesting shows a need.
- Reconcile public feedback in focused passes.

## Maybe — exploratory, not committed

- Thematic-aware sequencing beyond exact recent-repeat exclusion.
- More extensive world-event propagation or collectible/curiosity systems.
- Native packaging and additional progression ideas.
- Analytics broader than the minimal anonymous completion aggregate.
- Other speculative systems from older notes, only if they solve a demonstrated player need.

