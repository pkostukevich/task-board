import "server-only"
import { parseCreateBody, parseMoveBody, parseUpdateBody, readJson } from "./body"
import { BoardError } from "./errors"
import { boardRepository } from "./repository"

function errorResponse(error: unknown) {
  const status = error instanceof BoardError ? error.status : 400
  const message = error instanceof Error ? error.message : "Request failed"
  return Response.json({ message }, { status })
}

export function readBoard() {
  return boardRepository.getBoard().then((board) => Response.json(board))
}

export async function readCard(id: string) {
  try {
    return Response.json(await boardRepository.getCard(id))
  } catch (error) {
    return errorResponse(error)
  }
}

export async function moveCard(request: Request) {
  try {
    const body = parseMoveBody(await readJson(request))
    const board = await boardRepository.moveCard(body.cardId, body.toColumnId, body.fail)
    return Response.json(board)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function createCard(request: Request) {
  try {
    const body = parseCreateBody(await readJson(request))
    const card = await boardRepository.createCard(body.columnId, body.title, body.fail)
    return Response.json(card)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function updateCard(id: string, request: Request) {
  try {
    const { title, checklist, fail } = parseUpdateBody(await readJson(request))
    const card = await boardRepository.updateCard(id, { title, checklist }, fail)
    return Response.json(card)
  } catch (error) {
    return errorResponse(error)
  }
}

export function readActivity(url: string) {
  const cursor = Number(new URL(url).searchParams.get("cursor") ?? "0")
  const safeCursor = Number.isFinite(cursor) && cursor > 0 ? cursor : 0
  return boardRepository.getActivity(safeCursor).then((page) => Response.json(page))
}
