import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export function toPublicUrl(keyOrUrl: string) {
  if (/^https?:\/\//.test(keyOrUrl)) {
    return keyOrUrl
  }
  return `${process.env.R2_PUBLIC_BASE_URL}/${keyOrUrl}`
}

// Full public URL -> R2 object key
export function toR2Key(url: string) {
  const base = process.env.R2_PUBLIC_BASE_URL!
  if (url.startsWith(base)) {
    return url.slice(base.length + 1) // +1 untuk hapus leading "/"
  }
  return url // sudah berupa key
}

export async function deleteFromR2(urlOrKey: string) {
  const key = toR2Key(urlOrKey)
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }))
}