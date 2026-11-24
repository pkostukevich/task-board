"use client"

import { deriveBoard, errorMessage } from "@board/kit"
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query"
import { shallow, useSelector } from "@tanstack/react-store"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useCreateCard, useMoveCard } from "@/mutations"
import { activityQueryOptions, boardQuery } from "@/query"
import { useUi } from "@/state/provider"
import { activityItems } from "./helpers"

export function useBoardScreen() {
  const { data: board } = useSuspenseQuery(boardQuery)
  const activity = useSuspenseInfiniteQuery(activityQueryOptions())
  const { ui, log, draftDirty } = useUi()
  const { actions } = ui
  const {
    replay,
    setFailNext,
    setFilters,
    select,
    toggleColumn,
    startDrag,
    moveDrag,
    endDrag,
    openDraft,
    setDraftTitle,
    cancelDraft,
    setError,
  } = actions
  const filters = useSelector(ui, (state) => state.filters, { compare: shallow })
  const draft = useSelector(ui, (state) => state.draft)
  const selectedId = useSelector(ui, (state) => state.selectedCardId)
  const collapsed = useSelector(ui, (state) => state.collapsed, { compare: shallow })
  const moves = useSelector(ui, (state) => state.clientMoves)
  const replays = useSelector(ui, (state) => state.hydrateReplays)
  const failNext = useSelector(ui, (state) => state.failNext)
  const error = useSelector(ui, (state) => state.error)
  const pending = useSelector(ui, (state) => state.pending)
  const filtersReady = useSelector(ui, (state) => state.filtersReady)
  const dirty = useSelector(draftDirty)
  const lines = useSelector(log)
  const trace = useSelector(ui, (state) => state.trace)
  const { columns, stats } = deriveBoard(board, filters, collapsed, selectedId, null)
  const move = useMoveCard()
  const create = useCreateCard()
  const { mutate: moveCard, isPending: movePending } = move
  const { mutate: createCard, isPending: createPending } = create
  const router = useRouter()
  const { snapshotAt } = board
  const { pages } = activity.data
  const { hasNextPage, isFetchingNextPage, error: activityError, fetchNextPage } = activity

  const openCard = useCallback(
    (cardId: string) => {
      router.push(`/cards/${cardId}`)
    },
    [router],
  )
  const handleMove = useCallback(
    (cardId: string, toColumnId: string) => {
      moveCard({ cardId, toColumnId, fail: ui.state.failNext })
    },
    [moveCard, ui],
  )
  const handleSubmitDraft = useCallback(() => {
    const current = ui.state.draft
    if (!current) return
    const { columnId, title } = current
    createCard({ columnId, title, fail: ui.state.failNext })
  }, [createCard, ui])
  const dismissError = useCallback(() => {
    setError(null)
  }, [setError])
  const loadMore = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  const draftTitle = draft?.title ?? ""
  const note = dirty
    ? "The board lives in the Query cache. The draft lives in the Store and is dirty. Replay does not write the cache."
    : "The board lives in the Query cache. The draft lives in the Store. Replay does not write the cache."
  const storageNote = filtersReady
    ? "The Store subscribed to itself and restored filters after mount."
    : "The Store starts from the same defaults on the server and the client."
  const activityMessage = activityError ? errorMessage(activityError) : null

  return {
    snapshotAt,
    draftTitle,
    note,
    storageNote,
    failNext,
    trace,
    moves,
    replays,
    replay,
    setFailNext,
    filters,
    stats,
    setFilters,
    columns,
    draft,
    error,
    pending: pending || movePending || createPending,
    select,
    openCard,
    toggleColumn,
    handleMove,
    startDrag,
    moveDrag,
    endDrag,
    openDraft,
    setDraftTitle,
    handleSubmitDraft,
    cancelDraft,
    dismissError,
    lines,
    items: activityItems(pages),
    hasNextPage,
    isFetchingNextPage,
    activityMessage,
    loadMore,
  }
}
