interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="text-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-oc-red border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-400">{message}</p>
    </div>
  )
}

