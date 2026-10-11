# Weekly Scenario Batch — Task Prompt

Use this prompt only when the Weekly Scenario Batch task is deliberately resumed. It does not resume, schedule, or publish anything by itself. The currently checked-in canonical authoring docs at run time are authoritative; this prompt is not a frozen copy of their rules.

---

You are preparing one new Let’s Go, Shall We? scenario batch in this repository. Work only in this repository. Do not change the scheduler or its paused/running state.

## Before planning or writing

1. Fetch current remote state; inspect branch, HEAD, and working-tree cleanliness. Preserve unrelated user work and stop if the working tree or unexpected branch divergence makes safe isolation unclear.
2. Read the current versions of:
   - `docs/ROADMAP.md`, especially **Automatic Scenario Creation**;
   - `docs/DESIGN_RULES.md`;
   - `docs/AUTHORING_CHECKLIST.md`;
   - `docs/CURRENT_SYSTEMS.md`;
   - `docs/CONTINUITY_EXPANSION_PROGRAM.md`;
   - relevant `docs/WORLD-CONTINUITY.md`, `docs/WORLD-CONTINUITY-REGISTRY.md`, `docs/TRAVELER-PROGRESSION.md`, `docs/ADVENTURE_LIBRARY.md`, and any system-specific guidance relevant to the proposed stories.
3. Treat those current checked-in documents and source/tests as authority. Old conversations, audit snapshots, prior weekly prompts, and earlier batch notes cannot override newer canonical guidance.
4. Perform a gap/duplication review before choosing a genre. Use the current scenario registry, recent additions, QA diversity/content-quality reports, selector/simulation evidence, and relevant Gear/Knowledge/Lore/economy systems. Identify the demonstrated gap, candidate concepts, near-duplicates rejected, and why the selected batch adds distinct player experiences.
5. Plan a coherent batch. The usual 20–25 scenario target and flexible continuity-opportunity mix are editorial guides, never quotas. Do not add filler, force rewards, or inflate Gear/Knowledge/Lore.

## Author and implement

Use stable scenario/scene IDs and canonical engine effects, requirements, selection, persistence, and reward systems. Keep all stories intelligible to a fresh Traveler unless an entire story is intentionally gated by exact existing continuity.

Apply the Mandatory pre-publication integrity gate in `docs/AUTHORING_CHECKLIST.md`. In particular, review every route for:

- **Setup and variants:** BASE PREMISE + ROUTE/KIT/HISTORY/KNOWLEDGE DETAIL + CHOICES. A variant may add or adapt detail but cannot suppress setup needed by downstream choices. Introduce threats, people, objects, ownership, job terms, hazards, locations, complications, evidence, and essential terminology before dependent choices. Keep setup once, not duplicated. Give callbacks a concise prior-event reminder, current problem, and decision.
- **Decision context and objective:** Make the Traveler’s role, action, and tradeoffs understandable when choosing. Judge/contest stories establish the event, judging role, result criteria that are legitimately open, and relevant prize/stakes. Preserve the established objective or earn an explicit shift; the ending resolves or deliberately relinquishes it and explains the practical result/payoff.
- **Fresh-Traveler agency:** Explore fresh-character routes with no useful optional Gear, no prior Knowledge/History, and ordinary starting state. Each reachable nonterminal decision state must have a meaningful legal action. Do not let overlapping or conditional Gear requirements suppress the last fallback. Do not add filler choices; use a natural alternative, safe exit, or a genuine non-choice transition.
- **Gear availability:** A Gear-specific choice requires the exact item carried in the active run and usable in its current condition. Banked, broken, inaccessible, or unrelated Gear does not satisfy a requirement or suppress a fallback. If the story supplies equipment, establish its source and use explicitly; employer equipment remains temporary unless its owner releases it.
- **Compensation accounting:** For each wage route, calculate balance still owed = agreed total − advances already paid, then include the advance exactly once when calculating total net coin change. For a wager, separately calculate stake paid, returned stake, gross winnings, and net coin change. Reconcile all fees, partial wages, bonuses, refunds, and costs. Verify exact timing, route qualification, and once-only behavior. Separate earned pay from optional Gear/material alternatives; do not pay full completion wages for refusal, failure, or partial work unless earned.
- **Knowledge timing:** Grant reusable Knowledge when the Traveler actually learns it. Route-dependent learning belongs only on the demonstrating route and persists across later pay/Gear/decline choices. Deferred instruction must explicitly be offered as teaching/showing/explaining/demonstrating; the instruction route learns it, material-pay routes do not. Do not persist common sense, unsupported speculation, generic advice, or a one-site conclusion merely to fill a reward menu.
- **Persistence and endings:** History, Lore, Contacts, Favors, Knowledge, Gear provenance, placement, and consequences must state only what this route establishes. Result scenes and endings must reflect selected method, outcome, reward, and current Traveler knowledge. Do not let shared closure claim facts true only on one incoming route.

Review shared builders and text variants separately: demonstrate that required common premise, variant detail, and the same valid choices survive rendering together, without omission or repeated setup.

## Test and release gate

Add focused route-level regression tests for significant requirements, effects, failures/refusals, compensation arithmetic, knowledge timing, variant rendering, route-specific endings, and save/reload behavior. Test fresh-character actionability and representative optional-Gear states, including absent and unusable equipment. Use registry validation and existing structural diagnostics; manually review suspicious automated findings rather than treating keywords as proof.

Before publication, run the project’s applicable tests, TypeScript, production build, registry validation, save/migration checks where relevant, and `git diff --check`. Verify scenario IDs/count and no unintended selector, Bank, normal-save/QA-save, progression, or reward changes. Do not publish if any mandatory authoring-rule, route-actionability, state, reward-accounting, or validation issue remains unresolved; report the blocker and evidence instead. Follow only the currently authorized branch/review/deployment workflow.

## Report

Report the gap analysis, concepts added and rejected, scenario IDs/count, distinct structures, route and fresh-Traveler checks, builder/variant review, reward-accounting outcomes, Knowledge/persistence decisions, tests and validation results, remaining limitations, and exactly which current canonical document revisions were read/applied. Do not claim exhaustive playtesting when only automated exploration or representative routes were checked.
