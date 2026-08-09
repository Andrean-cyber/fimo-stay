'use client'

import { useFormStatus } from 'react-dom'

export function PendingSubmitButton({
  children,
  className,
  pendingText = 'Memproses...',
}: {
  children: React.ReactNode
  className?: string
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? pendingText : children}
    </button>
  )
}