import type { Scenario } from '../types';

const STOVE_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'compactStoveTool', 'bridgewrightHammer', 'foldingPryTool', 'brassCandlestick', 'steelWedge'];
const OUTDOOR_WARMTH = ['heavyLeatherGloves', 'weatherproofCloak', 'weatherproofBlanket', 'woolTravelBlanket'];
const OUTDOOR_HELP = ['travelRope', 'heavyLeatherGloves', 'weatherproofCloak', 'weatherproofBlanket', 'woolTravelBlanket', 'minerHeadlamp'];
const ROPE_TOOLS = ['travelRope', 'ratCatchersHook'];

export const DOWN_TO_THE_LAST_MATCH: Scenario = {
  id: 'down-to-the-last-match',
  title: 'Down to the Last Match',
  subtitle: 'A failing stove, a hard storm, and only so much warmth to go around.',
  startScene: 'cabinArrival',
  timePhases: [
    { id: 'sheltered', label: 'Shelter Found', atMinutes: 0 },
    { id: 'storm-line', label: 'The Storm Closes In', atMinutes: 12 },
    { id: 'bitter', label: 'Bitter Cold', atMinutes: 25 },
    { id: 'dangerous', label: 'The Last Warm Hours', atMinutes: 40 },
    { id: 'pre-dawn', label: 'Pre-Dawn', atMinutes: 56 },
  ],
  scenes: {
    cabinArrival: {
      id: 'cabinArrival', title: 'A Roof Before the Whiteout', tone: 'warning',
      text: 'The road shelter is a one-room cabin above the pass. Its stove is lit, but the flame gutters every time the wind leans on the chimney. A short stack of proper firewood and a chair sit by the hearth. The storm came early; snow already hides the road markers. Cabin keeper Marta says the room is still warm enough to think. A glass covers the last dry match beside the stove.',
      textVariants: [{ requirements: { historyFlags: ['rescued_cold_storage_worker'] }, text: 'A memory of carrying someone out of danger crosses your mind as Cabin keeper Marta lets you in before snow erases the road. The stove is lit but unsteady; only a short stack of wood is dry. The last dry match sits beneath a glass beside it.' }],
      choices: [
        { id: 'talkToMarta', label: 'Ask Marta what is failing', timeCost: 3, next: 'caretakerAccount', effects: { knowledge: ['Marta says the stove flue draws poorly in a hard crosswind.', 'A sealed two-coin reserve sack is kept in the shed for the road crew.', 'One dry match remains beneath the glass by the stove.'] } },
        { id: 'inspectStove', label: 'Inspect the stove and its draft', timeCost: 3, next: 'stoveSurvey', effects: { knowledge: ['The stove draws poorly in a hard crosswind.', 'One dry match remains beneath the glass by the stove.'] } },
        { id: 'checkWood', label: 'Count the dry wood and kindling', timeCost: 2, next: 'woodSurvey', effects: { knowledge: ['There is one short stack of dry firewood and a little kindling.', 'One dry match remains beneath the glass by the stove.'] } },
        { id: 'watchWeather', label: 'Read the storm through the window', timeCost: 3, next: 'weatherSurvey', effects: { knowledge: ['Snow is already covering the road markers.', 'One dry match remains beneath the glass by the stove.'] } },
      ],
    },
    caretakerAccount: {
      id: 'caretakerAccount', title: 'Marta’s Store of Winter', tone: 'warning',
      text: 'Marta shows you the flue seam: it leaks when the gusts come from the north. She has one sealed sack of dry wood in the shed, reserved for the road crew. The crew will need two coins to replace it. The shelter has no more dry matches than the one beneath the glass.',
      choices: [
        { id: 'buyReserveWood', label: 'Pay two coins for the reserve sack', hint: 'It is dry fuel, but those coins will be gone.', requirements: { minMoney: 2 }, timeCost: 2, next: 'reserveFuelBought', effects: { money: -2, setFlags: ['reserveFuelBought', 'woodGathered', 'savedKindling'] } },
        { id: 'declineReserveWood', label: 'Keep your money and plan with what is here', next: 'planBeforeNight' },
      ],
    },
    stoveSurvey: {
      id: 'stoveSurvey', title: 'A Thin, Uneven Draw', tone: 'warning',
      text: 'The flue is pulling weakly. A seam near the collar lets smoke curl back when the wind changes, though the stove is not yet out. There is time to make a careful adjustment before the worst gusts arrive. The last match is dry, but it will only serve once.',
      choices: [
        { id: 'markFlueLeak', label: 'Show Marta where the seam is leaking', timeCost: 2, next: 'planBeforeNight', effects: { knowledge: ['The flue collar has a small leak that worsens in crosswinds.'] } },
        { id: 'coverDraftBriefly', label: 'Hang a cloth over the inner draft', hint: 'It may help briefly, but cloth must stay clear of the stove.', timeCost: 4, next: 'planBeforeNight', effects: { setFlags: ['draftTemporarilyCovered'] } },
      ],
    },
    woodSurvey: {
      id: 'woodSurvey', title: 'A Short Stack', tone: 'warning',
      text: 'The proper firewood will not last the night at its present pace. Kindling is dry but scant. The chair is solid pine; breaking it would feed the stove, though it is the only comfortable seat in the cabin. The last match is kept separate under a glass.',
      choices: [
        { id: 'rationKindling', label: 'Set aside the kindling for later', timeCost: 2, next: 'planBeforeNight', effects: { setFlags: ['woodCounted'] } },
        { id: 'inspectChairForFuel', label: 'Check whether the chair can feed the stove', timeCost: 2, next: 'planBeforeNight', effects: { knowledge: ['The spare chair is dry pine; burning it would provide a short burst of heat.'] } },
      ],
    },
    weatherSurvey: {
      id: 'weatherSurvey', title: 'Markers Disappearing', tone: 'warning',
      text: 'Snow is drawing sideways across the window. The nearest road marker is already half buried, and the wind is carrying loose powder over the track to the shed. For now, the cabin door still opens inward against the drift.',
      choices: [
        { id: 'fastenInnerShutter', label: 'Fasten the inner shutter against the draft', timeCost: 4, next: 'planBeforeNight', effects: { setFlags: ['draftSealed'], historyFlags: ['secured_shelter_in_cold'] } },
        { id: 'markDoorAndWindow', label: 'Mark the door and window for the return', timeCost: 2, next: 'planBeforeNight', effects: { knowledge: ['The road marker is being buried; the cabin door remains clear for now.'] } },
      ],
    },
    planBeforeNight: {
      id: 'planBeforeNight', title: 'Before the Wind Turns', tone: 'warning',
      text: 'The fire is still holding, but the cabin is small and the fuel is not. Marta can help with the flue if you explain what you found. The single dry match could restart the stove later—or be saved for a signal. The chair is burnable, though it is the only comfortable seat.',
      textVariants: [
        { requirements: { flags: ['draftTemporarilyCovered'] }, text: 'The cloth over the draft helps for now, but the stove must be fixed before a strong gust lifts it. The fire still holds; the dry match could restart it later or serve as a signal. The chair remains burnable.' },
        { requirements: { flags: ['reserveFuelBought'] }, text: 'The paid reserve sack is stacked just inside the door, dry and ready. The stove still draws poorly, and the last match remains beneath its glass. Marta asks whether to fix the flue before the gusts arrive.' },
      ],
      choices: [
        { id: 'repairFlueWithTool', label: 'Adjust the flue with your carried tool', hint: 'A compact tool gives you control at the hot, narrow collar.', requirements: { anyItems: STOVE_TOOLS }, timeCost: 4, chance: { probability: 0.9, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.05, successNext: 'stoveMended', failureNext: 'stoveMisaligned', successMessage: 'The tool seats the collar and the draw steadies.', failureMessage: 'The tool slips. The collar shifts, and smoke rolls back into the room.', successEffects: { setFlags: ['stoveRepaired'], historyFlags: ['repaired_stove_in_cold'] }, failureEffects: { health: -1, setFlags: ['stoveWorsened'] } } },
        { id: 'repairFlueByHand', label: 'Try to seat the flue by hand', hint: 'The collar is hot and the fit is poor; a slip could worsen the leak.', requirements: { notItems: STOVE_TOOLS }, timeCost: 8, chance: { probability: 0.61, bonusItems: ['heavyLeatherGloves'], bonusProbability: 0.16, successNext: 'stoveMended', failureNext: 'stoveMisaligned', successMessage: 'You ease the collar into place and the smoke draws cleanly.', failureMessage: 'The hot collar shifts in your grip and sends smoke into the room.', successEffects: { setFlags: ['stoveRepaired'], historyFlags: ['repaired_stove_in_cold'] }, failureEffects: { health: -1, setFlags: ['stoveWorsened'] } } },
        { id: 'useLastMatchEarly', label: 'Spend the last match to steady the fire now', hint: 'Warmth now may cost you a signal or restart later.', timeCost: 2, next: 'matchSpentEarly', effects: { setFlags: ['lastMatchSpent', 'stoveRelit', 'fireFed'], historyFlags: ['used_last_match_for_shelter'] } },
        { id: 'conserveMatchAndKindling', label: 'Save the match and set aside dry fuel', hint: 'The room will cool sooner, but a small reserve remains.', timeCost: 4, next: 'matchConserved', effects: { setFlags: ['lastMatchConserved', 'savedKindling'], historyFlags: ['conserved_last_match'] } },
        { id: 'burnChairEarly', label: 'Break the spare chair for immediate fuel', hint: 'You gain heat but destroy the cabin’s only comfortable seat.', timeCost: 4, next: 'chairBurnedEarly', effects: { setFlags: ['propertyBurned', 'fireFed'], historyFlags: ['burned_property_for_survival'] } },
      ],
    },
    stoveMended: {
      id: 'stoveMended', title: 'The Draw Holds', tone: 'safe',
      text: 'Smoke rises cleanly through the flue. The stove is still old, and it still needs fuel, but its heat will not be blown back into the room as easily. Marta checks the collar twice before trusting it.',
      choices: [{ id: 'faceStormWithRepairedStove', label: 'Settle in before the storm reaches the ridge', timeCost: 3, next: 'stormFront' }],
    },
    stoveMisaligned: {
      id: 'stoveMisaligned', title: 'Smoke in the Room', tone: 'danger',
      text: 'The collar shifts and smoke stings your eyes. Marta opens the upper vent until the room clears. The stove can still be used, but it will waste fuel until the wind changes; the hot fitting is no longer safe to handle bare-handed.',
      choices: [{ id: 'stepAwayFromFlue', label: 'Let the fitting cool and close the vent', timeCost: 3, next: 'stormFront', effects: { setFlags: ['stoveWorsened'] } }],
    },
    matchSpentEarly: {
      id: 'matchSpentEarly', title: 'A Small Flame, Bought Early', tone: 'safe',
      text: 'The last match catches the dry tinder. The stove draws a little more strongly, but the match tin is empty now. If the fire goes out, you will need another way to keep the room warm or find help.',
      choices: [{ id: 'watchTheFire', label: 'Watch the stove until the wind rises', timeCost: 2, next: 'stormFront' }],
    },
    matchConserved: {
      id: 'matchConserved', title: 'A Match Kept Dry', tone: 'warning',
      text: 'You set the dry fuel aside instead of feeding it to the low flame. The match remains dry beneath its glass, and the small reserve stays untouched. The room cools by degrees while the fire works through the remaining coals.',
      choices: [{ id: 'waitForTheWind', label: 'Stay close to the stove and listen', timeCost: 4, next: 'stormFront' }],
    },
    chairBurnedEarly: {
      id: 'chairBurnedEarly', title: 'Pine Instead of a Chair', tone: 'warning',
      text: 'The chair cracks into pieces that fit the stove. The flame steadies, and the room warms for a while. Marta watches the sparks settle; the chair will not be replaced tonight.',
      choices: [{ id: 'watchChairFuel', label: 'Keep the fire fed as the gusts arrive', timeCost: 2, next: 'stormFront' }],
    },
    reserveFuelBought: {
      id: 'reserveFuelBought', title: 'A Sack Set Aside', tone: 'safe',
      text: 'Marta marks the road crew’s ledger and unlatches the shed. You have paid for its one reserve sack of dry wood; the replacement money is gone. The sack is tied shut and ready to bring in before the track disappears.',
      choices: [{ id: 'bringReserveInside', label: 'Stack the reserve where it will stay dry', timeCost: 2, next: 'planBeforeNight', effects: { setFlags: ['reserveFuelStaged'] } }],
    },
    stormFront: {
      id: 'stormFront', title: 'Three Knocks at the Door', tone: 'danger',
      text: 'A gust drives snow through the outer seams. The road markers disappear one by one. Three careful knocks sound at the door, then a voice calls, “Is anyone there?” The stove is still burning, but the room is cooling at its edges.',
      textVariants: [
        { requirements: { flags: ['draftSealed'], minElapsedMinutes: 40 }, text: 'The inner shutter keeps snow from the hearth, but the outer seams still whistle. The road markers are gone. Three careful knocks come from the door, and the stove’s remaining heat is fading.' },
        { requirements: { flags: ['draftSealed'], minElapsedMinutes: 25 }, text: 'The inner shutter holds back the worst draft. The road markers are disappearing; three careful knocks sound at the door while the stove burns low.' },
        { requirements: { flags: ['draftSealed'] }, text: 'The inner shutter holds against the first hard gust. Three careful knocks sound at the door, and the road markers are beginning to vanish.' },
        { requirements: { minElapsedMinutes: 25, maxElapsedMinutes: 39 }, text: 'Wind presses snow through the outer seams, and the road markers are gone. Three careful knocks sound at the door. The stove is still lit, though the room has turned bitter; an outside trip may be the last chance to gather dry fuel safely.' },
        { requirements: { minElapsedMinutes: 40 }, text: 'A white gust presses snow through the seams. The road markers are gone, the fire is low, and three knocks come faintly from the door. Waiting is safest for the body, but the cabin has little heat left to wait with.' },
      ],
      choices: [
        { id: 'openForKnocker', label: 'Open the door and learn who is there', hint: 'The wind will enter with them; leaving them outside is also a choice.', timeCost: 2, next: 'travelerAtDoor' },
        { id: 'fetchFuelBeforeWhiteout', label: 'Reach the wood shed while tracks remain', hint: 'The markers are fading, but the shorter trip still has risk.', requirements: { maxElapsedMinutes: 29 }, timeCost: 2, next: 'fuelTrip', effects: { setFlags: ['callerOutside'], historyFlags: ['risked_cold_for_fuel'] } },
        { id: 'fetchFuelInWhiteout', label: 'Go for the shed in the whiteout', hint: 'The road is hidden and exposed skin can numb quickly.', requirements: { minElapsedMinutes: 30 }, timeCost: 2, next: 'fuelTrip', effects: { setFlags: ['callerOutside'], historyFlags: ['risked_cold_for_fuel'] } },
        { id: 'holdInsideFromStorm', label: 'Stay inside and ration the heat', hint: 'The shelter is safer than the open slope, but the fire will keep dwindling.', timeCost: 15, next: 'criticalCold' },
      ],
    },
    travelerAtDoor: {
      id: 'travelerAtDoor', title: 'A Stranger in the Snow', tone: 'danger',
      text: 'The person at the threshold is Eli, a courier whose pack strap snapped on the pass. Their hands are clumsy and their coat is crusted with snow, but they can stand. Opening the door has let a gust into the cabin. Eli asks to come in and offers no promise that sharing the room will leave enough heat for both of you.',
      textVariants: [{ requirements: { historyFlags: ['rescued_stranded_traveler'] }, text: 'You remember helping a stranded traveler before. Eli waits for your answer; their pack strap snapped on the pass, and their hands are clumsy with cold. Opening the door has let a gust in, and sharing the room will divide the remaining warmth.' }],
      choices: [
        { id: 'bringEliInside', label: 'Let Eli share the cabin', hint: 'The door must stay open long enough for them to enter; the room will cool.', timeCost: 3, next: 'sharedShelter', effects: { setFlags: ['travelerInside'], historyFlags: ['shared_shelter_in_cold', 'rescued_stranded_traveler'] } },
        { id: 'refuseEliShelter', label: 'Keep the door closed and refuse shelter', hint: 'Eli may reach the road, but the markers are disappearing.', timeCost: 2, next: 'refusedShelter', effects: { setFlags: ['travelerOutside'], historyFlags: ['refused_shelter_in_cold'] } },
        { id: 'guideEliToShed', label: 'Walk Eli to the windbreak by the shed', hint: 'Going back outside risks both of you; rope or warm gear helps.', timeCost: 5, chance: { probability: 0.61, bonusItems: OUTDOOR_HELP, bonusProbability: 0.22, successNext: 'travelerOutsideSafe', failureNext: 'rescueSlip', successMessage: 'You get Eli behind the shed wall and guide them back to the door.', failureMessage: 'A drift hides the step; you both stumble before reaching cover.', successEffects: { setFlags: ['travelerInside', 'travelerOutsideSafe'], historyFlags: ['rescued_stranded_traveler', 'risked_cold_to_help'] }, failureEffects: { health: -2, setFlags: ['travelerOutside', 'rescueAttemptFailed'] } } },
      ],
    },
    sharedShelter: {
      id: 'sharedShelter', title: 'Two Coats, One Stove', tone: 'warning',
      text: 'Eli sits near the stove while Marta dries their gloves. The door is shut again, but the room is colder than before. There is not enough wood to keep the stove high all night. A spare blanket lies folded on the bench; the stove warms this one-room cabin as a whole, not separate sides. Eli knows how to tie a clean flue collar, and a heel of bread remains on the shelf.',
      choices: [
        { id: 'shareBreadAndBlanket', label: 'Share the bread and spare blanket', timeCost: 5, next: 'sharedResources', effects: { setFlags: ['foodShared', 'blanketShared'], historyFlags: ['shared_shelter_in_cold'] } },
        { id: 'askEliToHelpStove', label: 'Ask Eli to help steady the flue', hint: 'A second pair of hands may help, though the metal is still hot.', timeCost: 5, chance: { probability: 0.69, bonusItems: STOVE_TOOLS, bonusProbability: 0.17, successNext: 'sharedStoveHelped', failureNext: 'sharedStoveStrain', successMessage: 'Eli holds the collar steady while you secure it.', failureMessage: 'The collar slips; Eli pulls back with a stinging palm.', successEffects: { setFlags: ['stoveRepaired'], historyFlags: ['shared_shelter_in_cold', 'repaired_stove_in_cold'] }, failureEffects: { health: -1, setFlags: ['stoveWorsened'], historyFlags: ['shared_shelter_in_cold'] } } },
        { id: 'rationFuelApart', label: 'Keep the remaining fuel in reserve', hint: 'You can share shelter without deciding to burn the last wood now.', timeCost: 3, next: 'sharedRation', effects: { setFlags: ['sharedFuelRationed'], historyFlags: ['shared_shelter_in_cold'] } },
      ],
    },
    sharedResources: {
      id: 'sharedResources', title: 'A Little Warmth for Two', tone: 'safe',
      text: 'The bread is divided in half and the dry blanket is laid across Eli’s shoulders. Neither of you has eaten enough to feel full, but Eli’s hands stop shaking. The stove still needs fuel, and the storm has not eased.',
      choices: [{ id: 'settleAfterSharing', label: 'Take turns near the stove', timeCost: 4, next: 'criticalCold', effects: { setFlags: ['travelerWarmthShared'] } }],
    },
    sharedStoveHelped: {
      id: 'sharedStoveHelped', title: 'A Better Draw, Two Sets of Hands', tone: 'safe',
      text: 'The collar seats with Eli holding it steady. It is not a new stove, but the worst of the smoke stays in the flue. Eli takes the colder side of the room without comment; the wood stack is still short.',
      choices: [{ id: 'watchRepairedStoveTogether', label: 'Stay close and watch the draw', timeCost: 3, next: 'criticalCold' }],
    },
    sharedStoveStrain: {
      id: 'sharedStoveStrain', title: 'A Burned Hand', tone: 'danger',
      text: 'Eli’s palm is red where the collar slipped. The flue still draws poorly, and Marta wraps the hand while the two of you keep clear of the stove. The room is cooling, but nobody is alone in it.',
      choices: [{ id: 'careForEliAndWait', label: 'Wrap the hand and settle in', timeCost: 3, next: 'criticalCold' }],
    },
    sharedRation: {
      id: 'sharedRation', title: 'A Quiet, Careful Arrangement', tone: 'warning',
      text: 'Eli accepts that the last wood will stay unburned for now and moves to the far end of the bench. The shelter remains shared, but neither of you knows how long the stove will hold.',
      choices: [{ id: 'waitAfterRation', label: 'Keep watch over your own share', timeCost: 3, next: 'criticalCold' }],
    },
    refusedShelter: {
      id: 'refusedShelter', title: 'Footsteps Under Snow', tone: 'danger',
      text: 'Eli turns from the door and walks toward the road marker. It disappears behind blowing snow before they reach it. You cannot tell whether they found the shed or kept going. The door is shut; the stove is yours to ration.',
      choices: [
        { id: 'stayAfterRefusal', label: 'Stay by the stove and keep the door shut', timeCost: 8, next: 'criticalCold' },
        { id: 'signalForEliNow', label: 'Use the last match to signal Eli back', hint: 'The flame may be seen; it will leave no match to relight the stove.', requirements: { notFlags: ['lastMatchSpent'] }, timeCost: 3, chance: { probability: 0.57, bonusItems: ['minerHeadlamp', 'conductorWhistle', 'trailWhistle', 'farmWhistle', 'windproofMatchCase'], bonusProbability: 0.18, successNext: 'eliReturnsBySignal', failureNext: 'signalFailsOutside', successMessage: 'A moving light answers from beyond the shed.', failureMessage: 'The match gutters in the gust. No answer comes from the snow.', successEffects: { setFlags: ['lastMatchSpent', 'travelerInside'], clearFlags: ['travelerOutside'], historyFlags: ['used_last_match_for_stranger', 'rescued_stranded_traveler', 'shared_shelter_in_cold'] }, failureEffects: { setFlags: ['lastMatchSpent'], historyFlags: ['used_last_match_for_stranger'] } } },
        { id: 'goAfterEli', label: 'Step out and try to find Eli', hint: 'The footprints are already fading and your hands are exposed.', timeCost: 6, next: 'travelerOutside', effects: { setFlags: ['travelerOutside'], historyFlags: ['risked_cold_to_help'] } },
      ],
    },
    eliReturnsBySignal: {
      id: 'eliReturnsBySignal', title: 'A Signal Answered', tone: 'warning',
      text: 'Eli reaches the door with one hand over their mouth to keep the snow out. The signal cost the only match, but it brought them back before the tracks disappeared. Marta closes the door and gets them beside the stove.',
      choices: [{ id: 'settleEliAfterSignal', label: 'Make room beside the stove', timeCost: 3, next: 'sharedShelter' }],
    },
    signalFailsOutside: {
      id: 'signalFailsOutside', title: 'A Flame with No Answer', tone: 'danger',
      text: 'The match gives a short, bright flame, then dies against the draft. No shape moves beyond the shed. You have spent the last ignition source, and Eli’s route is lost to the snow.',
      choices: [{ id: 'stayAfterFailedSignal', label: 'Keep the door closed and conserve the coals', timeCost: 7, next: 'criticalCold' }],
    },
    travelerOutside: {
      id: 'travelerOutside', title: 'A Figure Beside the Shed', tone: 'danger',
      text: 'A lanternless figure crouches behind the shed wall. It is Eli, the courier, with a snapped pack strap and fingers too numb to tie it. The wall blocks some wind, but it is not shelter for the night. The cabin door is visible through the blowing snow.',
      choices: [
        { id: 'bringEliFromShed', label: 'Get Eli back to the cabin', hint: 'Rope, gloves, or a weatherproof layer can steady the short return.', timeCost: 6, chance: { probability: 0.62, bonusItems: OUTDOOR_HELP, bonusProbability: 0.22, successNext: 'travelerOutsideSafe', failureNext: 'rescueSlip', successMessage: 'You get Eli upright and back to the cabin door.', failureMessage: 'A hidden drift gives way; both of you fall hard before reaching the door.', successEffects: { setFlags: ['travelerInside', 'travelerOutsideSafe'], historyFlags: ['rescued_stranded_traveler', 'shared_shelter_in_cold'] }, failureEffects: { health: -2, setFlags: ['travelerOutside', 'rescueAttemptFailed'] } } },
        { id: 'returnAloneWithFuel', label: 'Return alone with the wood', hint: 'Eli can remain behind the windbreak, but the storm is worsening.', timeCost: 3, next: 'criticalCold', effects: { historyFlags: ['refused_shelter_in_cold'] } },
      ],
    },
    travelerOutsideSafe: {
      id: 'travelerOutsideSafe', title: 'Back Behind the Door', tone: 'warning',
      text: 'Marta shuts the door while Eli catches their breath. The trip cost heat and time, and the stove is still working against the wind.',
      textVariants: [{ requirements: { flags: ['woodGathered'] }, text: 'Marta shuts the door while Eli catches their breath. The trip cost heat and time, and the wood you brought is now packed with snow. Eli can warm up, but the stove is still working against the wind.' }],
      choices: [{ id: 'getEliWarm', label: 'Give Eli the dry side of the bench', timeCost: 3, next: 'sharedShelter' }],
    },
    rescueSlip: {
      id: 'rescueSlip', title: 'A Fall in the Drift', tone: 'danger',
      text: 'Your knee hits frozen ground. Eli is still on their feet, but the storm makes the last few yards hard to judge. Your fingers are starting to lose their feeling; another unprotected trip would be dangerous.',
      choices: [
        { id: 'useRopeAfterSlip', label: 'Use a carried line to guide both of you in', requirements: { anyItems: ROPE_TOOLS }, timeCost: 3, next: 'travelerOutsideSafe', effects: { health: -1, setFlags: ['travelerInside'], historyFlags: ['rescued_stranded_traveler', 'risked_cold_to_help'] } },
        { id: 'crawlBackAfterSlip', label: 'Crawl to the door and call Marta for help', timeCost: 3, next: 'travelerOutsideSafe', effects: { health: -2, setFlags: ['travelerInside'], historyFlags: ['rescued_stranded_traveler', 'risked_cold_to_help'] } },
        { id: 'retreatAfterSlip', label: 'Get yourself inside before your hands fail', timeCost: 2, next: 'criticalCold', effects: { health: -1, historyFlags: ['abandoned_stranded_traveler'] } },
      ],
    },
    fuelTrip: {
      id: 'fuelTrip', title: 'The Shed in the Whiteout', tone: 'danger',
      text: 'The shed is only a short walk, but wind-blown snow hides the track. Frozen branches lie under its eaves. Your bare fingers would lose feeling quickly, and a slip on the slope could leave you below the path. A rope can pull the dry branches without climbing down. The caller remains outside; as you leave, you glimpse them moving toward the shed’s lee wall.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The shed is close enough to see only when the gusts thin. Your hands are already stiff. Frozen branches lie under the eaves, but the slope below is hidden; an unroped fall would be hard to climb out of in this cold. The caller has moved toward the shed’s lee wall, still within sight.' }],
      choices: [
        { id: 'gatherWithWarmGear', label: 'Gather branches with your warm gear', requirements: { anyItems: OUTDOOR_WARMTH }, hint: 'Gloves or a weatherproof layer buy time, not safety.', timeCost: 10, chance: { probability: 0.79, bonusItems: ['minerHeadlamp', 'ratCatchersHook'], bonusProbability: 0.1, successNext: 'woodRecovered', failureNext: 'fuelTripSlip', successMessage: 'You gather enough dry branches for one strong feed before the snow closes over the shed track.', failureMessage: 'A hidden patch of ice takes your feet and knocks you against the slope.', successEffects: { setFlags: ['woodGathered', 'woodRetrievedWithWarmGear', 'riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] }, failureEffects: { health: -2, setFlags: ['riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] } } },
        { id: 'gatherBarehanded', label: 'Reach under the eaves without warm gear', requirements: { notItems: OUTDOOR_WARMTH }, hint: 'Fingers are numbing; wet wood is heavy and the slope is slick.', timeCost: 17, chance: { probability: 0.54, bonusItems: ['minerHeadlamp'], bonusProbability: 0.12, successNext: 'woodRecovered', failureNext: 'fuelTripSlip', successMessage: 'You pull together a small armful of dry branches before your hands go numb.', failureMessage: 'Your fingers fail on the slick branches and you fall against the bank.', successEffects: { setFlags: ['woodGathered', 'woodRetrievedBarehanded', 'riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] }, failureEffects: { health: -3, setFlags: ['riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] } } },
        { id: 'pullBundleWithLine', label: 'Pull the dry branches with your rope or hook', requirements: { anyItems: ROPE_TOOLS }, hint: 'The line keeps you off the steepest part of the slope.', timeCost: 8, chance: { probability: 0.9, bonusItems: ['heavyLeatherGloves', 'minerHeadlamp'], bonusProbability: 0.06, successNext: 'woodRecovered', failureNext: 'fuelTripSlip', successMessage: 'The hook and line draw dry branches from beneath the eaves.', failureMessage: 'The line snags; you brace too late and strike the slope.', successEffects: { setFlags: ['woodGathered', 'woodRetrievedWithLine', 'riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] }, failureEffects: { health: -1, setFlags: ['riskedColdForFuel'], historyFlags: ['risked_cold_for_fuel'] } } },
        { id: 'retreatFromShed', label: 'Turn back before your hands go numb', hint: 'You keep your strength, but return without extra fuel.', timeCost: 3, next: 'stormTurnedBack', effects: { historyFlags: ['risked_cold_for_fuel'] } },
      ],
    },
    woodRecovered: {
      id: 'woodRecovered', title: 'Dry Fuel from the Shed', tone: 'warning',
      text: 'You have enough dry branches for one strong feed, not a whole night. You make the return with numb hands and a careful climb. The caller is still crouched against the shed’s lee wall; you have not yet learned who they are.',
      textVariants: [
        { requirements: { flags: ['woodRetrievedWithWarmGear'] }, text: 'You have enough dry branches for one strong feed, not a whole night. Your warm gear keeps feeling in your hands for the careful return. The caller is still crouched against the shed’s lee wall; you have not yet learned who they are.' },
        { requirements: { flags: ['woodRetrievedWithLine'] }, text: 'You have enough dry branches for one strong feed, not a whole night. The line lets you draw them from beneath the eaves without climbing onto the slick slope. The caller is still crouched against the shed’s lee wall; you have not yet learned who they are.' },
      ],
      choices: [
        { id: 'feedRecoveredWood', label: 'Feed the stove’s live coals', requirements: { maxElapsedMinutes: 39 }, timeCost: 5, next: 'criticalCold', effects: { setFlags: ['woodUsed', 'fireFed'], historyFlags: ['risked_cold_for_fuel'] } },
        { id: 'saveRecoveredWood', label: 'Set aside the dry branches for later', hint: 'If the coals fade, these branches will need the last match.', timeCost: 3, next: 'criticalCold', effects: { setFlags: ['savedKindling'], historyFlags: ['risked_cold_for_fuel'] } },
        { id: 'followVoiceByShed', label: 'Check the prints beside the shed', timeCost: 4, next: 'travelerOutside', effects: { setFlags: ['travelerOutside'] } },
      ],
    },
    fuelTripSlip: {
      id: 'fuelTripSlip', title: 'The Slope Gives Way', tone: 'danger',
      text: 'You land hard on the icy bank. No bone seems broken, but the cold has worked through your sleeve. The branches are out of reach, and the walk back will take effort. The same caller remains by the shed wall, close enough to see but not yet identified. Staying outside to search again would be a poor risk.',
      choices: [
        { id: 'returnAfterFuelSlip', label: 'Return to the cabin empty-handed', timeCost: 5, next: 'criticalCold', effects: { health: -1, historyFlags: ['risked_cold_for_fuel'] } },
        { id: 'useRopeAfterFuelSlip', label: 'Use your carried rope or hook to steady the climb', requirements: { anyItems: ROPE_TOOLS }, timeCost: 4, next: 'criticalCold', effects: { health: -1, historyFlags: ['risked_cold_for_fuel'] } },
      ],
    },
    stormTurnedBack: {
      id: 'stormTurnedBack', title: 'Back Before the Worst Gust', tone: 'warning',
      text: 'You return without wood, but with your balance and fingers intact. From inside, the cabin feels warmer than it did at the shed. The reserve sack and the last match are still options; the storm has not eased.',
      choices: [{ id: 'settleAfterTurningBack', label: 'Close the door and choose how to spend the remaining heat', timeCost: 2, next: 'criticalCold' }],
    },
    criticalCold: {
      id: 'criticalCold', title: 'The Last Warm Hours', tone: 'danger',
      text: 'The stove is still burning, though it ticks as the fuel dwindles. One dry match and the remaining firewood are within reach. Burning the last wood would warm the whole one-room cabin; holding it back leaves everyone colder now but preserves fuel for later. Outside, the pass is nearly erased. If Eli came inside, they are still here sharing the cold.',
      textVariants: [
        { requirements: { flags: ['savedKindling', 'travelerInside', 'savedKindlingUsed'], minElapsedMinutes: 40 }, text: 'The saved branches have burned down and the stove is cold again. Eli shivers beneath the spare blanket. Your match is gone, so the room must last until morning without another fire.' },
        { requirements: { flags: ['savedKindling', 'travelerInside'], notFlags: ['savedKindlingUsed'], minElapsedMinutes: 40 }, text: 'The stove has gone fully out; the saved dry branches remain beside it, but they need the last match to catch. Eli shivers beneath the spare blanket. The single stove warms the whole room.' },
        { requirements: { flags: ['savedKindling'], notFlags: ['savedKindlingUsed'], minElapsedMinutes: 40 }, text: 'The stove has gone fully out. Your saved dry branches remain beside it, but they need the last match to catch. The pass outside is now a white slope.' },
        { requirements: { flags: ['travelerInside'], minElapsedMinutes: 40 }, text: 'The last coals have gone dark; the stove is cold. Eli shivers beneath the spare blanket. One dry match remains, and the pass outside is a white slope.' },
        { requirements: { minElapsedMinutes: 40 }, text: 'The last coals have gone dark; the stove is cold. One dry match remains beneath the glass. Snow has hidden the pass, and leaving is a serious risk.' },
        { requirements: { flags: ['savedKindling', 'travelerInside', 'savedKindlingUsed'], maxElapsedMinutes: 39 }, text: 'The saved branches have caught on the remaining coals. The stove is burning again, warming the whole room; Eli sits beneath the spare blanket.' },
        { requirements: { flags: ['fireFed'], notFlags: ['savedKindling'], maxElapsedMinutes: 39 }, text: 'The dry branches have caught. The stove is burning again, though the wind still steals heat from the cabin.' },
        { requirements: { flags: ['savedKindling', 'travelerInside'], notFlags: ['savedKindlingUsed'], maxElapsedMinutes: 39 }, text: 'Low orange coals still glow in the stove. Your saved dry branches can feed them without using the last match. Eli is in the cabin with you.' },
        { requirements: { flags: ['savedKindling'], notFlags: ['savedKindlingUsed'], maxElapsedMinutes: 39 }, text: 'Low orange coals still glow in the stove. Your saved dry branches can feed them without using the last match; the pass markers are disappearing.' },
        { requirements: { flags: ['travelerInside'], minElapsedMinutes: 25, maxElapsedMinutes: 39 }, text: 'The room has turned bitter. Weak orange embers remain, and their heat reaches the whole cabin. Only the spare blanket can be given to one person.' },
        { requirements: { minElapsedMinutes: 25, maxElapsedMinutes: 39 }, text: 'The room has turned bitter. Weak orange embers remain; the last match is dry, but the fire has not gone out.' },
        { requirements: { flags: ['travelerInside'], maxElapsedMinutes: 39 }, text: 'The stove has fallen to weak embers, not gone out. Eli is in the cabin with you. Any heat from the single stove reaches the whole room.' },
        { requirements: { flags: ['savedKindling', 'savedKindlingUsed'], notFlags: ['travelerInside'], maxElapsedMinutes: 39 }, text: 'The saved branches are spent. A few weak embers remain, and the cabin still blocks the wind.' },
        { requirements: { maxElapsedMinutes: 39 }, text: 'The stove has fallen to weak embers, not gone out. The last match remains dry, but there is no need to relight it yet.' },
      ],
      choices: [
        { id: 'useMatchToRelight', label: 'Use the last match to relight the stove', hint: 'The fire is out; this will use the final match.', requirements: { notFlags: ['lastMatchSpent', 'savedKindling'], minElapsedMinutes: 40 }, timeCost: 2, next: 'stoveRelitLate', effects: { setFlags: ['lastMatchSpent', 'stoveRelit', 'fireFed'], historyFlags: ['used_last_match_for_shelter'] } },
        { id: 'relightSavedKindling', label: 'Use the last match on your saved branches', hint: 'The stove is out. This uses both your reserve fuel and final match.', requirements: { flags: ['savedKindling'], notFlags: ['savedKindlingUsed', 'lastMatchSpent'], minElapsedMinutes: 40 }, timeCost: 2, next: 'stoveRelitLate', effects: { setFlags: ['lastMatchSpent', 'stoveRelit', 'fireFed', 'savedKindlingUsed'], historyFlags: ['used_last_match_for_shelter'] } },
        { id: 'relightAfterUsingSavedFuel', label: 'Use the last match to relight the stove', hint: 'The fire has gone out again; this uses the final match.', requirements: { flags: ['savedKindling', 'savedKindlingUsed'], notFlags: ['lastMatchSpent'], minElapsedMinutes: 40 }, timeCost: 2, next: 'stoveRelitLate', effects: { setFlags: ['lastMatchSpent', 'stoveRelit', 'fireFed'], historyFlags: ['used_last_match_for_shelter'] } },
        { id: 'useMatchToSignal', label: 'Use the last match as a signal outside', hint: 'A response could bring help; the flame may vanish unseen.', requirements: { notFlags: ['lastMatchSpent', 'travelerInside'] }, timeCost: 3, chance: { probability: 0.61, bonusItems: ['minerHeadlamp', 'conductorWhistle', 'trailWhistle', 'farmWhistle', 'windproofMatchCase'], bonusProbability: 0.17, bonusFlags: ['heardRoadKeeper'], successNext: 'signalSeen', failureNext: 'signalUnseen', successMessage: 'A lantern moves on the ridge in answer to your flare.', failureMessage: 'The wind takes the brief flame before anyone can answer.', successEffects: { setFlags: ['lastMatchSpent', 'roadKeeperSignaled'], historyFlags: ['used_last_match_for_help'] }, failureEffects: { setFlags: ['lastMatchSpent', 'signalFailed'], historyFlags: ['used_last_match_for_help'] } } },
        { id: 'shareLastWood', label: 'Burn the remaining wood for the room', hint: 'The coals are still live; one stove warms everyone here.', requirements: { flags: ['travelerInside'], maxElapsedMinutes: 39 }, timeCost: 4, next: 'sharedLastWood', effects: { setFlags: ['lastFuelShared'], historyFlags: ['shared_shelter_in_cold'] } },
        { id: 'keepLastWood', label: 'Hold the remaining fuel for later', hint: 'The coals are still live; the cabin stays colder now, but fuel remains in reserve.', requirements: { flags: ['travelerInside'], maxElapsedMinutes: 39 }, timeCost: 2, next: 'keptLastWood', effects: { setFlags: ['kindlingHeldBack'] } },
        { id: 'feedSavedKindling', label: 'Feed the dry branches to the embers', hint: 'The coals are still live, so the last match stays dry.', requirements: { flags: ['savedKindling'], notFlags: ['savedKindlingUsed'], maxElapsedMinutes: 39 }, timeCost: 3, next: 'embersHeld', effects: { setFlags: ['savedKindlingUsed', 'fireFed'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'holdEmbersAlone', label: 'Huddle by the remaining embers', hint: 'Stay sheltered and conserve what little heat is left.', requirements: { notFlags: ['travelerInside', 'savedKindling'], maxElapsedMinutes: 39 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'holdAfterSavedFuel', label: 'Stay sheltered as the stove cools', hint: 'The saved fuel is spent; the remaining coals will fade.', requirements: { flags: ['savedKindling', 'savedKindlingUsed'], notFlags: ['travelerInside'], maxElapsedMinutes: 39 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'waitInColdCabin', label: 'Stay sheltered beside the cold stove', hint: 'The fire is out, but the cabin still blocks the wind.', requirements: { notFlags: ['travelerInside', 'savedKindling'], minElapsedMinutes: 40 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'waitWithEliByColdStove', label: 'Stay sheltered with Eli beside the cold stove', hint: 'The fire is out, but the cabin still blocks the wind for both of you.', requirements: { flags: ['travelerInside'], minElapsedMinutes: 40 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'waitWithoutIgnition', label: 'Stay sheltered beside the cold stove', hint: 'The saved fuel cannot catch without a match.', requirements: { flags: ['savedKindling'], notFlags: ['travelerInside', 'lastMatchSpent'], minElapsedMinutes: 40 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'waitAfterSavedFuel', label: 'Stay sheltered beside the cold stove', hint: 'The saved fuel is spent, and no match remains.', requirements: { flags: ['savedKindling', 'savedKindlingUsed', 'lastMatchSpent'], notFlags: ['travelerInside'], minElapsedMinutes: 40 }, timeCost: 5, next: 'embersHeld', effects: { setFlags: ['embersConserved'], historyFlags: ['conserved_heat_in_cold'] } },
        { id: 'leaveBeforeDawnEarly', label: 'Leave while the road can still be followed', hint: 'The slope is exposed; a fall could leave you unable to continue.', requirements: { notFlags: ['travelerInside'], maxElapsedMinutes: 44 }, timeCost: 15, chance: { probability: 0.67, bonusItems: OUTDOOR_HELP, bonusProbability: 0.19, successNext: 'roadWardensCabin', failureNext: 'snowbank', successMessage: 'A road warden sees your lantern and brings you into a nearby shelter.', failureMessage: 'The drift hides the track. You fall hard, and the wind immediately buries your footprints.', successEffects: { setFlags: ['abandonedCabinBeforeDawn'], historyFlags: ['abandoned_cabin_before_dawn'] }, failureEffects: { health: -3, setFlags: ['abandonedCabinBeforeDawn', 'severelyExposed'], historyFlags: ['abandoned_cabin_before_dawn'] } } },
        { id: 'leaveInCriticalCold', label: 'Cross the pass in the whiteout', hint: 'Your fingers are numb and the markers are gone; a second fall could be fatal.', requirements: { notFlags: ['travelerInside'], minElapsedMinutes: 45 }, timeCost: 20, chance: { probability: 0.43, bonusItems: OUTDOOR_HELP, bonusProbability: 0.2, successNext: 'roadWardensCabin', failureNext: 'snowbank', successMessage: 'The road warden catches your light through a thinning gust.', failureMessage: 'You lose the track and land in a hard drift, too cold to stand quickly.', successEffects: { setFlags: ['abandonedCabinBeforeDawn'], historyFlags: ['abandoned_cabin_before_dawn'] }, failureEffects: { health: -3, setFlags: ['abandonedCabinBeforeDawn', 'severelyExposed'], historyFlags: ['abandoned_cabin_before_dawn'] } } },
      ],
    },
    stoveRelitLate: {
      id: 'stoveRelitLate', title: 'The Fire Takes', tone: 'safe',
      text: 'The match catches dry tinder. The stove draws slowly, then holds. There will be warmth enough to make it through the last hours, but no second chance to light it if the flame dies again.',
      choices: [{ id: 'stayBesideRelitStove', label: 'Stay beside the stove until morning', timeCost: 22, next: 'rewardOffer' }],
    },
    signalSeen: {
      id: 'signalSeen', title: 'A Lantern on the Ridge', tone: 'safe',
      text: 'The road warden’s lantern moves toward the cabin. The signal cost the last match, but the warden knows the pass and brings a sealed warmth cloak from the shelter store. Eli and Marta are not left alone in the storm.',
      choices: [{ id: 'acceptWardenHelp', label: 'Let the warden guide you all to shelter', timeCost: 8, next: 'rewardOffer', effects: { setFlags: ['rescuedByWarden'], historyFlags: ['rescued_stranded_traveler'] } }],
    },
    signalUnseen: {
      id: 'signalUnseen', title: 'No Light Answers', tone: 'danger',
      text: 'The match burns out without a reply. The wind has swallowed the flare, and the cabin has no dry ignition left. The wall still blocks most of the snow; you can wait for gray light or try the pass at a serious risk.',
      choices: [
        { id: 'waitAfterSignal', label: 'Stay sheltered until the first gray light', hint: 'The cabin is cold, but it remains a roof against the wind.', timeCost: 18, next: 'rewardOffer', effects: { setFlags: ['survivedWithoutFire'] } },
        { id: 'tryRoadAfterSignal', label: 'Try to reach the road warden', hint: 'You have no match left and the route is difficult to see.', timeCost: 10, chance: { probability: 0.49, bonusItems: OUTDOOR_HELP, bonusProbability: 0.18, successNext: 'roadWardensCabin', failureNext: 'snowbank', successMessage: 'You find the warden’s marker through the drifting snow.', failureMessage: 'The slope takes you off the track; your legs shake as you fall.', successEffects: { setFlags: ['abandonedCabinBeforeDawn'], historyFlags: ['abandoned_cabin_before_dawn'] }, failureEffects: { health: -3, setFlags: ['abandonedCabinBeforeDawn', 'severelyExposed'], historyFlags: ['abandoned_cabin_before_dawn'] } } },
      ],
    },
    sharedLastWood: {
      id: 'sharedLastWood', title: 'The Stove Warms the Room', tone: 'warning',
      text: 'You feed all the remaining dry wood to the single stove. The fire burns stronger, and its heat spreads through the one-room cabin. There is no reserve for later, but neither Eli nor you is given a separate share of the fire.',
      choices: [{ id: 'stayWithSharedFire', label: 'Take turns tending the shared fire', timeCost: 16, next: 'rewardOffer', effects: { setFlags: ['travelerWarmthShared'], historyFlags: ['shared_shelter_in_cold'] } }],
    },
    keptLastWood: {
      id: 'keptLastWood', title: 'Fuel Held Back', tone: 'warning',
      text: 'You leave the remaining dry wood in reserve instead of feeding it to the stove. The whole cabin stays colder now, but the fuel may be useful if the fire dies later. The spare blanket is still on the bench; it can warm one person, unlike the stove.',
      choices: [
        { id: 'stayWithYourFuel', label: 'Keep the spare blanket for yourself', timeCost: 12, next: 'rewardOffer', effects: { setFlags: ['blanketKeptForSelf'], historyFlags: ['kept_blanket_for_self_in_cold'] } },
        { id: 'giveEliBlanket', label: 'Give Eli the spare blanket', timeCost: 12, next: 'rewardOffer', effects: { setFlags: ['blanketGivenToEli'], historyFlags: ['shared_shelter_in_cold'] } },
      ],
    },
    embersHeld: {
      id: 'embersHeld', title: 'A Roof Against the Wind', tone: 'warning',
      text: 'You sit close to the stove and make no more demands on the fuel. The iron is losing warmth, but the cabin keeps the wind off you. Outside, snow covers the road until morning.',
      textVariants: [
        { requirements: { flags: ['savedKindlingUsed'], notFlags: ['embersConserved'] }, text: 'The dry fuel you set aside catches on the remaining coals, and the stove gives one last steady warmth. You sit close while it burns down; outside, snow covers the road until morning.' },
        { requirements: { flags: ['embersConserved', 'travelerInside'], minElapsedMinutes: 40 }, text: 'The stove had already gone cold. You and Eli stay beneath the roof, keeping out of the wind until the sky lightens.' },
        { requirements: { flags: ['embersConserved'], minElapsedMinutes: 40 }, text: 'The stove is out. You stay beneath the roof and let the cold hours pass; outside, snow covers the road until morning.' },
      ],
      choices: [{ id: 'waitForGrayLight', label: 'Hold your place until the sky lightens', timeCost: 18, next: 'rewardOffer', effects: { setFlags: ['survivedWithoutFire'] } }],
    },
    snowbank: {
      id: 'snowbank', title: 'Below the Buried Marker', tone: 'danger',
      text: 'The first fall leaves you bruised and nearly numb. You cannot see the cabin door or the road marker. A second exposed push may reach the warden’s light, but with your hands this cold, failing again may finish the journey.',
      choices: [
        { id: 'pushForWardenLight', label: 'Push toward the warden’s light', hint: 'You are already injured by the cold; this is a last, dangerous attempt.', timeCost: 14, chance: { probability: 0.48, bonusItems: OUTDOOR_HELP, bonusProbability: 0.18, successNext: 'roadWardensCabin', failureNext: 'fatalExposure', successMessage: 'The warden reaches you before the snow closes over the path.', failureMessage: 'Your legs give way, and the wind buries the last visible track.' } },
        { id: 'takeShedWindbreak', label: 'Crawl to the shed’s lee side and wait', hint: 'The wall will block the wind, but the wait will be long and cold.', timeCost: 12, next: 'shedWindbreak' },
        { id: 'ropeBackToCabin', label: 'Use your carried rope to find the cabin wall', requirements: { items: ['travelRope'] }, timeCost: 8, next: 'coldReturn', effects: { health: -1 } },
      ],
    },
    shedWindbreak: {
      id: 'shedWindbreak', title: 'A Narrow Place out of the Wind', tone: 'warning',
      text: 'The shed blocks the worst gusts. Your legs are stiff and your hands barely close, but you can keep your face out of the snow. Dawn will be slow here; the warden may find the tracks once visibility returns.',
      choices: [
        { id: 'waitAtShed', label: 'Stay behind the wall until daylight', timeCost: 24, next: 'outsideDawn', effects: { setFlags: ['abandonedCabinBeforeDawn'], historyFlags: ['abandoned_cabin_before_dawn'] } },
        { id: 'riskFinalRoadPush', label: 'Make one final push toward the road', hint: 'Your strength is low; another fall may be fatal.', timeCost: 12, chance: { probability: 0.39, bonusItems: OUTDOOR_HELP, bonusProbability: 0.2, successNext: 'roadWardensCabin', failureNext: 'fatalExposure', successMessage: 'The warden spots your movement and reaches you.', failureMessage: 'You cannot keep your feet beneath you in the drift.' } },
      ],
    },
    coldReturn: {
      id: 'coldReturn', title: 'Back at the Cabin Wall', tone: 'danger',
      text: 'The rope brings you to the cabin without another fall. Marta pulls you in and wraps your hands, but the climb has taken the last of your strength. The stove remains where you left it; the storm has not.',
      choices: [{ id: 'warmAfterReturn', label: 'Let Marta tend your hands and keep the shelter', timeCost: 10, next: 'rewardOffer', effects: { health: -1 } }],
    },
    roadWardensCabin: {
      id: 'roadWardensCabin', title: 'A Light Kept for the Pass', tone: 'safe',
      text: 'The road warden gets you into a heated shelter above the pass. From there, a search party can check the cabin and the road once visibility improves. Eli and Marta are accounted for if they were with you; if not, the storm leaves their route uncertain. The warden offers a spare match case or a wool blanket for the next road.',
      choices: [
        { id: 'takeMatchCaseAtWarden', label: 'Accept the Windproof Match Case', requirements: { notItems: ['windproofMatchCase'] }, next: 'escapeEnding', effects: { gainItems: ['windproofMatchCase'] } },
        { id: 'takeBlanketAtWarden', label: 'Accept the Wool Travel Blanket', requirements: { notItems: ['woolTravelBlanket'] }, next: 'escapeEnding', effects: { gainItems: ['woolTravelBlanket'] } },
        { id: 'declineWardenGear', label: 'Thank the warden and take no gear', next: 'escapeEnding' },
      ],
    },
    rewardOffer: {
      id: 'rewardOffer', title: 'First Gray Light', tone: 'safe',
      text: 'The storm eases just enough for the cabin door to open. Marta thanks you for keeping the shelter standing. She offers a windproof match case or a wool travel blanket—useful on a road that may turn cold again.',
      textVariants: [
        { requirements: { flags: ['travelerInside'] }, text: 'The storm eases. Eli and Marta are both alive in the cabin; neither slept much, and neither claims the night was comfortable. Marta thanks you for sharing the shelter and offers a windproof match case or a wool travel blanket.' },
        { requirements: { flags: ['propertyBurned'] }, text: 'The storm eases. The chair is gone, but the cabin stands and Marta is safe. She thanks you for choosing heat over the furniture and offers a windproof match case or a wool travel blanket.' },
        { requirements: { flags: ['travelerOutside', 'lastMatchSpent'] }, text: 'The storm eases. The last match is gone, and you cannot know whether Eli found the shed or the road. Marta thanks you for staying through the night and offers a windproof match case or a wool travel blanket.' },
        { requirements: { flags: ['travelerOutside'] }, text: 'The storm eases. Eli’s tracks disappear under new snow; you cannot know whether they found the shed or the road. Marta thanks you for staying through the night and offers a windproof match case or a wool travel blanket.' },
      ],
      choices: [
        { id: 'acceptWindproofCase', label: 'Take the Windproof Match Case', requirements: { notItems: ['windproofMatchCase'] }, next: 'dawnEnding', effects: { gainItems: ['windproofMatchCase'] } },
        { id: 'acceptWoolBlanket', label: 'Take the Wool Travel Blanket', requirements: { notItems: ['woolTravelBlanket'] }, next: 'dawnEnding', effects: { gainItems: ['woolTravelBlanket'] } },
        { id: 'declineCabinReward', label: 'Thank Marta and leave without gear', next: 'dawnEnding' },
      ],
    },
    dawnEnding: {
      id: 'dawnEnding', title: 'Warmth, Whatever It Cost', tone: 'safe', ending: 'success',
      text: 'Morning comes through the cabin window. The cold has not been beaten so much as bargained with, one choice at a time.',
      textVariants: [
        { requirements: { flags: ['travelerInside', 'travelerWarmthShared'] }, text: 'Morning finds you, Eli, and Marta alive in the cabin. You shared bread and the spare blanket while the single stove warmed the room; none of you got much sleep, but no one faced the storm alone.' },
        { requirements: { flags: ['travelerInside', 'blanketKeptForSelf'] }, text: 'Morning finds you, Eli, and Marta alive. You kept the spare blanket for yourself while Eli stayed nearer the stove. Neither of you could claim a separate share of its heat.' },
        { requirements: { flags: ['travelerInside', 'blanketGivenToEli'] }, text: 'Morning finds you, Eli, and Marta alive. Eli had the spare blanket while you sat nearer the stove; the fire warmed the common room as best it could.' },
        { requirements: { flags: ['travelerInside'] }, text: 'Morning finds you, Eli, and Marta alive in the cabin. The stove never made the night easy, but the door stayed shut and you shared what warmth you could.' },
        { requirements: { flags: ['propertyBurned'] }, text: 'Morning finds you alive. The chair is ash, and the room is cold again, but the stove held long enough. Marta will have to replace the furniture before the next traveler arrives.' },
        { requirements: { flags: ['refusedShelterInCold'] }, text: 'Morning finds you alive in Marta’s cabin. Eli’s tracks have vanished under new snow; you cannot say whether they found the shed or the road. The choice to keep the door closed is yours to carry.' },
        { requirements: { flags: ['stoveRelit'] }, text: 'Morning finds you alive beside a stove that held through the worst of the wind. The last match bought warmth, but left no way to signal if the fire had failed.' },
        { requirements: { flags: ['savedKindling', 'savedKindlingUsed'] }, text: 'Morning finds you alive. The dry branches you saved were used when the fire needed them; the room cooled first, but the reserve helped you through the night.' },
        { requirements: { flags: ['savedKindling'], notFlags: ['savedKindlingUsed'] }, text: 'Morning finds you alive. The saved branches remain unused beside the cold stove; they could not replace the match after the coals went dark.' },
      ],
      choices: [],
    },
    escapeEnding: {
      id: 'escapeEnding', title: 'A Shelter Beyond the Pass', tone: 'safe', ending: 'success',
      text: 'You reach the road warden’s heated shelter before the cold takes your strength. The cabin and anyone still there will be checked when the storm lifts.',
      textVariants: [{ requirements: { flags: ['travelerInside'] }, text: 'You and Eli reach the road warden’s shelter. The cabin is left behind, but you did not make the crossing alone.' }],
      choices: [],
    },
    outsideDawn: {
      id: 'outsideDawn', title: 'Found at Daybreak', tone: 'safe', ending: 'success',
      text: 'The warden finds you behind the shed when daylight makes the tracks visible. Your hands are stiff and your clothes are damp, but the windbreak held long enough. The cabin was not the only shelter on the pass.',
      choices: [],
    },
    fatalExposure: {
      id: 'fatalExposure', title: 'The Pass Takes Its Due', tone: 'danger', ending: 'death',
      text: 'Your strength is already spent from the fall and the cold. The wind covers the tracks before help can reach you. The choice to cross the pass was warned, and the storm proves stronger than your last attempt.',
      choices: [],
    },
  },
};
