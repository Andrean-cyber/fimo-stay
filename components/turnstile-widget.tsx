'use client'

import { Turnstile } from '@marsidev/react-turnstile'

export function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  return (
    <div className="w-full flex justify-center">
      <div className="scale-[0.70] sm:scale-100 origin-center">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={onVerify}
          options={{ theme: 'light' }}
        />
      </div>
    </div>
  )
}