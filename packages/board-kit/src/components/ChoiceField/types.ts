export type ChoiceFieldProps = {
  label: string
  value: string
  allLabel: string
  options: readonly string[]
  onValue: (value: string) => void
}
