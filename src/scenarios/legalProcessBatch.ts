import { authorBatch } from './secondWaveTools';
import type { Scenario } from '../types';

const PROPERTY_OF: Scenario = {
  id: 'property-of', title: 'Property Of...', subtitle: 'Two people name the same toolbox; neither asks you to be a judge.', startScene: 'opening',
  scenes: {
    opening: { id: 'opening', title: 'The Box on the Counter', tone: 'safe', text: 'At a rail-yard lodging house, a latched steel toolbox sits on the counter. A track worker says it is his; a carpenter says he lent it months ago and never got it back. You saw part of the freight unloading, but not who owned the box before the trip. The innkeeper asks what you can actually add.', choices: [
      { id: 'inspectMarks', label: 'Look at the initials and hinge', next: 'mark', timeCost: 3 },
      { id: 'askContents', label: 'Ask what each remembers inside', next: 'ask', timeCost: 3 },
      { id: 'reportUnloading', label: 'Describe what you saw at the wagon', next: 'witness', effects: { knowledge: ['At the rail-yard lodging house, you saw who lifted the toolbox during unloading, but not who owned it before the trip.'] } },
    ] },
    mark: { id: 'mark', title: 'Marks, Not Proof', tone: 'safe', text: 'Two initials are scratched inside the handle; a newer brass pin holds one hinge. The worker says the initials are his. The carpenter says he replaced that pin. Each recognizes something, and neither detail settles when the box changed hands.', choices: [
      { id: 'askAboutRepair', label: 'Ask when the hinge was repaired', next: 'marksResponse' },
      { id: 'keepMarksNeutral', label: 'Record both claims without choosing', next: 'marksResponse', effects: { historyFlags: ['kept_toolbox_claim_neutral'] } },
    ] },
    marksResponse: { id: 'marksResponse', title: 'Two Reactions', tone: 'safe', text: 'The carpenter offers to look for the repair slip; the worker says a slip would date the hinge, not prove who owns the whole box. The innkeeper agrees to keep it latched until they can bring someone who remembers the loan.', choices: [
      { id: 'waitForWitnessMarks', label: 'Ask them to return with a witness', next: 'witnessRequested', effects: { historyFlags: ['helped_narrow_toolbox_ownership_dispute'] } },
      { id: 'recordMarks', label: 'Leave the box secured for now', next: 'boxSecured', effects: { historyFlags: ['kept_toolbox_claim_neutral'] } },
    ] },
    ask: { id: 'ask', title: 'Two Lists from Memory', tone: 'safe', text: 'The worker recalls a wrench, chalk, and a square with a chipped corner. The carpenter names the same square and says he added a short saw after borrowing the box. Both know its contents; the carpenter’s addition may have happened before or after the loan.', choices: [
      { id: 'askForWitnessContents', label: 'Ask who remembers the loan', next: 'contentsResponse' },
      { id: 'leaveContentsUnopened', label: 'Keep the box closed and hear them out', next: 'contentsResponse', effects: { historyFlags: ['kept_toolbox_claim_neutral'] } },
    ] },
    contentsResponse: { id: 'contentsResponse', title: 'The Shared Detail', tone: 'safe', text: 'The chipped square makes both claimants pause: each has used it. The worker says sharing a tool is not giving it away; the carpenter agrees, but says the loan never ended. The innkeeper will not open the box while they dispute whether the contents were changed.', choices: [
      { id: 'requestCrewWitness', label: 'Ask for someone from their old crew', next: 'witnessRequested', effects: { historyFlags: ['helped_narrow_toolbox_ownership_dispute'] } },
      { id: 'secureContents', label: 'Leave it latched until they agree', next: 'boxSecured', effects: { historyFlags: ['kept_toolbox_claim_neutral'] } },
    ] },
    witness: { id: 'witness', title: 'A Limited Memory', tone: 'safe', text: 'You remember the carpenter lifting the box from the wagon. You did not see who packed it or hear whether it was being returned. The worker says the carpenter carried it only because the box was heavy; the carpenter says the worker asked him to carry his own tools.', choices: [
      { id: 'stateOnlyWhatSaw', label: 'State only who lifted it', next: 'unloadingResponse', effects: { historyFlags: ['gave_limited_toolbox_witness_account'] } },
      { id: 'askYardClerk', label: 'Suggest asking the yard clerk', next: 'unloadingResponse' },
    ] },
    unloadingResponse: { id: 'unloadingResponse', title: 'What the Moment Can Show', tone: 'safe', text: 'Neither claimant asks you to say more than you saw. The innkeeper notes that the unloading answers who moved the box, not who owned it. The yard clerk may remember who signed for the freight, though that still may not settle the loan.', choices: [
      { id: 'askClerkNext', label: 'Have the innkeeper ask about the freight record', next: 'clerkAsked', effects: { historyFlags: ['helped_narrow_toolbox_ownership_dispute'] } },
      { id: 'leaveAccount', label: 'Leave your account with the innkeeper', next: 'accountRecorded', effects: { historyFlags: ['kept_toolbox_claim_neutral'] } },
    ] },
    witnessRequested: { id: 'witnessRequested', title: 'A Claim Narrowed', tone: 'safe', text: 'The innkeeper sets the latched box in a locked cupboard for the night. Both claimants agree to ask a former crew hand about the loan; the carpenter will also look for the repair slip. No one is awarded the box, but the argument now has a specific question to answer.', ending: 'success', choices: [] },
    boxSecured: { id: 'boxSecured', title: 'Kept Safe, Still Disputed', tone: 'safe', text: 'The innkeeper locks the toolbox away rather than opening it or choosing an owner. The claimants leave with a clear next step: bring someone who remembers the loan. Your restraint keeps the contents safe without pretending the question is settled.', ending: 'success', choices: [] },
    clerkAsked: { id: 'clerkAsked', title: 'A Record of the Journey', tone: 'safe', text: 'The innkeeper sends a note to the yard clerk asking who signed for the crate. The answer may clarify the box’s recent journey, not its older ownership; both claimants accept that limit and leave it latched.', ending: 'success', choices: [] },
    accountRecorded: { id: 'accountRecorded', title: 'A Narrow Account', tone: 'safe', text: 'The innkeeper writes down that the carpenter lifted the box during unloading. The worker stops treating that single act as proof of ownership, while the carpenter agrees it does not prove the loan ended. The box stays secured and the dispute remains open.', ending: 'success', choices: [] },
  },
};

export const LEGAL_PROCESS_ADVENTURES = [PROPERTY_OF, ...authorBatch([
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
])];
