/**
 * JSON-LD Schema Generators
 * Structured data for rich snippets and enhanced SEO
 */

import { SEO_CONFIG } from './seoConfig';

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SEO_CONFIG.siteName,
    alternateName: SEO_CONFIG.brand.tagline,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImages.logo}`,
    description: SEO_CONFIG.defaultDescription,
    foundingDate: SEO_CONFIG.brand.foundingYear,
    sameAs: SEO_CONFIG.organization.sameAs,
    contactPoint: SEO_CONFIG.organization.contactPoint,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US', // Update with actual country
    },
  };
}

/**
 * Generate Course Schema (Educational)
 */
export function generateCourseSchema(course: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
    ...(course.thumbnail && {
      image: course.thumbnail.startsWith('http') 
        ? course.thumbnail 
        : `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail}`,
    }),
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SEO_CONFIG.siteUrl}/courses/${course._id}`,
      category: 'Education',
    },
    aggregateRating: course.totalRatings > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      ratingCount: course.totalRatings,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    educationalLevel: course.level,
    coursePrerequisites: course.prerequisites || 'None',
    ...(course.duration && {
      timeRequired: `PT${course.duration}H`,
    }),
    inLanguage: 'en-US',
    courseCode: course._id,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration ? `PT${course.duration}H` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  };
}

/**
 * Generate Product Schema (for shop items)
 */
export function generateProductSchema(product: any) {
  const imageUrl = product.images?.[0] || product.image;
  const fullImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`)
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(fullImageUrl && {
      image: product.images?.map((img: string) => 
        img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}${img}`
      ) || [fullImageUrl],
    }),
    brand: {
      '@type': 'Brand',
      name: SEO_CONFIG.siteName,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.isAvailable && product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${SEO_CONFIG.siteUrl}/shop/${product._id}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SEO_CONFIG.siteName,
      },
    },
    aggregateRating: product.totalRatings > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      ratingCount: product.totalRatings,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    sku: product._id,
    category: product.category,
  };
}

/**
 * Generate ItemList Schema (for course/product listings)
 */
export function generateItemListSchema(items: any[], type: 'Course' | 'Product', listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': type,
        name: item.title || item.name,
        description: item.description,
        url: `${SEO_CONFIG.siteUrl}/${type === 'Course' ? 'courses' : 'shop'}/${item._id}`,
      },
    })),
  };
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Website Schema
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    publisher: generateOrganizationSchema(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Review Schema
 */
export function generateReviewSchema(review: any, itemName: string, itemType: 'Course' | 'Product') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': itemType,
      name: itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.user?.name || 'Anonymous',
    },
    reviewBody: review.comment,
    datePublished: review.createdAt,
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SEO_CONFIG.siteUrl}${crumb.url}`,
    })),
  };
}
