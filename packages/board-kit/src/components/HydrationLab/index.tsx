import { formatStamp } from "../../helpers/domain"
import { FailNextToggle } from "../FailNextToggle"
import { TraceList } from "../TraceList"
import type { HydrationLabProps } from "./types"

export function HydrationLab({
  library,
  snapshotAt,
  clientMoves,
  draftTitle,
  replayCount,
  note,
  storageNote,
  boardRenders,
  trace,
  failNext,
  onReplay,
  onFailNext,
}: HydrationLabProps) {
  const draftLabel = draftTitle.trim() || "—"

  return (
    <section className="lab" aria-label="Hydration lab">
      <div className="lab-grid">
        <div className="metric">
          <p className="eyebrow">{library} snapshot</p>
          <p className="lab-value">{formatStamp(snapshotAt)}</p>
        </div>
        <div className="metric">
          <p className="eyebrow">Local moves</p>
          <p className="lab-value">{clientMoves}</p>
        </div>
        <div className="metric">
          <p className="eyebrow">Draft</p>
          <p className="lab-value">{draftLabel}</p>
        </div>
        <div className="metric">
          <p className="eyebrow">Replay attempts</p>
          <p className="lab-value">{replayCount}</p>
        </div>
      </div>
      <p className="lab-note">{note}</p>
      <p className="lab-note muted">{storageNote}</p>
      <p className="lab-note">
        Board renders <span className="renders">{boardRenders}</span>. A column or card badge counts only that block.
      </p>
      <TraceList {...{ trace }} />
      <div className="lab-actions">
        <button type="button" onClick={onReplay}>
          Replay server snapshot
        </button>
        <FailNextToggle {...{ onFailNext }} checked={failNext} />
      </div>
    </section>
  )
}
