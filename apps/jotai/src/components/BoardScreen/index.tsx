"use client"

import { BoardSide, FilterBar, HydrationLab, useRenderCount, type ColumnViewBindings } from "@board/kit"
import { useAtomValue, useSetAtom } from "jotai"
import {
  activityAtom,
  activityErrorAtom,
  activityLoadingAtom,
  boardAtom,
  clientMovesAtom,
  draftAtom,
  errorAtom,
  failNextAtom,
  filtersAtom,
  filtersReadyAtom,
  hydrateReplaysAtom,
  pendingAtom,
  selectedTitleAtom,
  selectionLogAtom,
  traceAtom,
  visibleAtom,
} from "@/state/atoms"
import { JotaiBoard } from "@/components/JotaiBoard"
import { useBoardCommands } from "./helpers"

export function BoardScreen() {
  const board = useAtomValue(boardAtom)
  const visible = useAtomValue(visibleAtom)
  const draft = useAtomValue(draftAtom)
  const filters = useAtomValue(filtersAtom)
  const filtersReady = useAtomValue(filtersReadyAtom)
  const moves = useAtomValue(clientMovesAtom)
  const replays = useAtomValue(hydrateReplaysAtom)
  const error = useAtomValue(errorAtom)
  const pending = useAtomValue(pendingAtom)
  const failNext = useAtomValue(failNextAtom)
  const selectedTitle = useAtomValue(selectedTitleAtom)
  const log = useAtomValue(selectionLogAtom)
  const trace = useAtomValue(traceAtom)
  const activity = useAtomValue(activityAtom)
  const activityLoading = useAtomValue(activityLoadingAtom)
  const activityError = useAtomValue(activityErrorAtom)
  const setFailNext = useSetAtom(failNextAtom)
  const boardRenders = useRenderCount()
  const commands = useBoardCommands()

  if (!board || !visible) return <p className="pending">Waiting for the server snapshot.</p>

  const { snapshotAt } = board
  const { stats } = visible
  const { items, nextCursor } = activity
  const {
    setFilters,
    setSelected,
    replay,
    openCard,
    toggleColumn,
    move,
    startDrag,
    moveDrag,
    endDrag,
    openDraft,
    setDraftTitle,
    submitDraft,
    cancelDraft,
    dismissError,
    loadMore,
  } = commands
  const draftTitle = draft?.title ?? ""
  const storageNote = filtersReady
    ? "atomWithStorage applied saved filters after mount."
    : "First paint uses the default filters so the HTML matches."
  const bindings: ColumnViewBindings = {
    draft,
    pending,
    onSelect: setSelected,
    onOpen: openCard,
    onToggleColumn: toggleColumn,
    onMove: move,
    onDragStart: startDrag,
    onDragEnd: endDrag,
    onOpenDraft: openDraft,
    onDraftTitle: setDraftTitle,
    onSubmitDraft: submitDraft,
    onCancelDraft: cancelDraft,
  }

  return (
    <>
      <HydrationLab
        {...{ snapshotAt, draftTitle, storageNote, failNext, boardRenders, trace }}
        library="Jotai"
        clientMoves={moves}
        replayCount={replays}
        note={`Selected: ${selectedTitle}. useHydrateAtoms writes each atom once per store, so a replay leaves the snapshot time alone.`}
        onReplay={replay}
        onFailNext={setFailNext}
      />
      <FilterBar {...{ filters, stats }} onChange={setFilters} />
      <div className="workspace">
        <JotaiBoard
          {...{ error, bindings }}
          onDragMove={moveDrag}
          onDragEnd={endDrag}
          onDismissError={dismissError}
        />
        <BoardSide
          {...{ items }}
          hasNext={nextCursor !== null}
          loading={activityLoading}
          error={activityError}
          onLoadMore={loadMore}
          lines={log}
        />
      </div>
    </>
  )
}
