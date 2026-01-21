import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateStaticPageMetadata('courses');

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
