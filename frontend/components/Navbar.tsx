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

    // Listen for localStorage changes from other tabs/profile page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        } else if (user.avatar.startsWith('/')) {
          return `${apiUrl}${user.avatar}`;
        } else {
          return `${apiUrl}/${user.avatar}`;
        }
      })()
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-md">
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
                  className="flex items-center space-x-3 px-3 py-2 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow transition"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-primary text-white flex items-center justify-center text-sm font-semibold">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }} />
                    ) : null}
                    {!avatarUrl && (
                      (user?.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 origin-top-right transform transition-all duration-150 ease-out ${
                    isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
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
