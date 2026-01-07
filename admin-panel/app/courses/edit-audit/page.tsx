'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { getAssetUrl } from '@/lib/assets';

interface AuditLogEntry {
  _id: string;
  action: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  admin: {
    name: string;
    email: string;
  };
  timestamp: string;
  changedFields: string[];
}

interface FormData {
  title: string;
  description: string;
  category: string;
  duration: number;
  level: string;
  price: number;
  introVideoLink: string;
  isPublished: boolean;
}

export default function CourseEditAuditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    duration: 0,
    level: 'beginner',
    price: 0,
    introVideoLink: '',
    isPublished: false,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [videoValidation, setVideoValidation] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');

      if (!userData || !token) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));

      try {
        // Fetch course data
        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (courseResponse.ok) {
          const data = await courseResponse.json();
          setCourse(data.data);
          setFormData({
            title: data.data.title || '',
            description: data.data.description || '',
            category: data.data.category || '',
            duration: data.data.duration || 0,
            level: data.data.level || 'beginner',
            price: data.data.price || 0,
            introVideoLink: data.data.introVideoLink || '',
            isPublished: data.data.isPublished || false,
          });
        }

        // Fetch audit logs
        const auditResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}/audit-log`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (auditResponse.ok) {
          const auditData = await auditResponse.json();
          setAuditLogs(auditData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setErrors({ fetch: 'Failed to load course data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  const validateVideoLink = async (link: string) => {
    if (!link) {
      setVideoValidation(null);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/validate-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ videoUrl: link }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVideoValidation(data);
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleVideoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setFormData({ ...formData, introVideoLink: link });
    validateVideoLink(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');

      // Validate video link if provided
      if (formData.introVideoLink && !videoValidation?.valid) {
        setErrors({ introVideoLink: 'Please provide a valid video URL' });
        setSaving(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
        setSuccessMessage('✅ Course updated successfully!');

        // Refresh audit logs
        const auditResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}/audit-log`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (auditResponse.ok) {
          const auditData = await auditResponse.json();
          setAuditLogs(auditData.data || []);
        }

        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to update course' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout user={user}>
        <div className="p-8 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">{course?.title}</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Course Details
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Edit History ({auditLogs.length})
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                required
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Select category</option>
                  <option>Programming</option>
                  <option>Design</option>
                  <option>Business</option>
                  <option>Marketing</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Video Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intro Video Link
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Supports: YouTube, Vimeo, or direct video links (MP4, WebM, OGG)
              </p>
              <input
                type="text"
                value={formData.introVideoLink}
                onChange={handleVideoLinkChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.introVideoLink && (
                <p className="text-red-600 text-sm mt-1">{errors.introVideoLink}</p>
              )}
              {videoValidation && (
                <div
                  className={`mt-2 p-3 rounded flex items-center gap-2 ${
                    videoValidation.valid
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {videoValidation.valid ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm">{videoValidation.reason}</span>
                    </>
                  ) : (
                    <>
                      <ExclamationCircleIcon className="w-5 h-5" />
                      <span className="text-sm">{videoValidation.reason}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Published Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label className="text-sm font-medium text-gray-700 cursor-pointer">
                Publish this course
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit History</h2>
            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.map((log, idx) => (
                  <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          By {log.admin.name} ({log.admin.email})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>

                        {/* Changed Fields */}
                        {log.changedFields && log.changedFields.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {log.changedFields.map((field) => (
                              <div key={field} className="text-sm bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="font-medium text-blue-900">{field}</p>
                                <p className="text-blue-700 text-xs">
                                  {log.changes?.before?.[field] || '(empty)'} →{' '}
                                  {log.changes?.after?.[field] || '(empty)'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No edit history available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
