import type { GhostNodes } from "./types"

export function hideGhost(root: HTMLDivElement) {
  root.style.display = "none"
}

export function showGhost({ root, title, count }: GhostNodes, label: string, x: number, y: number, pointer: number) {
  root.style.display = "block"
  root.style.transform = `translate(${x + 12}px, ${y + 12}px)`
  if (title) title.textContent = label
  if (count) count.textContent = `pointer ${pointer}`
}
