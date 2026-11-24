"use client"

import { boardApi, errorMessage, moveCardLocal, optimisticCard, replaceCard, type Board, type Card } from "@board/kit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { activityKey, boardKey, cardKey } from "@/query"
import { useUi } from "@/state/provider"
import type { CreateVars, MoveVars, SaveVars } from "@/types"

export function useMoveCard() {
  const queryClient = useQueryClient()
  const { ui } = useUi()
  const { actions } = ui

  return useMutation({
    mutationFn: ({ cardId, toColumnId, fail }: MoveVars) => boardApi.moveCard(cardId, toColumnId, fail),
    onMutate: async ({ cardId, toColumnId }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<Board>(boardKey)
      if (previous) {
        queryClient.setQueryData<Board>(boardKey, moveCardLocal(previous, cardId, toColumnId))
      }
      actions.setPending(true)
      actions.setError(null)
      actions.setFailNext(false)
      actions.pushTrace("onMutate wrote the board with setQueryData")
      actions.bumpMoves(1)
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous)
      actions.pushTrace("onError restored the previous query cache")
      if (context) actions.bumpMoves(-1)
      actions.setError(errorMessage(error))
      actions.setPending(false)
    },
    onSuccess: (next) => {
      queryClient.setQueryData(boardKey, next)
      actions.pushTrace("onSuccess stored the server board in the query cache")
      actions.setPending(false)
      actions.endDrag()
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: activityKey })
    },
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  const { ui } = useUi()
  const { actions } = ui

  return useMutation({
    mutationFn: ({ columnId, title, fail }: CreateVars) => boardApi.createCard(columnId, title, fail),
    onMutate: async ({ columnId, title }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<Board>(boardKey)
      const optimistic = optimisticCard({ columnId, title })
      if (previous) {
        queryClient.setQueryData<Board>(boardKey, { ...previous, cards: [...previous.cards, optimistic] })
      }
      actions.setPending(true)
      actions.setError(null)
      actions.setFailNext(false)
      actions.pushTrace("onMutate inserted an optimistic card with setQueryData")
      return { previous, optimisticId: optimistic.id }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous)
      actions.pushTrace("onError restored the previous query cache")
      actions.setError(errorMessage(error))
      actions.setPending(false)
    },
    onSuccess: (card, _vars, context) => {
      queryClient.setQueryData<Board>(boardKey, (current) =>
        current
          ? { ...current, cards: current.cards.map((item) => (item.id === context?.optimisticId ? card : item)) }
          : current,
      )
      actions.pushTrace("onSuccess swapped in the server card")
      actions.cancelDraft()
      actions.setPending(false)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: activityKey })
    },
  })
}

export function useSaveCard(id: string) {
  const queryClient = useQueryClient()
  const { ui } = useUi()
  const { actions } = ui
  const key = cardKey(id)

  return useMutation({
    mutationFn: ({ buffer, fail }: SaveVars) => boardApi.updateCard(id, buffer, fail),
    onMutate: async ({ buffer }) => {
      await queryClient.cancelQueries({ queryKey: key })
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previousCard = queryClient.getQueryData<Card>(key)
      const previousBoard = queryClient.getQueryData<Board>(boardKey)
      if (previousCard) {
        queryClient.setQueryData<Card>(key, { ...previousCard, ...buffer })
      }
      if (previousBoard) {
        queryClient.setQueryData<Board>(boardKey, replaceCard(previousBoard, id, buffer))
      }
      actions.setPending(true)
      actions.setError(null)
      actions.setFailNext(false)
      return { previousCard, previousBoard }
    },
    onError: (error, _vars, context) => {
      if (context?.previousCard) queryClient.setQueryData(key, context.previousCard)
      if (context?.previousBoard) queryClient.setQueryData(boardKey, context.previousBoard)
      actions.setError(errorMessage(error))
      actions.setPending(false)
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(key, saved)
      queryClient.setQueryData<Board>(boardKey, (current) =>
        current ? replaceCard(current, saved.id, { title: saved.title, checklist: saved.checklist }) : current,
      )
      actions.replaceBuffer(saved.id, { title: saved.title, checklist: saved.checklist })
      actions.setPending(false)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: activityKey })
    },
  })
}
