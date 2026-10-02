import { authorBatch } from './secondWaveTools';

export const SMALL_HUMAN_MOMENT_ADVENTURES = authorBatch([
  {
    id: 'dear-mary', title: 'Dear Mary', subtitle: 'A traveler asks for help putting a letter into words.',
    opening: 'At an inn, a quiet traveler asks whether you can help write a letter to Mary. Their eyesight is poor in the lamplight, and the letter concerns a recent quarrel with a sister. They insist the words should remain theirs; they need a hand with the pen, not someone to decide what they feel.',
    routes: [
      { id: 'dictate', label: 'Write exactly what they say', title: 'Their Words on the Page', text: 'The traveler pauses between sentences and asks you to read each line back. They change one phrase and keep the rest as spoken.', outcomes: [
        { id: 'send', label: 'Seal the letter for the morning post', title: 'Ready to Send', text: 'The traveler seals the letter and thanks you for keeping to their words. You leave the message in their hands.' },
        { id: 'wait', label: 'Leave it unsealed for another reading', title: 'A Night to Consider', text: 'They decide to read it once more in daylight before sending. The letter waits on the table, unfinished only by their choice.' },
      ] },
      { id: 'questions', label: 'Ask what they hope Mary will understand', title: 'A Thought before the Letter', text: 'The traveler says they want to apologize for leaving suddenly but does not know whether to ask for forgiveness. You can help phrase either thought without choosing for them.', outcomes: [
        { id: 'include', label: 'Write both apology and uncertainty', title: 'An Honest Letter', text: 'The letter says they are sorry and does not presume how Mary will respond. The traveler signs it themselves.' },
        { id: 'omit', label: 'Let them choose the final sentence', title: 'One Last Line', text: 'You write the body and leave the last line blank. The traveler fills it in after a moment of thought.' },
      ] },
      { id: 'decline', label: 'Offer the innkeeper’s help instead', title: 'Another Pair of Eyes', text: 'You are not comfortable shaping someone else’s private words. The innkeeper knows the traveler and offers to help with spelling while leaving the message to them.', outcomes: [
        { id: 'leave', label: 'Let the traveler decide whether to write tonight', title: 'A Letter Can Wait', text: 'The traveler thanks you and decides to wait until morning. No apology is owed to you.' },
        { id: 'post', label: 'Bring a blank sheet and envelope', title: 'The Materials Set Out', text: 'You leave paper, ink, and an envelope on the table. The traveler can write when ready.' },
      ] },
    ],
  },
  {
    id: 'the-locket', title: 'The Locket', subtitle: 'A small keepsake may have an owner nearby.', openingContext: 'market',
    opening: 'You find a closed silver locket beneath a market bench. Inside the clasp is a tiny engraved initial and a dried blue flower. A nearby stallholder says an older woman asked about a missing keepsake earlier, but does not know if this is the same one.',
    routes: [
      { id: 'stallholder', label: 'Ask the stallholder to describe the woman', title: 'A Possible Owner', text: 'The stallholder remembers a blue shawl and a cane. The description is specific but not enough to identify someone with certainty.', outcomes: [
        { id: 'return', label: 'Ask them to hold it while they check', title: 'A Keepsake Returned', text: 'The woman returns before the market closes and recognizes the flower inside. The stallholder gives it back to her.' , effects: { historyFlags: ['returned_a_found_locket_to_its_owner'] } },
        { id: 'wait', label: 'Leave it with the stallholder overnight', title: 'Kept Safe at the Stall', text: 'The stallholder wraps the locket in cloth and keeps it in a locked drawer. The owner may return tomorrow.' },
      ] },
      { id: 'initial', label: 'Read the tiny initial in the clasp', title: 'One Letter, Not a Name', text: 'The engraving is a single letter. It may be the owner’s initial, a maker’s mark, or a gift inscription; it cannot settle who the locket belongs to.', outcomes: [
        { id: 'ask', label: 'Ask at the nearby inn without naming details', title: 'A Quiet Inquiry', text: 'The innkeeper asks guests privately whether anyone has lost a small locket. One traveler recognizes the flower and comes to claim it.' , effects: { historyFlags: ['returned_a_found_locket_to_its_owner'] } },
        { id: 'leave', label: 'Leave it with the market keeper', title: 'A Safe Place', text: 'The keeper records where it was found and puts it away. No one is charged with losing it.' },
      ] },
      { id: 'keep', label: 'Keep it as a personal keepsake', title: 'A Small Choice', text: 'The locket is not valuable, but it clearly mattered to someone. You decide to keep it without learning whose initials are inside.', outcomes: [
        { id: 'record', label: 'Remember where it was found', title: 'A Memory Kept', text: 'You remember the market bench and the flower inside. The locket gives no advantage and does not reveal its owner.', effects: { historyFlags: ['kept_an_unidentified_found_locket'] } },
        { id: 'leave', label: 'Change your mind and leave it with the keeper', title: 'Not Yours to Keep', text: 'You return it to the market keeper with the place you found it. They store it safely for anyone who asks.' },
      ] },
    ],
  },
  {
    id: 'supper-for-two', title: 'Supper for Two', subtitle: 'A shared meal makes a long road feel a little shorter.', openingContext: 'inn',
    opening: 'At an inn, a homesick traveler sits alone with a bowl of stew. They are newly arrived from across the ocean and have been waiting for a letter from family. The innkeeper asks whether you would mind sharing the table; no one expects you to fix the homesickness.',
    routes: [
      { id: 'join', label: 'Share the meal and ask about the journey', title: 'Two Bowls on the Table', text: 'The traveler describes the ship crossing and the first week on land. They are proud of the work they found and miss a familiar kitchen.', outcomes: [
        { id: 'listen', label: 'Listen while they tell the story', title: 'A Supper Shared', text: 'The traveler talks until the bowls are empty and thanks you for listening. The evening is not changed, but it is less lonely.' , effects: { historyFlags: ['shared_supper_with_a_homesick_traveler'] } },
        { id: 'share', label: 'Tell a small story from your own road', title: 'Stories in Both Directions', text: 'Your story gives the traveler a chance to ask about another place. You finish supper with an easy conversation.' },
      ] },
      { id: 'letter', label: 'Ask whether a letter has arrived', title: 'A Note at the Desk', text: 'The innkeeper checks the desk and finds no letter yet. A nearby post office may receive tomorrow’s mail, but no one can promise a date.', outcomes: [
        { id: 'wait', label: 'Offer to check the post office in the morning', title: 'A Small Errand Offered', text: 'The traveler accepts the offer and writes their family’s name on a card. They know the letter may still take time.' },
        { id: 'no', label: 'Let them wait without making a promise', title: 'Nothing Lost in Waiting', text: 'You sit together for a while and do not promise news you cannot provide. The traveler thanks you.' },
      ] },
      { id: 'quiet', label: 'Offer company without asking questions', title: 'A Quiet Table', text: 'You sit down and let the conversation begin only if the traveler wants it. After a while, they mention the local bakery and the coming market.', outcomes: [
        { id: 'stay', label: 'Stay until the innkeeper clears the table', title: 'No Need to Hurry', text: 'The two of you finish supper in comfortable quiet. The traveler rises feeling a little more settled.' },
        { id: 'leave', label: 'Wish them a good evening', title: 'A Kind Word', text: 'You wish them a good evening and leave the table. The innkeeper brings tea, and the traveler is not alone in the room.' },
      ] },
    ],
  },
  {
    id: 'the-childrens-court', title: 'The Children’s Court', subtitle: 'Two children take a marble rule very seriously.',
    opening: 'Two children in a boarding-house yard have stopped their game over a blue marble. One says the line was crossed; the other says the marble struck a stone and bounced back. Their older sister asks whether you can help them decide, but neither child is upset beyond the dispute.',
    routes: [
      { id: 'listen', label: 'Let each child explain the rule', title: 'Two Accounts of the Line', text: 'One child points to a chalk mark; the other points to the stone that changed the marble’s path. Both explain the rule with complete seriousness.', outcomes: [
        { id: 'replay', label: 'Suggest replaying the shot', title: 'Another Turn', text: 'They agree to replay from the same place, this time marking the boundary with a stick. The game resumes.' },
        { id: 'share', label: 'Suggest each child take one turn', title: 'A Fair Set of Turns', text: 'They settle the argument by taking turns. Neither gets to be right about the first shot.' },
      ] },
      { id: 'stayOut', label: 'Tell the older sister it is their game', title: 'A Dispute They Can Settle', text: 'The sister agrees and watches from the porch. The children can either resume or change the rule themselves.', outcomes: [
        { id: 'resume', label: 'Watch from the fence for a moment', title: 'The Game Returns', text: 'The children argue once more, then start over. The marble rolls past the chalk without causing a second court hearing.' },
        { id: 'leave', label: 'Return to your own errand', title: 'A Small Yard Dispute', text: 'You leave them to their game. Their sister says they will be friends again before supper.' },
      ] },
      { id: 'rule', label: 'Offer a rule for the next shot only', title: 'A Rule Going Forward', text: 'You suggest that a marble touching the stone counts as a new turn, not a win. The children consider it as a rule, not a verdict about the old shot.', outcomes: [
        { id: 'agree', label: 'Let them choose whether to use it', title: 'Their Rule', text: 'They keep the new rule and restart the game. The blue marble stays in the yard, where it belongs.' },
        { id: 'decline', label: 'Step aside if they prefer their own rule', title: 'No Need for a Ruling', text: 'They choose their original rule and continue without you. The children’s court is adjourned.' },
      ] },
    ],
  },
  {
    id: 'still-waiting', title: 'Still Waiting', subtitle: 'An older traveler waits at the depot for a train that is running late.', openingContext: 'depot',
    opening: 'An older woman sits at the depot with a small carpetbag, waiting for her brother’s afternoon train. The stationmaster says the train is delayed but still expected. She asks whether you can keep her company while she waits; she has not seen him for several years.',
    runRandomSelections: [{ id: 'meeting', values: [{ value: 'arrives' }, { value: 'message' }, { value: 'missed' }] }],
    routes: [
      { id: 'company', label: 'Sit with her on the platform bench', title: 'A Place beside the Clock', text: 'She explains that her brother wrote after their father’s death and asked to meet. She is hopeful but does not know whether the years will make the conversation easy.', outcomes: [
        { id: 'stay', label: 'Stay until the train arrives', title: 'A Meeting at the Platform', text: 'The afternoon ends with a choice the traveler makes for herself.', textVariants: [
          { requirements: { selections: { meeting: 'arrives' } }, text: 'The train arrives, and her brother steps down carrying the same worn carpetbag she remembers. They greet each other quietly and begin with the weather.' },
          { requirements: { selections: { meeting: 'message' } }, text: 'The train arrives without him. The stationmaster has a note from the next stop: he missed the connection and will try tomorrow. She decides whether to wait again.' },
          { requirements: { selections: { meeting: 'missed' } }, text: 'The train arrives, but her brother is not aboard. She folds the note he sent and asks the stationmaster when the next train will come.' },
        ] },
        { id: 'leave', label: 'Wish her well and continue your journey', title: 'A Few Minutes of Company', text: 'You keep her company until the station bell rings, then leave before the train comes. She thanks you for the conversation.' },
      ] },
      { id: 'schedule', label: 'Ask the stationmaster for the latest estimate', title: 'An Updated Arrival', text: 'The stationmaster expects the train in about an hour. The estimate could change, but the delay is ordinary and the waiting room is warm.', outcomes: [
        { id: 'tell', label: 'Pass along the estimate', title: 'An Hour to Wait', text: 'She decides to stay and asks the clerk to keep the door open so she can hear the train. You leave her with the updated time.' },
        { id: 'tea', label: 'Offer to fetch tea from the refreshment room', title: 'Tea at the Depot', text: 'You bring tea from the refreshment room and sit for a little while. She tells you about the town where they grew up.' },
      ] },
      { id: 'note', label: 'Offer to send a message to the next stop', title: 'A Message Ahead', text: 'The telegraph office can send a short note, though it may not reach the train before the next station. She decides whether she wants to write one.', outcomes: [
        { id: 'send', label: 'Carry her note to the operator', title: 'Word Sent Down the Line', text: 'The operator sends the note ahead. Whether her brother receives it before arriving is uncertain.' },
        { id: 'keep', label: 'Let her keep the note for another day', title: 'No Message Needed', text: 'She folds the note and decides to wait for the train. The operator remains available if she changes her mind.' },
      ] },
    ],
  },
]);

const MARBLE_STORY = SMALL_HUMAN_MOMENT_ADVENTURES.find(({ id }) => id === 'the-childrens-court')!;
MARBLE_STORY.scenes = {
  opening: { id: 'opening', title: 'A Disputed Shot', tone: 'safe', text: 'Two children in a boarding-house yard have stopped their game over a blue marble. One says it crossed the chalk line; the other says it struck a stone and bounced back. Their older sister asks for help, but neither child is upset beyond the argument.', choices: [
    { id: 'take-listen', label: 'Hear both accounts', next: 'listen' },
    { id: 'take-rule', label: 'Mark the line and replay the shot', next: 'rule', effects: { historyFlags: ['helped_children_settle_marble_rule'] } },
    { id: 'take-stayOut', label: 'Let their sister handle it', next: 'stayOut' },
  ] },
  accounts: { id: 'accounts', title: 'Two Accounts of the Line', tone: 'safe', text: 'One child points to the chalk boundary. The other points to the stone that changed the marble’s path. Both explain the rule with complete seriousness, and neither can be certain where the marble stopped.', choices: [
    { id: 'replayMarked', label: 'Mark the line and replay once', next: 'replaySetup', effects: { historyFlags: ['helped_children_settle_marble_rule'] } },
    { id: 'takeTurns', label: 'Give each child the next turn', next: 'fairTurns', effects: { historyFlags: ['helped_children_settle_marble_rule'] } },
    { id: 'letChildrenChoose', label: 'Let them choose how to continue', next: 'childrenChoose' },
  ] },
  replaySetup: { id: 'replaySetup', title: 'A Fresh Mark', tone: 'safe', text: 'The older sister redraws the chalk line from the same starting place and moves the loose stone out of the shot’s path. The first marble’s path cannot be proved. To settle only this turn, each child will take one shot from the fresh mark; neither shot can decide who was right before.', choices: [
    { id: 'takeReplayShot', label: 'Watch each child take one shot', timeCost: 2, chance: { probability: 0.56, successNext: 'clearShot', failureNext: 'closeShot', successMessage: 'Each child takes one shot from the fresh mark. The turns are clear enough for both to accept.', failureMessage: 'Each child takes one shot, but one clips the chalk at the edge; the new turns remain too close to call.' } },
    { id: 'callFriendlyDraw', label: 'Call the first turn a draw', next: 'friendlyDraw', effects: { historyFlags: ['kept_a_friendly_marble_game_fair'] } },
  ] },
  clearShot: { id: 'clearShot', title: 'A Clear Turn', tone: 'safe', text: 'Both children have now taken exactly one shot from the same fresh mark. They accept the result for this turn, while the first marble’s path remains unknowable. Their sister nods, puts the chalk back in her pocket, and the argument ends.', choices: [
    { id: 'settleClearReplay', label: 'Let the fair replay stand', next: 'friendlyRematch', effects: { historyFlags: ['helped_children_restart_marble_game'] } },
    { id: 'leaveClearGame', label: 'Leave them to play on', next: 'gameResumes', effects: { historyFlags: ['helped_children_restart_marble_game'] } },
  ] },
  closeShot: { id: 'closeShot', title: 'Still Too Close', tone: 'safe', text: 'The marble clips the chalk at the edge, and the children agree the replay does not settle the old turn. Their sister smiles: a game this close needs a rule they both accept, not an outside verdict.', choices: [
    { id: 'shareCloseTurns', label: 'Suggest one turn each', next: 'fairTurns', effects: { historyFlags: ['helped_children_settle_marble_rule'] } },
    { id: 'leaveCloseGame', label: 'Let them choose a rule together', next: 'childrenChoose' },
  ] },
  childrenChoose: { id: 'childrenChoose', title: 'Their Rule to Keep', tone: 'safe', text: 'The children talk it over without asking you to decide who was right. One proposes a fresh start; the other asks for alternating turns. Their sister lets them settle the rule themselves.', choices: [
    { id: 'acceptFreshStart', label: 'Agree to a fresh start', next: 'gameResumes', effects: { historyFlags: ['let_children_set_their_own_marble_rule'] } },
    { id: 'acceptTurns', label: 'Agree to alternating turns', next: 'fairTurns', effects: { historyFlags: ['let_children_set_their_own_marble_rule'] } },
  ] },
  watchGame: { id: 'watchGame', title: 'The Game Returns', tone: 'safe', text: 'Their sister watches from the porch while the children argue once more, then start over. The blue marble rolls past the chalk without causing another hearing. You leave them to their game.', ending: 'success', choices: [] },
  fairTurns: { id: 'fairTurns', title: 'A Fair Set of Turns', tone: 'safe', text: 'The children each take one shot from the corrected mark; that settles only the turn they are playing now. The older sister puts the chalk away, and they begin the next round without arguing over the first marble. She thanks you for giving them a fair way forward without pretending to know what happened.', ending: 'success', choices: [] },
  friendlyDraw: { id: 'friendlyDraw', title: 'A Friendly Draw', tone: 'safe', text: 'The children call the disputed turn even and start a fresh round. The blue marble stays in the yard, where it belongs, and the next shot has a clear mark to follow.', ending: 'success', choices: [] },
  friendlyRematch: { id: 'friendlyRematch', title: 'The Game Goes On', tone: 'safe', text: 'The replay is finished: each child took one shot from the same corrected mark, and they accept the result for this turn only. Their sister puts the chalk away; the children resume play without reopening the first argument.', ending: 'success', choices: [] },
  gameResumes: { id: 'gameResumes', title: 'The Game Resumes', tone: 'safe', text: 'The children restart from the chalk line and settle into their game again. Their sister keeps watch from the porch, and the blue marble belongs to the play—not to either side of the argument.', ending: 'success', choices: [] },
  // Original scene IDs remain the live route so in-progress saves resume in-place.
  listen: { id: 'listen', title: 'Two Accounts of the Line', tone: 'safe', text: 'One child points to the chalk boundary. The other points to the stone that changed the marble’s path. Both explain the rule with complete seriousness, and neither can be certain where the marble stopped.', choices: [
    { id: 'listen-replay', label: 'Hear both accounts before a replay', next: 'accounts' },
    { id: 'listen-share', label: 'Give each child the next turn', next: 'fairTurns', effects: { historyFlags: ['helped_children_settle_marble_rule'] } },
  ] },
  stayOut: { id: 'stayOut', title: 'A Dispute They Can Settle', tone: 'safe', text: 'Their sister asks the children whether they want another try or turns shared. She stays close enough to keep the game friendly, and you can watch the moment settle before moving on.', choices: [
    { id: 'stayOut-resume', label: 'Watch them choose how to continue', next: 'childrenChoose' },
    { id: 'stayOut-leave', label: 'Return to your own errand', next: 'watchGame' },
  ] },
  rule: { id: 'rule', title: 'A Rule Going Forward', tone: 'safe', text: 'You mark the chalk line from the same starting place and move the loose stone out of the shot’s path. The children agree that a replay can settle this turn, not prove what happened to the first marble.', choices: [
    { id: 'rule-agree', label: 'Watch the marked replay', next: 'replaySetup' },
    { id: 'rule-decline', label: 'Call the first turn a draw', next: 'friendlyDraw' },
  ] },
};
