# Traveler Experience Through Survival

Travelers do not gain levels, experience points, permanent stat upgrades, or account-wide progression. Their growing experience is represented by practical preparedness carried forward by that living character.

## Completion count

The traveler’s progression count increases at most once when a run reaches and resolves an authored terminal ending. A run qualifies when its ending is explicitly marked substantive, or when persistent carried inventory or money differs from the run-start snapshot. Adventure length alone does not determine qualification: a short completed job can count, while a long but explicitly non-substantive refusal can be excluded. Temporary, borrowed, or supplied run gear does not qualify by itself. QA/test runs and explicit abandonment never advance progression; browser closure preserves the active run without counting. A resumed run is evaluated only when its ending and any reward placement are resolved.

The local traveler progression count is distinct from the shared global authored-completion total. Every normal authored ending still records globally, including an early walk-away, while traveler progression uses authored outcome and persistent-state criteria. Separate per-run markers make the two records independently idempotent; QA endings change neither count.

Forward story-transition count remains available as a QA diagnostic and authoring metric. Ordinary story scenes count by default. A scene authored solely to continue the same beat across a presentation/no-scroll split can set `countsForProgression: false`. UI panels, inventory views, the Bank, dialogs, and QA controls do not use story transitions and never affect progression qualification.

Character-bound property such as an owned animal is recorded separately from carried Gear. It appears in the traveler’s inventory, uses no Gear or Supply capacity, and is not bankable. Such property ends with its traveler at death, abandonment, or retirement.

## Carry capacity

| Qualifying adventures completed by this traveler | Persistent Gear capacity |
| --- | ---: |
| 0–9 | 1 Gear item |
| 10–19 | 2 Gear items |
| 20+ | 3 Gear items |

The new Gear slot unlocks after the milestone adventure ends, before the next adventure begins. Three Gear slots is the current maximum. Capacity belongs to one traveler and resets to one when that traveler dies, is abandoned, or retires. Relics are tracked separately and do not consume Gear capacity; a soft reminder at three Relics is not a hard limit. The Bank remains separate, persists across travelers, and retains its five-item capacity.

## Inventory classes

- **Gear**: reusable equipment whose persistent loadout is limited by Gear capacity. Condition and item-specific upgrades belong to its stable item ID.
- **Relic**: a rare persistent object tracked separately from practical Gear. Relics can be carried or banked without using Gear slots.
- **Supply**: a limited-use, character-bound quantity stack. The current prototype allows four distinct Supply types, with an authored per-type maximum. Supplies can be gained, spent, replenished, and lost with their traveler; they cannot be banked.
- **Asset**: durable character-bound property tracked in its own section. It uses no Gear slot and cannot be banked.
- **Temporary**: adventure-only equipment, keys, clues, and objects. It normally leaves with the run unless explicitly awarded as persistent Gear or a Relic.

Starting equipment such as the Small Knife and Lantern is Gear available during a run, but is not automatically part of the persistent carried loadout. The five-place Bank accepts only persistent Gear and Relics. Money, lore, knowledge, history, Assets, and Supplies are not bankable.

Fresh travelers must remain able to complete every adventure with one Gear slot or no useful carried Gear. Extra slots may add preparation or optional approaches, but must not become required progression gates. Carrying several items does not automatically stack their benefits; item interactions remain specific to the authored situation.

## Saves and legacy travelers

The save retains the legacy `carriedItem` field as an alias for the first slot and stores the canonical loadout in `carriedItems`. Older saves migrate their existing item into a one-item loadout without duplication. For an older active save, qualifying transitions are reconstructed from the ordered visited scenes, honoring any presentation-only marker; otherwise the count safely defaults to zero. Already-ended legacy saves are marked as evaluated without retroactively changing the traveler count, preventing duplicate or unsupported milestone awards.
