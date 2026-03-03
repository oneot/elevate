import { CheckCircle, Edit3, Archive } from 'lucide-react'

const styles = {
  draft: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  published: 'bg-ms-green/10 text-ms-green border-ms-green/20',
  archived: 'bg-neutral-200 text-neutral-500 border-neutral-300',
}

const icons = {
  draft: Edit3,
  published: CheckCircle,
  archived: Archive,
}

function StatusPill({ status }) {
  const normalized = status || 'draft'
  const className = styles[normalized] || styles.draft
  const Icon = icons[normalized] || icons.draft

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{normalized}</span>
    </span>
  )
}

export default StatusPill
