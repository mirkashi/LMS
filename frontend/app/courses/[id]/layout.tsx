import { Metadata } from 'next';
import { generateCourseMetadata } from '@/lib/seo';

/**
 * Generate dynamic metadata for course detail pages
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return {
        title: 'Course Not Found | 9tangle',
        description: 'The course you are looking for could not be found.',
      };
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return generateCourseMetadata(data.data);
    }
  } catch (error) {
    console.error('Error generating course metadata:', error);
  }

  return {
    title: 'Course Details | 9tangle',
    description: 'View course details and enroll in expert-led eBay training.',
  };
}

export default function CourseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
