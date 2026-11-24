import type { ChangeEvent, FormEvent } from "react"
import type { DraftFormProps } from "./types"

export function DraftForm({ title, pending, onTitle, onSubmit, onCancel }: DraftFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  function handleTitle(event: ChangeEvent<HTMLInputElement>) {
    onTitle(event.target.value)
  }

  const canAdd = !pending && title.trim().length > 0

  return (
    <form className="draft" onSubmit={handleSubmit}>
      <input autoFocus value={title} placeholder="Card title" onChange={handleTitle} />
      <div className="row">
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
        <button type="button" className="quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
