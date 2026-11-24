import type { ChangeEvent } from "react"
import type { TitleFieldProps } from "./types"

export function TitleField({ title, onTitle }: TitleFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onTitle(event.target.value)
  }

  return (
    <label className="stack">
      Local title
      <input value={title} onChange={handleChange} />
    </label>
  )
}
