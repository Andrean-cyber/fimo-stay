import { z } from 'zod'

export const selfSearchSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  kosId: z.string().uuid(),
})

export const recommendationSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  name: z.string().optional(),
  kosTypes: z.array(z.string()).optional(),
  city: z.string().min(1, 'Kota wajib diisi'),
  specificLocation: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  budget: z.coerce.number().optional(),   // coerce karena FormData selalu kirim string
  moveInDate: z.string().optional(),
  notes: z.string().optional(),
})