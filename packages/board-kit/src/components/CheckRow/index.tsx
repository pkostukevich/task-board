import type { CheckRowProps } from "./types"

export function CheckRow({ item, onToggle }: CheckRowProps) {
  const { id, done, text } = item

  function handleChange() {
    onToggle(id)
  }

  return (
    <li>
      <label>
        <input type="checkbox" checked={done} onChange={handleChange} />
        <span>{text}</span>
      </label>
    </li>
  )
}
