# Adventure Authoring Checklist

Use with the [Canonical Design Rules](DESIGN_RULES.md), not as a scoring quota. Mark an item not applicable when the story does not need it.

## How to add one adventure correctly

1. Create a readable typed `Scenario` data module under `src/scenarios/`. Keep stable scenario and scene IDs; author the scene graph directly unless an existing helper exactly matches the story’s structure.
2. Set `diversity` metadata in the current schema, including intended `depthClass`, an explicit `riskTier`, fantasy, combat, availability, and historical fields where applicable. Explicit `diversity.riskTier` is canonical for runtime, selection, and QA. The classifier’s stable-ID/mechanics fallback exists only for the pre-metadata legacy scenarios; do not add new content that relies on it.
3. Register the scenario once in `src/scenarios/index.ts`. That root registry is the source used by normal selection and QA direct launch; do not add it to a second list.
4. Express persistent outcomes as authored `Effects` on choices. The shared engine and reward resolver own completion, inventory, money, supplies, knowledge/history, relationships, and lifecycle persistence. Never mutate saved traveler state in scenario helpers.
5. Add focused scenario tests for important branches, required state, payoff, and save-sensitive behavior. The global registry release test checks graph targets, stable-reference catalogs, metadata, and IDs; use `validateScenarioRegistry` for focused fixtures when useful.
6. Launch it in QA and inspect substantive endings, reward resolution, and the longest mobile scenes. Completion is handled by canonical terminal qualification, not bespoke scenario code.

For a new scenario batch, count scenarios with a meaningful opportunity for coins, reusable Knowledge, Lore, or Gear. The canonical minimum is 70%, with 75–80% preferred; this is a batch-level review, never a requirement to reward every story. If below minimum, record why the batch’s story mix justifies it. See the **Scenario-Batch Reward Density Rule** in [Canonical Design Rules](DESIGN_RULES.md).

Also review the early-accessible portion of the library separately: global batch density does not guarantee that ordinary Travelers encounter continuity-bearing choices early, or that the choices are reachable and understandable.

Batch-specific builders (for example `authorAdventure`, frontier discovery tools, `largeTags`, and `huntMetadata`) remain conveniences for their established families, not the universal path. Use them only when their defaults fit; do not accept a generated graph shape in place of story-specific structure.

## Choosing a depth class

`depthClass` describes the experience the route gives the player, not raw node count or tone. Author it explicitly on every new scenario. When the field is missing, the compatibility fallback is always `ADVENTURE`; scene-count or length inference must never assign `ENCOUNTER` to new content.

- **ENCOUNTER**: one focused situation with clear follow-through and a compact payoff. Examples: “The Bell After Midnight” turns one unexplained bell stroke into a brief, grounded check of the inn yard; “The Sixth Chair” resolves one supper-table problem through distinct practical choices. A quiet or funny experience can be an Encounter without danger or a large reward.
- **ADVENTURE**: the anthology’s middle lane, with meaningful development, optional approaches or clues, and consequences that reflect decisions. “The Last Room on the Left” develops an innkeeper’s account into investigation, a hidden cellar, and a rescue with materially different outcomes; it is not Deep Exploration merely because its graph is long.
- **DEEP_EXPLORATION**: the place itself is explored through connected areas, optional depth, discoveries, retreat, and greater risk at greater depth. “For Whom the Bell Tolls” branches through the chapel, hidden stair, and older burial, while “What’s Mine is Mine” offers alternate mine descents, a deeper rescue, an optional silver seam, and a valid retreat. The newer Wren’s Mill and Iron Orchard adventures are further examples.

Do not promote a long linear rescue or investigation to Deep Exploration because it has many nodes. Do not keep a one-situation story in Adventure merely because a builder defaults there. When a helper’s default does not fit, override the resulting `depthClass` in the scenario metadata. These classes do not currently alter normal scenario selection; metadata truth comes first.

## Persistent memory: choose the right record

- **Knowledge** is a reusable fact the Traveler actually learned: a route, mechanism, identity, hazard, or reliable method. Use it when later content may reasonably rely on that fact. For reusable facts, add a stable ID and display text to `src/knowledgeFacts.ts`, award it with `knowledgeEntries`, and query with `knowledgeKeys` / `notKnowledgeKeys`. Save migration maps an exact known legacy sentence to its ID while retaining the original prose. One-off memories may continue using `knowledge` prose without an ID. Keep uncertainty explicit in the fact.
- **Lore** is a remembered account, custom, belief, or tale whose value may be cultural or uncertain rather than a verified reusable fact. Do not use it as a hidden mechanical prerequisite unless the Traveler has learned a specific actionable fact separately.
- **History** records what this Traveler did, suffered, chose, or experienced. Use stable snake_case event keys for it, not item possession or a fact about the world. Prefer consequential choices and outcomes over routine button presses. Existing descriptive/history strings remain valid legacy values; do not rename them without migration and query audit.
- **Contact/Favor** represents a named relationship or a specific callable offer/obligation. Do not encode a promise or relationship only as History when the structured system fits.
- **Narration only** is appropriate for ordinary actions and details with no expected future callback. Persistence is not a requirement for every remembered moment.

Knowledge and Lore are shown as a small recent preview in Inventory & Bank; History keys are internal continuity state and are not presented as a journal. All three remain traveler-bound, save with the character, and end with that Traveler. Use stable-key records only for facts reused as mechanics; do not create IDs for one-off memories. Migrate deliberately with legacy-save compatibility instead of matching mutable display prose ad hoc.

## Before drafting

- [ ] Read the current rules and inspect the adventure roster, continuity registry, history flags, item catalog, and relevant geography/events.
- [ ] Choose a clear premise, tone, stakes, and a fresh-traveler reason to participate. Establish time, weather, and place where they matter.
- [ ] Assign a LOW / MODERATE / HIGH / SEVERE risk tier from actual consequence potential, not genre or atmosphere; preserve intended quiet adventures.
  - LOW: ordinary engaged routes have little credible danger of injury or death; costs are mainly social, economic, time, comfort, or opportunity.
  - MODERATE: an ordinary route or visible optional hazard can cause injury or serious loss, but survival is not the defining stake.
  - HIGH: meaningful physical peril or possible death exists on a consequential route, while mitigation or retreat can materially help.
  - SEVERE: survival is central and lethal outcomes are a major possibility across ordinary engaged routes; a single optional lethal branch alone does not make the whole scenario SEVERE.
  - Judge the authored route experience, including environmental danger, confrontation, commitment/escape difficulty, and consequence severity. Do not infer risk from scene count, combat tags, fantasy density, or one implementation effect.
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
- [ ] If the hook is a discovered place, can curiosity start the story without inventing a quest-giver?
- [ ] Do physical details let the player infer recent activity, danger, or history before explanatory confirmation?
- [ ] If a site looks abandoned, have ownership, heirs, caretaking, occupants, and signs of return been kept distinct from appearance?
- [ ] For salvage or a claim, are provenance and competing evidence clear enough for the player to choose whether to take, leave, share, or conceal?
- [ ] If exploration deepens risk, is that risk visible before the choice, and can the traveler leave with partial knowledge?
- [ ] Apply the No Checklist Ending Rule: an explicit refusal may end briefly, but engaged participation should show judgment, performance, complication, consequence, reaction, or payoff; do not add scenes to satisfy a quota.
- [ ] Did the player make a meaningful decision?
- [ ] Did the situation change because of the player’s action?
- [ ] Is a visible consequence present?
- [ ] Is there a reaction or payoff?
- [ ] Does the ending reflect actual route state, performance, costs, and current-run knowledge?
- [ ] Would this feel complete without the words “Adventure Complete”?
- [ ] Is the structure too similar to another adventure? Treat audit warnings as human-review prompts, not automatic rejection.
- [ ] For a dispute, wager/game, job, testimony, or ordinary task, has the story earned its result and shown what it changes? Do not mistake length, coin changes, or task completion alone for substance.
- [ ] If responsibility or information is handed to an NPC, healer, clerk, or authority, does the traveler see a consequence, reaction, stabilization, or aftermath before completion?

## Structure, payoff, and rewards

- [ ] Every story transition moves forward; no scene ID is revisited.
- [ ] Each scene has narrative value; avoid filler and unnecessary navigation.
- [ ] Resolve the central problem in the story, then show a concise payoff/aftermath where needed. Quiet paths deserve closure without a new crisis.
- [ ] Work-focused stories include a meaningful workday decision/event and state-aware performance feedback (output, quality, time, setback, pay, or coworker reaction).
- [ ] Testimony/information stories show what the account changes and what remains uncertain; do not end at “statement recorded.”
- [ ] Administrative actions (compare, report, submit, return, or wait for an authority) lead to a visible consequence or payoff.
- [ ] Do not end at the first offer of help, agreement, compromise, wager, routine task, or deferral; show what it changes and give a meaningful next decision when the story calls for one.
- [ ] If a supernatural manifestation appears, connect it to the traveler’s understanding, risk, investigation, decision, consequence, or resolution—even when its nature remains uncertain.
- [ ] For occult items, name a narrow function and limit; check Yew Charm, Grave Token, Bone Key, existing Gear upgrades, and Supplies before adding another persistent Relic.
- [ ] Make occult Supplies optional, explicitly consumed, and useful without making them prerequisites for a fresh traveler’s viable route.
- [ ] Give any supernatural threat a discoverable, specific behavior or stopping condition; confirm whether the story is fraud, ambiguous, eerie, supernatural, fantasy-threat, or dungeon-fantasy without forcing a universal answer.
- [ ] For creature stories, do not assume the hunt must end in a kill. Consider protection, exposure, containment, retreat, escape, coexistence, or a mundane explanation; establish evidence before certainty where useful.
- [ ] Make preparation matter without making prior gear mandatory: check item condition, supplies, light, position, terrain, knowledge, allies, injuries, timing, and a plausible retreat route.
- [ ] Give a supernatural weakness only to the specific creature/tradition that supports it; do not make silver, salt, iron, holy objects, or Relics universal counters.
- [ ] If a creature escapes or a hunt fails, show what changed or was learned. If a creature dies, a trophy stays narrative/history unless it has a distinct future use or provenance.
- [ ] After a creature encounter, show the effect on people, animals, property, evidence, remaining danger, and traveler where needed; do not end merely because a kill, trap, retreat, or hoax reveal occurred.
- [ ] After supernatural danger ends, show the immediate aftermath and what remains known, unknown, damaged, or unresolved.
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
