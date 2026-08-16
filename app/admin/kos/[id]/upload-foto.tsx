'use client'

import { useRef, useState } from 'react'
import { attachKosMedia } from '../actions'
import { compressImage } from '@/lib/compress-image'
import { ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export function UploadFoto({ kosId }: { kosId: string }) {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploading = status !== 'idle'

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    try {
      // Compress & resize dulu di browser sebelum dikirim — mengurangi ukuran
      // upload signifikan (foto kamera HP bisa 4-8MB, hasil compress biasanya <500KB)
      setStatus('compressing')
      const file = await compressImage(rawFile, { maxWidth: 1600, quality: 0.8 })

      setStatus('uploading')
      const res = await fetch('/api/admin/r2-upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, contentType: file.type, kosId }),
      })
      const { uploadUrl, publicUrl } = await res.json()

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await attachKosMedia(kosId, publicUrl)
    } finally {
      setStatus('idle')
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const label =
    status === 'compressing' ? 'Mengompres foto...' : status === 'uploading' ? 'Mengunggah...' : 'Unggah Foto'

  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-fimo-gray px-4 py-3 text-sm font-medium transition-colors lg:py-3.5 lg:text-[15px] ${
        uploading ? 'text-gray-400' : 'text-fimo-navy hover:bg-fimo-gray/40'
      }`}
    >
      {uploading ? (
        <ArrowPathIcon className="h-4 w-4 animate-spin lg:h-[18px] lg:w-[18px]" />
      ) : (
        <ArrowUpTrayIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
      )}
      {label}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
    </label>
  )
}
