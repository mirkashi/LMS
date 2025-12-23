'use client';

import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { TrashIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AppImage from '@/components/AppImage';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(product);
    router.push('/cart');
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/${productId}`);
  };

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save your favorite products here!</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Product Image */}
              <div 
                className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => handleViewProduct(product._id)}
              >
                {(product.images?.[0] || product.image) ? (
                  <AppImage
                    path={product.images?.[0] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                    📦
                  </div>
                )}
                
                {/* Remove Button Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(product._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 
                  className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleViewProduct(product._id)}
                >
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize mb-3">{product.category}</p>
                <p className="text-xl font-bold text-gray-900 mb-4">PKR {product.price}</p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleViewProduct(product._id)}
                    className="w-full border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
