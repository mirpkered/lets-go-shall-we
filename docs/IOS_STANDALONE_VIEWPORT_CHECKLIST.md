# iPhone Home Screen viewport check

Use this checklist on a real iPhone after a build containing mobile viewport or dialog changes. Browser emulation cannot confirm iOS standalone keyboard and visual-viewport behavior.

1. Install/open the game from its Home Screen icon (standalone mode) and confirm the initial page fits the display at its normal scale.
2. Start or continue an adventure, note the current scene, and open Contact & Feedback.
3. Focus the message box, type several lines, then focus the optional reply-address field.
4. Dismiss the keyboard, close Feedback, and confirm the story title, HUD, and choices are fully visible with no horizontal clipping or persistent magnification.
5. Reopen Feedback, focus the message box, dismiss the keyboard, then close without submitting; confirm the same layout and scene remain.
6. Focus the reply field and close the dialog; confirm the keyboard and dialog both dismiss cleanly.
7. If practical, rotate to landscape with the keyboard open, return to portrait, dismiss the keyboard, and close the dialog. Confirm the portrait layout returns to normal.
8. Repeat the open/type/close cycle without force-quitting the Home Screen app.
9. If submission is tested, verify an unsuccessful send retains the draft; dismiss and reopen the dialog and confirm the draft is still present.
10. Confirm the active scene, background, health, money, Gear, Supplies, choices, and pending reward state have not changed.

Do not use a forced reload or disable pinch zoom as a workaround. Record the iOS version, device model, orientation sequence, and exact input/modal steps if magnification persists.
