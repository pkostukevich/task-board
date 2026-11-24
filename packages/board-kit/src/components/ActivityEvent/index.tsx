import { formatStamp } from "../../helpers/domain"
import type { ActivityEventProps } from "./types"

export function ActivityEvent({ item }: ActivityEventProps) {
  const { at, message } = item
  return (
    <li className="event">
      <time dateTime={at}>{formatStamp(at)}</time>
      <p>{message}</p>
    </li>
  )
}
