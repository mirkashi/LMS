'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface FormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  level: string;
  price: number;
  duration: number;
  language: string;
  prerequisites: string;
  whatYouWillLearn: string[];
  targetAudience: string;
  introVideoLink: string;
  thumbnail: File | null;
  currentThumbnail: string;
  video: File | null;
  currentVideo: string;
  documents: File[];
  isPublished: boolean;
  accessLevel: 'free' | 'paid' | 'premium';
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    level: 'beginner',
    price: 0,
    duration: 0,
    language: 'English',
    prerequisites: '',
    whatYouWillLearn: [''],
    targetAudience: '',
    introVideoLink: '',
    thumbnail: null,
    currentThumbnail: '',
    video: null,
    currentVideo: '',
    documents: [],
    isPublished: true,
    accessLevel: 'paid',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const userData = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');
      
      if (!userData || !token) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const course = data.data;
          
          setFormData({
            title: course.title || '',
            description: course.description || '',
            category: course.category || '',
            tags: course.tags || [],
            level: course.level || 'beginner',
            price: course.price || 0,
            duration: course.duration || 0,
            language: course.language || 'English',
            prerequisites: course.prerequisites || '',
            whatYouWillLearn: course.whatYouWillLearn || [''],
            targetAudience: course.targetAudience || '',
            introVideoLink: course.introVideoLink || '',
            thumbnail: null,
            currentThumbnail: course.thumbnail || '',
            video: null,
            currentVideo: course.introVideoUrl || '',
            documents: [],
            isPublished: course.isPublished !== undefined ? course.isPublished : true,
            accessLevel: course.accessLevel || 'paid',
          });
        } else {
          setErrors({ fetch: 'Failed to load course data' });
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setErrors({ fetch: 'An error occurred while loading the course' });
      } finally {
        setFetchLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.accessLevel === 'paid' && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0 for paid courses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'video' | 'documents') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (field === 'thumbnail') {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, thumbnail: 'Please select an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, thumbnail: 'Image must be less than 5MB' });
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      setErrors({ ...errors, thumbnail: '' });
    } else if (field === 'video') {
      const file = files[0];
      if (!file.type.startsWith('video/')) {
        setErrors({ ...errors, video: 'Please select a video file' });
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ ...errors, video: 'Video must be less than 100MB' });
        return;
      }
      setFormData({ ...formData, video: file });
      setErrors({ ...errors, video: '' });
    } else if (field === 'documents') {
      const newDocs = Array.from(files).filter(file => {
        const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
        return validTypes.some(type => file.name.toLowerCase().endsWith(type));
      });
      setFormData({ ...formData, documents: [...formData.documents, ...newDocs] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');
    const token = localStorage.getItem('adminToken');

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('level', formData.level);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('language', formData.language);
      formDataToSend.append('prerequisites', formData.prerequisites);
      formDataToSend.append('targetAudience', formData.targetAudience);
      formDataToSend.append('introVideoLink', formData.introVideoLink);
      formDataToSend.append('isPublished', formData.isPublished.toString());

      // Append files only if new ones are selected
      if (formData.thumbnail) {
        formDataToSend.append('image', formData.thumbnail);
      }
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
      formData.documents.forEach((doc) => {
        formDataToSend.append('pdfFiles', doc);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        setSuccessMessage('Course updated successfully!');
        setTimeout(() => {
          router.push('/courses');
        }, 2000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to update course' });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLearningPoint = () => {
    setFormData({
      ...formData,
      whatYouWillLearn: [...formData.whatYouWillLearn, ''],
    });
  };

  const handleRemoveLearningPoint = (index: number) => {
    setFormData({
      ...formData,
      whatYouWillLearn: formData.whatYouWillLearn.filter((_, i) => i !== index),
    });
  };

  const handleLearningPointChange = (index: number, value: string) => {
    const updated = [...formData.whatYouWillLearn];
    updated[index] = value;
    setFormData({ ...formData, whatYouWillLearn: updated });
  };

  if (fetchLoading) {
    return (
      <AdminLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
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
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">Update course information and content</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.fetch && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 mr-3" />
            <span className="text-red-800">{errors.fetch}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Complete eBay Mastery Course"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Detailed description..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="eBay Basics">eBay Basics</option>
                  <option value="Advanced Selling">Advanced Selling</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product Sourcing">Product Sourcing</option>
                  <option value="Business Management">Business Management</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Media</h2>

            {/* Current Thumbnail */}
            {formData.currentThumbnail && !formData.thumbnail && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Thumbnail</label>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${formData.currentThumbnail}`}
                  alt="Current thumbnail"
                  className="w-48 h-32 object-cover rounded-lg"
                />
              </div>
            )}

            {/* New Thumbnail */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.currentThumbnail ? 'Replace Thumbnail' : 'Course Thumbnail'}
              </label>
              <input
                ref={thumbnailRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbnailRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CloudArrowUpIcon className="w-5 h-5 inline mr-2" />
                Choose Image
              </button>
              {formData.thumbnail && (
                <span className="ml-4 text-sm text-gray-600">{formData.thumbnail.name}</span>
              )}
            </div>

            {/* Intro Video Link */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Intro Video Link (Optional)</label>
              <input
                type="url"
                value={formData.introVideoLink}
                onChange={(e) => setFormData({ ...formData, introVideoLink: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YouTube, Vimeo, or direct video URL"
              />
            </div>

            {/* Upload Video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Video {formData.currentVideo && '(Replace Current)'}
              </label>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <VideoCameraIcon className="w-5 h-5 inline mr-2" />
                Choose Video
              </button>
              {formData.video && (
                <span className="ml-4 text-sm text-gray-600">{formData.video.name}</span>
              )}
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Publishing</h2>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-3 font-medium text-gray-900">Publish this course</span>
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                  Update Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
