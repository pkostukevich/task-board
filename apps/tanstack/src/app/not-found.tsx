import { AppHeader } from "@board/kit"

export default function NotFound() {
  return (
    <main>
      <AppHeader library="TanStack" port={3004} />
      <p className="pending">That card is not on the board.</p>
    </main>
  )
}
