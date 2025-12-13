'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCourses(courses.filter((c: any) => c._id !== courseId));
        alert('Course deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Courses</h1>
            <Link
              href="/admin/courses/create"
              className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Create New Course
            </Link>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left font-semibold">Title</th>
                  <th className="px-6 py-3 text-left font-semibold">Category</th>
                  <th className="px-6 py-3 text-left font-semibold">Price</th>
                  <th className="px-6 py-3 text-left font-semibold">Students</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course: any) => (
                  <tr key={course._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{course.title}</td>
                    <td className="px-6 py-3">{course.category}</td>
                    <td className="px-6 py-3 font-semibold">${course.price}</td>
                    <td className="px-6 py-3">{course.students?.length || 0}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <Link
                        href={`/admin/courses/${course._id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No courses found</p>
              <Link
                href="/admin/courses/create"
                className="text-primary font-semibold hover:underline"
              >
                Create your first course
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
