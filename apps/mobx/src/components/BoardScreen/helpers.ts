export function exportedCount(cards: unknown) {
  if (cards instanceof Map) return cards.size
  return Object.keys(cards as object).length
}
