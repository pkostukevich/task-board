"use client"

import type { Card } from "@board/kit"
import { isFilters, prependLimited, SELECTION_LOG_LIMIT, TRACE_LIMIT } from "@board/kit"
import { batch, createStore, createStoreContext } from "@tanstack/react-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"
import { initialUi } from "./ui"
import type { Stores } from "./types"

const FILTER_KEY = "board-filters-tanstack"

const { StoreProvider, useStoreContext } = createStoreContext<Stores>()

export function useUi() {
  return useStoreContext()
}

function buildStores(): Stores {
  const log = createStore<string[]>([])
  const ui = createStore(initialUi, (store) => ({
    select(cardId) {
      store.setState((current) => ({ ...current, selectedCardId: cardId }))
      const line = cardId ?? "Nothing selected"
      log.setState((lines) => (lines[0] === line ? lines : prependLimited(lines, line, SELECTION_LOG_LIMIT)))
    },
    toggleColumn(columnId) {
      store.setState((current) => ({
        ...current,
        collapsed: { ...current.collapsed, [columnId]: !current.collapsed[columnId] },
      }))
    },
    openDraft(columnId) {
      batch(() => {
        store.setState((current) => ({
          ...current,
          draft: { columnId, title: "" },
          selectedCardId: null,
          collapsed: { ...current.collapsed, [columnId]: false },
        }))
        log.setState((lines) => prependLimited(lines, `Draft opened in ${columnId}`, SELECTION_LOG_LIMIT))
      })
    },
    setDraftTitle(title) {
      store.setState((current) => (current.draft ? { ...current, draft: { ...current.draft, title } } : current))
    },
    cancelDraft() {
      store.setState((current) => ({ ...current, draft: null }))
    },
    startDrag(cardId, point) {
      store.setState((current) => ({ ...current, drag: { cardId, ...point } }))
    },
    moveDrag(point) {
      store.setState((current) => (current.drag ? { ...current, drag: { ...current.drag, ...point } } : current))
    },
    endDrag() {
      store.setState((current) => ({ ...current, drag: null }))
    },
    setFailNext(value) {
      store.setState((current) => ({ ...current, failNext: value }))
    },
    setFilters(filters) {
      store.setState((current) => ({ ...current, filters }))
    },
    setError(message) {
      store.setState((current) => ({ ...current, error: message }))
    },
    setPending(value) {
      store.setState((current) => ({ ...current, pending: value }))
    },
    bumpMoves(delta) {
      store.setState((current) => ({ ...current, clientMoves: Math.max(0, current.clientMoves + delta) }))
    },
    replay() {
      store.setState((current) => ({ ...current, hydrateReplays: current.hydrateReplays + 1 }))
    },
    pushTrace(line: string) {
      store.setState((current) => ({ ...current, trace: prependLimited(current.trace, line, TRACE_LIMIT) }))
    },
    ensureBuffer(card: Card) {
      store.setState((current) => {
        if (current.buffers[card.id]) return current
        return {
          ...current,
          buffers: {
            ...current.buffers,
            [card.id]: { title: card.title, checklist: card.checklist.map((item) => ({ ...item })) },
          },
        }
      })
    },
    setBufferTitle(cardId, title) {
      store.setState((current) => {
        const buffer = current.buffers[cardId]
        if (!buffer) return current
        return { ...current, buffers: { ...current.buffers, [cardId]: { ...buffer, title } } }
      })
    },
    toggleCheck(cardId, checkId) {
      store.setState((current) => {
        const buffer = current.buffers[cardId]
        if (!buffer) return current
        return {
          ...current,
          buffers: {
            ...current.buffers,
            [cardId]: {
              ...buffer,
              checklist: buffer.checklist.map((item) =>
                item.id === checkId ? { ...item, done: !item.done } : item,
              ),
            },
          },
        }
      })
    },
    replaceBuffer(cardId, buffer) {
      store.setState((current) => ({ ...current, buffers: { ...current.buffers, [cardId]: buffer } }))
    },
  }))
  const draftDirty = createStore(() => Boolean(ui.state.draft?.title.trim()))
  return { ui, log, draftDirty }
}

let browserBundle: Stores | undefined
let browserQueryClient: QueryClient | undefined

function getBundle() {
  if (typeof window === "undefined") return buildStores()
  return (browserBundle ??= buildStores())
}

function getQueryClient() {
  if (typeof window === "undefined") {
    return new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  }
  return (browserQueryClient ??= new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }))
}

type TanstackProviderProps = {
  state: DehydratedState
  children: ReactNode
}

export function TanstackProvider({ state, children }: TanstackProviderProps) {
  const [queryClient] = useState(getQueryClient)
  const [{ ui, log, draftDirty }] = useState(getBundle)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isFilters(parsed)) ui.setState((current) => ({ ...current, filters: parsed }))
      }
    } catch {
      // Keep the default filters when storage is unreadable.
    }
    ui.setState((current) => ({ ...current, filtersReady: true }))
    const subscription = ui.subscribe((next) => {
      if (!next.filtersReady) return
      localStorage.setItem(FILTER_KEY, JSON.stringify(next.filters))
    })
    return () => subscription.unsubscribe()
  }, [ui])

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary {...{ state }}>
        <StoreProvider value={{ ui, log, draftDirty }}>{children}</StoreProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
