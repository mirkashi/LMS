/**
 * SEO Metadata Generators
 * Dynamic metadata generation for all page types
 */

import { Metadata } from 'next';
import { SEO_CONFIG, PAGE_SEO } from './seoConfig';

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Generate comprehensive metadata for any page
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  canonicalUrl,
  publishedTime,
  modifiedTime,
  author,
}: GenerateMetadataParams = {}): Metadata {
  const pageTitle = title || SEO_CONFIG.defaultTitle;
  const fullTitle = title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle;
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageImage = image || `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImages.og}`;
  const pageUrl = canonicalUrl || SEO_CONFIG.siteUrl;
  
  // Filter type to only valid OpenGraph types
  const ogType: 'article' | 'website' = (type === 'product' ? 'website' : type);

  return {
    title: fullTitle,
    description: pageDescription,
    keywords: keywords || SEO_CONFIG.keywords.primary.join(', '),
    authors: author ? [{ name: author }] : [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: SEO_CONFIG.social.twitter,
      site: SEO_CONFIG.social.twitter,
    },

    verification: {
      google: 'your-google-verification-code', // Add your verification code
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}

/**
 * Generate metadata for course detail pages
 */
export function generateCourseMetadata(course: any): Metadata {
  const title = course.title;
  const description = course.description?.substring(0, 160) || `Learn ${course.title} from expert instructors`;
  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail}`)
    : undefined;

  const keywords = [
    course.title,
    course.category,
    `${course.level} course`,
    'eBay course',
    'online learning',
    ...SEO_CONFIG.keywords.primary,
  ].join(', ');

  return generateMetadata({
    title,
    description,
    keywords,
    image: imageUrl,
    type: 'article',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/courses/${course._id}`,
    publishedTime: course.createdAt,
    modifiedTime: course.updatedAt,
  });
}

/**
 * Generate metadata for product detail pages
 */
export function generateProductMetadata(product: any): Metadata {
  const title = product.name;
  const description = product.description?.substring(0, 160) || `Buy ${product.name} - Premium eBay resources`;
  
  // Use first image or fallback
  const imageUrl = product.images?.[0] || product.image;
  const fullImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`)
    : undefined;

  const keywords = [
    product.name,
    product.category,
    'eBay tools',
    'eBay resources',
    'shop',
    ...SEO_CONFIG.keywords.secondary,
  ].join(', ');

  return generateMetadata({
    title,
    description,
    keywords,
    image: fullImageUrl,
    type: 'product',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/shop/${product._id}`,
  });
}

/**
 * Generate metadata for course category pages
 */
export function generateCourseCategoryMetadata(category: string): Metadata {
  const title = `${category} Courses - Expert eBay Training`;
  const description = `Browse ${category} courses on eBay selling. Learn from expert consultants with comprehensive training materials and real-world examples.`;
  const keywords = `${category} courses, ${category} training, eBay ${category}, online courses`;

  return generateMetadata({
    title,
    description,
    keywords,
    canonicalUrl: `${SEO_CONFIG.siteUrl}/courses/categories/${encodeURIComponent(category)}`,
  });
}

/**
 * Generate metadata for static pages
 */
export function generateStaticPageMetadata(page: keyof typeof PAGE_SEO): Metadata {
  const config = PAGE_SEO[page];
  return generateMetadata({
    title: config.title,
    description: config.description,
    keywords: config.keywords,
  });
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}
