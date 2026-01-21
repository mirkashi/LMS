import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 * Controls search engine crawler access
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9tangle.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/profile/*',
          '/cart',
          '/checkout',
          '/payment-status/*',
          '/login',
          '/register',
          '/set-password',
          '/verify-code',
          '/wishlist',
          '/*.json',
          '/*?*', // Query parameters (except specific allowed ones)
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/profile/*',
          '/cart',
          '/checkout',
          '/payment-status/*',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
