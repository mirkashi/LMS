# SEO Quick Reference - 9tangle LMS

## 🚀 Quick Start

### 1. Configure Environment
```bash
# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=https://9tangle.com
```

### 2. Update Site Information
Edit `frontend/lib/seo/seoConfig.ts`:
- Site URL
- Social media links
- Contact information
- Google verification code

### 3. Deploy & Submit
- Deploy to production
- Submit sitemap to Google Search Console
- Monitor indexing status

---

## 📋 File Locations

| Component | File Path |
|-----------|-----------|
| SEO Config | `frontend/lib/seo/seoConfig.ts` |
| Metadata Generators | `frontend/lib/seo/metadata.ts` |
| Schema Generators | `frontend/lib/seo/schema.ts` |
| Sitemap | `frontend/app/sitemap.ts` |
| Robots.txt | `frontend/app/robots.ts` |
| Global Layout | `frontend/app/layout.tsx` |
| Backend SEO API | `backend/routes/seo.js` |

---

## 🔧 Common Tasks

### Add SEO to New Page

1. **Create layout.tsx** in page directory:
```tsx
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: 'keyword1, keyword2',
});

export default function Layout({ children }) {
  return children;
}
```

2. **Add to sitemap** (if static):
Edit `frontend/app/sitemap.ts`

3. **Add schema** (optional):
```tsx
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo';

export default function Page() {
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([...])} />
      {/* content */}
    </>
  );
}
```

### Update Meta Description

Edit page's `layout.tsx`:
```tsx
export const metadata: Metadata = {
  description: 'New description here (150-160 chars)',
};
```

### Add Structured Data

```tsx
import { JsonLd, generateCourseSchema } from '@/lib/seo';

<JsonLd data={generateCourseSchema(course)} />
```

---

## 🧪 Testing URLs

| Test | URL |
|------|-----|
| Sitemap | `/sitemap.xml` |
| Robots | `/robots.txt` |
| Rich Results | https://search.google.com/test/rich-results |
| PageSpeed | https://pagespeed.web.dev/ |
| Open Graph | https://developers.facebook.com/tools/debug/ |
| Twitter Card | https://cards-dev.twitter.com/validator |

---

## 📊 Available Schema Types

```tsx
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateCourseSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateReviewSchema,
} from '@/lib/seo';
```

---

## 🎯 SEO Best Practices Checklist

### Every Page Must Have:
- [ ] Unique title tag (< 60 chars)
- [ ] Unique meta description (150-160 chars)
- [ ] Relevant keywords
- [ ] Canonical URL
- [ ] Proper heading hierarchy (H1 → H2 → H3)

### Course/Product Pages:
- [ ] High-quality images with alt text
- [ ] Detailed description
- [ ] Structured data (Schema.org)
- [ ] Breadcrumb navigation
- [ ] User reviews (when available)

### Technical:
- [ ] Mobile responsive
- [ ] Fast load time (< 3s)
- [ ] HTTPS enabled
- [ ] No broken links
- [ ] Clean URL structure

---

## 🔍 Keyword Optimization

### Primary Keywords:
- eBay courses
- eBay consultant
- eBay training
- Online learning
- eCommerce education

### Secondary Keywords:
- eBay selling tips
- eBay business
- Online selling courses
- eCommerce training
- Professional development

### Usage:
- Title tag: Primary keyword
- H1: Primary keyword (natural)
- First paragraph: Primary + secondary
- Subheadings: Secondary keywords
- Image alt text: Relevant keywords
- Meta description: Primary keyword + CTA

---

## 📈 Key Metrics to Monitor

### Google Search Console:
- Total clicks
- Total impressions
- Average CTR
- Average position
- Crawl errors
- Mobile usability

### Target Goals:
- Organic traffic: +20% monthly
- Average position: Top 10 for primary keywords
- CTR: > 3%
- Page speed: > 90 score
- Core Web Vitals: All "Good"

---

## 🆘 Quick Fixes

### Issue: Meta tags not showing
```bash
# Clear cache and rebuild
npm run build
# Verify in browser (View Page Source)
```

### Issue: Sitemap not updating
```bash
# Check API connection
curl http://localhost:5000/api/courses
# Clear Next.js cache
rm -rf .next
npm run build
```

### Issue: Schema validation errors
1. Test: https://search.google.com/test/rich-results
2. Check for missing required fields
3. Ensure all URLs are absolute
4. Verify JSON syntax

---

## 🔗 Important Links

- **Google Search Console**: https://search.google.com/search-console
- **Schema Validator**: https://validator.schema.org/
- **Rich Results Test**: https://search.google.com/test/rich-results
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/

---

## 📞 Support Contacts

For SEO-related questions:
1. Check `SEO_IMPLEMENTATION_GUIDE.md` (full documentation)
2. Review this quick reference
3. Test with provided tools
4. Contact development team

---

**Quick Tip**: After any SEO change, always:
1. Test locally
2. Validate with testing tools
3. Deploy to production
4. Monitor in Google Search Console
5. Track rankings after 2-3 weeks

---

**Version**: 1.0  
**Last Updated**: January 21, 2026
