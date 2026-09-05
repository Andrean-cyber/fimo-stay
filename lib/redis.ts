import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Batasi generate upload URL — cegah spam upload
export const publicUploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:public-upload',
})

// Batasi submit transaksi — cegah spam transaksi palsu
export const transactionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:transaction',
})

export const loginRatelimit = new Ratelimit({
  redis, // instance yang sama dengan transactionRatelimit
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 percobaan / 15 menit
  prefix: 'ratelimit:login',
})