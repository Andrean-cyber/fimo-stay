'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-red-300 transition-colors hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 sm:text-sm"
    >
      <LogOut className="h-3.5 w-3.5" />
      Logout
    </button>
  )
}
