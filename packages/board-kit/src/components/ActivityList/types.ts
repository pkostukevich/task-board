import type { Activity } from "../../types"

export type ActivityListProps = {
  items: Activity[]
  hasNext: boolean
  loading: boolean
  error: string | null
  onLoadMore: () => void
}
