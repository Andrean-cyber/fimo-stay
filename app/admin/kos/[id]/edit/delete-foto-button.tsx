'use client'

import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteKosMedia } from '../../actions'

export function DeleteFotoButton({ mediaId }: { mediaId: string }) {
  return (
    <div className="absolute right-1.5 top-1.5 opacity-0 transition group-hover:opacity-100">
      <ConfirmDeleteButton
        action={() => deleteKosMedia(mediaId)}
        itemName="foto ini"
        label=""
      />
    </div>
  )
}