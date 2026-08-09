import { Meilisearch } from "meilisearch";

export const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
})

export const kosIndex = meili.index('kos')

export async function setupKosIndex() {
  try {
    await meili.createIndex('kos', { primaryKey: 'id' })
  } catch (err: any) {
    if (err?.code !== 'index_already_exists') throw err
  }

  await kosIndex.updateSettings({
    searchableAttributes: ['name', 'city', 'address', 'description'],
    filterableAttributes: ['status', 'city', 'roomType', 'priceMonthly'],
    sortableAttributes: ['priceMonthly', 'createdAt'],
  })
}

export async function syncKosToIndex(kos: {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  priceMonthly: number
  roomType: string | null
  facilities: string[]
  status: string
}) {
  if (kos.status !== 'ACTIVE') {
    await kosIndex.deleteDocument(kos.id)
    return
  }
  await kosIndex.addDocuments([kos])
}

export async function searchKos(query: string, filter?: string) {
  return kosIndex.search(query, { filter })
}