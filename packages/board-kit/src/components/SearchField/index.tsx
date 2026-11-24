import type { ChangeEvent } from "react"
import type { SearchFieldProps } from "./types"

export function SearchField({ query, onQuery }: SearchFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onQuery(event.target.value)
  }

  return (
    <label>
      Search
      <input value={query} placeholder="Card title" onChange={handleChange} />
    </label>
  )
}
