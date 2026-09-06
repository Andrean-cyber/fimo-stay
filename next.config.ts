// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'photos.fimostay.com' },
      { protocol: 'https', hostname: '*.r2.dev' }, // jaga-jaga kalau ada URL lama
    ],
  },
  output: 'standalone',
}

export default nextConfig