import { AppHeader } from "@board/kit"
import { BoardScreen } from "@/components/BoardScreen"

export default function Page() {
  return (
    <main>
      <AppHeader library="Jotai" port={3001} />
      <BoardScreen />
    </main>
  )
}
