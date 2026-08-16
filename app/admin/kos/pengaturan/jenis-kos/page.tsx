"use client"

import { useEffect, useState, useTransition } from "react"
import { PlusIcon, TagIcon } from "@heroicons/react/24/outline"
import {
  getKosTypes,
  createKosType,
  renameKosType,
  deleteKosType,
} from "./jenis-kos.actions"

type KosType = {
  id: string
  name: string
  _count: { segments: number }
}

export default function JenisKosPage() {
  const [kosTypes, setKosTypes] = useState<KosType[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function loadKosTypes() {
    setLoading(true)
    const data = await getKosTypes()
    setKosTypes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadKosTypes()
  }, [])

  function handleAdd() {
    if (!newName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createKosType(newName)
      if (result.error) {
        setError(result.error)
        return
      }
      setNewName("")
      loadKosTypes()
    })
  }

  function handleRename(id: string) {
    if (!editingName.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await renameKosType(id, editingName)
      if (result.error) {
        setError(result.error)
        return
      }
      setEditingId(null)
      loadKosTypes()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus jenis kos ini?")) return
    setError(null)
    startTransition(async () => {
      const result = await deleteKosType(id)
      if (result.error) {
        setError(result.error)
        return
      }
      loadKosTypes()
    })
  }

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6 lg:max-w-2xl lg:p-8">
      <h1 className="mb-1 text-lg font-bold text-[#10367D] sm:text-xl lg:text-2xl">Jenis Kos</h1>
      <p className="mb-4 text-xs text-gray-500 sm:text-sm">
        Kelola daftar jenis kos yang bisa dipilih saat menambahkan kos.
      </p>

      {/* Form tambah: stack di mobile, sejajar di layar lebih lebar */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder='cth. "Eksekutif"'
          className="flex-1 rounded-lg border border-[#EBEBEB] px-3 py-2.5 text-sm focus:border-[#74B4DA] focus:outline-none lg:py-3 lg:text-[15px]"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#10367D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#10367D]/90 disabled:opacity-50 lg:py-3 lg:text-[15px]"
        >
          <PlusIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
          Tambah
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 sm:text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-[#EBEBEB]/60" />
          ))}
        </div>
      ) : kosTypes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#EBEBEB] py-10 text-center">
          <TagIcon className="h-6 w-6 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Belum ada jenis kos</p>
          <p className="text-xs text-gray-400">Tambahkan jenis kos pertama di atas.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#EBEBEB] rounded-2xl border border-[#EBEBEB] bg-white">
          {kosTypes.map((kt) => (
            <li key={kt.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              {editingId === kt.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(kt.id)}
                  className="w-full rounded-lg border border-[#74B4DA] px-2.5 py-1.5 text-sm focus:outline-none sm:mr-2 lg:text-[15px]"
                  autoFocus
                />
              ) : (
                <span className="min-w-0 truncate text-sm text-gray-800 lg:text-[15px]">
                  {kt.name}{" "}
                  <span className="text-xs text-gray-400">
                    ({kt._count.segments} segment)
                  </span>
                </span>
              )}

              <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
                {editingId === kt.id ? (
                  <>
                    <button
                      onClick={() => handleRename(kt.id)}
                      disabled={isPending || !editingName.trim()}
                      className="text-sm font-medium text-[#10367D] disabled:opacity-50 lg:text-[15px]"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-500 lg:text-[15px]"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(kt.id)
                        setEditingName(kt.name)
                      }}
                      className="text-sm font-medium text-[#74B4DA] lg:text-[15px]"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDelete(kt.id)}
                      disabled={isPending}
                      className="text-sm font-medium text-red-500 disabled:opacity-50 lg:text-[15px]"
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
