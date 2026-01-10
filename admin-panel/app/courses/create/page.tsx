'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
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
  video: File | null;
  documents: File[];
  isPublished: boolean;
  accessLevel: 'free' | 'paid' | 'premium';
  scheduledPublishDate: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
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
    video: null,
    documents: [],
    isPublished: false, // Default to draft
    accessLevel: 'paid',
    scheduledPublishDate: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: 0,
    video: 0,
    documents: 0,
  });
  const [dragActive, setDragActive] = useState({
    thumbnail: false,
    video: false,
    documents: false,
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<HTMLInputElement>(null);

  const steps = [
    { number: 1, title: 'Basic Info', icon: DocumentTextIcon },
    { number: 2, title: 'Media Upload', icon: PhotoIcon },
    { number: 3, title: 'Advanced Settings', icon: InformationCircleIcon },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('adminUser');
      const token = localStorage.getItem('adminToken');
      
      if (!userData || !token) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(userData));

      // Fetch categories
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchData();
  }, [router]);

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
      if (!formData.category) newErrors.category = 'Category is required';
      if (formData.tags.length === 0) newErrors.tags = 'Add at least one tag';
    }

    if (step === 2) {
      if (!formData.thumbnail && !formData.video) {
        newErrors.media = 'Upload at least a thumbnail or intro video';
      }
    }

    if (step === 3) {
      if (formData.accessLevel === 'paid' && formData.price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid courses';
      }
      if (!formData.duration || formData.duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDrag = (e: React.DragEvent, field: keyof typeof dragActive) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive({ ...dragActive, [field]: true });
    } else if (e.type === 'dragleave') {
      setDragActive({ ...dragActive, [field]: false });
    }
  };

  const handleDrop = (e: React.DragEvent, field: 'thumbnail' | 'video' | 'documents') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [field]: false });

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (field === 'documents') {
        handleFileChange({ target: { files } } as any, field);
      } else {
        handleFileChange({ target: { files: [files[0]] } } as any, field);
      }
    }
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
      if (newDocs.length !== files.length) {
        setErrors({ ...errors, documents: 'Some files were skipped (only PDF, DOC, PPT allowed)' });
      }
      setFormData({ ...formData, documents: [...formData.documents, ...newDocs] });
    }
  };

  const removeDocument = (index: number) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit the form when on step 3 (final step)
    if (currentStep !== 3) {
      // If not on step 3, just move to next step
      handleNext();
      return;
    }
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('level', formData.level);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('language', formData.language);
      formDataToSend.append('prerequisites', formData.prerequisites);
      formDataToSend.append('whatYouWillLearn', JSON.stringify(formData.whatYouWillLearn.filter(item => item.trim())));
      formDataToSend.append('targetAudience', formData.targetAudience);
      formDataToSend.append('introVideoLink', formData.introVideoLink);
      formDataToSend.append('isPublished', formData.isPublished.toString());
      formDataToSend.append('accessLevel', formData.accessLevel);
      if (formData.scheduledPublishDate) {
        formDataToSend.append('scheduledPublishDate', formData.scheduledPublishDate);
      }

      // Append files
      if (formData.thumbnail) {
        formDataToSend.append('image', formData.thumbnail);
      }
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
      formData.documents.forEach((doc, index) => {
        formDataToSend.append('pdfFiles', doc);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        localStorage.removeItem('courseDraft');
        const data = await response.json();
        setCreatedCourseId(data.data._id);
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to create course' });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Courses
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
              <p className="text-gray-600">Fill in the details to create a new course</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">Step {step.number}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Course Information</h2>
              </div>

              {/* Title */}
              <div>
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
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(minimum 50 characters)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Provide a detailed description of what students will learn in this course..."
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">{formData.description.length} characters</p>
                  )}
                </div>
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(press Enter to add)</span>
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.tags.includes(value)) {
                        setFormData({ ...formData, tags: [...formData.tags, value] });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a tag and press Enter"
                />
                {formData.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) })}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
                )}
              </div>

              {/* What You Will Learn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What Students Will Learn
                </label>
                <div className="space-y-3">
                  {formData.whatYouWillLearn.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleLearningPointChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Learning point ${index + 1}`}
                      />
                      {formData.whatYouWillLearn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLearningPoint(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLearningPoint}
                    className="inline-flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Learning Point
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media Upload */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Course Media</h2>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                  <span className="text-gray-500 text-xs ml-2">(Max 5MB, JPG/PNG)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive.thumbnail
                      ? 'border-blue-500 bg-blue-50'
                      : formData.thumbnail
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'thumbnail')}
                  onDragLeave={(e) => handleDrag(e, 'thumbnail')}
                  onDragOver={(e) => handleDrag(e, 'thumbnail')}
                  onDrop={(e) => handleDrop(e, 'thumbnail')}
                >
                  {formData.thumbnail ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(formData.thumbnail)}
                        alt="Thumbnail preview"
                        className="mx-auto max-h-48 rounded-lg"
                      />
                      <div className="flex items-center justify-center gap-4">
                        <p className="text-sm text-gray-600">{formData.thumbnail.name}</p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnail: null })}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => thumbnailRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                          Choose Image
                        </button>
                        <p className="mt-2 text-sm text-gray-600">or drag and drop</p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={thumbnailRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="hidden"
                />
                {errors.thumbnail && (
                  <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intro Video
                  <span className="text-gray-500 text-xs ml-2">(Max 100MB, MP4/MOV)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive.video
                      ? 'border-blue-500 bg-blue-50'
                      : formData.video
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'video')}
                  onDragLeave={(e) => handleDrag(e, 'video')}
                  onDragOver={(e) => handleDrag(e, 'video')}
                  onDrop={(e) => handleDrop(e, 'video')}
                >
                  {formData.video ? (
                    <div className="space-y-4">
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-green-600" />
                      <div className="flex items-center justify-center gap-4">
                        <p className="text-sm text-gray-600">{formData.video.name}</p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, video: null })}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => videoRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                          Choose Video
                        </button>
                        <p className="mt-2 text-sm text-gray-600">or drag and drop</p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="hidden"
                />
                {errors.video && (
                  <p className="mt-1 text-sm text-red-600">{errors.video}</p>
                )}
              </div>

              {/* Documents Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Materials
                  <span className="text-gray-500 text-xs ml-2">(PDF, DOC, PPT)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive.documents
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'documents')}
                  onDragLeave={(e) => handleDrag(e, 'documents')}
                  onDragOver={(e) => handleDrag(e, 'documents')}
                  onDrop={(e) => handleDrop(e, 'documents')}
                >
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => documentsRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                      Choose Files
                    </button>
                    <p className="mt-2 text-sm text-gray-600">or drag and drop multiple files</p>
                  </div>
                </div>
                <input
                  ref={documentsRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileChange(e, 'documents')}
                  className="hidden"
                />
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-700">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.documents && (
                  <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
                )}
              </div>

              {errors.media && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    {errors.media}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Advanced Settings */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Advanced Settings</h2>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['free', 'paid', 'premium'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, accessLevel: level })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.accessLevel === level
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 capitalize mb-1">{level}</div>
                      <div className="text-sm text-gray-600">
                        {level === 'free' && 'Free for all users'}
                        {level === 'paid' && 'Requires payment'}
                        {level === 'premium' && 'Premium members only'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (PKR) {formData.accessLevel === 'paid' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={formData.accessLevel === 'free'}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
              </div>

              {/* Language and Prerequisites */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Both">English & Urdu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Aspiring eBay sellers"
                  />
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What students need to know before taking this course..."
                />
              </div>

              {/* Intro Video Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intro Video Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.introVideoLink}
                  onChange={(e) => setFormData({ ...formData, introVideoLink: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://vimeo.com/..."
                />
                <p className="mt-2 text-sm text-gray-600">
                  ℹ️ This video will be shown to enrolled students. Supports YouTube, Vimeo, or direct video URLs.
                </p>
              </div>

              {/* Publishing Options */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.isPublished ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }">
                      <input
                        type="radio"
                        name="publishStatus"
                        checked={formData.isPublished}
                        onChange={() => setFormData({ ...formData, isPublished: true, scheduledPublishDate: '' })}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">✅ Publish Immediately</span>
                        <p className="text-sm text-gray-600 mt-1">Make this course available to students right away</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      !formData.isPublished ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }">
                      <input
                        type="radio"
                        name="publishStatus"
                        checked={!formData.isPublished}
                        onChange={() => setFormData({ ...formData, isPublished: false })}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">📝 Save as Draft</span>
                        <p className="text-sm text-gray-600 mt-1">Save this course without publishing. You can publish it later.</p>
                      </div>
                    </label>
                  </div>

                  {!formData.isPublished && (
                    <div className="ml-8 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Publish Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledPublishDate}
                        onChange={(e) => setFormData({ ...formData, scheduledPublishDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Leave empty to publish manually later</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Create Course
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Course Created Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your course has been created and is ready for students. You can now add modules and lessons.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/courses')}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View All Courses
                </button>
                <button
                  onClick={() => {
                    if (createdCourseId) {
                      router.push(`/courses`);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

