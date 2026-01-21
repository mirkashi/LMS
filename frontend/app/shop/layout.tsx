import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('shop');

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
