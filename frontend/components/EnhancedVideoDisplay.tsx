'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

interface VideoDisplayProps {
  videoUrl: string | null;
  videoLink: string | null;
  title: string;
  description?: string;
  thumbnail?: string;
  courseId: string;
  onProgress?: (progress: any) => void;
  autoSaveProgress?: boolean;
}

const getEmbedUrl = (url: string) => {
  if (!url) return null;

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch {
    // If URL parsing fails (e.g., relative URLs), fall back to basic checks below.
  }

  if (parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();

    // YouTube (watch URLs and youtu.be short URLs)
   if (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be'
    ) {
      let videoId: string | null = null;

      if (hostname === 'youtu.be') {
        // Short URL format: https://youtu.be/{id}
        videoId = parsedUrl.pathname.split('/')[1] || null;
      } else {
        // Standard watch URL format: https://www.youtube.com/watch?v={id}
        videoId = parsedUrl.searchParams.get('v');
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1`;
      }
    }

    // Vimeo
    if (hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')) {
      // Typical format: https://vimeo.com/{id}
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const videoId = pathParts[0];

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
  } else {
    // Fallback for non-absolute URLs where URL parsing failed
    // YouTube - handle common relative forms without relying on substring host checks.

    let videoId: string | null = null;

    // 1) Relative "watch" path, e.g. "/watch?v=ID" or "watch?v=ID"
    const watchMatch = url.match(/^\/?watch(\?|$)(.*)/i);
    if (watchMatch) {
      const queryPart = watchMatch[2] || (url.includes('?') ? url.split('?')[1] : '');
      if (queryPart) {
        const params = new URLSearchParams(queryPart.startsWith('?') ? queryPart.slice(1) : queryPart);
        videoId = params.get('v');
      }
    }

    // 2) Short youtu.be-style relative path, e.g. "/youtu.be/ID" or "youtu.be/ID"
    if (!videoId) {
      const shortMatch = url.match(/^\/?youtu\.be\/([^?&#/]+)/i);
      if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      }
    }

    // 3) Bare query string containing v=ID, e.g. "v=ID&x=y"
    if (!videoId && !url.includes('/') && (url.includes('v=') || url.startsWith('v='))) {
      const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : url);
      videoId = params.get('v');
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1`;
    }

    // Vimeo - only treat as Vimeo if the string is a simple Vimeo path,
    // not just any URL containing "vimeo.com" as a substring.
    const vimeoPathMatch = url.match(/^\/?vimeo\.com\/([^?&#/]+)/i);
    if (vimeoPathMatch && vimeoPathMatch[1]) {
      const videoIdVimeo = vimeoPathMatch[1];
      return `https://player.vimeo.com/video/${videoIdVimeo}`;
    }
  }

  // Direct video link (MP4, WebM, OGG) or any other URL
  return url;
};

const validateVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (typeof url !== 'string') return false;

  const patterns = [
    /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
    /^https:\/\/youtu\.be\/[\w-]{11}/,
    /^https:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https:\/\/.*\.(mp4|webm|ogg|mov|avi)$/i,
    /^\/uploads\/.*\.(mp4|webm|ogg|mov|avi)$/i,
  ];

  return patterns.some(pattern => pattern.test(url));
};

export default function VideoDisplay({
  videoUrl,
  videoLink,
  title,
  description,
  thumbnail,
  courseId,
  onProgress,
  autoSaveProgress = true,
}: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'html5' | 'iframe' | 'invalid' | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Determine video type and validate
  useEffect(() => {
    if (videoUrl) {
      const embedUrl = getEmbedUrl(videoUrl);
      if (embedUrl && validateVideoUrl(videoUrl)) {
        setVideoType('html5');
        setError(null);
      } else {
        setError('Invalid or unsupported video format');
        setVideoType('invalid');
      }
    } else if (videoLink) {
      const embedUrl = getEmbedUrl(videoLink);
      if (embedUrl && validateVideoUrl(videoLink)) {
        setVideoType('iframe');
        setError(null);
      } else {
        setError('Invalid or unsupported video link format');
        setVideoType('invalid');
      }
    }
  }, [videoUrl, videoLink]);

  // Handle video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);

      // Auto-save progress every 10 seconds
      if (autoSaveProgress && currentTime > 0 && currentTime % 10 < 1) {
        if (progressTimeout.current) clearTimeout(progressTimeout.current);
        progressTimeout.current = setTimeout(() => {
          saveProgress();
        }, 5000);
      }
    }
  };

  const saveProgress = async () => {
    if (!courseId || !videoRef.current) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const videoLinkOrUrl = videoUrl || videoLink;
      if (!videoLinkOrUrl) return;

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
            videoLink: videoLinkOrUrl,
            duration: videoRef.current.duration,
            currentTime: videoRef.current.currentTime,
            isCompleted: progress >= 90,
          }),
        }
      );

      if (response.ok && onProgress) {
        const data = await response.json();
        onProgress(data.data);
      }
    } catch (err) {
      console.error('Failed to save video progress:', err);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Show error state
  if (videoType === 'invalid' || (!videoUrl && !videoLink)) {
    return (
      <div className="w-full bg-gray-900 rounded-lg overflow-hidden" ref={containerRef}>
        <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-800 to-gray-900">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500" />
          <p className="text-white text-center max-w-md">
            {error || 'No video available. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  // HTML5 Video Player
  if (videoType === 'html5' && videoUrl) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${baseUrl}${videoUrl}`;

    return (
      <div className="w-full" ref={containerRef}>
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-black group">
            <video
              ref={videoRef}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full"
              poster={thumbnail ? `${baseUrl}${thumbnail}` : undefined}
              controls
            >
              <source src={fullVideoUrl} />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="bg-gray-900 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5" />
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-400 mt-1">{description}</p>
                )}
              </div>
            </div>

            {/* Progress Info */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Completion Status */}
            {progress >= 90 && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Video completed! Great job!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Iframe (YouTube, Vimeo, etc.)
  if (videoType === 'iframe' && videoLink) {
    const embedUrl = getEmbedUrl(videoLink);

    return (
      <div className="w-full" ref={containerRef}>
        <div className="bg-black rounded-lg overflow-hidden">
          {/* Iframe Container */}
          <div className="aspect-video bg-black">
            {embedUrl && (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            )}
          </div>

          {/* Video Info */}
          <div className="bg-gray-900 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5" />
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}

            {/* Video Link */}
            <div className="mt-4 p-3 bg-blue-900 rounded border border-blue-700">
              <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">Video Source</p>
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
              >
                {videoLink}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
