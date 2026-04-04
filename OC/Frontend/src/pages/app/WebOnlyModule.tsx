interface WebOnlyModuleProps {
  title: string
}

export default function WebOnlyModule({ title }: WebOnlyModuleProps) {
  return (
    <div className="mx-4 mt-6 rounded-xl border border-oc-red/20 bg-oc-metal p-6 text-center text-oc-light">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm text-gray-300">
        Este modulo continua disponible en el panel web.
      </p>
    </div>
  )
}

