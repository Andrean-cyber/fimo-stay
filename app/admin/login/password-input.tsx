'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput() {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id="password"
        className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30"
        type={show ? 'text' : 'password'}
        name="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-fimo-navy"
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}