import { cardSame } from "../../helpers/equality"
import type { CardTileProps } from "./types"

export function cardClassName(selected: boolean, dragging: boolean) {
  if (selected) return "card selected"
  if (dragging) return "card dragging"
  return "card"
}

export function sameTile(prev: CardTileProps, next: CardTileProps) {
  return cardSame(prev.card, next.card)
}
