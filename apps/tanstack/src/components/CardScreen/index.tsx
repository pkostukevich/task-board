"use client"

import { CardView } from "@board/kit"
import { useSelector } from "@tanstack/react-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useSaveCard } from "@/mutations"
import { cardQuery } from "@/query"
import { useUi } from "@/state/provider"
import type { CardScreenProps } from "./types"

export function CardScreen({ id }: CardScreenProps) {
  const { data, refetch, status, isFetching } = useSuspenseQuery(cardQuery(id))
  const { title, details, assignee, label, points, checklist } = data
  const { ui } = useUi()
  const { actions } = ui
  const { ensureBuffer, setBufferTitle, toggleCheck } = actions
  const buffer = useSelector(ui, (state) => state.buffers[id])
  const error = useSelector(ui, (state) => state.error)
  const pending = useSelector(ui, (state) => state.pending)
  const router = useRouter()
  const save = useSaveCard(id)

  useEffect(() => {
    ensureBuffer(data)
  }, [data, ensureBuffer])

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
  const { mutate: saveCard } = save
  const handleSave = useCallback(() => {
    const current = ui.state.buffers[id]
    if (!current) return
    saveCard({ buffer: current, fail: ui.state.failNext })
  }, [id, saveCard, ui])
  const handleReload = useCallback(() => {
    void refetch()
  }, [refetch])
  const handleBack = useCallback(() => {
    router.push("/")
  }, [router])

  const detailStatus = isFetching ? `Query ${status}, fetching` : `Query ${status}`

  return (
    <CardView
      {...{ details, assignee, label, points, error, detailStatus }}
      serverTitle={title}
      draftTitle={buffer?.title ?? title}
      checklist={buffer?.checklist ?? checklist}
      saving={pending || save.isPending}
      onDraftTitle={handleDraftTitle}
      onToggleCheck={handleToggle}
      onSave={handleSave}
      onReloadDetail={handleReload}
      onBack={handleBack}
    />
  )
}
