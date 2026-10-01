import { authorBatch } from './secondWaveTools';

export const MISTAKEN_IDENTITY_ADVENTURES = authorBatch([
  {
    id: 'you-must-be-the-new-man', title: 'You Must Be the New Man', subtitle: 'A foreman expects a worker, and you have arrived at the wrong moment.',
    opening: 'At a roadside sawmill, the foreman sees your travel bag and assumes you are the new tally clerk. The actual clerk was expected before noon. A stack of boards needs counting, and the foreman has not yet asked your name.',
    routes: [
      { id: 'correct', label: 'Explain that you are only passing through', title: 'The Mistake Corrected', text: 'The foreman apologizes and asks whether you can spare a few minutes while the real clerk is delayed. You may say no without consequence.', outcomes: [
        { id: 'decline', label: 'Thank him and continue down the road', title: 'No Job Taken', text: 'The foreman points you toward the road and sends a boy to look for the clerk. You leave without becoming part of the mill’s day.' },
        { id: 'help', label: 'Count the boards with the millhand', title: 'A Short Tally', text: 'The millhand reads each chalk mark while you count. The foreman pays you one coin for the brief help, not the full clerk’s wage.', effects: { money: 1 } },
      ] },
      { id: 'temporary', label: 'Offer to keep a simple tally', title: 'A Page of Numbers', text: 'You agree to copy the number of boards as the millhand calls it. The foreman checks each bundle before entering it in his own book.', outcomes: [
        { id: 'finish', label: 'Finish the count', title: 'The Count Is Complete', text: 'The stack is counted and the foreman compares your page with the delivery note. He pays one coin for the work.' , effects: { money: 1 } },
        { id: 'stop', label: 'Stop when the real clerk arrives', title: 'Handed Over', text: 'The clerk arrives from the town road and takes the page from you. The foreman thanks you for keeping the count orderly.' },
      ] },
      { id: 'ask', label: 'Ask when the expected clerk was last seen', title: 'A Late Arrival', text: 'The foreman says the clerk left town yesterday to visit family and may have missed the morning coach. Nothing suggests trouble; the work simply needs someone for an hour.', outcomes: [
        { id: 'wait', label: 'Wait for the clerk before taking a task', title: 'The Right Person Arrives', text: 'The clerk arrives near noon and explains they took the road after the coach. The foreman hands the work back without fuss.' },
        { id: 'walk', label: 'Leave before the shift begins', title: 'Another Day at the Mill', text: 'You leave the foreman and millhand to sort out the count. The sawmill continues at its ordinary pace.' },
      ] },
    ],
  },
  {
    id: 'thats-him', title: 'That’s Him', subtitle: 'A vague description points at the wrong traveler.',
    opening: 'At a depot, a shopkeeper mistakes you for a traveler who left a meal unpaid in the next town. The person wore a dark coat and carried a canvas bag—common enough details. The shopkeeper is embarrassed but wants to know whether you recognize the name.',
    routes: [
      { id: 'explain', label: 'Give your name and where you came from', title: 'A Different Traveler', text: 'The shopkeeper listens and realizes the description fits half the platform. They do not demand money or ask you to prove a negative.', outcomes: [
        { id: 'clear', label: 'Let the shopkeeper correct the record', title: 'An Apology Offered', text: 'The shopkeeper apologizes and promises not to repeat the guess as fact. You return to your own journey.' },
        { id: 'note', label: 'Offer to write your route on a card', title: 'A Simple Clarification', text: 'You note which train you arrived on and where you are bound. The shopkeeper keeps it only to correct their own memory.' },
      ] },
      { id: 'ask', label: 'Ask for the person’s full name', title: 'Only a First Name', text: 'The shopkeeper knows only a first name and a meal left on the bill. They admit the traveler may have paid at another counter.', outcomes: [
        { id: 'no', label: 'Say you cannot identify the person', title: 'No Guess Made', text: 'You do not claim to recognize anyone. The shopkeeper decides to ask the next town directly instead of confronting strangers.' },
        { id: 'help', label: 'Suggest checking the shop’s account book', title: 'A Name in the Ledger', text: 'The shopkeeper checks the book and finds that the meal was marked paid after all. The resemblance was coincidence.' },
      ] },
      { id: 'leave', label: 'Decline to discuss a stranger’s account', title: 'Your Business Elsewhere', text: 'You tell the shopkeeper the description is not enough to identify anyone. They accept the correction and let you pass.', outcomes: [
        { id: 'continue', label: 'Board your train', title: 'A Small Mistake', text: 'The train leaves on time. The shopkeeper stays behind to check the account book.' },
        { id: 'wait', label: 'Wait for the clerk to finish checking', title: 'A Brief Delay', text: 'The shopkeeper finds the paid mark and apologizes before you board. No one was cheated.' },
      ] },
    ],
  },
  {
    id: 'we-were-expecting-someone-else', title: 'We Were Expecting Someone Else', subtitle: 'A household mistakes a traveler for the person hired to repair its stove.',
    opening: 'You arrive at a farmhouse inn just as the keeper welcomes you as the stove repairer expected from town. The stove works, but its iron door rattles when opened. The keeper is relieved to see you and has not yet noticed your travel clothes.',
    routes: [
      { id: 'correct', label: 'Explain that you are not the repairer', title: 'A Different Guest', text: 'The keeper laughs at the mix-up and asks whether the door can wait until tomorrow. The house has a second working stove in the kitchen.', outcomes: [
        { id: 'stay', label: 'Take a room and leave the repair for tomorrow', title: 'A Bed for the Night', text: 'The keeper gives you the usual room rate and sends a message for the repairer. You are a guest, not an expert.' , effects: { money: -1 }, requirements: { minMoney: 1 } },
        { id: 'walk', label: 'Continue to the next inn', title: 'Another Place to Stay', text: 'You thank the keeper and continue along the road. The spare stove keeps the household comfortable.' },
      ] },
      { id: 'simple', label: 'Offer to hold the lamp while they inspect it', title: 'Light on the Stove Door', text: 'The keeper knows the stove and checks the hinge while you hold a lantern. The latch is loose, but neither of you attempts a repair without the proper person.', outcomes: [
        { id: 'wait', label: 'Wait for the repairer to arrive', title: 'The Expected Worker', text: 'The repairer arrives the next morning with a replacement pin. The keeper thanks you for keeping the area clear.' },
        { id: 'leave', label: 'Step away and let the keeper handle it', title: 'A Working Stove Remains', text: 'The kitchen stove remains in use while the keeper waits for the repairer. You continue your own plans.' },
      ] },
      { id: 'ask', label: 'Ask whether the repairer can be reached', title: 'A Message Sent', text: 'The keeper has sent a note to the village smith, who knows the repairer’s route. The stove can be left alone until an answer arrives.', outcomes: [
        { id: 'message', label: 'Carry the note to the smith', title: 'Word Delivered', text: 'The smith says the repairer is due tomorrow and sends the keeper a clear answer. The spare stove is enough for tonight.' },
        { id: 'rest', label: 'Leave the household to wait', title: 'A Simple Mix-Up', text: 'The keeper thanks you for checking. You take your room or continue on, with no expectation to fix anything.' },
      ] },
    ],
  },
  {
    id: 'the-package', title: 'The Package', subtitle: 'A parcel is handed to the wrong traveler, and its label is clear.',
    opening: 'At a coach stop, the clerk hands you a small wrapped parcel with a receipt bearing another person’s name. The parcel is tied shut and undamaged. The recipient is staying at the inn across the square, but the coach leaves soon.',
    routes: [
      { id: 'return', label: 'Return it to the coach clerk', title: 'Back to the Counter', text: 'The clerk checks the receipt and confirms it was meant for the inn guest. They can send it over with the next porter.', outcomes: [
        { id: 'leave', label: 'Leave the parcel with the clerk', title: 'A Delivery Arranged', text: 'The clerk records the error and places the parcel in the outgoing basket. Its wrapping remains intact.' },
        { id: 'carry', label: 'Carry it to the inn yourself', title: 'A Short Errand', text: 'The clerk confirms the address, and you carry the parcel across the square.' },
      ] },
      { id: 'deliver', label: 'Ask the innkeeper to find the recipient', title: 'A Name at the Inn', text: 'The innkeeper recognizes the name but asks you not to call it out across the room. The guest is resting upstairs.', outcomes: [
        { id: 'private', label: 'Leave it at the desk with the name', title: 'Held for Its Owner', text: 'The innkeeper stores the parcel in the desk drawer and sends a private note upstairs. The guest collects it when ready.' },
        { id: 'wait', label: 'Wait while the innkeeper asks permission', title: 'A Direct Handoff', text: 'The guest says it is theirs and comes downstairs to collect it. The wrapping is still tied shut.' },
      ] },
      { id: 'label', label: 'Read the address carefully', title: 'A Smudged Town Name', text: 'The destination is clear but the street is not. The clerk recognizes the sender’s shop and can verify the intended recipient without opening the parcel.', outcomes: [
        { id: 'verify', label: 'Ask the clerk to confirm the recipient', title: 'The Right Person', text: 'The sender’s shop confirms the name. The clerk sends the parcel to the inn with a porter.' },
        { id: 'decline', label: 'Leave it unopened at the counter', title: 'No Guess Needed', text: 'You leave the parcel in the clerk’s care. The coach can carry it back to the sender if the address cannot be confirmed.' },
      ] },
    ],
  },
]);
