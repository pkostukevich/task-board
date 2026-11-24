import type { ChangeEvent } from "react"
import type { FailNextToggleProps } from "./types"

export function FailNextToggle({ checked, onFailNext }: FailNextToggleProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFailNext(event.target.checked)
  }

  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={handleChange} />
      Reject the next server call
    </label>
  )
}
