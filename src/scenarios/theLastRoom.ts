import type { Scenario } from '../types';

const REPUTATION = 'You have come back for someone before. I suppose I can tell you what I know.';
const ROOM_TOOL = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'brassBottleOpener'];
const PRY_TOOLS = [...ROOM_TOOL, 'brassCandlestick', 'steelWedge'];
const CELLAR_LIGHTS = ['lantern', 'minerHeadlamp'];
const REWARD_ENDING = 'quietEnding';

export const THE_LAST_ROOM: Scenario = {
  id: 'the-last-room',
  title: 'The Last Room on the Left',
  subtitle: 'A roadside inn. A missing guest. A door no one wants opened.',
  startScene: 'arrival',
  saveVersion: 2,
  timePhases: [
    { id: 'evening', label: 'Evening at the Inn', atMinutes: 0 },
    { id: 'storm', label: 'The Storm Is Rising', atMinutes: 15 },
    { id: 'late', label: 'Late Night', atMinutes: 35 },
  ],
  scenes: {
    arrival: {
      id: 'arrival', title: 'A Light in the Rain', tone: 'warning',
      text: 'Rain has turned the road to black mud by the time you reach the Lantern House. At supper, one place is still set for the traveler in the last upstairs room; his meal has gone cold. Nell, the inn’s maid, tells you she carried it up and found a chair and narrow table shoved against the door from the hallway side. She has not seen the guest come down, and the storm has made the road dangerous to search. The innkeeper calls it a private matter.',
      choices: [
        { id: 'askInnkeeper', label: 'Ask the innkeeper about the missing guest', timeCost: 3, next: 'hostAccount', effects: { setFlags: ['identifiedSilas'], knowledge: ['The innkeeper identifies the missing guest as Silas Vale and says he left before the storm.'] } },
        { id: 'askGuests', label: 'Listen to the other guests', timeCost: 5, next: 'commonRoom' },
        { id: 'inspectRoom', label: 'Go upstairs and inspect the blocked door', timeCost: 3, next: 'corridor' },
        { id: 'leaveInn', label: 'Leave while the road is still passable', timeCost: 1, effects: { historyFlags: ['walked_away_from_inn_problem'] }, next: 'walkAwayAtArrival' },
      ],
    },
    hostAccount: {
      id: 'hostAccount', title: 'The Innkeeper’s Account',
      text: 'The innkeeper identifies the guest as Silas Vale and says he went out the back before the rain grew heavy. Nell has not seen him leave, and his place at supper is still set. He admits there is a narrow service passage behind the kitchen, used for deliveries. The room is closed for the night, he says, though he cannot explain why a chair and table block it from the hallway.',
      textVariants: [{ requirements: { historyFlags: ['returned_for_help'] }, text: `${REPUTATION} The innkeeper identifies the guest as Silas Vale and says he went out the back before the rain grew heavy. Nell has not seen him leave, and his place at supper is still set. He admits there is a narrow service passage behind the kitchen, used for deliveries. The room is closed for the night, he says, though he cannot explain why a chair and table block it from the hallway.` }],
      choices: [
        { id: 'askAboutRoom', label: 'Ask why the door is blocked', next: 'corridor' },
        { id: 'askServicePassage', label: 'Ask about the rear service passage', next: 'serviceHall' },
        { id: 'inspectRegister', label: 'Check the guest register', next: 'guestRegister', effects: { setFlags: ['identifiedSilas'] } },
        { id: 'buyRope', label: 'Buy a coil of travel rope — 2 coins', requirements: { minMoney: 2, notOwnedItems: ['travelRope'] }, effects: { money: -2, gainItems: ['travelRope'] }, next: 'corridor' },
      ],
    },
    commonRoom: {
      id: 'commonRoom', title: 'Accounts by the Stove',
      text: 'A carter heard a heavy thump near the back of the inn, but says it may have been the storm. Nell, the maid who brought your supper, remembers carrying a large travel case toward the kitchen earlier; she thought it was being stored out of the rain. An older guest says no one passed through the front door after supper. None saw the missing traveler leave.',
      choices: [
        { id: 'compareRegister', label: 'Compare their accounts with the register', next: 'guestRegister', effects: { setFlags: ['identifiedSilas'] } },
        { id: 'followYardAccount', label: 'Check the rear yard door', next: 'yardAccount' },
        { id: 'visitRoom', label: 'Inspect the blocked upstairs room', next: 'corridor' },
        { id: 'askAboutCase', label: 'Follow Nell’s account toward the rear yard', next: 'yardAccount' },
      ],
    },
    guestRegister: {
      id: 'guestRegister', title: 'A Line Left Blank',
      text: 'The register names the guest as Silas Vale and assigns him the last room on the left. He checked in before supper; the departure line is blank. A note says his large travel case was carried down for dry storage. The brass service key is missing from its hook.',
      choices: [
        { id: 'checkRoom', label: 'Inspect the room assigned to Silas Vale', next: 'corridor', effects: { setFlags: ['identifiedSilas'], knowledge: ['The register names Silas Vale, assigns him the last room, and records no departure. His travel case was stored below.'] } },
        { id: 'checkServiceDoor', label: 'Follow the service route behind the kitchen', next: 'serviceHall', effects: { setFlags: ['identifiedSilas', 'knowsCellar'], knowledge: ['The register names Silas Vale and notes that his travel case was stored below.'] } },
        { id: 'askGuestsAfterRegister', label: 'Check the back door for signs of departure', next: 'yardAccount', effects: { setFlags: ['identifiedSilas'] } },
      ],
    },
    yardAccount: {
      id: 'yardAccount', title: 'The Yard Door',
      text: 'You cross the kitchen and step into the narrow yard behind the inn. The back door is shut, and the mud outside it shows no fresh footprints. Beneath the kitchen window, a low stone opening leads into a dark space below the floor; rainwater runs through it. The carter may have heard a sound from here, but no one walked out.',
      choices: [
        { id: 'followMudMarks', label: 'Examine the low stone opening', next: 'yardTracks', effects: { setFlags: ['knowsCellar'] } },
        { id: 'findPassageFromYard', label: 'Go inside and find the service passage', next: 'serviceHall' },
        { id: 'leaveFromYard', label: 'Return to the road', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    yardTracks: {
      id: 'yardTracks', title: 'Scuffs Beneath the Window',
      text: 'At the stone opening, you can see a short flight of steps dropping into the inn’s cellar. Muddy scuffs stop at its lip; the back door above remains undisturbed. A heavy thump from below would carry through the kitchen floor. The opening is too narrow to use as a safe entrance.',
      choices: [
        { id: 'goToServiceHall', label: 'Go inside and find the service door', next: 'serviceHall', effects: { setFlags: ['foundCellarScuffs', 'knowsCellar'] } },
        { id: 'leaveTracks', label: 'Leave the inn without getting involved', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    corridor: {
      id: 'corridor', title: 'The Last Room on the Left', tone: 'warning',
      text: 'You climb the main stairs to the second-floor hall. At its far end, the last door on the left is blocked from the hallway side: a chair and narrow table have been pushed against it. The latch is not visibly locked, and the frame is intact. Nothing inside answers the rain or your footsteps.',
      choices: [
        { id: 'knockGently', label: 'Knock and listen for a reply', timeCost: 2, next: 'doorTalk' },
        { id: 'inspectBarricade', label: 'Study the furniture and latch', timeCost: 5, next: 'latchClue' },
        { id: 'askNell', label: 'Call Nell up from the kitchen', next: 'doorConfides' },
        { id: 'forceDoor', label: 'Shoulder the furniture aside', timeCost: 10, hint: 'The chair and table are heavy; forcing them may injure you or damage the door.', chance: { probability: 0.56, successNext: 'roomEntered', failureNext: 'doorBacklash', successMessage: 'The chair scrapes away and the door opens against it.', failureMessage: 'The table shifts into your shoulder; the old frame shudders but holds.', successEffects: { setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'] }, failureEffects: { health: -1, setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'] } } },
      ],
    },
    doorTalk: {
      id: 'doorTalk', title: 'Knocks Beneath the Hall',
      text: 'No one answers. From the other side of the door you hear no movement, but three slow knocks travel up through the floor from somewhere below. The furniture is on your side of the door; whoever placed it here did so from the hallway.',
      choices: [
        { id: 'followTapping', label: 'Follow the knocks toward the back passage', next: 'serviceHall', effects: { setFlags: ['heardTapping'] } },
        { id: 'askNellAfterSilence', label: 'Ask Nell what she noticed', next: 'doorConfides' },
        { id: 'leaveSilentDoor', label: 'Step away and leave the inn', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    latchClue: {
      id: 'latchClue', title: 'Furniture in the Hall',
      text: 'The chair legs point toward the door, and scrape marks run across the hall boards. The furniture was pushed from your side; the latch is intact and has no key in it. A brass key has slipped beneath the door, just beyond your fingers. The blocked room has not been forced open.',
      choices: [
        { id: 'quietToolEntry', label: 'Shift the furniture with a carried tool', timeCost: 3, requirements: { anyItems: ROOM_TOOL }, next: 'roomEntered', effects: { setFlags: ['quietEntry', 'intervenedAtInn'], knowledge: ['The room was blocked from the hallway; its latch was intact.'] } },
        { id: 'hookKey', label: 'Reach under the door with your hook', timeCost: 2, requirements: { items: ['ratCatchersHook'] }, next: 'keyRecovered', effects: { gainItems: ['innCellarKey'], setFlags: ['intervenedAtInn'], knowledge: ['A brass service key was lying just inside the blocked room.'] } },
        { id: 'useMirrorAtDoor', label: 'Look under the door with your card mirror', timeCost: 2, requirements: { items: ['foldingCardMirror'] }, next: 'mirrorRoomClue', effects: { setFlags: ['mirrorCheckedRoom'], knowledge: ['A mirror under the blocked room door showed the room was empty and its window was latched.'] } },
        { id: 'goToServiceHall', label: 'Go downstairs to the rear passage', next: 'serviceHall', effects: { setFlags: ['knowsCellar'] } },
      ],
    },
    mirrorRoomClue: {
      id: 'mirrorRoomClue', title: 'A View Under the Door',
      text: 'The folding mirror shows an empty strip of floor, a latched window, and damp boot marks leading from the bed toward the door. It cannot show the far side of the room. The chair and table still block the hallway; the main stairs are behind you.',
      choices: [
        { id: 'shiftFurnitureByHand', label: 'Push the furniture aside by hand', timeCost: 4, hint: 'The table is heavy and the hall is narrow; it may slide back onto you.', chance: { probability: 0.72, successNext: 'roomEntered', failureNext: 'doorBacklash', successMessage: 'You brace your feet and drag the chair clear of the doorway.', failureMessage: 'The table slips against the wall and jolts your shoulder.' } },
        { id: 'shiftFurnitureWithTool', label: 'Shift it with your carried tool', timeCost: 2, requirements: { anyItems: PRY_TOOLS }, next: 'roomEntered', effects: { setFlags: ['quietEntry'] } },
        { id: 'leaveForServiceHall', label: 'Go downstairs to the rear passage', next: 'serviceHall' },
      ],
    },
    keyRecovered: {
      id: 'keyRecovered', title: 'The Key Under the Door',
      text: 'Your hook draws the brass key from under the door. Its tag reads “service”; it may fit a lock elsewhere in the inn. The room is still blocked from the hallway, and you have not yet seen inside.',
      choices: [
        { id: 'useKeyAtServiceHall', label: 'Carry the key downstairs to the back passage', next: 'serviceHall', effects: { setFlags: ['knowsCellar'] } },
        { id: 'knockAfterKey', label: 'Ask Nell what she saw at the blocked door', next: 'doorConfides' },
      ],
    },
    doorConfides: {
      id: 'doorConfides', title: 'Nell’s Account',
      text: 'You call downstairs, and Nell, the maid you met when you arrived, comes up from the kitchen. She says the innkeeper told her the guest had left; later, she saw him push the chair and table against the room door from the hallway. She did not see the guest go. Earlier, she heard three slow knocks from under the kitchen floor. She stayed quiet because the innkeeper is her employer, but the untouched supper worried her.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'You call downstairs, and Nell comes up from the kitchen, tired and uneasy. She says the innkeeper told her the guest had left; later, she saw him push the chair and table against the room door from the hallway. She did not see the guest go. Earlier, she heard three slow knocks from under the kitchen floor. She kept quiet because the innkeeper is her employer, but the untouched supper worried her.' }],
      choices: [
        { id: 'believeNell', label: 'Follow her account to the rear passage', timeCost: 2, next: 'serviceHall', effects: { setFlags: ['guestConfided', 'believedNell', 'heardTapping'], historyFlags: ['intervened_in_inn_dispute', 'trusted_testimony_over_evidence', 'protected_hidden_guest'], knowledge: ['Nell, the inn’s maid, saw the innkeeper block the guest room from the hallway and heard knocks below the kitchen.'] } },
        { id: 'askNellToWait', label: 'Ask Nell to wait while you inspect below', timeCost: 2, next: 'serviceHall', effects: { setFlags: ['guestConfided', 'heardTapping'], knowledge: ['Nell, the inn’s maid, saw the innkeeper block the guest room from the hallway and heard knocks below the kitchen.'] } },
        { id: 'tellInnkeeperAboutNell', label: 'Ask the innkeeper to explain her account', timeCost: 4, next: 'hostConfrontation', effects: { setFlags: ['guestConfided', 'heardTapping', 'identifiedSilas'], knowledge: ['Nell, the inn’s maid, saw the innkeeper block the guest room from the hallway and heard knocks below the kitchen.'] } },
        { id: 'leaveNell', label: 'Leave before the storm worsens', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    roomEntered: {
      id: 'roomEntered', title: 'Inside the Last Room', tone: 'warning',
      text: 'You shift the hall-side furniture and step into the room assigned to the missing guest. No one is inside. The bed has been slept in, the window latch is fastened, and there is no second exit. Muddy boot marks cross the floor to the door and continue down the hall; the travel case mentioned in the register is not here.',
      textVariants: [
        { requirements: { flags: ['quietEntry'] }, text: 'Your carried tool lets you move the hall-side furniture without breaking the frame. The room is empty. The bed has been slept in, the window latch is fastened, and muddy boot marks lead from the bedside to the hall. The travel case is not here.' },
        { requirements: { flags: ['mirrorCheckedRoom'] }, text: 'The mirror showed no one inside. After shifting the hall-side furniture, you confirm the room is empty; the window is latched, and muddy boot marks lead from the bedside to the hall. The travel case is not here.' },
      ],
      choices: [
        { id: 'listenToNell', label: 'Call Nell up to ask what she saw', next: 'doorConfides' },
        { id: 'goCheckBelow', label: 'Follow the marks downstairs to the kitchen', next: 'serviceHall', effects: { setFlags: ['followedRoomMarks'] } },
        { id: 'leaveAfterRoom', label: 'Leave the inn without searching further', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    doorBacklash: {
      id: 'doorBacklash', title: 'A Frame Shaken', tone: 'warning',
      text: 'The table turns sideways and catches your shoulder. The old frame holds, but the chair and table still block the door. A voice from downstairs asks you to stop forcing the furniture; you have learned nothing about what happened inside.',
      choices: [
        { id: 'apologizeAfterImpact', label: 'Stop and call Nell up to speak', next: 'doorConfides', effects: { setFlags: ['forcedEntry'] } },
        { id: 'leaveAfterImpact', label: 'Go downstairs to the rear passage', next: 'serviceHall' },
        { id: 'giveUpAfterImpact', label: 'Leave the inn', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    guestAccused: {
      id: 'guestAccused', title: 'An Accusation in the Hall', tone: 'warning',
      text: 'Nell, the inn’s maid, denies hiding the missing traveler. The innkeeper steps between you and her, asking you to stop making claims without evidence. The guests fall quiet; no one has established who moved the furniture or where the traveler went.',
      choices: [
        { id: 'doubleDownOnNell', label: 'Repeat the accusation and leave', next: 'wrongAccusationEnding', effects: { historyFlags: ['wrongly_accused_guest', 'intervened_in_inn_dispute'] } },
        { id: 'apologizeToNell', label: 'Apologize and ask what she saw', next: 'doorConfides', effects: { clearFlags: ['prematureAccusation'], setFlags: ['guestConfided'] } },
        { id: 'inspectServiceInstead', label: 'Set the argument aside and check the rear passage', next: 'serviceHall' },
      ],
    },
    hostConfrontation: {
      id: 'hostConfrontation', title: 'The Innkeeper’s Admission', tone: 'warning',
      text: 'You meet the innkeeper in the kitchen beside the rear service passage, where he faces your questions. He finally admits the guest was Silas Vale. Vale carried his case into the cellar after rain began seeping under the back door; a wet step broke under him and a shelf fell. The innkeeper heard knocking, then lied that Vale had left because the unsafe cellar could cost him the inn. He pushed the chair and table against the empty room door to stop questions. Nell saw him do it. He did not cause the fall, but he delayed getting help.',
      choices: [
        { id: 'helpWithInnkeeper', label: 'Open the service door and go down together', next: 'cellarEntry', effects: { setFlags: ['hostConfessed', 'innkeeperHelping', 'identifiedSilas'], historyFlags: ['intervened_in_inn_dispute'], knowledge: ['Silas Vale fell on the cellar steps while retrieving his case; the innkeeper heard him but concealed the accident.'] } },
        { id: 'callAuthorities', label: 'Send for a constable and doctor', timeCost: 35, next: 'authoritiesCalled', effects: { setFlags: ['hostConfessed', 'identifiedSilas'], historyFlags: ['returned_for_authorities'], knowledge: ['Silas Vale fell on the cellar steps while retrieving his case; the innkeeper heard him but concealed the accident.'] } },
        { id: 'leaveAfterConfession', label: 'Tell him to answer for the lie and leave', next: 'walkAwayEnding', effects: { setFlags: ['identifiedSilas'], historyFlags: ['uncovered_inn_truth', 'walked_away_from_inn_problem'] } },
      ],
    },
    serviceHall: {
      id: 'serviceHall', title: 'The Service Passage', tone: 'warning',
      text: 'You leave the upper hall or yard, go down the main stairs, and cross the kitchen to a narrow service passage at the back of the inn. A heavy door with an iron latch stands at its end; beyond it, stone steps descend to the cellar. Wet scuffs cross the threshold. From below comes a faint knock.',
      textVariants: [
        { requirements: { flags: ['heardTapping'], minElapsedMinutes: 35 }, text: 'You go through the kitchen to the narrow service passage. Seven stone steps descend beyond its swollen cellar door. The three knocks Nell described have grown faint; rainwater seeps under the door, and the frame shifts when the wind hits the inn.' },
        { requirements: { flags: ['heardTapping'] }, text: 'You go through the kitchen to the narrow service passage. Seven stone steps descend beyond its swollen cellar door. The three knocks Nell described sound again below you.' },
        { requirements: { minElapsedMinutes: 35 }, text: 'You go through the kitchen to the narrow service passage. Seven stone steps descend beyond its swollen cellar door. The faint knock has weakened; rainwater seeps beneath the door.' },
      ],
      choices: [
        { id: 'inspectCellarScuffs', label: 'Study the marks around the cellar door', timeCost: 5, next: 'cellarClues' },
        { id: 'tryCellarLatch', label: 'Lift the swollen latch by hand', timeCost: 8, hint: 'The wood is wet and the frame is shifting; forcing it may hurt you.', chance: { probability: 0.6, successNext: 'cellarEntry', failureNext: 'cellarStuck', successMessage: 'The latch rises and the swollen door gives enough to open.', failureMessage: 'The door jerks back; the latch catches your hand.', successEffects: { setFlags: ['roughAccess'] }, failureEffects: { health: -1, setFlags: ['roughAccess'] } } },
        { id: 'useRecoveredKey', label: 'Use the key pulled from under the room door', timeCost: 1, requirements: { items: ['innCellarKey'] }, next: 'cellarEntry', effects: { setFlags: ['quietAccess'] } },
        { id: 'askInnkeeperForTruth', label: 'Ask the innkeeper to explain the knocks', timeCost: 4, next: 'hostConfrontation' },
      ],
    },
    cellarClues: {
      id: 'cellarClues', title: 'The Marks at the Threshold',
      text: 'From the passage, you inspect the threshold without going down. Wet boot scuffs lead down the seven cellar steps, and none return. The latch is scraped from the inside. A broken handrail rests beside the first step; the lower floor is still out of sight.',
      choices: [
        { id: 'openAfterClues', label: 'Use the broken rail to open the door', timeCost: 7, next: 'cellarEntry', effects: { setFlags: ['roughAccess', 'knowsCellar'], knowledge: ['Scuffs lead down the cellar steps but do not come back; the latch is marked from below.'] } },
        { id: 'lightAndListen', label: 'Light the steps before you descend', timeCost: 3, requirements: { anyItems: CELLAR_LIGHTS }, next: 'cellarEntry', effects: { setFlags: ['quietAccess', 'knowsCellar'], knowledge: ['The cellar steps are wet and their handrail is broken.'] } },
        { id: 'mirrorSteps', label: 'Check the first steps with your folding mirror', timeCost: 3, requirements: { items: ['foldingCardMirror'] }, next: 'cellarEntry', effects: { setFlags: ['mirrorCheckedCellar', 'knowsCellar'], knowledge: ['A folding mirror shows wet cellar steps and a broken handrail; the lower floor is out of view.'] } },
        { id: 'callHostToDoor', label: 'Ask the innkeeper about the marks', timeCost: 4, next: 'hostConfrontation' },
      ],
    },
    cellarEntry: {
      id: 'cellarEntry', title: 'Below the Inn', tone: 'danger',
      text: 'You lift the heavy door and descend the seven wet stone steps from the kitchen passage. At the foot, your light finds a fallen storage shelf pinning one leg of an injured man. He is conscious but cold. An open travel case lies beside him, its contents scattered. A thick support post stands beside the shelf, and the broken handrail is above you. The shelf blocks the direct route back to the steps.',
      textVariants: [
        { requirements: { flags: ['innkeeperHelping', 'identifiedSilas'], items: ['minerHeadlamp'], minElapsedMinutes: 30 }, text: 'The innkeeper follows your headlamp down the seven wet steps and stays by the doorway. Its beam shows Silas Vale pinned beneath a fallen shelf, conscious but weaker after the long wait. His open case is beside him. A thick post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['innkeeperHelping', 'identifiedSilas'], items: ['minerHeadlamp'] }, text: 'The innkeeper follows your headlamp down the seven wet steps and stays by the doorway. Its beam shows Silas Vale pinned beneath a fallen shelf, conscious and cold. His open case is beside him. A thick post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['innkeeperHelping', 'identifiedSilas'], minElapsedMinutes: 30 }, text: 'The innkeeper follows you down the seven wet steps and stays by the doorway. Silas Vale is pinned beneath a fallen shelf, conscious but weaker after the long wait. His open case is beside him. A thick post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['innkeeperHelping', 'identifiedSilas'] }, text: 'The innkeeper follows you down the seven wet steps and stays by the doorway. Silas Vale is pinned beneath a fallen shelf, conscious and cold. His open case is beside him. A thick post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['identifiedSilas'], items: ['minerHeadlamp'], minElapsedMinutes: 30 }, text: 'Your headlamp shows Silas Vale pinned beneath the fallen shelf. He is conscious but weaker after the long wait. His open travel case lies beside him. A thick support post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['identifiedSilas'], items: ['minerHeadlamp'] }, text: 'Your headlamp shows Silas Vale pinned beneath the fallen shelf. He is conscious and cold. His open travel case lies beside him. A thick support post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['identifiedSilas'], minElapsedMinutes: 30 }, text: 'Silas Vale is pinned beneath a fallen shelf, conscious but weaker after the long wait. His open travel case lies beside him. A thick support post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { flags: ['identifiedSilas'] }, text: 'Silas Vale is pinned beneath a fallen shelf, conscious and cold. His open travel case lies beside him. A thick support post stands beside the shelf; the broken handrail is above you.' },
        { requirements: { items: ['minerHeadlamp'], minElapsedMinutes: 30 }, text: 'Your headlamp shows an injured man pinned beneath a fallen shelf. He is conscious but weaker after the long wait. An open travel case lies beside him; the shelf blocks the route to the steps, where the handrail is broken.' },
        { requirements: { items: ['minerHeadlamp'] }, text: 'Your headlamp shows an injured man pinned beneath a fallen shelf. He is conscious and cold. An open travel case lies beside him; the shelf blocks the route to the steps, where the handrail is broken.' },
        { requirements: { minElapsedMinutes: 30 }, text: 'A fallen shelf pins an injured man, conscious but weaker after the long wait. An open travel case lies beside him; the shelf blocks the route to the steps, where the handrail is broken.' },
      ],
      choices: [
        { id: 'askHisName', label: 'Ask the injured man his name', next: 'cellarIdentity', effects: { setFlags: ['identifiedSilas'], knowledge: ['The injured traveler below the inn gives his name as Silas Vale.'] } },
        { id: 'rigRopeForSilas', label: 'Anchor rope to the cellar post and pull', timeCost: 8, requirements: { items: ['travelRope'] }, chance: { probability: 0.68, bonusItems: ['travelRope'], bonusProbability: 0.12, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'The rope holds around the support post while you ease the shelf clear.', failureMessage: 'The shelf rolls before the rope is secure; you stumble hard.', successEffects: { setFlags: ['ropeRescue'] }, failureEffects: { health: -2 } } },
        { id: 'pryShelf', label: 'Lever the shelf with a carried tool', timeCost: 4, requirements: { anyItems: PRY_TOOLS }, chance: { probability: 0.61, bonusItems: PRY_TOOLS, bonusFlags: ['mirrorCheckedCellar'], bonusProbability: 0.14, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'A careful lift opens enough space for the traveler to pull free.', failureMessage: 'The leverage shifts the shelf and sends you against the stone wall.', successEffects: { setFlags: ['carefulRescue'] }, failureEffects: { health: -2 } } },
        { id: 'liftWithInnkeeper', label: 'Work with the innkeeper to shift the shelf', requirements: { flags: ['innkeeperHelping'] }, timeCost: 5, next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
        { id: 'getHelpForSilas', label: 'Call upstairs for help with the shelf', requirements: { notFlags: ['innkeeperHelping'] }, timeCost: 5, next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
      ],
    },
    cellarIdentity: {
      id: 'cellarIdentity', title: 'The Injured Traveler', tone: 'warning',
      text: 'The man answers through clenched teeth: “Silas Vale. I checked in upstairs.” He went down to retrieve his case when rain began leaking beneath the back door. One wet step broke under him, and the shelf fell before he could reach the stairs. He remembers knocking, but not whether anyone heard.',
      choices: [
        { id: 'rigRopeForSilas', label: 'Anchor rope to the cellar post and pull', timeCost: 8, requirements: { items: ['travelRope'] }, chance: { probability: 0.68, bonusItems: ['travelRope'], bonusProbability: 0.12, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'The rope holds around the support post while you ease the shelf clear.', failureMessage: 'The shelf rolls before the rope is secure; you stumble hard.', successEffects: { setFlags: ['ropeRescue'] }, failureEffects: { health: -2 } } },
        { id: 'pryShelf', label: 'Lever the shelf with a carried tool', timeCost: 4, requirements: { anyItems: PRY_TOOLS }, chance: { probability: 0.61, bonusItems: PRY_TOOLS, bonusFlags: ['mirrorCheckedCellar'], bonusProbability: 0.14, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'A careful lift opens enough space for Silas to pull free.', failureMessage: 'The leverage shifts the shelf and sends you against the stone wall.', successEffects: { setFlags: ['carefulRescue'] }, failureEffects: { health: -2 } } },
        { id: 'liftWithInnkeeper', label: 'Work with the innkeeper to shift the shelf', requirements: { flags: ['innkeeperHelping'] }, timeCost: 5, next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
        { id: 'getHelpForSilas', label: 'Call upstairs for help with the shelf', requirements: { notFlags: ['innkeeperHelping'] }, timeCost: 5, next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
      ],
    },
    cellarStuck: {
      id: 'cellarStuck', title: 'The Latch Bites Back', tone: 'danger',
      text: 'The latch has caught your fingers, and the door is still shut. The knock comes again, weaker. The old frame is beginning to split; one more hard pull may open it, but the step above it is shifting.',
      choices: [
        { id: 'pullAgain', label: 'Pull once more and brace for the door', hint: 'The damaged frame may give way suddenly.', chance: { probability: 0.7, successNext: 'cellarEntry', failureNext: 'cellarSlip', successMessage: 'The frame cracks and the door opens.', failureMessage: 'The step drops as the latch tears loose.', failureEffects: { health: -3 } } },
        { id: 'callForInnHelp', label: 'Call the innkeeper to help open it', next: 'hostConfrontation' },
        { id: 'leaveCellarDoor', label: 'Stop and send for outside help', timeCost: 35, next: 'authoritiesCalled', effects: { historyFlags: ['returned_for_authorities'] } },
      ],
    },
    cellarSlip: {
      id: 'cellarSlip', title: 'A Shift in the Cellar', tone: 'danger',
      text: 'The shelf shifts and the old steps groan above you. You are bruised, and the route back is narrowing. The injured traveler is still alive. A second unbraced attempt could bring the shelf or a step down on you.',
      choices: [
        { id: 'summonHelpAfterSlip', label: 'Call upstairs for the innkeeper and guests', next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
        { id: 'retryWithTool', label: 'Make one more attempt with your tool', requirements: { anyItems: PRY_TOOLS }, chance: { probability: 0.58, bonusItems: PRY_TOOLS, bonusProbability: 0.12, successNext: 'silasFree', failureNext: 'cellarSlipAgain', successMessage: 'The tool gives you a stable point of leverage.', failureMessage: 'The shelf shifts again and the stair above cracks.', failureEffects: { health: -3 } } },
        { id: 'climbOutAlone', label: 'Climb out and leave the rescue to others', next: 'leftSilasEnding', effects: { historyFlags: ['uncovered_inn_truth', 'walked_away_from_inn_problem'] } },
      ],
    },
    cellarSlipAgain: {
      id: 'cellarSlipAgain', title: 'The Stair Gives Way', tone: 'danger',
      text: 'A stair breaks loose above you. The cellar is no longer safe to work in. You can still climb toward the service passage, but another attempt here risks being crushed.',
      choices: [
        { id: 'escapeForHelp', label: 'Climb out and send for a rescue crew', next: 'authoritiesCalled', effects: { historyFlags: ['returned_for_authorities'] } },
        { id: 'tryLastLift', label: 'Attempt one final lift before the stair falls', hint: 'The danger is immediate and visible; failure could be fatal.', chance: { probability: 0.42, successNext: 'silasFree', failureNext: 'cellarFatalEnding', successMessage: 'You haul the traveler clear and scramble toward the door.', failureMessage: 'The stair collapses across the cellar.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
      ],
    },
    sharedRescue: {
      id: 'sharedRescue', title: 'More Hands at the Door',
      text: 'After your call, Nell comes down from the kitchen with a lantern. The innkeeper fetches two guests and returns with a length of beam. Nell stays near the door and keeps the injured traveler talking while you guide the lift. No one can make the cellar safe, but together you can shift the shelf without putting all the weight on one person.',
      choices: [
        { id: 'guideTheLift', label: 'Guide the shared lift', chance: { probability: 0.86, successNext: 'silasFree', failureNext: 'partialRescue', successMessage: 'The beam takes the weight and Vale pulls his leg free.', failureMessage: 'The shelf shifts, but the group gets Vale clear with a badly bruised leg.', successEffects: { setFlags: ['sharedRescue'] }, failureEffects: { health: -1, setFlags: ['sharedRescue'] } } },
        { id: 'sendForDoctorFirst', label: 'Send for a doctor before moving him', next: 'authoritiesCalled', effects: { setFlags: ['askedForHelp'], historyFlags: ['returned_for_authorities'] } },
      ],
    },
    authoritiesCalled: {
      id: 'authoritiesCalled', title: 'Help on the Road', tone: 'warning',
      text: 'A constable and a doctor reach the rear passage with a lantern and a jack. They descend the seven cellar steps; the injured traveler is still trapped but answering. The storm has slowed their journey. Experienced hands can work under the damaged steps, but the cellar cannot be left as it is.',
      choices: [
        { id: 'assistAuthorities', label: 'Help the doctor and constable lift the shelf', chance: { probability: 0.9, successNext: 'silasFree', failureNext: 'partialRescue', successMessage: 'The jack takes the load and Vale is brought out safely.', failureMessage: 'They stabilize Vale and his leg, but the shelf will take longer to move.', successEffects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] }, failureEffects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] } } },
        { id: 'leaveAuthoritiesToIt', label: 'Leave the cellar work to them', next: 'partialRescue', effects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] } },
      ],
    },
    silasFree: {
      id: 'silasFree', title: 'The Missing Guest',
      text: 'The traveler is out of the cellar, cold and shaken but alive. Once he can speak, he gives his name as Silas Vale and confirms he went down for his case when rainwater came under the back door. A wet step broke under him, and the shelf pinned him before he could reach the stairs. He called for help but cannot say whether anyone heard. The innkeeper does not explain the blocked room.',
      textVariants: [
        { requirements: { flags: ['hostConfessed'] }, text: 'Silas Vale is out of the cellar, cold and shaken but alive. He confirms he went down for his case when rainwater came under the back door; a wet step broke under him, and the shelf pinned him before he could reach the stairs. The innkeeper has admitted that he heard Vale and lied about his departure to protect the inn.' },
        { requirements: { flags: ['identifiedSilas'] }, text: 'Silas Vale is out of the cellar, cold and shaken but alive. He confirms he went down for his case when rainwater came under the back door; a wet step broke under him, and the shelf pinned him before he could reach the stairs. He called for help but cannot say whether anyone heard.' },
      ],
      choices: [
        { id: 'acceptFoldingTool', label: 'Accept the innkeeper’s folding pry tool', requirements: { notItems: ['foldingPryTool'] }, next: 'quietEnding', effects: { gainItems: ['foldingPryTool'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'acceptBrassKey', label: 'Keep the old brass room key as a memento', requirements: { notItems: ['brassRoomKey'] }, next: 'quietEnding', effects: { gainItems: ['brassRoomKey'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'declineInnReward', label: 'Decline a reward and leave', next: 'quietEnding', effects: { historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
      ],
    },
    partialRescue: {
      id: 'partialRescue', title: 'Safe, but Not Yet Free', tone: 'warning',
      text: 'The injured traveler is alive and the cellar is shored up, but the shelf cannot be moved safely tonight. The doctor stays with him while the constable arranges a proper rescue. The innkeeper must answer for delaying help, though the full story is still being pieced together.',
      choices: [
        { id: 'takeWedgeAfterPartial', label: 'Accept the folding pry tool for your help', requirements: { notItems: ['foldingPryTool'] }, next: 'partialEnding', effects: { gainItems: ['foldingPryTool'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'declinePartialReward', label: 'Leave without taking anything', next: 'partialEnding', effects: { historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
      ],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Beyond the Inn',
      text: 'You leave the Lantern House and take the road while it is still passable. Behind you, the inn’s windows glow through the rain. You do not learn what became of the traveler or whether the innkeeper’s account was true, and no one asks you to stay.', choices: [], ending: 'success',
    },
    walkAwayAtArrival: {
      id: 'walkAwayAtArrival', title: 'The Road Beyond the Inn',
      text: 'You leave the Lantern House and take the road while it is still passable. Behind you, the inn’s windows glow through the rain. You do not learn what became of the traveler or whether the innkeeper’s account was true, and no one asks you to stay.', choices: [], ending: 'success', completionQualification: 'nonSubstantive',
    },
    wrongAccusationEnding: {
      id: 'wrongAccusationEnding', title: 'The Door Left Shut',
      text: 'Nell withdraws to the kitchen after your accusation. The innkeeper will not speak to you again. You leave without finding the missing traveler or learning whether anyone caused his disappearance.', choices: [], ending: 'success',
    },
    leftSilasEnding: {
      id: 'leftSilasEnding', title: 'A Rescue for the Morning',
      text: 'You climb the seven cellar steps into the service passage and tell the innkeeper that a traveler is pinned below. He goes for help while you leave the inn. The cellar remains dangerous, and you do not stay to learn how the rescue ends.', choices: [], ending: 'success',
    },
    quietEnding: {
      id: 'quietEnding', title: 'Morning at the Lantern House',
      text: 'By morning, Silas Vale is resting upstairs. The cellar door has been marked for repair before another guest is taken. You know what happened below, though the innkeeper’s reason for blocking the empty room may remain unanswered.',
      textVariants: [
        { requirements: { flags: ['hostConfessed'] }, text: 'By morning, Silas Vale is resting upstairs. The cellar door has been marked for repair before another guest is taken. The innkeeper has admitted he heard the knocks and blocked the empty room to hide the accident.' },
        { requirements: { flags: ['guestConfided'] }, text: 'By morning, Silas Vale is resting upstairs. The cellar door has been marked for repair before another guest is taken. Nell’s account of the innkeeper blocking the empty room is no longer disputed.' },
      ], choices: [], ending: 'success',
    },
    partialEnding: {
      id: 'partialEnding', title: 'A Light Kept Below',
      text: 'The doctor stays with the injured traveler until the proper rescue arrives. The cellar door is marked off until the steps can be repaired. You leave before the weather clears, knowing someone is alive below, while the consequences of the innkeeper’s delay are still unfolding.', choices: [], ending: 'success',
    },
    cellarFatalEnding: {
      id: 'cellarFatalEnding', title: 'Under the Broken Stair', tone: 'danger',
      text: 'The stair gives way before you can clear the shelf. The cellar had warned you it would not bear another attempt.', choices: [], ending: 'death',
    },
  },
};
