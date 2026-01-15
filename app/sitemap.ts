import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// 1. Config Base URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ppbisnis.radenfatah.ac.id'

// 2. Init Supabase Client (Khusus untuk sitemap)
// Pastikan env variable ini ada di .env.local atau setting server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 3. Fungsi Fetch Data dari Supabase
async function getDynamicServices() {
  try {
    // Query dari kamu, tapi saya optimasi .select() nya
    // Kita cuma butuh 'slug' dan 'updated_at' untuk sitemap biar ringan
    const { data: servicesData, error } = await supabase
      .from("services")
      .select("slug, updated_at") 
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase Error:", error.message)
      return []
    }

    // Mapping data ke format Sitemap
    return (servicesData || []).map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }))

  } catch (err) {
    console.error("Sitemap Fetch Error:", err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A. Ambil Route Dynamic (Services)
  const dynamicServicesRoutes = await getDynamicServices()

  // B. Route Statis (Halaman Tetap)
  const staticRoutes: MetadataRoute.Sitemap = [
    // --- TIER 1: UTAMA & TRANSAKSI ---
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/catalogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // --- TIER 2: KONTEN & INFO ---
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/sop`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },

    // --- TIER 3: LEGAL ---
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // C. Gabungkan Semuanya
  return [...staticRoutes, ...dynamicServicesRoutes]
}