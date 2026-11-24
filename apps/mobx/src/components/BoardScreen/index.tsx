"use client"

import { BoardSide, BoardView, FilterBar, HydrationLab, useRenderCount } from "@board/kit"
import { toJS } from "mobx"
import { observer } from "mobx-react-lite"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useBoardStore } from "@/state/provider"
import { exportedCount } from "./helpers"

export const BoardScreen = observer(function BoardScreen() {
  const store = useBoardStore()
  const router = useRouter()
  const {
    snapshotAt,
    clientMoves,
    draft,
    hydrateReplays,
    filtersReady,
    failNext,
    trace,
    filters,
    stats,
    columnsView,
    error,
    pending,
    activityItems,
    activityCursor,
    activityLoading,
    activityError,
    selectionLog,
    cards,
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
  } = store
  const boardRenders = useRenderCount()
  const openCard = useCallback(
    (cardId: string) => {
      router.push(`/cards/${cardId}`)
    },
    [router],
  )
  const draftTitle = draft?.title ?? ""
  const storageNote = filtersReady
    ? "A reaction wrote the filters to localStorage after they were restored."
    : "First paint uses the default filters. enableStaticRendering is on for the server pass."

  return (
    <>
      <HydrationLab
        {...{ snapshotAt, clientMoves, draftTitle, storageNote, failNext, boardRenders, trace }}
        library="MobX"
        replayCount={hydrateReplays}
        note={`toJS exported ${exportedCount(toJS(cards))} cards. hydrate() returns early after the first snapshot, so the replay leaves the time alone.`}
        onReplay={replay}
        onFailNext={setFailNext}
      />
      <FilterBar {...{ filters }} stats={stats.get()} onChange={setFilters} />
      <div className="workspace">
        <BoardView
          {...{ draft, error, pending }}
          columns={columnsView}
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
})
