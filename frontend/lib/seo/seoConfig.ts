/**
 * SEO Configuration for 9tangle LMS Platform
 * Centralized SEO settings and constants
 */

export const SEO_CONFIG = {
  // Site Information
  siteName: '9tangle',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://9tangle.com',
  defaultTitle: '9tangle - Professional eBay Consultant LMS Platform',
  titleTemplate: '%s | 9tangle',
  defaultDescription: 'Master eBay selling with expert-led courses. Learn proven strategies, tips, and techniques from professional eBay consultants. Join thousands of successful sellers.',
  
  // Brand Information
  brand: {
    name: '9tangle',
    tagline: 'Professional eBay Consultant LMS',
    foundingYear: '2024',
  },

  // Social Media
  social: {
    twitter: '@9tangle',
    facebook: 'https://facebook.com/9tangle',
    instagram: 'https://instagram.com/9tangle',
    linkedin: 'https://linkedin.com/company/9tangle',
    youtube: 'https://youtube.com/@9tangle',
  },

  // Contact Information
  contact: {
    email: 'support@9tangle.com',
    phone: '+1-XXX-XXX-XXXX', // Update with actual phone
  },

  // Default Images
  defaultImages: {
    og: '/images/og-default.jpg',
    twitter: '/images/twitter-default.jpg',
    logo: '/logo.png',
  },

  // Organization Schema
  organization: {
    '@type': 'EducationalOrganization',
    name: '9tangle',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://9tangle.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://9tangle.com'}/logo.png`,
    sameAs: [
      'https://facebook.com/9tangle',
      'https://twitter.com/9tangle',
      'https://instagram.com/9tangle',
      'https://linkedin.com/company/9tangle',
      'https://youtube.com/@9tangle',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      email: 'support@9tangle.com',
      availableLanguage: 'English',
    },
  },

  // SEO Keywords
  keywords: {
    primary: ['eBay courses', 'eBay consultant', 'eBay training', 'online learning', 'eCommerce education'],
    secondary: ['eBay selling tips', 'eBay business', 'online selling courses', 'eCommerce training', 'professional development'],
  },

  // Robots Configuration
  robots: {
    default: 'index, follow',
    noindex: 'noindex, nofollow',
  },
};

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'Professional eBay Consultant LMS Platform',
    description: 'Master eBay selling with expert-led courses. Learn proven strategies, tips, and techniques from professional eBay consultants. Join thousands of successful sellers.',
    keywords: 'eBay courses, eBay training, online learning, eCommerce education, eBay consultant',
  },
  courses: {
    title: 'eBay Courses - Learn from Expert Consultants',
    description: 'Browse our comprehensive collection of eBay courses taught by industry experts. From beginner to advanced, find the perfect course to elevate your eBay selling skills.',
    keywords: 'eBay courses, online courses, eBay training, eCommerce courses, professional development',
  },
  shop: {
    title: 'Shop eBay Tools & Resources',
    description: 'Discover premium tools, templates, and resources to boost your eBay business. Professional-grade materials designed by expert eBay consultants.',
    keywords: 'eBay tools, eBay templates, eBay resources, selling tools, eCommerce products',
  },
  about: {
    title: 'About Us - Professional eBay Consultants',
    description: 'Learn about 9tangle and our mission to empower eBay sellers through expert education and professional resources. Meet our team of experienced consultants.',
    keywords: 'about 9tangle, eBay consultants, online education, company mission',
  },
  contact: {
    title: 'Contact Us - Get Expert Support',
    description: 'Have questions? Get in touch with our expert team. We\'re here to help you succeed with your eBay business and learning journey.',
    keywords: 'contact support, customer service, help desk, eBay support',
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our courses, enrollment, pricing, and platform features. Get the information you need quickly.',
    keywords: 'FAQ, help, support, questions, course information',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how 9tangle collects, uses, and protects your personal information. Your privacy and data security are our top priorities.',
    keywords: 'privacy policy, data protection, user privacy, security',
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Read our terms of service, usage guidelines, and legal agreements. Understanding your rights and responsibilities on our platform.',
    keywords: 'terms of service, user agreement, legal terms, conditions',
  },
};
