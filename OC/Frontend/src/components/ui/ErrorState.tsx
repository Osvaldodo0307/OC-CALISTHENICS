interface ErrorStateProps {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Ocurrio un problema',
  message,
  retryLabel = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="bg-oc-red/15 border border-oc-red/45 rounded-xl p-4 text-center">
      <h3 className="text-oc-light font-semibold">{title}</h3>
      <p className="text-oc-muted text-sm mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 touch-target px-4 py-2 rounded-lg bg-oc-red/25 border border-oc-red/50 text-oc-light text-sm font-medium hover:bg-oc-red/35"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
