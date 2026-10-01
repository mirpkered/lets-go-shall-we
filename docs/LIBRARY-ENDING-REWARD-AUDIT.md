# Library Ending, Payoff & Reward Audit

Baseline: main at `f22ba58e3467bf49243371b4438107d25455c1fb`, before the original audit pass. The registry at that baseline contained **175 playable adventures**. The current registry was rechecked during the 2026-10-01 documentation reconciliation and also contains 175. This report’s route and reward measurements remain a dated structural snapshot, not a freshly recomputed analysis of every later authored edit; scenario source/tests are authoritative for current behavior. This is an internal audit, not player-facing content.

## Method and limits

Route length is an approximate count of scene screens (including terminal card), computed over authored next and chance-success/failure edges while excluding obvious opt-out labels. “Typical” is an equal-edge average, not a measured player path or duration; requirements, choice preference, and probabilistic weighting are not modeled. Reward columns scan authored choice effects for possible positive money, carryable item gains, and history/knowledge/lore; availability is route-dependent. “Payoff beat” and “quiet ending” are text/structure signals, not proof of quality. “Short abrupt-route signal” identifies a shortest engaged route of three or fewer scenes with no recognizable payoff-text cue; it is a deliberately conservative triage signal, not an editorial verdict.

The six named playtest cases were checked against their full current authored routes. One Horse Short, Three Miles to Rain, The Missing Boat, and Smoke on the Hill already had payoff beats in baseline and were retained. The Last Ferry and The Loose Team were changed in this pass. No generic “choose a keepsake” reward was found: the post-ending placement panel only handles named persistent items actually earned by the scenario; carry/Bank/decline remains explicit and choose-one offers remain distinct.

Possible reward presence in baseline (scenario can award this on at least one route): money **44/175**, carryable items **27/175**, history flags **109/175**, knowledge **83/175**, lore **6/175**. These overlap and are not frequency guarantees. Many adventures intentionally conclude with narrative/history rather than material payment. Employment and explicit paid-work stories were cross-checked for authored money effects; no broad reward inflation was justified.

## Scenario inventory

| Adventure | Shortest route (screens) | Typical route (screens) | Payoff beat? | Carryable reward? | Money? | History / lore / knowledge? | Quiet ending? | Short abrupt-route signal? | Recommendation |
|---|---:|---:|---|---|---|---|---|---|---|
| For Whom the Bell Tolls | 7 | 13.6 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| All Aboard! | 7 | 12.3 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Aww, Rats!! | 8 | 8.9 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| What’s Mine is Mine | 3 | 9 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Last Room on the Left | 6 | 9.3 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Dead Man’s Hand | 5 | 7.1 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Bridge Out | 2 | 4.1 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Long Way Home | 2 | 5.6 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| No Vacancy | 5 | 5.5 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Cold Storage | 5 | 6.7 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| High Water | 2 | 8.2 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| One More Round | 4 | 7.5 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Road Below | 4 | 7.3 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Smoke on the Hill | 3 | 6.7 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Empty Cradle | 2 | 6.5 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Last Light at Miller’s Crossing | 2 | 6.2 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Weight of Gold | 4 | 6.4 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Hush Now | 4 | 7.4 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Taking on Water | 4 | 7.4 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Down to the Last Match | 8 | 11.2 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Man in the Ditch | 4 | 7.1 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Burning Loft | 3 | 5 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Under the Ice | 3 | 3.9 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Borrowed Horse | 2 | 2.5 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Seat by the Fire | 2 | 2.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Sound in the Well | 2 | 3.6 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Broken Wheel | 2 | 2.9 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Three Miles to Rain | 2 | 2.9 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Empty Wagon | 3 | 3.6 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Bell After Midnight | 2 | 2.7 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| One Horse Short | 2 | 2.5 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Missing Boat | 3 | 4.1 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| After the Storm | 3 | 3.6 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Last Ferry | 3 | 4.2 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Fallen Tree | 3 | 3.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Loose Team | 3 | 3.4 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Washout | 3 | 3.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Poison the Well | 4 | 5.1 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Finders Keepers | 2 | 2.3 | Yes* | Yes | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Only One Bullet | 2 | 3.1 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Blue Hole | 2 | 2.8 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Silent Night? | 2 | 3.4 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Bear with Me | 2 | 4.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Give Me Whatcha Got | 3 | 3.7 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Long Drive | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Fence Line | 3 | 3.3 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Harvest Hand | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Freight to Miller’s Fork | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Roof Before Rain | 3 | 3.3 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Night Watch | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Unload Before Dark | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Mill Job | 3 | 3.3 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Cutting Timber | 3 | 3.3 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Delivery Run | 3 | 3.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Payment in Kind | 2 | 2 | Yes* | Yes | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Short on the Wages | 2 | 2.7 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Market Day | 2 | 2 | Yes* | Yes | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Horse Trade | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Broken Crate | 2 | 2.5 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Half Now | 3 | 3 | Yes* | Yes | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Somebody Else’s Land | 2 | 2.7 | Yes* | No | Yes | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Pawned Tool | 2 | 2.7 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Last Room, Higher Price | 2 | 2.4 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Who Owns the Mule? | 3 | 3.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Town Pump | 2 | 2.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| One Boat, Too Many People | 2 | 2.6 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Meeting Hall | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| What Did You See? | 2 | 2.8 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Burnt Barn Fund | 2 | 2 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Winter Stores | 2 | 2.3 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Road Crew | 2 | 2.8 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Place to Bury Him | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Stray Fire | 2 | 2.7 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Closed Road | 2 | 2.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Faint Trail | 2 | 2.5 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Camp Before Dark | 2 | 2.2 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Shortcut | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Creek on the Return | 2 | 2.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Fog Comes Down | 2 | 2.7 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Dry Camp | 2 | 2.2 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Ridge or the Valley | 2 | 2.7 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Marks on the Trail | 2 | 2.5 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Night of Wind | 2 | 2.4 | No* | No | No | Yes | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| The Second Sunset | 2 | 2.7 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Stray Horse | 3 | 3.5 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Calf in the Mud | 2 | 3.4 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Dog That Returns | 2 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Broken Harness | 2 | 2.9 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Loose in the Market | 2 | 2.7 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Ownerless Mule | 3 | 3.7 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Injured Dog | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Frightened Team | 2 | 3.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Bee Yard | 2 | 2.8 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Old Horse | 3 | 3.8 | No* | No | No | Yes | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| Market Afternoon | 2 | 2 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Gone Fishing | 2 | 2.3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The County Fair | 2 | 2 | No* | No | No | Yes | No* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| A Game of Cards | 2 | 2 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Swimming Hole | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Supper with Strangers | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Music Outside | 2 | 2 | No* | No | No | Yes | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| The Old Man’s Story | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Good Night’s Sleep | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Skipping Stones | 2 | 2.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Injured Traveler | 2 | 2.8 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| That’s My Horse | 3 | 4 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Empty Purse | 3 | 3.5 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Very Good Deal | 2 | 2.8 | Yes* | Yes | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Broken Promise | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Landlord’s Story | 3 | 3.7 | Yes* | No | No | No | No* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Missing Sack | 3 | 3.1 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| A Borrowed Coat | 2 | 2.2 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The False Guide | 2 | 2.6 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Debt at Supper | 2 | 2.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Lantern in the Marsh | 2 | 3 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The House That Knocks | 3 | 3.6 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Grave Bell | 3 | 3.8 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Passenger Who Wasn’t There | 2 | 3.1 | No* | No | No | Yes | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| The Cold Room | 2 | 2.6 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Voice in the Mine | 2 | 3.2 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Woman at the Crossing | 2 | 2.6 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Black Dog | 2 | 3.3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Room with No Door | 3 | 4 | Yes* | No | No | Yes | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Bell Beneath the Water | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Long Night | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Doctor Is Three Miles Away | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| When the Baby Comes | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Red Flag | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Telegram | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Wrong Letter | 3 | 3 | Yes* | No | No | No | No* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Second Message | 3 | 3 | No* | No | No | No | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| Wire Down | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Last Train Message | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Property Of... | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| To the Magistrate | 3 | 3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Warrant | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Will | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Home Before Dark | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Visitor | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Back Door | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Wake | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Church Supper | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Old Burial Ground | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| At the Forge | 3 | 3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Morning Edition | 3 | 3 | Yes* | No | Yes | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Hold Still | 3 | 3 | Yes* | No | Yes | No | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Undertaker’s Request | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Watchmaker | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Before the Steamer Leaves | 3 | 3 | No* | No | Yes | No | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| The Missing Crate | 3 | 3 | No* | No | No | No | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| Locked Through | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| At the Landing | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| First Snow | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Thaw | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Before the Frost | 3 | 3 | Yes* | No | Yes | No | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| New Year’s Eve | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Traveling Players | 3 | 3 | Yes* | No | Yes | No | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Miracle Tonic | 3 | 3 | Yes* | No | Yes | No | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Three Rounds | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Dance Until Midnight | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Speaker | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| You Must Be the New Man | 3 | 3 | Yes* | No | Yes | No | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| That’s Him | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| We Were Expecting Someone Else | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Package | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Collection Day | 3 | 3 | Yes* | No | Yes | No | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Out by Sundown | 3 | 3 | No* | No | Yes | No | Yes* | Yes* | Review short resolution path; confirm the terminal scene itself supplies payoff. |
| The Mule Is Mine | 3 | 3 | Yes* | No | Yes | No | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Sealed Crate | 3 | 3 | Yes* | No | Yes | No | No* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Find Her | 3 | 3 | Yes* | No | Yes | No | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Dear Mary | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| The Locket | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| Supper for Two | 3 | 3 | Yes* | No | No | Yes | Yes* | No* | No library-wide change indicated by structural scan; keep reward/payoff fiction-led. |
| The Children’s Court | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |
| Still Waiting | 3 | 3 | Yes* | No | No | No | Yes* | No* | Confirm story-only outcome is intentional; no gear quota. |

* Heuristic signal; it cannot replace reading the route. “Payoff beat” means authored text contains a consequence/aftermath cue; “quiet ending” means the narrative has quiet/rest/wait-type content.

## Focused decisions

- **One Horse Short:** the responsible return-to-stable route already moves through farmStable and stableDeparture before completion. Horse safety, lost note, and forfeited fee are explicit; no extra crisis or reward added.
- **Three Miles to Rain:** the repaired-cart / shared-shelter branch already reaches sharedShelter before its terminal scene. The quiet conversation and bread are preserved.
- **The Last Ferry:** added nightAtLanding between every overnight wait and the existing morningFerry ending; the traveler experiences the night, the far-bank travelers’ shelter, and the dawn repair before crossing.
- **The Loose Team:** added four short aftermath scenes for turned team, turned wagon, stopped team, and lost/damaged wagon. Warning success/failure remains distinct, the handler’s position is respected, injuries are acknowledged when applicable, and legacy ending IDs remain unchanged for active saves. No artificial payment was added; the handler’s thanks and practical aftermath close the event.
- **The Missing Boat:** existing safeLanding shows the ferry-assisted rescue before rescueEnding; opening banks/channel/gravel-bar geometry and Myrna’s inability to free the loaded punt are explicit. No redundant edit.
- **Smoke on the Hill:** existing houseAftermath precedes completion and uses current-run knowledge for named barn occupants; unknown fates remain unknown. No redundant edit.

## Reward system and follow-up

Carry-or-Bank placement, explicit decline, choose-one reward handling, full-carry/full-Bank safeguards, five-item Bank capacity, and deduplication were already present in baseline and retained. Traveler progression credit remains separate from global completion and story rewards. No new carryables were necessary: the measured gap is uneven payoff clarity, and item proliferation would flatten the existing item roster.

The table’s short-route signals are intended as a living triage queue. Opt-out endings, deliberately reflective endings, and endings whose terminal text is conclusive remain valid. Future editorial review should prioritize short, non-opt-out resolution paths without a consequence beat; avoid changing rows solely to increase scene counts or reward totals.
