'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/enrolled/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEnrolledCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">My Learning</h1>
            <p className="text-gray-600">
              Continue learning and master new skills
            </p>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enrolledCourses.map((course: any) => (
                <div
                  key={course._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition overflow-hidden"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">45% Complete</p>
                    </div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="w-full py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition text-center"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">No courses yet</h2>
              <p className="text-gray-600 mb-6">
                Enroll in a course to start learning
              </p>
              <Link
                href="/courses"
                className="inline-block px-8 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </main>
  );
}
