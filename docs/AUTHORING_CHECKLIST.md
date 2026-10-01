# Adventure Authoring Checklist

Use with the [Canonical Design Rules](DESIGN_RULES.md), not as a scoring quota. Mark an item not applicable when the story does not need it.

## Before drafting

- [ ] Read the current rules and inspect the adventure roster, continuity registry, history flags, item catalog, and relevant geography/events.
- [ ] Choose a clear premise, tone, stakes, and a fresh-traveler reason to participate. Establish time, weather, and place where they matter.
- [ ] Assign a LOW / MODERATE / HIGH / SEVERE risk tier from actual consequence potential, not genre or atmosphere; preserve intended quiet adventures.
- [ ] Decide whether pressure/time is useful; identify which actions advance fictional time and what visible changes follow.
- [ ] Review NPC names for variety and intentional recurrence.
- [ ] Classify historical presence (NONE / INSPIRED / CAMEO / FEATURED / HISTORICAL_EVENT). Keep real figures/events rare and grounded; avoid exact-year/geography anchors, distinguish fact from reputation and later legend, and identify any named reference and portrayal where applicable.
- [ ] Review the generated diversity matrix and library gaps; pick underrepresented combinations rather than repeating the last batch’s formula.
- [ ] Before adding a persistent item, check whether existing Gear/Relic can serve through a new use or upgrade; decide whether it belongs in Gear, Supply, Relic, Asset, or Temporary and whether persistent tracking earns its complexity.
- [ ] Give the adventure a distinctive hook beyond changed names or scenery; vary structure, role, pacing, risk, tone, entry, decision pattern, outcome, and payoff across the batch.
- [ ] Set seasonal availability only when the story is genuinely date-bound; mention of weather or a season alone does not require calendar gating. Classify fantasy density and combat separately from tone and risk.

## Opening and spatial setup

- [ ] Establish why the traveler is here and what they know at the start.
- [ ] Put the player, NPCs, hazards, exits, routes, vehicles, animals, and important objects in a usable mental map before choices depend on them.
- [ ] Make obstacles, direction, distance, and access plausible; narrate movement and state changes.
- [ ] Introduce every decision-relevant tool/object before mentioning it as available or using it.
- [ ] Check every choice precondition: resources, objects, tools, routes, positions, animals, vehicles, and physical abilities are established and accessible; no choice conjures them.

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
- [ ] For persistent gear changes, author the explicit damage/break/repair/upgrade/replacement event and its visible narration. Broken gear remains owned but unusable; repairs and named upgrades preserve provenance and must be checked across inventory, Bank, death, save/reload, and replacement.
- [ ] For Supplies, set a stack limit and separate stack-slot need; test add/merge/full pouch/consume/empty/save/reload, and narrate quantity spent. Routine provisions remain abstract.
- [ ] Keep Gear requirements optional for baseline success. Bank only Gear/Relics; character-bound Supplies and Assets are lost with death, abandonment, or retirement.
- [ ] Consider quiet/partial outcomes and situations with no perfect solution where they fit.
- [ ] Before terminal: did more than a procedure happen?
- [ ] Did the player make a meaningful decision?
- [ ] Did the situation change because of the player’s action?
- [ ] Is a visible consequence present?
- [ ] Is there a reaction or payoff?
- [ ] Does the ending reflect actual route state, performance, costs, and current-run knowledge?
- [ ] Would this feel complete without the words “Adventure Complete”?
- [ ] Is the structure too similar to another adventure? Treat audit warnings as human-review prompts, not automatic rejection.
- [ ] For a dispute, wager/game, job, testimony, or ordinary task, has the story earned its result and shown what it changes? Do not mistake length, coin changes, or task completion alone for substance.

## Structure, payoff, and rewards

- [ ] Every story transition moves forward; no scene ID is revisited.
- [ ] Each scene has narrative value; avoid filler and unnecessary navigation.
- [ ] Resolve the central problem in the story, then show a concise payoff/aftermath where needed. Quiet paths deserve closure without a new crisis.
- [ ] Work-focused stories include a meaningful workday decision/event and state-aware performance feedback (output, quality, time, setback, pay, or coworker reaction).
- [ ] Testimony/information stories show what the account changes and what remains uncertain; do not end at “statement recorded.”
- [ ] Administrative actions (compare, report, submit, return, or wait for an authority) lead to a visible consequence or payoff.
- [ ] Do not end at the first offer of help, agreement, compromise, wager, routine task, or deferral; show what it changes and give a meaningful next decision when the story calls for one.
- [ ] If a supernatural manifestation appears, connect it to the traveler’s understanding, risk, investigation, decision, consequence, or resolution—even when its nature remains uncertain.
- [ ] Review terminal nodes directly after common first-step actions; treat these as human-review prompts, not automatic failures or a screen-count quota.
- [ ] Quiet/recreational routes contain an interaction, choice, reaction, or memorable detail; danger is not required.
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
