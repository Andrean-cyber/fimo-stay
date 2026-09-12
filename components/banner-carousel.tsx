'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const BANNERS = [
  { src: '/banner-1.webp', alt: 'Promo FimoStay 1' },
  { src: '/banner-2.webp', alt: 'Promo FimoStay 2' },
]

const AUTOPLAY_INTERVAL_MS = 4000

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isVisible) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BANNERS.length)
    }, AUTOPLAY_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isVisible])

  return (
    <div className="px-4 pt-3 sm:hidden">
      <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {BANNERS.map((banner) => (
            <div key={banner.src} className="relative w-full shrink-0">
              <Image
                src={banner.src}
                alt={banner.alt}
                width={1000}
                height={1000}
                priority
                className="h-auto w-full object-contain"
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {BANNERS.map((banner, i) => (
            <button
              key={banner.src}
              type="button"
              aria-label={`Ke banner ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}