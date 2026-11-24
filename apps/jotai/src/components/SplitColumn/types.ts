import type { Column, ColumnViewBindings } from "@board/kit"
import type { Atom } from "jotai"

export type SplitColumnProps = {
  columnAtom: Atom<Column>
  bindings: ColumnViewBindings
}
