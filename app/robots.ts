import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/u/'],
      disallow: ['/api/', '/scan', '/admin', '/profile', '/reset-password'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
