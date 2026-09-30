import type { Choice, Scenario } from '../types';

const REPAIR_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'compactStoveTool', 'bridgewrightHammer'];
const DOOR_TOOLS = ['ratCatchersHook', 'foldingPryTool', 'brassCandlestick', 'pocketToolkit', 'foremanMultiTool', 'icehouseTongs', 'brassBottleOpener'];
const SERVICE_GEAR = ['travelRope', 'minerHeadlamp'];
const RESCUE_GEAR = ['travelRope', 'minerHeadlamp', 'heavyLeatherGloves', 'weatherproofCloak', 'pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'bridgewrightHammer', 'ratCatchersHook', 'compactBlockAndTackle', 'icehouseTongs'];
const INSULATING_GEAR = ['waxedCanvasSheet', 'weatherproofCloak'];

const rewardChoices = (ending: string): Choice[] => [
  { id: 'takeBlockAndTackle', label: 'Accept the co-op’s compact block-and-tackle', requirements: { notItems: ['compactBlockAndTackle'] }, effects: { gainItems: ['compactBlockAndTackle'] }, next: ending },
  { id: 'takeIcehouseTongs', label: 'Accept a pair of icehouse tongs', requirements: { notItems: ['icehouseTongs'] }, effects: { gainItems: ['icehouseTongs'] }, next: ending },
  { id: 'declineColdStorageReward', label: 'Thank the crew and leave without a tool', next: ending },
];

export const COLD_STORAGE: Scenario = {
  id: 'cold-storage',
  title: 'Cold Storage',
  subtitle: 'A trapped worker, a failing cold room, and supplies the town depends on.',
  startScene: 'loadingBay',
  timePhases: [
    { id: 'stable', label: 'The Cold Store Holds', atMinutes: 0 },
    { id: 'worsening', label: 'The Cold Is Deepening', atMinutes: 15 },
    { id: 'dangerous', label: 'The System Is Failing', atMinutes: 30 },
    { id: 'critical', label: 'The Last Safe Minutes', atMinutes: 45 },
  ],
  scenes: {
    loadingBay: {
      id: 'loadingBay', title: 'The Cooperative Icehouse', tone: 'warning',
      text: 'The rural cooperative’s cold store is humming far louder than it should. A worker named Mara is trapped somewhere inside; before the refrigeration machinery jammed, the foreman heard her answer from within. Since then, no one has heard from her. Frost is spreading around a sealed service door, while the building also holds supplies the nearby settlement depends on. The foreman asks you to help before either problem gets worse.',
      textVariants: [{ requirements: { historyFlags: ['rescued_cold_storage_worker'] }, text: 'The rural cooperative’s cold store is humming far louder than it should. Foreman Iven recognizes you as someone who has brought a trapped worker home before. Mara is trapped somewhere inside, the refrigeration cycle jammed, and frost is spreading around a sealed service door. The building also holds supplies the nearby settlement depends on.' }],
      choices: [
        { id: 'inspectDoor', label: 'Inspect the sealed service door', timeCost: 3, next: 'doorSurvey' },
        { id: 'inspectControls', label: 'Check the refrigeration controls', timeCost: 4, next: 'controlSurvey' },
        { id: 'inspectStock', label: 'Check the cooperative’s stored goods', timeCost: 3, next: 'goodsSurvey' },
        { id: 'callCrew', label: 'Send for the nearby rescue crew', next: 'outsideCall', effects: { setFlags: ['helpCalled'] } },
      ],
    },
    doorSurvey: {
      id: 'doorSurvey', title: 'Frost at the Latch', tone: 'warning',
      text: 'The insulated door has bowed against its frame. A faint knock answers from beyond it, but you cannot tell how far back the worker is. The lower hinge is packed with ice, and a storage rack beyond the wall creaks when the compressor surges. Forcing the door might open a route—or shift the load.',
      choices: [
        { id: 'forceDoor', label: 'Force the main door', hint: 'The frame is visibly bowed; a failed shove could jam it tighter.', timeCost: 9, chance: { probability: 0.62, successNext: 'workerFound', failureNext: 'doorBruised', successMessage: 'The frame gives enough to reach the lower chamber.', failureMessage: 'The door shifts, then wedges harder in the ice.', successEffects: { setFlags: ['mainAccessOpened'] }, failureEffects: { health: -1, setFlags: ['doorDamaged'] } } },
        { id: 'toolTheLatch', label: 'Lift the latch with a carried tool', hint: 'A hook, pry tool, or sturdy lever can work the frozen catch.', timeCost: 4, requirements: { anyItems: DOOR_TOOLS }, chance: { probability: 0.86, successNext: 'workerFound', failureNext: 'doorBruised', successMessage: 'The tool lifts the catch without shifting the frame.', failureMessage: 'The frozen catch snaps back and strikes your hand.', successEffects: { setFlags: ['mainAccessOpened'] }, failureEffects: { health: -1, setFlags: ['doorDamaged'] } } },
        { id: 'searchServiceRoute', label: 'Look for another way below', hint: 'A floor drain could lead to a service passage; it is dark and slick.', timeCost: 8, next: 'serviceEntry' },
        { id: 'inspectControlPanel', label: 'Check the control panel before forcing anything', timeCost: 4, next: 'controlSurvey' },
      ],
    },
    doorBruised: {
      id: 'doorBruised', title: 'A Door More Stubborn', tone: 'danger',
      text: 'The frame has shifted another inch. Your shoulder aches, and the rack’s creak beyond the wall is louder now. A second hard shove could bring weight down on whoever is inside. The door is no longer a safe place to keep testing.',
      choices: [
        { id: 'leaveForControls', label: 'Find the refrigeration cut-off', timeCost: 3, next: 'controlSurvey' },
        { id: 'leaveForServiceRoute', label: 'Try the lower service passage', timeCost: 4, next: 'serviceEntry' },
        { id: 'callFromDoor', label: 'Send for the rescue crew', effects: { setFlags: ['helpCalled'] }, next: 'outsideCall' },
        { id: 'withdrawFromDoor', label: 'Back out and leave the site', effects: { historyFlags: ['abandoned_cold_storage_rescue'] }, next: 'abandonedEnding' },
      ],
    },
    controlSurvey: {
      id: 'controlSurvey', title: 'The Stuck Relay', tone: 'warning',
      text: 'The panel diagram shows the lower cold room and the service door. A relay has stuck in the cooling cycle, pushing the chamber colder while the motor runs hot. The manual shut-off is still reachable, though water has begun to bead beneath the panel. A carried tool could adjust the relay without cutting power to the whole building.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The panel clicks as the motor strains. The lower room is still cooling, the motor casing is hot, and water beads beneath the reachable manual shut-off. A carried tool could free the relay; cutting power would stop the cold but leave the goods without refrigeration.' }],
      choices: [
        { id: 'repairRelayWithTool', label: 'Free the relay with your carried tool', hint: 'The wet panel is risky, but a small tool can reach the stuck relay.', timeCost: 5, requirements: { anyItems: REPAIR_TOOLS }, chance: { probability: 0.88, successNext: 'workerFound', failureNext: 'relaySparks', successMessage: 'The relay clicks free and the cooling cycle settles.', failureMessage: 'A spark jumps from the wet casing as the relay jams deeper.', successEffects: { setFlags: ['machineryStabilized', 'relayRepaired'], historyFlags: ['stabilized_failing_storage'] }, failureEffects: { health: -1, setFlags: ['relayDamaged'] } } },
        { id: 'manualRelayBypass', label: 'Try a careful manual bypass', hint: 'Possible without tools, but the wet contacts make it uncertain.', timeCost: 11, requirements: { notItems: REPAIR_TOOLS }, chance: { probability: 0.61, successNext: 'workerFound', failureNext: 'relaySparks', successMessage: 'The bypass holds and the compressor slows.', failureMessage: 'The contacts arc; you pull back with a burned palm.', successEffects: { setFlags: ['machineryStabilized'], historyFlags: ['stabilized_failing_storage'] }, failureEffects: { health: -2, setFlags: ['relayDamaged'] } } },
        { id: 'cutCompressorPower', label: 'Use the manual shut-off', hint: 'It will stop the cold surge, but the cooperative’s stock will warm.', timeCost: 2, effects: { setFlags: ['machineryStopped'], knowledge: ['The refrigeration relay was stuck; cutting power stops the cold surge but puts all stored goods at risk.'] }, next: 'workerFound' },
        { id: 'checkGoodsFromPanel', label: 'Check what the cold surge is reaching', timeCost: 3, next: 'goodsSurvey' },
      ],
    },
    relaySparks: {
      id: 'relaySparks', title: 'A Wet Spark', tone: 'danger',
      text: 'The relay spits a blue spark. Your hand stings, and the compressor’s pitch drops then rises again. The panel is now too unstable to keep working on. You can use the large shut-off, reach the service passage, or get the crew.',
      choices: [
        { id: 'emergencyPowerOff', label: 'Pull the large manual shut-off', hint: 'This safely stops the machinery, but the goods will lose cooling.', effects: { setFlags: ['machineryStopped'] }, next: 'workerFound' },
        { id: 'serviceAfterSpark', label: 'Reach the lower chamber through the service route', timeCost: 5, next: 'serviceEntry' },
        { id: 'crewAfterSpark', label: 'Send for the rescue crew', effects: { setFlags: ['helpCalled'] }, next: 'outsideCall' },
      ],
    },
    goodsSurvey: {
      id: 'goodsSurvey', title: 'The Clinic’s Cold Cart', tone: 'warning',
      text: 'The temperature strip on a sealed cart is turning white. Inside are refrigerated medicines reserved by the nearby clinic; the jammed system is pushing them below their safe range. The cart’s insulation is sound, but it is parked beside the cold-air vent. Moving it could preserve the supply, though it will cost several minutes while Mara is still missing.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The temperature strip on the clinic’s medicine cart has reached its warning mark. The cold-air vent is icing over, and the medicines are near the edge of their safe range. A quick insulated move may still save them, but the cart is heavy and Mara remains missing.' }],
      choices: [
        { id: 'coverGoodsFast', label: 'Cover and move the cart with your insulation', hint: 'A carried canvas sheet or weatherproof cloak can shield the cart quickly.', timeCost: 4, requirements: { anyItems: INSULATING_GEAR }, chance: { probability: 0.9, successNext: 'goodsSecured', failureNext: 'goodsLost', successMessage: 'The cart reaches the insulated alcove before the strip changes.', failureMessage: 'The cart slips; one medicine case freezes before you can move it.', successEffects: { setFlags: ['goodsSaved', 'goodsIdentified'], knowledge: ['The clinic’s refrigerated medicines were exposed to the cold vent. You moved the cart to a stable alcove.'], historyFlags: ['saved_community_supplies'] }, failureEffects: { setFlags: ['goodsSpoiled', 'goodsIdentified'], knowledge: ['The clinic’s medicine cart was exposed to the cold vent; one case froze while it was moved.'] } } },
        { id: 'moveGoodsByHand', label: 'Move the medicine cart by hand', hint: 'The cart is heavy and the floor is slick; it will take longer.', timeCost: 9, requirements: { notItems: INSULATING_GEAR }, chance: { probability: 0.7, successNext: 'goodsSecured', failureNext: 'goodsLost', successMessage: 'You get the cart clear of the vent just before the strip changes.', failureMessage: 'The slick floor slows you; part of the medicine stock freezes.', successEffects: { setFlags: ['goodsSaved', 'goodsIdentified'], knowledge: ['The clinic’s refrigerated medicines were exposed to the cold vent. You moved the cart to a stable alcove.'], historyFlags: ['saved_community_supplies'] }, failureEffects: { setFlags: ['goodsSpoiled', 'goodsIdentified'], knowledge: ['The clinic’s medicine cart was exposed to the cold vent; part of the stock froze while it was moved.'] } } },
        { id: 'leaveGoodsAndReachWorker', label: 'Leave the cart and follow the knocks', timeCost: 2, effects: { setFlags: ['goodsIdentified', 'goodsAtRisk'], knowledge: ['The clinic’s refrigerated medicines are at risk from the cold vent.'] }, next: 'workerFound' },
        { id: 'callBeforeMovingGoods', label: 'Send for the crew to move the cart', timeCost: 2, effects: { setFlags: ['goodsIdentified'], knowledge: ['The clinic’s refrigerated medicines are at risk from the cold vent.'] }, next: 'outsideCall' },
      ],
    },
    goodsSecured: {
      id: 'goodsSecured', title: 'The Cart Is Clear',
      text: 'The clinic’s medicine cart is sealed in the insulated alcove, away from the freezing vent. The temperature strip is steady again. The delay has cost Mara several more minutes in the cold.',
      choices: [{ id: 'reachWorkerAfterGoods', label: 'Follow the knocks to Mara', timeCost: 2, next: 'workerFound' }],
    },
    goodsLost: {
      id: 'goodsLost', title: 'A Case Frozen Through', tone: 'warning',
      text: 'The cart is clear of the vent, but the temperature strip has crossed its limit. One case of the clinic’s medicines is frozen and unusable. The rest can be salvaged. The delay has cost Mara several more minutes in the cold.',
      choices: [{ id: 'reachWorkerAfterLoss', label: 'Follow the knocks to Mara', timeCost: 2, next: 'workerFound' }],
    },
    serviceEntry: {
      id: 'serviceEntry', title: 'The Meltwater Channel', tone: 'warning',
      text: 'A narrow service channel runs beneath the loading floor. Meltwater covers the bottom step, and the iron rungs are slick with frost. A weak knock comes from the far end. A rope or headlamp would help you move safely; going without either is possible, but the dark and water make a fall likely.',
      choices: [
        { id: 'descendWithGear', label: 'Use your rope or headlamp to descend', timeCost: 6, requirements: { anyItems: SERVICE_GEAR }, chance: { probability: 0.88, successNext: 'workerFound', failureNext: 'serviceSlip', successMessage: 'The light and line get you down to the lower landing.', failureMessage: 'The rung shifts, but the rope catches your weight.', successEffects: { setFlags: ['alternateAccess'] }, failureEffects: { health: -1, setFlags: ['alternateAccess'] } } },
        { id: 'descendWithoutGear', label: 'Climb down carefully in the dark', hint: 'The wet rungs are visibly slick; failure may injure you.', timeCost: 13, requirements: { notItems: SERVICE_GEAR }, chance: { probability: 0.61, successNext: 'workerFound', failureNext: 'serviceSlip', successMessage: 'You reach the far landing by keeping one hand on the wall.', failureMessage: 'Your boot slips against the wet iron.', successEffects: { setFlags: ['alternateAccess'] }, failureEffects: { health: -3, setFlags: ['alternateAccess'] } } },
        { id: 'hookChannelLatch', label: 'Reach the lower latch with your hook', timeCost: 4, requirements: { items: ['ratCatchersHook'] }, chance: { probability: 0.82, successNext: 'workerFound', failureNext: 'serviceSlip', successMessage: 'The hook catches the latch and draws the inner gate open.', failureMessage: 'The hook skates off the iced ring and strikes the grate.', successEffects: { setFlags: ['alternateAccess'] }, failureEffects: { health: -2, setFlags: ['alternateAccess'] } } },
        { id: 'crewForChannel', label: 'Have the crew lower a safety line', effects: { setFlags: ['helpCalled'] }, next: 'outsideCall' },
      ],
    },
    serviceSlip: {
      id: 'serviceSlip', title: 'A Fall in the Channel', tone: 'danger',
      text: 'You hit the channel floor hard. Water runs around your boots, and the weak knocking is now close enough to answer. Your route is open, but continuing quickly could worsen the injury.',
      choices: [
        { id: 'steadyAndContinue', label: 'Take a moment, then reach the lower landing', timeCost: 5, effects: { setFlags: ['workerWorsened'] }, next: 'workerFound' },
        { id: 'callFromChannel', label: 'Call for a line and outside help', timeCost: 3, effects: { setFlags: ['helpCalled'] }, next: 'outsideCall' },
        { id: 'withdrawChannel', label: 'Climb out and leave the site', effects: { historyFlags: ['abandoned_cold_storage_rescue'] }, next: 'abandonedEnding' },
      ],
    },
    outsideCall: {
      id: 'outsideCall', title: 'The Rescue Crew Is Not Here Yet',
      text: 'The nearest rescue crew is at the village pump station. A runner can bring them over, but the trip takes time. The foreman can also pay for a second hauler and a hand-cart to hurry the equipment here. No one offers a guarantee about what will still be usable when they arrive.',
      choices: [
        { id: 'waitForCrew', label: 'Send a runner and wait for the crew', hint: 'No cost, but the trip takes fourteen minutes.', timeCost: 14, effects: { setFlags: ['helpCalled'] }, next: 'crewOnScene' },
        { id: 'payForHauler', label: 'Pay two coins for a second hauler', hint: 'The extra hand and cart save time; money is optional.', timeCost: 8, requirements: { minMoney: 2 }, effects: { money: -2, setFlags: ['helpCalled', 'paidHauler'] }, next: 'crewOnScene' },
        { id: 'sendForWinch', label: 'Send for the village winch crew', hint: 'The heavier gear takes longer, but can lift a damaged rack.', timeCost: 18, effects: { setFlags: ['helpCalled', 'winchCrewRequested'] }, next: 'crewOnScene' },
        { id: 'leaveWhileTheyCome', label: 'Leave before conditions worsen', effects: { historyFlags: ['abandoned_cold_storage_rescue'] }, next: 'abandonedEnding' },
      ],
    },
    crewOnScene: {
      id: 'crewOnScene', title: 'Hands at the Loading Door', tone: 'warning',
      text: 'The rescue crew arrives with a hand-winch and a pair of insulated blankets. They hear a knock from beyond the inner door and can work the frame without putting anyone beneath the rack. As they unload, they also notice cold-sensitive clinic medicines beside the vent; the frost line is advancing.',
      textVariants: [{ requirements: { flags: ['goodsIdentified'] }, text: 'The rescue crew arrives with a hand-winch and insulated blankets. They see the clinic cart you identified and the frost line moving across the staging floor. They can secure the medicines first or take their winch straight to the inner door.' }],
      choices: [
        { id: 'crewWinchDoor', label: 'Have the crew winch the inner door open', timeCost: 5, effects: { setFlags: ['helpArrived', 'mainAccessOpened'], knowledge: ['The rescue crew has reached the jammed cold room with a hand-winch.'] }, next: 'workerFound' },
        { id: 'crewSecureMedicine', label: 'Ask the crew to move the clinic medicines first', timeCost: 7, effects: { setFlags: ['helpArrived', 'goodsIdentified', 'goodsSaved'], knowledge: ['The clinic’s refrigerated medicines were at risk from the cold vent; the rescue crew moved them to an insulated alcove.'], historyFlags: ['saved_community_supplies'] }, next: 'workerFound' },
        { id: 'crewCutPower', label: 'Ask them to stabilize the refrigeration system', timeCost: 5, effects: { setFlags: ['helpArrived', 'machineryStabilized', 'machineryStopped'], historyFlags: ['stabilized_failing_storage'] }, next: 'workerFound' },
      ],
    },
    workerFound: {
      id: 'workerFound', title: 'Mara Beneath the Rack', tone: 'danger',
      text: 'Mara is pinned beneath a tilted storage rack in the lower chamber. She answers when you call, but frost has gathered on her sleeves. The rack’s upper bracket is visibly bent and creaks under the load. You can try to move it, use gear to lift safely, or spend more time on another priority.',
      textVariants: [
        { requirements: { flags: ['goodsIdentified', 'goodsSpoiled'], minElapsedMinutes: 30 }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers slowly, her sleeves crusted with frost. You know the clinic’s medicine cart has already lost part of its stock. The upper bracket is bent and creaks; any lift must be careful.' },
        { requirements: { flags: ['goodsIdentified', 'goodsSaved'], minElapsedMinutes: 30 }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers slowly, her sleeves crusted with frost. The clinic’s medicines are safe in the insulated alcove, but the rack’s bent bracket creaks with every compressor pulse.' },
        { requirements: { flags: ['goodsIdentified'], minElapsedMinutes: 30 }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers slowly, her sleeves crusted with frost. The clinic’s medicine cart is still near the vent, and the rack’s bent bracket creaks with every compressor pulse.' },
        { requirements: { flags: ['goodsIdentified', 'goodsSaved'] }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers when you call, though frost has gathered on her sleeves. The clinic’s medicines are safe in the insulated alcove. The rack’s bent bracket creaks under the load.' },
        { requirements: { flags: ['goodsIdentified', 'goodsSpoiled'] }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers when you call, though frost has gathered on her sleeves. Part of the clinic’s medicine stock has frozen. The rack’s bent bracket creaks under the load.' },
        { requirements: { minElapsedMinutes: 30 }, text: 'Mara is pinned beneath a tilted rack in the lower chamber. She answers slowly, her sleeves crusted with frost. The upper bracket is visibly bent and creaks with every compressor pulse. Any lift must be careful.' },
        { requirements: { flags: ['workerWorsened'] }, text: 'Mara is pinned beneath the rack and now answers only in short bursts. Your fall or delay has cost her time. The bent bracket is still moving; a rushed lift could bring the rack down.' },
      ],
      choices: [
        { id: 'rescueWithoutGear', label: 'Lift slowly and pull Mara clear', hint: 'A slow lift is safer, but it will take several minutes in the cold.', timeCost: 7, requirements: { notItems: RESCUE_GEAR }, effects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker'] }, next: 'rescueDebrief' },
        { id: 'quickGearRescue', label: 'Use your gear to lift and guide her out', hint: 'Your carried gear can speed the lift and keep the rack steady.', timeCost: 3, requirements: { anyItems: RESCUE_GEAR }, chance: { probability: 0.86, successNext: 'rescueDebrief', failureNext: 'rescueStrain', successMessage: 'Your gear takes the weight and Mara slides clear.', failureMessage: 'The line slips against the icy bracket; Mara is worse off and you take a hard knock.', successEffects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker'] }, failureEffects: { health: -2, setFlags: ['workerWorsened'] } } },
        { id: 'secureGoodsBeforeRescue', label: 'Secure the clinic medicines before lifting', hint: 'The stock may still be saved, but Mara will stay in the cold longer.', timeCost: 8, requirements: { flags: ['goodsIdentified'], notFlags: ['goodsSaved', 'goodsSpoiled'], maxElapsedMinutes: 40 }, effects: { historyFlags: ['prioritized_goods_over_worker'] }, chance: { probability: 0.68, successNext: 'lateGoodsSecured', failureNext: 'lateGoodsLost', successMessage: 'The medicine is insulated before the cold reaches it.', failureMessage: 'The cold crosses the cartons while you move them; part of the stock is lost.', successEffects: { setFlags: ['goodsSaved'], historyFlags: ['saved_community_supplies'] }, failureEffects: { setFlags: ['goodsSpoiled', 'workerWorsened'] } } },
        { id: 'crewRescueDirect', label: 'Let the crew winch Mara clear', hint: 'The crew has anchored its winch outside the rack.', requirements: { flags: ['helpArrived'] }, effects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker', 'returned_with_help'] }, next: 'rescueDebrief' },
        { id: 'liftUnstableRack', label: 'Risk a fast lift beneath the rack', hint: 'The bracket is already cracking. A failure could cause severe injury.', timeCost: 5, chance: { probability: 0.58, successNext: 'rescueDebrief', failureNext: 'rackShift', successMessage: 'The bracket holds long enough to pull Mara clear.', failureMessage: 'The bracket tears loose and the rack drops hard.', successEffects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker'] }, failureEffects: { health: -3, setFlags: ['workerWorsened', 'rackUnstable'] } } },
        { id: 'waitForWorkerCrew', label: 'Wait for the outside crew and their winch', hint: 'The crew can lift safely, but the trip will take time.', timeCost: 14, requirements: { notFlags: ['helpArrived'] }, effects: { setFlags: ['helpCalled'] }, next: 'workerCrewArrives' },
      ],
    },
    lateGoodsSecured: {
      id: 'lateGoodsSecured', title: 'Medicine Saved, Time Spent', tone: 'warning',
      text: 'The medicines are sealed in the insulated cart, but Mara has spent those minutes in the cold. She is weaker now. You cannot recover that time; the only useful step is to get her out.',
      choices: [{ id: 'rescueAfterSavingGoods', label: 'Stop sorting crates and free Mara', timeCost: 4, effects: { setFlags: ['workerRescued', 'workerWorsened'], historyFlags: ['rescued_cold_storage_worker'] }, next: 'rescueDebrief' }],
    },
    lateGoodsLost: {
      id: 'lateGoodsLost', title: 'Too Late for the Cart', tone: 'danger',
      text: 'The medicine cartons cross their safe temperature range while you move them. Some are no longer usable. Mara is weaker after the delay, and the rack continues to creak above her.',
      choices: [{ id: 'rescueAfterLosingGoods', label: 'Leave the damaged stock and free Mara', timeCost: 4, effects: { setFlags: ['workerRescued', 'workerWorsened'], historyFlags: ['rescued_cold_storage_worker'] }, next: 'rescueDebrief' }],
    },
    rescueStrain: {
      id: 'rescueStrain', title: 'The Lift Slips', tone: 'danger',
      text: 'The gear catches, but the rack shifts before Mara is free. Your arm is bruised and her answers grow faint. The bracket will not bear a second hurried pull. You can reset the line slowly, call the crew, or withdraw and leave the rescue to specialists.',
      textVariants: [{ requirements: { flags: ['helpArrived'] }, text: 'The gear catches, but the rack shifts before Mara is free. Your arm is bruised and her answers grow faint. The crew is already beside you; they can take the load while you reset the line, or you can withdraw and let them continue.' }],
      choices: [
        { id: 'resetLiftSlowly', label: 'Reset the gear and lift in stages', hint: 'The rack is unstable; this slower approach gives the line time to settle.', timeCost: 7, chance: { probability: 0.74, successNext: 'rescueDebrief', failureNext: 'rackShift', successMessage: 'The line takes the load in stages and Mara is freed.', failureMessage: 'The upper bracket splits under the repeated strain.', successEffects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker'] }, failureEffects: { health: -3, setFlags: ['rackUnstable', 'workerWorsened'] } } },
        { id: 'crewAfterLiftSlips', label: 'Call for the rescue crew', timeCost: 12, requirements: { notFlags: ['helpArrived'] }, effects: { setFlags: ['helpCalled'] }, next: 'workerCrewArrives' },
        { id: 'letCrewTakeLoad', label: 'Let the crew take the load', requirements: { flags: ['helpArrived'] }, effects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker', 'returned_with_help'] }, next: 'rescueDebrief' },
        { id: 'withdrawAfterLiftSlips', label: 'Withdraw and leave the rescue to specialists', effects: { historyFlags: ['abandoned_cold_storage_rescue'] }, next: 'partialEnding' },
      ],
    },
    rackShift: {
      id: 'rackShift', title: 'The Rack Comes Down', tone: 'danger',
      text: 'The rack has dropped against the next shelf. You are hurt, Mara is still trapped, and the metal frame continues to groan. A second pull might free her, but the load above you could be fatal. The safer choice is to retreat and wait for a heavy crew.',
      choices: [
        { id: 'secondRackPull', label: 'Make one more pull before it falls', hint: 'This is a desperate attempt under a failing rack; it could kill you.', timeCost: 3, chance: { probability: 0.45, successNext: 'rescueDebrief', failureNext: 'death', successMessage: 'The rack shifts just enough for Mara to slide free.', failureMessage: 'The upper shelf collapses across the space where you are standing.', successEffects: { setFlags: ['workerRescued'], historyFlags: ['rescued_cold_storage_worker'] }, failureEffects: { health: -8 } } },
        { id: 'retreatToCrew', label: 'Get clear and let the crew take over', effects: { historyFlags: ['returned_with_help'] }, next: 'partialEnding' },
      ],
    },
    workerCrewArrives: {
      id: 'workerCrewArrives', title: 'The Winch Crew Reaches You', tone: 'warning',
      text: 'The village crew sets a tripod over the aisle and anchors its winch outside the unstable rack. They can take the load safely now. The wait has left Mara weaker, but the team has enough hands to lift her without putting you beneath the shelves.',
      choices: [
        { id: 'winchMaraFree', label: 'Use the crew’s winch to free Mara', timeCost: 4, effects: { setFlags: ['workerRescued', 'helpArrived'], historyFlags: ['rescued_cold_storage_worker', 'returned_with_help'] }, next: 'rescueDebrief' },
        { id: 'crewSaveGoodsThenWorker', label: 'Have them secure the medicines first', hint: 'This may save the clinic stock, but delays Mara again.', timeCost: 8, requirements: { flags: ['goodsIdentified'], notFlags: ['goodsSaved', 'goodsSpoiled'], maxElapsedMinutes: 40 }, effects: { historyFlags: ['prioritized_goods_over_worker'] }, chance: { probability: 0.75, successNext: 'lateGoodsSecured', failureNext: 'lateGoodsLost', successMessage: 'The team moves the cartons into the insulated cart.', failureMessage: 'The cold reaches part of the cart while it is moved.', successEffects: { setFlags: ['goodsSaved'], historyFlags: ['saved_community_supplies'] }, failureEffects: { setFlags: ['goodsSpoiled', 'workerWorsened'] } } },
        { id: 'stabilizeRackForLater', label: 'Anchor the rack and wait for heavier equipment', timeCost: 5, effects: { setFlags: ['machineryStabilized'], historyFlags: ['stabilized_failing_storage', 'returned_with_help'] }, next: 'partialEnding' },
      ],
    },
    rescueDebrief: {
      id: 'rescueDebrief', title: 'A Warm Coat Around Mara',
      text: 'Mara is out of the cold room and wrapped in a rescue blanket. The foreman thanks you, then offers one of two tools from the cooperative’s repair chest: a compact block-and-tackle or a pair of icehouse tongs. Both are useful; the co-op can spare only one.',
      textVariants: [
        { requirements: { historyFlags: ['saved_community_supplies'] }, text: 'Mara is out of the cold room and wrapped in a rescue blanket. The clinic confirms the medicines you protected are still usable. In thanks, the foreman offers one tool from the co-op’s repair chest: a compact block-and-tackle or a pair of icehouse tongs.' },
        { requirements: { historyFlags: ['prioritized_goods_over_worker'] }, text: 'Mara is out of the cold room and wrapped in a rescue blanket. She is weaker after the delay, though the foreman understands why you tried to protect the clinic’s supply. The co-op offers one tool from its repair chest: a compact block-and-tackle or a pair of icehouse tongs.' },
        { requirements: { historyFlags: ['returned_with_help'] }, text: 'Mara is out of the cold room, thanks in part to the crew you brought back. The foreman offers one tool from the co-op’s repair chest: a compact block-and-tackle or a pair of icehouse tongs.' },
      ],
      choices: rewardChoices('finalOutcome'),
    },
    finalOutcome: {
      id: 'finalOutcome', title: 'When the Motor Goes Quiet', ending: 'success',
      text: 'Mara survives the night. The foreman and crew take over the cold store, making a list of what can be saved and what must be replaced. Your part is done; the co-op will remember what you chose to protect.',
      textVariants: [
        { requirements: { flags: ['workerRescued', 'goodsSaved', 'machineryStabilized'] }, text: 'Mara is safe, the clinic’s medicine remains usable, and the cooling system settles before more stock is lost. The foreman and crew take over the remaining work. For tonight, both a person and something the community depends on are protected.' },
        { requirements: { flags: ['workerRescued', 'goodsSaved', 'prioritized_goods_over_worker'] }, text: 'The clinic’s medicine is saved, and Mara survives the delay, though she needs treatment for prolonged cold exposure. The foreman does not call your choice right or wrong; the cartons mattered, and so did the minutes.' },
        { requirements: { flags: ['workerRescued', 'goodsSaved'] }, text: 'Mara is safe and the clinic’s medicine is usable. The cooling system remains damaged, so the cooperative loses other stock before the crew can move it. The rescue and the supplies both mattered tonight.' },
        { requirements: { flags: ['workerRescued', 'goodsSpoiled'] }, text: 'Mara is safe, but part of the clinic’s medicine has frozen and must be replaced. The foreman records the loss alongside the rescue; neither outcome cancels the other.' },
        { requirements: { flags: ['workerRescued', 'workerWorsened'] }, text: 'Mara survives, but the delay and the cold leave her badly weakened. The crew takes her to the clinic while the cooperative begins sorting damaged stock.' },
        { requirements: { flags: ['workerRescued'] }, text: 'Mara is safe, though the cold room and its contents have taken damage. The foreman and crew take over the inventory and repairs.' },
      ],
      choices: [],
    },
    partialEnding: {
      id: 'partialEnding', title: 'A Rescue Still Underway', ending: 'success',
      text: 'You get clear and the rescue crew stabilizes the rack. Mara remains trapped but responsive; the heavy winch team is now in position to take over. The cooperative’s stock is partly lost. You leave knowing the work is not finished, but that the next attempt will be safer.',
      choices: [],
    },
    abandonedEnding: {
      id: 'abandonedEnding', title: 'The Cold Store Behind You', ending: 'success',
      text: 'You leave the unsafe building rather than make another attempt. The crew has been alerted where possible, but Mara is still inside and the cooperative’s supplies remain at risk. You survive the night; the choice stays with you.',
      choices: [],
    },
    death: {
      id: 'death', title: 'Beneath the Shelves', ending: 'death',
      text: 'The weakened rack collapses across the aisle. The rescue crew reaches Mara, but your injuries are fatal. Your journey ends in the cold store.',
      choices: [],
    },
  },
};
