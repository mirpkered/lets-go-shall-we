# Continuity Expansion Program

The first fourteen approved genre batches were a corrective Gear Expansion Program: they improved practical Gear exposure, provenance, and nonmerchant acquisition. That work remains part of the program’s history. Beginning with Genre Batch 15, content deliberately advances three co-equal continuity lanes:

The registry also contains an earlier, unnumbered corrective Gear-content set (`GEAR_CORRECTIVE_ADVENTURES` in `src/scenarios/index.ts`). The numbered program runs from Genre Batch 1 through Genre Batch 16; references to “17 batches” mean that unnumbered set plus the sixteen numbered batches. There is no numbered Genre Batch 17 in this release candidate.

- Gear: practical equipment that creates options, subject to capacity and limitations.
- Knowledge: reusable, stable facts about methods or signs, with state-aware callbacks.
- Lore: remembered history, place, tradition, and institutional memory, recognized later without being treated as technical expertise.

## Primary continuity balance rule

For a mixed continuity batch, aim for roughly even primary representation among Gear, Knowledge, and Lore unless the genre strongly favors one. At 24 scenarios, 8/8/8 is a strong default. This is an editorial target, not a quota that overrides story quality. Every scenario still needs a meaningful persistent continuity opportunity; most should touch more than one lane over the full route or through later callbacks. Coins may be a legitimate choice but do not substitute for shallow or missing Gear/Knowledge/Lore design across the batch.

Knowledge answers “how or what should I recognize?” Lore answers “what does this place, event, or object mean?” Do not persist an incidental observation as either. Stable Knowledge belongs in `src/knowledgeFacts.ts`; exact Lore strings remain character memory and may be required by authored narration or choices. Existing character arrays and save migration preserve both; neither is Bank property.

## Genre Batch 15 — Construction / Building / Structural Work

Starting state: 811 adventures, 74 Gear IDs (72 carryable), and 11 canonical stable Knowledge keys. The previous library had 21 distinct authored Lore reward texts; Lore has historically been authored as scenario text rewards rather than a central catalog. The primary continuity matrix for this batch is exactly Gear 8 / Knowledge 8 / Lore 8. All 24 adventures are year-round; registry risk classification adds six LOW, eleven MODERATE, and seven HIGH stories. No new Gear ID was necessary: construction-capable catalog items already existed and had broader utility.

Gear-primary stories: The Square at Mill Street; The Roof That Held Its Breath; Three Knots on the Platform; The Wall Beneath the Plaster; The Riverward Retaining Wall; The Barn Door That Wasn’t Square; The Wedge at the Schoolhouse; The Last Board at Harper Yard.

Knowledge-primary stories: The Joint That Opened in Winter; The Shed with Two Roofs; The Brace Before the Bell; The Stone That Kept the Water; The Ladder in the West Yard; The Chimney That Pulled Away; The Ramp for the Grain Cart; The Tower Bell Anchor.

Lore-primary stories: The Tower Without Its Shadow; The Hall with the Mismatched Stone; The Shed at Ash Lot; The School Bell Frame; The Lodge Wall Under New Paint; The Bridge Camp Post; The Theater That Never Opened; The Old Well House.

Eight new Knowledge keys bring the canonical stable list to 19. They describe movement at joints, hidden water behind cladding, tower-brace warning signs, tracing water before sealing a wall, scaffold feet versus lashings, concealed fire damage, ramp bearing, and the relation between a tie rod and bracket. Each is granted once in its authored Knowledge-primary story; each has a later narration callback and a knowledge-gated comparison choice. Twelve distinct Lore reward texts bring the whole-library authored reward-text count to 33: eight Lore-primary histories plus four secondary discoveries in Gear-primary stories. Every new Lore entry has a later recognition callback and a Lore-gated choice. Callbacks change what the Traveler notices and can ask; they do not certify a structure or replace a qualified builder.

The existing Carpenter’s Square, Steel Wedge, Folding Bench Clamp, Pocket Toolkit, Collapsible Sounding Rod, Hand Auger, Travel Rope, Brass Plumb Bob, and Heavy Leather Gloves receive practical use. Eight Gear-primary stories offer explicit transfers of already-cataloged Gear, with owner/employer provenance. No equipment is silently taken from an active worksite.

Structural authoring lessons: state which member or footing carries the load; distinguish visible comparison from engineering certification; give the player a closure or withdrawal option before risky work; show the consequence of sequence choices; treat old marks as contextual evidence rather than proof; and make renovation discoveries lead to a question about preservation, ownership, or continued use.

The local registry after Batch 15 was 835 adventures: 59 ENCOUNTER, 760 effective ADVENTURE, 16 DEEP_EXPLORATION; effective risk counts were 296 LOW, 301 MODERATE, 198 HIGH, and 40 SEVERE. Gear catalog and the 1/2/3 capacity milestones were unchanged. Selector weighting and replay rules were unchanged.

## Primary continuity balance rule

For planned mixed-continuity batches, aim for roughly even primary representation among Gear, Knowledge, and Lore unless the genre strongly favors one. With about 24 Adventures, 8/8/8 is a useful editorial target, not a quota. Every story needs a meaningful continuity opportunity; most should connect at least two lanes. Knowledge is a reusable method or recognition skill; Lore is persistent understanding of history, place, and meaning. Neither lane should be padded with incidental facts.

## Consequence must carry weight

A meaningful player choice should sometimes change more than the immediate scene. Persistent consequences may affect possessions, money, injuries, relationships, information, threats, opportunities, or History. Outcomes must be understandable, causally connected, and proportionate to the risk the player chose. The game should foreshadow danger and preserve stated choice intent. Consequence is not punishment: persistent state should deepen continuity and create future texture, not merely penalize experimentation. Do not add a universal reputation score to represent isolated relationships.

## Genre Batch 16 — Courier / Mail / Telegraph / Message Work

Starting state: 835 Adventures, 74 Gear IDs (72 carryable), 19 stable Knowledge keys, and 33 distinct authored Lore reward texts. Batch 16 adds 24 all-year Adventures with an exact 8 Gear-primary / 8 Knowledge-primary / 8 Lore-primary split. It adds no Gear IDs: existing document, route, signal, and line-testing Gear already cover the useful persistent capabilities. Twelve stable Knowledge keys bring the catalog to 31; thirteen new authored Lore texts (eight primary, five secondary) bring the observed distinct authored Lore reward-text count to 46.

The batch treats delivery state as story state: accepted/refused, delivered/delayed, uncertainty disclosed, and confidentiality preserved/breached are explicit branches. Every story records a scenario-specific positive and negative outcome in History. The routes additionally exercise urgent timing, misinformation, wrong-recipient risk, public disclosure, economic delay, one signposted injury route, a message-interception threat, and one warned water-damage route. Those losses use existing run health, coins, item-condition, and History systems; no new persistence architecture or broad reputation system was introduced. Permanent Gear loss and authored death are absent. A consequence marker is not automatically a moral judgment: some consequences are mixed, and the player can preserve an honest record while still accepting delay or cost.

Sealed messages remain sealed unless the explicit open choice is taken. Opening leaves a persistent confidentiality History flag and a prior story, The Last Train Message, now recognizes that history in its clerk’s behavior. This is a targeted callback rather than a universal reputation system. Existing Gear provenance identifies the owner who transfers each tool; office property and temporary mail remain at the office. Employer-supplied mailbags and route books are not persisted.

Reusable communication rules: a sender’s copy does not prove receipt; a paid telegram does not prove authority; physical signs can indicate altered seals or copied text without identifying who changed it; delay can leave a message useful; recipients retain agency; confidentiality, urgency, and accuracy can conflict without a single automatic moral answer. Use visible urgency rather than hidden timers, and state exactly which text was delivered or withheld.

Post-Batch 16 local registry: 859 Adventures. The eight Knowledge-primary stories grant distinct handling/relay facts; selected Gear- and Lore-primary stories offer secondary Knowledge or Lore. Most stories touch at least two continuity lanes. At the time Batch 16 was completed, its changes were local and uncommitted; they are now included in the local release-candidate consolidation commit. Gear capacity, selector weights, and replay behavior are unchanged.

Route-aware paired measurement used the real selector/engine, five policies, 60 Travelers per policy/month, and July plus October (600 starts per library, before vs after). Batch 16 was selected 1,245 times across 30,000 simulated adventure selections (4.2%); those routes completed without death. It exposed a Gear offer on 35.8% of selected batch routes, placed an existing Gear item on 12.9%, granted Knowledge on 21.5%, Lore on 9.6%, and paid 559 total coins (about 0.45 per completed batch route). No new Gear was added. These are policy/sample estimates, not selector guarantees.

At completion 50, the paired post-batch profile had all three lanes on 21.4% of July Travelers and 45.9% of October Travelers; pre-batch rates were 5.7% and 31.1%. The October median Lore count moved from 0 to 1; July remained 0, so Lore remains less consistently accumulated than Gear/Knowledge. At completion 20, all-three was 9.9% in July and 16.9% in October after the batch (pre-batch 1.3% and 10.9%). Consequence-state exposure at completion 50 was: positive outcome History 51.2% July / 58.8% October; scenario-negative outcome History 91.1% / 90%; relationship/privacy markers 24.4% / 28.8%; explicit coin spend 1.2% / 2.9%; signposted injury History 1.8% / 2.4%; persistent Gear damage 0%; message uncertainty/disclosure 51.2% / 51.8%; interception threat 0% / 0.6%. “Negative” includes late, missed, or unresolved opportunity records and is not equivalent to injury or punitive loss. No route can silently remove persistent Gear, and the injury is run-scoped only.
