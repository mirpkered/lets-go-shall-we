import type { Choice, Scenario, Scene } from '../types';
import { largeAdventure, largeEnd, largeScene, largeTags } from './largeContentTools';

const tags = (hook: string, setting: string, risk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW', rewards = ['Gear prize', 'coins', 'reusable Knowledge']) => largeTags({
  hook, activity: 'competition/game', role: 'competitor', tone: risk === 'LOW' ? 'warm/hopeful' : 'adventurous', risk, setting,
  structures: ['multi-stage performance', 'contest with consequence', 'fair result or disputed result'],
  entry: ['invited/known contact', 'accidental encounter'], rewards, outcomes: ['success/partial success', 'walk-away/refusal', 'negotiated compromise'],
});
type ContestChoice = Omit<Choice, 'chance'> & { chance?: Omit<NonNullable<Choice['chance']>, 'successMessage' | 'failureMessage'> & Partial<Pick<NonNullable<Choice['chance']>, 'successMessage' | 'failureMessage'>> };
const s = (id: string, title: string, text: string, choices: ContestChoice[], tone: Scene['tone'] = 'safe') => largeScene(id, title, text, choices.map((choice): Choice => choice.chance ? { ...choice, chance: { ...choice.chance, successMessage: choice.chance.successMessage ?? `${title}: the attempt succeeds, though the result still needs to be judged.`, failureMessage: choice.chance.failureMessage ?? `${title}: the attempt falls short, and the contest continues with that result recorded.` } } : { ...choice, chance: undefined }), tone);
const e = (id: string, title: string, text: string) => largeEnd(id, title, text);
const a = (id: string, title: string, subtitle: string, hook: string, setting: string, risk: 'LOW' | 'MODERATE' | 'HIGH', start: string, scenes: Record<string, Scene>, rewards?: string[]): Scenario => largeAdventure(id, title, subtitle, tags(hook, setting, risk, rewards), start, scenes);
const item = (id: string, source: string, flag: string) => ({ gainItems: [id], gainItemProvenance: { [id]: source }, historyFlags: [flag] });

// Each entry below owns its contest, consequence and result graph. Shared scene constructors only keep the data shape consistent.
export const COMPETITION_GEAR_GENRE_BATCH: Scenario[] = [
  a('the-match-at-the-brace', 'The Match at the Brace', 'Two carpenters disagree about what makes a repair strong.', 'A public repair trial tests judgment under a load, not speed alone.', 'county fair work yard', 'MODERATE', 'trial', {
    trial: s('trial','A Brace under Load','Nell Ward and Hiram Cole each build a brace for the same split cart rail. You may test their work, but the prize—a Bridgewright’s Hammer—is announced before the first load is set.',[
      {id:'testSlow',label:'Load both braces gradually, recording each movement',next:'strain'}, {id:'testFast',label:'Apply the full cart weight at once',next:'strain',effects:{setFlags:['brace_harsh_test']}}, {id:'judgeMethod',label:'Ask each carpenter to explain the grain direction first',next:'grain'},
    ]),
    grain:s('grain','Wood Has a Direction','Nell aligned the brace with the grain; Hiram cut across a knot. The fast test could still split both pieces, so the fair keeper asks you to choose how the load is applied.',[
      {id:'gradual',label:'Use a gradual load and watch the knot',next:'strain'}, {id:'full',label:'Use the full load as the posted trial requires',next:'strain',effects:{setFlags:['brace_harsh_test']}},
    ]),
    strain:s('strain','The Rail Moves','The gradual load holds on Nell’s brace. Hiram’s shifts at the knot; under the sudden load, both braces crack, but the cart rail remains supported by its original blocks.',[
      {id:'awardNell',label:'Award the hammer to the stronger safe brace',next:'winner',effects:{...item('bridgewrightHammer','Awarded by the fair keeper for a tested, safe brace in The Match at the Brace.','won_bridgewright_hammer_brace_trial')}},
      {id:'voidUnsafe',label:'Void the trial and ask both carpenters to rebuild',next:'void',effects:{knowledge:['A brace should be loaded gradually; a sudden test can damage both the repair and the part it supports.']}},
      {id:'takeTwoCoins',label:'Take the posted two-coin judge’s fee and decline the call',next:'fee',effects:{money:2}},
    ]),
    winner:e('winner','A Sound Result','Nell receives the ribbon. The keeper awards you the announced hammer for identifying a safe result rather than the fastest build.'),
    void:e('void','Trial Reset','The keeper stops the contest and gives the builders time to replace the split braces. The result is not called a win; you leave with the lesson, not the hammer.'),
    fee:e('fee','A Judge’s Fee','You take the two coins. The builders redo the test with a gradual load, and the announced hammer goes to the keeper’s next volunteer judge.'),
  }),
  a('the-knot-before-the-bell', 'The Knot before the Bell', 'A ferry crew races the tide to secure a practice load.', 'A timed rigging challenge makes speed compete with a knot that can be trusted.', 'river landing', 'MODERATE', 'briefing', {
    briefing:s('briefing','Two Knots, One Load','Ferryman Ivo offers a Rope Clamp as the prize. Teams must secure a weighted practice barrel before the landing bell; a loose line could swing the barrel into the dock.',[
      {id:'learnKnot',label:'Tie the familiar bowline, then inspect the standing line',next:'load'}, {id:'useClamp',label:'Use the shared clamp to hold the line while tying',next:'load',effects:{setFlags:['contest_used_clamp']}}, {id:'withdraw',label:'Withdraw before the timed lift',next:'withdrawn'},
    ]),
    load:s('load','The Barrel Takes Weight','The first pull shifts the barrel. The knot stays firm, but the other team’s line slips toward a piling. You have time to finish your own lift or help keep their barrel off the ferry rail.',[
      {id:'finishLift',label:'Finish the safe lift and claim your time',chance:{probability:0.62,successNext:'result',failureNext:'loss',successMessage:'Your team seats the barrel before the bell without letting it swing.',successEffects:{setFlags:['knot_bell_trial_winner']},failureEffects:{setFlags:['knot_bell_trial_runner_up']}}},
      {id:'steadyOther',label:'Catch the neighboring line before its barrel hits the rail',next:'helped'},
      {id:'callStop',label:'Call a stop until both lines are checked',next:'safeStop',effects:{knowledge:['A line under load should be tested before the lift continues; a sound knot cannot correct a bad lead around a piling.']}},
    ],'warning'),
    result:s('result','The Time Is Read','Your team seats the barrel safely before the bell. The keeper confirms the clean first-place finish and offers the posted winner’s prize.',[
      {id:'claimClamp',label:'Accept the Iron Rope Clamp prize',next:'prize',requirements:{notFlags:['knot_bell_trial_runner_up'],notOwnedItems:['ironRopeClamp']},effects:item('ironRopeClamp','Won from Ferryman Ivo in the posted safe-rigging contest at the river landing.','won_iron_rope_clamp_knot_contest')},
      {id:'decline',label:'Decline the prize and share the rigging method',next:'lesson',requirements:{notFlags:['knot_bell_trial_runner_up']},effects:{knowledge:['A bowline held the contest barrel securely when the standing line was inspected before loading.']}},
    ]),
    loss:s('loss','A Safe but Late Lift','Your lift is secure but late. The clamp goes to the winner; the keeper offers the posted second-place coin or lets you leave with the rigging lesson.',[
      {id:'claimLateCoin',label:'Take the one-coin second-place purse',next:'coins',requirements:{notFlags:['knot_bell_trial_winner']},effects:{money:1}}, {id:'learnInstead',label:'Decline the purse and keep the rigging lesson',next:'lesson',requirements:{notFlags:['knot_bell_trial_winner']},effects:{knowledge:['A knot can hold while a poor lead still swings a load toward a piling; inspect the whole line path.']}},
    ]),
    helped:e('helped','The Bell Is Held','You stop the neighboring barrel from striking the rail. The keeper voids the round and returns everyone’s entry token; nobody is charged for the delay.'),
    safeStop:e('safeStop','A Better Line','The crews reset both lines before loading again. No prize is awarded this round, but the keeper credits you with preventing a damaged ferry rail.'),
    prize:e('prize','The Clamp Is Yours','Ivo awards the Rope Clamp as promised; your team’s time stands because the lift was both quick and safe.'), coins:e('coins','A Smaller Purse','You take one coin instead of the clamp. The winning team keeps the announced prize.'), lesson:e('lesson','The Method Travels','You leave without the material prize and remember the rigging lesson for another crossing.'), withdrawn:e('withdrawn','No Start, No Stake','You withdraw before the bell. Your entry token is returned and no prize is due.'),
  }),
  a('the-chain-at-twenty-paces', 'The Chain at Twenty Paces', 'A survey assistant’s measuring contest becomes a question of honest marks.', 'A measurement trial tests whether the Traveler trusts a tool or checks its condition.', 'county survey camp', 'LOW', 'start', {
    start:s('start','The Bent Link','Surveyor Ada Senn stakes a two-coin prize and a Survey Chain for a correct line between two old stones. The chain has a link flattened near the handle.',[
      {id:'inspectChain',label:'Inspect the link and repeat the span in sections',next:'repeat'}, {id:'trustChain',label:'Stretch the chain once and call the mark',next:'call'}, {id:'borrowRule',label:'Ask to compare against the folding rule',next:'comparison'},
    ]),
    repeat:s('repeat','Three Short Measures','The short measures agree with the stone spacing but not the stretched-chain total. The damaged link explains the difference.',[
      {id:'reportFault',label:'Report the bent link and void the measured result',next:'honest',effects:{knowledge:['A measuring chain can stretch or kink at a joint; repeat a long span in shorter sections when its calibration is uncertain.']}},
      {id:'submitMeasure',label:'Submit the repeated measurement with the fault noted',next:'award'},
    ]),
    call:s('call','A Neat but Wrong Line','The single stretch lands exactly at the chalk mark, but the bent link has shortened the measure. The other assistant asks for a repeat before the judge records it.',[
      {id:'repeatNow',label:'Repeat it in shorter sections',next:'repeat'}, {id:'standByCall',label:'Stand by the first mark',next:'dispute'},
    ]),
    comparison:s('comparison','The Rule Agrees with the Stones','The rule supports the shorter measured span. Senn admits the chain is due for repair and asks whether you will submit a corrected result or leave the contest.',[
      {id:'submitCorrected',label:'Submit the corrected span',next:'award'}, {id:'leaveTrial',label:'Withdraw and let the assistants repair the chain',next:'honest'},
    ]),
    award:s('award','The Mark Moves','The judge shifts the stake to the corrected mark. Senn awards the Survey Chain as the announced prize because you found the faulty link before the map was changed.',[
      {id:'acceptChain',label:'Accept the Survey Chain',next:'chainPrize',effects:item('surveyChain','Awarded by Surveyor Ada Senn after the Traveler identified and corrected a bent link in the public measuring trial.','won_survey_chain_measure_trial')},
      {id:'takeCoins',label:'Take the two-coin prize instead',next:'chainCoins',effects:{money:2}},
    ]),
    honest:e('honest','No False Measurement','Senn thanks you for refusing to certify a bad line. The stake is returned; the measurement is corrected before the survey continues.'), dispute:e('dispute','A Mark Not Entered','The judge refuses to record an unrepeated measure. You lose the chance at the prize, but the damaged chain is taken out of service.'),
    chainPrize:e('chainPrize','A Chain for Your Kit','You accept the Survey Chain. The corrected boundary mark—not the first clean-looking number—becomes the contest result.'), chainCoins:e('chainCoins','Coin over Chain','You take the two coins. Senn retains the chain for repair and the corrected span is entered in the survey book.'),
  }),
  a('the-dry-crossing-race', 'The Dry Crossing Race', 'Two teams carry flour across a creek without soaking the sacks.', 'A village trial rewards balance and planning, not merely speed.', 'farm creek', 'MODERATE', 'start', {
    start:s('start','A Sack on Each Shoulder','The winning team receives a Weatherproof Blanket from the miller’s announced prize stock. Each team must move two flour sacks across stepping stones; one sack can be secured with a shared Freightman’s Strap.',[
      {id:'strapSacks',label:'Bind the sacks together low with the shared strap',next:'stones'}, {id:'splitLoads',label:'Carry one sack at a time and take the longer stones',next:'stones'}, {id:'studyCurrent',label:'Watch a loose branch cross before choosing a line',next:'current'},
    ]),
    current:s('current','The Current Turns','The branch swings toward the downstream stones. A fast crossing may be shorter, but the midstream footing is slick.',[
      {id:'safeLine',label:'Use the upstream stones and keep the sacks apart',next:'safeFinish'}, {id:'quickLine',label:'Take the short midstream line together',chance:{probability:0.55,successNext:'safeFinish',failureNext:'wetFinish',successMessage:'Your team keeps the sacks balanced through the narrow crossing.'}},
    ],'warning'),
    stones:s('stones','The Middle Stone Rocks','The center stone shifts under the first load. The flour is still dry; the second team is waiting behind you.',[
      {id:'resetLoad',label:'Set the sacks down and move the line upstream',next:'safeFinish'}, {id:'rushLoad',label:'Keep moving before the stone turns again',chance:{probability:0.6,successNext:'safeFinish',failureNext:'finish',successMessage:'The load stays level and the flour crosses dry.'}},
    ],'warning'),
    finish:s('finish','The Judge Checks the Flour','One sack brushes the current at the midstream stones. The flour remains usable, but the damp corner costs your team the blanket; the miller offers a small partial purse or no payment.',[
      {id:'takePartial',label:'Take the one-coin partial prize',next:'coin',effects:{money:1}}, {id:'givePrizeAway',label:'Decline the partial purse and help reset the stones',next:'reset',effects:{knowledge:['Moving a load low and separately gives better balance on shifting stepping stones.']}},
    ]),
    safeFinish:s('safeFinish','Dry at the Far Bank','The sacks arrive dry and the judge records a clean finish. The announced winner’s prize choice is yours.',[{id:'takeDryBlanket',label:'Accept the Weatherproof Blanket prize',next:'blanket',requirements:{notOwnedItems:['weatherproofBlanket']},effects:item('weatherproofBlanket','Awarded from the miller’s announced prize stock for delivering both sacks dry in The Dry Crossing Race.','won_blanket_dry_crossing')},{id:'takeDryCoin',label:'Take the one-coin winner’s purse instead',next:'coin',effects:{money:1}}]), wetFinish:s('wetFinish','A Damp Corner','One sack brushes the current. The flour remains usable but the team does not win the blanket; the miller offers a small partial purse or no payment.',[{id:'takeWetCoin',label:'Take the one-coin partial prize',next:'coin',effects:{money:1}},{id:'declineWetCoin',label:'Decline payment and help dry the sacks',next:'reset',effects:{knowledge:['Keep a carried load low and separated when stepping stones shift underfoot.']}}]),
    blanket:e('blanket','A Useful Prize','The miller transfers the Weatherproof Blanket from the prize stock after the dry finish.'), coin:e('coin','Partial Purse','You accept one coin for saving most of the flour. The blanket remains the winner’s prize.'), reset:e('reset','The Course Is Safer','You leave the contest without a prize and help place the stones more securely for the next teams.'),
  }),
  a('the-quarry-step', 'The Quarry Step', 'A climbing trial is interrupted by a loose hold above the practice ledge.', 'A marked climbing test asks when to stop as much as how to climb.', 'quarry face', 'HIGH', 'climb', {
    climb:s('climb','Three Marked Holds','Retired guide Tomas Vale posts a Folding Trail Marker as prize. The route is a low quarry face with three marked holds; the upper shelf is excluded because its stone is cracked.',[
      {id:'testLowerHolds',label:'Test each marked hold before shifting weight',next:'hold'}, {id:'climbQuick',label:'Climb directly to the bell at the top',chance:{probability:0.5,successNext:'bell',failureNext:'slip'}}, {id:'declineUpper',label:'Ask Vale to inspect the cracked shelf first',next:'inspection'},
    ],'warning'),
    inspection:s('inspection','A Crack under the Shelf','Vale confirms the top shelf is outside the contest route. The bell can be rung from a lower, sound ledge if the judge agrees to a safe finish.',[
      {id:'askSafeRule',label:'Ask the judge to count the sound ledge as the finish',next:'bell'}, {id:'withdrawClimb',label:'Withdraw until the route is repaired',next:'withdrawn'},
    ]),
    hold:s('hold','A Hold Turns in Your Hand','One marked hold shifts. You are still on the lower face; Vale is below with a safety line and the retreat route is open.',[
      {id:'retreatHold',label:'Climb down using the tested holds',next:'partial'}, {id:'moveToLedge',label:'Traverse to the sound lower ledge',chance:{probability:0.7,successNext:'bell',failureNext:'partial'}},
    ],'warning'),
    bell:s('bell','The Lower Bell Rings','You ring the bell from the sound ledge without touching the cracked shelf. The judge accepts the safer route as a completed trial.',[
      {id:'acceptMarker',label:'Take the Folding Trail Marker prize',next:'markerPrize',effects:item('foldingTrailMarker','Awarded by guide Tomas Vale for completing the marked climbing trial without using the cracked shelf.','won_trail_marker_quarry_trial')},
      {id:'takeWage',label:'Take the two-coin participation purse',next:'purse',effects:{money:2}},
    ]),
    slip:e('slip','A Short Fall to the Bench','The loose hold gives way. The safety line catches you against the lower face; the judge stops your attempt and sends you down for a check. No one is seriously hurt, but the prize is not awarded.'),
    partial:e('partial','A Sensible Descent','You return to the quarry floor under your own control. Vale says turning back at a bad hold is sound judgment, though it is not a winning climb.'),
    withdrawn:e('withdrawn','No Climb Attempted','You withdraw before the start. The judge keeps the route closed until the cracked shelf is repaired; no stake or prize changes hands.'),
    markerPrize:e('markerPrize','A Marker for the Road','Vale awards the Folding Trail Marker and records that the cracked shelf was not part of the route.'), purse:e('purse','A Small Purse','You take the two-coin participation purse; the marker goes to the fastest safe climber.'),
  }),
  a('the-lookout-at-dusk', 'The Lookout at Dusk', 'A field-glass trial finds a real problem outside the contest ground.', 'A spotting challenge becomes a decision about whether to interrupt a public event.', 'rail camp', 'MODERATE', 'watch', {
    watch:s('watch','Three Signals on the Ridge','A rail survey camp tests lookout skill. The announced prize is a pair of Field Glasses. From the platform, competitors must identify which of three cloth signals is newly changed.',[
      {id:'useOwnGlass',label:'Use your Field Glasses, if you carry them',requirements:{items:['fieldGlasses'], usableItems: ['fieldGlasses']},next:'seen'}, {id:'nakedEye',label:'Compare the signal colors with the posted chart',next:'chart'}, {id:'askSpotter',label:'Ask the lookout to describe the wind before calling',next:'wind'},
    ]),
    chart:s('chart','A Fourth Movement','The signal chart shows three known positions. A fourth cloth moves below the ridge, beyond the contest marks; it may be a worker’s coat caught on brush.',[
      {id:'checkRidge',label:'Pause scoring and ask the foreman to check the ridge',next:'worker'}, {id:'stayContest',label:'Finish the marked signal round first',next:'scoring'},
    ]),
    wind:s('wind','A Crosswind','The lookout says the wind is pushing all three flags east. The changed signal’s shadow does not move with it.',[
      {id:'callChanged',label:'Call the signal whose shadow stays still',next:'scoring',effects:{knowledge:['At a windy lookout, compare a signal’s shadow or fixed edge before treating every movement as a deliberate sign.']}}, {id:'checkRidgeFirst',label:'Ask the foreman to inspect the extra movement',next:'worker'},
    ]),
    seen:s('seen','The Cloth Is Not a Signal','The glasses show a coat snagged below the ridge and a person waving from behind it. The judge pauses the contest and sends the foreman to check.',[
      {id:'goWithForeman',label:'Go with the foreman along the marked path',next:'worker'}, {id:'completeCall',label:'Record the signal result while help goes out',next:'scoring'},
    ]),
    worker:s('worker','A Survey Hand Needs Help','The coat belongs to a survey hand who twisted an ankle while retrieving a dropped stake. The foreman brings them back by the lower path; the contest has been paused, not abandoned.',[
      {id:'takeGlasses',label:'Accept the Field Glasses prize for the correct call',next:'prize',effects:item('fieldGlasses','Awarded by the rail-camp foreman after the Traveler noticed a person outside the marked contest field.','won_field_glasses_lookout_trial')}, {id:'takeCoin',label:'Take the one-coin helper’s fee instead',next:'coin',effects:{money:1}}, {id:'rememberSignal',label:'Decline the prize and keep the lookout lesson',next:'lesson',effects:{knowledge:['A moving cloth outside a signal course may be a person in trouble, not part of the contest.']}},
    ]),
    scoring:s('scoring','A Call Is Checked','The judge checks the signal chart. A correct call earns the posted glasses; a close miss earns a coin, and no one is blamed for pausing when a person may need help.',[
      {id:'claimGlass',label:'Take the Field Glasses if your call was correct',next:'prize',requirements:{notOwnedItems:['fieldGlasses']},effects:item('fieldGlasses','Awarded by the rail-camp foreman for a correct signal reading in The Lookout at Dusk.','won_field_glasses_signal_trial')}, {id:'claimCoin',label:'Take the one-coin consolation purse',next:'coin',effects:{money:1}},
    ]),
    prize:e('prize','A Clearer View','The foreman awards the Field Glasses as announced. The contest result records both the accurate observation and the pause for the survey hand.'), coin:e('coin','A Coin for the Call','You take one coin. The glasses go to the contest winner, and the survey hand reaches camp safely.'), lesson:e('lesson','The Wider Field','You leave without a material prize, remembering to look beyond the boundary of a task when something does not fit.'),
  }),
  a('the-long-carry', 'The Long Carry', 'A lumber camp tests how teams move a beam without wrecking the road.', 'A strength contest rewards load planning over a single burst of effort.', 'lumber camp road', 'MODERATE', 'load', {
    load:s('load','A Beam and Two Ruts','Teams must move a squared beam between two stakes. The camp’s Pack Frame is the prize, announced before the start. One rut is firm and narrow; the other is broad but soft.',[
      {id:'balanceBeam',label:'Balance the beam across two shoulders and change carriers at the stakes',next:'rut'}, {id:'dragBeam',label:'Use the camp’s rope to drag it along the broad rut',next:'rut'}, {id:'shortenCourse',label:'Ask the foreman to shorten the course rather than risk the rut',next:'rule'},
    ]),
    rut:s('rut','The Ground Gives','The beam sinks at the soft rut. The rival team is ahead but has begun to twist the load; the finish stake is still visible.',[
      {id:'keepEven',label:'Stop and rebalance before moving again',next:'finish'}, {id:'pushHard',label:'Push through before the rival reaches the stake',chance:{probability:0.55,successNext:'won',failureNext:'late'}}, {id:'helpRival',label:'Warn the other team about the twisting beam',next:'helped'},
    ],'warning'),
    rule:s('rule','A Fairer Course','The foreman agrees the soft rut was not marked as unstable. Teams can continue on the narrow firm route or end the trial without a winner.',[
      {id:'continueFirm',label:'Continue on the firm route',next:'finish'}, {id:'closeTrial',label:'Close the trial and return everyone’s entry fee',next:'noWinner'},
    ]),
    finish:s('finish','The Beam Reaches the Stake','Your team brings the beam to the stake intact and keeps the lane usable. The foreman records a safe finish; the Pack Frame remains for the top-placed balanced team after times are compared.',[
      {id:'takeThreeCoins',label:'Take the posted three-coin safe-finish purse',next:'coins',effects:{money:3}}, {id:'declinePurse',label:'Decline payment and remember the load-changing method',next:'lesson',effects:{knowledge:['A long beam travels more safely when carriers change at marked rests before the load begins twisting.']}},
    ]),
    won:s('won','First to the Stake','Your team reaches the stake first without twisting the beam. The judge confirms the win and presents the announced prize.',[{id:'takeWonFrame',label:'Accept the Pack Frame prize',next:'prize',requirements:{notOwnedItems:['packFrame']},effects:item('packFrame','Awarded by the lumber foreman for a balanced, intact beam carry in The Long Carry.','won_pack_frame_long_carry')},{id:'takeWonCoins',label:'Take the posted three-coin team purse',next:'coins',effects:{money:3}}]), late:s('late','A Safe but Late Finish','The load slows your team; the rival reaches the stake first. The beam stays sound, and the smaller posted purse remains available.',[{id:'takeLateCoins',label:'Take one coin for the safe finish',next:'coins',effects:{money:1}},{id:'declineLate',label:'Decline the purse and remember the load-changing method',next:'lesson',effects:{knowledge:['A long beam travels more safely when carriers change at marked rests before the load begins twisting.']}}]), helped:e('helped','A Shared Reset','The other team catches the twisting beam before it rolls. The foreman stops the clock, thanks you for the warning, and restarts both teams from the firm route.'), noWinner:e('noWinner','No Unsafe Winner','The entry fees are returned and the camp marks the soft rut closed. No prize is awarded for a course the foreman failed to mark.'),
    prize:e('prize','A Frame Earned Together','The foreman transfers the Pack Frame from camp’s prize stock. The team’s measured carry—not raw strength—decided the result.'), coins:e('coins','A Team Purse','You take three coins for your team’s careful work; the Pack Frame goes to the top-placed team.'), lesson:e('lesson','The Load’s Rhythm','You leave the purse and carry the useful method of changing shoulders before a beam begins to twist.'),
  }),
  a('five-marks-on-the-board', 'Five Marks on the Board', 'A traveling fair tests whether a thrower can adjust to changing wind.', 'A skill trial rewards adaptation across several throws rather than one lucky hit.', 'market green', 'LOW', 'roundOne', {
    roundOne:s('roundOne','The First Three Throws','The target board has five chalk rings. Organizer Bess Vale announces a Folding Trail Marker set as the prize. The wind is crosswise and each throw uses the same blunt wooden peg.',[
      {id:'aimCenter',label:'Aim for the center ring and learn the wind',next:'roundTwo'}, {id:'aimNear',label:'Take the nearest ring for a reliable score',next:'roundTwo'}, {id:'studyThrower',label:'Watch how the previous thrower compensates',next:'adjust'},
    ]),
    adjust:s('adjust','The Peg Turns Late','The peg catches a crosswind near the board. One thrower changes stance; another changes the release point.',[
      {id:'copyStance',label:'Copy the steadier stance',next:'roundTwo',effects:{knowledge:['A crosswind can catch a light peg late in flight; watch its final drift before adjusting a target throw.']}}, {id:'stayOwnMethod',label:'Keep your stance and shift the aim only',next:'roundTwo'},
    ]),
    roundTwo:s('roundTwo','The Wind Changes','The wind drops for the last two throws. The first-round center aim is now too high; everyone may revise their final throw.',[
      {id:'reviseAim',label:'Lower the aim for the calmer air',chance:{probability:0.65,successNext:'highScore',failureNext:'closeScore',successMessage:'Your lower aim compensates for the calmer air and puts your total at the top.',failureMessage:'The revised aim is still high; the chalk total places you just behind the leader.'}}, {id:'keepAim',label:'Keep the first-round aim for consistency',chance:{probability:0.45,successNext:'highScore',failureNext:'lowScore',successMessage:'The steady aim pays off; your total leads by one mark.',failureMessage:'The steady aim no longer fits the changed wind, and your total falls short.'}}, {id:'withdrawRound',label:'Withdraw and watch the last throw',next:'watched'},
    ]),
    highScore:s('highScore','A Measured Win','The judge counts the chalk marks and confirms your adjusted total is highest. The announced prize stock is yours to choose from.',[
      {id:'claimMarkers',label:'Choose the Folding Trail Marker set',next:'prize'}, {id:'takeTwoCoins',label:'Take the two-coin prize purse instead',next:'coins',effects:{money:2}},
    ]), closeScore:s('closeScore','A Narrow Result','Your score is one mark behind. Vale offers the posted one-coin runner-up purse or a single calm-air tie-break with the rival, who agrees the score was close.',[
      {id:'takeOneCoin',label:'Take the one-coin runner-up purse',next:'coins',effects:{money:1}}, {id:'askTieBreak',label:'Accept the single tie-break throw',next:'tiebreak'},
    ]), lowScore:e('lowScore','A Difficult Board','The wind shift defeats your first-round adjustment. The judge records the result without treating it as a failure of nerve; you leave without a prize.'),
    tiebreak:s('tiebreak','One Calm Throw','The tied players agree to one throw each after the wind settles.',[{id:'takeFinalThrow',label:'Take the tie-break throw',chance:{probability:0.5,successNext:'prize',failureNext:'lowScore',successMessage:'Your peg lands inside the ring, winning the single tie-break.',failureMessage:'The rival’s peg lands closer; the tie-break is settled without another throw.'}}, {id:'sharePrize',label:'Suggest the organizer split the prize',next:'shared'}]),
    shared:s('shared','A Prize Shared','Vale splits the prize value into two fair one-coin awards. You may accept your posted share or leave it for the fair fund.',[{id:'acceptSharedCoin',label:'Accept your one-coin share',next:'sharedEnd',effects:{money:1}},{id:'leaveSharedCoin',label:'Leave your share with the fair fund',next:'sharedDeclined'}]), sharedEnd:e('sharedEnd','A Fair Share','You take one coin from the split prize; the other share stays with the fair fund.'), sharedDeclined:e('sharedDeclined','A Prize Left Behind','Your share remains with the fair fund, and the tied score is recorded.'), watched:e('watched','A Round Observed','You leave without a prize and see the calm-air throw that changes the board’s score.'),
    prize:s('prize','Markers for the Trail','Vale confirms your win and lets you choose the announced Marker set or its two-coin prize value.',[{id:'acceptMarkers',label:'Accept the Folding Trail Marker set',next:'markerEnd',effects:item('foldingTrailMarker','Awarded by organizer Bess Vale for the highest adjusted score in Five Marks on the Board.','won_folding_markers_target_trial')},{id:'takePrizeCoins',label:'Take two coins instead',next:'coins',effects:{money:2}}]), markerEnd:e('markerEnd','The Markers Change Hands','Vale transfers the announced Folding Trail Marker set after confirming the final score.'), coins:e('coins','A Small Return','You take the posted coin purse; the Marker set goes to the winner.'),
  }),
  a('the-millwheel-hand', 'The Millwheel Hand', 'A millwright’s trial asks teams to restart a waterwheel without risking the belt.', 'A practical challenge distinguishes correct observation from force.', 'mill race', 'MODERATE', 'inspect', {
    inspect:s('inspect','The Belt Is Slack','Millwright Pella posts a Pocket Toolkit as the prize for restarting a practice wheel. The wheel is dry-run only; the belt is slack and a peg is missing from the guard.',[
      {id:'inspectPeg',label:'Check the guard and missing peg before touching the belt',next:'fault'}, {id:'tightenBelt',label:'Tighten the belt first and test by hand',next:'test'}, {id:'askPella',label:'Ask Pella what the wheel did before it stopped',next:'history'},
    ]),
    history:s('history','A Sudden Creak','Pella says the wheel slowed after a single loud knock. The missing peg may have worked loose, not fallen out by accident.',[
      {id:'lookForPeg',label:'Look for the peg near the lower guard',next:'fault'}, {id:'turnByHand',label:'Turn the wheel slowly with the belt slack',next:'test'},
    ]),
    fault:s('fault','A Peg in the Drain','The peg is lodged in the drain grate. A polished scrape on the guard shows where it worked loose.',[
      {id:'refitPeg',label:'Refit the peg and test the wheel slowly',next:'result'}, {id:'reportWear',label:'Report the worn hole and stop the trial',next:'stopped',effects:{knowledge:['A loose guard peg can be a symptom of wear; inspect the hole before restarting a belt-driven wheel.']}},
    ]),
    test:s('test','The Belt Pulls Sideways','The belt tracks toward the unpinned guard. Pella calls for an immediate stop.',[
      {id:'stopWheel',label:'Stop and inspect the guard before continuing',next:'fault'}, {id:'forceTurn',label:'Force one more turn to see the fault',chance:{probability:0.25,successNext:'stopped',failureNext:'damaged'}},
    ],'warning'),
    result:s('result','The Wheel Turns Cleanly','The guard stays in place and the wheel turns by hand without rubbing. Pella says the tool prize goes to a safe diagnosis, not to the fastest restart.',[
      {id:'takeToolkit',label:'Accept the Pocket Toolkit prize',next:'prize',requirements:{notOwnedItems:['pocketToolkit']},effects:item('pocketToolkit','Awarded by millwright Pella for locating the loose guard peg and restarting the practice wheel safely.','won_pocket_toolkit_millwheel_trial')}, {id:'takeWage',label:'Take the two-coin trial fee instead',next:'fee',effects:{money:2}},
    ]),
    stopped:e('stopped','A Trial Stopped in Time','Pella closes the trial and repairs the guard hole before using the wheel again. You do not win the toolkit, but your caution prevents a belt from slipping.'), damaged:e('damaged','A Bad Test','The guard shifts against the belt. Pella stops the wheel; nobody is hurt, but the test is void and the belt needs repair.'),
    prize:e('prize','A Tool for Practical Work','Pella gives you the Pocket Toolkit as the posted prize.'), fee:e('fee','A Paid Trial','You take two coins for the time. Pella keeps the toolkit and asks the next competitor to inspect the guard first.'),
  }),
  a('the-blind-trail-marker', 'The Blind Trail Marker', 'Trackers compete to read a trail that was deliberately laid with one false sign.', 'A fieldcraft contest tests uncertainty and comparison, not confidence.', 'wooded ridge', 'MODERATE', 'trail', {
    trail:s('trail','A Track Too Neat','Guide Sen Harlow asks competitors to identify which of three trails is real. The prize is a Travel Rope; one path contains a false heel mark laid by Harlow.',[
      {id:'followDeepPrints',label:'Follow the deepest prints to the ridge',next:'ridge'}, {id:'compareStride',label:'Compare stride, broken stems, and return marks',next:'signs'}, {id:'askForRule',label:'Ask how the false trail was laid before choosing',next:'rule'},
    ]),
    rule:s('rule','A Contest Rule','Harlow says a fair test gives each entrant the same evidence, not the answer. The ridge paths are not dangerous, but one false trail leads to a dead-end thicket.',[
      {id:'takeTime',label:'Walk the trail edges and compare the disturbed ground',next:'signs'}, {id:'chooseNow',label:'Choose the trail that seems most likely',next:'ridge'},
    ]),
    signs:s('signs','The Return Is Missing','Two trails show a return path. The deepest prints belong to the false line; a broken fern points to a narrower track that doubles back once.',[
      {id:'nameNarrowTrail',label:'Name the narrow track and explain the fern',next:'correct'}, {id:'nameDeepTrail',label:'Keep the deepest trail as your answer',next:'wrong'}, {id:'withdrawTrail',label:'Decline to guess from incomplete signs',next:'declined',effects:{knowledge:['A track is stronger evidence when its broken vegetation and return marks agree with the direction of travel.']}},
    ]),
    ridge:s('ridge','A Thicket at the Ridge','The trail reaches a thicket with no continuation. Harlow shows the heel mark was pressed into the ground backward.',[
      {id:'reconsider',label:'Return to the fork and compare the broken fern',next:'signs'}, {id:'acceptMiss',label:'Accept the miss and leave the trial',next:'wrong'}
    ]),
    correct:s('correct','A Track Read Carefully','Harlow confirms the narrow track. The lesson is the linked evidence, not the certainty of one print; because you read the marks carefully, he offers the announced Travel Rope or a coin for your time.',[
      {id:'acceptRope',label:'Accept the Travel Rope prize',next:'ropePrizeEnd',requirements:{notOwnedItems:['travelRope']},effects:item('travelRope','Awarded by guide Sen Harlow for correctly identifying the narrow trail from linked evidence in The Blind Trail Marker.','won_travel_rope_blind_trail_marker')}, {id:'takeCoin',label:'Take one coin instead',next:'coinEnd',effects:{money:1}},
    ]), wrong:e('wrong','A Fairly Lost Trail','You chose the false line. Harlow explains the backward heel mark; the rope goes to the better reading, and you may stay for the method.'), declined:e('declined','No Guess Required','Harlow respects your refusal to overstate what the signs prove. The contest continues without your score.'),
    ropePrizeEnd:e('ropePrizeEnd','A Rope for Your Kit','Harlow transfers the announced Travel Rope after recognizing your careful reading.'), coinEnd:e('coinEnd','A Coin for the Reading','You take one coin; the Travel Rope goes to the entrant who read the trail correctly.'),
  }),
  a('the-saw-before-supper-trial', 'The Saw before Supper', 'A sawyer’s speed trial changes when the practice log hides a split.', 'A cutting contest makes safe inspection part of the score.', 'lumber yard', 'MODERATE', 'log', {
    log:s('log','Two Logs, One Saw','Sawyer Rook offers a Folding Pry Tool as the prize. Competitors must cut a marked practice log before supper; the grain runs unevenly and the log is supported on trestles.',[
      {id:'inspectLog',label:'Check the underside for splits before cutting',next:'split'}, {id:'startCut',label:'Begin at the painted line',next:'cut'}, {id:'askSupport',label:'Ask the judge to check the trestle spacing',next:'support'},
    ]),
    split:s('split','A Hidden Split','The log has a split under the bark. Rook says the trial can continue if the log is turned and re-marked; the clock has not started yet.',[
      {id:'turnLog',label:'Turn the log and cut from the sound end',next:'cut'}, {id:'voidLog',label:'Ask for a sound replacement log',next:'replacement'},
    ]),
    support:s('support','One Trestle Sits Low','The trestle rocks under pressure. The judge wedges it level before anyone begins.',[
      {id:'startAfterFix',label:'Start the trial after the trestle is secured',next:'cut'}, {id:'withdrawSaw',label:'Withdraw rather than cut on an unstable support',next:'withdrawn'}
    ]),
    cut:s('cut','The Saw Binds','The kerf closes around the blade. A fast pull may free it, but could twist the wood across the trestles.',[
      {id:'easeBlade',label:'Ease the blade and reset the support',next:'finish'}, {id:'pullHard',label:'Pull hard before the timer expires',chance:{probability:0.42,successNext:'fast',failureNext:'bind'}}, {id:'stopTrial',label:'Stop and tell Rook the log is binding',next:'stopped'},
    ],'warning'),
    finish:s('finish','A Clean Cut Is Counted','The blade comes free and the log remains on its supports. The judge compares square ends as well as time.',[
      {id:'takePryTool',label:'Accept the Folding Pry Tool prize',next:'prize',requirements:{notOwnedItems:['foldingPryTool']},effects:item('foldingPryTool','Awarded by sawyer Rook for the cleanest safe cut in The Saw before Supper.','won_pry_tool_saw_trial')}, {id:'takeTwo',label:'Take two coins for the careful run',next:'coins',effects:{money:2}},
    ]),
    replacement:e('replacement','A Sound Replacement','The judge replaces the split log and restarts the clock for everyone. Rook says the careful inspection counts toward the day’s work, but the prize remains undecided.'), withdrawn:e('withdrawn','No Unsafe Cut','You withdraw before the clock starts. Rook resets the trestle and keeps the pry tool for the next trial.'), stopped:e('stopped','The Trial Pauses','Rook stops the clock and checks the binding kerf. No one wins on an unsafe cut; the judge records the call as sound practice.'), fast:s('fast','A Narrow Win','The blade comes free and the cut is square enough to count. The judge confirms the result and lets you choose the announced tool prize or its coin value.',[{id:'acceptFastPryTool',label:'Accept the Folding Pry Tool prize',next:'prize',requirements:{notOwnedItems:['foldingPryTool']},effects:item('foldingPryTool','Awarded by sawyer Rook for the cleanest safe cut in The Saw before Supper.','won_pry_tool_saw_trial')},{id:'takeFastCoins',label:'Take two coins instead',next:'coins',effects:{money:2}}]), bind:e('bind','Time Lost to the Grain','The blade stays caught and the clock runs out. The log is safely reset, but another competitor wins.'),
    prize:e('prize','A Tool for the Road','Rook transfers the announced Folding Pry Tool prize.'), coins:e('coins','Coins Instead','You take the two-coin careful-run purse; the pry tool goes to the cleanest cut.'),
  }),
  a('the-bell-rope-at-ferry-end', 'The Bell Rope at Ferry End', 'A team signal trial becomes real when a loaded punt drifts loose.', 'A signaling challenge tests whether competitors react to a genuine hazard.', 'ferry dock', 'HIGH', 'signal', {
    signal:s('signal','Three Pulls Mean Stop','The ferry crew runs a rope-signal contest. The winner receives a Farm Whistle; three short pulls mean stop, one long pull means ready.',[
      {id:'repeatRules',label:'Repeat the signals back before starting',next:'round'}, {id:'takePosition',label:'Stand where you can see both dock hands',next:'round'}, {id:'askAboutCurrent',label:'Ask which bank has the downstream current',next:'current'},
    ]),
    current:s('current','A Punt Off Its Mooring','The crew points out the downstream eddy. Before the bell rings, an empty practice punt slips loose and heads toward a post.',[
      {id:'signalStop',label:'Give three short pulls and warn the dock hand',next:'saved'}, {id:'runForLine',label:'Reach for the loose line from the dry dock',chance:{probability:0.58,successNext:'line',failureNext:'nearMiss'}},
    ],'warning'),
    round:s('round','The Signals Begin','A real punt begins drifting while the judge calls the contest signal. The crew has not noticed because they face the opposite bank.',[
      {id:'warnCrew',label:'Use the stop signal and point to the drifting punt',next:'saved'}, {id:'finishSignal',label:'Complete the contest call before turning',next:'late'}
    ]),
    line:s('line','The Line Slides','The wet line runs over the dock edge; you keep your footing but cannot hold the punt alone.',[{id:'callForHelp',label:'Call the dock hand and use the stop signal',next:'saved'}, {id:'letLineGo',label:'Let the line go rather than be pulled in',next:'nearMiss'}],'warning'),
    saved:s('saved','A Signal Used in Time','The dock hand catches the punt with a boat hook. The contest is paused; the keeper says the prize should recognize the person who noticed the real signal.',[
      {id:'claimWhistle',label:'Accept the announced Farm Whistle',next:'prize'}, {id:'takeFee',label:'Take the one-coin judge’s fee instead',next:'fee',effects:{money:1}}, {id:'declinePrize',label:'Decline payment and help re-moor the punt',next:'whistleEnd',effects:{knowledge:['A signal is useful only when the person who can act can see or hear it; place a lookout accordingly.']}},
    ]), late:e('late','The Punt Reaches the Post','The punt bumps the post without injury. The keeper ends the round and asks competitors to watch the water as well as the judge.'), nearMiss:e('nearMiss','A Wet Line Released','You release the line before it pulls you from the dock. The punt is recovered downstream; no contest prize is awarded.'),
    prize:s('prize','A Whistle for the Winner','The ferry keeper awards the Farm Whistle for the alert signal.',[{id:'acceptWhistle',label:'Accept the Farm Whistle',next:'whistleEnd',effects:item('farmWhistle','Awarded by the ferry keeper for using the posted stop signal to prevent a punt striking the landing.','won_farm_whistle_ferry_contest')},{id:'takeFee',label:'Take the one-coin judge’s fee instead',next:'fee',effects:{money:1}}]),
    whistleEnd:e('whistleEnd','A Clear Signal','You accept the Farm Whistle. The crew repeats the stop signal before reopening the practice course.'), fee:e('fee','A Small Fee','You take one coin; the keeper gives the whistle to the contest runner-up.'),
  }),
  a('the-iron-squares', 'The Iron Squares', 'A blacksmith’s judging contest asks which repaired hinge will survive a working gate.', 'A craft challenge tests observation of fit and load rather than appearance.', 'blacksmith yard', 'MODERATE', 'hinges', {
    hinges:s('hinges','Two Hinges on the Gate','Smith Leda displays two repaired hinges; one is the announced Carpenter’s Square prize for the best diagnosis. The gate must swing freely without lifting its post.',[
      {id:'checkGap',label:'Measure the hinge gaps while the gate is closed',next:'swing'}, {id:'swingGate',label:'Open the gate slowly and listen for a scrape',next:'swing'}, {id:'askSmith',label:'Ask which hinge was repaired last',next:'history'},
    ]),
    history:s('history','New Iron, Old Post','The newer hinge is straight, but its post hole is oval from years of strain. The older hinge fits the worn post better.',[
      {id:'measurePost',label:'Measure the post before choosing a hinge',next:'swing'}, {id:'chooseNew',label:'Choose the new hinge because it looks sound',next:'result'}
    ]),
    swing:s('swing','The Gate Lifts a Finger','One hinge lets the gate lift slightly as it swings. The keeper asks for your diagnosis before loading the latch.',[
      {id:'chooseOld',label:'Choose the older hinge that seats in the worn post',next:'correct'}, {id:'chooseNewHinge',label:'Choose the newer straight hinge',next:'wrong'}, {id:'askForLoad',label:'Test both with the gate’s normal weight',next:'result'}
    ]),
    result:s('result','A Working Load','The gate’s normal load reveals the older hinge fits better. Leda says a good repair matches the part to the work, not to shine.',[
      {id:'acceptSquare',label:'Accept the Carpenter’s Square prize',next:'prize',effects:item('carpenterSquare','Awarded by Smith Leda for diagnosing hinge fit under the gate’s working load.','won_carpenter_square_hinge_trial')}, {id:'takeCoins',label:'Take two coins instead',next:'coins',effects:{money:2}},
    ]),
    correct:e('correct','A Fit for This Gate','The older hinge takes the load without lifting the post. Leda gives you the announced square after recording the test.'), wrong:e('wrong','Looks Are Not the Load','The straight hinge binds in the worn post. Leda resets the gate and invites you to test under its actual weight.'),
    prize:e('prize','A Square for Your Kit','Leda transfers the Carpenter’s Square prize from her demonstration stock.'), coins:e('coins','Coins for the Diagnosis','You take two coins for the careful test. The square remains with the contest winner.'),
  }),
  a('the-load-on-the-siding', 'The Load on the Siding', 'A freight crew competes to secure an awkward crate without shifting the handcart.', 'A load-securing trial rewards a stable center of weight over a quick tie.', 'rail siding', 'LOW', 'crate', {
    crate:s('crate','A Crate That Leans','The freightmaster offers a Freightman’s Strap as prize. Teams must move a harmless empty crate along a marked siding, keeping it inside the cart rails.',[
      {id:'strapLow',label:'Place the strap low and center the crate',next:'roll',effects:{setFlags:['siding_strap_low']}}, {id:'strapHigh',label:'Tie high for a faster lift onto the cart',next:'roll',effects:{setFlags:['siding_strap_high']}}, {id:'inspectCart',label:'Check the cart rails before loading',next:'rails'},
    ]),
    rails:s('rails','A Bent Rail Stop','One stop is bent inward. The freightmaster allows a correction before the clock starts; the crate is not yet loaded.',[
      {id:'straightenStop',label:'Ask the crew to straighten the stop first',next:'load'}, {id:'workAround',label:'Place the crate clear of the bent stop',next:'load'}
    ]),
    load:s('load','The Strap Is Set','The crate is ready for the curve. Choose how to secure it before the cart starts; the crew has straightened the stop or placed the crate clear of it.',[
      {id:'loadLow',label:'Place the strap low and keep the load centered',next:'roll',effects:{setFlags:['siding_strap_low']}}, {id:'loadHigh',label:'Tie high for the faster lift onto the cart',next:'roll',effects:{setFlags:['siding_strap_high']}}
    ]),
    roll:{...s('roll','The Cart Takes the Curve','The cart reaches the bend with the crate still inside the rails.',[
      {id:'steadyCart',label:'Stop and recenter before the turn',next:'result',effects:{setFlags:['siding_trial_winner','siding_load_recentered']}},
      {id:'continueLow',label:'Keep rolling slowly with the low, centered strap',next:'result',requirements:{flags:['siding_strap_low']},effects:{setFlags:['siding_trial_winner']}},
      {id:'keepRolling',label:'Keep rolling and trust the high strap',requirements:{flags:['siding_strap_high']},chance:{probability:0.48,successNext:'fast',failureNext:'spill',successEffects:{setFlags:['siding_trial_runner_up']},failureEffects:{setFlags:['siding_trial_lost']}}},
      {id:'callSafeStop',label:'Call a stop and disqualify the unsafe cart',next:'stopped',effects:{setFlags:['siding_trial_disqualified']}}
    ],'warning'),textVariants:[
      {requirements:{flags:['siding_strap_low']},text:'The low strap keeps the crate’s weight centered as the cart reaches the bend, with the crate still inside the rails.'},
      {requirements:{flags:['siding_strap_high']},text:'The high strap keeps the crate inside the rails, but pulls its weight toward one side as the cart reaches the bend.'}
    ]},
    result:{...s('result','The Seal Stays Upright','The well-centered crate reaches the chalk line. The judge confirms your team’s first-place finish and checks the seal.',[
      {id:'takeStrap',label:'Accept the Freightman’s Strap winner’s prize',next:'prize',requirements:{notFlags:['siding_trial_runner_up','siding_trial_lost','siding_trial_disqualified'],notOwnedItems:['freightmansStrap']},effects:item('freightmansStrap','Awarded by the freightmaster to the winning team for keeping the crate centered through the siding curve.','won_freightmans_strap_siding_trial')},
      {id:'declineWinnerPrize',label:'Decline the winner’s prize and help reset the cart',next:'winnerDeclined',requirements:{notFlags:['siding_trial_runner_up','siding_trial_lost','siding_trial_disqualified']}}
    ]),textVariants:[
      {requirements:{flags:['siding_strap_low']},text:'The low strap kept the load centered through the bend. Your team reaches the chalk line first, and the judge checks the seal.'},
      {requirements:{flags:['siding_strap_high','siding_load_recentered']},text:'You stopped and recentered the crate before the bend, correcting the high strap’s off-center pull. Your team reaches the chalk line first, and the judge checks the seal.'}
    ]},
    fast:s('fast','A Safe but Second-Place Finish','The high strap holds the crate inside the rails, but shifts its center enough that the better-balanced team wins. You place second and may take the posted runner-up purse.',[{id:'acceptRunnerUp',label:'Take the two-coin runner-up purse',next:'coins',requirements:{notFlags:['siding_trial_winner','siding_trial_lost','siding_trial_disqualified']},effects:{money:2}},{id:'declineRunnerUp',label:'Decline payment and help recenter the crate',next:'sideLesson',requirements:{notFlags:['siding_trial_winner','siding_trial_lost','siding_trial_disqualified']},effects:{knowledge:['A high strap restrains a load but can pull its center of weight sideways on a curve.']}}]), sideLesson:e('sideLesson','A Better Balanced Load','You help reset the cart and keep the lesson about how a high strap shifts a load on a curve.'), spill:e('spill','A Crate on the Boards','The crate slides off harmlessly onto the boards. The judge voids the run and checks the cart before another team starts.'), stopped:e('stopped','A Safe Stop','The freightmaster accepts the stop call; the cart is adjusted, but your team is disqualified and receives no contest prize.'),
    prize:e('prize','A Strap Earned by Judgment','The freightmaster transfers the Freightman’s Strap from the posted prize stock.'), winnerDeclined:e('winnerDeclined','A Prize Left for Another Crew','You decline the winner’s prize and help reset the cart for the next team.'), coins:e('coins','A Runner-up Purse','You take two coins; the first-place team keeps the strap.'),
  }),
  a('the-hammer-and-the-ribbon', 'The Hammer and the Ribbon', 'A county fair’s tool-throwing contest changes after the target frame shifts.', 'A nonlethal accuracy trial asks whether competitors will stop when the range is no longer clear.', 'county fair range', 'MODERATE', 'range', {
    range:s('range','Blunt Pegs, Marked Lane','The fair uses blunt wooden pegs, not weapons. The announced prize is a Steel Wedge. A gust turns the target frame toward the waiting line.',[
      {id:'callHold',label:'Call a hold until the frame is reset',next:'reset'}, {id:'throwNow',label:'Take your turn while the lane is clear',next:'throw'}, {id:'askJudge',label:'Ask the judge to mark a safer throwing line',next:'rule'}
    ]),
    reset:s('reset','The Frame Is Tied Back','The keeper ties the frame to a post and moves the line behind the chalk. The contest restarts with fewer throws.',[
      {id:'takeTurn',label:'Throw from the new line',chance:{probability:0.6,successNext:'win',failureNext:'miss'}}, {id:'judgeFrame',label:'Help hold the frame while others compete',next:'helped'}
    ]),
    rule:s('rule','A Clear Lane','The judge moves the waiting line back and requires a call before each throw if the frame swings again.',[
      {id:'continueTrial',label:'Enter the revised round',chance:{probability:0.55,successNext:'win',failureNext:'miss'}}, {id:'withdrawRange',label:'Withdraw after the lane changes',next:'withdrawn'}
    ]),
    throw:s('throw','The Frame Swings','Your peg lands while the target is steady. The keeper then stops the range until the line is reset.',[
      {id:'resumeSafely',label:'Wait for the range to reopen',next:'score'}, {id:'leaveTrial',label:'Leave before another throw',next:'withdrawn'}
    ]),
    score:s('score','Marks on the Peg','The judge compares the pegs after the shortened round. A clean mark can win; safe participation can earn one coin.',[
      {id:'takeWedge',label:'Accept the Steel Wedge prize if you placed first',next:'prize',effects:item('steelWedge','Awarded by the fair keeper for the best score in the rescheduled blunt-peg contest.','won_steel_wedge_fair_trial')}, {id:'takeCoin',label:'Take the one-coin safe-participation purse',next:'coin',effects:{money:1}}
    ]),
    win:s('win','A Clean Mark','Your peg lands in the inner ring after the range is reset. The judge confirms your score leads and offers the announced tool or its coin value.',[{id:'acceptWonWedge',label:'Accept the Steel Wedge prize',next:'prize',effects:item('steelWedge','Awarded by the fair keeper for the best score in the rescheduled blunt-peg contest.','won_steel_wedge_fair_trial')},{id:'takeWonCoins',label:'Take two coins instead',next:'coin',effects:{money:2}}]), miss:s('miss','A Wide Mark','Your peg misses the ring. The judge records the attempt; you may accept a one-coin participation purse or leave empty-handed.',[{id:'takeMissCoin',label:'Take the one-coin participation purse',next:'coin',effects:{money:1}},{id:'declineMiss',label:'Decline payment and help secure the frame',next:'helpedEnd'}]), helped:s('helped','A Frame Held Steady','You help secure the frame; the keeper thanks you for pausing a dangerous trial and offers the posted helper coin.',[{id:'takeHelperCoin',label:'Accept the one-coin helper’s fee',next:'coin',effects:{money:1}},{id:'declineHelperCoin',label:'Decline the fee and help reset the range',next:'helpedEnd'}]), helpedEnd:e('helpedEnd','A Frame Held Steady','You help secure the frame and reset the range. The keeper gives the prize to the highest scorer.'), withdrawn:e('withdrawn','Range Closed to You','You leave the contest before the next throw. Your entry token is returned.'),
    prize:e('prize','A Wedge for Work','The keeper transfers the Steel Wedge prize from the fair’s tool table.'), coin:e('coin','A Safe Turn','You take one coin for completing the safe round; the Wedge goes to the top scorer.'),
  }),
  a('the-bet-at-the-water-wheel', 'The Bet at the Water Wheel', 'A miller wagers a coin that you cannot predict which gate will spill first.', 'A small, capped wager turns into a practical observation challenge.', 'mill yard', 'LOW', 'brief', {
    brief:s('brief','One Coin on the Gate','Miller Ren offers an even one-coin wager: choose which of two practice sluices will spill first. You may inspect the notches and flow; no second wager is allowed.',[
      {id:'stakeCoin',label:'Stake one coin and inspect both gate notches',requirements:{minMoney:1},next:'inspect',effects:{money:-1,setFlags:['waterwheel_stake_paid']}}, {id:'watchFree',label:'Watch the test without wagering',next:'inspect'}, {id:'declineBet',label:'Decline and ask how the mill balances the flow',next:'lesson',effects:{knowledge:['A mill gate’s notch and water pressure together indicate which channel will overflow first.']}},
    ]),
    inspect:s('inspect','A Notch Is Not the Whole Answer','The wider gate has the lower notch, but the narrow gate carries more water. Ren sets both to the same opening and asks for your call.',[
      {id:'callWide',label:'Call the wide gate from its lower notch',requirements:{flags:['waterwheel_stake_paid']},chance:{probability:0.45,successNext:'testWide',failureNext:'testNarrow',successMessage:'Your call is right: the wide gate spills first, and Ren returns your stake with one coin.',failureMessage:'The narrow gate spills first. Your one-coin stake is lost; Ren closes the wager after this single trial.',successEffects:{money:2}}}, {id:'callNarrow',label:'Call the narrow gate from the heavier flow',requirements:{flags:['waterwheel_stake_paid']},chance:{probability:0.55,successNext:'testNarrow',failureNext:'testWide',successMessage:'Your call is right: the narrow gate spills first, and Ren returns your stake with one coin.',failureMessage:'The wide gate spills first. Your one-coin stake is lost; Ren closes the wager after this single trial.',successEffects:{money:2,knowledge:['When two channels are set alike, compare the water already moving through them as well as the gate notch.']} }}, {id:'noStakeCall',label:'Offer a call without risking a coin',next:'testNarrow'},
    ]),
    testWide:e('testWide','The Wide Gate Spills','The wide gate spills first. Ren returns your stake with one coin, as promised; the wager closes after a single trial.'), testNarrow:e('testNarrow','The Narrow Gate Spills','The narrow gate spills first. Ren closes the single trial; no second wager is offered.'),
    lesson:e('lesson','No Coin Needed','Ren demonstrates the balance without a wager. You leave with the explanation and no money changed hands.'),
  }, ['coins', 'Knowledge', 'one-time wager; no Gear prize']),
  a('the-rigging-on-the-roof', 'The Rigging on the Roof', 'Two roofers compete to raise a slate bundle before weather reaches the street.', 'A timed work trial becomes an actual public safety problem.', 'town roofline', 'HIGH', 'rig', {
    rig:s('rig','A Rope and a Canvas Sling','Roofer Mina stakes a Roadside Signal Mirror for the crew that raises the slate without dropping a piece. A storm bank is visible beyond town.',[
      {id:'inspectAnchor',label:'Inspect the roof anchor before the lift',next:'anchor'}, {id:'tieSling',label:'Tie the canvas sling and start the clock',next:'lift'}, {id:'waitWeather',label:'Ask the judge to postpone until the squall passes',next:'weather'}
    ]),
    anchor:s('anchor','A Cracked Parapet Stone','The nearest ring is set in cracked mortar. A farther beam is sound but adds time to the lift.',[
      {id:'useBeam',label:'Move the line to the sound beam',next:'lift'}, {id:'stopTrial',label:'Stop the trial and repair the parapet first',next:'stopped'}
    ]),
    weather:s('weather','The First Rain','Rain reaches the roof before the judge decides. The slate must be covered or moved before it turns slick.',[
      {id:'coverSlate',label:'Cover the slate stack with the crew’s canvas',next:'covered'}, {id:'secureLine',label:'Secure the lifting line from the sound beam',next:'lift'}
    ]),
    lift:s('lift','A Sling Twists','The slate bundle rotates as it clears the eave. The street below is being cleared by a runner, but the squall is closer.',[
      {id:'lowerAndReset',label:'Lower the bundle and reset the sling',next:'finish'}, {id:'holdAndSignal',label:'Hold the line while your partner clears the street',next:'street'}, {id:'rushBundle',label:'Raise it quickly before the rain thickens',chance:{probability:0.42,successNext:'win',failureNext:'slip'}}
    ],'warning'),
    finish:s('finish','The Stack Is Secured','The bundle reaches the roof without falling. Mina judges the work on a sound anchor and an untwisted load, not the fastest time.',[
      {id:'takeMirror',label:'Accept the Roadside Signal Mirror prize',next:'prize',effects:item('roadsideSignalMirror','Awarded by roofer Mina for completing the safe slate lift in The Rigging on the Roof.','won_signal_mirror_roof_trial')}, {id:'takeCoins',label:'Take three coins for the work',next:'coins',effects:{money:3}}
    ]),
    street:s('street','The Street Is Clear','Your signal sends the runner to clear the drop zone. The bundle is lowered; the trial ends because the crew used its time to protect the street.',[{id:'takeDelayFee',label:'Take the posted one-coin weather delay fee',next:'covered',effects:{money:1}},{id:'declineFee',label:'Decline payment and help secure the roof',next:'stopped'}]), covered:e('covered','The Slate Kept Dry','The slate is covered before the rain. The contest is postponed; the one-coin weather delay fee is paid only if you accept it.'), stopped:e('stopped','A Roof Worth Keeping','The judge closes the trial until the parapet is repaired. No one risks the cracked anchor for a prize.'), win:s('win','The Bundle Rises','Your team clears the eave before the rain, with the bundle stable and the street empty. Mina confirms the clean finish and offers the announced mirror or the three-coin work purse.',[{id:'acceptRoofMirror',label:'Accept the Roadside Signal Mirror prize',next:'prize',effects:item('roadsideSignalMirror','Awarded by roofer Mina for completing the safe slate lift in The Rigging on the Roof.','won_signal_mirror_roof_trial')},{id:'takeRoofCoins',label:'Take three coins instead',next:'coins',effects:{money:3}}]), slip:e('slip','A Slate Breaks','The rushed sling twists; one slate breaks against the roof edge. The remaining load is lowered safely, but the trial is lost.'),
    prize:e('prize','A Mirror from the Roofer','Mina transfers the Roadside Signal Mirror prize.'), coins:e('coins','Work Paid','You take three coins; the mirror goes to the fastest safe team.'),
  }),
  a('the-quiet-card-count', 'The Quiet Card Count', 'A memory game at an inn turns on knowing when not to raise the stakes.', 'An informal, finite card challenge rewards observation without creating a gambling loop.', 'inn common room', 'LOW', 'table', {
    table:s('table','One Hand, One Coin','Retired clerk Oda offers a single one-coin hand. The winner chooses a Windproof Match Case or one coin from the inn’s prize tin. No second hand or raised stake is allowed.',[
      {id:'playHand',label:'Stake one coin and watch which card Oda protects',requirements:{minMoney:1},next:'hand',effects:{money:-1,setFlags:['card_count_stake']}}, {id:'watchOnly',label:'Watch a demonstration hand without staking',next:'hand'}, {id:'declineTable',label:'Decline the wager and ask Oda how she reads a hand',next:'lesson',effects:{knowledge:['Oda tracks which cards a player protects, not merely which card they show.']}},
    ]),
    hand:s('hand','A Card Turned Face Down','Oda lays one card aside before the deal. The remaining hand depends on whether you notice she keeps her thumb over the same corner when holding a high card.',[
      {id:'callHigh',label:'Call the protected card high',next:'won',requirements:{flags:['card_count_stake']}}, {id:'callLow',label:'Call the protected card low',next:'lost',requirements:{flags:['card_count_stake']}}, {id:'askMethod',label:'Ask Oda to show the pattern after the hand',next:'lesson'},
    ]),
    won:s('won','A Small Win','You read Oda’s tell correctly. She returns the agreed stake, then lets you choose the announced case or one coin from the prize tin.',[
      {id:'takeMatchCase',label:'Take the Windproof Match Case prize',next:'casePrize',requirements:{notOwnedItems:['windproofMatchCase']},effects:{...item('windproofMatchCase','Won in Oda’s single, openly staked card challenge at the inn; the case was announced as the prize before play.','won_match_case_quiet_card_count'),money:1}},
      {id:'takeOneCoin',label:'Take one coin from the prize tin instead',next:'coinPrize',effects:{money:2}},
    ]), lost:e('lost','The Hand Goes to Oda','Your call is wrong. You lose only the agreed one coin; Oda explains the tell and ends the game.'), lesson:e('lesson','No Stakes, Same Lesson','Oda explains her tell with the cards face up. You leave without a prize and no money changes hands.'), casePrize:e('casePrize','A Small Win in Kind','Oda returns your stake and awards the announced Windproof Match Case. The table closes without another hand.'), coinPrize:e('coinPrize','A Small Coin Win','Oda returns your stake and pays one coin from the prize tin. The table closes without another hand.'),
  }, ['coins', 'Knowledge', 'finite wager; match case prize only for a won hand']),
  a('the-harness-stitch-trial', 'The Harness Stitch Trial', 'A saddler challenges two helpers to find which strap will fail under a working pull.', 'A practical test makes careful inspection more valuable than speed.', 'county fair livestock yard', 'MODERATE', 'harness', {
    harness:s('harness','Three Straps, One Pull','Saddler Fenn posts a Leather Repair Roll as prize. Three harness straps look similar; one has a hidden stitch worn through at the fold.',[
      {id:'flexStitch',label:'Flex each fold gently and compare the thread',next:'inspection'}, {id:'pullTest',label:'Load each strap with a light practice weight',next:'load'}, {id:'askFenn',label:'Ask which strap has seen the most rain',next:'history'}
    ]),
    history:s('history','A Dry Strap Can Still Fail','The newest strap is dry but was stored folded. The oldest looks rough yet its thread remains tight.',[
      {id:'checkFolds',label:'Inspect the folds under the buckle',next:'inspection'}, {id:'trustAppearance',label:'Choose the cleanest-looking strap',next:'result'}
    ]),
    inspection:s('inspection','A Thread Split at the Fold','One strap’s stitch parts when flexed. Fenn says you found the fault before the load test; the other helper wants to test all three anyway.',[
      {id:'replaceThread',label:'Mark the weak strap and remove it from the test',next:'safeResult'}, {id:'testWeak',label:'Test it with the light practice weight only',next:'load'}
    ]),
    load:s('load','The Buckle Holds','The weak strap stretches near the fold. The animal is not harnessed; the pull is from a fixed hand winch.',[
      {id:'stopPull',label:'Stop the winch before the stitch tears',next:'safeResult'}, {id:'oneMorePull',label:'Pull once more to compare stretch',chance:{probability:0.35,successNext:'risk',failureNext:'tear'}}
    ],'warning'),
    safeResult:s('safeResult','The Fault Is Marked','Fenn confirms the weak stitch and awards the repair roll for the best diagnosis. The damaged strap is set aside for repair.',[
      {id:'takeRoll',label:'Accept the Leather Repair Roll',next:'prize',requirements:{notOwnedItems:['leatherRepairRoll']},effects:item('leatherRepairRoll','Awarded by saddler Fenn for identifying the worn fold stitch before an animal was harnessed.','won_leather_roll_harness_trial')}, {id:'takeTwoCoins',label:'Take two coins instead',next:'coins',effects:{money:2}}, {id:'learnStitch',label:'Decline the prize and remember Fenn’s test',next:'lesson',effects:{knowledge:['Flex a harness strap at its fold; worn stitches can fail there before the leather looks damaged.']}}
    ]),
    result:e('result','The Clean Strap Wins','The clean-looking strap fails under a light pull. Fenn removes it from use and awards the prize to the helper who inspected the fold.'), tear:e('tear','A Stitch Gives','The thread parts under the hand winch. No animal was attached, and the trial stops before anyone is hurt.'), risk:e('risk','A Close Call Avoided','You stop the pull as the stitch begins to separate. Fenn voids the round and records the inspection as the useful result.'),
    prize:e('prize','A Roll for Repairs','Fenn transfers the Leather Repair Roll from his announced prize stock.'), coins:e('coins','Pay for a Careful Eye','You take two coins; the roll goes to the highest-placed helper.'), lesson:e('lesson','A Stitch Remembered','You leave without the prize and remember to inspect folded leather under light tension.'),
  }),
  a('the-fair-weather-reading', 'The Fair-Weather Reading', 'A weather-reading contest becomes a choice between proving a forecast and warning the camp.', 'A field challenge lets observation matter immediately outside the score.', 'mountain camp', 'MODERATE', 'clouds', {
    clouds:s('clouds','A Contest before the Parade','The camp’s guide posts a Weatherproof Cloak for the most accurate two-hour forecast. Three contestants inspect cloud, wind, and the ridge flags.',[
      {id:'readRidge',label:'Compare the ridge cloud with the lower wind',next:'forecast'}, {id:'askOldCook',label:'Ask the cook what changed before the last storm',next:'sign'}, {id:'studyFlags',label:'Watch whether the flags lift or twist',next:'forecast'}
    ]),
    sign:s('sign','The Cook’s Tin Cups','The cook says cups started tapping under the eaves before the last squall. You hear the same tapping now, though the sky still shows a strip of blue.',[
      {id:'warnCamp',label:'Warn the parade crew before submitting a forecast',next:'warning'}, {id:'submitForecast',label:'Submit your forecast and let the judges decide',next:'forecast',effects:{knowledge:['A quick change in wind and tapping loose tin can precede rain even while a patch of sky remains clear.']}}
    ]),
    forecast:s('forecast','The Ridge Goes Grey','The ridge cloud lowers while the flags twist. The judge will score the forecast, but a parade of children is setting out toward the exposed trail.',[
      {id:'warnTrail',label:'Tell the parade leader to use the lower path',next:'warning'}, {id:'finishScore',label:'Record the forecast before interrupting the event',next:'score'}
    ],'warning'),
    warning:e('warning','A Route Changed in Time','The parade takes the lower path before the shower reaches the ridge. The judge suspends scoring and thanks you for acting on the signs.'),
    score:s('score','The Shower Arrives','Rain begins within the forecast window. Your estimate is close; the judge awards a cloak for the most accurate reading and one coin to other contestants.',[
      {id:'takeCloak',label:'Accept the Weatherproof Cloak if your forecast was closest',next:'prize',effects:item('weatherproofCloak','Awarded by the mountain guide for the closest forecast in The Fair-Weather Reading.','won_weatherproof_cloak_forecast')}, {id:'takeCoin',label:'Take the one-coin participant purse',next:'coin',effects:{money:1}}
    ]),
    prize:e('prize','A Forecast Proven','The guide awards the cloak. The parade’s change of route is recorded as a separate good decision, not part of the score.'), coin:e('coin','A Coin for the Reading','You take one coin; the cloak goes to the most accurate forecaster.'),
  }),
  a('the-ferryman-and-the-stake', 'The Ferryman and the Stake', 'A friendly race across a shallow ford is stopped by a missing marker.', 'The contest asks whether the Traveler will press an advantage when the course becomes unclear.', 'shallow ford', 'MODERATE', 'course', {
    course:s('course','A Mark Washed Away','Two boatmen race to pole a light punt between marked stakes. A Farm Whistle is the posted prize. One downstream marker is missing after rain.',[
      {id:'checkCourse',label:'Walk the bank and confirm every stake',next:'marker'}, {id:'startRace',label:'Start from the visible upstream mark',next:'race'}, {id:'askRival',label:'Ask your rival whether they saw the lower stake',next:'agreement'}
    ]),
    marker:s('marker','The Lower Stake Is Gone','The course ends at a muddy post with no marker. The rival says the route used to bend away from a snag.',[
      {id:'resetCourse',label:'Ask the keeper to reset the course',next:'reset'}, {id:'raceKnownPart',label:'Race only the marked section',next:'race'}
    ]),
    agreement:s('agreement','A Rival’s Honest Answer','Your rival confirms the lower stake washed away and refuses to race an unmarked section. The keeper can shorten the course or call the heat off.',[
      {id:'shortRace',label:'Agree to race the marked section only',next:'race'}, {id:'closeHeat',label:'Close the heat and return the entry tokens',next:'withdrawn'}
    ]),
    race:s('race','The Punt Finds a Snag','A submerged branch catches one pole. The boats are still in shallow water; pushing harder may damage the punt.',[
      {id:'freePole',label:'Free the pole slowly and continue',next:'finish'}, {id:'abandonRace',label:'Stop before the pole bends',next:'safeEnd'}, {id:'pushPast',label:'Push through the snag',chance:{probability:0.42,successNext:'win',failureNext:'late'}}
    ],'warning'),
    finish:s('finish','The Pole Clears the Snag','You free the pole without bending it. The rival is still level, and the keeper asks whether to sprint the final marked stretch or accept a safe tie.',[
      {id:'sprint',label:'Sprint the final marked stretch',chance:{probability:0.55,successNext:'win',failureNext:'late',successMessage:'Your punt reaches the last marked stake first, after both teams agreed to the shortened course.',failureMessage:'The rival reaches the last marked stake first; your punt remains undamaged.'}},
      {id:'acceptTie',label:'Accept a tie rather than risk the punt',next:'tie'},
    ]),
    reset:e('reset','A Course Made Fair','The keeper replaces the marker and starts a new heat later. The whistle remains the posted prize; no one wins this round.'), withdrawn:e('withdrawn','The Heat Is Closed','The entry tokens are returned. Your rival thanks you for not claiming an unmarked course.'), safeEnd:e('safeEnd','No Bent Pole','You stop and free the pole from shore. The heat is over, but both punts remain serviceable.'), win:s('win','A Narrow Lead','Your punt clears the snag and reaches the last visible stake first. The keeper confirms both teams accepted the shortened course, then offers the announced prize or its coin value.',[{id:'acceptPrize',label:'Accept the Farm Whistle',next:'prizeEnd',effects:item('farmWhistle','Awarded by the ford keeper for winning the jointly agreed shortened punt course.','won_farm_whistle_ford_race')},{id:'takeCoin',label:'Take the one-coin prize value instead',next:'coinEnd',effects:{money:1}}]), tie:e('tie','An Honest Tie','Neither punt gains a clear lead. The keeper returns the entry tokens and keeps the whistle for another fair heat.'), late:e('late','A Slow Finish','The snag costs time; your rival reaches the mark first. The keeper closes the heat before any second attempt.'), prizeEnd:e('prizeEnd','A Whistle Changes Hands','The keeper transfers the Farm Whistle after confirming the agreed shortened course.'), coinEnd:e('coinEnd','A Prize in Coin','You take the posted one-coin prize value; the keeper holds the whistle for the next fair heat.'),
  }),
  a('the-silent-score-slate', 'The Silent Score Slate', 'A public demonstration tests whether a rigger can read a sag before a bell rings.', 'A professional trial rewards a safe diagnosis, even when the score is disputed.', 'bridge work camp', 'HIGH', 'slate', {
    slate:s('slate','A Sag in the Practice Span','Bridge rigger Moss posts an Iron Rope Clamp to anyone who can identify which of two practice lines is under strain. The span is low, roped off, and carries no person.',[
      {id:'watchSag',label:'Watch the midpoint while the weight is added slowly',next:'weight'}, {id:'touchAnchor',label:'Inspect the anchors from the marked safe side',next:'anchor'}, {id:'readSlate',label:'Check the load figures on the score slate',next:'figures'}
    ]),
    figures:s('figures','The Numbers Disagree','The chalk total is copied from yesterday’s test, before one line was replaced. The judge has not noticed the slate is stale.',[
      {id:'tellJudge',label:'Tell Moss the slate is out of date',next:'retest',effects:{knowledge:['A recorded load test is only useful when its line, anchor, and date match the equipment now in place.']}}, {id:'testCurrent',label:'Ask for a slow test of the current lines',next:'weight'}
    ]),
    anchor:s('anchor','A Fresh Scuff','One anchor has a new bright scrape at the pin. The load can be removed before a full test.',[
      {id:'unloadLine',label:'Ask the crew to remove the weight and inspect the pin',next:'retest'}, {id:'continueLight',label:'Continue with only the lightest test weight',next:'weight'}
    ]),
    weight:s('weight','The Center Drops','The right line sags more as the weight is added. Moss calls to stop before the last block goes on.',[
      {id:'stopTest',label:'Stop and identify the right line as suspect',next:'result'}, {id:'addBlock',label:'Add the last block to confirm the reading',chance:{probability:0.35,successNext:'danger',failureNext:'stop'}}, {id:'challengeScore',label:'Challenge the judge to use the current slate',next:'retest'}
    ],'warning'),
    retest:s('retest','The Test Is Repeated','The crew removes the load and checks the pin. The bright scrape confirms the right anchor shifted; the demonstration is changed to a low demonstration at ground level.',[
      {id:'helpMarkLine',label:'Mark the suspect line and assist the retest',next:'award'}, {id:'leaveTrial',label:'Step away and let the crew reset',next:'stopped'}
    ]),
    result:s('result','A Safe Call','Moss confirms the right line is suspect. The clamp is awarded only for a correct call made before the final block.',[{id:'takeClamp',label:'Accept the Iron Rope Clamp prize',next:'prize',effects:item('ironRopeClamp','Awarded by bridge rigger Moss for identifying the strained practice line before loading the final block.','won_iron_rope_clamp_sag_test')},{id:'takeCoins',label:'Take two coins for assisting the safe test',next:'coins',effects:{money:2}}]),
    award:s('award','A Test Worth Repeating','The crew marks the line and records a new baseline. Moss offers the announced Iron Rope Clamp or two coins for the careful reading.',[{id:'acceptRetestClamp',label:'Accept the Iron Rope Clamp prize',next:'prize',requirements:{notOwnedItems:['ironRopeClamp']},effects:item('ironRopeClamp','Awarded by bridge rigger Moss after the Traveler marked the suspect line and helped repeat the safe load test.','won_iron_rope_clamp_sag_retest')},{id:'takeRetestCoins',label:'Take two coins instead',next:'coins',effects:{money:2}}]), stopped:e('stopped','The Crew Resets','You leave without the prize; the crew corrects its slate before another demonstration.'), danger:e('danger','The Test Is Halted','The pin shifts under the final block, but the low rig holds. Moss removes the weight and closes the contest.'), stop:e('stop','A Sound Stop','The crew halts the test before the anchor moves further. The judge awards no prize for an unsafe result.'),
    prize:e('prize','A Clamp Earned by Reading','Moss transfers the Iron Rope Clamp prize.'), coins:e('coins','A Helper’s Fee','You take two coins for the assistance; the clamp goes to the winning rigger.'),
  }),
  a('the-last-clean-spoke', 'The Last Clean Spoke', 'Two wheelwrights race to true a wheel while a customer waits for a safe cart.', 'A repair race must balance time against the result the customer actually needs.', 'wagon yard', 'MODERATE', 'wheel', {
    wheel:s('wheel','The Wheel Wobbles','Wheelwright Asa posts a Compact Wheel Wrench as prize. Two wheels wobble; one is for the timed contest and one belongs to a customer’s cart waiting for a safe repair.',[
      {id:'markContestWheel',label:'Mark which wheel belongs to the contest',next:'spokes'}, {id:'repairCustomer',label:'Ask to repair the customer’s wheel first',next:'customer'}, {id:'checkHub',label:'Check the hub before tightening spokes',next:'hub'}
    ]),
    hub:s('hub','A Cracked Hub','One wobble comes from a cracked hub, not loose spokes. Tightening it would hide the fault, not fix it.',[
      {id:'tellCustomer',label:'Tell the customer the hub must be replaced',next:'customer'}, {id:'continueContest',label:'Keep the timed contest on the sound wheel',next:'spokes'}
    ]),
    spokes:s('spokes','The Rim Pulls Sideways','A quarter-turn tightens one spoke, but the rim moves toward the opposite side. Asa says competitors may recheck before the final mark.',[
      {id:'trueByQuarter',label:'Adjust opposite spokes a quarter-turn at a time',next:'score'}, {id:'tightenLoose',label:'Tighten every loose spoke quickly',chance:{probability:0.45,successNext:'fast',failureNext:'crooked'}}, {id:'stopWheelRace',label:'Stop the race and explain the hub pattern',next:'stopped'}
    ]),
    customer:s('customer','A Customer Can Wait','The customer agrees to wait for a safe repair and hears the cracked hub explanation. The contest continues on its separate practice wheel.',[
      {id:'returnContest',label:'Return to the practice wheel',next:'spokes'}, {id:'stayRepair',label:'Stay and help source a replacement hub',next:'helped'}
    ]),
    score:s('score','The Rim Runs True','The wheel rolls without a side pull. Asa checks it under a light load before recording the time.',[
      {id:'takeWrench',label:'Accept the Compact Wheel Wrench prize',next:'prize',requirements:{notOwnedItems:['compactWheelWrench']},effects:item('compactWheelWrench','Awarded by wheelwright Asa for a true practice wheel that passed a light-load check.','won_wheel_wrench_spoke_trial')}, {id:'takeWages',label:'Take two coins for the repair work instead',next:'coins',effects:{money:2}}
    ]),
    fast:e('fast','Fast but Checked','The spokes are tightened quickly; Asa checks the rim and finds it serviceable, though not the cleanest run.'), crooked:e('crooked','A Wheel Still Out','The rim pulls out of true. Asa stops the cart before the road test; the race is lost but the customer’s wheel remains untouched.'), stopped:e('stopped','A Contest Stopped for the Right Fault','Asa replaces the practice hub before resuming. The repair takes longer, and no prize is awarded this heat.'), helped:e('helped','A Safe Customer Repair','You help the customer find a replacement hub. Asa closes the contest; the customer offers one coin for the time.'),
    prize:e('prize','A Tool for Wheel Work','Asa transfers the Compact Wheel Wrench prize.'), coins:e('coins','Wages instead of Wrench','You take two coins for the work, and the wrench goes to the fastest safe repair.'),
  }),
  a('the-seven-inch-square', 'The Seven-Inch Square', 'A carpenter’s challenge rewards checking a frame against its use.', 'A precision test grows into a disagreement about what the measurement should mean.', 'barn workshop', 'LOW', 'frame', {
    frame:s('frame','A Window for an Old Barn','Carpenter Willa posts a Carpenter’s Square as prize. Competitors must square a frame to fit an opening that has settled unevenly.',[
      {id:'measureOpening',label:'Measure both diagonals of the opening',next:'measure'}, {id:'trustPlan',label:'Build to the drawing’s seven-inch note',next:'fit'}, {id:'askOwner',label:'Ask the barn owner which side must swing free',next:'use'}
    ]),
    use:s('use','The Owner Needs the Hinge Side','The owner says the frame must fit around the old hinge post, not the drawing’s original center line.',[
      {id:'markHinge',label:'Mark the hinge post and measure around it',next:'measure'}, {id:'followPlan',label:'Follow the drawing and let the owner trim later',next:'fit'}
    ]),
    measure:s('measure','The Opening Is Not Square','The diagonals differ by an inch. The frame can be made square and shimmed, or cut to follow the settled opening.',[
      {id:'squareAndShim',label:'Build square and leave room for a shim',next:'result'}, {id:'fitOldOpening',label:'Fit the settled opening and mark the uneven edge',next:'result'}, {id:'askWilla',label:'Ask Willa to choose the finish standard',next:'decision'}, {id:'measureStock',label:'Use Field Calipers to compare the stock thickness before sizing the shim',requirements:{items:['fieldCalipers'], usableItems: ['fieldCalipers']},next:'result',effects:{historyFlags:['used_field_calipers_to_size_barn_window_shim']}}
    ]),
    fit:s('fit','The Plan Meets the Wall','The seven-inch note centers the frame, but the hinge post intrudes into the opening.',[
      {id:'revisePlan',label:'Revise the frame around the hinge post',next:'measure'}, {id:'forceFit',label:'Force the planned frame into place',next:'badFit'}
    ]),
    decision:s('decision','A Choice of Standard','Willa says the frame should be square for its own strength, while the owner needs it to meet the old opening.',[
      {id:'squareStandard',label:'Keep the frame square and shim the wall side',next:'good'}, {id:'followOpening',label:'Fit the old opening and mark the frame’s deviation',next:'good'}
    ]),
    result:s('result','A Frame Made for Its Place','The frame is square or fitted as agreed, and the owner can open the barn window. Willa offers the announced Carpenter’s Square or two coins for explaining the measurement choice.',[
      {id:'acceptSquarePrize',label:'Accept the Carpenter’s Square prize',next:'squarePrize',requirements:{notOwnedItems:['carpenterSquare']},effects:item('carpenterSquare','Awarded by carpenter Willa after the Traveler explained how the frame’s measurement should serve the settled barn opening.','won_carpenter_square_seven_inch_trial')},
      {id:'takeSquareCoins',label:'Take two coins instead',next:'squareCoins',effects:{money:2}},
      {id:'declineSquarePrize',label:'Decline both and leave the frame in place',next:'squareDeclined'},
    ]), good:s('good','The Measure Is Explained','Willa and the owner agree what the measurement means before the frame is fixed. She offers the same announced square or two coins for your judgment.',[
      {id:'acceptGoodSquare',label:'Accept the Carpenter’s Square prize',next:'squarePrize',requirements:{notOwnedItems:['carpenterSquare']},effects:item('carpenterSquare','Awarded by carpenter Willa after the Traveler explained how the frame’s measurement should serve the settled barn opening.','won_carpenter_square_seven_inch_trial')},
      {id:'takeGoodCoins',label:'Take two coins instead',next:'squareCoins',effects:{money:2}},
      {id:'declineGoodSquare',label:'Decline both and leave the frame in place',next:'squareDeclined'},
    ]), badFit:s('badFit','A Frame That Will Not Seat','The frame catches on the hinge post. Willa removes it before the joints split; the result is void, and you can remeasure or withdraw.',[{id:'remeasureFrame',label:'Remeasure around the hinge post',next:'measure'},{id:'withdrawFrame',label:'Withdraw from the trial',next:'squareWithdrawn'}]), squarePrize:e('squarePrize','A Square for Your Kit','Willa transfers the announced Carpenter’s Square from her prize stock.'), squareCoins:e('squareCoins','Coins for a Practical Judgment','You take two coins; Willa keeps the square for the next trial.'), squareDeclined:e('squareDeclined','A Frame Left in Use','You decline compensation, and the owner uses the fitted frame.'), squareWithdrawn:e('squareWithdrawn','No Prize Claimed','You withdraw after the poor fit; the frame remains with Willa for another measured attempt.'),
  }),
];

export const COMPETITION_GEAR_GENRE_IDS = new Set(COMPETITION_GEAR_GENRE_BATCH.map(({ id }) => id));
