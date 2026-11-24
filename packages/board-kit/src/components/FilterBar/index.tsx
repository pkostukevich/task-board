import { ASSIGNEES, LABELS } from "../../helpers/domain"
import type { Filters } from "../../types"
import { ChoiceField } from "../ChoiceField"
import { SearchField } from "../SearchField"
import { formatStats } from "./helpers"
import type { FilterBarProps } from "./types"

export function FilterBar({ filters, stats, onChange }: FilterBarProps) {
  const { query, assignee, label } = filters

  function handleQuery(next: string) {
    onChange({ ...filters, query: next })
  }

  function handleAssignee(next: string) {
    onChange({ ...filters, assignee: next as Filters["assignee"] })
  }

  function handleLabel(next: string) {
    onChange({ ...filters, label: next as Filters["label"] })
  }

  return (
    <section className="filters" aria-label="Filters">
      <SearchField {...{ query }} onQuery={handleQuery} />
      <ChoiceField label="Assignee" value={assignee} allLabel="Everyone" options={ASSIGNEES} onValue={handleAssignee} />
      <ChoiceField label="Label" value={label} allLabel="All labels" options={LABELS} onValue={handleLabel} />
      <p className="stats">{formatStats(stats)}</p>
    </section>
  )
}
