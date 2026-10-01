import type { Scenario } from '../types';

const end = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });
const KEEPERS = ['Tavren', 'Isolde', 'Araminta', 'Fenella', 'Leofric'];

export const THE_INJURED_TRAVELER: Scenario = {
  id: 'the-injured-traveler', title: 'The Injured Traveler', subtitle: 'A sore wrist, a request for help, and no certain diagnosis.', startScene: 'roadsideRequest',
  runRandomSelections: [{ id: 'injuryAccount', values: [{ value: 'genuine' }, { value: 'exaggerated' }, { value: 'mixed' }] }],
  scenes: {
    roadsideRequest: { id: 'roadsideRequest', title: 'A Request by the Road', tone: 'safe', text: 'A traveler sits beside a milestone holding one wrist close. They say it is badly injured and ask for two coins to reach a healer. You can see swelling, but have no way to judge how serious it is. They are calm and able to speak.', choices: [
      { id: 'giveInjuryMoney', label: 'Give two coins for the healer', requirements: { minMoney: 2 }, effects: { money: -2, historyFlags: ['gave_money_to_injured_traveler'] }, next: 'moneyGiven' },
      { id: 'offerWaterInjury', label: 'Offer water and ask what happened', timeCost: 5, next: 'accountHeard', effects: { knowledge: ['A traveler beside a milestone held a swollen wrist and asked for help reaching a healer.'] } },
      { id: 'sendForInnkeeper', label: 'Ask the nearby innkeeper to come over', timeCost: 6, next: 'innkeeperArrives' },
      { id: 'declineInjury', label: 'Wish them well and continue on', next: 'continuedRoad' },
    ] },
    accountHeard: { id: 'accountHeard', title: 'Two Accounts', tone: 'safe', text: 'The traveler explains how the wrist was hurt. The account may be sincere, overstated, or a little of both; without a healer’s examination, you cannot know.', textVariants: [
      { requirements: { selections: { injuryAccount: 'genuine' } }, text: 'The traveler says a cart wheel rolled over the wrist. A nearby carter confirms there was a stumble, though they did not see the impact clearly.' },
      { requirements: { selections: { injuryAccount: 'exaggerated' } }, text: 'The traveler says the wrist is unusable, though they can move their fingers. They admit the swelling began after a mild fall and hope a healer will be nearby.' },
      { requirements: { selections: { injuryAccount: 'mixed' } }, text: 'The traveler says the wrist hurts badly after a fall. A passerby saw them land on it, but cannot tell whether it is sprained or broken.' },
    ], choices: [
      { id: 'offerOneCoinInjury', label: 'Offer one coin and leave the decision to them', requirements: { minMoney: 1 }, effects: { money: -1 }, next: 'partialHelp' },
      { id: 'askInnkeeperInjury', label: 'Ask the innkeeper to help find a healer', timeCost: 5, next: 'innkeeperArrives' },
      { id: 'leaveInjuryAccount', label: 'Leave them to choose their next step', next: 'continuedRoad' },
    ] },
    innkeeperArrives: { id: 'innkeeperArrives', title: 'Help Without a Verdict', tone: 'safe', text: 'The innkeeper brings a cup of water and offers the traveler a place to sit while a healer is sent for. No one asks you to decide whether the pain is as bad as claimed.', choices: [
      { id: 'stayForHealer', label: 'Stay until the healer is sent for', timeCost: 8, next: 'localHelp' },
      { id: 'leaveAfterInnkeeper', label: 'Leave once the innkeeper takes over', next: 'localHelp' },
    ] },
    moneyGiven: end('moneyGiven', 'Help Given Freely', 'The traveler thanks you and heads toward the inn, holding the wrist close. You cannot know whether the two coins were necessary, but you chose to help without requiring proof.'),
    partialHelp: end('partialHelp', 'A Smaller Offer', 'The traveler accepts the coin and says they will ask the innkeeper for directions. You have helped within your means without claiming to know how serious the injury is.'),
    localHelp: end('localHelp', 'Someone Nearby Can Help', 'The innkeeper takes responsibility for sending word to a healer. The traveler remains sore and uncertain, but is no longer alone beside the road.'),
    continuedRoad: end('continuedRoad', 'Onward', 'You continue down the road. The traveler can still reach the nearby inn, and you do not pretend to know whether the injury or request was exaggerated.'),
  },
};

export const THATS_MY_HORSE: Scenario = {
  id: 'thats-my-horse', title: 'That’s My Horse', subtitle: 'Two claims, one calm horse, and no clear proof.', startScene: 'stableYard',
  runRandomSelections: [{ id: 'horseEvidence', values: [{ value: 'faintBrand' }, { value: 'matchingTack' }, { value: 'noWitness' }] }],
  scenes: {
    stableYard: { id: 'stableYard', title: 'A Dispute at the Stable', tone: 'warning', text: 'A calm chestnut horse stands tied in the stable yard while a stable hand holds its lead. One traveler says it is theirs and was left here for a night; another says they brought it in for a neighbor. Neither raises a hand or blocks the gate.', choices: [
      { id: 'askStableHand', label: 'Ask the stable hand what they saw', timeCost: 4, next: 'horseAccounts' },
      { id: 'inspectHorseMarks', label: 'Look at the visible tack and markings', timeCost: 4, next: 'horseEvidence' },
      { id: 'askForWitness', label: 'Ask whether anyone else saw it arrive', timeCost: 3, next: 'horseAccounts' },
      { id: 'leaveHorseClaim', label: 'Stay out of the ownership dispute', next: 'horseUnresolved' },
    ] },
    horseAccounts: { id: 'horseAccounts', title: 'Two Plausible Accounts', tone: 'safe', text: 'The stable hand remembers a horse arriving near dusk but did not see who paid the fee. The travelers describe different days and routes. The horse remains calm; neither account can be confirmed here.', choices: [
      { id: 'askBothHorse', label: 'Ask both travelers to compare their details', timeCost: 5, next: 'horseEvidence' },
      { id: 'askStableRecord', label: 'Check the stable’s handwritten fee book', timeCost: 4, next: 'horseRecord' },
      { id: 'declineHorseJudgment', label: 'Decline to decide for them', next: 'horseUnresolved' },
    ] },
    horseEvidence: { id: 'horseEvidence', title: 'A Sign, Not a Verdict', tone: 'safe', text: 'The tack and the animal’s markings offer a little context, but neither proves who owns the horse.', textVariants: [
      { requirements: { selections: { horseEvidence: 'faintBrand' } }, text: 'A faint brand is partly hidden by dust. Both travelers recognize the mark as common in this district, so it does not settle their claims.' },
      { requirements: { selections: { horseEvidence: 'matchingTack' } }, text: 'The saddle bears a repaired strap that one traveler recognizes. The other says they lent the saddle several weeks ago; neither can show a note.' },
      { requirements: { selections: { horseEvidence: 'noWitness' } }, text: 'The stable hand and nearby shopkeeper were both away when the horse arrived. No one can say which traveler led it through the gate.' },
    ], choices: [
      { id: 'consultStableBook', label: 'Ask the stable hand to check the fee book', timeCost: 3, next: 'horseRecord' },
      { id: 'suggestSharedWait', label: 'Suggest they wait for a neighbor who knows it', timeCost: 2, next: 'horseWaiting' },
      { id: 'leaveHorseEvidence', label: 'Leave the claim for them to settle', next: 'horseUnresolved' },
    ] },
    horseRecord: { id: 'horseRecord', title: 'A Name in the Book', tone: 'safe', text: 'The book records a stable fee paid for a chestnut horse, but the writer abbreviated the traveler’s name. The entry helps with the date, not the ownership.', choices: [
      { id: 'showBothEntry', label: 'Show the entry to both travelers', timeCost: 2, next: 'horseWaiting' },
      { id: 'leaveHorseBook', label: 'Leave the book with the stable hand', next: 'horseUnresolved' },
    ] },
    horseWaiting: end('horseWaiting', 'A Familiar Face May Know', 'The stable hand keeps the horse watered while the travelers wait for a neighbor who knows it. You have offered a way to check without choosing a side.'),
    horseUnresolved: end('horseUnresolved', 'The Horse Stays Put', 'The stable hand keeps the horse in the yard while the two travelers continue their discussion. You leave without making an accusation on incomplete evidence.'),
  },
};

export const THE_EMPTY_PURSE: Scenario = {
  id: 'the-empty-purse', title: 'The Empty Purse', subtitle: 'A guest’s money is missing, but no one saw what happened.', startScene: 'innComplaint',
  runRandomSelections: [{ id: 'purseOutcome', values: [{ value: 'misplaced' }, { value: 'taken' }, { value: 'neverBrought' }] }],
  scenes: {
    innComplaint: { id: 'innComplaint', title: 'A Missing Purse', tone: 'warning', text: 'A guest at the inn says their purse has gone missing. They last remember seeing it after supper, but several people shared the common room and no one saw a theft. The innkeeper offers to help look; nobody has accused a particular person.', choices: [
      { id: 'letHostSearch', label: 'Let the innkeeper search the common room', timeCost: 6, next: 'purseSearch' },
      { id: 'askGuestDetails', label: 'Ask where the purse was last seen', timeCost: 4, next: 'purseDetails', effects: { knowledge: ['An inn guest reported a missing purse after supper; no witness saw it taken.'] } },
      { id: 'stayOutPurse', label: 'Stay out of it and finish your supper', next: 'purseLeft' },
      { id: 'leaveInnPurse', label: 'Leave the inn without making a claim', next: 'purseLeft' },
    ] },
    purseDetails: { id: 'purseDetails', title: 'A Memory After Supper', tone: 'safe', text: 'The guest describes the evening as they remember it. Nothing proves whether the purse was stolen, misplaced, or never brought into the room.', textVariants: [
      { requirements: { selections: { purseOutcome: 'misplaced' } }, text: 'The guest recalls setting the purse by the wash basin, then going downstairs. They are no longer sure whether they brought it back to the common room.' },
      { requirements: { selections: { purseOutcome: 'taken' } }, text: 'The guest recalls a stranger moving a chair near their place, but did not see anyone touch the purse. It may have been taken, though that is only a suspicion.' },
      { requirements: { selections: { purseOutcome: 'neverBrought' } }, text: 'The guest remembers paying for the meal but cannot picture taking the purse from their room. They are embarrassed to have raised the alarm.' },
    ], choices: [
      { id: 'searchPurseRoom', label: 'Ask the innkeeper to check the guest’s room', timeCost: 5, next: 'purseSearch' },
      { id: 'leaveGuestToHost', label: 'Leave the search to the innkeeper', next: 'purseLeft' },
      { id: 'sitWithGuest', label: 'Sit with the guest while they think', timeCost: 4, next: 'purseSearch' },
    ] },
    purseSearch: { id: 'purseSearch', title: 'No Accusation Needed', tone: 'safe', text: 'The innkeeper checks the wash basin, the guest room, and the common table. The search turns up an answer for this visit, but nobody is treated as a suspect.', textVariants: [
      { requirements: { selections: { purseOutcome: 'misplaced' } }, text: 'The purse is found beneath the wash basin, with its contents untouched. The guest apologizes for worrying the room.' },
      { requirements: { selections: { purseOutcome: 'taken' } }, text: 'The purse is not found. The innkeeper writes down what the guest remembers and asks the travelers to check their own things; there is still no proof of theft.' },
      { requirements: { selections: { purseOutcome: 'neverBrought' } }, text: 'The guest finds their purse tucked in their room’s travel bag. They had not brought it downstairs after all.' },
    ], choices: [
      { id: 'helpPurseSearch', label: 'Help return the room to order', timeCost: 4, next: 'purseResolved', effects: { historyFlags: ['helped_search_for_missing_inn_purse'] } },
      { id: 'leaveAfterPurseSearch', label: 'Leave the guests to their evening', next: 'purseResolved' },
    ] },
    purseResolved: end('purseResolved', 'The Room Settles', 'The inn returns to its ordinary evening. A purse was found, or a report was made without proof; either way, no one needed you to appoint a culprit.'),
    purseLeft: end('purseLeft', 'An Unfinished Question', 'You leave the matter with the guest and innkeeper. You do not know whether the purse was taken or simply misplaced, and you are under no obligation to decide.'),
  },
};

export const A_VERY_GOOD_DEAL: Scenario = {
  id: 'a-very-good-deal', title: 'A Very Good Deal', subtitle: 'A useful loupe is offered cheaply, for reasons not yet clear.', startScene: 'cheapLoupe',
  runRandomSelections: [{ id: 'saleReason', values: [{ value: 'hardTimes' }, { value: 'damaged' }, { value: 'borrowed' }, { value: 'bargain' }] }],
  scenes: {
    cheapLoupe: { id: 'cheapLoupe', title: 'Three Coins for a Loupe', tone: 'safe', text: 'A roadside seller offers a brass-rimmed assayer’s loupe for three coins. It looks useful and is priced below the usual market rate, but the seller has not explained why. You can ask, inspect it, decline, or buy it as offered.', choices: [
      { id: 'askLoupePrice', label: 'Ask why the loupe is priced so low', timeCost: 3, next: 'saleExplained' },
      { id: 'inspectLoupe', label: 'Inspect the glass and hinge', timeCost: 4, next: 'saleInspected' },
      { id: 'buyLoupe', label: 'Buy the loupe for three coins', requirements: { minMoney: 3, notItems: ['assayersLoupe'] }, timeCost: 2, effects: { money: -3, gainItems: ['assayersLoupe'], historyFlags: ['bought_assayers_loupe_from_roadside_seller'] }, next: 'saleBought' },
      { id: 'declineLoupe', label: 'Decline and leave the offer alone', next: 'saleDeclined' },
    ] },
    saleExplained: { id: 'saleExplained', title: 'An Ordinary Explanation', tone: 'safe', text: 'The seller offers an explanation. It may be enough for you, or you may still want to look closely before deciding.', textVariants: [
      { requirements: { selections: { saleReason: 'hardTimes' } }, text: 'The seller says the rent is due tomorrow and they need coin more than a tool. They do not ask you to pity them.' },
      { requirements: { selections: { saleReason: 'damaged' } }, text: 'The seller admits the hinge sticks and says the loupe needs a small repair. The glass remains clear.' },
      { requirements: { selections: { saleReason: 'borrowed' } }, text: 'The seller says it belongs to a cousin who asked them to sell it. They cannot produce a note, but offer to wait while you ask nearby.' },
      { requirements: { selections: { saleReason: 'bargain' } }, text: 'The seller says they bought several at an estate sale and are happy to move one quickly. It may simply be a fair bargain.' },
    ], choices: [
      { id: 'inspectAfterExplanation', label: 'Look at the loupe before deciding', timeCost: 3, next: 'saleInspected' },
      { id: 'buyAfterExplanation', label: 'Buy it for three coins', requirements: { minMoney: 3, notItems: ['assayersLoupe'] }, effects: { money: -3, gainItems: ['assayersLoupe'], historyFlags: ['bought_assayers_loupe_from_roadside_seller'] }, next: 'saleBought' },
      { id: 'leaveAfterExplanation', label: 'Thank the seller and leave', next: 'saleDeclined' },
    ] },
    saleInspected: { id: 'saleInspected', title: 'Clear Glass, Worn Hinge', tone: 'safe', text: 'The glass is clear enough to read fine marks. The hinge is worn but still opens and closes. Inspection tells you its condition, not whether the seller has a right to sell it.', choices: [
      { id: 'buyInspectedLoupe', label: 'Buy the loupe for three coins', requirements: { minMoney: 3, notItems: ['assayersLoupe'] }, effects: { money: -3, gainItems: ['assayersLoupe'], historyFlags: ['bought_assayers_loupe_from_roadside_seller'] }, next: 'saleBought' },
      { id: 'askSellerProof', label: 'Ask the seller to contact their cousin', requirements: { selections: { saleReason: 'borrowed' } }, timeCost: 8, next: 'sellerContacted' },
      { id: 'walkFromLoupe', label: 'Leave without buying', next: 'saleDeclined' },
    ] },
    saleBought: end('saleBought', 'A Loupe in Your Pack', 'You pay the agreed price and take the loupe openly. It may be a useful bargain, a small repair, or a sale you later want to ask about. You know its condition better than its full history.'),
    sellerContacted: end('sellerContacted', 'A Question for the Cousin', 'The seller sends word to their cousin and holds the loupe until an answer comes. You leave without buying or accusing anyone.'),
    saleDeclined: end('saleDeclined', 'No Purchase', 'The seller keeps the loupe and turns to another passerby. You have neither accused them nor bought something you did not want.'),
  },
};

export const THE_BROKEN_PROMISE: Scenario = {
  id: 'the-broken-promise', title: 'The Broken Promise', subtitle: 'You heard only part of an agreement between travelers.', startScene: 'roadsideDispute',
  runRandomSelections: [{ id: 'heardFragment', values: [{ value: 'oneCoin' }, { value: 'ifPaid' }, { value: 'noTerms' }] }],
  scenes: {
    roadsideDispute: { id: 'roadsideDispute', title: 'A Promise Recalled Differently', tone: 'warning', text: 'Two travelers disagree beside a resting cart. One says the other promised to pay for help; the other says they only discussed it. You passed them earlier and heard one short part of their conversation, but not how it began.', textVariants: [
      { requirements: { selections: { heardFragment: 'oneCoin' } }, text: 'You remember hearing one traveler say, “I can give you a coin for that.” You did not hear what “that” meant or whether the offer was accepted.' },
      { requirements: { selections: { heardFragment: 'ifPaid' } }, text: 'You remember hearing, “If the cart job pays, I’ll share.” You did not hear whether they agreed what share or when it would be paid.' },
      { requirements: { selections: { heardFragment: 'noTerms' } }, text: 'You remember only a mention of needing help with the cart. You heard no amount, date, or clear promise.' },
    ], choices: [
      { id: 'giveLimitedAccountCoin', label: 'Repeat only the words you heard', requirements: { selections: { heardFragment: 'oneCoin' } }, timeCost: 3, next: 'limitedWitness', effects: { knowledge: ['You heard one traveler offer a coin for something, but did not hear the full agreement.'] } },
      { id: 'giveLimitedAccountPaid', label: 'Repeat only the conditional offer', requirements: { selections: { heardFragment: 'ifPaid' } }, timeCost: 3, next: 'limitedWitness', effects: { knowledge: ['You heard a conditional offer to share payment if a cart job paid, but not the agreed amount or date.'] } },
      { id: 'sayHeardNoTerms', label: 'Say you heard no terms or amount', requirements: { selections: { heardFragment: 'noTerms' } }, timeCost: 3, next: 'limitedWitness', effects: { knowledge: ['You heard only that one traveler needed help with a cart, not whether payment was promised.'] } },
      { id: 'declinePromiseDispute', label: 'Decline to settle what you did not hear', next: 'promiseLeft' },
    ] },
    limitedWitness: { id: 'limitedWitness', title: 'A Partial Account', tone: 'safe', text: 'You give the exact fragment you remember and make clear what you missed. The travelers still disagree about what followed, but neither can fairly claim you heard the whole agreement.', choices: [
      { id: 'suggestPrivateTalk', label: 'Suggest they discuss the rest privately', next: 'promiseTalked', effects: { historyFlags: ['gave_a_limited_witness_account'] } },
      { id: 'leavePartialWitness', label: 'Leave them to settle the terms', next: 'promiseLeft' },
    ] },
    promiseTalked: end('promiseTalked', 'Terms Still Unsettled', 'The travelers lower their voices and compare what each remembers. They may reach a compromise, but you do not stay to decide whether a promise was broken.'),
    promiseLeft: end('promiseLeft', 'What You Did Not Hear', 'You leave them to their own conversation. You know the piece you overheard, and no more.'),
  },
};

export const THE_LANDLORDS_STORY: Scenario = {
  id: 'the-landlords-story', title: 'The Landlord’s Story', subtitle: 'A room is damaged, but the cause and cost are disputed.', startScene: 'roomComplaint',
  scenes: {
    roomComplaint: { id: 'roomComplaint', title: 'A Mark on the Wall', tone: 'warning', text: 'At the inn, the landlord says a boarder owes for a fresh crack in the plaster. The boarder says the crack was there when they arrived and disputes part of the room charge. The mark is visible beside the bed; neither asks you to take sides.', choices: [
      { id: 'hearLandlord', label: 'Hear the landlord’s account', timeCost: 3, next: 'accountsCompared' },
      { id: 'hearBoarder', label: 'Hear the boarder’s account', timeCost: 3, next: 'accountsCompared' },
      { id: 'lookAtWall', label: 'Look at the crack and room yourself', timeCost: 3, next: 'roomInspected' },
      { id: 'leaveRoomDispute', label: 'Leave them to settle the room charge', next: 'disputeUnsettled' },
    ] },
    accountsCompared: { id: 'accountsCompared', title: 'Two Plausible Memories', tone: 'safe', text: 'The landlord says a trunk was dragged against the wall. The boarder says the plaster fell after a damp night. Both agree the crack is small; they disagree about when it appeared.', choices: [
      { id: 'inspectRoomCrack', label: 'Look at the plaster without touching it', timeCost: 3, next: 'roomInspected' },
      { id: 'suggestSplitRoom', label: 'Suggest they split the small repair cost', next: 'roomCompromise' },
      { id: 'leaveBothAccounts', label: 'Decline to decide from two memories', next: 'disputeUnsettled' },
    ] },
    roomInspected: { id: 'roomInspected', title: 'An Old Edge, a Fresh Mark', tone: 'safe', text: 'Dust lies inside the crack, but the edge is partly hidden by a bed curtain. It may have opened recently along an older flaw. You cannot date it by looking.', choices: [
      { id: 'offerNeutralCompromise', label: 'Suggest a modest shared repair', next: 'roomCompromise' },
      { id: 'askForOldRecord', label: 'Ask whether the room was noted before', timeCost: 4, next: 'recordMissing' },
      { id: 'leaveInspectionRoom', label: 'Leave the choice to landlord and boarder', next: 'disputeUnsettled' },
    ] },
    recordMissing: { id: 'recordMissing', title: 'No Earlier Note', tone: 'safe', text: 'The innkeeper’s book records the room charge but not the wall. There is no earlier description to settle the matter.', choices: [
      { id: 'splitAfterNoRecord', label: 'Suggest they share the repair if they agree', next: 'roomCompromise' },
      { id: 'leaveAfterNoRecord', label: 'Leave without offering a verdict', next: 'disputeUnsettled' },
    ] },
    roomCompromise: { id: 'roomCompromise', title: 'Terms for the Repair', tone: 'safe', text: 'The landlord will supply plaster and do the patching, but wants the boarder to pay part of the cost. The boarder cannot pay tonight, though they can help with the work tomorrow. Your suggestion has brought them this far; now each must accept a real part of the burden.', choices: [
      { id: 'boarderWorksForShare', label: 'Have the boarder help with the repair', next: 'roomWorkShared', effects: { historyFlags: ['helped_settle_a_room_repair_fairly'] } },
      { id: 'landlordPaysRepair', label: 'Ask the landlord to cover the old crack', next: 'roomLandlordPays' },
      { id: 'boarderPaysRepair', label: 'Ask the boarder to pay half tomorrow', next: 'roomBoarderPays' },
      { id: 'leaveRepairTerms', label: 'Leave before they settle the terms', next: 'disputeUnsettled' },
    ] },
    roomWorkShared: end('roomWorkShared', 'A Patch Made Together', 'The landlord sets out plaster while the boarder agrees to help apply it in the morning. Neither gets a ruling on when the crack began, but the repair will be made without a disputed charge on tonight’s bill.'),
    roomLandlordPays: end('roomLandlordPays', 'The Landlord Takes the Cost', 'The landlord accepts that the crack may have followed an older flaw and removes it from the boarder’s bill. The boarder still pays the agreed room charge; the landlord will patch the wall between guests.'),
    roomBoarderPays: end('roomBoarderPays', 'A Cost Shared in Coin', 'The boarder agrees to pay half the modest repair cost tomorrow, and the landlord removes the rest from the room bill. They still disagree about when the crack began, but both accept a specific cost and next step.'),
    disputeUnsettled: end('disputeUnsettled', 'The Room Remains', 'The landlord and boarder continue their discussion after you leave. The crack stays small, and you do not become the judge of a room you did not rent.'),
  },
};

export const THE_MISSING_SACK: Scenario = {
  id: 'the-missing-sack', title: 'The Missing Sack', subtitle: 'Shared transport leaves one load unaccounted for.', startScene: 'wagonStop',
  runRandomSelections: [{ id: 'sackOutcome', values: [{ value: 'wrongStop' }, { value: 'slipped' }, { value: 'neverLoaded' }, { value: 'taken' }] }],
  scenes: {
    wagonStop: { id: 'wagonStop', title: 'One Sack Short', tone: 'warning', text: 'At the inn yard, the driver and a shopkeeper count the flour sacks unloaded from a shared wagon. One is missing. The driver remembers the stack being shorter before the last stop; the shopkeeper remembers seeing another sack aboard. No one saw it taken.', choices: [
      { id: 'checkWagonLedger', label: 'Check the driver’s loading marks', timeCost: 4, next: 'loadingMarks', effects: { knowledge: ['A flour sack was missing after shared wagon transport; the driver and shopkeeper remembered different counts.'] } },
      { id: 'askLastStop', label: 'Ask the last inn whether a sack was left', timeCost: 6, next: 'lastStopAsked' },
      { id: 'lookAlongRoad', label: 'Look along the yard entrance and road', timeCost: 5, next: 'roadsideSearch' },
      { id: 'leaveSackDispute', label: 'Leave them to settle the missing load', next: 'sackUnresolved' },
    ] },
    loadingMarks: { id: 'loadingMarks', title: 'A Rough Count', tone: 'safe', text: 'The marks help explain what may have happened, but do not prove whether anyone took the sack.', textVariants: [
      { requirements: { selections: { sackOutcome: 'wrongStop' } }, text: 'The driver’s chalk count drops by one beside the previous inn. A sack may have been unloaded there by mistake.' },
      { requirements: { selections: { sackOutcome: 'slipped' } }, text: 'A floury scuff runs along the wagon rail. A sack could have shifted off on the rough road.' },
      { requirements: { selections: { sackOutcome: 'neverLoaded' } }, text: 'The shopkeeper’s own tally begins after the wagon left town. The sack may never have been loaded.' },
      { requirements: { selections: { sackOutcome: 'taken' } }, text: 'The count matches until the wagon stopped at a busy crossing, where several people helped shift cargo. That timing raises a question but proves nothing.' },
    ], choices: [
      { id: 'sendWordToStop', label: 'Send a note to the previous inn', timeCost: 8, next: 'sackAccountFound' },
      { id: 'searchRoadSack', label: 'Walk the last stretch of road together', timeCost: 10, next: 'roadsideSearch' },
      { id: 'stopSearchingSack', label: 'Stop before anyone is accused', next: 'sackUnresolved' },
    ] },
    lastStopAsked: { id: 'lastStopAsked', title: 'A Message from the Previous Inn', tone: 'safe', text: 'A runner returns with a short reply from the previous stop. It may help account for the sack, though the wagon party cannot verify the whole journey.', textVariants: [
      { requirements: { selections: { sackOutcome: 'wrongStop' } }, text: 'The inn reports finding a flour sack in its store room. It was set aside with a different delivery and can be sent back.' },
      { requirements: { selections: { sackOutcome: 'slipped' } }, text: 'The inn has no extra sack. The driver remembers a rough patch beyond the crossing where cargo could have shifted.' },
      { requirements: { selections: { sackOutcome: 'neverLoaded' } }, text: 'The inn reports no extra sack and says the wagon arrived with the count already short.' },
      { requirements: { selections: { sackOutcome: 'taken' } }, text: 'The inn has no extra sack. Someone at the crossing remembers hands on the load, but cannot identify who moved what.' },
    ], choices: [
      { id: 'acceptSackReply', label: 'Pass the reply to the shopkeeper', next: 'sackAccountFound' },
      { id: 'leaveAfterSackReply', label: 'Leave the remaining question open', next: 'sackUnresolved' },
    ] },
    roadsideSearch: { id: 'roadsideSearch', title: 'Along the Last Stretch', tone: 'safe', text: 'A brief search finds no clear trail. The road is busy and the ground holds mixed wagon marks; you cannot identify who handled the sack.', choices: [
      { id: 'askRoadsideSearch', label: 'Ask a nearby carter if they saw it', timeCost: 4, next: 'sackAccountFound' },
      { id: 'endRoadsideSearch', label: 'Stop searching and leave the dispute', next: 'sackUnresolved' },
    ] },
    sackAccountFound: end('sackAccountFound', 'A Better Account', 'The shopkeeper and driver agree on what they can establish. The sack is found, left at another stop, or accounted for as never loaded; where no witness exists, they leave the cause unsettled.'),
    sackUnresolved: end('sackUnresolved', 'No One Accused', 'The wagon moves on while the shopkeeper notes the short delivery. The sack may have been misplaced, lost, or taken; the evidence does not justify naming anyone.'),
  },
};

export const A_BORROWED_COAT: Scenario = {
  id: 'a-borrowed-coat', title: 'A Borrowed Coat', subtitle: 'A coat changes hands; the stories do not quite match.', startScene: 'coatClaim',
  runRandomSelections: [{ id: 'coatClaimant', values: KEEPERS.map((value) => ({ value })) }],
  scenes: {
    coatClaim: { id: 'coatClaim', title: 'The Coat in the Common Room', tone: 'warning', text: 'At the inn, {{coatClaimant}} says a wool coat worn by another traveler was left at their camp. The wearer says a cousin lent it to them. There is no clear maker’s mark, and both stories are plausible.', textVariants: KEEPERS.map((value) => ({
      requirements: { selections: { coatClaimant: value }, historyFlags: [`finder_took_watch_from_${value}`] },
      text: `When ${value} gives their name, you recognize it as the name engraved inside a silver watch you took from unattended belongings on an earlier journey. That history says nothing certain about this coat.`,
    })), choices: [
      { id: 'askCoatTimeline', label: 'Ask each person when they last saw the coat', timeCost: 5, next: 'coatAccounts' },
      { id: 'askInnkeeperCoat', label: 'Ask the innkeeper to hold the coat for now', timeCost: 3, next: 'coatHeld' },
      { id: 'leaveCoatClaim', label: 'Decline to settle it and leave', next: 'coatUnresolved' },
      ...KEEPERS.map((value) => ({ id: `admitWatch_${value}`, label: 'Acknowledge taking the named watch', requirements: { selections: { coatClaimant: value }, historyFlags: [`finder_took_watch_from_${value}`] }, next: 'watchAcknowledged', effects: { historyFlags: [`acknowledged_taking_watch_from_${value}`] } })),
    ] },
    coatAccounts: { id: 'coatAccounts', title: 'Borrowed, Traded, or Found', tone: 'safe', text: 'The wearer says the cousin gave it to them for the winter. {{coatClaimant}} says the coat disappeared during travel. Neither can name a distinctive patch or repair.', textVariants: KEEPERS.map((value) => ({
      requirements: { selections: { coatClaimant: value }, historyFlags: [`finder_took_watch_from_${value}`] },
      text: `The stories remain incomplete. ${value} recognizes your face only after you mention the old camp; you admit you took their named watch there. They still cannot prove who owns this coat.`,
    })), choices: [
      { id: 'askCoatForMark', label: 'Ask whether the coat has a hidden repair', timeCost: 3, next: 'coatDetail' },
      { id: 'suggestCoatWait', label: 'Suggest they ask the cousin together', next: 'coatHeld' },
      { id: 'leaveCoatAccounts', label: 'Leave without choosing whose story is right', next: 'coatUnresolved' },
    ] },
    coatDetail: { id: 'coatDetail', title: 'A Small Repair', tone: 'safe', text: 'A careful look finds a brown thread repair inside the hem. Both travelers say they have seen it before; neither knows who stitched it.', choices: [
      { id: 'holdCoatDetail', label: 'Let the innkeeper hold it until morning', next: 'coatHeld' },
      { id: 'leaveCoatDetail', label: 'Leave the coat with its wearer for now', next: 'coatUnresolved' },
    ] },
    coatHeld: { id: 'coatHeld', title: 'Held Until Morning', tone: 'safe', text: 'The innkeeper places the coat in a dry room and asks both travelers to return at breakfast. The wearer says the cousin can identify the brown hem repair; the claimant says the cousin only saw it after the coat went missing. Keeping it safe has bought time, not settled ownership.', choices: [
      { id: 'askBothReturn', label: 'Ask both to return with the cousin', next: 'coatMorningPlan', effects: { historyFlags: ['kept_a_disputed_coat_safe_for_review'] } },
      { id: 'recordBothClaims', label: 'Have the innkeeper record both claims', next: 'coatClaimsRecorded' },
      { id: 'leaveCoatHeld', label: 'Leave before the morning meeting', next: 'coatUnresolved' },
    ] },
    coatMorningPlan: end('coatMorningPlan', 'A Meeting Set for Morning', 'Both travelers agree to appear at breakfast with the cousin, while the coat stays dry and untouched overnight. The innkeeper will not release it on either person’s say-so; your suggestion prevents a hasty handover, though the claim remains open.'),
    coatClaimsRecorded: end('coatClaimsRecorded', 'Two Claims in the Book', 'The innkeeper records each account and keeps the coat locked away until the cousin can be asked. Neither traveler gets the coat tonight, and both know the delay was chosen to avoid an unsupported verdict.'),
    coatUnresolved: end('coatUnresolved', 'No Verdict on the Coat', 'You leave the inn while both stories remain possible. The coat is not a puzzle you are required to solve.'),
    watchAcknowledged: end('watchAcknowledged', 'An Uncomfortable Recognition', 'You tell {{coatClaimant}} that you once took their named silver watch from unattended belongings. The admission does not prove the coat is theirs, but it changes the conversation. You do not claim that your own past choice was fair.'),
  },
};

export const THE_FALSE_GUIDE: Scenario = {
  id: 'the-false-guide', title: 'The False Guide', subtitle: 'A paid guide offers a way through the hills.', startScene: 'guideOffer',
  runRandomSelections: [{ id: 'guideQuality', values: [{ value: 'competent' }, { value: 'boastful' }, { value: 'unfamiliar' }, { value: 'dishonest' }] }],
  scenes: {
    guideOffer: { id: 'guideOffer', title: 'A Guide at the Fork', tone: 'safe', text: 'At a fork in the hill road, a traveler offers to guide you through the higher pass for two coins. A marked lower road takes longer but is known to be open. The guide speaks confidently, though you have no reason yet to know how well they know the pass.', choices: [
      { id: 'hireGuide', label: 'Pay two coins and try the guided path', requirements: { minMoney: 2 }, timeCost: 3, effects: { money: -2 }, next: 'guideRoute' },
      { id: 'askGuideExperience', label: 'Ask how often they have crossed the pass', timeCost: 3, next: 'guideExplains' },
      { id: 'takeKnownRoad', label: 'Take the marked lower road alone', timeCost: 25, next: 'knownRoad' },
      { id: 'leaveGuideFork', label: 'Wait for another traveler before choosing', timeCost: 8, next: 'guideWaited' },
    ] },
    guideExplains: { id: 'guideExplains', title: 'Confidence and Experience', tone: 'safe', text: 'The guide answers, though confidence and experience are not the same thing. The marked lower road remains available.', textVariants: [
      { requirements: { selections: { guideQuality: 'competent' } }, text: 'The guide describes two recent crossings and points out a sheltered place to rest. Their account sounds practical, though you still choose whether to trust it.' },
      { requirements: { selections: { guideQuality: 'boastful' } }, text: 'The guide has crossed once but describes the pass as easy in every season. Their confidence may outrun their experience.' },
      { requirements: { selections: { guideQuality: 'unfamiliar' } }, text: 'The guide admits they have not crossed the pass, but says they know someone who has. Their directions may still help, or may not.' },
      { requirements: { selections: { guideQuality: 'dishonest' } }, text: 'The guide changes the subject and cannot name a landmark beyond the first rise. You have not proved a lie, but have learned little.' },
    ], choices: [
      { id: 'hireAfterQuestions', label: 'Hire the guide for two coins', requirements: { minMoney: 2 }, timeCost: 3, effects: { money: -2 }, next: 'guideRoute' },
      { id: 'chooseLowerAfterGuide', label: 'Choose the marked road instead', timeCost: 25, next: 'knownRoad' },
      { id: 'declineGuide', label: 'Decline and continue without a guide', next: 'guideWaited' },
    ] },
    guideRoute: { id: 'guideRoute', title: 'The First Rise', tone: 'warning', text: 'The route reveals what the guide can offer. The path remains walkable, and the marked lower road is still reachable.', textVariants: [
      { requirements: { selections: { guideQuality: 'competent' } }, text: 'The guide points out the true pass trail and sets an easy pace. The higher route is shorter and has a good view beyond the rise.' },
      { requirements: { selections: { guideQuality: 'boastful' } }, text: 'The guide leads you to the pass but understates how rocky the upper path is. You can continue slowly or turn back to the lower road.' },
      { requirements: { selections: { guideQuality: 'unfamiliar' } }, text: 'The guide recognizes the first landmarks, then admits the route is less familiar than expected. No harm is done, but you must choose whether to continue together.' },
      { requirements: { selections: { guideQuality: 'dishonest' } }, text: 'At the first rise the guide admits they do not know the pass and will not continue. They keep the agreed payment, leaving you with the marked lower road as before.' },
    ], choices: [
      { id: 'continueWithGuide', label: 'Continue on the upper path without help', timeCost: 20, next: 'upperPath' },
      { id: 'returnToLowerRoad', label: 'Turn back to the marked lower road', timeCost: 15, next: 'knownRoad' },
    ] },
    upperPath: end('upperPath', 'A View from the Pass', 'The path reaches the far side of the rise. It was shorter than the lower road; the guide’s value depended on the knowledge you actually received.'),
    knownRoad: end('knownRoad', 'The Road You Knew', 'The lower road takes longer but is clearly marked. You arrive without needing to decide whether the guide was skilled, overconfident, or simply unprepared.'),
    guideWaited: end('guideWaited', 'No Rush at the Fork', 'Another traveler comes along and confirms that the lower road is open. You can continue without paying a guide or deciding what their confidence meant.'),
  },
};

export const THE_DEBT_AT_SUPPER: Scenario = {
  id: 'the-debt-at-supper', title: 'The Debt at Supper', subtitle: 'Two guests remember a small loan differently.', startScene: 'supperDispute',
  scenes: {
    supperDispute: { id: 'supperDispute', title: 'A Quiet Table Grows Awkward', tone: 'warning', text: 'At the inn’s supper table, one guest says another owes two coins from a loan made on the road. The other remembers borrowing one coin and says it was repaid. The room has gone quiet, but neither person threatens the other.', choices: [
      { id: 'leaveDebtTable', label: 'Finish your meal and leave them to it', next: 'debtLeft' },
      { id: 'listenDebtAccounts', label: 'Listen while they explain what they recall', timeCost: 6, next: 'debtAccounts', effects: { knowledge: ['Two inn guests disagreed about a small loan and whether it had been repaid.'] } },
      { id: 'askDebtNote', label: 'Ask whether either kept a note or tally', timeCost: 4, next: 'debtEvidence' },
      { id: 'offerDebtMediation', label: 'Suggest they speak quietly after supper', next: 'debtMediated' },
    ] },
    debtAccounts: { id: 'debtAccounts', title: 'Different Sums, Different Days', tone: 'safe', text: 'One guest remembers two coins for a week’s lodging; the other recalls a single coin for a meal. The accounts may describe separate moments or one poorly remembered loan.', choices: [
      { id: 'askDebtEvidence', label: 'Ask whether either kept a written tally', timeCost: 3, next: 'debtEvidence' },
      { id: 'suggestDebtTalk', label: 'Suggest they settle it privately', next: 'debtMediated' },
      { id: 'leaveDebtAccounts', label: 'Leave them to decide whether to continue', next: 'debtLeft' },
    ] },
    debtEvidence: { id: 'debtEvidence', title: 'No Clear Tally', tone: 'safe', text: 'One guest has a scrap with a mark for a coin, but no date. The other has no note. It is not enough to establish the amount or whether it was repaid.', choices: [
      { id: 'proposeDebtCompromise', label: 'Suggest they agree on a smaller settlement', next: 'debtMediated' },
      { id: 'returnDebtScrap', label: 'Give the scrap back and step away', next: 'debtLeft' },
    ] },
    debtMediated: end('debtMediated', 'A Conversation After Supper', 'The guests agree to talk apart from the table. They may settle on a smaller payment or let the matter go, but you are not appointed to judge a debt from incomplete notes.'),
    debtLeft: end('debtLeft', 'The Meal Goes On', 'You leave the guests to their own account. The disagreement remains small and unresolved; no one needs a stranger to declare a winner.'),
  },
};

export const DISPUTE_ADVENTURES: Scenario[] = [THE_INJURED_TRAVELER, THATS_MY_HORSE, THE_EMPTY_PURSE, A_VERY_GOOD_DEAL, THE_BROKEN_PROMISE, THE_LANDLORDS_STORY, THE_MISSING_SACK, A_BORROWED_COAT, THE_FALSE_GUIDE, THE_DEBT_AT_SUPPER];
