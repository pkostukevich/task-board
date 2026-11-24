import "server-only"
import type {
  Activity,
  ActivityPage,
  Board,
  Card,
  CardPatch,
  ChecklistItem,
  Column,
} from "../types"
import { BoardError } from "./errors"

const READ_DELAY_MS = 40
const WRITE_DELAY_MS = 280
const PAGE_SIZE = 4

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function item(id: string, text: string, done = false): ChecklistItem {
  return { id, text, done }
}

const columns: Column[] = [
  { id: "backlog", title: "Backlog", wipLimit: 0, order: 0 },
  { id: "doing", title: "Doing", wipLimit: 2, order: 1 },
  { id: "done", title: "Done", wipLimit: 0, order: 2 },
]

const seedCards: Card[] = [
  {
    id: "card-brief",
    columnId: "backlog",
    title: "Align the brief",
    details: "Confirm the four copies share one board and differ only in state.",
    assignee: "alex",
    label: "feature",
    points: 3,
    order: 0,
    checklist: [
      item("brief-1", "Same columns and cards"),
      item("brief-2", "Same server snapshot"),
    ],
  },
  {
    id: "card-sketch",
    columnId: "backlog",
    title: "Sketch the board",
    details: "Columns, filters, draft, and the hydration strip.",
    assignee: "sam",
    label: "chore",
    points: 1,
    order: 1,
    checklist: [item("sketch-1", "Paper background"), item("sketch-2", "Accent per library")],
  },
  {
    id: "card-optimistic",
    columnId: "doing",
    title: "Wire optimistic moves",
    details: "Move a card, then roll it back when the server rejects the call.",
    assignee: "riley",
    label: "feature",
    points: 5,
    order: 0,
    checklist: [item("opt-1", "Update locally first"), item("opt-2", "Restore the previous column", true)],
  },
  {
    id: "card-hydrate",
    columnId: "doing",
    title: "Hydrate the snapshot",
    details: "The server time stays put when a second hydrate is attempted.",
    assignee: "alex",
    label: "bug",
    points: 2,
    order: 1,
    checklist: [item("hyd-1", "Per-request store"), item("hyd-2", "Ignore the replay")],
  },
  {
    id: "card-compare",
    columnId: "done",
    title: "Write the comparison",
    details: "Document where the server snapshot lives in each library.",
    assignee: "sam",
    label: "chore",
    points: 2,
    order: 0,
    checklist: [item("cmp-1", "Four schemes", true)],
  },
  {
    id: "card-failed-save",
    columnId: "backlog",
    title: "Catch a failed save",
    details: "The card page keeps the local buffer when the patch is rejected.",
    assignee: "riley",
    label: "bug",
    points: 1,
    order: 2,
    checklist: [item("fail-1", "Toggle a checklist item"), item("fail-2", "Save with the reject switch")],
  },
]

class BoardRepository {
  private columns: Column[] = clone(columns)
  private cards: Card[] = clone(seedCards)
  private activity: Activity[] = []
  private activitySeq = 1
  private cardSeq = 1

  constructor() {
    ;[
      "Seeded the comparison board",
      "Riley parked a failed save in the backlog",
      "Sam finished the comparison note",
      "Alex filed the hydration bug",
      "The doing column is already at its limit",
      "Filters stay in the browser, not in this snapshot",
      "Activity continues on the next page",
    ].forEach((message, index) => {
      this.activity.push(this.makeActivity(message, (index + 1) * 12))
    })
  }

  async getBoard(): Promise<Board> {
    await wait(READ_DELAY_MS)
    return this.snapshot()
  }

  async getCard(id: string): Promise<Card> {
    await wait(READ_DELAY_MS)
    const card = this.cards.find((item) => item.id === id)
    if (!card) throw new BoardError("Card not found", 404)
    return clone(card)
  }

  async moveCard(cardId: string, toColumnId: string, fail = false): Promise<Board> {
    await wait(WRITE_DELAY_MS)
    if (fail) throw new Error("Move rejected by the server")
    const card = this.requireCard(cardId)
    this.requireColumn(toColumnId)
    card.columnId = toColumnId
    card.order = this.nextOrder(toColumnId)
    this.addActivity(`Moved “${card.title}” to ${this.columnTitle(toColumnId)}`)
    return this.snapshot()
  }

  async createCard(columnId: string, title: string, fail = false): Promise<Card> {
    await wait(WRITE_DELAY_MS)
    if (fail) throw new Error("Create rejected by the server")
    this.requireColumn(columnId)
    const card: Card = {
      id: `card-new-${this.cardSeq++}`,
      columnId,
      title: title.trim(),
      details: "Added from the column draft.",
      assignee: "alex",
      label: "chore",
      points: 1,
      order: this.nextOrder(columnId),
      checklist: [item(`new-${this.cardSeq}-1`, "Fill in the details")],
    }
    this.cards.push(card)
    this.addActivity(`Created “${card.title}”`)
    return clone(card)
  }

  async updateCard(id: string, patch: CardPatch, fail = false): Promise<Card> {
    await wait(WRITE_DELAY_MS)
    if (fail) throw new Error("Save rejected by the server")
    const card = this.requireCard(id)
    card.title = patch.title.trim()
    card.checklist = clone(patch.checklist)
    this.addActivity(`Saved “${card.title}”`)
    return clone(card)
  }

  async getActivity(cursor = 0): Promise<ActivityPage> {
    await wait(READ_DELAY_MS)
    const items = this.activity.slice(cursor, cursor + PAGE_SIZE)
    const next = cursor + PAGE_SIZE < this.activity.length ? cursor + PAGE_SIZE : null
    return { items: clone(items), nextCursor: next }
  }

  private snapshot(): Board {
    return {
      id: "comparison-board",
      title: "Comparison board",
      snapshotAt: new Date().toISOString(),
      columns: clone(this.columns).sort((a, b) => a.order - b.order),
      cards: clone(this.cards).sort((a, b) => a.order - b.order),
    }
  }

  private requireCard(id: string) {
    const card = this.cards.find((item) => item.id === id)
    if (!card) throw new BoardError("Card not found", 404)
    return card
  }

  private requireColumn(id: string) {
    const column = this.columns.find((item) => item.id === id)
    if (!column) throw new BoardError("Column not found", 404)
    return column
  }

  private columnTitle(id: string) {
    return this.columns.find((item) => item.id === id)?.title ?? id
  }

  private nextOrder(columnId: string) {
    const orders = this.cards.filter((card) => card.columnId === columnId).map((card) => card.order)
    return orders.length === 0 ? 0 : Math.max(...orders) + 1
  }

  private makeActivity(message: string, minutesAgo: number): Activity {
    return {
      id: `act-${this.activitySeq++}`,
      at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      message,
    }
  }

  private addActivity(message: string) {
    this.activity.unshift(this.makeActivity(message, 0))
  }
}

export const boardRepository = new BoardRepository()
