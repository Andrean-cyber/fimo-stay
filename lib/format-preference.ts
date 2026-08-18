import { RecommendationPreference } from '@/types/recommendation-preference'

export function parsePreference(raw: unknown): RecommendationPreference | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as RecommendationPreference
}

export function formatPreferenceSummary(raw: unknown): string {
  const p = parsePreference(raw)
  if (!p) return ''
  const parts: string[] = []
  if (p.city) parts.push(p.city)
  if (p.specificLocation) parts.push(p.specificLocation)
  if (p.kosTypes?.length) parts.push(p.kosTypes.join('/'))
  if (p.budget) parts.push(`Rp${p.budget.toLocaleString('id-ID')}`)
  if (p.facilities?.length) parts.push(p.facilities.join(', '))
  return parts.join(' · ')
}