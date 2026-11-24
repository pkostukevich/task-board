import { ActivityList } from "../ActivityList"
import { SelectionLog } from "../SelectionLog"
import type { BoardSideProps } from "./types"

export function BoardSide({ items, hasNext, loading, error, onLoadMore, lines }: BoardSideProps) {
  return (
    <div className="side">
      <ActivityList {...{ items, hasNext, loading, error, onLoadMore }} />
      <SelectionLog {...{ lines }} />
    </div>
  )
}
