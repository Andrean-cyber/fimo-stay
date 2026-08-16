'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PublicHeader } from '@/components/public-header'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
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
    <div className="min-h-screen bg-fimo-gray/40">
      <PublicHeader />
      <main className="mx-auto max-w-sm px-4 py-12 sm:max-w-md sm:py-16 lg:max-w-lg lg:py-20">
        <div className="rounded-2xl border border-fimo-gray bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <h1 className="text-xl font-bold text-fimo-navy sm:text-2xl lg:text-3xl">Buat Password</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Buat password baru untuk mengakses akun tim FimoStay kamu.
          </p>

          {!ready && !error && (
            <p className="mt-6 text-sm text-gray-500 lg:text-[15px]">Memverifikasi undangan...</p>
          )}

          {ready && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600 lg:text-sm">
                  Password baru
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-fimo-gray p-2.5 pr-10 text-sm outline-none transition-colors focus:border-fimo-navy focus:ring-1 focus:ring-fimo-navy lg:p-3 lg:text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fimo-navy"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    ) : (
                      <EyeIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-gray-600 lg:text-sm">
                  Konfirmasi password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-fimo-gray p-2.5 text-sm outline-none transition-colors focus:border-fimo-navy focus:ring-1 focus:ring-fimo-navy lg:p-3 lg:text-[15px]"
                />
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircleIcon className="h-3 w-3" /> Cocok
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-red-500 lg:text-[15px]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 lg:py-3 lg:text-[15px]"
              >
                {submitting ? 'Menyimpan...' : 'Simpan & Masuk'}
              </button>
            </form>
          )}

          {!ready && error && <p className="mt-6 text-sm text-red-500 lg:text-[15px]">{error}</p>}
        </div>
      </main>
    </div>
  )
}
