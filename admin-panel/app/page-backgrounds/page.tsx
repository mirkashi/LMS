'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface PageBackground {
  _id: string;
  pageName: 'course' | 'shop' | 'contact' | 'about';
  imageUrl: string;
  alt: string;
  description?: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: string;
  success: string;
}

export default function PageBackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<PageBackground[]>([]);
  const [selectedPage, setSelectedPage] = useState<'course' | 'shop' | 'contact' | 'about'>('course');
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    loading: false,
    error: '',
    success: '',
  });
  const [alt, setAlt] = useState('');
  const [description, setDescription] = useState('');
  const [loadingBackgrounds, setLoadingBackgrounds] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pages = [
    { value: 'course', label: 'Course Page', icon: '📚' },
    { value: 'shop', label: 'Shop Page', icon: '🛍️' },
    { value: 'about', label: 'About Page', icon: 'ℹ️' },
    { value: 'contact', label: 'Contact Page', icon: '📧' },
  ] as const;

  // Fetch all backgrounds
  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      setLoadingBackgrounds(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/page-backgrounds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackgrounds(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch backgrounds:', error);
    } finally {
      setLoadingBackgrounds(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadState(prev => ({
        ...prev,
        error: 'Only JPG, PNG, and WebP images are supported',
        file: null,
        preview: null,
      }));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadState(prev => ({
        ...prev,
        error: 'File size must not exceed 5MB',
        file: null,
        preview: null,
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        error: '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadState.file) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select an image file',
      }));
      return;
    }

    try {
      setUploadState(prev => ({ ...prev, loading: true, error: '', success: '' }));

      const formData = new FormData();
      formData.append('image', uploadState.file);
      if (alt) formData.append('alt', alt);
      if (description) formData.append('description', description);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/page-backgrounds/upload/${selectedPage}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadState(prev => ({
        ...prev,
        success: data.message || 'Background uploaded successfully!',
        file: null,
        preview: null,
        error: '',
      }));

      setAlt('');
      setDescription('');

      // Refresh backgrounds list
      await fetchBackgrounds();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: '' }));
      }, 3000);
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        error: error.message || 'Failed to upload background',
      }));
    } finally {
      setUploadState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (pageName: string) => {
    if (!confirm('Are you sure you want to delete this background image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/page-backgrounds/${pageName}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUploadState(prev => ({
          ...prev,
          success: 'Background deleted successfully!',
        }));
        await fetchBackgrounds();

        setTimeout(() => {
          setUploadState(prev => ({ ...prev, success: '' }));
        }, 3000);
      } else {
        throw new Error('Failed to delete background');
      }
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete background',
      }));
    }
  };

  const getCurrentBackground = () => {
    return backgrounds.find(bg => bg.pageName === selectedPage);
  };

  const currentBackground = getCurrentBackground();

  return (
    <AdminLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Backgrounds</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage background images for different pages
          </p>
        </div>

        {/* Page Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Page</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pages.map(page => (
              <button
                key={page.value}
                onClick={() => setSelectedPage(page.value)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedPage === page.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">{page.icon}</div>
                <div className="font-semibold text-gray-900">{page.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload New Background</h2>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition cursor-pointer hover:border-blue-400"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">
                    Drag and drop your image here
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    or click to browse (JPG, PNG, WebP - Max 5MB)
                  </p>
                </div>
              </div>

              {/* Preview */}
              {uploadState.preview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <img
                    src={uploadState.preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (Optional)
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={e => setAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add any additional information about this background"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Messages */}
              {uploadState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm">{uploadState.error}</div>
                </div>
              )}

              {uploadState.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-green-700 text-sm">{uploadState.success}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!uploadState.file || uploadState.loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {uploadState.loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <PhotoIcon className="w-5 h-5" />
                    Upload Background
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Background Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Background</h2>

            {currentBackground ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={currentBackground.imageUrl}
                    alt={currentBackground.alt}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Alt Text</p>
                    <p className="font-medium text-gray-900">{currentBackground.alt}</p>
                  </div>

                  {currentBackground.description && (
                    <div>
                      <p className="text-gray-600">Description</p>
                      <p className="font-medium text-gray-900">{currentBackground.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-600">File Name</p>
                    <p className="font-medium text-gray-900">{currentBackground.fileName}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">File Size</p>
                    <p className="font-medium text-gray-900">
                      {(currentBackground.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Uploaded By</p>
                    <p className="font-medium text-gray-900">
                      {currentBackground.uploadedBy.name} ({currentBackground.uploadedBy.email})
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Uploaded On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(currentBackground.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(currentBackground.pageName)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 mt-4"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete Background
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No background uploaded yet</p>
                <p className="text-sm mt-1">Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* All Backgrounds */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Page Backgrounds</h2>

          {loadingBackgrounds ? (
            <div className="text-center py-8 text-gray-500">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : backgrounds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {backgrounds.map(bg => (
                <div key={bg._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={bg.imageUrl}
                    alt={bg.alt}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 capitalize">{bg.pageName} Page</p>
                    <p className="text-sm text-gray-600 mt-1">{bg.alt}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(bg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No backgrounds uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
