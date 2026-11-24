export class BoardError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "BoardError"
    this.status = status
  }
}
