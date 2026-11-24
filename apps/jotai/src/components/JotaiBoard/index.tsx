"use client"

import { ErrorBanner } from "@board/kit"
import type { DragEvent } from "react"
import { SplitColumns } from "@/components/SplitColumns"
import type { JotaiBoardProps } from "./types"

export function JotaiBoard({ error, bindings, onDragMove, onDragEnd, onDismissError }: JotaiBoardProps) {
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const { clientX, clientY } = event
    onDragMove({ x: clientX, y: clientY })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    onDragEnd()
  }

  return (
    <div className="board-wrap" onDragOver={handleDragOver} onDrop={handleDrop}>
      {error ? <ErrorBanner message={error} onDismiss={onDismissError} /> : null}
      <div className="board">
        <SplitColumns {...{ bindings }} />
      </div>
    </div>
  )
}
