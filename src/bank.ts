export const BANK_CAPACITY = 5;

export function bankCapacityLabel(itemCount: number): string {
  return `${itemCount}/${BANK_CAPACITY}`;
}

export function bankCapacityMessage(itemCount: number): string | null {
  if (itemCount > BANK_CAPACITY) {
    return `Your saved bank has ${itemCount} items, above the current ${BANK_CAPACITY}-item limit. Existing items are preserved. Withdraw items until the bank is at or below capacity before making another deposit.`;
  }
  if (itemCount === BANK_CAPACITY) {
    return `Your bank is full. You can store up to ${BANK_CAPACITY} items. You may swap your carried item with a banked item; the selected banked item will return to your carry slot.`;
  }
  return null;
}
