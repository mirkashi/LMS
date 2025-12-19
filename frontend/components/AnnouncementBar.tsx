'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Announcement {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
}

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem('dismissedAnnouncementId', announcement._id);
      setIsVisible(false);
    }
  };

  if (!announcement || !isVisible) return null;

  const getColors = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`${getColors(announcement.type)} relative z-50`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-sm font-medium relative">
            <span>{announcement.message}</span>
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
