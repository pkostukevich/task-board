"use client"

import type { ActivityPage, Board } from "@board/kit"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useStore } from "zustand"
import { createBoardStore } from "./store"
import type { BoardStore, BoardStoreApi } from "./types"

const StoreContext = createContext<BoardStoreApi | null>(null)

let browserStore: BoardStoreApi | undefined

function makeStore(board: Board, activity: ActivityPage) {
  if (typeof window === "undefined") return createBoardStore(board, activity)
  return (browserStore ??= createBoardStore(board, activity))
}

export function useBoardStoreApi() {
  const store = useContext(StoreContext)
  if (!store) throw new Error("Board store is missing")
  return store
}

export function useBoardStore<T>(selector: (state: BoardStore) => T) {
  return useStore(useBoardStoreApi(), selector)
}

type BoardStoreProviderProps = {
  board: Board
  activity: ActivityPage
  children: ReactNode
}

export function BoardStoreProvider({ board, activity, children }: BoardStoreProviderProps) {
  const [store] = useState(() => makeStore(board, activity))
  useEffect(() => {
    void Promise.resolve(store.persist.rehydrate()).then(() => {
      store.getState().markFiltersReady()
    })
    return store.subscribe(
      (state) => state.selectedCardId,
      (selectedId) => store.getState().noteSelection(selectedId),
    )
  }, [store])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
