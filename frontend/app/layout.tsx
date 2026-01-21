import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnnouncementBar from '../components/AnnouncementBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { ShopProvider } from '../context/ShopContext';
import { SEO_CONFIG, generateOrganizationSchema, generateWebsiteSchema, JsonLd } from '../lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: SEO_CONFIG.keywords.primary.join(', '),
  authors: [{ name: SEO_CONFIG.siteName }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SEO_CONFIG.siteUrl,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImages.og}`,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.defaultTitle,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [`${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImages.twitter}`],
    creator: SEO_CONFIG.social.twitter,
    site: SEO_CONFIG.social.twitter,
  },

  verification: {
    google: 'your-google-verification-code', // Add your verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Global SEO: JSON-LD Structured Data */}
        <JsonLd
          data={[
            generateOrganizationSchema(),
            generateWebsiteSchema(),
          ]}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ShopProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
