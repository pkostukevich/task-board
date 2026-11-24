"use client"

import type { Activity, ActivityPage, Board, BoardStats, Card, CardBuffer, CardDraft, Column, Filters } from "@board/kit"
import {
  boardApi,
  defaultFilters,
  deriveBoard,
  errorMessage,
  isFilters,
  optimisticCard,
  prependLimited,
  SELECTION_LOG_LIMIT,
  TRACE_LIMIT,
} from "@board/kit"
import {
  computed,
  flow,
  makeAutoObservable,
  observable,
  onBecomeObserved,
  reaction,
  runInAction,
  type IComputedValue,
  type IReactionDisposer,
} from "mobx"
import { enableStaticRendering } from "mobx-react-lite"

enableStaticRendering(typeof window === "undefined")

const FILTER_KEY = "board-filters"
const watchedCards = new WeakMap<BoardStore, Set<string>>()

export class BoardStore {
  title = "Comparison board"
  snapshotAt = ""
  columns: Column[] = []
  cards = observable.map<string, Card>()
  hydrated = false
  hydrateReplays = 0
  selectedCardId: string | null = null
  collapsed: Record<string, boolean> = {}
  draft: CardDraft | null = null
  clientMoves = 0
  drag: { cardId: string; x: number; y: number } | null = null
  filters: Filters = { ...defaultFilters }
  filtersReady = false
  error: string | null = null
  pending = false
  failNext = false
  selectionLog: string[] = []
  trace: string[] = []
  activityItems: Activity[] = []
  activityCursor: number | null = null
  activityLoading = false
  activityError: string | null = null
  buffers = observable.map<string, CardBuffer>()
  cardDetails = observable.map<string, Card>()
  detailStatus = "onBecomeObserved is idle until this card is read."
  readonly stats: IComputedValue<BoardStats>
  private disposers: IReactionDisposer[] = []

  constructor() {
    makeAutoObservable(
      this,
      {
        stats: false,
        saveBuffer: false,
        cards: false,
        buffers: false,
        cardDetails: false,
      },
      { autoBind: true },
    )
    this.stats = computed(() => this.buildStats())
    if (typeof window !== "undefined") {
      this.disposers.push(
        reaction(
          () => ({
            query: this.filters.query,
            assignee: this.filters.assignee,
            label: this.filters.label,
          }),
          (filters) => {
            if (!this.filtersReady) return
            localStorage.setItem(FILTER_KEY, JSON.stringify(filters))
          },
        ),
        reaction(
          () => this.drag === null,
          (idle, wasIdle) => {
            if (!idle || wasIdle !== false || this.clientMoves === 0) return
            runInAction(() => {
              this.pushLog(`Drag settled after ${this.clientMoves} moves`)
            })
          },
        ),
      )
    }
  }

  dispose() {
    this.disposers.forEach((stop) => stop())
    this.disposers = []
  }

  hydrate(board: Board, activity: ActivityPage) {
    if (this.hydrated) {
      this.hydrateReplays += 1
      return
    }
    this.title = board.title
    this.snapshotAt = board.snapshotAt
    this.columns = board.columns
    this.cards.clear()
    board.cards.forEach((card) => this.cards.set(card.id, card))
    this.activityItems = activity.items
    this.activityCursor = activity.nextCursor
    this.hydrated = true
  }

  replay() {
    if (!this.hydrated) return
    this.hydrateReplays += 1
  }

  restoreFilters() {
    try {
      const raw = localStorage.getItem(FILTER_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isFilters(parsed)) this.filters = parsed
      }
    } catch {
      // Ignore a broken local value and keep the server default.
    }
    this.filtersReady = true
  }

  get columnsView() {
    return deriveBoard(
      this.toBoard(),
      this.filters,
      this.collapsed,
      this.selectedCardId,
      this.drag?.cardId ?? null,
    ).columns
  }

  select(cardId: string | null) {
    this.selectedCardId = cardId
    this.pushLog(cardId ? (this.cards.get(cardId)?.title ?? "Missing card") : "Nothing selected")
  }

  toggleColumn(columnId: string) {
    this.collapsed = { ...this.collapsed, [columnId]: !this.collapsed[columnId] }
  }

  openDraft(columnId: string) {
    this.draft = { columnId, title: "" }
  }

  setDraftTitle(title: string) {
    if (!this.draft) return
    this.draft = { ...this.draft, title }
  }

  cancelDraft() {
    this.draft = null
  }

  setFilters(filters: Filters) {
    this.filters = filters
  }

  setFailNext(value: boolean) {
    this.failNext = value
  }

  dismissError() {
    this.error = null
  }

  pushTrace(line: string) {
    this.trace = prependLimited(this.trace, line, TRACE_LIMIT)
  }

  startDrag(cardId: string, point: { x: number; y: number }) {
    this.drag = { cardId, ...point }
  }

  moveDrag(point: { x: number; y: number }) {
    if (!this.drag) return
    this.drag = { ...this.drag, ...point }
  }

  endDrag() {
    this.drag = null
  }

  moveCard(cardId: string, toColumnId: string) {
    const current = this.cards.get(cardId)
    if (!current || this.pending) return
    const previousColumn = current.columnId
    const fail = this.failNext
    this.cards.set(cardId, { ...current, columnId: toColumnId })
    this.pushTrace("action moveCard wrote the card in observable.map")
    this.clientMoves += 1
    this.pending = true
    this.error = null
    this.failNext = false
    void this.commitMove(cardId, toColumnId, previousColumn, fail)
  }

  async createCard() {
    if (!this.draft || this.draft.title.trim().length === 0 || this.pending) return
    const draft = this.draft
    const fail = this.failNext
    const optimistic = optimisticCard(draft)
    this.cards.set(optimistic.id, optimistic)
    this.pushTrace("action createCard inserted an optimistic card")
    this.pending = true
    this.error = null
    this.failNext = false
    try {
      const created = await boardApi.createCard(draft.columnId, draft.title, fail)
      const activity = await boardApi.getActivity(0)
      runInAction(() => {
        this.cards.delete(optimistic.id)
        this.cards.set(created.id, created)
        this.pushTrace("runInAction swapped in the server card")
        this.draft = null
        this.activityItems = activity.items
        this.activityCursor = activity.nextCursor
        this.pending = false
      })
    } catch (error) {
      runInAction(() => {
        this.cards.delete(optimistic.id)
        this.pushTrace("runInAction deleted the optimistic card")
        this.error = errorMessage(error)
        this.pending = false
      })
    }
  }

  saveBuffer = flow(function* (this: BoardStore, cardId: string) {
    const buffer = this.buffers.get(cardId)
    const previous = this.cards.get(cardId)
    if (!buffer || !previous || this.pending) return
    const fail = this.failNext
    this.cards.set(cardId, { ...previous, title: buffer.title, checklist: buffer.checklist })
    this.pending = true
    this.error = null
    this.failNext = false
    try {
      const saved: Card = yield boardApi.updateCard(cardId, buffer, fail)
      this.cards.set(saved.id, saved)
      const activity: ActivityPage = yield boardApi.getActivity(0)
      this.activityItems = activity.items
      this.activityCursor = activity.nextCursor
    } catch (error) {
      this.cards.set(cardId, previous)
      this.error = errorMessage(error)
    } finally {
      this.pending = false
    }
  })

  async loadMore() {
    if (this.activityCursor === null || this.activityLoading) return
    this.activityLoading = true
    this.activityError = null
    try {
      const page = await boardApi.getActivity(this.activityCursor)
      runInAction(() => {
        this.activityItems.push(...page.items)
        this.activityCursor = page.nextCursor
        this.activityLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.activityError = errorMessage(error)
        this.activityLoading = false
      })
    }
  }

  ensureBuffer(card: Card) {
    if (this.buffers.has(card.id)) return
    this.buffers.set(card.id, {
      title: card.title,
      checklist: card.checklist.map((item) => ({ ...item })),
    })
  }

  setBufferTitle(cardId: string, title: string) {
    const buffer = this.buffers.get(cardId)
    if (!buffer) return
    this.buffers.set(cardId, { ...buffer, title })
  }

  toggleCheck(cardId: string, checkId: string) {
    const buffer = this.buffers.get(cardId)
    if (!buffer) return
    this.buffers.set(cardId, {
      ...buffer,
      checklist: buffer.checklist.map((item) =>
        item.id === checkId ? { ...item, done: !item.done } : item,
      ),
    })
  }

  watchCard(cardId: string) {
    const watched = watchedCards.get(this) ?? new Set<string>()
    watchedCards.set(this, watched)
    if (watched.has(cardId)) return
    watched.add(cardId)
    onBecomeObserved(this.cardDetails, cardId, () => {
      queueMicrotask(() => {
        void this.fetchDetail(cardId)
      })
    })
  }

  private async commitMove(cardId: string, toColumnId: string, previousColumn: string, fail: boolean) {
    try {
      const board = await boardApi.moveCard(cardId, toColumnId, fail)
      const activity = await boardApi.getActivity(0)
      runInAction(() => {
        this.replaceBoard(board)
        this.pushTrace("runInAction replaced the map with the server board")
        this.activityItems = activity.items
        this.activityCursor = activity.nextCursor
        this.pending = false
        this.drag = null
      })
    } catch (error) {
      runInAction(() => {
        const card = this.cards.get(cardId)
        if (card) this.cards.set(cardId, { ...card, columnId: previousColumn })
        this.pushTrace("runInAction restored the previous column")
        this.clientMoves = Math.max(0, this.clientMoves - 1)
        this.error = errorMessage(error)
        this.pending = false
        this.drag = null
      })
    }
  }

  reloadDetail(cardId: string) {
    void this.fetchDetail(cardId)
  }

  private async fetchDetail(cardId: string) {
    if (typeof window === "undefined") return
    runInAction(() => {
      this.detailStatus = "onBecomeObserved: loading"
    })
    try {
      const card = await boardApi.getCard(cardId)
      runInAction(() => {
        this.cardDetails.set(cardId, card)
        this.detailStatus = `onBecomeObserved: ${card.title}`
      })
    } catch (error) {
      runInAction(() => {
        this.detailStatus = `onBecomeObserved: ${errorMessage(error)}`
      })
    }
  }

  private replaceBoard(board: Board) {
    this.title = board.title
    this.snapshotAt = board.snapshotAt
    this.columns = board.columns
    const seen = new Set(board.cards.map((card) => card.id))
    ;[...this.cards.keys()].forEach((id) => {
      if (!seen.has(id)) this.cards.delete(id)
    })
    board.cards.forEach((card) => this.cards.set(card.id, card))
  }

  private toBoard(): Board {
    return {
      id: "comparison-board",
      title: this.title,
      snapshotAt: this.snapshotAt,
      columns: this.columns,
      cards: [...this.cards.values()],
    }
  }

  private buildStats() {
    return deriveBoard(
      this.toBoard(),
      this.filters,
      this.collapsed,
      this.selectedCardId,
      this.drag?.cardId ?? null,
    ).stats
  }

  private pushLog(line: string) {
    if (this.selectionLog[0] === line) return
    this.selectionLog = prependLimited(this.selectionLog, line, SELECTION_LOG_LIMIT)
  }
}

let clientStore: BoardStore | undefined

export function createBoardStore(board: Board, activity: ActivityPage) {
  if (typeof window === "undefined") {
    const store = new BoardStore()
    store.hydrate(board, activity)
    return store
  }
  if (!clientStore) {
    clientStore = new BoardStore()
    clientStore.hydrate(board, activity)
  }
  return clientStore
}
