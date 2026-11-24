import { memo, type DragEvent, type MouseEvent } from "react"
import { clickHitsControl, dragPoint, isPlainClick } from "../../helpers/events"
import { useRenderCount } from "../../helpers/renderCount"
import { cardClassName, sameTile } from "./helpers"
import type { CardTileProps } from "./types"

function CardTile({ card, onSelect, onOpen, onDragStart, onDragEnd }: CardTileProps) {
  const { id, title, href, assignee, label, points, selected, dragging } = card
  const renders = useRenderCount()

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData("text/plain", id)
    event.dataTransfer.effectAllowed = "move"
    onDragStart(id, dragPoint(event))
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (clickHitsControl(event)) return
    onSelect(id)
  }

  function handleOpen(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return
    event.preventDefault()
    onOpen(id)
  }

  return (
    <article
      className={cardClassName(selected, dragging)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      <div className="card-top">
        <span className={`label label-${label}`}>{label}</span>
        <span className="renders" key={renders}>
          render {renders}
        </span>
        <span>{points} pts</span>
      </div>
      <h3>{title}</h3>
      <div className="card-foot">
        <span className="who">
          <span className="avatar" aria-hidden="true">
            {assignee.slice(0, 1)}
          </span>
          {assignee}
        </span>
        <a className="open" href={href} onClick={handleOpen}>
          Open
        </a>
      </div>
    </article>
  )
}

const MemoCardTile = memo(CardTile, sameTile)

export { MemoCardTile as CardTile }
