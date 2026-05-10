import type { ReactNode } from 'react'

interface Props {
  title: string
  message: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, message, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      {icon ?? (
        <svg className="h-10 w-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l1 12h12l1-12h2M9 11v4M15 11v4M5 7l1-3h12l1 3" />
        </svg>
      )}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="max-w-sm text-[13px] leading-relaxed text-neutral-500">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
