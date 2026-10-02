import { anthologyEnd as end, anthologyScene as scene, anthologyStory as story, anthologyTags as tags } from './surpriseAnthologyTools';

const T = (hook: string, activity: string[], role: string, setting: string, structures: string[], entry: string, rewards = ['narrative-only payoff']) => tags({
  hook, activities: activity, role: ({ helper: 'helper/rescuer', visitor: 'guest' } as Record<string, string>)[role] ?? role, tone: 'humorous/absurd', risk: 'LOW', setting, structures, entry, rewards,
  consequences: ['time/opportunity', 'relationship'],
});

export const THE_DOORWAY_DELIVERY = story('the-doorway-delivery', 'The Doorway Delivery', 'A wardrobe fits the stairwell, the room, and neither doorway at once.', T('A boarding-house wardrobe wedges diagonally at a landing; the traveler helps its owners choose between dismantling, changing route, or leaving it for morning.', ['puzzle/problem-solving', 'social interaction'], 'helper', 'boarding house stairwell', ['spatial puzzle', 'competing preferences', 'physical improvisation'], 'accidental encounter'), 'landing', {
  landing: scene('landing', 'A Wardrobe at the Turn', 'Two movers have brought a narrow wardrobe up the boarding-house stairs. It clears the straight passage but catches at the landing turn; the upstairs room is empty, and the downstairs hall remains open. The owner wants it upstairs before a paying guest arrives.', [
    { id: 'inspect', label: 'Look at the landing and doorways', next: 'measure' },
    { id: 'askOwner', label: 'Ask what may be taken apart', next: 'terms' },
    { id: 'leave', label: 'Let the movers solve it', next: 'leave' },
  ]),
  measure: scene('measure', 'A Turn Measured Twice', 'The wardrobe is only an inch too wide when upright. Its top panel is screwed on; the movers can remove it, but the owner worries the old wood may split.', [
    { id: 'removeTop', label: 'Help remove the top panel', next: 'panel' },
    { id: 'tryFlat', label: 'Turn the wardrobe on its side', next: 'side' },
  ]),
  terms: scene('terms', 'A Room Before Supper', 'The owner says the guest arrives at supper. The movers can wait until then, but their next job is across town and they have already been paid for this stair.', [
    { id: 'panelWithPermission', label: 'Ask permission to remove the top', next: 'panel' },
    { id: 'takeOtherRoute', label: 'Check the wider back entrance', next: 'back' },
  ]),
  panel: scene('panel', 'One Screw Too Tight', 'The panel comes free after a careful turn. A small chip breaks from an old corner, but the wardrobe clears the landing and the owner accepts the repair rather than blaming the movers.', [
    { id: 'reassemble', label: 'Help fit the panel upstairs', next: 'upstairs' },
    { id: 'leaveMenders', label: 'Leave the repair to its owner', next: 'upstairs' },
  ]),
  side: end('side', 'A Narrow Victory', 'The wardrobe turns on its side and clears the stair, though the movers need a rest before carrying it into the room. The owner thanks you for finding the angle; the next guest will have to wait a few minutes.'),
  back: end('back', 'Around the House', 'The rear entrance is wider, but reaching it means carrying the wardrobe down again. The movers take the longer route, and the owner loses the supper deadline rather than risk the old panel.'),
  upstairs: end('upstairs', 'The Room Is Ready', 'The wardrobe stands upstairs with its panel fitted. The owner pays the movers as agreed; the small chip is visible only when the door is open.'),
  leave: end('leave', 'A Problem Left at the Landing', 'You leave the movers to their work. They lower the wardrobe safely to the hall and decide to return with a smaller handcart.'),
});

export const THE_QUEUE_WITH_TWO_ENDS = story('the-queue-with-two-ends', 'The Queue with Two Ends', 'Two lines meet at a window, and everyone insists they arrived first.', T('A post-office queue bends around a partition so two groups each believe they are at its head; the traveler helps establish a fair order without pretending to know who arrived first.', ['social interaction', 'puzzle/problem-solving'], 'mediator', 'post office', ['queue geometry', 'fair procedure', 'witnessed order'], 'accidental encounter'), 'window', {
  window: scene('window', 'Two First Places', 'At the post office, one line begins at the counter and another at the far side of a screen. The clerk has been serving both ends in turn; now two customers each say they were next. A parcel window closes at noon.', [
    { id: 'askClerk', label: 'Ask how the two lines began', next: 'account' },
    { id: 'suggestOneLine', label: 'Suggest joining the lines', next: 'join' },
    { id: 'skipQueue', label: 'Take your own letter elsewhere', next: 'leave' },
  ]),
  account: scene('account', 'The Screen Came First', 'The clerk says the second line formed when the screen was moved yesterday. Neither customer saw the other arrive, and the people behind them have been waiting quietly.', [
    { id: 'takeTurns', label: 'Let each line advance in turn', next: 'turns' },
    { id: 'askWitnesses', label: 'Ask who has waited longest', next: 'witnesses' },
  ]),
  join: scene('join', 'A Line with One Beginning', 'The two heads meet politely, then both customers step forward at once. The clerk asks for a rule that will not require anyone to surrender a place they can prove.', [
    { id: 'alternate', label: 'Alternate customers from each side', next: 'turns' },
    { id: 'numberedSlips', label: 'Ask the clerk to mark the order', next: 'slips' },
  ]),
  witnesses: scene('witnesses', 'A Patient Witness', 'A woman near the stove saw one line begin before the other, but cannot say which of the two customers joined first. She remembers the line at the counter was already there.', [
    { id: 'useKnownFact', label: 'Give the counter line the next place', next: 'turns', effects: { knowledge: ['At the post office, the counter line began before the screen-side line, though the two disputed customers’ arrival order was unknown.'] } },
    { id: 'avoidVerdict', label: 'Use alternating turns instead', next: 'turns' },
  ]),
  turns: scene('turns', 'One Parcel at a Time', 'The clerk serves one person from each line in turn. The noon window stays open a little longer, and the customers stop arguing long enough to compare addresses.', [
    { id: 'stayToHelp', label: 'Stay until the parcel window closes', next: 'order' },
    { id: 'moveOn', label: 'Leave once the rule is working', next: 'order' },
  ]),
  slips: end('slips', 'A Marked Order', 'The clerk writes numbered slips for the remaining customers. The disputed pair still cannot prove who arrived first, but neither loses a place; tomorrow the screen will be moved.'),
  order: end('order', 'A Queue That Holds', 'The line moves at last. The clerk thanks you for finding a rule instead of declaring a winner, and the noon parcel is accepted before the window shuts.'),
  leave: end('leave', 'Your Letter Can Wait', 'You carry your letter to the station instead. Behind you, the clerk keeps serving the two lines in turn.'),
});

export const THE_CLERKS_SECOND_STAMP = story('the-clerks-second-stamp', 'The Clerk’s Second Stamp', 'A perfectly good form has been stamped in the wrong place—twice.', T('A county clerk stamps a traveler’s routine lodging certificate in the wrong box, then repeats the error; the traveler chooses whether to insist, explain, or accept a slower correction.', ['communication/witness', 'social interaction'], 'visitor', 'county office', ['procedural comedy', 'record correction', 'consequence follow-through'], 'accidental encounter'), 'counter', {
  counter: scene('counter', 'Two Marks and No Signature', 'The clerk stamps your lodging certificate where the witness signature belongs. Trying to correct it, they stamp the same box again. The form is still readable, but the innkeeper needs a clean copy by evening.', [
    { id: 'askForNewCopy', label: 'Ask for a clean copy', next: 'copy' },
    { id: 'explainNeed', label: 'Explain what the innkeeper requires', next: 'purpose' },
    { id: 'acceptForm', label: 'Take the marked form as it is', next: 'accepted' },
  ]),
  copy: scene('copy', 'The Last Sheet', 'The clerk has one blank sheet left and is saving it for the afternoon register. They offer to scrape the ink from your form, though the paper may thin.', [
    { id: 'scrape', label: 'Let the clerk scrape the ink carefully', next: 'scraped' },
    { id: 'wait', label: 'Wait for the afternoon paper', next: 'waited' },
  ]),
  purpose: scene('purpose', 'A Form for a Bed', 'The inn needs your name and arrival date, not a witness. The clerk had mistaken the witness line for the traveler’s declaration. You are signing your own check-in record, not certifying anyone else’s.', [
    { id: 'signNow', label: 'Sign the traveler declaration', next: 'signatureCheck' },
    { id: 'keepCopy', label: 'Ask for a note explaining the marks', next: 'note' },
  ]),
  signatureCheck: scene('signatureCheck', 'The Correct Line', 'Before you sign, the clerk lays the form flat and points out the two boxes: one for your own name and arrival date, one for a witness. The ink has not damaged the declaration, but the doubled stamp could still make the innkeeper question it.', [
    { id: 'signCorrectLine', label: 'Sign only your own declaration', next: 'signed' },
    { id: 'askClerkInitial', label: 'Have the clerk initial the stamp error first', next: 'scraped' },
  ]),
  scraped: end('scraped', 'A Thin but Valid Copy', 'The clerk initials the doubled stamp as their own mistake before you sign. The innkeeper gets a usable certificate, and the clerk keeps the corrected copy as a reminder to separate witness and traveler lines.'),
  waited: end('waited', 'One Form after Another', 'You return after the register is copied. The clerk has prepared a clean sheet and now keeps the stamp beside the correct box.'),
  signed: end('signed', 'The Form Was Waiting for a Name', 'Your signature completes only your own check-in declaration. The clerk sets the stamp aside, and the innkeeper receives a valid form instead of a false witness record.'),
  note: end('note', 'A Note beside the Stamps', 'The clerk writes that the doubled marks are their own mistake. You leave with a usable explanation and a story the innkeeper has heard before.'),
  accepted: end('accepted', 'Legible Enough', 'The innkeeper accepts the readable form, though the doubled stamp earns a raised eyebrow. The clerk promises to mark the boxes more clearly for the next traveler.'),
});

export const THE_PATIENT_PIG = story('the-patient-pig', 'The Patient Pig', 'A fair pig refuses to leave the shade, no matter how grand its ribbon.', T('A farmer’s show pig refuses to stand in the sunlit judging lane and settles beside its water trough; the traveler helps the judge assess condition without forcing a performance.', ['animals', 'social interaction'], 'helper', 'county fair livestock pens', ['animal-led pacing', 'fairness question', 'quiet payoff'], 'accidental encounter'), 'pen', {
  pen: scene('pen', 'The Judge Can Wait', 'A broad pink pig lies in the shade beside its water trough. Its owner says it is entered in the fair’s posture class; the judge says the animal need not be dragged into the sun to be seen.', [
    { id: 'askJudgeCriteria', label: 'Ask what the class is meant to judge', next: 'criteria' },
    { id: 'offerShadeView', label: 'Invite the judge to inspect it here', next: 'shade' },
    { id: 'leavePigRest', label: 'Leave the pig to its nap', next: 'left' },
  ]),
  criteria: scene('criteria', 'A Calm Animal', 'The class is meant to reward sound condition and easy handling, not a pose. The pig stands when its owner rattles the feed tin, then lies down again before anyone can admire its profile.', [
    { id: 'judgeHandling', label: 'Ask the owner to show calm handling', next: 'judged' },
    { id: 'changeClass', label: 'Suggest judging condition in the shade', next: 'shade' },
  ]),
  shade: scene('shade', 'The Trough-side Inspection', 'The judge checks the pig’s clear eyes and steady breathing from the pen. The owner worries the ribbon will look like pity unless the class rule is announced plainly.', [
    { id: 'announceRule', label: 'Ask the judge to explain the rule', next: 'ribbon' },
    { id: 'withdrawEntry', label: 'Let the owner withdraw the pig', next: 'withdrawn' },
  ]),
  judged: end('judged', 'A Ribbon for Good Sense', 'The judge awards the pig a ribbon for calm handling, not for standing still. The owner pins it to the pen rail, and the pig remains exactly where it chose to be.'),
  ribbon: end('ribbon', 'Shade Counts as a Stage', 'The judge explains the class before awarding a ribbon for sound condition. The owner accepts it without asking the pig to pose, and the shade stays quiet.'),
  withdrawn: end('withdrawn', 'No Ribbon Needed', 'The owner withdraws the entry and keeps the pig beside its water. The fair moves on without a spectacle, and the animal sleeps through the next announcement.'),
  left: end('left', 'The Nap Wins', 'You leave the pen undisturbed. The judge waits for the next animal, while the pig keeps the best place at the fair.'),
});

export const THE_WARDROBE_ON_THE_ROOF = story('the-wardrobe-on-the-roof', 'The Wardrobe on the Roof', 'A gust carries a laundry basket to the roof—not the clothesline.', { ...T('A light wicker laundry basket blows onto a low stable roof; the traveler and its owner choose a safe retrieval method rather than climbing onto weak boards.', ['puzzle/problem-solving', 'social interaction'], 'helper', 'inn stable yard', ['physical retrieval', 'risk assessment', 'property consequence'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'yard', {
  yard: scene('yard', 'A Basket above the Stable', 'A wind gust has caught the wicker basket sideways against the stable’s low porch roof, just above the gutter. Its rim still holds most of the shirts. The near roof corner sags, but the eave is low enough for the owner’s long washroom broom to reach from firm ground; the ladder is lashed to the far wall.', [
    { id: 'fetchBroom', label: 'Fetch the long broom', next: 'broom' },
    { id: 'inspectLadder', label: 'Check the stable ladder', next: 'ladder' },
    { id: 'waitForKeeper', label: 'Ask the stable keeper to help', next: 'keeper' },
  ]),
  broom: scene('broom', 'Just Within Reach', 'From the stable yard, the broom head can catch the basket’s rim at the eave. The roof slopes toward the gutter, so the owner asks you not to drag the wicker across the shingles.', [
    { id: 'steadyPull', label: 'Pull it slowly from below', next: 'saved' },
    { id: 'leaveClothes', label: 'Let the loose clothes fall free', next: 'clothes' },
  ]),
  ladder: scene('ladder', 'A Ladder Too Short', 'The ladder reaches the eaves but not the roof peak. The stable keeper returns and says the boards at the far corner are sound enough to stand on, but the sagging near corner is not.', [
    { id: 'useSoundSide', label: 'Ask the keeper to reach from the sound side', next: 'saved' },
    { id: 'waitWind', label: 'Wait for the gusts to ease', next: 'waited' },
  ]),
  keeper: scene('keeper', 'A Hand from the Stable', 'The keeper braces the ladder below the low eave, staying on its rungs rather than stepping onto the sagging boards. The basket is caught near the gutter, where the broom can reach it.', [
    { id: 'broomNow', label: 'Use the broom from the ladder', next: 'saved' },
    { id: 'lowerClothes', label: 'Lower the basket empty', next: 'clothes' },
  ]),
  saved: end('saved', 'Laundry Returned to Earth', 'The basket slides into the owner’s hands without anyone climbing onto the weak roof. A few shirts need washing again, but the wicker stays whole.'),
  clothes: end('clothes', 'A Windy Laundry Day', 'The clothes are gathered from the yard and rinsed again. The basket cracks when it reaches the ground; its owner laughs, then asks the stable keeper to mend it.'),
  waited: end('waited', 'The Wind Does the Work', 'A gentler gust rolls the basket toward the low eaves. The keeper catches it from the ladder, and nobody has to test the old roof.'),
});

export const THE_HOUSE_WITH_TWO_DOORBELLS = story('the-house-with-two-doorbells', 'The House with Two Doorbells', 'A visitor rings one bell and answers a question meant for the other door.', { ...T('A divided farmhouse has two entrances and two doorbells; neighbors keep mistaking one household’s calls for the other’s, so the traveler helps clarify a shared entry without choosing sides.', ['social interaction', 'communication/witness'], 'visitor', 'farmhouse', ['miscommunication with physical cause', 'shared boundary', 'practical agreement'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'porch', {
  porch: scene('porch', 'Two Bells on One Post', 'A farmhouse has two front doors on either side of a porch post, each with its own bell. A visitor rings the left bell; a woman from the right-hand household opens her door and asks whether the flour has arrived.', [
    { id: 'clarifyDelivery', label: 'Explain which door the visitor rang', next: 'labels' },
    { id: 'askHouseholds', label: 'Ask both households how this began', next: 'accounts' },
    { id: 'leavePorch', label: 'Let the residents sort it out', next: 'left' },
  ]),
  labels: scene('labels', 'A Label at the Post', 'The flour belongs to the left-hand household. The right-hand neighbor has opened the door three times this week because the bells look alike in the dusk.', [
    { id: 'markBells', label: 'Suggest distinct ribbons on the bells', next: 'marked' },
    { id: 'moveOneBell', label: 'Ask whether one bell can be moved', next: 'moved' },
  ]),
  accounts: scene('accounts', 'A Shared Porch, Separate Stores', 'The two households share the porch but not their stores. One bell was added after a broken latch, and the visitor has been using whichever clapper is nearest.', [
    { id: 'offerSimpleMark', label: 'Offer to mark the two bells', next: 'marked' },
    { id: 'askVisitorToCall', label: 'Ask visitors to call out first', next: 'calling' },
  ]),
  marked: end('marked', 'The Right Door Answers', 'A blue ribbon now marks the flour door and a plain cord marks the other. The neighbors agree to keep the porch shared and their deliveries separate.'),
  moved: end('moved', 'One Bell at Each End', 'The households move one bell to its own doorframe. It takes a short afternoon and a few new holes in the wood, but the flour reaches the right kitchen.'),
  calling: end('calling', 'A Voice before the Bell', 'Visitors begin calling the household name before ringing. The residents laugh at the change, though the postman still needs both doors pointed out.'),
  left: end('left', 'A Question for the Neighbors', 'You leave the neighbors to explain their own porch. The visitor waits with the flour sack, and the right-hand door closes again.'),
});

export const THE_TOWN_CLOCKS_ARGUMENT = story('the-town-clocks-argument', 'The Town Clock’s Argument', 'The church clock and the station clock disagree by seven minutes.', T('A town’s church clock and station clock show different times, and residents blame one another for missed market deliveries; the traveler helps establish a practical public time without claiming either clock is perfect.', ['social interaction', 'puzzle/problem-solving'], 'witness', 'town square and station', ['competing reference points', 'public compromise', 'visible follow-through'], 'witnesses incident'), 'square', {
  square: scene('square', 'Seven Minutes Apart', 'The church clock says ten past nine; the station clock says seventeen past. A market cart waits because its driver was told to arrive at nine, and each keeper says the other clock is wrong.', [
    { id: 'comparePocketWatch', label: 'Compare both clocks with the noon bell schedule', next: 'compare' },
    { id: 'askDrivers', label: 'Ask what time the market actually needs', next: 'need' },
    { id: 'leave', label: 'Let the keepers settle their clocks', next: 'leave' },
  ]),
  compare: scene('compare', 'No Noon Bell Yet', 'Your comparison shows only that the clocks differ; you have no reliable watch to declare a winner. A conductor says the station clock is kept to train time, while the market bell governs deliveries.', [
    { id: 'keepTwoTimes', label: 'Keep station and market time distinct', next: 'posted' },
    { id: 'askBellKeeper', label: 'Ask the bell keeper to mark delivery time', next: 'posted' },
  ]),
  need: scene('need', 'A Cart at the Wrong Minute', 'The driver only needs to know when the market gate opens, not which clock is scientifically correct. The keepers can post a note explaining that deliveries follow the market bell.', [
    { id: 'writeNotice', label: 'Help write the delivery notice', next: 'posted' },
    { id: 'waitForBell', label: 'Wait for the market bell', next: 'bell' },
  ]),
  posted: end('posted', 'Time Enough to Deliver', 'A notice names the market bell as the delivery signal and the station clock as train time. The cart unloads without either keeper having to surrender their clock.'),
  bell: end('bell', 'The Bell Settles the Cart', 'The market bell rings, and the driver unloads. The clocks remain seven minutes apart; the town has learned which one matters for this errand.'),
  leave: end('leave', 'Two Clocks Keep Ticking', 'You leave before the keepers agree. The cart waits for the market bell, which is the only time the driver needed.'),
});

export const THE_BAKER_AND_THE_BROWN_PAPER = story('the-baker-and-the-brown-paper', 'The Baker and the Brown Paper', 'A paper parcel smells strongly of cinnamon but contains no cinnamon rolls.', T('A bakery’s brown-paper parcels are mistaken for one another because a helper wraps both in the same way; the traveler tracks labels and customer expectations without assuming theft or dishonesty.', ['puzzle/problem-solving', 'negotiation/trade'], 'helper', 'bakery counter', ['ordinary mix-up', 'provenance check', 'customer consequence'], 'accidental encounter'), 'counter', {
  counter: scene('counter', 'Two Identical Parcels', 'Two brown-paper parcels sit on the bakery counter. One holds cinnamon rolls for the school; the other holds plain buns for the station porter. Both are tied with the same red string, and the porter has arrived first.', [
    { id: 'checkOrderBook', label: 'Check the baker’s order book', next: 'book' },
    { id: 'askAboutSmell', label: 'Ask which parcel smells of spice', next: 'smell' },
    { id: 'takePorterParcel', label: 'Give the porter the nearest parcel', next: 'wrong' },
  ]),
  book: scene('book', 'Names beside the Flour Dust', 'The order book lists the school rolls as six and the porter’s buns as four. One parcel is warm and heavier; the other has a pencil mark under the folded flap, not on the outside.', [
    { id: 'openWithBaker', label: 'Ask the baker to check the contents', next: 'checked' },
    { id: 'readFlap', label: 'Look under the folded paper', next: 'marked' },
  ]),
  smell: scene('smell', 'A Scent through the Paper', 'The warm parcel carries cinnamon, but the baker warns that the spice scent has clung to the wrapping. The school order needs the larger parcel, while the porter asked only for four buns.', [
    { id: 'matchByWeight', label: 'Match the larger parcel to the school', next: 'checked' },
    { id: 'askBaker', label: 'Let the baker confirm each order', next: 'checked' },
  ]),
  checked: end('checked', 'The Right Parcel Goes Out', 'The baker opens each parcel, confirms the counts, and reties them with different knots. The porter leaves with plain buns; the school rolls arrive warm a little later.'),
  marked: end('marked', 'A Mark under the Fold', 'The hidden pencil mark matches the order book. The parcels go to the right customers, and the baker changes the string on the next batch.'),
  wrong: scene('wrong', 'A Small Return Trip', 'The porter opens the parcel and finds cinnamon rolls. He brings it back laughing; the school order is still waiting, and the baker has two plain buns ready to wrap.', [
    { id: 'helpRewrap', label: 'Help rewrap the school rolls', next: 'wrongFixed' },
    { id: 'letBakerFinish', label: 'Let the baker correct the parcels', next: 'wrongDelayed' },
  ]),
  wrongFixed: end('wrongFixed', 'The Right Parcel Goes Out Late', 'The school rolls leave a few minutes late, while the porter takes plain buns. The baker marks the string differently before the next order.'),
  wrongDelayed: end('wrongDelayed', 'A Baker’s Better Labels', 'The baker reties both parcels with different knots and sends the school rolls after the porter. The delivery is late, but nothing is charged twice.'),
});

export const THE_SIXTH_CHAIR = story('the-sixth-chair', 'The Sixth Chair', 'A supper host has five chairs, six guests, and one very determined stool.', { ...T('At a boarding-house supper, an extra guest arrives and the only stool rocks; the traveler helps the host make room without turning seating into a status contest.', ['social interaction', 'puzzle/problem-solving'], 'guest', 'boarding-house dining room', ['resource-sharing', 'social negotiation', 'quiet payoff'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'table', {
  table: scene('table', 'One Seat Short', 'Five chairs stand around the supper table. A sixth guest arrives carrying a small parcel, and the host brings out a three-legged stool that rocks whenever someone leans back.', [
    { id: 'offerYourChair', label: 'Offer your chair and stand', next: 'standing' },
    { id: 'steadyStool', label: 'Find a folded cloth for the stool', next: 'stool' },
    { id: 'askHost', label: 'Ask how the host wants to arrange it', next: 'host' },
  ]),
  standing: scene('standing', 'A Meal at the Wall', 'The guest takes your chair, but the host insists you should eat too. A window ledge is clean and broad enough for a plate, though it leaves you outside the conversation at one end.', [
    { id: 'joinLedge', label: 'Take the plate at the ledge', next: 'meal' },
    { id: 'rotateSeats', label: 'Suggest changing places between courses', next: 'rotating' },
  ]),
  stool: scene('stool', 'A Stable Third Leg', 'A folded cloth steadies the stool. The guest laughs that it is now the most carefully prepared seat in the house, but the host asks them not to lean back.', [
    { id: 'seatGuest', label: 'Let the guest take the steady stool', next: 'meal' },
    { id: 'tradeSeats', label: 'Offer the stool to whoever wants it', next: 'rotating' },
  ]),
  host: scene('host', 'The Host’s Arrangement', 'The host says no one should be made to stand, but the guest is happy to share the table edge. The parcel is fragile and needs a clear corner, so the place setting must move.', [
    { id: 'clearCorner', label: 'Move the parcel to a side shelf', next: 'meal' },
    { id: 'sharePlaces', label: 'Trade seats between courses', next: 'rotating' },
  ]),
  meal: end('meal', 'Enough Room for Supper', 'The guest finds a place and the parcel stays uncrushed. Conversation circles the table more slowly than usual, but the meal is warm and no one is treated as an inconvenience.'),
  rotating: end('rotating', 'A Seat for the Next Course', 'The guests change places when the stew is cleared. Everyone gets a chair for part of supper, and the host stops apologizing for the count.'),
});

export const THE_PIGEON_POSTSCRIPT = story('the-pigeon-postscript', 'The Pigeon Postscript', 'A messenger pigeon arrives with a note attached to the wrong leg.', { ...T('A pigeon reaches a telegraph office with two folded notes tied to one leg; the traveler and clerk must protect the bird and route the messages by their actual addresses.', ['animals', 'communication/witness'], 'witness', 'railway station telegraph office', ['animal care', 'message sorting', 'provenance check'], 'witnesses incident'), depthClass: 'ENCOUNTER' }, 'office', {
  office: scene('office', 'Two Notes, One Bird', 'A gray pigeon settles on the telegraph-office sill. Two small notes are tied loosely to one leg. The clerk recognizes the bird but not the handwriting; the station master says it belongs to a farm beyond the river.', [
    { id: 'freeBird', label: 'Untie the notes and free the pigeon', next: 'notes' },
    { id: 'readAddresses', label: 'Read the outside of each note', next: 'addresses' },
    { id: 'callOwner', label: 'Ask the station master to contact its owner', next: 'owner' },
  ]),
  notes: scene('notes', 'The Bird Has Done Enough', 'The notes come free without tightening the cord. One is addressed to a miller; the other has only a village name. The pigeon drinks from the clerk’s shallow dish and stays by the open window.', [
    { id: 'sortAddresses', label: 'Route the named note to the miller', next: 'sorted' },
    { id: 'waitOwner', label: 'Wait for the owner to identify the second', next: 'identified' },
  ]),
  addresses: scene('addresses', 'A Name and a Place', 'The first note names the miller at the east crossing. The second says only “home.” The clerk will not open private messages without permission, and the bird is free to leave.', [
    { id: 'deliverKnown', label: 'Send the addressed note onward', next: 'sorted' },
    { id: 'leaveSecond', label: 'Leave the unaddressed note sealed', next: 'identified' },
  ]),
  owner: scene('owner', 'A Familiar Flight', 'The station master sends a message to the farm. Before a reply comes, the pigeon hops to the sill and looks out; the notes can travel separately from the bird.', [
    { id: 'openWindow', label: 'Let the pigeon fly home', next: 'identified' },
    { id: 'holdBriefly', label: 'Keep it in the quiet office', next: 'sorted' },
  ]),
  sorted: end('sorted', 'Messages Find Their Way', 'The clerk sends the miller’s note by the next rider and keeps the other sealed for its owner. The pigeon flies from the open sill without carrying a second message by mistake.'),
  identified: end('identified', 'Home Is Not an Address', 'The farm replies that the second note belongs to a neighboring child. The clerk routes both messages correctly, and the pigeon returns to its own loft.'),
});

export const THE_TINSMITHS_TINY_DOOR = story('the-tinsmiths-tiny-door', 'The Tinsmith’s Tiny Door', 'A miniature stove has a door too small for the demonstration spoon.', { ...T('A tinsmith’s scale model stove is displayed with a spoon too large to fit its tiny door; the traveler helps distinguish a useful working model from a showpiece without embarrassing the maker.', ['social interaction', 'negotiation/trade'], 'visitor', 'tinsmith workshop', ['object demonstration', 'expectation correction', 'maker reaction'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'shop', {
  shop: scene('shop', 'A Spoon Outside the Stove', 'A tinsmith shows a miniature stove with a working latch and a tiny chimney. Beside it lies a full-sized spoon that cannot pass through the little door. A customer asks whether the model can actually cook.', [
    { id: 'askMakerPurpose', label: 'Ask what the model is meant to show', next: 'purpose' },
    { id: 'testDoor', label: 'Try the small wooden spoon', next: 'test' },
    { id: 'leaveDisplay', label: 'Leave the demonstration to the maker', next: 'leave' },
  ]),
  purpose: scene('purpose', 'A Pattern, Not a Kitchen', 'The model demonstrates the latch and draft, not a meal. The maker admits the sign says “fully working” because the shopkeeper wanted a simpler phrase.', [
    { id: 'changeSign', label: 'Suggest calling it a working model', next: 'honest' },
    { id: 'showMechanism', label: 'Ask the maker to demonstrate the latch', next: 'demonstrated' },
  ]),
  test: scene('test', 'A Spoon Made for the Model', 'A wooden measuring spoon fits through the little door. It proves the opening works at the model’s scale, but it will not feed a household.', [
    { id: 'explainScale', label: 'Explain the model’s limited purpose', next: 'honest' },
    { id: 'letMakerExplain', label: 'Give the maker room to answer', next: 'demonstrated' },
  ]),
  honest: end('honest', 'A Useful Little Stove', 'The sign now calls it a working model of a stove latch. The customer buys the pattern drawing, not the miniature as a kitchen appliance.'),
  demonstrated: end('demonstrated', 'Small Fire, Clear Purpose', 'The maker demonstrates the draft with a thread of smoke and explains what the model can teach. The customer stays to watch, and the full-sized spoon returns to the counter.'),
  leave: end('leave', 'A Question for the Maker', 'You leave the customer and tinsmith to talk. The miniature remains on the counter, door latched, while the spoon rests beside it.'),
});

export const THE_BARNYARD_WEATHER_REPORT = story('the-barnyard-weather-report', 'The Barnyard Weather Report', 'The rooster crows at noon, and three neighbors want to know what it means.', { ...T('A rooster’s late crow prompts neighbors to claim rain, frost, or merely a hungry bird; the traveler helps separate familiar sayings from evidence as a real cloud line approaches.', ['animals', 'social interaction'], 'witness', 'farmyard', ['folk belief comparison', 'observation', 'low-stakes uncertainty'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'yard', {
  yard: scene('yard', 'A Noon-Day Crow', 'A rooster crows from the fence at noon. One neighbor says it means rain; another says the bird is asking for feed. Over the western ridge, clouds are gathering, but no rain has started.', [
    { id: 'checkSky', label: 'Look toward the ridge', next: 'clouds' },
    { id: 'askKeeper', label: 'Ask the keeper about the rooster', next: 'keeper' },
    { id: 'ignoreSaying', label: 'Carry on with your own day', next: 'leave' },
  ]),
  clouds: scene('clouds', 'Weather You Can See', 'The clouds are moving in, but the rooster gives no better measure than the ridge. The keeper has laundry on the line and asks whether to take it in.', [
    { id: 'takeLaundry', label: 'Help bring in the laundry', next: 'rain' },
    { id: 'watchTenMinutes', label: 'Wait for a clearer sign', next: 'clearing' },
  ]),
  keeper: scene('keeper', 'A Bird with a Routine', 'The rooster often crows when the feed bucket appears. Today the bucket is empty. The keeper can refill it now or wait until the afternoon round.', [
    { id: 'fillBucket', label: 'Help refill the feed bucket', next: 'fed' },
    { id: 'leaveBucket', label: 'Let the keeper keep the routine', next: 'fed' },
  ]),
  rain: end('rain', 'The Laundry Was Right', 'A brief shower crosses the ridge. The clothes are dry under the porch, and the neighbors agree the clouds gave the better warning than the rooster.'),
  clearing: end('clearing', 'No Forecast Required', 'The clouds pass without rain. No one proves the old saying right or wrong, and the rooster returns to pecking at the fence.'),
  fed: end('fed', 'A More Ordinary Explanation', 'The feed bucket is filled, and the rooster settles down. The clouds decide the afternoon for themselves; nobody records the bird as an official forecast.'),
  leave: end('leave', 'A Saying Left in the Yard', 'You continue on while the neighbors debate the bird. The rooster crows once more, apparently without waiting for a vote.'),
});

export const THE_PAPER_MILL_PARADE = story('the-paper-mill-parade', 'The Paper Mill Parade', 'A cart of blank sheets becomes a banner before anyone decides what it should say.', T('A paper mill’s surplus sheets are borrowed for a town parade, but the banner’s wording has not been agreed; the traveler helps the makers avoid turning a blank surface into a public quarrel.', ['social interaction', 'communication/witness'], 'accidental participant', 'paper mill yard and street', ['collective authorship', 'public performance', 'competing messages'], 'accidental encounter'), 'yard', {
  yard: scene('yard', 'A Banner without Words', 'A paper mill lends a long sheet for the children’s parade banner. One group wants “Welcome Home”; another wants the name of the mill. The paper is already stretched between two poles, and the parade starts in an hour.', [
    { id: 'askPurpose', label: 'Ask who the banner is meant to welcome', next: 'purpose' },
    { id: 'suggestTwoSides', label: 'Suggest writing on both sides', next: 'sides' },
    { id: 'leaveBlank', label: 'Let the group decide without you', next: 'left' },
  ]),
  purpose: scene('purpose', 'A Welcome with Room', 'A mill worker has returned after a long illness, but the parade is also raising money for the mill school. Both messages matter to the neighbors, and the sheet is wide enough for one large line.', [
    { id: 'writeWelcome', label: 'Put the welcome first', next: 'welcome' },
    { id: 'askWorker', label: 'Ask the returning worker what they prefer', next: 'worker' },
  ]),
  sides: scene('sides', 'A Banner Has Two Faces', 'The paper can carry one message on each side, but the procession turns twice and the wind may hide whichever face is away from the crowd.', [
    { id: 'alternateRoute', label: 'Turn the banner at each corner', next: 'both' },
    { id: 'oneMessage', label: 'Choose one message for the first pass', next: 'welcome' },
  ]),
  worker: scene('worker', 'The Person Being Welcomed', 'The worker says they would rather not be made the whole parade. They suggest a small welcome on the back and the school’s name on the front.', [
    { id: 'useSuggestion', label: 'Write both messages as suggested', next: 'both' },
    { id: 'respectQuiet', label: 'Keep the welcome small and private', next: 'welcome' },
  ]),
  welcome: end('welcome', 'A Name Carried Home', 'The banner welcomes the returning worker in large letters. They wave from the mill gate, while the school’s collection box remains on the parade table.'),
  both: end('both', 'A Banner Turned Twice', 'The children turn the sheet at the two corners. The welcome appears on one side and the school name on the other; the procession reaches the mill without either group being erased.'),
  left: end('left', 'Blank Paper, Later Words', 'You leave before the wording is settled. The sheet remains stretched between the poles, and the group keeps its hour to decide.'),
});

export const THE_MAYORS_MISSING_GAVEL = story('the-mayors-missing-gavel', 'The Mayor’s Missing Gavel', 'A town meeting cannot begin because nobody agrees what counts as the gavel.', T('A small town meeting’s ceremonial gavel is missing, and each speaker proposes a different substitute; the traveler helps start the meeting without elevating the object into authority.', ['social interaction', 'puzzle/problem-solving'], 'witness', 'town hall', ['procedural absurdity', 'symbol versus function', 'meeting consequence'], 'accidental encounter'), 'hall', {
  hall: scene('hall', 'No Gavel, No Opening', 'The mayor searches the table for a wooden gavel. The meeting concerns a leaking roof at the schoolhouse, but three residents argue that the meeting cannot be called to order without the proper object.', [
    { id: 'askPurpose', label: 'Ask what the meeting must decide', next: 'purpose' },
    { id: 'findObject', label: 'Look for the missing gavel', next: 'search' },
    { id: 'leaveMeeting', label: 'Let the town begin when ready', next: 'leave' },
  ]),
  purpose: scene('purpose', 'A Roof before a Ritual', 'The school roof needs two boards replaced before rain. The mayor says the gavel marks turns to speak; a table bell could serve the same purpose, though one resident calls that improper.', [
    { id: 'useBell', label: 'Use the table bell for speaking turns', next: 'meeting' },
    { id: 'takeTurns', label: 'Ask the mayor to recognize each speaker', next: 'meeting' },
  ]),
  search: scene('search', 'Under the Minutes', 'The gavel is not in the drawer or beneath the minutes. The clerk finds it in a basket of kindling where it was used to press down a warped lid.', [
    { id: 'returnGavel', label: 'Return it to the meeting table', next: 'found' },
    { id: 'keepBell', label: 'Use the bell and leave it there', next: 'meeting' },
  ]),
  meeting: scene('meeting', 'The Roof Gets Its Turn', 'The bell rings clearly enough to mark each speaker. The residents agree on two replacement boards and a work morning; the gavel argument has taken longer than the repair plan.', [
    { id: 'offerLabor', label: 'Offer to carry boards on work morning', next: 'work' },
    { id: 'leavePlan', label: 'Leave the repair to the residents', next: 'plan' },
  ]),
  found: end('found', 'Order Restored, Lid Still Warped', 'The gavel returns to the table, and the meeting approves the roof repair. The clerk replaces the kindling basket lid before anyone borrows the gavel again.'),
  work: end('work', 'A Meeting That Moves', 'The town agrees on the repair and accepts your offer to carry boards. The bell stays on the table; the gavel is returned to its drawer.'),
  plan: end('plan', 'The Roof Is the Business', 'The residents settle the work morning and stop debating the missing tool. The roof still needs repair, but it no longer needs a gavel to be discussed.'),
  leave: end('leave', 'The Meeting Waits', 'You leave before the mayor finds a substitute. Through the open door, the residents are still debating whether a bell counts.'),
});

export const THE_MILKMAN_AND_THE_MOON = story('the-milkman-and-the-moon', 'The Milkman and the Moon', 'A milk cart is sent by moonlight to a house that ordered nothing.', T('A milkman delivers a daily bottle to a darkened house whose residents have left town; the traveler helps determine whether the standing order should continue without assuming the customer forgot to pay.', ['negotiation/trade', 'social interaction'], 'witness', 'town lane', ['routine interrupted', 'service agreement', 'small economic consequence'], 'witnesses incident', ['money/item/knowledge/history possible', 'narrative-only payoff']), 'lane', {
  lane: scene('lane', 'One More Bottle on the Step', 'Near midnight, a milkman leaves a bottle at a dark house. He says the family ordered a bottle each night until the first frost, but the house has been shuttered for three days. The moon lights the lane; no one answers the door.', [
    { id: 'checkNotice', label: 'Look for a departure note', next: 'notice' },
    { id: 'askMilkman', label: 'Ask how the standing order works', next: 'terms' },
    { id: 'leaveBottle', label: 'Leave the bottle for morning', next: 'left' },
  ]),
  notice: scene('notice', 'A Note under the Latch', 'A note says the family has gone to visit relatives, but gives no return date. The milkman can stop delivery or leave one more bottle for a neighbor who has been feeding their cat.', [
    { id: 'leaveNeighbor', label: 'Ask the neighbor to take the bottle', next: 'neighbor' },
    { id: 'stopOrder', label: 'Ask the milkman to pause delivery', next: 'paused' },
  ]),
  terms: scene('terms', 'Paid by the Month', 'The family paid through the week. The milkman does not want to waste good milk, and the neighbor would rather not accept a favor that looks like a bill.', [
    { id: 'offerNeighbor', label: 'Ask whether the neighbor wants tonight’s bottle', next: 'neighbor' },
    { id: 'carryBack', label: 'Help return it to the dairy', next: 'returned' },
  ]),
  neighbor: scene('neighbor', 'A Bottle for the Cat-Sitter', 'The neighbor accepts the bottle for the cat’s morning porridge and leaves a note for the family. The milkman asks whether to resume the order when the house opens again.', [
    { id: 'resumeLater', label: 'Leave resumption for the family to decide', next: 'resumed' },
    { id: 'endOrder', label: 'End the order until they return', next: 'paused' },
  ]),
  returned: end('returned', 'No Milk Wasted', 'The milk returns to the dairy before dawn. The milkman records the pause rather than charging an empty house for another night.'),
  resumed: end('resumed', 'A Note beneath the Bottle', 'The neighbor leaves a note, and the milkman pauses future deliveries until the family returns. The last bottle finds a use without creating a new obligation.'),
  paused: end('paused', 'The Moonlit Route Changes', 'The milkman crosses the house off tonight’s route and saves the paid balance for the family’s return. The dark windows no longer decide the order by themselves.'),
  left: end('left', 'A Bottle at the Quiet Door', 'You leave the milkman to finish his route. The bottle stays on the step until morning, and the moon gives no answer about when the house will open.'),
});

export const THE_COURT_OF_THE_COURTYARD = story('the-court-of-the-courtyard', 'The Court of the Courtyard', 'Two neighbors hold a trial over a chicken’s preferred doorstep.', T('Two neighboring households argue over a hen that repeatedly lays eggs on the same doorstep; the traveler helps distinguish where the hen wanders from who owns it.', ['animals', 'negotiation/trade'], 'mediator', 'shared farmhouse courtyard', ['comic ownership hearing', 'evidence limits', 'practical agreement'], 'accidental encounter'), 'yard', {
  yard: scene('yard', 'An Egg at the Threshold', 'A brown hen lays an egg on the doorstep between two adjoining farm kitchens. One neighbor says the hen is theirs because it answers their call; the other says it has slept in their coop for a week.', [
    { id: 'inspectMark', label: 'Look for a mark on the hen', next: 'mark' },
    { id: 'askNeighbors', label: 'Hear how each cares for it', next: 'care' },
    { id: 'leaveDispute', label: 'Leave the neighbors to decide', next: 'left' },
  ]),
  mark: scene('mark', 'No Mark to Settle It', 'The hen has no band or clipped feather. It follows the neighbor carrying grain, then turns toward the open coop where it slept last night.', [
    { id: 'admitLimits', label: 'Say behavior cannot prove ownership', next: 'agreement' },
    { id: 'followHen', label: 'Watch where it settles at dusk', next: 'settles' },
  ]),
  care: scene('care', 'Two Feed Pails', 'One neighbor feeds the hen each morning; the other lets it sleep in the coop when rain comes. Neither has kept a count of eggs, and both have cared for it.', [
    { id: 'shareCare', label: 'Suggest sharing feed and eggs', next: 'agreement' },
    { id: 'askPastOwner', label: 'Ask who brought it to the yard', next: 'origin' },
  ]),
  settles: scene('settles', 'The Hen Chooses a Roof', 'At dusk the hen enters the open coop beside the second kitchen. That shows where it prefers to roost tonight, not who bought it or where it will lay tomorrow.', [
    { id: 'recordRoost', label: 'Treat tonight’s coop as temporary', next: 'agreement' },
    { id: 'closeCoop', label: 'Ask both neighbors to close their doors', next: 'agreement' },
  ]),
  origin: scene('origin', 'A Gift Remembered Differently', 'A child recalls that an aunt brought the hen last spring, but cannot remember which household received it. The neighbors laugh at the courtroom they have made of a doorstep.', [
    { id: 'shareCareOrigin', label: 'Suggest sharing care until the aunt is asked', next: 'agreement' },
    { id: 'leaveQuestion', label: 'Leave ownership open for now', next: 'settles' },
  ]),
  agreement: end('agreement', 'A Hen without a Verdict', 'The neighbors agree the hen may use either coop and will share any eggs found at the threshold until they ask the aunt. The bird leaves the doorstep before the next hearing begins.'),
  left: end('left', 'The Hen Keeps Its Own Counsel', 'You leave the neighbors with no verdict. The hen walks between both kitchens, beyond the reach of either argument.'),
});

export const THE_DRYING_ROOM_SCHEDULE = story('the-drying-room-schedule', 'The Drying Room Schedule', 'Every traveler has hung a coat on the same peg and claims an earlier turn.', T('A boarding-house drying room has one warm rack and too many wet garments; the traveler helps devise a safe order that respects actual occupancy and prevents a damp-coat quarrel.', ['social interaction', 'puzzle/problem-solving'], 'guest', 'boarding-house laundry', ['shared resource allocation', 'visible time tradeoff', 'practical payoff'], 'stranded during travel'), 'room', {
  room: scene('room', 'One Rack, Six Coats', 'Rain has soaked six travelers’ coats. The drying room has one rack above a warm stove, and its keeper says nothing should hang close enough to touch the stovepipe. Two guests claim they put their coats up first.', [
    { id: 'askKeeper', label: 'Ask how the room is normally shared', next: 'rules' },
    { id: 'inspectRack', label: 'See how much space is safe', next: 'space' },
    { id: 'dryElsewhere', label: 'Keep your own coat by the door', next: 'leave' },
  ]),
  rules: scene('rules', 'A Turn by the Stove', 'The keeper usually turns the rack every hour. Tonight, guests keep moving coats back toward the warmest side, and the stove pipe must remain clear.', [
    { id: 'markTurns', label: 'Mark an hour for each group', next: 'schedule' },
    { id: 'hangLightThings', label: 'Hang lighter garments first', next: 'light' },
  ]),
  space: scene('space', 'The Warmest Peg', 'There is room for three coats if they hang apart. The other three can use pegs by the door; they will dry more slowly but remain away from the stove.', [
    { id: 'rotateGroups', label: 'Rotate the two groups by the hour', next: 'schedule' },
    { id: 'prioritizeCold', label: 'Give the rack to those most chilled', next: 'priority' },
  ]),
  priority: scene('priority', 'Cold Hands First', 'A child and an older traveler are shivering; neither asked for the warmest place. The other guests say they can wait, but the rack will not dry every coat before morning.', [
    { id: 'offerRack', label: 'Give them the first turn', next: 'schedule' },
    { id: 'shareStoveSide', label: 'Keep the turns equal', next: 'schedule' },
  ]),
  schedule: end('schedule', 'A Rack with a Rule', 'The coats dry in turns, and the stove pipe remains clear. Some sleeves are still damp at dawn, but no one has to pretend their coat was first.'),
  light: end('light', 'The Sleeves Dry First', 'The lighter garments take the rack first while heavy coats wait at the door. The keeper writes down the order for tomorrow’s rain.'),
  leave: end('leave', 'A Coat Left to the Air', 'You leave your coat by the door and let the guests settle their own turns. The room remains warm, but the sleeves dry slowly.'),
});

export const THE_SHEEP_COUNTING_EXAM = story('the-sheep-counting-exam', 'The Sheep-Counting Exam', 'A shepherd asks for a count; the sheep keep changing the answer.', { ...T('A shepherd needs a reliable headcount before dusk, but sheep pass behind a low hedge and reappear; the traveler chooses a counting method and sees why the first tally failed.', ['animals', 'puzzle/problem-solving'], 'helper', 'hill pasture', ['observation puzzle', 'method comparison', 'earned confidence'], 'hired/posted work'), depthClass: 'ENCOUNTER' }, 'pasture', {
  pasture: scene('pasture', 'A Number That Will Not Sit Still', 'A shepherd asks you to count the flock before the gate is closed. Sheep drift behind a low hedge and reappear at the far end; none are missing, but the count changes every time you begin again.', [
    { id: 'countAtGate', label: 'Count each sheep through the gate', next: 'gate' },
    { id: 'markGroups', label: 'Count in small groups by the hedge', next: 'groups' },
    { id: 'guessTotal', label: 'Give the best number you have', next: 'guess' },
  ]),
  gate: scene('gate', 'One Sheep at a Time', 'The flock bunches at the gate. A lamb turns back toward its mother, and the shepherd pauses the count so no animal is pushed through alone.', [
    { id: 'openWide', label: 'Open the wider pasture gate', next: 'counted' },
    { id: 'letShepherdLead', label: 'Let the shepherd lead the flock', next: 'counted' },
  ]),
  groups: scene('groups', 'A Chalk Mark for Each Group', 'You mark each group on the fence rail as it clears the hedge. The sheep keep moving, but the shepherd can see which side has already been counted.', [
    { id: 'verifyOnce', label: 'Check the last group once more', next: 'counted' },
    { id: 'closeGate', label: 'Close the gate after the count', next: 'counted' },
  ]),
  counted: end('counted', 'A Flock Accounted For', 'The shepherd confirms the count after every sheep reaches the near pasture. Your first number was less useful than the method that made the flock visible.'),
  guess: end('guess', 'A Number with an Asterisk', 'The shepherd counts again and finds two sheep behind the hedge. Your estimate is close, but the gate stays open until the flock is accounted for.'),
});

export const THE_PEARL_BUTTON = story('the-pearl-button', 'The Pearl Button', 'A tailor’s customer has lost one button and gained three opinions.', { ...T('A tailor’s customer finds a missing pearl-colored button in a coat pocket, but it does not match the other buttons; the traveler helps decide whether to replace, disclose, or keep the repair modest.', ['negotiation/trade', 'social interaction'], 'witness', 'tailor shop', ['craft judgment', 'expectation mismatch', 'honest service'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'shop', {
  shop: scene('shop', 'One Button from Another Coat', 'A tailor finds a pearl-colored button in a customer’s coat pocket after replacing a missing one. The other buttons are dark horn. The customer has not seen the repair yet; the tailor is unsure whether to charge for a matching set.', [
    { id: 'askCustomer', label: 'Ask what the customer expected', next: 'expectation' },
    { id: 'inspectButtons', label: 'Compare the new button with the old ones', next: 'comparison' },
    { id: 'stayOut', label: 'Leave the tailor to explain the repair', next: 'leave' },
  ]),
  expectation: scene('expectation', 'A Coat for Work', 'The customer wants the coat for work tomorrow and cares more that it closes than that every button matches. The tailor has a dark horn button in the drawer, but it is slightly larger.', [
    { id: 'offerChoice', label: 'Let the customer choose the button', next: 'chosen' },
    { id: 'usePearl', label: 'Explain why the pearl button was used', next: 'disclosed' },
  ]),
  comparison: scene('comparison', 'A Difference in Size', 'The pearl button is smaller and slips through the buttonhole. The horn button fits better, though its edge is worn; either can be sewn on before the customer leaves.', [
    { id: 'useHorn', label: 'Recommend the better-fitting horn button', next: 'chosen' },
    { id: 'showBoth', label: 'Show both buttons to the customer', next: 'disclosed' },
  ]),
  chosen: end('chosen', 'A Button Chosen in Daylight', 'The customer chooses the horn button and pays for one repair, not a whole new set. The tailor saves the pearl button for a garment that can use it.'),
  disclosed: end('disclosed', 'No Surprise under the Collar', 'The customer sees the pearl button before leaving and agrees to keep it for the night. The tailor promises to sew a matching horn button tomorrow without charging twice.'),
  leave: end('leave', 'A Small Repair Left to Its Maker', 'The tailor explains the mismatch and offers a replacement. You leave before the customer chooses, and the coat remains on the counter.'),
});

export const THE_WAGON_WHEEL_MEETING = story('the-wagon-wheel-meeting', 'The Wagon-Wheel Meeting', 'A town committee meets in a circle so large no one can hear the middle.', T('Residents gather around a wagon wheel to discuss a shared road repair, but the circle and the wheel both make speaking difficult; the traveler helps the group make a usable plan without becoming its chairperson.', ['social interaction', 'communication/witness'], 'witness', 'roadside green', ['group conversation', 'meeting format problem', 'actionable follow-through'], 'accidental encounter'), 'green', {
  green: scene('green', 'A Meeting without a Middle', 'Residents stand around a wagon wheel laid flat on the green. The road foreman speaks from one side, but people on the far side cannot hear. The wheel is meant to mark the broken road section, not to be moved.', [
    { id: 'moveSpeakers', label: 'Bring the speakers closer together', next: 'circle' },
    { id: 'useSpokes', label: 'Give each speaker a turn by the wheel', next: 'spokes' },
    { id: 'leaveMeeting', label: 'Continue down the road', next: 'leave' },
  ]),
  circle: scene('circle', 'A Smaller Circle', 'The group closes in, but the wheel is now between the foreman and the people who need to measure the road. A cart must still pass before the work begins.', [
    { id: 'keepLaneOpen', label: 'Leave a clear lane for the cart', next: 'plan' },
    { id: 'passNotes', label: 'Ask the clerk to repeat each point', next: 'notes' },
  ]),
  spokes: scene('spokes', 'One Spoke at a Time', 'Each resident takes one spoke as a turn to speak. The foreman hears two different estimates of the damaged section and asks for a marker to show where the repair should start.', [
    { id: 'markStart', label: 'Mark the first damaged stone', next: 'plan' },
    { id: 'recordBoth', label: 'Write down both estimates', next: 'notes' },
  ]),
  notes: scene('notes', 'Two Measures, One Road', 'The clerk records both estimates rather than choosing between them. The foreman agrees to inspect the first hundred yards before asking for labor or money.', [
    { id: 'offerWalk', label: 'Walk the first section with the foreman', next: 'plan' },
    { id: 'leaveNotes', label: 'Leave the inspection to the committee', next: 'plan' },
  ]),
  plan: end('plan', 'A Road Meeting with an End', 'The residents agree where to inspect first and keep the cart lane clear. No repair is done at the meeting, but the next step is clear enough for the committee to begin.'),
  leave: end('leave', 'The Wheel Stays on the Green', 'You leave before the group finds a shape that carries voices. The wheel remains where it marks the road, and the residents keep talking.'),
});

export const THE_FERRYMAN_S_SIGN = story('the-ferrymans-sign', 'The Ferryman’s Sign', 'A painted arrow points to a ferry that has moved across the river.', { ...T('A ferryman repaints his landing sign after the river shifts the safe approach; travelers follow the old arrow, and the traveler helps communicate the new route before anyone boards.', ['travel/exploration', 'communication/witness'], 'witness', 'river landing', ['signage correction', 'route discovery', 'preventive consequence'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'landing', {
  landing: scene('landing', 'An Arrow to Empty Shore', 'A weathered sign points down the towpath to the old ferry landing. The boat now leaves from the upstream bank, where a fresh rope is tied to a post. Two travelers are already walking toward the empty shore.', [
    { id: 'callTravelers', label: 'Call out before they reach the old landing', next: 'redirect' },
    { id: 'askFerryman', label: 'Ask why the sign was not changed', next: 'reason' },
    { id: 'followOldSign', label: 'See where the old path leads', next: 'oldLanding' },
  ]),
  redirect: scene('redirect', 'A Longer Walk, the Right Boat', 'The travelers turn back. One is annoyed at losing time; the other says the old landing was closer to their destination.', [
    { id: 'explainSafety', label: 'Point out the new rope and landing', next: 'signFixed' },
    { id: 'offerWalk', label: 'Walk with them to the new landing', next: 'walked' },
  ]),
  reason: scene('reason', 'The River Took the Path', 'A spring flood cut away the old bank. The ferryman has moved upstream but has not yet painted a new sign because the board is drying after repair.', [
    { id: 'turnBoard', label: 'Help turn the sign toward the new path', next: 'signFixed' },
    { id: 'markPath', label: 'Ask the ferryman to mark the towpath', next: 'walked' },
  ]),
  oldLanding: end('oldLanding', 'An Empty Place to Wait', 'The old landing is still visible but no longer reaches the boat. You return to the upstream rope and tell the ferryman what the sign sent you to find.'),
  signFixed: end('signFixed', 'An Arrow That Arrives', 'The sign points to the upstream landing. The travelers reach the right ferry, and the ferryman can spend the afternoon carrying passengers instead of redirecting them.'),
  walked: end('walked', 'A Sign on the Towpath', 'You walk the travelers to the new landing and mark the turn with a strip of pale cloth. The crossing is ordinary again, if a little longer.'),
});

export const THE_BACKWARDS_COURTROOM = story('the-backwards-courtroom', 'The Backwards Courtroom', 'The visiting magistrate sits where the witnesses were meant to stand.', T('A town hall rearranges benches for a visiting magistrate, leaving the presiding chair facing the wrong way; the traveler helps reset the room before a minor fence hearing without confusing ceremony with justice.', ['social interaction', 'puzzle/problem-solving'], 'visitor', 'town hall', ['room-layout problem', 'procedural comedy', 'fair hearing'], 'witnesses incident'), 'hall', {
  hall: scene('hall', 'A Magistrate Facing the Wall', 'The visiting magistrate takes the only high-backed chair and finds it faces the wall. The clerk says the room was rearranged for a lecture last night; the two neighbors waiting over a fence line have already taken the witness bench.', [
    { id: 'askPermission', label: 'Ask the magistrate before moving the chair', next: 'permission' },
    { id: 'inspectRoom', label: 'Look for a simpler seating arrangement', next: 'layout' },
    { id: 'leaveHearing', label: 'Let the clerk arrange the room', next: 'left' },
  ]),
  permission: scene('permission', 'The Chair Is Not the Court', 'The magistrate laughs and says the chair is furniture, not authority. The neighbors still disagree about which side of a stump the fence should pass.', [
    { id: 'turnChair', label: 'Turn the chair toward the room', next: 'seated' },
    { id: 'moveBenches', label: 'Bring the benches around instead', next: 'seated' },
  ]),
  layout: scene('layout', 'A Doorway for the Witnesses', 'Turning the chair would block the door. Moving the two benches leaves a clear path and gives each neighbor a place to speak without sitting behind the magistrate.', [
    { id: 'moveBenchesNow', label: 'Move the benches into a half-circle', next: 'seated' },
    { id: 'askNeighbors', label: 'Ask the neighbors where they can hear', next: 'seated' },
  ]),
  seated: scene('seated', 'The Hearing Begins', 'Everyone can see one another. The magistrate asks each neighbor to describe the stump and the old fence posts before discussing where the new fence should go.', [
    { id: 'stayForHearing', label: 'Stay and hear the first account', next: 'hearing' },
    { id: 'leaveAfterSetup', label: 'Leave once the room is ready', next: 'hearing' },
  ]),
  hearing: end('hearing', 'A Room Facing the Question', 'The neighbors describe the same stump from different sides. The magistrate asks for an old boundary marker before deciding anything; the room no longer has to be rearranged first.'),
  left: end('left', 'Furniture before Testimony', 'You leave the clerk to turn the chair. The neighbors wait with their accounts, and the magistrate’s first ruling is that the lecture benches are uncomfortable.'),
});

export const THE_MISPLACED_PIGEONHOLE = story('the-misplaced-pigeonhole', 'The Misplaced Pigeonhole', 'Every letter for “M” has been placed under “W.”', { ...T('A boarding-house keeper sorts residents’ letters into pigeonholes by room, but a reversed label sends messages to the wrong shelf; the traveler helps correct the system without reading private correspondence.', ['communication/witness', 'puzzle/problem-solving'], 'helper', 'boarding house office', ['information handling', 'privacy restraint', 'system correction'], 'accidental encounter'), depthClass: 'ENCOUNTER' }, 'desk', {
  desk: scene('desk', 'A Shelf Turned Around', 'The boarding-house desk has two rows of letter cubbies. The labels for rooms six and nine were turned when the shelf was moved, so three sealed letters sit in the wrong places. The keeper asks for help before guests arrive.', [
    { id: 'checkLabels', label: 'Compare the room numbers with the register', next: 'register' },
    { id: 'askGuests', label: 'Ask residents to identify their own letters', next: 'residents' },
    { id: 'leaveLetters', label: 'Leave the sealed letters untouched', next: 'left' },
  ]),
  register: scene('register', 'Six and Nine', 'The register confirms which rooms belong to the letters, but the ink on one envelope has run. The keeper says the names remain readable if nobody opens them.', [
    { id: 'sortByRoom', label: 'Move letters by room number only', next: 'sorted' },
    { id: 'holdUnreadable', label: 'Set the blurred address aside', next: 'held' },
  ]),
  residents: scene('residents', 'A Private Collection', 'One resident recognizes their handwriting from the outside. Another asks that their letter not be passed around the desk, even if the name is visible.', [
    { id: 'letEachTake', label: 'Let each resident collect their own', next: 'sorted' },
    { id: 'correctLabels', label: 'Fix the cubby labels first', next: 'held' },
  ]),
  sorted: end('sorted', 'Letters in the Right Rooms', 'The keeper turns the labels and places each sealed letter in the proper cubby. No one opens a message, and the next post can be sorted without repeating the mistake.'),
  held: end('held', 'One Letter Held for Its Owner', 'The blurred letter stays sealed rather than being guessed into the wrong room. The keeper corrects the labels and adds a clear six-or-nine mark to the register, preventing the next batch from repeating the mistake.'),
  left: end('left', 'The Mail Can Wait', 'You leave the sealed letters with the keeper. The labels remain turned, but no private message is opened in the name of haste.'),
});

export const THE_SALUTE_FROM_THE_WRONG_PORCH = story('the-salute-from-the-wrong-porch', 'The Salute from the Wrong Porch', 'Two retired captains wave at every passing wagon, and each thinks the other began it.', T('Two elderly neighbors on facing porches return each other’s salute, each believing it is a greeting from the other; the traveler helps them discover the misunderstanding without mocking either man.', ['social interaction', 'communication/witness'], 'witness', 'town street', ['repeated social signal', 'mutual assumption', 'relationship payoff'], 'accidental encounter'), 'street', {
  street: scene('street', 'A Salute at Every Wagon', 'Two retired captains live on opposite sides of the lane. Each raises a hand whenever a wagon passes; each believes the other began the greeting. A passing driver asks whether the salute is meant for him.', [
    { id: 'askFirstCaptain', label: 'Ask one captain what the salute means', next: 'first' },
    { id: 'askBothTogether', label: 'Ask whether they know one another', next: 'both' },
    { id: 'waveBack', label: 'Return the salute and continue', next: 'wave' },
  ]),
  first: scene('first', 'A Courtesy Returned', 'The first captain says his neighbor began the custom after a long illness. He has kept returning it so the neighbor will know he is seen.', [
    { id: 'shareAccount', label: 'Tell the other captain what he said', next: 'understood' },
    { id: 'askDirectly', label: 'Ask whether they ever spoke about it', next: 'meeting' },
  ]),
  both: scene('both', 'The Same Story Twice', 'They have never agreed who started the salute. Both say they continue it because stopping first would seem unfriendly.', [
    { id: 'introduceThem', label: 'Introduce the two neighbors properly', next: 'meeting' },
    { id: 'leaveCourtesy', label: 'Let the custom remain theirs', next: 'understood' },
  ]),
  meeting: scene('meeting', 'A Greeting without a Wagon', 'The captains meet at the lane gate. They each remember a different first salute, but agree the custom was pleasant and need not be settled like a debt.', [
    { id: 'shareTea', label: 'Let them choose a time to talk', next: 'understood' },
    { id: 'returnRoad', label: 'Leave them to their conversation', next: 'understood' },
  ]),
  understood: end('understood', 'A Salute Kept by Choice', 'The captains keep waving, now knowing neither owes the other an origin story. The driver receives a salute of his own, and the lane feels less formal.'),
  wave: end('wave', 'A Greeting for the Road', 'You return the salute. Both captains answer, each pleased that the custom has acquired one more willing participant.'),
});

export const THE_CANDLE_ENDS = story('the-candle-ends', 'The Candle Ends', 'A shopkeeper’s candle burns down during a disagreement over whether it is still lit.', { ...T('A dim candle’s smoking wick leads a shopkeeper and customer to disagree over whether the candle has failed or is merely smothered; the traveler helps settle a small sale through a fair test.', ['negotiation/trade', 'puzzle/problem-solving'], 'witness', 'general store', ['small product dispute', 'repeatable test', 'fair resolution'], 'buys/sells/trades'), depthClass: 'ENCOUNTER' }, 'counter', {
  counter: scene('counter', 'Smoke without a Flame', 'A customer returns a candle with a blackened wick. The shopkeeper says it was left in a draft; the customer says it went out by itself. The candle is not burning now, and the shop has another from the same batch.', [
    { id: 'inspectWick', label: 'Look at the wick and wax', next: 'inspection' },
    { id: 'askForTest', label: 'Ask to test another candle', next: 'test' },
    { id: 'leaveDispute', label: 'Leave them to settle the return', next: 'left' },
  ]),
  inspection: scene('inspection', 'A Short Wick', 'The wick is nearly consumed and the wax has run unevenly. That could come from a draft or a poor wick; the candle cannot explain which.', [
    { id: 'offerReplacement', label: 'Suggest a replacement from the same batch', next: 'replacement' },
    { id: 'testBatch', label: 'Light another candle under cover', next: 'test' },
  ]),
  test: scene('test', 'A Test out of the Draft', 'The fresh candle burns steadily behind the counter. The shopkeeper admits the returned one may have been defective, and the customer admits the original room was windy.', [
    { id: 'splitCost', label: 'Suggest sharing the cost of a replacement', next: 'replacement' },
    { id: 'replaceGoodwill', label: 'Let the shopkeeper replace it', next: 'goodwill' },
  ]),
  replacement: end('replacement', 'A Candle for Another Evening', 'The shopkeeper replaces the candle at half price. Neither side proves what happened to the first one, but the customer leaves with a usable light and both keep their dignity.'),
  goodwill: end('goodwill', 'A Wick Worth Replacing', 'The shopkeeper replaces the candle without charge and checks the rest of the batch. The customer promises to keep the next one away from the open window.'),
  left: end('left', 'A Small Flame of Disagreement', 'You leave the shop before they settle the return. The candle remains on the counter, unlit, while the next customer enters.'),
});

export const THE_COMEDY_ABSURDITY_ADVENTURES = [
  THE_DOORWAY_DELIVERY, THE_QUEUE_WITH_TWO_ENDS, THE_CLERKS_SECOND_STAMP, THE_PATIENT_PIG,
  THE_WARDROBE_ON_THE_ROOF, THE_HOUSE_WITH_TWO_DOORBELLS, THE_TOWN_CLOCKS_ARGUMENT,
  THE_BAKER_AND_THE_BROWN_PAPER, THE_SIXTH_CHAIR, THE_PIGEON_POSTSCRIPT, THE_TINSMITHS_TINY_DOOR,
  THE_BARNYARD_WEATHER_REPORT, THE_PAPER_MILL_PARADE, THE_MAYORS_MISSING_GAVEL,
  THE_MILKMAN_AND_THE_MOON, THE_COURT_OF_THE_COURTYARD, THE_DRYING_ROOM_SCHEDULE,
  THE_SHEEP_COUNTING_EXAM, THE_PEARL_BUTTON, THE_WAGON_WHEEL_MEETING, THE_FERRYMAN_S_SIGN,
  THE_BACKWARDS_COURTROOM,
  THE_MISPLACED_PIGEONHOLE, THE_SALUTE_FROM_THE_WRONG_PORCH, THE_CANDLE_ENDS,
];
