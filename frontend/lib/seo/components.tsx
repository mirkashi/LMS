/**
 * SEO Helper Components
 * React components for adding structured data and meta tags
 */

import React from 'react';

interface JsonLdProps {
  data: object | object[];
}

/**
 * Component to inject JSON-LD structured data
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonData = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {jsonData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </>
  );
}

interface CanonicalLinkProps {
  url: string;
}

/**
 * Component for canonical URL
 */
export function CanonicalLink({ url }: CanonicalLinkProps) {
  return <link rel="canonical" href={url} />;
}

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Component for additional meta tags
 */
export function MetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: MetaTagsProps) {
  return (
    <>
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      {type && <meta property="og:type" content={type} />}
    </>
  );
}

/**
 * Component for preconnect links to improve performance
 */
export function PreconnectLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </>
  );
}
