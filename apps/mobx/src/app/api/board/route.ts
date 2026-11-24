import { readBoard } from "@board/kit/server"

export const dynamic = "force-dynamic"

export function GET() {
  return readBoard()
}
