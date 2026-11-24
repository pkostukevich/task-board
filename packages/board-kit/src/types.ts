export type Assignee = "alex" | "sam" | "riley"
export type Label = "bug" | "feature" | "chore"

export type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

export type Card = {
  id: string
  columnId: string
  title: string
  details: string
  assignee: Assignee
  label: Label
  points: number
  order: number
  checklist: ChecklistItem[]
}

export type Column = {
  id: string
  title: string
  wipLimit: number
  order: number
}

export type Board = {
  id: string
  title: string
  snapshotAt: string
  columns: Column[]
  cards: Card[]
}

export type Activity = {
  id: string
  at: string
  message: string
}

export type ActivityPage = {
  items: Activity[]
  nextCursor: number | null
}

export type Filters = {
  query: string
  assignee: Assignee | "all"
  label: Label | "all"
}

export type CardDraft = {
  columnId: string
  title: string
}

export type CardBuffer = {
  title: string
  checklist: ChecklistItem[]
}

export type CardPatch = {
  title: string
  checklist: ChecklistItem[]
}
