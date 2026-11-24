import { AppHeader } from "@board/kit"
import { BoardScreen } from "@/components/BoardScreen"

export default function Page() {
  return (
    <main>
      <AppHeader library="TanStack" port={3004} />
      <BoardScreen />
    </main>
  )
}
