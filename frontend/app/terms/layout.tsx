import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('terms');

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
