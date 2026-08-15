import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { PasswordInput } from './password-input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const resolvedParams = await searchParams

  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return redirect('/admin/login?message=Email atau Password salah')
    }
    return redirect('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:max-w-lg lg:p-10">
        <div className="flex flex-col items-center gap-4">
          <Image src="/lgfimostay-blue.webp" alt="FimoStay" width={160} height={40} priority />
          <div className="text-center">
            <h1 className="text-base font-semibold text-fimo-navy sm:text-lg lg:text-xl">
              Admin Login
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Masuk untuk kelola platform FimoStay
            </p>
          </div>
        </div>

        <form action={signIn} className="flex flex-col space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700 lg:text-[15px]"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-xl border border-fimo-gray px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-fimo-blue focus:ring-2 focus:ring-fimo-blue/30 lg:py-3 lg:text-[15px]"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700 lg:text-[15px]"
              htmlFor="password"
            >
              Password
            </label>
            <PasswordInput />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-fimo-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fimo-navy/90 lg:py-3 lg:text-[15px]"
          >
            Masuk
          </button>

          {resolvedParams?.message && (
            <p className="rounded-xl bg-red-50 p-3 text-center text-xs text-red-600 sm:text-sm">
              {resolvedParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
