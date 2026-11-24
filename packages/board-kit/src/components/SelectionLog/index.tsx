import type { SelectionLogProps } from "./types"

export function SelectionLog({ lines }: SelectionLogProps) {
  return (
    <aside className="log" aria-label="Selection log">
      <h2>Selection log</h2>
      {lines.length === 0 ? <p className="muted">Nothing selected yet.</p> : null}
      <ol>
        {lines.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ol>
    </aside>
  )
}
