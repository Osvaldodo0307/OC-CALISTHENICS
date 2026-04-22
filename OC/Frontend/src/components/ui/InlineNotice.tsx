interface InlineNoticeProps {
  type: 'success' | 'error' | 'info'
  message: string
}

const styles: Record<InlineNoticeProps['type'], string> = {
  success: 'bg-oc-red/15 border-oc-red/40 text-oc-light',
  error: 'bg-oc-red/25 border-oc-red/55 text-oc-light',
  info: 'bg-oc-panel border-oc-border text-oc-muted',
}

export default function InlineNotice({ type, message }: InlineNoticeProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}
