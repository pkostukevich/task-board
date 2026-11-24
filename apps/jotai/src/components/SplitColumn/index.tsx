"use client"

import { ColumnView } from "@board/kit"
import { useAtomValue } from "jotai"
import { visibleAtom } from "@/state/atoms"
import type { SplitColumnProps } from "./types"

export function SplitColumn({ columnAtom, bindings }: SplitColumnProps) {
  const {
    draft,
    pending,
    onSelect,
    onOpen,
    onToggleColumn,
    onMove,
    onDragStart,
    onDragEnd,
    onOpenDraft,
    onDraftTitle,
    onSubmitDraft,
    onCancelDraft,
  } = bindings
  const column = useAtomValue(columnAtom)
  const visible = useAtomValue(visibleAtom)
  const model = visible?.columns.find((item) => item.id === column.id)
  if (!model) return null
  const { title, wipLimit } = column

  return (
    <ColumnView
      {...{
        draft,
        pending,
        onSelect,
        onOpen,
        onToggleColumn,
        onMove,
        onDragStart,
        onDragEnd,
        onOpenDraft,
        onDraftTitle,
        onSubmitDraft,
        onCancelDraft,
      }}
      column={{ ...model, title, wipLimit }}
    />
  )
}
