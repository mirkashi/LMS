"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function UploadVideoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await res.json();
        if (data.success) setCourses(data.data);
      } catch (e) {
        console.error('Failed to fetch courses', e);
      }
    })();
  }, [router]);

  useEffect(() => {
    const course = courses.find(c => c._id === selectedCourse);
    setModules(course?.modules || []);
    setSelectedModuleIndex(0);
  }, [selectedCourse, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken')!;
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', 'video');
      if (video) formData.append('video', video);

      console.log('📤 Uploading video lesson...');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${selectedCourse}/modules/${selectedModuleIndex}/lessons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('❌ Video upload failed:', data);
        
        let errorMessage = data.message || 'Upload failed';
        if (data.error && process.env.NODE_ENV === 'development') {
          errorMessage += `\n\nTechnical details: ${data.error}`;
        }
        
        setError(errorMessage);
      } else {
        console.log('✅ Video lesson uploaded successfully');
        setSuccess('Video lesson uploaded successfully! The video is now available in the course.');
        setTitle(''); 
        setDescription(''); 
        setVideo(null);
        
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Upload Course Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border rounded p-2">
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select value={selectedModuleIndex} onChange={e => setSelectedModuleIndex(Number(e.target.value))} className="w-full border rounded p-2">
              {modules.map((m, idx) => (
                <option key={idx} value={idx}>{m.title || `Module ${idx+1}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lesson Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video File</label>
            <input 
              type="file" 
              accept="video/mp4,video/quicktime,video/x-msvideo,video/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size (max 1GB)
                  const maxSize = 1024 * 1024 * 1024; // 1GB
                  if (file.size > maxSize) {
                    setError('Video file is too large. Maximum size is 1GB.');
                    setVideo(null);
                    return;
                  }
                  
                  // Validate file type
                  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/webm'];
                  if (!allowedTypes.includes(file.type) && !file.type.startsWith('video/')) {
                    setError('Invalid video format. Please upload MP4, MOV, or AVI videos.');
                    setVideo(null);
                    return;
                  }
                  
                  setError(''); // Clear errors
                  setVideo(file);
                }
              }} 
            />
            {video && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button disabled={loading || !selectedCourse || !title || !video} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
