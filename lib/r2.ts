import { S3Client } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// R2 object key ATAU full URL -> selalu full public URL
export function toPublicUrl(keyOrUrl: string) {
  if (/^https?:\/\//.test(keyOrUrl)) {
    return keyOrUrl
  }
  return `${process.env.R2_PUBLIC_BASE_URL}/${keyOrUrl}`
}