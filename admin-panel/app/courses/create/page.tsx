'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { ArrowLeftIcon, CloudArrowUpIcon, CheckCircleIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function CreateCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    instructor: '',
    duration: '',
    syllabus: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);

    // Development mode: Monitor for unexpected API calls
    if (process.env.NODE_ENV === 'development') {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0]?.toString() || '';
        // Log API calls during development (except final submit which happens in handleSubmit)
        if (url.includes('/admin/courses') && !loading) {
          console.warn('⚠️ Development Warning: API call detected while not in submission state');
          console.warn('URL:', url);
          console.warn('Current step:', currentStep);
          console.warn('Loading state:', loading);
        }
        return originalFetch.apply(this, args);
      };
      
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [router, currentStep, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file in local state only - NO UPLOAD occurs here
      setImage(file);
      // Create local preview using FileReader API - NO server upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Store files in local state only - NO UPLOAD occurs here
    setPdfFiles(prev => [...prev, ...files]);
  };

  const removePdfFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Store file in local state only - NO UPLOAD occurs here
        setImage(file);
        // Create local preview using FileReader API - NO server upload
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    // Store files in local state only - NO UPLOAD occurs here
    setPdfFiles(prev => [...prev, ...pdfFiles]);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.instructor.trim() && formData.duration.trim();
      case 3:
        return formData.price && parseFloat(formData.price) >= 0;
      case 4:
        return true; // Media files are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (loading) {
      console.warn('Cannot navigate: Form is submitting');
      return;
    }
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (loading) {
      console.warn('Cannot navigate: Form is submitting');
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SAFETY CHECK #1: Only submit on final step
    // This ensures no premature data persistence
    if (currentStep !== totalSteps) {
      console.warn('Form submission prevented: Not on final step');
      return;
    }
    
    // SAFETY CHECK #2: Validate all steps before submission
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        console.error(`Validation failed for step ${step}`);
        setError(`Please complete all required fields in step ${step}`);
        setCurrentStep(step);
        return;
      }
    }
    
    // SAFETY CHECK #3: Prevent duplicate submissions
    if (loading) {
      console.warn('Form submission prevented: Already submitting');
      return;
    }

    setError('');
    setLoading(true);
    console.log('Starting course creation...');
    console.log('📤 This is the ONLY point where files are uploaded to the server');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Build FormData with all form fields AND files
      // Files have been stored in local state (image, pdfFiles) until now
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('price', formData.price);
      formDataObj.append('instructor', formData.instructor);
      formDataObj.append('duration', formData.duration);
      formDataObj.append('syllabus', formData.syllabus);

      // Add image file if selected
      if (image) {
        formDataObj.append('image', image);
      }

      // Add PDF files if any
      pdfFiles.forEach((file, index) => {
        formDataObj.append(`pdfFiles`, file);
      });

      // SINGLE API CALL: Create course with all data including file uploads
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataObj,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to create course');
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('Course created successfully:', result);
      router.push('/courses');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Course details' },
    { id: 2, name: 'Instructor & Duration', description: 'Course structure' },
    { id: 3, name: 'Pricing', description: 'Set course price' },
    { id: 4, name: 'Media & Files', description: 'Upload materials' },
  ];

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/courses"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-600">Build a comprehensive course with all necessary materials and information.</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.id <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-4">
                    <div className={`font-medium ${
                      step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-8 ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep !== totalSteps) {
                e.preventDefault();
              }
            }}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter an engaging course title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what students will learn in this course..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="data-science">Data Science</option>
                      <option value="language">Language Learning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Instructor & Duration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Instructor Name *
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name of the course instructor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Duration *
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 8 weeks, 40 hours, 20 lessons"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Syllabus
                    </label>
                    <textarea
                      name="syllabus"
                      value={formData.syllabus}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Outline the course curriculum, modules, and learning objectives..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-sm text-gray-500 mt-1">Set the price for your course. Use 0 for free courses.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Media & Files */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Course Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Image
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Course preview"
                            className="max-w-xs max-h-48 mx-auto rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Image uploaded successfully!</p>
                            <button
                              type="button"
                              onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">Upload course image</p>
                            <p className="text-gray-500">Drag and drop an image here, or click to browse</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="course-image-upload"
                          />
                          <label
                            htmlFor="course-image-upload"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                          >
                            Choose Image
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Recommended: 800x600px, JPG or PNG format</p>
                  </div>

                  {/* PDF Files */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Materials (PDFs)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handlePdfDrop}
                    >
                      <div className="space-y-4">
                        <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload course materials</p>
                          <p className="text-gray-500">Drag and drop PDF files here, or click to browse</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handlePdfChange}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label
                          htmlFor="pdf-upload"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                        >
                          Choose PDFs
                        </label>
                      </div>
                    </div>

                    {/* Uploaded PDFs */}
                    {pdfFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-900">Uploaded Files:</p>
                        {pdfFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <DocumentIcon className="w-5 h-5 text-red-500 mr-2" />
                              <span className="text-sm text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePdfFile(index)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep) || loading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Please wait...' : 'Next'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !validateStep(currentStep)}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating Course...' : 'Create Course'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}