"use client"

type ErrorPageProps = {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="detail">
      <h1>Something broke</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
