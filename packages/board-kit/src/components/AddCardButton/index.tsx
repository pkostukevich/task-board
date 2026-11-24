import type { AddCardButtonProps } from "./types"

export function AddCardButton({ onAdd }: AddCardButtonProps) {
  return (
    <button type="button" className="quiet" onClick={onAdd}>
      Add a card
    </button>
  )
}
