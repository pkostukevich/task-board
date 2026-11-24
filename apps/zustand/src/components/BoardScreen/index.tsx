"use client"

import { BoardSide, BoardView, deriveBoard, FilterBar, HydrationLab, useRenderCount } from "@board/kit"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { DragGhost } from "@/components/DragGhost"
import { useBoardStore, useBoardStoreApi } from "@/state/provider"

export function BoardScreen() {
  const api = useBoardStoreApi()
  const router = useRouter()
  const {
    board,
    filters,
    collapsed,
    selectedCardId,
    draft,
    error,
    pending,
    clientMoves,
    hydrateReplays,
    failNext,
    filtersReady,
    activityItems,
    activityCursor,
    activityLoading,
    activityError,
    selectionLog,
    trace,
  } = useBoardStore(
    useShallow((state) => ({
      board: state.board,
      filters: state.filters,
      collapsed: state.collapsed,
      selectedCardId: state.selectedCardId,
      draft: state.draft,
      error: state.error,
      pending: state.pending,
      clientMoves: state.clientMoves,
      hydrateReplays: state.hydrateReplays,
      failNext: state.failNext,
      filtersReady: state.filtersReady,
      activityItems: state.activityItems,
      activityCursor: state.activityCursor,
      activityLoading: state.activityLoading,
      activityError: state.activityError,
      selectionLog: state.selectionLog,
      trace: state.trace,
    })),
  )
  const {
    replay,
    setFailNext,
    setFilters,
    select,
    toggleColumn,
    moveCard,
    startDrag,
    moveDrag,
    endDrag,
    openDraft,
    setDraftTitle,
    createCard,
    cancelDraft,
    dismissError,
    loadMore,
  } = api.getState()
  const boardRenders = useRenderCount()
  const { columns, stats } = deriveBoard(board, filters, collapsed, selectedCardId, null)
  const { snapshotAt } = board
  const openCard = useCallback(
    (cardId: string) => {
      router.push(`/cards/${cardId}`)
    },
    [router],
  )
  const draftTitle = draft?.title ?? ""
  const storageNote = filtersReady
    ? "persist rehydrated the filters after mount. Drag coordinates live in a separate store and update a ghost without rendering this board."
    : "skipHydration keeps the first paint on the default filters."

  return (
    <>
      <HydrationLab
        {...{ snapshotAt, clientMoves, draftTitle, storageNote, failNext, boardRenders, trace }}
        library="Zustand"
        replayCount={hydrateReplays}
        note="The vanilla store is created once in useState. Replay increments a counter and does not replace the board."
        onReplay={replay}
        onFailNext={setFailNext}
      />
      <FilterBar {...{ filters, stats }} onChange={setFilters} />
      <div className="workspace">
        <BoardView
          {...{ columns, draft, error, pending }}
          dragGhost={<DragGhost />}
          onSelect={select}
          onOpen={openCard}
          onToggleColumn={toggleColumn}
          onMove={moveCard}
          onDragStart={startDrag}
          onDragMove={moveDrag}
          onDragEnd={endDrag}
          onOpenDraft={openDraft}
          onDraftTitle={setDraftTitle}
          onSubmitDraft={createCard}
          onCancelDraft={cancelDraft}
          onDismissError={dismissError}
        />
        <BoardSide
          items={activityItems}
          hasNext={activityCursor !== null}
          loading={activityLoading}
          error={activityError}
          onLoadMore={loadMore}
          lines={selectionLog}
        />
      </div>
    </>
  )
}
