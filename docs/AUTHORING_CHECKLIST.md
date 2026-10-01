# Adventure Authoring Checklist

Use with the [Canonical Design Rules](DESIGN_RULES.md), not as a scoring quota. Mark an item not applicable when the story does not need it.

## Before drafting

- [ ] Read the current rules and inspect the adventure roster, continuity registry, history flags, item catalog, and relevant geography/events.
- [ ] Choose a clear premise, tone, stakes, and a fresh-traveler reason to participate. Establish time, weather, and place where they matter.
- [ ] Assign a LOW / MODERATE / HIGH / SEVERE risk tier from actual consequence potential, not genre or atmosphere; preserve intended quiet adventures.
- [ ] Decide whether pressure/time is useful; identify which actions advance fictional time and what visible changes follow.
- [ ] Review NPC names for variety and intentional recurrence.
- [ ] Review the generated diversity matrix and library gaps; pick underrepresented combinations rather than repeating the last batch’s formula.
- [ ] Give the adventure a distinctive hook beyond changed names or scenery; vary structure, role, pacing, risk, tone, entry, decision pattern, outcome, and payoff across the batch.
- [ ] Set seasonal availability only when the story is genuinely date-bound; mention of weather or a season alone does not require calendar gating. Classify fantasy density and combat separately from tone and risk.

## Opening and spatial setup

- [ ] Establish why the traveler is here and what they know at the start.
- [ ] Put the player, NPCs, hazards, exits, routes, vehicles, animals, and important objects in a usable mental map before choices depend on them.
- [ ] Make obstacles, direction, distance, and access plausible; narrate movement and state changes.
- [ ] Introduce every decision-relevant tool/object before mentioning it as available or using it.

## Knowledge and continuity

- [ ] Introduce names and relationships before use; distinguish observed fact, testimony, inference, and uncertainty.
- [ ] Do not leak scenario-data knowledge, previous-player knowledge, or a dead/retired traveler’s private knowledge.
- [ ] Keep callbacks optional and give fresh travelers a complete fallback.
- [ ] Persist run-level random choices/events so save and reload do not reroll the story.

## Choices and consequences

- [ ] Choices provide real agency, understandable consequences, and consistently framed alternatives.
- [ ] NPCs explain resources and constraints but do not decide the player’s strategy.
- [ ] Foreshadow meaningful danger; risky actions generally retain a chance where physically possible.
- [ ] For lethal branches, show a plausible hazard and warning/escalation; account for mitigation, retreat, and any price retreat carries. Do not add fatality as an arbitrary difficulty bump.
- [ ] Keep a fresh, broke traveler viable. Carried tools should offer specific optional methods, not hidden prerequisites.
- [ ] Check tool capability and accessibility; identify what each item acts on and where.
- [ ] Consider quiet/partial outcomes and situations with no perfect solution where they fit.

## Structure, payoff, and rewards

- [ ] Every story transition moves forward; no scene ID is revisited.
- [ ] Each scene has narrative value; avoid filler and unnecessary navigation.
- [ ] Resolve the central problem in the story, then show a concise payoff/aftermath where needed. Quiet paths deserve closure without a new crisis.
- [ ] Endings reflect actual state: tasks, warnings, locations, tools used, injuries, losses, and current-run knowledge.
- [ ] Consider fictional payment, item, history, relationship, lore, knowledge, cost, or a satisfying narrative payoff. Do not impose reward quotas or forget agreed wages.
- [ ] Ensure item rewards have believable ownership/provenance, distinct capability, no unintended duplicate, and a safe carry/Bank/decline flow.
- [ ] Compare the completed scenario with existing metadata and structural warnings. Similarity is a prompt for human review, never an automatic rejection.

## Release checks

- [ ] Add tests for meaningful branches, state-aware prose, requirements, random incidents, legacy saves, and any item/history callback.
- [ ] Run scenario graph / dead-end validation and all project tests; do not weaken existing coverage.
- [ ] Test longest prose/hints, endings, reward views, and four-choice screens at 320×720 and 390×844; verify no page scrolling or horizontal overflow.
- [ ] Confirm exact-state resume, fictional-time persistence, QA isolation, Bank capacity, and safe reward resolution where relevant.
- [ ] Update the library status and continuity registry only for facts actually established by the scenario.
