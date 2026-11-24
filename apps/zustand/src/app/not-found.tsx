import { AppHeader } from "@board/kit"

export default function NotFound() {
  return (
    <main>
      <AppHeader library="Zustand" port={3003} />
      <p className="pending">That card is not on the board.</p>
    </main>
  )
}
