import type { Scenario } from '../types';

export const BROKEN_BELL: Scenario = {
  id: 'broken-bell',
  title: 'For Whom the Bell Tolls',
  subtitle: 'Three silent nights. Two missing relics. One thing waiting below.',
  startScene: 'chapelExterior',
  scenes: {
    chapelExterior: {
      id: 'chapelExterior', title: 'The Silent Chapel', tone: 'warning',
      text: 'You arrive beneath a low moon. The chapel’s bell rope sways though the night is still. Beyond its leaning graveyard wall, something moves between the stones. A lantern lies broken on the path.',
      choices: [
        { id: 'callOut', label: 'Call out for the priest', hint: 'Listen before you enter.', effects: { knowledge: ['A weak voice answers from the graveyard: “Not below. Do not sound it below.”'], setFlags: ['calledOut'] }, next: 'graveyardApproach' },
        { id: 'enter', label: 'Enter the chapel', hint: 'The oak door stands ajar.', next: 'chapelNave' },
        { id: 'inspectRope', label: 'Inspect the bell rope', hint: 'The cut may tell a story.', effects: { knowledge: ['The chapel bell was cut loose from below, not from the tower.'], setFlags: ['inspectedRope'] }, next: 'ropeClue' },
        { id: 'cellarWindow', label: 'Try the cellar window', hint: 'A narrow, glass-edged drop.', effects: { setFlags: ['foundCellarWindow'] }, next: 'cellarWindow' },
      ],
    },
    ropeClue: {
      id: 'ropeClue', title: 'A Cut Line',
      text: 'The rope ends in a clean tar-black cut. Someone removed the bell’s clapper from beneath the chapel and fed the rope down through a drilled hole. Grave soil marks the stone.',
      choices: [
        { id: 'enterAfterClue', label: 'Enter the chapel', next: 'chapelNave' },
        { id: 'callAfterClue', label: 'Call toward the graveyard', effects: { setFlags: ['calledOut'] }, next: 'graveyardApproach' },
      ],
    },
    cellarWindow: {
      id: 'cellarWindow', title: 'The Narrow Window', tone: 'warning',
      text: 'Behind thorn and nettle, a cellar window gapes beneath the chapel. Broken glass glitters along the sill. The drop looks survivable, though a fall will hurt.',
      choices: [
        { id: 'climb', label: 'Climb through carefully', hint: 'The broken glass is visible.', chance: { probability: 0.65, successNext: 'underStairs', failureNext: 'windowFall', successMessage: 'You slip through without a sound.', failureMessage: 'Glass bites your palm and the drop knocks the breath from you.', failureEffects: { health: -2 } } },
        { id: 'backWindow', label: 'Leave the window and enter', next: 'chapelNave' },
        { id: 'followVoice', label: 'Follow the faint voice', next: 'graveyardApproach' },
      ],
    },
    windowFall: {
      id: 'windowFall', title: 'A Painful Shortcut', tone: 'warning',
      text: 'You land hard among cellar jars. Nothing is broken, but your palm is cut. A low passage leads inward; a stair climbs toward the chapel floor.',
      choices: [
        { id: 'creepIn', label: 'Follow the low passage', next: 'underStairs' },
        { id: 'climbUp', label: 'Climb to the chapel', next: 'naveDiscovery' },
      ],
    },
    chapelNave: {
      id: 'chapelNave', title: 'The Empty Nave',
      text: 'Rain ticks against colored glass. Muddy footprints cross the altar toward a trapdoor hidden beneath a prayer rug. A brass candlestick rests beside a dark stain. A service door leads to the vestry.',
      choices: [
        { id: 'takeCandlestick', label: 'Take the brass candlestick', hint: 'Heavy, practical brass.', effects: { gainItems: ['brassCandlestick'], setFlags: ['tookCandlestick'] }, next: 'naveDiscovery' },
        { id: 'openTrapdoor', label: 'Open the trapdoor', next: 'underStairs' },
        { id: 'vestry', label: 'Search the vestry', next: 'priestNotes' },
        { id: 'graveyard', label: 'Go to the graveyard', next: 'graveyardApproach' },
      ],
    },
    priestNotes: {
      id: 'priestNotes', title: 'The Priest’s Notes',
      text: 'A page lies crushed beneath a muddy bootprint: “Handbell and clapper recovered from the old burial. Parish display after cleaning.” Below, in a shaking hand: “It followed the sound. I was wrong.”',
      choices: [
        { id: 'readNotes', label: 'Remember the warning', effects: { knowledge: ['The priest removed an iron handbell and black clapper from an older burial below the chapel.', 'DO NOT RING IT BELOW.'], lore: ['The chapel was built over a much older burial place.'], setFlags: ['readNotes'] }, next: 'chapelDiscovery' },
        { id: 'followTrail', label: 'Follow the muddy trail', next: 'graveyardApproach' },
      ],
    },
    naveDiscovery: {
      id: 'naveDiscovery', title: 'Under the Prayer Rug',
      text: 'The trapdoor’s iron ring is cold. The brass candlestick fits neatly through a gap in the warped boards; beneath it, stone steps descend. From outside comes the weak voice of someone in pain.',
      choices: [
        { id: 'descend', label: 'Descend below', next: 'underStairs' },
        { id: 'findVoice', label: 'Find the injured voice', next: 'graveyardApproach' },
      ],
    },
    chapelDiscovery: {
      id: 'chapelDiscovery', title: 'A Chapel After the Discovery',
      text: 'Now the muddy trail and the warning fit together: the priest removed something from an older burial, and the keeper followed it. The hidden trapdoor offers a way below; a voice still calls from beyond the chapel wall.',
      choices: [
        { id: 'descendAfterNotes', label: 'Descend beneath the chapel', next: 'underStairs' },
        { id: 'answerVoice', label: 'Answer the voice first', next: 'graveyardApproach' },
      ],
    },
    graveyardApproach: {
      id: 'graveyardApproach', title: 'Among the Headstones', tone: 'warning',
      text: 'A starved grave-hound blocks the path, an iron chain trailing from its collar. It growls but does not charge. Behind it, the priest is propped against a yew, one hand pressed to his bleeding side.',
      choices: [
        { id: 'calm', label: 'Lower the lantern and speak softly', hint: 'The animal looks frightened.', effects: { knowledge: ['The grave-hound fears bright flame but responds to a calm voice.'], setFlags: ['calmedHound'] }, next: 'priestAfterHound' },
        { id: 'fightKnife', label: 'Drive it back with the knife', hint: 'Combat may wound or kill you.', effects: { combat: { enemy: 'grave-hound', winChance: 0.68, damageOnWin: 1, damageOnLoss: 4, winNext: 'priestAfterHound', lossNext: 'houndAftermath' } } },
        { id: 'fightBrass', label: 'Use the candlestick', hint: 'Its weight gives you reach.', requirements: { items: ['brassCandlestick'] }, effects: { combat: { enemy: 'grave-hound', winChance: 0.86, damageOnWin: 0, damageOnLoss: 3, winNext: 'priestAfterHound', lossNext: 'houndAftermath' } } },
        { id: 'detour', label: 'Slip around the wall', hint: 'The loose stones may give way.', chance: { probability: 0.68, successNext: 'priestAfterHound', failureNext: 'houndAftermath', successMessage: 'You skirt the hound without provoking it.', failureMessage: 'A stone shifts. The hound lunges and you stumble back.', failureEffects: { health: -2 } } },
      ],
    },
    houndAftermath: {
      id: 'houndAftermath', title: 'The Hound Gives Ground', tone: 'warning',
      text: 'The hound snarls and knocks you into a headstone. It is hurt too, and now keeps its distance. The priest is conscious but fading; the chapel stands behind you.',
      choices: [
        { id: 'approachPriest', label: 'Approach the priest slowly', next: 'priestAfterHound' },
        { id: 'showFlame', label: 'Hold the lantern low', effects: { knowledge: ['The grave-hound fears bright flame but responds to a calm voice.'] }, next: 'priestAfterHound' },
      ],
    },
    priestAfterHound: {
      id: 'priestAfterHound', title: 'The Injured Priest',
      text: 'The priest is pale beneath the yew, one hand pressed to his side. A carved bone key hangs from his belt beside a small ward of knotted yew. “I took what was not ours,” he whispers. His breathing catches; he needs help before he can tell you more.',
      choices: [
        { id: 'bindPriest', label: 'Bind his wound', hint: 'Help him steady his breathing.', effects: { knowledge: ['The priest warns you: DO NOT RING IT BELOW.'], lore: ['The keeper followed after the priest disturbed the old burial.'], setFlags: ['helpedPriest', 'boundPriest'] }, next: 'priestStabilized' },
        { id: 'askPriest', label: 'Ask what happened', hint: 'The key and ward remain at his belt.', next: 'priestAccount' },
      ],
    },
    priestStabilized: {
      id: 'priestStabilized', title: 'A Steadier Breath',
      text: 'The binding holds. The priest can breathe without choking on each word now. The bone key and yew ward remain at his belt; he watches you, waiting for a question.',
      choices: [
        { id: 'askAfterBinding', label: 'Ask about the old burial', next: 'priestAccount' },
        { id: 'leaveAfterBinding', label: 'Leave him to rest and descend', next: 'priestAftercare' },
      ],
    },
    priestAccount: {
      id: 'priestAccount', title: 'What the Priest Took',
      text: 'The priest tells you that he removed an iron handbell and black clapper from an older burial beneath the chapel. “The keeper came when I sounded the bell. The warning is real: DO NOT RING IT BELOW.” He nods toward the carved bone key at his belt and the yew ward tied beside it.',
      choices: [
        { id: 'requestKeyAndWard', label: 'Ask for the key and ward', hint: 'He offers them for the work below.', requirements: { notItems: ['boneKey'] }, effects: { gainItems: ['boneKey', 'yewCharm'], knowledge: ['DO NOT RING IT BELOW.'], lore: ['The masked keeper came when the stolen handbell was sounded.'], setFlags: ['receivedPriestKey'] }, next: 'priestFarewell' },
        { id: 'leaveWithoutKey', label: 'Leave without asking for them', next: 'priestAftercare' },
      ],
    },
    priestFarewell: {
      id: 'priestFarewell', title: 'A Promise at the Yew',
      text: 'The priest offers the carved key and yew ward for the work below. “If the keeper stands in your way, do not mistake its warning for hunger.” The chapel door is near; the hidden stair lies below it.',
      choices: [
        { id: 'returnChapel', label: 'Return to the chapel', next: 'priestAftercare' },
        { id: 'enterCellar', label: 'Use the cellar window', requirements: { flags: ['foundCellarWindow'] }, next: 'underStairs' },
      ],
    },
    priestAftercare: {
      id: 'priestAftercare', title: 'The Priest Can Wait',
      text: 'You leave the injured priest beneath the yew, breathing shallowly but conscious. The chapel wall leads toward the hidden stair; the old place below is still ahead of you.',
      choices: [
        { id: 'descendFromYew', label: 'Descend beneath the chapel', next: 'underStairs' },
        { id: 'enterFromYew', label: 'Use the cellar window', requirements: { flags: ['foundCellarWindow'] }, next: 'underStairs' },
      ],
    },
    underStairs: {
      id: 'underStairs', title: 'Beneath the Chapel', tone: 'warning',
      text: 'Stone steps descend into a cramped ossuary. Sooted letters cover the arch: DO NOT RING IT BELOW. A wooden chest rests beneath the warning. Beyond it, an old passage slopes toward a bronze door.',
      choices: [
        { id: 'unlockChest', label: 'Unlock the wooden chest', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, next: 'bellDiscovery' },
        { id: 'forceChest', label: 'Force the wooden chest', hint: 'The lid is iron-banded. Failure will hurt.', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.45, successNext: 'bellDiscovery', failureNext: 'chestJammed', successMessage: 'The old lock tears free.', failureMessage: 'The knife slips; the chest lid jams and you lose 3 health.', successEffects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, failureEffects: { health: -3, setFlags: ['chestJammed'] } } },
        { id: 'passage', label: 'Enter the old passage', hint: 'Something waits beyond the bronze door.', next: 'burialApproach' },
        { id: 'readWarning', label: 'Study the warning', effects: { knowledge: ['DO NOT RING IT BELOW.'] }, next: 'warningRemembered' },
      ],
    },
    warningRemembered: {
      id: 'warningRemembered', title: 'The Warning Stays With You',
      text: 'You trace the soot-black letters without speaking them aloud. A wooden chest rests nearby; the old passage continues beyond it.',
      choices: [
        { id: 'openChestAfterWarning', label: 'Open the chest', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, next: 'bellDiscovery' },
        { id: 'forceAfterWarning', label: 'Force the chest', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.45, successNext: 'bellDiscovery', failureNext: 'chestJammed', successMessage: 'The old lock tears free.', failureMessage: 'The knife slips; the lid jams and you lose 3 health.', successEffects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, failureEffects: { health: -3, setFlags: ['chestJammed'] } } },
        { id: 'passageAfterWarning', label: 'Enter the old passage', next: 'burialApproach' },
      ],
    },
    chestJammed: {
      id: 'chestJammed', title: 'The Chest Holds Fast', tone: 'warning',
      text: 'The lid will not yield to the knife. The failed attempt hurts, and the keeper’s movements grow clearer beyond the old passage. You can force the band with the brass candlestick or press on without the handbell.',
      choices: [
        { id: 'wedgeChest', label: 'Wedge the lock with brass', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, next: 'chestForcedOpen' },
        { id: 'leaveChest', label: 'Leave the chest and continue', next: 'burialApproach' },
      ],
    },
    chestForcedOpen: {
      id: 'chestForcedOpen', title: 'The Iron Band Bends',
      text: 'The candlestick bends the iron band. Inside, the handbell lies wrapped in altar cloth beside a silver grave coin.',
      choices: [
        { id: 'takeForcedBell', label: 'Take the handbell and continue', next: 'bellDiscovery' },
        { id: 'leaveForcedBell', label: 'Leave the handbell', effects: { loseItems: ['ironHandbell'] }, next: 'burialApproach' },
      ],
    },
    bellDiscovery: {
      id: 'bellDiscovery', title: 'The Stolen Handbell',
      text: 'Inside the chest lies a cold iron handbell wrapped in altar cloth. Beside it, a silver grave coin is caught in the folds; you take both. The bell’s mouth seems to drink the lantern light. The warning above feels less like superstition now.',
      choices: [
        { id: 'seekClapper', label: 'Seek the missing clapper', next: 'burialApproach' },
        { id: 'leaveBell', label: 'Leave the bell and go deeper', effects: { loseItems: ['ironHandbell'], setFlags: ['bellLeftBehind'] }, next: 'burialApproach' },
      ],
    },
    burialApproach: {
      id: 'burialApproach', title: 'The Old Burial', tone: 'warning',
      text: 'Past the bronze door, roots thread through ancient stone. The black iron clapper rests inside a ring of white bones. Across the chamber stands a tall creature in a cracked bronze mask. It raises empty hands; when you move toward the clapper, it lowers into a warning crouch.',
      choices: [
        { id: 'speak', label: 'Show empty hands', hint: 'It has warned you, but has not attacked.', effects: { setFlags: ['showedPeace'] }, next: 'maskedParley' },
        { id: 'snatch', label: 'Snatch the clapper', hint: 'Fast, dangerous, and not impossible.', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned', 'keeperDefeated'] }, chance: { probability: 0.42, successNext: 'keeperAfterSnatch', failureNext: 'keeperWarning', successMessage: 'You roll through the bone ring with the clapper in hand.', failureMessage: 'A long arm hurls you back. You lose 3 health.', failureEffects: { health: -3, setFlags: ['angeredKeeper'] }, successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] } } },
        { id: 'fight', label: 'Attack the masked creature', hint: 'It is larger than you. This could be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.46, damageOnWin: 4, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
        { id: 'observe', label: 'Watch its gesture', effects: { knowledge: ['The keeper guards the clapper and does not attack unless it is threatened.'] }, next: 'keeperWarning' },
      ],
    },
    keeperWarning: {
      id: 'keeperWarning', title: 'The Keeper’s Warning', tone: 'warning',
      text: 'The creature strikes the stone beside your hand, not your hand. Its empty palm points toward the altar hollow, then to the clapper. You have not taken it; the warning remains a chance to choose differently.',
      choices: [
        { id: 'parley', label: 'Show that you understand', next: 'maskedParley' },
        { id: 'tryClapperAgain', label: 'Reach for the clapper again', hint: 'It will resist, but you may still succeed.', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned', 'keeperDefeated'] }, chance: { probability: 0.35, successNext: 'keeperAfterSnatch', failureNext: 'keeperAfterClapperFailure', successMessage: 'You wrench the clapper free.', failureMessage: 'The keeper throws you hard against the stone.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -4, setFlags: ['angeredKeeper'] } } },
        { id: 'attackKeeper', label: 'Attack the keeper', hint: 'Combat may be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.42, damageOnWin: 4, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
      ],
    },
    keeperAfterClapperFailure: {
      id: 'keeperAfterClapperFailure', title: 'The Keeper Holds Its Ground', tone: 'warning',
      text: 'The keeper pins the clapper beneath one long hand, then steps aside from the passage. It is hurt by the struggle, but still gives you a chance to leave the relic where it belongs.',
      choices: [
        { id: 'speakAfterFailure', label: 'Show empty hands', next: 'maskedParley' },
        { id: 'leaveAfterFailure', label: 'Retreat from the burial', next: 'retreatEnding' },
      ],
    },
    keeperAfterSnatch: {
      id: 'keeperAfterSnatch', title: 'A Keeper, Not a Monster', tone: 'warning',
      text: 'With the clapper in your hand, the creature touches its mask, then points at the hollow in the burial altar. It does not pursue you. A shard loosened from its bronze mask rests on the stone, offered if you return the stolen relics. Now you understand: it wants the relics returned.',
      choices: [
        { id: 'returnBoth', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'returnClapper', label: 'Return the clapper; accept the mask shard', requirements: { items: ['blackClapper'], notFlags: ['clapperReturned'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['clapperReturned'] }, next: 'clapperReturnedScene' },
        { id: 'returnBell', label: 'Return the handbell first', requirements: { items: ['ironHandbell'], notFlags: ['returnedBell'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['returnedBell'] }, next: 'partialReturn' },
        { id: 'returnForBell', label: 'Go back for the handbell', hint: 'The keeper lets you leave with the clapper.', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, next: 'returnToChapel' },
      ],
    },
    maskedParley: {
      id: 'maskedParley', title: 'A Keeper, Not a Monster',
      text: 'The creature points to the bell-shaped hollow in the altar, then to the clapper on its bone ring. Not a threat—a request. The old things belong here. A shard has loosened from its bronze mask and rests on the altar, offered if you return what was taken.',
      choices: [
        { id: 'takeClapper', label: 'Take the clapper gently', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned', 'keeperDefeated'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'keeperAfterSnatch' },
        { id: 'returnBoth', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'returnBell', label: 'Return the handbell first', requirements: { items: ['ironHandbell'], notFlags: ['returnedBell'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['returnedBell'] }, next: 'partialReturn' },
        { id: 'ring', label: 'Ring the handbell below', hint: 'The warning is explicit. This may be fatal.', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { health: -20 }, next: 'deathBell' },
      ],
    },
    returnToChapel: {
      id: 'returnToChapel', title: 'Back Through the Ossuary',
      text: 'The keeper does not follow. You climb toward the chapel with the events below behind you. The wooden chest is still beneath the warning: unlock it if you brought the key, recover the bell if you left it, or force the lock and risk another injury.',
      choices: [
        { id: 'recoverBell', label: 'Recover the handbell', requirements: { flags: ['openedChest', 'bellLeftBehind'], notItems: ['ironHandbell'] }, effects: { gainItems: ['ironHandbell'], clearFlags: ['bellLeftBehind'], setFlags: ['bellRecovered'] }, next: 'bellRecoveredScene' },
        { id: 'unlockReturnChest', label: 'Unlock the chest with the bone key', requirements: { items: ['boneKey'], notFlags: ['openedChest'], notItems: ['ironHandbell'] }, effects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest', 'bellRecovered'] }, next: 'returnChestLoot' },
        { id: 'forceReturnChest', label: 'Force the locked chest', hint: 'A failed attempt will hurt.', requirements: { notFlags: ['openedChest'], notItems: ['ironHandbell'] }, chance: { probability: 0.45, successNext: 'returnChestLoot', failureNext: 'returnChestJammed', successMessage: 'The iron band tears open.', failureMessage: 'The lock catches your blade and bruises your hand.', successEffects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest', 'bellRecovered'] }, failureEffects: { health: -3, setFlags: ['chestJammed'] } } },
        { id: 'leaveWithoutBell', label: 'Leave the chapel behind', next: 'retreatEnding' },
      ],
    },
    returnChestJammed: {
      id: 'returnChestJammed', title: 'The Lock Still Holds', tone: 'warning',
      text: 'The chest has not opened. Your hand throbs from the failed attempt, but the keeper no longer blocks the way. The candlestick might bend the lock band; otherwise you can leave the bell behind.',
      choices: [
        { id: 'wedgeReturnChest', label: 'Bend the band with brass', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest', 'bellRecovered'] }, next: 'returnChestLoot' },
        { id: 'leaveLockedChest', label: 'Leave without the bell', next: 'retreatEnding' },
      ],
    },
    returnChestLoot: {
      id: 'returnChestLoot', title: 'The Chest at the Chapel',
      text: 'Under the altar cloth lies the iron handbell, and beside it the silver grave coin. You take both before returning below to the keeper.',
      choices: [
        { id: 'returnWithChestLoot', label: 'Return to the keeper', next: 'keeperReunion' },
        { id: 'leaveAfterChestLoot', label: 'Leave the chapel behind', next: 'retreatEnding' },
      ],
    },
    bellRecoveredScene: {
      id: 'bellRecoveredScene', title: 'The Bell Recovered',
      text: 'The handbell is still where you left it, cold beneath its altar cloth. The silver grave coin from the chest is safely in your pack. The keeper waits below; if you still carry the clapper, you can return the whole relic.',
      choices: [
        { id: 'returnTogether', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'keepGoing', label: 'Return to the keeper', next: 'keeperReunion' },
      ],
    },
    keeperReunion: {
      id: 'keeperReunion', title: 'The Keeper Waits', tone: 'warning',
      text: 'You return to the old burial with the handbell. Whether the clapper is still in your hands or already rests by the altar, the keeper recognizes that you came back to finish what you began. The bronze mask shard remains on the altar, offered if you return the last relic.',
      choices: [
        { id: 'returnOnReunion', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'finishBellReturn', label: 'Return the handbell too', requirements: { items: ['ironHandbell'], flags: ['clapperReturned'] }, effects: { loseItems: ['ironHandbell'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'leaveOnReunion', label: 'Leave the burial behind', next: 'retreatEnding' },
      ],
    },
    clapperReturnedScene: {
      id: 'clapperReturnedScene', title: 'The Clapper at Rest',
      text: 'The keeper places the clapper beside the altar hollow and nudges the loose bronze mask shard toward you in thanks. It studies the handbell in your pack, then points to it. The burial is calmer, but the promise is not yet complete.',
      choices: [
        { id: 'completeReturn', label: 'Return the handbell too', requirements: { items: ['ironHandbell'] }, effects: { loseItems: ['ironHandbell'], money: 8, lore: ['The keeper accepted the return of the old burial relics.'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'goForBell', label: 'Recover the handbell', requirements: { notItems: ['ironHandbell'] }, next: 'returnToChapel' },
        { id: 'leaveClapper', label: 'Leave the burial', next: 'retreatEnding' },
      ],
    },
    partialReturn: {
      id: 'partialReturn', title: 'Half a Promise',
      text: 'The keeper places the handbell in the altar hollow and waits. When you lift the clapper, it does not stop you; it only points to the bell. A bronze mask shard rests on the altar ledge, offered if you return the remaining relic.',
      choices: [
        { id: 'takeClapperNow', label: 'Take the clapper from the altar', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'clapperAtAltar' },
        { id: 'placeClapper', label: 'Return the clapper and accept the mask shard', requirements: { items: ['blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], lore: ['The masked keeper accepted the return of the burial relics.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'leavePartial', label: 'Leave the burial', next: 'retreatEnding' },
      ],
    },
    clapperAtAltar: {
      id: 'clapperAtAltar', title: 'The Clapper Beside Its Place',
      text: 'You lift the clapper from beside the handbell. The keeper watches without moving. A small bronze shard from its mask rests by the altar, offered if you return the relic.',
      choices: [
        { id: 'returnLastClapper', label: 'Return the clapper and accept the mask shard', requirements: { items: ['blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], lore: ['The masked keeper accepted the return of the burial relics.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'leaveWithClapper', label: 'Leave with the clapper', next: 'retreatEnding' },
      ],
    },
    keeperAfterFight: {
      id: 'keeperAfterFight', title: 'The Keeper Strikes Back', tone: 'danger',
      text: 'The keeper’s blow drives you against the burial stones. Its empty hands hesitate; the creature is defending the altar, not hunting you. You can still stop the violence or try once more.',
      choices: [
        { id: 'stopFight', label: 'Lower your weapon', next: 'keeperHesitates' },
        { id: 'fightAgain', label: 'Press the attack', hint: 'You are hurt and it may kill you.', effects: { combat: { enemy: 'masked keeper', winChance: 0.5, damageOnWin: 4, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperOverpowered' } } },
        { id: 'fleeFight', label: 'Flee toward the chapel', next: 'retreatEnding' },
      ],
    },
    keeperHesitates: {
      id: 'keeperHesitates', title: 'An Opening for Peace',
      text: 'You lower the weapon. The keeper studies you, then turns its open palm toward the altar. It has not forgotten the blow, but it gives you one chance to make this right.',
      choices: [
        { id: 'pleadForPeace', label: 'Show the relics', next: 'keeperPlea' },
        { id: 'leaveAfterFight', label: 'Retreat from the burial', next: 'retreatEnding' },
      ],
    },
    keeperPlea: {
      id: 'keeperPlea', title: 'A Costly Truce',
      text: 'The keeper accepts your open hands. There is no easy trust now, but the relics can still be returned if you have both. The bronze shard from its damaged mask remains on the altar, offered if you make the return.',
      choices: [
        { id: 'offerBothAfterFight', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 5, lore: ['The masked keeper accepted the relics after a violent misunderstanding.'], setFlags: ['peacefulResolution', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'withdrawAfterFight', label: 'Leave the burial', next: 'retreatEnding' },
      ],
    },
    keeperOverpowered: {
      id: 'keeperOverpowered', title: 'The Keeper’s Last Warning', tone: 'danger',
      text: 'The keeper’s final blow sends you across the bones. It could finish you, but instead it backs toward the altar. The fight is over; what happens next is your choice.',
      choices: [
        { id: 'backDown', label: 'Stop fighting', next: 'keeperHesitates' },
        { id: 'crawlAway', label: 'Crawl toward the passage', next: 'retreatEnding' },
      ],
    },
    keeperDefeated: {
      id: 'keeperDefeated', title: 'A Costly Victory', tone: 'danger',
      text: 'The masked keeper falls beside the altar. It never cries out. Behind the cracked mask is a face both ancient and terribly human. Among the bones lie the clapper and a bronze mask shard; you understand too late that the keeper was guarding the burial.',
      choices: [
        { id: 'sealWithBell', label: 'Take the relics and seal the door', requirements: { items: ['ironHandbell'] }, effects: { loseItems: ['ironHandbell'], gainItems: ['blackClapper', 'bronzeMaskFragment'], money: 5, lore: ['Violence ended the keeper, though returning the stolen relics ended the haunting.'], setFlags: ['keeperDefeated', 'hasClapper'] }, next: 'hardEnding' },
        { id: 'sealWithoutBell', label: 'Take the relics and seal the door', requirements: { notItems: ['ironHandbell'] }, effects: { gainItems: ['blackClapper', 'bronzeMaskFragment'], money: 5, lore: ['The keeper died protecting the relics taken from its burial.'], setFlags: ['keeperDefeated', 'hasClapper'] }, next: 'hardEnding' },
      ],
    },
    retreatEnding: {
      id: 'retreatEnding', title: 'The Chapel at Dawn',
      text: 'You leave the old burial behind and bring the injured priest toward the village. The keeper’s fate and the missing livestock remain uncertain, but the chapel bell stays silent for now.',
      choices: [], ending: 'success',
    },
    peaceEnding: {
      id: 'peaceEnding', title: 'The Bell Stays Silent',
      text: 'The keeper fits the clapper beside the handbell, never inside it, and closes the burial altar. Above, the grave-hound stops howling. By dawn the priest is safe, the livestock return from the wood, and the chapel bell rings once—from its tower, where bells belong.',
      choices: [], ending: 'success',
    },
    hardEnding: {
      id: 'hardEnding', title: 'Morning, at a Price',
      text: 'You drag the priest into the dawn as the old passage settles behind you. The village is safe, and the missing livestock wander home. Yet when the tower bell rings, you remember the keeper’s empty hands and wonder what the chapel has lost.',
      choices: [], ending: 'success',
    },
    deathBell: {
      id: 'deathBell', title: 'The Sound Below', tone: 'danger',
      text: 'The iron note has nowhere to go. It passes through stone, bone, lantern glass—and you. The last thing you see is the keeper reaching not to strike you, but to silence the bell.',
      choices: [], ending: 'death',
    },
  },
};
