'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useShop } from '@/context/ShopContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlist } = useShop();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarRefresh, setAvatarRefresh] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [wishPulse, setWishPulse] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname === '/shop') {
      setCartPulse(true);
      const t = setTimeout(() => setCartPulse(false), 450);
      return () => clearTimeout(t);
    }
  }, [cartCount, pathname]);

  useEffect(() => {
    if (pathname === '/shop') {
      setWishPulse(true);
      const t = setTimeout(() => setWishPulse(false), 450);
      return () => clearTimeout(t);
    }
  }, [wishlist.length, pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        setUser(JSON.parse(e.newValue));
        setAvatarRefresh(Date.now());
      }
    };

    const handleUserUpdate = (e: CustomEvent) => {
      setUser(e.detail.user);
      setAvatarRefresh(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const avatarUrl = user?.avatar
    ? (() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//localhost:5000`;
        let url;
        if (user.avatar.startsWith('http')) {
          url = user.avatar;
        } else if (user.avatar.startsWith('/')) {
          url = `${apiUrl}${user.avatar}`;
        } else {
          url = `${apiUrl}/${user.avatar}`;
        }
        return `${url}?refresh=${avatarRefresh}`;
      })()
    : null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav 
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              9
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              tangle
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === link.href ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {pathname === '/shop' && (
              <div className="hidden md:flex items-center gap-3">
                <button
                  className={`relative p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all ${cartPulse ? 'animate-bounce' : ''}`}
                  onClick={() => router.push('/checkout')}
                  aria-label="View cart"
                >
                  <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>

                <button
                  className={`relative p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all ${wishPulse ? 'animate-bounce' : ''}`}
                  onClick={() => router.push('/wishlist')}
                  aria-label="View wishlist"
                >
                  <HeartIcon className="w-5 h-5 text-gray-800" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                </button>
              </div>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 bg-white hover:shadow-md transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1"
                    >
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Dashboard
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile
                      </Link>
                      <div className="h-px bg-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-base font-medium ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg border border-gray-200 text-gray-600 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg bg-gray-900 text-white font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
