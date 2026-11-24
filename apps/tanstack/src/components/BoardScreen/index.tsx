"use client"

import { BoardSide, BoardView, FilterBar, HydrationLab, useRenderCount } from "@board/kit"
import { useBoardScreen } from "./model"

export function BoardScreen() {
  const boardRenders = useRenderCount()
  const {
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
    pending,
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
    items,
    hasNextPage,
    isFetchingNextPage,
    activityMessage,
    loadMore,
  } = useBoardScreen()

  return (
    <>
      <HydrationLab
        {...{ snapshotAt, draftTitle, note, storageNote, failNext, boardRenders, trace }}
        library="TanStack"
        clientMoves={moves}
        replayCount={replays}
        onReplay={replay}
        onFailNext={setFailNext}
      />
      <FilterBar {...{ filters, stats }} onChange={setFilters} />
      <div className="workspace">
        <BoardView
          {...{ columns, draft, error, pending }}
          onSelect={select}
          onOpen={openCard}
          onToggleColumn={toggleColumn}
          onMove={handleMove}
          onDragStart={startDrag}
          onDragMove={moveDrag}
          onDragEnd={endDrag}
          onOpenDraft={openDraft}
          onDraftTitle={setDraftTitle}
          onSubmitDraft={handleSubmitDraft}
          onCancelDraft={cancelDraft}
          onDismissError={dismissError}
        />
        <BoardSide
          {...{ lines }}
          items={items}
          hasNext={hasNextPage}
          loading={isFetchingNextPage}
          error={activityMessage}
          onLoadMore={loadMore}
        />
      </div>
    </>
  )
}
