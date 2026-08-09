import { z } from 'zod'

export const ownerSchema = z.object({
  name: z.string().min(2, 'Nama wajib diisi'),
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  address: z.string().optional(),
  notes: z.string().optional(),
})