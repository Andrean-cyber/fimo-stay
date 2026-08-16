import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  const pages = getPageWindow(currentPage, totalPages)

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Navigasi halaman">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-fimo-gray ${
          currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:border-fimo-blue'
        }`}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Link>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              p === currentPage
                ? 'bg-fimo-navy text-white'
                : 'border border-fimo-gray text-gray-600 hover:border-fimo-blue'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-fimo-gray ${
          currentPage === totalPages ? 'pointer-events-none opacity-40' : 'hover:border-fimo-blue'
        }`}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </nav>
  )
}

function getPageWindow(current: number, total: number): (number | '...')[] {
  const delta = 1
  const range: (number | '...')[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
}