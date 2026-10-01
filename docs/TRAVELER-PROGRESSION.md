# Traveler Experience Through Survival

Travelers do not gain levels, experience points, permanent stat upgrades, or account-wide progression. Their growing experience is represented by practical preparedness carried forward by that living character.

## Completion count

The traveler’s progression count increases once only when they reach an authored terminal ending after more than five qualifying story transitions. This includes successful, failed, quiet, walk-away, no-reward, NPC-death, and player-death endings; danger or success is not required. An authored ending after zero to five transitions remains a completed story for the global community total, but does not advance this traveler’s carry milestones. Explicit abandonment and QA/test runs count toward neither total, and closing the browser before an ending does not count. A resumed run counts only when it later reaches an authored ending.

The local traveler progression count is distinct from the shared global authored-completion total. Every normal authored ending still records globally, including an early walk-away, while traveler progression uses the six-transition threshold. Separate per-run markers make the two records independently idempotent; QA endings change neither count.

Qualifying transitions are forward moves into authored story scenes, including endings. Ordinary story scenes count by default. A scene authored solely to continue the same beat across a presentation/no-scroll split can set `countsForProgression: false`. UI panels, inventory views, the Bank, dialogs, and QA controls do not use story transitions and never affect this count. The per-run count is saved and resumes exactly.

## Carry capacity

| Qualifying adventures completed by this traveler | Persistent carry capacity |
| --- | ---: |
| 0–9 | 1 item |
| 10–19 | 2 items |
| 20+ | 3 items |

The new slot unlocks after the milestone adventure ends, before the next adventure begins. Three slots is the current maximum. Capacity belongs to one traveler and resets to one when that traveler dies, is abandoned, or retires. The Bank remains separate, persists across travelers, and retains its five-item capacity.

Fresh travelers must remain able to complete every adventure with one slot or no useful carried gear. Extra slots may add preparation or optional approaches, but must not become required progression gates. Carrying several items does not automatically stack their benefits; item interactions remain specific to the authored situation.

## Saves and legacy travelers

The save retains the legacy `carriedItem` field as an alias for the first slot and stores the canonical loadout in `carriedItems`. Older saves migrate their existing item into a one-item loadout without duplication. For an older active save, qualifying transitions are reconstructed from the ordered visited scenes, honoring any presentation-only marker; otherwise the count safely defaults to zero. Already-ended legacy saves are marked as evaluated without retroactively changing the traveler count, preventing duplicate or unsupported milestone awards.
