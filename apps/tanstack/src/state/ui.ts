import { defaultFilters } from "@board/kit"
import type { UiState } from "./types"

export const initialUi: UiState = {
  selectedCardId: null,
  collapsed: {},
  draft: null,
  drag: null,
  clientMoves: 0,
  hydrateReplays: 0,
  failNext: false,
  filters: { ...defaultFilters },
  filtersReady: false,
  error: null,
  pending: false,
  buffers: {},
  selectionLog: [],
  trace: [],
}
