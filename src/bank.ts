export const BANK_CAPACITY = 5;

export function bankCapacityLabel(itemCount: number): string {
  return `${itemCount}/${BANK_CAPACITY}`;
}

export function bankCapacityMessage(itemCount: number): string | null {
  if (itemCount > BANK_CAPACITY) {
    return `Your saved Bank has ${itemCount} items, above the ${BANK_CAPACITY}-item limit. Existing items are preserved, but deposits stop until space is made.`;
  }
  if (itemCount === BANK_CAPACITY) {
    return `Your Bank is full. You can store up to ${BANK_CAPACITY} items. Gear swaps need an open Gear slot; Relics are separate from Gear capacity.`;
  }
  return null;
}

export function emptyBankConfirmationText(itemCount: number): string | null {
  if (itemCount <= 0) return null;
  const contents = itemCount === 1 ? '1 stored item' : `all ${itemCount} stored items`;
  return `This will permanently destroy ${contents}. This cannot be undone.`;
}
