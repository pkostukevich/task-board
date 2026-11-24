import type { DragEvent } from "react"
import { dragPoint, preventDragDefault } from "../../helpers/events"
import { ColumnView } from "../ColumnView"
import { ErrorBanner } from "../ErrorBanner"
import type { BoardViewProps } from "./types"

export function BoardView({
  columns,
  draft,
  error,
  pending,
  dragGhost,
  onSelect,
  onOpen,
  onToggleColumn,
  onMove,
  onDragStart,
  onDragMove,
  onDragEnd,
  onOpenDraft,
  onDraftTitle,
  onSubmitDraft,
  onCancelDraft,
  onDismissError,
}: BoardViewProps) {
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    preventDragDefault(event)
    onDragMove(dragPoint(event))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    preventDragDefault(event)
    onDragEnd()
  }

  return (
    <div className="board-wrap" onDragOver={handleDragOver} onDrop={handleDrop}>
      {error ? <ErrorBanner message={error} onDismiss={onDismissError} /> : null}
      <div className="board">
        {columns.map((column) => (
          <ColumnView
            key={column.id}
            {...{
              column,
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
          />
        ))}
      </div>
      {dragGhost}
    </div>
  )
}
