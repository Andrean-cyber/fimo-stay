'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPinIcon, MapIcon, ClockIcon } from '@heroicons/react/24/outline'

type KosCardProps = {
  slug: string
  name: string
  city: string
  district?: string | null
  priceMonthly: number
  priceMax?: number
  roomType?: string | null
  facilities?: string[]
  imageUrl?: string | null
  nearbyText?: string | null
  updatedDaysAgo?: number
}

function formatUpdatedText(days: number) {
  if (days <= 0) return 'Diperbarui hari ini'
  if (days === 1) return 'Diperbarui kemarin'
  return `Diperbarui ${days} hari lalu`
}

export function KosCard({
  slug,
  name,
  city,
  district,
  priceMonthly,
  priceMax,
  roomType,
  facilities = [],
  imageUrl,
  nearbyText,
  updatedDaysAgo,
}: KosCardProps) {
  const showRange = priceMax != null && priceMax !== priceMonthly
  const locationText = district ? `${district}, ${city}` : city

  return (
    <Link href={`/kos/${slug}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-fimo-gray">
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

        <div className="absolute left-3 top-2 rounded-md bg-white px-3 py-1.5">
          <Image src="/lgfimostay-blue.webp" alt="" width={50} height={50} />
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">{name}</p>

        <p className="flex items-center gap-1 truncate text-xs text-gray-500 sm:text-sm">
          <MapPinIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          {locationText}
        </p>

        {nearbyText && (
          <p className="flex items-center gap-1 truncate text-xs text-gray-500 sm:text-sm">
            <MapIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            {nearbyText}
          </p>
        )}

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          mulai dari{' '}
          <span className="text-sm font-bold text-gray-900 sm:text-base">
            Rp{priceMonthly.toLocaleString('id-ID')}
          </span>{' '}
          /bulan
        </p>

        {(roomType || facilities.length > 0) && (
          <div className="flex flex-wrap gap-1 pt-1">
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

        {updatedDaysAgo != null && (
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400 sm:text-[11px]">
            <ClockIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            {formatUpdatedText(updatedDaysAgo)}
          </p>
        )}
      </div>
    </Link>
  )
}