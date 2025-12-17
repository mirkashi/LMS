'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('adminUser');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUser(user);

        // Fetch dashboard stats
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav user={user} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your LMS platform</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Courses</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalCourses || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-blue-600">${stats?.totalRevenue || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Orders</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.activeOrders || 0}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/users"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-600">View and manage all users</p>
            </Link>
            <Link
              href="/courses"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">Manage Courses</h3>
              <p className="text-gray-600">Create and edit courses</p>
            </Link>
            <Link
              href="/orders"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">View Orders</h3>
              <p className="text-gray-600">Track all course purchases</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
