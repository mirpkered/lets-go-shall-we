import { authorBatch } from './secondWaveTools';

export const LEGAL_PROCESS_ADVENTURES = authorBatch([
  {
    id: 'property-of', title: 'Property Of...', subtitle: 'Two people name the same toolbox; neither asks you to be a judge.',
    opening: 'At a rail-yard lodging house, a small steel toolbox sits on the counter. A track worker says the initials inside are his; a carpenter says he lent the box months ago and never got it back. The innkeeper asks what you actually observed while unloading freight nearby.',
    routes: [
      { id: 'mark', label: 'Look at the initials and repairs', title: 'Marks on the Box', text: 'The lid bears two scratched initials and one newer hinge. Either person could have made or inherited the marks; wear is not proof of ownership.', outcomes: [
        { id: 'describe', label: 'Describe the marks to both claimants', title: 'Facts Without a Verdict', text: 'You state what you can see and leave the claim with the people who know the box’s history. Neither receives an automatic victory.' },
        { id: 'decline', label: 'Say you cannot identify its owner', title: 'An Honest Limit', text: 'You explain that the repairs and initials are not enough to tell. The innkeeper holds the box until the claimants can speak again.' },
      ] },
      { id: 'ask', label: 'Ask who can describe what is inside', title: 'A List from Memory', text: 'The worker names a wrench and two chalk sticks. The carpenter recalls a square and a short saw. Some tools may have been exchanged over time.', outcomes: [
        { id: 'compare', label: 'Compare both lists without opening it', title: 'Two Partial Memories', text: 'The lists overlap only partly. You pass them to the innkeeper, who asks both people to return with a witness rather than opening the box yourself.' },
        { id: 'wait', label: 'Leave the toolbox with the innkeeper', title: 'Kept Safe for Now', text: 'The innkeeper stores the box in a locked room while the two claimants arrange another conversation.' },
      ] },
      { id: 'witness', label: 'Tell them what you saw at the freight wagon', title: 'A Memory of the Unloading', text: 'You remember one person carrying the box from the wagon, but the other may have helped load it earlier. Your view covers only part of the journey.', outcomes: [
        { id: 'state', label: 'Give only your limited account', title: 'A Partial Statement', text: 'You say who you saw lift the box and when. The claim remains open because you did not see who owned it before the trip.' },
        { id: 'withdraw', label: 'Decline to choose between them', title: 'Still Disputed', text: 'You explain that your brief view cannot settle the matter. The innkeeper keeps the toolbox in sight while the claimants sort out their own agreement.' },
      ] },
    ],
  },
  {
    id: 'to-the-magistrate', title: 'To the Magistrate', subtitle: 'A paid escort job becomes less simple on the road.', openingContext: 'roadside',
    opening: 'A shopkeeper offers you two coins to accompany a former clerk to the magistrate in the next town. The clerk walks willingly but looks frightened. The shopkeeper says a debt is owed; the clerk says the amount was already paid. Neither asks you to use force.',
    routes: [
      { id: 'walk', label: 'Walk beside the clerk', title: 'A Quiet Escort', text: 'You keep pace with the clerk on the public road. They do not try to flee, and you make clear that your job is to accompany them, not restrain them.', timeCost: 15, outcomes: [
        { id: 'arrive', label: 'Continue to the magistrate’s office', title: 'Both Accounts Heard', text: 'At the office, the clerk gives their account and the shopkeeper’s written claim is recorded. The magistrate—not you—will decide what follows.', effects: { money: 2, historyFlags: ['escorted_a_disputed_debt_claim'] } },
        { id: 'pause', label: 'Stop for water and hear the clerk', title: 'A Longer Account', text: 'The clerk describes a receipt left at the shop. You carry that information to the office; it may matter, but you cannot verify it on the road.', effects: { money: 2 } },
      ] },
      { id: 'askTerms', label: 'Ask the shopkeeper to state the job plainly', title: 'The Limits of the Hire', text: 'The shopkeeper says you are paid for company and safe arrival, not capture. They show you a note with the claimed amount but no receipt for payment.', outcomes: [
        { id: 'accept', label: 'Accept those limits and continue', title: 'An Ordinary Escort', text: 'You take the job as described and arrive with the clerk at the office. Both sides can now speak before the magistrate.' , effects: { money: 2 } },
        { id: 'decline', label: 'Decline if restraint is expected', title: 'No Hands Laid', text: 'The shopkeeper confirms no restraint is wanted. You still decline the hire and leave the parties to arrange a proper escort.' },
      ] },
      { id: 'clerk', label: 'Ask the clerk what they want', title: 'A Request on the Road', text: 'The clerk says they will appear before the magistrate but asks you not to take them by the arm. They want their side heard, not a quarrel.', outcomes: [
        { id: 'agree', label: 'Agree to walk without restraining them', title: 'A Voluntary Arrival', text: 'You and the clerk walk together to the office. The shopkeeper waits behind; the clerk enters under their own power.' , effects: { money: 2 } },
        { id: 'refuse', label: 'Return to the shopkeeper first', title: 'Terms Reconsidered', text: 'You tell the shopkeeper the clerk will travel voluntarily but not under restraint. The shopkeeper agrees to meet at the office instead.' },
      ] },
    ],
  },
  {
    id: 'the-warrant', title: 'The Warrant', subtitle: 'A folded paper may authorize a seizure—or may not.',
    opening: 'At a rural depot, a man shows a station porter a folded warrant and demands a traveler’s trunk. The porter cannot read legal handwriting and asks you, as a nearby witness, to help keep the platform calm until the constable arrives. The traveler is not present.',
    routes: [
      { id: 'read', label: 'Read the date and issuing place', title: 'What the Paper Says', text: 'You can make out an old date and the name of a county office. You are not qualified to say whether the paper remains valid or applies to this trunk.', outcomes: [
        { id: 'report', label: 'Give those details to the constable', title: 'A Question for the Constable', text: 'The constable checks the paper and takes responsibility for deciding whether it can be acted upon. The trunk remains where it is until then.' },
        { id: 'stepBack', label: 'Tell the porter only what you can read', title: 'No Legal Guess', text: 'You repeat the visible date and place without calling the paper genuine or false. The porter keeps the platform clear.' },
      ] },
      { id: 'identify', label: 'Ask whose trunk is claimed', title: 'A Claim Made in Public', text: 'The man says the traveler owes a debt and the trunk is security. He has no receipt with him, and the porter has no reason to know whether that is true.', outcomes: [
        { id: 'hold', label: 'Ask the porter to hold the trunk safely', title: 'Property Left in Place', text: 'The porter locks the trunk in the station office and writes down who requested it. No one takes possession before the constable arrives.' },
        { id: 'leave', label: 'Keep clear and let the porter decide', title: 'A Quiet Platform', text: 'You step aside while the porter summons the proper official. The disputed trunk stays untouched.' },
      ] },
      { id: 'summon', label: 'Send for the constable', title: 'The Proper Authority', text: 'A station hand goes to find the constable. The man with the paper waits, impatient but not violent; the platform remains open to passengers.', outcomes: [
        { id: 'wait', label: 'Stay as a neutral witness', title: 'A Witness to the Wait', text: 'You remain nearby and later describe only what was said and shown. The constable decides what the warrant permits.' },
        { id: 'leave', label: 'Return to your own journey', title: 'Not Your Office', text: 'The porter and constable can handle the matter. You leave without deciding whether the paper was valid.' },
      ] },
    ],
  },
]);
