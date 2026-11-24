import { AppHeader } from "@board/kit"
import { BoardScreen } from "@/components/BoardScreen"

export default function Page() {
  return (
    <main>
      <AppHeader library="MobX" port={3002} />
      <BoardScreen />
    </main>
  )
}
