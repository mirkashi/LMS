'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`
        );
        const data = await response.json();
        if (data.success) {
          setCourse(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEnrolled(true);
        alert('Successfully enrolled in course!');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Course not found</h2>
            <Link href="/courses" className="text-primary hover:underline">
              Back to courses
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Course Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <Link href="/courses" className="text-primary hover:underline mb-4">
              ← Back to Courses
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="md:col-span-2">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-96 object-cover rounded-lg mb-6"
                  />
                )}
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{course.description}</p>

                <div className="flex items-center space-x-6 mb-8">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 text-xl">
                      {'⭐'.repeat(Math.round(course.rating))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {course.rating}/5 ({course.totalRatings} reviews)
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {course.students?.length || 0} students enrolled
                  </span>
                </div>

                {/* Course Content */}
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
                  <div className="space-y-4">
                    {course.modules?.map((module: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-3">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{module.description}</p>
                        <div className="space-y-2">
                          {module.lessons?.map((lesson: any, lessonIdx: number) => (
                            <div
                              key={lessonIdx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-primary">
                                  {lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'}
                                </span>
                                <div>
                                  <p className="font-medium">{lesson.title}</p>
                                  <p className="text-sm text-gray-600">
                                    {lesson.duration} minutes
                                  </p>
                                </div>
                              </div>
                              {enrolled && (
                                <span className="text-green-600 font-semibold">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="mt-12 p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">About Instructor</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl">
                        👨‍🏫
                      </div>
                      <div>
                        <p className="font-semibold">{course.instructor.name}</p>
                        <p className="text-gray-600">{course.instructor.email}</p>
                        {course.instructor.bio && (
                          <p className="text-sm text-gray-600 mt-2">
                            {course.instructor.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                  <div className="text-4xl font-bold text-primary mb-6">
                    ${course.price}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={enrolled}
                    className={`w-full py-3 rounded-lg font-semibold text-white mb-4 transition ${
                      enrolled
                        ? 'bg-green-500 cursor-not-allowed'
                        : 'bg-gradient-primary hover:shadow-lg'
                    }`}
                  >
                    {enrolled ? '✓ Enrolled' : 'Enroll Now'}
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span>⏱️</span>
                      <div>
                        <p className="font-semibold">Duration</p>
                        <p className="text-gray-600">{course.duration} hours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>📊</span>
                      <div>
                        <p className="font-semibold">Level</p>
                        <p className="text-gray-600 capitalize">{course.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>🎓</span>
                      <div>
                        <p className="font-semibold">Category</p>
                        <p className="text-gray-600">{course.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-6">
                    <h4 className="font-semibold mb-3">What you'll learn</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Professional eBay strategies</li>
                      <li>✓ Increase your sales</li>
                      <li>✓ Best practices</li>
                      <li>✓ Advanced techniques</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
