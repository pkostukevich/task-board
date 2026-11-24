import type { Activity, ActivityPage, Board, Card, CardBuffer, CardDraft, Filters, Point } from "@board/kit"
import type { Draft } from "immer"
import type { StoreApi } from "zustand/vanilla"
import type { DragStore } from "./drag"

export type DragPoint = {
  cardId: string
  x: number
  y: number
}

export type BoardState = {
  board: Board
  activityItems: Activity[]
  activityCursor: number | null
  activityLoading: boolean
  activityError: string | null
  clientMoves: number
  hydrateReplays: number
  error: string | null
  pending: boolean
  selectedCardId: string | null
  collapsed: Record<string, boolean>
  draft: CardDraft | null
  buffers: Record<string, CardBuffer>
  selectionLog: string[]
  detail: Card | null
  detailStatus: string
  failNext: boolean
  filters: Filters
  filtersReady: boolean
  trace: string[]
}

export type BoardActions = {
  replay: () => void
  dismissError: () => void
  select: (cardId: string | null) => void
  noteSelection: (cardId: string | null) => void
  toggleColumn: (columnId: string) => void
  openDraft: (columnId: string) => void
  setDraftTitle: (title: string) => void
  cancelDraft: () => void
  startDrag: (cardId: string, point: Point) => void
  moveDrag: (point: Point) => void
  endDrag: () => void
  setFailNext: (value: boolean) => void
  setFilters: (filters: Filters) => void
  markFiltersReady: () => void
  moveCard: (cardId: string, toColumnId: string) => Promise<void>
  createCard: () => Promise<void>
  saveBuffer: (cardId: string) => Promise<void>
  loadMore: () => Promise<void>
  ensureBuffer: (card: Card) => void
  setBufferTitle: (cardId: string, title: string) => void
  toggleCheck: (cardId: string, checkId: string) => void
  reloadDetail: (cardId: string) => Promise<void>
}

export type BoardStore = BoardState & BoardActions

export type SetState = (recipe: (state: Draft<BoardStore>) => void) => void

export type GetState = () => BoardStore

export type BoardStoreApi = Omit<StoreApi<BoardStore>, "subscribe"> & {
  persist: {
    rehydrate: () => Promise<void> | void
  }
  subscribe: {
    (listener: (state: BoardStore, previous: BoardStore) => void): () => void
    <Slice>(selector: (state: BoardStore) => Slice, listener: (slice: Slice, previous: Slice) => void): () => void
  }
  drag: DragStore
}
