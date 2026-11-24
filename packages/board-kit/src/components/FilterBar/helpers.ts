import type { BoardStats } from "../../view"

export function formatStats({ visible, points, overLimit }: BoardStats) {
  const summary = `${visible} visible · ${points} pts`
  if (overLimit.length === 0) return summary
  return `${summary} · over limit: ${overLimit.join(", ")}`
}
