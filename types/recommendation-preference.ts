export type RecommendationPreference = {
    name?: string
    phone?: string
    kosTypes?: string[]       // dari checkbox "Jenis Kos"
    city?: string             // dari input "Kota"
    specificLocation?: string
    facilities?: string[]     // dari checkbox "Fasilitas"
    budget?: number           // dari input budget (number)
    moveInDate?: string
    notes?: string
  }