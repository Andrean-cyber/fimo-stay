import { z } from 'zod'

export const selfSearchSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  kosId: z.string().uuid(),
})

export const recommendationSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  name: z.string().min(1, 'Nama wajib diisi'),
  kosTypes: z.array(z.string()).min(1, 'Pilih minimal satu jenis kos'),
  city: z.string().min(1, 'Kota wajib diisi'),
  specificLocation: z.string().min(1, 'Lokasi spesifik wajib diisi'),
  facilities: z.array(z.string()).min(1, 'Pilih minimal satu fasilitas'),
  budget: z.coerce.number({ invalid_type_error: 'Budget wajib diisi' }).positive('Budget wajib diisi'),   // coerce karena FormData selalu kirim string
  moveInDate: z.string().min(1, 'Tanggal pindah wajib diisi'),
  notes: z.string().min(1, 'Catatan wajib diisi'),
})