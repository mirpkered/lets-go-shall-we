import type { Scenario } from '../types';

export const BROKEN_BELL: Scenario = {
  id: 'broken-bell',
  title: 'The Broken Bell',
  subtitle: 'Three silent nights. Two missing relics. One thing waiting below.',
  startScene: 'chapelExterior',
  scenes: {
    chapelExterior: {
      id: 'chapelExterior', title: 'The Silent Chapel', tone: 'warning',
      text: 'The chapel crouches above the village like a wet black crow. Its bell rope sways, though the night is still. Beyond the leaning graveyard wall, something large moves between the stones. The priest’s lantern lies broken on the path.',
      choices: [
        { id: 'enter', label: 'Enter the chapel', hint: 'The oak door stands ajar.', next: 'chapelNave' },
        { id: 'graveyard', label: 'Follow the graveyard path', hint: 'Fresh tracks cross the mud.', next: 'graveyardEdge' },
        { id: 'rope', label: 'Inspect the bell rope', hint: 'Look before you pull.', effects: { knowledge: ['The chapel bell was cut loose from below, not from the tower.'], setFlags: ['inspectedRope'] }, next: 'ropeClue' },
        { id: 'circle', label: 'Circle the chapel', hint: 'Search for another way in.', effects: { setFlags: ['foundCellarWindow'] }, next: 'cellarWindow' },
      ],
    },
    ropeClue: {
      id: 'ropeClue', title: 'A Cut Line',
      text: 'The rope ends in a clean, tar-black cut. Someone removed the tower bell’s clapper and fed the rope down through a drilled hole. A smear of grave soil marks the stone beneath it.',
      choices: [
        { id: 'inside', label: 'Go inside', next: 'chapelNave' },
        { id: 'yard', label: 'Check the graveyard', next: 'graveyardEdge' },
      ],
    },
    cellarWindow: {
      id: 'cellarWindow', title: 'The Narrow Window', tone: 'warning',
      text: 'Behind thorn and nettle, a cellar window gapes beneath the chapel. The drop is survivable, but broken glass glitters on the sill. A weak voice whispers from the graveyard: “Not below. Don’t let it sound below.”',
      choices: [
        { id: 'climb', label: 'Climb through carefully', hint: 'A risky shortcut. The glass is visible.', chance: { probability: 0.65, successNext: 'underStairs', failureNext: 'underStairs', successMessage: 'You slip through without a sound.', failureMessage: 'Glass bites your palm. You lose 2 health.', failureEffects: { health: -2 } } },
        { id: 'voice', label: 'Follow the voice', next: 'priestFound' },
        { id: 'door', label: 'Use the chapel door', next: 'chapelNave' },
      ],
    },
    chapelNave: {
      id: 'chapelNave', title: 'The Empty Nave',
      text: 'Rain ticks against colored glass. Muddy footprints lead from the altar to a trapdoor hidden under a prayer rug. A brass candlestick lies beside a dark stain. From beneath the floor comes a slow scrape—then silence.',
      choices: [
        { id: 'candlestick', label: 'Take the candlestick', hint: 'Heavy, practical brass.', requirements: { notFlags: ['tookCandlestick'] }, effects: { gainItems: ['brassCandlestick'], setFlags: ['tookCandlestick'] }, next: 'chapelNave' },
        { id: 'trapdoor', label: 'Open the trapdoor', hint: 'The scrape came from below.', next: 'underStairs' },
        { id: 'vestry', label: 'Search the vestry', next: 'vestry' },
        { id: 'graveyard', label: 'Go to the graveyard', next: 'graveyardEdge' },
      ],
    },
    vestry: {
      id: 'vestry', title: 'The Priest’s Notes',
      text: 'A page lies crushed beneath a muddy bootprint: “Handbell and clapper recovered from the old burial. Parish display after cleaning.” Below it, written later in a shaking hand: “It followed the sound. I was wrong.”',
      choices: [
        { id: 'read', label: 'Remember the warning', effects: { knowledge: ['The priest removed an iron handbell and black clapper from an older burial below the chapel.'], lore: ['The chapel was built over a much older burial place.'], setFlags: ['readNotes'] }, next: 'chapelNave' },
        { id: 'yard', label: 'Find the priest', next: 'graveyardEdge' },
      ],
    },
    graveyardEdge: {
      id: 'graveyardEdge', title: 'Among the Headstones', tone: 'danger',
      text: 'A starved grave-hound blocks the path, ribs sharp under mangy hide. An iron chain trails from its collar. It growls, but does not charge. Behind it, the priest is propped against a yew, one hand pressed to his bleeding side.',
      choices: [
        { id: 'calm', label: 'Lower the lantern', hint: 'Avoid challenging the frightened animal.', effects: { knowledge: ['The grave-hound fears bright flame but responds to a calm voice.'], setFlags: ['calmedHound'] }, next: 'priestFound' },
        { id: 'fightKnife', label: 'Drive it back', hint: 'Combat may wound or kill you.', effects: { combat: { enemy: 'grave-hound', winChance: 0.68, damageOnWin: 1, damageOnLoss: 4, winNext: 'priestFound', lossNext: 'graveyardEdge' } } },
        { id: 'fightBrass', label: 'Use the candlestick', hint: 'Its reach improves your odds.', requirements: { items: ['brassCandlestick'] }, effects: { combat: { enemy: 'grave-hound', winChance: 0.86, damageOnWin: 0, damageOnLoss: 3, winNext: 'priestFound', lossNext: 'graveyardEdge' } } },
        { id: 'retreat', label: 'Return to the chapel', next: 'chapelNave' },
      ],
    },
    priestFound: {
      id: 'priestFound', title: 'The Injured Priest',
      text: '“I took what was not ours,” the priest gasps. He presses a carved bone key into your hand. “The handbell is in the chest. The clapper fell deeper. Return both. And whatever you do—DO NOT RING IT BELOW.” He knots a little yew ward for you, then points toward the chapel.',
      choices: [
        { id: 'takeKey', label: 'Take the key and charm', requirements: { notFlags: ['helpedPriest'] }, effects: { gainItems: ['boneKey', 'yewCharm'], knowledge: ['DO NOT RING IT BELOW.'], setFlags: ['helpedPriest'] }, next: 'chapelNave' },
        { id: 'leave', label: 'Head below', requirements: { flags: ['helpedPriest'] }, next: 'underStairs' },
        { id: 'rest', label: 'Bind his wound', requirements: { notFlags: ['boundPriest'] }, effects: { setFlags: ['boundPriest'], lore: ['The masked keeper only attacked after the stolen bell was sounded.'] }, next: 'priestFound' },
      ],
    },
    underStairs: {
      id: 'underStairs', title: 'Beneath the Chapel', tone: 'warning',
      text: 'Stone steps descend into a cramped ossuary. Sooted letters cover the arch: DO NOT RING IT BELOW. A wooden chest rests under the warning. Beyond it, a passage slopes toward a bronze door. The scraping comes from the dark beyond.',
      choices: [
        { id: 'unlock', label: 'Unlock the wooden chest', requirements: { items: ['boneKey'], notFlags: ['openedChest'] }, effects: { gainItems: ['ironHandbell', 'graveCoin'], setFlags: ['openedChest'] }, next: 'openedChest' },
        { id: 'force', label: 'Force the wooden chest', hint: 'The lid is iron-banded. Failure will hurt.', requirements: { notFlags: ['openedChest'] }, chance: { probability: 0.45, successNext: 'openedChest', failureNext: 'underStairs', successMessage: 'The old lock tears free.', failureMessage: 'The knife slips. You lose 3 health.', successEffects: { gainItems: ['ironHandbell'], setFlags: ['openedChest'] }, failureEffects: { health: -3 } } },
        { id: 'passage', label: 'Enter the old passage', hint: 'Something waits beyond the bronze door.', next: 'burialApproach' },
        { id: 'up', label: 'Return upstairs', next: 'chapelNave' },
      ],
    },
    openedChest: {
      id: 'openedChest', title: 'The Stolen Handbell',
      text: 'Inside lies a small iron handbell wrapped in altar cloth. Its hollow mouth seems to drink the lantern light. A silver grave coin has been tucked beneath it as if someone once paid for its silence.',
      choices: [
        { id: 'deeper', label: 'Seek the missing clapper', next: 'burialApproach' },
        { id: 'priest', label: 'Return to the priest', next: 'priestFound' },
      ],
    },
    burialApproach: {
      id: 'burialApproach', title: 'The Old Burial', tone: 'danger',
      text: 'Past the bronze door, roots thread through ancient stone. The black iron clapper rests inside a ring of white bones. Across the chamber stands a tall creature in a cracked bronze mask. It raises empty hands. When you move toward the clapper, it lowers into a warning crouch.',
      choices: [
        { id: 'speak', label: 'Show empty hands', hint: 'It has warned you, but has not attacked.', effects: { setFlags: ['showedPeace'] }, next: 'maskedParley' },
        { id: 'snatch', label: 'Snatch the clapper', hint: 'Fast, dangerous, and not impossible.', chance: { probability: 0.42, successNext: 'maskedParley', failureNext: 'burialApproach', successMessage: 'You roll through the bone ring with the clapper in hand.', failureMessage: 'A long arm hurls you back. You lose 3 health.', failureEffects: { health: -3, setFlags: ['angeredKeeper'] } }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] } },
        { id: 'fight', label: 'Attack the masked creature', hint: 'It is larger than you. This could be fatal.', effects: { combat: { enemy: 'masked keeper', winChance: 0.46, damageOnWin: 4, damageOnLoss: 7, winNext: 'keeperDefeated', lossNext: 'burialApproach' } } },
        { id: 'retreat', label: 'Back away slowly', next: 'underStairs' },
      ],
    },
    maskedParley: {
      id: 'maskedParley', title: 'A Keeper, Not a Monster',
      text: 'The creature touches its mask, then points to a bell-shaped hollow in the burial altar. It points to the clapper, then to the same hollow. Not a threat—a demand. The old things belong here. From a cord at its neck hangs a loose fragment of bronze.',
      choices: [
        { id: 'returnBoth', label: 'Return bell and clapper', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { loseItems: ['ironHandbell', 'blackClapper'], gainItems: ['bronzeMaskFragment'], money: 8, lore: ['The masked keeper guards the old burial; it is not inherently evil.'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'takeClapper', label: 'Take the clapper gently', requirements: { notFlags: ['hasClapper'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'maskedParley' },
        { id: 'returnBell', label: 'Return the handbell first', requirements: { items: ['ironHandbell'], notFlags: ['returnedBell'] }, effects: { loseItems: ['ironHandbell'], setFlags: ['returnedBell'] }, next: 'partialReturn' },
        { id: 'ring', label: 'Ring the handbell below', hint: 'Every warning says this is catastrophic.', requirements: { items: ['ironHandbell', 'blackClapper'] }, effects: { health: -20 }, next: 'deathBell' },
      ],
    },
    partialReturn: {
      id: 'partialReturn', title: 'Half a Promise',
      text: 'The keeper places the handbell in the altar hollow and waits. When you lift the black clapper, it does not stop you. It only points to the bell. You understand: finish what you started.',
      choices: [
        { id: 'place', label: 'Place the clapper beside it', requirements: { items: ['blackClapper'] }, effects: { loseItems: ['blackClapper'], gainItems: ['bronzeMaskFragment'], lore: ['The masked keeper accepted the return of the burial relics.'], setFlags: ['peacefulResolution'] }, next: 'peaceEnding' },
        { id: 'lift', label: 'Lift the clapper from the bones', requirements: { notFlags: ['hasClapper'] }, effects: { gainItems: ['blackClapper'], setFlags: ['hasClapper'] }, next: 'partialReturn' },
        { id: 'leave', label: 'Leave while it permits you', next: 'underStairs' },
      ],
    },
    keeperDefeated: {
      id: 'keeperDefeated', title: 'A Costly Victory', tone: 'danger',
      text: 'The masked keeper falls beside the altar. It never cries out. Behind its cracked mask is a face both ancient and terribly human. You find the clapper among the bones and understand, too late, that it was guarding the burial—not hunting the village.',
      choices: [
        { id: 'seal', label: 'Return the bell and seal the door', requirements: { items: ['ironHandbell'] }, effects: { loseItems: ['ironHandbell'], gainItems: ['bronzeMaskFragment'], money: 5, lore: ['Violence ended the keeper, though returning the stolen relics ended the haunting.'] }, next: 'hardEnding' },
        { id: 'return', label: 'Go back for the stolen bell', requirements: { notFlags: ['openedChest'] }, effects: { gainItems: ['bronzeMaskFragment'], setFlags: ['violentResolution'] }, next: 'underStairs' },
      ],
    },
    peaceEnding: {
      id: 'peaceEnding', title: 'The Bell Stays Silent',
      text: 'The keeper fits the clapper beside the handbell, never inside it, and closes the burial altar. Above, the grave-hound stops howling. By dawn the priest is safe, the livestock return from the wood, and the chapel bell rings once—from its tower, where bells belong.',
      choices: [], ending: 'success',
    },
    hardEnding: {
      id: 'hardEnding', title: 'Morning, at a Price',
      text: 'You drag the priest into the dawn as the old passage settles behind you. The village is safe, and the missing livestock wander home. Yet when the tower bell rings, you remember the keeper’s empty hands and wonder what the chapel has lost.',
      choices: [], ending: 'success',
    },
    deathBell: {
      id: 'deathBell', title: 'The Sound Below', tone: 'danger',
      text: 'The iron note has nowhere to go. It passes through stone, bone, lantern glass—and you. The last thing you see is the keeper reaching not to strike you, but to silence the bell.',
      choices: [], ending: 'death',
    },
  },
};
