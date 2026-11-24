"use client"

import { CardView } from "@board/kit"
import { observer } from "mobx-react-lite"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useBoardStore } from "@/state/provider"
import type { CardScreenProps } from "./types"

export const CardScreen = observer(function CardScreen({ card }: CardScreenProps) {
  const { id, title, details, assignee, label, points, checklist } = card
  const store = useBoardStore()
  const router = useRouter()
  const { pending, error, detailStatus, ensureBuffer, setBufferTitle, toggleCheck, saveBuffer, reloadDetail, watchCard } =
    store
  useState(() => watchCard(id))
  const observed = store.cardDetails.get(id)
  const buffer = store.buffers.get(id)

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
    reloadDetail(id)
  }, [id, reloadDetail])
  const handleBack = useCallback(() => {
    router.push("/")
  }, [router])

  const status = observed ? `${detailStatus} · map key ${observed.id}` : detailStatus

  return (
    <CardView
      {...{ details, assignee, label, points, error }}
      serverTitle={title}
      draftTitle={buffer?.title ?? title}
      checklist={buffer?.checklist ?? checklist}
      saving={pending}
      detailStatus={status}
      onDraftTitle={handleDraftTitle}
      onToggleCheck={handleToggle}
      onSave={handleSave}
      onReloadDetail={handleReload}
      onBack={handleBack}
    />
  )
})
