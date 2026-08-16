import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import {
  BuildingOffice2Icon,
  EyeSlashIcon,
  NoSymbolIcon,
  UsersIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default async function AdminDashboardPage() {
  const admin = await requireAdmin()

  const [
    totalKosAktif,
    totalKosStale,
    totalKosHiddenManual,
    totalOwner,
    transaksiPending,
    perluDipilihkanRekomendasi,
  ] = await Promise.all([
    prisma.kos.count({ where: { status: 'ACTIVE' } }),
    prisma.kos.count({ where: { status: 'HIDDEN_STALE' } }),
    prisma.kos.count({ where: { status: 'HIDDEN_MANUAL' } }),
    prisma.owner.count(),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    prisma.transaction.count({
      where: { status: 'VERIFIED', type: 'RECOMMENDATION', recommendationItems: { none: {} } },
    }),
  ])

  const kosAkanKedaluwarsa = await prisma.kos.findMany({
    where: {
      status: 'ACTIVE',
      lastUpdatedAt: { lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { lastUpdatedAt: 'asc' },
    take: 3,
    select: { id: true, name: true, lastUpdatedAt: true },
  })

  const now = Date.now()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Halo, <span className="font-medium text-gray-700">{admin.fullName}</span> — berikut
          ringkasan kondisi platform hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
        <StatCard label="Kos Aktif" value={totalKosAktif} href="/admin/kos" icon={BuildingOffice2Icon} />
        <StatCard
          label="Disembunyikan (Stale)"
          value={totalKosStale}
          href="/admin/kos"
          icon={ClockIcon}
          tone={totalKosStale > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Disembunyikan (Manual)"
          value={totalKosHiddenManual}
          href="/admin/kos"
          icon={EyeSlashIcon}
        />
        <StatCard label="Total Owner" value={totalOwner} href="/admin/owners" icon={UsersIcon} />
        <StatCard
          label="Transaksi Pending"
          value={transaksiPending}
          href="/admin/transaksi"
          icon={NoSymbolIcon}
          tone={transaksiPending > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Perlu Dipilihkan Rekomendasi"
          value={perluDipilihkanRekomendasi}
          href="/admin/transaksi"
          icon={ClipboardDocumentCheckIcon}
          tone={perluDipilihkanRekomendasi > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Kos mendekati batas update */}
      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-fimo-gray px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Kos Mendekati Batas Update
            </h2>
            <p className="text-[11px] text-gray-500 sm:text-xs">
              Belum diperbarui pemilik selama ≥5 hari
            </p>
          </div>
          <Link
            href="/admin/kos"
            className="flex shrink-0 items-center gap-1 self-start text-xs font-medium text-fimo-navy hover:text-fimo-blue sm:self-auto sm:text-sm"
          >
            Lihat semua
            <ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {kosAkanKedaluwarsa.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <div className="rounded-full bg-fimo-blue/10 p-3">
              <ClockIcon className="h-5 w-5 text-fimo-blue" />
            </div>
            <p className="text-xs text-gray-500 sm:text-sm">
              Semua kos aktif sudah diperbarui tepat waktu. Tidak ada yang perlu ditindaklanjuti.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-fimo-gray">
            {kosAkanKedaluwarsa.map((k) => {
              const hari = Math.floor((now - k.lastUpdatedAt.getTime()) / 86400000)
              const urgent = hari >= 7
              return (
                <li key={k.id}>
                  <Link
                    href={`/admin/kos/${k.id}/edit`}
                    className="flex flex-col items-start gap-2 px-4 py-3 transition-colors hover:bg-fimo-gray/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5"
                  >
                    <span className="truncate text-xs font-medium text-gray-800 sm:text-sm">
                      {k.name}
                    </span>
                    <span
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:text-xs ${
                        urgent ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {urgent && <ExclamationTriangleIcon className="h-3 w-3" />}
                      {hari} hari sejak update terakhir
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: number
  href: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'warning'
}) {
  const isWarning = tone === 'warning' && value > 0

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[112px] flex-col overflow-hidden rounded-2xl border bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-[132px] sm:p-4 lg:min-h-[144px] lg:p-5 ${
        isWarning ? 'border-amber-300' : 'border-fimo-gray'
      }`}
    >
      <div
        className={`mb-2.5 inline-flex w-fit rounded-full p-1.5 sm:mb-3 sm:p-2 ${
          isWarning ? 'bg-amber-50 text-amber-600' : 'bg-fimo-navy/5 text-fimo-navy'
        }`}
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
      </div>
      <p className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">{value}</p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-500 sm:text-xs lg:text-sm">
        {label}
      </p>

      {isWarning && (
        <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      )}
    </Link>
  )
}
