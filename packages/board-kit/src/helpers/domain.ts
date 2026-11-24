import type { Assignee, Filters, Label } from "../types"

export const ASSIGNEES = ["alex", "sam", "riley"] as const satisfies readonly Assignee[]
export const LABELS = ["bug", "feature", "chore"] as const satisfies readonly Label[]

export const defaultFilters: Filters = {
  query: "",
  assignee: "all",
  label: "all",
}

export function isFilters(value: unknown): value is Filters {
  if (!value || typeof value !== "object") return false
  const candidate = value as Filters
  const assigneeOk = candidate.assignee === "all" || ASSIGNEES.some((item) => item === candidate.assignee)
  const labelOk = candidate.label === "all" || LABELS.some((item) => item === candidate.label)
  return typeof candidate.query === "string" && assigneeOk && labelOk
}

export function formatStamp(iso: string) {
  return `${iso.replace("T", " ").replace(/\..+Z$/, "")} UTC`
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed"
}
