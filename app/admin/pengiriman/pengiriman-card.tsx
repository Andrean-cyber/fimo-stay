import { ChatBubbleLeftRightIcon, CheckIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { markTransactionSent } from './actions'
import type { PengirimanCardData } from './queue-helpers'

export function PengirimanCard({
  transactionId, badgeLabel, badgeClass, refCode, phone, subtitle, message, waLink,
}: PengirimanCardData) {
  return (
    <div className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{badgeLabel}</span>
          <span className="font-mono text-xs text-gray-400">{refCode}</span>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-700 lg:text-[15px]">
        <p><span className="text-gray-400">Pencari:</span> {phone}</p>
        <p className="flex items-start gap-1">
          <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{subtitle}</span>
        </p>
      </div>

      <details className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <summary className="cursor-pointer select-none font-medium text-gray-700">Pratinjau pesan</summary>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{message}</pre>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
       <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:px-5 lg:py-2.5 lg:text-[15px]"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
          Buka WhatsApp
        </a>
        <form action={markTransactionSent.bind(null, transactionId)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl border border-fimo-gray px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-fimo-gray/40 lg:px-5 lg:py-2.5 lg:text-[15px]"
          >
            <CheckIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Tandai Terkirim
          </button>
        </form>
      </div>
    </div>
  )
}