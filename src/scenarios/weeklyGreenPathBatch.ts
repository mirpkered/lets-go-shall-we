import type { Choice, Scenario, Scene } from '../types';

const n = (id: string, title: string, text: string, choices: Choice[], tone: Scene['tone'] = 'safe'): Scene => ({ id, title, text, choices, tone });
const e = (id: string, title: string, text: string): Scene => ({ id, title, text, ending: 'success', choices: [] });
const allYear = { season: 'ALL_YEAR' as const, weightBoost: 1 };

export const WEEKLY_GREEN_PATH_ADVENTURES: Scenario[] = [
  {
    id: 'the-map-in-the-night-school', title: 'The Map in the Night School', subtitle: 'Adult students disagree over whether a useful street map should include an unverified shortcut.', startScene: 'class',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A night class decides how to mark a path that is useful to some students but not yet verified as public.', availability: allYear },
    scenes: {
      class: n('class', 'A Map after Work', 'At the borrowed schoolroom, teacher Sella Venn has drawn the main road in chalk. Two adult students say a footpath behind the lime shed saves a long walk; a third says its gate is sometimes locked. The map is for people who cannot attend every lesson, so a confident line could send someone to a closed gate.', [
        { id: 'askForRoutes', label: 'Ask each student to describe the route they actually use', next: 'accounts' },
        { id: 'walkToTheWall', label: 'Step outside and check which landmarks can be seen from the yard', next: 'sightline' },
        { id: 'leaveMargin', label: 'Ask Sella to leave room for an unverified note', next: 'margin' },
      ]),
      accounts: n('accounts', 'Two Routes, One Gate', 'The path is open from the north lane, but the southern gate crosses a yard that closes at dusk. Neither account is false; each describes a different hour and entrance.', [
        { id: 'compareHours', label: 'Mark the north entrance and the dusk closing time separately', next: 'decision' },
        { id: 'askPermission', label: 'Ask the yard keeper whether the southern gate may be shown', next: 'keeper' },
      ]),
      sightline: n('sightline', 'What the Yard Can Show', 'From the school steps, the lime shed is visible but the gate is hidden by its wall. The view supports the shed’s location, not the path beyond it.', [
        { id: 'recordVisibleLandmark', label: 'Mark only the shed as a landmark and keep the path provisional', next: 'decision' },
        { id: 'seekPermission', label: 'Walk to the north lane and ask the yard keeper about access', next: 'keeper' },
      ]),
      margin: n('margin', 'Room for What Is Not Known', 'Sella can leave a blank margin beside the map. It will not tell a late student which way to walk, but it will keep a guess from looking like a surveyed road.', [
        { id: 'putQuestionInMargin', label: 'Write “gate hours not checked” beside the path', next: 'decision' },
        { id: 'checkNorthEntrance', label: 'Check whether the north entrance is usable after class', next: 'keeper' },
      ]),
      keeper: n('keeper', 'The Yard Keeper’s Boundary', 'Keeper Bram says the north lane is public and the southern yard is private. He will open the south gate during daylight if students ask, but does not want the map to imply that it stays open.', [
        { id: 'recordPermission', label: 'Mark the south gate as a daylight permission route', next: 'permission' },
        { id: 'keepPublicRoute', label: 'Show only the north lane as a dependable route', next: 'publicOnly' },
      ]),
      permission: e('permission', 'A Route with Its Conditions', 'Sella draws the public lane solid and the daylight gate in a separate dotted line. The class has a usable map, and the private boundary remains visible.'),
      publicOnly: e('publicOnly', 'The Long Way Is Clear', 'The map shows the longer north lane as dependable. Nobody is sent to a gate that may be shut, and the students keep the shorter route as an oral possibility rather than a promise.'),
      decision: n('decision', 'What the Map Can Claim', 'The class has enough information to publish a useful map, but not enough to call every part of the path public or always open.', [
        { id: 'publishQualifiedMap', label: 'Publish the map with the boundary and hours marked', next: 'qualified', effects: { historyFlags: ['helped_night_school_publish_qualified_path_map'] } },
        { id: 'waitForSurvey', label: 'Hold the path until the school can check it in daylight', next: 'held', effects: { historyFlags: ['held_night_school_shortcut_for_daylight_check'] } },
      ]),
      qualified: e('qualified', 'Useful without Overclaiming', 'The map distinguishes the public lane, the private yard, and the hours that matter. Sella gives the first copy to the student who could not attend tonight.'),
      held: e('held', 'A Blank Left Honestly', 'The students keep the road map and leave the shortcut blank until someone can check it. No one has mistaken a useful story for a guaranteed route.'),
    },
  },
  {
    id: 'the-portrait-from-the-side-window', title: 'The Portrait from the Side Window', subtitle: 'A traveling photographer must decide whether a clear plate is worth exposing a private household.', startScene: 'shop',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A photographer has captured an identifiable private room through a reflection and asks how to handle the plate.', availability: allYear },
    scenes: {
      shop: n('shop', 'A Window in the Plate', 'Photographer Neri Vale sets a glass plate on the worktable. The picture shows the public square and, in a shop window reflection, the open doorway of a nearby home. A child inside is recognizable. Neri has not printed it and does not know the family.', [
        { id: 'inspectReflection', label: 'Compare the plate with the view from the pavement', next: 'comparison' },
        { id: 'askNeriPurpose', label: 'Ask what Neri wants the photograph to show', next: 'purpose' },
        { id: 'findOccupant', label: 'Ask the shopkeeper whether the household can be consulted', next: 'consult' },
      ]),
      comparison: n('comparison', 'A Picture inside a Picture', 'The square is sharp, but the reflected doorway is also clear enough to identify. Cropping the edge would remove the doorway and keep the people gathered around the fountain.', [
        { id: 'markCrop', label: 'Mark a crop that excludes the reflected doorway', next: 'crop' },
        { id: 'askBeforePrinting', label: 'Hold the plate until the household is asked', next: 'consult' },
      ]),
      purpose: n('purpose', 'The Public View', 'Neri wants a print of the square for the town reading room. The reflected household is not part of that purpose, though the untouched plate would show it clearly.', [
        { id: 'cropForPurpose', label: 'Crop the print to the square and fountain', next: 'crop' },
        { id: 'preserveUnprinted', label: 'Keep the plate unprinted until permission is clear', next: 'held' },
      ]),
      consult: n('consult', 'A Household’s Answer', 'The shopkeeper finds the child’s aunt nearby. She is comfortable with the public square appearing in a print but does not want the family doorway copied or displayed.', [
        { id: 'honorBoundary', label: 'Crop the reflection and show the family the proof', next: 'proof' },
        { id: 'discardPlate', label: 'Set the plate aside rather than risk copying the doorway', next: 'held' },
      ]),
      crop: n('crop', 'The Proof without the Doorway', 'The new frame keeps the fountain, the readers, and the shopfront sign. The reflected doorway falls outside it.', [
        { id: 'showProof', label: 'Show the proof to the household before printing', next: 'proof' },
        { id: 'printSquare', label: 'Print the public-square view only', next: 'publicPrint', effects: { historyFlags: ['chose_public_square_crop_over_private_window'] } },
      ]),
      proof: n('proof', 'A Boundary in the Proof', 'The aunt sees the crop and agrees that it shows the square without exposing their room. Neri can print this view or keep the plate private.', [
        { id: 'printApprovedView', label: 'Print the approved view of the square', next: 'approvedPrint', effects: { money: 2, historyFlags: ['photograph_printed_with_household_consent'] } },
        { id: 'keepPlatePrivate', label: 'Keep the plate in the drawer and make no print', next: 'privatePlate', effects: { historyFlags: ['kept_reflected_household_out_of_public_print'] } },
      ]),
      publicPrint: e('publicPrint', 'A Square, Not a Household', 'Neri prints the square for the reading room. The photograph keeps the public gathering and leaves the private doorway outside the frame.'),
      approvedPrint: e('approvedPrint', 'A Print They Agreed To', 'Neri prints the cropped square for the reading room and gives the household the first proof. The private room stays private.'),
      privatePlate: e('privatePlate', 'The Plate Stays Unshown', 'The glass plate is wrapped and put away. No print is made from an image the household did not agree to share.'),
      held: e('held', 'No Print Yet', 'Neri leaves the plate unprinted. The square can be photographed another day without making a private doorway part of the picture.'),
    },
  },
  {
    id: 'two-voices-for-one-song', title: 'Two Voices for One Song', subtitle: 'A supper-room singer is asked to settle two family versions of a refrain that no one can prove oldest.', startScene: 'rehearsal',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A singer must preserve attribution and uncertainty when two households remember different endings to a local song.', availability: allYear },
    scenes: {
      rehearsal: n('rehearsal', 'The Refrain at the Table', 'At a boardinghouse supper, singer Halen Ors stops after a familiar refrain. The Vale family sings “leave the lamp beside the door”; the Fen family remembers “leave the latch as it was.” Both say an older relative taught it to them. No printed copy settles the words.', [
        { id: 'hearValeVersion', label: 'Ask the Vale family to sing their version once', next: 'vale' },
        { id: 'hearFenVersion', label: 'Ask the Fen family to sing theirs once', next: 'fen' },
        { id: 'letHalenChoose', label: 'Ask Halen what the room needs from the song tonight', next: 'purpose' },
      ]),
      vale: n('vale', 'The Lamp beside the Door', 'The Vale version is slower and names a lamp. They say it was sung when their household kept a late meal for a returning worker; they do not claim to know who wrote it.', [
        { id: 'hearOtherVersion', label: 'Hear the Fen family’s refrain before deciding', next: 'fen' },
        { id: 'keepSourceNamed', label: 'Keep the Vale words attributed to the Vale household', next: 'decision' },
      ]),
      fen: n('fen', 'The Latch as It Was', 'The Fen version holds the same tune but ends on a latch. They remember it from a different branch of the family and do not claim it is the original.', [
        { id: 'keepFenNamed', label: 'Keep the Fen words attributed to the Fen household', next: 'decision' },
      ]),
      purpose: n('purpose', 'A Song for This Room', 'Halen says the room wants a song, not an argument about ownership. The two verses can be sung in turn, or the group can leave the refrain out tonight.', [
        { id: 'singBoth', label: 'Invite each family to sing its own ending', next: 'both' },
        { id: 'skipRefrain', label: 'Leave the disputed refrain out of tonight’s song', next: 'quiet' },
      ]),
      decision: n('decision', 'No Proof of an Original', 'The families have offered memories, not proof of authorship. A printed sheet could preserve both accounts if it labels them carefully.', [
        { id: 'printBoth', label: 'Write both versions with each household named', next: 'both', effects: { lore: ['The boardinghouse supper song has two family-attributed refrains; neither household account establishes an original.'] } },
        { id: 'leaveUnprinted', label: 'Keep the song oral rather than print uncertain words', next: 'quiet' },
      ]),
      both: e('both', 'Two Refrains, Both Kept', 'The song is sung twice, once with each family’s words. No one is asked to surrender a memory, and the room does not call either version the original.'),
      quiet: e('quiet', 'A Refrain Left Open', 'Halen sings the tune without the disputed lines. The supper continues, and the two accounts remain separate rather than being forced into one answer.'),
    },
  },
  {
    id: 'the-weather-books-blank-week', title: 'The Weather Book’s Blank Week', subtitle: 'A county observer must publish a rainfall record with several missing days and pressure to fill the gaps.', startScene: 'office',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A public weather record is incomplete, and a landholder wants estimates to be presented as measurements.', availability: allYear },
    scenes: {
      office: n('office', 'A Week without Marks', 'Observer Dera Pell has six clean daily entries and three blank spaces in the rainfall book. A landholder wants a total before selling a field’s drainage plan. Dera refuses to guess. A marked brass cup stands on the sill, but it was set out only yesterday.', [
        { id: 'readSurvivingEntries', label: 'Add only the six dated readings and mark the gaps', next: 'known' },
        { id: 'checkObserverNotes', label: 'Search the desk for dated notes from the missing days', next: 'notes' },
        { id: 'inspectCup', label: 'Inspect the rain cup and its placement on the sill', next: 'cup' },
        { id: 'readCurrentGauge', label: 'Use your Field Rain Gauge to start a new dated reading', next: 'newSeries', requirements: { usableGear: ['fieldRainGauge'] }, unavailableText: 'No usable Field Rain Gauge is carried.' },
      ]),
      known: n('known', 'What the Book Can Say', 'The six recorded amounts can be totaled, but they cannot establish the missing days or the full week. The field plan can proceed later with a complete record.', [
        { id: 'publishPartialTotal', label: 'Publish the six-day total with the gap plainly marked', next: 'partial', effects: { historyFlags: ['published_partial_rain_record_with_dates'] } },
        { id: 'holdWeeklyTotal', label: 'Leave the weekly total blank until a full week is observed', next: 'held' },
      ]),
      notes: n('notes', 'Notes without Dates', 'Two scraps describe “hard rain” and “a dry morning,” but neither carries a date. They may refer to the blank week, but they cannot be assigned to particular days.', [
        { id: 'retainAsUndated', label: 'Attach the scraps as undated recollections', next: 'partial' },
        { id: 'excludeFromBook', label: 'Keep them out of the measured total', next: 'known' },
      ]),
      cup: n('cup', 'A Reading Is Not a Memory', 'The cup is level and the marks are clear. Because it has stood outside for only one day, its current reading cannot recover what fell last week.', [
        { id: 'useForNextWeek', label: 'Begin a dated series from today onward', next: 'newSeries' },
        { id: 'keepOldGap', label: 'Leave the earlier blanks as blanks', next: 'known' },
      ]),
      partial: e('partial', 'A Partial Record with Its Limits', 'Dera posts the measured six-day sum, labels the scraps as undated, and leaves the three daily values unknown. The field plan will not be built on invented rainfall.'),
      held: e('held', 'No False Weekly Total', 'Dera leaves the weekly sum blank. The missing observations remain a gap, and the landholder can wait for a complete week before treating the book as a record.'),
      newSeries: e('newSeries', 'A Record Begins Today', 'The cup starts a new dated series. It will not fill the missing week, but the next plan can use measurements that were actually made.'),
    },
  },
  {
    id: 'the-gate-that-stayed-open', title: 'The Gate That Stayed Open', subtitle: 'A public garden’s open gate invites neighbors through a path that crosses a private growing bed.', startScene: 'garden',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A shared garden must preserve a public walking route without treating a private growing strip as common ground.', availability: allYear },
    scenes: {
      garden: n('garden', 'A Path through the Beds', 'A public garden gate has been left open. The gravel path crosses the edge of a narrow bed leased by grower Tal Orin; walkers have not damaged the plants, but their feet have packed the soil. The garden keeper asks whether to close the gate or move the path.', [
        { id: 'walkPath', label: 'Walk the path and note where feet leave the gravel', next: 'footprints' },
        { id: 'speakToGrower', label: 'Ask Tal what the packed soil is doing to the bed', next: 'grower' },
        { id: 'askKeeper', label: 'Ask the keeper what access the garden promised', next: 'promise' },
      ]),
      footprints: n('footprints', 'The Short Turn', 'Most walkers cut the same inside corner, where the gravel narrows beside the bed. A wider turn would keep their feet on the path but would take part of an unused lawn.', [
        { id: 'markWideTurn', label: 'Mark a wider gravel turn through the unused lawn', next: 'proposal' },
        { id: 'closeUntilRepair', label: 'Close the gate until the path can be repaired', next: 'temporary' },
      ]),
      grower: n('grower', 'A Bed beside a Public Path', 'Tal says the compacted edge drains poorly after rain. Tal does not want the gate closed forever, but asks that walkers not be blamed when the path itself invites the shortcut.', [
        { id: 'proposeWiderTurn', label: 'Ask the keeper to shift gravel into the unused lawn', next: 'proposal' },
        { id: 'proposeSign', label: 'Mark the bed edge and ask walkers to keep to the gravel', next: 'marked' },
      ]),
      promise: n('promise', 'The Garden’s Promise', 'The garden promised an open route from the lane to the fountain, not access to every planting bed. The keeper has a small fund for gravel, but not for a new fence.', [
        { id: 'spendOnGravel', label: 'Use the fund to widen the path and pay for an hour of hauling', next: 'proposal', effects: { money: 2 } },
        { id: 'temporaryNotice', label: 'Post a temporary notice while the path is replanned', next: 'temporary' },
      ]),
      proposal: n('proposal', 'A Route That Keeps Its Promise', 'A wider turn can avoid the planted strip and still reach the fountain. The gravel must be moved before the gate is left open again.', [
        { id: 'helpMoveGravel', label: 'Help shift the loose gravel onto the wider turn', next: 'openRoute', effects: { money: 3, historyFlags: ['helped_reopen_garden_path_around_leased_bed'] } },
        { id: 'keeperArrangesWork', label: 'Leave the keeper to arrange the work before reopening', next: 'planned' },
      ]),
      marked: e('marked', 'The Bed Is Not a Walkway', 'A low marker makes the planted edge visible while the gravel track remains open. The keeper will watch whether people stay on the path before choosing a larger change.'),
      temporary: e('temporary', 'Closed for a Clear Reason', 'The gate closes for the day with a note explaining that the path is being rerouted, not that the garden is private. Tal’s bed is protected while the keeper plans the public route.'),
      openRoute: e('openRoute', 'A Wider Turn to the Fountain', 'The gravel now bends around the leased bed. The gate can stay open without turning a public promise into permission to walk through someone’s plants.'),
      planned: e('planned', 'Work Scheduled, Boundary Kept', 'The keeper marks the new route and schedules the gravel move. The gate stays closed until the promised public path can be used without crossing Tal’s bed.'),
    },
  },
  {
    id: 'the-clock-with-no-noon', title: 'The Clock with No Noon', subtitle: 'Two public clocks disagree and a visiting lecturer’s demonstration depends on a time no one can verify.', startScene: 'hall',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A civic demonstration must choose how to handle two clocks that disagree without claiming an exact standard no one has checked.', availability: allYear },
    scenes: {
      hall: n('hall', 'Twelve on Two Faces', 'At the town hall, the wall clock reads twelve while the meeting-room regulator is seven minutes behind. Lecturer Emmet Dorr has invited residents to watch a shadow cross a marked line at noon. He has no authority over the town clock and asks you what to tell the waiting room.', [
        { id: 'compareClocks', label: 'Compare both clocks with your Silver Pocket Watch', next: 'compare', requirements: { usableGear: ['foundPocketWatch'] }, unavailableText: 'No usable Silver Pocket Watch is carried.' },
        { id: 'inspectShadowMark', label: 'Inspect the mark and the window’s direction', next: 'shadow' },
        { id: 'askLecturerAim', label: 'Ask what the demonstration is meant to show', next: 'purpose' },
      ]),
      compare: n('compare', 'A Third Watch', 'Your watch agrees with the regulator within a minute. That suggests the town clock is fast, but it does not make your personal watch the town’s official standard.', [
        { id: 'tellRoomDifference', label: 'Tell the room the clocks differ and name the readings', next: 'announcement' },
        { id: 'setDemonstrationByWatch', label: 'Ask Emmet to use your watch for this demonstration only', next: 'temporary' },
      ]),
      shadow: n('shadow', 'A Mark on the Floor', 'The line is drawn by the window and changes with the sun. It can show a local shadow crossing, but the present clouds make its timing uncertain.', [
        { id: 'waitForClearLight', label: 'Wait for a clear patch and describe what the mark shows', next: 'temporary' },
        { id: 'postponeExactMinute', label: 'Postpone the timed demonstration and explain why', next: 'postponed' },
      ]),
      purpose: n('purpose', 'What the Demonstration Can Prove', 'Emmet wants to show how a shadow changes, not certify the town’s clock. The crowd can watch the movement without being told that either face sets the correct civic hour.', [
        { id: 'showShadowChange', label: 'Keep the demonstration about the moving shadow', next: 'temporary' },
        { id: 'announceClockConflict', label: 'Explain the disagreement before the lecture begins', next: 'announcement', effects: { historyFlags: ['town_lecture_recorded_both_clock_readings'] } },
      ]),
      announcement: e('announcement', 'A Difference, Not a Verdict', 'Emmet names both clock readings and says the town clock has not been checked. The demonstration begins without turning a disagreement into a claim of exact time.'),
      temporary: e('temporary', 'A Local Demonstration', 'The room watches the shadow shift across the floor mark. Emmet describes what is visible and leaves the town’s official time unsettled.'),
      postponed: e('postponed', 'No False Noon', 'The timed demonstration is postponed until the line can be seen. The hall keeps the conflicting clock readings posted so the next meeting can decide which clock to inspect.'),
    },
  },
  {
    id: 'the-stone-with-two-labels', title: 'The Stone with Two Labels', subtitle: 'A small local collection has one stone and two incompatible stories of how it entered the cabinet.', startScene: 'cabinet',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A collection must preserve uncertain provenance when two donated labels describe the same unremarkable stone.', availability: allYear },
    scenes: {
      cabinet: n('cabinet', 'A Stone between Cards', 'In a school collection cabinet, curator Ilya Sen has found two labels under one river stone. One says it came from the old mill foundation; the other says a child picked it up below the ford. A shallow groove on one face might be a quarry mark or an ordinary scrape; it cannot settle the matter by itself.', [
        { id: 'readCards', label: 'Compare the handwriting and dates on both labels', next: 'cards' },
        { id: 'askDonors', label: 'Ask the two donors what they remember', next: 'donors' },
        { id: 'inspectStone', label: 'Look for a feature that could distinguish the locations', next: 'stone' },
        { id: 'copyGroove', label: 'Use your Charcoal Rubbing Kit to preserve the shallow groove', next: 'rubbed', requirements: { usableGear: ['charcoalRubbingKit'] }, unavailableText: 'No usable Charcoal Rubbing Kit is carried.', effects: { lore: ['A shallow groove on a river stone was preserved without proving where the stone came from or who marked it.'] } },
      ]),
      cards: n('cards', 'Two Different Hands', 'The mill note is older, but its ink has run. The ford note is newer and names the child, not a date. Neither card proves the stone’s origin.', [
        { id: 'keepBothCards', label: 'Keep both cards beside the stone as competing accounts', next: 'labelled' },
        { id: 'removeClaims', label: 'Set both claims aside and label the stone’s source unknown', next: 'unknown' },
      ]),
      donors: n('donors', 'Memories at Different Distances', 'The mill keeper remembers a basket of rubble taken during repairs. The child remembers finding a smooth stone by the ford. The stone may be either one, but neither witness can identify it now.', [
        { id: 'attributeAccounts', label: 'Record both accounts with their speakers named', next: 'labelled' },
        { id: 'doNotChoose', label: 'Leave the stone’s provenance unknown', next: 'unknown' },
      ]),
      stone: n('stone', 'A Stone without a Signature', 'Its rounded face fits a river bed, but old mill stone also gathered at the ford. Shape alone cannot separate the two histories.', [
        { id: 'recordWhatFits', label: 'Note the shape and preserve both possible sources', next: 'labelled' },
        { id: 'labelUnknown', label: 'Record the stone as local, source unverified', next: 'unknown' },
      ]),
      labelled: e('labelled', 'Two Accounts beside One Stone', 'Ilya writes both accounts under their sources and leaves the origin unresolved. The collection keeps what people remember without turning either memory into proof.'),
      unknown: e('unknown', 'Local, Source Unverified', 'The new card says only that the stone is local and its source is unknown. Neither uncertain story is erased; both remain in the collection’s notes.'),
      rubbed: e('rubbed', 'The Groove Preserved, Not Identified', 'You copy the shallow groove without removing anything from the stone. Ilya records the impression as a feature for later study, not proof of a maker or place.'),
    },
  },
  {
    id: 'the-candle-behind-the-curtain', title: 'The Candle behind the Curtain', subtitle: 'An amateur performance is delayed when a backstage candle is found too close to a heavy cloth.', startScene: 'stage',
    diversity: { riskTier: 'HIGH', distinctiveHook: 'A live flame near a hanging curtain forces an informed choice between interrupting a public performance and accepting a visible fire risk.', availability: allYear },
    scenes: {
      stage: n('stage', 'A Flame at the Wing', 'The hall is filling for a short play. A candle used to light the prop table sits behind a hanging curtain; the cloth edge is already warm and lifts in the draft. Stagehand Orel says the last prop change is not ready, and the audience has not been told about the delay.', [
        { id: 'removeCandle', label: 'Carry the candle to the stone passage and call for a pause', next: 'pause' },
        { id: 'warnStagehand', label: 'Warn Orel and ask for the curtain to be tied clear', next: 'warning' },
        { id: 'watchFromDoor', label: 'Keep clear and tell the hall steward what you saw', next: 'steward' },
      ]),
      pause: n('pause', 'The Show Stops before the Flame Spreads', 'You set the candle on stone and Orel ties the curtain away. The prop change is delayed, but the cloth cools before anyone returns to the table.', [
        { id: 'inspectBeforeRestart', label: 'Check that the cloth and prop table are cool before restarting', next: 'safeRestart', effects: { historyFlags: ['paused_performance_for_curtain_fire_safety'] } },
        { id: 'leaveRestartToOrel', label: 'Leave the restart decision to the stagehand', next: 'closed' },
      ]),
      warning: n('warning', 'A Warning with a Window', 'Orel hears the warning while the flame is still small. He can tie the cloth clear now, or the steward can stop the performance until the prop table is moved.', [
        { id: 'tieCloth', label: 'Help Orel tie the curtain clear before the next cue', next: 'safeRestart' },
        { id: 'callSteward', label: 'Ask the steward to hold the curtain and pause the room', next: 'closed' },
      ], 'warning'),
      steward: n('steward', 'The Hall Is Told', 'The steward moves the audience back from the wing and calls for the candle to be removed. The play can wait; the flame is still near the curtain.', [
        { id: 'helpClearWing', label: 'Carry the candle away while the steward holds the passage clear', next: 'closed' },
        { id: 'stayOut', label: 'Keep the audience back and let the stage crew clear it', next: 'closed' },
      ], 'danger'),
      safeRestart: e('safeRestart', 'The Curtain Hangs Clear', 'The cloth is cool and the candle remains on stone outside the wing. The play begins late, with the hazard removed and the pause explained.'),
      closed: e('closed', 'A Delayed Performance', 'The steward keeps the wing closed until the candle is moved and the curtain tied back. The play loses a few minutes; the hall does not ask the audience to accept a fire risk for the schedule.'),
    },
  },
  {
    id: 'the-chair-left-for-an-absence', title: 'The Chair Left for an Absence', subtitle: 'A reading circle has kept a chair for a traveler who may never return, and the group asks whether to keep setting it.', startScene: 'circle',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A quiet reading circle decides how to acknowledge an absent member without inventing their fate or making a stranger stand in for them.', availability: allYear },
    scenes: {
      circle: n('circle', 'One Chair Unused', 'At a small reading circle, host Toma Idris has left one chair beside the stove. The person who used it moved away after the last harvest; no one knows whether they are coming back. Tonight a new listener is standing by the door.', [
        { id: 'askToma', label: 'Ask Toma what the chair means to the group', next: 'meaning' },
        { id: 'welcomeListener', label: 'Offer the standing listener the chair for tonight', next: 'welcome' },
        { id: 'readStanding', label: 'Ask whether the group can make room without moving the chair', next: 'space' },
      ]),
      meaning: n('meaning', 'A Place, Not a Promise', 'Toma says the chair remembers a person who read aloud here. It does not mean the group knows where they are or expects them on a certain night.', [
        { id: 'keepChairTonight', label: 'Leave it empty tonight and begin the reading', next: 'kept' },
        { id: 'makeRoomElsewhere', label: 'Add a second chair for the new listener', next: 'added' },
      ]),
      welcome: n('welcome', 'A Welcome without Substitution', 'The new listener accepts a seat but does not know the absent reader. Toma can move another chair from the wall or leave the remembered place untouched.', [
        { id: 'bringAnotherChair', label: 'Bring in a chair from the wall', next: 'added' },
        { id: 'offerTheRememberedChair', label: 'Offer the place for tonight; do not claim its old reader is gone', next: 'shared' },
      ]),
      space: n('space', 'The Narrow Circle', 'There is enough room for one more person if the circle widens. The stove, door, and book stand stay clear when the chairs turn toward the light.', [
        { id: 'widenCircle', label: 'Widen the circle around a second chair', next: 'added' },
        { id: 'beginNow', label: 'Begin with the listener standing near the open door', next: 'kept' },
      ]),
      kept: e('kept', 'An Empty Chair, No Invented Ending', 'The group reads with the chair beside the stove. Nobody claims to know what became of its former reader, and the new listener can come again.'),
      added: e('added', 'Room for a New Voice', 'Toma brings another chair from the wall. The circle keeps the old place as a memory and gives the new listener a seat of their own.'),
      shared: e('shared', 'A Seat for Tonight', 'The listener sits for the evening. The chair’s earlier meaning remains a memory, not a claim about whether its former reader will return.'),
    },
  },
  {
    id: 'the-tally-with-three-columns', title: 'The Tally with Three Columns', subtitle: 'A public grain weighing mixes the buyer’s sack, a borrowed scale, and the fee for carrying it.', startScene: 'yard',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A grain tally must separate measured weight, the carrier’s labor, and an uncertain sack tare before payment is settled.', availability: allYear },
    scenes: {
      yard: n('yard', 'One Number in Three Places', 'At a cooperative yard, buyer Leda asks you to witness a grain weighing. Her book has one column for gross weight, another for a sack tare copied from an old sheet, and a third for a carrier’s fee. The old tare is for a different sack. Leda wants a fair settlement before the cart leaves.', [
        { id: 'weighSack', label: 'Weigh the full sack and record the scale reading', next: 'gross' },
        { id: 'inspectOldSheet', label: 'Check the old tare sheet before subtracting anything', next: 'sheet' },
        { id: 'askCarrier', label: 'Ask the carrier how the fee was agreed', next: 'fee' },
      ]),
      gross: n('gross', 'The Gross Weight', 'The scale holds steady at the full weight. The sack is damp and heavier than the dry sack in the old sheet; the scale alone cannot tell how much is grain.', [
        { id: 'findDryTare', label: 'Ask whether the empty sack can be weighed separately', next: 'tare' },
        { id: 'recordGrossOnly', label: 'Record the gross weight without calling it net grain', next: 'record' },
      ]),
      sheet: n('sheet', 'A Tare from Another Sack', 'The copied number belongs to a smaller dry sack. Leda agrees it cannot be subtracted from this damp one as if the containers were identical.', [
        { id: 'weighEmpty', label: 'Weigh this sack empty after the grain is transferred', next: 'tare' },
        { id: 'markUnknownTare', label: 'Keep the net amount unresolved until a tare is known', next: 'record' },
      ]),
      fee: n('fee', 'Work beside the Weight', 'The carrier says the fee covers loading and delivery, not the grain’s measured amount. Leda’s book had placed the fee in the same column as the tare.', [
        { id: 'separateColumns', label: 'Separate the weight and carrying fee in the book', next: 'record' },
        { id: 'askForItemizedFee', label: 'Ask Leda and the carrier to confirm the fee before signing', next: 'settle' },
      ]),
      tare: n('tare', 'A Sack Weighed Empty', 'After the grain is transferred, the empty sack can be weighed. The two measurements support a net weight for this sack; the carrier’s fee remains a separate agreement.', [
        { id: 'writeThreeColumns', label: 'Record gross, tare, and net separately', next: 'accurate', effects: { money: 3 } },
        { id: 'leaveForSecondWitness', label: 'Ask a second witness to check the subtraction before signing', next: 'witness' },
      ]),
      record: e('record', 'A Number with Its Meaning', 'The book records the gross measurement and labels the net weight unknown. The carrier’s fee is written separately, so no copied tare quietly changes the payment.'),
      settle: e('settle', 'A Fee Confirmed in Its Own Column', 'Leda and the carrier confirm the carrying fee without treating it as part of the grain weight. The sack still needs an accurate tare before a net amount is claimed.'),
      accurate: e('accurate', 'Three Columns, One Fair Settlement', 'Gross, tare, and net now have separate entries, with the carrier’s fee beside them rather than hidden inside a weight. Leda pays you for witnessing the settlement.'),
      witness: e('witness', 'A Second Check before Signing', 'The second witness checks the subtraction with both measurements present. The settlement waits until then, but the old copied tare is not used.'),
    },
  },
  {
    id: 'the-cloth-that-would-not-dry', title: 'The Cloth That Would Not Dry', subtitle: 'A dyer faces a damp batch whose color has not set evenly and must choose how much can be promised.', startScene: 'dyehouse',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A damp dye lot has uneven color, and a small test can prevent a false promise about the whole order.', availability: allYear },
    scenes: {
      dyehouse: n('dyehouse', 'Color under Damp Cloth', 'Dyer Yara Pell has hung a length of blue cloth near the open stove. One edge is dry; the fold is still cool and damp. A buyer arrives early for a coat lining and asks whether the color is finished.', [
        { id: 'testHiddenFold', label: 'Test a hidden fold before giving an answer', next: 'test' },
        { id: 'askAboutDeadline', label: 'Ask whether the buyer can return after the cloth dries', next: 'deadline' },
        { id: 'inspectDryingRack', label: 'Check whether the cloth is drying evenly on the rack', next: 'rack' },
      ]),
      test: n('test', 'A Small Test First', 'A clean swatch from the damp fold leaves color on the white scrap. The dry edge does not. Yara can delay the whole lining or cut only from the tested dry end and explain the limit.', [
        { id: 'delayWholeOrder', label: 'Tell the buyer the full length needs more time', next: 'delayed' },
        { id: 'offerDryLength', label: 'Offer only the dry length and name the color difference', next: 'partial' },
      ]),
      deadline: n('deadline', 'Time against a Promise', 'The buyer needs a lining today but can use a shorter piece for a repaired sleeve. A full coat lining can wait until tomorrow if the color holds after drying.', [
        { id: 'prepareShortPiece', label: 'Offer the shorter tested section for today’s sleeve repair', next: 'partial' },
        { id: 'waitForFullLength', label: 'Keep the full order until the color is dry and checked', next: 'delayed' },
      ]),
      rack: n('rack', 'The Fold Trapped Dampness', 'The inner fold has blocked air from reaching the cloth. Moving it to a wider rack will slow the order but let the whole length dry before another test.', [
        { id: 'moveAndWait', label: 'Spread the cloth on the wider rack and wait', next: 'delayed' },
        { id: 'testOneLength', label: 'Test the dry end and offer only what it supports', next: 'partial', effects: { money: 1, historyFlags: ['dye_worker_sold_only_tested_color'] } },
      ]),
      delayed: e('delayed', 'An Honest Delay', 'Yara tells the buyer the color has not set through the fold and promises no finished lining today. The cloth is spread out to dry before the order is cut.'),
      partial: e('partial', 'Only the Tested Length', 'The buyer takes the shorter dry section for a sleeve repair, sees the color difference, and pays the agreed inspection fee. The rest of the cloth stays on the rack until it can be checked.'),
    },
  },
  {
    id: 'the-moth-at-the-glasshouse', title: 'A Moth at the Glasshouse', subtitle: 'A caretaker finds one moth near a seed tray and must decide whether the evidence justifies disturbing the whole room.', startScene: 'glasshouse',
    diversity: { riskTier: 'LOW', distinctiveHook: 'One insect and one damaged leaf do not establish an infestation; the caretaker must choose a proportionate inspection.', availability: allYear },
    scenes: {
      glasshouse: n('glasshouse', 'One Moth, One Leaf', 'Caretaker Vessa Hurd finds a pale moth resting near a tray of young seedlings. One leaf has a small ragged edge; the rest look sound. She asks whether to close the glasshouse and move every tray before the morning visitors arrive.', [
        { id: 'inspectAffectedTray', label: 'Inspect the damaged leaf and nearby stems first', next: 'tray' },
        { id: 'watchTheMoth', label: 'Watch where the moth settles without touching it', next: 'observe' },
        { id: 'askVessaHistory', label: 'Ask whether this tray has shown damage before', next: 'history' },
      ]),
      tray: n('tray', 'A Small Mark on One Leaf', 'The underside has one fresh notch and no clusters of eggs. The neighboring trays show no matching damage. That supports a local check, not a claim that the whole house is infested.', [
        { id: 'isolateTray', label: 'Set the single tray aside for a closer morning inspection', next: 'isolated', effects: { historyFlags: ['isolated_one_glasshouse_tray_pending_inspection'] } },
        { id: 'keepHouseOpen', label: 'Leave the other trays in place and inspect again at dawn', next: 'morning' },
      ]),
      observe: n('observe', 'A Passing Visitor', 'The moth moves toward the high glass and then settles on a warm frame. It does not return to the seedlings while you watch.', [
        { id: 'openHighVent', label: 'Open the upper vent and let it leave on its own', next: 'vent' },
        { id: 'leaveItTillDawn', label: 'Leave the room undisturbed and check the tray in daylight', next: 'morning' },
      ]),
      history: n('history', 'No Earlier Pattern', 'Vessa has not seen a repeated pattern in this room. A single damaged leaf is new evidence, but she will not treat one insect as proof of a wider problem.', [
        { id: 'checkOnlyTray', label: 'Check the affected tray again in the morning', next: 'morning' },
        { id: 'keepVisitorRouteOpen', label: 'Leave the other plants where they are for visitors', next: 'vent' },
      ]),
      isolated: e('isolated', 'One Tray Set Aside', 'Vessa moves only the affected tray to a separate bench. The rest of the glasshouse remains open, and the morning check can show whether anything more is happening.'),
      morning: e('morning', 'A Daylight Check', 'The moth leaves the seedlings alone while the room stays quiet. Vessa keeps the single leaf as a comparison and postpones any wider move until there is evidence for it.'),
      vent: e('vent', 'The Upper Vent', 'The moth slips out through the upper vent. The damaged tray remains under observation, but no one treats a single visitor as a pest outbreak.'),
    },
  },
  {
    id: 'the-room-for-a-late-reader', title: 'The Room for a Late Reader', subtitle: 'A public reading room is closing when a traveler arrives with a page they cannot finish alone.', startScene: 'readingRoom',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A small reading room must balance its posted closing time with a visitor who needs a quiet place to finish a page.', availability: allYear },
    scenes: {
      readingRoom: n('readingRoom', 'The Last Lamp', 'The public reading room closes at nine. At five minutes before the hour, visitor Nel Arven arrives with a printed notice they cannot read well in the lamplight at home. Caretaker Brin is stacking chairs but has not yet put out the lamp.', [
        { id: 'askWhatPageNeeds', label: 'Ask what part of the notice is hard to read', next: 'need' },
        { id: 'askCaretakerRule', label: 'Ask Brin what the closing rule allows', next: 'rule' },
        { id: 'offerReadAloud', label: 'Offer to read the page aloud before the lamp is put away', next: 'reading' },
      ]),
      need: n('need', 'A Name and a Date', 'Nel can read the large heading but not the fine date beneath it. The notice concerns a meeting tomorrow; no private details are visible on the page.', [
        { id: 'useBetterLight', label: 'Move the page to the clear spot beneath the lamp', next: 'reading' },
        { id: 'copyLargeHeading', label: 'Copy only the large heading for Nel to take home', next: 'copy' },
      ]),
      rule: n('rule', 'A Rule with a Little Room', 'Brin says the room closes at nine, but a reader already inside may finish a page if the hall stays clear. There is no reason to keep the room open all night.', [
        { id: 'finishOnePage', label: 'Ask for a few minutes to finish the notice under the lamp', next: 'reading' },
        { id: 'takeHeadingHome', label: 'Copy the heading and let Brin close on time', next: 'copy' },
      ]),
      reading: n('reading', 'The Date beneath the Heading', 'Under the lamp, the small print says the meeting begins at the second bell, not at noon. Nel repeats the time back to be sure it is understood.', [
        { id: 'leaveBeforeClose', label: 'Fold the notice and leave before the room closes', next: 'finished' },
        { id: 'askBrinToKeepCopy', label: 'Ask Brin to post a larger copy for other readers', next: 'posted' },
      ]),
      copy: e('copy', 'A Heading for Home', 'Nel takes the large heading home and asks a neighbor to help with the date. Brin closes the room on time, and the visitor has more than they arrived with.'),
      finished: e('finished', 'Finished under the Lamp', 'Nel leaves with the meeting time read clearly and repeats it once before the door shuts. Brin puts out the lamp at the posted hour.'),
      posted: e('posted', 'A Larger Notice Tomorrow', 'Brin keeps the public notice and will copy the date in larger letters tomorrow. The room closes at its usual hour, and the next reader will have an easier page.'),
    },
  },
  {
    id: 'the-weather-vane-at-morning', title: 'The Weather Vane at Morning', subtitle: 'A roof vane spins in gusts while a town meeting tries to decide whether the wind has truly shifted.', startScene: 'square',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A high-mounted vane is visibly unreliable in gusts; the traveler must distinguish a short observation from a dependable forecast.', availability: allYear },
    scenes: {
      square: n('square', 'A Vane in the Gusts', 'At the meeting hall, the roof vane swings between east and west when gusts hit. A group plans to move a canvas awning before the afternoon market. No one can tell from the square whether the vane is stuck or simply catching uneven wind. The roof is steep and the ladder is not tied.', [
        { id: 'watchFromStreet', label: 'Watch the vane from the sheltered side of the square', next: 'observation' },
        { id: 'glassTheVane', label: 'Use your Field Glasses to compare the vane between gusts', next: 'observation', requirements: { usableGear: ['fieldGlasses'] }, unavailableText: 'No usable Field Glasses are carried.' },
        { id: 'checkOldReadings', label: 'Ask whether anyone recorded the wind before the gusts', next: 'records' },
        { id: 'declineClimb', label: 'Keep off the untied ladder and wait for calmer air', next: 'wait' },
      ]),
      observation: n('observation', 'A Direction between Gusts', 'Between gusts, the vane settles southwest for several breaths. When the next gust strikes, it whips around again. This supports a temporary direction, not a reliable forecast for the awning.', [
        { id: 'useShortWindow', label: 'Move the awning only while the wind stays in the calmer interval', next: 'interval' },
        { id: 'waitForSteadierWind', label: 'Wait for the vane to settle consistently before moving canvas', next: 'wait' },
      ]),
      records: n('records', 'A Note from Before Dawn', 'The hall keeper wrote “west” at dawn, before the wind strengthened. A single early note does not establish what the gusts are doing now.', [
        { id: 'compareFromStreet', label: 'Compare the vane from the sheltered side without climbing', next: 'observation' },
        { id: 'keepAwningTied', label: 'Keep the awning tied until the gusts ease', next: 'wait' },
      ]),
      interval: n('interval', 'A Short Working Window', 'The wind slackens for half a minute. The crew can lower the awning from the ground during that interval, or wait until a steadier reading is possible.', [
        { id: 'lowerNowWithCrew', label: 'Have the crew lower the awning together during the lull', next: 'lowered', effects: { money: 2 } },
        { id: 'stayTied', label: 'Keep it tied until the next calm period', next: 'wait' },
      ]),
      wait: e('wait', 'No Climb on a Guess', 'The ladder stays unused and the awning stays tied. The group waits for a steadier wind instead of treating a whipping vane as a safe instruction.'),
      lowered: e('lowered', 'Canvas Down before the Gust', 'The crew lowers the awning from the ground during a lull. No one climbs the loose ladder, and the hall keeper pays for the measured help.'),
    },
  },
  {
    id: 'the-page-with-no-owner', title: 'The Page with No Owner', subtitle: 'A printer finds a loose page in a public proof and must not mistake it for permission to publish.', startScene: 'pressroom',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'An unattributed personal page arrives in a public printing room; the traveler must preserve the deadline without publishing private words.', availability: allYear },
    scenes: {
      pressroom: n('pressroom', 'Loose Type, Loose Page', 'Printer Olan Reed finds a handwritten page beneath the proof table. It describes a household argument but carries no name, date, or instruction to publish. A town circular is due at the press in an hour, and the page is not part of its approved copy.', [
        { id: 'compareApprovedCopy', label: 'Compare it with the signed circular proof', next: 'proof' },
        { id: 'askWhoHandledPress', label: 'Ask who used the table since the proof was approved', next: 'hands' },
        { id: 'keepPageCovered', label: 'Cover it and keep it out of the type trays', next: 'covered' },
      ]),
      proof: n('proof', 'No Place in the Circular', 'The signed copy contains none of the handwritten lines. The page is not a correction to the circular and does not belong on the press by default.', [
        { id: 'printSignedCopyOnly', label: 'Print only the signed circular', next: 'printed' },
        { id: 'delayForOwner', label: 'Hold the press briefly while Olan checks who left the page', next: 'hands' },
      ]),
      hands: n('hands', 'A Page Passed through Many Hands', 'Two apprentices moved paper across the room; neither recognizes the handwriting. The page could be a private draft or a scrap, and no one has authority to claim its words.', [
        { id: 'returnToDrawer', label: 'Put it in the found-paper drawer without copying it', next: 'stored' },
        { id: 'askAtCounter', label: 'Ask quietly at the counter whether anyone has lost a page', next: 'counter' },
      ]),
      covered: n('covered', 'Separate from the Type', 'The page stays covered and away from the press. The circular proof remains intact while Olan decides how to handle found paper.', [
        { id: 'printCircular', label: 'Print the approved circular on schedule', next: 'printed' },
        { id: 'seekOwner', label: 'Ask at the counter without reading the private lines aloud', next: 'counter' },
      ]),
      counter: n('counter', 'Someone Asks for a Draft', 'A visitor asks whether a handwritten page was found, then confirms only that it is theirs. They do not ask the printer to publish it.', [
        { id: 'returnPrivately', label: 'Return the page folded and unread', next: 'returned' },
        { id: 'declineToCopy', label: 'Explain that the page was kept off the press and offer it back', next: 'returned' },
      ]),
      printed: e('printed', 'The Approved Words Only', 'The circular goes to press with its signed copy unchanged. The loose page is stored separately and is not treated as public text.'),
      stored: e('stored', 'A Page Not Published', 'Olan places the unattributed page in the found-paper drawer without copying its contents. The press prints only authorized work.'),
      returned: e('returned', 'Back in Its Owner’s Hands', 'The visitor takes the folded page away. No copy was made, and the press keeps its deadline without claiming private writing as public material.'),
    },
  },
  {
    id: 'the-voice-under-the-stairs', title: 'A Voice under the Stair', subtitle: 'A low voice seems to come from beneath a stair landing, but the building’s layout offers more than one explanation.', startScene: 'inn',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'An unexplained sound in an inn prompts a bounded physical inspection before anyone claims a haunting or dismisses a guest’s fear.', availability: allYear, fantasyDensity: 'AMBIGUOUS' },
    scenes: {
      inn: n('inn', 'A Voice through the Boards', 'At a roadside inn, guest Marra says she heard a voice beneath the back stair. The stair is built over a low pantry; the innkeeper has not checked it since supper. No one else has heard words clearly, and the lamp at the landing is lit.', [
        { id: 'listenFromLanding', label: 'Listen from the lit landing before opening anything', next: 'listen' },
        { id: 'askInnkeeperLayout', label: 'Ask the innkeeper what lies beneath the stair', next: 'layout' },
        { id: 'offerGuestAnotherRoom', label: 'Offer Marra the front room while the sound is checked', next: 'room' },
      ]),
      listen: n('listen', 'A Sound without Words', 'A low murmur rises when the kitchen door opens and stops when it closes. The stair boards carry sound from the back passage, but no words can be made out.', [
        { id: 'checkPantrySafely', label: 'Ask the innkeeper to open the pantry from its own door', next: 'pantry' },
        { id: 'leaveItUnresolved', label: 'Keep the landing clear and let Marra choose whether to move rooms', next: 'room' },
      ]),
      layout: n('layout', 'A Pantry under the Landing', 'The innkeeper says the pantry extends beneath the stair and has a door at the rear. Opening a loose landing board would be unnecessary and could damage the stair.', [
        { id: 'usePantryDoor', label: 'Check through the pantry’s proper door', next: 'pantry' },
        { id: 'doNotOpenBoards', label: 'Leave the stair intact and offer another room', next: 'room' },
      ]),
      pantry: n('pantry', 'The Vent beside the Kitchen', 'A small air slot connects the pantry to the kitchen passage. When the kitchen door moves, the slot carries a draft and a muffled voice from the cook’s late conversation.', [
        { id: 'explainSound', label: 'Explain the sound path to Marra and the innkeeper', next: 'explained' },
        { id: 'closeVentAtNight', label: 'Ask the innkeeper to close the pantry vent at night', next: 'closedVent' },
      ]),
      room: e('room', 'A Choice of Rooms', 'Marra can move to the front room without being told that her fear was foolish. The innkeeper will check the pantry in daylight; the source of the sound remains unclaimed tonight.'),
      explained: e('explained', 'A Voice with a Room behind It', 'The kitchen conversation has a physical path to the stair landing. Marra hears what was found and decides whether to return to her room.'),
      closedVent: e('closedVent', 'The Vent Shut for the Night', 'The innkeeper closes the pantry vent until morning. The stair stays intact, and the room no longer carries kitchen voices through the boards.'),
    },
  },
  {
    id: 'the-kettle-for-the-waiting-room', title: 'The Kettle for the Waiting Room', subtitle: 'A crowded waiting room has enough hot water for one pot, while two groups expect it for different reasons.', startScene: 'waitingRoom',
    diversity: { riskTier: 'LOW', distinctiveHook: 'A limited kettle must serve a public waiting room without turning quiet need into an automatic claim over everyone else.', availability: allYear },
    scenes: {
      waitingRoom: n('waitingRoom', 'One Kettle, Two Tables', 'At a coach-house waiting room, keeper Pera has one kettle nearly boiled. A family waiting for a delayed carriage asks for warm water for a child’s drink. A pair of workers at the other table have been promised tea before their night shift. There is time for one full pot before the fire needs more fuel.', [
        { id: 'askFamilyNeed', label: 'Ask the family how much warm water they need now', next: 'family' },
        { id: 'askWorkersPlan', label: 'Ask the workers whether they can wait for a second heating', next: 'workers' },
        { id: 'checkFireFuel', label: 'Check how long the fire can safely keep the kettle hot', next: 'fire' },
      ]),
      family: n('family', 'A Small Cup First', 'The child needs a small warm drink, not the whole kettle. Pera can pour a cup now and leave enough water for the workers’ pot if the fire holds.', [
        { id: 'pourSmallCup', label: 'Pour the child’s cup and keep the rest for the promised tea', next: 'shared' },
        { id: 'offerFamilyFullPot', label: 'Offer the family the whole kettle and explain the delay to the workers', next: 'familyPot' },
      ]),
      workers: n('workers', 'A Shift Can Wait a Little', 'The workers have time to wait ten minutes, but not an hour. They ask Pera to say plainly if the tea will come before they leave.', [
        { id: 'heatSecondPot', label: 'Add fuel and promise a second heating only if the fire stays steady', next: 'secondPot' },
        { id: 'serveCurrentPot', label: 'Serve the current kettle first and avoid promising more', next: 'shared' },
      ]),
      fire: n('fire', 'Fuel for One More Heating', 'There is enough dry fuel for one more kettle, but Pera must tend the fire. It can serve both tables if no one assumes it will stay hot unattended.', [
        { id: 'tendFire', label: 'Help tend the fire for a second heating', next: 'secondPot', effects: { money: 1 } },
        { id: 'keepOnePot', label: 'Serve one pot and let each group decide how to share it', next: 'shared' },
      ]),
      shared: e('shared', 'A Pot without a Promise', 'Pera pours the small cup and serves the remaining water as tea. The workers know there is no second pot promised, and the family can wait with a warm drink.'),
      familyPot: e('familyPot', 'The Family Served First', 'Pera gives the family the kettle and tells the workers the tea will be delayed. They can choose to wait or leave without being told the room had enough for everyone.'),
      secondPot: e('secondPot', 'Two Potfuls, with Someone Tending', 'The fire is watched while a second pot heats. Both tables are served, and the workers leave knowing the promise depended on keeping the fire steady.'),
    },
  },
  {
    id: 'the-lamp-in-the-quiet-room', title: 'The Lamp in the Quiet Room', subtitle: 'A shelter keeper hears a visitor in the dark room but does not know whether anyone is inside.', startScene: 'shelter',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A dark shelter room must be checked without assuming a person’s identity or entering blindly.', availability: allYear },
    scenes: {
      shelter: n('shelter', 'A Sound beyond the Door', 'At a roadside shelter, keeper Anik hears a chair scrape in the unlit back room. The door is ajar and the lantern hangs by the outer post. Anik asks you to check whether someone needs help, but no one has announced themselves.', [
        { id: 'callBeforeEntry', label: 'Call into the room from the doorway', next: 'call' },
        { id: 'takeLanternInside', label: 'Carry the shelter lantern just inside, keeping the doorway clear', next: 'lit' },
        { id: 'askKeeperToStayAtDoor', label: 'Ask Anik to stay at the door while you listen from outside', next: 'listen' },
      ]),
      call: n('call', 'A Voice Answers', 'A tired voice answers from the far bench and asks for the light to remain low. The person says they are all right but cannot see the water cup near the wall.', [
        { id: 'setLampAtDoor', label: 'Set the lantern just inside the door and point out the cup', next: 'lampSet' },
        { id: 'askPermissionToApproach', label: 'Ask before moving closer to the bench', next: 'permission' },
      ]),
      lit: n('lit', 'Light on the Empty Floor', 'The lantern shows a traveler seated on the far bench, with their bag beneath their knees. They look up but have not asked for help or given a name.', [
        { id: 'setLampDown', label: 'Set the lantern on the clear table and step back', next: 'lampSet' },
        { id: 'askWhatTheyNeed', label: 'Ask whether they need the water cup or a quieter room', next: 'permission' },
      ]),
      listen: n('listen', 'The Chair Settles', 'The scrape does not repeat. The room may be occupied or the chair may have shifted; entering without light would not clarify it safely.', [
        { id: 'callAgain', label: 'Call once more and wait at the threshold', next: 'call' },
        { id: 'leaveDoorClear', label: 'Leave the lantern at the door and let the keeper check later', next: 'lampSet' },
      ]),
      permission: n('permission', 'Help Asked, Help Bounded', 'The traveler asks only for the water cup to be moved within reach. The bench and bag remain where they are; no one needs to search the room.', [
        { id: 'moveCupWithConsent', label: 'Move the cup to the table and step back', next: 'quiet' },
        { id: 'offerKeeperHelp', label: 'Ask Anik to bring the cup while you keep the doorway lit', next: 'quiet' },
      ]),
      lampSet: e('lampSet', 'The Doorway Stays Clear', 'The lantern remains on the table near the entrance. The seated traveler can ask for help if needed, and no one has entered farther than the light and answer required.'),
      quiet: e('quiet', 'A Cup within Reach', 'The water is moved to the table with permission. The traveler stays seated, and the shelter keeper knows the room is occupied without claiming to know more about its guest.'),
    },
  },
  {
    id: 'the-route-through-the-old-yard', title: 'The Route through the Old Yard', subtitle: 'A worn shortcut crosses a closed yard; a new public sign would make the route look more certain than it is.', startScene: 'lane',
    diversity: { riskTier: 'MODERATE', distinctiveHook: 'A heavily used shortcut crosses a yard whose gate is sometimes closed, forcing a choice between convenience and an honest public route.', availability: allYear },
    scenes: {
      lane: n('lane', 'A Worn Track beside the Road', 'A foot track leaves the public lane, crosses an old yard, and rejoins the road near the school. The tracks are deep, but the yard keeper says the gate is closed when carts are unloaded. A sign painter asks whether to add the shortcut to a public wayfinding board.', [
        { id: 'walkTrack', label: 'Walk the public lane and note where the track rejoins', next: 'rejoin' },
        { id: 'askKeeperHours', label: 'Ask the yard keeper when the gate is usually closed', next: 'hours' },
        { id: 'askPainterPurpose', label: 'Ask what travelers need the sign to tell them', next: 'purpose' },
      ]),
      rejoin: n('rejoin', 'A Shortcut with One Gate', 'The track saves several minutes but depends on the yard gate. The public lane is longer and remains open after unloading.', [
        { id: 'markConditionalRoute', label: 'Show the shortcut only with a “gate may close” note', next: 'conditional' },
        { id: 'showPublicLane', label: 'Show the public lane as the dependable route', next: 'public' },
      ]),
      hours: n('hours', 'A Gate with Working Hours', 'The keeper closes the gate while carts are being loaded, then opens it again. The hours shift with deliveries, so the shortcut cannot be promised at a fixed time.', [
        { id: 'noteVariableHours', label: 'Label the shortcut “ask at the yard”', next: 'conditional' },
        { id: 'avoidPrivateGate', label: 'Keep the public sign on the road route', next: 'public' },
      ]),
      purpose: n('purpose', 'A Sign for Someone New', 'The board should help a traveler who does not know the yard or its keeper. A shortcut that depends on local permission may be useful, but it cannot replace the public lane.', [
        { id: 'twoRoutes', label: 'Show both paths and distinguish public from conditional access', next: 'conditional' },
        { id: 'oneRoute', label: 'Show only the public road and leave the shortcut off', next: 'public' },
      ]),
      conditional: n('conditional', 'A Useful Shortcut, Properly Qualified', 'The painter can add the track as a conditional path and mark the gate as private. Travelers will need to ask the keeper when the yard is open.', [
        { id: 'paintBoth', label: 'Paint both routes with the gate condition in plain words', next: 'twoPaths', effects: { money: 2 } },
        { id: 'leaveBoardSimple', label: 'Keep the board simple and explain the shortcut in person', next: 'public' },
      ]),
      twoPaths: e('twoPaths', 'A Board with Two Honest Routes', 'The public lane is solid; the shortcut is dotted and marked conditional on the yard gate. The sign helps newcomers without turning worn tracks into public permission.'),
      public: e('public', 'The Road That Stays Open', 'The sign shows the dependable public lane. The shortcut remains known locally, but the board does not promise access through a private yard.'),
    },
  },
  {
    id: 'the-last-board-at-the-exhibit', title: 'The Last Board at the Exhibit', subtitle: 'A local exhibit has room for one more board, and a keeper must choose what evidence visitors can use without overclaiming.', startScene: 'exhibit',
    diversity: { riskTier: 'LOW', distinctiveHook: 'An exhibit about a vanished building must distinguish a measured footprint from a remembered story before its last display space is used.', availability: allYear },
    scenes: {
      exhibit: n('exhibit', 'One Board Left', 'Keeper Hessa Noll is preparing a small exhibit about the old ferry office, long since demolished. The room has space for one board. A measured foundation sketch survives; two residents remember different places where the desk stood. Hessa asks what the last board should show.', [
        { id: 'reviewSketch', label: 'Review which edges the foundation sketch actually measures', next: 'sketch' },
        { id: 'hearResidents', label: 'Ask each resident what they remember about the room', next: 'memories' },
        { id: 'lookAtRoom', label: 'Inspect the display wall and decide how much can fit', next: 'space' },
      ]),
      sketch: n('sketch', 'A Footprint, Not a Floor Plan', 'The sketch gives the outside foundation dimensions and one doorway. It cannot show the desk or shelves inside the vanished office.', [
        { id: 'drawMeasuredOutline', label: 'Use the board for the measured outline and label its limits', next: 'measured' },
        { id: 'pairWithMemory', label: 'Add both desk memories as attributed notes', next: 'memoryBoard' },
      ]),
      memories: n('memories', 'Two Interior Memories', 'One resident remembers the desk beside the window; another remembers it turned toward the door. Their accounts may describe different days or different desks.', [
        { id: 'displayBoth', label: 'Show both memories side by side without choosing', next: 'memoryBoard' },
        { id: 'separateFromMeasurement', label: 'Keep the memories off the measured foundation sketch', next: 'measured' },
      ]),
      space: n('space', 'A Board that Can Be Read', 'A single panel can hold the outline with a short note, or a large drawing with two compact recollections. It cannot make conflicting memories into a verified room plan.', [
        { id: 'chooseOutline', label: 'Give the measured footprint the whole board', next: 'measured' },
        { id: 'chooseAccounts', label: 'Use the board for two clearly attributed recollections', next: 'memoryBoard' },
      ]),
      measured: e('measured', 'The Part the Ground Can Prove', 'The board shows the measured foundation and names the doorway. Hessa labels the interior arrangement unknown rather than letting a clean drawing imply evidence that was never found.'),
      memoryBoard: e('memoryBoard', 'Two Memories, Not a Plan', 'The board places the two residents’ recollections side by side and labels both as memory. Hessa keeps the foundation sketch nearby as separate evidence.'),
    },
  },
];
