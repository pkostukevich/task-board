import type { CardDraft } from "../../types"
import type { ColumnModel, Point } from "../../view"

export type ColumnActions = {
  onSelect: (cardId: string) => void
  onOpen: (cardId: string) => void
  onToggleColumn: (columnId: string) => void
  onMove: (cardId: string, toColumnId: string) => void
  onDragStart: (cardId: string, point: Point) => void
  onDragEnd: () => void
  onOpenDraft: (columnId: string) => void
  onDraftTitle: (title: string) => void
  onSubmitDraft: () => void
  onCancelDraft: () => void
}

export type ColumnViewProps = ColumnActions & {
  column: ColumnModel
  draft: CardDraft | null
  pending: boolean
}

export type ColumnViewBindings = Omit<ColumnViewProps, "column">
