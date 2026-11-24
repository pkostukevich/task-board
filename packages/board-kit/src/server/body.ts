import type { CardPatch, ChecklistItem } from "../types"
import { BoardError } from "./errors"

export type MoveBody = {
  cardId: string
  toColumnId: string
  fail: boolean
}

export type CreateBody = {
  columnId: string
  title: string
  fail: boolean
}

export type UpdateBody = CardPatch & {
  fail: boolean
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new BoardError("Expected a JSON body", 400)
  }
}

export function parseMoveBody(value: unknown): MoveBody {
  const body = record(value)
  const cardId = requiredString(body, "cardId")
  const toColumnId = requiredString(body, "toColumnId")
  return { cardId, toColumnId, fail: body.fail === true }
}

export function parseCreateBody(value: unknown): CreateBody {
  const body = record(value)
  const columnId = requiredString(body, "columnId")
  const title = requiredString(body, "title")
  return { columnId, title, fail: body.fail === true }
}

export function parseUpdateBody(value: unknown): UpdateBody {
  const body = record(value)
  const title = requiredString(body, "title")
  return { title, checklist: checklist(body.checklist), fail: body.fail === true }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BoardError("Expected a JSON object", 400)
  }
  return Object.fromEntries(Object.entries(value))
}

function requiredString(body: Record<string, unknown>, key: string) {
  const value = body[key]
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BoardError(`${key} is required`, 400)
  }
  return value.trim()
}

function checklist(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) throw new BoardError("checklist is required", 400)
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new BoardError("checklist items must be objects", 400)
    }
    const entry = Object.fromEntries(Object.entries(item))
    if (typeof entry.id !== "string" || entry.id.length === 0) {
      throw new BoardError("checklist item id is required", 400)
    }
    if (typeof entry.text !== "string") throw new BoardError("checklist item text is required", 400)
    if (typeof entry.done !== "boolean") throw new BoardError("checklist item done is required", 400)
    return { id: entry.id, text: entry.text, done: entry.done }
  })
}
