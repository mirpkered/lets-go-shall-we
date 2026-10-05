# Fixed-stock merchant encounters

The ten encounters in `merchantEcologyBatch.ts` are ordinary, year-round selector content. Each venue has three posted products, explicit prices, a no-purchase exit, and at most four choices on a scene. Buying ends the encounter after one transaction; it is not a reusable shop or an inventory menu.

Gear purchases use the canonical pending-reward flow. An item already carried or banked is not offered again. Supply purchases check the existing stack limit and grant the printed quantity. Only selected sellers buy a narrow set of currently carried Gear; banked items are never available to sell. All posted resale prices are at or below the lowest matching stock price, and a venue cannot be revisited within its own transaction route.

The Retired Lampwright optionally recognizes the Numbered Lantern Wick from the Lantern Vault and records a stable Knowledge fact. That fact later opens a short interpretation choice in “The Lamp Left in the Window”; it distinguishes an ordinary house lamp from a registered refuge-lamp system without granting access or solving the separate mystery.

The Roadside Tinker’s Compact Wheel Wrench has a later, optional use in “The Broken Wheel.” The wrench improves the chance of tightening the iron band, but the split hub still needs a smith if the attempt fails. The old unload, wait, and smith routes remain available.

The long seeded route-aware audit can optionally compare the current library with the same library minus these ten merchant encounters. Set `MERCHANT_AUDIT_COMPARE=1` when running `src/rewardRealizationAudit.test.ts` to print paired July/October milestone summaries; the ordinary full suite omits the additional baseline cohort to avoid doubling audit runtime.

## Manual phone-sized review

For each merchant encounter, verify on a narrow phone viewport that the intro offers a clear browse / optional sale / leave choice, prices and exact Supply quantities are visible before purchase, duplicate or unaffordable Gear offers are absent, and a purchase leads to a single clear ending. Also verify that the sale page displays only its two eligible carried-item offers plus “Keep what you brought,” and that a full Supply stack leaves no purchase action for that stack. The automated tests enforce a maximum of four choices per scene; a real-device visual check remains useful before release.
