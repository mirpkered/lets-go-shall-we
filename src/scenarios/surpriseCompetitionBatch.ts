import { anthologyEnd as end, anthologyScene as scene, anthologyStory as story, anthologyTags as tags } from './surpriseAnthologyTools';

const T = (hook: string, role: string, tone: string, setting: string, structures: string[], entry: string, reward = ['narrative-only payoff']) => tags({ hook, activities: ['competition/game', 'social interaction'], role, tone, risk: 'LOW', setting, structures, entry, rewards: reward, consequences: ['time/opportunity', 'relationship'] });

export const THE_THREE_RING_TOSS = story('the-three-ring-toss', 'The Three-Ring Toss', 'A fairground game has one ring left and three people certain it was theirs.', T('The player enters a fairground ring toss after its last ring lands between three chalked prizes, then must decide how to settle an honest near-tie.', 'competitor', 'humorous/absurd', 'county fair green', ['branching narrative', 'multi-stage sequence'], 'already participating in event', ['narrative-only payoff']), 'toss', {
  toss: scene('toss', 'The Last Ring', 'At the fair booth, a tin cup and painted duck sit side by side on a waist-high shelf. Throwers stand at a chalked toe-line two paces away. Your wooden ring rests on the shelf between the prizes, closer to the duck, but the keeper says the nearer prize wins only if the throw began behind the line.', [
    { id: 'inspectLine', label: 'Ask to see the chalk line', next: 'line' },
    { id: 'offerRerun', label: 'Offer the ring back for another throw', next: 'rerun' },
    { id: 'callForKeeper', label: 'Ask the stall keeper to decide', next: 'keeper' },
  ]),
  line: scene('line', 'A Chalk Mark Moved', 'A boot scuffed the official toe-line after the throw. The mark no longer shows whether the thrower stayed behind it, so the ring’s position is visible but the toss may not count.', [
    { id: 'admitUncertainty', label: 'Say the mark proves nothing now', next: 'choice' },
    { id: 'argueForDuck', label: 'Argue that the duck is nearer', next: 'duck', effects: { historyFlags: ['argued_for_a_fairground_prize_after_the_line_was_scuffed', 'won_a_painted_duck_that_was_not_travel_gear'] } },
  ]),
  rerun: scene('rerun', 'One More Throw', 'The three players agree to one last throw each from the redrawn toe-line. Yours lands short; the other two land close enough that the stall keeper refuses to call either a clear win.', [
    { id: 'sharePrize', label: 'Suggest sharing the painted duck', next: 'shared' },
    { id: 'letKeeperChoose', label: 'Leave the call to the keeper', next: 'keeper' },
  ]),
  keeper: scene('keeper', 'The Keeper’s Rule', 'The keeper admits the rule was not posted clearly. The prizes are his to award, but the three players deserve a clear call before another round begins.', [
    { id: 'refundTheThrows', label: 'Close the round without a prize', next: 'refunded' },
    { id: 'acceptSmallPrize', label: 'Accept the keeper’s tie call', next: 'cup' },
    { id: 'askForRerun', label: 'Ask for a clean round next time', next: 'future' },
  ]),
  choice: scene('choice', 'A Fairer Call', 'The stall keeper offers to close the disputed round without a prize or reserve the duck for the next clear winner. Nobody is owed a prize from a scuffed line.', [
    { id: 'refundThePlayers', label: 'Close this round without a prize', next: 'refunded' },
    { id: 'leaveDuck', label: 'Let the next clear winner try', next: 'future' },
  ]),
  duck: end('duck', 'A Prize Taken by Argument', 'The keeper puts the painted duck in your hands rather than prolong the dispute. The other players leave without a rematch. It is a small fairground prize, not usable travel Gear, so it does not occupy a pack slot; the disputed win remains part of your journey’s history.'),
  shared: end('shared', 'A Fairground Tie', 'The other players agree to share the painted duck. The keeper marks the line again before the next round, and the crowd returns to the music.'),
  refunded: end('refunded', 'Round Closed', 'The keeper ends the disputed round without awarding the duck and redraws the line. You leave without a prize, but the next players know exactly where a winning ring must land.'),
  cup: end('cup', 'A Tie Called Fairly', 'The keeper records the throw as a tie rather than guessing which prize it touched. The players accept the call, and the next round begins on a clearer line.'),
  future: end('future', 'The Next Round', 'You step aside while the keeper resets the game. The decision changes how the stall runs; it does not make the near-tie a clean victory.'),
});

export const THE_LAST_VERSE_CONTEST = story('the-last-verse-contest', 'The Last Verse Contest', 'A recitation prize depends on remembering what the printed broadside left out.', T('In a public recitation, a missing final verse makes faithful memory more important than confidence or volume.', 'performer', 'warm/hopeful', 'town hall stage', ['performance with information fork', 'memory-gated payoff'], 'traveler is asked to judge contest'), 'broadside', {
  broadside: scene('broadside', 'A Verse Missing from Print', 'Three reciters compete for a modest book prize. The broadside ends one verse early, and the judge asks you to help decide whether a contestant’s remembered ending is genuine or invented.', [
    { id: 'askForSource', label: 'Ask where the verse was learned', next: 'source' },
    { id: 'hearAllReciters', label: 'Hear each reciter before judging', next: 'recitals' },
    { id: 'declineJudge', label: 'Decline to judge from a partial text', next: 'declined' },
  ]),
  source: scene('source', 'A Family Version', 'The youngest reciter says the ending came from a grandparent, not the printed broadside. The judge can accept that as a valid oral version or limit the contest to the text on the page.', [
    { id: 'compareVersions', label: 'Ask each contestant to recite the ending', next: 'recitals' },
    { id: 'askJudgeRule', label: 'Ask the judge to set the rule openly', next: 'rule' },
  ]),
  recitals: scene('recitals', 'Three Different Endings', 'The first contestant follows the broadside, the second remembers an extra verse, and the third changes a line to make the audience laugh. None claims the others are lying.', [
    { id: 'judgeByMemory', label: 'Choose the remembered family verse', next: 'family', effects: { knowledge: ['The recitation contest accepted a family-transmitted verse absent from the printed broadside.'] } },
    { id: 'judgeByPrint', label: 'Choose the printed version', next: 'printed' },
    { id: 'askForAudienceChoice', label: 'Let the listeners choose their favorite', next: 'audience' },
  ]),
  rule: scene('rule', 'A Rule Before a Winner', 'The judge decides the contest should reward delivery, not which version is historically correct. Each contestant gets one final stanza, then the room will vote.', [
    { id: 'keepDeliveryRule', label: 'Announce the delivery rule', next: 'audience' },
    { id: 'stepAwayFromRule', label: 'Leave the choice to the judge', next: 'declined' },
  ]),
  family: end('family', 'A Version Kept Alive', 'The judge awards the book to the reciter who remembered the family verse. The printed broadside remains incomplete, but the room has heard a version worth carrying.'),
  printed: end('printed', 'Words on the Page', 'The printed version wins by the rule the judge set. The youngest contestant is disappointed, then asks the printer whether the missing verse can be added to a new broadside.'),
  audience: end('audience', 'A Roomful of Favorites', 'The audience chooses the comic ending for the prize. The judge records that it was the crowd’s favorite, not the oldest or truest version.'),
  declined: end('declined', 'No False Certainty', 'You refuse to call a remembered verse false simply because it is missing from print. The judge chooses a rule without asking you to claim certainty you do not have.'),
});

export const THE_CLOCKMAKERS_DEMONSTRATION = story('the-clockmakers-demonstration', 'The Clockmaker’s Demonstration', 'A traveling maker promises a clock that can be set by a single drop of water.', T('A clockmaker demonstrates a water-triggered clock whose apparent failure may be a design flaw, stage trick, or misunderstood instruction.', 'skeptic', 'humorous/absurd', 'town exhibition room', ['demonstration', 'evidence comparison', 'public interpretation'], 'traveler sees unusual demonstration'), 'exhibit', {
  exhibit: scene('exhibit', 'The Clock That Waits for Rain', 'A traveling clockmaker has built a clock with a small brass cup above its face. He says one drop should start the hands. A drop falls, the clock ticks once, then stops.', [
    { id: 'inspectCup', label: 'Inspect the brass cup', next: 'cup' },
    { id: 'askForSecondTrial', label: 'Ask for another demonstration', next: 'trial' },
    { id: 'leaveShow', label: 'Thank him and leave the exhibit', next: 'leave' },
  ]),
  cup: scene('cup', 'A Narrow Channel', 'The cup drains through a narrow hole onto a paddle. A thread of solder partly blocks it. The clockmaker asks you not to touch the clock, but welcomes a suggestion.', [
    { id: 'describeBlockage', label: 'Point out the blocked channel', next: 'repair' },
    { id: 'askForWaterMeasure', label: 'Ask how much water the clock needs', next: 'explanation' },
  ]),
  trial: scene('trial', 'A Second Drop', 'The clockmaker uses a larger drop. The hands move farther, then stop at the same place. A child says it works better if the cup is tilted.', [
    { id: 'tryTiltedCup', label: 'Suggest a tilted cup', next: 'tilt' },
    { id: 'askMakerToExplain', label: 'Ask the maker what it measures', next: 'explanation' },
  ]),
  repair: scene('repair', 'The Maker’s Choice', 'The clockmaker clears the solder with his own tool. He admits the device measures a steady drip, not a single drop. He can correct the handbill or demonstrate the proper drip.', [
    { id: 'correctHandbill', label: 'Ask him to correct the handbill', next: 'honest' },
    { id: 'showProperDrip', label: 'Help explain the steady drip', next: 'works' },
  ]),
  tilt: end('tilt', 'A Better Demonstration', 'The tilted cup gives the paddle a steadier stream. The clockmaker credits the child’s suggestion and changes the demonstration rather than claiming the first trial worked.'),
  explanation: end('explanation', 'A Clock with a Narrow Purpose', 'The maker explains that it is a novelty for measuring a slow drip, not a rain clock. The crowd loses interest, but nobody is asked to buy a miracle.'),
  honest: end('honest', 'A Corrected Handbill', 'The clockmaker crosses out “one drop” and writes “a steady drip.” Fewer people gather, but the next demonstration begins with honest expectations.'),
  works: end('works', 'The Drip Clock', 'A steady drip moves the hands. The clockmaker says the mechanism still needs work, and the crowd applauds the demonstration instead of the boast.'),
  leave: end('leave', 'A Small Exhibition', 'You leave while the clockmaker adjusts the cup. The device may yet work for a narrower purpose than the handbill promised.'),
});

export const THE_BELL_RINGER_TRIAL = story('the-bell-ringer-trial', 'The Bell-Ringer Trial', 'A village contest tests timing, not strength, and the rope has begun to fray.', T('The player helps judge a bell-ringing contest where an old rope makes timing and safety more important than the loudest ring.', 'judge', 'tense/dangerous', 'chapel yard', ['three-stage contest', 'safety intervention', 'performance aftermath'], 'traveler is asked to judge contest', ['relationship/referral', 'narrative-only payoff']), 'yard', {
  yard: scene('yard', 'The Rope and the Rule', 'Two experienced ringers and a young apprentice compete to ring a pattern cleanly. The rope shows wear near the lower knot. The contest rule rewards clear timing, not force.', [
    { id: 'inspectRope', label: 'Ask to pause and inspect the rope', next: 'inspection' },
    { id: 'hearFirstRound', label: 'Let the first round begin', next: 'roundOne' },
    { id: 'withdrawContest', label: 'Ask the ringers to stop for today', next: 'stopped' },
  ], 'warning'),
  inspection: scene('inspection', 'A Frayed Strand', 'Several strands are worn through. The bell can still be rung from below, but a hard pull could snap the rope and whip it across the yard.', [
    { id: 'changeToLightPull', label: 'Change to a light-pull pattern', next: 'lightRound' },
    { id: 'callOffContest', label: 'Postpone until the rope is replaced', next: 'stopped' },
  ], 'warning'),
  roundOne: scene('roundOne', 'A Loud First Ring', 'The first ringer pulls hard; the bell rings clearly, but the knot slips a finger-width. The next contestant waits with one hand already on the rope.', [
    { id: 'stopForInspection', label: 'Stop the round and inspect the knot', next: 'knotSlipped' },
    { id: 'allowApprentice', label: 'Let the apprentice try gently', next: 'apprentice' },
  ], 'warning'),
  apprentice: scene('apprentice', 'A Softer Pattern', 'The apprentice rings a quiet pattern from below. It is not loud, but the rhythm is clean. The crowd begins to clap in time.', [
    { id: 'awardTiming', label: 'Award the round for clear timing', next: 'apprenticeWins' },
    { id: 'endForSafety', label: 'End the contest and credit the attempt', next: 'stopped' },
  ]),
  lightRound: scene('lightRound', 'A Pattern from Below', 'The ringers use a small hand bell on the ground to practice the pattern while the chapel rope is removed. The contest becomes a timing exercise rather than a test of power.', [
    { id: 'judgeThePattern', label: 'Judge the cleanest pattern', next: 'apprenticeWins' },
    { id: 'letRingersTeach', label: 'Let the ringers teach the pattern', next: 'sharedSkill' },
  ]),
  knotSlipped: scene('knotSlipped', 'The Knot Has Shifted', 'The worn section separates under a gentle test. Everyone can see the rope needs replacing before the bell is pulled again.', [
    { id: 'tieOffBell', label: 'Tie off the rope and stop the contest', next: 'stopped' },
    { id: 'judgeOnlyGroundBell', label: 'Continue with the hand bell below', next: 'lightRound' },
  ], 'warning'),
  apprenticeWins: end('apprenticeWins', 'Timing Wins the Day', 'The apprentice wins the adjusted contest for a steady pattern. The rope is taken down for repair, and the experienced ringers admit the gentler test showed more skill.'),
  sharedSkill: end('sharedSkill', 'A Lesson Instead of a Prize', 'The ringers teach the pattern to anyone who wants to learn. There is no winner, but the chapel bell stays quiet until its rope is safe.'),
  stopped: end('stopped', 'A Contest Postponed', 'The contest ends before anyone is hurt. The apprentice is disappointed, but the rope is tied off and the bell will not be pulled again until it is replaced.'),
});

export const THE_PIE_WITH_NO_RECIPE = story('the-pie-with-no-recipe', 'The Pie with No Recipe', 'The fair’s winning pie came from a recipe no one can agree exists.', T('A pie contest becomes a dispute over a recipe everyone remembers differently, and the traveler must distinguish ownership from cooking skill.', 'judge', 'humorous/absurd', 'county fair dining tent', ['blind tasting', 'testimony comparison', 'public decision'], 'traveler is asked to judge contest', ['narrative-only payoff', 'relationship/referral']), 'tasting', {
  tasting: scene('tasting', 'Three Pies, Two Recipes', 'Three pies sit under numbered cloths. Two bakers claim the winning crust follows a recipe taught by the late Mrs. Orrow. A third says she invented the filling herself.', [
    { id: 'tasteBeforeNames', label: 'Taste before hearing more claims', next: 'flavor' },
    { id: 'askAboutRecipe', label: 'Ask what each baker remembers', next: 'accounts' },
    { id: 'declineAward', label: 'Decline to judge ownership', next: 'declined' },
  ]),
  flavor: scene('flavor', 'A Taste of Plum and Pepper', 'The winning pie tastes of plum, pepper, and a crust folded twice. That tells you how it was made, not whose recipe it was.', [
    { id: 'judgeTasteOnly', label: 'Judge flavor and texture alone', next: 'award' },
    { id: 'askForAccounts', label: 'Hear both bakers before awarding', next: 'accounts' },
  ]),
  accounts: scene('accounts', 'What Mrs. Orrow Taught', 'One baker remembers exact measures. The other remembers Mrs. Orrow saying to add pepper “until the filling wakes up.” Both helped in her kitchen, and neither has a written copy.', [
    { id: 'separateRecipeAndPrize', label: 'Separate the prize from the recipe claim', next: 'award' },
    { id: 'askFairKeeper', label: 'Ask the fair keeper to settle the rule', next: 'rule' },
  ]),
  rule: scene('rule', 'A Rule for This Contest', 'The keeper says the prize was for the pie, not ownership of the recipe. The bakers can compete on taste without claiming a deed to Mrs. Orrow’s kitchen.', [
    { id: 'acceptRule', label: 'Judge the pies by taste', next: 'award' },
    { id: 'leaveRule', label: 'Ask the bakers to settle it themselves', next: 'shared' },
  ]),
  award: scene('award', 'The Prize Plate', 'The pies are close. The plum filling is brighter, while the twice-folded crust holds together better. The prize can recognize one pie, or the fair can split the ribbon.', [
    { id: 'awardPlum', label: 'Award the ribbon to the plum pie', next: 'winner' },
    { id: 'splitRibbon', label: 'Ask for a shared ribbon', next: 'shared' },
  ]),
  winner: end('winner', 'A Prize for the Pie', 'The baker accepts the ribbon and says the recipe remains Mrs. Orrow’s memory, not a prize to win. The other baker asks to trade notes after the fair.'),
  shared: end('shared', 'Two Pies, One Memory', 'The bakers share the ribbon and agree to compare what they remember. The recipe is still incomplete, but nobody has to claim ownership of it.'),
  declined: end('declined', 'A Judge Steps Aside', 'The fair keeper asks another judge to choose a pie. You leave the family memory out of a contest that can only reward the baking.'),
});

export const THE_PAINTED_SIGN = story('the-painted-sign', 'The Painted Sign', 'A sign painter’s work is accurate, but the town’s new name is not.', tags({ hook: 'A painter finishes a town sign just as residents reveal the place has voted to restore its older name; the traveler must help avoid wasting honest work.', activities: ['labor/repair', 'social interaction'], role: 'witness', tone: 'warm/hopeful', risk: 'LOW', setting: 'town square', structures: ['branching narrative', 'multi-stage sequence'], entry: 'witnesses incident', rewards: ['narrative-only payoff'], consequences: ['time/opportunity', 'money/wages', 'relationship'] }), 'sign', {
  sign: scene('sign', 'Fresh Paint, Old Name', 'A painter has finished a large sign reading “New Mill.” Before it is raised, an elder brings the minutes: residents agreed last week to restore the older name, “Mill End.” The painter followed the order on the work slip.', [
    { id: 'readWorkSlip', label: 'Check who approved the work slip', next: 'minutes' },
    { id: 'askPainter', label: 'Ask the painter what can be changed', next: 'options' },
    { id: 'leaveSignAlone', label: 'Let the town decide without you', next: 'leave' },
  ]),
  minutes: scene('minutes', 'A Decision Made Too Late', 'The minutes confirm the name change, but the notice reached the painter after the paint was bought. The painter asks to be paid for the completed work either way.', [
    { id: 'supportFullPay', label: 'Support paying for the finished sign', next: 'paid' },
    { id: 'askTownToReuseBoard', label: 'Ask whether the board can be reused', next: 'options' },
  ]),
  options: scene('options', 'A Board Worth Saving', 'The painted letters can be sanded down, or a smaller board can cover them with the restored name. Either way takes another afternoon and more paint.', [
    { id: 'overlayName', label: 'Use a smaller board over the old name', next: 'overlaid' },
    { id: 'sandAndRepaint', label: 'Sand the face and repaint it', next: 'repainted' },
    { id: 'payPainterAndPause', label: 'Pay the painter and decide later', next: 'paid' },
  ]),
  overlaid: end('overlaid', 'Two Names, One Sign', 'The smaller board carries the old name, while the new lettering remains visible beneath its edge. The town likes the reminder that names change; the painter is paid for both days.'),
  repainted: end('repainted', 'The Name Returned', 'The board is sanded and repainted. The painter charges for the extra work, and the elder promises to deliver future changes before the first coat goes on.'),
  paid: end('paid', 'Work Paid, Decision Deferred', 'The painter receives the agreed payment. The town will choose what to do with the sign tomorrow; tonight the dispute is about timing, not workmanship.'),
  leave: end('leave', 'A Sign Waiting on the Ground', 'The sign remains on the trestles while residents talk. You leave without deciding whether an honest mistake should be repainted at someone else’s expense.'),
});

export const THE_WHISTLE_AND_THE_WIND = story('the-whistle-and-the-wind', 'The Whistle and the Wind', 'A roadside whistle contest becomes a test of listening rather than lung power.', T('Travelers compete to imitate three bird calls, but wind and an unseen real bird make the audience’s scoring unreliable.', 'competitor', 'humorous/absurd', 'roadside fair', ['sound-identification game', 'audience interpretation', 'unexpected result'], 'traveler is already participating in event'), 'contest', {
  contest: scene('contest', 'Three Calls, One Real Bird', 'A small fair runs a whistle contest. Contestants imitate a lark, a thrush, and a kettle. Wind carries the notes toward the trees, where an actual bird answers.', [
    { id: 'listenToBird', label: 'Listen before choosing a call', next: 'listening' },
    { id: 'imitateKettle', label: 'Enter with the kettle call', next: 'round' },
    { id: 'watchJudges', label: 'Ask how the judges score it', next: 'rules' },
  ]),
  listening: scene('listening', 'A Reply from the Hedgerow', 'The bird’s answer comes twice, each time after a pause. The judges cannot tell whether a contestant caused it or only happened to whistle nearby.', [
    { id: 'repeatCall', label: 'Answer the bird with a lark call', next: 'round', effects: { knowledge: ['At the roadside whistle contest, a real bird answered some imitations from the hedgerow.'] } },
    { id: 'tellJudgesUncertain', label: 'Tell the judges the answer is uncertain', next: 'scoring' },
  ]),
  rules: scene('rules', 'A Rule That Needs an Ear', 'The judges score resemblance, not volume. One judge admits the wind has made it hard to hear the contestants from the table.', [
    { id: 'moveJudges', label: 'Move the judges closer to the line', next: 'round' },
    { id: 'pauseContest', label: 'Pause until the gusts ease', next: 'scoring' },
  ]),
  round: scene('round', 'The Kettle Call', 'Your kettle imitation makes the children laugh, then the bird answers from the hedge. The judges ask whether to score the imitation alone or the whole exchange.', [
    { id: 'scoreImitation', label: 'Ask to score the imitation alone', next: 'fairScore' },
    { id: 'countExchange', label: 'Count the bird’s reply as part of the act', next: 'crowdChoice' },
  ]),
  scoring: scene('scoring', 'A Contest Held for the Right Reason', 'The contestants agree the wind has spoiled a strict contest. The organizer can award no prize, or give a small ribbon to the most amusing call.', [
    { id: 'awardAmusing', label: 'Award the ribbon for amusement', next: 'ribbon' },
    { id: 'cancelScoring', label: 'Cancel the score and keep the game', next: 'game' },
  ]),
  fairScore: end('fairScore', 'A Clean Score', 'The judges score only the whistle. You do not win, but the contestants accept the rule and the next round waits for calmer air.'),
  crowdChoice: end('crowdChoice', 'A Duet with the Hedgerow', 'The crowd votes for the bird-and-whistle exchange. The organizer makes no claim that the bird was a contestant; the laugh is the prize.'),
  ribbon: end('ribbon', 'A Ribbon for the Kettle', 'The kettle call wins the small ribbon. The children keep practicing it while the actual bird returns to its own business.'),
  game: end('game', 'A Game without a Score', 'No ribbon is awarded. The fair keeps the whistle line open for anyone who wants to try, and the wind eventually turns.'),
});

export const THE_PAINTED_MULE = story('the-painted-mule', 'The Painted Mule', 'A quiet mule has become the centerpiece of a sign painter’s unfinished advertisement.', T('An inn advertises a painted mule as an attraction, but the animal is a working neighbor’s mule and the owner objects to the claim.', 'mediator', 'humorous/absurd', 'inn courtyard', ['property clarification', 'public demonstration', 'relationship consequence'], 'accidental encounter'), 'courtyard', {
  courtyard: scene('courtyard', 'A Mule in the Sign', 'A painted board outside the inn shows a mule smiling beneath the words “The Happiest Beast in the County.” The real mule stands beside the stable, calm but not smiling; its owner has come to complain.', [
    { id: 'askOwner', label: 'Ask the owner what is wrong', next: 'owner' },
    { id: 'askInnkeeper', label: 'Ask why the sign was made', next: 'innkeeper' },
    { id: 'leaveCourtyard', label: 'Keep out of the dispute', next: 'left' },
  ]),
  owner: scene('owner', 'A Working Animal, Not a Show', 'The owner says the mule is hired to haul flour at dawn. The innkeeper paid for the painting, not permission to promise a public exhibition.', [
    { id: 'suggestRemovePromise', label: 'Suggest changing the words on the board', next: 'revision' },
    { id: 'offerQuietViewing', label: 'Offer a brief look without a show', next: 'viewing' },
  ]),
  innkeeper: scene('innkeeper', 'A Promise the Innkeeper Cannot Make', 'The innkeeper hoped a curious crowd would buy supper. He did not ask the mule’s owner first, and now the owner refuses to lend the animal for the display.', [
    { id: 'pointToOwner', label: 'Tell the innkeeper to ask permission', next: 'revision' },
    { id: 'offerNewAttraction', label: 'Suggest a story about the sign itself', next: 'story' },
  ]),
  revision: scene('revision', 'A Different Advertisement', 'The painter can cover the boast with a simple line: “A mule that works here.” The owner agrees to that wording. The innkeeper may still invite customers to supper.', [
    { id: 'paintTruth', label: 'Help paint the truthful wording', next: 'truth' },
    { id: 'removeBoard', label: 'Take the sign down for now', next: 'down' },
  ]),
  viewing: end('viewing', 'A Mule Left in Peace', 'The owner lets a few children see the mule from the stable gate, without touching or delaying it. The animal returns to its feed, and the innkeeper serves supper without charging admission.'),
  story: end('story', 'The Sign Becomes the Story', 'The innkeeper tells visitors how the boast was corrected. Some laugh; the mule goes to work at dawn without becoming a show.'),
  truth: end('truth', 'A Working Mule', 'The sign now describes the mule without promising an act. The owner thanks the painter, and the innkeeper keeps a modest advertisement for his supper.'),
  down: end('down', 'A Board Put Away', 'The sign comes down. The innkeeper loses the crowd he hoped to attract, but the mule is not made to perform for a promise nobody authorized.'),
  left: end('left', 'A Dispute Outside the Inn', 'You leave before the owner and innkeeper settle the sign. The mule is still in its stall, and the work at dawn remains the owner’s concern.'),
});

export const THE_TIN_CAN_ORCHESTRA = story('the-tin-can-orchestra', 'The Tin-Can Orchestra', 'A street band has one hour to make music before the parade turns the corner.', T('Children use household tins as instruments, but the parade marshal wants them silenced while the bandleader wants the noise included.', 'participant', 'humorous/absurd', 'town street', ['sound arrangement', 'public event timing', 'group performance'], 'traveler is caught in crowd'), 'parade', {
  parade: scene('parade', 'A Beat from the Curb', 'A group of children play a marching rhythm on empty tins beside the parade route. Their adult bandleader wants them in the procession; the marshal worries they will drown out the town bell.', [
    { id: 'askMarshalTiming', label: 'Ask when the town bell will ring', next: 'bell' },
    { id: 'helpArrangeRhythm', label: 'Help the children find a steady beat', next: 'practice' },
    { id: 'leaveRoute', label: 'Move away from the parade line', next: 'left' },
  ]),
  bell: scene('bell', 'A Quiet Minute', 'The bell marks the start of the parade, then the route turns away from the curb. The marshal says the children could play once the bell has finished.', [
    { id: 'proposeBellThenBand', label: 'Suggest the tins begin after the bell', next: 'practice' },
    { id: 'keepChildrenOffRoute', label: 'Keep the group on the curb', next: 'curb' },
  ]),
  practice: scene('practice', 'A Rhythm That Leaves Space', 'The children can play a soft beat between bell strokes, or wait until the bell has rung and march behind the town band. The bandleader offers no guarantee the marshal will approve.', [
    { id: 'waitForBell', label: 'Wait until the bell has finished', next: 'procession' },
    { id: 'playBetweenStrokes', label: 'Try a quiet beat between strokes', next: 'test' },
  ]),
  test: scene('test', 'The Bell Rings', 'The tin rhythm begins too early. The bell is still audible, but the marshal raises a hand. The children stop at once and look to the bandleader.', [
    { id: 'admitMistiming', label: 'Admit the group began too soon', next: 'curb' },
    { id: 'askForSecondTry', label: 'Ask to join behind the next band', next: 'procession' },
  ]),
  procession: end('procession', 'A Place Behind the Band', 'The children march behind the town band after the bell. Their tins keep time without covering the music, and the marshal gives them a place in next year’s route.'),
  curb: end('curb', 'Music from the Curb', 'The children play from the curb after the bell. The parade passes, the town band remains audible, and the group keeps its own small audience.'),
  left: end('left', 'Another Street, Another Sound', 'You leave the parade route. The tins continue a little longer, then the children follow their bandleader toward the green.'),
});

export const THE_TILT_TABLE = story('the-tilt-table', 'The Tilt Table', 'A traveling demonstrator’s marvelous balance table is held level by a loose wedge.', T('A traveling exhibitor’s balancing table only works because an unnoticed wedge compensates for a sloping floor; the traveler can expose or improve the trick.', 'skeptic', 'humorous/absurd', 'town exhibition room', ['demonstration', 'hidden mundane cause', 'honesty choice'], 'traveler sees unusual demonstration'), 'table', {
  table: scene('table', 'The Impossible Balance', 'A demonstrator rolls a wooden ball around a tilted table without letting it fall. He calls the table self-leveling. You notice one leg stands on a folded card.', [
    { id: 'watchAnotherTrial', label: 'Watch one more trial', next: 'trial' },
    { id: 'quietlyAskAboutLeg', label: 'Ask the demonstrator about the card', next: 'aside' },
    { id: 'callOutTheTrick', label: 'Point out the folded card publicly', next: 'public' },
  ]),
  trial: scene('trial', 'The Ball Holds Its Course', 'The ball stays near the center. A child presses the table’s edge, and the card slips half an inch; the ball rolls toward the low side.', [
    { id: 'catchBall', label: 'Catch the ball before it falls', next: 'aside' },
    { id: 'letTrialShow', label: 'Let the trial finish honestly', next: 'public' },
  ]),
  aside: scene('aside', 'A Wedge, Not a Wonder', 'The demonstrator admits the floor is uneven. The card compensates for it, but he called the table self-leveling to draw a crowd. He asks for a chance to explain before you say more.', [
    { id: 'askForCorrection', label: 'Ask him to correct the claim', next: 'corrected' },
    { id: 'helpSetTable', label: 'Help find a proper wooden shim', next: 'shim' },
    { id: 'keepQuiet', label: 'Leave without exposing him', next: 'quiet' },
  ]),
  public: scene('public', 'The Demonstration Pauses', 'The ball rolls off and the crowd sees the card. The demonstrator looks embarrassed, then says the table works only when level.', [
    { id: 'giveHimRoom', label: 'Give him room to explain', next: 'corrected' },
    { id: 'askToTestOnLevelFloor', label: 'Suggest trying it on level ground', next: 'shim' },
  ]),
  corrected: end('corrected', 'A Claim Made Smaller', 'The demonstrator changes the handbill to say the table needs a level floor. The crowd thins, but the remaining visitors ask real questions about the rolling ball.'),
  shim: end('shim', 'A Useful Demonstration', 'A proper shim steadies the table. The ball follows the groove as promised, but the demonstrator now explains what the device does—and what it does not do.'),
  quiet: end('quiet', 'A Wedge Left in Place', 'You leave the card where it is. The show continues, and you decide not to turn a small exaggeration into a public dispute.'),
});

export const COMPETITION_SURPRISE_ADVENTURES = [
  THE_THREE_RING_TOSS, THE_LAST_VERSE_CONTEST, THE_CLOCKMAKERS_DEMONSTRATION,
  THE_BELL_RINGER_TRIAL, THE_PIE_WITH_NO_RECIPE, THE_PAINTED_SIGN,
  THE_WHISTLE_AND_THE_WIND, THE_PAINTED_MULE, THE_TIN_CAN_ORCHESTRA, THE_TILT_TABLE,
];
