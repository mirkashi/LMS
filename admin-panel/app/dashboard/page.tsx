'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AppImage from '@/components/AppImage';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
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

type HomePageContent = {
  heroBadgeText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  heroImageUrl?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [homeContent, setHomeContent] = useState<HomePageContent | null>(null);
  const [homeForm, setHomeForm] = useState<Required<Omit<HomePageContent, 'heroImageUrl'>>>({
    heroBadgeText: '🚀 #1 Platform for eBay Sellers',
    heroTitle: 'Master the Art of Online Selling',
    heroSubtitle:
      'Unlock your potential with expert-led courses, premium resources, and a community of successful entrepreneurs.',
    heroPrimaryCtaLabel: 'Start Learning',
    heroPrimaryCtaHref: '/courses',
    heroSecondaryCtaLabel: 'Browse Shop',
    heroSecondaryCtaHref: '/shop',
  });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [homeSaveState, setHomeSaveState] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: '',
    success: '',
  });

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

        // Fetch homepage content (public endpoint) so dashboard can edit it
        try {
          const homeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage-content`);
          const homeJson = await homeRes.json();
          if (homeJson?.success) {
            const content = homeJson.data || null;
            setHomeContent(content);
            if (content) {
              setHomeForm({
                heroBadgeText: content.heroBadgeText || '🚀 #1 Platform for eBay Sellers',
                heroTitle: content.heroTitle || 'Master the Art of Online Selling',
                heroSubtitle:
                  content.heroSubtitle ||
                  'Unlock your potential with expert-led courses, premium resources, and a community of successful entrepreneurs.',
                heroPrimaryCtaLabel: content.heroPrimaryCtaLabel || 'Start Learning',
                heroPrimaryCtaHref: content.heroPrimaryCtaHref || '/courses',
                heroSecondaryCtaLabel: content.heroSecondaryCtaLabel || 'Browse Shop',
                heroSecondaryCtaHref: content.heroSecondaryCtaHref || '/shop',
              });
            }
          }
        } catch (error) {
          console.warn('Failed to fetch homepage content:', error);
        }

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

          // Use real chart data from API
          setChartData({
            revenue: data.data.revenueChart || [],
            users: [
              { month: 'Jan', users: 1200 },
              { month: 'Feb', users: 1450 },
              { month: 'Mar', users: 1380 },
              { month: 'Apr', users: 1680 },
              { month: 'May', users: 1520 },
              { month: 'Jun', users: 1890 },
            ],
            categories: [
              { name: 'Courses', value: data.data.totalCourses || 0, color: '#6366F1' },
              { name: 'Enrollments', value: data.data.totalEnrollments || 0, color: '#10B981' },
              { name: 'Orders', value: data.data.totalOrders || 0, color: '#F59E0B' },
              { name: 'Pending', value: data.data.pendingEnrollments || 0, color: '#EF4444' },
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

  useEffect(() => {
    return () => {
      if (heroPreview) URL.revokeObjectURL(heroPreview);
    };
  }, [heroPreview]);

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
      title: 'Enrollments',
      value: stats?.totalEnrollments?.toLocaleString() || '0',
      change: `${stats?.pendingEnrollments || 0} pending`,
      changeType: 'increase',
      icon: AcademicCapIcon,
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

  const container = {
    initial: { opacity: 1 },
    animate: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
  };

  const handleHeroFile = (file: File) => {
    setHomeSaveState({ loading: false, error: '', success: '' });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setHomeSaveState({ loading: false, error: 'Only JPG, PNG, and WebP images are supported', success: '' });
      setHeroFile(null);
      setHeroPreview(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setHomeSaveState({ loading: false, error: 'File size must not exceed 5MB', success: '' });
      setHeroFile(null);
      setHeroPreview(null);
      return;
    }

    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const saveHomepageContent = async () => {
    try {
      setHomeSaveState({ loading: true, error: '', success: '' });

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setHomeSaveState({ loading: false, error: 'Missing admin token. Please log in again.', success: '' });
        router.push('/login');
        return;
      }

      const form = new FormData();
      form.append('heroBadgeText', homeForm.heroBadgeText);
      form.append('heroTitle', homeForm.heroTitle);
      form.append('heroSubtitle', homeForm.heroSubtitle);
      form.append('heroPrimaryCtaLabel', homeForm.heroPrimaryCtaLabel);
      form.append('heroPrimaryCtaHref', homeForm.heroPrimaryCtaHref);
      form.append('heroSecondaryCtaLabel', homeForm.heroSecondaryCtaLabel);
      form.append('heroSecondaryCtaHref', homeForm.heroSecondaryCtaHref);
      if (heroFile) form.append('heroImage', heroFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage-content`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update homepage content');
      }

      setHomeContent(data.data);
      setHeroFile(null);
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      setHeroPreview(null);

      setHomeSaveState({ loading: false, error: '', success: 'Homepage content updated successfully.' });
    } catch (error: any) {
      setHomeSaveState({
        loading: false,
        error: error?.message || 'Failed to update homepage content',
        success: '',
      });
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-500/10" />
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative p-7 sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Admin Dashboard • {new Date().toLocaleDateString()}
                  </div>
                  <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Welcome back, {user?.name || 'Admin'}
                  </h1>
                  <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">
                    A high-level overview of users, courses, revenue, and enrollments — plus quick edits to your homepage hero.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                  {quickActions.map((action, index) => (
                    <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18 }}>
                      <Link
                        href={action.href}
                        className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 hover:bg-white shadow-sm"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                          <action.icon className="h-5 w-5 text-indigo-600" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-gray-900 truncate">{action.title}</span>
                          <span className="block text-xs text-gray-500 truncate">{action.description}</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/70 via-blue-500/70 to-cyan-500/70" />
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                      <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-3 py-1">
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">{stat.change}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-indigo-50 p-3">
                      <stat.icon className="h-7 w-7 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main grid */}
          <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <motion.div variants={item} className="lg:col-span-8 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Revenue Trend</h3>
                    <p className="text-sm text-gray-600">Monthly revenue performance snapshot.</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData?.revenue}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.10)',
                      }}
                      formatter={(value: any) => `PKR ${Number(value).toLocaleString()}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366F1"
                      strokeWidth={4}
                      dot={{ fill: '#6366F1', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">User Growth</h3>
                    <p className="text-sm text-gray-600">New users over recent months.</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData?.users}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.10)',
                      }}
                    />
                    <Bar dataKey="users" fill="#10B981" radius={[12, 12, 0, 0]} barSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={item} className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-extrabold text-gray-900">Breakdown</h3>
                <p className="text-sm text-gray-600">Courses, enrollments, orders, pending.</p>

                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={chartData?.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={96}
                        paddingAngle={6}
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
                          borderRadius: '14px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={44} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-3">
                  {chartData?.categories.map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex items-center min-w-0">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                        <span className="text-sm font-semibold text-gray-800 truncate">{category.name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900">{category.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-extrabold text-gray-900">Shortcuts</h3>
                <p className="text-sm text-gray-600">Jump into key admin tools.</p>

                <div className="mt-5 space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.16 }}>
                      <Link
                        href={action.href}
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                          <action.icon className="h-5 w-5 text-indigo-600" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-gray-900 truncate">{action.title}</span>
                          <span className="block text-xs text-gray-500 truncate">{action.description}</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

        {/* Homepage Content Editor */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-10 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-7 sm:px-10 py-7 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Homepage Content</h3>
                <p className="text-gray-600 mt-1">Edit hero text, buttons, and background image for the landing page.</p>
              </div>
              <div className="text-xs font-semibold text-gray-500">Changes reflect on the homepage immediately.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-2 p-7 sm:p-10 bg-gray-50">
              <div className="text-sm font-semibold text-gray-700 mb-3">Preview</div>
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                <div className="relative h-56">
                  {heroPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroPreview} alt="Hero preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : homeContent?.heroImageUrl ? (
                    <AppImage
                      path={homeContent.heroImageUrl}
                      alt="Current hero image"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <span className="text-sm">No hero image uploaded</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-gray-900/35 to-gray-900/55" />
                </div>
                <div className="p-6">
                  <div className="inline-flex px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
                    {homeForm.heroBadgeText}
                  </div>
                  <div className="mt-4 text-lg font-extrabold text-gray-900 leading-snug whitespace-pre-line">
                    {homeForm.heroTitle}
                  </div>
                  <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {homeForm.heroSubtitle}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
                      {homeForm.heroPrimaryCtaLabel}
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm font-bold">
                      {homeForm.heroSecondaryCtaLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-7 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroFile(file);
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {heroPreview || heroFile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setHeroFile(null);
                          if (heroPreview) URL.revokeObjectURL(heroPreview);
                          setHeroPreview(null);
                          setHomeSaveState({ loading: false, error: '', success: '' });
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">JPG/PNG/WebP up to 5MB.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                  <input
                    value={homeForm.heroBadgeText}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroBadgeText: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                    placeholder="e.g. 🚀 #1 Platform for eBay Sellers"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                  <textarea
                    value={homeForm.heroTitle}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroTitle: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 min-h-[84px]"
                    placeholder="Use line breaks if needed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Subtitle</label>
                  <textarea
                    value={homeForm.heroSubtitle}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 min-h-[110px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Button Label</label>
                  <input
                    value={homeForm.heroPrimaryCtaLabel}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroPrimaryCtaLabel: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Button Link</label>
                  <input
                    value={homeForm.heroPrimaryCtaHref}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroPrimaryCtaHref: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                    placeholder="/courses"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Button Label</label>
                  <input
                    value={homeForm.heroSecondaryCtaLabel}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroSecondaryCtaLabel: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Button Link</label>
                  <input
                    value={homeForm.heroSecondaryCtaHref}
                    onChange={(e) => setHomeForm((p) => ({ ...p, heroSecondaryCtaHref: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                    placeholder="/shop"
                  />
                </div>
              </div>

              {homeSaveState.error ? (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {homeSaveState.error}
                </div>
              ) : null}

              {homeSaveState.success ? (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  {homeSaveState.success}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setHomeSaveState({ loading: false, error: '', success: '' });
                    if (homeContent) {
                      setHomeForm({
                        heroBadgeText: homeContent.heroBadgeText || '🚀 #1 Platform for eBay Sellers',
                        heroTitle: homeContent.heroTitle || 'Master the Art of Online Selling',
                        heroSubtitle:
                          homeContent.heroSubtitle ||
                          'Unlock your potential with expert-led courses, premium resources, and a community of successful entrepreneurs.',
                        heroPrimaryCtaLabel: homeContent.heroPrimaryCtaLabel || 'Start Learning',
                        heroPrimaryCtaHref: homeContent.heroPrimaryCtaHref || '/courses',
                        heroSecondaryCtaLabel: homeContent.heroSecondaryCtaLabel || 'Browse Shop',
                        heroSecondaryCtaHref: homeContent.heroSecondaryCtaHref || '/shop',
                      });
                    }
                    setHeroFile(null);
                    if (heroPreview) URL.revokeObjectURL(heroPreview);
                    setHeroPreview(null);
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={homeSaveState.loading}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveHomepageContent}
                  disabled={homeSaveState.loading}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {homeSaveState.loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}