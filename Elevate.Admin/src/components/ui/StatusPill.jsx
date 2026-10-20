import { getStatusLabel, toStatusKey } from '../../constants/status.js'

function StatusPill({ status }) {
  return (
    <span className={`ea-status ea-status--${toStatusKey(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

export default StatusPill
