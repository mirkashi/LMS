'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import VideoPlayer from '@/components/VideoPlayer';
import EnrollmentPaymentModal from '@/components/EnrollmentPaymentModal';
import { getAssetUrl } from '@/lib/assets';

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoLink, setActiveVideoLink] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [videoProgress, setVideoProgress] = useState<any>({});

  // Helper function to convert video links to embed URLs
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    // Return original URL for other platforms
    return url;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: any = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`,
          { headers }
        );
        const data = await response.json();
        if (data.success) {
          setCourse(data.data);
          setEnrollmentStatus(data.data.enrollmentStatus);
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
      router.push('/login');
      return;
    }

    // Open payment modal instead of direct enrollment
    setShowPaymentModal(true);
  };

  const handleEnrollmentSuccess = () => {
    // Refresh course data
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: any = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`,
          { headers }
        );
        const data = await response.json();
        if (data.success) {
          setCourse(data.data);
          setEnrollmentStatus(data.data.enrollmentStatus);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    };

    fetchCourse();
  };

  const getEnrollmentButtonText = () => {
    if (!enrollmentStatus) return 'Enroll Now - Pay & Request Access';
    
    switch (enrollmentStatus) {
      case 'pending':
        return '⏳ Payment Under Review';
      case 'approved':
        return '✓ Enrolled - Access Granted';
      case 'rejected':
        return 'Request Denied - Try Again';
      default:
        return 'Enroll Now - Pay & Request Access';
    }
  };

  const isEnrollmentDisabled = () => {
    return enrolling || enrollmentStatus === 'pending' || enrollmentStatus === 'approved';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Course not found</h2>
          <Link href="/courses" className="text-primary hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
                  <AppImage
                    path={course.thumbnail}
                    alt={course.title}
                    className="w-full h-96 object-cover rounded-lg mb-6"
                  />
                )}

                {/* Intro Video Section - Shown to All Users */}
                {(course.introVideoLink || course.introVideoUrl) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Course Introduction Video</h3>
                    
                    {/* Show uploaded video if available */}
                    {course.introVideoUrl && (
                      <div className="mb-4">
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_URL}${course.introVideoUrl}`}
                          controls
                          className="w-full rounded-lg bg-black"
                          poster={course.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail}` : undefined}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    
                    {/* Show video link (YouTube, Vimeo, etc.) */}
                    {course.introVideoLink && !course.introVideoUrl && (
                      <>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(course.introVideoLink)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Course Introduction Video"
                          ></iframe>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-gray-600">Video Link:</p>
                          <a 
                            href={course.introVideoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all text-sm"
                          >
                            {course.introVideoLink}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Video Player */}
                {activeVideoUrl && !activeVideoLink && (
                  <div className="mb-6">
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}${activeVideoUrl}`}
                      controls
                      className="w-full h-96 bg-black rounded-lg"
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        // Track progress every 5 seconds
                        if (Math.floor(video.currentTime) % 5 === 0) {
                          setVideoProgress((prev: any) => ({
                            ...prev,
                            currentTime: video.currentTime,
                            duration: video.duration,
                          }));
                        }
                      }}
                    />
                  </div>
                )}
                {/* External Video Link (YouTube, Vimeo, etc.) */}
                {activeVideoLink && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getEmbedUrl(activeVideoLink)}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-600">Video Link:</p>
                      <a 
                        href={activeVideoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all text-sm"
                      >
                        {activeVideoLink}
                      </a>
                    </div>
                  </div>
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
                    {Array.isArray(course.students) ? course.students.length : 0} students enrolled
                  </span>
                </div>

                {/* Course Content */}
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-6">Course Content</h2>

                  {course.isEnrolled ? (
                    // Show full content for enrolled users
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
                                className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  if (lesson.type === 'video') {
                                    if (lesson.videoLink) {
                                      setActiveVideoLink(lesson.videoLink);
                                      setActiveVideoUrl(null);
                                    } else if (lesson.videoUrl) {
                                      setActiveVideoUrl(lesson.videoUrl);
                                      setActiveVideoLink(null);
                                    }
                                  }
                                }}
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
                                    
                                    {/* Show video link if available */}
                                    {lesson.videoLink && (
                                      <a
                                        href={lesson.videoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm block mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        🔗 External Video Link
                                      </a>
                                    )}
                                    
                                    {/* Show video URL if available */}
                                    {lesson.videoUrl && (
                                      <span className="text-green-600 text-sm block mt-1">
                                        ✓ Video Available
                                      </span>
                                    )}
                                    
                                    {/* Show download links for resources */}
                                    {lesson.resources && lesson.resources.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {lesson.resources.map((resource: any, resIdx: number) => (
                                          <a
                                            key={resIdx}
                                            href={getAssetUrl(resource.url) || resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm block"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            📎 {resource.name} ({((resource.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                    {/* For legacy pdfUrl */}
                                    {lesson.pdfUrl && (
                                      <a
                                        href={getAssetUrl(lesson.pdfUrl) || lesson.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm block mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        📎 Download PDF
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <span className="text-green-600 font-semibold">✓</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Show preview for non-enrolled users
                    <div className="space-y-4">
                      {course.modules?.map((module: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {module.title}
                              </h3>
                              <p className="text-gray-600 text-sm">{module.description}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                {module.lessonCount || 0} lessons
                              </p>
                            </div>
                            <div className="text-gray-400">
                              🔒
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-700">
                              <strong>Enroll to access:</strong> Full course content, videos, and downloadable materials
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Course Materials */}
                  {course.isEnrolled && course.modules?.some((module: any) => module.title === '__course_materials__') && (
                    <div className="mt-8">
                      <h2 className="text-2xl font-semibold mb-6">Course Materials</h2>
                      <div className="border rounded-lg p-6">
                        <div className="space-y-3">
                          {course.modules
                            .filter((module: any) => module.title === '__course_materials__')
                            .flatMap((module: any) => module.lessons || [])
                            .flatMap((lesson: any) => lesson.resources || [])
                            .map((resource: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <span className="text-primary">📄</span>
                                  <div>
                                    <p className="font-medium">{resource.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {(resource.size / 1024 / 1024).toFixed(2)} MB • {resource.type}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                  Download
                                </a>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-6">Instructor</h2>
                    <div className="border rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {course.instructor.avatar && (
                          <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name || 'Instructor'}
                            className="w-16 h-16 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-lg">{course.instructor.name || 'Unknown Instructor'}</p>
                          <p className="text-gray-600">{course.instructor.email || ''}</p>
                          {course.instructor.bio && (
                            <p className="text-sm text-gray-600 mt-2">
                              {course.instructor.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!course.isEnrolled && (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrollmentDisabled()}
                    className={`w-full py-3 rounded-lg font-semibold text-white mb-4 transition ${
                      enrollmentStatus === 'approved'
                        ? 'bg-green-500 cursor-not-allowed'
                        : enrollmentStatus === 'pending'
                        ? 'bg-yellow-500 cursor-not-allowed'
                        : enrollmentStatus === 'rejected'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-primary hover:shadow-lg'
                    }`}
                  >
                    {getEnrollmentButtonText()}
                  </button>
                )}

                {enrollmentStatus === 'pending' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-700">
                      Your enrollment request is under review. You will be notified once approved.
                    </p>
                  </div>
                )}

                {enrollmentStatus === 'rejected' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      Your previous enrollment request was denied. You can submit a new request.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                  <div className="text-4xl font-bold text-primary mb-6">
                    PKR {course.price}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={isEnrollmentDisabled()}
                    className={`w-full py-3 rounded-lg font-semibold text-white mb-4 transition ${
                      enrollmentStatus === 'approved'
                        ? 'bg-green-500 cursor-not-allowed'
                        : 'bg-gradient-primary hover:shadow-lg'
                    }`}
                  >
                    {enrollmentStatus === 'approved' ? '✓ Enrolled' : 'Enroll Now'}
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

      {/* Enrollment Payment Modal */}
      <EnrollmentPaymentModal
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleEnrollmentSuccess}
      />
    </>
  );
}
