import type { ChangeEvent } from "react"
import type { ChoiceFieldProps } from "./types"

export function ChoiceField({ label, value, allLabel, options, onValue }: ChoiceFieldProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onValue(event.target.value)
  }

  return (
    <label>
      {label}
      <select value={value} onChange={handleChange}>
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
