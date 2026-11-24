import "@board/kit/styles.css"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import type { Metadata } from "next"
import type { ActivityPage } from "@board/kit"
import type { ReactNode } from "react"
import { boardRepository } from "@board/kit/server"
import { TanstackProvider } from "@/state/provider"
import type { ActivityPageParam } from "@/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Board · TanStack",
  description: "Kanban board with TanStack Query for the server snapshot and TanStack Store for client state.",
}

type LayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: LayoutProps) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })
  await queryClient.query({
    queryKey: ["board"],
    queryFn: () => boardRepository.getBoard(),
  })
  await queryClient.infiniteQuery({
    queryKey: ["activity"],
    queryFn: ({ pageParam }: ActivityPageParam) => boardRepository.getActivity(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last: ActivityPage) => last.nextCursor ?? undefined,
  })

  return (
    <html lang="en">
      <body data-library="tanstack">
        <TanstackProvider state={dehydrate(queryClient)}>{children}</TanstackProvider>
      </body>
    </html>
  )
}
