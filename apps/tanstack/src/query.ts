import { boardApi, type ActivityPage } from "@board/kit"
import { queryOptions } from "@tanstack/react-query"
import type { ActivityPageParam } from "@/types"

export const boardKey = ["board"] as const
export const activityKey = ["activity"] as const

export const boardQuery = queryOptions({
  queryKey: boardKey,
  queryFn: () => boardApi.getBoard(),
})

export function activityQueryOptions() {
  return {
    queryKey: activityKey,
    queryFn: ({ pageParam }: ActivityPageParam) => boardApi.getActivity(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last: ActivityPage) => last.nextCursor ?? undefined,
  }
}

export function cardKey(id: string) {
  return ["card", id] as const
}

export function cardQuery(id: string) {
  return queryOptions({
    queryKey: cardKey(id),
    queryFn: () => boardApi.getCard(id),
  })
}
