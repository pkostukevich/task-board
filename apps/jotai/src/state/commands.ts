"use client"

import type { Card } from "@board/kit"
import { boardApi, errorMessage, moveCardLocal, optimisticCard, prependLimited, replaceCard, TRACE_LIMIT } from "@board/kit"
import { atom, type Getter } from "jotai"
import {
  activityAtom,
  activityErrorAtom,
  activityLoadingAtom,
  boardAtom,
  cardBufferFamily,
  clientMovesAtom,
  draftAtom,
  draggingAtom,
  errorAtom,
  failNextAtom,
  pendingAtom,
  traceAtom,
} from "./atoms"

export const initBufferAtom = atom(null, (get, set, card: Card) => {
  if (get(cardBufferFamily(card.id))) return
  set(cardBufferFamily(card.id), {
    title: card.title,
    checklist: card.checklist.map((item) => ({ ...item })),
  })
})

export const bufferTitleAtom = atom(null, (get, set, payload: { cardId: string; title: string }) => {
  const buffer = get(cardBufferFamily(payload.cardId))
  if (!buffer) return
  set(cardBufferFamily(payload.cardId), { ...buffer, title: payload.title })
})

export const toggleCheckAtom = atom(null, (get, set, payload: { cardId: string; checkId: string }) => {
  const buffer = get(cardBufferFamily(payload.cardId))
  if (!buffer) return
  set(cardBufferFamily(payload.cardId), {
    ...buffer,
    checklist: buffer.checklist.map((item) =>
      item.id === payload.checkId ? { ...item, done: !item.done } : item,
    ),
  })
})

function trace(get: Getter, line: string) {
  return prependLimited(get(traceAtom), line, TRACE_LIMIT)
}

export const moveCardAtom = atom(null, async (get, set, payload: { cardId: string; toColumnId: string }) => {
  const board = get(boardAtom)
  if (!board || get(pendingAtom)) return
  const fail = get(failNextAtom)
  set(boardAtom, moveCardLocal(board, payload.cardId, payload.toColumnId))
  set(traceAtom, trace(get, "moveCardAtom wrote boardAtom"))
  set(clientMovesAtom, get(clientMovesAtom) + 1)
  set(pendingAtom, true)
  set(errorAtom, null)
  set(failNextAtom, false)
  try {
    set(boardAtom, await boardApi.moveCard(payload.cardId, payload.toColumnId, fail))
    set(traceAtom, trace(get, "moveCardAtom stored the server board"))
    set(activityAtom, await boardApi.getActivity(0))
  } catch (error) {
    set(boardAtom, board)
    set(traceAtom, trace(get, "moveCardAtom rolled boardAtom back"))
    set(clientMovesAtom, Math.max(0, get(clientMovesAtom) - 1))
    set(errorAtom, errorMessage(error))
  } finally {
    set(pendingAtom, false)
    set(draggingAtom, null)
  }
})

export const createCardAtom = atom(null, async (get, set) => {
  const draft = get(draftAtom)
  const board = get(boardAtom)
  if (!draft || !board || draft.title.trim().length === 0 || get(pendingAtom)) return
  const fail = get(failNextAtom)
  const optimistic = optimisticCard(draft)
  set(boardAtom, { ...board, cards: [...board.cards, optimistic] })
  set(traceAtom, trace(get, "createCardAtom inserted an optimistic card"))
  set(pendingAtom, true)
  set(errorAtom, null)
  set(failNextAtom, false)
  try {
    const created = await boardApi.createCard(draft.columnId, draft.title, fail)
    const current = get(boardAtom) ?? board
    set(boardAtom, {
      ...current,
      cards: current.cards.map((card) => (card.id === optimistic.id ? created : card)),
    })
    set(draftAtom, null)
    set(traceAtom, trace(get, "createCardAtom swapped in the server card"))
    set(activityAtom, await boardApi.getActivity(0))
  } catch (error) {
    const current = get(boardAtom) ?? board
    set(boardAtom, { ...current, cards: current.cards.filter((card) => card.id !== optimistic.id) })
    set(traceAtom, trace(get, "createCardAtom removed the optimistic card"))
    set(errorAtom, errorMessage(error))
  } finally {
    set(pendingAtom, false)
  }
})

export const saveBufferAtom = atom(null, async (get, set, cardId: string) => {
  const buffer = get(cardBufferFamily(cardId))
  const board = get(boardAtom)
  if (!buffer || get(pendingAtom)) return
  const fail = get(failNextAtom)
  if (board) set(boardAtom, replaceCard(board, cardId, buffer))
  set(pendingAtom, true)
  set(errorAtom, null)
  set(failNextAtom, false)
  try {
    const saved = await boardApi.updateCard(cardId, buffer, fail)
    const current = get(boardAtom) ?? board
    if (current) set(boardAtom, replaceCard(current, cardId, saved))
    set(activityAtom, await boardApi.getActivity(0))
  } catch (error) {
    if (board) set(boardAtom, board)
    set(errorAtom, errorMessage(error))
  } finally {
    set(pendingAtom, false)
  }
})

export const loadActivityAtom = atom(null, async (get, set) => {
  const page = get(activityAtom)
  if (page.nextCursor === null || get(activityLoadingAtom)) return
  set(activityLoadingAtom, true)
  set(activityErrorAtom, null)
  try {
    const next = await boardApi.getActivity(page.nextCursor)
    const current = get(activityAtom)
    set(activityAtom, { items: [...current.items, ...next.items], nextCursor: next.nextCursor })
  } catch (error) {
    set(activityErrorAtom, errorMessage(error))
  } finally {
    set(activityLoadingAtom, false)
  }
})
