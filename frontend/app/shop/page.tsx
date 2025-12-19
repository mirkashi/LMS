'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Shop() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', search: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  const categories = Array.from(new Set(products.map((p: any) => p.category)));

  const handleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
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
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            The Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Curated digital assets and educational resources for the modern entrepreneur.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Refined Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
            {/* Search */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-200 pb-2">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-200 pb-2">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className={`block w-full text-left text-sm transition-colors ${
                    filters.category === '' ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Products
                </button>
                {categories.map((category: any) => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={`block w-full text-left text-sm transition-colors ${
                      filters.category === category ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-200 pb-2">Price</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:border-gray-900 outline-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-none focus:border-gray-900 outline-none text-sm"
                />
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
                    className="group"
                  >
                    <Link href={`/shop/${product._id}`} className="block">
                      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
                        {product.image ? (
                          <img
                            src={product.image}
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
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => handleWishlist(e, product)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          >
                            {isInWishlist(product._id) ? (
                              <HeartIconSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5 text-gray-900" />
                            )}
                          </button>
                        </div>

                        {/* Quick Add Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white/90 backdrop-blur text-gray-900 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-gray-900">${product.price}</span>
                          {product.rating > 0 && (
                            <div className="flex items-center text-yellow-500 text-xs">
                              <span>★</span>
                              <span className="ml-1 text-gray-400">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
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
