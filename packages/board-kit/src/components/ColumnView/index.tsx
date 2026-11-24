import { memo, type DragEvent } from "react"
import { droppedCardId, preventDragDefault } from "../../helpers/events"
import { useRenderCount } from "../../helpers/renderCount"
import { AddCardButton } from "../AddCardButton"
import { CardTile } from "../CardTile"
import { DraftForm } from "../DraftForm"
import { countLabel, sameColumnView } from "./helpers"
import type { ColumnViewProps } from "./types"

function ColumnView({
  column,
  draft,
  pending,
  onSelect,
  onOpen,
  onToggleColumn,
  onMove,
  onDragStart,
  onDragEnd,
  onOpenDraft,
  onDraftTitle,
  onSubmitDraft,
  onCancelDraft,
}: ColumnViewProps) {
  const { id, title, wipLimit, count, overLimit, collapsed, cards } = column
  const renders = useRenderCount()
  const ownsDraft = draft?.columnId === id

  function handleDrop(event: DragEvent<HTMLElement>) {
    preventDragDefault(event)
    const cardId = droppedCardId(event)
    if (cardId) onMove(cardId, id)
    onDragEnd()
  }

  function handleToggle() {
    onToggleColumn(id)
  }

  function handleOpenDraft() {
    onOpenDraft(id)
  }

  return (
    <section
      className={overLimit ? "column over-limit" : "column"}
      data-column={id}
      onDragOver={preventDragDefault}
      onDrop={handleDrop}
    >
      <header className="column-head">
        <div>
          <h2>{title}</h2>
          <p className="count">
            {countLabel(count, wipLimit)}
            <span className="renders" key={renders}>
              render {renders}
            </span>
          </p>
        </div>
        <button type="button" onClick={handleToggle}>
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </header>
      {collapsed ? null : (
        <ul className="cards">
          {cards.map((card) => (
            <li key={card.id}>
              <CardTile {...{ card, onSelect, onOpen, onDragStart, onDragEnd }} />
            </li>
          ))}
        </ul>
      )}
      {ownsDraft && draft ? (
        <DraftForm
          {...{ pending }}
          title={draft.title}
          onTitle={onDraftTitle}
          onSubmit={onSubmitDraft}
          onCancel={onCancelDraft}
        />
      ) : (
        <AddCardButton onAdd={handleOpenDraft} />
      )}
    </section>
  )
}

const MemoColumnView = memo(ColumnView, sameColumnView)

export { MemoColumnView as ColumnView }
