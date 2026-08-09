import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '@/lib/r2'
import { requireAdminApi } from '@/utils/auth/require-admin'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename, contentType, kosId } = await req.json()
  if (!filename || !contentType || !kosId) {
    return NextResponse.json({ error: 'filename, contentType, kosId wajib diisi' }, { status: 400 })
  }

  const ext = filename.split('.').pop()
  const key = `kos/${kosId}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ uploadUrl, key, publicUrl })
}