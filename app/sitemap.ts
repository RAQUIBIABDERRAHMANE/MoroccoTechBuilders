import type { MetadataRoute } from 'next';
import { getAllUsersForSitemap } from '@/lib/user-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let userEntries: MetadataRoute.Sitemap = [];
  try {
    const users = await getAllUsersForSitemap();
    userEntries = users.map((u) => ({
      url: `${baseUrl}/u/${u.id}`,
      lastModified: new Date(u.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.warn('Sitemap users fetch warning:', e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...userEntries,
  ];
}
