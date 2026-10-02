import { authorBatch } from './secondWaveTools';

export const MEDICAL_CARE_ADVENTURES = authorBatch([
  {
    id: 'the-long-night', title: 'The Long Night', subtitle: 'A household asks for company until morning.',
    opening: 'At a modest boarding house, a family member has a high fever and is resting in a cool room. A doctor has been sent for, but cannot come until morning. The family asks whether you can lend a hand; no one expects you to treat the illness.',
    routes: [
      { id: 'water', label: 'Fetch fresh water', title: 'A Basin by the Bed', text: 'You bring clean water and set it within the patient’s reach. Their breathing remains steady, and the family keeps watch without crowding the room.', outcomes: [
        { id: 'remain', label: 'Stay nearby through the next hour', title: 'Company in the Quiet', text: 'You keep the water close and speak when the patient wakes. The fever has not broken, but the room is calmer and someone is there when help is needed.', effects: { historyFlags: ['sat_with_a_fevered_boarder'] } },
        { id: 'rest', label: 'Let the family take the next watch', title: 'A Shared Watch', text: 'A relative takes your place, knowing where the water is and when the doctor is expected. You have helped without pretending that company is a cure.' },
      ] },
      { id: 'family', label: 'Give an exhausted relative a rest', title: 'A Turn Away from the Bed', text: 'The patient’s sister has been awake for hours. You offer to sit in the next room while she eats and closes her eyes.', outcomes: [
        { id: 'quiet', label: 'Keep the house quiet', title: 'An Hour of Rest', text: 'The household settles. Nothing dramatic changes, but one tired person returns to the bedside less alone.' },
        { id: 'call', label: 'Ask the neighbor to stay as well', title: 'More Hands, No Crowd', text: 'A nearby neighbor agrees to take the next watch. The family now has enough company to rest in turns.' },
      ] },
      { id: 'help', label: 'Ask when the doctor was sent for', title: 'The Doctor’s Expected Road', text: 'The family tells you which road the doctor is taking and what signs would make them send for help sooner. They know the patient’s habits better than you do.', outcomes: [
        { id: 'wait', label: 'Stay until the doctor arrives', title: 'Morning at the Door', text: 'You keep company until a knock announces the doctor. The family can explain the night while the professional takes over.' },
        { id: 'step', label: 'Leave once another adult takes the watch', title: 'A Careful Departure', text: 'You make sure another adult is present and leave the household to its own plan and the approaching doctor.' },
      ] },
    ],
  },
  {
    id: 'the-doctor-is-three-miles-away', title: 'The Doctor Is Three Miles Away', subtitle: 'A patient, a long road, and no certainty about how quickly to travel.',
    opening: 'A farmhand has taken suddenly ill at a roadside inn. The nearest doctor lives three miles away, and rain has softened the lane. The patient is awake and answering, but looks worse than an hour ago. The innkeeper asks for help deciding how to reach professional care.',
    routes: [
      { id: 'ride', label: 'Take the innkeeper’s steady horse', title: 'A Ride on the Firm Road', text: 'The innkeeper offers a sound horse and points out the firmer lane. You can ride for the doctor, though the trip will still take time.', timeCost: 10, outcomes: [
        { id: 'arrive', label: 'Ask the doctor to come at once', title: 'Help on the Road', text: 'The doctor gathers a case and follows you back by the safer lane. The inn has prepared a warm room, and the patient is not left alone.' },
        { id: 'slow', label: 'Ride back at the horse’s safe pace', title: 'No Needless Hurry', text: 'You avoid pushing the horse over the wet ground. The doctor arrives later, but sound and ready to help.' },
      ] },
      { id: 'messenger', label: 'Send a capable neighbor', title: 'A Message and a Witness', text: 'A neighbor knows the doctor’s house and can travel the lane more safely than a stranger. The innkeeper can remain with the patient.', outcomes: [
        { id: 'return', label: 'Wait with the innkeeper', title: 'Two People Stay', text: 'You and the innkeeper keep the patient comfortable and note when the condition changes. The messenger returns with the doctor.' },
        { id: 'supplies', label: 'Prepare a clear place for the doctor', title: 'Room Made Ready', text: 'You move a table, bring clean water, and leave the medical decisions to the doctor when they arrive.' },
      ] },
      { id: 'transport', label: 'Borrow a light cart', title: 'A Slower Journey', text: 'The stable has a light cart with sound wheels. The patient can sit upright, and the lane is muddy but passable at a walk.', outcomes: [
        { id: 'go', label: 'Take the patient toward the village', title: 'Careful Miles', text: 'The innkeeper drives while you sit beside the patient. You meet the doctor on the road and turn the cart around together.' },
        { id: 'wait', label: 'Have the doctor come to the inn', title: 'The Safer Meeting', text: 'You send word that the cart is ready but wait for the doctor’s judgment before moving the patient.' },
      ] },
    ],
  },
  {
    id: 'when-the-baby-comes', title: 'When the Baby Comes', subtitle: 'A family needs practical help while the midwife is on her way.',
    opening: 'At a farm, labor begins earlier than the family expected. The experienced midwife is coming from the next settlement. The mother is attended by her sister, who asks you to help with ordinary preparations; no one asks you to take the midwife’s place.',
    routes: [
      { id: 'fetch', label: 'Ride to meet the midwife', title: 'The Road to the Midwife', text: 'The family gives you the dry lane and a lantern for the return. The midwife is already traveling, but the meeting could save time.', outcomes: [
        { id: 'meet', label: 'Bring the midwife directly to the house', title: 'An Experienced Arrival', text: 'You meet the midwife at the lane fork and guide her to the house. The sister gives her the room at once; by the time you leave, she has taken charge and the family has quieted around her.' },
        { id: 'signal', label: 'Send word back that she is close', title: 'A Welcome Warning', text: 'You reach a farmhand who carries word ahead. The household prepares the room before the midwife arrives, and the sister thanks you for giving them those few unhurried minutes.' },
      ] },
      { id: 'prepare', label: 'Bring clean cloth and warm water', title: 'The Room Prepared', text: 'You carry clean folded cloth and a kettle of warm water to the room, setting them where the midwife can reach them.', outcomes: [
        { id: 'check', label: 'Ask the sister what else is needed', title: 'A Useful List', text: 'She asks you to keep the children nearby and the doorway clear. When the midwife arrives, the room is ready and the hallway stays calm; the sister can turn her attention fully to the work ahead.' },
        { id: 'leave', label: 'Wait outside the room', title: 'Space to Work', text: 'You give the family privacy and stay close enough to fetch anything the midwife requests. Once she arrives, the sister nods through the doorway: your quiet watch kept the hall clear, and she no longer needs you to wait.' },
      ] },
      { id: 'children', label: 'Keep the children occupied', title: 'A Quieter Hallway', text: 'The younger children have questions and keep returning to the door. You find them a place at the kitchen table and a small task to do.', outcomes: [
        { id: 'story', label: 'Read aloud until the midwife arrives', title: 'A Story at the Table', text: 'The children listen, ask a few questions, and leave the hallway clear. When the midwife arrives, they stay at the table by choice, and the sister offers you a grateful smile before returning to the room.' },
        { id: 'message', label: 'Ask an older child to carry a note', title: 'One More Message', text: 'The child takes a note to a nearby aunt, who comes to help with the household while the midwife attends the mother. The sister sees the extra pair of hands arrive and can stop managing the whole house alone.' },
      ] },
    ],
  },
  {
    id: 'the-red-flag', title: 'The Red Flag', subtitle: 'Several people feel unwell, but the cause is not clear.',
    opening: 'At a boarding house, three guests have stomach trouble after supper. Another guest feels entirely well. The cook says everyone ate the same stew, while one boarder recalls drinking from a pump outside. No one can tell you the cause.',
    routes: [
      { id: 'separate', label: 'Give the unwell guests a quiet room', title: 'Room to Rest', text: 'The innkeeper opens a spare room and sets clean water nearby. The guests can rest apart without being treated as a danger or a certainty.', outcomes: [
        { id: 'watch', label: 'Ask someone to check on them regularly', title: 'A Thoughtful Watch', text: 'A boarder volunteers to check the room and call for help if anyone worsens. Their condition remains uncertain, so the inn keeps the doctor informed.' },
        { id: 'air', label: 'Open the window and clear the table', title: 'Fresh Air', text: 'The room is aired and the supper dishes are set aside for inspection. No one claims this explains the illness.' },
      ] },
      { id: 'doctor', label: 'Send for the doctor', title: 'A Professional Opinion', text: 'The innkeeper sends a rider for the village doctor. Until then, the guests rest and drink clean water in small amounts.', outcomes: [
        { id: 'wait', label: 'Remain until the doctor arrives', title: 'The Doctor’s Visit', text: 'The doctor asks what each person ate and where they traveled. They offer no instant certainty, but the sick guests are no longer left to guess alone.' },
        { id: 'relay', label: 'Tell the cook to keep a careful account', title: 'A Useful Record', text: 'The cook writes down what was served and who ate it, giving the doctor facts instead of rumor.' },
      ] },
      { id: 'warn', label: 'Tell the innkeeper what you heard', title: 'Two Possible Sources', text: 'You explain the shared meal and the pump water as separate possibilities. The innkeeper can warn guests to use the kitchen well without accusing anyone.', outcomes: [
        { id: 'water', label: 'Set out a fresh pitcher from the kitchen well', title: 'A Cautious Change', text: 'The inn serves water from its covered kitchen well while the pump is checked. The cause remains unknown, but guests have a clear alternative.' },
        { id: 'leave', label: 'Take your own clean water and rest elsewhere', title: 'A Personal Precaution', text: 'You avoid the pump for now and leave the innkeeper to make the arrangements. No one knows whether the change was necessary.' },
      ] },
    ],
  },
]);
