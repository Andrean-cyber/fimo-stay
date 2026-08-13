import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'

type KosCardProps = {
  slug: string
  name: string
  city: string
  priceMonthly: number
  roomType?: string | null
  facilities?: string[]
  imageUrl?: string | null
}

export function KosCard({
  slug,
  name,
  city,
  priceMonthly,
  roomType,
  facilities = [],
  imageUrl,
}: KosCardProps) {
  return (
    <Link
      href={`/kos/${slug}`}
      className="group overflow-hidden rounded-2xl border border-fimo-gray bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-36 w-full bg-fimo-gray">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-red-500"
          aria-label="Simpan ke favorit"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
        <p className="truncate text-xs text-gray-500">{city}</p>

        <p className="text-sm font-bold text-fimo-navy">
          Rp{priceMonthly.toLocaleString('id-ID')}
          <span className="font-normal text-gray-400">/bulan</span>
        </p>

        {(roomType || facilities.length > 0) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {roomType && (
              <span className="rounded-full bg-fimo-navy/5 px-2 py-0.5 text-[10px] capitalize text-fimo-navy">
                {roomType}
              </span>
            )}
            {facilities.slice(0, 2).map((f) => (
              <span
                key={f}
                className="rounded-full bg-fimo-navy/5 px-2 py-0.5 text-[10px] text-fimo-navy"
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