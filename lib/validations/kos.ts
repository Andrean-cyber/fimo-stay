import { z } from 'zod'

export const kosSchema = z.object({
  name: z.string().min(3, 'Nama kos minimal 3 karakter'),
  description: z.string().optional(),
  address: z.string().min(5, 'Alamat wajib diisi'),
  district: z.string().optional(),
  city: z.string().min(2, 'Kota wajib diisi'),
  facilities: z.array(z.string()).default([]),
  ownerId: z.string().uuid('Pilih owner'),
})

export const roomTypeSchema = z.object({
  id: z.string().uuid().optional(), // ada kalau edit room type existing, kosong kalau baru
  name: z.string().min(1, 'Nama tipe kamar wajib diisi'),
  priceMonthly: z.coerce.number().int().positive('Harga harus lebih dari 0'),
  totalRooms: z.coerce.number().int().nonnegative().optional(),
  availableRooms: z.coerce.number().int().nonnegative().optional(),
  description: z.string().optional(),
  facilities: z.array(z.string()).default([]),
})

export const segmentSchema = z.object({
  id: z.string().uuid().optional(), // ada kalau edit segment existing
  kosTypeId: z.string().uuid('Pilih jenis kos'),
  name: z.string().optional(), // "Gedung Putra" dst, opsional
  roomTypes: z.array(roomTypeSchema).min(1, 'Minimal 1 tipe kamar per segment'),
})

const nearbySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama tempat wajib diisi'),
  distanceText: z.string().min(1, 'Jarak wajib diisi'),
  category: z.string().optional(),
})

export const segmentsPayloadSchema = z.array(segmentSchema).min(1, 'Minimal 1 segment')

export type SegmentPayload = z.infer<typeof segmentsPayloadSchema>

export const nearbyPayloadSchema = z.array(nearbySchema)