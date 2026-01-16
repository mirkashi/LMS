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
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Modern Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 py-8">
            <Link href="/courses" className="inline-flex items-center text-white/90 hover:text-white transition mb-6 group">
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Video Player - Single Unified Player */}
              {(activeVideoUrl || activeVideoLink) && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Now Playing
                    </h3>
                    <button
                      onClick={() => {
                        setActiveVideoUrl(null);
                        setActiveVideoLink(null);
                        setActiveVideoStorageType(null);
                      }}
                      className="text-sm px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white font-medium"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-6 bg-gray-900">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <VideoPlayer
                        courseId={courseId}
                        videoLink={activeVideoLink || activeVideoUrl || ''}
                        autoSaveProgress={course.isEnrolled}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Course Header Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                {course.thumbnail && (
                  <div className="relative h-80 overflow-hidden">
                    <AppImage
                      path={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                      <div className="flex items-center space-x-4 text-white/90">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {'⭐'.repeat(Math.round(course.rating))}
                          </div>
                          <span className="text-sm">{course.rating}/5 ({course.totalRatings})</span>
                        </div>
                        <span className="text-sm">•</span>
                        <span className="text-sm">{Array.isArray(course.students) ? course.students.length : 0} students</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Today's Video Highlight */}
              {course.isEnrolled && todayVideoLink && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-2xl mr-3">
                          🎯
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Today's Video</h3>
                          <p className="text-sm text-amber-700">{new Date(todayVideoLink.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{todayVideoLink.title}</h4>
                    {todayVideoLink.description && (
                      <p className="text-gray-600 mb-4">{todayVideoLink.description}</p>
                    )}
                    <button
                      onClick={() => {
                        setActiveVideoLink(todayVideoLink.videoLink);
                        setActiveVideoUrl(null);
                        setActiveVideoStorageType(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      ▶ Play Today's Video
                    </button>
                  </div>
                </div>
              )}

              {/* All Daily Video Links */}
              {course.isEnrolled && dailyVideoLinks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      Video Library
                      <span className="ml-3 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {dailyVideoLinks.length} video{dailyVideoLinks.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {dailyVideoLinks.map((link: any) => {
                      const isToday = todayVideoLink && link._id === todayVideoLink._id;
                      return (
                        <div
                          key={link._id}
                          className={`group relative p-4 rounded-xl border-2 transition-all ${
                            isToday
                              ? 'border-amber-300 bg-amber-50'
                              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">{link.title}</h4>
                                {isToday && (
                                  <span className="flex-shrink-0 text-xs px-2 py-1 bg-amber-500 text-white rounded-full font-bold">
                                    TODAY
                                  </span>
                                )}
                              </div>
                              {link.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{link.description}</p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {new Date(link.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveVideoLink(link.videoLink);
                                setActiveVideoUrl(null);
                                setActiveVideoStorageType(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`flex-shrink-0 px-4 py-2 font-medium rounded-lg transition-all ${
                                isToday
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Course Content Modules */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
                </div>

                <div className="p-6">
                  {course.isEnrolled ? (
                    // Show full content for enrolled users
                    <div className="space-y-4">
                      {course.modules?.map((module: any, idx: number) => (
                        <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                                {idx + 1}
                              </span>
                              {module.title}
                            </h3>
                            <p className="text-gray-600 mt-2 ml-11">{module.description}</p>
                          </div>
                          <div className="p-4 space-y-2 bg-white">
                            {module.lessons?.map((lesson: any, lessonIdx: number) => (
                              <div
                                key={lessonIdx}
                                className={`group relative p-4 rounded-xl border-2 transition-all ${
                                  lesson.isLocked 
                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' 
                                    : 'border-gray-200 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                                }`}
                                onClick={() => {
                                  if (lesson.isLocked) return;
                                  
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
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                                      lesson.isLocked ? 'bg-gray-200' : 'bg-blue-100 group-hover:bg-blue-200'
                                    }`}>
                                      {lesson.isLocked ? '🔒' : lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 mb-1">{lesson.title}</p>
                                      {lesson.isLocked ? (
                                        <div className="flex items-center text-sm text-orange-600">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                          </svg>
                                          {lesson.lockedMessage || 'Available soon'}
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center">
                                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                              </svg>
                                              {lesson.duration} min
                                            </span>
                                            {(lesson.videoLink || lesson.videoUrl) && (
                                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                ✓ Ready
                                              </span>
                                            )}
                                          </div>
                                          
                                          {/* Resources */}
                                          {lesson.resources && lesson.resources.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                              {lesson.resources.map((resource: any, resIdx: number) => (
                                                <a
                                                  key={resIdx}
                                                  href={getAssetUrl(resource.url) || resource.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mr-3"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                  </svg>
                                                  {resource.name}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                          {lesson.pdfUrl && (
                                            <a
                                              href={getAssetUrl(lesson.pdfUrl) || lesson.pdfUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                              </svg>
                                              Download PDF
                                            </a>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 ml-4">
                                    {lesson.isLocked ? (
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
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
                        <div key={idx} className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="w-8 h-8 bg-gray-300 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                                    {idx + 1}
                                  </span>
                                  <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                </div>
                                <p className="text-gray-600 ml-11">{module.description}</p>
                                <p className="text-sm text-gray-500 mt-2 ml-11">
                                  {module.lessonCount || module.lessons?.length || 0} lessons
                                </p>
                              </div>
                              <div className="flex-shrink-0 text-gray-400 text-3xl ml-4">🔒</div>
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg ml-11">
                              <p className="text-sm text-blue-800 font-medium">
                                <strong>🎓 Enroll to access:</strong> Full course content, videos, and downloadable materials
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructor Section */}
              {course.instructor && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Your Instructor</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name || 'Instructor'}
                          className="w-20 h-20 rounded-full border-4 border-blue-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {(course.instructor.name || 'I').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{course.instructor.name || 'Unknown Instructor'}</h3>
                        {course.instructor.email && (
                          <p className="text-blue-600 text-sm mb-3">{course.instructor.email}</p>
                        )}
                        {course.instructor.bio && (
                          <p className="text-gray-600 leading-relaxed">{course.instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Price & Enroll Card */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Course Price</p>
                      <div className="text-5xl font-bold text-blue-600 mb-4">
                        PKR {course.price}
                      </div>
                      
                      <button
                        onClick={handleEnroll}
                        disabled={isEnrollmentDisabled()}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-105 shadow-lg ${
                          enrollmentStatus === 'approved'
                            ? 'bg-green-500 cursor-not-allowed'
                            : enrollmentStatus === 'pending'
                            ? 'bg-yellow-500 cursor-not-allowed'
                            : enrollmentStatus === 'rejected'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        }`}
                      >
                        {getEnrollmentButtonText()}
                      </button>

                      {enrollmentStatus === 'pending' && (
                        <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⏳ Your enrollment is under review. You'll be notified once approved.
                          </p>
                        </div>
                      )}

                      {enrollmentStatus === 'rejected' && (
                        <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                          <p className="text-xs text-red-800 font-medium">
                            ❌ Previous request denied. You can submit a new request.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">{course.duration} hours total</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Level</p>
                        <p className="text-sm text-gray-600 capitalize">{course.level}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Category</p>
                        <p className="text-sm text-gray-600">{course.category}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900">What You'll Learn</h4>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Professional eBay strategies</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Increase your sales exponentially</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Industry best practices</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Advanced selling techniques</span>
                      </li>
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
