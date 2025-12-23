'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Announcement {
  _id: string;
  title?: string;
  message: string;
  content?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
}

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastChecked, setLastChecked] = useState<number>(() => Date.now());
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/active`);
        const data = await res.json();

        if (data.success && data.data) {
          const dismissedId = localStorage.getItem('dismissedAnnouncementId');
          if (dismissedId !== data.data._id) {
            setAnnouncement(data.data);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
      }
    };

    fetchAnnouncement();
    const intervalId = setInterval(() => {
      setLastChecked(Date.now());
      fetchAnnouncement();
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem('dismissedAnnouncementId', announcement._id);
      setIsVisible(false);
    }
  };

  // Reserve space for the navbar by setting a CSS variable to the bar height.
  // Navbar reads this var as its sticky `top` offset.
  useEffect(() => {
    const setHeightVar = () => {
      const height = isVisible && barRef.current ? barRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty('--announcement-height', `${height}px`);
    };

    setHeightVar();
    window.addEventListener('resize', setHeightVar);
    return () => {
      window.removeEventListener('resize', setHeightVar);
      // Clear on unmount
      document.documentElement.style.setProperty('--announcement-height', '0px');
    };
  }, [isVisible, announcement, lastChecked]);

  if (!announcement || !isVisible) return null;

  const getTone = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          gradient: 'from-amber-500 via-orange-500 to-yellow-500',
          accent: 'text-white'
        };
      case 'success':
        return {
          gradient: 'from-emerald-500 via-green-500 to-teal-500',
          accent: 'text-white'
        };
      case 'error':
        return {
          gradient: 'from-rose-600 via-red-600 to-orange-600',
          accent: 'text-white'
        };
      default:
        return {
          gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
          accent: 'text-white'
        };
    }
  };

  const tone = getTone(announcement.type);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={barRef}
          initial={{ height: 0, opacity: 0, y: -12 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`fixed top-0 left-0 right-0 z-[60] overflow-hidden shadow-xl backdrop-blur`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${tone.gradient} opacity-95`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ffffff24,transparent_35%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/80">
                <span className="h-2 w-2 rounded-full bg-white/90 animate-pulse" />
                Live Update
                <span className="text-white/70">·</span>
                <span className="text-white/80">Refreshed {new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex-1" />

              <button
                onClick={handleDismiss}
                className="ml-auto text-white/90 hover:text-white rounded-full p-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-white">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase rounded-full bg-white/15 backdrop-blur border border-white/10">
                  {announcement.type}
                </div>
                {announcement.title && (
                  <p className="text-base sm:text-lg font-semibold leading-tight">{announcement.title}</p>
                )}
              </div>
              <div className="text-sm text-white/90 sm:text-right max-w-3xl">
                <p className="font-medium">{announcement.message}</p>
                {announcement.content && (
                  <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {announcement.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
