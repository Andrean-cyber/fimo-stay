// worker.ts
// @ts-expect-error — file ini di-generate saat build (opennextjs-cloudflare build)
import { default as handler } from './.open-next/worker.js'

export default {
  fetch: handler.fetch,

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      fetch('https://fimostay.com/api/cron/hide-stale-kos', {
        method: 'POST',
        headers: { 'x-cron-secret': env.CRON_SECRET },
      })
    )
  },
} satisfies ExportedHandler<CloudflareEnv>

// wajib di-re-export kalau pakai DO Queue/Tag Cache dari opennextjs-cloudflare
// @ts-expect-error
export { DOQueueHandler, DOShardedTagCache } from './.open-next/worker.js'