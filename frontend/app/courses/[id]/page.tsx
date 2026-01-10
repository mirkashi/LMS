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
  const [activeVideoStorageType, setActiveVideoStorageType] = useState<string | null>(null);
  const [activeVideoLink, setActiveVideoLink] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [videoProgress, setVideoProgress] = useState<any>({});
  const [dailyVideoLinks, setDailyVideoLinks] = useState<any[]>([]);
  const [todayVideoLink, setTodayVideoLink] = useState<any>(null);

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

  // Normalize media URLs so Google Drive/external links stay absolute and local uploads use backend origin
  const getMediaUrl = (url?: string | null, storageType?: string) => {
    if (!url) return null;

    // Prefer backend stream route for Drive files to improve playback reliability
    if (storageType === 'google-drive') {
      const match = url.match(/id=([^&]+)/) || url.match(/file\/d\/([^/]+)/);
      const fileId = match?.[1];
      if (fileId) {
        return `${process.env.NEXT_PUBLIC_API_URL}/media/drive/${fileId}/stream`;
      }
    }

    return getAssetUrl(url) || url;
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
          
          // Fetch daily video links if user is enrolled
          if (data.data.isEnrolled && token) {
            try {
              const linksResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/daily-video-links?active=true`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const linksData = await linksResponse.json();
              if (linksData.success) {
                setDailyVideoLinks(linksData.data || []);
              }
              
              // Fetch today's video link
              const todayResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/daily-video-links/today`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const todayData = await todayResponse.json();
              if (todayData.success && todayData.data) {
                setTodayVideoLink(todayData.data);
              }
            } catch (error) {
              console.error('Failed to fetch daily video links:', error);
            }
          }
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

                {/* Intro Video Section - Shown to Enrolled Users Only */}
                {course.isEnrolled && (course.introVideoLink || course.introVideoUrl) && (
                  <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-green-900 flex items-center">
                      <span className="mr-2">📺</span>
                      Course Introduction Video
                      <span className="ml-3 text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">✓ Enrolled Access</span>
                    </h3>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                      <VideoPlayer
                        courseId={courseId}
                        videoLink={course.introVideoUrl || course.introVideoLink || ''}
                        autoSaveProgress={course.isEnrolled}
                      />
                    </div>
                  </div>
                )}

                {/* Today's Video Link - Shown to Enrolled Users */}
                {course.isEnrolled && todayVideoLink && (
                  <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-400 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                        <span className="mr-2">🎯</span>
                        Today's Video Link
                        <span className="ml-3 text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                          {new Date(todayVideoLink.date).toLocaleDateString()}
                        </span>
                      </h3>
                    </div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">{todayVideoLink.title}</h4>
                    {todayVideoLink.description && (
                      <p className="text-sm text-gray-600 mb-3">{todayVideoLink.description}</p>
                    )}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                      <VideoPlayer
                        courseId={courseId}
                        videoLink={todayVideoLink.videoLink}
                        autoSaveProgress={course.isEnrolled}
                      />
                    </div>
                  </div>
                )}

                {/* All Daily Video Links - Shown to Enrolled Users */}
                {course.isEnrolled && dailyVideoLinks.length > 0 && (
                  <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📚</span>
                      All Video Links
                      <span className="ml-3 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {dailyVideoLinks.length} video{dailyVideoLinks.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {dailyVideoLinks.map((link: any) => {
                        const isToday = todayVideoLink && link._id === todayVideoLink._id;
                        return (
                          <div
                            key={link._id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isToday
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{link.title}</h4>
                                  {isToday && (
                                    <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full font-semibold">
                                      Today
                                    </span>
                                  )}
                                </div>
                                {link.description && (
                                  <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {new Date(link.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveVideoLink(link.videoLink);
                                  setActiveVideoUrl(null);
                                  setActiveVideoStorageType(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                ▶️ Watch
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Video Player - For Module Videos */}
                {(activeVideoUrl || activeVideoLink) && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-blue-900 flex items-center">
                        <span className="mr-2">▶️</span>
                        Now Playing
                      </h3>
                      <button
                        onClick={() => {
                          setActiveVideoUrl(null);
                          setActiveVideoLink(null);
                          setActiveVideoStorageType(null);
                        }}
                        className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
                      >
                        Close Video
                      </button>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                      <VideoPlayer
                        courseId={courseId}
                        videoLink={activeVideoLink || activeVideoUrl || ''}
                        autoSaveProgress={course.isEnrolled}
                      />
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
                                className={`flex items-center justify-between p-3 rounded ${
                                  lesson.isLocked 
                                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                    : 'bg-gray-50 cursor-pointer hover:bg-gray-100'
                                }`}
                                onClick={() => {
                                  if (lesson.isLocked) return; // Don't allow clicking locked lessons
                                  
                                  if (lesson.type === 'video') {
                                    if (lesson.videoLink) {
                                      setActiveVideoLink(lesson.videoLink);
                                      setActiveVideoUrl(null);
                                      setActiveVideoStorageType(null);
                                    } else if (lesson.videoUrl) {
                                      setActiveVideoUrl(lesson.videoUrl);
                                      setActiveVideoLink(null);
                                      setActiveVideoStorageType(lesson.videoStorageType || null);
                                    }
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-primary text-2xl">
                                    {lesson.isLocked ? '🔒' : lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'}
                                  </span>
                                  <div>
                                    <p className="font-medium">{lesson.title}</p>
                                    {lesson.isLocked ? (
                                      <p className="text-sm text-orange-600 mt-1">
                                        🕒 {lesson.lockedMessage || 'Available soon'}
                                      </p>
                                    ) : (
                                      <>
                                        <p className="text-sm text-gray-600">
                                          {lesson.duration} minutes
                                        </p>
                                        
                                        {/* Show video availability status */}
                                        {(lesson.videoLink || lesson.videoUrl) && (
                                          <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                            ✓ Video Ready - Click to Play
                                          </span>
                                        )}
                                      </>
                                    )}
                                    
                                    {/* Show download links for resources - only if not locked */}
                                    {!lesson.isLocked && lesson.resources && lesson.resources.length > 0 && (
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
                                    {/* For legacy pdfUrl - only if not locked */}
                                    {!lesson.isLocked && lesson.pdfUrl && (
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
                                <span className={lesson.isLocked ? "text-gray-400" : "text-green-600 font-semibold"}>
                                  {lesson.isLocked ? '🔒' : '✓'}
                                </span>
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
