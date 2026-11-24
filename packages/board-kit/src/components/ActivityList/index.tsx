import { ActivityEvent } from "../ActivityEvent"
import type { ActivityListProps } from "./types"

export function ActivityList({ items, hasNext, loading, error, onLoadMore }: ActivityListProps) {
  return (
    <aside className="activity" aria-label="Activity">
      <h2>Activity</h2>
      {items.length === 0 ? <p className="muted">No events yet.</p> : null}
      <ol>
        {items.map((item) => (
          <ActivityEvent key={item.id} {...{ item }} />
        ))}
      </ol>
      {error ? <p className="banner">{error}</p> : null}
      {hasNext ? (
        <button type="button" onClick={onLoadMore} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      ) : (
        <p className="muted">End of the log.</p>
      )}
    </aside>
  )
}
