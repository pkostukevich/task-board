import type { ActivityPage, Board, Card, CardPatch } from "../types"
import { errorMessage } from "../helpers/domain"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  })
  const body = (await response.json().catch(() => ({}))) as T & { message?: string }
  if (!response.ok) {
    throw new Error(body.message || errorMessage(body) || response.statusText)
  }
  return body
}

export const boardApi = {
  getBoard() {
    return request<Board>("/api/board")
  },
  getCard(id: string) {
    return request<Card>(`/api/cards/${id}`)
  },
  moveCard(cardId: string, toColumnId: string, fail = false) {
    return request<Board>("/api/board/move", {
      method: "POST",
      body: JSON.stringify({ cardId, toColumnId, fail }),
    })
  },
  createCard(columnId: string, title: string, fail = false) {
    return request<Card>("/api/cards", {
      method: "POST",
      body: JSON.stringify({ columnId, title, fail }),
    })
  },
  updateCard(id: string, patch: CardPatch, fail = false) {
    return request<Card>(`/api/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...patch, fail }),
    })
  },
  getActivity(cursor: number) {
    return request<ActivityPage>(`/api/activity?cursor=${cursor}`)
  },
}
