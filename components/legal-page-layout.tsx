'use client'

import { useState, useEffect } from 'react'

type Section = { id: string; title: string }

export function LegalPageLayout({
  title,
  lastUpdated,
  sections,
  children,
}: {
  title: string
  lastUpdated: string
  sections: Section[]
  children: React.ReactNode
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="border-b border-fimo-gray pb-8">
        <h1 className="text-2xl font-bold text-fimo-navy md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: {lastUpdated}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        {/* TOC — sticky, desktop only */}
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1 border-l border-fimo-gray pl-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block py-1.5 text-sm transition-colors ${
                  activeId === s.id
                    ? 'font-medium text-fimo-navy'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-10 text-sm leading-relaxed text-gray-600 md:text-base">
          {children}
        </div>
      </div>
    </div>
  )
}