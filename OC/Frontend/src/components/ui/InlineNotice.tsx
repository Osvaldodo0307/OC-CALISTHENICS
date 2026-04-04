interface InlineNoticeProps {
  type: 'success' | 'error' | 'info'
  message: string
}

const styles: Record<InlineNoticeProps['type'], string> = {
  success: 'bg-green-700/20 border-green-500/40 text-green-100',
  error: 'bg-red-700/20 border-red-500/40 text-red-100',
  info: 'bg-blue-700/20 border-blue-500/40 text-blue-100',
}

export default function InlineNotice({ type, message }: InlineNoticeProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}

