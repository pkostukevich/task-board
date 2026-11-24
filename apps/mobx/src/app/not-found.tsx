import { AppHeader } from "@board/kit"

export default function NotFound() {
  return (
    <main>
      <AppHeader library="MobX" port={3002} />
      <p className="pending">That card is not on the board.</p>
    </main>
  )
}
