import { errorMessage } from "@board/kit"
import type { DetailStatus } from "@/state/atoms"
import type { DetailRequest } from "@/types"

export function detailLabel(request: DetailRequest | null, detail: DetailStatus) {
  if (!request) return "unwrap is idle until you reload the detail."
  if (detail.state === "loading") return "unwrap: pending"
  if (detail.state === "hasError") return `unwrap: ${errorMessage(detail.error)}`
  return `unwrap: ${detail.data?.title ?? "empty"}`
}
