'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AppImage from '@/components/AppImage';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  AcademicCapIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  price: number;
  level: string;
  duration: number;
  isPublished: boolean;
  studentsEnrolled?: number;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'draft' | 'archived';
}

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchCourses = async () => {
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
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const coursesData = (data.data || []).map((course: any) => ({
            ...course,
            status: course.isPublished ? 'active' : 'draft',
            studentsEnrolled: course.students?.length || 0,
          }));
          setCourses(coursesData);
          setFilteredCourses(coursesData);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchCourses();
  }, [router]);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [courses, searchTerm, selectedStatus, selectedCategory]);

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(paginatedCourses.map(c => c._id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCourses(courses.filter(c => c._id !== courseToDelete._id));
        setShowDeleteModal(false);
        setCourseToDelete(null);
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0 || !confirm(`Delete ${selectedCourses.length} courses?`)) return;

    const token = localStorage.getItem('adminToken');
    
    try {
      await Promise.all(
        selectedCourses.map(id =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setCourses(courses.filter(c => !selectedCourses.includes(c._id)));
      setSelectedCourses([]);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Some courses could not be deleted');
    }
  };

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const statuses = ['all', 'active', 'draft', 'archived'];

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    draft: courses.filter(c => c.status === 'draft').length,
    archived: courses.filter(c => c.status === 'archived').length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * (c.studentsEnrolled || 0)), 0),
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
              <p className="text-gray-600">Manage your courses, categories, and analytics</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/courses/categories"
                className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderIcon className="w-5 h-5 mr-2" />
                Categories
              </Link>
              <Link
                href="/courses/create"
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Course
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Courses</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <AcademicCapIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active Courses</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <UsersIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2.5 font-medium rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedStatus('all');
                      setSelectedCategory('all');
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedCourses([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Course Cards/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {course.thumbnail ? (
                    <AppImage
                      path={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <AcademicCapIcon className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={(e) => handleSelectCourse(course._id, e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : course.status === 'archived'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{course.studentsEnrolled || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-blue-600">PKR {course.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/courses/${course._id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setCourseToDelete(course);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/courses/${course._id}`}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCourses.length === paginatedCourses.length && paginatedCourses.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={(e) => handleSelectCourse(course._id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {course.thumbnail ? (
                            <AppImage
                              path={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                              <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{course.title}</div>
                          <div className="text-sm text-gray-500 truncate">{course.level}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">PKR {course.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.studentsEnrolled || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : course.status === 'archived'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setCourseToDelete(course);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/courses/${course._id}`}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCourses.length)} of {filteredCourses.length} courses
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-3 py-2 text-gray-500">...</span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {courses.length === 0 ? 'No courses yet' : 'No courses match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {courses.length === 0
                ? 'Get started by creating your first course.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {courses.length === 0 && (
              <Link
                href="/courses/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Course
              </Link>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && courseToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Course
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Are you sure you want to delete <strong>{courseToDelete.title}</strong>?
                  This action cannot be undone and will permanently remove the course.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCourseToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Course'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
