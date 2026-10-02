# Comedy / Absurdity Batch: Overlap and Authoring Record

This pass reviewed the current 406-adventure registry before authoring. The existing library already contains *The Miracle Tonic*, multiple animal stories, the three recent surprise-anthology groups, *The Children’s Court*, fair contests, mistaken invitations/names, a public apology, a missing parcel, a reversed notice, baggage handling, a novelty clock, a balancing-table demonstration, music/performance stories, and the seasonal Christmas-goose/pageant stories. The six standing comedy rules were already in `DESIGN_RULES.md`; they were preserved, not recopied. Earlier crime-rule edits were left untouched.

## Candidate comparison

| New adventure | Nearest existing material | Why the story engine remains distinct |
|---|---|---|
| The Doorway Delivery | Furniture/property and work stories | A wardrobe physically fits each straight segment but not the stair turn; the decision is about disassembly, risk to old wood, and the deadline. |
| The Queue with Two Ends | Queue/market and dispute stories | A partition created two apparently valid heads of one post-office line; the traveler proposes a fair ordering rule without adjudicating memory. |
| The Clerk’s Second Stamp | Reversed notice and procedural stories | A clerk’s repeated stamping error affects one practical certificate; the resolution identifies what the form actually needs, not a public notice or civic vote. |
| The Patient Pig | Christmas Goose, Old Horse, fair and livestock stories | No animal escapes, is disputed, or needs rescue; an unhurried pig changes the judging rule and challenges performance expectations. |
| The Wardrobe on the Roof | The Doorway Delivery; animal/roof rescues | A windblown laundry basket sits on a visibly weak stable roof; the physical task is safe retrieval from below, with damaged laundry/basket as a modest cost. |
| The House with Two Doorbells | Mistaken identity/invitation stories | The misunderstanding is caused by two real, adjacent entrances and indistinguishable bells; a small marking/moving choice changes future deliveries. |
| The Town Clock’s Argument | *The Clock That Kept Local Time* and clock demonstrations | No clock has a hidden mechanism or supernatural pace; two valid clocks serve different schedules, and the solution is to name the reference needed for a delivery. |
| The Baker and the Brown Paper | *The Parcel with No Address*, luggage, and market stories | Two correctly addressed bakery orders share identical wrapping; the traveler uses order records and contents to prevent a routine handoff error. |
| The Sixth Chair | Shared-meal and umbrella/resource stories | A rocking stool and fragile parcel shape seating at a boarding-house table; the payoff concerns inclusion and rotating places, not a journey under one umbrella. |
| The Pigeon Postscript | Lost-pet, message, and animal stories | A pigeon itself is present with two notes tied to it; privacy and message provenance matter after the bird is released. It is not a missing parcel or ownerless animal. |
| The Tinsmith’s Tiny Door | *The Tilt Table*, *The Clockmaker’s Demonstration*, and trade stories | A scale model is mistaken for a usable appliance; the player helps correct the claim and clarify the maker’s purpose rather than expose a mechanical trick. |
| The Barnyard Weather Report | Animal stories and weather-travel adventures | The rooster is not a supernatural omen or emergency; visible clouds and ordinary feeding routine test what can honestly be inferred from a folk saying. |
| The Paper Mill Parade | Pageant, sign, parade-band, and performance stories | A blank banner has competing messages for a specific returning worker and school fundraiser; the traveler helps preserve both meanings through route-aware display. |
| The Mayor’s Missing Gavel | Town meetings, procedural disputes, and bell stories | The missing object is only a symbol; the real consequence is whether residents can begin a school-roof decision and choose a work morning. |
| The Milkman and the Moon | Market/merchant stories and *The Lamp Left in the Window* | A paid standing delivery continues to an empty house; the issue is how to handle a real order, perishable goods, and a neighbor’s limited consent. |
| The Court of the Courtyard | *The Ownerless Mule*, *That’s My Horse*, and other ownership disputes | A hen is not missing or claimed by strangers; two caretakers both contribute, and behavior cannot deliver a verdict, so the result is an explicit interim care arrangement. |
| The Drying Room Schedule | Rain, inn, and shared-resource stories | Six guests share one stove-side drying rack with a real clearance constraint; the solution is a safe rotation, not shelter choice or personal fuel allocation. |
| The Sheep-Counting Exam | Animal rescue and farm-work stories | The sheep are safe; a moving flock makes a simple count unreliable, so the story compares methods and gives performance feedback. |
| The Pearl Button | *The Cobbler’s Last Pair* and merchant/craft stories | A tailor must handle a customer’s mismatched replacement; the choice concerns fit, disclosure, and avoiding a second charge, not a missing heirloom. |
| The Wagon-Wheel Meeting | *The Meeting Hall* and road-crew stories | The wheel is a fixed marker and the physical meeting layout defeats audibility; the traveler helps the group hear each other and identify an inspection step. |
| The Ferryman’s Sign | Ferry/river stories and reversed-notice story | The sign is stale because the river moved the safe landing; the traveler prevents a needless walk and makes the new route legible. |
| The Watermelon on the Scale | Market and commerce stories | The final proposal audit judged the “customer sits on the scale” gag too close to a simple market dispute and too dependent on a one-joke payoff. Dropped before registration. |
| The Parlor Orchestra Audition | Music Outside, Tin-Can Orchestra, and other performance stories | The final proposal audit judged another tempo/ensemble audition insufficiently distinct from existing performance stories. Dropped before registration. |
| The Backwards Courtroom | Courtroom/ownership dispute stories | A chair faces a wall after a room rearrangement; fixing the hearing layout is distinct from deciding the underlying fence case, which stays unresolved for proper evidence. |
| The Misplaced Pigeonhole | *The Parcel with No Address*, reversed notice, and message stories | Room labels were physically reversed; the core decision is handling sealed private mail with privacy intact, not identifying an unknown recipient. |
| The Salute from the Wrong Porch | Wrong-name/invitation and small-social-moment stories | Two neighbors independently return a courteous signal and each thinks the other began it; the traveler can reveal mutual kindness without assigning blame. |
| The Candle Ends | Merchant/dispute stories and *The Miracle Tonic* | A used candle’s cause of failure cannot be proven; a repeatable test and proportionate replacement settle a modest craft-quality disagreement without a cure claim or fraud plot. |

The two proposals marked “dropped” are not registered or exposed in QA. They were replaced by the distinct sheep-counting and porch-salute premises, respectively. The final registered batch has 25 stories.

## Quality and variety notes

The new stories are all-year, grounded, low-risk, and use the canonical registry, metadata, selection, QA, save, and ending systems. They add no items, rewards, currencies, player stats, or mechanics. Fictional outcomes instead include corrected forms/signs, fair queue order, a safe retrieval, improved work/service routines, a clearly scoped shared agreement, and appropriate uncertainty. Several are intentionally short; stories entered in good faith develop through a second decision and a visible follow-through rather than ending at the first task.

The structures vary among spatial handling, a witnessed queue, form correction, animal-led judging, shared access, clock-reference comparison, order verification, seating rotation, animal/message care, demonstration clarification, folk-belief observation, banner authorship, meeting logistics, route signage, counting method, repair disclosure, and a mutual social custom. No new adventure uses a runaway team, luggage swap, mistaken identity, card wager, tonic sale, or generic tavern quarrel as its central engine.

Graph, metadata, mobile-copy, normal-selection simulation, and direct-QA checks are in `src/scenarios/comedyAbsurdityBatch.test.ts`. Similarity tooling remains an authoring warning; the comparison above is the manual duplicate review, not a claim that coarse metadata similarity equals duplication.
