import type { Card, CardBuffer, CardDraft, Filters, Point } from "@board/kit"
import type { Store } from "@tanstack/react-store"

export type DragPoint = {
  cardId: string
  x: number
  y: number
}

export type UiState = {
  selectedCardId: string | null
  collapsed: Record<string, boolean>
  draft: CardDraft | null
  drag: DragPoint | null
  clientMoves: number
  hydrateReplays: number
  failNext: boolean
  filters: Filters
  filtersReady: boolean
  error: string | null
  pending: boolean
  buffers: Record<string, CardBuffer>
  selectionLog: string[]
  trace: string[]
}

export type UiActions = {
  select: (cardId: string | null) => void
  toggleColumn: (columnId: string) => void
  openDraft: (columnId: string) => void
  setDraftTitle: (title: string) => void
  cancelDraft: () => void
  startDrag: (cardId: string, point: Point) => void
  moveDrag: (point: Point) => void
  endDrag: () => void
  setFailNext: (value: boolean) => void
  setFilters: (filters: Filters) => void
  setError: (message: string | null) => void
  setPending: (value: boolean) => void
  bumpMoves: (delta: number) => void
  replay: () => void
  pushTrace: (line: string) => void
  ensureBuffer: (card: Card) => void
  setBufferTitle: (cardId: string, title: string) => void
  toggleCheck: (cardId: string, checkId: string) => void
  replaceBuffer: (cardId: string, buffer: CardBuffer) => void
}

export type DraftDirtyStore = {
  state: boolean
  get: () => boolean
  subscribe: (listener: (value: boolean) => void) => { unsubscribe: () => void }
}

export type Stores = {
  ui: Store<UiState, UiActions>
  log: Store<string[]>
  draftDirty: DraftDirtyStore
}
