// scripts/find-stale-kos.ts
import { config } from 'dotenv'
config({ path: '.env.local' }) // load .env.local dulu

import { kosIndex } from '@/lib/meilisearch'

async function main() {
  const result = await kosIndex.search('Kuda Putih')
  console.log(JSON.stringify(result.hits, null, 2))
}

main()