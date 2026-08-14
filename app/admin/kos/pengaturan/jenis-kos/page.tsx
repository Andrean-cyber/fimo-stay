"use client"

import { useEffect, useState, useTransition } from "react"
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
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold text-[#10367D] mb-4">Jenis Kos</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='cth. "Eksekutif"'
          className="flex-1 border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#74B4DA]"
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#10367D] text-white font-medium disabled:opacity-50"
        >
          Tambah
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <ul className="divide-y divide-[#EBEBEB]">
          {kosTypes.map((kt) => (
            <li key={kt.id} className="flex items-center justify-between py-3">
              {editingId === kt.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border border-[#74B4DA] rounded-lg px-2 py-1 mr-2"
                  autoFocus
                />
              ) : (
                <span>
                  {kt.name}{" "}
                  <span className="text-xs text-gray-400">
                    ({kt._count.segments} segment)
                  </span>
                </span>
              )}

              <div className="flex gap-2">
                {editingId === kt.id ? (
                  <>
                    <button
                      onClick={() => handleRename(kt.id)}
                      disabled={isPending}
                      className="text-sm text-[#10367D] font-medium disabled:opacity-50"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-500"
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
                      className="text-sm text-[#74B4DA] font-medium"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDelete(kt.id)}
                      disabled={isPending}
                      className="text-sm text-red-500 font-medium disabled:opacity-50"
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