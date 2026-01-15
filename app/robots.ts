import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'http://ppbisnis.radenfatah.ac.id'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Ganti '/admin/' sesuai nama folder route admin kamu (misal /dashboard/)
      disallow: ['/admin/', '/private/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}