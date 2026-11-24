import type { ChecklistItem } from "../../types"

export type CheckRowProps = {
  item: ChecklistItem
  onToggle: (checkId: string) => void
}
