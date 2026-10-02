import { anthologyEnd as end, anthologyScene as scene, anthologyStory as story, anthologyTags as tags } from './surpriseAnthologyTools';
import { NESSA_CONTACT, NESSA_MEAL_FAVOR } from '../travelerContinuity';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

const T = (hook: string, activities: string[], role: string, tone: string, setting: string, structures: string[], entry: string, reward = ['narrative-only payoff'], risk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW') => tags({ hook, activities, role, tone, risk, setting, structures, entry, rewards: reward, consequences: risk === 'LOW' ? ['time/opportunity', 'relationship'] : ['time/opportunity', 'health/injury', 'relationship'] });

export const THE_ENVELOPE_UNDER_THE_TEACUP = story('the-envelope-under-the-teacup', 'The Envelope Under the Teacup', 'A breakfast table holds a letter no one admits to receiving.', T('A sealed letter has been kept under a teacup for days; the traveler must distinguish the owner’s wish for privacy from the household’s wish to know what arrived.', ['communication/witness', 'social interaction'], 'witness', 'mysterious/eerie', 'boarding house dining room', ['information reveal', 'privacy choice', 'quiet consequence'], 'accidental encounter'), 'breakfast', {
  breakfast: scene('breakfast', 'A Cup Set Over an Envelope', 'At breakfast, an envelope lies beneath an empty teacup. The innkeeper says it has been there since yesterday; the guest who sat here denies seeing it. Your place is at the table, not over the letter.', [
    { id: 'askInnkeeper', label: 'Ask who set the cup there', next: 'account' },
    { id: 'askGuest', label: 'Ask the guest whether it is theirs', next: 'guest' },
    { id: 'leaveLetter', label: 'Leave the envelope unopened', next: 'privacy' },
  ]),
  account: scene('account', 'The Cup Moved Twice', 'The innkeeper remembers clearing the table, then returning the cup after a traveler asked for more tea. She does not know whether the envelope was already beneath it.', [
    { id: 'askForWitness', label: 'Ask who poured the second cup', next: 'witness' },
    { id: 'suggestOpenAtDesk', label: 'Suggest asking the housekeeper privately', next: 'housekeeper' },
  ]),
  guest: scene('guest', 'A Guest’s Refusal', 'The guest says the envelope is not theirs, but their eyes stay on it. They ask you not to open someone else’s mail in a public room.', [
    { id: 'respectRefusal', label: 'Leave it sealed for the innkeeper', next: 'privacy' },
    { id: 'askIfTheyRecognizeHand', label: 'Ask whether the handwriting is familiar', next: 'handwriting' },
  ]),
  witness: scene('witness', 'The Second Cup', 'A housemaid says the guest asked for tea, then left before it cooled. She saw no letter being placed. That narrows the timing but does not identify an owner.', [
    { id: 'placeAtDesk', label: 'Leave the envelope at the inn desk', next: 'desk' },
    { id: 'askGuestAgain', label: 'Give the guest a chance to claim it privately', next: 'guest' },
  ]),
  housekeeper: end('housekeeper', 'A Private Question', 'The housekeeper recognizes the handwriting as a former guest’s and agrees to contact them without opening the letter. The breakfast table returns to breakfast.'),
  handwriting: end('handwriting', 'A Hand Recognized', 'The guest recognizes the writing as a sibling’s but still chooses not to open it. They ask the innkeeper to hold it until they decide whether to answer.'),
  desk: end('desk', 'Mail Left in Trust', 'The envelope is logged at the desk, still sealed. You have not solved who owns it, but it can no longer be mistaken for a table decoration.'),
  privacy: end('privacy', 'A Letter Left Closed', 'The innkeeper puts the envelope in the office drawer. Whoever sent it may be found later; no one at the table is forced to claim a private message.'),
});

export const TWO_DATES_ON_ONE_PHOTOGRAPH = story('two-dates-on-one-photograph', 'Two Dates on One Photograph', 'A portrait has two handwritten dates, and the family remembers only one sitting.', T('Two dates on a family portrait reveal a second sitting after a child was cropped from the first; the traveler can investigate or protect the family’s preferred account.', ['investigation/mystery', 'social interaction', 'communication/witness'], 'investigator/explorer', 'melancholy/tragic', 'photographer studio', ['object-led investigation', 'contradictory recollection', 'memory choice'], 'voluntary curiosity'), 'studio', {
  studio: scene('studio', 'Two Dates on the Back', 'A photographer asks you to carry a portrait to a customer’s house. The back bears two dates, six months apart. The family order lists only one sitting.', [
    { id: 'deliverPortrait', label: 'Deliver it without comment', next: 'house' },
    { id: 'askPhotographer', label: 'Ask why two dates are written', next: 'photographer' },
    { id: 'checkNegativeSleeve', label: 'Check the labeled negative sleeve', next: 'sleeve' },
  ]),
  photographer: scene('photographer', 'A Second Exposure', 'The photographer recalls a second sitting when one child was sick on the first date. The family paid for one print, and the photographer cannot remember which sitting the customer chose.', [
    { id: 'deliverAndAsk', label: 'Deliver the portrait and ask the family', next: 'house' },
    { id: 'findSleeve', label: 'Look for the negative sleeve', next: 'sleeve' },
  ]),
  sleeve: scene('sleeve', 'Two Negative Sleeves', 'The first sleeve shows all four family members; the second shows three, with a chair pulled close to the frame. The note says “best likeness” but names no child.', [
    { id: 'showBothRecords', label: 'Take both dates to the family', next: 'house', effects: { knowledge: ['A portrait had two sittings; the first showed four family members, the second three.'] } },
    { id: 'leaveSleevesPrivate', label: 'Return the portrait without the sleeves', next: 'quiet' },
  ]),
  house: scene('house', 'The Family’s Account', 'The eldest daughter says the second portrait was made after her younger brother died. Her mother says the second date only marks a repair to the frame. Both may be partly right.', [
    { id: 'shareBothDates', label: 'Explain what the studio records show', next: 'records' },
    { id: 'askWhatTheyWant', label: 'Ask which portrait they prefer to keep', next: 'choice' },
    { id: 'keepSilent', label: 'Deliver the portrait and leave', next: 'quiet' },
  ]),
  records: scene('records', 'A Record, Not a Verdict', 'The mother admits the second sitting removed the empty chair from view. She says the family wanted a picture they could look at every day, not a false account of the loss.', [
    { id: 'offerBothCopies', label: 'Offer to have both portraits copied', next: 'copies' },
    { id: 'respectOnePortrait', label: 'Leave the choice with the family', next: 'choice' },
  ]),
  choice: end('choice', 'The Picture They Choose', 'The family keeps the portrait they can bear to see. The second date remains on its back; no one asks you to turn grief into proof.'),
  copies: end('copies', 'Two Ways to Remember', 'The photographer agrees to make a copy of each sitting at a modest charge. The family can choose what to display without pretending the earlier picture never existed.'),
  quiet: end('quiet', 'A Portrait Delivered', 'You deliver the portrait without deciding what the dates mean. The family may ask the photographer later; for now, the frame is set on the mantel.'),
});

export const A_NOTICE_PRINTED_BACKWARD = story('a-notice-printed-backward', 'A Notice Printed Backward', 'A public notice is readable only in a mirror, and the meeting begins soon.', T('A printer reversed a town notice while setting type; correcting it may delay a meeting, while posting it may send neighbors to the wrong place.', ['communication/witness', 'labor/repair'], 'messenger', 'humorous/absurd', 'print shop and town hall', ['deadline choice', 'information correction', 'public consequence'], 'hired/posted work', ['money/item/knowledge/history possible', 'narrative-only payoff']), 'press', {
  press: scene('press', 'A Notice No One Can Read', 'The printer has pulled a dozen copies of the notice for the road committee. The letters are reversed. The meeting starts in half an hour, and the printer says the mistake is his.', [
    { id: 'resetType', label: 'Help reset the reversed line', next: 'type' },
    { id: 'writeByHand', label: 'Write a clear correction by hand', next: 'hand' },
    { id: 'tellCommittee', label: 'Warn the committee before posting', next: 'hall' },
  ]),
  type: scene('type', 'The Slow Correction', 'Resetting the type will take longer than the remaining half hour. The printer offers to pay for your time even if the notices miss the meeting.', [
    { id: 'finishType', label: 'Finish the corrected line', next: 'late', effects: { money: 1 } },
    { id: 'switchToHand', label: 'Set the type aside and write a correction', next: 'hand' },
  ]),
  hand: scene('hand', 'A Plain Correction', 'The handwritten notice is less handsome but clear. The committee may begin late while people read it, or the printer can post the reversed sheets as a demonstration of the mistake.', [
    { id: 'postCorrection', label: 'Post the handwritten correction', next: 'clear' },
    { id: 'showReversedSheet', label: 'Show the reversed sheet at the meeting', next: 'demonstration' },
  ]),
  hall: scene('hall', 'The Committee Is Gathering', 'The clerk has not yet posted anything. They can announce the correct place aloud, or wait for a readable notice and start late.', [
    { id: 'announcePlace', label: 'Ask the clerk to announce it aloud', next: 'clear' },
    { id: 'waitForPrinter', label: 'Wait for the corrected sheet', next: 'late' },
  ]),
  clear: end('clear', 'Everyone Finds the Hall', 'The committee meeting starts on time after the clerk announces the place. The printer pays for the sheet you helped prepare and promises to check the type before the next run.'),
  demonstration: end('demonstration', 'A Reversed Lesson', 'The printer turns the mistake into a short explanation of how type reads backward. The corrected meeting notice is written clearly beside it.'),
  late: end('late', 'A Meeting Delayed', 'The notice is corrected, but some neighbors arrive late. The printer pays the agreed coin; the committee reschedules its first item rather than pretending nothing was lost.'),
});

export const SUPPER_AT_THE_INN = story('supper-at-the-inn', 'Supper at the Inn', 'A familiar cook needs help serving a meal after the kitchen runs short of clean cloths.', T('A cook from a prior kitchen job recognizes a traveler and asks for practical help; a previous record of courtesy opens a small, concrete kindness, not a power bonus.', ['labor/repair', 'social interaction'], 'helper/rescuer', 'warm/hopeful', 'inn kitchen', ['conditional relationship callback', 'work sequence', 'performance payoff'], 'invited/known contact', ['money/item/knowledge/history possible', 'relationship/referral']), 'kitchen', {
  kitchen: scene('kitchen', 'The Cook Remembers the Apron', 'The inn cook recognizes you from the evening the spare apron ran out. Tonight, the serving cloths are still drying and the supper bell is near. She can use an extra pair of hands.', [
    { id: 'takeServingWork', label: 'Help carry the first dishes', next: 'service' },
    { id: 'askWhatIsNeeded', label: 'Ask which task matters most', next: 'needs' },
    { id: 'declineKitchen', label: 'Wish her a steady evening', next: 'leave' },
  { id: 'callOnOldCourtesy', label: 'Use Nessa’s offer of a simple meal', requirements: { contacts: [NESSA_CONTACT.id], favors: [NESSA_MEAL_FAVOR.id] }, effects: { consumeFavors: [NESSA_MEAL_FAVOR.id] }, next: 'meal' },
  ]),
  needs: scene('needs', 'One Meal Behind', 'The cook has enough hands for the stove but not for serving. The clean cloths will be ready in a few minutes; carrying hot plates now would be unsafe.', [
    { id: 'waitForCloths', label: 'Wait for the cloths, then serve', next: 'service' },
    { id: 'setColdTable', label: 'Set the table for the cold dishes', next: 'table' },
  ]),
  service: scene('service', 'A Supper Sent Out', 'The first dishes reach the tables warm. One guest complains that the meal began late; another thanks Nessa for not sending hot plates through bare hands.', [
    { id: 'finishServing', label: 'Finish the last table', next: 'paid', effects: { money: 1 } },
    { id: 'leaveAfterFirstRound', label: 'Leave after the first round', next: 'partial' },
  ]),
  table: scene('table', 'The Cold Dishes First', 'The table is ready for bread, cheese, and pickled vegetables. The hot stew can follow when the cloths are dry.', [
    { id: 'bringColdDishes', label: 'Serve the cold dishes first', next: 'service' },
    { id: 'tellGuestsWhy', label: 'Explain the short delay to guests', next: 'service' },
  ]),
  meal: end('meal', 'A Bowl Before the Work', 'Nessa honors her offer with a bowl before the rush. She asks no work or debt in return; you can decide whether to stay and lend a hand afterward.'),
  paid: end('paid', 'A Full Shift of Help', 'Nessa pays the promised coin. The supper runs late but safely, and the guests remember the meal more than the wait.'),
  partial: end('partial', 'A First Round Served', 'The first tables are fed, but Nessa must finish the room without you. She thanks you for the useful start and makes no claim that the whole shift is done.'),
  leave: end('leave', 'A Kitchen Left to Its Cook', 'You leave Nessa to her own staff. The supper bell rings a little late, and no one mistakes courtesy for a promise to work.'),
});

export const THE_COBBLERS_LAST_PAIR = story('the-cobblers-last-pair', 'The Cobbler’s Last Pair', 'A cobbler has one pair of sound soles and two customers who need them for different reasons.', T('A cobbler must allocate the only finished pair of soles between a laborer whose boots are failing and a dancer with a performance tonight.', ['negotiation/trade', 'social interaction', 'labor/repair'], 'mediator', 'tense/dangerous', 'cobbler workshop', ['competing needs', 'craft constraint', 'negotiated aftermath'], 'accidental encounter', ['money/item/knowledge/history possible', 'relationship/referral']), 'shop', {
  shop: scene('shop', 'One Pair Ready', 'The cobbler has finished one pair of soles. A field worker’s boot is splitting, while a dancer needs shoes for a performance tonight. A second pair cannot be cut before morning.', [
    { id: 'hearWorker', label: 'Ask what the field worker needs', next: 'worker' },
    { id: 'hearDancer', label: 'Ask what the dancer can manage', next: 'dancer' },
    { id: 'askCobbler', label: 'Ask what the leather can do', next: 'craft' },
  ]),
  worker: scene('worker', 'A Boot That Can Last One More Day', 'The worker says a leather patch would keep the boot on until tomorrow, but the cobbler has no scrap wide enough. The dancer has already paid for the finished soles.', [
    { id: 'offerSplitPair', label: 'Suggest splitting the finished pair', next: 'split' },
    { id: 'suggestBorrowedBoot', label: 'Ask whether a spare boot exists', next: 'spare' },
  ]),
  dancer: scene('dancer', 'A Performance That Can Change', 'The dancer says the performance can be done barefoot, though a partner’s steps were choreographed for shoes. The worker’s boot may fail during a long day in the field.', [
    { id: 'askPartner', label: 'Ask the partner about changing steps', next: 'partner' },
    { id: 'askForPatch', label: 'Ask whether a temporary patch is possible', next: 'craft' },
  ]),
  craft: scene('craft', 'Leather Is Not a Pair Yet', 'The cobbler can cut the finished soles in half, leaving both customers with an imperfect fit, or reserve them for the customer who paid and patch the worker’s boot with stitched canvas.', [
    { id: 'canvasPatch', label: 'Use stitched canvas for the worker', next: 'patched' },
    { id: 'honorPayment', label: 'Keep the finished soles for the dancer', next: 'dancerGetsPair' },
  ]),
  partner: end('partner', 'A Different Step', 'The dancer’s partner agrees to change the first figure. The dancer takes the soles; the worker accepts a canvas patch and a promise to return after tomorrow’s work.'),
  spare: end('spare', 'A Borrowed Boot', 'The cobbler finds one old boot that fits well enough for a day. The worker borrows it, the dancer gets the paid soles, and the shop takes on a repair for tomorrow.'),
  split: end('split', 'Neither Pair Is Perfect', 'The customers agree to split the finished soles between them. The cobbler will need to make two new pairs later; tonight, both leave with a compromise they chose.'),
  patched: end('patched', 'A Repair, Not a New Pair', 'The worker leaves with a temporary patch and the dancer keeps the finished soles. The cobbler writes down the worker’s name for a proper repair, not a promise of free work.'),
  dancerGetsPair: end('dancerGetsPair', 'The Paid Pair Goes Out', 'The dancer leaves with the soles they paid for and changes the performance to suit them. The worker returns to the road with a boot that still needs repair.'),
});

export const THE_PARCEL_WITH_NO_ADDRESS = story('the-parcel-with-no-address', 'The Parcel with No Address', 'A parcel arrives at the station with a name but no destination.', T('A parcel labeled only with a common surname creates a choice between opening, advertising, returning, or holding it without inventing an owner.', ['communication/witness', 'investigation/mystery'], 'messenger', 'mysterious/eerie', 'railway station parcel room', ['information-gathering', 'privacy and property', 'delayed resolution'], 'accidental encounter'), 'counter', {
  counter: scene('counter', 'A Name Without a Place', 'A clerk has one parcel marked “For Mercer” and no town or street. Three people at the station answer when he calls the surname. The string is intact; the label is not torn.', [
    { id: 'askForOtherMarkings', label: 'Look for a sender’s mark', next: 'mark' },
    { id: 'askEachMercer', label: 'Ask each person what they expect', next: 'claims' },
    { id: 'leaveWithClerk', label: 'Leave it unopened at the counter', next: 'held' },
  ]),
  mark: scene('mark', 'A Small Printer’s Stamp', 'A printer’s mark on the paper identifies a shop in the next county, not a recipient. One Mercer says they ordered a book; another says they are carrying no parcels today.', [
    { id: 'askForOrderProof', label: 'Ask who can describe the parcel', next: 'claims' },
    { id: 'sendBackToPrinter', label: 'Return it to the sending shop', next: 'returned' },
  ]),
  claims: scene('claims', 'Three Plausible Mercers', 'One expects a book, one expects a repaired pocket watch, and the third says nothing is due. The parcel could contain either named item; no one can describe its wrapping inside.', [
    { id: 'holdUntilProof', label: 'Ask the clerk to hold it for proof', next: 'held' },
    { id: 'returnToSender', label: 'Send it back to the printer', next: 'returned' },
    { id: 'takeWrongfulRisk', label: 'Open it to see what is inside', next: 'opened', effects: { historyFlags: ['opened_an_unclaimed_parcel_to_resolve_a_station_dispute'] } },
  ]),
  opened: scene('opened', 'The Seal Broken', 'The parcel contains a book. Two Mercers still expected a book; opening it has not proven who owns it, and the clerk says the seal cannot be restored.', [
    { id: 'admitMistake', label: 'Admit the parcel should have stayed sealed', next: 'consequence' },
    { id: 'giveBookToClaimant', label: 'Give it to the first claimant', next: 'taken' },
  ]),
  held: end('held', 'A Parcel Held in Trust', 'The clerk records the three claims and keeps the parcel sealed until a sender’s note arrives. The delay is inconvenient, but no one leaves with someone else’s property.'),
  returned: end('returned', 'Back to the Printer', 'The parcel goes back to the shop that sent it, unopened. The three Mercers leave without a parcel; the clerk keeps a record in case one returns with proof.'),
  consequence: end('consequence', 'A Broken Seal, No Owner', 'You acknowledge opening it did not settle ownership. The clerk pays to reseal the book for return, and the station record notes who broke the original string.'),
  taken: end('taken', 'A Book without Proof', 'The first claimant leaves with the book. The other two object, and the clerk records the handover as your decision rather than a verified delivery.'),
});

export const THE_CLOCK_THAT_KEPT_LOCAL_TIME = story('the-clock-that-kept-local-time', 'The Clock That Kept Local Time', 'A station clock is fifteen minutes behind, but the stationmaster says it is right.', T('A small station keeps local time while the rail timetable uses a standard clock; the traveler must prevent an avoidable missed connection without calling either clock broken.', ['puzzle/problem-solving', 'travel/exploration', 'social interaction'], 'witness', 'mysterious/eerie', 'railway station', ['contradictory information', 'practical coordination', 'two-clock resolution'], 'accidental encounter'), 'platform', {
  platform: scene('platform', 'Two Times on One Platform', 'The station clock says 2:15; the printed railway timetable says the train arrives at 2:30. The stationmaster says the clock is set to local noon, not the rail line’s standard time.', [
    { id: 'askForTimetableNote', label: 'Ask whether the timetable explains the difference', next: 'timetable' },
    { id: 'askWaitingPassengers', label: 'Ask what time they were told', next: 'passengers' },
    { id: 'followStationClock', label: 'Trust the station clock and wait', next: 'wait' },
  ]),
  timetable: scene('timetable', 'A Line in Small Print', 'A note says times are given by the rail line’s standard clock. The stationmaster did not notice it, and two passengers have been using the platform clock.', [
    { id: 'tellPassengers', label: 'Tell the waiting passengers about the note', next: 'coordination', effects: { knowledge: ['This railway timetable uses standard line time, while the small station clock keeps local time.'] } },
    { id: 'askMasterToConfirm', label: 'Ask the stationmaster to confirm with the line', next: 'coordination' },
  ]),
  passengers: scene('passengers', 'A Missed Train Last Week', 'One passenger missed a train last week by trusting the same clock. Another says the stationmaster once adjusted it for a funeral procession. Neither memory tells you today’s arrival time.', [
    { id: 'lookForPrintedNote', label: 'Read the timetable note', next: 'timetable' },
    { id: 'sendRunner', label: 'Ask the clerk to signal the line', next: 'coordination' },
  ]),
  coordination: scene('coordination', 'Which Time to Announce?', 'The stationmaster confirms the timetable is standard line time. You can help post both times or simply tell people which one controls the train.', [
    { id: 'postBoth', label: 'Post both times with a clear note', next: 'posted' },
    { id: 'announceStandard', label: 'Announce the train time plainly', next: 'announced' },
  ]),
  wait: end('wait', 'A Train That Has Not Arrived', 'You wait by the station clock. The train arrives according to the timetable, and the stationmaster explains the difference to those still on the platform.'),
  posted: end('posted', 'Two Clocks, One Train', 'A note now explains the difference between local station time and the railway timetable. The station clock remains untouched; travelers can read both without guessing.'),
  announced: end('announced', 'No Clock Was Broken', 'The passengers board according to standard line time. The stationmaster keeps the local clock, but adds the note before the next train.'),
});

export const THE_PLAY_WITH_AN_UNWRITTEN_ENDING = story('the-play-with-an-unwritten-ending', 'The Play with an Unwritten Ending', 'A small traveling troupe has reached the last page of its script, and the final scene is missing.', T('A traveling troupe asks the audience to help choose between two believable endings after a page is lost, making the public response part of the show.', ['social interaction', 'competition/game'], 'audience participant', 'humorous/absurd', 'town hall stage', ['audience participation', 'branching performance', 'performer feedback'], 'traveler is caught in crowd'), 'curtain', {
  curtain: scene('curtain', 'The Missing Last Page', 'The troupe reaches the final scene and discovers the last page is gone. The lead actor can end with a reunion or a departure; both versions have been rehearsed, but neither is marked as final.', [
    { id: 'askActors', label: 'Ask the actors what each ending changes', next: 'rehearsal' },
    { id: 'askAudience', label: 'Ask the audience what they understood', next: 'audience' },
    { id: 'leavePlay', label: 'Leave before the ending', next: 'left' },
  ]),
  rehearsal: scene('rehearsal', 'Two Endings, Different Costs', 'The reunion brings the siblings back together but leaves the farm unsold. The departure sells the farm and lets the younger sibling begin elsewhere. The actors ask you not to pick a moral.', [
    { id: 'tryReunion', label: 'Ask them to perform the reunion ending', next: 'reunion' },
    { id: 'tryDeparture', label: 'Ask them to perform the departure ending', next: 'departure' },
  ]),
  audience: scene('audience', 'What the Audience Believes', 'Several spectators understood the younger sibling to be leaving for a job, not escaping a family. The actors can clarify that in either ending or leave the audience to wonder.', [
    { id: 'shareAudienceReading', label: 'Share the audience’s reading', next: 'choice', effects: { knowledge: ['A theater audience read the missing ending as a choice about work and family, not escape.'] } },
    { id: 'keepInterpretationPrivate', label: 'Let the actors choose privately', next: 'choice' },
  ]),
  choice: scene('choice', 'The Last Scene Is Theirs', 'The company asks the room to choose only which ending to see tonight. The script will be rewritten tomorrow; tonight’s ending will not settle what the characters should do forever.', [
    { id: 'chooseReunion', label: 'See the reunion ending', next: 'reunion' },
    { id: 'chooseDeparture', label: 'See the departure ending', next: 'departure' },
  ]),
  reunion: end('reunion', 'A Door Left Open', 'The siblings reunite, but the farm remains unsold. The actors take notes on where the room applauded and promise to write a final page that earns the return.'),
  departure: end('departure', 'A Road Beyond the Town', 'The younger sibling leaves and the farm is sold. The room is quiet until the actors bow; the company keeps both endings in the script for another town.'),
  left: end('left', 'A Story Unfinished for You', 'You leave before the troupe chooses an ending. The actors continue for the people who stayed, and your absence does not decide what the play becomes.'),
});

export const A_CHAIR_BESIDE_THE_SICKBED = story('a-chair-beside-the-sickbed', 'A Chair Beside the Sickbed', 'A convalescent wants company but refuses advice about the medicine.', T('A traveler staying at an inn can offer ordinary company to a recovering guest without becoming a clinician or overriding the patient’s choices.', ['rescue/care', 'social interaction'], 'guest', 'warm/hopeful', 'inn sickroom', ['care with patient agency', 'conversation choice', 'quiet outcome'], 'asks for lodging', ['lodging/food', 'relationship/referral']), 'room', {
  room: scene('room', 'A Chair by the Window', 'The innkeeper asks whether you will sit with a guest recovering from a fever. The physician has already left instructions; the guest says they do not need another person reading them aloud.', [
    { id: 'sitQuietly', label: 'Sit without offering advice', next: 'company' },
    { id: 'askWhatTheyWant', label: 'Ask what would make the hour easier', next: 'choice' },
    { id: 'leaveThemRest', label: 'Let the guest rest alone', next: 'rest' },
  ]),
  company: scene('company', 'A Conversation about Ordinary Things', 'The guest would rather talk about the river road than the fever. They ask if you know whether the ferry still runs at dusk; you do not know unless you have learned it.', [
    { id: 'shareKnownRiverFact', label: 'Share what you know about the ferry', requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.riverBendSupper.id] }, next: 'talk' },
    { id: 'admitNotKnowing', label: 'Admit you do not know', next: 'talk' },
    { id: 'offerStory', label: 'Tell a small road story instead', next: 'story' },
  ]),
  choice: scene('choice', 'A Request, Not a Prescription', 'The guest asks for the window shade raised and a cup of water from the pitcher on the table. The pitcher is there; no medicine is needed from you.', [
    { id: 'raiseShade', label: 'Raise the shade and pass the pitcher', next: 'settled' },
    { id: 'callInnkeeper', label: 'Ask the innkeeper to help', next: 'settled' },
  ]),
  talk: end('talk', 'An Hour Passed', 'You talk until the guest grows tired. The innkeeper leaves a meal outside the door, and the guest thanks you for not turning recovery into an examination.'),
  story: end('story', 'A Road Story for Company', 'The guest listens, then falls asleep before you reach the end. You leave the story unfinished and the room quiet.'),
  settled: end('settled', 'A Comfortable Room', 'The shade is raised and the pitcher is within reach. The guest rests; you have made the room easier without claiming to know more than the physician.'),
  rest: end('rest', 'A Quiet Hour', 'The guest sleeps without company. The innkeeper thanks you for respecting the request, and the road remains where it was.'),
});

export const THE_LAMP_LEFT_IN_THE_WINDOW = story('the-lamp-left-in-the-window', 'The Lamp Left in the Window', 'A lamp shines in a house whose owner is away, but the neighbors disagree about what it means.', T('A window lamp is mistaken for a signal; the traveler learns it was placed for a practical reason and must decide whether to correct a rumor.', ['investigation/mystery', 'social interaction'], 'witness', 'mysterious/eerie', 'village street', ['rumor comparison', 'ordinary explanation', 'public correction'], 'accidental encounter'), 'street', {
  street: scene('street', 'A Light after Closing', 'One upstairs window glows in a closed house. A neighbor says it means the owner has returned; another says the owner is away until market day. No one has seen anyone enter.', [
    { id: 'askForPracticalCause', label: 'Ask who last checked the house', next: 'neighbor' },
    { id: 'lookFromStreet', label: 'Look for a safe sign from the street', next: 'window' },
    { id: 'leaveRumorAlone', label: 'Leave the neighbors to their talk', next: 'left' },
  ]),
  neighbor: scene('neighbor', 'A Lamp for the Window Plants', 'A second neighbor remembers the owner asking her to leave the lamp near the window plants during a cold night. The owner is away, but the lamp may have been left burning by mistake.', [
    { id: 'askNeighborToCheck', label: 'Ask the neighbor to use her key', next: 'checked' },
    { id: 'tellTheStreet', label: 'Share the remembered reason', next: 'corrected' },
  ]),
  window: scene('window', 'No Sign of Entry', 'The shutter is closed and the front door is locked. The lamp is an ordinary oil lamp on a table, not a coded signal. The neighbor with a key says she can check it.', [
    { id: 'letKeyholderCheck', label: 'Let the keyholder check inside', next: 'checked' },
    { id: 'doNotEnter', label: 'Do not enter an empty house', next: 'corrected' },
  ]),
  checked: end('checked', 'A Lamp for the Plants', 'The keyholder finds the lamp low and the window plants covered with cloth. She extinguishes the flame and leaves a note for the returning owner.'),
  corrected: end('corrected', 'A Rumor Goes Dark', 'The neighbors stop treating the lamp as proof of a return. The owner’s whereabouts remain ordinary private business.'),
  left: end('left', 'A Light in a Window', 'You leave the lamp and the rumor alone. By morning the window is dark, and no one knows whether the oil simply ran out.'),
});

export const THE_POCKET_IN_THE_CURTAIN = story('the-pocket-in-the-curtain', 'The Pocket in the Curtain', 'A hidden pocket in a hall curtain contains a note addressed to whoever finds it.', T('A theater curtain pocket conceals a note that could embarrass its writer; the traveler may expose, return, or quietly exploit the discovery.', ['investigation/mystery', 'social interaction'], 'opportunist', 'mysterious/eerie', 'town hall stage', ['hidden message', 'privacy and opportunism', 'consequence choice'], 'voluntary curiosity'), 'curtain', {
  curtain: scene('curtain', 'A Pocket Behind the Hem', 'While helping fold a heavy stage curtain, you find a pocket sewn into the hem. It holds a note: “I will not sing the solo. Ask the understudy to take it.” The writer’s name is missing.', [
    { id: 'returnNoteToDirector', label: 'Give the note to the director unopened', next: 'director' },
    { id: 'askSingerPrivately', label: 'Ask the singer about the solo', next: 'singer' },
    { id: 'keepNote', label: 'Keep the note for now', next: 'kept', effects: { historyFlags: ['kept_an_anonymous_stage_note_private'] } },
  ]),
  director: scene('director', 'A Cast Change', 'The director recognizes the handwriting but does not say whose it is. She asks whether you read the note and says the performance can continue without naming anyone.', [
    { id: 'admitReading', label: 'Admit you read the note', next: 'admission' },
    { id: 'askForPrivateChange', label: 'Ask her to change the solo quietly', next: 'quietChange' },
  ]),
  singer: scene('singer', 'A Singer’s Boundary', 'The singer says they asked to step down from the solo because their voice has been failing. They do not want an announcement; they only want the performance to go on.', [
    { id: 'offerToReturnNote', label: 'Offer to return the note unseen', next: 'quietChange' },
    { id: 'askUnderstudy', label: 'Ask whether the understudy is willing', next: 'understudy' },
  ]),
  understudy: scene('understudy', 'The Understudy’s Choice', 'The understudy is willing to take the solo if the singer agrees. They do not want to be described as a replacement for someone who failed.', [
    { id: 'describeAsHerPart', label: 'Present it as Mara’s own part', next: 'performance' },
    { id: 'leaveRoleOpen', label: 'Let the director make the announcement', next: 'quietChange' },
  ]),
  admission: end('admission', 'A Note Read Aloud', 'The director changes the cast list, but the singer knows the note was read. The show goes on; your choice has cost them a measure of privacy.'),
  quietChange: end('quietChange', 'A Solo Reassigned Quietly', 'The director changes the cast list without naming the note’s author. The singer keeps their dignity, and the performance continues.'),
  performance: end('performance', 'A Part Made Their Own', 'The understudy sings the solo as their own part. The audience applauds without learning why it changed, and the first singer remains in the chorus.'),
  kept: end('kept', 'A Note Kept Unused', 'You keep the note. The performance proceeds with the planned solo, and the singer’s request remains private—but unanswered.'),
});

export const THE_TRESTLE_TABLE = story('the-trestle-table', 'The Trestle Table', 'A market table begins to sag just as the seller sets out glass jars.', T('A seller’s display table is unstable; the traveler must decide whether to stop the market, redistribute weight, or risk a costly fall.', ['labor/repair', 'moral prioritization'], 'helper/rescuer', 'tense/dangerous', 'town market', ['visible hazard', 'load redistribution', 'risk and consequence'], 'accidental encounter', ['money/item/knowledge/history possible', 'narrative-only payoff'], 'MODERATE'), 'market', {
  market: scene('market', 'A Table on One Short Leg', 'A trestle table rocks when the seller reaches for a jar. Three heavy glass jars are closest to the unstable end; shoppers stand within arm’s reach.', [
    { id: 'warnSeller', label: 'Warn the seller to stop moving jars', next: 'warning' },
    { id: 'holdLeg', label: 'Hold the short leg steady', hint: 'The jars are heavy and the weak leg is shifting under the load.', chance: { probability: 0.88, successNext: 'held', failureNext: 'cut', successMessage: 'You steady the frame long enough to shift its weight.', failureMessage: 'A jar tips and cuts your hand before you can steady the table.', failureEffects: { health: -1 } } },
    { id: 'moveShoppers', label: 'Ask shoppers to step back', next: 'space' },
  ], 'warning'),
  warning: scene('warning', 'The Seller Looks Down', 'The seller sees the leg shift and sets the jar down. A spare crate can support the table, but the market lane is narrow and customers are passing.', [
    { id: 'fetchCrate', label: 'Fetch the spare crate', next: 'crate' },
    { id: 'clearLane', label: 'Clear a space around the display', next: 'space' },
  ]),
  held: scene('held', 'Weight Still on the Edge', 'Holding the table steadies it, but the jars remain clustered on the weak side. The seller can move them one at a time if someone keeps the frame still.', [
    { id: 'shiftJars', label: 'Help move jars toward the center', next: 'crate' },
    { id: 'askSellerToClose', label: 'Ask the seller to close the stall briefly', next: 'closed' },
  ]),
  space: scene('space', 'A Clear Working Space', 'The lane clears. A child who had been reaching for the nearest jar steps back too. The seller can now close the stall or let you stabilize the table.', [
    { id: 'stabilizeTable', label: 'Stabilize it with the spare crate', next: 'crate' },
    { id: 'closeStall', label: 'Close until the table is repaired', next: 'closed' },
  ]),
  crate: scene('crate', 'The Crate Holds', 'The spare crate supports the short leg, and the jars are moved toward the center. The table now stands level enough for the market, though the old joint still needs repair.', [
    { id: 'finishMarket', label: 'Stay while the seller resumes', next: 'safe' },
    { id: 'askForPayment', label: 'Ask whether the seller can pay for help', next: 'paid' },
  ]),
  closed: end('closed', 'A Stall Closed for Safety', 'The seller closes the stall until the joint can be repaired. No jars break, but a morning of sales is lost; the seller thanks you for avoiding a worse loss.'),
  cut: end('cut', 'A Small Cut, a Closed Stall', 'The jar cuts your hand. The seller closes the stall and wraps the cut with clean cloth; the display is not worth another injury.'),
  safe: end('safe', 'The Jars Stay Whole', 'The seller resumes with the jars away from the weak edge. They offer you a small portion of the day’s takings for the help, or you may leave without it.'),
  paid: end('paid', 'A Coin for Careful Work', 'The seller pays you a coin for keeping the display upright. The table still needs a proper repair; the crate is only a safe stopgap.'),
});

export const THE_FAVOR_RETURNED_IN_FLOUR = story('the-favor-returned-in-flour', 'The Favor Returned in Flour', 'A baker remembers a small kindness and asks the traveler to choose how it should be returned.', T('A baker offers a loaf after the traveler previously helped carry flour; accepting means sharing it at the counter, while a neighbor may need the remaining flour for supper.', ['social interaction', 'negotiation/trade'], 'guest', 'warm/hopeful', 'village bakery', ['conditional favor callback', 'resource choice', 'relationship consequence'], 'invited/known contact', ['lodging/food', 'relationship/referral']), 'bakery', {
  bakery: scene('bakery', 'A Loaf Set Aside', 'The baker recognizes you from an earlier day carrying flour to the mill. She sets aside one warm loaf in thanks. A neighbor has just asked whether any flour remains for a family supper.', [
    { id: 'acceptSack', label: 'Share the loaf at the counter', next: 'accepted' },
    { id: 'askAboutNeighbor', label: 'Ask whether the neighbor can have it', next: 'neighbor' },
    { id: 'declineGift', label: 'Decline and thank the baker', next: 'declined' },
  ]),
  neighbor: scene('neighbor', 'Enough for One Loaf', 'The neighbor needs enough flour for one loaf before evening. The baker can sell her some, give her some, or keep the flour for tomorrow’s baking.', [
    { id: 'letBakerDecide', label: 'Let the baker choose what is fair', next: 'decision' },
    { id: 'offerToPayForNeighbor', label: 'Offer one coin toward the flour', requirements: { minMoney: 1 }, next: 'paidFor', effects: { money: -1 } },
  ]),
  decision: scene('decision', 'A Debt without a Ledger', 'The baker says the flour is hers to give. She does not want your old help turned into a claim on her stock, and the neighbor does not want charity announced.', [
    { id: 'giftNeighborQuietly', label: 'Suggest a quiet measure for the neighbor', next: 'shared' },
    { id: 'keepSackForBaker', label: 'Let the baker keep her flour', next: 'accepted' },
  ]),
  accepted: end('accepted', 'A Gift Freely Given', 'You share the warm loaf at the counter, and the baker keeps her flour for the shop. The earlier favor is repaid in a form she chose; neither of you owes more.'),
  shared: end('shared', 'A Loaf without a Debt', 'The baker measures flour for the neighbor without naming it a gift. She keeps the rest for her ovens, and your earlier help is remembered without becoming a balance due.'),
  paidFor: end('paidFor', 'A Loaf Bought Quietly', 'The baker accepts your coin toward the neighbor’s flour. The neighbor takes the measure without a public explanation, and the baker keeps enough for tomorrow’s baking.'),
  declined: end('declined', 'No Ledger Kept', 'The baker accepts your thanks and keeps the loaf. The favor is not a debt, and neither of you has to settle it further.'),
});

export const THE_STAGE_RIGGING = story('the-stage-rigging', 'The Stage Rigging', 'A rope above a crowded rehearsal room is visibly fraying while a heavy painted flat is raised.', T('A fraying stage rope supports a heavy painted flat over workers; the player must stop the lift or choose a narrow, warned chance to secure it.', ['labor/repair', 'survival', 'moral prioritization'], 'helper/rescuer', 'tense/dangerous', 'town theater stage', ['visible escalating hazard', 'time-pressure sequence', 'rescue/retreat choice'], 'witnesses incident', ['narrative-only payoff'], 'HIGH'), 'stage', {
  stage: scene('stage', 'A Rope under the Flat', 'A painted scenery flat hangs above two stagehands. One rope strand has parted and the load is twisting. The foreman calls for everyone beneath it to move away.', [
    { id: 'shoutClear', label: 'Shout for the stagehands to clear the floor', next: 'clear' },
    { id: 'stopWinch', label: 'Tell the foreman to stop the winch', next: 'stopped' },
    { id: 'grabLooseLine', label: 'Grab the loose line and brace it', hint: 'The load is twisting overhead; the rope may part, and a clear exit matters.', chance: { probability: 0.48, successNext: 'secured', failureNext: 'fatal', successMessage: 'The line catches long enough for the crew to lower the flat.', failureMessage: 'The rope snaps before the load can be steadied.' } },
  ], 'warning'),
  clear: scene('clear', 'The Floor Empties', 'The stagehands move clear, but the flat still hangs above the painted front rows. The foreman can lower it slowly if no one touches the failed line.', [
    { id: 'lowerFromWinch', label: 'Have the foreman lower it slowly', next: 'lowered' },
    { id: 'leaveStage', label: 'Keep everyone clear and wait', next: 'stopped' },
  ], 'warning'),
  stopped: end('stopped', 'The Rehearsal Paused', 'The foreman stops the winch and keeps the room clear until a new rope is fitted. Rehearsal is lost for the evening, but no one stands beneath the failing load.'),
  secured: end('secured', 'A Flat Lowered Safely', 'The crew lowers the scenery flat onto the stage. Your hands are bruised by the rope, but the stagehands are clear and the foreman closes the rig until it is replaced.'),
  lowered: end('lowered', 'A Slow Descent', 'The foreman lowers the flat without anyone beneath it. The rehearsal ends early; the crew marks the broken rope so it cannot be used again.'),
  fatal: end('fatal', 'The Rope Gives Way', 'The frayed rope parts under the twisting load. The painted flat falls before you can reach a clear place.', 'death'),
});

export const THE_BACK_ROOM_LANTERN = story('the-back-room-lantern', 'The Back-Room Lantern', 'A printer has misplaced the type for a memorial notice in a dark storage room.', T('A printer needs help finding a misplaced line of type before the memorial notice is sent; a carried lantern helps, but a daylight search remains possible.', ['labor/repair', 'communication/witness'], 'helper/rescuer', 'melancholy/tragic', 'print shop back room', ['item-supported search', 'time-sensitive work', 'quality consequence'], 'hired/posted work', ['money/item/knowledge/history possible', 'narrative-only payoff']), 'shop', {
  shop: scene('shop', 'Type in the Back Room', 'A printer has lost a line of type for a memorial notice. The storage room is dim, and the press must be cleared before the evening post. Your lantern can light the shelves, but the work can also wait until daylight.', [
    { id: 'useLantern', label: 'Use your lantern to search the shelves', requirements: { items: ['lantern'] }, next: 'shelves', effects: { historyFlags: ['used_the_starting_lantern_for_print_shop_work'] } },
    { id: 'searchByTouch', label: 'Search slowly without a lantern', next: 'slow' },
    { id: 'askPrinterToWait', label: 'Ask the printer to wait until daylight', next: 'daylight' },
  ]),
  shelves: scene('shelves', 'The Correct Letter Found', 'The lantern shows a misplaced “h” among the type. A second line is damaged but readable. You can search once more or tell the printer which line needs resetting.', [
    { id: 'resetType', label: 'Help reset the memorial line', next: 'accurate', effects: { money: 1 } },
    { id: 'leaveDamagedLine', label: 'Use only the readable line', next: 'imperfect' },
  ]),
  slow: scene('slow', 'A Handful of Wrong Letters', 'You find several letters by touch, but cannot tell which is the damaged line. The printer can wait for daylight or run the notice with a space left for correction.', [
    { id: 'leaveSpace', label: 'Leave a blank for the missing line', next: 'imperfect' },
    { id: 'waitDaylight', label: 'Wait for daylight', next: 'daylight' },
  ]),
  accurate: end('accurate', 'A Notice Printed Clearly', 'The memorial notice goes out with the correct line. The printer pays the extra coin for the work, then returns your lantern without asking you to stay for the next job.'),
  imperfect: end('imperfect', 'A Notice with a Blank', 'The printer sends the notice with a clear blank rather than a wrong name. It reaches the post on time, but the family must wait for a corrected copy.'),
  daylight: end('daylight', 'A Careful Delay', 'The printer closes the form until morning. The notice is late, but no uncertain name is printed beneath a memorial announcement.'),
});

export const EVERYDAY_SURPRISE_ADVENTURES = [
  THE_ENVELOPE_UNDER_THE_TEACUP, TWO_DATES_ON_ONE_PHOTOGRAPH, A_NOTICE_PRINTED_BACKWARD,
  SUPPER_AT_THE_INN, THE_COBBLERS_LAST_PAIR, THE_PARCEL_WITH_NO_ADDRESS,
  THE_CLOCK_THAT_KEPT_LOCAL_TIME, THE_PLAY_WITH_AN_UNWRITTEN_ENDING, A_CHAIR_BESIDE_THE_SICKBED,
  THE_LAMP_LEFT_IN_THE_WINDOW, THE_POCKET_IN_THE_CURTAIN, THE_TRESTLE_TABLE,
  THE_FAVOR_RETURNED_IN_FLOUR, THE_STAGE_RIGGING, THE_BACK_ROOM_LANTERN,
];
