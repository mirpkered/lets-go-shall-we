import { authorBatch } from './secondWaveTools';

export const ENTERTAINMENT_ADVENTURES = authorBatch([
  {
    id: 'the-traveling-players', title: 'The Traveling Players', subtitle: 'A small troupe needs help before its evening performance.', openingContext: 'fair',
    opening: 'A traveling troupe has arrived in town with a short comedy and a wagon of painted scenery. One actor is delayed at the station, but the remaining players can perform if the first act is shortened. The stage manager offers a coin for practical help.',
    routes: [
      { id: 'scenery', label: 'Help move the scenery flats', title: 'Painted Walls', text: 'The flats are light wooden frames painted to look like a parlor. The stage manager shows you where they stand; you are not asked to repair or design them.', outcomes: [
        { id: 'set', label: 'Set the parlor scene in place', title: 'A Stage Ready', text: 'The painted walls stand securely before the audience enters. The troupe pays you a coin and begins the shortened play.', effects: { money: 1 } },
        { id: 'store', label: 'Store the unused scenery', title: 'A Smaller Stage', text: 'The troupe chooses the simplest set and stores the other flats in the wagon. The performance begins on time.' },
      ] },
      { id: 'tickets', label: 'Help check tickets at the door', title: 'A Small Crowd', text: 'The hall is filling slowly. The ticket seller asks you to point guests toward open seats and keep the doorway clear.', outcomes: [
        { id: 'watch', label: 'Stay for the first act', title: 'A Good First Act', text: 'The actors turn the missing performer into a joke about a late cousin. The audience laughs, and the troupe earns its evening.' },
        { id: 'paid', label: 'Take your coin and continue on', title: 'Paid at the Door', text: 'The seller pays your coin and takes over the door once the crowd settles. You leave with the sound of the play behind you.', effects: { money: 1 } },
      ] },
      { id: 'station', label: 'Ask whether the delayed actor needs a message', title: 'A Note for the Station', text: 'The stage manager gives you the actor’s name and asks whether the station clerk has heard from the incoming train. The troupe does not know why the actor is delayed.', outcomes: [
        { id: 'news', label: 'Bring back the train’s arrival time', title: 'Still on the Road', text: 'The clerk says the train is running late but is expected. The troupe begins its first act without waiting.' },
        { id: 'perform', label: 'Return to the hall', title: 'The Show Begins', text: 'You carry no message because the actor has not arrived. The troupe adapts the play and starts the performance.' },
      ] },
    ],
  },
  {
    id: 'the-miracle-tonic', title: 'The Miracle Tonic', subtitle: 'A medicine show makes grand claims in a crowded square.', openingContext: 'market',
    opening: 'A medicine show has drawn a crowd to the market square. The seller promises a tonic for nearly every common complaint, while a drummer keeps the audience laughing. An older customer asks whether you think the bottle is worth its price; you have no way to judge its contents.',
    routes: [
      { id: 'watch', label: 'Watch the performance without buying', title: 'The Seller’s Patters', text: 'The seller tells comic stories about the road and makes no demonstration that could prove the tonic’s claims. The crowd enjoys the show anyway.', outcomes: [
        { id: 'leave', label: 'Leave before the next pitch', title: 'A Free Show', text: 'You move on without buying. The seller continues entertaining the crowd, and the customer keeps their coin.' },
        { id: 'ask', label: 'Ask what ingredients are listed', title: 'A Label Read Aloud', text: 'The bottle lists familiar herbs and alcohol. The seller says it may soothe a sore throat but cannot prove the broader claims.' },
      ] },
      { id: 'customer', label: 'Suggest the customer ask the seller directly', title: 'A Question from the Crowd', text: 'The older customer asks what is in the bottle and whether it is safe with their usual tea. The seller answers plainly about the ingredients and admits they are not a physician.', outcomes: [
        { id: 'decline', label: 'Let the customer decide whether to buy', title: 'Their Coin, Their Choice', text: 'The customer thanks the seller and decides to keep their money. Nobody is mocked for asking.' },
        { id: 'buy', label: 'Step aside and watch the show', title: 'A Purchase Made Freely', text: 'The customer buys one bottle after hearing the ingredients. You do not claim it will cure anything.' },
      ] },
      { id: 'help', label: 'Help the troupe set up its canvas awning', title: 'A Place in the Shade', text: 'The showman asks you to hold one canvas corner while the drummer ties the rope. The work is simple and keeps the bottles out of direct sun.', outcomes: [
        { id: 'paid', label: 'Accept a coin for the setup', title: 'An Honest Day’s Help', text: 'The showman pays a coin for the setup. The tonic claims remain the seller’s responsibility.', effects: { money: 1 } },
        { id: 'leave', label: 'Decline payment and move along', title: 'A Favor Returned', text: 'You give a hand, decline the coin, and continue through the square. The show carries on.' },
      ] },
    ],
  },
  {
    id: 'three-rounds', title: 'Three Rounds', subtitle: 'A local boxing exhibition draws a small crowd and a question about fairness.', openingContext: 'fair',
    opening: 'A boxing exhibition is scheduled for three short rounds in a fairground ring. One boxer looks tired after a long journey; the other asks the organizer whether the match can be shortened. No one is forced to take part, and the crowd has already paid admission.',
    routes: [
      { id: 'talk', label: 'Ask the organizer about the rules', title: 'A Bout Explained', text: 'The organizer says the fighters agreed to three rounds with no wager on the result. Either can stop if they are not fit to continue.', outcomes: [
        { id: 'watch', label: 'Watch from the rail', title: 'A Fair Short Match', text: 'The fighters complete two careful rounds, then agree to stop. The crowd gets its exhibition without anyone being pressed beyond the agreement.' },
        { id: 'leave', label: 'Leave before the bell', title: 'No Need to Stay', text: 'You continue around the fair. The exhibition remains the fighters’ decision.' },
      ] },
      { id: 'backstage', label: 'Offer water to the tired boxer', title: 'A Moment before the Bell', text: 'The boxer accepts water and says they would rather shorten the bout than withdraw. The organizer can announce the change to the audience.', outcomes: [
        { id: 'announce', label: 'Ask the organizer to announce two rounds', title: 'Terms Made Clear', text: 'The organizer explains the shorter exhibition before the bell. The crowd accepts the change, and the boxers choose their pace.' },
        { id: 'rest', label: 'Give the boxer a moment to decide', title: 'A Choice Kept Private', text: 'The boxer rests and then decides to withdraw. The organizer refunds the admission or invites the crowd to watch a wrestling demonstration instead.' },
      ] },
      { id: 'audience', label: 'Ask the crowd whether they want the full bout', title: 'The Crowd’s Expectation', text: 'Most came to see a fair exhibition, not a particular length. The organizer has not yet told them the bout may be shorter.', outcomes: [
        { id: 'share', label: 'Tell them the fighters may shorten it', title: 'A Crowd Informed', text: 'The crowd agrees that the fighters should decide. The organizer announces the change, and the event remains cordial.' },
        { id: 'stay', label: 'Let the organizer make the announcement', title: 'A Quiet Word', text: 'The organizer thanks you and speaks to the crowd themselves. You watch from the edge without taking charge of the event.' },
      ] },
    ],
  },
  {
    id: 'dance-until-midnight', title: 'Dance Until Midnight', subtitle: 'A village dance offers music, company, and room to sit out a tune.', openingContext: 'fair',
    opening: 'A village hall holds a winter dance. A fiddler plays a reel while neighbors set chairs along the wall. You do not know anyone here, but the host says visitors are welcome and no one is expected to dance every set.',
    routes: [
      { id: 'dance', label: 'Accept a neighbor’s invitation', title: 'A Place in the Set', text: 'A local teacher shows you the steps before the music begins. The first turn is easy to miss, and the others make room without fuss.', outcomes: [
        { id: 'continue', label: 'Stay for another tune', title: 'Another Set', text: 'You catch the steps on the second tune. The evening remains ordinary and warm, with no prize for getting everything right.' },
        { id: 'rest', label: 'Thank your partner and sit down', title: 'A Dance Enough', text: 'You leave the set after one tune and find a chair. Your partner joins another group, and the music continues.' },
      ] },
      { id: 'music', label: 'Talk with the fiddler between tunes', title: 'A Tune from Nearby', text: 'The fiddler learned the tune from a cousin in the next county and is glad to play it again. They have a good chair and water near the wall.', outcomes: [
        { id: 'listen', label: 'Listen to one more tune', title: 'A Familiar Melody', text: 'The fiddler plays the tune a little slower, and two older dancers join in. You enjoy it from the side of the hall.' },
        { id: 'tip', label: 'Leave a coin in the musicians’ cup', title: 'A Small Thank-You', text: 'The fiddler nods and continues the music. The coin is a thank-you, not the price of the evening.', requirements: { minMoney: 1 }, effects: { money: -1 } },
      ] },
      { id: 'sit', label: 'Sit near the wall and enjoy the music', title: 'A Chair by the Wall', text: 'A chair is open beside a homesick traveler who is content to watch. You can share the quiet without making conversation.', outcomes: [
        { id: 'talk', label: 'Ask what tune they recognize', title: 'A Song from Home', text: 'They name a tune their mother used to hum. The fiddler knows it and plays a short verse for them.' },
        { id: 'quiet', label: 'Listen together', title: 'Music without Words', text: 'You sit through two dances without speaking. The traveler thanks you for the company when they leave.' },
      ] },
    ],
  },
  {
    id: 'the-speaker', title: 'The Speaker', subtitle: 'A lecturer’s demonstration does not go quite as planned.', openingContext: 'fair',
    opening: 'A traveling naturalist gives a public talk about local birds and brings a small hand-cranked weather instrument. A gust shifts the paper vane during the demonstration. The audience is curious, not alarmed, and the speaker asks for a little space to reset it.',
    routes: [
      { id: 'space', label: 'Help make a clear space near the stand', title: 'Room for the Demonstration', text: 'You ask the front row to step back from the table. The instrument stays on its legs, and the naturalist checks its paper scale.', outcomes: [
        { id: 'continue', label: 'Let the speaker begin again', title: 'A Second Explanation', text: 'The naturalist explains how the vane turns with the wind and admits the gust confused the first reading. The audience listens.' },
        { id: 'close', label: 'Help pack the instrument away', title: 'Talk without the Instrument', text: 'The naturalist sets the instrument aside and finishes with stories about birds seen along the river. The talk is enjoyable without a demonstration.' },
      ] },
      { id: 'question', label: 'Ask what the instrument measures', title: 'A Useful Question', text: 'The naturalist explains that the paper vane shows wind direction, not a prediction of tomorrow’s weather. A gust can shift it quickly.', outcomes: [
        { id: 'share', label: 'Repeat the explanation for the back row', title: 'The Audience Understands', text: 'You repeat the plain explanation for listeners who missed it. The speaker thanks you and carries on.' },
        { id: 'listen', label: 'Let the speaker continue', title: 'A Clearer Demonstration', text: 'The naturalist adjusts the vane and demonstrates it again. The audience leaves knowing what it does—and what it cannot tell them.' },
      ] },
      { id: 'audience', label: 'Ask the crowd to give the speaker a moment', title: 'A Patient Audience', text: 'A few people were whispering about the shifted paper. You ask them to wait while the speaker checks the instrument rather than guessing at the result.', outcomes: [
        { id: 'finish', label: 'Stay for the rest of the talk', title: 'An Ordinary Lecture', text: 'The demonstration resumes, and the naturalist answers questions about the birds. Nothing more dramatic happens.' },
        { id: 'leave', label: 'Continue on after the explanation', title: 'A Short Visit', text: 'You hear the main explanation and leave before the lecture ends. The audience settles back into its seats.' },
      ] },
    ],
  },
]);
