'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import AppImage from '@/components/AppImage';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Shop() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', search: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Placeholder image URL lives here
  const heroBackground = 'https://images.pexels.com/photos/5625070/pexels-photo-5625070.jpeg';
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter((product: any) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      if (sortBy === 'price') {
        aVal = a.price;
        bVal = b.price;
      } else if (sortBy === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortBy === 'rating') {
        aVal = a.rating;
        bVal = b.rating;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [products, filters, sortBy, sortOrder]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const categories = useMemo(() => Array.from(new Set(products.map((p: any) => p.category))), [products]);
  const categoryCounts = useMemo(() => {
    return products.reduce((acc: Record<string, number>, p: any) => {
      if (!p.category) return acc;
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', search: '' });
    setFiltersOpen(false);
  };

  const handleWishlist = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product);
    router.push('/cart');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Classic Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroBackground})` }}
          role="img"
          aria-label="Collection cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/55 to-gray-900/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <div className="inline-flex px-3 py-1 rounded-full border border-white/30 bg-white/10 text-xs uppercase tracking-[0.2em] mb-4">
            New Season Drop
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            The Collection
          </h1>
          <p className="text-lg max-w-2xl mx-auto font-light">
            Curated digital assets and educational resources for the modern entrepreneur.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar filters card */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
              >
                {filtersOpen ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className={`${filtersOpen ? 'block' : 'hidden lg:block'} sticky top-24 space-y-6`}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Refine</p>
                    <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Search */}
                <label className="block text-sm font-medium text-gray-800 mb-2" htmlFor="search">
                  Search products
                </label>
                <div className="relative mb-5">
                  <input
                    id="search"
                    type="text"
                    placeholder="e.g. UI kit, course"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm shadow-inner"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-800 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, category: '' })}
                      className={`px-3 py-2 text-sm rounded-full border transition-all ${
                        filters.category === ''
                          ? 'bg-gray-900 text-white border-gray-900 shadow'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    {categories.map((category: any) => (
                      <button
                        key={category}
                        onClick={() => setFilters({ ...filters, category })}
                        className={`px-3 py-2 text-sm rounded-full border transition-all ${
                          filters.category === category
                            ? 'bg-gray-900 text-white border-gray-900 shadow'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                        aria-pressed={filters.category === category}
                      >
                        {category} ({categoryCounts[category] || 0})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-800">Price range (PKR)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500" htmlFor="min-price">Min</label>
                      <input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500" htmlFor="max-price">Max</label>
                      <input
                        id="max-price"
                        type="number"
                        placeholder="50000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Tip: leave blank for no limit.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-4 sm:mb-0">
                Showing <span className="font-medium text-gray-900">{currentItems.length}</span> of <span className="font-medium text-gray-900">{filteredProducts.length}</span> results
              </p>
              
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer text-gray-700 font-medium hover:text-gray-900"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                </select>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-gray-700 font-medium hover:text-gray-900"
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>

            {/* Grid */}
            {currentItems.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button 
                  onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', search: '' })}
                  className="mt-4 text-gray-900 underline hover:text-gray-600"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {currentItems.map((product: any) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/shop/${product._id}`)}
                  >
                    <div className="block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                        {(product.images?.[0] || product.image) ? (
                          <AppImage
                            path={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100 text-gray-300">
                            📦
                          </div>
                        )}
                        {!product.isAvailable && (
                          <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                            Sold Out
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="text-center mb-3">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{product.category}</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold text-gray-900">PKR {product.price}</span>
                            {product.rating > 0 && (
                              <div className="flex items-center text-yellow-500 text-xs">
                                <span>★</span>
                                <span className="ml-1 text-gray-400">{product.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-3 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => handleWishlist(e, product)}
                            className="p-2 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            aria-label="Add to wishlist"
                          >
                            {isInWishlist(product._id) ? (
                              <HeartIconSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5 text-gray-900" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
