"use client"

import type { ActivityPage, Board, Card, Filters } from "@board/kit"
import {
  boardApi,
  defaultFilters,
  errorMessage,
  isFilters,
  moveCardLocal,
  optimisticCard,
  prependLimited,
  replaceCard,
  SELECTION_LOG_LIMIT,
  TRACE_LIMIT,
} from "@board/kit"
import { createStore } from "zustand/vanilla"
import { devtools, persist, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { createDragStore, type DragStore } from "./drag"
import type { BoardStore, BoardStoreApi, GetState, SetState } from "./types"

type PersistedBoard = {
  filters: Filters
}

export type { BoardActions, BoardState, BoardStore, BoardStoreApi, DragPoint, GetState, SetState } from "./types"

const FILTER_KEY = "board-filters-zustand"

export function createBoardStore(board: Board, activity: ActivityPage): BoardStoreApi {
  const drag = createDragStore()
  const store = createStore<BoardStore>()(
    devtools(
      persist(
        subscribeWithSelector(
          immer((set, get) => ({
            ...createBoardSlice(board, activity, set, get, drag),
            ...createUiSlice(set, get, drag),
            ...createFilterSlice(set),
          })),
        ),
        {
          name: FILTER_KEY,
          skipHydration: true,
          partialize: (state): PersistedBoard => ({ filters: state.filters }),
          merge: (persisted, current) => ({ ...current, filters: persistedFilters(persisted) ?? current.filters }),
        },
      ),
      { name: "BoardStore" },
    ),
  )
  return Object.assign(store, { drag })
}

function persistedFilters(value: unknown): Filters | undefined {
  if (!value || typeof value !== "object" || !("filters" in value)) return undefined
  const filters = Reflect.get(value, "filters")
  return isFilters(filters) ? filters : undefined
}

function createBoardSlice(board: Board, activity: ActivityPage, set: SetState, get: GetState, drag: DragStore) {
  return {
    board,
    activityItems: activity.items,
    activityCursor: activity.nextCursor,
    activityLoading: false,
    activityError: null,
    clientMoves: 0,
    hydrateReplays: 0,
    error: null,
    pending: false,
    trace: [] as string[],
    replay: () =>
      set((state) => {
        state.hydrateReplays += 1
      }),
    dismissError: () =>
      set((state) => {
        state.error = null
      }),
    moveCard: async (cardId: string, toColumnId: string) => {
      const current = get()
      if (current.pending) return
      const fail = current.failNext
      const previous = current.board
      set((state) => {
        state.board = moveCardLocal(state.board, cardId, toColumnId)
        state.trace = prependLimited(state.trace, "board slice wrote an optimistic move", TRACE_LIMIT)
        state.clientMoves += 1
        state.pending = true
        state.error = null
        state.failNext = false
      })
      try {
        const next = await boardApi.moveCard(cardId, toColumnId, fail)
        const page = await boardApi.getActivity(0)
        set((state) => {
          state.board = next
          state.trace = prependLimited(state.trace, "board slice stored the server board", TRACE_LIMIT)
          state.activityItems = page.items
          state.activityCursor = page.nextCursor
          state.pending = false
        })
        drag.getState().end()
      } catch (error) {
        set((state) => {
          state.board = previous
          state.trace = prependLimited(state.trace, "board slice restored the previous board", TRACE_LIMIT)
          state.clientMoves = Math.max(0, state.clientMoves - 1)
          state.error = errorMessage(error)
          state.pending = false
        })
        drag.getState().end()
      }
    },
    createCard: async () => {
      const current = get()
      if (!current.draft || current.draft.title.trim().length === 0 || current.pending) return
      const draft = current.draft
      const fail = current.failNext
      const optimistic = optimisticCard(draft)
      set((state) => {
        state.board = { ...state.board, cards: [...state.board.cards, optimistic] }
        state.trace = prependLimited(state.trace, "board slice inserted an optimistic card", TRACE_LIMIT)
        state.pending = true
        state.error = null
        state.failNext = false
      })
      try {
        const created = await boardApi.createCard(draft.columnId, draft.title, fail)
        const page = await boardApi.getActivity(0)
        set((state) => {
          state.board = {
            ...state.board,
            cards: state.board.cards.map((card) => (card.id === optimistic.id ? created : card)),
          }
          state.draft = null
          state.trace = prependLimited(state.trace, "board slice swapped in the server card", TRACE_LIMIT)
          state.activityItems = page.items
          state.activityCursor = page.nextCursor
          state.pending = false
        })
      } catch (error) {
        set((state) => {
          state.board = {
            ...state.board,
            cards: state.board.cards.filter((card) => card.id !== optimistic.id),
          }
          state.trace = prependLimited(state.trace, "board slice removed the optimistic card", TRACE_LIMIT)
          state.error = errorMessage(error)
          state.pending = false
        })
      }
    },
    saveBuffer: async (cardId: string) => {
      const current = get()
      const buffer = current.buffers[cardId]
      if (!buffer || current.pending) return
      const fail = current.failNext
      const previous = current.board
      set((state) => {
        state.board = replaceCard(state.board, cardId, buffer)
        state.pending = true
        state.error = null
        state.failNext = false
      })
      try {
        const saved = await boardApi.updateCard(cardId, buffer, fail)
        const page = await boardApi.getActivity(0)
        set((state) => {
          state.board = replaceCard(state.board, cardId, saved)
          state.activityItems = page.items
          state.activityCursor = page.nextCursor
          state.pending = false
        })
      } catch (error) {
        set((state) => {
          state.board = previous
          state.error = errorMessage(error)
          state.pending = false
        })
      }
    },
    loadMore: async () => {
      const current = get()
      if (current.activityCursor === null || current.activityLoading) return
      set((state) => {
        state.activityLoading = true
        state.activityError = null
      })
      try {
        const page = await boardApi.getActivity(current.activityCursor)
        set((state) => {
          state.activityItems.push(...page.items)
          state.activityCursor = page.nextCursor
          state.activityLoading = false
        })
      } catch (error) {
        set((state) => {
          state.activityError = errorMessage(error)
          state.activityLoading = false
        })
      }
    },
    reloadDetail: async (cardId: string) => {
      set((state) => {
        state.detailStatus = "loading"
      })
      try {
        const card = await boardApi.getCard(cardId)
        set((state) => {
          state.detail = card
          state.detailStatus = `loaded ${card.title}`
        })
      } catch (error) {
        set((state) => {
          state.detailStatus = errorMessage(error)
        })
      }
    },
  }
}

function createUiSlice(set: SetState, get: GetState, drag: DragStore) {
  return {
    selectedCardId: null,
    collapsed: {},
    draft: null,
    drag: null,
    buffers: {},
    selectionLog: [] as string[],
    detail: null,
    detailStatus: "Detail stays empty until reload.",
    failNext: false,
    select: (cardId: string | null) => {
      set((state) => {
        state.selectedCardId = cardId
      })
      get().noteSelection(cardId)
    },
    noteSelection: (cardId: string | null) => {
      const state = get()
      const title = cardId
        ? (state.board.cards.find((card) => card.id === cardId)?.title ?? "Missing card")
        : "Nothing selected"
      if (state.selectionLog[0] === title) return
      set((draft) => {
        draft.selectionLog = prependLimited(draft.selectionLog, title, SELECTION_LOG_LIMIT)
      })
    },
    toggleColumn: (columnId: string) =>
      set((state) => {
        state.collapsed[columnId] = !state.collapsed[columnId]
      }),
    openDraft: (columnId: string) =>
      set((state) => {
        state.draft = { columnId, title: "" }
        state.collapsed[columnId] = false
      }),
    setDraftTitle: (title: string) =>
      set((state) => {
        if (state.draft) state.draft.title = title
      }),
    cancelDraft: () =>
      set((state) => {
        state.draft = null
      }),
    startDrag: (cardId: string, point: { x: number; y: number }) => {
      drag.getState().start(cardId, point)
    },
    moveDrag: (point: { x: number; y: number }) => {
      drag.getState().move(point)
    },
    endDrag: () => {
      drag.getState().end()
    },
    setFailNext: (value: boolean) =>
      set((state) => {
        state.failNext = value
      }),
    ensureBuffer: (card: Card) =>
      set((state) => {
        if (state.buffers[card.id]) return
        state.buffers[card.id] = {
          title: card.title,
          checklist: card.checklist.map((item) => ({ ...item })),
        }
      }),
    setBufferTitle: (cardId: string, title: string) =>
      set((state) => {
        const buffer = state.buffers[cardId]
        if (buffer) buffer.title = title
      }),
    toggleCheck: (cardId: string, checkId: string) =>
      set((state) => {
        const buffer = state.buffers[cardId]
        if (!buffer) return
        const item = buffer.checklist.find((entry) => entry.id === checkId)
        if (item) item.done = !item.done
      }),
  }
}

function createFilterSlice(set: SetState) {
  return {
    filters: { ...defaultFilters },
    filtersReady: false,
    setFilters: (filters: Filters) =>
      set((state) => {
        state.filters = filters
      }),
    markFiltersReady: () =>
      set((state) => {
        state.filtersReady = true
      }),
  }
}

