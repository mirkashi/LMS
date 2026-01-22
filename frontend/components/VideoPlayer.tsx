'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getAssetUrl } from '@/lib/assets';

interface VideoPlayerProps {
  courseId: string;
  videoLink: string;
  onProgress?: (progress: {
    duration: number;
    currentTime: number;
    percentageWatched: number;
    isCompleted: boolean;
  }) => void;
  autoSaveProgress?: boolean;
}

export default function VideoPlayer({
  courseId,
  videoLink,
  onProgress,
  autoSaveProgress = true,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [percentageWatched, setPercentageWatched] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Normalize video URL for local/Drive videos
  const normalizeVideoUrl = (url: string): string => {
    if (!url) return url;

    // For local uploads, use getAssetUrl (non-HTTP(S) URLs)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return getAssetUrl(url) || url;
    }

    // If it's a Google Drive or Google-hosted URL, convert to stream URL
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      if (hostname.endsWith('drive.google.com') || hostname.endsWith('googleusercontent.com')) {
        // Try to get file ID from query (`id` param) or from `/file/d/<id>/...` path
        const searchParams = parsed.searchParams;
        let fileId = searchParams.get('id') || undefined;

        if (!fileId) {
          const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
          if (fileMatch) {
            fileId = fileMatch[1];
          }
        }

        if (fileId) {
          return `${process.env.NEXT_PUBLIC_API_URL}/media/drive/${fileId}/stream`;
        }
      }
    } catch {
      // If URL parsing fails, fall back to returning the original URL
      return url;
    }

    return url;
  };

  const normalizedVideoLink = normalizeVideoUrl(videoLink);

      const parsed = new URL(url);
      const hostname = parsed.hostname;
      const pathname = parsed.pathname || '';

  // Helper function to extract video ID and convert to embed URL
  const getEmbedUrl = (url: string) => {
    try {
      // YouTube
      const isYouTubeHost =
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname === 'm.youtube.com';
      const isYouTuBeShort = hostname === 'youtu.be';

      if (isYouTubeHost || isYouTuBeShort) {
        let videoId: string | null = null;

        if (isYouTuBeShort) {
          // Short URL format: https://youtu.be/<id>[?query]
          const pathParts = pathname.split('/').filter(Boolean);
          videoId = pathParts[0] || null;
        } else {
          // Standard YouTube URL: use `v` query param
          videoId = parsed.searchParams.get('v');
        }

        if (videoId) {
          return {
            type: 'youtube',
            url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
          };
        }

      }
      // Vimeo
      if (hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')) {
        // Common Vimeo format: https://vimeo.com/<id>[?query]
        const pathParts = pathname.split('/').filter(Boolean);
        const videoId = pathParts[0];
        if (videoId) {
          return {
            type: 'vimeo',
            url: `https://player.vimeo.com/video/${videoId}`,
          };
        }

      }
      // Check if it's a direct video file (mp4, webm, ogg) or Google Drive stream
      const lowerPath = pathname.toLowerCase();
      const isDirectFile =
        lowerPath.endsWith('.mp4') ||
        lowerPath.endsWith('.webm') ||
        lowerPath.endsWith('.ogg');
      const isDriveStream =
        pathname.includes('/media/drive/') ||
        hostname.endsWith('googleusercontent.com');

      if (isDirectFile || isDriveStream) {

        return { type: 'direct', url };
      }
      // Default
      return { type: 'other', url };
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return { type: 'other', url };
    }
  };

  const embed = getEmbedUrl(normalizedVideoLink);

  // Fetch existing progress on load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const encodedLink = encodeURIComponent(videoLink);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/video-progress/course/${courseId}/video/${encodedLink}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCurrentTime(data.data.currentTime || 0);
            setDuration(data.data.duration || 0);
            setPercentageWatched(data.data.percentageWatched || 0);
            setIsCompleted(data.data.isCompleted || false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch video progress:', error);
      }
    };

    fetchProgress();
  }, [courseId, videoLink]);

  // Save progress periodically
  useEffect(() => {
    if (!autoSaveProgress || !courseId || currentTime === 0) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoadingProgress(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/video-progress/update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              courseId,
              videoLink,
              duration,
              currentTime,
              isCompleted: percentageWatched >= 90,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setIsCompleted(data.data.isCompleted);
            if (onProgress) {
              onProgress({
                duration: data.data.duration,
                currentTime: data.data.currentTime,
                percentageWatched: data.data.percentageWatched,
                isCompleted: data.data.isCompleted,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to save video progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [courseId, videoLink, currentTime, duration, percentageWatched, autoSaveProgress, onProgress]);

  // Listen to iframe messages (for YouTube and Vimeo)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (embed.type === 'youtube' && event.data.type === 'infoDelivery') {
        const newDuration = event.data.info?.duration || duration;
        const newCurrentTime = event.data.info?.currentTime || currentTime;

        if (newDuration > 0) {
          setDuration(newDuration);
          setCurrentTime(newCurrentTime);

          const newPercentage = Math.round((newCurrentTime / newDuration) * 100);
          setPercentageWatched(newPercentage);

          if (newPercentage >= 90 && !isCompleted) {
            setIsCompleted(true);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [duration, currentTime, isCompleted, embed.type]);

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {embed.type === 'direct' ? (
          <video
            src={embed.url}
            controls
            className="w-full h-full"
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              if (video.duration > 0) {
                setDuration(video.duration);
                setCurrentTime(video.currentTime);
                const newPercentage = Math.round((video.currentTime / video.duration) * 100);
                setPercentageWatched(newPercentage);
                if (newPercentage >= 90 && !isCompleted) {
                  setIsCompleted(true);
                }
              }
            }}
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              if (video.duration > 0) {
                setDuration(video.duration);
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            ref={iframeRef}
            src={embed.url}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Course Video"
          />
        )}
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentageWatched, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} /{' '}
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              {percentageWatched}% watched
              {isCompleted && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
            </div>
          </div>
        </div>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Video Completed!</p>
            <p className="text-sm text-green-700 mt-1">
              You've watched {percentageWatched}% of this video. Great job!
            </p>
          </div>
        </div>
      )}

      {/* Progress Indicator for Partially Watched */}
      {!isCompleted && percentageWatched > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <PlayIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">In Progress</p>
            <p className="text-sm text-blue-700 mt-1">
              You've watched {percentageWatched}% of this video. Keep watching to complete it!
            </p>
          </div>
        </div>
      )}

      {/* Saving Indicator */}
      {loadingProgress && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          Saving your progress...
        </div>
      )}
    </div>
  );
}
