import { anthologyEnd as end, anthologyScene as scene, anthologyStory as story, anthologyTags as tags } from './surpriseAnthologyTools';
import { NESSA_CONTACT, NESSA_MEAL_FAVOR } from '../travelerContinuity';

const T = (hook: string, activity: string[], role: string, tone: string, setting: string, structures: string[], entry: string, rewards = ['narrative-only payoff']) => tags({ hook, activities: activity, role, tone, risk: 'LOW', setting, structures, entry, rewards, consequences: ['time/opportunity', 'relationship'] });

export const THE_TOAST_NOBODY_ORDERED = story('the-toast-nobody-ordered', 'The Toast Nobody Ordered', 'A wedding supper needs a speaker, but not necessarily the one the room expects.', T('A traveler is mistaken for the absent toast-giver and must decide whether to preserve the couple’s dignity or correct the room.', ['social interaction', 'communication/witness'], 'accidental participant', 'humorous/absurd', 'town inn dining room', ['public performance', 'mistaken identity', 'social consequence'], 'accidental encounter'), 'supper', {
  supper: scene('supper', 'A Glass Raised in Error', 'At a crowded wedding supper, the best man calls you by another name and raises his glass. The couple look nervous, not angry. The room is waiting to hear what you say.', [
    { id: 'correctName', label: 'Quietly correct the mistake', next: 'aside' },
    { id: 'askCouple', label: 'Ask the couple what they prefer', next: 'couple' },
    { id: 'makeToast', label: 'Give a short toast in their honor', next: 'toast' },
    { id: 'leaveSupper', label: 'Step outside before the toast', next: 'outside' },
  ]),
  aside: scene('aside', 'A Private Correction', 'The best man admits he has been trying to remember three introductions at once. The couple can hear you if you speak up, but the room cannot.', [
    { id: 'offerWords', label: 'Offer a few words they can use', next: 'toast', effects: { knowledge: ['At the wedding supper, the couple preferred a brief sincere toast over a formal speech.'] } },
    { id: 'letHimRecover', label: 'Give him room to recover', next: 'recovery' },
  ]),
  couple: scene('couple', 'The Couple’s Choice', 'The bride asks you not to make a show of the mistake. The groom says a small laugh would ease the room. Neither wants a long speech.', [
    { id: 'honorBride', label: 'Keep the toast brief and gentle', next: 'toast', effects: { historyFlags: ['kept_a_wedding_mistake_gentle'] } },
    { id: 'letGroomLaugh', label: 'Acknowledge the mix-up kindly', next: 'recovery' },
  ]),
  toast: scene('toast', 'A Few Honest Words', 'You speak only of the care the couple showed each other while the day ran late. The best man finds the right name at last and raises his glass again.', [
    { id: 'stayForSupper', label: 'Stay while the room answers', next: 'warmEnd' },
    { id: 'stepOutAfterToast', label: 'Leave them the rest of the evening', next: 'quietEnd' },
  ]),
  recovery: end('recovery', 'The Room Finds Its Feet', 'The best man laughs at his own muddle, then gives the toast himself. The couple relax; your small correction kept an awkward moment from becoming the wedding’s story.'),
  warmEnd: end('warmEnd', 'A Toast Remembered Kindly', 'The room answers with raised glasses. The couple thank you later for keeping the words short enough to belong to them.'),
  quietEnd: end('quietEnd', 'A Door Left Open', 'You leave before the dancing begins. Behind you, the supper resumes without making the mistake larger than it was.'),
  outside: end('outside', 'No Speech Required', 'The room finds another speaker while you breathe in the cooler air. The wedding continues, and your absence becomes no one’s grievance.'),
});

export const AN_INVITATION_FOR_SOMEONE_ELSE = story('an-invitation-for-someone-else', 'An Invitation for Someone Else', 'A household has laid a place for a guest who never arrives.', T('A traveler receives hospitality meant for an absent guest and can either correct, use, or gently investigate the mistaken welcome.', ['social interaction', 'negotiation/trade'], 'guest', 'warm/hopeful', 'farmhouse kitchen', ['mistaken identity', 'hospitality choice', 'information reveal'], 'asks for lodging'), 'doorstep', {
  doorstep: scene('doorstep', 'A Place Set by the Door', 'A woman opens the farmhouse door and greets you as if you were expected. A place is set by the stove, and a folded invitation on the table bears a name you do not know.', [
    { id: 'explainMistake', label: 'Tell her she has the wrong traveler', next: 'explanation' },
    { id: 'askAboutGuest', label: 'Ask who the invitation names', next: 'letter' },
    { id: 'acceptMeal', label: 'Accept supper, then explain', next: 'meal' },
    { id: 'declineDoorstep', label: 'Thank her and continue on', next: 'leave' },
  ]),
  explanation: scene('explanation', 'The Expected Guest', 'The name belongs to her brother, who has not written since their last quarrel. She had hoped the invitation would bring him back, but she does not mistake you for him now.', [
    { id: 'offerToCarryNote', label: 'Offer to carry her reply', next: 'note', effects: { historyFlags: ['carried_a_family_reply_after_a_mistaken_invitation'] } },
    { id: 'stayAsTraveler', label: 'Stay only as a passing guest', next: 'meal' },
  ]),
  letter: scene('letter', 'A Name in Ink', 'The invitation asks her brother to come before the first frost. The date has passed. The woman folds it along its old crease and says she would rather not ask a stranger to take sides.', [
    { id: 'askWhatSheWants', label: 'Ask what she would like to happen', next: 'choice' },
    { id: 'leaveLetterAlone', label: 'Respect the silence and stay for supper', next: 'meal' },
  ]),
  choice: scene('choice', 'A Reply Without Pressure', 'She wants him to know the door is open, but not to be summoned. You can help write that distinction or let the invitation stand as it is.', [
    { id: 'writeGentleReply', label: 'Help write a welcoming reply', next: 'note', effects: { knowledge: ['The farmhouse invitation was meant for a brother who may return only by choice.'] } },
    { id: 'declineMessage', label: 'Leave the message to her', next: 'meal' },
  ]),
  note: end('note', 'A Message, Not a Promise', 'She seals the reply herself. Whether it is ever sent is her decision; you have helped make the welcome clear without promising a reunion.'),
  meal: end('meal', 'A Place for a Traveler', 'You share a simple supper, and the empty place remains only a place setting. Your host speaks of ordinary things when she is ready.'),
  leave: end('leave', 'The Road Keeps Its Claim', 'You leave before the meal. The invitation stays on the table, neither answered nor thrown away.'),
});

export const ONE_UMBRELLA_THREE_WALKERS = story('one-umbrella-three-walkers', 'One Umbrella, Three Walkers', 'A sudden shower turns a short walk into a small negotiation.', T('Three travelers share a narrow umbrella and must decide how to move together without treating the least powerful walker as cargo.', ['social interaction', 'travel/exploration'], 'participant', 'humorous/absurd', 'town street', ['shared-resource negotiation', 'group movement', 'quiet payoff'], 'accidental encounter'), 'rain', {
  rain: scene('rain', 'A Narrow Canopy', 'Rain catches you outside the inn. A child carrying a parcel and a broad-shouldered peddler are already sharing one umbrella; there is room for a third if everyone walks close and slowly.', [
    { id: 'joinAndAsk', label: 'Ask to join their walk', next: 'arrangement' },
    { id: 'offerToCarryParcel', label: 'Offer to carry the parcel', next: 'parcel' },
    { id: 'waitRain', label: 'Wait beneath the inn awning', next: 'awning' },
  ]),
  arrangement: scene('arrangement', 'Who Gets the Dry Side?', 'The peddler holds the handle; the child is trying to keep the parcel dry. The street forks toward the schoolhouse and the market, so the group cannot simply walk in one direction.', [
    { id: 'letChildChoose', label: 'Let the child choose the first stop', next: 'school', effects: { historyFlags: ['let_a_younger_traveler_set_the_shared_route'] } },
    { id: 'suggestMarketFirst', label: 'Suggest the market before the school', next: 'market' },
    { id: 'walkAlone', label: 'Thank them and take the open road', next: 'alone' },
  ]),
  parcel: scene('parcel', 'A Parcel Under Cover', 'The child accepts, but the parcel is a stack of paper notices for the school. The peddler says the market is the other way; nobody has to follow your route.', [
    { id: 'schoolFirst', label: 'Walk the notices to the school', next: 'school' },
    { id: 'splitPaths', label: 'Part company at the corner', next: 'part' },
  ]),
  school: end('school', 'Dry Notices, Wet Sleeves', 'The notices reach the school legible. The child laughs at the rain running down your sleeves, and the peddler continues toward the market.'),
  market: end('market', 'A Slightly Crooked Walk', 'The peddler makes it to the market without soaking his wares. The child waits beneath the awning for the shower to soften before heading on.'),
  part: end('part', 'Three Roads, One Canopy', 'You separate at the corner before the umbrella becomes an argument. The parcel stays dry, and each traveler goes where they meant to.'),
  awning: end('awning', 'Rain on the Street', 'The shower passes while you listen to it strike the awning. The other two have already gone, walking at the child’s pace.'),
  alone: end('alone', 'A Wet but Easy Walk', 'You take the road alone. The rain is inconvenient, not a misfortune, and the town carries on around you.'),
});

export const THE_WRONG_NAME_AT_THE_DOOR = story('the-wrong-name-at-the-door', 'The Wrong Name at the Door', 'A stranger mistakes you for the person who owes her an answer.', T('A traveler is mistaken for a missing correspondent and must decide how much to learn before correcting the error.', ['social interaction', 'communication/witness'], 'accidental participant', 'mysterious/eerie', 'boarding house', ['mistaken identity', 'withheld information', 'stateful reveal'], 'accidental encounter'), 'hallway', {
  hallway: scene('hallway', 'A Letter for Mr. Vale', 'A woman in the boarding-house hall presses a sealed letter toward you and says, “You came back.” She notices your confusion, but does not yet know you are not Vale.', [
    { id: 'correctImmediately', label: 'Tell her she has the wrong person', next: 'correction' },
    { id: 'askWhatItIs', label: 'Ask what the letter concerns', next: 'letter' },
    { id: 'acceptLetter', label: 'Take the letter without opening it', next: 'letterTaken' },
    { id: 'leaveHallway', label: 'Decline and go downstairs', next: 'downstairs' },
  ]),
  correction: scene('correction', 'Not the Person She Expected', 'She apologizes. The envelope has no address, only a date from last week. She can keep it or ask you to witness her tearing it up.', [
    { id: 'stayAsWitness', label: 'Stay while she decides', next: 'witness' },
    { id: 'leaveCorrection', label: 'Give her privacy', next: 'downstairs' },
  ]),
  letter: scene('letter', 'A Question in a Sealed Envelope', 'She says Vale promised to answer whether he had told the truth about a departure. She will not open the letter in front of a stranger, and you have no reason to claim you know him.', [
    { id: 'tellHerTruth', label: 'Explain that you are not Vale', next: 'correction' },
    { id: 'askForContext', label: 'Ask whether she wants a witness', next: 'witness' },
  ]),
  letterTaken: scene('letterTaken', 'The Seal Remains Whole', 'The woman leaves the letter in your hand for a moment, then asks for it back. She would rather carry the unanswered question herself than have a stranger deliver it.', [
    { id: 'returnLetter', label: 'Return the letter unopened', next: 'witness' },
    { id: 'keepLetter', label: 'Refuse to take part and set it down', next: 'downstairs' },
  ]),
  witness: end('witness', 'An Answer Left Open', 'She keeps the sealed letter. You do not learn whether Vale ever returned, but your presence lets her choose what to do without pretending to be someone else.'),
  downstairs: end('downstairs', 'A Name Corrected', 'You leave the hall and let the woman keep her own letter. The mistake ends there; whatever answer she needs belongs to the person she meant to meet.'),
});

export const THE_EMPTY_PLACE_SETTING = story('the-empty-place-setting', 'The Empty Place Setting', 'A family supper has room for one more person, if anyone can bear to ask.', T('At an ordinary family supper, a reserved chair exposes a rift; the traveler can invite, inquire, or refuse to become a messenger.', ['social interaction', 'communication/witness'], 'guest', 'melancholy/tragic', 'farmhouse dining room', ['family ritual', 'competing boundaries', 'quiet choice'], 'invited/known contact'), 'supper', {
  supper: scene('supper', 'One Place Left Empty', 'Your host sets an extra plate at the far end of the table. Her sister lives nearby but has not visited since the last harvest. No one asks you to fix it.', [
    { id: 'askAboutPlate', label: 'Ask about the extra place', next: 'account' },
    { id: 'sayNothing', label: 'Let supper begin without asking', next: 'meal' },
    { id: 'offerToCarryInvitation', label: 'Offer to invite the sister', next: 'message' },
  ]),
  account: scene('account', 'Two Versions of the Harvest', 'Your host says her sister left before the work was finished. A cousin at the table says she had already done her share. Neither wants you to judge what you did not see.', [
    { id: 'askWhatWouldHelp', label: 'Ask what would make tonight easier', next: 'choice' },
    { id: 'listenToCousin', label: 'Ask the cousin what happened', next: 'cousin' },
  ]),
  cousin: scene('cousin', 'What the Cousin Remembers', 'The cousin remembers an argument over who was expected to stay late, not over the harvest itself. It does not prove either sister was right.', [
    { id: 'shareLimitedAccount', label: 'Share only what the cousin recalls', next: 'choice', effects: { knowledge: ['The harvest quarrel concerned who was expected to stay late, not how much work was done.'] } },
    { id: 'keepOutOfIt', label: 'Keep the account private', next: 'meal' },
  ]),
  choice: scene('choice', 'An Invitation Without a Verdict', 'Your host can send an invitation that does not ask anyone to apologize tonight. Or the empty chair can remain without becoming a message.', [
    { id: 'writeNoPressure', label: 'Help write a simple invitation', next: 'invited', effects: { historyFlags: ['helped_leave_a_family_invitation_without_pressure'] } },
    { id: 'leaveChair', label: 'Let the empty place stay empty', next: 'meal' },
  ]),
  message: end('message', 'A Messenger, Not a Mediator', 'Your host gives you a note only after writing it herself. You carry no verdict, only an invitation she chose to send.'),
  invited: end('invited', 'Supper Goes On', 'The note is set beside the extra plate. The sister may come another evening; for tonight, the family eats without demanding a reconciliation.'),
  meal: end('meal', 'An Unfilled Chair', 'The place setting remains. Supper is still warm, and nobody asks you to settle a quarrel that began before you arrived.'),
});

export const THE_BARBERS_QUIET_CUSTOMER = story('the-barbers-quiet-customer', 'The Barber’s Quiet Customer', 'A familiar customer has stopped speaking, and the barber does not know whether to ask why.', T('The traveler is present for a haircut when a barber weighs a customer’s privacy against the need to check on their sudden silence.', ['social interaction', 'rescue/care'], 'witness', 'warm/hopeful', 'barber shop', ['privacy choice', 'quiet conversation', 'relationship payoff'], 'accidental encounter'), 'shop', {
  shop: scene('shop', 'The Chair by the Window', 'A barber trims your hair while a regular customer sits in the next chair, unusually quiet. The barber says the customer has missed two visits and asks whether you noticed anything. You have not.', [
    { id: 'protectPrivacy', label: 'Say you do not know', next: 'privacy' },
    { id: 'askCustomerDirectly', label: 'Ask the customer if they want company', next: 'customer' },
    { id: 'askBarberPrivately', label: 'Ask the barber what changed', next: 'barber' },
  ]),
  barber: scene('barber', 'The Barber’s Concern', 'The barber says the customer’s spouse died recently, but does not know whether the customer wants to discuss it. He asks you not to turn grief into shop talk.', [
    { id: 'returnToChair', label: 'Let the customer set the subject', next: 'customer' },
    { id: 'declineGossip', label: 'Ask the barber to keep it private', next: 'privacy', effects: { historyFlags: ['kept_a_customer_grief_private'] } },
  ]),
  customer: scene('customer', 'An Answer Without a Question', 'The customer says they are fine, then admits they have not wanted to sit alone at home. They do not want advice; they ask whether you will stay until the barber finishes.', [
    { id: 'stayForTrim', label: 'Stay for the rest of the haircut', next: 'company' },
    { id: 'offerWalk', label: 'Offer a short walk after', next: 'walk' },
    { id: 'respectNo', label: 'Respect their answer and leave', next: 'privacy' },
  ]),
  company: end('company', 'Ordinary Company', 'You remain while the barber finishes. The customer talks about a cracked window latch instead of grief, and nobody insists that this must mean more.'),
  walk: end('walk', 'A Short Walk', 'The customer accepts a walk to the corner, not a promise of friendship. The barber closes the shop behind you and does not ask what was said.'),
  privacy: end('privacy', 'The Shop Keeps Its Silence', 'The customer leaves when ready. The barber returns to the next appointment without repeating what you heard.'),
});

export const THE_SCHOOLROOM_DOOR = story('the-schoolroom-door', 'The Schoolroom Door', 'A teacher is delayed, and a room of pupils has a recitation in an hour.', T('A traveler is asked to keep a schoolroom calm until the teacher returns, then discovers the children prepared two competing versions of the same recitation.', ['social interaction', 'competition/game'], 'accidental participant', 'humorous/absurd', 'schoolhouse', ['group improvisation', 'performance consequence', 'multi-path payoff'], 'accidental encounter'), 'school', {
  school: scene('school', 'A Room Without Its Teacher', 'The teacher ran to fetch a missing book. The pupils are safe, but the recitation begins in an hour. An older student asks you to keep the room from turning into a race to the door.', [
    { id: 'askForPlan', label: 'Ask what they were rehearsing', next: 'rehearsal' },
    { id: 'setQuietTask', label: 'Ask each pupil to practice a line', next: 'lines' },
    { id: 'waitOutside', label: 'Wait by the doorway', next: 'door' },
  ]),
  rehearsal: scene('rehearsal', 'Two Endings to One Recitation', 'Half the pupils learned the printed ending; the others copied a funny ending someone made up. The room is split, but nobody is in trouble yet.', [
    { id: 'rehearseBoth', label: 'Let each version be heard once', next: 'performance', effects: { historyFlags: ['let_school_pupils_present_two_versions_of_a_recitation'] } },
    { id: 'askOlderStudent', label: 'Ask the older student to choose', next: 'student' },
  ]),
  lines: scene('lines', 'Practice Turns to Laughter', 'The pupils begin practicing, but the invented ending keeps interrupting the serious one. The older student asks whether to tell the teacher or let the group decide.', [
    { id: 'letVote', label: 'Let the pupils choose together', next: 'performance' },
    { id: 'keepPrintedEnding', label: 'Use the printed version today', next: 'student' },
  ]),
  student: scene('student', 'The Older Student’s Concern', 'The older student worries the teacher will blame the youngest pupils for the joke. You can let them explain the split, or keep the recitation simple for today.', [
    { id: 'shareResponsibility', label: 'Help explain how both versions arose', next: 'performance' },
    { id: 'chooseQuietly', label: 'Keep the printed ending for today', next: 'quiet' },
  ]),
  performance: scene('performance', 'The Teacher Returns', 'The teacher arrives as the pupils are ready. She hears both endings, laughs at the invented one, and asks the class which should be read at the public recitation.', [
    { id: 'letClassChoose', label: 'Let the pupils decide', next: 'classChoice' },
    { id: 'recommendPrinted', label: 'Recommend the printed version', next: 'printed' },
  ]),
  classChoice: end('classChoice', 'A Recitation They Own', 'The pupils choose the printed ending for the public reading and keep the joke for afterward. The teacher thanks you for giving them room to settle it themselves.'),
  printed: end('printed', 'A Clear Reading', 'The recitation is orderly. The younger pupils still tell the joke at recess, and the teacher thanks you for helping without taking her place.'),
  quiet: end('quiet', 'A Small Order Kept', 'The class returns to the printed version. The teacher learns there were two endings, but no one is singled out as the culprit.'),
  door: end('door', 'The Teacher Comes Back', 'The teacher returns before the room grows restless. Your presence bought a little calm, and the lesson proceeds without requiring you to lead it.'),
});

export const THE_FAREWELL_QUILT = story('the-farewell-quilt', 'The Farewell Quilt', 'A traveling seamstress must decide whose name belongs on a gift made by many hands.', T('A shared farewell quilt includes a mistaken name; changing it may hurt the maker, while leaving it may exclude the recipient.', ['social interaction', 'labor/repair'], 'witness', 'melancholy/tragic', 'boarding house common room', ['craft contribution', 'dignity choice', 'relationship consequence'], 'invited/known contact'), 'quilting', {
  quilting: scene('quilting', 'The Final Patch', 'A group of neighbors sew a quilt for a woman leaving town. The final patch bears the name “Anne,” but the recipient is Anna. The maker says the patch took all afternoon.', [
    { id: 'quietlyAskRecipient', label: 'Ask Anna how she wants it handled', next: 'recipient' },
    { id: 'askMaker', label: 'Ask the maker to check the spelling', next: 'maker' },
    { id: 'sayNothing', label: 'Say nothing and let the gift stand', next: 'gift' },
  ]),
  recipient: scene('recipient', 'Anna’s Preference', 'Anna says the misspelling will not spoil the quilt, but she would like the maker to know her name was remembered correctly. She does not want the group to start over.', [
    { id: 'suggestSmallLabel', label: 'Suggest sewing a small name label', next: 'label' },
    { id: 'acceptPatch', label: 'Leave the patch and explain privately', next: 'gift' },
  ]),
  maker: scene('maker', 'A Mistake Made Carefully', 'The maker admits she copied the name from an old list without asking. She offers to remove the patch, though the seam may show.', [
    { id: 'makeLabelTogether', label: 'Help add a small corrected label', next: 'label' },
    { id: 'keepOriginalPatch', label: 'Leave the patch in place', next: 'gift' },
  ]),
  label: scene('label', 'A Name in the Corner', 'A spare strip of cloth is available. A small label will not hide the mistake, but it can place Anna’s name beside the patch instead of pretending the old one never happened.', [
    { id: 'sewLabel', label: 'Sew the corrected label in', next: 'labeled' },
    { id: 'giveAsIs', label: 'Let Anna decide after receiving it', next: 'gift' },
  ]),
  labeled: end('labeled', 'A Gift with Both Names', 'Anna thanks the maker and keeps the original patch. The small label makes clear who the quilt was meant for without erasing the work already given.'),
  gift: end('gift', 'A Gift Still Given', 'Anna accepts the quilt without making the mistake a public rebuke. The maker sees her smile, but does not learn what it cost Anna to let the moment pass.'),
});

export const THE_PUBLIC_APOLOGY = story('the-public-apology', 'The Public Apology', 'A small mistake has become a public performance neither neighbor wanted.', T('The player accidentally repeats a private complaint at a market stall, forcing a choice between public correction and preserving someone’s privacy.', ['social interaction', 'negotiation/trade'], 'accidental culprit', 'awkward', 'town market', ['player-caused complication', 'public/private choice', 'reparative consequence'], 'accidental encounter'), 'stall', {
  stall: scene('stall', 'Words Carried Too Far', 'At the market you repeat a complaint you heard about a stall’s crooked sign. The sign-painter is standing behind you. The remark was yours to make, and both neighbors heard it.', [
    { id: 'ownWords', label: 'Admit you repeated it carelessly', next: 'ownIt', effects: { historyFlags: ['repeated_a_private_complaint_in_public'] } },
    { id: 'blameOriginalSpeaker', label: 'Name who first complained', next: 'blame' },
    { id: 'changeSubject', label: 'Try to move the conversation on', next: 'silence' },
  ]),
  ownIt: scene('ownIt', 'A Correction in the Open', 'The painter says the sign is crooked because the stall leans. The merchant says the painter promised to fix it. You can correct your own part without deciding which account is right.', [
    { id: 'offerToHoldSign', label: 'Offer to hold the sign while it is fixed', next: 'repair' },
    { id: 'apologizeAndLeave', label: 'Apologize and leave them to it', next: 'apology' },
  ]),
  blame: scene('blame', 'A Name Passed Along', 'The person you name is not here to answer. The painter says the words were not the problem; having them repeated as fact was.', [
    { id: 'withdrawClaim', label: 'Withdraw the remark as hearsay', next: 'apology' },
    { id: 'standByRumor', label: 'Insist the sign is crooked anyway', next: 'silence' },
  ]),
  silence: end('silence', 'The Market Moves On', 'The conversation turns elsewhere, but the painter and merchant stop speaking to each other. Your attempt to avoid embarrassment left the original friction untouched.'),
  repair: end('repair', 'A Sign Held Straight', 'You hold the board while the painter resets it. The merchant pays for the work, and your apology does not settle who was late; it does stop your retelling from standing as proof.'),
  apology: end('apology', 'A Smaller Audience', 'You correct the statement without naming its source. The neighbors still disagree about the sign, but your part in making the dispute public is clear.'),
});

export const THE_LAST_CLEAN_APRON = story('the-last-clean-apron', 'The Last Clean Apron', 'A kitchen has one dry apron and two people who need it for different reasons.', T('A traveler helping at a crowded inn kitchen must choose who gets the sole clean apron before a public supper begins.', ['social interaction', 'labor/repair'], 'helper/rescuer', 'tense/dangerous', 'inn kitchen', ['resource allocation', 'two-stage work choice', 'performance feedback'], 'hired/posted work', ['money/item/knowledge/history possible', 'relationship/referral']), 'kitchen', {
  kitchen: scene('kitchen', 'One Apron, Two Cooks', 'A sudden leak soaked the kitchen’s spare clothes. The cook needs the only clean apron to plate the supper; the dishwasher needs it to handle hot pans safely. The innkeeper asks you to help, not decide who matters more.', [
    { id: 'askForDryCloth', label: 'Look for another way to cover the work', next: 'cupboard' },
    { id: 'giveCookApron', label: 'Give the apron to the cook', next: 'plating' },
    { id: 'giveDishwasherApron', label: 'Give the apron to the dishwasher', next: 'washing' },
  ], 'warning'),
  cupboard: scene('cupboard', 'A Clean Flour Sack', 'A clean flour sack can be cut into a rough waist cloth. It will keep splashes off, but not protect anyone from a hot pan. The innkeeper can spare it if the cook agrees.', [
    { id: 'cutSack', label: 'Make a temporary waist cloth', hint: 'Nessa promises one simple meal next time you pass through.', next: 'plating', effects: { historyFlags: ['improvised_a_kitchen_work_cloth_from_clean_sack'], gainContacts: [NESSA_CONTACT], gainFavors: [NESSA_MEAL_FAVOR] } },
    { id: 'useApronOnHotPans', label: 'Keep the apron for the hot pans', next: 'washing' },
  ]),
  plating: scene('plating', 'The Supper Goes Out', 'The cook plates the meal on time. The dishwasher works slower without the apron and asks you to carry two cooled trays, not the hot pans.', [
    { id: 'carryCooledTrays', label: 'Carry the cooled trays to the dining room', next: 'paid', effects: { money: 1 } },
    { id: 'checkDishwasher', label: 'Check that the dishwasher is managing', next: 'thanks' },
  ], 'safe', [{ requirements: { historyFlags: ['improvised_a_kitchen_work_cloth_from_clean_sack'] }, text: 'The cook plates the meal on time. The dishwasher works slower without the apron and asks you to carry two cooled trays, not the hot pans. Nessa says to remember her offer of a simple meal when you pass this way again.' }]),
  washing: scene('washing', 'Hot Pans, Slower Supper', 'The dishwasher handles the pans safely. The cook sends supper out several minutes late and asks you to explain the delay to the waiting tables.', [
    { id: 'explainDelay', label: 'Explain the kitchen’s safety choice', next: 'thanks' },
    { id: 'offerMoreWork', label: 'Help carry the finished plates', next: 'paid', effects: { money: 1 } },
  ]),
  paid: end('paid', 'A Supper Served', 'The innkeeper pays the promised coin for your extra help. One table had to wait, but every pan was handled safely; the cook remembers that you stayed useful without taking over.'),
  thanks: end('thanks', 'A Hot Meal, A Fair Pace', 'The supper reaches the tables a little later than planned. The dishwasher thanks you for treating safety as a real constraint, and the cook accepts the delay without blaming them.'),
});

export const THE_QUIET_APPLAUSE = story('the-quiet-applause', 'The Quiet Applause', 'A tired performer finishes to a room unsure whether the show is over.', T('The traveler must read a room after a tired singer ends a modest performance, deciding whether to join, redirect, or respect the silence.', ['social interaction', 'competition/game'], 'participant', 'warm/hopeful', 'boarding house parlor', ['audience interpretation', 'performer agency', 'quiet payoff'], 'accidental encounter'), 'parlor', {
  parlor: scene('parlor', 'The Song Ends Early', 'A singer at the boarding-house piano stops halfway through a familiar song and apologizes for losing the next verse. The listeners sit quietly. No one has asked you to rescue the evening.', [
    { id: 'applaudGently', label: 'Offer a quiet round of applause', next: 'response' },
    { id: 'askForAnotherSong', label: 'Ask whether they want to continue', next: 'choice' },
    { id: 'letSilenceStand', label: 'Let the song end there', next: 'leave' },
  ]),
  response: scene('response', 'A Room Answers', 'The singer smiles, not quite ready to play again. One listener begins humming the tune; another begins to clap. The performer watches to see which way the room turns.', [
    { id: 'inviteListeners', label: 'Invite the room to hum together', next: 'together' },
    { id: 'keepItSmall', label: 'Let the singer decide what comes next', next: 'choice' },
  ]),
  choice: scene('choice', 'The Performer’s Wish', 'The singer asks for a moment, then says they would rather hear the room than perform again. The boarding-house keeper can bring tea, but does not want to make it a spectacle.', [
    { id: 'shareRefrain', label: 'Hum the refrain if others join', next: 'together' },
    { id: 'offerTea', label: 'Ask the keeper to bring tea quietly', next: 'tea' },
    { id: 'leaveChoice', label: 'Give the singer some quiet', next: 'leave' },
  ]),
  together: end('together', 'A Song Shared', 'A few people hum the refrain, softly and out of time. The singer does not need to finish the song for the room to enjoy it.'),
  tea: end('tea', 'A Cup by the Piano', 'Tea arrives without announcement. The singer listens to the room settle, then thanks you for not asking for an encore.'),
  leave: end('leave', 'The Song Is Allowed to End', 'The room returns to its own conversations. The singer leaves the piano when ready, and the unfinished verse remains unfinished without being a failure.'),
});

export const SOCIAL_SURPRISE_ADVENTURES = [
  THE_TOAST_NOBODY_ORDERED, AN_INVITATION_FOR_SOMEONE_ELSE, ONE_UMBRELLA_THREE_WALKERS,
  THE_WRONG_NAME_AT_THE_DOOR, THE_EMPTY_PLACE_SETTING, THE_BARBERS_QUIET_CUSTOMER,
  THE_SCHOOLROOM_DOOR, THE_FAREWELL_QUILT, THE_PUBLIC_APOLOGY, THE_LAST_CLEAN_APRON,
  THE_QUIET_APPLAUSE,
];
