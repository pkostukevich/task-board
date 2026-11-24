import type { Assignee, ChecklistItem, Label } from "../../types"

export type CardViewProps = {
  serverTitle: string
  details: string
  assignee: Assignee
  label: Label
  points: number
  draftTitle: string
  checklist: ChecklistItem[]
  saving: boolean
  error: string | null
  detailStatus: string
  onDraftTitle: (title: string) => void
  onToggleCheck: (checkId: string) => void
  onSave: () => void
  onReloadDetail: () => void
  onBack: () => void
}
