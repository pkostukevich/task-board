"use client"

import type { ActivityPage, Board } from "@board/kit"
import { createStore, Provider, useAtomValue, useSetAtom } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import {
  activityAtom,
  boardAtom,
  filtersAtom,
  filtersReadyAtom,
  hydrateReplaysAtom,
  readStoredFilters,
  selectionEffectAtom,
} from "./atoms"

const ReplayContext = createContext<() => void>(() => {})

let browserStore: ReturnType<typeof createStore> | undefined

function makeStore() {
  if (typeof window === "undefined") return createStore()
  return (browserStore ??= createStore())
}

export function useReplayHydration() {
  return useContext(ReplayContext)
}

type JotaiProviderProps = {
  board: Board
  activity: ActivityPage
  children: ReactNode
}

export function JotaiProvider({ board, activity, children }: JotaiProviderProps) {
  const [store] = useState(makeStore)
  const [attempt, setAttempt] = useState(0)
  const replay = useCallback(() => {
    setAttempt((value) => value + 1)
  }, [])
  return (
    <Provider store={store}>
      <ReplayContext.Provider value={replay}>
        <Hydrate {...{ board, activity, attempt }}>
          {children}
        </Hydrate>
      </ReplayContext.Provider>
    </Provider>
  )
}

type HydrateProps = {
  board: Board
  activity: ActivityPage
  attempt: number
  children: ReactNode
}

function Hydrate({ board, activity, attempt, children }: HydrateProps) {
  const stamped =
    attempt === 0
      ? board
      : { ...board, title: `${board.title} · replay ${attempt}`, snapshotAt: new Date(0).toISOString() }
  useHydrateAtoms([
    [boardAtom, stamped],
    [activityAtom, activity],
  ] as const)
  useAtomValue(selectionEffectAtom)
  const setReplays = useSetAtom(hydrateReplaysAtom)
  const setFilters = useSetAtom(filtersAtom)
  const setReady = useSetAtom(filtersReadyAtom)

  useEffect(() => {
    const stored = readStoredFilters()
    const changed =
      stored.query !== "" || stored.assignee !== "all" || stored.label !== "all"
    if (changed) setFilters(stored)
    setReady(true)
  }, [setFilters, setReady])

  useEffect(() => {
    if (attempt > 0) setReplays(attempt)
  }, [attempt, setReplays])

  return children
}
