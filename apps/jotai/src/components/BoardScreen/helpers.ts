"use client"

import type { Point } from "@board/kit"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { collapsedAtom, draftAtom, draggingAtom, errorAtom, filtersAtom, selectedCardIdAtom } from "@/state/atoms"
import { createCardAtom, loadActivityAtom, moveCardAtom } from "@/state/commands"
import { useReplayHydration } from "@/state/provider"

export function useBoardCommands() {
  const moveCard = useSetAtom(moveCardAtom)
  const createCard = useSetAtom(createCardAtom)
  const loadActivity = useSetAtom(loadActivityAtom)
  const setFilters = useSetAtom(filtersAtom)
  const setDraft = useSetAtom(draftAtom)
  const setSelected = useSetAtom(selectedCardIdAtom)
  const setCollapsed = useSetAtom(collapsedAtom)
  const setDragging = useSetAtom(draggingAtom)
  const setError = useSetAtom(errorAtom)
  const replay = useReplayHydration()
  const router = useRouter()

  const openCard = useCallback(
    (cardId: string) => {
      router.push(`/cards/${cardId}`)
    },
    [router],
  )

  const toggleColumn = useCallback(
    (columnId: string) => {
      setCollapsed((current) => ({ ...current, [columnId]: !current[columnId] }))
    },
    [setCollapsed],
  )

  const move = useCallback(
    (cardId: string, toColumnId: string) => {
      void moveCard({ cardId, toColumnId })
    },
    [moveCard],
  )

  const startDrag = useCallback(
    (cardId: string, point: Point) => {
      const { x, y } = point
      setDragging({ cardId, x, y })
    },
    [setDragging],
  )

  const moveDrag = useCallback(
    (point: Point) => {
      const { x, y } = point
      setDragging((current) => (current ? { ...current, x, y } : current))
    },
    [setDragging],
  )

  const endDrag = useCallback(() => {
    setDragging(null)
  }, [setDragging])

  const openDraft = useCallback(
    (columnId: string) => {
      setDraft({ columnId, title: "" })
    },
    [setDraft],
  )

  const setDraftTitle = useCallback(
    (title: string) => {
      setDraft((current) => (current ? { ...current, title } : current))
    },
    [setDraft],
  )

  const submitDraft = useCallback(() => {
    void createCard()
  }, [createCard])

  const cancelDraft = useCallback(() => {
    setDraft(null)
  }, [setDraft])

  const dismissError = useCallback(() => {
    setError(null)
  }, [setError])

  const loadMore = useCallback(() => {
    void loadActivity()
  }, [loadActivity])

  return {
    setFilters,
    setSelected,
    replay,
    openCard,
    toggleColumn,
    move,
    startDrag,
    moveDrag,
    endDrag,
    openDraft,
    setDraftTitle,
    submitDraft,
    cancelDraft,
    dismissError,
    loadMore,
  }
}
