'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminNav({ user }: { user?: any }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="font-bold text-lg">
            Admin Panel
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/users" className="hover:text-blue-600">
              Users
            </Link>
            <Link href="/courses" className="hover:text-blue-600">
              Courses
            </Link>
            <Link href="/products" className="hover:text-blue-600">
              Products
            </Link>
            <Link href="/orders" className="hover:text-blue-600">
              Orders
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-700">{user?.name || 'Admin'}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
