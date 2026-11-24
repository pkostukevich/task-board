import type { ColumnViewBindings, Point } from "@board/kit"

export type JotaiBoardProps = {
  error: string | null
  bindings: ColumnViewBindings
  onDragMove: (point: Point) => void
  onDragEnd: () => void
  onDismissError: () => void
}
