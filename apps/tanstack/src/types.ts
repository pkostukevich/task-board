import type { Card } from "@board/kit"

export type MoveVars = {
  cardId: string
  toColumnId: string
  fail: boolean
}

export type CreateVars = {
  columnId: string
  title: string
  fail: boolean
}

export type SaveVars = {
  buffer: { title: string; checklist: Card["checklist"] }
  fail: boolean
}

export type ActivityPageParam = {
  pageParam: number
}
