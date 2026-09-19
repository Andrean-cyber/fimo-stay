'use server'

import { createClient } from '@/utils/supabase/server'
import { loginRatelimit } from '@/lib/redis'
import { headers } from 'next/headers'
import type { FormActionState } from '@/lib/action-state'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Ambil NEXT_PUBLIC_SITE_URL tanpa trailing slash, supaya redirectTo tidak
// jadi double slash (contoh: "https://fimostay.com/" + "/set-password"
// akan jadi "https://fimostay.com//set-password" kalau tidak di-strip).
function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/+$/, '')
}

export async function requestPasswordReset(_prevState: FormActionState, formData: FormData) {
  const rawEmail = (formData.get('email') as string) ?? ''
  const email = rawEmail.trim().toLowerCase()

  if (!email || !isValidEmail(email)) {
    return { error: 'Format email tidak valid.' }
  }

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  // Reuse rate limiter yang sama dengan login: batasi per IP dan per email,
  // supaya endpoint ini tidak bisa dipakai untuk spam email reset ke orang
  // lain atau untuk brute-force menebak email admin yang valid.
  const [ipLimit, emailLimit] = await Promise.all([
    loginRatelimit.limit(`forgot-ip:${ip}`),
    loginRatelimit.limit(`forgot-email:${email}`),
  ])

  if (!ipLimit.success || !emailLimit.success) {
    return { error: 'Terlalu banyak percobaan, coba lagi dalam beberapa menit.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/set-password`,
  })

  if (error) {
    console.error('requestPasswordReset error:', error)
    // Tetap balas sukses ke user meski ada error internal — jangan bocorkan
    // detail ke luar, dan tetap konsisten dengan alasan di bawah (anti
    // enumeration). Errornya sudah dicatat di log untuk developer.
  }

  // PENTING: selalu balas sukses, baik email-nya terdaftar sebagai admin
  // atau tidak. Kalau pesan dibedakan ("email tidak ditemukan" vs "email
  // terkirim"), orang luar bisa memakainya untuk menebak satu-satu email
  // mana saja yang punya akun admin (user enumeration).
  return { success: true }
}