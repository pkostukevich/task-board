import { readCard, updateCard } from "@board/kit/server"

export const dynamic = "force-dynamic"

export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => readCard(id))
}

export function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => updateCard(id, request))
}
