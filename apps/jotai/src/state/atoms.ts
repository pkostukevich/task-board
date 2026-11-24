"use client"

import type { ActivityPage, Board, Card, CardBuffer, CardDraft, Filters } from "@board/kit"
import { boardApi, defaultFilters, deriveBoard, isFilters, prependLimited, SELECTION_LOG_LIMIT } from "@board/kit"
import { atom } from "jotai"
import { atomFamily } from "jotai-family"
import { atomEffect } from "jotai-effect"
import { atomWithStorage, selectAtom, splitAtom, unwrap } from "jotai/utils"
import type { DetailRequest } from "@/types"

const FILTER_KEY = "board-filters"

export const filterStorage = {
  allowRead: false,
  getItem(_key: string, initialValue: Filters) {
    if (!filterStorage.allowRead || typeof window === "undefined") return initialValue
    try {
      const raw = localStorage.getItem(FILTER_KEY)
      if (!raw) return initialValue
      const parsed: unknown = JSON.parse(raw)
      return isFilters(parsed) ? parsed : initialValue
    } catch {
      return initialValue
    }
  },
  setItem(_key: string, value: Filters) {
    if (typeof window === "undefined") return
    localStorage.setItem(FILTER_KEY, JSON.stringify(value))
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  },
}

export const boardAtom = atom<Board | null>(null)
boardAtom.debugLabel = "board"

export const selectedCardIdAtom = atom<string | null>(null)
selectedCardIdAtom.debugLabel = "selectedCardId"

export const collapsedAtom = atom<Record<string, boolean>>({})
export const draftAtom = atom<CardDraft | null>(null)
export const clientMovesAtom = atom(0)
export const hydrateReplaysAtom = atom(0)
export const draggingAtom = atom<{ cardId: string; x: number; y: number } | null>(null)
export const errorAtom = atom<string | null>(null)
export const pendingAtom = atom(false)
export const failNextAtom = atom(false)
export const filtersReadyAtom = atom(false)
export const selectionLogAtom = atom<string[]>([])
export const traceAtom = atom<string[]>([])
export const activityAtom = atom<ActivityPage>({ items: [], nextCursor: null })
export const activityLoadingAtom = atom(false)
export const activityErrorAtom = atom<string | null>(null)

export const filtersAtom = atomWithStorage<Filters>(FILTER_KEY, defaultFilters, filterStorage)
filtersAtom.debugLabel = "filters"

export const columnsAtom = atom((get) => get(boardAtom)?.columns ?? [])
export const columnAtomsAtom = splitAtom(columnsAtom, (column) => column.id)

export const visibleAtom = atom((get) => {
  const board = get(boardAtom)
  if (!board) return null
  return deriveBoard(
    board,
    get(filtersAtom),
    get(collapsedAtom),
    get(selectedCardIdAtom),
    get(draggingAtom)?.cardId ?? null,
  )
})

const selectionSourceAtom = atom((get) => {
  const selectedId = get(selectedCardIdAtom)
  return get(boardAtom)?.cards.find((card) => card.id === selectedId)?.title ?? "Nothing selected"
})

export const selectedTitleAtom = selectAtom(selectionSourceAtom, (title) => title)

export const selectionEffectAtom = atomEffect((get, set) => {
  const selectedId = get(selectedCardIdAtom)
  const title = get(selectedTitleAtom)
  const line = selectedId ? title : "Nothing selected"
  const previous = get.peek(selectionLogAtom)
  if (previous[0] === line) return
  set(selectionLogAtom, prependLimited(previous, line, SELECTION_LOG_LIMIT))
})

export function readStoredFilters() {
  filterStorage.allowRead = true
  return filterStorage.getItem(FILTER_KEY, defaultFilters)
}

export const cardBufferFamily = atomFamily((cardId: string) => {
  const bufferAtom = atom<CardBuffer | null>(null)
  bufferAtom.debugLabel = `buffer:${cardId}`
  return bufferAtom
})

export const detailRequestAtom = atom<DetailRequest | null>(null)

const detailAtom = atom(async (get) => {
  const request = get(detailRequestAtom)
  if (!request) return null
  return boardApi.getCard(request.id)
})

const DETAIL_PENDING = Symbol("detail-pending")

function isDetailPending(value: unknown): value is typeof DETAIL_PENDING {
  return value === DETAIL_PENDING
}

export type DetailStatus =
  | { state: "loading" }
  | { state: "hasError"; error: unknown }
  | { state: "hasData"; data: Card | null }

const detailUnwrappedAtom = unwrap(detailAtom, () => DETAIL_PENDING)

export const detailStatusAtom = atom((get): DetailStatus => {
  try {
    const data = get(detailUnwrappedAtom)
    if (typeof data === "symbol") {
      if (!isDetailPending(data)) return { state: "hasError", error: new Error("Unexpected detail state") }
      return { state: "loading" }
    }
    return { state: "hasData", data }
  } catch (error) {
    return { state: "hasError", error }
  }
})
