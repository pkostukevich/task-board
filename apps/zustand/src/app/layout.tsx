import "@board/kit/styles.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { boardRepository } from "@board/kit/server"
import { BoardStoreProvider } from "@/state/provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Board · Zustand",
  description: "Kanban board state with a per-request Zustand store.",
}

type LayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: LayoutProps) {
  const [board, activity] = await Promise.all([
    boardRepository.getBoard(),
    boardRepository.getActivity(0),
  ])

  return (
    <html lang="en">
      <body data-library="zustand">
        <BoardStoreProvider {...{ board, activity }}>
          {children}
        </BoardStoreProvider>
      </body>
    </html>
  )
}
