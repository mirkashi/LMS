import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap generation
 * Automatically includes all courses, products, and static pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9tangle.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch dynamic courses
  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const coursesResponse = await fetch(`${apiUrl}/courses`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      if (coursesData.success && Array.isArray(coursesData.data)) {
        coursePages = coursesData.data.map((course: any) => ({
          url: `${siteUrl}/courses/${course._id}`,
          lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  // Fetch dynamic products
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const productsResponse = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success && Array.isArray(productsData.data)) {
        productPages = productsData.data.map((product: any) => ({
          url: `${siteUrl}/shop/${product._id}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...coursePages, ...productPages];
}
