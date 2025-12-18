'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get all products from the backend
        // Note: You may want to create a public endpoint for this
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to empty state
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold mb-4">Shop</h1>
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-4">Shop</h1>
        <p className="text-gray-600 text-lg mb-12">
          Purchase our courses and digital products
        </p>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No products available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product: any) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <div className="bg-gradient-primary h-48 flex items-center justify-center text-white text-6xl overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <button
                    disabled={!product.isAvailable}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                      product.isAvailable
                        ? 'bg-gradient-primary text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {product.isAvailable ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
