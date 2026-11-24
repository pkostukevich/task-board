import "@board/kit/styles.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { boardRepository } from "@board/kit/server"
import { MobxProvider } from "@/state/provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Board · MobX",
  description: "Kanban board state with MobX observables and a one-time hydrate.",
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
      <body data-library="mobx">
        <MobxProvider {...{ board, activity }}>
          {children}
        </MobxProvider>
      </body>
    </html>
  )
}
