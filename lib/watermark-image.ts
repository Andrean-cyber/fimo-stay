export async function addWatermark(
    file: File,
    options: { logoUrl?: string; opacity?: number; scale?: number } = {}
  ): Promise<File> {
    const { logoUrl = '/lgfimostay-white.webp', opacity = 0.9, scale = 0.35 } = options
  
    const imageBitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height
  
    const ctx = canvas.getContext('2d')
    if (!ctx) return file // fallback kalau canvas tidak didukung
  
    // Gambar foto asli dulu
    ctx.drawImage(imageBitmap, 0, 0)
  
    // Load logo watermark
    const logo = await loadImage(logoUrl)
  
    // Logo diposisikan center, lebar sekitar `scale` dari lebar foto
    const logoWidth = canvas.width * scale
    const logoHeight = logoWidth * (logo.height / logo.width)
    const x = (canvas.width - logoWidth) / 2
    const y = (canvas.height - logoHeight) / 2
  
    ctx.globalAlpha = opacity
    ctx.drawImage(logo, x, y, logoWidth, logoHeight)
    ctx.globalAlpha = 1
  
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Gagal membuat blob dari canvas'))),
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.9
      )
    })
  
    return new File([blob], file.name, { type: blob.type })
  }
  
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }