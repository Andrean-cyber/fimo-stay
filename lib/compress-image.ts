/**
 * Compress & resize gambar di browser sebelum upload.
 *
 * Kenapa perlu ini: foto dari kamera HP owner kos biasanya 3-8MB dan
 * resolusinya jauh lebih besar dari yang dibutuhkan di web (misal 4000px
 * lebar, padahal tampil di layar paling lebar ~1200px). Tanpa compress,
 * setiap foto yang ditambahkan bikin halaman detail kos makin berat,
 * apalagi project ini pakai `images.unoptimized: true` (next/image tidak
 * resize otomatis di Cloudflare Workers tanpa setup Cloudflare Images).
 *
 * Strategi: resize ke lebar maksimum + convert ke WebP dengan kualitas
 * terkontrol, semua terjadi di browser pengguna sebelum file dikirim ke
 * server — jadi tidak menambah beban server/Workers sama sekali.
 */

type CompressOptions = {
    /** Lebar maksimum hasil compress, sisi lain menyesuaikan rasio. Default 1600px — cukup tajam untuk galeri & lightbox. */
    maxWidth?: number
    /** Kualitas WebP, 0–1. Default 0.8 — biasanya nyaris tidak terlihat bedanya secara visual. */
    quality?: number
    /** Format output. Default 'webp' — ukurannya jauh lebih kecil dari JPEG di kualitas yang sama. */
    outputType?: 'image/webp' | 'image/jpeg'
  }
  
  export async function compressImage(
    file: File,
    options: CompressOptions = {}
  ): Promise<File> {
    const { maxWidth = 1600, quality = 0.8, outputType = 'image/webp' } = options
  
    // Kalau bukan gambar (misal user salah pilih file), kembalikan apa adanya —
    // biar validasi tipe file tetap jadi tanggung jawab form, bukan di sini.
    if (!file.type.startsWith('image/')) return file
  
    const bitmap = await createImageBitmap(file)
  
    // Jangan upscale foto yang memang sudah kecil.
    const scale = Math.min(1, maxWidth / bitmap.width)
    const targetWidth = Math.round(bitmap.width * scale)
    const targetHeight = Math.round(bitmap.height * scale)
  
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
  
    const ctx = canvas.getContext('2d')
    if (!ctx) return file // fallback: kalau canvas tidak tersedia, upload asli saja
  
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()
  
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    )
  
    // Fallback kalau browser gagal encode (jarang terjadi, tapi jangan sampai upload gagal total)
    if (!blob) return file
  
    const newName = file.name.replace(/\.[^.]+$/, '') + (outputType === 'image/webp' ? '.webp' : '.jpg')
  
    return new File([blob], newName, { type: outputType })
  }
  
  /**
   * Compress beberapa file sekaligus (misal dari <input type="file" multiple />).
   * Dijalankan berurutan (bukan Promise.all) supaya tidak membebani memori browser
   * kalau owner sekaligus pilih 10+ foto besar.
   */
  export async function compressImages(
    files: File[],
    options?: CompressOptions
  ): Promise<File[]> {
    const results: File[] = []
    for (const file of files) {
      results.push(await compressImage(file, options))
    }
    return results
  }