import type { Assignee, Label } from "./types"

export type CardModel = {
  id: string
  title: string
  href: string
  assignee: Assignee
  label: Label
  points: number
  selected: boolean
  dragging: boolean
}

export type ColumnModel = {
  id: string
  title: string
  wipLimit: number
  count: number
  overLimit: boolean
  collapsed: boolean
  cards: CardModel[]
}

export type BoardStats = {
  visible: number
  points: number
  overLimit: string[]
}

export type Point = {
  x: number
  y: number
}
