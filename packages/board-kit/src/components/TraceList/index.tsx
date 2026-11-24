import type { TraceListProps } from "./types"

export function TraceList({ trace }: TraceListProps) {
  if (trace.length === 0) {
    return (
      <ol className="trace">
        <li className="muted">No mutation yet.</li>
      </ol>
    )
  }

  return (
    <ol className="trace">
      {trace.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ol>
  )
}
