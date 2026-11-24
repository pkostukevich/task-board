import { AppHeader } from "@board/kit"
import { boardRepository } from "@board/kit/server"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { CardScreen } from "@/components/CardScreen"

export const dynamic = "force-dynamic"

type CardPageProps = {
  params: Promise<{ id: string }>
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })
  try {
    await queryClient.query({
      queryKey: ["card", id],
      queryFn: () => boardRepository.getCard(id),
    })
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <AppHeader library="TanStack" port={3004} />
        <CardScreen {...{ id }} />
      </main>
    </HydrationBoundary>
  )
}
