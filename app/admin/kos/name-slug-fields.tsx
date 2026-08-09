'use client'

import { useState } from 'react'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function NameSlugFields({
  defaultName = '',
  defaultSlug = '',
  inputClass,
}: {
  defaultName?: string
  defaultSlug?: string
  inputClass?: string
}) {
  const [name, setName] = useState(defaultName)
  const [slug, setSlug] = useState(defaultSlug)
  const [slugTouched, setSlugTouched] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium">Nama kos</label>
        <input name="name" value={name} onChange={handleNameChange} required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugTouched(true)
          }}
          required
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400">Otomatis dari nama, bisa diedit manual kalau perlu.</p>
      </div>
    </>
  )
}