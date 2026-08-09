import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth/require-admin'
import Link from 'next/link'
import {
  Building2,
  EyeOff,
  Ban,
  Users,
  Clock,
  ListChecks,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

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
    take: 5,
    select: { id: true, name: true, lastUpdatedAt: true },
  })

  const now = Date.now()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fimo-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Halo, <span className="font-medium text-gray-700">{admin.fullName}</span> — berikut ringkasan kondisi platform hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Kos Aktif"
          value={totalKosAktif}
          href="/admin/kos"
          icon={Building2}
        />
        <StatCard
          label="Disembunyikan (Stale)"
          value={totalKosStale}
          href="/admin/kos"
          icon={Clock}
          tone={totalKosStale > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Disembunyikan (Manual)"
          value={totalKosHiddenManual}
          href="/admin/kos"
          icon={EyeOff}
        />
        <StatCard
          label="Total Owner"
          value={totalOwner}
          href="/admin/owners"
          icon={Users}
        />
        <StatCard
          label="Transaksi Pending"
          value={transaksiPending}
          href="/admin/transaksi"
          icon={Ban}
          tone={transaksiPending > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Perlu Dipilihkan Rekomendasi"
          value={perluDipilihkanRekomendasi}
          href="/admin/transaksi"
          icon={ListChecks}
          tone={perluDipilihkanRekomendasi > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Kos mendekati batas update */}
      <div className="rounded-2xl border border-fimo-gray bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-fimo-gray px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Kos Mendekati Batas Update</h2>
            <p className="text-xs text-gray-500">Belum diperbarui pemilik selama ≥5 hari</p>
          </div>
          <Link
            href="/admin/kos"
            className="flex items-center gap-1 text-sm font-medium text-fimo-navy hover:text-fimo-blue"
          >
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {kosAkanKedaluwarsa.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <div className="rounded-full bg-fimo-blue/10 p-3">
              <Clock className="h-5 w-5 text-fimo-blue" />
            </div>
            <p className="text-sm text-gray-500">
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
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-fimo-gray/40"
                  >
                    <span className="truncate text-sm font-medium text-gray-800">{k.name}</span>
                    <span
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        urgent
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {urgent && <AlertTriangle className="h-3 w-3" />}
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
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isWarning ? 'border-amber-300' : 'border-fimo-gray'
      }`}
    >
      <div
        className={`mb-3 inline-flex rounded-full p-2 ${
          isWarning ? 'bg-amber-50 text-amber-600' : 'bg-fimo-navy/5 text-fimo-navy'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-fimo-navy">{value}</p>
      <p className="mt-0.5 text-xs leading-snug text-gray-500">{label}</p>

      {isWarning && (
        <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      )}
    </Link>
  )
}