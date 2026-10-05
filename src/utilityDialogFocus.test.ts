import { describe, expect, it, vi } from 'vitest';
import { blurUtilityDialogControl } from './utilityDialogFocus';

describe('utility dialog focus cleanup', () => {
  it('blurs an active text field that belongs to the dialog', () => {
    const blur = vi.fn();
    const control = { matches: vi.fn((selector: string) => selector === 'input, textarea, select'), blur };
    const dialog = { contains: vi.fn(() => true) };

    blurUtilityDialogControl(dialog, control);

    expect(dialog.contains).toHaveBeenCalledWith(control);
    expect(control.matches).toHaveBeenCalledWith('input, textarea, select');
    expect(blur).toHaveBeenCalledOnce();
  });

  it('does not blur a control outside the dialog or a non-text control', () => {
    const outsideControl = { matches: vi.fn(() => true), blur: vi.fn() };
    blurUtilityDialogControl({ contains: () => false }, outsideControl);
    expect(outsideControl.blur).not.toHaveBeenCalled();

    const button = { matches: vi.fn(() => false), blur: vi.fn() };
    blurUtilityDialogControl({ contains: () => true }, button);
    expect(button.blur).not.toHaveBeenCalled();
  });

  it('safely accepts a missing active control', () => {
    expect(() => blurUtilityDialogControl({ contains: () => false }, null)).not.toThrow();
  });
});
