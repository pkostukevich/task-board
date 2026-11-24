import { AppHeader } from "@board/kit"

export default function NotFound() {
  return (
    <main>
      <AppHeader library="Jotai" port={3001} />
      <p className="pending">That card is not on the board.</p>
    </main>
  )
}
