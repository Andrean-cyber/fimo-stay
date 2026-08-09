'use client'

import { useRef, useState } from 'react'
import { attachKosMedia } from '../actions'
import { Upload, Loader2 } from 'lucide-react'

export function UploadFoto({ kosId }: { kosId: string }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const res = await fetch('/api/admin/r2-upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, contentType: file.type, kosId }),
      })
      const { uploadUrl, publicUrl } = await res.json()

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await attachKosMedia(kosId, publicUrl)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-fimo-gray px-4 py-3 text-sm font-medium transition-colors ${
        uploading ? 'text-gray-400' : 'text-fimo-navy hover:bg-fimo-gray/40'
      }`}
    >
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {uploading ? 'Mengunggah...' : 'Unggah Foto'}
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