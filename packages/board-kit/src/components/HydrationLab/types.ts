export type HydrationLabProps = {
  library: string
  snapshotAt: string
  clientMoves: number
  draftTitle: string
  replayCount: number
  note: string
  storageNote: string
  boardRenders: number
  trace: string[]
  failNext: boolean
  onReplay: () => void
  onFailNext: (value: boolean) => void
}
