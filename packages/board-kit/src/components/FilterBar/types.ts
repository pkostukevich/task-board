import type { Filters } from "../../types"
import type { BoardStats } from "../../view"

export type FilterBarProps = {
  filters: Filters
  stats: BoardStats
  onChange: (filters: Filters) => void
}
