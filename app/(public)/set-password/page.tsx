'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PublicHeader } from '@/components/public-header'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function handleInviteSession() {
      // Token undangan dikirim di URL fragment (#access_token=...&refresh_token=...),
      // bukan di query string, jadi harus di-parse manual lalu di-set ke session.
      const hash = window.location.hash
      if (!hash) {
        setError('Link undangan tidak valid atau sudah kedaluwarsa. Minta undangan baru ke superadmin.')
        return
      }

      const params = new URLSearchParams(hash.substring(1)) // buang '#' di depan
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (!access_token || !refresh_token) {
        setError('Link undangan tidak valid atau sudah kedaluwarsa. Minta undangan baru ke superadmin.')
        return
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (sessionError) {
        setError('Link undangan tidak valid atau sudah kedaluwarsa. Minta undangan baru ke superadmin.')
        return
      }

      // Bersihkan token dari address bar setelah session ter-set, biar tidak nyangkut di history/riwayat browser
      window.history.replaceState(null, '', window.location.pathname)
      setReady(true)
    }

    handleInviteSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div>
      <PublicHeader />
      <main className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-xl font-semibold mb-4">Buat Password</h1>

        {!ready && !error && <p className="text-sm text-gray-500">Memverifikasi undangan...</p>}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Password baru (min. 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 w-full rounded"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan & Masuk'}
            </button>
          </form>
        )}

        {!ready && error && <p className="text-sm text-red-500">{error}</p>}
      </main>
    </div>
  )
}
