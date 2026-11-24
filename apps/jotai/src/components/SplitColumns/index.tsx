"use client"

import { useAtomValue } from "jotai"
import { SplitColumn } from "@/components/SplitColumn"
import { columnAtomsAtom, columnsAtom } from "@/state/atoms"
import type { SplitColumnsProps } from "./types"

export function SplitColumns({ bindings }: SplitColumnsProps) {
  const atoms = useAtomValue(columnAtomsAtom)
  const columns = useAtomValue(columnsAtom)

  return columns.map((column, index) => {
    const columnAtom = atoms[index]
    if (!columnAtom) return null
    return <SplitColumn key={column.id} {...{ columnAtom, bindings }} />
  })
}
