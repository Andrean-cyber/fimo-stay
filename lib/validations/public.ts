import { z } from 'zod'

export const selfSearchSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  kosId: z.string().uuid(),
})

export const recommendationSchema = z.object({
  phone: z.string().min(8, 'Nomor HP tidak valid').max(20),
  preferenceNotes: z.string().min(10, 'Jelaskan preferensimu (min. 10 karakter)'),
})