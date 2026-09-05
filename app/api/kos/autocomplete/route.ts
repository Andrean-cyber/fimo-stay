import { NextRequest, NextResponse } from 'next/server'
import { kosIndex, type KosDocument } from '@/lib/meilisearch'
import { redis } from '@/lib/redis'

// Saran ketikan (autocomplete) jauh lebih jarang berubah drastis
// dibanding listing penuh, jadi TTL-nya dibuat lebih panjang dari
// cache listing utama (yang 45 detik) — mengurangi beban Meilisearch
// untuk keyword populer yang diketik berulang-ulang oleh banyak user.
const AUTOCOMPLETE_TTL = 300 // 5 menit
const SUGGESTION_LIMIT = 6
const MIN_QUERY_LENGTH = 2

export type KosSuggestion = {
  slug: string
  name: string
  city: string
  district: string | null
}

export async function GET(request: NextRequest) {
  const rawQ = request.nextUrl.searchParams.get('q') ?? ''
  const q = rawQ.trim()

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ suggestions: [] })
  }

  // normalisasi supaya "Kos UB", "kos ub", " Kos UB " semua share cache
  // entry yang sama — mengurangi jumlah key unik di Redis
  const normalizedQ = q.toLowerCase()
  const cacheKey = `autocomplete:${normalizedQ}`

  try {
    const cached = await redis.get<KosSuggestion[]>(cacheKey)
    if (cached) {
      return NextResponse.json({ suggestions: cached })
    }
  } catch (err) {
    // kalau Redis lagi bermasalah, jangan sampai autocomplete ikut down —
    // fallback langsung ke Meilisearch tanpa cache
    console.error('[autocomplete] Redis get gagal, fallback ke Meilisearch:', err)
  }

  const result = await kosIndex.search<KosDocument>(normalizedQ, {
    filter: 'status = "ACTIVE"',
    limit: SUGGESTION_LIMIT,
    attributesToRetrieve: ['slug', 'name', 'city', 'district'],
  })

  const suggestions: KosSuggestion[] = result.hits.map((hit) => ({
    slug: hit.slug,
    name: hit.name,
    city: hit.city,
    district: hit.district,
  }))

  try {
    // cache walau hasilnya array kosong — supaya keyword yang sering
    // diketik tapi memang tidak ada hasilnya juga tidak nge-hit
    // Meilisearch berulang-ulang
    await redis.set(cacheKey, suggestions, { ex: AUTOCOMPLETE_TTL })
  } catch (err) {
    console.error('[autocomplete] Redis set gagal (tidak fatal):', err)
  }

  return NextResponse.json({ suggestions })
}
