'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const isExpanded = isMobile ? sidebarOpen : sidebarHover;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } ${isExpanded ? 'w-64' : 'w-20'} ${isMobile ? 'lg:translate-x-0' : ''}`}
        onMouseEnter={() => !isMobile && setSidebarHover(true)}
        onMouseLeave={() => !isMobile && setSidebarHover(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">LMS</span>
              </div>
              <span className={`text-xl font-bold text-gray-900 ml-3 transition-all duration-200 whitespace-nowrap ${
                isExpanded ? 'opacity-100 block' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                Admin Panel
              </span>
            </Link>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group ${
                  isExpanded ? 'justify-start' : 'justify-center'
                }`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon className={`w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ${isExpanded ? 'mr-3' : ''}`} />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-200 ${
                    isExpanded ? 'opacity-100 block' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div
                  className={`ml-3 transition-all duration-200 whitespace-nowrap ${
                    isExpanded ? 'opacity-100 block' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 ${isExpanded ? '' : 'ml-0'}`}
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${isMobile ? 'pl-0' : isExpanded ? 'pl-64' : 'pl-20'}`}>
        {/* Top bar for mobile */}
        {isMobile && (
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-900">Admin Panel</span>
            <div className="w-6" /> {/* Spacer */}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}