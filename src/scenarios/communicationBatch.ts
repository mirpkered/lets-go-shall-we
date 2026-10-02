import { authorBatch } from './secondWaveTools';

export const COMMUNICATION_ADVENTURES = authorBatch([
  {
    id: 'the-telegram', title: 'The Telegram', subtitle: 'A message has arrived, but its recipient is nowhere in sight.', openingTitle: 'At the Telegraph Office', openingContext: 'depot',
    opening: 'The telegraph operator knows you are staying at the station inn and asks a favor: a sealed telegram has arrived for a traveler who left no forwarding address. The name on its outside is smudged, and two guests in the common room have similar surnames. The operator will not open it to guess.',
    runRandomSelections: [{ id: 'telegramMatter', values: [{ value: 'family' }, { value: 'employment' }, { value: 'travel' }] }],
    openingVariants: [
      { requirements: { selections: { telegramMatter: 'family' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a sealed telegram has arrived for a traveler whose family is waiting nearby. The outside name is smudged, and two guests have similar surnames. The operator will not open it to guess.' },
      { requirements: { selections: { telegramMatter: 'employment' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a sealed telegram about a possible position has arrived. The outside name is smudged, and two guests have similar surnames. The operator will not open it to guess.' },
      { requirements: { selections: { telegramMatter: 'travel' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a sealed telegram about a delayed connection has arrived. The outside name is smudged, and two guests have similar surnames. The operator will not open it to guess.' },
    ],
    routes: [
      { id: 'register', label: 'Compare the register with the operator', title: 'A Name in the Book', text: 'The register contains two similar surnames. The operator can confirm which one matches the telegram without showing you its contents.', outcomes: [
        { id: 'deliver', label: 'Ask the operator to deliver it privately', title: 'Message Delivered', text: 'The operator takes the telegram to the matching guest and gives them privacy to read it. You learn nothing more than that it reached the right person.', effects: { historyFlags: ['helped_deliver_a_private_telegram'] } },
        { id: 'wait', label: 'Wait while the operator checks again', title: 'A Careful Match', text: 'A second entry in the ledger settles the spelling. The operator delivers the message themselves, satisfied that no stranger has read it.' },
      ] },
      { id: 'ask', label: 'Ask the operator what may be shared', title: 'Only What Is Needed', text: 'The operator can confirm that the sender asks for a reply, but cannot read private contents aloud. The two likely guests are both in the common room.', outcomes: [
        { id: 'askGuests', label: 'Ask each guest what they recognize', title: 'Two Plausible Names', text: 'One guest recognizes the sender’s town. The other knows a family with the same surname there and says messages sometimes pass between them. Neither can prove who the telegram is for.' },
        { id: 'decline', label: 'Leave the choice to the operator', title: 'Not Your Message', text: 'You decide not to guess. The operator waits for a clearer confirmation before delivering a private message.' },
      ] },
      { id: 'search', label: 'Look for the named traveler at the inn', title: 'A Search of the Common Room', text: 'You ask at the desk and common room without announcing the message. A traveler matching one name is willing to speak with the operator.', outcomes: [
        { id: 'connect', label: 'Bring them to the office door', title: 'A Private Word', text: 'You point the traveler toward the operator, then leave them to speak alone. The station keeps the message private.' },
        { id: 'name', label: 'Give the operator the traveler’s description', title: 'The Operator Takes Over', text: 'The operator recognizes the guest from your description and carries the telegram personally.' },
      ] },
    ],
  },
  {
    id: 'the-wrong-letter', title: 'The Wrong Letter', subtitle: 'A sealed envelope has reached the wrong hands.', openingContext: 'inn',
    opening: 'At breakfast, the innkeeper hands you a sealed letter found beneath your door. It bears another traveler’s name and a nearby town. The seal is intact; the innkeeper asks only whether you can help return it before the morning coach leaves.',
    routes: [
      { id: 'post', label: 'Return it to the post office', title: 'Back to the Post', text: 'The post office is open, and the clerk recognizes the town name. They cannot promise a quick delivery, but the letter can continue through proper hands.', outcomes: [
        { id: 'entrust', label: 'Leave it sealed with the clerk', title: 'A Sealed Return', text: 'The clerk records the mistake and places the envelope with the outgoing mail. You do not learn its contents or whether the recipient will be found.' },
        { id: 'receipt', label: 'Ask for a note confirming its return', title: 'A Small Record', text: 'The clerk writes a brief receipt for the innkeeper. The letter remains sealed and begins another careful journey.' },
      ] },
      { id: 'ask', label: 'Ask the desk about the named traveler', title: 'A Guest by That Name', text: 'The innkeeper remembers a traveler with that surname who departed yesterday. A stablehand may know which road they took.', outcomes: [
        { id: 'coach', label: 'Send it with the morning coach', title: 'A Likely Route', text: 'The coach driver agrees to hand it to the postmaster in the next town, not to open it or leave it unattended.' },
        { id: 'hold', label: 'Leave it safely at the inn', title: 'Held for Its Owner', text: 'The innkeeper stores the envelope in the desk drawer with a note about where it was found. The recipient may return for it.' },
      ] },
      { id: 'curiosity', label: 'Consider opening it, then leave it sealed', title: 'A Private Matter', text: 'Curiosity tugs at you, but the intact seal makes the boundary plain. The letter needs a route, not an audience.', outcomes: [
        { id: 'postAgain', label: 'Ask the clerk to trace the address', title: 'A Better Address', text: 'The clerk reads the outside carefully and finds a more complete street name. They accept it for delivery.' },
        { id: 'leave', label: 'Leave it at the inn desk', title: 'No Further Guessing', text: 'You hand it back to the innkeeper, who keeps it safely for the named traveler. Its contents remain their own.' },
      ] },
    ],
  },
  {
    id: 'the-second-message', title: 'The Second Message', subtitle: 'Two telegrams disagree about what should happen next.', openingContext: 'depot',
    opening: 'A station clerk receives two telegrams for the same farm owner. The earlier says a hired wagon should leave at once; the later says to wait. Both are signed with initials, and the clerk does not know which sender has authority.',
    runRandomSelections: [{ id: 'messageCause', values: [{ value: 'delay' }, { value: 'correction' }, { value: 'interest' }] }],
    openingVariants: [
      { requirements: { selections: { messageCause: 'delay' } }, text: 'A station clerk receives two telegrams for the same farm owner. The first says a hired wagon should leave at once; the later says to wait. The clerk explains that wires were delayed in the storm, so neither arrival time proves which instruction is newest.' },
      { requirements: { selections: { messageCause: 'correction' } }, text: 'A station clerk receives two telegrams for the same farm owner. The earlier says a hired wagon should leave at once; the later says to wait. One may correct the other, but a word in the second is blurred.' },
      { requirements: { selections: { messageCause: 'interest' } }, text: 'A station clerk receives two telegrams for the same farm owner. The earlier says a hired wagon should leave at once; the later says to wait. The initials differ, and both senders appear to have something to gain.' },
    ],
    routes: [
      { id: 'hold', label: 'Hold the wagon briefly', title: 'A Pause at the Yard', text: 'The wagon is ready but not yet hitched. The clerk can wait a little while for the farm owner to answer from the telegraph office down the line.', outcomes: [
        { id: 'confirm', label: 'Ask for confirmation by wire', title: 'A Clearer Instruction', text: 'A short reply arrives confirming the later message. The wagon stays in the yard, and the clerk records why it waited.' },
        { id: 'release', label: 'Let the owner decide in person', title: 'No Guess Made', text: 'The farm owner arrives and takes responsibility for the choice. You have prevented a rushed assumption, not chosen the job for them.' },
      ] },
      { id: 'deliverBoth', label: 'Show both messages to the owner', title: 'The Whole Record', text: 'You carry both sealed copies to the farm owner, explaining only the difference in instructions. Their decision can account for both senders.', outcomes: [
        { id: 'follow', label: 'Leave the choice with the owner', title: 'Their Decision', text: 'The owner studies the wording, makes a choice, and tells the clerk directly. You do not need to decide which sender to trust.' },
        { id: 'record', label: 'Ask the clerk to preserve both copies', title: 'A Record Kept', text: 'The clerk keeps both messages together in the station book. The owner can act without one instruction disappearing from the record.' },
      ] },
      { id: 'sender', label: 'Ask who paid to send each message', title: 'Two Senders', text: 'The clerk checks the receipts. Different people paid for the messages, but the receipts cannot establish their motives or authority.', outcomes: [
        { id: 'report', label: 'Tell the owner who sent them', title: 'Useful, Not Decisive', text: 'The owner now knows who sent each telegram and still weighs both instructions. The receipts answer one question, not the whole matter.' },
        { id: 'abstain', label: 'Avoid choosing between them', title: 'No False Certainty', text: 'You decline to turn the receipts into proof of intent. The owner and clerk handle the dispute without your guess.' },
      ] },
    ],
  },
  {
    id: 'wire-down', title: 'Wire Down', subtitle: 'A message matters, but the line has gone quiet.', openingContext: 'depot',
    opening: 'A telegraph operator finds the line dead before a scheduled market notice can be sent to the next town. A repair crew is already looking for the break. The operator asks whether you can carry one short sealed message to the next station.',
    routes: [
      { id: 'carry', label: 'Carry the sealed message', title: 'The Road Station to Station', text: 'The operator gives you a sealed envelope, the destination, and a small payment for the ride. You are a messenger, not a wire repairer.', timeCost: 20, outcomes: [
        { id: 'deliver', label: 'Hand it to the receiving clerk', title: 'Message Delivered', text: 'The other clerk signs a receipt and sends a runner to the market office. The operator’s words reach their destination without you touching the line.' },
        { id: 'wait', label: 'Wait for a receipt before returning', title: 'A Confirmed Delivery', text: 'You bring back the receiving clerk’s note. The route took longer, but the sender knows the message arrived.' },
      ] },
      { id: 'crew', label: 'Ask where the repair crew is searching', title: 'A Break in the Line', text: 'The operator marks the likely stretch on a paper map. A crew has gone out with poles and tools; they do not need an untrained stranger climbing the wire.', outcomes: [
        { id: 'find', label: 'Bring the crew fresh water', title: 'A Small Help', text: 'You find the crew at a roadside pole and bring water from the station. They have located a fallen branch, not yet the line break.' },
        { id: 'return', label: 'Return with their report', title: 'Word at the Office', text: 'The crew says the break lies farther west. The operator can tell waiting customers what is known and what remains uncertain.' },
      ] },
      { id: 'priority', label: 'Ask which message cannot wait', title: 'A Short List', text: 'The operator names two messages: a market delivery and a family note. Neither is a life-or-death emergency, but the market closes first.', outcomes: [
        { id: 'market', label: 'Carry the market notice first', title: 'The Earlier Closing', text: 'You take the market notice to the next station. The family note can wait for the repaired wire or another rider.' },
        { id: 'family', label: 'Offer to carry the family note', title: 'A Personal Message', text: 'You take the family note first at the sender’s request. The market will lose an hour, not its whole day.' },
      ] },
    ],
  },
  {
    id: 'the-last-train-message', title: 'The Last Train Message', subtitle: 'One message, one departure, and only a little time to decide.', openingContext: 'depot',
    opening: 'A station clerk receives a note for a passenger waiting on the platform. The last train leaves soon. The sender is known to the clerk, but the note was delivered by a porter who has already gone to the baggage car.',
    timePhases: [{ id: 'platform', label: 'At the platform', atMinutes: 0 }, { id: 'boarding', label: 'Boarding begins', atMinutes: 8 }, { id: 'departure', label: 'The train is ready to leave', atMinutes: 15 }],
    routes: [
      { id: 'deliver', label: 'Take the note to the passenger', title: 'A Note Before Boarding', text: 'The passenger is beside the platform bench with a bag at their feet. You can hand over the note without deciding what it means.', timeCost: 3, outcomes: [
        { id: 'private', label: 'Give it privately', title: 'Read Before Departure', text: 'The passenger reads the note away from the waiting crowd and decides whether to board. You do not ask them to explain.' },
        { id: 'wait', label: 'Wait while they choose', title: 'A Choice Made in Time', text: 'The passenger takes a moment, then boards—or stays—by their own decision. The train leaves with no one else deciding for them.' },
      ] },
      { id: 'verify', label: 'Ask the clerk to confirm the sender', title: 'A Familiar Hand', text: 'The clerk recognizes the sender’s handwriting from the station book. That confirms the writer, though not whether the message is complete.', timeCost: 4, outcomes: [
        { id: 'carry', label: 'Deliver it with the clerk’s confirmation', title: 'A More Certain Delivery', text: 'You carry the note to the passenger and explain who confirmed it. They now have a little more context and still make their own choice.' },
        { id: 'hold', label: 'Ask the clerk to keep it for later', title: 'No Forced Interruption', text: 'The passenger boards without interruption. The clerk keeps the note in case the sender returns to claim it.' },
      ] },
      { id: 'porter', label: 'Look for the porter who brought it', title: 'Across the Platform', text: 'The porter is helping with trunks at the baggage car. They can tell you where the note came from, but do not know its contents.', timeCost: 5, outcomes: [
        { id: 'return', label: 'Take the note back to its sender', title: 'Returned Unopened', text: 'The sender is still near the station gate and chooses to approach the passenger directly. You have not delayed the train.' },
        { id: 'deliverNow', label: 'Bring the note to the platform', title: 'Just Before Departure', text: 'You reach the passenger before the conductor’s call and hand over the note. Whether they travel is their decision.' },
      ] },
    ],
  },
]);

// Delivery is the hinge, not the terminal: after the passenger reads the note,
// show the choice it prompted and let the Traveler decide whether to carry a
// limited reply. Keep the old terminal nodes in place for active-save safety.
const lastTrainMessage = COMMUNICATION_ADVENTURES.find(({ id }) => id === 'the-last-train-message')!;
for (const outcomeId of ['deliver-private', 'deliver-wait', 'verify-carry', 'porter-deliverNow']) {
  const previousEnding = lastTrainMessage.scenes[outcomeId];
  if (previousEnding) previousEnding.ending = 'success';
  const parentChoice = Object.values(lastTrainMessage.scenes).flatMap(({ choices }) => choices).find(({ next }) => next === outcomeId);
  if (parentChoice) parentChoice.next = 'passengerDecision';
}
lastTrainMessage.scenes.passengerDecision = {
  id: 'passengerDecision', title: 'A Choice before the Whistle',
  text: 'The passenger folds the note, hands the conductor their ticket, and steps back from the last train. They will stay for the next one. They ask you to tell the sender only that the message was received; its words remain private.',
  choices: [
    { id: 'carryReceipt', label: 'Offer to carry that brief reply', next: 'receiptCarried', effects: { historyFlags: ['carried a private receipt after a passenger chose to miss the last train'] } },
    { id: 'leaveReplyPrivate', label: 'Respect their privacy and leave it there', next: 'privacyKept', effects: { historyFlags: ['respected a passenger’s privacy after a delayed departure'] } },
  ],
};
lastTrainMessage.scenes.receiptCarried = {
  id: 'receiptCarried', title: 'Only the Necessary Words',
  text: 'You carry back only the fact that the passenger received the note and chose to stay. The sender thanks you without asking what was written; the train departs without them.', ending: 'success', choices: [],
};
lastTrainMessage.scenes.privacyKept = {
  id: 'privacyKept', title: 'A Message Kept Private',
  text: 'You leave the passenger to their decision and carry no answer back. They remain on the platform as the train departs, with the note still their own.', ending: 'success', choices: [],
};
const heldLastTrain = lastTrainMessage.scenes['verify-hold'];
if (heldLastTrain) heldLastTrain.text = 'The passenger boards without interruption. The clerk keeps the sealed note for the sender to claim; you chose not to deliver a message whose recipient could not be reached in time.';
const returnedLastTrain = lastTrainMessage.scenes['porter-return'];
if (returnedLastTrain) returnedLastTrain.text = 'The sender is still near the station gate and approaches the passenger directly. They exchange a few private words; the passenger stays behind as the train leaves, and you do not learn what was written.';

// The recipient clue is a midpoint, not an automatic delivery ending: the traveler
// must weigh two plausible guests and decide how much verification is appropriate.
const telegram = COMMUNICATION_ADVENTURES.find(({ id }) => id === 'the-telegram')!;
const recipientClue = telegram.scenes['ask-askGuests'];
recipientClue.ending = undefined;
recipientClue.choices = [
  { id: 'checkRegister', label: 'Ask the operator to check the register', next: 'recipientVerified' },
  { id: 'hearSecondGuest', label: 'Ask the other guest what they know', next: 'recipientSecondAccount' },
];
telegram.scenes.recipientSecondAccount = {
  id: 'recipientSecondAccount', title: 'A Family Connection',
  text: 'The second guest knows the sender’s family but says the telegram is probably meant for the other branch of the household. They are willing to let the operator compare the outside address with the register; neither guest asks to see the message.',
  choices: [
    { id: 'verifyAfterAccount', label: 'Let the operator compare names privately', next: 'recipientVerified' },
    { id: 'holdAfterAccount', label: 'Keep it sealed until the sender replies', next: 'recipientHeld' },
  ],
};
telegram.scenes.recipientVerified = {
  id: 'recipientVerified', title: 'The Name in the Register',
  text: 'The operator compares the legible town on the envelope with the two register entries and finds the matching guest’s full surname in an earlier station note. The other guest recognizes the family but not the named traveler. The message stays sealed.',
  choices: [
    { id: 'deliverVerified', label: 'Deliver it privately to the match', next: 'recipientDelivered', effects: { knowledge: ['At the station inn, a town clue and the register distinguished two guests with similar surnames without opening a private telegram.'], historyFlags: ['helped deliver a private telegram to its verified recipient'] } },
    { id: 'holdVerified', label: 'Let the operator wait for confirmation', next: 'recipientHeld' },
  ],
};
telegram.scenes.recipientDelivered = {
  id: 'recipientDelivered', title: 'The Right Recipient',
  text: 'The operator carries the sealed telegram to the matching guest in private. The other guest returns to supper without being made to explain their family connection, and the message reaches the person named on its outside.',
  ending: 'success', choices: [],
};
telegram.scenes.recipientHeld = {
  id: 'recipientHeld', title: 'A Message Kept Sealed',
  text: 'The operator records why the delivery is delayed and keeps the telegram locked in the office. The two guests are spared a public guess, and the sender will be asked to confirm the full name.',
  ending: 'success', choices: [],
};
