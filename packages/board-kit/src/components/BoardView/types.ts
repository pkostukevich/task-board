import type { ReactNode } from "react"
import type { CardDraft } from "../../types"
import type { ColumnModel, Point } from "../../view"
import type { ColumnActions } from "../ColumnView/types"

export type BoardViewProps = ColumnActions & {
  columns: ColumnModel[]
  draft: CardDraft | null
  error: string | null
  pending: boolean
  dragGhost?: ReactNode
  onDragMove: (point: Point) => void
  onDismissError: () => void
}
