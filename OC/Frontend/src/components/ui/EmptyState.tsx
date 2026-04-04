interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-6 text-center">
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-gray-400 mt-2">{message}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 touch-target bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

