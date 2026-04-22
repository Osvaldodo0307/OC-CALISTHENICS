interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-oc-metal rounded-xl border border-oc-border/80 p-6 text-center">
      <h3 className="text-oc-light font-semibold">{title}</h3>
      <p className="text-oc-muted mt-2">{message}</p>
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

