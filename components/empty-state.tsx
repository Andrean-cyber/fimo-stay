import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-fimo-gray py-16 text-center">
      <div className="rounded-full bg-fimo-gray/40 p-3">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <div>
        <p className="font-medium text-gray-700">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-2 rounded-xl bg-fimo-navy px-4 py-2 text-sm font-medium text-white hover:bg-fimo-navy/90">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}