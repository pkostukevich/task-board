import { moveCard } from "@board/kit/server"

export const dynamic = "force-dynamic"

export function POST(request: Request) {
  return moveCard(request)
}
