'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            9tangle
          </Link>

          {/* Menu Items */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-primary transition">
              Home
            </Link>
            <Link href="/courses" className="hover:text-primary transition">
              Courses
            </Link>
            <Link href="/shop" className="hover:text-primary transition">
              Shop
            </Link>
            <Link href="/about" className="hover:text-primary transition">
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-primary text-white hover:shadow-lg transition"
                >
                  <span>{user?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl">
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-primary text-white hover:shadow-lg transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
