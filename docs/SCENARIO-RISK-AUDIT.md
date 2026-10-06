# Scenario Risk Audit

## Current registry update (2026-10-05)

The current registry after Escort / Protection Genre Batch 3 contains 541 scenarios. Effective risk counts are LOW 223, MODERATE 153, HIGH 125, and SEVERE 40. Selector formulas are unchanged.

Historical detailed risk audit of the original **175-adventure registry snapshot**. It is not a current full-library table. The 301-adventure counts below belong to that dated expansion snapshot. In the current 445-adventure registry, explicit `diversity.riskTier` is now authoritative for all 275 metadata-bearing scenarios; the remaining 170 older entries use the compatibility classifier until they are individually migrated. Current effective counts are LOW 197, MODERATE 115, HIGH 94, SEVERE 39 (see [Current Systems](CURRENT_SYSTEMS.md)). Risk class describes authored route danger, not tone, and does not change success odds once a scenario begins.

## Effective-risk reconciliation

Before reconciliation, 47 of 270 explicit risk declarations disagreed with the ID-based runtime classifier. The classifier now respects authored risk first, so all explicit values are effective. The disagreements mainly came from (1) newer entries absent from old ID lists, where runtime fell through to LOW or MODERATE despite explicit HIGH/SEVERE intent, and (2) stale ID-list entries overriding deliberate metadata, such as *The Iron Orchard* (SEVERE rather than HIGH), *The Witch at Miller’s Ford* (HIGH rather than LOW), and *The Book Without a Title* (LOW rather than MODERATE). These are now authored/effective. The final difference from the former fallback also includes five previously partial metadata rows and the three route-sensitive risk corrections below.

Five existing scenarios had partial diversity metadata but no authored tier. Their routes were reviewed and given explicit LOW risk: *What Did You See?*, *First Snow*, *The Thaw*, *Before the Frost*, and *New Year’s Eve*. The seasonal and testimony routes are calm, nonfatal situations; the story text makes this clear. Two HIGH classifications in the frontier claims batch were also corrected to LOW: *Claim Jumpers at Sundown* has unarmed visitors, an open road, and a documentation dispute; *The Claim That Pays Too Well* has suspicious but unrealized movement in a shed, with no confrontation or authored injury/loss route. Neither is dangerous merely because the premise is suspicious. *The Halloween Dare* moved from SEVERE to HIGH: entering the unsound toll house is a genuinely dangerous optional choice, but the scenario’s safe exterior rescue and refusal routes mean survival is not the central stake. These reviews apply the route-sensitive definitions and remove the requirement for new metadata-bearing content to depend on inferred risk.

The legacy fallback remains for the 170 entries with no `diversity` metadata. This is compatibility, not the authoring path. `validateScenarioMetadata` now rejects partial explicit metadata without `riskTier`. There is no save-schema migration: an active run retains its recorded risk tier, and already-recorded device risk history remains historical data. New normal starts use the reconciled tier.

## Selector impact

The category/risk/season/replay/long-run algorithms and target shares are unchanged. At the October test month, eligible tier weight shares moved slightly after correction: fresh traveler LOW/MODERATE/HIGH/SEVERE from 56.26/24.77/9.61/9.35% to 55.86/24.72/10.10/9.32%; at 20 completions from 40.05/27.68/20.60/11.67% to 39.58/27.41/21.43/11.58%; at 60 from 36.25/28.36/23.21/12.19% to 35.80/28.02/24.09/12.09%. In the July pool the changes are smaller still (for a fresh traveler LOW/MODERATE/HIGH/SEVERE moves 56.38/24.62/9.67/9.32% to 56.52/24.54/9.67/9.28%). Eligibility and category weights are identical before/after at July and October, and the long-run pressure curve is unchanged. The estimated share of selectable scenarios with an authored death ending declines from 16.94% to 15.53% for a fresh October traveler, 28.05% to 24.92% at 20 completions, and 30.68% to 27.12% at 60. This is scenario-selection exposure, not the probability a run ends in death; actual route and player choices still govern outcomes. The decrease reflects legacy assignments that elevated optional or unsupported lethal routes; it is intentional. Risk tier still does not alter internal event odds.

## Tier definitions

- **LOW** — little or no credible player-death risk; mostly social, work, peaceful travel, commerce, or pleasant activity. Costs are generally time, money, comfort, opportunity, or relationships.
- **MODERATE** — injury or serious material loss is possible; danger may emerge through a branch, but fatality is not a defining authored outcome.
- **HIGH** — meaningful physical peril and possible death in a consequential branch; mitigation or retreat is often available, not guaranteed.
- **SEVERE** — survival is central; lethal outcomes are a major authored possibility and even sensible action can retain risk.

## Library register

“Authored death ending” means the adventure contains a terminal scene marked death. “Health loss” means an action can reduce health; by itself this does not mean death is guaranteed. “Death changed” is No throughout this pass: targeted hazard adventures already had their fatal outcomes or state-driven fatal health loss, so no redundant fatal branches were added. LOW adventures are intentionally kept low-risk.

| ID | Adventure | Tier | Authored death ending | Health loss | Death changed | Intentionally low-risk | Major non-death stakes / review note |
|---|---|---:|:---:|:---:|:---:|:---:|---|
| `broken-bell` | For Whom the Bell Tolls | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `last-stop` | All Aboard! | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `aww-rats` | Aww, Rats!! | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `whats-mine` | What’s Mine is Mine | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-last-room` | The Last Room on the Left | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `dead-mans-hand` | Dead Man’s Hand | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `bridge-out` | Bridge Out | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-long-way-home` | The Long Way Home | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `no-vacancy` | No Vacancy | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `cold-storage` | Cold Storage | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `high-water` | High Water | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `one-more-round` | One More Round | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-road-below` | The Road Below | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `smoke-on-the-hill` | Smoke on the Hill | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-empty-cradle` | The Empty Cradle | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `last-light-at-millers-crossing` | Last Light at Miller’s Crossing | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-weight-of-gold` | The Weight of Gold | HIGH | No | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `hush-now` | Hush Now | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `taking-on-water` | Taking on Water | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `down-to-the-last-match` | Down to the Last Match | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-man-in-the-ditch` | The Man in the Ditch | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-burning-loft` | The Burning Loft | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `under-the-ice` | Under the Ice | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `the-borrowed-horse` | The Borrowed Horse | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `a-seat-by-the-fire` | A Seat by the Fire | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-sound-in-the-well` | The Sound in the Well | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `the-broken-wheel` | The Broken Wheel | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `three-miles-to-rain` | Three Miles to Rain | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-empty-wagon` | The Empty Wagon | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-bell-after-midnight` | The Bell After Midnight | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `one-horse-short` | One Horse Short | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-missing-boat` | The Missing Boat | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `after-the-storm` | After the Storm | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-last-ferry` | The Last Ferry | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-fallen-tree` | The Fallen Tree | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-loose-team` | The Loose Team | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-washout` | The Washout | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `poison-the-well` | Poison the Well | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `finders-keepers` | Finders Keepers | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `only-one-bullet` | Only One Bullet | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-blue-hole` | The Blue Hole | SEVERE | Yes | Yes | No | No | Survival-focused hazard; lethal outcomes are a major possible consequence. |
| `silent-night` | Silent Night? | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `bear-with-me` | Bear with Me | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `give-me-whatcha-got` | Give Me Whatcha Got | HIGH | Yes | Yes | No | No | Meaningful physical peril; mitigation/retreat may help, but accumulated injury or an authored branch can be fatal. |
| `the-long-drive` | The Long Drive | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `fence-line` | Fence Line | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `harvest-hand` | Harvest Hand | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `freight-to-millers-fork` | Freight to Miller’s Fork | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-roof-before-rain` | A Roof Before Rain | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `night-watch` | Night Watch | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `unload-before-dark` | Unload Before Dark | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-mill-job` | The Mill Job | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `cutting-timber` | Cutting Timber | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-delivery-run` | The Delivery Run | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `payment-in-kind` | Payment in Kind | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `short-on-the-wages` | Short on the Wages | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `market-day` | Market Day | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-horse-trade` | The Horse Trade | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-broken-crate` | The Broken Crate | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `half-now` | Half Now | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `somebody-elses-land` | Somebody Else’s Land | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-pawned-tool` | The Pawned Tool | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `last-room-higher-price` | Last Room, Higher Price | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `who-owns-the-mule` | Who Owns the Mule? | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-town-pump` | The Town Pump | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `one-boat-too-many` | One Boat, Too Many People | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-meeting-hall` | The Meeting Hall | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `what-did-you-see` | What Did You See? | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-burnt-barn-fund` | The Burnt Barn Fund | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `winter-stores` | Winter Stores | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-road-crew` | The Road Crew | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `a-place-to-bury-him` | A Place to Bury Him | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-stray-fire` | The Stray Fire | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-closed-road` | The Closed Road | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-faint-trail` | The Faint Trail | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `camp-before-dark` | Camp Before Dark | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-shortcut` | The Shortcut | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `creek-on-the-return` | Creek on the Return | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-fog-comes-down` | The Fog Comes Down | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `dry-camp` | Dry Camp | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-ridge-or-the-valley` | The Ridge or the Valley | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `marks-on-the-trail` | Marks on the Trail | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-night-of-wind` | A Night of Wind | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-second-sunset` | The Second Sunset | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-stray-horse` | The Stray Horse | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-calf-in-the-mud` | The Calf in the Mud | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-dog-that-returns` | The Dog That Returns | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-broken-harness` | The Broken Harness | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `loose-in-the-market` | Loose in the Market | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-ownerless-mule` | The Ownerless Mule | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-injured-dog` | The Injured Dog | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-frightened-team` | The Frightened Team | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-bee-yard` | The Bee Yard | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-old-horse` | The Old Horse | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `market-afternoon` | Market Afternoon | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `gone-fishing` | Gone Fishing | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-county-fair` | The County Fair | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-game-of-cards` | A Game of Cards | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-swimming-hole` | The Swimming Hole | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `supper-with-strangers` | Supper with Strangers | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-music-outside` | The Music Outside | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-old-mans-story` | The Old Man’s Story | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-good-nights-sleep` | A Good Night’s Sleep | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `skipping-stones` | Skipping Stones | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-injured-traveler` | The Injured Traveler | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `thats-my-horse` | That’s My Horse | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-empty-purse` | The Empty Purse | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-very-good-deal` | A Very Good Deal | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-broken-promise` | The Broken Promise | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-landlords-story` | The Landlord’s Story | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-missing-sack` | The Missing Sack | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `a-borrowed-coat` | A Borrowed Coat | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-false-guide` | The False Guide | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-debt-at-supper` | The Debt at Supper | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-lantern-in-the-marsh` | The Lantern in the Marsh | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-house-that-knocks` | The House That Knocks | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-grave-bell` | The Grave Bell | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-passenger-who-wasnt-there` | The Passenger Who Wasn’t There | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-cold-room` | The Cold Room | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-voice-in-the-mine` | The Voice in the Mine | MODERATE | No | Yes | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-woman-at-the-crossing` | The Woman at the Crossing | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-black-dog` | The Black Dog | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-room-with-no-door` | The Room with No Door | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-bell-beneath-the-water` | The Bell Beneath the Water | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-long-night` | The Long Night | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-doctor-is-three-miles-away` | The Doctor Is Three Miles Away | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `when-the-baby-comes` | When the Baby Comes | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-red-flag` | The Red Flag | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-telegram` | The Telegram | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-wrong-letter` | The Wrong Letter | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-second-message` | The Second Message | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `wire-down` | Wire Down | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-last-train-message` | The Last Train Message | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `property-of` | Property Of... | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `to-the-magistrate` | To the Magistrate | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-warrant` | The Warrant | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-will` | The Will | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `home-before-dark` | Home Before Dark | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-visitor` | The Visitor | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-back-door` | The Back Door | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-wake` | The Wake | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-church-supper` | The Church Supper | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-old-burial-ground` | The Old Burial Ground | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `at-the-forge` | At the Forge | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-morning-edition` | The Morning Edition | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `hold-still` | Hold Still | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-undertakers-request` | The Undertaker’s Request | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-watchmaker` | The Watchmaker | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `before-the-steamer-leaves` | Before the Steamer Leaves | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-missing-crate` | The Missing Crate | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `locked-through` | Locked Through | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `at-the-landing` | At the Landing | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `first-snow` | First Snow | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `the-thaw` | The Thaw | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `before-the-frost` | Before the Frost | MODERATE | No | No | No | No | Injury, exposure, animal/terrain trouble, or serious time/material loss. |
| `new-years-eve` | New Year’s Eve | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-traveling-players` | The Traveling Players | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-miracle-tonic` | The Miracle Tonic | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `three-rounds` | Three Rounds | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `dance-until-midnight` | Dance Until Midnight | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-speaker` | The Speaker | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `you-must-be-the-new-man` | You Must Be the New Man | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `thats-him` | That’s Him | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `we-were-expecting-someone-else` | We Were Expecting Someone Else | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-package` | The Package | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `collection-day` | Collection Day | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `out-by-sundown` | Out by Sundown | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-mule-is-mine` | The Mule Is Mine | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-sealed-crate` | The Sealed Crate | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `find-her` | Find Her | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `dear-mary` | Dear Mary | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-locket` | The Locket | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `supper-for-two` | Supper for Two | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `the-childrens-court` | The Children’s Court | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |
| `still-waiting` | Still Waiting | LOW | No | No | No | Yes | Social, economic, opportunity, or quiet-story stakes; deliberately not escalated. |

## Selection review

Normal selection first applies the existing five-adventure repeat exclusion, with graceful fallback for a small pool. It then softly weights available tier shares. Fresh travelers have a broad pool weighted toward LOW/MODERATE (56% / 27% / 13% / 4% before availability adjustment). With longevity the targets move smoothly toward 27% / 32% / 30% / 11%. A recent LOW streak nudges risk upward; recent HIGH/SEVERE runs let it relax. These are probabilities, not a schedule: there is no fixed “danger every N adventures” cadence, no tier is guaranteed, and every weight is nonzero when that tier remains eligible.

The selected scenario’s internal chance, combat, health, and consequence values are never modified by traveler completion count or recent risk history. Abandonment still affects repeat exclusion, but only completed/death endings enter risk history. QA uses a separate save and does not affect normal selection history.

## Focused review notes

- The named fire, smoke, freezing, water, ice, mine, collapse, runaway-team, armed-confrontation, and dangerous-animal adventures were checked against authored terminal death and health-loss mechanics. Existing lethal routes include warnings and consequence/escalation; examples include Under the Ice, The Burning Loft, High Water, Taking on Water, The Missing Boat, The Loose Team, Bear with Me, Only One Bullet, and the hazardous wreck/mine stories.
- Smoke on the Hill already allows a failed smoky entry to become fatal when the traveler is already badly hurt; its tests cover the warning, retreat, and survival alternatives. No extra instant-death option was added.
- Peaceful days, ordinary commerce, community, communication, seasonal, and social stories remain LOW where no meaningful physical danger is authored. Supernatural atmosphere alone does not raise a tier.
- Owned assets, carried gear, money, transport, and relationships remain available as authored stakes; this pass adds no random property deletion or hidden loss.
- Existing no-perfect-outcome emphasis should stay limited: **Under the Ice** (the rescue can cost the traveler, Calder, or both), **The Burning Loft** (the minutes and help available cannot guarantee the person, animals, and farmhouse are all saved), and **High Water** (rising-water work windows force prioritization among people, livestock, medicine, and property). These are existing authored tradeoffs, not new punishments added by selection weighting.
