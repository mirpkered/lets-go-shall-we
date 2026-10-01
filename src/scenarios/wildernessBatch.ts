import type { Scenario } from '../types';

const ending = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });

export const THE_FAINT_TRAIL: Scenario = {
  id: 'the-faint-trail', title: 'The Faint Trail', subtitle: 'A familiar path grows difficult to follow.', startScene: 'trailhead',
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon light', atMinutes: 100 }, { id: 'lateLight', label: 'Light lowering', atMinutes: 200 }],
  scenes: {
    trailhead: { id: 'trailhead', title: 'Where the Track Fades', tone: 'safe', text: 'The old footpath is plain until it reaches a stretch of loose leaves beneath the pines. Beyond it, the ground rises gently toward a sunlit shoulder. You are not far from the road you left; turning back is still simple.', choices: [
      { id: 'followFaintTrace', label: 'Follow the faint track between the pines', hint: 'It may reconnect, but the leaves hide some of its turns.', timeCost: 18, chance: { probability: 0.72, bonusItems: ['trailCompass'], bonusProbability: 0.14, successNext: 'knownGround', failureNext: 'uncertainGround', successMessage: 'The track grows clear again beside a familiar split pine.', failureMessage: 'The traces divide beneath the leaves. You have not gone far, but cannot tell which one is the path.' } },
      { id: 'backtrackTrail', label: 'Backtrack to the road you know', timeCost: 15, next: 'backtracked' },
      { id: 'climbShoulder', label: 'Climb the low shoulder and read the terrain', hint: 'The slope is gentle, though loose leaves may shift underfoot.', timeCost: 12, chance: { probability: 0.74, successNext: 'knownGround', failureNext: 'uncertainGround', successMessage: 'From the rise, you recognize the stream and the road beyond it.', failureMessage: 'The rise gives no clear view through the trees. A few loose stones slide underfoot, and you climb back down.' } },
    ] },
    uncertainGround: { id: 'uncertainGround', title: 'Three Faint Lines', tone: 'warning', text: 'The leaves hold several shallow tracks, none clearly fresher than the others. The sun still reaches through the pines, and the road lies somewhere behind you. You can use a bearing, mark this place, wait for clearer light, or simply return.', choices: [
      { id: 'takeCompassBearing', label: 'Use your Trail Compass to choose a bearing', requirements: { items: ['trailCompass'] }, timeCost: 5, chance: { probability: 0.78, bonusProbability: 0.08, bonusItems: ['trailCompass'], successNext: 'knownGround', failureNext: 'waitedForLight', successMessage: 'The bearing leads you to the familiar stream bend.', failureMessage: 'The compass gives a bearing, not a path through the brush. You stop before going farther.' } },
      { id: 'markTrail', label: 'Place your Folding Trail Marker here', requirements: { items: ['foldingTrailMarker'] }, timeCost: 3, next: 'markedTrail', effects: { knowledge: ['A folding trail marker was placed where leaf-covered tracks divide beneath the pines.'] } },
      { id: 'waitForLight', label: 'Wait for the sun to clear the tree line', hint: 'You can see your own tracks again when the light shifts.', timeCost: 25, next: 'waitedForLight' },
      { id: 'returnFromTracks', label: 'Turn back to the road', timeCost: 15, next: 'backtracked' },
    ] },
    markedTrail: { id: 'markedTrail', title: 'A Point to Return To', tone: 'safe', text: 'Your marker hangs where the faint lines divide. You have not claimed any one line is right; the marker simply makes this spot easier to find again.', choices: [
      { id: 'tryMarkedLine', label: 'Follow the clearest line from here', hint: 'It can still peter out, but you can return to the marker.', timeCost: 15, chance: { probability: 0.67, bonusItems: ['trailCompass'], bonusProbability: 0.18, successNext: 'knownGround', failureNext: 'waitedForLight', successMessage: 'The line meets the stream path beyond the pines.', failureMessage: 'The line fades again; you return to your marker before wandering farther.' } },
      { id: 'backtrackMarker', label: 'Use the marker and return to the road', timeCost: 15, next: 'backtracked' },
    ] },
    knownGround: ending('knownGround', 'The Path Found Again', 'The trees open near a stream bend you recognize. You have found the route without much lost time; the trail’s brief confusion has not become a larger ordeal.'),
    backtracked: ending('backtracked', 'Back on the Road', 'You return to the road you know. The faint track can wait for another day with better light or a companion who knows the ground.'),
    waitedForLight: ending('waitedForLight', 'A Clearer Line', 'The sun shifts through the trees and shows which impressions continue toward the stream. You take the path slowly, keeping the road within an easy return.'),
  },
};

export const CAMP_BEFORE_DARK: Scenario = {
  id: 'camp-before-dark', title: 'Camp Before Dark', subtitle: 'There is still time to choose where the night finds you.', startScene: 'forkAtDusk',
  timePhases: [{ id: 'afternoon', label: 'Late afternoon', atMinutes: 0 }, { id: 'sunset', label: 'Sunset nearing', atMinutes: 35 }, { id: 'dusk', label: 'Dusk', atMinutes: 65 }],
  scenes: {
    forkAtDusk: { id: 'forkAtDusk', title: 'A Choice Before Sunset', tone: 'warning', text: 'The sun is low, and the road divides around a scrubby hill. A level shelf nearby has dry ground and room to camp. A known travelers’ shelter lies farther along the east road; pushing there may beat full dark, but there is no need to hurry if you stop here.', choices: [
      { id: 'campOnShelf', label: 'Make camp on the level shelf now', timeCost: 10, next: 'earlyCamp', effects: { historyFlags: ['chose_safe_camp_before_dark'] } },
      { id: 'pushToShelter', label: 'Continue toward the known shelter', hint: 'The road is sound, but sunset is close.', timeCost: 45, chance: { probability: 0.68, bonusItems: ['roadmansLantern', 'minerHeadlamp'], bonusProbability: 0.16, successNext: 'reachedShelter', failureNext: 'shelterAfterDark', successMessage: 'You reach the shelter while there is enough light to settle in.', failureMessage: 'The shelter is still ahead as dusk settles; you must decide whether to stop short.' } },
      { id: 'checkBeyondHill', label: 'Look over the hill for a better camp', hint: 'The climb is short, but the light keeps fading.', timeCost: 18, chance: { probability: 0.62, successNext: 'betterShelf', failureNext: 'earlyCamp', successMessage: 'A sheltered hollow appears just beyond the rise.', failureMessage: 'The ground beyond is rougher; the level shelf remains the sensible place to stop.' } },
      { id: 'wrapInCloak', label: 'Use your Weatherproof Cloak for the walk', requirements: { items: ['weatherproofCloak'] }, timeCost: 4, next: 'cloakWalk' },
    ] },
    cloakWalk: { id: 'cloakWalk', title: 'A Dry Layer', tone: 'safe', text: 'Your Weatherproof Cloak sheds the evening damp as you look over the nearby ground. It helps with the walk, but does not create extra daylight or turn rough earth into a good camp.', choices: [
      { id: 'campAfterWalk', label: 'Settle on the level shelf', timeCost: 8, next: 'earlyCamp' },
      { id: 'findBetterShelf', label: 'Try the hollow beyond the hill', hint: 'The ground may be sheltered, but the light is lower now.', timeCost: 15, chance: { probability: 0.64, successNext: 'betterShelf', failureNext: 'earlyCamp', successMessage: 'The hollow is level and screened from the wind.', failureMessage: 'The hollow is stony; you return to the level shelf before dark.' } },
    ] },
    earlyCamp: ending('earlyCamp', 'A Night with Time to Spare', 'You choose the level shelf and make camp while there is still light to arrange your bedroll. The shelter may have been a little farther on, but there is no penalty for stopping before the road demands one.'),
    betterShelf: ending('betterShelf', 'A Sheltered Hollow', 'The hollow is level and screened by brush. You settle in before dark, with enough time to gather dry kindling without rushing.'),
    reachedShelter: ending('reachedShelter', 'Under a Roof', 'You reach the known travelers’ shelter as the last light leaves the road. Its roof is plain but dry, and the choice to push on has paid off this evening.'),
    shelterAfterDark: ending('shelterAfterDark', 'A Camp Short of Shelter', 'You stop on a dry patch beside the road rather than stumble onward in darkness. The shelter can wait until morning; you made a safe camp without reaching it.'),
  },
};

export const THE_SHORTCUT: Scenario = {
  id: 'the-shortcut', title: 'The Shortcut', subtitle: 'A shorter line across country, if it suits you.', startScene: 'roadsideOffer',
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 100 }, { id: 'evening', label: 'Evening', atMinutes: 210 }],
  runRandomSelections: [{ id: 'shortcutGround', values: [{ value: 'firm', weight: 2 }, { value: 'rough' }] }],
  scenes: {
    roadsideOffer: { id: 'roadsideOffer', title: 'The Cut Across', tone: 'safe', text: 'At a fork, a drover points out a shorter track over open country. It saves several miles across firm ground, though its marks are faint; the established road is longer and well marked. Neither route is closed, and you have daylight enough to choose.', textVariants: [
      { requirements: { selections: { shortcutGround: 'rough' } }, text: 'At a fork, a drover points out a shorter track over open country. Recent rain has softened one stretch and its marks are faint; it may still save several miles. The established road is longer and well marked, and daylight leaves time to choose.' },
    ], choices: [
      { id: 'takeCutoff', label: 'Try the shorter track across the rise', hint: 'The path is faint, but the ground may be sound.', timeCost: 15, chance: { probability: 0.68, bonusItems: ['trailCompass'], bonusProbability: 0.18, penaltySelections: { shortcutGround: 'rough' }, penaltyProbability: 0.15, successNext: 'shortRoute', failureNext: 'roughCutoff', successMessage: 'The track holds its line and joins the road beyond the rise.', failureMessage: 'The faint track crosses loose ground and costs more time than expected.' } },
      { id: 'stayOnRoad', label: 'Stay on the established road', timeCost: 5, next: 'steadyRoad' },
      { id: 'askGround', label: 'Ask what the drover remembers of the ground', timeCost: 3, next: 'groundAccount', effects: { knowledge: ['The drover says the shortcut is firm in dry weather, but the ground can loosen after rain.'] } },
    ] },
    groundAccount: { id: 'groundAccount', title: 'A Local’s Memory', tone: 'safe', text: 'The drover has crossed the track in fair weather, but not since the last rain. Their advice is useful, not a guarantee; both routes remain open.', choices: [
      { id: 'takeAfterAsking', label: 'Take the shorter track', hint: 'It may save miles; loose ground could erase the gain.', timeCost: 15, chance: { probability: 0.68, bonusItems: ['trailCompass'], bonusProbability: 0.18, penaltySelections: { shortcutGround: 'rough' }, penaltyProbability: 0.15, successNext: 'shortRoute', failureNext: 'roughCutoff', successMessage: 'The track holds its line and joins the road beyond the rise.', failureMessage: 'The faint track crosses loose ground and costs more time than expected.' } },
      { id: 'roadAfterAsking', label: 'Use the established road', timeCost: 5, next: 'steadyRoad' },
      { id: 'waitForDryWeather', label: 'Rest here and let the track dry', timeCost: 60, next: 'waitedAtFork' },
    ] },
    shortRoute: ending('shortRoute', 'Miles Saved', 'The ground holds, and the cut rejoins the road beyond the hill. The shortcut was simply a shortcut this time.'),
    roughCutoff: ending('roughCutoff', 'A Longer Shortcut', 'The track breaks across loose ground and makes you walk slowly around a shallow wash. You reach the same road later than planned, with no injury and no mystery behind the delay.'),
    steadyRoad: ending('steadyRoad', 'The Marked Way', 'The established road takes longer, but its mileposts and firm surface make the day easy to judge. The drover continues in the other direction.'),
    waitedAtFork: ending('waitedAtFork', 'No Need to Rush', 'You rest near the fork until the ground feels firmer beneath your boots. Whether the saved miles were worth waiting is a matter of preference, not a test with one right answer.'),
  },
};

export const CREEK_ON_THE_RETURN: Scenario = {
  id: 'creek-on-the-return', title: 'Creek on the Return', subtitle: 'The crossing you used this morning has changed.', startScene: 'nearBank',
  timePhases: [{ id: 'afternoon', label: 'Afternoon rain', atMinutes: 0 }, { id: 'rising', label: 'Water rising', atMinutes: 20 }, { id: 'evening', label: 'Evening', atMinutes: 55 }],
  runRandomSelections: [{ id: 'creekTrend', values: [{ value: 'steady', weight: 2 }, { value: 'easing' }] }],
  scenes: {
    nearBank: { id: 'nearBank', title: 'A Higher Creek', tone: 'warning', text: 'You crossed this creek on stepping stones earlier in the day. Rain upstream has raised it; the old stones are now mostly underwater. The far bank is visible, but the current tugs at branches caught along the edge. A longer bridge lies several miles downstream.', choices: [
      { id: 'waitForCreek', label: 'Wait and watch the water for an hour', hint: 'It may ease, or remain too high to judge.', timeCost: 60, next: 'waterWatched', effects: { knowledge: ['The return creek rose after upstream rain; its stones were mostly submerged when you first watched.'] } },
      { id: 'searchDownstream', label: 'Follow the near bank toward a safer crossing', timeCost: 18, next: 'downstreamShelf' },
      { id: 'takeBridgeDetour', label: 'Walk to the downstream bridge', timeCost: 5, next: 'bridgeDetour' },
      { id: 'useTravelRope', label: 'Anchor your rope and test the shallow edge', requirements: { items: ['travelRope'] }, hint: 'A line helps you hold position, but cannot make the current harmless.', timeCost: 8, chance: { probability: 0.62, bonusProbability: 0.12, bonusItems: ['travelRope'], successNext: 'shallowCrossing', failureNext: 'wetBank', successMessage: 'The rope holds while you test a shallow line, but the main channel is still strong.', failureMessage: 'The current yanks the rope taut and knocks you onto the wet bank.' , failureEffects: { health: -1 } } },
    ] },
    waterWatched: { id: 'waterWatched', title: 'An Hour at the Bank', tone: 'warning', text: 'You watch for changes rather than stepping straight in. A rising creek can hide holes and pull at your legs even when the opposite bank looks close.', textVariants: [
      { requirements: { selections: { creekTrend: 'easing' } }, text: 'The rain has eased and the creek drops a little, though the middle still runs quickly. The stones are not all visible yet.' },
      { requirements: { selections: { creekTrend: 'steady' } }, text: 'The creek does not drop. The rain has eased, but the current still carries branches through the middle.' },
    ], choices: [
      { id: 'lookForLowerStones', label: 'Search the near bank for a lower shelf', timeCost: 12, next: 'downstreamShelf' },
      { id: 'useBridgeAfterWait', label: 'Use the downstream bridge instead', timeCost: 5, next: 'bridgeDetour' },
      { id: 'riskCreekAfterWait', label: 'Try the crossing on foot', hint: 'The current still runs; a slip may injure you.', timeCost: 6, chance: { probability: 0.56, successNext: 'shallowCrossing', failureNext: 'wetBank', successMessage: 'You find a shallow line and reach the other side shaken but upright.', failureMessage: 'A hidden hole takes your footing and the current knocks you onto the bank.', failureEffects: { health: -2 } } },
    ] },
    downstreamShelf: { id: 'downstreamShelf', title: 'A Gravel Shelf', tone: 'warning', text: 'The bank bends to a broad gravel shelf. Water crosses it in a thin sheet, but the channel beyond remains deep. You can wait, use your rope as a handline, or abandon the short crossing for the bridge.', choices: [
      { id: 'crossShelf', label: 'Cross the shallow shelf carefully', hint: 'The outer channel is deeper; turn back if the footing fails.', timeCost: 8, chance: { probability: 0.66, bonusItems: ['travelRope'], bonusProbability: 0.14, successNext: 'shallowCrossing', failureNext: 'wetBank', successMessage: 'You cross the gravel shelf in careful steps.', failureMessage: 'A step sinks in soft gravel and the current knocks you to your knees.', failureEffects: { health: -2 } } },
      { id: 'handlineCross', label: 'Use your rope as a handline across the shelf', requirements: { items: ['travelRope'] }, hint: 'Anchor it to the near-bank root before entering the water.', timeCost: 8, chance: { probability: 0.73, bonusProbability: 0.08, bonusItems: ['travelRope'], successNext: 'shallowCrossing', failureNext: 'wetBank', successMessage: 'The line steadies your steps across the gravel shelf.', failureMessage: 'The line slips around the wet root and you retreat to the bank.', failureEffects: { health: -1 } } },
      { id: 'leaveShelf', label: 'Walk on to the bridge', timeCost: 5, next: 'bridgeDetour' },
    ] },
    wetBank: { id: 'wetBank', title: 'Back on Firm Ground', tone: 'warning', text: 'You are on the near bank, wet and bruised, but clear of the current. The downstream bridge remains open. There is no need to try the same crossing again.', choices: [
      { id: 'retreatToBridge', label: 'Take the longer bridge route', timeCost: 5, next: 'bridgeDetour' },
      { id: 'restOnBank', label: 'Rest beside the bank before walking', timeCost: 15, next: 'bridgeDetour', effects: { health: 1 } },
    ] },
    shallowCrossing: ending('shallowCrossing', 'Across the Creek', 'You reach the far bank with wet boots and a little time lost. The creek was crossable here, but the choice carried real risk; the bridge would also have brought you home.'),
    bridgeDetour: ending('bridgeDetour', 'The Bridge Downstream', 'You follow the firm road to the downstream bridge and cross well above the water. The detour costs time, not safety.'),
  },
};

export const THE_FOG_COMES_DOWN: Scenario = {
  id: 'the-fog-comes-down', title: 'The Fog Comes Down', subtitle: 'An ordinary road grows difficult to see.', startScene: 'foggyTrack',
  timePhases: [{ id: 'mist', label: 'Mist gathering', atMinutes: 0 }, { id: 'thickFog', label: 'Thick fog', atMinutes: 20 }, { id: 'clearing', label: 'Fog thinning', atMinutes: 50 }],
  runRandomSelections: [{ id: 'fogCompany', values: [{ value: 'nearby' }, { value: 'alone' }] }],
  scenes: {
    foggyTrack: { id: 'foggyTrack', title: 'The White Road', tone: 'warning', text: 'Low fog settles across the ordinary road. You can still see the next fence post, but not the bend ahead. The ground is level here and there is room to stop without blocking anyone.', choices: [
      { id: 'stayRoad', label: 'Follow the road edge at a walking pace', hint: 'The road is level, but ditches can hide beyond the verge.', timeCost: 12, chance: { probability: 0.72, bonusItems: ['trailCompass'], bonusProbability: 0.1, successNext: 'roadBend', failureNext: 'stoppedShort', successMessage: 'You keep the fence posts in sight and reach the bend.', failureMessage: 'The posts disappear sooner than expected; you stop before losing the road.' } },
      { id: 'stopForFog', label: 'Stop safely and wait for the fog to lift', timeCost: 35, next: 'fogLifts', effects: { historyFlags: ['waited_for_visibility_before_travel'] } },
      { id: 'lightGround', label: 'Use your Miner’s Headlamp to watch the verge', requirements: { items: ['minerHeadlamp'] }, hint: 'It helps reveal nearby footing, not the road ahead.', timeCost: 10, next: 'roadBend', effects: { knowledge: ['In low fog, a headlamp helps reveal nearby footing but does not show the distant road.'] } },
      { id: 'signalLantern', label: 'Set your Roadman’s Lantern at the roadside', requirements: { items: ['roadmansLantern'] }, hint: 'A steady light may help another traveler find you.', timeCost: 8, next: 'heardTravelers', effects: { historyFlags: ['marked_safe_stop_in_fog'] } },
    ] },
    roadBend: { id: 'roadBend', title: 'A Bend in the Fog', tone: 'warning', text: 'The fence ends at a bend beside a shallow drainage ditch. The track continues beyond it, but the far posts are hidden. You hear a cart wheel somewhere ahead, moving slowly.', textVariants: [
      { requirements: { selections: { fogCompany: 'nearby' } }, text: 'The fence ends at a bend beside a shallow drainage ditch. You hear another traveler’s cart moving slowly beyond the fog; you cannot tell how far ahead it is.' },
      { requirements: { selections: { fogCompany: 'alone' } }, text: 'The fence ends at a bend beside a shallow drainage ditch. The only sound beyond the fog is water in the ditch; no other traveler answers your call.' },
    ], choices: [
      { id: 'callAhead', label: 'Call a greeting and wait for an answer', requirements: { selections: { fogCompany: 'nearby' } }, timeCost: 2, next: 'heardTravelers' },
      { id: 'followBendSlowly', label: 'Keep to the fence and round the bend slowly', timeCost: 10, chance: { probability: 0.65, bonusItems: ['trailCompass'], bonusProbability: 0.12, successNext: 'roadClear', failureNext: 'stoppedShort', successMessage: 'You keep the fence close and pass the ditch without stumbling.', failureMessage: 'The verge narrows at the bend; you stop before the ditch edge.' } },
      { id: 'waitAtBend', label: 'Wait beside the fence for visibility', timeCost: 25, next: 'fogLifts' },
      { id: 'turnBackFog', label: 'Return to the last clear landmark', timeCost: 12, next: 'fogLifts' },
    ] },
    stoppedShort: { id: 'stoppedShort', title: 'A Sensible Pause', tone: 'safe', text: 'You stop while you can still see the fence behind you. A few minutes of patience are better than stepping blind into the ditch.', choices: [
      { id: 'waitFromSafePlace', label: 'Stay put until the fog thins', timeCost: 25, next: 'fogLifts' },
      { id: 'returnFromFog', label: 'Walk back to the last clear landmark', timeCost: 12, next: 'fogLifts' },
    ] },
    heardTravelers: ending('heardTravelers', 'A Shared Pace', 'A traveler answers from the road and slows their cart. You both keep to the fence until the bend is behind you, then continue separately as the fog begins to lift.'),
    fogLifts: ending('fogLifts', 'The Road Reappears', 'The fog thins enough to show the fence and the next bend. You continue in ordinary daylight, having lost a little time but no ground.'),
    roadClear: ending('roadClear', 'Past the Bend', 'You round the bend with the fence close at hand. The drainage ditch is shallow, and no harm came from taking the road slowly.'),
  },
};

export const DRY_CAMP: Scenario = {
  id: 'dry-camp', title: 'Dry Camp', subtitle: 'The planned stopping place has no nearby water.', startScene: 'dryHollow',
  timePhases: [{ id: 'afternoon', label: 'Late afternoon', atMinutes: 0 }, { id: 'sunset', label: 'Sunset', atMinutes: 35 }, { id: 'dusk', label: 'Dusk', atMinutes: 70 }],
  scenes: {
    dryHollow: { id: 'dryHollow', title: 'No Water at the Hollow', tone: 'warning', text: 'The hollow is level and sheltered, but the shallow pool you expected is dry. You have enough water for the evening if you ration it; the nearest marked spring is back along the path, and daylight is fading.', choices: [
      { id: 'rationForNight', label: 'Ration your water and camp here', hint: 'A quiet night, with a smaller drink until morning.', timeCost: 8, next: 'rationedCamp', effects: { historyFlags: ['rationed_water_at_dry_camp'] } },
      { id: 'searchNearHollow', label: 'Search the nearby ground for a seep', timeCost: 15, chance: { probability: 0.45, successNext: 'foundSeep', failureNext: 'searchFailed', successMessage: 'A small seep gathers beneath a shaded rock; it is slow, but clear.', failureMessage: 'The nearby ground is dry. You return to the hollow before losing the trail.' } },
      { id: 'returnToSpring', label: 'Return to the marked spring before dusk', timeCost: 18, next: 'springCamp' },
      { id: 'changeTomorrowRoute', label: 'Mark a route toward water for morning', requirements: { items: ['foldingTrailMarker'] }, timeCost: 5, next: 'morningRoute' },
    ] },
    searchFailed: { id: 'searchFailed', title: 'Dry Ground', tone: 'safe', text: 'The search finds no water. You still have the evening’s ration, and the marked spring remains reachable before full dark if you leave now.', choices: [
      { id: 'goToSpringAfterSearch', label: 'Return to the marked spring', timeCost: 18, next: 'springCamp' },
      { id: 'stayAfterSearch', label: 'Camp here and save the rest for morning', timeCost: 5, next: 'rationedCamp' },
    ] },
    foundSeep: ending('foundSeep', 'A Slow Seep', 'The seep provides enough water to wet your mouth and fill a small cup. You camp nearby and follow the marked spring route in the morning; there is no need to risk a night march.'),
    rationedCamp: ending('rationedCamp', 'A Quiet, Dry Night', 'You ration what remains and make a simple camp. The decision is uncomfortable, not an emergency; you can reach the marked spring in the morning.'),
    springCamp: ending('springCamp', 'Water Before Nightfall', 'You return along the path to the marked spring and camp beside it. The extra walk uses daylight, but leaves you with water at hand.'),
    morningRoute: ending('morningRoute', 'A Route for Morning', 'You hang the trail marker where the path turns toward the spring. With the route made plain, you camp in the hollow and plan to fill your flask at first light.'),
  },
};

export const THE_RIDGE_OR_THE_VALLEY: Scenario = {
  id: 'the-ridge-or-the-valley', title: 'The Ridge or the Valley', subtitle: 'A direct exposed path, or a longer sheltered way.', startScene: 'twoRoutes',
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 100 }, { id: 'lateDay', label: 'Late day', atMinutes: 210 }],
  runRandomSelections: [{ id: 'weather', values: [{ value: 'clear', weight: 2 }, { value: 'clouding' }] }],
  scenes: {
    twoRoutes: { id: 'twoRoutes', title: 'At the Fork', tone: 'safe', text: 'A ridge path runs straight toward the next valley, high and open to the weather. A lower trail follows a sheltered creek bed, adding several miles. The sky is clear now, though clouds gather beyond the western hills. Both routes are well known to local travelers.', textVariants: [
      { requirements: { selections: { weather: 'clouding' } }, text: 'A ridge path runs straight toward the next valley, high and open to the weather. A lower trail follows a sheltered creek bed, adding several miles. Clouds gather beyond the western hills. Both routes are well known to local travelers.' },
    ], choices: [
      { id: 'takeRidge', label: 'Take the direct ridge path', hint: 'It saves time but offers little shelter if the weather turns.', timeCost: 45, chance: { probability: 0.7, lateProbability: 0.55, lateAfterMinutes: 55, penaltySelections: { weather: 'clouding' }, penaltyProbability: 0.1, bonusItems: ['weatherproofCloak'], bonusProbability: 0.12, successNext: 'ridgeArrival', failureNext: 'ridgePause', successMessage: 'The ridge stays passable and opens a clear view over the valley.', failureMessage: 'Wind and loose stones slow you at the exposed crest.' } },
      { id: 'takeValley', label: 'Follow the longer creek-side valley trail', hint: 'It takes longer but stays below the worst of the wind.', timeCost: 95, next: 'valleyArrival', effects: { historyFlags: ['chose_sheltered_travel_route'] } },
      { id: 'checkWeather', label: 'Watch the clouds before choosing', timeCost: 10, next: 'weatherWatched', effects: { knowledge: ['The ridge is shorter and exposed; the creek valley is longer and more sheltered.'] } },
      { id: 'signalFromFork', label: 'Use your Signal Mirror to ask the far trail crew', requirements: { items: ['roadsideSignalMirror'] }, hint: 'Only useful while sunlight reaches the ridge.', timeCost: 5, next: 'signalSeen', effects: { historyFlags: ['signaled_trail_crew_from_route_fork'] } },
    ] },
    weatherWatched: { id: 'weatherWatched', title: 'The Weather at the Fork', tone: 'warning', text: 'You check the sky once more before choosing. The ridge remains exposed; the creek valley remains sheltered.', textVariants: [
      { requirements: { selections: { weather: 'clear' } }, text: 'Clouds stay beyond the western hills and the ridge is dry for now. The exposed path saves time; the creek valley stays sheltered if you prefer a slower day.' },
      { requirements: { selections: { weather: 'clouding' } }, text: 'Clouds move closer but have not brought rain. The exposed ridge still saves time; the creek valley offers shelter if the weather turns.' },
    ], choices: [
      { id: 'ridgeAfterWeather', label: 'Take the ridge while it remains clear', hint: 'If cloud reaches the crest, the exposed walk will be harder.', timeCost: 45, chance: { probability: 0.7, lateProbability: 0.55, lateAfterMinutes: 55, penaltySelections: { weather: 'clouding' }, penaltyProbability: 0.1, bonusItems: ['weatherproofCloak'], bonusProbability: 0.12, successNext: 'ridgeArrival', failureNext: 'ridgePause', successMessage: 'The ridge stays passable and opens a clear view over the valley.', failureMessage: 'Wind and loose stones slow you at the exposed crest.' } },
      { id: 'valleyAfterWeather', label: 'Choose the sheltered valley route', timeCost: 95, next: 'valleyArrival' },
    ] },
    ridgePause: { id: 'ridgePause', title: 'Wind at the Crest', tone: 'warning', text: 'The ridge remains passable, but gusts make the narrowest stretch unpleasant. A weatherproof cloak can keep the rain off, though it will not steady your footing. The valley trail is still reachable by descending the near slope.', choices: [
      { id: 'continueRidge', label: 'Continue carefully along the ridge', hint: 'The footing is exposed and loose, but still passable.', timeCost: 25, chance: { probability: 0.64, bonusItems: ['weatherproofCloak'], bonusProbability: 0.14, successNext: 'ridgeArrival', failureNext: 'valleyArrival', successMessage: 'You cross the gusty crest and descend into the next valley.', failureMessage: 'A loose stone costs time. You descend to the sheltered trail without injury.' } },
      { id: 'descendToValley', label: 'Descend to the sheltered trail', timeCost: 20, next: 'valleyArrival' },
    ] },
    signalSeen: { id: 'signalSeen', title: 'A Reply from the Trail', tone: 'safe', text: 'A road crew on the distant slope sees the mirror and signals that both routes are open. They cannot tell which will suit your pace or the weather where you are.', choices: [
      { id: 'ridgeAfterSignal', label: 'Take the shorter ridge', timeCost: 45, chance: { probability: 0.7, lateProbability: 0.55, lateAfterMinutes: 55, penaltySelections: { weather: 'clouding' }, penaltyProbability: 0.1, bonusItems: ['weatherproofCloak'], bonusProbability: 0.12, successNext: 'ridgeArrival', failureNext: 'ridgePause', successMessage: 'The ridge stays passable and opens a clear view over the valley.', failureMessage: 'Wind and loose stones slow you at the exposed crest.' } },
      { id: 'valleyAfterSignal', label: 'Take the sheltered creek valley', timeCost: 95, next: 'valleyArrival' },
    ] },
    ridgeArrival: ending('ridgeArrival', 'A View from the Ridge', 'The direct route brings you to the next valley with time to spare. The exposed ridge was a fair choice under the conditions you met.'),
    valleyArrival: ending('valleyArrival', 'Sheltered Miles', 'The creek-side trail takes longer but keeps you below the wind. You arrive later, with no need to fight the weather on the ridge.'),
  },
};

export const MARKS_ON_THE_TRAIL: Scenario = {
  id: 'marks-on-the-trail', title: 'Marks on the Trail', subtitle: 'Old signs, new signs, and no need to guess.', startScene: 'markedJunction',
  runRandomSelections: [{ id: 'markerKind', values: [{ value: 'crew' }, { value: 'hunter' }, { value: 'oldRoute' }] }],
  scenes: {
    markedJunction: { id: 'markedJunction', title: 'Two Marks on One Tree', tone: 'safe', text: 'At a junction, a faded cut mark and a newer strip of cloth point in different directions. The established footpath continues straight. Neither marker blocks the path, and nothing nearby suggests an emergency. You can inspect, follow a marked line, or keep to the old trail.', choices: [
      { id: 'inspectMarks', label: 'Look closely at the cut and cloth', timeCost: 4, next: 'marksInspected', effects: { knowledge: ['A cut mark and a newer cloth strip point in different directions at a trail junction.'] } },
      { id: 'followCloth', label: 'Follow the newer cloth marker', hint: 'It may mark a crew’s route, but its destination is not certain.', timeCost: 12, chance: { probability: 0.66, successNext: 'workRoute', failureNext: 'oldRouteFound', successMessage: 'The cloth markers lead to a recently cleared stretch of footpath.', failureMessage: 'The cloth ends at a small clearing; it marks a work site, not a through-route.' } },
      { id: 'stayOldPath', label: 'Keep to the established footpath', timeCost: 8, next: 'oldRouteFound' },
      { id: 'hangOwnMarker', label: 'Add your Folding Trail Marker for return', requirements: { items: ['foldingTrailMarker'] }, timeCost: 3, next: 'ownMarkPlaced', effects: { historyFlags: ['left_trail_marker_at_junction'] } },
    ] },
    marksInspected: { id: 'marksInspected', title: 'Different Hands', tone: 'safe', text: 'The cut is weathered and shallow; the cloth is newer, but has no name or writing. They may point to different routes for ordinary reasons.', textVariants: [
      { requirements: { selections: { markerKind: 'crew' } }, text: 'The cloth is tied with a neat working knot and points toward a cleared line. It may belong to a work crew, though no names are written on it.' },
      { requirements: { selections: { markerKind: 'hunter' } }, text: 'The cloth is tied high above the brush. It may mark a hunting party’s path, but there is no sign of trouble.' },
      { requirements: { selections: { markerKind: 'oldRoute' } }, text: 'The cut mark is part of an older route; the cloth may simply mark a recent detour. Neither says anything about danger.' },
    ], choices: [
      { id: 'takeClothAfterLook', label: 'Follow the cloth marker a short way', timeCost: 10, next: 'workRoute' },
      { id: 'continueOldAfterLook', label: 'Continue along the established path', timeCost: 8, next: 'oldRouteFound' },
      { id: 'markJunctionAfterLook', label: 'Mark the junction for your return', requirements: { items: ['foldingTrailMarker'] }, timeCost: 3, next: 'ownMarkPlaced' },
    ] },
    ownMarkPlaced: { id: 'ownMarkPlaced', title: 'A Mark for Your Return', tone: 'safe', text: 'Your Folding Trail Marker hangs beside, not over, the older signs. It records your own stopping point without claiming who made the other marks.', choices: [
      { id: 'followClothMarked', label: 'Follow the cloth a short distance', timeCost: 10, next: 'workRoute' },
      { id: 'keepPathMarked', label: 'Stay with the established trail', timeCost: 8, next: 'oldRouteFound' },
    ] },
    workRoute: ending('workRoute', 'A Crew at Work', 'The markers lead to a small crew clearing a fallen branch. They are glad to know the cloth was visible from the junction; you continue after a brief greeting.'),
    oldRouteFound: ending('oldRouteFound', 'The Familiar Trail', 'The established path leads toward a stream crossing you recognize. The other signs remain unexplained, but they need not be mysterious to be useful.'),
  },
};

export const A_NIGHT_OF_WIND: Scenario = {
  id: 'a-night-of-wind', title: 'A Night of Wind', subtitle: 'A camp can be made safer before the gusts arrive.', startScene: 'windyCamp',
  timePhases: [{ id: 'evening', label: 'Evening wind', atMinutes: 0 }, { id: 'night', label: 'Night gusts', atMinutes: 25 }, { id: 'morning', label: 'Morning', atMinutes: 70 }],
  scenes: {
    windyCamp: { id: 'windyCamp', title: 'Gusts over the Camp', tone: 'warning', text: 'You have made camp on a low, open shelf. Strong wind rattles the branches and begins to tug at your loose blanket and bedroll. The trees shelter one side of camp, but the fire is small and the ground is dry. Nothing has been lost yet.', choices: [
      { id: 'tieShelterRope', label: 'Use your Travel Rope to secure the shelter', requirements: { items: ['travelRope'] }, hint: 'Tie to the stout tree on the sheltered side, not a loose branch.', timeCost: 10, chance: { probability: 0.74, successNext: 'shelterSecured', failureNext: 'shelterShifted', successMessage: 'The line holds against the gusts and the shelter stays low.', failureMessage: 'A gust shifts the shelter before the knot can be tightened.' } },
      { id: 'protectBedding', label: 'Wrap your bedding in a weatherproof blanket', requirements: { anyItems: ['weatherproofBlanket', 'woolTravelBlanket'] }, timeCost: 5, next: 'beddingProtected', effects: { historyFlags: ['protected_bedding_from_wind'] } },
      { id: 'shieldCloak', label: 'Use your Weatherproof Cloak as a windbreak', requirements: { items: ['weatherproofCloak'] }, hint: 'It blocks some wind, but should not hang over the flame.', timeCost: 5, next: 'cloakWindbreak' },
      { id: 'bankFire', label: 'Bank the fire and move loose gear behind the trees', timeCost: 8, next: 'fireBanked', effects: { historyFlags: ['banked_campfire_before_wind'] } },
    ] },
    shelterShifted: { id: 'shelterShifted', title: 'The Line Slips', tone: 'warning', text: 'The wind lifts one side of the shelter, but your bedroll remains dry. The tree roots are firm if you retie carefully; you can also abandon the open shelf and move behind the trees.', choices: [
      { id: 'retieShelter', label: 'Retie the line at the tree roots', requirements: { items: ['travelRope'] }, timeCost: 8, chance: { probability: 0.7, successNext: 'shelterSecured', failureNext: 'beddingProtected', successMessage: 'The second knot holds through the next gust.', failureMessage: 'The line slips again, so you move your bedding behind the trees.' } },
      { id: 'moveBehindTrees', label: 'Move bedding and gear behind the trees', timeCost: 8, next: 'beddingProtected' },
      { id: 'relightFire', label: 'Use your Windproof Match Case to relight the fire', requirements: { items: ['windproofMatchCase'] }, hint: 'A small sheltered flame will help, but does not secure the shelter.', timeCost: 5, next: 'fireBanked' },
    ] },
    cloakWindbreak: { id: 'cloakWindbreak', title: 'A Small Windbreak', tone: 'safe', text: 'You tie the cloak low between two stout trunks, well clear of the fire. It reduces the gusts over your bedding but will need taking down before you travel.', choices: [
      { id: 'settleBehindCloak', label: 'Tuck loose gear behind the windbreak', timeCost: 5, next: 'beddingProtected' },
      { id: 'bankAfterCloak', label: 'Bank the fire and settle in', timeCost: 5, next: 'fireBanked' },
    ] },
    shelterSecured: ending('shelterSecured', 'A Shelter That Holds', 'The rope stays tight against the gusts. You lower the fire before sleeping and keep the bedroll clear of falling branches.'),
    beddingProtected: ending('beddingProtected', 'Dry Bedding, Sheltered Fire', 'Your bedroll and loose gear are behind the trees, out of the worst gusts. The fire burns low and safely through the night.'),
    fireBanked: ending('fireBanked', 'A Low, Safe Fire', 'You cover the coals and move the loose gear behind the trees. The gusts continue, but there is no flame to scatter into the dry brush.'),
  },
};

export const THE_SECOND_SUNSET: Scenario = {
  id: 'the-second-sunset', title: 'The Second Sunset', subtitle: 'The destination is farther than the day allows.', startScene: 'longRoadEvening',
  timePhases: [{ id: 'lateAfternoon', label: 'Late afternoon', atMinutes: 0 }, { id: 'sunset', label: 'Sunset', atMinutes: 25 }, { id: 'dark', label: 'Darkness', atMinutes: 60 }],
  scenes: {
    longRoadEvening: { id: 'longRoadEvening', title: 'Not There by Nightfall', tone: 'warning', text: 'The next settlement is still beyond the far ridge. You had hoped to reach it before dark, but the road’s last miles are longer than they looked. Two travelers walk ahead, also looking for a place to stop. A dry knoll is close by, and a farmhouse lantern glimmers on a side lane; you can stop or continue with care.', choices: [
      { id: 'campOnKnoll', label: 'Make camp on the dry knoll', timeCost: 8, next: 'campedKnoll', effects: { historyFlags: ['camped_when_destination_was_too_far'] } },
      { id: 'seekFarmhouse', label: 'Walk the marked side lane to the farmhouse', hint: 'The lantern is visible, but the lane may take time.', timeCost: 20, chance: { probability: 0.72, bonusItems: ['roadmansLantern', 'minerHeadlamp'], bonusProbability: 0.12, successNext: 'farmhouseReached', failureNext: 'campedKnoll', successMessage: 'The lane reaches the farmhouse while its light is still visible.', failureMessage: 'The lane bends out of sight; you return to the dry knoll rather than continue blind.' } },
      { id: 'continueWithLantern', label: 'Continue toward town with a lantern', requirements: { items: ['roadmansLantern'] }, hint: 'The road is firm, but you will travel after dark.', timeCost: 35, chance: { probability: 0.64, successNext: 'lateArrival', failureNext: 'campedKnoll', successMessage: 'You follow the road markers and reach the outskirts after dark.', failureMessage: 'The markers become hard to see; you stop at the dry knoll.' } },
      { id: 'followTravelers', label: 'Join the travelers ahead at their camp', timeCost: 12, next: 'sharedCamp' },
    ] },
    campedKnoll: { id: 'campedKnoll', title: 'A Safe Place to Stop', tone: 'safe', text: 'The knoll is dry and above the ditch. You have enough light to arrange camp; the destination will still be there in the morning.', choices: [
      { id: 'useBlanket', label: 'Wrap up in your weatherproof travel blanket', requirements: { anyItems: ['weatherproofBlanket', 'woolTravelBlanket'] }, next: 'warmCamp', effects: { historyFlags: ['used_travel_blanket_on_long_road'] } },
      { id: 'lightFire', label: 'Use your Windproof Match Case for a small fire', requirements: { items: ['windproofMatchCase'] }, hint: 'Gather only dry sticks well clear of the grass.', next: 'warmCamp' },
      { id: 'sleepEarly', label: 'Settle in early and start at first light', next: 'warmCamp' },
    ] },
    sharedCamp: { id: 'sharedCamp', title: 'Other Travelers on the Road', tone: 'safe', text: 'The travelers ahead have made camp on firm ground and leave room for you to settle nearby. They are heading toward the same settlement, but will leave after breakfast, not guide you through the night.', choices: [
      { id: 'joinSharedCamp', label: 'Make camp nearby and follow the road at dawn', timeCost: 8, next: 'warmCamp', effects: { historyFlags: ['shared_camp_with_other_travelers'] } },
      { id: 'askAboutLane', label: 'Ask where the farmhouse lane meets the road', next: 'laneDirections', effects: { knowledge: ['Other travelers say the marked farmhouse lane joins the main road beyond the next rise.'] } },
    ] },
    warmCamp: ending('warmCamp', 'A Night’s Rest', 'You settle on firm ground and leave the rest of the journey for daylight. The destination was not lost; you simply needed another morning to reach it.'),
    laneDirections: ending('laneDirections', 'A Clearer Route in the Morning', 'The travelers show you where the marked farmhouse lane rejoins the main road. You stay at the knoll tonight and have a better route to follow tomorrow.'),
    farmhouseReached: ending('farmhouseReached', 'A Light on the Lane', 'The farmhouse keeper offers a dry place beside the shed. You are not at the settlement, but you are sheltered for the night and can resume the road after breakfast.'),
    lateArrival: ending('lateArrival', 'Town After Dark', 'You reach the settlement after dark, tired but safe. The lantern made the road possible, though the walk took more care than arriving before sunset.'),
  },
};

export const WILDERNESS_ADVENTURES: Scenario[] = [THE_FAINT_TRAIL, CAMP_BEFORE_DARK, THE_SHORTCUT, CREEK_ON_THE_RETURN, THE_FOG_COMES_DOWN, DRY_CAMP, THE_RIDGE_OR_THE_VALLEY, MARKS_ON_THE_TRAIL, A_NIGHT_OF_WIND, THE_SECOND_SUNSET];
