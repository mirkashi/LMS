import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('about');

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
