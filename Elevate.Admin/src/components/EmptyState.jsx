import { Inbox } from 'lucide-react'

function EmptyState({ title, description, icon: Icon = Inbox, children }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-neutral-50 text-neutral-400">
          <Icon className="w-10 h-10" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">{description}</p>
      ) : null}
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  )
}

export default EmptyState
