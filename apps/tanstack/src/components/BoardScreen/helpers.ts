import type { Activity } from "@board/kit"

export function activityItems(pages: { items: Activity[] }[]) {
  return pages.flatMap((page) => page.items)
}
