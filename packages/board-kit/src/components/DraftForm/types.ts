export type DraftFormProps = {
  title: string
  pending: boolean
  onTitle: (title: string) => void
  onSubmit: () => void
  onCancel: () => void
}
