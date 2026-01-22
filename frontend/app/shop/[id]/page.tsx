"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/context/ShopContext";
import {
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import AppImage from "@/components/AppImage";
import { JsonLd, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  stock: number;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
}

interface Review {
  _id: string;
  user: { name: string; email?: string } | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("standard");
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        console.log('Product data received:', data.data);
        console.log('Product images:', data.data?.images);
        console.log('Product image (legacy):', data.data?.image);
        setProduct(data.data);
        setAvgRating(data.data?.rating || 0);
        setTotalRatings(data.data?.totalRatings || 0);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}/reviews`);
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  };

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setReviewMessage('Please login to leave a review.');
      return;
    }
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewMessage('Select a rating between 1 and 5 stars.');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewForm),
      });

      if (!res.ok) {
        const data = await res.json();
        setReviewMessage(data.message || 'Unable to submit review right now.');
        return;
      }

      const data = await res.json();
      setAvgRating(data.data.rating || 0);
      setTotalRatings(data.data.totalRatings || 0);
      setReviews(data.data.reviews || []);
      setReviewForm({ rating: 0, comment: '' });
      setReviewMessage('Review submitted. Thank you!');
    } catch (err) {
      console.error('Review submit error', err);
      setReviewMessage('Unable to submit review right now.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const images = useMemo(() => {
    const gallery = product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
    console.log('Images gallery computed:', gallery);
    return gallery.length ? gallery : [];
  }, [product]);

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
    <>
      {/* SEO: JSON-LD Structured Data */}
      {product && (
        <JsonLd
          data={[
            generateProductSchema(product),
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Shop', url: '/shop' },
              { name: product.name, url: `/shop/${product._id}` },
            ]),
          ]}
        />
      )}
      
      <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Link href="/shop" className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Shop
          </Link>
          <span>•</span>
          <span className="text-gray-400">Product</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-900/5 p-6 sm:p-10">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
              <AnimatePresence initial={false} mode="wait">
                {images.length > 0 ? (
                  <motion.div
                    key={images[activeImage]}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="aspect-square"
                  >
                    <button type="button" className="w-full h-full" onClick={() => setZoomOpen(true)}>
                      <AppImage
                        path={images[activeImage]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                      />
                    </button>
                  </motion.div>
                ) : (
                  <div className="aspect-square flex items-center justify-center text-5xl text-gray-300">📦</div>
                )}
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    onMouseEnter={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                      idx === activeImage ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <AppImage path={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {product.category}
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
                <p className="text-gray-600 leading-relaxed max-w-2xl">{product.description}</p>
              </div>
              <button
                onClick={handleWishlist}
                className="p-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                aria-label="Toggle wishlist"
              >
                {isInWishlist(product._id) ? <HeartIconSolid className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6 text-gray-700" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < Math.round(avgRating) ? <StarIconSolid key={i} className="w-5 h-5" /> : <StarIcon key={i} className="w-5 h-5" />
                )}
              </div>
              <span className="text-gray-700 font-medium">{avgRating.toFixed(1)} / 5</span>
              <span className="text-gray-500">({totalRatings} reviews)</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-4xl font-semibold text-gray-900">PKR {product.price}</div>
              <div className="text-sm text-gray-500">Inclusive of all taxes</div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm text-gray-700 mb-2">License Type</p>
                <div className="flex flex-wrap gap-2">
                  {['Standard', 'Extended', 'Commercial'].map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant.toLowerCase())}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        selectedVariant === variant.toLowerCase()
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-l-full"
                  >
                    -
                  </button>
                  <span className="px-5 font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-r-full"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-900 px-6 py-3 text-gray-900 font-semibold hover:bg-gray-50 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-white font-semibold shadow-lg hover:bg-gray-800 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                Why you’ll love it
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 list-disc pl-5">
                <li>Instant digital delivery with lifetime access</li>
                <li>Optimized assets for modern workflows</li>
                <li>Free updates on future improvements</li>
                <li>Dedicated support for questions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 sm:px-8 py-4 text-sm font-semibold transition border-b-2 ${
                  activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{product.description}</p>
                <h3 className="mt-6 mb-3 text-xl font-semibold text-gray-900">What’s included</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>High-quality source files</li>
                  <li>Usage guidelines and quick-start tips</li>
                  <li>Access to updates and improvements</li>
                  <li>Priority email support</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <div className="text-4xl font-semibold text-gray-900 mt-1">{avgRating.toFixed(1)}</div>
                    <div className="flex items-center gap-1 text-yellow-500 mt-2">
                      {Array.from({ length: 5 }).map((_, i) =>
                        i < Math.round(avgRating) ? <StarIconSolid key={i} className="w-5 h-5" /> : <StarIcon key={i} className="w-5 h-5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Based on {totalRatings} ratings</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleReviewSubmit}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Your rating</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: i + 1 }))}
                            className="text-yellow-500 hover:scale-110 transition"
                            aria-label={`Rate ${i + 1} star`}
                          >
                            {reviewForm.rating >= i + 1 ? <StarIconSolid className="w-7 h-7" /> : <StarIcon className="w-7 h-7" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Your review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        rows={4}
                        maxLength={1000}
                        placeholder="Share your experience"
                      />
                    </div>

                    {reviewMessage && <p className="text-sm text-gray-700">{reviewMessage}</p>}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full inline-flex justify-center items-center gap-2 bg-gray-900 text-white font-semibold rounded-xl py-3 hover:bg-gray-800 disabled:opacity-60"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit review'}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  {reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first to share your thoughts.</p>}
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                            {(review.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.user?.name || 'Customer'}</p>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) =>
                                i < review.rating ? <StarIconSolid key={i} className="w-4 h-4" /> : <StarIcon key={i} className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.comment && <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {zoomOpen && images[activeImage] && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <AppImage
                  path={images[activeImage]}
                  alt={product.name}
                  className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-white"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
    </>
  );
}