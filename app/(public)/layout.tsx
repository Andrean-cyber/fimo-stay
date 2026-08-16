import { KosLiveRefresher } from '@/components/kos-live-refresher'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KosLiveRefresher />
      {children}
    </>
  )
}
