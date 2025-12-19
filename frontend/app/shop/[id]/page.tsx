'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('standard');
  
  // Mock reviews
  const [reviews] = useState<Review[]>([
    { id: '1', user: 'John Doe', rating: 5, comment: 'Great product! Highly recommend.', date: '2023-10-01' },
    { id: '2', user: 'Jane Smith', rating: 4, comment: 'Good quality, fast delivery.', date: '2023-09-28' },
    { id: '3', user: 'Bob Johnson', rating: 5, comment: 'Excellent value for money.', date: '2023-09-25' },
  ]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link href="/shop" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-blue-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="p-8 bg-gray-50 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-200">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg aspect-square bg-white rounded-xl shadow-lg overflow-hidden group"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100 text-gray-300">
                    📦
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={handleWishlist}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
                  >
                    {isInWishlist(product._id) ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide rounded-full mb-4">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-yellow-400 text-lg">
                    {'★'.repeat(Math.round(product.rating || 5))}
                    {'☆'.repeat(5 - Math.round(product.rating || 5))}
                  </div>
                  <span className="text-gray-500 text-sm">({product.totalRatings || 0} reviews)</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium text-sm`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  PKR {product.price}
                </div>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {/* Variants & Actions */}
              <div className="mt-auto space-y-8">
                {/* Mock Variants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">License Type</label>
                  <div className="flex flex-wrap gap-3">
                    {['Standard', 'Extended', 'Commercial'].map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant.toLowerCase())}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                          selectedVariant === variant.toLowerCase()
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-xl">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-4 font-medium text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-8 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
            <div className="p-8 lg:p-12 bg-gray-50/50">
              {activeTab === 'description' ? (
                <div className="prose max-w-none text-gray-600">
                  <p>{product.description}</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Features</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>High-quality digital assets</li>
                    <li>Instant download after purchase</li>
                    <li>Compatible with major software</li>
                    <li>Free updates for life</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{review.user}</h4>
                            <div className="flex text-yellow-400 text-xs">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products (Mock) */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-100"></div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">Related Product {i}</h3>
                  <p className="text-sm text-gray-500 mb-3">Category</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600">PKR 49.00</span>
                    <button className="text-sm text-gray-600 hover:text-blue-600">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}