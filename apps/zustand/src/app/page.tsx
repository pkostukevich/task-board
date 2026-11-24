import { AppHeader } from "@board/kit"
import { BoardScreen } from "@/components/BoardScreen"

export default function Page() {
  return (
    <main>
      <AppHeader library="Zustand" port={3003} />
      <BoardScreen />
    </main>
  )
}
