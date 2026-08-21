import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { verifyTransaction, rejectTransaction } from './actions'
import type { PendingCardData } from './queue-helpers'

export function PendingTransactionCard({ t }: { t: PendingCardData }) {
  return (
    <div className="rounded-2xl border border-fimo-gray bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              t.type === 'SELF_SEARCH' ? 'bg-fimo-gray text-gray-600' : 'bg-fimo-navy/10 text-fimo-navy'
            }`}
          >
            {t.type === 'SELF_SEARCH' ? 'Cari Sendiri' : 'Rekomendasi'}
          </span>
          <span className="font-mono text-xs text-gray-400">{t.refCode}</span>
        </div>
        <span className="text-lg font-bold text-fimo-navy sm:text-xl lg:text-2xl">
          Rp{t.amount.toLocaleString('id-ID')}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-700 lg:text-[15px]">
        <p>
          <span className="text-gray-400">Pencari:</span> {t.searcherPhone}
        </p>
        {t.targetKosName && (
          <p>
            <span className="text-gray-400">Target kos:</span> {t.targetKosName}
          </p>
        )}
        {t.preferenceSummary && (
          <p>
            <span className="text-gray-400">Preferensi:</span> {t.preferenceSummary}
          </p>
        )}
      </div>

      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Cocokkan kode referensi di atas dengan pesan WhatsApp sebelum verifikasi
      </p>

      <div className="mt-4 flex gap-2">
        <form action={verifyTransaction.bind(null, t.id)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:px-5 lg:py-2.5 lg:text-[15px]"
          >
            <CheckIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Verifikasi
          </button>
        </form>
        <form action={rejectTransaction.bind(null, t.id)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 lg:px-5 lg:py-2.5 lg:text-[15px]"
          >
            <XMarkIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
            Tolak
          </button>
        </form>
      </div>
    </div>
  )
}