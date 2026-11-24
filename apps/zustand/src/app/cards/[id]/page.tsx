import { AppHeader } from "@board/kit"
import { boardRepository } from "@board/kit/server"
import { notFound } from "next/navigation"
import { CardScreen } from "@/components/CardScreen"

export const dynamic = "force-dynamic"

type CardPageProps = {
  params: Promise<{ id: string }>
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params
  try {
    const card = await boardRepository.getCard(id)
    return (
      <main>
        <AppHeader library="Zustand" port={3003} />
        <CardScreen {...{ card }} />
      </main>
    )
  } catch {
    notFound()
  }
}
