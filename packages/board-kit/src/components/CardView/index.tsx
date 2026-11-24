import { CheckRow } from "../CheckRow"
import { TitleField } from "../TitleField"
import type { CardViewProps } from "./types"

export function CardView({
  serverTitle,
  details,
  assignee,
  label,
  points,
  draftTitle,
  checklist,
  saving,
  error,
  detailStatus,
  onDraftTitle,
  onToggleCheck,
  onSave,
  onReloadDetail,
  onBack,
}: CardViewProps) {
  const canSave = !saving && draftTitle.trim().length > 0

  return (
    <article className="detail">
      <button type="button" className="quiet" onClick={onBack}>
        Back to the board
      </button>
      <p className="eyebrow">
        Server title · {label} · {assignee} · {points} pts
      </p>
      <h1>{serverTitle}</h1>
      <p className="lede">{details}</p>
      <TitleField title={draftTitle} onTitle={onDraftTitle} />
      <ul className="checks">
        {checklist.map((item) => (
          <CheckRow key={item.id} {...{ item }} onToggle={onToggleCheck} />
        ))}
      </ul>
      {error ? <p className="banner">{error}</p> : null}
      <div className="row">
        <button type="button" onClick={onSave} disabled={!canSave}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="quiet" onClick={onReloadDetail}>
          Reload detail
        </button>
      </div>
      <p className="lab-note">{detailStatus}</p>
    </article>
  )
}
