import { Metadata } from 'next';
import { generateProductMetadata } from '@/lib/seo';

/**
 * Generate dynamic metadata for product detail pages
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return {
        title: 'Product Not Found | 9tangle',
        description: 'The product you are looking for could not be found.',
      };
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return generateProductMetadata(data.data);
    }
  } catch (error) {
    console.error('Error generating product metadata:', error);
  }

  return {
    title: 'Product Details | 9tangle',
    description: 'View product details and add to your cart.',
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
