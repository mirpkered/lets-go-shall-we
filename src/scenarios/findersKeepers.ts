import type { Scenario } from '../types';

export const FINDERS_KEEPERS: Scenario = {
  id: 'finders-keepers', title: 'Finders Keepers', subtitle: 'An empty place, a few belongings, and nobody watching.', startScene: 'abandonedPlace',
  runRandomSelections: [
    { id: 'place', values: ['roadside camp', 'small cabin', 'stopped wagon'].map((value) => ({ value })) },
    { id: 'owner', values: ['Tavren', 'Isolde', 'Araminta', 'Fenella', 'Leofric'].map((value) => ({ value })) },
  ],
  scenes: {
    abandonedPlace: { id: 'abandonedPlace', title: 'A Freshly Empty Place', tone: 'safe',
      text: 'A {{place}} stands empty beside the road. A coat hangs over a rail, a small purse sits beneath a dry cup, a silver watch rests nearby, and half a loaf is wrapped in cloth. There is no sign of a struggle or immediate danger. Whoever left may only be out of sight; no one returns while you are here.',
      choices: [
        { id: 'leaveUntouched', label: 'Leave everything as you found it', effects: { historyFlags: ['left_found_property_untouched'] }, next: 'leftQuietly' },
        { id: 'lookForOwner', label: 'Look for a name or sign of ownership', timeCost: 3, next: 'ownerClue' },
        { id: 'secureThings', label: 'Cover the belongings against weather', timeCost: 3, effects: { historyFlags: ['safeguarded_found_property'] }, next: 'securedQuietly' },
        { id: 'takeBread', label: 'Take bread if you need the meal', hint: 'A small necessity, not a claim on the rest.', effects: { health: 1, historyFlags: ['took_food_from_unattended_camp'] }, next: 'tookNecessity' },
      ] },
    ownerClue: { id: 'ownerClue', title: 'A Name, Not an Answer', tone: 'safe',
      text: 'A folded receipt bears the name {{owner}}. Three coins sit in the purse. The working silver watch has a name engraved inside. It gives no reason for the departure; the owner may come back. The place remains empty and quiet.',
      choices: [
        { id: 'leaveNote', label: 'Leave a note saying you passed by', effects: { historyFlags: ['left_note_for_found_property_owner'] }, next: 'noteLeft' },
        { id: 'takeWatch', label: 'Keep the silver pocket watch', hint: 'Its name is engraved inside; it may be recognized.', effects: { gainItems: ['foundPocketWatch'], historyFlags: ['finder_took_silver_pocket_watch', 'finder_took_watch_from_{{owner}}'] }, next: 'keptWatch' },
        { id: 'takeCoins', label: 'Take the purse’s three coins', hint: 'The money may be needed, but it is plainly someone’s.', effects: { money: 3, historyFlags: ['finder_took_three_coins', 'finder_took_purse_from_{{owner}}'] }, next: 'keptCoins' },
        { id: 'markAndLeave', label: 'Mark the place and move on', effects: { historyFlags: ['marked_found_property_location'] }, next: 'markedQuietly' },
      ] },
    leftQuietly: { id: 'leftQuietly', title: 'Nothing Taken', text: 'You leave the coat, purse, and wrapped bread where they were. The road takes you on. No one appears, and the quiet gives you no answer about why the place was empty.', ending: 'success', choices: [] },
    securedQuietly: { id: 'securedQuietly', title: 'Kept Dry', text: 'You draw the cloth over the belongings and set the cup upright to keep rain off them. The owner may return to find them as you found them. Nobody arrives before you leave.', ending: 'success', choices: [] },
    tookNecessity: { id: 'tookNecessity', title: 'A Necessary Meal', text: 'You take the bread and leave the coat and purse. It is enough to quiet your hunger, not enough to explain who left. No one comes back while you are there.', ending: 'success', choices: [] },
    noteLeft: { id: 'noteLeft', title: 'A Note by the Cup', text: 'You leave a short note with the receipt, saying when you passed and that the belongings stayed untouched. The empty place remains empty. You continue on without learning whether {{owner}} will return.', ending: 'success', choices: [] },
    keptWatch: { id: 'keptWatch', title: 'The Watch in Your Pocket', text: 'The silver watch is clearly someone’s property, its owner’s name engraved inside. You take it openly and leave the other belongings in place. No one appears; whether the watch travels farther with you is your choice at the end of the adventure.', ending: 'success', choices: [] },
    keptCoins: { id: 'keptCoins', title: 'Three Coins', text: 'You take the three coins and leave the named receipt and other belongings. No one arrives to question you. The empty place offers no verdict on what you chose.', ending: 'success', choices: [] },
    markedQuietly: { id: 'markedQuietly', title: 'A Mark Beside the Road', text: 'You mark the location with a clear sign from the road, then leave everything where it is. Nobody returns during your visit. You carry away only the knowledge that someone passed through recently.', ending: 'success', choices: [] },
  },
};
