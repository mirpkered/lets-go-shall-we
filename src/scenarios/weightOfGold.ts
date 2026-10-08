import type { Scenario } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

const FIELD_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'compactWheelWrench', 'bridgewrightHammer', 'brassCandlestick', 'steelWedge'];

export const THE_WEIGHT_OF_GOLD: Scenario = {
  id: 'the-weight-of-gold',
  title: 'The Weight of Gold',
  subtitle: 'A broken freight wagon. An exposed fortune. No one knows you are here.',
  startScene: 'freightWreck',
  timePhases: [
    { id: 'quiet', label: 'Quiet Road', atMinutes: 0 },
    { id: 'exposed', label: 'Exposed Cargo', atMinutes: 12 },
    { id: 'dangerous', label: 'Others May Come', atMinutes: 24 },
    { id: 'critical', label: 'Closing Window', atMinutes: 38 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 52 },
  ],
  scenes: {
    freightWreck: {
      id: 'freightWreck', title: 'The Freight Road', tone: 'warning',
      text: 'A freight wagon sits crooked across the narrow road, one wheel folded beneath it. A team of sweating horses has broken loose and vanished into the scrub. A guard with a bloodied sleeve is conscious beside the ditch; another is nowhere in sight. The split cargo chest shows bright yellow metal through a torn canvas seal. The nearest settlement is several miles back. A wheel groans each time the wagon shifts.',
      textVariants: [
        { requirements: { historyFlags: ['protected_freight_cargo'] }, text: 'You recognize the familiar signs of a roadside emergency: a freight wagon with one wheel folded beneath it, loose horses, and an injured guard. Bright yellow metal shows through a torn canvas seal. A second guard is missing, and the wagon shifts with a low groan.' },
        { requirements: { historyFlags: ['stole_from_freight_wagon'] }, text: 'The wagon is crooked across the narrow road, one wheel folded beneath it. The injured guard watches your hands as much as the exposed yellow metal. A second guard is missing. The wheel groans every time the wreck shifts.' },
      ],
      choices: [
        { id: 'treatGuardFirst', label: 'Help the injured guard', hint: 'She is pale and bleeding; the wagon is still shifting.', timeCost: 7, next: 'guardTreated', effects: { historyFlags: ['prioritized_injured_person'] } },
        { id: 'inspectWreck', label: 'Inspect the broken axle', timeCost: 4, next: 'axleEvidence', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.freightWagonAxle] } },
        { id: 'inspectExposedCargo', label: 'Look over the exposed cargo', timeCost: 3, next: 'cargoEvidence' },
        { id: 'callForMissingCrew', label: 'Call for the missing guard', timeCost: 2, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
      ],
    },
    guardTreated: {
      id: 'guardTreated', title: 'Ada, the Guard', tone: 'warning',
      text: 'The guard gives her name as Ada. The cut is deep but clean; a strip of her sleeve makes a serviceable bandage. She says the wagon hit a rut and tipped hard. Pell, the second guard, went after the horses—or so she thought. She keeps glancing at the damaged cargo chest. “That shipment belongs to the assay office. If it goes, the miners lose their month’s pay.”',
      textVariants: [{ requirements: { historyFlags: ['returned_valuable_shipment'] }, text: 'A previous freight recovery comes to mind as you help Ada. The cut is deep but clean. She says the wagon hit a rut, and Pell went after the horses. “That shipment belongs to the assay office. If it goes, the miners lose their month’s pay.”' }],
      choices: [
        { id: 'askAdaAboutPell', label: 'Ask where Pell went', timeCost: 2, next: 'tracksEvidence', effects: { knowledge: ['Pell was last seen heading down the old quarry track.'] } },
        { id: 'askAdaAboutLoad', label: 'Ask what the shipment contains', timeCost: 2, next: 'cargoEvidence', effects: { knowledge: ['The marked crates carry refined gold bars and payroll coin for the assay office.'] } },
        { id: 'secureWagonWithAda', label: 'Keep the wagon from shifting', hint: 'The load is heavy and the broken side faces a steep ditch.', timeCost: 7, chance: { probability: 0.67, bonusItems: FIELD_TOOLS, bonusProbability: 0.2, successNext: 'securedWagon', failureNext: 'wagonSlips', successMessage: 'You brace the frame before the wheel gives way.', failureMessage: 'The frame lurches; you pull clear as a crate slides toward the ditch.', failureEffects: { health: -1, setFlags: ['lostOneCrate'] } } },
      ],
    },
    axleEvidence: {
      id: 'axleEvidence', title: 'A Broken Axle', tone: 'warning',
      text: 'The axle has split along an old stress line where the road drops into a rut. It looks like a genuine accident. But the brake lever is locked, the trace harness was cut free cleanly, and a narrow bootprint crosses the spilled straw toward the quarry track. One explanation does not rule out another.',
      choices: [
        { id: 'checkAxleWithTool', label: 'Test the break with a carried tool', requirements: { anyItems: FIELD_TOOLS }, hint: 'A tool can test the fracture without shifting the wagon.', timeCost: 3, next: 'mechanicalFinding', effects: { knowledge: ['The axle failed under load at the rut; the harness was freed deliberately after the crash.'] } },
        { id: 'checkAxleByHand', label: 'Carefully clear the splintered wood', requirements: { notItems: FIELD_TOOLS }, timeCost: 5, next: 'mechanicalFinding', effects: { knowledge: ['The axle failed under load at the rut; the harness was freed deliberately after the crash.'] } },
        { id: 'braceWithCarriedLine', label: 'Brace the frame with your rope or freight strap', requirements: { anyItems: ['travelRope', 'freightmansStrap'] }, hint: 'A sound line can steady the load, but the wagon may still shift.', timeCost: 4, chance: { probability: 0.78, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'securedWagon', failureNext: 'wagonSlips', successMessage: 'Your carried line holds the frame steady long enough to make a plan.', failureMessage: 'The line catches, but the shifting crate scrapes your arm.', failureEffects: { health: -1 } } },
        { id: 'followQuarryPrints', label: 'Follow the bootprint toward the quarry', timeCost: 7, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
      ],
    },
    mechanicalFinding: {
      id: 'mechanicalFinding', title: 'Accident, Then Opportunity', tone: 'warning',
      text: 'The fracture is old and under strain: the wagon really did break at the rut. The harness was cut only after the crash. Someone used the confusion that followed, but the mark could belong to a rescuer freeing the horses as easily as a thief.',
      choices: [
        { id: 'questionAdaAboutHarness', label: 'Ask Ada about the cut harness', timeCost: 3, next: 'guardAccount' },
        { id: 'searchQuarryFromMechanic', label: 'Search for Pell along the quarry track', timeCost: 8, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'leaveAfterMechanic', label: 'Leave before the wagon shifts again', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    cargoEvidence: {
      id: 'cargoEvidence', title: 'Gold, Coin, and a Torn Seal', tone: 'warning',
      text: 'The intact stamp identifies the assay office: refined gold bars and payroll coin, worth more than most people see in a lifetime. One narrow cradle is empty, though its straps have not snapped. Several coins lie in the straw, easy to pocket without lifting anything. No one is watching the road behind you.',
      choices: [
        { id: 'pocketLooseCoin', label: 'Pocket a few loose coins', hint: 'A small amount can disappear in a pocket. It is still someone else’s payroll.', timeCost: 2, next: 'coinPocketed', effects: { money: 4, historyFlags: ['pocketed_unclaimed_coin', 'stole_from_freight_wagon'], setFlags: ['tookLooseCoin'] } },
        { id: 'takeGoldBar', label: 'Lift one exposed gold bar', hint: 'The bar is heavy, conspicuous, and awkward to carry.', timeCost: 8, next: 'heavyGoldTaken', effects: { money: 18, historyFlags: ['stole_from_freight_wagon', 'profited_from_abandoned_cargo'], setFlags: ['tookGoldBar'] } },
        { id: 'readCargoMarks', label: 'Study the assay marks', timeCost: 3, next: 'assayFinding', effects: { knowledge: ['The gold shipment is inventoried by bar; a missing bar can be identified later.'] } },
        { id: 'coverCargo', label: 'Pull the canvas over the open crates', timeCost: 5, next: 'coveredCargo', effects: { setFlags: ['coveredCargo'], historyFlags: ['protected_freight_cargo'] } },
      ],
    },
    assayFinding: {
      id: 'assayFinding', title: 'An Empty Cradle', tone: 'warning',
      text: 'The inventory chalk marks count the bars. One cradle is empty but its straps are neatly unbuckled, not torn. That could mean an orderly unloading, or a careful theft after the crash. The payroll pouch is still sealed. A heel mark points away from the wagon toward the quarry track.',
      choices: [
        { id: 'followHeelMark', label: 'Follow the heel mark', timeCost: 6, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'askAdaAboutCount', label: 'Ask Ada to confirm the count', timeCost: 3, next: 'guardAccount' },
        { id: 'coverAfterCount', label: 'Cover the remaining cargo', timeCost: 5, next: 'coveredCargo', effects: { setFlags: ['coveredCargo'], historyFlags: ['protected_freight_cargo'] } },
      ],
    },
    coinPocketed: {
      id: 'coinPocketed', title: 'A Small Weight in Your Pocket', tone: 'warning',
      text: 'The coins are warm from the straw. They barely change your pace, but the choice is made whether anyone learns of it or not. Ada is still hurt; the wagon still leans toward the ditch. A snapped leather freight strap lies nearby, and the quarry track disappears between low hills.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The coins are warm from the straw. A distant voice carries from the road behind you; someone may have seen the wreck. Ada is hurt, and the wagon still leans toward the ditch.' }],
      choices: [
        { id: 'helpAfterCoin', label: 'Go back to Ada', timeCost: 6, next: 'guardAccount', effects: { historyFlags: ['prioritized_injured_person'] } },
        { id: 'searchAfterCoin', label: 'Search the quarry track', timeCost: 8, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'takeFreightStrap', label: 'Take the sound freight strap', hint: 'It can secure a load or support a rescue.', timeCost: 3, next: 'decisionPoint', effects: { gainItems: ['freightmansStrap'] } },
      ],
    },
    heavyGoldTaken: {
      id: 'heavyGoldTaken', title: 'The Bar Has a Weight', tone: 'danger',
      text: 'The gold bar is denser than it looked. It drags at your coat and makes climbing or running harder. You have gained real money by taking it; the cargo count is now short. The wagon creaks, and the injured guard calls out from beyond the wheel.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The gold bar drags at your coat. Voices carry from the road behind you. It is harder to move quickly with the stolen weight, and Ada calls from beyond the wagon wheel.' }],
      choices: [
        { id: 'dropBarHelpGuard', label: 'Drop the bar and help the guard', timeCost: 5, next: 'guardAccount', effects: { money: -18, historyFlags: ['abandoned_stolen_cargo', 'prioritized_injured_person'], clearFlags: ['tookGoldBar'] } },
        { id: 'hideBarAndSearch', label: 'Hide the bar and search for Pell', hint: 'The load will be difficult to recover unseen, and the delay matters.', timeCost: 8, next: 'tracksEvidence', effects: { setFlags: ['hidGoldBar'], historyFlags: ['searched_for_missing_guard'] } },
        { id: 'leaveWithGold', label: 'Leave with the bar', hint: 'The weight will slow you on the steep road.', timeCost: 3, next: 'stolenEscapeEnding', effects: { historyFlags: ['stole_from_freight_wagon', 'profited_from_abandoned_cargo'] } },
      ],
    },
    coveredCargo: {
      id: 'coveredCargo', title: 'A Shipment Marked for Return', tone: 'warning',
      text: 'The canvas hides the shine from the road, and the surviving crates sit more securely. It does not make the wagon safe. Ada says the assay office can send a repair team if someone reaches the next milepost. The quarry track may lead to Pell—or away from everyone.',
      choices: [
        { id: 'reachMilepost', label: 'Go for help at the milepost', timeCost: 12, next: 'helpRoute', effects: { historyFlags: ['returned_for_freight_help'] } },
        { id: 'searchAfterCover', label: 'Search the quarry track first', timeCost: 8, next: 'lateQuarrySearch', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'stayWithCargo', label: 'Wait and guard the shipment', hint: 'The road is isolated now, but someone may follow the freight route.', timeCost: 26, next: 'opportunists', effects: { setFlags: ['guardedCargo'], historyFlags: ['protected_freight_cargo'] } },
        { id: 'leaveCoveredCargo', label: 'Leave the covered shipment', next: 'walkAwayEnding', effects: { historyFlags: ['protected_freight_cargo', 'left_freight_wagon'] } },
      ],
    },
    guardAccount: {
      id: 'guardAccount', title: 'Ada’s Account', tone: 'warning',
      text: 'Ada remembers Pell insisting they use this road, though the route was not on the manifest. She also remembers him checking the cargo latch before the crash. She cannot say whether that was routine or preparation. “If he is hurt, find him. If he took a bar, bring him back alive if you can.”',
      textVariants: [
        { requirements: { flags: ['tookLooseCoin'] }, text: 'Ada notices the loose coins missing from the open cargo. She does not accuse you; her attention stays on the empty bar cradle. Pell chose the unlisted route and checked the latch before the crash. “If he is hurt, find him. If he took a bar, bring him back alive if you can.”' },
        { requirements: { flags: ['tookGoldBar'] }, text: 'Ada sees the bar you lifted from the cargo. She does not accuse you; her attention stays on the empty cradle. Pell chose the unlisted route and checked the latch before the crash. “If he is hurt, find him. If he took a bar, bring him back alive if you can.”' },
      ],
      choices: [
        { id: 'searchForPell', label: 'Search the quarry track for Pell', timeCost: 8, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'secureWagonForAda', label: 'Brace the wagon before leaving', timeCost: 6, chance: { probability: 0.62, bonusItems: FIELD_TOOLS, bonusProbability: 0.22, successNext: 'securedWagon', failureNext: 'wagonSlips', successMessage: 'You secure the frame with a lever and a length of strap.', failureMessage: 'The load shifts while you work. You are scraped by a sliding crate.', failureEffects: { health: -1, setFlags: ['lostOneCrate'] } } },
        { id: 'askAdaToReachHelp', label: 'Send Ada to the milepost for help', hint: 'She can walk, but the road will be painful for her.', timeCost: 10, next: 'helpRoute', effects: { setFlags: ['adaSentForHelp'], historyFlags: ['returned_for_freight_help'] } },
        { id: 'leaveFromAccount', label: 'Leave the wreck behind', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    tracksEvidence: {
      id: 'tracksEvidence', title: 'The Quarry Track', tone: 'warning',
      text: 'The track shows two sets of marks: a heavy boot dragged something uphill, while a lighter shoe returned once toward the wagon. It could be Pell moving a bar, an injured guard searching for help, or a stranger who heard the crash. A snapped leather strap is caught on a thorn. The trail is still readable, but the light is changing.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The track is softening under fresh footprints. A second voice rises from the road behind you. You can still follow the heavy drag mark uphill, but the light and time are running out.' }],
      choices: [
        { id: 'followDragMarks', label: 'Follow the heavy drag mark', timeCost: 8, next: 'pellFound', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'takeStrapFromTrack', label: 'Take the sound strap and return', timeCost: 3, next: 'decisionPoint', effects: { gainItems: ['freightmansStrap'] } },
        { id: 'turnBackToAda', label: 'Return to Ada and the wagon', timeCost: 5, next: 'decisionPoint' },
      ],
    },
    lateQuarrySearch: {
      id: 'lateQuarrySearch', title: 'A Trail at the Quarry Cut', tone: 'warning',
      text: 'The track is softening under fresh footprints. A heavy drag mark climbs toward a low quarry marker; the wagon and Ada are now out of sight. You can follow this last clear sign, or turn back and leave the search to the people coming from the milepost.',
      choices: [
        { id: 'followLateDragMark', label: 'Follow the drag mark to the quarry cut', timeCost: 7, next: 'pellFound', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'signalLateSearch', label: 'Signal the carrier and stop searching', timeCost: 4, next: 'peopleSavedEnding', effects: { historyFlags: ['returned_for_freight_help'] } },
        { id: 'leaveLateSearch', label: 'Leave the wreck and quarry behind', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    pellFound: {
      id: 'pellFound', title: 'A Guard in the Quarry Cut', tone: 'warning',
      text: 'Pell is crouched behind a low quarry marker with a gold bar wrapped in his coat. He has a deep cut on one hand. The bar matches the empty cradle; he admits he took it after the axle broke, then stumbled on the track. He says he planned to return the wagon to the road before anyone noticed. His story is plausible, but not complete.',
      textVariants: [{ requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.freightWagonAxle.id] }, text: 'Pell is crouched behind a quarry marker with a gold bar wrapped in his coat and a cut hand. Your knowledge of the axle confirms his account of the crash: it was a real accident. He admits taking the bar afterward, hoping to return the wagon before anyone noticed.' }],
      choices: [
        { id: 'askPellAboutRoute', label: 'Ask why he chose this unlisted road', timeCost: 2, next: 'insideJobRevealed', effects: { knowledge: ['Pell chose the unlisted route to create a chance to take a bar after an expected axle failure.'], historyFlags: ['exposed_inside_job'] } },
        { id: 'offerPellMedicalHelp', label: 'Treat Pell and bring him back', hint: 'His hand is bleeding; the bar and the walk back make this slower.', timeCost: 9, next: 'pellReturned', effects: { historyFlags: ['rescued_missing_guard'] } },
        { id: 'leavePellWithBar', label: 'Let Pell go with the bar', hint: 'He is hurt but mobile. This settles nothing for Ada or the shipment.', timeCost: 2, next: 'pellEscapesEnding', effects: { historyFlags: ['allowed_guard_to_escape'] } },
      ],
    },
    insideJobRevealed: {
      id: 'insideJobRevealed', title: 'The Route Was His Idea', tone: 'warning',
      text: 'Pell admits he knew the axle was overdue for repair and chose this isolated cut hoping a failure would leave a bar uncounted. The axle still broke in the rut; he did not cause the accident. He did use it as cover. His hand is bleeding, and the bar is too heavy to carry back quickly.',
      choices: [
        { id: 'returnPellAndBar', label: 'Bring Pell and the bar back to Ada', timeCost: 10, next: 'shipmentReturned', effects: { historyFlags: ['exposed_inside_job', 'returned_valuable_shipment', 'rescued_missing_guard'], setFlags: ['shipmentReturned'] } },
        { id: 'leaveBarWithPell', label: 'Take the bar; let Pell walk away', hint: 'The bar is awkward and the injured guard cannot chase you.', timeCost: 4, next: 'stolenEscapeEnding', effects: { money: 18, historyFlags: ['stole_from_freight_wagon', 'profited_from_abandoned_cargo', 'exposed_inside_job'] } },
        { id: 'sendPellForHelp', label: 'Send Pell ahead while you help Ada', timeCost: 8, next: 'peopleSavedEnding', effects: { historyFlags: ['rescued_missing_guard', 'prioritized_injured_person', 'exposed_inside_job'] } },
      ],
    },
    pellReturned: {
      id: 'pellReturned', title: 'Back at the Wreck', tone: 'warning',
      text: 'Pell walks beside you, holding his bandaged hand. Ada looks first at him, then at the bar. He says the route was his idea and that he took the bar after the crash. The two guards are alive, but the axle will not carry the full load much farther.',
      choices: [
        { id: 'returnShipmentWithBoth', label: 'Return the bar and report what happened', timeCost: 5, next: 'shipmentReturned', effects: { historyFlags: ['returned_valuable_shipment', 'exposed_inside_job'], setFlags: ['shipmentReturned'] } },
        { id: 'leaveAfterReturningPell', label: 'Leave the guards to settle it', next: 'peopleSavedEnding', effects: { historyFlags: ['rescued_missing_guard'] } },
        { id: 'takeBarWhileTheyArgue', label: 'Pocket the bar while they argue', hint: 'They are distracted, but the weight is unmistakable.', timeCost: 3, next: 'stolenEscapeEnding', effects: { money: 18, historyFlags: ['stole_from_freight_wagon', 'profited_from_abandoned_cargo'] } },
      ],
    },
    securedWagon: {
      id: 'securedWagon', title: 'The Load Holds', tone: 'safe',
      text: 'A lever and the sound freight strap keep the wagon from slipping into the ditch. The work buys safety, not time: the road is isolated, and an approaching voice carries from beyond the bend. Ada can travel with help, while the shipment still needs an escort.',
      choices: [
        { id: 'escortShipment', label: 'Escort the guarded load to the milepost', hint: 'The heavy wagon moves slowly but safely.', timeCost: 12, next: 'shipmentReturned', effects: { historyFlags: ['protected_freight_cargo', 'returned_valuable_shipment'], setFlags: ['shipmentReturned'] } },
        { id: 'searchPellAfterSecuring', label: 'Find Pell before the light goes', timeCost: 8, next: 'tracksEvidence', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'leaveSecuredWagon', label: 'Leave the stable wagon for the owners', next: 'peopleSavedEnding', effects: { historyFlags: ['protected_freight_cargo', 'left_freight_wagon'] } },
      ],
    },
    wagonSlips: {
      id: 'wagonSlips', title: 'The Wagon Shifts', tone: 'danger',
      text: 'The load slides a handspan toward the ditch. You get clear, scraping your arm, but one outer crate tumbles into the weeds. The frame now rests against a stump; moving it again without a proper lever could bring the rest down.',
      choices: [
        { id: 'retrieveCrateWithHook', label: 'Use a hook to retrieve the crate', requirements: { items: ['ratCatchersHook'] }, timeCost: 5, next: 'decisionPoint', effects: { setFlags: ['savedCrate'] } },
        { id: 'leaveCrateAndHelpAda', label: 'Leave the crate and check Ada', timeCost: 3, next: 'decisionPoint', effects: { historyFlags: ['prioritized_injured_person'] } },
        { id: 'seekHelpAfterSlip', label: 'Go for help before the frame moves again', timeCost: 12, next: 'helpRoute', effects: { historyFlags: ['returned_for_freight_help'] } },
      ],
    },
    helpRoute: {
      id: 'helpRoute', title: 'The Milepost', tone: 'warning',
      text: 'You reach the milepost and flag down a returning carrier. The carrier agrees to fetch a repair crew, but warns that scavengers sometimes follow freight roads after a wreck. The wait gives the crew a chance to arrive; it also gives anyone nearby the same chance.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'At the milepost, a carrier agrees to fetch help. Another cart is already coming up the road behind you. The crew will have company before the repair team arrives.' }],
      choices: [
        { id: 'returnWithHelp', label: 'Return to Ada with the carrier', timeCost: 8, next: 'shipmentReturned', effects: { historyFlags: ['returned_for_freight_help', 'protected_freight_cargo', 'returned_valuable_shipment'], setFlags: ['shipmentReturned'] } },
        { id: 'waitAtMilepost', label: 'Wait for the repair team', timeCost: 15, next: 'shipmentReturned', effects: { historyFlags: ['returned_for_freight_help', 'protected_freight_cargo', 'returned_valuable_shipment'], setFlags: ['shipmentReturned'] } },
        { id: 'leaveFromMilepost', label: 'Continue on alone', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    opportunists: {
      id: 'opportunists', title: 'Another Cart on the Road', tone: 'danger',
      text: 'A handcart comes around the bend. Two travelers stop when they see the open freight. They say they heard the crash and came to help, but one keeps looking past Ada at the exposed gold. The guard is hurt; you are the only person between them and the load.',
      textVariants: [{ requirements: { maxElapsedMinutes: 23 }, text: 'A handcart appears beyond the bend. The travelers claim they heard the crash and want to help, but the timing is early and one keeps looking at the exposed gold.' }],
      choices: [
        { id: 'talkOpportunistsDown', label: 'Ask them to help Ada instead', timeCost: 3, chance: { probability: 0.58, bonusFlags: ['coveredCargo', 'guardedCargo'], bonusProbability: 0.25, successNext: 'peopleSavedEnding', failureNext: 'cargoLostEnding', successMessage: 'They accept the work and help Ada away from the wagon.', failureMessage: 'One traveler grabs a crate in the confusion; the group retreats with it.', successEffects: { historyFlags: ['rescued_injured_guard', 'drove_off_opportunists'] }, failureEffects: { historyFlags: ['lost_freight_cargo'] } } },
        { id: 'standAgainstOpportunists', label: 'Stand between them and the shipment', hint: 'They have a pry bar and outnumber you; a fight could be badly injurious.', timeCost: 2, effects: { combat: { enemy: 'two freight scavengers', winChance: 0.47, damageOnWin: 2, damageOnLoss: 5, winNext: 'opportunistsDrivenOff', lossNext: 'cargoLostEnding' } } },
        { id: 'letThemTakeOuterCrate', label: 'Let them take the outer crate', hint: 'This avoids a fight, but the crate and its contents are gone.', timeCost: 1, next: 'peopleSavedEnding', effects: { historyFlags: ['yielded_cargo_to_opportunists', 'prioritized_people'] } },
        { id: 'leaveBeforeTheyApproach', label: 'Leave while they focus on the wagon', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    opportunistsDrivenOff: {
      id: 'opportunistsDrivenOff', title: 'The Road Clears', tone: 'warning',
      text: 'The scavengers retreat, one nursing a bruised wrist. You are hurt too, and the wagon’s exposed crate has been opened in the struggle. Ada is safe, but the shipment needs a proper escort now.',
      choices: [
        { id: 'escortAfterFight', label: 'Escort Ada and the surviving cargo', timeCost: 8, next: 'shipmentReturned', effects: { historyFlags: ['drove_off_opportunists', 'protected_freight_cargo', 'returned_valuable_shipment'], setFlags: ['shipmentReturned'] } },
        { id: 'takeRewardAfterFight', label: 'Accept Ada’s offered freight strap', timeCost: 2, next: 'peopleSavedWithReward', effects: { gainItems: ['freightmansStrap'], historyFlags: ['rescued_injured_guard'] } },
        { id: 'leaveAfterFight', label: 'Leave before more trouble arrives', next: 'peopleSavedEnding', effects: { historyFlags: ['drove_off_opportunists', 'left_freight_wagon'] } },
      ],
    },
    decisionPoint: {
      id: 'decisionPoint', title: 'People, Cargo, and a Narrow Road', tone: 'warning',
      text: 'The wagon still leans toward the ditch. Ada can walk if someone supports her; the missing guard may still be on the quarry track. Covering the cargo would make it safer to leave, while a trip for help costs time. You cannot do everything before the light changes.',
      textVariants: [
        { requirements: { minElapsedMinutes: 24 }, text: 'Footsteps sound somewhere on the road. The wagon leans toward the ditch, Ada is hurt, and Pell remains missing. You can address one immediate need before anyone else reaches the wreck.' },
        { requirements: { flags: ['tookLooseCoin'] }, text: 'The coins in your pocket are small; the choices ahead are not. Ada is hurt, the wagon leans toward the ditch, and Pell is missing.' },
        { requirements: { flags: ['tookGoldBar'] }, text: 'The gold bar still pulls at your coat. Ada is hurt, the wagon leans toward the ditch, and Pell is missing. Carrying the bar makes a fast return or climb harder.' },
      ],
      choices: [
        { id: 'treatAdaAtWreck', label: 'Support Ada and get her to firm ground', timeCost: 6, next: 'peopleSavedEnding', effects: { historyFlags: ['rescued_injured_guard', 'prioritized_injured_person'] } },
        { id: 'searchPellFromDecision', label: 'Search for the missing guard', timeCost: 8, next: 'lateQuarrySearch', effects: { historyFlags: ['searched_for_missing_guard'] } },
        { id: 'secureCargoFromDecision', label: 'Cover and secure the cargo', timeCost: 7, next: 'coveredCargo', effects: { setFlags: ['coveredCargo'], historyFlags: ['protected_freight_cargo'] } },
        { id: 'leaveDecision', label: 'Leave before the road grows more dangerous', next: 'walkAwayEnding', effects: { historyFlags: ['left_freight_wagon'] } },
      ],
    },
    pellEscapesEnding: {
      id: 'pellEscapesEnding', title: 'A Guard Walks Away', tone: 'warning', ending: 'success',
      text: 'Pell disappears along the quarry path with the bar. Ada will have to explain the missing payroll and the empty cradle. The wagon remains where it fell. You have chosen not to decide what happens next, and the road keeps your secret for now.',
      choices: [],
    },
    stolenEscapeEnding: {
      id: 'stolenEscapeEnding', title: 'The Weight You Carry', tone: 'warning', ending: 'success',
      text: 'You leave with stolen gold in your pocket. The bar slows every step; the loose coins do not. No one follows before the road bends out of sight. The shipment will be short, and the choice belongs to this character whether or not anyone can prove it.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Beyond', tone: 'safe', ending: 'success',
      text: 'You walk on without learning who returned for the freight, whether Pell came back, or what happened to the shipment. The injured guard was alive when you left. The road offers no verdict, only distance.',
      choices: [],
    },
    peopleSavedEnding: {
      id: 'peopleSavedEnding', title: 'People Before Freight', tone: 'safe', ending: 'success',
      text: 'Ada reaches firm ground and the carrier takes her toward help. The freight remains exposed, and its final count is no longer yours to protect. A person is alive because you spent your time there; the cargo may or may not survive the night.',
      choices: [],
    },
    peopleSavedWithReward: {
      id: 'peopleSavedWithReward', title: 'A Strap for the Road', tone: 'safe', ending: 'success',
      text: 'Ada reaches safety. Before she leaves, she offers you a sound freight strap from the wagon’s repair kit. “It is the least I can do.” The shipment is still uncertain, but the guard is alive and the tool is honestly given.',
      choices: [],
    },
    cargoLostEnding: {
      id: 'cargoLostEnding', title: 'The Cargo Is Gone', tone: 'warning', ending: 'success',
      text: 'The scavengers leave with what they can lift. Ada is alive, and help is on the road, but the shipment is scattered beyond quick recovery. You leave with no reward and no tidy answer about the empty cradle.',
      choices: [],
    },
    shipmentReturned: {
      id: 'shipmentReturned', title: 'The Shipment Accounted For', tone: 'safe',
      text: 'Ada and the returning crew secure what remains of the shipment. Pell’s role is reported plainly; the broken axle is recorded as an accident, not his work. The assay office will count the bars and settle the payroll. Ada offers you a freightman’s strap, while the assay clerk has a small loupe for the road.',
      textVariants: [{ requirements: { flags: ['tookLooseCoin'] }, text: 'The crew secures the shipment and reports Pell’s part in the missing bar. The assay office will count the bars and settle the payroll. The few coins you pocketed are not in the manifest, and no one asks about them. Ada offers you a freightman’s strap.' }],
      choices: [
        { id: 'acceptFreightmansStrap', label: 'Accept the freightman’s strap', effects: { gainItems: ['freightmansStrap'], historyFlags: ['protected_freight_cargo'] }, next: 'shipmentRewardEnding' },
        { id: 'acceptAssayersLoupe', label: 'Accept the assay clerk’s loupe', hint: 'The returning clerk offers a small tool used to check fine marks.', effects: { gainItems: ['assayersLoupe'], historyFlags: ['protected_freight_cargo'] }, next: 'shipmentRewardEnding' },
        { id: 'declineBothRewards', label: 'Thank them and travel on', effects: { historyFlags: ['protected_freight_cargo'] }, next: 'shipmentRewardEnding' },
      ],
    },
    shipmentRewardEnding: {
      id: 'shipmentRewardEnding', title: 'The Weight of Gold', tone: 'safe', ending: 'success',
      text: 'The last crates are counted as the repair crew takes over. The assay office will recover most of its shipment, and the people on the road are safe. A freightman’s strap, if you accepted it, is a modest reward for a difficult piece of work.',
      choices: [],
    },
  },
};
