"use client"

import { CardView } from "@board/kit"
import { useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { cardBufferFamily, detailRequestAtom, detailStatusAtom, errorAtom, pendingAtom } from "@/state/atoms"
import { bufferTitleAtom, initBufferAtom, saveBufferAtom, toggleCheckAtom } from "@/state/commands"
import { detailLabel } from "./helpers"
import type { CardScreenProps } from "./types"

export function CardScreen({ card }: CardScreenProps) {
  const { id, title, details, assignee, label, points, checklist } = card
  const buffer = useAtomValue(cardBufferFamily(id))
  const request = useAtomValue(detailRequestAtom)
  const detail = useAtomValue(detailStatusAtom)
  const error = useAtomValue(errorAtom)
  const saving = useAtomValue(pendingAtom)
  const initBuffer = useSetAtom(initBufferAtom)
  const setTitle = useSetAtom(bufferTitleAtom)
  const toggleCheck = useSetAtom(toggleCheckAtom)
  const save = useSetAtom(saveBufferAtom)
  const setRequest = useSetAtom(detailRequestAtom)
  const router = useRouter()

  useEffect(() => {
    initBuffer(card)
  }, [card, initBuffer])

  const handleDraftTitle = useCallback(
    (next: string) => {
      setTitle({ cardId: id, title: next })
    },
    [id, setTitle],
  )

  const handleToggle = useCallback(
    (checkId: string) => {
      toggleCheck({ cardId: id, checkId })
    },
    [id, toggleCheck],
  )

  const handleSave = useCallback(() => {
    void save(id)
  }, [id, save])

  const handleReload = useCallback(() => {
    const nonce = (request?.nonce ?? 0) + 1
    setRequest({ id, nonce })
  }, [id, request, setRequest])

  const handleBack = useCallback(() => {
    router.push("/")
  }, [router])

  const draftTitle = buffer?.title ?? title
  const checks = buffer?.checklist ?? checklist

  return (
    <CardView
      {...{ details, assignee, label, points, draftTitle, saving, error }}
      serverTitle={title}
      checklist={checks}
      detailStatus={detailLabel(request, detail)}
      onDraftTitle={handleDraftTitle}
      onToggleCheck={handleToggle}
      onSave={handleSave}
      onReloadDetail={handleReload}
      onBack={handleBack}
    />
  )
}
