import type { CardDraft } from "../types"
import type { CardModel, ColumnModel } from "../view"

export function cardSame(prev: CardModel, next: CardModel) {
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.href === next.href &&
    prev.assignee === next.assignee &&
    prev.label === next.label &&
    prev.points === next.points &&
    prev.selected === next.selected &&
    prev.dragging === next.dragging
  )
}

export function columnSame(prev: ColumnModel, next: ColumnModel) {
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.wipLimit === next.wipLimit &&
    prev.count === next.count &&
    prev.overLimit === next.overLimit &&
    prev.collapsed === next.collapsed &&
    prev.cards.length === next.cards.length &&
    prev.cards.every((card, index) => cardSame(card, next.cards[index]))
  )
}

export function draftKey(draft: CardDraft | null, columnId: string) {
  if (!draft || draft.columnId !== columnId) return null
  return draft.title
}
