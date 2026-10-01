# Traveler Experience Through Survival

Travelers do not gain levels, experience points, permanent stat upgrades, or account-wide progression. Their growing experience is represented by practical preparedness carried forward by that living character.

## Completion count

The current traveler’s completed-adventure count increases once when they reach an authored terminal ending. This includes successful, failed, quiet, walk-away, no-reward, NPC-death, and player-death endings. Explicit abandonment, QA/test runs, and closing the browser before an ending do not count. A resumed run counts only when it later reaches an authored ending.

The local traveler count is distinct from the optional shared global completion total. A normal authored ending records the local count immediately and idempotently with the run, so reopening an ending cannot count it again. QA endings do not change either count.

## Carry capacity

| Adventures completed by this traveler | Persistent carry capacity |
| --- | ---: |
| 0–9 | 1 item |
| 10–19 | 2 items |
| 20+ | 3 items |

The new slot unlocks after the milestone adventure ends, before the next adventure begins. Three slots is the current maximum. Capacity belongs to one traveler and resets to one when that traveler dies, is abandoned, or retires. The Bank remains separate, persists across travelers, and retains its five-item capacity.

Fresh travelers must remain able to complete every adventure with one slot or no useful carried gear. Extra slots may add preparation or optional approaches, but must not become required progression gates. Carrying several items does not automatically stack their benefits; item interactions remain specific to the authored situation.

## Saves and legacy travelers

The save retains the legacy `carriedItem` field as an alias for the first slot and stores the canonical loadout in `carriedItems`. Older saves migrate their existing item into a one-item loadout without duplication. If an older save has no traveler completion count, it starts conservatively at zero; the current local save does not provide reliable per-traveler history from which to infer a number. Already-ended legacy saves are marked as counted during migration to prevent repeated increments.
