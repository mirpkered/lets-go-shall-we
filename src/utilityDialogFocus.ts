interface DialogFocusBoundary {
  contains(node: unknown): boolean;
}

interface BlurCapableControl {
  matches(selector: string): boolean;
  blur(): void;
}

/** Release an active text field before a native utility dialog is dismissed. */
export function blurUtilityDialogControl(dialog: DialogFocusBoundary, activeControl: BlurCapableControl | null): void {
  if (activeControl && dialog.contains(activeControl) && activeControl.matches('input, textarea, select')) {
    activeControl.blur();
  }
}
