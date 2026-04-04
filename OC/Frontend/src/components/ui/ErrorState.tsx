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
    <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 text-center">
      <h3 className="text-red-300 font-semibold">{title}</h3>
      <p className="text-red-100/90 text-sm mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 touch-target px-4 py-2 rounded-lg bg-red-700/30 border border-red-400/40 text-red-100 text-sm font-medium hover:bg-red-700/40"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

