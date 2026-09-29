import type { Scenario } from '../types';

const DO_NOT_RING = 'The soot inscription reads: DO NOT RING IT BELOW.';
const RELIC_HISTORY = 'The priest removed an iron handbell and black clapper from an older burial beneath the chapel.';
const HAND_BELL_KNOWLEDGE = 'A cold iron handbell was taken from beneath the chapel.';

const takeBellEffects = { gainItems: ['ironHandbell', 'graveCoin'], knowledge: [HAND_BELL_KNOWLEDGE], setFlags: ['bellRecovered'] };
const returnBothEffects = {
  loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'],
  lore: ['The masked keeper guards the old burial; it is not inherently evil.'],
  setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'],
};

export const BROKEN_BELL: Scenario = {
  id: 'broken-bell',
  title: 'For Whom the Bell Tolls',
  subtitle: 'Three silent nights. A missing priest. Something waiting below.',
  startScene: 'chapelExterior',
  timePhases: [
    { id: 'early', label: 'Night Settling In', atMinutes: 0 },
    { id: 'pressing', label: 'The Night Deepens', atMinutes: 20 },
    { id: 'critical', label: 'Stone Shifts Below', atMinutes: 40 },
  ],
  scenes: {
    chapelExterior: {
      id: 'chapelExterior', title: 'The Silent Chapel', tone: 'warning',
      text: 'You reach the village chapel beneath a low moon. Its bell rope sways though the night is still. Muddy prints lead from the graveyard gate to the open chapel door; the priest who went to investigate has not returned. Somewhere below the stones, a faint knock answers the wind.',
      choices: [
        { id: 'callOut', label: 'Call for the priest', hint: 'Listen for an answer before entering.', timeCost: 2, effects: { knowledge: [DO_NOT_RING], setFlags: ['calledOut'] }, next: 'voiceBelow' },
        { id: 'inspectRope', label: 'Examine the bell rope', hint: 'The cut may tell you where the bell went.', timeCost: 4, effects: { knowledge: ['The bell rope was cut from below, not from the tower.'], setFlags: ['inspectedRope'] }, next: 'ropeClue' },
        { id: 'enter', label: 'Enter the chapel', timeCost: 1, next: 'chapelNave' },
        { id: 'cellarWindow', label: 'Try the narrow cellar window', hint: 'Broken glass and a hard drop are visible.', timeCost: 3, next: 'cellarWindow' },
      ],
    },
    voiceBelow: {
      id: 'voiceBelow', title: 'An Answer Under the Stones',
      text: 'A weak voice travels up through the chapel floor: “I’m below. Keep the bell silent.” The words stop there. The chapel door stands open, and a cellar window gapes beneath the ivy.',
      choices: [
        { id: 'enterAfterCall', label: 'Enter through the chapel', next: 'chapelNave' },
        { id: 'windowAfterCall', label: 'Use the cellar window', next: 'cellarWindow' },
      ],
    },
    ropeClue: {
      id: 'ropeClue', title: 'A Cut from Beneath',
      text: 'The rope has a clean, tar-black cut. Something was taken from under the chapel and lifted away through a drilled hole. Grave soil is pressed into the cut fibers.',
      choices: [
        { id: 'enterWithClue', label: 'Follow the prints inside', next: 'chapelNave' },
        { id: 'windowWithClue', label: 'Check the cellar opening', next: 'cellarWindow' },
      ],
    },
    cellarWindow: {
      id: 'cellarWindow', title: 'The Narrow Window', tone: 'warning',
      text: 'Broken glass lines the sill above a cramped cellar. The drop looks survivable, but a slip will cut you and leave you hurt.',
      choices: [
        { id: 'climbCarefully', label: 'Climb through carefully', chance: { probability: 0.68, successNext: 'cellarLanding', failureNext: 'windowFall', successMessage: 'You find a foothold and ease down among the jars.', failureMessage: 'Glass bites your palm and the drop knocks the breath from you.', failureEffects: { health: -2 } } },
        { id: 'useChapelDoor', label: 'Leave the window and enter by the door', next: 'chapelNave' },
      ],
    },
    windowFall: {
      id: 'windowFall', title: 'A Painful Shortcut', tone: 'warning',
      text: 'You land hard among the cellar jars. Your palm is cut, but the old stone stair is close. A knock sounds from somewhere deeper under the chapel.',
      choices: [{ id: 'followKnockAfterFall', label: 'Follow the knock below', next: 'cellarEntry' }],
    },
    cellarLanding: {
      id: 'cellarLanding', title: 'The Cellar Floor',
      text: 'You land without a sound. Fresh mud marks the steps descending beneath the chapel, and someone has dragged a heavy object toward the old stonework.',
      choices: [{ id: 'descendCellar', label: 'Follow the drag marks', next: 'cellarEntry' }],
    },
    cellarEntry: {
      id: 'cellarEntry', title: 'Under the Chapel',
      text: 'The cellar jars give way to older stone. A narrow stair drops toward an ossuary. The weak knocking is clearer there.',
      choices: [{ id: 'takeCellarStairs', label: 'Descend into the ossuary', next: 'underStairs' }],
    },
    chapelNave: {
      id: 'chapelNave', title: 'The Empty Nave',
      text: 'Rain ticks against colored glass. Muddy prints cross the altar toward a prayer rug; a brass candlestick rests beside a dark stain. A service door opens onto the vestry. Under the floor comes a thin, uneven knock.',
      choices: [
        { id: 'takeCandlestick', label: 'Take the heavy brass candlestick', hint: 'Useful weight, but only one free hand.', timeCost: 1, requirements: { notItems: ['brassCandlestick'] }, effects: { gainItems: ['brassCandlestick'], setFlags: ['tookCandlestick'] }, next: 'naveAfterCandle' },
        { id: 'searchVestry', label: 'Search the vestry for evidence', timeCost: 7, next: 'priestNotes' },
        { id: 'liftPrayerRug', label: 'Investigate the prayer rug', timeCost: 2, effects: { setFlags: ['discoveredTrapdoor', 'foundHiddenStair'] }, next: 'trapdoorFound' },
        { id: 'followMud', label: 'Study the muddy prints', timeCost: 3, effects: { knowledge: ['The muddy prints lead from the altar to a stair beneath the chapel.'] }, next: 'mudTrail' },
      ],
    },
    naveAfterCandle: {
      id: 'naveAfterCandle', title: 'Brass in Your Hand',
      text: 'The candlestick is heavier than it looked. Its broad base could pry a stubborn lid or brace a narrow gap. The uneven knock continues while the investigation remains open.',
      choices: [
        { id: 'searchVestryWithCandle', label: 'Search the vestry for evidence', next: 'priestNotes' },
        { id: 'studyPrintsWithCandle', label: 'Study the muddy prints', effects: { knowledge: ['The muddy prints lead from the altar toward the prayer rug.'] }, next: 'mudTrail' },
        { id: 'followKnockWithCandle', label: 'Follow the knock near the rug', next: 'rugInvestigation' },
      ],
    },
    priestNotes: {
      id: 'priestNotes', title: 'The Priest’s Notes',
      text: 'A page lies crushed beneath a muddy bootprint: “Handbell and clapper recovered from the old burial. Parish display after cleaning.” Below, in a shaking hand: “It followed the sound. I was wrong.”',
      choices: [
        { id: 'readNotes', label: 'Remember the warning and follow the prints', timeCost: 4, effects: { knowledge: [RELIC_HISTORY, HAND_BELL_KNOWLEDGE, DO_NOT_RING], lore: ['The chapel was built over an older burial place.'], setFlags: ['readNotes'] }, next: 'notesLeadBelow' },
      ],
    },
    notesLeadBelow: {
      id: 'notesLeadBelow', title: 'The Trail Below',
      text: 'The notes identify the missing bell and clapper. A dark smear crosses the prayer rug; the weak knocking has stopped, but something beneath the cloth catches the light.',
      choices: [{ id: 'inspectRugAfterNotes', label: 'Check beneath the prayer rug', effects: { setFlags: ['discoveredTrapdoor', 'foundHiddenStair'] }, next: 'trapdoorFound' }],
    },
    mudTrail: {
      id: 'mudTrail', title: 'Where the Prints Stop',
      text: 'The footprints stop at the prayer rug. One heel-mark is dragged backward. The rug’s edge lifts slightly with the draft from below.',
      choices: [{ id: 'liftAfterTracks', label: 'Inspect the lifted rug', effects: { setFlags: ['discoveredTrapdoor', 'foundHiddenStair'] }, next: 'trapdoorFound' }],
    },
    rugInvestigation: {
      id: 'rugInvestigation', title: 'A Knock Beneath the Cloth',
      text: 'The knock comes again from beneath the rug. Its corner trembles, and a thin line in the floor runs under the woven edge.',
      choices: [{ id: 'raiseRugAfterKnock', label: 'Lift the rug and inspect the seam', effects: { setFlags: ['discoveredTrapdoor', 'foundHiddenStair'] }, next: 'trapdoorFound' }],
    },
    trapdoorFound: {
      id: 'trapdoorFound', title: 'The Hidden Stair',
      text: 'The rug folds back to reveal a narrow trapdoor set into the chapel floor. A ring of iron lifts it; cold air and the sound of a distant knock rise from below.',
      choices: [{ id: 'descendHiddenStair', label: 'Open the trapdoor and descend', timeCost: 3, next: 'underStairs' }],
    },
    underStairs: {
      id: 'underStairs', title: 'Beneath the Chapel', tone: 'warning',
      text: 'Stone steps descend into an ossuary. Soot-black letters cross the arch: DO NOT RING IT BELOW. A wooden chest sits beneath them. Beyond it, a bronze door stands ajar; behind the door comes a faint, pained breath.',
      choices: [
        { id: 'readWarning', label: 'Study the soot-black warning', timeCost: 2, effects: { knowledge: [DO_NOT_RING], lore: ['The warning was carved before the chapel was built.'], setFlags: ['knowsWarning'] }, next: 'warningRemembered' },
        { id: 'inspectChest', label: 'Examine the wooden chest', timeCost: 5, next: 'chestClue' },
        { id: 'findPriestBelow', label: 'Follow the pained breath', timeCost: 3, effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'passBronzeDoor', label: 'Continue toward the bronze door', timeCost: 3, next: 'burialApproach' },
      ],
    },
    warningRemembered: {
      id: 'warningRemembered', title: 'A Warning Kept',
      text: 'You trace the letters without speaking them. The chest is old, and something knocks once behind the bronze door. The priest’s weak breath continues beyond it.',
      choices: [
        { id: 'lookChestAfterWarning', label: 'Inspect the chest lock', next: 'chestClue' },
        { id: 'findPriestAfterWarning', label: 'Find the injured voice', effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'continueAfterWarning', label: 'Keep the warning in mind and go on', next: 'burialApproach' },
      ],
    },
    chestClue: {
      id: 'chestClue', title: 'The Chest Beneath the Warning',
      text: 'The chest is iron-banded and locked. From inside comes a dull shape of metal against wood. The warning above, the cut rope, and the marks on the lid begin to point toward something taken from below.',
      choices: [
        { id: 'forceChest', label: 'Force the old lock', timeCost: 8, hint: 'The knife may slip; failure will hurt.', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.48, successNext: 'bellDiscovery', failureNext: 'chestJammed', successMessage: 'The lock tears free. You lift out the iron handbell and a silver grave coin.', failureMessage: 'The knife slips; the lid jams and cuts your hand.', successEffects: takeBellEffects, failureEffects: { health: -2, setFlags: ['chestJammed'] } } },
        { id: 'wedgeChest', label: 'Pry the band with the brass candlestick', hint: 'It will bend the candlestick, but the heavy base fits.', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'chestForcedOpen' },
        { id: 'callPriestAtChest', label: 'Follow the breath beyond the door', requirements: { notFlags: ['foundPriest'] }, effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'leaveChestForNow', label: 'Leave the chest and continue deeper', next: 'burialApproach' },
      ],
    },
    chestJammed: {
      id: 'chestJammed', title: 'The Chest Holds Fast', tone: 'warning',
      text: 'The lid will not yield. Your cut hand throbs, and the breath beyond the bronze door breaks into a cough. The candlestick might bend the band; otherwise the chest can wait while you find the injured priest.',
      choices: [
        { id: 'wedgeJammedChest', label: 'Bend the iron band with brass', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'chestForcedOpen' },
        { id: 'findPriestAfterJam', label: 'Find the injured priest', requirements: { notFlags: ['foundPriest'] }, effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'goOnAfterJam', label: 'Leave the chest and go deeper', next: 'burialApproach' },
      ],
    },
    chestForcedOpen: {
      id: 'chestForcedOpen', title: 'The Iron Band Bends',
      text: 'The candlestick’s base bends the iron band. Inside lies a cold iron handbell wrapped in altar cloth; a silver grave coin has slipped into the folds. You take both. The warning above suddenly feels less like superstition.',
      choices: [
        { id: 'findPriestWithBell', label: 'Carry the bell toward the injured voice', requirements: { notFlags: ['foundPriest'] }, effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'takeBellToKeeper', label: 'Keep the bell wrapped and continue', next: 'burialApproach' },
      ],
    },
    priestAfterHound: {
      id: 'priestAfterHound', title: 'The Injured Priest Below', tone: 'warning',
      text: 'Behind the bronze door, the priest lies pinned beneath a fallen screen, his side bleeding. A carved bone key and a yew ward hang from his belt. “I took the handbell and clapper from the old burial,” he whispers. “When I sounded it, the keeper came.” He has not yet told you what the keeper wants.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'Behind the bronze door, the priest lies pinned beneath a fallen screen, his side bleeding. His breaths have grown shallower while you searched the chapel. A carved bone key and a yew ward hang from his belt. “I took the handbell and clapper from the old burial,” he whispers. “When I sounded it, the keeper came.” He has not yet told you what the keeper wants.' }],
      choices: [
        { id: 'bindPriest', label: 'Bind his wound before asking more', hint: 'A steadier breath may save his strength.', timeCost: 10, effects: { knowledge: [DO_NOT_RING, HAND_BELL_KNOWLEDGE], lore: ['The priest disturbed the old burial beneath the chapel.'], setFlags: ['helpedPriest', 'boundPriest'] }, next: 'priestStabilized' },
        { id: 'askPriest', label: 'Ask what he removed from the burial', timeCost: 4, effects: { knowledge: [HAND_BELL_KNOWLEDGE] }, next: 'priestAccount' },
        { id: 'leavePriest', label: 'Leave him resting and follow the keeper', timeCost: 1, effects: { knowledge: [HAND_BELL_KNOWLEDGE] }, next: 'burialApproach' },
      ],
    },
    priestStabilized: {
      id: 'priestStabilized', title: 'A Steadier Breath',
      text: 'The binding holds. The priest can breathe without choking on each word. The key and yew ward remain at his belt; he watches you, waiting for the question he fears.',
      choices: [
        { id: 'askAfterBinding', label: 'Ask about the old burial', effects: { knowledge: [HAND_BELL_KNOWLEDGE] }, next: 'priestAccount' },
        { id: 'leaveAfterBinding', label: 'Leave him to rest and go on', next: 'burialApproach' },
      ],
    },
    priestAccount: {
      id: 'priestAccount', title: 'What the Priest Took',
      text: 'The priest tells you he lifted an iron handbell and its black clapper from a burial older than the chapel. The keeper followed the sound, then stood between him and the relics. “It never struck me while I was trapped,” he says. That may be fear speaking—or a clue.',
      choices: [
        { id: 'requestKeyAndWard', label: 'Ask for the bone key and yew ward', hint: 'He offers them for the work below.', requirements: { notItems: ['boneKey'] }, effects: { gainItems: ['boneKey', 'yewCharm'], knowledge: [RELIC_HISTORY, HAND_BELL_KNOWLEDGE, DO_NOT_RING], lore: ['The masked keeper came when the stolen handbell was sounded.'], setFlags: ['receivedPriestKey'] }, next: 'priestFarewell' },
        { id: 'leaveKeyWithPriest', label: 'Leave the key with him and continue', effects: { knowledge: [RELIC_HISTORY, HAND_BELL_KNOWLEDGE] }, next: 'priestFarewell' },
      ],
    },
    priestFarewell: {
      id: 'priestFarewell', title: 'The Priest’s Warning',
      text: 'The priest grips your sleeve. “The chest is mine to open, but the keeper is not mine to command. Listen before you choose.” He stays below the chapel, alive but too weak to follow.',
      choices: [
        { id: 'returnToChestAfterPriest', label: 'Use the chest before facing the keeper', requirements: { notItems: ['ironHandbell'] }, next: 'chestAfterPriest' },
        { id: 'goKeeperAfterPriest', label: 'Continue through the bronze door', requirements: { items: ['ironHandbell'] }, next: 'burialApproach' },
        { id: 'leaveWithPriest', label: 'Help him out and leave the chapel', effects: { setFlags: ['escortedPriest'] }, next: 'retreatEnding' },
      ],
    },
    chestAfterPriest: {
      id: 'chestAfterPriest', title: 'The Chest, Now Understood',
      text: 'The priest’s key fits the old lock. The chest still waits beneath the warning; now you know the bell was taken from the burial, not left there by accident.',
      choices: [
        { id: 'unlockChest', label: 'Unlock the chest with the bone key', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: takeBellEffects, next: 'bellFoundAfterPriest' },
        { id: 'forceChestAfterPriest', label: 'Force the chest without the key', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.48, successNext: 'bellFoundAfterPriest', failureNext: 'chestJammedAfterPriest', successMessage: 'The lock gives. You take the iron handbell and silver grave coin.', failureMessage: 'The iron band snaps back against your knuckles.', successEffects: takeBellEffects, failureEffects: { health: -2 } } },
        { id: 'wedgeChestAfterPriest', label: 'Pry the band with the candlestick', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'bellFoundAfterPriest' },
        { id: 'skipChestAfterPriest', label: 'Leave the bell and face the keeper', next: 'burialApproach' },
      ],
    },
    chestJammedAfterPriest: {
      id: 'chestJammedAfterPriest', title: 'A Keyhole, Not a Promise', tone: 'warning',
      text: 'The chest still resists. The bone key may turn it, and the bent iron band can be pried with brass. Beyond the door, the keeper waits without approaching.',
      choices: [
        { id: 'keyAfterFailure', label: 'Use the bone key now', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: takeBellEffects, next: 'bellFoundAfterPriest' },
        { id: 'brassAfterFailure', label: 'Pry it with the candlestick', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'bellFoundAfterPriest' },
        { id: 'leaveAfterChestFailure', label: 'Leave without the handbell', next: 'burialApproach' },
      ],
    },
    bellDiscovery: {
      id: 'bellDiscovery', title: 'The Stolen Handbell',
      text: 'Inside the chest lies a cold iron handbell, wrapped in altar cloth, with a silver grave coin caught in the folds. You take both. Its mouth seems to drink the lantern light. The warning above no longer feels abstract.',
      choices: [
        { id: 'followVoiceWithBell', label: 'Find the priest before going on', requirements: { notFlags: ['foundPriest'] }, effects: { setFlags: ['foundPriest'] }, next: 'priestAfterHound' },
        { id: 'keepBellWrapped', label: 'Keep it wrapped and approach the keeper', next: 'burialApproach' },
      ],
    },
    bellFoundAfterPriest: {
      id: 'bellFoundAfterPriest', title: 'The Bell, at Last',
      text: 'The chest gives way. Inside lies the cold iron handbell and a silver grave coin caught in its altar cloth. You take both; the priest’s account has changed the sound of the warning in your mind.',
      choices: [{ id: 'goKeeperWithRecoveredBell', label: 'Carry the wrapped bell to the keeper', next: 'burialApproach' }],
    },
    burialApproach: {
      id: 'burialApproach', title: 'The Old Burial', tone: 'warning',
      text: 'Roots thread through ancient stone. A dark iron weight rests inside a ring of white bones. Across the chamber stands a tall creature in a cracked bronze mask. It raises empty hands; when you move toward the iron, it lowers into a warning crouch. A faint metallic vibration threads through the stones, and the chamber seems to draw sound inward.',
      textVariants: [
        { requirements: { items: ['ironHandbell'] }, text: 'Roots thread through ancient stone. A black iron clapper rests inside a ring of white bones. Across the chamber stands a tall creature in a cracked bronze mask. It raises empty hands; when you move toward the clapper, it lowers into a warning crouch. The handbell in your possession seems to pull every sound toward this room.' },
        { requirements: { knowledge: [HAND_BELL_KNOWLEDGE] }, text: 'Roots thread through ancient stone. A black iron clapper rests inside a ring of white bones. Across the chamber stands a tall creature in a cracked bronze mask. It raises empty hands; when you move toward the clapper, it lowers into a warning crouch. You remember the iron handbell taken from below; every sound seems to gather in this room.' },
      ],
      choices: [
        { id: 'speak', label: 'Show empty hands', hint: 'It has warned you, but has not attacked.', effects: { setFlags: ['showedPeace'] }, next: 'maskedParley' },
        { id: 'snatch', label: 'Snatch the clapper', hint: 'Fast, dangerous, but not impossible.', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned', 'keeperDefeated'] }, chance: { probability: 0.44, successNext: 'keeperAfterSnatch', failureNext: 'keeperWarning', successMessage: 'You roll through the bone ring with the clapper in hand.', failureMessage: 'A long arm hurls you back; your shoulder strikes the stone.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -3, setFlags: ['angeredKeeper'] } } },
        { id: 'fightKnife', label: 'Attack with the small knife', hint: 'The creature is larger; combat may be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.43, damageOnWin: 3, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
        { id: 'fightBrass', label: 'Use the candlestick for reach', hint: 'Its weight gives you a safer opening.', requirements: { items: ['brassCandlestick'] }, effects: { combat: { enemy: 'masked keeper', winChance: 0.68, damageOnWin: 1, damageOnLoss: 5, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
      ],
    },
    keeperWarning: {
      id: 'keeperWarning', title: 'The Keeper’s Warning', tone: 'warning',
      text: 'The creature strikes the stone beside your hand, not your hand. Its open palm turns toward the altar hollow, then to the clapper. It does not pursue when you step back.',
      choices: [
        { id: 'parleyAfterWarning', label: 'Show that you understand', next: 'maskedParley' },
        { id: 'tryClapperAgain', label: 'Reach for the clapper again', hint: 'It will resist; another blow could leave you badly hurt.', requirements: { notItems: ['blackClapper'], notFlags: ['clapperReturned', 'keeperDefeated'] }, chance: { probability: 0.34, successNext: 'keeperAfterSnatch', failureNext: 'keeperClapperFailure', successMessage: 'You wrench the clapper free.', failureMessage: 'The keeper throws you hard against the stone.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -4, setFlags: ['angeredKeeper'] } } },
        { id: 'attackAfterWarning', label: 'Attack the keeper', hint: 'Combat may be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.42, damageOnWin: 3, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
        { id: 'retreatAfterWarning', label: 'Retreat from the burial', next: 'retreatEnding' },
      ],
    },
    keeperClapperFailure: {
      id: 'keeperClapperFailure', title: 'The Keeper Holds Its Ground', tone: 'warning',
      text: 'The keeper pins the clapper beneath one long hand, then steps away from the passage. Your shoulder throbs. You can still leave the relic where it belongs—or leave the burial altogether.',
      choices: [
        { id: 'speakAfterClapperFailure', label: 'Lower your hands and speak', next: 'keeperPlea' },
        { id: 'leaveAfterClapperFailure', label: 'Retreat from the burial', next: 'retreatEnding' },
      ],
    },
    keeperAfterSnatch: {
      id: 'keeperAfterSnatch', title: 'A Keeper, Not a Monster', tone: 'warning',
      text: 'With the clapper in your hand, the creature touches its mask, then points to the hollow in the altar. It does not chase you. Its gesture seems less like a threat now; perhaps it wants something returned, though you do not yet know what.',
      choices: [
        { id: 'returnBoth', label: 'Return both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'returnBothNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'returnClapperFirst', label: 'Return the clapper and watch the keeper', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned'] }, next: 'oneRelicReturn' },
        { id: 'goForBell', label: 'Return to the chapel for the handbell', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, next: 'returnToChest' },
        { id: 'leaveWithClapper', label: 'Leave with the clapper', next: 'retreatEnding' },
      ],
    },
    maskedParley: {
      id: 'maskedParley', title: 'An Open Palm',
      text: 'The keeper’s hands are empty. It stands between you and the old altar, but does not advance. One hand points to the hollow; the other gestures toward the objects you carry. You cannot yet tell whether it is warning you away or asking something of you.',
      choices: [
        { id: 'observeGesture', label: 'Watch for another sign', next: 'keeperSign' },
        { id: 'rememberWarning', label: 'Keep the bell silent and show the warning', requirements: { knowledge: [DO_NOT_RING] }, effects: { setFlags: ['keptBellSilent'] }, next: 'keeperSign' },
        { id: 'attackAtParley', label: 'Attack while it waits', hint: 'It still may be defending the burial.', effects: { combat: { enemy: 'masked keeper', winChance: 0.42, damageOnWin: 3, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
        { id: 'leaveParley', label: 'Back away from the chamber', next: 'retreatEnding' },
      ],
    },
    keeperSign: {
      id: 'keeperSign', title: 'The Hollow in the Altar',
      text: 'The creature turns its palm up. It points to the clapper, then to the hollow. It has watched you cross the chamber without striking. Returning what was taken may be the answer—but its strength is still plain, and you may choose otherwise.',
      textVariants: [
        { requirements: { items: ['ironHandbell'] }, text: 'The creature turns its palm up. The handbell in your possession seems to fit the hollow beside the clapper. It has watched you cross the chamber without striking. Returning what was taken may be the answer—but its strength is still plain, and you may choose otherwise.' },
        { requirements: { knowledge: [HAND_BELL_KNOWLEDGE] }, text: 'The creature turns its palm up. You remember the handbell taken from below; now it points to the clapper and the hollow beside it. It has watched you cross the chamber without striking. Returning what was taken may be the answer—but its strength is still plain, and you may choose otherwise.' },
      ],
      choices: [
        { id: 'signReturnBoth', label: 'Return both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'signReturnBothNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'returnOneRelic', label: 'Return the clapper and watch', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned'] }, next: 'oneRelicReturn' },
        { id: 'returnBellFirst', label: 'Set the handbell in the hollow', requirements: { items: ['ironHandbell'], notItems: ['blackClapper'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['bellReturned'] }, next: 'oneRelicReturn' },
        { id: 'signRetrieveBell', label: 'Return to the chapel for the handbell', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, next: 'returnToChest' },
        { id: 'liftClapper', label: 'Take the clapper from the bone ring', requirements: { items: ['ironHandbell'], notItems: ['blackClapper'] }, chance: { probability: 0.58, successNext: 'clapperTaken', failureNext: 'clapperAttemptFailed', successMessage: 'The keeper holds still; you lift the clapper from the ring.', failureMessage: 'The keeper sweeps your arm away, hard enough to bruise.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -2 } } },
        { id: 'takeClapperNoBell', label: 'Risk taking the clapper', requirements: { notItems: ['blackClapper', 'ironHandbell'] }, chance: { probability: 0.48, successNext: 'clapperTaken', failureNext: 'clapperAttemptFailed', successMessage: 'You take the clapper while the keeper hesitates.', failureMessage: 'The keeper throws you back from the altar.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -3 } } },
        { id: 'fightAtSign', label: 'Attack the keeper', hint: 'Its restraint is no guarantee of safety.', effects: { combat: { enemy: 'masked keeper', winChance: 0.42, damageOnWin: 3, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperAfterFight' } } },
        { id: 'leaveAtSign', label: 'Leave the old burial', next: 'retreatEnding' },
      ],
    },
    clapperTaken: {
      id: 'clapperTaken', title: 'The Clapper in Your Hand', tone: 'warning',
      text: 'The black iron is colder than the chamber. The creature’s raised hand stops short of you, then points toward the hollow. Its warning has become harder to mistake for a threat.',
      textVariants: [
        { requirements: { items: ['ironHandbell'] }, text: 'The black iron is colder than the chamber. The creature’s raised hand stops short of you, then points toward the handbell you carry and the hollow. Its warning has become harder to mistake for a threat.' },
        { requirements: { knowledge: [HAND_BELL_KNOWLEDGE] }, text: 'The black iron is colder than the chamber. The creature’s raised hand stops short of you, then points toward the handbell and the hollow. Its warning has become harder to mistake for a threat.' },
      ],
      choices: [
        { id: 'returnNowWithBoth', label: 'Return both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'returnNowNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'recoverBellAfterLift', label: 'Return to the chest for the handbell', requirements: { notItems: ['ironHandbell'] }, next: 'returnToChest' },
        { id: 'leaveWithTakenClapper', label: 'Leave with the clapper', next: 'retreatEnding' },
      ],
    },
    clapperAttemptFailed: {
      id: 'clapperAttemptFailed', title: 'The Keeper Turns Aside', tone: 'warning',
      text: 'The keeper blocks your hand and steps back toward the altar. You have been warned twice; another reach would be a choice, not a surprise.',
      choices: [
        { id: 'speakAfterSecondFailure', label: 'Lower your hands and speak', next: 'keeperPlea' },
        { id: 'leaveAfterSecondFailure', label: 'Retreat from the chamber', next: 'retreatEnding' },
      ],
    },
    partialReturn: {
      id: 'partialReturn', title: 'Half a Promise',
      text: 'The keeper accepts the first relic and places it beside the altar. It points to the empty place where the other object belongs, then steps aside to let you decide whether to finish the promise.',
      choices: [
        { id: 'finishWithClapper', label: 'Return the clapper and accept the mask shard', requirements: { flags: ['bellReturned'], items: ['blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], setFlags: ['clapperReturned', 'peacefulResolution'], lore: ['The keeper accepted the returned relics and closed the old burial.'] }, next: 'peaceEnding' },
        { id: 'finishWithClapperNoShard', label: 'Return the clapper', requirements: { flags: ['bellReturned'], items: ['blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'finishWithBell', label: 'Return the handbell and accept the mask shard', requirements: { flags: ['clapperReturned'], items: ['ironHandbell'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell'], gainItems: ['bronzeMaskFragment'], setFlags: ['bellReturned', 'peacefulResolution'], lore: ['The keeper accepted the returned relics and closed the old burial.'] }, next: 'peaceEnding' },
        { id: 'finishWithBellNoShard', label: 'Return the handbell', requirements: { flags: ['clapperReturned'], items: ['ironHandbell', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['bellReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'recoverOtherRelic', label: 'Recover the missing handbell', requirements: { flags: ['clapperReturned'], notItems: ['ironHandbell'] }, next: 'returnToChest' },
        { id: 'findClapperAtAltar', label: 'Look for the clapper beside the altar', requirements: { flags: ['bellReturned'], notItems: ['blackClapper'] }, next: 'clapperAtAltar' },
        { id: 'leaveHalfPromise', label: 'Leave the burial behind', next: 'retreatEnding' },
      ],
    },
    oneRelicReturn: {
      id: 'oneRelicReturn', title: 'One Relic Returned',
      text: 'The keeper accepts the first relic, then points to the empty space beside it. The gesture is no longer a threat, but the promise remains unfinished. The passage behind you is open.',
      choices: [
        { id: 'leaveAfterOneRelic', label: 'Leave the burial behind', next: 'retreatEnding' },
        { id: 'stayWithKeeper', label: 'Wait beside the keeper', next: 'oneRelicEnding' },
      ],
    },
    oneRelicEnding: {
      id: 'oneRelicEnding', title: 'A Promise Left Open',
      text: 'You leave the relic in the creature’s care. It bows its masked head as dawn comes; some part of the old wrong remains unfinished.',
      choices: [], ending: 'success',
    },
    clapperAtAltar: {
      id: 'clapperAtAltar', title: 'The Clapper Beside Its Place',
      text: 'The keeper has set the clapper beside the hollow. It watches as you approach, then withdraws a step. The object is still yours to leave—or return.',
      choices: [
        { id: 'takeAltarClapper', label: 'Lift the clapper from the altar', requirements: { notItems: ['blackClapper'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'keeperFinal' },
        { id: 'leaveAltarClapper', label: 'Leave it where the keeper placed it', next: 'retreatEnding' },
      ],
    },
    keeperFinal: {
      id: 'keeperFinal', title: 'The Last Place in the Hollow',
      text: 'The keeper does not stop you. The two relics are together again, and the chamber’s pressure eases. You can complete the return, or leave with what remains.',
      textVariants: [{ requirements: { minElapsedMinutes: 40 }, text: 'The keeper does not stop you. The two relics are together again, but the old stones shiver and dust sifts from the ceiling. You can complete the return, or leave with what remains.' }],
      choices: [
        { id: 'completeReturn', label: 'Return the clapper and accept the mask shard', requirements: { items: ['blackClapper'], flags: ['bellReturned'], notItems: ['bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], setFlags: ['clapperReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'completeReturnNoShard', label: 'Return the clapper', requirements: { items: ['blackClapper', 'bronzeMaskFragment'], flags: ['bellReturned'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'leaveFinal', label: 'Leave the chamber', next: 'retreatEnding' },
      ],
    },
    returnToChest: {
      id: 'returnToChest', title: 'Back Through the Ossuary',
      text: 'You leave the keeper’s chamber to recover the handbell. The route feels different now: the injured priest is still below, and the warning is no longer just words on stone.',
      choices: [
        { id: 'unlockReturnChest', label: 'Unlock the chest with the bone key', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: takeBellEffects, next: 'bellRecovery' },
        { id: 'wedgeReturnChest', label: 'Pry the chest band with the candlestick', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'bellRecovery' },
        { id: 'forceReturnChest', label: 'Force the chest lock', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.43, successNext: 'bellRecovery', failureNext: 'returnChestJammed', successMessage: 'The lock gives; you take the iron handbell and grave coin.', failureMessage: 'The lock jams and the knife slips against the iron band.', successEffects: takeBellEffects, failureEffects: { health: -2 } } },
        { id: 'giveUpBell', label: 'Leave the chest and return to the keeper', next: 'keeperReunion' },
      ],
    },
    returnChestJammed: {
      id: 'returnChestJammed', title: 'The Lock Bites Back', tone: 'warning',
      text: 'The chest lid jams and your fingers sting. You can still use the candlestick to bend the band, or leave without the bell.',
      choices: [
        { id: 'wedgeReturnJammed', label: 'Bend the band with brass', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'bellRecovery' },
        { id: 'leaveReturnJammed', label: 'Leave the bell behind', next: 'keeperReunion' },
      ],
    },
    bellRecovery: {
      id: 'bellRecovery', title: 'The Bell Recovered',
      text: 'The cloth is damp, but the handbell is whole. You take it back toward the keeper. Its sound stays trapped beneath the wrapping.',
      choices: [
        { id: 'returnWithBell', label: 'Carry the bell back to the keeper', next: 'keeperReunion' },
        { id: 'leaveWithRecoveredBell', label: 'Leave the chapel at dawn', next: 'retreatEnding' },
      ],
    },
    keeperReunion: {
      id: 'keeperReunion', title: 'The Keeper Waits', tone: 'warning',
      text: 'The keeper waits beside the hollow and makes no move to take anything from you. The choice of what to do next is yours.',
      choices: [
        { id: 'reunionReturnBoth', label: 'Return both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'reunionReturnBothNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'reunionReturnClapper', label: 'Return the clapper and accept the mask shard', requirements: { items: ['blackClapper'], notItems: ['ironHandbell', 'bronzeMaskFragment'], notFlags: ['bellReturned'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], setFlags: ['clapperReturned'] }, next: 'clapperReturnedAtReunion' },
        { id: 'reunionReturnClapperFinal', label: 'Return the clapper and accept the mask shard', requirements: { items: ['blackClapper'], flags: ['bellReturned'], notItems: ['ironHandbell', 'bronzeMaskFragment'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], setFlags: ['clapperReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'reunionReturnClapperNoShard', label: 'Return the clapper', requirements: { items: ['blackClapper', 'bronzeMaskFragment'], notItems: ['ironHandbell'], notFlags: ['bellReturned'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned'] }, next: 'clapperReturnedAtReunion' },
        { id: 'reunionReturnClapperFinalNoShard', label: 'Return the clapper', requirements: { items: ['blackClapper', 'bronzeMaskFragment'], flags: ['bellReturned'], notItems: ['ironHandbell'] }, effects: { loseItems: ['blackClapper'], setFlags: ['clapperReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'reunionReturnBell', label: 'Return the handbell and accept the mask shard', requirements: { items: ['ironHandbell'], notItems: ['blackClapper', 'bronzeMaskFragment'], notFlags: ['clapperReturned'] }, effects: { loseItems: ['ironHandbell'], gainItems: ['bronzeMaskFragment'], setFlags: ['bellReturned'] }, next: 'bellReturnedAtReunion' },
        { id: 'reunionReturnBellFinal', label: 'Return the handbell and accept the mask shard', requirements: { items: ['ironHandbell'], flags: ['clapperReturned'], notItems: ['blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell'], gainItems: ['bronzeMaskFragment'], setFlags: ['bellReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'reunionReturnBellNoShard', label: 'Return the handbell', requirements: { items: ['ironHandbell', 'bronzeMaskFragment'], notItems: ['blackClapper'], notFlags: ['clapperReturned'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['bellReturned'] }, next: 'bellReturnedAtReunion' },
        { id: 'reunionReturnBellFinalNoShard', label: 'Return the handbell', requirements: { items: ['ironHandbell', 'bronzeMaskFragment'], flags: ['clapperReturned'], notItems: ['blackClapper'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['bellReturned', 'peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'leaveReunion', label: 'Leave the keeper in peace', next: 'retreatEnding' },
      ],
    },
    clapperReturnedAtReunion: {
      id: 'clapperReturnedAtReunion', title: 'One Relic Returned',
      text: 'The keeper places the iron object in the hollow. The chamber grows quieter. It watches you for a moment, then allows you to leave with the promise unfinished.',
      choices: [
        { id: 'leaveAfterClapperAtReunion', label: 'Leave with the promise unfinished', next: 'retreatEnding' },
      ],
    },
    bellReturnedAtReunion: {
      id: 'bellReturnedAtReunion', title: 'The Bell in Its Place',
      text: 'The handbell rests beside the altar. The keeper steps back from the clapper in its bone ring and waits.',
      choices: [
        { id: 'findFinalClapper', label: 'Lift the clapper and return it', requirements: { notItems: ['blackClapper'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'keeperFinal' },
        { id: 'leaveAfterBellAtReunion', label: 'Leave the bell in the hollow', next: 'retreatEnding' },
      ],
    },
    keeperAfterFight: {
      id: 'keeperAfterFight', title: 'The Keeper Strikes Back', tone: 'danger',
      text: 'The keeper’s blow drives you against the burial stones. It is defending the altar, not chasing you. You can lower your weapon or press an attack that may kill you.',
      choices: [
        { id: 'stopFight', label: 'Lower your weapon', next: 'keeperHesitates' },
        { id: 'fightAgain', label: 'Press the attack', hint: 'You are hurt; another blow may be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.48, damageOnWin: 3, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'keeperOverpowered' } } },
        { id: 'fleeFight', label: 'Flee toward the chapel', next: 'retreatEnding' },
      ],
    },
    keeperHesitates: {
      id: 'keeperHesitates', title: 'An Opening for Peace',
      text: 'You lower the weapon. The keeper studies you, then turns its open palm toward the altar hollow. It has not forgotten the blow, but gives you one chance to make this right.',
      choices: [
        { id: 'pleadForPeace', label: 'Show the relics', next: 'keeperPlea' },
        { id: 'leaveAfterFight', label: 'Retreat from the burial', next: 'retreatEnding' },
      ],
    },
    keeperPlea: {
      id: 'keeperPlea', title: 'A Costly Truce',
      text: 'The keeper accepts your open hands. There is no easy trust now, but the relics can still be returned. The hollow and the creature’s empty hands make their meaning plain at last.',
      choices: [
        { id: 'offerBothAfterFight', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'offerBothNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution', 'bellReturned', 'clapperReturned'] }, next: 'peaceEnding' },
        { id: 'leaveAfterPlea', label: 'Leave the burial', next: 'retreatEnding' },
      ],
    },
    keeperOverpowered: {
      id: 'keeperOverpowered', title: 'The Keeper’s Last Warning', tone: 'danger',
      text: 'The keeper’s final blow sends you across the bones. It could finish you, but backs toward the altar instead. The fight is over; what happens next remains your choice.',
      choices: [
        { id: 'backDown', label: 'Stop fighting', next: 'keeperPlea' },
        { id: 'crawlAway', label: 'Crawl toward the passage', next: 'retreatEnding' },
      ],
    },
    keeperDefeated: {
      id: 'keeperDefeated', title: 'A Costly Victory', tone: 'danger',
      text: 'The masked creature falls beside the altar. It never cries out. Behind the cracked mask is a face both ancient and terribly human. The hand it reaches toward the relics is not a threat now.',
      choices: [
        { id: 'takeBothAfterFight', label: 'Take the clapper and mask fragment', requirements: { notItems: ['blackClapper', 'bronzeMaskFragment'] }, effects: { gainItems: ['blackClapper', 'bronzeMaskFragment'], lore: ['Violence ended the keeper, though returning the stolen relics might have ended the haunting.'], setFlags: ['keeperDefeated', 'hasClapper'] }, next: 'hardEnding' },
        { id: 'takeMaskAfterFight', label: 'Take the mask fragment', requirements: { items: ['blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: { gainItems: ['bronzeMaskFragment'], lore: ['The keeper guarded the old burial, though you learned it too late.'], setFlags: ['keeperDefeated'] }, next: 'hardEnding' },
        { id: 'leaveRelicsAfterFight', label: 'Leave the relics with the keeper', next: 'retreatEnding' },
      ],
    },
    legacyResume: {
      id: 'legacyResume', title: 'The Passage Settles', tone: 'warning',
      text: 'The old stones shift, and the route through the chapel has changed. Your wounds, belongings, and discoveries remain with you. Ahead, the keeper waits beside the burial hollow; behind, there is still a way out.',
      choices: [
        { id: 'legacyBothRelics', label: 'Offer both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'legacyBothNoShard', label: 'Offer both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'legacyContinue', label: 'Continue to the keeper', next: 'legacyKeeper' },
        { id: 'legacyLeave', label: 'Leave the chapel', next: 'retreatEnding' },
      ],
    },
    legacyKeeper: {
      id: 'legacyKeeper', title: 'A Chance to Finish',
      text: 'The keeper watches what you carry. You can still return the relics, retrieve a missing one, or leave the burial behind.',
      choices: [
        { id: 'legacyReturnPair', label: 'Return both relics and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'legacyReturnPairNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'legacyFindBell', label: 'Recover the handbell', requirements: { items: ['blackClapper'], notItems: ['ironHandbell'] }, next: 'legacyChest' },
        { id: 'legacyFindClapper', label: 'Reach for the clapper', requirements: { items: ['ironHandbell'], notItems: ['blackClapper'] }, chance: { probability: 0.54, successNext: 'legacyReunion', failureNext: 'legacyWarning', successMessage: 'You lift the clapper while the keeper holds still.', failureMessage: 'The keeper knocks your arm away.', successEffects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, failureEffects: { health: -2 } } },
        { id: 'legacyLeave', label: 'Leave the burial behind', next: 'retreatEnding' },
      ],
    },
    legacyChest: {
      id: 'legacyChest', title: 'The Old Chest',
      text: 'The handbell remains in the chest beneath the warning. You know what the keeper is guarding now; the bone key and brass candlestick can still help.',
      choices: [
        { id: 'legacyUnlock', label: 'Unlock it with the bone key', requirements: { items: ['boneKey'], notItems: ['ironHandbell'] }, effects: takeBellEffects, next: 'legacyReunion' },
        { id: 'legacyWedge', label: 'Pry it with the candlestick', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'legacyReunion' },
        { id: 'legacyForce', label: 'Force the lock', requirements: { notItems: ['ironHandbell'] }, chance: { probability: 0.43, successNext: 'legacyReunion', failureNext: 'legacyChestJam', successMessage: 'The lid opens; you take the bell and grave coin.', failureMessage: 'The lock jams against the iron band.', successEffects: takeBellEffects, failureEffects: { health: -2 } } },
        { id: 'legacyLeaveChest', label: 'Leave the chest', next: 'retreatEnding' },
      ],
    },
    legacyChestJam: {
      id: 'legacyChestJam', title: 'The Lock Still Holds',
      text: 'The chest will not open by force. You can bend the band with the candlestick or leave with the clapper alone.',
      choices: [
        { id: 'legacyWedgeJam', label: 'Wedge the band with brass', requirements: { items: ['brassCandlestick'], notItems: ['ironHandbell'] }, effects: { loseItems: ['brassCandlestick'], ...takeBellEffects }, next: 'legacyReunion' },
        { id: 'legacyGiveUp', label: 'Leave the chapel', next: 'retreatEnding' },
      ],
    },
    legacyWarning: {
      id: 'legacyWarning', title: 'The Keeper Turns Away', tone: 'warning',
      text: 'The keeper does not pursue you. Its open hand points toward the altar hollow once more.',
      choices: [
        { id: 'legacySpeak', label: 'Lower your hands', next: 'legacyReunion' },
        { id: 'legacyRetreat', label: 'Leave the burial', next: 'retreatEnding' },
      ],
    },
    legacyReunion: {
      id: 'legacyReunion', title: 'The Relics Together',
      text: 'The keeper waits beside the hollow. With the bell and clapper together, you can return them—or leave with the story still unfinished.',
      choices: [
        { id: 'legacyFinishReturn', label: 'Return both and accept the mask shard', requirements: { items: ['ironHandbell', 'blackClapper'], notItems: ['bronzeMaskFragment'] }, effects: returnBothEffects, next: 'peaceEnding' },
        { id: 'legacyFinishReturnNoShard', label: 'Return both relics', requirements: { items: ['ironHandbell', 'blackClapper', 'bronzeMaskFragment'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'legacyFinishWithOne', label: 'Leave with what you have', next: 'retreatEnding' },
      ],
    },
    retreatEnding: {
      id: 'retreatEnding', title: 'The Chapel at Dawn',
      text: 'You reach the dawn with the night’s questions unresolved. You have survived, and the chapel is quiet for now.',
      textVariants: [
        { requirements: { flags: ['escortedPriest'] }, text: 'You guide the injured priest into the dawn. You have survived, and the chapel is quiet for now.' },
        { requirements: { flags: ['boundPriest'] }, text: 'The priest’s wound is bound as you reach the dawn. You have survived, and the chapel is quiet for now.' },
      ],
      choices: [], ending: 'success',
    },
    peaceEnding: {
      id: 'peaceEnding', title: 'The Bell Stays Silent',
      text: 'The keeper fits the clapper beside the handbell, never inside it, and closes the burial altar. Its shoulders settle. Above, the graveyard grows quiet. A bronze mask fragment remains on the stone, offered in thanks.',
      choices: [], ending: 'success',
    },
    hardEnding: {
      id: 'hardEnding', title: 'Morning, at a Price',
      text: 'You leave the old passage as it settles behind you. The creature will not rise again. The victory is real, but the keeper’s empty hands stay with you; you wonder what the chapel has lost.',
      choices: [], ending: 'success',
    },
    deathBell: {
      id: 'deathBell', title: 'The Sound Below', tone: 'danger',
      text: 'The iron note has nowhere to go. It passes through stone, bone, and lantern glass. The last thing you see is the keeper reaching not to strike you, but to silence the bell.',
      choices: [], ending: 'death',
    },
  },
};
