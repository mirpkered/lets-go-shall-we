import type { Scenario } from '../types';

const end = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });

export const THE_LANTERN_IN_THE_MARSH: Scenario = {
  id: 'the-lantern-in-the-marsh', title: 'The Lantern in the Marsh', subtitle: 'A moving light crosses ground where no road is marked.', startScene: 'marshSighting',
  runRandomSelections: [{ id: 'marshLight', values: [{ value: 'lostTraveler' }, { value: 'nightWorkers' }, { value: 'marshGlow' }, { value: 'unexplained' }] }],
  scenes: {
    marshSighting: { id: 'marshSighting', title: 'A Light Beyond the Reeds', tone: 'warning', text: 'From the raised road, you see a warm light moving across the marsh where no marked track runs. Reeds hide the ground below, and a shallow ditch cuts between you and the glow. It may be a person, a worker, or only a trick of distance.', choices: [
      { id: 'callMarshLight', label: 'Call out from the raised road', timeCost: 2, next: 'marshReply', effects: { knowledge: ['A lantern moved across the marsh below the raised road; the ground was hidden by reeds.'] } },
      { id: 'watchMarshLight', label: 'Watch from firm ground', timeCost: 4, next: 'marshObserved' },
      { id: 'followMarshLight', label: 'Follow it through the reeds', hint: 'The ground is hidden and the ditch may be deeper than it looks.', timeCost: 8, chance: { probability: 0.72, successNext: 'marshNearLight', failureNext: 'marshWetBoots', successMessage: 'You find a careful way down and keep the light in view.', failureMessage: 'A hidden patch of soft ground gives way beneath your foot.', failureEffects: { health: -1 } } },
      { id: 'leaveMarshLight', label: 'Keep to the road and continue', next: 'marshPassed' },
    ] },
    marshReply: { id: 'marshReply', title: 'An Answer in the Reeds', tone: 'safe', text: 'A voice answers from the marsh, but wind and distance blur the words. The light pauses, then moves again. You have not established who is carrying it.', textVariants: [
      { requirements: { selections: { marshLight: 'lostTraveler' } }, text: 'A tired voice calls that the road is somewhere to the left. The light is still several yards off, beyond the ditch.' },
      { requirements: { selections: { marshLight: 'nightWorkers' } }, text: 'Two workers answer that they are checking a sluice gate. Their second lantern appears farther to the east.' },
      { requirements: { selections: { marshLight: 'marshGlow' } }, text: 'No voice answers. The light thins and spreads across the mist, though you cannot tell whether it moved or faded.' },
      { requirements: { selections: { marshLight: 'unexplained' } }, text: 'No voice answers. The lantern passes behind a stand of reeds, but no glow shows through when it should emerge.' },
    ], choices: [
      { id: 'stayForReply', label: 'Wait on the road for another sign', timeCost: 5, next: 'marshObserved' },
      { id: 'leaveAfterReply', label: 'Leave the marsh untroubled', next: 'marshPassed' },
    ] },
    marshObserved: { id: 'marshObserved', title: 'A Pattern, or No Pattern', tone: 'safe', text: 'The light makes one slow pass across the reeds. From here, you cannot safely tell what carries it or whether anything is trying to get your attention.', choices: [
      { id: 'lensOnMarsh', label: 'Look through the Crimson Signal Lens', requirements: { items: ['signalLens'] }, timeCost: 3, next: 'marshLensSeen', effects: { knowledge: ['Through the Crimson Signal Lens, a faint red blink appeared once beyond the marsh reeds.'] } },
      { id: 'watchOneMorePass', label: 'Step to the ditch and watch', timeCost: 3, next: 'marshNearLight' },
      { id: 'turnFromMarsh', label: 'Turn back to the marked road', next: 'marshPassed' },
    ] },
    marshLensSeen: end('marshLensSeen', 'A Red Blink', 'Through the red glass, you catch one brief blink beyond the reeds. It could be a worker’s signal, a reflection, or a light with no visible source. The lens sharpens the sight; it does not explain it.'),
    marshNearLight: { id: 'marshNearLight', title: 'The Far Side of the Ditch', tone: 'warning', text: 'You reach the ditch’s edge but do not cross. The light is now on the other side, still moving. Reeds and dark water make a direct approach uncertain.', textVariants: [
      { requirements: { selections: { marshLight: 'lostTraveler' } }, text: 'A traveler waves from a strip of firm ground and points toward a faint footpath back to the road.' },
      { requirements: { selections: { marshLight: 'nightWorkers' } }, text: 'A pair of workers carry the lamp along a raised bank toward a sluice. They have no need of your help.' },
      { requirements: { selections: { marshLight: 'marshGlow' } }, text: 'The light lies low over the reeds, without a visible hand or lantern frame. A breath of wind passes, but it does not flicker.' },
      { requirements: { selections: { marshLight: 'unexplained' } }, text: 'The glow stops beyond the ditch. When you blink, it is farther away than the marsh is wide.' },
    ], choices: [
      { id: 'returnFromDitch', label: 'Return to firm ground', next: 'marshPassed' },
      { id: 'callAcrossDitch', label: 'Call once more, without crossing', timeCost: 2, next: 'marshNearReply' },
    ] },
    marshNearReply: end('marshNearReply', 'A Voice across the Ditch', 'A distant answer reaches you from beyond the reeds, but it is too faint to understand. You return to the raised road without crossing the hidden ditch.'),
    marshWetBoots: end('marshWetBoots', 'Cold Water, No Answer', 'Your boot sinks into a hidden pocket of mud before you pull free. The light has moved beyond the reeds. You are wet and slightly bruised, but the raised road is close.'),
    marshPassed: end('marshPassed', 'The Road Holds Its Course', 'You continue along the raised road. The light is gone from view by the next bend, and you never learn whether it belonged to a traveler, a worker, or something without a lantern.'),
  },
};

export const THE_HOUSE_THAT_KNOCKS: Scenario = {
  id: 'the-house-that-knocks', title: 'The House That Knocks', subtitle: 'Three knocks come from a sealed wall between two rooms.', startScene: 'knockingRoom',
  runRandomSelections: [{ id: 'knockCause', values: [{ value: 'mouse' }, { value: 'settling' }, { value: 'hiddenTin' }, { value: 'unexplained' }] }],
  scenes: {
    knockingRoom: { id: 'knockingRoom', title: 'Three Taps from the Wall', tone: 'warning', text: 'You are lodging in a farmhouse room that shares a solid plaster wall with the pantry. It has no door or opening. Three distinct knocks sound from within the wall, then stop. The farmer is in the kitchen across the hall.', choices: [
      { id: 'listenHouseWall', label: 'Put an ear to the plaster', timeCost: 2, next: 'wallListened' },
      { id: 'askFarmhouseOwner', label: 'Ask the farmer what lies behind it', timeCost: 3, next: 'farmerAnswers' },
      { id: 'inspectBothRooms', label: 'Check the pantry and your room', timeCost: 4, next: 'wallInspected' },
      { id: 'ignoreHouseKnocks', label: 'Leave the room and let it be', next: 'houseLeft' },
    ] },
    wallListened: { id: 'wallListened', title: 'The Sound Does Not Repeat', tone: 'safe', text: 'The plaster is cool and unbroken. You hear one softer scrape, though it might be a branch outside, something in the pantry, or wood shifting in the frame.', choices: [
      { id: 'askAfterListening', label: 'Ask the farmer about the house', timeCost: 3, next: 'farmerAnswers' },
      { id: 'checkPantryAfterListening', label: 'Look along the pantry wall', timeCost: 3, next: 'wallInspected' },
      { id: 'leaveAfterListening', label: 'Leave the question unanswered', next: 'houseLeft' },
    ] },
    farmerAnswers: { id: 'farmerAnswers', title: 'An Old Repair', tone: 'safe', text: 'The farmer says a narrow pantry cupboard was removed years ago and the doorway plastered over. There is no known room between the pantry and your room, only a cavity where the old shelves stood.', choices: [
      { id: 'inspectOldRepair', label: 'Examine the plaster from both sides', timeCost: 4, next: 'wallInspected' },
      { id: 'takeFarmhouseElsewhere', label: 'Ask to sleep in another room', next: 'houseLeft' },
    ] },
    wallInspected: { id: 'wallInspected', title: 'A Shallow Cavity', tone: 'safe', text: 'The pantry shelves sit against the same stretch of wall. A hairline crack follows one old plaster seam; nothing suggests a person could fit behind it.', textVariants: [
      { requirements: { selections: { knockCause: 'mouse' } }, text: 'A small mouse darts from beneath a pantry sack. Its claws click twice against a loose shelf board; the farmer smiles at the likely source.' },
      { requirements: { selections: { knockCause: 'settling' } }, text: 'The farmer presses the old seam. A timber behind the plaster gives one dry tick as the house cools in the evening.' },
      { requirements: { selections: { knockCause: 'hiddenTin' } }, text: 'A loose shelf board shifts and reveals a small tin left in the shallow cupboard cavity. The farmer opens it: a child’s wooden counters, forgotten during the repair.' },
      { requirements: { selections: { knockCause: 'unexplained' } }, text: 'No mouse, loose shelf, or moving timber appears. As you turn away, three gentle knocks answer from the sealed wall.' },
    ], choices: [
      { id: 'tellFarmerWhatFound', label: 'Tell the farmer what you heard or found', next: 'houseSettled' },
      { id: 'leaveHouseWall', label: 'Leave the old wall alone', next: 'houseLeft' },
    ] },
    houseSettled: end('houseSettled', 'The House Grows Quiet', 'The farmer checks the pantry after you explain what you found. The small room is again an ordinary farmhouse room, though the last three knocks have no clear source.'),
    houseLeft: end('houseLeft', 'Another Room for the Night', 'You leave the wall and sleep elsewhere in the farmhouse. The knocks do not follow you, and you make no claim about what caused them.'),
  },
};

export const THE_GRAVE_BELL: Scenario = {
  id: 'the-grave-bell', title: 'The Grave Bell', subtitle: 'A small bell rings at the edge of a village cemetery.', startScene: 'cemeteryBell',
  runRandomSelections: [{ id: 'graveBellCause', values: [{ value: 'windAndSpring' }, { value: 'animal' }, { value: 'groundskeeper' }, { value: 'unexplained' }] }],
  scenes: {
    cemeteryBell: { id: 'cemeteryBell', title: 'A Bell at the Gate', tone: 'warning', text: 'At dusk, a small bell rings beside the cemetery gate. Its cord hangs on the cemetery side of the low stone wall, beyond the closed gate where you stand. There is no house close enough for a servant to ring it by hand.', choices: [
      { id: 'inspectGraveBell', label: 'Enter through the gate to inspect it', timeCost: 3, next: 'bellRope' },
      { id: 'listenGraveBell', label: 'Wait and listen for another ring', timeCost: 4, next: 'bellHeard' },
      { id: 'readGraveBellRelic', label: 'Hold a keepsake and listen', requirements: { anyItems: ['graveCoin', 'yewCharm'] }, timeCost: 3, next: 'bellRelicResponse', effects: { knowledge: ['A keepsake reacted subtly while the cemetery bell rang; it did not identify the cause.'] } },
      { id: 'leaveGraveBell', label: 'Leave the cemetery gate undisturbed', next: 'bellUnanswered' },
    ] },
    bellRope: { id: 'bellRope', title: 'A Slack Pull-Cord', tone: 'safe', text: 'The cord hangs slack below the bell. It runs through a guide on the cemetery wall and ends at a small iron loop near the gate. Nothing is caught on it now.', textVariants: [
      { requirements: { selections: { graveBellCause: 'windAndSpring' } }, text: 'A light gust moves the cord, and a tired return spring lets the bell tremble once.' },
      { requirements: { selections: { graveBellCause: 'animal' } }, text: 'A fox slips between two headstones and vanishes through a gap in the back hedge. It may have brushed the cord.' },
      { requirements: { selections: { graveBellCause: 'groundskeeper' } }, text: 'Fresh boot marks lead from the iron loop toward a small tool shed inside the cemetery.' },
      { requirements: { selections: { graveBellCause: 'unexplained' } }, text: 'The cord remains perfectly still, but the bell gives a single clear note.' },
    ], choices: [
      { id: 'followBellCord', label: 'Follow the cord toward the shed', timeCost: 3, next: 'bellShed' },
      { id: 'askVillageAboutBell', label: 'Leave by the gate and ask in the village', timeCost: 5, next: 'bellLocalAccount' },
      { id: 'leaveBellRope', label: 'Leave through the gate', next: 'bellUnanswered' },
    ] },
    bellHeard: { id: 'bellHeard', title: 'One More Note', tone: 'warning', text: 'The bell sounds again, though no one stands beside the cord. You remain outside the wall, with the gate between you and the graves.', choices: [
      { id: 'stepThroughBellGate', label: 'Open the gate and check the tool shed', timeCost: 4, next: 'bellShed' },
      { id: 'walkBackToVillage', label: 'Ask someone in the village about it', timeCost: 5, next: 'bellLocalAccount' },
      { id: 'walkFromBell', label: 'Walk back toward the village', next: 'bellUnanswered' },
    ] },
    bellShed: { id: 'bellShed', title: 'The Shed Beside the Path', tone: 'safe', text: 'The little shed stands just inside the gate, ten paces from the bell. Its door is open. No one is hurt or hiding there.', textVariants: [
      { requirements: { selections: { graveBellCause: 'windAndSpring' } }, text: 'Inside the shed, you spot a worn return spring. It can be replaced in daylight.' },
      { requirements: { selections: { graveBellCause: 'animal' } }, text: 'The groundskeeper joins you from the gate and finds no cord damage. Small animals sometimes pass through the back hedge.' },
      { requirements: { selections: { graveBellCause: 'groundskeeper' } }, text: 'A groundskeeper steps out carrying a short-handled rake. They had tested the bell after repairing its cord and forgot that sound carries across the lane.' },
      { requirements: { selections: { graveBellCause: 'unexplained' } }, text: 'The shed is empty. Behind you, the bell rings once more, though the cord hangs untouched.' },
    ], choices: [
      { id: 'askGroundskeeperBell', label: 'Ask the groundskeeper about the bell', next: 'bellGroundskeeperAnswer' },
      { id: 'leaveBellShed', label: 'Leave the cemetery by the same gate', next: 'bellUnanswered' },
    ] },
    bellLocalAccount: { id: 'bellLocalAccount', title: 'No Need for a Verdict', tone: 'safe', text: 'You walk to the nearest house and ask about the bell. A villager says it is used to call the groundskeeper, but no one can confirm who rang it tonight. The cemetery is quiet now.', textVariants: [
      { requirements: { selections: { graveBellCause: 'groundskeeper' } }, text: 'You walk to the nearest house and ask about the bell. A villager says the groundskeeper was testing the cord earlier, but no one knows who rang it tonight.' },
    ], choices: [
      { id: 'thankVillagerBell', label: 'Thank them and continue on', next: 'bellUnanswered' },
    ] },
    bellGroundskeeperAnswer: end('bellGroundskeeperAnswer', 'A Groundskeeper’s Explanation', 'The groundskeeper says they tested the bell after repairing its cord and forgot that the sound carries across the lane. You leave through the gate; no one was in danger.'),
    bellRelicResponse: { id: 'bellRelicResponse', title: 'A Small Change', tone: 'safe', text: 'The keepsake rests against your palm. The evening air is cool, and the bell’s cause remains unknown.', textVariants: [
      { requirements: { items: ['graveCoin'], selections: { graveBellCause: 'unexplained' } }, text: 'The Grave Coin grows cold for a moment, then returns to its ordinary temperature. It gives no direction and identifies no cause.' },
      { requirements: { items: ['graveCoin'], selections: { graveBellCause: 'windAndSpring' } }, text: 'The Grave Coin remains at its usual temperature. The slack cord and tired spring offer an ordinary explanation for the bell.' },
      { requirements: { items: ['graveCoin'], selections: { graveBellCause: 'animal' } }, text: 'The Grave Coin remains at its usual temperature. A fox may have brushed the cord while passing through the hedge.' },
      { requirements: { items: ['graveCoin'], selections: { graveBellCause: 'groundskeeper' } }, text: 'The Grave Coin remains at its usual temperature. The groundskeeper’s fresh boot marks lead to the bell shed.' },
      { requirements: { items: ['yewCharm'], selections: { graveBellCause: 'unexplained' } }, text: 'The Yew Charm’s red thread draws taut for a heartbeat, though there is no breeze. It gives no direction and identifies no cause.' },
      { requirements: { items: ['yewCharm'], selections: { graveBellCause: 'windAndSpring' } }, text: 'The Yew Charm hangs slack as before. A gust moves the cord and the tired spring trembles.' },
      { requirements: { items: ['yewCharm'], selections: { graveBellCause: 'animal' } }, text: 'The Yew Charm hangs slack as before. The fox has already slipped through the hedge.' },
      { requirements: { items: ['yewCharm'], selections: { graveBellCause: 'groundskeeper' } }, text: 'The Yew Charm hangs slack as before. Fresh boot marks lead toward the tool shed.' },
    ], choices: [
      { id: 'walkAfterRelicBell', label: 'Put the keepsake away and leave', next: 'bellUnanswered' },
    ] },
    bellUnanswered: end('bellUnanswered', 'A Quiet Gate', 'You leave the cemetery without disturbing the graves. The bell may have had an ordinary cause, or it may remain a sound without an answer.'),
  },
};

export const THE_PASSENGER_WHO_WASN_T_THERE: Scenario = {
  id: 'the-passenger-who-wasnt-there', title: 'The Passenger Who Wasn’t There', subtitle: 'A quiet conversation is remembered by only one traveler.', startScene: 'coachPassenger',
  runRandomSelections: [{ id: 'passengerTruth', values: [{ value: 'flagStop' }, { value: 'mistakenPassenger' }, { value: 'forgottenWorker' }, { value: 'unexplained' }] }],
  scenes: {
    coachPassenger: { id: 'coachPassenger', title: 'A Seat Across the Aisle', tone: 'safe', text: 'On a shared railway coach, a gray-coated passenger sits across the aisle and speaks with you while the train crosses open country. They ask whether the line still follows the river. At the next stop, you look up and the seat is empty.', choices: [
      { id: 'askCoachConductor', label: 'Ask the conductor who left the seat', timeCost: 3, next: 'passengerAsked', effects: { historyFlags: ['met_unremembered_passenger'] } },
      { id: 'rememberCoachConversation', label: 'Write down what the passenger said', timeCost: 3, next: 'passengerNote', effects: { historyFlags: ['met_unremembered_passenger'] } },
      { id: 'checkCoachPlatform', label: 'Look along the platform', timeCost: 3, next: 'passengerPlatform', effects: { historyFlags: ['met_unremembered_passenger'] } },
      { id: 'letPassengerGo', label: 'Let the empty seat remain unexplained', next: 'passengerUnresolved', effects: { historyFlags: ['met_unremembered_passenger'] } },
    ] },
    passengerAsked: { id: 'passengerAsked', title: 'No One Remembers Them', tone: 'safe', text: 'The conductor remembers no gray-coated passenger. A porter recalls seeing someone at the last stop but cannot say whether they boarded this coach.', textVariants: [
      { requirements: { selections: { passengerTruth: 'flagStop' } }, text: 'The conductor says the train paused at a flag stop where passengers sometimes board without buying a ticket in the coach.' },
      { requirements: { selections: { passengerTruth: 'mistakenPassenger' } }, text: 'The porter says the coat may have belonged to a railway worker carrying parcels through the aisle.' },
      { requirements: { selections: { passengerTruth: 'forgottenWorker' } }, text: 'A station hand says a gray-coated railway clerk changed coaches during the stop, though no one recalls the river question.' },
      { requirements: { selections: { passengerTruth: 'unexplained' } }, text: 'The porter remembers no one boarding, and the conductor finds no ticket stub for the empty seat.' },
    ], choices: [
      { id: 'askPassengerAnother', label: 'Ask one other passenger what they saw', timeCost: 3, next: 'passengerPlatform' },
      { id: 'leavePassengerQuestion', label: 'Leave the account incomplete', next: 'passengerUnresolved' },
    ] },
    passengerNote: { id: 'passengerNote', title: 'The River Question', tone: 'safe', text: 'You write down the passenger’s question about the river route. The note preserves your memory, not proof that anyone else shared the conversation.', choices: [
      { id: 'compareCoachMemory', label: 'Compare notes with another traveler', timeCost: 3, next: 'passengerPlatform' },
      { id: 'keepCoachNote', label: 'Keep the note and stop asking', next: 'passengerUnresolved' },
    ] },
    passengerPlatform: { id: 'passengerPlatform', title: 'A Stop in the Open Country', tone: 'safe', text: 'The platform is short, with a single bench and no waiting room. No one in sight wears a gray coat. The train whistle sounds; you must decide whether the question matters enough to delay your journey.', textVariants: [
      { requirements: { selections: { passengerTruth: 'flagStop' } }, text: 'A porter says someone in a gray coat stepped down at the previous flag stop, but no one saw them board again.' },
      { requirements: { selections: { passengerTruth: 'mistakenPassenger' } }, text: 'Another passenger remembers a parcel carrier in a gray coat, but not anyone speaking across the aisle.' },
      { requirements: { selections: { passengerTruth: 'forgottenWorker' } }, text: 'A railway clerk says they changed coaches at the last stop. They cannot say whether they spoke with you.' },
      { requirements: { selections: { passengerTruth: 'unexplained' } }, text: 'The platform and carriage hold no sign of the passenger. You remember the conversation clearly; the others do not.' },
    ], choices: [
      { id: 'boardAfterPassengerSearch', label: 'Board the coach and continue', next: 'passengerUnresolved' },
    ] },
    passengerUnresolved: end('passengerUnresolved', 'An Empty Seat', 'The train moves on. The conversation may have been ordinary and briefly forgotten; it may have been with someone who left unseen. Your memory is the only account you can be certain of.'),
  },
};

export const THE_COLD_ROOM: Scenario = {
  id: 'the-cold-room', title: 'The Cold Room', subtitle: 'One room in a roadside inn refuses to warm with the rest.', startScene: 'coldRoomOffered',
  runRandomSelections: [{ id: 'coldRoomCause', values: [{ value: 'windowDraft' }, { value: 'servicePassage' }, { value: 'chimneyFault' }, { value: 'unexplained' }] }],
  scenes: {
    coldRoomOffered: { id: 'coldRoomOffered', title: 'The Room at the End', tone: 'warning', text: 'A roadside inn offers you a small room at the end of the upstairs hall. Its single window faces the yard; a narrow chimney stands on the opposite wall. The innkeeper says the room has been colder than the others since yesterday.', choices: [
      { id: 'checkColdWindow', label: 'Check the window and its frame', timeCost: 3, next: 'coldRoomExamined' },
      { id: 'askColdInnkeeper', label: 'Ask about the chimney and repairs', timeCost: 3, next: 'coldRoomAccount' },
      { id: 'requestOtherColdRoom', label: 'Ask for a warmer place to sleep', next: 'coldRoomLeft' },
      { id: 'stayInColdRoom', label: 'Stay and see whether it warms', timeCost: 10, next: 'coldRoomNight' },
    ] },
    coldRoomExamined: { id: 'coldRoomExamined', title: 'No Broken Pane', tone: 'safe', text: 'The window is shut and its glass is whole. The floorboards, window, and chimney occupy the expected walls; there is no hidden doorway in the room.', textVariants: [
      { requirements: { selections: { coldRoomCause: 'windowDraft' } }, text: 'A thin draft slips through the lower window frame. The sash is old but can be wedged with folded cloth.' },
      { requirements: { selections: { coldRoomCause: 'servicePassage' } }, text: 'The wall beside the chimney is colder than the window. A faint scrape comes from a narrow service passage behind it.' },
      { requirements: { selections: { coldRoomCause: 'chimneyFault' } }, text: 'The chimney draws poorly. A loose damper lets cold air sink into the room when the fire downstairs dies.' },
      { requirements: { selections: { coldRoomCause: 'unexplained' } }, text: 'The glass is dry and the frame sealed. Your breath clouds near the bed, though the hall outside is warm.' },
    ], choices: [
      { id: 'tellInnkeeperDraft', label: 'Tell the innkeeper what you found', next: 'coldRoomAccount' },
      { id: 'sleepAfterColdCheck', label: 'Take another room for the night', next: 'coldRoomLeft' },
    ] },
    coldRoomAccount: { id: 'coldRoomAccount', title: 'The Innkeeper’s Explanation', tone: 'safe', text: 'The innkeeper listens without insisting on an answer. They can offer another room, or you can stay while they inspect the chimney in daylight.', textVariants: [
      { requirements: { selections: { coldRoomCause: 'windowDraft' } }, text: 'The innkeeper brings a strip of felt to wedge beneath the sash. The room may be comfortable enough once the draft is blocked.' },
      { requirements: { selections: { coldRoomCause: 'servicePassage' } }, text: 'The innkeeper recalls a narrow service passage beside the chimney, sealed years ago. They will ask the carpenter to inspect it tomorrow.' },
      { requirements: { selections: { coldRoomCause: 'chimneyFault' } }, text: 'The innkeeper admits the damper has been stiff since the last cleaning and promises to have the sweep look at it.' },
      { requirements: { selections: { coldRoomCause: 'unexplained' } }, text: 'The innkeeper checks the fireplace and window, then feels the wall. They find no obvious cause and offer you a different room.' },
    ], choices: [
      { id: 'stayAfterColdTalk', label: 'Stay after the innkeeper’s check', next: 'coldRoomNight' },
      { id: 'moveAfterColdTalk', label: 'Take the warmer room instead', next: 'coldRoomLeft' },
    ] },
    coldRoomNight: end('coldRoomNight', 'A Night in the Cold Room', 'You sleep in the room with an extra blanket. It may have a draft, a faulty chimney, or no ordinary explanation you can find. The innkeeper says the carpenter will look at it in the morning.'),
    coldRoomLeft: end('coldRoomLeft', 'A Warmer Bed', 'You accept a different room and leave the cold one to the innkeeper. No one asks you to prove why it felt wrong.'),
  },
};

export const THE_VOICE_IN_THE_MINE: Scenario = {
  id: 'the-voice-in-the-mine', title: 'The Voice in the Mine', subtitle: 'A call for help comes from beyond a marked side tunnel.', startScene: 'mineCall',
  runRandomSelections: [{ id: 'mineVoice', values: [{ value: 'guideCalling' }, { value: 'otherWorker' }, { value: 'airEcho' }, { value: 'unexplained' }] }],
  scenes: {
    mineCall: { id: 'mineCall', title: 'A Familiar-Sounding Call', tone: 'danger', text: 'You have entered the mine with a guide who is waiting near the main entrance. From the marked side tunnel, a voice calls, “Help me.” It sounds like the guide, but the tunnel narrows beyond the first support and has not been checked today.', choices: [
      { id: 'callMineGuide', label: 'Call back toward the entrance', timeCost: 2, next: 'mineCallAnswered' },
      { id: 'checkMineSupport', label: 'Inspect the first tunnel support', timeCost: 3, next: 'mineSupport' },
      { id: 'followMineVoice', label: 'Go toward the voice', hint: 'The passage narrows past the first support; loose stone is visible.', timeCost: 5, chance: { probability: 0.68, successNext: 'mineVoiceReached', failureNext: 'mineDustFall', successMessage: 'The first support holds while you move carefully into the passage.', failureMessage: 'Loose grit rains from the roof as a stone shifts near your shoulder.', failureEffects: { health: -2 } } },
      { id: 'leaveMineVoice', label: 'Back out to the main entrance', next: 'mineSafeExit' },
    ] },
    mineCallAnswered: { id: 'mineCallAnswered', title: 'An Answer from Outside', tone: 'warning', text: 'The guide answers from the entrance, clearly behind you. The voice in the side tunnel does not answer again.', textVariants: [
      { requirements: { selections: { mineVoice: 'guideCalling' } }, text: 'The guide says they never called. Their voice and the one in the tunnel sounded alike to you.' },
      { requirements: { selections: { mineVoice: 'otherWorker' } }, text: 'A second worker at the entrance says no one else entered the mine today.' },
      { requirements: { selections: { mineVoice: 'airEcho' } }, text: 'The guide says air can carry words strangely through the old workings.' },
      { requirements: { selections: { mineVoice: 'unexplained' } }, text: 'The guide heard only your call. The side tunnel gives no further sound.' },
    ], choices: [
      { id: 'askGuideMineSupport', label: 'Ask the guide to check the entrance map', timeCost: 3, next: 'mineMapChecked' },
      { id: 'exitAfterMineCall', label: 'Leave the mine together', next: 'mineSafeExit' },
    ] },
    mineSupport: { id: 'mineSupport', title: 'The First Timber Frame', tone: 'warning', text: 'The first timber frame stands at the entrance to the side passage. Beyond it, the roof dips and the floor disappears around a bend, out of sight. The guide remains behind you at the main entrance.', choices: [
      { id: 'tapMineTimber', label: 'Tap the frame and listen', timeCost: 2, next: 'mineTimberRings' },
      { id: 'enterMineSidePassage', label: 'Step past the frame toward the voice', hint: 'The narrowing passage has unseen ground and loose stone.', timeCost: 4, chance: { probability: 0.66, successNext: 'mineVoiceReached', failureNext: 'mineDustFall', successMessage: 'You pass the frame without disturbing the roof.', failureMessage: 'A loose rock drops and clips your shoulder.', failureEffects: { health: -2 } } },
      { id: 'turnFromMineSupport', label: 'Return to the main entrance', next: 'mineSafeExit' },
    ] },
    mineMapChecked: { id: 'mineMapChecked', title: 'The Marked Workings', tone: 'safe', text: 'The guide checks the old mine plan at the entrance. The side tunnel is marked as a shallow drain, but the map predates the last collapse and cannot certify it is safe.', choices: [
      { id: 'followCheckedMineMap', label: 'Inspect the first timber frame', timeCost: 3, next: 'mineSupport' },
      { id: 'leaveAfterMap', label: 'Leave the mine together', next: 'mineSafeExit' },
    ] },
    mineTimberRings: { id: 'mineTimberRings', title: 'A Ring through the Rock', tone: 'warning', text: 'The frame answers with a hollow ring. From deeper inside, the call seems to come again, but the timber is sound only as far as you can see.', choices: [
      { id: 'proceedAfterRing', label: 'Step carefully past the frame', timeCost: 3, chance: { probability: 0.66, successNext: 'mineVoiceReached', failureNext: 'mineDustFall', successMessage: 'The passage holds as you take the next few steps.', failureMessage: 'A stone shifts above the narrow passage.', failureEffects: { health: -2 } } },
      { id: 'leaveAfterRing', label: 'Return to the main entrance', next: 'mineSafeExit' },
    ] },
    mineVoiceReached: { id: 'mineVoiceReached', title: 'Around the Bend', tone: 'warning', text: 'You reach the bend without going deeper. No person is in sight, and the passage is too narrow to search safely alone.', textVariants: [
      { requirements: { selections: { mineVoice: 'guideCalling' } }, text: 'A small air shaft above the bend carries the guide’s voice from the entrance. The sound could have traveled through the rock.' },
      { requirements: { selections: { mineVoice: 'otherWorker' } }, text: 'A worker emerges from a side niche beyond the bend. They had called for help after a lantern went out, unaware that no one knew they were below.' },
      { requirements: { selections: { mineVoice: 'airEcho' } }, text: 'Only a draft moves through the old workings. The call may have been an echo of words spoken earlier.' },
      { requirements: { selections: { mineVoice: 'unexplained' } }, text: 'The passage is empty. From behind you, the voice says “Thank you” in the guide’s exact tone, though the guide is still at the entrance.' },
    ], choices: [
      { id: 'callTowardMineEntrance', label: 'Call the guide to meet you here', timeCost: 2, next: 'mineSafeExit' },
      { id: 'leaveMineBend', label: 'Return to the main tunnel', next: 'mineSafeExit' },
    ] },
    mineDustFall: end('mineDustFall', 'A Warning from the Roof', 'Dust settles on your coat where the loose stone struck. You retreat to the main entrance with the guide. The call receives no answer, but the unstable roof has given you a plain reason not to continue.'),
    mineSafeExit: end('mineSafeExit', 'Back in Daylight', 'You leave the marked side tunnel behind. The voice may have belonged to a worker, an echo, or no one you can identify. The guide agrees that the passage needs a proper inspection.'),
  },
};

export const THE_WOMAN_AT_THE_CROSSING: Scenario = {
  id: 'the-woman-at-the-crossing', title: 'The Woman at the Crossing', subtitle: 'At dusk, a figure on the far bank signals for travelers to stop.', startScene: 'crossingFigure',
  runRandomSelections: [{ id: 'crossingFigureTruth', values: [{ value: 'warning' }, { value: 'confusedTraveler' }, { value: 'prank' }, { value: 'vanishingFigure' }] }],
  scenes: {
    crossingFigure: { id: 'crossingFigure', title: 'A Raised Hand', tone: 'warning', text: 'At dusk, you stand on the near bank of a narrow stream. A stone bridge leads to the far bank, where a woman raises her hand and points down toward the crossing. Water clouds around one bridge support; from here you cannot tell whether the stones above it are sound.', choices: [
      { id: 'callToCrossingWoman', label: 'Call across the bridge', timeCost: 2, next: 'crossingCall' },
      { id: 'inspectBridgeFromBank', label: 'Look over the bridge from here', timeCost: 3, next: 'crossingExamined' },
      { id: 'waitAtCrossing', label: 'Wait for daylight on the near bank', timeCost: 480, next: 'crossingWaited' },
      { id: 'takeCrossingDetour', label: 'Use the marked road around the stream', timeCost: 15, next: 'crossingDetourArrival' },
    ] },
    crossingCall: { id: 'crossingCall', title: 'The Signal Across Water', tone: 'safe', text: 'The stream carries away most of your words. The woman’s gesture remains aimed toward the bridge support where the water clouds.', textVariants: [
      { requirements: { selections: { crossingFigureTruth: 'warning' } }, text: 'You hear “stone” and “wait.” She points again to the support below the bridge.' },
      { requirements: { selections: { crossingFigureTruth: 'confusedTraveler' } }, text: 'She asks whether the road reaches the village, then notices the cloudy water and points beneath the bridge.' },
      { requirements: { selections: { crossingFigureTruth: 'prank' } }, text: 'A laugh comes from the hedge, but the woman’s hand is still aimed at the cloudy water under the bridge.' },
      { requirements: { selections: { crossingFigureTruth: 'vanishingFigure' } }, text: 'The far bank empties between gusts. The water still clouds around the bridge support.' },
    ], choices: [
      { id: 'inspectStonesFromNearBank', label: 'Inspect the stones from this bank', next: 'crossingExamined' },
      { id: 'leaveCrossingCall', label: 'Take the marked road around', timeCost: 15, next: 'crossingDetourArrival' },
    ] },
    crossingExamined: { id: 'crossingExamined', title: 'What the Water Shows', tone: 'warning', text: 'From the near bank, you see fresh grit washing out beneath one arch and a deck stone sitting lower than its neighbors. The crossing may hold a careful traveler, but a hurried step or loaded cart could shift it further. By the time you finish looking, the far-bank road is empty.', textVariants: [
      { requirements: { selections: { crossingFigureTruth: 'warning' } }, text: 'The woman steps back along the far-bank road after signaling. Her warning was sound: fresh grit washes from under the arch, and one deck stone sits low.' },
      { requirements: { selections: { crossingFigureTruth: 'confusedTraveler' } }, text: 'The woman turns toward the village after asking for directions. She may not have meant to warn you, but the washed mortar and low deck stone are real.' },
      { requirements: { selections: { crossingFigureTruth: 'prank' } }, text: 'The woman walks off as laughter fades in the hedge. The prank explains the voice, not the washed mortar or the low deck stone.' },
      { requirements: { selections: { crossingFigureTruth: 'vanishingFigure' } }, text: 'The far bank empties between one look and the next. No footprints remain, yet the washed mortar and low deck stone are plain to see.' },
    ], choices: [
      { id: 'crossCarefullyAtDusk', label: 'Test the low stone and cross slowly', hint: 'It may hold, but the loose support could shift underfoot.', timeCost: 4, chance: { probability: 0.72, successNext: 'crossingPassed', failureNext: 'crossingScramble', successMessage: 'The low stone holds under your careful weight, though grit slips into the stream.', failureMessage: 'The stone tips underfoot. You catch the parapet and scramble back to the near bank.', failureEffects: { health: -1 } }, effects: { setFlags: ['crossingTested'] } },
      { id: 'waitForLightAtBridge', label: 'Wait for morning', timeCost: 480, next: 'crossingWaited' },
    ] },
    crossingWaited: { id: 'crossingWaited', title: 'Waiting by the Stream', tone: 'safe', text: 'You stay on the near bank until the light changes. The woman is gone, but grit continues to wash from beneath the arch. The marked road around the stream remains open.', choices: [
      { id: 'takeDetourAtDawn', label: 'Take the marked road around', timeCost: 15, next: 'crossingDetourArrival' },
      { id: 'crossAtDawn', label: 'Cross slowly in the better light', timeCost: 4, chance: { probability: 0.82, successNext: 'crossingPassed', failureNext: 'crossingScramble', successMessage: 'In the better light, you find a stable line across the uneven stones.', failureMessage: 'A loose stone rolls underfoot. You catch yourself and retreat to the near bank.', failureEffects: { health: -1 } }, effects: { setFlags: ['crossingTested'] } },
    ] },
    crossingScramble: { id: 'crossingScramble', title: 'A Step Back', tone: 'warning', text: 'The stone shifts and your foot strikes the edge hard. You are back on the near bank, shaken and sore; the bridge has not failed, but it is no longer a sensible crossing in the dark.', choices: [
      { id: 'scrambleTakeDetour', label: 'Take the marked road around', timeCost: 15, next: 'crossingDetourArrival' },
    ] },
    crossingPassed: { id: 'crossingPassed', title: 'Across the Bridge', tone: 'safe', text: 'You crossed after testing the low stones, accepting a risk the woman’s signal had made visible. The woman is nowhere in sight, but the damaged arch will need repair before carts use it again.', choices: [
      { id: 'leaveCrossingBehind', label: 'Continue along the far-bank road', next: 'crossingClear', effects: { historyFlags: ['noticed_and_avoided_a_weak_bridge_arch'] } },
    ] },
    crossingDetourArrival: { id: 'crossingDetourArrival', title: 'Around the Stream', tone: 'safe', text: 'The marked road brings you around to the far bank without putting weight on the damaged arch. The woman is gone; the loose stone and washed mortar remain for the next traveler to notice.', choices: [
      { id: 'leaveDetourCrossing', label: 'Continue along the far-bank road', next: 'crossingClear', effects: { historyFlags: ['noticed_and_avoided_a_weak_bridge_arch'] } },
    ] },
    crossingClear: end('crossingClear', 'The Signal Remembered', 'You continue on with the crossing behind you. Whether the woman was warning you, asking directions, playing a trick, or something you cannot explain, stopping long enough to inspect the bridge kept you from treating a real weakness as harmless.'),
  },
};

export const THE_BLACK_DOG: Scenario = {
  id: 'the-black-dog', title: 'The Black Dog', subtitle: 'A dark dog appears at three bends in the road.', startScene: 'blackDogRoad',
  runRandomSelections: [{ id: 'blackDogTruth', values: [{ value: 'farmDog' }, { value: 'lostTraveler' }, { value: 'ordinaryDog' }, { value: 'vanishes' }] }],
  scenes: {
    blackDogRoad: { id: 'blackDogRoad', title: 'A Dog in the Road', tone: 'safe', text: 'A large black dog stands in the road ahead. It does not growl or approach; it watches you, then walks to the next bend and waits. The road is open on both sides.', choices: [
      { id: 'followBlackDog', label: 'Follow at a careful distance', timeCost: 8, next: 'dogFollowed', effects: { historyFlags: ['followed_black_dog'] } },
      { id: 'callBlackDog', label: 'Call gently and wait', timeCost: 3, next: 'dogCalled' },
      { id: 'passBlackDog', label: 'Give the dog room and continue', next: 'dogPassed' },
    ] },
    dogCalled: { id: 'dogCalled', title: 'No Sudden Trust', tone: 'safe', text: 'The dog keeps several paces between you. It sniffs the road and looks toward the next bend, but does not ask to be touched.', textVariants: [
      { requirements: { selections: { blackDogTruth: 'farmDog' } }, text: 'A farmhand’s whistle sounds from beyond the bend. The dog’s ears lift.' },
      { requirements: { selections: { blackDogTruth: 'lostTraveler' } }, text: 'A weak call for help comes from a shallow roadside ditch beyond the bend.' },
      { requirements: { selections: { blackDogTruth: 'ordinaryDog' } }, text: 'Someone whistles from a nearby yard. The dog walks past the milestone in that direction, stopping once to look back.' },
      { requirements: { selections: { blackDogTruth: 'vanishes' } }, text: 'A passing cloud dims the road. When the light returns, the dog is no longer there.' },
    ], choices: [
      { id: 'walkToDogBend', label: 'Look toward the next bend', timeCost: 3, next: 'dogFollowed', effects: { historyFlags: ['followed_black_dog'] } },
      { id: 'leaveDogWaiting', label: 'Leave the dog in peace', next: 'dogPassed' },
    ] },
    dogFollowed: { id: 'dogFollowed', title: 'What Waits at the Bend', tone: 'warning', text: 'You reach the bend without approaching the dog. Nothing blocks the road, and you can return the way you came.', textVariants: [
      { requirements: { selections: { blackDogTruth: 'farmDog' } }, text: 'A farmhand opens a gate beyond the bend and calls the dog home. The animal trots to them without looking back.' },
      { requirements: { selections: { blackDogTruth: 'lostTraveler' } }, text: 'An injured traveler lies in the shallow ditch, awake and able to answer. Beyond the bend, an open farm gate leads from the road. The dog stands nearby but keeps out of reach.' },
      { requirements: { selections: { blackDogTruth: 'ordinaryDog' } }, text: 'The dog has stopped beside a milestone. It watches you, then takes an open track toward a farm.' },
      { requirements: { selections: { blackDogTruth: 'vanishes' } }, text: 'The road beyond the bend is empty. There is no gate, traveler, or dog, only the prints you made while following.' },
    ], choices: [
      { id: 'helpDitchTraveler', label: 'Offer the traveler help', requirements: { selections: { blackDogTruth: 'lostTraveler' } }, timeCost: 5, next: 'dogTravelerHelped', effects: { historyFlags: ['helped_traveler_led_to_by_black_dog'] } },
      { id: 'callForDogOwner', label: 'Call toward the farm', requirements: { selections: { blackDogTruth: 'farmDog' } }, timeCost: 2, next: 'dogOwnerHeard' },
      { id: 'leaveDogBend', label: 'Continue on the road', next: 'dogPassed' },
    ] },
    dogOwnerHeard: end('dogOwnerHeard', 'A Dog Goes Home', 'The farmhand answers and leads the dog through the gate. No one knows why it waited at the bend, but it is plainly welcome there.'),
    dogTravelerHelped: { id: 'dogTravelerHelped', title: 'The Dog Knows the Way', tone: 'safe', text: 'You help the traveler sit up; they say they fell from a cart and the dog kept returning to them from the road. The dog now trots toward the open farm gate, stopping to look back. The traveler can remain where they are while you seek help, or you can call to anyone passing.', choices: [
      { id: 'followDogForHelp', label: 'Follow the dog to the farm gate', timeCost: 5, next: 'dogHelpFound', effects: { historyFlags: ['followed_black_dog_to_get_help'] } },
      { id: 'callForPassingHelp', label: 'Stay and call toward the road', timeCost: 4, next: 'dogPassingHelp' },
    ] },
    dogHelpFound: end('dogHelpFound', 'A Guide to Help', 'The dog leads you to a farmhand, who returns with you and helps the traveler walk to the nearby yard. The dog had been making the same trip back and forth; without it, you might have passed the injured stranger.'),
    dogPassingHelp: end('dogPassingHelp', 'Help Reaches the Ditch', 'You stay beside the traveler and call until a cart answers from the road. The dog waits at the bend until the farmhand arrives, then follows them toward the gate.'),
    dogPassed: end('dogPassed', 'The Road Goes On', 'You leave the dog space and continue. It may have been lost, waiting for someone, or only resting by the road.'),
  },
};

export const THE_ROOM_WITH_NO_DOOR: Scenario = {
  id: 'the-room-with-no-door', title: 'The Room with No Door', subtitle: 'An old plan shows a room where the house has no entrance.', startScene: 'planAndHall',
  runRandomSelections: [{ id: 'doorlessRoomTruth', values: [{ value: 'sealedRenovation' }, { value: 'storageNook' }, { value: 'removedRoom' }, { value: 'impossibleRoom' }] }],
  scenes: {
    planAndHall: { id: 'planAndHall', title: 'A Room on the Old Plan', tone: 'warning', text: 'An innkeeper asks you to help compare an old house plan with the upstairs hall. The plan shows a small room between the stair landing and two guest rooms. In the actual hall, those walls meet without a door; outside, one shuttered window faces the same spot. A loose strip of trim beside the landing shows a small brass keyhole.', choices: [
      { id: 'measureDoorlessWall', label: 'Compare the hall and outer wall', timeCost: 4, next: 'wallCompared', effects: { historyFlags: ['entered_room_with_no_door'] } },
      { id: 'askInnkeeperRoomPlan', label: 'Ask when the plan was last used', timeCost: 3, next: 'innkeeperRoomHistory', effects: { historyFlags: ['entered_room_with_no_door'] } },
      { id: 'useBrassKeyAtPanel', label: 'Try the Brass Room Key on the small lock', requirements: { items: ['brassRoomKey'] }, timeCost: 3, next: 'keyAtPanel', effects: { historyFlags: ['entered_room_with_no_door'] } },
      { id: 'leaveDoorlessRoom', label: 'Leave the old plan alone', next: 'roomUnentered', effects: { historyFlags: ['entered_room_with_no_door'] } },
    ] },
    wallCompared: { id: 'wallCompared', title: 'The Walls Do Not Quite Match', tone: 'safe', text: 'The outside wall is deeper than the hall wall by about the width of a cupboard. The shuttered window opens onto no visible room from this side. The innkeeper says no one has entered a separate chamber there in living memory.', textVariants: [
      { requirements: { selections: { doorlessRoomTruth: 'sealedRenovation' } }, text: 'A straight seam in the plaster suggests an old doorway was sealed when the rooms were enlarged.' },
      { requirements: { selections: { doorlessRoomTruth: 'storageNook' } }, text: 'The extra depth is enough for a narrow storage nook behind the paneling.' },
      { requirements: { selections: { doorlessRoomTruth: 'removedRoom' } }, text: 'The outer window is boarded from within. There is no remaining floor space for the old room.' },
      { requirements: { selections: { doorlessRoomTruth: 'impossibleRoom' } }, text: 'You measure twice. The plan and exterior window agree, but the space between the walls is too shallow to hold the room drawn there.' },
    ], choices: [
      { id: 'askForBuilderRecord', label: 'Ask the innkeeper about old repairs', timeCost: 3, next: 'innkeeperRoomHistory' },
      { id: 'leaveMeasuredWall', label: 'Leave the walls unopened', next: 'roomUnentered' },
    ] },
    innkeeperRoomHistory: { id: 'innkeeperRoomHistory', title: 'An Uncertain Renovation', tone: 'safe', text: 'The innkeeper remembers a carpenter sealing a passage years ago, but cannot say whether the plan was changed afterward. The window and thick wall remain unexplained by that account.', choices: [
      { id: 'checkOldPanelRoom', label: 'Look for a maintenance panel', timeCost: 3, next: 'panelFound' },
      { id: 'acceptOldRoomPlan', label: 'Set the plan aside', next: 'roomUnentered' },
    ] },
    keyAtPanel: { id: 'keyAtPanel', title: 'A Small Brass Lock', tone: 'safe', text: 'The Brass Room Key turns the small lock in the loose trim. It opens only a narrow maintenance panel, not a door into any unknown room.', choices: [
      { id: 'openMaintenancePanel', label: 'Open the maintenance panel', timeCost: 2, next: 'panelFound', effects: { knowledge: ['The Brass Room Key opened a small maintenance panel in the old inn, not the missing room.'] } },
      { id: 'leaveKeyPanelShut', label: 'Leave the panel closed', next: 'roomUnentered' },
    ] },
    panelFound: { id: 'panelFound', title: 'Behind the Panel', tone: 'warning', text: 'The panel opens into a shallow service space between the hall and outer wall. You stand in the hall; the shuttered window is beyond the cavity, not an exit from it.', textVariants: [
      { requirements: { selections: { doorlessRoomTruth: 'sealedRenovation' } }, text: 'Old plaster and brick fill the space where the doorway once stood. The sealed renovation accounts for the plan.' },
      { requirements: { selections: { doorlessRoomTruth: 'storageNook' } }, text: 'A dry shelf and a few empty jars show that the cavity served as a cupboard, not a room.' },
      { requirements: { selections: { doorlessRoomTruth: 'removedRoom' } }, text: 'The space ends at the outer wall. The room was removed when the inn was rebuilt.' },
      { requirements: { selections: { doorlessRoomTruth: 'impossibleRoom' } }, text: 'The cavity is shallow and empty. From inside it, three taps sound from the other side of the brick, though no space lies beyond.' },
    ], choices: [
      { id: 'closePanelRoom', label: 'Close the panel and tell the innkeeper', next: 'roomUnderstood' },
      { id: 'leavePanelRoom', label: 'Step back into the hall', next: 'roomUnentered' },
    ] },
    roomUnderstood: end('roomUnderstood', 'A Space Behind the Wall', 'The innkeeper closes the panel and agrees to repair the trim. You have found a cupboard, a sealed passage, or an empty cavity; the old drawing remains a little stranger than the house.'),
    roomUnentered: end('roomUnentered', 'The Plan Is Folded Away', 'You leave the old plan on the table. The innkeeper can ask a carpenter to inspect the wall later. A room on paper is not a reason to open a sound wall tonight.'),
  },
};

export const THE_BELL_BENEATH_THE_WATER: Scenario = {
  id: 'the-bell-beneath-the-water', title: 'The Bell Beneath the Water', subtitle: 'At a still lake, a bell seems to sound from below the surface.', startScene: 'lakeLegend',
  runRandomSelections: [{ id: 'waterBellTruth', values: [{ value: 'chainAndBuoy' }, { value: 'distantShore' }, { value: 'floodedMill' }, { value: 'unexplained' }] }],
  scenes: {
    lakeLegend: { id: 'lakeLegend', title: 'A Sound Under Still Water', tone: 'safe', text: 'At a lakeside inn, locals say a bell can sometimes be heard beneath the water on still evenings. The lake is calm now. From the shore, a low note seems to rise somewhere beyond the reeds; no boat is tied nearby.', choices: [
      { id: 'listenWaterBell', label: 'Listen from the dry shore', timeCost: 4, next: 'shoreListening', effects: { historyFlags: ['heard_bell_beneath_water'] } },
      { id: 'askLocalWaterBell', label: 'Ask the innkeeper what locals believe', timeCost: 3, next: 'waterBellAccount', effects: { historyFlags: ['heard_bell_beneath_water'] } },
      { id: 'holdGraveCoinByLake', label: 'Listen with the Grave Coin in hand', requirements: { items: ['graveCoin'] }, timeCost: 3, next: 'waterCoinResponse', effects: { historyFlags: ['heard_bell_beneath_water'] } },
      { id: 'leaveWaterBell', label: 'Leave the lake and its story alone', next: 'waterBellUnresolved', effects: { historyFlags: ['heard_bell_beneath_water'] } },
    ] },
    shoreListening: { id: 'shoreListening', title: 'The Note Returns', tone: 'safe', text: 'The note sounds again from beyond the reeds. It is low and rounded, like a handbell heard through a wall. You remain on the bank; the water is too deep to investigate on foot.', textVariants: [
      { requirements: { selections: { waterBellTruth: 'chainAndBuoy' } }, text: 'The sound comes with a small ripple near a buoy far across the lake.' },
      { requirements: { selections: { waterBellTruth: 'distantShore' } }, text: 'A second, fainter note arrives from the opposite shore, though no building is visible there.' },
      { requirements: { selections: { waterBellTruth: 'floodedMill' } }, text: 'The innkeeper says an old mill foundation lies beneath the deep end, flooded before the road was built.' },
      { requirements: { selections: { waterBellTruth: 'unexplained' } }, text: 'The surface stays smooth. The note comes once more from directly below the bank, where the water is dark.' },
    ], choices: [
      { id: 'askAfterWaterSound', label: 'Ask the innkeeper about the lake', timeCost: 3, next: 'waterBellAccount' },
      { id: 'listenOnceMoreWater', label: 'Listen once more, then leave', timeCost: 3, next: 'waterBellUnresolved' },
    ] },
    waterBellAccount: { id: 'waterBellAccount', title: 'A Story with Several Sources', tone: 'safe', text: 'The innkeeper offers no single explanation. A buoy chain, a bell from another shore, and the drowned mill are all possible sources; none explains every account.', choices: [
      { id: 'walkToLakeEdge', label: 'Listen from shore for another note', timeCost: 4, next: 'waterAfterAccount', effects: { historyFlags: ['heard_bell_beneath_water'] } },
      { id: 'leaveAfterLakeStory', label: 'Leave the story untested', next: 'waterBellUnresolved' },
    ] },
    waterAfterAccount: { id: 'waterAfterAccount', title: 'The Sound across the Lake', tone: 'safe', text: 'You listen from the same dry bank. A second note comes from somewhere across the water; the innkeeper cannot tell whether it is the same sound or another bell.', choices: [
      { id: 'leaveAfterSecondWaterNote', label: 'Leave the sound unexplained', next: 'waterBellUnresolved' },
    ] },
    waterCoinResponse: { id: 'waterCoinResponse', title: 'The Coin in Your Palm', tone: 'safe', text: 'The Grave Coin stays cool and still while the sound travels across the lake. It gives no direction, and the note may have crossed the water from somewhere ordinary.', textVariants: [
      { requirements: { selections: { waterBellTruth: 'unexplained' } }, text: 'As the sound stops, the Grave Coin grows warm for one brief moment. It offers no proof that the bell came from below.' },
    ], choices: [
      { id: 'putCoinAwayAtLake', label: 'Put the coin away and leave', next: 'waterBellUnresolved' },
      { id: 'listenAfterCoin', label: 'Stay on shore for another note', timeCost: 3, next: 'waterBellUnresolved' },
    ] },
    waterBellUnresolved: end('waterBellUnresolved', 'The Lake Keeps Its Distance', 'You leave the water undisturbed. A buoy, a distant bell, the flooded mill, or something without a known source may have made the sound. You do not need to prove the story.'),
  },
};

export const STRANGE_ROADS_ADVENTURES: Scenario[] = [
  THE_LANTERN_IN_THE_MARSH, THE_HOUSE_THAT_KNOCKS, THE_GRAVE_BELL,
  THE_PASSENGER_WHO_WASN_T_THERE, THE_COLD_ROOM, THE_VOICE_IN_THE_MINE,
  THE_WOMAN_AT_THE_CROSSING, THE_BLACK_DOG, THE_ROOM_WITH_NO_DOOR,
  THE_BELL_BENEATH_THE_WATER,
];
