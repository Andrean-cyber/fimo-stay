'use client'

import { useEffect, useState, useCallback } from 'react'
import { ImageOff, X, ChevronLeft, ChevronRight } from 'lucide-react'

type Media = { id: string; url: string }

export function PhotoGallery({ media, name }: { media: Media[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + media.length) % media.length)),
    [media.length]
  )
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % media.length)),
    [media.length]
  )

  // Navigasi keyboard + kunci scroll body saat lightbox terbuka
  useEffect(() => {
    if (openIndex === null) return

    document.body.style.overflow = 'hidden'
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex, close, prev, next])

  if (media.length === 0) {
    return (
      <div className="mb-6 flex h-48 flex-col items-center justify-center gap-2 rounded-2xl bg-fimo-gray/60 text-gray-400">
        <ImageOff className="h-6 w-6" />
        <p className="text-sm md:text-base">Belum ada foto</p>
      </div>
    )
  }

  const [cover, ...restMedia] = media
  const thumbs = restMedia.slice(0, 4)
  const extraCount = restMedia.length - 4
  const thumbGridClass = thumbs.length <= 1 ? 'grid-cols-1' : 'grid-cols-2'
  const thumbRowsClass = thumbs.length <= 2 ? 'grid-rows-1' : 'grid-rows-2'

  return (
    <>
      <div className="mb-6 flex flex-col gap-1.5 overflow-hidden rounded-2xl sm:h-[420px] sm:flex-row sm:gap-2">
        {/* Foto utama */}
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className={`group relative h-64 w-full overflow-hidden sm:h-full ${
            thumbs.length > 0 ? 'sm:w-3/5' : 'sm:w-full'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt={name}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>

        {/* Grid thumbnail — jumlah baris/kolom mengikuti jumlah foto tambahan (1–4) */}
        {thumbs.length > 0 && (
          <div className={`grid flex-1 gap-1.5 sm:h-full sm:gap-2 ${thumbGridClass} ${thumbRowsClass}`}>
            {thumbs.map((m, i) => {
              const isLastVisible = i === thumbs.length - 1 && extraCount > 0
              const spanFull = thumbs.length === 3 && i === 2

              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setOpenIndex(i + 1)}
                  className={`group relative h-28 overflow-hidden sm:h-full ${spanFull ? 'col-span-2' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {isLastVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white md:text-base">
                      +{extraCount} foto
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Foto sebelumnya"
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media[openIndex].url}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Foto berikutnya"
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white md:text-sm">
            {openIndex + 1} / {media.length}
          </div>
        </div>
      )}
    </>
  )
}
