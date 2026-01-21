import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('contact');

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
