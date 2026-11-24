import type { Board, Card, CardDraft, CardPatch, Filters } from "./types"
import type { BoardStats, ColumnModel } from "./view"

export const TRACE_LIMIT = 5
export const SELECTION_LOG_LIMIT = 6

export function prependLimited(lines: readonly string[], line: string, limit: number) {
  return [line, ...lines].slice(0, limit)
}

export function matches(card: Card, filters: Filters) {
  const query = filters.query.trim().toLowerCase()
  if (query && !card.title.toLowerCase().includes(query)) return false
  if (filters.assignee !== "all" && card.assignee !== filters.assignee) return false
  if (filters.label !== "all" && card.label !== filters.label) return false
  return true
}

export function deriveBoard(
  board: Board,
  filters: Filters,
  collapsed: Record<string, boolean>,
  selectedId: string | null,
  draggingId: string | null,
): { columns: ColumnModel[]; stats: BoardStats } {
  const cards = board.cards.filter((card) => matches(card, filters))
  const columns = [...board.columns]
    .sort((a, b) => a.order - b.order)
    .map((column) => {
      const columnCards = cards.filter((card) => card.columnId === column.id)
      return {
        id: column.id,
        title: column.title,
        wipLimit: column.wipLimit,
        count: columnCards.length,
        overLimit: column.wipLimit > 0 && columnCards.length > column.wipLimit,
        collapsed: Boolean(collapsed[column.id]),
        cards: columnCards.map((card) => ({
          id: card.id,
          title: card.title,
          href: `/cards/${card.id}`,
          assignee: card.assignee,
          label: card.label,
          points: card.points,
          selected: card.id === selectedId,
          dragging: card.id === draggingId,
        })),
      }
    })
  return {
    columns,
    stats: {
      visible: cards.length,
      points: cards.reduce((sum, card) => sum + card.points, 0),
      overLimit: columns.filter((column) => column.overLimit).map((column) => column.title),
    },
  }
}

export function moveCardLocal(board: Board, cardId: string, toColumnId: string): Board {
  return {
    ...board,
    cards: board.cards.map((card) => (card.id === cardId ? { ...card, columnId: toColumnId } : card)),
  }
}

export function replaceCard(board: Board, cardId: string, patch: CardPatch): Board {
  return {
    ...board,
    cards: board.cards.map((card) =>
      card.id === cardId ? { ...card, title: patch.title, checklist: patch.checklist } : card,
    ),
  }
}

export function optimisticCard(draft: CardDraft): Card {
  return {
    id: `local-${crypto.randomUUID()}`,
    columnId: draft.columnId,
    title: draft.title.trim(),
    details: "Waiting for the server.",
    assignee: "alex",
    label: "chore",
    points: 1,
    order: 999,
    checklist: [],
  }
}
