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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-fimo-gray px-4 py-12 text-center sm:py-16">
      <div className="rounded-full bg-fimo-gray/40 p-3">
        <Icon className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 sm:text-base">{title}</p>
        <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 rounded-xl bg-fimo-navy px-4 py-2 text-sm font-medium text-white hover:bg-fimo-navy/90 lg:text-[15px]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
