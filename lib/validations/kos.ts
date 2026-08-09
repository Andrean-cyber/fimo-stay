import { z } from 'zod'

export const kosSchema = z.object({
  name: z.string().min(3, 'Nama kos minimal 3 karakter'),
  description: z.string().optional(),
  address: z.string().min(5, 'Alamat wajib diisi'),
  city: z.string().min(2, 'Kota wajib diisi'),
  priceMonthly: z.coerce.number().int().positive('Harga harus lebih dari 0'),
  roomType: z.string().optional(),
  facilities: z.array(z.string()).default([]),
  ownerId: z.string().uuid('Pilih owner'),
})