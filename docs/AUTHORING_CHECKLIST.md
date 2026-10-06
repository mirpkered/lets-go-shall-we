# Adventure Authoring Checklist

Use with the [Canonical Design Rules](DESIGN_RULES.md), not as a scoring quota. Mark an item not applicable when the story does not need it.

For continuity batches after Batch 14, also use the [Continuity Expansion Program](CONTINUITY_EXPANSION_PROGRAM.md): deliberately balance primary Gear, Knowledge, and Lore across the batch; give each persistent fact/history a meaningful downstream callback; and keep Gear, Knowledge, and Lore distinct in both capability and narration.

## How to add one adventure correctly

1. Create a readable typed `Scenario` data module under `src/scenarios/`. Keep stable scenario and scene IDs; author the scene graph directly unless an existing helper exactly matches the story’s structure.
2. Set `diversity` metadata in the current schema, including intended `depthClass`, an explicit `riskTier`, fantasy, combat, availability, and historical fields where applicable. Explicit `diversity.riskTier` is canonical for runtime, selection, and QA. The classifier’s stable-ID/mechanics fallback exists only for the pre-metadata legacy scenarios; do not add new content that relies on it.
3. Register the scenario once in `src/scenarios/index.ts`. That root registry is the source used by normal selection and QA direct launch; do not add it to a second list.
4. Express persistent outcomes as authored `Effects` on choices. The shared engine and reward resolver own completion, inventory, money, supplies, knowledge/history, relationships, and lifecycle persistence. Never mutate saved traveler state in scenario helpers.
5. Add focused scenario tests for important branches, required state, payoff, and save-sensitive behavior. The global registry release test checks graph targets, stable-reference catalogs, metadata, and IDs; use `validateScenarioRegistry` for focused fixtures when useful.
6. Launch it in QA and inspect substantive endings, reward resolution, and the longest mobile scenes. Completion is handled by canonical terminal qualification, not bespoke scenario code.

For a new scenario batch, count scenarios with a meaningful opportunity for coins, reusable Knowledge, Lore, or Gear. The canonical minimum is 70%, with 75–80% preferred; this is a batch-level review, never a requirement to reward every story. If below minimum, record why the batch’s story mix justifies it. See the **Scenario-Batch Reward Density Rule** in [Canonical Design Rules](DESIGN_RULES.md).

Also review the early-accessible portion of the library separately: global batch density does not guarantee that ordinary Travelers encounter continuity-bearing choices early, or that the choices are reachable and understandable.

**Temporary corrective Gear phase:** while route-aware measures show abnormally low Gear exposure, a small, explicitly targeted Gear-centric batch may exceed the normal reward-density band, including offering Gear opportunities throughout. This is a temporary ecology correction, not a new default: once exposure is healthier, return future mixed batches to the 70% minimum and 75–80% preferred reward-opportunity standard.

**Gear Expansion Program — Genre Batch 2: Road Danger / Highwaymen / Bandits / Robbers.** Road-threat stories should show hostile equipment in use before it becomes available, preserve a credible noncombat response where the fiction permits, and resolve ownership through surrender, witnessed abandonment, restitution, or an explicit owner transfer. A fight alone is never an automatic loot grant. Keep hostile intent and violence fairly foreshadowed; temporary separation from player-owned Gear must not become silent permanent loss. This is another temporary corrective batch, not a permanent change to mixed-batch reward density.

**Gear Expansion Program — Genre Batch 4: Trades / Apprenticeships / Practical Work.** Work stories should show diagnosis, a tool’s actual capability, a complication, and a quality check; avoid reducing skilled labor to a one-choice wage. Temporary shop equipment remains temporary unless ownership is explicitly released. Gear repair and improvement use canonical item-condition and upgrade effects, preserving provenance without consuming a new carry slot. Wages-in-kind should compete honestly with coins or useful learning. Corrective Gear batches may exceed normal reward density only while measured Gear access remains abnormally low; future mixed batches retain the 70% minimum and 75–80% preferred standard.

**Gear Expansion Program — Genre Batch 5: Salvage / Recovery / Reclamation.** A find is not an ownership transfer. Establish the chain of custody through marks, records, witnesses, a written salvage agreement, owner release, or a sale; return disputed/private property rather than treating absence as abandonment. Show the physical recovery, then let its evidence create a second question about safety, ownership, or priority. Record recovered Gear’s explicit provenance, and preserve a damaged condition when the item still needs repair. The normal 70% minimum / 75–80% preferred reward density remains for mixed batches; this temporary corrective exception does not replace it.

**Gear Expansion Program — Genre Batch 6: Competitions / Wagers / Challenges.** State the rules, stakes, and prize before the player commits; an explicit stake must be deducted once and never exceed the agreed amount. A contest needs performance, observation, technique, or adaptation—not a binary “try” button—and its ending should explain the result. Prizes require clear provenance and an actual canonical grant; a win must not lead to an unlinked or merely narrated reward. Keep wagers finite (one authored round, no replay loop), provide a genuine withdrawal/no-stake path where appropriate, and ensure ties, partial results, and honest losses have their own payoff. The temporary corrective exception may exceed normal reward density; future mixed batches retain the 70% minimum and 75–80% preferred standard.

**Gear Expansion Program — Genre Batch 7: Wilderness Work / Fieldcraft / Backcountry Problems.** Let terrain, weather, animals, water, visibility, or isolation create the primary problem. Ground tracking in physical evidence; make spatial relationships clear; and let equipment or Knowledge open safer or better-informed options without guaranteeing success. Distinguish spring/winter eligibility from year-round content, show what changed after the Traveler’s field choice, and preserve animal-safe retreat where practical. Field Knowledge should be reusable and specific. Employer equipment remains temporary unless released explicitly. The temporary corrective exception may exceed normal reward density; future mixed batches retain the 70% minimum and 75–80% preferred standard.

**Gear Expansion Program — Genre Batch 8: Expedition Logistics / Supply / Staging / Field Operations.** Treat bulk expedition equipment as temporary story state, not Traveler inventory. Make load choices change later availability, show who has custody of shared tools, and distinguish a manifest from proof of contents or ownership. Use limited capacity as a narrative decision rather than an inventory minigame; reward partial success honestly, and make wages or issued Gear explicit. A Gear-focused corrective batch may exceed the normal reward-density guideline; ordinary mixed batches retain the 70% minimum and 75–80% preferred standard.

**Gear Expansion Program — Genre Batch 9: Equipment Testing / Inventors / Field Trials.** Give every prototype a concrete capability, operating limit, and plausible failure mode. Test within a legible safety envelope; show warning signs before risk and let the Traveler stop. A successful reading supports only the conditions tested—it does not certify an anchor, structure, animal load, or repaired mechanism. Transfer prototypes explicitly, and apply improvements to the existing item record rather than adding duplicate Gear or rarity tiers. Keep technology consistent with hand tools, simple optics, steam, lanterns, and telegraph. Corrective batches may temporarily exceed normal reward density; ordinary mixed batches retain the 70% minimum and 75–80% preferred guideline.

**Gear Expansion Program — Genre Batch 10: River / Ferry / Water Work.** Make water change the mechanics: state near/far bank, current direction, depth or uncertainty, footing, load, boat/ferry position, and safe shore access before choices depend on them. A rope, pole, hook, or bailer has a bounded use; it cannot erase current, weight, unknown depth, or a leak. Vary water work among transport, dock labor, repair, inspection, flood decisions, cargo, records, and ownership—not repeated person-in-water rescues. Keep temporary vessel and employer equipment out of persistent inventory unless explicitly released; return disputed property and show provenance for every kept item. All-year water conditions must not be mislabeled as seasonal hazards; seasonal eligibility should follow the actual premise. Corrective batches may temporarily exceed normal reward density; ordinary mixed batches retain the 70% minimum and 75–80% preferred guideline.

**Gear Expansion Program — Genre Batch 11: Agriculture / Ranch / Animal Work.** Make the rural work system—not merely an animal encounter—the source of the problem: fences, feed, water, tack, harvest timing, shared boundaries, and tool allocation should shape the story. Employer-issued tools stay temporary unless explicitly released. Animal Gear changes handling options without creating obedience; prioritize human and animal safety over property. Let evidence support theft or boundary decisions before confrontation, and pay wages or Gear only when the work agreement establishes them. Partial outcomes should name what was protected, delayed, damaged, or left for another worker. Seasonal restrictions should match harvest/weather, not rural scenery alone.

**Gear Expansion Program — Genre Batch 14: Medical / Rescue Support / Evacuation.** Keep the Traveler inside a layperson’s knowledge boundary: narrate visible conditions, preserve uncertainty, and let trained caregivers establish diagnoses or treatment plans. Gear can cover, support, shelter, signal, or carry; it cannot heal or make an unsafe route safe. Make the patient’s location, helpers, hazards, and exit route legible before movement choices. A safe wait, explicit handoff, or slower route is a real outcome, not a failure state. Caregiver and employer equipment stays temporary until its owner explicitly releases it, and rescue compensation should not make spontaneous compassion feel like a wage contract.

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
- [ ] For evidence-led stories, state what each physical trace supports and what it cannot establish; make accusations produce proportionate social consequences rather than unsupported certainty.
- [ ] For industrial work, establish the machine’s stopped/isolated state and the crew’s position before inviting contact; explain the physical fault, then distinguish a hand check, unloaded test, and loaded return to work.
- [ ] Treat employer tools as temporary unless a named owner releases a separate item; never imply that a completed repair alone authorizes restart or makes a damaged machine safe.

## Release checks

- [ ] Add tests for meaningful branches, state-aware prose, requirements, random incidents, legacy saves, and any item/history callback.
- [ ] Run scenario graph / dead-end validation and all project tests; do not weaken existing coverage.
- [ ] Test longest prose/hints, endings, reward views, and four-choice screens at 320×720 and 390×844; verify no page scrolling or horizontal overflow.
- [ ] Confirm exact-state resume, fictional-time persistence, QA isolation, Bank capacity, and safe reward resolution where relevant.
- [ ] Update the library status and continuity registry only for facts actually established by the scenario.

## Temporary Gear-expansion phase

The normal mixed-content batch guideline remains a minimum of 70% meaningful reward opportunity, with 75–80% preferred; qualifying outcomes include coins, reusable Knowledge, Lore, and Gear. A corrective Gear-focused genre batch may temporarily exceed that density while route-aware evidence shows Gear exposure remains abnormally low. This exception is temporary, does not require Gear grants on every route, and does not replace the normal mixed-batch guideline. Reassess after each bounded genre batch and return to the normal composition rule once ordinary Gear exposure is healthier.
