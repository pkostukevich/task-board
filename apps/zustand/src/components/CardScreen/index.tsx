"use client"

import { CardView } from "@board/kit"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useBoardStore, useBoardStoreApi } from "@/state/provider"
import type { CardScreenProps } from "./types"

export function CardScreen({ card }: CardScreenProps) {
  const { id, title, details, assignee, label, points, checklist } = card
  const api = useBoardStoreApi()
  const buffer = useBoardStore((state) => state.buffers[id])
  const detailStatus = useBoardStore((state) => state.detailStatus)
  const error = useBoardStore((state) => state.error)
  const pending = useBoardStore((state) => state.pending)
  const router = useRouter()
  const { ensureBuffer, setBufferTitle, toggleCheck, saveBuffer, reloadDetail } = api.getState()

  useEffect(() => {
    ensureBuffer(card)
  }, [card, ensureBuffer])

  const handleDraftTitle = useCallback(
    (next: string) => {
      setBufferTitle(id, next)
    },
    [id, setBufferTitle],
  )
  const handleToggle = useCallback(
    (checkId: string) => {
      toggleCheck(id, checkId)
    },
    [id, toggleCheck],
  )
  const handleSave = useCallback(() => {
    void saveBuffer(id)
  }, [id, saveBuffer])
  const handleReload = useCallback(() => {
    void reloadDetail(id)
  }, [id, reloadDetail])
  const handleBack = useCallback(() => {
    router.push("/")
  }, [router])

  return (
    <CardView
      {...{ details, assignee, label, points, error, detailStatus }}
      serverTitle={title}
      draftTitle={buffer?.title ?? title}
      checklist={buffer?.checklist ?? checklist}
      saving={pending}
      onDraftTitle={handleDraftTitle}
      onToggleCheck={handleToggle}
      onSave={handleSave}
      onReloadDetail={handleReload}
      onBack={handleBack}
    />
  )
}
