'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

  // Helper function to extract video ID and convert to embed URL
  const getEmbedUrl = (url: string) => {
    try {
      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be')
          ? url.split('youtu.be/')[1]?.split('?')[0]
          : new URLSearchParams(new URL(url).search).get('v');
        return {
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
        };
      }
      // Vimeo
      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return {
          type: 'vimeo',
          url: `https://player.vimeo.com/video/${videoId}`,
        };
      }
      // Default
      return { type: 'other', url };
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return { type: 'other', url };
    }
  };

  const embed = getEmbedUrl(videoLink);

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
        <iframe
          ref={iframeRef}
          src={embed.url}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Course Video"
        />
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
