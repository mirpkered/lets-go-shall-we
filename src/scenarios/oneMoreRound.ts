import type { Choice, Scenario, Scene } from '../types';

const SEARCH_GEAR = ['ratCatchersHook', 'minerHeadlamp'];
const TILL_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'compactStoveTool', 'brassBottleOpener'];
const SEPARATION_GEAR = ['heavyLeatherGloves', 'brassCandlestick', 'travelRope'];
const PURSE_KNOWLEDGE = 'The small coin purse is caught in the split bench seat; it was not taken from the room.';

function searchChoice(withGear: boolean, suffix = ''): Choice {
  const name = withGear ? `searchBenchWithGear${suffix}` : `searchBenchByHand${suffix}`;
  return {
    id: name,
    label: withGear ? 'Use your hook or headlamp to search' : 'Search beneath the bench by hand',
    hint: withGear ? 'The tool reaches the dark gap without forcing the bench.' : 'The split seat is hard to reach; rushing could draw the wrong attention.',
    requirements: withGear ? { anyItems: SEARCH_GEAR } : { notItems: SEARCH_GEAR },
    timeCost: withGear ? 3 : 7,
    chance: {
      probability: withGear ? 0.86 : 0.58,
      bonusItems: withGear ? SEARCH_GEAR : undefined,
      bonusFlags: ['noticedLooseBench'],
      bonusProbability: 0.1,
      successNext: 'purseFound',
      failureNext: 'searchMissed',
      successMessage: 'Something catches beneath the split seat. A careful pull brings the missing purse into view.',
      failureMessage: 'The bench shifts, but you cannot reach the gap. The scraping draws everyone’s attention.',
      successEffects: { setFlags: ['purseRecovered'], knowledge: [PURSE_KNOWLEDGE], historyFlags: ['exposed_tavern_truth'] },
      failureEffects: { setFlags: ['searchFailed'] },
    },
  };
}

function tillChoice(withTool: boolean): Choice {
  return {
    id: withTool ? 'inspectTillWithTool' : 'inspectTillByHand',
    label: withTool ? 'Check the till latch with a carried tool' : 'Examine the till latch carefully',
    hint: withTool ? 'A small tool lets you inspect the catch without forcing it.' : 'This takes longer and risks looking like an accusation.',
    requirements: withTool ? { anyItems: TILL_TOOLS } : { notItems: TILL_TOOLS },
    timeCost: withTool ? 2 : 6,
    chance: {
      probability: withTool ? 0.92 : 0.64,
      bonusItems: TILL_TOOLS,
      bonusProbability: 0.08,
      successNext: 'cashboxClue',
      failureNext: 'cashboxUnclear',
      successMessage: 'The latch has no fresh tool marks. The other coins remain in their tray.',
      failureMessage: 'Your angle is poor; the latch tells you nothing, and the keeper notices the scrutiny.',
      successEffects: { setFlags: ['tillInspected'], knowledge: ['The till latch has no fresh tool marks, and its other coins remain in place.'] },
      failureEffects: { setFlags: ['tillInspectionFailed'] },
    },
  };
}

function rewardChoices(ending: string): Choice[] {
  return [
    { id: `acceptBottleOpener${ending}`, label: 'Accept the brass bottle opener', requirements: { notItems: ['brassBottleOpener'] }, effects: { gainItems: ['brassBottleOpener'] }, next: ending },
    { id: `acceptCellarGloves${ending}`, label: 'Accept the heavy leather gloves', requirements: { notItems: ['heavyLeatherGloves'] }, effects: { gainItems: ['heavyLeatherGloves'] }, next: ending },
    { id: `declineTavernReward${ending}`, label: 'Thank them and leave without a reward', next: ending },
  ];
}

export const ONE_MORE_ROUND: Scenario = {
  id: 'one-more-round',
  title: 'One More Round',
  subtitle: 'A missing purse, an old debt, and one more chance to keep the room talking.',
  startScene: 'tavernArrival',
  timePhases: [
    { id: 'tense', label: 'Tense', atMinutes: 0 },
    { id: 'heated', label: 'Heated', atMinutes: 8 },
    { id: 'volatile', label: 'Volatile', atMinutes: 16 },
    { id: 'critical', label: 'Critical', atMinutes: 24 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 34 },
  ],
  scenes: Object.assign({
    tavernArrival: {
      id: 'tavernArrival', title: 'The Dusty Spur',
      text: 'The tavern is warm, busy, and loud enough to make a small argument seem smaller. At the counter, keeper Sella and carpenter Rafe are disputing a two-coin repair debt from last winter. A small purse sits near Sella’s register. Rafe says the debt is settled; Sella says it is not. Neither has raised a hand.',
      textVariants: [
        { requirements: { historyFlags: ['broke_up_tavern_fight'] }, text: 'The tavern is warm and loud, but Sella recognizes you as someone who once kept a room from turning violent. She and carpenter Rafe are disputing a two-coin repair debt from last winter. A small purse sits near the register; neither has raised a hand.' },
        { requirements: { historyFlags: ['escalated_tavern_dispute'] }, text: 'The tavern is warm and loud. Sella recognizes you from a past argument that ended badly; she watches your hands as she and carpenter Rafe dispute a two-coin repair debt from last winter. A small purse sits near the register. Neither has raised a hand yet.' },
        { requirements: { historyFlags: ['walked_away_from_tavern_dispute'] }, text: 'The tavern is warm and loud. Sella remembers you as someone who prefers to leave an argument alone. She and carpenter Rafe dispute a two-coin repair debt from last winter; a small purse sits near the register.' },
      ],
      choices: [
        { id: 'listenFromBar', label: 'Listen from the bar', timeCost: 2, next: 'heardArgument', effects: { setFlags: ['heardInitialDispute'] } },
        { id: 'askRafeAboutDebt', label: 'Ask Rafe for his side', timeCost: 3, next: 'rafeAccount' },
        { id: 'orderFirstRound', label: 'Buy one more round — 1 coin', hint: 'It may keep everyone seated for a moment.', requirements: { minMoney: 1 }, timeCost: 2, effects: { money: -1, setFlags: ['orderedOneMoreRound'], historyFlags: ['used_alcohol_to_delay_conflict'] }, next: 'roundPause' },
        { id: 'leaveAtArrival', label: 'Leave without getting involved', timeCost: 1, effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    heardArgument: {
      id: 'heardArgument', title: 'A Small Debt, A Sharp Voice', tone: 'warning',
      text: 'Sella says Rafe broke a window last winter and still owes two coins. Rafe says he paid what he owed and that Sella keeps adding old grievances to new bills. A patron nearby asks them to lower their voices. The dispute is still verbal.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'The voices are louder now. Sella says Rafe broke a window last winter and still owes two coins. Rafe says he paid. The bartender has moved the glass bottles out of reach; the dispute remains verbal, but the room is listening.' }],
      choices: [
        { id: 'askSellaAboutPurse', label: 'Ask Sella what is missing', timeCost: 3, next: 'sellaAccount' },
        { id: 'questionServerEarly', label: 'Ask the bartender what they saw', timeCost: 3, next: 'serverAccount' },
        { id: 'lookAtCounter', label: 'Look over the counter and seating', timeCost: 3, next: 'disputeEscalates', effects: { setFlags: ['noticedLooseBench'] } },
        { id: 'stepInBeforeAccusation', label: 'Ask them both to pause', timeCost: 2, next: 'intervention' },
      ],
    },
    rafeAccount: {
      id: 'rafeAccount', title: 'Rafe’s Side of It',
      text: 'Rafe says he did break Sella’s front window last winter, but he believes he paid the two-coin repair bill. He was near the counter to retrieve his coat, not to touch her purse. He is irritated, but his hands stay open.',
      textVariants: [{ requirements: { historyFlags: ['broke_up_tavern_fight'] }, text: 'Rafe hears that you have settled a tavern argument without throwing a punch before. He admits he broke Sella’s front window last winter, but believes he paid the two-coin repair bill. He was near the counter for his coat, not her purse.' }],
      choices: [
        { id: 'askRafeAboutOldDebt', label: 'Ask what happened with the old debt', timeCost: 2, effects: { setFlags: ['heardOldDebt'], knowledge: ['Rafe admits he broke Sella’s window last winter and says he paid the two-coin repair bill.'] }, next: 'disputeEscalates' },
        { id: 'askRafeWhereHeStood', label: 'Ask where he last saw the purse', timeCost: 3, effects: { setFlags: ['heardPurseTimeline'], knowledge: ['Rafe says Sella set the purse on the counter before the room crowded around the table.'] }, next: 'disputeEscalates' },
        { id: 'askServerForRafe', label: 'Ask the bartender to compare accounts', timeCost: 3, next: 'serverAccount' },
        { id: 'leaveAfterRafe', label: 'Leave them to it', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    sellaAccount: {
      id: 'sellaAccount', title: 'Sella’s Accusation', tone: 'warning',
      text: 'Sella says she had three silver in her purse for the morning’s deliveries. She saw Rafe leaning near the counter and is sure he took it. Her voice hardens when she mentions the broken window. She did not say she saw the purse in his hand.',
      choices: [
        { id: 'askSellaAboutDebt', label: 'Ask about the window debt', timeCost: 3, effects: { setFlags: ['heardOldDebt'], knowledge: ['Sella says Rafe broke her window last winter and still owes two coins; she did not see the purse in his hand.'] }, next: 'disputeEscalates' },
        { id: 'askSellaForWitness', label: 'Ask who else was near the counter', timeCost: 3, next: 'serverAccount' },
        { id: 'payRafeDebt', label: 'Pay Rafe’s disputed debt — 2 coins', hint: 'This may quiet the room without proving what happened to the purse.', requirements: { minMoney: 2 }, timeCost: 1, effects: { money: -2, setFlags: ['paidRepairDebt'], historyFlags: ['paid_strangers_debt'] }, next: 'paidDebtEnding' },
        { id: 'stepBetweenSellaAndRafe', label: 'Ask them to stop and breathe', timeCost: 2, next: 'intervention' },
      ],
    },
    serverAccount: {
      id: 'serverAccount', title: 'The Bartender’s Account',
      text: 'The bartender heard a stool scrape and a coin-like clink when Pell, the tipsy singer, stumbled back from the table. They did not see anyone pick anything up. Pell has been drinking, but he is still sitting quietly. The sound could have come from a dropped coin or a shifting chair.',
      choices: [
        { id: 'searchAfterServer', label: 'Check the split bench seat', timeCost: 2, next: 'benchSearch', effects: { setFlags: ['noticedLooseBench'], knowledge: ['The bartender heard a coin-like clink when Pell bumped a stool near the split bench.'] } },
        { id: 'waitForMoreConversation', label: 'Wait and hear the argument out', hint: 'Waiting may clarify their accounts, but the room is getting less patient.', timeCost: 6, next: 'disputeEscalates', effects: { setFlags: ['heardWitnessAccount'], knowledge: ['The bartender heard a clink when Pell bumped the stool; no one saw who moved the purse.'] } },
        { id: 'bringServerAccountToGroup', label: 'Tell the others what the bartender heard', timeCost: 2, effects: { setFlags: ['heardWitnessAccount'] }, next: 'disputeEscalates' },
        { id: 'calmAfterServer', label: 'Ask them to give the bartender room', timeCost: 2, next: 'intervention' },
      ],
    },
    roundPause: {
      id: 'roundPause', title: 'The Glasses Arrive',
      text: 'The bartender brings the round you paid for. Everyone sits long enough to take a drink. Pell shifts his stool, and something gives a small clink against the floorboards. The pause creates a chance to watch, not an answer.',
      textVariants: [{ requirements: { historyFlags: ['broke_up_tavern_fight'] }, text: 'The bartender sets down the round you paid for. Your calm tone keeps everyone seated for the moment. Pell shifts his stool; a small clink sounds near the benches, but no one seems sure what made it.' }],
      choices: [
        { id: 'watchTheStool', label: 'Watch Pell’s stool and the floor', timeCost: 2, effects: { setFlags: ['noticedLooseBench'], knowledge: ['Pell bumped the split bench while shifting his stool; a small clink came from below the table.'] }, next: 'disputeEscalates' },
        { id: 'askPellDuringPause', label: 'Ask Pell what he heard', timeCost: 3, next: 'pellAccount' },
        { id: 'usePauseToCalm', label: 'Ask Sella and Rafe to stay seated', timeCost: 2, next: 'intervention' },
        { id: 'leaveAfterRound', label: 'Leave while the room is quiet', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    pellAccount: {
      id: 'pellAccount', title: 'Pell Remembers a Bump',
      text: 'Pell insists he never touched the purse. He does remember knocking a stool sideways when he reached for his coat; he heard a clink but thought it was a glass. His breath smells of cider, and he cannot be certain where the sound came from.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'Pell struggles to focus. He remembers knocking a stool sideways and hearing a clink, but each time he tells it the details change. Sella is standing now, and a patron has moved toward the door.' }],
      choices: [
        { id: 'searchAfterPell', label: 'Check the bench beside Pell', timeCost: 2, effects: { setFlags: ['noticedLooseBench'], knowledge: ['Pell admits he bumped the stool beside the split bench and heard a clink.'] }, next: 'benchSearch' },
        { id: 'tellPellToStaySeated', label: 'Ask Pell to stay seated', timeCost: 2, next: 'intervention' },
        { id: 'letPellSpeakToGroup', label: 'Bring Pell’s account to Rafe and Sella', timeCost: 2, effects: { setFlags: ['heardPellAccount'] }, next: 'confrontation' },
        { id: 'leavePellToIt', label: 'Leave before tempers rise further', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    disputeEscalates: {
      id: 'disputeEscalates', title: 'The Purse Is Missing', tone: 'warning',
      text: 'Sella checks the counter and finds her three-silver purse missing. She accuses Rafe, who says he only reached for his coat. Pell was near the table; the bartender was working the register. The old dispute over Rafe’s broken-window bill makes Sella quicker to suspect him.',
      textVariants: [
        { requirements: { minElapsedMinutes: 24 }, text: 'The purse is still missing. Chairs scrape back and two patrons edge toward the door. Sella points at Rafe; Pell is on his feet, unsteady, and the bartender has moved the bottles away. No one has shown a weapon, but there is little time left for a quiet explanation.' },
        { requirements: { minElapsedMinutes: 16 }, text: 'The purse is still missing. Sella’s voice has risen; Rafe stands with his coat in one hand, while Pell sways beside the table. One patron slips out, and the bartender puts the bottles away.' },
        { requirements: { flags: ['heardWitnessAccount'] }, text: 'The purse is still missing. The bartender’s account gives Pell a reason to be near the bench, but no one saw him take anything. Sella points at Rafe, who says he only reached for his coat.' },
      ],
      choices: [
        { id: 'searchFromDispute', label: 'Search beneath the split bench', timeCost: 1, next: 'benchSearch' },
        { id: 'inspectTillFromDispute', label: 'Check the register for signs of entry', timeCost: 1, next: 'cashboxInspection' },
        { id: 'orderLateRound', label: 'Order one more round — 1 coin', hint: 'At this hour another drink may make things worse.', requirements: { minElapsedMinutes: 12, minMoney: 1, notFlags: ['orderedOneMoreRound'] }, timeCost: 2, effects: { money: -1, setFlags: ['orderedOneMoreRound', 'lateRoundMadeThingsWorse'], historyFlags: ['used_alcohol_to_delay_conflict'] }, next: 'lateRoundHazard' },
        { id: 'goToConfrontation', label: 'Make your judgment now', timeCost: 2, next: 'confrontation' },
      ],
    },
    lateRoundHazard: {
      id: 'lateRoundHazard', title: 'One More Round', tone: 'danger',
      text: 'The drinks arrive, but the pause does not. Pell reaches across the table, knocks a stool sideways, and the argument gets louder. The bartender moves to clear the glassware. Another round has bought time, but alcohol is making the room less predictable.',
      choices: [
        { id: 'searchAfterLateRound', label: 'Search the bench before anyone moves again', timeCost: 1, next: 'benchSearch' },
        { id: 'stepInAfterLateRound', label: 'Step between them now', timeCost: 1, next: 'threatMoment', effects: { setFlags: ['lateRoundEscalated'] } },
        { id: 'accuseAfterLateRound', label: 'Accuse someone before they leave', timeCost: 1, next: 'confrontation' },
        { id: 'leaveAfterLateRound', label: 'Get clear of the room', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    benchSearch: {
      id: 'benchSearch', title: 'The Split Seat', tone: 'warning',
      text: 'The bench has a narrow split along one board. You can reach into it, but the gap is dark and the table is still crowded. Pell’s stool scrapes nearby; there is no certainty that anything fell there.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'The room grows louder as you crouch by the split bench. Pell’s stool is still at an angle, and Sella is shouting across the table. A quick search may find something, but reaching blindly while people move is risky.' }],
      choices: [
        { id: 'searchWithHookOrLamp', label: 'Use your hook or headlamp to search', hint: 'A tool reaches the dark gap quickly and safely.', requirements: { anyItems: SEARCH_GEAR }, timeCost: 3, chance: { probability: 0.86, bonusItems: SEARCH_GEAR, bonusFlags: ['noticedLooseBench'], bonusProbability: 0.1, successNext: 'purseFound', failureNext: 'searchMissed', successMessage: 'A soft leather edge catches beneath the bench. You draw out Sella’s purse.', failureMessage: 'The tool catches on the board; the bench shifts and everyone turns toward you.', successEffects: { setFlags: ['purseRecovered'], knowledge: [PURSE_KNOWLEDGE], historyFlags: ['exposed_tavern_truth'] }, failureEffects: { setFlags: ['searchFailed'] } } },
        { id: 'searchByHand', label: 'Reach into the split seat by hand', hint: 'The gap is tight and people are moving around you.', requirements: { notItems: SEARCH_GEAR }, timeCost: 7, chance: { probability: 0.58, bonusFlags: ['noticedLooseBench'], bonusProbability: 0.18, successNext: 'purseFound', failureNext: 'searchMissed', successMessage: 'Your fingers find soft leather wedged beneath the seat. It is Sella’s purse.', failureMessage: 'The board pinches your fingers and the crowd’s movement makes you stop.', successEffects: { setFlags: ['purseRecovered'], knowledge: [PURSE_KNOWLEDGE], historyFlags: ['exposed_tavern_truth'] }, failureEffects: { health: -1, setFlags: ['searchFailed'] } } },
        { id: 'stopSearchingAndTalk', label: 'Stand up and ask the room to listen', timeCost: 1, next: 'intervention' },
        { id: 'leaveBenchSearch', label: 'Leave before the argument turns physical', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    cashboxInspection: {
      id: 'cashboxInspection', title: 'The Register Latch',
      text: 'The till is closed. Sella has the key, and the bartender has been close enough to reach the counter. Nothing about the locked latch alone proves who touched the missing purse.',
      choices: [tillChoice(true), tillChoice(false), { id: 'accuseOwnerFromTill', label: 'Accuse Sella of moving the purse', timeCost: 2, effects: { setFlags: ['accusedSella'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' }, { id: 'leaveTill', label: 'Step away from the register', next: 'intervention' }],
    },
    cashboxClue: {
      id: 'cashboxClue', title: 'No Forced Latch',
      text: 'The latch shows no fresh marks and the other coins remain in their tray. That weakens the idea that someone forced the till, but it does not prove who moved the purse or why.',
      choices: [
        { id: 'searchAfterLatch', label: 'Check the split bench seat', timeCost: 2, next: 'benchSearch', effects: { setFlags: ['noticedLooseBench'] } },
        { id: 'confrontAfterLatch', label: 'Ask the room to account for itself', timeCost: 2, next: 'confrontation' },
        { id: 'calmAfterLatch', label: 'Set the accusation aside for a moment', next: 'intervention' },
        { id: 'leaveAfterLatch', label: 'Leave the purse and debt unresolved', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    cashboxUnclear: {
      id: 'cashboxUnclear', title: 'Nothing Certain in the Latch', tone: 'warning',
      text: 'You cannot read anything useful in the latch. Sella sees you examining it and draws the purse accusation into the argument. Suspicion has made the room less patient, not more informed.',
      choices: [
        { id: 'searchAfterUnclearLatch', label: 'Search the split bench instead', timeCost: 2, next: 'benchSearch', effects: { setFlags: ['noticedLooseBench'] } },
        { id: 'confrontAfterUnclearLatch', label: 'Make a judgment now', timeCost: 2, next: 'confrontation' },
        { id: 'interveneAfterUnclearLatch', label: 'Ask everyone to step back', next: 'intervention' },
        { id: 'leaveUnclearLatch', label: 'Leave before tempers rise further', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    confrontation: {
      id: 'confrontation', title: 'Three Plausible Stories', tone: 'warning',
      text: 'Rafe was near the counter and owes an old debt. Sella controls the register and purse. Pell stumbled beside the table and cannot recall every movement. Each story fits what you have heard; none is proof. You can name someone, or try to stop the room without deciding who is right.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'A chair scrapes back. Rafe is holding his coat, Pell sways beside the table, and Sella’s hand is clenched around the register key. You still have several plausible stories, but the room is close to choosing one for you.' }],
      choices: [
        { id: 'accuseRafe', label: 'Accuse Rafe of taking the purse', timeCost: 2, effects: { setFlags: ['accusedRafe'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'accuseSella', label: 'Accuse Sella of hiding the purse', timeCost: 2, effects: { setFlags: ['accusedSella'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'accusePell', label: 'Accuse Pell of taking it while drunk', timeCost: 2, effects: { setFlags: ['accusedPell'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'separateWithoutAccusing', label: 'Ask everyone to step apart', timeCost: 2, effects: { historyFlags: ['protected_accused_patron'] }, next: 'intervention' },
      ],
    },
    accusationFallout: {
      id: 'accusationFallout', title: 'The Room Takes Sides', tone: 'danger',
      text: 'Your accusation lands harder than the evidence behind it. The person you named turns toward the door; Pell stands, and the bartender starts clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.',
      textVariants: [
        { requirements: { flags: ['accusedRafe'] }, text: 'Rafe says you have repeated Sella’s suspicion as fact. He turns toward the door; Pell stands, and the bartender starts clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
        { requirements: { flags: ['accusedSella'] }, text: 'Sella says you have mistaken a locked register for proof. The room goes quiet; Rafe turns toward the door and Pell stands. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
        { requirements: { flags: ['accusedPell'] }, text: 'Pell looks frightened and insulted. Sella is shouting again; the bartender begins clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
      ],
      choices: [
        { id: 'doubleDownOnAccusation', label: 'Insist you are right', hint: 'You have no proof; this may turn the room against the person you named.', timeCost: 2, effects: { setFlags: ['escalatedTavernDispute'], historyFlags: ['escalated_tavern_dispute'] }, next: 'threatMoment' },
        { id: 'retractAccusation', label: 'Admit you may have judged too quickly', timeCost: 2, effects: { setFlags: ['retractedAccusation'], historyFlags: ['protected_accused_patron'] }, next: 'intervention' },
        { id: 'leaveAfterAccusing', label: 'Leave the accusation unresolved', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'falseAccusationEnding' },
      ],
    },
    intervention: {
      id: 'intervention', title: 'Keep the Room Talking', tone: 'warning',
      text: 'The bartender has moved the bottles. Rafe’s jaw is tight, and Pell is unsteady, but neither has drawn a weapon. A calm word may work; putting hands between angry people could get you hurt. Leaving is still an option.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'The stools have shifted and people are making room around Pell. His hands are visible, but his temper is not steady. The bartender has cleared the bottles. A calm word may still work; touching either person carries real risk.' }],
      choices: [
        { id: 'talkThemDown', label: 'Speak calmly and let each person finish', timeCost: 3, chance: { probability: 0.66, bonusFlags: ['heardOldDebt', 'heardWitnessAccount', 'retractedAccusation'], bonusProbability: 0.18, successNext: 'quietRewards', failureNext: 'threatMoment', successMessage: 'The pause gives Sella and Rafe room to hear each other.', failureMessage: 'The voices rise over yours, and Pell knocks his stool back.', successEffects: { setFlags: ['fightPrevented'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { setFlags: ['escalatedTavernDispute'] } } },
        { id: 'separateWithGear', label: 'Use your gear to create space', hint: 'Gloves, a heavy candlestick, or a rope give you a safer way to separate them.', requirements: { anyItems: SEPARATION_GEAR }, timeCost: 2, chance: { probability: 0.7, bonusItems: SEPARATION_GEAR, bonusProbability: 0.16, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You use the gear to make space without striking anyone.', failureMessage: 'Someone shoves back; you are hit as the table tips.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -3, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'callTheConstable', label: 'Send for the constable', hint: 'It will take time for help to arrive.', timeCost: 9, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'walkAwayFromIntervention', label: 'Step out before it turns physical', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    threatMoment: {
      id: 'threatMoment', title: 'Glass on the Floor', tone: 'danger',
      text: 'A bottle breaks against the table. Pell holds the jagged neck while Rafe backs toward the door; the sharp edge is visible, and the bartender is calling for space. You can leave, call for help, or intervene at real risk of injury.',
      choices: [
        { id: 'separateAtThreatWithGear', label: 'Use your gear to put space between them', hint: 'A rope, gloves, or heavy object may help; a failure could seriously injure you.', requirements: { anyItems: SEPARATION_GEAR }, timeCost: 1, chance: { probability: 0.62, bonusItems: SEPARATION_GEAR, bonusProbability: 0.2, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You lever the table aside and Pell drops the glass.', failureMessage: 'The broken bottle catches you as the table shifts.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -6, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'stepBetweenBarehanded', label: 'Step between them with empty hands', hint: 'The broken glass is clearly dangerous; a bad hit could be severe.', requirements: { notItems: SEPARATION_GEAR }, timeCost: 1, chance: { probability: 0.48, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You catch Pell’s wrist and push the bottle away.', failureMessage: 'The broken glass cuts deep as you are knocked against the table.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -6, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'callHelpAtThreat', label: 'Call for the constable now', timeCost: 8, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'retreatFromGlass', label: 'Get clear of the broken glass', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    fightWorsens: {
      id: 'fightWorsens', title: 'A Bad Minute', tone: 'danger',
      text: 'The table overturns and the broken glass scatters. Your injury is real, and neither person is listening. The danger was visible before you stepped in; staying to fight again could make it worse.',
      choices: [
        { id: 'callAfterFight', label: 'Call for help and protect the doorway', timeCost: 3, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'helpRafeEscape', label: 'Help Rafe get out of the room', timeCost: 1, next: 'fightStoppedAftercare', effects: { setFlags: ['fightStopped'], historyFlags: ['protected_accused_patron', 'broke_up_tavern_fight'] } },
        { id: 'withdrawFromFight', label: 'Withdraw and let the constable handle it', effects: { historyFlags: ['escalated_tavern_dispute'] }, next: 'violentEnding' },
      ],
    },
    fightStoppedAftercare: {
      id: 'fightStoppedAftercare', title: 'The Room Settles', tone: 'warning',
      text: 'The broken glass is swept aside and the people involved have room to breathe. No one claims the argument is solved, but the fight has stopped. Sella offers to replace a useful tool if you help close the tavern for the night.',
      choices: [
        { id: 'helpCleanAfterFight', label: 'Help clear the glass and stay for questions', timeCost: 5, next: 'fightRewards', effects: { historyFlags: ['broke_up_tavern_fight'] } },
        { id: 'leaveAfterStoppingFight', label: 'Leave now that no one is fighting', effects: { historyFlags: ['broke_up_tavern_fight'] }, next: 'fightStoppedEnding' },
      ],
    },
    searchMissed: {
      id: 'searchMissed', title: 'The Search Draws a Crowd', tone: 'danger',
      text: 'The bench will not shift cleanly. The delay and scrape have drawn a crowd, and Sella thinks you are searching for something to accuse her with. You have learned nothing certain; people are beginning to stand.',
      choices: [
        { id: 'confrontAfterSearchMiss', label: 'Ask the room one last question', timeCost: 1, next: 'confrontation' },
        { id: 'calmAfterSearchMiss', label: 'Step back and lower your voice', next: 'intervention' },
        { id: 'callAfterSearchMiss', label: 'Send for the constable', timeCost: 8, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'leaveAfterSearchMiss', label: 'Leave before the room closes in', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    purseFound: {
      id: 'purseFound', title: 'Three Silver in the Split Seat',
      text: 'The purse is wedged inside the bench where Pell’s stool struck it. Sella recognizes the leather seam and counts three silver inside. No one took it from the counter. Rafe did break the window last winter and still owes her two coins, but that is a different matter.',
      choices: [
        { id: 'returnPurseNoDebt', label: 'Return it and leave the old debt for later', timeCost: 1, effects: { setFlags: ['purseReturned', 'truthResolved'], historyFlags: ['exposed_tavern_truth', 'protected_accused_patron'] }, next: 'truthRewards' },
        { id: 'payOldDebtAfterTruth', label: 'Pay Rafe’s old debt — 2 coins', hint: 'The purse is returned; this settles a separate winter repair debt.', requirements: { minMoney: 2 }, timeCost: 2, effects: { money: -2, setFlags: ['purseReturned', 'truthResolved', 'paidRepairDebt'], historyFlags: ['exposed_tavern_truth', 'paid_strangers_debt', 'protected_accused_patron'] }, next: 'truthRewards' },
        { id: 'tellTruthAndLeave', label: 'Return the purse and leave them to talk', effects: { setFlags: ['purseReturned', 'truthResolved'], historyFlags: ['exposed_tavern_truth'] }, next: 'truthEnding' },
      ],
    },
    }, {
    confrontation: {
      id: 'confrontation', title: 'Who Do You Believe?', tone: 'warning',
      text: 'Rafe was near the counter and owes an old debt. Sella had access to the register. Pell stumbled beside the table and cannot recall every movement. Each account has some support, but none proves theft. Whoever you name may not get another chance to explain.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'A patron is edging toward the door. Sella keeps one hand near the register key; Pell sways by the table and Rafe grips his coat. You have heard several accounts, but the room is running out of patience.' }],
      choices: [
        { id: 'accuseRafe', label: 'Accuse Rafe of taking the purse', timeCost: 2, effects: { setFlags: ['accusedRafe'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'accuseSella', label: 'Accuse Sella of hiding the purse', timeCost: 2, effects: { setFlags: ['accusedSella'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'accusePell', label: 'Accuse Pell of taking it while drunk', timeCost: 2, effects: { setFlags: ['accusedPell'], historyFlags: ['falsely_accused_patron'] }, next: 'accusationFallout' },
        { id: 'separateWithoutAccusing', label: 'Ask everyone to step apart', timeCost: 2, effects: { historyFlags: ['protected_accused_patron'] }, next: 'intervention' },
      ],
    },
    accusationFallout: {
      id: 'accusationFallout', title: 'The Room Takes Sides', tone: 'danger',
      text: 'Your accusation lands harder than the evidence behind it. The person you named turns toward the door; Pell stands, and the bartender starts clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.',
      textVariants: [
        { requirements: { flags: ['accusedRafe'] }, text: 'Rafe says you have repeated Sella’s suspicion as fact. He turns toward the door; Pell stands, and the bartender starts clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
        { requirements: { flags: ['accusedSella'] }, text: 'Sella says you have mistaken a locked register for proof. The room goes quiet; Rafe turns toward the door and Pell stands. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
        { requirements: { flags: ['accusedPell'] }, text: 'Pell looks frightened and insulted. Sella is shouting again; the bartender begins clearing glasses. You can admit you may be wrong, double down, or leave with the accusation hanging.' },
      ],
      choices: [
        { id: 'doubleDownOnAccusation', label: 'Insist you are right', hint: 'You have no proof; this may turn the room against the person you named.', timeCost: 2, effects: { setFlags: ['escalatedTavernDispute'], historyFlags: ['escalated_tavern_dispute'] }, next: 'threatMoment' },
        { id: 'retractAccusation', label: 'Admit you may have judged too quickly', timeCost: 2, effects: { setFlags: ['retractedAccusation'], historyFlags: ['protected_accused_patron'] }, next: 'intervention' },
        { id: 'leaveAfterAccusing', label: 'Leave the accusation unresolved', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'falseAccusationEnding' },
      ],
    },
    intervention: {
      id: 'intervention', title: 'Keep the Room Talking', tone: 'warning',
      text: 'The bartender has moved the bottles. Rafe’s jaw is tight, and Pell is unsteady, but neither has drawn a weapon. A calm word may work; putting hands between angry people could get you hurt. Leaving is still an option.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'The stools have shifted and people are making room around Pell. His hands are visible, but his temper is not steady. The bartender has cleared the bottles. A calm word may still work; touching either person carries real risk.' }],
      choices: [
        { id: 'talkThemDown', label: 'Speak calmly and let each person finish', timeCost: 3, chance: { probability: 0.66, bonusFlags: ['heardOldDebt', 'heardWitnessAccount', 'retractedAccusation'], bonusProbability: 0.18, successNext: 'quietRewards', failureNext: 'threatMoment', successMessage: 'The pause gives Sella and Rafe room to hear each other.', failureMessage: 'The voices rise over yours, and Pell knocks his stool back.', successEffects: { setFlags: ['fightPrevented'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { setFlags: ['escalatedTavernDispute'] } } },
        { id: 'separateWithGear', label: 'Use your gear to create space', hint: 'Gloves, a heavy candlestick, or a rope give you a safer way to separate them.', requirements: { anyItems: SEPARATION_GEAR }, timeCost: 2, chance: { probability: 0.7, bonusItems: SEPARATION_GEAR, bonusProbability: 0.16, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You use the gear to make space without striking anyone.', failureMessage: 'Someone shoves back; you are hit as the table tips.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -3, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'callTheConstable', label: 'Send for the constable', hint: 'It will take time for help to arrive.', timeCost: 9, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'walkAwayFromIntervention', label: 'Step out before it turns physical', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    threatMoment: {
      id: 'threatMoment', title: 'Glass on the Floor', tone: 'danger',
      text: 'A bottle breaks against the table. Pell holds the jagged neck while Rafe backs toward the door; the sharp edge is visible, and the bartender is calling for space. You can leave, call for help, or intervene at real risk of injury.',
      choices: [
        { id: 'separateAtThreatWithGear', label: 'Use your gear to put space between them', hint: 'A rope, gloves, or heavy object may help; a failure could seriously injure you.', requirements: { anyItems: SEPARATION_GEAR }, timeCost: 1, chance: { probability: 0.62, bonusItems: SEPARATION_GEAR, bonusProbability: 0.2, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You lever the table aside and Pell drops the glass.', failureMessage: 'The broken bottle catches you as the table shifts.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -6, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'stepBetweenBarehanded', label: 'Step between them with empty hands', hint: 'The broken glass is clearly dangerous; a bad hit could be severe.', requirements: { notItems: SEPARATION_GEAR }, timeCost: 1, chance: { probability: 0.48, successNext: 'fightStoppedAftercare', failureNext: 'fightWorsens', successMessage: 'You catch Pell’s wrist and push the bottle away.', failureMessage: 'The broken glass cuts deep as you are knocked against the table.', successEffects: { setFlags: ['fightStopped'], historyFlags: ['broke_up_tavern_fight'] }, failureEffects: { health: -6, setFlags: ['escalatedTavernDispute'] } } },
        { id: 'callHelpAtThreat', label: 'Call for the constable now', timeCost: 8, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'retreatFromGlass', label: 'Get clear of the broken glass', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    fightWorsens: {
      id: 'fightWorsens', title: 'A Bad Minute', tone: 'danger',
      text: 'The table overturns and the broken glass scatters. Your injury is real, and neither person is listening. The danger was visible before you stepped in; staying to fight again could make it worse.',
      choices: [
        { id: 'callAfterFight', label: 'Call for help and protect the doorway', timeCost: 3, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'helpRafeEscape', label: 'Help Rafe get out of the room', timeCost: 1, next: 'fightStoppedAftercare', effects: { setFlags: ['fightStopped'], historyFlags: ['protected_accused_patron', 'broke_up_tavern_fight'] } },
        { id: 'withdrawFromFight', label: 'Withdraw and let the constable handle it', effects: { historyFlags: ['escalated_tavern_dispute'] }, next: 'violentEnding' },
      ],
    },
    fightStoppedAftercare: {
      id: 'fightStoppedAftercare', title: 'The Room Settles', tone: 'warning',
      text: 'The broken glass is swept aside and the people involved have room to breathe. No one claims the argument is solved, but the fight has stopped. Sella offers to replace a useful tool if you help close the tavern for the night.',
      choices: [
        { id: 'helpCleanAfterFight', label: 'Help clear the glass and stay for questions', timeCost: 5, next: 'fightRewards', effects: { historyFlags: ['broke_up_tavern_fight'] } },
        { id: 'leaveAfterStoppingFight', label: 'Leave now that no one is fighting', effects: { historyFlags: ['broke_up_tavern_fight'] }, next: 'fightStoppedEnding' },
      ],
    },
    cashboxUnclear: {
      id: 'cashboxUnclear', title: 'Nothing Certain in the Latch', tone: 'warning',
      text: 'You cannot read anything useful in the latch. Sella sees you examining it and draws the purse accusation into the argument. Suspicion has made the room less patient, not more informed.',
      choices: [
        { id: 'searchAfterUnclearLatch', label: 'Search the split bench instead', timeCost: 2, next: 'benchSearch', effects: { setFlags: ['noticedLooseBench'] } },
        { id: 'confrontAfterUnclearLatch', label: 'Make a judgment now', timeCost: 2, next: 'confrontation' },
        { id: 'interveneAfterUnclearLatch', label: 'Ask everyone to step back', next: 'intervention' },
        { id: 'leaveUnclearLatch', label: 'Leave before tempers rise further', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    cashboxClue: {
      id: 'cashboxClue', title: 'No Forced Latch',
      text: 'The latch shows no fresh marks and the other coins remain in their tray. That weakens the idea that someone forced the till, but it does not prove who moved the purse or why.',
      choices: [
        { id: 'searchAfterLatch', label: 'Check the split bench seat', timeCost: 2, next: 'benchSearch', effects: { setFlags: ['noticedLooseBench'] } },
        { id: 'confrontAfterLatch', label: 'Ask the room to account for itself', timeCost: 2, next: 'confrontation' },
        { id: 'calmAfterLatch', label: 'Set the accusation aside for a moment', next: 'intervention' },
        { id: 'leaveAfterLatch', label: 'Leave the purse and debt unresolved', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    benchSearch: {
      id: 'benchSearch', title: 'The Split Seat', tone: 'warning',
      text: 'The bench has a narrow split along one board. You can reach into it, but the gap is dark and the table is still crowded. Pell’s stool scrapes nearby; there is no certainty that anything fell there.',
      textVariants: [{ requirements: { minElapsedMinutes: 16 }, text: 'The room grows louder as you crouch by the split bench. Pell’s stool is still at an angle, and Sella is shouting across the table. A quick search may find something, but reaching blindly while people move is risky.' }],
      choices: [
        searchChoice(true),
        searchChoice(false),
        { id: 'stopSearchingAndTalk', label: 'Stand up and ask the room to listen', timeCost: 1, next: 'intervention' },
        { id: 'leaveBenchSearch', label: 'Leave before the argument turns physical', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    searchMissed: {
      id: 'searchMissed', title: 'The Search Draws a Crowd', tone: 'danger',
      text: 'The bench will not shift cleanly. The delay and scrape have drawn a crowd, and Sella thinks you are searching for something to accuse her with. You have learned nothing certain; people are beginning to stand.',
      choices: [
        { id: 'confrontAfterSearchMiss', label: 'Ask the room one last question', timeCost: 1, next: 'confrontation' },
        { id: 'calmAfterSearchMiss', label: 'Step back and lower your voice', next: 'intervention' },
        { id: 'callAfterSearchMiss', label: 'Send for the constable', timeCost: 8, next: 'constableArrives', effects: { historyFlags: ['called_help_at_tavern'] } },
        { id: 'leaveAfterSearchMiss', label: 'Leave before the room closes in', effects: { historyFlags: ['walked_away_from_tavern_dispute'] }, next: 'walkAwayEnding' },
      ],
    },
    purseFound: {
      id: 'purseFound', title: 'Three Silver in the Split Seat',
      text: 'The purse is wedged inside the bench where Pell’s stool struck it. Sella recognizes the leather seam and counts three silver inside. No one took it from the counter. Rafe did break the window last winter and still owes her two coins, but that is a different matter.',
      choices: [
        { id: 'returnPurseNoDebt', label: 'Return it and leave the old debt for later', timeCost: 1, effects: { setFlags: ['purseReturned', 'truthResolved'], historyFlags: ['exposed_tavern_truth', 'protected_accused_patron'] }, next: 'truthRewards' },
        { id: 'payOldDebtAfterTruth', label: 'Pay Rafe’s old debt — 2 coins', hint: 'The purse is returned; this settles a separate winter repair debt.', requirements: { minMoney: 2 }, timeCost: 2, effects: { money: -2, setFlags: ['purseReturned', 'truthResolved', 'paidRepairDebt'], historyFlags: ['exposed_tavern_truth', 'paid_strangers_debt', 'protected_accused_patron'] }, next: 'truthRewards' },
        { id: 'tellTruthAndLeave', label: 'Return the purse and leave them to talk', effects: { setFlags: ['purseReturned', 'truthResolved'], historyFlags: ['exposed_tavern_truth'] }, next: 'truthEnding' },
      ],
    },
    }, {
    quietRewards: {
      id: 'quietRewards', title: 'The Voices Come Down',
      text: 'Sella sets the purse aside, and Rafe agrees to discuss the old repair debt in daylight. You have stopped the argument without deciding what happened to the money. The keeper offers a small token of thanks.',
      choices: rewardChoices('peacefulEnding'),
    },
    truthRewards: {
      id: 'truthRewards', title: 'A Better Account',
      text: 'With the purse returned, Sella admits she was too quick to treat an old debt as proof. Rafe confirms the repair bill can be settled tomorrow. She offers you something useful for taking the time to find out.',
      choices: rewardChoices('truthEnding'),
    },
    fightRewards: {
      id: 'fightRewards', title: 'After the Shouting',
      text: 'The constable takes statements while you help close the room. The argument is not erased, but no one is left alone with broken glass. Sella offers a practical thank-you for stopping the fight.',
      choices: rewardChoices('fightStoppedEnding'),
    },
    constableArrives: {
      id: 'constableArrives', title: 'Help at the Door', tone: 'warning',
      text: 'The constable arrives after the walk over. The room has had time to change: some patrons have gone, and no account is complete. The constable can separate everyone, but cannot turn a suspicion into proof.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The constable arrives after the shouting and broken glass. Pell is seated, Rafe is outside, and Sella is shaken. The room is safe now, but the cost of waiting is visible in the overturned table.' }],
      choices: [
        { id: 'constableSearchesPurse', label: 'Show the recovered purse and explain', requirements: { flags: ['purseRecovered'] }, effects: { setFlags: ['truthResolved'], historyFlags: ['exposed_tavern_truth'] }, next: 'truthRewards' },
        { id: 'acceptConstableSeparation', label: 'Ask the constable to separate them for the night', effects: { historyFlags: ['called_help_at_tavern', 'asked_constable_to_separate_guests'] }, next: 'authorityEnding' },
        { id: 'makeStatementWithoutEvidence', label: 'Give your account and leave the judgment to them', effects: { historyFlags: ['called_help_at_tavern', 'gave_account_without_requesting_separation'] }, next: 'authorityEnding' },
      ],
    },
    paidDebtEnding: {
      id: 'paidDebtEnding', title: 'The Price of Quiet', ending: 'success',
      text: 'Sella accepts the two coins for the old repair debt and lowers her voice. Rafe leaves without a fight. The purse is still missing, and no one knows whether it was dropped, moved, or taken. You bought peace for tonight, not certainty.',
      choices: [],
    },
    peacefulEnding: {
      id: 'peacefulEnding', title: 'The Room Stays Whole', ending: 'success',
      text: 'The voices settle and the chairs go back under the tables. Sella and Rafe agree to discuss the repair debt tomorrow. The purse remains unaccounted for, but no one is forced into a judgment the room cannot support.',
      textVariants: [{ requirements: { flags: ['fightPrevented'] }, text: 'Your calm words give everyone a moment to choose something other than anger. The voices settle and the chairs go back under the tables. The purse remains unaccounted for, but the room stays whole.' }],
      choices: [],
    },
    truthEnding: {
      id: 'truthEnding', title: 'Found, Not Stolen', ending: 'success',
      text: 'Sella has her three silver back. The missing purse was caught in the bench, not taken by Rafe or anyone else. The two-coin repair debt remains a real disagreement, but it no longer stands in for proof.',
      textVariants: [{ requirements: { flags: ['paidRepairDebt'] }, text: 'Sella has her three silver back, and you settled Rafe’s separate two-coin repair debt. The missing purse was caught in the bench; the accusation has ended without pretending the old grievance never happened.' }],
      choices: [],
    },
    fightStoppedEnding: {
      id: 'fightStoppedEnding', title: 'The Fight Stops Here', ending: 'success',
      text: 'The fight is over, though the table and several tempers are damaged. Everyone is accounted for. The missing purse remains an open question, but no one is left holding broken glass.',
      choices: [],
    },
    authorityEnding: {
      id: 'authorityEnding', title: 'Statements in the Morning', ending: 'success',
      text: 'The constable keeps the room separated until it is safe to close. The old debt and missing purse will be sorted in daylight. There is no arrest tonight: no one has produced proof of theft.',
      textVariants: [
        { requirements: { historyFlags: ['asked_constable_to_separate_guests'] }, text: 'You ask the constable to keep Sella and Rafe apart for the night. They agree, and the room closes without another confrontation. The old debt and missing purse wait for daylight; no one has proved theft.' },
        { requirements: { historyFlags: ['gave_account_without_requesting_separation'] }, text: 'You give the constable your account and leave the judgment to them. They record what you saw, but make no arrest on an incomplete account. The old debt and missing purse wait for daylight.' },
      ],
      choices: [],
    },
    falseAccusationEnding: {
      id: 'falseAccusationEnding', title: 'A Name Said Too Soon', ending: 'success',
      text: 'The person you accused leaves angry and unheard. Sella’s purse is still missing, and the room remembers that you named someone before you had proof. The argument ends, but not cleanly.',
      choices: [],
    },
    violentEnding: {
      id: 'violentEnding', title: 'The Room Afterward', ending: 'success', tone: 'danger',
      text: 'The table is broken and someone is hurt. Your intervention helped the dispute become a fight, and the constable will have questions for everyone. The purse remains missing; anger did not make the truth clearer.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Door Closes Behind You', ending: 'success',
      text: 'You leave the warm room to its own argument. You do not know whether the purse is found or whether Sella and Rafe settle their debt. Walking away was a choice to stay out, not a verdict.',
      choices: [],
    },
  }) as Record<string, Scene>,
};
