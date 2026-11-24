import { columnSame, draftKey } from "../../helpers/equality"
import type { ColumnViewProps } from "./types"

export function countLabel(count: number, wipLimit: number) {
  if (wipLimit <= 0) return `${count}`
  return `${count} / ${wipLimit}`
}

export function sameColumnView(prev: ColumnViewProps, next: ColumnViewProps) {
  const prevDraft = draftKey(prev.draft, prev.column.id)
  const nextDraft = draftKey(next.draft, next.column.id)
  if (prevDraft !== nextDraft) return false
  if (prevDraft !== null && prev.pending !== next.pending) return false
  return columnSame(prev.column, next.column)
}
