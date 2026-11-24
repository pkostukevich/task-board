import type { CardModel, Point } from "../../view"

export type CardTileProps = {
  card: CardModel
  onSelect: (cardId: string) => void
  onOpen: (cardId: string) => void
  onDragStart: (cardId: string, point: Point) => void
  onDragEnd: () => void
}
