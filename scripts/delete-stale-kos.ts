import { kosIndex } from '@/lib/meilisearch'

async function main() {
  await kosIndex.deleteDocument('d303eaa8-c4ea-4165-b64a-8c88b3fa0cdc')
  console.log('Deleted from Meilisearch index')
}

main()