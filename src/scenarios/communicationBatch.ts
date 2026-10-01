import { authorBatch } from './secondWaveTools';

export const COMMUNICATION_ADVENTURES = authorBatch([
  {
    id: 'the-telegram', title: 'The Telegram', subtitle: 'A message has arrived, but its recipient is nowhere in sight.', openingTitle: 'At the Telegraph Office', openingContext: 'depot',
    opening: 'The telegraph operator knows you are staying at the station inn and asks a favor: a telegram has arrived for a traveler who left no forwarding address. The message is sealed. The operator has checked the hotel register and found a likely recipient, but the name is smudged.',
    runRandomSelections: [{ id: 'telegramMatter', values: [{ value: 'family' }, { value: 'employment' }, { value: 'travel' }] }],
    openingVariants: [
      { requirements: { selections: { telegramMatter: 'family' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a telegram has arrived for a traveler whose family is waiting nearby. The message is sealed. The operator has checked the hotel register and found a likely recipient, but the name is smudged.' },
      { requirements: { selections: { telegramMatter: 'employment' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a telegram about a possible position has arrived for a traveler who left no forwarding address. The message is sealed. The operator has checked the hotel register and found a likely recipient, but the name is smudged.' },
      { requirements: { selections: { telegramMatter: 'travel' } }, text: 'The telegraph operator knows you are staying at the station inn and asks a favor: a telegram about a delayed connection has arrived for a traveler who left no forwarding address. The message is sealed. The operator has checked the hotel register and found a likely recipient, but the name is smudged.' },
    ],
    routes: [
      { id: 'register', label: 'Compare the register with the operator', title: 'A Name in the Book', text: 'The register contains two similar surnames. The operator can confirm which one matches the telegram without showing you its contents.', outcomes: [
        { id: 'deliver', label: 'Ask the operator to deliver it privately', title: 'Message Delivered', text: 'The operator takes the telegram to the matching guest and gives them privacy to read it. You learn nothing more than that it reached the right person.', effects: { historyFlags: ['helped_deliver_a_private_telegram'] } },
        { id: 'wait', label: 'Wait while the operator checks again', title: 'A Careful Match', text: 'A second entry in the ledger settles the spelling. The operator delivers the message themselves, satisfied that no stranger has read it.' },
      ] },
      { id: 'ask', label: 'Ask the operator what may be shared', title: 'Only What Is Needed', text: 'The operator can confirm that the sender asks for a reply, but cannot read private contents aloud. The two likely guests are both in the common room.', outcomes: [
        { id: 'askGuests', label: 'Ask each guest which sender they know', title: 'The Right Recipient', text: 'One guest recognizes the sender’s town and name. The operator carries the sealed telegram to them without opening it.' },
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
