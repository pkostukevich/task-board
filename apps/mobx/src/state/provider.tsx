"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { BoardStore, createBoardStore } from "./store"
import type { ActivityPage, Board } from "@board/kit"

const StoreContext = createContext<BoardStore | null>(null)

export function useBoardStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error("BoardStore is missing")
  return store
}

type MobxProviderProps = {
  board: Board
  activity: ActivityPage
  children: ReactNode
}

export function MobxProvider({ board, activity, children }: MobxProviderProps) {
  const [store] = useState(() => createBoardStore(board, activity))
  useEffect(() => {
    store.restoreFilters()
  }, [store])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
