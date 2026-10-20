import { STATUS_LABELS } from '../../constants/status.js'

function StatusPill({ status }) {
  const normalized = STATUS_LABELS[status] ? status : 'draft'

  return (
    <span className={`ea-status ea-status--${normalized}`}>
      {STATUS_LABELS[normalized]}
    </span>
  )
}

export default StatusPill
