import type { DragEvent, MouseEvent } from "react"
import type { Point } from "../view"

export function dragPoint(event: { clientX: number; clientY: number }): Point {
  const { clientX, clientY } = event
  return { x: clientX, y: clientY }
}

export function preventDragDefault(event: DragEvent) {
  event.preventDefault()
}

export function isPlainClick(event: MouseEvent) {
  const { button, metaKey, ctrlKey, shiftKey, altKey } = event
  return button === 0 && !metaKey && !ctrlKey && !shiftKey && !altKey
}

export function clickHitsControl(event: MouseEvent) {
  const { target } = event
  return target instanceof Element && target.closest("a, button") !== null
}

export function droppedCardId(event: DragEvent) {
  return event.dataTransfer.getData("text/plain")
}
