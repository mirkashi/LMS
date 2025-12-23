'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

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

          // Mock chart data (replace with real API data in production)
          setChartData({
            revenue: [
              { month: 'Jan', revenue: 450000 },
              { month: 'Feb', revenue: 780000 },
              { month: 'Mar', revenue: 620000 },
              { month: 'Apr', revenue: 950000 },
              { month: 'May', revenue: 810000 },
              { month: 'Jun', revenue: 1100000 },
            ],
            users: [
              { month: 'Jan', users: 1200 },
              { month: 'Feb', users: 1450 },
              { month: 'Mar', users: 1380 },
              { month: 'Apr', users: 1680 },
              { month: 'May', users: 1520 },
              { month: 'Jun', users: 1890 },
            ],
            categories: [
              { name: 'Courses', value: 45, color: '#6366F1' }, // Indigo
              { name: 'eBooks', value: 25, color: '#10B981' }, // Emerald
              { name: 'Tools', value: 20, color: '#F59E0B' }, // Amber
              { name: 'Other', value: 10, color: '#EF4444' }, // Red
            ],
          });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses?.toLocaleString() || '0',
      change: '+8%',
      changeType: 'increase',
      icon: BookOpenIcon,
    },
    {
      title: 'Total Revenue',
      value: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: '+15%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
    },
    {
      title: 'Active Orders',
      value: stats?.activeOrders?.toLocaleString() || '0',
      change: '-3%',
      changeType: 'decrease',
      icon: ShoppingBagIcon,
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all platform users',
      href: '/users',
      icon: UserGroupIcon,
    },
    {
      title: 'Manage Courses',
      description: 'Create and edit courses',
      href: '/courses',
      icon: AcademicCapIcon,
    },
    {
      title: 'View Analytics',
      description: 'Detailed platform insights',
      href: '/analytics',
      icon: ChartBarIcon,
    },
  ];

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard Overview</h1>
          <p className="mt-3 text-lg text-gray-600">
            Welcome back, {user?.name || 'Admin'}. Here's a snapshot of your LMS platform performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="mt-4 text-4xl font-extrabold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-5">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500 mr-2" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change} vs last month
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData?.revenue}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={14} />
                <YAxis stroke="#6b7280" fontSize={14} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: any) => `PKR ${Number(value).toLocaleString()}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={4}
                  dot={{ fill: '#6366F1', r: 6 }}
                  activeDot={{ r: 9 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">User Growth</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData?.users}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={14} />
                <YAxis stroke="#6b7280" fontSize={14} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="users" fill="#10B981" radius={[12, 12, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Categories */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Product Categories</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData?.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData?.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={40} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-4">
              {chartData?.categories.map((category: any) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                    <span className="font-semibold text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{category.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="p-5 w-20 h-20 bg-indigo-50 rounded-2xl mb-6 group-hover:bg-indigo-100 transition-colors">
                    <action.icon className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}