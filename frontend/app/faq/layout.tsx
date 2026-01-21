import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('faq');

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
