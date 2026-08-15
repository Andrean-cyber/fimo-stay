'use client'

import Link from 'next/link'
import Image from 'next/image'

type KosCardProps = {
  slug: string
  name: string
  city: string
  priceMonthly: number
  priceMax?: number
  roomType?: string | null
  facilities?: string[]
  imageUrl?: string | null
  nearbyText?: string | null
}

export function KosCard({
  slug,
  name,
  city,
  priceMonthly,
  priceMax,
  roomType,
  facilities = [],
  imageUrl,
  nearbyText,
}: KosCardProps) {
  const showRange = priceMax != null && priceMax !== priceMonthly

  return (
    <Link
      href={`/kos/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-fimo-gray bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* aspect-[4/3] — tinggi foto ikut lebar card, jadi tetap proporsional
          baik di grid 2 kolom (mobile) maupun 4 kolom (desktop) */}
      <div className="relative aspect-[4/3] w-full shrink-0 bg-fimo-gray">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Belum ada foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <p className="truncate text-sm font-semibold text-gray-800 sm:text-base">{name}</p>
        <p className="truncate text-xs text-gray-500 sm:text-sm">{city}</p>

        {nearbyText && (
          <p className="truncate text-[11px] text-gray-400 sm:text-xs">{nearbyText}</p>
        )}

        <p className="text-sm font-bold text-fimo-navy sm:text-base">
          {showRange ? 'Mulai ' : ''}Rp{priceMonthly.toLocaleString('id-ID')}
          <span className="font-normal text-gray-400">/bulan</span>
        </p>

        {(roomType || facilities.length > 0) && (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {roomType && (
              <span className="rounded-full bg-fimo-navy/5 px-2 py-0.5 text-[10px] capitalize text-fimo-navy sm:text-[11px]">
                {roomType}
              </span>
            )}
            {facilities.slice(0, 2).map((f) => (
              <span
                key={f}
                className="rounded-full bg-fimo-navy/5 px-2 py-0.5 text-[10px] text-fimo-navy sm:text-[11px]"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
