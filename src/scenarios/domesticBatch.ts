import { authorBatch } from './secondWaveTools';

export const DOMESTIC_ADVENTURES = authorBatch([
  {
    id: 'the-will', title: 'The Will', subtitle: 'A family reads the same final request in different ways.',
    opening: 'You are lodging with a family when a letter arrives from a solicitor in the county seat. Their late aunt asked that her sewing chest go to the niece who cared for her, but the paper names no one. One cousin says it was meant for her; another says the aunt promised it to the youngest.',
    routes: [
      { id: 'read', label: 'Ask the family to read the letter together', title: 'The Words on the Page', text: 'The letter confirms the aunt’s request but gives no legal description of the chest. It praises several relatives, which has not made the disagreement easier.', outcomes: [
        { id: 'talk', label: 'Suggest they agree on a temporary keeper', title: 'A Chest Kept Safe', text: 'The cousins place the chest in a dry room while they ask the solicitor what the letter can settle. No one has to surrender a claim today.' },
        { id: 'stepBack', label: 'Leave them to decide among themselves', title: 'Family Business', text: 'You make clear the letter is theirs to interpret with the solicitor. The family continues talking after you return to your room.' },
      ] },
      { id: 'memory', label: 'Ask what each person remembers', title: 'Three Memories', text: 'One cousin recalls being promised the chest; another remembers only that the aunt wanted the sewing kept together. Neither memory is a signed instruction.', outcomes: [
        { id: 'share', label: 'Repeat both accounts without choosing', title: 'Both Accounts Heard', text: 'The family listens to each recollection. It does not settle ownership, but it makes the disagreement less dependent on one person’s version.' },
        { id: 'solicitor', label: 'Recommend asking the solicitor', title: 'A Practical Next Step', text: 'A cousin agrees to write to the solicitor, who can explain the paper’s limits. You do not act as judge or executor.' },
      ] },
      { id: 'chest', label: 'Ask whether the chest can be inventoried', title: 'A List, Not a Ruling', text: 'The relatives open the chest together and list the sewing tools and cloth inside. The inventory may prevent later confusion, but it does not identify the rightful recipient.', outcomes: [
        { id: 'copy', label: 'Write a copy for each cousin', title: 'A Shared Record', text: 'Each cousin takes the same list. They can ask the solicitor about the request without arguing over what the chest contained.' },
        { id: 'close', label: 'Close it and leave it in the room', title: 'No One Takes It', text: 'The chest remains with the household until the family agrees what to do. You leave the question where it belongs.' },
      ] },
    ],
  },
  {
    id: 'home-before-dark', title: 'Home Before Dark', subtitle: 'A young person has left after an argument and wants space.',
    opening: 'A family at a wayside inn asks whether you have seen their seventeen-year-old son, who left after an argument about taking work in another town. They have heard he may be at the old orchard a mile east. They want to know he is safe, but do not ask you to bring him back by force.',
    routes: [
      { id: 'orchard', label: 'Walk to the old orchard', title: 'At the Orchard Gate', text: 'The young man sits on a dry stone wall beside the public lane. He is not hurt and says he left to think, not to disappear. He does not want to return to the argument yet.', outcomes: [
        { id: 'carryMessage', label: 'Offer to carry a message back', title: 'A Message, Not a Return', text: 'He gives you a short note saying he is safe and will speak tomorrow. His family receives the reassurance without being told to expect him home tonight.' },
        { id: 'leaveSpace', label: 'Respect his wish to sit alone', title: 'Room to Decide', text: 'You tell the family where he is and that he is safe, with his permission. They agree to wait until morning before asking him to come back.' },
      ] },
      { id: 'family', label: 'Ask the family what they fear most', title: 'Concern at the Inn', text: 'The parents are worried about the dark road but admit their argument was about work, not danger. They want news more than obedience.', outcomes: [
        { id: 'check', label: 'Check the orchard and return with news', title: 'Safe for the Night', text: 'You find him at the orchard and report that he is safe. The family leaves the next conversation for daylight.' },
        { id: 'wait', label: 'Suggest they leave a lamp at the door', title: 'A Light Left Burning', text: 'The family leaves a lamp and a note saying the door is open. Whether he comes back tonight remains his choice.' },
      ] },
      { id: 'message', label: 'Ask the innkeeper to carry word east', title: 'Word Along the Lane', text: 'The innkeeper knows a farmhand going that way and can send a simple message without turning a family disagreement into a public search.', outcomes: [
        { id: 'send', label: 'Ask only that he let them know he is safe', title: 'A Quiet Reply', text: 'The farmhand returns with word that the young man is safe and asks for time. The family agrees not to send another searcher tonight.' },
        { id: 'decline', label: 'Let the family decide whether to send it', title: 'A Choice Left at Home', text: 'You give the family the option and do not press them. They decide together to wait until morning.' },
      ] },
    ],
  },
  {
    id: 'the-visitor', title: 'The Visitor', subtitle: 'An estranged relative appears at a house where you are working.',
    opening: 'You are helping serve supper at a boarding house when an older woman arrives asking for her brother. They have not spoken in years. The brother is inside, and his adult daughter says he should be allowed to decide whether to see her.',
    routes: [
      { id: 'pass', label: 'Carry a message to the brother', title: 'A Note at the Door', text: 'You carry the visitor’s short message to the brother without adding your own opinion. He asks for a few minutes before answering.', outcomes: [
        { id: 'meet', label: 'Tell the visitor he will speak briefly', title: 'A First Conversation', text: 'The brother agrees to meet in the quiet parlor. The daughter remains nearby if either wants her, but no one insists on a reconciliation.' },
        { id: 'decline', label: 'Tell her he is not ready', title: 'Not Tonight', text: 'The brother asks to wait until morning. The visitor leaves an address where he can write if he chooses.' },
      ] },
      { id: 'shelter', label: 'Offer the visitor tea in the common room', title: 'A Seat and a Cup', text: 'The innkeeper sets tea near the stove while the family decides what it wants. The visitor has a place to sit without being promised entry to the private rooms.', outcomes: [
        { id: 'stay', label: 'Let her remain until morning', title: 'A Night at the Inn', text: 'The innkeeper offers a modest room at the usual price. The brother has time to think, and the visitor has shelter without a forced meeting.' },
        { id: 'leave', label: 'Help her find the next coach', title: 'Another Road', text: 'The visitor chooses to continue to her cousin’s town. She leaves a note for her brother, but asks no one to make him answer.' },
      ] },
      { id: 'stepAway', label: 'Stay out of the family conversation', title: 'A Private Matter', text: 'You return to the supper room and let the brother, daughter, and visitor speak for themselves. They can ask for you if a practical task arises.', outcomes: [
        { id: 'work', label: 'Continue serving supper', title: 'The House Goes On', text: 'Supper is served. The family’s decision remains private, and the boarding house keeps its ordinary rhythm.' },
        { id: 'check', label: 'Ask later whether a room is needed', title: 'A Practical Offer', text: 'The daughter asks you to reserve a room for the visitor but makes no promise about a meeting. You pass the request to the keeper.' },
      ] },
    ],
  },
  {
    id: 'the-back-door', title: 'The Back Door', subtitle: 'Someone asks for a discreet way to leave an unsafe home.',
    opening: 'While you are lodging at a farm, a resident quietly tells you they do not feel safe at home and asks for help leaving tonight. They have a coat and a small bag ready. Their partner is in the front room. You are not asked to confront or punish anyone.',
    routes: [
      { id: 'privacy', label: 'Ask what kind of help feels safest', title: 'A Quiet Plan', text: 'They ask to reach a trusted aunt in the next village and do not want their destination shared with the household. You let them set the pace.', outcomes: [
        { id: 'ride', label: 'Arrange a hired cart to the aunt’s', title: 'A Ride Chosen by Them', text: 'The farm owner hires a cart under an ordinary errand and gives the passenger the fare. They choose the route and leave without a confrontation.' },
        { id: 'walk', label: 'Walk with them to a public inn', title: 'A Place with Other People', text: 'You accompany them to a nearby inn where they can contact the aunt by letter in the morning. You share only what they have approved.' },
      ] },
      { id: 'message', label: 'Offer to send a sealed note', title: 'A Message on Their Terms', text: 'They write a short note to the aunt and ask that no other relative be told where they are. You can carry it without reading it.', outcomes: [
        { id: 'deliver', label: 'Take the note directly to the aunt', title: 'A Trusted Door', text: 'The aunt meets them at the lane and lets them choose what to say. Your part ends with the note delivered and their privacy kept.' },
        { id: 'lodging', label: 'Find a room before making contact', title: 'Shelter First', text: 'The innkeeper offers a room under the traveler’s own name and agrees not to send word back. The aunt can be contacted when the person is ready.' },
      ] },
      { id: 'shelter', label: 'Ask the farm owner for a private room', title: 'A Door That Closes', text: 'The farm owner agrees to provide a room and asks no questions in front of the household. The person decides whether to leave now or wait until the yard is quiet.', outcomes: [
        { id: 'leave', label: 'Leave by the rear lane now', title: 'Out of the House', text: 'The person takes the lane to the aunt’s home, and you go only as far as they request. No argument is staged or demanded.' },
        { id: 'wait', label: 'Wait in the private room until dawn', title: 'A Safer Hour', text: 'They choose to rest behind a closed door while the farm owner stays nearby. In the morning they can decide where to go next.' },
      ] },
    ],
  },
]);
