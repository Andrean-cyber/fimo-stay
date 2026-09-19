import Image from 'next/image'
import Link from 'next/link'
import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:max-w-lg lg:p-10">
        <div className="flex flex-col items-center gap-4">
          <Image src="/lgfimostay-blue.webp" alt="FimoStay" width={160} height={40} priority />
          <div className="text-center">
            <h1 className="text-base font-semibold text-fimo-navy sm:text-lg lg:text-xl">
              Lupa Password
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Masukkan email admin kamu, kami akan kirim link untuk mengatur ulang password.
            </p>
          </div>
        </div>

        <ForgotPasswordForm />

        <Link
          href="/admin/login"
          className="block text-center text-sm text-gray-500 hover:text-fimo-navy lg:text-[15px]"
        >
          &larr; Kembali ke halaman login
        </Link>
      </div>
    </div>
  )
}