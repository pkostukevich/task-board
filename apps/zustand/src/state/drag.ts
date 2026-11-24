"use client"

import type { Point } from "@board/kit"
import { createStore } from "zustand/vanilla"
import type { DragPoint } from "./types"

type DragState = {
  drag: DragPoint | null
  start: (cardId: string, point: Point) => void
  move: (point: Point) => void
  end: () => void
}

export type DragStore = ReturnType<typeof createDragStore>

export function createDragStore() {
  return createStore<DragState>()((set) => ({
    drag: null,
    start: (cardId, point) => set({ drag: { cardId, x: point.x, y: point.y } }),
    move: (point) =>
      set((state) => (state.drag ? { drag: { ...state.drag, x: point.x, y: point.y } } : state)),
    end: () => set({ drag: null }),
  }))
}
