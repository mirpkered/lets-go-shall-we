import type { Scenario } from '../types';

const done = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });

export const THE_TOWN_PUMP: Scenario = {
  id: 'the-town-pump', title: 'The Town Pump', subtitle: 'A shared source, and a broken handle.', startScene: 'pumpSquare',
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'lateMorning', label: 'Late morning', atMinutes: 35 }, { id: 'noon', label: 'Near noon', atMinutes: 70 }],
  scenes: {
    pumpSquare: { id: 'pumpSquare', title: 'The Dry Pump', tone: 'warning', text: 'At the square, three households wait with empty pails. The public pump stands between them; its handle turns without lifting water. A woman says the well has not run dry before. Until it works, a spring lies a mile down the lane, and every household needs a share.', choices: [
      { id: 'inspectPump', label: 'Look at the pump handle and its fitting', hint: 'The handle turns too freely; the trouble may be simple.', timeCost: 4, next: 'pumpFitting', effects: { knowledge: ['The town pump handle turns freely because its wooden fastening has slipped.'] } },
      { id: 'haulWater', label: 'Organize a turn carrying water from the spring', hint: 'It solves today’s need, but means a long walk for everyone.', timeCost: 12, next: 'waterHauling', effects: { historyFlags: ['organized_shared_water_hauling'] } },
      { id: 'askForTheTool', label: 'Ask whether anyone has a small repair tool', timeCost: 2, next: 'pumpFitting', effects: { knowledge: ['The pump fastening is loose, and a resident has a hand tool for the repair.'] } },
      { id: 'leavePumpSquare', label: 'Leave the households to their own plan', next: 'movedOn' },
    ] },
    pumpFitting: { id: 'pumpFitting', title: 'A Loose Peg', tone: 'safe', text: 'The handle’s wooden peg has worked halfway out of its iron bracket. The households have a small hand tool and a spare peg, but no one has tried the repair. You can help fit it, or set up the spring water while someone else works.', choices: [
      { id: 'useCarriedTool', label: 'Use your Foreman’s Multi-tool on the bracket', hint: 'A suitable tool may make the repair steadier.', requirements: { items: ['foremanMultiTool'] }, timeCost: 10, next: 'pumpWorking', effects: { historyFlags: ['repaired_shared_town_pump_with_tool'] } },
      { id: 'fitSparePeg', label: 'Seat the spare peg with the residents’ tool', hint: 'The simple repair should hold, though the worn bracket may slip again.', timeCost: 12, chance: { probability: 0.78, successNext: 'pumpWorking', failureNext: 'pumpNeedsMoreWork', successMessage: 'The peg seats firmly, and the handle draws water again.', failureMessage: 'The peg slips under pressure. The handle is not damaged, but the repair needs more time.' } },
      { id: 'shareWaterWork', label: 'Help carry spring water while they repair it', timeCost: 12, next: 'waterHauling', effects: { historyFlags: ['helped_supply_shared_water'] } },
      { id: 'stepAway', label: 'Thank them and continue down the road', next: 'movedOn' },
    ] },
    pumpNeedsMoreWork: { id: 'pumpNeedsMoreWork', title: 'The Peg Slips Again', tone: 'warning', text: 'The repair has not held. The households still have the spring, but only a few pails have been brought up. You can join the hauling while they fetch a better fitting, or leave them to divide the work.', choices: [
      { id: 'haulAfterSlip', label: 'Take a turn carrying spring water', timeCost: 12, next: 'waterHauling', effects: { historyFlags: ['helped_supply_shared_water'] } },
      { id: 'leaveAfterSlip', label: 'Leave the households to organize it', next: 'movedOn' },
    ] },
    waterHauling: done('waterHauling', 'Water for the Day', 'Pails pass from hand to hand along the lane. It is slower than a working pump, but each household gets water before the repair is finished. You have done the share of work you chose to take on.'),
    pumpWorking: done('pumpWorking', 'The Pump Draws Again', 'The handle moves with a solid pull, and clear water rises into the first pail. The households agree to keep an eye on the old bracket and take turns with the next repair.'),
    movedOn: done('movedOn', 'On Your Way', 'The households remain by the pump, deciding between the spring and a repair. You continue along the road without taking charge of their choice.'),
  },
};

export const ONE_BOAT_TOO_MANY: Scenario = {
  id: 'one-boat-too-many', title: 'One Boat, Too Many People', subtitle: 'A narrow crossing before the weather turns.', startScene: 'landing',
  timePhases: [{ id: 'clear', label: 'Weather holding', atMinutes: 0 }, { id: 'wind', label: 'Wind rising', atMinutes: 20 }, { id: 'rain', label: 'Rain nearing', atMinutes: 40 }],
  scenes: {
    landing: { id: 'landing', title: 'At the Landing', tone: 'warning', text: 'A ferryman has one small boat on this bank. It can safely carry him and one passenger at a time; the sky over the far ridge is darkening. A peddler, a farmhand, and you all need the far bank for different reasons. The ferryman will make repeated trips only while the weather holds, and none of you has a claim to the first place.', choices: [
      { id: 'askWhoWaits', label: 'Ask the others how urgent their passage is', timeCost: 3, next: 'urgencyShared', effects: { knowledge: ['The farmhand can wait for a message, while the peddler has a delivery due; neither has explained every cost of delay.'] } },
      { id: 'offerToWait', label: 'Offer to wait for the next safe trip', hint: 'You give up the first place without deciding for the others.', timeCost: 5, next: 'waitedTurn', effects: { historyFlags: ['offered_to_wait_for_shared_passage'] } },
      { id: 'askForFirstTrip', label: 'Ask to take the first crossing', hint: 'The ferryman may agree, but the others still need passage.', timeCost: 2, next: 'firstTrip' },
      { id: 'leaveLanding', label: 'Take the longer road around the water', timeCost: 3, next: 'longRoad' },
    ] },
    urgencyShared: { id: 'urgencyShared', title: 'Three Reasons to Cross', tone: 'safe', text: 'The farmhand is carrying a message for a nearby household; the peddler must deliver a parcel before the evening coach. Neither asks you to rank their need. The ferryman says two trips might fit before the weather worsens, but promises no more than that.', choices: [
      { id: 'letPeddlerGo', label: 'Suggest the peddler take the first trip', hint: 'The delivery has a stated deadline; the farmhand may still cross after.', timeCost: 4, next: 'twoTrips', effects: { historyFlags: ['helped_order_shared_ferry_passage'] } },
      { id: 'letFarmhandGo', label: 'Suggest the farmhand take the first trip', hint: 'The message may matter to someone waiting; the peddler may still cross after.', timeCost: 4, next: 'twoTrips', effects: { historyFlags: ['helped_order_shared_ferry_passage'] } },
      { id: 'offerToWaitHere', label: 'Offer your place and let them decide', timeCost: 5, next: 'waitedTurn', effects: { historyFlags: ['offered_to_wait_for_shared_passage'] } },
      { id: 'walkAround', label: 'Take the longer road around the water', timeCost: 3, next: 'longRoad' },
    ] },
    firstTrip: { id: 'firstTrip', title: 'The First Crossing', tone: 'warning', text: 'The ferryman agrees to take you first. The boat rides low enough that he refuses another passenger. The other two wait on the landing as the wind picks up; from the far bank, you cannot promise how many trips remain.', choices: [
      { id: 'askFerrymanReturn', label: 'Ask him to return for the others', timeCost: 12, next: 'ferrymanReturns', effects: { historyFlags: ['asked_ferryman_to_return_for_waiting_travelers'] } },
      { id: 'continueInland', label: 'Continue inland and leave the order to him', next: 'crossedAlone' },
    ] },
    twoTrips: { id: 'twoTrips', title: 'Two Trips, If the Wind Holds', tone: 'warning', text: 'The ferryman takes the chosen traveler across and returns once. The wind has roughened the water. He says he can attempt one last crossing, but will not risk a second passenger in the boat.', choices: [
      { id: 'takeLastSeat', label: 'Take the last safe place', hint: 'The other traveler stays on this bank if you go.', timeCost: 12, next: 'crossedAlone', effects: { historyFlags: ['took_last_safe_ferry_place'] } },
      { id: 'leaveLastSeat', label: 'Give the last place to the waiting traveler', timeCost: 12, next: 'waitedTurn', effects: { historyFlags: ['gave_last_safe_ferry_place_to_another'] } },
      { id: 'waitWeather', label: 'Wait on the landing until the wind settles', timeCost: 15, next: 'weatherDelay', effects: { historyFlags: ['waited_out_ferry_weather'] } },
    ] },
    ferrymanReturns: done('ferrymanReturns', 'A Return Crossing', 'The ferryman makes the return trip as promised, though the landing is slick and the delay costs you much of the afternoon. The travelers decide among themselves who takes the remaining seat.'),
    waitedTurn: done('waitedTurn', 'A Place for Someone Else', 'You wait on the landing instead of claiming passage. The ferryman and travelers decide who goes next; the darkening water may delay your crossing.'),
    longRoad: done('longRoad', 'The Long Way Round', 'The road follows the water to a bridge several miles upstream. It costs time and a little daylight, but carries no risk from the rising wind.'),
    crossedAlone: done('crossedAlone', 'Across the Water', 'You reach the far bank. The people left at the landing remain visible in the distance, with the ferryman deciding whether conditions allow another trip.'),
    weatherDelay: done('weatherDelay', 'Waiting for the Wind', 'The wind eases enough for the ferryman to resume cautious crossings. You wait with the others rather than pressuring him to risk the boat.'),
  },
};

export const THE_MEETING_HALL: Scenario = {
  id: 'the-meeting-hall', title: 'The Meeting Hall', subtitle: 'A practical question brings the neighbors together.', startScene: 'openMeeting',
  runRandomSelections: [{ id: 'meetingMatter', values: [{ value: 'road' }, { value: 'fuel' }, { value: 'livestock' }] }],
  scenes: {
    openMeeting: { id: 'openMeeting', title: 'An Open Door', tone: 'safe', text: 'Rain drives you beneath the meeting hall’s eaves. Inside, neighbors have gathered around a plain table to settle one practical matter before the week is out. No one knows you, and no one expects you to decide it; you are welcome to listen, offer a hand, speak briefly, or keep walking.', textVariants: [
      { requirements: { selections: { meetingMatter: 'road' } }, text: 'Rain drives you beneath the meeting hall’s eaves. Neighbors are discussing a rut deep enough to catch a wagon wheel on the east road. No one knows you, and no one expects you to decide it; you may listen, offer a hand, speak briefly, or keep walking.' },
      { requirements: { selections: { meetingMatter: 'fuel' } }, text: 'Rain drives you beneath the meeting hall’s eaves. Neighbors are comparing how much firewood each household can spare before winter. No one knows you, and no one expects you to decide it; you may listen, offer a hand, speak briefly, or keep walking.' },
      { requirements: { selections: { meetingMatter: 'livestock' } }, text: 'Rain drives you beneath the meeting hall’s eaves. Neighbors are working out how to keep two shared grazing gates mended before the cattle move pasture. No one knows you, and no one expects you to decide it; you may listen, offer a hand, speak briefly, or keep walking.' },
    ], choices: [
      { id: 'listen', label: 'Listen before saying anything', timeCost: 8, next: 'heardAccounts', effects: { knowledge: ['A village meeting can clarify who has offered labor and what remains uncertain; listening alone does not settle the matter.'], historyFlags: ['listened_before_speaking_at_community_meeting'] } },
      { id: 'offerLabor', label: 'Offer an hour of practical help', hint: 'You help with the work, not the final decision.', timeCost: 60, next: 'sharedLabor', effects: { historyFlags: ['offered_labor_at_community_meeting'] } },
      { id: 'speakBriefly', label: 'Share one practical suggestion', timeCost: 5, next: 'suggestionHeard', effects: { historyFlags: ['offered_practical_suggestion_at_community_meeting'] } },
      { id: 'leaveMeeting', label: 'Thank them and continue on', next: 'movedOn' },
    ] },
    heardAccounts: { id: 'heardAccounts', title: 'What the Neighbors Know', tone: 'safe', text: 'One neighbor describes the problem; another admits they have not seen it firsthand. The group has enough to choose a small next step, but not enough to settle every question about cost or responsibility.', choices: [
      { id: 'offerLimitedHelp', label: 'Offer a small share of the work', timeCost: 30, next: 'sharedLabor', effects: { historyFlags: ['offered_labor_after_hearing_neighbors'] } },
      { id: 'shareSuggestion', label: 'Suggest checking the facts together', next: 'suggestionHeard' },
      { id: 'leaveAfterListening', label: 'Leave after hearing them out', next: 'movedOn' },
    ] },
    suggestionHeard: done('suggestionHeard', 'A Suggestion, Not a Verdict', 'The neighbors consider your suggestion, then continue the discussion among themselves. You leave the meeting to the people who live with its result.'),
    sharedLabor: done('sharedLabor', 'A Hand Among Many', 'You lend a hand beside the neighbors. The practical burden is smaller, though the community still decides together what to do next.'),
    movedOn: done('movedOn', 'Back to the Road', 'The meeting continues without you. You have neither taken charge nor stopped the neighbors from deciding for themselves.'),
  },
};

export const WHAT_DID_YOU_SEE: Scenario = {
  id: 'what-did-you-see', title: 'What Did You See?', subtitle: 'A careful account matters more than a confident guess.', startScene: 'roadsideQuestion',
  runRandomSelections: [{ id: 'cartIncident', values: [{ value: 'wheel' }, { value: 'driver' }, { value: 'road' }] }],
  scenes: {
    roadsideQuestion: { id: 'roadsideQuestion', title: 'A Question at the Roadside', tone: 'safe', text: 'A small cart sits on its side beyond the road edge. The driver is safe; two neighbors disagree about how it tipped. They ask what you saw, not whose fault it was.', textVariants: [
      { requirements: { historyFlags: ['gave_limited_horse_trade_opinion'], selections: { cartIncident: 'wheel' } }, text: 'A small cart is on its side. You saw its left wheel strike a buried stone. A past horse-trade question taught you to report what you saw, not what you assume; two neighbors ask for your account.' },
      { requirements: { historyFlags: ['gave_limited_horse_trade_opinion'], selections: { cartIncident: 'driver' } }, text: 'A small cart is on its side. You saw the driver pull the reins just before it tipped, but not the far wheel. A past horse-trade question taught you to report what you saw, not what you assume; two neighbors ask for your account.' },
      { requirements: { historyFlags: ['gave_limited_horse_trade_opinion'], selections: { cartIncident: 'road' } }, text: 'A small cart is on its side. You saw loose gravel slide under the near wheel, but not what the driver did. A past horse-trade question taught you to report what you saw, not what you assume; two neighbors ask for your account.' },
      { requirements: { selections: { cartIncident: 'wheel' } }, text: 'A small cart is on its side. You saw its left wheel strike a buried stone. Two neighbors disagree about how it tipped and ask what you saw, not whose fault it was.' },
      { requirements: { selections: { cartIncident: 'driver' } }, text: 'A small cart is on its side. You saw the driver pull the reins just before it tipped, but not the far wheel. Two neighbors disagree about how it tipped and ask what you saw, not whose fault it was.' },
      { requirements: { selections: { cartIncident: 'road' } }, text: 'A small cart is on its side. You saw loose gravel slide under the near wheel, but not what the driver did. Two neighbors disagree about how it tipped and ask what you saw, not whose fault it was.' },
    ], choices: [
      { id: 'rememberWheelStone', label: 'Report the wheel striking a stone', requirements: { selections: { cartIncident: 'wheel' } }, timeCost: 2, next: 'wheelMemory', effects: { setFlags: ['remembered_cart_wheel'], knowledge: ['At the roadside, you saw the cart wheel strike a buried stone; that alone does not prove why the cart tipped.'] } },
      { id: 'rememberRoadGravel', label: 'Report gravel sliding under the wheel', requirements: { selections: { cartIncident: 'road' } }, timeCost: 2, next: 'wheelMemory', effects: { setFlags: ['remembered_cart_wheel'], knowledge: ['At the roadside, you saw loose gravel slide under the near wheel; that alone does not prove why the cart tipped.'] } },
      { id: 'rememberDriver', label: 'Report the driver pulling the reins', requirements: { selections: { cartIncident: 'driver' } }, timeCost: 2, next: 'driverMemory', effects: { setFlags: ['remembered_driver_action'], knowledge: ['At the roadside, you saw the driver pull the reins before the cart tipped; that alone does not prove why it happened.'] } },
      { id: 'declineAccount', label: 'Say you cannot give a useful account', next: 'noStatement', effects: { historyFlags: ['declined_uncertain_roadside_testimony'] } },
    ] },
    wheelMemory: { id: 'wheelMemory', title: 'The Wheel You Watched', tone: 'safe', text: 'You hold to the part of the moment you actually watched. A wheel can hit a stone or slip on gravel without proving what else contributed.', textVariants: [
      { requirements: { selections: { cartIncident: 'wheel' } }, text: 'You remember the left wheel striking a buried stone. You did not see how the load was tied, so you cannot say whether it shifted.' },
      { requirements: { selections: { cartIncident: 'road' } }, text: 'You remember loose gravel sliding under the near wheel. You cannot say whether the gravel began the tip or only worsened it.' },
      { requirements: { selections: { cartIncident: 'driver' } }, text: 'You did not get a clear look at the wheel. You can say only that the cart tipped after the driver pulled the reins.' },
    ], choices: [
      { id: 'giveWheelAccount', label: 'State only what you remember', next: 'carefulAccount', effects: { historyFlags: ['gave_limited_cart_witness_account'] } },
      { id: 'clarifyUncertainty', label: 'Explain what you could not see', next: 'uncertainAccount', effects: { historyFlags: ['marked_limits_of_cart_witness_account'] } },
    ] },
    driverMemory: { id: 'driverMemory', title: 'The Driver’s Hands', tone: 'safe', text: 'You separate the driver’s movement from its cause. A sharp pull might be a reaction to the cart already tipping; you cannot say what the neighbors should conclude.', textVariants: [
      { requirements: { selections: { cartIncident: 'driver' } }, text: 'You remember the driver pulling the reins sharply just before the cart tipped. You could not see what was under the far wheel.' },
      { requirements: { selections: { cartIncident: 'wheel' } }, text: 'You did not see the driver’s hands clearly. You can still tell the neighbors exactly where your view failed.' },
      { requirements: { selections: { cartIncident: 'road' } }, text: 'Your attention was on the gravel under the wheel. You cannot say what the driver did.' },
    ], choices: [
      { id: 'giveDriverAccount', label: 'State only what you remember', next: 'carefulAccount', effects: { historyFlags: ['gave_limited_cart_witness_account'] } },
      { id: 'admitPoorView', label: 'Say your view was too poor to help', next: 'uncertainAccount', effects: { historyFlags: ['marked_limits_of_cart_witness_account'] } },
    ] },
    carefulAccount: { id: 'carefulAccount', title: 'A Narrow Account', tone: 'safe', text: 'You describe only the detail you remember. The neighbors change what they claim, but neither can turn your limited view into a verdict.', textVariants: [
      { requirements: { selections: { cartIncident: 'wheel' } }, text: 'You report the left wheel striking a buried stone. The neighbor who blamed the driver pauses: the stone was there, but no one saw whether the load shifted first. They agree to inspect the wheel and its lashings before deciding what caused the tip.' },
      { requirements: { selections: { cartIncident: 'driver' } }, text: 'You report the driver pulling the reins just before the cart tipped. One neighbor says that may have started it; the other points out it could have been a reaction. They narrow the question to what happened first, without calling your account a verdict.' },
      { requirements: { selections: { cartIncident: 'road' } }, text: 'You report loose gravel sliding beneath the near wheel. One neighbor stops calling the road firm; the other notes you could not see the far wheel. They agree to inspect the track before assigning a cause.' },
    ], ending: 'success', choices: [] },
    uncertainAccount: done('uncertainAccount', 'An Honest Limit', 'You explain what you could not see. The neighbors stop using your silence as support for either claim; they agree to inspect the cart and ask someone who saw the far wheel. The cause remains open, but the next question is narrower.'),
    noStatement: done('noStatement', 'No Useful Account', 'You decline to supply a detail you cannot honestly support. One neighbor nods and asks a wagoner who was closer; neither treats your refusal as evidence against the other.'),
  },
};

export const THE_BURNT_BARN_FUND: Scenario = {
  id: 'the-burnt-barn-fund', title: 'The Burnt Barn Fund', subtitle: 'A family needs help, and the offer is yours to make.', startScene: 'barnyard',
  scenes: {
    barnyard: { id: 'barnyard', title: 'After the Fire', tone: 'safe', text: 'A family’s small barn burned the previous evening. The fire is out; no one was hurt, and the cause is not in question here. Neighbors have set a box on a dry bench for voluntary coin, and a few are offering repair labor. The family asks for neither pity nor a promise.', choices: [
      { id: 'donateOne', label: 'Add one coin to the repair fund', requirements: { minMoney: 1 }, timeCost: 1, next: 'donated', effects: { money: -1, historyFlags: ['donated_to_burnt_barn_repair'] } },
      { id: 'donateThree', label: 'Add three coins to the repair fund', requirements: { minMoney: 3 }, timeCost: 1, next: 'donatedMore', effects: { money: -3, historyFlags: ['made_larger_barn_repair_donation'] } },
      { id: 'offerLabor', label: 'Offer an hour clearing safe, cold debris', timeCost: 60, next: 'laborOffered', effects: { historyFlags: ['offered_labor_after_barn_fire'] } },
      { id: 'declineFund', label: 'Wish them well and keep your coin', next: 'movedOn' },
    ] },
    donated: done('donated', 'A Small Contribution', 'The coin goes into the box with the others. It will buy nails and a little timber; the neighbors make no tally of who gave what.'),
    donatedMore: done('donatedMore', 'A Larger Share', 'Your three coins join the repair fund. Others are contributing what they can, and the family remains free to decide how to rebuild.'),
    laborOffered: done('laborOffered', 'A Useful Hour', 'You help carry cold, charred boards to a safe pile. The work is modest and the family accepts it without treating it as a debt.'),
    movedOn: done('movedOn', 'A Private Choice', 'You leave the neighbors to their voluntary collection. No one records your decision or asks you to explain it.'),
  },
};

export const WINTER_STORES: Scenario = {
  id: 'winter-stores', title: 'Winter Stores', subtitle: 'Not enough for comfort, perhaps enough with care.', startScene: 'storehouse',
  timePhases: [{ id: 'counting', label: 'Taking stock', atMinutes: 0 }, { id: 'afternoon', label: 'The day wears on', atMinutes: 45 }, { id: 'evening', label: 'Evening', atMinutes: 90 }],
  scenes: {
    storehouse: { id: 'storehouse', title: 'The Shared Granary', tone: 'warning', text: 'In a small settlement, the shared store has enough grain and beans for several weeks, but less than the neighbors expected. No one is starving today. A supply wagon may come late, and the households disagree about whether to ration now or seek more supplies while roads remain passable.', choices: [
      { id: 'countStores', label: 'Help count the sacks and barrels', timeCost: 12, next: 'storesCounted', effects: { knowledge: ['The shared winter store has several weeks of grain and beans; no count can promise when a supply wagon will arrive.'], historyFlags: ['helped_count_shared_winter_stores'] } },
      { id: 'suggestRation', label: 'Suggest modest portions until the road clears', next: 'rationPlan', effects: { historyFlags: ['suggested_careful_shared_rations'] } },
      { id: 'offerToTrade', label: 'Offer to help seek a nearby trade', timeCost: 5, next: 'tradePlan', effects: { historyFlags: ['offered_help_finding_winter_trade'] } },
      { id: 'leaveStores', label: 'Leave the neighbors to their decision', next: 'movedOn' },
    ] },
    storesCounted: { id: 'storesCounted', title: 'A Better Count', tone: 'safe', text: 'The sacks hold enough for about three weeks at the current portions. A smaller measure would stretch them, while a trade would cost coin and depend on the road. The count helps, but no choice removes uncertainty.', choices: [
      { id: 'shareRationSuggestion', label: 'Back a modest reduction for every household', next: 'rationPlan', effects: { historyFlags: ['supported_shared_winter_rations'] } },
      { id: 'joinTradeSearch', label: 'Join a search for nearby supplies', timeCost: 60, next: 'tradePlan', effects: { historyFlags: ['helped_seek_winter_supplies'] } },
      { id: 'finishCounting', label: 'Leave the count with the neighbors', next: 'movedOn' },
    ] },
    rationPlan: { id: 'rationPlan', title: 'A Measured Share', tone: 'warning', text: 'The suggestion meets a real hesitation: one household wants to stretch the stores now, while another worries that smaller portions will burden the youngest first. A measured count can guide them, but it cannot tell them when the wagon will arrive. The neighbors ask what kind of arrangement you meant.', choices: [
      { id: 'trialRations', label: 'Suggest a one-week trial and shared review', next: 'rationTrial' },
      { id: 'seekWagonFirst', label: 'Ask them to seek the wagon before reducing portions', next: 'wagonFirst' },
      { id: 'leaveRationTerms', label: 'Leave each household to decide its share', next: 'rationUnsettled' },
    ] },
    rationTrial: done('rationTrial', 'A Week, Then a Count', 'The households agree to reduce portions a little for one week, then compare the remaining sacks before deciding again. The measure is uncomfortable but shared; it leaves more in reserve if the wagon is late.'),
    wagonFirst: done('wagonFirst', 'One More Search for Supplies', 'The neighbors agree to ask the nearest settlement about a supply wagon before changing portions. They keep the current measure for now, knowing that the road may delay the answer.'),
    rationUnsettled: done('rationUnsettled', 'No Common Measure Yet', 'No shared ration is set. Each household keeps its own count and the neighbors agree to meet again when the road brings news; the shortage remains real, but no one is assigned a plan they did not accept.'),
    tradePlan: done('tradePlan', 'A Search, Not a Promise', 'You travel with a neighbor to ask nearby farms what they can spare. The road may delay a wagon, but the settlement has made a practical attempt without emptying its reserve.'),
    movedOn: done('movedOn', 'The Storehouse Door Closes', 'The neighbors continue their discussion after you leave. The stores remain shared, and no one treats your passing opinion as a binding decision.'),
  },
};

export const THE_ROAD_CREW: Scenario = {
  id: 'the-road-crew', title: 'The Road Crew', subtitle: 'A bad stretch, a few willing hands, and a safer way through.', startScene: 'roadsideWork',
  timePhases: [{ id: 'morning', label: 'Morning work', atMinutes: 0 }, { id: 'midday', label: 'Midday', atMinutes: 45 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 100 }],
  scenes: {
    roadsideWork: { id: 'roadsideWork', title: 'The Deep Rut', tone: 'warning', text: 'A wagon rut has opened beside a narrow culvert on the road into town. No one is trapped, but the next loaded wagon could tip if it uses the edge. Residents have brought stones and timber; they offer four coins for a half-day, or you may help without pay to clear the route you need.', choices: [
      { id: 'takePaidWork', label: 'Join the crew for the agreed four coins', hint: 'The half-day task and pay are stated before you begin.', timeCost: 5, next: 'paidWorksite', effects: { historyFlags: ['joined_paid_road_repair'] } },
      { id: 'helpForPassage', label: 'Help for an hour, then use the road', timeCost: 5, next: 'volunteerWorksite', effects: { historyFlags: ['helped_road_repair_for_passage'] } },
      { id: 'useYourRope', label: 'Offer your Travel Rope to steady the timber', requirements: { items: ['travelRope'] }, timeCost: 35, next: 'ropeWork', effects: { historyFlags: ['used_travel_rope_on_shared_road_repair'] } },
      { id: 'takeDetour', label: 'Take the longer road around the culvert', timeCost: 5, next: 'detour' },
    ] },
    paidWorksite: { id: 'paidWorksite', title: 'Stones and Timber', tone: 'safe', text: 'The crew fills the rut from the solid ground inward. Loose stones shift underfoot, but nobody works beneath the culvert or asks you to lift alone. The agreed four coins are for the half-day; you can use a tool that fits or do the ordinary lifting.', choices: [
      { id: 'useMultiTool', label: 'Use your Foreman’s Multi-tool to trim a brace', requirements: { items: ['foremanMultiTool'] }, timeCost: 25, next: 'paidRoadMended', effects: { money: 4, historyFlags: ['used_tool_on_road_crew'] } },
      { id: 'useFoldingRule', label: 'Use your Folding Rule to match the brace spacing', requirements: { items: ['joinersFoldingRule'] }, timeCost: 20, next: 'paidRoadMended', effects: { money: 4, historyFlags: ['used_folding_rule_on_road_crew'] } },
      { id: 'liftWithCrew', label: 'Set stones with the crew', timeCost: 45, next: 'paidRoadMended', effects: { money: 4, historyFlags: ['helped_set_stones_on_road_crew'] } },
      { id: 'stopForDay', label: 'Stop after the first safe section', next: 'partialRoad' },
    ] },
    volunteerWorksite: { id: 'volunteerWorksite', title: 'A Short Share of Work', tone: 'safe', text: 'You help the residents fill the rut from the solid ground inward. They need only an hour of your time before you use the road; no wage was offered for this shorter share.', choices: [
      { id: 'volunteerWithTool', label: 'Use your Multi-tool to trim the brace', requirements: { items: ['foremanMultiTool'] }, timeCost: 25, next: 'volunteerRoadMended', effects: { historyFlags: ['used_tool_on_road_crew'] } },
      { id: 'volunteerWithRule', label: 'Use your Folding Rule to space the brace', requirements: { items: ['joinersFoldingRule'] }, timeCost: 20, next: 'volunteerRoadMended', effects: { historyFlags: ['used_folding_rule_on_road_crew'] } },
      { id: 'volunteerLift', label: 'Set a few stones with the crew', timeCost: 20, next: 'volunteerRoadMended', effects: { historyFlags: ['helped_set_stones_on_road_crew'] } },
    ] },
    ropeWork: { id: 'ropeWork', title: 'A Steady Pull', tone: 'warning', text: 'You wrap the rope around the timber while two residents guide it from the road. The load is heavy; the line can hold, but a slipping knot could snap back toward the crew.', choices: [
      { id: 'pullTogether', label: 'Pull with the crew on a counted signal', hint: 'A coordinated pull is safer, though the wet timber may still shift.', timeCost: 20, chance: { probability: 0.82, successNext: 'ropeMended', failureNext: 'partialRoad', successMessage: 'The timber settles into place and the crew packs stone beneath it.', failureMessage: 'The timber slips before it is seated. The crew steps clear; the road remains passable only with care.', successEffects: { historyFlags: ['helped_set_road_brace_with_rope'] }, failureEffects: { health: -1, historyFlags: ['road_brace_slipped_during_repair'] } } },
      { id: 'releaseRope', label: 'Set the rope aside and finish with stones', next: 'partialRoad' },
    ] },
    paidRoadMended: done('paidRoadMended', 'A Passable Road', 'The rut is packed and the timber brace holds. The next wagon can cross the culvert without riding its crumbling edge. The crew pays the four coins agreed for the half-day.'),
    volunteerRoadMended: done('volunteerRoadMended', 'A Passable Road', 'The rut is packed and the timber brace holds. The residents thank you and let you pass; the next loaded wagon can cross without riding the crumbling edge.'),
    ropeMended: done('ropeMended', 'A Passable Road', 'The rope steadies the timber as the crew seats it. They thank you for lending your gear and wave you through the road before the next wagon arrives.'),
    partialRoad: done('partialRoad', 'Enough for Careful Passage', 'The crew leaves a clear, marked line across the firm side of the road. Heavy wagons must wait for more work, but travelers on foot can pass safely.'),
    detour: done('detour', 'Around the Culvert', 'You take the longer lane around the damaged section. It costs time, but avoids the edge until the residents finish their repair.'),
  },
};

export const A_PLACE_TO_BURY_HIM: Scenario = {
  id: 'a-place-to-bury-him', title: 'A Place to Bury Him', subtitle: 'A quiet duty after an ordinary death.', startScene: 'chapelYard',
  scenes: {
    chapelYard: { id: 'chapelYard', title: 'No Family Nearby', tone: 'safe', text: 'An older traveler died during the night after a long illness. The local healer has confirmed it was not an accident, and the body rests under a clean sheet in the chapel yard. His few belongings—a coat, a folded letter, and a purse—are laid on a table for safekeeping. No family is nearby; the neighbors are arranging a respectful burial.', choices: [
      { id: 'checkBelongings', label: 'Help list the belongings for a notice', hint: 'You handle only the items on the table, not the body.', timeCost: 15, next: 'belongingsRecorded', effects: { knowledge: ['The traveler’s table held a coat, folded letter, and purse; the letter names a home settlement but no nearby family.'], historyFlags: ['helped_record_unclaimed_travelers_belongings'] } },
      { id: 'writeNotice', label: 'Offer to carry a written notice to the next post', timeCost: 10, next: 'noticePrepared', effects: { historyFlags: ['carried_burial_notice_for_stranger'] } },
      { id: 'helpBurial', label: 'Help dig the grave in the marked yard', timeCost: 60, next: 'burialHelped', effects: { historyFlags: ['helped_bury_traveler_without_family'] } },
      { id: 'moveOn', label: 'Offer a quiet word and continue your journey', next: 'movedOn' },
    ] },
    belongingsRecorded: { id: 'belongingsRecorded', title: 'A Name to Send Home', tone: 'safe', text: 'The folded letter gives the name of a distant settlement, but not a family address. The purse and coat remain sealed with the local keeper until someone can claim them. A notice can still be sent to the next post.', choices: [
      { id: 'carryNoticeAfterList', label: 'Carry the notice to the next post', timeCost: 10, next: 'noticePrepared', effects: { historyFlags: ['carried_burial_notice_for_stranger'] } },
      { id: 'assistNow', label: 'Join the neighbors at the grave', timeCost: 45, next: 'burialHelped', effects: { historyFlags: ['helped_bury_traveler_without_family'] } },
      { id: 'leaveAfterList', label: 'Leave the keeper to secure the belongings', next: 'movedOn' },
    ] },
    noticePrepared: done('noticePrepared', 'A Letter on the Road', 'The keeper seals a short notice for the next post. It gives the traveler’s name, the place of burial, and the keeper’s directions without making a spectacle of his death.'),
    burialHelped: done('burialHelped', 'A Respectful Farewell', 'You help lower the coffin and cover the grave alongside the neighbors. They mark the place plainly, with room for a name if family comes.'),
    movedOn: done('movedOn', 'Quietly on Your Way', 'The neighbors continue the burial arrangements. You leave them to it without being asked to take on more than you can offer.'),
  },
};

export const THE_STRAY_FIRE: Scenario = {
  id: 'the-stray-fire', title: 'The Stray Fire', subtitle: 'A shed is damaged; its cause is less certain.', startScene: 'afterFlames',
  runRandomSelections: [{ id: 'fireClue', values: [{ value: 'wind' }, { value: 'stove' }, { value: 'lateArrival' }] }],
  scenes: {
    afterFlames: { id: 'afterFlames', title: 'Smoke Over the Washhouse', tone: 'safe', text: 'A small fire has been put out at the shared washhouse. One wall is blackened and a stack of dry boards is lost; nobody was hurt. The neighbors are checking the damage, not seeking a culprit. You arrived in time to see one detail, though not enough to know the whole cause.', textVariants: [
      { requirements: { selections: { fireClue: 'wind' } }, text: 'You saw a loose spark blow from the washhouse stove toward the board stack just before smoke rose. The small fire is out; nobody was hurt. The neighbors are checking the damage, not seeking a culprit.' },
      { requirements: { selections: { fireClue: 'stove' } }, text: 'You saw the stove door left open while the keeper carried water outside. You did not see a spark land. The small fire is out; nobody was hurt. The neighbors are checking the damage, not seeking a culprit.' },
      { requirements: { selections: { fireClue: 'lateArrival' } }, text: 'You arrived after the flames were out and saw only smoke, a blackened wall, and lost boards. You have no direct account of how the fire began. The neighbors are checking the damage, not seeking a culprit.' },
    ], choices: [
      { id: 'reportSpark', label: 'Report the spark you saw carried by wind', requirements: { selections: { fireClue: 'wind' } }, timeCost: 2, next: 'limitedAccount', effects: { historyFlags: ['reported_windblown_spark_at_shared_fire'] } },
      { id: 'reportOpenStove', label: 'Report the open stove door you saw', requirements: { selections: { fireClue: 'stove' } }, timeCost: 2, next: 'limitedAccount', effects: { historyFlags: ['reported_open_stove_at_shared_fire'] } },
      { id: 'offerRepair', label: 'Offer an hour repairing the washhouse wall', timeCost: 60, next: 'repairHelped', effects: { historyFlags: ['helped_repair_shared_washhouse_after_fire'] } },
      { id: 'leaveFire', label: 'Leave the neighbors to their repairs', next: 'movedOn' },
    ] },
    limitedAccount: { id: 'limitedAccount', title: 'One Detail, Not the Whole Cause', tone: 'safe', text: 'You describe the detail you saw and say plainly that you cannot establish how the fire started. The neighbors can use the information while deciding how to rebuild; nobody is named responsible.', choices: [
      { id: 'helpRepairAfterAccount', label: 'Offer an hour of repair work', timeCost: 60, next: 'repairHelped', effects: { historyFlags: ['helped_repair_shared_washhouse_after_fire'] } },
      { id: 'finishAccount', label: 'Leave the account with the neighbors', next: 'movedOn' },
    ] },
    repairHelped: done('repairHelped', 'Boards for the Washhouse', 'You help carry sound boards to the damaged wall. The neighbors will replace the stove guard as well; the exact cause remains uncertain, and the repair does not depend on blame.'),
    movedOn: done('movedOn', 'After the Smoke', 'The neighbors continue their work. They have no reason to turn a small accident into an accusation, and you continue your journey.'),
  },
};

export const THE_CLOSED_ROAD: Scenario = {
  id: 'the-closed-road', title: 'The Closed Road', subtitle: 'A flooded ford, a detour, and a warning worth weighing.', startScene: 'fordApproach',
  timePhases: [{ id: 'water', label: 'Water rising', atMinutes: 0 }, { id: 'lateDay', label: 'Late day', atMinutes: 35 }, { id: 'dusk', label: 'Dusk', atMinutes: 75 }],
  scenes: {
    fordApproach: { id: 'fordApproach', title: 'A Rope Across the Road', tone: 'warning', text: 'A rope has been stretched across the road before a shallow ford. Two locals stand beside it, warning travelers that rain has hidden the stepping stones. The water is higher than the road edge, but not a torrent. A dry detour adds half a day; you need to reach the next settlement before dark, though not for an emergency.', choices: [
      { id: 'respectClosure', label: 'Respect the closure and take the detour', timeCost: 5, next: 'detourTaken', effects: { historyFlags: ['respected_local_ford_closure'] } },
      { id: 'helpAssess', label: 'Help the locals check the water from shore', timeCost: 10, next: 'shoreAssessment', effects: { knowledge: ['The ford’s stepping stones are hidden by rain-swollen water; a view from shore cannot prove the depth between them.'] } },
      { id: 'askForDetour', label: 'Ask for the safest way around', timeCost: 3, next: 'detourTaken' },
      { id: 'crossFord', label: 'Try the ford despite the warning', hint: 'Hidden stones and rising water may knock you down or sweep away your pack.', timeCost: 8, next: 'fordAttempt', effects: { historyFlags: ['risked_closed_ford_after_warning'] } },
    ] },
    shoreAssessment: { id: 'shoreAssessment', title: 'Water Over Stone', tone: 'warning', text: 'From the bank, you can see water moving over the ford but not the depth around the stones. The locals will keep the rope up until the rain eases. You can respect that judgment or insist on testing the crossing yourself.', choices: [
      { id: 'takeDetourAfterLook', label: 'Take the dry detour', timeCost: 5, next: 'detourTaken', effects: { historyFlags: ['respected_local_ford_closure'] } },
      { id: 'testFord', label: 'Step into the ford and test one stone', hint: 'The water can push harder than it looks; retreat may be difficult.', timeCost: 6, chance: { probability: 0.68, successNext: 'shallowStep', failureNext: 'slippedAtFord', successMessage: 'Your foot finds a stone near the edge, but the middle remains untested.', failureMessage: 'The current slips your foot from the bank and knocks you hard against a submerged stone.', successEffects: { historyFlags: ['tested_closed_ford_from_edge'] }, failureEffects: { health: -2, historyFlags: ['slipped_while_testing_closed_ford'] } } },
      { id: 'leaveAssessment', label: 'Leave the locals to keep watch', next: 'movedOn' },
    ] },
    fordAttempt: { id: 'fordAttempt', title: 'Into the Ford', tone: 'danger', text: 'The water reaches above your ankles before you find the first stone. The current presses sideways, and you cannot see the next foothold. The locals shout that deeper water lies ahead. You can turn back now or press on at real risk.', choices: [
      { id: 'turnBack', label: 'Turn back to the bank', hint: 'The return is difficult, but you can stop before the deep center.', timeCost: 3, chance: { probability: 0.78, successNext: 'shoreAssessment', failureNext: 'slippedAtFord', successMessage: 'You work back to the bank one careful step at a time.', failureMessage: 'The current sweeps your legs out before you reach the edge.', failureEffects: { health: -2 } } },
      { id: 'pressThrough', label: 'Press on toward the far bank', hint: 'The middle is deeper and the stones are hidden.', timeCost: 5, chance: { probability: 0.42, successNext: 'fordCrossed', failureNext: 'slippedAtFord', successMessage: 'You find a line of stones and reach the far bank, soaked and shaken.', failureMessage: 'The current pulls you off the stones and drags you downstream.', failureEffects: { health: -4 } } },
    ] },
    shallowStep: { id: 'shallowStep', title: 'A Foothold, Not a Crossing', tone: 'warning', text: 'The first stone holds, but the water deepens toward the center and the next foothold is invisible. A successful step has not made the whole crossing safe.', choices: [
      { id: 'retreatAfterTest', label: 'Return to shore and take the detour', timeCost: 3, next: 'detourTaken' },
      { id: 'continueFord', label: 'Continue across the hidden stones', hint: 'The deeper center remains dangerous.', timeCost: 5, chance: { probability: 0.48, successNext: 'fordCrossed', failureNext: 'slippedAtFord', successMessage: 'You find another foothold and reach the far bank.', failureMessage: 'A hidden drop takes your footing and the current carries you downstream.', failureEffects: { health: -4 } } },
    ] },
    slippedAtFord: { id: 'slippedAtFord', title: 'Back on the Bank', tone: 'warning', text: 'You are back on the near bank, scraped and soaked. The locals lower a rope for you to hold while you climb clear; one has an extra dry wool blanket ready. The detour remains available; you do not have to prove anything by trying again.', choices: [
      { id: 'detourAfterSlip', label: 'Take the detour and dry out on the road', timeCost: 5, next: 'detourTaken', effects: { historyFlags: ['left_closed_ford_after_fall'] } },
      { id: 'stopForHelp', label: 'Accept a dry blanket and wait for the water', next: 'waitedForWater', effects: { health: 1, historyFlags: ['waited_after_ford_injury'] } },
    ] },
    detourTaken: done('detourTaken', 'The Dry Road', 'The detour costs daylight but stays on firm ground. By the time you reach the far side of the ford, the locals have kept the crossing closed and no traveler has been sent into the rising water.'),
    fordCrossed: done('fordCrossed', 'Across, at a Cost', 'You reach the far bank wet and bruised. The crossing did not make the locals’ warning foolish; the river was dangerous, and you were fortunate to find a path through it.'),
    waitedForWater: done('waitedForWater', 'Waiting for a Safer Crossing', 'The locals share a blanket and keep the rope across the road. You wait until the water drops enough for the stepping stones to show.'),
    movedOn: done('movedOn', 'The Road Continues', 'You move along the near bank looking for another way through. The locals keep the crossing closed while rain continues upstream.'),
  },
};

export const COMMUNITY_ADVENTURES: Scenario[] = [THE_TOWN_PUMP, ONE_BOAT_TOO_MANY, THE_MEETING_HALL, WHAT_DID_YOU_SEE, THE_BURNT_BARN_FUND, WINTER_STORES, THE_ROAD_CREW, A_PLACE_TO_BURY_HIM, THE_STRAY_FIRE, THE_CLOSED_ROAD];
