import type { AppHeaderProps } from "./types"

export function AppHeader({ library, port }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <h1>{library}</h1>
      </div>
      <p className="port">
        <span>localhost:{port}</span>
      </p>
    </header>
  )
}
