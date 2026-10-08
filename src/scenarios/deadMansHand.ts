import type { Scenario } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

const DEBT_KNOWLEDGE = 'Boone is three dollars behind on his marker and is afraid of losing his room.';
const CUT_CARD_KNOWLEDGE = 'The red card Ada passed across the table was the ordinary cut card, not a signal.';
const TOOL_ITEMS = ['pocketToolkit', 'foremanMultiTool', 'ratCatchersHook', 'foldingCardMirror', 'assayersLoupe'];
const WEAPON_ITEMS = ['smallKnife', 'brassCandlestick', 'ratCatchersHook', 'dealerCardKnife'];

export const DEAD_MANS_HAND: Scenario = {
  id: 'dead-mans-hand',
  title: 'Dead Man’s Hand',
  subtitle: 'A quiet card game, a missing few dollars, and the cost of being certain.',
  startScene: 'saloonArrival',
  timePhases: [
    { id: 'cardsAndConversation', label: 'Cards and Conversation', atMinutes: 0 },
    { id: 'voicesRising', label: 'Voices Rising', atMinutes: 10 },
    { id: 'handsNearBelts', label: 'Hands Near Belts', atMinutes: 20 },
    { id: 'powderInTheAir', label: 'One Breath from Violence', atMinutes: 32 },
  ],
  scenes: {
    saloonArrival: {
      id: 'saloonArrival', title: 'A Seat at the Table',
      text: 'The Dusty Spur is busy with supper talk and cigar smoke. At the card table, Ada deals five-card draw. Mercer has won two small pots; Boone, across from him, has lost most of a roll and keeps glancing toward the door. A worn revolver holster rides Boone’s belt, but his hands stay above the table. Ada’s hands are steady until someone speaks to her. A fourth chair has just opened. Nothing here proves more than a tense game.',
      choices: [
        { id: 'takeOpenSeat', label: 'Take the open seat', hint: 'You can play for a small stake or sit in without betting.', timeCost: 1, next: 'seatInvitation' },
        { id: 'watchFromRail', label: 'Watch one hand from the rail', timeCost: 2, next: 'watchedFirstHand' },
        { id: 'speakToMabel', label: 'Ask the bartender what she has seen', timeCost: 4, next: 'bartenderOpening' },
        { id: 'leaveAtArrival', label: 'Leave the saloon', hint: 'You have no obligation to get involved.', timeCost: 1, effects: { historyFlags: ['walked_away_from_saloon_dispute'] }, next: 'walkAwayAtArrival' },
      ],
    },
    seatInvitation: {
      id: 'seatInvitation', title: 'One Hand, Your Choice',
      text: 'Ada explains the stakes before dealing: two dollars buys one small hand; she will also let you sit in without a bet. Boone watches your hands, Mercer watches the cards, and the dealer’s box is within everyone’s reach.',
      choices: [
        { id: 'buyIntoHand', label: 'Buy in for one hand — 2 dollars', requirements: { minMoney: 2 }, timeCost: 2, effects: { money: -2, setFlags: ['paidSaloonStake'] }, next: 'playerHand' },
        { id: 'sitWithoutBet', label: 'Sit in without betting', timeCost: 1, effects: { setFlags: ['satWithoutStake'] }, next: 'playerHand' },
        { id: 'watchInstead', label: 'Stay out and watch', timeCost: 1, next: 'watchedFirstHand' },
      ],
    },
    playerHand: {
      id: 'playerHand', title: 'Five Cards Each',
      text: 'Ada deals a single hand. Mercer sorts his cards without looking at anyone. Boone’s chair scrapes as he leans forward. There is time for one decision before the next deal.',
      choices: [
        { id: 'callOneHand', label: 'Call the small hand', hint: 'The two-dollar stake is already on the table.', requirements: { flags: ['paidSaloonStake'] }, timeCost: 4, chance: { probability: 0.55, successNext: 'handWon', failureNext: 'handLost', successMessage: 'Your hand holds. Ada pushes three dollars across to you, and Mercer studies your face.', failureMessage: 'Mercer takes the hand. The two-dollar buy-in is gone; Boone notices that you did not accuse anyone.' , successEffects: { money: 3, setFlags: ['wonSaloonHand'] }, failureEffects: { setFlags: ['lostSaloonHand'] } } },
        { id: 'bluffOneHand', label: 'Bluff with the small stake', hint: 'The same two-dollar stake is at risk; Mercer may call you.', requirements: { flags: ['paidSaloonStake'] }, timeCost: 4, chance: { probability: 0.4, successNext: 'handWon', failureNext: 'handLost', successMessage: 'You sell the raise. Mercer folds without showing; Ada pushes three dollars across to you.', failureMessage: 'Mercer calls your bluff and takes the pot. The two-dollar buy-in is gone.', successEffects: { money: 3, setFlags: ['wonSaloonHand', 'bluffedMercer'] }, failureEffects: { setFlags: ['lostSaloonHand', 'bluffedMercer'] } } },
        { id: 'foldAndWatch', label: 'Fold and watch the deal', timeCost: 3, effects: { setFlags: ['foldedSaloonHand'] }, next: 'playerWatchedDeal' },
      ],
    },
    handWon: { id: 'handWon', title: 'Three Dollars Back', text: 'Ada counts out your three-dollar win in full view of the table. You have made a little money, but Boone’s jaw has tightened and Mercer asks for another deal.', choices: [{ id: 'standAfterWin', label: 'Stand as the next hand is dealt', timeCost: 2, next: 'risingTension' }] },
    handLost: { id: 'handLost', title: 'A Costly Hand', text: 'Your two-dollar stake is gone. Ada offers no rematch. Boone mutters that the game has been wrong from the start, though he will not yet say why.', choices: [{ id: 'standAfterLoss', label: 'Leave the table as the next hand is dealt', timeCost: 2, next: 'risingTension' }] },
    playerWatchedDeal: {
      id: 'playerWatchedDeal', title: 'Watching Instead of Betting',
      text: 'From your seat you can follow only one set of hands before the next deal. Boone looks toward Ada whenever a card changes hands; Mercer keeps his fingertips close to the deck.',
      choices: [
        { id: 'watchMercersThumb', label: 'Watch Mercer’s fingers', timeCost: 3, effects: { setFlags: ['watchedMercer'], knowledge: ['Mercer rubs the corners of his cards with his right thumb whenever the deck is passed.'] }, next: 'risingTension' },
        { id: 'watchAdasDeal', label: 'Watch Ada’s dealing hand', timeCost: 3, effects: { setFlags: ['watchedAda'], knowledge: ['Ada hesitated when Mercer asked to cut the deck, then let him do it.'] }, next: 'risingTension' },
      ],
    },
    watchedFirstHand: {
      id: 'watchedFirstHand', title: 'A Round from the Rail',
      text: 'You stay beside the bar. Mercer wins another modest pot. Ada passes a red card to him before the deal; Boone sees it too and stiffens. The card game continues, but the room feels smaller.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: 'An earlier rescue comes to mind as you watch from the rail. Mercer wins another modest pot. Ada passes a red card to him before the deal; Boone sees it too and stiffens. The room feels smaller.' }],
      choices: [
        { id: 'watchMercerFromRail', label: 'Follow Mercer’s hands', timeCost: 3, effects: { setFlags: ['watchedMercer'], knowledge: ['Mercer rubs the corners of his cards with his right thumb whenever the deck is passed.'] }, next: 'risingTension' },
        { id: 'watchAdaFromRail', label: 'Follow Ada’s dealing hand', timeCost: 3, effects: { setFlags: ['watchedAda'], knowledge: ['Ada hesitated when Mercer asked to cut the deck, then let him do it.'] }, next: 'risingTension' },
        { id: 'waitAnotherRound', label: 'Wait through a full round', hint: 'You may see more, but the argument has time to grow.', timeCost: 13, effects: { setFlags: ['waitedForAnotherRound'] }, next: 'risingTension' },
      ],
    },
    bartenderOpening: {
      id: 'bartenderOpening', title: 'Mabel Keeps Pouring',
      text: 'Mabel dries the same glass twice. “Boone’s been losing. Mercer’s been winning. Ada’s been dealing. I can tell you what I saw, not what it means.” She does not lower her voice until the pianist starts another tune.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: 'An earlier rescue comes to mind as Mabel speaks. “Boone’s been losing. Mercer’s been winning. Ada’s been dealing. I can tell you what I saw, not what it means.” She says Boone is short three dollars on his marker, then asks what you would like to know.' }],
      choices: [
        { id: 'askMabelAboutBoone', label: 'Ask what Boone stands to lose', timeCost: 3, effects: { knowledge: [DEBT_KNOWLEDGE], setFlags: ['heardBooneDebt'] }, next: 'risingTension' },
        { id: 'askMabelAboutAda', label: 'Ask why Ada seems nervous', timeCost: 3, effects: { knowledge: ['Ada asked Mercer to cut the deck twice; the red card he passed back was the house cut card.'], setFlags: ['heardAboutCutCard'] }, next: 'risingTension' },
        { id: 'buyMabelARound', label: 'Buy Mabel a coffee — 1 dollar', hint: 'She may tell you what happened before the game.', requirements: { minMoney: 1 }, timeCost: 2, effects: { money: -1, knowledge: ['Mercer arrived before the game and asked to handle the fresh deck before Ada opened the box.'], setFlags: ['tippedMabel'] }, next: 'risingTension' },
      ],
    },
    risingTension: {
      id: 'risingTension', title: 'The Table Tightens', tone: 'warning',
      text: 'Boone pushes back his chair, but does not stand. Mercer asks Ada to deal again. The small clues you have seen can fit more than one story: a player’s hands, a dealer’s hesitation, a debt, or simply a losing streak. You can spend time looking closer or step into the argument now.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'Chairs scrape back. Boone is standing now, one hand near his belt. Two patrons have left. Ada asks everyone to keep their hands visible; Mercer wants another deal. You can still learn something, but every extra minute makes a quiet word harder to hear.' },
        { requirements: { minElapsedMinutes: 14 }, text: 'Another round has passed. Boone is standing now, one hand near his belt. Mabel has begun putting away the glassware. The deputy’s office across the street is dark; no one can fetch him before the room turns.' },
      ],
      choices: [
        { id: 'inspectWithTool', label: 'Check the discarded cards carefully', hint: 'A toolkit, hook, or mirror reaches the cards quickly; the loupe makes fine edge nicks easier to distinguish.', requirements: { anyItems: TOOL_ITEMS }, timeCost: 3, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.markedAces], setFlags: ['foundMarkedAces'] }, next: 'markedDeckProof' },
        { id: 'inspectWithoutTool', label: 'Study the discarded cards by hand', hint: 'Takes longer and risks drawing attention.', requirements: { notItems: TOOL_ITEMS }, timeCost: 8, chance: { probability: 0.68, successNext: 'markedDeckProof', failureNext: 'uncertainCards', successMessage: 'Three aces have tiny crescent nicks at the same corner. Mercer’s thumb fits the marks.', failureMessage: 'The cards are worn from use; none gives you certain proof.', successEffects: { knowledgeEntries: [KNOWLEDGE_FACTS.markedAces], setFlags: ['foundMarkedAces'] }, failureEffects: { setFlags: ['searchDrewAttention'] } } },
        { id: 'speakPrivatelyToBoone', label: 'Ask Boone what he actually saw', timeCost: 4, next: 'boonePrivate' },
        { id: 'speakPrivatelyToAda', label: 'Ask Ada why she is afraid', timeCost: 4, next: 'adaPrivate' },
        { id: 'fetchMarshal', label: 'Fetch the marshal while voices are low', hint: 'Only possible before the argument has boiled over.', requirements: { maxElapsedMinutes: 13 }, timeCost: 4, effects: { historyFlags: ['called_for_help_at_saloon'], setFlags: ['marshalAtDoor'] }, next: 'marshalOutside' },
      ],
    },
    markedDeckProof: {
      id: 'markedDeckProof', title: 'A Mark No One Else Saw', tone: 'warning',
      text: 'The discarded cards show three aces with tiny half-moon nicks at one corner. Mercer’s right thumb keeps tracing that same edge. The marks are not a dealer’s pattern: they were made before the cards reached Ada’s hands.',
      choices: [
        { id: 'bringMarksToTable', label: 'Bring the marked cards to the table', timeCost: 1, effects: { setFlags: ['showedCardEvidence'] }, next: 'readyConfrontation' },
        { id: 'keepMarksPrivate', label: 'Keep the cards to yourself', hint: 'You know more now, but the table does not.', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_saloon_dispute'] } },
      ],
    },
    uncertainCards: {
      id: 'uncertainCards', title: 'No Certain Proof', tone: 'warning',
      text: 'The corners are worn, but not in a way you can confidently read. You have spent several minutes leaning over the discard tray; Boone is watching you now. Suspicion is not the same as proof.',
      choices: [{ id: 'returnWithoutProof', label: 'Return to the table without an accusation', next: 'readyConfrontation' }],
    },
    boonePrivate: {
      id: 'boonePrivate', title: 'Boone’s Three Dollars',
      text: 'Boone admits he is three dollars short on his marker. “That does not make me wrong,” he says. He saw Ada pass Mercer the red card and took it for a signal. You know Mabel said the card was used to cut the deck, but Boone has not heard that.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: 'Your earlier rescue comes to mind, and you keep your voice level. Boone lowers his. He admits he is three dollars short on his marker and saw Ada pass Mercer the red card. “That does not make me wrong,” he says. The debt and the card are both real; neither proves collusion.' }],
      choices: [
        { id: 'askBooneToShowMarker', label: 'Ask him to show you the marker', timeCost: 2, effects: { knowledge: [DEBT_KNOWLEDGE, 'Boone mistook Ada’s red cut card for a signal, but admits he did not see what Mercer did with his hand.'], setFlags: ['heardBooneDebt', 'heardBooneTheory'] }, next: 'readyConfrontation' },
        { id: 'payBoonesMarker', label: 'Pay Boone’s three-dollar marker', requirements: { minMoney: 3 }, timeCost: 1, effects: { money: -3, historyFlags: ['paid_anothers_saloon_debt', 'intervened_in_saloon_dispute'], setFlags: ['booneDebtPaid'] }, next: 'debtSettled' },
      ],
    },
    debtSettled: {
      id: 'debtSettled', title: 'The Marker Is Paid', tone: 'warning',
      text: 'You pay Ada three dollars, and she tears Boone’s marker in half where everyone can see. Boone lets go of the table edge. Mercer asks for the next deal. The immediate threat has eased, but no one proved whether the cards were fair.',
      choices: [
        { id: 'leaveAfterDebt', label: 'Leave the game unresolved', effects: { historyFlags: ['prevented_saloon_violence'] }, next: 'partialEnding' },
        { id: 'stayAfterDebt', label: 'Stay and hear Ada’s account', timeCost: 3, effects: { setFlags: ['paidDebtStayed'] }, next: 'readyConfrontation' },
      ],
    },
    adaPrivate: {
      id: 'adaPrivate', title: 'Ada Behind the Bar',
      text: 'Ada says she is afraid Boone will draw on Mercer, not afraid of the cards. The red card she passed was the house cut card. She has twice asked Mercer to cut the deck; both times he used his right hand and covered the edges with his thumb.',
      choices: [
        { id: 'askAdaToShowDeck', label: 'Ask Ada to show you the deck', timeCost: 2, effects: { knowledgeEntries: [KNOWLEDGE_FACTS.markedAces], setFlags: ['foundMarkedAces', 'heardAdaAccount'] }, next: 'markedDeckProof' },
        { id: 'askAdaAboutCutCard', label: 'Ask her to explain the red card', timeCost: 1, effects: { knowledge: [CUT_CARD_KNOWLEDGE], setFlags: ['heardAboutCutCard', 'heardAdaAccount'] }, next: 'readyConfrontation' },
      ],
    },
    marshalOutside: {
      id: 'marshalOutside', title: 'The Marshal at the Door',
      text: 'The marshal agrees to stand at the saloon door, but will not arrest anyone on a rumor. “Show me what you know. Keep your hands clear, and let me separate them if it goes bad.” His presence may slow the room, not settle what happened.',
      choices: [
        { id: 'returnWithMarshal', label: 'Return together before another hand is dealt', timeCost: 4, next: 'readyConfrontation' },
        { id: 'askMarshalToWait', label: 'Ask him to watch while you speak', timeCost: 2, next: 'readyConfrontation' },
      ],
    },
    readyConfrontation: {
      id: 'readyConfrontation', title: 'The Hand Hangs in the Air', tone: 'danger',
      text: 'Boone stands. Mercer puts his cards down but keeps one hand below the table. Ada asks them both to stop. You have a moment to choose whether to name what you suspect, lower the temperature, or get between them.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'Boone stands, hand near his belt. Mercer has put his cards down but keeps one hand below the table. Ada asks them both to stop; Mabel has begun moving patrons toward the back. There is little time to collect more testimony without risking the room.' },
        { requirements: { flags: ['marshalAtDoor'] }, text: 'Boone stands, hand near his belt. Mercer has put his cards down but keeps one hand below the table. The marshal is at the door, ready to keep them apart, but will not decide who is right for you.' },
        { requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.markedAces.id] }, text: 'Boone stands. Mercer has put his cards down but keeps one hand below the table. You know the three aces carry matching half-moon nicks. Ada asks you not to turn a piece of evidence into a reason for someone to draw.' },
      ],
      choices: [
        { id: 'showMarkedAces', label: 'Show the table the three marked aces', requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.markedAces.id] }, timeCost: 1, effects: { historyFlags: ['exposed_card_cheat', 'prevented_saloon_violence', 'intervened_in_saloon_dispute'], setFlags: ['cheatExposed'] }, next: 'exposureReward' },
        { id: 'tellBooneToStandDown', label: 'Ask Boone to lower his hand', hint: 'He may hear you—or decide you are taking Mercer’s side.', timeCost: 1, chance: { probability: 0.56, bonusFlags: ['heardBooneDebt', 'showedCardEvidence', 'marshalAtDoor'], bonusProbability: 0.2, successNext: 'peacefulEnding', failureNext: 'gunDrawn', successMessage: 'Boone looks at the table, then lowers his hand. The room exhales.', failureMessage: 'Boone hears an accusation in your voice and reaches for his pistol.', successEffects: { historyFlags: ['prevented_saloon_violence', 'intervened_in_saloon_dispute'] }, failureEffects: { historyFlags: ['escalated_saloon_dispute', 'intervened_in_saloon_dispute'] } } },
        { id: 'accuseAda', label: 'Accuse Ada of signaling Mercer', hint: 'The red card and her nerves support a theory, not a certainty.', timeCost: 1, effects: { historyFlags: ['falsely_accused_ada', 'escalated_saloon_dispute', 'intervened_in_saloon_dispute'] }, next: 'wrongAccusationEnding' },
        { id: 'separateThem', label: 'Ask the marshal to separate them', requirements: { flags: ['marshalAtDoor'] }, effects: { historyFlags: ['prevented_saloon_violence', 'intervened_in_saloon_dispute'] }, next: 'partialEnding' },
        { id: 'stepBetweenThem', label: 'Step between Boone and Mercer', hint: 'Their hands are close to the table and Boone’s belt; a struggle could turn dangerous.', requirements: { notFlags: ['marshalAtDoor'] }, timeCost: 1, chance: { probability: 0.62, bonusItems: ['brassCandlestick', 'heavyLeatherGloves'], bonusProbability: 0.14, successNext: 'peacefulEnding', failureNext: 'gunDrawn', successMessage: 'You catch Boone’s eye and give him space to back away.', failureMessage: 'Boone draws when you cross the space between them.', successEffects: { historyFlags: ['prevented_saloon_violence', 'intervened_in_saloon_dispute'] }, failureEffects: { health: -1, historyFlags: ['escalated_saloon_dispute', 'intervened_in_saloon_dispute'] } } },
      ],
    },
    wrongAccusationEnding: {
      id: 'wrongAccusationEnding', title: 'The Wrong Name',
      text: 'Ada opens her hands and the red cut card is plain for everyone to see. Boone had read a normal dealing habit as a signal. Mercer leaves while the table argues over your accusation. Ada was not helping him; the game’s real problem remains unclear to most of the room.', choices: [], ending: 'success',
    },
    peacefulEnding: {
      id: 'peacefulEnding', title: 'A Hand Lowered',
      text: 'Boone lowers his hand. Ada ends the game and asks the remaining players to settle what they can in daylight. The argument stops before anyone is hurt, though no one has agreed on what the cards meant.', choices: [], ending: 'success',
    },
    partialEnding: {
      id: 'partialEnding', title: 'A Quiet Exit, for Now',
      text: 'The marshal keeps the men apart until the room clears. The immediate danger passes, but he has no grounds to arrest anyone and the game’s fairness remains unsettled. You leave without pretending to know more than you do.', choices: [], ending: 'success',
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Outside',
      text: 'You leave the Dusty Spur. Behind you, the voices continue for a while; the door closes before you can know how the argument ends. You have kept yourself out of a dispute that was not yours to settle.', choices: [], ending: 'success',
    },
    walkAwayAtArrival: {
      id: 'walkAwayAtArrival', title: 'The Road Outside',
      text: 'You leave the Dusty Spur. Behind you, the voices continue for a while; the door closes before you can know how the argument ends. You have kept yourself out of a dispute that was not yours to settle.', choices: [], ending: 'success', completionQualification: 'nonSubstantive',
    },
    gunDrawn: {
      id: 'gunDrawn', title: 'A Pistol in Boone’s Hand', tone: 'danger',
      text: 'Boone has drawn a pistol. Mabel has stopped the music, and patrons are pressed against the far wall. His finger is on the trigger; charging him could get you shot. Mercer has both hands on the table. You have one moment to lower the danger or escape.',
      textVariants: [{ requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.markedAces.id] }, text: 'Boone has drawn a pistol. Mabel has stopped the music, and patrons are pressed against the far wall. His finger is on the trigger; charging him could get you shot. The marked aces are visible on the table, but Boone is not looking at them.' }],
      choices: [
        { id: 'keepHandsVisible', label: 'Keep your hands visible and speak slowly', timeCost: 1, chance: { probability: 0.68, bonusFlags: ['marshalAtDoor', 'showedCardEvidence'], bonusProbability: 0.18, successNext: 'partialEnding', failureNext: 'gunshotAftermath', successMessage: 'Boone’s aim wavers. The marshal steps in and gets everyone clear.', failureMessage: 'The pistol fires into the floorboards; splinters strike your leg.', successEffects: { historyFlags: ['prevented_saloon_violence'] }, failureEffects: { health: -3, historyFlags: ['escalated_saloon_dispute'] } } },
        { id: 'knockPistolAside', label: 'Knock the pistol aside with a small weapon', hint: 'The pistol is raised. Failure could be fatal.', requirements: { anyItems: WEAPON_ITEMS }, timeCost: 1, chance: { probability: 0.42, bonusItems: ['brassCandlestick', 'ratCatchersHook', 'dealerCardKnife'], bonusProbability: 0.18, successNext: 'weaponDown', failureNext: '__death', successMessage: 'The blow knocks the pistol across the floor.', failureMessage: 'Boone fires before you reach his wrist.' , successEffects: { health: -1 }, failureEffects: { historyFlags: ['escalated_saloon_dispute'] } } },
        { id: 'diveForDoor', label: 'Dive for the front door', hint: 'A clear route remains, but the shot may follow you.', timeCost: 1, chance: { probability: 0.7, successNext: 'walkAwayEnding', failureNext: 'gunshotAftermath', successMessage: 'You reach the door as Boone’s aim swings back toward Mercer.', failureMessage: 'The shot catches your side before you reach the door.', successEffects: { historyFlags: ['walked_away_from_saloon_dispute'] }, failureEffects: { health: -4, historyFlags: ['escalated_saloon_dispute'] } } },
      ],
    },
    gunshotAftermath: {
      id: 'gunshotAftermath', title: 'The Room Breaks Apart', tone: 'danger',
      text: 'The shot hits the floor, and the saloon empties toward the back exit. Your leg is bleeding, but you can still move. Boone is looking at the pistol, not at you. Staying in reach risks another shot.',
      choices: [
        { id: 'crawlToBackExit', label: 'Crawl out through the back door', effects: { historyFlags: ['walked_away_from_saloon_dispute'] }, next: 'walkAwayEnding' },
        { id: 'secureDroppedPistol', label: 'Use your travel rope to secure the dropped pistol', requirements: { items: ['travelRope'] , usableItems: ['travelRope']}, effects: { historyFlags: ['intervened_in_saloon_dispute', 'prevented_saloon_violence'] }, next: 'violentSurvivalEnding' },
        { id: 'getEveryoneClear', label: 'Keep low and help the others escape', effects: { health: -1, historyFlags: ['prevented_saloon_violence'] }, next: 'partialEnding' },
      ],
    },
    weaponDown: {
      id: 'weaponDown', title: 'The Pistol Skids Away', tone: 'warning',
      text: 'The pistol skids beneath a chair. Boone is still within reach, and several patrons are moving for the doors. He has stopped reaching for the gun, but grabbing him now could start another struggle.',
      choices: [
        { id: 'tieBooneWithRope', label: 'Use your rope to keep the pistol away', requirements: { items: ['travelRope'] }, effects: { historyFlags: ['prevented_saloon_violence', 'intervened_in_saloon_dispute'] }, next: 'violentSurvivalEnding' },
        { id: 'letBooneGo', label: 'Let Boone back away from the table', effects: { historyFlags: ['prevented_saloon_violence'] }, next: 'violentSurvivalEnding' },
        { id: 'retrievePistol', label: 'Move the pistol out of reach', timeCost: 1, chance: { probability: 0.76, successNext: 'violentSurvivalEnding', failureNext: 'gunshotAftermath', successMessage: 'You kick the pistol through the open doorway.', failureMessage: 'Boone tackles you before you can reach the gun.' } },
      ],
    },
    violentSurvivalEnding: {
      id: 'violentSurvivalEnding', title: 'The Game Is Over',
      text: 'The pistol is out of reach. Boone is alive, but the table is overturned and two patrons are bruised in the rush to leave. The marshal takes charge at the door. You survived the intervention; the town will remember the noise more than the argument that caused it.', choices: [], ending: 'success',
    },
    exposureReward: {
      id: 'exposureReward', title: 'The Cards Tell Their Story', tone: 'warning',
      text: 'The matching half-moon nicks settle the argument. Mercer marked three aces and read them by touch; Ada had not been signaling him. Boone lowers his hand. Mabel thanks you for giving the table something it can see, then offers one useful object from the saloon’s lost-property drawer.',
      choices: [
        { id: 'acceptDealerKnife', label: 'Accept Mabel’s dealer’s card knife', hint: 'A compact, useful cutting edge; Mabel places it in your hand.', requirements: { notItems: ['dealerCardKnife'] }, effects: { gainItems: ['dealerCardKnife'] }, next: 'exposedEnding' },
        { id: 'acceptCardMirror', label: 'Accept Mabel’s folding card mirror', hint: 'She hands it over in its brass case for inspecting tight spaces.', requirements: { notItems: ['foldingCardMirror'] }, effects: { gainItems: ['foldingCardMirror'] }, next: 'exposedEnding' },
        { id: 'declineMabelGift', label: 'Thank her and leave without a gift', next: 'exposedEnding' },
      ],
    },
    exposedEnding: {
      id: 'exposedEnding', title: 'Dead Man’s Hand',
      text: 'The cheating is exposed without turning the table into a fight. Mercer gives the marked aces back and leaves under the marshal’s watch. Boone still owes money, but the accusation no longer decides who is believed. Mabel locks the deck away for the night.', choices: [], ending: 'success',
    },
    __death: { id: '__death', title: 'One Shot Too Close', text: 'Boone’s pistol fires before anyone can pull you clear. The marshal and Mabel get the other patrons out, but there is no time to save you.', choices: [], ending: 'death' },
  },
};
