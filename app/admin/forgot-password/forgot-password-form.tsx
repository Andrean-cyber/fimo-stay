'use client'

import { useActionState } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { requestPasswordReset } from './actions'

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, undefined)

  if (state?.success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
        <p className="text-sm text-green-700">
          Kalau email tersebut terdaftar, kami sudah mengirim link untuk mengatur ulang password.
          Silakan cek kotak masuk (dan folder spam).
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 lg:text-[15px]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30 lg:py-3 lg:text-[15px]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 disabled:opacity-50 lg:py-3 lg:text-[15px]"
      >
        {isPending ? 'Mengirim...' : 'Kirim Link Reset'}
      </button>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs text-red-700 sm:text-sm">{state.error}</p>
        </div>
      )}
    </form>
  )
}