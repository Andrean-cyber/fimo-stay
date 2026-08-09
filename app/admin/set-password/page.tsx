'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fimo-gray/40 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <Image src="/lgfimostay-blue.webp" alt="FimoStay" width={160} height={40} priority />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-fimo-navy">Buat Password</h1>
            <p className="mt-0.5 text-sm text-gray-500">Selesaikan setup akun admin kamu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Password baru
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Masuk'}
          </button>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}