import type { Scene, Scenario } from '../types';

const ending = (id: string, title: string, text: string): Scene => ({ id, title, text, ending: 'success', choices: [] });

export const PAYMENT_IN_KIND: Scenario = {
  id: 'payment-in-kind', title: 'Payment in Kind', subtitle: 'A fair wage, in a form you did not expect.', startScene: 'settlement',
  diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
  timePhases: [{ id: 'afternoon', label: 'After the work', atMinutes: 0 }, { id: 'marketEve', label: 'Before market day', atMinutes: 30 }],
  scenes: {
    settlement: { id: 'settlement', title: 'The Wage Chest Is Light', tone: 'safe', text: 'The small repair job is finished, and the owner agrees the work was done well. The wage was set at four coins, but the owner has only two in the cash box until the next market. On a dry shelf are two sacks of flour and an old joiner’s folding rule from the workshop. The owner offers a choice rather than pretending the goods are coin.', choices: [
      { id: 'takeFlourAndCoin', label: 'Take two coins and a sack of flour', hint: 'Useful now, though the flour is more than a traveler can carry far.', timeCost: 2, next: 'flourPaid', effects: { money: 2, historyFlags: ['accepted_goods_instead_of_full_wages', 'took_flour_as_partial_payment'] } },
      { id: 'takeRuleAndCoin', label: 'Take the folding rule and two coins', hint: 'The owner values the tool at the remaining two coins; it is yours to keep.', requirements: { notItems: ['joinersFoldingRule'] }, timeCost: 2, next: 'rulePaid', effects: { money: 2, gainItems: ['joinersFoldingRule'], historyFlags: ['accepted_tool_instead_of_full_wages'] } },
      { id: 'acceptMarketDebt', label: 'Take two coins and a written promise', hint: 'The owner will owe the remaining two at the next market; collecting later is uncertain.', timeCost: 2, next: 'deferredPay', effects: { money: 2, knowledge: ['The workshop owner owes you two coins from a completed repair job, payable at the next market.'], historyFlags: ['accepted_deferred_wages'] } },
      { id: 'declineSettlement', label: 'Decline the offer and leave', hint: 'You keep no part of the wage today.', timeCost: 1, next: 'leftUnpaid', effects: { historyFlags: ['declined_payment_in_kind'] } },
    ] },
    flourPaid: ending('flourPaid', 'A Useful Load', 'The owner helps tie the flour into a small bundle and pays the two coins. It is a fair exchange for part of the wage, though the extra weight will slow your next walk.'),
    rulePaid: ending('rulePaid', 'A Tool for the Road', 'The owner places the folding rule in your hand and pays two coins. It has served the workshop well and folds small enough to travel with you.'),
    deferredPay: ending('deferredPay', 'Coin Now, Promise Later', 'You take the two coins and the signed note. The remaining wage is a promise, not money you can spend today.'),
    leftUnpaid: ending('leftUnpaid', 'No Agreement', 'You leave without the wage. The owner does not stop you; the finished work remains, and the disagreement is unresolved.'),
  },
};

export const SHORT_ON_THE_WAGES: Scenario = {
  id: 'short-on-the-wages', title: 'Short on the Wages', subtitle: 'The tally and the coins do not agree.', startScene: 'payOffer',
  runRandomSelections: [{ id: 'reason', values: [{ value: 'hardship', weight: 2 }, { value: 'quality' }, { value: 'cheating' }, { value: 'misunderstanding' }] }],
  timePhases: [{ id: 'afternoon', label: 'At the day’s end', atMinutes: 0 }, { id: 'evening', label: 'Evening', atMinutes: 20 }],
  scenes: {
    payOffer: { id: 'payOffer', title: 'Two Coins Short', tone: 'warning', text: 'At the end of a fence-repair job, the farm owner counts two coins into your palm instead of the four agreed that morning. A second hired hand stands by the gate; they saw the work but have not taken sides. The owner says the tally is right. No one is shouting, and the coins remain on the table.', choices: [
      { id: 'askForCount', label: 'Ask the owner to explain the count', hint: 'Hear the reason before deciding whether to press the matter.', timeCost: 2, next: 'account', effects: { setFlags: ['asked_about_short_wages'] } },
      { id: 'askWitness', label: 'Ask the other hand what they saw', hint: 'They can speak to the work, not the owner’s finances.', timeCost: 2, next: 'witness', effects: { setFlags: ['asked_wage_witness'] } },
      { id: 'acceptTwoCoins', label: 'Accept the two coins', timeCost: 1, next: 'acceptedShortPay', effects: { money: 2, historyFlags: ['accepted_short_wages'] } },
      { id: 'leaveWageDispute', label: 'Leave without arguing', hint: 'The coins stay on the table; you take no pay today.', next: 'leftWageDispute', effects: { historyFlags: ['walked_away_from_wage_dispute'] } },
    ] },
    account: { id: 'account', title: 'A Different Count', tone: 'warning', text: 'The owner opens the work tally and explains the short payment.', textVariants: [
      { requirements: { selections: { reason: 'hardship' } }, text: 'The owner shows an empty cash box and admits the farm has been short since a poor crop. The agreed amount is still written on the slate; the hardship is real, but it was not part of your agreement.' },
      { requirements: { selections: { reason: 'quality' } }, text: 'The owner points to two posts that lean and says the work fell short. You can see both posts, but there was no quality condition in the morning’s spoken agreement.' },
      { requirements: { selections: { reason: 'cheating' } }, text: 'The owner says the original agreement was only two coins. The second hand glances at the slate, where the four-coin amount is still plainly written.' },
      { requirements: { selections: { reason: 'misunderstanding' } }, text: 'The owner thought the four coins covered two workers together. The second hand says they were promised separate pay, but remembers no written agreement.' },
    ], choices: [
      { id: 'proposeOneMore', label: 'Ask calmly for one more coin', hint: 'A compromise is possible, but the owner may refuse.', timeCost: 2, chance: { probability: 0.72, successNext: 'compromise', failureNext: 'partialCompromise', successMessage: 'The owner considers the tally and adds another coin.', failureMessage: 'The owner refuses to change the offer. You take the two coins and leave the matter there.', successEffects: { money: 3, historyFlags: ['negotiated_fair_wages'] }, failureEffects: { money: 2, historyFlags: ['challenged_short_wages_without_agreement'] } } },
      { id: 'takeTwoAfterAccount', label: 'Take the two coins offered', timeCost: 1, next: 'acceptedShortPay', effects: { money: 2, historyFlags: ['accepted_short_wages_after_hearing_reason'] } },
      { id: 'leaveAfterAccount', label: 'Leave without pay', timeCost: 1, next: 'leftWageDispute', effects: { historyFlags: ['walked_away_from_wage_dispute'] } },
    ] },
    witness: { id: 'witness', title: 'What the Other Hand Saw', tone: 'safe', text: 'The other hired hand stands by the gate with you and the owner. They confirm which posts you repaired and that the morning agreement was spoken, not written. They cannot say why the cash is short or settle the question of what the work was worth.', choices: [
      { id: 'requestSharedCount', label: 'Ask them both to settle on three coins', hint: 'Neither side gets everything they first expected.', timeCost: 2, next: 'compromise', effects: { money: 3, historyFlags: ['settled_wage_dispute_with_witness'] } },
      { id: 'takeWitnessTwo', label: 'Take the two coins and end the matter', timeCost: 1, next: 'acceptedShortPay', effects: { money: 2, historyFlags: ['accepted_short_wages_after_witness'] } },
      { id: 'leaveWitness', label: 'Thank the witness and walk on', next: 'leftWageDispute', effects: { historyFlags: ['walked_away_from_wage_dispute'] } },
    ] },
    acceptedShortPay: ending('acceptedShortPay', 'The Coins You Took', 'You take the two coins and leave the rest of the dispute behind. The owner keeps the remaining money; no one is threatened, and the workday ends.'),
    compromise: ending('compromise', 'A Smaller Settlement', 'Three coins change hands. The owner keeps one, you receive more than the first offer, and the second hand confirms what they saw without claiming to know anyone’s motives.'),
    partialCompromise: ending('partialCompromise', 'The Offer Stands', 'The owner does not add to the two coins. You take the amount offered and leave the disagreement there; it stays civil.'),
    leftWageDispute: ending('leftWageDispute', 'No Wage Taken', 'You leave the coins where they are. The owner and the other hand remain at the gate; the short payment is unresolved, not settled by force.'),
  },
};

export const MARKET_DAY: Scenario = {
  id: 'market-day', title: 'Market Day', subtitle: 'A lively square, and no need to hurry.', startScene: 'marketSquare',
  diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
  timePhases: [{ id: 'morning', label: 'Morning market', atMinutes: 0 }, { id: 'midday', label: 'Midday', atMinutes: 45 }, { id: 'afternoon', label: 'Market thinning', atMinutes: 90 }],
  scenes: {
    marketSquare: { id: 'marketSquare', title: 'Stalls in the Square', tone: 'safe', easterEggContext: 'market', text: 'The market square is busy but unhurried. A cloth seller folds bolts beneath a striped awning; a provisions stall has clean bandages and wrapped dry goods. A tool seller has a joiner’s folding rule for three coins and sound travel rope for three. Merchants call their prices openly, and you have time to compare before buying.', choices: [
      { id: 'comparePrices', label: 'Compare prices and hear the market news', hint: 'A little conversation costs nothing; the tool seller will show you the stock.', timeCost: 8, next: 'toolStall', effects: { knowledge: ['Market prices can be compared stall to stall before buying; no purchase is required.'], historyFlags: ['compared_market_prices'] } },
      { id: 'buyBandages', label: 'Buy a Field Bandage Roll for two coins', hint: 'Clean gauze, wrapped against the dust.', requirements: { minMoney: 2, notOwnedItems: ['fieldBandageRoll'] }, timeCost: 3, next: 'boughtBandages', effects: { money: -2, gainItems: ['fieldBandageRoll'], historyFlags: ['bought_field_bandage_at_market'] } },
      { id: 'buyFoldingRule', label: 'Buy the folding rule for three coins', hint: 'A compact layout tool; the seller allows a fair look before payment.', requirements: { minMoney: 3, notOwnedItems: ['joinersFoldingRule'] }, timeCost: 4, next: 'boughtRule', effects: { money: -3, gainItems: ['joinersFoldingRule'], historyFlags: ['bought_joiners_rule_at_market'] } },
      { id: 'sellPocketWatch', label: 'Sell your Silver Pocket Watch', hint: 'The watch is yours to sell; the buyer offers three coins.', requirements: { items: ['foundPocketWatch'] }, timeCost: 3, next: 'soldWatch', effects: { money: 3, loseItems: ['foundPocketWatch'], historyFlags: ['sold_silver_pocket_watch_at_market'] } },
    ] },
    toolStall: { id: 'toolStall', title: 'The Tool Seller’s Stock', tone: 'safe', text: 'The seller lays out a sound twenty-foot travel rope with a locking hook. The rope is sturdy but takes space in a traveler’s kit. A trail outfitter across the square has a folding marker and a signal mirror. Prices are posted, with no pressure to buy.', choices: [
      { id: 'buyTravelRope', label: 'Buy the travel rope for three coins', hint: 'A sound rope with a locking hook; you may leave it here.', requirements: { minMoney: 3, notOwnedItems: ['travelRope'] }, timeCost: 4, next: 'boughtTravelRope', effects: { money: -3, gainItems: ['travelRope'], historyFlags: ['bought_travel_rope_at_market'] } },
      { id: 'browseTrailGoods', label: 'Browse the trail outfitter’s smaller tools', next: 'trailOutfitter' },
      { id: 'leaveToolStall', label: 'Thank the seller and move on', next: 'marketTalk' },
    ] },
    trailOutfitter: { id: 'trailOutfitter', title: 'Small Tools for the Road', tone: 'safe', text: 'The outfitter has a bright folding marker for two coins and a notched steel signal mirror for four. Both are ordinary travel tools, not guarantees against bad weather or distance.', choices: [
      { id: 'buyTrailMarker', label: 'Buy the folding trail marker for two coins', requirements: { minMoney: 2, notOwnedItems: ['foldingTrailMarker'] }, timeCost: 3, next: 'boughtTrailMarker', effects: { money: -2, gainItems: ['foldingTrailMarker'], historyFlags: ['bought_trail_marker_at_market'] } },
      { id: 'buySignalMirror', label: 'Buy the signal mirror for four coins', requirements: { minMoney: 4, notOwnedItems: ['roadsideSignalMirror'] }, timeCost: 3, next: 'boughtSignalMirror', effects: { money: -4, gainItems: ['roadsideSignalMirror'], historyFlags: ['bought_signal_mirror_at_market'] } },
      { id: 'leaveTrailOutfitter', label: 'Leave without buying', next: 'marketTalk' },
    ] },
    marketTalk: ending('marketTalk', 'A Pleasant Hour', 'You compare the prices without buying anything. The cloth seller mentions a dry road east of town, and the provisions merchant says the next market will be smaller. The square remains busy as you move on.'),
    boughtTravelRope: ending('boughtTravelRope', 'A Rope for the Road', 'You pay three coins for the sound braided rope and test its locking hook before packing it. The seller has not promised it will suit every task, but it is yours to carry.'),
    boughtTrailMarker: ending('boughtTrailMarker', 'A Mark for the Trail', 'You pay two coins and fold the bright marker into your kit. It can help make a route visible; it cannot make an unsafe path safe.'),
    boughtSignalMirror: ending('boughtSignalMirror', 'A Signal in the Pack', 'You pay four coins for the notched steel mirror. The outfitter shows how to sight along its notch; the signal will still depend on light and open sky.'),
    boughtBandages: ending('boughtBandages', 'A Small Useful Purchase', 'You pay two coins for the wrapped bandage roll and put it where it can be reached. The seller thanks you; the market offers plenty more to look at.'),
    boughtRule: ending('boughtRule', 'A Tool Bought in Good Faith', 'You inspect the folding rule, pay three coins, and fold it into your kit. The joints hold square and the merchant stands by the price.'),
    soldWatch: ending('soldWatch', 'A Watch for Coin', 'The buyer checks the silver watch and pays three coins. You no longer carry it; the market day moves on without fuss.'),
  },
};

export const THE_HORSE_TRADE: Scenario = {
  id: 'the-horse-trade', title: 'The Horse Trade', subtitle: 'A buyer asks what you can actually see.', startScene: 'yard',
  runRandomSelections: [{ id: 'horseCondition', values: [{ value: 'stiff', weight: 2 }, { value: 'sound' }] }],
  scenes: {
    yard: { id: 'yard', title: 'Beside the Paddock', tone: 'safe', text: 'A buyer and seller stand beside a chestnut horse inside a rail paddock. The buyer asks your opinion before offering coin. The horse is on level ground, wearing an ordinary saddle and bridle; no one has ridden it today. You are not a farrier or a veterinarian, and a short look cannot prove the animal’s health.', choices: [
      { id: 'walkHorse', label: 'Watch the horse walk and turn', hint: 'A visible stiffness may matter, but it is not a diagnosis.', timeCost: 5, next: 'walkObserved', effects: { knowledge: ['A brief walk can reveal visible stiffness or a steady step, but cannot establish a horse’s health.'] } },
      { id: 'inspectTack', label: 'Look over the saddle and bridle', hint: 'You can judge the visible leather and fit, not the horse’s soundness.', timeCost: 4, next: 'tackObserved', effects: { knowledge: ['The horse trade’s tack can be inspected for visible wear; sound tack does not prove the animal is sound.'] } },
      { id: 'askAboutPrice', label: 'Ask how the asking price was set', hint: 'The seller can explain the price; the buyer decides whether it suits them.', timeCost: 2, next: 'priceAccount' },
      { id: 'declineHorseOpinion', label: 'Decline to judge and move on', next: 'declinedOpinion', effects: { historyFlags: ['declined_to_guess_at_horse_condition'] } },
    ] },
    walkObserved: { id: 'walkObserved', title: 'A Short Walk', tone: 'safe', text: 'You lead the horse several paces across the level yard and turn it once, with the seller holding the loose end of the lead.', textVariants: [
      { requirements: { selections: { horseCondition: 'stiff' } }, text: 'The horse takes a shorter step with its left foreleg on the turn, then stands quietly. That is something visible, not proof of an injury or its cause.' },
      { requirements: { selections: { horseCondition: 'sound' } }, text: 'The horse steps evenly across the yard and turns without stumbling. A short walk still cannot tell you how it will fare under a long ride.' },
    ], choices: [
      { id: 'reportOnlyWhatSeen', label: 'Tell the buyer exactly what you observed', hint: 'Leave diagnosis and the final price to the people making the trade.', next: 'honestOpinion', effects: { historyFlags: ['gave_limited_horse_trade_opinion'] } },
      { id: 'recommendFarrier', label: 'Suggest a farrier’s look before sale', hint: 'It costs time, but gives both sides a better basis for the price.', next: 'farrierDelay', effects: { historyFlags: ['recommended_independent_horse_inspection'] } },
      { id: 'leaveAfterWalk', label: 'Leave the buyer to decide', next: 'declinedOpinion' },
    ] },
    tackObserved: { id: 'tackObserved', title: 'Leather and Buckles', tone: 'safe', text: 'The saddle tree does not show a split, and the near bridle buckle is worn but secure. None of that answers the question of how the horse will carry weight. The seller and buyer wait for your limited opinion.', choices: [
      { id: 'reportTack', label: 'Describe the tack without judging the horse', next: 'honestOpinion', effects: { historyFlags: ['gave_limited_horse_trade_opinion'] } },
      { id: 'recommendTackRepair', label: 'Ask that the worn buckle be replaced first', hint: 'The bridle remains secure now, but replacing it is a fair condition of sale.', next: 'fairCondition' },
      { id: 'leaveAfterTack', label: 'Leave the buyer to decide', next: 'declinedOpinion' },
    ] },
    priceAccount: { id: 'priceAccount', title: 'The Seller’s Figure', tone: 'safe', text: 'The seller says the asking price reflects the horse’s age and the saddle included in the sale. The buyer wants to know whether the amount is fair; neither answer can be settled by the asking price alone.', choices: [
      { id: 'askForTrialRide', label: 'Recommend a short trial ride in the yard', hint: 'The buyer should decide after seeing the horse carry a rider.', next: 'farrierDelay', effects: { historyFlags: ['recommended_trial_before_horse_purchase'] } },
      { id: 'suggestLowerPrice', label: 'Suggest a lower price until it is inspected', next: 'fairCondition', effects: { historyFlags: ['recommended_condition_based_horse_price'] } },
      { id: 'leavePriceAlone', label: 'Let buyer and seller settle the price', next: 'declinedOpinion' },
    ] },
    honestOpinion: ending('honestOpinion', 'A Limited Opinion', 'You describe only what you saw. The buyer thanks you and asks for time to decide; the seller is not accused, and no one is told that a brief inspection proves more than it can.'),
    farrierDelay: ending('farrierDelay', 'A Trade Delayed', 'The buyer asks the seller to wait for a farrier or a longer trial. The horse remains in the paddock with the seller, and the sale may still happen later at a price both accept.'),
    fairCondition: ending('fairCondition', 'Terms to Consider', 'The buyer and seller agree to discuss a lower price or a repair before the sale. You have helped them name a condition, not decide the horse’s full worth.'),
    declinedOpinion: ending('declinedOpinion', 'No Guess Made', 'You leave the paddock without claiming expertise. The buyer and seller continue their own discussion; the horse stays with its handler.'),
  },
};

export const THE_BROKEN_CRATE: Scenario = {
  id: 'the-broken-crate', title: 'The Broken Crate', subtitle: 'Damaged goods, and no clear culprit.', startScene: 'receivingYard',
  runRandomSelections: [{ id: 'damageCause', values: [{ value: 'roadJolt' }, { value: 'loadingSlip' }, { value: 'unseen', weight: 2 }] }],
  timePhases: [{ id: 'arrival', label: 'At the depot', atMinutes: 0 }, { id: 'beforeRain', label: 'Rain nearing', atMinutes: 20 }],
  scenes: {
    receivingYard: { id: 'receivingYard', title: 'A Split Crate', tone: 'warning', text: 'At the receiving yard, a crate of household crockery sits on the ground between the shop buyer and the freight carrier. One slat is split and two bowls are chipped. The cargo tally lists the crate but does not say when it was damaged. The buyer asks what should happen to the loss.', textVariants: [
      { requirements: { selections: { damageCause: 'roadJolt' } }, text: 'You rode on the wagon and felt it strike a deep rut on the road. You did not hear the crate break, and it stayed under canvas until delivery. Now it sits between the buyer and carrier, one slat split and two bowls chipped.' },
      { requirements: { selections: { damageCause: 'loadingSlip' } }, text: 'You saw the crate tilt as it was lowered from the wagon; the carrier caught it before it fell. Now it sits between the buyer and carrier, one slat split and two bowls chipped. You did not see the crack appear.' },
      { requirements: { selections: { damageCause: 'unseen' } }, text: 'You arrived after the wagon was unloaded. The crate sits between the buyer and carrier, one slat split and two bowls chipped; neither the cargo tally nor the visible damage says when it happened.' },
    ], choices: [
      { id: 'inspectCrate', label: 'Look at the crate and damaged goods', hint: 'You may learn how it broke, not who should pay.', timeCost: 4, next: 'crateInspection', effects: { knowledge: ['A split crate shows damage but may not establish when or by whom it was caused.'] } },
      { id: 'stateWhatWitnessed', label: 'Tell them only what you personally saw', requirements: { selections: { damageCause: 'roadJolt' } }, timeCost: 2, next: 'witnessStatement', effects: { historyFlags: ['gave_limited_freight_damage_account'] } },
      { id: 'secureGoods', label: 'Move the crockery under the depot awning', hint: 'Protect what remains before the rain arrives; blame can wait.', timeCost: 5, next: 'goodsSecured', effects: { historyFlags: ['protected_damaged_goods_before_rain'] } },
      { id: 'declineResponsibility', label: 'Leave the buyer and carrier to settle it', next: 'leftCrateDispute', effects: { historyFlags: ['declined_to_assign_freight_loss'] } },
    ] },
    crateInspection: { id: 'crateInspection', title: 'What the Break Shows', tone: 'safe', text: 'The split runs along an old nail hole. The broken bowls are packed beside a loose board, but the packing straw is wet from the yard. The marks fit rough handling, a hard road jolt, or a crate that was already weak; they do not prove which happened.', choices: [
      { id: 'recommendSharedLoss', label: 'Suggest sharing the replacement cost', hint: 'Neither side has enough evidence to assign all the loss.', next: 'sharedCrateCost', effects: { historyFlags: ['recommended_shared_freight_loss'] } },
      { id: 'askToCheckTally', label: 'Ask them to check the tally and packing note', hint: 'The note may show who packed it, not who caused the damage.', next: 'packingNote' },
      { id: 'leaveAfterInspection', label: 'Leave the decision to both parties', next: 'leftCrateDispute' },
    ] },
    packingNote: { id: 'packingNote', title: 'A Note, Not Proof', tone: 'safe', text: 'The packing note names the shop that packed the bowls and confirms the crate was accepted for transport. It records no condition at the wagon door. Responsibility remains uncertain.', choices: [
      { id: 'splitAfterNote', label: 'Propose a shared cost for the bowls', next: 'sharedCrateCost', effects: { historyFlags: ['recommended_shared_freight_loss'] } },
      { id: 'carrierPays', label: 'Tell the carrier what you witnessed', requirements: { selections: { damageCause: 'loadingSlip' } }, next: 'carrierAccount' },
      { id: 'leaveAfterNote', label: 'Let the buyer and carrier decide', next: 'leftCrateDispute' },
    ] },
    witnessStatement: ending('witnessStatement', 'A Careful Account', 'You tell them about the rut and make clear you did not hear the crate break. The carrier agrees that the road was rough; the buyer sets the chipped bowls aside while they discuss a fair division.'),
    goodsSecured: ending('goodsSecured', 'Goods Protected', 'The unbroken bowls go under the depot awning. The buyer and carrier still need to settle the loss, but the damaged goods are dry and no one has been blamed without evidence.'),
    sharedCrateCost: ending('sharedCrateCost', 'A Shared Loss', 'The buyer pays for the bowls that can still be used, and the carrier accepts part of the replacement cost. Neither calls the other dishonest; the exact moment of damage remains unknown.'),
    carrierAccount: ending('carrierAccount', 'The Carrier’s Account', 'You describe the unloading tilt and the carrier agrees to replace the two chipped bowls. The crate may have been weakened earlier, so the buyer keeps the remaining goods and no larger claim follows.'),
    leftCrateDispute: ending('leftCrateDispute', 'No Ruling Made', 'You leave without assigning blame. The buyer and carrier keep the crate in the yard while they compare their own notes.'),
  },
};

export const HALF_NOW: Scenario = {
  id: 'half-now', title: 'Half Now', subtitle: 'An advance, and a change in the work.', startScene: 'offer',
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'midday', label: 'Midday', atMinutes: 60 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 120 }],
  scenes: {
    offer: { id: 'offer', title: 'An Advance for the Job', tone: 'safe', text: 'A carpenter offers you six coins for a day’s work fitting shelves in a storeroom: three now, three when the shelves are set. The boards, brackets, and room are visible before you agree. The carpenter says the written tally will show the promised amount.', choices: [
      { id: 'takeAdvance', label: 'Take the three-coin advance and begin', hint: 'The first half is paid before work starts.', timeCost: 5, next: 'storeroom', effects: { money: 3, setFlags: ['accepted_half_now_terms'], historyFlags: ['accepted_partial_wage_advance'] } },
      { id: 'askForWrittenTerms', label: 'Write the full terms before beginning', hint: 'Confirm the six-coin total and what the job includes.', timeCost: 8, next: 'storeroom', effects: { money: 3, knowledge: ['The storeroom job was agreed at six coins total, half before work and half when the shelves are fitted.'], setFlags: ['written_half_now_terms'], historyFlags: ['confirmed_wage_terms_in_writing'] } },
      { id: 'declineHalfNow', label: 'Decline the job', next: 'declinedOffer' },
    ] },
    storeroom: { id: 'storeroom', title: 'The Work Has Grown', tone: 'warning', text: 'Behind the first shelf, you find the wall is damp and one board has split. The carpenter asks you to fit extra braces and a second shelf for the same total. The original work remains possible; this is a new request, not a danger.', choices: [
      { id: 'renegotiateTerms', label: 'Set a new price for the extra work', hint: 'The carpenter may agree or keep the job to its original size.', timeCost: 5, chance: { probability: 0.78, successNext: 'renegotiated', failureNext: 'keptOriginal', successMessage: 'The carpenter agrees to add two coins for the added braces.', failureMessage: 'The carpenter cannot add coin, but agrees the original shelves are still the whole job.', successEffects: { money: 2, historyFlags: ['renegotiated_after_job_scope_changed'] }, failureEffects: { historyFlags: ['held_employer_to_original_scope'] } } },
      { id: 'finishOriginalScope', label: 'Finish only the shelves first agreed', hint: 'You keep the original price and leave the added shelf undone.', timeCost: 90, next: 'originalTermsFinished', effects: { money: 3, historyFlags: ['completed_work_to_original_terms'] } },
      { id: 'acceptCanvasInstead', label: 'Take a waxed canvas sheet for the extra work', hint: 'The carpenter offers it from the shop stock instead of more coin.', requirements: { notItems: ['waxedCanvasSheet'] }, timeCost: 90, next: 'canvasPayment', effects: { money: 1, gainItems: ['waxedCanvasSheet'], historyFlags: ['accepted_goods_for_added_work'] } },
      { id: 'quitWithAdvance', label: 'Stop and keep the advance for work done', hint: 'You have already worked for part of the advance; the carpenter accepts that settlement.', timeCost: 5, next: 'quitPaid', effects: { historyFlags: ['quit_after_scope_changed_with_partial_pay'] } },
    ] },
    declinedOffer: ending('declinedOffer', 'Terms Declined', 'You leave before taking the advance. The carpenter hires another hand, and you owe nothing.'),
    renegotiated: ending('renegotiated', 'A New Agreement', 'The added work is put on the tally for two more coins. You finish the shelves and braces, then receive the additional pay alongside the agreed balance.'),
    keptOriginal: ending('keptOriginal', 'The Original Job Remains', 'The carpenter cannot pay for more work, so the extra shelf is left for another day. You complete the original shelves and receive the remaining three coins.'),
    originalTermsFinished: ending('originalTermsFinished', 'The Agreed Work Is Done', 'The first shelves are fitted, and you receive the remaining three coins. The damp wall and extra shelf remain for the carpenter to plan separately.'),
    canvasPayment: ending('canvasPayment', 'Goods for Added Work', 'The carpenter gives you one coin and the waxed canvas sheet from the shop stock. The extra work is finished, and the tool remains yours to carry or leave behind.'),
    quitPaid: ending('quitPaid', 'A Partial Settlement', 'You keep the advance as pay for the hours already worked and leave the added shelf undone. The carpenter accepts the settlement; the original agreement is not finished.'),
  },
};

export const SOMEBODY_ELSES_LAND: Scenario = {
  id: 'somebody-elses-land', title: 'Somebody Else’s Land', subtitle: 'A boundary is more than a line in the grass.', startScene: 'ditchWork',
  scenes: {
    ditchWork: { id: 'ditchWork', title: 'Where the Fence Bends', tone: 'warning', text: 'You are paid to clear a shallow drainage ditch along a field. The ditch is on the west side of a fence; a broad oak stands east of it, and an old stone marker sits where the fence bends. One neighbor says the oak and path are theirs. The other says the boundary follows the old ditch. Both stand on their own sides and ask what you think.', choices: [
      { id: 'inspectMarker', label: 'Look at the stone marker and fence line', hint: 'The marker is visible from the ditch; it may show where the fence once ran.', timeCost: 5, next: 'markerEvidence', effects: { knowledge: ['A stone marker and older fence line can show where a boundary was maintained, but may not settle ownership by themselves.'] } },
      { id: 'hearBothAccounts', label: 'Ask each neighbor how the line was agreed', hint: 'Listen to both accounts before offering an opinion.', timeCost: 6, next: 'twoAccounts' },
      { id: 'finishDitchAway', label: 'Clear only the agreed section of ditch', hint: 'Stay west of the fence and leave the boundary question to them.', timeCost: 45, next: 'workFinished', effects: { money: 3, historyFlags: ['kept_work_clear_of_land_dispute'] } },
      { id: 'leaveBoundary', label: 'Stop work and leave the dispute alone', next: 'leftBoundary', effects: { historyFlags: ['declined_to_take_sides_in_land_dispute'] } },
    ] },
    markerEvidence: { id: 'markerEvidence', title: 'An Older Line', tone: 'safe', text: 'The stone marker sits in line with two older posts, while the newer fence makes a shallow bend around the oak. This supports the ditch-side account, but you do not know who placed the marker or whether either neighbor agreed to move the line.', choices: [
      { id: 'measurePostSpacing', label: 'Compare the old post spacing with your folding rule', hint: 'A matching distance supports the old line, not legal ownership.', requirements: { items: ['joinersFoldingRule'] }, timeCost: 3, next: 'limitedEvidence', effects: { knowledge: ['The old fence posts follow an even spacing past the stone marker; this supports a former line but does not prove who owns the oak.'] } },
      { id: 'suggestSharedPath', label: 'Suggest keeping the path open while they check records', hint: 'The path can remain usable without deciding the oak today.', next: 'sharedAccess', effects: { historyFlags: ['suggested_shared_access_during_boundary_dispute'] } },
      { id: 'finishAfterMarker', label: 'Return to the ditch work and avoid the boundary', timeCost: 40, next: 'workFinished', effects: { money: 3, historyFlags: ['kept_work_clear_of_land_dispute'] } },
    ] },
    twoAccounts: { id: 'twoAccounts', title: 'Two Memories', tone: 'safe', text: 'One neighbor remembers the fence running straight past the oak. The other says the fence was moved after a flood and points to a dry channel where water once ran. Both accounts could be honest; neither has a deed at hand.', choices: [
      { id: 'suggestSharedAccess', label: 'Keep the path open until they compare records', next: 'sharedAccess', effects: { historyFlags: ['suggested_shared_access_during_boundary_dispute'] } },
      { id: 'finishWorkAfterAccounts', label: 'Return to the ditch work', timeCost: 40, next: 'workFinished', effects: { money: 3, historyFlags: ['kept_work_clear_of_land_dispute'] } },
      { id: 'leaveAfterAccounts', label: 'Leave without deciding', next: 'leftBoundary', effects: { historyFlags: ['declined_to_take_sides_in_land_dispute'] } },
    ] },
    limitedEvidence: ending('limitedEvidence', 'A Clue, Not a Verdict', 'The old spacing is consistent beyond the marker, but it cannot tell you who owns the tree or whether the agreement changed. The neighbors agree to check old papers before moving the fence.'),
    sharedAccess: ending('sharedAccess', 'Room for Both', 'The neighbors agree to leave the path open for now and mark the oak as disputed. Neither gives up a claim, but no one moves the fence or blocks the ditch while they look for an older agreement.'),
    workFinished: ending('workFinished', 'The Ditch Is Clear', 'You finish the agreed section of ditch and receive three coins. The boundary remains for the neighbors to settle; you have not moved the fence or claimed the oak.'),
    leftBoundary: ending('leftBoundary', 'No Side Taken', 'You leave the neighbors on their own land. Their disagreement remains, but the ditch and path are not disturbed.'),
  },
};

export const THE_PAWNED_TOOL: Scenario = {
  id: 'the-pawned-tool', title: 'The Pawned Tool', subtitle: 'A low price, and a story with a gap.', startScene: 'stall',
  diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
  runRandomSelections: [{ id: 'sellerAccount', values: [{ value: 'inheritance' }, { value: 'auction' }, { value: 'unclear', weight: 2 }] }],
  scenes: {
    stall: { id: 'stall', title: 'A Rule for Two Coins', tone: 'warning', text: 'At a roadside market, a seller offers a joiner’s folding rule for two coins—less than the tool appears to be worth. The seller says they need coin before leaving town. The hardwood rule is in their hand; its brass hinge moves freely and a maker’s mark is partly worn. You have not seen a claim ticket or proof of purchase.', choices: [
      { id: 'askSellerAccount', label: 'Ask how the rule came to them', timeCost: 2, next: 'sellerAccount' },
      { id: 'inspectMakerMark', label: 'Inspect the worn maker’s mark', hint: 'A mark may identify a workshop, not the present owner.', timeCost: 3, next: 'markSeen', effects: { knowledge: ['The folding rule’s maker’s mark is partly worn and identifies no current owner.'] } },
      { id: 'buyRule', label: 'Buy the rule for two coins', hint: 'The seller accepts your payment, but ownership is not proven.', requirements: { minMoney: 2, notItems: ['joinersFoldingRule'] }, timeCost: 2, next: 'boughtPawnedRule', effects: { money: -2, gainItems: ['joinersFoldingRule'], historyFlags: ['bought_joiners_rule_after_uncertain_ownership_account'] } },
      { id: 'declineRule', label: 'Decline the offer and move on', next: 'declinedRule' },
    ] },
    sellerAccount: { id: 'sellerAccount', title: 'A Partial Account', tone: 'safe', text: 'The seller explains where the tool came from, but the account does not settle ownership.', textVariants: [
      { requirements: { selections: { sellerAccount: 'inheritance' } }, text: 'The seller says the rule came from a relative’s workshop after the relative died. The rest of the tools were divided among family, but this one has no name scratched into it and no paper came with it.' },
      { requirements: { selections: { sellerAccount: 'auction' } }, text: 'The seller says they bought the rule in a mixed lot at a village auction. The auction list only said “old hand tools”; no buyer’s name was kept.' },
      { requirements: { selections: { sellerAccount: 'unclear' } }, text: 'The seller says it was among tools left at a lodging house. They asked around for a day, found no claimant, and now need coin. You cannot verify the story.' },
    ], choices: [
      { id: 'buyAfterAccount', label: 'Buy it, accepting the uncertainty', hint: 'The low price is real; so is the chance that someone may later claim it.', requirements: { minMoney: 2, notItems: ['joinersFoldingRule'] }, timeCost: 2, next: 'boughtPawnedRule', effects: { money: -2, gainItems: ['joinersFoldingRule'], historyFlags: ['bought_joiners_rule_after_uncertain_ownership_account'] } },
      { id: 'askMarketKeeper', label: 'Leave it with the market keeper for a day', hint: 'A claimant can ask for it; the seller may lose today’s sale.', timeCost: 2, next: 'heldForClaim', effects: { historyFlags: ['held_pawned_tool_for_possible_owner'] } },
      { id: 'walkAfterStory', label: 'Thank the seller and decline', next: 'declinedRule' },
    ] },
    markSeen: { id: 'markSeen', title: 'A Workshop Mark', tone: 'safe', text: 'The worn stamp names a small joinery shop that closed years ago. It is not a name, date, or receipt, and it cannot show whether the seller inherited or bought the tool.', choices: [
      { id: 'buyAfterMark', label: 'Buy it, accepting the uncertainty', hint: 'No mark can settle ownership; the price is two coins.', requirements: { minMoney: 2, notItems: ['joinersFoldingRule'] }, timeCost: 2, next: 'boughtPawnedRule', effects: { money: -2, gainItems: ['joinersFoldingRule'], historyFlags: ['bought_joiners_rule_after_uncertain_ownership_account'] } },
      { id: 'holdAfterMark', label: 'Ask the market keeper to hold it briefly', next: 'heldForClaim', effects: { historyFlags: ['held_pawned_tool_for_possible_owner'] } },
      { id: 'declineAfterMark', label: 'Leave the tool with the seller', next: 'declinedRule' },
    ] },
    boughtPawnedRule: ending('boughtPawnedRule', 'A Rule in Your Kit', 'You pay two coins and accept the rule with the seller’s account still uncertain. Its hinge is sound and its maker’s mark is old, but neither proves who has the better claim.'),
    heldForClaim: ending('heldForClaim', 'A Day to Ask Around', 'The market keeper agrees to hold the rule until evening. The seller leaves without the two coins; anyone who claims it must describe the tool and its missing brass hinge pin.'),
    declinedRule: ending('declinedRule', 'No Purchase Made', 'You leave the rule with its seller. They may have needed coin, may have misunderstood its value, or may not have had the right to sell it; you do not decide which.'),
  },
};

export const LAST_ROOM_HIGHER_PRICE: Scenario = {
  id: 'last-room-higher-price', title: 'Last Room, Higher Price', subtitle: 'Weather, scarcity, and what you can afford.', startScene: 'innDoor',
  timePhases: [{ id: 'storm', label: 'Rain at the inn', atMinutes: 0 }, { id: 'night', label: 'Night', atMinutes: 20 }],
  scenes: {
    innDoor: { id: 'innDoor', title: 'The Last Bed', tone: 'warning', text: 'Rain drums on the inn porch. The keeper says one private room remains and raises its price from two coins to four: the other rooms filled before the storm, and the road is becoming unpleasant. A traveler beside the stove asks whether anyone will share. The keeper also mentions a common room bench and a covered stable loft; neither is as warm or private as the room.', choices: [
      { id: 'payFullRoom', label: 'Pay four coins for the private room', requirements: { minMoney: 4 }, timeCost: 2, next: 'privateRoom', effects: { money: -4, historyFlags: ['paid_storm_price_for_private_room'] } },
      { id: 'negotiateRoom', label: 'Offer three coins for the room', hint: 'The keeper may accept or hold to the posted storm price.', requirements: { minMoney: 3 }, timeCost: 2, chance: { probability: 0.58, successNext: 'privateRoomDiscount', failureNext: 'roomAlternatives', successMessage: 'The keeper accepts three coins, explaining that the empty room earns nothing.', failureMessage: 'The keeper politely keeps the four-coin price; the alternatives remain open.', successEffects: { money: -3, historyFlags: ['negotiated_inn_room_price'] }, failureEffects: { historyFlags: ['innkeeper_held_storm_room_price'] } } },
      { id: 'askForAlternatives', label: 'Ask about sharing or the common room', timeCost: 1, next: 'roomAlternatives' },
      { id: 'stayUnderPorch', label: 'Wait under the covered porch', hint: 'You stay dry but do not get a bed; the road may be passable in the morning.', next: 'porchNight', effects: { historyFlags: ['chose_free_shelter_over_inn_room'] } },
    ] },
    roomAlternatives: { id: 'roomAlternatives', title: 'Other Places to Sleep', tone: 'safe', text: 'The traveler offers to split the private room for two coins each. The keeper offers the common room bench for one coin, or a dry stable loft for no coin if you help carry morning feed. All are sheltered; only the private room is quiet.', choices: [
      { id: 'shareRoom', label: 'Share the room for two coins', requirements: { minMoney: 2 }, timeCost: 2, next: 'sharedRoom', effects: { money: -2, historyFlags: ['shared_inn_room_cost'] } },
      { id: 'commonRoom', label: 'Take the common room bench for one coin', requirements: { minMoney: 1 }, timeCost: 2, next: 'commonBench', effects: { money: -1, historyFlags: ['chose_common_room_over_price'] } },
      { id: 'stableLoft', label: 'Take the stable loft and help at dawn', timeCost: 2, next: 'stableSleep', effects: { historyFlags: ['traded_morning_labor_for_shelter'] } },
      { id: 'porchInstead', label: 'Stay under the covered porch', next: 'porchNight', effects: { historyFlags: ['chose_free_shelter_over_inn_room'] } },
    ] },
    privateRoom: ending('privateRoom', 'A Dry Night', 'You pay four coins and take the last private room. The keeper checks the latch and leaves you to rest while the storm passes.'),
    privateRoomDiscount: ending('privateRoomDiscount', 'A Room at a Compromise', 'You pay three coins. The keeper gives up one coin rather than let the room stand empty, and you have privacy for the night.'),
    sharedRoom: ending('sharedRoom', 'Half the Cost', 'You and the other traveler split the room and its cost. The innkeeper collects two coins from each; both of you stay warm and dry.'),
    commonBench: ending('commonBench', 'A Place by the Stove', 'You pay one coin for the common room bench. It is crowded and noisy, but sheltered from the rain.'),
    stableSleep: ending('stableSleep', 'A Bed in the Loft', 'The stable loft is dry and the keeper shows you the ladder before you climb. At dawn you carry a basket of feed in exchange for the night’s shelter.'),
    porchNight: ending('porchNight', 'A Dry Place to Wait', 'You stay beneath the inn’s covered porch. It is not a bed, but it keeps the worst rain off until the road can be judged in morning light.'),
  },
};

export const WHO_OWNS_THE_MULE: Scenario = {
  id: 'who-owns-the-mule', title: 'Who Owns the Mule?', subtitle: 'Two claims, one animal, and incomplete evidence.', startScene: 'stableYard',
  runRandomSelections: [{ id: 'muleMark', values: [{ value: 'clearMark' }, { value: 'wornMark' }, { value: 'noMark', weight: 2 }] }],
  scenes: {
    stableYard: { id: 'stableYard', title: 'Two Claims at the Trough', tone: 'warning', text: 'A gray mule stands tied at a water trough in the stable yard. A carter on the road side says it was hired from him that morning; a stable worker at the open gate says the mule belongs to the stable. The lead rope is tied to the trough rail, and neither person is holding it. They ask you to help decide who may take the animal.', textVariants: [
      { requirements: { selections: { muleMark: 'clearMark' } }, text: 'A gray mule stands tied at a water trough. Its left shoulder bears a visible but ordinary brand; a carter says it is hired, while the stable worker claims it belongs to the stable. The lead is tied to the trough rail, and neither person holds it.' },
      { requirements: { selections: { muleMark: 'wornMark' } }, text: 'A gray mule stands tied at a water trough. A healed patch interrupts the brand on its left shoulder; a carter says it is hired, while the stable worker claims it belongs to the stable. The lead is tied to the trough rail, and neither holds it.' },
      { requirements: { selections: { muleMark: 'noMark' } }, text: 'A gray mule stands tied at a water trough with no readable brand. A carter says it is hired, while the stable worker claims it belongs to the stable. The lead is tied to the trough rail, and neither person holds it.' },
    ], choices: [
      { id: 'inspectMark', label: 'Look at the mule’s visible brand', hint: 'A mark may identify a stable, but not prove the current agreement.', timeCost: 3, next: 'markInspected', effects: { knowledge: ['A mule’s brand may show where it was marked, but not who currently owns or hired it.'] } },
      { id: 'askBothClaims', label: 'Ask each person for their account', timeCost: 4, next: 'claimsHeard' },
      { id: 'checkTack', label: 'Look over the halter and lead rope', hint: 'Tack can suggest recent use; it is not proof of ownership.', timeCost: 3, next: 'tackInspected' },
      { id: 'keepMuleSafe', label: 'Leave the mule tied and call the stable keeper', hint: 'No one takes the animal until someone with the yard ledger arrives.', timeCost: 2, next: 'neutralHold', effects: { historyFlags: ['kept_disputed_animal_safe_pending_records'] } },
    ] },
    markInspected: { id: 'markInspected', title: 'A Mark with Limits', tone: 'safe', text: 'You inspect the shoulder from beside the trough, without forcing the mule to turn.', textVariants: [
      { requirements: { selections: { muleMark: 'clearMark' } }, text: 'The brand is clear enough to show it was marked at a nearby stable several years ago. That could fit either account: the stable worker may have kept it, or the mule may have been hired out.' },
      { requirements: { selections: { muleMark: 'wornMark' } }, text: 'The brand is partly lost beneath a healed patch. It might have been a stable mark, but you cannot read it confidently.' },
      { requirements: { selections: { muleMark: 'noMark' } }, text: 'There is no readable brand on the shoulder. The absence tells you little about who owns the mule.' },
    ], choices: [
      { id: 'holdForLedger', label: 'Wait for the yard ledger before anyone leads it away', timeCost: 2, next: 'neutralHold', effects: { historyFlags: ['kept_disputed_animal_safe_pending_records'] } },
      { id: 'hearClaimsAfterMark', label: 'Ask both people for their account', timeCost: 3, next: 'claimsHeard' },
      { id: 'declineAfterMark', label: 'Leave the decision to the stable keeper', next: 'declinedMule' },
    ] },
    claimsHeard: { id: 'claimsHeard', title: 'Two Plausible Accounts', tone: 'safe', text: 'The carter says he paid for a day’s hire and brought the mule to the trough. The stable worker says the animal usually carries the stable’s feed and was never lent out. Neither has the yard ledger with them. The mule accepts a handful of oats from both people.', choices: [
      { id: 'waitForLedger', label: 'Keep the mule here until the ledger arrives', hint: 'A written entry may clarify the hire, though it may not settle ownership.', timeCost: 5, next: 'neutralHold', effects: { historyFlags: ['kept_disputed_animal_safe_pending_records'] } },
      { id: 'askForWitness', label: 'Ask the stable keeper to check with the morning staff', hint: 'A person who saw the handover may help, but might remember only part of it.', timeCost: 8, next: 'witnessUncertain', effects: { historyFlags: ['sought_witness_for_property_claim'] } },
      { id: 'declineAfterClaims', label: 'Decline to decide between them', next: 'declinedMule' },
    ] },
    tackInspected: { id: 'tackInspected', title: 'A Familiar Halter', tone: 'safe', text: 'The halter is patched with stable-yard leather, but the lead rope is newer. Either person could have borrowed or replaced the tack. The mule stands quietly and turns toward both voices when called.', choices: [
      { id: 'holdAfterTack', label: 'Keep the mule here until the ledger arrives', timeCost: 4, next: 'neutralHold', effects: { historyFlags: ['kept_disputed_animal_safe_pending_records'] } },
      { id: 'hearClaimsAfterTack', label: 'Ask both people for their account', timeCost: 3, next: 'claimsHeard' },
      { id: 'declineAfterTack', label: 'Leave the decision to the stable keeper', next: 'declinedMule' },
    ] },
    neutralHold: ending('neutralHold', 'The Mule Stays Put', 'The mule remains tied beside the trough with water and feed. The keeper checks the yard ledger and asks the morning staff, but the entry names a hire without recording whether the stable had permission to lend it. The claims remain partly unresolved; no one takes the mule by force.'),
    witnessUncertain: ending('witnessUncertain', 'A Memory, Not a Deed', 'A stable hand remembers seeing the carter lead the mule in, but did not hear what was agreed. The keeper leaves the mule in the yard while the two claimants compare their own records.'),
    declinedMule: ending('declinedMule', 'No Verdict', 'You leave the mule with the stable keeper and make no ruling. The animal remains safe in the yard while the two people sort out their records.'),
  },
};

export const COMMERCE_ADVENTURES: Scenario[] = [PAYMENT_IN_KIND, SHORT_ON_THE_WAGES, MARKET_DAY, THE_HORSE_TRADE, THE_BROKEN_CRATE, HALF_NOW, SOMEBODY_ELSES_LAND, THE_PAWNED_TOOL, LAST_ROOM_HIGHER_PRICE, WHO_OWNS_THE_MULE];
