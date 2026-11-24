import type { ErrorBannerProps } from "./types"

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <p className="banner" role="alert">
      {message}
      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </p>
  )
}
