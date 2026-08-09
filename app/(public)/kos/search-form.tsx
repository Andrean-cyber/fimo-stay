'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchForm({ defaultQuery = '' }: { defaultQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/kos?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama kos, kota, atau alamat..."
        className="border p-3 flex-1 rounded"
      />
      <button type="submit" className="bg-black text-white px-6 py-3 rounded">
        Cari
      </button>
    </form>
  )
}