"use client"

import { useEffect, useRef } from "react"
import { useBoardStoreApi } from "@/state/provider"
import type { DragPoint } from "@/state/types"
import { hideGhost, showGhost } from "./helpers"

export function DragGhost() {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const store = useBoardStoreApi()

  useEffect(() => {
    let pointer = 0

    function handleDrag(drag: DragPoint | null) {
      const root = rootRef.current
      if (!root) return
      if (!drag) {
        hideGhost(root)
        return
      }
      pointer += 1
      const { cardId, x, y } = drag
      const card = store.getState().board.cards.find((item) => item.id === cardId)
      showGhost(
        { root, title: titleRef.current, count: countRef.current },
        card?.title ?? cardId,
        x,
        y,
        pointer,
      )
    }

    return store.drag.subscribe((state) => {
      handleDrag(state.drag)
    })
  }, [store])

  return (
    <div ref={rootRef} className="drag-ghost">
      <span ref={titleRef} />
      <span ref={countRef} className="renders" />
    </div>
  )
}
