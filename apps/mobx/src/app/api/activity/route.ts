import { readActivity } from "@board/kit/server"

export const dynamic = "force-dynamic"

export function GET(request: Request) {
  return readActivity(request.url)
}
