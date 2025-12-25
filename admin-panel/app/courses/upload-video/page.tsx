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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${selectedCourse}/modules/${selectedModuleIndex}/lessons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Upload failed');
      } else {
        setSuccess('Video lesson uploaded successfully');
        setTitle(''); setDescription(''); setVideo(null);
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
            <input type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} />
          </div>

          <button disabled={loading || !selectedCourse || !title || !video} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
